import { PUBSUB_MESSAGE_TYPES } from "../../challenge";
import Post from "../../post";
import Author from "../../author";
import { Comment, CommentEdit } from "../../comment";
import { getDebugLevels, removeKeysWithUndefinedValues, replaceXWithY, TIMEFRAMES_TO_SECONDS, timestamp } from "../../util";
import Vote from "../../vote";
import knex, { Knex } from "knex";
import { Subplebbit } from "../../subplebbit";
import path from "path";
import assert from "assert";
import fs from "fs";
import Keyv from "keyv";
import { Signer } from "../../signer";
import Transaction = Knex.Transaction;

const debugs = getDebugLevels("db-handler");

export const SIGNER_USAGES = { SUBPLEBBIT: "subplebbit", COMMENT: "comment" };

const TABLES = Object.freeze({
    COMMENTS: "comments",
    VOTES: "votes",
    AUTHORS: "authors",
    CHALLENGES: "challenges",
    SIGNERS: "signers" // To store private keys of subplebbit and comments' IPNS
});

export class DbHandler {
    _dbConfig: Knex.Config;
    knex: Knex;
    subplebbit: Subplebbit;

    constructor(dbConfig, subplebbit) {
        this._dbConfig = dbConfig;
        this.knex = knex(dbConfig);
        this.subplebbit = subplebbit;
    }

    async createTransaction(): Promise<Transaction> {
        return await this.knex.transaction();
    }

    baseTransaction(trx?: Transaction): Transaction | Knex {
        return trx ? trx : this.knex;
    }

    async createCommentsTable() {
        await this.knex.schema.createTable(TABLES.COMMENTS, (table) => {
            table.text("cid").notNullable().primary().unique();
            table.text("authorAddress").notNullable().references("address").inTable(TABLES.AUTHORS);
            table.json("author").notNullable();
            table.text("parentCid").nullable().references("cid").inTable(TABLES.COMMENTS);
            table.text("postCid").notNullable().references("cid").inTable(TABLES.COMMENTS);
            table.text("previousCid").nullable().references("cid").inTable(TABLES.COMMENTS);
            table.uuid("challengeRequestId").notNullable().references("challengeRequestId").inTable(TABLES.CHALLENGES);

            table.text("subplebbitAddress").notNullable();
            table.text("content").nullable();
            table.text("originalContent").nullable();
            table.timestamp("timestamp").notNullable().checkPositive();
            table.text("signature").notNullable().unique(); // Will contain {signature, public key, type}
            table.text("ipnsName").notNullable().unique();
            table.text("ipnsKeyName").notNullable().unique().references("ipnsKeyName").inTable(TABLES.SIGNERS);
            table.text("title").nullable();
            table.integer("depth").notNullable();
            table.increments("id");

            // CommentUpdate and CommentEdit props
            table.timestamp("updatedAt").nullable().checkPositive();
            table.text("editSignature").nullable();
            table.timestamp("editTimestamp").nullable().checkPositive();
            table.text("editReason").nullable();
            table.boolean("deleted").nullable();
            table.boolean("spoiler").nullable();
            table.boolean("pinned").nullable();
            table.boolean("locked").nullable();
            table.boolean("removed").nullable();
            table.text("moderatorReason").nullable();
        });
    }

    async createVotesTable() {
        await this.knex.schema.createTable(TABLES.VOTES, (table) => {
            table.text("commentCid").notNullable().references("cid").inTable(TABLES.COMMENTS);
            table.text("authorAddress").notNullable().references("address").inTable(TABLES.AUTHORS);
            table.json("author").notNullable();
            table.uuid("challengeRequestId").notNullable().references("challengeRequestId").inTable(TABLES.CHALLENGES);

            table.timestamp("timestamp").checkPositive().notNullable();
            table.text("subplebbitAddress").notNullable();
            table.integer("vote").checkBetween([-1, 1]).notNullable();
            table.text("signature").notNullable().unique();

            table.primary(["commentCid", "authorAddress"]); // An author can't have multiple votes on a comment
        });
    }

