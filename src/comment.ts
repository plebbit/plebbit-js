import assert from "assert";
import { loadIpnsAsJson, parseJsonIfString, removeKeysWithUndefinedValues } from "./util";
import Publication from "./publication";
import Debug from "debug";
import { Pages } from "./pages";
import { REPLIES_SORT_TYPES } from "./sort-handler";
import { Signature } from "./signer";

const debug = Debug("plebbit-js:comment");

const DEFAULT_UPDATE_INTERVAL_MS = 60000; // One minute

export class Comment extends Publication {
    // public
    postCid?: string;
    cid?: string;
    parentCid?: string;
    ipnsName?: string;
    ipnsKeyName?: string;
    depth?: number;
    upvoteCount?: number;
    downvoteCount?: number;
    replyCount?: number;
    updatedAt?: number;
    replies?: Pages;
    originalContent?: string;
    content?: string;
    editSignature?: Signature;
    editTimestamp?: number;
    editReason?: string;
    deleted?: boolean;
    spoiler?: boolean;
    pinned?: boolean;
    locked?: boolean;
    removed?: boolean;
    moderatorReason?: string;
    previousCid?: string;

    // private
    emittedAt?: number;
    _updateInterval?: any;

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
                ? new Pages({
                      ...props["replies"],
                      subplebbit: this.subplebbit
                  })
                : undefined;
        // Comment Edit props
        this.originalContent =
            props["originalContent"] || this.originalContent || (props["content"] && props["editSignature"] ? this.content : undefined);
        this.content = props["content"] || this.content;
        assert.notEqual(this.content, this.originalContent, "Content and original content can't be equal to each other");
        this.editSignature = parseJsonIfString(props["editSignature"]);
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
        return {
            ...this.toJSONIpfs(),
            ...this.toJSONCommentUpdate(),
            cid: this.cid,
            originalContent: this.originalContent
        };
    }

    toJSONIpfs() {
        return {
            ...this.toJSONSkeleton(),
            previousCid: this.previousCid,
            ipnsName: this.ipnsName,
            postCid: this.postCid,
            depth: this.depth
        };
    }

    toJSONSkeleton() {
        return {
            ...super.toJSONSkeleton(),
            content: this.content,
            parentCid: this.parentCid
        };
    }

    toJSONForDb(challengeRequestId) {
        const json = this.toJSON();
        ["replyCount", "upvoteCount", "downvoteCount", "replies", "author"].forEach((key) => delete json[key]);
        json["authorAddress"] = this?.author?.address;
        json["challengeRequestId"] = challengeRequestId;
        json["ipnsKeyName"] = this.ipnsKeyName;
        json["signature"] = JSON.stringify(this.signature);
        return removeKeysWithUndefinedValues(json);
    }

    toJSONCommentUpdate() {
        return {
            replyCount: this.replyCount,
            upvoteCount: this.upvoteCount,
            downvoteCount: this.downvoteCount,
            replies: this.replies,
            ...(this.originalContent ? { content: this.content } : undefined), // Only include content if content has been changed through commentEdit
            updatedAt: this.updatedAt,
            editSignature: this.editSignature,
            editTimestamp: this.editTimestamp,
            editReason: this.editReason,
            deleted: this.deleted,
            spoiler: this.spoiler,
            pinned: this.pinned,
            locked: this.locked,
            removed: this.removed,
            moderatorReason: this.moderatorReason
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
        if (sortedReplies)
            this.replies = new Pages({
                // @ts-ignore
                pages: { [REPLIES_SORT_TYPES.TOP_ALL.type]: sortedReplies[REPLIES_SORT_TYPES.TOP_ALL.type] },
                pageCids: sortedRepliesCids,
                subplebbit: this.subplebbit
            });
    }

    async updateOnce() {
        let res;
        try {
            res = await loadIpnsAsJson(this.ipnsName, this.subplebbit.plebbit);
        } catch (e) {
            debug(`Failed to load comment (${this.cid}) IPNS (${this.ipnsName}) due to error = ${e.message}`);
        }
        if (!res) debug(`Comment (${this.cid}) IPNS (${this.ipnsName}) is not pointing to any file`);
        else {
            if (res.updatedAt !== this.emittedAt) {
                debug(`Comment (${this.cid}) IPNS (${this.ipnsName}) received a new update. Emitting an update event...`);
                this.emittedAt = res.updatedAt;
                this._initCommentUpdate(res);
                this.emit("update", this);
            } else {
                debug(`Comment (${this.cid}) IPNS (${this.ipnsName}) has no new update`);
                this._initCommentUpdate(res);
            }
            return this;
        }
    }

    update(updateIntervalMs = DEFAULT_UPDATE_INTERVAL_MS) {
        assert(this.ipnsName, "Comment need to have ipnsName field to poll updates");
        debug(`Starting to poll updates for comment (${this.cid}) IPNS (${this.ipnsName}) every ${updateIntervalMs} milliseconds`);
        if (this._updateInterval) clearInterval(this._updateInterval);
        this._updateInterval = setInterval(this.updateOnce.bind(this), updateIntervalMs);
        return this.updateOnce();
    }

    stop() {
        clearInterval(this._updateInterval);
    }

    async edit(commentUpdateOptions) {
        assert(this.ipnsKeyName, "You need to have commentUpdate");
        this._initCommentUpdate(commentUpdateOptions);
        const file = await this.subplebbit.plebbit.ipfsClient.add(JSON.stringify(this.toJSONCommentUpdate()));
        debug(`Added comment (${this.cid}) IPNS (${this.ipnsName}) to ipfs, cid is ${file.path}`);
        await this.subplebbit.plebbit.ipfsClient.name.publish(file["cid"], {
            lifetime: "72h",
            key: this.ipnsKeyName,
            allowOffline: true
        });
        debug(`Linked comment (${this.cid}) ipns name(${this.ipnsName}) to ipfs file (${file.path})`);
    }
}

export class CommentEdit extends Comment {
    commentCid?: string;

    _initProps(props) {
        super._initProps(props);
        this.commentCid = props["commentCid"];
    }

    toJSON() {
        return { ...super.toJSON(), commentCid: this.commentCid };
    }

    toJSONForDb(challengeRequestId) {
        const json = super.toJSONForDb(challengeRequestId);
        ["authorAddress", "challengeRequestId", "ipnsKeyName", "signature", "commentCid"].forEach((key) => delete json[key]);
        json["cid"] = this.commentCid;
        return removeKeysWithUndefinedValues(json);
    }
}
