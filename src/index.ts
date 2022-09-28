import polyfill from "./runtime/node/polyfill";
polyfill();
import * as PlebbitClass from "./plebbit";
import { PlebbitOptions } from "./types";
import { setNativeFunctions } from "./runtime/node/util";
import nodeNativeFunctions from "./runtime/node/native-functions";
import browserNativeFunctions from "./runtime/browser/native-functions";

const Plebbit = async function Plebbit(plebbitOptions: PlebbitOptions = {}): Promise<PlebbitClass.Plebbit> {
    const plebbit = new PlebbitClass.Plebbit(plebbitOptions);
    await plebbit._init(plebbitOptions);
    return plebbit;
};

Plebbit.setNativeFunctions = setNativeFunctions;
Plebbit.nativeFunctions = { node: nodeNativeFunctions, browser: browserNativeFunctions };
// "export = " instead of "export default" fixes the commonjs
// problem of having to do require('plebbit-js').default
export = Plebbit;
