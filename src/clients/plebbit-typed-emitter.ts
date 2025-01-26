import { ListenerSignature, TypedEmitter } from "tiny-typed-emitter";

export class PlebbitTypedEmitter<T extends ListenerSignature<T>> extends TypedEmitter<T> {
    mirroredClient?: PlebbitTypedEmitter<T>;
    state: any;
    private stateListener?: (newState: string) => void;

    mirror(sourceClient: PlebbitTypedEmitter<T>): void {
        if (this.mirroredClient) {
            throw new Error("This client is already mirroring another client");
        }

        // Mirror initial state
        if (sourceClient.state !== this.state) {
            this.state = sourceClient.state;
            //@ts-expect-error
            this.emit("statechange", this.state);
        }

        // Setup state change listener
        this.stateListener = (newState: string) => {
            this.state = newState;
            //@ts-expect-error
            this.emit("statechange", newState);
        };

        // Listen to state changes on source client
        //@ts-expect-error
        sourceClient.on("statechange", this.stateListener);

        // Store reference to source client
        this.mirroredClient = sourceClient;
    }

    unmirror() {
        if (!this.mirroredClient || !this.stateListener) {
            throw new Error("This client is not mirroring any other client");
        }

        // Remove state change listener
        //@ts-expect-error
        this.mirroredClient.off("statechange", this.stateListener);

        // // Reset to stopped state
        // this.state = "stopped" as T;
        // this.emit("statechange", this.state);

        // Clear references
        this.stateListener = undefined;
        this.mirroredClient = undefined;
    }
}
