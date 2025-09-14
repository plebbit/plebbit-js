import { hideClassPrivateProps, removeNullUndefinedValues, throwWithErrorCode, timestamp } from "../../../util.js";
import path from "path";
import assert from "assert";
import fs from "fs";
import os from "os";
import Logger from "@plebbit/plebbit-logger";
import { deleteOldSubplebbitInWindows, getDefaultSubplebbitDbConfig } from "../util.js";
import env from "../../../version.js";
import Database, { type Database as BetterSqlite3Database } from "better-sqlite3";

//@ts-expect-error
import * as lockfile from "@plebbit/proper-lockfile";
import type { PageOptions } from "./page-generator.js";
import type {
    InternalSubplebbitRecordAfterFirstUpdateType,
    InternalSubplebbitRecordBeforeFirstUpdateType,
    SubplebbitStats
} from "../../../subplebbit/types.js";
import { LocalSubplebbit } from "./local-subplebbit.js";
import { getPlebbitAddressFromPublicKey } from "../../../signer/util.js";
import * as remeda from "remeda";
import type {
    CommentEditPubsubMessagePublication,
    CommentEditSignature,
    CommentEditsTableRow,
    CommentEditsTableRowInsert
} from "../../../publications/comment-edit/types.js";
import type {
    CommentIpfsType,
    CommentsTableRow,
    CommentsTableRowInsert,
    CommentUpdatesRow,
    CommentUpdatesTableRowInsert,
    CommentUpdateType,
    SubplebbitAuthor
} from "../../../publications/comment/types.js";
import { CommentIpfsSchema, CommentUpdateSchema } from "../../../publications/comment/schema.js";
import { verifyCommentIpfs } from "../../../signer/signatures.js";
import { ModeratorOptionsSchema } from "../../../publications/comment-moderation/schema.js";
import type { PageIpfs, RepliesPagesIpfsDefinedManuallyType } from "../../../pages/types.js";
import type { CommentModerationsTableRowInsert, CommentModerationTableRow } from "../../../publications/comment-moderation/types.js";
import { getSubplebbitChallengeFromSubplebbitChallengeSettings } from "./challenges/index.js";
import KeyvBetterSqlite3 from "./keyv-better-sqlite3.js";

import { STORAGE_KEYS } from "../../../constants.js";
import { CommentEditPubsubMessagePublicationSchema } from "../../../publications/comment-edit/schema.js";
import { TIMEFRAMES_TO_SECONDS } from "../../../pages/util.js";
import type { VotesTableRow, VotesTableRowInsert } from "../../../publications/vote/types.js";

const TABLES = Object.freeze({
    COMMENTS: "comments",
    COMMENT_UPDATES: "commentUpdates",
    VOTES: "votes",
    COMMENT_MODERATIONS: "commentModerations",
    COMMENT_EDITS: "commentEdits"
});

// Types for query results with prefixed columns
type CommentIpfsPrefixedColumns = {
    [K in keyof CommentsTableRow as `commentIpfs_${string & K}`]?: CommentsTableRow[K];
};

type CommentUpdatePrefixedColumns = {
    [K in keyof CommentUpdatesRow as `commentUpdate_${string & K}`]?: CommentUpdatesRow[K];
};

type PrefixedCommentRow = CommentIpfsPrefixedColumns & CommentUpdatePrefixedColumns;

export class DbHandler {
    private _db!: BetterSqlite3Database;
    private _subplebbit!: LocalSubplebbit;
    private _transactionDepth!: number;
    private _dbConfig!: { filename: string } & Database.Options;
    private _keyv!: KeyvBetterSqlite3;
    private _createdTables: boolean;

    constructor(subplebbit: DbHandler["_subplebbit"]) {
        this._subplebbit = subplebbit;
        this._transactionDepth = 0;
        this._createdTables = false;
        hideClassPrivateProps(this);
    }

    async initDbConfigIfNeeded() {
        if (!this._dbConfig) this._dbConfig = await getDefaultSubplebbitDbConfig(this._subplebbit.address, this._subplebbit._plebbit);
    }

    toJSON() {
        return undefined;
    }

    async initDbIfNeeded(dbConfigOptions?: Partial<DbHandler["_dbConfig"]>) {
        const log = Logger("plebbit-js:local-subplebbit:db-handler:initDbIfNeeded");
        assert(
            typeof this._subplebbit.address === "string" && this._subplebbit.address.length > 0,
            `DbHandler needs to be an instantiated with a Subplebbit that has a valid address, (${this._subplebbit.address}) was provided`
        );
        await this.initDbConfigIfNeeded();
        const dbFilePath = this._dbConfig.filename;
        if (!this._db || !this._db.open) {
            this._db = new Database(dbFilePath, { ...this._dbConfig, ...dbConfigOptions });
            try {
                this._db.pragma("journal_mode = WAL");
            } catch (e) {
                log(`Could not set WAL journal mode for ${dbFilePath}`, e);
                throw e;
            }
            log("initialized a new connection to db", dbFilePath);
        }
        if (!this._keyv) this._keyv = new KeyvBetterSqlite3(this._db);
    }

    async createOrMigrateTablesIfNeeded() {
        const log = Logger("plebbit-js:local-subplebbit:db-handler:createOrMigrateTablesIfNeeded");
        if (this._createdTables) return;

        try {
            await this._createOrMigrateTablesIfNeeded();
        } catch (e) {
            await this.initDbIfNeeded();
            log.error(
                `Sub (${this._subplebbit.address}) failed to create/migrate tables. Current db version (${this.getDbVersion()}), latest db version (${env.DB_VERSION}). Error`,
                e
            );
            await this.destoryConnection();
            throw e;
        }
        hideClassPrivateProps(this);
    }

    getDbConfig() {
        return this._dbConfig;
    }

    async keyvGet<Value>(key: string): Promise<Value | undefined> {
        try {
            const res = await this._keyv.get<Value>(key);
            return res;
        } catch (e: any) {
            e.details = { ...e.details, key };
            throw e;
        }
    }

    async keyvSet(key: string, value: any, ttl?: number) {
        return this._keyv.set(key, value, ttl);
    }

    async keyvDelete(key: string) {
        return this._keyv.delete(key);
    }

    async keyvHas(key: string) {
        return this._keyv.has(key);
    }

    async destoryConnection() {
        const log = Logger("plebbit-js:local-subplebbit:dbHandler:destroyConnection");
        if (this._db && this._db.open) {
            this._db.exec("PRAGMA checkpoint"); // write all wal to disk
            this._db.close();
        }
        if (this._keyv) await this._keyv.disconnect();

        //@ts-expect-error
        this._db = this._keyv = undefined;
        this._transactionDepth = 0;

        log("Destroyed DB connection to sub", this._subplebbit.address, "successfully");
    }

    createTransaction(): void {
        if (this._transactionDepth === 0) {
            this._db.exec("BEGIN");
        }
        this._transactionDepth++;
    }

    commitTransaction(): void {
        if (this._transactionDepth > 0) {
            this._transactionDepth--;
            if (this._transactionDepth === 0) {
                this._db.exec("COMMIT");
            }
        }
    }

    rollbackTransaction(): void {
        const log = Logger("plebbit-js:local-subplebbit:db-handler:rollbackTransaction");
        if (this._transactionDepth > 0) {
            if (this._transactionDepth === 1) {
                try {
                    this._db.exec("ROLLBACK");
                } catch (e) {
                    log.error(`Failed to rollback transaction due to error`, e);
                }
            }
            this._transactionDepth--;
        } else if (this._db && this._db.open && this._db.inTransaction) {
            log(`Transaction depth was 0, but DB was in transaction. Attempting rollback.`);
            try {
                this._db.exec("ROLLBACK");
            } catch (e) {
                log.error(`Failed to rollback transaction (fallback) due to error`, e);
            }
        }
        if (this._transactionDepth < 0) this._transactionDepth = 0;
        log.trace(`Rolledback transaction, this._transactionDepth = ${this._transactionDepth}`);
    }

    async rollbackAllTransactions() {
        const log = Logger("plebbit-js:local-subplebbit:db-handler:rollbackAllTransactions");
        let initialDepth = this._transactionDepth;
        while (this._transactionDepth > 0) {
            this.rollbackTransaction();
        }
        if (initialDepth > 0) {
            log.trace(`Rolled back all transactions. Initial depth was ${initialDepth}, now ${this._transactionDepth}.`);
        }
    }

    private _parseJsonFields<T extends Record<string, any>>(record: T, jsonFields: (keyof T)[]): T {
        for (const field of jsonFields) {
            if (record[field] !== null && record[field] !== undefined && typeof record[field] === "string") {
                try {
                    record[field] = JSON.parse(record[field] as string);
                } catch (e) {
                    //@ts-expect-error
                    e.details = { ...e.details, key: field, value: record[field], jsonFields };
                    throw e;
                }
            }
        }

        return record;
    }

    private _intToBoolean<T extends Record<string, any>>(record: T, booleanFields: (keyof T)[]): T {
        for (const field of booleanFields) if (typeof record[field] === "number") (record[field] as any) = Boolean(record[field]);

        return record;
    }

    private _createCommentsTable(tableName: string) {
        this._db.exec(`
            CREATE TABLE IF NOT EXISTS ${tableName} (
                cid TEXT NOT NULL PRIMARY KEY UNIQUE,
                authorSignerAddress TEXT NOT NULL,
                author TEXT NOT NULL, -- JSON
                link TEXT NULLABLE,
                linkWidth INTEGER NULLABLE,
                linkHeight INTEGER NULLABLE,
                thumbnailUrl TEXT NULLABLE,
                thumbnailUrlWidth INTEGER NULLABLE,
                thumbnailUrlHeight INTEGER NULLABLE,
                parentCid TEXT NULLABLE REFERENCES ${TABLES.COMMENTS}(cid),
                postCid TEXT NOT NULL REFERENCES ${TABLES.COMMENTS}(cid),
                previousCid TEXT NULLABLE,
                subplebbitAddress TEXT NOT NULL,
                content TEXT NULLABLE,
                timestamp INTEGER NOT NULL, 
                signature TEXT NOT NULL, -- JSON
                title TEXT NULLABLE,
                depth INTEGER NOT NULL,
                linkHtmlTagName TEXT NULLABLE,
                flair TEXT NULLABLE, -- JSON
                spoiler INTEGER NULLABLE, -- BOOLEAN (0/1)
                pendingApproval INTEGER NULLABLE, -- BOOLEAN (0/1)
                nsfw INTEGER NULLABLE, -- BOOLEAN (0/1)
                extraProps TEXT NULLABLE, -- JSON
                protocolVersion TEXT NOT NULL,
                insertedAt INTEGER NOT NULL
            )
        `);
    }

    private _createCommentUpdatesTable(tableName: string) {
        this._db.exec(`
            CREATE TABLE IF NOT EXISTS ${tableName} (
                cid TEXT NOT NULL PRIMARY KEY UNIQUE REFERENCES ${TABLES.COMMENTS}(cid),
                edit TEXT NULLABLE, -- JSON
                upvoteCount INTEGER NOT NULL,
                downvoteCount INTEGER NOT NULL,
                replyCount INTEGER NOT NULL,
                childCount INTEGER NOT NULL,
                flair TEXT NULLABLE, -- JSON
                spoiler INTEGER NULLABLE, -- BOOLEAN (0/1)
                nsfw INTEGER NULLABLE, -- BOOLEAN (0/1)
                pinned INTEGER NULLABLE, -- BOOLEAN (0/1)
                locked INTEGER NULLABLE, -- BOOLEAN (0/1)
                removed INTEGER NULLABLE, -- BOOLEAN (0/1)
                reason TEXT NULLABLE,
                updatedAt INTEGER NOT NULL CHECK(updatedAt > 0), 
                protocolVersion TEXT NOT NULL,
                signature TEXT NOT NULL, -- JSON
                author TEXT NULLABLE, -- JSON
                replies TEXT NULLABLE, -- JSON
                lastChildCid TEXT NULLABLE,
                lastReplyTimestamp INTEGER NULLABLE, 
                postUpdatesBucket INTEGER NULLABLE,
                postCommentUpdateCid TEXT NULLABLE,
                publishedToPostUpdatesMFS INTEGER NOT NULL, -- BOOLEAN (0/1)
                insertedAt INTEGER NOT NULL 
            )
        `);
    }

