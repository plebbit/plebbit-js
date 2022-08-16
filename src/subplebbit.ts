import { toString as uint8ArrayToString } from "uint8arrays/to-string";
import EventEmitter from "events";
import { sha256 } from "js-sha256";
import { fromString as uint8ArrayFromString } from "uint8arrays/from-string";
import {
    Challenge,
    CHALLENGE_TYPES,
    ChallengeAnswerMessage,
    ChallengeMessage,
    ChallengeRequestMessage,
    ChallengeVerificationMessage,
    PUBSUB_MESSAGE_TYPES
} from "./challenge";
import assert from "assert";
import { DbHandler, subplebbitInitDbIfNeeded } from "./runtime/node/db-handler";
import { createCaptcha } from "./runtime/node/captcha";
import { SortHandler } from "./sort-handler";
import { getDebugLevels, ipfsImportKey, loadIpnsAsJson, removeKeys, removeKeysWithUndefinedValues, shallowEqual, timestamp } from "./util";
import { decrypt, encrypt, verifyPublication, Signer, Signature, signPublication } from "./signer";
import { Pages } from "./pages";
import { Plebbit } from "./plebbit";
import {
    AuthorType,
    ChallengeType,
    CommentUpdate,
    CreateSubplebbitOptions,
    Flair,
    FlairOwner,
    ProtocolVersion,
    SubplebbitEditOptions,
    SubplebbitEncryption,
    SubplebbitFeatures,
    SubplebbitMetrics,
    SubplebbitRole,
    SubplebbitSuggested,
    SubplebbitType
} from "./types";
import { Comment } from "./comment";
import Vote from "./vote";
import Post from "./post";
import { getPlebbitAddressFromPublicKeyPem } from "./signer/util";
import Publication from "./publication";
import { v4 as uuidv4 } from "uuid";
import { AUTHOR_EDIT_FIELDS, CommentEdit, MOD_EDIT_FIELDS } from "./comment-edit";
import errcode from "err-code";
import { codes, messages } from "./errors";

const debugs = getDebugLevels("subplebbit");
const DEFAULT_UPDATE_INTERVAL_MS = 60000;
const DEFAULT_SYNC_INTERVAL_MS = 100000; // 5 minutes

export const RUNNING_SUBPLEBBITS: Record<string, boolean> = {};

export class Subplebbit extends EventEmitter implements SubplebbitType {
    // public
    title?: string;
    description?: string;
    roles?: { [authorAddress: string]: SubplebbitRole };
    latestPostCid?: string;
    posts?: Pages;
    pubsubTopic: string;
    challengeTypes?: ChallengeType[];
    metrics?: SubplebbitMetrics;
    features?: SubplebbitFeatures;
    suggested?: SubplebbitSuggested;
    flairs: Record<FlairOwner, Flair[]>;
    address: string;
    metricsCid?: string;
    createdAt: number;
    updatedAt: number;
    signer?: Signer;
    encryption: SubplebbitEncryption;
    protocolVersion: ProtocolVersion; // semantic version of the protocol https://semver.org/
    signature: Signature; // signature of the Subplebbit update by the sub owner to protect against malicious gateway

    plebbit: Plebbit;
    dbHandler?: DbHandler;
    _keyv: any; // Don't change any here to Keyv since it will crash for browsers
    _dbConfig?: any;

    // private

    private _challengeToSolution: any;
    private _challengeToPublication: any;
    private provideCaptchaCallback?: (request: ChallengeRequestMessage) => Promise<[Challenge[], string | undefined]>;
    private validateCaptchaAnswerCallback?: (answerMessage: ChallengeAnswerMessage) => Promise<[boolean, string[] | undefined]>;
    private ipnsKeyName?: string;
    private sortHandler: SortHandler;
    private _updateInterval?: any;
    private _syncInterval?: any;
    private _sync: boolean;

    constructor(props: CreateSubplebbitOptions, plebbit: Plebbit) {
        super();
        this.plebbit = plebbit;
        this.initSubplebbit(props);
        this._challengeToSolution = {}; // Map challenge ID to its solution
        this._challengeToPublication = {}; // To hold unpublished posts/comments/votes
        this._sync = false;
        this.provideCaptchaCallback = undefined;
        this.validateCaptchaAnswerCallback = undefined;

        // these functions might get separated from their `this` when used
        this.start = this.start.bind(this);
        this.update = this.update.bind(this);
        this.stop = this.stop.bind(this);
        this.edit = this.edit.bind(this);

        this.on("error", (...args) => this.plebbit.emit("error", ...args));
    }

