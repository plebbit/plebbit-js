import { Plebbit } from "../../plebbit";
import { CacheInterface } from "../../types";
import path from "path";
import fs from "fs";
import Keyv from "keyv";

export default class Cache implements CacheInterface {
    private _plebbit: Pick<Plebbit, "dataPath">;
    private _keyv: Keyv;
    constructor(plebbit: Cache["_plebbit"]) {
        this._plebbit = plebbit;
    }

    toJSON() {
        return undefined;
    }

    async init() {
        fs.mkdirSync(this._plebbit.dataPath, { recursive: true });
        const dbPath = path.join(this._plebbit.dataPath, "cache");
        const dbConfig = {
            client: "sqlite3",
            connection: { filename: dbPath },
            useNullAsDefault: true
        };
        this._keyv = new Keyv(`sqlite://${dbConfig.connection.filename}`);
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
}
