import { createInstance as CreateLocalForageLRU } from "./localforage-lru.js";
// Storing items that will be evicted based on LRU
export default class LRUStorage {
    constructor(opts) {
        this._opts = opts;
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
    async getItem(key) {
        return this._cache.getItem(key);
    }
    async setItem(key, value) {
        return this._cache.setItem(key, value);
    }
    async removeItem(key) {
        await this._cache.removeItem(key);
        return true;
    }
    async clear() {
        return this._cache.clear();
    }
    async keys() {
        return this._cache.keys();
    }
    async destroy() { }
}
//# sourceMappingURL=lru-storage.js.map