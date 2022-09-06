import { NativeFunctions } from "../../types";
import { default as browserNativeFunctions } from "./native-functions";

export const isRuntimeNode = false;
export let nativeFunctions: NativeFunctions = browserNativeFunctions;
export const setNativeFunctions = (pNativeFunctions: Partial<NativeFunctions>) =>
    (nativeFunctions = { ...nativeFunctions, ...pNativeFunctions });

export default {
    isRuntimeNode,
    setNativeFunctions,
    nativeFunctions
};
