import { Plebbit } from "../../plebbit";
export declare const getDefaultDataPath: () => string;
export declare const listSubplebbits: (plebbit: Plebbit) => Promise<string[]>;
export declare const isRuntimeNode = true;
declare const _default: {
    getDefaultDataPath: () => string;
    listSubplebbits: (plebbit: Plebbit) => Promise<string[]>;
    isRuntimeNode: boolean;
};
export default _default;
