import Database from "better-sqlite3";
import type { PageOptions } from "./page-generator.js";
import type { InternalSubplebbitRecordBeforeFirstUpdateType, SubplebbitStats } from "../../../subplebbit/types.js";
import type { CommentEditsTableRow, CommentEditsTableRowInsert } from "../../../publications/comment-edit/types.js";
import type { CommentsTableRow, CommentsTableRowInsert, CommentUpdatesRow, CommentUpdatesTableRowInsert, CommentUpdateType, SubplebbitAuthor } from "../../../publications/comment/types.js";
import type { PageIpfs } from "../../../pages/types.js";
import type { CommentModerationsTableRowInsert } from "../../../publications/comment-moderation/types.js";
import type { VotesTableRow, VotesTableRowInsert } from "../../../publications/vote/types.js";
import type { PseudonymityAliasRow, CommentCidWithReplies, PurgedCommentTableRows } from "./db-handler-types.js";
export declare class DbHandler {
    private _db;
    private _subplebbit;
    private _transactionDepth;
    private _dbConfig;
    private _keyv;
    private _createdTables;
    constructor(subplebbit: DbHandler["_subplebbit"]);
    private _parsePrefixedComment;
    private _parseCommentsTableRow;
    private _parseCommentUpdatesRow;
    private _parseCommentEditsRow;
    private _parseVoteRow;
    initDbConfigIfNeeded(): Promise<void>;
    toJSON(): undefined;
    initDbIfNeeded(dbConfigOptions?: Partial<DbHandler["_dbConfig"]>): Promise<void>;
    createOrMigrateTablesIfNeeded(): Promise<void>;
    getDbConfig(): {
        filename: string;
    } & Database.Options;
    keyvGet<Value>(key: string): Value | undefined;
    keyvSet(key: string, value: any, ttl?: number): any;
    keyvDelete(key: string): boolean;
    keyvHas(key: string): boolean;
    destoryConnection(): void;
    createTransaction(): void;
    commitTransaction(): void;
    rollbackTransaction(): void;
    rollbackAllTransactions(): Promise<void>;
    private _createCommentsTable;
    private _createCommentUpdatesTable;
    private _createVotesTable;
    private _createCommentEditsTable;
    private _createCommentModerationsTable;
    private _createPseudonymityAliasesTable;
    getDbVersion(): number;
    _migrateOldSettings(oldSettings: InternalSubplebbitRecordBeforeFirstUpdateType["settings"]): {
        fetchThumbnailUrls?: boolean | undefined;
        fetchThumbnailUrlsProxyUrl?: string | undefined;
        challenges?: {
            path?: string | undefined;
            name?: string | undefined;
            options?: Record<string, string> | undefined;
            exclude?: {
                [x: string]: unknown;
                subplebbit?: {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                } | undefined;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
                challenges?: number[] | undefined;
                role?: string[] | undefined;
                address?: string[] | undefined;
                rateLimit?: number | undefined;
                rateLimitChallengeSuccess?: boolean | undefined;
                publicationType?: {
                    [x: string]: unknown;
                    post?: boolean | undefined;
                    reply?: boolean | undefined;
                    vote?: boolean | undefined;
                    commentEdit?: boolean | undefined;
                    commentModeration?: boolean | undefined;
                    subplebbitEdit?: boolean | undefined;
                } | undefined;
            }[] | undefined;
            description?: string | undefined;
            pendingApproval?: boolean | undefined;
        }[] | undefined;
        maxPendingApprovalCount?: number | undefined;
        purgeDisapprovedCommentsOlderThan?: number | undefined;
    };
    _createOrMigrateTablesIfNeeded(): Promise<void>;
    private _tableExists;
    private _backfillApprovedCommentNumbers;
    private _backfillTargetAuthorSignerAddress;
    private _getColumnNames;
    private _copyTable;
    private _purgePublicationTablesWithDuplicateSignatures;
    private _purgeCommentEditsWithInvalidSchemaOrSignature;
    private _purgeCommentsWithInvalidSchemaOrSignature;
    deleteVote(authorSignerAddress: VotesTableRow["authorSignerAddress"], commentCid: VotesTableRow["commentCid"]): void;
    private _deleteCommentEditRow;
    insertVotes(votes: VotesTableRowInsert[]): void;
    insertComments(comments: CommentsTableRowInsert[]): void;
    insertPseudonymityAliases(aliases: PseudonymityAliasRow[]): void;
    upsertCommentUpdates(updates: CommentUpdatesTableRowInsert[]): void;
    insertCommentModerations(moderations: CommentModerationsTableRowInsert[]): void;
    insertCommentEdits(edits: CommentEditsTableRowInsert[]): void;
    queryVote(commentCid: string, authorSignerAddress: string): VotesTableRow | undefined;
    private _approvedClause;
    private _removedClause;
    private _deletedFromUpdatesClause;
    private _deletedFromLookupClause;
    private _pendingApprovalClause;
    private _buildPageQueryParts;
    queryMaximumTimestampUnderComment(comment: Pick<CommentsTableRow, "cid">): number | undefined;
    queryPageComments(options: Omit<PageOptions, "firstPageSizeBytes">): PageIpfs["comments"];
    queryFlattenedPageReplies(options: Omit<PageOptions, "firstPageSizeBytes"> & {
        parentCid: string;
    }): PageIpfs["comments"];
    queryStoredCommentUpdate(comment: Pick<CommentsTableRow, "cid">): CommentUpdatesRow | undefined;
    hasCommentWithSignatureEncoded(signatureEncoded: string): boolean;
    hasCommentModerationWithSignatureEncoded(signatureEncoded: string): boolean;
    hasCommentEditWithSignatureEncoded(signatureEncoded: string): boolean;
    queryParentsCids(rootComment: Pick<CommentsTableRow, "parentCid">): Pick<CommentsTableRow, "cid">[];
    queryCommentsPendingApproval(): CommentsTableRow[];
    queryCommentsToBeUpdated(): CommentsTableRow[];
    querySubplebbitStats(): SubplebbitStats;
    queryCommentsUnderComment(parentCid: string | null): CommentsTableRow[];
    queryFirstCommentWithDepth(commentDepth: number): CommentsTableRow | undefined;
    queryCombinedHashOfPendingComments(): string;
    queryComment(cid: string): CommentsTableRow | undefined;
    queryPseudonymityAliasByCommentCid(commentCid: string): PseudonymityAliasRow | undefined;
    queryPseudonymityAliasForPost(originalAuthorSignerPublicKey: string, postCid: string): PseudonymityAliasRow | undefined;
    queryPseudonymityAliasForAuthor(originalAuthorSignerPublicKey: string): PseudonymityAliasRow | undefined;
    private _queryCommentAuthorAndParentWithoutParsing;
    private _queryCommentCounts;
    queryPostsWithOutdatedBuckets(buckets: number[]): {
        cid: string;
        timestamp: number;
        currentBucket: number;
        newBucket: number;
    }[];
    private _queryLatestAuthorEdit;
    removeCommentFromPendingApproval(comment: Pick<CommentsTableRow, "cid">): void;
    approvePendingComment(comment: Pick<CommentsTableRow, "cid">): {
        number?: number;
        postNumber?: number;
    };
    getNextCommentNumbers(depth: number): {
        number: number;
        postNumber?: number;
    };
    _assignNumbersForComment(commentCid: string): {
        number?: number;
        postNumber?: number;
    };
    removeOldestPendingCommentIfWeHitMaxPendingCount(maxPendingApprovalCount: number): void;
    purgeDisapprovedCommentsOlderThan(retentionSeconds: number): {
        cid: string;
        parentCid?: string | null;
        postUpdatesBucket?: number;
        purgedTableRows: PurgedCommentTableRows[];
    }[] | undefined;
    private _queryLatestModeratorReason;
    queryCommentFlagsSetByMod(cid: string): Pick<CommentUpdateType, "spoiler" | "pinned" | "locked" | "removed" | "nsfw">;
    queryAuthorEditDeleted(cid: string): Pick<CommentEditsTableRow, "deleted"> | undefined;
    private _queryModCommentFlair;
    private _queryLastChildCidAndLastReplyTimestamp;
    _queryIsCommentApproved(comment: Pick<CommentsTableRow, "cid" | "authorSignerAddress" | "timestamp">): {
        approved: boolean;
    } | undefined;
    private _calculateCommentNumbers;
    queryCalculatedCommentUpdate(comment: Pick<CommentsTableRow, "cid" | "authorSignerAddress" | "timestamp">): Omit<CommentUpdateType, "signature" | "updatedAt" | "replies" | "protocolVersion">;
    queryLatestPostCid(): Pick<CommentsTableRow, "cid"> | undefined;
    queryLatestCommentCid(): Pick<CommentsTableRow, "cid"> | undefined;
    queryAllCommentsOrderedByIdAsc(): CommentsTableRow[];
    queryAuthorModEdits(authorSignerAddresses: string[]): Pick<SubplebbitAuthor, "banExpiresAt" | "flair">;
    querySubplebbitAuthor(authorSignerAddress: string): SubplebbitAuthor | undefined;
    /** Shared helper: query karma for a set of addresses, with optional separate addresses for mod edits */
    private _querySubplebbitAuthorByAddresses;
    /**
     * Returns author.subplebbit for CommentUpdates, respecting pseudonymity mode boundaries.
     *
     * The alias address already encodes the isolation boundary:
     * - per-reply: Each reply has a unique alias, so querying by alias = that one comment's karma
     * - per-post: All comments in a thread share an alias, so querying by alias = thread karma
     * - per-author: One alias for all comments, so querying by alias = total karma
     *
     * We query karma for ONLY the alias address (no lookup to other aliases like querySubplebbitAuthor does),
     * but include mod edits from both alias and original author.
     */
    querySubplebbitAuthorForCommentUpdate(opts: {
        authorSignerAddress: string;
        commentCid: string;
    }): SubplebbitAuthor | undefined;
    private _getAllDescendantCids;
    purgeComment(cid: string, isNestedCall?: boolean): PurgedCommentTableRows[];
    changeDbFilename(oldDbName: string, newDbName: string): Promise<void>;
    lockSubStart(subAddress?: string): Promise<void>;
    unlockSubStart(subAddress?: string): Promise<void>;
    isSubStartLocked(subAddress?: string): Promise<boolean>;
    lockSubState(): Promise<void>;
    unlockSubState(): Promise<void>;
    subDbExists(): boolean;
    markCommentsAsPublishedToPostUpdates(commentCids: string[]): void;
    forceUpdateOnAllComments(): void;
    forceUpdateOnAllCommentsWithCid(commentCids: string[]): void;
    queryAllCommentCidsAndTheirReplies(): CommentCidWithReplies[];
    queryPostsWithActiveScore(pageOptions: Omit<PageOptions, "pageSize" | "preloadedPage" | "baseTimestamp" | "firstPageSizeBytes">): (PageIpfs["comments"][0] & {
        activeScore: number;
    })[];
    private _processRecordsForDbBeforeInsert;
    private _spreadExtraProps;
}
