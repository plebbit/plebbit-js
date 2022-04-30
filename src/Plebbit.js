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
    constructor(options) {
        this.ipfsHttpClientOptions = options["ipfsHttpClientOptions"]; // Same as https://github.com/ipfs/js-ipfs/tree/master/packages/ipfs-http-client#options
        this.ipfsClient = createIpfsClient(this.ipfsHttpClientOptions);
        this.dataPath = options["dataPath"] || path.join(process.cwd(), ".plebbit");
    }


    async getSubplebbit(subplebbitAddress, subplebbitProps = {}) {
        if (!subplebbitAddress.includes("/ipns/"))
            subplebbitAddress = `/ipns/${subplebbitAddress}`;
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

    async #signPublicationIfNeeded(createPublicationOptions) {
        let publicationProps;
        if (createPublicationOptions.signer) {
            if (createPublicationOptions.author && !createPublicationOptions.author.address)
                createPublicationOptions.author.address = createPublicationOptions.signer.address;
            const commentSignature = await signPublication(createPublicationOptions, createPublicationOptions.signer);
            publicationProps = {...createPublicationOptions, "signature": commentSignature};
        } else if (!createPublicationOptions.signature)
            throw(`Failed to create a publication since no signature or signer is provided.`);
        else
            publicationProps = createPublicationOptions;
        return publicationProps;
    }

    async createComment(createCommentOptions) {
        const commentSubplebbit = await this.getSubplebbit(createCommentOptions.subplebbitAddress); // TODO This should be fetched from cache
        const tempComment = createCommentOptions.title ? new Post(createCommentOptions, commentSubplebbit) : new Comment(createCommentOptions, commentSubplebbit); // To initialize default properties if needed (i.e.timestamp)
        const commentProps = await this.#signPublicationIfNeeded({...removeKeysWithUndefinedValues(tempComment.toJSON()), ...createCommentOptions});
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
        } else {
            const subplebbit = new Subplebbit(createSubplebbitOptions, this);
            await subplebbit.edit(createSubplebbitOptions);
            return subplebbit;
        }
    }

    async createVote(createVoteOptions) {
        const subplebbit = await this.getSubplebbit(createVoteOptions.subplebbitAddress);
        const tempVote = new Vote(createVoteOptions); // To initialize default properties if needed (i.e.timestamp)
        const voteProps = await this.#signPublicationIfNeeded({...removeKeysWithUndefinedValues(tempVote.toJSON()), ...createVoteOptions});
        return new Vote(voteProps, subplebbit);
    }

    async createCommentEdit(createCommentEditOptions) {
        const commentSubplebbit = await this.getSubplebbit(createCommentEditOptions.subplebbitAddress);

        if (!createCommentEditOptions.signer) // User just wants to instantiate a CommentEdit object, not publish
            return new CommentEdit(createCommentEditOptions, commentSubplebbit);
        if (!createCommentEditOptions.editTimestamp)
            createCommentEditOptions.editTimestamp = timestamp();
        const temp = new CommentEdit({...createCommentEditOptions}, commentSubplebbit);
        const mergedProps = {...temp.toJSON(), ...createCommentEditOptions};
        const commentEditProps = {
            ...mergedProps, "editSignature": await signPublication(mergedProps, createCommentEditOptions.signer)
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