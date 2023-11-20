import { throwWithErrorCode, TIMEFRAMES_TO_SECONDS, timestamp } from "../../util";
import knex, { Knex } from "knex";
import { Subplebbit } from "../../subplebbit/subplebbit";
import path from "path";
import assert from "assert";
import fs from "fs";
import Keyv from "keyv";
import Transaction = Knex.Transaction;
import {
    AuthorCommentEdit,
    ChallengeAnswersTableRowInsert,
    ChallengeRequestsTableRowInsert,
    ChallengesTableRowInsert,
    ChallengeVerificationsTableRowInsert,
    CommentEditsTableRow,
    CommentEditsTableRowInsert,
    CommentEditType,
    CommentsTableRow,
    CommentsTableRowInsert,
    CommentUpdate,
    CommentUpdatesRow,
    CommentUpdatesTableRowInsert,
    CommentWithCommentUpdate,
    SignersTableRow,
    SingersTableRowInsert,
    SubplebbitAuthor,
    VotesTableRow,
    VotesTableRowInsert
} from "../../types";
import Logger from "@plebbit/plebbit-logger";
import { getDefaultSubplebbitDbConfig } from "./util";
import env from "../../version";
import { Plebbit } from "../../plebbit";
import sumBy from "lodash/sumBy";
import lodash from "lodash";

import * as lockfile from "@plebbit/proper-lockfile";
import { PageOptions } from "../../subplebbit/sort-handler";
import { SubplebbitStats } from "../../subplebbit/types";

const TABLES = Object.freeze({
    COMMENTS: "comments",
    COMMENT_UPDATES: "commentUpdates",
    VOTES: "votes",
    CHALLENGE_REQUESTS: "challengeRequests",
    CHALLENGES: "challenges",
    CHALLENGE_ANSWERS: "challengeAnswers",
    CHALLENGE_VERIFICATIONS: "challengeVerifications",

    SIGNERS: "signers", // To store private keys of subplebbit and comments' IPNS,
    COMMENT_EDITS: "commentEdits"
});

export class DbHandler {
    private _knex: Knex;
    private _subplebbit: Pick<Subplebbit, "address"> & {
        plebbit: Pick<Plebbit, "dataPath" | "noData">;
    };
    private _currentTrxs: Record<string, Transaction>; // Prefix to Transaction. Prefix represents all trx under a pubsub message or challenge
    private _dbConfig: Knex.Config<any>;
    private _keyv: Keyv;
    private _createdTables: boolean;
    private _needToUpdateCommentUpdates: boolean;

    constructor(subplebbit: DbHandler["_subplebbit"]) {
        this._subplebbit = subplebbit;
        this._currentTrxs = {};
        this._createdTables = false;
        this._needToUpdateCommentUpdates = false;
    }

