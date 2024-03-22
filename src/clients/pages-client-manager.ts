import assert from "assert";
import { BasePages } from "../pages.js";
import { BaseClientsManager, LoadType } from "./base-client-manager.js";
import { PagesIpfsClient } from "./ipfs-client.js";
import { PagesIpfsGatewayClient } from "./ipfs-gateway-client.js";
import { PageIpfs, PostSortName, ReplySortName } from "../types.js";
import lodash from "lodash";
import { pageCidToSortTypesCache } from "../constants.js";
import { PagesPlebbitRpcStateClient } from "./plebbit-rpc-state-client.js";
import Logger from "@plebbit/plebbit-logger";
import { POSTS_SORT_TYPES, REPLIES_SORT_TYPES, isIpfsCid } from "../util.js";

export class BasePagesClientsManager extends BaseClientsManager {
    // pageClients.ipfsGateways['new']['https://ipfs.io']
    clients: {
        ipfsGateways: { [sortType: string]: { [ipfsGatewayUrl: string]: PagesIpfsGatewayClient } };
        ipfsClients: { [sortType: string]: { [ipfsClientUrl: string]: PagesIpfsClient } };
        plebbitRpcClients: { [sortType: string]: { [rpcUrl: string]: PagesPlebbitRpcStateClient } };
    };

    protected _pages: BasePages;

    constructor(pages: BasePages) {
        super(pages._plebbit);
        this._pages = pages;
        //@ts-expect-error
        this.clients = {};
        this._initIpfsGateways();
        this._initIpfsClients();
        this._initPlebbitRpcClients();

        if (pages.pageCids) this.updatePageCidsToSortTypes(pages.pageCids);
    }

    protected getSortTypes(): string[] {
        throw Error(`This method should be overridden`);
    }

    // Init functions here
    protected _initIpfsGateways() {
        this.clients.ipfsGateways = {};
        for (const sortType of this.getSortTypes()) {
            this.clients.ipfsGateways[sortType] = {};
            for (const gatewayUrl of Object.keys(this._plebbit.clients.ipfsGateways))
                this.clients.ipfsGateways[sortType][gatewayUrl] = new PagesIpfsGatewayClient("stopped");
        }
    }

    protected _initIpfsClients() {
        if (this._plebbit.clients.ipfsClients) {
            this.clients.ipfsClients = {};
            for (const sortType of this.getSortTypes()) {
                this.clients.ipfsClients[sortType] = {};
                for (const ipfsUrl of Object.keys(this._plebbit.clients.ipfsClients))
                    this.clients.ipfsClients[sortType][ipfsUrl] = new PagesIpfsClient("stopped");
            }
        }
    }

    protected _initPlebbitRpcClients() {
        if (this._plebbit.clients.plebbitRpcClients) {
            this.clients.plebbitRpcClients = {};
            for (const sortType of this.getSortTypes()) {
                this.clients.plebbitRpcClients[sortType] = {};
                for (const rpcUrl of Object.keys(this._plebbit.clients.plebbitRpcClients))
                    this.clients.plebbitRpcClients[sortType][rpcUrl] = new PagesPlebbitRpcStateClient("stopped");
            }
        }
    }

    // Override methods from BaseClientsManager here

    preFetchGateway(gatewayUrl: string, path: string, loadType: LoadType): void {
        const cid = path.split("/")[2];
        const sortTypes = pageCidToSortTypesCache.get(cid);

        this.updateGatewayState("fetching-ipfs", gatewayUrl, sortTypes);
    }

    postFetchGatewaySuccess(gatewayUrl: string, path: string, loadType: LoadType) {
        const cid = path.split("/")[2];
        const sortTypes = pageCidToSortTypesCache.get(cid);

        this.updateGatewayState("stopped", gatewayUrl, sortTypes);
    }

    postFetchGatewayFailure(gatewayUrl: string, path: string, loadType: LoadType) {
        this.postFetchGatewaySuccess(gatewayUrl, path, loadType);
    }

    postFetchGatewayAborted(gatewayUrl: string, path: string, loadType: LoadType): void {
        this.postFetchGatewaySuccess(gatewayUrl, path, loadType);
    }

    _updatePageCidsSortCache(pageCid: string, sortTypes: string[]) {
        const curSortTypes: string[] | undefined = pageCidToSortTypesCache.get(pageCid);
        if (!curSortTypes) {
            pageCidToSortTypesCache.set(pageCid, sortTypes);
        } else {
            const newSortTypes = lodash.uniq([...curSortTypes, ...sortTypes]);
            pageCidToSortTypesCache.set(pageCid, newSortTypes);
        }
    }

    updatePageCidsToSortTypes(newPageCids: BasePages["pageCids"]) {
        for (const [sortType, pageCid] of Object.entries(newPageCids)) this._updatePageCidsSortCache(pageCid, [sortType]);
    }

    updatePageCidsToSortTypesToIncludeSubsequent(nextPageCid: string, previousPageCid: string) {
        const sortTypes: string[] | undefined = pageCidToSortTypesCache.get(previousPageCid);
        if (!Array.isArray(sortTypes)) return;
        this._updatePageCidsSortCache(nextPageCid, sortTypes);
    }

