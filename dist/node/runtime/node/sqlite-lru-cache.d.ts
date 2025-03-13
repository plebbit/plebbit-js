export interface SqliteCacheConfiguration {
    /**
     * Database file path or `:memory:` for in-memory database.
     */
    readonly database: string;
    /**
     * Default maximum time-to-live in milliseconds. Cache entries will be evicted after this time.
     * Can be overridden by `ttlMs` option in `set` method.
     * @default undefined - no ttl
     */
    readonly defaultTtlMs?: number;
    /**
     * Maximum number of items in the cache. Cache entries with oldest access time will be evicted after this number is reached.
     * @default undefined - no limit
     */
    readonly maxItems?: number;
    /**
     * The name of the cache table in the database
     */
    readonly cacheTableName: string;
}
export declare class SqliteCache<TData = any> {
    private readonly db;
    private _config;
    private readonly checkInterval;
    private isClosed;
    constructor(configuration: SqliteCacheConfiguration);
    /**
     * Get cache item by it's key.
     */
    get<T = TData>(key: string): Promise<T | undefined>;
    /**
     * Updates cache item by key or creates new one if it doesn't exist.
     */
    set<T = TData>(key: string, value: T, opts?: {
        ttlMs?: number;
    }): Promise<void>;
    /**
     * Remove specific item from the cache.
     */
    delete(key: string): Promise<void>;
    /**
     * Remove all items from the cache.
     */
    clear(): Promise<void>;
    /**
     * Close database and cleanup resources.
     */
    close(): Promise<void>;
    private checkForExpiredItems;
}
export default SqliteCache;