    initSubplebbit(newProps: SubplebbitType | SubplebbitEditOptions) {
        const oldProps = this.toJSONInternal();
        const mergedProps = { ...oldProps, ...newProps };
        this.title = mergedProps.title;
        this.description = mergedProps.description;
        this.latestPostCid = mergedProps.latestPostCid;
        this._dbConfig = mergedProps.database;
        this.address = mergedProps.address;
        this.ipnsKeyName = mergedProps.ipnsKeyName;
        this.pubsubTopic = mergedProps.pubsubTopic;
        this.challengeTypes = mergedProps.challengeTypes;
        this.metricsCid = mergedProps.metricsCid;
        this.createdAt = mergedProps.createdAt;
        this.updatedAt = mergedProps.updatedAt;
        this.signer = mergedProps.signer;
        this.encryption = mergedProps.encryption;
        this.posts =
            mergedProps["posts"] instanceof Object
                ? new Pages({
                      ...mergedProps["posts"],
                      subplebbit: this
                  })
                : mergedProps["posts"];
        this.roles = mergedProps.roles;
    }

    async initSignerIfNeeded() {
        if (this.dbHandler) {
            const dbSigner = await this.dbHandler.querySubplebbitSigner(undefined);
            if (!dbSigner) {
                assert(this.signer, "Subplebbit needs a signer to start");
                debugs.INFO(`Subplebbit has no signer in DB, will insert provided signer from createSubplebbitOptions into DB`);
                await this.dbHandler.insertSigner(
                    {
                        ...this.signer,
                        ipnsKeyName: this.signer.address,
                        usage: "subplebbit"
                    },
                    undefined
                );
            } else if (!this.signer) {
                debugs.DEBUG(`Subplebbit loaded signer from DB`);
                this.signer = dbSigner;
            }
        }

        assert(this.signer?.publicKey);
        this.encryption = {
            type: "aes-cbc",
            publicKey: this.signer.publicKey
        };

        if (!this.address && this.signer) {
            // Look for subplebbit address (key.id) in the ipfs node
            assert(this.plebbit.ipfsClient, "a defined plebbit.ipfsClient is needed to load sub address from IPFS node");
            const ipnsKeys = await this.plebbit.ipfsClient.key.list();
            const ipfsKey = ipnsKeys.filter((key) => key.name === this.signer.address)[0];
            debugs.DEBUG(
                Boolean(ipfsKey)
                    ? `Owner has provided a signer that maps to ${ipfsKey.id} subplebbit address within ipfs node`
                    : `Owner has provided a signer that doesn't map to any subplebbit address within the ipfs node`
            );
            this.address = ipfsKey?.id;
        }
    }

    async initDbIfNeeded() {
        await subplebbitInitDbIfNeeded(this);
        this.sortHandler = new SortHandler(this);
    }

    setProvideCaptchaCallback(newCallback: (request: ChallengeRequestMessage) => Promise<[Challenge[], string | undefined]>) {
        this.provideCaptchaCallback = newCallback;
    }

    setValidateCaptchaAnswerCallback(newCallback: (answerMessage: ChallengeAnswerMessage) => Promise<[boolean, string[] | undefined]>) {
        this.validateCaptchaAnswerCallback = newCallback;
    }

    toJSONInternal() {
        return {
            ...this.toJSON(),
            ipnsKeyName: this.ipnsKeyName,
            database: this._dbConfig,
            signer: this.signer
        };
    }

    toJSON(): SubplebbitType {
        return {
            title: this.title,
            description: this.description,
            latestPostCid: this.latestPostCid,
            pubsubTopic: this.pubsubTopic,
            address: this.address,
            posts: this.posts,
            challengeTypes: this.challengeTypes,
            metricsCid: this.metricsCid,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            encryption: this.encryption,
            roles: this.roles,
            protocolVersion: this.protocolVersion,
            signature: this.signature
        };
    }

    async prePublish() {
        // Import ipfs key into node (if not imported already)
        // Initialize signer
        // Initialize address (needs signer)
        // Initialize db (needs address)
        if (!this.signer && this.address) {
            // Load signer from DB
            await this.initDbIfNeeded();
        } else if (!this.address && this.signer?.address) this.address = this.signer.address;
        await this.initDbIfNeeded();
        assert(this.address && this.signer, "Both address and signer need to be defined at this point");
        if (!this.pubsubTopic) this.pubsubTopic = this.address;
        // import ipfs key into ipfs node
        assert(this.plebbit.ipfsClient, "a defined plebbit.ipfsClient is needed to load sub address from IPFS node");

        let subplebbitIpfsNodeKey, error;
        try {
            subplebbitIpfsNodeKey = (await this.plebbit.ipfsClient.key.list()).filter((key) => key.name === this.signer.address)[0];
        } catch (e) {
            error = e;
        }
        if (error) throw new Error(`Failed to list keys from ipfs node due to error: ${error}`);
        if (!subplebbitIpfsNodeKey) {
            const ipfsKey = await ipfsImportKey({ ...this.signer, ipnsKeyName: this.signer.address }, this.plebbit);
            this.ipnsKeyName = ipfsKey["name"] || ipfsKey["Name"];
            debugs.INFO(`Imported subplebbit keys into ipfs node, ${JSON.stringify(ipfsKey)}`);
        } else {
            debugs.TRACE(`Subplebbit key is already in ipfs node, no need to import (${JSON.stringify(subplebbitIpfsNodeKey)})`);
            this.ipnsKeyName = subplebbitIpfsNodeKey["name"] || subplebbitIpfsNodeKey["Name"];
        }
        assert(
            this.ipnsKeyName && this.address && this.signer && this.encryption && this.pubsubTopic,
            "These fields are needed to run the subplebbit"
        );

        const cachedSubplebbit: SubplebbitType | undefined = await this._keyv.get(this.address);
        if (cachedSubplebbit && JSON.stringify(cachedSubplebbit) !== "{}")
            this.initSubplebbit(cachedSubplebbit); // Init subplebbit fields from DB
        else await this._keyv.set(this.address, this.toJSON()); // If subplebbit is not cached, then create a cache
    }

