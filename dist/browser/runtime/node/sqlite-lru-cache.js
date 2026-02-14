import Database from "better-sqlite3";
import cbor from "cbor";
import debounce from "debounce";
import * as remeda from "remeda";
async function initSqliteCache(configuration) {
    const db = new Database(configuration.database, {});
    db.transaction(() => {
        db.prepare(`CREATE TABLE IF NOT EXISTS ${configuration.cacheTableName} (
        key TEXT PRIMARY KEY,
        value BLOB,
        expires INT,
        lastAccess INT
      )`).run();
        db.prepare(`CREATE UNIQUE INDEX IF NOT EXISTS key ON ${configuration.cacheTableName} (key)`).run();
        db.prepare(`CREATE INDEX IF NOT EXISTS expires ON ${configuration.cacheTableName} (expires)`).run();
        db.prepare(`CREATE INDEX IF NOT EXISTS lastAccess ON ${configuration.cacheTableName} (lastAccess)`).run();
    })();
    return {
        db,
        getStatement: db.prepare(`UPDATE OR IGNORE ${configuration.cacheTableName}
      SET lastAccess = @now
      WHERE key = @key AND (expires > @now OR expires IS NULL)
      RETURNING value`),
        setStatement: db.prepare(`INSERT OR REPLACE INTO ${configuration.cacheTableName}
      (key, value, expires, lastAccess) VALUES (@key, @value, @expires, @now)`),
        deleteStatement: db.prepare(`DELETE FROM ${configuration.cacheTableName} WHERE key = @key`),
        clearStatement: db.prepare(`DELETE FROM ${configuration.cacheTableName}`),
        cleanupExpiredStatement: db.prepare(`
      DELETE FROM ${configuration.cacheTableName} WHERE expires < @now
    `),
        cleanupLruStatement: db.prepare(`
      WITH lru AS (SELECT key FROM ${configuration.cacheTableName} ORDER BY lastAccess DESC LIMIT -1 OFFSET @maxItems)
      DELETE FROM ${configuration.cacheTableName} WHERE key IN lru
    `)
    };
}
function now() {
    return Date.now();
}
export class SqliteCache {
    constructor(configuration) {
        this.isClosed = false;
        this.checkForExpiredItems = debounce(async () => {
            if (this.isClosed) {
                return;
            }
            try {
                const db = await this.db;
                db.cleanupExpiredStatement.run({ now: now() });
                if (this._config.maxItems) {
                    db.cleanupLruStatement.run({
                        maxItems: this._config.maxItems
                    });
                }
            }
            catch (ex) {
                console.error("Error in cache-sqlite-lru-ttl when checking for expired items", ex);
            }
        }, 100, true);
        this._config = configuration;
        this.db = initSqliteCache(configuration);
        this.checkInterval = setInterval(this.checkForExpiredItems, 1000);
    }
    /**
     * Get cache item by it's key.
     */
    async get(key) {
        if (this.isClosed) {
            throw new Error("Cache is closed");
        }
        const res = (await this.db).getStatement.get({
            key,
            now: now()
        });
        if (!remeda.isPlainObject(res) || !("value" in res)) {
            return undefined;
        }
        let value = res.value;
        return cbor.decode(value);
    }
    /**
     * Updates cache item by key or creates new one if it doesn't exist.
     */
    async set(key, value, opts = {}) {
        if (this.isClosed) {
            throw new Error("Cache is closed");
        }
        const ttl = opts.ttlMs ?? opts.ttlMs;
        const expires = ttl !== undefined ? new Date(Date.now() + ttl) : undefined;
        let valueBuffer = cbor.encode(value);
        (await this.db).setStatement.run({
            key,
            value: valueBuffer,
            expires: expires?.getTime(),
            now: now()
        });
        setImmediate(this.checkForExpiredItems.bind(this));
    }
    /**
     * Remove specific item from the cache.
     */
    async delete(key) {
        if (this.isClosed) {
            throw new Error("Cache is closed");
        }
        (await this.db).deleteStatement.run({ key, now: now() });
    }
    /**
     * Remove all items from the cache.
     */
    async clear() {
        if (this.isClosed) {
            throw new Error("Cache is closed");
        }
        (await this.db).clearStatement.run({});
    }
    /**
     * Close database and cleanup resources.
     */
    async close() {
        clearInterval(this.checkInterval);
        (await this.db).db.close();
        this.isClosed = true;
    }
}
export default SqliteCache;
//# sourceMappingURL=sqlite-lru-cache.js.map