import { Knex } from "knex";
import Transaction = Knex.Transaction;
import { AuthorCommentEdit, CommentEditsTableRowInsert, CommentsTableRow, CommentsTableRowInsert, CommentUpdate, CommentUpdatesRow, CommentUpdatesTableRowInsert, SubplebbitAuthor, VotesTableRow, VotesTableRowInsert } from "../../../types.js";
import { PageOptions } from "./sort-handler.js";
import { SubplebbitStats } from "../../../subplebbit/types.js";
export declare class DbHandler {
    private _knex;
    private _subplebbit;
    private _currentTrxs;
    private _dbConfig;
    private _keyv;
    private _createdTables;
    constructor(subplebbit: DbHandler["_subplebbit"]);
    initDbConfigIfNeeded(): Promise<void>;
    toJSON(): any;
    initDbIfNeeded(): Promise<void>;
    getDbConfig(): Knex.Config;
    keyvGet(key: string, options?: {
        raw?: false;
    }): Promise<any>;
    keyvSet(key: string, value: any, ttl?: number): Promise<true>;
    keyvDelete(key: string | string[]): Promise<boolean>;
    keyvHas(key: string): Promise<boolean>;
    initDestroyedConnection(): Promise<void>;
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
    getDbVersion(): Promise<number>;
    createTablesIfNeeded(): Promise<void>;
    isDbInMemory(): boolean;
    private _copyTable;
    deleteVote(authorAddress: VotesTableRow["authorAddress"], commentCid: VotesTableRow["commentCid"], trx?: Transaction): Promise<void>;
    insertVote(vote: VotesTableRowInsert, trx?: Transaction): Promise<void>;
    insertComment(comment: CommentsTableRowInsert, trx?: Transaction): Promise<void>;
    upsertCommentUpdate(update: CommentUpdatesTableRowInsert, trx?: Transaction): Promise<void>;
    insertEdit(edit: CommentEditsTableRowInsert, trx?: Transaction): Promise<void>;
    getStoredVoteOfAuthor(commentCid: string, authorAddress: string, trx?: Transaction): Promise<VotesTableRow | undefined>;
    private _basePageQuery;
    queryReplyCount(commentCid: string, trx?: Transaction): Promise<number>;
    queryActiveScore(comment: Pick<CommentsTableRow, "cid" | "timestamp">, trx?: Transaction): Promise<number>;
    queryCommentsForPages(options: Omit<PageOptions, "pageSize">, trx?: Transaction): Promise<{
        comment: CommentsTableRow;
        update: CommentUpdatesRow;
    }[]>;
    queryStoredCommentUpdate(comment: Pick<CommentsTableRow, "cid">, trx?: Transaction): Promise<CommentUpdatesRow | undefined>;
    queryAllStoredCommentUpdates(trx?: Transaction): Promise<CommentUpdatesRow[]>;
    queryCommentUpdatesWithPlaceHolderForIpfsPath(trx?: Transaction): Promise<CommentUpdatesRow[]>;
    queryCommentUpdatesOfPostsForBucketAdjustment(trx?: Transaction): Promise<(Pick<CommentsTableRow, "timestamp" | "cid"> & Pick<CommentUpdatesRow, "ipfsPath">)[]>;
    deleteAllCommentUpdateRows(trx?: Transaction): Promise<number>;
    queryCommentsUpdatesWithPostCid(postCid: string, trx?: Transaction): Promise<CommentUpdatesRow[]>;
    queryCommentsOfAuthor(authorAddresses: string | string[], trx?: Transaction): Promise<CommentsTableRow[]>;
    queryAllCommentsCid(trx?: Transaction): Promise<string[]>;
    queryCommentsByCids(cids: string[], trx?: Transaction): Promise<CommentsTableRow[]>;
    queryCommentByRequestPublicationHash(publicationHash: string, trx?: Transaction): Promise<CommentsTableRow>;
    queryParents(rootComment: Pick<CommentsTableRow, "cid" | "parentCid">, trx?: Transaction): Promise<CommentsTableRow[]>;
    queryAllComments(trx?: Transaction): Promise<CommentsTableRow[]>;
    queryCommentsToBeUpdated(trx?: Transaction): Promise<CommentsTableRow[]>;
    private _calcActiveUserCount;
    private _calcPostCount;
    querySubplebbitStats(trx?: Transaction): Promise<SubplebbitStats>;
    queryCommentsUnderComment(parentCid: string | null, trx?: Transaction): Promise<CommentsTableRow[]>;
    queryComment(cid: string, trx?: Transaction): Promise<CommentsTableRow | undefined>;
    private _queryCommentUpvote;
    private _queryCommentDownvote;
    private _queryCommentCounts;
    private _queryAuthorEdit;
    private _queryLatestModeratorReason;
    queryCommentFlags(cid: string, trx?: Transaction): Promise<Pick<CommentUpdate, "spoiler" | "pinned" | "locked" | "removed">>;
    queryAuthorEditDeleted(cid: string, trx?: Transaction): Promise<AuthorCommentEdit["deleted"] | undefined>;
    private _queryModCommentFlair;
    private _queryLastChildCidAndLastReplyTimestamp;
    queryCalculatedCommentUpdate(comment: Pick<CommentsTableRow, "cid" | "author" | "timestamp">, trx?: Transaction): Promise<Omit<CommentUpdate, "signature" | "updatedAt" | "replies" | "protocolVersion">>;
    queryLatestPostCid(trx?: Transaction): Promise<Pick<CommentsTableRow, "cid">>;
    queryLatestCommentCid(trx?: Transaction): Promise<Pick<CommentsTableRow, "cid">>;
    queryAuthorModEdits(authorAddress: string, trx?: Knex.Transaction): Promise<Pick<SubplebbitAuthor, "banExpiresAt" | "flair">>;
    querySubplebbitAuthor(authorAddress: string, trx?: Knex.Transaction): Promise<SubplebbitAuthor | undefined>;
    changeDbFilename(oldDbName: string, newDbName: string): Promise<void>;
    lockSubStart(subAddress?: string): Promise<void>;
    unlockSubStart(subAddress?: string): Promise<void>;
    isSubStartLocked(subAddress?: string): Promise<boolean>;
    lockSubState(subAddress?: string): Promise<void>;
    unlockSubState(subAddress?: string): Promise<void>;
    subDbExists(subAddress?: string): boolean;
    subAddress(): string;
}