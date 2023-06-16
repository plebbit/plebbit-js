import { TypedEmitter } from "tiny-typed-emitter";
import { GenericClientEvents } from "../types";
type PublicationIpfsState = "stopped" | "fetching-subplebbit-ipns" | "fetching-subplebbit-ipfs";
type CommentIpfsState = PublicationIpfsState | "fetching-ipfs" | "fetching-update-ipns" | "fetching-update-ipfs";
type SubplebbitIpfsState = "stopped" | "fetching-ipns" | "fetching-ipfs" | "publishing-ipns";
type PagesIpfsState = "fetching-ipfs" | "stopped";
type GenericIpfsState = PublicationIpfsState | CommentIpfsState | SubplebbitIpfsState | PagesIpfsState;
declare class BaseIpfsClient<T extends GenericIpfsState> extends TypedEmitter<GenericClientEvents<T>> {
    state: T;
    constructor(state: T);
}
export declare class GenericIpfsClient extends BaseIpfsClient<GenericIpfsState> {
}
export declare class PublicationIpfsClient extends BaseIpfsClient<PublicationIpfsState> {
}
export declare class CommentIpfsClient extends BaseIpfsClient<CommentIpfsState> {
}
export declare class SubplebbitIpfsClient extends BaseIpfsClient<SubplebbitIpfsState> {
}
export declare class PagesIpfsClient extends BaseIpfsClient<PagesIpfsState> {
}
export {};
