import Comment from "./Comment.js";
import Post from "./Post.js";
import Subplebbit from "./Subplebbit.js";
import {create as createIpfsClient} from 'ipfs-http-client';
import {loadIpfsFileAsJson, loadIpnsAsJson} from "./Util.js";

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

    async getSubplebbit(subplebbitIpnsName) {
        if (!subplebbitIpnsName.includes("/ipns/"))
            subplebbitIpnsName = `/ipns/${subplebbitIpnsName}`;
        return new Promise(async (resolve, reject) => {
            loadIpnsAsJson(subplebbitIpnsName, this.ipfsClient)
                .then(jsonFile => resolve(new Subplebbit(jsonFile, this)))
                .catch(reject);
        });
    }

    async getPostOrComment(cid) {
        return new Promise(async (resolve, reject) => {
            loadIpfsFileAsJson(cid, this.ipfsClient).then(async jsonFile => {
                const subplebbit = await this.getSubplebbit(jsonFile["subplebbitIpnsKeyId"]);
                if (jsonFile["title"])
                    resolve(new Post({...jsonFile, "postCid": cid}, this, subplebbit));
                else
                    resolve(new Comment({...jsonFile, "commentCid": cid}, this, subplebbit));
            }).catch(reject);
        });
    }
}

export default Plebbit;