    async createAuthorsTable() {
        await this.knex.schema.createTable(TABLES.AUTHORS, (table) => {
            table.text("address").notNullable().primary().unique();
        });
    }

    async createChallengesTable() {
        await this.knex.schema.createTable(TABLES.CHALLENGES, (table) => {
            table.uuid("challengeRequestId").notNullable().primary().unique();
            table.enum("type", Object.values(PUBSUB_MESSAGE_TYPES)).notNullable();
            table.json("acceptedChallengeTypes").nullable().defaultTo(null);
            table.json("challenges").nullable();
            table.uuid("challengeAnswerId").nullable();
            table.json("challengeAnswers").nullable();
            table.boolean("challengeSuccess").nullable();
            table.json("challengeErrors").nullable();
            table.text("reason").nullable();
        });
    }

    async createSignersTable() {
        await this.knex.schema.createTable(TABLES.SIGNERS, (table) => {
            table.text("ipnsKeyName").notNullable().unique().primary();
            table.text("privateKey").notNullable().unique();
            table.text("publicKey").notNullable().unique();
            table.text("address").nullable();
            table.text("type").notNullable(); // RSA or any other type
            table.enum("usage", Object.values(SIGNER_USAGES)).notNullable();
            table.binary("ipfsKey").notNullable().unique();
        });
    }

    async createTablesIfNeeded() {
        const functions = [
            this.createCommentsTable,
            this.createVotesTable,
            this.createAuthorsTable,
            this.createChallengesTable,
            this.createSignersTable
        ];
        const tables = Object.values(TABLES);
        for (const table of tables) {
            const i = tables.indexOf(table);
            const tableExists = await this.knex.schema.hasTable(table);
            if (!tableExists) await functions[i].bind(this)();
        }
    }

    async addAuthorToDbIfNeeded(author: Author, trx: Transaction | undefined) {
        const authorFromDb = await this.baseTransaction(trx)(TABLES.AUTHORS).where({ address: author.address }).first();
        if (!authorFromDb) {
            // Author is new. Add to database
            await this.baseTransaction(trx)(TABLES.AUTHORS).insert(author.toJSONForDb());
            return author.toJSONForDb();
        } else return authorFromDb;
    }

    async upsertVote(vote, challengeRequestId, trx = undefined) {
        await this.addAuthorToDbIfNeeded(vote.author, trx);
        const dbObject = vote.toJSONForDb(challengeRequestId);
        await this.baseTransaction(trx)(TABLES.VOTES).insert(dbObject).onConflict(["commentCid", "authorAddress"]).merge();
        return dbObject;
    }

    async upsertComment(postOrComment: Post | Comment | CommentEdit, challengeRequestId?: string, trx?: Transaction) {
        if (postOrComment.author)
            // Skip adding author (For CommentEdit)
            await this.addAuthorToDbIfNeeded(postOrComment.author, trx);

        const cid = postOrComment instanceof CommentEdit ? postOrComment.commentCid : postOrComment.cid;
        if (!challengeRequestId)
            challengeRequestId = (
                await this.baseTransaction(trx)(TABLES.COMMENTS)
                    .where({
                        cid: cid
                    })
                    .first()
            ).challengeRequestId;
        assert(cid, "Comment need to have a cid before upserting");
        const originalComment = await this.queryComment(cid, trx);
        const dbObject = originalComment
            ? {
                  ...removeKeysWithUndefinedValues(originalComment.toJSONForDb(challengeRequestId)),
                  ...removeKeysWithUndefinedValues(postOrComment.toJSONForDb(challengeRequestId))
              }
            : postOrComment.toJSONForDb(challengeRequestId);
        await this.baseTransaction(trx)(TABLES.COMMENTS).insert(dbObject).onConflict(["cid"]).merge();
    }

