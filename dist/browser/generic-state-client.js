import { PlebbitTypedEmitter } from "./clients/plebbit-typed-emitter.js";
import { hideClassPrivateProps } from "./util.js";
export class GenericStateClient extends PlebbitTypedEmitter {
    constructor(state) {
        super();
        this.state = state;
        hideClassPrivateProps(this);
    }
}
//# sourceMappingURL=generic-state-client.js.map