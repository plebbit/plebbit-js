import polyfill from "./runtime/node/polyfill.js";
polyfill();
import * as PlebbitClass from "./plebbit.js";
import { setNativeFunctions } from "./runtime/node/util.js";
import nodeNativeFunctions from "./runtime/node/native-functions.js";
import browserNativeFunctions from "./runtime/browser/native-functions.js";
import { shortifyAddress, shortifyCid } from "./util.js";
import { plebbitJsChallenges } from "./runtime/node/subplebbit/challenges/index.js";
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