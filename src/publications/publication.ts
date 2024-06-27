import { ChallengeAnswerMessage, ChallengeRequestMessage } from "../challenge.js";
import Author from "./author.js";
import assert from "assert";
import { Signer, decryptEd25519AesGcm, encryptEd25519AesGcm } from "../signer/index.js";
import type {
    ChallengeAnswerMessageType,
    ChallengeMessageType,
    ChallengeRequestMessageType,
    ChallengeVerificationMessageType,
    DecryptedChallenge,
    DecryptedChallengeAnswer,
    DecryptedChallengeAnswerMessageType,
    DecryptedChallengeMessageType,
    DecryptedChallengeRequest,
    DecryptedChallengeRequestMessageType,
    DecryptedChallengeVerification,
    DecryptedChallengeVerificationMessageType,
    EncodedDecryptedChallengeVerificationMessageType,
    IpfsHttpClientPubsubMessage,
    LocalPublicationProps,
    ProtocolVersion,
    PublicationEvents,
    PublicationPubsubMessage,
    PublicationTypeName
} from "../types.js";
import Logger from "@plebbit/plebbit-logger";
import env from "../version.js";
import { Plebbit } from "../plebbit.js";
import {
    cleanUpBeforePublishing,
    signChallengeAnswer,
    signChallengeRequest,
    verifyChallengeMessage,
    verifyChallengeVerification
} from "../signer/signatures.js";
import { decodePubsubMsgFromRpc, shortifyAddress, throwWithErrorCode, timestamp } from "../util.js";
import { TypedEmitter } from "tiny-typed-emitter";
import { Comment } from "./comment/comment.js";
import { PlebbitError } from "../plebbit-error.js";
import { getBufferedPlebbitAddressFromPublicKey } from "../signer/util.js";
import { PublicationClientsManager } from "../clients/client-manager.js";
import * as cborg from "cborg";
import type { JsonSignature } from "../signer/types.js";
import * as remeda from "remeda";
import { subplebbitForPublishingCache } from "../constants.js";
import type { SubplebbitIpfsType } from "../subplebbit/types.js";
import type { CommentEditPubsubMessage, DecryptedChallengeRequestCommentEdit } from "./comment-edit/types.js";
import type { DecryptedChallengeRequestVote, VotePubsubMessage } from "./vote/types.js";
import type { CommentChallengeRequestToEncryptType, CommentIpfsType, CommentPubsubMessage } from "./comment/types.js";
import {
    parseDecryptedChallengeVerification,
    parseDecryptedChallengeWithPlebbitErrorIfItFails,
    parseJsonWithPlebbitErrorIfFails
} from "../schema/schema-util.js";
import { IncomingPubsubMessageSchema } from "../pubsub-messages/schema.js";
import { z } from "zod";

class Publication extends TypedEmitter<PublicationEvents> {
    // Only publication props
    clients!: PublicationClientsManager["clients"];

    subplebbitAddress!: string;
    shortSubplebbitAddress!: string;
    timestamp!: number;
    signature!: JsonSignature;
    signer?: LocalPublicationProps["signer"];
    author!: Author;
    protocolVersion!: ProtocolVersion;

    state!: "stopped" | "updating" | "publishing";
    publishingState!:
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
    private subplebbit?: Pick<SubplebbitIpfsType, "encryption" | "pubsubTopic" | "address">; // will be used for publishing
    private _challengeAnswer?: ChallengeAnswerMessage;
    private _publishedChallengeRequests?: ChallengeRequestMessage[];
    private _challengeIdToPubsubSigner: Record<string, Signer>;
    private _pubsubProviders: string[];
    private _pubsubProvidersDoneWaiting?: Record<string, boolean>;
    private _currentPubsubProviderIndex?: number;
    private _receivedChallengeFromSub: boolean;
    private _receivedChallengeVerification: boolean;
    private _challenge?: DecryptedChallengeMessageType;
    private _publishToDifferentProviderThresholdSeconds: number;
    private _setProviderFailureThresholdSeconds: number;
    private _rpcPublishSubscriptionId?: number;
    _clientsManager!: PublicationClientsManager;
    _plebbit: Plebbit;

