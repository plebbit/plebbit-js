import { ChallengeAnswerMessage, ChallengeMessage, ChallengeRequestMessage, ChallengeVerificationMessage } from "../challenge";
import { SortHandler } from "./sort-handler";
import {
    parseRawPages,
    removeKeysWithUndefinedValues,
    shortifyAddress,
    throwWithErrorCode,
    timestamp,
    getErrorCodeFromMessage,
    doesEnsAddressHaveCapitalLetter,
    decodePubsubMsgFromRpc
} from "../util";
import { Signer, decryptEd25519AesGcmPublicKeyBuffer } from "../signer";
import { PostsPages } from "../pages";
import { Plebbit } from "../plebbit";
import { stringify as deterministicStringify } from "safe-stable-stringify";
import Hash from "ipfs-only-hash";

import {
    ChallengeAnswerMessageType,
    ChallengeMessageType,
    ChallengeRequestMessageType,
    ChallengeType,
    ChallengeVerificationMessageType,
    CommentEditPubsubMessage,
    CommentIpfsWithCid,
    CommentsTableRow,
    CommentType,
    CommentUpdate,
    CommentWithCommentUpdate,
    DbHandlerPublicAPI,
    DecryptedChallengeAnswerMessageType,
    DecryptedChallengeRequestMessageType,
    ProtocolVersion,
    VoteType,
    SubplebbitEvents,
    VotePubsubMessage,
    DecryptedChallengeMessageType,
    DecryptedChallengeRequest,
    DecryptedChallengeAnswer,
    DecryptedChallenge,
    DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor,
    DecryptedChallengeVerificationMessageTypeWithSubplebbitAuthor
} from "../types";
import { getIpfsKeyFromPrivateKey, getPlebbitAddressFromPrivateKey, getPublicKeyFromPrivateKey } from "../signer/util";
import { AUTHOR_EDIT_FIELDS, MOD_EDIT_FIELDS } from "../comment-edit";
import { messages } from "../errors";
import Logger from "@plebbit/plebbit-logger";
import { getThumbnailUrlOfLink, nativeFunctions } from "../runtime/node/util";
import env from "../version";
import lodash from "lodash";
import {
    ValidationResult,
    signChallengeMessage,
    signChallengeVerification,
    signCommentUpdate,
    signSubplebbit,
    verifyChallengeAnswer,
    verifyChallengeRequest,
    verifyComment,
    verifyCommentEdit,
    verifyCommentUpdate,
    verifySubplebbit,
    verifyVote
} from "../signer/signatures";
import { CACHE_KEYS, subplebbitForPublishingCache } from "../constants";
import assert from "assert";
import version from "../version";
import { JsonSignature, SignerType } from "../signer/constants";
import { TypedEmitter } from "tiny-typed-emitter";
import { PlebbitError } from "../plebbit-error";
import retry, { RetryOperation } from "retry";
import Author from "../author";
import { SubplebbitClientsManager } from "../clients/client-manager";
import * as cborg from "cborg";
import { MessageHandlerFn } from "ipfs-http-client/types/src/pubsub/subscription-tracker";
import { encryptEd25519AesGcmPublicKeyBuffer } from "../signer/encryption";
import {
    Challenge,
    Flair,
    FlairOwner,
    InternalSubplebbitRpcType,
    InternalSubplebbitType,
    SubplebbitEditOptions,
    SubplebbitEncryption,
    SubplebbitFeatures,
    SubplebbitIpfsType,
    SubplebbitRole,
    SubplebbitSettings,
    SubplebbitStats,
    SubplebbitSuggested,
    SubplebbitType
} from "./types";
import { GetChallengeAnswers, getChallengeVerification } from "../challenges";
import { sha256 } from "js-sha256";
import LRUCache from "lru-cache";

export class Subplebbit extends TypedEmitter<SubplebbitEvents> implements Omit<SubplebbitType, "posts"> {
    // public
    title?: string;
    description?: string;
    roles?: { [authorAddress: string]: SubplebbitRole };
    lastPostCid?: string;
    posts: PostsPages;
    pubsubTopic?: string;
    stats?: SubplebbitStats;
    features?: SubplebbitFeatures;
    suggested?: SubplebbitSuggested;
    flairs?: Record<FlairOwner, Flair[]>;
    address: string;
    shortAddress: string;
    statsCid?: string;
    createdAt: number;
    updatedAt: number;
    signer?: Signer;
    encryption: SubplebbitEncryption;
    protocolVersion: ProtocolVersion; // semantic version of the protocol https://semver.org/
    signature: JsonSignature; // signature of the Subplebbit update by the sub owner to protect against malicious gateway
    rules?: string[];
    settings?: SubplebbitSettings;
    _rawSubplebbitType?: SubplebbitIpfsType;
    challenges?: SubplebbitType["challenges"];

    // Only for Subplebbit instance
    state: "stopped" | "updating" | "started";
    startedState: "stopped" | "publishing-ipns" | "failed" | "succeeded";
    updatingState: "stopped" | "resolving-address" | "fetching-ipns" | "fetching-ipfs" | "failed" | "succeeded";
    plebbit: Plebbit;
    dbHandler?: DbHandlerPublicAPI;
    clients: SubplebbitClientsManager["clients"];

    // private

    private sortHandler: SortHandler;
    private _updateTimeout?: NodeJS.Timeout;
    private _syncInterval?: any; // TODO change "sync" to "publish"
    private _sync: boolean;
    private _ipfsNodeIpnsKeyNames: string[];
    private _subplebbitUpdateTrigger: boolean;
    private _loadingOperation: RetryOperation;
    private _commentUpdateIpnsLifetimeSeconds: number;
    _clientsManager: SubplebbitClientsManager;
    private _updateRpcSubscriptionId?: number;
    private _startRpcSubscriptionId?: number;
    private _isUpdating: boolean;

    // These caches below will be used to facilitate challenges exchange with authors, they will expire after 10 minutes
    // Most of the time they will be delete and cleaned up automatically
    private _challengeAnswerPromises = new LRUCache<string, Promise<string[]>>({
        max: 1000,
        ttl: 600000
    });
    private _challengeAnswerResolveReject = new LRUCache<string, { resolve: (answers: string[]) => void; reject: (error: Error) => void }>({
        max: 1000,
        ttl: 600000
    });
    private _ongoingChallengeExchanges = new LRUCache<string, boolean>({
        max: 1000,
        ttl: 600000
    }); // Will be a list of challenge request ids

    constructor(plebbit: Plebbit) {
        super();
        this.plebbit = plebbit;
        this._setState("stopped");
        this._setStartedState("stopped");
        this._setUpdatingState("stopped");
        this._sync = this._isUpdating = false;
        this._commentUpdateIpnsLifetimeSeconds = 8640000; // 100 days, arbitrary number

        // these functions might get separated from their `this` when used
        this.start = this.start.bind(this);
        this.update = this.update.bind(this);
        this.stop = this.stop.bind(this);
        this.edit = this.edit.bind(this);
        this.handleChallengeExchange = this.handleChallengeExchange.bind(this);

        this.on("error", (...args) => this.plebbit.emit("error", ...args));

        this._clientsManager = new SubplebbitClientsManager(this);
        this.clients = this._clientsManager.clients;

        this.posts = new PostsPages({
            pageCids: undefined,
            pages: undefined,
            plebbit: this.plebbit,
            subplebbitAddress: undefined,
            pagesIpfs: undefined
        });
    }

    async initSubplebbit(newProps: InternalSubplebbitType | SubplebbitEditOptions | SubplebbitIpfsType) {
        const oldProps = this.toJSONInternal();
        const mergedProps = { ...oldProps, ...newProps };
        this.title = mergedProps.title;
        this.description = mergedProps.description;
        this.lastPostCid = mergedProps.lastPostCid;
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
        this.settings = mergedProps.settings;
        this._subplebbitUpdateTrigger = mergedProps._subplebbitUpdateTrigger;
        if (!this.signer && mergedProps.signer) this.signer = new Signer(mergedProps.signer);

        if (newProps["posts"]) {
            const parsedPages = await parseRawPages(newProps["posts"], this.plebbit);
            this.posts.updateProps({
                ...parsedPages,
                plebbit: this.plebbit,
                subplebbitAddress: this.address,
                pageCids: mergedProps.posts.pageCids
            });
        } else
            this.posts.updateProps({
                plebbit: this.plebbit,
                subplebbitAddress: this.address,
                pageCids: undefined,
                pages: undefined,
                pagesIpfs: undefined
            });
    }

    private setAddress(newAddress: string) {
        if (doesEnsAddressHaveCapitalLetter(newAddress))
            throw new PlebbitError("ERR_ENS_ADDRESS_HAS_CAPITAL_LETTER", { subplebbitAddress: newAddress });

        this.address = newAddress;
        this.shortAddress = shortifyAddress(this.address);
    }

