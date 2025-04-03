import Logger from "@plebbit/plebbit-logger";
import { Plebbit } from "../../../plebbit/plebbit.js";
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
    RpcInternalSubplebbitRecordAfterFirstUpdateType,
    SubplebbitRole
} from "../../../subplebbit/types.js";
import { LRUCache } from "lru-cache";
import { PageGenerator } from "./page-generator.js";
import { DbHandler } from "./db-handler.js";
import { of as calculateIpfsHash } from "typestub-ipfs-only-hash";
import {
    derivePublicationFromChallengeRequest,
    doesDomainAddressHaveCapitalLetter,
    genToArray,
    hideClassPrivateProps,
    isLinkOfMedia,
    isStringDomain,
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
    DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor,
    PublicationWithSubplebbitAuthorFromDecryptedChallengeRequest,
    PublicationFromDecryptedChallengeRequest,
    DecryptedChallengeVerification,
    DecryptedChallengeAnswer
} from "../../../pubsub-messages/types.js";

import type {
    CommentEditsTableRow,
    CommentModerationsTableRowInsert,
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
    signCommentUpdateForChallengeVerification,
    signSubplebbit,
    verifyChallengeAnswer,
    verifyChallengeRequest,
    verifyCommentEdit,
    verifyCommentModeration,
    verifyCommentUpdate,
    verifySubplebbitEdit
} from "../../../signer/signatures.js";
import {
    calculateExpectedSignatureSize,
    getThumbnailUrlOfLink,
    importSignerIntoKuboNode,
    listSubplebbits,
    moveSubplebbitDbToDeletedDirectory
} from "../util.js";
import { getErrorCodeFromMessage } from "../../../util.js";
import {
    SignerWithPublicKeyAddress,
    decryptEd25519AesGcmPublicKeyBuffer,
    verifyCommentIpfs,
    verifyCommentPubsubMessage,
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
import { getIpfsKeyFromPrivateKey, getPlebbitAddressFromPublicKey, getPublicKeyFromPrivateKey } from "../../../signer/util.js";
import { RpcLocalSubplebbit } from "../../../subplebbit/rpc-local-subplebbit.js";
import * as remeda from "remeda";

import type { CommentEditPubsubMessagePublication } from "../../../publications/comment-edit/types.js";
import {
    CommentEditPubsubMessagePublicationSchema,
    CommentEditPubsubMessagePublicationWithFlexibleAuthorSchema,
    CommentEditReservedFields
} from "../../../publications/comment-edit/schema.js";
import type { VotePubsubMessagePublication } from "../../../publications/vote/types.js";
import type {
    CommentIpfsType,
    CommentPubsubMessagePublication,
    CommentUpdateType,
    PostPubsubMessageWithSubplebbitAuthor,
    ReplyPubsubMessageWithSubplebbitAuthor
} from "../../../publications/comment/types.js";
import { SubplebbitIpfsSchema } from "../../../subplebbit/schema.js";
import {
    ChallengeAnswerMessageSchema,
    ChallengeMessageSchema,
    ChallengeRequestMessageSchema,
    ChallengeVerificationMessageSchema,
    DecryptedChallengeRequestPublicationSchema,
    DecryptedChallengeRequestSchema
} from "../../../pubsub-messages/schema.js";
import {
    parseDecryptedChallengeAnswerWithPlebbitErrorIfItFails,
    parseJsonWithPlebbitErrorIfFails,
    parseSubplebbitEditOptionsSchemaWithPlebbitErrorIfItFails,
    parseSubplebbitIpfsSchemaPassthroughWithPlebbitErrorIfItFails
} from "../../../schema/schema-util.js";
import {
    CommentIpfsSchema,
    CommentPubsubMessageReservedFields,
    CommentPubsubMessagePublicationSchema
} from "../../../publications/comment/schema.js";
import { VotePubsubMessagePublicationSchema, VotePubsubReservedFields } from "../../../publications/vote/schema.js";
import { v4 as uuidV4 } from "uuid";
import { AuthorReservedFields } from "../../../schema/schema.js";
import {
    CommentModerationPubsubMessagePublicationSchema,
    CommentModerationReservedFields
} from "../../../publications/comment-moderation/schema.js";
import type { CommentModerationPubsubMessagePublication } from "../../../publications/comment-moderation/types.js";
import { SubplebbitEditPublicationPubsubReservedFields } from "../../../publications/subplebbit-edit/schema.js";
import type { SubplebbitEditPubsubMessagePublication } from "../../../publications/subplebbit-edit/types.js";
import { default as lodashDeepMerge } from "lodash.merge"; // Importing only the `merge` function
import { MAX_FILE_SIZE_BYTES_FOR_SUBPLEBBIT_IPFS } from "../../../subplebbit/subplebbit-client-manager.js";
import { MAX_FILE_SIZE_BYTES_FOR_COMMENT_UPDATE } from "../../../publications/comment/comment-client-manager.js";

type CommentUpdateToBeUpdated = CommentUpdatesRow & Pick<CommentsTableRow, "depth"> & { commentUpdateRecordString: string };

// This is a sub we have locally in our plebbit datapath, in a NodeJS environment
export class LocalSubplebbit extends RpcLocalSubplebbit implements CreateNewLocalSubplebbitParsedOptions {
    override signer!: SignerWithPublicKeyAddress;
    private _postUpdatesBuckets = [86400, 604800, 2592000, 3153600000]; // 1 day, 1 week, 1 month, 100 years. Expecting to be sorted from smallest to largest

    private _defaultSubplebbitChallenges: SubplebbitChallengeSetting[] = [
        {
            name: "captcha-canvas-v3",
            exclude: [{ role: ["moderator", "admin", "owner"], publicationType: { commentModeration: true } }]
        }
    ];

    // These caches below will be used to facilitate challenges exchange with authors, they will expire after 10 minutes
    // Most of the time they will be delete and cleaned up automatically
    private _challengeAnswerPromises!: LRUCache<string, Promise<DecryptedChallengeAnswer["challengeAnswers"]>>;
    private _challengeAnswerResolveReject!: LRUCache<
        string,
        { resolve: (answers: DecryptedChallengeAnswer["challengeAnswers"]) => void; reject: (error: Error) => void }
    >;
    private _ongoingChallengeExchanges!: LRUCache<string, boolean>;

    private _cidsToUnPin: Set<string> = new Set<string>();
    private _mfsPathsToRemove: Set<string> = new Set<string>();
    private _subplebbitUpdateTrigger!: boolean;

    private _pageGenerator!: PageGenerator;
    _dbHandler!: DbHandler;
    private _stopHasBeenCalled: boolean; // we use this to track if sub.stop() has been called after sub.start() or sub.update()
    private _publishLoopPromise?: Promise<void> = undefined;
    private _updateLoopPromise?: Promise<void> = undefined;
    private _publishInterval?: NodeJS.Timeout = undefined;
    private _internalStateUpdateId: InternalSubplebbitRecordBeforeFirstUpdateType["_internalStateUpdateId"] = "";

    private _updateLocalSubTimeout?: NodeJS.Timeout = undefined;

    constructor(plebbit: Plebbit) {
        super(plebbit);
        this.handleChallengeExchange = this.handleChallengeExchange.bind(this);
        this.started = false;
        this._subplebbitUpdateTrigger = false;
        this._stopHasBeenCalled = false;
        //@ts-expect-error
        this._challengeAnswerPromises = //@ts-expect-error
            this._challengeAnswerResolveReject = //@ts-expect-error
            this._ongoingChallengeExchanges = //@ts-expect-error
            this._internalStateUpdateId =
                undefined;
        hideClassPrivateProps(this);
    }

    // This will be stored in DB
    toJSONInternalAfterFirstUpdate(): InternalSubplebbitRecordAfterFirstUpdateType {
        return {
            ...remeda.omit(this.toJSONInternalRpcAfterFirstUpdate(), ["started"]),
            signer: remeda.pick(this.signer, ["privateKey", "type", "address", "shortAddress", "publicKey"]),
            _subplebbitUpdateTrigger: this._subplebbitUpdateTrigger,
            _internalStateUpdateId: this._internalStateUpdateId,
            _cidsToUnPin: [...this._cidsToUnPin],
            _mfsPathsToRemove: [...this._mfsPathsToRemove]
        };
    }

    toJSONInternalBeforeFirstUpdate(): InternalSubplebbitRecordBeforeFirstUpdateType {
        return {
            ...remeda.omit(this.toJSONInternalRpcBeforeFirstUpdate(), ["started"]),
            signer: remeda.pick(this.signer, ["privateKey", "type", "address", "shortAddress", "publicKey"]),
            _subplebbitUpdateTrigger: this._subplebbitUpdateTrigger,
            _internalStateUpdateId: this._internalStateUpdateId
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
        this._internalStateUpdateId = newProps._internalStateUpdateId;
        if (newProps._cidsToUnPin) newProps._cidsToUnPin.forEach((cid) => this._cidsToUnPin.add(cid));
        if (newProps._mfsPathsToRemove) newProps._mfsPathsToRemove.forEach((path) => this._mfsPathsToRemove.add(path));
    }

    async initInternalSubplebbitBeforeFirstUpdateNoMerge(newProps: InternalSubplebbitRecordBeforeFirstUpdateType) {
        await this.initRpcInternalSubplebbitBeforeFirstUpdateNoMerge({ ...newProps, started: this.started });
        await this._initSignerProps(newProps.signer);
        this._subplebbitUpdateTrigger = newProps._subplebbitUpdateTrigger;
        this._internalStateUpdateId = newProps._internalStateUpdateId;
    }

    private async initDbHandlerIfNeeded() {
        if (!this._dbHandler) {
            this._dbHandler = new DbHandler(this);
            await this._dbHandler.initDbConfigIfNeeded();
            this._pageGenerator = new PageGenerator(this);
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
        await this._setSubplebbitIpfsIfNeeded();

        await this._dbHandler.destoryConnection(); // Need to destory connection so process wouldn't hang

        // need to validate schema of Subplebbit IPFS
        if (this._rawSubplebbitIpfs)
            try {
                parseSubplebbitIpfsSchemaPassthroughWithPlebbitErrorIfItFails(this._rawSubplebbitIpfs);
            } catch (e) {
                if (e instanceof Error) {
                    e.message = "Local subplebbit" + this.address + " has an invalid schema: " + e.message;
                    throw e;
                }
            }
    }
    private async _importSubplebbitSignerIntoIpfsIfNeeded() {
        if (!this.signer.ipnsKeyName) throw Error("subplebbit.signer.ipnsKeyName is not defined");
        if (!this.signer.ipfsKey) throw Error("subplebbit.signer.ipfsKey is not defined");

        const kuboNodeKeys = await this._clientsManager.getDefaultIpfs()._client.key.list();
        if (!kuboNodeKeys.find((key) => key.name === this.signer.ipnsKeyName))
            await importSignerIntoKuboNode(this.signer.ipnsKeyName, this.signer.ipfsKey, {
                url: this._plebbit.kuboRpcClientsOptions![0].url!.toString(),
                headers: this._plebbit.kuboRpcClientsOptions![0].headers
            });
    }

    async _updateDbInternalState(
        props: Partial<InternalSubplebbitRecordBeforeFirstUpdateType | InternalSubplebbitRecordAfterFirstUpdateType>
    ) {
        if (remeda.isEmpty(props)) return;
        await this._dbHandler.initDbIfNeeded();

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

    private async _getDbInternalState(
        lock: boolean
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
        const currentDbState = await this._getDbInternalState(false);
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
            this._usingDefaultChallenge = true;
            log(`Defaulted the challenges of subplebbit (${this.address}) to`, this._defaultSubplebbitChallenges);
        }

        this.challenges = this.settings.challenges!.map(getSubplebbitChallengeFromSubplebbitChallengeSettings);

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
        const lastPublishTooOld = (this.updatedAt || 0) < timestamp() - 60 * 15; // Publish a subplebbit record every 15 minutes at least
        const dbInstance = await this._getDbInternalState(true);
        if (!dbInstance) throw Error("Db instance should be defined prior to publishing a new IPNS");
        this._subplebbitUpdateTrigger = this._subplebbitUpdateTrigger || dbInstance._subplebbitUpdateTrigger || lastPublishTooOld;
    }

    private async updateSubplebbitIpnsIfNeeded(commentUpdateRowsToPublishToIpfs: CommentUpdateToBeUpdated[]) {
        const log = Logger("plebbit-js:local-subplebbit:sync");

        await this._calculateLatestUpdateTrigger();

        if (!this._subplebbitUpdateTrigger) return; // No reason to update

        const trx: any = await this._dbHandler.createTransaction("subplebbit");
        const latestPost = await this._dbHandler.queryLatestPostCid(trx);
        const latestComment = await this._dbHandler.queryLatestCommentCid(trx);
        await this._dbHandler.commitTransaction("subplebbit");

        const stats = await this._dbHandler.querySubplebbitStats(undefined);

        await this._rmUnneededMfsPaths();
        await this._syncPostUpdatesWithIpfs(commentUpdateRowsToPublishToIpfs);
        const newPostUpdates = await this._calculateNewPostUpdates();

        const statsCid = (await this._clientsManager.getDefaultIpfs()._client.add(deterministicStringify(stats))).path;
        if (this.statsCid && statsCid !== this.statsCid) this._cidsToUnPin.add(this.statsCid);

        await this._updateInstanceStateWithDbState();

        const updatedAt = timestamp() === this.updatedAt ? timestamp() + 1 : timestamp();
        const newIpns: Omit<SubplebbitIpfsType, "signature"> = {
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

        const preloadedPostsPages = "hot";
        // Calculate size taken by subplebbit without posts and signature
        const subplebbitWithoutPostsSignatureSize = Buffer.byteLength(JSON.stringify(newIpns), "utf8");

        // Calculate expected signature size
        const expectedSignatureSize = calculateExpectedSignatureSize(newIpns);

        // Calculate remaining space for posts
        const availablePostsSize = MAX_FILE_SIZE_BYTES_FOR_SUBPLEBBIT_IPFS - subplebbitWithoutPostsSignatureSize - expectedSignatureSize;

        const generatedPosts = await this._pageGenerator.generateSubplebbitPosts(preloadedPostsPages, availablePostsSize);

        // posts should not be cleaned up because we want to make sure not to modify authors' posts

        if (generatedPosts) {
            if ("singlePreloadedPage" in generatedPosts) newIpns.posts = { pages: generatedPosts.singlePreloadedPage };
            else if (generatedPosts.pageCids) {
                // multiple pages
                newIpns.posts = {
                    pageCids: generatedPosts.pageCids,
                    pages: remeda.pick(generatedPosts.pages, [preloadedPostsPages])
                };
                const newPageCids = remeda.unique(Object.values(generatedPosts.pageCids));
                const pageCidsToUnPin = remeda.unique(
                    Object.values(this.posts.pageCids).filter((oldPageCid) => !newPageCids.includes(oldPageCid))
                );

                pageCidsToUnPin.forEach((cidToUnpin) => this._cidsToUnPin.add(cidToUnpin));
            }
        } else await this._updateDbInternalState({ posts: undefined }); // make sure db resets posts as well

        const signature = await signSubplebbit(newIpns, this.signer);
        const newSubplebbitRecord = <SubplebbitIpfsType>{ ...newIpns, signature };

        await this._validateSubSizeSchemaAndSignatureBeforePublishing(newSubplebbitRecord);

        const file = await this._clientsManager.getDefaultIpfs()._client.add(deterministicStringify(newSubplebbitRecord));
        const ttl = `${this._plebbit.publishInterval * 3}ms`; // default publish interval is 20s, so default ttl is 60s
        const publishRes = await this._clientsManager.getDefaultIpfs()._client.name.publish(file.path, {
            key: this.signer.ipnsKeyName,
            allowOffline: true,
            ttl
        });
        log(
            `Published a new IPNS record for sub(${this.address}) on IPNS (${publishRes.name}) that points to file (${publishRes.value}) with updatedAt (${newSubplebbitRecord.updatedAt}) and TTL (${ttl})`
        );
        await this._unpinStaleCidsAndRemoveUnneededMfsPaths();
        if (this.updateCid) this._cidsToUnPin.add(this.updateCid); // add old cid of subplebbit to be unpinned

        await this.initSubplebbitIpfsPropsNoMerge(newSubplebbitRecord);
        this.updateCid = file.path;

        this._subplebbitUpdateTrigger = false;

        await this._updateDbInternalState(remeda.omit(this.toJSONInternalAfterFirstUpdate(), ["address"]));

        this._setStartedState("succeeded");
        this._clientsManager.updateIpfsState("stopped");
        this.emit("update", this);
    }

    private shouldResolveDomainForVerification() {
        return this.address.includes(".") && Math.random() < 0.005; // Resolving domain should be a rare process because default rpcs throttle if we resolve too much
    }

    private async _validateSubSizeSchemaAndSignatureBeforePublishing(recordToPublishRaw: SubplebbitIpfsType) {
        const log = Logger("plebbit-js:local-subplebbit:_validateSubSchemaAndSignatureBeforePublishing");

        // Check if the subplebbit record size is less than 1MB
        const recordSize = Buffer.byteLength(JSON.stringify(recordToPublishRaw)); // size in bytes
        if (recordSize > MAX_FILE_SIZE_BYTES_FOR_SUBPLEBBIT_IPFS) {
            const error = new PlebbitError("ERR_LOCAL_SUBPLEBBIT_RECORD_TOO_LARGE", {
                size: recordSize,
                maxSize: MAX_FILE_SIZE_BYTES_FOR_SUBPLEBBIT_IPFS,
                recordToPublishRaw,
                address: this.address
            });
            log.error(
                `Local subplebbit (${this.address}) produced a record that is too large (${recordSize.toFixed(2)}MB). Maximum size is 1MB.`,
                error
            );
            this.emit("error", error);
            throw error;
        }

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

        const verificationOpts = {
            subplebbit: recordToPublishRaw,
            subplebbitIpnsName: this.signer.address,
            resolveAuthorAddresses: false,
            clientsManager: this._clientsManager,
            overrideAuthorAddressIfInvalid: false,
            validatePages: this._plebbit.validatePages
        };
        try {
            const validation = await verifySubplebbit(verificationOpts);
            if (!validation.valid) {
                throwWithErrorCode("ERR_LOCAL_SUBPLEBBIT_PRODUCED_INVALID_SIGNATURE", {
                    validation,
                    verificationOpts
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
        commentEditRaw: CommentEditPubsubMessagePublication,
        challengeRequestId: ChallengeRequestMessageType["challengeRequestId"]
    ): Promise<undefined> {
        const log = Logger("plebbit-js:local-subplebbit:storeCommentEdit");
        const strippedOutEditPublication = CommentEditPubsubMessagePublicationWithFlexibleAuthorSchema.strip().parse(commentEditRaw); // we strip out here so we don't store any extra props in commentedits table
        const commentToBeEdited = await this._dbHandler.queryComment(commentEditRaw.commentCid, undefined); // We assume commentToBeEdited to be defined because we already tested for its existence above
        if (!commentToBeEdited) throw Error("The comment to edit doesn't exist"); // unlikely error to happen, but always a good idea to verify
        const editSignedByOriginalAuthor = commentEditRaw.signature.publicKey === commentToBeEdited.signature.publicKey;

        const authorSignerAddress = await getPlebbitAddressFromPublicKey(commentEditRaw.signature.publicKey);

        const editTableRow = <CommentEditsTableRow>{
            ...strippedOutEditPublication,
            isAuthorEdit: editSignedByOriginalAuthor,
            authorSignerAddress
        };

        const extraPropsInEdit = remeda.difference(
            remeda.keys.strict(commentEditRaw),
            remeda.keys.strict(CommentEditPubsubMessagePublicationSchema.shape)
        );
        if (extraPropsInEdit.length > 0) {
            log("Found extra props on CommentEdit", extraPropsInEdit, "Will be adding them to extraProps column");
            editTableRow.extraProps = remeda.pick(commentEditRaw, extraPropsInEdit);
        }

        await this._dbHandler.insertCommentEdit(editTableRow);
        log(`Inserted new Comment Edit in DB`, remeda.omit(commentEditRaw, ["signature"]));
    }

    private async storeCommentModeration(
        commentModRaw: CommentModerationPubsubMessagePublication,
        challengeRequestId: ChallengeRequestMessageType["challengeRequestId"]
    ): Promise<undefined> {
        const log = Logger("plebbit-js:local-subplebbit:storeCommentModeration");
        const strippedOutModPublication = CommentModerationPubsubMessagePublicationSchema.strip().parse(commentModRaw); // we strip out here so we don't store any extra props in commentedits table
        const commentToBeEdited = await this._dbHandler.queryComment(commentModRaw.commentCid, undefined); // We assume commentToBeEdited to be defined because we already tested for its existence above
        if (!commentToBeEdited) throw Error("The comment to edit doesn't exist"); // unlikely error to happen, but always a good idea to verify

        const modSignerAddress = await getPlebbitAddressFromPublicKey(commentModRaw.signature.publicKey);

        const modTableRow = <CommentModerationsTableRowInsert>{
            ...strippedOutModPublication,
            modSignerAddress
        };

        const extraPropsInMod = remeda.difference(
            remeda.keys.strict(commentModRaw),
            remeda.keys.strict(CommentModerationPubsubMessagePublicationSchema.shape)
        );
        if (extraPropsInMod.length > 0) {
            log("Found extra props on CommentModeration", extraPropsInMod, "Will be adding them to extraProps column");
            modTableRow.extraProps = remeda.pick(commentModRaw, extraPropsInMod);
        }

        await this._dbHandler.insertCommentModeration(modTableRow);
        log(`Inserted new CommentModeration in DB`, remeda.omit(modTableRow, ["signature"]));

        if (modTableRow.commentModeration.purged) {
            log(
                "commentModeration.purged=true, and therefore will delete the post/comment and all its reply tree from the db as well as unpin the cids from ipfs",
                "comment cid is",
                modTableRow.commentCid
            );

            const cidsToPurgeOffIpfsNode = await this._dbHandler.purgeComment(modTableRow.commentCid);

            const purgedCids = cidsToPurgeOffIpfsNode.filter((ipfsPath) => !ipfsPath.startsWith("/"));
            purgedCids.forEach((cid) => this._cidsToUnPin.add(cid));

            const purgedMfsPaths = cidsToPurgeOffIpfsNode.filter((ipfsPath) => ipfsPath.startsWith("/"));

            purgedMfsPaths.forEach((path) => this._mfsPathsToRemove.add(path));

            await this._unpinStaleCidsAndRemoveUnneededMfsPaths();

            await this._cleanUpIpfsRepoRarely(true);

            log(
                "Purged comment",
                modTableRow.commentCid,
                "and its comment and comment update children",
                cidsToPurgeOffIpfsNode.length,
                "out of DB and IPFS"
            );

            this._subplebbitUpdateTrigger = true; // force plebbit-js to produce a new subplebbit.posts and an IPNS with no purged comments
            await this._updateDbInternalState({ _subplebbitUpdateTrigger: this._subplebbitUpdateTrigger });
        }
    }

    private async storeVote(
        newVoteProps: VotePubsubMessagePublication,
        challengeRequestId: ChallengeRequestMessageType["challengeRequestId"]
    ) {
        const log = Logger("plebbit-js:local-subplebbit:storeVote");

        const authorSignerAddress = await getPlebbitAddressFromPublicKey(newVoteProps.signature.publicKey);
        await this._dbHandler.deleteVote(authorSignerAddress, newVoteProps.commentCid);
        const voteTableRow = <VotesTableRow>{
            ...remeda.pick(newVoteProps, ["vote", "commentCid", "protocolVersion", "timestamp"]),
            authorSignerAddress
        };
        const extraPropsInVote = remeda.difference(
            remeda.keys.strict(newVoteProps),
            remeda.keys.strict(VotePubsubMessagePublicationSchema.shape)
        );
        if (extraPropsInVote.length > 0) {
            log("Found extra props on Vote", extraPropsInVote, "Will be adding them to extraProps column");
            voteTableRow.extraProps = remeda.pick(newVoteProps, extraPropsInVote);
        }

        await this._dbHandler.insertVote(voteTableRow);
        log(`inserted new vote in DB`, voteTableRow);
        return undefined;
    }

    private async storeSubplebbitEditPublication(
        editProps: SubplebbitEditPubsubMessagePublication,
        challengeRequestId: ChallengeRequestMessageType["challengeRequestId"]
    ) {
        const log = Logger("plebbit-js:local-subplebbit:storeSubplebbitEdit");

        const authorSignerAddress = await getPlebbitAddressFromPublicKey(editProps.signature.publicKey);
        log(
            "Received subplebbit edit",
            editProps.subplebbitEdit,
            "from author",
            editProps.author.address,
            "with signer address",
            authorSignerAddress,
            "Will be using these props to edit the sub props"
        );

        const propsAfterEdit = remeda.pick(this, remeda.keys.strict(editProps.subplebbitEdit));
        log("Current props from sub edit (not edited yet)", propsAfterEdit);
        lodashDeepMerge(propsAfterEdit, editProps.subplebbitEdit);
        await this.edit(propsAfterEdit);
        return undefined;
    }

    private isPublicationReply(publication: CommentPubsubMessagePublication): publication is ReplyPubsubMessageWithSubplebbitAuthor {
        return Boolean(publication.parentCid);
    }

    private isPublicationPost(publication: CommentPubsubMessagePublication): publication is PostPubsubMessageWithSubplebbitAuthor {
        return !publication.parentCid;
    }

    private async _calculateLinkProps(
        link: CommentPubsubMessagePublication["link"]
    ): Promise<Pick<CommentIpfsType, "thumbnailUrl" | "thumbnailUrlWidth" | "thumbnailUrlHeight"> | undefined> {
        if (!link || !this.settings?.fetchThumbnailUrls) return undefined;
        return getThumbnailUrlOfLink(link, this, this.settings.fetchThumbnailUrlsProxyUrl);
    }

    private async _calculatePostProps(
        comment: CommentPubsubMessagePublication,
        challengeRequestId: ChallengeRequestMessageType["challengeRequestId"]
    ): Promise<Pick<CommentIpfsType, "previousCid" | "depth">> {
        const trx = await this._dbHandler.createTransaction(challengeRequestId.toString());
        const previousCid = (await this._dbHandler.queryLatestPostCid(trx))?.cid;
        await this._dbHandler.commitTransaction(challengeRequestId.toString());
        return { depth: 0, previousCid };
    }

    private async _calculateReplyProps(
        comment: CommentPubsubMessagePublication,
        challengeRequestId: ChallengeRequestMessageType["challengeRequestId"]
    ): Promise<Pick<CommentIpfsType, "previousCid" | "depth" | "postCid">> {
        if (!comment.parentCid) throw Error("Reply has to have parentCid");

        const trx = await this._dbHandler.createTransaction(challengeRequestId.toString());
        const commentsUnderParent = await this._dbHandler.queryCommentsUnderComment(comment.parentCid, trx);
        const parent = await this._dbHandler.queryComment(comment.parentCid, trx);
        await this._dbHandler.commitTransaction(challengeRequestId.toString());

        if (!parent) throw Error("Failed to find parent of reply");

        return {
            depth: parent.depth + 1,
            postCid: parent.postCid,
            previousCid: commentsUnderParent[0]?.cid
        };
    }

    private async storeComment(
        commentPubsub: CommentPubsubMessagePublication,
        request: DecryptedChallengeRequestMessageType
    ): Promise<{ comment: CommentIpfsType; cid: CommentUpdateType["cid"] }> {
        const log = Logger("plebbit-js:local-subplebbit:handleChallengeExchange:storeComment");

        const commentIpfs = <CommentIpfsType>{
            ...commentPubsub,
            ...(await this._calculateLinkProps(commentPubsub.link)),
            ...(this.isPublicationPost(commentPubsub) && (await this._calculatePostProps(commentPubsub, request.challengeRequestId))),
            ...(this.isPublicationReply(commentPubsub) && (await this._calculateReplyProps(commentPubsub, request.challengeRequestId)))
        };

        const file = await this._clientsManager.getDefaultIpfs()._client.add(deterministicStringify(commentIpfs));

        const commentCid = file.path;
        const postCid = commentIpfs.postCid || commentCid; // if postCid is not defined, then we're adding a post to IPFS, so its own cid is the postCid
        const authorSignerAddress = await getPlebbitAddressFromPublicKey(commentPubsub.signature.publicKey);

        const strippedOutCommentIpfs = CommentIpfsSchema.strip().parse(commentIpfs); // remove unknown props
        const commentRow = <CommentsTableRow>{
            ...strippedOutCommentIpfs,
            cid: commentCid,
            postCid,
            authorSignerAddress
        };

        const unknownProps = remeda.difference(
            remeda.keys.strict(commentPubsub),
            remeda.keys.strict(CommentPubsubMessagePublicationSchema.shape)
        );

        if (unknownProps.length > 0) {
            log("Found extra props on Comment", unknownProps, "Will be adding them to extraProps column");
            commentRow.extraProps = remeda.pick(commentPubsub, unknownProps);
        }
        const trxForInsert = await this._dbHandler.createTransaction(request.challengeRequestId.toString());
        try {
            // This would throw for extra props
            await this._dbHandler.insertComment(commentRow, trxForInsert);
            // Everything below here is for verification purposes
            // The goal here is to find out if storing comment props in DB causes them to change in any way
            const commentInDb = await this._dbHandler.queryComment(commentRow.cid, trxForInsert);
            if (!commentInDb) throw Error("Failed to query the comment we just inserted");
            // The line below will fail with extra props

            const commentIpfsRecreated = <CommentIpfsType>remeda.pick(commentInDb, remeda.keys.strict(commentIpfs));
            const validity = await verifyCommentIpfs({
                comment: removeUndefinedValuesRecursively(commentIpfsRecreated),
                resolveAuthorAddresses: this._plebbit.resolveAuthorAddresses,
                clientsManager: this._clientsManager,
                overrideAuthorAddressIfInvalid: false,
                calculatedCommentCid: commentCid
            });
            if (!validity.valid)
                throw Error(
                    "There is a problem with how query rows are processed in DB, which is causing an invalid signature. This is a critical Error"
                );
            const calculatedHash = await calculateIpfsHash(deterministicStringify(commentIpfsRecreated));
            if (calculatedHash !== commentInDb.cid) throw Error("There is a problem with db processing comment rows, the cids don't match");
        } catch (e) {
            log.error(
                `Failed to insert comment (${commentCid}) to db due to error, rolling back on inserting the comment. This is a critical error`,
                e,
                "Comment table row is",
                commentRow
            );
            await this._dbHandler.rollbackTransaction(request.challengeRequestId.toString());
            throw e;
        }

        await this._dbHandler.commitTransaction(request.challengeRequestId.toString());

        log(`New comment has been inserted into DB`, remeda.omit(commentRow, ["signature"]));

        return { comment: commentIpfs, cid: commentCid };
    }

    private async storePublication(request: DecryptedChallengeRequestMessageType) {
        if (request.vote) return this.storeVote(request.vote, request.challengeRequestId);
        else if (request.commentEdit) return this.storeCommentEdit(request.commentEdit, request.challengeRequestId);
        else if (request.commentModeration) return this.storeCommentModeration(request.commentModeration, request.challengeRequestId);
        else if (request.comment) return this.storeComment(request.comment, request);
        else if (request.subplebbitEdit) return this.storeSubplebbitEditPublication(request.subplebbitEdit, request.challengeRequestId);
        else throw Error("Don't know how to store this publication" + request);
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
        if (request.comment)
            validity = await verifyCommentPubsubMessage(request.comment, this._plebbit.resolveAuthorAddresses, this._clientsManager, false);
        else if (request.commentEdit)
            validity = await verifyCommentEdit(request.commentEdit, this._plebbit.resolveAuthorAddresses, this._clientsManager, false);
        else if (request.vote) validity = await verifyVote(request.vote, this._plebbit.resolveAuthorAddresses, this._clientsManager, false);
        else if (request.commentModeration)
            validity = await verifyCommentModeration(
                request.commentModeration,
                this._plebbit.resolveAuthorAddresses,
                this._clientsManager,
                false
            );
        else if (request.subplebbitEdit)
            validity = await verifySubplebbitEdit(
                request.subplebbitEdit,
                this._plebbit.resolveAuthorAddresses,
                this._clientsManager,
                false
            );
        else throw Error("Can't detect the type of publication");

        if (!validity.valid) {
            await this._publishFailedChallengeVerification({ reason: validity.reason }, request.challengeRequestId);
            throwWithErrorCode(getErrorCodeFromMessage(validity.reason), { request, validity });
        }
    }

    private async _publishChallenges(
        challenges: Omit<Challenge, "verify">[],
        request: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor
    ) {
        const log = Logger("plebbit-js:local-subplebbit:_publishChallenges");
        const toEncryptChallenge = <DecryptedChallenge>{ challenges };
        const toSignChallenge: Omit<ChallengeMessageType, "signature"> = cleanUpBeforePublishing({
            type: "CHALLENGE",
            protocolVersion: env.PROTOCOL_VERSION,
            userAgent: this._plebbit.userAgent,
            challengeRequestId: request.challengeRequestId,
            encrypted: await encryptEd25519AesGcmPublicKeyBuffer(
                deterministicStringify(toEncryptChallenge),
                this.signer.privateKey,
                request.signature.publicKey
            ),
            timestamp: timestamp()
        });

        const challengeMessage = <ChallengeMessageType>{
            ...toSignChallenge,
            signature: await signChallengeMessage(toSignChallenge, this.signer)
        };

        this._clientsManager.updatePubsubState("publishing-challenge", undefined);

        await this._clientsManager.pubsubPublish(this.pubsubTopicWithfallback(), challengeMessage);
        log(
            `Subplebbit ${this.address} published ${challengeMessage.type} over pubsub: `,
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
            userAgent: this._plebbit.userAgent,
            protocolVersion: env.PROTOCOL_VERSION,
            timestamp: timestamp()
        });

        const challengeVerification = <ChallengeVerificationMessageType>{
            ...toSignVerification,
            signature: await signChallengeVerification(toSignVerification, this.signer)
        };

        this._clientsManager.updatePubsubState("publishing-challenge-verification", undefined);
        log(`Will publish ${challengeVerification.type} over pubsub:`, remeda.omit(toSignVerification, ["challengeRequestId"]));

        await this._clientsManager.pubsubPublish(this.pubsubTopicWithfallback(), challengeVerification);
        this._clientsManager.updatePubsubState("waiting-challenge-requests", undefined);

        this.emit("challengeverification", challengeVerification);
        this._ongoingChallengeExchanges.delete(challengeRequestId.toString());
        this._cleanUpChallengeAnswerPromise(challengeRequestId.toString());
    }

    private async _storePublicationAndEncryptForChallengeVerification(
        request: DecryptedChallengeRequestMessageType
    ): Promise<(DecryptedChallengeVerification & Required<Pick<DecryptedChallengeVerificationMessageType, "encrypted">>) | undefined> {
        const commentAfterAddingToIpfs = await this.storePublication(request);
        if (!commentAfterAddingToIpfs) return undefined;
        const authorSignerAddress = await getPlebbitAddressFromPublicKey(commentAfterAddingToIpfs.comment.signature.publicKey);
        const authorSubplebbit = await this._dbHandler.querySubplebbitAuthor(authorSignerAddress);

        const commentUpdateOfVerificationNoSignature = <Omit<DecryptedChallengeVerification["commentUpdate"], "signature">>(
            cleanUpBeforePublishing({
                author: { subplebbit: authorSubplebbit },
                cid: commentAfterAddingToIpfs.cid,
                protocolVersion: env.PROTOCOL_VERSION
            })
        );
        const commentUpdate = <DecryptedChallengeVerification["commentUpdate"]>{
            ...commentUpdateOfVerificationNoSignature,
            signature: await signCommentUpdateForChallengeVerification(commentUpdateOfVerificationNoSignature, this.signer)
        };

        const toEncrypt = <DecryptedChallengeVerification>{ comment: commentAfterAddingToIpfs.comment, commentUpdate };

        const encrypted = await encryptEd25519AesGcmPublicKeyBuffer(
            deterministicStringify(toEncrypt),
            this.signer.privateKey,
            request.signature.publicKey
        );

        return { ...toEncrypt, encrypted };
    }

    private async _publishChallengeVerification(
        challengeResult: Pick<ChallengeVerificationMessageType, "challengeErrors" | "challengeSuccess" | "reason">,
        request: DecryptedChallengeRequestMessageType
    ) {
        const log = Logger("plebbit-js:local-subplebbit:_publishChallengeVerification");
        if (!challengeResult.challengeSuccess) return this._publishFailedChallengeVerification(challengeResult, request.challengeRequestId);
        else {
            // Challenge has passed, we store the publication (except if there's an issue with the publication)
            const toEncrypt = await this._storePublicationAndEncryptForChallengeVerification(request);

            const toSignMsg: Omit<ChallengeVerificationMessageType, "signature"> = cleanUpBeforePublishing({
                type: "CHALLENGEVERIFICATION",
                challengeRequestId: request.challengeRequestId,
                challengeSuccess: true,
                reason: undefined,
                encrypted: toEncrypt?.encrypted, // could be undefined
                challengeErrors: challengeResult.challengeErrors,
                userAgent: this._plebbit.userAgent,
                protocolVersion: env.PROTOCOL_VERSION,
                timestamp: timestamp()
            });
            const challengeVerification = <ChallengeVerificationMessageType>{
                ...toSignMsg,
                signature: await signChallengeVerification(toSignMsg, this.signer)
            };

            this._clientsManager.updatePubsubState("publishing-challenge-verification", undefined);

            await this._clientsManager.pubsubPublish(this.pubsubTopicWithfallback(), challengeVerification);

            this._clientsManager.updatePubsubState("waiting-challenge-requests", undefined);

            const objectToEmit = <DecryptedChallengeVerificationMessageType>{ ...challengeVerification, ...toEncrypt };
            this.emit("challengeverification", objectToEmit);
            this._ongoingChallengeExchanges.delete(request.challengeRequestId.toString());
            this._cleanUpChallengeAnswerPromise(request.challengeRequestId.toString());
            log(
                `Published ${challengeVerification.type} over pubsub:`,
                remeda.omit(objectToEmit, ["signature", "encrypted", "challengeRequestId"])
            );
        }
    }

    private async _isPublicationAuthorPartOfRoles(
        publication: Pick<CommentModerationPubsubMessagePublication, "author" | "signature">,
        rolesToCheckAgainst: SubplebbitRole["role"][]
    ): Promise<boolean> {
        if (!this.roles) return false;
        // is the author of publication a moderator?
        const signerAddress = await getPlebbitAddressFromPublicKey(publication.signature.publicKey);
        if (rolesToCheckAgainst.includes(this.roles[signerAddress]?.role)) return true;

        if (this._plebbit.resolveAuthorAddresses) {
            const resolvedSignerAddress = isStringDomain(publication.author.address)
                ? await this._plebbit.resolveAuthorAddress(publication.author.address)
                : publication.author.address;
            if (resolvedSignerAddress !== signerAddress) return false;
            if (rolesToCheckAgainst.includes(this.roles[publication.author.address]?.role)) return true;
            if (rolesToCheckAgainst.includes(this.roles[resolvedSignerAddress]?.role)) return true;
        }
        return false;
    }

    private async _checkPublicationValidity(
        request: DecryptedChallengeRequestMessageType,
        publication: PublicationFromDecryptedChallengeRequest,
        authorSubplebbit?: PublicationWithSubplebbitAuthorFromDecryptedChallengeRequest["author"]["subplebbit"]
    ): Promise<messages | undefined> {
        const log = Logger("plebbit-js:local-subplebbit:handleChallengeRequest:checkPublicationValidity");

        if (publication.subplebbitAddress !== this.address) return messages.ERR_PUBLICATION_INVALID_SUBPLEBBIT_ADDRESS;

        if (publication.timestamp <= timestamp() - 5 * 60 || publication.timestamp >= timestamp() + 5 * 60)
            return messages.ERR_PUBLICATION_TIMESTAMP_IS_NOT_IN_PROPER_RANGE;

        if (typeof authorSubplebbit?.banExpiresAt === "number" && authorSubplebbit.banExpiresAt > timestamp())
            return messages.ERR_AUTHOR_IS_BANNED;

        if (remeda.intersection(remeda.keys.strict(publication.author), AuthorReservedFields).length > 0)
            return messages.ERR_PUBLICATION_AUTHOR_HAS_RESERVED_FIELD;

        if ("commentCid" in publication || "parentCid" in publication) {
            // vote or reply or commentEdit or commentModeration
            // not post though
            //@ts-expect-error
            const parentCid: string | undefined = publication.parentCid || publication.commentCid;

            if (typeof parentCid !== "string") return messages.ERR_SUB_PUBLICATION_PARENT_CID_NOT_DEFINED;

            const parent = await this._dbHandler.queryComment(parentCid);
            if (!parent) return messages.ERR_PUBLICATION_PARENT_DOES_NOT_EXIST_IN_SUB;

            const parentFlags = await this._dbHandler.queryCommentFlagsSetByMod(parentCid);

            if (parentFlags.removed && !request.commentModeration)
                // not allowed to vote or reply under removed comments
                return messages.ERR_SUB_PUBLICATION_PARENT_HAS_BEEN_REMOVED;

            const isParentDeletedQueryRes = await this._dbHandler.queryAuthorEditDeleted(parentCid);

            if (isParentDeletedQueryRes?.deleted && !request.commentModeration) return messages.ERR_SUB_PUBLICATION_PARENT_HAS_BEEN_DELETED; // not allowed to vote or reply under deleted comments

            const postFlags = await this._dbHandler.queryCommentFlagsSetByMod(parent.postCid);

            if (postFlags.removed && !request.commentModeration) return messages.ERR_SUB_PUBLICATION_POST_HAS_BEEN_REMOVED;

            const isPostDeletedQueryRes = await this._dbHandler.queryAuthorEditDeleted(parent.postCid);

            if (isPostDeletedQueryRes?.deleted && !request.commentModeration) return messages.ERR_SUB_PUBLICATION_POST_HAS_BEEN_DELETED;

            if (postFlags.locked && !request.commentModeration) return messages.ERR_SUB_PUBLICATION_POST_IS_LOCKED;

            if (parent.timestamp > publication.timestamp) return messages.ERR_SUB_COMMENT_TIMESTAMP_IS_EARLIER_THAN_PARENT;
        }

        // Reject publications if their size is over 40kb
        const publicationKilobyteSize = Buffer.byteLength(JSON.stringify(publication)) / 1000;

        if (publicationKilobyteSize > 40) return messages.ERR_REQUEST_PUBLICATION_OVER_ALLOWED_SIZE;

        if (request.comment) {
            const commentPublication = request.comment;
            if (remeda.intersection(remeda.keys.strict(commentPublication), CommentPubsubMessageReservedFields).length > 0)
                return messages.ERR_COMMENT_HAS_RESERVED_FIELD;
            if (this.features?.requirePostLinkIsMedia && commentPublication.link && !isLinkOfMedia(commentPublication.link))
                return messages.ERR_POST_LINK_IS_NOT_OF_MEDIA;

            if (commentPublication.parentCid && !commentPublication.postCid) return messages.ERR_REPLY_HAS_NOT_DEFINED_POST_CID;

            if (commentPublication.parentCid) {
                // query parents, and make sure commentPublication.postCid is the final parent
                const parentsOfComment = await this._dbHandler.queryParentsCids({ parentCid: commentPublication.parentCid });
                if (parentsOfComment[parentsOfComment.length - 1].cid !== commentPublication.postCid)
                    return messages.ERR_REPLY_POST_CID_IS_NOT_PARENT_OF_REPLY;
            }

            const commentInDb = await this._dbHandler.queryCommentBySignatureEncoded(commentPublication.signature.signature);
            if (commentInDb) return messages.ERR_DUPLICATE_COMMENT;
        } else if (request.vote) {
            const votePublication = request.vote;
            if (remeda.intersection(VotePubsubReservedFields, remeda.keys.strict(votePublication)).length > 0)
                return messages.ERR_VOTE_HAS_RESERVED_FIELD;
            if (this.features?.noUpvotes && votePublication.vote === 1) return messages.ERR_NOT_ALLOWED_TO_PUBLISH_UPVOTES;
            if (this.features?.noDownvotes && votePublication.vote === -1) return messages.ERR_NOT_ALLOWED_TO_PUBLISH_DOWNVOTES;

            const commentToVoteOn = await this._dbHandler.queryComment(request.vote.commentCid)!;

            if (this.features?.noPostDownvotes && commentToVoteOn!.depth === 0 && votePublication.vote === -1)
                return messages.ERR_NOT_ALLOWED_TO_PUBLISH_POST_DOWNVOTES;
            if (this.features?.noPostUpvotes && commentToVoteOn!.depth === 0 && votePublication.vote === 1)
                return messages.ERR_NOT_ALLOWED_TO_PUBLISH_POST_UPVOTES;

            if (this.features?.noReplyDownvotes && commentToVoteOn!.depth > 0 && votePublication.vote === -1)
                return messages.ERR_NOT_ALLOWED_TO_PUBLISH_REPLY_DOWNVOTES;
            if (this.features?.noReplyUpvotes && commentToVoteOn!.depth > 0 && votePublication.vote === 1)
                return messages.ERR_NOT_ALLOWED_TO_PUBLISH_REPLY_UPVOTES;

            const voteAuthorSignerAddress = await getPlebbitAddressFromPublicKey(votePublication.signature.publicKey);
            const previousVote = await this._dbHandler.queryVote(commentToVoteOn!.cid, voteAuthorSignerAddress);
            if (!previousVote && votePublication.vote === 0) return messages.ERR_THERE_IS_NO_PREVIOUS_VOTE_TO_CANCEL;
        } else if (request.commentModeration) {
            const commentModerationPublication = request.commentModeration;
            if (remeda.intersection(CommentModerationReservedFields, remeda.keys.strict(commentModerationPublication)).length > 0)
                return messages.ERR_COMMENT_MODERATION_HAS_RESERVED_FIELD;

            const isAuthorMod = await this._isPublicationAuthorPartOfRoles(commentModerationPublication, ["owner", "moderator", "admin"]);

            if (!isAuthorMod) return messages.ERR_COMMENT_MODERATION_ATTEMPTED_WITHOUT_BEING_MODERATOR;

            const commentToBeEdited = await this._dbHandler.queryComment(commentModerationPublication.commentCid, undefined); // We assume commentToBeEdited to be defined because we already tested for its existence above
            if (!commentToBeEdited) return messages.ERR_COMMENT_MODERATION_NO_COMMENT_TO_EDIT;

            if (isAuthorMod && commentModerationPublication.commentModeration.locked && commentToBeEdited.depth !== 0)
                return messages.ERR_SUB_COMMENT_MOD_CAN_NOT_LOCK_REPLY;
        } else if (request.subplebbitEdit) {
            const subplebbitEdit = request.subplebbitEdit;
            if (remeda.intersection(SubplebbitEditPublicationPubsubReservedFields, remeda.keys.strict(subplebbitEdit)).length > 0)
                return messages.ERR_SUBPLEBBIT_EDIT_HAS_RESERVED_FIELD;

            if (subplebbitEdit.subplebbitEdit.roles || subplebbitEdit.subplebbitEdit.address) {
                const isAuthorOwner = await this._isPublicationAuthorPartOfRoles(subplebbitEdit, ["owner"]);
                if (!isAuthorOwner) return messages.ERR_SUBPLEBBIT_EDIT_ATTEMPTED_TO_MODIFY_OWNER_EXCLUSIVE_PROPS;
            }

            const isAuthorOwnerOrAdmin = await this._isPublicationAuthorPartOfRoles(subplebbitEdit, ["owner", "admin"]);
            if (!isAuthorOwnerOrAdmin) {
                return messages.ERR_SUBPLEBBIT_EDIT_ATTEMPTED_TO_MODIFY_SUB_WITHOUT_BEING_OWNER_OR_ADMIN;
            }

            if (
                remeda.difference(remeda.keys.strict(subplebbitEdit.subplebbitEdit), remeda.keys.strict(SubplebbitIpfsSchema.shape))
                    .length > 0
            ) {
                // should only be allowed to modify public props from SubplebbitIpfs
                // shouldn't be able to modify settings for example
                return messages.ERR_SUBPLEBBIT_EDIT_ATTEMPTED_TO_NON_PUBLIC_PROPS;
            }
        } else if (request.commentEdit) {
            const commentEditPublication = request.commentEdit;
            if (remeda.intersection(CommentEditReservedFields, remeda.keys.strict(commentEditPublication)).length > 0)
                return messages.ERR_COMMENT_EDIT_HAS_RESERVED_FIELD;

            const commentToBeEdited = await this._dbHandler.queryComment(commentEditPublication.commentCid, undefined); // We assume commentToBeEdited to be defined because we already tested for its existence above
            if (!commentToBeEdited) return messages.ERR_COMMENT_EDIT_NO_COMMENT_TO_EDIT;
            const editSignedByOriginalAuthor = commentEditPublication.signature.publicKey === commentToBeEdited.signature.publicKey;

            if (!editSignedByOriginalAuthor) return messages.ERR_COMMENT_EDIT_CAN_NOT_EDIT_COMMENT_IF_NOT_ORIGINAL_AUTHOR;
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
                { reason: messages.ERR_REQUEST_ENCRYPTED_IS_INVALID_JSON_AFTER_DECRYPTION },
                request.challengeRequestId
            );
            throw e;
        }

        const parseRes = DecryptedChallengeRequestSchema.passthrough().safeParse(decryptedJson);
        if (!parseRes.success) {
            await this._publishFailedChallengeVerification(
                { reason: messages.ERR_REQUEST_ENCRYPTED_HAS_INVALID_SCHEMA_AFTER_DECRYPTING },
                request.challengeRequestId
            );

            throw new PlebbitError("ERR_REQUEST_ENCRYPTED_HAS_INVALID_SCHEMA_AFTER_DECRYPTING", {
                decryptedJson,
                schemaError: parseRes.error
            });
        }

        return decryptedJson;
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

        const publicationFieldNames = remeda.keys.strict(DecryptedChallengeRequestPublicationSchema.shape);
        let publication: PublicationFromDecryptedChallengeRequest;
        try {
            publication = derivePublicationFromChallengeRequest(decryptedRequest);
        } catch {
            return this._publishFailedChallengeVerification(
                { reason: messages.ERR_CHALLENGE_REQUEST_ENCRYPTED_HAS_NO_PUBLICATION_AFTER_DECRYPTING },
                request.challengeRequestId
            );
        }
        let publicationCount = 0;
        publicationFieldNames.forEach((pubField) => {
            if (pubField in decryptedRequest) publicationCount++;
        });
        if (publicationCount > 1)
            return this._publishFailedChallengeVerification(
                { reason: messages.ERR_CHALLENGE_REQUEST_ENCRYPTED_HAS_MULTIPLE_PUBLICATIONS_AFTER_DECRYPTING },
                request.challengeRequestId
            );

        const authorSignerAddress = await getPlebbitAddressFromPublicKey(publication.signature.publicKey);

        const subplebbitAuthor = await this._dbHandler.querySubplebbitAuthor(authorSignerAddress);
        const decryptedRequestMsg = <DecryptedChallengeRequestMessageType>{ ...request, ...decryptedRequest };
        const decryptedRequestWithSubplebbitAuthor = <DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor>(
            remeda.clone(decryptedRequestMsg)
        );

        // set author.subplebbit for all publication fields (vote, comment, commentEdit, commentModeration) if they exist
        publicationFieldNames.forEach((pubField) => {
            if (pubField in decryptedRequestWithSubplebbitAuthor && decryptedRequestWithSubplebbitAuthor[pubField])
                decryptedRequestWithSubplebbitAuthor[pubField].author.subplebbit = subplebbitAuthor;
        });

        try {
            await this._respondWithErrorIfSignatureOfPublicationIsInvalid(decryptedRequestMsg); // This function will throw an error if signature is invalid
        } catch (e) {
            log.error(
                "Signature of challengerequest.publication is invalid, emitting an error event and aborting the challenge exchange",
                e
            );
            this.emit("challengerequest", decryptedRequestWithSubplebbitAuthor);
            return;
        }

        log.trace("Received a valid challenge request", decryptedRequestWithSubplebbitAuthor);

        this.emit("challengerequest", decryptedRequestWithSubplebbitAuthor);

        // Check publication props validity
        const publicationInvalidityReason = await this._checkPublicationValidity(decryptedRequestMsg, publication, subplebbitAuthor);
        if (publicationInvalidityReason)
            return this._publishFailedChallengeVerification({ reason: publicationInvalidityReason }, request.challengeRequestId);

        const answerPromiseKey = decryptedRequestWithSubplebbitAuthor.challengeRequestId.toString();
        const getChallengeAnswers: GetChallengeAnswers = async (challenges) => {
            // ...get challenge answers from user. e.g.:
            // step 1. subplebbit publishes challenge pubsub message with `challenges` provided in argument of `getChallengeAnswers`
            // step 2. subplebbit waits for challenge answer pubsub message with `challengeAnswers` and then returns `challengeAnswers`
            await this._publishChallenges(challenges, decryptedRequestWithSubplebbitAuthor);
            const challengeAnswerPromise = new Promise<DecryptedChallengeAnswer["challengeAnswers"]>((resolve, reject) =>
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
            return parseDecryptedChallengeAnswerWithPlebbitErrorIfItFails(parsedJson);
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
            return this._publishFailedChallengeVerification(
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

        const pubsubSchemas = [
            ChallengeRequestMessageSchema.passthrough(),
            ChallengeMessageSchema.passthrough(),
            ChallengeAnswerMessageSchema.passthrough(),
            ChallengeVerificationMessageSchema.passthrough()
        ];

        let parsedPubsubMsg:
            | ChallengeRequestMessageType
            | ChallengeMessageType
            | ChallengeAnswerMessageType
            | ChallengeVerificationMessageType
            | undefined;
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
        } else if (parsedPubsubMsg.type === "CHALLENGEREQUEST") {
            try {
                await this.handleChallengeRequest(parsedPubsubMsg);
            } catch (e) {
                log.error(`Failed to process challenge request message received at (${timeReceived})`, e);
                await this._dbHandler.rollbackTransaction(parsedPubsubMsg.challengeRequestId.toString());
            }
        } else if (parsedPubsubMsg.type === "CHALLENGEANSWER") {
            try {
                await this.handleChallengeAnswer(parsedPubsubMsg);
            } catch (e) {
                log.error(`Failed to process challenge answer message received at (${timeReceived})`, e);
                await this._dbHandler.rollbackTransaction(parsedPubsubMsg.challengeRequestId.toString());
            }
        }
    }

    private _calculatePostUpdatePathForExistingCommentUpdate(timestampRange: number, currentIpfsPath: string) {
        const pathParts = currentIpfsPath.split("/");
        return ["/" + this.address, "postUpdates", timestampRange, ...pathParts.slice(4)].join("/");
    }

    private async _calculateLocalMfsPathForCommentUpdate(dbComment: CommentsTableRow, storedCommentUpdate?: CommentUpdatesRow) {
        // TODO Can optimize the call below by only asking for timestamp field
        const postTimestamp =
            dbComment.depth === 0 ? dbComment.timestamp : (await this._dbHandler.queryComment(dbComment.postCid))?.timestamp;
        if (typeof postTimestamp !== "number") throw Error("failed to query the comment in db to look for its postTimestamp");
        const timestampRange = this._postUpdatesBuckets.find((bucket) => timestamp() - bucket <= postTimestamp);
        if (typeof timestampRange !== "number") throw Error("Failed to find timestamp range for comment update");
        if (storedCommentUpdate?.localMfsPath)
            return this._calculatePostUpdatePathForExistingCommentUpdate(timestampRange, storedCommentUpdate.localMfsPath);
        else {
            const parentsCids = (await this._dbHandler.queryParentsCids(dbComment)).map((parent) => parent.cid).reverse();
            return ["/" + this.address, "postUpdates", timestampRange, ...parentsCids, dbComment.cid, "update"].join("/");
        }
    }

    private async _writeCommentUpdateToDatabase(
        newCommentUpdate: CommentUpdatesRow | CommentUpdateType,
        commentUpdateCid: string,
        ipfsPath: string
    ) {
        const log = Logger("plebbit-js:local-subplebibt:_writeCommentUpdateToDatabase");
        // TODO need to exclude reply.replies here
        const row = <CommentUpdatesRow>{
            ...newCommentUpdate,
            localMfsPath: ipfsPath,
            updateCid: commentUpdateCid,
            publishedToPostUpdatesMFS: false
        };
        await this._dbHandler.upsertCommentUpdate(row);
        log.trace("Wrote comment update of comment", newCommentUpdate.cid, "to database successfully with cid", commentUpdateCid);
        return row;
    }

    private async _calculateNewCommentUpdateAndWriteToDb(
        comment: CommentsTableRow
    ): Promise<CommentUpdatesRow & { commentUpdateRecordString: string }> {
        const log = Logger("plebbit-js:local-subplebbit:_calculateNewCommentUpdateAndWriteToFilesystemAndDb");

        // If we're here that means we're gonna calculate the new update and publish it
        log.trace(`Attempting to publish new CommentUpdate for comment (${comment.cid}) on subplebbit`, this.address);

        // This comment will have the local new CommentUpdate, which we will publish to IPFS fiels
        // It includes new author.subplebbit as well as updated values in CommentUpdate (except for replies field)
        const [calculatedCommentUpdate, storedCommentUpdate] = await Promise.all([
            this._dbHandler.queryCalculatedCommentUpdate(comment),
            this._dbHandler.queryStoredCommentUpdate(comment)
        ]);

        const newUpdatedAt = storedCommentUpdate?.updatedAt === timestamp() ? timestamp() + 1 : timestamp();

        const commentUpdatePriorToSigning: Omit<CommentUpdateType, "signature"> = {
            ...cleanUpBeforePublishing({
                ...calculatedCommentUpdate,
                updatedAt: newUpdatedAt,
                protocolVersion: env.PROTOCOL_VERSION
            })
        };

        const commentUpdateSize = Buffer.byteLength(JSON.stringify(commentUpdatePriorToSigning), "utf8");

        const repliesAvailableSize =
            MAX_FILE_SIZE_BYTES_FOR_COMMENT_UPDATE - commentUpdateSize - calculateExpectedSignatureSize(commentUpdatePriorToSigning);
        const preloadedRepliesPages = "topAll";

        const generatedRepliesPages = await this._pageGenerator.generateRepliesPages(comment, preloadedRepliesPages, repliesAvailableSize);

        // we have to make sure not clean up submissions of authors by calling cleanUpBeforePublishing
        if (generatedRepliesPages) {
            if ("singlePreloadedPage" in generatedRepliesPages)
                commentUpdatePriorToSigning.replies = { pages: generatedRepliesPages.singlePreloadedPage };
            else if (generatedRepliesPages.pageCids) {
                commentUpdatePriorToSigning.replies = {
                    pageCids: generatedRepliesPages.pageCids,
                    pages: remeda.pick(generatedRepliesPages.pages, [preloadedRepliesPages])
                };
                const newPageCids = remeda.unique(Object.values(generatedRepliesPages.pageCids));
                const pageCidsToUnPin = remeda.unique(
                    Object.values(storedCommentUpdate?.replies?.pageCids || {}).filter((oldPageCid) => !newPageCids.includes(oldPageCid))
                );
                pageCidsToUnPin.forEach((pageCid) => this._cidsToUnPin.add(pageCid));
            }
        }

        const newCommentUpdate: CommentUpdateType = {
            ...commentUpdatePriorToSigning,
            signature: await signCommentUpdate(commentUpdatePriorToSigning, this.signer)
        };

        const newCommentUpdateString = deterministicStringify(newCommentUpdate);
        const commentUpdateCid = await calculateIpfsHash(newCommentUpdateString);

        await this._validateCommentUpdateSignature(newCommentUpdate, comment, log);

        const newLocalMfsPath = await this._calculateLocalMfsPathForCommentUpdate(comment, storedCommentUpdate);

        const newCommentUpdateRow = await this._writeCommentUpdateToDatabase(newCommentUpdate, commentUpdateCid, newLocalMfsPath);
        if (storedCommentUpdate && storedCommentUpdate.updateCid !== commentUpdateCid) {
            this._cidsToUnPin.add(storedCommentUpdate.updateCid);
            if (storedCommentUpdate.localMfsPath !== newLocalMfsPath) this._mfsPathsToRemove.add(storedCommentUpdate.localMfsPath);
        }

        return { ...newCommentUpdateRow, commentUpdateRecordString: newCommentUpdateString };
    }

    private async _validateCommentUpdateSignature(newCommentUpdate: CommentUpdateType, comment: CommentsTableRow, log: Logger) {
        // This function should be deleted at some point, once the protocol ossifies
        const verificationOpts = {
            update: newCommentUpdate,
            resolveAuthorAddresses: false,
            clientsManager: this._clientsManager,
            subplebbit: this._rawSubplebbitIpfs!,
            comment,
            overrideAuthorAddressIfInvalid: false,
            validatePages: this._plebbit.validatePages,
            validateUpdateSignature: true
        };
        const validation = await verifyCommentUpdate(verificationOpts);
        if (!validation.valid) {
            log.error(`CommentUpdate (${comment.cid}) signature is invalid due to (${validation.reason}). This is a critical error`);
            throw new PlebbitError("ERR_COMMENT_UPDATE_SIGNATURE_IS_INVALID", { validation, verificationOpts });
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
        const log = Logger("plebbit-js:local-subplebbit:_movePostUpdatesFolderToNewAddress");
        try {
            await this._clientsManager.getDefaultIpfs()._client.files.mv(`/${oldAddress}`, `/${newAddress}`); // Could throw
        } catch (e) {
            if (e instanceof Error && e.message !== "file does not exist") {
                log.error("Failed to move directory of post updates in MFS", this.address, e);
                throw e; // A critical error
            }
        }

        await this._dbHandler.updateMfsPathOfCommentUpdates(oldAddress, newAddress);
    }

    private async _switchDbWhileRunningIfNeeded() {
        const log = Logger("plebbit-js:local-subplebbit:_switchDbIfNeeded");

        // Will check if address has been changed, and if so connect to the new db with the new address
        const internalState = await this._getDbInternalState(false);
        if (!internalState) throw Error("Can't change address or db when there's no internal state in db");
        const listedSubs = await listSubplebbits(this._plebbit); // need to make sure this is the latest sub
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
            await this._dbHandler.initDbIfNeeded();
            await this._dbHandler.lockSubStart(internalState.address); // Lock the new address start
            this._subplebbitUpdateTrigger = true;
            await this._updateDbInternalState({ _subplebbitUpdateTrigger: this._subplebbitUpdateTrigger });
        }
    }

    private async _updateCommentsThatNeedToBeUpdated(): Promise<CommentUpdateToBeUpdated[]> {
        const log = Logger(`plebbit-js:local-subplebbit:_updateCommentsThatNeedToBeUpdated`);

        const trx = await this._dbHandler.createTransaction("_updateCommentsThatNeedToBeUpdated");
        const commentsToUpdate = await this._dbHandler.queryCommentsToBeUpdated(trx);
        await this._dbHandler.commitTransaction("_updateCommentsThatNeedToBeUpdated");
        if (commentsToUpdate.length === 0) return [];

        console.time("updateCommentsThatNeedToBeUpdated" + commentsToUpdate.length);
        this._subplebbitUpdateTrigger = true;

        log(`Will update ${commentsToUpdate.length} comments in this update loop for subplebbit (${this.address})`);

        const commentsGroupedByDepth = remeda.groupBy.strict(commentsToUpdate, (x) => x.depth);

        const depthsKeySorted = remeda.keys.strict(commentsGroupedByDepth).sort((a, b) => Number(b) - Number(a)); // Make sure comments with higher depths are sorted first

        const allCommentUpdateRows: CommentUpdateToBeUpdated[] = [];
        // TODO potential optimization here is to separate _calculateNewCommentUpdateAndWriteToDb based on postCid + depth
        // because we know the comment updates of two different posts are independent of each other
        for (const depthKey of depthsKeySorted) {
            const commentUpdateResults = await Promise.all(
                commentsGroupedByDepth[depthKey].map(this._calculateNewCommentUpdateAndWriteToDb.bind(this))
            );
            allCommentUpdateRows.push(...commentUpdateResults.map((row) => ({ ...row, depth: Number(depthKey) })));
        }
        // Return the flat array of all comment update rows
        console.timeEnd("updateCommentsThatNeedToBeUpdated" + commentsToUpdate.length);

        return allCommentUpdateRows;
    }

    private async _repinCommentsIPFSIfNeeded() {
        const log = Logger("plebbit-js:local-subplebbit:start:_repinCommentsIPFSIfNeeded");
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
            const baseProps = remeda.pick(unpinnedCommentRow, remeda.keys.strict(CommentIpfsSchema.shape));
            const commentIpfsJson = <CommentIpfsType>{
                ...baseProps,
                ...unpinnedCommentRow.extraProps,
                postCid: unpinnedCommentRow.depth === 0 ? undefined : unpinnedCommentRow.postCid // need to remove post cid because it's not part of ipfs file if depth is 0
            };
            const commentIpfsContent = deterministicStringify(commentIpfsJson);
            const contentHash: string = await calculateIpfsHash(commentIpfsContent);
            if (contentHash !== unpinnedCommentRow.cid) throw Error("Unable to recreate the CommentIpfs. This is a critical error");
            await this._clientsManager.getDefaultIpfs()._client.add(commentIpfsContent, { pin: true });
            log.trace("Pinned comment", unpinnedCommentRow.cid, "of subplebbit", this.address, "to IPFS node");
        }

        await this._dbHandler.resetPublishedToPostUpdatesMFS(); // force plebbit-js to republish all comment updates

        log(`${unpinnedCommentsFromDb.length} comments' IPFS have been repinned`);
    }

    private async _unpinStaleCidsAndRemoveUnneededMfsPaths() {
        const log = Logger("plebbit-js:local-subplebbit:sync:unpinStaleCids");

        if (this._cidsToUnPin.size > 0) {
            const sizeBefore = this._cidsToUnPin.size;

            await Promise.all(
                Array.from(this._cidsToUnPin.values()).map(async (cid) => {
                    try {
                        await this._clientsManager.getDefaultIpfs()._client.pin.rm(cid, { recursive: true });
                        this._cidsToUnPin.delete(cid);
                    } catch (e) {
                        const error = <Error>e;
                        if (error.message.startsWith("not pinned")) this._cidsToUnPin.delete(cid);
                        else log.error("Failed to unpin cid", cid, "on subplebbit", this.address, "due to error", error);
                    }
                })
            );

            log(`unpinned ${sizeBefore - this._cidsToUnPin.size} stale cids from ipfs node for subplebbit (${this.address})`);
        }
        await this._rmUnneededMfsPaths();
    }

    private async _rmUnneededMfsPaths() {
        const log = Logger("plebbit-js:local-subplebbit:sync:_rmUnneededMfsPaths");

        if (this._mfsPathsToRemove.size > 0) {
            const toDeleteMfsPaths = Array.from(this._mfsPathsToRemove.values());
            try {
                await this._clientsManager.getDefaultIpfs()._client.files.rm(toDeleteMfsPaths, { recursive: true, flush: false });
                log("Removed", toDeleteMfsPaths.length, "files from MFS directory", toDeleteMfsPaths);
                toDeleteMfsPaths.forEach((path) => this._mfsPathsToRemove.delete(path));
            } catch (e) {
                const error = <Error>e;
                if (!error.message.includes("file does not exist")) {
                    log.error("Failed to remove files from MFS", toDeleteMfsPaths, e);
                    throw e;
                } else toDeleteMfsPaths.forEach((path) => this._mfsPathsToRemove.delete(path));
            }
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

        log(
            `CommentUpdate directory`,
            this.address,
            `does not exist under MFS, will drop all comment updates (${storedCommentUpdates.length})`,
            "to force publishing of new comment updates"
        );

        await this._dbHandler.resetPublishedToPostUpdatesMFS(); // plebbit-js will recalculate and publish all comment updates
    }

    private *_createCommentUpdateIterable(commentUpdateRows: CommentUpdateToBeUpdated[]) {
        for (const row of commentUpdateRows) {
            yield { content: row.commentUpdateRecordString };
        }
    }

    private async _syncPostUpdatesWithIpfs(commentUpdateRowsToPublishToIpfs: CommentUpdateToBeUpdated[]) {
        const log = Logger("plebbit-js:local-subplebbit:sync:_syncPostUpdatesFilesystemWithIpfs");

        const postUpdatesDirectory = "/" + this.address;

        const commentUpdatesOfPosts = commentUpdateRowsToPublishToIpfs.filter((row) => row.depth === 0);

        if (commentUpdatesOfPosts.length === 0) {
            log("No comment updates of posts to publish to postUpdates directory");
            return;
        }

        const newCommentUpdatesAddAll = await genToArray(
            this._clientsManager.getDefaultIpfs()._client.addAll(this._createCommentUpdateIterable(commentUpdatesOfPosts), {
                wrapWithDirectory: false // we want to publish them to ipfs as is
            })
        );

        // TODO need to do this in parallel
        for (const commentUpdateFile of newCommentUpdatesAddAll) {
            const commentUpdateFilePath = commentUpdatesOfPosts.find(
                (row) => row.updateCid === commentUpdateFile.cid.toV0().toString()
            )?.localMfsPath;
            if (!commentUpdateFilePath) throw Error("Failed to find the local mfs path of the comment update");
            try {
                await this._clientsManager.getDefaultIpfs()._client.files.rm(commentUpdateFilePath);
            } catch (e) {
                if (!(<Error>e).message.includes("file does not exist")) throw e;
            }
            await this._clientsManager
                .getDefaultIpfs()
                ._client.files.cp("/ipfs/" + commentUpdateFile.cid.toString(), commentUpdateFilePath, {
                    parents: true,
                    flush: false
                });
        }

        console.time("flushPostUpdatesDirectory");
        const postUpdatesDirectoryCid = await this._clientsManager.getDefaultIpfs()._client.files.flush(postUpdatesDirectory);
        console.timeEnd("flushPostUpdatesDirectory");
        log(
            "Subplebbit",
            this.address,
            "Synced",
            commentUpdatesOfPosts.length,
            "post CommentUpdates",
            "with MFS postUpdates directory",
            postUpdatesDirectoryCid
        );
        await this._dbHandler.updateCommentUpdatesPublishedToPostUpdatesMFS(commentUpdateRowsToPublishToIpfs.map((row) => row.cid));
    }

    private async _adjustPostUpdatesBucketsIfNeeded() {
        // This function will be ran a lot, maybe we should move it out of the sync loop or try to limit its execution
        if (!this.postUpdates) return;
        // Look for posts whose buckets should be changed

        // TODO this function should be ran in a more efficient manner. It iterates through all posts in the database
        // At some point we should have a db query that looks for posts that need to move to a different bucket
        const log = Logger("plebbit-js:local-subplebbit:start:_adjustPostUpdatesBucketsIfNeeded");
        // TODO we can optimize this by excluding posts in the last bucket
        const commentUpdateOfPosts = await this._dbHandler.queryCommentUpdatesOfPostsForBucketAdjustment();
        for (const post of commentUpdateOfPosts) {
            const currentTimestampBucketOfPost = Number(post.localMfsPath.split("/")[3]);
            const newTimestampBucketOfPost = this._postUpdatesBuckets.find((bucket) => timestamp() - bucket <= post.timestamp);
            if (typeof newTimestampBucketOfPost !== "number") throw Error("Failed to calculate the timestamp bucket of post");
            if (currentTimestampBucketOfPost !== newTimestampBucketOfPost) {
                log(
                    `Post (${post.cid}) current postUpdates timestamp bucket (${currentTimestampBucketOfPost}) is outdated. Will mark it to be republished under a new bucket (${newTimestampBucketOfPost})`
                );

                const updateDirectoryOfPost = post.localMfsPath.replace("/update", "");
                try {
                    await this._clientsManager.getDefaultIpfs()._client.files.rm(updateDirectoryOfPost, { recursive: true });
                    await this._dbHandler.resetPublishedToPostUpdatesMFSWithPostCid(post.cid);
                } catch (e) {
                    if ((<Error>e).message.includes("file does not exist")) {
                        await this._dbHandler.resetPublishedToPostUpdatesMFSWithPostCid(post.cid);
                    } else throw e;
                }
            }
        }
    }

    private async _cleanUpIpfsRepoRarely(force = false) {
        const log = Logger("plebbit-js:local-subplebbit:syncIpnsWithDb:_cleanUpIpfsRepoRarely");
        if (Math.random() < 0.0001 || force) {
            let gcCids = 0;
            try {
                for await (const res of this._clientsManager.getDefaultIpfs()._client.repo.gc({ quiet: true })) {
                    if (res.cid) gcCids++;
                    else log.error("Failed to GC ipfs repo due to error", res.err);
                }
            } catch (e) {
                log.error("Failed to GC ipfs repo due to error", e);
            }

            log("GC cleaned", gcCids, "cids out of the IPFS node");
        }
    }

    private async syncIpnsWithDb() {
        const log = Logger("plebbit-js:local-subplebbit:sync");

        try {
            await this._dbHandler.initDbIfNeeded();
            await this._switchDbWhileRunningIfNeeded();
            await this._updateInstanceStateWithDbState();
            await this._listenToIncomingRequests();
            await this._adjustPostUpdatesBucketsIfNeeded();
            this._setStartedState("publishing-ipns");
            this._clientsManager.updateIpfsState("publishing-ipns");
            const commentUpdateRows = await this._updateCommentsThatNeedToBeUpdated();
            await this.updateSubplebbitIpnsIfNeeded(commentUpdateRows);
            await this._cleanUpIpfsRepoRarely();
        } catch (e) {
            this._setStartedState("failed");
            this._clientsManager.updateIpfsState("stopped");

            log.error(`Failed to sync sub`, this.address, `due to error,`, e);
            throw e;
        }
    }

    private async _assertDomainResolvesCorrectly(newAddressAsDomain: string) {
        if (isStringDomain(newAddressAsDomain)) {
            await this._clientsManager.clearDomainCache(newAddressAsDomain, "subplebbit-address");
            const resolvedIpnsFromNewDomain = await this._clientsManager.resolveSubplebbitAddressIfNeeded(newAddressAsDomain);
            if (resolvedIpnsFromNewDomain !== this.signer.address)
                throwWithErrorCode("ERR_DOMAIN_SUB_ADDRESS_TXT_RECORD_POINT_TO_DIFFERENT_ADDRESS", {
                    currentSubplebbitAddress: this.address,
                    newAddressAsDomain,
                    resolvedIpnsFromNewDomain,
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
        if (this.state !== "started" || this._stopHasBeenCalled) return;
        const loop = async () => {
            try {
                this._publishLoopPromise = this.syncIpnsWithDb();
                await this._publishLoopPromise;
            } finally {
                await this._publishLoop(syncIntervalMs);
            }
        };
        this._publishInterval = setTimeout(loop.bind(this), syncIntervalMs);
    }

    private async _initBeforeStarting() {
        this.protocolVersion = env.PROTOCOL_VERSION;
        if (!this.signer?.address) throwWithErrorCode("ERR_SUB_SIGNER_NOT_DEFINED");
        if (!this._challengeAnswerPromises)
            this._challengeAnswerPromises = new LRUCache<string, Promise<DecryptedChallengeAnswer["challengeAnswers"]>>({
                max: 1000,
                ttl: 600000
            });
        if (!this._challengeAnswerResolveReject)
            this._challengeAnswerResolveReject = new LRUCache<
                string,
                { resolve: (answers: DecryptedChallengeAnswer["challengeAnswers"]) => void; reject: (error: Error) => void }
            >({
                max: 1000,
                ttl: 600000
            });
        if (!this._ongoingChallengeExchanges)
            this._ongoingChallengeExchanges = new LRUCache<string, boolean>({
                max: 1000,
                ttl: 600000
            });
        await this._dbHandler.initDbIfNeeded();
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

        const parsedEditOptions = parseSubplebbitEditOptionsSchemaWithPlebbitErrorIfItFails(newSubplebbitOptions);

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

        if (newProps.address && newProps.address !== this.address) {
            // we're modifying sub.address
            if (doesDomainAddressHaveCapitalLetter(newProps.address))
                throw new PlebbitError("ERR_DOMAIN_ADDRESS_HAS_CAPITAL_LETTER", { subplebbitAddress: newProps.address });
            if (this._plebbit.subplebbits.includes(newProps.address))
                throw new PlebbitError("ERR_SUB_OWNER_ATTEMPTED_EDIT_NEW_ADDRESS_THAT_ALREADY_EXISTS", {
                    currentSubplebbitAddress: this.address,
                    editProps: newProps,
                    currentSubs: this._plebbit.subplebbits
                });
            this._assertDomainResolvesCorrectly(newProps.address).catch((err: PlebbitError) => {
                log.error(err);
                this.emit("error", err);
            });
            log(`Attempting to edit subplebbit.address from ${this.address} to ${newProps.address}`);
            await this._updateDbInternalState(newProps);
            if (!(await this._dbHandler.isSubStartLocked())) {
                log("will rename the subplebbit db in edit() because the subplebbit is not being ran anywhere else");
                await this._movePostUpdatesFolderToNewAddress(this.address, newProps.address);
                await this._dbHandler.destoryConnection();
                await this._dbHandler.changeDbFilename(this.address, newProps.address);
                await this._dbHandler.initDbIfNeeded();
                this.setAddress(newProps.address);
            }
        } else {
            await this._updateDbInternalState(newProps);
        }

        const latestState = await this._getDbInternalState(false);
        if (!latestState) throw Error("Internal state in db should be defined prior to calling sub.edit()");

        if ("updatedAt" in latestState) await this.initInternalSubplebbitAfterFirstUpdateNoMerge(latestState);
        else await this.initInternalSubplebbitBeforeFirstUpdateNoMerge(latestState);

        log(
            `Subplebbit (${this.address}) props (${remeda.keys.strict(newProps)}) has been edited: `,
            remeda.pick(latestState, remeda.keys.strict(parsedEditOptions))
        );
        if (this.state === "stopped") await this._dbHandler.destoryConnection(); // Need to destory connection so process wouldn't hang
        this.emit("update", this);

        return this;
    }

    private async _setSubplebbitIpfsIfNeeded() {
        // A hack for old subplebbit states that don't define _rawSubplebbitIpfs
        if (this.updatedAt && !this._rawSubplebbitIpfs) {
            const internalState = await this._getDbInternalState(false);
            if (!internalState) throw Error("Internal state should be defined if updatedAt is defined");
            if (!("signature" in internalState)) throw Error("signature should be defined");
            this._rawSubplebbitIpfs = <
                SubplebbitIpfsType //@ts-expect-error
            >remeda.pick(internalState, [...internalState.signature.signedPropertyNames, "signature", "protocolVersion"]);
        }
    }

    override async start() {
        const log = Logger("plebbit-js:local-subplebbit:start");

        this._stopHasBeenCalled = false;
        if (!this._clientsManager.getDefaultIpfs())
            throw Error("You need to define an IPFS client in your plebbit instance to be able to start a local sub");
        try {
            await this._initBeforeStarting();
            // update started value twice because it could be started prior lockSubStart
            this._setState("started");
            await this._updateStartedValue();
            await this._dbHandler.lockSubStart(); // Will throw if sub is locked already
            await this._updateStartedValue();
            await this._dbHandler.initDbIfNeeded();

            await this._setChallengesToDefaultIfNotDefined(log);
            // Import subplebbit keys onto ipfs node
            await this._importSubplebbitSignerIntoIpfsIfNeeded();

            this._subplebbitUpdateTrigger = true;
            await this._updateDbInternalState({ _subplebbitUpdateTrigger: this._subplebbitUpdateTrigger });

            this._setStartedState("publishing-ipns");
            await this._repinCommentsIPFSIfNeeded();
            await this._repinCommentUpdateIfNeeded();
            await this._listenToIncomingRequests();
            this.challenges = this.settings.challenges!.map(getSubplebbitChallengeFromSubplebbitChallengeSettings); // make sure subplebbit.challenges is using latest props from settings.challenges
        } catch (e) {
            await this.stop(); // Make sure to reset the sub state
            throw e;
        }

        this._publishLoopPromise = this.syncIpnsWithDb();

        this._publishLoopPromise
            .catch((reason) => {
                log.error(reason);
                this.emit("error", reason);
            })
            .finally(() => this._publishLoop(this._plebbit.publishInterval));
    }

    private async _updateOnce() {
        const log = Logger("plebbit-js:local-subplebbit:update");
        await this._dbHandler.initDbIfNeeded();
        const dbSubState = await this._getDbInternalState(false);
        if (!dbSubState) throw Error("There is no internal sub state in db");
        await this._updateStartedValue();
        if (this._internalStateUpdateId !== dbSubState._internalStateUpdateId) {
            if ("updatedAt" in dbSubState) await this.initInternalSubplebbitAfterFirstUpdateNoMerge(dbSubState);
            else await this.initInternalSubplebbitBeforeFirstUpdateNoMerge(dbSubState);
            log(`Local Subplebbit (${this.address}) received a new update with updatedAt (${this.updatedAt}). Will emit an update event`);

            this._setUpdatingStateNoEmission("succeeded");
            this.emit("update", this);
            this.emit("updatingstatechange", "succeeded");
        }
    }

    override async update() {
        const log = Logger("plebbit-js:local-subplebbit:update");
        if (this.state === "updating" || this.state === "started") return; // No need to do anything if subplebbit is already updating
        const updateLoop = (async () => {
            if (this.state === "updating" && !this._stopHasBeenCalled) {
                this._updateLoopPromise = this._updateOnce();
                this._updateLoopPromise
                    .catch((e) => log.error(`Failed to update subplebbit`, e))
                    .finally(() => setTimeout(updateLoop, this._plebbit.updateInterval));
            }
        }).bind(this);

        this._setState("updating");

        this._updateLoopPromise = this._updateOnce();
        this._updateLoopPromise
            .catch((e) => log.error(`Failed to update subplebbit`, e))
            .finally(() => (this._updateLocalSubTimeout = setTimeout(updateLoop, this._plebbit.updateInterval)));
    }

    override async stop() {
        const log = Logger("plebbit-js:local-subplebbit:stop");
        this._stopHasBeenCalled = true;
        this.posts._stop();

        if (this.state === "started") {
            try {
                await this._clientsManager.pubsubUnsubscribe(this.pubsubTopicWithfallback(), this.handleChallengeExchange);
            } catch (e) {
                log.error("Failed to unsubscribe from challenge exchange pubsub when stopping subplebbit", e);
            }
            if (this._publishLoopPromise) {
                try {
                    await this._publishLoopPromise; // should be in try/catch
                } catch (e) {
                    log.error(`Failed to stop subplebbit`, e);
                }
                this._publishLoopPromise = undefined;
            }

            try {
                await this._unpinStaleCidsAndRemoveUnneededMfsPaths();
            } catch (e) {
                log.error("Failed to unpin stale cids and remove mfs paths before stopping", e);
            }

            try {
                await this._updateDbInternalState({ _cidsToUnPin: [...this._cidsToUnPin], _mfsPathsToRemove: [...this._mfsPathsToRemove] });
            } catch (e) {
                log.error("Failed to update db internal state with cids to unpin and mfs paths to remove before stopping", e);
            }

            try {
                await this._clientsManager.getDefaultIpfs()._client.files.flush("/" + this.address);
            } catch (e) {
                log.error("Failed to flush MFS before stopping", e);
            }
            try {
                await this._dbHandler.unlockSubStart();
            } catch (e) {
                log.error(`Failed to unlock start lock on sub (${this.address})`, e);
            }

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
        } else if (this.state === "updating") {
            if (this._updateLoopPromise) {
                await this._updateLoopPromise;
                this._updateLoopPromise = undefined;
            }
            clearTimeout(this._updateLocalSubTimeout);
            await this._dbHandler.destoryConnection();
            this._setUpdatingStateWithEventEmissionIfNewState("stopped");
            log(`Stopped the updating of local subplebbit (${this.address})`);
            this._setState("stopped");
        } else throw Error("User called localSubplebbit.stop() without updating or starting first on subplebbit" + this.address);
        this._stopHasBeenCalled = false;
    }

    override async delete() {
        const log = Logger("plebbit-js:local-subplebbit:delete");
        log.trace(`Attempting to stop the subplebbit (${this.address}) before deleting, if needed`);
        if (this.state === "updating" || this.state === "started") await this.stop();

        const kuboClient = this._clientsManager.getDefaultIpfs();
        if (!kuboClient) throw Error("Ipfs client is not defined");

        await moveSubplebbitDbToDeletedDirectory(this.address, this._plebbit);
        if (typeof this.signer?.ipnsKeyName === "string")
            // Key may not exist on ipfs node
            try {
                await kuboClient._client.key.rm(this.signer.ipnsKeyName);
            } catch {}
        log(`Deleted subplebbit (${this.address}) successfully`);
    }
}