    private _createVotesTable(tableName: string) {
        this._db.exec(`
            CREATE TABLE IF NOT EXISTS ${tableName} (
                commentCid TEXT NOT NULL REFERENCES ${TABLES.COMMENTS}(cid),
                authorSignerAddress TEXT NOT NULL,
                timestamp INTEGER CHECK(timestamp > 0) NOT NULL, 
                vote INTEGER CHECK(vote BETWEEN -1 AND 1) NOT NULL,
                protocolVersion TEXT NOT NULL,
                insertedAt INTEGER NOT NULL, 
                extraProps TEXT NULLABLE, -- JSON
                PRIMARY KEY (commentCid, authorSignerAddress)
            )
        `);
    }

    private _createCommentEditsTable(tableName: string) {
        this._db.exec(`
            CREATE TABLE IF NOT EXISTS ${tableName} (
                commentCid TEXT NOT NULL REFERENCES ${TABLES.COMMENTS}(cid),
                authorSignerAddress TEXT NOT NULL,
                author TEXT NOT NULL, -- JSON
                signature TEXT NOT NULL, -- JSON
                protocolVersion TEXT NOT NULL,
                subplebbitAddress TEXT NOT NULL,
                timestamp INTEGER CHECK(timestamp > 0) NOT NULL, 
                content TEXT NULLABLE,
                reason TEXT NULLABLE,
                deleted INTEGER NULLABLE, -- BOOLEAN (0/1)
                flair TEXT NULLABLE, -- JSON
                spoiler INTEGER NULLABLE, -- BOOLEAN (0/1)
                nsfw INTEGER NULLABLE, -- BOOLEAN (0/1)
                isAuthorEdit INTEGER NOT NULL, -- BOOLEAN (0/1)
                insertedAt INTEGER NOT NULL, 
                extraProps TEXT NULLABLE -- JSON
            )
        `);
    }

    private _createCommentModerationsTable(tableName: string) {
        this._db.exec(`
            CREATE TABLE IF NOT EXISTS ${tableName} (
                commentCid TEXT NOT NULL,
                author TEXT NOT NULL, -- JSON
                signature TEXT NOT NULL, -- JSON
                modSignerAddress TEXT NOT NULL,
                protocolVersion TEXT NOT NULL,
                subplebbitAddress TEXT NOT NULL,
                timestamp INTEGER CHECK(timestamp > 0) NOT NULL, 
                commentModeration TEXT NOT NULL, -- JSON
                insertedAt INTEGER NOT NULL, 
                extraProps TEXT NULLABLE -- JSON
            )
        `);
    }

    getDbVersion(): number {
        const result = this._db.pragma("user_version", { simple: true }) as number;
        return Number(result);
    }

