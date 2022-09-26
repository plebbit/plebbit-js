import { PUBSUB_MESSAGE_TYPES } from "../../challenge";
import Author from "../../author";
import { removeKeys, removeKeysWithUndefinedValues, replaceXWithY, TIMEFRAMES_TO_SECONDS, timestamp } from "../../util";
import knex, { Knex } from "knex";
import { Subplebbit } from "../../subplebbit";
import path from "path";
import assert from "assert";
import fs from "fs";
import Keyv from "keyv";
import { Signer } from "../../signer";
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
    SubplebbitMetrics,
    VoteForDbType,
    VoteType
} from "../../types";
import Logger from "@plebbit/plebbit-logger";
import { getDefaultSubplebbitDbConfig } from "./util";
import env from "../../version";
import { Plebbit } from "../../plebbit";

const TABLES = Object.freeze({
    COMMENTS: "comments",
    VOTES: "votes",
    AUTHORS: "authors",
    CHALLENGES: "challenges",
    SIGNERS: "signers", // To store private keys of subplebbit and comments' IPNS,
    EDITS: "edits"
});

export class DbHandler {
    private _knex: Knex;
    private _subplebbit: Pick<Subplebbit, "address" | "database"> & {
        plebbit: Pick<Plebbit, "dataPath" | "createComment">;
    };
    private _currentTrxs: Record<string, Transaction>; // Prefix to Transaction. Prefix represents all trx under a pubsub message or challenge
    private _dbConfig: any;
    private _userDbConfig?: Knex.Config;
    private _keyv: Keyv; // Don't change any here to Keyv since it will crash for browsers
    private _createdTables: boolean;

    constructor(subplebbit: DbHandler["_subplebbit"]) {
        this._userDbConfig = subplebbit.database;
        this._subplebbit = subplebbit;
        this._currentTrxs = {};
        this._createdTables = false;
    }

