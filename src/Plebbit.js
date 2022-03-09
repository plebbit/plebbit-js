import Comment from "./Comment.js";
import Post from "./Post.js";
import {Subplebbit} from "./Subplebbit.js";
import {loadIpfsFileAsJson, loadIpnsAsJson} from "./Util.js";
import PlebbitCore from "./PlebbitCore.js";
import {create as createIpfsClient} from "ipfs-http-client";

export class Plebbit extends PlebbitCore {

    async getSubplebbit(subplebbitAddress, subplebbitProps = {}) {
        if (!subplebbitAddress.includes("/ipns/"))
            subplebbitAddress = `/ipns/${subplebbitAddress}`;
        return new Promise(async (resolve, reject) => {
            loadIpnsAsJson(subplebbitAddress, this.ipfsClient)
                .then(jsonFile => resolve(new Subplebbit({...jsonFile, ...subplebbitProps}, this.ipfsClient)))
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

    async createSubplebbit(subplebbitOptions, ipfsClient = null) {
        ipfsClient = ipfsClient || createIpfsClient(options["ipfsApiUrl"]) || this.ipfsClient;

        if (subplebbitOptions["subplebbitAddress"]) {
            // Subplebbit already exists, just load it
            const localIpnsKeys = await ipfsClient.key.list();
            const ipnsKeyName = localIpnsKeys.filter(key => key["id"] === subplebbitOptions["subplebbitAddress"])[0]?.name;
            return this.getSubplebbit(subplebbitOptions["subplebbitAddress"], {
                ...subplebbitOptions,
                "ipnsKeyName": ipnsKeyName
            });
        } else
            return new Subplebbit(subplebbitOptions, ipfsClient);
    }
}