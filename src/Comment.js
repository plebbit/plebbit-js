import Author from "./Author.js";
import assert from "assert";
import {loadIpnsAsJson} from "./Util.js";
import Publication from "./Publication.js";


class CommentIPNS {
    constructor(props) {
        this.latestCommentCid = props["latestCommentCid"]; // the most recent comment in the linked list of posts
        this.preloadedComments = props["preloadedComments"] || [];
        this.upvoteCount = props["upvoteCount"] || 0;
        this.downvoteCount = props["downvoteCount"] || 0;
        this.sortedComments = props["sortedComments"] || {};
        this.sortedCommentsCids = props["sortedCommentsCids"] || {};
    }

    toJSON() {
        return {
            "latestCommentCid": this.latestCommentCid,
            "preloadedComments": this.preloadedComments,
            "upvoteCount": this.upvoteCount,
            "downvoteCount": this.downvoteCount,
            "sortedComments": this.sortedComments,
            "sortedCommentsCids": this.sortedCommentsCids
        };
    }
}

class Comment extends Publication {
    constructor(props, subplebbit) {
        // Publication
        super(props, subplebbit);
        this.parent = null;
        this._initProps(props);
    }

    _initProps(props) {
        super._initProps(props);
        this.author = new Author(props["author"]);
        this.timestamp = props["timestamp"] || (Date.now() / 1000);
        this.signature = props["signature"] || null;
        this.postCid = props["postCid"];
        this.commentCid = props["commentCid"];
        this.parentCommentCid = props["parentCommentCid"] || null;
        this.content = props["content"];
        this.commentIpnsName = props["commentIpnsName"]; // each post needs its own IPNS record for its mutable data like edits, vote counts, comments
        this.commentIpnsKeyName = props["commentIpnsKeyName"];
        this.commentIpns = props["commentIpns"];
        this.setPreviousCommentCid(props["previousCommentCid"]);
    }

    toJSON() {
        return {
            ...this.toJSONSkeleton(),
            "previousCommentCid": this.previousCommentCid,
            "commentIpnsName": this.commentIpnsName,
            "postCid": this.postCid,
            "commentCid": this.commentCid,
            "commentIpnsKeyName": this.commentIpnsKeyName
        }
    };


    toJSONSkeleton() {
        return {
            ...(super.toJSONSkeleton()),
            "author": this.author,
            "content": this.content,
            "timestamp": this.timestamp,
            "signature": this.signature,
            "parentCommentCid": this.parentCommentCid
        }
    }

    toJSONForDb() {
        const json = this.toJSON();
        delete json.author;
        delete json.challenge;
        json["authorAddress"] = this.author.address;
        json["challengeRequestId"] = this.challenge?.requestId;
        return json;
    }

    setCommentIpnsKey(ipnsKey) {
        // Contains name and id
        this.commentIpnsName = ipnsKey["id"];
        this.commentIpnsKeyName = ipnsKey["name"];
    }

    setPostCid(newPostCid) {
        this.postCid = newPostCid;
    }

    setCommentCid(newCommentCid) {
        this.commentCid = newCommentCid;
    }

    setPreviousCommentCid(newPreviousCommentCid) {
        this.previousCommentCid = newPreviousCommentCid || null;
    }

    async fetchParent() {
        return new Promise(async (resolve, reject) => {
            this.subplebbit.plebbit.getPostOrComment(this.parentCommentCid || this.postCid).then(res => {
                this.parent = res;
                resolve(this.parent);
            }).catch(reject);
        });
    }

    async fetchCommentIpns() {
        return new Promise(async (resolve, reject) => {
            loadIpnsAsJson(this.commentIpnsName, this.subplebbit.ipfsClient).then(res => {
                    this.commentIpns = new CommentIPNS(res);
                    resolve(this.commentIpns);
                }
            ).catch(reject)
        });
    }

    async updateCommentIpns(newCommentIpns) {
        assert(this.commentIpnsKeyName && this.commentIpnsName, "You need to have commentIpns");
        this.commentIpns = newCommentIpns;
        return new Promise(async (resolve, reject) => {
            this.subplebbit.ipfsClient.add(JSON.stringify(this.commentIpns)).then(file => {
                this.subplebbit.ipfsClient.name.publish(file["cid"], {
                    "lifetime": "5h",
                    "key": this.commentIpnsKeyName
                }).then(resolve).catch(reject);
            }).catch(reject);
        });
    }
}

export {Comment, CommentIPNS};
export default Comment;