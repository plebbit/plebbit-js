import {
    binaryKeyToPubsubTopic,
    doesDomainAddressHaveCapitalLetter,
    hideClassPrivateProps,
    isIpns,
    pubsubTopicToDhtKey,
    shortifyAddress,
    timestamp
} from "../util.js";
import { Plebbit } from "../plebbit/plebbit.js";

import type { SubplebbitEvents } from "../types.js";
import Logger from "@plebbit/plebbit-logger";

import { TypedEmitter } from "tiny-typed-emitter";
import { FailedToFetchSubplebbitFromGatewaysError, PlebbitError } from "../plebbit-error.js";
import type {
    CreateRemoteSubplebbitOptions,
    SubplebbitIpfsType,
    SubplebbitStats,
    RpcRemoteSubplebbitType,
    SubplebbitJson,
    SubplebbitUpdatingState,
    SubplebbitState,
    SubplebbitStartedState,
    SubplebbitSettings,
    RpcInternalSubplebbitRecordAfterFirstUpdateType,
    SubplebbitEditOptions
} from "./types.js";
import * as remeda from "remeda";
import { PostsPages } from "../pages/pages.js";
import type { PostsPagesTypeIpfs } from "../pages/types.js";
import { parseRawPages } from "../pages/util.js";
import { SubplebbitIpfsSchema } from "./schema.js";
import { SignerWithPublicKeyAddress } from "../signer/index.js";
import { SubplebbitClientsManager } from "./subplebbit-client-manager.js";
import { getPeerIdFromPublicKey } from "../signer/util.js";

export class RemoteSubplebbit extends TypedEmitter<SubplebbitEvents> implements Omit<Partial<SubplebbitIpfsType>, "posts"> {
    // public
    title?: SubplebbitIpfsType["title"];
    description?: SubplebbitIpfsType["description"];
    roles?: SubplebbitIpfsType["roles"];
    lastPostCid?: SubplebbitIpfsType["lastPostCid"];
    lastCommentCid?: SubplebbitIpfsType["lastCommentCid"];
    posts: PostsPages;
    pubsubTopic?: SubplebbitIpfsType["pubsubTopic"];
    features?: SubplebbitIpfsType["features"];
    suggested?: SubplebbitIpfsType["suggested"];
    flairs?: SubplebbitIpfsType["flairs"];
    address!: SubplebbitIpfsType["address"];
    shortAddress!: string;
    statsCid?: SubplebbitIpfsType["statsCid"];
    createdAt?: SubplebbitIpfsType["createdAt"];
    updatedAt?: SubplebbitIpfsType["updatedAt"];
    encryption?: SubplebbitIpfsType["encryption"];
    protocolVersion?: SubplebbitIpfsType["protocolVersion"];
    signature?: SubplebbitIpfsType["signature"];
    rules?: SubplebbitIpfsType["rules"];
    challenges?: SubplebbitIpfsType["challenges"];
    postUpdates?: SubplebbitIpfsType["postUpdates"];

    // to be overridden by local subplebbit classes
    startedState?: "stopped" | SubplebbitStartedState;
    started?: boolean;
    signer?: SignerWithPublicKeyAddress | RpcInternalSubplebbitRecordAfterFirstUpdateType["signer"];
    settings?: SubplebbitSettings;
    editable?: Pick<RemoteSubplebbit, keyof SubplebbitEditOptions>;

    // Only for Subplebbit instance, informational
    state!: SubplebbitState;
    updatingState!: SubplebbitUpdatingState;
    clients: SubplebbitClientsManager["clients"];
    updateCid?: string;
    ipnsName?: string;
    ipnsPubsubTopic?: string;
    ipnsPubsubTopicDhtKey?: string;

    // should be used internally
    _plebbit: Plebbit;
    _clientsManager: SubplebbitClientsManager;
    _rawSubplebbitIpfs?: SubplebbitIpfsType = undefined;
    _updatingSubInstanceWithListeners?: { subplebbit: RemoteSubplebbit } & Pick<
        SubplebbitEvents,
        "error" | "updatingstatechange" | "update"
    > = undefined; // The plebbit._updatingSubplebbits we're subscribed to

