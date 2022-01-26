import Comment from "./Comment.js";
import Post from "./Post.js";
import Subplebbit from "./Subplebbit.js";
import {create as createIpfsClient} from 'ipfs-http-client';
import {concat as uint8ArrayConcat} from 'uint8arrays/concat';
import {toString as uint8ArrayToString} from 'uint8arrays/to-string';
import all from 'it-all';
import last from 'it-last';

class Plebbit {
    constructor(options) {
        this.ipfsGatewayUrl = options["ipfsGatewayUrl"];
        this.ipfsApiUrl = options["ipfsApiUrl"];
        this.ipfsClient = createIpfsClient(this.ipfsApiUrl);
    }

    setIpfsGatewayUrl(newGatewayUrl) {
        this.ipfsGatewayUrl = newGatewayUrl;
    }

    setIpfsApiUrl(newApiUrl) {
        this.ipfsApiUrl = newApiUrl;
        this.ipfsClient = createIpfsClient(this.ipfsApiUrl);
    }

    async #loadIpfsFileAsJson(cid) {
        return new Promise((resolve, reject) => {
            all(this.ipfsClient.cat(cid))
                .then(rawData => uint8ArrayConcat(rawData))
                .catch(reject)
                .then(data => {
                    const jsonObject = JSON.parse(uint8ArrayToString(data));
                    resolve(jsonObject);
                }).catch(reject);
        });
    }

    async getPost(postCid) {
        // TODO add verification
        return new Promise((resolve, reject) => {
            this.#loadIpfsFileAsJson(postCid)
                .then(async jsonFile => {
                    const subplebbit = await this.getSubplebbit(jsonFile["subplebbitIpnsId"]);
                    resolve(new Post({...jsonFile, "cid": postCid}, this, subplebbit));
                })
                .catch(reject);
        });
    }

    async getSubplebbit(subplebbitIpnsName) {
        if (!subplebbitIpnsName.includes("/ipns/"))
            subplebbitIpnsName = `/ipns/${subplebbitIpnsName}`;
        return new Promise(async (resolve, reject) => {
            const subplebbitCid = await last(this.ipfsClient.name.resolve(subplebbitIpnsName));
            this.#loadIpfsFileAsJson(subplebbitCid)
                .then(jsonFile => resolve(new Subplebbit(jsonFile, this)))
                .catch(reject);
        });
    }

    async getComment(commentCid) {
        return new Promise((resolve, reject) => {
            this.#loadIpfsFileAsJson(commentCid)
                .then(jsonFile => resolve(new Comment(jsonFile)))
                .catch(reject);
        });
    };
}

export default Plebbit;