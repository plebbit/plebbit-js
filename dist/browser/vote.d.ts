import Publication from "./publication";
import { CreateVoteOptions } from "./types";
declare class Vote extends Publication implements CreateVoteOptions {
    commentCid: string;
    vote: 1 | 0 | -1;
    constructor(props: CreateVoteOptions, subplebbit: any);
    toJSON(): {
        author: import("./author").default;
        timestamp: number;
        signature: import("./signer").Signature;
        commentCid: string;
        vote: 0 | 1 | -1;
        subplebbitAddress: string;
    };
    toJSONForDb(challengeRequestId: string): {
        author: import("./author").default;
        timestamp: number;
        signature: import("./signer").Signature;
        commentCid: string;
        vote: 0 | 1 | -1;
        subplebbitAddress: string;
    };
    publish(userOptions: any): Promise<void>;
}
export default Vote;
