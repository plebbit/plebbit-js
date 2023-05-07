import { TypedEmitter } from "tiny-typed-emitter";
import { GenericClientEvents } from "../types";

type GenericChainproviderState = "stopped" | "resolving-subplebbit-address" | "resolving-author-address";
export class GenericChainProviderClient extends TypedEmitter<GenericClientEvents<GenericChainproviderState>> {
    state: GenericChainproviderState;
    constructor(state: GenericChainProviderClient["state"]) {
        super();
        this.state = state;
    }
}
