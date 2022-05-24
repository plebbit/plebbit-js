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
exports.subplebbitInitDbIfNeeded = exports.DbHandler = exports.SIGNER_USAGES = void 0;
var challenge_1 = require("../../challenge");
var post_1 = __importDefault(require("../../post"));
var author_1 = __importDefault(require("../../author"));
var comment_1 = require("../../comment");
var util_1 = require("../../util");
var vote_1 = __importDefault(require("../../vote"));
var knex_1 = __importDefault(require("knex"));
var debug_1 = __importDefault(require("debug"));
var path_1 = __importDefault(require("path"));
var assert_1 = __importDefault(require("assert"));
var fs_1 = __importDefault(require("fs"));
var keyv_1 = __importDefault(require("keyv"));
var debug = (0, debug_1.default)("plebbit-js:db-handler");
exports.SIGNER_USAGES = { SUBPLEBBIT: "subplebbit", COMMENT: "comment" };
var TABLES = Object.freeze({
    COMMENTS: "comments",
    VOTES: "votes",
    AUTHORS: "authors",
    CHALLENGES: "challenges",
    SIGNERS: "signers" // To store private keys of subplebbit and comments' IPNS
});
var DbHandler = /** @class */ (function () {
    function DbHandler(dbConfig, subplebbit) {
        this._dbConfig = dbConfig;
        this.knex = (0, knex_1.default)(dbConfig);
        this.subplebbit = subplebbit;
    }
    DbHandler.prototype.createTransaction = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            this.knex
                                .transaction()
                                .then(resolve)
                                .catch(function (err) {
                                debug(err);
                                reject(err);
                            });
                            return [2 /*return*/];
                        });
                    }); })];
            });
        });
    };
    DbHandler.prototype.baseTransaction = function (trx) {
        return trx ? trx : this.knex;
    };
    DbHandler.prototype.createCommentsTable = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.knex.schema.createTable(TABLES.COMMENTS, function (table) {
                            table.text("cid").notNullable().primary().unique();
                            table.text("authorAddress").notNullable().references("address").inTable(TABLES.AUTHORS);
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
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DbHandler.prototype.createVotesTable = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.knex.schema.createTable(TABLES.VOTES, function (table) {
                            table.text("commentCid").notNullable().references("cid").inTable(TABLES.COMMENTS);
                            table.text("authorAddress").notNullable().references("address").inTable(TABLES.AUTHORS);
                            table.uuid("challengeRequestId").notNullable().references("challengeRequestId").inTable(TABLES.CHALLENGES);
                            table.timestamp("timestamp").checkPositive().notNullable();
                            table.text("subplebbitAddress").notNullable();
                            table.integer("vote").checkBetween([-1, 1]).notNullable();
                            table.text("signature").notNullable().unique();
                            table.primary(["commentCid", "authorAddress"]); // An author can't have multiple votes on a comment
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DbHandler.prototype.createAuthorsTable = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.knex.schema.createTable(TABLES.AUTHORS, function (table) {
                            table.text("address").notNullable().primary().unique();
                            table.text("displayName").nullable();
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DbHandler.prototype.createChallengesTable = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.knex.schema.createTable(TABLES.CHALLENGES, function (table) {
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
    DbHandler.prototype.createSignersTable = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.knex.schema.createTable(TABLES.SIGNERS, function (table) {
                            table.text("ipnsKeyName").notNullable().unique().primary();
                            table.text("privateKey").notNullable().unique();
                            table.text("publicKey").notNullable().unique();
                            table.text("address").nullable();
                            table.text("type").notNullable(); // RSA or any other type
                            table.enum("usage", Object.values(exports.SIGNER_USAGES)).notNullable();
                            table.binary("ipfsKey").notNullable().unique();
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
            var functions, tables, _i, tables_1, table, i, tableExists;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        functions = [
                            this.createCommentsTable,
                            this.createVotesTable,
                            this.createAuthorsTable,
                            this.createChallengesTable,
                            this.createSignersTable
                        ];
                        tables = Object.values(TABLES);
                        _i = 0, tables_1 = tables;
                        _a.label = 1;
                    case 1:
                        if (!(_i < tables_1.length)) return [3 /*break*/, 5];
                        table = tables_1[_i];
                        i = tables.indexOf(table);
                        return [4 /*yield*/, this.knex.schema.hasTable(table)];
                    case 2:
                        tableExists = _a.sent();
                        if (!!tableExists) return [3 /*break*/, 4];
                        return [4 /*yield*/, functions[i].bind(this)()];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 1];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    DbHandler.prototype.addAuthorToDbIfNeeded = function (author, trx) {
        if (trx === void 0) { trx = undefined; }
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var authorFromDb;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, this.baseTransaction(trx)(TABLES.AUTHORS).where({ address: author.address }).first()];
                                case 1:
                                    authorFromDb = _a.sent();
                                    if (!authorFromDb)
                                        // Author is new. Add to database
                                        this.baseTransaction(trx)(TABLES.AUTHORS)
                                            .insert(author.toJSON())
                                            .then(function () { return resolve(author.toJSON()); })
                                            .catch(function (err) {
                                            console.error(err);
                                            reject(err);
                                        });
                                    else
                                        resolve(authorFromDb);
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    DbHandler.prototype.upsertVote = function (vote, challengeRequestId, trx) {
        if (trx === void 0) { trx = undefined; }
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var dbObject;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, this.addAuthorToDbIfNeeded(vote.author, trx)];
                                case 1:
                                    _a.sent();
                                    dbObject = vote.toJSONForDb(challengeRequestId);
                                    this.baseTransaction(trx)(TABLES.VOTES)
                                        .insert(dbObject)
                                        .onConflict(["commentCid", "authorAddress"])
                                        .merge()
                                        .then(function () { return resolve(dbObject); })
                                        .catch(function (err) {
                                        console.error(err);
                                        reject(err);
                                    });
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    DbHandler.prototype.upsertComment = function (postOrComment, challengeRequestId, trx) {
        if (trx === void 0) { trx = undefined; }
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var originalComment, dbObject;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!postOrComment.author) return [3 /*break*/, 2];
                                    // Skip adding author (For CommentEdit)
                                    return [4 /*yield*/, this.addAuthorToDbIfNeeded(postOrComment.author, trx)];
                                case 1:
                                    // Skip adding author (For CommentEdit)
                                    _a.sent();
                                    _a.label = 2;
                                case 2:
                                    if (!!challengeRequestId) return [3 /*break*/, 4];
                                    return [4 /*yield*/, this.baseTransaction(trx)(TABLES.COMMENTS)
                                            .where({
                                            cid: postOrComment.cid || postOrComment.commentCid
                                        })
                                            .first()];
                                case 3:
                                    challengeRequestId = (_a.sent()).challengeRequestId;
                                    _a.label = 4;
                                case 4: return [4 /*yield*/, this.queryComment(postOrComment.cid || postOrComment.commentCid, trx)];
                                case 5:
                                    originalComment = _a.sent();
                                    dbObject = originalComment
                                        ? __assign(__assign({}, (0, util_1.removeKeysWithUndefinedValues)(originalComment.toJSONForDb(challengeRequestId))), (0, util_1.removeKeysWithUndefinedValues)(postOrComment.toJSONForDb(challengeRequestId))) : postOrComment.toJSONForDb(challengeRequestId);
                                    this.baseTransaction(trx)(TABLES.COMMENTS)
                                        .insert(dbObject)
                                        .onConflict(["cid"])
                                        .merge()
                                        .then(function () { return resolve(dbObject); })
                                        .catch(function (err) {
                                        console.error(err);
                                        reject(err);
                                    });
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    DbHandler.prototype.upsertChallenge = function (challenge, trx) {
        if (trx === void 0) { trx = undefined; }
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var existingChallenge, dbObject;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, this.baseTransaction(trx)(TABLES.CHALLENGES)
                                        .where({ challengeRequestId: challenge.challengeRequestId })
                                        .first()];
                                case 1:
                                    existingChallenge = _a.sent();
                                    dbObject = __assign(__assign({}, existingChallenge), challenge.toJSONForDb());
                                    this.baseTransaction(trx)(TABLES.CHALLENGES)
                                        .insert(dbObject)
                                        .onConflict("challengeRequestId")
                                        .merge()
                                        .then(function () { return resolve(dbObject); })
                                        .catch(function (err) {
                                        console.error(err);
                                        reject(err);
                                    });
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    DbHandler.prototype.getLastVoteOfAuthor = function (commentCid, authorAddress, trx) {
        if (trx === void 0) { trx = undefined; }
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_a) {
                            this.baseTransaction(trx)(TABLES.VOTES)
                                .where({
                                commentCid: commentCid,
                                authorAddress: authorAddress
                            })
                                .first()
                                .then(function (res) { return __awaiter(_this, void 0, void 0, function () { var _a; return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        _a = resolve;
                                        return [4 /*yield*/, this.createVotesFromRows.bind(this)(res, trx)];
                                    case 1: return [2 /*return*/, _a.apply(void 0, [(_b.sent())[0]])];
                                }
                            }); }); })
                                .catch(function (err) {
                                console.error(err);
                                reject(err);
                            });
                            return [2 /*return*/];
                        });
                    }); })];
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
    DbHandler.prototype.createCommentsFromRows = function (commentsRows, trx) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var authors_1, comments;
                        var _this = this;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!!commentsRows) return [3 /*break*/, 1];
                                    resolve([undefined]);
                                    return [3 /*break*/, 3];
                                case 1:
                                    if (!Array.isArray(commentsRows))
                                        commentsRows = [commentsRows];
                                    commentsRows = commentsRows.map(function (props) { return (0, util_1.replaceXWithY)(props, null, undefined); }); // Replace null with undefined to save storage (undefined is not included in JSON.stringify)
                                    return [4 /*yield*/, this.baseTransaction(trx)(TABLES.AUTHORS).whereIn("address", commentsRows.map(function (post) { return post.authorAddress; }))];
                                case 2:
                                    authors_1 = (_a.sent()).map(function (authorProps) { return new author_1.default(authorProps); });
                                    comments = commentsRows.map(function (commentProps) {
                                        var props = __assign(__assign({}, commentProps), { author: authors_1.filter(function (author) { return author.address === commentProps.authorAddress; })[0] });
                                        if (props["title"])
                                            // @ts-ignore
                                            return new post_1.default(props, _this.subplebbit);
                                        else
                                            return new comment_1.Comment(props, _this.subplebbit);
                                    });
                                    resolve(comments);
                                    _a.label = 3;
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    DbHandler.prototype.createVotesFromRows = function (voteRows, trx) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var authors_2, votes;
                        var _this = this;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!!voteRows) return [3 /*break*/, 1];
                                    resolve([undefined]);
                                    return [3 /*break*/, 3];
                                case 1:
                                    if (!Array.isArray(voteRows))
                                        voteRows = [voteRows];
                                    voteRows = voteRows.map(function (props) { return (0, util_1.replaceXWithY)(props, null, undefined); }); // Replace null with undefined to save storage (undefined is not included in JSON.stringify)
                                    return [4 /*yield*/, this.baseTransaction(trx)(TABLES.AUTHORS).whereIn("address", voteRows.map(function (vote) { return vote.authorAddress; }))];
                                case 2:
                                    authors_2 = (_a.sent()).map(function (authorProps) { return new author_1.default(authorProps); });
                                    votes = voteRows.map(function (voteProps) {
                                        var props = __assign(__assign({}, voteProps), { author: authors_2.filter(function (author) { return author.address === voteProps.authorAddress; })[0] });
                                        return new vote_1.default(props, _this.subplebbit);
                                    });
                                    resolve(votes);
                                    _a.label = 3;
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    DbHandler.prototype.queryCommentsSortedByTimestamp = function (parentCid, order, trx) {
        if (order === void 0) { order = "desc"; }
        if (trx === void 0) { trx = undefined; }
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_a) {
                            this.baseCommentQuery(trx)
                                .where({ parentCid: parentCid })
                                .orderBy("timestamp", order)
                                .then(function (res) { return __awaiter(_this, void 0, void 0, function () {
                                var _a;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            _a = resolve;
                                            return [4 /*yield*/, this.createCommentsFromRows.bind(this)(res, trx)];
                                        case 1:
                                            _a.apply(void 0, [_b.sent()]);
                                            return [2 /*return*/];
                                    }
                                });
                            }); })
                                .catch(function (err) {
                                console.error(err);
                                reject(err);
                            });
                            return [2 /*return*/];
                        });
                    }); })];
            });
        });
    };
    DbHandler.prototype.queryCommentsBetweenTimestampRange = function (parentCid, timestamp1, timestamp2, trx) {
        if (trx === void 0) { trx = undefined; }
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_a) {
                            if (timestamp1 === Number.NEGATIVE_INFINITY)
                                timestamp1 = 0;
                            this.baseCommentQuery(trx)
                                .where({ parentCid: parentCid })
                                .whereBetween("timestamp", [timestamp1, timestamp2])
                                .then(function (res) { return _this.createCommentsFromRows.bind(_this)(res, trx); })
                                .then(resolve)
                                .catch(function (err) {
                                console.error(err);
                                reject(err);
                            });
                            return [2 /*return*/];
                        });
                    }); })];
            });
        });
    };
    DbHandler.prototype.queryTopCommentsBetweenTimestampRange = function (parentCid, timestamp1, timestamp2, trx) {
        if (trx === void 0) { trx = undefined; }
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var topScoreQuery, query;
                        var _a, _b;
                        var _this = this;
                        return __generator(this, function (_c) {
                            if (timestamp1 === Number.NEGATIVE_INFINITY)
                                timestamp1 = 0;
                            topScoreQuery = this.baseTransaction(trx)(TABLES.VOTES)
                                .select(this.knex.raw("COALESCE(SUM(".concat(TABLES.VOTES, ".vote), 0)"))) // We're using raw expressions because there's no native method in Knexjs to return 0 if SUM is null
                                .where((_a = {},
                                _a["".concat(TABLES.COMMENTS, ".cid")] = this.knex.raw("".concat(TABLES.VOTES, ".commentCid")),
                                _a))
                                .as("topScore");
                            query = this.baseCommentQuery(trx)
                                .select(topScoreQuery)
                                .groupBy("".concat(TABLES.COMMENTS, ".cid"))
                                .orderBy("topScore", "desc")
                                .whereBetween("".concat(TABLES.COMMENTS, ".timestamp"), [timestamp1, timestamp2])
                                .where((_b = {}, _b["".concat(TABLES.COMMENTS, ".parentCid")] = parentCid, _b));
                            query
                                .then(function (res) { return resolve(_this.createCommentsFromRows.bind(_this)(res, trx)); })
                                .catch(function (err) {
                                console.error(err);
                                reject(err);
                            });
                            return [2 /*return*/];
                        });
                    }); })];
            });
        });
    };
    DbHandler.prototype.queryCommentsUnderComment = function (parentCid, trx) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_a) {
                            this.baseCommentQuery(trx)
                                .where({ parentCid: parentCid })
                                .orderBy("timestamp", "desc")
                                .then(function (res) { return resolve(_this.createCommentsFromRows.bind(_this)(res, trx)); })
                                .catch(reject);
                            return [2 /*return*/];
                        });
                    }); })];
            });
        });
    };
    DbHandler.prototype.queryComments = function (trx) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_a) {
                            this.baseCommentQuery(trx)
                                .orderBy("id", "desc")
                                .then(function (res) { return resolve(_this.createCommentsFromRows.bind(_this)(res, trx)); })
                                .catch(reject);
                            return [2 /*return*/];
                        });
                    }); })];
            });
        });
    };
    DbHandler.prototype.querySubplebbitActiveUserCount = function (timeframe, trx) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var from, to, commentsAuthors, voteAuthors, activeUserAccounts;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    from = (0, util_1.timestamp)() - util_1.TIMEFRAMES_TO_SECONDS[timeframe];
                                    if (from === Number.NEGATIVE_INFINITY)
                                        from = 0;
                                    to = (0, util_1.timestamp)();
                                    return [4 /*yield*/, this.baseTransaction(trx)(TABLES.COMMENTS)
                                            .distinct("authorAddress")
                                            .whereBetween("timestamp", [from, to])];
                                case 1:
                                    commentsAuthors = _a.sent();
                                    return [4 /*yield*/, this.baseTransaction(trx)(TABLES.VOTES)
                                            .distinct("authorAddress")
                                            .whereBetween("timestamp", [from, to])];
                                case 2:
                                    voteAuthors = _a.sent();
                                    activeUserAccounts = __spreadArray(__spreadArray([], commentsAuthors, true), voteAuthors, true).map(function (author) { return author.authorAddress; });
                                    // @ts-ignore
                                    activeUserAccounts = __spreadArray([], new Set(activeUserAccounts), true);
                                    resolve(activeUserAccounts.length);
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    DbHandler.prototype.querySubplebbitPostCount = function (timeframe, trx) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var from, to;
                        return __generator(this, function (_a) {
                            from = (0, util_1.timestamp)() - util_1.TIMEFRAMES_TO_SECONDS[timeframe];
                            if (from === Number.NEGATIVE_INFINITY)
                                from = 0;
                            to = (0, util_1.timestamp)();
                            this.baseTransaction(trx)(TABLES.COMMENTS)
                                .count("cid")
                                .whereBetween("timestamp", [from, to])
                                .whereNotNull("title")
                                .then(function (postCount) { return resolve(postCount["0"]["count(`cid`)"]); })
                                .catch(reject);
                            return [2 /*return*/];
                        });
                    }); })];
            });
        });
    };
    DbHandler.prototype.querySubplebbitMetrics = function (trx) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var metrics, _i, _a, metricType, _b, _c, timeframe, propertyName, _d, _e, _f, _g;
                        return __generator(this, function (_h) {
                            switch (_h.label) {
                                case 0:
                                    metrics = {};
                                    _i = 0, _a = ["ActiveUserCount", "PostCount"];
                                    _h.label = 1;
                                case 1:
                                    if (!(_i < _a.length)) return [3 /*break*/, 8];
                                    metricType = _a[_i];
                                    _b = 0, _c = Object.keys(util_1.TIMEFRAMES_TO_SECONDS);
                                    _h.label = 2;
                                case 2:
                                    if (!(_b < _c.length)) return [3 /*break*/, 7];
                                    timeframe = _c[_b];
                                    propertyName = "".concat(timeframe.toLowerCase()).concat(metricType);
                                    if (!(metricType === "ActiveUserCount")) return [3 /*break*/, 4];
                                    _d = metrics;
                                    _e = propertyName;
                                    return [4 /*yield*/, this.querySubplebbitActiveUserCount(timeframe, trx)];
                                case 3:
                                    _d[_e] = _h.sent();
                                    return [3 /*break*/, 6];
                                case 4:
                                    if (!(metricType === "PostCount")) return [3 /*break*/, 6];
                                    _f = metrics;
                                    _g = propertyName;
                                    return [4 /*yield*/, this.querySubplebbitPostCount(timeframe, trx)];
                                case 5:
                                    _f[_g] = _h.sent();
                                    _h.label = 6;
                                case 6:
                                    _b++;
                                    return [3 /*break*/, 2];
                                case 7:
                                    _i++;
                                    return [3 /*break*/, 1];
                                case 8:
                                    resolve(metrics);
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    DbHandler.prototype.queryComment = function (cid, trx) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_a) {
                            this.baseCommentQuery(trx)
                                .where({ cid: cid })
                                .first()
                                .then(function (res) { return __awaiter(_this, void 0, void 0, function () {
                                var _a;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            _a = resolve;
                                            return [4 /*yield*/, this.createCommentsFromRows.bind(this)(res, trx)];
                                        case 1:
                                            _a.apply(void 0, [(_b.sent())[0]]);
                                            return [2 /*return*/];
                                    }
                                });
                            }); })
                                .catch(reject);
                            return [2 /*return*/];
                        });
                    }); })];
            });
        });
    };
    DbHandler.prototype.queryLatestPost = function (trx) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_a) {
                            this.baseCommentQuery(trx)
                                .whereNotNull("title")
                                .orderBy("id", "desc")
                                .first()
                                .then(function (res) { return __awaiter(_this, void 0, void 0, function () {
                                var _a;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            _a = resolve;
                                            return [4 /*yield*/, this.createCommentsFromRows.bind(this)(res, trx)];
                                        case 1:
                                            _a.apply(void 0, [(_b.sent())[0]]);
                                            return [2 /*return*/];
                                    }
                                });
                            }); })
                                .catch(reject);
                            return [2 /*return*/];
                        });
                    }); })];
            });
        });
    };
    DbHandler.prototype.insertSigner = function (signer, trx) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            this.baseTransaction(trx)(TABLES.SIGNERS)
                                .insert(signer)
                                .then(resolve)
                                .catch(function (err) {
                                debug(err);
                                reject(err);
                            });
                            return [2 /*return*/];
                        });
                    }); })];
            });
        });
    };
    DbHandler.prototype.querySubplebbitSigner = function (trx) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            this.baseTransaction(trx)(TABLES.SIGNERS).where({ usage: exports.SIGNER_USAGES.SUBPLEBBIT }).first().then(resolve).catch(reject);
                            return [2 /*return*/];
                        });
                    }); })];
            });
        });
    };
    DbHandler.prototype.querySigner = function (ipnsKeyName, trx) {
        return __awaiter(this, void 0, void 0, function () {
            var e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.baseTransaction(trx)(TABLES.SIGNERS).where({ ipnsKeyName: ipnsKeyName }).first()];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        e_1 = _a.sent();
                        debug("Failed to query signer due to error = ".concat(e_1));
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
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
                    dbPath = path_1.default.join(subplebbit.plebbit.dataPath, subplebbit.address);
                    debug("User has not provided a DB config. Will initialize DB in ".concat(dbPath));
                    subplebbit._dbConfig = {
                        client: "better-sqlite3",
                        connection: {
                            filename: dbPath
                        },
                        useNullAsDefault: true
                    };
                }
                else
                    debug("User provided a DB config of ".concat(JSON.stringify(subplebbit._dbConfig)));
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
exports.default = DbHandler;
