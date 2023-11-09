"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
exports.SubplebbitEdit = exports.CommentEdit = exports.Vote = exports.Comment = exports.Subplebbit = exports.Pages = exports.Plebbit = exports.debugPlebbitJsMock = exports.resetPlebbitJsMock = exports.simulateLoadingTime = void 0;
var events_1 = __importDefault(require("events"));
var loadingTime = 10;
var simulateLoadingTime = function () { return new Promise(function (r) { return setTimeout(r, loadingTime); }); };
exports.simulateLoadingTime = simulateLoadingTime;
// keep a list of created and edited owner subplebbits
// to reinitialize them with plebbit.createSubplebbit()
var createdOwnerSubplebbits = {};
var editedOwnerSubplebbits = {};
// reset the plebbit-js global state in between tests
var resetPlebbitJsMock = function () {
    createdOwnerSubplebbits = {};
    editedOwnerSubplebbits = {};
};
exports.resetPlebbitJsMock = resetPlebbitJsMock;
var debugPlebbitJsMock = function () {
    console.log({ createdOwnerSubplebbits: createdOwnerSubplebbits, editedOwnerSubplebbits: editedOwnerSubplebbits });
};
exports.debugPlebbitJsMock = debugPlebbitJsMock;
var Plebbit = /** @class */ (function (_super) {
    __extends(Plebbit, _super);
    function Plebbit() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Plebbit.prototype.resolveAuthorAddress = function (authorAddress) {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/];
        }); });
    };
    Plebbit.prototype.createSigner = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, {
                        privateKey: 'private key',
                        address: 'address',
                    }];
            });
        });
    };
    Plebbit.prototype.createSubplebbit = function (createSubplebbitOptions) {
        return __awaiter(this, void 0, void 0, function () {
            var prop, prop;
            return __generator(this, function (_a) {
                if (!createSubplebbitOptions) {
                    createSubplebbitOptions = {};
                }
                // no address provided so probably a user creating an owner subplebbit
                if (!createSubplebbitOptions.address && !createdOwnerSubplebbits[createSubplebbitOptions.address]) {
                    createSubplebbitOptions = __assign(__assign({}, createSubplebbitOptions), { address: 'created subplebbit address' });
                    // createdSubplebbitAddresses.push('created subplebbit address')
                    createdOwnerSubplebbits[createSubplebbitOptions.address] = __assign({}, createSubplebbitOptions);
                }
                // only address provided, so could be a previously created owner subplebbit
                // add props from previously created sub
                else if (createdOwnerSubplebbits[createSubplebbitOptions.address] && JSON.stringify(Object.keys(createSubplebbitOptions)) === '["address"]') {
                    for (prop in createdOwnerSubplebbits[createSubplebbitOptions.address]) {
                        if (createdOwnerSubplebbits[createSubplebbitOptions.address][prop]) {
                            createSubplebbitOptions[prop] = createdOwnerSubplebbits[createSubplebbitOptions.address][prop];
                        }
                    }
                }
                // add edited props if owner subplebbit was edited in the past
                if (editedOwnerSubplebbits[createSubplebbitOptions.address]) {
                    for (prop in editedOwnerSubplebbits[createSubplebbitOptions.address]) {
                        if (editedOwnerSubplebbits[createSubplebbitOptions.address][prop]) {
                            createSubplebbitOptions[prop] = editedOwnerSubplebbits[createSubplebbitOptions.address][prop];
                        }
                    }
                }
                return [2 /*return*/, new Subplebbit(createSubplebbitOptions)];
            });
        });
    };
    Plebbit.prototype.getSubplebbit = function (subplebbitAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var createSubplebbitOptions, subplebbit, hotPageCid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, exports.simulateLoadingTime)()];
                    case 1:
                        _a.sent();
                        createSubplebbitOptions = {
                            address: subplebbitAddress,
                        };
                        subplebbit = new Subplebbit(createSubplebbitOptions);
                        subplebbit.title = subplebbit.address + ' title';
                        hotPageCid = subplebbit.address + ' page cid hot';
                        subplebbit.posts.pages.hot = getCommentsPage(hotPageCid, subplebbit);
                        subplebbit.posts.pageCids = {
                            hot: hotPageCid,
                            topAll: subplebbit.address + ' page cid topAll',
                            new: subplebbit.address + ' page cid new',
                            active: subplebbit.address + ' page cid active',
                        };
                        return [2 /*return*/, subplebbit];
                }
            });
        });
    };
    Plebbit.prototype.listSubplebbits = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, __spreadArray(['list subplebbit address 1', 'list subplebbit address 2'], Object.keys(createdOwnerSubplebbits), true)];
            });
        });
    };
    Plebbit.prototype.createComment = function (createCommentOptions) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Comment(createCommentOptions)];
            });
        });
    };
    Plebbit.prototype.getComment = function (commentCid) {
        return __awaiter(this, void 0, void 0, function () {
            var createCommentOptions;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, exports.simulateLoadingTime)()];
                    case 1:
                        _a.sent();
                        createCommentOptions = __assign({ cid: commentCid, ipnsName: commentCid + ' ipns name', 
                            // useComment() requires timestamp or will use account comment instead of comment from store
                            timestamp: 1670000000 }, this.commentToGet(commentCid));
                        return [2 /*return*/, new Comment(createCommentOptions)];
                }
            });
        });
    };
    // mock this method to get a comment with different content, timestamp, address, etc
    Plebbit.prototype.commentToGet = function (commentCid) {
        return {
        // content: 'mock some content'
        // author: {address: 'mock some address'},
        // timestamp: 1234
        };
    };
    Plebbit.prototype.createVote = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Vote()];
            });
        });
    };
    Plebbit.prototype.createCommentEdit = function (createCommentEditOptions) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new CommentEdit(createCommentEditOptions)];
            });
        });
    };
    Plebbit.prototype.createSubplebbitEdit = function (createSubplebbitEditOptions) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new SubplebbitEdit(createSubplebbitEditOptions)];
            });
        });
    };
    Plebbit.prototype.fetchCid = function (cid) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (cid === null || cid === void 0 ? void 0 : cid.startsWith('statscid')) {
                    return [2 /*return*/, JSON.stringify({ hourActiveUserCount: 1 })];
                }
                throw Error("plebbit.fetchCid not implemented in plebbit-js mock for cid '".concat(cid, "'"));
            });
        });
    };
    Plebbit.prototype.pubsubSubscribe = function (subplebbitAddress) {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/];
        }); });
    };
    Plebbit.prototype.pubsubUnsubscribe = function (subplebbitAddress) {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/];
        }); });
    };
    return Plebbit;
}(events_1.default));
exports.Plebbit = Plebbit;
var Pages = /** @class */ (function () {
    function Pages(pagesOptions) {
        this.pageCids = {};
        this.pages = {};
        Object.defineProperty(this, 'subplebbit', { value: pagesOptions === null || pagesOptions === void 0 ? void 0 : pagesOptions.subplebbit, enumerable: false });
        Object.defineProperty(this, 'comment', { value: pagesOptions === null || pagesOptions === void 0 ? void 0 : pagesOptions.comment, enumerable: false });
    }
    Pages.prototype.getPage = function (pageCid) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // need to wait twice otherwise react renders too fast and fetches too many pages in advance
                    return [4 /*yield*/, (0, exports.simulateLoadingTime)()];
                    case 1:
                        // need to wait twice otherwise react renders too fast and fetches too many pages in advance
                        _a.sent();
                        return [2 /*return*/, getCommentsPage(pageCid, this.subplebbit)];
                }
            });
        });
    };
    Pages.prototype._fetchAndVerifyPage = function (pageCid) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.getPage(pageCid)];
            });
        });
    };
    return Pages;
}());
exports.Pages = Pages;
var Subplebbit = /** @class */ (function (_super) {
    __extends(Subplebbit, _super);
    function Subplebbit(createSubplebbitOptions) {
        var _this = this;
        var _a, _b, _c, _d;
        _this = _super.call(this) || this;
        _this.updateCalledTimes = 0;
        _this.updating = false;
        _this.firstUpdate = true;
        _this.address = createSubplebbitOptions === null || createSubplebbitOptions === void 0 ? void 0 : createSubplebbitOptions.address;
        _this.title = createSubplebbitOptions === null || createSubplebbitOptions === void 0 ? void 0 : createSubplebbitOptions.title;
        _this.description = createSubplebbitOptions === null || createSubplebbitOptions === void 0 ? void 0 : createSubplebbitOptions.description;
        _this.statsCid = 'statscid';
        _this.state = 'stopped';
        _this.updatingState = 'stopped';
        _this.posts = new Pages({ subplebbit: _this });
        // add subplebbit.posts from createSubplebbitOptions
        if ((_a = createSubplebbitOptions === null || createSubplebbitOptions === void 0 ? void 0 : createSubplebbitOptions.posts) === null || _a === void 0 ? void 0 : _a.pages) {
            _this.posts.pages = (_b = createSubplebbitOptions === null || createSubplebbitOptions === void 0 ? void 0 : createSubplebbitOptions.posts) === null || _b === void 0 ? void 0 : _b.pages;
        }
        if ((_c = createSubplebbitOptions === null || createSubplebbitOptions === void 0 ? void 0 : createSubplebbitOptions.posts) === null || _c === void 0 ? void 0 : _c.pageCids) {
            _this.posts.pageCids = (_d = createSubplebbitOptions === null || createSubplebbitOptions === void 0 ? void 0 : createSubplebbitOptions.posts) === null || _d === void 0 ? void 0 : _d.pageCids;
        }
        // only trigger a first update if argument is only ({address})
        if (!(createSubplebbitOptions === null || createSubplebbitOptions === void 0 ? void 0 : createSubplebbitOptions.address) || Object.keys(createSubplebbitOptions).length !== 1) {
            _this.firstUpdate = false;
        }
        return _this;
    }
    Subplebbit.prototype.toJSONInternalRpc = function () {
        return {
            title: this.title,
            description: this.description,
            address: this.address,
            statsCid: this.statsCid,
            roles: this.roles,
            posts: this.posts,
        };
    };
    Subplebbit.prototype.toJSONIpfs = function () {
        return this.toJSONInternalRpc();
    };
    Subplebbit.prototype.update = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                this.updateCalledTimes++;
                if (this.updateCalledTimes > 1) {
                    throw Error('with the current hooks, subplebbit.update() should be called maximum 1 times, this number might change if the hooks change and is only there to catch bugs, the real comment.update() can be called infinite times');
                }
                // is ipnsName is known, look for updates and emit updates immediately after creation
                if (!this.address) {
                    throw Error("can't update without subplebbit.address");
                }
                // don't update twice
                if (this.updating) {
                    return [2 /*return*/];
                }
                this.updating = true;
                this.state = 'updating';
                this.updatingState = 'fetching-ipns';
                this.emit('statechange', 'updating');
                this.emit('updatingstatechange', 'fetching-ipns');
                (0, exports.simulateLoadingTime)().then(function () {
                    _this.simulateUpdateEvent();
                });
                return [2 /*return*/];
            });
        });
    };
    Subplebbit.prototype.stop = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/];
        }); });
    };
    Subplebbit.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/];
        }); });
    };
    Subplebbit.prototype.delete = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.address) {
                    delete createdOwnerSubplebbits[this.address];
                    delete editedOwnerSubplebbits[this.address];
                }
                return [2 /*return*/];
            });
        });
    };
    Subplebbit.prototype.simulateUpdateEvent = function () {
        if (this.firstUpdate) {
            this.simulateFirstUpdateEvent();
            return;
        }
        this.description = this.address + ' description updated';
        this.updatedAt = Math.floor(Date.now() / 1000);
        this.updatingState = 'succeeded';
        this.emit('update', this);
        this.emit('updatingstatechange', 'succeeded');
    };
    // the first update event adds all the field from getSubplebbit
    Subplebbit.prototype.simulateFirstUpdateEvent = function () {
        return __awaiter(this, void 0, void 0, function () {
            var hotPageCid;
            var _this = this;
            return __generator(this, function (_a) {
                this.firstUpdate = false;
                this.title = this.address + ' title';
                hotPageCid = this.address + ' page cid hot';
                this.posts.pages.hot = getCommentsPage(hotPageCid, this);
                this.posts.pageCids = {
                    hot: hotPageCid,
                    topAll: this.address + ' page cid topAll',
                    new: this.address + ' page cid new',
                    active: this.address + ' page cid active',
                };
                // simulate the ipns update
                this.updatingState = 'succeeded';
                this.emit('update', this);
                this.emit('updatingstatechange', 'succeeded');
                // simulate the next update
                this.updatingState = 'fetching-ipns';
                this.emit('updatingstatechange', 'fetching-ipns');
                (0, exports.simulateLoadingTime)().then(function () {
                    _this.simulateUpdateEvent();
                });
                return [2 /*return*/];
            });
        });
    };
    Object.defineProperty(Subplebbit.prototype, "roles", {
        // use getting to easily mock it
        get: function () {
            return this.rolesToGet();
        },
        enumerable: false,
        configurable: true
    });
    // mock this method to get different roles
    Subplebbit.prototype.rolesToGet = function () {
        return {};
    };
    Subplebbit.prototype.edit = function (editSubplebbitOptions) {
        return __awaiter(this, void 0, void 0, function () {
            var previousAddress, prop;
            return __generator(this, function (_a) {
                if (!this.address || typeof this.address !== 'string') {
                    throw Error("can't subplebbit.edit with no subplebbit.address");
                }
                previousAddress = this.address;
                // do subplebbit.edit
                for (prop in editSubplebbitOptions) {
                    if (editSubplebbitOptions[prop]) {
                        // @ts-ignore
                        this[prop] = editSubplebbitOptions[prop];
                    }
                }
                // keep a list of edited subplebbits to reinitialize
                // them with plebbit.createSubplebbit()
                editedOwnerSubplebbits[this.address] = {
                    address: this.address,
                    title: this.title,
                    description: this.description,
                };
                // handle change of subplebbit.address
                if (editSubplebbitOptions.address) {
                    // apply address change to editedOwnerSubplebbits
                    editedOwnerSubplebbits[previousAddress] = {
                        address: this.address,
                        title: this.title,
                        description: this.description,
                    };
                    delete editedOwnerSubplebbits[previousAddress];
                    // apply address change to createdOwnerSubplebbits
                    createdOwnerSubplebbits[this.address] = __assign(__assign({}, createdOwnerSubplebbits[previousAddress]), { address: this.address });
                    delete createdOwnerSubplebbits[previousAddress];
                }
                return [2 /*return*/];
            });
        });
    };
    return Subplebbit;
}(events_1.default));
exports.Subplebbit = Subplebbit;
// make roles enumarable so it acts like a regular prop
Object.defineProperty(Subplebbit.prototype, 'roles', { enumerable: true });
// define it here because also used it plebbit.getSubplebbit()
var getCommentsPage = function (pageCid, subplebbit) {
    var page = {
        nextCid: subplebbit.address + ' ' + pageCid + ' - next page cid',
        comments: [],
    };
    var postCount = 100;
    var index = 0;
    while (index++ < postCount) {
        page.comments.push({
            timestamp: index,
            cid: pageCid + ' comment cid ' + index,
            subplebbitAddress: subplebbit.address,
            upvoteCount: index,
            downvoteCount: 10,
            author: {
                address: pageCid + ' author address ' + index,
            },
            updatedAt: index,
        });
    }
    return __assign(__assign({}, page), { _fetchAndVerifyPage: function () { return page; } });
};
var challengeRequestCount = 0;
var Publication = /** @class */ (function (_super) {
    __extends(Publication, _super);
    function Publication() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.challengeRequestId = new TextEncoder().encode("r".concat(++challengeRequestCount));
        return _this;
    }
    Publication.prototype.publish = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.state = 'publishing';
                        this.publishingState = 'publishing-challenge-request';
                        this.emit('statechange', 'publishing');
                        this.emit('publishingstatechange', 'publishing-challenge-request');
                        return [4 /*yield*/, (0, exports.simulateLoadingTime)()];
                    case 1:
                        _a.sent();
                        this.simulateChallengeEvent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Publication.prototype.stop = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/];
        }); });
    };
    Publication.prototype.simulateChallengeEvent = function () {
        this.publishingState = 'waiting-challenge-answers';
        this.emit('publishingstatechange', 'waiting-challenge-answers');
        var challenge = { type: 'text', challenge: '2+2=?' };
        var challengeMessage = {
            type: 'CHALLENGE',
            challengeRequestId: this.challengeRequestId,
            challenges: [challenge],
        };
        this.emit('challenge', challengeMessage, this);
    };
    Publication.prototype.publishChallengeAnswers = function (challengeAnswers) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.publishingState = 'publishing-challenge-answer';
                        this.emit('publishingstatechange', 'publishing-challenge-answer');
                        return [4 /*yield*/, (0, exports.simulateLoadingTime)()];
                    case 1:
                        _a.sent();
                        this.publishingState = 'waiting-challenge-verification';
                        this.emit('publishingstatechange', 'waiting-challenge-verification');
                        return [4 /*yield*/, (0, exports.simulateLoadingTime)()];
                    case 2:
                        _a.sent();
                        this.simulateChallengeVerificationEvent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Publication.prototype.simulateChallengeVerificationEvent = function () {
        // if publication has content, create cid for this content and add it to comment and challengeVerificationMessage
        this.cid = this.content && "".concat(this.content, " cid");
        var publication = this.cid && { cid: this.cid };
        var challengeVerificationMessage = {
            type: 'CHALLENGEVERIFICATION',
            challengeRequestId: this.challengeRequestId,
            challengeSuccess: true,
            publication: publication,
        };
        this.emit('challengeverification', challengeVerificationMessage, this);
        this.publishingState = 'succeeded';
        this.emit('publishingstatechange', 'succeeded');
    };
    return Publication;
}(events_1.default));
var Comment = /** @class */ (function (_super) {
    __extends(Comment, _super);
    function Comment(createCommentOptions) {
        var _this = this;
        var _a;
        _this = _super.call(this) || this;
        _this.updateCalledTimes = 0;
        _this.updating = false;
        _this.ipnsName = createCommentOptions === null || createCommentOptions === void 0 ? void 0 : createCommentOptions.ipnsName;
        _this.cid = createCommentOptions === null || createCommentOptions === void 0 ? void 0 : createCommentOptions.cid;
        _this.upvoteCount = createCommentOptions === null || createCommentOptions === void 0 ? void 0 : createCommentOptions.upvoteCount;
        _this.downvoteCount = createCommentOptions === null || createCommentOptions === void 0 ? void 0 : createCommentOptions.downvoteCount;
        _this.content = createCommentOptions === null || createCommentOptions === void 0 ? void 0 : createCommentOptions.content;
        _this.author = createCommentOptions === null || createCommentOptions === void 0 ? void 0 : createCommentOptions.author;
        _this.timestamp = createCommentOptions === null || createCommentOptions === void 0 ? void 0 : createCommentOptions.timestamp;
        _this.parentCid = createCommentOptions === null || createCommentOptions === void 0 ? void 0 : createCommentOptions.parentCid;
        _this.replies = new Pages({ comment: _this });
        _this.subplebbitAddress = createCommentOptions === null || createCommentOptions === void 0 ? void 0 : createCommentOptions.subplebbitAddress;
        _this.state = 'stopped';
        _this.updatingState = 'stopped';
        _this.publishingState = 'stopped';
        if ((_a = createCommentOptions === null || createCommentOptions === void 0 ? void 0 : createCommentOptions.author) === null || _a === void 0 ? void 0 : _a.address) {
            _this.author.shortAddress = "short ".concat(createCommentOptions.author.address);
        }
        //@ts-expect-error
        _this._rawCommentIpfs = {
            ipnsName: _this.ipnsName,
            content: _this.content,
            author: _this.author,
            timestamp: _this.timestamp,
            parentCid: _this.parentCid,
            subplebbitAddress: _this.subplebbitAddress,
        };
        return _this;
    }
    Comment.prototype.update = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                this.updateCalledTimes++;
                if (this.updateCalledTimes > 2) {
                    throw Error('with the current hooks, comment.update() should be called maximum 2 times, this number might change if the hooks change and is only there to catch bugs, the real comment.update() can be called infinite times');
                }
                // don't update twice
                if (this.updating) {
                    return [2 /*return*/];
                }
                this.updating = true;
                this.state = 'updating';
                this.updatingState = 'fetching-ipfs';
                this.emit('statechange', 'updating');
                this.emit('updatingstatechange', 'fetching-ipfs');
                (0, exports.simulateLoadingTime)().then(function () {
                    _this.simulateUpdateEvent();
                });
                return [2 /*return*/];
            });
        });
    };
    Comment.prototype.simulateUpdateEvent = function () {
        // if timestamp isn't defined, simulate fetching the comment ipfs
        if (!this.timestamp) {
            this.simulateFetchCommentIpfsUpdateEvent();
            return;
        }
        // simulate finding vote counts on an IPNS record
        this.upvoteCount = typeof this.upvoteCount === 'number' ? this.upvoteCount + 2 : 3;
        this.downvoteCount = typeof this.downvoteCount === 'number' ? this.downvoteCount + 1 : 1;
        this.updatedAt = Math.floor(Date.now() / 1000);
        this.updatingState = 'succeeded';
        this.emit('update', this);
        this.emit('updatingstatechange', 'succeeded');
    };
    Comment.prototype.simulateFetchCommentIpfsUpdateEvent = function () {
        return __awaiter(this, void 0, void 0, function () {
            var commentIpfs;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, new Plebbit().getComment(this.cid || '')];
                    case 1:
                        commentIpfs = _a.sent();
                        this.ipnsName = commentIpfs.ipnsName;
                        this.content = commentIpfs.content;
                        this.author = commentIpfs.author;
                        this.timestamp = commentIpfs.timestamp;
                        this.parentCid = commentIpfs.parentCid;
                        this.subplebbitAddress = commentIpfs.subplebbitAddress;
                        // simulate the ipns update
                        this.updatingState = 'fetching-update-ipns';
                        this.emit('update', this);
                        this.emit('updatingstatechange', 'fetching-update-ipns');
                        (0, exports.simulateLoadingTime)().then(function () {
                            _this.simulateUpdateEvent();
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    return Comment;
}(Publication));
exports.Comment = Comment;
var Vote = /** @class */ (function (_super) {
    __extends(Vote, _super);
    function Vote() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Vote;
}(Publication));
exports.Vote = Vote;
var CommentEdit = /** @class */ (function (_super) {
    __extends(CommentEdit, _super);
    function CommentEdit() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return CommentEdit;
}(Publication));
exports.CommentEdit = CommentEdit;
var SubplebbitEdit = /** @class */ (function (_super) {
    __extends(SubplebbitEdit, _super);
    function SubplebbitEdit() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return SubplebbitEdit;
}(Publication));
exports.SubplebbitEdit = SubplebbitEdit;
function default_1() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Plebbit()];
        });
    });
}
exports.default = default_1;
//# sourceMappingURL=plebbit-js-mock.js.map