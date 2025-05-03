import assert from "assert";
import { BaseClientsManager, OptionsToLoadFromGateway } from "./base-client-manager.js";
import { PagesKuboRpcClient } from "./ipfs-client.js";
import { PagesIpfsGatewayClient } from "./ipfs-gateway-client.js";
import { PageIpfs, PostSortName, ReplySortName } from "../pages/types.js";
import * as remeda from "remeda";
import { PagesPlebbitRpcStateClient } from "./rpc-client/plebbit-rpc-state-client.js";
import Logger from "@plebbit/plebbit-logger";
import { BasePages, PostsPages, RepliesPages } from "../pages/pages.js";
import { POSTS_SORT_TYPES, POST_REPLIES_SORT_TYPES } from "../pages/util.js";
import { parseJsonWithPlebbitErrorIfFails, parsePageIpfsSchemaWithPlebbitErrorIfItFails } from "../schema/schema-util.js";
import { hideClassPrivateProps } from "../util.js";
import { Plebbit } from "../plebbit/plebbit.js";
import { sha256 } from "js-sha256";

export class BasePagesClientsManager extends BaseClientsManager {
    clients: {
        ipfsGateways: { [sortType: string]: { [ipfsGatewayUrl: string]: PagesIpfsGatewayClient } };
        kuboRpcClients: { [sortType: string]: { [kuboRpcClientUrl: string]: PagesKuboRpcClient } };
        plebbitRpcClients: { [sortType: string]: { [rpcUrl: string]: PagesPlebbitRpcStateClient } };
    };

    protected _pages: RepliesPages | PostsPages;

    constructor(opts: { pages: RepliesPages | PostsPages; plebbit: Plebbit }) {
        super(opts.plebbit);
        this._pages = opts.pages;
        //@ts-expect-error
        this.clients = {};
        this._initIpfsGateways();
        this._initIpfsClients();
        this._initPlebbitRpcClients();

        if (opts.pages.pageCids) this.updatePageCidsToSortTypes(opts.pages.pageCids);
        hideClassPrivateProps(this);
    }

    // Init functions here
    protected _initIpfsGateways() {
        this.clients.ipfsGateways = {};
    }

    protected _initIpfsClients() {
        if (this._plebbit.clients.kuboRpcClients) this.clients.kuboRpcClients = {};
    }

    protected _initPlebbitRpcClients() {
        if (this._plebbit.clients.plebbitRpcClients) this.clients.plebbitRpcClients = {};
    }

    // Override methods from BaseClientsManager here

    override preFetchGateway(gatewayUrl: string, loadOpts: OptionsToLoadFromGateway): void {
        const cid = loadOpts.root;
        const sortTypes = this._plebbit._memCaches.pageCidToSortTypes.get(cid);

        this.updateGatewayState("fetching-ipfs", gatewayUrl, sortTypes);
    }

    override postFetchGatewaySuccess(gatewayUrl: string, loadOpts: OptionsToLoadFromGateway) {
        const cid = loadOpts.root;
        const sortTypes = this._plebbit._memCaches.pageCidToSortTypes.get(cid);

        this.updateGatewayState("stopped", gatewayUrl, sortTypes);
    }

    override postFetchGatewayFailure(gatewayUrl: string, loadOpts: OptionsToLoadFromGateway) {
        this.postFetchGatewaySuccess(gatewayUrl, loadOpts);
    }

    override postFetchGatewayAborted(gatewayUrl: string, loadOpts: OptionsToLoadFromGateway): void {
        this.postFetchGatewaySuccess(gatewayUrl, loadOpts);
    }

    _updatePageCidsSortCache(pageCid: string, sortTypes: string[]) {
        const curSortTypes: string[] | undefined = this._plebbit._memCaches.pageCidToSortTypes.get(pageCid);
        if (!curSortTypes) {
            this._plebbit._memCaches.pageCidToSortTypes.set(pageCid, sortTypes);
        } else {
            const newSortTypes = remeda.unique([...curSortTypes, ...sortTypes]);
            this._plebbit._memCaches.pageCidToSortTypes.set(pageCid, newSortTypes);
        }
    }

    updatePageCidsToSortTypes(newPageCids: BasePages["pageCids"]) {
        for (const [sortType, pageCid] of Object.entries(newPageCids)) this._updatePageCidsSortCache(pageCid, [sortType]);
    }

    private _calculatePageMaxSizeCacheKey(pageCid: string) {
        return sha256(this._pages._subplebbit.address + pageCid);
    }