    constructor(plebbit: Plebbit) {
        super();
        this._plebbit = plebbit;
        this._receivedChallengeFromSub = this._receivedChallengeVerification = false;
        this._challengeIdToPubsubSigner = {};
        this._updatePublishingState("stopped");
        this._updateState("stopped");
        this._initClients();
        this.handleChallengeExchange = this.handleChallengeExchange.bind(this);
        this.publish = this.publish.bind(this);
        this.on("error", (...args) => this._plebbit.emit("error", ...args));
        this._publishToDifferentProviderThresholdSeconds = 10;
        this._setProviderFailureThresholdSeconds = 60 * 2; // Two minutes

        // public method should be bound
        this.publishChallengeAnswers = this.publishChallengeAnswers.bind(this);
        this._pubsubProviders = remeda.keys.strict(this._plebbit.clients.pubsubClients);
    }

    protected _initClients() {
        this._clientsManager = new PublicationClientsManager(this);
        this.clients = this._clientsManager.clients;
    }

    setSubplebbitAddress(subplebbitAddress: string) {
        this.subplebbitAddress = subplebbitAddress;
        this.shortSubplebbitAddress = shortifyAddress(subplebbitAddress);
    }

    _initChallengeRequestChallengeProps(props: Pick<LocalPublicationProps, "challengeAnswers" | "challengeCommentCids">) {
        this.challengeAnswers = props.challengeAnswers;
        this.challengeCommentCids = props.challengeCommentCids;
    }

    _initBaseLocalProps(props: LocalPublicationProps) {
        this.setSubplebbitAddress(props.subplebbitAddress);
        this.timestamp = props.timestamp;
        this.signer = props.signer;
        this.signature = props.signature;
        this.author = new Author(props.author);
        this.protocolVersion = props.protocolVersion;
        this._initChallengeRequestChallengeProps(props);
    }

    _initBaseRemoteProps(props: CommentIpfsType | CommentPubsubMessage | VotePubsubMessage | CommentEditPubsubMessage) {
        this.setSubplebbitAddress(props.subplebbitAddress);
        this.timestamp = props.timestamp;
        this.signature = props.signature;
        this.author = new Author(props.author);
        this.protocolVersion = props.protocolVersion;
    }

    protected _updateLocalCommentPropsWithVerification(publication: DecryptedChallengeVerificationMessageType["publication"]) {
        throw Error("should be handled in comment, not publication");
    }

    protected getType(): PublicationTypeName {
        throw new Error(`Should be implemented by children of Publication`);
    }

    // This is the publication that user publishes over pubsub
    toJSONPubsubMessagePublication(): PublicationPubsubMessage {
        throw Error("Should be overridden");
    }

    toJSON() {
        throw Error("should be overridden");
    }

    toJSONPubsubMessage(): DecryptedChallengeRequest {
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
        if (verification.publication) this._updateLocalCommentPropsWithVerification(verification.publication);
        this.emit("challengeverification", verification, this instanceof Comment && verification.publication ? this : undefined);
        if (this._rpcPublishSubscriptionId) await this._plebbit.plebbitRpcClient!.unsubscribe(this._rpcPublishSubscriptionId);
        this._rpcPublishSubscriptionId = undefined;
    }

    private async _handleRpcChallengeAnswer(answer: DecryptedChallengeAnswerMessageType) {
        this._challengeAnswer = new ChallengeAnswerMessage(answer);
        this.emit("challengeanswer", answer);
    }

