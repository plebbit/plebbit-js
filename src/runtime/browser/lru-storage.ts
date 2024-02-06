import { LRUStorageConstructor, LRUStorageInterface } from "../../types.js";
import { createInstance as CreateLocalForageLRU } from "./localforage-lru.js";

// Storing items that will be evicted based on LRU

export default class LRUStorage implements LRUStorageInterface {
    private _opts: LRUStorageConstructor;
    private _cache: ReturnType<typeof CreateLocalForageLRU>;

    constructor(opts: LRUStorageConstructor) {
        this._opts = opts;
        if (typeof this._opts.maxItems !== "number") throw Error("Invalid paramters for LRU storage");
    }

    toJSON() {
        return undefined;
    }

    async init() {
        this._cache = CreateLocalForageLRU({
            name: this._opts.cacheName,
            size: this._opts.maxItems
        });
    }
    async getItem(key: string): Promise<any | undefined> {
        return this._cache.getItem(key);
    }

    async setItem(key: string, value: any) {
        return this._cache.setItem(key, value);
    }

    async removeItem(key: string) {
        await this._cache.removeItem(key);
        return true;
    }

    async clear() {
        return this._cache.clear();
    }

    async keys(): Promise<string[]> {
        return this._cache.keys();
    }

    async destroy() {}
}
