import Logger from "@plebbit/plebbit-logger";
import { Plebbit } from "../../../plebbit.js";
import type {
    Challenge,
    CreateNewLocalSubplebbitParsedOptions,
    InternalSubplebbitRecordBeforeFirstUpdateType,
    InternalSubplebbitRecordAfterFirstUpdateType,
    ParsedSubplebbitEditOptions,
    SubplebbitChallengeSetting,
    SubplebbitEditOptions,
    SubplebbitIpfsType,
    RpcInternalSubplebbitRecordBeforeFirstUpdateType,
    RpcInternalSubplebbitRecordAfterFirstUpdateType
} from "../../../subplebbit/types.js";
import { LRUCache } from "lru-cache";
import { SortHandler } from "./sort-handler.js";
import { DbHandler } from "./db-handler.js";
import { of as calculateIpfsHash } from "typestub-ipfs-only-hash";
import {
    doesDomainAddressHaveCapitalLetter,
    genToArray,
    hideClassPrivateProps,
    isLinkOfMedia,
    isStringDomain,
    removeNullUndefinedEmptyObjectsValuesRecursively,
    removeUndefinedValuesRecursively,
    throwWithErrorCode,
    timestamp
} from "../../../util.js";
import { STORAGE_KEYS } from "../../../constants.js";
import { stringify as deterministicStringify } from "safe-stable-stringify";
import { PlebbitError } from "../../../plebbit-error.js";

import type {
    ChallengeAnswerMessageType,
    ChallengeMessageType,
    ChallengeRequestMessageType,
    ChallengeVerificationMessageType,
    DecryptedChallenge,
    DecryptedChallengeAnswerMessageType,
    DecryptedChallengeRequest,
    DecryptedChallengeRequestMessageType,
    DecryptedChallengeVerificationMessageType,
    DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor
} from "../../../pubsub-messages/types.js";

import type {
    CommentEditsTableRow,
    CommentUpdatesRow,
    CommentsTableRow,
    IpfsHttpClientPubsubMessage,
    VotesTableRow
} from "../../../types.js";
import {
    ValidationResult,
    cleanUpBeforePublishing,
    signChallengeMessage,
    signChallengeVerification,
    signCommentUpdate,
    signSubplebbit,
    verifyChallengeAnswer,
    verifyChallengeRequest,
    verifyCommentEdit,
    verifyCommentUpdate
} from "../../../signer/signatures.js";
import { getThumbnailUrlOfLink, importSignerIntoIpfsNode, moveSubplebbitDbToDeletedDirectory } from "../util.js";
import { getErrorCodeFromMessage } from "../../../util.js";
import {
    SignerWithPublicKeyAddress,
    decryptEd25519AesGcmPublicKeyBuffer,
    verifyComment,
    verifySubplebbit,
    verifyVote
} from "../../../signer/index.js";
import { encryptEd25519AesGcmPublicKeyBuffer } from "../../../signer/encryption.js";
import { messages } from "../../../errors.js";
import {
    GetChallengeAnswers,
    getChallengeVerification,
    getSubplebbitChallengeFromSubplebbitChallengeSettings
} from "./challenges/index.js";
import * as cborg from "cborg";
import assert from "assert";
import env from "../../../version.js";
import { sha256 } from "js-sha256";
import { getIpfsKeyFromPrivateKey, getPlebbitAddressFromPublicKey, getPublicKeyFromPrivateKey } from "../../../signer/util.js";
import { RpcLocalSubplebbit } from "../../../subplebbit/rpc-local-subplebbit.js";
import * as remeda from "remeda";

import type { CommentEditPubsubMessage } from "../../../publications/comment-edit/types.js";
import {
    AuthorCommentEditPubsubSchema,
    CommentEditPubsubMessageSchema,
    CommentEditReservedFields,
    ModeratorCommentEditPubsubSchema,
    uniqueAuthorFields,
    uniqueModFields
} from "../../../publications/comment-edit/schema.js";
import type { VotePubsubMessage } from "../../../publications/vote/types.js";
import type {
    CommentIpfsType,
    CommentIpfsWithCidPostCidDefined,
    CommentPubsubMessage,
    CommentUpdate
} from "../../../publications/comment/types.js";
import { SubplebbitEditOptionsSchema, SubplebbitRoleSchema } from "../../../subplebbit/schema.js";
import {
    ChallengeMessageSchema,
    ChallengeVerificationMessageSchema,
    DecryptedChallengeAnswerSchema,
    DecryptedChallengeRequestSchema,
    DecryptedChallengeSchema,
    DecryptedChallengeVerificationMessageSchema,
    IncomingPubsubMessageSchema
} from "../../../pubsub-messages/schema.js";
import { parseJsonWithPlebbitErrorIfFails, parseSubplebbitIpfsSchemaWithPlebbitErrorIfItFails } from "../../../schema/schema-util.js";
import {
    CommentIpfsSchema,
    CommentPubsubMessageReservedFields,
    CommentPubsubMessagePassthroughWithRefinementSchema
} from "../../../publications/comment/schema.js";
import { VotePubsubMessageSchema, VotePubsubReservedFields } from "../../../publications/vote/schema.js";

// This is a sub we have locally in our plebbit datapath, in a NodeJS environment
export class LocalSubplebbit extends RpcLocalSubplebbit {
    override signer!: SignerWithPublicKeyAddress;
    private _postUpdatesBuckets = [86400, 604800, 2592000, 3153600000]; // 1 day, 1 week, 1 month, 100 years. Expecting to be sorted from smallest to largest

    private _defaultSubplebbitChallenges: SubplebbitChallengeSetting[] = [
        {
            name: "captcha-canvas-v3",
            exclude: [{ role: ["moderator", "admin", "owner"], post: false, reply: false, vote: false }]
        }
    ];

    // These caches below will be used to facilitate challenges exchange with authors, they will expire after 10 minutes
    // Most of the time they will be delete and cleaned up automatically
    private _challengeAnswerPromises!: LRUCache<string, Promise<string[]>>;
    private _challengeAnswerResolveReject!: LRUCache<string, { resolve: (answers: string[]) => void; reject: (error: Error) => void }>;
    private _ongoingChallengeExchanges!: LRUCache<string, boolean>;

    private _cidsToUnPin!: string[];
    private _subplebbitUpdateTrigger!: boolean;

    private _sortHandler!: SortHandler;
    _dbHandler!: DbHandler;
    private _isSubRunningLocally: boolean;
    private _publishLoopPromise?: Promise<void> = undefined;
    private _publishInterval?: NodeJS.Timeout = undefined;

    constructor(plebbit: Plebbit) {
        super(plebbit);
        this.handleChallengeExchange = this.handleChallengeExchange.bind(this);
        this.started = false;
        this._isSubRunningLocally = false;
        this._subplebbitUpdateTrigger = false;
        //@ts-expect-error
        this._challengeAnswerPromises = //@ts-expect-error
            this._challengeAnswerResolveReject = //@ts-expect-error
            this._ongoingChallengeExchanges = //@ts-expect-error
            this._cidsToUnPin =
                undefined;
        hideClassPrivateProps(this);
    }

    // This will be stored in DB
    toJSONInternalAfterFirstUpdate(): InternalSubplebbitRecordAfterFirstUpdateType {
        return {
            ...remeda.omit(this.toJSONInternalRpcAfterFirstUpdate(), ["started"]),
            signer: remeda.pick(this.signer, ["privateKey", "type", "address", "shortAddress", "publicKey"]),
            _subplebbitUpdateTrigger: this._subplebbitUpdateTrigger
        };
    }

    toJSONInternalBeforeFirstUpdate(): InternalSubplebbitRecordBeforeFirstUpdateType {
        return {
            ...remeda.omit(this.toJSONInternalRpcBeforeFirstUpdate(), ["started"]),
            signer: remeda.pick(this.signer, ["privateKey", "type", "address", "shortAddress", "publicKey"])
        };
    }

    override toJSONInternalRpcAfterFirstUpdate(): RpcInternalSubplebbitRecordAfterFirstUpdateType {
        return {
            ...super.toJSONInternalRpcAfterFirstUpdate(),
            signer: remeda.pick(this.signer, ["publicKey", "address", "shortAddress", "type"])
        };
    }

    override toJSONInternalRpcBeforeFirstUpdate(): RpcInternalSubplebbitRecordBeforeFirstUpdateType {
        return {
            ...super.toJSONInternalRpcBeforeFirstUpdate(),
            signer: remeda.pick(this.signer, ["publicKey", "address", "shortAddress", "type"])
        };
    }

    private async _updateStartedValue() {
        this.started = await this._dbHandler.isSubStartLocked(this.address);
    }

