/// <reference types="node" />
import { Comment } from "../comment.js";
import { Plebbit } from "../plebbit.js";
import Vote from "../vote.js";
import { RemoteSubplebbit } from "../subplebbit/remote-subplebbit.js";
import { CreateCommentOptions, PlebbitOptions, PostType, VoteType } from "../types.js";
import { SignerType } from "../signer/constants.js";
import Publication from "../publication.js";
import { BasePages } from "../pages.js";
import { CreateSubplebbitOptions } from "../subplebbit/types.js";
import { EventEmitter } from "events";
export declare function generateMockPost(subplebbitAddress: string, plebbit: Plebbit, randomTimestamp?: boolean, postProps?: Partial<CreateCommentOptions | PostType>): Promise<Comment>;
export declare function generateMockComment(parentPostOrComment: Comment, plebbit: Plebbit, randomTimestamp?: boolean, commentProps?: Partial<CreateCommentOptions>): Promise<Comment>;
export declare function generateMockVote(parentPostOrComment: Comment, vote: -1 | 0 | 1, plebbit: Plebbit, signer?: SignerType): Promise<Vote>;
export declare function loadAllPages(pageCid: string, pagesInstance: BasePages): Promise<Comment[]>;
type TestServerSubs = {
    onlineSub: string;
    ensSub: string;
    mainSub: string;
    mathSub: string;
};
export declare function startOnlineSubplebbit(): Promise<import("../runtime/browser/subplebbit/local-subplebbit.js").LocalSubplebbit | import("../subplebbit/rpc-local-subplebbit.js").RpcLocalSubplebbit | import("../subplebbit/rpc-remote-subplebbit.js").RpcRemoteSubplebbit | RemoteSubplebbit>;
export declare function startSubplebbits(props: {
    signers: SignerType[];
    noData: boolean;
    dataPath: string;
    votesPerCommentToPublish: number;
    numOfCommentsToPublish: number;
    numOfPostsToPublish: number;
    startOnlineSub: boolean;
}): Promise<TestServerSubs>;
export declare function fetchTestServerSubs(): Promise<TestServerSubs>;
export declare function mockDefaultOptionsForNodeAndBrowserTests(): {
    plebbitRpcClientsOptions: string[];
    ipfsHttpClientsOptions?: undefined;
    pubsubHttpClientsOptions?: undefined;
} | {
    ipfsHttpClientsOptions: string[];
    pubsubHttpClientsOptions: string[];
    plebbitRpcClientsOptions?: undefined;
};
export declare function mockPlebbit(plebbitOptions?: PlebbitOptions, forceMockPubsub?: boolean, stubStorage?: boolean, mockResolve?: boolean): Promise<Plebbit>;
export declare function mockRemotePlebbit(plebbitOptions?: PlebbitOptions): Promise<Plebbit>;
export declare function createOnlinePlebbit(plebbitOptions?: PlebbitOptions): Promise<Plebbit>;
export declare function mockRemotePlebbitIpfsOnly(plebbitOptions?: PlebbitOptions): Promise<Plebbit>;
export declare function mockRpcServerPlebbit(plebbitOptions?: PlebbitOptions): Promise<Plebbit>;
export declare function mockGatewayPlebbit(plebbitOptions?: PlebbitOptions): Promise<Plebbit>;
export declare function mockMultipleGatewaysPlebbit(plebbitOptions?: PlebbitOptions): Promise<Plebbit>;
export declare function publishRandomReply(parentComment: Comment, plebbit: Plebbit, commentProps: Partial<CreateCommentOptions>, verifyCommentPropsInParentPages?: boolean): Promise<Comment>;
export declare function publishRandomPost(subplebbitAddress: string, plebbit: Plebbit, postProps?: Partial<PostType>, verifyCommentPropsInParentPages?: boolean): Promise<Comment>;
export declare function publishVote(commentCid: string, subplebbitAddress: string, vote: 1 | 0 | -1, plebbit: Plebbit, voteProps?: Partial<VoteType>): Promise<Vote>;
export declare function publishWithExpectedResult(publication: Publication, expectedChallengeSuccess: boolean, expectedReason?: string): Promise<void>;
export declare function findCommentInPage(commentCid: string, pageCid: string, pages: BasePages): Promise<Comment | undefined>;
export declare function waitTillCommentIsInParentPages(comment: Comment, plebbit: Plebbit, propsToCheckFor?: Partial<CreateCommentOptions>, checkInAllPages?: boolean): Promise<void>;
export declare function createSubWithNoChallenge(props: CreateSubplebbitOptions, plebbit: Plebbit): Promise<import("../runtime/browser/subplebbit/local-subplebbit.js").LocalSubplebbit | import("../subplebbit/rpc-local-subplebbit.js").RpcLocalSubplebbit | import("../subplebbit/rpc-remote-subplebbit.js").RpcRemoteSubplebbit | RemoteSubplebbit>;
export declare function generatePostToAnswerMathQuestion(props: CreateCommentOptions, plebbit: Plebbit): Promise<Comment>;
export declare function isRpcFlagOn(): boolean;
export declare function resolveWhenConditionIsTrue(toUpdate: EventEmitter, predicate: () => Promise<boolean>): Promise<void>;
export {};
