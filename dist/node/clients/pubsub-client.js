import { hideClassPrivateProps } from "../util.js";
import { PlebbitTypedEmitter } from "./plebbit-typed-emitter.js";
// Client classes
export class GenericKuboPubsubClient extends PlebbitTypedEmitter {
    constructor(state) {
        super();
        this.state = state;
        hideClassPrivateProps(this);
    }
}
export class PublicationKuboPubsubClient extends PlebbitTypedEmitter {
    constructor(state) {
        super();
        this.state = state;
    }
}
export class SubplebbitKuboPubsubClient extends PlebbitTypedEmitter {
    constructor(state) {
        super();
        this.state = state;
    }
}
//# sourceMappingURL=pubsub-client.js.map