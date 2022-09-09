import { promises as fs } from "fs";
import { default as nodeNativeFunctions } from "./native-functions";
import { NativeFunctions } from "../../types";
import path from "path";

export const mkdir = fs.mkdir;

export const getDefaultDataPath = () => path.join(process.cwd(), ".plebbit");

export let nativeFunctions: NativeFunctions = nodeNativeFunctions;
export const setNativeFunctions = (pNativeFunctions: Partial<NativeFunctions>) =>
    (nativeFunctions = { ...nativeFunctions, ...pNativeFunctions });

export default {
    getDefaultDataPath,
    nativeFunctions,
    setNativeFunctions,
    mkdir
};
