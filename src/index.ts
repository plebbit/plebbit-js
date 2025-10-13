import "./zod-error-map.js";
import polyfill from "./runtime/node/polyfill.js";
polyfill();
import * as PlebbitClass from "./plebbit/plebbit.js";
import type { InputPlebbitOptions } from "./types.js";
import { setNativeFunctions as utilSetNativeFunctions } from "./runtime/node/util.js";
import nodeNativeFunctions from "./runtime/node/native-functions.js";
import browserNativeFunctions from "./runtime/browser/native-functions.js";
import { shortifyAddress, shortifyCid } from "./util.js";
import { plebbitJsChallenges } from "./runtime/node/subplebbit/challenges/index.js";
import { PlebbitWithRpcClient } from "./plebbit/plebbit-with-rpc-client.js";

const Plebbit = async function Plebbit(plebbitOptions: InputPlebbitOptions = {}): Promise<PlebbitClass.Plebbit> {
    const plebbit = plebbitOptions.plebbitRpcClientsOptions
        ? new PlebbitWithRpcClient(plebbitOptions)
        : new PlebbitClass.Plebbit(plebbitOptions);
    await plebbit._init();
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
