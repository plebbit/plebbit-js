import { MessageHandlerFn } from "ipfs-http-client/types/src/pubsub/subscription-tracker";
import Publication from "../publication";
import { fromString as uint8ArrayFromString } from "uint8arrays/from-string";
import { Plebbit } from "../plebbit";
import { Comment } from "../comment";
import { throwWithErrorCode, timestamp } from "../util";
import assert from "assert";
import { CommentIpfsType, CommentUpdate, SubplebbitIpfsType } from "../types";
import Hash from "ipfs-only-hash";
import { Subplebbit } from "../subplebbit";
import { verifySubplebbit } from "../signer";
import lodash from "lodash";
import { nativeFunctions } from "../runtime/node/util";
import isIPFS from "is-ipfs";
import Logger from "@plebbit/plebbit-logger";
import { PlebbitError } from "../plebbit-error";
import pLimit from "p-limit";
import { GenericIpfsGatewayClient } from "./ipfs-gateway-client";
import { CommentIpfsClient, GenericIpfsClient, PublicationIpfsClient, SubplebbitIpfsClient } from "./ipfs-client";
import { GenericPubsubClient, PublicationPubsubClient, SubplebbitPubsubClient } from "./pubsub-client";
import { GenericChainProviderClient } from "./chain-provider-client";

const DOWNLOAD_LIMIT_BYTES = 1000000; // 1mb

export class ClientsManager {
    protected _plebbit: Plebbit;
    protected curPubsubNodeUrl: string; // The URL of the pubsub that is used currently
    protected curIpfsNodeUrl: string | undefined; // The URL of the ipfs node that is used currently
    clients: {
        ipfsGateways: { [ipfsGatewayUrl: string]: GenericIpfsGatewayClient };
        ipfsClients: { [ipfsClientUrl: string]: GenericIpfsClient };
        pubsubClients: { [pubsubClientUrl: string]: GenericPubsubClient };
        chainProviders: { [chainProviderUrl: string]: GenericChainProviderClient };
    };

    constructor(plebbit: Plebbit) {
        this._plebbit = plebbit;
        this.curPubsubNodeUrl = <string>Object.values(plebbit.clients.pubsubClients)[0]._clientOptions.url;
        if (plebbit.clients.ipfsClients) this.curIpfsNodeUrl = <string>Object.values(plebbit.clients.ipfsClients)[0]._clientOptions.url;
        //@ts-expect-error
        this.clients = {};
        this._initIpfsGateways();
        this._initIpfsClients();
        this._initPubsubClients();
        this._initChainProviders();
    }

    toJSON() {
        return undefined;
    }

    protected _initIpfsGateways() {
        for (const gatewayUrl of Object.keys(this._plebbit.clients.ipfsGateways))
            this.clients.ipfsGateways = { ...this.clients.ipfsGateways, [gatewayUrl]: new GenericIpfsGatewayClient("stopped") };
    }

    protected _initIpfsClients() {
        if (this._plebbit.clients.ipfsClients)
            for (const ipfsUrl of Object.keys(this._plebbit.clients.ipfsClients))
                this.clients.ipfsClients = { ...this.clients.ipfsClients, [ipfsUrl]: new GenericIpfsClient("stopped") };
    }

    protected _initPubsubClients() {
        for (const pubsubUrl of Object.keys(this._plebbit.clients.pubsubClients))
            this.clients.pubsubClients = { ...this.clients.pubsubClients, [pubsubUrl]: new GenericPubsubClient("stopped") };
    }

    protected _initChainProviders() {
        for (const chainProviderUrl of Object.keys(this._plebbit.clients.chainProviders))
            this.clients.chainProviders = { ...this.clients.chainProviders, [chainProviderUrl]: new GenericChainProviderClient("stopped") };
    }

    getCurrentPubsub() {
        return this._plebbit.clients.pubsubClients[this.curPubsubNodeUrl];
    }

    getCurrentIpfs() {
        assert(this.curIpfsNodeUrl);
        assert(this._plebbit.clients.ipfsClients[this.curIpfsNodeUrl]);
        return this._plebbit.clients.ipfsClients[this.curIpfsNodeUrl];
    }

