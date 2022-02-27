import Comment from "./Comment.js";
import Post from "./Post.js";
import Subplebbit from "./Subplebbit.js";
import {loadIpfsFileAsJson, loadIpnsAsJson} from "./Util.js";
import PlebbitCore from "./PlebbitCore.js";

class Plebbit extends PlebbitCore {

    async getSubplebbit(subplebbitAddress) {
        if (!subplebbitAddress.includes("/ipns/"))
            subplebbitAddress = `/ipns/${subplebbitAddress}`;
        return new Promise(async (resolve, reject) => {
            loadIpnsAsJson(subplebbitAddress, this.ipfsClient)
                .then(jsonFile => resolve(new Subplebbit(jsonFile, this.ipfsClient, null, null)))
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
}

export default Plebbit;