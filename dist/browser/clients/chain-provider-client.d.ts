import { TypedEmitter } from "tiny-typed-emitter";
import { GenericClientEvents } from "../types.js";
type GenericChainproviderState = "stopped" | "resolving-subplebbit-address" | "resolving-author-address";
export declare class GenericChainProviderClient extends TypedEmitter<GenericClientEvents<GenericChainproviderState>> {
    state: GenericChainproviderState;
    constructor(state: GenericChainProviderClient["state"]);
}
export {};
