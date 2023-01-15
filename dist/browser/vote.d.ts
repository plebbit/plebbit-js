import Publication from "./publication";
import { PublicationTypeName, VoteForDbType, VoteType } from "./types";
import { Plebbit } from "./plebbit";
declare class Vote extends Publication implements VoteType {
    commentCid: string;
    vote: 1 | 0 | -1;
    constructor(props: VoteType, plebbit: Plebbit);
    toJSONSkeleton(): VoteType;
    toJSON(): VoteType;
    getType(): PublicationTypeName;
    toJSONForDb(challengeRequestId: string): VoteForDbType;
    publish(): Promise<void>;
}
export default Vote;