    async initDbConfigIfNeeded() {
        if (!this._dbConfig) this._dbConfig = await getDefaultSubplebbitDbConfig(this._subplebbit);
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
        if (this.isDbInMemory()) return;
        await this._knex?.destroy();
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
            table.binary("challengeRequestId").notNullable().references("challengeRequestId").inTable(TABLES.CHALLENGE_REQUESTS);

            table.text("subplebbitAddress").notNullable();
            table.text("content").nullable();
            table.timestamp("timestamp").notNullable().checkBetween([0, Number.MAX_SAFE_INTEGER]);
            table.json("signature").notNullable().unique(); // Will contain {signature, public key, type}
            table.text("ipnsName").notNullable().unique();
            table.text("ipnsKeyName").notNullable().unique().references("ipnsKeyName").inTable(TABLES.SIGNERS);
            table.text("title").nullable();
            table.integer("depth").notNullable().checkBetween([0, Number.MAX_SAFE_INTEGER]);

            table.json("flair").nullable();

            table.boolean("spoiler");

            table.text("protocolVersion").notNullable();

            table.increments("id"); // Used for sorts
            table.timestamp("insertedAt").defaultTo(this._knex.raw("(strftime('%s', 'now'))")); // Timestamp of when it was first inserted in the table
        });
    }

    private async _createCommentUpdatesTable(tableName: string) {
        this._needToUpdateCommentUpdates = true;
        await this._knex.schema.createTable(tableName, (table) => {
            table.text("cid").notNullable().primary().unique().references("cid").inTable(TABLES.COMMENTS);

            table.json("edit").nullable();
            table.integer("upvoteCount").notNullable().checkBetween([0, Number.MAX_SAFE_INTEGER]);
            table.integer("downvoteCount").notNullable().checkBetween([0, Number.MAX_SAFE_INTEGER]);

            // We're not storing replies here because it would take too much storage, and is not needed

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
            table.json("replies").nullable();
            table.text("lastChildCid").nullable().references("cid").inTable(TABLES.COMMENTS);
            table.timestamp("lastReplyTimestamp").nullable();

            // Columns with defaults
            table.timestamp("insertedAt").defaultTo(this._knex.raw("(strftime('%s', 'now'))")); // Timestamp of when it was first inserted in the table
        });
    }

    private async _createVotesTable(tableName: string) {
        await this._knex.schema.createTable(tableName, (table) => {
            table.text("commentCid").notNullable().references("cid").inTable(TABLES.COMMENTS);
            table.text("authorAddress").notNullable();
            table.json("author").notNullable();
            table.binary("challengeRequestId").notNullable().references("challengeRequestId").inTable(TABLES.CHALLENGE_REQUESTS);

            table.timestamp("timestamp").checkPositive().notNullable();
            table.text("subplebbitAddress").notNullable();
            table.integer("vote").checkBetween([-1, 1]).notNullable();
            table.json("signature").notNullable().unique();
            table.text("protocolVersion").notNullable();
            table.timestamp("insertedAt").defaultTo(this._knex.raw("(strftime('%s', 'now'))")); // Timestamp of when it was first inserted in the table

            table.primary(["commentCid", "authorAddress"]); // An author can't have multiple votes on a comment
        });
    }

    private async _createChallengeRequestsTable(tableName: string) {
        await this._knex.schema.createTable(tableName, (table) => {
            table.binary("challengeRequestId").notNullable().primary().unique();
            table.text("userAgent").notNullable();
            table.text("protocolVersion").notNullable();
            table.json("signature").notNullable().unique();
            table.json("acceptedChallengeTypes").nullable(); // string[]
            table.timestamp("timestamp").notNullable().checkBetween([0, Number.MAX_SAFE_INTEGER]);
            table.timestamp("insertedAt").defaultTo(this._knex.raw("(strftime('%s', 'now'))")); // Timestamp of when it was first inserted in the table
            table.json("challengeCommentCids").nullable(); // string[]
            table.json("challengeAnswers").nullable(); // string[]
        });
    }

    private async _createChallengesTable(tableName: string) {
        await this._knex.schema.createTable(tableName, (table) => {
            table
                .binary("challengeRequestId")
                .notNullable()
                .primary()
                .unique()
                .references("challengeRequestId")
                .inTable(TABLES.CHALLENGE_REQUESTS);
            table.text("userAgent").notNullable();
            table.text("protocolVersion").notNullable();
            table.json("signature").notNullable().unique();
            table.timestamp("insertedAt").defaultTo(this._knex.raw("(strftime('%s', 'now'))")); // Timestamp of when it was first inserted in the table

            // Might store the challenge here in the future. For now we're not because it would take too much storage
            table.json("challengeTypes").notNullable(); // string[]
            table.timestamp("timestamp").notNullable().checkBetween([0, Number.MAX_SAFE_INTEGER]);
        });
    }

    private async _createChallengeAnswersTable(tableName: string) {
        await this._knex.schema.createTable(tableName, (table) => {
            table
                .binary("challengeRequestId")
                .notNullable()
                .primary()
                .unique()
                .references("challengeRequestId")
                .inTable(TABLES.CHALLENGE_REQUESTS);
            table.text("userAgent").notNullable();
            table.text("protocolVersion").notNullable();
            table.json("challengeAnswers").notNullable(); // Decrypted
            table.json("signature").notNullable().unique();
            table.timestamp("timestamp").notNullable().checkBetween([0, Number.MAX_SAFE_INTEGER]);
            table.timestamp("insertedAt").defaultTo(this._knex.raw("(strftime('%s', 'now'))")); // Timestamp of when it was first inserted in the table
        });
    }

    private async _createChallengeVerificationsTable(tableName: string) {
        await this._knex.schema.createTable(tableName, (table) => {
            table
                .binary("challengeRequestId")
                .notNullable()
                .primary()
                .unique()
                .references("challengeRequestId")
                .inTable(TABLES.CHALLENGE_REQUESTS);
            table.boolean("challengeSuccess").notNullable();
            table.json("challengeErrors").nullable(); // string[]
            table.text("reason").nullable();
            table.json("signature").notNullable().unique();

            table.text("userAgent").notNullable();
            table.text("protocolVersion").notNullable();
            table.timestamp("timestamp").notNullable().checkBetween([0, Number.MAX_SAFE_INTEGER]);
            table.timestamp("insertedAt").defaultTo(this._knex.raw("(strftime('%s', 'now'))")); // Timestamp of when it was first inserted in the table
        });
    }

    private async _createSignersTable(tableName: string) {
        await this._knex.schema.createTable(tableName, (table) => {
            table.text("ipnsKeyName").notNullable().unique().primary();
            table.text("privateKey").notNullable().unique();
            table.text("type").notNullable(); // ed25519 or any other type
            table.timestamp("insertedAt").defaultTo(this._knex.raw("(strftime('%s', 'now'))")); // Timestamp of when it was first inserted in the table
        });
    }

    private async _createCommentEditsTable(tableName: string) {
        await this._knex.schema.createTable(tableName, (table) => {
            table.text("commentCid").notNullable().references("cid").inTable(TABLES.COMMENTS);
            table.text("authorAddress").notNullable();
            table.json("author").notNullable();
            table.binary("challengeRequestId").notNullable().references("challengeRequestId").inTable(TABLES.CHALLENGE_REQUESTS);
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
            table.text("moderatorReason").nullable();
            table.json("commentAuthor").nullable();

            table.timestamp("insertedAt").defaultTo(this._knex.raw("(strftime('%s', 'now'))")); // Timestamp of when it was first inserted in the table
            table.primary(["id", "commentCid"]);
        });
    }

    async getDbVersion(): Promise<number> {
        return Number((await this._knex.raw("PRAGMA user_version"))[0]["user_version"]);
    }

    async createTablesIfNeeded() {
        const log = Logger("plebbit-js:db-handler:createTablesIfNeeded");

        const priorDbVersion = await this.getDbVersion();

        log.trace(`current db version: ${priorDbVersion}`);
        const needToMigrate = priorDbVersion < env.DB_VERSION;
        const createTableFunctions = [
            this._createCommentsTable,
            this._createCommentUpdatesTable,
            this._createVotesTable,
            this._createChallengeRequestsTable,
            this._createChallengesTable,
            this._createChallengeAnswersTable,
            this._createChallengeVerificationsTable,
            this._createSignersTable,
            this._createCommentEditsTable
        ];
        const tables = Object.values(TABLES);

        await Promise.all(
            tables.map(async (table) => {
                const i = tables.indexOf(table);
                const tableExists = await this._knex.schema.hasTable(table);
                if (!tableExists) {
                    log(`Table ${table} does not exist. Will create schema`);
                    await createTableFunctions[i].bind(this)(table);
                } else if (tableExists && needToMigrate) {
                    log(`Migrating table ${table} to new schema`);
                    await this._knex.raw("PRAGMA foreign_keys = OFF");
                    const tempTableName = `${table}${env.DB_VERSION}`;
                    await this._knex.schema.dropTableIfExists(tempTableName);
                    await createTableFunctions[i].bind(this)(tempTableName);
                    await this._copyTable(table, tempTableName);
                    await this._knex.schema.dropTable(table);
                    await this._knex.schema.renameTable(tempTableName, table);
                }
            })
        );

        if (needToMigrate) {
            await this._knex.raw("PRAGMA foreign_keys = ON");
            await this._knex.raw(`PRAGMA user_version = ${env.DB_VERSION}`);
        }
        const newDbVersion = await this.getDbVersion();
        assert.equal(newDbVersion, env.DB_VERSION);
        this._createdTables = true;
    }

    isDbInMemory(): boolean {
        // Is database stored in memory rather on disk?
        //@ts-expect-error
        return this._dbConfig.connection.filename === ":memory:";
    }

    private async _copyTable(srcTable: string, dstTable: string) {
        const log = Logger("plebbit-js:db-handler:createTablesIfNeeded:copyTable");
        const dstTableColumns: string[] = Object.keys(await this._knex(dstTable).columnInfo());
        const srcRecords: Object[] = await this._knex(srcTable).select("*");
        if (srcRecords.length > 0) {
            log(`Attempting to copy ${srcRecords.length} ${srcTable}`);
            // Remove fields that are not in dst table. Will prevent errors when migration from db version 2 to 3
            const srcRecordFiltered = srcRecords.map((record) => lodash.pick(record, dstTableColumns));
            // Need to make sure that array fields are json strings
            for (const srcRecord of srcRecordFiltered)
                for (const srcRecordKey of Object.keys(srcRecord))
                    if (Array.isArray(srcRecord[srcRecordKey])) {
                        srcRecord[srcRecordKey] = JSON.stringify(srcRecord[srcRecordKey]);
                        assert(srcRecord[srcRecordKey] !== "[object Object]", "DB value shouldn't be [object Object]");
                    }

            // Have to use a for loop because if I inserted them as a whole it throw a "UNIQUE constraint failed: comments6.signature"
            // Probably can be fixed but not worth the time
            for (const srcRecord of srcRecordFiltered) await this._knex(dstTable).insert(srcRecord);
        }
        log(`copied table ${srcTable} to table ${dstTable}`);
    }

    async deleteVote(authorAddress: VotesTableRow["authorAddress"], commentCid: VotesTableRow["commentCid"], trx?: Transaction) {
        await this._baseTransaction(trx)(TABLES.VOTES).where("commentCid", commentCid).where("authorAddress", authorAddress).del();
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

    async insertChallengeRequest(request: ChallengeRequestsTableRowInsert, trx?: Transaction) {
        await this._baseTransaction(trx)(TABLES.CHALLENGE_REQUESTS).insert(request);
    }

    async insertChallenge(challenge: ChallengesTableRowInsert, trx?: Transaction) {
        await this._baseTransaction(trx)(TABLES.CHALLENGES).insert(challenge);
    }

    async insertChallengeAnswer(answer: ChallengeAnswersTableRowInsert, trx?: Transaction) {
        await this._baseTransaction(trx)(TABLES.CHALLENGE_ANSWERS).insert(answer);
    }

    async insertChallengeVerification(verification: ChallengeVerificationsTableRowInsert, trx?: Transaction) {
        await this._baseTransaction(trx)(TABLES.CHALLENGE_VERIFICATIONS).insert(verification);
    }

    async queryChallengeRequest(requestId: ChallengeRequestsTableRowInsert["challengeRequestId"], trx?: Transaction) {
        return this._baseTransaction(trx)(TABLES.CHALLENGE_REQUESTS).where("challengeRequestId", requestId).first();
    }

    async getLastVoteOfAuthor(commentCid: string, authorAddress: string, trx?: Transaction): Promise<VotesTableRow | undefined> {
        return this._baseTransaction(trx)(TABLES.VOTES)
            .where({
                commentCid: commentCid,
                authorAddress: authorAddress
            })
            .first();
    }

    private _basePageQuery(options: Omit<PageOptions, "pageSize">, trx?: Transaction) {
        let query = this._baseTransaction(trx)(TABLES.COMMENTS)
            .innerJoin(TABLES.COMMENT_UPDATES, `${TABLES.COMMENTS}.cid`, `${TABLES.COMMENT_UPDATES}.cid`)
            .jsonExtract(`${TABLES.COMMENT_UPDATES}.edit`, "$.deleted", "deleted", true)
            .where({ parentCid: options.parentCid });

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

        return children.length + lodash.sum(await Promise.all(children.map((comment) => this.queryReplyCount(comment.comment.cid, trx))));
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
        //prettier-ignore
        const commentUpdateColumns: (keyof CommentUpdatesRow)[] = ["cid", "author", "downvoteCount", "edit", "flair", "locked", "pinned", "protocolVersion", "reason", "removed", "replyCount", "signature", "spoiler", "updatedAt", "upvoteCount", "replies", "lastChildCid", "lastReplyTimestamp"];
        const aliasSelect = commentUpdateColumns.map((col) => `${TABLES.COMMENT_UPDATES}.${col} AS commentUpdate_${col}`);

        const commentsRaw: CommentsTableRow[] = await this._basePageQuery(options, trx).select([`${TABLES.COMMENTS}.*`, ...aliasSelect]);

        //@ts-expect-error
        const comments: { comment: CommentsTableRow; update: CommentUpdatesRow }[] = commentsRaw.map((commentRaw) => ({
            comment: lodash.pickBy(commentRaw, (value, key) => !key.startsWith("commentUpdate_")),
            update: lodash.mapKeys(
                lodash.pickBy(commentRaw, (value, key) => key.startsWith("commentUpdate_")),
                (value, key) => key.replace("commentUpdate_", "")
            )
        }));

        return comments;
    }

    async queryStoredCommentUpdate(comment: Pick<CommentsTableRow, "cid">, trx?: any): Promise<CommentUpdatesRow | undefined> {
        return this._baseTransaction(trx)(TABLES.COMMENT_UPDATES).where("cid", comment.cid).first();
    }

    async queryCommentsOfAuthor(authorAddresses: string | string[], trx?: Transaction) {
        if (!Array.isArray(authorAddresses)) authorAddresses = [authorAddresses];
        return this._baseTransaction(trx)(TABLES.COMMENTS).whereIn("authorAddress", authorAddresses);
    }

    async queryAllCommentsCid(trx?: Transaction): Promise<string[]> {
        const res = await this._baseTransaction(trx)(TABLES.COMMENTS).select("cid");
        return res.map((row) => row.cid);
    }

    async queryCommentsByCids(cids: string[], trx?: Transaction) {
        return this._baseTransaction(trx)(TABLES.COMMENTS).whereIn("cid", cids);
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

    async queryCommentsToBeUpdated(ipnsKeyNames: string[], ipnsLifetimeSeconds: number, trx?: Transaction): Promise<CommentsTableRow[]> {
        if (this._needToUpdateCommentUpdates) {
            const allComments = await this._baseTransaction(trx)(TABLES.COMMENTS);
            this._needToUpdateCommentUpdates = false;
            return allComments;
        }
        // Criteria:
        // 1 - Comment has no row in commentUpdates (has never published CommentUpdate) OR
        // 2 - comment.ipnsKeyName is not part of /key/list of IPFS RPC API OR
        // 3 - commentUpdate.updatedAt is less or equal to max of insertedAt of child votes, comments or commentEdit OR

        // 4 - Comments that new votes, CommentEdit or other comments were published under them
        // 5 - CommentUpdate IPNS has expired (timestamp() >= updatedAt + lifetime + 100)

        // After retrieving all comments with any of criteria above, also add their parents to the list to update

        // Also add all comments of each author to the list

        // updatedAt + ipnsLifetimeSeconds = expiry
        // timestamp() > expiry - buffer => we should update the IPNS
        // timestamp() + buffer > updatedAt + ipnsLifetimeSeconds
        // timestamp() + buffer - ipnsLifetimeSeconds > updatedAt

        const ipnsBufferSeconds = ipnsLifetimeSeconds * 0.01;

        const criteriaOneTwoThree: CommentsTableRow[] = await this._baseTransaction(trx)(TABLES.COMMENTS)
            .select(`${TABLES.COMMENTS}.*`)
            .leftJoin(TABLES.COMMENT_UPDATES, `${TABLES.COMMENTS}.cid`, `${TABLES.COMMENT_UPDATES}.cid`)
            .whereNull(`${TABLES.COMMENT_UPDATES}.updatedAt`)
            .orWhereNotIn("ipnsKeyName", ipnsKeyNames)
            .orWhere(`${TABLES.COMMENT_UPDATES}.updatedAt`, "<=", timestamp() + ipnsBufferSeconds - ipnsLifetimeSeconds);
        const lastUpdatedAtWithBuffer = this._knex.raw("`lastUpdatedAt` - 1");
        const criteriaFour: CommentsTableRow[] = await this._baseTransaction(trx)(TABLES.COMMENTS)
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

        const comments = lodash.uniqBy([...criteriaOneTwoThree, ...criteriaFour], (comment) => comment.cid);

        const parents = lodash.flattenDeep(
            await Promise.all(comments.filter((comment) => comment.parentCid).map((comment) => this.queryParents(comment, trx)))
        );
        const authorComments = await this.queryCommentsOfAuthor(lodash.uniq(comments.map((comment) => comment.authorAddress)), trx);
        const uniqComments = lodash.uniqBy([...comments, ...parents, ...authorComments], (comment) => comment.cid);

        return uniqComments;
    }

    private _calcActiveUserCount(
        commentsRaw: Pick<CommentsTableRow, "depth" | "authorAddress" | "timestamp">[],
        votesRaw: Pick<VotesTableRow, "authorAddress" | "timestamp">[]
    ) {
        const res = {};
        for (const timeframe of Object.keys(TIMEFRAMES_TO_SECONDS)) {
            const propertyName = `${timeframe.toLowerCase()}ActiveUserCount`;
            const [from, to] = [Math.max(0, timestamp() - TIMEFRAMES_TO_SECONDS[timeframe]), timestamp()];
            const authors = lodash.uniq([
                ...commentsRaw
                    .filter((comment) => comment.timestamp >= from && comment.timestamp <= to)
                    .map((comment) => comment.authorAddress),
                ...votesRaw.filter((vote) => vote.timestamp >= from && vote.timestamp <= to).map((vote) => vote.authorAddress)
            ]);
            res[propertyName] = authors.length;
        }
        return res;
    }

    private _calcPostCount(commentsRaw: Pick<CommentsTableRow, "depth" | "authorAddress" | "timestamp">[]) {
        const res = {};
        for (const timeframe of Object.keys(TIMEFRAMES_TO_SECONDS)) {
            const propertyName = `${timeframe.toLowerCase()}PostCount`;
            const [from, to] = [Math.max(0, timestamp() - TIMEFRAMES_TO_SECONDS[timeframe]), timestamp()];
            const posts = commentsRaw
                .filter((comment) => comment.timestamp >= from && comment.timestamp <= to)
                .filter((comment) => comment.depth === 0);

            res[propertyName] = posts.length;
        }
        return res;
    }

    async querySubplebbitStats(trx?: Transaction): Promise<SubplebbitStats> {
        const commentsRaw = await this._baseTransaction(trx)(TABLES.COMMENTS).select(["depth", "authorAddress", "timestamp"]);
        const votesRaw = await this._baseTransaction(trx)(TABLES.VOTES).select(["timestamp", "authorAddress"]);
        const res = { ...this._calcActiveUserCount(commentsRaw, votesRaw), ...this._calcPostCount(commentsRaw) };
        //@ts-expect-error
        return res;
    }

    async queryCommentsUnderComment(parentCid: string | null, trx?: Transaction): Promise<CommentsTableRow[]> {
        return this._baseTransaction(trx)(TABLES.COMMENTS).where({ parentCid: parentCid });
    }

    async queryComment(cid: string, trx?: Transaction): Promise<CommentsTableRow | undefined> {
        return this._baseTransaction(trx)(TABLES.COMMENTS).where("cid", cid).first();
    }

    private async _queryCommentUpvote(cid: string, trx?: Transaction): Promise<number> {
        const upvotes: number = <number>(
            (await this._baseTransaction(trx)(TABLES.VOTES).where({ commentCid: cid, vote: 1 }).count())[0]["count(*)"]
        );
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

    private async _queryAuthorEdit(cid: string, authorAddress: string, trx?: Transaction): Promise<AuthorCommentEdit | undefined> {
        const authorEdit = await this._baseTransaction(trx)(TABLES.COMMENT_EDITS)
            .select(
                "commentCid",
                "content",
                "deleted",
                "flair",
                "spoiler",
                "reason",
                "author",
                "signature",
                "protocolVersion",
                "subplebbitAddress",
                "timestamp"
            )
            .where({ commentCid: cid, authorAddress })
            .orderBy("timestamp", "desc")
            .first();

        return authorEdit;
    }

    private async _queryLatestModeratorReason(
        comment: Pick<CommentsTableRow, "cid" | "author">,
        trx?: Transaction
    ): Promise<Pick<CommentUpdate, "reason">> {
        const moderatorReason: Pick<CommentEditType, "reason"> | undefined = await this._baseTransaction(trx)(TABLES.COMMENT_EDITS)
            .select("reason")
            .where("commentCid", comment.cid)
            .whereNot("authorAddress", comment.author.address)
            .whereNotNull("reason")
            .orderBy("timestamp", "desc")
            .first();
        return moderatorReason;
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
                        .orderBy("timestamp", "desc")
                        .first()
                )
            ))
        );
        return res;
    }

    async queryAuthorEditDeleted(cid: string, trx?: Transaction): Promise<AuthorCommentEdit["deleted"] | undefined> {
        const deleted = await this._baseTransaction(trx)(TABLES.COMMENT_EDITS)
            .select("deleted")
            .where("commentCid", cid)
            .whereNotNull("deleted")
            .orderBy("timestamp", "desc")
            .first();
        return deleted;
    }

    private async _queryModCommentFlair(
        comment: Pick<CommentsTableRow, "cid" | "author">,
        trx?: Transaction
    ): Promise<Pick<CommentEditType, "flair"> | undefined> {
        const latestFlair: Pick<CommentEditType, "flair"> | undefined = await this._baseTransaction(trx)(TABLES.COMMENT_EDITS)
            .select("flair")
            .where("commentCid", comment.cid)
            .whereNotNull("flair")
            .whereNot("authorAddress", comment.author.address)
            .orderBy("timestamp", "desc")
            .first();
        return latestFlair;
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
        comment: Pick<CommentsTableRow, "cid" | "author" | "timestamp">,
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
            this.querySubplebbitAuthor(comment.author.address, trx),
            this._queryAuthorEdit(comment.cid, comment.author.address, trx),
            this._queryCommentCounts(comment.cid, trx),
            this._queryLatestModeratorReason(comment, trx),
            this.queryCommentFlags(comment.cid, trx),
            this._queryModCommentFlair(comment, trx),
            this._queryLastChildCidAndLastReplyTimestamp(comment, trx)
        ]);
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

    async insertSigner(signer: SingersTableRowInsert, trx?: Transaction) {
        return this._baseTransaction(trx)(TABLES.SIGNERS).insert(signer);
    }

    async querySigner(ipnsKeyName: string, trx?: Transaction): Promise<SignersTableRow | undefined> {
        return this._baseTransaction(trx)(TABLES.SIGNERS).where({ ipnsKeyName }).first();
    }

    async queryAuthorModEdits(authorAddress: string, trx?: Knex.Transaction): Promise<Pick<SubplebbitAuthor, "banExpiresAt" | "flair">> {
        const authorComments: Pick<CommentsTableRow, "cid">[] = await this._baseTransaction(trx)(TABLES.COMMENTS)
            .select("cid")
            .where("authorAddress", authorAddress);
        if (!Array.isArray(authorComments) || authorComments.length === 0) return {};
        const commentAuthorEdits: Pick<CommentEditsTableRow, "commentAuthor">[] = await this._baseTransaction(trx)(TABLES.COMMENT_EDITS)
            .select("commentAuthor")
            .whereIn(
                "commentCid",
                authorComments.map((c) => c.cid)
            )
            .whereNotNull("commentAuthor")
            .orderBy("timestamp", "desc");
        const banAuthor = commentAuthorEdits.find((edit) => typeof edit.commentAuthor?.banExpiresAt === "number")?.commentAuthor;
        const authorFlairByMod = commentAuthorEdits.find((edit) => edit.commentAuthor?.flair)?.commentAuthor;

        return { ...banAuthor, ...authorFlairByMod };
    }

    async querySubplebbitAuthor(authorAddress: string, trx?: Knex.Transaction): Promise<SubplebbitAuthor | undefined> {
        const authorCommentCids = await this._baseTransaction(trx)(TABLES.COMMENTS).select("cid").where("authorAddress", authorAddress);
        if (authorCommentCids.length === 0) return undefined;
        const authorComments: (CommentsTableRow & Pick<CommentUpdate, "upvoteCount" | "downvoteCount">)[] = [];
        for (const cidObj of authorCommentCids) {
            authorComments.push({
                ...(await this.queryComment(cidObj["cid"], trx)),
                upvoteCount: await this._queryCommentUpvote(cidObj["cid"], trx),
                downvoteCount: await this._queryCommentDownvote(cidObj["cid"], trx)
            });
        }
        const authorPosts = authorComments.filter((comment) => comment.depth === 0);
        const authorReplies = authorComments.filter((comment) => comment.depth > 0);

        const postScore: number = sumBy(authorPosts, (post) => post.upvoteCount) - sumBy(authorPosts, (post) => post.downvoteCount);

        const replyScore: number =
            sumBy(authorReplies, (reply) => reply.upvoteCount) - sumBy(authorReplies, (reply) => reply.downvoteCount);

        const lastCommentCid = lodash.maxBy(authorComments, (comment) => comment.id).cid;

        const firstCommentTimestamp = lodash.minBy(authorComments, (comment) => comment.id).timestamp;

        const modAuthorEdits = await this.queryAuthorModEdits(authorAddress, trx);

        return {
            postScore,
            replyScore,
            lastCommentCid,
            ...modAuthorEdits,
            firstCommentTimestamp
        };
    }

    async changeDbFilename(newDbFileName: string, newSubplebbit: DbHandler["_subplebbit"]) {
        const log = Logger("plebbit-js:db-handler:changeDbFilename");

        const oldPathString = (<any>this._dbConfig.connection).filename;
        assert.ok(oldPathString, "subplebbit._dbConfig either does not exist or DB connection is in memory");
        this._currentTrxs = {};
        this._subplebbit = newSubplebbit;
        if (oldPathString === ":memory:") {
            log.trace(`No need to change file name of db since it's in memory`);
            return;
        }
        const newPath = path.format({ dir: path.dirname(oldPathString), base: newDbFileName });

        await fs.promises.mkdir(path.dirname(newPath), { recursive: true });

        await fs.promises.cp(oldPathString, newPath);
        await fs.promises.rm(oldPathString, { force: true, maxRetries: 10 });

        this._dbConfig = {
            ...this._dbConfig,
            connection: {
                ...(<any>this._dbConfig.connection),
                filename: newPath
            }
        };
        //@ts-ignore
        this._knex = this._keyv = undefined;
        await this.initDbIfNeeded();
        log(`Changed db path from (${oldPathString}) to (${newPath})`);
    }

    // Start lock
    async lockSubStart(subAddress = this._subplebbit.address) {
        if (subAddress === this._subplebbit.address && this.isDbInMemory()) return;

        const log = Logger("plebbit-js:lock:start");

        const lockfilePath = path.join(this._subplebbit.plebbit.dataPath, "subplebbits", `${subAddress}.start.lock`);
        const subDbPath = path.join(this._subplebbit.plebbit.dataPath, "subplebbits", subAddress);

        try {
            await lockfile.lock(subDbPath, {
                lockfilePath,
                onCompromised: () => {} // Temporary bandaid for the moment. Should be deleted later
            });
            log(`Locked the start of subplebbit (${subAddress}) successfully`);
        } catch (e) {
            if (e.message === "Lock file is already being held")
                throwWithErrorCode("ERR_SUB_ALREADY_STARTED", { subplebbitAddress: subAddress });
            else {
                log(`Error while trying to lock start of sub (${subAddress}): ${e}`);
                throw e;
            }
        }
    }

    async unlockSubStart(subAddress = this._subplebbit.address) {
        if (subAddress === this._subplebbit.address && this.isDbInMemory()) return;

        const log = Logger("plebbit-js:lock:start");
        log.trace(`Attempting to unlock the start of sub (${subAddress})`);

        const lockfilePath = path.join(this._subplebbit.plebbit.dataPath, "subplebbits", `${subAddress}.start.lock`);
        const subDbPath = path.join(this._subplebbit.plebbit.dataPath, "subplebbits", subAddress);
        if (!fs.existsSync(lockfilePath) || !fs.existsSync(subDbPath)) return;

        try {
            await lockfile.unlock(subDbPath, { lockfilePath });
            log(`Unlocked start of sub (${subAddress})`);
        } catch (e) {
            log(`Error while trying to unlock start of sub (${subAddress}): ${e}`);
            throw e;
        }
    }

    async isSubStartLocked(subAddress = this._subplebbit.address) {
        const lockfilePath = path.join(this._subplebbit.plebbit.dataPath, "subplebbits", `${subAddress}.start.lock`);
        const subDbPath = path.join(this._subplebbit.plebbit.dataPath, "subplebbits", subAddress);
        return lockfile.check(subDbPath, { lockfilePath, realpath: false, stale: 30000 });
    }

    // Subplebbit state lock

    async lockSubState(subAddress = this._subplebbit.address) {
        if (subAddress === this._subplebbit.address && this.isDbInMemory()) return;

        const log = Logger("plebbit-js:lock:lockSubState");
        const lockfilePath = path.join(this._subplebbit.plebbit.dataPath, "subplebbits", `${subAddress}.state.lock`);
        const subDbPath = path.join(this._subplebbit.plebbit.dataPath, "subplebbits", subAddress);
        try {
            await lockfile.lock(subDbPath, {
                lockfilePath,
                realpath: false,
                retries: 5,
                onCompromised: () => {}
            });
        } catch (e) {
            if (e.message === "Lock file is already being held")
                throwWithErrorCode("ERR_SUB_STATE_LOCKED", { subplebbitAddress: subAddress });
        }
    }

    async unlockSubState(subAddress = this._subplebbit.address) {
        if (subAddress === this._subplebbit.address && this.isDbInMemory()) return;

        const log = Logger("plebbit-js:lock:unlockSubState");

        const lockfilePath = path.join(this._subplebbit.plebbit.dataPath, "subplebbits", `${subAddress}.state.lock`);
        const subDbPath = path.join(this._subplebbit.plebbit.dataPath, "subplebbits", subAddress);
        if (!fs.existsSync(lockfilePath)) return;
        await lockfile.unlock(subDbPath, { lockfilePath, realpath: false });
    }

    // Misc functions

    subDbExists(subAddress = this._subplebbit.address) {
        const dbPath = path.join(this._subplebbit.plebbit.dataPath, "subplebbits", subAddress);
        return fs.existsSync(dbPath);
    }

    subAddress() {
        return this._subplebbit.address;
    }
}
