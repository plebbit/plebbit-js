import * as PlebbitClass from "./plebbit.js";
import { PlebbitOptions } from "./types.js";
import { shortifyAddress, shortifyCid } from "./util.js";
declare const Plebbit: {
    (plebbitOptions?: PlebbitOptions): Promise<PlebbitClass.Plebbit>;
    setNativeFunctions: (newNativeFunctions: Partial<import("./types.js").NativeFunctions>) => void;
    nativeFunctions: {
        node: import("./types.js").NativeFunctions;
        browser: import("./types.js").NativeFunctions;
    };
    getShortCid: typeof shortifyCid;
    getShortAddress: typeof shortifyAddress;
    challenges: Record<string, import("./subplebbit/types.js").ChallengeFileFactory>;
};
export default Plebbit;
