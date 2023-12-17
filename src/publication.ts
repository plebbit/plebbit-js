import { ChallengeAnswerMessage, ChallengeRequestMessage } from "./challenge";
import Author from "./author";
import assert from "assert";
import { Signer, decryptEd25519AesGcm, encryptEd25519AesGcm } from "./signer";
import {
    ChallengeAnswerMessageType,
    ChallengeMessageType,
    ChallengeRequestMessageType,
    ChallengeVerificationMessageType,
    CommentIpfsWithCid,
    DecryptedChallenge,
    DecryptedChallengeAnswer,
    DecryptedChallengeAnswerMessageType,
    DecryptedChallengeMessageType,
    DecryptedChallengeRequest,
    DecryptedChallengeRequestMessageType,
    DecryptedChallengeVerification,
    DecryptedChallengeVerificationMessageType,
    ProtocolVersion,
    PublicationEvents,
    PublicationType,
    PublicationTypeName
} from "./types";
import Logger from "@plebbit/plebbit-logger";
import env from "./version";
import { Plebbit } from "./plebbit";
import { signChallengeAnswer, signChallengeRequest, verifyChallengeMessage, verifyChallengeVerification } from "./signer/signatures";
import { decodePubsubMsgFromRpc, shortifyAddress, throwWithErrorCode, timestamp } from "./util";
import { TypedEmitter } from "tiny-typed-emitter";
import { Comment } from "./comment";
import { PlebbitError } from "./plebbit-error";
import { getBufferedPlebbitAddressFromPublicKey } from "./signer/util";
import { CommentClientsManager, PublicationClientsManager } from "./clients/client-manager";
import { MessageHandlerFn } from "ipfs-http-client/types/src/pubsub/subscription-tracker";
import * as cborg from "cborg";
import { JsonSignature } from "./signer/constants";
import lodash from "lodash";
import { subplebbitForPublishingCache } from "./constants";
import { SubplebbitIpfsType } from "./subplebbit/types";

class Publication extends TypedEmitter<PublicationEvents> implements PublicationType {
    // Only publication props
    clients: PublicationClientsManager["clients"];

    subplebbitAddress: string;
    shortSubplebbitAddress: string;
    timestamp: number;
    signature: JsonSignature;
    signer: Signer;
    author: Author;
    protocolVersion: ProtocolVersion;

    state: "stopped" | "updating" | "publishing";
    publishingState:
        | "stopped"
        | "resolving-subplebbit-address"
        | "fetching-subplebbit-ipns"
        | "fetching-subplebbit-ipfs"
        | "publishing-challenge-request"
        | "waiting-challenge"
        | "waiting-challenge-answers"
        | "publishing-challenge-answer"
        | "waiting-challenge-verification"
        | "failed"
        | "succeeded";
    challengeAnswers?: string[];
    challengeCommentCids?: string[];

    // private
    protected subplebbit?: Pick<SubplebbitIpfsType, "encryption" | "pubsubTopic" | "address">;
    private _challengeAnswer: ChallengeAnswerMessage;
    private _publishedChallengeRequests: ChallengeRequestMessage[];
    private _challengeIdToPubsubSigner: Record<string, Signer>;
    private _pubsubProviders: string[];
    private _pubsubProvidersDoneWaiting: Record<string, boolean>;
    private _currentPubsubProviderIndex: number;
    private _receivedChallengeFromSub: boolean;
    private _receivedChallengeVerification: boolean;
    private _challenge?: DecryptedChallengeMessageType;
    private _publishToDifferentProviderThresholdSeconds: number;
    private _setProviderFailureThresholdSeconds: number;
    private _rpcPublishSubscriptionId?: number;
    _clientsManager: PublicationClientsManager | CommentClientsManager;
    _plebbit: Plebbit;