    updatePagesMaxSizeCache(newPageCids: string[], pageMaxSizeBytes: number) {
        remeda
            .unique(newPageCids)
            .forEach((pageCid) => this._plebbit._memCaches.pagesMaxSize.set(this._calculatePageMaxSizeCacheKey(pageCid), pageMaxSizeBytes));
    }

    updatePageCidsToSortTypesToIncludeSubsequent(nextPageCid: string, previousPageCid: string) {
        const sortTypes: string[] | undefined = this._plebbit._memCaches.pageCidToSortTypes.get(previousPageCid);
        if (!Array.isArray(sortTypes)) return;
        this._updatePageCidsSortCache(nextPageCid, sortTypes);
    }

    updateIpfsState(newState: PagesKuboRpcClient["state"], sortTypes: string[] | undefined) {
        if (!Array.isArray(sortTypes)) return;
        assert(typeof this._defaultIpfsProviderUrl === "string", "Can't update ipfs state without ipfs client");
        for (const sortType of sortTypes) {
            if (!this.clients.kuboRpcClients[sortType]) this.clients.kuboRpcClients[sortType] = {};
            if (!this.clients.kuboRpcClients[sortType][this._defaultIpfsProviderUrl])
                this.clients.kuboRpcClients[sortType][this._defaultIpfsProviderUrl] = new PagesKuboRpcClient("stopped");
            if (this.clients.kuboRpcClients[sortType][this._defaultIpfsProviderUrl].state === newState) continue;
            this.clients.kuboRpcClients[sortType][this._defaultIpfsProviderUrl].state = newState;
            this.clients.kuboRpcClients[sortType][this._defaultIpfsProviderUrl].emit("statechange", newState);
        }
    }

    updateGatewayState(newState: PagesIpfsGatewayClient["state"], gateway: string, sortTypes: string[] | undefined) {
        if (!Array.isArray(sortTypes)) return;
        for (const sortType of sortTypes) {
            if (!this.clients.ipfsGateways[sortType]) this.clients.ipfsGateways[sortType] = {};
            if (!this.clients.ipfsGateways[sortType][gateway])
                this.clients.ipfsGateways[sortType][gateway] = new PagesIpfsGatewayClient("stopped");
            if (this.clients.ipfsGateways[sortType][gateway].state === newState) continue;
            this.clients.ipfsGateways[sortType][gateway].state = newState;
            this.clients.ipfsGateways[sortType][gateway].emit("statechange", newState);
        }
    }

    updateRpcState(newState: PagesPlebbitRpcStateClient["state"], rpcUrl: string, sortTypes: string[] | undefined) {
        if (!Array.isArray(sortTypes)) return;
        for (const sortType of sortTypes) {
            if (!this.clients.plebbitRpcClients[sortType]) this.clients.plebbitRpcClients[sortType] = {};
            if (!this.clients.plebbitRpcClients[sortType][rpcUrl])
                this.clients.plebbitRpcClients[sortType][rpcUrl] = new PagesPlebbitRpcStateClient("stopped");
            if (this.clients.plebbitRpcClients[sortType][rpcUrl].state === newState) continue;
            this.clients.plebbitRpcClients[sortType][rpcUrl].state = newState;
            this.clients.plebbitRpcClients[sortType][rpcUrl].emit("statechange", newState);
        }
    }

    private async _fetchPageWithRpc(pageCid: string, log: Logger, sortTypes: string[] | undefined) {
        const currentRpcUrl = this._plebbit.plebbitRpcClientsOptions![0];

        if (this._pages._parentComment && !this._pages._parentComment?.cid) throw Error("Parent comment cid is not defined");
        log.trace(`Fetching page cid (${pageCid}) using rpc`);
        this.updateRpcState("fetching-ipfs", currentRpcUrl, sortTypes);

        try {
            return this._pages._parentComment
                ? await this._plebbit._plebbitRpcClient!.getCommentPage(
                      pageCid,
                      this._pages._parentComment.cid!,
                      this._pages._subplebbit.address
                  )
                : await this._plebbit._plebbitRpcClient!.getSubplebbitPage(pageCid, this._pages._subplebbit.address);
        } catch (e) {
            log.error(`Failed to retrieve page (${pageCid}) with rpc due to error:`, e);
            throw e;
        } finally {
            this.updateRpcState("stopped", currentRpcUrl, sortTypes);
        }
    }

