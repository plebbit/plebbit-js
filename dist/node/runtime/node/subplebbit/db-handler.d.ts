import Database from "better-sqlite3";
import type { PageOptions } from "./page-generator.js";
import type { InternalSubplebbitRecordBeforeFirstUpdateType, SubplebbitStats } from "../../../subplebbit/types.js";
import type { CommentEditsTableRow, CommentEditsTableRowInsert } from "../../../publications/comment-edit/types.js";
import type { CommentsTableRow, CommentsTableRowInsert, CommentUpdatesRow, CommentUpdatesTableRowInsert, CommentUpdateType, SubplebbitAuthor } from "../../../publications/comment/types.js";
import type { PageIpfs } from "../../../pages/types.js";
import type { CommentModerationsTableRowInsert } from "../../../publications/comment-moderation/types.js";
import type { VotesTableRow, VotesTableRowInsert } from "../../../publications/vote/types.js";
export declare class DbHandler {
    private _db;
    private _subplebbit;
    private _transactionDepth;
    private _dbConfig;
    private _keyv;
    private _createdTables;
    constructor(subplebbit: DbHandler["_subplebbit"]);
    initDbConfigIfNeeded(): Promise<void>;
    toJSON(): undefined;
    initDbIfNeeded(dbConfigOptions?: Partial<DbHandler["_dbConfig"]>): Promise<void>;
    createOrMigrateTablesIfNeeded(): Promise<void>;
    getDbConfig(): {
        filename: string;
    } & Database.Options;
    keyvGet<Value>(key: string): Promise<Value | undefined>;
    keyvSet(key: string, value: any, ttl?: number): Promise<any>;
    keyvDelete(key: string): Promise<boolean>;
    keyvHas(key: string): Promise<boolean>;
    destoryConnection(): Promise<void>;
    createTransaction(): void;
    commitTransaction(): void;
    rollbackTransaction(): void;
    rollbackAllTransactions(): Promise<void>;
    private _parseJsonFields;
    private _intToBoolean;
    private _createCommentsTable;
    private _createCommentUpdatesTable;
    private _createVotesTable;
    private _createCommentEditsTable;
    private _createCommentModerationsTable;
    getDbVersion(): number;
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
                role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodUnion<[import("zod").ZodEnum<["owner", "admin", "moderator"]>, import("zod").ZodString]>, "many">>;
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
                role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodUnion<[import("zod").ZodEnum<["owner", "admin", "moderator"]>, import("zod").ZodString]>, "many">>;
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
    private _tableExists;
    private _getColumnNames;
    private _copyTable;
    private _purgeCommentsWithInvalidSchemaOrSignature;
    private _moveCommentEditsToModAuthorTables;
    deleteVote(authorSignerAddress: VotesTableRow["authorSignerAddress"], commentCid: VotesTableRow["commentCid"]): void;
    insertVotes(votes: VotesTableRowInsert[]): void;
    insertComments(comments: CommentsTableRowInsert[]): void;
    upsertCommentUpdates(updates: CommentUpdatesTableRowInsert[]): void;
    insertCommentModerations(moderations: CommentModerationsTableRowInsert[]): void;
    insertCommentEdits(edits: CommentEditsTableRowInsert[]): void;
    queryVote(commentCid: string, authorSignerAddress: string): VotesTableRow | undefined;
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
    queryCommentsToBeUpdated(): CommentsTableRow[];
    querySubplebbitStats(): SubplebbitStats;
    queryCommentsUnderComment(parentCid: string | null): CommentsTableRow[];
    queryComment(cid: string): CommentsTableRow | undefined;
    private _queryCommentCounts;
    queryPostsWithOutdatedBuckets(buckets: number[]): {
        cid: string;
        timestamp: number;
        currentBucket: number;
        newBucket: number;
    }[];
    private _queryLatestAuthorEdit;
    private _queryLatestModeratorReason;
    queryCommentFlagsSetByMod(cid: string): Pick<CommentUpdateType, "spoiler" | "pinned" | "locked" | "removed" | "nsfw">;
    queryAuthorEditDeleted(cid: string): Pick<CommentEditsTableRow, "deleted"> | undefined;
    private _queryModCommentFlair;
    private _queryLastChildCidAndLastReplyTimestamp;
    queryCalculatedCommentUpdate(comment: Pick<CommentsTableRow, "cid" | "authorSignerAddress" | "timestamp">): Omit<CommentUpdateType, "signature" | "updatedAt" | "replies" | "protocolVersion">;
    queryLatestPostCid(): Pick<CommentsTableRow, "cid"> | undefined;
    queryLatestCommentCid(): Pick<CommentsTableRow, "cid"> | undefined;
    queryAllCommentsOrderedByIdAsc(): CommentsTableRow[];
    queryAuthorModEdits(authorSignerAddress: string): Pick<SubplebbitAuthor, "banExpiresAt" | "flair">;
    querySubplebbitAuthor(authorSignerAddress: string): SubplebbitAuthor | undefined;
    purgeComment(cid: string, isNestedCall?: boolean): string[];
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
    queryAllCidsUnderThisSubplebbit(): Set<string>;
    queryPostsWithActiveScore(pageOptions: Omit<PageOptions, "pageSize" | "preloadedPage" | "baseTimestamp" | "firstPageSizeBytes">): (PageIpfs["comments"][0] & {
        activeScore: number;
    })[];
    private _processRecordsForDbBeforeInsert;
    private _spreadExtraProps;
}
