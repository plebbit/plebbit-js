import type { GenericClientEvents } from "../../types.js";
import Publication from "../../publications/publication.js";
import { Comment } from "../../publications/comment/comment.js";
import { BasePages } from "../../pages/pages.js";
import { RpcRemoteSubplebbit } from "../../subplebbit/rpc-remote-subplebbit.js";
import { PlebbitTypedEmitter } from "../plebbit-typed-emitter.js";
type PublicationRpcState = Publication["clients"]["chainProviders"]["eth"][0]["state"] | Publication["clients"]["kuboRpcClients"][0]["state"] | Publication["clients"]["pubsubKuboRpcClients"][0]["state"] | Publication["clients"]["ipfsGateways"][0]["state"];
type CommentRpcState = Comment["clients"]["chainProviders"]["eth"][0]["state"] | Comment["clients"]["kuboRpcClients"][0]["state"] | Comment["clients"]["pubsubKuboRpcClients"][0]["state"] | Comment["clients"]["ipfsGateways"][0]["state"];
type SubplebbitRpcState = RpcRemoteSubplebbit["clients"]["chainProviders"]["eth"][0]["state"] | RpcRemoteSubplebbit["clients"]["kuboRpcClients"][0]["state"] | RpcRemoteSubplebbit["clients"]["pubsubKuboRpcClients"][0]["state"] | RpcRemoteSubplebbit["clients"]["ipfsGateways"][0]["state"];
type PagesRpcState = BasePages["clients"]["kuboRpcClients"][""][""]["state"] | BasePages["clients"]["ipfsGateways"][""][""]["state"];
type GenericRpcState = PublicationRpcState | CommentRpcState | SubplebbitRpcState | PagesRpcState;
declare class BasePlebbitRpcStateClient<T extends GenericRpcState> extends PlebbitTypedEmitter<GenericClientEvents<T>> {
    state: T;
    constructor(state: T);
}
export declare class GenericPlebbitRpcStateClient extends BasePlebbitRpcStateClient<GenericRpcState> {
}
export declare class PublicationPlebbitRpcStateClient extends BasePlebbitRpcStateClient<PublicationRpcState> {
}
export declare class CommentPlebbitRpcStateClient extends BasePlebbitRpcStateClient<CommentRpcState> {
}
export declare class SubplebbitPlebbitRpcStateClient extends BasePlebbitRpcStateClient<SubplebbitRpcState> {
}
export declare class PagesPlebbitRpcStateClient extends BasePlebbitRpcStateClient<PagesRpcState> {
}
export {};
