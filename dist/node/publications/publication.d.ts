import { Signer } from "../signer/index.js";
import type { DecryptedChallengeAnswerMessageType, DecryptedChallengeMessageType, DecryptedChallengeRequest, DecryptedChallengeRequestMessageType, DecryptedChallengeVerification, DecryptedChallengeVerificationMessageType, PublicationFromDecryptedChallengeRequest } from "../pubsub-messages/types.js";
import type { AuthorPubsubJsonType, CreatePublicationOptions, PublicationTypeName } from "../types.js";
import { Plebbit } from "../plebbit/plebbit.js";
import { TypedEmitter } from "tiny-typed-emitter";
import { Comment } from "./comment/comment.js";
import type { SubplebbitIpfsType } from "../subplebbit/types.js";
import type { CommentIpfsType } from "./comment/types.js";
import type { PublicationEvents, PublicationPublishingState, PublicationState } from "./types.js";
import type { SignerType } from "../signer/types.js";
import { PublicationClientsManager } from "./publication-client-manager.js";
declare class Publication extends TypedEmitter<PublicationEvents> {
    clients: PublicationClientsManager["clients"];
    subplebbitAddress: PublicationFromDecryptedChallengeRequest["subplebbitAddress"];
    shortSubplebbitAddress: string;
    timestamp: PublicationFromDecryptedChallengeRequest["timestamp"];
    signature: PublicationFromDecryptedChallengeRequest["signature"] | CommentIpfsType["signature"];
    signer?: SignerType;
    author: AuthorPubsubJsonType;
    protocolVersion: DecryptedChallengeRequestMessageType["protocolVersion"];
    challengeRequest?: CreatePublicationOptions["challengeRequest"];
    state: PublicationState | Comment["state"];
    publishingState: PublicationPublishingState;
    raw: {
        pubsubMessageToPublish?: PublicationFromDecryptedChallengeRequest;
    };
    _subplebbit?: Pick<SubplebbitIpfsType, "encryption" | "pubsubTopic" | "address">;
    _challengeExchanges: Record<string, // challengeRequestId stringified
    {
        challengeAnswer?: DecryptedChallengeAnswerMessageType;
        challengeRequest: DecryptedChallengeRequestMessageType;
        challenge?: DecryptedChallengeMessageType;
        challengeVerification?: DecryptedChallengeVerificationMessageType;
        challengeRequestPublishTimestamp?: number;
        challengeAnswerPublishTimestamp?: number;
        signer?: Signer;
        challengeRequestPublishError?: Error;
        challengeAnswerPublishError?: Error;
        providerUrl: string;
    }>;
    private _publishToDifferentProviderThresholdSeconds;
    private _setProviderFailureThresholdSeconds;
    private _rpcPublishSubscriptionId?;
    _clientsManager: PublicationClientsManager;
    _plebbit: Plebbit;
    constructor(plebbit: Plebbit);
    protected _initClients(): void;
    setSubplebbitAddress(subplebbitAddress: string): void;
    _initBaseRemoteProps(props: CommentIpfsType | PublicationFromDecryptedChallengeRequest): void;
    protected _verifyDecryptedChallengeVerificationAndUpdateCommentProps(decryptedVerification: DecryptedChallengeVerification): Promise<void>;
    protected getType(): PublicationTypeName;
    toJSONPubsubMessagePublication(): PublicationFromDecryptedChallengeRequest;
    toJSONPubsubRequestToEncrypt(): DecryptedChallengeRequest;
    private _handleRpcChallengeVerification;
    private _handleIncomingChallengePubsubMessage;
    private _handleIncomingChallengeVerificationPubsubMessage;
    private _handleChallengeExchange;
    private _updatePubsubState;
    publishChallengeAnswers(challengeAnswers: DecryptedChallengeAnswerMessageType["challengeAnswers"]): Promise<true | undefined>;
    private _validatePublicationFields;
    private _validateSubFields;
    _updatePublishingStateNoEmission(newState: Publication["publishingState"]): void;
    _updatePublishingStateWithEmission(newState: Publication["publishingState"]): void;
    private _updateRpcClientStateFromPublishingState;
    protected _setStateNoEmission(newState: Publication["state"]): void;
    protected _setStateWithEmission(newState: Publication["state"]): void;
    protected _setRpcClientState(newState: Publication["clients"]["plebbitRpcClients"][""]["state"]): void;
    private _pubsubTopicWithfallback;
    _getSubplebbitCache(): Pick<{
        address: string;
        signature: {
            type: string;
            signature: string;
            publicKey: string;
            signedPropertyNames: string[];
        };
        protocolVersion: string;
        updatedAt: number;
        challenges: import("zod").objectOutputType<{
            exclude: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodObject<{
                subplebbit: import("zod").ZodOptional<import("zod").ZodObject<{
                    addresses: import("zod").ZodArray<import("zod").ZodString, "atleastone">;
                    maxCommentCids: import("zod").ZodNumber;
                    postScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                    replyScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                    firstCommentTimestamp: import("zod").ZodOptional<import("zod").ZodNumber>;
                }, "strict", import("zod").ZodTypeAny, {
                    addresses: [string, ...string[]];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: [string, ...string[]];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                replyScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                firstCommentTimestamp: import("zod").ZodOptional<import("zod").ZodNumber>;
                challenges: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodNumber, "many">>;
                role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodUnion<[import("zod").ZodEnum<["owner", "admin", "moderator"]>, import("zod").ZodString]>, "many">>;
                address: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
                rateLimit: import("zod").ZodOptional<import("zod").ZodNumber>;
                rateLimitChallengeSuccess: import("zod").ZodOptional<import("zod").ZodBoolean>;
                publicationType: import("zod").ZodOptional<import("zod").ZodEffects<import("zod").ZodObject<{
                    post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentEdit: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentModeration: import("zod").ZodOptional<import("zod").ZodBoolean>;
                }, "passthrough", import("zod").ZodTypeAny, import("zod").objectOutputType<{
                    post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentEdit: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentModeration: import("zod").ZodOptional<import("zod").ZodBoolean>;
                }, import("zod").ZodTypeAny, "passthrough">, import("zod").objectInputType<{
                    post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentEdit: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentModeration: import("zod").ZodOptional<import("zod").ZodBoolean>;
                }, import("zod").ZodTypeAny, "passthrough">>, import("zod").objectOutputType<{
                    post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentEdit: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentModeration: import("zod").ZodOptional<import("zod").ZodBoolean>;
                }, import("zod").ZodTypeAny, "passthrough">, import("zod").objectInputType<{
                    post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentEdit: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentModeration: import("zod").ZodOptional<import("zod").ZodBoolean>;
                }, import("zod").ZodTypeAny, "passthrough">>>;
            }, "passthrough", import("zod").ZodTypeAny, import("zod").objectOutputType<{
                subplebbit: import("zod").ZodOptional<import("zod").ZodObject<{
                    addresses: import("zod").ZodArray<import("zod").ZodString, "atleastone">;
                    maxCommentCids: import("zod").ZodNumber;
                    postScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                    replyScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                    firstCommentTimestamp: import("zod").ZodOptional<import("zod").ZodNumber>;
                }, "strict", import("zod").ZodTypeAny, {
                    addresses: [string, ...string[]];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: [string, ...string[]];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                replyScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                firstCommentTimestamp: import("zod").ZodOptional<import("zod").ZodNumber>;
                challenges: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodNumber, "many">>;
                role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodUnion<[import("zod").ZodEnum<["owner", "admin", "moderator"]>, import("zod").ZodString]>, "many">>;
                address: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
                rateLimit: import("zod").ZodOptional<import("zod").ZodNumber>;
                rateLimitChallengeSuccess: import("zod").ZodOptional<import("zod").ZodBoolean>;
                publicationType: import("zod").ZodOptional<import("zod").ZodEffects<import("zod").ZodObject<{
                    post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentEdit: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentModeration: import("zod").ZodOptional<import("zod").ZodBoolean>;
                }, "passthrough", import("zod").ZodTypeAny, import("zod").objectOutputType<{
                    post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentEdit: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentModeration: import("zod").ZodOptional<import("zod").ZodBoolean>;
                }, import("zod").ZodTypeAny, "passthrough">, import("zod").objectInputType<{
                    post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentEdit: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentModeration: import("zod").ZodOptional<import("zod").ZodBoolean>;
                }, import("zod").ZodTypeAny, "passthrough">>, import("zod").objectOutputType<{
                    post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentEdit: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentModeration: import("zod").ZodOptional<import("zod").ZodBoolean>;
                }, import("zod").ZodTypeAny, "passthrough">, import("zod").objectInputType<{
                    post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentEdit: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentModeration: import("zod").ZodOptional<import("zod").ZodBoolean>;
                }, import("zod").ZodTypeAny, "passthrough">>>;
            }, import("zod").ZodTypeAny, "passthrough">, import("zod").objectInputType<{
                subplebbit: import("zod").ZodOptional<import("zod").ZodObject<{
                    addresses: import("zod").ZodArray<import("zod").ZodString, "atleastone">;
                    maxCommentCids: import("zod").ZodNumber;
                    postScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                    replyScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                    firstCommentTimestamp: import("zod").ZodOptional<import("zod").ZodNumber>;
                }, "strict", import("zod").ZodTypeAny, {
                    addresses: [string, ...string[]];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: [string, ...string[]];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                replyScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                firstCommentTimestamp: import("zod").ZodOptional<import("zod").ZodNumber>;
                challenges: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodNumber, "many">>;
                role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodUnion<[import("zod").ZodEnum<["owner", "admin", "moderator"]>, import("zod").ZodString]>, "many">>;
                address: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
                rateLimit: import("zod").ZodOptional<import("zod").ZodNumber>;
                rateLimitChallengeSuccess: import("zod").ZodOptional<import("zod").ZodBoolean>;
                publicationType: import("zod").ZodOptional<import("zod").ZodEffects<import("zod").ZodObject<{
                    post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentEdit: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentModeration: import("zod").ZodOptional<import("zod").ZodBoolean>;
                }, "passthrough", import("zod").ZodTypeAny, import("zod").objectOutputType<{
                    post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentEdit: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentModeration: import("zod").ZodOptional<import("zod").ZodBoolean>;
                }, import("zod").ZodTypeAny, "passthrough">, import("zod").objectInputType<{
                    post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentEdit: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentModeration: import("zod").ZodOptional<import("zod").ZodBoolean>;
                }, import("zod").ZodTypeAny, "passthrough">>, import("zod").objectOutputType<{
                    post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentEdit: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentModeration: import("zod").ZodOptional<import("zod").ZodBoolean>;
                }, import("zod").ZodTypeAny, "passthrough">, import("zod").objectInputType<{
                    post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentEdit: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentModeration: import("zod").ZodOptional<import("zod").ZodBoolean>;
                }, import("zod").ZodTypeAny, "passthrough">>>;
            }, import("zod").ZodTypeAny, "passthrough">>, "atleastone">>;
            description: import("zod").ZodOptional<import("zod").ZodString>;
            challenge: import("zod").ZodOptional<import("zod").ZodString>;
            type: import("zod").ZodString;
            caseInsensitive: import("zod").ZodOptional<import("zod").ZodBoolean>;
        }, import("zod").ZodTypeAny, "passthrough">[];
        encryption: {
            type: string;
            publicKey: string;
        } & {
            [k: string]: unknown;
        };
        createdAt: number;
        statsCid: string;
        title?: string | undefined;
        lastCommentCid?: string | undefined;
        posts?: {
            pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
            pageCids?: Record<string, string> | undefined;
        } | undefined;
        description?: string | undefined;
        pubsubTopic?: string | undefined;
        postUpdates?: Record<string, string> | undefined;
        roles?: Record<string, import("zod").objectOutputType<{
            role: import("zod").ZodUnion<[import("zod").ZodEnum<["owner", "admin", "moderator"]>, import("zod").ZodString]>;
        }, import("zod").ZodTypeAny, "passthrough">> | undefined;
        rules?: string[] | undefined;
        lastPostCid?: string | undefined;
        features?: import("zod").objectOutputType<{
            noVideos: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noSpoilers: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noImages: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noVideoReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noSpoilerReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noImageReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noPolls: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noCrossposts: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noAuthors: import("zod").ZodOptional<import("zod").ZodBoolean>;
            anonymousAuthors: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noNestedReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            safeForWork: import("zod").ZodOptional<import("zod").ZodBoolean>;
            authorFlairs: import("zod").ZodOptional<import("zod").ZodBoolean>;
            requireAuthorFlairs: import("zod").ZodOptional<import("zod").ZodBoolean>;
            postFlairs: import("zod").ZodOptional<import("zod").ZodBoolean>;
            requirePostFlairs: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noMarkdownImages: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noMarkdownVideos: import("zod").ZodOptional<import("zod").ZodBoolean>;
            markdownImageReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            markdownVideoReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noPostUpvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noReplyUpvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noPostDownvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noReplyDownvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noUpvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noDownvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            requirePostLink: import("zod").ZodOptional<import("zod").ZodBoolean>;
            requirePostLinkIsMedia: import("zod").ZodOptional<import("zod").ZodBoolean>;
        }, import("zod").ZodTypeAny, "passthrough"> | undefined;
        suggested?: import("zod").objectOutputType<{
            primaryColor: import("zod").ZodOptional<import("zod").ZodString>;
            secondaryColor: import("zod").ZodOptional<import("zod").ZodString>;
            avatarUrl: import("zod").ZodOptional<import("zod").ZodString>;
            bannerUrl: import("zod").ZodOptional<import("zod").ZodString>;
            backgroundUrl: import("zod").ZodOptional<import("zod").ZodString>;
            language: import("zod").ZodOptional<import("zod").ZodString>;
        }, import("zod").ZodTypeAny, "passthrough"> | undefined;
        flairs?: Record<string, import("zod").objectOutputType<{
            text: import("zod").ZodString;
            backgroundColor: import("zod").ZodOptional<import("zod").ZodString>;
            textColor: import("zod").ZodOptional<import("zod").ZodString>;
            expiresAt: import("zod").ZodOptional<import("zod").ZodNumber>;
        }, import("zod").ZodTypeAny, "passthrough">[]> | undefined;
    }, "address" | "encryption" | "pubsubTopic"> | undefined;
    _fetchSubplebbitForPublishing(): Promise<NonNullable<Publication["_subplebbit"]>>;
    stop(): Promise<void>;
    _isAllAttemptsExhausted(maxNumOfChallengeExchanges: number): boolean;
    private _postSucessOrFailurePublishing;
    private _handleIncomingChallengeRequestFromRpc;
    private _handleIncomingChallengeFromRpc;
    private _handleIncomingChallengeAnswerFromRpc;
    private _handleIncomingChallengeVerificationFromRpc;
    private _handleIncomingPublishingStateFromRpc;
    private _handleIncomingStateFromRpc;
    private _handleIncomingErrorFromRpc;
    _publishWithRpc(): Promise<void>;
    private _changePublicationStateEmitEventEmitStateChangeEvent;
    private _signAndValidateChallengeRequestBeforePublishing;
    private _didWeReceiveChallengeOrChallengeVerification;
    private _generateChallengeRequestToPublish;
    private _initSubplebbit;
    private _challengeExchangesFormattedForErrors;
    private _handleNotReceivingResponseToChallengeRequest;
    private _getPubsubProviders;
    publish(): Promise<void>;
}
export default Publication;
