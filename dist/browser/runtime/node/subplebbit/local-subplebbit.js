import Logger from "@plebbit/plebbit-logger";
import { LRUCache } from "lru-cache";
import { SortHandler } from "./sort-handler.js";
import { DbHandler } from "./db-handler.js";
import { of as calculateIpfsHash } from "typestub-ipfs-only-hash";
import { doesDomainAddressHaveCapitalLetter, genToArray, isLinkOfMedia, isLinkValid, isStringDomain, removeNullUndefinedEmptyObjectsValuesRecursively, removeUndefinedValuesRecursively, throwWithErrorCode, timestamp } from "../../../util.js";
import { STORAGE_KEYS } from "../../../constants.js";
import { stringify as deterministicStringify } from "safe-stable-stringify";
import { PlebbitError } from "../../../plebbit-error.js";
import { cleanUpBeforePublishing, signChallengeMessage, signChallengeVerification, signCommentUpdate, signSubplebbit, verifyChallengeAnswer, verifyChallengeRequest, verifyCommentEdit, verifyCommentUpdate } from "../../../signer/signatures.js";
import { ChallengeAnswerMessage, ChallengeMessage, ChallengeRequestMessage, ChallengeVerificationMessage } from "../../../challenge.js";
import { getThumbnailUrlOfLink, importSignerIntoIpfsNode, moveSubplebbitDbToDeletedDirectory } from "../util.js";
import { getErrorCodeFromMessage } from "../../../util.js";
import { SignerWithPublicKeyAddress, decryptEd25519AesGcmPublicKeyBuffer, verifyComment, verifySubplebbit, verifyVote } from "../../../signer/index.js";
import { encryptEd25519AesGcmPublicKeyBuffer } from "../../../signer/encryption.js";
import { messages } from "../../../errors.js";
import { AUTHOR_EDIT_FIELDS, MOD_EDIT_FIELDS } from "../../../signer/constants.js";
import { getChallengeVerification, getSubplebbitChallengeFromSubplebbitChallengeSettings } from "./challenges/index.js";
import * as cborg from "cborg";
import assert from "assert";
import env from "../../../version.js";
import { sha256 } from "js-sha256";
import { getIpfsKeyFromPrivateKey, getPlebbitAddressFromPublicKey, getPublicKeyFromPrivateKey } from "../../../signer/util.js";
import { RpcLocalSubplebbit } from "../../../subplebbit/rpc-local-subplebbit.js";
import * as remeda from "remeda";
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
        this.handleChallengeExchange = this.handleChallengeExchange.bind(this);
        this.started = false;
        this._isSubRunningLocally = false;
        this._subplebbitUpdateTrigger = false;
    }
    // This will be stored in DB
    toJSONInternal() {
        return {
            ...remeda.omit(this.toJSONInternalRpc(), ["started"]),
            signer: remeda.pick(this.signer, ["privateKey", "type", "address", "shortAddress", "publicKey"]),
            _subplebbitUpdateTrigger: this._subplebbitUpdateTrigger
        };
    }
    toJSONInternalRpc() {
        return {
            ...super.toJSONInternalRpc(),
            signer: remeda.pick(this.signer, ["publicKey", "address", "shortAddress", "type"])
        };
    }
    toJSON() {
        const internalJson = this.toJSONInternal();
        return {
            ...internalJson,
            posts: this.posts.toJSON(),
            shortAddress: this.shortAddress,
            signer: remeda.omit(internalJson.signer, ["privateKey"])
        };
    }
    async _updateStartedValue() {
        this.started = await this.dbHandler.isSubStartLocked(this.address);
    }
    async initNewLocalSubPropsNoMerge(newProps) {
        await this._initSignerProps(newProps.signer);
        this.title = newProps.title;
        this.description = newProps.description;
        this.lastPostCid = newProps.lastPostCid;
        this.lastCommentCid = newProps.lastCommentCid;
        this.setAddress(newProps.address);
        this.pubsubTopic = newProps.pubsubTopic;
        this.roles = newProps.roles;
        this.features = newProps.features;
        this.suggested = newProps.suggested;
        this.rules = newProps.rules;
        this.flairs = newProps.flairs;
    }
    async initInternalSubplebbitNoMerge(newProps) {
        await this.initRpcInternalSubplebbitNoMerge({ ...newProps, started: this.started });
        await this._initSignerProps(newProps.signer);
        this._subplebbitUpdateTrigger = newProps._subplebbitUpdateTrigger;
    }
    async initDbHandlerIfNeeded() {
        if (!this.dbHandler) {
            this.dbHandler = new DbHandler(this);
            await this.dbHandler.initDbConfigIfNeeded();
            this._sortHandler = new SortHandler(this);
        }
    }
    async _loadLocalSubDb() {
        // This function will load the InternalSubplebbit props from the local db and update its props with it
        await this.initDbHandlerIfNeeded();
        await this.dbHandler.initDbIfNeeded();
        await this._mergeInstanceStateWithDbState({}); // Load InternalSubplebbit from DB here
        if (!this.signer)
            throwWithErrorCode("ERR_LOCAL_SUB_HAS_NO_SIGNER_IN_INTERNAL_STATE", { address: this.address });
        await this._updateStartedValue();
        await this.dbHandler.destoryConnection(); // Need to destory connection so process wouldn't hang
    }
    async _importSubplebbitSignerIntoIpfsIfNeeded() {
        if (!this.signer.ipnsKeyName)
            throw Error("subplebbit.signer.ipnsKeyName is not defined");
        if (!this.signer.ipfsKey)
            throw Error("subplebbit.signer.ipfsKey is not defined");
        const ipfsNodeKeys = await this.clientsManager.getDefaultIpfs()._client.key.list();
        if (!ipfsNodeKeys.find((key) => key.name === this.signer.ipnsKeyName))
            await importSignerIntoIpfsNode(this.signer.ipnsKeyName, this.signer.ipfsKey, {
                url: this.plebbit.ipfsHttpClientsOptions[0].url,
                headers: this.plebbit.ipfsHttpClientsOptions[0].headers
            });
    }
    async _updateDbInternalState(props) {
        if (remeda.isEmpty(props))
            return;
        await this.dbHandler.lockSubState();
        const internalStateBefore = await this.dbHandler.keyvGet(STORAGE_KEYS[STORAGE_KEYS.INTERNAL_SUBPLEBBIT]);
        await this.dbHandler.keyvSet(STORAGE_KEYS[STORAGE_KEYS.INTERNAL_SUBPLEBBIT], {
            ...internalStateBefore,
            ...props
        });
        await this.dbHandler.unlockSubState();
    }
    async _getDbInternalState(lock = true) {
        if (lock)
            await this.dbHandler.lockSubState();
        const internalState = await this.dbHandler.keyvGet(STORAGE_KEYS[STORAGE_KEYS.INTERNAL_SUBPLEBBIT]);
        if (lock)
            await this.dbHandler.unlockSubState();
        return internalState;
    }
    async _mergeInstanceStateWithDbState(overrideProps) {
        const currentDbState = remeda.omit(await this._getDbInternalState(), ["address"]);
        await this.initInternalSubplebbitNoMerge({ address: this.address, ...currentDbState, ...overrideProps }); // Not sure about this line
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
        await this.dbHandler.initDbIfNeeded();
        if (!this.pubsubTopic)
            this.pubsubTopic = remeda.clone(this.signer.address);
        if (typeof this.createdAt !== "number")
            this.createdAt = timestamp();
        await this._updateDbInternalState(this.toJSONInternal());
        await this._setChallengesToDefaultIfNotDefined(log);
        await this._updateStartedValue();
        await this.dbHandler.destoryConnection(); // Need to destory connection so process wouldn't hang
    }
    async _calculateNewPostUpdates() {
        const postUpdates = {};
        for (const timeBucket of this._postUpdatesBuckets) {
            try {
                const statRes = await this.clientsManager.getDefaultIpfs()._client.files.stat(`/${this.address}/postUpdates/${timeBucket}`);
                if (statRes.blocks !== 0)
                    postUpdates[String(timeBucket)] = String(statRes.cid);
            }
            catch { }
        }
        if (remeda.isEmpty(postUpdates))
            return undefined;
        return postUpdates;
    }
    async updateSubplebbitIpnsIfNeeded() {
        const log = Logger("plebbit-js:local-subplebbit:sync");
        const lastPublishTooOld = this.updatedAt < timestamp() - 60 * 15; // Publish a subplebbit record every 15 minutes at least
        const dbInstance = await this._getDbInternalState(true);
        this._subplebbitUpdateTrigger = this._subplebbitUpdateTrigger || dbInstance._subplebbitUpdateTrigger || lastPublishTooOld;
        if (!this._subplebbitUpdateTrigger)
            return; // No reason to update
        const trx = await this.dbHandler.createTransaction("subplebbit");
        const latestPost = await this.dbHandler.queryLatestPostCid(trx);
        const latestComment = await this.dbHandler.queryLatestCommentCid(trx);
        await this.dbHandler.commitTransaction("subplebbit");
        const [stats, subplebbitPosts] = await Promise.all([
            this.dbHandler.querySubplebbitStats(undefined),
            this._sortHandler.generateSubplebbitPosts()
        ]);
        if (subplebbitPosts && this.posts?.pageCids) {
            const newPageCids = remeda.unique(Object.values(subplebbitPosts.pageCids));
            const pageCidsToUnPin = remeda.unique(Object.values(this.posts.pageCids).filter((oldPageCid) => !newPageCids.includes(oldPageCid)));
            this._cidsToUnPin.push(...pageCidsToUnPin);
        }
        const newPostUpdates = await this._calculateNewPostUpdates();
        const statsCid = (await this.clientsManager.getDefaultIpfs()._client.add(deterministicStringify(stats))).path;
        if (this.statsCid && statsCid !== this.statsCid)
            this._cidsToUnPin.push(this.statsCid);
        await this._mergeInstanceStateWithDbState({});
        const updatedAt = timestamp() === this.updatedAt ? timestamp() + 1 : timestamp();
        const newIpns = {
            ...cleanUpBeforePublishing({
                ...remeda.omit(this._toJSONBase(), ["signature"]),
                lastPostCid: latestPost?.cid,
                lastCommentCid: latestComment?.cid,
                statsCid,
                updatedAt,
                postUpdates: newPostUpdates
            })
        };
        // posts should not be cleaned up because we want to make sure not to modify authors' posts
        if (subplebbitPosts)
            newIpns.posts = removeUndefinedValuesRecursively({
                pageCids: subplebbitPosts.pageCids,
                pages: remeda.pick(subplebbitPosts.pages, ["hot"])
            });
        else
            delete newIpns.posts;
        const signature = await signSubplebbit(newIpns, this.signer);
        const newSubplebbitRecord = { ...newIpns, signature };
        await this._validateSubSignatureBeforePublishing(newSubplebbitRecord); // this commented line should be taken out later
        await this.initRemoteSubplebbitPropsNoMerge(newSubplebbitRecord);
        this._subplebbitUpdateTrigger = false;
        await this._updateDbInternalState(remeda.omit(this.toJSONInternal(), ["address"]));
        this._unpinStaleCids().catch((err) => log.error("Failed to unpin stale cids due to ", err));
        const file = await this.clientsManager.getDefaultIpfs()._client.add(deterministicStringify(newSubplebbitRecord));
        this._cidsToUnPin = [file.path];
        // If this._isSubRunningLocally = false, then this is the last publish before stopping
        // TODO double check these values
        const ttl = this._isSubRunningLocally ? `${this.plebbit.publishInterval * 3}ms` : undefined;
        const lifetime = `24h`; // doesn't matter anyway, DHT drops all entries after 24h
        const publishRes = await this.clientsManager.getDefaultIpfs()._client.name.publish(file.path, {
            key: this.signer.ipnsKeyName,
            allowOffline: true,
            ttl,
            lifetime
        });
        log(`Published a new IPNS record for sub(${this.address}) on IPNS (${publishRes.name}) that points to file (${publishRes.value}) with updatedAt (${this.updatedAt})`);
        this._setStartedState("succeeded");
        this.clientsManager.updateIpfsState("stopped");
        this.emit("update", this);
    }
    shouldResolveDomainForVerification() {
        return this.address.includes(".") && Math.random() < 0.005; // Resolving domain should be a rare process because default rpcs throttle if we resolve too much
    }
    async _validateSubSignatureBeforePublishing(recordTobePublished) {
        const log = Logger("plebbit-js:local-subplebbit:_validateSubSignatureBeforePublishing");
        const validation = await verifySubplebbit(recordTobePublished, false, this.clientsManager, false, false);
        if (!validation.valid) {
            this._cidsToUnPin = [];
            throwWithErrorCode("ERR_LOCAL_SUBPLEBBIT_PRODUCED_INVALID_RECORD", {
                validation,
                subplebbitAddress: recordTobePublished.address
            });
        }
        if (this.shouldResolveDomainForVerification()) {
            try {
                log(`Resolving domain ${this.address} to make sure it's the same as signer.address ${this.signer.address}`);
                const resolvedSubAddress = await this.clientsManager.resolveSubplebbitAddressIfNeeded(this.address);
                if (resolvedSubAddress !== this.signer.address)
                    log.error(`The domain address (${this.address}) subplebbit-address text record to resolves to ${resolvedSubAddress} when it should resolve to ${this.signer.address}`);
            }
            catch (e) {
                log.error(`Failed to resolve sub domain ${this.address}`, e);
            }
        }
    }
    async storeCommentEdit(commentEditRaw, challengeRequestId) {
        const log = Logger("plebbit-js:local-subplebbit:handleCommentEdit");
        const commentEdit = await this.plebbit.createCommentEdit(commentEditRaw);
        const commentToBeEdited = await this.dbHandler.queryComment(commentEdit.commentCid, undefined); // We assume commentToBeEdited to be defined because we already tested for its existence above
        if (!commentToBeEdited)
            throw Error("The comment to edit doesn't exist"); // unlikely error to happen, but always a good idea to verify
        const editSignedByOriginalAuthor = commentEditRaw.signature.publicKey === commentToBeEdited.signature.publicKey;
        const isAuthorEdit = this._isAuthorEdit(commentEditRaw, editSignedByOriginalAuthor);
        const authorSignerAddress = await getPlebbitAddressFromPublicKey(commentEdit.signature.publicKey);
        await this.dbHandler.insertEdit(commentEdit.toJSONForDb(isAuthorEdit, authorSignerAddress));
        log.trace(`(${challengeRequestId}): `, `Updated comment (${commentEdit.commentCid}) with CommentEdit: `, commentEditRaw);
    }
    async storeVote(newVoteProps, challengeRequestId) {
        const log = Logger("plebbit-js:local-subplebbit:handleVote");
        const newVote = await this.plebbit.createVote(newVoteProps);
        const authorSignerAddress = await getPlebbitAddressFromPublicKey(newVote.signature.publicKey);
        await this.dbHandler.deleteVote(authorSignerAddress, newVote.commentCid);
        await this.dbHandler.insertVote(newVote.toJSONForDb(authorSignerAddress));
        log.trace(`inserted new vote (${newVote.vote}) for comment ${newVote.commentCid}`);
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
    async storePublication(request) {
        const log = Logger("plebbit-js:local-subplebbit:handleChallengeExchange:storePublicationIfValid");
        const publication = request.publication;
        const publicationHash = sha256(deterministicStringify(publication));
        if (this.isPublicationVote(publication))
            return this.storeVote(publication, request.challengeRequestId);
        else if (this.isPublicationCommentEdit(publication))
            return this.storeCommentEdit(publication, request.challengeRequestId);
        else if (this.isPublicationComment(publication)) {
            const commentToInsert = await this.plebbit.createComment(publication);
            if (commentToInsert.link && this.settings?.fetchThumbnailUrls) {
                const thumbnailInfo = await getThumbnailUrlOfLink(commentToInsert.link, this, this.settings.fetchThumbnailUrlsProxyUrl);
                if (thumbnailInfo) {
                    commentToInsert.thumbnailUrl = thumbnailInfo.thumbnailUrl;
                    commentToInsert.thumbnailUrlWidth = thumbnailInfo.thumbnailWidth;
                    commentToInsert.thumbnailUrlHeight = thumbnailInfo.thumbnailHeight;
                }
            }
            const authorSignerAddress = await getPlebbitAddressFromPublicKey(commentToInsert.signature.publicKey);
            if (this.isPublicationPost(publication)) {
                // Post
                const trx = await this.dbHandler.createTransaction(request.challengeRequestId.toString());
                commentToInsert.setPreviousCid((await this.dbHandler.queryLatestPostCid(trx))?.cid);
                await this.dbHandler.commitTransaction(request.challengeRequestId.toString());
                commentToInsert.setDepth(0);
                const file = await this.clientsManager.getDefaultIpfs()._client.add(deterministicStringify(commentToInsert.toJSONIpfs()));
                commentToInsert.setPostCid(file.path);
                commentToInsert.setCid(file.path);
            }
            else {
                if (!commentToInsert.parentCid)
                    throw Error("Reply has to have parentCid");
                // Reply
                const trx = await this.dbHandler.createTransaction(request.challengeRequestId.toString());
                const [commentsUnderParent, parent] = await Promise.all([
                    this.dbHandler.queryCommentsUnderComment(commentToInsert.parentCid, trx),
                    this.dbHandler.queryComment(commentToInsert.parentCid, trx)
                ]);
                await this.dbHandler.commitTransaction(request.challengeRequestId.toString());
                if (!parent)
                    throw Error("Failed to find parent of reply");
                commentToInsert.setPreviousCid(commentsUnderParent[0]?.cid);
                commentToInsert.setDepth(parent.depth + 1);
                commentToInsert.setPostCid(parent.postCid);
                const file = await this.clientsManager.getDefaultIpfs()._client.add(deterministicStringify(commentToInsert.toJSONIpfs()));
                commentToInsert.setCid(file.path);
            }
            const trxForInsert = await this.dbHandler.createTransaction(request.challengeRequestId.toString());
            try {
                await this.dbHandler.insertComment(commentToInsert.toJSONCommentsTableRowInsert(publicationHash, authorSignerAddress), trxForInsert);
                // Everything below here is for verification purposes
                const commentInDb = await this.dbHandler.queryComment(commentToInsert.cid, trxForInsert);
                if (!commentInDb)
                    throw Error("Failed to query the comment we just inserted");
                const commentInDbInstance = await this.plebbit.createComment(commentInDb);
                const validity = await verifyComment(removeUndefinedValuesRecursively(commentInDbInstance.toJSONIpfs()), this.plebbit.resolveAuthorAddresses, this.clientsManager, false);
                if (!validity.valid)
                    throw Error("There is a problem with how query rows are processed in DB, which is causing an invalid signature. This is a critical Error");
                const calculatedHash = await calculateIpfsHash(deterministicStringify(commentInDbInstance.toJSONIpfs()));
                if (calculatedHash !== commentInDb.cid)
                    throw Error("There is a problem with db processing comment rows, the cids don't match");
            }
            catch (e) {
                log.error(`Failed to insert post to db due to error, rolling back on inserting the comment. This is a critical error`, e);
                await this.dbHandler.rollbackTransaction(request.challengeRequestId.toString());
                throw e;
            }
            await this.dbHandler.commitTransaction(request.challengeRequestId.toString());
            log(`New comment with cid ${commentToInsert.cid}  and depth (${commentToInsert.depth}) has been inserted into DB`);
            return commentToInsert.toJSONAfterChallengeVerification();
        }
    }
    async _decryptOrRespondWithFailure(request) {
        const log = Logger("plebbit-js:local-subplebbit:_decryptOrRespondWithFailure");
        let decrypted;
        try {
            decrypted = JSON.parse(await decryptEd25519AesGcmPublicKeyBuffer(request.encrypted, this.signer.privateKey, request.signature.publicKey));
            if (request?.type === "CHALLENGEREQUEST")
                return { ...request, ...decrypted };
            else if (request?.type === "CHALLENGEANSWER")
                return { ...request, ...decrypted };
            else
                throw Error("Decrypted message is not a challenge request or challenge answer");
        }
        catch (e) {
            log.error(`Failed to decrypt request (${request?.challengeRequestId?.toString()}) due to error`, e);
            if (request?.challengeRequestId?.toString())
                await this._publishFailedChallengeVerification({ reason: messages.ERR_SUB_FAILED_TO_DECRYPT_PUBSUB_MSG }, request.challengeRequestId);
            throw e;
        }
    }
    async _respondWithErrorIfSignatureOfPublicationIsInvalid(request) {
        let validity;
        if (this.isPublicationComment(request.publication))
            validity = await verifyComment(request.publication, this.plebbit.resolveAuthorAddresses, this.clientsManager, false);
        else if (this.isPublicationCommentEdit(request.publication))
            validity = await verifyCommentEdit(request.publication, this.plebbit.resolveAuthorAddresses, this.clientsManager, false);
        else if (this.isPublicationVote(request.publication))
            validity = await verifyVote(request.publication, this.plebbit.resolveAuthorAddresses, this.clientsManager, false);
        else
            throw Error("Can't detect the type of publication");
        if (!validity.valid) {
            await this._publishFailedChallengeVerification({ reason: validity.reason }, request.challengeRequestId);
            throwWithErrorCode(getErrorCodeFromMessage(validity.reason), { publication: request.publication, validity });
        }
    }
    async _publishChallenges(challenges, request) {
        const log = Logger("plebbit-js:local-subplebbit:_publishChallenges");
        const toEncryptChallenge = { challenges: challenges };
        const toSignChallenge = cleanUpBeforePublishing({
            type: "CHALLENGE",
            protocolVersion: env.PROTOCOL_VERSION,
            userAgent: env.USER_AGENT,
            challengeRequestId: request.challengeRequestId,
            encrypted: await encryptEd25519AesGcmPublicKeyBuffer(deterministicStringify(toEncryptChallenge), this.signer.privateKey, request.signature.publicKey),
            timestamp: timestamp()
        });
        const challengeMessage = new ChallengeMessage({
            ...toSignChallenge,
            signature: await signChallengeMessage(toSignChallenge, this.signer)
        });
        this.clientsManager.updatePubsubState("publishing-challenge", undefined);
        await this.clientsManager.pubsubPublish(this.pubsubTopicWithfallback(), challengeMessage);
        log.trace(`Published ${challengeMessage.type} over pubsub: `, remeda.pick(toSignChallenge, ["timestamp"]), toEncryptChallenge.challenges.map((challenge) => challenge.type));
        this.clientsManager.updatePubsubState("waiting-challenge-answers", undefined);
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
            userAgent: env.USER_AGENT,
            protocolVersion: env.PROTOCOL_VERSION,
            timestamp: timestamp()
        });
        const challengeVerification = new ChallengeVerificationMessage({
            ...toSignVerification,
            signature: await signChallengeVerification(toSignVerification, this.signer)
        });
        this.clientsManager.updatePubsubState("publishing-challenge-verification", undefined);
        log(`(${challengeRequestId}): `, `Will publish ${challengeVerification.type} over pubsub:`, toSignVerification);
        await this.clientsManager.pubsubPublish(this.pubsubTopicWithfallback(), challengeVerification);
        this.clientsManager.updatePubsubState("waiting-challenge-requests", undefined);
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
            //@ts-expect-error
            const publication = await this.storePublication(request);
            if (remeda.isPlainObject(publication)) {
                const authorSignerAddress = await getPlebbitAddressFromPublicKey(publication.signature.publicKey);
                const subplebbitAuthor = await this.dbHandler.querySubplebbitAuthor(authorSignerAddress);
                if (subplebbitAuthor)
                    publication.author.subplebbit = subplebbitAuthor;
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
                userAgent: env.USER_AGENT,
                protocolVersion: env.PROTOCOL_VERSION,
                timestamp: timestamp()
            });
            const challengeVerification = new ChallengeVerificationMessage({
                ...toSignMsg,
                signature: await signChallengeVerification(toSignMsg, this.signer)
            });
            this.clientsManager.updatePubsubState("publishing-challenge-verification", undefined);
            await this.clientsManager.pubsubPublish(this.pubsubTopicWithfallback(), challengeVerification);
            this.clientsManager.updatePubsubState("waiting-challenge-requests", undefined);
            const objectToEmit = { ...challengeVerification, publication };
            this.emit("challengeverification", objectToEmit);
            this._ongoingChallengeExchanges.delete(request.challengeRequestId.toString());
            this._cleanUpChallengeAnswerPromise(request.challengeRequestId.toString());
            log(`Published ${challengeVerification.type} over pubsub:`, removeNullUndefinedEmptyObjectsValuesRecursively(remeda.pick(objectToEmit, ["publication", "challengeSuccess", "reason", "challengeErrors", "timestamp"])));
        }
    }
    _commentEditIncludesUniqueModFields(request) {
        const modOnlyFields = ["pinned", "locked", "removed", "commentAuthor"];
        return remeda.intersection(modOnlyFields, remeda.keys.strict(request)).length > 0;
    }
    _commentEditIncludesUniqueAuthorFields(request) {
        const modOnlyFields = ["content", "deleted"];
        return remeda.intersection(modOnlyFields, remeda.keys.strict(request)).length > 0;
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
    async _checkPublicationValidity(request) {
        const log = Logger("plebbit-js:local-subplebbit:handleChallengeRequest:checkPublicationValidity");
        const publication = remeda.clone(request.publication); // not sure if we need to clone
        if ("signer" in publication)
            return messages.ERR_FORBIDDEN_SIGNER_FIELD;
        if (publication.subplebbitAddress !== this.address)
            return messages.ERR_PUBLICATION_INVALID_SUBPLEBBIT_ADDRESS;
        if (typeof publication?.author?.subplebbit?.banExpiresAt === "number" && publication.author.subplebbit.banExpiresAt > timestamp())
            return messages.ERR_AUTHOR_IS_BANNED;
        delete publication.author.subplebbit; // author.subplebbit is generated by the sub so we need to remove it
        const forbiddenAuthorFields = ["shortAddress"];
        if (remeda.intersection(remeda.keys.strict(publication.author), forbiddenAuthorFields).length > 0)
            return messages.ERR_FORBIDDEN_AUTHOR_FIELD;
        if (!this.isPublicationPost(publication)) {
            const parentCid = this.isPublicationReply(publication)
                ? publication.parentCid
                : this.isPublicationVote(publication) || this.isPublicationCommentEdit(publication)
                    ? publication.commentCid
                    : undefined;
            if (!parentCid)
                return messages.ERR_SUB_COMMENT_PARENT_CID_NOT_DEFINED;
            const parent = await this.dbHandler.queryComment(parentCid);
            if (!parent)
                return messages.ERR_SUB_COMMENT_PARENT_DOES_NOT_EXIST;
            const parentFlags = await this.dbHandler.queryCommentFlags(parentCid);
            if (parentFlags.removed && !this.isPublicationCommentEdit(publication))
                return messages.ERR_SUB_PUBLICATION_PARENT_HAS_BEEN_REMOVED;
            const isParentDeleted = await this.dbHandler.queryAuthorEditDeleted(parentCid);
            if (isParentDeleted && !this.isPublicationCommentEdit(publication))
                return messages.ERR_SUB_PUBLICATION_PARENT_HAS_BEEN_DELETED;
            const postFlags = await this.dbHandler.queryCommentFlags(parent.postCid);
            if (postFlags.removed && !this.isPublicationCommentEdit(publication))
                return messages.ERR_SUB_PUBLICATION_POST_HAS_BEEN_REMOVED;
            const isPostDeleted = await this.dbHandler.queryAuthorEditDeleted(parent.postCid);
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
            return messages.ERR_COMMENT_OVER_ALLOWED_SIZE;
        if (this.isPublicationComment(publication)) {
            const forbiddenCommentFields = [
                "cid",
                "signer",
                "previousCid",
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
            if (remeda.intersection(remeda.keys.strict(publication), forbiddenCommentFields).length > 0)
                return messages.ERR_FORBIDDEN_COMMENT_FIELD;
            if (!publication.content && !publication.link && !publication.title)
                return messages.ERR_COMMENT_HAS_NO_CONTENT_LINK_TITLE;
            if (this.isPublicationPost(publication)) {
                if (this.features?.requirePostLink && publication.link && !isLinkValid(publication.link))
                    return messages.ERR_POST_HAS_INVALID_LINK_FIELD;
                if (this.features?.requirePostLinkIsMedia && publication.link && !isLinkOfMedia(publication.link))
                    return messages.ERR_POST_LINK_IS_NOT_OF_MEDIA;
            }
            const publicationHash = sha256(deterministicStringify(publication));
            const publicationInDb = await this.dbHandler.queryCommentByRequestPublicationHash(publicationHash);
            if (publicationInDb)
                return messages.ERR_DUPLICATE_COMMENT;
            if (remeda.isString(publication.link) && publication.link.length > 2000)
                return messages.COMMENT_LINK_LENGTH_IS_OVER_LIMIT;
        }
        if (this.isPublicationVote(publication)) {
            if (![1, 0, -1].includes(publication.vote))
                return messages.INCORRECT_VOTE_VALUE;
            const authorSignerAddress = await getPlebbitAddressFromPublicKey(publication.signature.publicKey);
            const lastVote = await this.dbHandler.getStoredVoteOfAuthor(publication.commentCid, authorSignerAddress);
            if (lastVote && publication.signature.publicKey !== lastVote.signature.publicKey)
                return messages.UNAUTHORIZED_AUTHOR_ATTEMPTED_TO_CHANGE_VOTE;
        }
        if (this.isPublicationCommentEdit(publication)) {
            const commentToBeEdited = await this.dbHandler.queryComment(publication.commentCid, undefined); // We assume commentToBeEdited to be defined because we already tested for its existence above
            if (!commentToBeEdited)
                throw Error("Wasn't able to find the comment to edit");
            const editSignedByOriginalAuthor = publication.signature.publicKey === commentToBeEdited.signature.publicKey;
            const modRoles = ["moderator", "owner", "admin"];
            const isEditorMod = this.roles?.[publication.author.address] && modRoles.includes(this.roles[publication.author.address]?.role);
            const editHasUniqueModFields = this._commentEditIncludesUniqueModFields(publication);
            const isAuthorEdit = this._isAuthorEdit(publication, editSignedByOriginalAuthor);
            if (isAuthorEdit && editHasUniqueModFields)
                return messages.ERR_PUBLISHING_EDIT_WITH_BOTH_MOD_AND_AUTHOR_FIELDS;
            const allowedEditFields = isAuthorEdit && editSignedByOriginalAuthor ? AUTHOR_EDIT_FIELDS : isEditorMod ? MOD_EDIT_FIELDS : undefined;
            if (!allowedEditFields)
                return messages.ERR_UNAUTHORIZED_COMMENT_EDIT;
            const publicationEditFields = remeda.keys.strict(publication);
            for (const editField of publicationEditFields)
                if (!allowedEditFields.includes(editField)) {
                    log(`The comment edit includes a field (${editField}) that is not part of the allowed fields (${allowedEditFields})`, `isAuthorEdit:${isAuthorEdit}`, `editHasUniqueModFields:${editHasUniqueModFields}`, `isEditorMod:${isEditorMod}`, `editSignedByOriginalAuthor:${editSignedByOriginalAuthor}`);
                    return messages.ERR_SUB_COMMENT_EDIT_UNAUTHORIZED_FIELD;
                }
            if (isEditorMod && typeof publication.locked === "boolean" && commentToBeEdited.depth !== 0)
                return messages.ERR_SUB_COMMENT_EDIT_CAN_NOT_LOCK_REPLY;
        }
        return undefined;
    }
    async handleChallengeRequest(request) {
        const log = Logger("plebbit-js:local-subplebbit:handleChallengeRequest");
        if (this._ongoingChallengeExchanges.has(request.challengeRequestId.toString()))
            return; // This is a duplicate challenge request
        this._ongoingChallengeExchanges.set(request.challengeRequestId.toString(), true);
        const requestSignatureValidation = await verifyChallengeRequest(request, true);
        if (!requestSignatureValidation.valid)
            throwWithErrorCode(getErrorCodeFromMessage(requestSignatureValidation.reason), {
                challengeRequest: remeda.omit(request, ["encrypted"])
            });
        const decryptedRequest = await this._decryptOrRespondWithFailure(request);
        if (typeof decryptedRequest?.publication?.author?.address !== "string")
            return this._publishFailedChallengeVerification({ reason: messages.ERR_AUTHOR_ADDRESS_UNDEFINED }, decryptedRequest.challengeRequestId);
        if ("subplebbit" in decryptedRequest?.publication?.author)
            return this._publishFailedChallengeVerification({ reason: messages.ERR_FORBIDDEN_AUTHOR_FIELD }, decryptedRequest.challengeRequestId);
        const authorSignerAddress = await getPlebbitAddressFromPublicKey(decryptedRequest.publication.signature.publicKey);
        //@ts-expect-error
        const decryptedRequestWithSubplebbitAuthor = decryptedRequest;
        try {
            await this._respondWithErrorIfSignatureOfPublicationIsInvalid(decryptedRequest); // This function will throw an error if signature is invalid
        }
        catch (e) {
            decryptedRequestWithSubplebbitAuthor.publication.author.subplebbit =
                await this.dbHandler.querySubplebbitAuthor(authorSignerAddress);
            this.emit("challengerequest", decryptedRequestWithSubplebbitAuthor);
            return;
        }
        decryptedRequestWithSubplebbitAuthor.publication.author.subplebbit =
            await this.dbHandler.querySubplebbitAuthor(authorSignerAddress);
        this.emit("challengerequest", decryptedRequestWithSubplebbitAuthor);
        // Check publication props validity
        const publicationInvalidityReason = await this._checkPublicationValidity(decryptedRequestWithSubplebbitAuthor);
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
        await this._publishChallengeVerification(challengeVerification, decryptedRequestWithSubplebbitAuthor);
    }
    _cleanUpChallengeAnswerPromise(challengeRequestIdString) {
        this._challengeAnswerPromises.delete(challengeRequestIdString);
        this._challengeAnswerResolveReject.delete(challengeRequestIdString);
    }
    async handleChallengeAnswer(challengeAnswer) {
        const log = Logger("plebbit-js:local-subplebbit:handleChallengeAnswer");
        const answerSignatureValidation = await verifyChallengeAnswer(challengeAnswer, true);
        if (!answerSignatureValidation.valid) {
            this._cleanUpChallengeAnswerPromise(challengeAnswer.challengeRequestId.toString());
            this._ongoingChallengeExchanges.delete(challengeAnswer.challengeRequestId.toString());
            throwWithErrorCode(getErrorCodeFromMessage(answerSignatureValidation.reason), { challengeAnswer });
        }
        const decryptedChallengeAnswer = await this._decryptOrRespondWithFailure(challengeAnswer);
        this.emit("challengeanswer", decryptedChallengeAnswer);
        const challengeAnswerPromise = this._challengeAnswerResolveReject.get(challengeAnswer.challengeRequestId.toString());
        if (!challengeAnswerPromise)
            throw Error("The challenge answer promise is undefined, there is an issue with challenge. This is a critical error");
        challengeAnswerPromise.resolve(decryptedChallengeAnswer.challengeAnswers);
    }
    async handleChallengeExchange(pubsubMsg) {
        const log = Logger("plebbit-js:local-subplebbit:handleChallengeExchange");
        let msgParsed;
        try {
            msgParsed = cborg.decode(pubsubMsg.data);
            if (msgParsed?.type === "CHALLENGEREQUEST") {
                await this.handleChallengeRequest(new ChallengeRequestMessage(msgParsed));
            }
            else if (msgParsed?.type === "CHALLENGEANSWER" &&
                !this._ongoingChallengeExchanges.has(msgParsed.challengeRequestId.toString()))
                // Respond with error to answers without challenge request
                await this._publishFailedChallengeVerification({ reason: messages.ERR_CHALLENGE_ANSWER_WITH_NO_CHALLENGE_REQUEST }, msgParsed.challengeRequestId);
            else if (msgParsed?.type === "CHALLENGEANSWER")
                await this.handleChallengeAnswer(new ChallengeAnswerMessage(msgParsed));
            else if (msgParsed?.type === "CHALLENGE" || msgParsed?.type === "CHALLENGEVERIFICATION")
                log(`Received a pubsub message that is not meant to by processed by the sub - ${msgParsed?.type}`);
            else
                throw Error("Wasn't able to detect the type of challenge message");
        }
        catch (e) {
            e.message =
                `failed process captcha for challenge request id (${msgParsed?.challengeRequestId}): ${e.message}`;
            log.error(`(${msgParsed?.challengeRequestId}): `, String(e));
            if (msgParsed?.challengeRequestId?.toString())
                await this.dbHandler.rollbackTransaction(msgParsed.challengeRequestId.toString());
        }
    }
    _calculatePostUpdatePathForExistingCommentUpdate(timestampRange, currentIpfsPath) {
        const pathParts = currentIpfsPath.split("/");
        return ["/" + this.address, "postUpdates", timestampRange, ...pathParts.slice(4)].join("/");
    }
    async _calculateIpfsPathForCommentUpdate(dbComment, storedCommentUpdate) {
        const postTimestamp = dbComment.depth === 0 ? dbComment.timestamp : (await this.dbHandler.queryComment(dbComment.postCid))?.timestamp;
        if (typeof postTimestamp !== "number")
            throw Error("failed to query the comment in db to look for its postTimestamp");
        const timestampRange = this._postUpdatesBuckets.find((bucket) => timestamp() - bucket <= postTimestamp);
        if (typeof timestampRange !== "number")
            throw Error("Failed to find timestamp range for comment update");
        if (storedCommentUpdate?.ipfsPath)
            return this._calculatePostUpdatePathForExistingCommentUpdate(timestampRange, storedCommentUpdate.ipfsPath);
        else {
            const parentsCids = (await this.dbHandler.queryParents(dbComment)).map((parent) => parent.cid).reverse();
            return ["/" + this.address, "postUpdates", timestampRange, ...parentsCids, dbComment.cid, "update"].join("/");
        }
    }
    async _writeCommentUpdateToIpfsFilePath(newCommentUpdate, ipfsPath, oldIpfsPath) {
        // TODO need to exclude reply.replies here
        await this.clientsManager
            .getDefaultIpfs()
            ._client.files.write(ipfsPath, deterministicStringify(newCommentUpdate), { parents: true, truncate: true, create: true });
        if (oldIpfsPath && oldIpfsPath !== ipfsPath)
            await this.clientsManager.getDefaultIpfs()._client.files.rm(oldIpfsPath);
    }
    async _updateComment(comment) {
        const log = Logger("plebbit-js:local-subplebbit:sync:syncComment");
        // If we're here that means we're gonna calculate the new update and publish it
        log(`Attempting to update Comment (${comment.cid})`);
        // This comment will have the local new CommentUpdate, which we will publish to IPFS fiels
        // It includes new author.subplebbit as well as updated values in CommentUpdate (except for replies field)
        const [calculatedCommentUpdate, storedCommentUpdate, generatedPages] = await Promise.all([
            this.dbHandler.queryCalculatedCommentUpdate(comment),
            this.dbHandler.queryStoredCommentUpdate(comment),
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
        await this.dbHandler.upsertCommentUpdate({ ...newCommentUpdate, ipfsPath });
    }
    async _validateCommentUpdateSignature(newCommentUpdate, comment, log) {
        // This function should be deleted at some point, once the protocol ossifies
        const validation = await verifyCommentUpdate(newCommentUpdate, false, this.clientsManager, this.address, comment, false, false);
        if (!validation.valid) {
            log.error(`CommentUpdate (${comment.cid}) signature is invalid due to (${validation.reason}). This is a critical error`);
            throw new PlebbitError("ERR_COMMENT_UPDATE_SIGNATURE_IS_INVALID", validation);
        }
    }
    async _listenToIncomingRequests() {
        const log = Logger("plebbit-js:local-subplebbit:sync:_listenToIncomingRequests");
        // Make sure subplebbit listens to pubsub topic
        // Code below is to handle in case the ipfs node restarted and the subscription got lost or something
        const subscribedTopics = await this.clientsManager.getDefaultPubsub()._client.pubsub.ls();
        if (!subscribedTopics.includes(this.pubsubTopicWithfallback())) {
            await this.clientsManager.pubsubUnsubscribe(this.pubsubTopicWithfallback(), this.handleChallengeExchange); // Make sure it's not hanging
            await this.clientsManager.pubsubSubscribe(this.pubsubTopicWithfallback(), this.handleChallengeExchange);
            this.clientsManager.updatePubsubState("waiting-challenge-requests", undefined);
            log(`Waiting for publications on pubsub topic (${this.pubsubTopicWithfallback()})`);
        }
    }
    async _movePostUpdatesFolderToNewAddress(oldAddress, newAddress) {
        try {
            await this.clientsManager.getDefaultIpfs()._client.files.mv(`/${oldAddress}`, `/${newAddress}`); // Could throw
            const commentUpdates = await this.dbHandler.queryAllStoredCommentUpdates();
            for (const commentUpdate of commentUpdates) {
                const pathParts = commentUpdate.ipfsPath.split("/");
                pathParts[1] = newAddress;
                const newIpfsPath = pathParts.join("/");
                await this.dbHandler.upsertCommentUpdate({ ...commentUpdate, ipfsPath: newIpfsPath });
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
        const listedSubs = await this.plebbit.listSubplebbits();
        const dbIsOnOldName = !listedSubs.includes(internalState.address) && listedSubs.includes(this.signer.address);
        const currentDbAddress = dbIsOnOldName ? this.signer.address : this.address;
        if (internalState.address !== currentDbAddress) {
            // That means a call has been made to edit the sub's address while it's running
            // We need to stop the sub from running, change its file name, then establish a connection to the new DB
            log(`Running sub (${currentDbAddress}) has received a new address (${internalState.address}) to change to`);
            await this.dbHandler.unlockSubStart(currentDbAddress);
            await this.dbHandler.rollbackAllTransactions();
            await this._movePostUpdatesFolderToNewAddress(currentDbAddress, internalState.address);
            await this.dbHandler.destoryConnection();
            this.setAddress(internalState.address);
            await this.dbHandler.changeDbFilename(currentDbAddress, internalState.address);
            await this.dbHandler.initDestroyedConnection();
            await this.dbHandler.lockSubStart(internalState.address); // Lock the new address start
            this._subplebbitUpdateTrigger = true;
            await this._updateDbInternalState({ _subplebbitUpdateTrigger: this._subplebbitUpdateTrigger });
        }
    }
    async _updateCommentsThatNeedToBeUpdated() {
        const log = Logger(`plebbit-js:local-subplebbit:_updateCommentsThatNeedToBeUpdated`);
        const trx = await this.dbHandler.createTransaction("_updateCommentsThatNeedToBeUpdated");
        const commentsToUpdate = await this.dbHandler.queryCommentsToBeUpdated(trx);
        await this.dbHandler.commitTransaction("_updateCommentsThatNeedToBeUpdated");
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
        const latestCommentCid = await this.dbHandler.queryLatestCommentCid(); // latest comment ordered by id
        if (!latestCommentCid)
            return;
        try {
            await genToArray(this.clientsManager.getDefaultIpfs()._client.pin.ls({ paths: latestCommentCid.cid }));
            return; // the comment is already pinned, we assume the rest of the comments are so too
        }
        catch (e) {
            if (!e.message.includes("is not pinned"))
                throw e;
        }
        log("The latest comment is not pinned in the ipfs node, plebbit-js will repin all existing comment ipfs");
        // latestCommentCid should be the last in unpinnedCommentsFromDb array, in case we throw an error on a comment before it, it does not get pinned
        const unpinnedCommentsFromDb = await this.dbHandler.queryAllCommentsOrderedByIdAsc(); // we assume all comments are unpinned if latest comment is not pinned
        for (const unpinnedCommentRow of unpinnedCommentsFromDb) {
            const commentInstance = await this.plebbit.createComment(unpinnedCommentRow);
            const commentIpfsJson = commentInstance.toJSONIpfs();
            //@ts-expect-error
            if (unpinnedCommentRow.ipnsName)
                commentIpfsJson["ipnsName"] = unpinnedCommentRow.ipnsName; // Added for backward compatibility
            const commentIpfsContent = deterministicStringify(commentIpfsJson);
            const contentHash = await calculateIpfsHash(commentIpfsContent);
            if (contentHash !== unpinnedCommentRow.cid)
                throw Error("Unable to recreate the CommentIpfs. This is a critical error");
            await this.clientsManager.getDefaultIpfs()._client.add(commentIpfsContent, { pin: true });
        }
        await this.dbHandler.deleteAllCommentUpdateRows(); // delete CommentUpdate rows to force a new production of CommentUpdate
        log(`${unpinnedCommentsFromDb.length} comments' IPFS have been repinned`);
    }
    async _unpinStaleCids() {
        const log = Logger("plebbit-js:local-subplebbit:unpinStaleCids");
        this._cidsToUnPin = remeda.uniq(this._cidsToUnPin);
        if (this._cidsToUnPin.length > 0) {
            await Promise.all(this._cidsToUnPin.map(async (cid) => {
                try {
                    await this.clientsManager.getDefaultIpfs()._client.pin.rm(cid);
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
            await this.clientsManager.getDefaultIpfs()._client.files.stat(`/${this.address}`, { hash: true });
            return; // if the directory of this sub exists, we assume all the comment updates are there
        }
        catch (e) {
            if (!e.message.includes("file does not exist"))
                throw e;
        }
        // here we will go ahead to and rewrite all comment updates
        const storedCommentUpdates = await this.dbHandler.queryAllStoredCommentUpdates();
        if (storedCommentUpdates.length === 0)
            return;
        log(`CommentUpdate directory does not exist under MFS, will repin all comment updates (${storedCommentUpdates.length})`);
        for (const commentUpdate of storedCommentUpdates) {
            // means the comment update is not on the ipfs node, need to add it
            // We should calculate new ipfs path
            const commentInDb = await this.dbHandler.queryComment(commentUpdate.cid);
            if (!commentInDb)
                throw Error("Can't create a new CommentUpdate with comment not existing in db" + commentUpdate.cid);
            const newIpfsPath = await this._calculateIpfsPathForCommentUpdate(commentInDb, undefined);
            await this._writeCommentUpdateToIpfsFilePath(commentUpdate, newIpfsPath, undefined);
            await this.dbHandler.upsertCommentUpdate({ ...commentUpdate, ipfsPath: newIpfsPath });
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
        const commentUpdateOfPosts = await this.dbHandler.queryCommentUpdatesOfPostsForBucketAdjustment();
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
                await this.clientsManager.getDefaultIpfs()._client.files.mkdir(newTimestampBucketPath, { parents: true });
                await this.clientsManager.getDefaultIpfs()._client.files.mv(currentPostIpfsPathWithoutUpdate, newPostIpfsPathWithoutUpdate); // should move post and its children
                const commentUpdatesWithOutdatedIpfsPath = await this.dbHandler.queryCommentsUpdatesWithPostCid(post.cid);
                for (const commentUpdate of commentUpdatesWithOutdatedIpfsPath) {
                    const newIpfsPath = this._calculatePostUpdatePathForExistingCommentUpdate(newTimestampBucketOfPost, commentUpdate.ipfsPath);
                    await this.dbHandler.upsertCommentUpdate({ ...commentUpdate, ipfsPath: newIpfsPath });
                }
                this._subplebbitUpdateTrigger = true;
            }
        }
    }
    async syncIpnsWithDb() {
        const log = Logger("plebbit-js:local-subplebbit:sync");
        await this._switchDbWhileRunningIfNeeded();
        try {
            await this._mergeInstanceStateWithDbState({});
            await this._listenToIncomingRequests();
            await this._adjustPostUpdatesBucketsIfNeeded();
            this._setStartedState("publishing-ipns");
            this.clientsManager.updateIpfsState("publishing-ipns");
            await this._updateCommentsThatNeedToBeUpdated();
            await this.updateSubplebbitIpnsIfNeeded();
        }
        catch (e) {
            this._setStartedState("failed");
            this.clientsManager.updateIpfsState("stopped");
            log.error(`Failed to sync due to error,`, e);
        }
    }
    async _assertDomainResolvesCorrectly(domain) {
        if (isStringDomain(domain)) {
            await this.clientsManager.clearDomainCache(domain, "subplebbit-address");
            const resolvedAddress = await this.clientsManager.resolveSubplebbitAddressIfNeeded(domain);
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
        if (!this._isSubRunningLocally)
            return;
        const loop = async () => {
            this._publishLoopPromise = this.syncIpnsWithDb();
            await this._publishLoopPromise;
            await this._publishLoop(syncIntervalMs);
        };
        this._publishInterval = setTimeout(loop.bind(this), syncIntervalMs);
    }
    async _initBeforeStarting() {
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
        await this.dbHandler.initDestroyedConnection();
    }
    async edit(newSubplebbitOptions) {
        const log = Logger("plebbit-js:local-subplebbit:edit");
        // Right now if a sub owner passes settings.challenges = undefined or null, it will be explicitly changed to []
        // settings.challenges = [] means sub has no challenges
        if (remeda.isPlainObject(newSubplebbitOptions.settings) && "challenges" in newSubplebbitOptions.settings)
            newSubplebbitOptions.settings.challenges =
                newSubplebbitOptions.settings.challenges === undefined || newSubplebbitOptions.settings.challenges === null
                    ? []
                    : newSubplebbitOptions.settings.challenges;
        if ("roles" in newSubplebbitOptions && remeda.isPlainObject(newSubplebbitOptions.roles)) {
            // remove author addresses with undefined, null or empty object {}
            const newRoles = remeda.omitBy(newSubplebbitOptions.roles, (val, key) => val?.role === undefined || val?.role === null);
            newSubplebbitOptions.roles = remeda.isEmpty(newRoles) ? undefined : newRoles;
            log("New roles after edit", newSubplebbitOptions.roles);
        }
        const newProps = {
            ...newSubplebbitOptions,
            _subplebbitUpdateTrigger: true
        };
        if (Array.isArray(newProps?.settings?.challenges)) {
            newProps.challenges = newProps.settings.challenges.map(getSubplebbitChallengeFromSubplebbitChallengeSettings);
            newProps._usingDefaultChallenge = remeda.isDeepEqual(newProps?.settings?.challenges, this._defaultSubplebbitChallenges);
        }
        await this.dbHandler.initDestroyedConnection();
        if (newSubplebbitOptions.address && newSubplebbitOptions.address !== this.address) {
            if (doesDomainAddressHaveCapitalLetter(newSubplebbitOptions.address))
                throw new PlebbitError("ERR_DOMAIN_ADDRESS_HAS_CAPITAL_LETTER", { subplebbitAddress: newSubplebbitOptions.address });
            this._assertDomainResolvesCorrectly(newSubplebbitOptions.address).catch((err) => {
                log.error(err.toString());
                this.emit("error", err);
            });
            log(`Attempting to edit subplebbit.address from ${this.address} to ${newSubplebbitOptions.address}`);
            await this._updateDbInternalState(newProps);
            if (!(await this.dbHandler.isSubStartLocked())) {
                log("will rename the subplebbit db in edit() because the subplebbit is not being ran anywhere else");
                await this._movePostUpdatesFolderToNewAddress(this.address, newSubplebbitOptions.address);
                await this.dbHandler.destoryConnection();
                await this.dbHandler.changeDbFilename(this.address, newSubplebbitOptions.address);
                this.setAddress(newSubplebbitOptions.address);
            }
        }
        else {
            await this._updateDbInternalState(newProps);
        }
        const latestState = await this._getDbInternalState(true);
        await this.initInternalSubplebbitNoMerge(latestState);
        log(`Subplebbit (${this.address}) props (${remeda.keys.strict(newProps)}) has been edited: `, remeda.pick(latestState, remeda.keys.strict(newProps)));
        if (!this._isSubRunningLocally)
            await this.dbHandler.destoryConnection(); // Need to destory connection so process wouldn't hang
        return this;
    }
    async start() {
        const log = Logger("plebbit-js:local-subplebbit:start");
        await this._initBeforeStarting();
        // update started value twice because it could be started prior lockSubStart
        await this._updateStartedValue();
        await this.dbHandler.lockSubStart(); // Will throw if sub is locked already
        await this._updateStartedValue();
        this._setState("started");
        this._setStartedState("publishing-ipns");
        this._isSubRunningLocally = true;
        await this.dbHandler.initDbIfNeeded();
        await this.dbHandler.initDestroyedConnection();
        await this._setChallengesToDefaultIfNotDefined(log);
        // Import subplebbit keys onto ipfs node
        await this._importSubplebbitSignerIntoIpfsIfNeeded();
        this._subplebbitUpdateTrigger = true;
        await this._updateDbInternalState({ _subplebbitUpdateTrigger: this._subplebbitUpdateTrigger });
        await this._repinCommentsIPFSIfNeeded();
        await this._repinCommentUpdateIfNeeded();
        await this._listenToIncomingRequests();
        this.syncIpnsWithDb()
            .then(() => this._publishLoop(this.plebbit.publishInterval))
            .catch((reason) => {
            log.error(reason);
            this.emit("error", reason);
        });
    }
    async _updateOnce() {
        const log = Logger("plebbit-js:local-subplebbit:update");
        const subState = await this._getDbInternalState(false);
        await this._updateStartedValue();
        if (deterministicStringify(this.toJSONInternal()) !== deterministicStringify(subState)) {
            log(`Local Subplebbit received a new update. Will emit an update event`);
            this._setUpdatingState("succeeded");
            await this.initInternalSubplebbitNoMerge(subState);
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
                    .finally(() => setTimeout(updateLoop, this.plebbit.updateInterval));
        }).bind(this);
        this._setState("updating");
        this._updateOnce()
            .catch((e) => log.error(`Failed to update subplebbit`, e))
            .finally(() => (this._updateTimeout = setTimeout(updateLoop, this.plebbit.updateInterval)));
    }
    async stop() {
        const log = Logger("plebbit-js:local-subplebbit:stop");
        if (this.state === "started") {
            this._isSubRunningLocally = false;
            if (this._publishLoopPromise)
                await this._publishLoopPromise; // should be in try/catch
            await this.clientsManager.pubsubUnsubscribe(this.pubsubTopicWithfallback(), this.handleChallengeExchange);
            this._setStartedState("stopped");
            await this.dbHandler.rollbackAllTransactions();
            await this.dbHandler.unlockSubState();
            await this.dbHandler.unlockSubStart();
            await this._updateStartedValue();
            clearInterval(this._publishInterval);
            this.clientsManager.updateIpfsState("stopped");
            this.clientsManager.updatePubsubState("stopped", undefined);
            await this.dbHandler.destoryConnection();
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
    }
    async delete() {
        if (this.state === "updating" || this.state === "started")
            await this.stop();
        const ipfsClient = this.clientsManager.getDefaultIpfs();
        if (!ipfsClient)
            throw Error("Ipfs client is not defined");
        await moveSubplebbitDbToDeletedDirectory(this.address, this.plebbit);
        if (typeof this.signer?.ipnsKeyName === "string")
            // Key may not exist on ipfs node
            try {
                await ipfsClient._client.key.rm(this.signer.ipnsKeyName);
            }
            catch { }
    }
}
//# sourceMappingURL=local-subplebbit.js.map