import { toString as uint8ArrayToString } from "uint8arrays/to-string";
import EventEmitter from "events";
import { sha256 } from "js-sha256";
import { fromString as uint8ArrayFromString } from "uint8arrays/from-string";
import { ChallengeAnswerMessage, ChallengeMessage, ChallengeRequestMessage, ChallengeVerificationMessage } from "./challenge";
import { SortHandler } from "./sort-handler";
import { encode, loadIpnsAsJson, parsePagesIfIpfs, removeKeysWithUndefinedValues, throwWithErrorCode, timestamp } from "./util";
import { decrypt, encrypt, Signer } from "./signer";
import { Pages } from "./pages";
import { Plebbit } from "./plebbit";

import {
    AuthorTypeWithCommentUpdate,
    ChallengeAnswerMessageType,
    ChallengeMessageType,
    ChallengeRequestMessageType,
    ChallengeType,
    ChallengeVerificationMessageType,
    CommentEditType,
    CommentPubsubMessage,
    CommentsTableRow,
    CommentType,
    CommentUpdate,
    CommentUpdatesRow,
    CommentWithCommentUpdate,
    DbHandlerPublicAPI,
    DecryptedChallengeAnswerMessageType,
    DecryptedChallengeRequestMessageType,
    Flair,
    FlairOwner,
    PagesType,
    PagesTypeIpfs,
    ProtocolVersion,
    SignatureType,
    SignerType,
    SubplebbitEditOptions,
    SubplebbitEncryption,
    SubplebbitFeatures,
    SubplebbitIpfsType,
    SubplebbitMetrics,
    SubplebbitRole,
    SubplebbitSuggested,
    SubplebbitType,
    VotePubsubMessage,
    VoteType
} from "./types";
import { Comment } from "./comment";
import Vote from "./vote";
import Post from "./post";
import {
    getIpfsKeyFromPrivateKey,
    getPlebbitAddressFromPrivateKey,
    getPlebbitAddressFromPublicKey,
    getPublicKeyFromPrivateKey
} from "./signer/util";
import { v4 as uuidv4 } from "uuid";
import { AUTHOR_EDIT_FIELDS, CommentEdit, MOD_EDIT_FIELDS } from "./comment-edit";
import errcode from "err-code";
import { messages } from "./errors";
import Logger from "@plebbit/plebbit-logger";
import { nativeFunctions } from "./runtime/node/util";
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

const DEFAULT_UPDATE_INTERVAL_MS = 60000;
const DEFAULT_SYNC_INTERVAL_MS = 100000; // 1.67 minutes

export class Subplebbit extends EventEmitter implements SubplebbitType {
    // public
    title?: string;
    description?: string;
    roles?: { [authorAddress: string]: SubplebbitRole };
    lastPostCid?: string;
    posts: Pages;
    pubsubTopic: string;
    challengeTypes?: ChallengeType[];
    metrics?: SubplebbitMetrics;
    features?: SubplebbitFeatures;
    suggested?: SubplebbitSuggested;
    flairs?: Record<FlairOwner, Flair[]>;
    address: string;
    metricsCid?: string;
    createdAt: number;
    updatedAt: number;
    signer?: Signer;
    encryption: SubplebbitEncryption;
    protocolVersion: ProtocolVersion; // semantic version of the protocol https://semver.org/
    signature: SignatureType; // signature of the Subplebbit update by the sub owner to protect against malicious gateway
    rules?: string[];

    plebbit: Plebbit;
    dbHandler?: DbHandlerPublicAPI;

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
    private ipfsNodeIpnsKeyNames: string[];
    private subplebbitUpdateTrigger: boolean;

    constructor(plebbit: Plebbit) {
        super();
        this.plebbit = plebbit;
        this._challengeToSolution = {}; // Map challenge ID to its solution
        this._challengeToPublication = {}; // To hold unpublished posts/comments/votes
        this._challengeToPublicKey = {}; // Map out challenge request id to their signers

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
    }

    async initSubplebbit(newProps: SubplebbitType | SubplebbitEditOptions | SubplebbitIpfsType) {
        const oldProps = this.toJSONInternal();
        const mergedProps = { ...oldProps, ...newProps };
        this.title = mergedProps.title;
        this.description = mergedProps.description;
        this.lastPostCid = mergedProps.lastPostCid;
        this.address = mergedProps.address;
        this.pubsubTopic = mergedProps.pubsubTopic;
        this.challengeTypes = mergedProps.challengeTypes;
        this.metricsCid = mergedProps.metricsCid;
        this.createdAt = mergedProps.createdAt;
        this.updatedAt = mergedProps.updatedAt;
        this.encryption = mergedProps.encryption;
        this.roles = mergedProps.roles;
        this.features = mergedProps.features;
        this.suggested = mergedProps.suggested;
        this.rules = mergedProps.rules;
        this.flairs = mergedProps.flairs;
        this.signature = mergedProps.signature;
        this.subplebbitUpdateTrigger = mergedProps.subplebbitUpdateTrigger;
        if (!this.signer && mergedProps.signer) this.signer = new Signer(mergedProps.signer);

        await this._setPosts(mergedProps.posts);
    }

    async _setPosts(newPosts: PagesType | PagesTypeIpfs) {
        const parsedPages = await parsePagesIfIpfs(newPosts, this.plebbit);
        this.posts = new Pages({
            pages: parsedPages?.pages || {},
            pageCids: parsedPages?.pageCids || {},
            subplebbit: lodash.pick(this, ["address", "plebbit", "encryption"]),
            parentCid: undefined
        });
    }

