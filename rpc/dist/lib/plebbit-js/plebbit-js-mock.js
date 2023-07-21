"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubplebbitEdit = exports.CommentEdit = exports.Vote = exports.Comment = exports.Subplebbit = exports.Pages = exports.Plebbit = exports.debugPlebbitJsMock = exports.resetPlebbitJsMock = exports.simulateLoadingTime = void 0;
const events_1 = __importDefault(require("events"));
const loadingTime = 10;
const simulateLoadingTime = () => new Promise((r) => setTimeout(r, loadingTime));
exports.simulateLoadingTime = simulateLoadingTime;
// keep a list of created and edited owner subplebbits
// to reinitialize them with plebbit.createSubplebbit()
let createdOwnerSubplebbits = {};
let editedOwnerSubplebbits = {};
// reset the plebbit-js global state in between tests
const resetPlebbitJsMock = () => {
    createdOwnerSubplebbits = {};
    editedOwnerSubplebbits = {};
};
exports.resetPlebbitJsMock = resetPlebbitJsMock;
const debugPlebbitJsMock = () => {
    console.log({ createdOwnerSubplebbits, editedOwnerSubplebbits });
};
exports.debugPlebbitJsMock = debugPlebbitJsMock;
class Plebbit extends events_1.default {
    resolveAuthorAddress(authorAddress) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    createSigner() {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                privateKey: 'private key',
                address: 'address',
            };
        });
    }
    createSubplebbit(createSubplebbitOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!createSubplebbitOptions) {
                createSubplebbitOptions = {};
            }
            // no address provided so probably a user creating an owner subplebbit
            if (!createSubplebbitOptions.address && !createdOwnerSubplebbits[createSubplebbitOptions.address]) {
                createSubplebbitOptions = Object.assign(Object.assign({}, createSubplebbitOptions), { address: 'created subplebbit address' });
                // createdSubplebbitAddresses.push('created subplebbit address')
                createdOwnerSubplebbits[createSubplebbitOptions.address] = Object.assign({}, createSubplebbitOptions);
            }
            // only address provided, so could be a previously created owner subplebbit
            // add props from previously created sub
            else if (createdOwnerSubplebbits[createSubplebbitOptions.address] && JSON.stringify(Object.keys(createSubplebbitOptions)) === '["address"]') {
                for (const prop in createdOwnerSubplebbits[createSubplebbitOptions.address]) {
                    if (createdOwnerSubplebbits[createSubplebbitOptions.address][prop]) {
                        createSubplebbitOptions[prop] = createdOwnerSubplebbits[createSubplebbitOptions.address][prop];
                    }
                }
            }
            // add edited props if owner subplebbit was edited in the past
            if (editedOwnerSubplebbits[createSubplebbitOptions.address]) {
                for (const prop in editedOwnerSubplebbits[createSubplebbitOptions.address]) {
                    if (editedOwnerSubplebbits[createSubplebbitOptions.address][prop]) {
                        createSubplebbitOptions[prop] = editedOwnerSubplebbits[createSubplebbitOptions.address][prop];
                    }
                }
            }
            return new Subplebbit(createSubplebbitOptions);
        });
    }
    getSubplebbit(subplebbitAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, exports.simulateLoadingTime)();
            const createSubplebbitOptions = {
                address: subplebbitAddress,
            };
            const subplebbit = new Subplebbit(createSubplebbitOptions);
            subplebbit.title = subplebbit.address + ' title';
            const hotPageCid = subplebbit.address + ' page cid hot';
            subplebbit.posts.pages.hot = getCommentsPage(hotPageCid, subplebbit);
            subplebbit.posts.pageCids = {
                hot: hotPageCid,
                topAll: subplebbit.address + ' page cid topAll',
                new: subplebbit.address + ' page cid new',
                active: subplebbit.address + ' page cid active',
            };
            return subplebbit;
        });
    }
    listSubplebbits() {
        return __awaiter(this, void 0, void 0, function* () {
            return [...new Set(['list subplebbit address 1', 'list subplebbit address 2', ...Object.keys(createdOwnerSubplebbits)])];
        });
    }
    createComment(createCommentOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Comment(createCommentOptions);
        });
    }
    getComment(commentCid) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, exports.simulateLoadingTime)();
            const createCommentOptions = Object.assign({ cid: commentCid, ipnsName: commentCid + ' ipns name', 
                // useComment() requires timestamp or will use account comment instead of comment from store
                timestamp: 1670000000 }, this.commentToGet(commentCid));
            return new Comment(createCommentOptions);
        });
    }
    // mock this method to get a comment with different content, timestamp, address, etc
    commentToGet(commentCid) {
        return {
        // content: 'mock some content'
        // author: {address: 'mock some address'},
        // timestamp: 1234
        };
    }
    createVote() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Vote();
        });
    }
    createCommentEdit(createCommentEditOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            return new CommentEdit(createCommentEditOptions);
        });
    }
    createSubplebbitEdit(createSubplebbitEditOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            return new SubplebbitEdit(createSubplebbitEditOptions);
        });
    }
    fetchCid(cid) {
        return __awaiter(this, void 0, void 0, function* () {
            if (cid === null || cid === void 0 ? void 0 : cid.startsWith('statscid')) {
                return JSON.stringify({ hourActiveUserCount: 1 });
            }
            throw Error(`plebbit.fetchCid not implemented in plebbit-js mock for cid '${cid}'`);
        });
    }
    pubsubSubscribe(subplebbitAddress) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    pubsubUnsubscribe(subplebbitAddress) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
}
exports.Plebbit = Plebbit;
class Pages {
    constructor(pagesOptions) {
        this.pageCids = {};
        this.pages = {};
        Object.defineProperty(this, 'subplebbit', { value: pagesOptions === null || pagesOptions === void 0 ? void 0 : pagesOptions.subplebbit, enumerable: false });
        Object.defineProperty(this, 'comment', { value: pagesOptions === null || pagesOptions === void 0 ? void 0 : pagesOptions.comment, enumerable: false });
    }
    getPage(pageCid) {
        return __awaiter(this, void 0, void 0, function* () {
            // need to wait twice otherwise react renders too fast and fetches too many pages in advance
            yield (0, exports.simulateLoadingTime)();
            return getCommentsPage(pageCid, this.subplebbit);
        });
    }
}
exports.Pages = Pages;
class Subplebbit extends events_1.default {
    constructor(createSubplebbitOptions) {
        var _a, _b, _c, _d;
        super();
        this.updateCalledTimes = 0;
        this.updating = false;
        this.firstUpdate = true;
        this.address = createSubplebbitOptions === null || createSubplebbitOptions === void 0 ? void 0 : createSubplebbitOptions.address;
        this.title = createSubplebbitOptions === null || createSubplebbitOptions === void 0 ? void 0 : createSubplebbitOptions.title;
        this.description = createSubplebbitOptions === null || createSubplebbitOptions === void 0 ? void 0 : createSubplebbitOptions.description;
        this.statsCid = 'statscid';
        this.state = 'stopped';
        this.updatingState = 'stopped';
        this.posts = new Pages({ subplebbit: this });
        // add subplebbit.posts from createSubplebbitOptions
        if ((_a = createSubplebbitOptions === null || createSubplebbitOptions === void 0 ? void 0 : createSubplebbitOptions.posts) === null || _a === void 0 ? void 0 : _a.pages) {
            this.posts.pages = (_b = createSubplebbitOptions === null || createSubplebbitOptions === void 0 ? void 0 : createSubplebbitOptions.posts) === null || _b === void 0 ? void 0 : _b.pages;
        }
        if ((_c = createSubplebbitOptions === null || createSubplebbitOptions === void 0 ? void 0 : createSubplebbitOptions.posts) === null || _c === void 0 ? void 0 : _c.pageCids) {
            this.posts.pageCids = (_d = createSubplebbitOptions === null || createSubplebbitOptions === void 0 ? void 0 : createSubplebbitOptions.posts) === null || _d === void 0 ? void 0 : _d.pageCids;
        }
        // only trigger a first update if argument is only ({address})
        if (!(createSubplebbitOptions === null || createSubplebbitOptions === void 0 ? void 0 : createSubplebbitOptions.address) || Object.keys(createSubplebbitOptions).length !== 1) {
            this.firstUpdate = false;
        }
    }
    update() {
        return __awaiter(this, void 0, void 0, function* () {
            this.updateCalledTimes++;
            if (this.updateCalledTimes > 1) {
                throw Error('with the current hooks, subplebbit.update() should be called maximum 1 times, this number might change if the hooks change and is only there to catch bugs, the real comment.update() can be called infinite times');
            }
            // is ipnsName is known, look for updates and emit updates immediately after creation
            if (!this.address) {
                throw Error(`can't update without subplebbit.address`);
            }
            // don't update twice
            if (this.updating) {
                return;
            }
            this.updating = true;
            this.state = 'updating';
            this.updatingState = 'fetching-ipns';
            this.emit('statechange', 'updating');
            this.emit('updatingstatechange', 'fetching-ipns');
            (0, exports.simulateLoadingTime)().then(() => {
                this.simulateUpdateEvent();
            });
        });
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    delete() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.address) {
                delete createdOwnerSubplebbits[this.address];
                delete editedOwnerSubplebbits[this.address];
            }
        });
    }
    simulateUpdateEvent() {
        if (this.firstUpdate) {
            this.simulateFirstUpdateEvent();
            return;
        }
        this.description = this.address + ' description updated';
        this.updatedAt = Math.floor(Date.now() / 1000);
        this.updatingState = 'succeeded';
        this.emit('update', this);
        this.emit('updatingstatechange', 'succeeded');
    }
    // the first update event adds all the field from getSubplebbit
    simulateFirstUpdateEvent() {
        return __awaiter(this, void 0, void 0, function* () {
            this.firstUpdate = false;
            this.title = this.address + ' title';
            const hotPageCid = this.address + ' page cid hot';
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
            (0, exports.simulateLoadingTime)().then(() => {
                this.simulateUpdateEvent();
            });
        });
    }
    // use getting to easily mock it
    get roles() {
        return this.rolesToGet();
    }
    // mock this method to get different roles
    rolesToGet() {
        return {};
    }
    edit(editSubplebbitOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.address || typeof this.address !== 'string') {
                throw Error(`can't subplebbit.edit with no subplebbit.address`);
            }
            const previousAddress = this.address;
            // do subplebbit.edit
            for (const prop in editSubplebbitOptions) {
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
                createdOwnerSubplebbits[this.address] = Object.assign(Object.assign({}, createdOwnerSubplebbits[previousAddress]), { address: this.address });
                delete createdOwnerSubplebbits[previousAddress];
            }
        });
    }
}
exports.Subplebbit = Subplebbit;
// make roles enumarable so it acts like a regular prop
Object.defineProperty(Subplebbit.prototype, 'roles', { enumerable: true });
// define it here because also used it plebbit.getSubplebbit()
const getCommentsPage = (pageCid, subplebbit) => {
    const page = {
        nextCid: subplebbit.address + ' ' + pageCid + ' - next page cid',
        comments: [],
    };
    const postCount = 100;
    let index = 0;
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
    return page;
};
let challengeRequestCount = 0;
class Publication extends events_1.default {
    constructor() {
        super(...arguments);
        this.challengeRequestId = new TextEncoder().encode(`r${++challengeRequestCount}`);
    }
    publish() {
        return __awaiter(this, void 0, void 0, function* () {
            this.state = 'publishing';
            this.publishingState = 'publishing-challenge-request';
            this.emit('statechange', 'publishing');
            this.emit('publishingstatechange', 'publishing-challenge-request');
            yield (0, exports.simulateLoadingTime)();
            this.simulateChallengeEvent();
        });
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    simulateChallengeEvent() {
        this.publishingState = 'waiting-challenge-answers';
        this.emit('publishingstatechange', 'waiting-challenge-answers');
        const challenge = { type: 'text', challenge: '2+2=?' };
        const challengeMessage = {
            type: 'CHALLENGE',
            challengeRequestId: this.challengeRequestId,
            challenges: [challenge],
        };
        this.emit('challenge', challengeMessage, this);
    }
    publishChallengeAnswers(challengeAnswers) {
        return __awaiter(this, void 0, void 0, function* () {
            this.publishingState = 'publishing-challenge-answer';
            this.emit('publishingstatechange', 'publishing-challenge-answer');
            yield (0, exports.simulateLoadingTime)();
            this.publishingState = 'waiting-challenge-verification';
            this.emit('publishingstatechange', 'waiting-challenge-verification');
            yield (0, exports.simulateLoadingTime)();
            this.simulateChallengeVerificationEvent();
        });
    }
    simulateChallengeVerificationEvent() {
        // if publication has content, create cid for this content and add it to comment and challengeVerificationMessage
        this.cid = this.content && `${this.content} cid`;
        const publication = this.cid && { cid: this.cid };
        const challengeVerificationMessage = {
            type: 'CHALLENGEVERIFICATION',
            challengeRequestId: this.challengeRequestId,
            challengeSuccess: true,
            publication,
        };
        this.emit('challengeverification', challengeVerificationMessage, this);
        this.publishingState = 'succeeded';
        this.emit('publishingstatechange', 'succeeded');
    }
}
class Comment extends Publication {
    constructor(createCommentOptions) {
        var _a;
        super();
        this.updateCalledTimes = 0;
        this.updating = false;
        this.ipnsName = createCommentOptions === null || createCommentOptions === void 0 ? void 0 : createCommentOptions.ipnsName;
        this.cid = createCommentOptions === null || createCommentOptions === void 0 ? void 0 : createCommentOptions.cid;
        this.upvoteCount = createCommentOptions === null || createCommentOptions === void 0 ? void 0 : createCommentOptions.upvoteCount;
        this.downvoteCount = createCommentOptions === null || createCommentOptions === void 0 ? void 0 : createCommentOptions.downvoteCount;
        this.content = createCommentOptions === null || createCommentOptions === void 0 ? void 0 : createCommentOptions.content;
        this.author = createCommentOptions === null || createCommentOptions === void 0 ? void 0 : createCommentOptions.author;
        this.timestamp = createCommentOptions === null || createCommentOptions === void 0 ? void 0 : createCommentOptions.timestamp;
        this.parentCid = createCommentOptions === null || createCommentOptions === void 0 ? void 0 : createCommentOptions.parentCid;
        this.replies = new Pages({ comment: this });
        this.subplebbitAddress = createCommentOptions === null || createCommentOptions === void 0 ? void 0 : createCommentOptions.subplebbitAddress;
        this.state = 'stopped';
        this.updatingState = 'stopped';
        this.publishingState = 'stopped';
        if ((_a = createCommentOptions === null || createCommentOptions === void 0 ? void 0 : createCommentOptions.author) === null || _a === void 0 ? void 0 : _a.address) {
            this.author.shortAddress = `short ${createCommentOptions.author.address}`;
        }
    }
    update() {
        return __awaiter(this, void 0, void 0, function* () {
            this.updateCalledTimes++;
            if (this.updateCalledTimes > 2) {
                throw Error('with the current hooks, comment.update() should be called maximum 2 times, this number might change if the hooks change and is only there to catch bugs, the real comment.update() can be called infinite times');
            }
            // don't update twice
            if (this.updating) {
                return;
            }
            this.updating = true;
            this.state = 'updating';
            this.updatingState = 'fetching-ipfs';
            this.emit('statechange', 'updating');
            this.emit('updatingstatechange', 'fetching-ipfs');
            (0, exports.simulateLoadingTime)().then(() => {
                this.simulateUpdateEvent();
            });
        });
    }
    simulateUpdateEvent() {
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
    }
    simulateFetchCommentIpfsUpdateEvent() {
        return __awaiter(this, void 0, void 0, function* () {
            // use plebbit.getComment() so mocking Plebbit.prototype.getComment works
            const commentIpfs = yield new Plebbit().getComment(this.cid || '');
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
            (0, exports.simulateLoadingTime)().then(() => {
                this.simulateUpdateEvent();
            });
        });
    }
}
exports.Comment = Comment;
class Vote extends Publication {
}
exports.Vote = Vote;
class CommentEdit extends Publication {
}
exports.CommentEdit = CommentEdit;
class SubplebbitEdit extends Publication {
}
exports.SubplebbitEdit = SubplebbitEdit;
function default_1() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Plebbit();
    });
}
exports.default = default_1;
