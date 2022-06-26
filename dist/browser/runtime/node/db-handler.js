"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.subplebbitInitDbIfNeeded = exports.DbHandler = exports.SIGNER_USAGES = void 0;
const challenge_1 = require("../../challenge");
const post_1 = __importDefault(require("../../post"));
const comment_1 = require("../../comment");
const util_1 = require("../../util");
const vote_1 = __importDefault(require("../../vote"));
const knex_1 = __importDefault(require("knex"));
const path_1 = __importDefault(require("path"));
const assert_1 = __importDefault(require("assert"));
const fs_1 = __importDefault(require("fs"));
const keyv_1 = __importDefault(require("keyv"));
const debugs = (0, util_1.getDebugLevels)("db-handler");
exports.SIGNER_USAGES = { SUBPLEBBIT: "subplebbit", COMMENT: "comment" };
const TABLES = Object.freeze({
    COMMENTS: "comments",
    VOTES: "votes",
    AUTHORS: "authors",
    CHALLENGES: "challenges",
    SIGNERS: "signers" // To store private keys of subplebbit and comments' IPNS
});
class DbHandler {
    constructor(dbConfig, subplebbit) {
        this._dbConfig = dbConfig;
        this.knex = (0, knex_1.default)(dbConfig);
        this.subplebbit = subplebbit;
    }
    createTransaction() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.knex.transaction();
        });
    }
    baseTransaction(trx) {
        return trx ? trx : this.knex;
    }
    createCommentsTable() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.knex.schema.createTable(TABLES.COMMENTS, (table) => {
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
        });
    }
    createVotesTable() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.knex.schema.createTable(TABLES.VOTES, (table) => {
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
        });
    }
    createAuthorsTable() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.knex.schema.createTable(TABLES.AUTHORS, (table) => {
                table.text("address").notNullable().primary().unique();
            });
        });
    }
    createChallengesTable() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.knex.schema.createTable(TABLES.CHALLENGES, (table) => {
                table.uuid("challengeRequestId").notNullable().primary().unique();
                table.enum("type", Object.values(challenge_1.PUBSUB_MESSAGE_TYPES)).notNullable();
                table.json("acceptedChallengeTypes").nullable().defaultTo(null);
                table.json("challenges").nullable();
                table.uuid("challengeAnswerId").nullable();
                table.json("challengeAnswers").nullable();
                table.boolean("challengeSuccess").nullable();
                table.json("challengeErrors").nullable();
                table.text("reason").nullable();
            });
        });
    }
    createSignersTable() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.knex.schema.createTable(TABLES.SIGNERS, (table) => {
                table.text("ipnsKeyName").notNullable().unique().primary();
                table.text("privateKey").notNullable().unique();
                table.text("publicKey").notNullable().unique();
                table.text("address").nullable();
                table.text("type").notNullable(); // RSA or any other type
                table.enum("usage", Object.values(exports.SIGNER_USAGES)).notNullable();
                table.binary("ipfsKey").notNullable().unique();
            });
        });
    }
    createTablesIfNeeded() {
        return __awaiter(this, void 0, void 0, function* () {
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
                const tableExists = yield this.knex.schema.hasTable(table);
                if (!tableExists)
                    yield functions[i].bind(this)();
            }
        });
    }
    addAuthorToDbIfNeeded(author, trx) {
        return __awaiter(this, void 0, void 0, function* () {
            const authorFromDb = yield this.baseTransaction(trx)(TABLES.AUTHORS).where({ address: author.address }).first();
            if (!authorFromDb) {
                // Author is new. Add to database
                yield this.baseTransaction(trx)(TABLES.AUTHORS).insert(author.toJSONForDb());
                return author.toJSONForDb();
            }
            else
                return authorFromDb;
        });
    }
    upsertVote(vote, challengeRequestId, trx = undefined) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.addAuthorToDbIfNeeded(vote.author, trx);
            const dbObject = vote.toJSONForDb(challengeRequestId);
            yield this.baseTransaction(trx)(TABLES.VOTES).insert(dbObject).onConflict(["commentCid", "authorAddress"]).merge();
            return dbObject;
        });
    }
    upsertComment(postOrComment, challengeRequestId, trx) {
        return __awaiter(this, void 0, void 0, function* () {
            if (postOrComment.author)
                // Skip adding author (For CommentEdit)
                yield this.addAuthorToDbIfNeeded(postOrComment.author, trx);
            const cid = postOrComment instanceof comment_1.CommentEdit ? postOrComment.commentCid : postOrComment.cid;
            if (!challengeRequestId)
                challengeRequestId = (yield this.baseTransaction(trx)(TABLES.COMMENTS)
                    .where({
                    cid: cid
                })
                    .first()).challengeRequestId;
            (0, assert_1.default)(cid, "Comment need to have a cid before upserting");
            const originalComment = yield this.queryComment(cid, trx);
            const dbObject = originalComment
                ? Object.assign(Object.assign({}, (0, util_1.removeKeysWithUndefinedValues)(originalComment.toJSONForDb(challengeRequestId))), (0, util_1.removeKeysWithUndefinedValues)(postOrComment.toJSONForDb(challengeRequestId))) : postOrComment.toJSONForDb(challengeRequestId);
            yield this.baseTransaction(trx)(TABLES.COMMENTS).insert(dbObject).onConflict(["cid"]).merge();
        });
    }
    upsertChallenge(challenge, trx = undefined) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                const existingChallenge = yield this.baseTransaction(trx)(TABLES.CHALLENGES)
                    .where({ challengeRequestId: challenge.challengeRequestId })
                    .first();
                const dbObject = Object.assign(Object.assign({}, existingChallenge), challenge.toJSONForDb());
                this.baseTransaction(trx)(TABLES.CHALLENGES)
                    .insert(dbObject)
                    .onConflict("challengeRequestId")
                    .merge()
                    .then(() => resolve(dbObject))
                    .catch((err) => {
                    console.error(err);
                    reject(err);
                });
            }));
        });
    }
    getLastVoteOfAuthor(commentCid, authorAddress, trx = undefined) {
        return __awaiter(this, void 0, void 0, function* () {
            const voteObj = yield this.baseTransaction(trx)(TABLES.VOTES)
                .where({
                commentCid: commentCid,
                authorAddress: authorAddress
            })
                .first();
            return (yield this.createVotesFromRows(voteObj, trx))[0];
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
    createCommentsFromRows(commentsRows) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!commentsRows)
                return [undefined];
            if (!Array.isArray(commentsRows))
                commentsRows = [commentsRows];
            return Promise.all(commentsRows.map((props) => {
                const replacedProps = (0, util_1.replaceXWithY)(props, null, undefined); // Replace null with undefined to save storage (undefined is not included in JSON.stringify)
                return this.subplebbit.plebbit.createComment(replacedProps);
            }));
        });
    }
    createVotesFromRows(voteRows, trx) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                if (!voteRows)
                    resolve([undefined]);
                else {
                    if (!Array.isArray(voteRows))
                        voteRows = [voteRows];
                    voteRows = voteRows.map((props) => (0, util_1.replaceXWithY)(props, null, undefined)); // Replace null with undefined to save storage (undefined is not included in JSON.stringify)
                    const votes = voteRows.map((voteProps) => {
                        return new vote_1.default(voteProps, this.subplebbit);
                    });
                    resolve(votes);
                }
            }));
        });
    }
    queryCommentsSortedByTimestamp(parentCid, order = "desc", trx = undefined) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                this.baseCommentQuery(trx)
                    .where({ parentCid: parentCid })
                    .orderBy("timestamp", order)
                    .then((res) => __awaiter(this, void 0, void 0, function* () {
                    resolve(yield this.createCommentsFromRows.bind(this)(res, trx));
                }))
                    .catch((err) => {
                    console.error(err);
                    reject(err);
                });
            }));
        });
    }
    queryCommentsBetweenTimestampRange(parentCid, timestamp1, timestamp2, trx = undefined) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                if (timestamp1 === Number.NEGATIVE_INFINITY)
                    timestamp1 = 0;
                this.baseCommentQuery(trx)
                    .where({ parentCid: parentCid })
                    .whereBetween("timestamp", [timestamp1, timestamp2])
                    .then((res) => this.createCommentsFromRows.bind(this)(res, trx))
                    .then(resolve)
                    .catch((err) => {
                    console.error(err);
                    reject(err);
                });
            }));
        });
    }
    queryTopCommentsBetweenTimestampRange(parentCid, timestamp1, timestamp2, trx = undefined) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                if (timestamp1 === Number.NEGATIVE_INFINITY)
                    timestamp1 = 0;
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
            }));
        });
    }
    queryCommentsUnderComment(parentCid, trx) {
        return __awaiter(this, void 0, void 0, function* () {
            const commentsObjs = yield this.baseCommentQuery(trx).where({ parentCid: parentCid }).orderBy("timestamp", "desc");
            return yield this.createCommentsFromRows(commentsObjs);
        });
    }
    queryComments(trx) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.createCommentsFromRows(yield this.baseCommentQuery(trx).orderBy("id", "desc"));
        });
    }
    querySubplebbitActiveUserCount(timeframe, trx) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let from = (0, util_1.timestamp)() - util_1.TIMEFRAMES_TO_SECONDS[timeframe];
                if (from === Number.NEGATIVE_INFINITY)
                    from = 0;
                const to = (0, util_1.timestamp)();
                // TODO this could be done in a single query
                const commentsAuthors = yield this.baseTransaction(trx)(TABLES.COMMENTS)
                    .distinct("authorAddress")
                    .whereBetween("timestamp", [from, to]);
                const voteAuthors = yield this.baseTransaction(trx)(TABLES.VOTES)
                    .distinct("authorAddress")
                    .whereBetween("timestamp", [from, to]);
                let activeUserAccounts = [...commentsAuthors, ...voteAuthors].map((author) => author.authorAddress);
                // @ts-ignore
                activeUserAccounts = [...new Set(activeUserAccounts)];
                resolve(activeUserAccounts.length);
            }));
        });
    }
    querySubplebbitPostCount(timeframe, trx) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let from = (0, util_1.timestamp)() - util_1.TIMEFRAMES_TO_SECONDS[timeframe];
                if (from === Number.NEGATIVE_INFINITY)
                    from = 0;
                const to = (0, util_1.timestamp)();
                this.baseTransaction(trx)(TABLES.COMMENTS)
                    .count("cid")
                    .whereBetween("timestamp", [from, to])
                    .whereNotNull("title")
                    .then((postCount) => resolve(postCount["0"]["count(`cid`)"]))
                    .catch(reject);
            }));
        });
    }
    querySubplebbitMetrics(trx) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                const metrics = {};
                for (const metricType of ["ActiveUserCount", "PostCount"])
                    for (const timeframe of Object.keys(util_1.TIMEFRAMES_TO_SECONDS)) {
                        const propertyName = `${timeframe.toLowerCase()}${metricType}`;
                        if (metricType === "ActiveUserCount")
                            metrics[propertyName] = yield this.querySubplebbitActiveUserCount(timeframe, trx);
                        else if (metricType === "PostCount")
                            metrics[propertyName] = yield this.querySubplebbitPostCount(timeframe, trx);
                    }
                resolve(metrics);
            }));
        });
    }
    queryComment(cid, trx) {
        return __awaiter(this, void 0, void 0, function* () {
            const commentObj = yield this.baseCommentQuery(trx).where("cid", cid).first();
            return (yield this.createCommentsFromRows(commentObj))[0];
        });
    }
    queryLatestPost(trx) {
        return __awaiter(this, void 0, void 0, function* () {
            const commentObj = yield this.baseCommentQuery(trx).whereNotNull("title").orderBy("id", "desc").first();
            const post = (yield this.createCommentsFromRows(commentObj))[0];
            if (!post)
                return undefined;
            (0, assert_1.default)(post instanceof post_1.default);
            return post;
        });
    }
    insertSigner(signer, trx) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.baseTransaction(trx)(TABLES.SIGNERS).insert(signer);
        });
    }
    querySubplebbitSigner(trx) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.baseTransaction(trx)(TABLES.SIGNERS).where({ usage: exports.SIGNER_USAGES.SUBPLEBBIT }).first();
        });
    }
    querySigner(ipnsKeyName, trx) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.baseTransaction(trx)(TABLES.SIGNERS).where({ ipnsKeyName: ipnsKeyName }).first();
        });
    }
    changeDbFilename(newDbFileName) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const oldPathString = (_c = (_b = (_a = this.subplebbit) === null || _a === void 0 ? void 0 : _a._dbConfig) === null || _b === void 0 ? void 0 : _b.connection) === null || _c === void 0 ? void 0 : _c.filename;
            assert_1.default.ok(oldPathString, "subplebbit._dbConfig either does not exist or DB connection is in memory");
            if (oldPathString === ":memory:") {
                debugs.DEBUG(`No need to change file name of db since it's in memory`);
                return;
            }
            const newPath = path_1.default.format({ dir: path_1.default.dirname(oldPathString), base: newDbFileName });
            yield fs_1.default.promises.mkdir(path_1.default.dirname(newPath), { recursive: true });
            yield fs_1.default.promises.rename(oldPathString, newPath);
            this.subplebbit._dbConfig = {
                client: "better-sqlite3",
                connection: {
                    filename: newPath
                },
                useNullAsDefault: true,
                acquireConnectionTimeout: 120000
            };
            this.subplebbit.dbHandler = new DbHandler(this.subplebbit._dbConfig, this.subplebbit);
            this.subplebbit._keyv = new keyv_1.default(`sqlite://${this.subplebbit._dbConfig.connection.filename}`);
            debugs.INFO(`Changed db path from (${oldPathString}) to (${newPath})`);
        });
    }
}
exports.DbHandler = DbHandler;
const subplebbitInitDbIfNeeded = (subplebbit) => __awaiter(void 0, void 0, void 0, function* () {
    if (subplebbit.dbHandler)
        return;
    if (!subplebbit._dbConfig) {
        (0, assert_1.default)(subplebbit.address, "Need subplebbit address to initialize a DB connection");
        const dbPath = path_1.default.join(subplebbit.plebbit.dataPath, subplebbit.address);
        debugs.INFO(`User has not provided a DB config. Will initialize DB in ${dbPath}`);
        subplebbit._dbConfig = {
            client: "better-sqlite3",
            connection: {
                filename: dbPath
            },
            useNullAsDefault: true,
            acquireConnectionTimeout: 120000
        };
    }
    else
        debugs.DEBUG(`User provided a DB config of ${JSON.stringify(subplebbit._dbConfig)}`);
    const dir = path_1.default.dirname(subplebbit._dbConfig.connection.filename);
    yield fs_1.default.promises.mkdir(dir, { recursive: true });
    subplebbit.dbHandler = new DbHandler(subplebbit._dbConfig, subplebbit);
    yield subplebbit.dbHandler.createTablesIfNeeded();
    yield subplebbit.initSignerIfNeeded();
    subplebbit._keyv = new keyv_1.default(`sqlite://${subplebbit._dbConfig.connection.filename}`); // TODO make this work with DBs other than sqlite
});
exports.subplebbitInitDbIfNeeded = subplebbitInitDbIfNeeded;
