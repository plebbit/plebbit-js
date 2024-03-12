import { doesDomainAddressHaveCapitalLetter, isIpns, parseRawPages, shortifyAddress } from "../util.js";
import { PostsPages } from "../pages.js";
import Logger from "@plebbit/plebbit-logger";
import { TypedEmitter } from "tiny-typed-emitter";
import { PlebbitError } from "../plebbit-error.js";
import retry from "retry";
import { SubplebbitClientsManager } from "../clients/client-manager.js";
export class RemoteSubplebbit extends TypedEmitter {
    constructor(plebbit) {
        super();
        this.plebbit = plebbit;
        this._setState("stopped");
        this._setStartedState("stopped");
        this._setUpdatingState("stopped");
        // these functions might get separated from their `this` when used
        this.start = this.start.bind(this);
        this.update = this.update.bind(this);
        this.stop = this.stop.bind(this);
        this.edit = this.edit.bind(this);
        this.on("error", (...args) => this.plebbit.emit("error", ...args));
        this.clientsManager = new SubplebbitClientsManager(this);
        this.clients = this.clientsManager.clients;
        this.posts = new PostsPages({
            pageCids: undefined,
            pages: undefined,
            plebbit: this.plebbit,
            subplebbitAddress: undefined,
            pagesIpfs: undefined
        });
    }
    async initRemoteSubplebbitProps(newProps) {
        const mergedProps = { ...this.toJSONIpfs(), ...newProps };
        this.title = mergedProps.title;
        this.description = mergedProps.description;
        this.lastPostCid = mergedProps.lastPostCid;
        this.lastCommentCid = mergedProps.lastCommentCid;
        this._setAddress(mergedProps.address);
        this.pubsubTopic = mergedProps.pubsubTopic;
        this.challenges = mergedProps.challenges;
        this.statsCid = mergedProps.statsCid;
        this.createdAt = mergedProps.createdAt;
        this.updatedAt = mergedProps.updatedAt;
        this.encryption = mergedProps.encryption;
        this.roles = mergedProps.roles;
        this.features = mergedProps.features;
        this.suggested = mergedProps.suggested;
        this.rules = mergedProps.rules;
        this.flairs = mergedProps.flairs;
        this.signature = mergedProps.signature;
        this.postUpdates = mergedProps.postUpdates;
        if (mergedProps.posts) {
            const parsedPages = await parseRawPages(mergedProps.posts, this.plebbit);
            this.posts.updateProps({
                ...parsedPages,
                plebbit: this.plebbit,
                subplebbitAddress: this.address,
                pageCids: mergedProps.posts.pageCids
            });
        }
        else
            this.posts.updateProps({
                plebbit: this.plebbit,
                subplebbitAddress: this.address,
                pageCids: undefined,
                pages: undefined,
                pagesIpfs: undefined
            });
    }
    _setAddress(newAddress) {
        // check if domain or ipns
        // else, throw an error
        if (doesDomainAddressHaveCapitalLetter(newAddress))
            throw new PlebbitError("ERR_DOMAIN_ADDRESS_HAS_CAPITAL_LETTER", { subplebbitAddress: newAddress });
        const isDomain = newAddress.includes(".");
        if (!isDomain && !isIpns(newAddress))
            throw new PlebbitError("ERR_INVALID_SUBPLEBBIT_ADDRESS", { subplebbitAddress: newAddress, isDomain, isIpns: false });
        this.address = newAddress;
        this.shortAddress = shortifyAddress(this.address);
    }
    toJSON() {
        return {
            ...this._toJSONBase(),
            posts: this.posts?.toJSON(),
            shortAddress: this.shortAddress
        };
    }
    _toJSONBase() {
        return {
            title: this.title,
            description: this.description,
            lastPostCid: this.lastPostCid,
            lastCommentCid: this.lastCommentCid,
            pubsubTopic: this.pubsubTopic,
            address: this.address,
            challenges: this.challenges,
            statsCid: this.statsCid,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            encryption: this.encryption,
            roles: this.roles,
            protocolVersion: this.protocolVersion,
            signature: this.signature,
            features: this.features,
            suggested: this.suggested,
            rules: this.rules,
            flairs: this.flairs,
            postUpdates: this.postUpdates
        };
    }
    toJSONIpfs() {
        return {
            ...this._toJSONBase(),
            posts: this.posts?.toJSONIpfs()
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
    _setStartedState(newState) {
        if (newState === this.startedState)
            return;
        this.startedState = newState;
        this.emit("startedstatechange", this.startedState);
    }
    _isCriticalErrorWhenLoading(err) {
        return err.code === "ERR_SUBPLEBBIT_SIGNATURE_IS_INVALID";
    }
    async _retryLoadingSubplebbitIpns(log, subplebbitIpnsAddress) {
        return new Promise((resolve) => {
            this._ipnsLoadingOperation.attempt(async (curAttempt) => {
                log.trace(`Retrying to load subplebbit ipns (${subplebbitIpnsAddress}) for the ${curAttempt}th time`);
                try {
                    const update = await this.clientsManager.fetchSubplebbit(subplebbitIpnsAddress);
                    resolve(update);
                }
                catch (e) {
                    this._setUpdatingState("failed");
                    log.error(`Failed to load Subplebbit IPNS for the ${curAttempt}th attempt`, e.toString());
                    if (this._isCriticalErrorWhenLoading(e))
                        return e;
                    else
                        this._ipnsLoadingOperation.retry(e);
                }
            });
        });
    }
    async updateOnce() {
        const log = Logger("plebbit-js:remote-subplebbit:update");
        this._ipnsLoadingOperation = retry.operation({ forever: true, factor: 2 });
        const loadedSubIpfs = await this._retryLoadingSubplebbitIpns(log, this.address);
        if (loadedSubIpfs instanceof Error) {
            this.emit("error", loadedSubIpfs);
            return;
        }
        // Signature already has been validated
        if ((this.updatedAt || 0) < loadedSubIpfs.updatedAt) {
            await this.initRemoteSubplebbitProps(loadedSubIpfs);
            log(`Remote Subplebbit received a new update. Will emit an update event`);
            this.emit("update", this);
        }
        else
            log.trace("Remote subplebbit received a SubplebbitIpfsType with no new information");
    }
    async update() {
        if (this.state !== "stopped")
            return; // No need to do anything if subplebbit is already updating
        const log = Logger("plebbit-js:remote-subplebbit:update");
        const updateLoop = (async () => {
            if (this.state === "updating")
                this.updateOnce()
                    .catch((e) => log.error(`Failed to update subplebbit`, e))
                    .finally(() => setTimeout(updateLoop, this.plebbit.updateInterval));
        }).bind(this);
        this._setState("updating");
        this.updateOnce()
            .catch((e) => log.error(`Failed to update subplebbit`, e))
            .finally(() => (this._updateTimeout = setTimeout(updateLoop, this.plebbit.updateInterval)));
    }
    async stop() {
        this._ipnsLoadingOperation?.stop();
        clearTimeout(this._updateTimeout);
        this._setUpdatingState("stopped");
        this._setState("stopped");
    }
    async edit(newSubplebbitOptions) {
        throw Error("Can't edit a remote subplebbit");
    }
    async start() {
        throw Error("A remote subplebbit can't be started");
    }
    async delete() {
        throw Error("A remote subplebbit can't be deleted");
    }
}
//# sourceMappingURL=remote-subplebbit.js.map