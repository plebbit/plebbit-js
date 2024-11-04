import { doesDomainAddressHaveCapitalLetter, hideClassPrivateProps, isIpns, shortifyAddress, timestamp } from "../util.js";
import Logger from "@plebbit/plebbit-logger";
import { TypedEmitter } from "tiny-typed-emitter";
import { FailedToFetchSubplebbitFromGatewaysError, PlebbitError } from "../plebbit-error.js";
import retry from "retry";
import { SubplebbitClientsManager } from "../clients/client-manager.js";
import * as remeda from "remeda";
import { PostsPages } from "../pages/pages.js";
import { parseRawPages } from "../pages/util.js";
import { SubplebbitIpfsSchema } from "./schema.js";
export class RemoteSubplebbit extends TypedEmitter {
    constructor(plebbit) {
        super();
        this._ipnsLoadingOperation = undefined;
        this._rawSubplebbitIpfs = undefined;
        // private
        this._updateTimeout = undefined;
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
            subplebbitAddress: this.address,
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
                    plebbit: this._plebbit,
                    subplebbitAddress: this.address,
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
        this.setAddress(newProps.address);
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
        this.posts._subplebbitAddress = this.address;
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
    // Instead we should abort the retries, and emit an error to notify the user to do something about it
    _isRetriableErrorWhenLoading(err) {
        if (!(err instanceof PlebbitError))
            return false; // If it's not a recognizable error, then we throw to notify the user
        if (err.code === "ERR_SUBPLEBBIT_SIGNATURE_IS_INVALID" ||
            err.code === "ERR_INVALID_SUBPLEBBIT_IPFS_SCHEMA" ||
            err.code === "ERR_GATEWAY_RESPONDED_WITH_DIFFERENT_SUBPLEBBIT" ||
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
    async _retryLoadingSubplebbitIpns(log, subplebbitIpnsAddress) {
        return new Promise((resolve) => {
            this._ipnsLoadingOperation.attempt(async (curAttempt) => {
                log.trace(`Retrying to load subplebbit ipns (${subplebbitIpnsAddress}) for the ${curAttempt}th time`);
                try {
                    const update = await this._clientsManager.fetchSubplebbit(subplebbitIpnsAddress);
                    this.updateCid = update.cid;
                    resolve(update.subplebbit);
                }
                catch (e) {
                    this._setUpdatingState("failed");
                    log.error(`Failed to load Subplebbit IPNS for the ${curAttempt}th attempt`, e);
                    if (e instanceof PlebbitError && !this._isRetriableErrorWhenLoading(e))
                        resolve(e);
                    else
                        this._ipnsLoadingOperation.retry(e);
                }
            });
        });
    }
    async updateOnce() {
        const log = Logger("plebbit-js:remote-subplebbit:update");
        this._ipnsLoadingOperation = retry.operation({ forever: true, factor: 2 });
        const loadedSubIpfsOrError = await this._retryLoadingSubplebbitIpns(log, this.address);
        if (loadedSubIpfsOrError instanceof Error) {
            log.error(`Subplebbit ${this.address} encountered a non retriable error while updating, will emit an error event and abort the current update iteration`, `Will retry after ${this._plebbit.updateInterval}ms`);
            this.emit("error", loadedSubIpfsOrError);
            return;
        }
        // Signature already has been validated
        if ((this.updatedAt || 0) < loadedSubIpfsOrError.updatedAt) {
            await this.initSubplebbitIpfsPropsNoMerge(loadedSubIpfsOrError);
            log(`Remote Subplebbit`, this.address, `received a new update. Will emit an update event with updatedAt`, loadedSubIpfsOrError.updatedAt, "that's", timestamp() - loadedSubIpfsOrError.updatedAt, "seconds old");
            this.emit("update", this);
        }
        else
            log.trace("Remote subplebbit loaded a SubplebbitIpfsType with no new information");
    }
    async update() {
        if (this.state !== "stopped")
            return; // No need to do anything if subplebbit is already updating
        const log = Logger("plebbit-js:remote-subplebbit:update");
        const updateLoop = (async () => {
            if (this.state === "updating")
                this.updateOnce()
                    .catch((e) => log.error(`Failed to update subplebbit ${this.address}`, e))
                    .finally(() => setTimeout(updateLoop, this._plebbit.updateInterval));
        }).bind(this);
        this._setState("updating");
        this.updateOnce()
            .catch((e) => log.error(`Failed to update subplebbit`, e))
            .finally(() => (this._updateTimeout = setTimeout(updateLoop, this._plebbit.updateInterval)));
    }
    async stop() {
        if (this.state !== "updating")
            throw Error("User call remoteSubplebbit.stop() without updating first");
        this._ipnsLoadingOperation?.stop();
        clearTimeout(this._updateTimeout);
        this._setUpdatingState("stopped");
        this._setState("stopped");
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