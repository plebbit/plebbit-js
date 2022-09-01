import path from "path";
import { promises as fs } from "fs";
import { pendingSubplebbitCreations } from "../../plebbit";
import assert from "assert";

export const getDefaultDataPath = () => path.join(process.cwd(), ".plebbit");

export const listSubplebbits = async (dataPath: string) => {
    const stat = await fs.lstat(dataPath);
    assert(stat.isDirectory(), `dataPath (${dataPath}) is not a directory`);
    const subplebbitsPath = path.join(dataPath, "subplebbits");

    await fs.mkdir(subplebbitsPath, { recursive: true });

    const addresses = (await fs.readdir(subplebbitsPath)).filter(
        (address: string) => !Boolean(pendingSubplebbitCreations[address]) && !address.includes("journal")
    );

    return addresses;
};

export const mkdir = fs.mkdir;

export const isRuntimeNode = true;

export default {
    getDefaultDataPath,
    listSubplebbits,
    isRuntimeNode
};
