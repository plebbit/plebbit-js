import { doesDomainAddressHaveCapitalLetter, hideClassPrivateProps, isIpns, shortifyAddress } from "../util.js";
import { Plebbit } from "../plebbit.js";

import type { SubplebbitEvents } from "../types.js";
import Logger from "@plebbit/plebbit-logger";

import { TypedEmitter } from "tiny-typed-emitter";
import { FailedToFetchSubplebbitFromGatewaysError, PlebbitError } from "../plebbit-error.js";
import retry, { RetryOperation } from "retry";
import { SubplebbitClientsManager } from "../clients/client-manager.js";
import type {
    CreateRemoteSubplebbitOptions,
    SubplebbitIpfsType,
    SubplebbitStats,
    RpcRemoteSubplebbitType,
    SubplebbitJson,
    SubplebbitUpdatingState,
    SubplebbitState
} from "./types.js";
import * as remeda from "remeda";
import { PostsPages } from "../pages/pages.js";
import type { PostsPagesTypeIpfs } from "../pages/types.js";
import { parseRawPages } from "../pages/util.js";
import { SubplebbitIpfsSchema } from "./schema.js";

export class RemoteSubplebbit extends TypedEmitter<SubplebbitEvents> implements Omit<SubplebbitIpfsType, "posts"> {
    // public
    title?: SubplebbitIpfsType["title"];
    description?: SubplebbitIpfsType["description"];
    roles?: SubplebbitIpfsType["roles"];
    lastPostCid?: SubplebbitIpfsType["lastPostCid"];
    lastCommentCid?: SubplebbitIpfsType["lastCommentCid"];
    posts: PostsPages;
    pubsubTopic?: SubplebbitIpfsType["pubsubTopic"];
    stats?: SubplebbitStats;
    features?: SubplebbitIpfsType["features"];
    suggested?: SubplebbitIpfsType["suggested"];
    flairs?: SubplebbitIpfsType["flairs"];
    address!: SubplebbitIpfsType["address"];
    shortAddress!: string;
    statsCid!: SubplebbitIpfsType["statsCid"];
    createdAt!: SubplebbitIpfsType["createdAt"];
    updatedAt!: SubplebbitIpfsType["updatedAt"];
    encryption!: SubplebbitIpfsType["encryption"];
    protocolVersion!: SubplebbitIpfsType["protocolVersion"];
    signature!: SubplebbitIpfsType["signature"];
    rules?: SubplebbitIpfsType["rules"];
    challenges!: SubplebbitIpfsType["challenges"];
    postUpdates?: SubplebbitIpfsType["postUpdates"];

    // Only for Subplebbit instance
    state!: SubplebbitState;
    updatingState!: SubplebbitUpdatingState;
    clients: SubplebbitClientsManager["clients"];
    updateCid?: string;

    // should be used internally
    _plebbit: Plebbit;
    _ipnsLoadingOperation?: RetryOperation = undefined;
    _clientsManager: SubplebbitClientsManager;
    _rawSubplebbitIpfs?: SubplebbitIpfsType = undefined;

    // private
    protected _updateTimeout?: NodeJS.Timeout = undefined;

