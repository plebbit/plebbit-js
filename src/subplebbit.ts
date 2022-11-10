import { toString as uint8ArrayToString } from "uint8arrays/to-string";
import EventEmitter from "events";
import { sha256 } from "js-sha256";
import { fromString as uint8ArrayFromString } from "uint8arrays/from-string";
import { ChallengeAnswerMessage, ChallengeMessage, ChallengeRequestMessage, ChallengeVerificationMessage } from "./challenge";
import { SortHandler } from "./sort-handler";
import { encode, loadIpnsAsJson, removeKeysWithUndefinedValues, timestamp } from "./util";
import { decrypt, encrypt, Signer } from "./signer";
import { Pages } from "./pages";
import { Plebbit } from "./plebbit";

import {
    AuthorDbType,
    ChallengeAnswerMessageType,
    ChallengeMessageType,
    ChallengeRequestMessageType,
    ChallengeType,
    ChallengeVerificationMessageType,
    CommentEditType,
    CommentType,
    CommentUpdate,
    CreateSubplebbitOptions,
    DbHandlerPublicAPI,
    DecryptedChallengeAnswerMessageType,
    DecryptedChallengeRequestMessageType,
    Flair,
    FlairOwner,
    ProtocolVersion,
    SignatureType,
    SubplebbitEditOptions,
    SubplebbitEncryption,
    SubplebbitFeatures,
    SubplebbitMetrics,
    SubplebbitRole,
    SubplebbitSuggested,
    SubplebbitType,
    VoteType
} from "./types";
import { Comment } from "./comment";
import Vote from "./vote";
import Post from "./post";
import { getPlebbitAddressFromPublicKeyPem } from "./signer/util";
import { v4 as uuidv4 } from "uuid";
import { AUTHOR_EDIT_FIELDS, CommentEdit, MOD_EDIT_FIELDS } from "./comment-edit";
import errcode from "err-code";
import { codes, messages } from "./errors";
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
    verifySubplebbit,
    verifyVote
} from "./signer/signatures";

const DEFAULT_UPDATE_INTERVAL_MS = 60000;
const DEFAULT_SYNC_INTERVAL_MS = 100000; // 1.67 minutes