    async upsertChallenge(challenge, trx = undefined) {
        return new Promise(async (resolve, reject) => {
            const existingChallenge = await this.baseTransaction(trx)(TABLES.CHALLENGES)
                .where({ challengeRequestId: challenge.challengeRequestId })
                .first();
            const dbObject = {
                ...existingChallenge,
                ...challenge.toJSONForDb()
            };
            this.baseTransaction(trx)(TABLES.CHALLENGES)
                .insert(dbObject)
                .onConflict("challengeRequestId")
                .merge()
                .then(() => resolve(dbObject))
                .catch((err) => {
                    console.error(err);
                    reject(err);
                });
        });
    }

    async getLastVoteOfAuthor(commentCid, authorAddress, trx = undefined): Promise<Vote> {
        const voteObj = await this.baseTransaction(trx)(TABLES.VOTES)
            .where({
                commentCid: commentCid,
                authorAddress: authorAddress
            })
            .first();
        return (await this.createVotesFromRows(voteObj, trx))[0];
    }

    baseCommentQuery(trx?: Transaction) {
        const upvoteQuery = this.baseTransaction(trx)(TABLES.VOTES)
            .count(`${TABLES.VOTES}.vote`)
            .where({
                [`${TABLES.COMMENTS}.cid`]: this.knex.raw(`${TABLES.VOTES}.commentCid`),
                [`${TABLES.VOTES}.vote`]: 1
            })
            .as("upvoteCount");
        const downvoteQuery = this.baseTransaction(trx)(TABLES.VOTES)
            .count(`${TABLES.VOTES}.vote`)
            .where({
                [`${TABLES.COMMENTS}.cid`]: this.knex.raw(`${TABLES.VOTES}.commentCid`),
                [`${TABLES.VOTES}.vote`]: -1
            })
            .as("downvoteCount");
        const replyCountQuery = this.baseTransaction(trx)
            .from(`${TABLES.COMMENTS} AS comments2`)
            .count("")
            .where({
                "comments2.parentCid": this.knex.raw(`${TABLES.COMMENTS}.cid`)
            })
            .as("replyCount");

        return this.baseTransaction(trx)(TABLES.COMMENTS).select(`${TABLES.COMMENTS}.*`, upvoteQuery, downvoteQuery, replyCountQuery);
    }

    async createCommentsFromRows(commentsRows?: Comment[] | Post[]): Promise<Comment[] | Post[] | undefined[]> {
        if (!commentsRows) return [undefined];
        if (!Array.isArray(commentsRows)) commentsRows = [commentsRows];
        return Promise.all(
            commentsRows.map((props) => {
                const replacedProps = replaceXWithY(props, null, undefined); // Replace null with undefined to save storage (undefined is not included in JSON.stringify)
                return this.subplebbit.plebbit.createComment(replacedProps);
            })
        );
    }

    async createVotesFromRows(voteRows, trx) {
        return new Promise(async (resolve, reject) => {
            if (!voteRows) resolve([undefined]);
            else {
                if (!Array.isArray(voteRows)) voteRows = [voteRows];
                voteRows = voteRows.map((props) => replaceXWithY(props, null, undefined)); // Replace null with undefined to save storage (undefined is not included in JSON.stringify)
                const votes = voteRows.map((voteProps) => {
                    return new Vote(voteProps, this.subplebbit);
                });
                resolve(votes);
            }
        });
    }

    async queryCommentsSortedByTimestamp(parentCid, order = "desc", trx = undefined) {
        return new Promise(async (resolve, reject) => {
            this.baseCommentQuery(trx)
                .where({ parentCid: parentCid })
                .orderBy("timestamp", order)
                .then(async (res) => {
                    resolve(await this.createCommentsFromRows.bind(this)(res, trx));
                })
                .catch((err) => {
                    console.error(err);
                    reject(err);
                });
        });
    }

    async queryCommentsBetweenTimestampRange(parentCid, timestamp1, timestamp2, trx = undefined) {
        return new Promise(async (resolve, reject) => {
            if (timestamp1 === Number.NEGATIVE_INFINITY) timestamp1 = 0;
            this.baseCommentQuery(trx)
                .where({ parentCid: parentCid })
                .whereBetween("timestamp", [timestamp1, timestamp2])
                .then((res) => this.createCommentsFromRows.bind(this)(res, trx))
                .then(resolve)
                .catch((err) => {
                    console.error(err);
                    reject(err);
                });
        });
    }

