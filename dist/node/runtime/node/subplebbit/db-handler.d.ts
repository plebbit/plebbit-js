import { Knex } from "knex";
import Transaction = Knex.Transaction;
import type { CommentEditsTableRow, CommentEditsTableRowInsert, CommentModerationsTableRowInsert, CommentsTableRow, CommentsTableRowInsert, CommentUpdatesRow, CommentUpdatesTableRowInsert, VotesTableRow, VotesTableRowInsert } from "../../../types.js";
import type { PageOptions } from "./page-generator.js";
import type { InternalSubplebbitRecordBeforeFirstUpdateType, SubplebbitStats } from "../../../subplebbit/types.js";
import type { CommentUpdateType, SubplebbitAuthor } from "../../../publications/comment/types.js";
import type { PageIpfs } from "../../../pages/types.js";
export declare class DbHandler {
    private _knex;
    private _subplebbit;
    private _currentTrxs;
    private _dbConfig;
    private _keyv;
    private _createdTables;
    constructor(subplebbit: DbHandler["_subplebbit"]);
    initDbConfigIfNeeded(): Promise<void>;
    toJSON(): undefined;
    initDbIfNeeded(): Promise<void>;
    createOrMigrateTablesIfNeeded(): Promise<void>;
    getDbConfig(): Knex.Config;
    keyvGet(key: string): Promise<any>;
    keyvSet(key: string, value: any, ttl?: number): Promise<boolean>;
    keyvDelete(key: string | string[]): Promise<boolean>;
    keyvHas(key: string): Promise<boolean>;
    destoryConnection(): Promise<void>;
    createTransaction(transactionId: string): Promise<Transaction>;
    commitTransaction(transactionId: string): Promise<void>;
    rollbackTransaction(transactionId: string): Promise<void>;
    rollbackAllTransactions(): Promise<void[]>;
    private _baseTransaction;
    private _createCommentsTable;
    private _createCommentUpdatesTable;
    private _createVotesTable;
    private _createCommentEditsTable;
    private _createCommentModerationsTable;
    getDbVersion(): Promise<number>;
    _migrateOldSettings(oldSettings: InternalSubplebbitRecordBeforeFirstUpdateType["settings"]): {
        challenges?: {
            path?: string | undefined;
            options?: Record<string, string> | undefined;
            exclude?: [import("zod").objectOutputType<{
                subplebbit: import("zod").ZodOptional<import("zod").ZodObject<{
                    addresses: import("zod").ZodArray<import("zod").ZodString, "atleastone">;
                    maxCommentCids: import("zod").ZodNumber;
                    postScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                    replyScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                    firstCommentTimestamp: import("zod").ZodOptional<import("zod").ZodNumber>;
                }, "strict", import("zod").ZodTypeAny, {
                    addresses: [string, ...string[]];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: [string, ...string[]];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                replyScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                firstCommentTimestamp: import("zod").ZodOptional<import("zod").ZodNumber>;
                challenges: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodNumber, "many">>;
                role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
                rateLimit: import("zod").ZodOptional<import("zod").ZodNumber>;
                rateLimitChallengeSuccess: import("zod").ZodOptional<import("zod").ZodBoolean>;
                publicationType: import("zod").ZodOptional<import("zod").ZodEffects<import("zod").ZodObject<{
                    post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentEdit: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentModeration: import("zod").ZodOptional<import("zod").ZodBoolean>;
                }, "passthrough", import("zod").ZodTypeAny, import("zod").objectOutputType<{
                    post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentEdit: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentModeration: import("zod").ZodOptional<import("zod").ZodBoolean>;
                }, import("zod").ZodTypeAny, "passthrough">, import("zod").objectInputType<{
                    post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentEdit: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentModeration: import("zod").ZodOptional<import("zod").ZodBoolean>;
                }, import("zod").ZodTypeAny, "passthrough">>, import("zod").objectOutputType<{
                    post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentEdit: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentModeration: import("zod").ZodOptional<import("zod").ZodBoolean>;
                }, import("zod").ZodTypeAny, "passthrough">, import("zod").objectInputType<{
                    post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentEdit: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentModeration: import("zod").ZodOptional<import("zod").ZodBoolean>;
                }, import("zod").ZodTypeAny, "passthrough">>>;
            }, import("zod").ZodTypeAny, "passthrough">, ...import("zod").objectOutputType<{
                subplebbit: import("zod").ZodOptional<import("zod").ZodObject<{
                    addresses: import("zod").ZodArray<import("zod").ZodString, "atleastone">;
                    maxCommentCids: import("zod").ZodNumber;
                    postScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                    replyScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                    firstCommentTimestamp: import("zod").ZodOptional<import("zod").ZodNumber>;
                }, "strict", import("zod").ZodTypeAny, {
                    addresses: [string, ...string[]];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: [string, ...string[]];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                replyScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                firstCommentTimestamp: import("zod").ZodOptional<import("zod").ZodNumber>;
                challenges: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodNumber, "many">>;
                role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
                rateLimit: import("zod").ZodOptional<import("zod").ZodNumber>;
                rateLimitChallengeSuccess: import("zod").ZodOptional<import("zod").ZodBoolean>;
                publicationType: import("zod").ZodOptional<import("zod").ZodEffects<import("zod").ZodObject<{
                    post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentEdit: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentModeration: import("zod").ZodOptional<import("zod").ZodBoolean>;
                }, "passthrough", import("zod").ZodTypeAny, import("zod").objectOutputType<{
                    post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentEdit: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentModeration: import("zod").ZodOptional<import("zod").ZodBoolean>;
                }, import("zod").ZodTypeAny, "passthrough">, import("zod").objectInputType<{
                    post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentEdit: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentModeration: import("zod").ZodOptional<import("zod").ZodBoolean>;
                }, import("zod").ZodTypeAny, "passthrough">>, import("zod").objectOutputType<{
                    post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentEdit: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentModeration: import("zod").ZodOptional<import("zod").ZodBoolean>;
                }, import("zod").ZodTypeAny, "passthrough">, import("zod").objectInputType<{
                    post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentEdit: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentModeration: import("zod").ZodOptional<import("zod").ZodBoolean>;
                }, import("zod").ZodTypeAny, "passthrough">>>;
            }, import("zod").ZodTypeAny, "passthrough">[]] | undefined;
            description?: string | undefined;
            name?: string | undefined;
        }[] | undefined;
        fetchThumbnailUrls?: boolean | undefined;
        fetchThumbnailUrlsProxyUrl?: string | undefined;
    };
    _createOrMigrateTablesIfNeeded(): Promise<void>;
    private _copyTable;
    private _purgeCommentsWithInvalidSchemaOrSignature;
    private _moveCommentEditsToModAuthorTables;
    deleteVote(authorSignerAddress: VotesTableRow["authorSignerAddress"], commentCid: VotesTableRow["commentCid"], trx?: Transaction): Promise<void>;
    insertVote(vote: VotesTableRowInsert, trx?: Transaction): Promise<void>;
    insertComment(comment: CommentsTableRowInsert, trx?: Transaction): Promise<void>;
    upsertCommentUpdate(update: CommentUpdatesTableRowInsert, trx?: Transaction): Promise<void>;
    insertCommentModeration(moderation: CommentModerationsTableRowInsert, trx?: Transaction): Promise<void>;
    insertCommentEdit(edit: CommentEditsTableRowInsert, trx?: Transaction): Promise<void>;
    queryVote(commentCid: string, authorSignerAddress: string, trx?: Transaction): Promise<VotesTableRow | undefined>;
    private _basePageQuery;
    queryReplyCount(commentCid: string, trx?: Transaction): Promise<number>;
    queryActiveScore(comment: Pick<CommentsTableRow, "cid" | "timestamp">, trx?: Transaction): Promise<number>;
    queryPageComments(options: Omit<PageOptions, "pageSize">, trx?: Transaction): Promise<PageIpfs["comments"]>;
    commentHasReplies(commentCid: string, trx?: Transaction): Promise<boolean>;
    queryFlattenedPageReplies(options: PageOptions & {
        parentCid: string;
    }, trx?: Transaction): Promise<PageIpfs["comments"]>;
    queryStoredCommentUpdate(comment: Pick<CommentsTableRow, "cid">, trx?: Transaction): Promise<CommentUpdatesRow | undefined>;
    queryAllStoredCommentUpdates(trx?: Transaction): Promise<CommentUpdatesRow[]>;
    queryCommentUpdatesOfPostsForBucketAdjustment(trx?: Transaction): Promise<(Pick<CommentsTableRow, "timestamp" | "cid"> & Pick<CommentUpdatesRow, "ipfsPath">)[]>;
    deleteAllCommentUpdateRows(trx?: Transaction): Promise<number>;
    queryCommentsUpdatesWithPostCid(postCid: string, trx?: Transaction): Promise<CommentUpdatesRow[]>;
    queryCommentsOfAuthors(authorSignerAddresses: string | string[], trx?: Transaction): Promise<CommentsTableRow[]>;
    queryCommentsByCids(cids: string[], trx?: Transaction): Promise<{
        timestamp: number;
        signature: {
            type: "ed25519" | "eip191";
            publicKey: string;
            signature: string;
            signedPropertyNames: string[];
        };
        id: number;
        author: {
            address: string;
            previousCommentCid?: string | undefined;
            displayName?: string | undefined;
            wallets?: Record<string, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }> | undefined;
            avatar?: import("zod").objectOutputType<{
                chainTicker: import("zod").ZodString;
                address: import("zod").ZodString;
                id: import("zod").ZodString;
                timestamp: import("zod").ZodNumber;
                signature: import("zod").ZodObject<{
                    signature: import("zod").ZodString;
                    type: import("zod").ZodEnum<["eip191"]>;
                }, "strip", import("zod").ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
                    signature: string;
                }>;
            }, import("zod").ZodTypeAny, "passthrough"> | undefined;
            flair?: import("zod").objectOutputType<{
                text: import("zod").ZodString;
                backgroundColor: import("zod").ZodOptional<import("zod").ZodString>;
                textColor: import("zod").ZodOptional<import("zod").ZodString>;
                expiresAt: import("zod").ZodOptional<import("zod").ZodNumber>;
            }, import("zod").ZodTypeAny, "passthrough"> | undefined;
        } & {
            [k: string]: unknown;
        };
        subplebbitAddress: string;
        protocolVersion: string;
        insertedAt: number;
        authorSignerAddress: string;
        postCid: string;
        depth: number;
        cid: string;
        flair?: import("zod").objectOutputType<{
            text: import("zod").ZodString;
            backgroundColor: import("zod").ZodOptional<import("zod").ZodString>;
            textColor: import("zod").ZodOptional<import("zod").ZodString>;
            expiresAt: import("zod").ZodOptional<import("zod").ZodNumber>;
        }, import("zod").ZodTypeAny, "passthrough"> | undefined;
        content?: string | undefined;
        spoiler?: boolean | undefined;
        nsfw?: boolean | undefined;
        extraProps?: import("zod").objectOutputType<{}, import("zod").ZodTypeAny, "passthrough"> | undefined;
        title?: string | undefined;
        link?: string | undefined;
        linkWidth?: number | undefined;
        linkHeight?: number | undefined;
        linkHtmlTagName?: "a" | "img" | "video" | "audio" | undefined;
        parentCid?: string | undefined;
        thumbnailUrl?: string | undefined;
        thumbnailUrlWidth?: number | undefined;
        thumbnailUrlHeight?: number | undefined;
        previousCid?: string | undefined;
    }[]>;
    queryCommentBySignatureEncoded(signatureEncoded: string, trx?: Transaction): Promise<{
        timestamp: number;
        signature: {
            type: "ed25519" | "eip191";
            publicKey: string;
            signature: string;
            signedPropertyNames: string[];
        };
        id: number;
        author: {
            address: string;
            previousCommentCid?: string | undefined;
            displayName?: string | undefined;
            wallets?: Record<string, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }> | undefined;
            avatar?: import("zod").objectOutputType<{
                chainTicker: import("zod").ZodString;
                address: import("zod").ZodString;
                id: import("zod").ZodString;
                timestamp: import("zod").ZodNumber;
                signature: import("zod").ZodObject<{
                    signature: import("zod").ZodString;
                    type: import("zod").ZodEnum<["eip191"]>;
                }, "strip", import("zod").ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
                    signature: string;
                }>;
            }, import("zod").ZodTypeAny, "passthrough"> | undefined;
            flair?: import("zod").objectOutputType<{
                text: import("zod").ZodString;
                backgroundColor: import("zod").ZodOptional<import("zod").ZodString>;
                textColor: import("zod").ZodOptional<import("zod").ZodString>;
                expiresAt: import("zod").ZodOptional<import("zod").ZodNumber>;
            }, import("zod").ZodTypeAny, "passthrough"> | undefined;
        } & {
            [k: string]: unknown;
        };
        subplebbitAddress: string;
        protocolVersion: string;
        insertedAt: number;
        authorSignerAddress: string;
        postCid: string;
        depth: number;
        cid: string;
        flair?: import("zod").objectOutputType<{
            text: import("zod").ZodString;
            backgroundColor: import("zod").ZodOptional<import("zod").ZodString>;
            textColor: import("zod").ZodOptional<import("zod").ZodString>;
            expiresAt: import("zod").ZodOptional<import("zod").ZodNumber>;
        }, import("zod").ZodTypeAny, "passthrough"> | undefined;
        content?: string | undefined;
        spoiler?: boolean | undefined;
        nsfw?: boolean | undefined;
        extraProps?: import("zod").objectOutputType<{}, import("zod").ZodTypeAny, "passthrough"> | undefined;
        title?: string | undefined;
        link?: string | undefined;
        linkWidth?: number | undefined;
        linkHeight?: number | undefined;
        linkHtmlTagName?: "a" | "img" | "video" | "audio" | undefined;
        parentCid?: string | undefined;
        thumbnailUrl?: string | undefined;
        thumbnailUrlWidth?: number | undefined;
        thumbnailUrlHeight?: number | undefined;
        previousCid?: string | undefined;
    } | undefined>;
    queryParents(rootComment: Pick<CommentsTableRow, "parentCid">, trx?: Transaction): Promise<CommentsTableRow[]>;
    queryCommentsToBeUpdated(trx?: Transaction): Promise<CommentsTableRow[]>;
    private _calcActiveUserCount;
    private _calcCommentCount;
    querySubplebbitStats(trx?: Transaction): Promise<SubplebbitStats>;
    queryCommentsUnderComment(parentCid: string | null, trx?: Transaction): Promise<CommentsTableRow[]>;
    queryComment(cid: string, trx?: Transaction): Promise<CommentsTableRow | undefined>;
    private _queryCommentUpvote;
    private _queryCommentDownvote;
    private _queryCommentCounts;
    private _queryLatestAuthorEdit;
    private _queryLatestModeratorReason;
    queryCommentFlagsSetByMod(cid: string, trx?: Transaction): Promise<Pick<CommentUpdateType, "spoiler" | "pinned" | "locked" | "removed" | "nsfw">>;
    queryAuthorEditDeleted(cid: string, trx?: Transaction): Promise<Pick<CommentEditsTableRow, "deleted"> | undefined>;
    private _queryModCommentFlair;
    private _queryLastChildCidAndLastReplyTimestamp;
    queryCalculatedCommentUpdate(comment: Pick<CommentsTableRow, "cid" | "authorSignerAddress" | "timestamp">, trx?: Transaction): Promise<Omit<CommentUpdateType, "signature" | "updatedAt" | "replies" | "protocolVersion">>;
    queryLatestPostCid(trx?: Transaction): Promise<Pick<CommentsTableRow, "cid"> | undefined>;
    queryLatestCommentCid(trx?: Transaction): Promise<Pick<CommentsTableRow, "cid"> | undefined>;
    queryAllCommentsOrderedByIdAsc(trx?: Transaction): Promise<{
        timestamp: number;
        signature: {
            type: "ed25519" | "eip191";
            publicKey: string;
            signature: string;
            signedPropertyNames: string[];
        };
        id: number;
        author: {
            address: string;
            previousCommentCid?: string | undefined;
            displayName?: string | undefined;
            wallets?: Record<string, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }> | undefined;
            avatar?: import("zod").objectOutputType<{
                chainTicker: import("zod").ZodString;
                address: import("zod").ZodString;
                id: import("zod").ZodString;
                timestamp: import("zod").ZodNumber;
                signature: import("zod").ZodObject<{
                    signature: import("zod").ZodString;
                    type: import("zod").ZodEnum<["eip191"]>;
                }, "strip", import("zod").ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
                    signature: string;
                }>;
            }, import("zod").ZodTypeAny, "passthrough"> | undefined;
            flair?: import("zod").objectOutputType<{
                text: import("zod").ZodString;
                backgroundColor: import("zod").ZodOptional<import("zod").ZodString>;
                textColor: import("zod").ZodOptional<import("zod").ZodString>;
                expiresAt: import("zod").ZodOptional<import("zod").ZodNumber>;
            }, import("zod").ZodTypeAny, "passthrough"> | undefined;
        } & {
            [k: string]: unknown;
        };
        subplebbitAddress: string;
        protocolVersion: string;
        insertedAt: number;
        authorSignerAddress: string;
        postCid: string;
        depth: number;
        cid: string;
        flair?: import("zod").objectOutputType<{
            text: import("zod").ZodString;
            backgroundColor: import("zod").ZodOptional<import("zod").ZodString>;
            textColor: import("zod").ZodOptional<import("zod").ZodString>;
            expiresAt: import("zod").ZodOptional<import("zod").ZodNumber>;
        }, import("zod").ZodTypeAny, "passthrough"> | undefined;
        content?: string | undefined;
        spoiler?: boolean | undefined;
        nsfw?: boolean | undefined;
        extraProps?: import("zod").objectOutputType<{}, import("zod").ZodTypeAny, "passthrough"> | undefined;
        title?: string | undefined;
        link?: string | undefined;
        linkWidth?: number | undefined;
        linkHeight?: number | undefined;
        linkHtmlTagName?: "a" | "img" | "video" | "audio" | undefined;
        parentCid?: string | undefined;
        thumbnailUrl?: string | undefined;
        thumbnailUrlWidth?: number | undefined;
        thumbnailUrlHeight?: number | undefined;
        previousCid?: string | undefined;
    }[]>;
    queryAuthorModEdits(authorSignerAddress: string, trx?: Knex.Transaction): Promise<Pick<SubplebbitAuthor, "banExpiresAt" | "flair">>;
    querySubplebbitAuthor(authorSignerAddress: string, trx?: Knex.Transaction): Promise<SubplebbitAuthor | undefined>;
    purgeComment(cid: string, trx?: Transaction): Promise<string[]>;
    changeDbFilename(oldDbName: string, newDbName: string): Promise<void>;
    lockSubStart(subAddress?: string): Promise<void>;
    unlockSubStart(subAddress?: string): Promise<void>;
    isSubStartLocked(subAddress?: string): Promise<boolean>;
    lockSubState(subAddress?: string): Promise<void>;
    unlockSubState(subAddress?: string): Promise<void>;
    subDbExists(subAddress?: string): boolean;
    subAddress(): string;
}
