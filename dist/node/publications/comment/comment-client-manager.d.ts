import { CachedTextRecordResolve } from "../../clients/base-client-manager.js";
import { GenericChainProviderClient } from "../../clients/chain-provider-client.js";
import { CommentPlebbitRpcStateClient } from "../../clients/rpc-client/plebbit-rpc-state-client.js";
import { PageIpfs } from "../../pages/types.js";
import type { SubplebbitIpfsType } from "../../subplebbit/types.js";
import type { ChainTicker } from "../../types.js";
import { Comment } from "./comment.js";
import type { CommentIpfsType, CommentUpdateType } from "./types.js";
import { PlebbitError } from "../../plebbit-error.js";
import Logger from "@plebbit/plebbit-logger";
import { PublicationClientsManager } from "../publication-client-manager.js";
import { CommentKuboRpcClient } from "../../clients/ipfs-client.js";
import { PublicationKuboPubsubClient } from "../../clients/pubsub-client.js";
import { RemoteSubplebbit } from "../../subplebbit/remote-subplebbit.js";
import { CommentIpfsGatewayClient } from "../../clients/ipfs-gateway-client.js";
type NewCommentUpdate = {
    commentUpdate: CommentUpdateType;
    commentUpdateIpfsPath: NonNullable<Comment["_commentUpdateIpfsPath"]>;
} | undefined;
export declare class CommentClientsManager extends PublicationClientsManager {
    clients: {
        ipfsGateways: {
            [ipfsGatewayUrl: string]: CommentIpfsGatewayClient;
        };
        kuboRpcClients: {
            [ipfsClientUrl: string]: CommentKuboRpcClient;
        };
        pubsubKuboRpcClients: {
            [pubsubClientUrl: string]: PublicationKuboPubsubClient;
        };
        chainProviders: Record<ChainTicker, {
            [chainProviderUrl: string]: GenericChainProviderClient;
        }>;
        plebbitRpcClients: Record<string, CommentPlebbitRpcStateClient>;
    };
    private _comment;
    constructor(comment: Comment);
    protected _initKuboRpcClients(): void;
    protected _initPlebbitRpcClients(): void;
    preResolveTextRecord(address: string, txtRecordName: "subplebbit-address" | "plebbit-author-address", chain: ChainTicker, chainProviderUrl: string, staleCache?: CachedTextRecordResolve): void;
    _findCommentInSubplebbitPosts(subIpns: SubplebbitIpfsType, commentCidToLookFor: string): {
        comment: CommentIpfsType;
        commentUpdate: CommentUpdateType;
    } | undefined;
    _fetchParentCommentForCommentUpdate(parentCid: string): Promise<{
        comment: CommentIpfsType;
        commentUpdate: Pick<CommentUpdateType, "cid">;
    }>;
    _getParentsPath(subIpns: SubplebbitIpfsType): Promise<string>;
    _calculatePathForCommentUpdate(folderCid: string, parentsPostUpdatePath: string): string;
    _fetchNewCommentUpdateIpfsP2P(subIpns: SubplebbitIpfsType, timestampRanges: string[], parentsPostUpdatePath: string, log: Logger): Promise<NewCommentUpdate>;
    _shouldWeFetchCommentUpdateFromNextTimestamp(err: PlebbitError | Error): boolean;
    private _throwIfCommentUpdateHasInvalidSignature;
    _fetchCommentUpdateFromGateways(subIpns: SubplebbitIpfsType, timestampRanges: string[], parentsPostUpdatePath: string, log: Logger): Promise<NewCommentUpdate>;
    _useLoadedCommentUpdateIfNewInfo(loadedCommentUpdate: NonNullable<NewCommentUpdate> | Pick<NonNullable<NewCommentUpdate>, "commentUpdate">, subplebbit: SubplebbitIpfsType, log: Logger): boolean;
    useSubplebbitPostUpdatesToFetchCommentUpdate(subIpfs: SubplebbitIpfsType): Promise<undefined>;
    private _fetchRawCommentCidIpfsP2P;
    private _fetchCommentIpfsFromGateways;
    private _throwIfCommentIpfsIsInvalid;
    fetchAndVerifyCommentCid(cid: string): Promise<CommentIpfsType>;
    updateIpfsState(newState: CommentKuboRpcClient["state"]): void;
    protected _isPublishing(): boolean;
    _findCommentInPagesOfUpdatingCommentsSubplebbit(subIpfs?: SubplebbitIpfsType): PageIpfs["comments"][0] | undefined;
    handleUpdateEventFromSub(): Promise<void>;
    handleErrorEventFromSub(error: PlebbitError | Error): Promise<void>;
    handleIpfsGatewaySubplebbitState(subplebbitNewGatewayState: RemoteSubplebbit["clients"]["ipfsGateways"][string]["state"], gatewayUrl: string): void;
    _translateSubUpdatingStateToCommentUpdatingState(newSubUpdatingState: RemoteSubplebbit["updatingState"]): void;
    _translateSubUpdatingStateToCommentKuboState(newSubUpdatingState: RemoteSubplebbit["updatingState"]): void;
    _translateSubUpdatingStateToCommentGatewayState(newSubUpdatingState: RemoteSubplebbit["updatingState"]): void;
    handleUpdatingStateChangeEventFromSub(newSubUpdatingState: RemoteSubplebbit["updatingState"]): Promise<void>;
}
export {};
