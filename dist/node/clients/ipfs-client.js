import { TypedEmitter } from "tiny-typed-emitter";
import { hideClassPrivateProps } from "../util.js";
// Client classes
class BaseIpfsClient extends TypedEmitter {
    constructor(state) {
        super();
        this.state = state;
        hideClassPrivateProps(this);
    }
}
export class GenericIpfsClient extends BaseIpfsClient {
}
export class PublicationIpfsClient extends BaseIpfsClient {
}
export class CommentIpfsClient extends BaseIpfsClient {
}
export class SubplebbitIpfsClient extends BaseIpfsClient {
}
export class PagesIpfsClient extends BaseIpfsClient {
}
//# sourceMappingURL=ipfs-client.js.map