import polyfill from "./runtime/node/polyfill.js";
polyfill();
import * as PlebbitClass from "./plebbit.js";
import { PlebbitOptions } from "./types.js";
import { setNativeFunctions as utilSetNativeFunctions } from "./runtime/node/util.js";
import nodeNativeFunctions from "./runtime/node/native-functions.js";
import browserNativeFunctions from "./runtime/browser/native-functions.js";
import { shortifyAddress, shortifyCid } from "./util.js";
import { plebbitJsChallenges } from "./runtime/node/subplebbit/challenges/index.js";

const Plebbit = async function Plebbit(plebbitOptions: PlebbitOptions = {}): Promise<PlebbitClass.Plebbit> {
    const plebbit = new PlebbitClass.Plebbit(plebbitOptions);
    await plebbit._init(plebbitOptions);
    return plebbit;
};

Plebbit.setNativeFunctions = utilSetNativeFunctions;
Plebbit.nativeFunctions = { node: nodeNativeFunctions, browser: browserNativeFunctions };
Plebbit.getShortCid = shortifyCid;
Plebbit.getShortAddress = shortifyAddress;
Plebbit.challenges = plebbitJsChallenges;
export default Plebbit;
export const setNativeFunctions = Plebbit.setNativeFunctions;
export const nativeFunctions = Plebbit.nativeFunctions;
export const getShortCid = Plebbit.getShortCid;
export const getShortAddress = Plebbit.getShortAddress;
export const challenges = Plebbit.challenges;