    async pubsubSubscribe(pubsubTopic: string, handler: MessageHandlerFn) {
        this.updatePubsubState("subscribing-pubsub");
        await this.getCurrentPubsub()._client.pubsub.subscribe(pubsubTopic, handler);
    }

    async pubsubUnsubscribe(pubsubTopic: string, handler?: MessageHandlerFn) {
        // this.updatePubsubState("stopped"); // Not sure this line should be here
        await this.getCurrentPubsub()._client.pubsub.unsubscribe(pubsubTopic, handler);
    }

    async pubsubPublish(pubsubTopic: string, data: string) {
        const dataBinary = uint8ArrayFromString(data);
        await this.getCurrentPubsub()._client.pubsub.publish(pubsubTopic, dataBinary);
    }

    private async _fetchWithLimit(url: string, options?): Promise<string> {
        // Node-fetch will take care of size limits through options.size, while browsers will process stream manually
        let res: Response;
        try {
            //@ts-expect-error
            res = await nativeFunctions.fetch(url, { ...options, size: DOWNLOAD_LIMIT_BYTES });
            if (res.status !== 200) throw Error("Failed to fetch");
            // If getReader is undefined that means node-fetch is used here. node-fetch processes options.size automatically
            if (res?.body?.getReader === undefined) return await res.text();
        } catch (e) {
            if (e.message.includes("over limit"))
                throwWithErrorCode("ERR_OVER_DOWNLOAD_LIMIT", { url, downloadLimit: DOWNLOAD_LIMIT_BYTES });
            const errorCode = url.includes("/ipfs/")
                ? "ERR_FAILED_TO_FETCH_IPFS_VIA_GATEWAY"
                : url.includes("/ipns/")
                ? "ERR_FAILED_TO_FETCH_IPNS_VIA_GATEWAY"
                : "ERR_FAILED_TO_FETCH_GENERIC";
            throwWithErrorCode(errorCode, { url, status: res?.status, statusText: res?.statusText, error: e });

            // If error is not related to size limit, then throw it again
        }

        //@ts-ignore
        if (res?.body?.getReader !== undefined) {
            let totalBytesRead = 0;

            // @ts-ignore
            const reader = res.body.getReader();
            const decoder = new TextDecoder("utf-8");

            let resText: string = "";

            while (true) {
                const { done, value } = await reader.read();
                //@ts-ignore
                if (value) resText += decoder.decode(value);
                if (done || !value) break;
                if (value.length + totalBytesRead > DOWNLOAD_LIMIT_BYTES)
                    throwWithErrorCode("ERR_OVER_DOWNLOAD_LIMIT", { url, downloadLimit: DOWNLOAD_LIMIT_BYTES });
                totalBytesRead += value.length;
            }
            return resText;
        }
    }

    async resolveIpnsToCidP2P(ipns: string): Promise<string> {
        const ipfsClient = this.getCurrentIpfs();
        try {
            const cid = await ipfsClient._client.name.resolve(ipns);
            if (typeof cid !== "string") throwWithErrorCode("ERR_FAILED_TO_RESOLVE_IPNS_VIA_IPFS", { ipns });
            return cid;
        } catch (error) {
            throwWithErrorCode("ERR_FAILED_TO_RESOLVE_IPNS_VIA_IPFS", { ipns, error });
        }
    }

    async fetchCidP2P(cid: string): Promise<string> {
        const ipfsClient = this.getCurrentIpfs();
        const fileContent = await ipfsClient._client.cat(cid, { length: DOWNLOAD_LIMIT_BYTES }); // Limit is 1mb files
        if (typeof fileContent !== "string") throwWithErrorCode("ERR_FAILED_TO_FETCH_IPFS_VIA_IPFS", { cid });
        const calculatedCid: string = await Hash.of(fileContent);
        if (fileContent.length === DOWNLOAD_LIMIT_BYTES && calculatedCid !== cid)
            throwWithErrorCode("ERR_OVER_DOWNLOAD_LIMIT", { cid, downloadLimit: DOWNLOAD_LIMIT_BYTES });
        return fileContent;
    }

