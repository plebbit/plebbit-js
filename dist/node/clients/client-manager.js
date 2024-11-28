import { getPostUpdateTimestampRange, hideClassPrivateProps, isIpfsCid, isIpfsPath, throwWithErrorCode, timestamp } from "../util.js";
import assert from "assert";
import { verifyCommentIpfs, verifySubplebbit } from "../signer/index.js";
import * as remeda from "remeda";
import { FailedToFetchCommentUpdateFromGatewaysError, FailedToFetchSubplebbitFromGatewaysError, PlebbitError } from "../plebbit-error.js";
import { CommentIpfsClient, GenericIpfsClient, PublicationIpfsClient, SubplebbitIpfsClient } from "./ipfs-client.js";
import { GenericPubsubClient, PublicationPubsubClient, SubplebbitPubsubClient } from "./pubsub-client.js";
import { GenericChainProviderClient } from "./chain-provider-client.js";
import { of as calculateIpfsHash } from "typestub-ipfs-only-hash";
import { GenericIpfsGatewayClient } from "./ipfs-gateway-client.js";
import { BaseClientsManager } from "./base-client-manager.js";
import { commentPostUpdatesParentsPathConfig, postTimestampConfig, subplebbitForPublishingCache } from "../constants.js";
import { CommentPlebbitRpcStateClient, PublicationPlebbitRpcStateClient, SubplebbitPlebbitRpcStateClient } from "./rpc-client/plebbit-rpc-state-client.js";
import Logger from "@plebbit/plebbit-logger";
import pLimit from "p-limit";
import { parseCommentIpfsSchemaWithPlebbitErrorIfItFails, parseCommentUpdateSchemaWithPlebbitErrorIfItFails, parseJsonWithPlebbitErrorIfFails, parseSubplebbitIpfsSchemaPassthroughWithPlebbitErrorIfItFails } from "../schema/schema-util.js";
import { verifyCommentUpdate } from "../signer/signatures.js";
export class ClientsManager extends BaseClientsManager {
    constructor(plebbit) {
        super(plebbit);
        this._plebbit = plebbit;
        //@ts-expect-error
        this.clients = {};
        this._initIpfsGateways();
        this._initIpfsClients();
        this._initPubsubClients();
        this._initChainProviders();
        hideClassPrivateProps(this);
    }
    _initIpfsGateways() {
        for (const gatewayUrl of remeda.keys.strict(this._plebbit.clients.ipfsGateways))
            this.clients.ipfsGateways = { ...this.clients.ipfsGateways, [gatewayUrl]: new GenericIpfsGatewayClient("stopped") };
    }
    _initIpfsClients() {
        for (const ipfsUrl of remeda.keys.strict(this._plebbit.clients.ipfsClients))
            this.clients.ipfsClients = { ...this.clients.ipfsClients, [ipfsUrl]: new GenericIpfsClient("stopped") };
    }
    _initPubsubClients() {
        for (const pubsubUrl of remeda.keys.strict(this._plebbit.clients.pubsubClients))
            this.clients.pubsubClients = { ...this.clients.pubsubClients, [pubsubUrl]: new GenericPubsubClient("stopped") };
    }
    _initChainProviders() {
        this.clients.chainProviders = {};
        for (const [chain, chainProvider] of remeda.entries.strict(this._plebbit.chainProviders)) {
            this.clients.chainProviders[chain] = {};
            for (const chainProviderUrl of chainProvider.urls)
                this.clients.chainProviders[chain][chainProviderUrl] = new GenericChainProviderClient("stopped");
        }
    }
    // Overriding functions from base client manager here
    preFetchGateway(gatewayUrl, loadOpts) {
        const gatewayState = loadOpts.recordPlebbitType === "subplebbit"
            ? this._getStatePriorToResolvingSubplebbitIpns()
            : loadOpts.recordPlebbitType === "comment-update"
                ? "fetching-update-ipfs"
                : loadOpts.recordPlebbitType === "comment" ||
                    loadOpts.recordPlebbitType === "generic-ipfs" ||
                    loadOpts.recordPlebbitType === "page-ipfs"
                    ? "fetching-ipfs"
                    : undefined;
        assert(gatewayState, "unable to compute the new gateway state");
        this.updateGatewayState(gatewayState, gatewayUrl);
    }
    postFetchGatewayFailure(gatewayUrl, loadOpts) {
        this.updateGatewayState("stopped", gatewayUrl);
    }
    postFetchGatewaySuccess(gatewayUrl, loadOpts) {
        this.updateGatewayState("stopped", gatewayUrl);
    }
    postFetchGatewayAborted(gatewayUrl, loadOpts) {
        this.postFetchGatewaySuccess(gatewayUrl, loadOpts);
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
        let finalCid = remeda.clone(cid);
        if (!isIpfsCid(finalCid) && isIpfsPath(finalCid))
            finalCid = finalCid.split("/")[2];
        if (!isIpfsCid(finalCid))
            throwWithErrorCode("ERR_CID_IS_INVALID", { cid });
        if (this._defaultIpfsProviderUrl)
            return this._fetchCidP2P(cid);
        else {
            const resObj = await this.fetchFromMultipleGateways({ root: cid, recordIpfsType: "ipfs", recordPlebbitType: "generic-ipfs" }, async () => { });
            return resObj.resText;
        }
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
        if (!ipnsName)
            throw Error("Failed to resolve subplebbit address to an IPNS name");
        return this._fetchSubplebbitIpns(ipnsName);
    }
    async _fetchSubplebbitIpnsP2PAndVerify(ipnsName) {
        this.preResolveSubplebbitIpnsP2P(ipnsName);
        let subplebbitCid;
        try {
            subplebbitCid = await this.resolveIpnsToCidP2P(ipnsName); // What if this fails
        }
        catch (e) {
            this.postResolveSubplebbitIpnsP2PFailure(ipnsName, e);
            throw e;
        }
        this.postResolveSubplebbitIpnsP2PSuccess(ipnsName, subplebbitCid);
        let rawSubJsonString;
        try {
            rawSubJsonString = await this._fetchCidP2P(subplebbitCid);
        }
        catch (e) {
            this.postFetchSubplebbitStringJsonP2PFailure(ipnsName, subplebbitCid, e);
            throw e;
        }
        this.postFetchSubplebbitStringJsonP2PSuccess();
        try {
            const subIpfs = parseSubplebbitIpfsSchemaPassthroughWithPlebbitErrorIfItFails(parseJsonWithPlebbitErrorIfFails(rawSubJsonString));
            const errInRecord = await this._findErrorInSubplebbitRecord(subIpfs, ipnsName);
            if (errInRecord)
                throw errInRecord;
            return { subplebbit: subIpfs, cid: subplebbitCid };
        }
        catch (e) {
            this.postFetchSubplebbitInvalidRecord(rawSubJsonString, e); // should throw here
            throw new Error("postFetchSubplebbitInvalidRecord should throw, but it did not");
        }
    }
    async _fetchSubplebbitIpns(ipnsName) {
        // This function should fetch SubplebbitIpfs, parse it and verify its signature
        // Then return SubplebbitIpfs
        this.preFetchSubplebbitIpns(ipnsName);
        let subRes;
        if (this._defaultIpfsProviderUrl)
            subRes = await this._fetchSubplebbitIpnsP2PAndVerify(ipnsName);
        else
            subRes = await this._fetchSubplebbitFromGateways(ipnsName);
        // States of gateways should be updated by fetchFromMultipleGateways
        // Subplebbit records are verified within _fetchSubplebbitFromGateways
        this.postFetchSubplebbitIpfsSuccess(subRes); // We successfully fetched and verified the SubplebbitIpfs
        subplebbitForPublishingCache.set(subRes.subplebbit.address, remeda.pick(subRes.subplebbit, ["encryption", "pubsubTopic", "address"]));
        return subRes;
    }
    async _fetchSubplebbitFromGateways(ipnsName) {
        const log = Logger("plebbit-js:subplebbit:fetchSubplebbitFromGateways");
        const concurrencyLimit = 3;
        const timeoutMs = this._plebbit._clientsManager.getGatewayTimeoutMs("subplebbit");
        const queueLimit = pLimit(concurrencyLimit);
        // Only sort if we have more than 3 gateways
        const gatewaysSorted = remeda.keys.strict(this._plebbit.clients.ipfsGateways).length <= concurrencyLimit
            ? remeda.keys.strict(this._plebbit.clients.ipfsGateways)
            : await this._plebbit._stats.sortGatewaysAccordingToScore("ipns");
        const gatewayFetches = {};
        for (const gateway of gatewaysSorted) {
            const abortController = new AbortController();
            gatewayFetches[gateway] = {
                abortController,
                promise: queueLimit(() => this._fetchWithGateway(gateway, { recordIpfsType: "ipns", root: ipnsName, recordPlebbitType: "subplebbit" }, abortController, async (gatewayRes) => {
                    const subIpfs = parseSubplebbitIpfsSchemaPassthroughWithPlebbitErrorIfItFails(parseJsonWithPlebbitErrorIfFails(gatewayRes.resText));
                    const errorWithinRecord = await this._findErrorInSubplebbitRecord(subIpfs, ipnsName);
                    if (errorWithinRecord) {
                        delete errorWithinRecord["stack"];
                        throw errorWithinRecord;
                    }
                    else {
                        gatewayFetches[gateway].subplebbitRecord = subIpfs;
                        gatewayFetches[gateway].cid = await calculateIpfsHash(gatewayRes.resText);
                    }
                })),
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
            const gatewaysWithSub = remeda.keys.strict(gatewayFetches).filter((gatewayUrl) => gatewayFetches[gatewayUrl].subplebbitRecord);
            if (gatewaysWithSub.length === 0)
                return undefined;
            const totalGateways = gatewaysSorted.length;
            const quorm = Math.min(2, totalGateways);
            const freshThreshold = 60 * 60; // if a record is as old as 60 min, then use it immediately
            const gatewaysWithError = remeda.keys.strict(gatewayFetches).filter((gatewayUrl) => gatewayFetches[gatewayUrl].error);
            const bestGatewayUrl = (remeda.maxBy(gatewaysWithSub, (gatewayUrl) => gatewayFetches[gatewayUrl].subplebbitRecord.updatedAt));
            const bestGatewayRecordAge = timestamp() - gatewayFetches[bestGatewayUrl].subplebbitRecord.updatedAt; // how old is the record, relative to now, in seconds
            if (bestGatewayRecordAge <= freshThreshold) {
                // A very recent subplebbit, a good thing
                // TODO reward this gateway
                const bestSubRecord = gatewayFetches[bestGatewayUrl].subplebbitRecord;
                log(`Gateway (${bestGatewayUrl}) was able to find a very recent subplebbit (${bestSubRecord.address}) whose IPNS is (${ipnsName}).  The record has updatedAt (${bestSubRecord.updatedAt}) that's ${bestGatewayRecordAge}s old`);
                return { subplebbit: bestSubRecord, cid: gatewayFetches[bestGatewayUrl].cid };
            }
            // We weren't able to find a very recent subplebbit record
            if (gatewaysWithSub.length >= quorm || gatewaysWithError.length + gatewaysWithSub.length === totalGateways) {
                // we find the gateway with the max updatedAt
                return { subplebbit: gatewayFetches[bestGatewayUrl].subplebbitRecord, cid: gatewayFetches[bestGatewayUrl].cid };
            }
            else
                return undefined;
        };
        const promisesToIterate = (Object.values(gatewayFetches).map((gatewayFetch) => gatewayFetch.promise));
        // TODO need to handle verification of signature within subplebbit
        let suitableSubplebbit;
        try {
            suitableSubplebbit = await new Promise((resolve, reject) => promisesToIterate.map((gatewayPromise, i) => gatewayPromise
                .then(async (res) => {
                if ("error" in res)
                    Object.values(gatewayFetches)[i].error = res.error;
                const gatewaysWithError = remeda.keys
                    .strict(gatewayFetches)
                    .filter((gatewayUrl) => gatewayFetches[gatewayUrl].error);
                if (gatewaysWithError.length === gatewaysSorted.length)
                    // All gateways failed
                    reject("All gateways failed to fetch subplebbit record " + ipnsName);
                const recentSubplebbit = _findRecentSubplebbit();
                if (recentSubplebbit) {
                    cleanUp();
                    resolve(recentSubplebbit);
                }
            })
                .catch((err) => reject("One of the gateway promise requests thrown an error, should not happens:" + err))));
        }
        catch {
            cleanUp();
            const gatewayToError = remeda.mapValues(gatewayFetches, (gatewayFetch) => gatewayFetch.error);
            const combinedError = new FailedToFetchSubplebbitFromGatewaysError({ ipnsName, gatewayToError });
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
    postFetchSubplebbitInvalidRecord(subRawJson, subError) {
        throw Error("Should be implemented");
    }
    preFetchSubplebbitIpns(subIpnsName) {
        throw Error("Should be implemented");
    }
    preResolveSubplebbitIpnsP2P(subIpnsName) {
        throw Error("Should be implemented");
    }
    postResolveSubplebbitIpnsP2PSuccess(subIpnsName, subplebbitCid) {
        throw Error("Should be implemented");
    }
    postResolveSubplebbitIpnsP2PFailure(subIpnsName, err) {
        throw Error("Should be implemented");
    }
    // For IPFS P2P only
    postFetchSubplebbitStringJsonP2PSuccess() {
        // Prior to verifying, this is right after getting the raw string of SubplebbitIpfs json
        throw Error("Should be implemented");
    }
    // For IPFS P2P only
    postFetchSubplebbitStringJsonP2PFailure(subIpnsName, subplebbitCid, err) {
        // We failed to fetch the cid of the subplebbit
        throw Error("Should be implemented");
    }
    // This is for Gateway and P2P
    postFetchSubplebbitIpfsSuccess(subRes) {
        throw Error("Should be implemented");
    }
}
export class PublicationClientsManager extends ClientsManager {
    constructor(publication) {
        super(publication._plebbit);
        this._publication = publication;
        this._initPlebbitRpcClients();
    }
    _initIpfsClients() {
        if (this._plebbit.clients.ipfsClients)
            for (const ipfsUrl of remeda.keys.strict(this._plebbit.clients.ipfsClients))
                this.clients.ipfsClients = { ...this.clients.ipfsClients, [ipfsUrl]: new PublicationIpfsClient("stopped") };
    }
    _initPubsubClients() {
        for (const pubsubUrl of remeda.keys.strict(this._plebbit.clients.pubsubClients))
            this.clients.pubsubClients = { ...this.clients.pubsubClients, [pubsubUrl]: new PublicationPubsubClient("stopped") };
    }
    _initPlebbitRpcClients() {
        for (const rpcUrl of remeda.keys.strict(this._plebbit.clients.plebbitRpcClients))
            this.clients.plebbitRpcClients = {
                ...this.clients.plebbitRpcClients,
                [rpcUrl]: new PublicationPlebbitRpcStateClient("stopped")
            };
    }
    // Resolver methods here
    preResolveTextRecord(address, txtRecordName, chain, chainProviderUrl) {
        super.preResolveTextRecord(address, txtRecordName, chain, chainProviderUrl);
        const isStartingToPublish = this._publication.publishingState === "stopped" || this._publication.publishingState === "failed";
        if (this._publication.state === "publishing" && txtRecordName === "subplebbit-address" && isStartingToPublish)
            this._publication._updatePublishingState("resolving-subplebbit-address");
    }
    postResolveTextRecordSuccess(address, txtRecordName, resolvedTextRecord, chain, chainProviderUrl) {
        // TODO should check for regex of ipns eventually
        super.postResolveTextRecordSuccess(address, txtRecordName, resolvedTextRecord, chain, chainProviderUrl);
        if (!resolvedTextRecord) {
            this._publication._updatePublishingState("failed");
            const error = new PlebbitError("ERR_DOMAIN_TXT_RECORD_NOT_FOUND", {
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
    preFetchSubplebbitIpns(subIpnsName) {
        this._publication._updatePublishingState("fetching-subplebbit-ipns");
    }
    preResolveSubplebbitIpnsP2P(subIpnsName) {
        this.updateIpfsState("fetching-subplebbit-ipns");
    }
    postResolveSubplebbitIpnsP2PSuccess(subIpnsName, subplebbitCid) {
        this.updateIpfsState("fetching-subplebbit-ipfs");
        this._publication._updatePublishingState("fetching-subplebbit-ipfs");
    }
    postResolveSubplebbitIpnsP2PFailure(subIpnsName, err) {
        this.updateIpfsState("stopped");
        throw err;
    }
    postFetchSubplebbitStringJsonP2PSuccess() {
        this.updateIpfsState("stopped");
    }
    postFetchSubplebbitStringJsonP2PFailure(subIpnsName, subplebbitCid, err) {
        this.updateIpfsState("stopped");
        // No need to update publication.publishingState here because it's gonna be updated in publication.publish()
        throw err;
    }
    postFetchSubplebbitIpfsSuccess(subJson) { }
    postFetchSubplebbitInvalidRecord(subJson, subError) {
        this._publication._updatePublishingState("failed");
        this._publication.emit("error", subError);
        throw subError;
    }
}
export class CommentClientsManager extends PublicationClientsManager {
    constructor(comment) {
        super(comment);
        this._comment = comment;
    }
    _initIpfsClients() {
        if (this._plebbit.clients.ipfsClients)
            for (const ipfsUrl of remeda.keys.strict(this._plebbit.clients.ipfsClients))
                this.clients.ipfsClients = { ...this.clients.ipfsClients, [ipfsUrl]: new CommentIpfsClient("stopped") };
    }
    _initPlebbitRpcClients() {
        for (const rpcUrl of remeda.keys.strict(this._plebbit.clients.plebbitRpcClients))
            this.clients.plebbitRpcClients = { ...this.clients.plebbitRpcClients, [rpcUrl]: new CommentPlebbitRpcStateClient("stopped") };
    }
    // Resolver methods here
    preResolveTextRecord(address, txtRecordName, chain, chainProviderUrl) {
        super.preResolveTextRecord(address, txtRecordName, chain, chainProviderUrl);
        if (this._comment.state === "updating") {
            if (txtRecordName === "subplebbit-address")
                this._comment._setUpdatingState("resolving-subplebbit-address"); // Resolving for Subplebbit
            else if (txtRecordName === "plebbit-author-address")
                this._comment._setUpdatingState("resolving-author-address"); // Resolving for CommentIpfs
        }
    }
    _findCommentInSubplebbitPosts(subIpns, commentCidToLookFor) {
        if (!subIpns.posts?.pages?.hot)
            return undefined; // try to use preloaded pages if possible
        const findInCommentAndChildren = (pageComment) => {
            if (pageComment.commentUpdate.cid === commentCidToLookFor)
                return pageComment;
            if (!pageComment.commentUpdate.replies?.pages?.topAll)
                return undefined;
            for (const childComment of pageComment.commentUpdate.replies.pages.topAll.comments) {
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
            try {
                const commentIpfs = parseCommentIpfsSchemaWithPlebbitErrorIfItFails(parseJsonWithPlebbitErrorIfFails(await this._fetchCidP2P(parentCid)));
                return {
                    comment: commentIpfs,
                    commentUpdate: { cid: parentCid }
                };
            }
            finally {
                this.updateIpfsState("stopped");
            }
        }
        else {
            return { commentUpdate: { cid: parentCid }, comment: await this.fetchAndVerifyCommentCid(parentCid) };
        }
    }
    async _getParentsPath(subIpns) {
        const parentsPathCache = await this._plebbit._createStorageLRU(commentPostUpdatesParentsPathConfig);
        const commentCid = this._comment.cid;
        if (!commentCid)
            throw Error("Can't retrieve parent path without defined comment.cid");
        const pathCache = await parentsPathCache.getItem(commentCid);
        if (pathCache)
            return pathCache.split("/").reverse().join("/");
        const postTimestampCache = await this._plebbit._createStorageLRU(postTimestampConfig);
        if (this._comment.depth === 0)
            await postTimestampCache.setItem(commentCid, this._comment.timestamp);
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
                const parentInPageIpfs = this._findCommentInSubplebbitPosts(subIpns, parentCid) || (await this._fetchParentCommentForCommentUpdate(parentCid));
                if (parentInPageIpfs.comment.depth === 0)
                    await postTimestampCache.setItem(parentInPageIpfs.commentUpdate.cid, parentInPageIpfs.comment.timestamp);
                reversedPath += `/${parentCid}`;
                parentCid = parentInPageIpfs.comment.parentCid;
            }
        }
        await parentsPathCache.setItem(commentCid, reversedPath);
        const finalParentsPath = reversedPath.split("/").reverse().join("/"); // will be postCid/replyCid/nestedReplyCid
        return finalParentsPath;
    }
    _calculatePathForCommentUpdate(folderCid, parentsPostUpdatePath) {
        return `${folderCid}/` + parentsPostUpdatePath + "/update";
    }
    async _fetchCommentUpdateIpfsP2P(subIpns, timestampRanges, parentsPostUpdatePath, log) {
        const attemptedPaths = [];
        for (const timestampRange of timestampRanges) {
            const folderCid = subIpns.postUpdates[timestampRange];
            const path = this._calculatePathForCommentUpdate(folderCid, parentsPostUpdatePath);
            attemptedPaths.push(path);
            this.updateIpfsState("fetching-update-ipfs");
            let res;
            try {
                res = await this._fetchCidP2P(path);
            }
            catch (e) {
                log.trace(`Failed to fetch CommentUpdate from path (${path}) with IPFS P2P. Trying the next timestamp range`);
                continue;
            }
            finally {
                this.updateIpfsState("stopped");
            }
            const commentUpdate = parseCommentUpdateSchemaWithPlebbitErrorIfItFails(parseJsonWithPlebbitErrorIfFails(res));
            await this._throwIfCommentUpdateHasInvalidSignature(commentUpdate);
            return commentUpdate;
        }
        throw new PlebbitError("ERR_FAILED_TO_FETCH_COMMENT_UPDATE_FROM_ALL_POST_UPDATES_RANGES", {
            timestampRanges,
            attemptedPaths,
            commentCid: this._comment.cid
        });
    }
    _shouldWeFetchCommentUpdateFromNextTimestamp(err) {
        // Is there a problem with the record itself, or is this an issue with fetching?
        if (!(err instanceof PlebbitError))
            return false; // If it's not a recognizable error, then we throw to notify the user
        if (err.code === "ERR_COMMENT_UPDATE_SIGNATURE_IS_INVALID" ||
            err.code === "ERR_INVALID_COMMENT_UPDATE_SCHEMA" ||
            err.code === "ERR_OVER_DOWNLOAD_LIMIT" ||
            err.code === "ERR_INVALID_JSON")
            return false; // These errors means there's a problem with the record itself, not the loading
        if (err instanceof FailedToFetchCommentUpdateFromGatewaysError) {
            // If all gateway errors are due to the record itself, then we throw an error and don't jump to the next timestamp
            for (const gatewayError of Object.values(err.details.gatewayToError))
                if (this._shouldWeFetchCommentUpdateFromNextTimestamp(gatewayError))
                    return true; // if there's at least one gateway whose error is not due to the record
            return false; // if all gateways have issues with the record validity itself, then we stop fetching
        }
        return true;
    }
    async _throwIfCommentUpdateHasInvalidSignature(commentUpdate) {
        if (!this._comment.cid)
            throw Error("Can't validate comment update when comment.cid is undefined");
        const commentIpfsProps = { cid: this._comment.cid, signature: this._comment.signature };
        const signatureValidity = await verifyCommentUpdate(commentUpdate, this._plebbit.resolveAuthorAddresses, this, this._comment.subplebbitAddress, commentIpfsProps, true);
        if (!signatureValidity.valid) {
            // TODO need to make sure comment.updatingState is set to failed
            // TODO also need to make sure an error is emitted
            throw new PlebbitError("ERR_COMMENT_UPDATE_SIGNATURE_IS_INVALID", { signatureValidity, commentUpdate });
        }
    }
    async _fetchCommentUpdateFromGateways(subIpns, timestampRanges, parentsPostUpdatePath, log) {
        const attemptedPaths = [];
        for (const timestampRange of timestampRanges) {
            // We're validating schema and signature here for every gateway because it's not a regular cid whose content we can verify to match the cid
            const folderCid = subIpns.postUpdates[timestampRange];
            const path = this._calculatePathForCommentUpdate(folderCid, parentsPostUpdatePath);
            attemptedPaths.push(path);
            let commentUpdate;
            try {
                // Validate the Comment Update within the gateway fetching algo
                // fetchFromMultipleGateways will throw if all gateways failed to load the record
                await this.fetchFromMultipleGateways({
                    recordIpfsType: "ipfs",
                    root: folderCid,
                    path: path.replace(`${folderCid}/`, ""),
                    recordPlebbitType: "comment-update"
                }, async (res) => {
                    const commentUpdateBeforeSignature = parseCommentUpdateSchemaWithPlebbitErrorIfItFails(parseJsonWithPlebbitErrorIfFails(res.resText));
                    await this._throwIfCommentUpdateHasInvalidSignature(commentUpdateBeforeSignature);
                    commentUpdate = commentUpdateBeforeSignature; // at this point, we know the gateway has provided a valid comment update and we can use it
                });
                if (!commentUpdate)
                    throw Error("Failed to load comment update from gateways. This is a critical logic error");
                return commentUpdate;
            }
            catch (e) {
                // We need to find out if it's loading error, and if it is we just move on to the next timestamp range
                // If it's a schema or signature error we should stop and throw
                if (this._shouldWeFetchCommentUpdateFromNextTimestamp(e)) {
                    log.trace(`Failed to fetch CommentUpdate from path (${path}) from gateways. Trying the next timestamp range`);
                    continue;
                }
                else
                    throw e;
            }
        }
        throw new PlebbitError("ERR_FAILED_TO_FETCH_COMMENT_UPDATE_FROM_ALL_POST_UPDATES_RANGES", {
            timestampRanges,
            attemptedPaths,
            commentCid: this._comment.cid
        });
    }
    async fetchCommentUpdate() {
        const log = Logger("plebbit-js:comment:update");
        const subIpns = (await this.fetchSubplebbit(this._comment.subplebbitAddress)).subplebbit;
        const parentsPostUpdatePath = await this._getParentsPath(subIpns);
        const postCid = this._comment.postCid;
        if (!postCid)
            throw Error("comment.postCid needs to be defined to fetch comment update");
        const postTimestamp = await (await this._plebbit._createStorageLRU(postTimestampConfig)).getItem(postCid);
        if (typeof postTimestamp !== "number")
            throw Error("Failed to fetch cached post timestamp");
        if (!subIpns.postUpdates)
            throw Error("Subplebbit IPNS record has no postUpdates field");
        const timestampRanges = getPostUpdateTimestampRange(subIpns.postUpdates, postTimestamp);
        if (timestampRanges.length === 0)
            throw Error("Post has no timestamp range bucket");
        this._comment._setUpdatingState("fetching-update-ipfs");
        if (this._defaultIpfsProviderUrl)
            return this._fetchCommentUpdateIpfsP2P(subIpns, timestampRanges, parentsPostUpdatePath, log);
        else
            return this._fetchCommentUpdateFromGateways(subIpns, timestampRanges, parentsPostUpdatePath, log);
    }
    async _fetchRawCommentCidIpfsP2P(cid) {
        this.updateIpfsState("fetching-ipfs");
        let commentRawString;
        try {
            commentRawString = await this._fetchCidP2P(cid);
        }
        catch (e) {
            throw e;
        }
        finally {
            this.updateIpfsState("stopped");
        }
        return commentRawString;
    }
    async _fetchCommentIpfsFromGateways(parentCid) {
        // We only need to validate once, because with Comment Ipfs the fetchFromMultipleGateways already validates if the response is the same as its cid
        const res = await this.fetchFromMultipleGateways({ recordIpfsType: "ipfs", recordPlebbitType: "comment", root: parentCid }, async (_) => { });
        return res.resText;
    }
    async _throwIfCommentIpfsIsInvalid(commentIpfs) {
        // Can potentially throw if resolver if not working
        const commentIpfsValidation = await verifyCommentIpfs(commentIpfs, this._plebbit.resolveAuthorAddresses, this, true);
        if (!commentIpfsValidation.valid)
            throw new PlebbitError("ERR_COMMENT_IPFS_SIGNATURE_IS_INVALID", { commentIpfs, commentIpfsValidation });
    }
    // We're gonna fetch Comment Ipfs, and verify its signature and schema
    async fetchAndVerifyCommentCid(cid) {
        let commentRawString;
        if (this._defaultIpfsProviderUrl) {
            commentRawString = await this._fetchRawCommentCidIpfsP2P(cid);
        }
        else
            commentRawString = await this._fetchCommentIpfsFromGateways(cid);
        const commentIpfs = parseCommentIpfsSchemaWithPlebbitErrorIfItFails(parseJsonWithPlebbitErrorIfFails(commentRawString)); // could throw if schema is invalid
        await this._throwIfCommentIpfsIsInvalid(commentIpfs);
        return commentIpfs;
    }
    updateIpfsState(newState) {
        super.updateIpfsState(newState);
    }
    _isPublishing() {
        return this._comment.state === "publishing";
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
            const error = new PlebbitError("ERR_DOMAIN_TXT_RECORD_NOT_FOUND", {
                subplebbitAddress: address,
                textRecord: txtRecordName
            });
            this._comment.emit("error", error);
            throw error;
        }
    }
    preFetchSubplebbitIpns(subIpnsName) {
        if (this._isPublishing())
            this._comment._updatePublishingState("fetching-subplebbit-ipns");
        else
            this._comment._setUpdatingState("fetching-subplebbit-ipns");
    }
    preResolveSubplebbitIpnsP2P(subIpnsName) {
        this.updateIpfsState("fetching-subplebbit-ipns");
    }
    postResolveSubplebbitIpnsP2PSuccess(subIpnsName, subplebbitCid) {
        this.updateIpfsState("fetching-subplebbit-ipfs");
        if (this._isPublishing())
            this._comment._updatePublishingState("fetching-subplebbit-ipfs");
        else
            this._comment._setUpdatingState("fetching-subplebbit-ipfs");
    }
    postResolveSubplebbitIpnsP2PFailure(subIpnsName, err) {
        this.updateIpfsState("stopped");
        if (this._isPublishing()) {
            this._comment._updatePublishingState("failed");
        }
        else
            this._comment._setUpdatingState("failed");
        this._comment.emit("error", err);
        throw err;
    }
    postFetchSubplebbitStringJsonP2PSuccess() {
        // If we're updating, then no it shouldn't be stopped cause we're gonna load comment-update after
        if (this._isPublishing())
            this.updateIpfsState("stopped");
    }
    postFetchSubplebbitStringJsonP2PFailure(subIpnsName, subplebbitCid, err) {
        return this.postResolveSubplebbitIpnsP2PFailure(subIpnsName, err);
    }
    postFetchSubplebbitIpfsSuccess(subJson) { }
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
    postFetchGatewaySuccess(gatewayUrl, loadOpts) {
        // if we're fetching CommentUpdate, it shouldn't be "stopped" after fetching subplebbit-ipfs
        if (loadOpts.recordPlebbitType === "subplebbit" && !this._isPublishing())
            return;
        else
            return super.postFetchGatewaySuccess(gatewayUrl, loadOpts);
    }
}
export class SubplebbitClientsManager extends ClientsManager {
    constructor(subplebbit) {
        super(subplebbit._plebbit);
        this._subplebbit = subplebbit;
        this._initPlebbitRpcClients();
    }
    _initIpfsClients() {
        if (this._plebbit.clients.ipfsClients)
            for (const ipfsUrl of remeda.keys.strict(this._plebbit.clients.ipfsClients))
                this.clients.ipfsClients = { ...this.clients.ipfsClients, [ipfsUrl]: new SubplebbitIpfsClient("stopped") };
    }
    _initPubsubClients() {
        for (const pubsubUrl of remeda.keys.strict(this._plebbit.clients.pubsubClients))
            this.clients.pubsubClients = { ...this.clients.pubsubClients, [pubsubUrl]: new SubplebbitPubsubClient("stopped") };
    }
    _initPlebbitRpcClients() {
        for (const rpcUrl of remeda.keys.strict(this._plebbit.clients.plebbitRpcClients))
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
            const error = new PlebbitError("ERR_DOMAIN_TXT_RECORD_NOT_FOUND", {
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
    preFetchSubplebbitIpns(subIpnsName) {
        this._subplebbit._setUpdatingState("fetching-ipns");
    }
    preResolveSubplebbitIpnsP2P(subIpnsName) {
        this.updateIpfsState("fetching-ipns");
    }
    postResolveSubplebbitIpnsP2PSuccess(subIpnsName, subplebbitCid) {
        this.updateIpfsState("fetching-ipfs");
        this._subplebbit._setUpdatingState("fetching-ipfs");
    }
    postResolveSubplebbitIpnsP2PFailure(subIpnsName, err) {
        this.updateIpfsState("stopped");
        this._subplebbit._setUpdatingState("failed");
    }
    postFetchSubplebbitStringJsonP2PSuccess() {
        this.updateIpfsState("stopped");
    }
    postFetchSubplebbitStringJsonP2PFailure(subIpnsName, subplebbitCid, err) {
        this.updateIpfsState("stopped");
        this._subplebbit._setUpdatingState("failed");
    }
    // for both gateway and IPFS P2P
    postFetchSubplebbitIpfsSuccess(subJson) {
        this._subplebbit._setUpdatingState("succeeded");
    }
    // if we're loading a SubplebbitIpfs through RemoteSubplebbit, and the record itself has a problem
    // Could be invalid json or schema or signature
    postFetchSubplebbitInvalidRecord(subJson, subError) {
        this._subplebbit._setUpdatingState("failed");
        this._subplebbit.emit("error", subError);
        throw subError;
    }
}
//# sourceMappingURL=client-manager.js.map