    async assertDomainResolvesCorrectly(domain: string) {
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
        assert(this.dbHandler, "dbHandler is needed to edit");

        if (newSubplebbitOptions.address) {
            this.assertDomainResolvesCorrectly(newSubplebbitOptions.address).catch((err) => {
                const editError = errcode(err, err.code, { details: `subplebbit.edit: ${err.details}` });
                debugs.WARN(editError);
                this.emit("error", editError);
            });
            debugs.DEBUG(`Attempting to edit subplebbit.address from ${this.address} to ${newSubplebbitOptions.address}`);
            await this.dbHandler.changeDbFilename(`${newSubplebbitOptions.address}`);
        }
        this.initSubplebbit(newSubplebbitOptions);

        debugs.INFO(`Subplebbit (${this.address}) props (${Object.keys(newSubplebbitOptions)}) has been edited`);
        await this._keyv.set(this.address, this.toJSON());
        return this;
    }

    async updateOnce() {
        if (this._sync) throw errcode(Error(messages.ERR_SUB_CAN_EITHER_RUN_OR_UPDATE), codes.ERR_SUB_CAN_EITHER_RUN_OR_UPDATE);

        if (this.plebbit.resolver.isDomain(this.address))
            try {
                await this.assertDomainResolvesCorrectly(this.address);
            } catch (e) {
                const updateError = errcode(e, e.code, { details: `subplebbit.update: ${e.details}` });
                debugs.ERROR(updateError);
                this.emit("error", updateError);
                return;
            }

        const ipnsAddress = await this.plebbit.resolver.resolveSubplebbitAddressIfNeeded(this.address);
        try {
            const subplebbitIpns: SubplebbitType = await loadIpnsAsJson(ipnsAddress, this.plebbit);
            if (JSON.stringify(this.toJSON()) !== JSON.stringify(subplebbitIpns)) {
                this.initSubplebbit(subplebbitIpns);
                debugs.INFO(`Subplebbit received a new update. Will emit an update event`);
                this.emit("update", subplebbitIpns);
            }
            return this;
        } catch (e) {
            debugs.ERROR(`Failed to update subplebbit IPNS, error: ${e}`);
        }
    }

    update(updateIntervalMs = DEFAULT_UPDATE_INTERVAL_MS) {
        if (this._updateInterval) clearInterval(this._updateInterval);
        if (this._sync) throw errcode(Error(messages.ERR_SUB_CAN_EITHER_RUN_OR_UPDATE), codes.ERR_SUB_CAN_EITHER_RUN_OR_UPDATE);
        this._updateInterval = setInterval(this.updateOnce.bind(this), updateIntervalMs);
        return this.updateOnce();
    }

    async stop() {
        this._updateInterval = clearInterval(this._updateInterval);
        if (this.signer) {
            assert(this.signer?.address, "Signer is needed to stop publishing");
            this.removeAllListeners();
            this._sync = false;

            this._syncInterval = clearInterval(this._syncInterval);

            await this.plebbit.pubsubIpfsClient.pubsub.unsubscribe(this.pubsubTopic);
            this.dbHandler?.knex?.destroy();
            this.dbHandler = undefined;
            RUNNING_SUBPLEBBITS[this.signer.address] = false;
        }
    }

