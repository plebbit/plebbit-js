import path from "path";
import { promises as fs } from "fs";
import { default as nodeNativeFunctions } from "./native-functions";
import { NativeFunctions } from "../../types";

export const getDefaultDataPath = () => path.join(process.cwd(), ".plebbit");

export const mkdir = fs.mkdir;

export const isRuntimeNode = true;

export let nativeFunctions: NativeFunctions = nodeNativeFunctions;
export const setNativeFunctions = (pNativeFunctions: Partial<NativeFunctions>) =>
    (nativeFunctions = { ...nativeFunctions, ...pNativeFunctions });

export default {
    getDefaultDataPath,
    isRuntimeNode,
    nativeFunctions,
    setNativeFunctions
};
