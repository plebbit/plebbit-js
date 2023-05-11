import { TypedEmitter } from "tiny-typed-emitter";
import { GenericClientEvents } from "../types";
declare type PublicationGatewayState = "stopped" | "fetching-subplebbit-ipns";
declare type CommentGatewayState = PublicationGatewayState | "fetching-update-ipns" | "fetching-ipfs";
declare type SubplebbitGatewayState = "stopped" | "fetching-ipns";
declare type GenericGatewayState = PublicationGatewayState | CommentGatewayState | SubplebbitGatewayState;
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
export {};
