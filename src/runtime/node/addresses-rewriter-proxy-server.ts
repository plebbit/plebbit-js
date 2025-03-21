import http from "node:http";
import https from "node:https";
import Logger from "@plebbit/plebbit-logger";
import * as remeda from "remeda";
import { Plebbit } from "../../plebbit/plebbit";
const debug = Logger("plebbit-js:addresses-rewriter");

type AddressesRewriterOptions = {
    kuboClients: Plebbit["clients"]["kuboRpcClients"][string]["_client"][];
    port: number;
    hostname: string | undefined;
    proxyTargetUrl: string;
};

export class AddressesRewriterProxyServer {
    addresses: Record<string, string[]>; // Peer id => addresses
    kuboClients: AddressesRewriterOptions["kuboClients"];
    port: number;
    hostname: string;
    proxyTarget: URL;
    server: ReturnType<(typeof http)["createServer"]>;

    private _updateAddressesInterval!: ReturnType<typeof setInterval>;
    constructor({ kuboClients: kuboClient, port, hostname, proxyTargetUrl }: AddressesRewriterOptions) {
        this.addresses = {};

        this.kuboClients = kuboClient;
        this.port = port;
        this.hostname = hostname || "127.0.0.1";
        this.proxyTarget = new URL(proxyTargetUrl);
        this.server = http.createServer((req, res) => this._proxyRequestRewrite(req, res));
    }

    listen(callback?: () => void) {
        this._startUpdateAddressesLoop();
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
    }

    destroy() {
        this.server.close();
        clearInterval(this._updateAddressesInterval);
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
                    debug("proxy body rewrite error:", error.message);
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
                }
            };
            const proxyReq = httpRequest(requestOptions, (proxyRes) => {
                res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
                proxyRes.pipe(res, { end: true });
            });
            proxyReq.on("error", (e) => {
                debug.error("proxy error:", e, "Request options", requestOptions, "request.body", rewrittenBody);
                res.writeHead(500);
                res.end("Internal Server Error");
            });
            proxyReq.write(rewrittenBody);
            proxyReq.end();
        });
    }

    // get up to date listen addresses from kubo every x minutes
    _startUpdateAddressesLoop() {
        if (!this.kuboClients?.length) throw Error("should have a defined kubo rpc client option to start the address rewriter");

        const tryUpdateAddresses = async () => {
            for (const kuboClient of this.kuboClients) {
                try {
                    const idRes = await kuboClient.id();
                    const swarmAddrsRes = await kuboClient.swarm.addrs();

                    const peerId: string = idRes.id.toString();
                    if (typeof peerId !== "string") throw Error("Failed to get Peer ID of kubo node");
                    const addresses: string[] = remeda.unique([
                        ...idRes.addresses.map((addr) => addr.toString()),
                        ...remeda.flatten(swarmAddrsRes.map((swarmAddr) => swarmAddr.addrs.map((addr) => addr.toString())))
                    ]);

                    this.addresses[peerId] = addresses;
                } catch (e) {
                    const error = <Error>e;
                    debug("tryUpdateAddresses error:", error.message, { kuboConfig: kuboClient.getEndpointConfig() });
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
