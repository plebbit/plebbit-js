import { BaseClientsManager, OptionsToLoadFromGateway } from "../clients/base-client-manager.js";
import type { ModQueuePageIpfs, ModQueueSortName, PageIpfs } from "./types.js";
import Logger from "@plebbit/plebbit-logger";
import { BasePages, ModQueuePages, PostsPages, RepliesPages } from "./pages.js";
import { POSTS_SORT_TYPES, POST_REPLIES_SORT_TYPES } from "./util.js";
import { Plebbit } from "../plebbit/plebbit.js";
import { PagesIpfsGatewayClient, PagesKuboRpcClient, PagesLibp2pJsClient, PagesPlebbitRpcStateClient } from "./pages-clients.js";
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
        libp2pJsClients: {
            [sortType: string]: {
                [libp2pJsClientKey: string]: PagesLibp2pJsClient;
            };
        };
    };
    protected _pages: RepliesPages | PostsPages | ModQueuePages;
    constructor(opts: {
        pages: BasePagesClientsManager["_pages"];
        plebbit: Plebbit;
    });
    protected _updateIpfsGatewayClientStates(sortTypes: string[]): void;
    protected _updateKuboRpcClientStates(sortTypes: string[]): void;
    protected _updateLibp2pJsClientStates(sortTypes: string[]): void;
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
    updateKuboRpcState(newState: PagesKuboRpcClient["state"], kuboRpcClientUrl: string, sortTypes: string[] | undefined): void;
    updateLibp2pJsClientState(newState: PagesLibp2pJsClient["state"], libp2pJsClientKey: keyof Plebbit["clients"]["libp2pJsClients"], sortTypes: string[] | undefined): void;
    updateGatewayState(newState: PagesIpfsGatewayClient["state"], gateway: string, sortTypes: string[] | undefined): void;
    updateRpcState(newState: PagesPlebbitRpcStateClient["state"], rpcUrl: string, sortTypes: string[] | undefined): void;
    _updateKuboRpcClientOrHeliaState(newState: PagesKuboRpcClient["state"] | PagesLibp2pJsClient["state"], kuboRpcOrHelia: Plebbit["clients"]["kuboRpcClients"][string] | Plebbit["clients"]["libp2pJsClients"][string], sortTypes: string[] | undefined): void;
    protected preFetchPage(): void;
    protected _requestPageFromRPC(pageCid: string, log: Logger, sortTypes: string[] | undefined): Promise<ModQueuePageIpfs | PageIpfs>;
    private _fetchPageWithRpc;
    protected parsePageJson(json: unknown): PageIpfs | ModQueuePageIpfs;
    private _fetchPageWithKuboOrHeliaP2P;
    _fetchPageFromGateways(pageCid: string, log: Logger, pageMaxSize: number): Promise<PageIpfs | ModQueuePageIpfs>;
    fetchPage(pageCid: string): Promise<PageIpfs | ModQueuePageIpfs>;
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
        libp2pJsClients: Record<keyof typeof POST_REPLIES_SORT_TYPES, {
            [libp2pJsClientKey: string]: PagesIpfsGatewayClient;
        }>;
    };
    protected getSortTypes(): string[];
    protected preFetchPage(): void;
    protected _requestPageFromRPC(pageCid: string, log: Logger, sortTypes: string[] | undefined): Promise<PageIpfs>;
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
        libp2pJsClients: Record<keyof typeof POSTS_SORT_TYPES, {
            [libp2pJsClientKey: string]: PagesIpfsGatewayClient;
        }>;
    };
    protected getSortTypes(): string[];
    protected preFetchPage(): void;
    protected _requestPageFromRPC(pageCid: string, log: Logger, sortTypes: string[] | undefined): Promise<PageIpfs>;
}
export declare class SubplebbitModQueueClientsManager extends BasePagesClientsManager {
    clients: {
        ipfsGateways: Record<ModQueueSortName, {
            [ipfsGatewayUrl: string]: PagesIpfsGatewayClient;
        }>;
        kuboRpcClients: Record<ModQueueSortName, {
            [kuboRpcClientUrl: string]: PagesIpfsGatewayClient;
        }>;
        plebbitRpcClients: Record<ModQueueSortName, {
            [rpcUrl: string]: PagesPlebbitRpcStateClient;
        }>;
        libp2pJsClients: Record<ModQueueSortName, {
            [libp2pJsClientKey: string]: PagesIpfsGatewayClient;
        }>;
    };
    protected getSortTypes(): ModQueueSortName[];
    fetchPage(pageCid: string): Promise<ModQueuePageIpfs>;
    protected preFetchPage(): void;
    protected parsePageJson(json: unknown): ModQueuePageIpfs;
    protected _requestPageFromRPC(pageCid: string, log: Logger, sortTypes: string[] | undefined): Promise<ModQueuePageIpfs>;
}
