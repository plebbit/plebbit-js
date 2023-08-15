import Publication from "./publication";
import { PublicationTypeName, VotePubsubMessage, VotesTableRowInsert, VoteType } from "./types";
import { Plebbit } from "./plebbit";
import { ChallengeRequestMessage } from "./challenge";
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
                [chainTicker: string]: import("./types").Wallet;
            };
            avatar?: import("./types").Nft;
            flair?: import("./types").Flair;
        };
        signature: import("./signer/constants").JsonSignature;
        vote: 0 | 1 | -1;
        subplebbitAddress: string;
        timestamp: number;
        commentCid: string;
        protocolVersion: "1.0.0";
    };
    getType(): PublicationTypeName;
    toJSONForDb(challengeRequestId: ChallengeRequestMessage["challengeRequestId"]): VotesTableRowInsert;
    private _validateSignature;
    publish(): Promise<void>;
}
export default Vote;
