import assert from "assert";
import {loadIpnsAsJson, parseJsonIfString, removeKeysWithUndefinedValues} from "./Util.js";
import Publication from "./Publication.js";
import Debug from "debug";
import {Pages} from "./Pages.js";

const debug = Debug("plebbit-js:Comment");

const DEFAULT_UPDATE_INTERVAL_MS = 60000; // One minute

export class Comment extends Publication {

    _initProps(props) {
        super._initProps(props);
        this.postCid = props["postCid"];
        this.cid = props["cid"];
        this.parentCid = props["parentCid"];
        this.content = props["content"];
        this.ipnsName = props["ipnsName"]; // each post needs its own IPNS record for its mutable data like edits, vote counts, comments
        this.ipnsKeyName = props["ipnsKeyName"];
        this.depth = props["depth"];
        this.setPreviousCid(props["previousCid"]);
        // CommentUpdate props
        this._initCommentUpdate(props);
    }

    _initCommentUpdate(props) {
        this.upvoteCount = props["upvoteCount"];
        this.downvoteCount = props["downvoteCount"];
        this.replyCount = props["replyCount"];
        this.updatedAt = props["updatedAt"];
        this.replies = props["replies"] ? new Pages({...props["replies"], "plebbit": this.subplebbit.plebbit}) : undefined;
        // Comment Edit props
        this.content = props["content"] || this.content;
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
            "cid": this.cid
        };
    };

    toJSONIpfs() {
        return {
            ...this.toJSONSkeleton(),
            "previousCid": this.previousCid,
            "ipnsName": this.ipnsName,
            "postCid": this.postCid,
            "depth": this.depth
        };
    }


    toJSONSkeleton() {
        return {
            ...(super.toJSONSkeleton()),
            "content": this.content,
            "parentCid": this.parentCid
        }
    }

    toJSONForDb(challengeRequestId) {
        const json = this.toJSON();
        ["replyCount", "upvoteCount", "downvoteCount", "replies", "author"].forEach(key => delete json[key]);
        json["authorAddress"] = this?.author?.address;
        json["challengeRequestId"] = challengeRequestId;
        json["ipnsKeyName"] = this.ipnsKeyName;
        json["signature"] = JSON.stringify(this.signature);
        return removeKeysWithUndefinedValues(json);
    }

    toJSONCommentUpdate() {
        return {
            "replyCount": this.replyCount,
            "upvoteCount": this.upvoteCount,
            "downvoteCount": this.downvoteCount,
            "replies": this.replies,
            "content": this.content,
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

    async #updateOnce() {
        return new Promise(async (resolve, reject) => {
            if (!this.ipnsName) {
                resolve(undefined);
                debug(`Comment (${this.cid}) has no IPNS name`);
                return;
            }
            loadIpnsAsJson(this.ipnsName, this.subplebbit.plebbit.ipfsClient).then(res => {
                    if (!res) {
                        resolve("ipnsName is not pointing to any IPFS file yet");
                        debug(`IPNS (${this.ipnsName}) is not pointing to any file`);
                    } else {
                        if (res.updatedAt !== this.emittedAt) {
                            this.emittedAt = res.updatedAt;
                            this._initCommentUpdate(res);
                            this.emit("update", this);
                        }
                        this._initCommentUpdate(res);


                        resolve(this);
                    }
                }
            ).catch(err => resolve(undefined))
        });
    }

    update(updateIntervalMs = DEFAULT_UPDATE_INTERVAL_MS) {
        debug(`Starting to poll updates for comment (${this.cid}) IPNS (${this.ipnsName}) every ${updateIntervalMs} milliseconds`)
        if (this._updateInterval)
            clearInterval(this._updateInterval);
        this._updateInterval = setInterval(this.#updateOnce.bind(this), updateIntervalMs);
        return this.#updateOnce();
    }

    stop() {
        clearInterval(this._updateInterval);
    }

    async edit(commentUpdateOptions) {
        assert(this.ipnsKeyName, "You need to have commentUpdate");
        return new Promise(async (resolve, reject) => {
            this._initCommentUpdate(commentUpdateOptions);
            this.subplebbit.plebbit.ipfsClient.add(JSON.stringify(this.toJSONCommentUpdate())).then(file => {
                this.subplebbit.plebbit.ipfsClient.name.publish(file["cid"], {
                    "lifetime": "72h",
                    "key": this.ipnsKeyName
                }).then(() => {
                    debug(`Comment (${this.cid}) IPNS (${this.ipnsName}) has been updated`);
                    resolve();
                }).catch(reject);
            }).catch(reject);
        });
    }
}

export class CommentEdit extends Comment {

    _initProps(props) {
        super._initProps(props);
        this.commentCid = props["commentCid"];
    }

    toJSON() {
        return {...super.toJSON(), "commentCid": this.commentCid};
    }

    toJSONForDb(challengeRequestId) {
        const json = super.toJSONForDb(challengeRequestId);
        ["authorAddress", "challengeRequestId", "ipnsKeyName", "signature", "commentCid"].forEach(key => delete json[key]);
        json["cid"] = this.commentCid;
        return removeKeysWithUndefinedValues(json);
    }
}
