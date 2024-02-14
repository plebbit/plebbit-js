import { TypedEmitter } from "tiny-typed-emitter";
// Client classes
class BasePlebbitRpcStateClient extends TypedEmitter {
    constructor(state) {
        super();
        this.state = state;
    }
}
export class GenericPlebbitRpcStateClient extends BasePlebbitRpcStateClient {
}
export class PublicationPlebbitRpcStateClient extends BasePlebbitRpcStateClient {
}
export class CommentPlebbitRpcStateClient extends BasePlebbitRpcStateClient {
}
export class SubplebbitPlebbitRpcStateClient extends BasePlebbitRpcStateClient {
}
export class PagesPlebbitRpcStateClient extends BasePlebbitRpcStateClient {
}
//# sourceMappingURL=plebbit-rpc-state-client.js.map