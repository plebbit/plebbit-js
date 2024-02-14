import { TypedEmitter } from "tiny-typed-emitter";
// Client classes
export class GenericPubsubClient extends TypedEmitter {
    constructor(state) {
        super();
        this.state = state;
    }
}
export class PublicationPubsubClient extends TypedEmitter {
    constructor(state) {
        super();
        this.state = state;
    }
}
export class SubplebbitPubsubClient extends TypedEmitter {
    constructor(state) {
        super();
        this.state = state;
    }
}
//# sourceMappingURL=pubsub-client.js.map