    constructor(props: PublicationType, plebbit: Plebbit) {
        super();
        this._plebbit = plebbit;
        this._receivedChallengeFromSub = this._receivedChallengeVerification = false;
        this._challengeIdToPubsubSigner = {};
        this._updatePublishingState("stopped");
        this._updateState("stopped");
        this._initClients();
        this._initProps(props);
        this.handleChallengeExchange = this.handleChallengeExchange.bind(this);
        this.publish = this.publish.bind(this);
        this.on("error", (...args) => this._plebbit.emit("error", ...args));
        this._publishToDifferentProviderThresholdSeconds = 10;
        this._setProviderFailureThresholdSeconds = 60 * 2; // Two minutes

        // public method should be bound
        this.publishChallengeAnswers = this.publishChallengeAnswers.bind(this);
    }

    protected _initClients() {
        this._clientsManager = new PublicationClientsManager(this);
        this.clients = this._clientsManager.clients;
    }

    _initProps(props: PublicationType) {
        this.subplebbitAddress = props.subplebbitAddress;
        if (this.subplebbitAddress) this.shortSubplebbitAddress = shortifyAddress(this.subplebbitAddress);
        this.timestamp = props.timestamp;
        this.signer = this.signer || props["signer"];
        this.signature = props.signature;
        if (props.author) this.author = new Author(props.author);
        this.protocolVersion = props.protocolVersion;
        this.challengeAnswers = props.challengeAnswers;
        this.challengeCommentCids = props.challengeCommentCids;
    }

    protected getType(): PublicationTypeName {
        throw new Error(`Should be implemented by children of Publication`);
    }

    // This is the publication that user publishes over pubsub
    toJSONPubsubMessagePublication(): PublicationType {
        return {
            subplebbitAddress: this.subplebbitAddress,
            timestamp: this.timestamp,
            signature: this.signature,
            author: this.author.toJSONIpfs(),
            protocolVersion: this.protocolVersion
        };
    }

    toJSONPubsubMessage(): DecryptedChallengeRequest {
        // These will be the props to encrypt in ChallengeRequest
        return {
            publication: this.toJSONPubsubMessagePublication(),
            challengeAnswers: this.challengeAnswers,
            challengeCommentCids: this.challengeCommentCids
        };
    }

    private async _handleRpcChallenge(challenge: DecryptedChallengeMessageType) {
        this._challenge = challenge;
        this._receivedChallengeFromSub = true;

        this.emit("challenge", this._challenge);
    }

    private async _handleRpcChallengeVerification(verification: DecryptedChallengeVerificationMessageType) {
        this._receivedChallengeVerification = true;
        if (verification.publication) this._initProps(verification.publication);
        this.emit("challengeverification", verification, this instanceof Comment && verification.publication ? this : undefined);
        await this._plebbit.plebbitRpcClient.unsubscribe(this._rpcPublishSubscriptionId);
        this._rpcPublishSubscriptionId = undefined;
    }

    private async _handleRpcChallengeAnswer(answer: DecryptedChallengeAnswerMessageType) {
        this._challengeAnswer = new ChallengeAnswerMessage(answer);
        this.emit("challengeanswer", answer);
    }

