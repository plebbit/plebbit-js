import polyfill from "./runtime/browser/polyfill.js";
polyfill();
import * as PlebbitClass from "./plebbit.js";
import { setNativeFunctions } from "./runtime/browser/util.js";
import nodeNativeFunctions from "./runtime/browser/native-functions.js";
import browserNativeFunctions from "./runtime/browser/native-functions.js";
import { shortifyAddress, shortifyCid } from "./util.js";
import { plebbitJsChallenges } from "./runtime/browser/subplebbit/challenges/index.js";
const Plebbit = async function Plebbit(plebbitOptions = {}) {
    const plebbit = new PlebbitClass.Plebbit(plebbitOptions);
    await plebbit._init(plebbitOptions);
    return plebbit;
};
Plebbit.setNativeFunctions = setNativeFunctions;
Plebbit.nativeFunctions = { node: nodeNativeFunctions, browser: browserNativeFunctions };
Plebbit.getShortCid = shortifyCid;
Plebbit.getShortAddress = shortifyAddress;
Plebbit.challenges = plebbitJsChallenges;
export default Plebbit;
//# sourceMappingURL=index.js.map