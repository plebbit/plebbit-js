import { hideClassPrivateProps, throwWithErrorCode, timestamp } from "../../../util.js";
import knex, { Knex } from "knex";
import path from "path";
import assert from "assert";
import fs from "fs";
import os from "os";
import Keyv from "keyv";
import Transaction = Knex.Transaction;
import type {
    CommentEditsTableRow,
    CommentEditsTableRowInsert,
    CommentModerationsTableRowInsert,
    CommentsTableRow,
    CommentsTableRowInsert,
    CommentUpdatesRow,
    CommentUpdatesTableRowInsert,
    VotesTableRow,
    VotesTableRowInsert
} from "../../../types.js";
import Logger from "@plebbit/plebbit-logger";
import { deleteOldSubplebbitInWindows, getDefaultSubplebbitDbConfig } from "../util.js";
import env from "../../../version.js";

//@ts-expect-error
import * as lockfile from "@plebbit/proper-lockfile";
import type { PageOptions } from "./page-generator.js";
import type { InternalSubplebbitRecordBeforeFirstUpdateType, SubplebbitStats } from "../../../subplebbit/types.js";
import { LocalSubplebbit } from "./local-subplebbit.js";
import { getPlebbitAddressFromPublicKey } from "../../../signer/util.js";
import * as remeda from "remeda";
import { CommentEditPubsubMessagePublicationSchema, CommentEditsTableRowSchema } from "../../../publications/comment-edit/schema.js";
import type { CommentEditPubsubMessagePublication } from "../../../publications/comment-edit/types.js";
import type { CommentIpfsType, CommentUpdateType, SubplebbitAuthor } from "../../../publications/comment/types.js";
import { TIMEFRAMES_TO_SECONDS } from "../../../pages/util.js";
import { CommentIpfsSchema, CommentUpdateSchema } from "../../../publications/comment/schema.js";
import { verifyCommentIpfs } from "../../../signer/signatures.js";
import { ModeratorOptionsSchema } from "../../../publications/comment-moderation/schema.js";
import type { PageIpfs } from "../../../pages/types.js";
import type { CommentModerationTableRow } from "../../../publications/comment-moderation/types.js";
import { getSubplebbitChallengeFromSubplebbitChallengeSettings } from "./challenges/index.js";
import KeyvSqlite from "@keyv/sqlite";

import { exec } from "child_process";
import { promisify } from "util";
import pLimit from "p-limit";

const execPromise = promisify(exec);

const TABLES = Object.freeze({
    COMMENTS: "comments",
    COMMENT_UPDATES: "commentUpdates",
    VOTES: "votes",
    COMMENT_MODERATIONS: "commentModerations",
    COMMENT_EDITS: "commentEdits"
});

// Add these type definitions at the top of the file, after the imports but before the DbHandler class
// Types for query results with prefixed columns
type CommentIpfsPrefixedColumns = {
    [K in keyof CommentsTableRow as `commentIpfs_${string & K}`]?: CommentsTableRow[K];
};

type CommentUpdatePrefixedColumns = {
    [K in keyof CommentUpdatesRow as `commentUpdate_${string & K}`]?: CommentUpdatesRow[K];
};

// Basic prefixed row type that can be extended as needed
type PrefixedCommentRow = CommentIpfsPrefixedColumns & CommentUpdatePrefixedColumns;

export class DbHandler {
    private _knex!: Knex;
    private _subplebbit!: LocalSubplebbit;
    private _currentTrxs!: Record<string, Transaction>; // Prefix to Transaction. Prefix represents all trx under a pubsub message or challenge
    private _dbConfig!: Knex.Config<any>;
    private _keyv!: Keyv;
    private _createdTables: boolean;

    constructor(subplebbit: DbHandler["_subplebbit"]) {
        this._subplebbit = subplebbit;
        this._currentTrxs = {};
        this._createdTables = false;
        hideClassPrivateProps(this);
    }

    async initDbConfigIfNeeded() {
        if (!this._dbConfig) this._dbConfig = await getDefaultSubplebbitDbConfig(this._subplebbit.address, this._subplebbit._plebbit);
    }

    toJSON() {
        return undefined;
    }

    async initDbIfNeeded() {
        const log = Logger("plebbit-js:local-subplebbit:db-handler:initDbIfNeeded");
        assert(
            typeof this._subplebbit.address === "string" && this._subplebbit.address.length > 0,
            `DbHandler needs to be an instantiated with a Subplebbit that has a valid address, (${this._subplebbit.address}) was provided`
        );
        await this.initDbConfigIfNeeded();
        const dbFilePath = <string>(<any>this._dbConfig.connection).filename;
        if (!this._knex) {
            this._knex = knex(this._dbConfig);
            log("initialized a new connection to db", dbFilePath);
        }
        if (!this._keyv) this._keyv = new Keyv(new KeyvSqlite(`sqlite://${dbFilePath}`));
    }

    async createOrMigrateTablesIfNeeded() {
        const log = Logger("plebbit-js:local-subplebbit:db-handler:createOrMigrateTablesIfNeeded");
        if (this._createdTables) return;

        try {
            await this._createOrMigrateTablesIfNeeded();
        } catch (e) {
            await this.initDbIfNeeded();
            log.error(
                `Sub (${
                    this._subplebbit.address
                }) failed to create/migrate tables. Current db version (${await this.getDbVersion()}), latest db version (${
                    env.DB_VERSION
                }). Error`,
                e
            );
            await this.destoryConnection();
            throw e;
        }
        hideClassPrivateProps(this);
    }

    getDbConfig(): Knex.Config {
        return this._dbConfig;
    }

    async keyvGet(key: string) {
        const res = await this._keyv.get(key);
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
        const log = Logger("plebbit-js:local-subplebbit:dbHandler:destroyConnection");
        if (this._knex) await this._knex.destroy();
        if (this._keyv) await this._keyv.disconnect();

        //@ts-expect-error
        this._knex = this._keyv = undefined;

        log("Destroyed DB connection to sub", this._subplebbit.address, "successfully");
    }

    async createTransaction(transactionId: string): Promise<Transaction> {
        assert(!this._currentTrxs[transactionId]);
        const trx = await this._knex.transaction();
        this._currentTrxs[transactionId] = trx;
        return trx;
    }

    async commitTransaction(transactionId: string) {
        const trx: Transaction = this._currentTrxs[transactionId];
        // assert(trx && trx.isTransaction && !trx.isCompleted(), `Transaction (${transactionId}) needs to be stored to commit`);
        await this._currentTrxs[transactionId].commit();
        delete this._currentTrxs[transactionId];
    }

    async rollbackTransaction(transactionId: string) {
        const log = Logger("plebbit-js:local-subplebbit:db-handler:rollbackTransaction");

        const trx: Transaction = this._currentTrxs[transactionId];
        if (trx) {
            assert(trx.isTransaction, `Transaction (${transactionId}) needs to be stored to rollback`);
            if (trx.isCompleted()) {
                delete this._currentTrxs[transactionId];
                return;
            }

            try {
                await this._currentTrxs[transactionId].rollback();
            } catch (e) {
                log.error(`Failed to rollback transaction (${transactionId}) due to error`, e);
            } finally {
                delete this._currentTrxs[transactionId];
            }
        }

        log.trace(
            `Rolledback transaction (${transactionId}), this._currentTrxs[transactionId].length = ${remeda.keys.strict(this._currentTrxs).length}`
        );
    }

    async rollbackAllTransactions() {
        for (const trxId of remeda.keys.strict(this._currentTrxs)) await this.rollbackTransaction(trxId);
    }

    private _baseTransaction(trx?: Transaction): Transaction | Knex {
        return trx ? trx : this._knex;
    }

    private async _createCommentsTable(tableName: string) {
        await this._knex.schema.createTable(tableName, (table) => {
            table.text("cid").notNullable().primary().unique();
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
            table.text("previousCid").nullable(); // it's not a foreign key because it's possible to purge the comment pointed to by previousCid. It's optimisc
            table.text("subplebbitAddress").notNullable();
            table.text("content").nullable();
            table.timestamp("timestamp").notNullable();
            table.json("signature").notNullable(); // Will contain {signature, public key, type}
            table.text("title").nullable();
            table.integer("depth").notNullable();

            table.text("linkHtmlTagName").nullable();

            table.json("flair").nullable();

            table.boolean("spoiler").nullable();
            table.boolean("nsfw").nullable();

            table.json("extraProps").nullable(); // this column will store props that is not recognized by the sub

            table.text("protocolVersion").notNullable();

            table.increments("id"); // Used for sorts
            table.timestamp("insertedAt").defaultTo(this._knex.raw("(strftime('%s', 'now'))")); // Timestamp of when it was first inserted in the table
        });
    }

    private async _createCommentUpdatesTable(tableName: string) {
        await this._knex.schema.createTable(tableName, (table) => {
            table.text("cid").notNullable().primary().unique().references("cid").inTable(TABLES.COMMENTS); // this refers to the cid of CommentIpfs, in tables comments

            table.json("edit").nullable();
            table.integer("upvoteCount").notNullable();
            table.integer("downvoteCount").notNullable();

            table.integer("replyCount").notNullable();
            table.json("flair").nullable();
            table.boolean("spoiler").nullable();
            table.boolean("nsfw").nullable();
            table.boolean("pinned").nullable();
            table.boolean("locked").nullable();
            table.boolean("removed").nullable();
            table.text("reason").nullable();
            table.timestamp("updatedAt").notNullable().checkPositive();
            table.text("protocolVersion").notNullable();
            table.json("signature").notNullable(); // Will contain {signature, public key, type}
            table.json("author").nullable();
            table.json("replies").nullable(); // TODO we should not be storing replies here, it takes too much storage
            table.text("lastChildCid").nullable();
            table.timestamp("lastReplyTimestamp").nullable();

            // Not part of CommentUpdate, this is stored to keep track of where the CommentUpdate is in the ipfs node
            table.integer("postUpdatesBucket").nullable(); // the post updates bucket of post CommentUpdate, not applicable to replies
            table.text("postCommentUpdateCid").nullable(); // the cid of CommentUpdate, cidv0, not applicable to replies
            table.boolean("publishedToPostUpdatesMFS").notNullable(); // we need to keep track of whether the comment update has been published to ipfs postUpdates

            // Columns with defaults
            table.timestamp("insertedAt").defaultTo(this._knex.raw("(strftime('%s', 'now'))")); // Timestamp of when it was first inserted in the table
        });
    }

