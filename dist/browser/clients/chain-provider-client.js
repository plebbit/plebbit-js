import { TypedEmitter } from "tiny-typed-emitter";
import { hideClassPrivateProps } from "../util.js";
export class GenericChainProviderClient extends TypedEmitter {
    constructor(state) {
        super();
        this.state = state;
        hideClassPrivateProps(this);
    }
}
//# sourceMappingURL=chain-provider-client.js.map