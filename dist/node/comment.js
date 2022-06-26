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
exports.CommentEdit = exports.Comment = void 0;
const assert_1 = __importDefault(require("assert"));
const util_1 = require("./util");
const publication_1 = __importDefault(require("./publication"));
const pages_1 = require("./pages");
const sort_handler_1 = require("./sort-handler");
const debugs = (0, util_1.getDebugLevels)("comment");
const DEFAULT_UPDATE_INTERVAL_MS = 60000; // One minute
class Comment extends publication_1.default {
    _initProps(props) {
        super._initProps(props);
        this.postCid = props["postCid"];
        this.cid = props["cid"];
        this.parentCid = props["parentCid"];
        this.ipnsName = props["ipnsName"]; // each post needs its own IPNS record for its mutable data like edits, vote counts, comments
        this.ipnsKeyName = props["ipnsKeyName"];
        this.depth = props["depth"];
        this.setPreviousCid(props["previousCid"]);
        // CommentUpdate props
        this._initCommentUpdate(props);
        // these functions might get separated from their `this` when used
        this.publish = this.publish.bind(this);
        this.update = this.update.bind(this);
        this.stop = this.stop.bind(this);
    }
    _initCommentUpdate(props) {
        this.upvoteCount = props["upvoteCount"];
        this.downvoteCount = props["downvoteCount"];
        this.replyCount = props["replyCount"];
        this.updatedAt = props["updatedAt"];
        this.replies =
            props["replies"] instanceof Object && JSON.stringify(props["replies"]) !== "{}"
                ? new pages_1.Pages(Object.assign(Object.assign({}, props["replies"]), { subplebbit: this.subplebbit }))
                : undefined;
        // Comment Edit props
        this.originalContent =
            props["originalContent"] || this.originalContent || (props["content"] && props["editSignature"] ? this.content : undefined);
        this.content = props["content"] || this.content;
        assert_1.default.notEqual(this.content, this.originalContent, "Content and original content can't be equal to each other");
        this.editSignature = (0, util_1.parseJsonIfString)(props["editSignature"]);
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
        return Object.assign(Object.assign(Object.assign({}, this.toJSONIpfs()), this.toJSONCommentUpdate()), { cid: this.cid, originalContent: this.originalContent });
    }
    toJSONIpfs() {
        return Object.assign(Object.assign({}, this.toJSONSkeleton()), { previousCid: this.previousCid, ipnsName: this.ipnsName, postCid: this.postCid, depth: this.depth });
    }
    toJSONSkeleton() {
        return Object.assign(Object.assign({}, super.toJSONSkeleton()), { content: this.content, parentCid: this.parentCid });
    }
    toJSONForDb(challengeRequestId) {
        var _a;
        const json = this.toJSON();
        ["replyCount", "upvoteCount", "downvoteCount", "replies"].forEach((key) => delete json[key]);
        json["authorAddress"] = (_a = this === null || this === void 0 ? void 0 : this.author) === null || _a === void 0 ? void 0 : _a.address;
        json["challengeRequestId"] = challengeRequestId;
        json["ipnsKeyName"] = this.ipnsKeyName;
        // @ts-ignore
        json["signature"] = JSON.stringify(this.signature);
        return (0, util_1.removeKeysWithUndefinedValues)(json);
    }
    toJSONCommentUpdate() {
        return Object.assign(Object.assign({ replyCount: this.replyCount, upvoteCount: this.upvoteCount, downvoteCount: this.downvoteCount, replies: this.replies }, (this.originalContent ? { content: this.content } : undefined)), { updatedAt: this.updatedAt, editSignature: this.editSignature, editTimestamp: this.editTimestamp, editReason: this.editReason, deleted: this.deleted, spoiler: this.spoiler, pinned: this.pinned, locked: this.locked, removed: this.removed, moderatorReason: this.moderatorReason });
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
        if (sortedReplies)
            this.replies = new pages_1.Pages({
                // @ts-ignore
                pages: { [sort_handler_1.REPLIES_SORT_TYPES.TOP_ALL.type]: sortedReplies[sort_handler_1.REPLIES_SORT_TYPES.TOP_ALL.type] },
                pageCids: sortedRepliesCids,
                subplebbit: this.subplebbit
            });
    }
    updateOnce() {
        return __awaiter(this, void 0, void 0, function* () {
            let res;
            try {
                (0, assert_1.default)(this.ipnsName, "Comment needs to have ipnsName before updating");
                res = yield (0, util_1.loadIpnsAsJson)(this.ipnsName, this.subplebbit.plebbit);
            }
            catch (e) {
                debugs.WARN(`Failed to load comment (${this.cid}) IPNS (${this.ipnsName}) due to error = ${e.message}`);
                return;
            }
            if (!(0, util_1.shallowEqual)(this.toJSONCommentUpdate(), res)) {
                debugs.DEBUG(`Comment (${this.cid}) IPNS (${this.ipnsName}) received a new update. Emitting an update event...`);
                this._initCommentUpdate(res);
                this.emit("update", this);
            }
            else {
                debugs.TRACE(`Comment (${this.cid}) IPNS (${this.ipnsName}) has no new update`);
                this._initCommentUpdate(res);
            }
            return this;
        });
    }
    update(updateIntervalMs = DEFAULT_UPDATE_INTERVAL_MS) {
        (0, assert_1.default)(this.ipnsName, "Comment need to have ipnsName field to poll updates");
        debugs.DEBUG(`Starting to poll updates for comment (${this.cid}) IPNS (${this.ipnsName}) every ${updateIntervalMs} milliseconds`);
        if (this._updateInterval)
            clearInterval(this._updateInterval);
        this._updateInterval = setInterval(this.updateOnce.bind(this), updateIntervalMs);
        return this.updateOnce();
    }
    stop() {
        clearInterval(this._updateInterval);
    }
    edit(commentUpdateOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            (0, assert_1.default)(this.ipnsKeyName, "You need to have commentUpdate");
            this._initCommentUpdate(commentUpdateOptions);
            const file = yield this.subplebbit.plebbit.ipfsClient.add(JSON.stringify(this.toJSONCommentUpdate()));
            yield this.subplebbit.plebbit.ipfsClient.name.publish(file["cid"], {
                lifetime: "72h",
                key: this.ipnsKeyName,
                allowOffline: true
            });
            debugs.DEBUG(`Linked comment (${this.cid}) ipns name(${this.ipnsName}) to ipfs file (${file.path})`);
        });
    }
    publish(userOptions) {
        const _super = Object.create(null, {
            publish: { get: () => super.publish }
        });
        return __awaiter(this, void 0, void 0, function* () {
            (0, assert_1.default)(this.content, "Need content field to publish comment");
            if (!this.toJSON().hasOwnProperty("commentCid")) {
                // Assert timestamp only if this is not a CommentEdit
                (0, assert_1.default)(this.timestamp, "Need timestamp field to publish comment");
                (0, assert_1.default)(this.author, "Need author to publish comment");
            }
            return _super.publish.call(this, userOptions);
        });
    }
}
exports.Comment = Comment;
class CommentEdit extends Comment {
    _initProps(props) {
        super._initProps(props);
        this.commentCid = props["commentCid"];
    }
    toJSON() {
        return Object.assign(Object.assign({}, super.toJSON()), { commentCid: this.commentCid });
    }
    toJSONForDb(challengeRequestId) {
        const json = super.toJSONForDb(challengeRequestId);
        ["challengeRequestId", "ipnsKeyName", "signature", "commentCid"].forEach((key) => delete json[key]);
        json["cid"] = this.commentCid;
        return (0, util_1.removeKeysWithUndefinedValues)(json);
    }
    publish(userOptions) {
        const _super = Object.create(null, {
            publish: { get: () => super.publish }
        });
        return __awaiter(this, void 0, void 0, function* () {
            (0, assert_1.default)(this.commentCid, "Need commentCid to be defined to publish CommentEdit");
            (0, assert_1.default)(this.editTimestamp, "Need editTimestamp to be defined to publish CommentEdit");
            (0, assert_1.default)(this.editSignature, "Need to have editSignature to publish CommentEdit");
            return _super.publish.call(this, userOptions);
        });
    }
}
exports.CommentEdit = CommentEdit;
