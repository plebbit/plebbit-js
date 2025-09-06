import http from "node:http";
import https from "node:https";
import path from "node:path";
import fs from "node:fs/promises";
import Logger from "@plebbit/plebbit-logger";
import * as remeda from "remeda";
import retry from "retry";
import { Plebbit } from "../../plebbit/plebbit.js";
import { hideClassPrivateProps } from "../../util.js";
import { RoutingQueryEvent } from "kubo-rpc-client";
const debug = Logger("plebbit-js:addresses-rewriter");

type AddressesRewriterOptions = {
    kuboClients: Plebbit["clients"]["kuboRpcClients"][string]["_client"][];
    port: number;
    hostname: string | undefined;
    proxyTargetUrl: string;
    plebbit: Pick<Plebbit, "_storage" | "dataPath">;
};

type RequestLogEntry = {
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

export class AddressesRewriterProxyServer {
    addresses: Record<string, string[]>; // Peer id => addresses
    kuboClients: AddressesRewriterOptions["kuboClients"];
    port: number;
    hostname: string;
    proxyTarget: URL;
    server: ReturnType<(typeof http)["createServer"]>;
    _storageKeyName: string;
    _plebbit: Pick<Plebbit, "_storage" | "dataPath">;

    // Request logging
    private _requestLogBuffer: RequestLogEntry[] = [];
    private _lastLogWriteTime: number = Date.now();
    private _logWriteInterval!: ReturnType<typeof setInterval>;
    private _logFilePath: string;
    private _isWritingLogs = false;

    // Failed keys retry logic
    private _failedKeys: Set<string> = new Set();
    private _failedKeysFilePath: string;
    private _retryInterval!: ReturnType<typeof setInterval>;
    private _isWritingFailedKeys = false;

    private _updateAddressesInterval!: ReturnType<typeof setInterval>;

    // HTTP agents for connection reuse
    private _httpAgent: http.Agent;
    private _httpsAgent: https.Agent;
    constructor({ kuboClients: kuboClient, port, hostname, proxyTargetUrl, plebbit }: AddressesRewriterOptions) {
        this.addresses = {};

        this.kuboClients = kuboClient;
        this.port = port;
        this.hostname = hostname || "127.0.0.1";
        this.proxyTarget = new URL(proxyTargetUrl);
        this.server = http.createServer((req, res) => this._proxyRequestRewrite(req, res));
        this._storageKeyName = `httprouter_proxy_${proxyTargetUrl}`;
        this._plebbit = plebbit;

        // Initialize log file path
        this._logFilePath = this._initializeLogFilePath();

        // Initialize failed keys file path
        this._failedKeysFilePath = this._initializeFailedKeysFilePath();

        // Create HTTP agents with connection pooling and keep-alive
        this._httpAgent = new http.Agent({
            keepAlive: true,
            keepAliveMsecs: 30000,
            maxSockets: 50,
            timeout: 10000
        });

        this._httpsAgent = new https.Agent({
            keepAlive: true,
            keepAliveMsecs: 30000,
            maxSockets: 50,
            timeout: 10000
        });

        hideClassPrivateProps(this);
    }

    async listen(callback?: () => void) {
        await this._startUpdateAddressesLoop();
        this._startRequestLogging();
        await this._startFailedKeysRetry();
        this.server.on("error", (err) =>
            debug.error("Error with address rewriter proxy", this.server.address(), "Proxy target", this.proxyTarget, err)
        );
        this.server.listen(this.port, this.hostname, callback);
        debug(
            "Addresses rewriter proxy at",
            this.hostname + ":" + this.port,
            "started listening to forward requests to",
            this.proxyTarget.host,
            "- request logging to",
            this._logFilePath
        );
        await this._plebbit._storage.setItem(this._storageKeyName, `http://${this.hostname}:${this.port}`);
    }

    async destroy() {
        this.server.close();
        clearInterval(this._updateAddressesInterval);
        clearInterval(this._logWriteInterval);
        clearInterval(this._retryInterval);

        // Write any remaining logs before destroying
        await this._writeRequestLogs();

        // Destroy HTTP agents to clean up connections
        this._httpAgent.destroy();
        this._httpsAgent.destroy();

        await this._plebbit._storage.removeItem(this._storageKeyName);
    }

    _proxyRequestRewrite(req: Parameters<http.RequestListener>[0], res: Parameters<http.RequestListener>[1]) {
        // get post body
        let reqBody = "";

        req.on("data", (chunk) => {
            reqBody += chunk.toString();
        });

        // wait for full post body
        req.on("end", () => {
            // Only track and rewrite PUT/POST requests (provider registration)
            const shouldRewrite = req.method === "PUT" || req.method === "POST";

            // Create request log entry for PUT/POST requests
            let requestLogEntry: RequestLogEntry | null = null;
            if (shouldRewrite) {
                const keys = this._extractKeysFromRequestBody(reqBody);
                if (keys.length > 0) {
                    requestLogEntry = {
                        keys,
                        receivedAt: Date.now(),
                        success: false,
                        method: req.method || "UNKNOWN",
                        url: req.url || "/",
                        retryCount: 0
                    };
                    this._requestLogBuffer.push(requestLogEntry);
                }
            }

            // rewrite body with up to date addresses (only for PUT/POST)
            let rewrittenBody = reqBody;
            if (shouldRewrite && rewrittenBody) {
                try {
                    const json = JSON.parse(rewrittenBody);
                    if (json.Providers && Array.isArray(json.Providers)) {
                        for (const provider of json.Providers) {
                            const peerId = provider?.Payload?.ID;
                            if (peerId && this.addresses[peerId]) {
                                provider.Payload.Addrs = this.addresses[peerId];
                            }
                        }
                        rewrittenBody = JSON.stringify(json);
                    }
                } catch (e) {
                    const error = <Error>e;
                    debug("proxy body rewrite error:", error, "body", rewrittenBody, req.url, req.method);
                }
            }

            // proxy the request
            this._proxyRequest(req, res, rewrittenBody, requestLogEntry);
        });

        // Handle client disconnect
        req.on("close", () => {
            debug.trace("Client connection closed", req.url, req.method, req.headers, reqBody);
        });

        // Handle request errors
        req.on("error", (err) => {
            debug.trace("Request error:", req.url, req.method, req.headers, reqBody, err);
            if (!res.headersSent) {
                debug.error("Request error:", req.url, req.method, req.headers, reqBody, err);
                res.writeHead(500);
                res.end("Internal Server Error");
            }
        });
    }

    private _proxyRequest(
        req: Parameters<http.RequestListener>[0],
        res: Parameters<http.RequestListener>[1],
        rewrittenBody: string,
        requestLogEntry: RequestLogEntry | null
    ) {
        if (requestLogEntry) {
            requestLogEntry.retryCount = 0;
            requestLogEntry.transmittedAt = Date.now();
        }

        const { request: httpRequest } = this.proxyTarget.protocol === "https:" ? https : http;
        const agent = this.proxyTarget.protocol === "https:" ? this._httpsAgent : this._httpAgent;

        const requestOptions: Exclude<Parameters<typeof httpRequest>[0], string> = {
            hostname: this.proxyTarget.hostname,
            protocol: this.proxyTarget.protocol,
            //@ts-expect-error
            path: req.url,
            method: req.method,
            headers: {
                ...req.headers,
                "Content-Length": Buffer.byteLength(rewrittenBody),
                "content-length": Buffer.byteLength(rewrittenBody),
                host: this.proxyTarget.host
            },
            agent,
            timeout: 10000
        };

        const proxyReq = httpRequest(requestOptions);

        // Handle timeout
        proxyReq.setTimeout(10000, () => {
            debug.trace("Proxy request timed out", requestOptions);
            if (requestLogEntry) {
                requestLogEntry.success = false;
                requestLogEntry.statusCode = 504;
                requestLogEntry.error = "Request timeout";
                // Add failed keys to retry set
                if (requestLogEntry.keys) {
                    const sizeBefore = this._failedKeys.size;
                    requestLogEntry.keys.forEach((key) => this._failedKeys.add(key));
                    const sizeAfter = this._failedKeys.size;
                    if (sizeAfter > sizeBefore) {
                        // Save to file asynchronously when new keys are added
                        this._saveFailedKeysToFile().catch((err) => debug.error("Failed to save keys:", err));
                    }
                }
            }
            proxyReq.destroy();

            if (!res.headersSent) {
                res.writeHead(504);
                res.end("Gateway Timeout");
            }
        });

        // Handle proxy request errors
        proxyReq.on("error", (e) => {
            proxyReq.destroy();

            if (requestLogEntry) {
                requestLogEntry.success = false;
                requestLogEntry.statusCode = 500;
                requestLogEntry.error = `Proxy error: ${e.message}`;
                debug.trace(`Updated log entry with error for keys: ${requestLogEntry.keys.join(", ")}`);
                // Add failed keys to retry set
                if (requestLogEntry.keys) {
                    const sizeBefore = this._failedKeys.size;
                    requestLogEntry.keys.forEach((key) => this._failedKeys.add(key));
                    const sizeAfter = this._failedKeys.size;
                    if (sizeAfter > sizeBefore) {
                        // Save to file asynchronously when new keys are added
                        this._saveFailedKeysToFile().catch((err) => debug.error("Failed to save keys:", err));
                    }
                }
            }

            if (!res.headersSent) {
                debug.error("proxy error:", e, "Request options", requestOptions);
                res.writeHead(500);
                res.end("Internal Server Error");
            }
        });

        // Handle the proxy response
        proxyReq.on("response", (proxyRes) => {
            const statusCode = proxyRes.statusCode || 500;
            const isSuccess = statusCode >= 200 && statusCode < 300;

            if (requestLogEntry) {
                requestLogEntry.success = isSuccess;
                requestLogEntry.statusCode = statusCode;
                if (!isSuccess) {
                    requestLogEntry.error = `HTTP ${statusCode}`;
                    // Add failed keys to retry set
                    if (requestLogEntry.keys) {
                        const sizeBefore = this._failedKeys.size;
                        requestLogEntry.keys.forEach((key) => this._failedKeys.add(key));
                        const sizeAfter = this._failedKeys.size;
                        if (sizeAfter > sizeBefore) {
                            // Save to file asynchronously when new keys are added
                            this._saveFailedKeysToFile().catch((err) => debug.error("Failed to save keys:", err));
                        }
                    }
                }
            }

            // Handle proxy response errors
            proxyRes.on("error", (err) => {
                debug.error("Proxy response error:", err);
                if (!res.headersSent) {
                    res.writeHead(500);
                    res.end("Proxy Response Error");
                }
                if (requestLogEntry) {
                    requestLogEntry.success = false;
                    requestLogEntry.statusCode = 500;
                    requestLogEntry.error = `Proxy response error: ${err.message}`;
                }
                proxyRes.destroy(err);
            });

            // Forward successful response
            if (!res.headersSent) {
                res.writeHead(statusCode, proxyRes.headers);
                proxyRes.pipe(res);
            }

            res.on("finish", () => {
                proxyRes.resume();
            });
        });

        proxyReq.write(rewrittenBody);
        proxyReq.end();
    }

    // get up to date listen addresses from kubo every x minutes
    async _startUpdateAddressesLoop() {
        if (!this.kuboClients?.length) throw Error("should have a defined kubo rpc client option to start the address rewriter");

        const isRetriableError = (error: any): boolean => {
            return error?.response?.status === 500 || error?.status === 500 || error?.statusCode === 500;
        };

        const tryUpdateAddressesForClient = async (kuboClient: Plebbit["clients"]["kuboRpcClients"][string]["_client"]): Promise<void> => {
            return new Promise((resolve) => {
                const operation = retry.operation({
                    retries: 3,
                    factor: 2,
                    minTimeout: 1000,
                    maxTimeout: 8000
                });

                operation.attempt(async (currentAttempt) => {
                    try {
                        const idRes = await kuboClient.id();
                        const swarmAddrsRes = await kuboClient.swarm.addrs();

                        const peerId: string = idRes.id.toString();
                        if (typeof peerId !== "string") throw Error("Failed to get Peer ID of kubo node");

                        const swarmListeningAddresses = swarmAddrsRes.filter((swarmAddr) => swarmAddr.id.toString() === peerId);

                        const addresses: string[] = remeda.unique([
                            ...idRes.addresses.map((addr) => addr.toString()),
                            ...remeda.flatten(swarmListeningAddresses.map((swarmAddr) => swarmAddr.addrs.map((addr) => addr.toString())))
                        ]);

                        this.addresses[peerId] = addresses;
                        resolve();
                    } catch (e) {
                        const error = <Error>e;

                        if (isRetriableError(error)) {
                            debug(`tryUpdateAddresses attempt ${currentAttempt}/4 failed with 500 error:`, error.message, {
                                kuboConfig: kuboClient.getEndpointConfig()
                            });
                            if (operation.retry(error)) return;
                        }

                        debug("tryUpdateAddresses error:", error.message, { kuboConfig: kuboClient.getEndpointConfig() });
                        resolve(); // Don't reject, just log and continue with other clients
                    }
                });
            });
        };

        const tryUpdateAddresses = async () => {
            const promises = this.kuboClients.map(tryUpdateAddressesForClient);
            await Promise.allSettled(promises);
        };
        await tryUpdateAddresses();
        this._updateAddressesInterval = setInterval(tryUpdateAddresses, 1000 * 60);
    }

    private _initializeLogFilePath(): string {
        if (!this._plebbit.dataPath) {
            throw new Error("plebbit.dataPath must be defined for request logging");
        }

        // Get kubo client hostname:port (use first one)
        const kuboConfig = this.kuboClients?.[0]?.getEndpointConfig();
        let kuboIdentifier = "unknown";
        if (kuboConfig && typeof kuboConfig === "object" && "host" in kuboConfig && "port" in kuboConfig) {
            kuboIdentifier = `${kuboConfig.host}_${kuboConfig.port}`;
        }

        // Get proxy target hostname:port
        const proxyIdentifier = `${this.proxyTarget.hostname}_${this.proxyTarget.port || (this.proxyTarget.protocol === "https:" ? "443" : "80")}`;

        const fileName = `${kuboIdentifier}_${proxyIdentifier}.json`;
        return path.join(this._plebbit.dataPath, ".address-rewriter", fileName);
    }

    private _initializeFailedKeysFilePath(): string {
        if (!this._plebbit.dataPath) {
            throw new Error("plebbit.dataPath must be defined for failed keys storage");
        }

        // Get kubo client hostname:port (use first one)
        const kuboConfig = this.kuboClients?.[0]?.getEndpointConfig();
        let kuboIdentifier = "unknown";
        if (kuboConfig && typeof kuboConfig === "object" && "host" in kuboConfig && "port" in kuboConfig) {
            kuboIdentifier = `${kuboConfig.host}_${kuboConfig.port}`;
        }

        // Get proxy target hostname:port
        const proxyIdentifier = `${this.proxyTarget.hostname}_${this.proxyTarget.port || (this.proxyTarget.protocol === "https:" ? "443" : "80")}`;

        const fileName = `failed_keys_${kuboIdentifier}_${proxyIdentifier}.json`;
        return path.join(this._plebbit.dataPath, ".address-rewriter", fileName);
    }

    private _extractKeysFromRequestBody(body: string): string[] {
        try {
            const json = JSON.parse(body);
            const keys: string[] = [];
            if (json.Providers && Array.isArray(json.Providers)) {
                for (const provider of json.Providers) {
                    if (provider?.Payload?.Keys) {
                        keys.push(...provider.Payload.Keys);
                    }
                }
            }
            return keys;
        } catch {
            return [];
        }
    }

    private async _writeRequestLogs(): Promise<void> {
        if (this._requestLogBuffer.length === 0 || this._isWritingLogs) {
            return;
        }

        this._isWritingLogs = true;
        const logsToWrite = [...this._requestLogBuffer];
        this._requestLogBuffer = []; // Clear buffer immediately to prevent duplicates

        try {
            // Ensure directory exists
            const logDir = path.dirname(this._logFilePath);
            await fs.mkdir(logDir, { recursive: true });

            // Read existing logs if file exists
            let existingLogs: RequestLogEntry[] = [];
            try {
                const existingData = await fs.readFile(this._logFilePath, "utf8");
                existingLogs = JSON.parse(existingData);
            } catch {
                // File doesn't exist or is invalid, start fresh
            }

            // Append new logs
            const allLogs = [...existingLogs, ...logsToWrite];

            // Write back to file
            await fs.writeFile(this._logFilePath, JSON.stringify(allLogs, null, 2));

            this._lastLogWriteTime = Date.now();
            debug.trace(`Wrote ${logsToWrite.length} new request log entries (${allLogs.length} total) to ${this._logFilePath}`);
        } catch (error) {
            debug.error(`Failed to write request logs to ${this._logFilePath}:`, error);
            // Put logs back in buffer on failure
            this._requestLogBuffer.unshift(...logsToWrite);
        } finally {
            this._isWritingLogs = false;
        }
    }

    private _startRequestLogging() {
        const writeInterval = 5 * 1000; // 5 seconds
        this._logWriteInterval = setInterval(async () => {
            await this._writeRequestLogs();
        }, writeInterval);
    }

    private async _startFailedKeysRetry() {
        // Load failed keys from file on startup
        await this._loadFailedKeysFromFile();

        // Start 2-minute interval for retrying failed keys
        const retryInterval = 2 * 60 * 1000; // 2 minutes
        this._retryInterval = setInterval(async () => {
            await this._retryFailedKeys();
        }, retryInterval);

        debug(`Started failed keys retry with ${this._failedKeys.size} keys from previous sessions`);
    }

    private async _loadFailedKeysFromFile() {
        try {
            const data = await fs.readFile(this._failedKeysFilePath, "utf8");
            const keys = JSON.parse(data);
            if (Array.isArray(keys)) {
                keys.forEach((key) => this._failedKeys.add(key));
            }
            debug(`Loaded ${keys.length} failed keys from file`);
        } catch (error) {
            // File doesn't exist or is corrupted, start with empty set
            debug("No existing failed keys file found, starting fresh");
        }
    }

    private async _saveFailedKeysToFile() {
        if (this._isWritingFailedKeys) {
            debug.trace("Skipping failed keys write - already in progress");
            return;
        }

        this._isWritingFailedKeys = true;
        try {
            await fs.mkdir(path.dirname(this._failedKeysFilePath), { recursive: true });
            const keys = Array.from(this._failedKeys);
            await fs.writeFile(this._failedKeysFilePath, JSON.stringify(keys, null, 2));
            if (keys.length === 0) {
                debug(`All keys successfully provided - no failed keys to save`);
            } else {
                debug(`Saved ${keys.length} failed keys to file`);
            }
        } catch (error) {
            debug.error("Failed to save failed keys to file:", error);
        } finally {
            this._isWritingFailedKeys = false;
        }
    }

    private async _retryFailedKeys() {
        if (this._failedKeys.size === 0) {
            debug(`No failed keys to retry - all keys successfully provided`);
            return;
        }

        debug(`Retrying ${this._failedKeys.size} failed keys`);

        const keysToRetry = Array.from(this._failedKeys);
        const kuboClient = this.kuboClients?.[0];

        if (!kuboClient) {
            debug.error("No kubo client available for retry");
            return;
        }

        const successfulKeys: string[] = [];
        const stillFailedKeys: string[] = [];
        const keysToDiscard: string[] = [];

        // Process each key individually to get better granular control
        for (const key of keysToRetry) {
            try {
                debug(`Providing key to HTTP routers: ${key}`);

                const events: RoutingQueryEvent[] = [];
                for await (const event of kuboClient.routing.provide(key, { recursive: true, verbose: true })) {
                    events.push(event);
                    debug(`Routing provide event for ${key}:`, event);
                }

                successfulKeys.push(key);
                debug(`Successfully provided key: ${key}`);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                
                // If block not found locally, discard this key - no point in retrying
                if (errorMessage.includes('block') && errorMessage.includes('not found locally')) {
                    keysToDiscard.push(key);
                    debug(`Discarding key ${key} - block not found locally, will not retry`);
                } else {
                    stillFailedKeys.push(key);
                    debug.error(`Failed to provide key ${key}:`, error);
                }
            }
        }

        // Remove successful keys and keys to discard from failed set
        successfulKeys.forEach((key) => this._failedKeys.delete(key));
        keysToDiscard.forEach((key) => this._failedKeys.delete(key));

        // Save updated failed keys to file
        this._saveFailedKeysToFile().catch((err) => debug.error("Failed to save keys after retry:", err));

        debug(`Retry completed: ${successfulKeys.length} successful, ${stillFailedKeys.length} still failed, ${keysToDiscard.length} discarded`);
    }
}

// example
// const addressesRewriterProxyServer = new AddressesRewriterProxyServer({
//     plebbitOptions: { ipfsHttpClientsOptions: ["http://127.0.0.1:5001/api/v0"] },
//     port: 8888,
//     proxyTargetUrl: "https://peers.pleb.bot"
//     // proxyTargetUrl: 'http://127.0.0.1:8889',
// });
// addressesRewriterProxyServer.listen(() => {
//     debug(`addresses rewriter proxy listening on http://${addressesRewriterProxyServer.hostname}:${addressesRewriterProxyServer.port}`);
// });

/* example of how to use in plebbit-js

const httpRouterProxyUrls = []
if (isNodeJs && plebbitOptions.ipfsHttpClientsOptions?.length && plebbitOptions.httpRoutersOptions?.length) {
  let addressesRewriterStartPort = 19575 // use port 19575 as first port, looks like IPRTR (IPFS ROUTER)
  for (const httpRoutersOptions of plebbitOptions.httpRoutersOptions) {
    // launch the proxy server
    const port = addressesRewriterStartPort++
    const hostname = '127.0.0.1'
    const addressesRewriterProxyServer = new AddressesRewriterProxyServer({
      plebbitOptions: plebbitOptions,
      port, 
      hostname,
      proxyTargetUrl: httpRoutersOptions.url || httpRoutersOptions,
    })
    addressesRewriterProxyServer.listen()

    // save the proxy urls to use them later
    httpRouterProxyUrls.push(`http://${hostname}:${port}`)
  }

  // set kubo to the new routers with the proxy urls
  setKuboHttpRouterUrls(httpRouterProxyUrls)
}
*/