    private async _initSignerProps() {
        if (!this.signer?.ipfsKey?.byteLength || this.signer?.ipfsKey?.byteLength <= 0)
            this.signer.ipfsKey = new Uint8Array(await getIpfsKeyFromPrivateKey(this.signer.privateKey));
        if (!this.signer.ipnsKeyName) this.signer.ipnsKeyName = this.signer.address;
        if (!this.signer.publicKey) this.signer.publicKey = await getPublicKeyFromPrivateKey(this.signer.privateKey);
        if (!this.signer.address) this.signer.address = await getPlebbitAddressFromPrivateKey(this.signer.privateKey);

        this.encryption = {
            type: "ed25519-aes-gcm",
            publicKey: this.signer.publicKey
        };
    }

    private async initDbHandlerIfNeeded() {
        if (!this.dbHandler) {
            this.dbHandler = nativeFunctions.createDbHandler({
                address: this.address,
                plebbit: {
                    dataPath: this.plebbit.dataPath,
                    noData: this.plebbit.noData
                }
            });
            await this.dbHandler.initDbConfigIfNeeded();
            this.sortHandler = new SortHandler(lodash.pick(this, ["address", "plebbit", "dbHandler", "encryption", "_clientsManager"]));
        }
    }

    toJSONInternal(): InternalSubplebbitType {
        return {
            ...lodash.omit(this.toJSON(), ["shortAddress"]),
            posts: this.posts?.toJSONIpfs(),
            signer: this.signer ? lodash.pick(this.signer, ["privateKey", "type", "address"]) : undefined,
            _subplebbitUpdateTrigger: this._subplebbitUpdateTrigger,
            settings: this.settings
        };
    }

    toJSONInternalRpc(): InternalSubplebbitRpcType {
        return {
            ...lodash.omit(this.toJSONInternal(), ["signer", "_subplebbitUpdateTrigger"])
        };
    }

    toJSON(): SubplebbitType {
        return {
            ...this._toJSONBase(),
            posts: this.posts?.toJSON(),
            shortAddress: this.shortAddress
        };
    }

    private _toJSONBase() {
        return {
            title: this.title,
            description: this.description,
            lastPostCid: this.lastPostCid,
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
            flairs: this.flairs
        };
    }

    toJSONIpfs(): SubplebbitIpfsType {
        return {
            ...this._toJSONBase(),
            posts: this.posts?.toJSONIpfs()
        };
    }

    private async _importSignerIntoIpfsIfNeeded(signer: Required<Pick<SignerType, "ipnsKeyName" | "privateKey">>) {
        assert(signer.ipnsKeyName);
        if (!this._ipfsNodeIpnsKeyNames)
            this._ipfsNodeIpnsKeyNames = (await this._clientsManager.getDefaultIpfs()._client.key.list()).map((key) => key.name);

        const keyExistsInNode = this._ipfsNodeIpnsKeyNames.some((key) => key === signer.ipnsKeyName);
        if (!keyExistsInNode) {
            const ipfsKey = new Uint8Array(await getIpfsKeyFromPrivateKey(signer.privateKey));
            await nativeFunctions.importSignerIntoIpfsNode(signer.ipnsKeyName, ipfsKey, this.plebbit);
            this._ipfsNodeIpnsKeyNames.push(signer.ipnsKeyName);
        }
    }

    // TODO rename and make this private
    async prePublish() {
        const log = Logger("plebbit-js:subplebbit:prePublish");

        await this.initDbHandlerIfNeeded();
        await this.dbHandler.lockSubCreation();
        await this.dbHandler.initDbIfNeeded();

        if (await this.dbHandler.keyvHas(CACHE_KEYS[CACHE_KEYS.INTERNAL_SUBPLEBBIT])) {
            log(`Merging internal subplebbit state from DB and createSubplebbitOptions`);
            await this._mergeInstanceStateWithDbState({});
        }

        if (!this.signer) throwWithErrorCode("ERR_LOCAL_SUB_HAS_NO_SIGNER_IN_INTERNAL_STATE", { address: this.address });
        await this._initSignerProps();

        if (!(await this.dbHandler.keyvHas(CACHE_KEYS[CACHE_KEYS.INTERNAL_SUBPLEBBIT]))) {
            log(`Updating the internal state of subplebbit in DB with createSubplebbitOptions`);
            await this._updateDbInternalState(this.toJSONInternal());
        }

        await this.dbHandler.unlockSubCreation();
        await this.dbHandler.destoryConnection(); // Need to destory connection so process wouldn't hang
    }

    private async assertDomainResolvesCorrectly(domain: string) {
        if (this.plebbit.resolver.isDomain(domain)) {
            const resolvedAddress = await this._clientsManager.resolveSubplebbitAddressIfNeeded(domain);
            if (resolvedAddress !== this.signer.address)
                throwWithErrorCode("ERR_ENS_SUB_ADDRESS_TXT_RECORD_POINT_TO_DIFFERENT_ADDRESS", {
                    subplebbitAddress: this.address,
                    resolvedAddress,
                    signerAddress: this.signer.address
                });
        }
    }

    async edit(newSubplebbitOptions: SubplebbitEditOptions): Promise<Subplebbit> {
        const log = Logger("plebbit-js:subplebbit:edit");

        if (this.plebbit.plebbitRpcClient) {
            const newProps = await this.plebbit.plebbitRpcClient.editSubplebbit(this.address, newSubplebbitOptions);
            await this.initSubplebbit(newProps);
            return this;
        }

        await this.dbHandler.initDestroyedConnection();
        if (newSubplebbitOptions.address && newSubplebbitOptions.address !== this.address) {
            if (doesEnsAddressHaveCapitalLetter(newSubplebbitOptions.address))
                throw new PlebbitError("ERR_ENS_ADDRESS_HAS_CAPITAL_LETTER", { subplebbitAddress: newSubplebbitOptions.address });
            this.assertDomainResolvesCorrectly(newSubplebbitOptions.address).catch((err: PlebbitError) => {
                log.error(err.toString());
                this.emit("error", err);
            });
            log(`Attempting to edit subplebbit.address from ${this.address} to ${newSubplebbitOptions.address}`);
            await this._updateDbInternalState(lodash.pick(newSubplebbitOptions, "address"));
            await this.dbHandler.changeDbFilename(newSubplebbitOptions.address, {
                address: newSubplebbitOptions.address,
                plebbit: {
                    dataPath: this.plebbit.dataPath,
                    noData: this.plebbit.noData
                }
            });
            await this._switchDbIfNeeded();
        }

        const newSubProps = {
            ...lodash.omit(newSubplebbitOptions, "address"),
            _subplebbitUpdateTrigger: true
        };
        await this._updateDbInternalState(newSubProps);
        await this.initSubplebbit(newSubProps);

        log(`Subplebbit (${this.address}) props (${Object.keys(newSubplebbitOptions)}) has been edited`);

        if (!this._sync) await this.dbHandler.destoryConnection(); // Need to destory connection so process wouldn't hang

        return this;
    }

    _setState(newState: Subplebbit["state"]) {
        if (newState === this.state) return;
        this.state = newState;
        this.emit("statechange", this.state);
    }

    _setUpdatingState(newState: Subplebbit["updatingState"]) {
        if (newState === this.updatingState) return;
        this.updatingState = newState;
        this.emit("updatingstatechange", this.updatingState);
    }

    _setStartedState(newState: Subplebbit["startedState"]) {
        if (newState === this.startedState) return;
        this.startedState = newState;
        this.emit("startedstatechange", this.startedState);
    }
    _setRpcClientState(newState: Subplebbit["clients"]["plebbitRpcClients"][""]["state"]) {
        const currentRpcUrl = Object.keys(this.clients.plebbitRpcClients)[0];
        if (newState === this.clients.plebbitRpcClients[currentRpcUrl].state) return;
        this.clients.plebbitRpcClients[currentRpcUrl].state = newState;
        this.clients.plebbitRpcClients[currentRpcUrl].emit("statechange", newState);
    }

    private _updateRpcClientStateFromStartedState(startedState: Subplebbit["startedState"]) {
        const mapper: Record<Subplebbit["startedState"], Subplebbit["clients"]["plebbitRpcClients"][0]["state"][]> = {
            failed: ["stopped"],
            "publishing-ipns": ["publishing-ipns"],
            stopped: ["stopped"],
            succeeded: ["stopped"]
        };

        mapper[startedState].forEach(this._setRpcClientState.bind(this));
    }

    private _updateRpcClientStateFromUpdatingState(updatingState: Subplebbit["updatingState"]) {
        // We're deriving the the rpc state from updating state

        const mapper: Record<Subplebbit["updatingState"], Subplebbit["clients"]["plebbitRpcClients"][0]["state"][]> = {
            failed: ["stopped"],
            "fetching-ipfs": ["fetching-ipfs"],
            "fetching-ipns": ["fetching-ipns"],
            "resolving-address": ["resolving-subplebbit-address"],
            stopped: ["stopped"],
            succeeded: ["stopped"]
        };

        mapper[updatingState].forEach(this._setRpcClientState.bind(this));
    }

