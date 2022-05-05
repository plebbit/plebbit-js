import {Comment, CommentEdit} from "./Comment.js";
import Post from "./Post.js";
import {Subplebbit} from "./Subplebbit.js";
import {loadIpfsFileAsJson, loadIpnsAsJson, removeKeysWithUndefinedValues, timestamp} from "./Util.js";
import * as path from "path";
import Vote from "./Vote.js";
import {create as createIpfsClient} from "ipfs-http-client";
import {getAddressFromPublicKeyPem, Signer, signPublication, verifyPublication} from "./Signer.js";
import * as crypto from "libp2p-crypto";
import * as jose from "jose";
import assert from "assert";

export class Plebbit {
    constructor(options = {}) {
        this.ipfsHttpClientOptions = options["ipfsHttpClientOptions"]; // Same as https://github.com/ipfs/js-ipfs/tree/master/packages/ipfs-http-client#options
        this.ipfsGatewayUrl = this.ipfsHttpClientOptions ? undefined : (options["ipfsGatewayUrl"] || 'https://cloudflare-ipfs.com');
        this.pubsubHttpClientOptions = this.ipfsHttpClientOptions ? undefined : (options["pubsubHttpClientOptions"] || 'https://pubsubprovider.xyz/api/v0');
        this.ipfsClient = createIpfsClient(this.ipfsHttpClientOptions || this.pubsubHttpClientOptions);
        this.dataPath = options["dataPath"] || path.join(process.cwd(), ".plebbit");
    }


    async getSubplebbit(subplebbitAddress, subplebbitProps = {}) {
        const subplebbitJson = await loadIpnsAsJson(subplebbitAddress, this);
        return new Subplebbit({...subplebbitJson, ...subplebbitProps}, this);
    }

    async getComment(cid) {
        const commentJson = await loadIpfsFileAsJson(cid, this);
        const subplebbit = await this.getSubplebbit(commentJson["subplebbitAddress"]);
        const publication = commentJson["title"] ? new Post({
            ...commentJson,
            "postCid": cid,
            "cid": cid
        }, subplebbit) : new Comment({...commentJson, "cid": cid}, subplebbit);
        const [signatureIsVerified, failedVerificationReason] = await verifyPublication(publication);
        assert.equal(signatureIsVerified, true, `Signature of comment/post ${cid} is invalid due to reason=${failedVerificationReason}`);
        return publication;
    }

    async #signPublication(createPublicationOptions) {

        if (createPublicationOptions.author && !createPublicationOptions.author.address)
            createPublicationOptions.author.address = createPublicationOptions.signer.address;
        const commentSignature = await signPublication(createPublicationOptions, createPublicationOptions.signer);
        return {...createPublicationOptions, "signature": commentSignature};

    }

    async createComment(createCommentOptions) {
        const commentSubplebbit = await this.getSubplebbit(createCommentOptions.subplebbitAddress); // TODO This should be fetched from cache
        if (!createCommentOptions.signer)
            return createCommentOptions.title ? new Post(createCommentOptions, commentSubplebbit) : new Comment(createCommentOptions, commentSubplebbit);
        if (!createCommentOptions.timestamp)
            createCommentOptions.timestamp = timestamp();
        const commentProps = await this.#signPublication(createCommentOptions);
        return commentProps.title ? new Post(commentProps, commentSubplebbit) : new Comment(commentProps, commentSubplebbit);
    }

    async createSubplebbit(createSubplebbitOptions) {
        if (createSubplebbitOptions["address"]) {
            // Subplebbit already exists, just load it
            const localIpnsKeys = await this.ipfsClient.key.list();
            const ipnsKeyName = localIpnsKeys.filter(key => key["id"] === createSubplebbitOptions["address"])[0]?.name;
            return this.getSubplebbit(createSubplebbitOptions["address"], {
                ...createSubplebbitOptions,
                "ipnsKeyName": ipnsKeyName
            });
        } else {
            const subplebbit = new Subplebbit(createSubplebbitOptions, this);
            await subplebbit.edit(createSubplebbitOptions);
            return subplebbit;
        }
    }

    async createVote(createVoteOptions) {
        const subplebbit = await this.getSubplebbit(createVoteOptions.subplebbitAddress);
        if (!createVoteOptions.signer)
            return new Vote(createVoteOptions, subplebbit);
        if (!createVoteOptions.timestamp)
            createVoteOptions.timestamp = timestamp();
        const voteProps = await this.#signPublication(createVoteOptions);
        return new Vote(voteProps, subplebbit);
    }

    async createCommentEdit(createCommentEditOptions) {
        const commentSubplebbit = await this.getSubplebbit(createCommentEditOptions.subplebbitAddress);

        if (!createCommentEditOptions.signer) // User just wants to instantiate a CommentEdit object, not publish
            return new CommentEdit(createCommentEditOptions, commentSubplebbit);
        if (!createCommentEditOptions.editTimestamp)
            createCommentEditOptions.editTimestamp = timestamp();
        const commentEditProps = {
            ...createCommentEditOptions,
            "editSignature": await signPublication(createCommentEditOptions, createCommentEditOptions.signer)
        };
        return new CommentEdit(commentEditProps, commentSubplebbit);
    }

    async createSigner(createSignerOptions) {
        if (!createSignerOptions || !createSignerOptions["privateKey"]) {
            const keyPair = await crypto.keys.generateKeyPair('RSA', 2048);
            const privateKey = await keyPair.export('', 'pkcs-8');
            const publicKeyFromJsonWebToken = await jose.importJWK(keyPair._publicKey, 'RSA256');
            const publicKey = await jose.exportSPKI(publicKeyFromJsonWebToken);
            const address = await getAddressFromPublicKeyPem(publicKey);
            const ipfsKey = keyPair.bytes;
            return new Signer({
                "privateKey": privateKey,
                'type': 'rsa',
                'publicKey': publicKey,
                "address": address,
                "ipfsKey": ipfsKey
            });
        } else if (createSignerOptions["privateKey"] && createSignerOptions.type === 'rsa') {
            const keyPair = await crypto.keys.import(createSignerOptions.privateKey, "");
            const publicKeyFromJsonWebToken = await jose.importJWK(keyPair._publicKey, 'RSA256');
            const publicKeyPem = await jose.exportSPKI(publicKeyFromJsonWebToken);
            const address = await getAddressFromPublicKeyPem(publicKeyPem);
            const ipfsKey = keyPair.bytes;
            return new Signer({
                ...createSignerOptions,
                "publicKey": publicKeyPem,
                "address": address,
                "ipfsKey": ipfsKey
            });

        }

    }
}