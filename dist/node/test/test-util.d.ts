import { Comment } from "../publications/comment/comment.js";
import { Plebbit } from "../plebbit/plebbit.js";
import Vote from "../publications/vote/vote.js";
import { RemoteSubplebbit } from "../subplebbit/remote-subplebbit.js";
import type { InputPlebbitOptions } from "../types.js";
import Publication from "../publications/publication.js";
import { EventEmitter } from "events";
import { LocalSubplebbit } from "../runtime/node/subplebbit/local-subplebbit.js";
import { RpcLocalSubplebbit } from "../subplebbit/rpc-local-subplebbit.js";
import type { CreateNewLocalSubplebbitUserOptions, SubplebbitIpfsType } from "../subplebbit/types.js";
import type { SignerType } from "../signer/types.js";
import type { CreateVoteOptions } from "../publications/vote/types.js";
import type { CommentIpfsWithCidDefined, CommentWithinPageJson, CreateCommentOptions } from "../publications/comment/types.js";
import { BasePages, PostsPages, RepliesPages } from "../pages/pages.js";
import { CommentEdit } from "../publications/comment-edit/comment-edit.js";
import type { CreateCommentEditOptions } from "../publications/comment-edit/types.js";
import type { ChallengeVerificationMessageType, PubsubMessage } from "../pubsub-messages/types.js";
import { CommentModeration } from "../publications/comment-moderation/comment-moderation.js";
import type { PageTypeJson } from "../pages/types.js";
interface MockPlebbitOptions {
    plebbitOptions?: InputPlebbitOptions;
    forceMockPubsub?: boolean;
    stubStorage?: boolean;
    mockResolve?: boolean;
    remotePlebbit?: boolean;
}
export declare function generateMockPost(subplebbitAddress: string, plebbit: Plebbit, randomTimestamp?: boolean, postProps?: Partial<CreateCommentOptions>): Promise<Comment>;
export declare function generateMockComment(parentPostOrComment: CommentIpfsWithCidDefined, plebbit: Plebbit, randomTimestamp?: boolean, commentProps?: Partial<CreateCommentOptions>): Promise<Comment>;
export declare function generateMockVote(parentPostOrComment: CommentIpfsWithCidDefined, vote: -1 | 0 | 1, plebbit: Plebbit, signer?: SignerType): Promise<Vote>;
export declare function loadAllPages(pageCid: string, pagesInstance: BasePages): Promise<CommentWithinPageJson[]>;
export declare function loadAllPagesBySortName(pageSortName: string, pagesInstance: BasePages): Promise<CommentWithinPageJson[]>;
export declare function loadAllUniquePostsUnderSubplebbit(subplebbit: RemoteSubplebbit): Promise<CommentWithinPageJson[]>;
export declare function loadAllUniqueCommentsUnderCommentInstance(comment: Comment): Promise<CommentWithinPageJson[]>;
type TestServerSubs = {
    onlineSub?: string;
    ensSub: string;
    mainSub: string;
    mathSub: string;
    NoPubsubResponseSub: string;
    mathCliSubWithNoMockedPubsub: string;
};
export declare function startOnlineSubplebbit(): Promise<LocalSubplebbit | RpcLocalSubplebbit>;
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
export declare function mockDefaultOptionsForNodeAndBrowserTests(): Pick<InputPlebbitOptions, "plebbitRpcClientsOptions" | "kuboRpcClientsOptions" | "ipfsGatewayUrls" | "pubsubKuboRpcClientsOptions" | "httpRoutersOptions">;
export declare function mockPlebbitV2({ plebbitOptions, forceMockPubsub, stubStorage, mockResolve, remotePlebbit }?: MockPlebbitOptions): Promise<Plebbit>;
export declare function mockPlebbit(plebbitOptions?: InputPlebbitOptions, forceMockPubsub?: boolean, stubStorage?: boolean, mockResolve?: boolean): Promise<Plebbit>;
export declare function mockRemotePlebbit(opts?: MockPlebbitOptions): Promise<Plebbit>;
export declare function createOnlinePlebbit(plebbitOptions?: InputPlebbitOptions): Promise<Plebbit>;
export declare function mockPlebbitNoDataPathWithOnlyKuboClient(opts?: MockPlebbitOptions): Promise<Plebbit>;
export declare function mockRpcServerPlebbit(plebbitOptions?: InputPlebbitOptions): Promise<Plebbit>;
export declare function mockRpcRemotePlebbit(opts?: MockPlebbitOptions): Promise<Plebbit>;
export declare function mockRPCLocalPlebbit(plebbitOptions?: InputPlebbitOptions): Promise<Plebbit>;
export declare function mockGatewayPlebbit(opts?: MockPlebbitOptions): Promise<Plebbit>;
export declare function publishRandomReply(parentComment: CommentIpfsWithCidDefined, plebbit: Plebbit, commentProps: Partial<CreateCommentOptions>): Promise<Comment>;
export declare function publishRandomPost(subplebbitAddress: string, plebbit: Plebbit, postProps?: Partial<CreateCommentOptions>): Promise<Comment>;
export declare function publishVote(commentCid: string, subplebbitAddress: string, vote: 1 | 0 | -1, plebbit: Plebbit, voteProps?: Partial<CreateVoteOptions>): Promise<Vote>;
export declare function publishWithExpectedResult(publication: Publication, expectedChallengeSuccess: boolean, expectedReason?: string): Promise<void>;
export declare function iterateThroughPageCidToFindComment(commentCid: string, pageCid: string, pages: BasePages): Promise<CommentWithinPageJson | undefined>;
export declare function waitTillPostInSubplebbitInstancePages(post: Required<Pick<CommentIpfsWithCidDefined, "cid" | "subplebbitAddress">>, sub: RemoteSubplebbit): Promise<void>;
export declare function waitTillPostInSubplebbitPages(post: Required<Pick<CommentIpfsWithCidDefined, "cid" | "subplebbitAddress">>, plebbit: Plebbit): Promise<void>;
export declare function iterateThroughPagesToFindCommentInParentPagesInstance(commentCid: string, pages: PostsPages | RepliesPages): Promise<PageTypeJson["comments"][0] | undefined>;
export declare function waitTillReplyInParentPagesInstance(reply: Required<Pick<CommentIpfsWithCidDefined, "cid" | "subplebbitAddress" | "parentCid">>, parentComment: Comment): Promise<void>;
export declare function waitTillReplyInParentPages(reply: Required<Pick<CommentIpfsWithCidDefined, "cid" | "subplebbitAddress" | "parentCid">>, plebbit: Plebbit): Promise<void>;
export declare function createSubWithNoChallenge(props: CreateNewLocalSubplebbitUserOptions, plebbit: Plebbit): Promise<LocalSubplebbit | RpcLocalSubplebbit>;
export declare function generatePostToAnswerMathQuestion(props: CreateCommentOptions, plebbit: Plebbit): Promise<Comment>;
export declare function isRpcFlagOn(): boolean;
export declare function isRunningInBrowser(): boolean;
export declare function resolveWhenConditionIsTrue(toUpdate: EventEmitter, predicate: () => Promise<boolean>, eventName?: string): Promise<void>;
export declare function disableValidationOfSignatureBeforePublishing(publication: Publication): Promise<void>;
export declare function overrideCommentInstancePropsAndSign(comment: Comment, props: CreateCommentOptions): Promise<void>;
export declare function overrideCommentEditInstancePropsAndSign(commentEdit: CommentEdit, props: CreateCommentEditOptions): Promise<void>;
export declare function setExtraPropOnCommentAndSign(comment: Comment, extraProps: Object, includeExtraPropInSignedPropertyNames: boolean): Promise<void>;
export declare function setExtraPropOnVoteAndSign(vote: Vote, extraProps: Object, includeExtraPropInSignedPropertyNames: boolean): Promise<void>;
export declare function setExtraPropOnCommentEditAndSign(commentEdit: CommentEdit, extraProps: Object, includeExtraPropInSignedPropertyNames: boolean): Promise<void>;
export declare function setExtraPropOnCommentModerationAndSign(commentModeration: CommentModeration, extraProps: any, includeExtraPropInSignedPropertyNames: boolean): Promise<void>;
export declare function setExtraPropOnChallengeRequestAndSign(publication: Publication, extraProps: Object, includeExtraPropsInRequestSignedPropertyNames: boolean): Promise<void>;
export declare function publishChallengeAnswerMessageWithExtraProps(publication: Publication, challengeAnswers: string[], extraProps: Object, includeExtraPropsInChallengeSignedPropertyNames: boolean): Promise<void>;
export declare function publishChallengeMessageWithExtraProps(publication: Publication, pubsubSigner: SignerType, extraProps: Object, includeExtraPropsInChallengeSignedPropertyNames: boolean): Promise<void>;
export declare function publishChallengeVerificationMessageWithExtraProps(publication: Publication, pubsubSigner: SignerType, extraProps: Object, includeExtraPropsInChallengeSignedPropertyNames: boolean): Promise<void>;
export declare function publishChallengeVerificationMessageWithEncryption(publication: Publication, pubsubSigner: SignerType, toEncrypt: Object, verificationProps?: Partial<ChallengeVerificationMessageType>): Promise<void>;
export declare function addStringToIpfs(content: string): Promise<string>;
export declare function publishOverPubsub(pubsubTopic: string, jsonToPublish: PubsubMessage): Promise<void>;
export declare function mockPlebbitWithHeliaConfig(opts?: MockPlebbitOptions): Promise<Plebbit>;
type PlebbitTestConfigCode = "remote-kubo-rpc" | "remote-ipfs-gateway" | "remote-plebbit-rpc" | "local-kubo-rpc" | "remote-libp2pjs";
type PlebbitConfigWithName = {
    name: string;
    plebbitInstancePromise: (args?: MockPlebbitOptions) => Promise<Plebbit>;
    testConfigCode: PlebbitTestConfigCode;
};
export declare function setPlebbitConfigs(configs: PlebbitTestConfigCode[]): void;
export declare function getRemotePlebbitConfigs(opts?: {
    includeOnlyTheseTests?: PlebbitTestConfigCode[];
}): PlebbitConfigWithName[];
export declare function createNewIpns(): Promise<{
    signer: import("../signer/index.js").SignerWithPublicKeyAddress;
    publishToIpns: (content: string) => Promise<void>;
    plebbit: Plebbit;
}>;
export declare function publishSubplebbitRecordWithExtraProp(opts?: {
    includeExtraPropInSignedPropertyNames: boolean;
    extraProps: Object;
}): Promise<{
    subplebbitRecord: any;
    ipnsObj: {
        signer: import("../signer/index.js").SignerWithPublicKeyAddress;
        publishToIpns: (content: string) => Promise<void>;
        plebbit: Plebbit;
    };
}>;
export declare function createMockedSubplebbitIpns(subplebbitOpts: CreateNewLocalSubplebbitUserOptions): Promise<{
    subplebbitRecord: {
        address: string;
        signature: {
            type: string;
            signature: string;
            publicKey: string;
            signedPropertyNames: string[];
        };
        protocolVersion: string;
        updatedAt: number;
        challenges: import("zod").objectOutputType<{
            exclude: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodObject<{
                subplebbit: import("zod").ZodOptional<import("zod").ZodObject<{
                    addresses: import("zod").ZodArray<import("zod").ZodString, "atleastone">;
                    maxCommentCids: import("zod").ZodNumber;
                    postScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                    replyScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                    firstCommentTimestamp: import("zod").ZodOptional<import("zod").ZodNumber>;
                }, "strict", import("zod").ZodTypeAny, {
                    addresses: [string, ...string[]];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: [string, ...string[]];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                replyScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                firstCommentTimestamp: import("zod").ZodOptional<import("zod").ZodNumber>;
                challenges: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodNumber, "many">>;
                role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodUnion<[import("zod").ZodEnum<["owner", "admin", "moderator"]>, import("zod").ZodString]>, "many">>;
                address: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
                rateLimit: import("zod").ZodOptional<import("zod").ZodNumber>;
                rateLimitChallengeSuccess: import("zod").ZodOptional<import("zod").ZodBoolean>;
                publicationType: import("zod").ZodOptional<import("zod").ZodEffects<import("zod").ZodObject<{
                    post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentEdit: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentModeration: import("zod").ZodOptional<import("zod").ZodBoolean>;
                }, "passthrough", import("zod").ZodTypeAny, import("zod").objectOutputType<{
                    post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentEdit: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentModeration: import("zod").ZodOptional<import("zod").ZodBoolean>;
                }, import("zod").ZodTypeAny, "passthrough">, import("zod").objectInputType<{
                    post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentEdit: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentModeration: import("zod").ZodOptional<import("zod").ZodBoolean>;
                }, import("zod").ZodTypeAny, "passthrough">>, import("zod").objectOutputType<{
                    post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentEdit: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentModeration: import("zod").ZodOptional<import("zod").ZodBoolean>;
                }, import("zod").ZodTypeAny, "passthrough">, import("zod").objectInputType<{
                    post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentEdit: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentModeration: import("zod").ZodOptional<import("zod").ZodBoolean>;
                }, import("zod").ZodTypeAny, "passthrough">>>;
            }, "passthrough", import("zod").ZodTypeAny, import("zod").objectOutputType<{
                subplebbit: import("zod").ZodOptional<import("zod").ZodObject<{
                    addresses: import("zod").ZodArray<import("zod").ZodString, "atleastone">;
                    maxCommentCids: import("zod").ZodNumber;
                    postScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                    replyScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                    firstCommentTimestamp: import("zod").ZodOptional<import("zod").ZodNumber>;
                }, "strict", import("zod").ZodTypeAny, {
                    addresses: [string, ...string[]];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: [string, ...string[]];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                replyScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                firstCommentTimestamp: import("zod").ZodOptional<import("zod").ZodNumber>;
                challenges: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodNumber, "many">>;
                role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodUnion<[import("zod").ZodEnum<["owner", "admin", "moderator"]>, import("zod").ZodString]>, "many">>;
                address: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
                rateLimit: import("zod").ZodOptional<import("zod").ZodNumber>;
                rateLimitChallengeSuccess: import("zod").ZodOptional<import("zod").ZodBoolean>;
                publicationType: import("zod").ZodOptional<import("zod").ZodEffects<import("zod").ZodObject<{
                    post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentEdit: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentModeration: import("zod").ZodOptional<import("zod").ZodBoolean>;
                }, "passthrough", import("zod").ZodTypeAny, import("zod").objectOutputType<{
                    post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentEdit: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentModeration: import("zod").ZodOptional<import("zod").ZodBoolean>;
                }, import("zod").ZodTypeAny, "passthrough">, import("zod").objectInputType<{
                    post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentEdit: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentModeration: import("zod").ZodOptional<import("zod").ZodBoolean>;
                }, import("zod").ZodTypeAny, "passthrough">>, import("zod").objectOutputType<{
                    post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentEdit: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentModeration: import("zod").ZodOptional<import("zod").ZodBoolean>;
                }, import("zod").ZodTypeAny, "passthrough">, import("zod").objectInputType<{
                    post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentEdit: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentModeration: import("zod").ZodOptional<import("zod").ZodBoolean>;
                }, import("zod").ZodTypeAny, "passthrough">>>;
            }, import("zod").ZodTypeAny, "passthrough">, import("zod").objectInputType<{
                subplebbit: import("zod").ZodOptional<import("zod").ZodObject<{
                    addresses: import("zod").ZodArray<import("zod").ZodString, "atleastone">;
                    maxCommentCids: import("zod").ZodNumber;
                    postScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                    replyScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                    firstCommentTimestamp: import("zod").ZodOptional<import("zod").ZodNumber>;
                }, "strict", import("zod").ZodTypeAny, {
                    addresses: [string, ...string[]];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: [string, ...string[]];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                replyScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                firstCommentTimestamp: import("zod").ZodOptional<import("zod").ZodNumber>;
                challenges: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodNumber, "many">>;
                role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodUnion<[import("zod").ZodEnum<["owner", "admin", "moderator"]>, import("zod").ZodString]>, "many">>;
                address: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
                rateLimit: import("zod").ZodOptional<import("zod").ZodNumber>;
                rateLimitChallengeSuccess: import("zod").ZodOptional<import("zod").ZodBoolean>;
                publicationType: import("zod").ZodOptional<import("zod").ZodEffects<import("zod").ZodObject<{
                    post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentEdit: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentModeration: import("zod").ZodOptional<import("zod").ZodBoolean>;
                }, "passthrough", import("zod").ZodTypeAny, import("zod").objectOutputType<{
                    post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentEdit: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentModeration: import("zod").ZodOptional<import("zod").ZodBoolean>;
                }, import("zod").ZodTypeAny, "passthrough">, import("zod").objectInputType<{
                    post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentEdit: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentModeration: import("zod").ZodOptional<import("zod").ZodBoolean>;
                }, import("zod").ZodTypeAny, "passthrough">>, import("zod").objectOutputType<{
                    post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentEdit: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentModeration: import("zod").ZodOptional<import("zod").ZodBoolean>;
                }, import("zod").ZodTypeAny, "passthrough">, import("zod").objectInputType<{
                    post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentEdit: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentModeration: import("zod").ZodOptional<import("zod").ZodBoolean>;
                }, import("zod").ZodTypeAny, "passthrough">>>;
            }, import("zod").ZodTypeAny, "passthrough">>, "atleastone">>;
            description: import("zod").ZodOptional<import("zod").ZodString>;
            challenge: import("zod").ZodOptional<import("zod").ZodString>;
            type: import("zod").ZodString;
            caseInsensitive: import("zod").ZodOptional<import("zod").ZodBoolean>;
        }, import("zod").ZodTypeAny, "passthrough">[];
        encryption: {
            type: string;
            publicKey: string;
        } & {
            [k: string]: unknown;
        };
        createdAt: number;
        statsCid: string;
        title?: string | undefined;
        lastCommentCid?: string | undefined;
        posts?: {
            pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
            pageCids?: Record<string, string> | undefined;
        } | undefined;
        description?: string | undefined;
        pubsubTopic?: string | undefined;
        postUpdates?: Record<string, string> | undefined;
        roles?: Record<string, import("zod").objectOutputType<{
            role: import("zod").ZodUnion<[import("zod").ZodEnum<["owner", "admin", "moderator"]>, import("zod").ZodString]>;
        }, import("zod").ZodTypeAny, "passthrough">> | undefined;
        rules?: string[] | undefined;
        lastPostCid?: string | undefined;
        features?: import("zod").objectOutputType<{
            noVideos: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noSpoilers: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noImages: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noVideoReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noSpoilerReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noImageReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noPolls: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noCrossposts: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noAuthors: import("zod").ZodOptional<import("zod").ZodBoolean>;
            anonymousAuthors: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noNestedReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            safeForWork: import("zod").ZodOptional<import("zod").ZodBoolean>;
            authorFlairs: import("zod").ZodOptional<import("zod").ZodBoolean>;
            requireAuthorFlairs: import("zod").ZodOptional<import("zod").ZodBoolean>;
            postFlairs: import("zod").ZodOptional<import("zod").ZodBoolean>;
            requirePostFlairs: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noMarkdownImages: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noMarkdownVideos: import("zod").ZodOptional<import("zod").ZodBoolean>;
            markdownImageReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            markdownVideoReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noPostUpvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noReplyUpvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noPostDownvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noReplyDownvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noUpvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noDownvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            requirePostLink: import("zod").ZodOptional<import("zod").ZodBoolean>;
            requirePostLinkIsMedia: import("zod").ZodOptional<import("zod").ZodBoolean>;
        }, import("zod").ZodTypeAny, "passthrough"> | undefined;
        suggested?: import("zod").objectOutputType<{
            primaryColor: import("zod").ZodOptional<import("zod").ZodString>;
            secondaryColor: import("zod").ZodOptional<import("zod").ZodString>;
            avatarUrl: import("zod").ZodOptional<import("zod").ZodString>;
            bannerUrl: import("zod").ZodOptional<import("zod").ZodString>;
            backgroundUrl: import("zod").ZodOptional<import("zod").ZodString>;
            language: import("zod").ZodOptional<import("zod").ZodString>;
        }, import("zod").ZodTypeAny, "passthrough"> | undefined;
        flairs?: Record<string, import("zod").objectOutputType<{
            text: import("zod").ZodString;
            backgroundColor: import("zod").ZodOptional<import("zod").ZodString>;
            textColor: import("zod").ZodOptional<import("zod").ZodString>;
            expiresAt: import("zod").ZodOptional<import("zod").ZodNumber>;
        }, import("zod").ZodTypeAny, "passthrough">[]> | undefined;
    };
    ipnsObj: {
        signer: import("../signer/index.js").SignerWithPublicKeyAddress;
        publishToIpns: (content: string) => Promise<void>;
        plebbit: Plebbit;
    };
}>;
export declare function jsonifySubplebbitAndRemoveInternalProps(sub: RemoteSubplebbit): Omit<any, "signer" | "state" | "clients" | "settings" | "startedState" | "editable" | "updatingState" | "started">;
export declare function jsonifyLocalSubWithNoInternalProps(sub: LocalSubplebbit): Omit<{
    signer: import("../signer/index.js").SignerWithPublicKeyAddress;
    address: SubplebbitIpfsType["address"];
    signature?: SubplebbitIpfsType["signature"] | undefined;
    protocolVersion: import("../subplebbit/types.js").RpcInternalSubplebbitRecordBeforeFirstUpdateType["protocolVersion"];
    state: import("../subplebbit/types.js").SubplebbitState;
    clients: import("../subplebbit/subplebbit-client-manager.js").SubplebbitClientsManager["clients"];
    title?: string | undefined;
    updatedAt?: SubplebbitIpfsType["updatedAt"] | undefined;
    lastCommentCid?: string | undefined;
    shortAddress: string;
    posts: PostsPages;
    challenges: import("../subplebbit/types.js").RpcInternalSubplebbitRecordBeforeFirstUpdateType["challenges"];
    description?: string | undefined;
    encryption: import("../subplebbit/types.js").RpcInternalSubplebbitRecordBeforeFirstUpdateType["encryption"];
    createdAt: import("../subplebbit/types.js").RpcInternalSubplebbitRecordBeforeFirstUpdateType["createdAt"];
    pubsubTopic?: string | undefined;
    statsCid?: SubplebbitIpfsType["statsCid"] | undefined;
    postUpdates?: Record<string, string> | undefined;
    roles?: Record<string, import("zod").objectOutputType<{
        role: import("zod").ZodUnion<[import("zod").ZodEnum<["owner", "admin", "moderator"]>, import("zod").ZodString]>;
    }, import("zod").ZodTypeAny, "passthrough">> | undefined;
    rules?: string[] | undefined;
    lastPostCid?: string | undefined;
    features?: import("zod").objectOutputType<{
        noVideos: import("zod").ZodOptional<import("zod").ZodBoolean>;
        noSpoilers: import("zod").ZodOptional<import("zod").ZodBoolean>;
        noImages: import("zod").ZodOptional<import("zod").ZodBoolean>;
        noVideoReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
        noSpoilerReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
        noImageReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
        noPolls: import("zod").ZodOptional<import("zod").ZodBoolean>;
        noCrossposts: import("zod").ZodOptional<import("zod").ZodBoolean>;
        noAuthors: import("zod").ZodOptional<import("zod").ZodBoolean>;
        anonymousAuthors: import("zod").ZodOptional<import("zod").ZodBoolean>;
        noNestedReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
        safeForWork: import("zod").ZodOptional<import("zod").ZodBoolean>;
        authorFlairs: import("zod").ZodOptional<import("zod").ZodBoolean>;
        requireAuthorFlairs: import("zod").ZodOptional<import("zod").ZodBoolean>;
        postFlairs: import("zod").ZodOptional<import("zod").ZodBoolean>;
        requirePostFlairs: import("zod").ZodOptional<import("zod").ZodBoolean>;
        noMarkdownImages: import("zod").ZodOptional<import("zod").ZodBoolean>;
        noMarkdownVideos: import("zod").ZodOptional<import("zod").ZodBoolean>;
        markdownImageReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
        markdownVideoReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
        noPostUpvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
        noReplyUpvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
        noPostDownvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
        noReplyDownvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
        noUpvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
        noDownvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
        requirePostLink: import("zod").ZodOptional<import("zod").ZodBoolean>;
        requirePostLinkIsMedia: import("zod").ZodOptional<import("zod").ZodBoolean>;
    }, import("zod").ZodTypeAny, "passthrough"> | undefined;
    suggested?: import("zod").objectOutputType<{
        primaryColor: import("zod").ZodOptional<import("zod").ZodString>;
        secondaryColor: import("zod").ZodOptional<import("zod").ZodString>;
        avatarUrl: import("zod").ZodOptional<import("zod").ZodString>;
        bannerUrl: import("zod").ZodOptional<import("zod").ZodString>;
        backgroundUrl: import("zod").ZodOptional<import("zod").ZodString>;
        language: import("zod").ZodOptional<import("zod").ZodString>;
    }, import("zod").ZodTypeAny, "passthrough"> | undefined;
    flairs?: Record<string, import("zod").objectOutputType<{
        text: import("zod").ZodString;
        backgroundColor: import("zod").ZodOptional<import("zod").ZodString>;
        textColor: import("zod").ZodOptional<import("zod").ZodString>;
        expiresAt: import("zod").ZodOptional<import("zod").ZodNumber>;
    }, import("zod").ZodTypeAny, "passthrough">[]> | undefined;
    settings: import("../subplebbit/types.js").RpcInternalSubplebbitRecordAfterFirstUpdateType["settings"];
    raw: {
        subplebbitIpfs?: SubplebbitIpfsType;
    };
    updateCid?: string | undefined;
    startedState: import("../subplebbit/types.js").SubplebbitStartedState;
    editable: Pick<RpcLocalSubplebbit, keyof import("../subplebbit/types.js").SubplebbitEditOptions>;
    readonly updatingState: RemoteSubplebbit["updatingState"];
    started: boolean;
    ipnsName?: string | undefined;
    ipnsPubsubTopic?: string | undefined;
    ipnsPubsubTopicDhtKey?: string | undefined;
    pubsubTopicPeersCid?: string | undefined;
}, "state" | "clients" | "startedState" | "updatingState" | "started">;
export declare function jsonifyCommentAndRemoveInstanceProps(comment: Comment): Omit<any, "state" | "publishingState" | "clients" | "raw" | "updatingState">;
export declare function waitUntilPlebbitSubplebbitsIncludeSubAddress(plebbit: Plebbit, subAddress: string): Promise<void>;
export declare function isPlebbitFetchingUsingGateways(plebbit: Plebbit): boolean;
export declare function mockRpcServerForTests(plebbitWs: any): void;
export declare function mockPostToReturnSpecificCommentUpdate(commentToBeMocked: Comment, commentUpdateRecordString: string): void;
export declare function mockPostToFailToLoadFromPostUpdates(postToBeMocked: Comment): void;
export declare function mockPostToHaveSubplebbitWithNoPostUpdates(postToBeMocked: Comment): void;
export declare function createCommentUpdateWithInvalidSignature(commentCid: string): Promise<import("../publications/comment/types.js").CommentUpdateType>;
export declare function mockPlebbitToReturnSpecificSubplebbit(plebbit: Plebbit, subAddress: string, subplebbitRecord: any): Promise<void>;
export declare function mockPlebbitToTimeoutFetchingCid(plebbit: Plebbit): void;
export declare function mockCommentToNotUsePagesForUpdates(comment: Comment): void;
export declare function forceSubplebbitToGenerateAllRepliesPages(comment: Comment): Promise<void>;
export declare function forceSubplebbitToGenerateAllPostsPages(subplebbit: RemoteSubplebbit): Promise<void>;
export declare function findOrGeneratePostWithMultiplePages(subplebbit: RemoteSubplebbit): Promise<CommentWithinPageJson | Comment>;
export declare function findOrGenerateReplyUnderPostWithMultiplePages(subplebbit: RemoteSubplebbit): Promise<CommentWithinPageJson | Comment>;
export declare function mockReplyToUseParentPagesForUpdates(reply: Comment): void;
export declare function mockUpdatingCommentResolvingAuthor(comment: Comment, mockFunction: Comment["_clientsManager"]["resolveAuthorAddressIfNeeded"]): void;
export declare function mockCacheOfTextRecord(opts: {
    plebbit: Plebbit;
    domain: string;
    textRecord: string;
    value: string;
}): Promise<void>;
export declare function getRandomPostCidFromSub(subplebbitAddress: string, plebbit: Plebbit): Promise<string>;
export declare const describeSkipIfRpc: Mocha.SuiteFunction | {
    (_: any): void;
    skip(): void;
};
export declare const describeIfRpc: Mocha.SuiteFunction | {
    (_: any): void;
    skip(): void;
};
export declare const itSkipIfRpc: Mocha.TestFunction | {
    (_: any): void;
    skip(): void;
};
export declare const itIfRpc: Mocha.TestFunction | {
    (_: any): void;
    skip(): void;
};
export declare function mockViemClient({ plebbit, chainTicker, url, mockedViem }: {
    plebbit: Plebbit;
    chainTicker: string;
    url: string;
    mockedViem: any;
}): void;
export declare function processAllCommentsRecursively(comments: (Comment | CommentWithinPageJson)[] | undefined, processor: (comment: Comment | CommentWithinPageJson) => void): void;
export {};
