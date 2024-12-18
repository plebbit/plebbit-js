import { StorageInterface } from "../../types.js";
export default class Storage implements StorageInterface {
    private _plebbit;
    private _keyv;
    constructor(plebbit: Storage["_plebbit"]);
    toJSON(): undefined;
    init(): Promise<void>;
    getItem(key: string): Promise<any>;
    setItem(key: string, value: any): Promise<void>;
    removeItem(key: string): Promise<boolean>;
    clear(): Promise<void>;
    keys(): Promise<string[]>;
    destroy(): Promise<void>;
}
