import http from "node:http";
import https from "node:https";
import Logger from "@plebbit/plebbit-logger";
const debug = Logger("plebbit-js:addresses-rewriter");
export class AddressesRewriterProxyServer {
    constructor({ plebbitOptions, port, hostname, proxyTargetUrl }) {
        this.addresses = {};
        this.plebbitOptions = plebbitOptions;
        this.port = port;
        this.hostname = hostname || "127.0.0.1";
        this.proxyTarget = new URL(proxyTargetUrl);
        this.server = http.createServer((req, res) => this._proxyRequestRewrite(req, res));
    }
    listen(callback) {
        this._startUpdateAddressesLoop();
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
                    host: this.proxyTarget.host // Add the host header
                }
            };
            const proxyReq = httpRequest(requestOptions, (proxyRes) => {
                res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
                proxyRes.pipe(res, { end: true });
            });
            proxyReq.on("error", (e) => {
                debug("proxy error:", e.message, requestOptions);
                res.writeHead(500);
                res.end("Internal Server Error");
            });
            proxyReq.write(rewrittenBody);
            proxyReq.end();
        });
    }
    // get up to date listen addresses from kubo every x minutes
    _startUpdateAddressesLoop() {
        const tryUpdateAddresses = async () => {
            if (!this.plebbitOptions.ipfsHttpClientsOptions?.length) {
                throw Error("no plebbitOptions.ipfsHttpClientsOptions");
            }
            for (const ipfsHttpClientOptions of this.plebbitOptions.ipfsHttpClientsOptions) {
                if (!ipfsHttpClientOptions)
                    throw Error("should have a defined ipfs http client option to start the address rewriter");
                const kuboApiUrl = typeof ipfsHttpClientOptions === "string" ? ipfsHttpClientOptions : ipfsHttpClientOptions.url;
                try {
                    const { ID: peerId } = await fetch(`${kuboApiUrl}/id`, { method: "POST", headers: ipfsHttpClientOptions.headers }).then((res) => res.json());
                    const res = await fetch(`${kuboApiUrl}/swarm/addrs/listen`, {
                        method: "POST",
                        headers: ipfsHttpClientOptions.headers
                    }).then((res) => res.json());
                    this.addresses[peerId] = res.Strings;
                }
                catch (e) {
                    const error = e;
                    debug("tryUpdateAddresses error:", error.message, { kuboApiUrl });
                }
            }
        };
        tryUpdateAddresses();
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