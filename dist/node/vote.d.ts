import Publication from "./publication";
declare class Vote extends Publication {
    commentCid: string;
    vote: number;
    constructor(props: any, subplebbit: any);
    toJSON(): {
        author: import("./author").default;
        timestamp: number;
        signature: import("./signer").Signature;
        commentCid: string;
        vote: number;
        subplebbitAddress: string;
    };
    toJSONForDb(challengeRequestId: any): {
        author: import("./author").default;
        timestamp: number;
        signature: import("./signer").Signature;
        commentCid: string;
        vote: number;
        subplebbitAddress: string;
    };
    publish(userOptions: any): Promise<void>;
}
export default Vote;
