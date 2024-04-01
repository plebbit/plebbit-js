import { throwWithErrorCode, TIMEFRAMES_TO_SECONDS, timestamp } from "../../../util.js";
import knex, { Knex } from "knex";
import path from "path";
import assert from "assert";
import fs from "fs";
import os from "os";
import Keyv from "keyv";
import Transaction = Knex.Transaction;
import {
    AuthorCommentEdit,
    CommentEditsTableRow,
    CommentEditsTableRowInsert,
    CommentsTableRow,
    CommentsTableRowInsert,
    CommentUpdate,
    CommentUpdatesRow,
    CommentUpdatesTableRowInsert,
    CommentWithCommentUpdate,
    SubplebbitAuthor,
    VotesTableRow,
    VotesTableRowInsert
} from "../../../types.js";
import Logger from "@plebbit/plebbit-logger";
import { deleteOldSubplebbitInWindows, getDefaultSubplebbitDbConfig } from "../util.js";
import env from "../../../version.js";

//@ts-expect-error
import * as lockfile from "@plebbit/proper-lockfile";
import { PageOptions } from "./sort-handler.js";
import { SubplebbitStats } from "../../../subplebbit/types.js";
import { v4 as uuidV4 } from "uuid";
import { AUTHOR_EDIT_FIELDS, CommentUpdateSignedPropertyNames } from "../../../signer/constants.js";
import { LocalSubplebbit } from "./local-subplebbit.js";
import { getPlebbitAddressFromPublicKey } from "../../../signer/util.js";
import * as remeda from "remeda";

const TABLES = Object.freeze({
    COMMENTS: "comments",
    COMMENT_UPDATES: "commentUpdates",
    VOTES: "votes",
    COMMENT_EDITS: "commentEdits"
});

export class DbHandler {
    private _knex!: Knex;
    private _subplebbit!: LocalSubplebbit;
    private _currentTrxs!: Record<string, Transaction>; // Prefix to Transaction. Prefix represents all trx under a pubsub message or challenge
    private _dbConfig!: Knex.Config<any>;
    private _keyv!: Keyv;
    private _createdTables: boolean;

    constructor(subplebbit: DbHandler["_subplebbit"]) {
        this._subplebbit = subplebbit;
        this._currentTrxs = {};
        this._createdTables = false;
    }

    async initDbConfigIfNeeded() {
        if (!this._dbConfig) this._dbConfig = await getDefaultSubplebbitDbConfig(this._subplebbit);
    }

    toJSON() {
        return undefined;
    }

    async initDbIfNeeded() {
        const log = Logger("plebbit-js:subplebbit:db-handler:initDbIfNeeded");
        assert(
            typeof this._subplebbit.address === "string" && this._subplebbit.address.length > 0,
            `DbHandler needs to be an instantiated with a Subplebbit that has a valid address, (${this._subplebbit.address}) was provided`
        );
        await this.initDbConfigIfNeeded();
        if (!this._knex) this._knex = knex(this._dbConfig);
        if (!this._createdTables)
            try {
                await this.createTablesIfNeeded();
            } catch (e) {
                log.error(
                    `Sub (${
                        this._subplebbit.address
                    }) failed to create/migrate tables. Current db version (${await this.getDbVersion()}), latest db version (${
                        env.DB_VERSION
                    }). Error`,
                    e
                );
                throw e;
            }
        if (!this._keyv) this._keyv = new Keyv(`sqlite://${(<any>this._dbConfig.connection).filename}`);
    }

    getDbConfig(): Knex.Config {
        return this._dbConfig;
    }

    async keyvGet(key: string, options?: { raw?: false }) {
        const res = await this._keyv.get(key, options);
        return res;
    }

    async keyvSet(key: string, value: any, ttl?: number) {
        const res = await this._keyv.set(key, value, ttl);
        return res;
    }

    async keyvDelete(key: string | string[]) {
        const res = await this._keyv.delete(key);
        return res;
    }

    async keyvHas(key: string) {
        const res = await this._keyv.has(key);
        return res;
    }

    async initDestroyedConnection() {
        this._knex.initialize();
    }

    async destoryConnection() {
        await this._knex!.destroy();
        await this._keyv.disconnect();
    }
    async createTransaction(transactionId: string): Promise<Transaction> {
        assert(!this._currentTrxs[transactionId]);
        const trx = await this._knex.transaction();
        this._currentTrxs[transactionId] = trx;
        return trx;
    }

    async commitTransaction(transactionId: string) {
        const trx: Transaction = this._currentTrxs[transactionId];
        // assert(trx && trx.isTransaction && !trx.isCompleted(), `Transaction (${transactionId}) needs to be stored to commit`);
        await this._currentTrxs[transactionId].commit();
        delete this._currentTrxs[transactionId];
    }

    async rollbackTransaction(transactionId: string) {
        const log = Logger("plebbit-js:db-handler:rollbackTransaction");

        const trx: Transaction = this._currentTrxs[transactionId];
        if (trx) {
            assert(trx.isTransaction, `Transaction (${transactionId}) needs to be stored to rollback`);
            if (trx.isCompleted()) return;
            await this._currentTrxs[transactionId].rollback();
            delete this._currentTrxs[transactionId];
        }

        log.trace(
            `Rolledback transaction (${transactionId}), this._currentTrxs[transactionId].length = ${Object.keys(this._currentTrxs).length}`
        );
    }

    async rollbackAllTransactions() {
        return Promise.all(Object.keys(this._currentTrxs).map((trxId) => this.rollbackTransaction(trxId)));
    }

    private _baseTransaction(trx?: Transaction): Transaction | Knex {
        return trx ? trx : this._knex;
    }

