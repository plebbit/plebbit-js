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
    constructor(props, plebbit, subplebbit) {
        // Publication
        super(plebbit, subplebbit);
        this.author = new Author(props["author"]);
        this.timestamp = props["timestamp"];
        this.signature = props["signature"];

        this.subplebbitIpnsKeyId = props["subplebbitIpnsKeyId"] || subplebbit?.ipnsKeyId;


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
            "author": this.author,
            "content": this.content,
            "timestamp": this.timestamp,
            "signature": this.signature,
            "subplebbitIpnsKeyId": this.subplebbitIpnsKeyId || this.subplebbit?.ipnsKeyId,
            "parentCommentCid": this.parentCommentCid?.toString()
        }
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
            this.plebbit.getPostOrComment(this.parentCommentCid || this.postCid).then(res => {
                this.parent = res;
                resolve(this.parent);
            }).catch(reject);
        });
    }

    async fetchCommentIpns() {
        return new Promise(async (resolve, reject) => {
            loadIpnsAsJson(this.commentIpnsKeyId, this.plebbit.ipfsClient).then(res => {
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
            this.plebbit.ipfsClient.add(JSON.stringify(this.commentIpns)).then(file => {
                this.plebbit.ipfsClient.name.publish(file["cid"], {
                    "lifetime": "5h",
                    "key": this.commentIpnsKeyName
                }).then(resolve).catch(reject);
            }).catch(reject);
        });
    }
}

export {CommentIPNS};
export default Comment;