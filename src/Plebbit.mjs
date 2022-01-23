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
        const plebbit = this;
        return new Promise((resolve, reject) => {
            plebbit.#loadIpfsFileAsJson(postCid)
                .then(jsonFile => resolve(new Post(jsonFile)))
                .catch(reject);
        });
    }

    async getSubplebbit(subplebbitIpnsName) {
        if (!subplebbitIpnsName.includes("/ipns/"))
            subplebbitIpnsName = `/ipns/${subplebbitIpnsName}`;
        const plebbit = this;
        return new Promise(async (resolve, reject) => {
            const subplebbitCid = await last(this.ipfsClient.name.resolve(subplebbitIpnsName));
            plebbit.#loadIpfsFileAsJson(subplebbitCid)
                .then(jsonFile => resolve(new Subplebbit(jsonFile)))
                .catch(reject);
        });
    }

    async getComment(commentCid) {
        const plebbit = this;
        return new Promise((resolve, reject) => {
            plebbit.#loadIpfsFileAsJson(commentCid)
                .then(jsonFile => resolve(new Comment(jsonFile)))
                .catch(reject);
        });
    };
}

export default Plebbit;