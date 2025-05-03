import { BaseClientsManager, OptionsToLoadFromGateway } from "./base-client-manager.js";
import { PagesKuboRpcClient } from "./ipfs-client.js";
import { PagesIpfsGatewayClient } from "./ipfs-gateway-client.js";
import { PageIpfs } from "../pages/types.js";
import { PagesPlebbitRpcStateClient } from "./rpc-client/plebbit-rpc-state-client.js";
import Logger from "@plebbit/plebbit-logger";
import { BasePages, PostsPages, RepliesPages } from "../pages/pages.js";
import { POSTS_SORT_TYPES, POST_REPLIES_SORT_TYPES } from "../pages/util.js";
import { Plebbit } from "../plebbit/plebbit.js";
export declare class BasePagesClientsManager extends BaseClientsManager {
    clients: {
        ipfsGateways: {
            [sortType: string]: {
                [ipfsGatewayUrl: string]: PagesIpfsGatewayClient;
            };
        };
        kuboRpcClients: {
            [sortType: string]: {
                [kuboRpcClientUrl: string]: PagesKuboRpcClient;
            };
        };
        plebbitRpcClients: {
            [sortType: string]: {
                [rpcUrl: string]: PagesPlebbitRpcStateClient;
            };
        };
    };
    protected _pages: RepliesPages | PostsPages;
    constructor(opts: {
        pages: RepliesPages | PostsPages;
        plebbit: Plebbit;
    });
    protected _updateIpfsGatewayClientStates(sortTypes: string[]): void;
    protected _updateKuboRpcClientStates(sortTypes: string[]): void;
    protected _updatePlebbitRpcClientStates(sortTypes: string[]): void;
    preFetchGateway(gatewayUrl: string, loadOpts: OptionsToLoadFromGateway): void;
    postFetchGatewaySuccess(gatewayUrl: string, loadOpts: OptionsToLoadFromGateway): void;
    postFetchGatewayFailure(gatewayUrl: string, loadOpts: OptionsToLoadFromGateway): void;
    postFetchGatewayAborted(gatewayUrl: string, loadOpts: OptionsToLoadFromGateway): void;
    _updatePageCidsSortCache(pageCid: string, sortTypes: string[]): void;
    updatePageCidsToSortTypes(newPageCids: BasePages["pageCids"]): void;
    private _calculatePageMaxSizeCacheKey;
    updatePagesMaxSizeCache(newPageCids: string[], pageMaxSizeBytes: number): void;
    updatePageCidsToSortTypesToIncludeSubsequent(nextPageCid: string, previousPageCid: string): void;
    updateIpfsState(newState: PagesKuboRpcClient["state"], sortTypes: string[] | undefined): void;
    updateGatewayState(newState: PagesIpfsGatewayClient["state"], gateway: string, sortTypes: string[] | undefined): void;
    updateRpcState(newState: PagesPlebbitRpcStateClient["state"], rpcUrl: string, sortTypes: string[] | undefined): void;
    private _fetchPageWithRpc;
    private _fetchPageWithIpfsP2P;
    _fetchPageFromGateways(pageCid: string, log: Logger, pageMaxSize: number): Promise<PageIpfs>;
    fetchPage(pageCid: string): Promise<PageIpfs>;
    protected getSortTypes(): string[];
}
export declare class RepliesPagesClientsManager extends BasePagesClientsManager {
    clients: {
        ipfsGateways: Record<keyof typeof POST_REPLIES_SORT_TYPES, {
            [ipfsGatewayUrl: string]: PagesIpfsGatewayClient;
        }>;
        kuboRpcClients: Record<keyof typeof POST_REPLIES_SORT_TYPES, {
            [kuboRpcClientUrl: string]: PagesIpfsGatewayClient;
        }>;
        plebbitRpcClients: Record<keyof typeof POST_REPLIES_SORT_TYPES, {
            [rpcUrl: string]: PagesPlebbitRpcStateClient;
        }>;
    };
    protected getSortTypes(): string[];
}
export declare class SubplebbitPostsPagesClientsManager extends BasePagesClientsManager {
    clients: {
        ipfsGateways: Record<keyof typeof POSTS_SORT_TYPES, {
            [ipfsGatewayUrl: string]: PagesIpfsGatewayClient;
        }>;
        kuboRpcClients: Record<keyof typeof POSTS_SORT_TYPES, {
            [kuboRpcClientUrl: string]: PagesIpfsGatewayClient;
        }>;
        plebbitRpcClients: Record<keyof typeof POSTS_SORT_TYPES, {
            [rpcUrl: string]: PagesPlebbitRpcStateClient;
        }>;
    };
    protected getSortTypes(): string[];
}