    private async _createCommentsTable(tableName: string) {
        await this._knex.schema.createTable(tableName, (table) => {
            table.text("cid").notNullable().primary().unique();
            table.text("authorAddress").notNullable();
            table.text("authorSignerAddress").notNullable();
            table.json("author").notNullable();
            table.string("link").nullable();
            table.integer("linkWidth").nullable().checkPositive();
            table.integer("linkHeight").nullable().checkPositive();
            table.string("thumbnailUrl").nullable();
            table.integer("thumbnailUrlWidth").nullable();
            table.integer("thumbnailUrlHeight").nullable();
            table.text("parentCid").nullable().references("cid").inTable(TABLES.COMMENTS);
            table.text("postCid").notNullable().references("cid").inTable(TABLES.COMMENTS);
            table.text("previousCid").nullable().references("cid").inTable(TABLES.COMMENTS);

            table.text("subplebbitAddress").notNullable();
            table.text("content").nullable();
            table.timestamp("timestamp").notNullable().checkBetween([0, Number.MAX_SAFE_INTEGER]);
            table.text("ipnsName").nullable(); // Kept for compatibility purposes, will not be used from db version 11 and onward
            table.json("signature").notNullable().unique(); // Will contain {signature, public key, type}
            table.text("title").nullable();
            table.integer("depth").notNullable().checkBetween([0, Number.MAX_SAFE_INTEGER]);
            table.text("challengeRequestPublicationSha256").notNullable().unique();

            table.json("flair").nullable();

            table.boolean("spoiler");

            table.text("protocolVersion").notNullable();

            table.increments("id"); // Used for sorts
            table.timestamp("insertedAt").defaultTo(this._knex.raw("(strftime('%s', 'now'))")); // Timestamp of when it was first inserted in the table
        });
    }

    private async _createCommentUpdatesTable(tableName: string) {
        await this._knex.schema.createTable(tableName, (table) => {
            table.text("cid").notNullable().primary().unique().references("cid").inTable(TABLES.COMMENTS);

            table.json("edit").nullable();
            table.integer("upvoteCount").notNullable().checkBetween([0, Number.MAX_SAFE_INTEGER]);
            table.integer("downvoteCount").notNullable().checkBetween([0, Number.MAX_SAFE_INTEGER]);

            table.integer("replyCount").notNullable().checkBetween([0, Number.MAX_SAFE_INTEGER]);
            table.json("flair").nullable();
            table.boolean("spoiler");
            table.boolean("pinned");
            table.boolean("locked");
            table.boolean("removed");
            table.text("reason");
            table.timestamp("updatedAt").notNullable().checkPositive();
            table.text("protocolVersion").notNullable();
            table.json("signature").notNullable().unique(); // Will contain {signature, public key, type}
            table.json("author").nullable();
            table.json("replies").nullable(); // TODO we should not be storing replies here, it takes too much storage
            table.text("lastChildCid").nullable().references("cid").inTable(TABLES.COMMENTS);
            table.timestamp("lastReplyTimestamp").nullable();

            // Not part of CommentUpdate
            table.text("ipfsPath").notNullable().unique();

            // Columns with defaults
            table.timestamp("insertedAt").defaultTo(this._knex.raw("(strftime('%s', 'now'))")); // Timestamp of when it was first inserted in the table
        });
    }

    private async _createVotesTable(tableName: string) {
        await this._knex.schema.createTable(tableName, (table) => {
            table.text("commentCid").notNullable().references("cid").inTable(TABLES.COMMENTS);
            table.text("authorAddress").notNullable();
            table.text("authorSignerAddress").notNullable();
            table.json("author").notNullable();

            table.timestamp("timestamp").checkPositive().notNullable();
            table.text("subplebbitAddress").notNullable();
            table.integer("vote").checkBetween([-1, 1]).notNullable();
            table.json("signature").notNullable().unique();
            table.text("protocolVersion").notNullable();
            table.timestamp("insertedAt").defaultTo(this._knex.raw("(strftime('%s', 'now'))")); // Timestamp of when it was first inserted in the table

            table.primary(["commentCid", "authorSignerAddress"]); // An author can't have multiple votes on a comment
        });
    }

    private async _createCommentEditsTable(tableName: string) {
        await this._knex.schema.createTable(tableName, (table) => {
            table.text("commentCid").notNullable().references("cid").inTable(TABLES.COMMENTS);
            table.text("authorAddress").notNullable();
            table.text("authorSignerAddress").notNullable();
            table.json("author").notNullable();
            table.json("signature").notNullable().unique();
            table.text("protocolVersion").notNullable();
            table.increments("id"); // Used for sorts

            table.timestamp("timestamp").checkPositive().notNullable();
            table.text("subplebbitAddress").notNullable();
            table.text("content").nullable();
            table.text("reason").nullable();
            table.boolean("deleted").nullable();
            table.json("flair").nullable();
            table.boolean("spoiler").nullable();
            table.boolean("pinned").nullable();
            table.boolean("locked").nullable();
            table.boolean("removed").nullable();
            table.json("commentAuthor").nullable();
            table.boolean("isAuthorEdit").notNullable(); // If false, then it's a mod edit

            table.timestamp("insertedAt").defaultTo(this._knex.raw("(strftime('%s', 'now'))")); // Timestamp of when it was first inserted in the table
            table.primary(["id", "commentCid"]);
        });
    }

    async getDbVersion(): Promise<number> {
        return Number((await this._knex.raw("PRAGMA user_version"))[0]["user_version"]);
    }

