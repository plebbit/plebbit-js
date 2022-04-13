import {PUBSUB_MESSAGE_TYPES} from "./Challenge.js";
import Post from "./Post.js";
import Author from "./Author.js";
import Comment from "./Comment.js";
import {replaceXWithY, TIMEFRAMES_TO_SECONDS, timestamp} from "./Util.js";
import Vote from "./Vote.js";

import Debug from "debug";

const debug = Debug("plebbit-js:DbHandler");


const TABLES = Object.freeze({
    COMMENTS: "comments",
    VOTES: "votes",
    AUTHORS: "authors",
    CHALLENGES: "challenges"
});


class DbHandler {
    constructor(knex, subplebbit) {
        this.knex = knex;
        this.subplebbit = subplebbit;
    }

    async createTransaction() {
        return new Promise(async (resolve, reject) => {
            this.knex.transaction().then(resolve).catch(err => {
                debug(err);
                reject(err);
            })
        });
    }

    #baseTransaction(trx) {
        return trx ? trx : this.knex;
    }

    async #createCommentsTable() {
        await this.knex.schema.createTable(TABLES.COMMENTS, (table) => {
            table.text("commentCid").notNullable().primary().unique();
            table.text("authorAddress").notNullable().references("address").inTable(TABLES.AUTHORS);
            table.text("parentCid").nullable().references("commentCid").inTable(TABLES.COMMENTS);
            table.text("postCid").notNullable().references("commentCid").inTable(TABLES.COMMENTS);
            table.text("previousCid").nullable().references("commentCid").inTable(TABLES.COMMENTS);
            table.uuid("challengeRequestId").notNullable().references("challengeRequestId").inTable(TABLES.CHALLENGES);

            table.text("subplebbitAddress").notNullable();
            table.text("content").nullable();
            table.timestamp("timestamp").notNullable().checkPositive();
            table.text("signature").nullable(); // Will likely revise later
            table.text("ipnsName").notNullable().unique();
            table.text("commentIpnsKeyName").notNullable().unique();
            table.text("title").nullable();
            table.integer("depth").notNullable();
            // CommentUpdate props
            table.text("editedContent").nullable();
            table.increments("id");
            table.timestamp("updatedAt").nullable().checkPositive();
        });

    }


    async #createVotesTable() {
        await this.knex.schema.createTable(TABLES.VOTES, (table) => {
            table.text("commentCid").notNullable().references("commentCid").inTable(TABLES.COMMENTS);
            table.text("authorAddress").notNullable().references("address").inTable(TABLES.AUTHORS);
            table.uuid("challengeRequestId").notNullable().references("challengeRequestId").inTable(TABLES.CHALLENGES);

            table.timestamp("timestamp").checkPositive().notNullable();
            table.text("subplebbitAddress").notNullable();
            table.integer("vote").checkBetween([-1, 1]).notNullable();
            table.text("signature").nullable(); // Will likely revise later

            table.primary(["commentCid", "authorAddress"]); // An author can't have multiple votes on a comment
        });
    }

    async #createAuthorsTable() {
        await this.knex.schema.createTable(TABLES.AUTHORS, (table) => {
            table.text("address").notNullable().primary().unique();
            table.text("displayName").notNullable();
        });

    }

    async #createChallengesTable() {
        await this.knex.schema.createTable(TABLES.CHALLENGES, (table) => {
            table.uuid("challengeRequestId").notNullable().primary().unique();
            table.enum("type", Object.values(PUBSUB_MESSAGE_TYPES)).notNullable();
            table.json("acceptedChallengeTypes").nullable().defaultTo(null);
            table.json("challenges").nullable();
            table.uuid("challengeAnswerId").nullable();
            table.json("challengeAnswers").nullable();
            table.boolean("challengePassed").nullable();
            table.json("challengeErrors").nullable();
            table.text("reason").nullable();
        });
    }

    async createTablesIfNeeded() {
        const functions = [this.#createCommentsTable, this.#createVotesTable, this.#createAuthorsTable, this.#createChallengesTable];
        const tables = Object.values(TABLES);
        for (const table of tables) {
            const i = tables.indexOf(table);
            const tableExists = await this.knex.schema.hasTable(table);
            if (!tableExists)
                await functions[i].bind(this)();

        }
    }

    async #addAuthorToDbIfNeeded(author, trx = undefined) {
        return new Promise(async (resolve, reject) => {
            const authorFromDb = await this.#baseTransaction(trx)(TABLES.AUTHORS).where({"address": author.address}).first();
            if (!authorFromDb) // Author is new. Add to database
                this.#baseTransaction(trx)(TABLES.AUTHORS).insert(author.toJSON()).then(() => resolve(author.toJSON())).catch(err => {
                    console.error(err);
                    reject(err);
                });
            else
                resolve(authorFromDb);
        });
    }

    async upsertVote(vote, challengeRequestId, trx = undefined) {
        return new Promise(async (resolve, reject) => {
            await this.#addAuthorToDbIfNeeded(vote.author, trx);
            const dbObject = vote.toJSONForDb(challengeRequestId);
            this.#baseTransaction(trx)(TABLES.VOTES).insert(dbObject).onConflict(['commentCid', "authorAddress"]).merge().then(() => resolve(dbObject)).catch(err => {
                console.error(err);
                reject(err);
            });
        });
    }


    async upsertComment(postOrComment, challengeRequestId, trx = undefined) {
        return new Promise(async (resolve, reject) => {
            await this.#addAuthorToDbIfNeeded(postOrComment.author, trx);
            if (!challengeRequestId)
                challengeRequestId = (await this.#baseTransaction(trx)(TABLES.COMMENTS).where({"commentCid": postOrComment.commentCid}).first()).challengeRequestId;
            const originalComment = await this.queryComment(postOrComment.commentCid, trx);
            const dbObject = originalComment ? {...originalComment.toJSONForDb(challengeRequestId), ...postOrComment.toJSONForDb(challengeRequestId)}
                : postOrComment.toJSONForDb(challengeRequestId);
            this.#baseTransaction(trx)(TABLES.COMMENTS).insert(dbObject).onConflict(['commentCid']).merge().then(() => resolve(dbObject)).catch(err => {
                console.error(err);
                reject(err);
            });

        });
    }

    async upsertChallenge(challenge, trx = undefined) {
        return new Promise(async (resolve, reject) => {
            const existingChallenge = await this.#baseTransaction(trx)(TABLES.CHALLENGES).where({"challengeRequestId": challenge.challengeRequestId}).first();
            const dbObject = {...existingChallenge, ...challenge.toJSONForDb()};
            this.#baseTransaction(trx)(TABLES.CHALLENGES).insert(dbObject).onConflict('challengeRequestId').merge().then(() => resolve(dbObject)).catch(err => {
                console.error(err);
                reject(err);
            });
        });
    }

    async getLastVoteOfAuthor(commentCid, authorAddress, trx = undefined) {
        return new Promise(async (resolve, reject) => {
            this.#baseTransaction(trx)(TABLES.VOTES).where({
                "commentCid": commentCid,
                "authorAddress": authorAddress
            }).first().then(async (res) => resolve((await this.#createVotesFromRows.bind(this)(res, trx))[0])).catch(err => {
                console.error(err);
                reject(err);
            })
        });
    }

    #baseCommentQuery(trx) {
        const upvoteQuery = this.#baseTransaction(trx)(TABLES.VOTES).count(`${TABLES.VOTES}.vote`).where({
            [`${TABLES.COMMENTS}.commentCid`]: this.knex.raw(`${TABLES.VOTES}.commentCid`),
            [`${TABLES.VOTES}.vote`]: 1
        }).as("upvoteCount");
        const downvoteQuery = this.#baseTransaction(trx)(TABLES.VOTES).count(`${TABLES.VOTES}.vote`).where({
            [`${TABLES.COMMENTS}.commentCid`]: this.knex.raw(`${TABLES.VOTES}.commentCid`),
            [`${TABLES.VOTES}.vote`]: -1
        }).as("downvoteCount");
        const replyCountQuery = this.#baseTransaction(trx).from(`${TABLES.COMMENTS} AS comments2`).count("")
            .where({"comments2.parentCid": this.knex.raw(`${TABLES.COMMENTS}.commentCid`)})
            .as("replyCount");

        return this.#baseTransaction(trx)(TABLES.COMMENTS)
            .select(`${TABLES.COMMENTS}.*`, upvoteQuery, downvoteQuery, replyCountQuery);
    }

    async #createCommentsFromRows(commentsRows, trx) {
        return new Promise(async (resolve, reject) => {
            if (!commentsRows)
                resolve([undefined]);
            else {
                if (!Array.isArray(commentsRows))
                    commentsRows = [commentsRows];
                commentsRows = commentsRows.map(props => replaceXWithY(props, null, undefined)); // Replace null with undefined to save storage (undefined is not included in JSON.stringify)
                const authors = (await this.#baseTransaction(trx)(TABLES.AUTHORS).whereIn("address", commentsRows.map(post => post.authorAddress))).map(authorProps => new Author(authorProps));
                const comments = commentsRows.map(commentProps => {
                    const props = {
                        ...commentProps,
                        "author": authors.filter(author => author.address === commentProps.authorAddress)[0],
                    };
                    if (props["title"])
                        return new Post(props, this.subplebbit);
                    else
                        return new Comment(props, this.subplebbit);
                });
                resolve(comments);
            }

        });

    }

    async #createVotesFromRows(voteRows, trx) {
        return new Promise(async (resolve, reject) => {
            if (!voteRows)
                resolve([undefined]);
            else {
                if (!Array.isArray(voteRows))
                    voteRows = [voteRows];
                voteRows = voteRows.map(props => replaceXWithY(props, null, undefined)); // Replace null with undefined to save storage (undefined is not included in JSON.stringify)

                const authors = (await this.#baseTransaction(trx)(TABLES.AUTHORS).whereIn("address", voteRows.map(vote => vote.authorAddress))).map(authorProps => new Author(authorProps));
                const votes = voteRows.map(voteProps => {
                    const props = {
                        ...voteProps,
                        "author": authors.filter(author => author.address === voteProps.authorAddress)[0],
                    };
                    return new Vote(props, this.subplebbit);
                });
                resolve(votes);
            }
        });
    }

    async queryCommentsSortedByTimestamp(parentCid, trx = undefined) {
        return new Promise(async (resolve, reject) => {
            this.#baseCommentQuery(trx).where({"parentCid": parentCid}).orderBy("timestamp", "desc")
                .then(async res => {
                    resolve(await this.#createCommentsFromRows.bind(this)(res, trx));
                }).catch(err => {
                console.error(err);
                reject(err);
            })
        });
    }

    async queryCommentsBetweenTimestampRange(parentCid, timestamp1, timestamp2, trx = undefined) {
        return new Promise(async (resolve, reject) => {
            if (timestamp1 === Number.NEGATIVE_INFINITY)
                timestamp1 = 0;
            this.#baseCommentQuery(trx).where({"parentCid": parentCid}).whereBetween("timestamp", [timestamp1, timestamp2]).then(res => this.#createCommentsFromRows.bind(this)(res, trx)).then(resolve).catch(err => {
                console.error(err);
                reject(err);
            });
        });
    }

    async queryTopCommentsBetweenTimestampRange(parentCid, timestamp1, timestamp2, trx = undefined) {
        return new Promise(async (resolve, reject) => {
            if (timestamp1 === Number.NEGATIVE_INFINITY)
                timestamp1 = 0;
            const topScoreQuery = this.#baseTransaction(trx)(TABLES.VOTES).sum(`${TABLES.VOTES}.vote`).where({
                [`${TABLES.COMMENTS}.commentCid`]: this.knex.raw(`${TABLES.VOTES}.commentCid`)
            }).as("topScore")
            const query = this.#baseCommentQuery(trx)
                .select(topScoreQuery)
                .groupBy(`${TABLES.COMMENTS}.commentCid`)
                .orderBy("topScore", "desc")
                .whereBetween(`${TABLES.COMMENTS}.timestamp`, [timestamp1, timestamp2])
                .where({[`${TABLES.COMMENTS}.parentCid`]: parentCid});

            query.then(res => resolve(this.#createCommentsFromRows.bind(this)(res, trx))).catch(err => {
                console.error(err);
                reject(err);
            })
        })
    }

    async queryCommentsUnderComment(parentCid, trx) {
        return new Promise(async (resolve, reject) => {
            this.#baseCommentQuery(trx).where({"parentCid": parentCid}).orderBy("timestamp", "desc").then(res => resolve(this.#createCommentsFromRows.bind(this)(res, trx))).catch(reject);
        });
    }

    async queryComments(trx) {
        return new Promise(async (resolve, reject) => {
            this.#baseCommentQuery(trx).orderBy("id", "desc").then(res => resolve(this.#createCommentsFromRows.bind(this)(res, trx))).catch(reject);
        });
    }

    async #querySubplebbitActiveUserCount(timeframe, trx) {
        return new Promise(async (resolve, reject) => {
            let from = timestamp() - TIMEFRAMES_TO_SECONDS[timeframe];
            if (from === Number.NEGATIVE_INFINITY)
                from = 0;
            const to = timestamp();
            // TODO this could be done in a single query
            const commentsAuthors = await this.#baseTransaction(trx)(TABLES.COMMENTS).distinct("authorAddress").whereBetween("timestamp", [from, to]);
            const voteAuthors = await this.#baseTransaction(trx)(TABLES.VOTES).distinct("authorAddress").whereBetween("timestamp", [from, to]);
            let activeUserAccounts = [...commentsAuthors, ...voteAuthors].map(author => author.authorAddress);
            activeUserAccounts = [...new Set(activeUserAccounts)];
            resolve(activeUserAccounts.length);
        });
    }


    async #querySubplebbitPostCount(timeframe, trx) {
        return new Promise(async (resolve, reject) => {
            let from = timestamp() - TIMEFRAMES_TO_SECONDS[timeframe];
            if (from === Number.NEGATIVE_INFINITY)
                from = 0;
            const to = timestamp();
            this.#baseTransaction(trx)(TABLES.COMMENTS).count("commentCid").whereBetween("timestamp", [from, to]).whereNotNull("title").then(postCount => resolve(postCount["0"]["count(`commentCid`)"])).catch(reject);
        })
    }

    async querySubplebbitMetrics(trx) {
        return new Promise(async (resolve, reject) => {
            const metrics = {};
            for (const metricType of ["ActiveUserCount", "PostCount"])
                for (const timeframe of Object.keys(TIMEFRAMES_TO_SECONDS)) {
                    const propertyName = `${timeframe.toLowerCase()}${metricType}`;
                    if (metricType === "ActiveUserCount")
                        metrics[[propertyName]] = await this.#querySubplebbitActiveUserCount(timeframe, trx);
                    else if (metricType === "PostCount")
                        metrics[[propertyName]] = await this.#querySubplebbitPostCount(timeframe, trx);
                }
            resolve(metrics);
        });
    }

    async queryComment(commentCid, trx) {
        return new Promise(async (resolve, reject) => {
            this.#baseCommentQuery(trx).where({"commentCid": commentCid}).first().then(async res => {
                resolve((await this.#createCommentsFromRows.bind(this)(res, trx))[0]);
            }).catch(reject);
        });
    }

    async queryLatestPost(trx) {
        return new Promise(async (resolve, reject) => {
            this.#baseCommentQuery(trx).whereNotNull("title").orderBy("id", "desc").first().then(async res => {
                resolve((await this.#createCommentsFromRows.bind(this)(res, trx))[0]);
            }).catch(reject);
        });
    }
}

export default DbHandler;