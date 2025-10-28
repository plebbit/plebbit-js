import { LRUStorageConstructor, LRUStorageInterface } from "../../types.js";
export default class LRUStorage implements LRUStorageInterface {
    private _opts;
    private _cache;
    constructor(opts: LRUStorageConstructor);
    toJSON(): undefined;
    init(): Promise<void>;
    getItem(key: string): Promise<any | undefined>;
    setItem(key: string, value: any): Promise<void>;
    removeItem(key: string): Promise<boolean>;
    clear(): Promise<void>;
    keys(): Promise<string[]>;
    destroy(): Promise<void>;
}
