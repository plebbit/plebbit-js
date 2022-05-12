"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CommentEdit = exports.Comment = void 0;

var _assert = _interopRequireDefault(require("assert"));

var _Util = require("./Util.js");

var _Publication = _interopRequireDefault(require("./Publication.js"));

var _debug = _interopRequireDefault(require("debug"));

var _Pages = require("./Pages.js");

var _SortHandler = require("./SortHandler.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classPrivateMethodInitSpec(obj, privateSet) { _checkPrivateRedeclaration(obj, privateSet); privateSet.add(obj); }

function _checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }

function _classPrivateMethodGet(receiver, privateSet, fn) { if (!privateSet.has(receiver)) { throw new TypeError("attempted to get private field on non-instance"); } return fn; }

const debug = (0, _debug.default)("plebbit-js:Comment");
const DEFAULT_UPDATE_INTERVAL_MS = 60000; // One minute

var _updateOnce = /*#__PURE__*/new WeakSet();

class Comment extends _Publication.default {
  constructor(...args) {
    super(...args);

    _classPrivateMethodInitSpec(this, _updateOnce);
  }

  _initProps(props) {
    super._initProps(props);

    this.postCid = props["postCid"];
    this.cid = props["cid"];
    this.parentCid = props["parentCid"];
    this.ipnsName = props["ipnsName"]; // each post needs its own IPNS record for its mutable data like edits, vote counts, comments

    this.ipnsKeyName = props["ipnsKeyName"];
    this.depth = props["depth"];
    this.setPreviousCid(props["previousCid"]); // CommentUpdate props

    this._initCommentUpdate(props);
  }

  _initCommentUpdate(props) {
    this.upvoteCount = props["upvoteCount"];
    this.downvoteCount = props["downvoteCount"];
    this.replyCount = props["replyCount"];
    this.updatedAt = props["updatedAt"];
    this.replies = props["replies"] instanceof Object && JSON.stringify(props["replies"]) !== "{}" ? new _Pages.Pages({ ...props["replies"],
      "subplebbit": this.subplebbit
    }) : undefined; // Comment Edit props

    this.originalContent = props["originalContent"] || this.originalContent || (props["content"] && props["editSignature"] ? this.content : undefined);
    this.content = props["content"] || this.content;

    _assert.default.notEqual(this.content, this.originalContent, "Content and original content can't be equal to each other");

    this.editSignature = (0, _Util.parseJsonIfString)(props["editSignature"]);
    this.editTimestamp = props["editTimestamp"];
    this.editReason = props["editReason"];
    this.deleted = props["deleted"];
    this.spoiler = props["spoiler"];
    this.pinned = props["pinned"];
    this.locked = props["locked"];
    this.removed = props["removed"];
    this.moderatorReason = props["moderatorReason"];
  }

  toJSON() {
    return { ...this.toJSONIpfs(),
      ...this.toJSONCommentUpdate(),
      "cid": this.cid,
      "originalContent": this.originalContent
    };
  }

  toJSONIpfs() {
    return { ...this.toJSONSkeleton(),
      "previousCid": this.previousCid,
      "ipnsName": this.ipnsName,
      "postCid": this.postCid,
      "depth": this.depth
    };
  }

  toJSONSkeleton() {
    return { ...super.toJSONSkeleton(),
      "content": this.content,
      "parentCid": this.parentCid
    };
  }

  toJSONForDb(challengeRequestId) {
    var _this$author;

    const json = this.toJSON();
    ["replyCount", "upvoteCount", "downvoteCount", "replies", "author"].forEach(key => delete json[key]);
    json["authorAddress"] = this === null || this === void 0 ? void 0 : (_this$author = this.author) === null || _this$author === void 0 ? void 0 : _this$author.address;
    json["challengeRequestId"] = challengeRequestId;
    json["ipnsKeyName"] = this.ipnsKeyName;
    json["signature"] = JSON.stringify(this.signature);
    return (0, _Util.removeKeysWithUndefinedValues)(json);
  }

