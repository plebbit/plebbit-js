import Post from "./Post.js";
import {create as createIpfsClient} from "ipfs-http-client";
import last from "it-last";

class Subplebbit {
    constructor(props) {
        this.#initSubplebbit(props);
    }

    #initSubplebbit(newProps) {
        const oldProps = this.#toJSONInternal();
        const mergedProps = {...oldProps, ...newProps};
        this.title = mergedProps["title"];
        this.description = mergedProps["description"];
        this.moderatorsIpnsNames = mergedProps["moderatorsIpnsNames"];
        this.latestPostCid = mergedProps["latestPostCid"];
        this.preloadedPosts = mergedProps["preloadedPosts"]?.map(post => new Post(post));
        this.setIpfsGatewayUrl(mergedProps["ipfsGatewayUrl"]);
        this.setIpfsApiUrl(mergedProps["ipfsApiUrl"]);
        this.setIpnsKey(mergedProps["ipnsKeyId"], mergedProps["ipnsKeyName"]);
    }

    setIpnsKey(newIpnsKeyId, newIpnsKeyName) {
        this.pubsubTopic = this.ipnsKeyId = newIpnsKeyId;
        this.ipnsKeyName = newIpnsKeyName;
    }

    setIpfsGatewayUrl(newGatewayUrl) {
        this.ipfsGatewayUrl = newGatewayUrl;
    }

    setIpfsApiUrl(newApiUrl) {
        this.ipfsApiUrl = newApiUrl;
        this.ipfsClient = createIpfsClient(newApiUrl);
    }

    publishAsNewSubplebbit() {
        // TODO Add a check for key existence
        return new Promise((resolve, reject) => {
            this.ipfsClient.key.gen(this.title).then(ipnsKey => {
                // TODO add to db
                this.update({"ipnsKeyId": ipnsKey["id"], "ipnsKeyName": ipnsKey["name"]}).then(resolve).catch(reject)
            }).catch(reject);
        });
    }

    #toJSONInternal() {
        return {
            ...this.toJSON(),
            "ipnsKeyName": this.ipnsKeyName,
            "ipfsGatewayUrl": this.ipfsGatewayUrl,
            "ipfsApiUrl": this.ipfsApiUrl
        };

    }

    toJSON() {
        return {
            "title": this.title, "description": this.description,
            "moderatorsIpnsNames": this.moderatorsIpnsNames, "latestPostCid": this.latestPostCid,
            "preloadedPosts": this.preloadedPosts, "pubsubTopic": this.pubsubTopic, "ipnsKeyId": this.ipnsKeyId
        };
    }

    async update(newSubplebbitOptions) {
        this.#initSubplebbit(newSubplebbitOptions);
        const subplebbitWithNewContent = JSON.stringify(this);
        return new Promise((resolve, reject) => {
            this.ipfsClient.add(subplebbitWithNewContent).then(file => {
                this.ipfsClient.name.publish(file["cid"], {
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
        const ipfsPath = (await last(this.ipfsClient.name.resolve(this.ipnsKeyId)));
        await this.ipfsClient.pin.rm(ipfsPath);
        await this.ipfsClient.key.rm(this.ipnsKeyName);
    }


}

export default Subplebbit;