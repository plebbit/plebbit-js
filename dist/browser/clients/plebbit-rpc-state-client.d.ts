import { TypedEmitter } from "tiny-typed-emitter";
import { GenericClientEvents } from "../types.js";
import Publication from "../publication.js";
import { Comment } from "../comment.js";
import { BasePages } from "../pages.js";
import { RpcRemoteSubplebbit } from "../subplebbit/rpc-remote-subplebbit.js";
type PublicationRpcState = Publication["clients"]["chainProviders"]["eth"][0]["state"] | Publication["clients"]["ipfsClients"][0]["state"] | Publication["clients"]["pubsubClients"][0]["state"] | Publication["clients"]["ipfsGateways"][0]["state"];
type CommentRpcState = Comment["clients"]["chainProviders"]["eth"][0]["state"] | Comment["clients"]["ipfsClients"][0]["state"] | Comment["clients"]["pubsubClients"][0]["state"] | Comment["clients"]["ipfsGateways"][0]["state"];
type SubplebbitRpcState = RpcRemoteSubplebbit["clients"]["chainProviders"]["eth"][0]["state"] | RpcRemoteSubplebbit["clients"]["ipfsClients"][0]["state"] | RpcRemoteSubplebbit["clients"]["pubsubClients"][0]["state"] | RpcRemoteSubplebbit["clients"]["ipfsGateways"][0]["state"];
type PagesRpcState = BasePages["clients"]["ipfsClients"][""][""]["state"] | BasePages["clients"]["ipfsGateways"][""][""]["state"];
type GenericRpcState = PublicationRpcState | CommentRpcState | SubplebbitRpcState | PagesRpcState;
declare class BasePlebbitRpcStateClient<T extends GenericRpcState> extends TypedEmitter<GenericClientEvents<T>> {
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
