import fetch from 'node-fetch';
import Subplebbit from "./Subplebbit.js";
import Post from "./Post.js";
class Plebbit {

    constructor(options) {
        this.ipfsGatewayUrl = options["ipfsGatewayUrl"];
        this.ipfsApiUrl = options["ipfsApiUrl"];
    }

    setIpfsGatewayUrl(newGatewayUrl) {
        this.ipfsGatewayUrl = newGatewayUrl;
    }

    setIpfsApiUrl(newApiUrl) {
        this.ipfsApiUrl = newApiUrl;
    }

    async getPost(postCid) {
        // TODO add verification
        return new Promise((resolve, reject) => {
            const url = `${this.ipfsApiUrl}/api/v0/cat?arg=${postCid}`;
            fetch(url, {method: "POST"}).then(res => res.json())
                .then(res => resolve(new Post(res)))
                .catch(err => reject(err));
        });
    }

    async getSubplebbit(subplebbitIpnsName) {
        return new Promise((resolve, reject) => {
            const resolveNameUrl = `${this.ipfsApiUrl}/api/v0/name/resolve?arg=${subplebbitIpnsName}`;
            fetch(resolveNameUrl, {method: "POST"}).then(res => res.json())
                .then(pathRes => {
                    const ipfsPath = pathRes["Path"].split("/ipfs/")[1];
                    const ipfsSubplebbitUrl = `${this.ipfsApiUrl}/api/v0/cat?arg=${ipfsPath}`;
                    fetch(ipfsSubplebbitUrl, {method: "POST"}).then(res => res.json())
                        .then(res => resolve(new Subplebbit(res)))
                        .catch(err => reject(err));
                }).catch(reject);
        });
    }
}

export default Plebbit;