import {
    ChallengeMessage,
    ChallengeRequestMessage,
    ChallengeAnswerMessage,
    ChallengeVerificationMessage,
    PUBSUB_MESSAGE_TYPES
} from "../../challenge";
import Post from "../../post";
import Author from "../../author";
import { Comment } from "../../comment";
import { getDebugLevels, removeKeys, removeKeysWithUndefinedValues, replaceXWithY, TIMEFRAMES_TO_SECONDS, timestamp } from "../../util";
import Vote from "../../vote";
import knex, { Knex } from "knex";
import { Subplebbit } from "../../subplebbit";
import path from "path";
import assert from "assert";
import fs from "fs";
import Keyv from "keyv";
import { Signer } from "../../signer";
import Transaction = Knex.Transaction;
import { AuthorType, SubplebbitMetrics } from "../../types";
import { CommentEdit } from "../../comment-edit";

const debugs = getDebugLevels("db-handler");

const TABLES = Object.freeze({
    COMMENTS: "comments",
    VOTES: "votes",
    AUTHORS: "authors",
    CHALLENGES: "challenges",
    SIGNERS: "signers", // To store private keys of subplebbit and comments' IPNS,
    EDITS: "edits"
});

const jsonFields = ["signature", "author", "authorEdit", "original", "flair", "commentAuthor"];

export class DbHandler {
    _dbConfig: Knex.Config;
    knex: Knex;
    subplebbit: Subplebbit;
    private _currentTrxs: Record<string, Transaction>; // Prefix to Transaction. Prefix represents all trx under a pubsub message or challenge

    constructor(dbConfig: Knex.Config, subplebbit: Subplebbit) {
        this._dbConfig = dbConfig;
        this.knex = knex(dbConfig);
        this.subplebbit = subplebbit;
        this._currentTrxs = {};
    }

