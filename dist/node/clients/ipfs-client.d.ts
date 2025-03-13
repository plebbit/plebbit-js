import type { GenericClientEvents } from "../types.js";
import { PlebbitTypedEmitter } from "./plebbit-typed-emitter.js";
type PublicationIpfsState = "stopped" | "fetching-subplebbit-ipns" | "fetching-subplebbit-ipfs";
type CommentIpfsState = PublicationIpfsState | "fetching-ipfs" | "fetching-update-ipns" | "fetching-update-ipfs";
type SubplebbitIpfsState = "stopped" | "fetching-ipns" | "fetching-ipfs" | "publishing-ipns";
type PagesIpfsState = "fetching-ipfs" | "stopped";
type GenericIpfsState = PublicationIpfsState | CommentIpfsState | SubplebbitIpfsState | PagesIpfsState;
declare class BaseKuboRpcClient<T extends GenericIpfsState> extends PlebbitTypedEmitter<GenericClientEvents<T>> {
    state: T;
    constructor(state: T);
}
export declare class GenericKuboRpcClient extends BaseKuboRpcClient<GenericIpfsState> {
}
export declare class PublicationKuboRpcClient extends BaseKuboRpcClient<PublicationIpfsState> {
}
export declare class CommentKuboRpcClient extends BaseKuboRpcClient<CommentIpfsState> {
}
export declare class SubplebbitKuboRpcClient extends BaseKuboRpcClient<SubplebbitIpfsState> {
}
export declare class PagesKuboRpcClient extends BaseKuboRpcClient<PagesIpfsState> {
}
export {};