    constructor(plebbit: Plebbit) {
        super();
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

    async _updateLocalPostsInstance(
        newPosts: SubplebbitIpfsType["posts"] | SubplebbitJson["posts"] | Pick<NonNullable<SubplebbitIpfsType["posts"]>, "pageCids">
    ) {
        const log = Logger("plebbit-js:remote-subplebbit:_updateLocalPostsInstanceIfNeeded");
        if (!newPosts)
            // The sub has changed its address, need to reset the posts
            this.posts.resetPages();
        else if (!("pages" in newPosts)) {
            // only pageCids is provided
            this.posts.pageCids = newPosts.pageCids;
        } else {
            const shouldUpdatePosts = !remeda.isDeepEqual(this.posts.pageCids, newPosts.pageCids);

            if (shouldUpdatePosts) {
                log.trace(`Updating the props of subplebbit (${this.address}) posts`);
                const parsedPages = <Pick<PostsPages, "pages"> & { pagesIpfs: PostsPagesTypeIpfs | undefined }>parseRawPages(newPosts);
                this.posts.updateProps({
                    ...parsedPages,
                    plebbit: this._plebbit,
                    subplebbitAddress: this.address,
                    pageCids: newPosts?.pageCids || {}
                });
            }
        }
    }

    async initSubplebbitIpfsPropsNoMerge(newProps: SubplebbitIpfsType) {
        const log = Logger("plebbit-js:remote-subplebbit:initSubplebbitIpfsPropsNoMerge");
        this._rawSubplebbitIpfs = newProps;
        await this.initRemoteSubplebbitPropsNoMerge(newProps);
        const unknownProps = remeda.difference(remeda.keys.strict(this._rawSubplebbitIpfs), remeda.keys.strict(SubplebbitIpfsSchema.shape));
        if (unknownProps.length > 0) {
            log(`Found unknown props on subplebbit (${this._rawSubplebbitIpfs.address}) ipfs record`, unknownProps);
            Object.assign(this, remeda.pick(this._rawSubplebbitIpfs, unknownProps));
        }
    }

    async initRemoteSubplebbitPropsNoMerge(newProps: SubplebbitJson | CreateRemoteSubplebbitOptions) {
        // This function is not strict, and will assume all props can be undefined, except address
        this.title = newProps.title;
        this.description = newProps.description;
        this.lastPostCid = newProps.lastPostCid;
        this.lastCommentCid = newProps.lastCommentCid;
        this.setAddress(newProps.address);
        this.pubsubTopic = newProps.pubsubTopic;
        if (newProps.protocolVersion) this.protocolVersion = newProps.protocolVersion;

        this.roles = newProps.roles;
        this.features = newProps.features;
        this.suggested = newProps.suggested;
        this.rules = newProps.rules;
        this.flairs = newProps.flairs;
        this.postUpdates = newProps.postUpdates;
        if (Array.isArray(newProps.challenges)) this.challenges = newProps.challenges;
        if (newProps.statsCid) this.statsCid = newProps.statsCid;
        if (typeof newProps.createdAt === "number") this.createdAt = newProps.createdAt;
        if (typeof newProps.updatedAt === "number") this.updatedAt = newProps.updatedAt;
        if (newProps.encryption) this.encryption = newProps.encryption;
        if (newProps.signature) this.signature = newProps.signature;
        await this._updateLocalPostsInstance(newProps.posts);
        if ("updateCid" in newProps) this.updateCid = newProps.updateCid;
    }

    setAddress(newAddress: string) {
        // check if domain or ipns
        // else, throw an error
        if (doesDomainAddressHaveCapitalLetter(newAddress))
            throw new PlebbitError("ERR_DOMAIN_ADDRESS_HAS_CAPITAL_LETTER", { subplebbitAddress: newAddress });
        const isDomain = newAddress.includes(".");
        if (!isDomain && !isIpns(newAddress))
            throw new PlebbitError("ERR_INVALID_SUBPLEBBIT_ADDRESS", { subplebbitAddress: newAddress, isDomain, isIpns: false });

        this.address = newAddress;
        this.shortAddress = shortifyAddress(this.address);
        this.posts._subplebbitAddress = this.address;
    }

    protected _toJSONIpfsBaseNoPosts() {
        const subplebbitIpfsKeys = remeda.keys.strict(remeda.omit(SubplebbitIpfsSchema.shape, ["posts"]));
        return remeda.pick(this, subplebbitIpfsKeys);
    }

    toJSONIpfs(): SubplebbitIpfsType {
        if (!this._rawSubplebbitIpfs) throw Error("should not be calling toJSONIpfs() before defining _rawSubplebbitIpfs");
        return this._rawSubplebbitIpfs;
    }

    toJSONRpcRemote(): RpcRemoteSubplebbitType {
        if (!this.updateCid) throw Error("subplebbit.cid should be defined before calling toJSONRpcRemote");
        return {
            subplebbit: this.toJSONIpfs(),
            updateCid: this.updateCid
        };
    }

    protected _setState(newState: RemoteSubplebbit["state"]) {
        if (newState === this.state) return;
        this.state = newState;
        this.emit("statechange", this.state);
    }

    _setUpdatingState(newState: RemoteSubplebbit["updatingState"]) {
        if (newState === this.updatingState) return;
        this.updatingState = newState;
        this.emit("updatingstatechange", this.updatingState);
    }

    // Errors that retrying to load the ipns record will not help
    // Instead we should abort the retries, and emit an error to notify the user to do something about it
    private _isRetriableErrorWhenLoading(err: PlebbitError): boolean {
        if (!(err instanceof PlebbitError)) return false; // If it's not a recognizable error, then we throw to notify the user
        if (
            err.code === "ERR_SUBPLEBBIT_SIGNATURE_IS_INVALID" ||
            err.code === "ERR_INVALID_SUBPLEBBIT_IPFS_SCHEMA" ||
            err.code === "ERR_GATEWAY_RESPONDED_WITH_DIFFERENT_SUBPLEBBIT" ||
            err.code === "ERR_OVER_DOWNLOAD_LIMIT" ||
            err.code === "ERR_INVALID_JSON"
        )
            return false;

        if (err instanceof FailedToFetchSubplebbitFromGatewaysError) {
            // If all gateway errors are non retriable, then the error is non retriable
            for (const gatewayError of Object.values(err.details.gatewayToError))
                if (this._isRetriableErrorWhenLoading(gatewayError)) return true;
            return false; // if all gateways are non retriable, then we should not retry
        }
        return true;
    }

    private async _retryLoadingSubplebbitIpns(log: Logger, subplebbitIpnsAddress: string): Promise<SubplebbitIpfsType | PlebbitError> {
        return new Promise((resolve) => {
            this._ipnsLoadingOperation!.attempt(async (curAttempt) => {
                log.trace(`Retrying to load subplebbit ipns (${subplebbitIpnsAddress}) for the ${curAttempt}th time`);
                try {
                    const update = await this._clientsManager.fetchSubplebbit(subplebbitIpnsAddress);
                    this.updateCid = update.cid;
                    resolve(update.subplebbit);
                } catch (e) {
                    this._setUpdatingState("failed");
                    log.error(`Failed to load Subplebbit IPNS for the ${curAttempt}th attempt`, e);
                    if (e instanceof PlebbitError && !this._isRetriableErrorWhenLoading(e)) resolve(e);
                    else this._ipnsLoadingOperation!.retry(<Error>e);
                }
            });
        });
    }

    private async updateOnce() {
        const log = Logger("plebbit-js:remote-subplebbit:update");

        this._ipnsLoadingOperation = retry.operation({ forever: true, factor: 2 });

        const loadedSubIpfsOrError = await this._retryLoadingSubplebbitIpns(log, this.address);
        if (loadedSubIpfsOrError instanceof Error) {
            log.error(
                `Subplebbit ${this.address} encountered a non retriable error while updating, will emit an error event and abort the current update iteration`,
                `Will retry after ${this._plebbit.updateInterval}ms`
            );
            this.emit("error", <PlebbitError>loadedSubIpfsOrError);
            return;
        }
        // Signature already has been validated

        if ((this.updatedAt || 0) < loadedSubIpfsOrError.updatedAt) {
            await this.initSubplebbitIpfsPropsNoMerge(loadedSubIpfsOrError);
            log(`Remote Subplebbit received a new update. Will emit an update event`);
            this.emit("update", this);
        } else log.trace("Remote subplebbit received a SubplebbitIpfsType with no new information");
    }

    async update() {
        if (this.state !== "stopped") return; // No need to do anything if subplebbit is already updating

        const log = Logger("plebbit-js:remote-subplebbit:update");

        const updateLoop = (async () => {
            if (this.state === "updating")
                this.updateOnce()
                    .catch((e) => log.error(`Failed to update subplebbit`, e))
                    .finally(() => setTimeout(updateLoop, this._plebbit.updateInterval));
        }).bind(this);

        this._setState("updating");

        this.updateOnce()
            .catch((e) => log.error(`Failed to update subplebbit`, e))
            .finally(() => (this._updateTimeout = setTimeout(updateLoop, this._plebbit.updateInterval)));
    }

    async stop() {
        if (this.state !== "updating") throw Error("User call remoteSubplebbit.stop() without updating first");
        this._ipnsLoadingOperation?.stop();
        clearTimeout(this._updateTimeout);

        this._setUpdatingState("stopped");
        this._setState("stopped");
    }
}
