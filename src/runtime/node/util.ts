import { promises as fs } from "fs";
import { default as nodeNativeFunctions } from "./native-functions";
import { NativeFunctions } from "../../types";
import path from "path";
import { Subplebbit } from "../../subplebbit";
import assert from "assert";
import { Knex } from "knex";
import { Plebbit } from "../../plebbit";

export const mkdir = fs.mkdir;

export const getDefaultDataPath = () => path.join(process.cwd(), ".plebbit");

export const getDefaultSubplebbitDbConfig = async (
    subplebbit: Pick<Subplebbit, "address"> & { plebbit: Pick<Plebbit, "dataPath"> }
): Promise<Knex.Config<any>> => {
    assert(typeof subplebbit.plebbit.dataPath === "string", "plebbit.dataPath need to be defined to get deafult subplebbit db config");
    const dbPath = path.join(subplebbit.plebbit.dataPath, "subplebbits", subplebbit.address);
    const dir = path.dirname(dbPath);
    await mkdir(dir, { recursive: true });

    return {
        client: "sqlite3",
        connection: {
            filename: dbPath
        },
        useNullAsDefault: true,
        acquireConnectionTimeout: 120000
    };
};

export const nativeFunctions: NativeFunctions = nodeNativeFunctions;
export const setNativeFunctions = (newNativeFunctions: Partial<NativeFunctions>) => {
    for (const i in newNativeFunctions) nativeFunctions[i] = newNativeFunctions[i];
};

export default {
    getDefaultDataPath,
    nativeFunctions,
    setNativeFunctions,
    mkdir
};
