import * as PlebbitClass from "./Plebbit.js";

export default async function Plebbit(options) {
    return new PlebbitClass.Plebbit(options);
}