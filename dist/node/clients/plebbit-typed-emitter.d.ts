import { ListenerSignature, TypedEmitter } from "tiny-typed-emitter";
export declare class PlebbitTypedEmitter<T extends ListenerSignature<T>> extends TypedEmitter<T> {
    _mirroredClient?: PlebbitTypedEmitter<T>;
    state: any;
    private _stateListener?;
    constructor();
    mirror(sourceClient: PlebbitTypedEmitter<T>): void;
    unmirror(): void;
}