    private async _handleIncomingChallengePubsubMessage(msg: ChallengeMessageType) {
        const log = Logger("plebbit-js:publication:_handleIncomingChallengePubsubMessage");
        if (this._receivedChallengeFromSub) return; // We already processed a challenge
        const challengeMsgValidity = await verifyChallengeMessage(msg, this._pubsubTopicWithfallback(), true);
        if (!challengeMsgValidity.valid) {
            const error = new PlebbitError("ERR_CHALLENGE_SIGNATURE_IS_INVALID", {
                pubsubMsg: msg,
                reason: challengeMsgValidity.reason
            });
            log.error("received challenge message with invalid signature", error.toString());
            this.emit("error", error);
            return;
        }
        this._receivedChallengeFromSub = true;

        log(
            `Received encrypted challenges.  Will decrypt and emit them on "challenge" event. User shoud publish solution by calling publishChallengeAnswers`
        );

        let decryptedRawString: string;

        try {
            decryptedRawString = await decryptEd25519AesGcm(
                msg.encrypted,
                this._challengeIdToPubsubSigner[msg.challengeRequestId.toString()].privateKey,
                this.subplebbit!.encryption.publicKey
            );
        } catch (e) {
            const plebbitError = new PlebbitError("ERR_PUBLICATION_FAILED_TO_DECRYPT_CHALLENGE", { decryptErr: e });
            log.error("could not decrypt challengemessage.encrypted", plebbitError.toString());
            this.emit("error", plebbitError);
            return;
        }

        let decryptedJson: any;

        try {
            decryptedJson = await parseJsonWithPlebbitErrorIfFails(decryptedRawString);
        } catch (e) {
            log.error("could not parse decrypted challengemessage.encrypted as a json", String(e));
            this.emit("error", <PlebbitError>e);
            return;
        }

        let decryptedChallenge: DecryptedChallenge;

        try {
            decryptedChallenge = parseDecryptedChallengeWithPlebbitErrorIfItFails(decryptedJson);
        } catch (e) {
            log.error("could not parse z challengemessage.encrypted as a json", String(e));
            this.emit("error", <PlebbitError>e);
            return;
        }
        this._challenge = {
            ...msg,
            ...decryptedChallenge
        };
        this._updatePublishingState("waiting-challenge-answers");
        const subscribedProviders = Object.entries(this._clientsManager.providerSubscriptions)
            .filter(([, pubsubTopics]) => pubsubTopics.includes(this._pubsubTopicWithfallback()))
            .map(([provider]) => provider);

        subscribedProviders.forEach((provider) => this._clientsManager.updatePubsubState("waiting-challenge-answers", provider));
        this.emit("challenge", this._challenge);
    }

