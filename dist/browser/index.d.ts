import * as PlebbitClass from "./plebbit";
import { PlebbitOptions } from "./types";
import { shortifyAddress, shortifyCid } from "./util";
declare const Plebbit: {
    (plebbitOptions?: PlebbitOptions): Promise<PlebbitClass.Plebbit>;
    setNativeFunctions: (newNativeFunctions: Partial<import("./types").NativeFunctions>) => void;
    nativeFunctions: {
        node: import("./types").NativeFunctions;
        browser: import("./types").NativeFunctions;
    };
    getShortCid: typeof shortifyCid;
    getShortAddress: typeof shortifyAddress;
};
export = Plebbit;
