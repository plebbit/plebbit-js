import { TypedEmitter } from "tiny-typed-emitter";
import { GenericClientEvents } from "../types";
declare type PublicationIpfsState = "stopped" | "fetching-subplebbit-ipns" | "fetching-subplebbit-ipfs";
declare type CommentIpfsState = PublicationIpfsState | "fetching-ipfs" | "fetching-update-ipns" | "fetching-update-ipfs";
declare type SubplebbitIpfsState = "stopped" | "fetching-ipns" | "fetching-ipfs" | "publishing-ipns";
declare type GenericIpfsState = PublicationIpfsClient["state"] | CommentIpfsClient["state"] | SubplebbitIpfsClient["state"];
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
export {};
