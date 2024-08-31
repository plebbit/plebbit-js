import { TypedEmitter } from "tiny-typed-emitter";
import { hideClassPrivateProps } from "../util.js";
// Client classes
class BaseIpfsGateway extends TypedEmitter {
    constructor(state) {
        super();
        this.state = state;
        hideClassPrivateProps(this);
    }
}
export class GenericIpfsGatewayClient extends BaseIpfsGateway {
}
export class PublicationIpfsGatewayClient extends BaseIpfsGateway {
}
export class CommentIpfsGatewayClient extends BaseIpfsGateway {
}
export class SubplebbitIpfsGatewayClient extends BaseIpfsGateway {
}
export class PagesIpfsGatewayClient extends BaseIpfsGateway {
}
//# sourceMappingURL=ipfs-gateway-client.js.map