    async initNewLocalSubPropsNoMerge(newProps: CreateNewLocalSubplebbitParsedOptions) {
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

    async initInternalSubplebbitAfterFirstUpdateNoMerge(newProps: InternalSubplebbitRecordAfterFirstUpdateType) {
        await this.initRpcInternalSubplebbitAfterFirstUpdateNoMerge({ ...newProps, started: this.started });
        await this._initSignerProps(newProps.signer);
        this._subplebbitUpdateTrigger = newProps._subplebbitUpdateTrigger;
    }

    async initInternalSubplebbitBeforeFirstUpdateNoMerge(newProps: InternalSubplebbitRecordBeforeFirstUpdateType) {
        await this.initRpcInternalSubplebbitBeforeFirstUpdateNoMerge({ ...newProps, started: this.started });
        await this._initSignerProps(newProps.signer);
    }

    private async initDbHandlerIfNeeded() {
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
        if (!this.signer) throwWithErrorCode("ERR_LOCAL_SUB_HAS_NO_SIGNER_IN_INTERNAL_STATE", { address: this.address });
        await this._updateStartedValue();

        await this._dbHandler.destoryConnection(); // Need to destory connection so process wouldn't hang
    }
    private async _importSubplebbitSignerIntoIpfsIfNeeded() {
        if (!this.signer.ipnsKeyName) throw Error("subplebbit.signer.ipnsKeyName is not defined");
        if (!this.signer.ipfsKey) throw Error("subplebbit.signer.ipfsKey is not defined");

        const ipfsNodeKeys = await this._clientsManager.getDefaultIpfs()._client.key.list();
        if (!ipfsNodeKeys.find((key) => key.name === this.signer.ipnsKeyName))
            await importSignerIntoIpfsNode(this.signer.ipnsKeyName, this.signer.ipfsKey, {
                url: this._plebbit.ipfsHttpClientsOptions![0].url!.toString(),
                headers: this._plebbit.ipfsHttpClientsOptions![0].headers
            });
    }

    private async _updateDbInternalState(
        props: Partial<InternalSubplebbitRecordBeforeFirstUpdateType | InternalSubplebbitRecordAfterFirstUpdateType>
    ) {
        if (remeda.isEmpty(props)) return;
        await this._dbHandler.lockSubState();
        const internalStateBefore = await this._getDbInternalState(false);
        await this._dbHandler.keyvSet(STORAGE_KEYS[STORAGE_KEYS.INTERNAL_SUBPLEBBIT], {
            ...internalStateBefore,
            ...props
        });
        await this._dbHandler.unlockSubState();
    }

    private async _getDbInternalState(
        lock = true
    ): Promise<InternalSubplebbitRecordAfterFirstUpdateType | InternalSubplebbitRecordBeforeFirstUpdateType | undefined> {
        if (!(await this._dbHandler.keyvHas(STORAGE_KEYS[STORAGE_KEYS.INTERNAL_SUBPLEBBIT]))) return undefined;
        if (lock) await this._dbHandler.lockSubState();
        const internalState = <InternalSubplebbitRecordAfterFirstUpdateType | InternalSubplebbitRecordBeforeFirstUpdateType>(
            await this._dbHandler.keyvGet(STORAGE_KEYS[STORAGE_KEYS.INTERNAL_SUBPLEBBIT])
        );
        if (lock) await this._dbHandler.unlockSubState();
        return internalState;
    }

    private async _updateInstanceStateWithDbState() {
        const currentDbState = await this._getDbInternalState();
        if (!currentDbState) throw Error("current db state should be defined before updating instance state with it");

        if ("updatedAt" in currentDbState)
            await this.initInternalSubplebbitAfterFirstUpdateNoMerge({ ...currentDbState, address: this.address });
        else await this.initInternalSubplebbitBeforeFirstUpdateNoMerge({ ...currentDbState, address: this.address });
    }

    async _setChallengesToDefaultIfNotDefined(log: Logger) {
        if (
            this._usingDefaultChallenge !== false &&
            (!this.settings?.challenges || remeda.isDeepEqual(this.settings?.challenges, this._defaultSubplebbitChallenges))
        )
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

        if (!this.pubsubTopic) this.pubsubTopic = remeda.clone(this.signer.address);
        if (typeof this.createdAt !== "number") this.createdAt = timestamp();
        if (!this.protocolVersion) this.protocolVersion = env.PROTOCOL_VERSION;
        if (!this.settings?.challenges) {
            this.settings = { ...this.settings, challenges: this._defaultSubplebbitChallenges };
            this.challenges = this.settings.challenges!.map(getSubplebbitChallengeFromSubplebbitChallengeSettings);
            this._usingDefaultChallenge = true;
            log(`Defaulted the challenges of subplebbit (${this.address}) to`, this._defaultSubplebbitChallenges);
        }

        await this._updateDbInternalState(this.toJSONInternalBeforeFirstUpdate());

        await this._updateStartedValue();

        await this._dbHandler.destoryConnection(); // Need to destory connection so process wouldn't hang
    }

    private async _calculateNewPostUpdates(): Promise<SubplebbitIpfsType["postUpdates"]> {
        const postUpdates: SubplebbitIpfsType["postUpdates"] = {};
        for (const timeBucket of this._postUpdatesBuckets) {
            try {
                const statRes = await this._clientsManager
                    .getDefaultIpfs()
                    ._client.files.stat(`/${this.address}/postUpdates/${timeBucket}`);
                if (statRes.blocks !== 0) postUpdates[String(timeBucket)] = String(statRes.cid);
            } catch {}
        }
        if (remeda.isEmpty(postUpdates)) return undefined;
        return postUpdates;
    }

    private async _calculateLatestUpdateTrigger() {
        const lastPublishTooOld = this.updatedAt < timestamp() - 60 * 15; // Publish a subplebbit record every 15 minutes at least
        const dbInstance = await this._getDbInternalState(true);
        if (!dbInstance) throw Error("Db instance should be defined prior to publishing a new IPNS");
        this._subplebbitUpdateTrigger =
            this._subplebbitUpdateTrigger ||
            ("_subplebbitUpdateTrigger" in dbInstance && dbInstance._subplebbitUpdateTrigger) ||
            lastPublishTooOld;
    }

    private async updateSubplebbitIpnsIfNeeded() {
        const log = Logger("plebbit-js:local-subplebbit:sync");

        await this._calculateLatestUpdateTrigger();

        if (!this._subplebbitUpdateTrigger) return; // No reason to update

        const trx: any = await this._dbHandler.createTransaction("subplebbit");
        const latestPost = await this._dbHandler.queryLatestPostCid(trx);
        const latestComment = await this._dbHandler.queryLatestCommentCid(trx);
        await this._dbHandler.commitTransaction("subplebbit");

        const [stats, subplebbitPosts] = await Promise.all([
            this._dbHandler.querySubplebbitStats(undefined),
            this._sortHandler.generateSubplebbitPosts()
        ]);

        if (subplebbitPosts && this.posts?.pageCids) {
            const newPageCids = remeda.unique(Object.values(subplebbitPosts.pageCids));
            const pageCidsToUnPin = remeda.unique(
                Object.values(this.posts.pageCids).filter((oldPageCid) => !newPageCids.includes(oldPageCid))
            );

            this._cidsToUnPin.push(...pageCidsToUnPin);
        }

        const newPostUpdates = await this._calculateNewPostUpdates();

        const statsCid = (await this._clientsManager.getDefaultIpfs()._client.add(deterministicStringify(stats))).path;
        if (this.statsCid && statsCid !== this.statsCid) this._cidsToUnPin.push(this.statsCid);

        await this._updateInstanceStateWithDbState();

        const updatedAt = timestamp() === this.updatedAt ? timestamp() + 1 : timestamp();
        const newIpns: Omit<SubplebbitIpfsType, "signature"> = {
            ...cleanUpBeforePublishing({
                ...remeda.omit(this._toJSONBase(), ["signature"]),
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
        else await this._updateDbInternalState({ posts: undefined }); // make sure db resets posts as well

        const signature = await signSubplebbit(newIpns, this.signer);
        const newSubplebbitRecord = <SubplebbitIpfsType>{ ...newIpns, signature };

        await this._validateSubSchemaAndSignatureBeforePublishing(newSubplebbitRecord);

        const file = await this._clientsManager.getDefaultIpfs()._client.add(deterministicStringify(newSubplebbitRecord));
        // If this._isSubRunningLocally = false, then this is the last publish before stopping
        // TODO double check these values
        const ttl = this._isSubRunningLocally ? `${this._plebbit.publishInterval * 3}ms` : undefined;
        const lifetime = `24h`; // doesn't matter anyway, DHT drops all entries after 24h
        const publishRes = await this._clientsManager.getDefaultIpfs()._client.name.publish(file.path, {
            key: this.signer.ipnsKeyName,
            allowOffline: true,
            ttl,
            lifetime
        });
        log(
            `Published a new IPNS record for sub(${this.address}) on IPNS (${publishRes.name}) that points to file (${publishRes.value}) with updatedAt (${newSubplebbitRecord.updatedAt})`
        );
        this._unpinStaleCids().catch((err) => log.error("Failed to unpin stale cids due to ", err));

        this._cidsToUnPin = [file.path];

        await this.initSubplebbitIpfsPropsNoMerge(newSubplebbitRecord);
        this.cid = file.path;

        this._subplebbitUpdateTrigger = false;

        await this._updateDbInternalState(remeda.omit(this.toJSONInternalAfterFirstUpdate(), ["address"]));

        this._setStartedState("succeeded");
        this._clientsManager.updateIpfsState("stopped");
        this.emit("update", this);
    }

    private shouldResolveDomainForVerification() {
        return this.address.includes(".") && Math.random() < 0.005; // Resolving domain should be a rare process because default rpcs throttle if we resolve too much
    }

    private async _validateSubSchemaAndSignatureBeforePublishing(recordToPublishRaw: SubplebbitIpfsType) {
        const log = Logger("plebbit-js:local-subplebbit:_validateSubSchemaAndSignatureBeforePublishing");

        let parsedRecord: SubplebbitIpfsType;
        try {
            parsedRecord = parseSubplebbitIpfsSchemaWithPlebbitErrorIfItFails(recordToPublishRaw);
        } catch (e) {
            const error = new PlebbitError("ERR_LOCAL_SUBPLEBIT_PRODUCED_INVALID_SCHEMA", { invalidRecord: recordToPublishRaw, err: e });
            log.error(`Local subplebbit (${this.address}) produced an invalid SubplebbitIpfs schema`, error);
            this.emit("error", error);
            throw error;
        }

        try {
            const validation = await verifySubplebbit(parsedRecord, false, this._clientsManager, false, false);
            if (!validation.valid) {
                this._cidsToUnPin = [];
                throwWithErrorCode("ERR_LOCAL_SUBPLEBBIT_PRODUCED_INVALID_SIGNATURE", {
                    validation,
                    invalidRecord: parsedRecord
                });
            }
        } catch (e) {
            log.error(`Local subplebbit (${this.address}) produced an invalid signature`, e);
            this.emit("error", <PlebbitError>e);
            throw e;
        }

        if (this.shouldResolveDomainForVerification()) {
            try {
                log(`Resolving domain ${this.address} to make sure it's the same as signer.address ${this.signer.address}`);
                const resolvedSubAddress = await this._clientsManager.resolveSubplebbitAddressIfNeeded(this.address);
                if (resolvedSubAddress !== this.signer.address)
                    log.error(
                        `The domain address (${this.address}) subplebbit-address text record to resolves to ${resolvedSubAddress} when it should resolve to ${this.signer.address}`
                    );
            } catch (e) {
                log.error(`Failed to resolve sub domain ${this.address}`, e);
            }
        }
    }

    private async storeCommentEdit(
        commentEditRaw: CommentEditPubsubMessage,
        challengeRequestId: ChallengeRequestMessageType["challengeRequestId"]
    ): Promise<undefined> {
        const log = Logger("plebbit-js:local-subplebbit:storeCommentEdit");
        const strippedOutEditPublication = CommentEditPubsubMessageSchema.strip().parse(commentEditRaw); // we strip out here so we don't store any extra props in commentedits table
        const commentToBeEdited = await this._dbHandler.queryComment(commentEditRaw.commentCid, undefined); // We assume commentToBeEdited to be defined because we already tested for its existence above
        if (!commentToBeEdited) throw Error("The comment to edit doesn't exist"); // unlikely error to happen, but always a good idea to verify
        const editSignedByOriginalAuthor = commentEditRaw.signature.publicKey === commentToBeEdited.signature.publicKey;

        const isAuthorEdit = this._isAuthorEdit(commentEditRaw, editSignedByOriginalAuthor);
        const authorSignerAddress = await getPlebbitAddressFromPublicKey(commentEditRaw.signature.publicKey);

        const editTableRow = <CommentEditsTableRow>{
            ...strippedOutEditPublication,
            isAuthorEdit,
            authorSignerAddress,
            authorAddress: strippedOutEditPublication.author.address
        };

        const extraPropsInEdit = remeda.difference(
            remeda.keys.strict(commentEditRaw),
            remeda.keys.strict(CommentEditPubsubMessageSchema.shape)
        );
        if (extraPropsInEdit.length > 0) {
            log("Found extra props on CommentEdit", extraPropsInEdit, "Will be adding them to extraProps column");
            editTableRow.extraProps = remeda.pick(commentEditRaw, extraPropsInEdit);
        }

        await this._dbHandler.insertEdit(editTableRow);
        log.trace(`(${challengeRequestId}): `, `Updated comment (${commentEditRaw.commentCid}) with CommentEdit: `, commentEditRaw);
    }

    private async storeVote(newVoteProps: VotePubsubMessage, challengeRequestId: ChallengeRequestMessageType["challengeRequestId"]) {
        const log = Logger("plebbit-js:local-subplebbit:storeVote");
        const strippedOutVotePublication = VotePubsubMessageSchema.strip().parse(newVoteProps); // we strip out here so we don't store any extra props in votes table

        const authorSignerAddress = await getPlebbitAddressFromPublicKey(newVoteProps.signature.publicKey);
        await this._dbHandler.deleteVote(authorSignerAddress, newVoteProps.commentCid);
        const voteTableRow = <VotesTableRow>{
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
        log.trace(`inserted new vote (${newVoteProps}) for comment ${newVoteProps.commentCid}`);
        return undefined;
    }

    private isPublicationVote(publication: DecryptedChallengeRequestMessageType["publication"]): publication is VotePubsubMessage {
        return "vote" in publication && typeof publication.vote === "number";
    }

    private isPublicationComment(publication: DecryptedChallengeRequestMessageType["publication"]): publication is CommentPubsubMessage {
        return !this.isPublicationVote(publication) && !this.isPublicationCommentEdit(publication);
    }

    private isPublicationReply(publication: DecryptedChallengeRequestMessageType["publication"]): publication is CommentPubsubMessage {
        return this.isPublicationComment(publication) && "parentCid" in publication && typeof publication.parentCid === "string";
    }

    private isPublicationPost(publication: DecryptedChallengeRequestMessageType["publication"]) {
        return this.isPublicationComment(publication) && !("parentCid" in publication);
    }

    private isPublicationCommentEdit(
        publication: DecryptedChallengeRequestMessageType["publication"]
    ): publication is CommentEditPubsubMessage {
        return !this.isPublicationVote(publication) && "commentCid" in publication && typeof publication.commentCid === "string";
    }

    private async _calculateLinkProps(
        link: CommentPubsubMessage["link"]
    ): Promise<Pick<CommentIpfsType, "thumbnailUrl" | "thumbnailUrlWidth" | "thumbnailUrlHeight"> | undefined> {
        if (!link || !this.settings?.fetchThumbnailUrls) return undefined;
        return getThumbnailUrlOfLink(link, this, this.settings.fetchThumbnailUrlsProxyUrl);
    }

    private async _calculatePostProps(
        comment: CommentPubsubMessage,
        challengeRequestId: ChallengeRequestMessageType["challengeRequestId"]
    ): Promise<Pick<CommentIpfsType, "previousCid" | "depth">> {
        const trx = await this._dbHandler.createTransaction(challengeRequestId.toString());
        const previousCid = (await this._dbHandler.queryLatestPostCid(trx))?.cid;
        await this._dbHandler.commitTransaction(challengeRequestId.toString());
        return { depth: 0, previousCid };
    }

    private async _calculateReplyProps(
        comment: CommentPubsubMessage,
        challengeRequestId: ChallengeRequestMessageType["challengeRequestId"]
    ): Promise<Pick<CommentIpfsType, "previousCid" | "depth" | "postCid">> {
        if (!comment.parentCid) throw Error("Reply has to have parentCid");

        const trx = await this._dbHandler.createTransaction(challengeRequestId.toString());
        const [commentsUnderParent, parent] = await Promise.all([
            this._dbHandler.queryCommentsUnderComment(comment.parentCid, trx),
            this._dbHandler.queryComment(comment.parentCid, trx)
        ]);
        await this._dbHandler.commitTransaction(challengeRequestId.toString());

        if (!parent) throw Error("Failed to find parent of reply");

        return {
            depth: parent.depth + 1,
            postCid: parent.postCid,
            previousCid: commentsUnderParent[0]?.cid
        };
    }

    private async storePublication(request: DecryptedChallengeRequestMessageType): Promise<CommentIpfsWithCidPostCidDefined | undefined> {
        const log = Logger("plebbit-js:local-subplebbit:handleChallengeExchange:storePublicationIfValid");

        const publication = request.publication;
        const publicationHash = sha256(deterministicStringify(publication));
        if (this.isPublicationVote(publication)) return this.storeVote(publication, request.challengeRequestId);
        else if (this.isPublicationCommentEdit(publication)) return this.storeCommentEdit(publication, request.challengeRequestId);
        else if (this.isPublicationComment(publication)) {
            const commentIpfs = <CommentIpfsType>{
                ...publication,
                ...(await this._calculateLinkProps(publication.link)),
                ...(this.isPublicationPost(publication) && (await this._calculatePostProps(publication, request.challengeRequestId))),
                ...(this.isPublicationReply(publication) && (await this._calculateReplyProps(publication, request.challengeRequestId)))
            };

            const file = await this._clientsManager.getDefaultIpfs()._client.add(deterministicStringify(commentIpfs));

            const commentCid = file.path;
            const postCid = commentIpfs.postCid || commentCid; // if postCid is not defined, then we're adding a post to IPFS, so its own cid is the postCid
            const authorSignerAddress = await getPlebbitAddressFromPublicKey(publication.signature.publicKey);

            const commentRow = <CommentsTableRow>{
                ...commentIpfs,
                cid: commentCid,
                postCid,
                authorAddress: commentIpfs.author.address,
                authorSignerAddress,
                challengeRequestPublicationSha256: publicationHash
            };

            const trxForInsert = await this._dbHandler.createTransaction(request.challengeRequestId.toString());
            try {
                // This would throw for extra props
                await this._dbHandler.insertComment(commentRow, trxForInsert);
                // Everything below here is for verification purposes
                // The goal here is to find out if storing comment props in DB causes them to change in any way
                const commentInDb = await this._dbHandler.queryComment(commentRow.cid, trxForInsert);
                if (!commentInDb) throw Error("Failed to query the comment we just inserted");
                // The line below will fail with extra props
                const commentPubsubMessageRecreated = <CommentPubsubMessage>(
                    remeda.pick(commentInDb, <(keyof CommentPubsubMessage)[]>[...commentInDb.signature.signedPropertyNames, "signature"])
                );
                const validity = await verifyComment(
                    removeUndefinedValuesRecursively(commentPubsubMessageRecreated),
                    this._plebbit.resolveAuthorAddresses,
                    this._clientsManager,
                    false
                );
                if (!validity.valid)
                    throw Error(
                        "There is a problem with how query rows are processed in DB, which is causing an invalid signature. This is a critical Error"
                    );
                const commentIpfsRecreated = <CommentIpfsType>remeda.pick(commentInDb, remeda.keys.strict(commentIpfs));
                const calculatedHash = await calculateIpfsHash(deterministicStringify(commentIpfsRecreated));
                if (calculatedHash !== commentInDb.cid)
                    throw Error("There is a problem with db processing comment rows, the cids don't match");
            } catch (e) {
                log.error(`Failed to insert post to db due to error, rolling back on inserting the comment. This is a critical error`, e);
                await this._dbHandler.rollbackTransaction(request.challengeRequestId.toString());
                throw e;
            }

            await this._dbHandler.commitTransaction(request.challengeRequestId.toString());

            log(`New comment with cid ${commentRow.cid}  and depth (${commentRow.depth}) has been inserted into DB`);

            return { ...commentIpfs, cid: commentCid, postCid };
        }
    }

    private async _decryptOrRespondWithFailure(request: ChallengeRequestMessageType | ChallengeAnswerMessageType): Promise<string> {
        const log = Logger("plebbit-js:local-subplebbit:_decryptOrRespondWithFailure");
        try {
            return await decryptEd25519AesGcmPublicKeyBuffer(request.encrypted, this.signer.privateKey, request.signature.publicKey);
        } catch (e) {
            log.error(`Failed to decrypt request (${request.challengeRequestId.toString()}) due to error`, e);
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
                this._plebbit.resolveAuthorAddresses,
                this._clientsManager,
                false
            );
        else if (this.isPublicationCommentEdit(request.publication))
            validity = await verifyCommentEdit(
                <CommentEditPubsubMessage>request.publication,
                this._plebbit.resolveAuthorAddresses,
                this._clientsManager,
                false
            );
        else if (this.isPublicationVote(request.publication))
            validity = await verifyVote(
                <VotePubsubMessage>request.publication,
                this._plebbit.resolveAuthorAddresses,
                this._clientsManager,
                false
            );
        else throw Error("Can't detect the type of publication");

        if (!validity.valid) {
            await this._publishFailedChallengeVerification({ reason: validity.reason }, request.challengeRequestId);
            throwWithErrorCode(getErrorCodeFromMessage(validity.reason!), { publication: request.publication, validity });
        }
    }

    private async _publishChallenges(
        challenges: Omit<Challenge, "verify">[],
        request: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor
    ) {
        const log = Logger("plebbit-js:local-subplebbit:_publishChallenges");
        const toEncryptChallenge = DecryptedChallengeSchema.parse(<DecryptedChallenge>{ challenges });
        const toSignChallenge: Omit<ChallengeMessageType, "signature"> = cleanUpBeforePublishing({
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
        });

        const challengeMessage = ChallengeMessageSchema.parse({
            ...toSignChallenge,
            signature: await signChallengeMessage(toSignChallenge, this.signer)
        });

        this._clientsManager.updatePubsubState("publishing-challenge", undefined);

        await this._clientsManager.pubsubPublish(this.pubsubTopicWithfallback(), challengeMessage);
        log.trace(
            `Published ${challengeMessage.type} over pubsub: `,
            remeda.pick(toSignChallenge, ["timestamp"]),
            toEncryptChallenge.challenges.map((challenge) => challenge.type)
        );
        this._clientsManager.updatePubsubState("waiting-challenge-answers", undefined);
        this.emit("challenge", {
            ...challengeMessage,
            challenges
        });
    }

    private async _publishFailedChallengeVerification(
        result: Pick<ChallengeVerificationMessageType, "challengeErrors" | "reason">,
        challengeRequestId: ChallengeRequestMessageType["challengeRequestId"]
    ) {
        // challengeSucess=false
        const log = Logger("plebbit-js:local-subplebbit:_publishFailedChallengeVerification");

        const toSignVerification: Omit<ChallengeVerificationMessageType, "signature"> = cleanUpBeforePublishing({
            type: "CHALLENGEVERIFICATION",
            challengeRequestId: challengeRequestId,
            challengeSuccess: false,
            challengeErrors: result.challengeErrors,
            reason: result.reason,
            userAgent: env.USER_AGENT,
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

    private async _publishChallengeVerification(
        challengeResult: Pick<ChallengeVerificationMessageType, "challengeErrors" | "challengeSuccess" | "reason">,
        request: DecryptedChallengeRequestMessageType
    ) {
        const log = Logger("plebbit-js:local-subplebbit:_publishChallengeVerification");
        if (!challengeResult.challengeSuccess) return this._publishFailedChallengeVerification(challengeResult, request.challengeRequestId);
        else {
            // Challenge has passed, we store the publication (except if there's an issue with the publication)
            log.trace(
                `(${request.challengeRequestId.toString()}): `,
                `Will attempt to publish challengeVerification with challengeSuccess=true`
            );
            const publicationNoSubplebbitAuthor = await this.storePublication(request);

            let publication: DecryptedChallengeVerificationMessageType["publication"];
            if (remeda.isPlainObject(publicationNoSubplebbitAuthor)) {
                const authorSignerAddress = await getPlebbitAddressFromPublicKey(publicationNoSubplebbitAuthor.signature.publicKey);
                const subplebbitAuthor = await this._dbHandler.querySubplebbitAuthor(authorSignerAddress);
                publication = subplebbitAuthor
                    ? {
                          ...publicationNoSubplebbitAuthor,
                          author: { ...publicationNoSubplebbitAuthor.author, subplebbit: subplebbitAuthor }
                      }
                    : publicationNoSubplebbitAuthor;
                publication = DecryptedChallengeVerificationMessageSchema.shape.publication.parse(publication); // Make sure it adheres to the correct schema
            }
            // could contain "publication" or "reason"
            const encrypted = remeda.isPlainObject(publication)
                ? await encryptEd25519AesGcmPublicKeyBuffer(
                      <string>deterministicStringify({ publication }),
                      this.signer.privateKey,
                      request.signature.publicKey
                  )
                : undefined;

            const toSignMsg: Omit<ChallengeVerificationMessageType, "signature"> = cleanUpBeforePublishing({
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
            const challengeVerification = ChallengeVerificationMessageSchema.parse({
                ...toSignMsg,
                signature: await signChallengeVerification(toSignMsg, this.signer)
            });

            this._clientsManager.updatePubsubState("publishing-challenge-verification", undefined);

            await this._clientsManager.pubsubPublish(this.pubsubTopicWithfallback(), challengeVerification);

            this._clientsManager.updatePubsubState("waiting-challenge-requests", undefined);

            const objectToEmit = DecryptedChallengeVerificationMessageSchema.parse({ ...challengeVerification, publication });
            this.emit("challengeverification", objectToEmit);
            this._ongoingChallengeExchanges.delete(request.challengeRequestId.toString());
            this._cleanUpChallengeAnswerPromise(request.challengeRequestId.toString());
            log(
                `Published ${challengeVerification.type} over pubsub:`,
                removeNullUndefinedEmptyObjectsValuesRecursively(
                    remeda.pick(objectToEmit, ["publication", "challengeSuccess", "reason", "challengeErrors", "timestamp"])
                )
            );
        }
    }

    private _commentEditIncludesUniqueModFields(request: CommentEditPubsubMessage) {
        return remeda.intersection(uniqueModFields, remeda.keys.strict(request)).length > 0;
    }

    private _commentEditIncludesUniqueAuthorFields(request: CommentEditPubsubMessage) {
        return remeda.intersection(uniqueAuthorFields, remeda.keys.strict(request)).length > 0;
    }

    _isAuthorEdit(request: CommentEditPubsubMessage, editHasBeenSignedByOriginalAuthor: boolean) {
        if (this._commentEditIncludesUniqueAuthorFields(request)) return true;
        if (this._commentEditIncludesUniqueModFields(request)) return false;
        // The request has fields that are used in both mod and author, namely [spoiler, flair]
        if (editHasBeenSignedByOriginalAuthor) return true;
        return false;
    }

    private async _checkPublicationValidity(
        request: DecryptedChallengeRequestMessageType,
        authorSubplebbit?: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor["publication"]["author"]["subplebbit"]
    ): Promise<messages | undefined> {
        const log = Logger("plebbit-js:local-subplebbit:handleChallengeRequest:checkPublicationValidity");

        const publication = request.publication;

        if (publication.subplebbitAddress !== this.address) return messages.ERR_PUBLICATION_INVALID_SUBPLEBBIT_ADDRESS;

        if (typeof authorSubplebbit?.banExpiresAt === "number" && authorSubplebbit.banExpiresAt > timestamp())
            return messages.ERR_AUTHOR_IS_BANNED;

        if (!this.isPublicationPost(publication)) {
            // vote or reply or edit
            const parentCid: string | undefined = this.isPublicationReply(publication)
                ? publication.parentCid
                : this.isPublicationVote(publication) || this.isPublicationCommentEdit(publication)
                  ? publication.commentCid
                  : undefined;

            if (!parentCid) return messages.ERR_SUB_COMMENT_PARENT_CID_NOT_DEFINED;

            const parent = await this._dbHandler.queryComment(parentCid);
            if (!parent) return messages.ERR_PUBLICATION_PARENT_DOES_NOT_EXIST_IN_SUB;

            const parentFlags = await this._dbHandler.queryCommentFlags(parentCid);

            if (parentFlags.removed && !this.isPublicationCommentEdit(publication))
                // not allowed to vote or reply under removed comments
                return messages.ERR_SUB_PUBLICATION_PARENT_HAS_BEEN_REMOVED;

            const isParentDeleted = await this._dbHandler.queryAuthorEditDeleted(parentCid);

            if (isParentDeleted && !this.isPublicationCommentEdit(publication)) return messages.ERR_SUB_PUBLICATION_PARENT_HAS_BEEN_DELETED; // not allowed to vote or reply under deleted comments

            const postFlags = await this._dbHandler.queryCommentFlags(parent.postCid);

            if (postFlags.removed && !this.isPublicationCommentEdit(publication)) return messages.ERR_SUB_PUBLICATION_POST_HAS_BEEN_REMOVED;

            const isPostDeleted = await this._dbHandler.queryAuthorEditDeleted(parent.postCid);

            if (isPostDeleted && !this.isPublicationCommentEdit(publication)) return messages.ERR_SUB_PUBLICATION_POST_HAS_BEEN_DELETED;

            if (postFlags.locked && !this.isPublicationCommentEdit(publication)) return messages.ERR_SUB_PUBLICATION_POST_IS_LOCKED;

            if (parent.timestamp > publication.timestamp) return messages.ERR_SUB_COMMENT_TIMESTAMP_IS_EARLIER_THAN_PARENT;
        }

        // Reject publications if their size is over 40kb
        const publicationKilobyteSize = Buffer.byteLength(JSON.stringify(publication)) / 1000;

        if (publicationKilobyteSize > 40) return messages.ERR_REQUEST_PUBLICATION_OVER_ALLOWED_SIZE;

        if (this.isPublicationComment(publication)) {
            if (remeda.intersection(remeda.keys.strict(publication), CommentPubsubMessageReservedFields).length > 0)
                return messages.ERR_COMMENT_HAS_RESERVED_FIELD;
            if (this.features?.requirePostLinkIsMedia && publication.link && !isLinkOfMedia(publication.link))
                return messages.ERR_POST_LINK_IS_NOT_OF_MEDIA;

            const publicationHash = sha256(deterministicStringify(publication));
            const publicationInDb = await this._dbHandler.queryCommentByRequestPublicationHash(publicationHash);
            if (publicationInDb) return messages.ERR_DUPLICATE_COMMENT;
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
            if (!commentToBeEdited) throw Error("Wasn't able to find the comment to edit");
            const editSignedByOriginalAuthor = publication.signature.publicKey === commentToBeEdited.signature.publicKey;
            const modRoles = SubplebbitRoleSchema.shape.role.options; // [mod, admin, owner]
            const isEditorMod = this.roles?.[publication.author.address] && modRoles.includes(this.roles[publication.author.address]?.role);

            const editHasUniqueModFields = this._commentEditIncludesUniqueModFields(publication);
            const isAuthorEdit = this._isAuthorEdit(publication, editSignedByOriginalAuthor);

            if (isAuthorEdit && editHasUniqueModFields) return messages.ERR_PUBLISHING_EDIT_WITH_BOTH_MOD_AND_AUTHOR_FIELDS;

            const authorEditPubsubFields = remeda.keys.strict(AuthorCommentEditPubsubSchema.shape);
            const modEditPubsubFields = remeda.keys.strict(ModeratorCommentEditPubsubSchema.shape);

            const allowedEditFields =
                isAuthorEdit && editSignedByOriginalAuthor ? authorEditPubsubFields : isEditorMod ? modEditPubsubFields : undefined;
            if (!allowedEditFields) return messages.ERR_UNAUTHORIZED_COMMENT_EDIT;
            const publicationEditFields = remeda.keys.strict(CommentEditPubsubMessageSchema.strip().parse(publication)); // we strip here because we don't wanna include unknown props
            for (const editField of publicationEditFields)
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

            if (isEditorMod && publication.locked && commentToBeEdited.depth !== 0) return messages.ERR_SUB_COMMENT_EDIT_CAN_NOT_LOCK_REPLY;
        }

        return undefined;
    }

    private async _parseChallengeRequestPublicationOrRespondWithFailure(
        request: ChallengeRequestMessageType,
        decryptedRawString: string
    ): Promise<DecryptedChallengeRequest> {
        let decryptedJson: DecryptedChallengeRequest;
        try {
            decryptedJson = parseJsonWithPlebbitErrorIfFails(decryptedRawString);
        } catch (e) {
            await this._publishFailedChallengeVerification(
                { reason: messages.ERR_REQUEST_PUBLICATION_IS_INVALID_JSON },
                request.challengeRequestId
            );
            throw e;
        }

        // Parsing DecryptedChallengeRequest.publication here
        let parsedPublication: VotePubsubMessage | CommentPubsubMessage | CommentEditPubsubMessage | undefined = undefined;

        const publicationSchemasToParse = [
            VotePubsubMessageSchema.passthrough(),
            CommentPubsubMessagePassthroughWithRefinementSchema,
            CommentEditPubsubMessageSchema.passthrough()
        ];

        for (const schema of publicationSchemasToParse) {
            const res = schema.safeParse(decryptedJson?.publication);
            if (res.success) {
                parsedPublication = res.data;
                break;
            }
        }

        const parseRestOfDecrypted = DecryptedChallengeRequestSchema.omit({ publication: true }).safeParse(decryptedJson);

        if (parseRestOfDecrypted.success && parsedPublication) return { ...parseRestOfDecrypted.data, publication: parsedPublication };
        else {
            // All schemas failed
            await this._publishFailedChallengeVerification(
                { reason: messages.ERR_REQUEST_PUBLICATION_HAS_INVALID_SCHEMA },
                request.challengeRequestId
            );

            throw new PlebbitError("ERR_REQUEST_PUBLICATION_HAS_INVALID_SCHEMA", { decryptedJson });
        }
    }

    private async handleChallengeRequest(request: ChallengeRequestMessageType) {
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
        const decryptedRequestMsg = <DecryptedChallengeRequestMessageType>{ ...request, ...decryptedRequest };
        const decryptedRequestWithSubplebbitAuthor = <DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor>{
            ...decryptedRequestMsg,
            publication: {
                ...decryptedRequest.publication,
                ...(subplebbitAuthor ? { author: { ...decryptedRequest.publication.author, subplebbit: subplebbitAuthor } } : undefined)
            }
        };

        try {
            await this._respondWithErrorIfSignatureOfPublicationIsInvalid(decryptedRequestMsg); // This function will throw an error if signature is invalid
        } catch (e) {
            log.error(
                "Signature of challengerequest.publication is invalid, emitting an error event and aborting the challenge exchange",
                String(e)
            );
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
            if (!challengeAnswers) throw Error("Failed to retrieve challenge answers from promise. This is a critical error");
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
            this.emit("error", <PlebbitError>e);

            // notify the author that his publication wasn't published because the subplebbit is misconfigured
            challengeVerification = {
                challengeSuccess: false,
                reason: `One of the subplebbit challenges is misconfigured: ${(<Error>e).message}`
            };
        }

        await this._publishChallengeVerification(challengeVerification, decryptedRequestMsg);
    }

    private _cleanUpChallengeAnswerPromise(challengeRequestIdString: string) {
        this._challengeAnswerPromises.delete(challengeRequestIdString);
        this._challengeAnswerResolveReject.delete(challengeRequestIdString);
    }

    private async _parseChallengeAnswerOrRespondWithFailure(challengeAnswer: ChallengeAnswerMessageType, decryptedRawString: string) {
        let parsedJson: any;

        try {
            parsedJson = parseJsonWithPlebbitErrorIfFails(decryptedRawString);
        } catch (e) {
            await this._publishFailedChallengeVerification(
                { reason: messages.ERR_CHALLENGE_ANSWER_IS_INVALID_JSON },
                challengeAnswer.challengeRequestId
            );
            throw e;
        }

        try {
            return DecryptedChallengeAnswerSchema.parse(parsedJson);
        } catch (e) {
            await this._publishFailedChallengeVerification(
                { reason: messages.ERR_CHALLENGE_ANSWER_IS_INVALID_SCHEMA },
                challengeAnswer.challengeRequestId
            );
            throw e;
        }
    }

    async handleChallengeAnswer(challengeAnswer: ChallengeAnswerMessageType) {
        const log = Logger("plebbit-js:local-subplebbit:handleChallengeAnswer");

        if (!this._ongoingChallengeExchanges.has(challengeAnswer.challengeRequestId.toString()))
            // Respond with error to answers without challenge request
            await this._publishFailedChallengeVerification(
                { reason: messages.ERR_CHALLENGE_ANSWER_WITH_NO_CHALLENGE_REQUEST },
                challengeAnswer.challengeRequestId
            );
        const answerSignatureValidation = await verifyChallengeAnswer(challengeAnswer, true);

        if (!answerSignatureValidation.valid) {
            this._cleanUpChallengeAnswerPromise(challengeAnswer.challengeRequestId.toString());
            this._ongoingChallengeExchanges.delete(challengeAnswer.challengeRequestId.toString());
            throwWithErrorCode(getErrorCodeFromMessage(answerSignatureValidation.reason), { challengeAnswer });
        }

        const decryptedRawString = await this._decryptOrRespondWithFailure(challengeAnswer);

        const decryptedAnswers = await this._parseChallengeAnswerOrRespondWithFailure(challengeAnswer, decryptedRawString);

        const decryptedChallengeAnswerPubsubMessage = <DecryptedChallengeAnswerMessageType>{ ...challengeAnswer, ...decryptedAnswers };

        this.emit("challengeanswer", decryptedChallengeAnswerPubsubMessage);

        const challengeAnswerPromise = this._challengeAnswerResolveReject.get(challengeAnswer.challengeRequestId.toString());

        if (!challengeAnswerPromise)
            throw Error("The challenge answer promise is undefined, there is an issue with challenge. This is a critical error");

        challengeAnswerPromise.resolve(decryptedChallengeAnswerPubsubMessage.challengeAnswers);
    }

    private async handleChallengeExchange(pubsubMsg: IpfsHttpClientPubsubMessage) {
        const log = Logger("plebbit-js:local-subplebbit:handleChallengeExchange");

        const timeReceived = timestamp();

        const pubsubKilobyteSize = Buffer.byteLength(pubsubMsg.data) / 1000;
        if (pubsubKilobyteSize > 80) {
            log.error(`Received a pubsub message at (${timeReceived}) with size of ${pubsubKilobyteSize}. Silently dropping it`);
            return;
        }

        let decodedMsg: any;

        try {
            decodedMsg = cborg.decode(pubsubMsg.data);
        } catch (e) {
            log.error(`Failed to decode pubsub message received at (${timeReceived})`, (<Error>e).toString());
            return;
        }

        let parsedPubsubMsg:
            | ChallengeRequestMessageType
            | ChallengeAnswerMessageType
            | ChallengeMessageType
            | ChallengeVerificationMessageType;

        try {
            parsedPubsubMsg = IncomingPubsubMessageSchema.parse(decodedMsg);
        } catch (e) {
            log.error(`Failed to parse the schema of pubsub message received at (${timeReceived})`, (<Error>e).toString(), decodedMsg);
            return;
        }

        if (parsedPubsubMsg.type === "CHALLENGE" || parsedPubsubMsg.type === "CHALLENGEVERIFICATION") {
            log.trace(`Received a pubsub message that is not meant to by processed by the sub - ${parsedPubsubMsg.type}. Will ignore it`);
            return;
        } else if (parsedPubsubMsg.type === "CHALLENGEREQUEST") {
            try {
                await this.handleChallengeRequest(parsedPubsubMsg);
            } catch (e) {
                log.error(`Failed to process challenge request message received at (${timeReceived})`, (<Error>e).toString());
                await this._dbHandler.rollbackTransaction(parsedPubsubMsg.challengeRequestId.toString());
            }
        } else if (parsedPubsubMsg.type === "CHALLENGEANSWER") {
            try {
                await this.handleChallengeAnswer(parsedPubsubMsg);
            } catch (e) {
                log.error(`Failed to process challenge answer message received at (${timeReceived})`, (<Error>e).toString());
                await this._dbHandler.rollbackTransaction(parsedPubsubMsg.challengeRequestId.toString());
            }
        }
    }

    private _calculatePostUpdatePathForExistingCommentUpdate(timestampRange: number, currentIpfsPath: string) {
        const pathParts = currentIpfsPath.split("/");
        return ["/" + this.address, "postUpdates", timestampRange, ...pathParts.slice(4)].join("/");
    }

    private async _calculateIpfsPathForCommentUpdate(dbComment: CommentsTableRow, storedCommentUpdate?: CommentUpdatesRow) {
        const postTimestamp =
            dbComment.depth === 0 ? dbComment.timestamp : (await this._dbHandler.queryComment(dbComment.postCid))?.timestamp;
        if (typeof postTimestamp !== "number") throw Error("failed to query the comment in db to look for its postTimestamp");
        const timestampRange = this._postUpdatesBuckets.find((bucket) => timestamp() - bucket <= postTimestamp);
        if (typeof timestampRange !== "number") throw Error("Failed to find timestamp range for comment update");
        if (storedCommentUpdate?.ipfsPath)
            return this._calculatePostUpdatePathForExistingCommentUpdate(timestampRange, storedCommentUpdate.ipfsPath);
        else {
            const parentsCids = (await this._dbHandler.queryParents(dbComment)).map((parent) => parent.cid).reverse();
            return ["/" + this.address, "postUpdates", timestampRange, ...parentsCids, dbComment.cid, "update"].join("/");
        }
    }

    private async _writeCommentUpdateToIpfsFilePath(newCommentUpdate: CommentUpdate, ipfsPath: string, oldIpfsPath?: string) {
        // TODO need to exclude reply.replies here
        await this._clientsManager
            .getDefaultIpfs()
            ._client.files.write(ipfsPath, deterministicStringify(newCommentUpdate), { parents: true, truncate: true, create: true });
        if (oldIpfsPath && oldIpfsPath !== ipfsPath) await this._clientsManager.getDefaultIpfs()._client.files.rm(oldIpfsPath);
    }

    private async _updateComment(comment: CommentsTableRow): Promise<void> {
        const log = Logger("plebbit-js:local-subplebbit:sync:syncComment");

        // If we're here that means we're gonna calculate the new update and publish it
        log(`Attempting to update Comment (${comment.cid})`);

        // This comment will have the local new CommentUpdate, which we will publish to IPFS fiels
        // It includes new author.subplebbit as well as updated values in CommentUpdate (except for replies field)
        const [calculatedCommentUpdate, storedCommentUpdate, generatedPages] = await Promise.all([
            this._dbHandler.queryCalculatedCommentUpdate(comment),
            this._dbHandler.queryStoredCommentUpdate(comment),
            this._sortHandler.generateRepliesPages(comment)
        ]);
        if (calculatedCommentUpdate.replyCount > 0) assert(generatedPages);

        if (storedCommentUpdate?.replies?.pageCids && generatedPages) {
            const newPageCids = remeda.unique(Object.values(generatedPages.pageCids));
            const pageCidsToUnPin = remeda.unique(
                Object.values(storedCommentUpdate.replies.pageCids).filter((oldPageCid) => !newPageCids.includes(oldPageCid))
            );
            this._cidsToUnPin.push(...pageCidsToUnPin);
        }
        const newUpdatedAt = storedCommentUpdate?.updatedAt === timestamp() ? timestamp() + 1 : timestamp();

        const commentUpdatePriorToSigning: Omit<CommentUpdate, "signature"> = {
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

        const newCommentUpdate: CommentUpdate = {
            ...commentUpdatePriorToSigning,
            signature: await signCommentUpdate(commentUpdatePriorToSigning, this.signer)
        };

        await this._validateCommentUpdateSignature(newCommentUpdate, comment, log);

        const ipfsPath = await this._calculateIpfsPathForCommentUpdate(comment, storedCommentUpdate);

        await this._writeCommentUpdateToIpfsFilePath(newCommentUpdate, ipfsPath, storedCommentUpdate?.ipfsPath);
        await this._dbHandler.upsertCommentUpdate({ ...newCommentUpdate, ipfsPath });
    }

    private async _validateCommentUpdateSignature(newCommentUpdate: CommentUpdate, comment: CommentsTableRow, log: Logger) {
        // This function should be deleted at some point, once the protocol ossifies
        const validation = await verifyCommentUpdate(newCommentUpdate, false, this._clientsManager, this.address, comment, false, false);
        if (!validation.valid) {
            log.error(`CommentUpdate (${comment.cid}) signature is invalid due to (${validation.reason}). This is a critical error`);
            throw new PlebbitError("ERR_COMMENT_UPDATE_SIGNATURE_IS_INVALID", validation);
        }
    }

    private async _listenToIncomingRequests() {
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

    private async _movePostUpdatesFolderToNewAddress(oldAddress: string, newAddress: string) {
        try {
            await this._clientsManager.getDefaultIpfs()._client.files.mv(`/${oldAddress}`, `/${newAddress}`); // Could throw
            const commentUpdates = await this._dbHandler.queryAllStoredCommentUpdates();
            for (const commentUpdate of commentUpdates) {
                const pathParts = commentUpdate.ipfsPath.split("/");
                pathParts[1] = newAddress;
                const newIpfsPath = pathParts.join("/");
                await this._dbHandler.upsertCommentUpdate({ ...commentUpdate, ipfsPath: newIpfsPath });
            }
        } catch (e) {
            if (e instanceof Error && e.message !== "file does not exist") throw e; // A critical error
        }
    }

    private async _switchDbWhileRunningIfNeeded() {
        const log = Logger("plebbit-js:local-subplebbit:_switchDbIfNeeded");

        // Will check if address has been changed, and if so connect to the new db with the new address
        const internalState = await this._getDbInternalState(true);
        if (!internalState) throw Error("Can't change address or db when there's no internal state in db");
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

    private async _updateCommentsThatNeedToBeUpdated() {
        const log = Logger(`plebbit-js:local-subplebbit:_updateCommentsThatNeedToBeUpdated`);

        const trx = await this._dbHandler.createTransaction("_updateCommentsThatNeedToBeUpdated");
        const commentsToUpdate = await this._dbHandler!.queryCommentsToBeUpdated(trx);
        await this._dbHandler.commitTransaction("_updateCommentsThatNeedToBeUpdated");
        if (commentsToUpdate.length === 0) return;

        this._subplebbitUpdateTrigger = true;

        log(`Will update ${commentsToUpdate.length} comments in this update loop for subplebbit (${this.address})`);

        const commentsGroupedByDepth = remeda.groupBy.strict(commentsToUpdate, (x) => x.depth);

        const depthsKeySorted = remeda.keys.strict(commentsGroupedByDepth).sort((a, b) => Number(b) - Number(a)); // Make sure comments with higher depths are sorted first

        for (const depthKey of depthsKeySorted) for (const comment of commentsGroupedByDepth[depthKey]) await this._updateComment(comment);
    }

    private async _repinCommentsIPFSIfNeeded() {
        const log = Logger("plebbit-js:local-subplebbit:sync");
        const latestCommentCid = await this._dbHandler.queryLatestCommentCid(); // latest comment ordered by id
        if (!latestCommentCid) return;
        try {
            await genToArray(this._clientsManager.getDefaultIpfs()._client.pin.ls({ paths: latestCommentCid.cid }));
            return; // the comment is already pinned, we assume the rest of the comments are so too
        } catch (e) {
            if (!(<Error>e).message.includes("is not pinned")) throw e;
        }

        log("The latest comment is not pinned in the ipfs node, plebbit-js will repin all existing comment ipfs");

        // latestCommentCid should be the last in unpinnedCommentsFromDb array, in case we throw an error on a comment before it, it does not get pinned
        const unpinnedCommentsFromDb = await this._dbHandler.queryAllCommentsOrderedByIdAsc(); // we assume all comments are unpinned if latest comment is not pinned

        for (const unpinnedCommentRow of unpinnedCommentsFromDb) {
            const commentIpfsJson = <CommentIpfsType>{
                ...CommentIpfsSchema.strip().parse(unpinnedCommentRow),
                postCid: unpinnedCommentRow.depth === 0 ? undefined : unpinnedCommentRow.postCid // need to remove post cid because it's not part of ipfs file if depth is 0
            };
            //@ts-expect-error
            if (unpinnedCommentRow.ipnsName) commentIpfsJson["ipnsName"] = unpinnedCommentRow.ipnsName; // Added for backward compatibility
            const commentIpfsContent = deterministicStringify(commentIpfsJson);
            const contentHash: string = await calculateIpfsHash(commentIpfsContent);
            if (contentHash !== unpinnedCommentRow.cid) throw Error("Unable to recreate the CommentIpfs. This is a critical error");
            await this._clientsManager.getDefaultIpfs()._client.add(commentIpfsContent, { pin: true });
        }

        await this._dbHandler.deleteAllCommentUpdateRows(); // delete CommentUpdate rows to force a new production of CommentUpdate
        log(`${unpinnedCommentsFromDb.length} comments' IPFS have been repinned`);
    }

    private async _unpinStaleCids() {
        const log = Logger("plebbit-js:local-subplebbit:unpinStaleCids");
        this._cidsToUnPin = remeda.uniq(this._cidsToUnPin);
        if (this._cidsToUnPin.length > 0) {
            await Promise.all(
                this._cidsToUnPin.map(async (cid) => {
                    try {
                        await this._clientsManager.getDefaultIpfs()._client.pin.rm(cid);
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

        // iterating on all comment updates is not efficient, we should figure out a better way
        // Most of the time we run this function, the comment updates are already written to ipfs rpeo
        try {
            await this._clientsManager.getDefaultIpfs()._client.files.stat(`/${this.address}`, { hash: true });
            return; // if the directory of this sub exists, we assume all the comment updates are there
        } catch (e) {
            if (!(<Error>e).message.includes("file does not exist")) throw e;
        }

        // here we will go ahead to and rewrite all comment updates

        const storedCommentUpdates = await this._dbHandler.queryAllStoredCommentUpdates();
        if (storedCommentUpdates.length === 0) return;

        log(`CommentUpdate directory does not exist under MFS, will repin all comment updates (${storedCommentUpdates.length})`);

        for (const commentUpdate of storedCommentUpdates) {
            // means the comment update is not on the ipfs node, need to add it
            // We should calculate new ipfs path
            const commentInDb = await this._dbHandler.queryComment(commentUpdate.cid);
            if (!commentInDb) throw Error("Can't create a new CommentUpdate with comment not existing in db" + commentUpdate.cid);
            const newIpfsPath = await this._calculateIpfsPathForCommentUpdate(commentInDb, undefined);
            await this._writeCommentUpdateToIpfsFilePath(commentUpdate, newIpfsPath, undefined);
            await this._dbHandler.upsertCommentUpdate({ ...commentUpdate, ipfsPath: newIpfsPath });
            log(`Added the CommentUpdate of (${commentUpdate.cid}) to IPFS files`);
        }
    }

    private async _adjustPostUpdatesBucketsIfNeeded() {
        // This function will be ran a lot, maybe we should move it out of the sync loop or try to limit its execution
        if (!this.postUpdates) return;
        // Look for posts whose buckets should be changed

        // TODO this function should be ran in a more efficient manner. It iterates through all posts in the database
        // At some point we should have a db query that looks for posts that need to move to a different bucket
        const log = Logger("plebbit-js:local-subplebbit:start:_adjustPostUpdatesBucketsIfNeeded");
        const commentUpdateOfPosts = await this._dbHandler.queryCommentUpdatesOfPostsForBucketAdjustment();
        for (const post of commentUpdateOfPosts) {
            const currentTimestampBucketOfPost = Number(post.ipfsPath.split("/")[3]);
            const newTimestampBucketOfPost = this._postUpdatesBuckets.find((bucket) => timestamp() - bucket <= post.timestamp);
            if (typeof newTimestampBucketOfPost !== "number") throw Error("Failed to calculate the timestamp bucket of post");
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
                await this._clientsManager.getDefaultIpfs()._client.files.mkdir(newTimestampBucketPath, { parents: true });

                await this._clientsManager
                    .getDefaultIpfs()
                    ._client.files.mv(currentPostIpfsPathWithoutUpdate, newPostIpfsPathWithoutUpdate); // should move post and its children
                const commentUpdatesWithOutdatedIpfsPath = await this._dbHandler.queryCommentsUpdatesWithPostCid(post.cid);
                for (const commentUpdate of commentUpdatesWithOutdatedIpfsPath) {
                    const newIpfsPath = this._calculatePostUpdatePathForExistingCommentUpdate(
                        newTimestampBucketOfPost,
                        commentUpdate.ipfsPath
                    );
                    await this._dbHandler.upsertCommentUpdate({ ...commentUpdate, ipfsPath: newIpfsPath });
                }
                this._subplebbitUpdateTrigger = true;
            }
        }
    }

    private async syncIpnsWithDb() {
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
        } catch (e) {
            this._setStartedState("failed");
            this._clientsManager.updateIpfsState("stopped");

            log.error(`Failed to sync due to error,`, e);
        }
    }

    private async _assertDomainResolvesCorrectly(domain: string) {
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

    private async _initSignerProps(newSignerProps: InternalSubplebbitRecordBeforeFirstUpdateType["signer"]) {
        this.signer = new SignerWithPublicKeyAddress(newSignerProps);
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
        this.protocolVersion = env.PROTOCOL_VERSION;
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
        await this._dbHandler.initDestroyedConnection();
    }

    private _parseRolesToEdit(
        newRawRoles: NonNullable<SubplebbitEditOptions["roles"]>
    ): NonNullable<InternalSubplebbitRecordAfterFirstUpdateType["roles"]> {
        return <NonNullable<SubplebbitIpfsType["roles"]>>remeda.omitBy(newRawRoles, (val, key) => val === undefined || val === null);
    }

    private _parseChallengesToEdit(
        newChallengeSettings: NonNullable<NonNullable<SubplebbitEditOptions["settings"]>["challenges"]>
    ): NonNullable<Pick<InternalSubplebbitRecordAfterFirstUpdateType, "challenges" | "_usingDefaultChallenge">> {
        return {
            challenges: newChallengeSettings.map(getSubplebbitChallengeFromSubplebbitChallengeSettings),
            _usingDefaultChallenge: remeda.isDeepEqual(newChallengeSettings, this._defaultSubplebbitChallenges)
        };
    }

    override async edit(newSubplebbitOptions: SubplebbitEditOptions) {
        const log = Logger("plebbit-js:local-subplebbit:edit");

        const parsedEditOptions = SubplebbitEditOptionsSchema.parse(newSubplebbitOptions);

        const newInternalProps = <
            Pick<
                InternalSubplebbitRecordAfterFirstUpdateType,
                "_subplebbitUpdateTrigger" | "roles" | "challenges" | "_usingDefaultChallenge"
            >
        >{
            _subplebbitUpdateTrigger: true,
            ...(parsedEditOptions.roles ? { roles: this._parseRolesToEdit(parsedEditOptions.roles) } : undefined),
            ...(parsedEditOptions?.settings?.challenges ? this._parseChallengesToEdit(parsedEditOptions.settings.challenges) : undefined)
        };

        const newProps = <ParsedSubplebbitEditOptions>{
            ...remeda.omit(parsedEditOptions, ["roles"]), // we omit here to make tsc shut up
            ...newInternalProps
        };

        await this._dbHandler.initDestroyedConnection();

        if (newProps.address && newProps.address !== this.address) {
            // we're modifying sub.address
            if (doesDomainAddressHaveCapitalLetter(newProps.address))
                throw new PlebbitError("ERR_DOMAIN_ADDRESS_HAS_CAPITAL_LETTER", { subplebbitAddress: newProps.address });
            this._assertDomainResolvesCorrectly(newProps.address).catch((err: PlebbitError) => {
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
        } else {
            await this._updateDbInternalState(newProps);
        }

        const latestState = await this._getDbInternalState(true);
        if (!latestState) throw Error("Internal state in db should be defined prior to calling sub.edit()");

        if ("updatedAt" in latestState) await this.initInternalSubplebbitAfterFirstUpdateNoMerge(latestState);
        else await this.initInternalSubplebbitBeforeFirstUpdateNoMerge(latestState);

        log(
            `Subplebbit (${this.address}) props (${remeda.keys.strict(newProps)}) has been edited: `,
            remeda.pick(latestState, remeda.keys.strict(parsedEditOptions))
        );
        if (!this._isSubRunningLocally) await this._dbHandler.destoryConnection(); // Need to destory connection so process wouldn't hang
        this.emit("update", this);

        return this;
    }

    override async start() {
        const log = Logger("plebbit-js:local-subplebbit:start");

        await this._initBeforeStarting();
        // update started value twice because it could be started prior lockSubStart
        await this._updateStartedValue();
        await this._dbHandler.lockSubStart(); // Will throw if sub is locked already
        await this._updateStartedValue();
        this._setState("started");
        this._setStartedState("publishing-ipns");
        this._isSubRunningLocally = true;
        await this._dbHandler.initDbIfNeeded();
        await this._dbHandler.initDestroyedConnection();

        await this._setChallengesToDefaultIfNotDefined(log);
        // Import subplebbit keys onto ipfs node
        await this._importSubplebbitSignerIntoIpfsIfNeeded();

        this._subplebbitUpdateTrigger = true;
        await this._updateDbInternalState({ _subplebbitUpdateTrigger: this._subplebbitUpdateTrigger });

        await this._repinCommentsIPFSIfNeeded();
        await this._repinCommentUpdateIfNeeded();
        await this._listenToIncomingRequests();

        this.syncIpnsWithDb()
            .then(() => this._publishLoop(this._plebbit.publishInterval))
            .catch((reason) => {
                log.error(reason);
                this.emit("error", reason);
            });
    }

    private async _updateOnce() {
        const log = Logger("plebbit-js:local-subplebbit:update");
        const dbSubState = await this._getDbInternalState(false);
        if (!dbSubState) throw Error("There is no internal sub state in db");
        const currentState =
            typeof this.updatedAt === "number" ? this.toJSONInternalAfterFirstUpdate() : this.toJSONInternalBeforeFirstUpdate();
        await this._updateStartedValue();
        if (deterministicStringify(currentState) !== deterministicStringify(dbSubState)) {
            log(`Local Subplebbit received a new update. Will emit an update event`);
            this._setUpdatingState("succeeded");
            if ("updatedAt" in dbSubState) await this.initInternalSubplebbitAfterFirstUpdateNoMerge(dbSubState);
            else await this.initInternalSubplebbitBeforeFirstUpdateNoMerge(dbSubState);
            this.emit("update", this);
        }
    }

    override async update() {
        const log = Logger("plebbit-js:local-subplebbit:update");
        if (this.state === "updating" || this.state === "started") return; // No need to do anything if subplebbit is already updating
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

    override async stop() {
        const log = Logger("plebbit-js:local-subplebbit:stop");

        if (this.state === "started") {
            this._isSubRunningLocally = false;
            if (this._publishLoopPromise) await this._publishLoopPromise; // should be in try/catch
            await this._clientsManager.pubsubUnsubscribe(this.pubsubTopicWithfallback(), this.handleChallengeExchange);
            this._setStartedState("stopped");
            await this._dbHandler.rollbackAllTransactions();
            await this._dbHandler.unlockSubState();
            await this._dbHandler.unlockSubStart();
            await this._updateStartedValue();

            clearInterval(this._publishInterval);
            this._clientsManager.updateIpfsState("stopped");
            this._clientsManager.updatePubsubState("stopped", undefined);
            await this._dbHandler.destoryConnection();
            log(`Stopped the running of local subplebbit (${this.address})`);
            this._setState("stopped");
        } else if (this.state === "updating") {
            clearTimeout(this._updateTimeout);
            this._setUpdatingState("stopped");
            log(`Stopped the updating of local subplebbit (${this.address})`);
            this._setState("stopped");
        } else throw Error("User called localSubplebbit.stop() without updating or starting first");
    }

    override async delete() {
        const log = Logger("plebbit-js:local-subplebbit:delete");
        log.trace(`Attempting to stop the subplebbit (${this.address}) before deleting, if needed`);
        if (this.state === "updating" || this.state === "started") await this.stop();

        const ipfsClient = this._clientsManager.getDefaultIpfs();
        if (!ipfsClient) throw Error("Ipfs client is not defined");

        await moveSubplebbitDbToDeletedDirectory(this.address, this._plebbit);
        if (typeof this.signer?.ipnsKeyName === "string")
            // Key may not exist on ipfs node
            try {
                await ipfsClient._client.key.rm(this.signer.ipnsKeyName);
            } catch {}
        log(`Deleted subplebbit (${this.address}) successfully`);
    }
}
