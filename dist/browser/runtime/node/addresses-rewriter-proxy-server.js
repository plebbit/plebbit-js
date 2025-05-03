import http from "node:http";
import https from "node:https";
import Logger from "@plebbit/plebbit-logger";
import * as remeda from "remeda";
const debug = Logger("plebbit-js:addresses-rewriter");
export class AddressesRewriterProxyServer {
    constructor({ kuboClients: kuboClient, port, hostname, proxyTargetUrl }) {
        this.addresses = {};
        this.kuboClients = kuboClient;
        this.port = port;
        this.hostname = hostname || "127.0.0.1";
        this.proxyTarget = new URL(proxyTargetUrl);
        this.server = http.createServer((req, res) => this._proxyRequestRewrite(req, res));
    }
    async listen(callback) {
        await this._startUpdateAddressesLoop();
        this.server.on("error", (err) => debug.error("Error with address rewriter proxy", this.server.address(), "Proxy target", this.proxyTarget, err));
        this.server.listen(this.port, this.hostname, callback);
        debug("Addresses rewriter proxy at", this.hostname + ":" + this.port, "started listening to forward requests to", this.proxyTarget.host);
    }
    destroy() {
        this.server.close();
        clearInterval(this._updateAddressesInterval);
    }
    _proxyRequestRewrite(req, res) {
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
                }
                catch (e) {
                    const error = e;
                    debug("proxy body rewrite error:", error.message);
                }
            }
            // proxy the request
            const { request: httpRequest } = this.proxyTarget.protocol === "https:" ? https : http;
            const requestOptions = {
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
                debug.error("Proxy request timed out");
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
                    debug.error("Proxy response error:", err);
                    if (!res.headersSent) {
                        res.writeHead(500);
                        res.end("Proxy Response Error");
                    }
                    proxyRes.destroy();
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
            debug("Client connection closed");
        });
        // Handle request errors
        req.on("error", (err) => {
            debug.error("Request error:", err);
            if (!res.headersSent) {
                res.writeHead(500);
                res.end("Internal Server Error");
            }
        });
    }
    // get up to date listen addresses from kubo every x minutes
    async _startUpdateAddressesLoop() {
        if (!this.kuboClients?.length)
            throw Error("should have a defined kubo rpc client option to start the address rewriter");
        const tryUpdateAddresses = async () => {
            for (const kuboClient of this.kuboClients) {
                try {
                    const idRes = await kuboClient.id();
                    const swarmAddrsRes = await kuboClient.swarm.addrs();
                    const peerId = idRes.id.toString();
                    if (typeof peerId !== "string")
                        throw Error("Failed to get Peer ID of kubo node");
                    const addresses = remeda.unique([
                        ...idRes.addresses.map((addr) => addr.toString()),
                        ...remeda.flatten(swarmAddrsRes.map((swarmAddr) => swarmAddr.addrs.map((addr) => addr.toString())))
                    ]);
                    this.addresses[peerId] = addresses;
                }
                catch (e) {
                    const error = e;
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
//# sourceMappingURL=addresses-rewriter-proxy-server.js.map