import localForage from "localforage";
import { StorageInterface } from "../../types";
import { Plebbit } from "../../plebbit";
import lodash from "lodash";

export default class Cache implements StorageInterface {
    private _plebbit: Pick<Plebbit, "dataPath" | "noData">;
    private _store: LocalForage;
    constructor(plebbit: Cache["_plebbit"]) {
        this._plebbit = plebbit;
    }

    toJSON() {
        return undefined;
    }

    async init() {
        const cacheName = this._plebbit.noData ? lodash.uniqueId() : "plebbit-cache";
        this._store = localForage.createInstance({
            name: cacheName
        });
    }
    async getItem(key: string): Promise<any> {
        return this._store.getItem(key);
    }

    async setItem(key: string, value: any) {
        await this._store.setItem(key, value);
    }

    async removeItem(key: string) {
        await this._store.removeItem(key);
        return true;
    }

    async clear() {
        await this._store.clear();
    }

    async keys(): Promise<string[]> {
        return await this._store.keys();
    }
}