    async updateSubplebbitIpns() {
        assert(this.dbHandler && this.plebbit.ipfsClient, "A connection to DB and ipfs client are needed to update subplebbit IPNS");
        const trx: any = await this.dbHandler.createTransaction("subplebbit");
        const latestPost = await this.dbHandler.queryLatestPost(trx);
        await this.dbHandler.commitTransaction("subplebbit");
        this.latestPostCid = latestPost?.cid;

        const [metrics, subplebbitPosts] = await Promise.all([
            this.dbHandler.querySubplebbitMetrics(undefined),
            this.sortHandler.generatePagesUnderComment(undefined, undefined)
        ]);
        const resolvedAddress = await this.plebbit.resolver.resolveSubplebbitAddressIfNeeded(this.address);
        let currentIpns: SubplebbitType | undefined;
        try {
            currentIpns = await loadIpnsAsJson(resolvedAddress, this.plebbit);
        } catch (e) {
            debugs.WARN(`Subplebbit IPNS (${resolvedAddress}) is not defined, will publish a new record`);
        }
        if (subplebbitPosts) {
            if (!subplebbitPosts?.pages?.hot) throw new Error("Generated pages for subplebbit.posts is missing pages");
            this.posts = new Pages({
                pages: {
                    hot: subplebbitPosts.pages.hot
                },
                pageCids: subplebbitPosts.pageCids,
                subplebbit: this
            });
        }

        if (!currentIpns?.createdAt && !this.createdAt) {
            this.createdAt = timestamp();
            debugs.INFO(`Subplebbit (${this.address}) createdAt has been set to ${this.createdAt}`);
        }

        if (!this.pubsubTopic) {
            this.pubsubTopic = this.address;
            debugs.INFO(`Defaulted subplebbit (${this.address}) pubsub topic to ${this.pubsubTopic} since sub owner hasn't provided any`);
        }

        this.metricsCid = (await this.plebbit.ipfsClient.add(JSON.stringify(metrics))).path;

        if (!currentIpns || JSON.stringify(currentIpns) !== JSON.stringify(this.toJSON())) {
            this.updatedAt = timestamp();
            const file = await this.plebbit.ipfsClient.add(JSON.stringify(this.toJSON()));
            await this.plebbit.ipfsClient.name.publish(file["cid"], {
                lifetime: "72h", // TODO decide on optimal time later
                key: this.ipnsKeyName,
                allowOffline: true
            });
        }
    }

    async handleCommentEdit(commentEdit: CommentEdit, challengeRequestId: string) {
        assert(this.dbHandler, "Need db handler to handleCommentEdit");
        let commentToBeEdited = await this.dbHandler.queryComment(commentEdit.commentCid, undefined);
        assert(commentToBeEdited);
        const editorAddress = await getPlebbitAddressFromPublicKeyPem(commentEdit.signature.publicKey);
        const modRole = this.roles && this.roles[editorAddress];
        if (commentEdit.signature.publicKey === commentToBeEdited.signature.publicKey) {
            // CommentEdit is signed by original author
            for (const editField of Object.keys(removeKeysWithUndefinedValues(commentEdit.toJSON()))) {
                if (!AUTHOR_EDIT_FIELDS.includes(<any>editField)) {
                    const msg = `Author (${editorAddress}) included field (${editField}) that cannot be used for a author's CommentEdit`;
                    debugs.WARN(msg);
                    return { reason: msg };
                }
            }

            await this.dbHandler.insertEdit(commentEdit, challengeRequestId);
            // If comment.flair is last modified by a mod, then reject
            await this.dbHandler.editComment(commentEdit, challengeRequestId);
            // const commentAfterEdit = await this.dbHandler.queryComment(commentEdit.commentCid, undefined);
            debugs.INFO(
                `Updated comment (${commentEdit.commentCid}) with CommentEdit: ${JSON.stringify(
                    removeKeys(commentEdit.toJSON(), ["signature"])
                )}`
            );
        } else if (modRole) {
            debugs.DEBUG(
                `${modRole.role} (${editorAddress}) is attempting to CommentEdit ${
                    commentToBeEdited?.cid
                } with CommentEdit (${JSON.stringify(removeKeys(commentEdit.toJSON(), ["signature"]))})`
            );

            for (const editField of Object.keys(removeKeysWithUndefinedValues(commentEdit.toJSON()))) {
                if (!MOD_EDIT_FIELDS.includes(<any>editField)) {
                    const msg = `${modRole.role} (${editorAddress}) included field (${editField}) that cannot be used for a mod's CommentEdit`;
                    debugs.WARN(msg);
                    return { reason: msg };
                }
            }

            await this.dbHandler.insertEdit(commentEdit, challengeRequestId);
            await this.dbHandler.editComment(commentEdit, challengeRequestId);

            if (commentEdit.commentAuthor) {
                // A mod is is trying to ban an author or add a flair to author
                const newAuthorProps: AuthorType = {
                    address: commentToBeEdited?.author.address,
                    ...commentEdit.commentAuthor
                };
                await this.dbHandler.updateAuthor(newAuthorProps, true);
                debugs.INFO(
                    `Mod (${JSON.stringify(modRole)}) has add following props to author (${newAuthorProps.address}):  ${JSON.stringify(
                        newAuthorProps
                    )}`
                );
            }
        } else {
            // CommentEdit is signed by someone who's not the original author or a mod. Reject it
            // Editor has no subplebbit role like owner, moderator or admin, and their signer is not the signer used in the original comment
            const msg = `Editor (non-mod) - (${editorAddress}) attempted to edit a comment (${commentEdit.commentCid}) without having original author keys.`;
            debugs.INFO(msg);
            return { reason: msg };
        }
    }

