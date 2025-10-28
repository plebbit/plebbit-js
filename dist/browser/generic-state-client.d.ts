import { PlebbitTypedEmitter } from "./clients/plebbit-typed-emitter.js";
import { GenericClientEvents } from "./types.js";
export declare class GenericStateClient<T extends string> extends PlebbitTypedEmitter<GenericClientEvents<T>> {
    state: T;
    constructor(state: T);
}
