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
exports.loadAllPages = exports.generateMockVote = exports.generateMockPostWithRandomTimestamp = exports.generateMockComment = exports.generateMockPost = void 0;
const util_1 = require("./util");
const assert_1 = __importDefault(require("assert"));
const debugs = (0, util_1.getDebugLevels)("test-util");
function generateMockPost(subplebbitAddress, plebbit, signer) {
    return __awaiter(this, void 0, void 0, function* () {
        const postStartTestTime = Date.now() / 1000;
        signer = signer || (yield plebbit.createSigner());
        const post = yield plebbit.createComment({
            author: { displayName: `Mock Author - ${postStartTestTime}` },
            signer: signer,
            title: `Mock Post - ${postStartTestTime}`,
            content: `Mock content - ${postStartTestTime}`,
            subplebbitAddress: subplebbitAddress
        });
        assert_1.default.equal(post.constructor.name, "Post", "createComment should return Post if title is provided");
        post.once("challenge", (challengeMsg) => {
            post.publishChallengeAnswers(undefined);
        });
        return post;
    });
}
exports.generateMockPost = generateMockPost;
function generateMockComment(parentPostOrComment, plebbit, signer) {
    return __awaiter(this, void 0, void 0, function* () {
        const commentTime = Date.now() / 1000;
        signer = signer || (yield plebbit.createSigner());
        const comment = yield plebbit.createComment({
            author: { displayName: `Mock Author - ${commentTime}` },
            signer: signer,
            content: `Mock comment - ${commentTime}`,
            postCid: parentPostOrComment.postCid || parentPostOrComment.cid,
            parentCid: parentPostOrComment.cid,
            subplebbitAddress: parentPostOrComment.subplebbitAddress
        });
        comment.once("challenge", (challengeMsg) => {
            comment.publishChallengeAnswers(undefined);
        });
        return comment;
    });
}
exports.generateMockComment = generateMockComment;
function generateMockPostWithRandomTimestamp(subplebbitAddress, plebbit, signer) {
    return __awaiter(this, void 0, void 0, function* () {
        const randomTimeframeIndex = Math.floor(Math.random() * (Object.keys(util_1.TIMEFRAMES_TO_SECONDS).length - 1));
        const postTimestamp = (0, util_1.timestamp)() - (Math.random() > 0.5 ? util_1.TIMEFRAMES_TO_SECONDS[randomTimeframeIndex] : 0);
        const postTime = Date.now();
        signer = signer || (yield plebbit.createSigner());
        const post = yield plebbit.createComment({
            author: { displayName: `Mock Author - ${postTime}` },
            signer: signer,
            title: `Mock Post - ${postTime}`,
            content: `Mock content - ${postTime}`,
            subplebbitAddress: subplebbitAddress,
            timestamp: postTimestamp
        });
        post.once("challenge", (challengeMsg) => {
            post.publishChallengeAnswers(undefined);
        });
        return post;
    });
}
exports.generateMockPostWithRandomTimestamp = generateMockPostWithRandomTimestamp;
function generateMockVote(parentPostOrComment, vote, plebbit, signer) {
    return __awaiter(this, void 0, void 0, function* () {
        const voteTime = Date.now() / 1000;
        signer = signer || (yield plebbit.createSigner());
        const voteObj = yield plebbit.createVote({
            author: { displayName: `Mock Author - ${voteTime}` },
            signer: signer,
            commentCid: parentPostOrComment.cid || parentPostOrComment.postCid,
            vote: vote,
            subplebbitAddress: parentPostOrComment.subplebbitAddress
        });
        voteObj.once("challenge", (challengeMsg) => {
            voteObj.publishChallengeAnswers(undefined);
        });
        return voteObj;
    });
}
exports.generateMockVote = generateMockVote;
function loadAllPages(pageCid, pagesInstance) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!pageCid)
            return [];
        try {
            let sortedCommentsPage = yield pagesInstance.getPage(pageCid);
            let sortedComments = sortedCommentsPage.comments;
            while (sortedCommentsPage.nextCid) {
                sortedCommentsPage = yield pagesInstance.getPage(sortedCommentsPage.nextCid);
                sortedComments = sortedComments.concat(sortedCommentsPage.comments);
            }
            sortedComments = yield Promise.all(sortedComments.map((commentProps) => __awaiter(this, void 0, void 0, function* () { return pagesInstance.subplebbit.plebbit.createComment(commentProps); })));
            return sortedComments;
        }
        catch (e) {
            debugs.ERROR(`Error while loading all pages under cid (${pageCid}): ${e}`);
        }
    });
}
exports.loadAllPages = loadAllPages;
