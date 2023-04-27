import { toString as uint8ArrayToString } from "uint8arrays/to-string";
import { sha256 } from "js-sha256";
import { fromString as uint8ArrayFromString } from "uint8arrays/from-string";
import { ChallengeAnswerMessage, ChallengeMessage, ChallengeRequestMessage, ChallengeVerificationMessage } from "./challenge";
import { SortHandler } from "./sort-handler";
import { parseRawPages, removeKeysWithUndefinedValues, shortifyAddress, throwWithErrorCode, timestamp } from "./util";
import { decrypt, encrypt, Signer } from "./signer";
import { Pages } from "./pages";
import { Plebbit } from "./plebbit";
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
    Flair,
    FlairOwner,
    InternalSubplebbitType,
    ProtocolVersion,
    SubplebbitEditOptions,
    SubplebbitEncryption,
    SubplebbitFeatures,
    SubplebbitIpfsType,
    SubplebbitStats,
    SubplebbitRole,
    SubplebbitSuggested,
    SubplebbitType,
    VoteType,
    SubplebbitEvents,
    SubplebbitSettings
} from "./types";
import { Comment } from "./comment";
import Post from "./post";
import {
    getIpfsKeyFromPrivateKey,
    getPlebbitAddressFromPrivateKey,
    getPlebbitAddressFromPublicKey,
    getPublicKeyFromPrivateKey
} from "./signer/util";
import { AUTHOR_EDIT_FIELDS, MOD_EDIT_FIELDS } from "./comment-edit";
import { messages } from "./errors";
import Logger from "@plebbit/plebbit-logger";
import { getThumbnailUrlOfLink, nativeFunctions } from "./runtime/node/util";
import env from "./version";
import lodash from "lodash";
import {
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
} from "./signer/signatures";
import { CACHE_KEYS } from "./constants";
import assert from "assert";
import version from "./version";
import { SignatureType, SignerType } from "./signer/constants";
import { TypedEmitter } from "tiny-typed-emitter";
import { PlebbitError } from "./plebbit-error";
import retry, { RetryOperation } from "retry";
import Author from "./author";
import { SubplebbitClientsManager } from "./client";

const DEFAULT_UPDATE_INTERVAL_MS = 60000;
const DEFAULT_SYNC_INTERVAL_MS = 100000; // 1.67 minutes

export class Subplebbit extends TypedEmitter<SubplebbitEvents> implements Omit<SubplebbitType, "posts"> {
    // public
    title?: string;
    description?: string;
    roles?: { [authorAddress: string]: SubplebbitRole };
    lastPostCid?: string;
    posts: Pages;
    pubsubTopic?: string;
    challengeTypes?: ChallengeType[];
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
    signature: SignatureType; // signature of the Subplebbit update by the sub owner to protect against malicious gateway
    rules?: string[];
    settings?: SubplebbitSettings;

    // Only for Subplebbit instance
    state: "stopped" | "updating" | "started";
    startedState: "stopped" | "fetching-ipns" | "publishing-ipns" | "failed" | "succeeded";
    updatingState: "stopped" | "resolving-address" | "fetching-ipns" | "fetching-ipfs" | "failed" | "succeeded";
    plebbit: Plebbit;
    dbHandler?: DbHandlerPublicAPI;
    clients: {
        ipfsGateways: { [ipfsGatewayUrl: string]: { state: "stopped" | "fetching-ipfs" | "fetching-ipns" } };
        ipfsClients: { [ipfsClientUrl: string]: { state: "stopped" | "fetching-subplebbit-ipns" | "fetching-subplebbit-ipfs" } };
        pubsubClients: {
            [pubsubClientUrl: string]: {
                state:
                    | "stopped"
                    | "waiting-challenge-requests"
                    | "publishing-challenge"
                    | "waiting-challenge-answers"
                    | "publishing-challenge-verification";
            };
        };
        chainProviders: { [chainProviderUrl: string]: { state: "stopped" | "resolving-subplebbit-address" | "resolving-author-address" } };
    };

    // private

    private _challengeToSolution: Record<string, string[]>;
    private _challengeToPublicKey: Record<string, string>;
    private _challengeToPublication: Record<string, DecryptedChallengeRequestMessageType["publication"]>;
    private provideCaptchaCallback: (request: DecryptedChallengeRequestMessageType) => Promise<[ChallengeType[], string | undefined]>;
    private validateCaptchaAnswerCallback: (answerMessage: DecryptedChallengeAnswerMessageType) => Promise<[boolean, string[] | undefined]>;
    private sortHandler: SortHandler;
    private _updateInterval?: any;
    private _updateIntervalMs: number;
    private _syncInterval?: any;
    private _syncIntervalMs: number; // How often should a sub publish a new IPNS
    private _sync: boolean;
    private _ipfsNodeIpnsKeyNames: string[];
    private _subplebbitUpdateTrigger: boolean;
    private _loadingOperation: RetryOperation;
    _clientsManager: SubplebbitClientsManager;

    constructor(plebbit: Plebbit) {
        super();
        this.plebbit = plebbit;
        this._challengeToSolution = {}; // Map challenge ID to its solution
        this._challengeToPublication = {}; // To hold unpublished posts/comments/votes
        this._challengeToPublicKey = {}; // Map out challenge request id to their signers
        this._setState("stopped");
        this._setStartedState("stopped");
        this._setUpdatingState("stopped");
        this._sync = false;

        // these functions might get separated from their `this` when used
        this.start = this.start.bind(this);
        this.update = this.update.bind(this);
        this.stop = this.stop.bind(this);
        this.edit = this.edit.bind(this);
        this.handleChallengeExchange = this.handleChallengeExchange.bind(this);

        this.on("error", (...args) => this.plebbit.emit("error", ...args));

        this._syncIntervalMs = DEFAULT_SYNC_INTERVAL_MS;
        this._updateIntervalMs = DEFAULT_UPDATE_INTERVAL_MS;

        this._clientsManager = new SubplebbitClientsManager(this);
        this.clients = this._clientsManager.clients;
    }

