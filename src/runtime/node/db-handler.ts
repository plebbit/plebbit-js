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
    AuthorDbType,
    AuthorType,
    ChallengeRequestMessageType,
    ChallengeVerificationMessageType,
    CommentEditForDbType,
    CommentEditType,
    CommentForDbType,
    CommentType,
    DecryptedChallengeAnswerMessageType,
    DecryptedChallengeMessageType,
    PostType,
    SignerType,
    SubplebbitAuthor,
    SubplebbitMetrics,
    SubplebbitType,
    VoteForDbType,
    VoteType
} from "../../types";
import Logger from "@plebbit/plebbit-logger";
import { getDefaultSubplebbitDbConfig } from "./util";
import env from "../../version";
import { Plebbit } from "../../plebbit";
import sumBy from "lodash/sumBy";
import lodash from "lodash";
import { MOD_EDIT_FIELDS } from "../../comment-edit";
import { CACHE_KEYS } from "../../constants";
import { getPlebbitAddressFromPrivateKeyPem, getPlebbitAddressFromPublicKeyPem } from "../../signer/util";
import { Signer } from "../../signer";

import * as lockfile from "proper-lockfile";
import { PageOptions } from "../../sort-handler";

const TABLES = Object.freeze({
    COMMENTS: "comments",
    VOTES: "votes",
    AUTHORS: "authors",
    CHALLENGES: "challenges",
    SIGNERS: "signers", // To store private keys of subplebbit and comments' IPNS,
    EDITS: "edits"
});

