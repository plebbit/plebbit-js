"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Pages = exports.Page = void 0;

var _Util = require("./Util.js");

var _Signer = require("./Signer.js");

var _assert = _interopRequireDefault(require("assert"));

var _debug = _interopRequireDefault(require("debug"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const debug = (0, _debug.default)("plebbit-js:Pages");

class Pages {
  constructor(props) {
    this.pages = props["pages"];
    this.pageCids = props["pageCids"];
    this.subplebbit = props["subplebbit"];
  }

  async getPage(pageCid) {
    const page = new Page(await (0, _Util.loadIpfsFileAsJson)(pageCid, this.subplebbit.plebbit));

    const verifyComment = async (comment, parentComment) => {
      _assert.default.equal(comment.subplebbitAddress, this.subplebbit.address, "Comment in page should be under the same subplebbit");

      if (parentComment) _assert.default.equal(parentComment.cid, comment.parentCid, "Comment under parent comment/post should have parentCid initialized");
      const [signatureIsVerified, failedVerificationReason] = await (0, _Signer.verifyPublication)(comment);

      _assert.default.equal(signatureIsVerified, true, `Signature of published comment should be valid, Failed verification reason is ${failedVerificationReason}`);

      debug(`Comment (${comment.cid}) has been verified. Will attempt to verify its ${comment.replyCount} replies`);

      if (comment.replies) {
        const preloadedCommentsChunks = Object.keys(comment.replies.pages).map(sortType => comment.replies.pages[sortType].comments);
        await Promise.all(preloadedCommentsChunks.map(async preloadedComments => await Promise.all(preloadedComments.map(preloadedComment => verifyComment(preloadedComment, comment)))));
      }
    };

    await Promise.all(page.comments.map(async comment => {
      // TODO verify signature
      await verifyComment(comment, undefined);
    }));
    return page;
  }

  toJSON() {
    return {
      "pages": this.pages,
      "pageCids": this.pageCids
    };
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