    private async _createVotesTable(tableName: string) {
        await this._knex.schema.createTable(tableName, (table) => {
            table.text("commentCid").notNullable().references("cid").inTable(TABLES.COMMENTS);
            table.text("authorSignerAddress").notNullable();
            table.timestamp("timestamp").checkPositive().notNullable();
            table.tinyint("vote").checkBetween([-1, 1]).notNullable();
            table.text("protocolVersion").notNullable();
            table.timestamp("insertedAt").defaultTo(this._knex.raw("(strftime('%s', 'now'))")); // Timestamp of when it was first inserted in the table
            table.json("extraProps").nullable(); // this column will store props that is not recognized by the sub

            table.primary(["commentCid", "authorSignerAddress"]); // An author can't have multiple votes on a comment
        });
    }

    private async _createCommentEditsTable(tableName: string) {
        await this._knex.schema.createTable(tableName, (table) => {
            table.text("commentCid").notNullable().references("cid").inTable(TABLES.COMMENTS);
            table.text("authorSignerAddress").notNullable();
            table.json("author").notNullable();
            table.json("signature").notNullable();
            table.text("protocolVersion").notNullable();
            table.text("subplebbitAddress").notNullable();
            table.increments("id"); // Used for sorts

            table.timestamp("timestamp").checkPositive().notNullable();
            table.text("content").nullable();
            table.text("reason").nullable();
            table.boolean("deleted").nullable();
            table.json("flair").nullable();
            table.boolean("spoiler").nullable();
            table.boolean("nsfw").nullable();
            table.boolean("isAuthorEdit").notNullable(); // if edit is signed by original author

            table.timestamp("insertedAt").defaultTo(this._knex.raw("(strftime('%s', 'now'))")); // Timestamp of when it was first inserted in the table

            table.json("extraProps").nullable();
            table.primary(["id", "commentCid"]);
        });
    }

    private async _createCommentModerationsTable(tableName: string) {
        await this._knex.schema.createTable(tableName, (table) => {
            table.text("commentCid").notNullable(); // from commentModerationPublication.commentCid. It's not a foreign key because when we purge a comment we still want to maintain its moderation rows for further inspection
            table.json("author").notNullable(); // commentModerationPublication.author
            table.json("signature").notNullable(); // from commentModerationPublication.signature
            table.text("modSignerAddress").notNullable(); // calculated from commentModerationPublication.signatuer.publicKey
            table.text("protocolVersion").notNullable(); // from commentModerationPublication.protocolVersion
            table.increments("id"); // Used for sorts
            table.text("subplebbitAddress").notNullable();

            table.timestamp("timestamp").checkPositive().notNullable(); // from commentModerationPublication.timestamp
            table.json("commentModeration").notNullable(); // commentModerationPublication.commentModeration, should take extra props

            table.timestamp("insertedAt").defaultTo(this._knex.raw("(strftime('%s', 'now'))")); // Timestamp of when it was first inserted in the table

            table.json("extraProps").nullable();
            table.primary(["id", "commentCid"]);
        });
    }

    async getDbVersion(): Promise<number> {
        return Number((await this._knex.raw("PRAGMA user_version"))[0]["user_version"]);
    }

    _migrateOldSettings(oldSettings: InternalSubplebbitRecordBeforeFirstUpdateType["settings"]) {
        // need to remove settings.challenges.exclude.{post, vote, reply}
        const fieldsToRemove = ["post", "reply", "vote"] as const;
        const newSettings = remeda.clone(oldSettings);
        if (Array.isArray(newSettings.challenges))
            for (const oldChallengeSetting of newSettings.challenges)
                if (oldChallengeSetting.exclude)
                    for (const oldExcludeSetting of oldChallengeSetting.exclude)
                        for (const fieldToMove of fieldsToRemove) delete oldExcludeSetting[fieldToMove];

        return newSettings;
    }