    async initSubplebbit(newProps: InternalSubplebbitType | SubplebbitEditOptions | SubplebbitIpfsType) {
        const oldProps = this.toJSONInternal();
        const mergedProps = { ...oldProps, ...newProps };
        this.title = mergedProps.title;
        this.description = mergedProps.description;
        this.lastPostCid = mergedProps.lastPostCid;
        this.setAddress(mergedProps.address);
        this.pubsubTopic = mergedProps.pubsubTopic;
        this.challengeTypes = mergedProps.challengeTypes;
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

        this.posts = await parseRawPages(mergedProps.posts, undefined, this);
    }

    private setAddress(newAddress: string) {
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
                    dataPath: this.plebbit.dataPath
                }
            });
            await this.dbHandler.initDbConfigIfNeeded();
            this.sortHandler = new SortHandler(lodash.pick(this, ["address", "plebbit", "dbHandler", "encryption", "_clientsManager"]));
        }
    }

    setProvideCaptchaCallback(
        newCallback: (request: DecryptedChallengeRequestMessageType) => Promise<[ChallengeType[], string | undefined]>
    ) {
        this.provideCaptchaCallback = newCallback;
    }

    setValidateCaptchaAnswerCallback(
        newCallback: (answerMessage: DecryptedChallengeAnswerMessageType) => Promise<[boolean, string[] | undefined]>
    ) {
        this.validateCaptchaAnswerCallback = newCallback;
    }

    toJSONInternal(): InternalSubplebbitType {
        return {
            ...this.toJSON(),
            posts: this.posts?.toJSON(),
            signer: this.signer ? lodash.pick(this.signer, ["privateKey", "type", "address"]) : undefined,
            _subplebbitUpdateTrigger: this._subplebbitUpdateTrigger,
            settings: this.settings
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
            challengeTypes: this.challengeTypes,
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
            this._ipfsNodeIpnsKeyNames = (await this._clientsManager.getCurrentIpfs()._client.key.list()).map((key) => key.name);

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

        await this.dbHandler.initDestroyedConnection();
        if (newSubplebbitOptions.address && newSubplebbitOptions.address !== this.address) {
            this.assertDomainResolvesCorrectly(newSubplebbitOptions.address).catch((err: PlebbitError) => {
                log.error(err.toString());
                this.emit("error", err);
            });
            log(`Attempting to edit subplebbit.address from ${this.address} to ${newSubplebbitOptions.address}`);
            await this._updateDbInternalState(lodash.pick(newSubplebbitOptions, "address"));
            await this.dbHandler.changeDbFilename(newSubplebbitOptions.address, {
                address: newSubplebbitOptions.address,
                plebbit: {
                    dataPath: this.plebbit.dataPath
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

    private _setState(newState: Subplebbit["state"]) {
        this.state = newState;
        this.emit("statechange", this.state);
    }

    private _setUpdatingState(newState: Subplebbit["updatingState"]) {
        this.updatingState = newState;
        this.emit("updatingstatechange", this.updatingState);
    }

    private _setStartedState(newState: Subplebbit["startedState"]) {
        this.startedState = newState;
        this.emit("startedstatechange", this.startedState);
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
                log(`Remote Subplebbit received a new update. Will emit an update event`);
                this._setUpdatingState("succeeded");
                await this.initSubplebbit(subState);
                this.emit("update", this);
            }
        } else {
            this._setUpdatingState("resolving-address");

            const ipnsAddress = await this._clientsManager.resolveSubplebbitAddressIfNeeded(this.address);
            this._loadingOperation = retry.operation({ forever: true, factor: 2 });

            const subplebbitIpns = await this._retryLoadingSubplebbitIpns(log, ipnsAddress);

            const updateValidity = await verifySubplebbit(subplebbitIpns, this.plebbit);
            if (!updateValidity.valid) {
                this._setUpdatingState("failed");
                const error = new PlebbitError("ERR_SIGNATURE_IS_INVALID", { signatureValidity: updateValidity, subplebbitIpns });
                this.emit("error", error);
            } else if (this.updatedAt !== subplebbitIpns.updatedAt) {
                await this.initSubplebbit(subplebbitIpns);
                this._setUpdatingState("succeeded");
                log(`Remote Subplebbit received a new update. Will emit an update event`);
                this.emit("update", this);
            } else {
                log.trace("Remote subplebbit received a new update with no new information");
                this._setUpdatingState("succeeded");
            }
        }
    }

    async update() {
        if (this._updateInterval || this._sync) return; // No need to do anything if subplebbit is already updating

        this._setState("updating");
        const updateLoop = (async () => {
            if (this._updateInterval) this.updateOnce().finally(() => setTimeout(updateLoop, this._updateIntervalMs));
        }).bind(this);

        this.updateOnce().finally(() => (this._updateInterval = setTimeout(updateLoop, this._updateIntervalMs)));
    }

    private pubsubTopicWithfallback() {
        return this.pubsubTopic || this.address;
    }

    async stop() {
        this._updateInterval = clearTimeout(this._updateInterval);
        this._loadingOperation?.stop();
        this._setUpdatingState("stopped");
        if (this._sync) {
            await this._clientsManager
                .getCurrentPubsub()
                ._client.pubsub.unsubscribe(this.pubsubTopicWithfallback(), this.handleChallengeExchange);
            await this.dbHandler.rollbackAllTransactions();
            await this.dbHandler.unlockSubStart();
            this._sync = false;
            this._syncInterval = clearInterval(this._syncInterval);
            this._setStartedState("stopped");
        }
        if (this.dbHandler) await this.dbHandler.destoryConnection();

        this._setState("stopped");
    }

    private async _validateLocalSignature(newSignature: SignatureType, record: Omit<SubplebbitIpfsType, "signature">) {
        const ipnsRecord: SubplebbitIpfsType = JSON.parse(JSON.stringify({ ...record, signature: newSignature })); // stringify it so it would be of the same content as IPNS or pubsub
        const signatureValidation = await verifySubplebbit(ipnsRecord, this.plebbit);
        assert.equal(
            signatureValidation.valid,
            true,
            `Failed to validate subplebbit (${this.address}) local signature due to reason (${signatureValidation.reason})`
        );
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

        const statsCid = (await this._clientsManager.getCurrentIpfs()._client.add(deterministicStringify(stats))).path;

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
        await this._validateLocalSignature(signature, newIpns);
        await this.initSubplebbit({ ...newIpns, signature });
        this._subplebbitUpdateTrigger = false;

        await this._updateDbInternalState(
            lodash.pick(this.toJSONInternal(), ["posts", "lastPostCid", "statsCid", "updatedAt", "signature", "_subplebbitUpdateTrigger"])
        );

        const file = await this._clientsManager.getCurrentIpfs()._client.add(deterministicStringify({ ...newIpns, signature }));
        const publishRes = await this._clientsManager.getCurrentIpfs()._client.name.publish(file.path, {
            key: this.signer.ipnsKeyName,
            allowOffline: Boolean(process.env["TESTING"])
        });
        this.emit("update", this);
        log(
            `Published a new IPNS record for sub(${this.address}) on IPNS (${publishRes.name}) that points to file (${publishRes.value}) with updatedAt (${this.updatedAt})`
        );
    }

    private async handleCommentEdit(commentEditRaw: CommentEditPubsubMessage, challengeRequestId: string): Promise<string | undefined> {
        const log = Logger("plebbit-js:subplebbit:handleCommentEdit");

        const validRes = await verifyCommentEdit(commentEditRaw, this.plebbit, false);

        if (!validRes.valid) {
            log(`(${challengeRequestId}): `, validRes.reason);
            return validRes.reason;
        }

        const commentEdit = await this.plebbit.createCommentEdit(commentEditRaw);

        const commentToBeEdited = await this.dbHandler.queryComment(commentEdit.commentCid, undefined);
        const editorAddress = await getPlebbitAddressFromPublicKey(commentEdit.signature.publicKey);
        const modRole = this.roles && this.roles[commentEdit.author.address];
        if (commentEdit.signature.publicKey === commentToBeEdited.signature.publicKey) {
            // CommentEdit is signed by original author
            for (const editField of Object.keys(removeKeysWithUndefinedValues(commentEdit.toJSON()))) {
                if (!AUTHOR_EDIT_FIELDS.includes(<any>editField)) {
                    const msg = messages.ERR_SUB_COMMENT_EDIT_AUTHOR_INVALID_FIELD;
                    log(`(${challengeRequestId}): `, msg);
                    return msg;
                }
            }

            await this.dbHandler.insertEdit(commentEdit.toJSONForDb(challengeRequestId));
            log.trace(`(${challengeRequestId}): `, `Updated comment (${commentEdit.commentCid}) with CommentEdit: `, commentEdit.toJSON());
        } else if (modRole) {
            log.trace(
                `(${challengeRequestId}): `,
                `${modRole.role} (${editorAddress}) is attempting to CommentEdit ${commentToBeEdited?.cid} with CommentEdit: `,
                commentEdit.toJSON()
            );

            for (const editField of Object.keys(removeKeysWithUndefinedValues(commentEdit.toJSON()))) {
                if (!MOD_EDIT_FIELDS.includes(<any>editField)) {
                    const msg = messages.ERR_SUB_COMMENT_EDIT_MOD_INVALID_FIELD;
                    log(`(${challengeRequestId}): `, msg);
                    return msg;
                }
            }

            if (typeof commentEdit.locked === "boolean" && commentToBeEdited.depth !== 0) {
                const msg = messages.ERR_SUB_COMMENT_EDIT_CAN_NOT_LOCK_REPLY;
                log(`(${challengeRequestId}): `, msg);
                return msg;
            }

            await this.dbHandler.insertEdit(commentEdit.toJSONForDb(challengeRequestId));
        } else {
            // CommentEdit is signed by someone who's not the original author or a mod. Reject it
            // Editor has no subplebbit role like owner, moderator or admin, and their signer is not the signer used in the original comment
            const msg = `Editor (non-mod) - (${editorAddress}) attempted to edit a comment (${commentEdit.commentCid}) without having original author keys.`;
            log(`(${challengeRequestId}): `, msg);
            return messages.ERR_UNAUTHORIZED_COMMENT_EDIT;
        }
    }

    private async handleVote(newVoteProps: VoteType, challengeRequestId: string): Promise<undefined | string> {
        const log = Logger("plebbit-js:subplebbit:handleVote");

        const lastVote = await this.dbHandler.getLastVoteOfAuthor(newVoteProps.commentCid, newVoteProps.author.address);

        const validRes = await verifyVote(newVoteProps, this.plebbit, false);
        if (!validRes.valid) {
            log(`(${challengeRequestId}): `, validRes.reason);
            return validRes.reason;
        }

        if (lastVote && newVoteProps.signature.publicKey !== lastVote.signature.publicKey) {
            const msg = `Author (${newVoteProps.author.address}) attempted to change vote on (${newVoteProps.commentCid}) without having correct credentials`;
            log(`(${challengeRequestId}): `, msg);
            return msg;
        } else {
            const newVote = await this.plebbit.createVote(newVoteProps);
            await this.dbHandler.deleteVote(newVote.author.address, newVote.commentCid);
            await this.dbHandler.insertVote(newVote.toJSONForDb(challengeRequestId));
            log.trace(`(${challengeRequestId}): `, `inserted new vote (${newVote.vote}) for comment ${newVote.commentCid}`);
        }
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

    private async storePublicationIfValid(
        publication: DecryptedChallengeRequestMessageType["publication"],
        challengeRequestId: string
    ): Promise<CommentIpfsWithCid | string | undefined> {
        const log = Logger("plebbit-js:subplebbit:handleChallengeExchange:storePublicationIfValid");

        delete this._challengeToSolution[challengeRequestId];
        delete this._challengeToPublication[challengeRequestId];
        delete this._challengeToPublicKey[challengeRequestId];

        if (publication["signer"]) {
            log(`(${challengeRequestId}): `, messages.ERR_FORBIDDEN_SIGNER_FIELD);
            return messages.ERR_FORBIDDEN_SIGNER_FIELD;
        }

        log.trace(`(${challengeRequestId}): `, `Will attempt to store publication if valid, `, publication);

        if (publication.subplebbitAddress !== this.address) {
            log(`(${challengeRequestId}): `, messages.ERR_PUBLICATION_INVALID_SUBPLEBBIT_ADDRESS);
            return messages.ERR_PUBLICATION_INVALID_SUBPLEBBIT_ADDRESS;
        }
        if (publication?.author?.address) {
            // Check if author is banned
            const authorModEdits = await this.dbHandler.queryAuthorModEdits(publication.author.address);
            if (typeof authorModEdits.banExpiresAt === "number" && authorModEdits.banExpiresAt > timestamp()) {
                log(`(${challengeRequestId}): `, messages.ERR_AUTHOR_IS_BANNED);
                return messages.ERR_AUTHOR_IS_BANNED;
            }
        } else {
            const msg = `Rejecting publication because it doesn't have author.address`;
            log(`(${challengeRequestId}): `, msg);
            return msg;
        }

        const forbiddenAuthorFields: (keyof Author)[] = ["subplebbit", "shortAddress"];

        if (Object.keys(publication.author).some((key: keyof Author) => forbiddenAuthorFields.includes(key))) {
            log(`(${challengeRequestId}): `, messages.ERR_FORBIDDEN_AUTHOR_FIELD);
            return messages.ERR_FORBIDDEN_AUTHOR_FIELD;
        }

        if (!this.isPublicationPost(publication)) {
            const parentCid: string | undefined = this.isPublicationReply(publication)
                ? publication["parentCid"]
                : this.isPublicationVote(publication) || this.isPublicationCommentEdit(publication)
                ? publication["commentCid"]
                : undefined;

            if (!parentCid) {
                log(`(${challengeRequestId}): `, messages.ERR_SUB_COMMENT_PARENT_CID_NOT_DEFINED);
                return messages.ERR_SUB_COMMENT_PARENT_CID_NOT_DEFINED;
            }

            const parent = await this.dbHandler.queryComment(parentCid);
            if (!parent) {
                log(`(${challengeRequestId}): `, messages.ERR_SUB_COMMENT_PARENT_DOES_NOT_EXIST);
                return messages.ERR_SUB_COMMENT_PARENT_DOES_NOT_EXIST;
            }

            const parentFlags = await this.dbHandler.queryCommentFlags(parentCid);

            if (parentFlags.removed && !this.isPublicationCommentEdit(publication)) {
                log(`(${challengeRequestId}): `, messages.ERR_SUB_PUBLICATION_PARENT_HAS_BEEN_REMOVED);
                return messages.ERR_SUB_PUBLICATION_PARENT_HAS_BEEN_REMOVED;
            }

            const isParentDeleted = await this.dbHandler.queryAuthorEditDeleted(parentCid);

            if (isParentDeleted && !this.isPublicationCommentEdit(publication)) {
                log(`(${challengeRequestId}): `, messages.ERR_SUB_PUBLICATION_PARENT_HAS_BEEN_DELETED);
                return messages.ERR_SUB_PUBLICATION_PARENT_HAS_BEEN_DELETED;
            }

            const postFlags = await this.dbHandler.queryCommentFlags(parent.postCid);

            if (postFlags.removed && !this.isPublicationCommentEdit(publication)) {
                log(`(${challengeRequestId}): `, messages.ERR_SUB_PUBLICATION_POST_HAS_BEEN_REMOVED);
                return messages.ERR_SUB_PUBLICATION_POST_HAS_BEEN_REMOVED;
            }

            const isPostDeleted = await this.dbHandler.queryAuthorEditDeleted(parent.postCid);

            if (isPostDeleted && !this.isPublicationCommentEdit(publication)) {
                log(`(${challengeRequestId}): `, messages.ERR_SUB_PUBLICATION_POST_HAS_BEEN_DELETED);
                return messages.ERR_SUB_PUBLICATION_POST_HAS_BEEN_DELETED;
            }

            if (postFlags.locked && !this.isPublicationCommentEdit(publication)) {
                log(`(${challengeRequestId}): `, messages.ERR_SUB_PUBLICATION_POST_IS_LOCKED);
                return messages.ERR_SUB_PUBLICATION_POST_IS_LOCKED;
            }

            if (parent.timestamp > publication.timestamp) {
                log(`(${challengeRequestId}): `, messages.ERR_SUB_COMMENT_TIMESTAMP_IS_EARLIER_THAN_PARENT);
                return messages.ERR_SUB_COMMENT_TIMESTAMP_IS_EARLIER_THAN_PARENT;
            }
        }

        if (this.isPublicationVote(publication)) return this.handleVote(<VoteType>publication, challengeRequestId);
        else if (this.isPublicationCommentEdit(publication))
            return this.handleCommentEdit(<CommentEditPubsubMessage>publication, challengeRequestId);
        else if (this.isPublicationComment(publication)) {
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

            if (Object.keys(publication).some((key: keyof CommentType) => forbiddenCommentFields.includes(key))) {
                log(`(${challengeRequestId}): `, messages.ERR_FORBIDDEN_COMMENT_FIELD);
                return messages.ERR_FORBIDDEN_COMMENT_FIELD;
            }

            const validRes = await verifyComment(publication, this.plebbit, false);

            if (!validRes.valid) {
                log(`(${challengeRequestId}): `, validRes.reason);
                return validRes.reason;
            }

            // Comment and Post need to add file to ipfs
            const ipnsKeyName = sha256(deterministicStringify(publication));

            if (await this.dbHandler.querySigner(ipnsKeyName)) {
                log(`(${challengeRequestId}): `, messages.ERR_DUPLICATE_COMMENT);
                return messages.ERR_DUPLICATE_COMMENT;
            }

            const commentToInsert = await this.plebbit.createComment(publication);

            if (commentToInsert.link && this.settings?.fetchThumbnailUrls)
                commentToInsert.thumbnailUrl = await getThumbnailUrlOfLink(commentToInsert.link, this.settings.fetchThumbnailUrlsProxyUrl);

            const ipfsSigner = await this.plebbit.createSigner();
            ipfsSigner.ipnsKeyName = ipnsKeyName;
            await this.dbHandler.insertSigner(ipfsSigner.toJSONSignersTableRow(), undefined);
            ipfsSigner.ipfsKey = new Uint8Array(await getIpfsKeyFromPrivateKey(ipfsSigner.privateKey));
            commentToInsert.setCommentIpnsKey(
                await nativeFunctions.importSignerIntoIpfsNode(ipfsSigner.ipnsKeyName, ipfsSigner.ipfsKey, this.plebbit)
            );

            if (commentToInsert instanceof Post) {
                const trx = await this.dbHandler.createTransaction(challengeRequestId);
                commentToInsert.setPreviousCid((await this.dbHandler.queryLatestPostCid(trx))?.cid);
                await this.dbHandler.commitTransaction(challengeRequestId);
                commentToInsert.setDepth(0);
                const file = await this._clientsManager.getCurrentIpfs()._client.add(deterministicStringify(commentToInsert.toJSONIpfs()));
                commentToInsert.setPostCid(file.path);
                commentToInsert.setCid(file.path);

                await this.dbHandler.insertComment(commentToInsert.toJSONCommentsTableRowInsert(challengeRequestId));

                log(`(${challengeRequestId}): `, `New post with cid ${commentToInsert.cid} has been inserted into DB`);
            } else if (commentToInsert instanceof Comment) {
                // Comment
                const trx = await this.dbHandler.createTransaction(challengeRequestId);
                const [commentsUnderParent, parent] = await Promise.all([
                    this.dbHandler.queryCommentsUnderComment(commentToInsert.parentCid, trx),
                    this.dbHandler.queryComment(commentToInsert.parentCid, trx)
                ]);
                await this.dbHandler.commitTransaction(challengeRequestId);
                commentToInsert.setPreviousCid(commentsUnderParent[0]?.cid);
                commentToInsert.setDepth(parent.depth + 1);
                commentToInsert.setPostCid(parent.postCid);
                const file = await this._clientsManager.getCurrentIpfs()._client.add(deterministicStringify(commentToInsert.toJSONIpfs()));
                commentToInsert.setCid(file.path);
                await this.dbHandler.insertComment(commentToInsert.toJSONCommentsTableRowInsert(challengeRequestId));

                log(`(${challengeRequestId}): `, `New comment with cid ${commentToInsert.cid} has been inserted into DB`);
            }
            return commentToInsert.toJSONAfterChallengeVerification();
        }
    }

    private async _decryptOrRespondWithFailure(
        request: ChallengeRequestMessage | ChallengeAnswerMessage
    ): Promise<DecryptedChallengeRequestMessageType | DecryptedChallengeAnswerMessageType | undefined> {
        let decrypted: any | undefined;
        try {
            decrypted = await decrypt(
                request.type === "CHALLENGEANSWER" ? request.encryptedChallengeAnswers : request.encryptedPublication,
                this.signer.privateKey,
                request.signature.publicKey
            );
        } catch {
            const toSignMsg: Omit<ChallengeVerificationMessageType, "signature"> = {
                type: "CHALLENGEVERIFICATION",
                challengeRequestId: request.challengeRequestId,
                challengeAnswerId: request["challengeAnswerId"],
                challengeSuccess: false,
                reason: messages.ERR_SUB_FAILED_TO_DECRYPT_PUBSUB_MSG,
                userAgent: env.USER_AGENT,
                protocolVersion: env.PROTOCOL_VERSION,
                timestamp: timestamp()
            };
            const challengeVerification = new ChallengeVerificationMessage({
                ...toSignMsg,
                signature: await signChallengeVerification(toSignMsg, this.signer)
            });

            await Promise.all([
                this.dbHandler.insertChallengeVerification(challengeVerification.toJSONForDb(), undefined),
                this._clientsManager.pubsubPublish(this.pubsubTopicWithfallback(), deterministicStringify(challengeVerification))
            ]);
        }

        if (decrypted && request.type === "CHALLENGEREQUEST") return { ...request, publication: JSON.parse(decrypted) };
        else if (decrypted && request.type === "CHALLENGEANSWER") return { ...request, challengeAnswers: JSON.parse(decrypted) };
        return undefined;
    }

    private async handleChallengeRequest(request: ChallengeRequestMessage) {
        const log = Logger("plebbit-js:subplebbit:handleChallengeRequest");

        const decryptedRequest = <DecryptedChallengeRequestMessageType>await this._decryptOrRespondWithFailure(request);
        if (!decryptedRequest) return;
        this._challengeToPublication[request.challengeRequestId] = decryptedRequest.publication;
        this._challengeToPublicKey[request.challengeRequestId] = decryptedRequest.signature.publicKey;
        await this.dbHandler.insertChallengeRequest(request.toJSONForDb(), undefined);
        this.emit("challengerequest", decryptedRequest);
        const [providedChallenges, reasonForSkippingCaptcha] = await this.provideCaptchaCallback(decryptedRequest);
        log(`Received a request to a challenge (${request.challengeRequestId})`);
        if (providedChallenges.length === 0) {
            // Subplebbit owner has chosen to skip challenging this user or post
            log.trace(`(${request.challengeRequestId}): No challenge is required`);

            const publicationOrReason = await this.storePublicationIfValid(decryptedRequest.publication, request.challengeRequestId);
            const encryptedPublication = lodash.isPlainObject(publicationOrReason)
                ? await encrypt(deterministicStringify(publicationOrReason), this.signer.privateKey, request.signature.publicKey)
                : undefined;

            const toSignMsg: Omit<ChallengeVerificationMessageType, "signature"> = {
                type: "CHALLENGEVERIFICATION",
                challengeRequestId: request.challengeRequestId,
                challengeAnswerId: undefined,
                challengeSuccess: typeof publicationOrReason !== "string",
                reason: typeof publicationOrReason === "string" ? publicationOrReason : reasonForSkippingCaptcha,
                encryptedPublication: encryptedPublication,
                challengeErrors: undefined,
                userAgent: env.USER_AGENT,
                protocolVersion: env.PROTOCOL_VERSION,
                timestamp: timestamp()
            };
            const challengeVerification = new ChallengeVerificationMessage({
                ...toSignMsg,
                signature: await signChallengeVerification(toSignMsg, this.signer)
            });

            await Promise.all([
                this.dbHandler.insertChallengeVerification(challengeVerification.toJSONForDb(), undefined),
                this._clientsManager.pubsubPublish(this.pubsubTopicWithfallback(), deterministicStringify(challengeVerification))
            ]);
            log(
                `(${request.challengeRequestId}): `,
                `Published ${challengeVerification.type} over pubsub: `,
                lodash.omit(toSignMsg, ["encryptedPublication"])
            );
            this.emit("challengeverification", {
                ...challengeVerification,
                publication: typeof publicationOrReason === "string" ? undefined : publicationOrReason
            });
        } else {
            const toSignChallenge: Omit<ChallengeMessageType, "signature"> = {
                type: "CHALLENGE",
                protocolVersion: env.PROTOCOL_VERSION,
                userAgent: env.USER_AGENT,
                challengeRequestId: request.challengeRequestId,
                encryptedChallenges: await encrypt(
                    deterministicStringify(providedChallenges),
                    this.signer.privateKey,
                    request.signature.publicKey
                ),
                timestamp: timestamp()
            };

            const challengeMessage = new ChallengeMessage({
                ...toSignChallenge,
                signature: await signChallengeMessage(toSignChallenge, this.signer)
            });

            const challengeTypes = providedChallenges.map((challenge) => challenge.type);
            await Promise.all([
                this.dbHandler.insertChallenge(challengeMessage.toJSONForDb(challengeTypes), undefined),
                this._clientsManager.pubsubPublish(this.pubsubTopicWithfallback(), deterministicStringify(challengeMessage))
            ]);
            log.trace(
                `(${request.challengeRequestId}): `,
                `Published ${challengeMessage.type} over pubsub: `,
                lodash.omit(toSignChallenge, ["encryptedChallenges"])
            );
            this.emit("challengemessage", { ...challengeMessage, challenges: providedChallenges });
        }
    }

    async handleChallengeAnswer(challengeAnswer: ChallengeAnswerMessage) {
        const log = Logger("plebbit-js:subplebbit:handleChallengeAnswer");

        const decryptedChallengeAnswer = <DecryptedChallengeAnswerMessageType>await this._decryptOrRespondWithFailure(challengeAnswer);
        if (!decryptedChallengeAnswer) return;

        await this.dbHandler.insertChallengeAnswer(challengeAnswer.toJSONForDb(decryptedChallengeAnswer.challengeAnswers), undefined);
        this.emit("challengeanswer", decryptedChallengeAnswer);

        const [challengeSuccess, challengeErrors] = await this.validateCaptchaAnswerCallback(decryptedChallengeAnswer);
        if (challengeSuccess) {
            log.trace(`(${challengeAnswer.challengeRequestId}): `, `User has been answered correctly`);
            const storedPublication = this._challengeToPublication[challengeAnswer.challengeRequestId];

            const publicationOrReason = await this.storePublicationIfValid(storedPublication, challengeAnswer.challengeRequestId); // could contain "publication" or "reason"
            const encryptedPublication = lodash.isPlainObject(publicationOrReason)
                ? await encrypt(deterministicStringify(publicationOrReason), this.signer.privateKey, challengeAnswer.signature.publicKey)
                : undefined;

            const toSignMsg: Omit<ChallengeVerificationMessageType, "signature"> = {
                type: "CHALLENGEVERIFICATION",
                challengeRequestId: challengeAnswer.challengeRequestId,
                challengeAnswerId: challengeAnswer.challengeAnswerId,
                challengeSuccess: typeof publicationOrReason !== "string",
                reason: typeof publicationOrReason === "string" ? publicationOrReason : undefined,
                encryptedPublication: encryptedPublication,
                challengeErrors: challengeErrors,
                userAgent: env.USER_AGENT,
                protocolVersion: env.PROTOCOL_VERSION,
                timestamp: timestamp()
            };
            const challengeVerification = new ChallengeVerificationMessage({
                ...toSignMsg,
                signature: await signChallengeVerification(toSignMsg, this.signer)
            });

            await Promise.all([
                this.dbHandler.insertChallengeVerification(challengeVerification.toJSONForDb(), undefined),
                this._clientsManager.pubsubPublish(this.pubsubTopicWithfallback(), deterministicStringify(challengeVerification))
            ]);
            log(
                `(${challengeAnswer.challengeRequestId}): `,
                `Published ${challengeVerification.type} over pubsub:`,
                lodash.omit(toSignMsg, ["encryptedPublication"])
            );
            this.emit("challengeverification", {
                ...challengeVerification,
                publication: encryptedPublication ? <CommentIpfsWithCid>publicationOrReason : undefined
            });
        } else {
            log.trace(`Challenge (${challengeAnswer.challengeRequestId}) has been answered incorrectly`);
            const toSignVerification: Omit<ChallengeVerificationMessageType, "signature"> = {
                type: "CHALLENGEVERIFICATION",
                challengeRequestId: challengeAnswer.challengeRequestId,
                challengeAnswerId: challengeAnswer.challengeAnswerId,
                challengeSuccess: challengeSuccess,
                challengeErrors: challengeErrors,
                userAgent: env.USER_AGENT,
                protocolVersion: env.PROTOCOL_VERSION,
                timestamp: timestamp()
            };

            const challengeVerification = new ChallengeVerificationMessage({
                ...toSignVerification,
                signature: await signChallengeVerification(toSignVerification, this.signer)
            });

            await Promise.all([
                this.dbHandler.insertChallengeVerification(challengeVerification.toJSONForDb(), undefined),
                this._clientsManager.pubsubPublish(this.pubsubTopicWithfallback(), deterministicStringify(challengeVerification))
            ]);
            log(`(${challengeAnswer.challengeRequestId}): `, `Published ${challengeVerification.type} over pubsub:`, toSignVerification);
            this.emit("challengeverification", challengeVerification);
        }
    }

    private async _verifyPubsubMsgSignature(msgParsed: ChallengeRequestMessageType | ChallengeAnswerMessageType) {
        const validation =
            msgParsed.type === "CHALLENGEANSWER" ? await verifyChallengeAnswer(msgParsed) : await verifyChallengeRequest(msgParsed);
        if (!validation.valid) {
            const toSignVerification: Omit<ChallengeVerificationMessageType, "signature"> = {
                type: "CHALLENGEVERIFICATION",
                challengeRequestId: msgParsed.challengeRequestId,
                challengeAnswerId: msgParsed["challengeAnswerId"],
                challengeSuccess: false,
                reason: validation.reason,
                userAgent: env.USER_AGENT,
                protocolVersion: env.PROTOCOL_VERSION,
                timestamp: timestamp()
            };

            const challengeVerification = new ChallengeVerificationMessage({
                ...toSignVerification,
                signature: await signChallengeVerification(toSignVerification, this.signer)
            });

            await this._clientsManager.pubsubPublish(this.pubsubTopicWithfallback(), deterministicStringify(challengeVerification));

            const err = new PlebbitError("ERR_SIGNATURE_IS_INVALID", { pubsubMsg: msgParsed, signatureValidity: validation });
            this.emit("error", err);
            throw err;
        }
    }

    private async handleChallengeExchange(pubsubMsg) {
        const log = Logger("plebbit-js:subplebbit:handleChallengeExchange");

        let msgParsed: ChallengeRequestMessageType | ChallengeAnswerMessageType | undefined;
        try {
            msgParsed = <ChallengeRequestMessageType | ChallengeAnswerMessageType>JSON.parse(uint8ArrayToString(pubsubMsg.data));

            if (msgParsed.type === "CHALLENGEREQUEST") {
                await this._verifyPubsubMsgSignature(msgParsed);
                await this.handleChallengeRequest(new ChallengeRequestMessage(msgParsed));
            } else if (msgParsed.type === "CHALLENGEANSWER" && this._challengeToPublication[msgParsed.challengeRequestId]) {
                // Only reply to peers who started a challenge request earlier
                await this._verifyPubsubMsgSignature(msgParsed);
                if (msgParsed.signature.publicKey !== this._challengeToPublicKey[msgParsed.challengeRequestId]) return;
                await this.handleChallengeAnswer(new ChallengeAnswerMessage(msgParsed));
            }
        } catch (e) {
            e.message = `failed process captcha for challenge request id (${msgParsed?.challengeRequestId}): ${e.message}`;
            log.error(`(${msgParsed?.challengeRequestId}): `, String(e));
            if (msgParsed?.challengeRequestId) await this.dbHandler.rollbackTransaction(msgParsed?.challengeRequestId);
        }
    }

    private async defaultProvideCaptcha(request: DecryptedChallengeRequestMessageType): Promise<[ChallengeType[], string | undefined]> {
        // Return question, type
        // Expected return is:
        // captcha, reason for skipping captcha (if it's skipped by nullifying captcha)
        const { image, text } = await nativeFunctions.createImageCaptcha(300, 100);
        this._challengeToSolution[request.challengeRequestId] = [text];
        return [[{ challenge: image, type: "image/png" }], undefined];
    }

    private async defaultValidateCaptcha(answerMessage: DecryptedChallengeAnswerMessageType): Promise<[boolean, string[] | undefined]> {
        const log = Logger("plebbit-js:subplebbit:validateCaptcha");

        const actualSolution = this._challengeToSolution[answerMessage.challengeRequestId];
        const answerIsCorrect = lodash.isEqual(answerMessage.challengeAnswers, actualSolution);
        log(
            `(${answerMessage?.challengeRequestId}): `,
            `Answer's validity: ${answerIsCorrect}, user's answer: ${answerMessage.challengeAnswers}, actual solution: ${actualSolution}`
        );
        const challengeErrors = answerIsCorrect ? undefined : ["User solved captcha incorrectly"];
        return [answerIsCorrect, challengeErrors];
    }

    private async _publishCommentIpns(dbComment: Pick<CommentType, "ipnsKeyName" | "cid">, options: CommentUpdate) {
        const signerRaw = await this.dbHandler.querySigner(dbComment.ipnsKeyName);

        if (!signerRaw) throw Error(`Comment ${dbComment.cid} IPNS signer is not stored in DB`);
        await this._importSignerIntoIpfsIfNeeded(signerRaw);
        const file = await this._clientsManager.getCurrentIpfs()._client.add(deterministicStringify(options));
        await this._clientsManager.getCurrentIpfs()._client.name.publish(file.path, {
            key: signerRaw.ipnsKeyName,
            allowOffline: Boolean(process.env["TESTING"])
        });
    }

    private async _validateCommentUpdate(update: CommentUpdate, comment: Pick<CommentWithCommentUpdate, "cid" | "signature">) {
        const simUpdate = JSON.parse(deterministicStringify(update)); // We need to stringify the update, so it will have the same shape as if it were sent by pubsub or IPNS
        const signatureValidity = await verifyCommentUpdate(simUpdate, this, comment, this.plebbit);
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
        await this._validateCommentUpdate(newIpns, comment); // Should be removed once signature are working properly
        await this.dbHandler.upsertCommentUpdate(newIpns);

        await this._publishCommentIpns(comment, newIpns);
    }

    private async _listenToIncomingRequests() {
        const log = Logger("plebbit-js:subplebbit:sync");
        // Make sure subplebbit listens to pubsub topic
        const subscribedTopics = await this._clientsManager.getCurrentPubsub()._client.pubsub.ls();
        if (!subscribedTopics.includes(this.pubsubTopicWithfallback())) {
            await this._clientsManager.pubsubUnsubscribe(this.pubsubTopicWithfallback(), this.handleChallengeExchange); // Make sure it's not hanging
            await this._clientsManager.pubsubSubscribe(this.pubsubTopicWithfallback(), this.handleChallengeExchange);
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
        const commentsToUpdate = await this.dbHandler!.queryCommentsToBeUpdated(this._ipfsNodeIpnsKeyNames, trx);
        await this.dbHandler.commitTransaction("_updateCommentsThatNeedToBeUpdated");
        if (commentsToUpdate.length === 0) return;

        this._subplebbitUpdateTrigger = true;

        log(`Will update ${commentsToUpdate.length} comments in this update loop for subplebbit (${this.address})`);

        const commentsGroupedByDepth = lodash.groupBy(commentsToUpdate, "depth");

        const depthsKeySorted = Object.keys(commentsGroupedByDepth).sort((a, b) => Number(b) - Number(a)); // Make sure comments with higher depths are sorted first

        for (const depthKey of depthsKeySorted) await Promise.all(commentsGroupedByDepth[depthKey].map(this._updateComment.bind(this)));
    }

    private async _repinCommentsIPFSIfNeeded() {
        const log = Logger("plebbit-js:subplebbit:sync");
        const dbCommentsCids = await this.dbHandler.queryAllCommentsCid();
        const pinnedCids = (await this._clientsManager.getCurrentIpfs()._client.pin.ls()).map((cid) => cid.cid.toString());

        const unpinnedCommentsCids = lodash.difference(dbCommentsCids, pinnedCids);

        if (unpinnedCommentsCids.length === 0) return;

        log.trace(`There are ${unpinnedCommentsCids.length} comments that need to be repinned`);

        const unpinnedComments = await Promise.all(
            (await this.dbHandler.queryCommentsByCids(unpinnedCommentsCids)).map((dbRes) => this.plebbit.createComment(dbRes))
        );

        await Promise.all(
            unpinnedComments.map(async (comment) => {
                const commentIpfsContent = deterministicStringify(comment.toJSONIpfs());
                const contentHash: string = await Hash.of(commentIpfsContent);

                assert.equal(contentHash, comment.cid);

                await this._clientsManager.getCurrentIpfs()._client.add(commentIpfsContent, { pin: true });
            })
        );

        log(`${unpinnedComments.length} comments' IPFS have been repinned`);
    }

    private async syncIpnsWithDb() {
        const log = Logger("plebbit-js:subplebbit:sync");
        await this._switchDbIfNeeded();

        try {
            await this._mergeInstanceStateWithDbState({});
            this._ipfsNodeIpnsKeyNames = (await this._clientsManager.getCurrentIpfs()._client.key.list()).map((key) => key.name);
            await this._listenToIncomingRequests();
            this._setStartedState("publishing-ipns");
            await Promise.all([this._updateCommentsThatNeedToBeUpdated(), this._repinCommentsIPFSIfNeeded()]);
            await this.updateSubplebbitIpnsIfNeeded();
            this._setStartedState("succeeded");
        } catch (e) {
            this._setStartedState("failed");
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

        if (!this.signer?.address) throwWithErrorCode("ERR_SUB_SIGNER_NOT_DEFINED");
        if (!this._clientsManager.getCurrentIpfs())
            throwWithErrorCode("ERR_CAN_NOT_RUN_A_SUB_WITH_NO_IPFS_NODE", { ipfsHttpClientOptions: this.plebbit.ipfsHttpClientsOptions });

        await this.dbHandler.initDestroyedConnection();

        await this.dbHandler.lockSubStart(); // Will throw if sub is locked already
        this._sync = true;
        await this.dbHandler.initDbIfNeeded();

        // Import subplebbit keys onto ipfs node

        await this._importSignerIntoIpfsIfNeeded({ ipnsKeyName: this.signer.ipnsKeyName, privateKey: this.signer.privateKey });

        if (!this.provideCaptchaCallback) {
            log("Subplebbit owner has not provided any captcha. Will go with default image captcha");
            this.provideCaptchaCallback = this.defaultProvideCaptcha;
            this.validateCaptchaAnswerCallback = this.defaultValidateCaptcha;
        }

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
            .then(() => this._syncLoop(this._syncIntervalMs))
            .catch((reason) => {
                log.error(reason);
                this.emit("error", reason);
            });
    }

    async delete() {
        await this.stop();
        if (typeof this.plebbit.dataPath !== "string")
            throwWithErrorCode("ERR_DATA_PATH_IS_NOT_DEFINED", { plebbitDataPath: this.plebbit.dataPath });

        const ipfsClient = this._clientsManager.getCurrentIpfs();
        if (!ipfsClient) throw Error("Ipfs client is not defined");

        await nativeFunctions.deleteSubplebbit(this.address, this.plebbit.dataPath);
        if (typeof this.signer?.ipnsKeyName === "string")
            // Key may not exist on ipfs node
            try {
                await ipfsClient._client.key.rm(this.signer.ipnsKeyName);
            } catch {}
    }
}