    async createTablesIfNeeded() {
        const log = Logger("plebbit-js:db-handler:createTablesIfNeeded");

        const currentDbVersion = await this.getDbVersion();

        log.trace(`current db version: ${currentDbVersion}`);
        const needToMigrate = currentDbVersion < env.DB_VERSION;
        if (needToMigrate) {
            await this._knex.raw("PRAGMA foreign_keys = OFF");

            // Remove unneeded tables
            await Promise.all(
                ["challengeRequests", "challenges", "challengeAnswers", "challengeVerifications", "signers"].map((tableName) =>
                    this._knex.schema.dropTableIfExists(tableName)
                )
            );

            await this._knex.schema.dropTableIfExists(TABLES.COMMENT_UPDATES); // To trigger an update
        }

        const createTableFunctions = [
            this._createCommentsTable,
            this._createCommentUpdatesTable,
            this._createVotesTable,
            this._createCommentEditsTable
        ];
        const tables = Object.values(TABLES);

        for (let i = 0; i < tables.length; i++) {
            const tableName = tables[i];
            const tableExists = await this._knex.schema.hasTable(tableName);
            if (!tableExists) {
                log(`Table ${tableName} does not exist. Will create schema`);
                await createTableFunctions[i].bind(this)(tableName);
            } else if (tableExists && needToMigrate) {
                // We need to update the schema of the currently existing table
                log(`Migrating table ${tableName} to new schema`);
                const tempTableName = `${tableName}${env.DB_VERSION}`;
                await this._knex.schema.dropTableIfExists(tempTableName);
                await createTableFunctions[i].bind(this)(tempTableName);
                await this._copyTable(tableName, tempTableName, currentDbVersion);
                await this._knex.schema.dropTable(tableName);
                await this._knex.schema.renameTable(tempTableName, tableName);
            }
        }

        if (needToMigrate) {
            await this._knex.raw("PRAGMA foreign_keys = ON");
            await this._knex.raw(`PRAGMA user_version = ${env.DB_VERSION}`);
        }
        const newDbVersion = await this.getDbVersion();
        assert.equal(newDbVersion, env.DB_VERSION);
        this._createdTables = true;
    }

    private async _copyTable(srcTable: string, dstTable: string, currentDbVersion: number) {
        const log = Logger("plebbit-js:db-handler:createTablesIfNeeded:copyTable");
        const dstTableColumns: string[] = Object.keys(await this._knex(dstTable).columnInfo());
        const srcRecords: any[] = await this._knex(srcTable).select("*");
        if (srcRecords.length > 0) {
            log(`Attempting to copy ${srcRecords.length} ${srcTable}`);
            // Remove fields that are not in dst table. Will prevent errors when migration from db version 2 to 3
            const srcRecordFiltered = srcRecords.map((record) => remeda.pick(record, dstTableColumns));
            // Need to make sure that array fields are json strings
            for (const srcRecord of srcRecordFiltered) {
                for (const srcRecordKey of Object.keys(srcRecord))
                    if (Array.isArray(srcRecord[srcRecordKey])) {
                        srcRecord[srcRecordKey] = JSON.stringify(srcRecord[srcRecordKey]);
                        assert(srcRecord[srcRecordKey] !== "[object Object]", "DB value shouldn't be [object Object]");
                    }
                // Migration from version 10 to 11
                if (currentDbVersion <= 10 && srcTable === TABLES.COMMENTS) {
                    srcRecord["challengeRequestPublicationSha256"] = `random-place-holder-${uuidV4()}`; // We just need the copy to work. The new comments will have a correct hash
                }
                if (currentDbVersion <= 11 && srcTable === TABLES.COMMENT_EDITS) {
                    // Need to compute isAuthorEdit column
                    const editWithType = <Omit<CommentEditsTableRow, "isAuthorEdit">>srcRecord;
                    const commentToBeEdited = await this.queryComment(editWithType.commentCid);
                    if (!commentToBeEdited) throw Error("Failed to compute isAuthorEdit column");
                    const editHasBeenSignedByOriginalAuthor = editWithType.signature.publicKey === commentToBeEdited.signature.publicKey;
                    srcRecord["isAuthorEdit"] = this._subplebbit._isAuthorEdit(editWithType, editHasBeenSignedByOriginalAuthor);
                }

                if (currentDbVersion <= 12 && srcRecord["authorAddress"]) {
                    srcRecord["authorSignerAddress"] = await getPlebbitAddressFromPublicKey(srcRecord["signature"]["publicKey"]);
                }
            }

            // Have to use a for loop because if I inserted them as a whole it throw a "UNIQUE constraint failed: comments6.signature"
            // Probably can be fixed but not worth the time
            for (const srcRecord of srcRecordFiltered) await this._knex(dstTable).insert(srcRecord);
        }
        log(`copied table ${srcTable} to table ${dstTable}`);
    }

    async deleteVote(
        authorSignerAddress: VotesTableRow["authorSignerAddress"],
        commentCid: VotesTableRow["commentCid"],
        trx?: Transaction
    ) {
        await this._baseTransaction(trx)(TABLES.VOTES)
            .where("commentCid", commentCid)
            .where("authorSignerAddress", authorSignerAddress)
            .del();
    }

    async insertVote(vote: VotesTableRowInsert, trx?: Transaction) {
        await this._baseTransaction(trx)(TABLES.VOTES).insert(vote);
    }

    async insertComment(comment: CommentsTableRowInsert, trx?: Transaction) {
        await this._baseTransaction(trx)(TABLES.COMMENTS).insert(comment);
    }

    async upsertCommentUpdate(update: CommentUpdatesTableRowInsert, trx?: Transaction) {
        await this._baseTransaction(trx)(TABLES.COMMENT_UPDATES).insert(update).onConflict(["cid"]).merge();
    }

