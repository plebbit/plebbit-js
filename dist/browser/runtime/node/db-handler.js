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
var lockfile = __importStar(require("proper-lockfile"));
var TABLES = Object.freeze({
    COMMENTS: "comments",
    COMMENT_UPDATES: "commentUpdates",
    VOTES: "votes",
    CHALLENGE_REQUESTS: "challengeRequests",
    CHALLENGES: "challenges",
    CHALLENGE_ANSWERS: "challengeAnswers",
    CHALLENGE_VERIFICATIONS: "challengeVerifications",
    SIGNERS: "signers",
    COMMENT_EDITS: "commentEdits"
});
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
                        return [2 /*return*/, res];
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
    DbHandler.prototype.initDestroyedConnection = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this._knex.initialize();
                return [2 /*return*/];
            });
        });
    };
    DbHandler.prototype.destoryConnection = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.isDbInMemory())
                            return [2 /*return*/];
                        return [4 /*yield*/, ((_a = this._knex) === null || _a === void 0 ? void 0 : _a.destroy())];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
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
                        // assert(trx && trx.isTransaction && !trx.isCompleted(), `Transaction (${transactionId}) needs to be stored to commit`);
                        return [4 /*yield*/, this._currentTrxs[transactionId].commit()];
                    case 1:
                        // assert(trx && trx.isTransaction && !trx.isCompleted(), `Transaction (${transactionId}) needs to be stored to commit`);
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
                        (0, assert_1.default)(trx.isTransaction, "Transaction (".concat(transactionId, ") needs to be stored to rollback"));
                        if (trx.isCompleted())
                            return [2 /*return*/];
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
    DbHandler.prototype.rollbackAllTransactions = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, Promise.all(Object.keys(this._currentTrxs).map(function (trxId) { return _this.rollbackTransaction(trxId); }))];
            });
        });
    };
    DbHandler.prototype._baseTransaction = function (trx) {
        return trx ? trx : this._knex;
    };
    DbHandler.prototype._createCommentsTable = function (tableName) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._knex.schema.createTable(tableName, function (table) {
                            table.text("cid").notNullable().primary().unique();
                            table.text("authorAddress").notNullable();
                            table.json("author").notNullable();
                            table.string("link").nullable();
                            table.string("thumbnailUrl").nullable();
                            table.text("parentCid").nullable().references("cid").inTable(TABLES.COMMENTS);
                            table.text("postCid").notNullable().references("cid").inTable(TABLES.COMMENTS);
                            table.text("previousCid").nullable().references("cid").inTable(TABLES.COMMENTS);
                            table.uuid("challengeRequestId").notNullable().references("challengeRequestId").inTable(TABLES.CHALLENGE_REQUESTS);
                            table.text("subplebbitAddress").notNullable();
                            table.text("content").nullable();
                            table.timestamp("timestamp").notNullable().checkBetween([0, Number.MAX_SAFE_INTEGER]);
                            table.json("signature").notNullable().unique(); // Will contain {signature, public key, type}
                            table.text("ipnsName").notNullable().unique();
                            table.text("ipnsKeyName").notNullable().unique().references("ipnsKeyName").inTable(TABLES.SIGNERS);
                            table.text("title").nullable();
                            table.integer("depth").notNullable().checkBetween([0, Number.MAX_SAFE_INTEGER]);
                            table.json("flair").nullable();
                            table.boolean("spoiler");
                            table.text("protocolVersion").notNullable();
                            table.increments("id"); // Used for sorts
                            table.timestamp("insertedAt").defaultTo(_this._knex.raw("(strftime('%s', 'now'))")); // Timestamp of when it was first inserted in the table
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DbHandler.prototype._createCommentUpdatesTable = function (tableName) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._knex.schema.createTable(tableName, function (table) {
                            table.text("cid").notNullable().primary().unique().references("cid").inTable(TABLES.COMMENTS);
                            table.json("edit").nullable();
                            table.integer("upvoteCount").notNullable().checkBetween([0, Number.MAX_SAFE_INTEGER]);
                            table.integer("downvoteCount").notNullable().checkBetween([0, Number.MAX_SAFE_INTEGER]);
                            // We're not storing replies here because it would take too much storage, and is not needed
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
                            table.json("replies").nullable();
                            // Columns with defaults
                            table.timestamp("insertedAt").defaultTo(_this._knex.raw("(strftime('%s', 'now'))")); // Timestamp of when it was first inserted in the table
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
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._knex.schema.createTable(tableName, function (table) {
                            table.text("commentCid").notNullable().references("cid").inTable(TABLES.COMMENTS);
                            table.text("authorAddress").notNullable();
                            table.json("author").notNullable();
                            table.uuid("challengeRequestId").notNullable().references("challengeRequestId").inTable(TABLES.CHALLENGE_REQUESTS);
                            table.timestamp("timestamp").checkPositive().notNullable();
                            table.text("subplebbitAddress").notNullable();
                            table.integer("vote").checkBetween([-1, 1]).notNullable();
                            table.json("signature").notNullable().unique();
                            table.text("protocolVersion").notNullable();
                            table.timestamp("insertedAt").defaultTo(_this._knex.raw("(strftime('%s', 'now'))")); // Timestamp of when it was first inserted in the table
                            table.primary(["commentCid", "authorAddress"]); // An author can't have multiple votes on a comment
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DbHandler.prototype._createChallengeRequestsTable = function (tableName) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._knex.schema.createTable(tableName, function (table) {
                            table.uuid("challengeRequestId").notNullable().primary().unique();
                            table.text("userAgent").notNullable();
                            table.text("protocolVersion").notNullable();
                            table.json("signature").notNullable().unique();
                            table.json("acceptedChallengeTypes").nullable(); // string[]
                            table.timestamp("timestamp").notNullable().checkBetween([0, Number.MAX_SAFE_INTEGER]);
                            table.timestamp("insertedAt").defaultTo(_this._knex.raw("(strftime('%s', 'now'))")); // Timestamp of when it was first inserted in the table
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
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._knex.schema.createTable(tableName, function (table) {
                            table
                                .uuid("challengeRequestId")
                                .notNullable()
                                .primary()
                                .unique()
                                .references("challengeRequestId")
                                .inTable(TABLES.CHALLENGE_REQUESTS);
                            table.text("userAgent").notNullable();
                            table.text("protocolVersion").notNullable();
                            table.json("signature").notNullable().unique();
                            table.timestamp("insertedAt").defaultTo(_this._knex.raw("(strftime('%s', 'now'))")); // Timestamp of when it was first inserted in the table
                            // Might store the challenge here in the future. For now we're not because it would take too much storage
                            table.json("challengeTypes").notNullable(); // string[]
                            table.timestamp("timestamp").notNullable().checkBetween([0, Number.MAX_SAFE_INTEGER]);
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DbHandler.prototype._createChallengeAnswersTable = function (tableName) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._knex.schema.createTable(tableName, function (table) {
                            table
                                .uuid("challengeRequestId")
                                .notNullable()
                                .primary()
                                .unique()
                                .references("challengeRequestId")
                                .inTable(TABLES.CHALLENGE_REQUESTS);
                            table.uuid("challengeAnswerId").notNullable().unique();
                            table.text("userAgent").notNullable();
                            table.text("protocolVersion").notNullable();
                            table.json("challengeAnswers").notNullable(); // Decrypted
                            table.json("signature").notNullable().unique();
                            table.timestamp("timestamp").notNullable().checkBetween([0, Number.MAX_SAFE_INTEGER]);
                            table.timestamp("insertedAt").defaultTo(_this._knex.raw("(strftime('%s', 'now'))")); // Timestamp of when it was first inserted in the table
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DbHandler.prototype._createChallengeVerificationsTable = function (tableName) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._knex.schema.createTable(tableName, function (table) {
                            table
                                .uuid("challengeRequestId")
                                .notNullable()
                                .primary()
                                .unique()
                                .references("challengeRequestId")
                                .inTable(TABLES.CHALLENGE_REQUESTS);
                            table.uuid("challengeAnswerId").nullable().references("challengeAnswerId").inTable(TABLES.CHALLENGE_ANSWERS);
                            table.boolean("challengeSuccess").notNullable();
                            table.json("challengeErrors").nullable(); // string[]
                            table.text("reason").nullable();
                            table.json("signature").notNullable().unique();
                            table.text("userAgent").notNullable();
                            table.text("protocolVersion").notNullable();
                            table.timestamp("timestamp").notNullable().checkBetween([0, Number.MAX_SAFE_INTEGER]);
                            table.timestamp("insertedAt").defaultTo(_this._knex.raw("(strftime('%s', 'now'))")); // Timestamp of when it was first inserted in the table
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
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._knex.schema.createTable(tableName, function (table) {
                            table.text("ipnsKeyName").notNullable().unique().primary();
                            table.text("privateKey").notNullable().unique();
                            table.text("type").notNullable(); // ed25519 or any other type
                            table.timestamp("insertedAt").defaultTo(_this._knex.raw("(strftime('%s', 'now'))")); // Timestamp of when it was first inserted in the table
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DbHandler.prototype._createCommentEditsTable = function (tableName) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._knex.schema.createTable(tableName, function (table) {
                            table.text("commentCid").notNullable().references("cid").inTable(TABLES.COMMENTS);
                            table.text("authorAddress").notNullable();
                            table.json("author").notNullable();
                            table.uuid("challengeRequestId").notNullable().references("challengeRequestId").inTable(TABLES.CHALLENGE_REQUESTS);
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
                            table.text("moderatorReason").nullable();
                            table.json("commentAuthor").nullable();
                            table.timestamp("insertedAt").defaultTo(_this._knex.raw("(strftime('%s', 'now'))")); // Timestamp of when it was first inserted in the table
                            table.primary(["id", "commentCid"]);
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
            var log, priorDbVersion, needToMigrate, createTableFunctions, tables, newDbVersion;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:db-handler:createTablesIfNeeded");
                        return [4 /*yield*/, this.getDbVersion()];
                    case 1:
                        priorDbVersion = _a.sent();
                        log.trace("current db version: ".concat(priorDbVersion));
                        needToMigrate = priorDbVersion !== version_1.default.DB_VERSION;
                        createTableFunctions = [
                            this._createCommentsTable,
                            this._createCommentUpdatesTable,
                            this._createVotesTable,
                            this._createChallengeRequestsTable,
                            this._createChallengesTable,
                            this._createChallengeAnswersTable,
                            this._createChallengeVerificationsTable,
                            this._createSignersTable,
                            this._createCommentEditsTable
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
                        if (!needToMigrate) return [3 /*break*/, 5];
                        return [4 /*yield*/, this._knex.raw("PRAGMA foreign_keys = ON")];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this._knex.raw("PRAGMA user_version = ".concat(version_1.default.DB_VERSION))];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [4 /*yield*/, this.getDbVersion()];
                    case 6:
                        newDbVersion = _a.sent();
                        assert_1.default.equal(newDbVersion, version_1.default.DB_VERSION);
                        this._createdTables = true;
                        return [2 /*return*/];
                }
            });
        });
    };
    DbHandler.prototype.isDbInMemory = function () {
        // Is database stored in memory rather on disk?
        //@ts-expect-error
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
    DbHandler.prototype.deleteVote = function (authorAddress, commentCid, trx) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._baseTransaction(trx)(TABLES.VOTES).where("commentCid", commentCid).where("authorAddress", authorAddress).del()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DbHandler.prototype.insertVote = function (vote, trx) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._baseTransaction(trx)(TABLES.VOTES).insert(vote)];
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
    DbHandler.prototype.upsertCommentUpdate = function (update, trx) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._baseTransaction(trx)(TABLES.COMMENT_UPDATES).insert(update).onConflict(["cid"]).merge()];
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
                    case 0: return [4 /*yield*/, this._baseTransaction(trx)(TABLES.COMMENT_EDITS).insert(edit)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DbHandler.prototype.insertChallengeRequest = function (request, trx) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._baseTransaction(trx)(TABLES.CHALLENGE_REQUESTS).insert(request)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DbHandler.prototype.insertChallenge = function (challenge, trx) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._baseTransaction(trx)(TABLES.CHALLENGES).insert(challenge)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DbHandler.prototype.insertChallengeAnswer = function (answer, trx) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._baseTransaction(trx)(TABLES.CHALLENGE_ANSWERS).insert(answer)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DbHandler.prototype.insertChallengeVerification = function (verification, trx) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._baseTransaction(trx)(TABLES.CHALLENGE_VERIFICATIONS).insert(verification)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DbHandler.prototype.getLastVoteOfAuthor = function (commentCid, authorAddress, trx) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this._baseTransaction(trx)(TABLES.VOTES)
                        .where({
                        commentCid: commentCid,
                        authorAddress: authorAddress
                    })
                        .first()];
            });
        });
    };
    DbHandler.prototype._basePageQuery = function (options, trx) {
        var query = this._baseTransaction(trx)(TABLES.COMMENTS)
            .innerJoin(TABLES.COMMENT_UPDATES, "".concat(TABLES.COMMENTS, ".cid"), "".concat(TABLES.COMMENT_UPDATES, ".cid"))
            .jsonExtract("".concat(TABLES.COMMENT_UPDATES, ".edit"), "$.deleted", "deleted", true)
            .where({ parentCid: options.parentCid });
        if (options.excludeCommentsWithDifferentSubAddress)
            query = query.where({ subplebbitAddress: this._subplebbit.address });
        if (options.excludeRemovedComments)
            query = query.andWhereRaw("".concat(TABLES.COMMENT_UPDATES, ".removed is not 1"));
        if (options.excludeDeletedComments)
            query = query.andWhereRaw("`deleted` is not 1");
        return query;
    };
    DbHandler.prototype.queryReplyCount = function (commentCid, trx) {
        return __awaiter(this, void 0, void 0, function () {
            var options, children, _a, _b, _c;
            var _this = this;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        options = {
                            excludeCommentsWithDifferentSubAddress: true,
                            excludeDeletedComments: true,
                            excludeRemovedComments: true,
                            parentCid: commentCid
                        };
                        return [4 /*yield*/, this.queryCommentsForPages(options, trx)];
                    case 1:
                        children = _d.sent();
                        _a = children.length;
                        _c = (_b = lodash_1.default).sum;
                        return [4 /*yield*/, Promise.all(children.map(function (comment) { return _this.queryReplyCount(comment.comment.cid, trx); }))];
                    case 2: return [2 /*return*/, _a + _c.apply(_b, [_d.sent()])];
                }
            });
        });
    };
    DbHandler.prototype.queryActiveScore = function (comment, trx) {
        return __awaiter(this, void 0, void 0, function () {
            var maxTimestamp, updateMaxTimestamp, children;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        maxTimestamp = comment.timestamp;
                        updateMaxTimestamp = function (localComments) { return __awaiter(_this, void 0, void 0, function () {
                            var _i, localComments_1, commentChild, children_1;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _i = 0, localComments_1 = localComments;
                                        _a.label = 1;
                                    case 1:
                                        if (!(_i < localComments_1.length)) return [3 /*break*/, 5];
                                        commentChild = localComments_1[_i];
                                        if (commentChild.timestamp > maxTimestamp)
                                            maxTimestamp = commentChild.timestamp;
                                        return [4 /*yield*/, this.queryCommentsUnderComment(commentChild.cid, trx)];
                                    case 2:
                                        children_1 = _a.sent();
                                        if (!(children_1.length > 0)) return [3 /*break*/, 4];
                                        return [4 /*yield*/, updateMaxTimestamp(children_1)];
                                    case 3:
                                        _a.sent();
                                        _a.label = 4;
                                    case 4:
                                        _i++;
                                        return [3 /*break*/, 1];
                                    case 5: return [2 /*return*/];
                                }
                            });
                        }); };
                        return [4 /*yield*/, this.queryCommentsUnderComment(comment.cid, trx)];
                    case 1:
                        children = _a.sent();
                        if (!(children.length > 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, updateMaxTimestamp(children)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/, maxTimestamp];
                }
            });
        });
    };
    DbHandler.prototype.queryCommentsForPages = function (options, trx) {
        return __awaiter(this, void 0, void 0, function () {
            var commentUpdateColumns, aliasSelect, commentsRaw, comments;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        commentUpdateColumns = ["cid", "author", "downvoteCount", "edit", "flair", "locked", "pinned", "protocolVersion", "reason", "removed", "replyCount", "signature", "spoiler", "updatedAt", "upvoteCount", "replies"];
                        aliasSelect = commentUpdateColumns.map(function (col) { return "".concat(TABLES.COMMENT_UPDATES, ".").concat(col, " AS commentUpdate_").concat(col); });
                        return [4 /*yield*/, this._basePageQuery(options, trx).select(__spreadArray(["".concat(TABLES.COMMENTS, ".*")], aliasSelect, true))];
                    case 1:
                        commentsRaw = _a.sent();
                        comments = commentsRaw.map(function (commentRaw) { return ({
                            comment: lodash_1.default.pickBy(commentRaw, function (value, key) { return !key.startsWith("commentUpdate_"); }),
                            update: lodash_1.default.mapKeys(lodash_1.default.pickBy(commentRaw, function (value, key) { return key.startsWith("commentUpdate_"); }), function (value, key) { return key.replace("commentUpdate_", ""); })
                        }); });
                        return [2 /*return*/, comments];
                }
            });
        });
    };
    DbHandler.prototype.queryStoredCommentUpdate = function (comment, trx) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this._baseTransaction(trx)(TABLES.COMMENT_UPDATES).where("cid", comment.cid).first()];
            });
        });
    };
    DbHandler.prototype.queryCommentsOfAuthor = function (authorAddresses, trx) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!Array.isArray(authorAddresses))
                    authorAddresses = [authorAddresses];
                return [2 /*return*/, this._baseTransaction(trx)(TABLES.COMMENTS).whereIn("authorAddress", authorAddresses)];
            });
        });
    };
    DbHandler.prototype.queryAllCommentsCid = function (trx) {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._baseTransaction(trx)(TABLES.COMMENTS).select("cid")];
                    case 1:
                        res = _a.sent();
                        return [2 /*return*/, res.map(function (row) { return row.cid; })];
                }
            });
        });
    };
    DbHandler.prototype.queryCommentsByCids = function (cids, trx) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this._baseTransaction(trx)(TABLES.COMMENTS).whereIn("cid", cids)];
            });
        });
    };
    DbHandler.prototype.queryParents = function (rootComment, trx) {
        return __awaiter(this, void 0, void 0, function () {
            var parents, curParentCid, parent_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        parents = [];
                        curParentCid = rootComment.parentCid;
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
                    case 3: return [2 /*return*/, parents];
                }
            });
        });
    };
    DbHandler.prototype.queryCommentsToBeUpdated = function (ipnsKeyNames, trx) {
        return __awaiter(this, void 0, void 0, function () {
            var criteriaOneTwoThree, lastUpdatedAtWithBuffer, criteriaFour, comments, parents, _a, _b, authorComments, uniqComments;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this._baseTransaction(trx)(TABLES.COMMENTS)
                            .select("".concat(TABLES.COMMENTS, ".*"))
                            .leftJoin(TABLES.COMMENT_UPDATES, "".concat(TABLES.COMMENTS, ".cid"), "".concat(TABLES.COMMENT_UPDATES, ".cid"))
                            .whereNull("".concat(TABLES.COMMENT_UPDATES, ".updatedAt"))
                            .orWhereNotIn("ipnsKeyName", ipnsKeyNames)];
                    case 1:
                        criteriaOneTwoThree = _c.sent();
                        lastUpdatedAtWithBuffer = this._knex.raw("`lastUpdatedAt` - 1");
                        return [4 /*yield*/, this._baseTransaction(trx)(TABLES.COMMENTS)
                                .select("".concat(TABLES.COMMENTS, ".*"))
                                .innerJoin(TABLES.COMMENT_UPDATES, "".concat(TABLES.COMMENTS, ".cid"), "".concat(TABLES.COMMENT_UPDATES, ".cid"))
                                .leftJoin(TABLES.VOTES, "".concat(TABLES.COMMENTS, ".cid"), "".concat(TABLES.VOTES, ".commentCid"))
                                .leftJoin(TABLES.COMMENT_EDITS, "".concat(TABLES.COMMENTS, ".cid"), "".concat(TABLES.COMMENT_EDITS, ".commentCid"))
                                .leftJoin({ childrenComments: TABLES.COMMENTS }, "".concat(TABLES.COMMENTS, ".cid"), "childrenComments.parentCid")
                                .max({
                                voteLastInsertedAt: "".concat(TABLES.VOTES, ".insertedAt"),
                                editLastInsertedAt: "".concat(TABLES.COMMENT_EDITS, ".insertedAt"),
                                childCommentLastInsertedAt: "childrenComments.insertedAt",
                                lastUpdatedAt: "".concat(TABLES.COMMENT_UPDATES, ".updatedAt")
                            })
                                .groupBy("".concat(TABLES.COMMENTS, ".cid"))
                                .having("voteLastInsertedAt", ">=", lastUpdatedAtWithBuffer)
                                .orHaving("editLastInsertedAt", ">=", lastUpdatedAtWithBuffer)
                                .orHaving("childCommentLastInsertedAt", ">=", lastUpdatedAtWithBuffer)];
                    case 2:
                        criteriaFour = _c.sent();
                        comments = lodash_1.default.uniqBy(__spreadArray(__spreadArray([], criteriaOneTwoThree, true), criteriaFour, true), function (comment) { return comment.cid; });
                        _b = (_a = lodash_1.default).flattenDeep;
                        return [4 /*yield*/, Promise.all(comments.filter(function (comment) { return comment.parentCid; }).map(function (comment) { return _this.queryParents(comment, trx); }))];
                    case 3:
                        parents = _b.apply(_a, [_c.sent()]);
                        return [4 /*yield*/, this.queryCommentsOfAuthor(lodash_1.default.uniq(comments.map(function (comment) { return comment.authorAddress; })), trx)];
                    case 4:
                        authorComments = _c.sent();
                        uniqComments = lodash_1.default.uniqBy(__spreadArray(__spreadArray(__spreadArray([], comments, true), parents, true), authorComments, true), function (comment) { return comment.cid; });
                        return [2 /*return*/, uniqComments];
                }
            });
        });
    };
    // TODO rewrite this
    DbHandler.prototype.querySubplebbitStats = function (trx) {
        return __awaiter(this, void 0, void 0, function () {
            var stats, combinedStats;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.all(["PostCount", "ActiveUserCount"].map(function (statType) { return __awaiter(_this, void 0, void 0, function () {
                            var _this = this;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, Promise.all(Object.keys(util_1.TIMEFRAMES_TO_SECONDS).map(function (timeframe) { return __awaiter(_this, void 0, void 0, function () {
                                            var propertyName, _a, from, to, res, query, res;
                                            var _b, _c;
                                            return __generator(this, function (_d) {
                                                switch (_d.label) {
                                                    case 0:
                                                        propertyName = "".concat(timeframe.toLowerCase()).concat(statType);
                                                        _a = [Math.max(0, (0, util_1.timestamp)() - util_1.TIMEFRAMES_TO_SECONDS[timeframe]), (0, util_1.timestamp)()], from = _a[0], to = _a[1];
                                                        if (!(statType === "ActiveUserCount")) return [3 /*break*/, 2];
                                                        return [4 /*yield*/, this._baseTransaction(trx)(TABLES.COMMENTS)
                                                                .countDistinct("comments.authorAddress")
                                                                .join(TABLES.VOTES, "".concat(TABLES.COMMENTS, ".authorAddress"), "=", "".concat(TABLES.VOTES, ".authorAddress"))
                                                                .whereBetween("comments.timestamp", [from, to])];
                                                    case 1:
                                                        res = (_d.sent())[0]["count(distinct `comments`.`authorAddress`)"];
                                                        return [2 /*return*/, (_b = {}, _b[propertyName] = res, _b)];
                                                    case 2:
                                                        if (!(statType === "PostCount")) return [3 /*break*/, 4];
                                                        query = this._baseTransaction(trx)(TABLES.COMMENTS)
                                                            .count()
                                                            .whereBetween("timestamp", [from, to])
                                                            .whereNull("parentCid");
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
                        stats = _a.sent();
                        combinedStats = Object.assign.apply(Object, __spreadArray([{}], stats.flat(), false));
                        return [2 /*return*/, combinedStats];
                }
            });
        });
    };
    DbHandler.prototype.queryCommentsUnderComment = function (parentCid, trx) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this._baseTransaction(trx)(TABLES.COMMENTS).where({ parentCid: parentCid })];
            });
        });
    };
    DbHandler.prototype.queryComment = function (cid, trx) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this._baseTransaction(trx)(TABLES.COMMENTS).where("cid", cid).first()];
            });
        });
    };
    DbHandler.prototype._queryCommentUpvote = function (cid, trx) {
        return __awaiter(this, void 0, void 0, function () {
            var upvotes;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._baseTransaction(trx)(TABLES.VOTES).where({ commentCid: cid, vote: 1 }).count()];
                    case 1:
                        upvotes = ((_a.sent())[0]["count(*)"]);
                        return [2 /*return*/, upvotes];
                }
            });
        });
    };
    DbHandler.prototype._queryCommentDownvote = function (cid, trx) {
        return __awaiter(this, void 0, void 0, function () {
            var downvotes;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._baseTransaction(trx)(TABLES.VOTES).where({ commentCid: cid, vote: -1 }).count()];
                    case 1:
                        downvotes = ((_a.sent())[0]["count(*)"]);
                        return [2 /*return*/, downvotes];
                }
            });
        });
    };
    DbHandler.prototype._queryCommentCounts = function (cid, trx) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, replyCount, upvoteCount, downvoteCount;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, Promise.all([
                            this.queryReplyCount(cid, trx),
                            this._queryCommentUpvote(cid, trx),
                            this._queryCommentDownvote(cid, trx)
                        ])];
                    case 1:
                        _a = _b.sent(), replyCount = _a[0], upvoteCount = _a[1], downvoteCount = _a[2];
                        return [2 /*return*/, { replyCount: replyCount, upvoteCount: upvoteCount, downvoteCount: downvoteCount }];
                }
            });
        });
    };
    DbHandler.prototype._queryAuthorEdit = function (cid, authorAddress, trx) {
        return __awaiter(this, void 0, void 0, function () {
            var authorEdit;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._baseTransaction(trx)(TABLES.COMMENT_EDITS)
                            .select("commentCid", "content", "deleted", "flair", "spoiler", "reason", "author", "signature", "protocolVersion", "subplebbitAddress", "timestamp")
                            .where({ commentCid: cid, authorAddress: authorAddress })
                            .orderBy("timestamp", "desc")
                            .first()];
                    case 1:
                        authorEdit = _a.sent();
                        return [2 /*return*/, authorEdit];
                }
            });
        });
    };
    DbHandler.prototype._queryLatestModeratorReason = function (comment, trx) {
        return __awaiter(this, void 0, void 0, function () {
            var moderatorReason;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._baseTransaction(trx)(TABLES.COMMENT_EDITS)
                            .select("reason")
                            .where("commentCid", comment.cid)
                            .whereNot("authorAddress", comment.author.address)
                            .whereNotNull("reason")
                            .orderBy("timestamp", "desc")
                            .first()];
                    case 1:
                        moderatorReason = _a.sent();
                        return [2 /*return*/, moderatorReason];
                }
            });
        });
    };
    DbHandler.prototype.queryCommentFlags = function (cid, trx) {
        return __awaiter(this, void 0, void 0, function () {
            var res, _a, _b, _c, _d;
            var _this = this;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _b = (_a = Object.assign).apply;
                        _c = [Object];
                        _d = [[{}]];
                        return [4 /*yield*/, Promise.all(["spoiler", "pinned", "locked", "removed"].map(function (field) {
                                return _this._baseTransaction(trx)(TABLES.COMMENT_EDITS)
                                    .select(field)
                                    .where("commentCid", cid)
                                    .whereNotNull(field)
                                    .orderBy("timestamp", "desc")
                                    .first();
                            }))];
                    case 1:
                        res = _b.apply(_a, _c.concat([__spreadArray.apply(void 0, _d.concat([(_e.sent()), false]))]));
                        return [2 /*return*/, res];
                }
            });
        });
    };
    DbHandler.prototype.queryAuthorEditDeleted = function (cid, trx) {
        return __awaiter(this, void 0, void 0, function () {
            var deleted;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._baseTransaction(trx)(TABLES.COMMENT_EDITS)
                            .select("deleted")
                            .where("commentCid", cid)
                            .whereNotNull("deleted")
                            .orderBy("timestamp", "desc")
                            .first()];
                    case 1:
                        deleted = _a.sent();
                        return [2 /*return*/, deleted];
                }
            });
        });
    };
    DbHandler.prototype._queryModCommentFlair = function (comment, trx) {
        return __awaiter(this, void 0, void 0, function () {
            var latestFlair;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._baseTransaction(trx)(TABLES.COMMENT_EDITS)
                            .select("flair")
                            .where("commentCid", comment.cid)
                            .whereNotNull("flair")
                            .whereNot("authorAddress", comment.author.address)
                            .orderBy("timestamp", "desc")
                            .first()];
                    case 1:
                        latestFlair = _a.sent();
                        return [2 /*return*/, latestFlair];
                }
            });
        });
    };
    DbHandler.prototype.queryCalculatedCommentUpdate = function (comment, trx) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, authorSubplebbit, authorEdit, commentUpdateCounts, moderatorReason, commentFlags, commentModFlair;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, Promise.all([
                            this.querySubplebbitAuthor(comment.author.address, trx),
                            this._queryAuthorEdit(comment.cid, comment.author.address, trx),
                            this._queryCommentCounts(comment.cid, trx),
                            this._queryLatestModeratorReason(comment, trx),
                            this.queryCommentFlags(comment.cid, trx),
                            this._queryModCommentFlair(comment, trx)
                        ])];
                    case 1:
                        _a = _b.sent(), authorSubplebbit = _a[0], authorEdit = _a[1], commentUpdateCounts = _a[2], moderatorReason = _a[3], commentFlags = _a[4], commentModFlair = _a[5];
                        return [2 /*return*/, __assign(__assign(__assign(__assign(__assign({ cid: comment.cid, edit: authorEdit }, commentUpdateCounts), { flair: (commentModFlair === null || commentModFlair === void 0 ? void 0 : commentModFlair.flair) || (authorEdit === null || authorEdit === void 0 ? void 0 : authorEdit.flair) }), commentFlags), moderatorReason), { author: { subplebbit: authorSubplebbit } })];
                }
            });
        });
    };
    DbHandler.prototype.queryLatestPostCid = function (trx) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this._baseTransaction(trx)(TABLES.COMMENTS).select("cid").where({ depth: 0 }).orderBy("id", "desc").first()];
            });
        });
    };
    DbHandler.prototype.insertSigner = function (signer, trx) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this._baseTransaction(trx)(TABLES.SIGNERS).insert(signer)];
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
    DbHandler.prototype.queryAuthorModEdits = function (authorAddress, trx) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var authorComments, commentAuthorEdits, banAuthor, authorFlairByMod;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this._baseTransaction(trx)(TABLES.COMMENTS)
                            .select("cid")
                            .where("authorAddress", authorAddress)];
                    case 1:
                        authorComments = _c.sent();
                        if (!Array.isArray(authorComments) || authorComments.length === 0)
                            return [2 /*return*/, {}];
                        return [4 /*yield*/, this._baseTransaction(trx)(TABLES.COMMENT_EDITS)
                                .select("commentAuthor")
                                .whereIn("commentCid", authorComments.map(function (c) { return c.cid; }))
                                .whereNotNull("commentAuthor")
                                .orderBy("timestamp", "desc")];
                    case 2:
                        commentAuthorEdits = _c.sent();
                        banAuthor = (_a = commentAuthorEdits.find(function (edit) { var _a; return typeof ((_a = edit.commentAuthor) === null || _a === void 0 ? void 0 : _a.banExpiresAt) === "number"; })) === null || _a === void 0 ? void 0 : _a.commentAuthor;
                        authorFlairByMod = (_b = commentAuthorEdits.find(function (edit) { var _a; return (_a = edit.commentAuthor) === null || _a === void 0 ? void 0 : _a.flair; })) === null || _b === void 0 ? void 0 : _b.commentAuthor;
                        return [2 /*return*/, __assign(__assign({}, banAuthor), authorFlairByMod)];
                }
            });
        });
    };
    DbHandler.prototype.querySubplebbitAuthor = function (authorAddress, trx) {
        return __awaiter(this, void 0, void 0, function () {
            var authorCommentCids, authorComments, _i, authorCommentCids_1, cidObj, _a, _b, _c, _d, authorPosts, authorReplies, postScore, replyScore, lastCommentCid, firstCommentTimestamp, modAuthorEdits;
            var _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0: return [4 /*yield*/, this._baseTransaction(trx)(TABLES.COMMENTS).select("cid").where("authorAddress", authorAddress)];
                    case 1:
                        authorCommentCids = _f.sent();
                        (0, assert_1.default)(authorCommentCids.length > 0);
                        authorComments = [];
                        _i = 0, authorCommentCids_1 = authorCommentCids;
                        _f.label = 2;
                    case 2:
                        if (!(_i < authorCommentCids_1.length)) return [3 /*break*/, 7];
                        cidObj = authorCommentCids_1[_i];
                        _b = (_a = authorComments).push;
                        _c = [{}];
                        return [4 /*yield*/, this.queryComment(cidObj["cid"], trx)];
                    case 3:
                        _d = [__assign.apply(void 0, _c.concat([(_f.sent())]))];
                        _e = {};
                        return [4 /*yield*/, this._queryCommentUpvote(cidObj["cid"], trx)];
                    case 4:
                        _e.upvoteCount = _f.sent();
                        return [4 /*yield*/, this._queryCommentDownvote(cidObj["cid"], trx)];
                    case 5:
                        _b.apply(_a, [__assign.apply(void 0, _d.concat([(_e.downvoteCount = _f.sent(), _e)]))]);
                        _f.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 2];
                    case 7:
                        authorPosts = authorComments.filter(function (comment) { return comment.depth === 0; });
                        authorReplies = authorComments.filter(function (comment) { return comment.depth > 0; });
                        postScore = (0, sumBy_1.default)(authorPosts, function (post) { return post.upvoteCount; }) - (0, sumBy_1.default)(authorPosts, function (post) { return post.downvoteCount; });
                        replyScore = (0, sumBy_1.default)(authorReplies, function (reply) { return reply.upvoteCount; }) - (0, sumBy_1.default)(authorReplies, function (reply) { return reply.downvoteCount; });
                        lastCommentCid = lodash_1.default.maxBy(authorComments, function (comment) { return comment.id; }).cid;
                        firstCommentTimestamp = lodash_1.default.minBy(authorComments, function (comment) { return comment.id; }).timestamp;
                        return [4 /*yield*/, this.queryAuthorModEdits(authorAddress, trx)];
                    case 8:
                        modAuthorEdits = _f.sent();
                        return [2 /*return*/, __assign(__assign({ postScore: postScore, replyScore: replyScore, lastCommentCid: lastCommentCid }, modAuthorEdits), { firstCommentTimestamp: firstCommentTimestamp })];
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
                                onCompromised: function () { } // Temporary bandaid for the moment. Should be deleted later
                            })];
                    case 2:
                        _a.sent();
                        log("Locked the start of subplebbit (".concat(subAddress, ") successfully"));
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        if (e_1.message === "Lock file is already being held")
                            (0, util_1.throwWithErrorCode)("ERR_SUB_ALREADY_STARTED", { subplebbitAddress: subAddress });
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
                        log = (0, plebbit_logger_1.default)("plebbit-js:lock:start");
                        log.trace("Attempting to unlock the start of sub (".concat(subAddress, ")"));
                        lockfilePath = path_1.default.join(this._subplebbit.plebbit.dataPath, "subplebbits", "".concat(subAddress, ".start.lock"));
                        subDbPath = path_1.default.join(this._subplebbit.plebbit.dataPath, "subplebbits", subAddress);
                        if (!fs_1.default.existsSync(lockfilePath) || !fs_1.default.existsSync(subDbPath))
                            return [2 /*return*/];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, lockfile.unlock(subDbPath, { lockfilePath: lockfilePath })];
                    case 2:
                        _a.sent();
                        log("Unlocked start of sub (".concat(subAddress, ")"));
                        return [3 /*break*/, 4];
                    case 3:
                        e_2 = _a.sent();
                        log("Error while trying to unlock start of sub (".concat(subAddress, "): ").concat(e_2));
                        throw e_2;
                    case 4: return [2 /*return*/];
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
                return [2 /*return*/, lockfile.check(subDbPath, { lockfilePath: lockfilePath, realpath: false, stale: 30000 })];
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
                            (0, util_1.throwWithErrorCode)("ERR_SUB_CREATION_LOCKED", { subplebbitAddress: subAddress });
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
                        log.trace("Attempting to unlock the creation of sub (".concat(subAddress, ")"));
                        lockfilePath = path_1.default.join(this._subplebbit.plebbit.dataPath, "subplebbits", "".concat(subAddress, ".create.lock"));
                        subDbPath = path_1.default.join(this._subplebbit.plebbit.dataPath, "subplebbits", subAddress);
                        if (!fs_1.default.existsSync(lockfilePath))
                            return [2 /*return*/];
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
                                retries: 5,
                                onCompromised: function () { }
                            })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_5 = _a.sent();
                        if (e_5.message === "Lock file is already being held")
                            (0, util_1.throwWithErrorCode)("ERR_SUB_STATE_LOCKED", { subplebbitAddress: subAddress });
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
                        if (!fs_1.default.existsSync(lockfilePath))
                            return [2 /*return*/];
                        return [4 /*yield*/, lockfile.unlock(subDbPath, { lockfilePath: lockfilePath, realpath: false })];
                    case 1:
                        _a.sent();
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
    return DbHandler;
}());
exports.DbHandler = DbHandler;
//# sourceMappingURL=db-handler.js.map