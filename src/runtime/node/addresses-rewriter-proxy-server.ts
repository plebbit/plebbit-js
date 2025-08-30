import http from "node:http";
import https from "node:https";
import { gunzipSync } from "node:zlib";
import Logger from "@plebbit/plebbit-logger";
import * as remeda from "remeda";
import { Plebbit } from "../../plebbit/plebbit.js";
import { hideClassPrivateProps } from "../../util.js";
const debug = Logger("plebbit-js:addresses-rewriter");

type AddressesRewriterOptions = {
    kuboClients: Plebbit["clients"]["kuboRpcClients"][string]["_client"][];
    port: number;
    hostname: string | undefined;
    proxyTargetUrl: string;
    plebbit: Pick<Plebbit, "_storage">;
    statsReportIntervalMs?: number; // Default 10 minutes
};

export class AddressesRewriterProxyServer {
    addresses: Record<string, string[]>; // Peer id => addresses
    kuboClients: AddressesRewriterOptions["kuboClients"];
    port: number;
    hostname: string;
    proxyTarget: URL;
    server: ReturnType<(typeof http)["createServer"]>;
    _storageKeyName: string;
    _plebbit: Pick<Plebbit, "_storage">;

    // Connection pooling agents
    private _httpAgent: http.Agent;
    private _httpsAgent: https.Agent;

    // Stats tracking
    private _stats = {
        putPostSuccessful: 0, // 2xx PUT/POST responses
        putPostFailed: 0, // non-2xx PUT/POST responses
        putPostTotal: 0, // Total PUT/POST requests
        getSuccessful: 0, // 2xx GET responses
        getFailed: 0, // non-2xx GET responses
        getTotal: 0, // Total GET requests
        retries: 0, // Total retry attempts
        startTime: Date.now()
    };
    private _statsReportIntervalMs: number;

    private _updateAddressesInterval!: ReturnType<typeof setInterval>;
    private _statsReportInterval!: ReturnType<typeof setInterval>;
    constructor({ kuboClients: kuboClient, port, hostname, proxyTargetUrl, plebbit, statsReportIntervalMs }: AddressesRewriterOptions) {
        this.addresses = {};

        this.kuboClients = kuboClient;
        this.port = port;
        this.hostname = hostname || "127.0.0.1";
        this.proxyTarget = new URL(proxyTargetUrl);
        this.server = http.createServer((req, res) => this._proxyRequestRewrite(req, res));
        this._storageKeyName = `httprouter_proxy_${proxyTargetUrl}`;
        this._plebbit = plebbit;
        this._statsReportIntervalMs = statsReportIntervalMs || 1000 * 60 * 10; // Default 10 minutes
        
        // Initialize connection pooling agents
        this._httpAgent = new http.Agent({ 
            keepAlive: true, 
            maxSockets: 10,
            timeout: 10000 
        });
        this._httpsAgent = new https.Agent({ 
            keepAlive: true, 
            maxSockets: 10,
            timeout: 10000 
        });
        
        hideClassPrivateProps(this);
    }

    async listen(callback?: () => void) {
        await this._startUpdateAddressesLoop();
        this._startStatsReporting();
        this.server.on("error", (err) =>
            debug.error("Error with address rewriter proxy", this.server.address(), "Proxy target", this.proxyTarget, err)
        );
        this.server.listen(this.port, this.hostname, callback);
        debug(
            "Addresses rewriter proxy at",
            this.hostname + ":" + this.port,
            "started listening to forward requests to",
            this.proxyTarget.host,
            `- stats reporting every ${this._statsReportIntervalMs / 1000 / 60}min`
        );
        await this._plebbit._storage.setItem(this._storageKeyName, `http://${this.hostname}:${this.port}`);
    }