    updateIpfsState(newState: PagesIpfsClient["state"], sortTypes: string[] | undefined) {
        if (!Array.isArray(sortTypes)) return;
        assert(typeof this._defaultIpfsProviderUrl === "string", "Can't update ipfs state without ipfs client");
        for (const sortType of sortTypes) {
            if (this.clients.ipfsClients[sortType][this._defaultIpfsProviderUrl].state === newState) continue;
            this.clients.ipfsClients[sortType][this._defaultIpfsProviderUrl].state = newState;
            this.clients.ipfsClients[sortType][this._defaultIpfsProviderUrl].emit("statechange", newState);
        }
    }

    updateGatewayState(newState: PagesIpfsGatewayClient["state"], gateway: string, sortTypes: string[] | undefined) {
        if (!Array.isArray(sortTypes)) return;
        for (const sortType of sortTypes) {
            if (this.clients.ipfsGateways[sortType][gateway].state === newState) continue;
            this.clients.ipfsGateways[sortType][gateway].state = newState;
            this.clients.ipfsGateways[sortType][gateway].emit("statechange", newState);
        }
    }

    updateRpcState(newState: PagesPlebbitRpcStateClient["state"], rpcUrl: string, sortTypes: string[] | undefined) {
        if (!Array.isArray(sortTypes)) return;
        for (const sortType of sortTypes) {
            if (this.clients.plebbitRpcClients[sortType][rpcUrl].state === newState) continue;
            this.clients.plebbitRpcClients[sortType][rpcUrl].state = newState;
            this.clients.plebbitRpcClients[sortType][rpcUrl].emit("statechange", newState);
        }
    }

    private async _fetchPageWithRpc(pageCid: string, log: Logger, sortTypes: string[] | undefined) {
        const currentRpcUrl = this._plebbit.plebbitRpcClientsOptions![0];

        log.trace(`Fetching page cid (${pageCid}) using rpc`);
        this.updateRpcState("fetching-ipfs", currentRpcUrl, sortTypes);
        try {
            const page = this._pages._parentCid
                ? await this._plebbit.plebbitRpcClient!.getCommentPage(pageCid, this._pages._parentCid, this._pages._subplebbitAddress)
                : await this._plebbit.plebbitRpcClient!.getSubplebbitPage(pageCid, this._pages._subplebbitAddress);
            this.updateRpcState("stopped", currentRpcUrl, sortTypes);

            return page;
        } catch (e) {
            log.error(`Failed to retrieve page (${pageCid}) with rpc due to error:`, e);
            this.updateRpcState("stopped", currentRpcUrl, sortTypes);
            throw e;
        }
    }

    private async _fetchPageWithIpfsP2P(pageCid: string, log: Logger, sortTypes: string[] | undefined) {
        this.updateIpfsState("fetching-ipfs", sortTypes);
        try {
            const page = <PageIpfs>JSON.parse(await this._fetchCidP2P(pageCid));
            this.updateIpfsState("stopped", sortTypes);
            return page;
        } catch (e) {
            this.updateIpfsState("stopped", sortTypes);
            log.error(`Failed to fetch the page (${pageCid}) due to error:`, e);
            throw e;
        }
    }
    async fetchPage(pageCid: string): Promise<PageIpfs> {
        if (!isIpfsCid(pageCid)) throw Error(`fetchPage: pageCid (${pageCid}) is not a valid CID`);

        const log = Logger("plebbit-js:pages:getPage");
        const sortTypes: string[] | undefined = pageCidToSortTypesCache.get(pageCid);
        let page: PageIpfs;
        if (this._plebbit.plebbitRpcClient) page = await this._fetchPageWithRpc(pageCid, log, sortTypes);
        else if (this._defaultIpfsProviderUrl) page = await this._fetchPageWithIpfsP2P(pageCid, log, sortTypes);
        else page = JSON.parse(await this.fetchFromMultipleGateways({ cid: pageCid }, "generic-ipfs"));

        if (page.nextCid) this.updatePageCidsToSortTypesToIncludeSubsequent(page.nextCid, pageCid);
        return page;
    }
}

export class RepliesPagesClientsManager extends BasePagesClientsManager {
    clients!: {
        ipfsGateways: Record<ReplySortName, { [ipfsGatewayUrl: string]: PagesIpfsGatewayClient }>;
        ipfsClients: Record<ReplySortName, { [ipfsClientUrl: string]: PagesIpfsGatewayClient }>;
        plebbitRpcClients: Record<ReplySortName, { [rpcUrl: string]: PagesPlebbitRpcStateClient }>;
    };

    protected getSortTypes() {
        return Object.keys(REPLIES_SORT_TYPES);
    }
}

export class PostsPagesClientsManager extends BasePagesClientsManager {
    clients!: {
        ipfsGateways: Record<PostSortName, { [ipfsGatewayUrl: string]: PagesIpfsGatewayClient }>;
        ipfsClients: Record<PostSortName, { [ipfsClientUrl: string]: PagesIpfsGatewayClient }>;
        plebbitRpcClients: Record<PostSortName, { [rpcUrl: string]: PagesPlebbitRpcStateClient }>;
    };

    protected getSortTypes() {
        return Object.keys(POSTS_SORT_TYPES);
    }
}
