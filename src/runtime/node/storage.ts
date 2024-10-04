import { Plebbit } from "../../plebbit/plebbit.js";
import { StorageInterface } from "../../types.js";
import path from "path";
import fs from "fs";
import Keyv from "keyv";

// Storage is for long term items, no eviction based on ttl or anything like that
export default class Storage implements StorageInterface {
    private _plebbit: Pick<Plebbit, "dataPath" | "noData">;
    private _keyv!: Keyv;
    constructor(plebbit: Storage["_plebbit"]) {
        this._plebbit = plebbit;
    }

    toJSON() {
        return undefined;
    }

    async init() {
        if (this._plebbit.noData || !this._plebbit.dataPath) {
            this._keyv = new Keyv(`sqlite://:memory:`);
        } else {
            fs.mkdirSync(this._plebbit.dataPath, { recursive: true });
            const dbPath = path.join(this._plebbit.dataPath, "storage");
            this._keyv = new Keyv(`sqlite://${dbPath}`);
        }
    }
    async getItem(key: string): Promise<any> {
        return this._keyv.get(key);
    }

    async setItem(key: string, value: any) {
        await this._keyv.set(key, value);
    }

    async removeItem(key: string) {
        return this._keyv.delete(key);
    }

    async clear() {
        await this._keyv.clear();
    }

    async keys(): Promise<string[]> {
        const keys = [];
        for await (const [key, value] of this._keyv.iterator()) keys.push(key);
        return keys;
    }

    async destroy() {
        await this._keyv.disconnect();
    }
}
