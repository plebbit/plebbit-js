import { AuthorPubsubType, AuthorTypeJson, AuthorTypeWithCommentUpdate } from "../types.js";
import { hideClassPrivateProps, shortifyAddress } from "../util.js";
import { SubplebbitAuthor } from "./comment/types.js";

class Author implements AuthorTypeWithCommentUpdate {
    address: AuthorPubsubType["address"];
    previousCommentCid?: AuthorPubsubType["previousCommentCid"]; // linked list of the author's comments
    displayName?: AuthorPubsubType["displayName"];
    wallets?: AuthorPubsubType["wallets"];
    avatar?: AuthorPubsubType["avatar"];
    flair?: AuthorPubsubType["flair"];
    subplebbit?: SubplebbitAuthor;
    shortAddress: string; // not part of ipfs

    constructor(props: AuthorPubsubType | AuthorTypeWithCommentUpdate) {
        this.address = props.address;
        this.previousCommentCid = props.previousCommentCid;
        this.displayName = props.displayName;
        this.wallets = props.wallets;
        this.avatar = props.avatar;
        this.flair = props.flair;
        this.subplebbit = "subplebbit" in props ? props.subplebbit : undefined;
        this.shortAddress = shortifyAddress(this.address);
        hideClassPrivateProps(this);
    }

    toJSON(): AuthorTypeJson {
        return {
            ...(this.subplebbit ? this.toJSONIpfsWithCommentUpdate() : this.toJSONIpfs()),
            shortAddress: this.shortAddress
        };
    }

    // TODO This function should be changed to toJSONPubsubMessagePublication
    toJSONIpfs(): AuthorPubsubType {
        return {
            address: this.address,
            previousCommentCid: this.previousCommentCid,
            displayName: this.displayName,
            wallets: this.wallets,
            avatar: this.avatar,
            flair: this.flair
        };
    }

    // TODO change name of this to indicate mandatory subplebbit field
    toJSONIpfsWithCommentUpdate(): AuthorTypeWithCommentUpdate {
        if (!this.subplebbit) throw Error("Calling author.toJSONIpfsWithCommentUpdate() without defining author.subplebbit");
        return { ...this.toJSONIpfs(), subplebbit: this.subplebbit };
    }
}

export default Author;
