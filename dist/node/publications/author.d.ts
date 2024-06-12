import { AuthorIpfsType, AuthorTypeJson, AuthorTypeWithCommentUpdate, DecryptedChallengeVerificationMessageTypeWithSubplebbitAuthor, Nft, SubplebbitAuthor, Wallet } from "../types.js";
import { Flair } from "../subplebbit/types.js";
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
    toJSON(): AuthorTypeJson;
    toJSONIpfs(): AuthorIpfsType;
    toJSONAfterChallengeVerification(): NonNullable<DecryptedChallengeVerificationMessageTypeWithSubplebbitAuthor["publication"]>["author"];
    toJSONIpfsWithCommentUpdate(): AuthorTypeWithCommentUpdate;
}
export default Author;
