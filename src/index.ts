import polyfill from "./runtime/node/polyfill";
polyfill();
import * as PlebbitClass from "./plebbit";
import { PlebbitOptions } from "./types";
import { shortifyAddress, shortifyCid } from "./util";
import { plebbitJsChallenges } from "./runtime/node/subplebbit/challenges";

const Plebbit = async function Plebbit(plebbitOptions: PlebbitOptions = {}): Promise<PlebbitClass.Plebbit> {
    const plebbit = new PlebbitClass.Plebbit(plebbitOptions);
    await plebbit._init(plebbitOptions);
    return plebbit;
};

Plebbit.getShortCid = shortifyCid;
Plebbit.getShortAddress = shortifyAddress;
Plebbit.challenges = plebbitJsChallenges;
// "export = " instead of "export default" fixes the commonjs
// problem of having to do require('plebbit-js').default
export default Plebbit;
