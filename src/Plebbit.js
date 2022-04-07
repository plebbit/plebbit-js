import Comment, {CommentEdit} from "./Comment.js";
import Post from "./Post.js";
import {Subplebbit} from "./Subplebbit.js";
import {loadIpfsFileAsJson, loadIpnsAsJson} from "./Util.js";
import * as path from "path";
import Vote from "./Vote.js";
import {create as createIpfsClient} from "ipfs-http-client";
import http from "http";

export class Plebbit {
    constructor(options) {
        this.ipfsHttpClientOptions = options["ipfsHttpClientOptions"]; // Same as https://github.com/ipfs/js-ipfs/tree/master/packages/ipfs-http-client#options
        this.ipfsClient = createIpfsClient(this.ipfsHttpClientOptions);
        this.dataPath = options["dataPath"] || path.join(process.cwd(), ".plebbit");
    }


    async getSubplebbit(subplebbitAddress, subplebbitProps = {}) {
        if (!subplebbitAddress.includes("/ipns/"))
            subplebbitAddress = `/ipns/${subplebbitAddress}`;
        return new Promise(async (resolve, reject) => {
            loadIpnsAsJson(subplebbitAddress, this.ipfsClient)
                .then(jsonFile => resolve(new Subplebbit({...jsonFile, ...subplebbitProps}, this)))
                .catch(reject);
        });
    }

    async getPostOrComment(cid) {
        return new Promise(async (resolve, reject) => {
            loadIpfsFileAsJson(cid, this.ipfsClient).then(async jsonFile => {
                const subplebbit = await this.getSubplebbit(jsonFile["subplebbitAddress"]);
                if (jsonFile["title"])
                    resolve(new Post({...jsonFile, "postCid": cid, "commentCid": cid}, subplebbit));
                else
                    resolve(new Comment({...jsonFile, "commentCid": cid}, subplebbit));
            }).catch(reject);
        });
    }

    async createComment(createCommentOptions) {
        const commentSubplebbit = await this.getSubplebbit(createCommentOptions.subplebbitAddress);
        if (createCommentOptions.title)
            // Post
            return new Post(createCommentOptions, commentSubplebbit);
        else
            return new Comment(createCommentOptions, commentSubplebbit);
    }

    async createSubplebbit(createSubplebbitOptions) {
        if (createSubplebbitOptions["subplebbitAddress"]) {
            // Subplebbit already exists, just load it
            const localIpnsKeys = await this.ipfsClient.key.list();
            const ipnsKeyName = localIpnsKeys.filter(key => key["id"] === createSubplebbitOptions["subplebbitAddress"])[0]?.name;
            return this.getSubplebbit(createSubplebbitOptions["subplebbitAddress"], {
                ...createSubplebbitOptions,
                "ipnsKeyName": ipnsKeyName
            });
        } else
            return new Subplebbit(createSubplebbitOptions, this);
    }

    async createVote(createVoteOptions) {
        const subplebbit = await this.getSubplebbit(createVoteOptions.subplebbitAddress);
        return new Vote(createVoteOptions, subplebbit);
    }

    async createCommentEdit(createCommentEditOptions) {
        const commentSubplebbit = await this.getSubplebbit(createCommentEditOptions.subplebbitAddress);
        return new CommentEdit({...createCommentEditOptions}, commentSubplebbit);
    }
}