    async insertEdit(edit: CommentEditsTableRowInsert, trx?: Transaction) {
        await this._baseTransaction(trx)(TABLES.COMMENT_EDITS).insert(edit);
    }

    async getStoredVoteOfAuthor(commentCid: string, authorSignerAddress: string, trx?: Transaction): Promise<VotesTableRow | undefined> {
        return this._baseTransaction(trx)(TABLES.VOTES)
            .where({
                commentCid: commentCid,
                authorSignerAddress
            })
            .first();
    }

    private _basePageQuery(options: Omit<PageOptions, "pageSize">, trx?: Transaction) {
        let query = this._baseTransaction(trx)(TABLES.COMMENTS)
            .innerJoin(TABLES.COMMENT_UPDATES, `${TABLES.COMMENTS}.cid`, `${TABLES.COMMENT_UPDATES}.cid`)
            .jsonExtract(`${TABLES.COMMENT_UPDATES}.edit`, "$.deleted", "deleted", true)
            .where("parentCid", options.parentCid);

        if (options.excludeCommentsWithDifferentSubAddress) query = query.where({ subplebbitAddress: this._subplebbit.address });
        if (options.excludeRemovedComments) query = query.andWhereRaw(`${TABLES.COMMENT_UPDATES}.removed is not 1`);
        if (options.excludeDeletedComments) query = query.andWhereRaw("`deleted` is not 1");

        return query;
    }

    async queryReplyCount(commentCid: string, trx?: Transaction): Promise<number> {
        const options = {
            excludeCommentsWithDifferentSubAddress: true,
            excludeDeletedComments: true,
            excludeRemovedComments: true,
            parentCid: commentCid
        };
        const children = await this.queryCommentsForPages(options, trx);

        return children.length + remeda.sum(await Promise.all(children.map((comment) => this.queryReplyCount(comment.comment.cid, trx))));
    }

    async queryActiveScore(comment: Pick<CommentsTableRow, "cid" | "timestamp">, trx?: Transaction): Promise<number> {
        let maxTimestamp = comment.timestamp;
        // Note: active score will include deleted and removed comments

        const updateMaxTimestamp = async (localComments: CommentsTableRow[]) => {
            for (const commentChild of localComments) {
                if (commentChild.timestamp > maxTimestamp) maxTimestamp = commentChild.timestamp;
                const children = await this.queryCommentsUnderComment(commentChild.cid, trx);
                if (children.length > 0) await updateMaxTimestamp(children);
            }
        };

        const children = await this.queryCommentsUnderComment(comment.cid, trx);
        if (children.length > 0) await updateMaxTimestamp(children);

        return maxTimestamp;
    }

    async queryCommentsForPages(
        options: Omit<PageOptions, "pageSize">,
        trx?: Transaction
    ): Promise<{ comment: CommentsTableRow; update: CommentUpdatesRow }[]> {
        // protocolVersion, signature
        const commentUpdateColumns: (keyof CommentUpdate)[] = [...CommentUpdateSignedPropertyNames, "protocolVersion", "signature"];
        const aliasSelect = commentUpdateColumns.map((col) => `${TABLES.COMMENT_UPDATES}.${col} AS commentUpdate_${col}`);

        const commentsRaw: CommentsTableRow[] = await this._basePageQuery(options, trx).select([`${TABLES.COMMENTS}.*`, ...aliasSelect]);

        //@ts-expect-error
        const comments: { comment: CommentsTableRow; update: CommentUpdatesRow }[] = commentsRaw.map((commentRaw) => ({
            comment: remeda.pickBy(commentRaw, (value, key) => !key.startsWith("commentUpdate_")),
            update: remeda.mapKeys(
                remeda.pickBy(commentRaw, (value, key) => key.startsWith("commentUpdate_")),
                (key, value) => key.replace("commentUpdate_", "")
            )
        }));

        return comments;
    }

    async queryStoredCommentUpdate(comment: Pick<CommentsTableRow, "cid">, trx?: Transaction): Promise<CommentUpdatesRow | undefined> {
        return this._baseTransaction(trx)(TABLES.COMMENT_UPDATES).where("cid", comment.cid).first();
    }

    async queryAllStoredCommentUpdates(trx?: Transaction) {
        return this._baseTransaction(trx)(TABLES.COMMENT_UPDATES);
    }

    async queryCommentUpdatesOfPostsForBucketAdjustment(
        trx?: Transaction
    ): Promise<(Pick<CommentsTableRow, "timestamp" | "cid"> & Pick<CommentUpdatesRow, "ipfsPath">)[]> {
        return this._baseTransaction(trx)(TABLES.COMMENTS)
            .innerJoin(TABLES.COMMENT_UPDATES, `${TABLES.COMMENTS}.cid`, `${TABLES.COMMENT_UPDATES}.cid`)
            .select(`${TABLES.COMMENT_UPDATES}.ipfsPath`, `${TABLES.COMMENTS}.timestamp`, `${TABLES.COMMENTS}.cid`)
            .where("depth", 0);
    }

    async deleteAllCommentUpdateRows(trx?: Transaction) {
        return this._baseTransaction(trx)(TABLES.COMMENT_UPDATES).del();
    }

    async queryCommentsUpdatesWithPostCid(postCid: string, trx?: Transaction): Promise<CommentUpdatesRow[]> {
        return this._baseTransaction(trx)(TABLES.COMMENTS)
            .innerJoin(TABLES.COMMENT_UPDATES, `${TABLES.COMMENTS}.cid`, `${TABLES.COMMENT_UPDATES}.cid`)
            .where(`${TABLES.COMMENTS}.postCid`, postCid)
            .select(`${TABLES.COMMENT_UPDATES}.*`);
    }