    private async _handleIncomingChallengeVerificationPubsubMessage(msg: ChallengeVerificationMessageType) {
        const log = Logger("plebbit-js:publication:_handleIncomingChallengeVerificationPubsubMessage");
        if (this._receivedChallengeVerification) return;
        const signatureValidation = await verifyChallengeVerification(msg, this._pubsubTopicWithfallback(), true);
        if (!signatureValidation.valid) {
            const error = new PlebbitError("ERR_CHALLENGE_VERIFICATION_SIGNATURE_IS_INVALID", {
                pubsubMsg: msg,
                reason: signatureValidation.reason
            });
            this._updatePublishingState("failed");
            log.error("Publication received a challenge verification with invalid signature", error.toString());
            this.emit("error", error);
            return;
        }
        this._receivedChallengeVerification = true;
        let decryptedPublication: DecryptedChallengeVerificationMessageType["publication"];
        if (msg.challengeSuccess) {
            this._updatePublishingState("succeeded");
            log(`Challenge (${msg.challengeRequestId}) has passed`);
            if (msg.encrypted) {
                let decryptedRawString: string;

                try {
                    decryptedRawString = await decryptEd25519AesGcm(
                        msg.encrypted,
                        this._challengeIdToPubsubSigner[msg.challengeRequestId.toString()].privateKey,
                        this.subplebbit!.encryption.publicKey
                    );
                } catch (e) {
                    const plebbitError = new PlebbitError("ERR_INVALID_CHALLENGE_VERIFICATION_DECRYPTED_SCHEMA", { decryptErr: e });
                    log.error("could not decrypt challengeverification.encrypted", plebbitError.toString());
                    this.emit("error", plebbitError);
                    return;
                }

                let decryptedJson: any;

                try {
                    decryptedJson = await parseJsonWithPlebbitErrorIfFails(decryptedRawString);
                } catch (e) {
                    log.error("could not parse decrypted challengeverification.encrypted as a json", String(e));
                    this.emit("error", <PlebbitError>e);
                    return;
                }

                let decryptedChallengeVerification: DecryptedChallengeVerification;

                try {
                    decryptedChallengeVerification = parseDecryptedChallengeVerification(decryptedJson);
                } catch (e) {
                    log.error("could not parse z challengeverification.encrypted as a json", String(e));
                    this.emit("error", <PlebbitError>e);
                    return;
                }

                decryptedPublication = decryptedChallengeVerification.publication;
                if (decryptedPublication) {
                    this._updateLocalCommentPropsWithVerification(decryptedPublication);
                    log("Updated the props of this instance with challengeVerification.publication");
                }
            }
        } else {
            this._updatePublishingState("failed");
            log(
                `Challenge ${msg.challengeRequestId} has failed to pass. Challenge errors = ${msg.challengeErrors}, reason = '${msg.reason}'`
            );
        }

        await this._postSucessOrFailurePublishing();
        this.emit(
            "challengeverification",
            { ...msg, publication: decryptedPublication },
            this instanceof Comment && decryptedPublication ? this : undefined
        );
    }

    private async handleChallengeExchange(pubsubMsg: IpfsHttpClientPubsubMessage) {
        const log = Logger("plebbit-js:publication:handleChallengeExchange");

        let decodedJson: string;
        try {
            decodedJson = cborg.decode(pubsubMsg.data);
        } catch (e) {
            log.error("Failed to decode pubsub message", e);
            return;
        }

        let pubsubMsgParsed: z.infer<typeof IncomingPubsubMessageSchema>;
        try {
            pubsubMsgParsed = IncomingPubsubMessageSchema.parse(decodedJson);
        } catch (e) {
            log.error("Failed to parse the schema of decoded pubsub message", e);
            return;
        }

        if (pubsubMsgParsed.type === "CHALLENGEREQUEST" || pubsubMsgParsed.type === "CHALLENGEANSWER") {
            log.trace("Received unrelated pubsub message of type", pubsubMsgParsed.type);
        } else if (
            !this._publishedChallengeRequests!.some((requestMsg) =>
                remeda.isDeepEqual(pubsubMsgParsed?.challengeRequestId, requestMsg.challengeRequestId)
            )
        ) {
            log.trace(`Received pubsub messages with different challenge request id, ignoring them`);
            return; // Process only this publication's challenge requests
        } else if (pubsubMsgParsed.type === "CHALLENGE") return this._handleIncomingChallengePubsubMessage(pubsubMsgParsed);
        else if (pubsubMsgParsed.type === "CHALLENGEVERIFICATION")
            return this._handleIncomingChallengeVerificationPubsubMessage(pubsubMsgParsed);
    }

