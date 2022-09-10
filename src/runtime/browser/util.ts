import { NativeFunctions } from "../../types";
import { default as browserNativeFunctions } from "./native-functions";

export const getDefaultDataPath = () => undefined;

export const mkdir = () => undefined;

export const nativeFunctions: NativeFunctions = browserNativeFunctions;
export const setNativeFunctions = (newNativeFunctions: Partial<NativeFunctions>) => {
    for (const i in newNativeFunctions) nativeFunctions[i] = newNativeFunctions[i];
};
export default {
    getDefaultDataPath,
    setNativeFunctions,
    nativeFunctions,
    mkdir
};
