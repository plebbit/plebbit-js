import Author from "./Author.js";
import assert from "assert";
import {loadIpnsAsJson, parseJsonIfString, timestamp} from "./Util.js";
import Publication from "./Publication.js";
import Debug from "debug";

const debug = Debug("plebbit-js:Comment");

const DEFAULT_UPDATE_INTERVAL_MS = 60000; // One minute

class Comment extends Publication {
    constructor(props, subplebbit) {
        // Publication
        super(props, subplebbit);
        this.parent = undefined;
    }

    _initProps(props) {
        super._initProps(props);
        this.author = new Author(props["author"]);
        this.timestamp = props["timestamp"] || timestamp();
        this.signature = props["signature"];
        this.postCid = props["postCid"];
        this.commentCid = props["commentCid"];
        this.parentCid = props["parentCid"];
        this.content = props["content"];
        this.ipnsName = props["ipnsName"]; // each post needs its own IPNS record for its mutable data like edits, vote counts, comments
        this.commentIpnsKeyName = props["commentIpnsKeyName"];
        this.depth = props["depth"];
        this.setPreviousCid(props["previousCid"]);
        // CommentUpdate props
        this._initCommentUpdate(props);
    }

    _initCommentUpdate(props) {
        this.editedContent = props["editedContent"]; // the author has edited the comment content
        this.upvoteCount = props["upvoteCount"];
        this.downvoteCount = props["downvoteCount"];
        this.replyCount = props["replyCount"];
        this.updatedAt = props["updatedAt"];
        this.sortedReplies = parseJsonIfString(props["sortedReplies"]);
        this.sortedRepliesCids = parseJsonIfString(props["sortedRepliesCids"]);
    }

    toJSON() {
        return {
            ...this.toJSONIpfs(),
            ...this.toJSONCommentUpdate(),
            "commentCid": this.commentCid
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
            "author": this.author,
            "content": this.content,
            "timestamp": this.timestamp,
            "signature": this.signature,
            "parentCid": this.parentCid
        }
    }

    toJSONForDb(challengeRequestId) {
        const json = this.toJSON();
        [...Object.keys(this.toJSONCommentUpdate()), "author"].forEach(key => delete json[key]);
        json["authorAddress"] = this.author.address;
        json["challengeRequestId"] = challengeRequestId;
        json["commentIpnsKeyName"] = this.commentIpnsKeyName;
        json["editedContent"] = this.editedContent;
        json["updatedAt"] = this.updatedAt;
        return json;
    }

    toJSONCommentUpdate() {
        return {
            "editedContent": this.editedContent,
            "replyCount": this.replyCount,
            "upvoteCount": this.upvoteCount,
            "downvoteCount": this.downvoteCount,
            "sortedReplies": this.sortedReplies,
            "sortedRepliesCids": this.sortedRepliesCids,
            "updatedAt": this.updatedAt
        };
    }

    setCommentIpnsKey(ipnsKey) {
        // Contains name and id
        this.ipnsName = ipnsKey["id"];
        this.commentIpnsKeyName = ipnsKey["name"];
    }

    setPostCid(newPostCid) {
        this.postCid = newPostCid;
    }

    setCommentCid(newCommentCid) {
        this.commentCid = newCommentCid;
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

    async fetchParent() {
        return new Promise(async (resolve, reject) => {
            this.subplebbit.plebbit.getPostOrComment(this.parentCid || this.postCid).then(res => {
                this.parent = res;
                resolve(this.parent);
            }).catch(reject);
        });
    }

    async #updateOnce() {
        return new Promise(async (resolve, reject) => {
            if (!this.ipnsName) {
                resolve(undefined);
                debug(`Comment (${this.commentCid}) has no IPNS name`);
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
        debug(`Starting to poll updates for comment (${this.commentCid}) IPNS (${this.ipnsName}) every ${updateIntervalMs} milliseconds`)
        if (this._updateInterval)
            clearInterval(this._updateInterval);
        this._updateInterval = setInterval(this.#updateOnce.bind(this), updateIntervalMs);
        return this.#updateOnce();
    }

    stop() {
        clearInterval(this._updateInterval);
    }

    async edit(commentUpdateOptions) {
        assert(this.commentIpnsKeyName, "You need to have commentUpdate");
        return new Promise(async (resolve, reject) => {
            this._initCommentUpdate(commentUpdateOptions);
            this.subplebbit.plebbit.ipfsClient.add(JSON.stringify(this.toJSONCommentUpdate())).then(file => {
                this.subplebbit.plebbit.ipfsClient.name.publish(file["cid"], {
                    "lifetime": "72h",
                    "key": this.commentIpnsKeyName
                }).then(() => {
                    debug(`Comment (${this.commentCid}) IPNS (${this.ipnsName}) has been updated`);
                    resolve();
                }).catch(reject);
            }).catch(reject);
        });
    }
}

class CommentEdit extends Comment {

    _initProps(props) {
        super._initProps(props);
        this.editedContent = props["editedContent"];
    }
}

export {Comment, CommentEdit};
export default Comment;