    private async _verifyContentIsSameAsCid(content: string, cid: string) {
        const calculatedCid: string = await Hash.of(content);
        if (content.length === DOWNLOAD_LIMIT_BYTES && calculatedCid !== cid)
            throwWithErrorCode("ERR_OVER_DOWNLOAD_LIMIT", { cid, downloadLimit: DOWNLOAD_LIMIT_BYTES });
        if (calculatedCid !== cid) throwWithErrorCode("ERR_CALCULATED_CID_DOES_NOT_MATCH", { calculatedCid, cid });
    }

    protected async fetchWithGateway(gateway: string, path: string): Promise<string | { error: PlebbitError }> {
        const log = Logger("plebbit-js:plebbit:fetchWithGateway");
        const url = `${gateway}${path}`;

        log.trace(`Fetching url (${url})`);

        const timeBefore = Date.now();
        const isCid = path.includes("/ipfs/"); // If false, then IPNS
        this.updateGatewayState(isCid ? "fetching-ipfs" : "fetching-ipns", gateway);
        try {
            const resText = await this._fetchWithLimit(url, { cache: isCid ? "force-cache" : "no-store" });
            if (isCid) await this._verifyContentIsSameAsCid(resText, path.split("/ipfs/")[1]);
            this.updateGatewayState("stopped", gateway);
            const timeElapsedMs = Date.now() - timeBefore;
            await this._plebbit.stats.recordGatewaySuccess(gateway, isCid ? "cid" : "ipns", timeElapsedMs);
            return resText;
        } catch (e) {
            this.updateGatewayState("stopped", gateway);
            await this._plebbit.stats.recordGatewayFailure(gateway, isCid ? "cid" : "ipns");
            return { error: e };
        }
    }

    async fetchFromMultipleGateways(loadOpts: { cid?: string; ipns?: string }): Promise<string> {
        assert(loadOpts.cid || loadOpts.ipns);

        const path = loadOpts.cid ? `/ipfs/${loadOpts.cid}` : `/ipns/${loadOpts.ipns}`;

        const _firstResolve = (promises: Promise<string | { error: PlebbitError }>[]) => {
            return new Promise<string>((resolve) =>
                promises.forEach((promise) =>
                    promise.then((res) => {
                        if (typeof res === "string") resolve(res);
                    })
                )
            );
        };

        const type = loadOpts.cid ? "cid" : "ipns";

        const concurrencyLimit = 3;

        const queueLimit = pLimit(concurrencyLimit);

        // Only sort if we have more than 3 gateways
        const gatewaysSorted =
            Object.keys(this._plebbit.clients.ipfsGateways).length <= concurrencyLimit
                ? Object.keys(this._plebbit.clients.ipfsGateways)
                : await this._plebbit.stats.sortGatewaysAccordingToScore(type);

        const gatewayPromises = gatewaysSorted.map((gateway) => queueLimit(() => this.fetchWithGateway(gateway, path)));

        const res = await Promise.race([_firstResolve(gatewayPromises), Promise.allSettled(gatewayPromises)]);
        if (typeof res === "string") {
            queueLimit.clearQueue();
            return res;
        } //@ts-expect-error
        else throw res[0].value.error;
    }

    // State methods here

    updatePubsubState(newState: GenericPubsubClient["state"]) {
        this.clients.pubsubClients[this.curPubsubNodeUrl].state = newState;
        this.clients.pubsubClients[this.curPubsubNodeUrl].emit("statechange", newState);
    }

    updateIpfsState(newState: GenericIpfsClient["state"]) {
        assert(this.curIpfsNodeUrl);
        this.clients.ipfsClients[this.curIpfsNodeUrl].state = newState;
        this.clients.ipfsClients[this.curIpfsNodeUrl].emit("statechange", newState);
    }

    updateGatewayState(newState: GenericIpfsGatewayClient["state"], gateway: string) {
        this.clients.ipfsGateways[gateway].state = newState;
        this.clients.ipfsGateways[gateway].emit("statechange", newState);
    }

    updateChainProviderState(newState: GenericChainProviderClient["state"], chainTicker: string) {
        this.clients.chainProviders[chainTicker].state = newState;
        this.clients.chainProviders[chainTicker].emit("statechange", newState);
    }

