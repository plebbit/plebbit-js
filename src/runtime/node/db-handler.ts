import { PUBSUB_MESSAGE_TYPES } from "../../challenge";
import Author from "../../author";
import { removeKeysWithUndefinedValues, replaceXWithY, throwWithErrorCode, TIMEFRAMES_TO_SECONDS, timestamp } from "../../util";
import knex, { Knex } from "knex";
import { Subplebbit } from "../../subplebbit";
import path from "path";
import assert from "assert";
import fs from "fs";
import Keyv from "keyv";
import Transaction = Knex.Transaction;
import {
    AuthorCommentEdit,
    ChallengeAnswersTableRow,
    ChallengeRequestsTableRow,
    ChallengesTableRow,
    ChallengeVerificationsTableRow,
    CommentEditsTableRow,
    CommentEditType,
    CommentIpfsType,
    CommentsTableRow,
    CommentsTableRowInsert,
    CommentUpdate,
    CommentUpdatesRow,
    CommentWithCommentUpdate,
    PageIpfs,
    SignersTableRow,
    SubplebbitAuthor,
    SubplebbitMetrics,
    VotesTableRow
} from "../../types";
import Logger from "@plebbit/plebbit-logger";
import { getDefaultSubplebbitDbConfig } from "./util";
import env from "../../version";
import { Plebbit } from "../../plebbit";
import sumBy from "lodash/sumBy";
import lodash from "lodash";

