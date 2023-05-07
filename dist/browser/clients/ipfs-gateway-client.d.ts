import { TypedEmitter } from "tiny-typed-emitter";
import { GenericClientEvents } from "../types";
declare type GenericGatewayState = "stopped" | "fetching-ipfs" | "fetching-ipns";
export declare class GenericIpfsGatewayClient extends TypedEmitter<GenericClientEvents<GenericGatewayState>> {
    state: GenericGatewayState;
    constructor(state: GenericIpfsGatewayClient["state"]);
}
export {};