    async handleVote(newVote: Vote, challengeRequestId: string) {
        const lastVote = await this.dbHandler.getLastVoteOfAuthor(newVote.commentCid, newVote.author.address);

        if (lastVote && newVote.signature.publicKey !== lastVote.signature.publicKey) {
            debugs.INFO(
                `Author (${newVote.author.address}) attempted to edit a comment vote (${newVote.commentCid}) without having correct credentials`
            );
            return {
                reason: `Author (${newVote.author.address}) attempted to change vote on  ${newVote.commentCid} without having correct credentials`
            };
        } else if (shallowEqual(newVote.signature, lastVote?.signature)) {
            debugs.INFO(`Signature of Vote is identical to original Vote (${newVote.commentCid})`);
            return {
                reason: `Signature of Vote is identical to original Vote (${newVote.commentCid}) by author ${newVote?.author?.address}`
            };
        } else if (lastVote?.vote === newVote.vote) {
            debugs.INFO(
                `Author (${newVote?.author.address}) has duplicated their vote for comment ${newVote.commentCid}. Returning an error`
            );
            return { reason: "User duplicated their vote" };
        } else {
            const trx = await this.dbHandler.createTransaction(challengeRequestId);
            await this.dbHandler.upsertVote(newVote, challengeRequestId, trx);
            await this.dbHandler?.commitTransaction(challengeRequestId);
            debugs.INFO(`Upserted new vote (${newVote.vote}) for comment ${newVote.commentCid}`);
        }
    }

    async publishPostAfterPassingChallenge(publication, challengeRequestId): Promise<any> {
        delete this._challengeToSolution[challengeRequestId];
        delete this._challengeToPublication[challengeRequestId];
        assert(this.dbHandler);

        const postOrCommentOrVote: Vote | CommentEdit | Post | Comment = publication.hasOwnProperty("vote")
            ? await this.plebbit.createVote(publication)
            : publication.commentCid
            ? await this.plebbit.createCommentEdit(publication)
            : await this.plebbit.createComment(publication);

        if (postOrCommentOrVote?.author?.address) {
            // Check if author is banned
            const author = await this.dbHandler.queryAuthor(postOrCommentOrVote.author.address);
            if (author?.banExpiresAt && author.banExpiresAt > timestamp()) {
                const msg = `Author (${postOrCommentOrVote?.author?.address}) attempted to publish ${postOrCommentOrVote.constructor.name} even though they're banned until ${author.banExpiresAt}. Rejecting`;
                debugs.INFO(msg);
                return { reason: msg };
            }
        } else {
            const msg = `Rejecting ${postOrCommentOrVote.constructor.name} because it doesn't have author.address`;
            debugs.INFO(msg);
            return { reason: msg };
        }

        if (!(postOrCommentOrVote instanceof Post)) {
            const parentCid: string | undefined =
                postOrCommentOrVote instanceof Comment
                    ? postOrCommentOrVote.parentCid
                    : postOrCommentOrVote instanceof Vote || postOrCommentOrVote instanceof CommentEdit
                    ? postOrCommentOrVote.commentCid
                    : undefined;

            const errResponse = {
                reason: `Rejecting ${postOrCommentOrVote.constructor.name} because its parentCid or commentCid is not defined`
            };
            if (!parentCid) {
                debugs.INFO(errResponse.reason);
                return errResponse;
            }

            const parent = await this.dbHandler.queryComment(parentCid);
            if (!parent) {
                debugs.INFO(errResponse.reason);
                return errResponse;
            }

            if (parent.timestamp > postOrCommentOrVote.timestamp) {
                const err = {
                    reason: `Rejecting ${postOrCommentOrVote.constructor.name} because its timestamp (${postOrCommentOrVote.timestamp}) is earlier than its parent (${parent.timestamp})`
                };
                debugs.INFO(err.reason);
                return err;
            }
        }
        const derivedAddress = await getPlebbitAddressFromPublicKeyPem(postOrCommentOrVote.signature.publicKey);
        const resolvedAddress = await this.plebbit.resolver.resolveAuthorAddressIfNeeded(publication?.author?.address);

        if (resolvedAddress !== publication?.author?.address) {
            // Means author.address is a crypto domain
            if (resolvedAddress !== derivedAddress) {
                // Means ENS's plebbit-author-address is resolving to another address, which shouldn't happen
                const msg = `domain (${postOrCommentOrVote.author.address}) plebbit-author-address (${resolvedAddress}) does not have the same signer address (${this.signer?.address})`;
                debugs.INFO(msg);
                return { reason: msg };
            }
        }
        const [signatureIsVerified, failedVerificationReason] = await verifyPublication(
            postOrCommentOrVote,
            this.plebbit,
            postOrCommentOrVote.getType()
        );
        if (!signatureIsVerified) {
            const msg = `Author (${
                postOrCommentOrVote?.author?.address
            }) ${postOrCommentOrVote.getType()}'s signature is invalid: ${failedVerificationReason}`;
            debugs.INFO(msg);
            return { reason: msg };
        }
        if (postOrCommentOrVote instanceof Vote) {
            const res = await this.handleVote(postOrCommentOrVote, challengeRequestId);
            if (res) return res;
        } else if (postOrCommentOrVote instanceof CommentEdit) {
            const res = await this.handleCommentEdit(postOrCommentOrVote, challengeRequestId);
            if (res) return res;
        } else if (postOrCommentOrVote instanceof Comment) {
            // Comment and Post need to add file to ipfs
            const ipnsKeyName = sha256(JSON.stringify(postOrCommentOrVote.toJSONSkeleton()));

            try {
                const ipfsSigner = new Signer({
                    ...(await this.plebbit.createSigner()),
                    ipnsKeyName: ipnsKeyName,
                    usage: "comment"
                });
                await this.dbHandler.insertSigner(ipfsSigner, undefined);
                const ipfsKey = await ipfsImportKey(ipfsSigner, this.plebbit);
                postOrCommentOrVote.setCommentIpnsKey(ipfsKey);
            } catch (e) {
                const msg = `Failed to insert ${
                    postOrCommentOrVote.constructor.name
                } due to previous ${postOrCommentOrVote.getType()} having same ipns key name (duplicate?): ${e}`;
                debugs.DEBUG(msg);
                return { reason: msg };
            }
            if (postOrCommentOrVote instanceof Post) {
                const trx = await this.dbHandler.createTransaction(challengeRequestId);
                postOrCommentOrVote.setPreviousCid((await this.dbHandler.queryLatestPost(trx))?.cid);
                postOrCommentOrVote.setDepth(0);
                const file = await this.plebbit.ipfsClient.add(JSON.stringify(postOrCommentOrVote.toJSONIpfs()));
                postOrCommentOrVote.setPostCid(file.path);
                postOrCommentOrVote.setCid(file.path);
                await this.dbHandler.upsertComment(postOrCommentOrVote, challengeRequestId, trx);
                await this.dbHandler.commitTransaction(challengeRequestId);

                debugs.INFO(`New post with cid ${postOrCommentOrVote.cid} has been inserted into DB`);
            } else if (postOrCommentOrVote instanceof Comment) {
                // Comment
                const trx = await this.dbHandler.createTransaction(challengeRequestId);
                const [commentsUnderParent, parent] = await Promise.all([
                    this.dbHandler.queryCommentsUnderComment(postOrCommentOrVote.parentCid, trx),
                    this.dbHandler.queryComment(postOrCommentOrVote.parentCid, trx)
                ]);

                postOrCommentOrVote.setPreviousCid(commentsUnderParent[0]?.cid);
                postOrCommentOrVote.setDepth(parent.depth + 1);
                const file = await this.plebbit.ipfsClient.add(JSON.stringify(postOrCommentOrVote.toJSONIpfs()));
                postOrCommentOrVote.setCid(file.path);
                postOrCommentOrVote.setPostCid(parent.postCid);
                await this.dbHandler.upsertComment(postOrCommentOrVote, challengeRequestId, trx);
                await this.dbHandler.commitTransaction(challengeRequestId);

                debugs.INFO(`New comment with cid ${postOrCommentOrVote.cid} has been inserted into DB`);
            }
        }

        return { publication: postOrCommentOrVote };
    }