    _migrateOldSettings(oldSettings: InternalSubplebbitRecordBeforeFirstUpdateType["settings"]) {
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
        const currentDbVersion = this.getDbVersion();
        log.trace(`current db version: ${currentDbVersion}`);

        if (currentDbVersion > env.DB_VERSION)
            throw new Error(
                `DB version ${currentDbVersion} is greater than the latest version ${env.DB_VERSION}. You need to upgrade your client to accommodate the new DB version`
            );

        const needToMigrate = currentDbVersion < env.DB_VERSION;
        const dbPath = this._dbConfig.filename;
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
                if (!fs.existsSync(path.dirname(backupDbPath))) await fs.promises.mkdir(path.dirname(backupDbPath), { recursive: true });
                const sourceDb = new Database(dbPath, { fileMustExist: true });
                await sourceDb.backup(backupDbPath); // Use better-sqlite3's native backup method
                sourceDb.close();
                this._db = new Database(dbPath);
                this._db.pragma("journal_mode = WAL");
            }
            this._db.exec("PRAGMA foreign_keys = OFF");
            const tablesToDrop = ["challengeRequests", "challenges", "challengeAnswers", "challengeVerifications", "signers"];
            for (const tableName of tablesToDrop) this._db.exec(`DROP TABLE IF EXISTS ${tableName}`);
            this._db.exec(`DROP TABLE IF EXISTS ${TABLES.COMMENT_UPDATES}`);
            if (currentDbVersion <= 16 && this._tableExists(TABLES.COMMENT_EDITS)) {
                await this._moveCommentEditsToModAuthorTables();
            }
        }

        const createTableFunctions = [
            this._createCommentsTable.bind(this),
            this._createCommentUpdatesTable.bind(this),
            this._createVotesTable.bind(this),
            this._createCommentModerationsTable.bind(this),
            this._createCommentEditsTable.bind(this)
        ];
        const tables = Object.values(TABLES);

        for (let i = 0; i < tables.length; i++) {
            const tableName = tables[i];
            const tableExists = this._tableExists(tableName);
            if (!tableExists) {
                log(`Table ${tableName} does not exist. Will create schema`);
                createTableFunctions[i](tableName);
            } else if (tableExists && needToMigrate) {
                log(`Migrating table ${tableName} to new schema`);
                const tempTableName = `${tableName}_${env.DB_VERSION}_new`;
                this._db.exec(`DROP TABLE IF EXISTS ${tempTableName}`);
                createTableFunctions[i](tempTableName);
                await this._copyTable(tableName, tempTableName, currentDbVersion);
                this._db.exec(`DROP TABLE ${tableName}`);
                this._db.exec(`ALTER TABLE ${tempTableName} RENAME TO ${tableName}`);
            }
        }

        if (needToMigrate) {
            if (currentDbVersion <= 15) await this._purgeCommentsWithInvalidSchemaOrSignature();
            this._db.exec("PRAGMA foreign_keys = ON");
            this._db.pragma(`user_version = ${env.DB_VERSION}`);
            await this.initDbIfNeeded(); // to init keyv

            const internalState = (await this.keyvHas(STORAGE_KEYS[STORAGE_KEYS.INTERNAL_SUBPLEBBIT]))
                ? ((await this.keyvGet(STORAGE_KEYS[STORAGE_KEYS.INTERNAL_SUBPLEBBIT])) as
                      | InternalSubplebbitRecordAfterFirstUpdateType
                      | InternalSubplebbitRecordBeforeFirstUpdateType)
                : undefined;
            if (internalState) {
                const protocolVersion = internalState.protocolVersion || env.PROTOCOL_VERSION;
                const _usingDefaultChallenge =
                    "_usingDefaultChallenge" in internalState
                        ? internalState._usingDefaultChallenge
                        : //@ts-expect-error
                          remeda.isDeepEqual(this._subplebbit._defaultSubplebbitChallenges, internalState?.settings?.challenges);
                const updateCid: string =
                    "updateCid" in internalState && typeof internalState.updateCid === "string"
                        ? internalState.updateCid
                        : "QmYHzA8euDgUpNy3fh7JRwpPwt6jCgF35YTutYkyGGyr8f";
                const newSettings = this._migrateOldSettings(internalState.settings);
                const newChallenges = newSettings.challenges
                    ? await Promise.all(newSettings.challenges?.map(getSubplebbitChallengeFromSubplebbitChallengeSettings))
                    : newSettings.challenges;
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
        this._db.exec(`VACUUM;`); // Run vacuum outside transaction or after commit

        const newDbVersion = this.getDbVersion();
        assert.equal(newDbVersion, env.DB_VERSION);
        this._createdTables = true;
        if (needToMigrate)
            log(`Created/migrated the tables to the latest (${newDbVersion}) version and saved to path`, this._dbConfig.filename);
        if (backupDbPath) await fs.promises.rm(backupDbPath);
    }

    private _tableExists(tableName: string): boolean {
        const stmt = this._db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name = ?");
        return !!stmt.get(tableName);
    }

    private _getColumnNames(tableName: string): string[] {
        const results = this._db.pragma(`table_info(${tableName})`) as { name: string }[];
        return results.map((col) => col.name);
    }

    private async _copyTable(srcTable: string, dstTable: string, currentDbVersion: number) {
        const log = Logger("plebbit-js:local-subplebbit:db-handler:createTablesIfNeeded:copyTable");
        const dstTableColumns = this._getColumnNames(dstTable);
        // Include rowid in the SELECT to preserve it
        const srcRecordsRaw: any[] = this._db.prepare(`SELECT rowid, * FROM ${srcTable} ORDER BY rowid ASC`).all();

        if (srcRecordsRaw.length > 0) {
            log(`Attempting to copy ${srcRecordsRaw.length} records from ${srcTable} to ${dstTable}`);

            // Add rowid to the column list for insertion
            const columnsWithRowid = ["rowid", ...dstTableColumns];
            const insertStmt = this._db.prepare(
                `INSERT INTO ${dstTable} (${columnsWithRowid.join(", ")}) VALUES (${columnsWithRowid.map(() => "?").join(", ")})`
            );

            const recordsToInsert = [];
            for (let srcRecord of srcRecordsRaw) {
                srcRecord = { ...srcRecord }; // Ensure mutable

                // Pre-process specific migrations
                if (currentDbVersion <= 11 && srcTable === TABLES.COMMENT_EDITS) {
                    const parsedSig: CommentEditSignature =
                        typeof srcRecord.signature === "string" ? JSON.parse(srcRecord.signature) : srcRecord.signature;
                    const commentToBeEdited = this.queryComment(srcRecord.commentCid);
                    if (!commentToBeEdited) throw Error(`Failed to compute isAuthorEdit for ${srcRecord.commentCid}`);
                    srcRecord["isAuthorEdit"] = parsedSig.publicKey === commentToBeEdited.signature.publicKey;
                }
                if (currentDbVersion <= 12 && srcRecord["authorAddress"] && srcRecord["signature"]) {
                    const sig = typeof srcRecord.signature === "string" ? JSON.parse(srcRecord.signature) : srcRecord.signature;
                    srcRecord["authorSignerAddress"] = await getPlebbitAddressFromPublicKey(sig["publicKey"]);
                }
                if (srcTable === TABLES.COMMENTS) {
                    const commentIpfsFieldsNotIncludedAnymore = ["ipnsName"];
                    const extraProps = removeNullUndefinedValues(remeda.pick(srcRecord, commentIpfsFieldsNotIncludedAnymore)) as Record<
                        string,
                        any
                    >;

                    if (Object.keys(extraProps).length > 0) srcRecord.extraProps = { ...srcRecord.extraProps, ...extraProps };
                }

                // Prepare record for insertion (stringify JSONs, convert booleans)
                const processedRecord = this._processRecordsForDbBeforeInsert([srcRecord])[0];

                // Map values including rowid (preserve the original rowid value)
                const finalRecordValues = columnsWithRowid.map((col) => {
                    if (col === "rowid") {
                        return srcRecord.rowid; // Use original rowid value
                    }
                    return processedRecord[col];
                });
                recordsToInsert.push(finalRecordValues);
            }

            if (recordsToInsert.length > 0) {
                const insertMany = this._db.transaction((items: any[][]) => {
                    for (const itemArgs of items) {
                        insertStmt.run(...itemArgs);
                    }
                });
                insertMany(recordsToInsert);
            }
        }
        log(`copied table ${srcTable} to table ${dstTable}`);
    }

    private async _purgeCommentsWithInvalidSchemaOrSignature() {
        const log = Logger("plebbit-js:local-subplebbit:db-handler:_purgeCommentsWithInvalidSchema");
        const comments = this.queryAllCommentsOrderedByIdAsc();
        for (const commentRecord of comments) {
            // comments are already parsed here
            try {
                CommentIpfsSchema.strip().parse(commentRecord); // Validate against the already parsed object
            } catch (e) {
                log.error(`Comment (${commentRecord.cid}) in DB has an invalid schema, will be purged.`, e);
                this.purgeComment(commentRecord.cid);
                continue;
            }
            const validRes = await verifyCommentIpfs({
                comment: { ...commentRecord, ...commentRecord.extraProps }, // commentRecord is already parsed
                resolveAuthorAddresses: false,
                calculatedCommentCid: commentRecord.cid,
                clientsManager: this._subplebbit._clientsManager,
                overrideAuthorAddressIfInvalid: false
            });
            if (!validRes.valid) {
                log.error(`Comment ${commentRecord.cid} in DB has invalid signature due to ${validRes.reason}. Will be purged.`);
                this.purgeComment(commentRecord.cid);
            }
        }
    }

    private async _moveCommentEditsToModAuthorTables() {
        // Prior to db version 17, all comment edits, author and mod's were in the same table
        // code below will split them to their separate tables
        this._createCommentModerationsTable(TABLES.COMMENT_MODERATIONS);
        const allCommentEditsRaw = this._db.prepare(`SELECT rowid, * FROM ${TABLES.COMMENT_EDITS} ORDER BY rowid ASC`).all() as any[];

        const allCommentEdits = allCommentEditsRaw.map((r) => {
            let parsed = this._parseJsonFields(r, ["author", "signature", "flair", "extraProps"]);
            return this._intToBoolean(parsed, ["deleted", "spoiler", "nsfw", "isAuthorEdit", "pendingApproval"]);
        });

        const commentModerationSchemaKeys = remeda.keys.strict(ModeratorOptionsSchema.shape);
        const modEditRowIds: number[] = [];
        const moderationsToInsert: any[] = [];

        for (const commentEdit of allCommentEdits) {
            const commentToBeEdited = this.queryComment(commentEdit.commentCid);
            if (!commentToBeEdited) {
                throw Error(`Comment ${commentEdit.commentCid} not found while migrating comment edits.`);
            }
            const rowid: number = commentEdit.rowid || commentEdit.id;
            if (typeof rowid !== "number") throw Error("rowid should be part of the query results");
            const editHasBeenSignedByOriginalAuthor = commentEdit.signature.publicKey === commentToBeEdited.signature.publicKey;
            if (editHasBeenSignedByOriginalAuthor) continue; // we're only interested in mod edits

            const modSignerAddress = await getPlebbitAddressFromPublicKey(commentEdit.signature.publicKey);
            const commentModeration: CommentModerationTableRow["commentModeration"] = removeNullUndefinedValues({
                ...remeda.pick(commentEdit, commentModerationSchemaKeys),
                ...(commentEdit.commentAuthor && { author: JSON.parse(commentEdit.commentAuthor) })
            });

            moderationsToInsert.push(
                this._processRecordsForDbBeforeInsert([
                    {
                        commentCid: commentEdit.commentCid,
                        author: commentEdit.author, //This is the moderator's author object
                        signature: commentEdit.signature, // Moderator's signature
                        modSignerAddress,
                        protocolVersion: commentEdit.protocolVersion,
                        subplebbitAddress: commentEdit.subplebbitAddress,
                        timestamp: commentEdit.timestamp,
                        commentModeration: commentModeration, // The specific moderation actions
                        insertedAt: commentEdit.insertedAt,
                        extraProps: commentEdit.extraProps
                    } as CommentModerationsTableRowInsert
                ])[0]
            );
            modEditRowIds.push(rowid);
        }

        if (moderationsToInsert.length > 0) {
            const stmt = this._db.prepare(`
                INSERT INTO ${TABLES.COMMENT_MODERATIONS} 
                (commentCid, author, signature, modSignerAddress, protocolVersion, subplebbitAddress, timestamp, commentModeration, insertedAt, extraProps) 
                VALUES (@commentCid, @author, @signature, @modSignerAddress, @protocolVersion, @subplebbitAddress, @timestamp, @commentModeration, @insertedAt, @extraProps)
            `);
            const insertMany = this._db.transaction((items) => {
                for (const item of items) stmt.run(item);
            });
            insertMany(moderationsToInsert);
        }

        if (modEditRowIds.length > 0) {
            const placeholders = modEditRowIds.map(() => "?").join(",");

            // Update the query to use explicit rowids
            const deleteRes = this._db
                .prepare(
                    `DELETE FROM ${TABLES.COMMENT_EDITS} WHERE rowid IN (${placeholders})
                         OR (removed IS NOT NULL OR pinned IS NOT NULL OR locked IS NOT NULL OR commentAuthor IS NOT NULL)`
                )
                .run(...modEditRowIds);

            // Check if deletion was successful
            if (deleteRes.changes < modEditRowIds.length) {
                // Get list of rowids that actually exist for better error reporting
                const existingRowids = this._db
                    .prepare(`SELECT rowid FROM ${TABLES.COMMENT_EDITS} WHERE rowid IN (${placeholders})`)
                    .all(...modEditRowIds)
                    .map((row: any) => row.rowid);

                const error =
                    `Failed to delete ${modEditRowIds.length} comment edits. Only deleted ${deleteRes.changes}. ` +
                    `Missing rowids likely don't exist in the database. ` +
                    `Attempted: [${modEditRowIds.join(", ")}], Found existing: [${existingRowids.join(", ")}]`;

                throw Error(error);
            }
        }
    }

    deleteVote(authorSignerAddress: VotesTableRow["authorSignerAddress"], commentCid: VotesTableRow["commentCid"]): void {
        this._db
            .prepare(`DELETE FROM ${TABLES.VOTES} WHERE commentCid = ? AND authorSignerAddress = ?`)
            .run(commentCid, authorSignerAddress);
    }

    insertVotes(votes: VotesTableRowInsert[]): void {
        if (votes.length === 0) return;
        const processedVotes = this._processRecordsForDbBeforeInsert(votes);

        // Get all column names from the votes table to create defaults
        const columnNames = this._getColumnNames(TABLES.VOTES);

        const stmt = this._db.prepare(`
            INSERT INTO ${TABLES.VOTES} 
            (commentCid, authorSignerAddress, timestamp, vote, protocolVersion, insertedAt, extraProps) 
            VALUES (@commentCid, @authorSignerAddress, @timestamp, @vote, @protocolVersion, @insertedAt, @extraProps)
        `);

        const insertMany = this._db.transaction((items: VotesTableRowInsert[]) => {
            for (const vote of items) {
                // Create default object with null values for all columns
                const defaults: Record<string, null> = {};
                columnNames.forEach((column) => {
                    if (!(column in vote)) {
                        defaults[column] = null;
                    }
                });

                // Merge defaults with actual vote data
                const completeVote = { ...defaults, ...vote };
                stmt.run(completeVote);
            }
        });

        insertMany(processedVotes);
    }

    insertComments(comments: CommentsTableRowInsert[]): void {
        if (comments.length === 0) return;
        const processedComments = this._processRecordsForDbBeforeInsert(comments);

        // Get all column names from the comments table to create defaults
        const columnNames = this._getColumnNames(TABLES.COMMENTS) as (keyof CommentsTableRow)[];

        const stmt = this._db.prepare(`
            INSERT INTO ${TABLES.COMMENTS} 
            (cid, authorSignerAddress, author, link, linkWidth, linkHeight, thumbnailUrl, thumbnailUrlWidth, thumbnailUrlHeight, parentCid, postCid, previousCid, subplebbitAddress, content, timestamp, signature, title, depth, linkHtmlTagName, flair, spoiler, pendingApproval, nsfw, extraProps, protocolVersion, insertedAt) 
            VALUES (@cid, @authorSignerAddress, @author, @link, @linkWidth, @linkHeight, @thumbnailUrl, @thumbnailUrlWidth, @thumbnailUrlHeight, @parentCid, @postCid, @previousCid, @subplebbitAddress, @content, @timestamp, @signature, @title, @depth, @linkHtmlTagName, @flair, @spoiler, @pendingApproval, @nsfw, @extraProps, @protocolVersion, @insertedAt)
        `);

        // Create default object with null values for all columns
        const defaults = remeda.mapToObj(columnNames, (column) => [column, null]);

        const insertMany = this._db.transaction((items: CommentsTableRowInsert[]) => {
            for (const comment of items) {
                // Merge defaults with actual comment data
                const completeComment = { ...defaults, ...comment };
                stmt.run(completeComment);
            }
        });

        insertMany(processedComments);
    }

    upsertCommentUpdates(updates: CommentUpdatesTableRowInsert[]): void {
        const processedUpdates = this._processRecordsForDbBeforeInsert(updates);

        // Get all column names from the comment_updates table to create defaults
        const columnNames = this._getColumnNames(TABLES.COMMENT_UPDATES) as (keyof CommentUpdatesRow)[];

        const stmt = this._db.prepare(`
            INSERT INTO ${TABLES.COMMENT_UPDATES} 
            (cid, edit, upvoteCount, downvoteCount, replyCount, childCount, flair, spoiler, nsfw, pinned, locked, removed, reason, updatedAt, protocolVersion, signature, author, replies, lastChildCid, lastReplyTimestamp, postUpdatesBucket, postCommentUpdateCid, publishedToPostUpdatesMFS, insertedAt) 
            VALUES (@cid, @edit, @upvoteCount, @downvoteCount, @replyCount, @childCount, @flair, @spoiler, @nsfw, @pinned, @locked, @removed, @reason, @updatedAt, @protocolVersion, @signature, @author, @replies, @lastChildCid, @lastReplyTimestamp, @postUpdatesBucket, @postCommentUpdateCid, @publishedToPostUpdatesMFS, @insertedAt)
            ON CONFLICT(cid) DO UPDATE SET
                edit = excluded.edit, upvoteCount = excluded.upvoteCount, downvoteCount = excluded.downvoteCount, replyCount = excluded.replyCount, childCount = excluded.childCount,
                flair = excluded.flair, spoiler = excluded.spoiler, nsfw = excluded.nsfw, pinned = excluded.pinned, locked = excluded.locked,
                removed = excluded.removed, reason = excluded.reason, updatedAt = excluded.updatedAt, protocolVersion = excluded.protocolVersion,
                signature = excluded.signature, author = excluded.author, replies = excluded.replies, lastChildCid = excluded.lastChildCid,
                lastReplyTimestamp = excluded.lastReplyTimestamp, postUpdatesBucket = excluded.postUpdatesBucket,
                postCommentUpdateCid = excluded.postCommentUpdateCid, publishedToPostUpdatesMFS = excluded.publishedToPostUpdatesMFS,
                insertedAt = excluded.insertedAt
        `);

        const defaults = remeda.mapToObj(columnNames, (column) => [column, null]);

        const upsertMany = this._db.transaction((items: CommentUpdatesTableRowInsert[]) => {
            for (const update of items) {
                // Create default object with null values for all columns

                // Merge defaults with actual update data
                const completeUpdate = { ...defaults, ...update };
                stmt.run(completeUpdate);
            }
        });

        upsertMany(processedUpdates);
    }

    insertCommentModerations(moderations: CommentModerationsTableRowInsert[]): void {
        if (moderations.length === 0) return;
        const processedModerations = this._processRecordsForDbBeforeInsert(moderations);

        // Get all column names from the comment_moderations table to create defaults
        const columnNames = this._getColumnNames(TABLES.COMMENT_MODERATIONS) as (keyof CommentModerationTableRow)[];

        const stmt = this._db.prepare(`
            INSERT INTO ${TABLES.COMMENT_MODERATIONS}
            (commentCid, author, signature, modSignerAddress, protocolVersion, subplebbitAddress, timestamp, commentModeration, insertedAt, extraProps)
            VALUES (@commentCid, @author, @signature, @modSignerAddress, @protocolVersion, @subplebbitAddress, @timestamp, @commentModeration, @insertedAt, @extraProps)
        `);

        const defaults = remeda.mapToObj(columnNames, (column) => [column, null]);
        const insertMany = this._db.transaction((items: CommentModerationsTableRowInsert[]) => {
            for (const mod of items) {
                // Create default object with null values for all columns

                // Merge defaults with actual moderation data
                const completeMod = { ...defaults, ...mod };
                stmt.run(completeMod);
            }
        });

        insertMany(processedModerations);
    }

    insertCommentEdits(edits: CommentEditsTableRowInsert[]): void {
        if (edits.length === 0) return;
        const processedEdits = this._processRecordsForDbBeforeInsert(edits);

        // Get all column names from the comment_edits table to create defaults
        const columnNames = this._getColumnNames(TABLES.COMMENT_EDITS) as (keyof CommentEditsTableRow)[];

        const stmt = this._db.prepare(`
            INSERT INTO ${TABLES.COMMENT_EDITS}
            (commentCid, authorSignerAddress, author, signature, protocolVersion, subplebbitAddress, timestamp, content, reason, deleted, flair, spoiler, nsfw, isAuthorEdit, insertedAt, extraProps)
            VALUES (@commentCid, @authorSignerAddress, @author, @signature, @protocolVersion, @subplebbitAddress, @timestamp, @content, @reason, @deleted, @flair, @spoiler, @nsfw, @isAuthorEdit, @insertedAt, @extraProps)
        `);

        const defaults = remeda.mapToObj(columnNames, (column) => [column, null]);
        const insertMany = this._db.transaction((items: CommentEditsTableRowInsert[]) => {
            for (const edit of items) {
                // Create default object with null values for all columns

                // Merge defaults with actual edit data
                const completeEdit = { ...defaults, ...edit };
                stmt.run(completeEdit);
            }
        });

        insertMany(processedEdits);
    }

    queryVote(commentCid: string, authorSignerAddress: string): VotesTableRow | undefined {
        const row = this._db
            .prepare(`SELECT * FROM ${TABLES.VOTES} WHERE commentCid = ? AND authorSignerAddress = ?`)
            .get(commentCid, authorSignerAddress) as VotesTableRow | undefined;
        if (!row) return undefined;
        const parsed = this._parseJsonFields(row, ["extraProps"]);
        return removeNullUndefinedValues(parsed);
    }

    private _buildPageQueryParts(options: Omit<PageOptions, "pageSize" | "preloadedPage" | "baseTimestamp" | "firstPageSizeBytes">): {
        whereClauses: string[];
        params: any[];
    } {
        const whereClauses: string[] = [`${TABLES.COMMENTS}.parentCid = ?`];
        const params: any[] = [options.parentCid];

        if (options.excludeCommentsWithDifferentSubAddress) {
            whereClauses.push(`${TABLES.COMMENTS}.subplebbitAddress = ?`);
            params.push(this._subplebbit.address);
        }
        if (options.excludeRemovedComments) {
            whereClauses.push(`(${TABLES.COMMENT_UPDATES}.removed IS NOT 1 AND ${TABLES.COMMENT_UPDATES}.removed IS NOT TRUE)`);
        }
        if (options.excludeDeletedComments) {
            whereClauses.push(
                `(json_extract(${TABLES.COMMENT_UPDATES}.edit, '$.deleted') IS NULL OR json_extract(${TABLES.COMMENT_UPDATES}.edit, '$.deleted') != 1)`
            );
        }
        // Always exclude comments pending approval from pages
        whereClauses.push(`(${TABLES.COMMENTS}.pendingApproval IS NULL OR ${TABLES.COMMENTS}.pendingApproval != 1)`);
        return { whereClauses, params };
    }

    queryMaximumTimestampUnderComment(comment: Pick<CommentsTableRow, "cid">): number | undefined {
        const query = `
            WITH RECURSIVE descendants AS (
                SELECT c.cid, c.timestamp FROM ${TABLES.COMMENTS} c
                WHERE c.parentCid = ?
                UNION ALL
                SELECT c.cid, c.timestamp FROM ${TABLES.COMMENTS} c
                INNER JOIN ${TABLES.COMMENT_UPDATES} cu ON c.cid = cu.cid
                LEFT JOIN (SELECT cid, json_extract(edit, '$.deleted') AS deleted_flag FROM ${TABLES.COMMENT_UPDATES}) AS d ON c.cid = d.cid
                JOIN descendants desc_nodes ON c.parentCid = desc_nodes.cid
                WHERE c.subplebbitAddress = ? AND (cu.removed IS NOT 1 AND cu.removed IS NOT TRUE) AND (d.deleted_flag IS NULL OR d.deleted_flag != 1)
            )
            SELECT MAX(timestamp) AS max_timestamp FROM descendants
        `;
        const result = this._db.prepare(query).get(comment.cid, this._subplebbit.address) as { max_timestamp: number | null };

        if (result.max_timestamp === null) return undefined;
        return result.max_timestamp;
    }

    queryPageComments(options: Omit<PageOptions, "firstPageSizeBytes">): PageIpfs["comments"] {
        const commentUpdateCols = remeda.keys.strict(
            options.commentUpdateFieldsToExclude
                ? remeda.omit(CommentUpdateSchema.shape, options.commentUpdateFieldsToExclude)
                : CommentUpdateSchema.shape
        );
        const commentUpdateSelects = commentUpdateCols.map((col) => `${TABLES.COMMENT_UPDATES}.${col} AS commentUpdate_${col}`);
        const commentIpfsCols = [...remeda.keys.strict(CommentIpfsSchema.shape), "extraProps"];
        const commentIpfsSelects = commentIpfsCols.map((col) => `${TABLES.COMMENTS}.${col} AS commentIpfs_${col}`);

        const { whereClauses, params } = this._buildPageQueryParts(options);
        const queryStr = `
            SELECT ${commentIpfsSelects.join(", ")}, ${commentUpdateSelects.join(", ")}
            FROM ${TABLES.COMMENTS} INNER JOIN ${TABLES.COMMENT_UPDATES} ON ${TABLES.COMMENTS}.cid = ${TABLES.COMMENT_UPDATES}.cid
            WHERE ${whereClauses.join(" AND ")}
        `;

        const commentsRaw = this._db.prepare(queryStr).all(...params) as PrefixedCommentRow[];

        return commentsRaw.map((commentRaw) => {
            if (commentRaw["commentIpfs_depth"] === 0) delete commentRaw["commentIpfs_postCid"];
            const commentIpfsData = remeda.pickBy(commentRaw, (v, k) => k.startsWith("commentIpfs_")) as CommentIpfsPrefixedColumns;
            const commentUpdateData = remeda.pickBy(commentRaw, (v, k) => k.startsWith("commentUpdate_")) as CommentUpdatePrefixedColumns;

            const parsedCommentIpfs = this._spreadExtraProps(
                this._parseJsonFields(this._intToBoolean(commentIpfsData, ["commentIpfs_spoiler", "commentIpfs_nsfw"]), [
                    "commentIpfs_author",
                    "commentIpfs_signature",
                    "commentIpfs_flair",
                    "commentIpfs_extraProps"
                ])!
            );
            const parsedCommentUpdate = this._spreadExtraProps(
                this._parseJsonFields(
                    this._intToBoolean(commentUpdateData, [
                        "commentUpdate_spoiler",
                        "commentUpdate_nsfw",
                        "commentUpdate_pinned",
                        "commentUpdate_locked",
                        "commentUpdate_removed"
                    ]),
                    [
                        "commentUpdate_edit",
                        "commentUpdate_flair",
                        "commentUpdate_signature",
                        "commentUpdate_author",
                        "commentUpdate_replies"
                    ]
                )!
            );

            return {
                comment: removeNullUndefinedValues(
                    remeda.mapKeys(remeda.omit(parsedCommentIpfs, ["commentIpfs_extraProps"]), (k) =>
                        k.replace("commentIpfs_", "")
                    ) as CommentIpfsType
                ),
                commentUpdate: removeNullUndefinedValues(
                    remeda.mapKeys(parsedCommentUpdate, (k) => k.replace("commentUpdate_", "")) as CommentUpdateType
                )
            };
        });
    }

    queryFlattenedPageReplies(options: Omit<PageOptions, "firstPageSizeBytes"> & { parentCid: string }): PageIpfs["comments"] {
        const commentUpdateCols = remeda.keys.strict(
            options.commentUpdateFieldsToExclude
                ? remeda.omit(CommentUpdateSchema.shape, options.commentUpdateFieldsToExclude)
                : CommentUpdateSchema.shape
        );
        // TODO, is it omitting replies?
        const commentUpdateSelects = commentUpdateCols.map((col) => `c_updates.${col} AS commentUpdate_${col}`);
        const commentIpfsCols = [...remeda.keys.strict(CommentIpfsSchema.shape), "extraProps"];
        const commentIpfsSelects = commentIpfsCols.map((col) => `comments_alias.${col} AS commentIpfs_${col}`);

        let baseWhereClausesStr = "";
        let recursiveWhereClausesStr = "";
        const params: any[] = [options.parentCid];

        const pageQueryParts = this._buildPageQueryParts(options); // parentCid is handled by initial CTE condition.

        const baseFilterClauses: string[] = [];
        const recursiveFilterClauses: string[] = [];

        if (options.excludeCommentsWithDifferentSubAddress) {
            baseFilterClauses.push(`comments.subplebbitAddress = ?`);
            params.push(this._subplebbit.address);
            recursiveFilterClauses.push(`comments.subplebbitAddress = ?`);
            params.push(this._subplebbit.address);
        }
        if (options.excludeRemovedComments) {
            const clause = `(c_updates.removed IS NOT 1 AND c_updates.removed IS NOT TRUE)`;
            baseFilterClauses.push(clause);
            recursiveFilterClauses.push(clause);
        }
        if (options.excludeDeletedComments) {
            const clause = `(d.deleted_flag IS NULL OR d.deleted_flag != 1)`;
            baseFilterClauses.push(clause);
            recursiveFilterClauses.push(clause);
        }
        // Always exclude comments pending approval from replies pages

        const clause = `(comments.pendingApproval IS NULL OR comments.pendingApproval != 1)`;
        baseFilterClauses.push(clause);
        recursiveFilterClauses.push(clause);

        baseWhereClausesStr = baseFilterClauses.length > 0 ? `AND ${baseFilterClauses.join(" AND ")}` : "";
        recursiveWhereClausesStr = recursiveFilterClauses.length > 0 ? `AND ${recursiveFilterClauses.join(" AND ")}` : "";

        const query = `
            WITH RECURSIVE comment_tree AS (
                SELECT comments.*, ${commentUpdateCols.map((c) => `c_updates.${c} AS c_updates_${c}`).join(", ")}, 0 AS tree_level 
                FROM ${TABLES.COMMENTS} comments
                INNER JOIN ${TABLES.COMMENT_UPDATES} c_updates ON comments.cid = c_updates.cid
                LEFT JOIN (SELECT cid, json_extract(edit, '$.deleted') AS deleted_flag FROM ${TABLES.COMMENT_UPDATES}) AS d ON comments.cid = d.cid
                WHERE comments.parentCid = ? ${baseWhereClausesStr}
                UNION ALL
                SELECT comments.*, ${commentUpdateCols.map((c) => `c_updates.${c} AS c_updates_${c}`).join(", ")}, tree.tree_level + 1
                FROM ${TABLES.COMMENTS} comments
                INNER JOIN ${TABLES.COMMENT_UPDATES} c_updates ON comments.cid = c_updates.cid
                LEFT JOIN (SELECT cid, json_extract(edit, '$.deleted') AS deleted_flag FROM ${TABLES.COMMENT_UPDATES}) AS d ON comments.cid = d.cid
                INNER JOIN comment_tree tree ON comments.parentCid = tree.cid
                WHERE 1=1 ${recursiveWhereClausesStr}
            )
            SELECT ${commentIpfsSelects.join(", ")}, ${commentUpdateCols.map((col) => `comments_alias.c_updates_${col} AS commentUpdate_${col}`).join(", ")}
            FROM comment_tree comments_alias
        `;

        const commentsRaw = this._db.prepare(query).all(...params) as (PrefixedCommentRow & { tree_level: number })[];
        return commentsRaw.map((commentRaw) => {
            if (commentRaw["commentIpfs_depth"] === 0) delete commentRaw["commentIpfs_postCid"];
            const commentIpfsData = remeda.pickBy(commentRaw, (v, k) => k.startsWith("commentIpfs_"));
            const commentUpdateData = remeda.pickBy(commentRaw, (v, k) => k.startsWith("commentUpdate_"));

            const parsedCommentIpfs = this._spreadExtraProps(
                this._parseJsonFields(
                    this._intToBoolean(commentIpfsData as CommentIpfsPrefixedColumns, ["commentIpfs_spoiler", "commentIpfs_nsfw"]),
                    ["commentIpfs_author", "commentIpfs_signature", "commentIpfs_flair", "commentIpfs_extraProps"]
                )!
            );
            const parsedCommentUpdate = this._spreadExtraProps(
                this._parseJsonFields(
                    this._intToBoolean(commentUpdateData as CommentUpdatePrefixedColumns, [
                        "commentUpdate_spoiler",
                        "commentUpdate_nsfw",
                        "commentUpdate_pinned",
                        "commentUpdate_locked",
                        "commentUpdate_removed"
                    ]),
                    [
                        "commentUpdate_edit",
                        "commentUpdate_flair",
                        "commentUpdate_signature",
                        "commentUpdate_author",
                        "commentUpdate_replies"
                    ]
                )!
            );

            return {
                comment: removeNullUndefinedValues(
                    remeda.mapKeys(remeda.omit(parsedCommentIpfs, ["commentIpfs_extraProps"]) as CommentIpfsPrefixedColumns, (k) =>
                        k.replace("commentIpfs_", "")
                    ) as CommentIpfsType
                ),
                commentUpdate: removeNullUndefinedValues(
                    remeda.mapKeys(parsedCommentUpdate, (k) => k.replace("commentUpdate_", "")) as CommentUpdateType
                )
            };
        });
    }

    queryStoredCommentUpdate(comment: Pick<CommentsTableRow, "cid">): CommentUpdatesRow | undefined {
        const row = this._db.prepare(`SELECT * FROM ${TABLES.COMMENT_UPDATES} WHERE cid = ?`).get(comment.cid) as
            | CommentUpdatesRow
            | undefined;
        if (!row) return undefined;
        const parsed = this._parseJsonFields(row, ["edit", "flair", "signature", "author", "replies"]);
        const result = this._intToBoolean(parsed, ["spoiler", "nsfw", "pinned", "locked", "removed", "publishedToPostUpdatesMFS"]);
        return removeNullUndefinedValues(result);
    }

    hasCommentWithSignatureEncoded(signatureEncoded: string): boolean {
        const row = this._db
            .prepare(`SELECT 1 FROM ${TABLES.COMMENTS} WHERE json_extract(signature, '$.signature') = ? LIMIT 1`)
            .get(signatureEncoded);
        return row !== undefined;
    }

    hasCommentModerationWithSignatureEncoded(signatureEncoded: string): boolean {
        const row = this._db
            .prepare(`SELECT 1 FROM ${TABLES.COMMENT_MODERATIONS} WHERE json_extract(signature, '$.signature') = ? LIMIT 1`)
            .get(signatureEncoded);
        return row !== undefined;
    }

    hasCommentEditWithSignatureEncoded(signatureEncoded: string): boolean {
        const row = this._db
            .prepare(`SELECT 1 FROM ${TABLES.COMMENT_EDITS} WHERE json_extract(signature, '$.signature') = ? LIMIT 1`)
            .get(signatureEncoded);
        return row !== undefined;
    }

    queryParentsCids(rootComment: Pick<CommentsTableRow, "parentCid">): Pick<CommentsTableRow, "cid">[] {
        if (!rootComment.parentCid) throw Error("Root comment has no parent cid");
        const query = `
            WITH RECURSIVE parent_chain AS (
                SELECT cid, parentCid, 0 AS level FROM ${TABLES.COMMENTS} WHERE cid = ?
                UNION ALL
                SELECT c.cid, c.parentCid, pc.level + 1 FROM ${TABLES.COMMENTS} c JOIN parent_chain pc ON c.cid = pc.parentCid
            ) SELECT cid FROM parent_chain ORDER BY level
        `;
        return this._db.prepare(query).all(rootComment.parentCid) as Pick<CommentsTableRow, "cid">[];
    }

    queryCommentsPendingApproval(): CommentsTableRow[] {
        const results = this._db
            .prepare(`SELECT * FROM ${TABLES.COMMENTS} WHERE pendingApproval = 1 ORDER BY rowid DESC`)
            .all() as CommentsTableRow[];
        return results.map((r) => {
            const parsed = this._parseJsonFields(r, ["author", "signature", "flair", "extraProps"]);
            const result = this._intToBoolean(parsed, ["spoiler", "nsfw", "pendingApproval"]) as CommentsTableRow;
            return removeNullUndefinedValues(result);
        });
    }

    queryCommentsToBeUpdated(): CommentsTableRow[] {
        const query = `
            WITH RECURSIVE 
            direct_updates AS (
                SELECT c.* FROM ${TABLES.COMMENTS} c LEFT JOIN ${TABLES.COMMENT_UPDATES} cu ON c.cid = cu.cid
                WHERE (c.pendingApproval IS NULL OR c.pendingApproval != 1)
                  AND (cu.cid IS NULL OR (cu.publishedToPostUpdatesMFS = 0 OR cu.publishedToPostUpdatesMFS IS FALSE))
                UNION
                SELECT c.* FROM ${TABLES.COMMENTS} c JOIN ${TABLES.COMMENT_UPDATES} cu ON c.cid = cu.cid
                WHERE (c.pendingApproval IS NULL OR c.pendingApproval != 1)
                  AND (
                    EXISTS (SELECT 1 FROM ${TABLES.VOTES} v WHERE v.commentCid = c.cid AND v.insertedAt >= cu.updatedAt - 1)
                    OR EXISTS (SELECT 1 FROM ${TABLES.COMMENT_EDITS} ce WHERE ce.commentCid = c.cid AND ce.insertedAt >= cu.updatedAt - 1)
                    OR EXISTS (SELECT 1 FROM ${TABLES.COMMENT_MODERATIONS} cm WHERE cm.commentCid = c.cid AND cm.insertedAt >= cu.updatedAt - 1)
                    OR EXISTS (SELECT 1 FROM ${TABLES.COMMENTS} cc WHERE cc.parentCid = c.cid AND cc.insertedAt >= cu.updatedAt - 1)
                  )
            ),
            authors_to_update AS (SELECT DISTINCT authorSignerAddress FROM direct_updates),
            parent_chain AS (
                SELECT DISTINCT p.* FROM ${TABLES.COMMENTS} p JOIN direct_updates du ON p.cid = du.parentCid
                WHERE p.cid IS NOT NULL AND (p.pendingApproval IS NULL OR p.pendingApproval != 1)
                UNION
                SELECT DISTINCT p.* FROM ${TABLES.COMMENTS} p JOIN parent_chain pc ON p.cid = pc.parentCid
                WHERE p.cid IS NOT NULL AND (p.pendingApproval IS NULL OR p.pendingApproval != 1)
            ),
            all_updates AS (
                SELECT cid FROM direct_updates UNION SELECT cid FROM parent_chain
                UNION SELECT c.cid FROM ${TABLES.COMMENTS} c JOIN authors_to_update a ON c.authorSignerAddress = a.authorSignerAddress
                WHERE (c.pendingApproval IS NULL OR c.pendingApproval != 1)
            )
            SELECT c.* FROM ${TABLES.COMMENTS} c JOIN all_updates au ON c.cid = au.cid
            WHERE (c.pendingApproval IS NULL OR c.pendingApproval != 1)
            ORDER BY c.rowid
        `;
        const results = this._db.prepare(query).all() as CommentsTableRow[];
        return results.map((r) => {
            const parsed = this._parseJsonFields(r, ["author", "signature", "flair", "extraProps"]);
            const result = this._intToBoolean(parsed, ["spoiler", "nsfw", "pendingApproval"]) as CommentsTableRow;
            return removeNullUndefinedValues(result);
        });
    }

    querySubplebbitStats(): SubplebbitStats {
        const now = timestamp(); // All timestamps are in seconds

        const queryString = `
            SELECT 
                -- Active user counts from combined activity
                COALESCE(COUNT(DISTINCT CASE WHEN hour_active > 0 THEN authorSignerAddress END), 0) as hourActiveUserCount,
                COALESCE(COUNT(DISTINCT CASE WHEN day_active > 0 THEN authorSignerAddress END), 0) as dayActiveUserCount,
                COALESCE(COUNT(DISTINCT CASE WHEN week_active > 0 THEN authorSignerAddress END), 0) as weekActiveUserCount,
                COALESCE(COUNT(DISTINCT CASE WHEN month_active > 0 THEN authorSignerAddress END), 0) as monthActiveUserCount,
                COALESCE(COUNT(DISTINCT CASE WHEN year_active > 0 THEN authorSignerAddress END), 0) as yearActiveUserCount,
                COALESCE(COUNT(DISTINCT authorSignerAddress), 0) as allActiveUserCount,
                
                -- Post counts from comments only
                COALESCE(SUM(CASE WHEN is_comment = 1 AND depth = 0 AND timestamp >= ${now - TIMEFRAMES_TO_SECONDS.HOUR} THEN 1 ELSE 0 END), 0) as hourPostCount,
                COALESCE(SUM(CASE WHEN is_comment = 1 AND depth = 0 AND timestamp >= ${now - TIMEFRAMES_TO_SECONDS.DAY} THEN 1 ELSE 0 END), 0) as dayPostCount,
                COALESCE(SUM(CASE WHEN is_comment = 1 AND depth = 0 AND timestamp >= ${now - TIMEFRAMES_TO_SECONDS.WEEK} THEN 1 ELSE 0 END), 0) as weekPostCount,
                COALESCE(SUM(CASE WHEN is_comment = 1 AND depth = 0 AND timestamp >= ${now - TIMEFRAMES_TO_SECONDS.MONTH} THEN 1 ELSE 0 END), 0) as monthPostCount,
                COALESCE(SUM(CASE WHEN is_comment = 1 AND depth = 0 AND timestamp >= ${now - TIMEFRAMES_TO_SECONDS.YEAR} THEN 1 ELSE 0 END), 0) as yearPostCount,
                COALESCE(SUM(CASE WHEN is_comment = 1 AND depth = 0 THEN 1 ELSE 0 END), 0) as allPostCount,
                
                -- Reply counts from comments only
                COALESCE(SUM(CASE WHEN is_comment = 1 AND depth > 0 AND timestamp >= ${now - TIMEFRAMES_TO_SECONDS.HOUR} THEN 1 ELSE 0 END), 0) as hourReplyCount,
                COALESCE(SUM(CASE WHEN is_comment = 1 AND depth > 0 AND timestamp >= ${now - TIMEFRAMES_TO_SECONDS.DAY} THEN 1 ELSE 0 END), 0) as dayReplyCount,
                COALESCE(SUM(CASE WHEN is_comment = 1 AND depth > 0 AND timestamp >= ${now - TIMEFRAMES_TO_SECONDS.WEEK} THEN 1 ELSE 0 END), 0) as weekReplyCount,
                COALESCE(SUM(CASE WHEN is_comment = 1 AND depth > 0 AND timestamp >= ${now - TIMEFRAMES_TO_SECONDS.MONTH} THEN 1 ELSE 0 END), 0) as monthReplyCount,
                COALESCE(SUM(CASE WHEN is_comment = 1 AND depth > 0 AND timestamp >= ${now - TIMEFRAMES_TO_SECONDS.YEAR} THEN 1 ELSE 0 END), 0) as yearReplyCount,
                COALESCE(SUM(CASE WHEN is_comment = 1 AND depth > 0 THEN 1 ELSE 0 END), 0) as allReplyCount
            FROM (
                SELECT 
                    authorSignerAddress, 
                    timestamp,
                    depth,
                    1 as is_comment,
                    CASE WHEN timestamp >= ${now - TIMEFRAMES_TO_SECONDS.HOUR} THEN 1 ELSE 0 END as hour_active,
                    CASE WHEN timestamp >= ${now - TIMEFRAMES_TO_SECONDS.DAY} THEN 1 ELSE 0 END as day_active,
                    CASE WHEN timestamp >= ${now - TIMEFRAMES_TO_SECONDS.WEEK} THEN 1 ELSE 0 END as week_active,
                    CASE WHEN timestamp >= ${now - TIMEFRAMES_TO_SECONDS.MONTH} THEN 1 ELSE 0 END as month_active,
                    CASE WHEN timestamp >= ${now - TIMEFRAMES_TO_SECONDS.YEAR} THEN 1 ELSE 0 END as year_active
                FROM ${TABLES.COMMENTS}
                UNION ALL
                SELECT 
                    authorSignerAddress, 
                    timestamp,
                    NULL as depth,
                    0 as is_comment,
                    CASE WHEN timestamp >= ${now - TIMEFRAMES_TO_SECONDS.HOUR} THEN 1 ELSE 0 END as hour_active,
                    CASE WHEN timestamp >= ${now - TIMEFRAMES_TO_SECONDS.DAY} THEN 1 ELSE 0 END as day_active,
                    CASE WHEN timestamp >= ${now - TIMEFRAMES_TO_SECONDS.WEEK} THEN 1 ELSE 0 END as week_active,
                    CASE WHEN timestamp >= ${now - TIMEFRAMES_TO_SECONDS.MONTH} THEN 1 ELSE 0 END as month_active,
                    CASE WHEN timestamp >= ${now - TIMEFRAMES_TO_SECONDS.YEAR} THEN 1 ELSE 0 END as year_active
                FROM ${TABLES.VOTES}
            )
        `;

        return this._db.prepare(queryString).get() as SubplebbitStats;
    }

    queryCommentsUnderComment(parentCid: string | null): CommentsTableRow[] {
        const results = this._db.prepare(`SELECT * FROM ${TABLES.COMMENTS} WHERE parentCid = ?`).all(parentCid) as CommentsTableRow[];
        return results.map((r) => {
            const parsed = this._parseJsonFields(r, ["author", "signature", "flair", "extraProps"]);
            const result = this._intToBoolean(parsed, ["spoiler", "nsfw", "pendingApproval"]) as CommentsTableRow;
            return removeNullUndefinedValues(result);
        });
    }

    queryComment(cid: string): CommentsTableRow | undefined {
        const row = this._db.prepare(`SELECT * FROM ${TABLES.COMMENTS} WHERE cid = ?`).get(cid) as CommentsTableRow | undefined;
        if (!row) return undefined;
        const parsed = this._parseJsonFields(row, ["author", "signature", "flair", "extraProps"]);
        const result = this._intToBoolean(parsed, ["spoiler", "nsfw", "pendingApproval"]);
        return removeNullUndefinedValues(result);
    }

    private _queryCommentCounts(cid: string): Pick<CommentUpdateType, "replyCount" | "upvoteCount" | "downvoteCount" | "childCount"> {
        const query = `
        SELECT 
            (SELECT COUNT(*) FROM ${TABLES.VOTES} WHERE commentCid = :cid AND vote = 1) AS upvoteCount,
            (SELECT COUNT(*) FROM ${TABLES.VOTES} WHERE commentCid = :cid AND vote = -1) AS downvoteCount,
            (
                WITH RECURSIVE descendants AS (
                    SELECT c.cid FROM ${TABLES.COMMENTS} c
                    INNER JOIN ${TABLES.COMMENT_UPDATES} cu ON c.cid = cu.cid
                    LEFT JOIN (SELECT cid, json_extract(edit, '$.deleted') AS deleted_flag FROM ${TABLES.COMMENT_UPDATES}) AS d ON c.cid = d.cid
                    WHERE c.parentCid = :cid AND c.subplebbitAddress = :subplebbitAddress AND (cu.removed IS NOT 1 AND cu.removed IS NOT TRUE) AND (d.deleted_flag IS NULL OR d.deleted_flag != 1)
                    UNION ALL
                    SELECT c.cid FROM ${TABLES.COMMENTS} c
                    INNER JOIN ${TABLES.COMMENT_UPDATES} cu ON c.cid = cu.cid
                    LEFT JOIN (SELECT cid, json_extract(edit, '$.deleted') AS deleted_flag FROM ${TABLES.COMMENT_UPDATES}) AS d ON c.cid = d.cid
                    JOIN descendants desc_nodes ON c.parentCid = desc_nodes.cid
                    WHERE c.subplebbitAddress = :subplebbitAddress AND (cu.removed IS NOT 1 AND cu.removed IS NOT TRUE) AND (d.deleted_flag IS NULL OR d.deleted_flag != 1)
                ) SELECT COUNT(*) FROM descendants
            ) AS replyCount,
            (
                SELECT COUNT(*) FROM ${TABLES.COMMENTS} c
                INNER JOIN ${TABLES.COMMENT_UPDATES} cu ON c.cid = cu.cid
                LEFT JOIN (SELECT cid, json_extract(edit, '$.deleted') AS deleted_flag FROM ${TABLES.COMMENT_UPDATES}) AS d ON c.cid = d.cid
                WHERE c.parentCid = :cid AND c.subplebbitAddress = :subplebbitAddress AND (cu.removed IS NOT 1 AND cu.removed IS NOT TRUE) AND (d.deleted_flag IS NULL OR d.deleted_flag != 1)
            ) AS childCount
        `;
        return this._db.prepare(query).get({ cid, subplebbitAddress: this._subplebbit.address }) as Pick<
            CommentUpdateType,
            "replyCount" | "upvoteCount" | "downvoteCount" | "childCount"
        >;
    }

    queryPostsWithOutdatedBuckets(buckets: number[]): { cid: string; timestamp: number; currentBucket: number; newBucket: number }[] {
        const currentTimestampSeconds = timestamp(); // timestamp is in seconds
        const maxBucket = Math.max(...buckets);
        const caseClauses = buckets
            .sort((a, b) => a - b)
            .map((bucket) => `WHEN (${currentTimestampSeconds} - c.timestamp) <= ${bucket} THEN ${bucket}`)
            .join(" ");
        const query = `
            WITH post_data AS (
                SELECT c.cid, c.timestamp, cu.postUpdatesBucket AS current_bucket,
                    CASE ${caseClauses} ELSE ${maxBucket} END AS new_bucket
                FROM ${TABLES.COMMENTS} as c INNER JOIN ${TABLES.COMMENT_UPDATES} as cu ON c.cid = cu.cid
                WHERE c.subplebbitAddress = ?
                  AND (c.pendingApproval IS NULL OR c.pendingApproval != 1)
                  AND cu.postUpdatesBucket IS NOT NULL AND cu.postUpdatesBucket != ?
            ) SELECT cid, timestamp, current_bucket AS currentBucket, new_bucket AS newBucket
            FROM post_data WHERE current_bucket != new_bucket
        `;
        return this._db.prepare(query).all(this._subplebbit.address, maxBucket) as {
            cid: string;
            timestamp: number;
            currentBucket: number;
            newBucket: number;
        }[];
    }

    private _queryLatestAuthorEdit(cid: string, authorSignerAddress: string): CommentEditPubsubMessagePublication | undefined {
        const row = this._db
            .prepare(
                `
            SELECT * FROM ${TABLES.COMMENT_EDITS}
            WHERE commentCid = ? AND authorSignerAddress = ? AND (isAuthorEdit = 1)
            ORDER BY rowid DESC LIMIT 1
        `
            )
            .get(cid, authorSignerAddress) as CommentEditsTableRow | undefined;
        if (!row) return undefined;

        const parsedResult = this._spreadExtraProps(
            this._intToBoolean(this._parseJsonFields(row, ["author", "signature", "flair", "extraProps"]), [
                "deleted",
                "spoiler",
                "nsfw",
                "isAuthorEdit"
            ]) as CommentEditsTableRow
        );

        const parsed = removeNullUndefinedValues(parsedResult);

        const signedKeys = parsed.signature.signedPropertyNames as CommentEditSignature["signedPropertyNames"];

        const commentEditFields = remeda.keys.strict(CommentEditPubsubMessagePublicationSchema.shape);

        return remeda.pick(parsed, ["signature", ...signedKeys, ...commentEditFields]) as CommentEditPubsubMessagePublication;
    }

    removeCommentFromPendingApproval(comment: Pick<CommentsTableRow, "cid">): void {
        const log = Logger("plebbit-js:local-subplebbit:db-handler:removeCommentFromPendingApproval");
        const stmt = this._db.prepare(`UPDATE ${TABLES.COMMENTS} SET pendingApproval = 0 WHERE cid = ?`);
        const res = stmt.run(comment.cid);
        log.trace(`Removed pendingApproval for cid=${comment.cid}, changes=${res.changes}`);
    }

    // Remove oldest comments pending approval when exceeding the configured limit
    removeOldestPendingCommentIfWeHitMaxPendingCount(maxPendingApprovalCount: number): void {
        const log = Logger(
            "plebbit-js:local-subplebbit:db-handler:removeOldestPendingCommentIfWeHitMaxPendingCount"
        );

        // Assume maxPendingApprovalCount is a valid integer > 0
        try {
            const { cnt } = this._db
                .prepare(`SELECT COUNT(1) as cnt FROM ${TABLES.COMMENTS} WHERE pendingApproval = 1`)
                .get() as { cnt: number };

            if (cnt <= maxPendingApprovalCount) return;

            const toRemove = cnt - maxPendingApprovalCount;
            const oldest = this._db
                .prepare(
                    `SELECT cid FROM ${TABLES.COMMENTS} WHERE pendingApproval = 1 ORDER BY rowid ASC LIMIT ?`
                )
                .all(toRemove) as { cid: string }[];

            if (oldest.length === 0) return;

            log(
                `Evicting ${oldest.length} oldest pending comments (count=${cnt}, limit=${maxPendingApprovalCount})`
            );

            this.createTransaction();
            try {
                for (const { cid } of oldest) this.purgeComment(cid);
                this.commitTransaction();
            } catch (e) {
                this.rollbackTransaction();
                throw e;
            }
        } catch (e) {
            log.error("Failed to enforce maxPendingApprovalCount", e);
        }
    }

    private _queryLatestModeratorReason(comment: Pick<CommentsTableRow, "cid">): Pick<CommentUpdateType, "reason"> | undefined {
        const result = this._db
            .prepare(
                `
            SELECT json_extract(commentModeration, '$.reason') AS reason FROM ${TABLES.COMMENT_MODERATIONS}
            WHERE commentCid = ? AND json_extract(commentModeration, '$.reason') IS NOT NULL ORDER BY rowid DESC LIMIT 1
        `
            )
            .get(comment.cid) as { reason: string } | undefined;
        if (!result) return undefined;
        return result;
    }

    queryCommentFlagsSetByMod(cid: string): Pick<CommentUpdateType, "spoiler" | "pinned" | "locked" | "removed" | "nsfw"> {
        const query = `
            WITH flags_with_rank AS (
                SELECT commentCid,
                    json_extract(commentModeration, '$.spoiler') AS spoiler, json_extract(commentModeration, '$.pinned') AS pinned,
                    json_extract(commentModeration, '$.locked') AS locked, json_extract(commentModeration, '$.removed') AS removed,
                    json_extract(commentModeration, '$.nsfw') AS nsfw,
                    ROW_NUMBER() OVER (PARTITION BY commentCid, CASE WHEN json_extract(commentModeration, '$.spoiler') IS NOT NULL THEN 'spoiler' ELSE NULL END ORDER BY rowid DESC) AS spoiler_rank,
                    ROW_NUMBER() OVER (PARTITION BY commentCid, CASE WHEN json_extract(commentModeration, '$.pinned') IS NOT NULL THEN 'pinned' ELSE NULL END ORDER BY rowid DESC) AS pinned_rank,
                    ROW_NUMBER() OVER (PARTITION BY commentCid, CASE WHEN json_extract(commentModeration, '$.locked') IS NOT NULL THEN 'locked' ELSE NULL END ORDER BY rowid DESC) AS locked_rank,
                    ROW_NUMBER() OVER (PARTITION BY commentCid, CASE WHEN json_extract(commentModeration, '$.removed') IS NOT NULL THEN 'removed' ELSE NULL END ORDER BY rowid DESC) AS removed_rank,
                    ROW_NUMBER() OVER (PARTITION BY commentCid, CASE WHEN json_extract(commentModeration, '$.nsfw') IS NOT NULL THEN 'nsfw' ELSE NULL END ORDER BY rowid DESC) AS nsfw_rank
                FROM ${TABLES.COMMENT_MODERATIONS} WHERE commentCid = ?
            )
            SELECT 
                MAX(CASE WHEN spoiler IS NOT NULL AND spoiler_rank = 1 THEN spoiler ELSE NULL END) AS spoiler,
                MAX(CASE WHEN pinned IS NOT NULL AND pinned_rank = 1 THEN pinned ELSE NULL END) AS pinned,
                MAX(CASE WHEN locked IS NOT NULL AND locked_rank = 1 THEN locked ELSE NULL END) AS locked,
                MAX(CASE WHEN removed IS NOT NULL AND removed_rank = 1 THEN removed ELSE NULL END) AS removed,
                MAX(CASE WHEN nsfw IS NOT NULL AND nsfw_rank = 1 THEN nsfw ELSE NULL END) AS nsfw
            FROM flags_with_rank
        `;
        const flags = this._db.prepare(query).get(cid) as
            | Record<keyof Pick<CommentUpdateType, "spoiler" | "pinned" | "locked" | "removed" | "nsfw">, 0 | 1 | null>
            | undefined;
        if (!flags) return {};

        return remeda.mapValues(removeNullUndefinedValues(flags), Boolean);
    }

    queryAuthorEditDeleted(cid: string): Pick<CommentEditsTableRow, "deleted"> | undefined {
        const result = this._db
            .prepare(
                `
            SELECT deleted FROM ${TABLES.COMMENT_EDITS}
            WHERE commentCid = ? AND (isAuthorEdit = 1 OR isAuthorEdit = TRUE) AND deleted IS NOT NULL ORDER BY rowid DESC LIMIT 1
        `
            )
            .get(cid) as { deleted: 0 | 1 | null } | undefined;
        return result && result.deleted !== null ? { deleted: Boolean(result.deleted) } : undefined;
    }

    private _queryModCommentFlair(
        comment: Pick<CommentsTableRow, "cid">
    ): { flair?: CommentModerationTableRow["commentModeration"]["flair"] } | undefined {
        const result = this._db
            .prepare(
                `
            SELECT json_extract(commentModeration, '$.flair') AS flair FROM ${TABLES.COMMENT_MODERATIONS}
            WHERE commentCid = ? AND json_extract(commentModeration, '$.flair') IS NOT NULL ORDER BY rowid DESC LIMIT 1
        `
            )
            .get(comment.cid) as { flair: string } | undefined;
        if (!result) return undefined;
        return { flair: JSON.parse(result.flair) as CommentModerationTableRow["commentModeration"]["flair"] };
    }

    private _queryLastChildCidAndLastReplyTimestamp(comment: Pick<CommentsTableRow, "cid">) {
        const lastChildCid = this._db
            .prepare(`SELECT cid FROM ${TABLES.COMMENTS} WHERE parentCid = ? ORDER BY rowid DESC LIMIT 1`)
            .get(comment.cid) as { cid: string } | undefined;
        const lastReplyTimestamp = this.queryMaximumTimestampUnderComment(comment);
        return { lastChildCid: lastChildCid?.cid, lastReplyTimestamp };
    }

    queryCalculatedCommentUpdate(
        comment: Pick<CommentsTableRow, "cid" | "authorSignerAddress" | "timestamp">
    ): Omit<CommentUpdateType, "signature" | "updatedAt" | "replies" | "protocolVersion"> {
        const authorSubplebbit = this.querySubplebbitAuthor(comment.authorSignerAddress);
        const authorEdit = this._queryLatestAuthorEdit(comment.cid, comment.authorSignerAddress);
        const commentUpdateCounts = this._queryCommentCounts(comment.cid);
        const moderatorReason = this._queryLatestModeratorReason(comment);
        const commentFlags = this.queryCommentFlagsSetByMod(comment.cid);
        const commentModFlair = this._queryModCommentFlair(comment);
        const lastChildAndLastReplyTimestamp = this._queryLastChildCidAndLastReplyTimestamp(comment);

        if (!authorSubplebbit) throw Error("Failed to query author.subplebbit in queryCalculatedCommentUpdate");
        return {
            cid: comment.cid,
            edit: authorEdit,
            ...commentUpdateCounts,
            flair: commentModFlair?.flair || authorEdit?.flair,
            ...commentFlags,
            reason: moderatorReason?.reason,
            author: { subplebbit: authorSubplebbit },
            ...lastChildAndLastReplyTimestamp
        };
    }

    queryLatestPostCid(): Pick<CommentsTableRow, "cid"> | undefined {
        return this._db.prepare(`SELECT cid FROM ${TABLES.COMMENTS} WHERE depth = 0 ORDER BY rowid DESC LIMIT 1`).get() as
            | Pick<CommentsTableRow, "cid">
            | undefined;
    }

    queryLatestCommentCid(): Pick<CommentsTableRow, "cid"> | undefined {
        return this._db.prepare(`SELECT cid FROM ${TABLES.COMMENTS} ORDER BY rowid DESC LIMIT 1`).get() as
            | Pick<CommentsTableRow, "cid">
            | undefined;
    }

    queryAllCommentsOrderedByIdAsc(): CommentsTableRow[] {
        const results = this._db.prepare(`SELECT * FROM ${TABLES.COMMENTS} ORDER BY rowid ASC`).all() as CommentsTableRow[];
        return results.map((r) => {
            const parsed = this._parseJsonFields(r, ["author", "signature", "flair", "extraProps"]);
            const result = this._intToBoolean(parsed, ["spoiler", "nsfw", "pendingApproval"]) as CommentsTableRow;
            return removeNullUndefinedValues(result);
        });
    }

    queryAuthorModEdits(authorSignerAddress: string): Pick<SubplebbitAuthor, "banExpiresAt" | "flair"> {
        const authorCommentCids = (
            this._db.prepare(`SELECT cid FROM ${TABLES.COMMENTS} WHERE authorSignerAddress = ?`).all(authorSignerAddress) as {
                cid: string;
            }[]
        ).map((r) => r.cid);
        if (authorCommentCids.length === 0) return {};
        const placeholders = authorCommentCids.map(() => "?").join(",");
        const modAuthorEditsRaw = this._db
            .prepare(
                `
            SELECT json_extract(commentModeration, '$.author') AS commentAuthorJson FROM ${TABLES.COMMENT_MODERATIONS}
            WHERE commentCid IN (${placeholders}) AND json_extract(commentModeration, '$.author') IS NOT NULL ORDER BY rowid DESC
        `
            )
            .all(...authorCommentCids) as { commentAuthorJson: string }[];

        const modAuthorEdits = modAuthorEditsRaw.map(
            (r) => JSON.parse(r.commentAuthorJson) as CommentModerationTableRow["commentModeration"]["author"]
        );
        const banAuthor = modAuthorEdits.find((ca) => typeof ca?.banExpiresAt === "number");
        const authorFlairByMod = modAuthorEdits.find((ca) => ca?.flair);
        const aggregateAuthor: Pick<SubplebbitAuthor, "banExpiresAt" | "flair"> = {};
        if (banAuthor?.banExpiresAt) aggregateAuthor.banExpiresAt = banAuthor.banExpiresAt;
        if (authorFlairByMod?.flair) aggregateAuthor.flair = authorFlairByMod.flair;
        return aggregateAuthor;
    }

    querySubplebbitAuthor(authorSignerAddress: string): SubplebbitAuthor | undefined {
        const authorCommentsData = this._db
            .prepare(
                `
            SELECT c.depth, c.rowid, c.timestamp, c.cid,
                   COALESCE(SUM(CASE WHEN v.vote = 1 THEN 1 ELSE 0 END), 0) as upvoteCount,
                   COALESCE(SUM(CASE WHEN v.vote = -1 THEN 1 ELSE 0 END), 0) as downvoteCount
            FROM ${TABLES.COMMENTS} c LEFT JOIN ${TABLES.VOTES} v ON c.cid = v.commentCid
            WHERE c.authorSignerAddress = ? GROUP BY c.cid
        `
            )
            .all(authorSignerAddress) as (Pick<CommentsTableRow, "depth" | "rowid" | "timestamp" | "cid"> & {
            upvoteCount: number;
            downvoteCount: number;
        })[];
        if (authorCommentsData.length === 0) return undefined;

        const authorPosts = authorCommentsData.filter((c) => c.depth === 0);
        const authorReplies = authorCommentsData.filter((c) => c.depth > 0);
        const postScore = remeda.sumBy(authorPosts, (p) => p.upvoteCount) - remeda.sumBy(authorPosts, (p) => p.downvoteCount);
        const replyScore = remeda.sumBy(authorReplies, (r) => r.upvoteCount) - remeda.sumBy(authorReplies, (r) => r.downvoteCount);
        const lastCommentCid = remeda.maxBy(authorCommentsData, (c) => c.rowid)?.cid;
        if (!lastCommentCid) throw Error("Failed to query subplebbitAuthor.lastCommentCid");
        const firstCommentTimestamp = remeda.minBy(authorCommentsData, (c) => c.rowid)?.timestamp;
        if (typeof firstCommentTimestamp !== "number") throw Error("Failed to query subbplebbitAuthor.firstCommentTimestamp");
        const modAuthorEdits = this.queryAuthorModEdits(authorSignerAddress);
        return { postScore, replyScore, lastCommentCid, ...modAuthorEdits, firstCommentTimestamp };
    }

    private _getAllDescendantCids(cid: string): string[] {
        const allCids: string[] = [cid];
        const directChildren = this._db.prepare(`SELECT cid FROM ${TABLES.COMMENTS} WHERE parentCid = ?`).all(cid) as { cid: string }[];

        for (const child of directChildren) {
            allCids.push(...this._getAllDescendantCids(child.cid));
        }

        return allCids;
    }

    purgeComment(cid: string, isNestedCall: boolean = false): string[] {
        const log = Logger("plebbit-js:local-subplebbit:db-handler:purgeComment");
        const purgedCids: string[] = [];
        if (!isNestedCall) this.createTransaction();

        try {
            // Get all CIDs that will be purged (including descendants) and their authors
            const allCidsToBeDeleted = this._getAllDescendantCids(cid);
            const allAffectedAuthors = new Set<string>();
            const commentsToForceUpdate = new Set<string>();

            // Collect all unique authorSignerAddresses from comments that will be purged
            if (!isNestedCall) {
                for (const cidToDelete of allCidsToBeDeleted) {
                    const commentToDelete = this.queryComment(cidToDelete);
                    if (!commentToDelete) {
                        throw new Error(`Comment with cid ${cidToDelete} not found when attempting to purge`);
                    }
                    if (!commentToDelete.authorSignerAddress) {
                        throw new Error(`Comment with cid ${cidToDelete} has no authorSignerAddress`);
                    }
                    allAffectedAuthors.add(commentToDelete.authorSignerAddress);

                    // Collect comments that received votes FROM this purged comment
                    const votesFromPurgedComment = this._db
                        .prepare(`SELECT commentCid FROM ${TABLES.VOTES} WHERE authorSignerAddress = ?`)
                        .all(commentToDelete.authorSignerAddress) as { commentCid: string }[];
                    votesFromPurgedComment.forEach((vote) => commentsToForceUpdate.add(vote.commentCid));

                    // Collect comments that received edits FROM this purged comment
                    const editsFromPurgedComment = this._db
                        .prepare(`SELECT commentCid FROM ${TABLES.COMMENT_EDITS} WHERE authorSignerAddress = ?`)
                        .all(commentToDelete.authorSignerAddress) as { commentCid: string }[];
                    editsFromPurgedComment.forEach((edit) => commentsToForceUpdate.add(edit.commentCid));

                    // Collect parent comments of purged comments (for reply count updates)
                    if (commentToDelete.parentCid) {
                        const allAncestors = this.queryParentsCids(commentToDelete);
                        allAncestors.forEach((ancestor) => commentsToForceUpdate.add(ancestor.cid));
                    }
                }
            }

            const directChildren = this._db.prepare(`SELECT cid FROM ${TABLES.COMMENTS} WHERE parentCid = ?`).all(cid) as { cid: string }[];
            for (const child of directChildren) purgedCids.push(...this.purgeComment(child.cid, true));

            this._db.prepare(`DELETE FROM ${TABLES.VOTES} WHERE commentCid = ?`).run(cid);
            this._db.prepare(`DELETE FROM ${TABLES.COMMENT_EDITS} WHERE commentCid = ?`).run(cid);

            const commentUpdate = this.queryStoredCommentUpdate({ cid });
            if (commentUpdate) {
                if (commentUpdate.postCommentUpdateCid) purgedCids.push(commentUpdate.postCommentUpdateCid);
                if (commentUpdate.replies?.pageCids) {
                    Object.values(commentUpdate.replies.pageCids).forEach((pageCid) => {
                        if (typeof pageCid === "string") purgedCids.push(pageCid);
                    });
                }
                this._db.prepare(`DELETE FROM ${TABLES.COMMENT_UPDATES} WHERE cid = ?`).run(cid);
            }
            const deleteResult = this._db.prepare(`DELETE FROM ${TABLES.COMMENTS} WHERE cid = ?`).run(cid);
            if (deleteResult.changes > 0) purgedCids.push(cid);

            // Force update on all comments by all affected authors since their statistics have changed
            if (!isNestedCall && (allAffectedAuthors.size > 0 || commentsToForceUpdate.size > 0)) {
                const allAffectedAuthorCids: string[] = [];

                for (const authorSignerAddress of allAffectedAuthors) {
                    const authorCommentCids = this._db
                        .prepare(`SELECT cid FROM ${TABLES.COMMENTS} WHERE authorSignerAddress = ?`)
                        .all(authorSignerAddress) as { cid: string }[];

                    allAffectedAuthorCids.push(...authorCommentCids.map((c) => c.cid));
                }

                // Combine author comments and comments that received votes/edits/replies from purged comments
                const allCommentsToUpdate = [...allAffectedAuthorCids, ...Array.from(commentsToForceUpdate)];

                // Force update on a random comment to ensure IPNS update triggers even if no other comments need updating
                // Make sure we don't select a comment that's being purged
                const placeholders = allCidsToBeDeleted.map(() => "?").join(",");
                const randomComment = this._db
                    .prepare(`SELECT cid FROM ${TABLES.COMMENTS} WHERE cid NOT IN (${placeholders}) ORDER BY RANDOM() LIMIT 1`)
                    .get(...allCidsToBeDeleted) as { cid: string } | undefined;
                if (randomComment) {
                    allCommentsToUpdate.push(randomComment.cid);
                    log(`Forcing update on random comment ${randomComment.cid} to ensure IPNS update after purge`);
                } else {
                    log(`No comments left to force update after purge - IPNS will update to show empty subplebbit`);
                }

                if (allCommentsToUpdate.length > 0) {
                    this.forceUpdateOnAllCommentsWithCid(allCommentsToUpdate);
                }
            }

            if (!isNestedCall) this.commitTransaction();
            return remeda.unique(purgedCids);
        } catch (error) {
            log.error(`Error during comment purge for ${cid}: ${error}`);
            if (!isNestedCall) this.rollbackTransaction();
            throw error;
        }
    }

    async changeDbFilename(oldDbName: string, newDbName: string) {
        const log = Logger("plebbit-js:local-subplebbit:db-handler:changeDbFilename");
        if (this._db || this._keyv) await this.destoryConnection();

        this._transactionDepth = 0;

        const dataPath = this._subplebbit._plebbit.dataPath!;
        const oldPathString = path.join(dataPath, "subplebbits", oldDbName);
        const newPathString = path.join(dataPath, "subplebbits", newDbName);
        await fs.promises.mkdir(path.dirname(oldPathString), { recursive: true });
        await fs.promises.mkdir(path.dirname(newPathString), { recursive: true });

        try {
            // Check if oldDb exists before attempting to open for backup
            if (!fs.existsSync(oldPathString)) {
                log(`Old DB file ${oldPathString} does not exist. Cannot backup/rename.`);
                // If old doesn't exist, maybe we just want to set up the new path?
                // For now, this will mean the operation can't proceed as intended.
            } else {
                const sourceDb = new Database(oldPathString, { fileMustExist: true });
                await sourceDb.backup(newPathString); // backup is synchronous in better-sqlite3 v8+
                sourceDb.close();
                if (os.type() === "Windows_NT") await deleteOldSubplebbitInWindows(oldPathString, this._subplebbit._plebbit);
                else await fs.promises.rm(oldPathString, { force: true });
            }
        } catch (error) {
            log.error(`Failed to backup/rename database from ${oldPathString} to ${newPathString}: `, error);
            throw error;
        }
        this._dbConfig = { ...this._dbConfig, filename: newPathString };
        log(`Changed db path from (${oldPathString}) to (${newPathString})`);
    }

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

    markCommentsAsPublishedToPostUpdates(commentCids: string[]): void {
        if (commentCids.length === 0) return;
        const stmt = this._db.prepare(
            `UPDATE ${TABLES.COMMENT_UPDATES} SET publishedToPostUpdatesMFS = 1 WHERE cid IN (${commentCids.map(() => "?").join(",")})`
        );
        stmt.run(...commentCids);
    }

    forceUpdateOnAllComments(): void {
        this._db.prepare(`UPDATE ${TABLES.COMMENT_UPDATES} SET publishedToPostUpdatesMFS = 0`).run();
    }

    forceUpdateOnAllCommentsWithCid(commentCids: string[]): void {
        if (commentCids.length === 0) return;
        this._db
            .prepare(
                `UPDATE ${TABLES.COMMENT_UPDATES} SET publishedToPostUpdatesMFS = 0 WHERE cid IN (${commentCids.map(() => "?").join(",")})`
            )
            .run(...commentCids);
    }

    queryAllCidsUnderThisSubplebbit(): Set<string> {
        const allCids = new Set<string>();
        (this._db.prepare(`SELECT cid FROM ${TABLES.COMMENTS}`).all() as { cid: string }[]).forEach((c) => allCids.add(c.cid));
        (
            this._db.prepare(`SELECT postCommentUpdateCid FROM ${TABLES.COMMENT_UPDATES} WHERE postCommentUpdateCid IS NOT NULL`).all() as {
                postCommentUpdateCid: string;
            }[]
        ).forEach((row) => allCids.add(row.postCommentUpdateCid));
        const pageCidsResult = this._db
            .prepare(
                `SELECT json_extract(replies, '$.pageCids') AS pageCids 
                             FROM ${TABLES.COMMENT_UPDATES} 
                             WHERE json_extract(replies, '$.pageCids') IS NOT NULL`
            )
            .all() as { pageCids: string }[];

        pageCidsResult.forEach((row) => {
            const pageCidsParsed = JSON.parse(row.pageCids) as NonNullable<RepliesPagesIpfsDefinedManuallyType["pageCids"]>;

            Object.values(pageCidsParsed).forEach((cid) => allCids.add(cid));
        });
        return allCids;
    }

    queryPostsWithActiveScore(
        pageOptions: Omit<PageOptions, "pageSize" | "preloadedPage" | "baseTimestamp" | "firstPageSizeBytes">
    ): (PageIpfs["comments"][0] & { activeScore: number })[] {
        const activeScoresCte = `
            WITH RECURSIVE descendants AS (
                SELECT p.cid AS post_cid, p.cid AS current_cid, p.timestamp FROM ${TABLES.COMMENTS} p WHERE p.depth = 0
                UNION ALL
                SELECT d.post_cid, c.cid AS current_cid, c.timestamp FROM ${TABLES.COMMENTS} c
                INNER JOIN ${TABLES.COMMENT_UPDATES} cu ON c.cid = cu.cid
                LEFT JOIN (SELECT cid, json_extract(edit, '$.deleted') AS deleted_flag FROM ${TABLES.COMMENT_UPDATES}) AS d ON c.cid = d.cid
                JOIN descendants d ON c.parentCid = d.current_cid
                WHERE c.subplebbitAddress = :subAddress AND (cu.removed IS NOT 1 AND cu.removed IS NOT TRUE) AND (d.deleted_flag IS NULL OR d.deleted_flag != 1)
            ) SELECT post_cid, MAX(timestamp) as active_score FROM descendants GROUP BY post_cid
        `;
        const commentUpdateCols = remeda.keys.strict(
            pageOptions.commentUpdateFieldsToExclude
                ? remeda.omit(CommentUpdateSchema.shape, pageOptions.commentUpdateFieldsToExclude)
                : CommentUpdateSchema.shape
        );
        const commentUpdateSelects = commentUpdateCols.map((col) => `cu.${col} AS commentUpdate_${col}`);
        const commentIpfsCols = [...remeda.keys.strict(CommentIpfsSchema.shape), "extraProps"];
        const commentIpfsSelects = commentIpfsCols.map((col) => `c.${col} AS commentIpfs_${col}`);

        let postsQueryStr = `
            SELECT ${commentIpfsSelects.join(", ")}, ${commentUpdateSelects.join(", ")}, asc_scores.active_score
            FROM ${TABLES.COMMENTS} c INNER JOIN ${TABLES.COMMENT_UPDATES} cu ON c.cid = cu.cid
            INNER JOIN (${activeScoresCte}) AS asc_scores ON c.cid = asc_scores.post_cid
            WHERE c.depth = 0
        `;
        const params: Record<string, any> = { subAddress: this._subplebbit.address };

        if (pageOptions.excludeCommentsWithDifferentSubAddress) {
            postsQueryStr += ` AND c.subplebbitAddress = :pageSubAddress`;
            params.pageSubAddress = this._subplebbit.address;
        }
        if (pageOptions.excludeRemovedComments) postsQueryStr += ` AND (cu.removed IS NOT 1 AND cu.removed IS NOT TRUE)`;
        if (pageOptions.excludeDeletedComments)
            postsQueryStr += ` AND (json_extract(cu.edit, '$.deleted') IS NULL OR json_extract(cu.edit, '$.deleted') != 1)`;
        // Always exclude posts pending approval from posts pages
        postsQueryStr += ` AND (c.pendingApproval IS NULL OR c.pendingApproval != 1)`;

        const postsRaw = this._db.prepare(postsQueryStr).all(params) as (PrefixedCommentRow & { active_score: number })[];
        return postsRaw.map((postRaw) => {
            if (postRaw["commentIpfs_depth"] === 0) delete postRaw["commentIpfs_postCid"]; // postCid is only included in file added to ipfs when depth > 0
            const commentIpfsData = remeda.pickBy(postRaw, (v, k) => k.startsWith("commentIpfs_"));
            const commentUpdateData = remeda.pickBy(postRaw, (v, k) => k.startsWith("commentUpdate_"));
            const parsedCommentIpfs = this._spreadExtraProps(
                this._parseJsonFields(
                    this._intToBoolean(commentIpfsData as CommentIpfsPrefixedColumns, ["commentIpfs_spoiler", "commentIpfs_nsfw"]),
                    ["commentIpfs_author", "commentIpfs_signature", "commentIpfs_flair", "commentIpfs_extraProps"]
                )!
            );
            const parsedCommentUpdate = this._spreadExtraProps(
                this._parseJsonFields(
                    this._intToBoolean(commentUpdateData as CommentUpdatePrefixedColumns, [
                        "commentUpdate_spoiler",
                        "commentUpdate_nsfw",
                        "commentUpdate_pinned",
                        "commentUpdate_locked",
                        "commentUpdate_removed"
                    ]),
                    [
                        "commentUpdate_edit",
                        "commentUpdate_flair",
                        "commentUpdate_signature",
                        "commentUpdate_author",
                        "commentUpdate_replies"
                    ]
                )!
            );

            const cleanedCommentIpfs = removeNullUndefinedValues(parsedCommentIpfs);
            const cleanedCommentUpdate = removeNullUndefinedValues(parsedCommentUpdate);

            return {
                comment: remeda.mapKeys(remeda.omit(cleanedCommentIpfs, ["commentIpfs_extraProps"]) as CommentIpfsPrefixedColumns, (k) =>
                    k.replace("commentIpfs_", "")
                ) as CommentIpfsType,
                commentUpdate: remeda.mapKeys(cleanedCommentUpdate, (k) => k.replace("commentUpdate_", "")) as CommentUpdateType,
                activeScore: postRaw.active_score
            };
        });
    }

    private _processRecordsForDbBeforeInsert<T extends Record<string, any>>(records: T[]): T[] {
        return records.map((record) => {
            const processed = { ...record };
            for (const [key, value] of remeda.entries(processed)) {
                if (remeda.isPlainObject(value)) (processed as any)[key] = JSON.stringify(value);
                else if (typeof value === "boolean") (processed as any)[key] = value ? 1 : 0;
            }
            return processed;
        });
    }

    private _spreadExtraProps<T extends Record<string, any>>(record: T): T {
        const extraPropsNames = ["extraProps", "commentIpfs_extraProps", "commentUpdate_extaProps"];
        extraPropsNames.forEach((extraPropName) => {
            record = { ...record, ...record[extraPropName] };
            delete record[extraPropName];
        });
        return record;
    }
}
