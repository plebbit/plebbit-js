import { BasePages } from "../pages";
import { BaseClientsManager, LoadType } from "./base-client-manager";
import { PagesIpfsClient } from "./ipfs-client";
import { PagesIpfsGatewayClient } from "./ipfs-gateway-client";
import { PageIpfs, PostSortName, ReplySortName } from "../types";
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
    };
    constructor(pages: BasePages);
    protected getSortTypes(): string[];
    protected _initIpfsGateways(): void;
    protected _initIpfsClients(): void;
    preFetchGateway(gatewayUrl: string, path: string, loadType: LoadType): void;
    postFetchGatewaySuccess(gatewayUrl: string, path: string, loadType: LoadType): void;
    postFetchGatewayFailure(gatewayUrl: string, path: string, loadType: LoadType): void;
    postFetchGatewayAborted(gatewayUrl: string, path: string, loadType: LoadType): void;
    _updatePageCidsSortCache(pageCid: string, sortTypes: string[]): void;
    updatePageCidsToSortTypes(newPageCids: BasePages["pageCids"]): void;
    updatePageCidsToSortTypesToIncludeSubsequent(nextPageCid: string, previousPageCid: string): void;
    updateIpfsState(newState: PagesIpfsClient["state"], sortTypes: string[]): void;
    updateGatewayState(newState: PagesIpfsGatewayClient["state"], gateway: string, sortTypes: string[]): void;
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
    };
    protected getSortTypes(): string[];
}
