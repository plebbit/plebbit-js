import localForage from "localforage";
import lodash from "lodash";
// Storage is for long term items, no eviction based on ttl or anything like that
export default class Storage {
    constructor(plebbit) {
        this._plebbit = plebbit;
    }
    toJSON() {
        return undefined;
    }
    async init() {
        const storageName = this._plebbit.noData ? lodash.uniqueId() : "plebbitjs_storage";
        this._store = localForage.createInstance({
            name: storageName
        });
    }
    async getItem(key) {
        return this._store.getItem(key);
    }
    async setItem(key, value) {
        await this._store.setItem(key, value);
    }
    async removeItem(key) {
        await this._store.removeItem(key);
        return true;
    }
    async clear() {
        await this._store.clear();
    }
    async keys() {
        return await this._store.keys();
    }
    async destroy() { }
}
//# sourceMappingURL=storage.js.map