    async handleChallengeRequest(request: ChallengeRequestMessage) {
        this.emit("challengerequest", request);
        const [providedChallenges, reasonForSkippingCaptcha] = await this.provideCaptchaCallback(request);
        const decryptedPublication = JSON.parse(
            await decrypt(request.encryptedPublication.encrypted, request.encryptedPublication.encryptedKey, this.signer.privateKey)
        );
        this._challengeToPublication[request.challengeRequestId] = decryptedPublication;
        debugs.DEBUG(`Received a request to a challenge (${request.challengeRequestId})`);
        if (!providedChallenges) {
            // Subplebbit owner has chosen to skip challenging this user or post
            debugs.DEBUG(
                `Skipping challenge for ${request.challengeRequestId}, add publication to IPFS and respond with challengeVerificationMessage right away`
            );
            await this.dbHandler.upsertChallenge(request, undefined);

            const publishedPublication: any = await this.publishPostAfterPassingChallenge(decryptedPublication, request.challengeRequestId);
            const restOfMsg =
                "publication" in publishedPublication
                    ? {
                          encryptedPublication: await encrypt(
                              JSON.stringify(publishedPublication.publication),
                              (publishedPublication.publication.signature || publishedPublication.publication.editSignature).publicKey
                          )
                      }
                    : publishedPublication;
            const challengeVerification = new ChallengeVerificationMessage({
                reason: reasonForSkippingCaptcha,
                challengeSuccess: Boolean(publishedPublication.publication), // If no publication, this will be false
                challengeAnswerId: request.challengeAnswerId,
                challengeErrors: undefined,
                challengeRequestId: request.challengeRequestId,
                ...restOfMsg
            });
            await Promise.all([
                this.dbHandler.upsertChallenge(challengeVerification, undefined),
                this.plebbit.pubsubIpfsClient.pubsub.publish(this.pubsubTopic, uint8ArrayFromString(JSON.stringify(challengeVerification)))
            ]);
            debugs.INFO(`Published ${challengeVerification.type} over pubsub for challenge (${challengeVerification.challengeRequestId})`);
            this.emit("challengeverification", challengeVerification);
        } else {
            const challengeMessage = new ChallengeMessage({
                challengeRequestId: request.challengeRequestId,
                challenges: providedChallenges,
                challengeAnswerId: request.challengeAnswerId
            });
            await Promise.all([
                this.dbHandler.upsertChallenge(challengeMessage, undefined),
                this.plebbit.pubsubIpfsClient.pubsub.publish(this.pubsubTopic, uint8ArrayFromString(JSON.stringify(challengeMessage)))
            ]);
            this.emit("challengemessage", challengeMessage);
            debugs.INFO(`Published ${challengeMessage.type} (${challengeMessage.challengeRequestId}) over pubsub`);
        }
    }

