import type { GenericClientEvents } from "../types.js";
import { PlebbitTypedEmitter } from "./plebbit-typed-emitter.js";
type GenericChainproviderState = "stopped" | "resolving-subplebbit-address" | "resolving-author-address";
export declare class GenericChainProviderClient extends PlebbitTypedEmitter<GenericClientEvents<GenericChainproviderState>> {
    state: GenericChainproviderState;
    constructor(state: GenericChainProviderClient["state"]);
}
export {};
