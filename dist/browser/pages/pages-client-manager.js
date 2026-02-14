import { BaseClientsManager } from "../clients/base-client-manager.js";
import * as remeda from "remeda";
import Logger from "@plebbit/plebbit-logger";
import { POSTS_SORT_TYPES, POST_REPLIES_SORT_TYPES } from "./util.js";
import { parseJsonWithPlebbitErrorIfFails, parseModQueuePageIpfsSchemaWithPlebbitErrorIfItFails, parsePageIpfsSchemaWithPlebbitErrorIfItFails } from "../schema/schema-util.js";
import { hideClassPrivateProps } from "../util.js";
import { sha256 } from "js-sha256";
import { PagesIpfsGatewayClient, PagesKuboRpcClient, PagesLibp2pJsClient, PagesPlebbitRpcStateClient } from "./pages-clients.js";
export class BasePagesClientsManager extends BaseClientsManager {
    constructor(opts) {
        super(opts.plebbit);
        this._pages = opts.pages;
        //@ts-expect-error
        this.clients = {};
        this._updateIpfsGatewayClientStates(this.getSortTypes());
        this._updateKuboRpcClientStates(this.getSortTypes());
        this._updatePlebbitRpcClientStates(this.getSortTypes());
        this._updateLibp2pJsClientStates(this.getSortTypes());
        if (opts.pages.pageCids)
            this.updatePageCidsToSortTypes(opts.pages.pageCids);
        hideClassPrivateProps(this);
    }
    // Init functions here
    _updateIpfsGatewayClientStates(sortTypes) {
        if (!this.clients.ipfsGateways)
            this.clients.ipfsGateways = {};
        for (const sortType of sortTypes) {
            if (!this.clients.ipfsGateways[sortType])
                this.clients.ipfsGateways[sortType] = {};
            for (const gatewayUrl of remeda.keys.strict(this._plebbit.clients.ipfsGateways))
                if (!this.clients.ipfsGateways[sortType][gatewayUrl])
                    this.clients.ipfsGateways[sortType][gatewayUrl] = new PagesIpfsGatewayClient("stopped");
        }
    }
    _updateKuboRpcClientStates(sortTypes) {
        if (this._plebbit.clients.kuboRpcClients && !this.clients.kuboRpcClients)
            this.clients.kuboRpcClients = {};
        for (const sortType of sortTypes) {
            if (!this.clients.kuboRpcClients[sortType])
                this.clients.kuboRpcClients[sortType] = {};
            for (const kuboRpcUrl of remeda.keys.strict(this._plebbit.clients.kuboRpcClients))
                if (!this.clients.kuboRpcClients[sortType][kuboRpcUrl])
                    this.clients.kuboRpcClients[sortType][kuboRpcUrl] = new PagesKuboRpcClient("stopped");
        }
    }
    _updateLibp2pJsClientStates(sortTypes) {
        if (this._plebbit.clients.libp2pJsClients && !this.clients.libp2pJsClients)
            this.clients.libp2pJsClients = {};
        for (const sortType of sortTypes) {
            if (!this.clients.libp2pJsClients[sortType])
                this.clients.libp2pJsClients[sortType] = {};
            for (const libp2pJsClientKey of remeda.keys.strict(this._plebbit.clients.libp2pJsClients))
                if (!this.clients.libp2pJsClients[sortType][libp2pJsClientKey])
                    this.clients.libp2pJsClients[sortType][libp2pJsClientKey] = new PagesLibp2pJsClient("stopped");
        }
    }
    _updatePlebbitRpcClientStates(sortTypes) {
        if (this._plebbit.clients.plebbitRpcClients && !this.clients.plebbitRpcClients)
            this.clients.plebbitRpcClients = {};
        for (const sortType of sortTypes) {
            if (!this.clients.plebbitRpcClients[sortType])
                this.clients.plebbitRpcClients[sortType] = {};
            for (const rpcUrl of remeda.keys.strict(this._plebbit.clients.plebbitRpcClients))
                if (!this.clients.plebbitRpcClients[sortType][rpcUrl])
                    this.clients.plebbitRpcClients[sortType][rpcUrl] = new PagesPlebbitRpcStateClient("stopped");
        }
    }
    // Override methods from BaseClientsManager here
    preFetchGateway(gatewayUrl, loadOpts) {
        const cid = loadOpts.root;
        const sortTypes = this._plebbit._memCaches.pageCidToSortTypes.get(cid);
        this.updateGatewayState("fetching-ipfs", gatewayUrl, sortTypes);
    }
    postFetchGatewaySuccess(gatewayUrl, loadOpts) {
        const cid = loadOpts.root;
        const sortTypes = this._plebbit._memCaches.pageCidToSortTypes.get(cid);
        this.updateGatewayState("stopped", gatewayUrl, sortTypes);
    }
    postFetchGatewayFailure(gatewayUrl, loadOpts) {
        this.postFetchGatewaySuccess(gatewayUrl, loadOpts);
    }
    postFetchGatewayAborted(gatewayUrl, loadOpts) {
        this.postFetchGatewaySuccess(gatewayUrl, loadOpts);
    }
    _updatePageCidsSortCache(pageCid, sortTypes) {
        const curSortTypes = this._plebbit._memCaches.pageCidToSortTypes.get(pageCid);
        if (!curSortTypes) {
            this._plebbit._memCaches.pageCidToSortTypes.set(pageCid, sortTypes);
        }
        else {
            const newSortTypes = remeda.unique([...curSortTypes, ...sortTypes]);
            this._plebbit._memCaches.pageCidToSortTypes.set(pageCid, newSortTypes);
        }
    }
    updatePageCidsToSortTypes(newPageCids) {
        for (const [sortType, pageCid] of Object.entries(newPageCids)) {
            this._updatePageCidsSortCache(pageCid, [sortType]);
        }
        this._updateIpfsGatewayClientStates(Object.keys(newPageCids));
        this._updateKuboRpcClientStates(Object.keys(newPageCids));
        this._updatePlebbitRpcClientStates(Object.keys(newPageCids));
    }
    _calculatePageMaxSizeCacheKey(pageCid) {
        return sha256(this._pages._subplebbit.address + pageCid);
    }
    updatePagesMaxSizeCache(newPageCids, pageMaxSizeBytes) {
        remeda
            .unique(newPageCids)
            .forEach((pageCid) => this._plebbit._memCaches.pagesMaxSize.set(this._calculatePageMaxSizeCacheKey(pageCid), pageMaxSizeBytes));
    }
    updatePageCidsToSortTypesToIncludeSubsequent(nextPageCid, previousPageCid) {
        const sortTypes = this._plebbit._memCaches.pageCidToSortTypes.get(previousPageCid);
        if (!Array.isArray(sortTypes))
            return;
        this._updatePageCidsSortCache(nextPageCid, sortTypes);
    }
    updateKuboRpcState(newState, kuboRpcClientUrl, sortTypes) {
        if (!Array.isArray(sortTypes))
            return;
        for (const sortType of sortTypes) {
            if (this.clients.kuboRpcClients[sortType][kuboRpcClientUrl].state === newState)
                continue;
            this.clients.kuboRpcClients[sortType][kuboRpcClientUrl].state = newState;
            this.clients.kuboRpcClients[sortType][kuboRpcClientUrl].emit("statechange", newState);
        }
    }
    updateLibp2pJsClientState(newState, libp2pJsClientKey, sortTypes) {
        if (!Array.isArray(sortTypes))
            return;
        for (const sortType of sortTypes) {
            if (this.clients.libp2pJsClients[sortType][libp2pJsClientKey].state === newState)
                continue;
            this.clients.libp2pJsClients[sortType][libp2pJsClientKey].state = newState;
            this.clients.libp2pJsClients[sortType][libp2pJsClientKey].emit("statechange", newState);
        }
    }
    updateGatewayState(newState, gateway, sortTypes) {
        if (!Array.isArray(sortTypes))
            return;
        for (const sortType of sortTypes) {
            if (this.clients.ipfsGateways[sortType][gateway].state === newState)
                continue;
            this.clients.ipfsGateways[sortType][gateway].state = newState;
            this.clients.ipfsGateways[sortType][gateway].emit("statechange", newState);
        }
    }
    updateRpcState(newState, rpcUrl, sortTypes) {
        if (!Array.isArray(sortTypes))
            return;
        for (const sortType of sortTypes) {
            if (this.clients.plebbitRpcClients[sortType][rpcUrl].state === newState)
                continue;
            this.clients.plebbitRpcClients[sortType][rpcUrl].state = newState;
            this.clients.plebbitRpcClients[sortType][rpcUrl].emit("statechange", newState);
        }
    }
    _updateKuboRpcClientOrHeliaState(newState, kuboRpcOrHelia, sortTypes) {
        if ("_helia" in kuboRpcOrHelia)
            this.updateLibp2pJsClientState(newState, kuboRpcOrHelia._libp2pJsClientsOptions.key, sortTypes);
        else
            this.updateKuboRpcState(newState, kuboRpcOrHelia.url, sortTypes);
    }
    preFetchPage() {
        throw Error("should be implemented");
    }
    async _requestPageFromRPC(opts) {
        throw Error("Should be implemented");
    }
    async _fetchPageWithRpc(opts) {
        const currentRpcUrl = this._plebbit.plebbitRpcClientsOptions[0];
        this.preFetchPage();
        opts.log.trace(`Fetching page cid (${opts.pageCid}) using rpc`);
        this.updateRpcState("fetching-ipfs", currentRpcUrl, opts.sortTypes);
        try {
            return this._requestPageFromRPC(opts);
        }
        catch (e) {
            opts.log.error(`Failed to retrieve page (${opts.pageCid}) with rpc due to error:`, e);
            throw e;
        }
        finally {
            this.updateRpcState("stopped", currentRpcUrl, opts.sortTypes);
        }
    }
    parsePageJson(json) {
        // default validator; subclasses can override
        return parsePageIpfsSchemaWithPlebbitErrorIfItFails(json);
    }
    async _fetchPageWithKuboOrHeliaP2P(pageCid, log, sortTypes, pageMaxSize) {
        const heliaOrKubo = this.getDefaultKuboRpcClientOrHelia();
        this._updateKuboRpcClientOrHeliaState("fetching-ipfs", heliaOrKubo, sortTypes);
        const pageTimeoutMs = this._plebbit._timeouts["page-ipfs"];
        try {
            return this.parsePageJson(parseJsonWithPlebbitErrorIfFails(await this._fetchCidP2P(pageCid, { maxFileSizeBytes: pageMaxSize, timeoutMs: pageTimeoutMs })));
        }
        catch (e) {
            //@ts-expect-error
            e.details = { ...e.details, pageCid, sortTypes, pageMaxSize };
            log.error(`Failed to fetch the page (${pageCid}) due to error:`, e);
            throw e;
        }
        finally {
            this._updateKuboRpcClientOrHeliaState("stopped", heliaOrKubo, sortTypes);
        }
    }
    async _fetchPageFromGateways(pageCid, log, pageMaxSize) {
        // No need to validate schema for every gateway, because the cid validation will make sure it's the page ipfs we're looking for
        // we just need to validate the end result's schema
        const res = await this.fetchFromMultipleGateways({
            root: pageCid,
            recordIpfsType: "ipfs",
            recordPlebbitType: "page-ipfs",
            validateGatewayResponseFunc: async () => { },
            maxFileSizeBytes: pageMaxSize,
            timeoutMs: this._plebbit._timeouts["page-ipfs"],
            log
        });
        const pageIpfs = this.parsePageJson(parseJsonWithPlebbitErrorIfFails(res.resText));
        return pageIpfs;
    }
    async fetchPage(pageCid, overridePageMaxSize) {
        const log = Logger("plebbit-js:pages:getPage");
        const sortTypesFromPageCids = remeda.keys
            .strict(this._pages.pageCids)
            .filter((sortType) => this._pages.pageCids[sortType] === pageCid);
        if (sortTypesFromPageCids.length > 0) {
            this.updatePageCidsToSortTypes(this._pages.pageCids);
        }
        const sortTypesFromMemcache = this._plebbit._memCaches.pageCidToSortTypes.get(pageCid);
        const isFirstPage = Object.values(this._pages.pageCids).includes(pageCid) || remeda.isEmpty(this._pages.pageCids);
        const pageMaxSize = overridePageMaxSize
            ? overridePageMaxSize
            : this._plebbit._memCaches.pagesMaxSize.get(this._calculatePageMaxSizeCacheKey(pageCid))
                ? this._plebbit._memCaches.pagesMaxSize.get(this._calculatePageMaxSizeCacheKey(pageCid))
                : isFirstPage
                    ? 1024 * 1024
                    : undefined;
        if (!pageMaxSize)
            throw Error("Failed to calculate max page size. Is this page cid under the correct subplebbit/comment?");
        let page;
        try {
            if (this._plebbit._plebbitRpcClient) {
                page = await this._fetchPageWithRpc({ pageCid, log, sortTypes: sortTypesFromMemcache, pageMaxSize });
            }
            else if (Object.keys(this._plebbit.clients.kuboRpcClients).length > 0 ||
                Object.keys(this._plebbit.clients.libp2pJsClients).length > 0)
                page = await this._fetchPageWithKuboOrHeliaP2P(pageCid, log, sortTypesFromMemcache, pageMaxSize);
            else
                page = await this._fetchPageFromGateways(pageCid, log, pageMaxSize);
        }
        catch (e) {
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
    getSortTypes() {
        throw Error("This function should be overridden");
    }
}
export class RepliesPagesClientsManager extends BasePagesClientsManager {
    getSortTypes() {
        return remeda.keys.strict(POST_REPLIES_SORT_TYPES);
    }
    preFetchPage() {
        if (!this._pages._parentComment)
            throw Error("parent comment needs to be defined");
        if (!this._pages._parentComment?.cid)
            throw Error("Parent comment cid is not defined");
    }
    async _requestPageFromRPC(opts) {
        return this._plebbit._plebbitRpcClient.getCommentPage({
            cid: opts.pageCid,
            commentCid: this._pages._parentComment.cid,
            subplebbitAddress: this._pages._subplebbit.address,
            pageMaxSize: opts.pageMaxSize
        });
    }
}
export class SubplebbitPostsPagesClientsManager extends BasePagesClientsManager {
    getSortTypes() {
        return remeda.keys.strict(POSTS_SORT_TYPES);
    }
    preFetchPage() {
        if (!this._pages._subplebbit)
            throw Error("Subplebbit needs to be defined");
        if (!this._pages._subplebbit.address)
            throw Error("Subplebbit address is not defined");
    }
    async _requestPageFromRPC(opts) {
        return this._plebbit._plebbitRpcClient.getSubplebbitPage({
            cid: opts.pageCid,
            subplebbitAddress: this._pages._subplebbit.address,
            type: "posts",
            pageMaxSize: opts.pageMaxSize
        });
    }
}
export class SubplebbitModQueueClientsManager extends BasePagesClientsManager {
    getSortTypes() {
        return ["pendingApproval"];
    }
    async fetchPage(pageCid, overridePageMaxSize) {
        return await super.fetchPage(pageCid, overridePageMaxSize);
    }
    preFetchPage() {
        if (!this._pages._subplebbit)
            throw Error("Subplebbit needs to be defined");
        if (!this._pages._subplebbit.address)
            throw Error("Subplebbit address is not defined");
    }
    parsePageJson(json) {
        // Validate using the ModQueue page schema, then coerce to PageIpfs for consumers
        return parseModQueuePageIpfsSchemaWithPlebbitErrorIfItFails(json);
    }
    async _requestPageFromRPC(opts) {
        return this._plebbit._plebbitRpcClient.getSubplebbitPage({
            type: "modqueue",
            cid: opts.pageCid,
            subplebbitAddress: this._pages._subplebbit.address,
            pageMaxSize: opts.pageMaxSize
        });
    }
}
//# sourceMappingURL=pages-client-manager.js.map