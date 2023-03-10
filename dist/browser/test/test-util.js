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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMockSub = exports.waitTillCommentIsInParentPages = exports.findCommentInPage = exports.publishWithExpectedResult = exports.publishVote = exports.publishRandomPost = exports.publishRandomReply = exports.mockRemotePlebbit = exports.mockPlebbit = exports.startSubplebbits = exports.loadAllPages = exports.generateMockVote = exports.generateMockComment = exports.generateMockPost = void 0;
var util_1 = require("../util");
var comment_1 = require("../comment");
var index_1 = __importDefault(require("../index"));
var subplebbit_1 = require("../subplebbit");
var is_ipfs_1 = __importDefault(require("is-ipfs"));
var async_wait_until_1 = __importDefault(require("async-wait-until"));
var assert_1 = __importDefault(require("assert"));
var safe_stable_stringify_1 = require("safe-stable-stringify");
var lodash_1 = __importDefault(require("lodash"));
var uuid_1 = require("uuid");
function generateRandomTimestamp(parentTimestamp) {
    var _a = [typeof parentTimestamp === "number" && parentTimestamp > 2 ? parentTimestamp : 2, (0, util_1.timestamp)()], lowerLimit = _a[0], upperLimit = _a[1];
    var randomTimestamp = -1;
    while (randomTimestamp === -1) {
        var randomTimeframeIndex = (Object.keys(util_1.TIMEFRAMES_TO_SECONDS).length * Math.random()) << 0;
        var tempTimestamp = lowerLimit + Object.values(util_1.TIMEFRAMES_TO_SECONDS)[randomTimeframeIndex];
        if (tempTimestamp >= lowerLimit && tempTimestamp <= upperLimit)
            randomTimestamp = tempTimestamp;
    }
    return randomTimestamp;
}
function generateMockPost(subplebbitAddress, plebbit, randomTimestamp, postProps) {
    if (randomTimestamp === void 0) { randomTimestamp = false; }
    if (postProps === void 0) { postProps = {}; }
    return __awaiter(this, void 0, void 0, function () {
        var postTimestamp, postStartTestTime, signer, _a, post;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    postTimestamp = (randomTimestamp && generateRandomTimestamp()) || (0, util_1.timestamp)();
                    postStartTestTime = Date.now() / 1000 + Math.random();
                    _a = (postProps === null || postProps === void 0 ? void 0 : postProps.signer);
                    if (_a) return [3 /*break*/, 2];
                    return [4 /*yield*/, plebbit.createSigner()];
                case 1:
                    _a = (_b.sent());
                    _b.label = 2;
                case 2:
                    signer = _a;
                    return [4 /*yield*/, plebbit.createComment(__assign({ author: { displayName: "Mock Author - ".concat(postStartTestTime) }, title: "Mock Post - ".concat(postStartTestTime), content: "Mock content - ".concat(postStartTestTime), signer: signer, timestamp: postTimestamp, subplebbitAddress: subplebbitAddress }, postProps))];
                case 3:
                    post = _b.sent();
                    //@ts-ignore
                    post._updateIntervalMs = 200;
                    if (post.constructor.name !== "Post")
                        throw Error("createComment should return Post if title is provided");
                    post.once("challenge", function (challengeMsg) { return post.publishChallengeAnswers([]); });
                    return [2 /*return*/, post];
            }
        });
    });
}
exports.generateMockPost = generateMockPost;
// TODO rework this
function generateMockComment(parentPostOrComment, plebbit, randomTimestamp, commentProps) {
    if (randomTimestamp === void 0) { randomTimestamp = false; }
    if (commentProps === void 0) { commentProps = {}; }
    return __awaiter(this, void 0, void 0, function () {
        var commentTimestamp, commentTime, signer, _a, comment;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!["Comment", "Post"].includes(parentPostOrComment.constructor.name))
                        throw Error("Need to have parentComment defined to generate mock comment");
                    commentTimestamp = (randomTimestamp && generateRandomTimestamp(parentPostOrComment.timestamp)) || (0, util_1.timestamp)();
                    commentTime = Date.now() / 1000 + Math.random();
                    _a = (commentProps === null || commentProps === void 0 ? void 0 : commentProps.signer);
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
                    //@ts-ignore
                    comment._updateIntervalMs = 200;
                    comment.once("challenge", function (challengeMsg) { return comment.publishChallengeAnswers([]); });
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
                    if (typeof commentCid !== "string")
                        throw Error("generateMockVote: commentCid (".concat(commentCid, ") is not a valid CID"));
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
                        voteObj.publishChallengeAnswers([]);
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
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!is_ipfs_1.default.cid(pageCid))
                        throw Error("loadAllPages: pageCid (".concat(pageCid, ") is not a valid CID"));
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
                case 4: return [2 /*return*/, sortedComments];
            }
        });
    });
}
exports.loadAllPages = loadAllPages;
function _mockPlebbit(signers, dataPath) {
    return __awaiter(this, void 0, void 0, function () {
        var plebbit;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, index_1.default)({
                        ipfsHttpClientOptions: "http://localhost:15001/api/v0",
                        pubsubHttpClientOptions: "http://localhost:15002/api/v0",
                        dataPath: dataPath
                    })];
                case 1:
                    plebbit = _a.sent();
                    //@ts-ignore
                    plebbit.resolver.resolveAuthorAddressIfNeeded = function (authorAddress) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            if (authorAddress === "plebbit.eth")
                                return [2 /*return*/, signers[6].address];
                            else if (authorAddress === "testgibbreish.eth")
                                return [2 /*return*/, undefined];
                            return [2 /*return*/, authorAddress];
                        });
                    }); };
                    //@ts-ignore
                    plebbit.resolver.resolveSubplebbitAddressIfNeeded = function (subplebbitAddress) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            if (subplebbitAddress === "plebbit.eth")
                                return [2 /*return*/, signers[3].address];
                            else if (plebbit.resolver.isDomain(subplebbitAddress))
                                throw Error("".concat(subplebbitAddress, " has no subplebbit-address"));
                            return [2 /*return*/, subplebbitAddress];
                        });
                    }); };
                    return [2 /*return*/, plebbit];
            }
        });
    });
}
function _startMathCliSubplebbit(signers, syncInterval, dataPath) {
    return __awaiter(this, void 0, void 0, function () {
        var plebbit, signer, subplebbit;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, _mockPlebbit(signers, dataPath)];
                case 1:
                    plebbit = _a.sent();
                    return [4 /*yield*/, plebbit.createSigner(signers[1])];
                case 2:
                    signer = _a.sent();
                    return [4 /*yield*/, plebbit.createSubplebbit({ signer: signer })];
                case 3:
                    subplebbit = _a.sent();
                    subplebbit.setProvideCaptchaCallback(function (challengeRequestMessage) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            // Expected return is:
                            // Challenge[], reason for skipping captcha (if it's skipped by nullifying Challenge[])
                            return [2 /*return*/, [[{ challenge: "1+1=?", type: "text/plain" }], undefined]];
                        });
                    }); });
                    subplebbit.setValidateCaptchaAnswerCallback(function (challengeAnswerMessage) { return __awaiter(_this, void 0, void 0, function () {
                        var challengeSuccess, challengeErrors;
                        return __generator(this, function (_a) {
                            challengeSuccess = challengeAnswerMessage.challengeAnswers[0] === "2";
                            challengeErrors = challengeSuccess ? undefined : ["Result of math expression is incorrect"];
                            return [2 /*return*/, [challengeSuccess, challengeErrors]];
                        });
                    }); });
                    //@ts-ignore
                    subplebbit._syncIntervalMs = syncInterval;
                    return [4 /*yield*/, subplebbit.start()];
                case 4:
                    _a.sent();
                    return [2 /*return*/, subplebbit];
            }
        });
    });
}
function _startImageCaptchaSubplebbit(signers, syncInterval, dataPath) {
    return __awaiter(this, void 0, void 0, function () {
        var plebbit, signer, subplebbit;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, _mockPlebbit(signers, dataPath)];
                case 1:
                    plebbit = _a.sent();
                    return [4 /*yield*/, plebbit.createSigner(signers[2])];
                case 2:
                    signer = _a.sent();
                    return [4 /*yield*/, plebbit.createSubplebbit({ signer: signer })];
                case 3:
                    subplebbit = _a.sent();
                    // Image captcha are default
                    //@ts-ignore
                    subplebbit._syncIntervalMs = syncInterval;
                    return [4 /*yield*/, subplebbit.start()];
                case 4:
                    _a.sent();
                    subplebbit.setValidateCaptchaAnswerCallback(function (challengeAnswerMessage) { return __awaiter(_this, void 0, void 0, function () {
                        var challengeSuccess, challengeErrors;
                        return __generator(this, function (_a) {
                            challengeSuccess = challengeAnswerMessage.challengeAnswers[0] === "1234";
                            challengeErrors = challengeSuccess ? undefined : ["User answered image captcha incorrectly"];
                            return [2 /*return*/, [challengeSuccess, challengeErrors]];
                        });
                    }); });
                    return [2 /*return*/, subplebbit];
            }
        });
    });
}
function _startEnsSubplebbit(signers, syncInterval, dataPath) {
    return __awaiter(this, void 0, void 0, function () {
        var plebbit, signer, subplebbit;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, _mockPlebbit(signers, dataPath)];
                case 1:
                    plebbit = _a.sent();
                    return [4 /*yield*/, plebbit.createSigner(signers[3])];
                case 2:
                    signer = _a.sent();
                    return [4 /*yield*/, plebbit.createSubplebbit({ signer: signer })];
                case 3:
                    subplebbit = _a.sent();
                    subplebbit.setProvideCaptchaCallback(function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                        return [2 /*return*/, [[], "Challenge skipped"]];
                    }); }); });
                    //@ts-ignore
                    subplebbit._syncIntervalMs = syncInterval;
                    return [4 /*yield*/, subplebbit.start()];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, subplebbit.edit({ address: "plebbit.eth" })];
                case 5:
                    _a.sent();
                    assert_1.default.equal(subplebbit.address, "plebbit.eth");
                    return [2 /*return*/];
            }
        });
    });
}
function _publishComments(parentComments, subplebbit, numOfCommentsToPublish, signers) {
    return __awaiter(this, void 0, void 0, function () {
        var comments;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    comments = [];
                    if (!(parentComments.length === 0)) return [3 /*break*/, 2];
                    return [4 /*yield*/, Promise.all(new Array(numOfCommentsToPublish).fill(null).map(function () { return __awaiter(_this, void 0, void 0, function () {
                            var _a, _b;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        _b = (_a = comments).push;
                                        return [4 /*yield*/, publishRandomPost(subplebbit.address, subplebbit.plebbit, {}, false)];
                                    case 1:
                                        _b.apply(_a, [_c.sent()]);
                                        return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, Promise.all(parentComments.map(function (parentComment) { return __awaiter(_this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, Promise.all(new Array(numOfCommentsToPublish).fill(null).map(function () { return __awaiter(_this, void 0, void 0, function () {
                                        var _a, _b;
                                        return __generator(this, function (_c) {
                                            switch (_c.label) {
                                                case 0:
                                                    (0, assert_1.default)(typeof (parentComment === null || parentComment === void 0 ? void 0 : parentComment.cid) === "string");
                                                    _b = (_a = comments).push;
                                                    return [4 /*yield*/, publishRandomReply(parentComment, subplebbit.plebbit, {}, false)];
                                                case 1:
                                                    _b.apply(_a, [_c.sent()]);
                                                    return [2 /*return*/];
                                            }
                                        });
                                    }); }))];
                                case 1: return [2 /*return*/, _a.sent()];
                            }
                        });
                    }); }))];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    assert_1.default.equal(comments.length, numOfCommentsToPublish);
                    return [2 /*return*/, comments];
            }
        });
    });
}
function _publishVotes(comments, subplebbit, votesPerCommentToPublish, signers) {
    return __awaiter(this, void 0, void 0, function () {
        var votes, _loop_1, _i, comments_1, comment;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    votes = [];
                    _loop_1 = function (comment) {
                        var votesPromises, _b, _c, _d;
                        return __generator(this, function (_e) {
                            switch (_e.label) {
                                case 0:
                                    votesPromises = new Array(votesPerCommentToPublish)
                                        .fill(null)
                                        .map(function () { return publishVote(comment.cid, Math.random() > 0.5 ? 1 : -1, subplebbit.plebbit, {}); });
                                    _c = (_b = votes.push).apply;
                                    _d = [votes];
                                    return [4 /*yield*/, Promise.all(votesPromises)];
                                case 1:
                                    _c.apply(_b, _d.concat([(_e.sent())]));
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, comments_1 = comments;
                    _a.label = 1;
                case 1:
                    if (!(_i < comments_1.length)) return [3 /*break*/, 4];
                    comment = comments_1[_i];
                    return [5 /*yield**/, _loop_1(comment)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4:
                    assert_1.default.equal(votes.length, votesPerCommentToPublish * comments.length);
                    console.log("".concat(votes.length, " votes for ").concat(comments.length, " ").concat(comments[0].depth === 0 ? "posts" : "replies", " have been published"));
                    return [2 /*return*/, votes];
            }
        });
    });
}
function _populateSubplebbit(subplebbit, props) {
    return __awaiter(this, void 0, void 0, function () {
        var posts, replies;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, subplebbit.edit({
                        roles: (_a = {},
                            _a[props.signers[1].address] = { role: "owner" },
                            _a[props.signers[2].address] = { role: "admin" },
                            _a[props.signers[3].address] = { role: "moderator" },
                            _a)
                    })];
                case 1:
                    _b.sent();
                    return [4 /*yield*/, new Promise(function (resolve) { return subplebbit.once("update", resolve); })];
                case 2:
                    _b.sent();
                    return [4 /*yield*/, _publishComments([], subplebbit, props.numOfCommentsToPublish, props.signers)];
                case 3:
                    posts = _b.sent();
                    console.log("Have successfully published ".concat(posts.length, " posts"));
                    return [4 /*yield*/, Promise.all([
                            _publishComments([posts[0]], subplebbit, props.numOfCommentsToPublish, props.signers),
                            _publishVotes(posts, subplebbit, props.votesPerCommentToPublish, props.signers)
                        ])];
                case 4:
                    replies = (_b.sent())[0];
                    console.log("Have sucessfully published ".concat(replies.length, " replies"));
                    return [4 /*yield*/, _publishVotes(replies, subplebbit, props.votesPerCommentToPublish, props.signers)];
                case 5:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function startSubplebbits(props) {
    return __awaiter(this, void 0, void 0, function () {
        var plebbit, signer, subplebbit;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, _mockPlebbit(props.signers, props.dataPath)];
                case 1:
                    plebbit = _a.sent();
                    return [4 /*yield*/, plebbit.createSigner(props.signers[0])];
                case 2:
                    signer = _a.sent();
                    return [4 /*yield*/, plebbit.createSubplebbit({ signer: signer })];
                case 3:
                    subplebbit = _a.sent();
                    subplebbit.setProvideCaptchaCallback(function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                        return [2 /*return*/, [[], "Challenge skipped"]];
                    }); }); });
                    //@ts-ignore
                    subplebbit._syncIntervalMs = props.syncInterval;
                    return [4 /*yield*/, subplebbit.start()];
                case 4:
                    _a.sent();
                    console.time("populate");
                    return [4 /*yield*/, Promise.all([
                            _startImageCaptchaSubplebbit(props.signers, props.syncInterval, props.dataPath),
                            _startMathCliSubplebbit(props.signers, props.syncInterval, props.dataPath),
                            _startEnsSubplebbit(props.signers, props.syncInterval, props.dataPath),
                            _populateSubplebbit(subplebbit, props)
                        ])];
                case 5:
                    _a.sent();
                    console.timeEnd("populate");
                    console.log("All subplebbits and ipfs nodes have been started. You are ready to run the tests");
                    return [2 /*return*/];
            }
        });
    });
}
exports.startSubplebbits = startSubplebbits;
function mockPlebbit(dataPath) {
    return __awaiter(this, void 0, void 0, function () {
        var plebbit;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, index_1.default)({
                        ipfsHttpClientOptions: "http://localhost:15001/api/v0",
                        pubsubHttpClientOptions: "http://localhost:15002/api/v0",
                        dataPath: dataPath
                    })];
                case 1:
                    plebbit = _a.sent();
                    plebbit.resolver.resolveAuthorAddressIfNeeded = function (authorAddress) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            if (authorAddress === "plebbit.eth")
                                return [2 /*return*/, "12D3KooWJJcSwMHrFvsFL7YCNDLD95kBczEfkHpPNdxcjZwR2X2Y"]; // signers[6].address
                            else if (authorAddress === "testgibbreish.eth")
                                throw new Error("Domain (".concat(authorAddress, ") has no plebbit-author-address"));
                            return [2 /*return*/, authorAddress];
                        });
                    }); };
                    plebbit.resolver.resolveSubplebbitAddressIfNeeded = function (subAddress) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            if (subAddress === "plebbit.eth")
                                return [2 /*return*/, "12D3KooWNMYPSuNadceoKsJ6oUQcxGcfiAsHNpVTt1RQ1zSrKKpo"]; // signers[3].address
                            else if (subAddress === "testgibbreish.eth")
                                throw new Error("Domain (".concat(subAddress, ") has no subplebbit-address"));
                            return [2 /*return*/, subAddress];
                        });
                    }); };
                    return [2 /*return*/, plebbit];
            }
        });
    });
}
exports.mockPlebbit = mockPlebbit;
function mockRemotePlebbit() {
    return __awaiter(this, void 0, void 0, function () {
        var plebbit;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, mockPlebbit()];
                case 1:
                    plebbit = _a.sent();
                    plebbit._canRunSub = function () { return false; };
                    return [2 /*return*/, plebbit];
            }
        });
    });
}
exports.mockRemotePlebbit = mockRemotePlebbit;
function publishRandomReply(parentComment, plebbit, commentProps, verifyCommentPropsInParentPages) {
    if (verifyCommentPropsInParentPages === void 0) { verifyCommentPropsInParentPages = true; }
    return __awaiter(this, void 0, void 0, function () {
        var reply;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, generateMockComment(parentComment, plebbit, false, __assign({ content: "Content ".concat((0, uuid_1.v4)()) }, commentProps))];
                case 1:
                    reply = _a.sent();
                    return [4 /*yield*/, publishWithExpectedResult(reply, true)];
                case 2:
                    _a.sent();
                    if (!verifyCommentPropsInParentPages) return [3 /*break*/, 4];
                    return [4 /*yield*/, waitTillCommentIsInParentPages(reply, plebbit)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: return [2 /*return*/, reply];
            }
        });
    });
}
exports.publishRandomReply = publishRandomReply;
function publishRandomPost(subplebbitAddress, plebbit, postProps, verifyCommentPropsInParentPages) {
    if (verifyCommentPropsInParentPages === void 0) { verifyCommentPropsInParentPages = true; }
    return __awaiter(this, void 0, void 0, function () {
        var post;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, generateMockPost(subplebbitAddress, plebbit, false, __assign({ content: "Random post Content ".concat((0, uuid_1.v4)(), " ").concat(lodash_1.default.uniqueId()), title: "Random post Title ".concat((0, uuid_1.v4)(), " ").concat(lodash_1.default.uniqueId()) }, postProps))];
                case 1:
                    post = _a.sent();
                    return [4 /*yield*/, publishWithExpectedResult(post, true)];
                case 2:
                    _a.sent();
                    if (!verifyCommentPropsInParentPages) return [3 /*break*/, 4];
                    return [4 /*yield*/, waitTillCommentIsInParentPages(post, plebbit)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: return [2 /*return*/, post];
            }
        });
    });
}
exports.publishRandomPost = publishRandomPost;
function publishVote(commentCid, vote, plebbit, voteProps) {
    return __awaiter(this, void 0, void 0, function () {
        var comment, voteObj, _a, _b, _c;
        var _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0: return [4 /*yield*/, plebbit.getComment(commentCid)];
                case 1:
                    comment = _e.sent();
                    _b = (_a = plebbit).createVote;
                    _d = { commentCid: commentCid, vote: vote, subplebbitAddress: comment.subplebbitAddress };
                    _c = (voteProps === null || voteProps === void 0 ? void 0 : voteProps.signer);
                    if (_c) return [3 /*break*/, 3];
                    return [4 /*yield*/, plebbit.createSigner()];
                case 2:
                    _c = (_e.sent());
                    _e.label = 3;
                case 3: return [4 /*yield*/, _b.apply(_a, [__assign.apply(void 0, [(_d.signer = _c, _d), voteProps])])];
                case 4:
                    voteObj = _e.sent();
                    return [4 /*yield*/, publishWithExpectedResult(voteObj, true)];
                case 5:
                    _e.sent();
                    return [2 /*return*/, voteObj];
            }
        });
    });
}
exports.publishVote = publishVote;
function publishWithExpectedResult(publication, expectedChallengeSuccess, expectedReason) {
    return __awaiter(this, void 0, void 0, function () {
        var receivedResponse;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    receivedResponse = false;
                    return [4 /*yield*/, publication.publish()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, new Promise(function (resolve, reject) {
                            setTimeout(function () { return !receivedResponse && reject("Publication did not receive any response"); }, 10000); // throw after 30 seconds if we haven't received a response
                            publication.once("challengeverification", function (verificationMsg) {
                                receivedResponse = true;
                                if (verificationMsg.challengeSuccess !== expectedChallengeSuccess) {
                                    var msg = "Expected challengeSuccess to be (".concat(expectedChallengeSuccess, ") and got (").concat(verificationMsg.challengeSuccess, "). Reason (").concat(verificationMsg.reason, ")");
                                    console.error(msg);
                                    reject(msg);
                                }
                                else if (expectedReason && expectedReason !== verificationMsg.reason) {
                                    var msg = "Expected reason to be (".concat(expectedReason, ") and got (").concat(verificationMsg.reason, ")");
                                    console.error(msg);
                                    reject(msg);
                                }
                                else
                                    resolve(1);
                            });
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.publishWithExpectedResult = publishWithExpectedResult;
function findCommentInPage(commentCid, pageCid, pages) {
    return __awaiter(this, void 0, void 0, function () {
        var commentPages;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, loadAllPages(pageCid, pages)];
                case 1:
                    commentPages = _a.sent();
                    return [2 /*return*/, commentPages.find(function (c) { return c.cid === commentCid; })];
            }
        });
    });
}
exports.findCommentInPage = findCommentInPage;
function waitTillCommentIsInParentPages(comment, plebbit, propsToCheckFor, checkInAllPages) {
    if (propsToCheckFor === void 0) { propsToCheckFor = {}; }
    if (checkInAllPages === void 0) { checkInAllPages = false; }
    return __awaiter(this, void 0, void 0, function () {
        var parent, _a, pagesInstance, commentInPage, pageCids, _i, _b, pageCid, commentInPage_1, _c, _d, _e, key, value, _f, _g, _h, key, value;
        var _this = this;
        return __generator(this, function (_j) {
            switch (_j.label) {
                case 0:
                    if (!(comment.depth === 0)) return [3 /*break*/, 2];
                    return [4 /*yield*/, plebbit.getSubplebbit(comment.subplebbitAddress)];
                case 1:
                    _a = _j.sent();
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, plebbit.getComment(comment.parentCid)];
                case 3:
                    _a = _j.sent();
                    _j.label = 4;
                case 4:
                    parent = _a;
                    //@ts-ignore
                    parent._updateIntervalMs = 200;
                    return [4 /*yield*/, parent.update()];
                case 5:
                    _j.sent();
                    pagesInstance = function () { return (parent instanceof subplebbit_1.Subplebbit ? parent.posts : parent.replies); };
                    return [4 /*yield*/, (0, async_wait_until_1.default)(function () { return __awaiter(_this, void 0, void 0, function () {
                            var repliesPageCid;
                            var _a, _b;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        repliesPageCid = (_b = (_a = pagesInstance()) === null || _a === void 0 ? void 0 : _a.pageCids) === null || _b === void 0 ? void 0 : _b.new;
                                        if (!repliesPageCid) return [3 /*break*/, 2];
                                        return [4 /*yield*/, findCommentInPage(comment.cid, repliesPageCid, pagesInstance())];
                                    case 1:
                                        commentInPage = _c.sent();
                                        _c.label = 2;
                                    case 2: return [2 /*return*/, Boolean(commentInPage)];
                                }
                            });
                        }); }, {
                            timeout: 200000
                        })];
                case 6:
                    _j.sent();
                    return [4 /*yield*/, parent.stop()];
                case 7:
                    _j.sent();
                    pageCids = parent instanceof comment_1.Comment ? parent.replies.pageCids : parent.posts.pageCids;
                    (0, assert_1.default)(lodash_1.default.isPlainObject(pageCids));
                    if (!checkInAllPages) return [3 /*break*/, 12];
                    _i = 0, _b = Object.values(pageCids);
                    _j.label = 8;
                case 8:
                    if (!(_i < _b.length)) return [3 /*break*/, 11];
                    pageCid = _b[_i];
                    return [4 /*yield*/, findCommentInPage(comment.cid, pageCid, pagesInstance())];
                case 9:
                    commentInPage_1 = _j.sent();
                    for (_c = 0, _d = Object.entries(propsToCheckFor); _c < _d.length; _c++) {
                        _e = _d[_c], key = _e[0], value = _e[1];
                        if ((0, safe_stable_stringify_1.stringify)(commentInPage_1[key]) !== (0, safe_stable_stringify_1.stringify)(value))
                            throw Error("commentInPage[".concat(key, "] is incorrect"));
                    }
                    _j.label = 10;
                case 10:
                    _i++;
                    return [3 /*break*/, 8];
                case 11: return [3 /*break*/, 13];
                case 12:
                    for (_f = 0, _g = Object.entries(propsToCheckFor); _f < _g.length; _f++) {
                        _h = _g[_f], key = _h[0], value = _h[1];
                        if ((0, safe_stable_stringify_1.stringify)(commentInPage[key]) !== (0, safe_stable_stringify_1.stringify)(value))
                            throw Error("commentInPage[".concat(key, "] is incorrect"));
                    }
                    _j.label = 13;
                case 13: return [2 /*return*/];
            }
        });
    });
}
exports.waitTillCommentIsInParentPages = waitTillCommentIsInParentPages;
function createMockSub(props, plebbit, syncInterval) {
    if (syncInterval === void 0) { syncInterval = 300; }
    return __awaiter(this, void 0, void 0, function () {
        var sub;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, plebbit.createSubplebbit(props)];
                case 1:
                    sub = _a.sent();
                    //@ts-ignore
                    sub._syncIntervalMs = sub._updateIntervalMs = syncInterval;
                    sub.setProvideCaptchaCallback(function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                        return [2 /*return*/, [[], "Challenge skipped"]];
                    }); }); });
                    return [2 /*return*/, sub];
            }
        });
    });
}
exports.createMockSub = createMockSub;
