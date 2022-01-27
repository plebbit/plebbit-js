import Post, {PostIPNS} from "./Post.js";
import Comment from "./Comment.js";
import last from "it-last";
import {toString as uint8ArrayToString} from 'uint8arrays/to-string';
import EventEmitter from "events";

class Subplebbit extends EventEmitter {
    constructor(props, plebbit) {
        super();
        this.#initSubplebbit(props);
        this.plebbit = plebbit;
    }

    #initSubplebbit(newProps) {
        const oldProps = this.#toJSONInternal();
        const mergedProps = {...oldProps, ...newProps};
        this.title = mergedProps["title"];
        this.description = mergedProps["description"];
        this.moderatorsIpnsNames = mergedProps["moderatorsIpnsNames"];
        this.latestPostCid = mergedProps["latestPostCid"];
        this.preloadedPosts = mergedProps["preloadedPosts"] || [];
        this.setIpnsKey(mergedProps["ipnsKeyId"], mergedProps["ipnsKeyName"]);
    }

    setIpnsKey(newIpnsKeyId, newIpnsKeyName) {
        this.pubsubTopic = this.ipnsKeyId = newIpnsKeyId;
        this.ipnsKeyName = newIpnsKeyName;
    }

    setPlebbit(newPlebbit) {
        this.plebbit = newPlebbit;
    }

    publishAsNewSubplebbit() {
        // TODO Add a check for key existence
        return new Promise((resolve, reject) => {
            this.plebbit.ipfsClient.key.gen(this.title).then(ipnsKey => {
                // TODO add to db
                this.update({"ipnsKeyId": ipnsKey["id"], "ipnsKeyName": ipnsKey["name"]}).then(resolve).catch(reject)
            }).catch(reject);
        });
    }

    #toJSONInternal() {
        return {
            ...this.toJSON(),
            "ipnsKeyName": this.ipnsKeyName,
        };
    }

    toJSON() {
        return {
            "title": this.title, "description": this.description,
            "moderatorsIpnsNames": this.moderatorsIpnsNames, "latestPostCid": this.latestPostCid?.toString(),
            "preloadedPosts": this.preloadedPosts, "pubsubTopic": this.pubsubTopic, "ipnsKeyId": this.ipnsKeyId
        };
    }

    async update(newSubplebbitOptions) {
        this.#initSubplebbit(newSubplebbitOptions);
        const subplebbitWithNewContent = JSON.stringify(this);
        return new Promise((resolve, reject) => {
            this.plebbit.ipfsClient.add(subplebbitWithNewContent).then(file => {
                this.plebbit.ipfsClient.name.publish(file["cid"], {
                    "lifetime": "5h", // TODO decide on optimal time later
                    "key": this.ipnsKeyName
                }).then(resolve).catch(reject);
            }).catch(reject);
        });
    }

    async destroy() {
        // For development purposes ONLY
        // Call this only if you know what you're doing
        // rm ipns and ipfs
        const ipfsPath = (await last(this.plebbit.ipfsClient.name.resolve(this.ipnsKeyId)));
        await this.plebbit.ipfsClient.pin.rm(ipfsPath);
        await this.plebbit.ipfsClient.key.rm(this.ipnsKeyName);
    }

    async #updateSubplebbitPosts(post) {
        const newSubplebbitOptions = {
            "preloadedPosts": [post, ...this.preloadedPosts],
            "latestPostCid": post.cid
        }
        await this.update(newSubplebbitOptions);
        this.emit("post", post);
    }

    async #updatePostComments(comment) {
        // TODO Check if comment is already added
        await comment.fetchParentPostOrComment();
        await comment.parentPostOrComment.fetchPostIpns();
        const newPostIpns = new PostIPNS({
            ...comment.parentPostOrComment.postIpns?.toJSON(),
            "latestCommentCid": comment.cid,
            "preloadedComments": [comment, ...comment.parentPostOrComment.postIpns?.preloadedComments],
        });
        await comment.parentPostOrComment.updatePostIpns(newPostIpns);
        this.emit("comment", comment);
    }


    async startPublishing() {
        const processPubsub = async (pubsubMsg) => {
            const msgParsed = JSON.parse(uint8ArrayToString(pubsubMsg["data"]))
            const postOrComment = msgParsed["parentPostOrCommentCid"] ? new Comment(msgParsed, this.plebbit, null) : new Post(msgParsed, this.plebbit, this);
            postOrComment.setSubplebbit(this);
            if (postOrComment.isPost())
                postOrComment.setPreviousPostCid(this.latestPostCid);
            this.plebbit.ipfsClient.add(JSON.stringify(postOrComment)).then(async file => {
                postOrComment.setCid(file["cid"]);
                if (postOrComment.isPost())
                    await this.#updateSubplebbitPosts(postOrComment);
                else
                    await this.#updatePostComments(postOrComment);

            }).catch(err => console.error(`Failed to publish post or comment: ${postOrComment}\nError:${err}`));
        };

        await this.plebbit.ipfsClient.pubsub.subscribe(this.pubsubTopic, processPubsub);
    }

    async stopPublishing() {
        await this.plebbit.ipfsClient.pubsub.unsubscribe(this.pubsubTopic);
        this.removeAllListeners();
    }

}

export default Subplebbit;