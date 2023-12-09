import { LRUStorageConstructor, LRUStorageInterface } from "../../types";
export default class LRUStorage implements LRUStorageInterface {
    private _opts;
    private _cache;
    constructor(opts: LRUStorageConstructor);
    toJSON(): any;
    init(): Promise<void>;
    getItem(key: string): Promise<any | undefined>;
    setItem(key: string, value: any): Promise<void>;
    removeItem(key: string): Promise<boolean>;
    clear(): Promise<void>;
    keys(): Promise<string[]>;
    destroy(): Promise<void>;
}
