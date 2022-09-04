import { NativeFunctions } from "../../types";
import { default as browserNativeFunctions } from "./native-functions";

// the browser has no data path
export const getDefaultDataPath = () => undefined;
export const isRuntimeNode = false;
export let nativeFunctions: NativeFunctions = browserNativeFunctions;
export const setNativeFunctions = (pNativeFunctions: Partial<NativeFunctions>) =>
    (nativeFunctions = { ...nativeFunctions, ...pNativeFunctions });

export default {
    getDefaultDataPath,
    isRuntimeNode,
    setNativeFunctions,
    nativeFunctions
};
