import { promises as fs } from "fs";
import { default as nodeNativeFunctions } from "./native-functions";
import { NativeFunctions } from "../../types";

export const mkdir = fs.mkdir;

export const isRuntimeNode = true;

export let nativeFunctions: NativeFunctions = nodeNativeFunctions;
export const setNativeFunctions = (pNativeFunctions: Partial<NativeFunctions>) =>
    (nativeFunctions = { ...nativeFunctions, ...pNativeFunctions });

export default {
    isRuntimeNode,
    nativeFunctions,
    setNativeFunctions
};