    handleError(e: PlebbitError) {
        this._plebbit.emit("error", e);
    }

    // Resolver methods here

    async resolveSubplebbitAddressIfNeeded(subplebbitAddress: string): Promise<string | undefined> {
        assert(typeof subplebbitAddress === "string", "subplebbitAddress needs to be a string to be resolved");
        const log = Logger("plebbit-js:plebbit:resolver:resolveSubplebbitAddressIfNeeded");
        let resolvedSubplebbitAddress: string = lodash.clone(subplebbitAddress);
        const txtRecordName = "subplebbit-address";
        if (subplebbitAddress.endsWith(".eth")) {
            const resolveCache: string | undefined = await this._plebbit._cache.getItem(`${subplebbitAddress}_${txtRecordName}`); // TODO Should be rewritten
            if (typeof resolveCache === "string") {
                const resolvedTimestamp: number = await this._plebbit._cache.getItem(`${subplebbitAddress}_${txtRecordName}_timestamp`);
                assert(typeof resolvedTimestamp === "number");
                const shouldResolveAgain = timestamp() - resolvedTimestamp > 86400; // Only resolve again if last time was over a day
                if (!shouldResolveAgain) return resolveCache;
                log(`Cache of ENS (${subplebbitAddress}) txt record name (${txtRecordName}) is stale. Invalidating the cache...`);
            }

            this.updateChainProviderState("resolving-subplebbit-address", "eth");
            try {
                resolvedSubplebbitAddress = await this._plebbit.resolver._resolveEnsTxtRecord(subplebbitAddress, "subplebbit-address");
                this.updateChainProviderState("stopped", "eth");
                return resolvedSubplebbitAddress;
            } catch (e) {
                this.updateChainProviderState("stopped", "eth");
                throw e;
            }
        } else return resolvedSubplebbitAddress;
    }

    async resolveAuthorAddressIfNeeded(authorAddress: string) {
        assert(typeof authorAddress === "string", "subplebbitAddress needs to be a string to be resolved");
        let resolvedAuthorAddress: string = lodash.clone(authorAddress);
        const log = Logger("plebbit-js:plebbit:resolver:resolveAuthorAddressIfNeeded");

        const txtRecordName = `plebbit-author-address`;
        if (authorAddress.endsWith(".eth")) {
            const resolveCache: string | undefined = await this._plebbit._cache.getItem(`${authorAddress}_${txtRecordName}`);
            if (typeof resolveCache === "string") {
                const resolvedTimestamp: number = await this._plebbit._cache.getItem(`${authorAddress}_${txtRecordName}_timestamp`);
                assert(typeof resolvedTimestamp === "number");
                const shouldResolveAgain = timestamp() - resolvedTimestamp > 86400; // Only resolve again if last time was over a day
                if (!shouldResolveAgain) return resolveCache;
                log(`Cache of ENS (${authorAddress}) txt record name (${txtRecordName}) is stale. Invalidating the cache...`);
            }

            this.updateChainProviderState("resolving-author-address", "eth");
            try {
                resolvedAuthorAddress = await this._plebbit.resolver._resolveEnsTxtRecord(authorAddress, txtRecordName);
                this.updateChainProviderState("stopped", "eth");
                return resolvedAuthorAddress;
            } catch (e) {
                this.updateChainProviderState("stopped", "eth");
                throw e;
            }
        } else return resolvedAuthorAddress;
    }

    // Convience methods for plebbit here
    // No need to update states

    async fetchIpns(ipns: string) {
        if (this.curIpfsNodeUrl) {
            const subCid = await this.resolveIpnsToCidP2P(ipns);
            return this.fetchCidP2P(subCid);
        } else {
            return this.fetchFromMultipleGateways({ ipns });
        }
    }

    async fetchCid(cid: string) {
        let finalCid = lodash.clone(cid);
        if (!isIPFS.cid(finalCid) && isIPFS.path(finalCid)) finalCid = finalCid.split("/")[2];
        if (!isIPFS.cid(finalCid)) throwWithErrorCode("ERR_CID_IS_INVALID", { cid });
        if (this.curIpfsNodeUrl) return this.fetchCidP2P(cid);
        else return this.fetchFromMultipleGateways({ cid });
    }
}

