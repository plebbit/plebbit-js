import { binaryKeyToPubsubTopic, doesDomainAddressHaveCapitalLetter, hideClassPrivateProps, isIpns, pubsubTopicToDhtKey, shortifyAddress, timestamp } from "../util.js";
import Logger from "@plebbit/plebbit-logger";
import { TypedEmitter } from "tiny-typed-emitter";
import { FailedToFetchSubplebbitFromGatewaysError, PlebbitError } from "../plebbit-error.js";
import * as remeda from "remeda";
import { PostsPages } from "../pages/pages.js";
import { parseRawPages } from "../pages/util.js";
import { SubplebbitIpfsSchema } from "./schema.js";
import { SubplebbitClientsManager } from "./subplebbit-client-manager.js";
import { getPeerIdFromPublicKey } from "../signer/util.js";
export class RemoteSubplebbit extends TypedEmitter {
    constructor(plebbit) {
        super();
        this._rawSubplebbitIpfs = undefined;
        this._lastInvalidSubplebbitCid = undefined; // a subplebbit cid that's invalid signature/schema/etc
        this._updatingSubInstanceWithListeners = undefined; // The plebbit._updatingSubplebbits we're subscribed to
        this._plebbit = plebbit;
        this._setState("stopped");
        this._setUpdatingState("stopped");
        // these functions might get separated from their `this` when used
        this.update = this.update.bind(this);
        this.stop = this.stop.bind(this);
        this.on("error", (...args) => this._plebbit.emit("error", ...args));
        this._clientsManager = new SubplebbitClientsManager(this);
        this.clients = this._clientsManager.clients;
        this.posts = new PostsPages({
            pageCids: {},
            pages: {},
            plebbit: this._plebbit,
            subplebbit: remeda.pick(this, ["address", "signature"]),
            pagesIpfs: undefined
        });
        hideClassPrivateProps(this);
    }
    async _updateLocalPostsInstance(newPosts) {
        const log = Logger("plebbit-js:remote-subplebbit:_updateLocalPostsInstanceIfNeeded");
        if (!newPosts)
            // The sub has changed its address, need to reset the posts
            this.posts.resetPages();
        else if (!("pages" in newPosts)) {
            // only pageCids is provided
            this.posts.pageCids = newPosts.pageCids;
        }
        else {
            const shouldUpdatePosts = !remeda.isDeepEqual(this.posts.pageCids, newPosts.pageCids);
            if (shouldUpdatePosts) {
                log.trace(`Updating the props of subplebbit (${this.address}) posts`);
                const parsedPages = parseRawPages(newPosts);
                this.posts.updateProps({
                    ...parsedPages,
                    subplebbit: remeda.pick(this, ["address", "signature"]),
                    pageCids: newPosts?.pageCids || {}
                });
            }
        }
    }
    async initSubplebbitIpfsPropsNoMerge(newProps) {
        const log = Logger("plebbit-js:remote-subplebbit:initSubplebbitIpfsPropsNoMerge");
        this._rawSubplebbitIpfs = newProps;
        await this.initRemoteSubplebbitPropsNoMerge(newProps);
        const unknownProps = remeda.difference(remeda.keys.strict(this._rawSubplebbitIpfs), remeda.keys.strict(SubplebbitIpfsSchema.shape));
        if (unknownProps.length > 0) {
            log(`Found unknown props on subplebbit (${this._rawSubplebbitIpfs.address}) ipfs record`, unknownProps);
            Object.assign(this, remeda.pick(this._rawSubplebbitIpfs, unknownProps));
        }
    }
    async initRemoteSubplebbitPropsNoMerge(newProps) {
        // This function is not strict, and will assume all props can be undefined, except address
        this.title = newProps.title;
        this.description = newProps.description;
        this.lastPostCid = newProps.lastPostCid;
        this.lastCommentCid = newProps.lastCommentCid;
        this.pubsubTopic = newProps.pubsubTopic;
        this.protocolVersion = newProps.protocolVersion;
        this.roles = newProps.roles;
        this.features = newProps.features;
        this.suggested = newProps.suggested;
        this.rules = newProps.rules;
        this.flairs = newProps.flairs;
        this.postUpdates = newProps.postUpdates;
        this.challenges = newProps.challenges;
        this.statsCid = newProps.statsCid;
        this.createdAt = newProps.createdAt;
        this.updatedAt = newProps.updatedAt;
        this.encryption = newProps.encryption;
        this.signature = newProps.signature;
        if (this.signature?.publicKey && !this.ipnsName) {
            const signaturePeerId = await getPeerIdFromPublicKey(this.signature.publicKey);
            this.ipnsName = signaturePeerId.toB58String();
            this.ipnsPubsubTopic = binaryKeyToPubsubTopic(signaturePeerId.toBytes());
            this.ipnsPubsubTopicDhtKey = await pubsubTopicToDhtKey(this.ipnsPubsubTopic);
        }
        this.setAddress(newProps.address);
        await this._updateLocalPostsInstance(newProps.posts);
        // Exclusive Instance props
        if (newProps.updateCid)
            this.updateCid = newProps.updateCid;
    }
    setAddress(newAddress) {
        // check if domain or ipns
        // else, throw an error
        if (doesDomainAddressHaveCapitalLetter(newAddress))
            throw new PlebbitError("ERR_DOMAIN_ADDRESS_HAS_CAPITAL_LETTER", { subplebbitAddress: newAddress });
        const isDomain = newAddress.includes(".");
        if (!isDomain && !isIpns(newAddress))
            throw new PlebbitError("ERR_INVALID_SUBPLEBBIT_ADDRESS_SCHEMA", { subplebbitAddress: newAddress, isDomain, isIpns: false });
        this.address = newAddress;
        this.shortAddress = shortifyAddress(this.address);
        this.posts._subplebbit = remeda.pick(this, ["address", "signature"]);
    }
    _toJSONIpfsBaseNoPosts() {
        const subplebbitIpfsKeys = remeda.keys.strict(remeda.omit(SubplebbitIpfsSchema.shape, ["posts"]));
        return remeda.pick(this, subplebbitIpfsKeys);
    }
    toJSONIpfs() {
        if (!this._rawSubplebbitIpfs)
            throw Error("should not be calling toJSONIpfs() before defining _rawSubplebbitIpfs");
        return this._rawSubplebbitIpfs;
    }
    toJSONRpcRemote() {
        if (!this.updateCid)
            throw Error("subplebbit.updateCid should be defined before calling toJSONRpcRemote");
        return {
            subplebbit: this.toJSONIpfs(),
            updateCid: this.updateCid
        };
    }
    _setState(newState) {
        if (newState === this.state)
            return;
        this.state = newState;
        this.emit("statechange", this.state);
    }
    _setUpdatingState(newState) {
        if (newState === this.updatingState)
            return;
        this.updatingState = newState;
        this.emit("updatingstatechange", this.updatingState);
    }
    // Errors that retrying to load the ipns record will not help
    // Instead we should abort the retries, and emit an error event to notify the user to do something about it
    _isRetriableErrorWhenLoading(err) {
        if (!(err instanceof PlebbitError))
            return false; // If it's not a recognizable error, then we throw to notify the user
        if (err.code === "ERR_SUBPLEBBIT_SIGNATURE_IS_INVALID" ||
            err.code === "ERR_INVALID_SUBPLEBBIT_IPFS_SCHEMA" ||
            err.code === "ERR_THE_SUBPLEBBIT_IPNS_RECORD_POINTS_TO_DIFFERENT_ADDRESS_THAN_WE_EXPECTED" ||
            err.code === "ERR_OVER_DOWNLOAD_LIMIT" ||
            err.code === "ERR_INVALID_JSON")
            return false;
        if (err instanceof FailedToFetchSubplebbitFromGatewaysError) {
            // If all gateway errors are non retriable, then the error is non retriable
            for (const gatewayError of Object.values(err.details.gatewayToError))
                if (this._isRetriableErrorWhenLoading(gatewayError))
                    return true;
            return false; // if all gateways are non retriable, then we should not retry
        }
        return true;
    }
    async _setSubplebbitIpfsPropsFromUpdatingSubplebbitsIfPossible() {
        const log = Logger("plebbit-js:comment:_setSubplebbitIpfsPropsFromUpdatingSubplebbitsIfPossible");
        const updatingSub = this._plebbit._updatingSubplebbits[this.address];
        if (updatingSub?._rawSubplebbitIpfs && (this.updatedAt || 0) < updatingSub._rawSubplebbitIpfs.updatedAt) {
            await this.initSubplebbitIpfsPropsNoMerge(updatingSub._rawSubplebbitIpfs);
            this.updateCid = updatingSub.updateCid;
            log.trace(`New Remote Subplebbit instance`, this.address, `will use SubplebbitIpfs from plebbit._updatingSubplebbits[${this.address}] with updatedAt`, this.updatedAt, "that's", timestamp() - this.updatedAt, "seconds old");
            this.emit("update", this);
        }
    }
    async _initSubInstanceWithListeners() {
        if (!this._plebbit._updatingSubplebbits[this.address])
            throw Error("should be defined at this stage");
        const log = Logger("plebbit-js:remote-subplebbit:update");
        const subInstance = this._plebbit._updatingSubplebbits[this.address];
        return {
            subplebbit: subInstance,
            update: async () => {
                await this.initSubplebbitIpfsPropsNoMerge(subInstance._rawSubplebbitIpfs);
                this.updateCid = subInstance.updateCid;
                log(`Remote Subplebbit instance`, this.address, `received update event from plebbit._updatingSubplebbits[${this.address}] with updatedAt`, this.updatedAt, "that's", timestamp() - this.updatedAt, "seconds old");
                this.emit("update", this);
            },
            error: async (error) => {
                this.emit("error", error);
            },
            updatingstatechange: async (newUpdatingState) => {
                this._setUpdatingState(newUpdatingState);
            },
            "waiting-retry": async (error) => {
                this.emit("waiting-retry", error);
            }
        };
    }
    async fetchLatestSubOrSubscribeToEvent() {
        const log = Logger("plebbit-js:remote-subplebbit:update:updateOnce");
        if (!this._plebbit._updatingSubplebbits[this.address]) {
            const updatingSub = await this._plebbit.createSubplebbit({
                address: this.address,
                ...this._rawSubplebbitIpfs,
                updateCid: this.updateCid
            });
            this._plebbit._updatingSubplebbits[this.address] = updatingSub;
            log("Creating a new entry for this._plebbit._updatingSubplebbits", this.address);
            // make sure to it keeps retrying to resolve here
            // should only stop when there's no subplebbit instance listening to its events
            // if it encounters a critical error, it should stop and delete this._plebbit._updatingSubplebbits[this.address]
            const updatingSubRemoveListenerListener = async (eventName, listener) => {
                const count = updatingSub.listenerCount("update");
                if (count === 0) {
                    log.trace(`cleaning up plebbit._updatingSubplebbits`, this.address, "There are no subplebbits using it for updates");
                    await cleanUpUpdatingSubInstance();
                }
            };
            const cleanUpUpdatingSubInstance = async () => {
                updatingSub.removeListener("removeListener", updatingSubRemoveListenerListener);
                await updatingSub.stop();
            };
            updatingSub.on("removeListener", updatingSubRemoveListenerListener);
        }
        this._updatingSubInstanceWithListeners = await this._initSubInstanceWithListeners();
        this._updatingSubInstanceWithListeners.subplebbit.on("update", this._updatingSubInstanceWithListeners.update);
        this._updatingSubInstanceWithListeners.subplebbit.on("updatingstatechange", this._updatingSubInstanceWithListeners.updatingstatechange);
        this._updatingSubInstanceWithListeners.subplebbit.on("error", this._updatingSubInstanceWithListeners.error);
        this._updatingSubInstanceWithListeners.subplebbit.on("waiting-retry", this._updatingSubInstanceWithListeners["waiting-retry"]);
        const clientKeys = ["chainProviders", "kuboRpcClients", "pubsubKuboRpcClients", "ipfsGateways"];
        for (const clientType of clientKeys)
            if (this.clients[clientType])
                for (const clientUrl of Object.keys(this.clients[clientType])) {
                    if ("state" in this.clients[clientType][clientUrl])
                        //@ts-expect-error
                        this.clients[clientType][clientUrl].mirror(this._updatingSubInstanceWithListeners.subplebbit.clients[clientType][clientUrl]);
                    else {
                        for (const clientUrlDeeper of Object.keys(this.clients[clientType][clientUrl])) {
                            this.clients[clientType][clientUrl][clientUrlDeeper].mirror(
                            //@ts-expect-error
                            this._updatingSubInstanceWithListeners.subplebbit.clients[clientType][clientUrl][clientUrlDeeper]);
                        }
                    }
                }
        if (this._updatingSubInstanceWithListeners.subplebbit.state === "stopped") {
            this._updatingSubInstanceWithListeners.subplebbit._setState("updating");
            await this._updatingSubInstanceWithListeners.subplebbit._clientsManager.startUpdatingLoop();
        }
    }
    async update() {
        if (this.state !== "stopped")
            return; // No need to do anything if subplebbit is already updating
        const log = Logger("plebbit-js:remote-subplebbit:update");
        this._setState("updating");
        await this.fetchLatestSubOrSubscribeToEvent();
    }
    async stop() {
        if (this.state !== "updating")
            throw Error("User call remoteSubplebbit.stop() without updating first");
        this._setUpdatingState("stopped");
        this._setState("stopped");
        if (this._updatingSubInstanceWithListeners) {
            // this instance is subscribed to plebbit._updatingSubplebbit[address]
            // removing listeners should reset plebbit._updatingSubplebbit by itself when there are no subscribers
            this._updatingSubInstanceWithListeners.subplebbit.removeListener("update", this._updatingSubInstanceWithListeners.update);
            this._updatingSubInstanceWithListeners.subplebbit.removeListener("updatingstatechange", this._updatingSubInstanceWithListeners.updatingstatechange);
            this._updatingSubInstanceWithListeners.subplebbit.removeListener("error", this._updatingSubInstanceWithListeners.error);
            this._updatingSubInstanceWithListeners.subplebbit.removeListener("waiting-retry", this._updatingSubInstanceWithListeners["waiting-retry"]);
            const clientKeys = ["chainProviders", "pubsubKuboRpcClients", "kuboRpcClients", "ipfsGateways"];
            for (const clientType of clientKeys)
                if (this.clients[clientType])
                    for (const clientUrl of Object.keys(this.clients[clientType])) {
                        if ("state" in this.clients[clientType][clientUrl])
                            //@ts-expect-error
                            this.clients[clientType][clientUrl].unmirror();
                        else {
                            for (const clientUrlDeeper of Object.keys(this.clients[clientType][clientUrl])) {
                                this.clients[clientType][clientUrl][clientUrlDeeper].unmirror();
                            }
                        }
                    }
            this._updatingSubInstanceWithListeners = undefined;
        }
        else {
            // this instance is plebbit._updatingSubplebbit[address] itself
            await this._clientsManager.stopUpdatingLoop();
            delete this._plebbit._updatingSubplebbits[this.address];
        }
    }
    // functions to be overridden in local subplebbit classes
    async edit(options) {
        throw Error("Can't edit a remote subplebbit");
    }
    async delete() {
        throw Error("Can't delete a remote subplebbit");
    }
    async start() {
        throw Error("Can't start a remote subplebbit");
    }
}
//# sourceMappingURL=remote-subplebbit.js.map