    async queryTopCommentsBetweenTimestampRange(parentCid, timestamp1, timestamp2, trx = undefined) {
        return new Promise(async (resolve, reject) => {
            if (timestamp1 === Number.NEGATIVE_INFINITY) timestamp1 = 0;
            const topScoreQuery = this.baseTransaction(trx)(TABLES.VOTES)
                .select(this.knex.raw(`COALESCE(SUM(${TABLES.VOTES}.vote), 0)`)) // We're using raw expressions because there's no native method in Knexjs to return 0 if SUM is null
                .where({
                    [`${TABLES.COMMENTS}.cid`]: this.knex.raw(`${TABLES.VOTES}.commentCid`)
                })
                .as("topScore");
            const query = this.baseCommentQuery(trx)
                .select(topScoreQuery)
                .groupBy(`${TABLES.COMMENTS}.cid`)
                .orderBy("topScore", "desc")
                .whereBetween(`${TABLES.COMMENTS}.timestamp`, [timestamp1, timestamp2])
                .where({ [`${TABLES.COMMENTS}.parentCid`]: parentCid });

            query
                .then((res) => resolve(this.createCommentsFromRows.bind(this)(res, trx)))
                .catch((err) => {
                    console.error(err);
                    reject(err);
                });
        });
    }

    async queryCommentsUnderComment(parentCid: string, trx?: Transaction): Promise<Comment[] | Post[] | undefined[]> {
        const commentsObjs = await this.baseCommentQuery(trx).where({ parentCid: parentCid }).orderBy("timestamp", "desc");
        return await this.createCommentsFromRows(commentsObjs);
    }

    async queryComments(trx?: Transaction): Promise<Comment[] | Post[] | undefined[]> {
        return this.createCommentsFromRows(await this.baseCommentQuery(trx).orderBy("id", "desc"));
    }

    async querySubplebbitActiveUserCount(timeframe, trx) {
        return new Promise(async (resolve, reject) => {
            let from = timestamp() - TIMEFRAMES_TO_SECONDS[timeframe];
            if (from === Number.NEGATIVE_INFINITY) from = 0;
            const to = timestamp();
            // TODO this could be done in a single query
            const commentsAuthors = await this.baseTransaction(trx)(TABLES.COMMENTS)
                .distinct("authorAddress")
                .whereBetween("timestamp", [from, to]);
            const voteAuthors = await this.baseTransaction(trx)(TABLES.VOTES)
                .distinct("authorAddress")
                .whereBetween("timestamp", [from, to]);
            let activeUserAccounts = [...commentsAuthors, ...voteAuthors].map((author) => author.authorAddress);
            // @ts-ignore
            activeUserAccounts = [...new Set(activeUserAccounts)];
            resolve(activeUserAccounts.length);
        });
    }

    async querySubplebbitPostCount(timeframe, trx) {
        return new Promise(async (resolve, reject) => {
            let from = timestamp() - TIMEFRAMES_TO_SECONDS[timeframe];
            if (from === Number.NEGATIVE_INFINITY) from = 0;
            const to = timestamp();
            this.baseTransaction(trx)(TABLES.COMMENTS)
                .count("cid")
                .whereBetween("timestamp", [from, to])
                .whereNotNull("title")
                .then((postCount) => resolve(postCount["0"]["count(`cid`)"]))
                .catch(reject);
        });
    }

    async querySubplebbitMetrics(trx) {
        return new Promise(async (resolve, reject) => {
            const metrics = {};
            for (const metricType of ["ActiveUserCount", "PostCount"])
                for (const timeframe of Object.keys(TIMEFRAMES_TO_SECONDS)) {
                    const propertyName = `${timeframe.toLowerCase()}${metricType}`;
                    if (metricType === "ActiveUserCount") metrics[propertyName] = await this.querySubplebbitActiveUserCount(timeframe, trx);
                    else if (metricType === "PostCount") metrics[propertyName] = await this.querySubplebbitPostCount(timeframe, trx);
                }
            resolve(metrics);
        });
    }

