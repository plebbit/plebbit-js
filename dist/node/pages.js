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
exports.Page = exports.Pages = void 0;
const util_1 = require("./util");
const signer_1 = require("./signer");
const assert_1 = __importDefault(require("assert"));
const debugs = (0, util_1.getDebugLevels)("pages");
class Pages {
    constructor(props) {
        this.pages = props["pages"];
        this.pageCids = props["pageCids"];
        this.subplebbit = props["subplebbit"];
        // these functions might get separated from their `this` when used
        this.getPage = this.getPage.bind(this);
    }
    getPage(pageCid) {
        return __awaiter(this, void 0, void 0, function* () {
            const page = new Page(yield (0, util_1.loadIpfsFileAsJson)(pageCid, this.subplebbit.plebbit));
            const verifyComment = (comment, parentComment) => __awaiter(this, void 0, void 0, function* () {
                assert_1.default.equal(comment.subplebbitAddress, this.subplebbit.address, "Comment in page should be under the same subplebbit");
                if (parentComment)
                    assert_1.default.equal(parentComment.cid, comment.parentCid, "Comment under parent comment/post should have parentCid initialized");
                debugs.TRACE(`In page (${pageCid}), Attempting to verify comment (${comment.cid}) under parent comment (${parentComment === null || parentComment === void 0 ? void 0 : parentComment.cid})`);
                const [signatureIsVerified, failedVerificationReason] = yield (0, signer_1.verifyPublication)(comment, this.subplebbit.plebbit);
                assert_1.default.equal(signatureIsVerified, true, `Signature of published comment should be valid, Failed verification reason is ${failedVerificationReason}`);
                debugs.TRACE(`Comment (${comment.cid}) has been verified. Will attempt to verify its ${comment.replyCount} replies`);
                if (comment.replies) {
                    const preloadedCommentsChunks = Object.keys(comment.replies.pages).map((sortType) => comment.replies.pages[sortType].comments);
                    yield Promise.all(preloadedCommentsChunks.map((preloadedComments) => __awaiter(this, void 0, void 0, function* () { return yield Promise.all(preloadedComments.map((preloadedComment) => verifyComment(preloadedComment, comment))); })));
                }
            });
            yield Promise.all(page.comments.map((comment) => __awaiter(this, void 0, void 0, function* () {
                yield verifyComment(comment, undefined);
            })));
            return page;
        });
    }
    toJSON() {
        return { pages: this.pages, pageCids: this.pageCids };
    }
}
exports.Pages = Pages;
class Page {
    constructor(props) {
        this.comments = props["comments"];
        this.nextCid = props["nextCid"];
    }
}
exports.Page = Page;
