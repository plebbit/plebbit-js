import { doesDomainAddressHaveCapitalLetter, isIpns, shortifyAddress } from "../util.js";
import { Plebbit } from "../plebbit.js";

import type { SubplebbitEvents } from "../types.js";
import Logger from "@plebbit/plebbit-logger";

import { TypedEmitter } from "tiny-typed-emitter";
import { FailedToFetchSubplebbitFromGatewaysError, PlebbitError } from "../plebbit-error.js";
import retry, { RetryOperation } from "retry";
import { SubplebbitClientsManager } from "../clients/client-manager.js";
import type {
    CreateRemoteSubplebbitOptions,
    RemoteSubplebbitJsonType,
    SubplebbitEditOptions,
    SubplebbitIpfsType,
    SubplebbitStats
} from "./types.js";
import * as remeda from "remeda";
import { LocalSubplebbit } from "../runtime/node/subplebbit/local-subplebbit.js";
import { PostsPages } from "../pages/pages.js";
import type { PostsPagesTypeIpfs } from "../pages/types.js";
import { parseRawPages } from "../pages/util.js";

export class RemoteSubplebbit extends TypedEmitter<SubplebbitEvents> {
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
    shortAddress!: RemoteSubplebbitJsonType["shortAddress"];
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
    state!: "stopped" | "updating" | "started";
    updatingState!:
        | "stopped"
        | "resolving-address"
        | "fetching-ipns"
        | "fetching-ipfs"
        | "failed"
        | "succeeded"
        | LocalSubplebbit["startedState"];
    plebbit: Plebbit;
    clients: SubplebbitClientsManager["clients"];
    clientsManager: SubplebbitClientsManager;

    // should be used internally
    _ipnsLoadingOperation?: RetryOperation;

    // private
    protected _updateTimeout?: NodeJS.Timeout;

    constructor(plebbit: Plebbit) {
        super();
        this.plebbit = plebbit;
        this._setState("stopped");
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
            pageCids: {},
            pages: {},
            plebbit: this.plebbit,
            subplebbitAddress: this.address,
            pagesIpfs: undefined
        });
    }

    async _updateLocalPostsInstance(
        newPosts:
            | SubplebbitIpfsType["posts"]
            | RemoteSubplebbitJsonType["posts"]
            | Pick<NonNullable<SubplebbitIpfsType["posts"]>, "pageCids">
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
                const parsedPages = <Pick<PostsPages, "pages"> & { pagesIpfs: PostsPagesTypeIpfs | undefined }>(
                    await parseRawPages(newPosts, this.plebbit)
                );
                this.posts.updateProps({
                    ...parsedPages,
                    plebbit: this.plebbit,
                    subplebbitAddress: this.address,
                    pageCids: newPosts?.pageCids || {}
                });
            }
        }
    }

    async initRemoteSubplebbitPropsNoMerge(newProps: SubplebbitIpfsType | RemoteSubplebbitJsonType | CreateRemoteSubplebbitOptions) {
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
        // A potential issue here is that if SubplebbitIpfsType or RemoteSubplebbitJsonType had a required prop as undefined or null
        // The subplebbit instance will not update its prop accordingly because it checks if it's defined
        // The way to fix this is with zod I believe
        if (Array.isArray(newProps.challenges)) this.challenges = newProps.challenges;
        if (newProps.statsCid) this.statsCid = newProps.statsCid;
        if (typeof newProps.createdAt === "number") this.createdAt = newProps.createdAt;
        if (typeof newProps.updatedAt === "number") this.updatedAt = newProps.updatedAt;
        if (newProps.encryption) this.encryption = newProps.encryption;
        if (newProps.signature) this.signature = newProps.signature;
        await this._updateLocalPostsInstance(newProps.posts);
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

    toJSON(): RemoteSubplebbitJsonType {
        return {
            ...this._toJSONBase(),
            posts: this.posts.toJSON(),
            shortAddress: this.shortAddress
        };
    }

    protected _toJSONBase() {
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

    toJSONIpfs(): SubplebbitIpfsType {
        // TODO should verify all props of SubplebbitIpfsType is there
        return {
            ...this._toJSONBase(),
            posts: this.posts.toJSONIpfs()
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
                    const update = await this.clientsManager.fetchSubplebbit(subplebbitIpnsAddress);
                    resolve(update);
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
                `Will retry after ${this.plebbit.updateInterval}ms`
            );
            this.emit("error", <PlebbitError>loadedSubIpfsOrError);
            return;
        }
        // Signature already has been validated

        if ((this.updatedAt || 0) < loadedSubIpfsOrError.updatedAt) {
            await this.initRemoteSubplebbitPropsNoMerge(loadedSubIpfsOrError);
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
                    .finally(() => setTimeout(updateLoop, this.plebbit.updateInterval));
        }).bind(this);

        this._setState("updating");

        this.updateOnce()
            .catch((e) => log.error(`Failed to update subplebbit`, e))
            .finally(() => (this._updateTimeout = setTimeout(updateLoop, this.plebbit.updateInterval)));
    }

    async stop() {
        if (this.state !== "updating") throw Error("User call remoteSubplebbit.stop() without updating first");
        this._ipnsLoadingOperation?.stop();
        clearTimeout(this._updateTimeout);

        this._setUpdatingState("stopped");
        this._setState("stopped");
    }

    async edit(newSubplebbitOptions: SubplebbitEditOptions): Promise<this> {
        throw Error("Can't edit a remote subplebbit");
    }
    async start() {
        throw Error("A remote subplebbit can't be started");
    }

    async delete() {
        throw Error("A remote subplebbit can't be deleted");
    }
}
