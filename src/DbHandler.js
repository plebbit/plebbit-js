import {Challenge, CHALLENGE_STAGES, CHALLENGE_TYPES} from "./Challenge.js";
import Post from "./Post.js";
import Author from "./Author.js";
import Comment from "./Comment.js";
import {TIMEFRAMES_TO_SECONDS} from "./Util.js";

export const TABLES = Object.freeze({
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

    async #createCommentsTable() {
        await this.knex.schema.createTable(TABLES.COMMENTS, (table) => {
            table.text("commentCid").notNullable().primary().unique();
            table.text("authorAddress").notNullable().references("address").inTable(TABLES.AUTHORS);
            table.text("parentCommentCid").nullable().references("commentCid").inTable(TABLES.COMMENTS);
            table.text("postCid").notNullable().references("commentCid").inTable(TABLES.COMMENTS);
            table.text("previousCommentCid").nullable().references("commentCid").inTable(TABLES.COMMENTS);
            table.uuid("challengeRequestId").notNullable().references("requestId").inTable(TABLES.CHALLENGES);

            table.text("subplebbitAddress").notNullable();
            table.text("content").notNullable();
            table.timestamp("timestamp").notNullable();
            table.text("signature").nullable(); // Will likely revise later
            table.text("commentIpnsName").notNullable().unique();
            table.text("commentIpnsKeyName").notNullable().unique();
            table.text("title").nullable();
        });

    }


    async #createVotesTable() {
        await this.knex.schema.createTable(TABLES.VOTES, (table) => {
            table.text("commentCid").notNullable().references("commentCid").inTable(TABLES.COMMENTS);
            table.text("authorAddress").notNullable().references("address").inTable(TABLES.AUTHORS);
            table.uuid("challengeRequestId").notNullable().references("requestId").inTable(TABLES.CHALLENGES);

            table.timestamp("timestamp").notNullable();
            table.text("subplebbitAddress").notNullable();
            table.enum("vote", [-1, 0, 1]).notNullable();
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
            table.uuid("requestId").notNullable().primary().unique();

            table.enum("stage", Object.values(CHALLENGE_STAGES)).notNullable();
            table.text("challenge").nullable();
            table.enum("type", Object.values(CHALLENGE_TYPES)).nullable(); // Challenge type

            table.text("answer").nullable();
            table.boolean("answerIsVerified").nullable();
            table.text("answerVerificationReason").nullable();
            table.uuid("answerId").nullable().unique();
            table.json("acceptedChallengeTypes").nullable();
            // TODO store the IP of challenge initiator
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

    async #addAuthorToDbIfNeeded(author) {
        return new Promise(async (resolve, reject) => {
            const authorFromDb = await this.knex(TABLES.AUTHORS).where({"address": author.address}).first();
            if (!authorFromDb) // Author is new. Add to database
                this.knex(TABLES.AUTHORS).insert(author.toJSON()).then(() => resolve(author.toJSON())).catch(err => {
                    console.error(err);
                    reject(err);
                });
            else
                resolve(authorFromDb);
        });
    }

    async upsertVote(vote) {
        return new Promise(async (resolve, reject) => {
            await this.#addAuthorToDbIfNeeded(vote.author);
            const dbObject = vote.toJSONForDb();
            this.knex(TABLES.VOTES).insert(vote.toJSONForDb()).onConflict(['commentCid', "authorAddress"]).merge().then(() => resolve(dbObject)).catch(err => {
                console.error(err);
                reject(err);
            });
        });
    }


    async insertComment(postOrComment) {
        return new Promise(async (resolve, reject) => {
            await this.#addAuthorToDbIfNeeded(postOrComment.author);
            const dbObject = postOrComment.toJSONForDb();
            this.knex(TABLES.COMMENTS).insert(dbObject).then(() => resolve(dbObject)).catch(err => {
                console.error(err);
                reject(err);
            });

        });
    }

    async upsertChallenge(challenge) {
        return new Promise(async (resolve, reject) => {
            const dbObject = challenge.toJSONForDb();
            this.knex(TABLES.CHALLENGES).insert(challenge.toJSONForDb()).onConflict('requestId').merge().then(() => resolve(dbObject)).catch(err => {
                console.error(err);
                reject(err);
            });
        });
    }

    async getLastVoteOfAuthor(commentCid, authorAddress) {
        return new Promise(async (resolve, reject) => {
            this.knex(TABLES.VOTES).where({
                "commentCid": commentCid,
                "authorAddress": authorAddress
            }).first().then(resolve).catch(err => {
                console.error(err);
                reject(err);
            })
        });
    }

    async #createCommentsFromRows(commentsRows) {
        return new Promise(async (resolve, reject) => {
            const authors = (await this.knex(TABLES.AUTHORS).whereIn("address", commentsRows.map(post => post.authorAddress))).map(authorProps => new Author(authorProps));
            const challenges = (await this.knex(TABLES.CHALLENGES).whereIn("requestId", commentsRows.map(post => post.challengeRequestId))).map(challengeProps => new Challenge(challengeProps));
            const posts = commentsRows.map(postProps => {
                const props = {
                    ...postProps,
                    "author": authors.filter(author => author.address === postProps.authorAddress)[0],
                    "challenge": challenges.filter(challenge => challenge.requestId === postProps.challengeRequestId)[0]
                };
                if (props["title"])
                    return new Post(props, this.subplebbit);
                else
                    return new Comment(props, this.subplebbit);
            });
            resolve(posts);
        });

    }

    async queryPostsSortedByTimestamp(limit) {
        return new Promise(async (resolve, reject) => {
            this.knex(TABLES.COMMENTS).whereNotNull("title").orderBy("timestamp", "desc")
                .then(async res => {
                    resolve(await this.#createCommentsFromRows.bind(this)(res));
                }).catch(err => {
                console.error(err);
                reject(err);
            })
        });
    }

    queryAllPosts() {
        return new Promise(async (resolve, reject) => {
            this.knex(TABLES.COMMENTS).whereNotNull("title").then(this.#createCommentsFromRows.bind(this)).then(resolve).catch(reject);
        });
    }

    async queryPostsBetweenTimestampRange(timestamp1, timestamp2) {
        return new Promise(async (resolve, reject) => {
            if (timestamp1 === Number.NEGATIVE_INFINITY)
                timestamp1 = 0;
            this.knex(TABLES.COMMENTS).whereNotNull("title").whereBetween("timestamp", [timestamp1, timestamp2]).then(this.#createCommentsFromRows.bind(this)).then(resolve).catch(err => {
                console.error(err);
                reject(err);
            });
        });
    }

    async queryCommentsUnderComment(parentCommentCid) {
        return new Promise(async (resolve, reject) => {
            this.knex(TABLES.COMMENTS).where({"parentCommentCid": parentCommentCid}).orderBy("timestamp", "desc").then(this.#createCommentsFromRows.bind(this)).then(resolve).catch(reject);
        });
    }

    async #querySubplebbitActiveUserCount(subplebbitAddress, timeframe) {
        return new Promise(async (resolve, reject) => {
            let from = (Date.now() / 1000) - TIMEFRAMES_TO_SECONDS[timeframe];
            if (from === Number.NEGATIVE_INFINITY)
                from = 0;
            const to = (Date.now() / 1000);
            const commentsAuthors = await this.knex(TABLES.COMMENTS).distinct("authorAddress").whereBetween("timestamp", [from, to]);
            const voteAuthors = await this.knex(TABLES.VOTES).distinct("authorAddress").whereBetween("timestamp", [from, to]);
            let activeUserAccounts = [...commentsAuthors, ...voteAuthors].map(author => author.authorAddress);
            activeUserAccounts = [...new Set(activeUserAccounts)];
            resolve(activeUserAccounts.length);
        });
    }


    async #querySubplebbitPostCount(subplebbitAddress, timeframe) {
        return new Promise(async (resolve, reject) => {
            let from = (Date.now() / 1000) - TIMEFRAMES_TO_SECONDS[timeframe];
            if (from === Number.NEGATIVE_INFINITY)
                from = 0;
            const to = (Date.now() / 1000);
            this.knex(TABLES.COMMENTS).count("commentCid").whereBetween("timestamp", [from, to]).then(postCount => resolve(postCount["0"]["count(`commentCid`)"])).catch(reject);
        })
    }

    async querySubplebbitMetrics(subplebbitAddress) {
        return new Promise(async (resolve, reject) => {
            const metrics = {};
            for (const metricType of ["ActiveUserCount", "PostCount"])
                for (const timeframe of Object.keys(TIMEFRAMES_TO_SECONDS)) {
                    const propertyName = `${timeframe.toLowerCase()}${metricType}`;
                    if (metricType === "ActiveUserCount")
                        metrics[[propertyName]] = await this.#querySubplebbitActiveUserCount(subplebbitAddress, timeframe);
                    else if (metricType === "PostCount")
                        metrics[[propertyName]] = await this.#querySubplebbitPostCount(subplebbitAddress, timeframe);
                }
            resolve(metrics);


        });
    }
}

export default DbHandler;