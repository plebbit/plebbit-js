import { NativeFunctions } from "../../types";
import { default as browserNativeFunctions } from "./native-functions";

export const getDefaultDataPath = () => undefined;

export const mkdir = () => undefined;

export let nativeFunctions: NativeFunctions = browserNativeFunctions;
export const setNativeFunctions = (pNativeFunctions: Partial<NativeFunctions>) =>
    (nativeFunctions = { ...nativeFunctions, ...pNativeFunctions });

export default {
    getDefaultDataPath,
    setNativeFunctions,
    nativeFunctions,
    mkdir
};
