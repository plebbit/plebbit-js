import { TypedEmitter } from "tiny-typed-emitter";
import type { GenericClientEvents } from "../types.js";
import { hideClassPrivateProps } from "../util.js";

type GenericChainproviderState = "stopped" | "resolving-subplebbit-address" | "resolving-author-address";
export class GenericChainProviderClient extends TypedEmitter<GenericClientEvents<GenericChainproviderState>> {
    state: GenericChainproviderState;
    constructor(state: GenericChainProviderClient["state"]) {
        super();
        this.state = state;
        hideClassPrivateProps(this);
    }
}