    private async _retryLoadingSubplebbitIpns(log: Logger, subplebbitIpnsAddress: string): Promise<SubplebbitIpfsType> {
        return new Promise((resolve) => {
            this._loadingOperation.attempt(async (curAttempt) => {
                log.trace(`Retrying to load subplebbit ipns (${subplebbitIpnsAddress}) for the ${curAttempt}th time`);
                try {
                    const update = await this._clientsManager.fetchSubplebbit(subplebbitIpnsAddress);
                    resolve(update);
                } catch (e) {
                    this._setUpdatingState("failed");
                    log.error(String(e));
                    this.emit("error", e);
                    this._loadingOperation.retry(e);
                }
            });
        });
    }

    private async updateOnce() {
        const log = Logger("plebbit-js:subplebbit:update");

        if (this.dbHandler) {
            // Local sub
            const subState = await this._getDbInternalState(false);

            if (deterministicStringify(this.toJSONInternal()) !== deterministicStringify(subState)) {
                log(`Local Subplebbit received a new update. Will emit an update event`);
                this._setUpdatingState("succeeded");
                await this.initSubplebbit(subState);
                this._rawSubplebbitType = this.toJSONIpfs();
                this.emit("update", this);
                subplebbitForPublishingCache.set(subState.address, lodash.pick(subState, ["encryption", "address", "pubsubTopic"]));
            }
        } else {
            let ipnsAddress: string;
            if (this.address.includes(".")) {
                // It's a domain
                this._setUpdatingState("resolving-address");
                ipnsAddress = await this._clientsManager.resolveSubplebbitAddressIfNeeded(this.address);
                // if ipnsAddress is undefined that means ENS record has no subplebbit-address text record
                if (!ipnsAddress) {
                    this._setUpdatingState("failed");
                    const error = new PlebbitError("ERR_ENS_TXT_RECORD_NOT_FOUND", {
                        subplebbitAddress: this.address,
                        textRecord: "subplebbit-address"
                    });
                    log.error(String(error));
                    this.emit("error", error);
                    return;
                }
            } else ipnsAddress = this.address;

            this._loadingOperation = retry.operation({ forever: true, factor: 2 });

            this._rawSubplebbitType = await this._retryLoadingSubplebbitIpns(log, ipnsAddress);

            if ((this.updatedAt || 0) < this._rawSubplebbitType.updatedAt) {
                const updateValidity = await verifySubplebbit(
                    this._rawSubplebbitType,
                    this.plebbit.resolveAuthorAddresses,
                    this._clientsManager,
                    true
                );
                if (!updateValidity.valid) {
                    this._setUpdatingState("failed");
                    const error = new PlebbitError("ERR_SIGNATURE_IS_INVALID", {
                        signatureValidity: updateValidity,
                        subplebbitIpns: this._rawSubplebbitType
                    });
                    this.emit("error", error);
                    return;
                }
                await this.initSubplebbit(this._rawSubplebbitType);
                this._setUpdatingState("succeeded");
                log(`Remote Subplebbit received a new update. Will emit an update event`);
                this.emit("update", this);
                subplebbitForPublishingCache.set(
                    this._rawSubplebbitType.address,
                    lodash.pick(this._rawSubplebbitType, ["encryption", "address", "pubsubTopic"])
                );
            } else {
                log.trace("Remote subplebbit received a SubplebbitIpfsType with no new information");
                this._setUpdatingState("succeeded");
            }
        }
    }

    async update() {
        if (this._isUpdating || this._sync || this._updateRpcSubscriptionId || this._startRpcSubscriptionId) return; // No need to do anything if subplebbit is already updating

        const log = Logger("plebbit-js:subplebbit:update");
        if (this.plebbit.plebbitRpcClient) {
            try {
                this._updateRpcSubscriptionId = await this.plebbit.plebbitRpcClient.subplebbitUpdate(this.address);
                this._setState("updating");
            } catch (e) {
                log.error("Failed to receive subplebbitUpdate from RPC due to error", e);
                this._setState("stopped");
                this._setUpdatingState("failed");
                throw e;
            }
            this.plebbit.plebbitRpcClient
                .getSubscription(this._updateRpcSubscriptionId)
                .on("update", async (updateProps) => {
                    log(`Received new subplebbitUpdate from RPC (${this.plebbit.plebbitRpcClientsOptions[0]})`);
                    this._rawSubplebbitType = updateProps.params.result;
                    await this.initSubplebbit(this._rawSubplebbitType);
                    this.emit("update", this);
                })
                .on("updatingstatechange", (args) => {
                    const newUpdatingState: Subplebbit["updatingState"] = args.params.result;
                    this._setUpdatingState(newUpdatingState);
                    this._updateRpcClientStateFromUpdatingState(newUpdatingState);
                })
                .on("error", (args) => this.emit("error", args.params.result));

            this.plebbit.plebbitRpcClient.emitAllPendingMessages(this._updateRpcSubscriptionId);
            return;
        }

        const updateLoop = (async () => {
            if (this._isUpdating)
                this.updateOnce()
                    .catch((e) => log.error(`Failed to update subplebbit`, e))
                    .finally(() => setTimeout(updateLoop, this.plebbit.updateInterval));
        }).bind(this);

        this._isUpdating = true;

        this.updateOnce()
            .catch((e) => log.error(`Failed to update subplebbit`, e))
            .finally(() => (this._updateTimeout = setTimeout(updateLoop, this.plebbit.updateInterval)));
    }

    private pubsubTopicWithfallback() {
        return this.pubsubTopic || this.address;
    }

    async stop() {
        const log = Logger("plebbit-js:subplebbit:stop");
        this._loadingOperation?.stop();
        clearTimeout(this._updateTimeout);
        this._updateTimeout = undefined;
        this._isUpdating = false;
        if (this.plebbit.plebbitRpcClient && this._updateRpcSubscriptionId) {
            // We're updating a remote sub here
            await this.plebbit.plebbitRpcClient.unsubscribe(this._updateRpcSubscriptionId);
            this._setRpcClientState("stopped");
            this._updateRpcSubscriptionId = undefined;
            log.trace(`Stopped the update of remote subplebbit (${this.address}) via RPC`);
        } else if (this.plebbit.plebbitRpcClient && this._startRpcSubscriptionId) {
            // Subplebbit is running over RPC
            await this.plebbit.plebbitRpcClient.stopSubplebbit(this.address);
            await this.plebbit.plebbitRpcClient.unsubscribe(this._startRpcSubscriptionId);
            this._setStartedState("stopped");
            this._setRpcClientState("stopped");
            this._startRpcSubscriptionId = undefined;
            log(`Stopped the running of local subplebbit (${this.address}) via RPC`);
        } else if (this._sync) {
            // Subplebbit is running locally
            await this._clientsManager
                .getDefaultPubsub()
                ._client.pubsub.unsubscribe(this.pubsubTopicWithfallback(), this.handleChallengeExchange);
            await this.dbHandler.rollbackAllTransactions();
            await this.dbHandler.unlockSubStart();
            this._sync = false;
            this._syncInterval = clearInterval(this._syncInterval);
            this._setStartedState("stopped");
            this._clientsManager.updateIpfsState("stopped");
            this._clientsManager.updatePubsubState("stopped", undefined);
            if (this.dbHandler) await this.dbHandler.destoryConnection();
            log(`Stopped the running of local subplebbit (${this.address})`);
        }
        this._setUpdatingState("stopped");
        this._setState("stopped");
    }

