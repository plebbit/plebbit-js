import { CacheInterface } from "../../types";
import { Plebbit } from "../../plebbit";
export default class Cache implements CacheInterface {
    private _plebbit;
    private _store;
    constructor(plebbit: Plebbit);
    init(): Promise<void>;
    getItem(key: string): Promise<any>;
    setItem(key: string, value: any): Promise<void>;
    removeItem(key: string): Promise<boolean>;
    clear(): Promise<void>;
    keys(): Promise<string[]>;
}