    async _createOrMigrateTablesIfNeeded() {
        const log = Logger("plebbit-js:local-subplebbit:db-handler:createOrMigrateTablesIfNeeded");

        const currentDbVersion = await this.getDbVersion();

        log.trace(`current db version: ${currentDbVersion}`);
        const needToMigrate = currentDbVersion < env.DB_VERSION;
        //@ts-expect-error
        const dbPath = <string>this._dbConfig.connection.filename;
        let backupDbPath: string | undefined;
        const dbExistsAlready = fs.existsSync(dbPath);
        if (needToMigrate) {
            if (dbExistsAlready && currentDbVersion > 0) {
                await this.destoryConnection();
                backupDbPath = path.join(
                    path.dirname(dbPath),
                    ".backup_before_migration",
                    `${path.basename(dbPath)}.${currentDbVersion}.${timestamp()}`
                );
                log(`Copying db ${path.basename(dbPath)} to ${backupDbPath} before migration`);

                if (!fs.existsSync(path.dirname(backupDbPath))) await fs.promises.mkdir(path.dirname(backupDbPath));
                await fs.promises.cp(dbPath, backupDbPath);
                await this.initDbIfNeeded();
            }
            await this._knex.raw("PRAGMA foreign_keys = OFF");

            // Remove unneeded tables
            await Promise.all(
                ["challengeRequests", "challenges", "challengeAnswers", "challengeVerifications", "signers"].map((tableName) =>
                    this._knex.schema.dropTableIfExists(tableName)
                )
            );

            await this._knex.schema.dropTableIfExists(TABLES.COMMENT_UPDATES); // To trigger an update
            if (currentDbVersion <= 16 && (await this._knex.schema.hasTable(TABLES.COMMENT_EDITS)))
                await this._moveCommentEditsToModAuthorTables();
        }

        const createTableFunctions = [
            this._createCommentsTable,
            this._createCommentUpdatesTable,
            this._createVotesTable,
            this._createCommentModerationsTable,
            this._createCommentEditsTable
        ];
        const tables = Object.values(TABLES);

        for (let i = 0; i < tables.length; i++) {
            const tableName = tables[i];
            const tableExists = await this._knex.schema.hasTable(tableName);
            if (!tableExists) {
                log(`Table ${tableName} does not exist. Will create schema`);
                await createTableFunctions[i].bind(this)(tableName);
            } else if (tableExists && needToMigrate) {
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
            if (currentDbVersion <= 15) await this._purgeCommentsWithInvalidSchemaOrSignature();
            await this._knex.raw("PRAGMA foreign_keys = ON");
            await this._knex.raw(`PRAGMA user_version = ${env.DB_VERSION}`);
            await this._knex.raw(`VACUUM;`); // make sure we're not using extra space
            // we need to remove posts because it may include old incompatible comments
            // LocalSubplebbit will automatically produce a new posts json
            //@ts-expect-error
            const internalState = await this._subplebbit._getDbInternalState(false);
            if (internalState) {
                const protocolVersion = internalState.protocolVersion || env.PROTOCOL_VERSION;
                const _usingDefaultChallenge =
                    "_usingDefaultChallenge" in internalState
                        ? internalState._usingDefaultChallenge //@ts-expect-error
                        : remeda.isDeepEqual(this._subplebbit._defaultSubplebbitChallenges, internalState?.settings?.challenges);
                const updateCid =
                    ("updateCid" in internalState && internalState.updateCid) || "QmYHzA8euDgUpNy3fh7JRwpPwt6jCgF35YTutYkyGGyr8f"; // this is a random cid, should be overridden later by local-subplebbit

                const newSettings = this._migrateOldSettings(internalState.settings);

                const newChallenges = newSettings.challenges?.map(getSubplebbitChallengeFromSubplebbitChallengeSettings);
                await this._subplebbit._updateDbInternalState({
                    posts: undefined,
                    challenges: newChallenges,
                    settings: newSettings,
                    updateCid,
                    protocolVersion,
                    _usingDefaultChallenge
                });
            }
        }
        const newDbVersion = await this.getDbVersion();
        assert.equal(newDbVersion, env.DB_VERSION);
        this._createdTables = true;
        if (needToMigrate)
            log(
                `Created/migrated the tables to the latest (${newDbVersion}) version and saved to path`, //@ts-expect-error
                this._dbConfig.connection!.filename
            );
        if (backupDbPath) await fs.promises.rm(backupDbPath);
    }

    private async _copyTable(srcTable: string, dstTable: string, currentDbVersion: number) {
        const log = Logger("plebbit-js:local-subplebbit:db-handler:createTablesIfNeeded:copyTable");
        const dstTableColumns = remeda.keys.strict(await this._knex(dstTable).columnInfo());
        const srcRecords: any[] = await this._knex(srcTable).select("*");
        if (srcRecords.length > 0) {
            log(`Attempting to copy ${srcRecords.length} ${srcTable}`);
            // Need to make sure that array fields are json strings
            for (const srcRecord of srcRecords) {
                for (const srcRecordKey of remeda.keys.strict(srcRecord))
                    if (Array.isArray(srcRecord[srcRecordKey])) {
                        srcRecord[srcRecordKey] = JSON.stringify(srcRecord[srcRecordKey]);
                        assert(srcRecord[srcRecordKey] !== "[object Object]", "DB value shouldn't be [object Object]");
                    }
                // Migration from version 10 to 11
                if (currentDbVersion <= 11 && srcTable === TABLES.COMMENT_EDITS) {
                    // Need to compute isAuthorEdit column
                    const editWithType = <Omit<CommentEditsTableRow, "isAuthorEdit">>srcRecord;
                    const commentToBeEdited = await this.queryComment(editWithType.commentCid);
                    if (!commentToBeEdited) throw Error("Failed to compute isAuthorEdit column");
                    const editHasBeenSignedByOriginalAuthor = editWithType.signature.publicKey === commentToBeEdited.signature.publicKey;
                    srcRecord["isAuthorEdit"] = editHasBeenSignedByOriginalAuthor;
                }

                if (currentDbVersion <= 12 && srcRecord["authorAddress"]) {
                    srcRecord["authorSignerAddress"] = await getPlebbitAddressFromPublicKey(srcRecord["signature"]["publicKey"]);
                }

                if (srcTable === TABLES.COMMENTS && srcRecord["ipnsName"])
                    srcRecord.extraProps = { ...srcRecord.extraProps, ipnsName: srcRecord.ipnsName };
            }

            // Remove fields that are not in dst table. Will prevent errors when migration from db version 2 to 3

            const srcRecordFiltered = srcRecords.map((record) => remeda.pick(record, dstTableColumns));
            for (const srcRecord of srcRecordFiltered) await this._knex(dstTable).insert(srcRecord);
        }
        log(`copied table ${srcTable} to table ${dstTable}`);
    }

    private async _purgeCommentsWithInvalidSchemaOrSignature() {
        const log = Logger("plebbit-js:local-subplebbit:db-handler:_purgeCommentsWithInvalidSchema");
        for (const commentRecord of await this.queryAllCommentsOrderedByIdAsc()) {
            // Need to purge records with invalid schema out of the table
            try {
                CommentIpfsSchema.strip().parse(commentRecord);
            } catch (e) {
                log.error(
                    `Comment (${commentRecord.cid}) in DB has an invalid schema, will be purged along with comment update, votes and children comments`
                );
                await this.purgeComment(commentRecord.cid);
                continue;
            }

            // Purge comments with invalid signature

            const validRes = await verifyCommentIpfs({
                comment: { ...commentRecord, ...commentRecord.extraProps },
                resolveAuthorAddresses: false,
                calculatedCommentCid: commentRecord.cid,
                clientsManager: this._subplebbit._clientsManager,
                overrideAuthorAddressIfInvalid: false
            });
            if (!validRes.valid) {
                log.error(
                    `Comment`,
                    commentRecord.cid,
                    `in DB has invalid signature due to`,
                    validRes.reason,
                    `It will be purged along with its children commentUpdate, votes, comments`
                );
                await this.purgeComment(commentRecord.cid);
            }
        }
    }

    private async _moveCommentEditsToModAuthorTables() {
        // Prior to db version 17, all comment edits, author and mod's were in the same table
        // code below will split them to their separate tables
        await this._createCommentModerationsTable(TABLES.COMMENT_MODERATIONS);
        const allCommentEdits = await this._knex(TABLES.COMMENT_EDITS);
        const commentModerationFields = remeda.keys.strict(ModeratorOptionsSchema.shape);
        const modEditsIds: number[] = [];
        for (const commentEdit of allCommentEdits) {
            const commentToBeEdited = await this.queryComment(commentEdit.commentCid);
            if (!commentToBeEdited) throw Error("Failed to compute isAuthorEdit column");
            const editHasBeenSignedByOriginalAuthor = commentEdit.signature.publicKey === commentToBeEdited.signature.publicKey;
            if (editHasBeenSignedByOriginalAuthor) continue;

            const modSignerAddress = await getPlebbitAddressFromPublicKey(commentEdit.signature.publicKey);

            // We're only interested in mod edits

            const baseProps = remeda.pick(commentEdit, [
                "extraProps",
                "insertedAt",
                "id",
                "subplebbitAddress",
                "commentCid",
                "author",
                "signature",
                "protocolVersion",
                "timestamp"
            ]);

            const moderationRow = {
                ...baseProps,
                modSignerAddress,
                //@ts-expect-error
                commentModeration: { ...remeda.pick(commentEdit, commentModerationFields), author: commentEdit.commentAuthor }
            };
            await this._knex(TABLES.COMMENT_MODERATIONS).insert(moderationRow);
            modEditsIds.push(commentEdit.id);
        }

        const removedRows = await this._knex(TABLES.COMMENT_EDITS)
            .whereIn("id", modEditsIds)
            .orWhereNotNull("removed")
            .orWhereNotNull("pinned")
            .orWhereNotNull("locked")
            .orWhereNotNull("commentAuthor")
            .del();
        console.log(removedRows);
    }

    async deleteVote(
        authorSignerAddress: VotesTableRow["authorSignerAddress"],
        commentCid: VotesTableRow["commentCid"],
        trx?: Transaction
    ) {
        await this._baseTransaction(trx)(TABLES.VOTES)
            .where("commentCid", commentCid)
            .where("authorSignerAddress", authorSignerAddress)
            .del();
    }

    async insertVote(vote: VotesTableRowInsert, trx?: Transaction) {
        await this._baseTransaction(trx)(TABLES.VOTES).insert(vote);
    }

    async insertComment(comment: CommentsTableRowInsert, trx?: Transaction) {
        await this._baseTransaction(trx)(TABLES.COMMENTS).insert(comment);
    }

    async upsertCommentUpdate(update: CommentUpdatesTableRowInsert, trx?: Transaction) {
        await this._baseTransaction(trx)(TABLES.COMMENT_UPDATES).insert(update).onConflict(["cid"]).merge();
    }

    async insertCommentModeration(moderation: CommentModerationsTableRowInsert, trx?: Transaction) {
        await this._baseTransaction(trx)(TABLES.COMMENT_MODERATIONS).insert(moderation);
    }

    async insertCommentEdit(edit: CommentEditsTableRowInsert, trx?: Transaction) {
        await this._baseTransaction(trx)(TABLES.COMMENT_EDITS).insert(edit);
    }

    async queryVote(commentCid: string, authorSignerAddress: string, trx?: Transaction): Promise<VotesTableRow | undefined> {
        return this._baseTransaction(trx)(TABLES.VOTES)
            .where({
                commentCid: commentCid,
                authorSignerAddress
            })
            .first();
    }

    private _basePageQuery(
        options: Omit<PageOptions, "pageSize" | "preloadedPage" | "baseTimestamp" | "firstPageSizeBytes">,
        trx?: Transaction
    ) {
        let query = this._baseTransaction(trx)(TABLES.COMMENTS)
            .innerJoin(TABLES.COMMENT_UPDATES, `${TABLES.COMMENTS}.cid`, `${TABLES.COMMENT_UPDATES}.cid`)
            .jsonExtract(`${TABLES.COMMENT_UPDATES}.edit`, "$.deleted", "deleted", true)
            .where("parentCid", options.parentCid);

        if (options.excludeCommentsWithDifferentSubAddress) query = query.where({ subplebbitAddress: this._subplebbit.address });
        if (options.excludeRemovedComments) query = query.andWhereRaw(`${TABLES.COMMENT_UPDATES}.removed is not 1`);
        if (options.excludeDeletedComments) query = query.andWhereRaw("`deleted` is not 1");

        return query;
    }

    async queryMaximumTimestampUnderComment(comment: Pick<CommentsTableRow, "cid" | "timestamp">, trx?: Transaction): Promise<number> {
        // Using a recursive CTE to find the maximum timestamp among the comment and all its descendants
        // This excludes comments that:
        // 1. Have a different subplebbitAddress than the current subplebbit
        // 2. Are marked as removed in the comment updates table
        // 3. Are marked as deleted in the edit field
        const query = `
            WITH RECURSIVE descendants AS (
                -- Base case: the comment itself
                SELECT cid, timestamp 
                FROM ${TABLES.COMMENTS}
                WHERE cid = ?
                
                UNION ALL
                
                -- Recursive case: all descendants (replies and replies to replies)
                SELECT c.cid, c.timestamp
                FROM ${TABLES.COMMENTS} c
                INNER JOIN ${TABLES.COMMENT_UPDATES} cu ON c.cid = cu.cid
                LEFT JOIN (
                    SELECT cid, json_extract(edit, '$.deleted') AS deleted 
                    FROM ${TABLES.COMMENT_UPDATES}
                ) AS d ON c.cid = d.cid
                JOIN descendants desc ON c.parentCid = desc.cid
                WHERE c.subplebbitAddress = ?
                AND cu.removed IS NOT 1
                AND d.deleted IS NOT 1
            )
            SELECT MAX(timestamp) AS max_timestamp FROM descendants
        `;

        type QueryResult = { max_timestamp: number }[];
        const result = await this._baseTransaction(trx).raw<QueryResult>(query, [comment.cid, this._subplebbit.address]);

        // Return the max timestamp or the comment's timestamp if no descendants found
        return result[0]?.max_timestamp || comment.timestamp;
    }

    async queryPageComments(options: Omit<PageOptions, "firstPageSizeBytes">, trx?: Transaction): Promise<PageIpfs["comments"]> {
        // protocolVersion, signature

        const commentUpdateColumns = <(keyof CommentUpdateType)[]>(
            remeda.keys.strict(
                options.commentUpdateFieldsToExclude
                    ? remeda.omit(CommentUpdateSchema.shape, options.commentUpdateFieldsToExclude)
                    : CommentUpdateSchema.shape
            )
        );
        const commentUpdateColumnSelects = commentUpdateColumns.map((col) => `${TABLES.COMMENT_UPDATES}.${col} AS commentUpdate_${col}`);

        const commentIpfsColumns = [...remeda.keys.strict(CommentIpfsSchema.shape), "extraProps"];
        const commentIpfsColumnSelects = commentIpfsColumns.map((col) => `${TABLES.COMMENTS}.${col} AS commentIpfs_${col}`);

        // Now use this type for the query result
        const commentsRaw = (await this._basePageQuery(options, trx).select([
            ...commentIpfsColumnSelects,
            ...commentUpdateColumnSelects
        ])) as PrefixedCommentRow[];

        // this one liner below is a hack to make sure pageIpfs.comments.comment always correspond to commentUpdate.cid
        // postCid is not part of CommentIpfs when depth = 0, because it is the post
        for (const commentRaw of commentsRaw) if (commentRaw["commentIpfs_depth"] === 0) delete commentRaw["commentIpfs_postCid"];

        const comments: PageIpfs["comments"] = commentsRaw.map((commentRaw) => ({
            comment: remeda.mapKeys(
                // we need to exclude extraProps from pageIpfs.comments[0].comment
                // parseDbResponses should automatically include the spread of commentTableRow.extraProps in the object
                remeda.pickBy(commentRaw, (value, key) => key.startsWith("commentIpfs_") && !key.endsWith("extraProps")),
                (key, value) => key.replace("commentIpfs_", "")
            ) as CommentIpfsType,
            commentUpdate: remeda.mapKeys(
                remeda.pickBy(commentRaw, (value, key) => key.startsWith("commentUpdate_")),
                (key, value) => key.replace("commentUpdate_", "")
            ) as CommentUpdateType
        }));

        return comments;
    }

    async queryFlattenedPageReplies(
        options: Omit<PageOptions, "firstPageSizeBytes"> & { parentCid: string },
        trx?: Transaction
    ): Promise<PageIpfs["comments"]> {
        // Get columns to select with proper prefixes
        const commentUpdateColumns = <(keyof CommentUpdateType)[]>(
            remeda.keys.strict(
                options.commentUpdateFieldsToExclude
                    ? remeda.omit(CommentUpdateSchema.shape, options.commentUpdateFieldsToExclude)
                    : CommentUpdateSchema.shape
            )
        );
        const commentUpdateColumnSelects = commentUpdateColumns.map((col) => `c_updates.${col} AS commentUpdate_${col}`);

        const commentIpfsColumns = [...remeda.keys.strict(CommentIpfsSchema.shape), "extraProps"];
        const commentIpfsColumnSelects = commentIpfsColumns.map((col) => `comments.${col} AS commentIpfs_${col}`);

        // Count exactly how many parameters we'll need for proper binding
        let paramCount = 1; // Start with 1 for the parentCid
        const whereConditions = {
            base: [] as string[],
            recursive: [] as string[]
        };

        if (options.excludeCommentsWithDifferentSubAddress) {
            whereConditions.base.push(`comments.subplebbitAddress = ?`);
            whereConditions.recursive.push(`comments.subplebbitAddress = ?`);
            paramCount += 2; // One for base, one for recursive
        }

        if (options.excludeRemovedComments) {
            whereConditions.base.push(`c_updates.removed IS NOT 1`);
            whereConditions.recursive.push(`c_updates.removed IS NOT 1`);
            // No parameters added
        }

        if (options.excludeDeletedComments) {
            whereConditions.base.push(`d.deleted IS NOT 1`);
            whereConditions.recursive.push(`d.deleted IS NOT 1`);
            // No parameters added
        }

        // Build the base and recursive WHERE conditions
        const baseWhereClause = whereConditions.base.length ? `AND ${whereConditions.base.join(" AND ")}` : "";

        const recursiveWhereClause = whereConditions.recursive.length ? `AND ${whereConditions.recursive.join(" AND ")}` : "";

        // Build a recursive CTE query that flattens the comment tree
        const query = `
            WITH RECURSIVE comment_tree AS (
                -- Base case: first level replies to the parent comment
                SELECT 
                    comments.*, 
                    c_updates.*,
                    0 AS tree_level 
                FROM ${TABLES.COMMENTS} comments
                INNER JOIN ${TABLES.COMMENT_UPDATES} c_updates ON comments.cid = c_updates.cid
                LEFT JOIN (
                    SELECT cid, json_extract(edit, '$.deleted') AS deleted 
                    FROM ${TABLES.COMMENT_UPDATES}
                ) AS d ON comments.cid = d.cid
                WHERE comments.parentCid = ? ${baseWhereClause}
                
                UNION ALL
                
                -- Recursive case: replies to replies
                SELECT 
                    comments.*, 
                    c_updates.*,
                    tree.tree_level + 1
                FROM ${TABLES.COMMENTS} comments
                INNER JOIN ${TABLES.COMMENT_UPDATES} c_updates ON comments.cid = c_updates.cid
                LEFT JOIN (
                    SELECT cid, json_extract(edit, '$.deleted') AS deleted 
                    FROM ${TABLES.COMMENT_UPDATES}
                ) AS d ON comments.cid = d.cid
                INNER JOIN comment_tree tree ON comments.parentCid = tree.cid
                WHERE 1=1 ${recursiveWhereClause}
            )
            -- Select all fields with aliases for proper mapping
            SELECT 
                ${commentIpfsColumnSelects.join(",\n")},
                ${commentUpdateColumnSelects.join(",\n")}
            FROM comment_tree comments
            JOIN ${TABLES.COMMENT_UPDATES} c_updates ON comments.cid = c_updates.cid
            ORDER BY tree_level, comments.id -- Sort by tree level to maintain hierarchy, then by ID
        `;

        // Prepare parameters with exact count
        const params = [options.parentCid];

        if (options.excludeCommentsWithDifferentSubAddress) {
            params.push(this._subplebbit.address); // For base query
            params.push(this._subplebbit.address); // For recursive query
        }

        // Execute the query

        type FlattenedCommentRow = CommentIpfsPrefixedColumns &
            CommentUpdatePrefixedColumns & {
                tree_level: number;
            };

        // Verify parameter count matches expected count
        if (params.length !== paramCount) {
            throw new Error(`Parameter count mismatch: Expected ${paramCount}, got ${params.length}`);
        }

        // Use raw query for optimal performance
        const rawQuery = await this._baseTransaction(trx).raw(query, params);
        const commentsRaw = rawQuery as unknown as FlattenedCommentRow[];

        // Handle post_cid for posts (depth = 0), following queryPageComments approach
        for (const commentRaw of commentsRaw) if (commentRaw["commentIpfs_depth"] === 0) delete commentRaw["commentIpfs_postCid"];

        // Format results to match PageIpfs["comments"]
        const comments: PageIpfs["comments"] = commentsRaw.map((commentRaw) => ({
            comment: remeda.mapKeys(
                // Exclude extraProps from pageIpfs.comments[0].comment
                remeda.pickBy(commentRaw, (value, key) => key.startsWith("commentIpfs_") && !key.endsWith("extraProps")),
                (key, value) => key.replace("commentIpfs_", "")
            ) as CommentIpfsType,
            commentUpdate: remeda.mapKeys(
                remeda.pickBy(commentRaw, (value, key) => key.startsWith("commentUpdate_")),
                (key, value) => key.replace("commentUpdate_", "")
            ) as CommentUpdateType
        }));

        return comments;
    }

    async queryStoredCommentUpdate(comment: Pick<CommentsTableRow, "cid">, trx?: Transaction): Promise<CommentUpdatesRow | undefined> {
        return this._baseTransaction(trx)(TABLES.COMMENT_UPDATES).where("cid", comment.cid).first();
    }

    async queryCommentBySignatureEncoded(signatureEncoded: string, trx?: Transaction) {
        const comment = await this._baseTransaction(trx)(TABLES.COMMENTS)
            .whereJsonPath("signature", "$.signature", "=", signatureEncoded)
            .first();

        return comment;
    }

    async queryCommentModerationBySignatureEncoded(signatureEncoded: string, trx?: Transaction) {
        const commentMod = await this._baseTransaction(trx)(TABLES.COMMENT_MODERATIONS)
            .whereJsonPath("signature", "$.signature", "=", signatureEncoded)
            .first();

        return commentMod;
    }

    async queryCommentEditBySignatureEncoded(signatureEncoded: string, trx?: Transaction) {
        const commentEdit = await this._baseTransaction(trx)(TABLES.COMMENT_EDITS)
            .whereJsonPath("signature", "$.signature", "=", signatureEncoded)
            .first();

        return commentEdit;
    }

    async queryParentsCids(rootComment: Pick<CommentsTableRow, "parentCid">, trx?: Transaction): Promise<Pick<CommentsTableRow, "cid">[]> {
        // If there's no parent CID, return an empty array
        if (!rootComment.parentCid) return [];

        // Define the type for the query result
        type ParentChainRow = {
            cid: string;
        };

        // Use a recursive CTE to get the entire parent chain up to the root post
        const query = `
            WITH RECURSIVE parent_chain AS (
                -- Base case: start with the immediate parent
                SELECT cid, parentCid, 0 AS level
                FROM ${TABLES.COMMENTS}
                WHERE cid = ?
                
                UNION ALL
                
                -- Recursive case: traverse up to parent until we reach the root
                SELECT c.cid, c.parentCid, pc.level + 1
                FROM ${TABLES.COMMENTS} c
                JOIN parent_chain pc ON c.cid = pc.parentCid
            )
            -- Select all parents in the chain from immediate parent to root
            SELECT cid FROM parent_chain
            ORDER BY level
        `;

        // Execute the query with the parent CID as parameter and specify the result type
        const result = await this._baseTransaction(trx).raw<ParentChainRow[]>(query, [rootComment.parentCid]);

        // Map the results to the expected format with proper typing
        return result.map((row: ParentChainRow) => ({ cid: row.cid }));
    }

    async queryCommentsToBeUpdated(trx?: Transaction): Promise<CommentsTableRow[]> {
        // Criteria:
        // 1 - Comment has no row in commentUpdates (has never published CommentUpdate) or commentUpdate.publishedToPostUpdatesMFS is false OR
        // 2 - commentUpdate.updatedAt is less or equal to max of insertedAt of child votes, comments or commentEdit or CommentModeration OR
        // 3 - Comments that new votes, CommentEdit, commentModeration or other comments were published under them

        // After retrieving all comments with any of criteria above, also add their parents to the list to update
        // Also for each comment, add the previous comments of its author to update them too

        const criteriaOne: CommentsTableRow[] = await this._baseTransaction(trx)(TABLES.COMMENTS)
            .select(`${TABLES.COMMENTS}.*`)
            .leftJoin(TABLES.COMMENT_UPDATES, `${TABLES.COMMENTS}.cid`, `${TABLES.COMMENT_UPDATES}.cid`)
            .whereNull(`${TABLES.COMMENT_UPDATES}.updatedAt`)
            .orWhere(`${TABLES.COMMENT_UPDATES}.publishedToPostUpdatesMFS`, false);
        const lastUpdatedAtWithBuffer = this._knex.raw("`lastUpdatedAt` - 1");
        // @ts-expect-error
        const criteriaTwoThree: CommentsTableRow[] = await this._baseTransaction(trx)(TABLES.COMMENTS)
            .select(`${TABLES.COMMENTS}.*`)
            .innerJoin(TABLES.COMMENT_UPDATES, `${TABLES.COMMENTS}.cid`, `${TABLES.COMMENT_UPDATES}.cid`)
            .leftJoin(TABLES.VOTES, `${TABLES.COMMENTS}.cid`, `${TABLES.VOTES}.commentCid`)
            .leftJoin(TABLES.COMMENT_MODERATIONS, `${TABLES.COMMENTS}.cid`, `${TABLES.COMMENT_MODERATIONS}.commentCid`)
            .leftJoin(TABLES.COMMENT_EDITS, `${TABLES.COMMENTS}.cid`, `${TABLES.COMMENT_EDITS}.commentCid`)
            .leftJoin({ childrenComments: TABLES.COMMENTS }, `${TABLES.COMMENTS}.cid`, `childrenComments.parentCid`)
            .max({
                voteLastInsertedAt: `${TABLES.VOTES}.insertedAt`,
                commentEditLastInsertedAt: `${TABLES.COMMENT_EDITS}.insertedAt`,
                modEditLastInsertedAt: `${TABLES.COMMENT_MODERATIONS}.insertedAt`,
                childCommentLastInsertedAt: `childrenComments.insertedAt`,
                lastUpdatedAt: `${TABLES.COMMENT_UPDATES}.updatedAt`
            })
            .groupBy(`${TABLES.COMMENTS}.cid`)
            .having(`voteLastInsertedAt`, ">=", lastUpdatedAtWithBuffer)
            .orHaving(`commentEditLastInsertedAt`, ">=", lastUpdatedAtWithBuffer)
            .orHaving(`modEditLastInsertedAt`, ">=", lastUpdatedAtWithBuffer)
            .orHaving(`childCommentLastInsertedAt`, ">=", lastUpdatedAtWithBuffer);

        const commentsToUpdate = remeda.uniqueBy([...criteriaOne, ...criteriaTwoThree], (comment) => comment.cid);

        // not just direct parent, also grandparents, till we reach the root post
        const limit = pLimit(50);
        const allParentsOfCommentsToUpdate = [];

        // Get comments that have a parentCid
        const commentsWithParents = remeda.unique(commentsToUpdate.filter((comment) => comment.parentCid));

        // Create parallel queries with concurrency limit
        const parentQueries = commentsWithParents.map((commentToUpdateWithParent) =>
            limit(() => this.queryParents(commentToUpdateWithParent, trx))
        );

        // Wait for all parent queries to complete
        const parentsResults = await Promise.all(parentQueries);

        // Flatten the results into allParentsOfCommentsToUpdate
        for (const parents of parentsResults) allParentsOfCommentsToUpdate.push(...parents);

        const authorComments = await this.queryCommentsOfAuthors(
            remeda.unique(commentsToUpdate.map((comment) => comment.authorSignerAddress)),
            trx
        );
        const uniqComments = remeda.uniqueBy(
            [...commentsToUpdate, ...allParentsOfCommentsToUpdate, ...authorComments],
            (comment) => comment.cid
        );

        return uniqComments;
    }

    private _calcActiveUserCount(
        commentsRaw: Pick<CommentsTableRow, "depth" | "authorSignerAddress" | "timestamp">[],
        votesRaw: Pick<VotesTableRow, "authorSignerAddress" | "timestamp">[]
    ) {
        const timeframes = remeda.keys.strict(TIMEFRAMES_TO_SECONDS);
        const res = {};
        for (const timeframe of timeframes) {
            const propertyName = `${timeframe.toLowerCase()}ActiveUserCount`;
            const [from, to] = [Math.max(0, timestamp() - TIMEFRAMES_TO_SECONDS[timeframe]), timestamp()];
            const authors = remeda.unique([
                ...commentsRaw
                    .filter((comment) => comment.timestamp >= from && comment.timestamp <= to)
                    .map((comment) => comment.authorSignerAddress),
                ...votesRaw.filter((vote) => vote.timestamp >= from && vote.timestamp <= to).map((vote) => vote.authorSignerAddress)
            ]);
            // Too lazy to type this function up, not high priority
            //@ts-expect-error
            res[propertyName] = authors.length;
        }
        return res;
    }

    private _calcCommentCount(commentsRaw: Pick<CommentsTableRow, "depth" | "authorSignerAddress" | "timestamp">[], countReply: boolean) {
        // if countReply = false, then it's a post count
        const timeframes = remeda.keys.strict(TIMEFRAMES_TO_SECONDS);
        const res = {};
        for (const timeframe of timeframes) {
            const propertyName = timeframe.toLowerCase() + (countReply ? "ReplyCount" : "PostCount");
            const [from, to] = [Math.max(0, timestamp() - TIMEFRAMES_TO_SECONDS[timeframe]), timestamp()];
            const posts = commentsRaw
                .filter((comment) => comment.timestamp >= from && comment.timestamp <= to)
                .filter((comment) => (countReply ? comment.depth > 0 : comment.depth === 0));

            // Too lazy to type this function up, not high priority
            //@ts-expect-error
            res[propertyName] = posts.length;
        }
        return res;
    }

    async querySubplebbitStats(trx?: Transaction): Promise<SubplebbitStats> {
        const queryString = `
            SELECT
                (
                    SELECT COUNT(DISTINCT author) 
                    FROM (
                        SELECT c.authorSignerAddress AS author FROM ${TABLES.COMMENTS} c
                        WHERE c.timestamp BETWEEN MAX(0, strftime('%s', 'now') - 3600) AND strftime('%s', 'now')
                        UNION
                        SELECT v.authorSignerAddress AS author FROM ${TABLES.VOTES} v
                        WHERE v.timestamp BETWEEN MAX(0, strftime('%s', 'now') - 3600) AND strftime('%s', 'now')
                    )
                ) AS hourActiveUserCount,
                
                (
                    SELECT COUNT(DISTINCT author) 
                    FROM (
                        SELECT c.authorSignerAddress AS author FROM ${TABLES.COMMENTS} c
                        WHERE c.timestamp BETWEEN MAX(0, strftime('%s', 'now') - 86400) AND strftime('%s', 'now')
                        UNION
                        SELECT v.authorSignerAddress AS author FROM ${TABLES.VOTES} v
                        WHERE v.timestamp BETWEEN MAX(0, strftime('%s', 'now') - 86400) AND strftime('%s', 'now')
                    )
                ) AS dayActiveUserCount,
                
                (
                    SELECT COUNT(DISTINCT author) 
                    FROM (
                        SELECT c.authorSignerAddress AS author FROM ${TABLES.COMMENTS} c
                        WHERE c.timestamp BETWEEN MAX(0, strftime('%s', 'now') - 604800) AND strftime('%s', 'now')
                        UNION
                        SELECT v.authorSignerAddress AS author FROM ${TABLES.VOTES} v
                        WHERE v.timestamp BETWEEN MAX(0, strftime('%s', 'now') - 604800) AND strftime('%s', 'now')
                    )
                ) AS weekActiveUserCount,
                
                (
                    SELECT COUNT(DISTINCT author) 
                    FROM (
                        SELECT c.authorSignerAddress AS author FROM ${TABLES.COMMENTS} c
                        WHERE c.timestamp BETWEEN MAX(0, strftime('%s', 'now') - 2629746) AND strftime('%s', 'now')
                        UNION
                        SELECT v.authorSignerAddress AS author FROM ${TABLES.VOTES} v
                        WHERE v.timestamp BETWEEN MAX(0, strftime('%s', 'now') - 2629746) AND strftime('%s', 'now')
                    )
                ) AS monthActiveUserCount,
                
                (
                    SELECT COUNT(DISTINCT author) 
                    FROM (
                        SELECT c.authorSignerAddress AS author FROM ${TABLES.COMMENTS} c
                        WHERE c.timestamp BETWEEN MAX(0, strftime('%s', 'now') - 31557600) AND strftime('%s', 'now')
                        UNION
                        SELECT v.authorSignerAddress AS author FROM ${TABLES.VOTES} v
                        WHERE v.timestamp BETWEEN MAX(0, strftime('%s', 'now') - 31557600) AND strftime('%s', 'now')
                    )
                ) AS yearActiveUserCount,
                
                (
                    SELECT COUNT(DISTINCT author) 
                    FROM (
                        SELECT c.authorSignerAddress AS author FROM ${TABLES.COMMENTS} c
                        UNION
                        SELECT v.authorSignerAddress AS author FROM ${TABLES.VOTES} v
                    )
                ) AS allActiveUserCount,
                
                (SELECT COUNT(*) FROM ${TABLES.COMMENTS} c WHERE c.depth = 0 AND c.timestamp BETWEEN MAX(0, strftime('%s', 'now') - 3600) AND strftime('%s', 'now')) AS hourPostCount,
                (SELECT COUNT(*) FROM ${TABLES.COMMENTS} c WHERE c.depth = 0 AND c.timestamp BETWEEN MAX(0, strftime('%s', 'now') - 86400) AND strftime('%s', 'now')) AS dayPostCount,
                (SELECT COUNT(*) FROM ${TABLES.COMMENTS} c WHERE c.depth = 0 AND c.timestamp BETWEEN MAX(0, strftime('%s', 'now') - 604800) AND strftime('%s', 'now')) AS weekPostCount,
                (SELECT COUNT(*) FROM ${TABLES.COMMENTS} c WHERE c.depth = 0 AND c.timestamp BETWEEN MAX(0, strftime('%s', 'now') - 2629746) AND strftime('%s', 'now')) AS monthPostCount,
                (SELECT COUNT(*) FROM ${TABLES.COMMENTS} c WHERE c.depth = 0 AND c.timestamp BETWEEN MAX(0, strftime('%s', 'now') - 31557600) AND strftime('%s', 'now')) AS yearPostCount,
                (SELECT COUNT(*) FROM ${TABLES.COMMENTS} c WHERE c.depth = 0) AS allPostCount,
                
                (SELECT COUNT(*) FROM ${TABLES.COMMENTS} c WHERE c.depth > 0 AND c.timestamp BETWEEN MAX(0, strftime('%s', 'now') - 3600) AND strftime('%s', 'now')) AS hourReplyCount,
                (SELECT COUNT(*) FROM ${TABLES.COMMENTS} c WHERE c.depth > 0 AND c.timestamp BETWEEN MAX(0, strftime('%s', 'now') - 86400) AND strftime('%s', 'now')) AS dayReplyCount,
                (SELECT COUNT(*) FROM ${TABLES.COMMENTS} c WHERE c.depth > 0 AND c.timestamp BETWEEN MAX(0, strftime('%s', 'now') - 604800) AND strftime('%s', 'now')) AS weekReplyCount,
                (SELECT COUNT(*) FROM ${TABLES.COMMENTS} c WHERE c.depth > 0 AND c.timestamp BETWEEN MAX(0, strftime('%s', 'now') - 2629746) AND strftime('%s', 'now')) AS monthReplyCount,
                (SELECT COUNT(*) FROM ${TABLES.COMMENTS} c WHERE c.depth > 0 AND c.timestamp BETWEEN MAX(0, strftime('%s', 'now') - 31557600) AND strftime('%s', 'now')) AS yearReplyCount,
                (SELECT COUNT(*) FROM ${TABLES.COMMENTS} c WHERE c.depth > 0) AS allReplyCount
        `;

        // Execute the single query
        const result = await this._baseTransaction(trx).raw(queryString);

        // Create stats object with proper typing, default to 0 for any missing fields
        const stats: SubplebbitStats = result[0];

        return stats;
    }

    async queryCommentsUnderComment(parentCid: string | null, trx?: Transaction): Promise<CommentsTableRow[]> {
        return this._baseTransaction(trx)(TABLES.COMMENTS).where("parentCid", parentCid);
    }

    async queryComment(cid: string, trx?: Transaction): Promise<CommentsTableRow | undefined> {
        return this._baseTransaction(trx)(TABLES.COMMENTS).where("cid", cid).first();
    }

    private async _queryCommentCounts(
        cid: string,
        trx?: Transaction
    ): Promise<Pick<CommentUpdateType, "replyCount" | "upvoteCount" | "downvoteCount">> {
        // Define the type for the query result
        type CommentCountsResult = {
            upvoteCount: number;
            downvoteCount: number;
            replyCount: number;
        };

        // The query is correct as is
        const query = `
        SELECT 
            (SELECT COUNT(*) FROM ${TABLES.VOTES} WHERE commentCid = ? AND vote = 1) AS upvoteCount,
            (SELECT COUNT(*) FROM ${TABLES.VOTES} WHERE commentCid = ? AND vote = -1) AS downvoteCount,
            (
                WITH RECURSIVE descendants AS (
                    SELECT c.cid FROM ${TABLES.COMMENTS} c
                    INNER JOIN ${TABLES.COMMENT_UPDATES} cu ON c.cid = cu.cid
                    LEFT JOIN (
                        SELECT cid, json_extract(edit, '$.deleted') AS deleted 
                        FROM ${TABLES.COMMENT_UPDATES}
                    ) AS d ON c.cid = d.cid
                    WHERE c.parentCid = ?
                    AND c.subplebbitAddress = ?
                    AND cu.removed IS NOT 1
                    AND d.deleted IS NOT 1
                    
                    UNION ALL
                    
                    SELECT c.cid FROM ${TABLES.COMMENTS} c
                    INNER JOIN ${TABLES.COMMENT_UPDATES} cu ON c.cid = cu.cid
                    LEFT JOIN (
                        SELECT cid, json_extract(edit, '$.deleted') AS deleted 
                        FROM ${TABLES.COMMENT_UPDATES}
                    ) AS d ON c.cid = d.cid
                    JOIN descendants desc ON c.parentCid = desc.cid
                    WHERE c.subplebbitAddress = ?
                    AND cu.removed IS NOT 1
                    AND d.deleted IS NOT 1
                )
                SELECT COUNT(*) FROM descendants
            ) AS replyCount
        `;

        const result = await this._baseTransaction(trx).raw<CommentCountsResult[]>(query, [
            cid,
            cid,
            cid,
            this._subplebbit.address,
            this._subplebbit.address
        ]);

        return {
            upvoteCount: result[0].upvoteCount,
            downvoteCount: result[0].downvoteCount,
            replyCount: result[0].replyCount
        };
    }

    async queryPostsWithOutdatedBuckets(
        buckets: number[],
        trx?: Transaction
    ): Promise<
        {
            cid: string;
            timestamp: number;
            currentBucket: number;
            newBucket: number;
        }[]
    > {
        const currentTimestamp = timestamp();
        const maxBucket = Math.max(...buckets); // Get the largest bucket to exclude from processing

        // Create a CTE to efficiently extract data and perform calculations in a single query
        const query = this._baseTransaction(trx)
            .with("post_data", (qb) => {
                qb.select([
                    "c.cid",
                    "c.timestamp",
                    "cu.postUpdatesBucket AS current_bucket",
                    // Calculate correct bucket based on time elapsed
                    this._knex.raw(`
                    CASE
                        ${buckets
                            .map((bucket) => `WHEN (${currentTimestamp} - ${bucket}) <= c.timestamp THEN ${bucket}`)
                            .join("\n                    ")}
                        ELSE ${maxBucket}
                    END AS new_bucket
                `)
                ])
                    .from(`${TABLES.COMMENTS} as c`)
                    .innerJoin(`${TABLES.COMMENT_UPDATES} as cu`, "c.cid", "cu.cid")
                    .where("c.depth", 0)
                    .where("c.subplebbitAddress", this._subplebbit.address)
                    .whereNotNull("cu.postUpdatesBucket")
                    // Exclude posts already in the last bucket
                    .where("cu.postUpdatesBucket", "!=", maxBucket);
            })
            .select(["cid", "timestamp", "current_bucket AS currentBucket", "new_bucket AS newBucket"])
            .from("post_data")
            .where("current_bucket", "!=", this._knex.raw("new_bucket"));

        // Type the result properly
        type PostWithBucketInfo = {
            cid: string;
            timestamp: number;
            currentBucket: number;
            newBucket: number;
        };

        return (await query) as unknown as PostWithBucketInfo[];
    }

    private async _queryLatestAuthorEdit(
        cid: string,
        authorSignerAddress: string,
        trx?: Transaction
    ): Promise<CommentEditPubsubMessagePublication | undefined> {
        const commentEditPubsubFields = remeda.concat(
            remeda.keys.strict(CommentEditPubsubMessagePublicationSchema.shape),
            remeda.keys.strict(remeda.pick(CommentEditsTableRowSchema.shape, ["extraProps"]))
        );

        const latestCommentEdit = await this._baseTransaction(trx)(TABLES.COMMENT_EDITS)
            .select(commentEditPubsubFields)
            .where({ commentCid: cid, authorSignerAddress, isAuthorEdit: true })
            .orderBy("id", "desc")
            .first();

        if (latestCommentEdit?.extraProps) delete latestCommentEdit.extraProps; // parseDbResponses will include props under extraProps in authorEdit for us

        return latestCommentEdit;
    }

    private async _queryLatestModeratorReason(comment: Pick<CommentsTableRow, "cid">, trx?: Transaction) {
        const res = <Required<Pick<CommentModerationTableRow["commentModeration"], "reason">> | undefined>(
            await this._baseTransaction(trx)(TABLES.COMMENT_MODERATIONS)
                .jsonExtract("commentModeration", "$.reason", "reason", true)
                .where("commentCid", comment.cid)
                .whereNotNull("reason")
                .orderBy("id", "desc")
                .first()
        );
        return res;
    }

    async queryCommentFlagsSetByMod(
        cid: string,
        trx?: Transaction
    ): Promise<Pick<CommentUpdateType, "spoiler" | "pinned" | "locked" | "removed" | "nsfw">> {
        // This query extracts all flags in a single operation
        // For each flag, it finds the most recent non-null value set by a moderator
        const query = `
            WITH flags_with_rank AS (
                -- For each flag, rank moderations by id descending to get the most recent first
                SELECT 
                    commentCid,
                    json_extract(commentModeration, '$.spoiler') AS spoiler,
                    json_extract(commentModeration, '$.pinned') AS pinned,
                    json_extract(commentModeration, '$.locked') AS locked,
                    json_extract(commentModeration, '$.removed') AS removed,
                    json_extract(commentModeration, '$.nsfw') AS nsfw,
                    ROW_NUMBER() OVER (
                        PARTITION BY commentCid, 
                        CASE WHEN json_extract(commentModeration, '$.spoiler') IS NOT NULL THEN 'spoiler' ELSE NULL END
                        ORDER BY id DESC
                    ) AS spoiler_rank,
                    ROW_NUMBER() OVER (
                        PARTITION BY commentCid, 
                        CASE WHEN json_extract(commentModeration, '$.pinned') IS NOT NULL THEN 'pinned' ELSE NULL END
                        ORDER BY id DESC
                    ) AS pinned_rank,
                    ROW_NUMBER() OVER (
                        PARTITION BY commentCid, 
                        CASE WHEN json_extract(commentModeration, '$.locked') IS NOT NULL THEN 'locked' ELSE NULL END
                        ORDER BY id DESC
                    ) AS locked_rank,
                    ROW_NUMBER() OVER (
                        PARTITION BY commentCid, 
                        CASE WHEN json_extract(commentModeration, '$.removed') IS NOT NULL THEN 'removed' ELSE NULL END
                        ORDER BY id DESC
                    ) AS removed_rank,
                    ROW_NUMBER() OVER (
                        PARTITION BY commentCid, 
                        CASE WHEN json_extract(commentModeration, '$.nsfw') IS NOT NULL THEN 'nsfw' ELSE NULL END
                        ORDER BY id DESC
                    ) AS nsfw_rank
                FROM ${TABLES.COMMENT_MODERATIONS}
                WHERE commentCid = ?
            )
            -- Select the most recent non-null values for each flag
            SELECT 
                MAX(CASE WHEN spoiler IS NOT NULL AND spoiler_rank = 1 THEN spoiler ELSE NULL END) AS spoiler,
                MAX(CASE WHEN pinned IS NOT NULL AND pinned_rank = 1 THEN pinned ELSE NULL END) AS pinned,
                MAX(CASE WHEN locked IS NOT NULL AND locked_rank = 1 THEN locked ELSE NULL END) AS locked,
                MAX(CASE WHEN removed IS NOT NULL AND removed_rank = 1 THEN removed ELSE NULL END) AS removed,
                MAX(CASE WHEN nsfw IS NOT NULL AND nsfw_rank = 1 THEN nsfw ELSE NULL END) AS nsfw
            FROM flags_with_rank
        `;

        // Execute the query and get the result
        const result = await this._baseTransaction(trx).raw(query, [cid]);

        // The result will have a single row with all the flags
        // Filter out null values to match the original function's behavior
        const flags = result[0];

        // Create an object with only the non-null flags
        const res: Pick<CommentUpdateType, "spoiler" | "pinned" | "locked" | "removed" | "nsfw"> = {};

        // Only include non-null values
        for (const flag of ["spoiler", "pinned", "locked", "removed", "nsfw"] as const) {
            if (flags[flag] !== null) {
                // Convert to proper boolean type if needed (SQLite might return 0/1 for booleans)
                if (typeof flags[flag] === "number") {
                    res[flag] = Boolean(flags[flag]);
                } else {
                    res[flag] = flags[flag];
                }
            }
        }

        return res;
    }

    async queryAuthorEditDeleted(cid: string, trx?: Transaction): Promise<Pick<CommentEditsTableRow, "deleted"> | undefined> {
        return this._baseTransaction(trx)(TABLES.COMMENT_EDITS)
            .select("deleted")
            .where({ isAuthorEdit: true })
            .where("commentCid", cid)
            .whereNotNull("deleted")
            .orderBy("id", "desc")
            .first();
    }

    private async _queryModCommentFlair(comment: Pick<CommentsTableRow, "cid">, trx?: Transaction) {
        const res = <Required<Pick<CommentModerationTableRow["commentModeration"], "flair">> | undefined>(
            await this._baseTransaction(trx)(TABLES.COMMENT_MODERATIONS)
                .jsonExtract("commentModeration", "$.flair", "flair", true)
                .where("commentCid", comment.cid)
                .whereNotNull("flair")
                .orderBy("id", "desc")
                .first()
        );
        return res;
    }

    private async _queryLastChildCidAndLastReplyTimestamp(comment: Pick<CommentsTableRow, "cid" | "timestamp">, trx?: Transaction) {
        const lastChildCidRaw = await this._baseTransaction(trx)(TABLES.COMMENTS)
            .where("parentCid", comment.cid)
            .orderBy("id", "desc")
            .select(["cid", "timestamp"])
            .first();
        // last reply timestamp is the timestamp of the latest child or indirect child timestamp
        const lastReplyTimestamp = lastChildCidRaw ? await this.queryMaximumTimestampUnderComment(comment, trx) : undefined;
        return {
            lastChildCid: lastChildCidRaw ? lastChildCidRaw.cid : undefined,
            lastReplyTimestamp
        };
    }

    async queryCalculatedCommentUpdate(
        comment: Pick<CommentsTableRow, "cid" | "authorSignerAddress" | "timestamp">,
        trx?: Transaction
    ): Promise<Omit<CommentUpdateType, "signature" | "updatedAt" | "replies" | "protocolVersion">> {
        const [
            authorSubplebbit,
            authorEdit,
            commentUpdateCounts,
            moderatorReason,
            commentFlags,
            commentModFlair,
            lastChildAndLastReplyTimestamp
        ] = await Promise.all([
            this.querySubplebbitAuthor(comment.authorSignerAddress, trx),
            this._queryLatestAuthorEdit(comment.cid, comment.authorSignerAddress, trx),
            this._queryCommentCounts(comment.cid, trx),
            this._queryLatestModeratorReason(comment, trx),
            this.queryCommentFlagsSetByMod(comment.cid, trx),
            this._queryModCommentFlair(comment, trx),
            this._queryLastChildCidAndLastReplyTimestamp(comment, trx)
        ]);

        if (!authorSubplebbit) throw Error("Failed to query author.subplebbit in queryCalculatedCommentUpdate");
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

    async queryLatestPostCid(trx?: Transaction): Promise<Pick<CommentsTableRow, "cid"> | undefined> {
        return this._baseTransaction(trx)(TABLES.COMMENTS).select("cid").where({ depth: 0 }).orderBy("id", "desc").first();
    }

    async queryLatestCommentCid(trx?: Transaction): Promise<Pick<CommentsTableRow, "cid"> | undefined> {
        return this._baseTransaction(trx)(TABLES.COMMENTS).select("cid").orderBy("id", "desc").first();
    }

    async queryAllCommentsOrderedByIdAsc(trx?: Transaction) {
        return this._baseTransaction(trx)(TABLES.COMMENTS).orderBy("id", "ASC");
    }

    async queryAuthorModEdits(
        authorSignerAddress: string,
        trx?: Knex.Transaction
    ): Promise<Pick<SubplebbitAuthor, "banExpiresAt" | "flair">> {
        const authorComments = await this._baseTransaction(trx)(TABLES.COMMENTS)
            .select("cid")
            .where("authorSignerAddress", authorSignerAddress);
        if (!Array.isArray(authorComments) || authorComments.length === 0) return {};
        //@ts-expect-error
        const modAuthorEdits = <{ commentAuthor: CommentModerationTableRow["commentModeration"]["author"] }[]>await this._baseTransaction(
            trx
        )(TABLES.COMMENT_MODERATIONS)
            .jsonExtract("commentModeration", "$.author", "commentAuthor", true)
            .whereIn(
                "commentCid",
                authorComments.map((c) => c.cid)
            )
            .whereNotNull("commentAuthor")
            .orderBy("id", "desc");

        const banAuthor = modAuthorEdits.find(
            (commentAuthor) => typeof commentAuthor?.commentAuthor?.banExpiresAt === "number"
        )?.commentAuthor;
        const authorFlairByMod = modAuthorEdits.find((commentAuthor) => commentAuthor?.commentAuthor?.flair)?.commentAuthor;

        const agreggateAuthor = <Pick<SubplebbitAuthor, "banExpiresAt" | "flair">>{ ...banAuthor, ...authorFlairByMod };

        return agreggateAuthor;
    }

    async querySubplebbitAuthor(authorSignerAddress: string, trx?: Knex.Transaction): Promise<SubplebbitAuthor | undefined> {
        const authorComments: (Pick<CommentsTableRow, "depth" | "id" | "timestamp" | "cid"> & {
            upvoteCount: number;
            downvoteCount: number;
        })[] = await this._baseTransaction(trx)(TABLES.COMMENTS)
            .leftJoin(TABLES.VOTES, `${TABLES.COMMENTS}.cid`, `${TABLES.VOTES}.commentCid`)
            .where(`${TABLES.COMMENTS}.authorSignerAddress`, authorSignerAddress)
            .select(`${TABLES.COMMENTS}.depth`, `${TABLES.COMMENTS}.id`, `${TABLES.COMMENTS}.timestamp`, `${TABLES.COMMENTS}.cid`)
            .select(
                this._knex.raw(`COALESCE(SUM(CASE WHEN ${TABLES.VOTES}.vote = 1 THEN 1 ELSE 0 END), 0) as upvoteCount`),
                this._knex.raw(`COALESCE(SUM(CASE WHEN ${TABLES.VOTES}.vote = -1 THEN 1 ELSE 0 END), 0) as downvoteCount`)
            )
            .groupBy(`${TABLES.COMMENTS}.cid`);

        if (authorComments.length === 0) return undefined;
        const authorPosts = authorComments.filter((comment) => comment.depth === 0);
        const authorReplies = authorComments.filter((comment) => comment.depth > 0);

        const postScore: number =
            remeda.sumBy(authorPosts, (post) => post.upvoteCount) - remeda.sumBy(authorPosts, (post) => post.downvoteCount);

        const replyScore: number =
            remeda.sumBy(authorReplies, (reply) => reply.upvoteCount) - remeda.sumBy(authorReplies, (reply) => reply.downvoteCount);

        const lastCommentCid = remeda.maxBy(authorComments, (comment) => comment.id)?.cid;
        if (!lastCommentCid) throw Error("Failed to query subplebbitAuthor.lastCommentCid");
        const firstCommentTimestamp = remeda.minBy(authorComments, (comment) => comment.id)?.timestamp;
        if (typeof firstCommentTimestamp !== "number") throw Error("Failed to query subbplebbitAuthor.firstCommentTimestamp");

        const modAuthorEdits = await this.queryAuthorModEdits(authorSignerAddress, trx);

        return {
            postScore,
            replyScore,
            lastCommentCid,
            ...modAuthorEdits,
            firstCommentTimestamp
        };
    }

    // will return a list of comment cids + comment updates + their pages that got purged
    async purgeComment(cid: string, isNestedCall: boolean = false): Promise<string[]> {
        const log = Logger("plebbit-js:local-subplebbit:db-handler:purgeComment");

        let transactionStarted = false;

        try {
            // Only start a transaction if this is not a nested call
            if (!isNestedCall) {
                log(`Starting EXCLUSIVE transaction for purging comment ${cid}`);
                await this._knex.raw("BEGIN EXCLUSIVE TRANSACTION");
                transactionStarted = true;
            }

            const purgedCids: string[] = [];

            // Next, delete direct child comments
            try {
                const directChildren = await this._knex(TABLES.COMMENTS).where({ parentCid: cid });
                for (const child of directChildren) {
                    purgedCids.push(...(await this.purgeComment(child.cid, true)));
                }
            } catch (error) {
                log.error(`Error finding direct children of ${cid}: ${error}`);
            }

            // Now delete related data for this comment
            try {
                await this._knex(TABLES.VOTES).where({ commentCid: cid }).del();
            } catch (error) {
                log.error(`Error deleting votes for comment ${cid}: ${error}`);
            }

            try {
                await this._knex(TABLES.COMMENT_EDITS).where({ commentCid: cid }).del();
            } catch (error) {
                log.error(`Error deleting comment edits for comment ${cid}: ${error}`);
            }

            // Handle comment updates
            if (await this._knex.schema.hasTable(TABLES.COMMENT_UPDATES)) {
                try {
                    const commentUpdate = await this.queryStoredCommentUpdate({ cid });
                    if (commentUpdate?.postCommentUpdateCid) purgedCids.push(commentUpdate.postCommentUpdateCid);
                    if (commentUpdate?.replies?.pageCids) purgedCids.push(...Object.values(commentUpdate.replies.pageCids));
                    await this._knex(TABLES.COMMENT_UPDATES).where({ cid }).del();
                } catch (error) {
                    log.error(`Error deleting comment update for comment ${cid}: ${error}`);
                }

                // If this is the top-level call, also update parent comment updates
                if (!isNestedCall) {
                    try {
                        let curCid = (await this._knex(TABLES.COMMENTS).where({ cid }).first())?.parentCid;
                        while (curCid) {
                            const commentUpdate = await this.queryStoredCommentUpdate({ cid: curCid });
                            if (commentUpdate?.postCommentUpdateCid) purgedCids.push(commentUpdate.postCommentUpdateCid);
                            if (commentUpdate?.replies?.pageCids) purgedCids.push(...Object.values(commentUpdate.replies.pageCids));

                            await this._knex(TABLES.COMMENT_UPDATES).where({ cid: curCid }).del();

                            const comment = await this.queryComment(curCid);
                            curCid = comment?.parentCid;
                        }
                    } catch (error) {
                        log.error(`Error updating parent comment updates for comment ${cid}: ${error}`);
                    }
                }
            }

            // Finally delete the comment itself
            try {
                await this._knex(TABLES.COMMENTS).where({ cid }).del();
            } catch (error) {
                log.error(`Error deleting comment ${cid}: ${error}`);
                throw error;
            }

            purgedCids.push(cid);

            // Only commit if we started the transaction
            if (transactionStarted) {
                log(`Committing EXCLUSIVE transaction for purging comment ${cid}`);
                await this._knex.raw("COMMIT");
            }

            return remeda.unique(purgedCids);
        } catch (error) {
            // Only rollback if we started the transaction
            if (transactionStarted) {
                log.error(`Error during comment purge, rolling back transaction: ${error}`);
                try {
                    await this._knex.raw("ROLLBACK");
                } catch (rollbackError) {
                    log.error(`Error during rollback: ${rollbackError}`);
                }
            } else {
                // Just log the error for nested calls
                log.error(`Error during nested comment purge: ${error}`);
            }
            throw error;
        }
    }
    async changeDbFilename(oldDbName: string, newDbName: string) {
        const log = Logger("plebbit-js:local-subplebbit:db-handler:changeDbFilename");
        await this.destoryConnection();

        const oldPathString = path.join(this._subplebbit._plebbit.dataPath!, "subplebbits", oldDbName);
        const newPath = path.format({ dir: path.dirname(oldPathString), base: newDbName });
        await fs.promises.mkdir(path.dirname(oldPathString), { recursive: true });
        this._currentTrxs = {};
        //@ts-expect-error
        delete this["_knex"];
        //@ts-expect-error
        delete this["_keyv"];
        await fs.promises.cp(oldPathString, newPath);
        if (os.type() === "Windows_NT") await deleteOldSubplebbitInWindows(oldPathString, this._subplebbit._plebbit);
        else await fs.promises.rm(oldPathString);

        this._dbConfig = {
            ...this._dbConfig,
            connection: {
                ...(<any>this._dbConfig.connection),
                filename: newPath
            }
        };
        log(`Changed db path from (${oldPathString}) to (${newPath})`);
    }

    // Start lock
    async lockSubStart(subAddress = this._subplebbit.address) {
        const log = Logger("plebbit-js:local-subplebbit:db-handler:lock:start");

        const lockfilePath = path.join(this._subplebbit._plebbit.dataPath!, "subplebbits", `${subAddress}.start.lock`);
        const subDbPath = path.join(this._subplebbit._plebbit.dataPath!, "subplebbits", subAddress);

        try {
            await lockfile.lock(subDbPath, {
                lockfilePath,
                onCompromised: () => {} // Temporary bandaid for the moment. Should be deleted later
            });
            log(`Locked the start of subplebbit (${subAddress}) successfully`);
        } catch (e: unknown) {
            if (e instanceof Error && e.message === "Lock file is already being held")
                throwWithErrorCode("ERR_SUB_ALREADY_STARTED", { subplebbitAddress: subAddress, error: e });
            else {
                log(`Error while trying to lock start of sub (${subAddress}): ${e}`);
                throw e;
            }
        }
    }

    async unlockSubStart(subAddress = this._subplebbit.address) {
        const log = Logger("plebbit-js:local-subplebbit:db-handler:unlock:start");
        log.trace(`Attempting to unlock the start of sub (${subAddress})`);

        const lockfilePath = path.join(this._subplebbit._plebbit.dataPath!, "subplebbits", `${subAddress}.start.lock`);
        const subDbPath = path.join(this._subplebbit._plebbit.dataPath!, "subplebbits", subAddress);
        if (!fs.existsSync(lockfilePath) || !fs.existsSync(subDbPath)) return;

        try {
            await lockfile.unlock(subDbPath, { lockfilePath });
            log(`Unlocked start of sub (${subAddress})`);
        } catch (e: unknown) {
            log(`Error while trying to unlock start of sub (${subAddress}): ${e}`);
            throw e;
        }
    }

    async isSubStartLocked(subAddress = this._subplebbit.address): Promise<boolean> {
        const lockfilePath = path.join(this._subplebbit._plebbit.dataPath!, "subplebbits", `${subAddress}.start.lock`);
        const subDbPath = path.join(this._subplebbit._plebbit.dataPath!, "subplebbits", subAddress);
        const isLocked = await lockfile.check(subDbPath, { lockfilePath, realpath: false, stale: 10000 });
        return isLocked;
    }

    // Subplebbit state lock

    async lockSubState() {
        const log = Logger("plebbit-js:local-subplebbit:db-handler:lock:lockSubState");
        const lockfilePath = path.join(this._subplebbit._plebbit.dataPath!, "subplebbits", `${this._subplebbit.address}.state.lock`);
        const subDbPath = path.join(this._subplebbit._plebbit.dataPath!, "subplebbits", this._subplebbit.address);
        try {
            await lockfile.lock(subDbPath, {
                lockfilePath,
                retries: 5,
                onCompromised: () => {}
            });
        } catch (e: unknown) {
            log.error(`Error when attempting to lock sub state`, this._subplebbit.address, e);
            if (e instanceof Error && e.message === "Lock file is already being held")
                throwWithErrorCode("ERR_SUB_STATE_LOCKED", { subplebbitAddress: this._subplebbit.address, error: e });
            // Not sure, do we need to throw error here
        }
    }

    async unlockSubState() {
        const log = Logger("plebbit-js:local-subplebbit:db-handler:lock:unlockSubState");

        const lockfilePath = path.join(this._subplebbit._plebbit.dataPath!, "subplebbits", `${this._subplebbit.address}.state.lock`);
        const subDbPath = path.join(this._subplebbit._plebbit.dataPath!, "subplebbits", this._subplebbit.address);
        if (!fs.existsSync(lockfilePath)) return;
        try {
            await lockfile.unlock(subDbPath, { lockfilePath });
        } catch (e: unknown) {
            log.error(`Error when attempting to unlock sub state`, this._subplebbit.address, e);
            if (e instanceof Error && "code" in e && e.code !== "ENOTACQUIRED") throw e;
        }
    }

    subDbExists() {
        const subDbPath = path.join(this._subplebbit._plebbit.dataPath!, "subplebbits", this._subplebbit.address);
        return fs.existsSync(subDbPath);
    }

    async markCommentsAsPublishedToPostUpdates(commentCids: string[], trx?: Transaction) {
        return await this._baseTransaction(trx)(TABLES.COMMENT_UPDATES)
            .whereIn("cid", commentCids)
            .update({ publishedToPostUpdatesMFS: true });
    }

    async forceUpdateOnAllComments(trx?: Transaction): Promise<void> {
        // force a new production of CommentUpdate of all Comments
        await this._baseTransaction(trx)(TABLES.COMMENT_UPDATES).update({ publishedToPostUpdatesMFS: false });
    }

    async forceUpdateOnAllCommentsWithCid(commentCids: string[], trx?: Transaction): Promise<void> {
        await this._baseTransaction(trx)(TABLES.COMMENT_UPDATES).whereIn("cid", commentCids).update({ publishedToPostUpdatesMFS: false });
    }

    async queryAllCidsUnderThisSubplebbit(trx?: Transaction): Promise<Set<string>> {
        const allCids = new Set<string>();
        const commentCids = await this._baseTransaction(trx)(TABLES.COMMENTS).select("cid");
        commentCids.forEach((comment) => allCids.add(comment.cid));

        const commentUpdateCids = await this._baseTransaction(trx)(TABLES.COMMENT_UPDATES)
            .select("postCommentUpdateCid")
            .whereNotNull("postCommentUpdateCid");
        commentUpdateCids.forEach((cid) => cid.postCommentUpdateCid && allCids.add(cid.postCommentUpdateCid));

        const replies = await this._baseTransaction(trx)(TABLES.COMMENT_UPDATES).select("replies").whereNotNull("replies");
        replies.forEach((reply) => {
            if (reply?.replies?.pageCids) {
                Object.values(reply.replies.pageCids).forEach((cid) => allCids.add(cid));
            }
        });

        return allCids;
    }

    async queryPostsWithActiveScore(
        pageOptions: Omit<PageOptions, "pageSize" | "preloadedPage" | "baseTimestamp" | "firstPageSizeBytes">,
        trx?: Transaction
    ): Promise<(PageIpfs["comments"][0] & { activeScore: number })[]> {
        // First calculate active scores using a CTE
        const activeScoresCte = `
            WITH RECURSIVE descendants AS (
                -- Base: posts with depth = 0
                SELECT p.cid AS post_cid, p.cid, p.timestamp
                FROM ${TABLES.COMMENTS} p
                WHERE p.depth = 0
                
                UNION ALL
                
                -- Recursive: all descendants
                SELECT d.post_cid, c.cid, c.timestamp
                FROM ${TABLES.COMMENTS} c
                INNER JOIN ${TABLES.COMMENT_UPDATES} cu ON c.cid = cu.cid
                LEFT JOIN (
                    SELECT cid, json_extract(edit, '$.deleted') AS deleted 
                    FROM ${TABLES.COMMENT_UPDATES}
                ) AS d_edit ON c.cid = d_edit.cid
                JOIN descendants d ON c.parentCid = d.cid
                WHERE c.subplebbitAddress = ?
                AND cu.removed IS NOT 1
                AND d_edit.deleted IS NOT 1
            ),
            active_scores AS (
                -- Calculate max timestamp for each post
                SELECT post_cid, MAX(timestamp) as active_score
                FROM descendants
                GROUP BY post_cid
            )
            SELECT post_cid, active_score FROM active_scores
        `;

        // Get the post details using the same approach as queryPageComments
        const commentUpdateColumns = <(keyof CommentUpdateType)[]>(
            remeda.keys.strict(
                pageOptions.commentUpdateFieldsToExclude
                    ? remeda.omit(CommentUpdateSchema.shape, pageOptions.commentUpdateFieldsToExclude)
                    : CommentUpdateSchema.shape
            )
        );
        const commentUpdateColumnSelects = commentUpdateColumns.map((col) => `${TABLES.COMMENT_UPDATES}.${col} AS commentUpdate_${col}`);

        const commentIpfsColumns = [...remeda.keys.strict(CommentIpfsSchema.shape), "extraProps"];
        const commentIpfsColumnSelects = commentIpfsColumns.map((col) => `${TABLES.COMMENTS}.${col} AS commentIpfs_${col}`);

        // Create a base query for posts
        let postsQuery = this._baseTransaction(trx)(TABLES.COMMENTS)
            .innerJoin(TABLES.COMMENT_UPDATES, `${TABLES.COMMENTS}.cid`, `${TABLES.COMMENT_UPDATES}.cid`)
            .joinRaw(`INNER JOIN (${activeScoresCte}) AS active_scores ON ${TABLES.COMMENTS}.cid = active_scores.post_cid`, [
                this._subplebbit.address
            ])
            .where("depth", 0);

        // Apply filters
        if (pageOptions.excludeCommentsWithDifferentSubAddress) {
            postsQuery = postsQuery.where({ subplebbitAddress: this._subplebbit.address });
        }
        if (pageOptions.excludeRemovedComments) {
            postsQuery = postsQuery.whereRaw(`${TABLES.COMMENT_UPDATES}.removed is not 1`);
        }
        if (pageOptions.excludeDeletedComments) {
            postsQuery = postsQuery.whereRaw(`json_extract(${TABLES.COMMENT_UPDATES}.edit, '$.deleted') is not 1`);
        }

        // Combined type with additional fields from the query
        type PostRowWithActiveScore = CommentIpfsPrefixedColumns &
            CommentUpdatePrefixedColumns & {
                active_score: number;
            };

        // Get the posts with all needed fields, but don't sort by active_score
        const rawResults = await postsQuery.select([
            ...commentIpfsColumnSelects,
            ...commentUpdateColumnSelects,
            "active_scores.active_score as active_score"
        ]);

        // Cast the results to our type (use unknown as an intermediate step to avoid direct casting errors)
        const postsRaw: PostRowWithActiveScore[] = rawResults as unknown as PostRowWithActiveScore[];

        // Handle post_cid for posts (depth = 0), following queryPageComments approach
        for (const postRaw of postsRaw) if (postRaw["commentIpfs_depth"] === 0) delete postRaw["commentIpfs_postCid"];

        // Map the results exactly like queryPageComments, but also include activeScore
        const posts: (PageIpfs["comments"][0] & { activeScore: number })[] = postsRaw.map((postRaw) => ({
            comment: remeda.mapKeys(
                // Exclude extraProps from pageIpfs.comments[0].comment
                remeda.pickBy(postRaw, (value, key) => key.startsWith("commentIpfs_") && !key.endsWith("extraProps")),
                (key, value) => key.replace("commentIpfs_", "")
            ) as CommentIpfsType,
            commentUpdate: remeda.mapKeys(
                remeda.pickBy(postRaw, (value, key) => key.startsWith("commentUpdate_")),
                (key, value) => key.replace("commentUpdate_", "")
            ) as CommentUpdateType,
            activeScore: postRaw.active_score // Include the active score
        }));

        return posts;
    }
}
