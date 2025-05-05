import http from "node:http";
import https from "node:https";
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

    private _updateAddressesInterval!: ReturnType<typeof setInterval>;
    constructor({ kuboClients: kuboClient, port, hostname, proxyTargetUrl, plebbit }: AddressesRewriterOptions) {
        this.addresses = {};

        this.kuboClients = kuboClient;
        this.port = port;
        this.hostname = hostname || "127.0.0.1";
        this.proxyTarget = new URL(proxyTargetUrl);
        this.server = http.createServer((req, res) => this._proxyRequestRewrite(req, res));
        this._storageKeyName = `httprouter_proxy_${proxyTargetUrl}`;
        this._plebbit = plebbit;
        hideClassPrivateProps(this);
    }

    async listen(callback?: () => void) {
        await this._startUpdateAddressesLoop();
        this.server.on("error", (err) =>
            debug.error("Error with address rewriter proxy", this.server.address(), "Proxy target", this.proxyTarget, err)
        );
        this.server.listen(this.port, this.hostname, callback);
        debug(
            "Addresses rewriter proxy at",
            this.hostname + ":" + this.port,
            "started listening to forward requests to",
            this.proxyTarget.host
        );
        await this._plebbit._storage.setItem(this._storageKeyName, `http://${this.hostname}:${this.port}`);
    }

    async destroy() {
        this.server.close();
        clearInterval(this._updateAddressesInterval);
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
            // rewrite body with up to date addresses
            let rewrittenBody = reqBody;
            if (rewrittenBody) {
                try {
                    const json = JSON.parse(rewrittenBody);
                    for (const provider of json.Providers) {
                        const peerId = provider.Payload.ID;
                        if (this.addresses[peerId]) {
                            provider.Payload.Addrs = this.addresses[peerId];
                        }
                    }
                    rewrittenBody = JSON.stringify(json);
                } catch (e) {
                    const error = <Error>e;
                    debug("proxy body rewrite error:", error, "body", rewrittenBody, req.url, req.method);
                }
            }

            // proxy the request
            const { request: httpRequest } = this.proxyTarget.protocol === "https:" ? https : http;
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
                    host: this.proxyTarget.host // Add the host header
                },
                // Add a reasonable timeout
                timeout: 60000 // 1 minute timeout
            };

            // Create proxy request with proper error handling
            const proxyReq = httpRequest(requestOptions);

            // Handle timeout
            proxyReq.setTimeout(60000, () => {
                debug.error("Proxy request timed out", requestOptions, reqBody);
                proxyReq.destroy();
            });

            // Handle proxy request errors - make sure to close connections
            proxyReq.on("error", (e) => {
                debug.error("proxy error:", e, "Request options", requestOptions, "request.body", rewrittenBody);
                if (!res.headersSent) {
                    res.writeHead(500);
                    res.end("Internal Server Error");
                }
                // Make sure to destroy the request to free up file handles
                proxyReq.destroy();
            });

            // Handle the proxy response
            proxyReq.on("response", (proxyRes) => {
                // Handle proxy response errors
                proxyRes.on("error", (err) => {
                    debug.error("Proxy response error:", err, "Proxy response", proxyRes);
                    if (!res.headersSent) {
                        res.writeHead(500);
                        res.end("Proxy Response Error");
                    }
                    proxyRes.destroy(err);
                });

                // Pipe the response with proper error handling
                res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
                proxyRes.pipe(res);

                // Ensure cleanup when response ends
                res.on("finish", () => {
                    proxyRes.resume(); // Make sure to consume any remaining data
                });
            });

            // Write the request body and end
            proxyReq.write(rewrittenBody);
            proxyReq.end();
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

    // get up to date listen addresses from kubo every x minutes
    async _startUpdateAddressesLoop() {
        if (!this.kuboClients?.length) throw Error("should have a defined kubo rpc client option to start the address rewriter");

        const tryUpdateAddresses = async () => {
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

                    this.addresses[peerId] = addresses;
                } catch (e) {
                    const error = <Error>e;
                    debug("tryUpdateAddresses error:", error.message, { kuboConfig: kuboClient.getEndpointConfig() });
                }
            }
        };
        await tryUpdateAddresses();
        this._updateAddressesInterval = setInterval(tryUpdateAddresses, 1000 * 60);
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