    async queryComment(cid: string, trx?: Transaction): Promise<Comment | Post | undefined> {
        const commentObj = await this.baseCommentQuery(trx).where("cid", cid).first();
        return (await this.createCommentsFromRows(commentObj))[0];
    }

    async queryLatestPost(trx?: Transaction): Promise<Post | undefined> {
        const commentObj = await this.baseCommentQuery(trx).whereNotNull("title").orderBy("id", "desc").first();
        const post = (await this.createCommentsFromRows(commentObj))[0];
        if (!post) return undefined;
        assert(post instanceof Post);
        return post;
    }

    async insertSigner(signer, trx?: Transaction) {
        return this.baseTransaction(trx)(TABLES.SIGNERS).insert(signer);
    }

    async querySubplebbitSigner(trx): Promise<Signer> {
        return this.baseTransaction(trx)(TABLES.SIGNERS).where({ usage: SIGNER_USAGES.SUBPLEBBIT }).first();
    }

    async querySigner(ipnsKeyName, trx): Promise<Signer | undefined> {
        return this.baseTransaction(trx)(TABLES.SIGNERS).where({ ipnsKeyName: ipnsKeyName }).first();
    }

    async changeDbFilename(newDbFileName: string) {
        const oldPathString = this.subplebbit?._dbConfig?.connection?.filename;
        assert.ok(oldPathString, "subplebbit._dbConfig either does not exist or DB connection is in memory");
        if (oldPathString === ":memory:") {
            debugs.DEBUG(`No need to change file name of db since it's in memory`);
            return;
        }
        const newPath = path.format({ dir: path.dirname(oldPathString), base: newDbFileName });
        await fs.promises.mkdir(path.dirname(newPath), { recursive: true });
        await fs.promises.rename(oldPathString, newPath);
        this.subplebbit._dbConfig = {
            client: "better-sqlite3", // or 'better-sqlite3'
            connection: {
                filename: newPath
            },
            useNullAsDefault: true,
            acquireConnectionTimeout: 120000
        };
        this.subplebbit.dbHandler = new DbHandler(this.subplebbit._dbConfig, this.subplebbit);
        this.subplebbit._keyv = new Keyv(`sqlite://${this.subplebbit._dbConfig.connection.filename}`);
        debugs.INFO(`Changed db path from (${oldPathString}) to (${newPath})`);
    }
}

export const subplebbitInitDbIfNeeded = async (subplebbit: Subplebbit) => {
    if (subplebbit.dbHandler) return;
    if (!subplebbit._dbConfig) {
        assert(subplebbit.address, "Need subplebbit address to initialize a DB connection");
        const dbPath = path.join(subplebbit.plebbit.dataPath, subplebbit.address);
        debugs.INFO(`User has not provided a DB config. Will initialize DB in ${dbPath}`);
        subplebbit._dbConfig = {
            client: "better-sqlite3", // or 'better-sqlite3'
            connection: {
                filename: dbPath
            },
            useNullAsDefault: true,
            acquireConnectionTimeout: 120000
        };
    } else debugs.DEBUG(`User provided a DB config of ${JSON.stringify(subplebbit._dbConfig)}`);

    const dir = path.dirname(subplebbit._dbConfig.connection.filename);
    await fs.promises.mkdir(dir, { recursive: true });
    subplebbit.dbHandler = new DbHandler(subplebbit._dbConfig, subplebbit);
    await subplebbit.dbHandler.createTablesIfNeeded();
    await subplebbit.initSignerIfNeeded();
    subplebbit._keyv = new Keyv(`sqlite://${subplebbit._dbConfig.connection.filename}`); // TODO make this work with DBs other than sqlite
};
