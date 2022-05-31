import { PUBSUB_MESSAGE_TYPES } from "../../challenge";
import Post from "../../post";
import Author from "../../author";
import { Comment } from "../../comment";
import { getDebugLevels, removeKeysWithUndefinedValues, replaceXWithY, TIMEFRAMES_TO_SECONDS, timestamp } from "../../util";
import Vote from "../../vote";
import knex, { Knex } from "knex";
import { Subplebbit } from "../../subplebbit";
import path from "path";
import assert from "assert";
import fs from "fs";
import Keyv from "keyv";
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
    _dbConfig: any;
    knex: any;
    subplebbit: Subplebbit;

    constructor(dbConfig, subplebbit) {
        this._dbConfig = dbConfig;
        this.knex = knex(dbConfig);
        this.subplebbit = subplebbit;
    }

    async createTransaction(): Promise<Transaction> {
        return new Promise(async (resolve, reject) => {
            this.knex
                .transaction()
                .then(resolve)
                .catch((err) => {
                    debug(err);
                    reject(err);
                });
        });
    }

    baseTransaction(trx) {
        return trx ? trx : this.knex;
    }

    async createCommentsTable() {
        await this.knex.schema.createTable(TABLES.COMMENTS, (table) => {
            table.text("cid").notNullable().primary().unique();
            table.text("authorAddress").notNullable().references("address").inTable(TABLES.AUTHORS);
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
            table.text("displayName").nullable();
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

    async addAuthorToDbIfNeeded(author, trx = undefined) {
        return new Promise(async (resolve, reject) => {
            const authorFromDb = await this.baseTransaction(trx)(TABLES.AUTHORS).where({ address: author.address }).first();
            if (!authorFromDb)
                // Author is new. Add to database
                this.baseTransaction(trx)(TABLES.AUTHORS)
                    .insert(author.toJSON())
                    .then(() => resolve(author.toJSON()))
                    .catch((err) => {
                        console.error(err);
                        reject(err);
                    });
            else resolve(authorFromDb);
        });
    }

    async upsertVote(vote, challengeRequestId, trx = undefined) {
        return new Promise(async (resolve, reject) => {
            await this.addAuthorToDbIfNeeded(vote.author, trx);
            const dbObject = vote.toJSONForDb(challengeRequestId);
            this.baseTransaction(trx)(TABLES.VOTES)
                .insert(dbObject)
                .onConflict(["commentCid", "authorAddress"])
                .merge()
                .then(() => resolve(dbObject))
                .catch((err) => {
                    console.error(err);
                    reject(err);
                });
        });
    }

    async upsertComment(postOrComment: any, challengeRequestId, trx = undefined) {
        return new Promise(async (resolve, reject) => {
            if (postOrComment.author)
                // Skip adding author (For CommentEdit)
                await this.addAuthorToDbIfNeeded(postOrComment.author, trx);
            if (!challengeRequestId)
                challengeRequestId = (
                    await this.baseTransaction(trx)(TABLES.COMMENTS)
                        .where({
                            cid: postOrComment.cid || postOrComment.commentCid
                        })
                        .first()
                ).challengeRequestId;
            const originalComment: any = await this.queryComment(postOrComment.cid || postOrComment.commentCid, trx);
            // @ts-ignore
            const dbObject = originalComment
                ? {
                      ...removeKeysWithUndefinedValues(originalComment.toJSONForDb(challengeRequestId)),
                      ...removeKeysWithUndefinedValues(postOrComment.toJSONForDb(challengeRequestId))
                  }
                : postOrComment.toJSONForDb(challengeRequestId);
            this.baseTransaction(trx)(TABLES.COMMENTS)
                .insert(dbObject)
                .onConflict(["cid"])
                .merge()
                .then(() => resolve(dbObject))
                .catch((err) => {
                    console.error(err);
                    reject(err);
                });
        });
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

    async getLastVoteOfAuthor(commentCid, authorAddress, trx = undefined) {
        return new Promise(async (resolve, reject) => {
            this.baseTransaction(trx)(TABLES.VOTES)
                .where({
                    commentCid: commentCid,
                    authorAddress: authorAddress
                })
                .first()
                .then(async (res) => resolve((await this.createVotesFromRows.bind(this)(res, trx))[0]))
                .catch((err) => {
                    console.error(err);
                    reject(err);
                });
        });
    }

    baseCommentQuery(trx) {
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

    async createCommentsFromRows(commentsRows, trx) {
        return new Promise(async (resolve, reject) => {
            if (!commentsRows) resolve([undefined]);
            else {
                if (!Array.isArray(commentsRows)) commentsRows = [commentsRows];
                commentsRows = commentsRows.map((props) => replaceXWithY(props, null, undefined)); // Replace null with undefined to save storage (undefined is not included in JSON.stringify)
                const authors = (
                    await this.baseTransaction(trx)(TABLES.AUTHORS).whereIn(
                        "address",
                        commentsRows.map((post) => post.authorAddress)
                    )
                ).map((authorProps) => new Author(authorProps));
                const comments = commentsRows.map((commentProps) => {
                    const props = {
                        ...commentProps,
                        author: authors.filter((author) => author.address === commentProps.authorAddress)[0]
                    };
                    if (props["title"])
                        // @ts-ignore
                        return new Post(props, this.subplebbit);
                    else return new Comment(props, this.subplebbit);
                });
                resolve(comments);
            }
        });
    }

    async createVotesFromRows(voteRows, trx) {
        return new Promise(async (resolve, reject) => {
            if (!voteRows) resolve([undefined]);
            else {
                if (!Array.isArray(voteRows)) voteRows = [voteRows];
                voteRows = voteRows.map((props) => replaceXWithY(props, null, undefined)); // Replace null with undefined to save storage (undefined is not included in JSON.stringify)

                const authors = (
                    await this.baseTransaction(trx)(TABLES.AUTHORS).whereIn(
                        "address",
                        voteRows.map((vote) => vote.authorAddress)
                    )
                ).map((authorProps) => new Author(authorProps));
                const votes = voteRows.map((voteProps) => {
                    const props = {
                        ...voteProps,
                        author: authors.filter((author) => author.address === voteProps.authorAddress)[0]
                    };
                    return new Vote(props, this.subplebbit);
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

    async queryCommentsUnderComment(parentCid, trx): Promise<Comment[] | Post[]> {
        return new Promise(async (resolve, reject) => {
            this.baseCommentQuery(trx)
                .where({ parentCid: parentCid })
                .orderBy("timestamp", "desc")
                .then((res) => resolve(this.createCommentsFromRows.bind(this)(res, trx)))
                .catch(reject);
        });
    }

    async queryComments(trx): Promise<Comment[]> {
        return new Promise(async (resolve, reject) => {
            this.baseCommentQuery(trx)
                .orderBy("id", "desc")
                .then((res) => resolve(this.createCommentsFromRows.bind(this)(res, trx)))
                .catch(reject);
        });
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

    async queryComment(cid, trx): Promise<Comment | Post> {
        return new Promise(async (resolve, reject) => {
            this.baseCommentQuery(trx)
                .where({ cid: cid })
                .first()
                .then(async (res) => {
                    resolve((await this.createCommentsFromRows.bind(this)(res, trx))[0]);
                })
                .catch(reject);
        });
    }

    async queryLatestPost(trx): Promise<Post> {
        return new Promise(async (resolve, reject) => {
            this.baseCommentQuery(trx)
                .whereNotNull("title")
                .orderBy("id", "desc")
                .first()
                .then(async (res) => {
                    resolve((await this.createCommentsFromRows.bind(this)(res, trx))[0]);
                })
                .catch(reject);
        });
    }

    async insertSigner(signer, trx) {
        return new Promise(async (resolve, reject) => {
            this.baseTransaction(trx)(TABLES.SIGNERS)
                .insert(signer)
                .then(resolve)
                .catch((err) => {
                    debug(err);
                    reject(err);
                });
        });
    }

    async querySubplebbitSigner(trx) {
        return new Promise(async (resolve, reject) => {
            this.baseTransaction(trx)(TABLES.SIGNERS).where({ usage: SIGNER_USAGES.SUBPLEBBIT }).first().then(resolve).catch(reject);
        });
    }

    async querySigner(ipnsKeyName, trx) {
        try {
            return await this.baseTransaction(trx)(TABLES.SIGNERS).where({ ipnsKeyName: ipnsKeyName }).first();
        } catch (e) {
            debug(`Failed to query signer due to error = ${e}`);
        }
    }
}

export const subplebbitInitDbIfNeeded = async (subplebbit) => {
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
            useNullAsDefault: true
        };
    } else debugs.DEBUG(`User provided a DB config of ${JSON.stringify(subplebbit._dbConfig)}`);

    const dir = path.dirname(subplebbit._dbConfig.connection.filename);
    await fs.promises.mkdir(dir, { recursive: true });
    subplebbit.dbHandler = new DbHandler(subplebbit._dbConfig, subplebbit);
    await subplebbit.dbHandler.createTablesIfNeeded();
    await subplebbit.initSignerIfNeeded();
    subplebbit._keyv = new Keyv(`sqlite://${subplebbit._dbConfig.connection.filename}`); // TODO make this work with DBs other than sqlite
};
