import { TypedEmitter } from "tiny-typed-emitter";
import { GenericClientEvents } from "../types";

// Client states
type PublicationGatewayState = "stopped" | "fetching-subplebbit-ipns";
type CommentGatewayState = PublicationGatewayState | "fetching-update-ipns" | "fetching-ipfs";
type SubplebbitGatewayState = "stopped" | "fetching-ipns";
type GenericGatewayState = PublicationGatewayState | CommentGatewayState | SubplebbitGatewayState;

// Client classes
class BaseIpfsGateway<T extends GenericGatewayState> extends TypedEmitter<GenericClientEvents<T>> {
    state: T;
    constructor(state: T) {
        super();
        this.state = state;
    }
}

export class GenericIpfsGatewayClient extends BaseIpfsGateway<GenericGatewayState> {}

export class PublicationIpfsGatewayClient extends BaseIpfsGateway<PublicationGatewayState> {}

export class CommentIpfsGatewayClient extends BaseIpfsGateway<CommentGatewayState> {}

export class SubplebbitIpfsGatewayClient extends BaseIpfsGateway<SubplebbitGatewayState> {}