    private async _validateLocalSignature(newSignature: SubplebbitIpfsType["signature"], record: Omit<SubplebbitIpfsType, "signature">) {
        const log = Logger("plebbit-js:subplebbit:_validateLocalSignature");
        const ipnsRecord: SubplebbitIpfsType = JSON.parse(JSON.stringify({ ...record, signature: newSignature })); // stringify it so it would be of the same content as IPNS or pubsub
        await this._clientsManager.resolveSubplebbitAddressIfNeeded(ipnsRecord.address); // Resolve before validation so we wouldn't have multiple resolves running concurrently
        const signatureValidation = await verifySubplebbit(ipnsRecord, false, this._clientsManager, false);
        if (!signatureValidation.valid) {
            const error = new PlebbitError("ERR_LOCAL_SUBPLEBBIT_SIGNATURE_IS_INVALID", { signatureValidation });
            log.error(String(error));
            this.emit("error", error);
        }
    }
    private async updateSubplebbitIpnsIfNeeded() {
        const log = Logger("plebbit-js:subplebbit:sync");

        const lastPublishTooOld = this.updatedAt < timestamp() - 60 * 15; // Publish a subplebbit record every 15 minutes at least

        if (!this._subplebbitUpdateTrigger && !lastPublishTooOld) return; // No reason to update

        const trx: any = await this.dbHandler.createTransaction("subplebbit");
        const latestPost = await this.dbHandler.queryLatestPostCid(trx);
        await this.dbHandler.commitTransaction("subplebbit");

        const [stats, subplebbitPosts] = await Promise.all([
            this.dbHandler.querySubplebbitStats(undefined),
            this.sortHandler.generateSubplebbitPosts()
        ]);

        const statsCid = (await this._clientsManager.getDefaultIpfs()._client.add(deterministicStringify(stats))).path;

        await this._mergeInstanceStateWithDbState({});

        const updatedAt = timestamp() === this.updatedAt ? timestamp() + 1 : timestamp();
        const newIpns: Omit<SubplebbitIpfsType, "signature"> = {
            ...lodash.omit(this._toJSONBase(), "signature"),
            lastPostCid: latestPost?.cid,
            statsCid,
            updatedAt,
            posts: subplebbitPosts ? { pageCids: subplebbitPosts.pageCids, pages: lodash.pick(subplebbitPosts.pages, "hot") } : undefined
        };
        const signature = await signSubplebbit(newIpns, this.signer);
        this._validateLocalSignature(signature, newIpns);
        await this.initSubplebbit({ ...newIpns, signature });
        this._subplebbitUpdateTrigger = false;

        this._rawSubplebbitType = { ...newIpns, signature };
        await this._updateDbInternalState(
            lodash.pick(this.toJSONInternal(), ["posts", "lastPostCid", "statsCid", "updatedAt", "signature", "_subplebbitUpdateTrigger"])
        );

        const file = await this._clientsManager.getDefaultIpfs()._client.add(deterministicStringify(this._rawSubplebbitType));
        const publishRes = await this._clientsManager.getDefaultIpfs()._client.name.publish(file.path, {
            key: this.signer.ipnsKeyName,
            allowOffline: true
        });
        this.emit("update", this);
        log(
            `Published a new IPNS record for sub(${this.address}) on IPNS (${publishRes.name}) that points to file (${publishRes.value}) with updatedAt (${this.updatedAt})`
        );
    }

    private async storeCommentEdit(
        commentEditRaw: CommentEditPubsubMessage,
        challengeRequestId: ChallengeRequestMessage["challengeRequestId"]
    ): Promise<undefined> {
        const log = Logger("plebbit-js:subplebbit:handleCommentEdit");
        const commentEdit = await this.plebbit.createCommentEdit(commentEditRaw);
        await this.dbHandler.insertEdit(commentEdit.toJSONForDb(challengeRequestId));
        log.trace(`(${challengeRequestId}): `, `Updated comment (${commentEdit.commentCid}) with CommentEdit: `, commentEditRaw);
    }

    private async storeVote(newVoteProps: VoteType, challengeRequestId: ChallengeRequestMessage["challengeRequestId"]) {
        const log = Logger("plebbit-js:subplebbit:handleVote");
        const newVote = await this.plebbit.createVote(newVoteProps);
        await this.dbHandler.deleteVote(newVote.author.address, newVote.commentCid);
        await this.dbHandler.insertVote(newVote.toJSONForDb(challengeRequestId));
        log.trace(`(${challengeRequestId.toString()}): `, `inserted new vote (${newVote.vote}) for comment ${newVote.commentCid}`);
        return undefined;
    }

    private isPublicationVote(publication: DecryptedChallengeRequestMessageType["publication"]) {
        return publication.hasOwnProperty("vote");
    }

    private isPublicationComment(publication: DecryptedChallengeRequestMessageType["publication"]) {
        return !this.isPublicationVote(publication) && !this.isPublicationCommentEdit(publication);
    }

    private isPublicationReply(publication: DecryptedChallengeRequestMessageType["publication"]) {
        return this.isPublicationComment(publication) && typeof publication["parentCid"] === "string";
    }

    private isPublicationPost(publication: DecryptedChallengeRequestMessageType["publication"]) {
        return this.isPublicationComment(publication) && !publication["parentCid"];
    }

    private isPublicationCommentEdit(publication: DecryptedChallengeRequestMessageType["publication"]) {
        return !this.isPublicationVote(publication) && publication.hasOwnProperty("commentCid");
    }

    private async storePublication(
        request: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor
    ): Promise<CommentIpfsWithCid | undefined> {
        const log = Logger("plebbit-js:subplebbit:handleChallengeExchange:storePublicationIfValid");

        const publication = request.publication;
        if (this.isPublicationVote(publication)) return this.storeVote(<VoteType>publication, request.challengeRequestId);
        else if (this.isPublicationCommentEdit(publication))
            return this.storeCommentEdit(<CommentEditPubsubMessage>publication, request.challengeRequestId);
        else {
            const commentToInsert = await this.plebbit.createComment(publication);

            if (commentToInsert.link && this.settings?.fetchThumbnailUrls) {
                const thumbnailInfo = await getThumbnailUrlOfLink(commentToInsert.link, this, this.settings.fetchThumbnailUrlsProxyUrl);
                if (thumbnailInfo) {
                    commentToInsert.thumbnailUrl = thumbnailInfo.thumbnailUrl;
                    commentToInsert.thumbnailUrlWidth = thumbnailInfo.thumbnailWidth;
                    commentToInsert.thumbnailUrlHeight = thumbnailInfo.thumbnailHeight;
                }
            }

            const ipfsSigner = await this.plebbit.createSigner();
            ipfsSigner.ipnsKeyName = ipfsSigner.ipnsKeyName;
            await this.dbHandler.insertSigner(ipfsSigner.toJSONSignersTableRow(), undefined);
            ipfsSigner.ipfsKey = new Uint8Array(await getIpfsKeyFromPrivateKey(ipfsSigner.privateKey));
            commentToInsert.setCommentIpnsKey(
                await nativeFunctions.importSignerIntoIpfsNode(ipfsSigner.ipnsKeyName, ipfsSigner.ipfsKey, this.plebbit)
            );

            if (this.isPublicationPost(commentToInsert)) {
                // Post
                const trx = await this.dbHandler.createTransaction(request.challengeRequestId.toString());
                commentToInsert.setPreviousCid((await this.dbHandler.queryLatestPostCid(trx))?.cid);
                await this.dbHandler.commitTransaction(request.challengeRequestId.toString());
                commentToInsert.setDepth(0);
                const file = await this._clientsManager.getDefaultIpfs()._client.add(deterministicStringify(commentToInsert.toJSONIpfs()));
                commentToInsert.setPostCid(file.path);
                commentToInsert.setCid(file.path);

                await this.dbHandler.insertComment(commentToInsert.toJSONCommentsTableRowInsert(request.challengeRequestId));

                log(`(${request.challengeRequestId.toString()}): `, `New post with cid ${commentToInsert.cid} has been inserted into DB`);
            } else {
                // Reply
                const trx = await this.dbHandler.createTransaction(request.challengeRequestId.toString());
                const [commentsUnderParent, parent] = await Promise.all([
                    this.dbHandler.queryCommentsUnderComment(commentToInsert.parentCid, trx),
                    this.dbHandler.queryComment(commentToInsert.parentCid, trx)
                ]);
                await this.dbHandler.commitTransaction(request.challengeRequestId.toString());
                commentToInsert.setPreviousCid(commentsUnderParent[0]?.cid);
                commentToInsert.setDepth(parent.depth + 1);
                commentToInsert.setPostCid(parent.postCid);
                const file = await this._clientsManager.getDefaultIpfs()._client.add(deterministicStringify(commentToInsert.toJSONIpfs()));
                commentToInsert.setCid(file.path);
                await this.dbHandler.insertComment(commentToInsert.toJSONCommentsTableRowInsert(request.challengeRequestId));

                log(
                    `(${request.challengeRequestId.toString()}): `,
                    `New comment with cid ${commentToInsert.cid} has been inserted into DB`
                );
            }
            return commentToInsert.toJSONAfterChallengeVerification();
        }
    }

    private async _decryptOrRespondWithFailure(
        request: ChallengeRequestMessage | ChallengeAnswerMessage
    ): Promise<DecryptedChallengeRequestMessageType | DecryptedChallengeAnswerMessageType | undefined> {
        const log = Logger("plebbit-js:subplebbit:handleChallengeExchange");
        let decrypted: DecryptedChallengeAnswer | DecryptedChallengeRequest;
        try {
            decrypted = JSON.parse(
                await decryptEd25519AesGcmPublicKeyBuffer(request.encrypted, this.signer.privateKey, request.signature.publicKey)
            );
            if (request.type === "CHALLENGEREQUEST") return { ...request, ...(<DecryptedChallengeRequest>decrypted) };
            else if (request.type === "CHALLENGEANSWER") return { ...request, ...(<DecryptedChallengeAnswerMessageType>decrypted) };
        } catch (e) {
            log.error(`Failed to decrypt request (${request?.challengeRequestId?.toString()}) due to error`, e);
            if (request?.challengeRequestId?.toString()) {
                this._cleanUpChallengeAnswerPromise(request.challengeRequestId.toString());
                await this._publishFailedChallengeVerification(
                    { reason: messages.ERR_SUB_FAILED_TO_DECRYPT_PUBSUB_MSG },
                    request.challengeRequestId
                );
                this._ongoingChallengeExchanges.delete(request.challengeRequestId.toString());
            }

            throw e;
        }
    }

