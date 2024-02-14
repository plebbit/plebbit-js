import { TypedEmitter } from "tiny-typed-emitter";
// Client classes
class BaseIpfsGateway extends TypedEmitter {
    constructor(state) {
        super();
        this.state = state;
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