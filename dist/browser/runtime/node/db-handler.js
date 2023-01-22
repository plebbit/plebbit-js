"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbHandler = void 0;
var challenge_1 = require("../../challenge");
var author_1 = __importDefault(require("../../author"));
var util_1 = require("../../util");
var knex_1 = __importDefault(require("knex"));
var path_1 = __importDefault(require("path"));
var assert_1 = __importDefault(require("assert"));
var fs_1 = __importDefault(require("fs"));
var keyv_1 = __importDefault(require("keyv"));
var plebbit_logger_1 = __importDefault(require("@plebbit/plebbit-logger"));
var util_2 = require("./util");
var version_1 = __importDefault(require("../../version"));
var sumBy_1 = __importDefault(require("lodash/sumBy"));
var lodash_1 = __importDefault(require("lodash"));
var comment_edit_1 = require("../../comment-edit");
var constants_1 = require("../../constants");
var util_3 = require("../../signer/util");
var signer_1 = require("../../signer");
var lockfile = __importStar(require("proper-lockfile"));
var TABLES = Object.freeze({
    COMMENTS: "comments",
    VOTES: "votes",
    AUTHORS: "authors",
    CHALLENGES: "challenges",
    SIGNERS: "signers",
    EDITS: "edits"
});
var defaultPageOption = {
    excludeDeletedComments: false,
    excludeRemovedComments: false,
    ensurePinnedCommentsAreOnTop: false,
    excludeCommentsWithDifferentSubAddress: true,
    excludeCommentsWithNoUpdate: false,
    pageSize: 50
};
var DbHandler = /** @class */ (function () {
    function DbHandler(subplebbit) {
        this._subplebbit = subplebbit;
        this._currentTrxs = {};
        this._createdTables = false;
    }
    DbHandler.prototype.initDbConfigIfNeeded = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!!this._dbConfig) return [3 /*break*/, 2];
                        _a = this;
                        return [4 /*yield*/, (0, util_2.getDefaultSubplebbitDbConfig)(this._subplebbit)];
                    case 1:
                        _a._dbConfig = _b.sent();
                        _b.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    DbHandler.prototype.initDbIfNeeded = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, assert_1.default)(typeof this._subplebbit.address === "string" && this._subplebbit.address.length > 0, "DbHandler needs to be an instantiated with a Subplebbit that has a valid address, (".concat(this._subplebbit.address, ") was provided"));
                        return [4 /*yield*/, this.initDbConfigIfNeeded()];
                    case 1:
                        _a.sent();
                        if (!this._knex)
                            this._knex = (0, knex_1.default)(this._dbConfig);
                        if (!!this._createdTables) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.createTablesIfNeeded()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        if (!this._keyv)
                            this._keyv = new keyv_1.default("sqlite://".concat(this._dbConfig.connection.filename));
                        return [4 /*yield*/, this._migrateFromDbV2IfNeeded()];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DbHandler.prototype.getDbConfig = function () {
        return this._dbConfig;
    };
    DbHandler.prototype.keyvGet = function (key, options) {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._keyv.get(key, options)];
                    case 1:
                        res = _a.sent();
                        if (!(JSON.stringify(res) === "{}")) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.keyvDelete(key)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, undefined];
                    case 3: return [2 /*return*/, res];
                }
            });
        });
    };
    DbHandler.prototype.keyvSet = function (key, value, ttl) {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._keyv.set(key, value, ttl)];
                    case 1:
                        res = _a.sent();
                        return [2 /*return*/, res];
                }
            });
        });
    };
    DbHandler.prototype.keyvDelete = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._keyv.delete(key)];
                    case 1:
                        res = _a.sent();
                        return [2 /*return*/, res];
                }
            });
        });
    };
    DbHandler.prototype.keyvHas = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._keyv.has(key)];
                    case 1:
                        res = _a.sent();
                        return [2 /*return*/, res];
                }
            });
        });
    };
    DbHandler.prototype.destoryConnection = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._knex) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._knex.destroy()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    DbHandler.prototype.createTransaction = function (transactionId) {
        return __awaiter(this, void 0, void 0, function () {
            var trx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, assert_1.default)(!this._currentTrxs[transactionId]);
                        return [4 /*yield*/, this._knex.transaction()];
                    case 1:
                        trx = _a.sent();
                        this._currentTrxs[transactionId] = trx;
                        return [2 /*return*/, trx];
                }
            });
        });
    };
    DbHandler.prototype.commitTransaction = function (transactionId) {
        return __awaiter(this, void 0, void 0, function () {
            var trx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        trx = this._currentTrxs[transactionId];
                        (0, assert_1.default)(trx && trx.isTransaction && !trx.isCompleted(), "Transaction (".concat(transactionId, ") needs to be stored to commit"));
                        return [4 /*yield*/, this._currentTrxs[transactionId].commit()];
                    case 1:
                        _a.sent();
                        delete this._currentTrxs[transactionId];
                        return [2 /*return*/];
                }
            });
        });
    };
    DbHandler.prototype.rollbackTransaction = function (transactionId) {
        return __awaiter(this, void 0, void 0, function () {
            var log, trx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:db-handler:rollbackTransaction");
                        trx = this._currentTrxs[transactionId];
                        if (!trx) return [3 /*break*/, 2];
                        (0, assert_1.default)(trx && trx.isTransaction && !trx.isCompleted(), "Transaction (".concat(transactionId, ") needs to be stored to rollback"));
                        return [4 /*yield*/, this._currentTrxs[transactionId].rollback()];
                    case 1:
                        _a.sent();
                        delete this._currentTrxs[transactionId];
                        _a.label = 2;
                    case 2:
                        log.trace("Rolledback transaction (".concat(transactionId, "), this._currentTrxs[transactionId].length = ").concat(Object.keys(this._currentTrxs).length));
                        return [2 /*return*/];
                }
            });
        });
    };
    DbHandler.prototype._baseTransaction = function (trx) {
        return trx ? trx : this._knex;
    };
    DbHandler.prototype._createCommentsTable = function (tableName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._knex.schema.createTable(tableName, function (table) {
                            table.text("cid").notNullable().primary().unique();
                            table.text("authorAddress").notNullable().references("address").inTable(TABLES.AUTHORS);
                            table.json("author").notNullable();
                            table.string("link").nullable();
                            table.string("thumbnailUrl").nullable();
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
                            table.boolean("spoiler").defaultTo(false);
                            table.boolean("pinned").defaultTo(false);
                            table.boolean("locked").defaultTo(false);
                            table.boolean("removed").defaultTo(false);
                            table.text("moderatorReason").nullable();
                            table.text("protocolVersion").notNullable();
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DbHandler.prototype._createVotesTable = function (tableName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._knex.schema.createTable(tableName, function (table) {
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
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DbHandler.prototype._createAuthorsTable = function (tableName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._knex.schema.createTable(tableName, function (table) {
                            table.text("address").notNullable().primary().unique();
                            table.timestamp("banExpiresAt").nullable();
                            table.json("flair").nullable();
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DbHandler.prototype._createChallengesTable = function (tableName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._knex.schema.createTable(tableName, function (table) {
                            table.uuid("challengeRequestId").notNullable().primary().unique();
                            table.enum("type", Object.values(challenge_1.PUBSUB_MESSAGE_TYPES)).notNullable();
                            table.text("userAgent");
                            table.text("protocolVersion");
                            table.json("acceptedChallengeTypes").nullable().defaultTo(null);
                            table.json("challenges").nullable();
                            table.uuid("challengeAnswerId").nullable();
                            table.json("challengeAnswers").nullable();
                            table.boolean("challengeSuccess").nullable();
                            table.json("challengeErrors").nullable();
                            table.text("reason").nullable();
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DbHandler.prototype._createSignersTable = function (tableName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._knex.schema.createTable(tableName, function (table) {
                            table.text("ipnsKeyName").notNullable().unique().primary();
                            table.text("privateKey").notNullable().unique();
                            table.text("type").notNullable(); // RSA or any other type
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DbHandler.prototype._createEditsTable = function (tableName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._knex.schema.createTable(tableName, function (table) {
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
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DbHandler.prototype.getDbVersion = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = Number;
                        return [4 /*yield*/, this._knex.raw("PRAGMA user_version")];
                    case 1: return [2 /*return*/, _a.apply(void 0, [(_b.sent())[0]["user_version"]])];
                }
            });
        });
    };
    DbHandler.prototype.createTablesIfNeeded = function () {
        return __awaiter(this, void 0, void 0, function () {
            var log, dbVersion, needToMigrate, createTableFunctions, tables;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:db-handler:createTablesIfNeeded");
                        return [4 /*yield*/, this.getDbVersion()];
                    case 1:
                        dbVersion = _a.sent();
                        log.trace("db version: ".concat(dbVersion));
                        needToMigrate = dbVersion !== version_1.default.DB_VERSION;
                        createTableFunctions = [
                            this._createCommentsTable,
                            this._createVotesTable,
                            this._createAuthorsTable,
                            this._createChallengesTable,
                            this._createSignersTable,
                            this._createEditsTable
                        ];
                        tables = Object.values(TABLES);
                        return [4 /*yield*/, Promise.all(tables.map(function (table) { return __awaiter(_this, void 0, void 0, function () {
                                var i, tableExists, tempTableName;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            i = tables.indexOf(table);
                                            return [4 /*yield*/, this._knex.schema.hasTable(table)];
                                        case 1:
                                            tableExists = _a.sent();
                                            if (!!tableExists) return [3 /*break*/, 3];
                                            log("Table ".concat(table, " does not exist. Will create schema"));
                                            return [4 /*yield*/, createTableFunctions[i].bind(this)(table)];
                                        case 2:
                                            _a.sent();
                                            return [3 /*break*/, 9];
                                        case 3:
                                            if (!(tableExists && needToMigrate)) return [3 /*break*/, 9];
                                            log("Migrating table ".concat(table, " to new schema"));
                                            return [4 /*yield*/, this._knex.raw("PRAGMA foreign_keys = OFF")];
                                        case 4:
                                            _a.sent();
                                            tempTableName = "".concat(table).concat(version_1.default.DB_VERSION);
                                            return [4 /*yield*/, createTableFunctions[i].bind(this)(tempTableName)];
                                        case 5:
                                            _a.sent();
                                            return [4 /*yield*/, this._copyTable(table, tempTableName)];
                                        case 6:
                                            _a.sent();
                                            return [4 /*yield*/, this._knex.schema.dropTable(table)];
                                        case 7:
                                            _a.sent();
                                            return [4 /*yield*/, this._knex.schema.renameTable(tempTableName, table)];
                                        case 8:
                                            _a.sent();
                                            _a.label = 9;
                                        case 9: return [2 /*return*/];
                                    }
                                });
                            }); }))];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this._knex.raw("PRAGMA foreign_keys = ON")];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this._knex.raw("PRAGMA user_version = ".concat(version_1.default.DB_VERSION))];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, this.getDbVersion()];
                    case 5:
                        dbVersion = _a.sent();
                        assert_1.default.equal(dbVersion, version_1.default.DB_VERSION);
                        this._createdTables = true;
                        return [2 /*return*/];
                }
            });
        });
    };
    DbHandler.prototype.isDbInMemory = function () {
        // Is database stored in memory rather on disk?
        //@ts-ignore
        return this._dbConfig.connection.filename === ":memory:";
    };
    DbHandler.prototype._copyTable = function (srcTable, dstTable) {
        return __awaiter(this, void 0, void 0, function () {
            var log, dstTableColumns, _a, _b, srcRecords, srcRecordFiltered;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:db-handler:createTablesIfNeeded:copyTable");
                        _b = (_a = Object).keys;
                        return [4 /*yield*/, this._knex(dstTable).columnInfo()];
                    case 1:
                        dstTableColumns = _b.apply(_a, [_c.sent()]);
                        return [4 /*yield*/, this._knex(srcTable).select("*")];
                    case 2:
                        srcRecords = _c.sent();
                        if (!(srcRecords.length > 0)) return [3 /*break*/, 4];
                        log("Attempting to copy ".concat(srcRecords.length, " ").concat(srcTable));
                        srcRecordFiltered = srcRecords.map(function (record) { return lodash_1.default.pick(record, dstTableColumns); });
                        return [4 /*yield*/, this._knex(dstTable).insert(srcRecordFiltered)];
                    case 3:
                        _c.sent();
                        _c.label = 4;
                    case 4:
                        log("copied table ".concat(srcTable, " to table ").concat(dstTable));
                        return [2 /*return*/];
                }
            });
        });
    };
    DbHandler.prototype.insertAuthor = function (author, trx) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._baseTransaction(trx)(TABLES.AUTHORS).insert(author)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DbHandler.prototype.updateAuthorInAuthorsTable = function (newAuthorProps, trx) {
        return __awaiter(this, void 0, void 0, function () {
            var onlyNewProps;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        onlyNewProps = (0, util_1.removeKeysWithUndefinedValues)(lodash_1.default.omit(newAuthorProps, ["address"]));
                        return [4 /*yield*/, this._baseTransaction(trx)(TABLES.AUTHORS).update(onlyNewProps).where("address", newAuthorProps.address)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DbHandler.prototype.updateAuthorInCommentsTable = function (newAuthorProps, trx) {
        return __awaiter(this, void 0, void 0, function () {
            var onlyNewProps, commentsWithAuthor;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        onlyNewProps = (0, util_1.removeKeysWithUndefinedValues)(lodash_1.default.omit(newAuthorProps, ["address"]));
                        return [4 /*yield*/, this.queryCommentsOfAuthor(newAuthorProps.address, trx)];
                    case 1:
                        commentsWithAuthor = _a.sent();
                        return [4 /*yield*/, Promise.all(commentsWithAuthor.map(function (commentProps) { return __awaiter(_this, void 0, void 0, function () {
                                var newCommentProps;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            newCommentProps = {
                                                author: JSON.stringify(__assign(__assign({}, commentProps.author), onlyNewProps))
                                            };
                                            return [4 /*yield*/, this._baseTransaction(trx)(TABLES.COMMENTS).update(newCommentProps).where("cid", commentProps.cid)];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); }))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DbHandler.prototype.queryAuthor = function (authorAddress, trx) {
        return __awaiter(this, void 0, void 0, function () {
            var authorProps;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._baseTransaction(trx)(TABLES.AUTHORS).where({ address: authorAddress }).first()];
                    case 1:
                        authorProps = _a.sent();
                        return [2 /*return*/, authorProps ? new author_1.default(authorProps).toJSON() : undefined];
                }
            });
        });
    };
    DbHandler.prototype.upsertVote = function (vote, trx) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._baseTransaction(trx)(TABLES.VOTES).insert(vote).onConflict(["commentCid", "authorAddress"]).merge()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DbHandler.prototype.insertComment = function (comment, trx) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._baseTransaction(trx)(TABLES.COMMENTS).insert(comment)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DbHandler.prototype.updateComment = function (comment, trx) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._baseTransaction(trx)(TABLES.COMMENTS).where({ cid: comment.cid }).update(comment)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DbHandler.prototype.insertEdit = function (edit, trx) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._baseTransaction(trx)(TABLES.EDITS).insert(edit)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DbHandler.prototype.queryEditsSorted = function (commentCid, editor, trx) {
        return __awaiter(this, void 0, void 0, function () {
            var authorAddress, _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, this._baseTransaction(trx)(TABLES.COMMENTS).select("authorAddress").where("cid", commentCid).first()];
                    case 1:
                        authorAddress = (_d.sent())
                            .authorAddress;
                        if (!!editor) return [3 /*break*/, 3];
                        _a = this._createEditsFromRows;
                        return [4 /*yield*/, this._baseTransaction(trx)(TABLES.EDITS).orderBy("id", "desc")];
                    case 2: return [2 /*return*/, _a.apply(this, [_d.sent()])];
                    case 3:
                        if (!(editor === "author")) return [3 /*break*/, 5];
                        _b = this._createEditsFromRows;
                        return [4 /*yield*/, this._baseTransaction(trx)(TABLES.EDITS).where("authorAddress", authorAddress).orderBy("id", "desc")];
                    case 4: return [2 /*return*/, _b.apply(this, [_d.sent()])];
                    case 5:
                        if (!(editor === "mod")) return [3 /*break*/, 7];
                        _c = this._createEditsFromRows;
                        return [4 /*yield*/, this._baseTransaction(trx)(TABLES.EDITS).whereNot("authorAddress", authorAddress).orderBy("id", "desc")];
                    case 6: return [2 /*return*/, _c.apply(this, [_d.sent()])];
                    case 7: return [2 /*return*/, []];
                }
            });
        });
    };
    DbHandler.prototype.editComment = function (edit, trx) {
        return __awaiter(this, void 0, void 0, function () {
            var commentProps, isEditFromAuthor, modEdits, hasModEditedCommentFlairBefore, flairIfNeeded, authorNewProps, commentCidIndex, modNewProps;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.queryComment(edit.commentCid, trx)];
                    case 1:
                        commentProps = _a.sent();
                        isEditFromAuthor = commentProps.signature.publicKey === edit.signature.publicKey;
                        if (!isEditFromAuthor) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.queryEditsSorted(edit.commentCid, "mod", trx)];
                    case 2:
                        modEdits = _a.sent();
                        hasModEditedCommentFlairBefore = modEdits.some(function (modEdit) { return Boolean(modEdit.flair); });
                        flairIfNeeded = hasModEditedCommentFlairBefore || !edit.flair ? undefined : { flair: JSON.stringify(edit.flair) };
                        authorNewProps = (0, util_1.removeKeysWithUndefinedValues)(__assign({ authorEdit: JSON.stringify(lodash_1.default.omit(edit, ["authorAddress", "challengeRequestId"])) }, flairIfNeeded));
                        return [4 /*yield*/, this._baseTransaction(trx)(TABLES.COMMENTS).update(authorNewProps).where("cid", edit.commentCid)];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 4:
                        commentCidIndex = comment_edit_1.MOD_EDIT_FIELDS.findIndex(function (value) { return value === "commentCid"; });
                        modNewProps = (0, util_1.removeKeysWithUndefinedValues)(lodash_1.default.pick(edit, comment_edit_1.MOD_EDIT_FIELDS.slice(commentCidIndex + 1)));
                        modNewProps = lodash_1.default.omit(modNewProps, "commentAuthor");
                        if (!(JSON.stringify(modNewProps) !== "{}")) return [3 /*break*/, 6];
                        return [4 /*yield*/, this._baseTransaction(trx)(TABLES.COMMENTS).update(modNewProps).where("cid", edit.commentCid)];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    DbHandler.prototype.upsertChallenge = function (challenge, trx) {
        return __awaiter(this, void 0, void 0, function () {
            var existingChallenge, dbObject;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._baseTransaction(trx)(TABLES.CHALLENGES)
                            .where({ challengeRequestId: challenge.challengeRequestId })
                            .first()];
                    case 1:
                        existingChallenge = _a.sent();
                        (0, assert_1.default)(challenge instanceof Object);
                        dbObject = __assign(__assign({}, existingChallenge), challenge);
                        return [4 /*yield*/, this._baseTransaction(trx)(TABLES.CHALLENGES).insert(dbObject).onConflict("challengeRequestId").merge()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DbHandler.prototype.getLastVoteOfAuthor = function (commentCid, authorAddress, trx) {
        return __awaiter(this, void 0, void 0, function () {
            var voteObj;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._baseTransaction(trx)(TABLES.VOTES)
                            .where({
                            commentCid: commentCid,
                            authorAddress: authorAddress
                        })
                            .first()];
                    case 1:
                        voteObj = _a.sent();
                        return [4 /*yield*/, this._createVotesFromRows(voteObj)];
                    case 2: return [2 /*return*/, (_a.sent())[0]];
                }
            });
        });
    };
    DbHandler.prototype._baseCommentQuery = function (trx, options) {
        var _a, _b;
        if (options === void 0) { options = defaultPageOption; }
        var upvoteQuery = this._baseTransaction(trx)(TABLES.VOTES)
            .count("".concat(TABLES.VOTES, ".vote"))
            .where((_a = {},
            _a["".concat(TABLES.COMMENTS, ".cid")] = this._knex.raw("".concat(TABLES.VOTES, ".commentCid")),
            _a["".concat(TABLES.VOTES, ".vote")] = 1,
            _a))
            .as("upvoteCount");
        var downvoteQuery = this._baseTransaction(trx)(TABLES.VOTES)
            .count("".concat(TABLES.VOTES, ".vote"))
            .where((_b = {},
            _b["".concat(TABLES.COMMENTS, ".cid")] = this._knex.raw("".concat(TABLES.VOTES, ".commentCid")),
            _b["".concat(TABLES.VOTES, ".vote")] = -1,
            _b))
            .as("downvoteCount");
        var query = this._baseTransaction(trx)(TABLES.COMMENTS)
            .select("".concat(TABLES.COMMENTS, ".*"), upvoteQuery, downvoteQuery)
            .jsonExtract("authorEdit", "$.deleted", "deleted", true);
        if (options.excludeCommentsWithDifferentSubAddress)
            query = query.where({ subplebbitAddress: this._subplebbit.address });
        if (options.excludeRemovedComments)
            query = query.whereNot("removed", 1);
        if (options.excludeDeletedComments)
            query = query.andWhereRaw("`deleted` is not 1");
        if (options.excludeCommentsWithNoUpdate)
            query = query.whereNotNull("updatedAt");
        return query;
    };
    DbHandler.prototype._parseJsonFields = function (obj) {
        var _a, _b;
        var newObj = __assign({}, obj);
        var booleanFields = ["deleted", "spoiler", "pinned", "locked", "removed"];
        for (var field in newObj) {
            if (booleanFields.includes(field) && typeof newObj[field] === "number")
                newObj[field] = Boolean(newObj[field]);
            if (typeof newObj[field] === "string")
                try {
                    newObj[field] = typeof JSON.parse(newObj[field]) === "object" ? JSON.parse(newObj[field]) : newObj[field];
                }
                catch (_c) { }
            if (((_b = (_a = newObj[field]) === null || _a === void 0 ? void 0 : _a.constructor) === null || _b === void 0 ? void 0 : _b.name) === "Object")
                newObj[field] = this._parseJsonFields(newObj[field]);
        }
        return newObj;
    };
    DbHandler.prototype._queryReplyCount = function (commentCid, trx) {
        return __awaiter(this, void 0, void 0, function () {
            var children, _a, _b, _c;
            var _this = this;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, this.queryCommentsUnderComment(commentCid, { excludeDeletedComments: true, excludeRemovedComments: true }, trx)];
                    case 1:
                        children = _d.sent();
                        _a = children.length;
                        _c = (_b = lodash_1.default).sum;
                        return [4 /*yield*/, Promise.all(children.map(function (comment) { return _this._queryReplyCount(comment.cid, trx); }))];
                    case 2: return [2 /*return*/, (_a + _c.apply(_b, [_d.sent()]))];
                }
            });
        });
    };
    DbHandler.prototype._createCommentsFromRows = function (commentsRows, trx) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                if (!commentsRows || (Array.isArray(commentsRows) && (commentsRows === null || commentsRows === void 0 ? void 0 : commentsRows.length) === 0))
                    return [2 /*return*/, []];
                if (!Array.isArray(commentsRows))
                    commentsRows = [commentsRows];
                return [2 /*return*/, Promise.all(commentsRows.map(function (props) { return __awaiter(_this, void 0, void 0, function () {
                        var replyCount, replacedProps;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, this._queryReplyCount(props.cid, trx)];
                                case 1:
                                    replyCount = _a.sent();
                                    replacedProps = this._parseJsonFields((0, util_1.replaceXWithY)(__assign(__assign({}, props), { replyCount: replyCount }), null, undefined));
                                    (0, assert_1.default)(typeof replacedProps.replyCount === "number" &&
                                        typeof replacedProps.upvoteCount === "number" &&
                                        typeof replacedProps.downvoteCount === "number");
                                    return [2 /*return*/, replacedProps];
                            }
                        });
                    }); }))];
            });
        });
    };
    DbHandler.prototype._createEditsFromRows = function (edits) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                if (!edits || (Array.isArray(edits) && (edits === null || edits === void 0 ? void 0 : edits.length) === 0))
                    return [2 /*return*/, []];
                if (!Array.isArray(edits))
                    edits = [edits];
                return [2 /*return*/, Promise.all(edits.map(function (props) { return __awaiter(_this, void 0, void 0, function () {
                        var replacedProps;
                        return __generator(this, function (_a) {
                            replacedProps = this._parseJsonFields((0, util_1.replaceXWithY)(props, null, undefined));
                            return [2 /*return*/, replacedProps];
                        });
                    }); }))];
            });
        });
    };
    DbHandler.prototype._createVotesFromRows = function (voteRows) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                if (!voteRows || (Array.isArray(voteRows) && voteRows.length === 0))
                    return [2 /*return*/, []];
                if (!Array.isArray(voteRows))
                    voteRows = [voteRows];
                return [2 /*return*/, Promise.all(voteRows.map(function (props) {
                        var replacedProps = _this._parseJsonFields((0, util_1.replaceXWithY)(props, null, undefined));
                        return replacedProps;
                    }))];
            });
        });
    };
    DbHandler.prototype.queryCommentsSortedByTimestamp = function (parentCid, order, options, trx) {
        if (order === void 0) { order = "desc"; }
        return __awaiter(this, void 0, void 0, function () {
            var comments;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        parentCid = parentCid || null;
                        return [4 /*yield*/, this._baseCommentQuery(trx, options).where({ parentCid: parentCid }).orderBy("timestamp", order)];
                    case 1:
                        comments = _a.sent();
                        return [2 /*return*/, this._createCommentsFromRows(comments, trx)];
                }
            });
        });
    };
    DbHandler.prototype.queryCommentsBetweenTimestampRange = function (parentCid, timestamp1, timestamp2, options, trx) {
        return __awaiter(this, void 0, void 0, function () {
            var rawCommentObjs;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        parentCid = parentCid || null;
                        if (timestamp1 === Number.NEGATIVE_INFINITY)
                            timestamp1 = 0;
                        return [4 /*yield*/, this._baseCommentQuery(trx, options)
                                .where({ parentCid: parentCid })
                                .whereBetween("timestamp", [timestamp1, timestamp2])];
                    case 1:
                        rawCommentObjs = _a.sent();
                        (0, assert_1.default)(!rawCommentObjs.some(function (comment) { return comment.timestamp < timestamp1 || comment.timestamp > timestamp2; }));
                        return [2 /*return*/, this._createCommentsFromRows(rawCommentObjs, trx)];
                }
            });
        });
    };
    DbHandler.prototype.queryTopCommentsBetweenTimestampRange = function (parentCid, timestamp1, timestamp2, options, trx) {
        return __awaiter(this, void 0, void 0, function () {
            var topScoreQuery, rawCommentsObjs;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (timestamp1 === Number.NEGATIVE_INFINITY)
                            timestamp1 = 0;
                        parentCid = parentCid || null;
                        topScoreQuery = this._baseTransaction(trx)(TABLES.VOTES)
                            .select(this._knex.raw("COALESCE(SUM(".concat(TABLES.VOTES, ".vote), 0)"))) // We're using raw expressions because there's no native method in Knexjs to return 0 if SUM is null
                            .where((_a = {},
                            _a["".concat(TABLES.COMMENTS, ".cid")] = this._knex.raw("".concat(TABLES.VOTES, ".commentCid")),
                            _a))
                            .as("topScore");
                        return [4 /*yield*/, this._baseCommentQuery(trx, options)
                                .select(topScoreQuery)
                                .groupBy("".concat(TABLES.COMMENTS, ".cid"))
                                .orderBy("topScore", "desc")
                                .whereBetween("".concat(TABLES.COMMENTS, ".timestamp"), [timestamp1, timestamp2])
                                .where((_b = {}, _b["".concat(TABLES.COMMENTS, ".parentCid")] = parentCid, _b))];
                    case 1:
                        rawCommentsObjs = _c.sent();
                        return [2 /*return*/, this._createCommentsFromRows(rawCommentsObjs, trx)];
                }
            });
        });
    };
    DbHandler.prototype.queryCommentsUnderComment = function (parentCid, options, trx) {
        return __awaiter(this, void 0, void 0, function () {
            var queryOptions, commentsObjs;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        queryOptions = __assign(__assign({}, defaultPageOption), options);
                        parentCid = parentCid || null;
                        return [4 /*yield*/, this._baseCommentQuery(trx, queryOptions).where({ parentCid: parentCid }).orderBy("timestamp", "desc")];
                    case 1:
                        commentsObjs = _a.sent();
                        return [2 /*return*/, this._createCommentsFromRows(commentsObjs, trx)];
                }
            });
        });
    };
    DbHandler.prototype.queryParentsOfComment = function (comment, trx) {
        return __awaiter(this, void 0, void 0, function () {
            var parents, curParentCid, parent_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        parents = [];
                        curParentCid = comment.parentCid;
                        _a.label = 1;
                    case 1:
                        if (!curParentCid) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.queryComment(curParentCid, trx)];
                    case 2:
                        parent_1 = _a.sent();
                        if (parent_1)
                            parents.push(parent_1);
                        curParentCid = parent_1 === null || parent_1 === void 0 ? void 0 : parent_1.parentCid;
                        return [3 /*break*/, 1];
                    case 3:
                        assert_1.default.equal(comment.depth, parents.length, "Depth should equal to parents length");
                        return [2 /*return*/, parents];
                }
            });
        });
    };
    DbHandler.prototype.queryComments = function (trx) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this._createCommentsFromRows;
                        return [4 /*yield*/, this._baseCommentQuery(trx).orderBy("id", "desc")];
                    case 1: return [2 /*return*/, _a.apply(this, [_b.sent(), trx])];
                }
            });
        });
    };
    DbHandler.prototype.querySubplebbitMetrics = function (trx) {
        return __awaiter(this, void 0, void 0, function () {
            var metrics, combinedMetrics;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.all(["PostCount", "ActiveUserCount"].map(function (metricType) { return __awaiter(_this, void 0, void 0, function () {
                            var _this = this;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, Promise.all(Object.keys(util_1.TIMEFRAMES_TO_SECONDS).map(function (timeframe) { return __awaiter(_this, void 0, void 0, function () {
                                            var propertyName, _a, from, to, res, query, res;
                                            var _b, _c;
                                            return __generator(this, function (_d) {
                                                switch (_d.label) {
                                                    case 0:
                                                        propertyName = "".concat(timeframe.toLowerCase()).concat(metricType);
                                                        _a = [Math.max(0, (0, util_1.timestamp)() - util_1.TIMEFRAMES_TO_SECONDS[timeframe]), (0, util_1.timestamp)()], from = _a[0], to = _a[1];
                                                        if (!(metricType === "ActiveUserCount")) return [3 /*break*/, 2];
                                                        return [4 /*yield*/, this._baseTransaction(trx)(TABLES.COMMENTS)
                                                                .countDistinct("comments.authorAddress")
                                                                .join(TABLES.VOTES, "".concat(TABLES.COMMENTS, ".authorAddress"), "=", "".concat(TABLES.VOTES, ".authorAddress"))
                                                                .whereBetween("comments.timestamp", [from, to])];
                                                    case 1:
                                                        res = (_d.sent())[0]["count(distinct `comments`.`authorAddress`)"];
                                                        return [2 /*return*/, (_b = {}, _b[propertyName] = res, _b)];
                                                    case 2:
                                                        if (!(metricType === "PostCount")) return [3 /*break*/, 4];
                                                        query = this._baseTransaction(trx)(TABLES.COMMENTS)
                                                            .count()
                                                            .whereBetween("timestamp", [from, to])
                                                            .whereNotNull("title");
                                                        return [4 /*yield*/, query];
                                                    case 3:
                                                        res = _d.sent();
                                                        return [2 /*return*/, (_c = {}, _c[propertyName] = res[0]["count(*)"], _c)];
                                                    case 4: return [2 /*return*/];
                                                }
                                            });
                                        }); }))];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            });
                        }); }))];
                    case 1:
                        metrics = _a.sent();
                        combinedMetrics = Object.assign.apply(Object, __spreadArray([{}], metrics.flat(), false));
                        return [2 /*return*/, combinedMetrics];
                }
            });
        });
    };
    DbHandler.prototype.queryComment = function (cid, trx) {
        return __awaiter(this, void 0, void 0, function () {
            var commentObj;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, assert_1.default)(typeof cid === "string" && cid.length > 0, "Can't query a comment with null cid (".concat(cid, ")"));
                        return [4 /*yield*/, this._baseCommentQuery(trx).where("cid", cid).first()];
                    case 1:
                        commentObj = _a.sent();
                        return [4 /*yield*/, this._createCommentsFromRows(commentObj, trx)];
                    case 2: return [2 /*return*/, (_a.sent())[0]];
                }
            });
        });
    };
    DbHandler.prototype.queryPinnedComments = function (parentCid, trx) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        parentCid = parentCid || null;
                        _a = this._createCommentsFromRows;
                        return [4 /*yield*/, this._baseCommentQuery(trx).where({ parentCid: parentCid, pinned: true })];
                    case 1: return [2 /*return*/, _a.apply(this, [_b.sent(), trx])];
                }
            });
        });
    };
    DbHandler.prototype.queryLatestPost = function (trx) {
        return __awaiter(this, void 0, void 0, function () {
            var commentObj, post;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._baseCommentQuery(trx).whereNotNull("title").orderBy("id", "desc").first()];
                    case 1:
                        commentObj = _a.sent();
                        return [4 /*yield*/, this._createCommentsFromRows(commentObj, trx)];
                    case 2:
                        post = (_a.sent())[0];
                        if (!post)
                            return [2 /*return*/, undefined];
                        return [2 /*return*/, post];
                }
            });
        });
    };
    DbHandler.prototype.insertSigner = function (signer, trx) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._baseTransaction(trx)(TABLES.SIGNERS).insert(signer)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DbHandler.prototype.querySigner = function (ipnsKeyName, trx) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this._baseTransaction(trx)(TABLES.SIGNERS).where({ ipnsKeyName: ipnsKeyName }).first()];
            });
        });
    };
    DbHandler.prototype.queryCommentsGroupByDepth = function (trx) {
        return __awaiter(this, void 0, void 0, function () {
            var maxDepth, depths, comments;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._baseTransaction(trx)(TABLES.COMMENTS).max("depth")];
                    case 1:
                        maxDepth = (_a.sent())[0]["max(`depth`)"];
                        if (typeof maxDepth !== "number")
                            return [2 /*return*/, [[]]];
                        depths = new Array(maxDepth + 1).fill(null).map(function (value, i) { return i; });
                        return [4 /*yield*/, Promise.all(depths.map(function (depth) { return __awaiter(_this, void 0, void 0, function () {
                                var commentsWithDepth;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this._baseCommentQuery(trx).where({ depth: depth })];
                                        case 1:
                                            commentsWithDepth = _a.sent();
                                            return [2 /*return*/, this._createCommentsFromRows(commentsWithDepth, trx)];
                                    }
                                });
                            }); }))];
                    case 2:
                        comments = _a.sent();
                        return [2 /*return*/, comments];
                }
            });
        });
    };
    DbHandler.prototype.queryCountOfPosts = function (pageOptions, trx) {
        return __awaiter(this, void 0, void 0, function () {
            var obj;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._baseCommentQuery(trx, pageOptions).count().where({ depth: 0 }).first()];
                    case 1:
                        obj = _a.sent();
                        if (!obj)
                            return [2 /*return*/, 0];
                        return [2 /*return*/, Number(obj["count(*)"])];
                }
            });
        });
    };
    DbHandler.prototype.queryCommentsOfAuthor = function (authorAddress, trx) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this._createCommentsFromRows;
                        return [4 /*yield*/, this._baseCommentQuery(trx).where({ authorAddress: authorAddress })];
                    case 1: return [2 /*return*/, _a.apply(this, [_b.sent(), trx])];
                }
            });
        });
    };
    DbHandler.prototype.querySubplebbitAuthorFields = function (authorAddress, trx) {
        return __awaiter(this, void 0, void 0, function () {
            var authorComments, authorPosts, authorReplies, postScore, replyScore, lastCommentCid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.queryCommentsOfAuthor(authorAddress)];
                    case 1:
                        authorComments = _a.sent();
                        authorPosts = authorComments.filter(function (comment) { return comment.depth === 0; });
                        authorReplies = authorComments.filter(function (comment) { return comment.depth > 0; });
                        postScore = (0, sumBy_1.default)(authorPosts, function (post) { return post.upvoteCount; }) - (0, sumBy_1.default)(authorPosts, function (post) { return post.downvoteCount; });
                        replyScore = (0, sumBy_1.default)(authorReplies, function (reply) { return reply.upvoteCount; }) - (0, sumBy_1.default)(authorReplies, function (reply) { return reply.downvoteCount; });
                        return [4 /*yield*/, this._baseTransaction(trx)(TABLES.COMMENTS).select("cid").where({ authorAddress: authorAddress }).orderBy("id", "desc").first()];
                    case 2:
                        lastCommentCid = (_a.sent())["cid"];
                        if (typeof lastCommentCid !== "string")
                            throw Error("lastCommentCid should be always defined");
                        return [2 /*return*/, { postScore: postScore, replyScore: replyScore, lastCommentCid: lastCommentCid }];
                }
            });
        });
    };
    DbHandler.prototype.changeDbFilename = function (newDbFileName, newSubplebbit) {
        return __awaiter(this, void 0, void 0, function () {
            var log, oldPathString, newPath;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:db-handler:changeDbFilename");
                        oldPathString = this._dbConfig.connection.filename;
                        assert_1.default.ok(oldPathString, "subplebbit._dbConfig either does not exist or DB connection is in memory");
                        this._currentTrxs = {};
                        this._subplebbit = newSubplebbit;
                        if (oldPathString === ":memory:") {
                            log.trace("No need to change file name of db since it's in memory");
                            return [2 /*return*/];
                        }
                        newPath = path_1.default.format({ dir: path_1.default.dirname(oldPathString), base: newDbFileName });
                        return [4 /*yield*/, fs_1.default.promises.mkdir(path_1.default.dirname(newPath), { recursive: true })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, fs_1.default.promises.rename(oldPathString, newPath)];
                    case 2:
                        _a.sent();
                        this._dbConfig = __assign(__assign({}, this._dbConfig), { connection: __assign(__assign({}, this._dbConfig.connection), { filename: newPath }) });
                        //@ts-ignore
                        this._knex = this._keyv = undefined;
                        return [4 /*yield*/, this.initDbIfNeeded()];
                    case 3:
                        _a.sent();
                        log("Changed db path from (".concat(oldPathString, ") to (").concat(newPath, ")"));
                        return [2 /*return*/];
                }
            });
        });
    };
    // Start lock
    DbHandler.prototype.lockSubStart = function (subAddress) {
        if (subAddress === void 0) { subAddress = this._subplebbit.address; }
        return __awaiter(this, void 0, void 0, function () {
            var log, lockfilePath, subDbPath, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (subAddress === this._subplebbit.address && this.isDbInMemory())
                            return [2 /*return*/];
                        log = (0, plebbit_logger_1.default)("plebbit-js:lock:start");
                        lockfilePath = path_1.default.join(this._subplebbit.plebbit.dataPath, "subplebbits", "".concat(subAddress, ".start.lock"));
                        subDbPath = path_1.default.join(this._subplebbit.plebbit.dataPath, "subplebbits", subAddress);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, lockfile.lock(subDbPath, {
                                lockfilePath: lockfilePath,
                                realpath: false,
                                onCompromised: function () { }
                            })];
                    case 2:
                        _a.sent();
                        log("Locked the start of subplebbit (".concat(subAddress, ") successfully"));
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        if (e_1.message === "Lock file is already being held")
                            (0, util_1.throwWithErrorCode)("ERR_SUB_ALREADY_STARTED", "subAddress=".concat(subAddress));
                        else {
                            log("Error while trying to lock start of sub (".concat(subAddress, "): ").concat(e_1));
                            throw e_1;
                        }
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    DbHandler.prototype.unlockSubStart = function (subAddress) {
        if (subAddress === void 0) { subAddress = this._subplebbit.address; }
        return __awaiter(this, void 0, void 0, function () {
            var log, lockfilePath, subDbPath, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (subAddress === this._subplebbit.address && this.isDbInMemory())
                            return [2 /*return*/];
                        return [4 /*yield*/, this.isSubStartLocked(subAddress)];
                    case 1:
                        if (!(_a.sent()))
                            return [2 /*return*/];
                        log = (0, plebbit_logger_1.default)("plebbit-js:lock:start");
                        lockfilePath = path_1.default.join(this._subplebbit.plebbit.dataPath, "subplebbits", "".concat(subAddress, ".start.lock"));
                        subDbPath = path_1.default.join(this._subplebbit.plebbit.dataPath, "subplebbits", subAddress);
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 12]);
                        return [4 /*yield*/, lockfile.unlock(subDbPath, { lockfilePath: lockfilePath })];
                    case 3:
                        _a.sent();
                        log("Unlocked start of sub (".concat(subAddress, ")"));
                        return [3 /*break*/, 12];
                    case 4:
                        e_2 = _a.sent();
                        if (!(e_2.code === "ENOENT")) return [3 /*break*/, 7];
                        if (!fs_1.default.existsSync(lockfilePath)) return [3 /*break*/, 6];
                        return [4 /*yield*/, fs_1.default.promises.rmdir(lockfilePath)];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6: return [3 /*break*/, 11];
                    case 7:
                        if (!(e_2.message === "Lock is not acquired/owned by you")) return [3 /*break*/, 10];
                        if (!fs_1.default.existsSync(lockfilePath)) return [3 /*break*/, 9];
                        return [4 /*yield*/, fs_1.default.promises.rmdir(lockfilePath)];
                    case 8:
                        _a.sent(); // Forcefully delete the lock
                        _a.label = 9;
                    case 9: return [3 /*break*/, 11];
                    case 10:
                        log("Error while trying to unlock start of sub (".concat(subAddress, "): ").concat(e_2));
                        throw e_2;
                    case 11: return [3 /*break*/, 12];
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    DbHandler.prototype.isSubStartLocked = function (subAddress) {
        if (subAddress === void 0) { subAddress = this._subplebbit.address; }
        return __awaiter(this, void 0, void 0, function () {
            var lockfilePath, subDbPath;
            return __generator(this, function (_a) {
                lockfilePath = path_1.default.join(this._subplebbit.plebbit.dataPath, "subplebbits", "".concat(subAddress, ".start.lock"));
                subDbPath = path_1.default.join(this._subplebbit.plebbit.dataPath, "subplebbits", subAddress);
                return [2 /*return*/, lockfile.check(subDbPath, { lockfilePath: lockfilePath, realpath: false })];
            });
        });
    };
    // Creation lock
    DbHandler.prototype.lockSubCreation = function (subAddress) {
        if (subAddress === void 0) { subAddress = this._subplebbit.address; }
        return __awaiter(this, void 0, void 0, function () {
            var log, lockfilePath, subDbPath, e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (subAddress === this._subplebbit.address && this.isDbInMemory())
                            return [2 /*return*/];
                        log = (0, plebbit_logger_1.default)("plebbit-js:lock:creation");
                        lockfilePath = path_1.default.join(this._subplebbit.plebbit.dataPath, "subplebbits", "".concat(subAddress, ".create.lock"));
                        subDbPath = path_1.default.join(this._subplebbit.plebbit.dataPath, "subplebbits", subAddress);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, lockfile.lock(subDbPath, {
                                lockfilePath: lockfilePath,
                                realpath: false,
                                onCompromised: function () { }
                            })];
                    case 2:
                        _a.sent();
                        log("Locked the creation of subplebbit (".concat(subAddress, ") successfully"));
                        return [3 /*break*/, 4];
                    case 3:
                        e_3 = _a.sent();
                        if (e_3.message === "Lock file is already being held")
                            (0, util_1.throwWithErrorCode)("ERR_SUB_CREATION_LOCKED", "subAddress=".concat(subAddress));
                        else {
                            log("Error while trying to lock creation of sub (".concat(subAddress, "): ").concat(e_3));
                            throw e_3;
                        }
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    DbHandler.prototype.unlockSubCreation = function (subAddress) {
        if (subAddress === void 0) { subAddress = this._subplebbit.address; }
        return __awaiter(this, void 0, void 0, function () {
            var log, lockfilePath, subDbPath, e_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (subAddress === this._subplebbit.address && this.isDbInMemory())
                            return [2 /*return*/];
                        log = (0, plebbit_logger_1.default)("plebbit-js:lock:unlockSubCreation");
                        lockfilePath = path_1.default.join(this._subplebbit.plebbit.dataPath, "subplebbits", "".concat(subAddress, ".create.lock"));
                        subDbPath = path_1.default.join(this._subplebbit.plebbit.dataPath, "subplebbits", subAddress);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 11]);
                        return [4 /*yield*/, lockfile.unlock(subDbPath, { lockfilePath: lockfilePath, realpath: false })];
                    case 2:
                        _a.sent();
                        log("Unlocked creation of sub (".concat(subAddress, ")"));
                        return [3 /*break*/, 11];
                    case 3:
                        e_4 = _a.sent();
                        if (!(e_4.code === "ENOENT")) return [3 /*break*/, 6];
                        if (!fs_1.default.existsSync(lockfilePath)) return [3 /*break*/, 5];
                        return [4 /*yield*/, fs_1.default.promises.rmdir(lockfilePath)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [3 /*break*/, 10];
                    case 6:
                        if (!(e_4.message === "Lock is not acquired/owned by you")) return [3 /*break*/, 9];
                        if (!fs_1.default.existsSync(lockfilePath)) return [3 /*break*/, 8];
                        return [4 /*yield*/, fs_1.default.promises.rmdir(lockfilePath)];
                    case 7:
                        _a.sent(); // Forcefully delete the lock
                        _a.label = 8;
                    case 8: return [3 /*break*/, 10];
                    case 9:
                        log("Error while trying to unlock creation of sub (".concat(subAddress, "): ").concat(e_4));
                        throw e_4;
                    case 10: return [3 /*break*/, 11];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    DbHandler.prototype.isSubCreationLocked = function (subAddress) {
        if (subAddress === void 0) { subAddress = this._subplebbit.address; }
        return __awaiter(this, void 0, void 0, function () {
            var lockfilePath, subDbPath;
            return __generator(this, function (_a) {
                lockfilePath = path_1.default.join(this._subplebbit.plebbit.dataPath, "subplebbits", "".concat(subAddress, ".create.lock"));
                subDbPath = path_1.default.join(this._subplebbit.plebbit.dataPath, "subplebbits", subAddress);
                return [2 /*return*/, lockfile.check(subDbPath, { lockfilePath: lockfilePath, realpath: false })];
            });
        });
    };
    // Subplebbit state lock
    DbHandler.prototype.lockSubState = function (subAddress) {
        if (subAddress === void 0) { subAddress = this._subplebbit.address; }
        return __awaiter(this, void 0, void 0, function () {
            var log, lockfilePath, subDbPath, e_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (subAddress === this._subplebbit.address && this.isDbInMemory())
                            return [2 /*return*/];
                        log = (0, plebbit_logger_1.default)("plebbit-js:lock:lockSubState");
                        lockfilePath = path_1.default.join(this._subplebbit.plebbit.dataPath, "subplebbits", "".concat(subAddress, ".state.lock"));
                        subDbPath = path_1.default.join(this._subplebbit.plebbit.dataPath, "subplebbits", subAddress);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, lockfile.lock(subDbPath, {
                                lockfilePath: lockfilePath,
                                realpath: false,
                                retries: 3,
                                onCompromised: function () { }
                            })];
                    case 2:
                        _a.sent();
                        log.trace("Locked the state of subplebbit (".concat(subAddress, ") successfully"));
                        return [3 /*break*/, 4];
                    case 3:
                        e_5 = _a.sent();
                        if (e_5.message === "Lock file is already being held")
                            (0, util_1.throwWithErrorCode)("ERR_SUB_STATE_LOCKED", "subAddress=".concat(subAddress));
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    DbHandler.prototype.unlockSubState = function (subAddress) {
        if (subAddress === void 0) { subAddress = this._subplebbit.address; }
        return __awaiter(this, void 0, void 0, function () {
            var log, lockfilePath, subDbPath;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (subAddress === this._subplebbit.address && this.isDbInMemory())
                            return [2 /*return*/];
                        log = (0, plebbit_logger_1.default)("plebbit-js:lock:unlockSubState");
                        lockfilePath = path_1.default.join(this._subplebbit.plebbit.dataPath, "subplebbits", "".concat(subAddress, ".state.lock"));
                        subDbPath = path_1.default.join(this._subplebbit.plebbit.dataPath, "subplebbits", subAddress);
                        return [4 /*yield*/, lockfile.unlock(subDbPath, { lockfilePath: lockfilePath })];
                    case 1:
                        _a.sent();
                        log.trace("Unlocked state of sub (".concat(subAddress, ")"));
                        return [2 /*return*/];
                }
            });
        });
    };
    // Misc functions
    DbHandler.prototype.subDbExists = function (subAddress) {
        if (subAddress === void 0) { subAddress = this._subplebbit.address; }
        var dbPath = path_1.default.join(this._subplebbit.plebbit.dataPath, "subplebbits", subAddress);
        return fs_1.default.existsSync(dbPath);
    };
    DbHandler.prototype.subAddress = function () {
        return this._subplebbit.address;
    };
    // Will most likely move to another file specialized in DB migration
    DbHandler.prototype._migrateFromDbV2IfNeeded = function () {
        return __awaiter(this, void 0, void 0, function () {
            var obsoleteCache, subCache, signerAddress, signer, _a, _b, _c;
            var _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, this.keyvGet(this._subplebbit.address)];
                    case 1:
                        obsoleteCache = _e.sent();
                        return [4 /*yield*/, this.keyvGet(constants_1.CACHE_KEYS[constants_1.CACHE_KEYS.INTERNAL_SUBPLEBBIT])];
                    case 2:
                        subCache = _e.sent();
                        if (!(obsoleteCache && !subCache)) return [3 /*break*/, 7];
                        return [4 /*yield*/, (0, util_3.getPlebbitAddressFromPublicKeyPem)(obsoleteCache.encryption.publicKey)];
                    case 3:
                        signerAddress = _e.sent();
                        return [4 /*yield*/, this.querySigner(signerAddress)];
                    case 4:
                        signer = _e.sent();
                        _a = obsoleteCache;
                        _b = signer_1.Signer.bind;
                        _c = [__assign({}, signer)];
                        _d = {};
                        return [4 /*yield*/, (0, util_3.getPlebbitAddressFromPrivateKeyPem)(signer.privateKey)];
                    case 5:
                        _a.signer = new (_b.apply(signer_1.Signer, [void 0, __assign.apply(void 0, _c.concat([(_d.address = _e.sent(), _d)]))]))();
                        // We changed the name of internal subplebbit cache, need to explicitly copy old cache to new key here
                        return [4 /*yield*/, this.keyvSet(constants_1.CACHE_KEYS[constants_1.CACHE_KEYS.INTERNAL_SUBPLEBBIT], obsoleteCache)];
                    case 6:
                        // We changed the name of internal subplebbit cache, need to explicitly copy old cache to new key here
                        _e.sent();
                        _e.label = 7;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    return DbHandler;
}());
exports.DbHandler = DbHandler;
