export type RequestLogEntry = {
    keys: string[];
    receivedAt: number;
    transmittedAt?: number;
    success: boolean;
    statusCode?: number;
    method: string;
    url: string;
    error?: string;
    retryCount?: number;
};
export type ReprovideLogEntry = {
    key: string;
    timestamp: number;
    success: boolean;
    error?: string;
    blockNotLocal?: boolean;
};
export declare class AddressRewriterDatabase {
    private _db;
    private _dbPath;
    constructor(dataPath: string, kuboConfig: any, proxyTarget: URL);
    private _initializeDbPath;
    initialize(): Promise<void>;
    close(): void;
    insertRequestLogs(logs: RequestLogEntry[]): void;
    insertReprovideLog(key: string, success: boolean, error?: string, blockNotLocal?: boolean): void;
    loadFailedKeys(): string[];
    saveFailedKeys(keys: string[]): void;
}
