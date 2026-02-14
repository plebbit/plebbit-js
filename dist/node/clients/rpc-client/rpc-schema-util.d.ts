export declare const parseRpcCidParam: (params: unknown) => {
    [x: string]: unknown;
    cid: string;
};
export declare const parseRpcSubplebbitAddressParam: (params: unknown) => {
    [x: string]: unknown;
    address: string;
};
export declare const parseRpcAuthorAddressParam: (params: unknown) => {
    [x: string]: unknown;
    address: string;
};
export declare const parseRpcSubplebbitPageParam: (params: unknown) => {
    [x: string]: unknown;
    cid: string;
    subplebbitAddress: string;
    type: "posts" | "modqueue";
    pageMaxSize: number;
};
export declare const parseRpcCommentRepliesPageParam: (params: unknown) => {
    [x: string]: unknown;
    subplebbitAddress: string;
    cid: string;
    pageMaxSize: number;
    commentCid: string;
};
