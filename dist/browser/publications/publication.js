import assert from "assert";
import { decryptEd25519AesGcm, encryptEd25519AesGcm } from "../signer/index.js";
import Logger from "@plebbit/plebbit-logger";
import env from "../version.js";
import { cleanUpBeforePublishing, signChallengeAnswer, signChallengeRequest, verifyChallengeMessage, verifyChallengeVerification } from "../signer/signatures.js";
import { waitForUpdateInSubInstanceWithErrorAndTimeout, hideClassPrivateProps, shortifyAddress, throwWithErrorCode, timestamp } from "../util.js";
import { TypedEmitter } from "tiny-typed-emitter";
import { Comment } from "./comment/comment.js";
import { PlebbitError } from "../plebbit-error.js";
import { getBufferedPlebbitAddressFromPublicKey } from "../signer/util.js";
import * as cborg from "cborg";
import * as remeda from "remeda";
import { parseDecryptedChallengeAnswerWithPlebbitErrorIfItFails, parseDecryptedChallengeVerification, parseDecryptedChallengeWithPlebbitErrorIfItFails, parseJsonWithPlebbitErrorIfFails } from "../schema/schema-util.js";
import { ChallengeRequestMessageSchema, ChallengeAnswerMessageSchema, ChallengeMessageSchema, ChallengeVerificationMessageSchema } from "../pubsub-messages/schema.js";
import { decodeRpcChallengeAnswerPubsubMsg, decodeRpcChallengePubsubMsg, decodeRpcChallengeRequestPubsubMsg, decodeRpcChallengeVerificationPubsubMsg } from "../clients/rpc-client/decode-rpc-response-util.js";
import { PublicationClientsManager } from "./publication-client-manager.js";
class Publication extends TypedEmitter {
    constructor(plebbit) {
        super();
        this.raw = {};
        // private
        this._subplebbit = undefined; // will be used for publishing
        this._challengeAnswer = undefined;
        this._publishedChallengeRequests = undefined;
        this._challengeIdToPubsubSigner = {};
        this._pubsubProvidersDoneWaiting = {};
        this._currentPubsubProviderIndex = undefined;
        this._receivedChallengeFromSub = false;
        this._receivedChallengeVerification = false;
        this._challenge = undefined;
        this._rpcPublishSubscriptionId = undefined;
        this._plebbit = plebbit;
        this._updatePublishingStateWithEmission("stopped");
        this._updateState("stopped");
        this._initClients();
        this._handleChallengeExchange = this._handleChallengeExchange.bind(this);
        this.publish = this.publish.bind(this);
        this.on("error", (...args) => this._plebbit.emit("error", ...args));
        this._publishToDifferentProviderThresholdSeconds = 10;
        this._setProviderFailureThresholdSeconds = 60 * 2; // Two minutes
        // public method should be bound
        this.publishChallengeAnswers = this.publishChallengeAnswers.bind(this);
        this._pubsubProviders = remeda.keys.strict(this._plebbit.clients.pubsubKuboRpcClients);
        hideClassPrivateProps(this);
    }
    _initClients() {
        this._clientsManager = new PublicationClientsManager(this);
        this.clients = this._clientsManager.clients;
    }
    setSubplebbitAddress(subplebbitAddress) {
        this.subplebbitAddress = subplebbitAddress;
        this.shortSubplebbitAddress = shortifyAddress(subplebbitAddress);
    }
    _initBaseRemoteProps(props) {
        this.setSubplebbitAddress(props.subplebbitAddress);
        this.timestamp = props.timestamp;
        this.signature = props.signature;
        this.author = { ...props.author, shortAddress: shortifyAddress(props.author.address) };
        this.protocolVersion = props.protocolVersion;
    }
    async _verifyDecryptedChallengeVerificationAndUpdateCommentProps(decryptedVerification) {
        throw Error("should be handled in comment, not publication");
    }
    getType() {
        throw new Error(`Should be implemented by children of Publication`);
    }
    // This is the publication that user publishes over pubsub
    toJSONPubsubMessagePublication() {
        throw Error("Should be overridden");
    }
    toJSONPubsubRequestToEncrypt() {
        return {
            [this.getType()]: this.toJSONPubsubMessagePublication(),
            ...this.challengeRequest
        };
    }
    async _handleRpcChallengeVerification(verification) {
        const log = Logger("plebbit-js:publication:_handleRpcChallengeVerification");
        this._receivedChallengeVerification = true;
        if (verification.comment)
            await this._verifyDecryptedChallengeVerificationAndUpdateCommentProps(verification);
        this.emit("challengeverification", verification, this instanceof Comment && verification.comment ? this : undefined);
        if (this._rpcPublishSubscriptionId) {
            try {
                await this._plebbit._plebbitRpcClient.unsubscribe(this._rpcPublishSubscriptionId);
            }
            catch (e) {
                log.error("Failed to unsubscribe from publication publish", e);
            }
            this._rpcPublishSubscriptionId = undefined;
        }
    }
    async _handleIncomingChallengePubsubMessage(msg) {
        const log = Logger("plebbit-js:publication:_handleIncomingChallengePubsubMessage");
        if (this._receivedChallengeFromSub)
            return; // We already processed a challenge
        const challengeMsgValidity = await verifyChallengeMessage(msg, this._pubsubTopicWithfallback(), true);
        if (!challengeMsgValidity.valid) {
            const error = new PlebbitError("ERR_CHALLENGE_SIGNATURE_IS_INVALID", {
                pubsubMsg: msg,
                reason: challengeMsgValidity.reason
            });
            log.error("received challenge message with invalid signature", error.toString());
            this._updatePublishingStateNoEmission("failed");
            this.emit("error", error);
            this.emit("publishingstatechange", "failed");
            return;
        }
        log(`Received encrypted challenges.  Will decrypt and emit them on "challenge" event. User shoud publish solution by calling publishChallengeAnswers`);
        let decryptedRawString;
        try {
            decryptedRawString = await decryptEd25519AesGcm(msg.encrypted, this._challengeIdToPubsubSigner[msg.challengeRequestId.toString()].privateKey, this._subplebbit.encryption.publicKey);
        }
        catch (e) {
            const plebbitError = new PlebbitError("ERR_PUBLICATION_FAILED_TO_DECRYPT_CHALLENGE", { decryptErr: e });
            log.error("could not decrypt challengemessage.encrypted", plebbitError.toString());
            this._updatePublishingStateNoEmission("failed");
            this.emit("error", plebbitError);
            this.emit("publishingstatechange", "failed");
            return;
        }
        let decryptedJson;
        try {
            decryptedJson = await parseJsonWithPlebbitErrorIfFails(decryptedRawString);
        }
        catch (e) {
            log.error("could not parse decrypted challengemessage.encrypted as a json", String(e));
            this._updatePublishingStateNoEmission("failed");
            this.emit("error", e);
            this.emit("publishingstatechange", "failed");
            return;
        }
        let decryptedChallenge;
        try {
            decryptedChallenge = parseDecryptedChallengeWithPlebbitErrorIfItFails(decryptedJson);
        }
        catch (e) {
            log.error("could not parse z challengemessage.encrypted as a json", String(e));
            this._updatePublishingStateNoEmission("failed");
            this.emit("error", e);
            this.emit("publishingstatechange", "failed");
            return;
        }
        this._challenge = {
            ...msg,
            ...decryptedChallenge
        };
        this._receivedChallengeFromSub = true;
        this._updatePublishingStateWithEmission("waiting-challenge-answers");
        const subscribedProviders = Object.entries(this._clientsManager.providerSubscriptions)
            .filter(([, pubsubTopics]) => pubsubTopics.includes(this._pubsubTopicWithfallback()))
            .map(([provider]) => provider);
        subscribedProviders.forEach((provider) => this._clientsManager.updatePubsubState("waiting-challenge-answers", provider));
        this.emit("challenge", this._challenge);
    }
    async _handleIncomingChallengeVerificationPubsubMessage(msg) {
        const log = Logger("plebbit-js:publication:_handleIncomingChallengeVerificationPubsubMessage");
        if (this._receivedChallengeVerification)
            return;
        const signatureValidation = await verifyChallengeVerification(msg, this._pubsubTopicWithfallback(), true);
        if (!signatureValidation.valid) {
            const error = new PlebbitError("ERR_CHALLENGE_VERIFICATION_SIGNATURE_IS_INVALID", {
                pubsubMsg: msg,
                reason: signatureValidation.reason
            });
            this._updatePublishingStateNoEmission("failed");
            log.error("Publication received a challenge verification with invalid signature", error);
            this.emit("error", error);
            this.emit("publishingstatechange", "failed");
            return;
        }
        this._receivedChallengeVerification = true;
        let decryptedChallengeVerification;
        if (msg.challengeSuccess) {
            this._updatePublishingStateWithEmission("succeeded");
            log(`Received a challengeverification with challengeSuccess=true`, "for publication", this.getType());
            if (msg.encrypted) {
                let decryptedRawString;
                try {
                    decryptedRawString = await decryptEd25519AesGcm(msg.encrypted, this._challengeIdToPubsubSigner[msg.challengeRequestId.toString()].privateKey, this._subplebbit.encryption.publicKey);
                }
                catch (e) {
                    const plebbitError = new PlebbitError("ERR_INVALID_CHALLENGE_VERIFICATION_DECRYPTED_SCHEMA", {
                        decryptErr: e,
                        challenegVerificationMsg: msg
                    });
                    log.error("could not decrypt challengeverification.encrypted", plebbitError);
                    this.emit("error", plebbitError);
                    return;
                }
                let decryptedJson;
                try {
                    decryptedJson = await parseJsonWithPlebbitErrorIfFails(decryptedRawString);
                }
                catch (e) {
                    log.error("could not parse decrypted challengeverification.encrypted as a json", e);
                    this.emit("error", e);
                    return;
                }
                try {
                    decryptedChallengeVerification = parseDecryptedChallengeVerification(decryptedJson);
                }
                catch (e) {
                    log.error("could not parse challengeverification.encrypted due to invalid schema", e);
                    this.emit("error", e);
                    return;
                }
                if (decryptedChallengeVerification.comment) {
                    await this._verifyDecryptedChallengeVerificationAndUpdateCommentProps(decryptedChallengeVerification);
                    log("Updated the props of this instance with challengeverification.encrypted");
                }
            }
        }
        else {
            this._updatePublishingStateWithEmission("failed");
            log.error(`Challenge exchange with publication`, this.getType(), `has failed to pass`, "Challenge errors", msg.challengeErrors, `reason`, msg.reason);
        }
        await this._postSucessOrFailurePublishing();
        this.emit("challengeverification", { ...msg, ...decryptedChallengeVerification }, this instanceof Comment && decryptedChallengeVerification ? this : undefined);
    }
    async _handleChallengeExchange(pubsubMsg) {
        const log = Logger("plebbit-js:publication:handleChallengeExchange");
        let decodedJson;
        try {
            decodedJson = cborg.decode(pubsubMsg.data);
        }
        catch (e) {
            log.error("Failed to decode pubsub message", e);
            return;
        }
        const pubsubSchemas = [
            ChallengeVerificationMessageSchema.passthrough(),
            ChallengeMessageSchema.passthrough(),
            ChallengeRequestMessageSchema.passthrough(),
            ChallengeAnswerMessageSchema.passthrough()
        ];
        let pubsubMsgParsed;
        for (const pubsubSchema of pubsubSchemas) {
            const parseRes = pubsubSchema.safeParse(decodedJson);
            if (parseRes.success) {
                pubsubMsgParsed = parseRes.data;
                break;
            }
        }
        if (!pubsubMsgParsed) {
            log.error(`Failed to parse the schema of decoded pubsub message`, decodedJson);
            return;
        }
        if (pubsubMsgParsed.type === "CHALLENGEREQUEST" || pubsubMsgParsed.type === "CHALLENGEANSWER") {
            log.trace("Received unrelated pubsub message of type", pubsubMsgParsed.type);
        }
        else if (!this._publishedChallengeRequests.some((requestMsg) => remeda.isDeepEqual(pubsubMsgParsed.challengeRequestId, requestMsg.challengeRequestId))) {
            log.trace(`Received pubsub messages with different challenge request id, ignoring them`);
            return; // Process only this publication's challenge requests
        }
        else if (pubsubMsgParsed.type === "CHALLENGE")
            return this._handleIncomingChallengePubsubMessage(pubsubMsgParsed);
        else if (pubsubMsgParsed.type === "CHALLENGEVERIFICATION")
            return this._handleIncomingChallengeVerificationPubsubMessage(pubsubMsgParsed);
    }
    async publishChallengeAnswers(challengeAnswers) {
        const log = Logger("plebbit-js:publication:publishChallengeAnswers");
        const toEncryptAnswers = parseDecryptedChallengeAnswerWithPlebbitErrorIfItFails({
            challengeAnswers: challengeAnswers
        });
        if (!this._challenge)
            throw Error("this._challenge is not defined in publishChallengeAnswers");
        if (this._plebbit._plebbitRpcClient && typeof this._rpcPublishSubscriptionId === "number") {
            return this._plebbit._plebbitRpcClient.publishChallengeAnswers(this._rpcPublishSubscriptionId, toEncryptAnswers.challengeAnswers);
        }
        assert(this._subplebbit, "Local plebbit-js needs publication.subplebbit to be defined to publish challenge answer");
        if (typeof this._currentPubsubProviderIndex !== "number")
            throw Error("currentPubsubProviderIndex should be defined prior to publishChallengeAnswers");
        const encryptedChallengeAnswers = await encryptEd25519AesGcm(JSON.stringify(toEncryptAnswers), this._challengeIdToPubsubSigner[this._challenge.challengeRequestId.toString()].privateKey, this._subplebbit.encryption.publicKey);
        const toSignAnswer = cleanUpBeforePublishing({
            type: "CHALLENGEANSWER",
            challengeRequestId: this._challenge.challengeRequestId,
            encrypted: encryptedChallengeAnswers,
            userAgent: this._plebbit.userAgent,
            protocolVersion: env.PROTOCOL_VERSION,
            timestamp: timestamp()
        });
        const answerMsgToPublish = {
            ...toSignAnswer,
            signature: await signChallengeAnswer(toSignAnswer, this._challengeIdToPubsubSigner[this._challenge.challengeRequestId.toString()])
        };
        this._updatePublishingStateWithEmission("publishing-challenge-answer");
        this._clientsManager.updatePubsubState("publishing-challenge-answer", this._pubsubProviders[this._currentPubsubProviderIndex]);
        await this._clientsManager.pubsubPublishOnProvider(this._pubsubTopicWithfallback(), answerMsgToPublish, this._pubsubProviders[this._currentPubsubProviderIndex]);
        this._challengeAnswer = {
            ...toEncryptAnswers,
            ...answerMsgToPublish
        };
        this._updatePublishingStateWithEmission("waiting-challenge-verification");
        const providers = Object.entries(this._clientsManager.providerSubscriptions)
            .filter(([, pubsubTopics]) => pubsubTopics.includes(this._pubsubTopicWithfallback()))
            .map(([provider]) => provider);
        providers.forEach((provider) => this._clientsManager.updatePubsubState("waiting-challenge-verification", provider));
        log(`Responded to challenge  with answers`, challengeAnswers);
        this.emit("challengeanswer", this._challengeAnswer);
    }
    _validatePublicationFields() {
        if (typeof this.timestamp !== "number" || this.timestamp < 0)
            throwWithErrorCode("ERR_PUBLICATION_MISSING_FIELD", { type: this.getType, timestamp: this.timestamp });
        if (typeof this.author?.address !== "string")
            throwWithErrorCode("ERR_PUBLICATION_MISSING_FIELD", { type: this.getType(), authorAddress: this.author?.address });
        if (typeof this.subplebbitAddress !== "string")
            throwWithErrorCode("ERR_PUBLICATION_MISSING_FIELD", { type: this.getType(), subplebbitAddress: this.subplebbitAddress });
    }
    _validateSubFields() {
        if (typeof this._subplebbit?.encryption?.publicKey !== "string")
            throwWithErrorCode("ERR_SUBPLEBBIT_MISSING_FIELD", { subplebbitPublicKey: this._subplebbit?.encryption?.publicKey });
        if (typeof this._pubsubTopicWithfallback() !== "string")
            throwWithErrorCode("ERR_SUBPLEBBIT_MISSING_FIELD", {
                pubsubTopic: this._subplebbit?.pubsubTopic,
                address: this._subplebbit?.address
            });
    }
    _updatePublishingStateNoEmission(newState) {
        this.publishingState = newState;
    }
    _updatePublishingStateWithEmission(newState) {
        if (this.publishingState === newState)
            return;
        this.publishingState = newState;
        this.emit("publishingstatechange", this.publishingState);
    }
    _updateRpcClientStateFromPublishingState(publishingState) {
        // We're deriving the the rpc state from publishing state
        const mapper = {
            failed: ["stopped"],
            "fetching-subplebbit-ipfs": ["fetching-subplebbit-ipfs"],
            "fetching-subplebbit-ipns": ["fetching-subplebbit-ipns"],
            "publishing-challenge-answer": ["publishing-challenge-answer"],
            "publishing-challenge-request": ["subscribing-pubsub", "publishing-challenge-request"],
            "resolving-subplebbit-address": ["resolving-subplebbit-address"],
            stopped: ["stopped"],
            succeeded: ["stopped"],
            "waiting-challenge": ["waiting-challenge"],
            "waiting-challenge-answers": ["waiting-challenge-answers"],
            "waiting-challenge-verification": ["waiting-challenge-verification"]
        };
        const newRpcClientState = mapper[publishingState] || [publishingState]; // In case RPC server transmitted a state we don't know about
        newRpcClientState.forEach(this._setRpcClientState.bind(this));
    }
    _updateState(newState) {
        if (this.state === newState)
            return;
        this.state = newState;
        this.emit("statechange", this.state);
    }
    _setRpcClientState(newState) {
        const currentRpcUrl = remeda.keys.strict(this.clients.plebbitRpcClients)[0];
        if (newState === this.clients.plebbitRpcClients[currentRpcUrl].state)
            return;
        this.clients.plebbitRpcClients[currentRpcUrl].state = newState;
        this.clients.plebbitRpcClients[currentRpcUrl].emit("statechange", newState);
    }
    _pubsubTopicWithfallback() {
        const pubsubTopic = this._subplebbit?.pubsubTopic || this._subplebbit?.address;
        if (typeof pubsubTopic !== "string")
            throw Error("Failed to load the pubsub topic of subplebbit");
        return pubsubTopic;
    }
    _getSubplebbitCache() {
        return (this._plebbit._memCaches.subplebbitForPublishing.get(this.subplebbitAddress, { allowStale: true }) ||
            this._plebbit._updatingSubplebbits[this.subplebbitAddress]?.raw.subplebbitIpfs ||
            this._plebbit._startedSubplebbits[this.subplebbitAddress]?.raw.subplebbitIpfs);
    }
    async _fetchSubplebbitForPublishing() {
        const log = Logger("plebbit-js:publish:_fetchSubplebbitForPublishing");
        const cachedSubplebbit = this._getSubplebbitCache();
        if (cachedSubplebbit) {
            // We will use the cached subplebbit even though it's stale
            // And in the background we will fetch a new subplebbit and update the cache
            // cache.has will return false if the item is stale
            if (!this._plebbit._memCaches.subplebbitForPublishing.has(this.subplebbitAddress)) {
                log("The cache of subplebbit is stale, we will use the cached subplebbit and update the cache in the background");
                this._plebbit
                    .getSubplebbit(this.subplebbitAddress)
                    .catch((e) => log.error("Failed to update cache of subplebbit", this.subplebbitAddress, e)); // will update cache in background, will not update current comment states
            }
            return cachedSubplebbit;
        }
        else {
            // we have no cache or plebbit._updatingSubplebbit[this.subplebbitAddress]
            const updatingSubInstance = await this._clientsManager._createSubInstanceWithStateTranslation();
            let subIpfs;
            if (!updatingSubInstance.subplebbit.raw.subplebbitIpfs) {
                const timeoutMs = this._plebbit._timeouts["subplebbit-ipns"];
                try {
                    await waitForUpdateInSubInstanceWithErrorAndTimeout(updatingSubInstance.subplebbit, timeoutMs);
                    subIpfs = updatingSubInstance.subplebbit.toJSONIpfs();
                }
                catch (e) {
                    await this._clientsManager.cleanUpUpdatingSubInstance();
                    throw e;
                }
                await this._clientsManager.cleanUpUpdatingSubInstance();
            }
            else {
                subIpfs = updatingSubInstance.subplebbit.toJSONIpfs();
                await this._clientsManager.cleanUpUpdatingSubInstance();
            }
            if (!subIpfs)
                throw Error("Should fail properly here");
            return subIpfs;
        }
    }
    async stop() {
        await this._postSucessOrFailurePublishing();
        this._updatePublishingStateWithEmission("stopped");
    }
    _isAllAttemptsExhausted() {
        // When all providers failed to publish
        // OR they're done with waiting
        const allProvidersFailedToPublish = this._currentPubsubProviderIndex === this._pubsubProviders.length && this._publishedChallengeRequests.length === 0;
        const allProvidersDoneWithWaiting = remeda.keys.strict(this._pubsubProvidersDoneWaiting).length === 0
            ? false
            : Object.values(this._pubsubProvidersDoneWaiting).every((b) => b);
        return allProvidersFailedToPublish || allProvidersDoneWithWaiting;
    }
    _setProviderToFailIfNoResponse(providerIndex) {
        setTimeout(async () => {
            const publishingToSameProviderTwice = this._pubsubProviders?.length === 2 && this._pubsubProviders[0] === this._pubsubProviders[1];
            const isSecondRequestByProvider = publishingToSameProviderTwice && providerIndex === 1;
            // not set to be done with waiting if we published a request twice on the same provider
            const doneWaiting = publishingToSameProviderTwice ? isSecondRequestByProvider : true;
            this._pubsubProvidersDoneWaiting[this._pubsubProviders[providerIndex]] = doneWaiting;
            if (!this._receivedChallengeFromSub && !this._receivedChallengeVerification) {
                const log = Logger("plebbit-js:publication:publish");
                log.error(`Provider (${this._pubsubProviders[providerIndex]}) did not receive a response after ${this._setProviderFailureThresholdSeconds}s, will unsubscribe and set state to stopped`);
                await this._clientsManager.pubsubUnsubscribeOnProvider(this._pubsubTopicWithfallback(), this._pubsubProviders[providerIndex], this._handleChallengeExchange);
                this._clientsManager.updatePubsubState("stopped", this._pubsubProviders[providerIndex]);
                if (this._isAllAttemptsExhausted()) {
                    await this._postSucessOrFailurePublishing();
                    this._updatePublishingStateNoEmission("failed");
                    const allAttemptsFailedError = new PlebbitError("ERR_CHALLENGE_REQUEST_RECEIVED_NO_RESPONSE_FROM_ANY_PROVIDER", {
                        attemptedPubsubProviders: this._pubsubProviders,
                        pubsubTopic: this._pubsubTopicWithfallback()
                        // TODO Should include errors
                    });
                    log.error(String(allAttemptsFailedError));
                    this.emit("error", allAttemptsFailedError); // TODO this line is causing an uncaught error
                    this.emit("publishingstatechange", "failed");
                }
            }
        }, this._setProviderFailureThresholdSeconds * 1000);
    }
    async _postSucessOrFailurePublishing() {
        const log = Logger("plebbit-js:publication:_postSucessOrFailurePublishing");
        this._updateState("stopped");
        if (this._rpcPublishSubscriptionId) {
            try {
                await this._plebbit._plebbitRpcClient.unsubscribe(this._rpcPublishSubscriptionId);
            }
            catch (e) {
                log.error("Failed to unsubscribe from publication publish", e);
            }
            this._rpcPublishSubscriptionId = undefined;
            this._setRpcClientState("stopped");
        }
        else if (this._subplebbit) {
            // the client is publishing to pubsub without using plebbit RPC
            await this._clientsManager.pubsubUnsubscribe(this._pubsubTopicWithfallback(), this._handleChallengeExchange);
            this._pubsubProviders.forEach((provider) => this._clientsManager.updatePubsubState("stopped", provider));
        }
    }
    _handleIncomingChallengeRequestFromRpc(args) {
        const encodedRequest = args.params.result;
        const request = decodeRpcChallengeRequestPubsubMsg(encodedRequest);
        if (!this._publishedChallengeRequests)
            this._publishedChallengeRequests = [request];
        else
            this._publishedChallengeRequests.push(request);
        this.emit("challengerequest", request);
    }
    _handleIncomingChallengeFromRpc(args) {
        const encodedChallenge = args.params.result;
        const challenge = decodeRpcChallengePubsubMsg(encodedChallenge);
        this._challenge = challenge;
        this._receivedChallengeFromSub = true;
        this.emit("challenge", this._challenge);
    }
    _handleIncomingChallengeAnswerFromRpc(args) {
        const encodedChallengeAnswer = args.params.result;
        const challengeAnswerMsg = decodeRpcChallengeAnswerPubsubMsg(encodedChallengeAnswer);
        this._challengeAnswer = challengeAnswerMsg;
        this.emit("challengeanswer", challengeAnswerMsg);
    }
    async _handleIncomingChallengeVerificationFromRpc(args) {
        const encoded = args.params.result;
        const decoded = decodeRpcChallengeVerificationPubsubMsg(encoded);
        await this._handleRpcChallengeVerification(decoded);
    }
    _handleIncomingPublishingStateFromRpc(args) {
        const publishState = args.params.result; // we're optimistic that RPC server transmitted a correct string
        this._updatePublishingStateWithEmission(publishState);
        this._updateRpcClientStateFromPublishingState(publishState);
    }
    _handleIncomingStateFromRpc(args) {
        const state = args.params.result; // optimistic
        this._updateState(state);
    }
    async _publishWithRpc() {
        const log = Logger("plebbit-js:publication:_publishWithRpc");
        if (!this._plebbit._plebbitRpcClient)
            throw Error("Can't publish to RPC without publication.plebbit.plebbitRpcClient being defined");
        this._updateState("publishing");
        const pubNameToPublishFunction = {
            comment: this._plebbit._plebbitRpcClient.publishComment,
            vote: this._plebbit._plebbitRpcClient.publishVote,
            commentEdit: this._plebbit._plebbitRpcClient.publishCommentEdit,
            commentModeration: this._plebbit._plebbitRpcClient.publishCommentModeration,
            subplebbitEdit: this._plebbit._plebbitRpcClient.publishSubplebbitEdit
        };
        try {
            // PlebbitRpcClient will take care of zod parsing for us
            this._rpcPublishSubscriptionId = await pubNameToPublishFunction[this.getType()].bind(this._plebbit._plebbitRpcClient)(this.toJSONPubsubRequestToEncrypt());
            if (typeof this._rpcPublishSubscriptionId !== "number")
                throw Error("Failed to find the type of publication");
        }
        catch (e) {
            log.error("Failed to publish to RPC due to error", String(e));
            this._updateState("stopped");
            this._updatePublishingStateWithEmission("failed");
            throw e;
        }
        this._plebbit._plebbitRpcClient
            .getSubscription(this._rpcPublishSubscriptionId)
            .on("challengerequest", this._handleIncomingChallengeRequestFromRpc.bind(this))
            .on("challenge", this._handleIncomingChallengeFromRpc.bind(this))
            .on("challengeanswer", this._handleIncomingChallengeAnswerFromRpc.bind(this))
            .on("challengeverification", this._handleIncomingChallengeVerificationFromRpc.bind(this))
            .on("publishingstatechange", this._handleIncomingPublishingStateFromRpc.bind(this))
            .on("statechange", this._handleIncomingStateFromRpc.bind(this))
            .on("error", (args) => this.emit("error", args.params.result));
        this._plebbit._plebbitRpcClient.emitAllPendingMessages(this._rpcPublishSubscriptionId);
        return;
    }
    async _signAndValidateChallengeRequestBeforePublishing(toSignMsg, pubsubSigner) {
        // No validation for now, we might add in the future
        return {
            ...toSignMsg,
            signature: await signChallengeRequest(toSignMsg, pubsubSigner)
        };
    }
    async publish() {
        const log = Logger("plebbit-js:publication:publish");
        this._validatePublicationFields();
        if (this._plebbit._plebbitRpcClient)
            return this._publishWithRpc();
        if (typeof this._currentPubsubProviderIndex !== "number")
            this._currentPubsubProviderIndex = 0;
        this._publishedChallengeRequests = this._publishedChallengeRequests || [];
        this._pubsubProvidersDoneWaiting = this._pubsubProvidersDoneWaiting || {};
        if (this._pubsubProviders.length === 1)
            this._pubsubProviders.push(this._pubsubProviders[0]); // Same provider should be retried twice if publishing fails
        assert(this._currentPubsubProviderIndex < this._pubsubProviders.length, "There is miscalculation of current pubsub provider index");
        this._updateState("publishing");
        const options = { acceptedChallengeTypes: [] };
        try {
            this._subplebbit = await this._fetchSubplebbitForPublishing();
            this._validateSubFields();
        }
        catch (e) {
            this._updateState("stopped");
            this._updatePublishingStateWithEmission("failed");
            throw e;
        }
        const pubsubMessageSigner = await this._plebbit.createSigner();
        const pubsubMsgToEncrypt = this.toJSONPubsubRequestToEncrypt();
        const encrypted = await encryptEd25519AesGcm(JSON.stringify(pubsubMsgToEncrypt), pubsubMessageSigner.privateKey, this._subplebbit.encryption.publicKey);
        const challengeRequestId = await getBufferedPlebbitAddressFromPublicKey(pubsubMessageSigner.publicKey);
        this._challengeIdToPubsubSigner[challengeRequestId.toString()] = pubsubMessageSigner;
        const toSignMsg = cleanUpBeforePublishing({
            type: "CHALLENGEREQUEST",
            encrypted,
            challengeRequestId,
            acceptedChallengeTypes: options.acceptedChallengeTypes,
            userAgent: this._plebbit.userAgent,
            protocolVersion: env.PROTOCOL_VERSION,
            timestamp: timestamp()
        });
        const challengeRequest = await this._signAndValidateChallengeRequestBeforePublishing(toSignMsg, pubsubMessageSigner);
        log("Attempting to publish", this.getType(), "to pubsub topic", this._pubsubTopicWithfallback(), "with provider", this._pubsubProviders[this._currentPubsubProviderIndex], "request.encrypted=", this.toJSONPubsubRequestToEncrypt());
        while (this._currentPubsubProviderIndex < this._pubsubProviders.length) {
            this._updatePublishingStateWithEmission("publishing-challenge-request");
            this._clientsManager.updatePubsubState("subscribing-pubsub", this._pubsubProviders[this._currentPubsubProviderIndex]);
            try {
                await this._clientsManager.pubsubSubscribeOnProvider(this._pubsubTopicWithfallback(), this._handleChallengeExchange, this._pubsubProviders[this._currentPubsubProviderIndex]);
                this._clientsManager.updatePubsubState("publishing-challenge-request", this._pubsubProviders[this._currentPubsubProviderIndex]);
                await this._clientsManager.pubsubPublishOnProvider(this._pubsubTopicWithfallback(), challengeRequest, this._pubsubProviders[this._currentPubsubProviderIndex]);
            }
            catch (e) {
                this._clientsManager.updatePubsubState("stopped", this._pubsubProviders[this._currentPubsubProviderIndex]);
                log.error("Failed to publish challenge request using provider ", this._pubsubProviders[this._currentPubsubProviderIndex]);
                this._currentPubsubProviderIndex += 1;
                if (this._isAllAttemptsExhausted()) {
                    await this._postSucessOrFailurePublishing();
                    const allAttemptsFailedError = new PlebbitError("ERR_ALL_PUBSUB_PROVIDERS_THROW_ERRORS", {
                        pubsubProviders: this._pubsubProviders,
                        pubsubTopic: this._pubsubTopicWithfallback(),
                        lastError: e
                        // TODO should include all errors
                    });
                    log.error("All attempts to publish", this.getType(), "has failed", allAttemptsFailedError);
                    this._updatePublishingStateNoEmission("failed");
                    this.emit("error", allAttemptsFailedError);
                    this.emit("publishingstatechange", "failed");
                    throw allAttemptsFailedError;
                }
                else if (this._currentPubsubProviderIndex === this._pubsubProviders.length)
                    return;
                else
                    continue;
            }
            this._pubsubProvidersDoneWaiting[this._pubsubProviders[this._currentPubsubProviderIndex]] = false;
            const decryptedRequest = {
                ...challengeRequest,
                ...pubsubMsgToEncrypt
            };
            this._publishedChallengeRequests.push(decryptedRequest);
            this._clientsManager.updatePubsubState("waiting-challenge", this._pubsubProviders[this._currentPubsubProviderIndex]);
            this._setProviderToFailIfNoResponse(this._currentPubsubProviderIndex);
            this._updatePublishingStateWithEmission("waiting-challenge");
            log(`Published a challenge request of publication`, this.getType(), "with provider", this._pubsubProviders[this._currentPubsubProviderIndex]);
            this.emit("challengerequest", decryptedRequest);
            break;
        }
        // to handle cases where request is published but we didn't receive response within certain timeframe (20s for now)
        // Maybe the sub didn't receive the request, or the provider did not relay the challenge from sub for some reason
        setTimeout(async () => {
            if (typeof this._currentPubsubProviderIndex !== "number")
                throw Error("_currentPubsubProviderIndex should be defined");
            if (!this._receivedChallengeFromSub && !this._receivedChallengeVerification) {
                if (this._isAllAttemptsExhausted()) {
                    // plebbit-js tried all providers and still no response is received
                    log.error(`Failed to receive any response for publication`, this.getType());
                    await this._postSucessOrFailurePublishing();
                    const error = new PlebbitError("ERR_PUBSUB_DID_NOT_RECEIVE_RESPONSE_AFTER_PUBLISHING_CHALLENGE_REQUEST", {
                        pubsubProviders: this._pubsubProviders,
                        publishedChallengeRequests: this._publishedChallengeRequests,
                        publishToDifferentProviderThresholdSeconds: this._publishToDifferentProviderThresholdSeconds
                        // TODO should include errors
                    });
                    this._updatePublishingStateNoEmission("failed");
                    this.emit("error", error); // I think this line could cause an uncaught error
                    this.emit("publishingstatechange", "failed");
                }
                else {
                    log(`Re-publishing publication after ${this._publishToDifferentProviderThresholdSeconds}s of not receiving challenge from provider (${this._pubsubProviders[this._currentPubsubProviderIndex]})`);
                    this._plebbit._stats.recordGatewayFailure(this._pubsubProviders[this._currentPubsubProviderIndex], "pubsub-publish");
                    this._plebbit._stats.recordGatewayFailure(this._pubsubProviders[this._currentPubsubProviderIndex], "pubsub-subscribe");
                    this._currentPubsubProviderIndex += 1;
                    if (this._currentPubsubProviderIndex < this._pubsubProviders.length)
                        this.publish();
                }
            }
        }, this._publishToDifferentProviderThresholdSeconds * 1000);
    }
}
export default Publication;
//# sourceMappingURL=publication.js.map