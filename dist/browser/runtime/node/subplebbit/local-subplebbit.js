import Logger from "@plebbit/plebbit-logger";
import { LRUCache } from "lru-cache";
import { SortHandler } from "./sort-handler.js";
import { DbHandler } from "./db-handler.js";
import { of as calculateIpfsHash } from "typestub-ipfs-only-hash";
import { doesDomainAddressHaveCapitalLetter, genToArray, hideClassPrivateProps, isLinkOfMedia, isStringDomain, removeNullUndefinedEmptyObjectsValuesRecursively, removeUndefinedValuesRecursively, throwWithErrorCode, timestamp } from "../../../util.js";
import { STORAGE_KEYS } from "../../../constants.js";
import { stringify as deterministicStringify } from "safe-stable-stringify";
import { PlebbitError } from "../../../plebbit-error.js";
import { cleanUpBeforePublishing, signChallengeMessage, signChallengeVerification, signCommentUpdate, signSubplebbit, verifyChallengeAnswer, verifyChallengeRequest, verifyCommentEdit, verifyCommentUpdate } from "../../../signer/signatures.js";
import { getThumbnailUrlOfLink, importSignerIntoIpfsNode, moveSubplebbitDbToDeletedDirectory } from "../util.js";
import { getErrorCodeFromMessage } from "../../../util.js";
import { SignerWithPublicKeyAddress, decryptEd25519AesGcmPublicKeyBuffer, verifyCommentIpfs, verifyCommentPubsubMessage, verifySubplebbit, verifyVote } from "../../../signer/index.js";
import { encryptEd25519AesGcmPublicKeyBuffer } from "../../../signer/encryption.js";
import { messages } from "../../../errors.js";
import { getChallengeVerification, getSubplebbitChallengeFromSubplebbitChallengeSettings } from "./challenges/index.js";
import * as cborg from "cborg";
import assert from "assert";
import env from "../../../version.js";
import { sha256 } from "js-sha256";
import { getIpfsKeyFromPrivateKey, getPlebbitAddressFromPublicKey, getPublicKeyFromPrivateKey } from "../../../signer/util.js";
import { RpcLocalSubplebbit } from "../../../subplebbit/rpc-local-subplebbit.js";
import * as remeda from "remeda";
import { AuthorCommentEditPubsubSchema, CommentEditPubsubMessageSchema, CommentEditPubsubMessageWithFlexibleAuthorSchema, CommentEditReservedFields, ModeratorCommentEditPubsubSchema, uniqueAuthorFields, uniqueModFields } from "../../../publications/comment-edit/schema.js";
import { SubplebbitEditOptionsSchema, SubplebbitIpfsSchema, SubplebbitRoleSchema } from "../../../subplebbit/schema.js";
import { ChallengeAnswerMessageSchema, ChallengeMessageSchema, ChallengeRequestMessageSchema, ChallengeVerificationMessageSchema, DecryptedChallengeAnswerSchema, DecryptedChallengeRequestSchema, DecryptedChallengeSchema } from "../../../pubsub-messages/schema.js";
import { parseJsonWithPlebbitErrorIfFails } from "../../../schema/schema-util.js";
import { CommentIpfsSchema, CommentPubsubMessageReservedFields, CommentPubsubMessageSchema, CommentPubsubMessageWithFlexibleAuthorRefinementSchema } from "../../../publications/comment/schema.js";
import { VotePubsubMessageSchema, VotePubsubReservedFields } from "../../../publications/vote/schema.js";
import { v4 as uuidV4 } from "uuid";
import { AuthorReservedFields } from "../../../schema/schema.js";
// This is a sub we have locally in our plebbit datapath, in a NodeJS environment
export class LocalSubplebbit extends RpcLocalSubplebbit {
    constructor(plebbit) {
        super(plebbit);
        this._postUpdatesBuckets = [86400, 604800, 2592000, 3153600000]; // 1 day, 1 week, 1 month, 100 years. Expecting to be sorted from smallest to largest
        this._defaultSubplebbitChallenges = [
            {
                name: "captcha-canvas-v3",
                exclude: [{ role: ["moderator", "admin", "owner"], post: false, reply: false, vote: false }]
            }
        ];
        this._publishLoopPromise = undefined;
        this._publishInterval = undefined;
        this.handleChallengeExchange = this.handleChallengeExchange.bind(this);
        this.started = false;
        this._subplebbitUpdateTrigger = false;
        this._stopHasBeenCalled = false;
        //@ts-expect-error
        this._challengeAnswerPromises = //@ts-expect-error
            this._challengeAnswerResolveReject = //@ts-expect-error
                this._ongoingChallengeExchanges = //@ts-expect-error
                    this._cidsToUnPin = //@ts-expect-error
                        this._internalStateUpdateId =
                            undefined;
        hideClassPrivateProps(this);
    }
    // This will be stored in DB
    toJSONInternalAfterFirstUpdate() {
        return {
            ...remeda.omit(this.toJSONInternalRpcAfterFirstUpdate(), ["started"]),
            signer: remeda.pick(this.signer, ["privateKey", "type", "address", "shortAddress", "publicKey"]),
            _subplebbitUpdateTrigger: this._subplebbitUpdateTrigger,
            _internalStateUpdateId: this._internalStateUpdateId
        };
    }
    toJSONInternalBeforeFirstUpdate() {
        return {
            ...remeda.omit(this.toJSONInternalRpcBeforeFirstUpdate(), ["started"]),
            signer: remeda.pick(this.signer, ["privateKey", "type", "address", "shortAddress", "publicKey"]),
            _subplebbitUpdateTrigger: this._subplebbitUpdateTrigger,
            _internalStateUpdateId: this._internalStateUpdateId
        };
    }
    toJSONInternalRpcAfterFirstUpdate() {
        return {
            ...super.toJSONInternalRpcAfterFirstUpdate(),
            signer: remeda.pick(this.signer, ["publicKey", "address", "shortAddress", "type"])
        };
    }
    toJSONInternalRpcBeforeFirstUpdate() {
        return {
            ...super.toJSONInternalRpcBeforeFirstUpdate(),
            signer: remeda.pick(this.signer, ["publicKey", "address", "shortAddress", "type"])
        };
    }
    async _updateStartedValue() {
        this.started = await this._dbHandler.isSubStartLocked(this.address);
    }
    async initNewLocalSubPropsNoMerge(newProps) {
        await this._initSignerProps(newProps.signer);
        this.title = newProps.title;
        this.description = newProps.description;
        this.setAddress(newProps.address);
        this.pubsubTopic = newProps.pubsubTopic;
        this.roles = newProps.roles;
        this.features = newProps.features;
        this.suggested = newProps.suggested;
        this.rules = newProps.rules;
        this.flairs = newProps.flairs;
    }
    async initInternalSubplebbitAfterFirstUpdateNoMerge(newProps) {
        await this.initRpcInternalSubplebbitAfterFirstUpdateNoMerge({ ...newProps, started: this.started });
        await this._initSignerProps(newProps.signer);
        this._subplebbitUpdateTrigger = newProps._subplebbitUpdateTrigger;
        this._internalStateUpdateId = newProps._internalStateUpdateId;
    }
    async initInternalSubplebbitBeforeFirstUpdateNoMerge(newProps) {
        await this.initRpcInternalSubplebbitBeforeFirstUpdateNoMerge({ ...newProps, started: this.started });
        await this._initSignerProps(newProps.signer);
        this._subplebbitUpdateTrigger = newProps._subplebbitUpdateTrigger;
        this._internalStateUpdateId = newProps._internalStateUpdateId;
    }
    async initDbHandlerIfNeeded() {
        if (!this._dbHandler) {
            this._dbHandler = new DbHandler(this);
            await this._dbHandler.initDbConfigIfNeeded();
            this._sortHandler = new SortHandler(this);
        }
    }
    async _loadLocalSubDb() {
        // This function will load the InternalSubplebbit props from the local db and update its props with it
        await this.initDbHandlerIfNeeded();
        await this._dbHandler.initDbIfNeeded();
        await this._dbHandler.createOrMigrateTablesIfNeeded();
        await this._updateInstanceStateWithDbState(); // Load InternalSubplebbit from DB here
        if (!this.signer)
            throwWithErrorCode("ERR_LOCAL_SUB_HAS_NO_SIGNER_IN_INTERNAL_STATE", { address: this.address });
        await this._updateStartedValue();
        await this._dbHandler.destoryConnection(); // Need to destory connection so process wouldn't hang
    }
    async _importSubplebbitSignerIntoIpfsIfNeeded() {
        if (!this.signer.ipnsKeyName)
            throw Error("subplebbit.signer.ipnsKeyName is not defined");
        if (!this.signer.ipfsKey)
            throw Error("subplebbit.signer.ipfsKey is not defined");
        const ipfsNodeKeys = await this._clientsManager.getDefaultIpfs()._client.key.list();
        if (!ipfsNodeKeys.find((key) => key.name === this.signer.ipnsKeyName))
            await importSignerIntoIpfsNode(this.signer.ipnsKeyName, this.signer.ipfsKey, {
                url: this._plebbit.ipfsHttpClientsOptions[0].url.toString(),
                headers: this._plebbit.ipfsHttpClientsOptions[0].headers
            });
    }
    async _updateDbInternalState(props) {
        if (remeda.isEmpty(props))
            return;
        props._internalStateUpdateId = uuidV4();
        await this._dbHandler.lockSubState();
        const internalStateBefore = await this._getDbInternalState(false);
        await this._dbHandler.keyvSet(STORAGE_KEYS[STORAGE_KEYS.INTERNAL_SUBPLEBBIT], {
            ...internalStateBefore,
            ...props
        });
        await this._dbHandler.unlockSubState();
        this._internalStateUpdateId = props._internalStateUpdateId;
    }
    async _getDbInternalState(lock = true) {
        if (!(await this._dbHandler.keyvHas(STORAGE_KEYS[STORAGE_KEYS.INTERNAL_SUBPLEBBIT])))
            return undefined;
        if (lock)
            await this._dbHandler.lockSubState();
        const internalState = (await this._dbHandler.keyvGet(STORAGE_KEYS[STORAGE_KEYS.INTERNAL_SUBPLEBBIT]));
        if (lock)
            await this._dbHandler.unlockSubState();
        return internalState;
    }
    async _updateInstanceStateWithDbState() {
        const currentDbState = await this._getDbInternalState();
        if (!currentDbState)
            throw Error("current db state should be defined before updating instance state with it");
        if ("updatedAt" in currentDbState)
            await this.initInternalSubplebbitAfterFirstUpdateNoMerge({ ...currentDbState, address: this.address });
        else
            await this.initInternalSubplebbitBeforeFirstUpdateNoMerge({ ...currentDbState, address: this.address });
    }
    async _setChallengesToDefaultIfNotDefined(log) {
        if (this._usingDefaultChallenge !== false &&
            (!this.settings?.challenges || remeda.isDeepEqual(this.settings?.challenges, this._defaultSubplebbitChallenges)))
            this._usingDefaultChallenge = true;
        if (this._usingDefaultChallenge && !remeda.isDeepEqual(this.settings?.challenges, this._defaultSubplebbitChallenges)) {
            await this.edit({ settings: { ...this.settings, challenges: this._defaultSubplebbitChallenges } });
            log(`Defaulted the challenges of subplebbit (${this.address}) to`, this._defaultSubplebbitChallenges);
        }
    }
    async _createNewLocalSubDb() {
        // We're creating a totally new subplebbit here with a new db
        // This function should be called only once per sub
        const log = Logger("plebbit-js:local-subplebbit:_createNewLocalSubDb");
        await this.initDbHandlerIfNeeded();
        await this._dbHandler.initDbIfNeeded();
        await this._dbHandler.createOrMigrateTablesIfNeeded();
        await this._initSignerProps(this.signer); // init this.encryption as well
        if (!this.pubsubTopic)
            this.pubsubTopic = remeda.clone(this.signer.address);
        if (typeof this.createdAt !== "number")
            this.createdAt = timestamp();
        if (!this.protocolVersion)
            this.protocolVersion = env.PROTOCOL_VERSION;
        if (!this.settings?.challenges) {
            this.settings = { ...this.settings, challenges: this._defaultSubplebbitChallenges };
            this.challenges = this.settings.challenges.map(getSubplebbitChallengeFromSubplebbitChallengeSettings);
            this._usingDefaultChallenge = true;
            log(`Defaulted the challenges of subplebbit (${this.address}) to`, this._defaultSubplebbitChallenges);
        }
        await this._updateDbInternalState(this.toJSONInternalBeforeFirstUpdate());
        await this._updateStartedValue();
        await this._dbHandler.destoryConnection(); // Need to destory connection so process wouldn't hang
    }
    async _calculateNewPostUpdates() {
        const postUpdates = {};
        for (const timeBucket of this._postUpdatesBuckets) {
            try {
                const statRes = await this._clientsManager
                    .getDefaultIpfs()
                    ._client.files.stat(`/${this.address}/postUpdates/${timeBucket}`);
                if (statRes.blocks !== 0)
                    postUpdates[String(timeBucket)] = String(statRes.cid);
            }
            catch { }
        }
        if (remeda.isEmpty(postUpdates))
            return undefined;
        return postUpdates;
    }
    async _calculateLatestUpdateTrigger() {
        const lastPublishTooOld = this.updatedAt < timestamp() - 60 * 15; // Publish a subplebbit record every 15 minutes at least
        const dbInstance = await this._getDbInternalState(true);
        if (!dbInstance)
            throw Error("Db instance should be defined prior to publishing a new IPNS");
        this._subplebbitUpdateTrigger =
            this._subplebbitUpdateTrigger ||
                ("_subplebbitUpdateTrigger" in dbInstance && dbInstance._subplebbitUpdateTrigger) ||
                lastPublishTooOld;
    }
    async updateSubplebbitIpnsIfNeeded() {
        const log = Logger("plebbit-js:local-subplebbit:sync");
        await this._calculateLatestUpdateTrigger();
        if (!this._subplebbitUpdateTrigger)
            return; // No reason to update
        const trx = await this._dbHandler.createTransaction("subplebbit");
        const latestPost = await this._dbHandler.queryLatestPostCid(trx);
        const latestComment = await this._dbHandler.queryLatestCommentCid(trx);
        await this._dbHandler.commitTransaction("subplebbit");
        const [stats, subplebbitPosts] = await Promise.all([
            this._dbHandler.querySubplebbitStats(undefined),
            this._sortHandler.generateSubplebbitPosts()
        ]);
        if (subplebbitPosts && this.posts?.pageCids) {
            const newPageCids = remeda.unique(Object.values(subplebbitPosts.pageCids));
            const pageCidsToUnPin = remeda.unique(Object.values(this.posts.pageCids).filter((oldPageCid) => !newPageCids.includes(oldPageCid)));
            this._cidsToUnPin.push(...pageCidsToUnPin);
        }
        const newPostUpdates = await this._calculateNewPostUpdates();
        const statsCid = (await this._clientsManager.getDefaultIpfs()._client.add(deterministicStringify(stats))).path;
        if (this.statsCid && statsCid !== this.statsCid)
            this._cidsToUnPin.push(this.statsCid);
        await this._updateInstanceStateWithDbState();
        const updatedAt = timestamp() === this.updatedAt ? timestamp() + 1 : timestamp();
        const newIpns = {
            ...cleanUpBeforePublishing({
                ...remeda.omit(this._toJSONIpfsBaseNoPosts(), ["signature"]),
                lastPostCid: latestPost?.cid,
                lastCommentCid: latestComment?.cid,
                statsCid,
                updatedAt,
                postUpdates: newPostUpdates,
                protocolVersion: env.PROTOCOL_VERSION
            })
        };
        // posts should not be cleaned up because we want to make sure not to modify authors' posts
        if (subplebbitPosts)
            newIpns.posts = removeUndefinedValuesRecursively({
                pageCids: subplebbitPosts.pageCids,
                pages: remeda.pick(subplebbitPosts.pages, ["hot"])
            });
        else
            await this._updateDbInternalState({ posts: undefined }); // make sure db resets posts as well
        const signature = await signSubplebbit(newIpns, this.signer);
        const newSubplebbitRecord = { ...newIpns, signature };
        await this._validateSubSchemaAndSignatureBeforePublishing(newSubplebbitRecord);
        const file = await this._clientsManager.getDefaultIpfs()._client.add(deterministicStringify(newSubplebbitRecord));
        // If this._stopHasBeenCalled = false, then this is the last publish before stopping
        // TODO double check these values
        const ttl = this._stopHasBeenCalled ? `${this._plebbit.publishInterval * 3}ms` : undefined;
        const lifetime = `24h`; // doesn't matter anyway, DHT drops all entries after 24h
        const publishRes = await this._clientsManager.getDefaultIpfs()._client.name.publish(file.path, {
            key: this.signer.ipnsKeyName,
            allowOffline: true,
            ttl,
            lifetime
        });
        log(`Published a new IPNS record for sub(${this.address}) on IPNS (${publishRes.name}) that points to file (${publishRes.value}) with updatedAt (${newSubplebbitRecord.updatedAt})`);
        this._unpinStaleCids().catch((err) => log.error("Failed to unpin stale cids due to ", err));
        this._cidsToUnPin = [file.path];
        await this.initSubplebbitIpfsPropsNoMerge(newSubplebbitRecord);
        this.updateCid = file.path;
        this._subplebbitUpdateTrigger = false;
        await this._updateDbInternalState(remeda.omit(this.toJSONInternalAfterFirstUpdate(), ["address"]));
        this._setStartedState("succeeded");
        this._clientsManager.updateIpfsState("stopped");
        this.emit("update", this);
    }
    shouldResolveDomainForVerification() {
        return this.address.includes(".") && Math.random() < 0.005; // Resolving domain should be a rare process because default rpcs throttle if we resolve too much
    }
    async _validateSubSchemaAndSignatureBeforePublishing(recordToPublishRaw) {
        const log = Logger("plebbit-js:local-subplebbit:_validateSubSchemaAndSignatureBeforePublishing");
        const parseRes = SubplebbitIpfsSchema.safeParse(recordToPublishRaw);
        if (!parseRes.success) {
            const error = new PlebbitError("ERR_LOCAL_SUBPLEBIT_PRODUCED_INVALID_SCHEMA", {
                invalidRecord: recordToPublishRaw,
                err: parseRes.error
            });
            log.error(`Local subplebbit (${this.address}) produced an invalid SubplebbitIpfs schema`, error);
            this.emit("error", error);
            throw error;
        }
        try {
            const validation = await verifySubplebbit(recordToPublishRaw, false, this._clientsManager, false, false);
            if (!validation.valid) {
                this._cidsToUnPin = [];
                throwWithErrorCode("ERR_LOCAL_SUBPLEBBIT_PRODUCED_INVALID_SIGNATURE", {
                    validation,
                    invalidRecord: recordToPublishRaw
                });
            }
        }
        catch (e) {
            log.error(`Local subplebbit (${this.address}) produced an invalid signature`, e);
            this.emit("error", e);
            throw e;
        }
        if (this.shouldResolveDomainForVerification()) {
            try {
                log(`Resolving domain ${this.address} to make sure it's the same as signer.address ${this.signer.address}`);
                const resolvedSubAddress = await this._clientsManager.resolveSubplebbitAddressIfNeeded(this.address);
                if (resolvedSubAddress !== this.signer.address)
                    log.error(`The domain address (${this.address}) subplebbit-address text record to resolves to ${resolvedSubAddress} when it should resolve to ${this.signer.address}`);
            }
            catch (e) {
                log.error(`Failed to resolve sub domain ${this.address}`, e);
            }
        }
    }
    async storeCommentEdit(commentEditRaw, challengeRequestId) {
        const log = Logger("plebbit-js:local-subplebbit:storeCommentEdit");
        const strippedOutEditPublication = CommentEditPubsubMessageWithFlexibleAuthorSchema.strip().parse(commentEditRaw); // we strip out here so we don't store any extra props in commentedits table
        const commentToBeEdited = await this._dbHandler.queryComment(commentEditRaw.commentCid, undefined); // We assume commentToBeEdited to be defined because we already tested for its existence above
        if (!commentToBeEdited)
            throw Error("The comment to edit doesn't exist"); // unlikely error to happen, but always a good idea to verify
        const editSignedByOriginalAuthor = commentEditRaw.signature.publicKey === commentToBeEdited.signature.publicKey;
        const isAuthorEdit = this._isAuthorEdit(commentEditRaw, editSignedByOriginalAuthor);
        const authorSignerAddress = await getPlebbitAddressFromPublicKey(commentEditRaw.signature.publicKey);
        const editTableRow = {
            ...strippedOutEditPublication,
            isAuthorEdit,
            authorSignerAddress,
            authorAddress: strippedOutEditPublication.author.address
        };
        const extraPropsInEdit = remeda.difference(remeda.keys.strict(commentEditRaw), remeda.keys.strict(CommentEditPubsubMessageSchema.shape));
        if (extraPropsInEdit.length > 0) {
            log("Found extra props on CommentEdit", extraPropsInEdit, "Will be adding them to extraProps column");
            editTableRow.extraProps = remeda.pick(commentEditRaw, extraPropsInEdit);
        }
        await this._dbHandler.insertEdit(editTableRow);
        log(`Inserted new Comment Edit for comment (${commentEditRaw.commentCid})`, commentEditRaw);
    }
    async storeVote(newVoteProps, challengeRequestId) {
        const log = Logger("plebbit-js:local-subplebbit:storeVote");
        const strippedOutVotePublication = VotePubsubMessageSchema.strip().parse(newVoteProps); // we strip out here so we don't store any extra props in votes table
        const authorSignerAddress = await getPlebbitAddressFromPublicKey(newVoteProps.signature.publicKey);
        await this._dbHandler.deleteVote(authorSignerAddress, newVoteProps.commentCid);
        const voteTableRow = {
            ...strippedOutVotePublication,
            authorSignerAddress,
            authorAddress: newVoteProps.author.address
        };
        const extraPropsInVote = remeda.difference(remeda.keys.strict(newVoteProps), remeda.keys.strict(VotePubsubMessageSchema.shape));
        if (extraPropsInVote.length > 0) {
            log("Found extra props on Vote", extraPropsInVote, "Will be adding them to extraProps column");
            voteTableRow.extraProps = remeda.pick(newVoteProps, extraPropsInVote);
        }
        await this._dbHandler.insertVote(voteTableRow);
        log(`inserted new vote for comment ${newVoteProps.commentCid}`, newVoteProps);
        return undefined;
    }
    isPublicationVote(publication) {
        return "vote" in publication && typeof publication.vote === "number";
    }
    isPublicationComment(publication) {
        return !this.isPublicationVote(publication) && !this.isPublicationCommentEdit(publication);
    }
    isPublicationReply(publication) {
        return this.isPublicationComment(publication) && "parentCid" in publication && typeof publication.parentCid === "string";
    }
    isPublicationPost(publication) {
        return this.isPublicationComment(publication) && !("parentCid" in publication);
    }
    isPublicationCommentEdit(publication) {
        return !this.isPublicationVote(publication) && "commentCid" in publication && typeof publication.commentCid === "string";
    }
    async _calculateLinkProps(link) {
        if (!link || !this.settings?.fetchThumbnailUrls)
            return undefined;
        return getThumbnailUrlOfLink(link, this, this.settings.fetchThumbnailUrlsProxyUrl);
    }
    async _calculatePostProps(comment, challengeRequestId) {
        const trx = await this._dbHandler.createTransaction(challengeRequestId.toString());
        const previousCid = (await this._dbHandler.queryLatestPostCid(trx))?.cid;
        await this._dbHandler.commitTransaction(challengeRequestId.toString());
        return { depth: 0, previousCid };
    }
    async _calculateReplyProps(comment, challengeRequestId) {
        if (!comment.parentCid)
            throw Error("Reply has to have parentCid");
        const trx = await this._dbHandler.createTransaction(challengeRequestId.toString());
        const commentsUnderParent = await this._dbHandler.queryCommentsUnderComment(comment.parentCid, trx);
        const parent = await this._dbHandler.queryComment(comment.parentCid, trx);
        await this._dbHandler.commitTransaction(challengeRequestId.toString());
        if (!parent)
            throw Error("Failed to find parent of reply");
        return {
            depth: parent.depth + 1,
            postCid: parent.postCid,
            previousCid: commentsUnderParent[0]?.cid
        };
    }
    async storePublication(request) {
        const log = Logger("plebbit-js:local-subplebbit:handleChallengeExchange:storePublicationIfValid");
        const publication = request.publication;
        const publicationHash = sha256(deterministicStringify(publication));
        if (this.isPublicationVote(publication))
            return this.storeVote(publication, request.challengeRequestId);
        else if (this.isPublicationCommentEdit(publication))
            return this.storeCommentEdit(publication, request.challengeRequestId);
        else if (this.isPublicationComment(publication)) {
            const commentIpfs = {
                ...publication,
                ...(await this._calculateLinkProps(publication.link)),
                ...(this.isPublicationPost(publication) && (await this._calculatePostProps(publication, request.challengeRequestId))),
                ...(this.isPublicationReply(publication) && (await this._calculateReplyProps(publication, request.challengeRequestId)))
            };
            const file = await this._clientsManager.getDefaultIpfs()._client.add(deterministicStringify(commentIpfs));
            const commentCid = file.path;
            const postCid = commentIpfs.postCid || commentCid; // if postCid is not defined, then we're adding a post to IPFS, so its own cid is the postCid
            const authorSignerAddress = await getPlebbitAddressFromPublicKey(publication.signature.publicKey);
            const strippedOutCommentIpfs = CommentIpfsSchema.strip().parse(commentIpfs); // remove unknown props
            const commentRow = {
                ...strippedOutCommentIpfs,
                cid: commentCid,
                postCid,
                authorAddress: commentIpfs.author.address,
                authorSignerAddress,
                challengeRequestPublicationSha256: publicationHash
            };
            const unknownProps = remeda.difference(remeda.keys.strict(publication), remeda.keys.strict(CommentPubsubMessageSchema.shape));
            if (unknownProps.length > 0) {
                log("Found extra props on Comment", unknownProps, "Will be adding them to extraProps column");
                commentRow.extraProps = remeda.pick(publication, unknownProps);
            }
            const trxForInsert = await this._dbHandler.createTransaction(request.challengeRequestId.toString());
            try {
                // This would throw for extra props
                await this._dbHandler.insertComment(commentRow, trxForInsert);
                // Everything below here is for verification purposes
                // The goal here is to find out if storing comment props in DB causes them to change in any way
                const commentInDb = await this._dbHandler.queryComment(commentRow.cid, trxForInsert);
                if (!commentInDb)
                    throw Error("Failed to query the comment we just inserted");
                // The line below will fail with extra props
                const commentIpfsRecreated = remeda.pick(commentInDb, remeda.keys.strict(commentIpfs));
                const validity = await verifyCommentIpfs(removeUndefinedValuesRecursively(commentIpfsRecreated), this._plebbit.resolveAuthorAddresses, this._clientsManager, false);
                if (!validity.valid)
                    throw Error("There is a problem with how query rows are processed in DB, which is causing an invalid signature. This is a critical Error");
                const calculatedHash = await calculateIpfsHash(deterministicStringify(commentIpfsRecreated));
                if (calculatedHash !== commentInDb.cid)
                    throw Error("There is a problem with db processing comment rows, the cids don't match");
            }
            catch (e) {
                log.error(`Failed to insert post to db due to error, rolling back on inserting the comment. This is a critical error`, e);
                await this._dbHandler.rollbackTransaction(request.challengeRequestId.toString());
                throw e;
            }
            await this._dbHandler.commitTransaction(request.challengeRequestId.toString());
            log(`New comment with cid ${commentRow.cid}  and depth (${commentRow.depth}) has been inserted into DB`);
            return { ...commentIpfs, cid: commentCid, postCid };
        }
    }
    async _decryptOrRespondWithFailure(request) {
        const log = Logger("plebbit-js:local-subplebbit:_decryptOrRespondWithFailure");
        try {
            return await decryptEd25519AesGcmPublicKeyBuffer(request.encrypted, this.signer.privateKey, request.signature.publicKey);
        }
        catch (e) {
            log.error(`Failed to decrypt request (${request.challengeRequestId.toString()}) due to error`, e);
            await this._publishFailedChallengeVerification({ reason: messages.ERR_SUB_FAILED_TO_DECRYPT_PUBSUB_MSG }, request.challengeRequestId);
            throw e;
        }
    }
    async _respondWithErrorIfSignatureOfPublicationIsInvalid(request) {
        let validity;
        if (this.isPublicationComment(request.publication))
            validity = await verifyCommentPubsubMessage(request.publication, this._plebbit.resolveAuthorAddresses, this._clientsManager, false);
        else if (this.isPublicationCommentEdit(request.publication))
            validity = await verifyCommentEdit(request.publication, this._plebbit.resolveAuthorAddresses, this._clientsManager, false);
        else if (this.isPublicationVote(request.publication))
            validity = await verifyVote(request.publication, this._plebbit.resolveAuthorAddresses, this._clientsManager, false);
        else
            throw Error("Can't detect the type of publication");
        if (!validity.valid) {
            await this._publishFailedChallengeVerification({ reason: validity.reason }, request.challengeRequestId);
            throwWithErrorCode(getErrorCodeFromMessage(validity.reason), { publication: request.publication, validity });
        }
    }
    async _publishChallenges(challenges, request) {
        const log = Logger("plebbit-js:local-subplebbit:_publishChallenges");
        const toEncryptChallenge = DecryptedChallengeSchema.parse({ challenges });
        const toSignChallenge = cleanUpBeforePublishing({
            type: "CHALLENGE",
            protocolVersion: env.PROTOCOL_VERSION,
            userAgent: this._plebbit.userAgent,
            challengeRequestId: request.challengeRequestId,
            encrypted: await encryptEd25519AesGcmPublicKeyBuffer(deterministicStringify(toEncryptChallenge), this.signer.privateKey, request.signature.publicKey),
            timestamp: timestamp()
        });
        const challengeMessage = ChallengeMessageSchema.parse({
            ...toSignChallenge,
            signature: await signChallengeMessage(toSignChallenge, this.signer)
        });
        this._clientsManager.updatePubsubState("publishing-challenge", undefined);
        await this._clientsManager.pubsubPublish(this.pubsubTopicWithfallback(), challengeMessage);
        log.trace(`Published ${challengeMessage.type} over pubsub: `, remeda.pick(toSignChallenge, ["timestamp"]), toEncryptChallenge.challenges.map((challenge) => challenge.type));
        this._clientsManager.updatePubsubState("waiting-challenge-answers", undefined);
        this.emit("challenge", {
            ...challengeMessage,
            challenges
        });
    }
    async _publishFailedChallengeVerification(result, challengeRequestId) {
        // challengeSucess=false
        const log = Logger("plebbit-js:local-subplebbit:_publishFailedChallengeVerification");
        const toSignVerification = cleanUpBeforePublishing({
            type: "CHALLENGEVERIFICATION",
            challengeRequestId: challengeRequestId,
            challengeSuccess: false,
            challengeErrors: result.challengeErrors,
            reason: result.reason,
            userAgent: this._plebbit.userAgent,
            protocolVersion: env.PROTOCOL_VERSION,
            timestamp: timestamp()
        });
        const challengeVerification = ChallengeVerificationMessageSchema.parse({
            ...toSignVerification,
            signature: await signChallengeVerification(toSignVerification, this.signer)
        });
        this._clientsManager.updatePubsubState("publishing-challenge-verification", undefined);
        log(`(${challengeRequestId}): `, `Will publish ${challengeVerification.type} over pubsub:`, toSignVerification);
        await this._clientsManager.pubsubPublish(this.pubsubTopicWithfallback(), challengeVerification);
        this._clientsManager.updatePubsubState("waiting-challenge-requests", undefined);
        this.emit("challengeverification", {
            ...challengeVerification,
            publication: undefined
        });
        this._ongoingChallengeExchanges.delete(challengeRequestId.toString());
        this._cleanUpChallengeAnswerPromise(challengeRequestId.toString());
    }
    async _publishChallengeVerification(challengeResult, request) {
        const log = Logger("plebbit-js:local-subplebbit:_publishChallengeVerification");
        if (!challengeResult.challengeSuccess)
            return this._publishFailedChallengeVerification(challengeResult, request.challengeRequestId);
        else {
            // Challenge has passed, we store the publication (except if there's an issue with the publication)
            log.trace(`(${request.challengeRequestId.toString()}): `, `Will attempt to publish challengeVerification with challengeSuccess=true`);
            const publicationNoSubplebbitAuthor = await this.storePublication(request);
            let publication;
            if (remeda.isPlainObject(publicationNoSubplebbitAuthor)) {
                const authorSignerAddress = await getPlebbitAddressFromPublicKey(publicationNoSubplebbitAuthor.signature.publicKey);
                const subplebbitAuthor = await this._dbHandler.querySubplebbitAuthor(authorSignerAddress);
                publication = subplebbitAuthor
                    ? {
                        ...publicationNoSubplebbitAuthor,
                        author: { ...publicationNoSubplebbitAuthor.author, subplebbit: subplebbitAuthor }
                    }
                    : publicationNoSubplebbitAuthor;
            }
            // could contain "publication" or "reason"
            const encrypted = remeda.isPlainObject(publication)
                ? await encryptEd25519AesGcmPublicKeyBuffer(deterministicStringify({ publication }), this.signer.privateKey, request.signature.publicKey)
                : undefined;
            const toSignMsg = cleanUpBeforePublishing({
                type: "CHALLENGEVERIFICATION",
                challengeRequestId: request.challengeRequestId,
                challengeSuccess: true,
                reason: undefined,
                encrypted,
                challengeErrors: challengeResult.challengeErrors,
                userAgent: this._plebbit.userAgent,
                protocolVersion: env.PROTOCOL_VERSION,
                timestamp: timestamp()
            });
            const challengeVerification = {
                ...toSignMsg,
                signature: await signChallengeVerification(toSignMsg, this.signer)
            };
            this._clientsManager.updatePubsubState("publishing-challenge-verification", undefined);
            await this._clientsManager.pubsubPublish(this.pubsubTopicWithfallback(), challengeVerification);
            this._clientsManager.updatePubsubState("waiting-challenge-requests", undefined);
            const objectToEmit = { ...challengeVerification, publication };
            this.emit("challengeverification", objectToEmit);
            this._ongoingChallengeExchanges.delete(request.challengeRequestId.toString());
            this._cleanUpChallengeAnswerPromise(request.challengeRequestId.toString());
            log(`Published ${challengeVerification.type} over pubsub:`, removeNullUndefinedEmptyObjectsValuesRecursively(remeda.pick(objectToEmit, ["publication", "challengeSuccess", "reason", "challengeErrors", "timestamp"])));
        }
    }
    _commentEditIncludesUniqueModFields(request) {
        return remeda.intersection(uniqueModFields, remeda.keys.strict(request)).length > 0;
    }
    _commentEditIncludesUniqueAuthorFields(request) {
        return remeda.intersection(uniqueAuthorFields, remeda.keys.strict(request)).length > 0;
    }
    _isAuthorEdit(request, editHasBeenSignedByOriginalAuthor) {
        if (this._commentEditIncludesUniqueAuthorFields(request))
            return true;
        if (this._commentEditIncludesUniqueModFields(request))
            return false;
        // The request has fields that are used in both mod and author, namely [spoiler, flair]
        if (editHasBeenSignedByOriginalAuthor)
            return true;
        return false;
    }
    async _checkPublicationValidity(request, authorSubplebbit) {
        const log = Logger("plebbit-js:local-subplebbit:handleChallengeRequest:checkPublicationValidity");
        const publication = request.publication;
        if (publication.subplebbitAddress !== this.address)
            return messages.ERR_PUBLICATION_INVALID_SUBPLEBBIT_ADDRESS;
        if (typeof authorSubplebbit?.banExpiresAt === "number" && authorSubplebbit.banExpiresAt > timestamp())
            return messages.ERR_AUTHOR_IS_BANNED;
        if (remeda.intersection(remeda.keys.strict(publication.author), AuthorReservedFields).length > 0)
            return messages.ERR_PUBLICATION_AUTHOR_HAS_RESERVED_FIELD;
        if (!this.isPublicationPost(publication)) {
            // vote or reply or edit
            const parentCid = this.isPublicationReply(publication)
                ? publication.parentCid
                : this.isPublicationVote(publication) || this.isPublicationCommentEdit(publication)
                    ? publication.commentCid
                    : undefined;
            if (!parentCid)
                return messages.ERR_SUB_COMMENT_PARENT_CID_NOT_DEFINED;
            const parent = await this._dbHandler.queryComment(parentCid);
            if (!parent)
                return messages.ERR_PUBLICATION_PARENT_DOES_NOT_EXIST_IN_SUB;
            const parentFlags = await this._dbHandler.queryCommentFlags(parentCid);
            if (parentFlags.removed && !this.isPublicationCommentEdit(publication))
                // not allowed to vote or reply under removed comments
                return messages.ERR_SUB_PUBLICATION_PARENT_HAS_BEEN_REMOVED;
            const isParentDeleted = await this._dbHandler.queryAuthorEditDeleted(parentCid);
            if (isParentDeleted && !this.isPublicationCommentEdit(publication))
                return messages.ERR_SUB_PUBLICATION_PARENT_HAS_BEEN_DELETED; // not allowed to vote or reply under deleted comments
            const postFlags = await this._dbHandler.queryCommentFlags(parent.postCid);
            if (postFlags.removed && !this.isPublicationCommentEdit(publication))
                return messages.ERR_SUB_PUBLICATION_POST_HAS_BEEN_REMOVED;
            const isPostDeleted = await this._dbHandler.queryAuthorEditDeleted(parent.postCid);
            if (isPostDeleted && !this.isPublicationCommentEdit(publication))
                return messages.ERR_SUB_PUBLICATION_POST_HAS_BEEN_DELETED;
            if (postFlags.locked && !this.isPublicationCommentEdit(publication))
                return messages.ERR_SUB_PUBLICATION_POST_IS_LOCKED;
            if (parent.timestamp > publication.timestamp)
                return messages.ERR_SUB_COMMENT_TIMESTAMP_IS_EARLIER_THAN_PARENT;
        }
        // Reject publications if their size is over 40kb
        const publicationKilobyteSize = Buffer.byteLength(JSON.stringify(publication)) / 1000;
        if (publicationKilobyteSize > 40)
            return messages.ERR_REQUEST_PUBLICATION_OVER_ALLOWED_SIZE;
        if (this.isPublicationComment(publication)) {
            if (remeda.intersection(remeda.keys.strict(publication), CommentPubsubMessageReservedFields).length > 0)
                return messages.ERR_COMMENT_HAS_RESERVED_FIELD;
            if (this.features?.requirePostLinkIsMedia && publication.link && !isLinkOfMedia(publication.link))
                return messages.ERR_POST_LINK_IS_NOT_OF_MEDIA;
            const publicationHash = sha256(deterministicStringify(publication));
            const publicationInDb = await this._dbHandler.queryCommentByRequestPublicationHash(publicationHash);
            if (publicationInDb)
                return messages.ERR_DUPLICATE_COMMENT;
        }
        if (this.isPublicationVote(publication)) {
            if (remeda.intersection(VotePubsubReservedFields, remeda.keys.strict(publication)).length > 0)
                return messages.ERR_VOTE_HAS_RESERVED_FIELD;
            const authorSignerAddress = await getPlebbitAddressFromPublicKey(publication.signature.publicKey);
            const lastVote = await this._dbHandler.getStoredVoteOfAuthor(publication.commentCid, authorSignerAddress);
            if (lastVote && publication.signature.publicKey !== lastVote.signature.publicKey)
                return messages.UNAUTHORIZED_AUTHOR_ATTEMPTED_TO_CHANGE_VOTE;
        }
        if (this.isPublicationCommentEdit(publication)) {
            if (remeda.intersection(CommentEditReservedFields, remeda.keys.strict(publication)).length > 0)
                return messages.ERR_COMMENT_EDIT_HAS_RESERVED_FIELD;
            const commentToBeEdited = await this._dbHandler.queryComment(publication.commentCid, undefined); // We assume commentToBeEdited to be defined because we already tested for its existence above
            if (!commentToBeEdited)
                throw Error("Wasn't able to find the comment to edit");
            const editSignedByOriginalAuthor = publication.signature.publicKey === commentToBeEdited.signature.publicKey;
            const modRoles = SubplebbitRoleSchema.shape.role.options; // [mod, admin, owner]
            const isEditorMod = this.roles?.[publication.author.address] && modRoles.includes(this.roles[publication.author.address]?.role);
            const editHasUniqueModFields = this._commentEditIncludesUniqueModFields(publication);
            const isAuthorEdit = this._isAuthorEdit(publication, editSignedByOriginalAuthor);
            if (isAuthorEdit && editHasUniqueModFields)
                return messages.ERR_PUBLISHING_EDIT_WITH_BOTH_MOD_AND_AUTHOR_FIELDS;
            const authorEditPubsubFields = remeda.keys.strict(AuthorCommentEditPubsubSchema.shape);
            const modEditPubsubFields = remeda.keys.strict(ModeratorCommentEditPubsubSchema.shape);
            const allowedEditFields = isAuthorEdit && editSignedByOriginalAuthor ? authorEditPubsubFields : isEditorMod ? modEditPubsubFields : undefined;
            if (!allowedEditFields)
                return messages.ERR_UNAUTHORIZED_COMMENT_EDIT;
            const publicationEditFields = remeda.keys.strict(CommentEditPubsubMessageWithFlexibleAuthorSchema.strip().parse(publication)); // we strip here because we don't wanna include unknown props
            for (const editField of publicationEditFields)
                if (!allowedEditFields.includes(editField)) {
                    log(`The comment edit includes a field (${editField}) that is not part of the allowed fields (${allowedEditFields})`, `isAuthorEdit:${isAuthorEdit}`, `editHasUniqueModFields:${editHasUniqueModFields}`, `isEditorMod:${isEditorMod}`, `editSignedByOriginalAuthor:${editSignedByOriginalAuthor}`);
                    return messages.ERR_SUB_COMMENT_EDIT_UNAUTHORIZED_FIELD;
                }
            if (isEditorMod && publication.locked && commentToBeEdited.depth !== 0)
                return messages.ERR_SUB_COMMENT_EDIT_CAN_NOT_LOCK_REPLY;
        }
        return undefined;
    }
    async _parseChallengeRequestPublicationOrRespondWithFailure(request, decryptedRawString) {
        let decryptedJson;
        try {
            decryptedJson = parseJsonWithPlebbitErrorIfFails(decryptedRawString);
        }
        catch (e) {
            await this._publishFailedChallengeVerification({ reason: messages.ERR_REQUEST_PUBLICATION_IS_INVALID_JSON }, request.challengeRequestId);
            throw e;
        }
        // Parsing DecryptedChallengeRequest.publication here
        let parsedPublication = undefined;
        const publicationSchemasToParse = [
            VotePubsubMessageSchema.passthrough(),
            CommentPubsubMessageWithFlexibleAuthorRefinementSchema,
            CommentEditPubsubMessageWithFlexibleAuthorSchema.passthrough()
        ];
        for (const schema of publicationSchemasToParse) {
            const res = schema.safeParse(decryptedJson?.publication);
            if (res.success) {
                parsedPublication = res.data;
                break;
            }
        }
        const parseRestOfDecrypted = DecryptedChallengeRequestSchema.omit({ publication: true }).passthrough().safeParse(decryptedJson);
        if (parseRestOfDecrypted.success && parsedPublication)
            return { ...parseRestOfDecrypted.data, publication: parsedPublication };
        else {
            // All schemas failed
            await this._publishFailedChallengeVerification({ reason: messages.ERR_REQUEST_PUBLICATION_HAS_INVALID_SCHEMA }, request.challengeRequestId);
            throw new PlebbitError("ERR_REQUEST_PUBLICATION_HAS_INVALID_SCHEMA", { decryptedJson });
        }
    }
    async handleChallengeRequest(request) {
        const log = Logger("plebbit-js:local-subplebbit:handleChallengeRequest");
        if (this._ongoingChallengeExchanges.has(request.challengeRequestId.toString())) {
            log("Received a duplicate challenge request", request.challengeRequestId.toString());
            return; // This is a duplicate challenge request
        }
        this._ongoingChallengeExchanges.set(request.challengeRequestId.toString(), true);
        const requestSignatureValidation = await verifyChallengeRequest(request, true);
        if (!requestSignatureValidation.valid)
            throwWithErrorCode(getErrorCodeFromMessage(requestSignatureValidation.reason), {
                challengeRequest: remeda.omit(request, ["encrypted"])
            });
        const decryptedRawString = await this._decryptOrRespondWithFailure(request);
        const decryptedRequest = await this._parseChallengeRequestPublicationOrRespondWithFailure(request, decryptedRawString);
        const authorSignerAddress = await getPlebbitAddressFromPublicKey(decryptedRequest.publication.signature.publicKey);
        const subplebbitAuthor = await this._dbHandler.querySubplebbitAuthor(authorSignerAddress);
        const decryptedRequestMsg = { ...request, ...decryptedRequest };
        const decryptedRequestWithSubplebbitAuthor = {
            ...decryptedRequestMsg,
            publication: {
                ...decryptedRequest.publication,
                ...(subplebbitAuthor ? { author: { ...decryptedRequest.publication.author, subplebbit: subplebbitAuthor } } : undefined)
            }
        };
        try {
            await this._respondWithErrorIfSignatureOfPublicationIsInvalid(decryptedRequestMsg); // This function will throw an error if signature is invalid
        }
        catch (e) {
            log.error("Signature of challengerequest.publication is invalid, emitting an error event and aborting the challenge exchange", String(e));
            this.emit("challengerequest", decryptedRequestWithSubplebbitAuthor);
            return;
        }
        log.trace("Received a valid challenge request", decryptedRequestWithSubplebbitAuthor);
        this.emit("challengerequest", decryptedRequestWithSubplebbitAuthor);
        // Check publication props validity
        const publicationInvalidityReason = await this._checkPublicationValidity(decryptedRequestMsg, subplebbitAuthor);
        if (publicationInvalidityReason)
            return this._publishFailedChallengeVerification({ reason: publicationInvalidityReason }, request.challengeRequestId);
        const answerPromiseKey = decryptedRequestWithSubplebbitAuthor.challengeRequestId.toString();
        const getChallengeAnswers = async (challenges) => {
            // ...get challenge answers from user. e.g.:
            // step 1. subplebbit publishes challenge pubsub message with `challenges` provided in argument of `getChallengeAnswers`
            // step 2. subplebbit waits for challenge answer pubsub message with `challengeAnswers` and then returns `challengeAnswers`
            await this._publishChallenges(challenges, decryptedRequestWithSubplebbitAuthor);
            const challengeAnswerPromise = new Promise((resolve, reject) => this._challengeAnswerResolveReject.set(answerPromiseKey, { resolve, reject }));
            this._challengeAnswerPromises.set(answerPromiseKey, challengeAnswerPromise);
            const challengeAnswers = await this._challengeAnswerPromises.get(answerPromiseKey);
            if (!challengeAnswers)
                throw Error("Failed to retrieve challenge answers from promise. This is a critical error");
            this._cleanUpChallengeAnswerPromise(answerPromiseKey);
            return challengeAnswers;
        };
        // NOTE: we try to get challenge verification immediately after receiving challenge request
        // because some challenges are automatic and skip the challenge message
        let challengeVerification;
        try {
            challengeVerification = await getChallengeVerification(decryptedRequestWithSubplebbitAuthor, this, getChallengeAnswers);
        }
        catch (e) {
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
        await this._publishChallengeVerification(challengeVerification, decryptedRequestMsg);
    }
    _cleanUpChallengeAnswerPromise(challengeRequestIdString) {
        this._challengeAnswerPromises.delete(challengeRequestIdString);
        this._challengeAnswerResolveReject.delete(challengeRequestIdString);
    }
    async _parseChallengeAnswerOrRespondWithFailure(challengeAnswer, decryptedRawString) {
        let parsedJson;
        try {
            parsedJson = parseJsonWithPlebbitErrorIfFails(decryptedRawString);
        }
        catch (e) {
            await this._publishFailedChallengeVerification({ reason: messages.ERR_CHALLENGE_ANSWER_IS_INVALID_JSON }, challengeAnswer.challengeRequestId);
            throw e;
        }
        try {
            return DecryptedChallengeAnswerSchema.parse(parsedJson);
        }
        catch (e) {
            await this._publishFailedChallengeVerification({ reason: messages.ERR_CHALLENGE_ANSWER_IS_INVALID_SCHEMA }, challengeAnswer.challengeRequestId);
            throw e;
        }
    }
    async handleChallengeAnswer(challengeAnswer) {
        const log = Logger("plebbit-js:local-subplebbit:handleChallengeAnswer");
        if (!this._ongoingChallengeExchanges.has(challengeAnswer.challengeRequestId.toString()))
            // Respond with error to answers without challenge request
            return this._publishFailedChallengeVerification({ reason: messages.ERR_CHALLENGE_ANSWER_WITH_NO_CHALLENGE_REQUEST }, challengeAnswer.challengeRequestId);
        const answerSignatureValidation = await verifyChallengeAnswer(challengeAnswer, true);
        if (!answerSignatureValidation.valid) {
            this._cleanUpChallengeAnswerPromise(challengeAnswer.challengeRequestId.toString());
            this._ongoingChallengeExchanges.delete(challengeAnswer.challengeRequestId.toString());
            throwWithErrorCode(getErrorCodeFromMessage(answerSignatureValidation.reason), { challengeAnswer });
        }
        const decryptedRawString = await this._decryptOrRespondWithFailure(challengeAnswer);
        const decryptedAnswers = await this._parseChallengeAnswerOrRespondWithFailure(challengeAnswer, decryptedRawString);
        const decryptedChallengeAnswerPubsubMessage = { ...challengeAnswer, ...decryptedAnswers };
        this.emit("challengeanswer", decryptedChallengeAnswerPubsubMessage);
        const challengeAnswerPromise = this._challengeAnswerResolveReject.get(challengeAnswer.challengeRequestId.toString());
        if (!challengeAnswerPromise)
            throw Error("The challenge answer promise is undefined, there is an issue with challenge. This is a critical error");
        challengeAnswerPromise.resolve(decryptedChallengeAnswerPubsubMessage.challengeAnswers);
    }
    async handleChallengeExchange(pubsubMsg) {
        const log = Logger("plebbit-js:local-subplebbit:handleChallengeExchange");
        const timeReceived = timestamp();
        const pubsubKilobyteSize = Buffer.byteLength(pubsubMsg.data) / 1000;
        if (pubsubKilobyteSize > 80) {
            log.error(`Received a pubsub message at (${timeReceived}) with size of ${pubsubKilobyteSize}. Silently dropping it`);
            return;
        }
        let decodedMsg;
        try {
            decodedMsg = cborg.decode(pubsubMsg.data);
        }
        catch (e) {
            log.error(`Failed to decode pubsub message received at (${timeReceived})`, e.toString());
            return;
        }
        const pubsubSchemas = [
            ChallengeRequestMessageSchema.passthrough(),
            ChallengeMessageSchema.passthrough(),
            ChallengeAnswerMessageSchema.passthrough(),
            ChallengeVerificationMessageSchema.passthrough()
        ];
        let parsedPubsubMsg;
        for (const pubsubSchema of pubsubSchemas) {
            const parseRes = pubsubSchema.safeParse(decodedMsg);
            if (parseRes.success) {
                parsedPubsubMsg = parseRes.data;
                break;
            }
        }
        if (!parsedPubsubMsg) {
            log.error(`Failed to parse the schema of pubsub message received at (${timeReceived})`, decodedMsg);
            return;
        }
        if (parsedPubsubMsg.type === "CHALLENGE" || parsedPubsubMsg.type === "CHALLENGEVERIFICATION") {
            log.trace(`Received a pubsub message that is not meant to by processed by the sub - ${parsedPubsubMsg.type}. Will ignore it`);
            return;
        }
        else if (parsedPubsubMsg.type === "CHALLENGEREQUEST") {
            try {
                await this.handleChallengeRequest(parsedPubsubMsg);
            }
            catch (e) {
                log.error(`Failed to process challenge request message received at (${timeReceived})`, e.toString());
                await this._dbHandler.rollbackTransaction(parsedPubsubMsg.challengeRequestId.toString());
            }
        }
        else if (parsedPubsubMsg.type === "CHALLENGEANSWER") {
            try {
                await this.handleChallengeAnswer(parsedPubsubMsg);
            }
            catch (e) {
                log.error(`Failed to process challenge answer message received at (${timeReceived})`, e.toString());
                await this._dbHandler.rollbackTransaction(parsedPubsubMsg.challengeRequestId.toString());
            }
        }
    }
    _calculatePostUpdatePathForExistingCommentUpdate(timestampRange, currentIpfsPath) {
        const pathParts = currentIpfsPath.split("/");
        return ["/" + this.address, "postUpdates", timestampRange, ...pathParts.slice(4)].join("/");
    }
    async _calculateIpfsPathForCommentUpdate(dbComment, storedCommentUpdate) {
        const postTimestamp = dbComment.depth === 0 ? dbComment.timestamp : (await this._dbHandler.queryComment(dbComment.postCid))?.timestamp;
        if (typeof postTimestamp !== "number")
            throw Error("failed to query the comment in db to look for its postTimestamp");
        const timestampRange = this._postUpdatesBuckets.find((bucket) => timestamp() - bucket <= postTimestamp);
        if (typeof timestampRange !== "number")
            throw Error("Failed to find timestamp range for comment update");
        if (storedCommentUpdate?.ipfsPath)
            return this._calculatePostUpdatePathForExistingCommentUpdate(timestampRange, storedCommentUpdate.ipfsPath);
        else {
            const parentsCids = (await this._dbHandler.queryParents(dbComment)).map((parent) => parent.cid).reverse();
            return ["/" + this.address, "postUpdates", timestampRange, ...parentsCids, dbComment.cid, "update"].join("/");
        }
    }
    async _writeCommentUpdateToIpfsFilePath(newCommentUpdate, ipfsPath, oldIpfsPath) {
        // TODO need to exclude reply.replies here
        await this._clientsManager
            .getDefaultIpfs()
            ._client.files.write(ipfsPath, deterministicStringify(newCommentUpdate), { parents: true, truncate: true, create: true });
        if (oldIpfsPath && oldIpfsPath !== ipfsPath)
            await this._clientsManager.getDefaultIpfs()._client.files.rm(oldIpfsPath);
    }
    async _updateComment(comment) {
        const log = Logger("plebbit-js:local-subplebbit:_updateComment");
        // If we're here that means we're gonna calculate the new update and publish it
        log(`Attempting to publish new CommentUpdate for comment (${comment.cid})`);
        // This comment will have the local new CommentUpdate, which we will publish to IPFS fiels
        // It includes new author.subplebbit as well as updated values in CommentUpdate (except for replies field)
        const [calculatedCommentUpdate, storedCommentUpdate, generatedPages] = await Promise.all([
            this._dbHandler.queryCalculatedCommentUpdate(comment),
            this._dbHandler.queryStoredCommentUpdate(comment),
            this._sortHandler.generateRepliesPages(comment)
        ]);
        if (calculatedCommentUpdate.replyCount > 0)
            assert(generatedPages);
        if (storedCommentUpdate?.replies?.pageCids && generatedPages) {
            const newPageCids = remeda.unique(Object.values(generatedPages.pageCids));
            const pageCidsToUnPin = remeda.unique(Object.values(storedCommentUpdate.replies.pageCids).filter((oldPageCid) => !newPageCids.includes(oldPageCid)));
            this._cidsToUnPin.push(...pageCidsToUnPin);
        }
        const newUpdatedAt = storedCommentUpdate?.updatedAt === timestamp() ? timestamp() + 1 : timestamp();
        const commentUpdatePriorToSigning = {
            ...cleanUpBeforePublishing({
                ...calculatedCommentUpdate,
                updatedAt: newUpdatedAt,
                protocolVersion: env.PROTOCOL_VERSION
            })
        };
        // we have to make sure not clean up submissions of authors by calling cleanUpBeforePublishing
        if (generatedPages)
            commentUpdatePriorToSigning.replies = removeUndefinedValuesRecursively({
                pageCids: generatedPages.pageCids,
                pages: remeda.pick(generatedPages.pages, ["topAll"])
            });
        const newCommentUpdate = {
            ...commentUpdatePriorToSigning,
            signature: await signCommentUpdate(commentUpdatePriorToSigning, this.signer)
        };
        await this._validateCommentUpdateSignature(newCommentUpdate, comment, log);
        const ipfsPath = await this._calculateIpfsPathForCommentUpdate(comment, storedCommentUpdate);
        await this._writeCommentUpdateToIpfsFilePath(newCommentUpdate, ipfsPath, storedCommentUpdate?.ipfsPath);
        await this._dbHandler.upsertCommentUpdate({ ...newCommentUpdate, ipfsPath });
    }
    async _validateCommentUpdateSignature(newCommentUpdate, comment, log) {
        // This function should be deleted at some point, once the protocol ossifies
        const validation = await verifyCommentUpdate(newCommentUpdate, false, this._clientsManager, this.address, comment, false, false);
        if (!validation.valid) {
            log.error(`CommentUpdate (${comment.cid}) signature is invalid due to (${validation.reason}). This is a critical error`);
            throw new PlebbitError("ERR_COMMENT_UPDATE_SIGNATURE_IS_INVALID", validation);
        }
    }
    async _listenToIncomingRequests() {
        const log = Logger("plebbit-js:local-subplebbit:sync:_listenToIncomingRequests");
        // Make sure subplebbit listens to pubsub topic
        // Code below is to handle in case the ipfs node restarted and the subscription got lost or something
        const subscribedTopics = await this._clientsManager.getDefaultPubsub()._client.pubsub.ls();
        if (!subscribedTopics.includes(this.pubsubTopicWithfallback())) {
            await this._clientsManager.pubsubUnsubscribe(this.pubsubTopicWithfallback(), this.handleChallengeExchange); // Make sure it's not hanging
            await this._clientsManager.pubsubSubscribe(this.pubsubTopicWithfallback(), this.handleChallengeExchange);
            this._clientsManager.updatePubsubState("waiting-challenge-requests", undefined);
            log(`Waiting for publications on pubsub topic (${this.pubsubTopicWithfallback()})`);
        }
    }
    async _movePostUpdatesFolderToNewAddress(oldAddress, newAddress) {
        try {
            await this._clientsManager.getDefaultIpfs()._client.files.mv(`/${oldAddress}`, `/${newAddress}`); // Could throw
            const commentUpdates = await this._dbHandler.queryAllStoredCommentUpdates();
            for (const commentUpdate of commentUpdates) {
                const pathParts = commentUpdate.ipfsPath.split("/");
                pathParts[1] = newAddress;
                const newIpfsPath = pathParts.join("/");
                await this._dbHandler.upsertCommentUpdate({ ...commentUpdate, ipfsPath: newIpfsPath });
            }
        }
        catch (e) {
            if (e instanceof Error && e.message !== "file does not exist")
                throw e; // A critical error
        }
    }
    async _switchDbWhileRunningIfNeeded() {
        const log = Logger("plebbit-js:local-subplebbit:_switchDbIfNeeded");
        // Will check if address has been changed, and if so connect to the new db with the new address
        const internalState = await this._getDbInternalState(true);
        if (!internalState)
            throw Error("Can't change address or db when there's no internal state in db");
        const listedSubs = await this._plebbit.listSubplebbits();
        const dbIsOnOldName = !listedSubs.includes(internalState.address) && listedSubs.includes(this.signer.address);
        const currentDbAddress = dbIsOnOldName ? this.signer.address : this.address;
        if (internalState.address !== currentDbAddress) {
            // That means a call has been made to edit the sub's address while it's running
            // We need to stop the sub from running, change its file name, then establish a connection to the new DB
            log(`Running sub (${currentDbAddress}) has received a new address (${internalState.address}) to change to`);
            await this._dbHandler.unlockSubStart(currentDbAddress);
            await this._dbHandler.rollbackAllTransactions();
            await this._movePostUpdatesFolderToNewAddress(currentDbAddress, internalState.address);
            await this._dbHandler.destoryConnection();
            this.setAddress(internalState.address);
            await this._dbHandler.changeDbFilename(currentDbAddress, internalState.address);
            await this._dbHandler.initDestroyedConnection();
            await this._dbHandler.lockSubStart(internalState.address); // Lock the new address start
            this._subplebbitUpdateTrigger = true;
            await this._updateDbInternalState({ _subplebbitUpdateTrigger: this._subplebbitUpdateTrigger });
        }
    }
    async _updateCommentsThatNeedToBeUpdated() {
        const log = Logger(`plebbit-js:local-subplebbit:_updateCommentsThatNeedToBeUpdated`);
        const trx = await this._dbHandler.createTransaction("_updateCommentsThatNeedToBeUpdated");
        const commentsToUpdate = await this._dbHandler.queryCommentsToBeUpdated(trx);
        await this._dbHandler.commitTransaction("_updateCommentsThatNeedToBeUpdated");
        if (commentsToUpdate.length === 0)
            return;
        this._subplebbitUpdateTrigger = true;
        log(`Will update ${commentsToUpdate.length} comments in this update loop for subplebbit (${this.address})`);
        const commentsGroupedByDepth = remeda.groupBy.strict(commentsToUpdate, (x) => x.depth);
        const depthsKeySorted = remeda.keys.strict(commentsGroupedByDepth).sort((a, b) => Number(b) - Number(a)); // Make sure comments with higher depths are sorted first
        for (const depthKey of depthsKeySorted)
            for (const comment of commentsGroupedByDepth[depthKey])
                await this._updateComment(comment);
    }
    async _repinCommentsIPFSIfNeeded() {
        const log = Logger("plebbit-js:local-subplebbit:sync");
        const latestCommentCid = await this._dbHandler.queryLatestCommentCid(); // latest comment ordered by id
        if (!latestCommentCid)
            return;
        try {
            await genToArray(this._clientsManager.getDefaultIpfs()._client.pin.ls({ paths: latestCommentCid.cid }));
            return; // the comment is already pinned, we assume the rest of the comments are so too
        }
        catch (e) {
            if (!e.message.includes("is not pinned"))
                throw e;
        }
        log("The latest comment is not pinned in the ipfs node, plebbit-js will repin all existing comment ipfs");
        // latestCommentCid should be the last in unpinnedCommentsFromDb array, in case we throw an error on a comment before it, it does not get pinned
        const unpinnedCommentsFromDb = await this._dbHandler.queryAllCommentsOrderedByIdAsc(); // we assume all comments are unpinned if latest comment is not pinned
        for (const unpinnedCommentRow of unpinnedCommentsFromDb) {
            const baseProps = remeda.pick(unpinnedCommentRow, remeda.keys.strict(CommentIpfsSchema.shape));
            const commentIpfsJson = {
                ...baseProps,
                ...unpinnedCommentRow.extraProps,
                ipnsName: unpinnedCommentRow["ipnsName"], // Added for backward compatibility
                postCid: unpinnedCommentRow.depth === 0 ? undefined : unpinnedCommentRow.postCid // need to remove post cid because it's not part of ipfs file if depth is 0
            };
            const commentIpfsContent = deterministicStringify(commentIpfsJson);
            const contentHash = await calculateIpfsHash(commentIpfsContent);
            if (contentHash !== unpinnedCommentRow.cid)
                throw Error("Unable to recreate the CommentIpfs. This is a critical error");
            await this._clientsManager.getDefaultIpfs()._client.add(commentIpfsContent, { pin: true });
        }
        await this._dbHandler.deleteAllCommentUpdateRows(); // delete CommentUpdate rows to force a new production of CommentUpdate
        log(`${unpinnedCommentsFromDb.length} comments' IPFS have been repinned`);
    }
    async _unpinStaleCids() {
        const log = Logger("plebbit-js:local-subplebbit:unpinStaleCids");
        this._cidsToUnPin = remeda.uniq(this._cidsToUnPin);
        if (this._cidsToUnPin.length > 0) {
            await Promise.all(this._cidsToUnPin.map(async (cid) => {
                try {
                    await this._clientsManager.getDefaultIpfs()._client.pin.rm(cid);
                }
                catch (e) { }
            }));
            log.trace(`unpinned ${this._cidsToUnPin.length} stale cids from ipfs node for subplebbit (${this.address})`);
        }
    }
    pubsubTopicWithfallback() {
        return this.pubsubTopic || this.address;
    }
    async _repinCommentUpdateIfNeeded() {
        const log = Logger("plebbit-js:start:_repinCommentUpdateIfNeeded");
        // iterating on all comment updates is not efficient, we should figure out a better way
        // Most of the time we run this function, the comment updates are already written to ipfs rpeo
        try {
            await this._clientsManager.getDefaultIpfs()._client.files.stat(`/${this.address}`, { hash: true });
            return; // if the directory of this sub exists, we assume all the comment updates are there
        }
        catch (e) {
            if (!e.message.includes("file does not exist"))
                throw e;
        }
        // here we will go ahead to and rewrite all comment updates
        const storedCommentUpdates = await this._dbHandler.queryAllStoredCommentUpdates();
        if (storedCommentUpdates.length === 0)
            return;
        log(`CommentUpdate directory does not exist under MFS, will repin all comment updates (${storedCommentUpdates.length})`);
        for (const commentUpdate of storedCommentUpdates) {
            // means the comment update is not on the ipfs node, need to add it
            // We should calculate new ipfs path
            const commentInDb = await this._dbHandler.queryComment(commentUpdate.cid);
            if (!commentInDb)
                throw Error("Can't create a new CommentUpdate with comment not existing in db" + commentUpdate.cid);
            const newIpfsPath = await this._calculateIpfsPathForCommentUpdate(commentInDb, undefined);
            await this._writeCommentUpdateToIpfsFilePath(commentUpdate, newIpfsPath, undefined);
            await this._dbHandler.upsertCommentUpdate({ ...commentUpdate, ipfsPath: newIpfsPath });
            log(`Added the CommentUpdate of (${commentUpdate.cid}) to IPFS files`);
        }
    }
    async _adjustPostUpdatesBucketsIfNeeded() {
        // This function will be ran a lot, maybe we should move it out of the sync loop or try to limit its execution
        if (!this.postUpdates)
            return;
        // Look for posts whose buckets should be changed
        // TODO this function should be ran in a more efficient manner. It iterates through all posts in the database
        // At some point we should have a db query that looks for posts that need to move to a different bucket
        const log = Logger("plebbit-js:local-subplebbit:start:_adjustPostUpdatesBucketsIfNeeded");
        const commentUpdateOfPosts = await this._dbHandler.queryCommentUpdatesOfPostsForBucketAdjustment();
        for (const post of commentUpdateOfPosts) {
            const currentTimestampBucketOfPost = Number(post.ipfsPath.split("/")[3]);
            const newTimestampBucketOfPost = this._postUpdatesBuckets.find((bucket) => timestamp() - bucket <= post.timestamp);
            if (typeof newTimestampBucketOfPost !== "number")
                throw Error("Failed to calculate the timestamp bucket of post");
            if (currentTimestampBucketOfPost !== newTimestampBucketOfPost) {
                log(`Post (${post.cid}) current postUpdates timestamp bucket (${currentTimestampBucketOfPost}) is outdated. Will move it to bucket (${newTimestampBucketOfPost})`);
                // ipfs files mv to new timestamp bucket
                // also update the value of ipfs path for this post and children
                const newPostIpfsPath = this._calculatePostUpdatePathForExistingCommentUpdate(newTimestampBucketOfPost, post.ipfsPath);
                const newPostIpfsPathWithoutUpdate = newPostIpfsPath.replace("/update", "");
                const currentPostIpfsPathWithoutUpdate = post.ipfsPath.replace("/update", "");
                const newTimestampBucketPath = newPostIpfsPathWithoutUpdate.split("/").slice(0, 4).join("/");
                await this._clientsManager.getDefaultIpfs()._client.files.mkdir(newTimestampBucketPath, { parents: true });
                await this._clientsManager
                    .getDefaultIpfs()
                    ._client.files.mv(currentPostIpfsPathWithoutUpdate, newPostIpfsPathWithoutUpdate); // should move post and its children
                const commentUpdatesWithOutdatedIpfsPath = await this._dbHandler.queryCommentsUpdatesWithPostCid(post.cid);
                for (const commentUpdate of commentUpdatesWithOutdatedIpfsPath) {
                    const newIpfsPath = this._calculatePostUpdatePathForExistingCommentUpdate(newTimestampBucketOfPost, commentUpdate.ipfsPath);
                    await this._dbHandler.upsertCommentUpdate({ ...commentUpdate, ipfsPath: newIpfsPath });
                }
                this._subplebbitUpdateTrigger = true;
            }
        }
    }
    async syncIpnsWithDb() {
        const log = Logger("plebbit-js:local-subplebbit:sync");
        await this._switchDbWhileRunningIfNeeded();
        try {
            await this._updateInstanceStateWithDbState();
            await this._listenToIncomingRequests();
            await this._adjustPostUpdatesBucketsIfNeeded();
            this._setStartedState("publishing-ipns");
            this._clientsManager.updateIpfsState("publishing-ipns");
            await this._updateCommentsThatNeedToBeUpdated();
            await this.updateSubplebbitIpnsIfNeeded();
        }
        catch (e) {
            this._setStartedState("failed");
            this._clientsManager.updateIpfsState("stopped");
            log.error(`Failed to sync due to error,`, e);
        }
    }
    async _assertDomainResolvesCorrectly(domain) {
        if (isStringDomain(domain)) {
            await this._clientsManager.clearDomainCache(domain, "subplebbit-address");
            const resolvedAddress = await this._clientsManager.resolveSubplebbitAddressIfNeeded(domain);
            if (resolvedAddress !== this.signer.address)
                throwWithErrorCode("ERR_DOMAIN_SUB_ADDRESS_TXT_RECORD_POINT_TO_DIFFERENT_ADDRESS", {
                    subplebbitAddress: this.address,
                    resolvedAddress,
                    signerAddress: this.signer.address
                });
        }
    }
    async _initSignerProps(newSignerProps) {
        this.signer = new SignerWithPublicKeyAddress(newSignerProps);
        if (!this.signer?.ipfsKey?.byteLength || this.signer?.ipfsKey?.byteLength <= 0)
            this.signer.ipfsKey = new Uint8Array(await getIpfsKeyFromPrivateKey(this.signer.privateKey));
        if (!this.signer.ipnsKeyName)
            this.signer.ipnsKeyName = this.signer.address;
        if (!this.signer.publicKey)
            this.signer.publicKey = await getPublicKeyFromPrivateKey(this.signer.privateKey);
        this.encryption = {
            type: "ed25519-aes-gcm",
            publicKey: this.signer.publicKey
        };
    }
    async _publishLoop(syncIntervalMs) {
        if (this.state !== "started" || this._stopHasBeenCalled)
            return;
        const loop = async () => {
            this._publishLoopPromise = this.syncIpnsWithDb();
            await this._publishLoopPromise;
            await this._publishLoop(syncIntervalMs);
        };
        this._publishInterval = setTimeout(loop.bind(this), syncIntervalMs);
    }
    async _initBeforeStarting() {
        this.protocolVersion = env.PROTOCOL_VERSION;
        if (!this.signer?.address)
            throwWithErrorCode("ERR_SUB_SIGNER_NOT_DEFINED");
        if (!this._challengeAnswerPromises)
            this._challengeAnswerPromises = new LRUCache({
                max: 1000,
                ttl: 600000
            });
        if (!this._challengeAnswerResolveReject)
            this._challengeAnswerResolveReject = new LRUCache({
                max: 1000,
                ttl: 600000
            });
        if (!this._ongoingChallengeExchanges)
            this._ongoingChallengeExchanges = new LRUCache({
                max: 1000,
                ttl: 600000
            });
        if (!this._cidsToUnPin)
            this._cidsToUnPin = [];
        await this._dbHandler.initDestroyedConnection();
    }
    _parseRolesToEdit(newRawRoles) {
        return remeda.omitBy(newRawRoles, (val, key) => val === undefined || val === null);
    }
    _parseChallengesToEdit(newChallengeSettings) {
        return {
            challenges: newChallengeSettings.map(getSubplebbitChallengeFromSubplebbitChallengeSettings),
            _usingDefaultChallenge: remeda.isDeepEqual(newChallengeSettings, this._defaultSubplebbitChallenges)
        };
    }
    async edit(newSubplebbitOptions) {
        const log = Logger("plebbit-js:local-subplebbit:edit");
        const parsedEditOptions = SubplebbitEditOptionsSchema.parse(newSubplebbitOptions);
        const newInternalProps = {
            _subplebbitUpdateTrigger: true,
            ...(parsedEditOptions.roles ? { roles: this._parseRolesToEdit(parsedEditOptions.roles) } : undefined),
            ...(parsedEditOptions?.settings?.challenges ? this._parseChallengesToEdit(parsedEditOptions.settings.challenges) : undefined)
        };
        const newProps = {
            ...remeda.omit(parsedEditOptions, ["roles"]), // we omit here to make tsc shut up
            ...newInternalProps
        };
        await this._dbHandler.initDestroyedConnection();
        if (newProps.address && newProps.address !== this.address) {
            // we're modifying sub.address
            if (doesDomainAddressHaveCapitalLetter(newProps.address))
                throw new PlebbitError("ERR_DOMAIN_ADDRESS_HAS_CAPITAL_LETTER", { subplebbitAddress: newProps.address });
            this._assertDomainResolvesCorrectly(newProps.address).catch((err) => {
                log.error(err.toString());
                this.emit("error", err);
            });
            log(`Attempting to edit subplebbit.address from ${this.address} to ${newProps.address}`);
            await this._updateDbInternalState(newProps);
            if (!(await this._dbHandler.isSubStartLocked())) {
                log("will rename the subplebbit db in edit() because the subplebbit is not being ran anywhere else");
                await this._movePostUpdatesFolderToNewAddress(this.address, newProps.address);
                await this._dbHandler.destoryConnection();
                await this._dbHandler.changeDbFilename(this.address, newProps.address);
                this.setAddress(newProps.address);
            }
        }
        else {
            await this._updateDbInternalState(newProps);
        }
        const latestState = await this._getDbInternalState(true);
        if (!latestState)
            throw Error("Internal state in db should be defined prior to calling sub.edit()");
        if ("updatedAt" in latestState)
            await this.initInternalSubplebbitAfterFirstUpdateNoMerge(latestState);
        else
            await this.initInternalSubplebbitBeforeFirstUpdateNoMerge(latestState);
        log(`Subplebbit (${this.address}) props (${remeda.keys.strict(newProps)}) has been edited: `, remeda.pick(latestState, remeda.keys.strict(parsedEditOptions)));
        if (this.state === "stopped")
            await this._dbHandler.destoryConnection(); // Need to destory connection so process wouldn't hang
        this.emit("update", this);
        return this;
    }
    async start() {
        const log = Logger("plebbit-js:local-subplebbit:start");
        this._stopHasBeenCalled = false;
        try {
            await this._initBeforeStarting();
            // update started value twice because it could be started prior lockSubStart
            this._setState("started");
            await this._updateStartedValue();
            await this._dbHandler.lockSubStart(); // Will throw if sub is locked already
            await this._updateStartedValue();
            await this._dbHandler.initDbIfNeeded();
            await this._dbHandler.initDestroyedConnection();
            await this._setChallengesToDefaultIfNotDefined(log);
            // Import subplebbit keys onto ipfs node
            await this._importSubplebbitSignerIntoIpfsIfNeeded();
            this._subplebbitUpdateTrigger = true;
            await this._updateDbInternalState({ _subplebbitUpdateTrigger: this._subplebbitUpdateTrigger });
            this._setStartedState("publishing-ipns");
            await this._repinCommentsIPFSIfNeeded();
            await this._repinCommentUpdateIfNeeded();
            await this._listenToIncomingRequests();
        }
        catch (e) {
            await this.stop(); // Make sure to reset the sub state
            throw e;
        }
        this.syncIpnsWithDb()
            .then(() => this._publishLoop(this._plebbit.publishInterval))
            .catch((reason) => {
            log.error(reason);
            this.emit("error", reason);
        });
    }
    async _updateOnce() {
        const log = Logger("plebbit-js:local-subplebbit:update");
        const dbSubState = await this._getDbInternalState(false);
        if (!dbSubState)
            throw Error("There is no internal sub state in db");
        await this._updateStartedValue();
        if (this._internalStateUpdateId !== dbSubState._internalStateUpdateId) {
            this._setUpdatingState("succeeded");
            if ("updatedAt" in dbSubState)
                await this.initInternalSubplebbitAfterFirstUpdateNoMerge(dbSubState);
            else
                await this.initInternalSubplebbitBeforeFirstUpdateNoMerge(dbSubState);
            log(`Local Subplebbit (${this.address}) received a new update with updatedAt (${this.updatedAt}). Will emit an update event`);
            this.emit("update", this);
        }
    }
    async update() {
        const log = Logger("plebbit-js:local-subplebbit:update");
        if (this.state === "updating" || this.state === "started")
            return; // No need to do anything if subplebbit is already updating
        const updateLoop = (async () => {
            if (this.state === "updating")
                this._updateOnce()
                    .catch((e) => log.error(`Failed to update subplebbit`, e))
                    .finally(() => setTimeout(updateLoop, this._plebbit.updateInterval));
        }).bind(this);
        this._setState("updating");
        this._updateOnce()
            .catch((e) => log.error(`Failed to update subplebbit`, e))
            .finally(() => (this._updateTimeout = setTimeout(updateLoop, this._plebbit.updateInterval)));
    }
    async stop() {
        const log = Logger("plebbit-js:local-subplebbit:stop");
        this._stopHasBeenCalled = true;
        if (this.state === "started") {
            try {
                await this._dbHandler.unlockSubStart();
            }
            catch (e) {
                log.error(`Failed to unlock start lock on sub (${this.address})`, e);
            }
            if (this._publishLoopPromise)
                await this._publishLoopPromise; // should be in try/catch
            await this._clientsManager.pubsubUnsubscribe(this.pubsubTopicWithfallback(), this.handleChallengeExchange);
            this._setStartedState("stopped");
            await this._dbHandler.rollbackAllTransactions();
            await this._dbHandler.unlockSubState();
            await this._updateStartedValue();
            clearInterval(this._publishInterval);
            this._clientsManager.updateIpfsState("stopped");
            this._clientsManager.updatePubsubState("stopped", undefined);
            await this._dbHandler.destoryConnection();
            log(`Stopped the running of local subplebbit (${this.address})`);
            this._setState("stopped");
        }
        else if (this.state === "updating") {
            clearTimeout(this._updateTimeout);
            this._setUpdatingState("stopped");
            log(`Stopped the updating of local subplebbit (${this.address})`);
            this._setState("stopped");
        }
        else
            throw Error("User called localSubplebbit.stop() without updating or starting first");
        this._stopHasBeenCalled = false;
    }
    async delete() {
        const log = Logger("plebbit-js:local-subplebbit:delete");
        log.trace(`Attempting to stop the subplebbit (${this.address}) before deleting, if needed`);
        if (this.state === "updating" || this.state === "started")
            await this.stop();
        const ipfsClient = this._clientsManager.getDefaultIpfs();
        if (!ipfsClient)
            throw Error("Ipfs client is not defined");
        await moveSubplebbitDbToDeletedDirectory(this.address, this._plebbit);
        if (typeof this.signer?.ipnsKeyName === "string")
            // Key may not exist on ipfs node
            try {
                await ipfsClient._client.key.rm(this.signer.ipnsKeyName);
            }
            catch { }
        log(`Deleted subplebbit (${this.address}) successfully`);
    }
}
//# sourceMappingURL=local-subplebbit.js.map