import Publication from "./publication.js";
import { PublicationTypeName, VotePubsubMessage, VotesTableRowInsert, VoteType } from "./types.js";
import { Plebbit } from "./plebbit.js";
declare class Vote extends Publication implements VoteType {
    commentCid: string;
    vote: 1 | 0 | -1;
    constructor(props: VoteType, plebbit: Plebbit);
    toJSONPubsubMessagePublication(): VotePubsubMessage;
    toJSON(): {
        shortSubplebbitAddress: string;
        author: {
            shortAddress: string;
            address: string;
            previousCommentCid?: string;
            displayName?: string;
            wallets?: {
                [chainTicker: string]: import("./types.js").Wallet;
            };
            avatar?: import("./types.js").Nft;
            flair?: import("./subplebbit/types.js").Flair;
        };
        signature: import("./signer/constants.js").JsonSignature;
        protocolVersion: "1.0.0";
        timestamp: number;
        vote: 0 | 1 | -1;
        subplebbitAddress: string;
        commentCid: string;
    };
    getType(): PublicationTypeName;
    toJSONForDb(): VotesTableRowInsert;
    private _validateSignature;
    publish(): Promise<void>;
}
export default Vote;
