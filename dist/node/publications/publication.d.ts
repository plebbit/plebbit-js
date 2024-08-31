import type { DecryptedChallengeAnswerMessageType, DecryptedChallengeRequest, DecryptedChallengeRequestMessageType, DecryptedChallengeVerificationMessageType } from "../pubsub-messages/types.js";
import type { AuthorPubsubJsonType, LocalPublicationProps, PublicationEvents, PublicationPubsubMessage, PublicationTypeName } from "../types.js";
import { Plebbit } from "../plebbit.js";
import { TypedEmitter } from "tiny-typed-emitter";
import { Comment } from "./comment/comment.js";
import { PublicationClientsManager } from "../clients/client-manager.js";
import type { CommentEditPubsubMessage } from "./comment-edit/types.js";
import type { VotePubsubMessage } from "./vote/types.js";
import type { CommentIpfsType, CommentPubsubMessage } from "./comment/types.js";
import { PublicationPublishingState, PublicationState } from "./types.js";
declare class Publication extends TypedEmitter<PublicationEvents> {
    clients: PublicationClientsManager["clients"];
    subplebbitAddress: DecryptedChallengeRequestMessageType["publication"]["subplebbitAddress"];
    shortSubplebbitAddress: string;
    timestamp: DecryptedChallengeRequestMessageType["publication"]["timestamp"];
    signature: DecryptedChallengeRequestMessageType["publication"]["signature"];
    signer?: LocalPublicationProps["signer"];
    author: AuthorPubsubJsonType;
    protocolVersion: DecryptedChallengeRequestMessageType["protocolVersion"];
    state: PublicationState | Comment["state"];
    publishingState: PublicationPublishingState;
    challengeAnswers?: DecryptedChallengeRequestMessageType["challengeAnswers"];
    challengeCommentCids?: DecryptedChallengeRequestMessageType["challengeCommentCids"];
    private _subplebbit?;
    private _challengeAnswer?;
    private _publishedChallengeRequests?;
    private _challengeIdToPubsubSigner;
    private _pubsubProviders;
    private _pubsubProvidersDoneWaiting?;
    private _currentPubsubProviderIndex?;
    private _receivedChallengeFromSub;
    private _receivedChallengeVerification;
    private _challenge?;
    private _publishToDifferentProviderThresholdSeconds;
    private _setProviderFailureThresholdSeconds;
    private _rpcPublishSubscriptionId?;
    _clientsManager: PublicationClientsManager;
    _plebbit: Plebbit;
    constructor(plebbit: Plebbit);
    protected _initClients(): void;
    setSubplebbitAddress(subplebbitAddress: string): void;
    _initChallengeRequestChallengeProps(props: Pick<LocalPublicationProps, "challengeAnswers" | "challengeCommentCids">): void;
    _initBaseLocalProps(props: LocalPublicationProps): void;
    _initBaseRemoteProps(props: CommentIpfsType | CommentPubsubMessage | VotePubsubMessage | CommentEditPubsubMessage): void;
    protected _updateLocalCommentPropsWithVerification(publication: DecryptedChallengeVerificationMessageType["publication"]): Promise<void>;
    protected getType(): PublicationTypeName;
    toJSONPubsubMessagePublication(): PublicationPubsubMessage;
    toJSONPubsubMessage(): DecryptedChallengeRequest;
    private _handleRpcChallengeVerification;
    private _handleIncomingChallengePubsubMessage;
    private _handleIncomingChallengeVerificationPubsubMessage;
    private _handleChallengeExchange;
    publishChallengeAnswers(challengeAnswers: DecryptedChallengeAnswerMessageType["challengeAnswers"]): Promise<true | undefined>;
    private _validatePublicationFields;
    private _validateSubFields;
    _updatePublishingState(newState: Publication["publishingState"]): void;
    private _updateRpcClientStateFromPublishingState;
    protected _updateState(newState: Publication["state"]): void;
    protected _setRpcClientState(newState: Publication["clients"]["plebbitRpcClients"][""]["state"]): void;
    private _pubsubTopicWithfallback;
    _getSubplebbitCache(): Pick<{
        address: string;
        signature: {
            type: "ed25519" | "eip191";
            publicKey: string;
            signature: string;
            signedPropertyNames: [string, ...string[]];
        };
        protocolVersion: string;
        challenges: import("zod").objectOutputType<{
            exclude: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodObject<{
                subplebbit: import("zod").ZodOptional<import("zod").ZodObject<{
                    addresses: import("zod").ZodArray<import("zod").ZodString, "many">;
                    maxCommentCids: import("zod").ZodNumber;
                    postScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                    replyScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                    firstCommentTimestamp: import("zod").ZodOptional<import("zod").ZodNumber>;
                }, "strict", import("zod").ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                replyScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                firstCommentTimestamp: import("zod").ZodOptional<import("zod").ZodNumber>;
                challenges: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodNumber, "many">>;
                post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
                rateLimit: import("zod").ZodOptional<import("zod").ZodNumber>;
                rateLimitChallengeSuccess: import("zod").ZodOptional<import("zod").ZodBoolean>;
            }, "passthrough", import("zod").ZodTypeAny, import("zod").objectOutputType<{
                subplebbit: import("zod").ZodOptional<import("zod").ZodObject<{
                    addresses: import("zod").ZodArray<import("zod").ZodString, "many">;
                    maxCommentCids: import("zod").ZodNumber;
                    postScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                    replyScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                    firstCommentTimestamp: import("zod").ZodOptional<import("zod").ZodNumber>;
                }, "strict", import("zod").ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                replyScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                firstCommentTimestamp: import("zod").ZodOptional<import("zod").ZodNumber>;
                challenges: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodNumber, "many">>;
                post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
                rateLimit: import("zod").ZodOptional<import("zod").ZodNumber>;
                rateLimitChallengeSuccess: import("zod").ZodOptional<import("zod").ZodBoolean>;
            }, import("zod").ZodTypeAny, "passthrough">, import("zod").objectInputType<{
                subplebbit: import("zod").ZodOptional<import("zod").ZodObject<{
                    addresses: import("zod").ZodArray<import("zod").ZodString, "many">;
                    maxCommentCids: import("zod").ZodNumber;
                    postScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                    replyScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                    firstCommentTimestamp: import("zod").ZodOptional<import("zod").ZodNumber>;
                }, "strict", import("zod").ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                replyScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                firstCommentTimestamp: import("zod").ZodOptional<import("zod").ZodNumber>;
                challenges: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodNumber, "many">>;
                post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
                rateLimit: import("zod").ZodOptional<import("zod").ZodNumber>;
                rateLimitChallengeSuccess: import("zod").ZodOptional<import("zod").ZodBoolean>;
            }, import("zod").ZodTypeAny, "passthrough">>, "many">>;
            description: import("zod").ZodOptional<import("zod").ZodString>;
            challenge: import("zod").ZodOptional<import("zod").ZodString>;
            type: import("zod").ZodOptional<import("zod").ZodString>;
        }, import("zod").ZodTypeAny, "passthrough">[];
        updatedAt: number;
        encryption: {
            type: "ed25519-aes-gcm";
            publicKey: string;
        } & {
            [k: string]: unknown;
        };
        createdAt: number;
        statsCid: string;
        lastCommentCid?: string | undefined;
        description?: string | undefined;
        pubsubTopic?: string | undefined;
        title?: string | undefined;
        posts?: {
            pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
            pageCids: Record<string, string>;
        } | undefined;
        postUpdates?: Record<string, string> | undefined;
        roles?: Record<string, import("zod").objectOutputType<{
            role: import("zod").ZodEnum<["owner", "admin", "moderator"]>;
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
            noUpvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noDownvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
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
    }, "address" | "pubsubTopic" | "encryption"> | undefined;
    _fetchSubplebbitForPublishing(): Promise<NonNullable<Publication["_subplebbit"]>>;
    stop(): Promise<void>;
    _isAllAttemptsExhausted(): boolean;
    _setProviderToFailIfNoResponse(providerIndex: number): void;
    private _postSucessOrFailurePublishing;
    private _handleIncomingChallengeRequestFromRpc;
    private _handleIncomingChallengeFromRpc;
    private _handleIncomingChallengeAnswerFromRpc;
    private _handleIncomingChallengeVerificationFromRpc;
    private _handleIncomingPublishingStateFromRpc;
    private _handleIncomingStateFromRpc;
    _publishWithRpc(): Promise<void>;
    _createRequestEncrypted(): {
        publication: {
            timestamp: number;
            signature: {
                type: "ed25519" | "eip191";
                publicKey: string;
                signature: string;
                signedPropertyNames: [string, ...string[]];
            };
            author: {
                address: string;
                previousCommentCid?: string | undefined;
                displayName?: string | undefined;
                wallets?: Record<string, {
                    address: string;
                    timestamp: number;
                    signature: {
                        type: "eip191";
                        signature: string;
                    };
                }> | undefined;
                avatar?: import("zod").objectOutputType<{
                    chainTicker: import("zod").ZodString;
                    address: import("zod").ZodString;
                    id: import("zod").ZodString;
                    timestamp: import("zod").ZodNumber;
                    signature: import("zod").ZodObject<{
                        signature: import("zod").ZodString;
                        type: import("zod").ZodEnum<["eip191"]>;
                    }, "strip", import("zod").ZodTypeAny, {
                        type: "eip191";
                        signature: string;
                    }, {
                        type: "eip191";
                        signature: string;
                    }>;
                }, import("zod").ZodTypeAny, "passthrough"> | undefined;
                flair?: import("zod").objectOutputType<{
                    text: import("zod").ZodString;
                    backgroundColor: import("zod").ZodOptional<import("zod").ZodString>;
                    textColor: import("zod").ZodOptional<import("zod").ZodString>;
                    expiresAt: import("zod").ZodOptional<import("zod").ZodNumber>;
                }, import("zod").ZodTypeAny, "passthrough"> | undefined;
            } & {
                [k: string]: unknown;
            };
            subplebbitAddress: string;
            protocolVersion: string;
            commentCid: string;
            vote: 0 | 1 | -1;
        } | {
            timestamp: number;
            signature: {
                type: "ed25519" | "eip191";
                publicKey: string;
                signature: string;
                signedPropertyNames: [string, ...string[]];
            };
            author: {
                address: string;
                previousCommentCid?: string | undefined;
                displayName?: string | undefined;
                wallets?: Record<string, {
                    address: string;
                    timestamp: number;
                    signature: {
                        type: "eip191";
                        signature: string;
                    };
                }> | undefined;
                avatar?: import("zod").objectOutputType<{
                    chainTicker: import("zod").ZodString;
                    address: import("zod").ZodString;
                    id: import("zod").ZodString;
                    timestamp: import("zod").ZodNumber;
                    signature: import("zod").ZodObject<{
                        signature: import("zod").ZodString;
                        type: import("zod").ZodEnum<["eip191"]>;
                    }, "strip", import("zod").ZodTypeAny, {
                        type: "eip191";
                        signature: string;
                    }, {
                        type: "eip191";
                        signature: string;
                    }>;
                }, import("zod").ZodTypeAny, "passthrough"> | undefined;
                flair?: import("zod").objectOutputType<{
                    text: import("zod").ZodString;
                    backgroundColor: import("zod").ZodOptional<import("zod").ZodString>;
                    textColor: import("zod").ZodOptional<import("zod").ZodString>;
                    expiresAt: import("zod").ZodOptional<import("zod").ZodNumber>;
                }, import("zod").ZodTypeAny, "passthrough"> | undefined;
            };
            subplebbitAddress: string;
            protocolVersion: string;
            flair?: import("zod").objectOutputType<{
                text: import("zod").ZodString;
                backgroundColor: import("zod").ZodOptional<import("zod").ZodString>;
                textColor: import("zod").ZodOptional<import("zod").ZodString>;
                expiresAt: import("zod").ZodOptional<import("zod").ZodNumber>;
            }, import("zod").ZodTypeAny, "passthrough"> | undefined;
            link?: string | undefined;
            spoiler?: boolean | undefined;
            content?: string | undefined;
            title?: string | undefined;
            linkWidth?: number | undefined;
            linkHeight?: number | undefined;
            linkHtmlTagName?: "audio" | "video" | "a" | "img" | undefined;
            parentCid?: string | undefined;
        } | {
            timestamp: number;
            signature: {
                type: "ed25519" | "eip191";
                publicKey: string;
                signature: string;
                signedPropertyNames: [string, ...string[]];
            };
            author: {
                address: string;
                previousCommentCid?: string | undefined;
                displayName?: string | undefined;
                wallets?: Record<string, {
                    address: string;
                    timestamp: number;
                    signature: {
                        type: "eip191";
                        signature: string;
                    };
                }> | undefined;
                avatar?: import("zod").objectOutputType<{
                    chainTicker: import("zod").ZodString;
                    address: import("zod").ZodString;
                    id: import("zod").ZodString;
                    timestamp: import("zod").ZodNumber;
                    signature: import("zod").ZodObject<{
                        signature: import("zod").ZodString;
                        type: import("zod").ZodEnum<["eip191"]>;
                    }, "strip", import("zod").ZodTypeAny, {
                        type: "eip191";
                        signature: string;
                    }, {
                        type: "eip191";
                        signature: string;
                    }>;
                }, import("zod").ZodTypeAny, "passthrough"> | undefined;
                flair?: import("zod").objectOutputType<{
                    text: import("zod").ZodString;
                    backgroundColor: import("zod").ZodOptional<import("zod").ZodString>;
                    textColor: import("zod").ZodOptional<import("zod").ZodString>;
                    expiresAt: import("zod").ZodOptional<import("zod").ZodNumber>;
                }, import("zod").ZodTypeAny, "passthrough"> | undefined;
            };
            subplebbitAddress: string;
            protocolVersion: string;
            commentCid: string;
            flair?: import("zod").objectOutputType<{
                text: import("zod").ZodString;
                backgroundColor: import("zod").ZodOptional<import("zod").ZodString>;
                textColor: import("zod").ZodOptional<import("zod").ZodString>;
                expiresAt: import("zod").ZodOptional<import("zod").ZodNumber>;
            }, import("zod").ZodTypeAny, "passthrough"> | undefined;
            removed?: boolean | undefined;
            reason?: string | undefined;
            spoiler?: boolean | undefined;
            content?: string | undefined;
            pinned?: boolean | undefined;
            locked?: boolean | undefined;
            commentAuthor?: import("zod").objectOutputType<Pick<{
                postScore: import("zod").ZodNumber;
                replyScore: import("zod").ZodNumber;
                banExpiresAt: import("zod").ZodOptional<import("zod").ZodNumber>;
                flair: import("zod").ZodOptional<import("zod").ZodObject<{
                    text: import("zod").ZodString;
                    backgroundColor: import("zod").ZodOptional<import("zod").ZodString>;
                    textColor: import("zod").ZodOptional<import("zod").ZodString>;
                    expiresAt: import("zod").ZodOptional<import("zod").ZodNumber>;
                }, "passthrough", import("zod").ZodTypeAny, import("zod").objectOutputType<{
                    text: import("zod").ZodString;
                    backgroundColor: import("zod").ZodOptional<import("zod").ZodString>;
                    textColor: import("zod").ZodOptional<import("zod").ZodString>;
                    expiresAt: import("zod").ZodOptional<import("zod").ZodNumber>;
                }, import("zod").ZodTypeAny, "passthrough">, import("zod").objectInputType<{
                    text: import("zod").ZodString;
                    backgroundColor: import("zod").ZodOptional<import("zod").ZodString>;
                    textColor: import("zod").ZodOptional<import("zod").ZodString>;
                    expiresAt: import("zod").ZodOptional<import("zod").ZodNumber>;
                }, import("zod").ZodTypeAny, "passthrough">>>;
                firstCommentTimestamp: import("zod").ZodNumber;
                lastCommentCid: import("zod").ZodEffects<import("zod").ZodString, string, string>;
            }, "flair" | "banExpiresAt">, import("zod").ZodTypeAny, "passthrough"> | undefined;
            deleted?: boolean | undefined;
        };
        challengeAnswers?: [string, ...string[]] | undefined;
        challengeCommentCids?: string[] | undefined;
    };
    private _signAndValidateChallengeRequestBeforePublishing;
    publish(): Promise<void>;
}
export default Publication;