    private async _respondWithErrorIfSignatureOfPublicationIsInvalid(request: DecryptedChallengeRequestMessageType): Promise<void> {
        let validity: ValidationResult;
        if (this.isPublicationComment(request.publication))
            validity = await verifyComment(request.publication, this.plebbit.resolveAuthorAddresses, this._clientsManager, false);
        else if (this.isPublicationCommentEdit(request.publication))
            validity = await verifyCommentEdit(
                <CommentEditPubsubMessage>request.publication,
                this.plebbit.resolveAuthorAddresses,
                this._clientsManager,
                false
            );
        else if (this.isPublicationVote(request.publication))
            validity = await verifyVote(
                <VotePubsubMessage>request.publication,
                this.plebbit.resolveAuthorAddresses,
                this._clientsManager,
                false
            );

        if (!validity.valid) {
            await this._publishFailedChallengeVerification({ reason: validity.reason }, request.challengeRequestId);
            this._cleanUpChallengeAnswerPromise(request.challengeRequestId.toString());

            throwWithErrorCode(getErrorCodeFromMessage(validity.reason), { publication: request.publication, validity });
        }
    }

    private async _publishChallenges(
        challenges: Omit<Challenge, "verify">[],
        request: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor
    ) {
        const log = Logger("plebbit-js:subplebbit:_publishChallenges");
        const toEncryptChallenge: DecryptedChallenge = { challenges: challenges };
        const toSignChallenge: Omit<ChallengeMessageType, "signature"> = {
            type: "CHALLENGE",
            protocolVersion: env.PROTOCOL_VERSION,
            userAgent: env.USER_AGENT,
            challengeRequestId: request.challengeRequestId,
            encrypted: await encryptEd25519AesGcmPublicKeyBuffer(
                deterministicStringify(toEncryptChallenge),
                this.signer.privateKey,
                request.signature.publicKey
            ),
            timestamp: timestamp()
        };

        const challengeMessage = new ChallengeMessage({
            ...toSignChallenge,
            signature: await signChallengeMessage(toSignChallenge, this.signer)
        });

        this._clientsManager.updatePubsubState("publishing-challenge", undefined);

        await Promise.all([
            this.dbHandler.insertChallenge(challengeMessage.toJSONForDb(challenges.map((challenge) => challenge.type)), undefined),
            this._clientsManager.pubsubPublish(this.pubsubTopicWithfallback(), challengeMessage)
        ]);
        log(
            `(${request.challengeRequestId.toString()}): `,
            `Published ${challengeMessage.type} over pubsub: `,
            lodash.omit(toSignChallenge, ["encrypted"])
        );
        this._clientsManager.updatePubsubState("waiting-challenge-answers", undefined);
        this.emit("challenge", {
            ...challengeMessage,
            challenges
        });
    }

    private async _publishFailedChallengeVerification(
        result: Pick<ChallengeVerificationMessageType, "challengeErrors" | "reason">,
        challengeRequestId: ChallengeRequestMessage["challengeRequestId"]
    ) {
        // challengeSucess=false
        const log = Logger("plebbit-js:subplebbit:_publishFailedChallengeVerification");

        const toSignVerification: Omit<ChallengeVerificationMessageType, "signature"> = {
            type: "CHALLENGEVERIFICATION",
            challengeRequestId: challengeRequestId,
            challengeSuccess: false,
            challengeErrors: result.challengeErrors,
            reason: result.reason,
            userAgent: env.USER_AGENT,
            protocolVersion: env.PROTOCOL_VERSION,
            timestamp: timestamp()
        };

        const challengeVerification = new ChallengeVerificationMessage({
            ...toSignVerification,
            signature: await signChallengeVerification(toSignVerification, this.signer)
        });

        this._clientsManager.updatePubsubState("publishing-challenge-verification", undefined);
        log(`(${challengeRequestId}): `, `Will publish ${challengeVerification.type} over pubsub:`, toSignVerification);

        await Promise.all([
            this.dbHandler.insertChallengeVerification(challengeVerification.toJSONForDb(), undefined),
            this._clientsManager.pubsubPublish(this.pubsubTopicWithfallback(), challengeVerification)
        ]);
        this._clientsManager.updatePubsubState("waiting-challenge-requests", undefined);

        this.emit("challengeverification", {
            ...challengeVerification,
            publication: undefined
        });
        this._ongoingChallengeExchanges.delete(challengeRequestId.toString());
    }

    private async _publishChallengeVerification(
        challengeResult: Pick<ChallengeVerificationMessageType, "challengeErrors" | "challengeSuccess" | "reason">,
        request: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor
    ) {
        const log = Logger("plebbit-js:subplebbit:_publishChallengeVerification");
        if (!challengeResult.challengeSuccess) return this._publishFailedChallengeVerification(challengeResult, request.challengeRequestId);
        else {
            // Challenge has passed, we store the publication (except if there's an issue with the publication)
            log.trace(`(${request.challengeRequestId.toString()}): `, `User has been answered correctly`);
            const publication = await this.storePublication(request);
            // could contain "publication" or "reason"
            const encrypted = lodash.isPlainObject(publication)
                ? await encryptEd25519AesGcmPublicKeyBuffer(
                      deterministicStringify({ publication: publication }),
                      this.signer.privateKey,
                      request.signature.publicKey
                  )
                : undefined;

            const toSignMsg: Omit<ChallengeVerificationMessageType, "signature"> = {
                type: "CHALLENGEVERIFICATION",
                challengeRequestId: request.challengeRequestId,
                challengeSuccess: true,
                reason: undefined,
                encrypted,
                challengeErrors: challengeResult.challengeErrors,
                userAgent: env.USER_AGENT,
                protocolVersion: env.PROTOCOL_VERSION,
                timestamp: timestamp()
            };
            const challengeVerification = new ChallengeVerificationMessage({
                ...toSignMsg,
                signature: await signChallengeVerification(toSignMsg, this.signer)
            });

            this._clientsManager.updatePubsubState("publishing-challenge-verification", undefined);

            await Promise.all([
                this.dbHandler.insertChallengeVerification(challengeVerification.toJSONForDb(), undefined),
                this._clientsManager.pubsubPublish(this.pubsubTopicWithfallback(), challengeVerification)
            ]);
            log(
                `(${request.challengeRequestId.toString()}): `,
                `Published ${challengeVerification.type} over pubsub:`,
                lodash.omit(toSignMsg, ["encryptedPublication"])
            );

            this._clientsManager.updatePubsubState("waiting-challenge-requests", undefined);

            let publicationToEmit: DecryptedChallengeVerificationMessageTypeWithSubplebbitAuthor["publication"] | undefined = undefined;
            if (lodash.isPlainObject(publication)) {
                //@ts-expect-error
                publicationToEmit = publication;
                publicationToEmit.author.subplebbit = await this.dbHandler.querySubplebbitAuthor(publicationToEmit.author.address);
            }

            this.emit("challengeverification", {
                ...challengeVerification,
                publication: publicationToEmit
            });
            this._ongoingChallengeExchanges.delete(request.challengeRequestId.toString());
        }
    }

