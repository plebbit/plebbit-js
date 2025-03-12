import type { GenericClientEvents } from "../types.js";
import { hideClassPrivateProps } from "../util.js";
import { PlebbitTypedEmitter } from "./plebbit-typed-emitter.js";

type GenericChainproviderState = "stopped" | "resolving-subplebbit-address" | "resolving-author-address";
export class GenericChainProviderClient extends PlebbitTypedEmitter<GenericClientEvents<GenericChainproviderState>> {
    override state: GenericChainproviderState;
    constructor(state: GenericChainProviderClient["state"]) {
        super();
        this.state = state;
        hideClassPrivateProps(this);
    }
}