    async queryCommentsOfAuthors(authorSignerAddresses: string | string[], trx?: Transaction): Promise<CommentsTableRow[]> {
        if (!Array.isArray(authorSignerAddresses)) authorSignerAddresses = [authorSignerAddresses];
        return this._baseTransaction(trx)(TABLES.COMMENTS).whereIn("authorSignerAddress", authorSignerAddresses);
    }

    async queryAllCommentsCid(trx?: Transaction): Promise<string[]> {
        const res = await this._baseTransaction(trx)(TABLES.COMMENTS).select("cid");
        return res.map((row) => row.cid);
    }

    async queryCommentsByCids(cids: string[], trx?: Transaction): Promise<CommentsTableRow[]> {
        return this._baseTransaction(trx)(TABLES.COMMENTS).whereIn("cid", cids);
    }

    async queryCommentByRequestPublicationHash(publicationHash: string, trx?: Transaction) {
        return this._baseTransaction(trx)(TABLES.COMMENTS).where("challengeRequestPublicationSha256", publicationHash).first();
    }

    async queryParents(rootComment: Pick<CommentsTableRow, "cid" | "parentCid">, trx?: Transaction): Promise<CommentsTableRow[]> {
        const parents: CommentsTableRow[] = [];
        let curParentCid = rootComment.parentCid;
        while (curParentCid) {
            const parent = await this.queryComment(curParentCid, trx);
            if (parent) parents.push(parent);
            curParentCid = parent?.parentCid;
        }
        return parents;
    }

    async queryCommentsToBeUpdated(trx?: Transaction): Promise<CommentsTableRow[]> {
        // Criteria:
        // 1 - Comment has no row in commentUpdates (has never published CommentUpdate) OR
        // 2 - commentUpdate.updatedAt is less or equal to max of insertedAt of child votes, comments or commentEdit OR
        // 3 - Comments that new votes, CommentEdit or other comments were published under them

        // After retrieving all comments with any of criteria above, also add their parents to the list to update
        // Also for each comment, add the previous comments of its author to update them too

        const criteriaOne: CommentsTableRow[] = await this._baseTransaction(trx)(TABLES.COMMENTS)
            .select(`${TABLES.COMMENTS}.*`)
            .leftJoin(TABLES.COMMENT_UPDATES, `${TABLES.COMMENTS}.cid`, `${TABLES.COMMENT_UPDATES}.cid`)
            .whereNull(`${TABLES.COMMENT_UPDATES}.updatedAt`);
        const lastUpdatedAtWithBuffer = this._knex.raw("`lastUpdatedAt` - 1");
        // @ts-expect-error
        const criteriaTwoThree: CommentsTableRow[] = await this._baseTransaction(trx)(TABLES.COMMENTS)
            .select(`${TABLES.COMMENTS}.*`)
            .innerJoin(TABLES.COMMENT_UPDATES, `${TABLES.COMMENTS}.cid`, `${TABLES.COMMENT_UPDATES}.cid`)
            .leftJoin(TABLES.VOTES, `${TABLES.COMMENTS}.cid`, `${TABLES.VOTES}.commentCid`)
            .leftJoin(TABLES.COMMENT_EDITS, `${TABLES.COMMENTS}.cid`, `${TABLES.COMMENT_EDITS}.commentCid`)
            .leftJoin({ childrenComments: TABLES.COMMENTS }, `${TABLES.COMMENTS}.cid`, `childrenComments.parentCid`)
            .max({
                voteLastInsertedAt: `${TABLES.VOTES}.insertedAt`,
                editLastInsertedAt: `${TABLES.COMMENT_EDITS}.insertedAt`,
                childCommentLastInsertedAt: `childrenComments.insertedAt`,
                lastUpdatedAt: `${TABLES.COMMENT_UPDATES}.updatedAt`
            })
            .groupBy(`${TABLES.COMMENTS}.cid`)
            .having(`voteLastInsertedAt`, ">=", lastUpdatedAtWithBuffer)
            .orHaving(`editLastInsertedAt`, ">=", lastUpdatedAtWithBuffer)
            .orHaving(`childCommentLastInsertedAt`, ">=", lastUpdatedAtWithBuffer);

        const comments = remeda.uniqueBy([...criteriaOne, ...criteriaTwoThree], (comment) => comment.cid);

        const parents = remeda.flattenDeep(
            await Promise.all(comments.filter((comment) => comment.parentCid).map((comment) => this.queryParents(comment, trx)))
        );
        const authorComments = await this.queryCommentsOfAuthors(
            remeda.unique(comments.map((comment) => comment.authorSignerAddress)),
            trx
        );
        const uniqComments = remeda.uniqueBy([...comments, ...parents, ...authorComments], (comment) => comment.cid);

        return uniqComments;
    }

    private _calcActiveUserCount(
        commentsRaw: Pick<CommentsTableRow, "depth" | "authorSignerAddress" | "timestamp">[],
        votesRaw: Pick<VotesTableRow, "authorSignerAddress" | "timestamp">[]
    ) {
        const timeframes = <(keyof typeof TIMEFRAMES_TO_SECONDS)[]>Object.keys(TIMEFRAMES_TO_SECONDS);
        const res = {};
        for (const timeframe of timeframes) {
            const propertyName = `${timeframe.toLowerCase()}ActiveUserCount`;
            const [from, to] = [Math.max(0, timestamp() - TIMEFRAMES_TO_SECONDS[timeframe]), timestamp()];
            const authors = remeda.unique([
                ...commentsRaw
                    .filter((comment) => comment.timestamp >= from && comment.timestamp <= to)
                    .map((comment) => comment.authorSignerAddress),
                ...votesRaw.filter((vote) => vote.timestamp >= from && vote.timestamp <= to).map((vote) => vote.authorSignerAddress)
            ]);
            // Too lazy to type this function up, not high priority
            //@ts-expect-error
            res[propertyName] = authors.length;
        }
        return res;
    }

