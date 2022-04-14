import Comment, {CommentEdit} from "./Comment.js";
import Post from "./Post.js";
import {Subplebbit} from "./Subplebbit.js";
import {loadIpfsFileAsJson, loadIpnsAsJson} from "./Util.js";
import * as path from "path";
import Vote from "./Vote.js";
import {create as createIpfsClient} from "ipfs-http-client";
import {signPublication, getAddressFromPublicKeyPem, Signer} from "./Signer.js";
import * as crypto from "libp2p-crypto";
import * as jose from "jose";

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

    async #signPublicationIfNeeded(createPublicationOptions){
        let publicationProps;
        if (createPublicationOptions.signature)
            publicationProps = createPublicationOptions;
        else {
            const commentSignature = await signPublication(createPublicationOptions, createPublicationOptions.signer);
            if (!createPublicationOptions.author.address)
                createPublicationOptions.author.address = await getAddressFromPublicKeyPem(commentSignature.publicKey);
            publicationProps = {"signature": commentSignature, ...createPublicationOptions};
        }
        return publicationProps;
    }

    async createComment(createCommentOptions) {
        const commentSubplebbit = await this.getSubplebbit(createCommentOptions.subplebbitAddress); // TODO This should be fetched from cache
        const commentProps = await this.#signPublicationIfNeeded(createCommentOptions);
        if (commentProps.title)
            // Post
            return new Post(commentProps, commentSubplebbit);
        else
            return new Comment(commentProps, commentSubplebbit);
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
        const voteProps = await this.#signPublicationIfNeeded(createVoteOptions);
        return new Vote(voteProps, subplebbit);
    }

    async createCommentEdit(createCommentEditOptions) {
        const commentSubplebbit = await this.getSubplebbit(createCommentEditOptions.subplebbitAddress);
        return new CommentEdit({...createCommentEditOptions}, commentSubplebbit);
    }

    async createSigner(createSignerOptions) {
        if (!createSignerOptions || !createSignerOptions["privateKey"]) {
            const keyPair = await crypto.keys.generateKeyPair('RSA', 2048);
            const privateKey = await keyPair.export('', 'pkcs-8');
            const publicKeyFromJsonWebToken = await jose.importJWK(keyPair._publicKey, 'RSA256');
            const publicKey = await jose.exportSPKI(publicKeyFromJsonWebToken);
            const address = await getAddressFromPublicKeyPem(publicKey);
            return new Signer({"privateKey": privateKey, 'type': 'rsa', 'publicKey': publicKey, "address": address});
        } else if (createSignerOptions["privateKey"] && createSignerOptions.type === 'rsa') {
            const keyPair = await crypto.keys.import(createSignerOptions.privateKey, "");
            const publicKeyFromJsonWebToken = await jose.importJWK(keyPair._publicKey, 'RSA256');
            const publicKeyPem = await jose.exportSPKI(publicKeyFromJsonWebToken);
            const address = await getAddressFromPublicKeyPem(publicKeyPem);
            return new Signer({...createSignerOptions, "publicKey": publicKeyPem, "address": address});

        }

    }
}