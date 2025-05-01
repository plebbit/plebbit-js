import { Plebbit } from "../../plebbit/plebbit.js";
import retry, { RetryOperation } from "retry";
import { AddressesRewriterProxyServer } from "./addresses-rewriter-proxy-server.js";
import Logger from "@plebbit/plebbit-logger";
import { PlebbitError } from "../../plebbit-error.js";
import * as remeda from "remeda";
import tcpPortUsed from "tcp-port-used";

async function _setHttpRouterOptionsOnKuboNode(kuboClient: Plebbit["clients"]["kuboRpcClients"][string], routingValue: any) {
    const log = Logger("plebbit-js:plebbit:_init:retrySettingHttpRoutersOnIpfsNodes:setHttpRouterOptionsOnIpfsNode");
    const routingKey = "Routing";

    let routingConfigBeforeChanging: typeof routingValue | undefined;
    try {
        routingConfigBeforeChanging = await kuboClient._client.config.get(routingKey);
    } catch (e) {
        const error = new PlebbitError("ERR_FAILED_TO_GET_CONFIG_ON_KUBO_NODE", {
            actualError: e,
            kuboEndpoint: kuboClient._clientOptions.url,
            configKey: routingKey
        });
        log.error(e);
        throw error;
    }
    const url = `${kuboClient._clientOptions.url}/config?arg=${routingKey}&arg=${JSON.stringify(routingValue)}&json=true`;
    try {
        await fetch(url, { method: "POST", headers: kuboClient._clientOptions.headers });
    } catch (e) {
        const error = new PlebbitError("ERR_FAILED_TO_SET_CONFIG_ON_KUBO_NODE", {
            fullUrl: url,
            actualError: e,
            kuboEndpoint: kuboClient._clientOptions.url,
            configKey: routingKey,
            configValueToBeSet: routingValue
        });
        log.error(e);
        throw error;
    }
    log.trace("Succeeded in setting config key", routingKey, "on node", kuboClient._clientOptions.url, "to be", routingValue);

    const endpointsBefore: string[] = Object.values(routingConfigBeforeChanging?.["Routers"] || {}).map(
        //@ts-expect-error
        (router) => router["Parameters"]["Endpoint"]
    );
    //@ts-expect-error
    const endpointsAfter = Object.values(routingValue.Routers).map((router) => router["Parameters"]["Endpoint"]);
    if (!remeda.isDeepEqual(endpointsBefore.sort(), endpointsAfter.sort())) {
        log(
            "Config on kubo node has been changed. Plebbit-js will send shutdown command to node",
            kuboClient._clientOptions.url,
            "Clients of plebbit-js should restart ipfs node"
        );
        const shutdownUrl = `${kuboClient._clientOptions.url}/shutdown`;
        try {
            await fetch(shutdownUrl, { method: "POST", headers: kuboClient._clientOptions.headers });
        } catch (e) {
            const error = new PlebbitError("ERR_FAILED_TO_SHUTDOWN_KUBO_NODE", {
                actualError: e,
                kuboEndpoint: kuboClient._clientOptions.url,
                shutdownUrl
            });
            log.error(e);
            throw error;
        }
    }
}

async function _getStartedProxyUrl(plebbit: Plebbit, httpRouterUrl: string) {
    const mappingKeyName = `httprouter_proxy_${httpRouterUrl}`;
    const urlOfProxyOfHttpRouter = <string | undefined>await plebbit._storage.getItem(mappingKeyName);
    if (urlOfProxyOfHttpRouter) {
        const proxyHttpUrl = new URL(urlOfProxyOfHttpRouter);
        if (await tcpPortUsed.check(Number(proxyHttpUrl.port), "127.0.0.1")) return urlOfProxyOfHttpRouter;
        else await plebbit._storage.removeItem(mappingKeyName);
    }
    return undefined;
}

export async function setupKuboAddressesRewriterAndHttpRouters(plebbit: Plebbit): Promise<{ destroy: () => void }> {
    if (!Array.isArray(plebbit.kuboRpcClientsOptions) || plebbit.kuboRpcClientsOptions.length <= 0)
        throw Error("need ipfs http client to be defined");
    if (!Array.isArray(plebbit.httpRoutersOptions) || plebbit.httpRoutersOptions.length <= 0)
        throw Error("Need http router options to defined");

    const log = Logger("plebbit-js:node:setupKuboAddressesRewriterAndHttpRouters");
    // Set up http proxies first to rewrite addresses

    const httpRouterProxyUrls: string[] = [];
    const proxyServers: AddressesRewriterProxyServer[] = [];
    let addressesRewriterStartPort = 19575; // use port 19575 as first port, looks like IPRTR (IPFS ROUTER)
    for (const httpRouter of plebbit.httpRoutersOptions) {
        const startedProxyUrl = await _getStartedProxyUrl(plebbit, httpRouter);
        if (startedProxyUrl) {
            httpRouterProxyUrls.push(startedProxyUrl);
            continue;
        }
        // launch the proxy server

        let port = addressesRewriterStartPort;
        const hostname = "127.0.0.1";
        while (await tcpPortUsed.check(port, hostname))
            // keep increasing port till we find an empty port
            port++;

        const addressesRewriterProxyServer = new AddressesRewriterProxyServer({
            kuboClients: Object.values(plebbit.clients.kuboRpcClients).map((kubo) => kubo._client),
            port,
            hostname,
            proxyTargetUrl: httpRouter
        });
        await addressesRewriterProxyServer.listen();
        proxyServers.push(addressesRewriterProxyServer);

        // save the proxy urls to use them later

        const httpRouterProxyUrl = `http://${hostname}:${port}`;
        httpRouterProxyUrls.push(httpRouterProxyUrl);

        const mappingKeyName = `httprouter_proxy_${httpRouter}`;
        await plebbit._storage.setItem(mappingKeyName, httpRouterProxyUrl);
    }
    httpRouterProxyUrls.sort(); // make sure it's always the same order

    // Set up http routers to use proxies
    const kuboClients = plebbit.clients.kuboRpcClients;
    const httpRoutersConfig: any = {
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
            for (const kuboClient of Object.values(kuboClients)) {
                try {
                    await _setHttpRouterOptionsOnKuboNode(kuboClient, routingValue);
                } catch (e) {
                    settingOptionRetryOption.retry(<Error>e);
                    return;
                }
            }
            resolve(1);
        });
    });

    await setHttpRouterOnAllNodes;
    settingOptionRetryOption.stop();
    return {
        destroy: () => {
            for (const proxyServer of proxyServers) {
                proxyServer.destroy();
            }
        }
    };
}
