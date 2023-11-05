import { AuthorIpfsType, AuthorTypeWithCommentUpdate, Nft, SubplebbitAuthor, Wallet } from "./types";
import { Flair } from "./subplebbit/types";
declare class Author implements AuthorTypeWithCommentUpdate {
    address: string;
    previousCommentCid?: string;
    displayName?: string;
    wallets?: {
        [chainTicker: string]: Wallet;
    };
    avatar?: Nft;
    flair?: Flair;
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