    private async _checkPublicationValidity(
        request: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor
    ): Promise<messages | undefined> {
        const log = Logger("plebbit-js:subplebbit:handleChallengeRequest:checkPublicationValidity");

        const publication = lodash.cloneDeep(request.publication);

        if (publication["signer"]) return messages.ERR_FORBIDDEN_SIGNER_FIELD;

        if (publication.subplebbitAddress !== this.address) return messages.ERR_PUBLICATION_INVALID_SUBPLEBBIT_ADDRESS;

        if (typeof publication?.author?.subplebbit?.banExpiresAt === "number" && publication.author.subplebbit.banExpiresAt > timestamp())
            return messages.ERR_AUTHOR_IS_BANNED;

        delete publication.author.subplebbit; // author.subplebbit is generated by the sub so we need to remove it
        const forbiddenAuthorFields: (keyof Author)[] = ["shortAddress"];

        if (Object.keys(publication.author).some((key: keyof Author) => forbiddenAuthorFields.includes(key)))
            return messages.ERR_FORBIDDEN_AUTHOR_FIELD;

        if (!this.isPublicationPost(publication)) {
            const parentCid: string | undefined = this.isPublicationReply(publication)
                ? publication["parentCid"]
                : this.isPublicationVote(publication) || this.isPublicationCommentEdit(publication)
                ? publication["commentCid"]
                : undefined;

            if (!parentCid) return messages.ERR_SUB_COMMENT_PARENT_CID_NOT_DEFINED;

            const parent = await this.dbHandler.queryComment(parentCid);
            if (!parent) return messages.ERR_SUB_COMMENT_PARENT_DOES_NOT_EXIST;

            const parentFlags = await this.dbHandler.queryCommentFlags(parentCid);

            if (parentFlags.removed && !this.isPublicationCommentEdit(publication))
                return messages.ERR_SUB_PUBLICATION_PARENT_HAS_BEEN_REMOVED;

            const isParentDeleted = await this.dbHandler.queryAuthorEditDeleted(parentCid);

            if (isParentDeleted && !this.isPublicationCommentEdit(publication)) return messages.ERR_SUB_PUBLICATION_PARENT_HAS_BEEN_DELETED;

            const postFlags = await this.dbHandler.queryCommentFlags(parent.postCid);

            if (postFlags.removed && !this.isPublicationCommentEdit(publication)) return messages.ERR_SUB_PUBLICATION_POST_HAS_BEEN_REMOVED;

            const isPostDeleted = await this.dbHandler.queryAuthorEditDeleted(parent.postCid);

            if (isPostDeleted && !this.isPublicationCommentEdit(publication)) return messages.ERR_SUB_PUBLICATION_POST_HAS_BEEN_DELETED;

            if (postFlags.locked && !this.isPublicationCommentEdit(publication)) return messages.ERR_SUB_PUBLICATION_POST_IS_LOCKED;

            if (parent.timestamp > publication.timestamp) return messages.ERR_SUB_COMMENT_TIMESTAMP_IS_EARLIER_THAN_PARENT;
        }

        // Reject publications if their size is over 40kb
        const publicationKilobyteSize = Buffer.byteLength(JSON.stringify(publication)) / 1000;

        if (publicationKilobyteSize > 40) return messages.ERR_COMMENT_OVER_ALLOWED_SIZE;

        if (this.isPublicationComment(publication)) {
            const forbiddenCommentFields: (keyof CommentType | "deleted")[] = [
                "cid",
                "signer",
                "ipnsKeyName",
                "previousCid",
                "ipnsName",
                "depth",
                "postCid",
                "upvoteCount",
                "downvoteCount",
                "replyCount",
                "updatedAt",
                "replies",
                "edit",
                "deleted",
                "pinned",
                "locked",
                "removed",
                "reason",
                "shortCid"
            ];

            if (Object.keys(publication).some((key: keyof CommentType) => forbiddenCommentFields.includes(key)))
                return messages.ERR_FORBIDDEN_COMMENT_FIELD;
        }

        if (this.isPublicationVote(request.publication)) {
            const lastVote = await this.dbHandler.getLastVoteOfAuthor(
                request.publication["commentCid"],
                request.publication.author.address
            );
            if (lastVote && request.publication.signature.publicKey !== lastVote.signature.publicKey)
                return messages.UNAUTHORIZED_AUTHOR_ATTEMPTED_TO_CHANGE_VOTE;
        }

        if (this.isPublicationCommentEdit(request.publication)) {
            //@ts-expect-error
            const commentEdit = await this.plebbit.createCommentEdit(request.publication);

            const commentToBeEdited = await this.dbHandler.queryComment(commentEdit.commentCid, undefined); // We assume commentToBeEdited to be defined because we already tested for its existence above
            const editSignedByOriginalAuthor = commentEdit.signature.publicKey === commentToBeEdited.signature.publicKey;
            const editorModRole = this.roles && this.roles[commentEdit.author.address];

            const allowedEditFields =
                editSignedByOriginalAuthor && editorModRole
                    ? [...AUTHOR_EDIT_FIELDS, ...MOD_EDIT_FIELDS]
                    : editSignedByOriginalAuthor
                    ? AUTHOR_EDIT_FIELDS
                    : editorModRole
                    ? MOD_EDIT_FIELDS
                    : undefined;
            if (!allowedEditFields) return messages.ERR_UNAUTHORIZED_COMMENT_EDIT;
            for (const editField of Object.keys(removeKeysWithUndefinedValues(request.publication)))
                if (!allowedEditFields.includes(<any>editField)) return messages.ERR_SUB_COMMENT_EDIT_UNAUTHORIZED_FIELD;

            if (editorModRole && typeof commentEdit.locked === "boolean" && commentToBeEdited.depth !== 0)
                return messages.ERR_SUB_COMMENT_EDIT_CAN_NOT_LOCK_REPLY;
        }

        return undefined;
    }

    private async handleChallengeRequest(request: ChallengeRequestMessage) {
        const log = Logger("plebbit-js:subplebbit:handleChallengeRequest");

        if (this._ongoingChallengeExchanges.has(request.challengeRequestId.toString())) return; // This is a duplicate challenge request
        this._ongoingChallengeExchanges.set(request.challengeRequestId.toString(), true);
        const requestSignatureValidation = await verifyChallengeRequest(request, true);
        if (!requestSignatureValidation.valid)
            throwWithErrorCode(getErrorCodeFromMessage(requestSignatureValidation.reason), {
                challengeRequest: lodash.omit(request, ["encryptedPublication"])
            });

        const decryptedRequest = <DecryptedChallengeRequestMessageType>await this._decryptOrRespondWithFailure(request);
        if (typeof decryptedRequest?.publication?.author?.address !== "string")
            return this._publishFailedChallengeVerification(
                { reason: messages.ERR_AUTHOR_ADDRESS_UNDEFINED },
                decryptedRequest.challengeRequestId
            );

        await this.dbHandler.insertChallengeRequest(
            request.toJSONForDb(decryptedRequest.challengeAnswers, decryptedRequest.challengeCommentCids),
            undefined
        );
        //@ts-expect-error
        const decryptedRequestWithSubplebbitAuthor: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor = decryptedRequest;

        try {
            await this._respondWithErrorIfSignatureOfPublicationIsInvalid(decryptedRequest); // This function will throw an error if signature is invalid
        } catch (e) {
            decryptedRequestWithSubplebbitAuthor.publication.author.subplebbit = await this.dbHandler.querySubplebbitAuthor(
                decryptedRequest.publication.author.address
            );
            this.emit("challengerequest", decryptedRequestWithSubplebbitAuthor);
            return;
        }
        decryptedRequestWithSubplebbitAuthor.publication.author.subplebbit = await this.dbHandler.querySubplebbitAuthor(
            decryptedRequest.publication.author.address
        );

        this.emit("challengerequest", decryptedRequestWithSubplebbitAuthor);

        // Check publication props validity
        const publicationInvalidityReason = await this._checkPublicationValidity(decryptedRequestWithSubplebbitAuthor);
        if (publicationInvalidityReason)
            return this._publishFailedChallengeVerification({ reason: publicationInvalidityReason }, request.challengeRequestId);

        const answerPromiseKey = decryptedRequestWithSubplebbitAuthor.challengeRequestId.toString();
        const getChallengeAnswers: GetChallengeAnswers = async (challenges) => {
            // ...get challenge answers from user. e.g.:
            // step 1. subplebbit publishes challenge pubsub message with `challenges` provided in argument of `getChallengeAnswers`
            // step 2. subplebbit waits for challenge answer pubsub message with `challengeAnswers` and then returns `challengeAnswers`
            await this._publishChallenges(challenges, decryptedRequestWithSubplebbitAuthor);
            this._challengeAnswerPromises.set(
                answerPromiseKey,
                new Promise((resolve, reject) => this._challengeAnswerResolveReject.set(answerPromiseKey, { resolve, reject }))
            );
            const challengeAnswers = await this._challengeAnswerPromises.get(answerPromiseKey);
            this._cleanUpChallengeAnswerPromise(answerPromiseKey);
            return challengeAnswers;
        };
        // NOTE: we try to get challenge verification immediately after receiving challenge request
        // because some challenges are automatic and skip the challenge message
        let challengeVerification: Pick<ChallengeVerificationMessageType, "challengeErrors" | "challengeSuccess" | "reason">;
        try {
            challengeVerification = await getChallengeVerification(decryptedRequestWithSubplebbitAuthor, this, getChallengeAnswers);
        } catch (e) {
            // getChallengeVerification will throw if one of the getChallenge function throws, which indicates a bug with the challenge script
            // notify the sub owner that that one of his challenge is misconfigured via an error event
            log.error("getChallenge failed, the sub owner needs to check the challenge code. The error is: ", e);
            this.emit("error", e);

            // notify the author that his publication wasn't published because the subplebbit is misconfigured
            challengeVerification = {
                challengeSuccess: false,
                reason: `One of the subplebbit challenges is misconfigured: ${e.message}`
            };
        }

        await this._publishChallengeVerification(challengeVerification, decryptedRequestWithSubplebbitAuthor);
    }

