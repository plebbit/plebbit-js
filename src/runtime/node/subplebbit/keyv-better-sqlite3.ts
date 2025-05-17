import { EventEmitter } from "events";
import { Database as BetterSqlite3Database } from "better-sqlite3";
import { KeyvStoreAdapter } from "keyv";

export interface KeyvBetterSqlite3Options {
    /**
     * Table name for storage (defaults to 'keyv')
     */
    table?: string;
    /**
     * Size limit for keys (defaults to 255)
     */
    keySize?: number;
    /**
     * Whether to create the table if it doesn't exist (defaults to true)
     */
    createTable?: boolean;
}

interface KeyvRow {
    key: string;
    value: any;
    expires: number | null;
}

interface ExistsRow {
    exists_: number;
}

/**
 * A KeyvStoreAdapter implementation using better-sqlite3 directly
 */
export class KeyvBetterSqlite3 extends EventEmitter implements KeyvStoreAdapter {
    ttlSupport: boolean;
    opts: KeyvBetterSqlite3Options & {
        dialect: string;
        url: string;
    };
    namespace?: string;
    db: BetterSqlite3Database;

    constructor(db: BetterSqlite3Database, options: KeyvBetterSqlite3Options = {}) {
        super();
        this.ttlSupport = true;
        this.db = db;
        this.opts = {
            table: "keyv",
            keySize: 255,
            createTable: true,
            // These properties are needed by Keyv internals
            dialect: "sqlite",
            // Use a default URL since we don't know how to safely access the filename
            url: `sqlite://${db.name}`,
            ...options
        };

        if (this.opts.createTable) {
            try {
                // Create table with TTL support
                this.db.exec(`
          CREATE TABLE IF NOT EXISTS ${this.opts.table} (
            key TEXT PRIMARY KEY,
            value TEXT,
            expires INTEGER NULL
          )
        `);
            } catch (error) {
                throw error;
            }
        }
    }

    /**
     * Get a value from the store
     */
    get<Value>(key: string): Promise<Value | undefined> {
        try {
            const stmt = this.db.prepare(`SELECT * FROM ${this.opts.table} WHERE key = ? AND (expires IS NULL OR expires > ?)`);
            const row = stmt.get(key, Date.now()) as KeyvRow | undefined;

            if (!row) {
                return Promise.resolve(undefined);
            }

            return Promise.resolve(row.value);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get multiple values from the store
     */
    getMany<Value>(keys: string[]): Promise<Array<Value | undefined>> {
        try {
            const placeholders = keys.map(() => "?").join(",");
            const now = Date.now();
            const stmt = this.db.prepare(`
        SELECT * FROM ${this.opts.table} 
        WHERE key IN (${placeholders}) 
        AND (expires IS NULL OR expires > ?)
      `);

            const rows = stmt.all(...keys, now) as KeyvRow[];

            const results = keys.map((key) => {
                const row = rows.find((r) => r.key === key);
                return row ? row.value : undefined;
            });

            return Promise.resolve(results);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Set a value in the store
     */
    set(key: string, value: any, ttl?: number): Promise<any> {
        try {
            const expires = typeof ttl === "number" ? Date.now() + ttl : null;

            const stmt = this.db.prepare(`
        INSERT INTO ${this.opts.table} (key, value, expires)
        VALUES (?, ?, ?)
        ON CONFLICT(key) 
        DO UPDATE SET value = excluded.value, expires = excluded.expires
      `);

            const result = stmt.run(key, value, expires);
            return Promise.resolve(result);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Delete a value from the store
     */
    delete(key: string): Promise<boolean> {
        try {
            const stmt = this.db.prepare(`DELETE FROM ${this.opts.table} WHERE key = ?`);
            const result = stmt.run(key);
            return Promise.resolve(result.changes > 0);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Delete multiple values from the store
     */
    deleteMany(keys: string[]): Promise<boolean> {
        try {
            const placeholders = keys.map(() => "?").join(",");
            const stmt = this.db.prepare(`DELETE FROM ${this.opts.table} WHERE key IN (${placeholders})`);
            const result = stmt.run(...keys);
            return Promise.resolve(result.changes > 0);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Clear all values from the store
     */
    clear(): Promise<void> {
        try {
            const stmt = this.db.prepare(
                this.namespace ? `DELETE FROM ${this.opts.table} WHERE key LIKE ?` : `DELETE FROM ${this.opts.table}`
            );

            if (this.namespace) {
                stmt.run(`${this.namespace}:%`);
            } else {
                stmt.run();
            }
            return Promise.resolve();
        } catch (error) {
            throw error;
        }
    }

    /**
     * Check if a key exists in the store
     */
    has(key: string): Promise<boolean> {
        try {
            const stmt = this.db.prepare(`
        SELECT EXISTS (
          SELECT 1 FROM ${this.opts.table} 
          WHERE key = ? AND (expires IS NULL OR expires > ?)
        ) as exists_
      `);

            const result = stmt.get(key, Date.now()) as ExistsRow;
            return Promise.resolve(result.exists_ === 1);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Iterate over all values in the store
     * Note: Even though better-sqlite3 is synchronous, we need to keep this
     * as an async generator to comply with the KeyvStoreAdapter interface
     */
    async *iterator<Value>(namespace?: string): AsyncGenerator<[string, Value], void, unknown> {
        const ns = namespace || this.namespace;
        const pattern = ns ? `${ns}:%` : "%";

        try {
            const stmt = this.db.prepare(`
        SELECT key, value FROM ${this.opts.table} 
        WHERE key LIKE ? AND (expires IS NULL OR expires > ?)
      `);

            // Get all rows at once - this is synchronous in better-sqlite3
            const rows = stmt.all(pattern, Date.now()) as KeyvRow[];

            // We still need to use async iteration to meet the interface requirements
            for (const row of rows) {
                yield [row.key, row.value];
            }
        } catch (error) {
            throw error;
        }
    }

    /**
     * Disconnect from the store
     */
    disconnect(): Promise<void> {
        // The database is managed externally, so we don't close it here
        return Promise.resolve(undefined);
    }
}

/**
 * Create a new Keyv instance with a KeyvBetterSqlite3 adapter
 */
import Keyv from "keyv";

export const createKeyv = (db: BetterSqlite3Database, options?: KeyvBetterSqlite3Options) => {
    return new Keyv({ store: new KeyvBetterSqlite3(db, options) });
};

export default KeyvBetterSqlite3;