    async destroy() {
        this.server.close();
        clearInterval(this._updateAddressesInterval);
        clearInterval(this._statsReportInterval);
        
        // Destroy connection pooling agents
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

            // rewrite body with up to date addresses (only for PUT/POST)
            let rewrittenBody = reqBody;
            let addressRewriteCount = 0;
            let skippedPeerIds: string[] = [];

            if (shouldRewrite && rewrittenBody) {
                try {
                    const json = JSON.parse(rewrittenBody);
                    if (json.Providers && Array.isArray(json.Providers)) {
                        for (const provider of json.Providers) {
                            const peerId = provider?.Payload?.ID;
                            const keys = provider?.Payload?.Keys;
                            if (peerId && this.addresses[peerId]) {
                                const oldAddrs = provider.Payload.Addrs?.length || 0;
                                provider.Payload.Addrs = this.addresses[peerId];
                                addressRewriteCount++;
                                debug.trace(`Rewrote addresses for keys ${keys?.join(', ')} (${oldAddrs} -> ${this.addresses[peerId].length}) [${this.proxyTarget.host}]`);
                            } else if (peerId) {
                                skippedPeerIds.push(peerId);
                                debug(`No addresses found for peer ${peerId}, using original addresses`);
                            }
                        }
                        rewrittenBody = JSON.stringify(json);

                        if (skippedPeerIds.length > 0) {
                            debug(`Skipped address rewriting for ${skippedPeerIds.length} peers: ${skippedPeerIds.join(", ")}`);
                        }
                    }
                } catch (e) {
                    const error = <Error>e;
                    debug.error(
                        "proxy body rewrite error - continuing with original body:",
                        error.message,
                        "body length:",
                        rewrittenBody.length,
                        req.url,
                        req.method
                    );
                }
            }

            // proxy the request with retry logic
            this._makeProxyRequestWithRetry(req, res, rewrittenBody, shouldRewrite, 0);

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

    private _makeProxyRequestWithRetry(
        req: Parameters<http.RequestListener>[0], 
        res: Parameters<http.RequestListener>[1], 
        rewrittenBody: string, 
        shouldRewrite: boolean, 
        retryCount: number
    ) {
        const maxRetries = 3;
        const baseDelay = 1000; // 1 second
        
        // Track if we've already responded to avoid double responses
        let hasResponded = false;
        let requestDestroyed = false;
        
        const { request: httpRequest } = this.proxyTarget.protocol === "https:" ? https : http;
        const requestOptions: Exclude<Parameters<typeof httpRequest>[0], string> = {
            hostname: this.proxyTarget.hostname,
            protocol: this.proxyTarget.protocol,
            //@ts-expect-error
            path: req.url,
            method: req.method,
            agent: this.proxyTarget.protocol === "https:" ? this._httpsAgent : this._httpAgent,
            headers: {
                ...req.headers,
                "Content-Length": Buffer.byteLength(rewrittenBody),
                "content-length": Buffer.byteLength(rewrittenBody),
                host: this.proxyTarget.host
            }
        };

        const proxyReq = httpRequest(requestOptions);

        // Handle timeout with retry logic
        proxyReq.setTimeout(10000, () => {
            if (hasResponded || requestDestroyed) return;
            
            debug.trace(`Proxy request timed out (attempt ${retryCount + 1}/${maxRetries + 1})`, requestOptions);
            requestDestroyed = true;
            proxyReq.destroy();
            
            if (retryCount < maxRetries && !res.headersSent && !hasResponded) {
                this._stats.retries++;
                const delay = baseDelay * Math.pow(2, retryCount);
                
                // Extract keys from request body for better logging
                let keys = 'unknown';
                try {
                    if (rewrittenBody && shouldRewrite) {
                        const json = JSON.parse(rewrittenBody);
                        const firstProvider = json.Providers?.[0];
                        keys = firstProvider?.Payload?.Keys?.join(', ') || 'unknown';
                    }
                } catch (e) {
                    // Keep default 'unknown'
                }
                
                debug(`Retrying timeout request in ${delay}ms (attempt ${retryCount + 2}/${maxRetries + 1}) - keys: ${keys}, target: ${this.proxyTarget.host}`);
                
                setTimeout(() => {
                    if (!hasResponded) {
                        this._makeProxyRequestWithRetry(req, res, rewrittenBody, shouldRewrite, retryCount + 1);
                    }
                }, delay);
            } else if (!res.headersSent && !hasResponded) {
                hasResponded = true;
                this._recordRequestResult(shouldRewrite, req.method === "GET", false);
                res.writeHead(504);
                res.end("Gateway Timeout - Max retries exceeded");
            }
        });

        // Handle proxy request errors with retry logic
        proxyReq.on("error", (e: any) => {
            if (hasResponded || requestDestroyed) return;
            
            const errorCode = e.code || 'UNKNOWN';
            const errorMessage = e.message || 'Unknown error';
            
            // Only log errors for PUT/POST requests
            if (shouldRewrite) {
                debug.trace(`Proxy error (attempt ${retryCount + 1}/${maxRetries + 1}):`, errorCode, errorMessage);
            }
            
            requestDestroyed = true;
            proxyReq.destroy();
            
            if (retryCount < maxRetries && !res.headersSent && !hasResponded && this._shouldRetryError(e)) {
                this._stats.retries++;
                const delay = baseDelay * Math.pow(2, retryCount);
                
                if (shouldRewrite) {
                    // Extract keys from request body for better logging
                    let keys = 'unknown';
                    try {
                        if (rewrittenBody) {
                            const json = JSON.parse(rewrittenBody);
                            const firstProvider = json.Providers?.[0];
                            keys = firstProvider?.Payload?.Keys?.join(', ') || 'unknown';
                        }
                    } catch (e) {
                        // Keep default 'unknown'
                    }
                    
                    debug(`Retrying request in ${delay}ms due to ${errorCode} (attempt ${retryCount + 2}/${maxRetries + 1}) - keys: ${keys}, target: ${this.proxyTarget.host}`);
                }
                
                setTimeout(() => {
                    if (!hasResponded) {
                        this._makeProxyRequestWithRetry(req, res, rewrittenBody, shouldRewrite, retryCount + 1);
                    }
                }, delay);
            } else if (!res.headersSent && !hasResponded) {
                hasResponded = true;
                this._recordRequestResult(shouldRewrite, req.method === "GET", false);
                res.writeHead(502);
                res.end(`Bad Gateway - ${errorCode}: ${errorMessage} (${retryCount + 1} attempts)`);
            }
        });

        // Handle the proxy response
        proxyReq.on("response", (proxyRes: http.IncomingMessage) => {
            if (hasResponded || requestDestroyed) {
                proxyRes.destroy();
                return;
            }
            
            hasResponded = true;
            const statusCode = proxyRes.statusCode || 500;
            const isSuccess = statusCode >= 200 && statusCode < 300;

            this._recordRequestResult(shouldRewrite, req.method === "GET", isSuccess);
            
            if (shouldRewrite) {
                if (isSuccess) {
                    debug.trace(`PUT/POST succeeded with status ${statusCode} - ${req.method} ${req.url}`);
                } else {
                    const responseChunks: Buffer[] = [];
                    proxyRes.on("data", (chunk: Buffer) => {
                        responseChunks.push(chunk);
                    });
                    proxyRes.on("end", () => {
                        let responseBody = "";
                        try {
                            const rawResponse = Buffer.concat(responseChunks);
                            if (proxyRes.headers["content-encoding"] === "gzip") {
                                responseBody = gunzipSync(rawResponse).toString("utf8");
                            } else {
                                responseBody = rawResponse.toString("utf8");
                            }
                        } catch (e) {
                            const error = e as Error;
                            responseBody = `[Error decoding response: ${error.message}]`;
                        }

                        debug.error(
                            `${req.method} request failed with status ${statusCode} - ${req.method} ${req.url} to ${this.proxyTarget.host}${req.url}`,
                            {
                                statusCode,
                                headers: proxyRes.headers,
                                responseBody: responseBody.length > 500 ? responseBody.substring(0, 500) + "..." : responseBody,
                                requestHeaders: req.headers,
                                requestBodyLength: rewrittenBody?.length || 0
                            }
                        );
                    });
                }
            }

            proxyRes.on("error", (err: Error) => {
                if (shouldRewrite) {
                    debug.error("Proxy response error:", err, "Proxy response", proxyRes);
                }
                if (!res.headersSent) {
                    res.writeHead(500);
                    res.end("Proxy Response Error");
                }
                proxyRes.destroy(err);
            });

            if (!res.headersSent) {
                res.writeHead(statusCode, proxyRes.headers);
                proxyRes.pipe(res);

                res.on("finish", () => {
                    proxyRes.resume();
                });
            }
        });

        proxyReq.write(rewrittenBody);
        proxyReq.end();
    }
    
    private _shouldRetryError(error: any): boolean {
        const retryableCodes = ['ETIMEDOUT', 'ECONNRESET', 'ECONNREFUSED', 'ENETUNREACH', 'ENOTFOUND'];
        return retryableCodes.includes(error.code);
    }

    private _recordRequestResult(shouldRewrite: boolean, isGet: boolean, isSuccess: boolean) {
        if (shouldRewrite) {
            this._stats.putPostTotal++;
            if (isSuccess) {
                this._stats.putPostSuccessful++;
            } else {
                this._stats.putPostFailed++;
            }
        } else if (isGet) {
            this._stats.getTotal++;
            if (isSuccess) {
                this._stats.getSuccessful++;
            } else {
                this._stats.getFailed++;
            }
        }
    }

    // get up to date listen addresses from kubo every x minutes
    async _startUpdateAddressesLoop() {
        if (!this.kuboClients?.length) throw Error("should have a defined kubo rpc client option to start the address rewriter");

        const tryUpdateAddresses = async () => {
            let successCount = 0;
            let totalAddresses = 0;

            for (const kuboClient of this.kuboClients) {
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

                    if (addresses.length === 0) {
                        debug.error(`No addresses found for peer ${peerId} from kubo client`);
                        continue;
                    }

                    const previousCount = this.addresses[peerId]?.length || 0;
                    this.addresses[peerId] = addresses;
                    successCount++;
                    totalAddresses += addresses.length;

                    debug.trace(`Updated addresses for peer ${peerId}: ${previousCount} -> ${addresses.length} addresses`);
                } catch (e) {
                    const error = <Error>e;
                    debug.error("tryUpdateAddresses error:", error.message, { kuboConfig: kuboClient.getEndpointConfig() });
                }
            }

            if (successCount === 0) {
                debug.error(`Failed to update addresses for all ${this.kuboClients.length} kubo clients`);
            } else {
                debug.trace(`Updated addresses for ${successCount}/${this.kuboClients.length} clients, total ${totalAddresses} addresses`);
            }
        };
        await tryUpdateAddresses();
        this._updateAddressesInterval = setInterval(tryUpdateAddresses, 1000 * 60);
    }

    private _startStatsReporting() {
        const reportStats = () => {
            const timeSinceStart = (Date.now() - this._stats.startTime) / 1000 / 60; // minutes
            const putPostSuccessRate =
                this._stats.putPostTotal > 0 ? ((this._stats.putPostSuccessful / this._stats.putPostTotal) * 100).toFixed(1) : "0.0";
            const getSuccessRate = this._stats.getTotal > 0 ? ((this._stats.getSuccessful / this._stats.getTotal) * 100).toFixed(1) : "0.0";

            debug(
                `Proxy Stats (${timeSinceStart.toFixed(1)}min) [${this.proxyTarget.host}]: ` +
                    `GET: ${this._stats.getTotal} total, ${this._stats.getSuccessful} success, ${this._stats.getFailed} failed (${getSuccessRate}%) | ` +
                    `PUT/POST: ${this._stats.putPostTotal} total, ${this._stats.putPostSuccessful} success, ${this._stats.putPostFailed} failed (${putPostSuccessRate}%) | ` +
                    `Retries: ${this._stats.retries}`
            );
        };

        this._statsReportInterval = setInterval(reportStats, this._statsReportIntervalMs);
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