    constructor(plebbit: Plebbit) {
        super();
        this._plebbit = plebbit;
        this._setState("stopped");
        this._setUpdatingStateWithEventEmissionIfNewState("stopped");

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
            subplebbit: this
        });
        hideClassPrivateProps(this);
    }

    async _updateLocalPostsInstance(
        newPosts: SubplebbitIpfsType["posts"] | SubplebbitJson["posts"] | Pick<NonNullable<SubplebbitIpfsType["posts"]>, "pageCids">
    ) {
        const log = Logger("plebbit-js:remote-subplebbit:_updateLocalPostsInstanceIfNeeded");
        this.posts._subplebbit = this;
        if (!newPosts)
            // The sub has changed its address, need to reset the posts
            this.posts.resetPages();
        else if (!("pages" in newPosts) && newPosts.pageCids) {
            // only pageCids is provided
            this.posts.updateProps({
                pageCids: newPosts.pageCids,
                subplebbit: this,
                pages: {}
            });
        } else if (!newPosts.pageCids && "pages" in newPosts && newPosts.pages) {
            // was only provided with a single preloaded page, no page cids
            const parsedPages = parseRawPages(newPosts);
            this.posts.updateProps({
                ...parsedPages,
                subplebbit: this,
                pageCids: {}
            });
        } else if ("pages" in newPosts && newPosts.pages && "pageCids" in newPosts && newPosts.pageCids) {
            // both pageCids and pages are provided
            const shouldUpdatePosts = !remeda.isDeepEqual(this.posts.pageCids, newPosts.pageCids);

            if (shouldUpdatePosts) {
                log.trace(`Updating the props of subplebbit (${this.address}) posts`);
                const parsedPages = <Pick<PostsPages, "pages"> & { pagesIpfs: PostsPagesTypeIpfs | undefined }>parseRawPages(newPosts);
                this.posts.updateProps({
                    ...parsedPages,
                    subplebbit: this,
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
        if (newProps.updateCid) this.updateCid = newProps.updateCid;
    }

    setAddress(newAddress: string) {
        // check if domain or ipns
        // else, throw an error
        if (doesDomainAddressHaveCapitalLetter(newAddress))
            throw new PlebbitError("ERR_DOMAIN_ADDRESS_HAS_CAPITAL_LETTER", { subplebbitAddress: newAddress });
        const isDomain = newAddress.includes(".");
        if (!isDomain && !isIpns(newAddress))
            throw new PlebbitError("ERR_INVALID_SUBPLEBBIT_ADDRESS_SCHEMA", { subplebbitAddress: newAddress, isDomain, isIpns: false });

        this.address = newAddress;
        this.shortAddress = shortifyAddress(this.address);
        this.posts._subplebbit = this;
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
        if (!this.updateCid) throw Error("subplebbit.updateCid should be defined before calling toJSONRpcRemote");
        return {
            subplebbit: this.toJSONIpfs(),
            updateCid: this.updateCid
        };
    }

    _setState(newState: RemoteSubplebbit["state"]) {
        if (newState === this.state) return;
        this.state = newState;
        this.emit("statechange", this.state);
    }

    _setUpdatingStateNoEmission(newState: RemoteSubplebbit["updatingState"]) {
        if (newState === this.updatingState) return;
        this.updatingState = newState;
    }

    _setUpdatingStateWithEventEmissionIfNewState(newState: RemoteSubplebbit["updatingState"]) {
        if (newState === this.updatingState) return;
        this.updatingState = newState;
        this.emit("updatingstatechange", this.updatingState);
    }

    // Errors that retrying to load the ipns record will not help
    // Instead we should abort the retries, and emit an error event to notify the user to do something about it
    _isRetriableErrorWhenLoading(err: PlebbitError | Error): boolean {
        if (!(err instanceof PlebbitError)) return false; // If it's not a recognizable error, then we throw to notify the user
        if (
            err.code === "ERR_SUBPLEBBIT_SIGNATURE_IS_INVALID" ||
            err.code === "ERR_INVALID_SUBPLEBBIT_IPFS_SCHEMA" ||
            err.code === "ERR_THE_SUBPLEBBIT_IPNS_RECORD_POINTS_TO_DIFFERENT_ADDRESS_THAN_WE_EXPECTED" ||
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

    async _setSubplebbitIpfsPropsFromUpdatingSubplebbitsIfPossible() {
        const log = Logger("plebbit-js:comment:_setSubplebbitIpfsPropsFromUpdatingSubplebbitsIfPossible");
        const updatingSub = this._plebbit._updatingSubplebbits[this.address];
        if (updatingSub?._rawSubplebbitIpfs && (this.updatedAt || 0) < updatingSub._rawSubplebbitIpfs.updatedAt) {
            await this.initSubplebbitIpfsPropsNoMerge(updatingSub._rawSubplebbitIpfs);
            this.updateCid = updatingSub.updateCid;
            log.trace(
                `New Remote Subplebbit instance`,
                this.address,
                `will use SubplebbitIpfs from plebbit._updatingSubplebbits[${this.address}] with updatedAt`,
                this.updatedAt,
                "that's",
                timestamp() - this.updatedAt!,
                "seconds old"
            );
            this.emit("update", this);
        }
    }

    private async _initSubInstanceWithListeners() {
        if (!this._plebbit._updatingSubplebbits[this.address]) throw Error("should be defined at this stage");
        const log = Logger("plebbit-js:remote-subplebbit:update");
        const subInstance = this._plebbit._updatingSubplebbits[this.address];
        return <NonNullable<this["_updatingSubInstanceWithListeners"]>>{
            subplebbit: subInstance,
            update: async () => {
                await this.initSubplebbitIpfsPropsNoMerge(subInstance._rawSubplebbitIpfs!);
                this.updateCid = subInstance.updateCid;
                log(
                    `Remote Subplebbit instance`,
                    this.address,
                    `received update event from plebbit._updatingSubplebbits[${this.address}] with updatedAt`,
                    this.updatedAt,
                    "that's",
                    timestamp() - this.updatedAt!,
                    "seconds old"
                );
                this.emit("update", this);
            },
            error: async (error: PlebbitError) => {
                this.emit("error", error);
            },
            updatingstatechange: async (newUpdatingState) => {
                this._setUpdatingStateWithEventEmissionIfNewState(newUpdatingState);
            }
        };
    }

    private async fetchLatestSubOrSubscribeToEvent() {
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

            const updatingSubRemoveListenerListener = async (eventName: string, listener: Function) => {
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

        this._updatingSubInstanceWithListeners.subplebbit.on(
            "updatingstatechange",
            this._updatingSubInstanceWithListeners.updatingstatechange
        );
        this._updatingSubInstanceWithListeners.subplebbit.on("error", this._updatingSubInstanceWithListeners.error);

        const clientKeys = ["chainProviders", "kuboRpcClients", "pubsubKuboRpcClients", "ipfsGateways"] as const;
        for (const clientType of clientKeys)
            if (this.clients[clientType])
                for (const clientUrl of Object.keys(this.clients[clientType])) {
                    if ("state" in this.clients[clientType][clientUrl])
                        //@ts-expect-error
                        this.clients[clientType][clientUrl].mirror(
                            this._updatingSubInstanceWithListeners.subplebbit.clients[clientType][clientUrl]
                        );
                    else {
                        for (const clientUrlDeeper of Object.keys(this.clients[clientType][clientUrl])) {
                            this.clients[clientType][clientUrl][clientUrlDeeper].mirror(
                                //@ts-expect-error
                                this._updatingSubInstanceWithListeners.subplebbit.clients[clientType][clientUrl][clientUrlDeeper]
                            );
                        }
                    }
                }

        if (this._updatingSubInstanceWithListeners.subplebbit.state === "stopped") {
            this._updatingSubInstanceWithListeners.subplebbit._setState("updating");
            await this._updatingSubInstanceWithListeners.subplebbit._clientsManager.startUpdatingLoop();
        }
    }

    async update() {
        if (this.state !== "stopped") return; // No need to do anything if subplebbit is already updating

        const log = Logger("plebbit-js:remote-subplebbit:update");

        this._setState("updating");

        await this.fetchLatestSubOrSubscribeToEvent();
    }

    async stop() {
        if (this.state !== "updating") throw Error("User call remoteSubplebbit.stop() without updating first");

        this._setUpdatingStateWithEventEmissionIfNewState("stopped");
        this._setState("stopped");
        if (this._updatingSubInstanceWithListeners) {
            // this instance is subscribed to plebbit._updatingSubplebbit[address]
            // removing listeners should reset plebbit._updatingSubplebbit by itself when there are no subscribers
            this._updatingSubInstanceWithListeners.subplebbit.removeListener("update", this._updatingSubInstanceWithListeners.update);
            this._updatingSubInstanceWithListeners.subplebbit.removeListener(
                "updatingstatechange",
                this._updatingSubInstanceWithListeners.updatingstatechange
            );
            this._updatingSubInstanceWithListeners.subplebbit.removeListener("error", this._updatingSubInstanceWithListeners.error);

            const clientKeys = ["chainProviders", "pubsubKuboRpcClients", "kuboRpcClients", "ipfsGateways"] as const;

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
        } else {
            // this instance is plebbit._updatingSubplebbit[address] itself
            await this._clientsManager.stopUpdatingLoop();
            delete this._plebbit._updatingSubplebbits[this.address];
        }
        this.posts._stop();
    }

    // functions to be overridden in local subplebbit classes

    async edit(options: any): Promise<any> {
        throw Error("Can't edit a remote subplebbit");
    }

    async delete() {
        throw Error("Can't delete a remote subplebbit");
    }

    async start() {
        throw Error("Can't start a remote subplebbit");
    }
}