    private _cleanUpChallengeAnswerPromise(challengeRequestIdString: string) {
        this._challengeAnswerPromises.delete(challengeRequestIdString);
        this._challengeAnswerResolveReject.delete(challengeRequestIdString);
    }

    async handleChallengeAnswer(challengeAnswer: ChallengeAnswerMessage) {
        const log = Logger("plebbit-js:subplebbit:handleChallengeAnswer");

        const answerSignatureValidation = await verifyChallengeAnswer(challengeAnswer, true);

        if (!answerSignatureValidation.valid) {
            this._cleanUpChallengeAnswerPromise(challengeAnswer.challengeRequestId.toString());
            this._ongoingChallengeExchanges.delete(challengeAnswer.challengeRequestId.toString());
            throwWithErrorCode(getErrorCodeFromMessage(answerSignatureValidation.reason), { challengeAnswer });
        }

        const decryptedChallengeAnswer = <DecryptedChallengeAnswerMessageType>await this._decryptOrRespondWithFailure(challengeAnswer);

        await this.dbHandler.insertChallengeAnswer(challengeAnswer.toJSONForDb(decryptedChallengeAnswer.challengeAnswers), undefined);
        this.emit("challengeanswer", decryptedChallengeAnswer);

        this._challengeAnswerResolveReject[challengeAnswer.challengeRequestId.toString()].resolve(
            decryptedChallengeAnswer.challengeAnswers
        );
    }

    private async handleChallengeExchange(pubsubMsg: Parameters<MessageHandlerFn>[0]) {
        const log = Logger("plebbit-js:subplebbit:handleChallengeExchange");

        let msgParsed: ChallengeRequestMessageType | ChallengeAnswerMessageType | undefined;
        try {
            msgParsed = cborg.decode(pubsubMsg.data);
            if (msgParsed.type === "CHALLENGEREQUEST") {
                await this.handleChallengeRequest(new ChallengeRequestMessage(msgParsed));
            } else if (
                msgParsed.type === "CHALLENGEANSWER" &&
                !this._ongoingChallengeExchanges.has(msgParsed.challengeRequestId.toString())
            )
                // Respond with error to answers without challenge request
                await this._publishFailedChallengeVerification(
                    { reason: messages.ERR_CHALLENGE_ANSWER_WITH_NO_CHALLENGE_REQUEST },
                    msgParsed.challengeRequestId
                );
            else if (msgParsed.type === "CHALLENGEANSWER") await this.handleChallengeAnswer(new ChallengeAnswerMessage(msgParsed));
        } catch (e) {
            e.message = `failed process captcha for challenge request id (${msgParsed?.challengeRequestId}): ${e.message}`;
            log.error(`(${msgParsed?.challengeRequestId}): `, String(e));
            if (msgParsed?.challengeRequestId?.toString())
                await this.dbHandler.rollbackTransaction(msgParsed.challengeRequestId.toString());
        }
    }

    private async _publishCommentIpns(dbComment: Pick<CommentType, "ipnsKeyName" | "cid">, options: CommentUpdate) {
        const signerRaw = await this.dbHandler.querySigner(dbComment.ipnsKeyName);

        if (!signerRaw) throw Error(`Comment ${dbComment.cid} IPNS signer is not stored in DB`);
        await this._importSignerIntoIpfsIfNeeded(signerRaw);
        const file = await this._clientsManager.getDefaultIpfs()._client.add(deterministicStringify(options));
        await this._clientsManager.getDefaultIpfs()._client.name.publish(file.path, {
            key: signerRaw.ipnsKeyName,
            allowOffline: true,
            lifetime: `${this._commentUpdateIpnsLifetimeSeconds}s`
        });
    }

    private async _validateCommentUpdate(update: CommentUpdate, comment: Pick<CommentWithCommentUpdate, "cid" | "signature">) {
        const simUpdate = JSON.parse(deterministicStringify(update)); // We need to stringify the update, so it will have the same shape as if it were sent by pubsub or IPNS
        const signatureValidity = await verifyCommentUpdate(
            simUpdate,
            this.plebbit.resolveAuthorAddresses,
            this._clientsManager,
            this.address,
            comment,
            false
        );
        assert(signatureValidity.valid, `Comment Update signature is invalid. Reason (${signatureValidity.reason})`);
    }

    private async _updateComment(comment: CommentsTableRow): Promise<void> {
        const log = Logger("plebbit-js:subplebbit:sync:syncComment");

        // If we're here that means we're gonna calculate the new update and publish it
        log(`Attempting to update Comment (${comment.cid})`);

        // This comment will have the local new CommentUpdate, which we will publish over IPNS
        // It includes new author.subplebbit as well as updated values in CommentUpdate (except for replies field)
        const [calculatedCommentUpdate, storedCommentUpdate, generatedPages] = await Promise.all([
            this.dbHandler.queryCalculatedCommentUpdate(comment),
            this.dbHandler.queryStoredCommentUpdate(comment),
            this.sortHandler.generateRepliesPages(comment)
        ]);
        if (calculatedCommentUpdate.replyCount > 0) assert(generatedPages);

        const newUpdatedAt = storedCommentUpdate?.updatedAt === timestamp() ? timestamp() + 1 : timestamp();

        const commentUpdatePriorToSigning: Omit<CommentUpdate, "signature"> = {
            ...calculatedCommentUpdate,
            replies: generatedPages ? { pageCids: generatedPages.pageCids, pages: lodash.pick(generatedPages.pages, "topAll") } : undefined,
            updatedAt: newUpdatedAt,
            protocolVersion: version.PROTOCOL_VERSION
        };
        const newIpns: CommentUpdate = {
            ...commentUpdatePriorToSigning,
            signature: await signCommentUpdate(commentUpdatePriorToSigning, this.signer)
        };
        await this._validateCommentUpdate(newIpns, comment); // TODO Should be removed once signature are working properly
        await this.dbHandler.upsertCommentUpdate(newIpns);

        await this._publishCommentIpns(comment, newIpns);
    }

    private async _listenToIncomingRequests() {
        const log = Logger("plebbit-js:subplebbit:sync");
        // Make sure subplebbit listens to pubsub topic
        const subscribedTopics = await this._clientsManager.getDefaultPubsub()._client.pubsub.ls();
        if (!subscribedTopics.includes(this.pubsubTopicWithfallback())) {
            await this._clientsManager.pubsubUnsubscribe(this.pubsubTopicWithfallback(), this.handleChallengeExchange); // Make sure it's not hanging
            await this._clientsManager.pubsubSubscribe(this.pubsubTopicWithfallback(), this.handleChallengeExchange);
            this._clientsManager.updatePubsubState("waiting-challenge-requests", undefined);
            log(`Waiting for publications on pubsub topic (${this.pubsubTopicWithfallback()})`);
        }
    }

    private async _getDbInternalState(lock = true) {
        if (lock) await this.dbHandler.lockSubState();
        const internalState: InternalSubplebbitType = await this.dbHandler.keyvGet(CACHE_KEYS[CACHE_KEYS.INTERNAL_SUBPLEBBIT]);
        if (lock) await this.dbHandler.unlockSubState();
        return internalState;
    }

    private async _mergeInstanceStateWithDbState(overrideProps: Partial<InternalSubplebbitType>) {
        const currentDbState = lodash.omit(await this._getDbInternalState(), "address");
        await this.initSubplebbit({ ...currentDbState, ...overrideProps });
    }

    private async _switchDbIfNeeded() {
        const log = Logger("plebbit-js:subplebbit:_switchDbIfNeeded");

        // Will check if address has been changed, and if so connect to the new db with the new address
        const internalState = await this._getDbInternalState(false);
        const potentialNewAddresses = lodash.uniq([internalState.address, this.dbHandler.subAddress(), this.address]);

        if (this.dbHandler.isDbInMemory()) this.setAddress(this.dbHandler.subAddress());
        else if (potentialNewAddresses.length > 1) {
            const wasSubRunning = (await Promise.all(potentialNewAddresses.map(this.dbHandler.isSubStartLocked))).some(Boolean);
            const newAddresses = potentialNewAddresses.filter((address) => this.dbHandler.subDbExists(address));
            if (newAddresses.length > 1) throw Error(`There are multiple dbs of the same sub`);
            const newAddress = newAddresses[0];
            log(`Updating to a new address (${newAddress}) `);
            this._subplebbitUpdateTrigger = true;
            await Promise.all(potentialNewAddresses.map(this.dbHandler.unlockSubStart));
            if (wasSubRunning) await this.dbHandler.lockSubStart(newAddress);
            this.setAddress(newAddress);
            this.dbHandler = this.sortHandler = undefined;
            await this.initDbHandlerIfNeeded();
            await this.dbHandler.initDbIfNeeded();
        }
    }

