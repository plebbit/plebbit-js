import Publication from "./publication";
import { PublicationTypeName, VotePubsubMessage, VotesTableRowInsert, VoteType } from "./types";
import { Plebbit } from "./plebbit";
declare class Vote extends Publication implements VoteType {
    commentCid: string;
    vote: 1 | 0 | -1;
    constructor(props: VoteType, plebbit: Plebbit);
    toJSONPubsubMessagePublication(): VotePubsubMessage;
    toJSONIpfs(): VotePubsubMessage;
    toJSON(): VotePubsubMessage;
    getType(): PublicationTypeName;
    toJSONForDb(challengeRequestId: string): VotesTableRowInsert;
    private _validateSignature;
    publish(): Promise<void>;
}
export default Vote;