    async createTransaction(transactionId: string): Promise<Transaction> {
        assert(!this._currentTrxs[transactionId]);
        const trx = await this.knex.transaction();
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
        const trx: Transaction = this._currentTrxs[transactionId];
        if (trx) {
            assert(trx && trx.isTransaction && !trx.isCompleted(), `Transaction (${transactionId}) needs to be stored to rollback`);
            await this._currentTrxs[transactionId].rollback();
            delete this._currentTrxs[transactionId];
        }

        debugs.DEBUG(
            `Rolledback transaction (${transactionId}), this._currentTrxs[transactionId].length = ${Object.keys(this._currentTrxs).length}`
        );
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
            table.text("protocolVersion").notNullable();

            table.primary(["commentCid", "authorAddress"]); // An author can't have multiple votes on a comment
        });
    }

    async createAuthorsTable() {
        await this.knex.schema.createTable(TABLES.AUTHORS, (table) => {
            table.text("address").notNullable().primary().unique();
            table.timestamp("banExpiresAt").nullable();
            table.json("flair").nullable();
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

    async createEditsTable() {
        await this.knex.schema.createTable(TABLES.EDITS, (table) => {
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

    async createTablesIfNeeded() {
        const functions = [
            this.createCommentsTable,
            this.createVotesTable,
            this.createAuthorsTable,
            this.createChallengesTable,
            this.createSignersTable,
            this.createEditsTable
        ];
        const tables = Object.values(TABLES);
        for (const table of tables) {
            const i = tables.indexOf(table);
            const tableExists = await this.knex.schema.hasTable(table);
            if (!tableExists) await functions[i].bind(this)();
        }
    }

    async upsertAuthor(author: Author | AuthorType, trx?: Transaction, upsertOnlyWhenNew = true) {
        assert(JSON.stringify(author) !== "{}");
        let existingDbObject = author.address
            ? await this.baseTransaction(trx)(TABLES.AUTHORS).where({ address: author.address }).first()
            : undefined;
        if (existingDbObject && upsertOnlyWhenNew) return;
        if (existingDbObject) existingDbObject = replaceXWithY(existingDbObject, null, undefined);
        const newDbObject: AuthorType = author instanceof Author ? author.toJSONForDb() : author;
        const mergedDbObject = { ...existingDbObject, ...newDbObject };
        debugs.DEBUG(
            `upsertAuthor: attempt to upsert new merged author: ${JSON.stringify(mergedDbObject)}, existingDbObject = ${JSON.stringify(
                existingDbObject
            )}, author = ${JSON.stringify(newDbObject)}`
        );
        await this.baseTransaction(trx)(TABLES.AUTHORS).insert(mergedDbObject).onConflict(["address"]).merge();
    }

    async updateAuthor(newAuthorProps: AuthorType, updateCommentsAuthor = true, trx?: Transaction) {
        const onlyNewProps = removeKeysWithUndefinedValues(removeKeys(newAuthorProps, ["address"]));
        await this.baseTransaction(trx)(TABLES.AUTHORS).update(onlyNewProps).where("address", newAuthorProps.address);
        if (updateCommentsAuthor) {
            const commentsWithAuthor: Comment[] = await this.createCommentsFromRows(
                await this.baseCommentQuery(trx).where("authorAddress", newAuthorProps.address)
            );
            await Promise.all(
                commentsWithAuthor.map(async (comment) => {
                    const newOriginal = comment.original?.author
                        ? comment.original
                        : { ...comment.original, author: comment.author.toJSON() };
                    const newCommentProps = { author: { ...comment.author.toJSON(), ...onlyNewProps }, original: newOriginal };
                    await this.baseTransaction(trx)(TABLES.COMMENTS).update(newCommentProps).where("cid", comment.cid);
                })
            );
        }
    }

    async queryAuthor(authorAddress: string, trx?: Transaction): Promise<Author | undefined> {
        const authorProps = await this.baseTransaction(trx)(TABLES.AUTHORS).where({ address: authorAddress }).first();
        if (authorProps) return new Author(authorProps);
    }

    async upsertVote(vote: Vote, challengeRequestId: string, trx?: Transaction) {
        await this.upsertAuthor(vote.author, trx, true);
        const dbObject = vote.toJSONForDb(challengeRequestId);
        await this.baseTransaction(trx)(TABLES.VOTES).insert(dbObject).onConflict(["commentCid", "authorAddress"]).merge();
    }

    async upsertComment(postOrComment: Post | Comment, challengeRequestId?: string, trx?: Transaction) {
        assert(postOrComment.cid, "Comment need to have a cid before upserting");

        if (postOrComment.author)
            // Skip adding author (For CommentEdit)
            await this.upsertAuthor(postOrComment.author, trx, true);

        if (!challengeRequestId)
            challengeRequestId = (
                await this.baseTransaction(trx)(TABLES.COMMENTS)
                    .where({
                        cid: postOrComment.cid
                    })
                    .first()
            ).challengeRequestId;
        assert(challengeRequestId, "Need to have challengeRequestId before upserting");
        const originalComment = await this.queryComment(postOrComment.cid, trx);
        const dbObject = originalComment
            ? {
                  ...removeKeysWithUndefinedValues(originalComment.toJSONForDb(challengeRequestId)),
                  ...removeKeysWithUndefinedValues(postOrComment.toJSONForDb(challengeRequestId))
              }
            : postOrComment.toJSONForDb(challengeRequestId);
        await this.baseTransaction(trx)(TABLES.COMMENTS).insert(dbObject).onConflict(["cid"]).merge();
    }

    async insertEdit(edit: CommentEdit, challengeRequestId: string, trx?: Transaction) {
        await this.baseTransaction(trx)(TABLES.EDITS).insert(edit.toJSONForDb(challengeRequestId));
    }

    async queryEditsSorted(commentCid: string, editor?: "author" | "mod", trx?: Transaction): Promise<CommentEdit[]> {
        const authorAddress = (await this.baseTransaction(trx)(TABLES.COMMENTS).select("authorAddress").where("cid", commentCid).first())
            .authorAddress;
        if (!editor) {
            return this.createEditsFromRows(await this.baseTransaction(trx)(TABLES.EDITS).orderBy("id", "desc"));
        } else if (editor === "author") {
            return this.createEditsFromRows(
                await this.baseTransaction(trx)(TABLES.EDITS).where("authorAddress", authorAddress).orderBy("id", "desc")
            );
        } else if (editor === "mod") {
            return this.createEditsFromRows(
                await this.baseTransaction(trx)(TABLES.EDITS).whereNot("authorAddress", authorAddress).orderBy("id", "desc")
            );
        } else {
            return [];
        }
    }

    async editComment(edit: CommentEdit, challengeRequestId: string, trx?: Transaction) {
        // Fields that need to be merged
        // flair
        assert(edit.commentCid);
        const commentToBeEdited = await this.queryComment(edit.commentCid);
        assert(commentToBeEdited);

        const isEditFromAuthor = commentToBeEdited.signature.publicKey === edit.signature.publicKey;
        let newProps: Object;
        if (isEditFromAuthor) {
            const modEdits = await this.queryEditsSorted(edit.commentCid, "mod", trx);
            const hasModEditedCommentFlairBefore = modEdits.some((modEdit) => Boolean(modEdit.flair));
            const flairIfNeeded = hasModEditedCommentFlairBefore || !edit.flair ? undefined : { flair: JSON.stringify(edit.flair) };

            newProps = removeKeysWithUndefinedValues({
                authorEdit: JSON.stringify(edit.toJSONForDb(challengeRequestId)),
                original: JSON.stringify(commentToBeEdited.original || commentToBeEdited.toJSONSkeleton()),
                ...flairIfNeeded
            });
            debugs.DEBUG(`Will update comment (${edit.commentCid}) with author props: ${JSON.stringify(newProps)}`);
        } else {
            newProps = {
                ...edit.toJSONForDb(challengeRequestId),
                original: JSON.stringify(commentToBeEdited.original || commentToBeEdited.toJSONSkeleton())
            };
            debugs.DEBUG(`Will update comment (${edit.commentCid}) with mod props: ${JSON.stringify(removeKeys(newProps, ["signature"]))}`);
        }

        await this.baseTransaction(trx)(TABLES.COMMENTS).update(newProps).where("cid", edit.commentCid);
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
            commentsRows.map(async (props) => {
                const replacedProps = replaceXWithY(props, null, undefined); // Replace null with undefined to save storage (undefined is not included in JSON.stringify)
                for (const field of jsonFields) if (replacedProps[field]) replacedProps[field] = JSON.parse(replacedProps[field]);

                const comment = await this.subplebbit.plebbit.createComment(replacedProps);
                assert(typeof comment.replyCount === "number");
                return comment;
            })
        );
    }

    async createEditsFromRows(edits: CommentEdit[] | CommentEdit): Promise<CommentEdit[]> {
        if (!edits || (Array.isArray(edits) && edits?.length === 0)) return [];
        if (!Array.isArray(edits)) edits = [edits];
        return Promise.all(
            edits.map(async (props) => {
                const replacedProps = replaceXWithY(props, null, undefined); // Replace null with undefined to save storage (undefined is not included in JSON.stringify)
                for (const field of jsonFields) if (replacedProps[field]) replacedProps[field] = JSON.parse(replacedProps[field]);

                return this.subplebbit.plebbit.createCommentEdit(replacedProps);
            })
        );
    }

    async createVotesFromRows(voteRows: Vote[] | Vote): Promise<Vote[]> {
        if (!voteRows || (Array.isArray(voteRows) && voteRows.length === 0)) return [];
        if (!Array.isArray(voteRows)) voteRows = [voteRows];
        return Promise.all(
            voteRows.map((props) => {
                const replacedProps = replaceXWithY(props, null, undefined);
                for (const field of jsonFields) if (replacedProps[field]) replacedProps[field] = JSON.parse(replacedProps[field]);
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
        assert(typeof cid === "string" && cid.length > 0, `Can't query a comment with null cid (${cid})`);
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
                const commentsWithDepth = await this.baseCommentQuery(trx).where({ depth: depth });
                return this.createCommentsFromRows(commentsWithDepth);
            })
        );
        return comments;
    }

    async queryCountOfPosts(trx?: Knex.Transaction): Promise<number> {
        const obj = await this.baseTransaction(trx)(TABLES.COMMENTS).count().where({ depth: 0 }).first();
        if (!obj) return 0;
        return Number(obj["count(*)"]);
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