    private async handleChallengeExchange(pubsubMsg: Parameters<MessageHandlerFn>[0]) {
        const log = Logger("plebbit-js:publication:handleChallengeExchange");
        const msgParsed: ChallengeMessageType | ChallengeVerificationMessageType = cborg.decode(pubsubMsg.data);
        if (
            !this._publishedChallengeRequests.some((requestMsg) =>
                lodash.isEqual(msgParsed?.challengeRequestId, requestMsg.challengeRequestId)
            )
        )
            return; // Process only this publication's challenge requests

        if (msgParsed?.type === "CHALLENGE") {
            if (this._receivedChallengeFromSub) return; // We already processed a challenge
            const challengeMsgValidity = await verifyChallengeMessage(msgParsed, this._pubsubTopicWithfallback(), true);
            if (!challengeMsgValidity.valid) {
                const error = new PlebbitError("ERR_CHALLENGE_SIGNATURE_IS_INVALID", {
                    pubsubMsg: msgParsed,
                    reason: challengeMsgValidity.reason
                });
                log.error(error.toString());
                this.emit("error", error);
                return;
            }
            this._receivedChallengeFromSub = true;

            log(
                `Received encrypted challenges.  Will decrypt and emit them on "challenge" event. User shoud publish solution by calling publishChallengeAnswers`
            );
            const decryptedChallenge: DecryptedChallenge = JSON.parse(
                await decryptEd25519AesGcm(
                    msgParsed.encrypted,
                    this._challengeIdToPubsubSigner[msgParsed.challengeRequestId.toString()].privateKey,
                    this.subplebbit.encryption.publicKey
                )
            );
            this._challenge = {
                ...msgParsed,
                ...decryptedChallenge
            };
            this._updatePublishingState("waiting-challenge-answers");
            const subscribedProviders = Object.entries(this._clientsManager.providerSubscriptions)
                .filter(([, pubsubTopics]) => pubsubTopics.includes(this._pubsubTopicWithfallback()))
                .map(([provider]) => provider);

            subscribedProviders.forEach((provider) => this._clientsManager.updatePubsubState("waiting-challenge-answers", provider));
            this.emit("challenge", this._challenge);
        } else if (msgParsed?.type === "CHALLENGEVERIFICATION") {
            if (this._receivedChallengeVerification) return;
            const signatureValidation = await verifyChallengeVerification(msgParsed, this._pubsubTopicWithfallback(), true);
            if (!signatureValidation.valid) {
                const error = new PlebbitError("ERR_CHALLENGE_VERIFICATION_SIGNATURE_IS_INVALID", {
                    pubsubMsg: msgParsed,
                    reason: signatureValidation.reason
                });
                this._updatePublishingState("failed");
                log.error(error.toString());
                this.emit("error", error);
                return;
            }
            this._receivedChallengeVerification = true;
            let decryptedPublication: CommentIpfsWithCid | undefined;
            if (msgParsed.challengeSuccess) {
                this._updatePublishingState("succeeded");
                log(`Challenge (${msgParsed.challengeRequestId}) has passed`);
                if (msgParsed.encrypted) {
                    const decryptedProps: DecryptedChallengeVerification = JSON.parse(
                        await decryptEd25519AesGcm(
                            msgParsed.encrypted,
                            this._challengeIdToPubsubSigner[msgParsed.challengeRequestId.toString()].privateKey,
                            this.subplebbit.encryption.publicKey
                        )
                    );
                    decryptedPublication = decryptedProps.publication;
                    if (decryptedPublication) {
                        this._initProps(decryptedPublication);
                        log("Updated the props of this instance with challengeVerification.publication");
                    }
                }
            } else {
                this._updatePublishingState("failed");
                log(
                    `Challenge ${msgParsed.challengeRequestId} has failed to pass. Challenge errors = ${msgParsed.challengeErrors}, reason = '${msgParsed.reason}'`
                );
            }

            await this._postSucessOrFailurePublishing();
            this.emit(
                "challengeverification",
                { ...msgParsed, publication: decryptedPublication },
                this instanceof Comment && decryptedPublication ? this : undefined
            );
        }
    }