    private async _fetchPageWithIpfsP2P(
        pageCid: string,
        log: Logger,
        sortTypes: string[] | undefined,
        pageMaxSize: number
    ): Promise<PageIpfs> {
        this.updateIpfsState("fetching-ipfs", sortTypes);
        const pageTimeoutMs = this._plebbit._timeouts["page-ipfs"];
        try {
            return parsePageIpfsSchemaWithPlebbitErrorIfItFails(
                parseJsonWithPlebbitErrorIfFails(
                    await this._fetchCidP2P(pageCid, { maxFileSizeBytes: pageMaxSize, timeoutMs: pageTimeoutMs })
                )
            );
        } catch (e) {
            //@ts-expect-error
            e.details = { ...e.details, pageCid, sortTypes, pageMaxSize };
            log.error(`Failed to fetch the page (${pageCid}) due to error:`, e);
            throw e;
        } finally {
            this.updateIpfsState("stopped", sortTypes);
        }
    }

    async _fetchPageFromGateways(pageCid: string, log: Logger, pageMaxSize: number): Promise<PageIpfs> {
        // No need to validate schema for every gateway, because the cid validation will make sure it's the page ipfs we're looking for
        // we just need to validate the end result's schema
        const res = await this.fetchFromMultipleGateways({
            root: pageCid,
            recordIpfsType: "ipfs",
            recordPlebbitType: "page-ipfs",
            validateGatewayResponseFunc: async () => {},
            maxFileSizeBytes: pageMaxSize,
            timeoutMs: this._plebbit._timeouts["page-ipfs"],
            log
        });
        const pageIpfs = parsePageIpfsSchemaWithPlebbitErrorIfItFails(parseJsonWithPlebbitErrorIfFails(res.resText));

        return pageIpfs;
    }
    async fetchPage(pageCid: string): Promise<PageIpfs> {
        const log = Logger("plebbit-js:pages:getPage");
        const sortTypesFromPageCids = remeda.keys
            .strict(this._pages.pageCids)
            .filter((sortType) => this._pages.pageCids[sortType] === pageCid);
        if (sortTypesFromPageCids.length > 0) {
            this.updatePageCidsToSortTypes(this._pages.pageCids);
        }
        const sortTypesFromMemcache: string[] | undefined = this._plebbit._memCaches.pageCidToSortTypes.get(pageCid);

        const isFirstPage = Object.values(this._pages.pageCids).includes(pageCid) || remeda.isEmpty(this._pages.pageCids);
        const pageMaxSize = this._plebbit._memCaches.pagesMaxSize.get(this._calculatePageMaxSizeCacheKey(pageCid))
            ? this._plebbit._memCaches.pagesMaxSize.get(this._calculatePageMaxSizeCacheKey(pageCid))
            : isFirstPage
              ? 1024 * 1024
              : undefined;
        if (!pageMaxSize) throw Error("Failed to calculate max page size. Is this page cid under the correct subplebbit/comment?");
        let page: PageIpfs;
        try {
            if (this._plebbit._plebbitRpcClient) page = await this._fetchPageWithRpc(pageCid, log, sortTypesFromMemcache);
            else if (this._defaultIpfsProviderUrl)
                page = await this._fetchPageWithIpfsP2P(pageCid, log, sortTypesFromMemcache, pageMaxSize);
            else page = await this._fetchPageFromGateways(pageCid, log, pageMaxSize);
        } catch (e) {
            //@ts-expect-error
            e.details = { ...e.details, pageCid, pageMaxSize, isFirstPage, sortTypesFromPageCids, sortTypesFromMemcache };
            throw e;
        }

        if (page.nextCid) {
            this.updatePageCidsToSortTypesToIncludeSubsequent(page.nextCid, pageCid);
            this.updatePagesMaxSizeCache([page.nextCid], pageMaxSize * 2);
        }
        return page;
    }
}

export class RepliesPagesClientsManager extends BasePagesClientsManager {
    override clients!: {
        ipfsGateways: Record<ReplySortName, { [ipfsGatewayUrl: string]: PagesIpfsGatewayClient }>;
        kuboRpcClients: Record<ReplySortName, { [kuboRpcClientUrl: string]: PagesIpfsGatewayClient }>;
        plebbitRpcClients: Record<ReplySortName, { [rpcUrl: string]: PagesPlebbitRpcStateClient }>;
    };
}

export class PostsPagesClientsManager extends BasePagesClientsManager {
    override clients!: {
        ipfsGateways: Record<PostSortName, { [ipfsGatewayUrl: string]: PagesIpfsGatewayClient }>;
        kuboRpcClients: Record<PostSortName, { [kuboRpcClientUrl: string]: PagesIpfsGatewayClient }>;
        plebbitRpcClients: Record<PostSortName, { [rpcUrl: string]: PagesPlebbitRpcStateClient }>;
    };
}