    private async _initSignerProps() {
        if (!this.signer?.ipfsKey?.byteLength || this.signer?.ipfsKey?.byteLength <= 0)
            this.signer.ipfsKey = new Uint8Array(await getIpfsKeyFromPrivateKey(this.signer.privateKey));
        if (!this.signer.ipnsKeyName) this.signer.ipnsKeyName = this.signer.address;
        if (!this.signer.publicKey) this.signer.publicKey = await getPublicKeyFromPrivateKey(this.signer.privateKey);
        if (!this.signer.address) this.signer.address = await getPlebbitAddressFromPrivateKey(this.signer.privateKey);

        this.encryption = {
            type: "aes-cbc",
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
            this.sortHandler = new SortHandler({ address: this.address, plebbit: this.plebbit, dbHandler: this.dbHandler });
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

    toJSONInternal() {
        return {
            ...this.toJSON(),
            signer: this.signer ? lodash.pick(this.signer, ["privateKey", "type", "address"]) : undefined,
            subplebbitUpdateTrigger: this.subplebbitUpdateTrigger
        };
    }

    toJSON(): SubplebbitType {
        return {
            title: this.title,
            description: this.description,
            lastPostCid: this.lastPostCid,
            pubsubTopic: this.pubsubTopic,
            address: this.address,
            posts: this.posts?.toJSON(),
            challengeTypes: this.challengeTypes,
            metricsCid: this.metricsCid,
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

    private async _importSignerIntoIpfsIfNeeded(signer: Required<Pick<SignerType, "ipnsKeyName" | "privateKey">>) {
        assert(signer.ipnsKeyName);
        if (!this.ipfsNodeIpnsKeyNames) this.ipfsNodeIpnsKeyNames = (await this.plebbit.ipfsClient.key.list()).map((key) => key.name);

        const keyExistsInNode = this.ipfsNodeIpnsKeyNames.some((key) => key === signer.ipnsKeyName);
        if (!keyExistsInNode) {
            const ipfsKey = new Uint8Array(await getIpfsKeyFromPrivateKey(signer.privateKey));
            await nativeFunctions.importSignerIntoIpfsNode(signer.ipnsKeyName, ipfsKey, this.plebbit);
        }
    }

    // TODO rename and make this private
    async prePublish() {
        const log = Logger("plebbit-js:subplebbit:prePublish");

        await this.initDbHandlerIfNeeded();
        await this.dbHandler.lockSubCreation();
        await this.dbHandler.initDbIfNeeded();

        const internalStateKey = CACHE_KEYS[CACHE_KEYS.INTERNAL_SUBPLEBBIT];

        if (await this.dbHandler.keyvHas(internalStateKey)) {
            log(`Merging internal subplebbit state from DB and createSubplebbitOptions`);
            await this._mergeInstanceStateWithDbState(removeKeysWithUndefinedValues(this.toJSONInternal()));
        }

        if (!this.signer) throw Error(`subplebbit.signer needs to be defined before proceeding`);
        await this._initSignerProps();

        if (
            !(await this.dbHandler.keyvHas(internalStateKey)) ||
            encode(this.toJSONInternal()) !== encode(await this._getDbInternalState())
        ) {
            log(`Updating the internal state of subplebbit in DB with createSubplebbitOptions`);
            await this._updateDbInternalState(this.toJSONInternal());
        }

        await this.dbHandler.unlockSubCreation();
    }

    private async assertDomainResolvesCorrectly(domain: string) {
        if (this.plebbit.resolver.isDomain(domain)) {
            const resolvedAddress = await this.plebbit.resolver.resolveSubplebbitAddressIfNeeded(domain);
            const derivedAddress = await getPlebbitAddressFromPublicKey(this.encryption.publicKey);
            if (resolvedAddress !== derivedAddress)
                throwWithErrorCode(
                    "ERR_ENS_SUB_ADDRESS_TXT_RECORD_POINT_TO_DIFFERENT_ADDRESS",
                    `subplebbit.address (${this.address}), resolved address (${resolvedAddress}), subplebbit.signer.address (${this.signer?.address})`
                );
        }
    }

    async edit(newSubplebbitOptions: SubplebbitEditOptions): Promise<Subplebbit> {
        const log = Logger("plebbit-js:subplebbit:edit");

        if (newSubplebbitOptions.address && newSubplebbitOptions.address !== this.address) {
            this.assertDomainResolvesCorrectly(newSubplebbitOptions.address).catch((err) => {
                const editError = errcode(err, err.code, { details: `subplebbit.edit: ${err.details}` });
                log.error(editError);
                this.emit("error", editError);
            });
            log(`Attempting to edit subplebbit.address from ${this.address} to ${newSubplebbitOptions.address}`);
            await this._updateDbInternalState(lodash.pick(newSubplebbitOptions, "address"));
            await this.dbHandler.keyvDelete(CACHE_KEYS[CACHE_KEYS.POSTS_SUBPLEBBIT]); // To trigger a new subplebbit.posts
            await this.dbHandler.changeDbFilename(newSubplebbitOptions.address, {
                address: newSubplebbitOptions.address,
                plebbit: {
                    dataPath: this.plebbit.dataPath
                }
            });
            await this._switchDbIfNeeded();
        }

        await this._updateDbInternalState(lodash.omit(newSubplebbitOptions, "address"));
        this.initSubplebbit(lodash.omit(newSubplebbitOptions, "address"));

        log(`Subplebbit (${this.address}) props (${Object.keys(newSubplebbitOptions)}) has been edited`);

        return this;
    }

    private async updateOnce() {
        const log = Logger("plebbit-js:subplebbit:update");

        if (this.dbHandler) {
            // Local sub
            const subState: SubplebbitType = await this.dbHandler.keyvGet(CACHE_KEYS[CACHE_KEYS.INTERNAL_SUBPLEBBIT]);

            if (encode(this.toJSONInternal()) !== encode(subState)) {
                log(`Remote Subplebbit received a new update. Will emit an update event`);
                this.initSubplebbit(subState);
                this.emit("update", this);
            }
        } else {
            if (this.plebbit.resolver.isDomain(this.address))
                try {
                    await this.assertDomainResolvesCorrectly(this.address);
                } catch (e) {
                    const updateError = errcode(e, e.code, { details: `subplebbit.update: ${e.details}` });
                    log.error(updateError);
                    this.emit("error", updateError);
                    return;
                }

            const ipnsAddress = await this.plebbit.resolver.resolveSubplebbitAddressIfNeeded(this.address);
            let subplebbitIpns: SubplebbitIpfsType;

            try {
                subplebbitIpns = await loadIpnsAsJson(ipnsAddress, this.plebbit);
            } catch (e) {
                log.error(`Failed to load subplebbit IPNS, error:`, e);
                this.emit("error", e);
                return;
            }
            const updateValidity = await verifySubplebbit(subplebbitIpns, this.plebbit);
            if (!updateValidity.valid) {
                log.error(`Subplebbit update's signature is invalid. Error is '${updateValidity.reason}'`);
                this.emit("error", `Subplebbit update's signature is invalid. Error is '${updateValidity.reason}'`);
            } else if (encode(this.toJSON()) !== encode(subplebbitIpns)) {
                this.initSubplebbit(subplebbitIpns);
                log(`Remote Subplebbit received a new update. Will emit an update event`);
                this.emit("update", this);
            }
        }
    }

    async update() {
        if (this._updateInterval || this._sync) return; // No need to do anything if subplebbit is already updating

        const updateLoop = async () => {
            if (this._updateInterval) {
                await this.updateOnce();
                setTimeout(updateLoop, this._updateIntervalMs);
            }
        };
        this.updateOnce().then(() => {
            this._updateInterval = setTimeout(updateLoop.bind(this), this._updateIntervalMs);
        });
    }

    async stop() {
        this._updateInterval = clearInterval(this._updateInterval);
        if (this._sync) {
            this._sync = false;

            this._syncInterval = clearInterval(this._syncInterval);

            await this.plebbit.pubsubIpfsClient.pubsub.unsubscribe(this.pubsubTopic, this.handleChallengeExchange);
            await this.dbHandler.unlockSubStart();
        }
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
    private async updateSubplebbitIpns() {
        const log = Logger("plebbit-js:subplebbit:sync");

        const trx: any = await this.dbHandler.createTransaction("subplebbit");
        const latestPost = await this.dbHandler.queryLatestPostCid(trx);
        await this.dbHandler.commitTransaction("subplebbit");

        const [metrics, subplebbitPosts] = await Promise.all([
            this.dbHandler.querySubplebbitMetrics(undefined),
            this.sortHandler.generateSubplebbitPosts(undefined)
        ]);

        const metricsCid = (await this.plebbit.ipfsClient.add(encode(metrics))).path;

        await this._mergeInstanceStateWithDbState({});

        const lastPublishTooOld = this.updatedAt < timestamp() - 60 * 15; // Publish a subplebbit record every 15 minutes at least

        if (this.subplebbitUpdateTrigger || lastPublishTooOld) {
            const updatedAt = timestamp();
            const newIpns: Omit<SubplebbitIpfsType, "signature"> = {
                ...lodash.omit(this.toJSON(), "signature"),
                lastPostCid: latestPost?.cid,
                metricsCid,
                updatedAt,
                posts: subplebbitPosts
            };
            const signature = await signSubplebbit(newIpns, this.signer);
            await this._validateLocalSignature(signature, newIpns);
            await this.initSubplebbit({ ...newIpns, signature });
            this.subplebbitUpdateTrigger = false;

            await this._updateDbInternalState(
                lodash.pick(this.toJSONInternal(), [
                    "posts",
                    "lastPostCid",
                    "metricsCid",
                    "updatedAt",
                    "signature",
                    "subplebbitUpdateTrigger"
                ])
            );

            const file = await this.plebbit.ipfsClient.add(encode({ ...newIpns, signature }));
            await this.plebbit.ipfsClient.name.publish(file.path, {
                lifetime: "72h", // TODO decide on optimal time later
                key: this.signer.ipnsKeyName,
                allowOffline: true
            });
            this.emit("update", this);
            log.trace(`Published a new IPNS record for sub(${this.address})`);
        }
    }

    private async handleCommentEdit(commentEdit: CommentEdit, challengeRequestId: string) {
        const log = Logger("plebbit-js:subplebbit:handleCommentEdit");

        const validRes = await verifyCommentEdit(commentEdit, this.plebbit, false);

        if (!validRes.valid) {
            log(`(${challengeRequestId}): `, validRes.reason);
            return validRes.reason;
        }

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

            const trx = await this.dbHandler.createTransaction(challengeRequestId);

            await this.dbHandler.insertEdit(commentEdit.toJSONForDb(challengeRequestId), trx);
            await this.dbHandler.setCommentUpdateTrigger(commentEdit.commentCid, true, trx);
            await this.dbHandler.commitTransaction(challengeRequestId);
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

            const trx = await this.dbHandler.createTransaction(challengeRequestId);
            await this.dbHandler.insertEdit(commentEdit.toJSONForDb(challengeRequestId), trx);
            if (commentEdit.commentAuthor) {
                // Need to trigger comment update for all comments of author to ensure new author props are included
                const authorComments = await this.dbHandler.queryCommentsOfAuthor(commentToBeEdited.authorAddress);
                await Promise.all(authorComments.map((comment) => this.dbHandler.setCommentUpdateTrigger(comment.cid, true, trx)));
            } else await this.dbHandler.setCommentUpdateTrigger(commentEdit.commentCid, true, trx);
            await this.dbHandler.commitTransaction(challengeRequestId);
        } else {
            // CommentEdit is signed by someone who's not the original author or a mod. Reject it
            // Editor has no subplebbit role like owner, moderator or admin, and their signer is not the signer used in the original comment
            const msg = `Editor (non-mod) - (${editorAddress}) attempted to edit a comment (${commentEdit.commentCid}) without having original author keys.`;
            log(`(${challengeRequestId}): `, msg);
            return messages.ERR_UNAUTHORIZED_COMMENT_EDIT;
        }
    }

    private async handleVote(newVoteProps: VoteType, challengeRequestId: string) {
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
            const trx = await this.dbHandler.createTransaction(challengeRequestId);
            await this.dbHandler.upsertVote(newVote.toJSONForDb(challengeRequestId), trx);
            await this.dbHandler.setCommentUpdateTrigger(newVoteProps.commentCid, true, trx);
            await this.dbHandler.commitTransaction(challengeRequestId);

            log.trace(`(${challengeRequestId}): `, `Upserted new vote (${newVote.vote}) for comment ${newVote.commentCid}`);
        }
    }

    private async storePublicationIfValid(
        publication: DecryptedChallengeRequestMessageType["publication"],
        challengeRequestId: string
    ): Promise<Vote | CommentEdit | Post | Comment | string> {
        const log = Logger("plebbit-js:subplebbit:handleChallengeExchange:storePublicationIfValid");

        delete this._challengeToSolution[challengeRequestId];
        delete this._challengeToPublication[challengeRequestId];
        delete this._challengeToPublicKey[challengeRequestId];

        if (publication["signer"]) {
            log(`(${challengeRequestId}): `, messages.ERR_FORBIDDEN_SIGNER_FIELD);
            return messages.ERR_FORBIDDEN_SIGNER_FIELD;
        }

        log.trace(`(${challengeRequestId}): `, `Will attempt to store publication if valid, `, publication);

        // TODO get rid of postOrCommentOrVote here
        const postOrCommentOrVote: Vote | CommentEdit | Post | Comment = publication.hasOwnProperty("vote")
            ? await this.plebbit.createVote(<VotePubsubMessage>publication)
            : publication["commentCid"]
            ? await this.plebbit.createCommentEdit(<CommentEditType>publication)
            : await this.plebbit.createComment(<CommentPubsubMessage>publication);

        if (postOrCommentOrVote.subplebbitAddress !== this.address) {
            log(`(${challengeRequestId}): `, messages.ERR_PUBLICATION_INVALID_SUBPLEBBIT_ADDRESS);
            return messages.ERR_PUBLICATION_INVALID_SUBPLEBBIT_ADDRESS;
        }
        if (postOrCommentOrVote?.author?.address) {
            // Check if author is banned
            const authorModEdits = await this.dbHandler.queryAuthorModEdits(postOrCommentOrVote.author.address);
            if (typeof authorModEdits.banExpiresAt === "number" && authorModEdits.banExpiresAt > timestamp()) {
                log(`(${challengeRequestId}): `, messages.ERR_AUTHOR_IS_BANNED);
                return messages.ERR_AUTHOR_IS_BANNED;
            }
        } else {
            const msg = `Rejecting ${postOrCommentOrVote.constructor.name} because it doesn't have author.address`;
            log(`(${challengeRequestId}): `, msg);
            return msg;
        }

        const forbiddenAuthorFields: (keyof AuthorTypeWithCommentUpdate)[] = ["subplebbit"];

        if (Object.keys(publication.author).some((key: keyof AuthorTypeWithCommentUpdate) => forbiddenAuthorFields.includes(key))) {
            log(`(${challengeRequestId}): `, messages.ERR_FORBIDDEN_AUTHOR_FIELD);
            return messages.ERR_FORBIDDEN_AUTHOR_FIELD;
        }

        if (!(postOrCommentOrVote instanceof Post)) {
            const parentCid: string | undefined =
                postOrCommentOrVote instanceof Comment
                    ? postOrCommentOrVote.parentCid
                    : postOrCommentOrVote instanceof Vote || postOrCommentOrVote instanceof CommentEdit
                    ? postOrCommentOrVote.commentCid
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

            if (parentFlags.removed && !(postOrCommentOrVote instanceof CommentEdit)) {
                log(`(${challengeRequestId}): `, messages.ERR_SUB_PUBLICATION_PARENT_HAS_BEEN_REMOVED);
                return messages.ERR_SUB_PUBLICATION_PARENT_HAS_BEEN_REMOVED;
            }

            const isParentDeleted = await this.dbHandler.queryAuthorEditDeleted(parentCid);

            if (isParentDeleted && !(postOrCommentOrVote instanceof CommentEdit)) {
                log(`(${challengeRequestId}): `, messages.ERR_SUB_PUBLICATION_PARENT_HAS_BEEN_DELETED);
                return messages.ERR_SUB_PUBLICATION_PARENT_HAS_BEEN_DELETED;
            }

            const post = await this.dbHandler.queryComment(parent.postCid);
            const postFlags = await this.dbHandler.queryCommentFlags(parent.postCid);

            if (postFlags.removed && !(postOrCommentOrVote instanceof CommentEdit)) {
                log(`(${challengeRequestId}): `, messages.ERR_SUB_PUBLICATION_POST_HAS_BEEN_REMOVED);
                return messages.ERR_SUB_PUBLICATION_POST_HAS_BEEN_REMOVED;
            }

            const isPostDeleted = await this.dbHandler.queryAuthorEditDeleted(parent.postCid);

            if (isPostDeleted && !(postOrCommentOrVote instanceof CommentEdit)) {
                log(`(${challengeRequestId}): `, messages.ERR_SUB_PUBLICATION_POST_HAS_BEEN_DELETED);
                return messages.ERR_SUB_PUBLICATION_POST_HAS_BEEN_DELETED;
            }

            if (postFlags.locked && !(postOrCommentOrVote instanceof CommentEdit)) {
                log(`(${challengeRequestId}): `, messages.ERR_SUB_PUBLICATION_POST_IS_LOCKED);
                return messages.ERR_SUB_PUBLICATION_POST_IS_LOCKED;
            }

            if (parent.timestamp > postOrCommentOrVote.timestamp) {
                log(`(${challengeRequestId}): `, messages.ERR_SUB_COMMENT_TIMESTAMP_IS_EARLIER_THAN_PARENT);
                return messages.ERR_SUB_COMMENT_TIMESTAMP_IS_EARLIER_THAN_PARENT;
            }
        }

        if (postOrCommentOrVote instanceof Vote) {
            const res = await this.handleVote(<VoteType>publication, challengeRequestId);
            if (res) return res;
        } else if (postOrCommentOrVote instanceof CommentEdit) {
            const res = await this.handleCommentEdit(postOrCommentOrVote, challengeRequestId);
            if (res) return res;
        } else if (postOrCommentOrVote instanceof Comment) {
            const forbiddenCommentFields: (keyof CommentType | "deleted")[] = [
                "cid",
                "signer",
                "ipnsKeyName",
                "previousCid",
                "ipnsName",
                "depth",
                "postCid",
                "original",
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
                "reason"
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
            const ipnsKeyName = sha256(encode(publication));

            if (await this.dbHandler.querySigner(ipnsKeyName)) {
                log(`(${challengeRequestId}): `, messages.ERR_DUPLICATE_COMMENT);
                return messages.ERR_DUPLICATE_COMMENT;
            }

            const ipfsSigner = await this.plebbit.createSigner();
            ipfsSigner.ipnsKeyName = ipnsKeyName;
            await this.dbHandler.insertSigner(ipfsSigner.toJSONSignersTableRow(), undefined);
            ipfsSigner.ipfsKey = new Uint8Array(await getIpfsKeyFromPrivateKey(ipfsSigner.privateKey));
            postOrCommentOrVote.setCommentIpnsKey(
                await nativeFunctions.importSignerIntoIpfsNode(ipfsSigner.ipnsKeyName, ipfsSigner.ipfsKey, this.plebbit)
            );

            if (postOrCommentOrVote instanceof Post) {
                const trx = await this.dbHandler.createTransaction(challengeRequestId);
                postOrCommentOrVote.setPreviousCid((await this.dbHandler.queryLatestPostCid(trx))?.cid);
                postOrCommentOrVote.setDepth(0);
                const file = await this.plebbit.ipfsClient.add(encode(postOrCommentOrVote.toJSONIpfs()));
                postOrCommentOrVote.setPostCid(file.path);
                postOrCommentOrVote.setCid(file.path);

                await this.dbHandler.insertComment(postOrCommentOrVote.toJSONCommentsTableRowInsert(challengeRequestId), trx);
                await this.dbHandler.commitTransaction(challengeRequestId);

                postOrCommentOrVote.ipnsKeyName = undefined; // so that ipnsKeyName and original would not be included in ChallengeVerification
                log(`(${challengeRequestId}): `, `New post with cid ${postOrCommentOrVote.cid} has been inserted into DB`);
            } else if (postOrCommentOrVote instanceof Comment) {
                // Comment
                const trx = await this.dbHandler.createTransaction(challengeRequestId);
                const [commentsUnderParent, parent] = await Promise.all([
                    this.dbHandler.queryCommentsUnderComment(postOrCommentOrVote.parentCid, trx),
                    this.dbHandler.queryComment(postOrCommentOrVote.parentCid, trx)
                ]);
                postOrCommentOrVote.setPreviousCid(commentsUnderParent[0]?.cid);
                postOrCommentOrVote.setDepth(parent.depth + 1);
                postOrCommentOrVote.setPostCid(parent.postCid);
                const file = await this.plebbit.ipfsClient.add(encode(postOrCommentOrVote.toJSONIpfs()));
                postOrCommentOrVote.setCid(file.path);

                await this.dbHandler.insertComment(postOrCommentOrVote.toJSONCommentsTableRowInsert(challengeRequestId), trx);
                await this.dbHandler.setCommentUpdateTrigger(postOrCommentOrVote.parentCid, true, trx);

                await this.dbHandler.commitTransaction(challengeRequestId);

                postOrCommentOrVote.ipnsKeyName = undefined; // so that ipnsKeyName would not be included in ChallengeVerification
                log(`(${challengeRequestId}): `, `New comment with cid ${postOrCommentOrVote.cid} has been inserted into DB`);
            }
        }

        return postOrCommentOrVote;
    }

    private async handleChallengeRequest(request: ChallengeRequestMessage) {
        const log = Logger("plebbit-js:subplebbit:handleChallengeRequest");

        const decryptedRequest: DecryptedChallengeRequestMessageType = {
            ...request,
            publication: JSON.parse(await decrypt(request.encryptedPublication, this.signer.privateKey, request.signature.publicKey))
        };
        this._challengeToPublication[request.challengeRequestId] = decryptedRequest.publication;
        this._challengeToPublicKey[request.challengeRequestId] = decryptedRequest.signature.publicKey;
        this.emit("challengerequest", decryptedRequest);
        const [providedChallenges, reasonForSkippingCaptcha] = await this.provideCaptchaCallback(decryptedRequest);
        log(`Received a request to a challenge (${request.challengeRequestId})`);
        if (providedChallenges.length === 0) {
            // Subplebbit owner has chosen to skip challenging this user or post
            log.trace(`(${request.challengeRequestId}): No challenge is required`);
            await this.dbHandler.insertChallengeRequest(request.toJSONForDb(), undefined);

            const publicationOrReason = await this.storePublicationIfValid(decryptedRequest.publication, request.challengeRequestId);
            const encryptedPublication =
                typeof publicationOrReason !== "string"
                    ? await encrypt(
                          encode(publicationOrReason.toJSONAfterChallengeVerification()),
                          this.signer.privateKey,
                          request.signature.publicKey
                      )
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
                protocolVersion: env.PROTOCOL_VERSION
            };
            const challengeVerification = new ChallengeVerificationMessage({
                ...toSignMsg,
                signature: await signChallengeVerification(toSignMsg, this.signer)
            });

            await Promise.all([
                this.dbHandler.insertChallengeVerification(challengeVerification.toJSONForDb(), undefined),
                this.plebbit.pubsubIpfsClient.pubsub.publish(this.pubsubTopic, uint8ArrayFromString(encode(challengeVerification)))
            ]);
            log(
                `(${request.challengeRequestId}): `,
                `Published ${challengeVerification.type} over pubsub: `,
                lodash.omit(toSignMsg, ["encryptedPublication"])
            );
            this.emit("challengeverification", { ...challengeVerification, publication: decryptedRequest.publication });
        } else {
            const toSignChallenge: Omit<ChallengeMessageType, "signature"> = {
                type: "CHALLENGE",
                protocolVersion: env.PROTOCOL_VERSION,
                userAgent: env.USER_AGENT,
                challengeRequestId: request.challengeRequestId,
                encryptedChallenges: await encrypt(encode(providedChallenges), this.signer.privateKey, request.signature.publicKey)
            };

            const challengeMessage = new ChallengeMessage({
                ...toSignChallenge,
                signature: await signChallengeMessage(toSignChallenge, this.signer)
            });

            const challengeTypes = providedChallenges.map((challenge) => challenge.type);
            await Promise.all([
                this.dbHandler.insertChallenge(challengeMessage.toJSONForDb(challengeTypes), undefined),
                this.plebbit.pubsubIpfsClient.pubsub.publish(this.pubsubTopic, uint8ArrayFromString(encode(challengeMessage)))
            ]);
            log(
                `(${request.challengeRequestId}): `,
                `Published ${challengeMessage.type} over pubsub: `,
                lodash.omit(toSignChallenge, ["encryptedChallenges"])
            );
            this.emit("challengemessage", { ...challengeMessage, challenges: providedChallenges });
        }
    }

    async handleChallengeAnswer(challengeAnswer: ChallengeAnswerMessage) {
        const log = Logger("plebbit-js:subplebbit:handleChallengeAnswer");

        const decryptedAnswers: string[] = JSON.parse(
            await decrypt(challengeAnswer.encryptedChallengeAnswers, this.signer?.privateKey, challengeAnswer.signature.publicKey)
        );

        const decryptedChallengeAnswer: DecryptedChallengeAnswerMessageType = { ...challengeAnswer, challengeAnswers: decryptedAnswers };

        this.emit("challengeanswer", decryptedChallengeAnswer);

        const [challengeSuccess, challengeErrors] = await this.validateCaptchaAnswerCallback(decryptedChallengeAnswer);
        if (challengeSuccess) {
            log.trace(`(${challengeAnswer.challengeRequestId}): `, `User has been answered correctly`);
            const storedPublication = this._challengeToPublication[challengeAnswer.challengeRequestId];

            await this.dbHandler.insertChallengeAnswer(challengeAnswer.toJSONForDb(decryptedChallengeAnswer.challengeAnswers), undefined);
            const publicationOrReason = await this.storePublicationIfValid(storedPublication, challengeAnswer.challengeRequestId); // could contain "publication" or "reason"
            const encryptedPublication =
                typeof publicationOrReason !== "string"
                    ? await encrypt(
                          encode(publicationOrReason.toJSONAfterChallengeVerification()),
                          this.signer.privateKey,
                          challengeAnswer.signature.publicKey
                      )
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
                protocolVersion: env.PROTOCOL_VERSION
            };
            const challengeVerification = new ChallengeVerificationMessage({
                ...toSignMsg,
                signature: await signChallengeVerification(toSignMsg, this.signer)
            });

            await Promise.all([
                this.dbHandler.insertChallengeVerification(challengeVerification.toJSONForDb(), undefined),
                this.plebbit.pubsubIpfsClient.pubsub.publish(this.pubsubTopic, uint8ArrayFromString(encode(challengeVerification)))
            ]);
            log(
                `(${challengeAnswer.challengeRequestId}): `,
                `Published ${challengeVerification.type} over pubsub:`,
                lodash.omit(toSignMsg, ["encryptedPublication"])
            );
            this.emit("challengeverification", {
                ...challengeVerification,
                publication: encryptedPublication ? publicationOrReason : undefined
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
                protocolVersion: env.PROTOCOL_VERSION
            };

            const challengeVerification = new ChallengeVerificationMessage({
                ...toSignVerification,
                signature: await signChallengeVerification(toSignVerification, this.signer)
            });

            await Promise.all([
                this.dbHandler.insertChallengeVerification(challengeVerification.toJSONForDb(), undefined),
                this.plebbit.pubsubIpfsClient.pubsub.publish(this.pubsubTopic, uint8ArrayFromString(encode(challengeVerification)))
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
                protocolVersion: env.PROTOCOL_VERSION
            };

            const challengeVerification = new ChallengeVerificationMessage({
                ...toSignVerification,
                signature: await signChallengeVerification(toSignVerification, this.signer)
            });

            await this.plebbit.pubsubIpfsClient.pubsub.publish(this.pubsubTopic, uint8ArrayFromString(encode(challengeVerification)));

            const err = errcode(Error(messages.ERR_SIGNATURE_IS_INVALID), messages[messages.ERR_SIGNATURE_IS_INVALID], {
                details: `subplebbit.handleChallengeExchange: Failed to verify ${msgParsed.type}, Failed verification reason: ${validation.reason}`
            });
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
            log.error(`(${msgParsed?.challengeRequestId}): `, e);
            if (msgParsed?.challengeRequestId) await this.dbHandler.rollbackTransaction(msgParsed?.challengeRequestId);
        }
    }

    private async defaultProvideCaptcha(request: DecryptedChallengeRequestMessageType): Promise<[ChallengeType[], string | undefined]> {
        // Return question, type
        // Expected return is:
        // captcha, reason for skipping captcha (if it's skipped by nullifying captcha)
        const { image, text } = await nativeFunctions.createImageCaptcha(300, 100);
        this._challengeToSolution[request.challengeRequestId] = [text];
        return [
            [
                {
                    challenge: image,
                    type: "image"
                }
            ],
            undefined
        ];
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
        const file = await this.plebbit.ipfsClient.add(encode(options));
        await this.plebbit.ipfsClient.name.publish(file.path, {
            lifetime: "72h",
            key: signerRaw.ipnsKeyName,
            allowOffline: true
        });
    }

    private async _validateCommentUpdate(update: CommentUpdate, comment: Pick<CommentWithCommentUpdate, "cid" | "signature">) {
        const simUpdate = JSON.parse(JSON.stringify(update)); // We need to stringify the update, so it will have the same shape as if it were sent by pubsub or IPNS
        const signatureValidity = await verifyCommentUpdate(simUpdate, this, comment, this.plebbit);
        assert(signatureValidity.valid, `Comment Update signature is invalid. Reason (${signatureValidity.reason})`);
    }

    private async _triggerParentsUpdate(parentCid: string, depth: number, trigger: boolean) {
        await this.dbHandler.setCommentUpdateTrigger(parentCid, trigger);
        const parents = await this.dbHandler.queryParentsOfComment({ parentCid, depth });
        await Promise.all(parents.map((parent) => this.dbHandler.setCommentUpdateTrigger(parent.cid, trigger)));
    }

    private async _updateComment(commentCid: string): Promise<void> {
        const log = Logger("plebbit-js:subplebbit:sync:syncComment");

        // If we're here that means we're gonna calculate the new update and publish it
        log.trace(`Attempting to update Comment (${commentCid})`);
        // This comment will have the local new CommentUpdate, which we will publish over IPNS
        // It includes new author.subplebbit as well as updated values in CommentUpdate (except for replies field)
        const commentWithUpdateRaw = await this.dbHandler!.queryCommentWithCommentUpdate(commentCid);

        await this.sortHandler.deleteCommentPageCache(commentWithUpdateRaw.comment);

        const commentUpdatePriorToSigning: Omit<CommentUpdate, "signature"> = {
            ...commentWithUpdateRaw.commentUpdate,
            replies: await this.sortHandler.generateRepliesPages(commentWithUpdateRaw.comment, undefined),
            updatedAt: timestamp(),
            protocolVersion: version.PROTOCOL_VERSION
        };
        const newIpns: CommentUpdate = {
            ...commentUpdatePriorToSigning,
            signature: await signCommentUpdate(commentUpdatePriorToSigning, this.signer)
        };
        await this._validateCommentUpdate(newIpns, commentWithUpdateRaw.comment);
        await this.dbHandler.upsertCommentUpdate(newIpns); // Need to insert comment in DB before generating pages so props updated above would be included in pages

        await this.dbHandler.setCommentUpdateTrigger(commentWithUpdateRaw.comment.cid, false);

        await this._triggerParentsUpdate(commentWithUpdateRaw.comment.parentCid, commentWithUpdateRaw.comment.depth, true);

        this.subplebbitUpdateTrigger = true;

        this._publishCommentIpns({ cid: commentWithUpdateRaw.comment.cid, ipnsKeyName: commentWithUpdateRaw.comment.ipnsKeyName }, newIpns);
    }

    private async _listenToIncomingRequests() {
        const log = Logger("plebbit-js:subplebbit:sync");
        // Make sure subplebbit listens to pubsub topic
        const subscribedTopics = await this.plebbit.pubsubIpfsClient.pubsub.ls();
        if (!subscribedTopics.includes(this.pubsubTopic)) {
            await this.plebbit.pubsubIpfsClient.pubsub.unsubscribe(this.pubsubTopic); // Make sure it's not hanging
            await this.plebbit.pubsubIpfsClient.pubsub.subscribe(this.pubsubTopic, this.handleChallengeExchange);
            log.trace(`Waiting for publications on pubsub topic (${this.pubsubTopic})`);
        }
    }

    private async _getDbInternalState() {
        await this.dbHandler.lockSubState();
        const internalState: SubplebbitType = await this.dbHandler.keyvGet(CACHE_KEYS[CACHE_KEYS.INTERNAL_SUBPLEBBIT]);
        await this.dbHandler.unlockSubState();
        return internalState;
    }

    private async _mergeInstanceStateWithDbState(overrideProps: Partial<SubplebbitType>) {
        this.initSubplebbit({ ...lodash.omit(await this._getDbInternalState(), "address"), ...overrideProps });
    }

    private async _switchDbIfNeeded() {
        const log = Logger("plebbit-js:subplebbit:sync");

        // Will check if address has been changed, and if so connect to the new db with the new address
        const internalState: SubplebbitType = await this.dbHandler.keyvGet(CACHE_KEYS[CACHE_KEYS.INTERNAL_SUBPLEBBIT]);
        const potentialNewAddresses = lodash.uniq([internalState.address, this.dbHandler.subAddress(), this.address]);

        if (this.dbHandler.isDbInMemory()) this.address = this.dbHandler.subAddress();
        else if (potentialNewAddresses.length > 1) {
            const wasSubRunning = (await Promise.all(potentialNewAddresses.map(this.dbHandler.isSubStartLocked))).some(Boolean);
            const newAddresses = potentialNewAddresses.filter((address) => this.dbHandler.subDbExists(address));
            if (newAddresses.length > 1) throw Error(`There are multiple dbs of the same sub`);
            const newAddress = newAddresses[0];
            log(`Updating to a new address (${newAddress}) `);
            await Promise.all(potentialNewAddresses.map(this.dbHandler.unlockSubStart));
            if (wasSubRunning) await this.dbHandler.lockSubStart(newAddress);
            this.address = newAddress;
            this.dbHandler = this.sortHandler = undefined;
            await this.initDbHandlerIfNeeded();
            await this.dbHandler.initDbIfNeeded();
        }
    }

    private async _getCommentCidsThatNeedToBeUpdated(): Promise<string[]> {
        // Criteria:
        // 1 - IPNS about to expire (every 72h) OR
        // 2 - an update trigger is on OR
        // 3 - Comment has no row in commentUpdates OR
        // 4 - comment.ipnsKeyName is not part of /key/list of IPFS RPC API

        const minimumUpdatedAt = timestamp() - 71 * 60 * 60; // Make sure a comment gets updated every 71 hours at least

        const cids = await this.dbHandler!.queryCommentsToBeUpdated({ minimumUpdatedAt, ipnsKeyNames: this.ipfsNodeIpnsKeyNames });

        return Object.values(cids).map((cidObj) => cidObj.cid);
    }

    private async syncIpnsWithDb() {
        const log = Logger("plebbit-js:subplebbit:sync");

        try {
            this.ipfsNodeIpnsKeyNames = (await this.plebbit.ipfsClient.key.list()).map((key) => key.name);
            await this._switchDbIfNeeded();
            await this._listenToIncomingRequests();
            const commentCidsToUpdate = await this._getCommentCidsThatNeedToBeUpdated();
            await Promise.all(commentCidsToUpdate.map(this._updateComment));
            await this.sortHandler.cacheCommentsPages();
            await this.updateSubplebbitIpns();
        } catch (e) {
            log.error(`Failed to sync due to error,`, e);
        }
    }

    private async _updateDbInternalState(props: Partial<SubplebbitType>) {
        if (Object.keys(props).length === 0) return;
        await this.dbHandler.lockSubState();
        const internalStateBefore: SubplebbitType = await this.dbHandler.keyvGet(CACHE_KEYS[CACHE_KEYS.INTERNAL_SUBPLEBBIT]);
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

        if (!this.signer?.address)
            throwWithErrorCode("ERR_SUB_SIGNER_NOT_DEFINED", `signer: ${JSON.stringify(this.signer)}, address: ${this.address}`);
        await this.initDbHandlerIfNeeded();
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
            this.pubsubTopic = lodash.clone(this.address);
            log(`Defaulted subplebbit (${this.address}) pubsub topic to ${this.pubsubTopic} since sub owner hasn't provided any`);
            await this._updateDbInternalState(lodash.pick(this, "pubsubTopic"));
        }
        if (typeof this.createdAt !== "number") {
            this.createdAt = timestamp();
            log(`Subplebbit (${this.address}) createdAt has been set to ${this.createdAt}`);
            await this._updateDbInternalState(lodash.pick(this, "createdAt"));
        }
        this.subplebbitUpdateTrigger = true;

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
            throwWithErrorCode("ERR_DATA_PATH_IS_NOT_DEFINED", `delete: plebbitOptions.dataPath=${this.plebbit.dataPath}`);
        if (!this.plebbit.ipfsClient) throw Error("Ipfs client is not defined");

        await nativeFunctions.deleteSubplebbit(this.address, this.plebbit.dataPath);
        const resolvedAddress = await this.plebbit.resolver.resolveSubplebbitAddressIfNeeded(this.address);
        try {
            await this.plebbit.ipfsClient.pin.rm(resolvedAddress);
        } catch (e) {
            if (!e.message.includes("not pinned")) throw e;
        }
        // block.rm requires CID.parse but it throws an error in Electron. Most likely due to context isolation
        //@ts-ignore
        await this.plebbit.ipfsClient.block.rm(resolvedAddress, { force: true });

        if (typeof this.signer?.ipnsKeyName === "string")
            // Key may not exist on ipfs node
            try {
                await this.plebbit.ipfsClient.key.rm(this.signer.ipnsKeyName);
            } catch {}
    }
}
