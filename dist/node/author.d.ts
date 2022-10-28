import { AuthorDbType, AuthorType, Flair, Nft, SubplebbitAuthor, Wallet } from "./types";
declare class Author implements AuthorType {
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
    constructor(props: AuthorType);
    toJSON(): AuthorType;
    toJSONForDb(): AuthorDbType;
}
export default Author;