    private async _updateCommentsThatNeedToBeUpdated() {
        const log = Logger(`plebbit-js:subplebbit:_updateCommentsThatNeedToBeUpdated`);

        const trx = await this.dbHandler.createTransaction("_updateCommentsThatNeedToBeUpdated");
        const commentsToUpdate = await this.dbHandler!.queryCommentsToBeUpdated(
            this._ipfsNodeIpnsKeyNames,
            this._commentUpdateIpnsLifetimeSeconds,
            trx
        );
        await this.dbHandler.commitTransaction("_updateCommentsThatNeedToBeUpdated");
        if (commentsToUpdate.length === 0) return;

        this._subplebbitUpdateTrigger = true;

        log(`Will update ${commentsToUpdate.length} comments in this update loop for subplebbit (${this.address})`);

        const commentsGroupedByDepth = lodash.groupBy(commentsToUpdate, "depth");

        const depthsKeySorted = Object.keys(commentsGroupedByDepth).sort((a, b) => Number(b) - Number(a)); // Make sure comments with higher depths are sorted first

        for (const depthKey of depthsKeySorted) for (const comment of commentsGroupedByDepth[depthKey]) await this._updateComment(comment);
    }

    private async _repinCommentsIPFSIfNeeded() {
        const log = Logger("plebbit-js:subplebbit:sync");
        const dbCommentsCids = await this.dbHandler.queryAllCommentsCid();
        const pinnedCids = (await this._clientsManager.getDefaultIpfs()._client.pin.ls()).map((cid) => cid.cid.toString());

        const unpinnedCommentsCids = lodash.difference(dbCommentsCids, pinnedCids);

        if (unpinnedCommentsCids.length === 0) return;

        log.trace(`There are ${unpinnedCommentsCids.length} comments that need to be repinned`);

        const unpinnedComments = await Promise.all(
            (await this.dbHandler.queryCommentsByCids(unpinnedCommentsCids)).map((dbRes) => this.plebbit.createComment(dbRes))
        );

        for (const comment of unpinnedComments) {
            const commentIpfsContent = deterministicStringify(comment.toJSONIpfs());
            const contentHash: string = await Hash.of(commentIpfsContent);
            assert.equal(contentHash, comment.cid);
            await this._clientsManager.getDefaultIpfs()._client.add(commentIpfsContent, { pin: true });
        }

        log(`${unpinnedComments.length} comments' IPFS have been repinned`);
    }

    private async syncIpnsWithDb() {
        const log = Logger("plebbit-js:subplebbit:sync");
        await this._switchDbIfNeeded();

        try {
            await this._mergeInstanceStateWithDbState({});
            this._ipfsNodeIpnsKeyNames = (await this._clientsManager.getDefaultIpfs()._client.key.list()).map((key) => key.name);
            await this._listenToIncomingRequests();
            this._setStartedState("publishing-ipns");
            this._clientsManager.updateIpfsState("publishing-ipns");
            await Promise.all([this._updateCommentsThatNeedToBeUpdated(), this._repinCommentsIPFSIfNeeded()]);
            await this.updateSubplebbitIpnsIfNeeded();
            this._setStartedState("succeeded");
            this._clientsManager.updateIpfsState("stopped");
        } catch (e) {
            this._setStartedState("failed");
            this._clientsManager.updateIpfsState("stopped");

            log.error(`Failed to sync due to error,`, e);
        }
    }

    private async _updateDbInternalState(props: Partial<InternalSubplebbitType>) {
        if (Object.keys(props).length === 0) return;
        await this.dbHandler.lockSubState();
        const internalStateBefore: InternalSubplebbitType = await this.dbHandler.keyvGet(CACHE_KEYS[CACHE_KEYS.INTERNAL_SUBPLEBBIT]);
        await this.dbHandler.keyvSet(CACHE_KEYS[CACHE_KEYS.INTERNAL_SUBPLEBBIT], {
            ...internalStateBefore,
            ...props
        });
        await this.dbHandler.unlockSubState();
    }

    private async _syncLoop(syncIntervalMs: number) {
        const loop = async () => {
            if (this._sync) {
                await this.syncIpnsWithDb();
                await this._syncLoop(syncIntervalMs);
            }
        };
        this._syncInterval = setTimeout(loop.bind(this), syncIntervalMs);
    }

    async start() {
        const log = Logger("plebbit-js:subplebbit:start");

        if (this.plebbit.plebbitRpcClient) {
            try {
                this._startRpcSubscriptionId = await this.plebbit.plebbitRpcClient.startSubplebbit(this.address);
            } catch (e) {
                log.error(`Failed to start subplebbit (${this.address}) from RPC due to error`, e);
                this._setState("stopped");
                this._setStartedState("failed");
                throw e;
            }
            this.plebbit.plebbitRpcClient
                .getSubscription(this._startRpcSubscriptionId)
                .on("update", async (updateProps) => {
                    log(`Received new subplebbitUpdate from RPC (${this.plebbit.plebbitRpcClientsOptions[0]})`);
                    this._rawSubplebbitType = updateProps.params.result;
                    await this.initSubplebbit(this._rawSubplebbitType);
                    this.emit("update", this);
                })
                .on("startedstatechange", (args) => {
                    const newStartedState: Subplebbit["startedState"] = args.params.result;
                    this._setStartedState(newStartedState);
                    this._updateRpcClientStateFromStartedState(newStartedState);
                })
                .on("challengerequest", (args) =>
                    this.emit(
                        "challengerequest",
                        <DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor>decodePubsubMsgFromRpc(args.params.result)
                    )
                )
                .on("challenge", (args) =>
                    this.emit("challenge", <DecryptedChallengeMessageType>decodePubsubMsgFromRpc(args.params.result))
                )
                .on("challengeanswer", (args) =>
                    this.emit("challengeanswer", <DecryptedChallengeAnswerMessageType>decodePubsubMsgFromRpc(args.params.result))
                )
                .on("challengeverification", (args) =>
                    this.emit(
                        "challengeverification",
                        <DecryptedChallengeVerificationMessageTypeWithSubplebbitAuthor>decodePubsubMsgFromRpc(args.params.result)
                    )
                )

                .on("error", (args) => this.emit("error", args.params.result));

            this.plebbit.plebbitRpcClient.emitAllPendingMessages(this._startRpcSubscriptionId);
            return;
        }
        if (!this.signer?.address) throwWithErrorCode("ERR_SUB_SIGNER_NOT_DEFINED");
        if (!this._clientsManager.getDefaultIpfs())
            throwWithErrorCode("ERR_CAN_NOT_RUN_A_SUB_WITH_NO_IPFS_NODE", { ipfsHttpClientOptions: this.plebbit.ipfsHttpClientsOptions });

        await this.dbHandler.initDestroyedConnection();

        await this.dbHandler.lockSubStart(); // Will throw if sub is locked already
        this._sync = true;
        await this.dbHandler.initDbIfNeeded();

        // Import subplebbit keys onto ipfs node

        await this._importSignerIntoIpfsIfNeeded({ ipnsKeyName: this.signer.ipnsKeyName, privateKey: this.signer.privateKey });

        if (!this.settings?.challenges) await this.edit({ settings: { ...this.settings, challenges: [{ name: "captcha-canvas-v3" }] } });

        if (typeof this.pubsubTopic !== "string") {
            this.pubsubTopic = lodash.clone(this.signer.address);
            log(`Defaulted subplebbit (${this.address}) pubsub topic to ${this.pubsubTopic} since sub owner hasn't provided any`);
            await this._updateDbInternalState(lodash.pick(this, "pubsubTopic"));
        }
        if (typeof this.createdAt !== "number") {
            this.createdAt = timestamp();
            log(`Subplebbit (${this.address}) createdAt has been set to ${this.createdAt}`);
            await this._updateDbInternalState(lodash.pick(this, "createdAt"));
        }

        this._subplebbitUpdateTrigger = true;
        await this._updateDbInternalState({ _subplebbitUpdateTrigger: this._subplebbitUpdateTrigger });

        this._setState("started");

        this.syncIpnsWithDb()
            .then(() => this._syncLoop(this.plebbit.publishInterval))
            .catch((reason) => {
                log.error(reason);
                this.emit("error", reason);
            });
    }

    async delete() {
        await this.stop();
        if (this.plebbit.plebbitRpcClient) return this.plebbit.plebbitRpcClient.deleteSubplebbit(this.address);

        const log = Logger("plebbit-js:subplebbit:delete");
        if (typeof this.plebbit.dataPath !== "string")
            throwWithErrorCode("ERR_DATA_PATH_IS_NOT_DEFINED", { plebbitDataPath: this.plebbit.dataPath });

        const ipfsClient = this._clientsManager.getDefaultIpfs();
        if (!ipfsClient) throw Error("Ipfs client is not defined");

        await nativeFunctions.deleteSubplebbit(this.address, this.plebbit.dataPath);
        if (typeof this.signer?.ipnsKeyName === "string")
            // Key may not exist on ipfs node
            try {
                await ipfsClient._client.key.rm(this.signer.ipnsKeyName);
            } catch {}
    }
}