export const RUNNING_SUBPLEBBITS: Record<string, boolean> = {};

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
    database?: any;

    // private

    private _challengeToSolution: Record<string, string[]>;
    private _challengeToPublication: Record<string, DecryptedChallengeRequestMessageType["publication"]>;
    private provideCaptchaCallback: (request: DecryptedChallengeRequestMessageType) => Promise<[ChallengeType[], string | undefined]>;
    private validateCaptchaAnswerCallback: (answerMessage: DecryptedChallengeAnswerMessageType) => Promise<[boolean, string[] | undefined]>;
    private ipnsKeyName?: string;
    private sortHandler: SortHandler;
    private _updateInterval?: any;
    private _updateIntervalMs: number;
    private _syncInterval?: any;
    private _syncIntervalMs: number; // How often should a sub publish a new IPNS
    private _sync: boolean;

    constructor(props: CreateSubplebbitOptions, plebbit: Plebbit) {
        super();
        this.plebbit = plebbit;
        this.initSubplebbit(props);
        this._challengeToSolution = {}; // Map challenge ID to its solution
        this._challengeToPublication = {}; // To hold unpublished posts/comments/votes
        this._sync = false;

        // these functions might get separated from their `this` when used
        this.start = this.start.bind(this);
        this.update = this.update.bind(this);
        this.stop = this.stop.bind(this);
        this.edit = this.edit.bind(this);

        this.on("error", (...args) => this.plebbit.emit("error", ...args));

        this._syncIntervalMs = DEFAULT_SYNC_INTERVAL_MS;
        this._updateIntervalMs = DEFAULT_UPDATE_INTERVAL_MS;
    }

    initSubplebbit(newProps: SubplebbitType | SubplebbitEditOptions) {
        const oldProps = this.toJSONInternal();
        const mergedProps = { ...oldProps, ...newProps };
        this.title = mergedProps.title;
        this.description = mergedProps.description;
        this.lastPostCid = mergedProps.lastPostCid;
        this.database = mergedProps.database;
        this.address = mergedProps.address;
        this.ipnsKeyName = mergedProps.ipnsKeyName;
        this.pubsubTopic = mergedProps.pubsubTopic;
        this.challengeTypes = mergedProps.challengeTypes;
        this.metricsCid = mergedProps.metricsCid;
        this.createdAt = mergedProps.createdAt;
        this.updatedAt = mergedProps.updatedAt;
        this.signer = mergedProps.signer;
        this.encryption = mergedProps.encryption;
        this.posts = new Pages({
            pages: mergedProps?.posts?.pages,
            pageCids: mergedProps?.posts?.pageCids,
            subplebbit: this
        });

        this.roles = mergedProps.roles;
        this.features = mergedProps.features;
        this.suggested = mergedProps.suggested;
        this.rules = mergedProps.rules;
        this.flairs = mergedProps.flairs;
        this.signature = mergedProps.signature;
    }

    private async initSignerIfNeeded() {
        const log = Logger("plebbit-js:subplebbit:prePublish");
        if (this.dbHandler) {
            const dbSigner = await this.dbHandler.querySubplebbitSigner(undefined);
            if (!dbSigner) {
                log.trace(`Subplebbit has no signer in DB, will insert provided signer from createSubplebbitOptions into DB`);
                await this.dbHandler.insertSigner(
                    {
                        ...this.signer,
                        ipnsKeyName: this.signer.address,
                        usage: "subplebbit"
                    },
                    undefined
                );
            } else if (!this.signer) {
                log.trace(`Subplebbit loaded signer from DB`);
                this.signer = dbSigner;
            }
        }

        if (typeof this.signer?.publicKey !== "string") throw Error("subplebbit.signer.publicKey is not defined");
        this.encryption = {
            type: "aes-cbc",
            publicKey: this.signer.publicKey
        };
    }

    private async initDbIfNeeded() {
        if (!this.dbHandler) {
            this.dbHandler = nativeFunctions.createDbHandler({
                address: this.address,
                database: this.database,
                plebbit: {
                    dataPath: this.plebbit.dataPath
                }
            });
        }
        await this.dbHandler.initDbIfNeeded();
        if (!this.sortHandler)
            this.sortHandler = new SortHandler({ address: this.address, plebbit: this.plebbit, dbHandler: this.dbHandler });
        await this.initSignerIfNeeded();
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
            ipnsKeyName: this.ipnsKeyName,
            database: this.database,
            signer: this.signer
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

    // TODO rename and make this private
    async prePublish() {
        // Import ipfs key into node (if not imported already)
        // Initialize signer
        // Initialize address (needs signer)
        // Initialize db (needs address)
        const log = Logger("plebbit-js:subplebbit:prePublish");

        if (!this.address && this.signer?.address) this.address = this.signer.address;
        await this.initDbIfNeeded();
        // import ipfs key into ipfs node

        let subplebbitIpfsNodeKey, error;
        try {
            subplebbitIpfsNodeKey = (await this.plebbit.ipfsClient.key.list()).filter((key) => key.name === this.signer.address)[0];
        } catch (e) {
            error = e;
        }
        if (error) throw Error(`Failed to list keys from ipfs node due to error: ${error}`);
        if (!this.signer) throw Error(`Failed to import subplebbit.signer into ipfs node since it's undefined`);
        if (!subplebbitIpfsNodeKey) {
            const ipfsKey = await nativeFunctions.importSignerIntoIpfsNode(
                { ...this.signer, ipnsKeyName: this.signer.address },
                this.plebbit
            );
            this.ipnsKeyName = ipfsKey.Name;
            log(`Imported subplebbit keys into ipfs node,`, ipfsKey);
        } else {
            log.trace(`Subplebbit key is already in ipfs node, no need to import key, `, subplebbitIpfsNodeKey);
            this.ipnsKeyName = subplebbitIpfsNodeKey["name"] || subplebbitIpfsNodeKey["Name"];
        }

        const cachedSubplebbit: SubplebbitType | undefined = await this.dbHandler?.keyvGet(this.address);
        if (cachedSubplebbit && JSON.stringify(cachedSubplebbit) !== "{}")
            this.initSubplebbit({ ...cachedSubplebbit, ...removeKeysWithUndefinedValues(this.toJSON()) }); // Init subplebbit fields from DB

        if (!lodash.isEqual(this.toJSON(), await this.dbHandler?.keyvGet(this.address)))
            await this.dbHandler?.keyvSet(this.address, this.toJSON());
    }

    private async assertDomainResolvesCorrectly(domain: string) {
        if (this.plebbit.resolver.isDomain(domain)) {
            const resolvedAddress = await this.plebbit.resolver.resolveSubplebbitAddressIfNeeded(domain);
            const derivedAddress = await getPlebbitAddressFromPublicKeyPem(this.encryption.publicKey);
            if (resolvedAddress !== derivedAddress)
                throw errcode(
                    Error(messages.ERR_ENS_SUB_ADDRESS_TXT_RECORD_POINT_TO_DIFFERENT_ADDRESS),
                    codes.ERR_ENS_SUB_ADDRESS_TXT_RECORD_POINT_TO_DIFFERENT_ADDRESS,
                    {
                        details: `subplebbit.address (${this.address}), resolved address (${resolvedAddress}), subplebbit.signer.address (${this.signer?.address})`
                    }
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
            log.trace(`Attempting to edit subplebbit.address from ${this.address} to ${newSubplebbitOptions.address}`);
            this.initSubplebbit(newSubplebbitOptions);
            await this.dbHandler.changeDbFilename(newSubplebbitOptions.address, {
                address: this.address,
                database: this.database,
                plebbit: {
                    dataPath: this.plebbit.dataPath
                }
            });
        }

        this.initSubplebbit(newSubplebbitOptions);

        log(`Subplebbit (${this.address}) props (${Object.keys(newSubplebbitOptions)}) has been edited`);
        await this.dbHandler.keyvSet(this.address, this.toJSON());

        return this;
    }

    private async updateOnce() {
        const log = Logger("plebbit-js:subplebbit:update");

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
        let subplebbitIpns: SubplebbitType;

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
        } else if (!lodash.isEqual(this.toJSON(), subplebbitIpns)) {
            this.initSubplebbit(subplebbitIpns);
            log(`Remote Subplebbit received a new update. Will emit an update event`);
            this.emit("update", this);
        }
    }

    async update() {
        if (this._updateInterval || this._sync) return; // No need to do anything if subplebbit is already updating
        this.updateOnce();
        this._updateInterval = setInterval(this.updateOnce.bind(this), this._updateIntervalMs);
    }

    async stop() {
        this._updateInterval = clearInterval(this._updateInterval);
        if (this._sync) {
            this.removeAllListeners();
            this._sync = false;

            this._syncInterval = clearInterval(this._syncInterval);

            await this.plebbit.pubsubIpfsClient.pubsub.unsubscribe(this.pubsubTopic);
            this.dbHandler?.destoryConnection();
            this.dbHandler = undefined;
            RUNNING_SUBPLEBBITS[this.signer.address] = false;
        }
    }

    private async updateSubplebbitIpns() {
        const log = Logger("plebbit-js:subplebbit:sync");

        const trx: any = await this.dbHandler.createTransaction("subplebbit");
        const latestPost = await this.dbHandler.queryLatestPost(trx);
        await this.dbHandler.commitTransaction("subplebbit");
        this.lastPostCid = latestPost?.cid;

        const [metrics, subplebbitPosts] = await Promise.all([
            this.dbHandler.querySubplebbitMetrics(undefined),
            this.sortHandler.generatePagesUnderComment(undefined, undefined)
        ]);
        const resolvedAddress = await this.plebbit.resolver.resolveSubplebbitAddressIfNeeded(this.address);
        let currentIpns: SubplebbitType | undefined;
        try {
            currentIpns = await loadIpnsAsJson(resolvedAddress, this.plebbit);
        } catch (e) {
            log(`${e}\n subplebbit IPNS (${resolvedAddress}) is not defined, will publish a new record`);
        }
        if (subplebbitPosts) {
            if (!subplebbitPosts?.pages?.hot) throw Error("Generated pages for subplebbit.posts is missing pages");
            this.posts = new Pages({
                pages: {
                    hot: subplebbitPosts.pages.hot
                },
                pageCids: subplebbitPosts.pageCids,
                subplebbit: this
            });
        }

        this.metricsCid = (await this.plebbit.ipfsClient.add(encode(metrics))).path;

        const lastPublishOverTwentyMinutes = this.updatedAt < timestamp() - 60 * 20;

        if (!currentIpns || !lodash.isEqual(currentIpns, this.toJSON()) || lastPublishOverTwentyMinutes) {
            this.updatedAt = timestamp();
            this.signature = await signSubplebbit(this.toJSON(), this.signer);
            const subIpnsCacheKey = sha256("ipns" + this.address);
            await this.dbHandler?.keyvSet(subIpnsCacheKey, this.toJSON());
            const file = await this.plebbit.ipfsClient.add(encode(this.toJSON()));
            await this.plebbit.ipfsClient.name.publish(file.path, {
                lifetime: "72h", // TODO decide on optimal time later
                key: this.ipnsKeyName,
                allowOffline: true
            });
            this.emit("update", this);
            log.trace(`Published a new IPNS record for sub(${this.address})`);
        }
    }

    private async handleCommentEdit(commentEdit: CommentEdit, challengeRequestId: string) {
        const log = Logger("plebbit-js:subplebbit:handleChallengeExchange:storePublicationIfValid:handleCommentEdit");

        let commentToBeEdited = await this.dbHandler.queryComment(commentEdit.commentCid, undefined);
        const editorAddress = await getPlebbitAddressFromPublicKeyPem(commentEdit.signature.publicKey);
        const modRole = this.roles && this.roles[editorAddress];
        if (commentEdit.signature.publicKey === commentToBeEdited.signature.publicKey) {
            // CommentEdit is signed by original author
            for (const editField of Object.keys(removeKeysWithUndefinedValues(commentEdit.toJSON()))) {
                if (!AUTHOR_EDIT_FIELDS.includes(<any>editField)) {
                    const msg = `Author (${editorAddress}) included field (${editField}) that cannot be used for a author's CommentEdit`;
                    log(`(${challengeRequestId}): `, msg);
                    return msg;
                }
            }

            await this.dbHandler.insertEdit(commentEdit.toJSONForDb(challengeRequestId));
            // If comment.flair is last modified by a mod, then reject
            // TODO investiate why challengeRequestId is included in comment.authorEdit
            await this.dbHandler.editComment(commentEdit.toJSONForDb(challengeRequestId));
            // const commentAfterEdit = await this.dbHandler.queryComment(commentEdit.commentCid, undefined);
            log.trace(`(${challengeRequestId}): `, `Updated comment (${commentEdit.commentCid}) with CommentEdit: `, commentEdit.toJSON());
        } else if (modRole) {
            log.trace(
                `(${challengeRequestId}): `,
                `${modRole.role} (${editorAddress}) is attempting to CommentEdit ${commentToBeEdited?.cid} with CommentEdit: `,
                commentEdit.toJSON()
            );

            for (const editField of Object.keys(removeKeysWithUndefinedValues(commentEdit.toJSON()))) {
                if (!MOD_EDIT_FIELDS.includes(<any>editField)) {
                    const msg = `${modRole.role} (${editorAddress}) included field (${editField}) that cannot be used for a mod's CommentEdit`;
                    log(`(${challengeRequestId}): `, msg);
                    return msg;
                }
            }

            await this.dbHandler.insertEdit(commentEdit.toJSONForDb(challengeRequestId));
            await this.dbHandler.editComment(commentEdit.toJSONForDb(challengeRequestId));

            if (commentEdit.commentAuthor) {
                // A mod is is trying to ban an author or add a flair to author
                const newAuthorProps: AuthorDbType = {
                    address: commentToBeEdited?.author.address,
                    ...commentEdit.commentAuthor
                };
                await this.dbHandler.updateAuthor(newAuthorProps, true);
                log(
                    `(${challengeRequestId}): `,
                    `Following props has been added to author (${newAuthorProps.address}): `,
                    newAuthorProps,
                    "By mod: ",
                    modRole
                );
            }
        } else {
            // CommentEdit is signed by someone who's not the original author or a mod. Reject it
            // Editor has no subplebbit role like owner, moderator or admin, and their signer is not the signer used in the original comment
            const msg = `Editor (non-mod) - (${editorAddress}) attempted to edit a comment (${commentEdit.commentCid}) without having original author keys.`;
            log(`(${challengeRequestId}): `, msg);
            return msg;
        }
    }

    private async handleVote(newVote: Vote, challengeRequestId: string) {
        const log = Logger("plebbit-js:subplebbit:handleChallengeExchange:storePublicationIfValid:handleVote");

        const lastVote = await this.dbHandler.getLastVoteOfAuthor(newVote.commentCid, newVote.author.address);

        if (lastVote && newVote.signature.publicKey !== lastVote.signature.publicKey) {
            const msg = `Author (${newVote.author.address}) attempted to change vote on (${newVote.commentCid}) without having correct credentials`;
            log(`(${challengeRequestId}): `, msg);
            return msg;
        } else {
            await this.dbHandler.upsertVote(newVote.toJSONForDb(challengeRequestId), newVote.author.toJSONForDb(), undefined);
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

        const postOrCommentOrVote: Vote | CommentEdit | Post | Comment = publication.hasOwnProperty("vote")
            ? await this.plebbit.createVote(<VoteType>publication)
            : publication["commentCid"]
            ? await this.plebbit.createCommentEdit(<CommentEditType>publication)
            : await this.plebbit.createComment(<CommentType>publication);

        if (postOrCommentOrVote?.author?.address) {
            // Check if author is banned
            const author = await this.dbHandler.queryAuthor(postOrCommentOrVote.author.address);
            if (author?.banExpiresAt && author.banExpiresAt > timestamp()) {
                const msg = `Author (${postOrCommentOrVote?.author?.address}) attempted to publish ${postOrCommentOrVote.constructor.name} even though they're banned until ${author.banExpiresAt}. Rejecting`;
                log(`(${challengeRequestId}): `, msg);
                return msg;
            }
        } else {
            const msg = `Rejecting ${postOrCommentOrVote.constructor.name} because it doesn't have author.address`;
            log(`(${challengeRequestId}): `, msg);
            return msg;
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

            if (parent.timestamp > postOrCommentOrVote.timestamp) {
                log(`(${challengeRequestId}): `, messages.ERR_SUB_COMMENT_TIMESTAMP_IS_EARLIER_THAN_PARENT);
                return messages.ERR_SUB_COMMENT_TIMESTAMP_IS_EARLIER_THAN_PARENT;
            }
        }
        if (this.plebbit.resolver.isDomain(publication.author.address)) {
            const derivedAddress = await getPlebbitAddressFromPublicKeyPem(postOrCommentOrVote.signature.publicKey);
            const resolvedAddress = await this.plebbit.resolver.resolveAuthorAddressIfNeeded(publication.author.address);
            if (resolvedAddress !== derivedAddress) {
                // Means ENS's plebbit-author-address is resolving to another address, which shouldn't happen
                const msg = `domain (${postOrCommentOrVote.author.address}) plebbit-author-address (${resolvedAddress}) does not have the same signer address (${this.signer?.address})`;
                log(`(${challengeRequestId}): `, msg);
                return msg;
            }
        }

        const signatureValidity =
            postOrCommentOrVote instanceof Comment
                ? await verifyComment(postOrCommentOrVote, this.plebbit, false)
                : postOrCommentOrVote instanceof Vote
                ? await verifyVote(postOrCommentOrVote, this.plebbit, false)
                : await verifyCommentEdit(postOrCommentOrVote, this.plebbit, false);

        if (!signatureValidity.valid) {
            const msg = `Author (${postOrCommentOrVote.author.address}) ${postOrCommentOrVote.getType()}'s signature is invalid due to '${
                signatureValidity.reason
            }'`;
            log(`(${challengeRequestId}): `, msg);
            return <string>signatureValidity.reason;
        }
        if (postOrCommentOrVote instanceof Vote) {
            const res = await this.handleVote(postOrCommentOrVote, challengeRequestId);
            if (res) return res;
        } else if (postOrCommentOrVote instanceof CommentEdit) {
            const res = await this.handleCommentEdit(postOrCommentOrVote, challengeRequestId);
            if (res) return res;
        } else if (postOrCommentOrVote instanceof Comment) {
            // Comment and Post need to add file to ipfs
            const ipnsKeyName = sha256(encode(postOrCommentOrVote.toJSONSkeleton()));

            if (await this.dbHandler?.querySigner(ipnsKeyName)) {
                const msg = `Failed to insert ${
                    postOrCommentOrVote.constructor.name
                } due to previous ${postOrCommentOrVote.getType()} having same ipns key name (duplicate?)`;
                log(`(${challengeRequestId}): `, msg);
                return msg;
            }

            const ipfsSigner = new Signer({
                ...(await this.plebbit.createSigner()),
                ipnsKeyName: ipnsKeyName,
                usage: "comment"
            });
            await this.dbHandler.insertSigner(ipfsSigner, undefined);
            postOrCommentOrVote.setCommentIpnsKey(await nativeFunctions.importSignerIntoIpfsNode(ipfsSigner, this.plebbit));

            if (postOrCommentOrVote instanceof Post) {
                const trx = await this.dbHandler.createTransaction(challengeRequestId);
                postOrCommentOrVote.setPreviousCid((await this.dbHandler.queryLatestPost(trx))?.cid);
                await this.dbHandler.commitTransaction(challengeRequestId);
                postOrCommentOrVote.setDepth(0);
                const file = await this.plebbit.ipfsClient.add(encode(postOrCommentOrVote.toJSONIpfs()));
                postOrCommentOrVote.setPostCid(file.path);
                postOrCommentOrVote.setCid(file.path);
                await this.dbHandler.upsertComment(
                    postOrCommentOrVote.toJSONForDb(challengeRequestId),
                    postOrCommentOrVote.author.toJSONForDb(),
                    undefined
                );

                log(`(${challengeRequestId}): `, `New post with cid ${postOrCommentOrVote.cid} has been inserted into DB`);
            } else if (postOrCommentOrVote instanceof Comment) {
                // Comment
                const trx = await this.dbHandler.createTransaction(challengeRequestId);
                const [commentsUnderParent, parent] = await Promise.all([
                    this.dbHandler.queryCommentsUnderComment(postOrCommentOrVote.parentCid, trx),
                    this.dbHandler.queryComment(postOrCommentOrVote.parentCid, trx)
                ]);
                await this.dbHandler.commitTransaction(challengeRequestId);

                postOrCommentOrVote.setPreviousCid(commentsUnderParent[0]?.cid);
                postOrCommentOrVote.setDepth(parent.depth + 1);
                postOrCommentOrVote.setPostCid(parent.postCid);
                const file = await this.plebbit.ipfsClient.add(encode(postOrCommentOrVote.toJSONIpfs()));
                postOrCommentOrVote.setCid(file.path);
                await this.dbHandler.upsertComment(
                    postOrCommentOrVote.toJSONForDb(challengeRequestId),
                    postOrCommentOrVote.author.toJSONForDb(),
                    undefined
                );

                log(`(${challengeRequestId}): `, `New comment with cid ${postOrCommentOrVote.cid} has been inserted into DB`);
            }
        }

        return postOrCommentOrVote;
    }

    private async handleChallengeRequest(request: ChallengeRequestMessage) {
        const log = Logger("plebbit-js:subplebbit:handleChallengeRequest");

        const decryptedRequest: DecryptedChallengeRequestMessageType = {
            ...request,
            publication: JSON.parse(
                await decrypt(request.encryptedPublication.encrypted, request.encryptedPublication.encryptedKey, this.signer.privateKey)
            )
        };
        this.emit("challengerequest", decryptedRequest);
        const [providedChallenges, reasonForSkippingCaptcha] = await this.provideCaptchaCallback(decryptedRequest);
        this._challengeToPublication[request.challengeRequestId] = decryptedRequest.publication;
        log(`Received a request to a challenge (${request.challengeRequestId})`);
        if (providedChallenges.length === 0) {
            // Subplebbit owner has chosen to skip challenging this user or post
            log.trace(`(${request.challengeRequestId}): No challenge is required`);
            await this.dbHandler.upsertChallenge(request.toJSONForDb(), undefined);

            const publicationOrReason = await this.storePublicationIfValid(decryptedRequest.publication, request.challengeRequestId);
            const encryptedPublication =
                typeof publicationOrReason !== "string"
                    ? await encrypt(encode(publicationOrReason.toJSON()), publicationOrReason.signature.publicKey)
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
                this.dbHandler.upsertChallenge(challengeVerification.toJSONForDb(), undefined),
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
                encryptedChallenges: await encrypt(encode(providedChallenges), decryptedRequest.publication.signature.publicKey)
            };

            const challengeMessage = new ChallengeMessage({
                ...toSignChallenge,
                signature: await signChallengeMessage(toSignChallenge, this.signer)
            });

            await Promise.all([
                this.dbHandler.upsertChallenge({ ...challengeMessage.toJSONForDb(), challenges: providedChallenges }, undefined),
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
            await decrypt(
                challengeAnswer.encryptedChallengeAnswers.encrypted,
                challengeAnswer.encryptedChallengeAnswers.encryptedKey,
                this.signer?.privateKey
            )
        );

        const decryptedChallengeAnswer: DecryptedChallengeAnswerMessageType = { ...challengeAnswer, challengeAnswers: decryptedAnswers };

        this.emit("challengeanswer", decryptedChallengeAnswer);

        const [challengeSuccess, challengeErrors] = await this.validateCaptchaAnswerCallback(decryptedChallengeAnswer);
        if (challengeSuccess) {
            log.trace(`(${challengeAnswer.challengeRequestId}): `, `User has been answered correctly`);
            const storedPublication = this._challengeToPublication[challengeAnswer.challengeRequestId];

            await this.dbHandler.upsertChallenge(
                {
                    ...challengeAnswer.toJSONForDb(),
                    challengeAnswers: decryptedChallengeAnswer.challengeAnswers
                },
                undefined
            );
            const publicationOrReason = await this.storePublicationIfValid(storedPublication, challengeAnswer.challengeRequestId); // could contain "publication" or "reason"
            const encryptedPublication =
                typeof publicationOrReason !== "string"
                    ? await encrypt(encode(publicationOrReason.toJSON()), publicationOrReason.signature.publicKey)
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
                this.dbHandler.upsertChallenge(challengeVerification.toJSONForDb(), undefined),
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
                this.dbHandler.upsertChallenge(challengeVerification.toJSONForDb(), undefined),
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

            const err = errcode(Error(messages.ERR_SIGNATURE_IS_INVALID), codes.ERR_SIGNATURE_IS_INVALID, {
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

    // TODO move this to sub
    private async _publishCommentIpns(dbComment: Comment, options: CommentUpdate) {
        dbComment._initCommentUpdate(options);
        dbComment._mergeFields(dbComment.toJSON());
        const file = await this.plebbit.ipfsClient.add(encode({ ...dbComment.toJSONCommentUpdate(), signature: options.signature }));
        await this.plebbit.ipfsClient.name.publish(file.path, {
            lifetime: "72h",
            key: dbComment.ipnsKeyName,
            allowOffline: true
        });
    }

    private async syncComment(dbComment: Comment) {
        const log = Logger("plebbit-js:subplebbit:sync:syncComment");

        let commentIpns: CommentUpdate | undefined;
        try {
            commentIpns = dbComment.ipnsName && (await loadIpnsAsJson(dbComment.ipnsName, this.plebbit));
        } catch (e) {
            log.trace(
                `Failed to load Comment (${dbComment.cid}) IPNS (${dbComment.ipnsName}) while syncing. Will attempt to publish a new IPNS record`
            );
        }

        if (
            !commentIpns ||
            !lodash.isEqual(
                lodash.omit(commentIpns, ["replies", "signature", "subplebbitAuthor"]),
                removeKeysWithUndefinedValues(lodash.omit(dbComment.toJSONCommentUpdate(), ["replies", "signature", "subplebbitAuthor"]))
            )
        ) {
            log.trace(`Attempting to update Comment (${dbComment.cid})`);
            if (!dbComment.original) dbComment.original = lodash.pick(dbComment.toJSON(), ["author", "content", "flair"]);
            await this.sortHandler.deleteCommentPageCache(dbComment);
            const commentReplies = await this.sortHandler.generatePagesUnderComment(dbComment, undefined);
            dbComment.author.subplebbit = await this.dbHandler.querySubplebbitAuthorFields(dbComment.cid);
            dbComment.setReplies(commentReplies);
            dbComment.setUpdatedAt(timestamp());
            await this.dbHandler.upsertComment(dbComment.toJSONForDb(undefined), dbComment.author.toJSONForDb(), undefined);
            const subplebbitSignature = await signCommentUpdate(dbComment.toJSONCommentUpdate(), this.signer);
            return this._publishCommentIpns(dbComment, { ...dbComment.toJSONCommentUpdate(), signature: subplebbitSignature });
        }
        log.trace(`Comment (${dbComment.cid}) is up-to-date and does not need syncing`);
    }

    private async syncIpnsWithDb() {
        const log = Logger("plebbit-js:subplebbit:sync");

        log.trace("Starting to sync IPNS with DB");
        try {
            await this.sortHandler.cacheCommentsPages();
            const dbComments = await this.dbHandler.queryComments();
            await Promise.all(
                dbComments.map(async (commentProps: CommentType) => this.syncComment(await this.plebbit.createComment(commentProps)))
            );
            await this.updateSubplebbitIpns();

            RUNNING_SUBPLEBBITS[this.signer.address] = true;
            await this.dbHandler.keyvSet(this.address, this.toJSON());
        } catch (e) {
            log.error(`Failed to sync due to error,`, e);
        }
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
            throw errcode(Error(messages.ERR_SUB_SIGNER_NOT_DEFINED), codes.ERR_SUB_SIGNER_NOT_DEFINED, {
                details: `signer: ${JSON.stringify(this.signer)}, address: ${this.address}`
            });
        if (this._sync || RUNNING_SUBPLEBBITS[this.signer.address])
            throw errcode(Error(messages.ERR_SUB_ALREADY_STARTED), codes.ERR_SUB_ALREADY_STARTED, {
                details: `address: ${this.address}`
            });
        this._sync = true;
        RUNNING_SUBPLEBBITS[this.signer.address] = true;
        if (!this.provideCaptchaCallback) {
            log("Subplebbit owner has not provided any captcha. Will go with default image captcha");
            this.provideCaptchaCallback = this.defaultProvideCaptcha;
            this.validateCaptchaAnswerCallback = this.defaultValidateCaptcha;
        }
        if (typeof this.pubsubTopic !== "string") {
            this.pubsubTopic = this.address;
            log(`Defaulted subplebbit (${this.address}) pubsub topic to ${this.pubsubTopic} since sub owner hasn't provided any`);
        }
        if (typeof this.createdAt !== "number") {
            this.createdAt = timestamp();
            log(`Subplebbit (${this.address}) createdAt has been set to ${this.createdAt}`);
        }
        await this.plebbit.pubsubIpfsClient.pubsub.subscribe(
            this.pubsubTopic,
            async (pubsubMessage) => await this.handleChallengeExchange(pubsubMessage)
        );
        log.trace(`Waiting for publications on pubsub topic (${this.pubsubTopic})`);
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
            throw errcode(Error(messages.ERR_DATA_PATH_IS_NOT_DEFINED), codes.ERR_DATA_PATH_IS_NOT_DEFINED, {
                details: `delete: plebbitOptions.dataPath=${this.plebbit.dataPath}`
            });
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

        if (this.ipnsKeyName)
            // Key may not exist on ipfs node
            try {
                await this.plebbit.ipfsClient.key.rm(this.ipnsKeyName);
            } catch {}
    }

    async _addPublicationToDb(publication: CommentEdit | Vote | Comment | Post) {
        const log = Logger("plebbit-js:subplebbit:_addPublicationToDb");
        log(`Adding ${publication.getType()} to DB with author,`, removeKeysWithUndefinedValues(publication.author));
        const decryptedRequestType: Omit<ChallengeRequestMessageType, "encryptedPublication" | "signature"> = {
            type: "CHALLENGEREQUEST",
            challengeRequestId: uuidv4(),
            protocolVersion: env.PROTOCOL_VERSION,
            userAgent: env.USER_AGENT
        };

        await this.dbHandler.upsertChallenge(decryptedRequestType);
        return await this.storePublicationIfValid(publication.toJSON(), decryptedRequestType.challengeRequestId);
    }
}
