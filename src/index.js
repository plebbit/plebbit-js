import * as PlebbitClass from "./Plebbit.js";

export async function Plebbit(options) {
    return new PlebbitClass.Plebbit(options);
}