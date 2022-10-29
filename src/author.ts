import { AuthorDbType, AuthorType, Flair, Nft, SubplebbitAuthor, Wallet } from "./types";

class Author implements AuthorType {
    address: string;
    previousCommentCid?: string; // linked list of the author's comments
    displayName?: string;
    wallets?: { [chainTicker: string]: Wallet };
    avatar?: Nft;
    flair?: Flair;
    banExpiresAt?: number;
    subplebbit?: SubplebbitAuthor;

    constructor(props: AuthorType) {
        this.address = props.address;
        this.previousCommentCid = props.previousCommentCid;
        this.displayName = props.displayName;
        this.wallets = props.wallets;
        this.avatar = props.avatar;
        this.flair = props.flair;
        this.banExpiresAt = props.banExpiresAt;
        this.subplebbit = props.subplebbit;
    }

    toJSON(): AuthorType {
        return {
            address: this.address,
            previousCommentCid: this.previousCommentCid,
            displayName: this.displayName,
            wallets: this.wallets,
            avatar: this.avatar,
            flair: this.flair,
            banExpiresAt: this.banExpiresAt,
            subplebbit: this.subplebbit
        };
    }

    toJSONForDb(): AuthorDbType {
        return { address: this.address, banExpiresAt: this.banExpiresAt, flair: this.flair };
    }
}

export default Author;