import * as lockfile from "proper-lockfile";
import { PageOptions } from "../../sort-handler";

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
        plebbit: Pick<Plebbit, "dataPath">;
    };
    private _currentTrxs: Record<string, Transaction>; // Prefix to Transaction. Prefix represents all trx under a pubsub message or challenge
    private _dbConfig: Knex.Config<any>;
    private _keyv: Keyv;
    private _createdTables: boolean;

    constructor(subplebbit: DbHandler["_subplebbit"]) {
        this._subplebbit = subplebbit;
        this._currentTrxs = {};
        this._createdTables = false;
    }

    async initDbConfigIfNeeded() {
        if (!this._dbConfig) this._dbConfig = await getDefaultSubplebbitDbConfig(this._subplebbit);
    }

    async initDbIfNeeded() {
        assert(
            typeof this._subplebbit.address === "string" && this._subplebbit.address.length > 0,
            `DbHandler needs to be an instantiated with a Subplebbit that has a valid address, (${this._subplebbit.address}) was provided`
        );
        await this.initDbConfigIfNeeded();
        if (!this._knex) this._knex = knex(this._dbConfig);
        if (!this._createdTables) await this.createTablesIfNeeded();
        if (!this._keyv) this._keyv = new Keyv(`sqlite://${(<any>this._dbConfig.connection).filename}`);
    }

    getDbConfig(): Knex.Config {
        return this._dbConfig;
    }

    async keyvGet(key: string, options?: { raw?: false }) {
        const res = await this._keyv.get(key, options);
        if (JSON.stringify(res) === "{}") {
            await this.keyvDelete(key);
            return undefined;
        }
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

    async destoryConnection() {
        if (this._knex) await this._knex.destroy();
    }
    async createTransaction(transactionId: string): Promise<Transaction> {
        assert(!this._currentTrxs[transactionId]);
        const trx = await this._knex.transaction();
        this._currentTrxs[transactionId] = trx;
        return trx;
    }

    async commitTransaction(transactionId: string) {
        const trx: Transaction = this._currentTrxs[transactionId];
        assert(trx && trx.isTransaction && !trx.isCompleted(), `Transaction (${transactionId}) needs to be stored to commit`);
        await this._currentTrxs[transactionId].commit();
        delete this._currentTrxs[transactionId];
    }

    async rollbackTransaction(transactionId: string) {
        const log = Logger("plebbit-js:db-handler:rollbackTransaction");

        const trx: Transaction = this._currentTrxs[transactionId];
        if (trx) {
            assert(trx && trx.isTransaction && !trx.isCompleted(), `Transaction (${transactionId}) needs to be stored to rollback`);
            await this._currentTrxs[transactionId].rollback();
            delete this._currentTrxs[transactionId];
        }

        log.trace(
            `Rolledback transaction (${transactionId}), this._currentTrxs[transactionId].length = ${Object.keys(this._currentTrxs).length}`
        );
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
            table.string("thumbnailUrl").nullable();
            table.text("parentCid").nullable().references("cid").inTable(TABLES.COMMENTS);
            table.text("postCid").notNullable().references("cid").inTable(TABLES.COMMENTS);
            table.text("previousCid").nullable().references("cid").inTable(TABLES.COMMENTS);
            table.uuid("challengeRequestId").notNullable().references("challengeRequestId").inTable(TABLES.CHALLENGES);

            table.text("subplebbitAddress").notNullable();
            table.text("content").nullable();
            table.timestamp("timestamp").notNullable().checkBetween([0, Number.MAX_SAFE_INTEGER]);
            table.json("signature").notNullable().unique(); // Will contain {signature, public key, type}
            table.text("ipnsName").notNullable().unique();
            table.text("ipnsKeyName").notNullable().unique().references("ipnsKeyName").inTable(TABLES.SIGNERS);
            table.text("title").nullable();
            table.integer("depth").notNullable().checkBetween([0, Number.MAX_SAFE_INTEGER]);

            table.boolean("spoiler");

            table.text("protocolVersion").notNullable();

            table.increments("id"); // Used for sorts
            table.boolean("updateTrigger").defaultTo(true); // Used to trigger new CommentUpdaate
        });
    }

    private async _createCommentUpdatesTable(tableName: string) {
        await this._knex.schema.createTable(tableName, (table) => {
            table.text("cid").notNullable().primary().unique().references("cid").inTable(TABLES.COMMENTS);

            table.json("authorEdit").nullable();
            table.integer("upvoteCount").notNullable().checkBetween([0, Number.MAX_SAFE_INTEGER]);
            table.integer("downvoteCount").notNullable().checkBetween([0, Number.MAX_SAFE_INTEGER]);

            // We're not storing replies here because it would take too much storage, and is not needed

            table.integer("replyCount").notNullable().checkBetween([0, Number.MAX_SAFE_INTEGER]);
            table.json("flair").nullable();
            table.boolean("spoiler");
            table.boolean("pinned");
            table.boolean("locked");
            table.boolean("removed");
            table.text("moderatorReason");
            table.timestamp("updatedAt").notNullable().checkPositive();
            table.text("protocolVersion").notNullable();
            table.json("signature").notNullable().unique(); // Will contain {signature, public key, type}
            table.json("author").nullable();
        });
    }

    private async _createVotesTable(tableName: string) {
        await this._knex.schema.createTable(tableName, (table) => {
            table.text("commentCid").notNullable().references("cid").inTable(TABLES.COMMENTS);
            table.text("authorAddress").notNullable();
            table.json("author").notNullable();
            table.uuid("challengeRequestId").notNullable().references("challengeRequestId").inTable(TABLES.CHALLENGES);

            table.timestamp("timestamp").checkPositive().notNullable();
            table.text("subplebbitAddress").notNullable();
            table.integer("vote").checkBetween([-1, 1]).notNullable();
            table.text("signature").notNullable().unique();
            table.text("protocolVersion").notNullable();

            table.primary(["commentCid", "authorAddress"]); // An author can't have multiple votes on a comment
        });
    }

    private async _createChallengeRequestsTable(tableName: string) {
        await this._knex.schema.createTable(tableName, (table) => {
            table.uuid("challengeRequestId").notNullable().primary().unique();
            table.text("userAgent").notNullable();
            table.text("protocolVersion").notNullable();
            table.text("signature").notNullable().unique();
            table.json("acceptedChallengeTypes").nullable(); // string[]
        });
    }

    private async _createChallengesTable(tableName: string) {
        await this._knex.schema.createTable(tableName, (table) => {
            table
                .uuid("challengeRequestId")
                .notNullable()
                .primary()
                .unique()
                .references("challengeRequestId")
                .inTable(TABLES.CHALLENGE_REQUESTS);
            table.text("userAgent").notNullable();
            table.text("protocolVersion").notNullable();
            table.text("signature").notNullable().unique();

            // Might store the challenge here in the future. For now we're not because it would take too much storage
            table.json("challengeTypes").notNullable(); // string[]
        });
    }

    private async _createChallengeAnswersTable(tableName: string) {
        await this._knex.schema.createTable(tableName, (table) => {
            table
                .uuid("challengeRequestId")
                .notNullable()
                .primary()
                .unique()
                .references("challengeRequestId")
                .inTable(TABLES.CHALLENGE_REQUESTS);
            table.uuid("challengeAnswerId").notNullable().unique();
            table.text("userAgent").notNullable();
            table.text("protocolVersion").notNullable();
            table.json("challengeAnswers").notNullable(); // Decrypted
            table.text("signature").notNullable().unique();
        });
    }

    private async _createChallengeVerificationsTable(tableName: string) {
        await this._knex.schema.createTable(tableName, (table) => {
            table
                .uuid("challengeRequestId")
                .notNullable()
                .primary()
                .unique()
                .references("challengeRequestId")
                .inTable(TABLES.CHALLENGE_REQUESTS);
            table.uuid("challengeAnswerId").notNullable().unique().references("challengeAnswerId").inTable(TABLES.CHALLENGE_ANSWERS);
            table.boolean("challengeSuccess").notNullable();
            table.json("challengeErrors").nullable(); // string[]
            table.text("reason").nullable();
            table.text("signature").notNullable().unique();

            table.text("userAgent").notNullable();
            table.text("protocolVersion").notNullable();
        });
    }

    private async _createSignersTable(tableName: string) {
        await this._knex.schema.createTable(tableName, (table) => {
            table.text("ipnsKeyName").notNullable().unique().primary();
            table.text("privateKey").notNullable().unique();
            table.text("type").notNullable(); // RSA or any other type
        });
    }

    private async _createCommentEditsTable(tableName: string) {
        await this._knex.schema.createTable(tableName, (table) => {
            table.text("commentCid").notNullable().references("cid").inTable(TABLES.COMMENTS);
            table.text("authorAddress").notNullable();
            table.json("author").notNullable();
            table.uuid("challengeRequestId").notNullable().references("challengeRequestId").inTable(TABLES.CHALLENGES);
            table.text("signature").notNullable().unique();
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

            table.primary(["id", "commentCid"]);
        });
    }

    async getDbVersion(): Promise<number> {
        return Number((await this._knex.raw("PRAGMA user_version"))[0]["user_version"]);
    }

    async createTablesIfNeeded() {
        const log = Logger("plebbit-js:db-handler:createTablesIfNeeded");

        let dbVersion = await this.getDbVersion();
        log.trace(`db version: ${dbVersion}`);
        const needToMigrate = dbVersion !== env.DB_VERSION;
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
                    await createTableFunctions[i].bind(this)(tempTableName);
                    await this._copyTable(table, tempTableName);
                    await this._knex.schema.dropTable(table);
                    await this._knex.schema.renameTable(tempTableName, table);
                }
            })
        );

        await this._knex.raw("PRAGMA foreign_keys = ON");
        await this._knex.raw(`PRAGMA user_version = ${env.DB_VERSION}`);
        dbVersion = await this.getDbVersion();
        assert.equal(dbVersion, env.DB_VERSION);
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
            await this._knex(dstTable).insert(srcRecordFiltered);
        }
        log(`copied table ${srcTable} to table ${dstTable}`);
    }

    async upsertVote(vote: VotesTableRow, trx?: Transaction) {
        await this._baseTransaction(trx)(TABLES.VOTES).insert(vote).onConflict(["commentCid", "authorAddress"]).merge();
    }

    async insertComment(comment: CommentsTableRowInsert, trx?: Transaction) {
        await this._baseTransaction(trx)(TABLES.COMMENTS).insert(comment);
    }

    async setCommentUpdateTrigger(commentCid: string, updateTrigger: boolean, trx?: Transaction) {
        await this._baseTransaction(trx)(TABLES.COMMENTS).where({ cid: commentCid }).update({ updateTrigger });
    }

    async upsertCommentUpdate(update: CommentUpdatesRow, trx?: Transaction) {
        await this._baseTransaction(trx)(TABLES.COMMENT_UPDATES).insert(update).onConflict(["cid"]).merge();
    }

    async insertEdit(edit: CommentEditsTableRow, trx?: Transaction) {
        await this._baseTransaction(trx)(TABLES.COMMENT_EDITS).insert(edit);
    }

    async insertChallengeRequest(request: ChallengeRequestsTableRow, trx?: Transaction) {
        await this._baseTransaction(trx)(TABLES.CHALLENGE_REQUESTS).insert(request);
    }

    async insertChallenge(challenge: ChallengesTableRow, trx?: Transaction) {
        await this._baseTransaction(trx)(TABLES.CHALLENGES).insert(challenge);
    }

    async insertChallengeAnswer(answer: ChallengeAnswersTableRow, trx?: Transaction) {
        await this._baseTransaction(trx)(TABLES.CHALLENGE_ANSWERS).insert(answer);
    }

    async insertChallengeVerification(verification: ChallengeVerificationsTableRow, trx?: Transaction) {
        await this._baseTransaction(trx)(TABLES.CHALLENGE_VERIFICATIONS).insert(verification);
    }

    async getLastVoteOfAuthor(commentCid: string, authorAddress: string, trx?: Transaction): Promise<VotesTableRow | undefined> {
        return this._baseTransaction(trx)(TABLES.VOTES)
            .where({
                commentCid: commentCid,
                authorAddress: authorAddress
            })
            .first();
    }

    private _basePageQuery(options: PageOptions, trx?: Transaction) {
        let query = this._baseTransaction(trx)(TABLES.COMMENTS)
            .innerJoin(TABLES.COMMENT_UPDATES, `${TABLES.COMMENTS}.cid`, `${TABLES.COMMENT_UPDATES}.cid`)
            .jsonExtract(`${TABLES.COMMENT_UPDATES}.authorEdit`, "$.deleted", "deleted", true)
            .where({ parentCid: options.parentCid || null });

        if (options.excludeCommentsWithDifferentSubAddress) query = query.where({ subplebbitAddress: this._subplebbit.address });
        if (options.excludeRemovedComments) query = query.whereNot(`${TABLES.COMMENT_UPDATES}.removed`, 1);
        if (options.excludeDeletedComments) query = query.andWhereRaw("`deleted` is not 1");

        return query;
    }

    private async _queryReplyCount(commentCid: string, trx?: Transaction): Promise<number> {
        const children = await this.queryCommentsUnderComment(commentCid, trx);

        return children.length + lodash.sum(await Promise.all(children.map((comment) => this._queryReplyCount(comment.cid, trx))));
    }

    async _queryCommentWithRemoteCommentUpdate(
        cid: string,
        trx?: Transaction
    ): Promise<{ comment: CommentsTableRow; commentUpdate: CommentUpdatesRow }> {
        // When we say remote, we mean a CommentUpdate that has been signed and stored in commentUpdates table
        // It could be in the middle of being published to ipns
        const comment = await this._baseTransaction(trx)(TABLES.COMMENTS).where("cid", cid).first();
        const commentUpdate = await this._baseTransaction(trx)(TABLES.COMMENT_UPDATES).where("cid", cid).first();
        assert(commentUpdate);
        return { comment, commentUpdate };
    }

    async queryCommentsForPages(options: PageOptions, trx?: Transaction) {
        const comments = await this._basePageQuery(options, trx);
        debugger;
        return Promise.all(comments.map((comment) => this._queryCommentWithRemoteCommentUpdate(comment.cid, trx)));
    }

    async queryCommentsOfAuthor(authorAddress: string, trx?: Transaction) {
        return this._baseTransaction(trx)(TABLES.COMMENTS).where("authorAddress", authorAddress);
    }

    async queryParentsOfComment(
        comment: Pick<CommentWithCommentUpdate, "depth" | "parentCid">,
        trx?: Transaction
    ): Promise<CommentsTableRow[]> {
        const parents: CommentsTableRow[] = [];
        let curParentCid = comment.parentCid;
        while (curParentCid) {
            const parent = await this.queryComment(curParentCid, trx);
            if (parent) parents.push(parent);
            curParentCid = parent?.parentCid;
        }
        assert.equal(comment.depth, parents.length, "Depth should equal to parents length");
        return parents;
    }

    async queryCommentsToBeUpdated(
        opts: { minimumUpdatedAt: number; ipnsKeyNames: string[] },
        trx?: Transaction
    ): Promise<Pick<CommentsTableRow, "cid">[]> {
        // Add comments with no CommentUpdate
        const cids: Pick<CommentsTableRow, "cid">[] = await this._baseTransaction(trx)(TABLES.COMMENTS)
            // .select("cid")
            .leftJoin(TABLES.COMMENT_UPDATES, `${TABLES.COMMENTS}.cid`, `${TABLES.COMMENT_UPDATES}.cid`)
            .where(`${TABLES.COMMENT_UPDATES}.updatedAt`, "<", opts.minimumUpdatedAt)
            .orWhereNull(`${TABLES.COMMENT_UPDATES}.updatedAt`)
            .orWhere("updateTrigger", true)
            .orWhereNotIn("ipnsKeyName", opts.ipnsKeyNames);
        return cids;
    }

    // TODO rewrite this
    async querySubplebbitMetrics(trx?: Transaction): Promise<SubplebbitMetrics> {
        const metrics = await Promise.all(
            ["PostCount", "ActiveUserCount"].map(
                async (metricType) =>
                    await Promise.all(
                        Object.keys(TIMEFRAMES_TO_SECONDS).map(async (timeframe) => {
                            const propertyName = `${timeframe.toLowerCase()}${metricType}`;
                            const [from, to] = [Math.max(0, timestamp() - TIMEFRAMES_TO_SECONDS[timeframe]), timestamp()];
                            if (metricType === "ActiveUserCount") {
                                const res = (
                                    await this._baseTransaction(trx)(TABLES.COMMENTS)
                                        .countDistinct("comments.authorAddress")
                                        .join(TABLES.VOTES, `${TABLES.COMMENTS}.authorAddress`, `=`, `${TABLES.VOTES}.authorAddress`)
                                        .whereBetween("comments.timestamp", [from, to])
                                )[0]["count(distinct `comments`.`authorAddress`)"];
                                return { [propertyName]: res };
                            } else if (metricType === "PostCount") {
                                const query = this._baseTransaction(trx)(TABLES.COMMENTS)
                                    .count()
                                    .whereBetween("timestamp", [from, to])
                                    .whereNotNull("title");
                                const res = await query;
                                return { [propertyName]: res[0]["count(*)"] };
                            }
                        })
                    )
            )
        );

        const combinedMetrics: SubplebbitMetrics = Object.assign({}, ...metrics.flat());
        return combinedMetrics;
    }

    async queryCommentsUnderComment(parentCid: string | undefined | null, trx?: Transaction): Promise<CommentsTableRow[]> {
        return this._baseTransaction(trx)(TABLES.COMMENTS).where({ parentCid: parentCid || null });
    }

    async queryComment(cid: string, trx?: Transaction): Promise<CommentsTableRow | undefined> {
        return this._baseTransaction(trx).where("cid", cid).first();
    }

    private async _queryCommentUpvote(cid: string, trx?: Transaction): Promise<number> {
        return (await this._baseTransaction(trx)(TABLES.VOTES).where({ commentCid: cid, vote: 1 }).count())["count(*)"];
    }

    private async _queryCommentDownvote(cid: string, trx?: Transaction): Promise<number> {
        return (await this._baseTransaction(trx)(TABLES.VOTES).where({ commentCid: cid, vote: -1 }).count())["count(*)"];
    }

    private async _queryCommentCounts(
        cid: string,
        trx?: Transaction
    ): Promise<Pick<CommentWithCommentUpdate, "replyCount" | "upvoteCount" | "downvoteCount">> {
        const [replyCount, upvoteCount, downvoteCount] = await Promise.all([
            this._queryReplyCount(cid, trx),
            this._queryCommentUpvote(cid, trx),
            this._queryCommentDownvote(cid, trx)
        ]);
        debugger;
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

    private async _queryLatestModeratorReason(cid: string, trx?: Transaction): Promise<Pick<CommentUpdate, "reason">> {
        const authorAddress = await this._baseTransaction(trx)(TABLES.COMMENTS).select("authorAddress").where("cid", cid).first();

        const moderatorReason: Pick<CommentEditType, "reason"> | undefined = await this._baseTransaction(trx)(TABLES.COMMENT_EDITS)
            .select("reason")
            .where("commentCid", cid)
            .whereNot("authorAddress", authorAddress["authorAddress"])
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
        debugger;
        return res;
    }

    async queryAuthorEditDeleted(cid: string, trx?: Transaction): Promise<AuthorCommentEdit["deleted"] | undefined> {
        const deleted = await this._baseTransaction(trx)(TABLES.COMMENT_EDITS)
            .select("deleted")
            .where("commentCid", cid)
            .whereNotNull("deleted")
            .orderBy("timestamp", "desc")
            .first();
        debugger;
        return deleted;
    }

    private async _queryModCommentFlair(cid: string, trx?: Transaction): Promise<Pick<CommentEditType, "flair">> {
        const authorAddress = await this._baseTransaction(trx)(TABLES.COMMENTS).select("authorAddress").where("cid", cid).first();
        const latestFlair: Pick<CommentEditType, "flair"> = await this._baseTransaction(trx)(TABLES.COMMENT_EDITS)
            .select("flair")
            .where("commentCid", cid)
            .whereNotNull("flair")
            .whereNot("authorAddress", authorAddress["authorAddress"])
            .orderBy("timestamp", "desc")
            .first();
        debugger;
        return latestFlair;
    }

    async queryCommentWithCommentUpdate(
        cid: string,
        trx?: Transaction
    ): Promise<{
        comment: CommentsTableRow;
        commentUpdate: Omit<CommentUpdate, "signature" | "updatedAt" | "replies" | "protocolVersion">;
    }> {
        const commentIpfs = await this.queryComment(cid, trx);
        const authorSubplebbit = await this.querySubplebbitAuthor(commentIpfs.author.address, trx);
        const authorEdit = await this._queryAuthorEdit(cid, commentIpfs.author.address, trx);
        const commentUpdateCounts = await this._queryCommentCounts(commentIpfs.cid, trx);
        const moderatorReason = await this._queryLatestModeratorReason(cid, trx);
        const commentFlags = await this.queryCommentFlags(cid, trx);

        // Flair
        const commentModFlair = await this._queryModCommentFlair(cid, trx);

        const commentUpdateFlair = commentModFlair.flair || authorEdit.flair;

        return {
            comment: commentIpfs,
            commentUpdate: {
                cid: commentIpfs.cid,
                edit: authorEdit,
                ...commentUpdateCounts,
                flair: commentUpdateFlair,
                ...commentFlags,
                ...moderatorReason,

                author: { subplebbit: authorSubplebbit }
            }
        };
    }

    async queryCommentsWithCommentUpdate(cids: string | string[], trx?: Transaction) {
        if (!Array.isArray(cids)) cids = [cids];

        return Promise.all(cids.map((cid) => this.queryCommentWithCommentUpdate(cid, trx)));
    }

    async queryLatestPostCid(trx?: Transaction): Promise<Pick<CommentWithCommentUpdate, "cid"> | undefined> {
        return this._baseTransaction(trx)(TABLES.COMMENTS).select("cid").where({ depth: 0 }).orderBy("id", "desc").first();
    }

    async insertSigner(signer: SignersTableRow, trx?: Transaction) {
        await this._baseTransaction(trx)(TABLES.SIGNERS).insert(signer);
    }

    async querySigner(ipnsKeyName: string, trx?: Transaction): Promise<SignersTableRow | undefined> {
        return this._baseTransaction(trx)(TABLES.SIGNERS).where({ ipnsKeyName }).first();
    }

    async queryCommentsGroupByDepth(trx?: Knex.Transaction): Promise<Pick<CommentsTableRow, "cid">[][]> {
        const maxDepth = (await this._baseTransaction(trx)(TABLES.COMMENTS).max("depth"))[0]["max(`depth`)"];
        if (typeof maxDepth !== "number") return [[]];

        const depths = new Array(maxDepth + 1).fill(null).map((value, i) => i);
        const comments = await Promise.all(
            depths.map(async (depth) => {
                return await this._baseTransaction(trx)(TABLES.COMMENTS).where({ depth: depth }).select("cid");
            })
        );
        return comments;
    }

    async queryCountOfPosts(pageOptions: PageOptions, trx?: Knex.Transaction): Promise<number> {
        const obj = await this._basePageQuery(pageOptions, trx).count().where({ depth: 0 }).first();
        if (!obj) return 0;
        return Number(obj["count(*)"]);
    }

    async queryAuthorBanExpiry(authorAddress: string, trx?: Knex.Transaction): Promise<SubplebbitAuthor["banExpiresAt"]> {
        const authorComments = await this._baseTransaction(trx)("comments").select("cid").where("authorAddress", authorAddress);
        const banExpiresAt: number | undefined = await this._baseTransaction(trx)("commentEdits")
            .jsonExtract("commentAuthor", "$.banExpiresAt", "banExpiresAt", true)
            .select("banExpiresAt")
            .whereIn("commentCid", authorComments)
            .whereNotNull("banExpiresAt")
            .orderBy("timestamp", "desc")
            .first();
        debugger;
        return banExpiresAt;
    }

    async queryAuthorFlairByMod(authorAddress: string, trx?: Knex.Transaction): Promise<Pick<SubplebbitAuthor, "flair">> {
        const authorComments = await this._baseTransaction(trx)("comments").select("cid").where("authorAddress", authorAddress);
        const modFlair: Pick<SubplebbitAuthor, "flair"> = await this._baseTransaction(trx)("commentEdits")
            .jsonExtract("commentAuthor", "$.flair", "flair", true)
            .select("flair")
            .whereIn("commentCid", authorComments)
            .whereNotNull("flair")
            .orderBy("timestamp", "desc")
            .first();
        debugger;
        return modFlair;
    }

    async querySubplebbitAuthor(authorAddress: string, trx?: Knex.Transaction): Promise<SubplebbitAuthor> {
        const authorCommentCids = await this._baseTransaction(trx)(TABLES.COMMENTS).select("cid").where("authorAddress", authorAddress);
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

        const lastCommentCid: string = (
            await this._baseTransaction(trx)(TABLES.COMMENTS).select("cid").where({ authorAddress }).orderBy("id", "desc").first()
        )["cid"];
        if (typeof lastCommentCid !== "string") throw Error("lastCommentCid should be always defined");

        const firstCommentTimestamp: number = (
            await this._baseTransaction(trx)("comments").select("timestamp").orderBy("timestamp", "asc").first()
        )["timestamp"];
        if (typeof firstCommentTimestamp !== "string") throw Error("lastCommentCid should be always defined");

        const banExpiresAt = await this.queryAuthorBanExpiry(authorAddress, trx);

        const authorModFlair = await this.queryAuthorFlairByMod(authorAddress, trx);
        debugger;
        // TODO add flair here
        return { postScore, replyScore, lastCommentCid, banExpiresAt, ...authorModFlair, firstCommentTimestamp };
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

        await fs.promises.rename(oldPathString, newPath);
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
                realpath: false,
                onCompromised: () => {}
            });
            log(`Locked the start of subplebbit (${subAddress}) successfully`);
        } catch (e) {
            if (e.message === "Lock file is already being held") throwWithErrorCode("ERR_SUB_ALREADY_STARTED", `subAddress=${subAddress}`);
            else {
                log(`Error while trying to lock start of sub (${subAddress}): ${e}`);
                throw e;
            }
        }
    }

    async unlockSubStart(subAddress = this._subplebbit.address) {
        if (subAddress === this._subplebbit.address && this.isDbInMemory()) return;
        if (!(await this.isSubStartLocked(subAddress))) return;

        const log = Logger("plebbit-js:lock:start");

        const lockfilePath = path.join(this._subplebbit.plebbit.dataPath, "subplebbits", `${subAddress}.start.lock`);
        const subDbPath = path.join(this._subplebbit.plebbit.dataPath, "subplebbits", subAddress);

        try {
            await lockfile.unlock(subDbPath, { lockfilePath });
            log(`Unlocked start of sub (${subAddress})`);
        } catch (e) {
            if (e.code === "ENOENT") {
                if (fs.existsSync(lockfilePath)) await fs.promises.rmdir(lockfilePath);
            } else if (e.message === "Lock is not acquired/owned by you") {
                if (fs.existsSync(lockfilePath)) await fs.promises.rmdir(lockfilePath); // Forcefully delete the lock
            } else {
                log(`Error while trying to unlock start of sub (${subAddress}): ${e}`);
                throw e;
            }
        }
    }

    async isSubStartLocked(subAddress = this._subplebbit.address) {
        const lockfilePath = path.join(this._subplebbit.plebbit.dataPath, "subplebbits", `${subAddress}.start.lock`);
        const subDbPath = path.join(this._subplebbit.plebbit.dataPath, "subplebbits", subAddress);
        return lockfile.check(subDbPath, { lockfilePath, realpath: false });
    }

    // Creation lock

    async lockSubCreation(subAddress = this._subplebbit.address) {
        if (subAddress === this._subplebbit.address && this.isDbInMemory()) return;

        const log = Logger("plebbit-js:lock:creation");
        const lockfilePath = path.join(this._subplebbit.plebbit.dataPath, "subplebbits", `${subAddress}.create.lock`);
        const subDbPath = path.join(this._subplebbit.plebbit.dataPath, "subplebbits", subAddress);
        try {
            await lockfile.lock(subDbPath, {
                lockfilePath,
                realpath: false,
                onCompromised: () => {}
            });
            log(`Locked the creation of subplebbit (${subAddress}) successfully`);
        } catch (e) {
            if (e.message === "Lock file is already being held") throwWithErrorCode("ERR_SUB_CREATION_LOCKED", `subAddress=${subAddress}`);
            else {
                log(`Error while trying to lock creation of sub (${subAddress}): ${e}`);
                throw e;
            }
        }
    }

    async unlockSubCreation(subAddress = this._subplebbit.address) {
        if (subAddress === this._subplebbit.address && this.isDbInMemory()) return;
        const log = Logger("plebbit-js:lock:unlockSubCreation");

        const lockfilePath = path.join(this._subplebbit.plebbit.dataPath, "subplebbits", `${subAddress}.create.lock`);
        const subDbPath = path.join(this._subplebbit.plebbit.dataPath, "subplebbits", subAddress);
        try {
            await lockfile.unlock(subDbPath, { lockfilePath, realpath: false });
            log(`Unlocked creation of sub (${subAddress})`);
        } catch (e) {
            if (e.code === "ENOENT") {
                if (fs.existsSync(lockfilePath)) await fs.promises.rmdir(lockfilePath);
            } else if (e.message === "Lock is not acquired/owned by you") {
                if (fs.existsSync(lockfilePath)) await fs.promises.rmdir(lockfilePath); // Forcefully delete the lock
            } else {
                log(`Error while trying to unlock creation of sub (${subAddress}): ${e}`);
                throw e;
            }
        }
    }

    async isSubCreationLocked(subAddress = this._subplebbit.address) {
        const lockfilePath = path.join(this._subplebbit.plebbit.dataPath, "subplebbits", `${subAddress}.create.lock`);
        const subDbPath = path.join(this._subplebbit.plebbit.dataPath, "subplebbits", subAddress);

        return lockfile.check(subDbPath, { lockfilePath, realpath: false });
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
                retries: 3,
                onCompromised: () => {}
            });
            log.trace(`Locked the state of subplebbit (${subAddress}) successfully`);
        } catch (e) {
            if (e.message === "Lock file is already being held") throwWithErrorCode("ERR_SUB_STATE_LOCKED", `subAddress=${subAddress}`);
        }
    }

    async unlockSubState(subAddress = this._subplebbit.address) {
        if (subAddress === this._subplebbit.address && this.isDbInMemory()) return;

        const log = Logger("plebbit-js:lock:unlockSubState");

        const lockfilePath = path.join(this._subplebbit.plebbit.dataPath, "subplebbits", `${subAddress}.state.lock`);
        const subDbPath = path.join(this._subplebbit.plebbit.dataPath, "subplebbits", subAddress);
        await lockfile.unlock(subDbPath, { lockfilePath });

        log.trace(`Unlocked state of sub (${subAddress})`);
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
