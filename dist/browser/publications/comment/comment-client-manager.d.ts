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
    private _parentCommentCidsAlreadyLoaded;
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
        comment: CommentIpfsType;
        commentUpdate: CommentUpdateType;
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