    private _calcPostCount(commentsRaw: Pick<CommentsTableRow, "depth" | "authorSignerAddress" | "timestamp">[]) {
        const timeframes = <(keyof typeof TIMEFRAMES_TO_SECONDS)[]>Object.keys(TIMEFRAMES_TO_SECONDS);
        const res = {};
        for (const timeframe of timeframes) {
            const propertyName = `${timeframe.toLowerCase()}PostCount`;
            const [from, to] = [Math.max(0, timestamp() - TIMEFRAMES_TO_SECONDS[timeframe]), timestamp()];
            const posts = commentsRaw
                .filter((comment) => comment.timestamp >= from && comment.timestamp <= to)
                .filter((comment) => comment.depth === 0);

            // Too lazy to type this function up, not high priority
            //@ts-expect-error
            res[propertyName] = posts.length;
        }
        return res;
    }

    async querySubplebbitStats(trx?: Transaction): Promise<SubplebbitStats> {
        const commentsRaw = await this._baseTransaction(trx)(TABLES.COMMENTS).select(["depth", "authorSignerAddress", "timestamp"]);
        const votesRaw = await this._baseTransaction(trx)(TABLES.VOTES).select(["timestamp", "authorSignerAddress"]);
        const res = { ...this._calcActiveUserCount(commentsRaw, votesRaw), ...this._calcPostCount(commentsRaw) };
        //@ts-expect-error
        return res;
    }

    async queryCommentsUnderComment(parentCid: string | null, trx?: Transaction): Promise<CommentsTableRow[]> {
        return this._baseTransaction(trx)(TABLES.COMMENTS).where("parentCid", parentCid);
    }

    async queryComment(cid: string, trx?: Transaction): Promise<CommentsTableRow | undefined> {
        return this._baseTransaction(trx)(TABLES.COMMENTS).where("cid", cid).first();
    }

    private async _queryCommentUpvote(cid: string, trx?: Transaction): Promise<number> {
        const upvotes = <number>(await this._baseTransaction(trx)(TABLES.VOTES).where({ commentCid: cid, vote: 1 }).count())[0]["count(*)"];
        return upvotes;
    }

    private async _queryCommentDownvote(cid: string, trx?: Transaction): Promise<number> {
        const downvotes: number = <number>(
            (await this._baseTransaction(trx)(TABLES.VOTES).where({ commentCid: cid, vote: -1 }).count())[0]["count(*)"]
        );
        return downvotes;
    }

    private async _queryCommentCounts(
        cid: string,
        trx?: Transaction
    ): Promise<Pick<CommentWithCommentUpdate, "replyCount" | "upvoteCount" | "downvoteCount">> {
        const [replyCount, upvoteCount, downvoteCount] = await Promise.all([
            this.queryReplyCount(cid, trx),
            this._queryCommentUpvote(cid, trx),
            this._queryCommentDownvote(cid, trx)
        ]);
        return { replyCount, upvoteCount, downvoteCount };
    }

    private async _queryAuthorEdit(cid: string, authorSignerAddress: string, trx?: Transaction): Promise<AuthorCommentEdit | undefined> {
        const authorEdit = await this._baseTransaction(trx)(TABLES.COMMENT_EDITS)
            .select(AUTHOR_EDIT_FIELDS)
            .where({ commentCid: cid, authorSignerAddress, isAuthorEdit: true })
            .orderBy("id", "desc")
            .first();

        return authorEdit;
    }

    private async _queryLatestModeratorReason(
        comment: Pick<CommentsTableRow, "cid">,
        trx?: Transaction
    ): Promise<Pick<CommentUpdate, "reason"> | undefined> {
        return this._baseTransaction(trx)(TABLES.COMMENT_EDITS)
            .select("reason")
            .where("commentCid", comment.cid)
            .where({ isAuthorEdit: false })
            .whereNotNull("reason")
            .orderBy("id", "desc")
            .first();
    }

    async queryCommentFlags(cid: string, trx?: Transaction): Promise<Pick<CommentUpdate, "spoiler" | "pinned" | "locked" | "removed">> {
        const res: Pick<CommentUpdate, "spoiler" | "pinned" | "locked" | "removed"> = Object.assign(
            {},
            ...(await Promise.all(
                ["spoiler", "pinned", "locked", "removed"].map((field) =>
                    this._baseTransaction(trx)(TABLES.COMMENT_EDITS)
                        .select(field)
                        .where("commentCid", cid)
                        .whereNotNull(field)
                        .where("isAuthorEdit", false)
                        .orderBy("id", "desc")
                        .first()
                )
            ))
        );
        return res;
    }

    async queryAuthorEditDeleted(cid: string, trx?: Transaction): Promise<Pick<CommentEditsTableRow, "deleted"> | undefined> {
        return this._baseTransaction(trx)(TABLES.COMMENT_EDITS)
            .select("deleted")
            .where("commentCid", cid)
            .whereNotNull("deleted")
            .orderBy("id", "desc")
            .first();
    }

