import { AuthorType, Flair, Nft, Wallet } from "./types";
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
    toJSONForDb(): {
        address: string;
        banExpiresAt: number;
        flair: Flair;
    };
}
export default Author;
