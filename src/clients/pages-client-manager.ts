import assert from "assert";
import { BasePages } from "../pages";
import { BaseClientsManager, LoadType } from "./base-client-manager";
import { PagesIpfsClient } from "./ipfs-client";
import { PagesIpfsGatewayClient } from "./ipfs-gateway-client";
import { PageIpfs, PostSortName, ReplySortName } from "../types";
import { POSTS_SORT_TYPES, REPLIES_SORT_TYPES } from "../sort-handler";
import { lru } from "tiny-lru";
import lodash from "lodash";

export const pageCidToSortTypesCache = lru(500, 0);

export class BasePagesClientsManager extends BaseClientsManager {
    // pageClients.ipfsGateways['new']['https://ipfs.io']
    clients: {
        ipfsGateways: { [sortType: string]: { [ipfsGatewayUrl: string]: PagesIpfsGatewayClient } };
        ipfsClients: { [sortType: string]: { [ipfsClientUrl: string]: PagesIpfsClient } };
    };

    constructor(pages: BasePages) {
        super(pages._plebbit);
        //@ts-expect-error
        this.clients = {};
        this._initIpfsGateways();
        this._initIpfsClients();

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

    // Override methods from BaseClientsManager here

    preFetchGateway(gatewayUrl: string, path: string, loadType: LoadType): void {
        const cid = path.split("/")[2];
        const sortTypes: string[] | undefined = pageCidToSortTypesCache.get(cid);

        this.updateGatewayState("fetching-ipfs", gatewayUrl, sortTypes);
    }

    postFetchGatewaySuccess(gatewayUrl: string, path: string, loadType: LoadType) {
        const cid = path.split("/")[2];
        const sortTypes: string[] | undefined = pageCidToSortTypesCache.get(cid);

        this.updateGatewayState("stopped", gatewayUrl, sortTypes);
    }

    postFetchGatewayFailure(gatewayUrl: string, path: string, loadType: LoadType) {
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
        for (const sortType of Object.keys(newPageCids)) {
            const pageCid = newPageCids[sortType];
            this._updatePageCidsSortCache(pageCid, [sortType]);
        }
    }

    updatePageCidsToSortTypesToIncludeSubsequent(nextPageCid: string, previousPageCid: string) {
        const sortTypes: string[] | undefined = pageCidToSortTypesCache.get(previousPageCid);
        assert(Array.isArray(sortTypes));
        this._updatePageCidsSortCache(nextPageCid, sortTypes);
    }

    updateIpfsState(newState: PagesIpfsClient["state"], sortTypes: string[]) {
        assert(Array.isArray(sortTypes), "Can't determine sort type");
        assert(typeof this._defaultIpfsProviderUrl === "string");
        for (const sortType of sortTypes) {
            this.clients.ipfsClients[sortType][this._defaultIpfsProviderUrl].state = newState;
            this.clients.ipfsClients[sortType][this._defaultIpfsProviderUrl].emit("statechange", newState);
        }
    }

    updateGatewayState(newState: PagesIpfsGatewayClient["state"], gateway: string, sortTypes: string[]) {
        assert(Array.isArray(sortTypes), "Can't determine sort type");
        for (const sortType of sortTypes) {
            this.clients.ipfsGateways[sortType][gateway].state = newState;
            this.clients.ipfsGateways[sortType][gateway].emit("statechange", newState);
        }
    }

    async fetchPage(pageCid: string): Promise<PageIpfs> {
        if (this._defaultIpfsProviderUrl) {
            const sortTypes: string[] | undefined = pageCidToSortTypesCache.get(pageCid);
            assert(Array.isArray(sortTypes), "Page cid is not mapped to a sort type");
            this.updateIpfsState("fetching-ipfs", sortTypes);
            const page: PageIpfs = JSON.parse(await this._fetchCidP2P(pageCid));
            this.updateIpfsState("stopped", sortTypes);
            if (page.nextCid) this.updatePageCidsToSortTypesToIncludeSubsequent(page.nextCid, pageCid);
            return page;
        } else {
            const page: PageIpfs = JSON.parse(await this.fetchFromMultipleGateways({ cid: pageCid }, "generic-ipfs"));
            if (page.nextCid) this.updatePageCidsToSortTypesToIncludeSubsequent(page.nextCid, pageCid);
            return page;
        }
    }
}

export class RepliesPagesClientsManager extends BasePagesClientsManager {
    clients: {
        ipfsGateways: Record<ReplySortName, { [ipfsGatewayUrl: string]: PagesIpfsGatewayClient }>;
        ipfsClients: Record<ReplySortName, { [ipfsClientUrl: string]: PagesIpfsGatewayClient }>;
    };

    _pageCidsToSortTypes: Record<string, ReplySortName[]>;

    protected getSortTypes() {
        return Object.keys(REPLIES_SORT_TYPES);
    }
}

export class PostsPagesClientsManager extends BasePagesClientsManager {
    clients: {
        ipfsGateways: Record<PostSortName, { [ipfsGatewayUrl: string]: PagesIpfsGatewayClient }>;
        ipfsClients: Record<PostSortName, { [ipfsClientUrl: string]: PagesIpfsGatewayClient }>;
    };

    _pageCidsToSortTypes: Record<string, PostSortName[]>;

    protected getSortTypes() {
        return Object.keys(POSTS_SORT_TYPES);
    }
}
