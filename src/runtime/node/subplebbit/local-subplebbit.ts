import Logger from "@plebbit/plebbit-logger";
import { Plebbit } from "../../../plebbit.js";
import {
    Challenge,
    CreateSubplebbitOptions,
    InternalSubplebbitType,
    SubplebbitEditOptions,
    SubplebbitIpfsType,
    SubplebbitRole,
    SubplebbitSettings
} from "../../../subplebbit/types.js";
import { LRUCache } from "lru-cache";
import { SortHandler } from "./sort-handler.js";
import { DbHandler } from "./db-handler.js";
import Hash from "ipfs-only-hash";

import {
    doesDomainAddressHaveCapitalLetter,
    genToArray,
    isLinkOfMedia,
    isLinkValid,
    removeKeysWithUndefinedValues,
    removeNullAndUndefinedValuesRecursively,
    throwWithErrorCode,
    timestamp
} from "../../../util.js";
import lodash from "lodash";
import { STORAGE_KEYS } from "../../../constants.js";
import { stringify as deterministicStringify } from "safe-stable-stringify";
import { PlebbitError } from "../../../plebbit-error.js";
import type {
    AuthorCommentEditOptions,
    ChallengeAnswerMessageType,
    ChallengeMessageType,
    ChallengeRequestCommentEditWithSubplebbitAuthor,
    ChallengeRequestCommentWithSubplebbitAuthor,
    ChallengeRequestMessageType,
    ChallengeRequestVoteWithSubplebbitAuthor,
    ChallengeVerificationMessageType,
    CommentEditPubsubMessage,
    CommentIpfsWithCid,
    CommentType,
    CommentUpdate,
    CommentUpdatesRow,
    CommentsTableRow,
    DecryptedChallenge,
    DecryptedChallengeAnswer,
    DecryptedChallengeAnswerMessageType,
    DecryptedChallengeRequest,
    DecryptedChallengeRequestMessageType,
    DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor,
    IpfsHttpClientPubsubMessage,
    ModeratorCommentEditOptions,
    VotePubsubMessage,
    DecryptedChallengeVerificationMessageTypeWithSubplebbitAuthor,
    VoteType,
    CommentPubsubMessage
} from "../../../types.js";
import {
    ValidationResult,
    signChallengeMessage,
    signChallengeVerification,
    signCommentUpdate,
    signSubplebbit,
    verifyChallengeAnswer,
    verifyChallengeRequest,
    verifyCommentEdit,
    verifyCommentUpdate
} from "../../../signer/signatures.js";
import { ChallengeAnswerMessage, ChallengeMessage, ChallengeRequestMessage, ChallengeVerificationMessage } from "../../../challenge.js";
import { getThumbnailUrlOfLink, importSignerIntoIpfsNode, moveSubplebbitDbToDeletedDirectory } from "../util.js";
import { getErrorCodeFromMessage } from "../../../util.js";
import { Signer, decryptEd25519AesGcmPublicKeyBuffer, verifyComment, verifySubplebbit, verifyVote } from "../../../signer/index.js";
import { encryptEd25519AesGcmPublicKeyBuffer } from "../../../signer/encryption.js";
import { messages } from "../../../errors.js";
import Author from "../../../author.js";
import { AUTHOR_EDIT_FIELDS, MOD_EDIT_FIELDS } from "../../../signer/constants.js";
import {
    GetChallengeAnswers,
    getChallengeVerification,
    getSubplebbitChallengeFromSubplebbitChallengeSettings
} from "./challenges/index.js";
import * as cborg from "cborg";
import assert from "assert";
import env from "../../../version.js";
import { sha256 } from "js-sha256";
import {
    getIpfsKeyFromPrivateKey,
    getPlebbitAddressFromPrivateKey,
    getPlebbitAddressFromPublicKey,
    getPublicKeyFromPrivateKey
} from "../../../signer/util.js";
import { RpcLocalSubplebbit } from "../../../subplebbit/rpc-local-subplebbit.js";

// This is a sub we have locally in our plebbit datapath, in a NodeJS environment
export class LocalSubplebbit extends RpcLocalSubplebbit {
    signer: Signer;
    private _postUpdatesBuckets = [86400, 604800, 2592000, 3153600000]; // 1 day, 1 week, 1 month, 100 years. Expecting to be sorted from smallest to largest

    private _defaultSubplebbitChallenges: SubplebbitSettings["challenges"] = [
        {
            name: "captcha-canvas-v3",
            exclude: [{ role: ["moderator", "admin", "owner"], post: false, reply: false, vote: false }]
        }
    ];

    // These caches below will be used to facilitate challenges exchange with authors, they will expire after 10 minutes
    // Most of the time they will be delete and cleaned up automatically
    private _challengeAnswerPromises: LRUCache<string, Promise<string[]>>;
    private _challengeAnswerResolveReject: LRUCache<string, { resolve: (answers: string[]) => void; reject: (error: Error) => void }>;
    private _ongoingChallengeExchanges: LRUCache<string, boolean>;

    private _cidsToUnPin: string[];
    private _subplebbitUpdateTrigger: boolean;

    private _sortHandler: SortHandler;
    public dbHandler: DbHandler;
    protected _usingDefaultChallenge: boolean;
    private _isSubRunningLocally: boolean;
    private _publishLoopPromise: Promise<void>;
    private _publishInterval?: NodeJS.Timeout;

    constructor(plebbit: Plebbit) {
        super(plebbit);
        this.handleChallengeExchange = this.handleChallengeExchange.bind(this);
        this.started = false;
        this._isSubRunningLocally = false;
    }

    toJSONInternal(): InternalSubplebbitType {
        return {
            ...lodash.omit(this.toJSONInternalRpc(), ["started"]),
            signer: this.signer ? lodash.pick(this.signer, ["privateKey", "type", "address"]) : undefined,
            _subplebbitUpdateTrigger: this._subplebbitUpdateTrigger
        };
    }

    private async _updateStartedValue() {
        this.started = await this.dbHandler.isSubStartLocked(this.address); // should be false now
    }

    async initInternalSubplebbit(newProps: Partial<InternalSubplebbitType | CreateSubplebbitOptions>) {
        const mergedProps = { ...this.toJSONInternal(), ...newProps };
        await this.initRpcInternalSubplebbit(newProps);
        if (newProps.signer && newProps.signer.privateKey !== this.signer?.privateKey) await this._initSignerProps(newProps.signer);
        this._subplebbitUpdateTrigger = mergedProps._subplebbitUpdateTrigger;
    }

