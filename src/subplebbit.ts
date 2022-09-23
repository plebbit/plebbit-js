import { toString as uint8ArrayToString } from "uint8arrays/to-string";
import EventEmitter from "events";
import { sha256 } from "js-sha256";
import { fromString as uint8ArrayFromString } from "uint8arrays/from-string";
import { Challenge, ChallengeAnswerMessage, ChallengeMessage, ChallengeRequestMessage, ChallengeVerificationMessage } from "./challenge";
import assert from "assert";
import { createCaptcha } from "./runtime/node/captcha";
import { SortHandler } from "./sort-handler";
import { ipfsImportKey, loadIpnsAsJson, removeKeys, removeKeysWithUndefinedValues, shallowEqual, timestamp } from "./util";
import { decrypt, encrypt, verifyPublication, Signer, signPublication } from "./signer";
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

const DEFAULT_UPDATE_INTERVAL_MS = 60000;
const DEFAULT_SYNC_INTERVAL_MS = 100000; // 5 minutes

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

    private _challengeToSolution: any;
    private _challengeToPublication: any;
    private provideCaptchaCallback: (request: DecryptedChallengeRequestMessageType) => Promise<[Challenge[], string | undefined]>;
    private validateCaptchaAnswerCallback: (answerMessage: DecryptedChallengeAnswerMessageType) => Promise<[boolean, string[] | undefined]>;
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

    async initSignerIfNeeded() {
        const log = Logger("plebbit-js:subplebbit:prePublish");
        if (this.dbHandler) {
            const dbSigner = await this.dbHandler.querySubplebbitSigner(undefined);
            if (!dbSigner) {
                assert(this.signer, "Subplebbit needs a signer to start");
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

        assert(this.signer?.publicKey);
        this.encryption = {
            type: "aes-cbc",
            publicKey: this.signer.publicKey
        };
    }

    async initDbIfNeeded() {
        if (!this.dbHandler) {
            //@ts-ignore
            this.sortHandler = undefined;
            this.dbHandler = nativeFunctions.createDbHandler({
                address: this.address,
                database: this.database,
                plebbit: {
                    dataPath: this.plebbit.dataPath,
                    createComment: this.plebbit.createComment.bind(this.plebbit),
                    createVote: this.plebbit.createVote.bind(this.plebbit),
                    createCommentEdit: this.plebbit.createCommentEdit.bind(this.plebbit)
                }
            });
        }
        await this.dbHandler.initDbIfNeeded();
        if (!this.sortHandler) this.sortHandler = new SortHandler(this);
        await this.initSignerIfNeeded();
    }

    setProvideCaptchaCallback(newCallback: (request: DecryptedChallengeRequestMessageType) => Promise<[Challenge[], string | undefined]>) {
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

    async prePublish() {
        // Import ipfs key into node (if not imported already)
        // Initialize signer
        // Initialize address (needs signer)
        // Initialize db (needs address)
        const log = Logger("plebbit-js:subplebbit:prePublish");

        if (!this.address && this.signer?.address) this.address = this.signer.address;
        await this.initDbIfNeeded();
        assert(this.address && this.signer, "Both address and signer need to be defined at this point");
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
            log(`Imported subplebbit keys into ipfs node, ${JSON.stringify(ipfsKey)}`);
        } else {
            log.trace(`Subplebbit key is already in ipfs node, no need to import (${JSON.stringify(subplebbitIpfsNodeKey)})`);
            this.ipnsKeyName = subplebbitIpfsNodeKey["name"] || subplebbitIpfsNodeKey["Name"];
        }
        assert(this.ipnsKeyName && this.address && this.signer && this.encryption, "These fields are needed to run the subplebbit");

        const cachedSubplebbit: SubplebbitType | undefined = await this.dbHandler?.keyvGet(this.address);
        if (cachedSubplebbit && JSON.stringify(cachedSubplebbit) !== "{}") this.initSubplebbit(cachedSubplebbit); // Init subplebbit fields from DB

        if (!this.pubsubTopic) {
            this.pubsubTopic = this.address;
            log(`Defaulted subplebbit (${this.address}) pubsub topic to ${this.pubsubTopic} since sub owner hasn't provided any`);
        }
        if (!this.createdAt) {
            this.createdAt = timestamp();
            log(`Subplebbit (${this.address}) createdAt has been set to ${this.createdAt}`);
        }

        if (JSON.stringify(this.toJSON()) !== JSON.stringify(await this.dbHandler?.keyvGet(this.address)))
            await this.dbHandler?.keyvSet(this.address, this.toJSON());
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
        const log = Logger("plebbit-js:subplebbit:edit");

        if (newSubplebbitOptions.address && newSubplebbitOptions.address !== this.address) {
            this.assertDomainResolvesCorrectly(newSubplebbitOptions.address).catch((err) => {
                const editError = errcode(err, err.code, { details: `subplebbit.edit: ${err.details}` });
                log.error(editError);
                this.emit("error", editError);
            });
            log.trace(`Attempting to edit subplebbit.address from ${this.address} to ${newSubplebbitOptions.address}`);
            this.initSubplebbit(newSubplebbitOptions);
            await this.dbHandler.changeDbFilename(newSubplebbitOptions.address, this);
            this.dbHandler = undefined;
            await this.prePublish();
        }

        this.initSubplebbit(newSubplebbitOptions);

        log(`Subplebbit (${this.address}) props (${Object.keys(newSubplebbitOptions)}) has been edited`);
        await this.dbHandler.keyvSet(this.address, this.toJSON());

        return this;
    }

    async updateOnce() {
        const log = Logger("plebbit-js:subplebbit:update");

        if (this._sync) throw errcode(Error(messages.ERR_SUB_CAN_EITHER_RUN_OR_UPDATE), codes.ERR_SUB_CAN_EITHER_RUN_OR_UPDATE);

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
        try {
            const subplebbitIpns: SubplebbitType = await loadIpnsAsJson(ipnsAddress, this.plebbit);
            const [verified, failedVerificationReason] = await verifyPublication(subplebbitIpns, this.plebbit, "subplebbit");
            if (!verified)
                throw errcode(Error(messages.ERR_FAILED_TO_VERIFY_SIGNATURE), codes.ERR_FAILED_TO_VERIFY_SIGNATURE, {
                    details: `subplebbit.update: Subplebbit (${this.address}) IPNS (${ipnsAddress}) signature is invalid. Will not update: ${failedVerificationReason}`
                });
            if (JSON.stringify(this.toJSON()) !== JSON.stringify(subplebbitIpns)) {
                this.initSubplebbit(subplebbitIpns);
                log(`Subplebbit received a new update. Will emit an update event`);
                this.emit("update", subplebbitIpns);
            }
            return this;
        } catch (e) {
            log.error(`Failed to update subplebbit IPNS, error: ${e}`);
            this.emit("error", e);
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
            this.dbHandler?.destoryConnection();
            this.dbHandler = undefined;
            RUNNING_SUBPLEBBITS[this.signer.address] = false;
        }
    }

    async updateSubplebbitIpns() {
        const log = Logger("plebbit-js:subplebbit:sync");

        assert(
            this.dbHandler && this.plebbit.ipfsClient && this.signer,
            "A connection to DB and ipfs client are needed to update subplebbit IPNS"
        );
        // debugger;
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
            log(`Subplebbit IPNS (${resolvedAddress}) is not defined, will publish a new record`);
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

        this.metricsCid = (await this.plebbit.ipfsClient.add(JSON.stringify(metrics))).path;

        const lastPublishOverTwentyMinutes = this.updatedAt < timestamp() - 60 * 20;

        if (!currentIpns || JSON.stringify(currentIpns) !== JSON.stringify(this.toJSON()) || lastPublishOverTwentyMinutes) {
            this.updatedAt = timestamp();
            this.signature = await signPublication(this.toJSON(), this.signer, this.plebbit, "subplebbit");
            this.dbHandler.keyvSet(this.address, this.toJSON());
            const file = await this.plebbit.ipfsClient.add(JSON.stringify(this.toJSON()));
            await this.plebbit.ipfsClient.name.publish(file.path, {
                lifetime: "72h", // TODO decide on optimal time later
                key: this.ipnsKeyName,
                allowOffline: true
            });
            log.trace(`Published a new IPNS record for sub(${this.address})`);
        }
    }

    async handleCommentEdit(commentEdit: CommentEdit, challengeRequestId: string) {
        const log = Logger("plebbit-js:subplebbit:handleChallengeExchange:storePublicationIfValid:handleCommentEdit");

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
                    log.error(msg);
                    return msg;
                }
            }

            await this.dbHandler.insertEdit(commentEdit.toJSONForDb(challengeRequestId));
            // If comment.flair is last modified by a mod, then reject
            await this.dbHandler.editComment(commentEdit.toJSONForDb(challengeRequestId));
            // const commentAfterEdit = await this.dbHandler.queryComment(commentEdit.commentCid, undefined);
            log.trace(
                `Updated comment (${commentEdit.commentCid}) with CommentEdit: ${JSON.stringify(
                    removeKeys(commentEdit.toJSON(), ["signature"])
                )}`
            );
        } else if (modRole) {
            log.trace(
                `${modRole.role} (${editorAddress}) is attempting to CommentEdit ${
                    commentToBeEdited?.cid
                } with CommentEdit (${JSON.stringify(removeKeys(commentEdit.toJSON(), ["signature"]))})`
            );

            for (const editField of Object.keys(removeKeysWithUndefinedValues(commentEdit.toJSON()))) {
                if (!MOD_EDIT_FIELDS.includes(<any>editField)) {
                    const msg = `${modRole.role} (${editorAddress}) included field (${editField}) that cannot be used for a mod's CommentEdit`;
                    log.error(msg);
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
                    `Mod (${JSON.stringify(modRole)}) has add following props to author (${newAuthorProps.address}):  ${JSON.stringify(
                        newAuthorProps
                    )}`
                );
            }
        } else {
            // CommentEdit is signed by someone who's not the original author or a mod. Reject it
            // Editor has no subplebbit role like owner, moderator or admin, and their signer is not the signer used in the original comment
            const msg = `Editor (non-mod) - (${editorAddress}) attempted to edit a comment (${commentEdit.commentCid}) without having original author keys.`;
            log(msg);
            return msg;
        }
    }

    async handleVote(newVote: Vote, challengeRequestId: string) {
        assert(this.dbHandler);
        const log = Logger("plebbit-js:subplebbit:handleChallengeExchange:storePublicationIfValid:handleVote");

        const lastVote = await this.dbHandler.getLastVoteOfAuthor(newVote.commentCid, newVote.author.address);

        if (lastVote && newVote.signature.publicKey !== lastVote.signature.publicKey) {
            log(
                `Author (${newVote.author.address}) attempted to edit a comment vote (${newVote.commentCid}) without having correct credentials`
            );
            return `Author (${newVote.author.address}) attempted to change vote on  ${newVote.commentCid} without having correct credentials`;
        } else {
            await this.dbHandler.upsertVote(newVote.toJSONForDb(challengeRequestId), newVote.author.toJSONForDb(), undefined);
            log.trace(`Upserted new vote (${newVote.vote}) for comment ${newVote.commentCid}`);
        }
    }

    async storePublicationIfValid(
        publication: DecryptedChallengeRequestMessageType["publication"],
        challengeRequestId: string
    ): Promise<Vote | CommentEdit | Post | Comment | string> {
        const log = Logger("plebbit-js:subplebbit:handleChallengeExchange:storePublicationIfValid");

        assert.equal(publication.constructor.name, "Object", "Publication to store has to be a JSON object");
        assert(this.dbHandler && this.plebbit.ipfsClient);

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
                log(msg);
                return msg;
            }
        } else {
            const msg = `Rejecting ${postOrCommentOrVote.constructor.name} because it doesn't have author.address`;
            log(msg);
            return msg;
        }

        if (!(postOrCommentOrVote instanceof Post)) {
            const parentCid: string | undefined =
                postOrCommentOrVote instanceof Comment
                    ? postOrCommentOrVote.parentCid
                    : postOrCommentOrVote instanceof Vote || postOrCommentOrVote instanceof CommentEdit
                    ? postOrCommentOrVote.commentCid
                    : undefined;

            const errResponse = `Rejecting ${postOrCommentOrVote.constructor.name} because its parentCid or commentCid is not defined`;
            if (!parentCid) {
                log(errResponse);
                return errResponse;
            }

            const parent = await this.dbHandler.queryComment(parentCid);
            if (!parent) {
                log(errResponse);
                return errResponse;
            }

            if (parent.timestamp > postOrCommentOrVote.timestamp) {
                const reason = `Rejecting ${postOrCommentOrVote.constructor.name} because its timestamp (${postOrCommentOrVote.timestamp}) is earlier than its parent (${parent.timestamp})`;
                log(reason);
                return reason;
            }
        }
        if (this.plebbit.resolver.isDomain(publication.author.address)) {
            const derivedAddress = await getPlebbitAddressFromPublicKeyPem(postOrCommentOrVote.signature.publicKey);
            const resolvedAddress = await this.plebbit.resolver.resolveAuthorAddressIfNeeded(publication.author.address);
            if (resolvedAddress !== derivedAddress) {
                // Means ENS's plebbit-author-address is resolving to another address, which shouldn't happen
                const msg = `domain (${postOrCommentOrVote.author.address}) plebbit-author-address (${resolvedAddress}) does not have the same signer address (${this.signer?.address})`;
                log(msg);
                return msg;
            }
        }

        const [signatureIsVerified, failedVerificationReason] = await verifyPublication(
            postOrCommentOrVote,
            this.plebbit,
            postOrCommentOrVote.getType()
        );
        if (!signatureIsVerified) {
            const msg = `Author (${
                postOrCommentOrVote.author.address
            }) ${postOrCommentOrVote.getType()}'s signature is invalid: ${failedVerificationReason}`;
            log(msg);
            return msg;
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
                } due to previous ${postOrCommentOrVote.getType()} having same ipns key name (duplicate?)`;
                log(`${msg}: ${e}`);
                return msg;
            }
            if (postOrCommentOrVote instanceof Post) {
                const trx = await this.dbHandler.createTransaction(challengeRequestId);
                postOrCommentOrVote.setPreviousCid((await this.dbHandler.queryLatestPost(trx))?.cid);
                await this.dbHandler.commitTransaction(challengeRequestId);
                postOrCommentOrVote.setDepth(0);
                const file = await this.plebbit.ipfsClient.add(JSON.stringify(postOrCommentOrVote.toJSONIpfs()));
                postOrCommentOrVote.setPostCid(file.path);
                postOrCommentOrVote.setCid(file.path);
                await this.dbHandler.upsertComment(
                    postOrCommentOrVote.toJSONForDb(challengeRequestId),
                    postOrCommentOrVote.author.toJSONForDb(),
                    undefined
                );

                log(`New post with cid ${postOrCommentOrVote.cid} has been inserted into DB`);
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
                const file = await this.plebbit.ipfsClient.add(JSON.stringify(postOrCommentOrVote.toJSONIpfs()));
                postOrCommentOrVote.setCid(file.path);
                postOrCommentOrVote.setPostCid(parent.postCid);
                await this.dbHandler.upsertComment(
                    postOrCommentOrVote.toJSONForDb(challengeRequestId),
                    postOrCommentOrVote.author.toJSONForDb(),
                    undefined
                );

                log(`New comment with cid ${postOrCommentOrVote.cid} has been inserted into DB`);
            }
        }

        return postOrCommentOrVote;
    }

    async handleChallengeRequest(request: ChallengeRequestMessage) {
        assert(this.dbHandler);
        const log = Logger("plebbit-js:subplebbit:handleChallengeRequest");
        assert(this.signer);

        const decryptedPublication = JSON.parse(
            await decrypt(request.encryptedPublication.encrypted, request.encryptedPublication.encryptedKey, this.signer.privateKey)
        );
        const requestWithDecryptedPublication: DecryptedChallengeRequestMessageType = {
            ...request,
            publication: decryptedPublication
        };
        this.emit("challengerequest", requestWithDecryptedPublication);
        const [providedChallenges, reasonForSkippingCaptcha] = await this.provideCaptchaCallback(requestWithDecryptedPublication);
        this._challengeToPublication[request.challengeRequestId] = decryptedPublication;
        log(`Received a request to a challenge (${request.challengeRequestId})`);
        if (!providedChallenges) {
            // Subplebbit owner has chosen to skip challenging this user or post
            log.trace(
                `Skipping challenge for ${request.challengeRequestId}, add publication to IPFS and respond with challengeVerificationMessage right away`
            );
            await this.dbHandler.upsertChallenge(request.toJSONForDb(), undefined);

            const publicationOrReason = await this.storePublicationIfValid(decryptedPublication, request.challengeRequestId);
            const encryptedPublication =
                typeof publicationOrReason !== "string"
                    ? await encrypt(JSON.stringify(publicationOrReason), publicationOrReason.signature.publicKey)
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
                signature: await signPublication(toSignMsg, this.signer, this.plebbit, "challengeverificationmessage")
            });

            await Promise.all([
                this.dbHandler.upsertChallenge(challengeVerification.toJSONForDb(), undefined),
                this.plebbit.pubsubIpfsClient.pubsub.publish(this.pubsubTopic, uint8ArrayFromString(JSON.stringify(challengeVerification)))
            ]);
            log.trace(`Published ${challengeVerification.type} over pubsub for challenge (${challengeVerification.challengeRequestId})`);
            this.emit("challengeverification", { ...challengeVerification, publication: decryptedPublication });
        } else {
            const encryptedChallenges = await encrypt(
                JSON.stringify(providedChallenges),
                (decryptedPublication.signature || decryptedPublication.editSignature).publicKey
            );

            const toSignChallenge: Omit<ChallengeMessageType, "signature"> = {
                type: "CHALLENGE",
                protocolVersion: env.PROTOCOL_VERSION,
                userAgent: env.USER_AGENT,
                challengeRequestId: request.challengeRequestId,
                encryptedChallenges: encryptedChallenges
            };

            const challengeSignature = await signPublication(toSignChallenge, this.signer, this.plebbit, "challengemessage");
            const challengeMessage = new ChallengeMessage({ ...toSignChallenge, signature: challengeSignature });

            await Promise.all([
                this.dbHandler.upsertChallenge({ ...challengeMessage.toJSONForDb(), challenges: providedChallenges }, undefined),
                this.plebbit.pubsubIpfsClient.pubsub.publish(this.pubsubTopic, uint8ArrayFromString(JSON.stringify(challengeMessage)))
            ]);
            this.emit("challengemessage", { ...challengeMessage, challenges: providedChallenges });
            log.trace(`Published ${challengeMessage.type} (${challengeMessage.challengeRequestId}) over pubsub`);
        }
    }

    async handleChallengeAnswer(challengeAnswer: ChallengeAnswerMessage) {
        assert(this.dbHandler && this.signer);
        const log = Logger("plebbit-js:subplebbit:handleChallengeAnswer");

        const decryptedAnswers = JSON.parse(
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
            log.trace(`Challenge (${challengeAnswer.challengeRequestId}) has been answered correctly`);
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
                    ? await encrypt(JSON.stringify(publicationOrReason), publicationOrReason.signature.publicKey)
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
                signature: await signPublication(toSignMsg, this.signer, this.plebbit, "challengeverificationmessage")
            });

            await Promise.all([
                this.dbHandler.upsertChallenge(challengeVerification.toJSONForDb(), undefined),
                this.plebbit.pubsubIpfsClient.pubsub.publish(this.pubsubTopic, uint8ArrayFromString(JSON.stringify(challengeVerification)))
            ]);
            log(
                `Published ${challengeVerification.type} over pubsub: ${JSON.stringify(
                    removeKeys(challengeVerification, ["publication", "encryptedPublication"])
                )}`
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
            assert(this.signer);

            const challengeVerification = new ChallengeVerificationMessage({
                ...toSignVerification,
                signature: await signPublication(toSignVerification, this.signer, this.plebbit, "challengeverificationmessage")
            });

            await Promise.all([
                this.dbHandler.upsertChallenge(challengeVerification.toJSONForDb(), undefined),
                this.plebbit.pubsubIpfsClient.pubsub.publish(this.pubsubTopic, uint8ArrayFromString(JSON.stringify(challengeVerification)))
            ]);
            log(`Published failed ${challengeVerification.type} (${challengeVerification.challengeRequestId})`);
            this.emit("challengeverification", challengeVerification);
        }
    }

    private async _verifyPubsubMsgSignature(msgParsed: ChallengeRequestMessageType | ChallengeAnswerMessageType) {
        const [signatureIsVerified, failedVerificationReason] = await verifyPublication(
            msgParsed,
            this.plebbit,
            msgParsed.type === "CHALLENGEANSWER" ? "challengeanswermessage" : "challengerequestmessage"
        );
        if (!signatureIsVerified)
            throw errcode(Error(messages.ERR_FAILED_TO_VERIFY_SIGNATURE), codes.ERR_FAILED_TO_VERIFY_SIGNATURE, {
                details: `subplebbit.handleChallengeExchange: Failed to verify ${msgParsed.type}, Failed verification reason: ${failedVerificationReason}`
            });
    }

    async handleChallengeExchange(pubsubMsg) {
        const log = Logger("plebbit-js:subplebbit:handleChallengeExchange");

        let msgParsed: ChallengeRequestMessageType | ChallengeAnswerMessageType | undefined;
        assert(this.dbHandler);
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
            log.error(e);
            if (msgParsed?.challengeRequestId) await this.dbHandler.rollbackTransaction(msgParsed?.challengeRequestId);
        }
    }

    async defaultProvideCaptcha(request: DecryptedChallengeRequestMessageType): Promise<[Challenge[], string | undefined]> {
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
                    type: "image"
                })
            ],
            undefined
        ];
    }

    async defaultValidateCaptcha(answerMessage: DecryptedChallengeAnswerMessageType): Promise<[boolean, string[] | undefined]> {
        const log = Logger("plebbit-js:subplebbit:validateCaptcha");

        const actualSolution = this._challengeToSolution[answerMessage.challengeRequestId];
        const answerIsCorrect = JSON.stringify(answerMessage.challengeAnswers) === JSON.stringify(actualSolution);
        log(
            `Challenge (${answerMessage.challengeRequestId}): Answer's validity: ${answerIsCorrect}, user's answer: ${answerMessage.challengeAnswers}, actual solution: ${actualSolution}`
        );
        const challengeErrors = answerIsCorrect ? undefined : ["User solved captcha incorrectly"];
        return [answerIsCorrect, challengeErrors];
    }

    async syncComment(dbComment: Comment) {
        const log = Logger("plebbit-js:subplebbit:sync:syncComment");

        assert(this.dbHandler && this.signer);
        let commentIpns: CommentUpdate | undefined;
        try {
            commentIpns = dbComment.ipnsName && (await loadIpnsAsJson(dbComment.ipnsName, this.plebbit));
        } catch (e) {
            log.trace(
                `Failed to load Comment (${dbComment.cid}) IPNS (${dbComment.ipnsName}) while syncing. Will attempt to publish a new IPNS record`
            );
        }
        if (!commentIpns || !shallowEqual(commentIpns, dbComment.toJSONCommentUpdate(), ["replies", "signature"])) {
            log.trace(`Attempting to update Comment (${dbComment.cid})`);
            await this.sortHandler.deleteCommentPageCache(dbComment);
            const commentReplies = await this.sortHandler.generatePagesUnderComment(dbComment, undefined);
            dbComment.setReplies(commentReplies);
            dbComment.setUpdatedAt(timestamp());
            await this.dbHandler.upsertComment(dbComment.toJSONForDb(undefined), dbComment.author.toJSONForDb(), undefined);
            const subplebbitSignature = await signPublication(dbComment.toJSONCommentUpdate(), this.signer, this.plebbit, "commentupdate");

            return dbComment.edit({ ...dbComment.toJSONCommentUpdate(), signature: subplebbitSignature });
        }
        log.trace(`Comment (${dbComment.cid}) is up-to-date and does not need syncing`);
    }

    async syncIpnsWithDb() {
        const log = Logger("plebbit-js:subplebbit:sync");

        assert(this.dbHandler, "DbHandler need to be defined before syncing");
        assert(this.signer?.address, "Signer is needed to sync");
        log.trace("Starting to sync IPNS with DB");
        await this.initDbIfNeeded();
        try {
            await this.sortHandler.cacheCommentsPages();
            const dbComments = await this.dbHandler.queryComments();
            await Promise.all([...dbComments.map(async (comment: Comment) => this.syncComment(comment)), this.updateSubplebbitIpns()]);
            RUNNING_SUBPLEBBITS[this.signer.address] = true;
        } catch (e) {
            log.error(`Failed to sync due to error: ${e}`);
        }
    }

    async _syncLoop(syncIntervalMs: number) {
        const loop = async () => {
            if (this._sync) {
                await this.syncIpnsWithDb();
                await this._syncLoop(syncIntervalMs);
            }
        };
        this._syncInterval = setTimeout(loop.bind(this), syncIntervalMs);
    }

    async start(syncIntervalMs = DEFAULT_SYNC_INTERVAL_MS) {
        const log = Logger("plebbit-js:subplebbit:start");

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
            log("Subplebbit owner has not provided any captcha. Will go with default image captcha");
            this.provideCaptchaCallback = this.defaultProvideCaptcha;
            this.validateCaptchaAnswerCallback = this.defaultValidateCaptcha;
        }
        await this.plebbit.pubsubIpfsClient.pubsub.subscribe(
            this.pubsubTopic,
            async (pubsubMessage) => await this.handleChallengeExchange(pubsubMessage)
        );
        log.trace(`Waiting for publications on pubsub topic (${this.pubsubTopic})`);
        await this.syncIpnsWithDb();

        await this._syncLoop(syncIntervalMs);
    }

    async _addPublicationToDb(publication: CommentEdit | Vote | Comment | Post) {
        assert(this.dbHandler);
        const log = Logger("plebbit-js:subplebbit:_addPublicationToDb");
        const [validSignature, failedVerificationReason] = await verifyPublication(publication, this.plebbit, publication.getType());
        if (!validSignature)
            throw errcode(Error(messages.ERR_FAILED_TO_VERIFY_SIGNATURE), codes.ERR_FAILED_TO_VERIFY_SIGNATURE, {
                details: `subplebbit._addPublicationToDb: Failed verification reason: ${failedVerificationReason}`
            });
        log(`Adding ${publication.getType()} with author (${JSON.stringify(publication.author)}) to DB directly`);
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