const defaultPageOption: PageOptions = {
    excludeDeletedComments: false,
    excludeRemovedComments: false,
    ensurePinnedCommentsAreOnTop: false,
    excludeCommentsWithDifferentSubAddress: true,
    pageSize: 50
};

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
        await this._migrateFromDbV2IfNeeded();
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
            table.text("authorAddress").notNullable().references("address").inTable(TABLES.AUTHORS);
            table.json("author").notNullable();
            table.string("link").nullable();
            table.string("thumbnailUrl").nullable();
            table.text("parentCid").nullable().references("cid").inTable(TABLES.COMMENTS);
            table.text("postCid").notNullable().references("cid").inTable(TABLES.COMMENTS);
            table.text("previousCid").nullable().references("cid").inTable(TABLES.COMMENTS);
            table.uuid("challengeRequestId").notNullable().references("challengeRequestId").inTable(TABLES.CHALLENGES);

            table.text("subplebbitAddress").notNullable();
            table.text("content").nullable();
            table.timestamp("timestamp").notNullable().checkPositive();
            table.json("signature").notNullable().unique(); // Will contain {signature, public key, type}
            table.text("ipnsName").notNullable().unique();
            table.text("ipnsKeyName").notNullable().unique().references("ipnsKeyName").inTable(TABLES.SIGNERS);
            table.text("title").nullable();
            table.integer("depth").notNullable();
            table.increments("id"); // Used for sorts

            // CommentUpdate and CommentEdit props
            table.json("original").nullable();
            table.json("authorEdit").nullable();
            table.json("flair").nullable();
            table.timestamp("updatedAt").nullable().checkPositive();
            table.boolean("spoiler").defaultTo(false);
            table.boolean("pinned").defaultTo(false);
            table.boolean("locked").defaultTo(false);
            table.boolean("removed").defaultTo(false);
            table.text("moderatorReason").nullable();
            table.text("protocolVersion").notNullable();
        });
    }

    private async _createVotesTable(tableName: string) {
        await this._knex.schema.createTable(tableName, (table) => {
            table.text("commentCid").notNullable().references("cid").inTable(TABLES.COMMENTS);
            table.text("authorAddress").notNullable().references("address").inTable(TABLES.AUTHORS);
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

    private async _createAuthorsTable(tableName: string) {
        await this._knex.schema.createTable(tableName, (table) => {
            table.text("address").notNullable().primary().unique();
            table.timestamp("banExpiresAt").nullable();
            table.json("flair").nullable();
        });
    }

    private async _createChallengesTable(tableName: string) {
        await this._knex.schema.createTable(tableName, (table) => {
            table.uuid("challengeRequestId").notNullable().primary().unique();
            table.enum("type", Object.values(PUBSUB_MESSAGE_TYPES)).notNullable();
            table.text("userAgent");
            table.text("protocolVersion");
            table.json("acceptedChallengeTypes").nullable().defaultTo(null);
            table.json("challenges").nullable();
            table.uuid("challengeAnswerId").nullable();
            table.json("challengeAnswers").nullable();
            table.boolean("challengeSuccess").nullable();
            table.json("challengeErrors").nullable();
            table.text("reason").nullable();
        });
    }

    private async _createSignersTable(tableName: string) {
        await this._knex.schema.createTable(tableName, (table) => {
            table.text("ipnsKeyName").notNullable().unique().primary();
            table.text("privateKey").notNullable().unique();
            table.text("type").notNullable(); // RSA or any other type
        });
    }

    private async _createEditsTable(tableName: string) {
        await this._knex.schema.createTable(tableName, (table) => {
            table.text("commentCid").notNullable().references("cid").inTable(TABLES.COMMENTS);
            table.text("authorAddress").notNullable().references("address").inTable(TABLES.AUTHORS);
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

            table.primary(["commentCid", "id"]);
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
            this._createVotesTable,
            this._createAuthorsTable,
            this._createChallengesTable,
            this._createSignersTable,
            this._createEditsTable
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
        //@ts-ignore
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

    async insertAuthor(author: AuthorDbType, trx?: Transaction) {
        await this._baseTransaction(trx)(TABLES.AUTHORS).insert(author);
    }

    async updateAuthorInAuthorsTable(newAuthorProps: AuthorDbType, trx?: Transaction) {
        const onlyNewProps: Omit<AuthorDbType, "address"> = removeKeysWithUndefinedValues(lodash.omit(newAuthorProps, ["address"]));

        await this._baseTransaction(trx)(TABLES.AUTHORS).update(onlyNewProps).where("address", newAuthorProps.address);
    }

    async updateAuthorInCommentsTable(
        newAuthorProps: Pick<CommentType["author"], "address" | "banExpiresAt" | "flair" | "previousCommentCid" | "subplebbit">,
        trx?: Transaction
    ) {
        const onlyNewProps = removeKeysWithUndefinedValues(lodash.omit(newAuthorProps, ["address"]));
        // Iterate through all this author comments and update their comment.author
        const commentsWithAuthor: CommentType[] = await this.queryCommentsOfAuthor(newAuthorProps.address, trx);
        await Promise.all(
            commentsWithAuthor.map(async (commentProps: CommentType) => {
                const newCommentProps: Pick<CommentForDbType, "author"> = {
                    author: JSON.stringify({ ...commentProps.author, ...onlyNewProps })
                };
                await this._baseTransaction(trx)(TABLES.COMMENTS).update(newCommentProps).where("cid", commentProps.cid);
            })
        );
    }

    async queryAuthor(authorAddress: string, trx?: Transaction): Promise<AuthorType | undefined> {
        const authorProps = await this._baseTransaction(trx)(TABLES.AUTHORS).where({ address: authorAddress }).first();
        return authorProps ? new Author(authorProps).toJSON() : undefined;
    }

    async upsertVote(vote: VoteForDbType, trx?: Transaction) {
        await this._baseTransaction(trx)(TABLES.VOTES).insert(vote).onConflict(["commentCid", "authorAddress"]).merge();
    }

    async insertComment(comment: CommentForDbType, trx?: Transaction) {
        await this._baseTransaction(trx)(TABLES.COMMENTS).insert(comment);
    }

    async updateComment(
        comment: Partial<
            Pick<CommentForDbType, "authorEdit" | "flair" | "locked" | "moderatorReason" | "pinned" | "removed" | "spoiler" | "updatedAt">
        > &
            Pick<CommentForDbType, "cid">,
        trx?: Transaction
    ) {
        await this._baseTransaction(trx)(TABLES.COMMENTS).where({ cid: comment.cid }).update(comment);
    }

    async insertEdit(edit: CommentEditForDbType, trx?: Transaction) {
        await this._baseTransaction(trx)(TABLES.EDITS).insert(edit);
    }

    async queryEditsSorted(commentCid: string, editor?: "author" | "mod", trx?: Transaction): Promise<CommentEditType[]> {
        const authorAddress = (await this._baseTransaction(trx)(TABLES.COMMENTS).select("authorAddress").where("cid", commentCid).first())
            .authorAddress;
        if (!editor) return this._createEditsFromRows(await this._baseTransaction(trx)(TABLES.EDITS).orderBy("id", "desc"));
        else if (editor === "author")
            return this._createEditsFromRows(
                await this._baseTransaction(trx)(TABLES.EDITS).where("authorAddress", authorAddress).orderBy("id", "desc")
            );
        else if (editor === "mod")
            return this._createEditsFromRows(
                await this._baseTransaction(trx)(TABLES.EDITS).whereNot("authorAddress", authorAddress).orderBy("id", "desc")
            );
        else return [];
    }

    async editComment(edit: CommentEditForDbType, trx?: Transaction) {
        // Fields that need to be merged
        // flair
        const commentProps = await this.queryComment(edit.commentCid, trx);

        const isEditFromAuthor = commentProps.signature.publicKey === edit.signature.publicKey;
        if (isEditFromAuthor) {
            const modEdits = await this.queryEditsSorted(edit.commentCid, "mod", trx);
            const hasModEditedCommentFlairBefore = modEdits.some((modEdit) => Boolean(modEdit.flair));
            const flairIfNeeded = hasModEditedCommentFlairBefore || !edit.flair ? undefined : { flair: JSON.stringify(edit.flair) };

            const authorNewProps = removeKeysWithUndefinedValues({
                authorEdit: JSON.stringify(lodash.omit(edit, ["authorAddress", "challengeRequestId"])),
                ...flairIfNeeded
            });
            await this._baseTransaction(trx)(TABLES.COMMENTS).update(authorNewProps).where("cid", edit.commentCid);
        } else {
            const commentCidIndex = MOD_EDIT_FIELDS.findIndex((value) => value === "commentCid");
            let modNewProps = removeKeysWithUndefinedValues(lodash.pick(edit, MOD_EDIT_FIELDS.slice(commentCidIndex + 1)));
            modNewProps = lodash.omit(modNewProps, "commentAuthor");
            if (JSON.stringify(modNewProps) !== "{}")
                await this._baseTransaction(trx)(TABLES.COMMENTS).update(modNewProps).where("cid", edit.commentCid);
        }
    }

    async upsertChallenge(
        challenge:
            | Omit<ChallengeRequestMessageType, "encryptedPublication" | "signature">
            | Omit<DecryptedChallengeMessageType, "encryptedChallenges" | "signature">
            | Omit<DecryptedChallengeAnswerMessageType, "encryptedChallengeAnswers" | "signature">
            | Omit<ChallengeVerificationMessageType, "encryptedPublication" | "signature">,
        trx?: Transaction
    ) {
        const existingChallenge = await this._baseTransaction(trx)(TABLES.CHALLENGES)
            .where({ challengeRequestId: challenge.challengeRequestId })
            .first();
        assert(challenge instanceof Object);
        const dbObject = { ...existingChallenge, ...challenge };
        await this._baseTransaction(trx)(TABLES.CHALLENGES).insert(dbObject).onConflict("challengeRequestId").merge();
    }

    async getLastVoteOfAuthor(commentCid: string, authorAddress: string, trx?: Transaction): Promise<VoteType | undefined> {
        const voteObj = await this._baseTransaction(trx)(TABLES.VOTES)
            .where({
                commentCid: commentCid,
                authorAddress: authorAddress
            })
            .first();
        return (await this._createVotesFromRows(voteObj))[0];
    }

    private _baseCommentQuery(trx?: Transaction, options = defaultPageOption) {
        const upvoteQuery = this._baseTransaction(trx)(TABLES.VOTES)
            .count(`${TABLES.VOTES}.vote`)
            .where({
                [`${TABLES.COMMENTS}.cid`]: this._knex.raw(`${TABLES.VOTES}.commentCid`),
                [`${TABLES.VOTES}.vote`]: 1
            })
            .as("upvoteCount");
        const downvoteQuery = this._baseTransaction(trx)(TABLES.VOTES)
            .count(`${TABLES.VOTES}.vote`)
            .where({
                [`${TABLES.COMMENTS}.cid`]: this._knex.raw(`${TABLES.VOTES}.commentCid`),
                [`${TABLES.VOTES}.vote`]: -1
            })
            .as("downvoteCount");
        const replyCountQuery = this._baseTransaction(trx)
            .from(`${TABLES.COMMENTS} AS comments2`)
            .count("")
            .where({
                "comments2.parentCid": this._knex.raw(`${TABLES.COMMENTS}.cid`)
            })
            .as("replyCount");

        let query = this._baseTransaction(trx)(TABLES.COMMENTS)
            .select(`${TABLES.COMMENTS}.*`, upvoteQuery, downvoteQuery, replyCountQuery)
            .jsonExtract("authorEdit", "$.deleted", "deleted", true);

        if (options.excludeCommentsWithDifferentSubAddress) query = query.where({ subplebbitAddress: this._subplebbit.address });
        if (options.excludeRemovedComments) query = query.whereNot("removed", 1);
        if (options.excludeDeletedComments) query = query.andWhereRaw("`deleted` is not 1");

        return query;
    }

    private _parseJsonFields(obj: Object) {
        const newObj = { ...obj };
        const booleanFields = ["deleted", "spoiler", "pinned", "locked", "removed"];
        for (const field in newObj) {
            if (booleanFields.includes(field) && typeof newObj[field] === "number") newObj[field] = Boolean(newObj[field]);
            if (typeof newObj[field] === "string")
                try {
                    newObj[field] = typeof JSON.parse(newObj[field]) === "object" ? JSON.parse(newObj[field]) : newObj[field];
                } catch {}
            if (newObj[field]?.constructor?.name === "Object") newObj[field] = this._parseJsonFields(newObj[field]);
        }
        return <any>newObj;
    }

    private async _createCommentsFromRows(commentsRows: CommentType[] | CommentType): Promise<CommentType[] | PostType[]> {
        if (!commentsRows || (Array.isArray(commentsRows) && commentsRows?.length === 0)) return [];
        if (!Array.isArray(commentsRows)) commentsRows = [commentsRows];
        return Promise.all(
            commentsRows.map(async (props) => {
                const replacedProps: CommentType | PostType = this._parseJsonFields(replaceXWithY(props, null, undefined)); // Replace null with undefined to save storage (undefined is not included in JSON.stringify)

                assert(
                    typeof replacedProps.replyCount === "number" &&
                        typeof replacedProps.upvoteCount === "number" &&
                        typeof replacedProps.downvoteCount === "number"
                );
                return replacedProps;
            })
        );
    }

    private async _createEditsFromRows(edits: CommentEditType[] | CommentEditType): Promise<CommentEditType[]> {
        if (!edits || (Array.isArray(edits) && edits?.length === 0)) return [];
        if (!Array.isArray(edits)) edits = [edits];
        return Promise.all(
            edits.map(async (props) => {
                const replacedProps: CommentEditType = this._parseJsonFields(replaceXWithY(props, null, undefined)); // Replace null with undefined to save storage (undefined is not included in JSON.stringify)
                return replacedProps;
            })
        );
    }

    private async _createVotesFromRows(voteRows: VoteType[] | VoteType): Promise<VoteType[]> {
        if (!voteRows || (Array.isArray(voteRows) && voteRows.length === 0)) return [];
        if (!Array.isArray(voteRows)) voteRows = [voteRows];
        return Promise.all(
            voteRows.map((props) => {
                const replacedProps: VoteType = this._parseJsonFields(replaceXWithY(props, null, undefined));
                return replacedProps;
            })
        );
    }

    async queryCommentsSortedByTimestamp(parentCid: string | undefined | null, order = "desc", options, trx?: Transaction) {
        parentCid = parentCid || null;

        const commentObj = await this._baseCommentQuery(trx, options)
            .where({ parentCid: parentCid, subplebbitAddress: this._subplebbit.address })
            .orderBy("timestamp", order);
        return this._createCommentsFromRows(commentObj);
    }

    async queryCommentsBetweenTimestampRange(
        parentCid: string | undefined | null,
        timestamp1: number,
        timestamp2: number,
        options: PageOptions,
        trx?: Transaction
    ): Promise<CommentType[] | PostType[]> {
        parentCid = parentCid || null;

        if (timestamp1 === Number.NEGATIVE_INFINITY) timestamp1 = 0;
        const finalQuery = this._baseCommentQuery(trx, options)
            .where({ parentCid: parentCid })
            .whereBetween("timestamp", [timestamp1, timestamp2]);
        const rawCommentObjs = await finalQuery;

        assert(!rawCommentObjs.some((comment) => comment.timestamp < timestamp1 || comment.timestamp > timestamp2));

        return this._createCommentsFromRows(rawCommentObjs);
    }

    async queryTopCommentsBetweenTimestampRange(
        parentCid: string | undefined | null,
        timestamp1: number,
        timestamp2: number,
        options: PageOptions,
        trx?: Transaction
    ): Promise<CommentType[] | PostType[]> {
        if (timestamp1 === Number.NEGATIVE_INFINITY) timestamp1 = 0;
        parentCid = parentCid || null;
        const topScoreQuery = this._baseTransaction(trx)(TABLES.VOTES)
            .select(this._knex.raw(`COALESCE(SUM(${TABLES.VOTES}.vote), 0)`)) // We're using raw expressions because there's no native method in Knexjs to return 0 if SUM is null
            .where({
                [`${TABLES.COMMENTS}.cid`]: this._knex.raw(`${TABLES.VOTES}.commentCid`)
            })
            .as("topScore");
        const rawCommentsObjs = await this._baseCommentQuery(trx, options)
            .select(topScoreQuery)
            .groupBy(`${TABLES.COMMENTS}.cid`)
            .orderBy("topScore", "desc")
            .whereBetween(`${TABLES.COMMENTS}.timestamp`, [timestamp1, timestamp2])
            .where({ [`${TABLES.COMMENTS}.parentCid`]: parentCid });

        return this._createCommentsFromRows(rawCommentsObjs);
    }

    async queryCommentsUnderComment(
        parentCid: string | undefined | null,
        options: Partial<PageOptions>,
        trx?: Transaction
    ): Promise<CommentType[] | PostType[]> {
        const queryOptions = { ...defaultPageOption, ...options };
        parentCid = parentCid || null;

        const commentsObjs = await this._baseCommentQuery(trx, queryOptions).where({ parentCid: parentCid }).orderBy("timestamp", "desc");
        return this._createCommentsFromRows(commentsObjs);
    }

    async queryParentsOfComment(comment: CommentType, trx?: Transaction): Promise<CommentType[]> {
        const parents: CommentType[] = [];
        let curParentCid = comment.parentCid;
        while (curParentCid) {
            const parent = await this.queryComment(curParentCid, trx);
            if (parent) parents.push(parent);
            curParentCid = parent?.parentCid;
        }
        assert.equal(comment.depth, parents.length, "Depth should equal to parents length");
        return parents;
    }

    async queryComments(trx?: Transaction): Promise<CommentType[] | PostType[]> {
        return await this._createCommentsFromRows(await this._baseCommentQuery(trx).orderBy("id", "desc"));
    }

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

    async queryComment(cid: string, trx?: Transaction): Promise<CommentType | PostType | undefined> {
        assert(typeof cid === "string" && cid.length > 0, `Can't query a comment with null cid (${cid})`);
        const commentObj = await this._baseCommentQuery(trx).where("cid", cid).first();
        return (await this._createCommentsFromRows(commentObj))[0];
    }

    async queryLatestPost(trx?: Transaction): Promise<PostType | undefined> {
        const commentObj = await this._baseCommentQuery(trx).whereNotNull("title").orderBy("id", "desc").first();
        // @ts-ignore
        const post: PostType = (await this._createCommentsFromRows(commentObj))[0];
        if (!post) return undefined;

        return post;
    }

    async insertSigner(signer: Pick<SignerType, "type" | "privateKey" | "ipnsKeyName">, trx?: Transaction) {
        await this._baseTransaction(trx)(TABLES.SIGNERS).insert(signer);
    }

    async querySigner(
        ipnsKeyName: string,
        trx?: Transaction
    ): Promise<(Pick<SignerType, "type" | "privateKey"> & { ipnsKeyName: string }) | undefined> {
        return this._baseTransaction(trx)(TABLES.SIGNERS).where({ ipnsKeyName }).first();
    }

    async queryCommentsGroupByDepth(trx?: Knex.Transaction): Promise<CommentType[][]> {
        const maxDepth = (await this._baseTransaction(trx)(TABLES.COMMENTS).max("depth"))[0]["max(`depth`)"];
        if (typeof maxDepth !== "number") return [[]];

        const depths = new Array(maxDepth + 1).fill(null).map((value, i) => i);
        const comments: CommentType[][] = await Promise.all(
            depths.map(async (depth) => {
                const commentsWithDepth = await this._baseCommentQuery(trx).where({ depth: depth });
                return this._createCommentsFromRows(commentsWithDepth);
            })
        );
        return comments;
    }

    async queryCountOfPosts(subplebbitAddress: string, trx?: Knex.Transaction): Promise<number> {
        const obj = await this._baseTransaction(trx)(TABLES.COMMENTS).count().where({ depth: 0, subplebbitAddress }).first();
        if (!obj) return 0;
        return Number(obj["count(*)"]);
    }

    async queryCommentsOfAuthor(authorAddress: string, trx?: Knex.Transaction): Promise<CommentType[]> {
        return this._createCommentsFromRows(await this._baseCommentQuery(trx).where({ authorAddress }));
    }

    async querySubplebbitAuthorFields(authorAddress: string, trx?: Knex.Transaction): Promise<SubplebbitAuthor> {
        const authorComments = await this.queryCommentsOfAuthor(authorAddress);
        const authorPosts = authorComments.filter((comment) => comment.depth === 0);
        const authorReplies = authorComments.filter((comment) => <number>comment.depth > 0);

        const postScore: number = sumBy(authorPosts, (post) => post.upvoteCount) - sumBy(authorPosts, (post) => post.downvoteCount);

        const replyScore: number =
            sumBy(authorReplies, (reply) => reply.upvoteCount) - sumBy(authorReplies, (reply) => reply.downvoteCount);

        const lastCommentCid: string = (
            await this._baseTransaction(trx)(TABLES.COMMENTS).select("cid").where({ authorAddress }).orderBy("id", "desc").first()
        )["cid"];
        if (typeof lastCommentCid !== "string") throw Error("lastCommentCid should be always defined");
        return { postScore, replyScore, lastCommentCid };
    }

    async changeDbFilename(newDbFileName: string, newSubplebbit: DbHandler["_subplebbit"]) {
        const log = Logger("plebbit-js:db-handler:changeDbFilename");

        const oldPathString = (<any>this._dbConfig.connection).filename;
        assert.ok(oldPathString, "subplebbit._dbConfig either does not exist or DB connection is in memory");
        if (oldPathString === ":memory:") {
            log.trace(`No need to change file name of db since it's in memory`);
            return;
        }
        const newPath = path.format({ dir: path.dirname(oldPathString), base: newDbFileName });
        await fs.promises.mkdir(path.dirname(newPath), { recursive: true });
        this._currentTrxs = {};
        this._subplebbit = newSubplebbit;
        await fs.promises.cp(oldPathString, newPath);
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

    // Locking functionality. Will most likely move to another file later
    async lockSubCreation(subAddress = this._subplebbit.address) {
        if (subAddress === this._subplebbit.address && this.isDbInMemory()) return;

        const log = Logger("plebbit-js:lock:creation");
        const lockfilePath = path.join(this._subplebbit.plebbit.dataPath, "subplebbits", `${subAddress}.create.lock`);
        const subDbPath = path.join(this._subplebbit.plebbit.dataPath, "subplebbits", subAddress);
        if (!fs.existsSync(subDbPath)) await fs.promises.writeFile(subDbPath, ""); // Write a dummy file to lock. Will be replaced by actual db later
        try {
            await lockfile.lock(subDbPath, {
                lockfilePath,
                onCompromised: () => {}
            });
            log(`Locked the creation of subplebbit (${subAddress}) successfully`);
        } catch (e) {
            if (e.message === "Lock file is already being held") throwWithErrorCode("ERR_SUB_CREATION_LOCKED", `subAddress=${subAddress}`);
        }
    }

    async lockSubStart(subAddress = this._subplebbit.address) {
        if (subAddress === this._subplebbit.address && this.isDbInMemory()) return;

        const log = Logger("plebbit-js:lock:start");

        const lockfilePath = path.join(this._subplebbit.plebbit.dataPath, "subplebbits", `${subAddress}.start.lock`);
        const subDbPath = path.join(this._subplebbit.plebbit.dataPath, "subplebbits", subAddress);

        try {
            await lockfile.lock(subDbPath, {
                lockfilePath,
                onCompromised: () => {}
            });
            log(`Locked the start of subplebbit (${subAddress}) successfully`);
        } catch (e) {
            if (e.message === "Lock file is already being held") throwWithErrorCode("ERR_SUB_ALREADY_STARTED", `subAddress=${subAddress}`);
        }
    }

    async unlockSubCreation(subAddress = this._subplebbit.address) {
        if (subAddress === this._subplebbit.address && this.isDbInMemory()) return;

        const log = Logger("plebbit-js:lock:creation");

        const lockfilePath = path.join(this._subplebbit.plebbit.dataPath, "subplebbits", `${subAddress}.create.lock`);
        const subDbPath = path.join(this._subplebbit.plebbit.dataPath, "subplebbits", subAddress);
        await lockfile.unlock(subDbPath, { lockfilePath });

        log(`Unlocked creation of sub (${subAddress})`);
    }

    async unlockSubStart(subAddress = this._subplebbit.address) {
        if (subAddress === this._subplebbit.address && this.isDbInMemory()) return;

        const log = Logger("plebbit-js:lock:start");

        const lockfilePath = path.join(this._subplebbit.plebbit.dataPath, "subplebbits", `${subAddress}.start.lock`);
        const subDbPath = path.join(this._subplebbit.plebbit.dataPath, "subplebbits", subAddress);

        try {
            await lockfile.unlock(subDbPath, { lockfilePath });
        } catch (e) {
            if (e.message === "Lock is not acquired/owned by you") await fs.promises.rmdir(lockfilePath); // Forcefully delete the lock
        }
        log(`Unlocked start of sub (${subAddress})`);
    }

    async isSubCreationLocked(subAddress = this._subplebbit.address) {
        const lockfilePath = path.join(this._subplebbit.plebbit.dataPath, "subplebbits", `${subAddress}.create.lock`);
        const subDbPath = path.join(this._subplebbit.plebbit.dataPath, "subplebbits", subAddress);

        return lockfile.check(subDbPath, { lockfilePath });
    }

    async isSubStartLocked(subAddress = this._subplebbit.address) {
        const lockfilePath = path.join(this._subplebbit.plebbit.dataPath, "subplebbits", `${subAddress}.start.lock`);
        const subDbPath = path.join(this._subplebbit.plebbit.dataPath, "subplebbits", subAddress);
        return lockfile.check(subDbPath, { lockfilePath });
    }

    subDbExists(subAddress = this._subplebbit.address) {
        const dbPath = path.join(this._subplebbit.plebbit.dataPath, "subplebbits", subAddress);
        return fs.existsSync(dbPath);
    }

    // Will most likely move to another file specialized in DB migration

    private async _migrateFromDbV2IfNeeded() {
        const obsoleteCache: SubplebbitType | undefined = await this.keyvGet(this._subplebbit.address);
        const subCache: SubplebbitType | undefined = await this.keyvGet(CACHE_KEYS[CACHE_KEYS.INTERNAL_SUBPLEBBIT]);
        if (obsoleteCache && !subCache) {
            // We're migrating from DB version 2 to 4+
            const signerAddress = await getPlebbitAddressFromPublicKeyPem(obsoleteCache.encryption.publicKey);
            const signer = await this.querySigner(signerAddress); // Need to include signer explicitly since in db version 2 we didn't include signer in cache
            obsoleteCache.signer = new Signer({ ...signer, address: await getPlebbitAddressFromPrivateKeyPem(signer.privateKey) });
            // We changed the name of internal subplebbit cache, need to explicitly copy old cache to new key here
            await this.keyvSet(CACHE_KEYS[CACHE_KEYS.INTERNAL_SUBPLEBBIT], obsoleteCache);
        }
    }
}
