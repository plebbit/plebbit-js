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

const _parseJsonFields = (obj: any) => {
    if (!(obj instanceof Object)) return obj;
    const newObj = { ...obj };
    const booleanFields = ["deleted", "spoiler", "pinned", "locked", "removed"];
    for (const field in newObj) {
        if (booleanFields.includes(field) && typeof newObj[field] === "number") newObj[field] = Boolean(newObj[field]);
        if (typeof newObj[field] === "string")
            try {
                newObj[field] = typeof JSON.parse(newObj[field]) === "object" ? JSON.parse(newObj[field]) : newObj[field];
            } catch {}
        if (newObj[field]?.constructor?.name === "Object") newObj[field] = _parseJsonFields(newObj[field]);
    }
    return <any>newObj;
};
export const getDefaultSubplebbitDbConfig = async (
    subplebbit: Pick<Subplebbit, "address"> & { plebbit: Pick<Plebbit, "dataPath"> }
): Promise<Knex.Config<any>> => {
    assert(typeof subplebbit.plebbit.dataPath === "string", "plebbit.dataPath need to be defined to get default subplebbit db config");
    const dbPath = path.join(subplebbit.plebbit.dataPath, "subplebbits", subplebbit.address);
    await mkdir(path.dirname(dbPath), { recursive: true });

    const filename = process.env["DB_MEMORY"] === "1" ? ":memory:" : dbPath;

    return {
        client: "sqlite3",
        connection: { filename },
        useNullAsDefault: true,
        acquireConnectionTimeout: 120000,
        postProcessResponse: (result, queryContext) => {
            // TODO: add special case for raw results
            // (depends on dialect)
            return _parseJsonFields(result);
        }
    };
};

export const nativeFunctions: NativeFunctions = nodeNativeFunctions;
export const setNativeFunctions = (newNativeFunctions: Partial<NativeFunctions>) => {
    if (!newNativeFunctions) throw Error(`User passed an undefined object to setNativeFunctions`);
    for (const i in newNativeFunctions) nativeFunctions[i] = newNativeFunctions[i];
};

export default {
    getDefaultDataPath,
    nativeFunctions,
    setNativeFunctions,
    mkdir
};