    private async initDbHandlerIfNeeded() {
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
        if (!this.signer) throwWithErrorCode("ERR_LOCAL_SUB_HAS_NO_SIGNER_IN_INTERNAL_STATE", { address: this.address });
        await this._updateStartedValue();

        await this.dbHandler.destoryConnection(); // Need to destory connection so process wouldn't hang
    }
    private async _importSubplebbitSignerIntoIpfsIfNeeded() {
        if (!this.signer) throw Error("subplebbit.signer is not defined");

        const ipfsNodeKeys = await this.clientsManager.getDefaultIpfs()._client.key.list();
        if (!ipfsNodeKeys.find((key) => key.name === this.signer.ipnsKeyName))
            await importSignerIntoIpfsNode(this.signer.ipnsKeyName, this.signer.ipfsKey, {
                url: <string>this.plebbit.ipfsHttpClientsOptions[0].url,
                headers: this.plebbit.ipfsHttpClientsOptions[0].headers
            });
    }

    private async _updateDbInternalState(props: Partial<InternalSubplebbitType>) {
        if (Object.keys(props).length === 0) return;
        await this.dbHandler.lockSubState();
        const internalStateBefore: InternalSubplebbitType = await this.dbHandler.keyvGet(STORAGE_KEYS[STORAGE_KEYS.INTERNAL_SUBPLEBBIT]);
        await this.dbHandler.keyvSet(STORAGE_KEYS[STORAGE_KEYS.INTERNAL_SUBPLEBBIT], {
            ...internalStateBefore,
            ...props
        });
        await this.dbHandler.unlockSubState();
    }

    private async _getDbInternalState(lock = true) {
        if (lock) await this.dbHandler.lockSubState();
        const internalState: InternalSubplebbitType = await this.dbHandler.keyvGet(STORAGE_KEYS[STORAGE_KEYS.INTERNAL_SUBPLEBBIT]);
        if (lock) await this.dbHandler.unlockSubState();
        return internalState;
    }

    private async _mergeInstanceStateWithDbState(overrideProps: Partial<InternalSubplebbitType>) {
        const currentDbState = lodash.omit(await this._getDbInternalState(), "address");
        await this.initInternalSubplebbit({ ...currentDbState, ...overrideProps }); // Not sure about this line
    }