export class PublicationClientsManager extends ClientsManager {
    clients: {
        ipfsGateways: { [ipfsGatewayUrl: string]: GenericIpfsGatewayClient };
        ipfsClients: { [ipfsClientUrl: string]: PublicationIpfsClient | CommentIpfsClient };
        pubsubClients: { [pubsubClientUrl: string]: PublicationPubsubClient };
        chainProviders: { [chainProviderUrl: string]: GenericChainProviderClient };
    };
    _publication: Publication;

    constructor(publication: Publication) {
        super(publication._plebbit);
        this._publication = publication;
    }

    protected _initIpfsClients(): void {
        if (this._plebbit.clients.ipfsClients)
            for (const ipfsUrl of Object.keys(this._plebbit.clients.ipfsClients))
                this.clients.ipfsClients = { ...this.clients.ipfsClients, [ipfsUrl]: new PublicationIpfsClient("stopped") };
    }

    protected _initPubsubClients(): void {
        for (const pubsubUrl of Object.keys(this._plebbit.clients.pubsubClients))
            this.clients.pubsubClients = { ...this.clients.pubsubClients, [pubsubUrl]: new PublicationPubsubClient("stopped") };
    }

    async publishChallengeRequest(pubsubTopic: string, data: string) {
        await this.pubsubPublish(pubsubTopic, data);
    }

    async publishChallengeAnswer(pubsubTopic: string, data: string) {
        await this.pubsubPublish(pubsubTopic, data);
        this.updatePubsubState("waiting-challenge-verification");
    }

    handleError(e: PlebbitError): void {
        this._publication.emit("error", e);
    }

    async fetchSubplebbitForPublishing(subplebbitAddress: string) {
        if (typeof subplebbitAddress !== "string" || subplebbitAddress.length === 0)
            throwWithErrorCode("ERR_INVALID_SUBPLEBBIT_ADDRESS", { subplebbitAddress });

        const subIpns = await this.resolveSubplebbitAddressIfNeeded(subplebbitAddress); // Temporary. Should be retrying here

        this._publication._updatePublishingState("fetching-subplebbit-ipns");
        let subJson: SubplebbitIpfsType;
        if (this.curIpfsNodeUrl) {
            this.updateIpfsState("fetching-subplebbit-ipns");
            const subCid = await this.resolveIpnsToCidP2P(subIpns);
            this._publication._updatePublishingState("fetching-subplebbit-ipfs");
            this.updateIpfsState("fetching-subplebbit-ipfs");
            subJson = JSON.parse(await this.fetchCidP2P(subCid));
            this.updateIpfsState("stopped");
        } else subJson = JSON.parse(await this.fetchFromMultipleGateways({ ipns: subIpns }));

        const signatureValidity = await verifySubplebbit(subJson, this._plebbit.resolveAuthorAddresses, this);

        if (!signatureValidity.valid) throwWithErrorCode("ERR_SIGNATURE_IS_INVALID", { signatureValidity, subplebbitAddress, subJson });

        return subJson;
    }

    updateIpfsState(newState: PublicationIpfsClient["state"] | CommentIpfsClient["state"]) {
        super.updateIpfsState(newState);
    }

    updatePubsubState(newState: PublicationPubsubClient["state"]) {
        this.clients.pubsubClients[this.curPubsubNodeUrl].state = newState;
        this.clients.pubsubClients[this.curPubsubNodeUrl].emit("statechange", newState);
    }
}

export class CommentClientsManager extends PublicationClientsManager {
    clients: {
        ipfsGateways: { [ipfsGatewayUrl: string]: GenericIpfsGatewayClient };
        ipfsClients: { [ipfsClientUrl: string]: CommentIpfsClient };
        pubsubClients: { [pubsubClientUrl: string]: PublicationPubsubClient };
        chainProviders: { [chainProviderUrl: string]: GenericChainProviderClient };
    };
    private _comment: Comment;

    constructor(comment: Comment) {
        super(comment);
        this._comment = comment;
    }

