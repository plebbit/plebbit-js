import path from "path";
import { promises as fs } from "fs";
import { Plebbit } from "../../plebbit";

export const getDefaultDataPath = () => path.join(process.cwd(), ".plebbit");

export const listSubplebbits = async (plebbit: Plebbit) => {
    const subplebbitsPath = path.join(plebbit.dataPath, "subplebbits");
    const addresses = await fs.readdir(subplebbitsPath);
    return addresses;
};

export default {
    getDefaultDataPath,
    listSubplebbits
};
