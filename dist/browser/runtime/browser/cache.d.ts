import { CacheInterface } from "../../types";
export default class Cache implements CacheInterface {
    private _plebbit;
    private _store;
    constructor(plebbit: Cache["_plebbit"]);
    toJSON(): any;
    init(): Promise<void>;
    getItem(key: string): Promise<any>;
    setItem(key: string, value: any): Promise<void>;
    removeItem(key: string): Promise<boolean>;
    clear(): Promise<void>;
    keys(): Promise<string[]>;
}
