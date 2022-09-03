import { NativeFunctions } from "../../types";

// the browser has no data path
export const getDefaultDataPath = () => undefined;
export const isRuntimeNode = false;
export let nativeFunctions: NativeFunctions;
export const setNativeFunctions = (pNativeFunctions) => (nativeFunctions = pNativeFunctions);

export default {
    getDefaultDataPath,
    isRuntimeNode,
    setNativeFunctions,
    nativeFunctions
};