    async publishChallengeAnswers(challengeAnswers: string[]) {
        const log = Logger("plebbit-js:publication:publishChallengeAnswers");
        // Zod here

        if (!Array.isArray(challengeAnswers)) challengeAnswers = [challengeAnswers];

        if (this._plebbit.plebbitRpcClient && typeof this._rpcPublishSubscriptionId === "number") {
            await this._plebbit.plebbitRpcClient.publishChallengeAnswers(this._rpcPublishSubscriptionId, challengeAnswers);
            return;
        }

        assert(this.subplebbit, "Local plebbit-js needs publication.subplebbit to be defined to publish challenge answer");
        if (typeof this._currentPubsubProviderIndex !== "number")
            throw Error("currentPubsubProviderIndex should be defined prior to publishChallengeAnswers");
        if (!this._challenge) throw Error("this._challenge is not defined in publishChallengeAnswers");

        const toEncryptAnswers: DecryptedChallengeAnswer = { challengeAnswers };

        const encryptedChallengeAnswers = await encryptEd25519AesGcm(
            JSON.stringify(toEncryptAnswers),
            this._challengeIdToPubsubSigner[this._challenge.challengeRequestId.toString()].privateKey,
            this.subplebbit.encryption.publicKey
        );

        const toSignAnswer: Omit<ChallengeAnswerMessageType, "signature"> = cleanUpBeforePublishing({
            type: "CHALLENGEANSWER",
            challengeRequestId: this._challenge.challengeRequestId,
            encrypted: encryptedChallengeAnswers,
            userAgent: env.USER_AGENT,
            protocolVersion: env.PROTOCOL_VERSION,
            timestamp: timestamp()
        });
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
        const currentRpcUrl = remeda.keys.strict(this.clients.plebbitRpcClients)[0];
        if (newState === this.clients.plebbitRpcClients[currentRpcUrl].state) return;
        this.clients.plebbitRpcClients[currentRpcUrl].state = newState;
        this.clients.plebbitRpcClients[currentRpcUrl].emit("statechange", newState);
    }

    private _pubsubTopicWithfallback(): string {
        const pubsubTopic = this.subplebbit?.pubsubTopic || this.subplebbit?.address;
        if (typeof pubsubTopic !== "string") throw Error("Failed to load the pubsub topic of subplebbit");
        return pubsubTopic;
    }

    _getSubplebbitCache() {
        return subplebbitForPublishingCache.get(this.subplebbitAddress, { allowStale: true });
    }

    async _fetchSubplebbitForPublishing() {
        const log = Logger("plebbit-js:publish:_fetchSubplebbitForPublishing");
        const cachedSubplebbit = this._getSubplebbitCache();

        if (cachedSubplebbit) {
            // We will use the cached subplebbit even though it's stale
            // And in the background we will fetch a new subplebbit and update the cache
            // cache.has will return false if the item is stale
            if (!subplebbitForPublishingCache.has(this.subplebbitAddress)) {
                log("The cache of subplebbit is stale, we will use the cached subplebbit and update the cache in the background");
                this._clientsManager.fetchSubplebbit(this.subplebbitAddress);
            }
            return cachedSubplebbit;
        } else return this._clientsManager.fetchSubplebbit(this.subplebbitAddress);
    }

    async stop() {
        await this._postSucessOrFailurePublishing();
        this._updatePublishingState("stopped");
    }

    _isAllAttemptsExhausted(): boolean {
        // When all providers failed to publish
        // OR they're done with waiting

        const allProvidersFailedToPublish =
            this._currentPubsubProviderIndex === this._pubsubProviders.length && this._publishedChallengeRequests!.length === 0;

        const allProvidersDoneWithWaiting =
            remeda.keys.strict(this._pubsubProvidersDoneWaiting!).length === 0
                ? false
                : Object.values(this._pubsubProvidersDoneWaiting!).every((b) => b);
        return allProvidersFailedToPublish || allProvidersDoneWithWaiting;
    }