    async initDbIfNeeded() {
        const log = Logger("plebbit-js:db-handler:initDbIfNeeded");
        assert(
            typeof this._subplebbit.address === "string" && this._subplebbit.address.length > 0,
            `DbHandler needs to be an instantiated with a Subplebbit that has a valid address, (${this._subplebbit.address}) was provided`
        );
        this._dbConfig = this._dbConfig || this._userDbConfig;
        if (!this._dbConfig) {
            this._dbConfig = await getDefaultSubplebbitDbConfig(this._subplebbit);
            log(`User did provide a database config. Defaulting to ${JSON.stringify(this._dbConfig)}`);
        }
        if (!this._knex) this._knex = knex(this._dbConfig);

        if (!this._createdTables) await this.createTablesIfNeeded();

        // TODO make this work with DBs other than sqlite
        if (!this._keyv) this._keyv = new Keyv(`sqlite://${this._dbConfig?.connection?.filename}`);
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
            table.boolean("deleted").nullable();
            table.boolean("spoiler").nullable();
            table.boolean("pinned").nullable();
            table.boolean("locked").nullable();
            table.boolean("removed").nullable();
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
            table.text("publicKey").notNullable().unique();
            table.text("address").nullable();
            table.text("type").notNullable(); // RSA or any other type
            table.enum("usage", Object.values(["comment", "subplebbit"])).notNullable();
            table.binary("ipfsKey").notNullable().unique();
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

    private async _copyTable(srcTable: string, dstTable: string) {
        const log = Logger("plebbit-js:db-handler:createTablesIfNeeded:copyTable");

        const srcRecords = await this._knex(srcTable).select("*");
        log(`Attempting to copy ${srcRecords.length} ${srcTable}`);
        if (srcRecords.length > 0) await this._knex(dstTable).insert(srcRecords);
        log(`copied table ${srcTable} to table ${dstTable}`);
    }

    private async _upsertAuthor(author: AuthorDbType, trx?: Transaction, upsertOnlyWhenNew = true) {
        assert(author instanceof Object);
        assert(JSON.stringify(author) !== "{}");
        let existingDbObject: AuthorDbType | undefined = author.address
            ? await this._baseTransaction(trx)(TABLES.AUTHORS).where({ address: author.address }).first()
            : undefined;
        if (existingDbObject && upsertOnlyWhenNew) return;
        if (existingDbObject) existingDbObject = replaceXWithY(existingDbObject, null, undefined);
        const newDbObject: AuthorType = author instanceof Author ? author.toJSONForDb() : author;
        const mergedDbObject = { ...existingDbObject, ...newDbObject };
        await this._baseTransaction(trx)(TABLES.AUTHORS).insert(mergedDbObject).onConflict(["address"]).merge();
    }

    async updateAuthor(newAuthorProps: AuthorDbType, updateCommentsAuthor = true, trx?: Transaction) {
        const onlyNewProps: Omit<AuthorDbType, "address"> = removeKeysWithUndefinedValues(removeKeys(newAuthorProps, ["address"]));

        await this._baseTransaction(trx)(TABLES.AUTHORS).update(onlyNewProps).where("address", newAuthorProps.address);
        if (updateCommentsAuthor) {
            const commentsWithAuthor: CommentType[] = await this._createCommentsFromRows(
                await this._baseCommentQuery(trx).where("authorAddress", newAuthorProps.address)
            );
            await Promise.all(
                commentsWithAuthor.map(async (commentProps: CommentType) => {
                    const comment = await this._subplebbit.plebbit.createComment(commentProps);
                    const newOriginal = comment.original?.author
                        ? comment.original
                        : { ...comment.original, author: comment.author.toJSON() };
                    const newCommentProps = { author: { ...comment.author.toJSON(), ...onlyNewProps }, original: newOriginal };
                    await this._baseTransaction(trx)(TABLES.COMMENTS).update(newCommentProps).where("cid", comment.cid);
                })
            );
        }
    }

    async queryAuthor(authorAddress: string, trx?: Transaction): Promise<Author | undefined> {
        const authorProps = await this._baseTransaction(trx)(TABLES.AUTHORS).where({ address: authorAddress }).first();
        if (authorProps) return new Author(authorProps);
    }

    async upsertVote(vote: VoteForDbType, author: AuthorDbType, trx?: Transaction) {
        await this._upsertAuthor(author, trx, true);
        await this._baseTransaction(trx)(TABLES.VOTES).insert(vote).onConflict(["commentCid", "authorAddress"]).merge();
    }

    async upsertComment(comment: CommentForDbType, author: AuthorDbType, trx?: Transaction) {
        assert(comment.cid, "Comment need to have a cid before upserting");
        if (author)
            // Skip adding author (For CommentEdit)
            await this._upsertAuthor(author, trx, true);

        const challengeRequestId: string | undefined =
            comment.challengeRequestId ||
            (
                await this._baseTransaction(trx)(TABLES.COMMENTS)
                    .where({
                        cid: comment.cid
                    })
                    .first()
            ).challengeRequestId;

        assert(challengeRequestId, "Need to have challengeRequestId before upserting");

        if (await this.queryComment(comment.cid))
            await this._baseTransaction(trx)(TABLES.COMMENTS).where({ cid: comment.cid }).update(comment);
        else await this._baseTransaction(trx)(TABLES.COMMENTS).insert(comment);
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
        assert(edit.commentCid);
        const commentProps = await this.queryComment(edit.commentCid);
        assert(commentProps);
        const commentToBeEdited = await this._subplebbit.plebbit.createComment(commentProps);
        assert(commentToBeEdited);

        const isEditFromAuthor = commentToBeEdited.signature.publicKey === edit.signature.publicKey;
        let newProps: Object;
        if (isEditFromAuthor) {
            const modEdits = await this.queryEditsSorted(edit.commentCid, "mod", trx);
            const hasModEditedCommentFlairBefore = modEdits.some((modEdit) => Boolean(modEdit.flair));
            const flairIfNeeded = hasModEditedCommentFlairBefore || !edit.flair ? undefined : { flair: JSON.stringify(edit.flair) };

            newProps = removeKeysWithUndefinedValues({
                authorEdit: JSON.stringify(edit),
                original: JSON.stringify(commentToBeEdited.original || commentToBeEdited.toJSONSkeleton()),
                ...flairIfNeeded
            });
        } else {
            newProps = {
                ...edit,
                original: JSON.stringify(commentToBeEdited.original || commentToBeEdited.toJSONSkeleton())
            };
        }

        await this._baseTransaction(trx)(TABLES.COMMENTS).update(newProps).where("cid", edit.commentCid);
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

    private _baseCommentQuery(trx?: Transaction) {
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

        return this._baseTransaction(trx)(TABLES.COMMENTS).select(`${TABLES.COMMENTS}.*`, upvoteQuery, downvoteQuery, replyCountQuery);
    }

    private _parseJsonFields(obj: Object) {
        const jsonregex = /"((?:[^"\\\/\b\f\n\r\t]|\\u\d{4})*)"/gm;
        const newObj = { ...obj };
        for (const field in newObj) {
            if (typeof newObj[field] === "string" && jsonregex.exec(newObj[field])) newObj[field] = JSON.parse(newObj[field]);
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

    async queryCommentsSortedByTimestamp(parentCid: string | undefined | null, order = "desc", trx?: Transaction) {
        parentCid = parentCid || null;

        const commentObj = await this._baseCommentQuery(trx).where({ parentCid: parentCid }).orderBy("timestamp", order);
        return this._createCommentsFromRows(commentObj);
    }

    async queryCommentsBetweenTimestampRange(
        parentCid: string | undefined | null,
        timestamp1: number,
        timestamp2: number,
        trx?: Transaction
    ): Promise<CommentType[] | PostType[]> {
        parentCid = parentCid || null;

        if (timestamp1 === Number.NEGATIVE_INFINITY) timestamp1 = 0;
        const rawCommentObjs = await this._baseCommentQuery(trx)
            .where({ parentCid: parentCid })
            .whereBetween("timestamp", [timestamp1, timestamp2]);
        return this._createCommentsFromRows(rawCommentObjs);
    }

    async queryTopCommentsBetweenTimestampRange(
        parentCid: string | undefined | null,
        timestamp1: number,
        timestamp2: number,
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
        const rawCommentsObjs = await this._baseCommentQuery(trx)
            .select(topScoreQuery)
            .groupBy(`${TABLES.COMMENTS}.cid`)
            .orderBy("topScore", "desc")
            .whereBetween(`${TABLES.COMMENTS}.timestamp`, [timestamp1, timestamp2])
            .where({ [`${TABLES.COMMENTS}.parentCid`]: parentCid });

        return this._createCommentsFromRows(rawCommentsObjs);
    }

    async queryCommentsUnderComment(parentCid: string | undefined | null, trx?: Transaction): Promise<CommentType[] | PostType[]> {
        parentCid = parentCid || null;

        const commentsObjs = await this._baseCommentQuery(trx).where({ parentCid: parentCid }).orderBy("timestamp", "desc");
        return await this._createCommentsFromRows(commentsObjs);
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

    async insertSigner(signer: SignerType, trx?: Transaction) {
        await this._baseTransaction(trx)(TABLES.SIGNERS).insert(signer);
    }

    async querySubplebbitSigner(trx?: Transaction): Promise<Signer> {
        return this._baseTransaction(trx)(TABLES.SIGNERS).where({ usage: "subplebbit" }).first();
    }

    async querySigner(ipnsKeyName: string, trx?: Transaction): Promise<Signer | undefined> {
        return this._baseTransaction(trx)(TABLES.SIGNERS).where({ ipnsKeyName: ipnsKeyName }).first();
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

    async queryCountOfPosts(trx?: Knex.Transaction): Promise<number> {
        const obj = await this._baseTransaction(trx)(TABLES.COMMENTS).count().where({ depth: 0 }).first();
        if (!obj) return 0;
        return Number(obj["count(*)"]);
    }

    async changeDbFilename(newDbFileName: string, newSubplebbit: DbHandler["_subplebbit"]) {
        const log = Logger("plebbit-js:db-handler:changeDbFilename");

        const oldPathString = this._dbConfig?.connection?.filename;
        assert.ok(oldPathString, "subplebbit._dbConfig either does not exist or DB connection is in memory");
        if (oldPathString === ":memory:") {
            log.trace(`No need to change file name of db since it's in memory`);
            return;
        }
        const newPath = path.format({ dir: path.dirname(oldPathString), base: newDbFileName });
        await fs.promises.mkdir(path.dirname(newPath), { recursive: true });
        //@ts-ignore
        this._knex = this._keyv = undefined;
        this._currentTrxs = {};
        this._subplebbit = newSubplebbit;
        await fs.promises.rename(oldPathString, newPath);
        this._dbConfig = {
            ...this._dbConfig,
            connection: {
                ...this._dbConfig.connection,
                filename: newPath
            }
        };
        await this.initDbIfNeeded();
        log(`Changed db path from (${oldPathString}) to (${newPath})`);
    }
}
