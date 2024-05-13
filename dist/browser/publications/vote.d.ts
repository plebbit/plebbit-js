import Publication from "./publication.js";
import { DecryptedChallengeRequestVote, LocalVoteOptions, PublicationTypeName, VotePubsubMessage, VoteTypeJson, VotesTableRowInsert } from "../types.js";
import { Plebbit } from "../plebbit.js";
declare class Vote extends Publication {
    commentCid: string;
    vote: 1 | 0 | -1;
    constructor(plebbit: Plebbit);
    _initLocalProps(props: LocalVoteOptions): void;
    _initRemoteProps(props: VotePubsubMessage): void;
    _initChallengeRequestProps(props: DecryptedChallengeRequestVote): void;
    toJSONPubsubMessagePublication(): VotePubsubMessage;
    toJSON(): VoteTypeJson;
    getType(): PublicationTypeName;
    toJSONForDb(authorSignerAddress: string): VotesTableRowInsert;
    private _validateSignature;
    publish(): Promise<void>;
}
export default Vote;