    async handleChallengeAnswer(challengeAnswer: ChallengeAnswerMessage) {
        this.emit("challengeanswer", challengeAnswer);
        const [challengeSuccess, challengeErrors] = await this.validateCaptchaAnswerCallback(challengeAnswer);
        if (challengeSuccess) {
            debugs.DEBUG(`Challenge (${challengeAnswer.challengeRequestId}) has been answered correctly`);
            const storedPublication = this._challengeToPublication[challengeAnswer.challengeRequestId];
            await this.dbHandler.upsertChallenge(new ChallengeAnswerMessage(challengeAnswer), undefined);
            const publishedPublication = await this.publishPostAfterPassingChallenge(storedPublication, challengeAnswer.challengeRequestId); // could contain "publication" or "reason"
            const restOfMsg =
                "publication" in publishedPublication
                    ? {
                          encryptedPublication: await encrypt(
                              JSON.stringify(publishedPublication.publication),
                              (publishedPublication.publication.editSignature || publishedPublication.publication.signature).publicKey
                          )
                      }
                    : publishedPublication;
            const challengeVerification = new ChallengeVerificationMessage({
                challengeRequestId: challengeAnswer.challengeRequestId,
                challengeAnswerId: challengeAnswer.challengeAnswerId,
                challengeSuccess: challengeSuccess,
                challengeErrors: challengeErrors,
                ...restOfMsg
            });
            await Promise.all([
                this.dbHandler.upsertChallenge(challengeVerification, undefined),
                this.plebbit.pubsubIpfsClient.pubsub.publish(this.pubsubTopic, uint8ArrayFromString(JSON.stringify(challengeVerification)))
            ]);
            debugs.INFO(
                `Published ${challengeVerification.type} over pubsub: ${JSON.stringify(
                    removeKeys(challengeVerification, ["publication", "encryptedPublication"])
                )}`
            );
            this.emit("challengeverification", challengeVerification);
        } else {
            debugs.INFO(`Challenge (${challengeAnswer.challengeRequestId}) has been answered incorrectly`);
            const challengeVerification = new ChallengeVerificationMessage({
                challengeRequestId: challengeAnswer.challengeRequestId,
                challengeAnswerId: challengeAnswer.challengeAnswerId,
                challengeSuccess: challengeSuccess,
                challengeErrors: challengeErrors
            });
            await Promise.all([
                this.dbHandler.upsertChallenge(challengeVerification, undefined),
                this.plebbit.pubsubIpfsClient.pubsub.publish(this.pubsubTopic, uint8ArrayFromString(JSON.stringify(challengeVerification)))
            ]);
            debugs.INFO(`Published failed ${challengeVerification.type} (${challengeVerification.challengeRequestId})`);
            this.emit("challengeverification", challengeVerification);
        }
    }

    async processCaptchaPubsub(pubsubMsg) {
        let msgParsed;
        assert(this.dbHandler);
        try {
            msgParsed = JSON.parse(uint8ArrayToString(pubsubMsg.data));
            if (msgParsed.type === PUBSUB_MESSAGE_TYPES.CHALLENGEREQUEST)
                await this.handleChallengeRequest(new ChallengeRequestMessage(msgParsed));
            else if (msgParsed.type === PUBSUB_MESSAGE_TYPES.CHALLENGEANSWER && this._challengeToPublication[msgParsed.challengeRequestId])
                // Only reply to peers who started a challenge request earlier
                await this.handleChallengeAnswer(new ChallengeAnswerMessage(msgParsed));
        } catch (e) {
            e.message = `failed process captcha for challenge request id (${msgParsed?.challengeRequestId}): ${e.message}`;
            debugs.ERROR(e);
            if (msgParsed?.challengeRequestId) await this.dbHandler.rollbackTransaction(msgParsed?.challengeRequestId);
        }
    }

    async defaultProvideCaptcha(request: ChallengeRequestMessage): Promise<[Challenge[], string | undefined]> {
        // Return question, type
        // Expected return is:
        // captcha, reason for skipping captcha (if it's skipped by nullifying captcha)
        const { image, text } = createCaptcha(300, 100);
        this._challengeToSolution[request.challengeRequestId] = [text];
        const imageBuffer = (await image).toString("base64");
        return [
            [
                new Challenge({
                    challenge: imageBuffer,
                    type: CHALLENGE_TYPES.IMAGE
                })
            ],
            undefined
        ];
    }

