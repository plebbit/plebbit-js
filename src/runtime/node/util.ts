import path from "path";

export const getDefaultDataPath = () => path.join(process.cwd(), ".plebbit");

export default {
    getDefaultDataPath
};
