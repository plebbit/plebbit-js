import { TypedEmitter } from "tiny-typed-emitter";
import type { GenericClientEvents } from "../types.js";
import { hideClassPrivateProps } from "../util.js";
import { PlebbitTypedEmitter } from "./plebbit-typed-emitter.js";

// Types
type PublicationIpfsState = "stopped" | "fetching-subplebbit-ipns" | "fetching-subplebbit-ipfs";
type CommentIpfsState = PublicationIpfsState | "fetching-ipfs" | "fetching-update-ipns" | "fetching-update-ipfs";
type SubplebbitIpfsState = "stopped" | "fetching-ipns" | "fetching-ipfs" | "publishing-ipns";
type PagesIpfsState = "fetching-ipfs" | "stopped";
type GenericIpfsState = PublicationIpfsState | CommentIpfsState | SubplebbitIpfsState | PagesIpfsState;

// Client classes
class BaseKuboRpcClient<T extends GenericIpfsState> extends PlebbitTypedEmitter<GenericClientEvents<T>> {
    override state: T;

    constructor(state: T) {
        super();
        this.state = state;
        hideClassPrivateProps(this);
    }
}

export class GenericKuboRpcClient extends BaseKuboRpcClient<GenericIpfsState> {}

export class PublicationKuboRpcClient extends BaseKuboRpcClient<PublicationIpfsState> {}

export class CommentKuboRpcClient extends BaseKuboRpcClient<CommentIpfsState> {}

export class SubplebbitKuboRpcClient extends BaseKuboRpcClient<SubplebbitIpfsState> {}

export class PagesKuboRpcClient extends BaseKuboRpcClient<PagesIpfsState> {}
