import Author from "./author";
import Publication from "./publication";

declare class Vote extends Publication {
    commentCid: string;
    vote: number;

    constructor(props: any, subplebbit: any);

    toJSON(): {
        author: Author;
        timestamp: number;
        signature: string;
        commentCid: string;
        vote: number;
        subplebbitAddress: string;
    };

    toJSONForDb(challengeRequestId: any): {
        author: Author;
        timestamp: number;
        signature: string;
        commentCid: string;
        vote: number;
        subplebbitAddress: string;
    };
}

export default Vote;
