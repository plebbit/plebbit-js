import { getPostUpdateTimestampRange, throwWithErrorCode, timestamp } from "../util.js";
import assert from "assert";
import { verifySubplebbit } from "../signer/index.js";
import lodash from "lodash";
import { cid as isIpfsCid, path as isIpfsPath } from "is-ipfs";
import { PlebbitError } from "../plebbit-error.js";
import { CommentIpfsClient, GenericIpfsClient, PublicationIpfsClient, SubplebbitIpfsClient } from "./ipfs-client.js";
import { GenericPubsubClient, PublicationPubsubClient, SubplebbitPubsubClient } from "./pubsub-client.js";
import { GenericChainProviderClient } from "./chain-provider-client.js";
import { GenericIpfsGatewayClient } from "./ipfs-gateway-client.js";
import { BaseClientsManager } from "./base-client-manager.js";
import { commentPostUpdatesParentsPathConfig, postTimestampConfig, subplebbitForPublishingCache } from "../constants.js";
import { CommentPlebbitRpcStateClient, GenericPlebbitRpcStateClient, PublicationPlebbitRpcStateClient, SubplebbitPlebbitRpcStateClient } from "./plebbit-rpc-state-client.js";
import Logger from "@plebbit/plebbit-logger";
import pLimit from "p-limit";
export class ClientsManager extends BaseClientsManager {
    constructor(plebbit) {
        super(plebbit);
        //@ts-expect-error
        this.clients = {};
        this._initIpfsGateways();
        this._initIpfsClients();
        this._initPubsubClients();
        this._initChainProviders();
        this._initPlebbitRpcClients();
    }
    _initIpfsGateways() {
        for (const gatewayUrl of Object.keys(this._plebbit.clients.ipfsGateways))
            this.clients.ipfsGateways = { ...this.clients.ipfsGateways, [gatewayUrl]: new GenericIpfsGatewayClient("stopped") };
    }
    _initIpfsClients() {
        for (const ipfsUrl of Object.keys(this._plebbit.clients.ipfsClients))
            this.clients.ipfsClients = { ...this.clients.ipfsClients, [ipfsUrl]: new GenericIpfsClient("stopped") };
    }
    _initPubsubClients() {
        for (const pubsubUrl of Object.keys(this._plebbit.clients.pubsubClients))
            this.clients.pubsubClients = { ...this.clients.pubsubClients, [pubsubUrl]: new GenericPubsubClient("stopped") };
    }
    _initChainProviders() {
        //@ts-expect-error
        this.clients.chainProviders = {};
        for (const chain of Object.keys(this._plebbit.chainProviders)) {
            this.clients.chainProviders[chain] = {};
            const chainProvider = this._plebbit.chainProviders[chain];
            for (const chainProviderUrl of chainProvider.urls)
                this.clients.chainProviders[chain][chainProviderUrl] = new GenericChainProviderClient("stopped");
        }
    }
    _initPlebbitRpcClients() {
        for (const rpcUrl of Object.keys(this._plebbit.clients.plebbitRpcClients))
            this.clients.plebbitRpcClients = { ...this.clients.plebbitRpcClients, [rpcUrl]: new GenericPlebbitRpcStateClient("stopped") };
    }
    // Overriding functions from base client manager here
    preFetchGateway(gatewayUrl, path, loadType) {
        const gatewayState = loadType === "subplebbit"
            ? this._getStatePriorToResolvingSubplebbitIpns()
            : loadType === "comment-update"
                ? "fetching-update-ipfs"
                : loadType === "comment" || loadType === "generic-ipfs"
                    ? "fetching-ipfs"
                    : undefined;
        assert(gatewayState);
        this.updateGatewayState(gatewayState, gatewayUrl);
    }
    postFetchGatewayFailure(gatewayUrl, path, loadType) {
        this.updateGatewayState("stopped", gatewayUrl);
    }
    postFetchGatewaySuccess(gatewayUrl, path, loadType) {
        this.updateGatewayState("stopped", gatewayUrl);
    }
    postFetchGatewayAborted(gatewayUrl, path, loadType) {
        this.postFetchGatewaySuccess(gatewayUrl, path, loadType);
    }
    preResolveTextRecord(address, txtRecordName, chain, chainProviderUrl) {
        const newState = txtRecordName === "subplebbit-address" ? "resolving-subplebbit-address" : "resolving-author-address";
        this.updateChainProviderState(newState, chain, chainProviderUrl);
    }
    postResolveTextRecordSuccess(address, txtRecordName, resolvedTextRecord, chain, chainProviderUrl) {
        this.updateChainProviderState("stopped", chain, chainProviderUrl);
    }
    postResolveTextRecordFailure(address, txtRecordName, chain, chainProviderUrl) {
        this.updateChainProviderState("stopped", chain, chainProviderUrl);
    }
    // State methods here
    updatePubsubState(newState, pubsubProvider) {
        pubsubProvider = pubsubProvider || this._defaultPubsubProviderUrl;
        assert(typeof pubsubProvider === "string");
        assert(typeof newState === "string", "Can't update pubsub state to undefined");
        if (this.clients.pubsubClients[pubsubProvider].state === newState)
            return;
        this.clients.pubsubClients[pubsubProvider].state = newState;
        this.clients.pubsubClients[pubsubProvider].emit("statechange", newState);
    }
    updateIpfsState(newState) {
        assert(this._defaultIpfsProviderUrl);
        assert(typeof newState === "string", "Can't update ipfs state to undefined");
        if (this.clients.ipfsClients[this._defaultIpfsProviderUrl].state === newState)
            return;
        this.clients.ipfsClients[this._defaultIpfsProviderUrl].state = newState;
        this.clients.ipfsClients[this._defaultIpfsProviderUrl].emit("statechange", newState);
    }
    updateGatewayState(newState, gateway) {
        assert(typeof newState === "string", "Can't update gateway state to undefined");
        if (this.clients.ipfsGateways[gateway].state === newState)
            return;
        this.clients.ipfsGateways[gateway].state = newState;
        this.clients.ipfsGateways[gateway].emit("statechange", newState);
    }
    updateChainProviderState(newState, chainTicker, chainProviderUrl) {
        assert(typeof newState === "string", "Can't update chain provider state to undefined");
        if (this.clients.chainProviders[chainTicker][chainProviderUrl].state === newState)
            return;
        this.clients.chainProviders[chainTicker][chainProviderUrl].state = newState;
        this.clients.chainProviders[chainTicker][chainProviderUrl].emit("statechange", newState);
    }
    async fetchCid(cid) {
        let finalCid = lodash.clone(cid);
        if (!isIpfsCid(finalCid) && isIpfsPath(finalCid))
            finalCid = finalCid.split("/")[2];
        if (!isIpfsCid(finalCid))
            throwWithErrorCode("ERR_CID_IS_INVALID", { cid });
        if (this._defaultIpfsProviderUrl)
            return this._fetchCidP2P(cid);
        else
            return this.fetchFromMultipleGateways({ cid }, "generic-ipfs");
    }
    // fetchSubplebbit should be here
    async _findErrorInSubplebbitRecord(subJson, ipnsNameOfSub) {
        const subInstanceAddress = this._getSubplebbitAddressFromInstance();
        if (subJson.address !== subInstanceAddress) {
            // Did the gateway supply us with a different subplebbit's ipns
            const error = new PlebbitError("ERR_GATEWAY_RESPONDED_WITH_DIFFERENT_SUBPLEBBIT", {
                addressFromSubplebbitInstance: subInstanceAddress,
                ipnsName: ipnsNameOfSub,
                addressFromGateway: subJson.address,
                subplebbitIpnsFromGateway: subJson
            });
            return error;
        }
        const updateValidity = await verifySubplebbit(subJson, this._plebbit.resolveAuthorAddresses, this, true);
        if (!updateValidity.valid) {
            const error = new PlebbitError("ERR_SUBPLEBBIT_SIGNATURE_IS_INVALID", {
                signatureValidity: updateValidity,
                actualIpnsName: ipnsNameOfSub,
                subplebbitIpns: subJson
            });
            return error;
        }
    }
    async fetchSubplebbit(subAddress) {
        const ipnsName = await this.resolveSubplebbitAddressIfNeeded(subAddress);
        // if ipnsAddress is undefined then it will be handled in postResolveTextRecordSuccess
        return this._fetchSubplebbitIpns(ipnsName);
    }
    async _fetchSubplebbitIpns(ipnsName) {
        // This function should fetch SubplebbitIpfs, parse it and verify its signature
        // Then return SubplebbitIpfs
        this.preResolveSubplebbitIpns(ipnsName);
        let subJson;
        if (this._defaultIpfsProviderUrl) {
            this.preResolveSubplebbitIpnsP2P(ipnsName);
            const subplebbitCid = await this.resolveIpnsToCidP2P(ipnsName);
            this.postResolveSubplebbitIpnsP2P(ipnsName, subplebbitCid);
            subJson = JSON.parse(await this._fetchCidP2P(subplebbitCid));
            this.postFetchSubplebbitJsonP2P(subJson); // have not been verified yet
        }
        // States of gateways should be updated by fetchFromMultipleGateways
        else
            subJson = await this._fetchSubplebbitFromGateways(ipnsName);
        const subError = await this._findErrorInSubplebbitRecord(subJson, ipnsName);
        if (subError) {
            this.postFetchSubplebbitInvalidRecord(subJson, subError); // should throw here
            throw subError; // in case we forgot to throw at postFetchSubplebbitInvalidRecord
        }
        this.postFetchSubplebbitJsonSuccess(subJson); // We successfully fetched the json
        subplebbitForPublishingCache.set(subJson.address, lodash.pick(subJson, ["encryption", "pubsubTopic", "address"]));
        return subJson;
    }
    async _fetchSubplebbitFromGateways(ipnsName) {
        const log = Logger("plebbit-js:subplebbit:fetchSubplebbitFromGateways");
        const concurrencyLimit = 3;
        const timeoutMs = this._plebbit._clientsManager.getGatewayTimeoutMs("subplebbit");
        const path = `/ipns/${ipnsName}`;
        const queueLimit = pLimit(concurrencyLimit);
        // Only sort if we have more than 3 gateways
        const gatewaysSorted = Object.keys(this._plebbit.clients.ipfsGateways).length <= concurrencyLimit
            ? Object.keys(this._plebbit.clients.ipfsGateways)
            : await this._plebbit.stats.sortGatewaysAccordingToScore("ipns");
        const gatewayFetches = {};
        for (const gateway of gatewaysSorted) {
            const abortController = new AbortController();
            gatewayFetches[gateway] = {
                abortController,
                promise: queueLimit(() => this._fetchWithGateway(gateway, path, "subplebbit", abortController)),
                timeoutId: setTimeout(() => abortController.abort(), timeoutMs)
            };
        }
        const cleanUp = () => {
            queueLimit.clearQueue();
            Object.values(gatewayFetches).map((gateway) => {
                if (!gateway.subplebbitRecord && !gateway.error)
                    gateway.abortController.abort();
                clearTimeout(gateway.timeoutId);
            });
        };
        const _findRecentSubplebbit = () => {
            // Try to find a very recent subplebbit
            // If not then go with the most recent subplebbit record after fetching from 3 gateways
            const gatewaysWithSub = Object.keys(gatewayFetches).filter((gatewayUrl) => gatewayFetches[gatewayUrl].subplebbitRecord);
            if (gatewaysWithSub.length === 0)
                return undefined;
            const totalGateways = gatewaysSorted.length;
            const quorm = Math.min(2, totalGateways);
            const freshThreshold = 20 * 60; // if a record is as old as 20 min, then use it immediately
            const gatewaysWithError = Object.keys(gatewayFetches).filter((gatewayUrl) => gatewayFetches[gatewayUrl].error);
            const bestGatewayUrl = lodash.maxBy(gatewaysWithSub, (gatewayUrl) => gatewayFetches[gatewayUrl].subplebbitRecord.updatedAt);
            const bestGatewayRecordAge = timestamp() - gatewayFetches[bestGatewayUrl].subplebbitRecord.updatedAt; // how old is the record, relative to now, in seconds
            if (bestGatewayRecordAge <= freshThreshold) {
                // A very recent subplebbit, a good thing
                // TODO reward this gateway
                log(`Gateway (${bestGatewayUrl}) was able to find a very recent subplebbit (${ipnsName}) record that's ${bestGatewayRecordAge}s old`);
                return gatewayFetches[bestGatewayUrl].subplebbitRecord;
            }
            // We weren't able to find a very recent subplebbit record
            if (gatewaysWithSub.length >= quorm || gatewaysWithError.length + gatewaysWithSub.length === totalGateways) {
                // we find the gateway with the max updatedAt
                return gatewayFetches[bestGatewayUrl].subplebbitRecord;
            }
            else
                return undefined;
        };
        const promisesToIterate = (Object.values(gatewayFetches).map((gatewayFetch) => gatewayFetch.promise));
        let suitableSubplebbit;
        try {
            suitableSubplebbit = await new Promise((resolve, reject) => promisesToIterate.map((gatewayPromise, i) => gatewayPromise.then(async (res) => {
                if (typeof res === "string")
                    Object.values(gatewayFetches)[i].subplebbitRecord = JSON.parse(res); // did not throw or abort
                else {
                    // The fetching failed, if res === undefined then it's because it was aborted
                    // else then there's plebbitError
                    Object.values(gatewayFetches)[i].error = res
                        ? res.error
                        : new Error("Fetching from gateway has been aborted/timed out");
                    const gatewaysWithError = Object.keys(gatewayFetches).filter((gatewayUrl) => gatewayFetches[gatewayUrl].error);
                    if (gatewaysWithError.length === gatewaysSorted.length)
                        // All gateways failed
                        reject("All gateways failed to fetch subplebbit record " + ipnsName);
                }
                const recentSubplebbit = _findRecentSubplebbit();
                if (recentSubplebbit) {
                    cleanUp();
                    resolve(recentSubplebbit);
                }
            })));
        }
        catch {
            cleanUp();
            const gatewayToError = {};
            for (const gatewayUrl of Object.keys(gatewayFetches))
                if (gatewayFetches[gatewayUrl].error)
                    gatewayToError[gatewayUrl] = gatewayFetches[gatewayUrl].error;
            const combinedError = new PlebbitError("ERR_FAILED_TO_FETCH_SUBPLEBBIT_FROM_GATEWAYS", { ipnsName, gatewayToError });
            delete combinedError.stack;
            throw combinedError;
        }
        // TODO add punishment for gateway that returns old ipns record
        // TODO add punishment for gateway that returns invalid subplebbit
        return suitableSubplebbit;
    }
    _getStatePriorToResolvingSubplebbitIpns() {
        return "fetching-subplebbit-ipns";
    }
    _getSubplebbitAddressFromInstance() {
        throw Error("Should be implemented");
    }
    postFetchSubplebbitInvalidRecord(subJson, subError) {
        throw Error("Should be implemented");
    }
    preResolveSubplebbitIpns(subIpnsName) {
        throw Error("Should be implemented");
    }
    preResolveSubplebbitIpnsP2P(subIpnsName) {
        throw Error("Should be implemented");
    }
    postResolveSubplebbitIpnsP2P(subIpnsName, subplebbitCid) {
        throw Error("Should be implemented");
    }
    postFetchSubplebbitJsonP2P(subJson) {
        throw Error("Should be implemented");
    }
    postFetchSubplebbitJsonSuccess(subJson) {
        throw Error("Should be implemented");
    }
}
export class PublicationClientsManager extends ClientsManager {
    constructor(publication) {
        super(publication._plebbit);
        this._publication = publication;
    }
    _initIpfsClients() {
        if (this._plebbit.clients.ipfsClients)
            for (const ipfsUrl of Object.keys(this._plebbit.clients.ipfsClients))
                this.clients.ipfsClients = { ...this.clients.ipfsClients, [ipfsUrl]: new PublicationIpfsClient("stopped") };
    }
    _initPubsubClients() {
        for (const pubsubUrl of Object.keys(this._plebbit.clients.pubsubClients))
            this.clients.pubsubClients = { ...this.clients.pubsubClients, [pubsubUrl]: new PublicationPubsubClient("stopped") };
    }
    _initPlebbitRpcClients() {
        for (const rpcUrl of Object.keys(this._plebbit.clients.plebbitRpcClients))
            this.clients.plebbitRpcClients = {
                ...this.clients.plebbitRpcClients,
                [rpcUrl]: new PublicationPlebbitRpcStateClient("stopped")
            };
    }
    // Resolver methods here
    preResolveTextRecord(address, txtRecordName, resolvedTextRecord, chain) {
        super.preResolveTextRecord(address, txtRecordName, resolvedTextRecord, chain);
        const isStartingToPublish = this._publication.publishingState === "stopped" || this._publication.publishingState === "failed";
        if (this._publication.state === "publishing" && txtRecordName === "subplebbit-address" && isStartingToPublish)
            this._publication._updatePublishingState("resolving-subplebbit-address");
    }
    postResolveTextRecordSuccess(address, txtRecordName, resolvedTextRecord, chain, chainProviderUrl) {
        // TODO should check for regex of ipns eventually
        super.postResolveTextRecordSuccess(address, txtRecordName, resolvedTextRecord, chain, chainProviderUrl);
        if (!resolvedTextRecord) {
            this._publication._updatePublishingState("failed");
            const error = new PlebbitError("ERR_ENS_TXT_RECORD_NOT_FOUND", {
                subplebbitAddress: address,
                textRecord: txtRecordName
            });
            this._publication.emit("error", error);
            throw error;
        }
    }
    emitError(e) {
        this._publication.emit("error", e);
    }
    updateIpfsState(newState) {
        super.updateIpfsState(newState);
    }
    updatePubsubState(newState, pubsubProvider) {
        super.updatePubsubState(newState, pubsubProvider);
    }
    updateGatewayState(newState, gateway) {
        super.updateGatewayState(newState, gateway);
    }
    _getSubplebbitAddressFromInstance() {
        return this._publication.subplebbitAddress;
    }
    postFetchSubplebbitInvalidRecord(subJson, subError) {
        this._publication._updatePublishingState("failed");
        this._publication.emit("error", subError);
        throw subError;
    }
    preResolveSubplebbitIpns(subIpnsName) {
        this._publication._updatePublishingState("fetching-subplebbit-ipns");
    }
    preResolveSubplebbitIpnsP2P(subIpnsName) {
        this.updateIpfsState("fetching-subplebbit-ipns");
    }
    postResolveSubplebbitIpnsP2P(subIpnsName, subplebbitCid) {
        this.updateIpfsState("fetching-subplebbit-ipfs");
        this._publication._updatePublishingState("fetching-subplebbit-ipfs");
    }
    postFetchSubplebbitJsonP2P(subJson) {
        this.updateIpfsState("stopped");
    }
    postFetchSubplebbitJsonSuccess(subJson) { }
}
export class CommentClientsManager extends PublicationClientsManager {
    constructor(comment) {
        super(comment);
        this._comment = comment;
    }
    _initIpfsClients() {
        if (this._plebbit.clients.ipfsClients)
            for (const ipfsUrl of Object.keys(this._plebbit.clients.ipfsClients))
                this.clients.ipfsClients = { ...this.clients.ipfsClients, [ipfsUrl]: new CommentIpfsClient("stopped") };
    }
    _initPlebbitRpcClients() {
        for (const rpcUrl of Object.keys(this._plebbit.clients.plebbitRpcClients))
            this.clients.plebbitRpcClients = { ...this.clients.plebbitRpcClients, [rpcUrl]: new CommentPlebbitRpcStateClient("stopped") };
    }
    // Resolver methods here
    preResolveTextRecord(address, txtRecordName, resolvedTextRecord, chain) {
        super.preResolveTextRecord(address, txtRecordName, resolvedTextRecord, chain);
        if (this._comment.state === "updating") {
            if (txtRecordName === "subplebbit-address")
                this._comment._setUpdatingState("resolving-subplebbit-address"); // Resolving for Subplebbit
            else if (txtRecordName === "plebbit-author-address")
                this._comment._setUpdatingState("resolving-author-address"); // Resolving for CommentIpfs
        }
    }
    _findCommentInSubplebbitPosts(subIpns, cid) {
        if (!subIpns.posts?.pages?.hot)
            return undefined;
        const findInCommentAndChildren = (comment) => {
            if (comment.comment.cid === cid)
                return comment.comment;
            if (!comment.update.replies?.pages?.topAll)
                return undefined;
            for (const childComment of comment.update.replies.pages.topAll.comments) {
                const commentInChild = findInCommentAndChildren(childComment);
                if (commentInChild)
                    return commentInChild;
            }
            return undefined;
        };
        for (const post of subIpns.posts.pages.hot.comments) {
            const commentInChild = findInCommentAndChildren(post);
            if (commentInChild)
                return commentInChild;
        }
        return undefined;
    }
    async _fetchParentCommentForCommentUpdate(parentCid) {
        if (this._defaultIpfsProviderUrl) {
            this.updateIpfsState("fetching-update-ipfs");
            this._comment._setUpdatingState("fetching-update-ipfs");
            const commentContent = { cid: parentCid, ...JSON.parse(await this._fetchCidP2P(parentCid)) };
            this.updateIpfsState("stopped");
            return commentContent;
        }
        else {
            const commentContent = {
                cid: parentCid,
                ...JSON.parse(await this.fetchFromMultipleGateways({ cid: parentCid }, "comment"))
            };
            return commentContent;
        }
    }
    async _getParentsPath(subIpns) {
        const parentsPathCache = await this._plebbit.createStorageLRU(commentPostUpdatesParentsPathConfig);
        const pathCache = await parentsPathCache.getItem(this._comment.cid);
        if (pathCache)
            return pathCache.split("/").reverse().join("/");
        const postTimestampCache = await this._plebbit.createStorageLRU(postTimestampConfig);
        if (this._comment.depth === 0)
            await postTimestampCache.setItem(this._comment.cid, this._comment.timestamp);
        let parentCid = this._comment.parentCid;
        let reversedPath = `${this._comment.cid}`; // Path will be reversed here, `nestedReplyCid/replyCid/postCid`
        while (parentCid) {
            // should attempt to fetch cache here
            // Also should we set updatingState everytime we fetch a parent Comment?
            const parentPathCache = await parentsPathCache.getItem(parentCid);
            if (parentPathCache) {
                reversedPath += "/" + parentPathCache;
                break;
            }
            else {
                const parent = this._findCommentInSubplebbitPosts(subIpns, parentCid) || (await this._fetchParentCommentForCommentUpdate(parentCid));
                if (parent.depth === 0)
                    await postTimestampCache.setItem(parent.cid, parent.timestamp);
                reversedPath += `/${parentCid}`;
                parentCid = parent.parentCid;
            }
        }
        await parentsPathCache.setItem(this._comment.cid, reversedPath);
        const finalParentsPath = reversedPath.split("/").reverse().join("/"); // will be postCid/replyCid/nestedReplyCid
        return finalParentsPath;
    }
    async fetchCommentUpdate() {
        const log = Logger("plebbit-js:comment:update");
        const subIpns = await this.fetchSubplebbit(this._comment.subplebbitAddress);
        const parentsPostUpdatePath = await this._getParentsPath(subIpns);
        const postTimestamp = await (await this._plebbit.createStorageLRU(postTimestampConfig)).getItem(this._comment.postCid);
        if (typeof postTimestamp !== "number")
            throw Error("Failed to fetch post timestamp");
        const timestampRanges = getPostUpdateTimestampRange(subIpns.postUpdates, postTimestamp);
        if (timestampRanges.length === 0)
            throw Error("Post has no timestamp range bucket");
        for (const timestampRange of timestampRanges) {
            const folderCid = subIpns.postUpdates[timestampRange];
            const path = `${folderCid}/` + parentsPostUpdatePath + "/update";
            this._comment._setUpdatingState("fetching-update-ipfs");
            if (this._defaultIpfsProviderUrl) {
                this.updateIpfsState("fetching-update-ipfs");
                try {
                    const commentUpdate = JSON.parse(await this._fetchCidP2P(path));
                    this.updateIpfsState("stopped");
                    return commentUpdate;
                }
                catch (e) {
                    // if does not exist, try the next timestamp range
                    log.error(`Failed to fetch CommentUpdate from path (${path}). Trying the next timestamp range`);
                }
            }
            else {
                // States of gateways should be updated by fetchFromMultipleGateways
                try {
                    const update = JSON.parse(await this.fetchFromMultipleGateways({ cid: path }, "comment-update"));
                    return update;
                }
                catch (e) {
                    // if does not exist, try the next timestamp range
                    log.error(`Failed to fetch CommentUpdate from path (${path}). Trying the next timestamp range`);
                }
            }
        }
        throw Error(`CommentUpdate of comment (${this._comment.cid}) does not exist on all timestamp ranges: ${timestampRanges}`);
    }
    async fetchCommentCid(cid) {
        if (this._defaultIpfsProviderUrl) {
            this.updateIpfsState("fetching-ipfs");
            const commentContent = JSON.parse(await this._fetchCidP2P(cid));
            this.updateIpfsState("stopped");
            return commentContent;
        }
        else {
            const commentContent = JSON.parse(await this.fetchFromMultipleGateways({ cid }, "comment"));
            return commentContent;
        }
    }
    updateIpfsState(newState) {
        super.updateIpfsState(newState);
    }
    _isPublishing() {
        return this._comment.state === "publishing";
    }
    postFetchSubplebbitInvalidRecord(subJson, subError) {
        // are we updating or publishing?
        if (this._isPublishing()) {
            // we're publishing
            this._comment._updatePublishingState("failed");
        }
        else {
            // we're updating
            this._comment._setUpdatingState("failed");
        }
        this._comment.emit("error", subError);
        throw subError;
    }
    postResolveTextRecordSuccess(address, txtRecordName, resolvedTextRecord, chain, chainProviderUrl) {
        super.postResolveTextRecordSuccess(address, txtRecordName, resolvedTextRecord, chain, chainProviderUrl);
        // TODO should check for regex of ipns eventually
        if (!resolvedTextRecord) {
            // need to check if publishing or updating
            if (this._isPublishing()) {
                this._comment._updatePublishingState("failed");
            }
            else
                this._comment._setUpdatingState("failed");
            const error = new PlebbitError("ERR_ENS_TXT_RECORD_NOT_FOUND", {
                subplebbitAddress: address,
                textRecord: txtRecordName
            });
            this._comment.emit("error", error);
            throw error;
        }
    }
    preResolveSubplebbitIpns(subIpnsName) {
        if (this._isPublishing())
            this._comment._updatePublishingState("fetching-subplebbit-ipns");
        else
            this._comment._setUpdatingState("fetching-subplebbit-ipns");
    }
    preResolveSubplebbitIpnsP2P(subIpnsName) {
        this.updateIpfsState("fetching-subplebbit-ipns");
    }
    postResolveSubplebbitIpnsP2P(subIpnsName, subplebbitCid) {
        this.updateIpfsState("fetching-subplebbit-ipfs");
        if (this._isPublishing())
            this._comment._updatePublishingState("fetching-subplebbit-ipfs");
        else
            this._comment._setUpdatingState("fetching-subplebbit-ipfs");
    }
    postFetchSubplebbitJsonP2P(subJson) {
        if (this._isPublishing())
            this.updateIpfsState("stopped");
    }
    postFetchSubplebbitJsonSuccess(subJson) { }
}
export class SubplebbitClientsManager extends ClientsManager {
    constructor(subplebbit) {
        super(subplebbit.plebbit);
        this._subplebbit = subplebbit;
    }
    _initIpfsClients() {
        if (this._plebbit.clients.ipfsClients)
            for (const ipfsUrl of Object.keys(this._plebbit.clients.ipfsClients))
                this.clients.ipfsClients = { ...this.clients.ipfsClients, [ipfsUrl]: new SubplebbitIpfsClient("stopped") };
    }
    _initPubsubClients() {
        for (const pubsubUrl of Object.keys(this._plebbit.clients.pubsubClients))
            this.clients.pubsubClients = { ...this.clients.pubsubClients, [pubsubUrl]: new SubplebbitPubsubClient("stopped") };
    }
    _initPlebbitRpcClients() {
        for (const rpcUrl of Object.keys(this._plebbit.clients.plebbitRpcClients))
            this.clients.plebbitRpcClients = {
                ...this.clients.plebbitRpcClients,
                [rpcUrl]: new SubplebbitPlebbitRpcStateClient("stopped")
            };
    }
    updateIpfsState(newState) {
        super.updateIpfsState(newState);
    }
    updatePubsubState(newState, pubsubProvider) {
        super.updatePubsubState(newState, pubsubProvider);
    }
    updateGatewayState(newState, gateway) {
        super.updateGatewayState(newState, gateway);
    }
    emitError(e) {
        this._subplebbit.emit("error", e);
    }
    _getStatePriorToResolvingSubplebbitIpns() {
        return "fetching-ipns";
    }
    postFetchSubplebbitInvalidRecord(subJson, subError) {
        this._subplebbit._setUpdatingState("failed");
        this._subplebbit.emit("error", subError);
        throw subError;
    }
    preResolveTextRecord(address, txtRecordName, chain, chainProviderUrl) {
        super.preResolveTextRecord(address, txtRecordName, chain, chainProviderUrl);
        if (this._subplebbit.state === "updating" &&
            txtRecordName === "subplebbit-address" &&
            this._subplebbit.updatingState !== "fetching-ipfs" // we don't state to be resolving-address when verifying signature
        )
            this._subplebbit._setUpdatingState("resolving-address");
    }
    postResolveTextRecordSuccess(address, txtRecordName, resolvedTextRecord, chain, chainProviderUrl) {
        super.postResolveTextRecordSuccess(address, txtRecordName, resolvedTextRecord, chain, chainProviderUrl);
        // TODO should check for regex of ipns eventually
        if (!resolvedTextRecord && this._subplebbit.state === "updating") {
            this._subplebbit._setUpdatingState("failed");
            const error = new PlebbitError("ERR_ENS_TXT_RECORD_NOT_FOUND", {
                subplebbitAddress: address,
                textRecord: txtRecordName
            });
            this._subplebbit.emit("error", error);
            throw error;
        }
    }
    _getSubplebbitAddressFromInstance() {
        return this._subplebbit.address;
    }
    preResolveSubplebbitIpns(subIpnsName) {
        this._subplebbit._setUpdatingState("fetching-ipns");
    }
    preResolveSubplebbitIpnsP2P(subIpnsName) {
        this.updateIpfsState("fetching-ipns");
    }
    postResolveSubplebbitIpnsP2P(subIpnsName, subplebbitCid) {
        this.updateIpfsState("fetching-ipfs");
        this._subplebbit._setUpdatingState("fetching-ipfs");
    }
    postFetchSubplebbitJsonP2P(subJson) {
        this.updateIpfsState("stopped");
    }
    postFetchSubplebbitJsonSuccess(subJson) {
        this._subplebbit._setUpdatingState("succeeded");
    }
}
//# sourceMappingURL=client-manager.js.map