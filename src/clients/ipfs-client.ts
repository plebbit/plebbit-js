import { GenericClientEvents } from "../types.js";
import { hideClassPrivateProps } from "../util.js";
import { PlebbitTypedEmitter } from "./plebbit-typed-emitter.js";

// Types
type PublicationIpfsState = "stopped" | "fetching-subplebbit-ipns" | "fetching-subplebbit-ipfs";
type CommentIpfsState = PublicationIpfsState | "fetching-ipfs" | "fetching-update-ipns" | "fetching-update-ipfs";
type SubplebbitIpfsState = "stopped" | "fetching-ipns" | "fetching-ipfs" | "publishing-ipns";
type PagesIpfsState = "fetching-ipfs" | "stopped";
type GenericIpfsState = PublicationIpfsState | CommentIpfsState | SubplebbitIpfsState | PagesIpfsState;

// Client classes
class BaseIpfsClient<T extends GenericIpfsState> extends PlebbitTypedEmitter<GenericClientEvents<T>> {
    override state: T;

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
