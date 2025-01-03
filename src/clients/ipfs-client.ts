import { TypedEmitter } from "tiny-typed-emitter";
import { GenericClientEvents } from "../types.js";
import { hideClassPrivateProps } from "../util.js";

// Types
type PublicationIpfsState = "stopped" | "fetching-subplebbit-ipns" | "fetching-subplebbit-ipfs";
type CommentIpfsState = PublicationIpfsState | "fetching-ipfs" | "fetching-update-ipns" | "fetching-update-ipfs";
type SubplebbitIpfsState = "stopped" | "fetching-ipns" | "fetching-ipfs" | "publishing-ipns";
type PagesIpfsState = "fetching-ipfs" | "stopped";
type GenericIpfsState = PublicationIpfsState | CommentIpfsState | SubplebbitIpfsState | PagesIpfsState;

// Client classes
class BaseIpfsClient<T extends GenericIpfsState> extends TypedEmitter<GenericClientEvents<T>> {
    state: T;

    constructor(state: T) {
        super();
        this.state = state;
        hideClassPrivateProps(this);
    }
}

export class GenericIpfsClient extends BaseIpfsClient<GenericIpfsState> {}

export class PublicationIpfsClient extends BaseIpfsClient<PublicationIpfsState> {}

export class CommentIpfsClient extends BaseIpfsClient<CommentIpfsState> {}

export class SubplebbitIpfsClient extends BaseIpfsClient<SubplebbitIpfsState> {}

export class PagesIpfsClient extends BaseIpfsClient<PagesIpfsState> {}
