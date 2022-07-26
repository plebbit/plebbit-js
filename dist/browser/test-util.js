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
exports.getAllCommentsUnderSubplebbit = exports.loadAllPages = exports.generateMockVote = exports.generateMockComment = exports.generateMockPost = void 0;
var util_1 = require("./util");
var assert_1 = __importDefault(require("assert"));
var debugs = (0, util_1.getDebugLevels)("test-util");
function generateRandomTimestamp(parentTimestamp) {
    var _a = [parentTimestamp || 0, (0, util_1.timestamp)()], lowerLimit = _a[0], upperLimit = _a[1];
    var randomTimestamp;
    while (!randomTimestamp) {
        var randomTimeframeIndex = (Object.keys(util_1.TIMEFRAMES_TO_SECONDS).length * Math.random()) << 0;
        var tempTimestamp = lowerLimit + Object.values(util_1.TIMEFRAMES_TO_SECONDS)[randomTimeframeIndex];
        if (tempTimestamp >= lowerLimit && tempTimestamp <= upperLimit)
            randomTimestamp = tempTimestamp;
    }
    debugs.TRACE("generateRandomTimestamp: randomTimestamp: ".concat(randomTimestamp));
    return randomTimestamp;
}
function generateMockPost(subplebbitAddress, plebbit, signer, randomTimestamp, postProps) {
    if (randomTimestamp === void 0) { randomTimestamp = false; }
    if (postProps === void 0) { postProps = {}; }
    return __awaiter(this, void 0, void 0, function () {
        var postTimestamp, postStartTestTime, _a, post;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    postTimestamp = (randomTimestamp && generateRandomTimestamp()) || (0, util_1.timestamp)();
                    postStartTestTime = Date.now() / 1000 + Math.random();
                    _a = signer;
                    if (_a) return [3 /*break*/, 2];
                    return [4 /*yield*/, plebbit.createSigner()];
                case 1:
                    _a = (_b.sent());
                    _b.label = 2;
                case 2:
                    signer = _a;
                    return [4 /*yield*/, plebbit.createComment(__assign({ author: { displayName: "Mock Author - ".concat(postStartTestTime) }, signer: signer, title: "Mock Post - ".concat(postStartTestTime), content: "Mock content - ".concat(postStartTestTime), timestamp: postTimestamp, subplebbitAddress: subplebbitAddress }, postProps))];
                case 3:
                    post = _b.sent();
                    assert_1.default.equal(post.constructor.name, "Post", "createComment should return Post if title is provided");
                    post.once("challenge", function (challengeMsg) {
                        post.publishChallengeAnswers(undefined);
                    });
                    return [2 /*return*/, post];
            }
        });
    });
}
exports.generateMockPost = generateMockPost;
function generateMockComment(parentPostOrComment, plebbit, signer, randomTimestamp, commentProps) {
    if (randomTimestamp === void 0) { randomTimestamp = false; }
    if (commentProps === void 0) { commentProps = {}; }
    return __awaiter(this, void 0, void 0, function () {
        var commentTimestamp, commentTime, _a, comment;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    (0, assert_1.default)(parentPostOrComment, "Need to have parentComment defined to generate mock comment");
                    commentTimestamp = (randomTimestamp && generateRandomTimestamp(parentPostOrComment.timestamp)) || (0, util_1.timestamp)();
                    commentTime = Date.now() / 1000 + Math.random();
                    _a = signer;
                    if (_a) return [3 /*break*/, 2];
                    return [4 /*yield*/, plebbit.createSigner()];
                case 1:
                    _a = (_b.sent());
                    _b.label = 2;
                case 2:
                    signer = _a;
                    return [4 /*yield*/, plebbit.createComment(__assign({ author: { displayName: "Mock Author - ".concat(commentTime) }, signer: signer, content: "Mock comment - ".concat(commentTime), parentCid: parentPostOrComment.cid, subplebbitAddress: parentPostOrComment.subplebbitAddress, timestamp: commentTimestamp }, commentProps))];
                case 3:
                    comment = _b.sent();
                    comment.once("challenge", function (challengeMsg) {
                        comment.publishChallengeAnswers(undefined);
                    });
                    return [2 /*return*/, comment];
            }
        });
    });
}
exports.generateMockComment = generateMockComment;
function generateMockVote(parentPostOrComment, vote, plebbit, signer) {
    return __awaiter(this, void 0, void 0, function () {
        var voteTime, commentCid, _a, voteObj;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    voteTime = Date.now() / 1000;
                    commentCid = parentPostOrComment.cid || parentPostOrComment.postCid;
                    (0, assert_1.default)(typeof commentCid === "string");
                    _a = signer;
                    if (_a) return [3 /*break*/, 2];
                    return [4 /*yield*/, plebbit.createSigner()];
                case 1:
                    _a = (_b.sent());
                    _b.label = 2;
                case 2:
                    signer = _a;
                    return [4 /*yield*/, plebbit.createVote({
                            author: { displayName: "Mock Author - ".concat(voteTime) },
                            signer: signer,
                            commentCid: commentCid,
                            vote: vote,
                            subplebbitAddress: parentPostOrComment.subplebbitAddress
                        })];
                case 3:
                    voteObj = _b.sent();
                    voteObj.once("challenge", function (challengeMsg) {
                        voteObj.publishChallengeAnswers(undefined);
                    });
                    return [2 /*return*/, voteObj];
            }
        });
    });
}
exports.generateMockVote = generateMockVote;
function loadAllPages(pageCid, pagesInstance) {
    return __awaiter(this, void 0, void 0, function () {
        var sortedCommentsPage, sortedComments;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!pageCid)
                        return [2 /*return*/, []];
                    (0, assert_1.default)(pagesInstance.getPage);
                    return [4 /*yield*/, pagesInstance.getPage(pageCid)];
                case 1:
                    sortedCommentsPage = _a.sent();
                    sortedComments = sortedCommentsPage.comments;
                    _a.label = 2;
                case 2:
                    if (!sortedCommentsPage.nextCid) return [3 /*break*/, 4];
                    return [4 /*yield*/, pagesInstance.getPage(sortedCommentsPage.nextCid)];
                case 3:
                    sortedCommentsPage = _a.sent();
                    sortedComments = sortedComments.concat(sortedCommentsPage.comments);
                    return [3 /*break*/, 2];
                case 4: return [4 /*yield*/, Promise.all(sortedComments.map(function (commentProps) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                        return [2 /*return*/, pagesInstance.subplebbit.plebbit.createComment(commentProps)];
                    }); }); }))];
                case 5:
                    sortedComments = _a.sent();
                    return [2 /*return*/, sortedComments];
            }
        });
    });
}
exports.loadAllPages = loadAllPages;
function getAllCommentsUnderSubplebbit(subplebbit) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function () {
        var getChildrenComments;
        var _this = this;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    getChildrenComments = function (comment) { return __awaiter(_this, void 0, void 0, function () {
                        var _a;
                        var _b, _c, _d, _e;
                        return __generator(this, function (_f) {
                            switch (_f.label) {
                                case 0: return [4 /*yield*/, subplebbit.plebbit.createComment(comment)];
                                case 1:
                                    _a = [[
                                            _f.sent()
                                        ]];
                                    return [4 /*yield*/, Promise.all(((_e = (_d = (_c = (_b = comment.replies) === null || _b === void 0 ? void 0 : _b.pages) === null || _c === void 0 ? void 0 : _c.topAll) === null || _d === void 0 ? void 0 : _d.comments) === null || _e === void 0 ? void 0 : _e.map(getChildrenComments)) || [])];
                                case 2: return [2 /*return*/, __spreadArray.apply(void 0, _a.concat([(_f.sent()).flat(), true]))];
                            }
                        });
                    }); };
                    return [4 /*yield*/, Promise.all(((_b = (_a = subplebbit.posts) === null || _a === void 0 ? void 0 : _a.pages.hot) === null || _b === void 0 ? void 0 : _b.comments.map(getChildrenComments)) || [])];
                case 1: return [2 /*return*/, (_c.sent()).flat()];
            }
        });
    });
}
exports.getAllCommentsUnderSubplebbit = getAllCommentsUnderSubplebbit;
