import retry from "retry";
import { AddressesRewriterProxyServer } from "./addresses-rewriter-proxy-server.js";
import Logger from "@plebbit/plebbit-logger";
import { PlebbitError } from "../../plebbit-error.js";
import * as remeda from "remeda";
async function _setHttpRouterOptionsOnIpfsNode(ipfsClient, routingValue) {
    const log = Logger("plebbit-js:plebbit:_init:retrySettingHttpRoutersOnIpfsNodes:setHttpRouterOptionsOnIpfsNode");
    const routingKey = "Routing";
    let routingConfigBeforeChanging;
    try {
        routingConfigBeforeChanging = await ipfsClient._client.config.get(routingKey);
    }
    catch (e) {
        const error = new PlebbitError("ERR_FAILED_TO_GET_CONFIG_ON_KUBO_NODE", {
            actualError: e,
            kuboEndpoint: ipfsClient._clientOptions.url,
            configKey: routingKey
        });
        log.error(e);
        throw error;
    }
    const url = `${ipfsClient._clientOptions.url}/config?arg=${routingKey}&arg=${JSON.stringify(routingValue)}&json=true`;
    try {
        await fetch(url, { method: "POST", headers: ipfsClient._clientOptions.headers });
    }
    catch (e) {
        const error = new PlebbitError("ERR_FAILED_TO_SET_CONFIG_ON_KUBO_NODE", {
            fullUrl: url,
            actualError: e,
            kuboEndpoint: ipfsClient._clientOptions.url,
            configKey: routingKey,
            configValueToBeSet: routingValue
        });
        log.error(e);
        throw error;
    }
    log.trace("Succeeded in setting config key", routingKey, "on node", ipfsClient._clientOptions.url, "to be", routingValue);
    const endpointsBefore = Object.values(routingConfigBeforeChanging?.["Routers"] || {}).map(
    //@ts-expect-error
    (router) => router["Parameters"]["Endpoint"]);
    //@ts-expect-error
    const endpointsAfter = Object.values(routingValue.Routers).map((router) => router["Parameters"]["Endpoint"]);
    if (!remeda.isDeepEqual(endpointsBefore.sort(), endpointsAfter.sort())) {
        log("Config on kubo node has been changed. Plebbit-js will send shutdown command to node", ipfsClient._clientOptions.url, "Clients of plebbit-js should restart ipfs node");
        const shutdownUrl = `${ipfsClient._clientOptions.url}/shutdown`;
        try {
            await fetch(shutdownUrl, { method: "POST", headers: ipfsClient._clientOptions.headers });
        }
        catch (e) {
            const error = new PlebbitError("ERR_FAILED_TO_SHUTDOWN_KUBO_NODE", {
                actualError: e,
                kuboEndpoint: ipfsClient._clientOptions.url,
                shutdownUrl
            });
            log.error(e);
            throw error;
        }
    }
}
export async function setupIpfsAddressesRewriterAndHttpRouters(plebbit) {
    if (!Array.isArray(plebbit.ipfsHttpClientsOptions) || plebbit.ipfsHttpClientsOptions.length <= 0)
        throw Error("need ipfs http client to be defined");
    if (!Array.isArray(plebbit.httpRoutersOptions) || plebbit.httpRoutersOptions.length <= 0)
        throw Error("Need http router options to defined");
    // Set up http proxies first to rewrite addresses
    const httpRouterProxyUrls = [];
    let addressesRewriterStartPort = 19575; // use port 19575 as first port, looks like IPRTR (IPFS ROUTER)
    for (const httpRouter of plebbit.httpRoutersOptions) {
        // launch the proxy server
        const port = addressesRewriterStartPort++;
        const hostname = "127.0.0.1";
        const addressesRewriterProxyServer = new AddressesRewriterProxyServer({
            //@ts-expect-error
            plebbitOptions: plebbit,
            port,
            hostname,
            proxyTargetUrl: httpRouter
        });
        addressesRewriterProxyServer.listen();
        // save the proxy urls to use them later
        httpRouterProxyUrls.push(`http://${hostname}:${port}`);
    }
    // Set up http routers to use proxies
    const ipfsClients = plebbit.clients.ipfsClients;
    const httpRoutersConfig = {
        HttpRoutersParallel: { Type: "parallel", Parameters: { Routers: [] } },
        HttpRouterNotSupported: { Type: "http", Parameters: { Endpoint: "http://kubohttprouternotsupported" } }
    };
    for (const [i, httpRouterUrl] of httpRouterProxyUrls.entries()) {
        const RouterName = `HttpRouter${i + 1}`;
        httpRoutersConfig[RouterName] = {
            Type: "http",
            Parameters: {
                Endpoint: httpRouterUrl
            }
        };
        httpRoutersConfig.HttpRoutersParallel.Parameters.Routers[i] = {
            RouterName: RouterName,
            IgnoreErrors: true,
            Timeout: "10s"
        };
    }
    const httpRoutersMethodsConfig = {
        "find-providers": { RouterName: "HttpRoutersParallel" },
        provide: { RouterName: "HttpRoutersParallel" },
        // not supported by plebbit trackers
        "find-peers": { RouterName: "HttpRouterNotSupported" },
        "get-ipns": { RouterName: "HttpRouterNotSupported" },
        "put-ipns": { RouterName: "HttpRouterNotSupported" }
    };
    const routingValue = {
        Type: "custom",
        Methods: httpRoutersMethodsConfig,
        Routers: httpRoutersConfig
    };
    const settingOptionRetryOption = retry.operation({ forever: true, factor: 2 });
    const setHttpRouterOnAllNodes = new Promise((resolve) => {
        settingOptionRetryOption.attempt(async (curAttempt) => {
            for (const ipfsClient of Object.values(ipfsClients)) {
                try {
                    await _setHttpRouterOptionsOnIpfsNode(ipfsClient, routingValue);
                }
                catch (e) {
                    settingOptionRetryOption.retry(e);
                    return;
                }
            }
            resolve(1);
        });
    });
    await setHttpRouterOnAllNodes;
    settingOptionRetryOption.stop();
}
//# sourceMappingURL=setup-ipfs-rewrite-and-http-router.js.map