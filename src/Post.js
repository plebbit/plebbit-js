import Author from "./Author.js";
import {fromString as uint8ArrayFromString} from 'uint8arrays/from-string'

class Post {

    constructor(props, plebbit, subplebbit) {
        this.author = new Author(props["author"]);
        this.title = props["title"];
        this.content = props["content"];
        this.timestamp = props["timestamp"];
        this.previousPostCid = props["previousPostCid"]; // each post is a linked list
        this.nestedCommentsHelper = props["nestedCommentsHelper"];
        this.cid = props["cid"];
        this.plebbit = plebbit;
        this.subplebbit = subplebbit;
    }

    setCid(newCid) {
        this.cid = newCid;
    }

    setSubplebbit(newSubplebbit){
        this.subplebbit = newSubplebbit;
    }
    setPlebbit(newPlebbit) {
        this.plebbit = newPlebbit;
    }

    setPreviousPostCid(previousPostCid){
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
            "nestedCommentsHelper": this.nestedCommentsHelper,
            "cid": this.cid?.toString(),
            "subplebbitIpnsName": this.subplebbit.ipnsKeyId
        };
    }

    async publish() {
        // Assumes post has not been added to ipfs
        return new Promise(async (resolve, reject) => {
            const postEncoded = uint8ArrayFromString(JSON.stringify(this));
            this.plebbit.ipfsClient.pubsub.publish(this.subplebbit.pubsubTopic, postEncoded).then(resolve).catch(reject);
        });
    }

}

export default Post;