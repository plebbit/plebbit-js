import Publication from "./publication";
import { PublicationTypeName, VotePubsubMessage, VotesTableRowInsert, VoteType } from "./types";
import { Plebbit } from "./plebbit";
import { ChallengeRequestMessage } from "./challenge";
declare class Vote extends Publication implements VoteType {
    commentCid: string;
    vote: 1 | 0 | -1;
    constructor(props: VoteType, plebbit: Plebbit);
    toJSONPubsubMessagePublication(): VotePubsubMessage;
    toJSON(): VotePubsubMessage;
    getType(): PublicationTypeName;
    toJSONForDb(challengeRequestId: ChallengeRequestMessage["challengeRequestId"]): VotesTableRowInsert;
    private _validateSignature;
    publish(): Promise<void>;
}
export default Vote;
