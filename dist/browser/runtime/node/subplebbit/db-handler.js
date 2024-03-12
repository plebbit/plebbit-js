import { throwWithErrorCode, TIMEFRAMES_TO_SECONDS, timestamp } from "../../../util.js";
import knex from "knex";
import path from "path";
import assert from "assert";
import fs from "fs";
import os from "os";
import Keyv from "keyv";
import Logger from "@plebbit/plebbit-logger";
import { deleteOldSubplebbitInWindows, getDefaultSubplebbitDbConfig } from "../util.js";
import env from "../../../version.js";
import lodash from "lodash";
import * as lockfile from "@plebbit/proper-lockfile";
import { v4 as uuidV4 } from "uuid";
import { AUTHOR_EDIT_FIELDS } from "../../../signer/constants.js";
import { getPlebbitAddressFromPublicKey } from "../../../signer/util.js";
const TABLES = Object.freeze({
    COMMENTS: "comments",
    COMMENT_UPDATES: "commentUpdates",
    VOTES: "votes",
    COMMENT_EDITS: "commentEdits"
});
export class DbHandler {
    constructor(subplebbit) {
        this._subplebbit = subplebbit;
        this._currentTrxs = {};
        this._createdTables = false;
    }
    async initDbConfigIfNeeded() {
        if (!this._dbConfig)
            this._dbConfig = await getDefaultSubplebbitDbConfig(this._subplebbit);
    }
    toJSON() {
        return undefined;
    }
    async initDbIfNeeded() {
        const log = Logger("plebbit-js:subplebbit:db-handler:initDbIfNeeded");
        assert(typeof this._subplebbit.address === "string" && this._subplebbit.address.length > 0, `DbHandler needs to be an instantiated with a Subplebbit that has a valid address, (${this._subplebbit.address}) was provided`);
        await this.initDbConfigIfNeeded();
        if (!this._knex)
            this._knex = knex(this._dbConfig);
        if (!this._createdTables)
            try {
                await this.createTablesIfNeeded();
            }
            catch (e) {
                log.error(`Sub (${this._subplebbit.address}) failed to create/migrate tables. Current db version (${await this.getDbVersion()}), latest db version (${env.DB_VERSION}). Error`, e);
                throw e;
            }
        if (!this._keyv)
            this._keyv = new Keyv(`sqlite://${this._dbConfig.connection.filename}`);
    }
    getDbConfig() {
        return this._dbConfig;
    }
    async keyvGet(key, options) {
        const res = await this._keyv.get(key, options);
        return res;
    }
    async keyvSet(key, value, ttl) {
        const res = await this._keyv.set(key, value, ttl);
        return res;
    }
    async keyvDelete(key) {
        const res = await this._keyv.delete(key);
        return res;
    }
    async keyvHas(key) {
        const res = await this._keyv.has(key);
        return res;
    }
    async initDestroyedConnection() {
        this._knex.initialize();
    }
    async destoryConnection() {
        await this._knex.destroy();
        await this._keyv.disconnect();
    }
    async createTransaction(transactionId) {
        assert(!this._currentTrxs[transactionId]);
        const trx = await this._knex.transaction();
        this._currentTrxs[transactionId] = trx;
        return trx;
    }
    async commitTransaction(transactionId) {
        const trx = this._currentTrxs[transactionId];
        // assert(trx && trx.isTransaction && !trx.isCompleted(), `Transaction (${transactionId}) needs to be stored to commit`);
        await this._currentTrxs[transactionId].commit();
        delete this._currentTrxs[transactionId];
    }
    async rollbackTransaction(transactionId) {
        const log = Logger("plebbit-js:db-handler:rollbackTransaction");
        const trx = this._currentTrxs[transactionId];
        if (trx) {
            assert(trx.isTransaction, `Transaction (${transactionId}) needs to be stored to rollback`);
            if (trx.isCompleted())
                return;
            await this._currentTrxs[transactionId].rollback();
            delete this._currentTrxs[transactionId];
        }
        log.trace(`Rolledback transaction (${transactionId}), this._currentTrxs[transactionId].length = ${Object.keys(this._currentTrxs).length}`);
    }
    async rollbackAllTransactions() {
        return Promise.all(Object.keys(this._currentTrxs).map((trxId) => this.rollbackTransaction(trxId)));
    }
    _baseTransaction(trx) {
        return trx ? trx : this._knex;
    }
    async _createCommentsTable(tableName) {
        await this._knex.schema.createTable(tableName, (table) => {
            table.text("cid").notNullable().primary().unique();
            table.text("authorAddress").notNullable();
            table.text("authorSignerAddress").notNullable();
            table.json("author").notNullable();
            table.string("link").nullable();
            table.integer("linkWidth").nullable().checkPositive();
            table.integer("linkHeight").nullable().checkPositive();
            table.string("thumbnailUrl").nullable();
            table.integer("thumbnailUrlWidth").nullable();
            table.integer("thumbnailUrlHeight").nullable();
            table.text("parentCid").nullable().references("cid").inTable(TABLES.COMMENTS);
            table.text("postCid").notNullable().references("cid").inTable(TABLES.COMMENTS);
            table.text("previousCid").nullable().references("cid").inTable(TABLES.COMMENTS);
            table.text("subplebbitAddress").notNullable();
            table.text("content").nullable();
            table.timestamp("timestamp").notNullable().checkBetween([0, Number.MAX_SAFE_INTEGER]);
            table.text("ipnsName").nullable(); // Kept for compatibility purposes, will not be used from db version 11 and onward
            table.json("signature").notNullable().unique(); // Will contain {signature, public key, type}
            table.text("title").nullable();
            table.integer("depth").notNullable().checkBetween([0, Number.MAX_SAFE_INTEGER]);
            table.text("challengeRequestPublicationSha256").notNullable().unique();
            table.json("flair").nullable();
            table.boolean("spoiler");
            table.text("protocolVersion").notNullable();
            table.increments("id"); // Used for sorts
            table.timestamp("insertedAt").defaultTo(this._knex.raw("(strftime('%s', 'now'))")); // Timestamp of when it was first inserted in the table
        });
    }
    async _createCommentUpdatesTable(tableName) {
        await this._knex.schema.createTable(tableName, (table) => {
            table.text("cid").notNullable().primary().unique().references("cid").inTable(TABLES.COMMENTS);
            table.json("edit").nullable();
            table.integer("upvoteCount").notNullable().checkBetween([0, Number.MAX_SAFE_INTEGER]);
            table.integer("downvoteCount").notNullable().checkBetween([0, Number.MAX_SAFE_INTEGER]);
            table.integer("replyCount").notNullable().checkBetween([0, Number.MAX_SAFE_INTEGER]);
            table.json("flair").nullable();
            table.boolean("spoiler");
            table.boolean("pinned");
            table.boolean("locked");
            table.boolean("removed");
            table.text("reason");
            table.timestamp("updatedAt").notNullable().checkPositive();
            table.text("protocolVersion").notNullable();
            table.json("signature").notNullable().unique(); // Will contain {signature, public key, type}
            table.json("author").nullable();
            table.json("replies").nullable(); // TODO we should not be storing replies here, it takes too much storage
            table.text("lastChildCid").nullable().references("cid").inTable(TABLES.COMMENTS);
            table.timestamp("lastReplyTimestamp").nullable();
            // Not part of CommentUpdate
            table.text("ipfsPath").notNullable().unique();
            // Columns with defaults
            table.timestamp("insertedAt").defaultTo(this._knex.raw("(strftime('%s', 'now'))")); // Timestamp of when it was first inserted in the table
        });
    }
    async _createVotesTable(tableName) {
        await this._knex.schema.createTable(tableName, (table) => {
            table.text("commentCid").notNullable().references("cid").inTable(TABLES.COMMENTS);
            table.text("authorAddress").notNullable();
            table.text("authorSignerAddress").notNullable();
            table.json("author").notNullable();
            table.timestamp("timestamp").checkPositive().notNullable();
            table.text("subplebbitAddress").notNullable();
            table.integer("vote").checkBetween([-1, 1]).notNullable();
            table.json("signature").notNullable().unique();
            table.text("protocolVersion").notNullable();
            table.timestamp("insertedAt").defaultTo(this._knex.raw("(strftime('%s', 'now'))")); // Timestamp of when it was first inserted in the table
            table.primary(["commentCid", "authorSignerAddress"]); // An author can't have multiple votes on a comment
        });
    }
    async _createCommentEditsTable(tableName) {
        await this._knex.schema.createTable(tableName, (table) => {
            table.text("commentCid").notNullable().references("cid").inTable(TABLES.COMMENTS);
            table.text("authorAddress").notNullable();
            table.text("authorSignerAddress").notNullable();
            table.json("author").notNullable();
            table.json("signature").notNullable().unique();
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
            table.json("commentAuthor").nullable();
            table.boolean("isAuthorEdit").notNullable(); // If false, then it's a mod edit
            table.timestamp("insertedAt").defaultTo(this._knex.raw("(strftime('%s', 'now'))")); // Timestamp of when it was first inserted in the table
            table.primary(["id", "commentCid"]);
        });
    }
    async getDbVersion() {
        return Number((await this._knex.raw("PRAGMA user_version"))[0]["user_version"]);
    }
    async createTablesIfNeeded() {
        const log = Logger("plebbit-js:db-handler:createTablesIfNeeded");
        const currentDbVersion = await this.getDbVersion();
        log.trace(`current db version: ${currentDbVersion}`);
        const needToMigrate = currentDbVersion < env.DB_VERSION;
        if (needToMigrate) {
            await this._knex.raw("PRAGMA foreign_keys = OFF");
            if (currentDbVersion <= 10) {
                // Remove unneeded tables
                await Promise.all(["challengeRequests", "challenges", "challengeAnswers", "challengeVerifications"].map((tableName) => this._knex.schema.dropTableIfExists(tableName)));
            }
            await this._knex.schema.dropTableIfExists(TABLES.COMMENT_UPDATES); // To trigger an update
        }
        const createTableFunctions = [
            this._createCommentsTable,
            this._createCommentUpdatesTable,
            this._createVotesTable,
            this._createCommentEditsTable
        ];
        const tables = Object.values(TABLES);
        for (let i = 0; i < tables.length; i++) {
            const tableName = tables[i];
            const tableExists = await this._knex.schema.hasTable(tableName);
            if (!tableExists) {
                log(`Table ${tableName} does not exist. Will create schema`);
                await createTableFunctions[i].bind(this)(tableName);
            }
            else if (tableExists && needToMigrate) {
                // We need to update the schema of the currently existing table
                log(`Migrating table ${tableName} to new schema`);
                const tempTableName = `${tableName}${env.DB_VERSION}`;
                await this._knex.schema.dropTableIfExists(tempTableName);
                await createTableFunctions[i].bind(this)(tempTableName);
                await this._copyTable(tableName, tempTableName, currentDbVersion);
                await this._knex.schema.dropTable(tableName);
                await this._knex.schema.renameTable(tempTableName, tableName);
            }
        }
        if (needToMigrate) {
            await this._knex.raw("PRAGMA foreign_keys = ON");
            await this._knex.raw(`PRAGMA user_version = ${env.DB_VERSION}`);
        }
        const newDbVersion = await this.getDbVersion();
        assert.equal(newDbVersion, env.DB_VERSION);
        this._createdTables = true;
    }
    async _copyTable(srcTable, dstTable, currentDbVersion) {
        const log = Logger("plebbit-js:db-handler:createTablesIfNeeded:copyTable");
        const dstTableColumns = Object.keys(await this._knex(dstTable).columnInfo());
        const srcRecords = await this._knex(srcTable).select("*");
        if (srcRecords.length > 0) {
            log(`Attempting to copy ${srcRecords.length} ${srcTable}`);
            // Remove fields that are not in dst table. Will prevent errors when migration from db version 2 to 3
            const srcRecordFiltered = srcRecords.map((record) => lodash.pick(record, dstTableColumns));
            // Need to make sure that array fields are json strings
            for (const srcRecord of srcRecordFiltered) {
                for (const srcRecordKey of Object.keys(srcRecord))
                    if (Array.isArray(srcRecord[srcRecordKey])) {
                        srcRecord[srcRecordKey] = JSON.stringify(srcRecord[srcRecordKey]);
                        assert(srcRecord[srcRecordKey] !== "[object Object]", "DB value shouldn't be [object Object]");
                    }
                // Migration from version 10 to 11
                if (currentDbVersion <= 10 && srcTable === TABLES.COMMENTS) {
                    srcRecord["challengeRequestPublicationSha256"] = `random-place-holder-${uuidV4()}`; // We just need the copy to work. The new comments will have a correct hash
                }
                if (currentDbVersion <= 11 && srcTable === TABLES.COMMENT_EDITS) {
                    // Need to compute isAuthorEdit column
                    const editWithType = srcRecord;
                    const commentToBeEdited = await this.queryComment(editWithType.commentCid);
                    const editHasBeenSignedByOriginalAuthor = editWithType.signature.publicKey === commentToBeEdited.signature.publicKey;
                    srcRecord["isAuthorEdit"] = this._subplebbit._isAuthorEdit(editWithType, editHasBeenSignedByOriginalAuthor);
                }
                if (currentDbVersion <= 12 && srcRecord["authorAddress"]) {
                    srcRecord["authorSignerAddress"] = await getPlebbitAddressFromPublicKey(srcRecord["signature"]["publicKey"]);
                }
            }
            // Have to use a for loop because if I inserted them as a whole it throw a "UNIQUE constraint failed: comments6.signature"
            // Probably can be fixed but not worth the time
            for (const srcRecord of srcRecordFiltered)
                await this._knex(dstTable).insert(srcRecord);
        }
        log(`copied table ${srcTable} to table ${dstTable}`);
    }
    async deleteVote(authorSignerAddress, commentCid, trx) {
        await this._baseTransaction(trx)(TABLES.VOTES)
            .where("commentCid", commentCid)
            .where("authorSignerAddress", authorSignerAddress)
            .del();
    }
    async insertVote(vote, trx) {
        await this._baseTransaction(trx)(TABLES.VOTES).insert(vote);
    }
    async insertComment(comment, trx) {
        await this._baseTransaction(trx)(TABLES.COMMENTS).insert(comment);
    }
    async upsertCommentUpdate(update, trx) {
        await this._baseTransaction(trx)(TABLES.COMMENT_UPDATES).insert(update).onConflict(["cid"]).merge();
    }
    async insertEdit(edit, trx) {
        await this._baseTransaction(trx)(TABLES.COMMENT_EDITS).insert(edit);
    }
    async getStoredVoteOfAuthor(commentCid, authorSignerAddress, trx) {
        return this._baseTransaction(trx)(TABLES.VOTES)
            .where({
            commentCid: commentCid,
            authorSignerAddress
        })
            .first();
    }
    _basePageQuery(options, trx) {
        let query = this._baseTransaction(trx)(TABLES.COMMENTS)
            .innerJoin(TABLES.COMMENT_UPDATES, `${TABLES.COMMENTS}.cid`, `${TABLES.COMMENT_UPDATES}.cid`)
            .jsonExtract(`${TABLES.COMMENT_UPDATES}.edit`, "$.deleted", "deleted", true)
            .where({ parentCid: options.parentCid });
        if (options.excludeCommentsWithDifferentSubAddress)
            query = query.where({ subplebbitAddress: this._subplebbit.address });
        if (options.excludeRemovedComments)
            query = query.andWhereRaw(`${TABLES.COMMENT_UPDATES}.removed is not 1`);
        if (options.excludeDeletedComments)
            query = query.andWhereRaw("`deleted` is not 1");
        return query;
    }
    async queryReplyCount(commentCid, trx) {
        const options = {
            excludeCommentsWithDifferentSubAddress: true,
            excludeDeletedComments: true,
            excludeRemovedComments: true,
            parentCid: commentCid
        };
        const children = await this.queryCommentsForPages(options, trx);
        return children.length + lodash.sum(await Promise.all(children.map((comment) => this.queryReplyCount(comment.comment.cid, trx))));
    }
    async queryActiveScore(comment, trx) {
        let maxTimestamp = comment.timestamp;
        // Note: active score will include deleted and removed comments
        const updateMaxTimestamp = async (localComments) => {
            for (const commentChild of localComments) {
                if (commentChild.timestamp > maxTimestamp)
                    maxTimestamp = commentChild.timestamp;
                const children = await this.queryCommentsUnderComment(commentChild.cid, trx);
                if (children.length > 0)
                    await updateMaxTimestamp(children);
            }
        };
        const children = await this.queryCommentsUnderComment(comment.cid, trx);
        if (children.length > 0)
            await updateMaxTimestamp(children);
        return maxTimestamp;
    }
    async queryCommentsForPages(options, trx) {
        //prettier-ignore
        const commentUpdateColumns = ["cid", "author", "downvoteCount", "edit", "flair", "locked", "pinned", "protocolVersion", "reason", "removed", "replyCount", "spoiler", "updatedAt", "upvoteCount", "replies", "lastChildCid", "lastReplyTimestamp", "signature"];
        const aliasSelect = commentUpdateColumns.map((col) => `${TABLES.COMMENT_UPDATES}.${col} AS commentUpdate_${col}`);
        const commentsRaw = await this._basePageQuery(options, trx).select([`${TABLES.COMMENTS}.*`, ...aliasSelect]);
        //@ts-expect-error
        const comments = commentsRaw.map((commentRaw) => ({
            comment: lodash.pickBy(commentRaw, (value, key) => !key.startsWith("commentUpdate_")),
            update: lodash.mapKeys(lodash.pickBy(commentRaw, (value, key) => key.startsWith("commentUpdate_")), (value, key) => key.replace("commentUpdate_", ""))
        }));
        return comments;
    }
    async queryStoredCommentUpdate(comment, trx) {
        return this._baseTransaction(trx)(TABLES.COMMENT_UPDATES).where("cid", comment.cid).first();
    }
    async queryAllStoredCommentUpdates(trx) {
        return this._baseTransaction(trx)(TABLES.COMMENT_UPDATES);
    }
    async queryCommentUpdatesOfPostsForBucketAdjustment(trx) {
        return this._baseTransaction(trx)(TABLES.COMMENTS)
            .innerJoin(TABLES.COMMENT_UPDATES, `${TABLES.COMMENTS}.cid`, `${TABLES.COMMENT_UPDATES}.cid`)
            .select(`${TABLES.COMMENT_UPDATES}.ipfsPath`, `${TABLES.COMMENTS}.timestamp`, `${TABLES.COMMENTS}.cid`)
            .where("depth", 0);
    }
    async deleteAllCommentUpdateRows(trx) {
        return this._baseTransaction(trx)(TABLES.COMMENT_UPDATES).del();
    }
    async queryCommentsUpdatesWithPostCid(postCid, trx) {
        return this._baseTransaction(trx)(TABLES.COMMENTS)
            .innerJoin(TABLES.COMMENT_UPDATES, `${TABLES.COMMENTS}.cid`, `${TABLES.COMMENT_UPDATES}.cid`)
            .where(`${TABLES.COMMENTS}.postCid`, postCid)
            .select(`${TABLES.COMMENT_UPDATES}.*`);
    }
    async queryCommentsOfAuthor(authorSignerAddresses, trx) {
        if (!Array.isArray(authorSignerAddresses))
            authorSignerAddresses = [authorSignerAddresses];
        return this._baseTransaction(trx)(TABLES.COMMENTS).whereIn("authorSignerAddress", authorSignerAddresses);
    }
    async queryAllCommentsCid(trx) {
        const res = await this._baseTransaction(trx)(TABLES.COMMENTS).select("cid");
        return res.map((row) => row.cid);
    }
    async queryCommentsByCids(cids, trx) {
        return this._baseTransaction(trx)(TABLES.COMMENTS).whereIn("cid", cids);
    }
    async queryCommentByRequestPublicationHash(publicationHash, trx) {
        return this._baseTransaction(trx)(TABLES.COMMENTS).where("challengeRequestPublicationSha256", publicationHash).first();
    }
    async queryParents(rootComment, trx) {
        const parents = [];
        let curParentCid = rootComment.parentCid;
        while (curParentCid) {
            const parent = await this.queryComment(curParentCid, trx);
            if (parent)
                parents.push(parent);
            curParentCid = parent?.parentCid;
        }
        return parents;
    }
    async queryCommentsToBeUpdated(trx) {
        // Criteria:
        // 1 - Comment has no row in commentUpdates (has never published CommentUpdate) OR
        // 2 - commentUpdate.updatedAt is less or equal to max of insertedAt of child votes, comments or commentEdit OR
        // 3 - Comments that new votes, CommentEdit or other comments were published under them
        // After retrieving all comments with any of criteria above, also add their parents to the list to update
        // Also for each comment, add the previous comments of its author to update them too
        const criteriaOne = await this._baseTransaction(trx)(TABLES.COMMENTS)
            .select(`${TABLES.COMMENTS}.*`)
            .leftJoin(TABLES.COMMENT_UPDATES, `${TABLES.COMMENTS}.cid`, `${TABLES.COMMENT_UPDATES}.cid`)
            .whereNull(`${TABLES.COMMENT_UPDATES}.updatedAt`);
        const lastUpdatedAtWithBuffer = this._knex.raw("`lastUpdatedAt` - 1");
        const criteriaTwoThree = await this._baseTransaction(trx)(TABLES.COMMENTS)
            .select(`${TABLES.COMMENTS}.*`)
            .innerJoin(TABLES.COMMENT_UPDATES, `${TABLES.COMMENTS}.cid`, `${TABLES.COMMENT_UPDATES}.cid`)
            .leftJoin(TABLES.VOTES, `${TABLES.COMMENTS}.cid`, `${TABLES.VOTES}.commentCid`)
            .leftJoin(TABLES.COMMENT_EDITS, `${TABLES.COMMENTS}.cid`, `${TABLES.COMMENT_EDITS}.commentCid`)
            .leftJoin({ childrenComments: TABLES.COMMENTS }, `${TABLES.COMMENTS}.cid`, `childrenComments.parentCid`)
            .max({
            voteLastInsertedAt: `${TABLES.VOTES}.insertedAt`,
            editLastInsertedAt: `${TABLES.COMMENT_EDITS}.insertedAt`,
            childCommentLastInsertedAt: `childrenComments.insertedAt`,
            lastUpdatedAt: `${TABLES.COMMENT_UPDATES}.updatedAt`
        })
            .groupBy(`${TABLES.COMMENTS}.cid`)
            .having(`voteLastInsertedAt`, ">=", lastUpdatedAtWithBuffer)
            .orHaving(`editLastInsertedAt`, ">=", lastUpdatedAtWithBuffer)
            .orHaving(`childCommentLastInsertedAt`, ">=", lastUpdatedAtWithBuffer);
        const comments = lodash.uniqBy([...criteriaOne, ...criteriaTwoThree], (comment) => comment.cid);
        const parents = lodash.flattenDeep(await Promise.all(comments.filter((comment) => comment.parentCid).map((comment) => this.queryParents(comment, trx))));
        const authorComments = await this.queryCommentsOfAuthor(lodash.uniq(comments.map((comment) => comment.authorSignerAddress)), trx);
        const uniqComments = lodash.uniqBy([...comments, ...parents, ...authorComments], (comment) => comment.cid);
        return uniqComments;
    }
    _calcActiveUserCount(commentsRaw, votesRaw) {
        const res = {};
        for (const timeframe of Object.keys(TIMEFRAMES_TO_SECONDS)) {
            const propertyName = `${timeframe.toLowerCase()}ActiveUserCount`;
            const [from, to] = [Math.max(0, timestamp() - TIMEFRAMES_TO_SECONDS[timeframe]), timestamp()];
            const authors = lodash.uniq([
                ...commentsRaw
                    .filter((comment) => comment.timestamp >= from && comment.timestamp <= to)
                    .map((comment) => comment.authorSignerAddress),
                ...votesRaw.filter((vote) => vote.timestamp >= from && vote.timestamp <= to).map((vote) => vote.authorSignerAddress)
            ]);
            res[propertyName] = authors.length;
        }
        return res;
    }
    _calcPostCount(commentsRaw) {
        const res = {};
        for (const timeframe of Object.keys(TIMEFRAMES_TO_SECONDS)) {
            const propertyName = `${timeframe.toLowerCase()}PostCount`;
            const [from, to] = [Math.max(0, timestamp() - TIMEFRAMES_TO_SECONDS[timeframe]), timestamp()];
            const posts = commentsRaw
                .filter((comment) => comment.timestamp >= from && comment.timestamp <= to)
                .filter((comment) => comment.depth === 0);
            res[propertyName] = posts.length;
        }
        return res;
    }
    async querySubplebbitStats(trx) {
        const commentsRaw = await this._baseTransaction(trx)(TABLES.COMMENTS).select(["depth", "authorSignerAddress", "timestamp"]);
        const votesRaw = await this._baseTransaction(trx)(TABLES.VOTES).select(["timestamp", "authorSignerAddress"]);
        const res = { ...this._calcActiveUserCount(commentsRaw, votesRaw), ...this._calcPostCount(commentsRaw) };
        //@ts-expect-error
        return res;
    }
    async queryCommentsUnderComment(parentCid, trx) {
        return this._baseTransaction(trx)(TABLES.COMMENTS).where({ parentCid: parentCid });
    }
    async queryComment(cid, trx) {
        return this._baseTransaction(trx)(TABLES.COMMENTS).where("cid", cid).first();
    }
    async _queryCommentUpvote(cid, trx) {
        const upvotes = ((await this._baseTransaction(trx)(TABLES.VOTES).where({ commentCid: cid, vote: 1 }).count())[0]["count(*)"]);
        return upvotes;
    }
    async _queryCommentDownvote(cid, trx) {
        const downvotes = ((await this._baseTransaction(trx)(TABLES.VOTES).where({ commentCid: cid, vote: -1 }).count())[0]["count(*)"]);
        return downvotes;
    }
    async _queryCommentCounts(cid, trx) {
        const [replyCount, upvoteCount, downvoteCount] = await Promise.all([
            this.queryReplyCount(cid, trx),
            this._queryCommentUpvote(cid, trx),
            this._queryCommentDownvote(cid, trx)
        ]);
        return { replyCount, upvoteCount, downvoteCount };
    }
    async _queryAuthorEdit(cid, authorSignerAddress, trx) {
        const authorEdit = await this._baseTransaction(trx)(TABLES.COMMENT_EDITS)
            .select(AUTHOR_EDIT_FIELDS)
            .where({ commentCid: cid, authorSignerAddress, isAuthorEdit: true })
            .orderBy("id", "desc")
            .first();
        return authorEdit;
    }
    async _queryLatestModeratorReason(comment, trx) {
        const moderatorReason = await this._baseTransaction(trx)(TABLES.COMMENT_EDITS)
            .select("reason")
            .where("commentCid", comment.cid)
            .where({ isAuthorEdit: false })
            .whereNotNull("reason")
            .orderBy("id", "desc")
            .first();
        return moderatorReason;
    }
    async queryCommentFlags(cid, trx) {
        const res = Object.assign({}, ...(await Promise.all(["spoiler", "pinned", "locked", "removed"].map((field) => this._baseTransaction(trx)(TABLES.COMMENT_EDITS)
            .select(field)
            .where("commentCid", cid)
            .whereNotNull(field)
            .where("isAuthorEdit", false)
            .orderBy("id", "desc")
            .first()))));
        return res;
    }
    async queryAuthorEditDeleted(cid, trx) {
        const deleted = await this._baseTransaction(trx)(TABLES.COMMENT_EDITS)
            .select("deleted")
            .where("commentCid", cid)
            .whereNotNull("deleted")
            .orderBy("id", "desc")
            .first();
        return deleted;
    }
    async _queryModCommentFlair(comment, trx) {
        const latestFlair = await this._baseTransaction(trx)(TABLES.COMMENT_EDITS)
            .select("flair")
            .where("commentCid", comment.cid)
            .whereNotNull("flair")
            .where({ isAuthorEdit: false })
            .orderBy("id", "desc")
            .first();
        return latestFlair;
    }
    async _queryLastChildCidAndLastReplyTimestamp(comment, trx) {
        const lastChildCidRaw = await this._baseTransaction(trx)(TABLES.COMMENTS)
            .where("parentCid", comment.cid)
            .orderBy("id", "desc")
            .first();
        const lastReplyTimestamp = lastChildCidRaw ? await this.queryActiveScore(comment, trx) : undefined;
        return {
            lastChildCid: lastChildCidRaw ? lastChildCidRaw.cid : undefined,
            lastReplyTimestamp
        };
    }
    async queryCalculatedCommentUpdate(comment, trx) {
        const [authorSubplebbit, authorEdit, commentUpdateCounts, moderatorReason, commentFlags, commentModFlair, lastChildAndLastReplyTimestamp] = await Promise.all([
            this.querySubplebbitAuthor(comment.authorSignerAddress, trx),
            this._queryAuthorEdit(comment.cid, comment.authorSignerAddress, trx),
            this._queryCommentCounts(comment.cid, trx),
            this._queryLatestModeratorReason(comment, trx),
            this.queryCommentFlags(comment.cid, trx),
            this._queryModCommentFlair(comment, trx),
            this._queryLastChildCidAndLastReplyTimestamp(comment, trx)
        ]);
        return {
            cid: comment.cid,
            edit: authorEdit,
            ...commentUpdateCounts,
            flair: commentModFlair?.flair || authorEdit?.flair,
            ...commentFlags,
            ...moderatorReason,
            author: { subplebbit: authorSubplebbit },
            ...lastChildAndLastReplyTimestamp
        };
    }
    async queryLatestPostCid(trx) {
        return this._baseTransaction(trx)(TABLES.COMMENTS).select("cid").where({ depth: 0 }).orderBy("id", "desc").first();
    }
    async queryLatestCommentCid(trx) {
        return this._baseTransaction(trx)(TABLES.COMMENTS).select("cid").orderBy("id", "desc").first();
    }
    async queryAuthorModEdits(authorSignerAddress, trx) {
        const authorComments = await this._baseTransaction(trx)(TABLES.COMMENTS)
            .select("cid")
            .where("authorSignerAddress", authorSignerAddress);
        if (!Array.isArray(authorComments) || authorComments.length === 0)
            return {};
        const commentAuthorEdits = await this._baseTransaction(trx)(TABLES.COMMENT_EDITS)
            .select("commentAuthor")
            .whereIn("commentCid", authorComments.map((c) => c.cid))
            .whereNotNull("commentAuthor")
            .orderBy("id", "desc");
        const banAuthor = commentAuthorEdits.find((edit) => typeof edit.commentAuthor?.banExpiresAt === "number")?.commentAuthor;
        const authorFlairByMod = commentAuthorEdits.find((edit) => edit.commentAuthor?.flair)?.commentAuthor;
        return { ...banAuthor, ...authorFlairByMod };
    }
    async querySubplebbitAuthor(authorSignerAddress, trx) {
        const authorCommentCids = await this._baseTransaction(trx)(TABLES.COMMENTS)
            .select("cid")
            .where("authorSignerAddress", authorSignerAddress);
        if (authorCommentCids.length === 0)
            return undefined;
        const authorComments = [];
        for (const cidObj of authorCommentCids) {
            authorComments.push({
                ...(await this.queryComment(cidObj["cid"], trx)),
                upvoteCount: await this._queryCommentUpvote(cidObj["cid"], trx),
                downvoteCount: await this._queryCommentDownvote(cidObj["cid"], trx)
            });
        }
        const authorPosts = authorComments.filter((comment) => comment.depth === 0);
        const authorReplies = authorComments.filter((comment) => comment.depth > 0);
        const postScore = lodash.sumBy(authorPosts, (post) => post.upvoteCount) - lodash.sumBy(authorPosts, (post) => post.downvoteCount);
        const replyScore = lodash.sumBy(authorReplies, (reply) => reply.upvoteCount) - lodash.sumBy(authorReplies, (reply) => reply.downvoteCount);
        const lastCommentCid = lodash.maxBy(authorComments, (comment) => comment.id).cid;
        const firstCommentTimestamp = lodash.minBy(authorComments, (comment) => comment.id).timestamp;
        const modAuthorEdits = await this.queryAuthorModEdits(authorSignerAddress, trx);
        return {
            postScore,
            replyScore,
            lastCommentCid,
            ...modAuthorEdits,
            firstCommentTimestamp
        };
    }
    async changeDbFilename(oldDbName, newDbName) {
        const log = Logger("plebbit-js:db-handler:changeDbFilename");
        const oldPathString = path.join(this._subplebbit.plebbit.dataPath, "subplebbits", oldDbName);
        const newPath = path.format({ dir: path.dirname(oldPathString), base: newDbName });
        await fs.promises.mkdir(path.dirname(oldPathString), { recursive: true });
        this._currentTrxs = {};
        delete this["_knex"];
        delete this["_keyv"];
        await fs.promises.cp(oldPathString, newPath);
        if (os.type() === "Windows_NT")
            await deleteOldSubplebbitInWindows(oldPathString, this._subplebbit.plebbit);
        else
            await fs.promises.rm(oldPathString);
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
    // Start lock
    async lockSubStart(subAddress = this._subplebbit.address) {
        const log = Logger("plebbit-js:lock:start");
        const lockfilePath = path.join(this._subplebbit.plebbit.dataPath, "subplebbits", `${subAddress}.start.lock`);
        const subDbPath = path.join(this._subplebbit.plebbit.dataPath, "subplebbits", subAddress);
        try {
            await lockfile.lock(subDbPath, {
                lockfilePath,
                onCompromised: () => { } // Temporary bandaid for the moment. Should be deleted later
            });
            log(`Locked the start of subplebbit (${subAddress}) successfully`);
        }
        catch (e) {
            if (e.message === "Lock file is already being held")
                throwWithErrorCode("ERR_SUB_ALREADY_STARTED", { subplebbitAddress: subAddress });
            else {
                log(`Error while trying to lock start of sub (${subAddress}): ${e}`);
                throw e;
            }
        }
    }
    async unlockSubStart(subAddress = this._subplebbit.address) {
        const log = Logger("plebbit-js:lock:start");
        log.trace(`Attempting to unlock the start of sub (${subAddress})`);
        const lockfilePath = path.join(this._subplebbit.plebbit.dataPath, "subplebbits", `${subAddress}.start.lock`);
        const subDbPath = path.join(this._subplebbit.plebbit.dataPath, "subplebbits", subAddress);
        if (!fs.existsSync(lockfilePath) || !fs.existsSync(subDbPath))
            return;
        try {
            await lockfile.unlock(subDbPath, { lockfilePath });
            log(`Unlocked start of sub (${subAddress})`);
        }
        catch (e) {
            log(`Error while trying to unlock start of sub (${subAddress}): ${e}`);
            throw e;
        }
    }
    async isSubStartLocked(subAddress = this._subplebbit.address) {
        const lockfilePath = path.join(this._subplebbit.plebbit.dataPath, "subplebbits", `${subAddress}.start.lock`);
        const subDbPath = path.join(this._subplebbit.plebbit.dataPath, "subplebbits", subAddress);
        const isLocked = await lockfile.check(subDbPath, { lockfilePath, realpath: false, stale: 30000 });
        return isLocked;
    }
    // Subplebbit state lock
    async lockSubState(subAddress = this._subplebbit.address) {
        const log = Logger("plebbit-js:lock:lockSubState");
        const lockfilePath = path.join(this._subplebbit.plebbit.dataPath, "subplebbits", `${subAddress}.state.lock`);
        const subDbPath = path.join(this._subplebbit.plebbit.dataPath, "subplebbits", subAddress);
        try {
            await lockfile.lock(subDbPath, {
                lockfilePath,
                realpath: false,
                retries: 5,
                onCompromised: () => { }
            });
        }
        catch (e) {
            if (e.message === "Lock file is already being held")
                throwWithErrorCode("ERR_SUB_STATE_LOCKED", { subplebbitAddress: subAddress });
        }
    }
    async unlockSubState(subAddress = this._subplebbit.address) {
        const log = Logger("plebbit-js:lock:unlockSubState");
        const lockfilePath = path.join(this._subplebbit.plebbit.dataPath, "subplebbits", `${subAddress}.state.lock`);
        const subDbPath = path.join(this._subplebbit.plebbit.dataPath, "subplebbits", subAddress);
        if (!fs.existsSync(lockfilePath))
            return;
        await lockfile.unlock(subDbPath, { lockfilePath, realpath: false });
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
//# sourceMappingURL=db-handler.js.map