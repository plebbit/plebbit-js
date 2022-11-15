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
exports.mockPlebbit = exports.startSubplebbits = exports.getAllCommentsUnderSubplebbit = exports.loadAllPages = exports.generateMockVote = exports.generateMockComment = exports.generateMockPost = void 0;
var util_1 = require("../util");
var index_1 = __importDefault(require("../index"));
var is_ipfs_1 = __importDefault(require("is-ipfs"));
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
                    if (post.constructor.name !== "Post")
                        throw Error("createComment should return Post if title is provided");
                    post.once("challenge", function (challengeMsg) {
                        post.publishChallengeAnswers([]);
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
                    if (!["Comment", "Post"].includes(parentPostOrComment.constructor.name))
                        throw Error("Need to have parentComment defined to generate mock comment");
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
                        comment.publishChallengeAnswers([]);
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
        var _this = this;
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
function _mockPlebbit(signers, dataPath) {
    return __awaiter(this, void 0, void 0, function () {
        var plebbit;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, index_1.default)({
                        ipfsHttpClientOptions: "http://localhost:5001/api/v0",
                        pubsubHttpClientOptions: "http://localhost:5002/api/v0",
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
function _startMathCliSubplebbit(signers, database, syncInterval, dataPath) {
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
                    return [4 /*yield*/, plebbit.createSubplebbit({ signer: signer, database: database })];
                case 3:
                    subplebbit = _a.sent();
                    subplebbit.setProvideCaptchaCallback(function (challengeRequestMessage) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            // Expected return is:
                            // Challenge[], reason for skipping captcha (if it's skipped by nullifying Challenge[])
                            return [2 /*return*/, [[{ challenge: "1+1=?", type: "text" }], undefined]];
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
function _startImageCaptchaSubplebbit(signers, database, syncInterval, dataPath) {
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
                    return [4 /*yield*/, plebbit.createSubplebbit({ signer: signer, database: database })];
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
function _startEnsSubplebbit(signers, database, syncInterval, dataPath) {
    return __awaiter(this, void 0, void 0, function () {
        var plebbit, signer, subplebbit;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, _mockPlebbit(signers, dataPath)];
                case 1:
                    plebbit = _a.sent();
                    return [4 /*yield*/, plebbit.createSigner(signers[3])];
                case 2:
                    signer = _a.sent();
                    return [4 /*yield*/, plebbit.createSubplebbit({ signer: signer, database: database })];
                case 3:
                    subplebbit = _a.sent();
                    //@ts-ignore
                    subplebbit._syncIntervalMs = syncInterval;
                    return [4 /*yield*/, subplebbit.start()];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, subplebbit.edit({ address: "plebbit.eth" })];
                case 5:
                    _a.sent();
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
                            var post, _a, _b;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        _b = (_a = subplebbit)._addPublicationToDb;
                                        return [4 /*yield*/, generateMockPost(subplebbit.address, subplebbit.plebbit, signers[0], true)];
                                    case 1: return [4 /*yield*/, _b.apply(_a, [_c.sent()])];
                                    case 2:
                                        post = _c.sent();
                                        if (post)
                                            comments.push(post); // There are cases where posts fail to get published
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
                                        var comment, _a, _b;
                                        return __generator(this, function (_c) {
                                            switch (_c.label) {
                                                case 0:
                                                    _b = (_a = subplebbit)._addPublicationToDb;
                                                    return [4 /*yield*/, generateMockComment(parentComment, subplebbit.plebbit, signers[0], true)];
                                                case 1: return [4 /*yield*/, _b.apply(_a, [_c.sent()])];
                                                case 2:
                                                    comment = _c.sent();
                                                    if (comment)
                                                        comments.push(comment);
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
                case 4: return [2 /*return*/, comments];
            }
        });
    });
}
function _publishVotes(comments, subplebbit, votesPerCommentToPublish, signers) {
    return __awaiter(this, void 0, void 0, function () {
        var votes;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    votes = [];
                    return [4 /*yield*/, Promise.all(comments.map(function (comment) { return __awaiter(_this, void 0, void 0, function () {
                            var _this = this;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, Promise.all(new Array(votesPerCommentToPublish).fill(null).map(function (_, i) { return __awaiter(_this, void 0, void 0, function () {
                                            var vote;
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0: return [4 /*yield*/, generateMockVote(comment, Math.random() > 0.5 ? 1 : -1, subplebbit.plebbit, signers[i % signers.length])];
                                                    case 1:
                                                        vote = _a.sent();
                                                        return [4 /*yield*/, subplebbit._addPublicationToDb(vote)];
                                                    case 2:
                                                        vote = (_a.sent());
                                                        if (vote)
                                                            votes.push(vote);
                                                        return [2 /*return*/];
                                                }
                                            });
                                        }); }))];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            });
                        }); }))];
                case 1:
                    _a.sent();
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
                    return [4 /*yield*/, _publishComments([], subplebbit, props.numOfCommentsToPublish, props.signers)];
                case 2:
                    posts = _b.sent();
                    console.log("Have successfully published ".concat(posts.length, " posts"));
                    return [4 /*yield*/, Promise.all([
                            _publishComments([posts[0]], subplebbit, props.numOfCommentsToPublish, props.signers),
                            _publishVotes(posts, subplebbit, props.votesPerCommentToPublish, props.signers)
                        ])];
                case 3:
                    replies = (_b.sent())[0];
                    console.log("Have sucessfully published ".concat(replies.length, " replies"));
                    return [4 /*yield*/, _publishVotes(replies, subplebbit, props.votesPerCommentToPublish, props.signers)];
                case 4:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function startSubplebbits(props) {
    return __awaiter(this, void 0, void 0, function () {
        var plebbit, signer, subplebbit, _a, imageSubplebbit, mathSubplebbit;
        var _this = this;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, _mockPlebbit(props.signers, props.dataPath)];
                case 1:
                    plebbit = _b.sent();
                    return [4 /*yield*/, plebbit.createSigner(props.signers[0])];
                case 2:
                    signer = _b.sent();
                    return [4 /*yield*/, plebbit.createSubplebbit({ signer: signer, database: props.database })];
                case 3:
                    subplebbit = _b.sent();
                    subplebbit.setProvideCaptchaCallback(function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                        return [2 /*return*/, [[], "Challenge skipped"]];
                    }); }); });
                    //@ts-ignore
                    subplebbit._syncIntervalMs = props.syncInterval;
                    return [4 /*yield*/, subplebbit.start()];
                case 4:
                    _b.sent();
                    console.time("populate");
                    return [4 /*yield*/, Promise.all([
                            _startImageCaptchaSubplebbit(props.signers, props.database, props.syncInterval, props.dataPath),
                            _startMathCliSubplebbit(props.signers, props.database, props.syncInterval, props.dataPath),
                            _startEnsSubplebbit(props.signers, props.database, props.syncInterval, props.dataPath),
                            _populateSubplebbit(subplebbit, props)
                        ])];
                case 5:
                    _a = _b.sent(), imageSubplebbit = _a[0], mathSubplebbit = _a[1];
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
                        ipfsHttpClientOptions: "http://localhost:5001/api/v0",
                        pubsubHttpClientOptions: "http://localhost:5002/api/v0",
                        dataPath: dataPath
                    })];
                case 1:
                    plebbit = _a.sent();
                    plebbit.resolver.resolveAuthorAddressIfNeeded = function (authorAddress) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            if (authorAddress === "plebbit.eth")
                                return [2 /*return*/, "QmayyhaKccEKfLS8jHbvPAUHP6fuHMSV7rpm97bFz1W44h"]; // signers[6].address
                            else if (authorAddress === "testgibbreish.eth")
                                throw new Error("Domain (".concat(authorAddress, ") has no plebbit-author-address"));
                            return [2 /*return*/, authorAddress];
                        });
                    }); };
                    return [2 /*return*/, plebbit];
            }
        });
    });
}
exports.mockPlebbit = mockPlebbit;
