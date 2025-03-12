import { hideClassPrivateProps } from "../util.js";
import { PlebbitTypedEmitter } from "./plebbit-typed-emitter.js";
export class GenericChainProviderClient extends PlebbitTypedEmitter {
    constructor(state) {
        super();
        this.state = state;
        hideClassPrivateProps(this);
    }
}
//# sourceMappingURL=chain-provider-client.js.map