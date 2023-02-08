import assert from "assert";
import { AuthorIpfsType, AuthorTypeWithCommentUpdate, Flair, Nft, SubplebbitAuthor, Wallet } from "./types";

class Author implements AuthorTypeWithCommentUpdate {
    address: string;
    previousCommentCid?: string; // linked list of the author's comments
    displayName?: string;
    wallets?: { [chainTicker: string]: Wallet };
    avatar?: Nft;
    flair?: Flair;
    banExpiresAt?: number;
    subplebbit?: SubplebbitAuthor;

    constructor(props: AuthorIpfsType | AuthorTypeWithCommentUpdate) {
        this.address = props.address;
        this.previousCommentCid = props.previousCommentCid;
        this.displayName = props.displayName;
        this.wallets = props.wallets;
        this.avatar = props.avatar;
        this.flair = props.flair;
        this.subplebbit = props["subplebbit"];
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
    toJSONIpfsWithCommentUpdate() {
        assert(this.subplebbit);
        return { ...this.toJSONIpfs(), subplebbit: this.subplebbit };
    }
}

export default Author;