    private async _queryModCommentFlair(
        comment: Pick<CommentsTableRow, "cid">,
        trx?: Transaction
    ): Promise<Pick<CommentEditsTableRow, "flair"> | undefined> {
        return this._baseTransaction(trx)(TABLES.COMMENT_EDITS)
            .select("flair")
            .where("commentCid", comment.cid)
            .whereNotNull("flair")
            .where({ isAuthorEdit: false })
            .orderBy("id", "desc")
            .first();
    }

    private async _queryLastChildCidAndLastReplyTimestamp(comment: Pick<CommentsTableRow, "cid" | "timestamp">, trx?: Transaction) {
        const lastChildCidRaw = await this._baseTransaction(trx)(TABLES.COMMENTS)
            .where("parentCid", comment.cid)
            .orderBy("id", "desc")
            .first();
        const lastReplyTimestamp = lastChildCidRaw ? await this.queryActiveScore(comment, trx) : undefined;
        return {
            lastChildCid: lastChildCidRaw ? lastChildCidRaw.cid : undefined,
            lastReplyTimestamp
        };
    }

    async queryCalculatedCommentUpdate(
        comment: Pick<CommentsTableRow, "cid" | "authorSignerAddress" | "timestamp">,
        trx?: Transaction
    ): Promise<Omit<CommentUpdate, "signature" | "updatedAt" | "replies" | "protocolVersion">> {
        const [
            authorSubplebbit,
            authorEdit,
            commentUpdateCounts,
            moderatorReason,
            commentFlags,
            commentModFlair,
            lastChildAndLastReplyTimestamp
        ] = await Promise.all([
            this.querySubplebbitAuthor(comment.authorSignerAddress, trx),
            this._queryAuthorEdit(comment.cid, comment.authorSignerAddress, trx),
            this._queryCommentCounts(comment.cid, trx),
            this._queryLatestModeratorReason(comment, trx),
            this.queryCommentFlags(comment.cid, trx),
            this._queryModCommentFlair(comment, trx),
            this._queryLastChildCidAndLastReplyTimestamp(comment, trx)
        ]);
        if (!authorSubplebbit) throw Error("Failed to query author.subplebbit in queryCalculatedCommentUpdate");
        return {
            cid: comment.cid,
            edit: authorEdit,
            ...commentUpdateCounts,
            flair: commentModFlair?.flair || authorEdit?.flair,
            ...commentFlags,
            ...moderatorReason,
            author: { subplebbit: authorSubplebbit },
            ...lastChildAndLastReplyTimestamp
        };
    }

    async queryLatestPostCid(trx?: Transaction) {
        return this._baseTransaction(trx)(TABLES.COMMENTS).select("cid").where({ depth: 0 }).orderBy("id", "desc").first();
    }

    async queryLatestCommentCid(trx?: Transaction) {
        return this._baseTransaction(trx)(TABLES.COMMENTS).select("cid").orderBy("id", "desc").first();
    }

    async queryAuthorModEdits(
        authorSignerAddress: string,
        trx?: Knex.Transaction
    ): Promise<Pick<SubplebbitAuthor, "banExpiresAt" | "flair">> {
        const authorComments: Pick<CommentsTableRow, "cid">[] = await this._baseTransaction(trx)(TABLES.COMMENTS)
            .select("cid")
            .where("authorSignerAddress", authorSignerAddress);
        if (!Array.isArray(authorComments) || authorComments.length === 0) return {};
        const commentAuthorEdits: Pick<CommentEditsTableRow, "commentAuthor">[] = await this._baseTransaction(trx)(TABLES.COMMENT_EDITS)
            .select("commentAuthor")
            .whereIn(
                "commentCid",
                authorComments.map((c) => c.cid)
            )
            .whereNotNull("commentAuthor")
            .orderBy("id", "desc");
        const banAuthor = commentAuthorEdits.find((edit) => typeof edit.commentAuthor?.banExpiresAt === "number")?.commentAuthor;
        const authorFlairByMod = commentAuthorEdits.find((edit) => edit.commentAuthor?.flair)?.commentAuthor;

        return { ...banAuthor, ...authorFlairByMod };
    }

    async querySubplebbitAuthor(authorSignerAddress: string, trx?: Knex.Transaction): Promise<SubplebbitAuthor | undefined> {
        const authorCommentCids = <Pick<CommentsTableRow, "cid">[]>(
            await this._baseTransaction(trx)(TABLES.COMMENTS).select("cid").where("authorSignerAddress", authorSignerAddress)
        );
        if (authorCommentCids.length === 0) return undefined;
        const authorComments: (CommentsTableRow & Pick<CommentUpdatesRow, "upvoteCount" | "downvoteCount">)[] = await Promise.all(
            authorCommentCids.map(async (authorCommentCid) => {
                const authorFullComment = <CommentsTableRow>await this.queryComment(authorCommentCid.cid, trx);
                return {
                    ...authorFullComment,
                    upvoteCount: await this._queryCommentUpvote(authorCommentCid.cid, trx),
                    downvoteCount: await this._queryCommentDownvote(authorCommentCid.cid, trx)
                };
            })
        );
        const authorPosts = authorComments.filter((comment) => comment.depth === 0);
        const authorReplies = authorComments.filter((comment) => comment.depth > 0);

        const postScore: number =
            remeda.sumBy(authorPosts, (post) => post.upvoteCount) - remeda.sumBy(authorPosts, (post) => post.downvoteCount);

        const replyScore: number =
            remeda.sumBy(authorReplies, (reply) => reply.upvoteCount) - remeda.sumBy(authorReplies, (reply) => reply.downvoteCount);

        const lastCommentCid = remeda.maxBy(authorComments, (comment) => comment.id)?.cid;
        if (!lastCommentCid) throw Error("Failed to query subplebbitAuthor.lastCommentCid");
        const firstCommentTimestamp = remeda.minBy(authorComments, (comment) => comment.id)?.timestamp;
        if (typeof firstCommentTimestamp !== "number") throw Error("Failed to query subplebbitAuthor.firstCommentTimestamp");

        const modAuthorEdits = await this.queryAuthorModEdits(authorSignerAddress, trx);

        return {
            postScore,
            replyScore,
            lastCommentCid,
            ...modAuthorEdits,
            firstCommentTimestamp
        };
    }

