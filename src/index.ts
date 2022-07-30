import polyfill from "./runtime/node/polyfill";
polyfill();
import * as PlebbitClass from "./plebbit";
import { PlebbitOptions } from "./types";

// "export = " instead of "export default" fixes the commonjs
// problem of having to do require('plebbit-js').default
export = async function Plebbit(plebbitOptions: PlebbitOptions = {}): Promise<PlebbitClass.Plebbit> {
    const plebbit = new PlebbitClass.Plebbit(plebbitOptions);
    await plebbit._init(plebbitOptions);
    return plebbit;
};
