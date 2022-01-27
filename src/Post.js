import Author from "./Author.js";
import {fromString as uint8ArrayFromString} from 'uint8arrays/from-string'
import EventEmitter from "events";
import {loadIpnsAsJson} from "./Util.js";
import assert from "assert";
import { sha256 } from 'js-sha256';
class PostIPNS {
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

class Post extends EventEmitter {

    constructor(props, plebbit, subplebbit) {
        super();
        this.author = new Author(props["author"]);
        this.title = props["title"];
        this.content = props["content"];
        this.timestamp = props["timestamp"];
        this.previousPostCid = props["previousPostCid"]; // each post is a linked list
        this.nestedCommentsHelper = props["nestedCommentsHelper"];
        this.cid = props["cid"];
        this.postIpnsId = props["postIpnsId"]; // each post needs its own IPNS record for its mutable data like edits, vote counts, comments
        this.postIpnsName = props["postIpnsName"];
        this.postIpns = props["postIpns"];
        this.signature = props["signature"];
        this.plebbit = plebbit;
        this.subplebbit = subplebbit;
        this.subplebbitIpnsId = props["subplebbitIpnsId"] || subplebbit?.ipnsKeyId;
    }

    setCid(newCid) {
        this.cid = newCid;
    }

    setSubplebbit(newSubplebbit) {
        this.subplebbit = newSubplebbit;
    }

    setPlebbit(newPlebbit) {
        this.plebbit = newPlebbit;
    }

    setPreviousPostCid(previousPostCid) {
        this.previousPostCid = previousPostCid;
    }

    toJSON() {
        return {
            "author": this.author,
            "title": this.title,
            "content": this.content,
            "timestamp": this.timestamp,
            "previousPostCid": this.previousPostCid?.toString(),
            "postIpnsId": this.postIpnsId,
            "postIpnsName": this.postIpnsName,
            "nestedCommentsHelper": this.nestedCommentsHelper,
            "cid": this.cid?.toString(),
            "subplebbitIpnsId": this.subplebbitIpnsId || this.subplebbit?.ipnsKeyId
        };
    }

    isComment() {
        return this.hasOwnProperty("parentPostOrCommentCid");
    }

    isPost() {
        return !this.isComment();
    }

    async publish() {
        // TODO check whether post has been added before
        // Generate new ipns key
        // Use that key to generate post IPNS
        // update post IPNS
        // Publish final Post result over pubsub to be processed by subplebbit owner node
        assert(!this.postIpnsId && !this.postIpnsName, "This post has been posted before");
        const keyName = sha256(JSON.stringify(this));
        const ipnsKey = await this.plebbit.ipfsClient.key.gen(keyName);
        this.postIpnsId = ipnsKey["id"];
        this.postIpnsName = ipnsKey["name"];
        await this.updatePostIpns(new PostIPNS({}));
        const postEncoded = uint8ArrayFromString(JSON.stringify(this));
        await this.plebbit.ipfsClient.pubsub.publish(this.subplebbit.pubsubTopic, postEncoded);

    }

    async fetchPostIpns(){
        return new Promise(async (resolve, reject) => {
            loadIpnsAsJson(this.postIpnsId, this.plebbit.ipfsClient).then(res => {
                    this.postIpns = new PostIPNS(res);
                    resolve(this.postIpns);
                }
            ).catch(reject)
        });
    }

    async updatePostIpns(newPostIpns) {
        assert(this.postIpnsName && this.postIpnsId, "You need to have post ipns");
        this.postIpns = newPostIpns;
        return new Promise(async (resolve, reject) => {
            this.plebbit.ipfsClient.add(JSON.stringify(this.postIpns)).then(file => {
                this.plebbit.ipfsClient.name.publish(file["cid"], {
                    "lifetime": "5h",
                    "key": this.postIpnsName
                }).then(resolve).catch(reject);
            }).catch(reject);
        });
    }
}

export {PostIPNS};
export default Post;