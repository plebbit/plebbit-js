import assert from "assert";
import { AuthorIpfsType, AuthorTypeWithCommentUpdate, Nft, SubplebbitAuthor, Wallet } from "./types.js";
import { shortifyAddress } from "./util.js";
import { Flair } from "./subplebbit/types.js";

class Author implements AuthorTypeWithCommentUpdate {
    address: string;
    previousCommentCid?: string; // linked list of the author's comments
    displayName?: string;
    wallets?: { [chainTicker: string]: Wallet };
    avatar?: Nft;
    flair?: Flair;
    subplebbit?: SubplebbitAuthor;
    shortAddress: string;

    constructor(props: AuthorIpfsType | AuthorTypeWithCommentUpdate) {
        this.address = props.address;
        this.previousCommentCid = props.previousCommentCid;
        this.displayName = props.displayName;
        this.wallets = props.wallets;
        this.avatar = props.avatar;
        this.flair = props.flair;
        this.subplebbit = props["subplebbit"];
        this.shortAddress = shortifyAddress(this.address);
    }

    toJSON() {
        return {
            ...(this.subplebbit ? this.toJSONIpfsWithCommentUpdate() : this.toJSONIpfs()),
            shortAddress: this.shortAddress
        };
    }

    toJSONIpfs(): AuthorIpfsType {
        return {
            address: this.address,
            previousCommentCid: this.previousCommentCid,
            displayName: this.displayName,
            wallets: this.wallets,
            avatar: this.avatar,
            flair: this.flair
        };
    }
    toJSONIpfsWithCommentUpdate(): AuthorTypeWithCommentUpdate {
        assert(this.subplebbit);
        return { ...this.toJSONIpfs(), subplebbit: this.subplebbit };
    }
}

export default Author;
