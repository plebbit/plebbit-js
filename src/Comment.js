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
    }

    toJSON() {
        return {
            "latestCommentCid": this.latestCommentCid?.toString(), "preloadedComments": this.preloadedComments,
            "upvoteCount": this.upvoteCount, "downvoteCount": this.downvoteCount
        };
    }
}

class Comment extends Publication {
    constructor(props, subplebbit) {
        // Publication
        super(props, subplebbit);
        this.author = new Author(props["author"]);
        this.timestamp = props["timestamp"];
        this.signature = props["signature"];
        this.postCid = props["postCid"];
        this.commentCid = props["commentCid"];
        this.parentCommentCid = props["parentCommentCid"];
        this.content = props["content"];
        this.previousCommentCid = props["previousCommentCid"];

        this.parent = null;

        this.commentIpnsKeyId = props["commentIpnsKeyId"]; // each post needs its own IPNS record for its mutable data like edits, vote counts, comments
        this.commentIpnsKeyName = props["commentIpnsKeyName"];
        this.commentIpns = props["commentIpns"];
    }

    toJSON() {
        return {
            ...this.toJSONSkeleton(),
            "previousCommentCid": this.previousCommentCid?.toString(),
            "commentIpnsKeyId": this.commentIpnsKeyId,
            "commentIpnsKeyName": this.commentIpnsKeyName,
            "postCid": this.postCid?.toString(),
            "commentCid": this.commentCid?.toString(),
        }
    };


    toJSONSkeleton() {
        return {
            ...(super.toJSON()),
            "author": this.author,
            "content": this.content,
            "timestamp": this.timestamp,
            "signature": this.signature,
            "parentCommentCid": this.parentCommentCid?.toString()
        }
    }

    toJSONForDb() {
        const json = this.toJSON();
        delete json.author;
        delete json.commentIpnsKeyId;
        delete json.commentIpnsKeyName;
        delete json.challenge;
        json["authorIpnsName"] = this.author.ipnsName;
        json["commentIpnsName"] = this.commentIpnsKeyId;
        json["challengeRequestId"] = this.challenge?.requestId;
        return json;
    }

    setCommentIpnsKey(ipnsKey) {
        // Contains name and id
        this.commentIpnsKeyId = ipnsKey["id"];
        this.commentIpnsKeyName = ipnsKey["name"];
    }

    setPostCid(newPostCid) {
        this.postCid = newPostCid;
    }

    setCommentCid(newCommentCid) {
        this.commentCid = newCommentCid;
    }

    setPreviousCommentCid(newPreviousCommentCid) {
        this.previousCommentCid = newPreviousCommentCid;
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
            loadIpnsAsJson(this.commentIpnsKeyId, this.subplebbit.ipfsClient).then(res => {
                    this.commentIpns = new CommentIPNS(res);
                    resolve(this.commentIpns);
                }
            ).catch(reject)
        });
    }

    async updateCommentIpns(newCommentIpns) {
        assert(this.commentIpnsKeyName && this.commentIpnsKeyId, "You need to have commentIpns");
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