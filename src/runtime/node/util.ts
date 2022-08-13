import path from "path";
import { promises as fs } from "fs";
import { pendingSubplebbitCreations, Plebbit } from "../../plebbit";
import assert from "assert";

export const getDefaultDataPath = () => path.join(process.cwd(), ".plebbit");

export const listSubplebbits = async (plebbit: Plebbit) => {
    assert(plebbit.dataPath, "plebbit.dataPath is needed to list subplebbits");
    const subplebbitsPath = path.join(plebbit.dataPath, "subplebbits");

    await fs.mkdir(subplebbitsPath, { recursive: true });

    const addresses = (await fs.readdir(subplebbitsPath)).filter(
        (address: string) => !Boolean(pendingSubplebbitCreations[address]) && !address.includes("journal")
    );

    return addresses;
};

export const isRuntimeNode = true;

export default {
    getDefaultDataPath,
    listSubplebbits,
    isRuntimeNode
};