    async defaultValidateCaptcha(answerMessage: ChallengeAnswerMessage): Promise<[boolean, string[] | undefined]> {
        const actualSolution = this._challengeToSolution[answerMessage.challengeRequestId];
        const answerIsCorrect = JSON.stringify(answerMessage.challengeAnswers) === JSON.stringify(actualSolution);
        debugs.DEBUG(
            `Challenge (${answerMessage.challengeRequestId}): Answer's validity: ${answerIsCorrect}, user's answer: ${answerMessage.challengeAnswers}, actual solution: ${actualSolution}`
        );
        const challengeErrors = answerIsCorrect ? undefined : ["User solved captcha incorrectly"];
        return [answerIsCorrect, challengeErrors];
    }

    async syncComment(dbComment: Comment) {
        assert(this.dbHandler);
        let commentIpns: CommentUpdate | undefined;
        try {
            commentIpns = dbComment.ipnsName && (await loadIpnsAsJson(dbComment.ipnsName, this.plebbit));
        } catch (e) {
            debugs.TRACE(
                `Failed to load Comment (${dbComment.cid}) IPNS (${dbComment.ipnsName}) while syncing. Will attempt to publish a new IPNS record`
            );
        }
        if (!commentIpns || !shallowEqual(commentIpns, dbComment.toJSONCommentUpdate(), ["replies", "signature"])) {
            debugs.DEBUG(`Attempting to update Comment (${dbComment.cid})`);
            await this.sortHandler.deleteCommentPageCache(dbComment);
            const commentReplies = await this.sortHandler.generatePagesUnderComment(dbComment, undefined);
            dbComment.setReplies(commentReplies);
            dbComment.setUpdatedAt(timestamp());
            await this.dbHandler.upsertComment(dbComment, undefined);
            assert(this.signer);
            const subplebbitSignature = await signPublication(
                { ...dbComment.toJSONCommentUpdate(), replies: dbComment?.replies?.toJSON() },
                this.signer,
                this.plebbit,
                "commentupdate"
            );

            return dbComment.edit({ ...removeKeysWithUndefinedValues(dbComment.toJSONCommentUpdate()), signature: subplebbitSignature });
        }
        debugs.TRACE(`Comment (${dbComment.cid}) is up-to-date and does not need syncing`);
    }

    async syncIpnsWithDb() {
        assert(this.dbHandler, "DbHandler need to be defined before syncing");
        assert(this.signer?.address, "Signer is needed to sync");
        debugs.TRACE("Starting to sync IPNS with DB");
        try {
            await this.sortHandler.cacheCommentsPages();
            const dbComments = await this.dbHandler.queryComments();
            await Promise.all([...dbComments.map(async (comment: Comment) => this.syncComment(comment)), this.updateSubplebbitIpns()]);
            await this._keyv.set(this.address, this.toJSON());
            RUNNING_SUBPLEBBITS[this.signer.address] = true;
        } catch (e) {
            debugs.WARN(`Failed to sync due to error: ${e}`);
        }
    }

    async _syncLoop(syncIntervalMs: number) {
        const loop = async () => {
            if (this._sync) {
                await this.syncIpnsWithDb();
                await this._syncLoop(syncIntervalMs);
            }
        };
        await this.syncIpnsWithDb();
        this._syncInterval = setTimeout(loop.bind(this), syncIntervalMs);
    }

    async start(syncIntervalMs = DEFAULT_SYNC_INTERVAL_MS) {
        if (!this.signer?.address)
            throw errcode(new Error(messages.ERR_SUB_SIGNER_NOT_DEFINED), codes.ERR_SUB_SIGNER_NOT_DEFINED, {
                details: `signer: ${JSON.stringify(this.signer)}, address: ${this.address}`
            });
        if (this._sync || RUNNING_SUBPLEBBITS[this.signer.address])
            throw errcode(new Error(messages.ERR_SUB_ALREADY_STARTED), codes.ERR_SUB_ALREADY_STARTED, {
                details: `address: ${this.address}`
            });
        this._sync = true;
        RUNNING_SUBPLEBBITS[this.signer.address] = true;
        await this.prePublish();
        if (!this.provideCaptchaCallback) {
            debugs.INFO("Subplebbit owner has not provided any captcha. Will go with default image captcha");
            this.provideCaptchaCallback = this.defaultProvideCaptcha;
            this.validateCaptchaAnswerCallback = this.defaultValidateCaptcha;
        }
        await this.plebbit.pubsubIpfsClient.pubsub.subscribe(
            this.pubsubTopic,
            async (pubsubMessage) => await this.processCaptchaPubsub(pubsubMessage)
        );
        debugs.INFO(`Waiting for publications on pubsub topic (${this.pubsubTopic})`);
        await this._syncLoop(syncIntervalMs);
    }

    async _addPublicationToDb(publication: Publication) {
        debugs.INFO(`Adding ${publication.getType()} with author (${JSON.stringify(publication.author)}) to DB directly`);
        const randomUUID = uuidv4();
        //@ts-ignore
        await this.dbHandler.upsertChallenge(new ChallengeRequestMessage({ challengeRequestId: randomUUID }));
        return (await this.publishPostAfterPassingChallenge(publication, randomUUID)).publication;
    }
}