    async _setChallengesToDefaultIfNotDefined(log: Logger) {
        if (
            this._usingDefaultChallenge !== false &&
            (!this.settings?.challenges || lodash.isEqual(this.settings?.challenges, this._defaultSubplebbitChallenges))
        )
            this._usingDefaultChallenge = true;
        if (this._usingDefaultChallenge && !lodash.isEqual(this.settings?.challenges, this._defaultSubplebbitChallenges)) {
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

        if (!this.pubsubTopic) this.pubsubTopic = lodash.clone(this.signer.address);
        if (typeof this.createdAt !== "number") this.createdAt = timestamp();

        await this._updateDbInternalState(this.toJSONInternal());

        await this._setChallengesToDefaultIfNotDefined(log);
        await this._updateStartedValue();

        await this.dbHandler.destoryConnection(); // Need to destory connection so process wouldn't hang
    }

    private async _calculateNewPostUpdates(): Promise<SubplebbitIpfsType["postUpdates"]> {
        const postUpdates = {};
        for (const timeBucket of this._postUpdatesBuckets) {
            try {
                const statRes = await this.clientsManager.getDefaultIpfs()._client.files.stat(`/${this.address}/postUpdates/${timeBucket}`);
                if (statRes.blocks !== 0) postUpdates[String(timeBucket)] = String(statRes.cid);
            } catch {}
        }
        if (Object.keys(postUpdates).length === 0) return undefined;
        return postUpdates;
    }

    private async updateSubplebbitIpnsIfNeeded() {
        const log = Logger("plebbit-js:local-subplebbit:sync");

        const lastPublishTooOld = this.updatedAt < timestamp() - 60 * 15; // Publish a subplebbit record every 15 minutes at least
        const dbInstance = await this._getDbInternalState(true);
        this._subplebbitUpdateTrigger = this._subplebbitUpdateTrigger || dbInstance._subplebbitUpdateTrigger || lastPublishTooOld;

        if (!this._subplebbitUpdateTrigger) return; // No reason to update

        const trx: any = await this.dbHandler.createTransaction("subplebbit");
        const latestPost = await this.dbHandler.queryLatestPostCid(trx);
        const latestComment = await this.dbHandler.queryLatestCommentCid(trx);
        await this.dbHandler.commitTransaction("subplebbit");

        const [stats, subplebbitPosts] = await Promise.all([
            this.dbHandler.querySubplebbitStats(undefined),
            this._sortHandler.generateSubplebbitPosts()
        ]);

        if (subplebbitPosts && this.posts?.pageCids) {
            const newPageCids = lodash.uniq(Object.values(subplebbitPosts.pageCids));
            const pageCidsToUnPin = lodash.uniq(
                Object.values(this.posts.pageCids).filter((oldPageCid) => !newPageCids.includes(oldPageCid))
            );

            this._cidsToUnPin.push(...pageCidsToUnPin);
        }

        const newPostUpdates = await this._calculateNewPostUpdates();

        const statsCid = (await this.clientsManager.getDefaultIpfs()._client.add(deterministicStringify(stats))).path;
        if (this.statsCid && statsCid !== this.statsCid) this._cidsToUnPin.push(this.statsCid);

        await this._mergeInstanceStateWithDbState({});

        const updatedAt = timestamp() === this.updatedAt ? timestamp() + 1 : timestamp();
        const newIpns: Omit<SubplebbitIpfsType, "signature"> = {
            ...lodash.omit(this._toJSONBase(), "signature"),
            lastPostCid: latestPost?.cid,
            lastCommentCid: latestComment?.cid,
            statsCid,
            updatedAt,
            posts: subplebbitPosts ? { pageCids: subplebbitPosts.pageCids, pages: lodash.pick(subplebbitPosts.pages, "hot") } : undefined,
            postUpdates: newPostUpdates
        };
        const signature = await signSubplebbit(newIpns, this.signer);
        await this._validateSubSignatureBeforePublishing({ ...newIpns, signature }); // this commented line should be taken out later
        await this.initRemoteSubplebbitProps({ ...newIpns, signature });
        this._subplebbitUpdateTrigger = false;

        const newSubplebbitRecord: SubplebbitIpfsType = { ...newIpns, signature };
        await this._updateDbInternalState(lodash.omit(this.toJSONInternal(), "address"));

        await this._unpinStaleCids();
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
        log(
            `Published a new IPNS record for sub(${this.address}) on IPNS (${publishRes.name}) that points to file (${publishRes.value}) with updatedAt (${this.updatedAt})`
        );
        this._setStartedState("succeeded");
        this.clientsManager.updateIpfsState("stopped");
        this.emit("update", this);
    }

    private shouldResolveDomainForVerification() {
        return this.address.includes(".") && Math.random() < 0.05; // Resolving domain should be a rare process because default rpcs throttle if we resolve too much
    }

    private async _validateSubSignatureBeforePublishing(recordTobePublished: SubplebbitIpfsType) {
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
                const resolvedSubAddress = await this.clientsManager.resolveSubplebbitAddressIfNeeded(this.address);
                if (resolvedSubAddress !== this.signer.address)
                    log.error(
                        `The domain address (${this.address}) subplebbit-address text record to resolves to ${resolvedSubAddress} when it should resolve to ${this.signer.address}`
                    );
            } catch (e) {
                log.error(`Failed to resolve sub domain ${this.address}`);
            }
        }
    }

    private async storeCommentEdit(
        commentEditRaw: CommentEditPubsubMessage,
        challengeRequestId: ChallengeRequestMessage["challengeRequestId"]
    ): Promise<undefined> {
        const log = Logger("plebbit-js:local-subplebbit:handleCommentEdit");
        const commentEdit = await this.plebbit.createCommentEdit(commentEditRaw);
        const commentToBeEdited = await this.dbHandler.queryComment(commentEdit.commentCid, undefined); // We assume commentToBeEdited to be defined because we already tested for its existence above
        const editSignedByOriginalAuthor = commentEditRaw.signature.publicKey === commentToBeEdited.signature.publicKey;

        const isAuthorEdit = this._isAuthorEdit(commentEditRaw, editSignedByOriginalAuthor);
        const authorSignerAddress = await getPlebbitAddressFromPublicKey(commentEdit.signature.publicKey);
        await this.dbHandler.insertEdit(commentEdit.toJSONForDb(isAuthorEdit, authorSignerAddress));
        log.trace(`(${challengeRequestId}): `, `Updated comment (${commentEdit.commentCid}) with CommentEdit: `, commentEditRaw);
    }

    private async storeVote(newVoteProps: VoteType, challengeRequestId: ChallengeRequestMessage["challengeRequestId"]) {
        const log = Logger("plebbit-js:local-subplebbit:handleVote");
        const newVote = await this.plebbit.createVote(newVoteProps);
        const authorSignerAddress = await getPlebbitAddressFromPublicKey(newVote.signature.publicKey);
        await this.dbHandler.deleteVote(authorSignerAddress, newVote.commentCid);
        await this.dbHandler.insertVote(newVote.toJSONForDb(authorSignerAddress));
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
        const log = Logger("plebbit-js:local-subplebbit:handleChallengeExchange:storePublicationIfValid");

        const publication = request.publication;
        const publicationHash = sha256(deterministicStringify(publication));
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
            const authorSignerAddress = await getPlebbitAddressFromPublicKey(commentToInsert.signature.publicKey);

            if (this.isPublicationPost(commentToInsert)) {
                // Post
                const trx = await this.dbHandler.createTransaction(request.challengeRequestId.toString());
                commentToInsert.setPreviousCid((await this.dbHandler.queryLatestPostCid(trx))?.cid);
                await this.dbHandler.commitTransaction(request.challengeRequestId.toString());
                commentToInsert.setDepth(0);
                const file = await this.clientsManager.getDefaultIpfs()._client.add(deterministicStringify(commentToInsert.toJSONIpfs()));
                commentToInsert.setPostCid(file.path);
                commentToInsert.setCid(file.path);
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
                const file = await this.clientsManager.getDefaultIpfs()._client.add(deterministicStringify(commentToInsert.toJSONIpfs()));
                commentToInsert.setCid(file.path);
            }

            const trxForInsert = await this.dbHandler.createTransaction(request.challengeRequestId.toString());
            try {
                await this.dbHandler.insertComment(
                    commentToInsert.toJSONCommentsTableRowInsert(publicationHash, authorSignerAddress),
                    trxForInsert
                );
                const commentInDb = await this.dbHandler.queryComment(commentToInsert.cid, trxForInsert);
                const validity = await verifyComment(commentInDb, this.plebbit.resolveAuthorAddresses, this.clientsManager, false);
                if (!validity.valid)
                    throw Error(
                        "There is a problem with how query rows are processed in DB, which is causing an invalid signature. This is a critical Error"
                    );
            } catch (e) {
                log.error(`Failed to insert post to db due to error, rolling back on inserting the comment`, e);
                await this.dbHandler.rollbackTransaction(request.challengeRequestId.toString());
                throw e;
            }

            await this.dbHandler.commitTransaction(request.challengeRequestId.toString());

            log(
                `(${request.challengeRequestId.toString()}): `,
                `New comment with cid ${commentToInsert.cid}  and depth (${commentToInsert.depth}) has been inserted into DB`
            );

            return commentToInsert.toJSONAfterChallengeVerification();
        }
    }

    private async _decryptOrRespondWithFailure(
        request: ChallengeRequestMessage | ChallengeAnswerMessage
    ): Promise<DecryptedChallengeRequestMessageType | DecryptedChallengeAnswerMessageType | undefined> {
        const log = Logger("plebbit-js:local-subplebbit:_decryptOrRespondWithFailure");
        let decrypted: DecryptedChallengeAnswer | DecryptedChallengeRequest;
        try {
            decrypted = JSON.parse(
                await decryptEd25519AesGcmPublicKeyBuffer(request.encrypted, this.signer.privateKey, request.signature.publicKey)
            );
            if (request.type === "CHALLENGEREQUEST") return { ...request, ...(<DecryptedChallengeRequest>decrypted) };
            else if (request.type === "CHALLENGEANSWER") return { ...request, ...(<DecryptedChallengeAnswerMessageType>decrypted) };
        } catch (e) {
            log.error(`Failed to decrypt request (${request?.challengeRequestId?.toString()}) due to error`, e);
            if (request?.challengeRequestId?.toString())
                await this._publishFailedChallengeVerification(
                    { reason: messages.ERR_SUB_FAILED_TO_DECRYPT_PUBSUB_MSG },
                    request.challengeRequestId
                );

            throw e;
        }
    }

    private async _respondWithErrorIfSignatureOfPublicationIsInvalid(request: DecryptedChallengeRequestMessageType): Promise<void> {
        let validity: ValidationResult;
        if (this.isPublicationComment(request.publication))
            validity = await verifyComment(
                <CommentPubsubMessage>request.publication,
                this.plebbit.resolveAuthorAddresses,
                this.clientsManager,
                false
            );
        else if (this.isPublicationCommentEdit(request.publication))
            validity = await verifyCommentEdit(
                <CommentEditPubsubMessage>request.publication,
                this.plebbit.resolveAuthorAddresses,
                this.clientsManager,
                false
            );
        else if (this.isPublicationVote(request.publication))
            validity = await verifyVote(
                <VotePubsubMessage>request.publication,
                this.plebbit.resolveAuthorAddresses,
                this.clientsManager,
                false
            );

        if (!validity.valid) {
            await this._publishFailedChallengeVerification({ reason: validity.reason }, request.challengeRequestId);
            throwWithErrorCode(getErrorCodeFromMessage(validity.reason), { publication: request.publication, validity });
        }
    }

    private async _publishChallenges(
        challenges: Omit<Challenge, "verify">[],
        request: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor
    ) {
        const log = Logger("plebbit-js:local-subplebbit:_publishChallenges");
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

        this.clientsManager.updatePubsubState("publishing-challenge", undefined);

        await this.clientsManager.pubsubPublish(this.pubsubTopicWithfallback(), challengeMessage);
        log.trace(
            `Published ${challengeMessage.type} over pubsub: `,
            removeNullAndUndefinedValuesRecursively(lodash.omit(toSignChallenge, ["encrypted"]))
        );
        this.clientsManager.updatePubsubState("waiting-challenge-answers", undefined);
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
        const log = Logger("plebbit-js:local-subplebbit:_publishFailedChallengeVerification");

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

    private async _publishChallengeVerification(
        challengeResult: Pick<ChallengeVerificationMessageType, "challengeErrors" | "challengeSuccess" | "reason">,
        request: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor
    ) {
        const log = Logger("plebbit-js:local-subplebbit:_publishChallengeVerification");
        if (!challengeResult.challengeSuccess) return this._publishFailedChallengeVerification(challengeResult, request.challengeRequestId);
        else {
            // Challenge has passed, we store the publication (except if there's an issue with the publication)
            log.trace(
                `(${request.challengeRequestId.toString()}): `,
                `Will attempt to publish challengeVerification with challengeSuccess=true`
            );
            //@ts-expect-error
            const publication: DecryptedChallengeVerificationMessageTypeWithSubplebbitAuthor["publication"] | undefined =
                await this.storePublication(request);

            if (lodash.isPlainObject(publication)) {
                const authorSignerAddress = await getPlebbitAddressFromPublicKey(publication.signature.publicKey);
                publication.author.subplebbit = await this.dbHandler.querySubplebbitAuthor(authorSignerAddress);
            }
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

            this.clientsManager.updatePubsubState("publishing-challenge-verification", undefined);

            await this.clientsManager.pubsubPublish(this.pubsubTopicWithfallback(), challengeVerification);

            this.clientsManager.updatePubsubState("waiting-challenge-requests", undefined);

            const objectToEmit = { ...challengeVerification, publication };
            this.emit("challengeverification", objectToEmit);
            this._ongoingChallengeExchanges.delete(request.challengeRequestId.toString());
            this._cleanUpChallengeAnswerPromise(request.challengeRequestId.toString());
            log(
                `Published ${challengeVerification.type} over pubsub:`,
                removeNullAndUndefinedValuesRecursively(lodash.omit(objectToEmit, ["encrypted", "signature"]))
            );
        }
    }

    private _commentEditIncludesUniqueModFields(request: CommentEditPubsubMessage) {
        const modOnlyFields: (keyof ModeratorCommentEditOptions)[] = ["pinned", "locked", "removed", "commentAuthor"];
        return lodash.intersection(modOnlyFields, Object.keys(request)).length > 0;
    }

    private _commentEditIncludesUniqueAuthorFields(request: CommentEditPubsubMessage) {
        const modOnlyFields: (keyof AuthorCommentEditOptions)[] = ["content", "deleted"];
        return lodash.intersection(modOnlyFields, Object.keys(request)).length > 0;
    }

    _isAuthorEdit(request: CommentEditPubsubMessage, editHasBeenSignedByOriginalAuthor: boolean) {
        if (this._commentEditIncludesUniqueAuthorFields(request)) return true;
        if (this._commentEditIncludesUniqueModFields(request)) return false;
        // The request has fields that are used in both mod and author, namely [spoiler, flair]
        if (editHasBeenSignedByOriginalAuthor) return true;
        return false;
    }

    private async _checkPublicationValidity(
        request: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor
    ): Promise<messages | undefined> {
        const log = Logger("plebbit-js:local-subplebbit:handleChallengeRequest:checkPublicationValidity");

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
            const publicationComment = <ChallengeRequestCommentWithSubplebbitAuthor>publication;
            const forbiddenCommentFields: (keyof CommentType | "deleted")[] = [
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

            if (Object.keys(publicationComment).some((key: keyof CommentType) => forbiddenCommentFields.includes(key)))
                return messages.ERR_FORBIDDEN_COMMENT_FIELD;

            if (!publicationComment.content && !publicationComment.link && !publicationComment.title)
                return messages.ERR_COMMENT_HAS_NO_CONTENT_LINK_TITLE;

            if (this.isPublicationPost(publication)) {
                if (this.features?.requirePostLink && !isLinkValid(publicationComment.link))
                    return messages.ERR_POST_HAS_INVALID_LINK_FIELD;
                if (this.features?.requirePostLinkIsMedia && !isLinkOfMedia(publicationComment.link))
                    return messages.ERR_POST_LINK_IS_NOT_OF_MEDIA;
            }

            const publicationHash = sha256(deterministicStringify(publication));
            const publicationInDb = await this.dbHandler.queryCommentByRequestPublicationHash(publicationHash);
            if (publicationInDb) return messages.ERR_DUPLICATE_COMMENT;

            if (lodash.isString(publicationComment.link) && publicationComment.link.length > 2000)
                return messages.COMMENT_LINK_LENGTH_IS_OVER_LIMIT;
        }

        if (this.isPublicationVote(request.publication)) {
            const publicationVote = <ChallengeRequestVoteWithSubplebbitAuthor>publication;
            if (![1, 0, -1].includes(publicationVote.vote)) return messages.INCORRECT_VOTE_VALUE;
            const authorSignerAddress = await getPlebbitAddressFromPublicKey(publicationVote.signature.publicKey);
            const lastVote = await this.dbHandler.getStoredVoteOfAuthor(publicationVote.commentCid, authorSignerAddress);
            if (lastVote && publicationVote.signature.publicKey !== lastVote.signature.publicKey)
                return messages.UNAUTHORIZED_AUTHOR_ATTEMPTED_TO_CHANGE_VOTE;
        }

        if (this.isPublicationCommentEdit(request.publication)) {
            const editPublication = <ChallengeRequestCommentEditWithSubplebbitAuthor>publication;

            const commentToBeEdited = await this.dbHandler.queryComment(editPublication.commentCid, undefined); // We assume commentToBeEdited to be defined because we already tested for its existence above
            const editSignedByOriginalAuthor = editPublication.signature.publicKey === commentToBeEdited.signature.publicKey;
            const modRoles: SubplebbitRole["role"][] = ["moderator", "owner", "admin"];
            const isEditorMod =
                this.roles?.[editPublication.author.address] && modRoles.includes(this.roles[editPublication.author.address]?.role);

            const editHasUniqueModFields = this._commentEditIncludesUniqueModFields(editPublication);
            const isAuthorEdit = this._isAuthorEdit(editPublication, editSignedByOriginalAuthor);

            if (isAuthorEdit && editHasUniqueModFields) return messages.ERR_PUBLISHING_EDIT_WITH_BOTH_MOD_AND_AUTHOR_FIELDS;

            const allowedEditFields =
                isAuthorEdit && editSignedByOriginalAuthor ? AUTHOR_EDIT_FIELDS : isEditorMod ? MOD_EDIT_FIELDS : undefined;
            if (!allowedEditFields) return messages.ERR_UNAUTHORIZED_COMMENT_EDIT;
            for (const editField of Object.keys(removeKeysWithUndefinedValues(editPublication)))
                if (!allowedEditFields.includes(<any>editField)) {
                    log(
                        `The comment edit includes a field (${editField}) that is not part of the allowed fields (${allowedEditFields})`,
                        `isAuthorEdit:${isAuthorEdit}`,
                        `editHasUniqueModFields:${editHasUniqueModFields}`,
                        `isEditorMod:${isEditorMod}`,
                        `editSignedByOriginalAuthor:${editSignedByOriginalAuthor}`
                    );
                    return messages.ERR_SUB_COMMENT_EDIT_UNAUTHORIZED_FIELD;
                }

            if (isEditorMod && typeof editPublication.locked === "boolean" && commentToBeEdited.depth !== 0)
                return messages.ERR_SUB_COMMENT_EDIT_CAN_NOT_LOCK_REPLY;
        }

        return undefined;
    }

    private async handleChallengeRequest(request: ChallengeRequestMessage) {
        const log = Logger("plebbit-js:local-subplebbit:handleChallengeRequest");

        if (this._ongoingChallengeExchanges.has(request.challengeRequestId.toString())) return; // This is a duplicate challenge request
        this._ongoingChallengeExchanges.set(request.challengeRequestId.toString(), true);
        const requestSignatureValidation = await verifyChallengeRequest(request, true);
        if (!requestSignatureValidation.valid)
            throwWithErrorCode(getErrorCodeFromMessage(requestSignatureValidation.reason), {
                challengeRequest: lodash.omit(request, ["encrypted"])
            });

        const decryptedRequest = <DecryptedChallengeRequestMessageType>await this._decryptOrRespondWithFailure(request);
        if (typeof decryptedRequest?.publication?.author?.address !== "string")
            return this._publishFailedChallengeVerification(
                { reason: messages.ERR_AUTHOR_ADDRESS_UNDEFINED },
                decryptedRequest.challengeRequestId
            );
        if (decryptedRequest?.publication?.author?.["subplebbit"])
            return this._publishFailedChallengeVerification(
                { reason: messages.ERR_FORBIDDEN_AUTHOR_FIELD },
                decryptedRequest.challengeRequestId
            );

        const authorSignerAddress = await getPlebbitAddressFromPublicKey(decryptedRequest.publication.signature.publicKey);
        //@ts-expect-error
        const decryptedRequestWithSubplebbitAuthor: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor = decryptedRequest;

        try {
            await this._respondWithErrorIfSignatureOfPublicationIsInvalid(decryptedRequest); // This function will throw an error if signature is invalid
        } catch (e) {
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
        const getChallengeAnswers: GetChallengeAnswers = async (challenges) => {
            // ...get challenge answers from user. e.g.:
            // step 1. subplebbit publishes challenge pubsub message with `challenges` provided in argument of `getChallengeAnswers`
            // step 2. subplebbit waits for challenge answer pubsub message with `challengeAnswers` and then returns `challengeAnswers`
            await this._publishChallenges(challenges, decryptedRequestWithSubplebbitAuthor);
            const challengeAnswerPromise = new Promise<string[]>((resolve, reject) =>
                this._challengeAnswerResolveReject.set(answerPromiseKey, { resolve, reject })
            );
            this._challengeAnswerPromises.set(answerPromiseKey, challengeAnswerPromise);
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
        const log = Logger("plebbit-js:local-subplebbit:handleChallengeAnswer");

        const answerSignatureValidation = await verifyChallengeAnswer(challengeAnswer, true);

        if (!answerSignatureValidation.valid) {
            this._cleanUpChallengeAnswerPromise(challengeAnswer.challengeRequestId.toString());
            this._ongoingChallengeExchanges.delete(challengeAnswer.challengeRequestId.toString());
            throwWithErrorCode(getErrorCodeFromMessage(answerSignatureValidation.reason), { challengeAnswer });
        }

        const decryptedChallengeAnswer = <DecryptedChallengeAnswerMessageType>await this._decryptOrRespondWithFailure(challengeAnswer);

        this.emit("challengeanswer", decryptedChallengeAnswer);

        this._challengeAnswerResolveReject
            .get(challengeAnswer.challengeRequestId.toString())
            .resolve(decryptedChallengeAnswer.challengeAnswers);
    }

    private async handleChallengeExchange(pubsubMsg: IpfsHttpClientPubsubMessage) {
        const log = Logger("plebbit-js:local-subplebbit:handleChallengeExchange");

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

    private _calculatePostUpdatePathForExistingCommentUpdate(timestampRange: number, currentIpfsPath: string) {
        const pathParts = currentIpfsPath.split("/");
        return ["/" + this.address, "postUpdates", timestampRange, ...pathParts.slice(4)].join("/");
    }

    private async _calculateIpfsPathForCommentUpdate(dbComment: CommentsTableRow, storedCommentUpdate?: CommentUpdatesRow) {
        const postTimestamp =
            dbComment.depth === 0 ? dbComment.timestamp : (await this.dbHandler.queryComment(dbComment.postCid)).timestamp;
        const timestampRange = this._postUpdatesBuckets.find((bucket) => timestamp() - bucket <= postTimestamp);
        if (storedCommentUpdate?.ipfsPath)
            return this._calculatePostUpdatePathForExistingCommentUpdate(timestampRange, storedCommentUpdate.ipfsPath);
        else {
            const parentsCids = (await this.dbHandler.queryParents(dbComment)).map((parent) => parent.cid).reverse();
            return ["/" + this.address, "postUpdates", timestampRange, ...parentsCids, dbComment.cid, "update"].join("/");
        }
    }

    private async _writeCommentUpdateToIpfsFilePath(newCommentUpdate: CommentUpdate, ipfsPath: string, oldIpfsPath?: string) {
        // TODO need to exclude reply.replies here
        await this.clientsManager
            .getDefaultIpfs()
            ._client.files.write(ipfsPath, deterministicStringify(newCommentUpdate), { parents: true, truncate: true, create: true });
        if (oldIpfsPath && oldIpfsPath !== ipfsPath) await this.clientsManager.getDefaultIpfs()._client.files.rm(oldIpfsPath);
    }

    private async _updateComment(comment: CommentsTableRow): Promise<void> {
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
        if (calculatedCommentUpdate.replyCount > 0) assert(generatedPages);

        if (storedCommentUpdate?.replies?.pageCids && generatedPages) {
            const newPageCids = lodash.uniq(Object.values(generatedPages.pageCids));
            const pageCidsToUnPin = lodash.uniq(
                Object.values(storedCommentUpdate.replies.pageCids).filter((oldPageCid) => !newPageCids.includes(oldPageCid))
            );
            this._cidsToUnPin.push(...pageCidsToUnPin);
        }
        const newUpdatedAt = storedCommentUpdate?.updatedAt === timestamp() ? timestamp() + 1 : timestamp();

        const commentUpdatePriorToSigning: Omit<CommentUpdate, "signature"> = {
            ...calculatedCommentUpdate,
            replies: generatedPages ? { pageCids: generatedPages.pageCids, pages: lodash.pick(generatedPages.pages, "topAll") } : undefined,
            updatedAt: newUpdatedAt,
            protocolVersion: env.PROTOCOL_VERSION
        };

        const newCommentUpdate: CommentUpdate = {
            ...commentUpdatePriorToSigning,
            signature: await signCommentUpdate(commentUpdatePriorToSigning, this.signer)
        };

        await this._validateCommentUpdateSignature(newCommentUpdate, comment, log);

        const ipfsPath = await this._calculateIpfsPathForCommentUpdate(comment, storedCommentUpdate);

        await this._writeCommentUpdateToIpfsFilePath(newCommentUpdate, ipfsPath, storedCommentUpdate?.ipfsPath);
        await this.dbHandler.upsertCommentUpdate({ ...newCommentUpdate, ipfsPath });
    }

    private async _validateCommentUpdateSignature(newCommentUpdate: CommentUpdate, comment: CommentsTableRow, log: Logger) {
        // This function should be deleted at some point, once the protocol ossifies
        const validation = await verifyCommentUpdate(newCommentUpdate, false, this.clientsManager, this.address, comment, false, false);
        if (!validation.valid) {
            log.error(`CommentUpdate (${comment.cid}) signature is invalid due to (${validation.reason}). This is a critical error`);
            throw new PlebbitError("ERR_COMMENT_UPDATE_SIGNATURE_IS_INVALID", validation);
        }
    }

    private async _listenToIncomingRequests() {
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

    private async _movePostUpdatesFolderToNewAddress(oldAddress: string, newAddress: string) {
        try {
            await this.clientsManager.getDefaultIpfs()._client.files.mv(`/${oldAddress}`, `/${newAddress}`); // Could throw
            const commentUpdates = await this.dbHandler.queryAllStoredCommentUpdates();
            for (const commentUpdate of commentUpdates) {
                const pathParts = commentUpdate.ipfsPath.split("/");
                pathParts[1] = newAddress;
                const newIpfsPath = pathParts.join("/");
                await this.dbHandler.upsertCommentUpdate({ ...commentUpdate, ipfsPath: newIpfsPath });
            }
        } catch (e) {
            if (e.message !== "file does not exist") throw e; // A critical error
        }
    }

    private _isCurrentSubplebbitEqualToLatestPublishedRecord(newSubRecord: SubplebbitIpfsType): boolean {
        const fieldsToOmit = ["posts", "updatedAt"];
        const rawSubplebbitTypeFiltered = lodash.omit(newSubRecord, fieldsToOmit);
        const currentSubplebbitFiltered = lodash.omit(this.toJSONIpfs(), fieldsToOmit);
        return lodash.isEqual(rawSubplebbitTypeFiltered, currentSubplebbitFiltered);
    }

    private async _switchDbWhileRunningIfNeeded() {
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
            this._setAddress(internalState.address);
            await this.dbHandler.changeDbFilename(currentDbAddress, internalState.address);
            await this.dbHandler.initDestroyedConnection();
            await this.dbHandler.lockSubStart(internalState.address); // Lock the new address start
            this._subplebbitUpdateTrigger = true;
            await this._updateDbInternalState({ _subplebbitUpdateTrigger: this._subplebbitUpdateTrigger });
        }
    }

    private async _updateCommentsThatNeedToBeUpdated() {
        const log = Logger(`plebbit-js:local-subplebbit:_updateCommentsThatNeedToBeUpdated`);

        const trx = await this.dbHandler.createTransaction("_updateCommentsThatNeedToBeUpdated");
        const commentsToUpdate = await this.dbHandler!.queryCommentsToBeUpdated(trx);
        await this.dbHandler.commitTransaction("_updateCommentsThatNeedToBeUpdated");
        if (commentsToUpdate.length === 0) return;

        this._subplebbitUpdateTrigger = true;

        log(`Will update ${commentsToUpdate.length} comments in this update loop for subplebbit (${this.address})`);

        const commentsGroupedByDepth = lodash.groupBy(commentsToUpdate, "depth");

        const depthsKeySorted = Object.keys(commentsGroupedByDepth).sort((a, b) => Number(b) - Number(a)); // Make sure comments with higher depths are sorted first

        for (const depthKey of depthsKeySorted) for (const comment of commentsGroupedByDepth[depthKey]) await this._updateComment(comment);
    }

    private async _repinCommentsIPFSIfNeeded() {
        const log = Logger("plebbit-js:local-subplebbit:sync");
        const dbCommentsCids = await this.dbHandler.queryAllCommentsCid();
        const pinnedCids = (await genToArray(this.clientsManager.getDefaultIpfs()._client.pin.ls())).map((cid) => String(cid.cid));

        const unpinnedCommentsCids = lodash.difference(dbCommentsCids, pinnedCids);

        if (unpinnedCommentsCids.length === 0) return;

        log(`There are ${unpinnedCommentsCids.length} comments that need to be repinned`);

        const unpinnedCommentsFromDb = await this.dbHandler.queryCommentsByCids(unpinnedCommentsCids);

        for (const unpinnedCommentRow of unpinnedCommentsFromDb) {
            const commentInstance = await this.plebbit.createComment(unpinnedCommentRow);
            const commentIpfsJson = commentInstance.toJSONIpfs();
            if (unpinnedCommentRow.ipnsName) commentIpfsJson["ipnsName"] = unpinnedCommentRow.ipnsName; // Added for backward compatibility
            const commentIpfsContent = deterministicStringify(commentIpfsJson);
            const contentHash: string = await Hash.of(commentIpfsContent);
            assert.equal(contentHash, unpinnedCommentRow.cid);
            await this.clientsManager.getDefaultIpfs()._client.add(commentIpfsContent, { pin: true });
        }

        await this.dbHandler.deleteAllCommentUpdateRows(); // delete CommentUpdate rows to force a new production of CommentUpdate
        log(`${unpinnedCommentsFromDb.length} comments' IPFS have been repinned`);
    }

    private async _unpinStaleCids() {
        const log = Logger("plebbit-js:local-subplebbit:unpinStaleCids");
        this._cidsToUnPin = lodash.uniq(this._cidsToUnPin);
        if (this._cidsToUnPin.length > 0) {
            await Promise.all(
                this._cidsToUnPin.map(async (cid) => {
                    try {
                        await this.clientsManager.getDefaultIpfs()._client.pin.rm(cid);
                    } catch (e) {}
                })
            );

            log.trace(`unpinned ${this._cidsToUnPin.length} stale cids from ipfs node for subplebbit (${this.address})`);
        }
    }
    private pubsubTopicWithfallback() {
        return this.pubsubTopic || this.address;
    }

    private async _repinCommentUpdateIfNeeded() {
        const log = Logger("plebbit-js:start:_repinCommentUpdateIfNeeded");

        const storedCommentUpdates = await this.dbHandler.queryAllStoredCommentUpdates();

        for (const commentUpdate of storedCommentUpdates) {
            try {
                await this.clientsManager.getDefaultIpfs()._client.files.stat(commentUpdate.ipfsPath);
            } catch (e) {
                // means the comment update is not on the ipfs node, need to add it
                // We should calculate new ipfs path
                if (e.message !== "file does not exist") throw e;
                const newIpfsPath = await this._calculateIpfsPathForCommentUpdate(
                    await this.dbHandler.queryComment(commentUpdate.cid),
                    undefined
                );
                await this._writeCommentUpdateToIpfsFilePath(commentUpdate, newIpfsPath, undefined);
                await this.dbHandler.upsertCommentUpdate({ ...commentUpdate, ipfsPath: newIpfsPath });
                log(`Added the CommentUpdate of (${commentUpdate.cid}) to IPFS files`);
            }
        }
    }

    private async _adjustPostUpdatesBucketsIfNeeded() {
        // This function will be ran a lot, maybe we should move it out of the sync loop or try to limit its execution
        if (!this.postUpdates) return;
        // Look for posts whose buckets should be changed

        // TODO this function should be ran in a more efficient manner. It iterates through all posts in the database
        // At some point we should have a db query that looks for posts that need to move to a different bucket
        const log = Logger("plebbit-js:local-subplebbit:start:_adjustPostUpdatesBucketsIfNeeded");
        const commentUpdateOfPosts = await this.dbHandler.queryCommentUpdatesOfPostsForBucketAdjustment();
        for (const post of commentUpdateOfPosts) {
            const currentTimestampBucketOfPost = Number(post.ipfsPath.split("/")[3]);
            const newTimestampBucketOfPost = this._postUpdatesBuckets.find((bucket) => timestamp() - bucket <= post.timestamp);
            if (currentTimestampBucketOfPost !== newTimestampBucketOfPost) {
                log(
                    `Post (${post.cid}) current postUpdates timestamp bucket (${currentTimestampBucketOfPost}) is outdated. Will move it to bucket (${newTimestampBucketOfPost})`
                );
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
                    const newIpfsPath = this._calculatePostUpdatePathForExistingCommentUpdate(
                        newTimestampBucketOfPost,
                        commentUpdate.ipfsPath
                    );
                    await this.dbHandler.upsertCommentUpdate({ ...commentUpdate, ipfsPath: newIpfsPath });
                }
                this._subplebbitUpdateTrigger = true;
            }
        }
    }

    private async syncIpnsWithDb() {
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
        } catch (e) {
            this._setStartedState("failed");
            this.clientsManager.updateIpfsState("stopped");

            log.error(`Failed to sync due to error,`, e);
        }
    }

    private async _assertDomainResolvesCorrectly(domain: string) {
        if (this.plebbit.resolver.isDomain(domain)) {
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

    private async _initSignerProps(newSignerProps: InternalSubplebbitType["signer"] | CreateSubplebbitOptions["signer"]) {
        const filledProps: InternalSubplebbitType["signer"] = {
            ...newSignerProps,
            address: newSignerProps["address"] || (await getPlebbitAddressFromPrivateKey(newSignerProps.privateKey))
        };
        this.signer = new Signer(filledProps);
        if (!this.signer?.ipfsKey?.byteLength || this.signer?.ipfsKey?.byteLength <= 0)
            this.signer.ipfsKey = new Uint8Array(await getIpfsKeyFromPrivateKey(this.signer.privateKey));
        if (!this.signer.ipnsKeyName) this.signer.ipnsKeyName = this.signer.address;
        if (!this.signer.publicKey) this.signer.publicKey = await getPublicKeyFromPrivateKey(this.signer.privateKey);

        this.encryption = {
            type: "ed25519-aes-gcm",
            publicKey: this.signer.publicKey
        };
    }

    private async _publishLoop(syncIntervalMs: number) {
        if (!this._isSubRunningLocally) return;
        const loop = async () => {
            this._publishLoopPromise = this.syncIpnsWithDb();
            await this._publishLoopPromise;
            await this._publishLoop(syncIntervalMs);
        };
        this._publishInterval = setTimeout(loop.bind(this), syncIntervalMs);
    }

    private async _initBeforeStarting() {
        if (!this.signer?.address) throwWithErrorCode("ERR_SUB_SIGNER_NOT_DEFINED");
        if (!this._challengeAnswerPromises)
            this._challengeAnswerPromises = new LRUCache<string, Promise<string[]>>({
                max: 1000,
                ttl: 600000
            });
        if (!this._challengeAnswerResolveReject)
            this._challengeAnswerResolveReject = new LRUCache<
                string,
                { resolve: (answers: string[]) => void; reject: (error: Error) => void }
            >({
                max: 1000,
                ttl: 600000
            });
        if (!this._ongoingChallengeExchanges)
            this._ongoingChallengeExchanges = new LRUCache<string, boolean>({
                max: 1000,
                ttl: 600000
            });
        if (!this._cidsToUnPin) this._cidsToUnPin = [];
        await this.dbHandler.initDestroyedConnection();
    }

    async edit(newSubplebbitOptions: SubplebbitEditOptions) {
        const log = Logger("plebbit-js:local-subplebbit:edit");

        // Right now if a sub owner passes settings.challenges = undefined or null, it will be explicitly changed to []
        // settings.challenges = [] means sub has no challenges
        if (newSubplebbitOptions.hasOwnProperty("settings") && newSubplebbitOptions.settings.hasOwnProperty("challenges"))
            newSubplebbitOptions.settings.challenges =
                newSubplebbitOptions.settings.challenges === undefined || newSubplebbitOptions.settings.challenges === null
                    ? []
                    : newSubplebbitOptions.settings.challenges;

        if ("roles" in newSubplebbitOptions) {
            let newRoles = lodash.omitBy(newSubplebbitOptions.roles, lodash.isNil); // remove author addresses with undefined or null
            if (Object.keys(newRoles).length === 0) newRoles = undefined; // if there are no mods then remove sub.roles entirely
            newSubplebbitOptions.roles = newRoles;
        }

        const newProps: Partial<
            SubplebbitEditOptions & Pick<InternalSubplebbitType, "_usingDefaultChallenge" | "_subplebbitUpdateTrigger">
        > = {
            ...newSubplebbitOptions,
            _subplebbitUpdateTrigger: true
        };

        if (Array.isArray(newProps?.settings?.challenges)) {
            newProps.challenges = newSubplebbitOptions.settings.challenges.map(getSubplebbitChallengeFromSubplebbitChallengeSettings);
            newProps._usingDefaultChallenge = lodash.isEqual(newProps?.settings?.challenges, this._defaultSubplebbitChallenges);
        }

        await this.dbHandler.initDestroyedConnection();

        if (newSubplebbitOptions.address && newSubplebbitOptions.address !== this.address) {
            if (doesDomainAddressHaveCapitalLetter(newSubplebbitOptions.address))
                throw new PlebbitError("ERR_DOMAIN_ADDRESS_HAS_CAPITAL_LETTER", { subplebbitAddress: newSubplebbitOptions.address });
            this._assertDomainResolvesCorrectly(newSubplebbitOptions.address).catch((err: PlebbitError) => {
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
                this._setAddress(newProps.address);
            }
        } else {
            await this._updateDbInternalState(newProps);
        }

        await this.initRpcInternalSubplebbit(newProps);

        log(`Subplebbit (${this.address}) props (${Object.keys(newProps)}) has been edited`);
        if (!this._isSubRunningLocally) await this.dbHandler.destoryConnection(); // Need to destory connection so process wouldn't hang

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
        await this._listenToIncomingRequests();

        this._subplebbitUpdateTrigger = true;
        await this._updateDbInternalState({ _subplebbitUpdateTrigger: this._subplebbitUpdateTrigger });

        await this._repinCommentsIPFSIfNeeded();
        await this._repinCommentUpdateIfNeeded();

        this.syncIpnsWithDb()
            .then(() => this._publishLoop(this.plebbit.publishInterval))
            .catch((reason) => {
                log.error(reason);
                this.emit("error", reason);
            });
    }

    private async _updateOnce() {
        const log = Logger("plebbit-js:local-subplebbit:update");
        const subState = await this._getDbInternalState(false);
        await this._updateStartedValue();
        if (deterministicStringify(this.toJSONInternal()) !== deterministicStringify(subState)) {
            log(`Local Subplebbit received a new update. Will emit an update event`);
            this._setUpdatingState("succeeded");
            await this.initInternalSubplebbit(subState);
            this.emit("update", this);
        }
    }

    async update() {
        const log = Logger("plebbit-js:local-subplebbit:update");
        if (this.state === "updating" || this.state === "started") return; // No need to do anything if subplebbit is already updating
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
            if (this._publishLoopPromise) await this._publishLoopPromise;
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
        } else if (this.state === "updating") {
            clearTimeout(this._updateTimeout);
            this._setUpdatingState("stopped");
            log(`Stopped the updating of local subplebbit (${this.address})`);
        }
        this._setState("stopped");
    }

    async delete() {
        await this.stop();

        const ipfsClient = this.clientsManager.getDefaultIpfs();
        if (!ipfsClient) throw Error("Ipfs client is not defined");

        await moveSubplebbitDbToDeletedDirectory(this.address, this.plebbit);
        if (typeof this.signer?.ipnsKeyName === "string")
            // Key may not exist on ipfs node
            try {
                await ipfsClient._client.key.rm(this.signer.ipnsKeyName);
            } catch {}
    }
}
