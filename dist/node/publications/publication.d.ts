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
import { LocalSubplebbit } from "../runtime/node/subplebbit/local-subplebbit.js";
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
    _publishingToLocalSubplebbit?: LocalSubplebbit;
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
        challenges: {
            [x: string]: unknown;
            type: string;
            exclude?: {
                [x: string]: unknown;
                subplebbit?: {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                } | undefined;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
                challenges?: number[] | undefined;
                role?: string[] | undefined;
                address?: string[] | undefined;
                rateLimit?: number | undefined;
                rateLimitChallengeSuccess?: boolean | undefined;
                publicationType?: {
                    [x: string]: unknown;
                    post?: boolean | undefined;
                    reply?: boolean | undefined;
                    vote?: boolean | undefined;
                    commentEdit?: boolean | undefined;
                    commentModeration?: boolean | undefined;
                    subplebbitEdit?: boolean | undefined;
                } | undefined;
            }[] | undefined;
            description?: string | undefined;
            challenge?: string | undefined;
            caseInsensitive?: boolean | undefined;
            pendingApproval?: boolean | undefined;
        }[];
        signature: {
            type: string;
            signature: string;
            publicKey: string;
            signedPropertyNames: string[];
        };
        encryption: {
            [x: string]: unknown;
            type: string;
            publicKey: string;
        };
        address: string;
        createdAt: number;
        updatedAt: number;
        statsCid: string;
        protocolVersion: string;
        posts?: {
            pages: Record<string, {
                comments: {
                    comment: {
                        [x: string]: unknown;
                        timestamp: number;
                        signature: {
                            type: string;
                            signature: string;
                            publicKey: string;
                            signedPropertyNames: string[];
                        };
                        subplebbitAddress: string;
                        protocolVersion: string;
                        author: {
                            [x: string]: unknown;
                            address: string;
                            previousCommentCid?: string | undefined;
                            displayName?: string | undefined;
                            wallets?: Record<string, {
                                address: string;
                                timestamp: number;
                                signature: {
                                    signature: string;
                                    type: string;
                                };
                            }> | undefined;
                            avatar?: {
                                [x: string]: unknown;
                                chainTicker: string;
                                address: string;
                                id: string;
                                timestamp: number;
                                signature: {
                                    signature: string;
                                    type: string;
                                };
                            } | undefined;
                            flair?: {
                                [x: string]: unknown;
                                text: string;
                                backgroundColor?: string | undefined;
                                textColor?: string | undefined;
                                expiresAt?: number | undefined;
                            } | undefined;
                        };
                        depth: number;
                        flair?: {
                            [x: string]: unknown;
                            text: string;
                            backgroundColor?: string | undefined;
                            textColor?: string | undefined;
                            expiresAt?: number | undefined;
                        } | undefined;
                        content?: string | undefined;
                        spoiler?: boolean | undefined;
                        nsfw?: boolean | undefined;
                        link?: string | undefined;
                        title?: string | undefined;
                        linkWidth?: number | undefined;
                        linkHeight?: number | undefined;
                        linkHtmlTagName?: string | undefined;
                        parentCid?: string | undefined;
                        postCid?: string | undefined;
                        thumbnailUrl?: string | undefined;
                        thumbnailUrlWidth?: number | undefined;
                        thumbnailUrlHeight?: number | undefined;
                        previousCid?: string | undefined;
                    };
                    commentUpdate: {
                        [x: string]: unknown;
                        cid: string;
                        upvoteCount: number;
                        downvoteCount: number;
                        replyCount: number;
                        updatedAt: number;
                        signature: {
                            type: string;
                            signature: string;
                            publicKey: string;
                            signedPropertyNames: string[];
                        };
                        protocolVersion: string;
                        childCount?: number | undefined;
                        number?: number | undefined;
                        postNumber?: number | undefined;
                        edit?: {
                            [x: string]: unknown;
                            timestamp: number;
                            signature: {
                                type: string;
                                signature: string;
                                publicKey: string;
                                signedPropertyNames: string[];
                            };
                            subplebbitAddress: string;
                            protocolVersion: string;
                            commentCid: string;
                            author: {
                                [x: string]: unknown;
                                address: string;
                                previousCommentCid?: string | undefined;
                                displayName?: string | undefined;
                                wallets?: Record<string, {
                                    address: string;
                                    timestamp: number;
                                    signature: {
                                        signature: string;
                                        type: string;
                                    };
                                }> | undefined;
                                avatar?: {
                                    [x: string]: unknown;
                                    chainTicker: string;
                                    address: string;
                                    id: string;
                                    timestamp: number;
                                    signature: {
                                        signature: string;
                                        type: string;
                                    };
                                } | undefined;
                                flair?: {
                                    [x: string]: unknown;
                                    text: string;
                                    backgroundColor?: string | undefined;
                                    textColor?: string | undefined;
                                    expiresAt?: number | undefined;
                                } | undefined;
                            };
                            flair?: {
                                [x: string]: unknown;
                                text: string;
                                backgroundColor?: string | undefined;
                                textColor?: string | undefined;
                                expiresAt?: number | undefined;
                            } | undefined;
                            content?: string | undefined;
                            deleted?: boolean | undefined;
                            spoiler?: boolean | undefined;
                            nsfw?: boolean | undefined;
                            reason?: string | undefined;
                        } | undefined;
                        flair?: {
                            [x: string]: unknown;
                            text: string;
                            backgroundColor?: string | undefined;
                            textColor?: string | undefined;
                            expiresAt?: number | undefined;
                        } | undefined;
                        spoiler?: boolean | undefined;
                        nsfw?: boolean | undefined;
                        pinned?: boolean | undefined;
                        locked?: boolean | undefined;
                        removed?: boolean | undefined;
                        reason?: string | undefined;
                        approved?: boolean | undefined;
                        author?: {
                            [x: string]: unknown;
                            subplebbit?: {
                                [x: string]: unknown;
                                postScore: number;
                                replyScore: number;
                                firstCommentTimestamp: number;
                                lastCommentCid: string;
                                banExpiresAt?: number | undefined;
                                flair?: {
                                    [x: string]: unknown;
                                    text: string;
                                    backgroundColor?: string | undefined;
                                    textColor?: string | undefined;
                                    expiresAt?: number | undefined;
                                } | undefined;
                            } | undefined;
                        } | undefined;
                        lastChildCid?: string | undefined;
                        lastReplyTimestamp?: number | undefined;
                        replies?: {
                            pages: Record<string, /*elided*/ any>;
                            pageCids?: Record<string, string> | undefined;
                        } | undefined;
                    };
                }[];
                nextCid?: string | undefined;
            }>;
            pageCids?: Record<string, string> | undefined;
        } | undefined;
        modQueue?: {
            pageCids: Record<string, string>;
        } | undefined;
        pubsubTopic?: string | undefined;
        postUpdates?: Record<string, string> | undefined;
        title?: string | undefined;
        description?: string | undefined;
        roles?: Record<string, {
            [x: string]: unknown;
            role: string;
        }> | undefined;
        rules?: string[] | undefined;
        lastPostCid?: string | undefined;
        lastCommentCid?: string | undefined;
        features?: {
            [x: string]: unknown;
            noVideos?: boolean | undefined;
            noSpoilers?: boolean | undefined;
            noImages?: boolean | undefined;
            noVideoReplies?: boolean | undefined;
            noSpoilerReplies?: boolean | undefined;
            noImageReplies?: boolean | undefined;
            noPolls?: boolean | undefined;
            noCrossposts?: boolean | undefined;
            noAuthors?: boolean | undefined;
            anonymousAuthors?: boolean | undefined;
            noNestedReplies?: boolean | undefined;
            safeForWork?: boolean | undefined;
            authorFlairs?: boolean | undefined;
            requireAuthorFlairs?: boolean | undefined;
            postFlairs?: boolean | undefined;
            requirePostFlairs?: boolean | undefined;
            noMarkdownImages?: boolean | undefined;
            noMarkdownVideos?: boolean | undefined;
            markdownImageReplies?: boolean | undefined;
            markdownVideoReplies?: boolean | undefined;
            noPostUpvotes?: boolean | undefined;
            noReplyUpvotes?: boolean | undefined;
            noPostDownvotes?: boolean | undefined;
            noReplyDownvotes?: boolean | undefined;
            noUpvotes?: boolean | undefined;
            noDownvotes?: boolean | undefined;
            requirePostLink?: boolean | undefined;
            requirePostLinkIsMedia?: boolean | undefined;
            anonymityMode?: "per-post" | "per-reply" | "per-author" | undefined;
        } | undefined;
        suggested?: {
            [x: string]: unknown;
            primaryColor?: string | undefined;
            secondaryColor?: string | undefined;
            avatarUrl?: string | undefined;
            bannerUrl?: string | undefined;
            backgroundUrl?: string | undefined;
            language?: string | undefined;
        } | undefined;
        flairs?: Record<string, {
            [x: string]: unknown;
            text: string;
            backgroundColor?: string | undefined;
            textColor?: string | undefined;
            expiresAt?: number | undefined;
        }[]> | undefined;
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
    private _publishWithLocalSubplebbit;
    publish(): Promise<void>;
}
export default Publication;