  toJSONCommentUpdate() {
    return {
      "replyCount": this.replyCount,
      "upvoteCount": this.upvoteCount,
      "downvoteCount": this.downvoteCount,
      "replies": this.replies,
      ...(this.originalContent ? {
        "content": this.content
      } : undefined),
      // Only include content if content has been changed through commentEdit
      "updatedAt": this.updatedAt,
      "editSignature": this.editSignature,
      "editTimestamp": this.editTimestamp,
      "editReason": this.editReason,
      "deleted": this.deleted,
      "spoiler": this.spoiler,
      "pinned": this.pinned,
      "locked": this.locked,
      "removed": this.removed,
      "moderatorReason": this.moderatorReason
    };
  }

  setCommentIpnsKey(ipnsKey) {
    // Contains name and id
    this.ipnsName = ipnsKey["id"] || ipnsKey["Id"];
    this.ipnsKeyName = ipnsKey["name"] || ipnsKey["Name"];
  }

  setPostCid(newPostCid) {
    this.postCid = newPostCid;
  }

  setCid(newCid) {
    this.cid = newCid;
  }

  setPreviousCid(newPreviousCid) {
    this.previousCid = newPreviousCid;
  }

  setDepth(newDepth) {
    this.depth = newDepth;
  }

  setUpdatedAt(newUpdatedAt) {
    this.updatedAt = newUpdatedAt;
  }

  setOriginalContent(newOriginalContent) {
    this.originalContent = newOriginalContent;
  }

  setReplies(sortedReplies, sortedRepliesCids) {
    if (sortedReplies) this.replies = new _Pages.Pages({
      "pages": {
        [_SortHandler.REPLIES_SORT_TYPES.TOP_ALL.type]: sortedReplies[_SortHandler.REPLIES_SORT_TYPES.TOP_ALL.type]
      },
      "pageCids": sortedRepliesCids,
      "subplebbit": this.subplebbit
    });
  }

  update(updateIntervalMs = DEFAULT_UPDATE_INTERVAL_MS) {
    (0, _assert.default)(this.ipnsName, "Comment need to have ipnsName field to poll updates");
    debug(`Starting to poll updates for comment (${this.cid}) IPNS (${this.ipnsName}) every ${updateIntervalMs} milliseconds`);
    if (this._updateInterval) clearInterval(this._updateInterval);
    this._updateInterval = setInterval(_classPrivateMethodGet(this, _updateOnce, _updateOnce2).bind(this), updateIntervalMs);
    return _classPrivateMethodGet(this, _updateOnce, _updateOnce2).call(this);
  }

  stop() {
    clearInterval(this._updateInterval);
  }

  async edit(commentUpdateOptions) {
    (0, _assert.default)(this.ipnsKeyName, "You need to have commentUpdate");

    try {
      this._initCommentUpdate(commentUpdateOptions);

      const file = await this.subplebbit.plebbit.ipfsClient.add(JSON.stringify(this.toJSONCommentUpdate()));
      debug(`Added comment IPNS to ipfs, cid is ${file.path}`);
      await this.subplebbit.plebbit.ipfsClient.name.publish(file["cid"], {
        "lifetime": "72h",
        "key": this.ipnsKeyName
      });
      debug(`Linked comment ipns name(${this.ipnsName}) to ipfs file (${file.path})`);
    } catch (e) {
      debug(`Failed to edit comment IPNS: `, e);
    }
  }

}

exports.Comment = Comment;

async function _updateOnce2() {
  const res = await (0, _Util.loadIpnsAsJson)(this.ipnsName, this.subplebbit.plebbit);
  if (!res) debug(`IPNS (${this.ipnsName}) is not pointing to any file`);else {
    if (res.updatedAt !== this.emittedAt) {
      this.emittedAt = res.updatedAt;

      this._initCommentUpdate(res);

      this.emit("update", this);
    }

    this._initCommentUpdate(res);

    return this;
  }
}

class CommentEdit extends Comment {
  _initProps(props) {
    super._initProps(props);

    this.commentCid = props["commentCid"];
  }

  toJSON() {
    return { ...super.toJSON(),
      "commentCid": this.commentCid
    };
  }

  toJSONForDb(challengeRequestId) {
    const json = super.toJSONForDb(challengeRequestId);
    ["authorAddress", "challengeRequestId", "ipnsKeyName", "signature", "commentCid"].forEach(key => delete json[key]);
    json["cid"] = this.commentCid;
    return (0, _Util.removeKeysWithUndefinedValues)(json);
  }

}

exports.CommentEdit = CommentEdit;