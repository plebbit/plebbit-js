import Publication from "./publication";
import { PublicationTypeName, VoteType } from "./types";
declare class Vote extends Publication implements VoteType {
    commentCid: string;
    vote: 1 | 0 | -1;
    constructor(props: VoteType, subplebbit: any);
    toJSON(): VoteType;
    getType(): PublicationTypeName;
    toJSONForDb(challengeRequestId: string): VoteType;
    publish(userOptions: any): Promise<void>;
}
export default Vote;
