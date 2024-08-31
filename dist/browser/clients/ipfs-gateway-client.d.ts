import { TypedEmitter } from "tiny-typed-emitter";
import type { GenericClientEvents } from "../types.js";
type PublicationGatewayState = "stopped" | "fetching-subplebbit-ipns";
type CommentGatewayState = PublicationGatewayState | "fetching-update-ipfs" | "fetching-ipfs";
type SubplebbitGatewayState = "stopped" | "fetching-ipns";
type PagesGatewayState = "fetching-ipfs" | "stopped";
type GenericGatewayState = PublicationGatewayState | CommentGatewayState | SubplebbitGatewayState;
declare class BaseIpfsGateway<T extends GenericGatewayState> extends TypedEmitter<GenericClientEvents<T>> {
    state: T;
    constructor(state: T);
}
export declare class GenericIpfsGatewayClient extends BaseIpfsGateway<GenericGatewayState> {
}
export declare class PublicationIpfsGatewayClient extends BaseIpfsGateway<PublicationGatewayState> {
}
export declare class CommentIpfsGatewayClient extends BaseIpfsGateway<CommentGatewayState> {
}
export declare class SubplebbitIpfsGatewayClient extends BaseIpfsGateway<SubplebbitGatewayState> {
}
export declare class PagesIpfsGatewayClient extends BaseIpfsGateway<PagesGatewayState> {
}
export {};