    _setProviderToFailIfNoResponse(providerIndex: number) {
        setTimeout(async () => {
            this._pubsubProvidersDoneWaiting![this._pubsubProviders[providerIndex]] = true;
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

                    this.emit("error", allAttemptsFailedError); // TODO this line is causing an uncaught error
                }
            }
        }, this._setProviderFailureThresholdSeconds * 1000);
    }

    private async _postSucessOrFailurePublishing() {
        this._updateState("stopped");
        if (this._rpcPublishSubscriptionId) {
            await this._plebbit.plebbitRpcClient!.unsubscribe(this._rpcPublishSubscriptionId);
            this._rpcPublishSubscriptionId = undefined;
            this._setRpcClientState("stopped");
        } else if (this.subplebbit) {
            await this._clientsManager.pubsubUnsubscribe(this._pubsubTopicWithfallback(), this.handleChallengeExchange);
            this._pubsubProviders.forEach((provider) => this._clientsManager.updatePubsubState("stopped", provider));
        }
    }

    async _publishWithRpc() {
        const log = Logger("plebbit-js:publication:_publishWithRpc");

        if (!this._plebbit.plebbitRpcClient) throw Error("Can't publish to RPC without publication.plebbit.plebbitRpcClient being defined");
        this._updateState("publishing");
        try {
            this._rpcPublishSubscriptionId =
                this.getType() === "comment"
                    ? await this._plebbit.plebbitRpcClient.publishComment(<CommentChallengeRequestToEncryptType>this.toJSONPubsubMessage())
                    : this.getType() === "commentedit"
                      ? await this._plebbit.plebbitRpcClient.publishCommentEdit(
                            <DecryptedChallengeRequestCommentEdit>this.toJSONPubsubMessage()
                        )
                      : this.getType() === "vote"
                        ? await this._plebbit.plebbitRpcClient.publishVote(<DecryptedChallengeRequestVote>this.toJSONPubsubMessage())
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
                // zod here
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
            .on(
                "challenge",
                // zod here
                (args) => this._handleRpcChallenge(<DecryptedChallengeMessageType>decodePubsubMsgFromRpc(args.params.result))
            )
            .on("challengeanswer", (args) =>
                // zod here
                this._handleRpcChallengeAnswer(<DecryptedChallengeAnswerMessageType>decodePubsubMsgFromRpc(args.params.result))
            )
            .on("challengeverification", (args) => {
                // zod here
                const encoded = <EncodedDecryptedChallengeVerificationMessageType>args.params.result;
                const decoded = <DecryptedChallengeVerificationMessageType>decodePubsubMsgFromRpc(encoded);
                this._handleRpcChallengeVerification(decoded);
            })
            .on("publishingstatechange", (args) => {
                // zod here
                this._updatePublishingState(args.params.result);
                this._updateRpcClientStateFromPublishingState(args.params.result);
            })
            .on("statechange", (args) =>
                // zod here
                this._updateState(args.params.result)
            )
            .on("error", (args) => this.emit("error", args.params.result));
        this._plebbit.plebbitRpcClient.emitAllPendingMessages(this._rpcPublishSubscriptionId);
        return;
    }

    async publish() {
        const log = Logger("plebbit-js:publication:publish");
        this._validatePublicationFields();

        if (this._plebbit.plebbitRpcClient) return this._publishWithRpc();

        if (typeof this._currentPubsubProviderIndex !== "number") this._currentPubsubProviderIndex = 0;
        this._publishedChallengeRequests = this._publishedChallengeRequests || [];
        this._pubsubProvidersDoneWaiting = this._pubsubProvidersDoneWaiting || {};
        if (this._pubsubProviders.length === 1) this._pubsubProviders.push(this._pubsubProviders[0]); // Same provider should be retried twice if publishing fails

        assert(this._currentPubsubProviderIndex < this._pubsubProviders.length, "There is miscalculation of current pubsub provider index");
        this._updateState("publishing");

        const options = { acceptedChallengeTypes: [] };
        try {
            this.subplebbit = await this._fetchSubplebbitForPublishing();
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
        const toSignMsg: Omit<ChallengeRequestMessageType, "signature"> = cleanUpBeforePublishing({
            type: "CHALLENGEREQUEST",
            encrypted,
            challengeRequestId,
            acceptedChallengeTypes: options.acceptedChallengeTypes,
            userAgent: env.USER_AGENT,
            protocolVersion: env.PROTOCOL_VERSION,
            timestamp: timestamp()
        });

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
            if (typeof this._currentPubsubProviderIndex !== "number") throw Error("_currentPubsubProviderIndex should be defined");
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
