import {
    ChallengeMessage,
    ChallengeRequestMessage,
    ChallengeAnswerMessage,
    ChallengeVerificationMessage,
    PUBSUB_MESSAGE_TYPES
} from "../../challenge";
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
import { SubplebbitMetrics } from "../../types";

const debugs = getDebugLevels("db-handler");

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
    private _currentTrxs: Transaction[];

    constructor(dbConfig: Knex.Config, subplebbit: Subplebbit) {
        this._dbConfig = dbConfig;
        this.knex = knex(dbConfig);
        this.subplebbit = subplebbit;
        this._currentTrxs = [];
    }

    async createTransaction(): Promise<Transaction> {
        const trx = await this.knex.transaction();
        this._currentTrxs.push(trx);
        return trx;
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
            table.enum("usage", Object.values(["comment", "subplebbit"])).notNullable();
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

    async addAuthorToDbIfNeeded(author: Author, trx?: Transaction) {
        const authorFromDb = await this.baseTransaction(trx)(TABLES.AUTHORS).where({ address: author.address }).first();
        if (!authorFromDb)
            // Author is new. Add to database
            await this.baseTransaction(trx)(TABLES.AUTHORS).insert(author.toJSONForDb());
    }

    async upsertVote(vote: Vote, challengeRequestId: string, trx?: Transaction) {
        await this.addAuthorToDbIfNeeded(vote.author, trx);
        const dbObject = vote.toJSONForDb(challengeRequestId);
        await this.baseTransaction(trx)(TABLES.VOTES).insert(dbObject).onConflict(["commentCid", "authorAddress"]).merge();
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

    async upsertChallenge(
        challenge: ChallengeRequestMessage | ChallengeMessage | ChallengeAnswerMessage | ChallengeVerificationMessage,
        trx?: Transaction
    ) {
        const existingChallenge = await this.baseTransaction(trx)(TABLES.CHALLENGES)
            .where({ challengeRequestId: challenge.challengeRequestId })
            .first();
        const dbObject = {
            ...existingChallenge,
            ...challenge.toJSONForDb()
        };
        await this.baseTransaction(trx)(TABLES.CHALLENGES).insert(dbObject).onConflict("challengeRequestId").merge();
    }

    async getLastVoteOfAuthor(commentCid: string, authorAddress: string, trx?: Transaction): Promise<Vote | undefined> {
        const voteObj = await this.baseTransaction(trx)(TABLES.VOTES)
            .where({
                commentCid: commentCid,
                authorAddress: authorAddress
            })
            .first();
        return (await this.createVotesFromRows(voteObj))[0];
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

    async createCommentsFromRows(commentsRows: Comment[] | Comment): Promise<Comment[] | Post[]> {
        if (!commentsRows || (Array.isArray(commentsRows) && commentsRows?.length === 0)) return [];
        if (!Array.isArray(commentsRows)) commentsRows = [commentsRows];
        return Promise.all(
            commentsRows.map((props) => {
                const replacedProps = replaceXWithY(props, null, undefined); // Replace null with undefined to save storage (undefined is not included in JSON.stringify)
                // @ts-ignore
                return this.subplebbit.plebbit.createComment(replacedProps);
            })
        );
    }

    async createVotesFromRows(voteRows: Vote[] | Vote): Promise<Vote[]> {
        if (!voteRows || (Array.isArray(voteRows) && voteRows.length === 0)) return [];
        if (!Array.isArray(voteRows)) voteRows = [voteRows];
        return Promise.all(
            voteRows.map((props) => {
                const replacedProps = replaceXWithY(props, null, undefined);
                // @ts-ignore
                return this.subplebbit.plebbit.createVote(replacedProps);
            })
        );
    }

    async queryCommentsSortedByTimestamp(parentCid: string | undefined | null, order = "desc", trx?: Transaction) {
        parentCid = parentCid || null;

        const commentObj = await this.baseCommentQuery(trx).where({ parentCid: parentCid }).orderBy("timestamp", order);
        return this.createCommentsFromRows(commentObj);
    }

    async queryCommentsBetweenTimestampRange(
        parentCid: string | undefined | null,
        timestamp1: number,
        timestamp2: number,
        trx?: Transaction
    ): Promise<Comment[] | Post[]> {
        parentCid = parentCid || null;

        if (timestamp1 === Number.NEGATIVE_INFINITY) timestamp1 = 0;
        const rawCommentObjs = await this.baseCommentQuery(trx)
            .where({ parentCid: parentCid })
            .whereBetween("timestamp", [timestamp1, timestamp2]);
        return this.createCommentsFromRows(rawCommentObjs);
    }

    async queryTopCommentsBetweenTimestampRange(
        parentCid: string | undefined | null,
        timestamp1: number,
        timestamp2: number,
        trx?: Transaction
    ): Promise<Comment[] | Post[]> {
        if (timestamp1 === Number.NEGATIVE_INFINITY) timestamp1 = 0;
        parentCid = parentCid || null;
        const topScoreQuery = this.baseTransaction(trx)(TABLES.VOTES)
            .select(this.knex.raw(`COALESCE(SUM(${TABLES.VOTES}.vote), 0)`)) // We're using raw expressions because there's no native method in Knexjs to return 0 if SUM is null
            .where({
                [`${TABLES.COMMENTS}.cid`]: this.knex.raw(`${TABLES.VOTES}.commentCid`)
            })
            .as("topScore");
        const rawCommentsObjs = await this.baseCommentQuery(trx)
            .select(topScoreQuery)
            .groupBy(`${TABLES.COMMENTS}.cid`)
            .orderBy("topScore", "desc")
            .whereBetween(`${TABLES.COMMENTS}.timestamp`, [timestamp1, timestamp2])
            .where({ [`${TABLES.COMMENTS}.parentCid`]: parentCid });

        return this.createCommentsFromRows(rawCommentsObjs);
    }

    async queryCommentsUnderComment(parentCid: string | undefined | null, trx?: Transaction): Promise<Comment[] | Post[]> {
        parentCid = parentCid || null;

        const commentsObjs = await this.baseCommentQuery(trx).where({ parentCid: parentCid }).orderBy("timestamp", "desc");
        return await this.createCommentsFromRows(commentsObjs);
    }

    async queryParentsOfComment(comment: Comment, trx?: Transaction): Promise<Comment[]> {
        const parents: Comment[] = [];
        let curParentCid = comment.parentCid;
        while (curParentCid) {
            const parent = await this.queryComment(curParentCid, trx);
            if (parent) parents.push(parent);
            curParentCid = parent?.parentCid;
        }
        assert.equal(comment.depth, parents.length, "Depth should equal to parents length");
        return parents;
    }

    async queryComments(trx?: Transaction): Promise<Comment[] | Post[]> {
        return this.createCommentsFromRows(await this.baseCommentQuery(trx).orderBy("id", "desc"));
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
                                    await this.baseTransaction(trx)(TABLES.COMMENTS)
                                        .countDistinct("comments.authorAddress")
                                        .join(TABLES.VOTES, `${TABLES.COMMENTS}.authorAddress`, `=`, `${TABLES.VOTES}.authorAddress`)
                                        .whereBetween("comments.timestamp", [from, to])
                                )[0]["count(distinct `comments`.`authorAddress`)"];
                                return { [propertyName]: res };
                            } else if (metricType === "PostCount") {
                                const query = this.baseTransaction(trx)(TABLES.COMMENTS)
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

    async insertSigner(signer: Signer, trx?: Transaction) {
        await this.baseTransaction(trx)(TABLES.SIGNERS).insert(signer);
    }

    async querySubplebbitSigner(trx?: Transaction): Promise<Signer> {
        return this.baseTransaction(trx)(TABLES.SIGNERS).where({ usage: "subplebbit" }).first();
    }

    async querySigner(ipnsKeyName: string, trx?: Transaction): Promise<Signer | undefined> {
        return this.baseTransaction(trx)(TABLES.SIGNERS).where({ ipnsKeyName: ipnsKeyName }).first();
    }

    async queryCommentsGroupByDepth(trx?: Knex.Transaction): Promise<Comment[][]> {
        const maxDepth = (await this.baseTransaction(trx)(TABLES.COMMENTS).max("depth"))[0]["max(`depth`)"];
        if (typeof maxDepth !== "number") return [[]];

        const depths = new Array(maxDepth + 1).fill(null).map((value, i) => i);
        const comments: Comment[][] = await Promise.all(
            depths.map(async (depth) => {
                const commentsWithDepth = await this.baseTransaction(trx)(TABLES.COMMENTS).where({ depth: depth });
                return await Promise.all(commentsWithDepth.map((commentProps) => this.subplebbit.plebbit.createComment(commentProps)));
            })
        );
        return comments;
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
            ...this.subplebbit._dbConfig,
            connection: {
                filename: newPath
            }
        };
        this.subplebbit.dbHandler = new DbHandler(this.subplebbit._dbConfig, this.subplebbit);
        this.subplebbit._keyv = new Keyv(`sqlite://${this.subplebbit._dbConfig.connection.filename}`);
        debugs.INFO(`Changed db path from (${oldPathString}) to (${newPath})`);
    }

    async rollbackAllTrxs() {
        await Promise.all(this._currentTrxs.map((trx) => trx.rollback()));
        this._currentTrxs = [];
    }
}

export const subplebbitInitDbIfNeeded = async (subplebbit: Subplebbit) => {
    if (subplebbit.dbHandler) return;
    if (!subplebbit._dbConfig) {
        assert(subplebbit.address, "Need subplebbit address to initialize a DB connection");
        const dbPath = path.join(subplebbit.plebbit.dataPath, "subplebbits", subplebbit.address);
        debugs.INFO(`User has not provided a DB config. Will initialize DB in ${dbPath}`);
        subplebbit._dbConfig = {
            client: "sqlite3",
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