    async changeDbFilename(oldDbName: string, newDbName: string) {
        const log = Logger("plebbit-js:db-handler:changeDbFilename");

        const oldPathString = path.join(this._subplebbit.plebbit.dataPath!, "subplebbits", oldDbName);
        const newPath = path.format({ dir: path.dirname(oldPathString), base: newDbName });
        await fs.promises.mkdir(path.dirname(oldPathString), { recursive: true });
        this._currentTrxs = {};
        //@ts-expect-error
        delete this["_knex"];
        //@ts-expect-error
        delete this["_keyv"];
        await fs.promises.cp(oldPathString, newPath);
        if (os.type() === "Windows_NT") await deleteOldSubplebbitInWindows(oldPathString, this._subplebbit.plebbit);
        else await fs.promises.rm(oldPathString);

        this._dbConfig = {
            ...this._dbConfig,
            connection: {
                ...(<any>this._dbConfig.connection),
                filename: newPath
            }
        };
        await this.initDbIfNeeded();
        log(`Changed db path from (${oldPathString}) to (${newPath})`);
    }

    // Start lock
    async lockSubStart(subAddress = this._subplebbit.address) {
        const log = Logger("plebbit-js:lock:start");

        const lockfilePath = path.join(this._subplebbit.plebbit.dataPath!, "subplebbits", `${subAddress}.start.lock`);
        const subDbPath = path.join(this._subplebbit.plebbit.dataPath!, "subplebbits", subAddress);

        try {
            await lockfile.lock(subDbPath, {
                lockfilePath,
                onCompromised: () => {} // Temporary bandaid for the moment. Should be deleted later
            });
            log(`Locked the start of subplebbit (${subAddress}) successfully`);
        } catch (e: unknown) {
            if (e instanceof Error && e.message === "Lock file is already being held")
                throwWithErrorCode("ERR_SUB_ALREADY_STARTED", { subplebbitAddress: subAddress });
            else {
                log(`Error while trying to lock start of sub (${subAddress}): ${e}`);
                throw e;
            }
        }
    }

    async unlockSubStart(subAddress = this._subplebbit.address) {
        const log = Logger("plebbit-js:lock:start");
        log.trace(`Attempting to unlock the start of sub (${subAddress})`);

        const lockfilePath = path.join(this._subplebbit.plebbit.dataPath!, "subplebbits", `${subAddress}.start.lock`);
        const subDbPath = path.join(this._subplebbit.plebbit.dataPath!, "subplebbits", subAddress);
        if (!fs.existsSync(lockfilePath) || !fs.existsSync(subDbPath)) return;

        try {
            await lockfile.unlock(subDbPath, { lockfilePath });
            log(`Unlocked start of sub (${subAddress})`);
        } catch (e: unknown) {
            log(`Error while trying to unlock start of sub (${subAddress}): ${e}`);
            throw e;
        }
    }

    async isSubStartLocked(subAddress = this._subplebbit.address): Promise<boolean> {
        const lockfilePath = path.join(this._subplebbit.plebbit.dataPath!, "subplebbits", `${subAddress}.start.lock`);
        const subDbPath = path.join(this._subplebbit.plebbit.dataPath!, "subplebbits", subAddress);
        const isLocked = await lockfile.check(subDbPath, { lockfilePath, realpath: false, stale: 30000 });
        return isLocked;
    }

    // Subplebbit state lock

    async lockSubState(subAddress = this._subplebbit.address) {
        const log = Logger("plebbit-js:lock:lockSubState");
        const lockfilePath = path.join(this._subplebbit.plebbit.dataPath!, "subplebbits", `${subAddress}.state.lock`);
        const subDbPath = path.join(this._subplebbit.plebbit.dataPath!, "subplebbits", subAddress);
        try {
            await lockfile.lock(subDbPath, {
                lockfilePath,
                retries: 5,
                onCompromised: () => {}
            });
        } catch (e: unknown) {
            if (e instanceof Error && e.message === "Lock file is already being held")
                throwWithErrorCode("ERR_SUB_STATE_LOCKED", { subplebbitAddress: subAddress });
            // Not sure, do we need to throw error here
        }
    }

    async unlockSubState(subAddress = this._subplebbit.address) {
        const log = Logger("plebbit-js:lock:unlockSubState");

        const lockfilePath = path.join(this._subplebbit.plebbit.dataPath!, "subplebbits", `${subAddress}.state.lock`);
        const subDbPath = path.join(this._subplebbit.plebbit.dataPath!, "subplebbits", subAddress);
        if (!fs.existsSync(lockfilePath)) return;
        try {
            await lockfile.unlock(subDbPath, { lockfilePath });
        } catch (e: unknown) {
            if (e instanceof Error && "code" in e && e.code !== "ENOTACQUIRED") throw e;
        }
    }

    // Misc functions

    subDbExists(subAddress = this._subplebbit.address) {
        const dbPath = path.join(this._subplebbit.plebbit.dataPath!, "subplebbits", subAddress);
        return fs.existsSync(dbPath);
    }

    subAddress() {
        return this._subplebbit.address;
    }
}