    async publishChallengeAnswers(challengeAnswers: string[]) {
        const log = Logger("plebbit-js:publication:publishChallengeAnswers");

        if (!Array.isArray(challengeAnswers)) challengeAnswers = [challengeAnswers];

        if (this._plebbit.plebbitRpcClient) {
            await this._plebbit.plebbitRpcClient.publishChallengeAnswers(this._rpcPublishSubscriptionId, challengeAnswers);
            return;
        }

        assert(this.subplebbit, "Local plebbit-js needs publication.subplebbit to be defined to publish challenge answer");

        const toEncryptAnswers: DecryptedChallengeAnswer = { challengeAnswers };

        const encryptedChallengeAnswers = await encryptEd25519AesGcm(
            JSON.stringify(toEncryptAnswers),
            this._challengeIdToPubsubSigner[this._challenge.challengeRequestId.toString()].privateKey,
            this.subplebbit.encryption.publicKey
        );

        const toSignAnswer: Omit<ChallengeAnswerMessageType, "signature"> = {
            type: "CHALLENGEANSWER",
            challengeRequestId: this._challenge.challengeRequestId,
            encrypted: encryptedChallengeAnswers,
            userAgent: env.USER_AGENT,
            protocolVersion: env.PROTOCOL_VERSION,
            timestamp: timestamp()
        };
        this._challengeAnswer = new ChallengeAnswerMessage({
            ...toSignAnswer,
            signature: await signChallengeAnswer(
                toSignAnswer,
                this._challengeIdToPubsubSigner[this._challenge.challengeRequestId.toString()]
            )
        });

        this._updatePublishingState("publishing-challenge-answer");
        this._clientsManager.updatePubsubState("publishing-challenge-answer", this._pubsubProviders[this._currentPubsubProviderIndex]);
        await this._clientsManager.pubsubPublishOnProvider(
            this._pubsubTopicWithfallback(),
            this._challengeAnswer,
            this._pubsubProviders[this._currentPubsubProviderIndex]
        );

        this._updatePublishingState("waiting-challenge-verification");
        const providers = Object.entries(this._clientsManager.providerSubscriptions)
            .filter(([, pubsubTopics]) => pubsubTopics.includes(this._pubsubTopicWithfallback()))
            .map(([provider]) => provider);
        providers.forEach((provider) => this._clientsManager.updatePubsubState("waiting-challenge-verification", provider));

        log(`Responded to challenge (${this._challengeAnswer.challengeRequestId}) with answers`, challengeAnswers);
        this.emit("challengeanswer", {
            ...this._challengeAnswer,
            challengeAnswers
        });
    }

    private _validatePublicationFields() {
        if (typeof this.timestamp !== "number" || this.timestamp < 0)
            throwWithErrorCode("ERR_PUBLICATION_MISSING_FIELD", { type: this.getType, timestamp: this.timestamp });

        if (typeof this.author?.address !== "string")
            throwWithErrorCode("ERR_PUBLICATION_MISSING_FIELD", { type: this.getType(), authorAddress: this.author?.address });
        if (typeof this.subplebbitAddress !== "string")
            throwWithErrorCode("ERR_PUBLICATION_MISSING_FIELD", { type: this.getType(), subplebbitAddress: this.subplebbitAddress });
    }

    private _validateSubFields() {
        if (typeof this.subplebbit?.encryption?.publicKey !== "string")
            throwWithErrorCode("ERR_SUBPLEBBIT_MISSING_FIELD", { subplebbitPublicKey: this.subplebbit?.encryption?.publicKey });
        if (typeof this._pubsubTopicWithfallback() !== "string")
            throwWithErrorCode("ERR_SUBPLEBBIT_MISSING_FIELD", {
                pubsubTopic: this.subplebbit?.pubsubTopic,
                address: this.subplebbit?.address
            });
    }

    _updatePublishingState(newState: Publication["publishingState"]) {
        if (this.publishingState === newState) return;
        this.publishingState = newState;
        this.emit("publishingstatechange", this.publishingState);
    }