    protected _initIpfsClients(): void {
        if (this._plebbit.clients.ipfsClients)
            for (const ipfsUrl of Object.keys(this._plebbit.clients.ipfsClients))
                this.clients.ipfsClients = { ...this.clients.ipfsClients, [ipfsUrl]: new CommentIpfsClient("stopped") };
    }

    async fetchCommentUpdate(ipnsName: string): Promise<CommentUpdate> {
        this._comment._setUpdatingState("fetching-update-ipns");
        if (this.curIpfsNodeUrl) {
            this.updateIpfsState("fetching-update-ipns");
            const updateCid = await this.resolveIpnsToCidP2P(ipnsName);
            this._comment._setUpdatingState("fetching-update-ipfs");
            this.updateIpfsState("fetching-update-ipfs");
            const commentUpdate: CommentUpdate = JSON.parse(await this.fetchCidP2P(updateCid));
            this.updateIpfsState("stopped");
            return commentUpdate;
        } else {
            // States of gateways should be updated by fetchFromMultipleGateways
            const update: CommentUpdate = JSON.parse(await this.fetchFromMultipleGateways({ ipns: ipnsName }));
            return update;
        }
    }

    async fetchCommentCid(cid: string): Promise<CommentIpfsType> {
        this._comment._setUpdatingState("fetching-ipfs");
        if (this.curIpfsNodeUrl) {
            this.updateIpfsState("fetching-ipfs");
            const commentContent: CommentIpfsType = JSON.parse(await this.fetchCidP2P(cid));
            this.updateIpfsState("stopped");
            return commentContent;
        } else {
            const commentContent: CommentIpfsType = JSON.parse(await this.fetchFromMultipleGateways({ cid }));
            return commentContent;
        }
    }

    updateIpfsState(newState: CommentIpfsClient["state"]) {
        super.updateIpfsState(newState);
    }
}

export class SubplebbitClientsManager extends ClientsManager {
    clients: {
        ipfsGateways: { [ipfsGatewayUrl: string]: GenericIpfsGatewayClient };
        ipfsClients: { [ipfsClientUrl: string]: SubplebbitIpfsClient };
        pubsubClients: { [pubsubClientUrl: string]: SubplebbitPubsubClient };
        chainProviders: { [chainProviderUrl: string]: GenericChainProviderClient };
    };
    private _subplebbit: Subplebbit;

    constructor(subplebbit: Subplebbit) {
        super(subplebbit.plebbit);
        this._subplebbit = subplebbit;
    }

    protected _initIpfsClients(): void {
        if (this._plebbit.clients.ipfsClients)
            for (const ipfsUrl of Object.keys(this._plebbit.clients.ipfsClients))
                this.clients.ipfsClients = { ...this.clients.ipfsClients, [ipfsUrl]: new SubplebbitIpfsClient("stopped") };
    }

    protected _initPubsubClients(): void {
        for (const pubsubUrl of Object.keys(this._plebbit.clients.pubsubClients))
            this.clients.pubsubClients = { ...this.clients.pubsubClients, [pubsubUrl]: new SubplebbitPubsubClient("stopped") };
    }

    async fetchSubplebbit(ipnsName: string) {
        this._subplebbit._setUpdatingState("fetching-ipns");
        if (this.curIpfsNodeUrl) {
            this.updateIpfsState("fetching-ipns");
            const subplebbitCid = await this.resolveIpnsToCidP2P(ipnsName);
            this._subplebbit._setUpdatingState("fetching-ipfs");
            this.updateIpfsState("fetching-ipfs");
            const subplebbit: SubplebbitIpfsType = JSON.parse(await this.fetchCidP2P(subplebbitCid));
            this.updateIpfsState("stopped");
            return subplebbit;
        } else {
            // States of gateways should be updated by fetchFromMultipleGateways
            const update: SubplebbitIpfsType = JSON.parse(await this.fetchFromMultipleGateways({ ipns: ipnsName }));
            return update;
        }
    }

    updateIpfsState(newState: SubplebbitIpfsClient["state"]) {
        super.updateIpfsState(newState);
    }

    updatePubsubState(newState: SubplebbitPubsubClient["state"]) {
        super.updatePubsubState(newState);
    }

    handleError(e: PlebbitError): void {
        this._subplebbit.emit("error", e);
    }
}
