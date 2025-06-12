import { EventEmitter } from "events";
import { Database as BetterSqlite3Database } from "better-sqlite3";
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
/**
 * A KeyvStoreAdapter implementation using better-sqlite3 directly
 */
export declare class KeyvBetterSqlite3 extends EventEmitter {
    ttlSupport: boolean;
    opts: KeyvBetterSqlite3Options & {
        dialect: string;
        url: string;
    };
    namespace?: string;
    db: BetterSqlite3Database;
    constructor(db: BetterSqlite3Database, options?: KeyvBetterSqlite3Options);
    /**
     * Get a value from the store
     */
    get<Value>(key: string): Promise<Value | undefined>;
    /**
     * Get multiple values from the store
     */
    getMany<Value>(keys: string[]): Promise<Array<Value | undefined>>;
    /**
     * Set a value in the store
     */
    set(key: string, value: any, ttl?: number): Promise<any>;
    /**
     * Delete a value from the store
     */
    delete(key: string): Promise<boolean>;
    /**
     * Delete multiple values from the store
     */
    deleteMany(keys: string[]): Promise<boolean>;
    /**
     * Clear all values from the store
     */
    clear(): Promise<void>;
    /**
     * Check if a key exists in the store
     */
    has(key: string): Promise<boolean>;
    /**
     * Iterate over all values in the store
     * Note: Even though better-sqlite3 is synchronous, we need to keep this
     * as an async generator to comply with the KeyvStoreAdapter interface
     */
    iterator<Value>(namespace?: string): AsyncGenerator<[string, Value], void, unknown>;
    /**
     * Disconnect from the store
     */
    disconnect(): Promise<void>;
}
export default KeyvBetterSqlite3;
