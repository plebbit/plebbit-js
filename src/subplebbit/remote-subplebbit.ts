import { doesDomainAddressHaveCapitalLetter, isIpns, parseRawPages, shortifyAddress } from "../util.js";
import { PostsPages } from "../pages.js";
import { Plebbit } from "../plebbit.js";

import { PostsPagesTypeIpfs, ProtocolVersion, SubplebbitEvents } from "../types.js";
import Logger from "@plebbit/plebbit-logger";

import { JsonSignature } from "../signer/constants.js";
import { TypedEmitter } from "tiny-typed-emitter";
import { PlebbitError } from "../plebbit-error.js";
import retry, { RetryOperation } from "retry";
import { SubplebbitClientsManager } from "../clients/client-manager.js";
import type {
    CreateSubplebbitOptions,
    Flair,
    FlairOwner,
    RemoteSubplebbitJsonType,
    SubplebbitEditOptions,
    SubplebbitEncryption,
    SubplebbitFeatures,
    SubplebbitIpfsType,
    SubplebbitRole,
    SubplebbitStats,
    SubplebbitSuggested
} from "./types.js";
import * as remeda from "remeda";

export class RemoteSubplebbit extends TypedEmitter<SubplebbitEvents> {
    // public
    title?: string;
    description?: string;
    roles?: { [authorAddress: string]: SubplebbitRole };
    lastPostCid?: string;
    lastCommentCid?: string;
    posts: PostsPages;
    pubsubTopic?: string;
    stats?: SubplebbitStats;
    features?: SubplebbitFeatures;
    suggested?: SubplebbitSuggested;
    flairs?: Record<FlairOwner, Flair[]>;
    address!: string;
    shortAddress!: string;
    statsCid!: string;
    createdAt!: number;
    updatedAt!: number;
    encryption!: SubplebbitEncryption;
    protocolVersion!: ProtocolVersion; // semantic version of the protocol https://semver.org/
    signature!: JsonSignature; // signature of the Subplebbit update by the sub owner to protect against malicious gateway
    rules?: string[];
    challenges!: SubplebbitIpfsType["challenges"];
    postUpdates?: { [timestampRange: string]: string };

    // Only for Subplebbit instance
    state!: "stopped" | "updating" | "started";
    updatingState!: "stopped" | "resolving-address" | "fetching-ipns" | "fetching-ipfs" | "failed" | "succeeded";
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

    async _updateLocalPostsInstanceIfNeeded(newPosts: SubplebbitIpfsType["posts"] | RemoteSubplebbitJsonType["posts"]) {
        if (!newPosts) return;

        // need to also check if this.address differs from this.posts.subplebbitAddress
        // when this.posts.pageCids differs from mergedProps.posts.pageCids OR
        // when this.address !== this.posts.subplebbitAddress

        const shouldUpdatePosts = !remeda.isDeepEqual(this.posts.pageCids, newPosts.pageCids);

        if (shouldUpdatePosts) {
            const parsedPages = <Pick<PostsPages, "pages"> & { pagesIpfs: PostsPagesTypeIpfs | undefined }>(
                await parseRawPages(newPosts, this.plebbit)
            );
            this.posts.updateProps({
                ...parsedPages,
                plebbit: this.plebbit,
                subplebbitAddress: this.address,
                pageCids: newPosts.pageCids
            });
        }
    }

    async initRemoteSubplebbitPropsNoMerge(newProps: SubplebbitIpfsType | RemoteSubplebbitJsonType) {
        // for now it's copy pasted, TODO remove duplicate code
        this.title = newProps.title;
        this.description = newProps.description;
        this.lastPostCid = newProps.lastPostCid;
        this.lastCommentCid = newProps.lastCommentCid;
        this.setAddress(newProps.address);
        this.pubsubTopic = newProps.pubsubTopic;
        this.challenges = newProps.challenges;
        this.statsCid = newProps.statsCid;
        this.createdAt = newProps.createdAt;
        this.updatedAt = newProps.updatedAt;
        this.encryption = newProps.encryption;
        this.roles = newProps.roles;
        this.features = newProps.features;
        this.suggested = newProps.suggested;
        this.rules = newProps.rules;
        this.flairs = newProps.flairs;
        this.signature = newProps.signature;
        this.postUpdates = newProps.postUpdates;
        await this._updateLocalPostsInstanceIfNeeded(newProps.posts);
    }

    // we should remove this function over the long run
    async initRemoteSubplebbitPropsWithMerge(newProps: Partial<SubplebbitIpfsType | CreateSubplebbitOptions>) {
        const mergedProps = { ...this.toJSONIpfs(), ...newProps };
        this.title = mergedProps.title;
        this.description = mergedProps.description;
        this.lastPostCid = mergedProps.lastPostCid;
        this.lastCommentCid = mergedProps.lastCommentCid;
        this.setAddress(mergedProps.address);
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

        await this._updateLocalPostsInstanceIfNeeded(mergedProps.posts);
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
        if (this.address !== this.posts._subplebbitAddress) this.posts._subplebbitAddress = this.address;
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

    private _isCriticalErrorWhenLoading(err: PlebbitError) {
        return err.code === "ERR_SUBPLEBBIT_SIGNATURE_IS_INVALID";
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
                    if (e instanceof PlebbitError && this._isCriticalErrorWhenLoading(e)) resolve(e);
                    else this._ipnsLoadingOperation!.retry(<Error>e);
                }
            });
        });
    }

    private async updateOnce() {
        const log = Logger("plebbit-js:remote-subplebbit:update");

        this._ipnsLoadingOperation = retry.operation({ forever: true, factor: 2 });

        const loadedSubIpfs = await this._retryLoadingSubplebbitIpns(log, this.address);
        if (loadedSubIpfs instanceof Error) {
            this.emit("error", <PlebbitError>loadedSubIpfs);
            return;
        }
        // Signature already has been validated

        if ((this.updatedAt || 0) < loadedSubIpfs.updatedAt) {
            await this.initRemoteSubplebbitPropsNoMerge(loadedSubIpfs);
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