    private _updateRpcClientStateFromPublishingState(publishingState: Publication["publishingState"]) {
        // We're deriving the the rpc state from publishing state

        const mapper: Record<Publication["publishingState"], Publication["clients"]["plebbitRpcClients"][0]["state"][]> = {
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

        mapper[publishingState].forEach(this._setRpcClientState.bind(this));
    }

    protected _updateState(newState: Publication["state"]) {
        if (this.state === newState) return;
        this.state = newState;
        this.emit("statechange", this.state);
    }
    protected _setRpcClientState(newState: Publication["clients"]["plebbitRpcClients"][""]["state"]) {
        const currentRpcUrl = Object.keys(this.clients.plebbitRpcClients)[0];
        if (newState === this.clients.plebbitRpcClients[currentRpcUrl].state) return;
        this.clients.plebbitRpcClients[currentRpcUrl].state = newState;
        this.clients.plebbitRpcClients[currentRpcUrl].emit("statechange", newState);
    }

    private _pubsubTopicWithfallback() {
        return this.subplebbit.pubsubTopic || this.subplebbit.address;
    }

    _getSubplebbitCache() {
        const cachedSubplebbit: Pick<SubplebbitIpfsType, "address" | "encryption" | "pubsubTopic"> | undefined =
            subplebbitForPublishingCache.get(this.subplebbitAddress);
        return cachedSubplebbit;
    }

    async stop() {
        await this._postSucessOrFailurePublishing();
        this._updatePublishingState("stopped");
    }

    _isAllAttemptsExhausted(): boolean {
        // When all providers failed to publish
        // OR they're done with waiting

        const allProvidersFailedToPublish =
            this._currentPubsubProviderIndex === this._pubsubProviders.length && this._publishedChallengeRequests.length === 0;

        const allProvidersDoneWithWaiting =
            Object.keys(this._pubsubProvidersDoneWaiting).length === 0
                ? false
                : Object.values(this._pubsubProvidersDoneWaiting).every((b) => b);
        return allProvidersFailedToPublish || allProvidersDoneWithWaiting;
    }

    _setProviderToFailIfNoResponse(providerIndex: number) {
        setTimeout(async () => {
            this._pubsubProvidersDoneWaiting[this._pubsubProviders[providerIndex]] = true;
            if (!this._receivedChallengeFromSub && !this._receivedChallengeVerification) {
                const log = Logger("plebbit-js:publication:publish");
                log.error(
                    `Provider (${this._pubsubProviders[providerIndex]}) did not receive a response after ${this._setProviderFailureThresholdSeconds}s, will unsubscribe and set state to stopped`
                );
                await this._clientsManager.pubsubUnsubscribeOnProvider(
                    this._pubsubTopicWithfallback(),
                    this._pubsubProviders[providerIndex],
                    this.handleChallengeExchange
                );
                this._clientsManager.updatePubsubState("stopped", this._pubsubProviders[providerIndex]);

                if (this._isAllAttemptsExhausted()) {
                    await this._postSucessOrFailurePublishing();
                    this._updatePublishingState("failed");
                    const allAttemptsFailedError = new PlebbitError("ERR_CHALLENGE_REQUEST_RECEIVED_NO_RESPONSE_FROM_ANY_PROVIDER", {
                        pubsubProviders: this._pubsubProviders,
                        pubsubTopic: this._pubsubTopicWithfallback()
                    });
                    log.error(String(allAttemptsFailedError));

                    this.emit("error", allAttemptsFailedError);
                }
            }
        }, this._setProviderFailureThresholdSeconds * 1000);
    }

    private async _postSucessOrFailurePublishing() {
        this._updateState("stopped");
        if (this._rpcPublishSubscriptionId) {
            await this._plebbit.plebbitRpcClient.unsubscribe(this._rpcPublishSubscriptionId);
            this._rpcPublishSubscriptionId = undefined;
            this._setRpcClientState("stopped");
        }

        if (Array.isArray(this._pubsubProviders)) {
            await this._clientsManager.pubsubUnsubscribe(this._pubsubTopicWithfallback(), this.handleChallengeExchange);
            this._pubsubProviders.forEach((provider) => this._clientsManager.updatePubsubState("stopped", provider));
        }
    }

    async publish() {
        const log = Logger("plebbit-js:publication:publish");
        this._validatePublicationFields();

        if (this._plebbit.plebbitRpcClient) {
            this._updateState("publishing");
            try {
                this._rpcPublishSubscriptionId =
                    this.getType() === "comment"
                        ? await this._plebbit.plebbitRpcClient.publishComment(this.toJSONPubsubMessage())
                        : this.getType() === "commentedit"
                        ? await this._plebbit.plebbitRpcClient.publishCommentEdit(this.toJSONPubsubMessage())
                        : this.getType() === "vote"
                        ? await this._plebbit.plebbitRpcClient.publishVote(this.toJSONPubsubMessage())
                        : undefined;
            } catch (e) {
                log.error("Failed to publish to RPC due to error", String(e));
                this._updateState("stopped");
                this._updatePublishingState("failed");
                throw e;
            }
            assert(typeof this._rpcPublishSubscriptionId === "number", "Failed to start publishing with RPC");

            this._plebbit.plebbitRpcClient
                .getSubscription(this._rpcPublishSubscriptionId)
                .on("challengerequest", (args) => {
                    const request = new ChallengeRequestMessage(
                        <DecryptedChallengeRequestMessageType>decodePubsubMsgFromRpc(args.params.result)
                    );
                    if (!this._publishedChallengeRequests) this._publishedChallengeRequests = [request];
                    else this._publishedChallengeRequests.push(request);
                    this.emit("challengerequest", {
                        ...request,
                        ...this.toJSONPubsubMessage()
                    });
                })
                .on("challenge", (args) =>
                    this._handleRpcChallenge(<DecryptedChallengeMessageType>decodePubsubMsgFromRpc(args.params.result))
                )
                .on("challengeanswer", (args) =>
                    this._handleRpcChallengeAnswer(<DecryptedChallengeAnswerMessageType>decodePubsubMsgFromRpc(args.params.result))
                )
                .on("challengeverification", (args) =>
                    this._handleRpcChallengeVerification(
                        <DecryptedChallengeVerificationMessageType>decodePubsubMsgFromRpc(args.params.result)
                    )
                )
                .on("publishingstatechange", (args) => {
                    this._updatePublishingState(args.params.result);
                    this._updateRpcClientStateFromPublishingState(args.params.result);
                })
                .on("statechange", (args) => this._updateState(args.params.result))
                .on("error", (args) => this.emit("error", args.params.result));
            this._plebbit.plebbitRpcClient.emitAllPendingMessages(this._rpcPublishSubscriptionId);
            return;
        }

        if (!this._publishedChallengeRequests) {
            this._publishedChallengeRequests = [];
            this._pubsubProviders = Object.keys(this._plebbit.clients.pubsubClients);
            this._pubsubProvidersDoneWaiting = {};
            this._currentPubsubProviderIndex = 0;
            if (this._pubsubProviders.length === 1) this._pubsubProviders.push(this._pubsubProviders[0]); // Same provider should be retried twice if publishing fails
        }

        assert(this._currentPubsubProviderIndex < this._pubsubProviders.length, "There is miscalculation of current pubsub provider index");
        this._updateState("publishing");

        const options = { acceptedChallengeTypes: [] };
        try {
            this.subplebbit = this._getSubplebbitCache() || (await this._clientsManager.fetchSubplebbit(this.subplebbitAddress));
            this._validateSubFields();
        } catch (e) {
            this._updateState("stopped");
            this._updatePublishingState("failed");
            if (this._clientsManager._defaultIpfsProviderUrl) this._clientsManager.updateIpfsState("stopped");
            throw e;
        }

        const pubsubMessageSigner = await this._plebbit.createSigner();

        const encrypted = await encryptEd25519AesGcm(
            JSON.stringify(this.toJSONPubsubMessage()),
            pubsubMessageSigner.privateKey,
            this.subplebbit.encryption.publicKey
        );

        const challengeRequestId = await getBufferedPlebbitAddressFromPublicKey(pubsubMessageSigner.publicKey);

        this._challengeIdToPubsubSigner[challengeRequestId.toString()] = pubsubMessageSigner;
        const toSignMsg: Omit<ChallengeRequestMessageType, "signature"> = {
            type: "CHALLENGEREQUEST",
            encrypted,
            challengeRequestId,
            acceptedChallengeTypes: options.acceptedChallengeTypes,
            userAgent: env.USER_AGENT,
            protocolVersion: env.PROTOCOL_VERSION,
            timestamp: timestamp()
        };

        const challengeRequest = new ChallengeRequestMessage({
            ...toSignMsg,
            signature: await signChallengeRequest(toSignMsg, pubsubMessageSigner)
        });
        log(
            `Attempting to publish ${this.getType()} with challenge id (${
                challengeRequest.challengeRequestId
            }) to pubsub topic (${this._pubsubTopicWithfallback()}) with provider (${
                this._pubsubProviders[this._currentPubsubProviderIndex]
            }): `,
            this.toJSONPubsubMessagePublication()
        );

        while (this._currentPubsubProviderIndex < this._pubsubProviders.length) {
            this._updatePublishingState("publishing-challenge-request");
            this._clientsManager.updatePubsubState("subscribing-pubsub", this._pubsubProviders[this._currentPubsubProviderIndex]);
            try {
                await this._clientsManager.pubsubSubscribeOnProvider(
                    this._pubsubTopicWithfallback(),
                    this.handleChallengeExchange,
                    this._pubsubProviders[this._currentPubsubProviderIndex]
                );
                this._clientsManager.updatePubsubState(
                    "publishing-challenge-request",
                    this._pubsubProviders[this._currentPubsubProviderIndex]
                );
                await this._clientsManager.pubsubPublishOnProvider(
                    this._pubsubTopicWithfallback(),
                    challengeRequest,
                    this._pubsubProviders[this._currentPubsubProviderIndex]
                );
            } catch (e) {
                this._clientsManager.updatePubsubState("stopped", this._pubsubProviders[this._currentPubsubProviderIndex]);
                log.error("Failed to publish challenge request using provider ", this._pubsubProviders[this._currentPubsubProviderIndex]);
                this._currentPubsubProviderIndex += 1;
                if (this._isAllAttemptsExhausted()) {
                    await this._postSucessOrFailurePublishing();
                    this._updatePublishingState("failed");
                    const allAttemptsFailedError = new PlebbitError("ERR_ALL_PUBSUB_PROVIDERS_THROW_ERRORS", {
                        pubsubProviders: this._pubsubProviders,
                        pubsubTopic: this._pubsubTopicWithfallback()
                    });
                    log.error(String(allAttemptsFailedError));
                    this.emit("error", allAttemptsFailedError);
                    throw allAttemptsFailedError;
                } else if (this._currentPubsubProviderIndex === this._pubsubProviders.length) return;
                else continue;
            }
            this._pubsubProvidersDoneWaiting[this._pubsubProviders[this._currentPubsubProviderIndex]] = false;
            this._publishedChallengeRequests.push(challengeRequest);
            this._clientsManager.updatePubsubState("waiting-challenge", this._pubsubProviders[this._currentPubsubProviderIndex]);
            this._setProviderToFailIfNoResponse(this._currentPubsubProviderIndex);

            this._updatePublishingState("waiting-challenge");

            log(
                `Sent a challenge request (${challengeRequest.challengeRequestId}) with provider (${
                    this._pubsubProviders[this._currentPubsubProviderIndex]
                })`
            );
            this.emit("challengerequest", {
                ...challengeRequest,
                ...this.toJSONPubsubMessage()
            });
            break;
        }
        // to handle cases where request is published but we didn't receive response within certain timeframe (20s for now)
        // Maybe the sub didn't receive the request, or the provider did not relay the challenge from sub for some reason
        setTimeout(async () => {
            if (!this._receivedChallengeFromSub && !this._receivedChallengeVerification) {
                if (this._isAllAttemptsExhausted()) {
                    // plebbit-js tried all providers and still no response is received
                    log.error(`Failed to receive any response for publication`);
                    await this._postSucessOrFailurePublishing();
                    this._updatePublishingState("failed");
                    const error = new PlebbitError("ERR_PUBSUB_DID_NOT_RECEIVE_RESPONSE_AFTER_PUBLISHING_CHALLENGE_REQUEST", {
                        pubsubProviders: this._pubsubProviders,
                        publishedChallengeRequests: this._publishedChallengeRequests,
                        publishToDifferentProviderThresholdSeconds: this._publishToDifferentProviderThresholdSeconds
                    });
                    this.emit("error", error);
                } else {
                    log(
                        `Re-publishing publication after ${
                            this._publishToDifferentProviderThresholdSeconds
                        }s of not receiving challenge from provider (${this._pubsubProviders[this._currentPubsubProviderIndex]})`
                    );
                    this._plebbit.stats.recordGatewayFailure(this._pubsubProviders[this._currentPubsubProviderIndex], "pubsub-publish");
                    this._plebbit.stats.recordGatewayFailure(this._pubsubProviders[this._currentPubsubProviderIndex], "pubsub-subscribe");

                    this._currentPubsubProviderIndex += 1;

                    if (this._currentPubsubProviderIndex < this._pubsubProviders.length) this.publish();
                }
            }
        }, this._publishToDifferentProviderThresholdSeconds * 1000);
    }
}

export default Publication;
