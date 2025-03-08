import { Plebbit } from "../../plebbit/plebbit.js";
import { StorageInterface } from "../../types.js";
import path from "path";
import fs from "fs";
import Keyv from "keyv";
import KeyvSqlite from "@keyv/sqlite";
import { PlebbitError } from "../../plebbit-error.js";
import { hideClassPrivateProps } from "../../util.js";

// Storage is for long term items, no eviction based on ttl or anything like that
export default class Storage implements StorageInterface {
    private _plebbit: Plebbit;
    private _keyv!: Keyv;
    constructor(plebbit: Storage["_plebbit"]) {
        this._plebbit = plebbit;
        hideClassPrivateProps(this);
    }

    toJSON() {
        return undefined;
    }

    async init() {
        let sqlitePath: string;
        if (this._plebbit.noData || !this._plebbit.dataPath) {
            sqlitePath = `sqlite://:memory:`;
        } else {
            fs.mkdirSync(this._plebbit.dataPath, { recursive: true });
            sqlitePath = `sqlite://${path.join(this._plebbit.dataPath, "storage")}`;
        }
        this._keyv = new Keyv(new KeyvSqlite(sqlitePath));

        this._keyv.on("error", (err) => {
            const error = new PlebbitError("ERR_PLEBBIT_SQLITE_LONG_TERM_STORAGE_KEYV_ERROR", { err, sqlitePath });
            console.error("Error in Keyv", err);
            this._plebbit.emit("error", error);
        });
    }
    async getItem(key: string): Promise<any> {
        return this._keyv.get(key);
    }

    async setItem(key: string, value: any) {
        await this._keyv.set(key, value);
    }

    async removeItem(key: string | string[]) {
        return this._keyv.delete(key);
    }

    async clear() {
        await this._keyv.clear();
    }

    async destroy() {
        await this._keyv.disconnect();
    }
}
