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
        timestamp: number;
        subplebbitAddress: string;
        protocolVersion: "1.0.0";
        signature: import("./signer/constants.js").JsonSignature;
        vote: 0 | 1 | -1;
        commentCid: string;
    };
    getType(): PublicationTypeName;
    toJSONForDb(authorSignerAddress: string): VotesTableRowInsert;
    private _validateSignature;
    publish(): Promise<void>;
}
export default Vote;
