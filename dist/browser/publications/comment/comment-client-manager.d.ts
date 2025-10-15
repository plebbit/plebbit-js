import { CachedTextRecordResolve } from "../../clients/base-client-manager.js";
import { GenericChainProviderClient } from "../../clients/chain-provider-client.js";
import type { PageIpfs } from "../../pages/types.js";
import type { SubplebbitIpfsType } from "../../subplebbit/types.js";
import type { ChainTicker } from "../../types.js";
import { Comment } from "./comment.js";
import type { CommentIpfsType, CommentUpdateType } from "./types.js";
import { PlebbitError } from "../../plebbit-error.js";
import Logger from "@plebbit/plebbit-logger";
import { PublicationClientsManager } from "../publication-client-manager.js";
import { RemoteSubplebbit } from "../../subplebbit/remote-subplebbit.js";
import { CommentIpfsGatewayClient, CommentKuboPubsubClient, CommentKuboRpcClient, CommentLibp2pJsClient, CommentPlebbitRpcStateClient } from "./comment-clients.js";
import { Plebbit } from "../../plebbit/plebbit.js";
type NewCommentUpdate = {
    commentUpdate: CommentUpdateType;
    commentUpdateIpfsPath: NonNullable<Comment["_commentUpdateIpfsPath"]>;
} | undefined;
export declare const MAX_FILE_SIZE_BYTES_FOR_COMMENT_UPDATE: number;
export declare class CommentClientsManager extends PublicationClientsManager {
    clients: {
        ipfsGateways: {
            [ipfsGatewayUrl: string]: CommentIpfsGatewayClient;
        };
        kuboRpcClients: {
            [ipfsClientUrl: string]: CommentKuboRpcClient;
        };
        pubsubKuboRpcClients: {
            [pubsubClientUrl: string]: CommentKuboPubsubClient;
        };
        chainProviders: Record<ChainTicker, {
            [chainProviderUrl: string]: GenericChainProviderClient;
        }>;
        plebbitRpcClients: Record<string, CommentPlebbitRpcStateClient>;
        libp2pJsClients: {
            [libp2pJsClientKey: string]: CommentLibp2pJsClient;
        };
    };
    private _postForUpdating?;
    private _comment;
    private _parentFirstPageCidsAlreadyLoaded;
    private _fetchingUpdateForReplyUsingPageCidsPromise?;
    constructor(comment: Comment);
    protected _initKuboRpcClients(): void;
    protected _initLibp2pJsClients(): void;
    protected _initPlebbitRpcClients(): void;
    updateLibp2pJsClientState(newState: CommentLibp2pJsClient["state"], libp2pJsClientKey: string): void;
    updateKuboRpcState(newState: CommentKuboRpcClient["state"], kuboRpcClientUrl: string): void;
    updateGatewayState(newState: CommentIpfsGatewayClient["state"], ipfsGatewayClientUrl: string): void;
    updateKuboRpcPubsubState(newState: CommentKuboPubsubClient["state"], pubsubKuboRpcClientUrl: string): void;
    preResolveTextRecord(address: string, txtRecordName: "subplebbit-address" | "plebbit-author-address", chain: ChainTicker, chainProviderUrl: string, staleCache?: CachedTextRecordResolve): void;
    _findCommentInSubplebbitPosts(subIpns: SubplebbitIpfsType, commentCidToLookFor: string): {
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
                pages: Record<string, {
                    comments: /*elided*/ any[];
                    nextCid?: string | undefined;
                }>;
                pageCids?: Record<string, string> | undefined;
            } | undefined;
        };
    } | undefined;
    _calculatePathForPostCommentUpdate(folderCid: string, postCid: string): string;
    _updateKuboRpcClientOrHeliaState(newState: CommentKuboRpcClient["state"] | CommentLibp2pJsClient["state"], kuboRpcOrHelia: Plebbit["clients"]["kuboRpcClients"][string] | Plebbit["clients"]["libp2pJsClients"][string]): void;
    _fetchPostCommentUpdateIpfsP2P(subIpns: SubplebbitIpfsType, timestampRanges: string[], log: Logger): Promise<NewCommentUpdate>;
    _shouldWeFetchCommentUpdateFromNextTimestamp(err: PlebbitError | Error): boolean;
    private _throwIfCommentUpdateHasInvalidSignature;
    _fetchPostCommentUpdateFromGateways(subIpns: SubplebbitIpfsType, timestampRanges: string[], log: Logger): Promise<NewCommentUpdate>;
    _useLoadedCommentUpdateIfNewInfo(loadedCommentUpdate: NonNullable<NewCommentUpdate> | Pick<NonNullable<NewCommentUpdate>, "commentUpdate">, subplebbit: Pick<SubplebbitIpfsType, "signature">, log: Logger): boolean;
    useSubplebbitPostUpdatesToFetchCommentUpdateForPost(subIpfs: SubplebbitIpfsType): Promise<void>;
    private _fetchRawCommentCidIpfsP2P;
    private _fetchCommentIpfsFromGateways;
    private _throwIfCommentIpfsIsInvalid;
    fetchAndVerifyCommentCid(cid: string): Promise<CommentIpfsType>;
    protected _isPublishing(): boolean;
    _findCommentInPagesOfUpdatingCommentsOrSubplebbit(opts?: {
        sub?: RemoteSubplebbit;
        post?: Comment;
        parent?: Comment;
    }): PageIpfs["comments"][0] | undefined;
    handleUpdateEventFromSub(sub: RemoteSubplebbit): Promise<void>;
    _chooseWhichPagesBasedOnParentAndReplyTimestamp(parentCommentTimestamp: number): "old" | "new";
    usePageCidsOfParentToFetchCommentUpdateForReply(postCommentInstance: Comment): Promise<void>;
    handleErrorEventFromSub(error: PlebbitError | Error): Promise<void>;
    handleIpfsGatewaySubplebbitState(subplebbitNewGatewayState: RemoteSubplebbit["clients"]["ipfsGateways"][string]["state"], gatewayUrl: string): void;
    _translateSubUpdatingStateToCommentUpdatingState(newSubUpdatingState: RemoteSubplebbit["updatingState"]): void;
    handleUpdatingStateChangeEventFromSub(newSubUpdatingState: RemoteSubplebbit["updatingState"]): void;
    handleErrorEventFromPost(error: PlebbitError | Error): void;
    handleUpdatingStateChangeEventFromPost(newState: Comment["updatingState"]): void;
    _handleIpfsGatewayPostState(newState: Comment["clients"]["ipfsGateways"][string]["state"], gatewayUrl: string): void;
    _handleKuboRpcPostState(newState: Comment["clients"]["kuboRpcClients"][string]["state"], kuboRpcUrl: string): void;
    _handleLibp2pJsClientPostState(newState: Comment["clients"]["libp2pJsClients"][string]["state"], libp2pJsClientKey: string): void;
    _handleChainProviderPostState(newState: Comment["clients"]["chainProviders"][ChainTicker][string]["state"], chainTicker: ChainTicker, providerUrl: string): void;
    handleUpdateEventFromPostToFetchReplyCommentUpdate(postInstance: Comment): Promise<void>;
    _createPostInstanceWithStateTranslation(): Promise<CommentClientsManager["_postForUpdating"]>;
    cleanUpUpdatingPostInstance(): Promise<void>;
}
export {};
