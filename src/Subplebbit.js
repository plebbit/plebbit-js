import Post from "./Post.js";
import last from "it-last";

class Subplebbit {
    constructor(props, plebbit) {
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
        this.preloadedPosts = mergedProps["preloadedPosts"]?.map(post => new Post(post));
        this.setIpnsKey(mergedProps["ipnsKeyId"], mergedProps["ipnsKeyName"]);
    }

    setIpnsKey(newIpnsKeyId, newIpnsKeyName) {
        this.pubsubTopic = this.ipnsKeyId = newIpnsKeyId;
        this.ipnsKeyName = newIpnsKeyName;
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
            "moderatorsIpnsNames": this.moderatorsIpnsNames, "latestPostCid": this.latestPostCid,
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


}

export default Subplebbit;