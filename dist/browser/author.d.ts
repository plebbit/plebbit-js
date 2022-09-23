import { AuthorDbType, AuthorType, Flair, Nft, Wallet } from "./types";
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
    constructor(props: AuthorType);
    toJSON(): AuthorType;
    toJSONForDb(): AuthorDbType;
}
export default Author;
