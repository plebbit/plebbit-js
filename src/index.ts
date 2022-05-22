import polyfill from "./runtime/node/polyfill";
polyfill();
import * as PlebbitClass from "./plebbit";
import { PlebbitOptions } from "./types";

// "export = " instead of "export default" fixes the commonjs
// problem of having to do require('plebbit-js').default
export = function Plebbit(plebbitOptions?: PlebbitOptions) {
    return new PlebbitClass.Plebbit(plebbitOptions);
};
