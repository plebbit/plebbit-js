import { TypedEmitter } from "tiny-typed-emitter";
import type { GenericClientEvents } from "../types.js";
import { hideClassPrivateProps } from "../util.js";

// Client states
type PublicationGatewayState = "stopped" | "fetching-subplebbit-ipns";
type CommentGatewayState = PublicationGatewayState | "fetching-update-ipfs" | "fetching-ipfs";
type SubplebbitGatewayState = "stopped" | "fetching-ipns";
type PagesGatewayState = "fetching-ipfs" | "stopped";
type GenericGatewayState = PublicationGatewayState | CommentGatewayState | SubplebbitGatewayState;

// Client classes
class BaseIpfsGateway<T extends GenericGatewayState> extends TypedEmitter<GenericClientEvents<T>> {
    state: T;
    constructor(state: T) {
        super();
        this.state = state;
        hideClassPrivateProps(this);
    }
}

export class GenericIpfsGatewayClient extends BaseIpfsGateway<GenericGatewayState> {}

export class PublicationIpfsGatewayClient extends BaseIpfsGateway<PublicationGatewayState> {}

export class CommentIpfsGatewayClient extends BaseIpfsGateway<CommentGatewayState> {}

export class SubplebbitIpfsGatewayClient extends BaseIpfsGateway<SubplebbitGatewayState> {}

export class PagesIpfsGatewayClient extends BaseIpfsGateway<PagesGatewayState> {}
