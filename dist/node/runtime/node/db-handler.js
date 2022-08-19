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
exports.subplebbitInitDbIfNeeded = exports.DbHandler = void 0;
var challenge_1 = require("../../challenge");
var post_1 = __importDefault(require("../../post"));
var author_1 = __importDefault(require("../../author"));
var util_1 = require("../../util");
var knex_1 = __importDefault(require("knex"));
var path_1 = __importDefault(require("path"));
var assert_1 = __importDefault(require("assert"));
var fs_1 = __importDefault(require("fs"));
var keyv_1 = __importDefault(require("keyv"));
var debugs = (0, util_1.getDebugLevels)("db-handler");
var TABLES = Object.freeze({
    COMMENTS: "comments",
    VOTES: "votes",
    AUTHORS: "authors",
    CHALLENGES: "challenges",
    SIGNERS: "signers",
    EDITS: "edits"
});
var jsonFields = [
    "signature",
    "author",
    "authorEdit",
    "original",
    "flair",
    "commentAuthor",
    "acceptedChallengeTypes",
    "challenges",
    "challengeAnswers",
    "challengeErrors"
];
var currentDbVersion = 1;
var DbHandler = /** @class */ (function () {
    function DbHandler(dbConfig, subplebbit) {
        this._dbConfig = dbConfig;
        this.knex = (0, knex_1.default)(dbConfig);
        this.subplebbit = subplebbit;
        this._currentTrxs = {};
    }
    DbHandler.prototype.createTransaction = function (transactionId) {
        return __awaiter(this, void 0, void 0, function () {
            var trx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, assert_1.default)(!this._currentTrxs[transactionId]);
                        return [4 /*yield*/, this.knex.transaction()];
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
            var trx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        trx = this._currentTrxs[transactionId];
                        if (!trx) return [3 /*break*/, 2];
                        (0, assert_1.default)(trx && trx.isTransaction && !trx.isCompleted(), "Transaction (".concat(transactionId, ") needs to be stored to rollback"));
                        return [4 /*yield*/, this._currentTrxs[transactionId].rollback()];
                    case 1:
                        _a.sent();
                        delete this._currentTrxs[transactionId];
                        _a.label = 2;
                    case 2:
                        debugs.DEBUG("Rolledback transaction (".concat(transactionId, "), this._currentTrxs[transactionId].length = ").concat(Object.keys(this._currentTrxs).length));
                        return [2 /*return*/];
                }
            });
        });
    };
    DbHandler.prototype.baseTransaction = function (trx) {
        return trx ? trx : this.knex;
    };
    DbHandler.prototype.createCommentsTable = function (tableName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.knex.schema.createTable(tableName, function (table) {
                            table.text("cid").notNullable().primary().unique();
                            table.text("authorAddress").notNullable().references("address").inTable(TABLES.AUTHORS);
                            table.json("author").notNullable();
                            table.string("link").nullable();
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
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DbHandler.prototype.createVotesTable = function (tableName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.knex.schema.createTable(tableName, function (table) {
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
    DbHandler.prototype.createAuthorsTable = function (tableName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.knex.schema.createTable(tableName, function (table) {
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
    DbHandler.prototype.createChallengesTable = function (tableName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.knex.schema.createTable(tableName, function (table) {
                            table.uuid("challengeRequestId").notNullable().primary().unique();
                            table.enum("type", Object.values(challenge_1.PUBSUB_MESSAGE_TYPES)).notNullable();
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
    DbHandler.prototype.createSignersTable = function (tableName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.knex.schema.createTable(tableName, function (table) {
                            table.text("ipnsKeyName").notNullable().unique().primary();
                            table.text("privateKey").notNullable().unique();
                            table.text("publicKey").notNullable().unique();
                            table.text("address").nullable();
                            table.text("type").notNullable(); // RSA or any other type
                            table.enum("usage", Object.values(["comment", "subplebbit"])).notNullable();
                            table.binary("ipfsKey").notNullable().unique();
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DbHandler.prototype.createEditsTable = function (tableName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.knex.schema.createTable(tableName, function (table) {
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
    DbHandler.prototype.createTablesIfNeeded = function () {
        return __awaiter(this, void 0, void 0, function () {
            var dbVersion, _a, _b, _c, _d, _e, _f, needToMigrate, createTableFunctions, tables;
            var _this = this;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        _a = Number;
                        return [4 /*yield*/, this.knex.raw("PRAGMA user_version")];
                    case 1:
                        dbVersion = _a.apply(void 0, [(_g.sent())[0]["user_version"]]);
                        _c = (_b = debugs).DEBUG;
                        _d = "PRAGMA user_version = ".concat;
                        _f = (_e = JSON).stringify;
                        return [4 /*yield*/, this.knex.raw("PRAGMA user_version")];
                    case 2:
                        _c.apply(_b, [_d.apply("PRAGMA user_version = ", [_f.apply(_e, [_g.sent()]), ", dbVersion(parsed) = "]).concat(dbVersion)]);
                        needToMigrate = dbVersion !== currentDbVersion;
                        createTableFunctions = [
                            this.createCommentsTable,
                            this.createVotesTable,
                            this.createAuthorsTable,
                            this.createChallengesTable,
                            this.createSignersTable,
                            this.createEditsTable
                        ];
                        tables = Object.values(TABLES);
                        return [4 /*yield*/, Promise.all(tables.map(function (table) { return __awaiter(_this, void 0, void 0, function () {
                                var i, tableExists, tempTableName;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            i = tables.indexOf(table);
                                            return [4 /*yield*/, this.knex.schema.hasTable(table)];
                                        case 1:
                                            tableExists = _a.sent();
                                            if (!!tableExists) return [3 /*break*/, 3];
                                            return [4 /*yield*/, createTableFunctions[i].bind(this)(table)];
                                        case 2:
                                            _a.sent();
                                            return [3 /*break*/, 9];
                                        case 3:
                                            if (!(tableExists && needToMigrate)) return [3 /*break*/, 9];
                                            debugs.INFO("Migrating table ".concat(table, " to new schema"));
                                            return [4 /*yield*/, this.knex.raw("PRAGMA foreign_keys = OFF")];
                                        case 4:
                                            _a.sent();
                                            tempTableName = "".concat(table).concat(currentDbVersion);
                                            return [4 /*yield*/, createTableFunctions[i].bind(this)(tempTableName)];
                                        case 5:
                                            _a.sent();
                                            return [4 /*yield*/, this.copyTable(table, tempTableName)];
                                        case 6:
                                            _a.sent();
                                            return [4 /*yield*/, this.knex.schema.dropTable(table)];
                                        case 7:
                                            _a.sent();
                                            return [4 /*yield*/, this.knex.schema.renameTable(tempTableName, table)];
                                        case 8:
                                            _a.sent();
                                            _a.label = 9;
                                        case 9: return [2 /*return*/];
                                    }
                                });
                            }); }))];
                    case 3:
                        _g.sent();
                        return [4 /*yield*/, this.knex.raw("PRAGMA foreign_keys = ON")];
                    case 4:
                        _g.sent();
                        return [4 /*yield*/, this.knex.raw("PRAGMA user_version = ".concat(currentDbVersion))];
                    case 5:
                        _g.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DbHandler.prototype.copyTable = function (srcTable, dstTable) {
        return __awaiter(this, void 0, void 0, function () {
            var srcRecords;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.knex(srcTable).select("*")];
                    case 1:
                        srcRecords = _a.sent();
                        debugs.DEBUG("Attempting to copy ".concat(srcRecords.length, " ").concat(srcTable));
                        if (!(srcRecords.length > 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.knex(dstTable).insert(srcRecords)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        debugs.DEBUG("copied table ".concat(srcTable, " to table ").concat(dstTable));
                        return [2 /*return*/];
                }
            });
        });
    };
    DbHandler.prototype.upsertAuthor = function (author, trx, upsertOnlyWhenNew) {
        if (upsertOnlyWhenNew === void 0) { upsertOnlyWhenNew = true; }
        return __awaiter(this, void 0, void 0, function () {
            var existingDbObject, _a, newDbObject, mergedDbObject;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        (0, assert_1.default)(JSON.stringify(author) !== "{}");
                        if (!author.address) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.baseTransaction(trx)(TABLES.AUTHORS).where({ address: author.address }).first()];
                    case 1:
                        _a = _b.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        _a = undefined;
                        _b.label = 3;
                    case 3:
                        existingDbObject = _a;
                        if (existingDbObject && upsertOnlyWhenNew)
                            return [2 /*return*/];
                        if (existingDbObject)
                            existingDbObject = (0, util_1.replaceXWithY)(existingDbObject, null, undefined);
                        newDbObject = author instanceof author_1.default ? author.toJSONForDb() : author;
                        mergedDbObject = __assign(__assign({}, existingDbObject), newDbObject);
                        debugs.DEBUG("upsertAuthor: attempt to upsert new merged author: ".concat(JSON.stringify(mergedDbObject), ", existingDbObject = ").concat(JSON.stringify(existingDbObject), ", author = ").concat(JSON.stringify(newDbObject)));
                        return [4 /*yield*/, this.baseTransaction(trx)(TABLES.AUTHORS).insert(mergedDbObject).onConflict(["address"]).merge()];
                    case 4:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DbHandler.prototype.updateAuthor = function (newAuthorProps, updateCommentsAuthor, trx) {
        if (updateCommentsAuthor === void 0) { updateCommentsAuthor = true; }
        return __awaiter(this, void 0, void 0, function () {
            var onlyNewProps, commentsWithAuthor, _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        onlyNewProps = (0, util_1.removeKeysWithUndefinedValues)((0, util_1.removeKeys)(newAuthorProps, ["address"]));
                        return [4 /*yield*/, this.baseTransaction(trx)(TABLES.AUTHORS).update(onlyNewProps).where("address", newAuthorProps.address)];
                    case 1:
                        _b.sent();
                        if (!updateCommentsAuthor) return [3 /*break*/, 5];
                        _a = this.createCommentsFromRows;
                        return [4 /*yield*/, this.baseCommentQuery(trx).where("authorAddress", newAuthorProps.address)];
                    case 2: return [4 /*yield*/, _a.apply(this, [_b.sent()])];
                    case 3:
                        commentsWithAuthor = _b.sent();
                        return [4 /*yield*/, Promise.all(commentsWithAuthor.map(function (comment) { return __awaiter(_this, void 0, void 0, function () {
                                var newOriginal, newCommentProps;
                                var _a;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            newOriginal = ((_a = comment.original) === null || _a === void 0 ? void 0 : _a.author)
                                                ? comment.original
                                                : __assign(__assign({}, comment.original), { author: comment.author.toJSON() });
                                            newCommentProps = { author: __assign(__assign({}, comment.author.toJSON()), onlyNewProps), original: newOriginal };
                                            return [4 /*yield*/, this.baseTransaction(trx)(TABLES.COMMENTS).update(newCommentProps).where("cid", comment.cid)];
                                        case 1:
                                            _b.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); }))];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    DbHandler.prototype.queryAuthor = function (authorAddress, trx) {
        return __awaiter(this, void 0, void 0, function () {
            var authorProps;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.baseTransaction(trx)(TABLES.AUTHORS).where({ address: authorAddress }).first()];
                    case 1:
                        authorProps = _a.sent();
                        if (authorProps)
                            return [2 /*return*/, new author_1.default(authorProps)];
                        return [2 /*return*/];
                }
            });
        });
    };
    DbHandler.prototype.upsertVote = function (vote, challengeRequestId, trx) {
        return __awaiter(this, void 0, void 0, function () {
            var dbObject;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.upsertAuthor(vote.author, trx, true)];
                    case 1:
                        _a.sent();
                        dbObject = vote.toJSONForDb(challengeRequestId);
                        return [4 /*yield*/, this.baseTransaction(trx)(TABLES.VOTES).insert(dbObject).onConflict(["commentCid", "authorAddress"]).merge()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DbHandler.prototype.upsertComment = function (postOrComment, challengeRequestId, trx) {
        return __awaiter(this, void 0, void 0, function () {
            var originalComment, dbObject;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, assert_1.default)(postOrComment.cid, "Comment need to have a cid before upserting");
                        if (!postOrComment.author) return [3 /*break*/, 2];
                        // Skip adding author (For CommentEdit)
                        return [4 /*yield*/, this.upsertAuthor(postOrComment.author, trx, true)];
                    case 1:
                        // Skip adding author (For CommentEdit)
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        if (!!challengeRequestId) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.baseTransaction(trx)(TABLES.COMMENTS)
                                .where({
                                cid: postOrComment.cid
                            })
                                .first()];
                    case 3:
                        challengeRequestId = (_a.sent()).challengeRequestId;
                        _a.label = 4;
                    case 4:
                        (0, assert_1.default)(challengeRequestId, "Need to have challengeRequestId before upserting");
                        return [4 /*yield*/, this.queryComment(postOrComment.cid, trx)];
                    case 5:
                        originalComment = _a.sent();
                        dbObject = originalComment
                            ? __assign(__assign({}, (0, util_1.removeKeysWithUndefinedValues)(originalComment.toJSONForDb(challengeRequestId))), (0, util_1.removeKeysWithUndefinedValues)(postOrComment.toJSONForDb(challengeRequestId))) : postOrComment.toJSONForDb(challengeRequestId);
                        return [4 /*yield*/, this.baseTransaction(trx)(TABLES.COMMENTS).insert(dbObject).onConflict(["cid"]).merge()];
                    case 6:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DbHandler.prototype.insertEdit = function (edit, challengeRequestId, trx) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.baseTransaction(trx)(TABLES.EDITS).insert(edit.toJSONForDb(challengeRequestId))];
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
                    case 0: return [4 /*yield*/, this.baseTransaction(trx)(TABLES.COMMENTS).select("authorAddress").where("cid", commentCid).first()];
                    case 1:
                        authorAddress = (_d.sent())
                            .authorAddress;
                        if (!!editor) return [3 /*break*/, 3];
                        _a = this.createEditsFromRows;
                        return [4 /*yield*/, this.baseTransaction(trx)(TABLES.EDITS).orderBy("id", "desc")];
                    case 2: return [2 /*return*/, _a.apply(this, [_d.sent()])];
                    case 3:
                        if (!(editor === "author")) return [3 /*break*/, 5];
                        _b = this.createEditsFromRows;
                        return [4 /*yield*/, this.baseTransaction(trx)(TABLES.EDITS).where("authorAddress", authorAddress).orderBy("id", "desc")];
                    case 4: return [2 /*return*/, _b.apply(this, [_d.sent()])];
                    case 5:
                        if (!(editor === "mod")) return [3 /*break*/, 7];
                        _c = this.createEditsFromRows;
                        return [4 /*yield*/, this.baseTransaction(trx)(TABLES.EDITS).whereNot("authorAddress", authorAddress).orderBy("id", "desc")];
                    case 6: return [2 /*return*/, _c.apply(this, [_d.sent()])];
                    case 7: return [2 /*return*/, []];
                }
            });
        });
    };
    DbHandler.prototype.editComment = function (edit, challengeRequestId, trx) {
        return __awaiter(this, void 0, void 0, function () {
            var commentToBeEdited, isEditFromAuthor, newProps, modEdits, hasModEditedCommentFlairBefore, flairIfNeeded;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Fields that need to be merged
                        // flair
                        (0, assert_1.default)(edit.commentCid);
                        return [4 /*yield*/, this.queryComment(edit.commentCid)];
                    case 1:
                        commentToBeEdited = _a.sent();
                        (0, assert_1.default)(commentToBeEdited);
                        isEditFromAuthor = commentToBeEdited.signature.publicKey === edit.signature.publicKey;
                        if (!isEditFromAuthor) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.queryEditsSorted(edit.commentCid, "mod", trx)];
                    case 2:
                        modEdits = _a.sent();
                        hasModEditedCommentFlairBefore = modEdits.some(function (modEdit) { return Boolean(modEdit.flair); });
                        flairIfNeeded = hasModEditedCommentFlairBefore || !edit.flair ? undefined : { flair: JSON.stringify(edit.flair) };
                        newProps = (0, util_1.removeKeysWithUndefinedValues)(__assign({ authorEdit: JSON.stringify(edit.toJSONForDb(challengeRequestId)), original: JSON.stringify(commentToBeEdited.original || commentToBeEdited.toJSONSkeleton()) }, flairIfNeeded));
                        debugs.TRACE("Will update comment (".concat(edit.commentCid, ") with author props: ").concat(JSON.stringify(newProps)));
                        return [3 /*break*/, 4];
                    case 3:
                        newProps = __assign(__assign({}, edit.toJSONForDb(challengeRequestId)), { original: JSON.stringify(commentToBeEdited.original || commentToBeEdited.toJSONSkeleton()) });
                        debugs.TRACE("Will update comment (".concat(edit.commentCid, ") with mod props: ").concat(JSON.stringify((0, util_1.removeKeys)(newProps, ["signature"]))));
                        _a.label = 4;
                    case 4: return [4 /*yield*/, this.baseTransaction(trx)(TABLES.COMMENTS).update(newProps).where("cid", edit.commentCid)];
                    case 5:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DbHandler.prototype.upsertChallenge = function (challenge, trx) {
        return __awaiter(this, void 0, void 0, function () {
            var existingChallenge, dbObject;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.baseTransaction(trx)(TABLES.CHALLENGES)
                            .where({ challengeRequestId: challenge.challengeRequestId })
                            .first()];
                    case 1:
                        existingChallenge = _a.sent();
                        dbObject = __assign(__assign({}, existingChallenge), challenge.toJSONForDb());
                        return [4 /*yield*/, this.baseTransaction(trx)(TABLES.CHALLENGES).insert(dbObject).onConflict("challengeRequestId").merge()];
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
                    case 0: return [4 /*yield*/, this.baseTransaction(trx)(TABLES.VOTES)
                            .where({
                            commentCid: commentCid,
                            authorAddress: authorAddress
                        })
                            .first()];
                    case 1:
                        voteObj = _a.sent();
                        return [4 /*yield*/, this.createVotesFromRows(voteObj)];
                    case 2: return [2 /*return*/, (_a.sent())[0]];
                }
            });
        });
    };
    DbHandler.prototype.baseCommentQuery = function (trx) {
        var _a, _b;
        var upvoteQuery = this.baseTransaction(trx)(TABLES.VOTES)
            .count("".concat(TABLES.VOTES, ".vote"))
            .where((_a = {},
            _a["".concat(TABLES.COMMENTS, ".cid")] = this.knex.raw("".concat(TABLES.VOTES, ".commentCid")),
            _a["".concat(TABLES.VOTES, ".vote")] = 1,
            _a))
            .as("upvoteCount");
        var downvoteQuery = this.baseTransaction(trx)(TABLES.VOTES)
            .count("".concat(TABLES.VOTES, ".vote"))
            .where((_b = {},
            _b["".concat(TABLES.COMMENTS, ".cid")] = this.knex.raw("".concat(TABLES.VOTES, ".commentCid")),
            _b["".concat(TABLES.VOTES, ".vote")] = -1,
            _b))
            .as("downvoteCount");
        var replyCountQuery = this.baseTransaction(trx)
            .from("".concat(TABLES.COMMENTS, " AS comments2"))
            .count("")
            .where({
            "comments2.parentCid": this.knex.raw("".concat(TABLES.COMMENTS, ".cid"))
        })
            .as("replyCount");
        return this.baseTransaction(trx)(TABLES.COMMENTS).select("".concat(TABLES.COMMENTS, ".*"), upvoteQuery, downvoteQuery, replyCountQuery);
    };
    DbHandler.prototype.createCommentsFromRows = function (commentsRows) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                if (!commentsRows || (Array.isArray(commentsRows) && (commentsRows === null || commentsRows === void 0 ? void 0 : commentsRows.length) === 0))
                    return [2 /*return*/, []];
                if (!Array.isArray(commentsRows))
                    commentsRows = [commentsRows];
                return [2 /*return*/, Promise.all(commentsRows.map(function (props) { return __awaiter(_this, void 0, void 0, function () {
                        var replacedProps, _i, jsonFields_1, field, comment;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    replacedProps = (0, util_1.replaceXWithY)(props, null, undefined);
                                    for (_i = 0, jsonFields_1 = jsonFields; _i < jsonFields_1.length; _i++) {
                                        field = jsonFields_1[_i];
                                        if (replacedProps[field])
                                            replacedProps[field] = JSON.parse(replacedProps[field]);
                                    }
                                    return [4 /*yield*/, this.subplebbit.plebbit.createComment(replacedProps)];
                                case 1:
                                    comment = _a.sent();
                                    (0, assert_1.default)(typeof comment.replyCount === "number");
                                    return [2 /*return*/, comment];
                            }
                        });
                    }); }))];
            });
        });
    };
    DbHandler.prototype.createEditsFromRows = function (edits) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                if (!edits || (Array.isArray(edits) && (edits === null || edits === void 0 ? void 0 : edits.length) === 0))
                    return [2 /*return*/, []];
                if (!Array.isArray(edits))
                    edits = [edits];
                return [2 /*return*/, Promise.all(edits.map(function (props) { return __awaiter(_this, void 0, void 0, function () {
                        var replacedProps, _i, jsonFields_2, field;
                        return __generator(this, function (_a) {
                            replacedProps = (0, util_1.replaceXWithY)(props, null, undefined);
                            for (_i = 0, jsonFields_2 = jsonFields; _i < jsonFields_2.length; _i++) {
                                field = jsonFields_2[_i];
                                if (replacedProps[field])
                                    replacedProps[field] = JSON.parse(replacedProps[field]);
                            }
                            return [2 /*return*/, this.subplebbit.plebbit.createCommentEdit(replacedProps)];
                        });
                    }); }))];
            });
        });
    };
    DbHandler.prototype.createVotesFromRows = function (voteRows) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                if (!voteRows || (Array.isArray(voteRows) && voteRows.length === 0))
                    return [2 /*return*/, []];
                if (!Array.isArray(voteRows))
                    voteRows = [voteRows];
                return [2 /*return*/, Promise.all(voteRows.map(function (props) {
                        var replacedProps = (0, util_1.replaceXWithY)(props, null, undefined);
                        for (var _i = 0, jsonFields_3 = jsonFields; _i < jsonFields_3.length; _i++) {
                            var field = jsonFields_3[_i];
                            if (replacedProps[field])
                                replacedProps[field] = JSON.parse(replacedProps[field]);
                        }
                        return _this.subplebbit.plebbit.createVote(replacedProps);
                    }))];
            });
        });
    };
    DbHandler.prototype.queryCommentsSortedByTimestamp = function (parentCid, order, trx) {
        if (order === void 0) { order = "desc"; }
        return __awaiter(this, void 0, void 0, function () {
            var commentObj;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        parentCid = parentCid || null;
                        return [4 /*yield*/, this.baseCommentQuery(trx).where({ parentCid: parentCid }).orderBy("timestamp", order)];
                    case 1:
                        commentObj = _a.sent();
                        return [2 /*return*/, this.createCommentsFromRows(commentObj)];
                }
            });
        });
    };
    DbHandler.prototype.queryCommentsBetweenTimestampRange = function (parentCid, timestamp1, timestamp2, trx) {
        return __awaiter(this, void 0, void 0, function () {
            var rawCommentObjs;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        parentCid = parentCid || null;
                        if (timestamp1 === Number.NEGATIVE_INFINITY)
                            timestamp1 = 0;
                        return [4 /*yield*/, this.baseCommentQuery(trx)
                                .where({ parentCid: parentCid })
                                .whereBetween("timestamp", [timestamp1, timestamp2])];
                    case 1:
                        rawCommentObjs = _a.sent();
                        return [2 /*return*/, this.createCommentsFromRows(rawCommentObjs)];
                }
            });
        });
    };
    DbHandler.prototype.queryTopCommentsBetweenTimestampRange = function (parentCid, timestamp1, timestamp2, trx) {
        return __awaiter(this, void 0, void 0, function () {
            var topScoreQuery, rawCommentsObjs;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (timestamp1 === Number.NEGATIVE_INFINITY)
                            timestamp1 = 0;
                        parentCid = parentCid || null;
                        topScoreQuery = this.baseTransaction(trx)(TABLES.VOTES)
                            .select(this.knex.raw("COALESCE(SUM(".concat(TABLES.VOTES, ".vote), 0)"))) // We're using raw expressions because there's no native method in Knexjs to return 0 if SUM is null
                            .where((_a = {},
                            _a["".concat(TABLES.COMMENTS, ".cid")] = this.knex.raw("".concat(TABLES.VOTES, ".commentCid")),
                            _a))
                            .as("topScore");
                        return [4 /*yield*/, this.baseCommentQuery(trx)
                                .select(topScoreQuery)
                                .groupBy("".concat(TABLES.COMMENTS, ".cid"))
                                .orderBy("topScore", "desc")
                                .whereBetween("".concat(TABLES.COMMENTS, ".timestamp"), [timestamp1, timestamp2])
                                .where((_b = {}, _b["".concat(TABLES.COMMENTS, ".parentCid")] = parentCid, _b))];
                    case 1:
                        rawCommentsObjs = _c.sent();
                        return [2 /*return*/, this.createCommentsFromRows(rawCommentsObjs)];
                }
            });
        });
    };
    DbHandler.prototype.queryCommentsUnderComment = function (parentCid, trx) {
        return __awaiter(this, void 0, void 0, function () {
            var commentsObjs;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        parentCid = parentCid || null;
                        return [4 /*yield*/, this.baseCommentQuery(trx).where({ parentCid: parentCid }).orderBy("timestamp", "desc")];
                    case 1:
                        commentsObjs = _a.sent();
                        return [4 /*yield*/, this.createCommentsFromRows(commentsObjs)];
                    case 2: return [2 /*return*/, _a.sent()];
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
                        _a = this.createCommentsFromRows;
                        return [4 /*yield*/, this.baseCommentQuery(trx).orderBy("id", "desc")];
                    case 1: return [2 /*return*/, _a.apply(this, [_b.sent()])];
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
                                                        return [4 /*yield*/, this.baseTransaction(trx)(TABLES.COMMENTS)
                                                                .countDistinct("comments.authorAddress")
                                                                .join(TABLES.VOTES, "".concat(TABLES.COMMENTS, ".authorAddress"), "=", "".concat(TABLES.VOTES, ".authorAddress"))
                                                                .whereBetween("comments.timestamp", [from, to])];
                                                    case 1:
                                                        res = (_d.sent())[0]["count(distinct `comments`.`authorAddress`)"];
                                                        return [2 /*return*/, (_b = {}, _b[propertyName] = res, _b)];
                                                    case 2:
                                                        if (!(metricType === "PostCount")) return [3 /*break*/, 4];
                                                        query = this.baseTransaction(trx)(TABLES.COMMENTS)
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
                        return [4 /*yield*/, this.baseCommentQuery(trx).where("cid", cid).first()];
                    case 1:
                        commentObj = _a.sent();
                        return [4 /*yield*/, this.createCommentsFromRows(commentObj)];
                    case 2: return [2 /*return*/, (_a.sent())[0]];
                }
            });
        });
    };
    DbHandler.prototype.queryLatestPost = function (trx) {
        return __awaiter(this, void 0, void 0, function () {
            var commentObj, post;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.baseCommentQuery(trx).whereNotNull("title").orderBy("id", "desc").first()];
                    case 1:
                        commentObj = _a.sent();
                        return [4 /*yield*/, this.createCommentsFromRows(commentObj)];
                    case 2:
                        post = (_a.sent())[0];
                        if (!post)
                            return [2 /*return*/, undefined];
                        (0, assert_1.default)(post instanceof post_1.default);
                        return [2 /*return*/, post];
                }
            });
        });
    };
    DbHandler.prototype.insertSigner = function (signer, trx) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.baseTransaction(trx)(TABLES.SIGNERS).insert(signer)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DbHandler.prototype.querySubplebbitSigner = function (trx) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.baseTransaction(trx)(TABLES.SIGNERS).where({ usage: "subplebbit" }).first()];
            });
        });
    };
    DbHandler.prototype.querySigner = function (ipnsKeyName, trx) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.baseTransaction(trx)(TABLES.SIGNERS).where({ ipnsKeyName: ipnsKeyName }).first()];
            });
        });
    };
    DbHandler.prototype.queryCommentsGroupByDepth = function (trx) {
        return __awaiter(this, void 0, void 0, function () {
            var maxDepth, depths, comments;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.baseTransaction(trx)(TABLES.COMMENTS).max("depth")];
                    case 1:
                        maxDepth = (_a.sent())[0]["max(`depth`)"];
                        if (typeof maxDepth !== "number")
                            return [2 /*return*/, [[]]];
                        depths = new Array(maxDepth + 1).fill(null).map(function (value, i) { return i; });
                        return [4 /*yield*/, Promise.all(depths.map(function (depth) { return __awaiter(_this, void 0, void 0, function () {
                                var commentsWithDepth;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.baseCommentQuery(trx).where({ depth: depth })];
                                        case 1:
                                            commentsWithDepth = _a.sent();
                                            return [2 /*return*/, this.createCommentsFromRows(commentsWithDepth)];
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
    DbHandler.prototype.queryCountOfPosts = function (trx) {
        return __awaiter(this, void 0, void 0, function () {
            var obj;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.baseTransaction(trx)(TABLES.COMMENTS).count().where({ depth: 0 }).first()];
                    case 1:
                        obj = _a.sent();
                        if (!obj)
                            return [2 /*return*/, 0];
                        return [2 /*return*/, Number(obj["count(*)"])];
                }
            });
        });
    };
    DbHandler.prototype.changeDbFilename = function (newDbFileName) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function () {
            var oldPathString, newPath;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        oldPathString = (_c = (_b = (_a = this.subplebbit) === null || _a === void 0 ? void 0 : _a._dbConfig) === null || _b === void 0 ? void 0 : _b.connection) === null || _c === void 0 ? void 0 : _c.filename;
                        assert_1.default.ok(oldPathString, "subplebbit._dbConfig either does not exist or DB connection is in memory");
                        if (oldPathString === ":memory:") {
                            debugs.DEBUG("No need to change file name of db since it's in memory");
                            return [2 /*return*/];
                        }
                        newPath = path_1.default.format({ dir: path_1.default.dirname(oldPathString), base: newDbFileName });
                        return [4 /*yield*/, fs_1.default.promises.mkdir(path_1.default.dirname(newPath), { recursive: true })];
                    case 1:
                        _d.sent();
                        return [4 /*yield*/, fs_1.default.promises.rename(oldPathString, newPath)];
                    case 2:
                        _d.sent();
                        this.subplebbit._dbConfig = __assign(__assign({}, this.subplebbit._dbConfig), { connection: {
                                filename: newPath
                            } });
                        this.subplebbit.dbHandler = new DbHandler(this.subplebbit._dbConfig, this.subplebbit);
                        this.subplebbit._keyv = new keyv_1.default("sqlite://".concat(this.subplebbit._dbConfig.connection.filename));
                        debugs.INFO("Changed db path from (".concat(oldPathString, ") to (").concat(newPath, ")"));
                        return [2 /*return*/];
                }
            });
        });
    };
    return DbHandler;
}());
exports.DbHandler = DbHandler;
var subplebbitInitDbIfNeeded = function (subplebbit) { return __awaiter(void 0, void 0, void 0, function () {
    var dbPath, dir;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (subplebbit.dbHandler)
                    return [2 /*return*/];
                if (!subplebbit._dbConfig) {
                    (0, assert_1.default)(subplebbit.address, "Need subplebbit address to initialize a DB connection");
                    dbPath = path_1.default.join(subplebbit.plebbit.dataPath, "subplebbits", subplebbit.address);
                    debugs.INFO("User has not provided a DB config. Will initialize DB in ".concat(dbPath));
                    subplebbit._dbConfig = {
                        client: "sqlite3",
                        connection: {
                            filename: dbPath
                        },
                        useNullAsDefault: true,
                        acquireConnectionTimeout: 120000
                    };
                }
                else
                    debugs.DEBUG("User provided a DB config of ".concat(JSON.stringify(subplebbit._dbConfig)));
                dir = path_1.default.dirname(subplebbit._dbConfig.connection.filename);
                return [4 /*yield*/, fs_1.default.promises.mkdir(dir, { recursive: true })];
            case 1:
                _a.sent();
                subplebbit.dbHandler = new DbHandler(subplebbit._dbConfig, subplebbit);
                return [4 /*yield*/, subplebbit.dbHandler.createTablesIfNeeded()];
            case 2:
                _a.sent();
                return [4 /*yield*/, subplebbit.initSignerIfNeeded()];
            case 3:
                _a.sent();
                subplebbit._keyv = new keyv_1.default("sqlite://".concat(subplebbit._dbConfig.connection.filename)); // TODO make this work with DBs other than sqlite
                return [2 /*return*/];
        }
    });
}); };
exports.subplebbitInitDbIfNeeded = subplebbitInitDbIfNeeded;
