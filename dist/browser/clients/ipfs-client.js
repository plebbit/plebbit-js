import { hideClassPrivateProps } from "../util.js";
import { PlebbitTypedEmitter } from "./plebbit-typed-emitter.js";
// Client classes
class BaseKuboRpcClient extends PlebbitTypedEmitter {
    constructor(state) {
        super();
        this.state = state;
        hideClassPrivateProps(this);
    }
}
export class GenericKuboRpcClient extends BaseKuboRpcClient {
}
export class PublicationKuboRpcClient extends BaseKuboRpcClient {
}
export class CommentKuboRpcClient extends BaseKuboRpcClient {
}
export class SubplebbitKuboRpcClient extends BaseKuboRpcClient {
}
export class PagesKuboRpcClient extends BaseKuboRpcClient {
}
//# sourceMappingURL=ipfs-client.js.map