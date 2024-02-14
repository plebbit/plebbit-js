import { BasePages } from "../pages.js";
import { BaseClientsManager, LoadType } from "./base-client-manager.js";
import { PagesIpfsClient } from "./ipfs-client.js";
import { PagesIpfsGatewayClient } from "./ipfs-gateway-client.js";
import { PageIpfs, PostSortName, ReplySortName } from "../types.js";
import { PagesPlebbitRpcStateClient } from "./plebbit-rpc-state-client.js";
export declare class BasePagesClientsManager extends BaseClientsManager {
    clients: {
        ipfsGateways: {
            [sortType: string]: {
                [ipfsGatewayUrl: string]: PagesIpfsGatewayClient;
            };
        };
        ipfsClients: {
            [sortType: string]: {
                [ipfsClientUrl: string]: PagesIpfsClient;
            };
        };
        plebbitRpcClients: {
            [sortType: string]: {
                [rpcUrl: string]: PagesPlebbitRpcStateClient;
            };
        };
    };
    protected _pages: BasePages;
    constructor(pages: BasePages);
    protected getSortTypes(): string[];
    protected _initIpfsGateways(): void;
    protected _initIpfsClients(): void;
    protected _initPlebbitRpcClients(): void;
    preFetchGateway(gatewayUrl: string, path: string, loadType: LoadType): void;
    postFetchGatewaySuccess(gatewayUrl: string, path: string, loadType: LoadType): void;
    postFetchGatewayFailure(gatewayUrl: string, path: string, loadType: LoadType): void;
    postFetchGatewayAborted(gatewayUrl: string, path: string, loadType: LoadType): void;
    _updatePageCidsSortCache(pageCid: string, sortTypes: string[]): void;
    updatePageCidsToSortTypes(newPageCids: BasePages["pageCids"]): void;
    updatePageCidsToSortTypesToIncludeSubsequent(nextPageCid: string, previousPageCid: string): void;
    updateIpfsState(newState: PagesIpfsClient["state"], sortTypes: string[]): void;
    updateGatewayState(newState: PagesIpfsGatewayClient["state"], gateway: string, sortTypes: string[]): void;
    updateRpcState(newState: PagesPlebbitRpcStateClient["state"], rpcUrl: string, sortTypes: string[]): void;
    private _fetchPageWithRpc;
    private _fetchPageWithIpfsP2P;
    fetchPage(pageCid: string): Promise<PageIpfs>;
}
export declare class RepliesPagesClientsManager extends BasePagesClientsManager {
    clients: {
        ipfsGateways: Record<ReplySortName, {
            [ipfsGatewayUrl: string]: PagesIpfsGatewayClient;
        }>;
        ipfsClients: Record<ReplySortName, {
            [ipfsClientUrl: string]: PagesIpfsGatewayClient;
        }>;
        plebbitRpcClients: Record<ReplySortName, {
            [rpcUrl: string]: PagesPlebbitRpcStateClient;
        }>;
    };
    protected getSortTypes(): string[];
}
export declare class PostsPagesClientsManager extends BasePagesClientsManager {
    clients: {
        ipfsGateways: Record<PostSortName, {
            [ipfsGatewayUrl: string]: PagesIpfsGatewayClient;
        }>;
        ipfsClients: Record<PostSortName, {
            [ipfsClientUrl: string]: PagesIpfsGatewayClient;
        }>;
        plebbitRpcClients: Record<PostSortName, {
            [rpcUrl: string]: PagesPlebbitRpcStateClient;
        }>;
    };
    protected getSortTypes(): string[];
}
