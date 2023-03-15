import { AuthorIpfsType, AuthorTypeWithCommentUpdate, Flair, Nft, SubplebbitAuthor, Wallet } from "./types";
declare class Author implements AuthorTypeWithCommentUpdate {
    address: string;
    previousCommentCid?: string;
    displayName?: string;
    wallets?: {
        [chainTicker: string]: Wallet;
    };
    avatar?: Nft;
    flair?: Flair;
    banExpiresAt?: number;
    subplebbit?: SubplebbitAuthor;
    shortAddress: string;
    constructor(props: AuthorIpfsType | AuthorTypeWithCommentUpdate);
    toJSON(): {
        shortAddress: string;
        address: string;
        previousCommentCid?: string;
        displayName?: string;
        wallets?: {
            [chainTicker: string]: Wallet;
        };
        avatar?: Nft;
        flair?: Flair;
    };
    toJSONIpfs(): AuthorIpfsType;
    toJSONIpfsWithCommentUpdate(): AuthorTypeWithCommentUpdate;
}
export default Author;
