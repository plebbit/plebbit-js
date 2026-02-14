import { Comment } from "../publications/comment/comment.js";
import { Plebbit } from "../plebbit/plebbit.js";
import Vote from "../publications/vote/vote.js";
import { RemoteSubplebbit } from "../subplebbit/remote-subplebbit.js";
import type { InputPlebbitOptions } from "../types.js";
import Publication from "../publications/publication.js";
import { EventEmitter } from "events";
import { LocalSubplebbit } from "../runtime/node/subplebbit/local-subplebbit.js";
import { RpcLocalSubplebbit } from "../subplebbit/rpc-local-subplebbit.js";
import type { CreateNewLocalSubplebbitUserOptions, SubplebbitIpfsType, SubplebbitChallengeSetting } from "../subplebbit/types.js";
import type { SignerType } from "../signer/types.js";
import type { CreateVoteOptions } from "../publications/vote/types.js";
import type { CommentIpfsWithCidDefined, CommentWithinRepliesPostsPageJson, CreateCommentOptions } from "../publications/comment/types.js";
import { BasePages, PostsPages, RepliesPages } from "../pages/pages.js";
import { CommentEdit } from "../publications/comment-edit/comment-edit.js";
import type { CreateCommentEditOptions } from "../publications/comment-edit/types.js";
import type { ChallengeVerificationMessageType, DecryptedChallengeVerificationMessageType, PubsubMessage } from "../pubsub-messages/types.js";
import { CommentModeration } from "../publications/comment-moderation/comment-moderation.js";
import type { PageTypeJson } from "../pages/types.js";
interface MockPlebbitOptions {
    plebbitOptions?: InputPlebbitOptions;
    forceMockPubsub?: boolean;
    stubStorage?: boolean;
    mockResolve?: boolean;
    remotePlebbit?: boolean;
}
export declare function createPendingApprovalChallenge(overrides?: Partial<SubplebbitChallengeSetting>): SubplebbitChallengeSetting;
export declare function generateMockPost(subplebbitAddress: string, plebbit: Plebbit, randomTimestamp?: boolean, postProps?: Partial<CreateCommentOptions>): Promise<Comment>;
export declare function generateMockComment(parentPostOrComment: CommentIpfsWithCidDefined, plebbit: Plebbit, randomTimestamp?: boolean, commentProps?: Partial<CreateCommentOptions>): Promise<Comment>;
export declare function generateMockVote(parentPostOrComment: CommentIpfsWithCidDefined, vote: -1 | 0 | 1, plebbit: Plebbit, signer?: SignerType): Promise<Vote>;
export declare function loadAllPages(pageCid: string, pagesInstance: PostsPages | RepliesPages): Promise<CommentWithinRepliesPostsPageJson[]>;
export declare function loadAllPagesBySortName(pageSortName: string, pagesInstance: BasePages): Promise<CommentWithinRepliesPostsPageJson[] | import("../publications/comment/types.js").CommentWithinModQueuePageJson[]>;
export declare function loadAllUniquePostsUnderSubplebbit(subplebbit: RemoteSubplebbit): Promise<CommentWithinRepliesPostsPageJson[]>;
export declare function loadAllUniqueCommentsUnderCommentInstance(comment: Comment): Promise<CommentWithinRepliesPostsPageJson[]>;
type TestServerSubs = {
    onlineSub?: LocalSubplebbit;
    ensSub: LocalSubplebbit;
    mainSub: LocalSubplebbit;
    mathSub: LocalSubplebbit;
    NoPubsubResponseSub: LocalSubplebbit;
    mathCliSubWithNoMockedPubsub: LocalSubplebbit;
    subForPurge: LocalSubplebbit;
    subForRemove: LocalSubplebbit;
    subForDelete: LocalSubplebbit;
    subForChainProviders: LocalSubplebbit;
    subForEditContent: LocalSubplebbit;
    subForLocked: LocalSubplebbit;
};
export declare function startOnlineSubplebbit(): Promise<LocalSubplebbit>;
export declare function startSubplebbits(props: {
    signers: SignerType[];
    noData?: boolean;
    dataPath?: string;
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
export declare function mockPlebbitNoDataPathWithOnlyKuboClientNoAdd(opts?: MockPlebbitOptions): Promise<Plebbit>;
export declare function mockRpcServerPlebbit(plebbitOptions?: InputPlebbitOptions): Promise<Plebbit>;
export declare function mockRpcRemotePlebbit(opts?: MockPlebbitOptions): Promise<Plebbit>;
export declare function mockRPCLocalPlebbit(plebbitOptions?: InputPlebbitOptions): Promise<Plebbit>;
export declare function mockGatewayPlebbit(opts?: MockPlebbitOptions): Promise<Plebbit>;
export declare function publishRandomReply(parentComment: CommentIpfsWithCidDefined, plebbit: Plebbit, commentProps?: Partial<CreateCommentOptions>): Promise<Comment>;
export declare function publishRandomPost(subplebbitAddress: string, plebbit: Plebbit, postProps?: Partial<CreateCommentOptions>): Promise<Comment>;
export declare function publishVote(commentCid: string, subplebbitAddress: string, vote: 1 | 0 | -1, plebbit: Plebbit, voteProps?: Partial<CreateVoteOptions>): Promise<Vote>;
export declare function publishWithExpectedResult(publication: Publication, expectedChallengeSuccess: boolean, expectedReason?: string): Promise<void>;
export declare function iterateThroughPageCidToFindComment(commentCid: string, pageCid: string, pages: PostsPages | RepliesPages): Promise<CommentWithinRepliesPostsPageJson | undefined>;
export declare function findCommentInSubplebbitInstancePagesPreloadedAndPageCids(opts: {
    comment: Required<Pick<CommentIpfsWithCidDefined, "cid" | "subplebbitAddress">>;
    sub: RemoteSubplebbit;
}): Promise<CommentWithinRepliesPostsPageJson | undefined>;
export declare function findReplyInParentCommentPagesInstancePreloadedAndPageCids(opts: {
    reply: Required<Pick<CommentIpfsWithCidDefined, "cid" | "subplebbitAddress" | "parentCid">>;
    parentComment: Comment;
}): Promise<CommentWithinRepliesPostsPageJson | undefined>;
export declare function waitTillPostInSubplebbitInstancePages(post: Required<Pick<CommentIpfsWithCidDefined, "cid" | "subplebbitAddress">>, sub: RemoteSubplebbit): Promise<void>;
export declare function waitTillPostInSubplebbitPages(post: Required<Pick<CommentIpfsWithCidDefined, "cid" | "subplebbitAddress">>, plebbit: Plebbit): Promise<void>;
export declare function iterateThroughPagesToFindCommentInParentPagesInstance(commentCid: string, pages: PostsPages | RepliesPages): Promise<PageTypeJson["comments"][0] | undefined>;
export declare function waitTillReplyInParentPagesInstance(reply: Required<Pick<CommentIpfsWithCidDefined, "cid" | "subplebbitAddress" | "parentCid">>, parentComment: Comment): Promise<void>;
export declare function waitTillReplyInParentPages(reply: Required<Pick<CommentIpfsWithCidDefined, "cid" | "subplebbitAddress" | "parentCid">>, plebbit: Plebbit): Promise<void>;
export declare function createSubWithNoChallenge(props: CreateNewLocalSubplebbitUserOptions, plebbit: Plebbit): Promise<LocalSubplebbit | RpcLocalSubplebbit>;
export declare function generatePostToAnswerMathQuestion(props: Partial<CreateCommentOptions> & Pick<CreateCommentOptions, "subplebbitAddress">, plebbit: Plebbit): Promise<Comment>;
export declare function isRpcFlagOn(): boolean;
export declare function isRunningInBrowser(): boolean;
export type ResolveWhenConditionIsTrueOptions = {
    toUpdate: EventEmitter;
    predicate: () => Promise<boolean>;
    eventName?: string;
};
export declare function resolveWhenConditionIsTrue(options: ResolveWhenConditionIsTrueOptions): Promise<void>;
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
export declare function getAvailablePlebbitConfigsToTestAgainst(opts?: {
    includeOnlyTheseTests?: PlebbitTestConfigCode[];
    includeAllPossibleConfigOnEnv?: boolean;
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
        challenges: {
            [x: string]: unknown;
            type: string;
            exclude?: {
                [x: string]: unknown;
                subplebbit?: {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                } | undefined;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
                challenges?: number[] | undefined;
                role?: string[] | undefined;
                address?: string[] | undefined;
                rateLimit?: number | undefined;
                rateLimitChallengeSuccess?: boolean | undefined;
                publicationType?: {
                    [x: string]: unknown;
                    post?: boolean | undefined;
                    reply?: boolean | undefined;
                    vote?: boolean | undefined;
                    commentEdit?: boolean | undefined;
                    commentModeration?: boolean | undefined;
                    subplebbitEdit?: boolean | undefined;
                } | undefined;
            }[] | undefined;
            description?: string | undefined;
            challenge?: string | undefined;
            caseInsensitive?: boolean | undefined;
            pendingApproval?: boolean | undefined;
        }[];
        signature: {
            type: string;
            signature: string;
            publicKey: string;
            signedPropertyNames: string[];
        };
        encryption: {
            [x: string]: unknown;
            type: string;
            publicKey: string;
        };
        address: string;
        createdAt: number;
        updatedAt: number;
        statsCid: string;
        protocolVersion: string;
        posts?: {
            pages: Record<string, {
                comments: {
                    comment: {
                        [x: string]: unknown;
                        timestamp: number;
                        signature: {
                            type: string;
                            signature: string;
                            publicKey: string;
                            signedPropertyNames: string[];
                        };
                        subplebbitAddress: string;
                        protocolVersion: string;
                        author: {
                            [x: string]: unknown;
                            address: string;
                            previousCommentCid?: string | undefined;
                            displayName?: string | undefined;
                            wallets?: Record<string, {
                                address: string;
                                timestamp: number;
                                signature: {
                                    signature: string;
                                    type: string;
                                };
                            }> | undefined;
                            avatar?: {
                                [x: string]: unknown;
                                chainTicker: string;
                                address: string;
                                id: string;
                                timestamp: number;
                                signature: {
                                    signature: string;
                                    type: string;
                                };
                            } | undefined;
                            flairs?: {
                                [x: string]: unknown;
                                text: string;
                                backgroundColor?: string | undefined;
                                textColor?: string | undefined;
                                expiresAt?: number | undefined;
                            }[] | undefined;
                        };
                        depth: number;
                        flairs?: {
                            [x: string]: unknown;
                            text: string;
                            backgroundColor?: string | undefined;
                            textColor?: string | undefined;
                            expiresAt?: number | undefined;
                        }[] | undefined;
                        content?: string | undefined;
                        spoiler?: boolean | undefined;
                        nsfw?: boolean | undefined;
                        link?: string | undefined;
                        title?: string | undefined;
                        linkWidth?: number | undefined;
                        linkHeight?: number | undefined;
                        linkHtmlTagName?: string | undefined;
                        parentCid?: string | undefined;
                        postCid?: string | undefined;
                        quotedCids?: string[] | undefined;
                        thumbnailUrl?: string | undefined;
                        thumbnailUrlWidth?: number | undefined;
                        thumbnailUrlHeight?: number | undefined;
                        previousCid?: string | undefined;
                        pseudonymityMode?: "per-post" | "per-reply" | "per-author" | undefined;
                    };
                    commentUpdate: {
                        [x: string]: unknown;
                        cid: string;
                        upvoteCount: number;
                        downvoteCount: number;
                        replyCount: number;
                        updatedAt: number;
                        signature: {
                            type: string;
                            signature: string;
                            publicKey: string;
                            signedPropertyNames: string[];
                        };
                        protocolVersion: string;
                        childCount?: number | undefined;
                        number?: number | undefined;
                        postNumber?: number | undefined;
                        edit?: {
                            [x: string]: unknown;
                            timestamp: number;
                            signature: {
                                type: string;
                                signature: string;
                                publicKey: string;
                                signedPropertyNames: string[];
                            };
                            subplebbitAddress: string;
                            protocolVersion: string;
                            commentCid: string;
                            author: {
                                [x: string]: unknown;
                                address: string;
                                previousCommentCid?: string | undefined;
                                displayName?: string | undefined;
                                wallets?: Record<string, {
                                    address: string;
                                    timestamp: number;
                                    signature: {
                                        signature: string;
                                        type: string;
                                    };
                                }> | undefined;
                                avatar?: {
                                    [x: string]: unknown;
                                    chainTicker: string;
                                    address: string;
                                    id: string;
                                    timestamp: number;
                                    signature: {
                                        signature: string;
                                        type: string;
                                    };
                                } | undefined;
                                flairs?: {
                                    [x: string]: unknown;
                                    text: string;
                                    backgroundColor?: string | undefined;
                                    textColor?: string | undefined;
                                    expiresAt?: number | undefined;
                                }[] | undefined;
                            };
                            flairs?: {
                                [x: string]: unknown;
                                text: string;
                                backgroundColor?: string | undefined;
                                textColor?: string | undefined;
                                expiresAt?: number | undefined;
                            }[] | undefined;
                            content?: string | undefined;
                            deleted?: boolean | undefined;
                            spoiler?: boolean | undefined;
                            nsfw?: boolean | undefined;
                            reason?: string | undefined;
                        } | undefined;
                        flairs?: {
                            [x: string]: unknown;
                            text: string;
                            backgroundColor?: string | undefined;
                            textColor?: string | undefined;
                            expiresAt?: number | undefined;
                        }[] | undefined;
                        spoiler?: boolean | undefined;
                        nsfw?: boolean | undefined;
                        pinned?: boolean | undefined;
                        locked?: boolean | undefined;
                        removed?: boolean | undefined;
                        reason?: string | undefined;
                        approved?: boolean | undefined;
                        author?: {
                            [x: string]: unknown;
                            subplebbit?: {
                                [x: string]: unknown;
                                postScore: number;
                                replyScore: number;
                                firstCommentTimestamp: number;
                                lastCommentCid: string;
                                banExpiresAt?: number | undefined;
                                flairs?: {
                                    [x: string]: unknown;
                                    text: string;
                                    backgroundColor?: string | undefined;
                                    textColor?: string | undefined;
                                    expiresAt?: number | undefined;
                                }[] | undefined;
                            } | undefined;
                        } | undefined;
                        lastChildCid?: string | undefined;
                        lastReplyTimestamp?: number | undefined;
                        replies?: {
                            pages: Record<string, /*elided*/ any>;
                            pageCids?: Record<string, string> | undefined;
                        } | undefined;
                    };
                }[];
                nextCid?: string | undefined;
            }>;
            pageCids?: Record<string, string> | undefined;
        } | undefined;
        modQueue?: {
            pageCids: Record<string, string>;
        } | undefined;
        pubsubTopic?: string | undefined;
        postUpdates?: Record<string, string> | undefined;
        title?: string | undefined;
        description?: string | undefined;
        roles?: Record<string, {
            [x: string]: unknown;
            role: string;
        }> | undefined;
        rules?: string[] | undefined;
        lastPostCid?: string | undefined;
        lastCommentCid?: string | undefined;
        features?: {
            [x: string]: unknown;
            noVideos?: boolean | undefined;
            noSpoilers?: boolean | undefined;
            noImages?: boolean | undefined;
            noVideoReplies?: boolean | undefined;
            noSpoilerReplies?: boolean | undefined;
            noImageReplies?: boolean | undefined;
            noPolls?: boolean | undefined;
            noCrossposts?: boolean | undefined;
            noNestedReplies?: boolean | undefined;
            safeForWork?: boolean | undefined;
            authorFlairs?: boolean | undefined;
            requireAuthorFlairs?: boolean | undefined;
            postFlairs?: boolean | undefined;
            requirePostFlairs?: boolean | undefined;
            noMarkdownImages?: boolean | undefined;
            noMarkdownVideos?: boolean | undefined;
            noMarkdownAudio?: boolean | undefined;
            noAudio?: boolean | undefined;
            noAudioReplies?: boolean | undefined;
            markdownImageReplies?: boolean | undefined;
            markdownVideoReplies?: boolean | undefined;
            noPostUpvotes?: boolean | undefined;
            noReplyUpvotes?: boolean | undefined;
            noPostDownvotes?: boolean | undefined;
            noReplyDownvotes?: boolean | undefined;
            noUpvotes?: boolean | undefined;
            noDownvotes?: boolean | undefined;
            requirePostLink?: boolean | undefined;
            requirePostLinkIsMedia?: boolean | undefined;
            pseudonymityMode?: "per-post" | "per-reply" | "per-author" | undefined;
        } | undefined;
        suggested?: {
            [x: string]: unknown;
            primaryColor?: string | undefined;
            secondaryColor?: string | undefined;
            avatarUrl?: string | undefined;
            bannerUrl?: string | undefined;
            backgroundUrl?: string | undefined;
            language?: string | undefined;
        } | undefined;
        flairs?: Record<string, {
            [x: string]: unknown;
            text: string;
            backgroundColor?: string | undefined;
            textColor?: string | undefined;
            expiresAt?: number | undefined;
        }[]> | undefined;
    };
    ipnsObj: {
        signer: import("../signer/index.js").SignerWithPublicKeyAddress;
        publishToIpns: (content: string) => Promise<void>;
        plebbit: Plebbit;
    };
}>;
export declare function createStaticSubplebbitRecordForComment(opts?: {
    plebbit?: Plebbit;
    commentOptions?: Partial<CreateCommentOptions & {
        depth?: number;
    }>;
    invalidateSubplebbitSignature?: boolean;
}): Promise<{
    commentCid: string;
    subplebbitAddress: string;
}>;
export declare function jsonifySubplebbitAndRemoveInternalProps(sub: RemoteSubplebbit): Omit<any, "signer" | "state" | "clients" | "settings" | "startedState" | "editable" | "updatingState" | "started">;
export declare function jsonifyLocalSubWithNoInternalProps(sub: LocalSubplebbit): Omit<{
    address: SubplebbitIpfsType["address"];
    shortAddress: string;
    signature?: SubplebbitIpfsType["signature"] | undefined;
    flairs?: Record<string, {
        [x: string]: unknown;
        text: string;
        backgroundColor?: string | undefined;
        textColor?: string | undefined;
        expiresAt?: number | undefined;
    }[]> | undefined;
    signer: import("../signer/index.js").SignerWithPublicKeyAddress;
    protocolVersion: import("../subplebbit/types.js").RpcInternalSubplebbitRecordBeforeFirstUpdateType["protocolVersion"];
    lastCommentCid?: string | undefined;
    state: import("../subplebbit/types.js").SubplebbitState;
    clients: import("../subplebbit/subplebbit-client-manager.js").SubplebbitClientsManager["clients"];
    title?: string | undefined;
    updatedAt?: SubplebbitIpfsType["updatedAt"] | undefined;
    posts: PostsPages;
    encryption: import("../subplebbit/types.js").RpcInternalSubplebbitRecordBeforeFirstUpdateType["encryption"];
    createdAt: import("../subplebbit/types.js").RpcInternalSubplebbitRecordBeforeFirstUpdateType["createdAt"];
    statsCid?: SubplebbitIpfsType["statsCid"] | undefined;
    modQueue: import("../pages/pages.js").ModQueuePages;
    challenges: import("../subplebbit/types.js").RpcInternalSubplebbitRecordBeforeFirstUpdateType["challenges"];
    description?: string | undefined;
    pubsubTopic?: string | undefined;
    postUpdates?: Record<string, string> | undefined;
    roles?: Record<string, {
        [x: string]: unknown;
        role: string;
    }> | undefined;
    rules?: string[] | undefined;
    lastPostCid?: string | undefined;
    features?: {
        [x: string]: unknown;
        noVideos?: boolean | undefined;
        noSpoilers?: boolean | undefined;
        noImages?: boolean | undefined;
        noVideoReplies?: boolean | undefined;
        noSpoilerReplies?: boolean | undefined;
        noImageReplies?: boolean | undefined;
        noPolls?: boolean | undefined;
        noCrossposts?: boolean | undefined;
        noNestedReplies?: boolean | undefined;
        safeForWork?: boolean | undefined;
        authorFlairs?: boolean | undefined;
        requireAuthorFlairs?: boolean | undefined;
        postFlairs?: boolean | undefined;
        requirePostFlairs?: boolean | undefined;
        noMarkdownImages?: boolean | undefined;
        noMarkdownVideos?: boolean | undefined;
        noMarkdownAudio?: boolean | undefined;
        noAudio?: boolean | undefined;
        noAudioReplies?: boolean | undefined;
        markdownImageReplies?: boolean | undefined;
        markdownVideoReplies?: boolean | undefined;
        noPostUpvotes?: boolean | undefined;
        noReplyUpvotes?: boolean | undefined;
        noPostDownvotes?: boolean | undefined;
        noReplyDownvotes?: boolean | undefined;
        noUpvotes?: boolean | undefined;
        noDownvotes?: boolean | undefined;
        requirePostLink?: boolean | undefined;
        requirePostLinkIsMedia?: boolean | undefined;
        pseudonymityMode?: "per-post" | "per-reply" | "per-author" | undefined;
    } | undefined;
    suggested?: {
        [x: string]: unknown;
        primaryColor?: string | undefined;
        secondaryColor?: string | undefined;
        avatarUrl?: string | undefined;
        bannerUrl?: string | undefined;
        backgroundUrl?: string | undefined;
        language?: string | undefined;
    } | undefined;
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
    ipnsPubsubTopicRoutingCid?: string | undefined;
    pubsubTopicRoutingCid?: string | undefined;
}, "state" | "clients" | "startedState" | "updatingState" | "started">;
export declare function jsonifyCommentAndRemoveInstanceProps(comment: Comment): Omit<any, "state" | "publishingState" | "clients" | "raw" | "updatingState">;
export declare function waitUntilPlebbitSubplebbitsIncludeSubAddress(plebbit: Plebbit, subAddress: string): Promise<void>;
export declare function isPlebbitFetchingUsingGateways(plebbit: Plebbit): boolean;
export declare function mockRpcServerForTests(plebbitWs: any): void;
export declare function disablePreloadPagesOnSub({ subplebbit }: {
    subplebbit: LocalSubplebbit;
}): {
    cleanup: () => void;
};
export declare function mockPostToReturnSpecificCommentUpdate(commentToBeMocked: Comment, commentUpdateRecordString: string): void;
export declare function mockPostToFailToLoadFromPostUpdates(postToBeMocked: Comment): void;
export declare function mockPostToHaveSubplebbitWithNoPostUpdates(postToBeMocked: Comment): void;
export declare function createCommentUpdateWithInvalidSignature(commentCid: string): Promise<{
    cid: string;
    upvoteCount: number;
    downvoteCount: number;
    replyCount: number;
    updatedAt: number;
    signature: {
        type: string;
        signature: string;
        publicKey: string;
        signedPropertyNames: string[];
    };
    protocolVersion: string;
    childCount?: number | undefined;
    number?: number | undefined;
    postNumber?: number | undefined;
    edit?: {
        [x: string]: unknown;
        timestamp: number;
        signature: {
            type: string;
            signature: string;
            publicKey: string;
            signedPropertyNames: string[];
        };
        subplebbitAddress: string;
        protocolVersion: string;
        commentCid: string;
        author: {
            [x: string]: unknown;
            address: string;
            previousCommentCid?: string | undefined;
            displayName?: string | undefined;
            wallets?: Record<string, {
                address: string;
                timestamp: number;
                signature: {
                    signature: string;
                    type: string;
                };
            }> | undefined;
            avatar?: {
                [x: string]: unknown;
                chainTicker: string;
                address: string;
                id: string;
                timestamp: number;
                signature: {
                    signature: string;
                    type: string;
                };
            } | undefined;
            flairs?: {
                [x: string]: unknown;
                text: string;
                backgroundColor?: string | undefined;
                textColor?: string | undefined;
                expiresAt?: number | undefined;
            }[] | undefined;
        };
        flairs?: {
            [x: string]: unknown;
            text: string;
            backgroundColor?: string | undefined;
            textColor?: string | undefined;
            expiresAt?: number | undefined;
        }[] | undefined;
        content?: string | undefined;
        deleted?: boolean | undefined;
        spoiler?: boolean | undefined;
        nsfw?: boolean | undefined;
        reason?: string | undefined;
    } | undefined;
    flairs?: {
        [x: string]: unknown;
        text: string;
        backgroundColor?: string | undefined;
        textColor?: string | undefined;
        expiresAt?: number | undefined;
    }[] | undefined;
    spoiler?: boolean | undefined;
    nsfw?: boolean | undefined;
    pinned?: boolean | undefined;
    locked?: boolean | undefined;
    removed?: boolean | undefined;
    reason?: string | undefined;
    approved?: boolean | undefined;
    author?: {
        [x: string]: unknown;
        subplebbit?: {
            [x: string]: unknown;
            postScore: number;
            replyScore: number;
            firstCommentTimestamp: number;
            lastCommentCid: string;
            banExpiresAt?: number | undefined;
            flairs?: {
                [x: string]: unknown;
                text: string;
                backgroundColor?: string | undefined;
                textColor?: string | undefined;
                expiresAt?: number | undefined;
            }[] | undefined;
        } | undefined;
    } | undefined;
    lastChildCid?: string | undefined;
    lastReplyTimestamp?: number | undefined;
    replies?: {
        pages: Record<string, {
            comments: {
                comment: {
                    [x: string]: unknown;
                    timestamp: number;
                    signature: {
                        type: string;
                        signature: string;
                        publicKey: string;
                        signedPropertyNames: string[];
                    };
                    subplebbitAddress: string;
                    protocolVersion: string;
                    author: {
                        [x: string]: unknown;
                        address: string;
                        previousCommentCid?: string | undefined;
                        displayName?: string | undefined;
                        wallets?: Record<string, {
                            address: string;
                            timestamp: number;
                            signature: {
                                signature: string;
                                type: string;
                            };
                        }> | undefined;
                        avatar?: {
                            [x: string]: unknown;
                            chainTicker: string;
                            address: string;
                            id: string;
                            timestamp: number;
                            signature: {
                                signature: string;
                                type: string;
                            };
                        } | undefined;
                        flairs?: {
                            [x: string]: unknown;
                            text: string;
                            backgroundColor?: string | undefined;
                            textColor?: string | undefined;
                            expiresAt?: number | undefined;
                        }[] | undefined;
                    };
                    depth: number;
                    flairs?: {
                        [x: string]: unknown;
                        text: string;
                        backgroundColor?: string | undefined;
                        textColor?: string | undefined;
                        expiresAt?: number | undefined;
                    }[] | undefined;
                    content?: string | undefined;
                    spoiler?: boolean | undefined;
                    nsfw?: boolean | undefined;
                    link?: string | undefined;
                    title?: string | undefined;
                    linkWidth?: number | undefined;
                    linkHeight?: number | undefined;
                    linkHtmlTagName?: string | undefined;
                    parentCid?: string | undefined;
                    postCid?: string | undefined;
                    quotedCids?: string[] | undefined;
                    thumbnailUrl?: string | undefined;
                    thumbnailUrlWidth?: number | undefined;
                    thumbnailUrlHeight?: number | undefined;
                    previousCid?: string | undefined;
                    pseudonymityMode?: "per-post" | "per-reply" | "per-author" | undefined;
                };
                commentUpdate: {
                    [x: string]: unknown;
                    cid: string;
                    upvoteCount: number;
                    downvoteCount: number;
                    replyCount: number;
                    updatedAt: number;
                    signature: {
                        type: string;
                        signature: string;
                        publicKey: string;
                        signedPropertyNames: string[];
                    };
                    protocolVersion: string;
                    childCount?: number | undefined;
                    number?: number | undefined;
                    postNumber?: number | undefined;
                    edit?: {
                        [x: string]: unknown;
                        timestamp: number;
                        signature: {
                            type: string;
                            signature: string;
                            publicKey: string;
                            signedPropertyNames: string[];
                        };
                        subplebbitAddress: string;
                        protocolVersion: string;
                        commentCid: string;
                        author: {
                            [x: string]: unknown;
                            address: string;
                            previousCommentCid?: string | undefined;
                            displayName?: string | undefined;
                            wallets?: Record<string, {
                                address: string;
                                timestamp: number;
                                signature: {
                                    signature: string;
                                    type: string;
                                };
                            }> | undefined;
                            avatar?: {
                                [x: string]: unknown;
                                chainTicker: string;
                                address: string;
                                id: string;
                                timestamp: number;
                                signature: {
                                    signature: string;
                                    type: string;
                                };
                            } | undefined;
                            flairs?: {
                                [x: string]: unknown;
                                text: string;
                                backgroundColor?: string | undefined;
                                textColor?: string | undefined;
                                expiresAt?: number | undefined;
                            }[] | undefined;
                        };
                        flairs?: {
                            [x: string]: unknown;
                            text: string;
                            backgroundColor?: string | undefined;
                            textColor?: string | undefined;
                            expiresAt?: number | undefined;
                        }[] | undefined;
                        content?: string | undefined;
                        deleted?: boolean | undefined;
                        spoiler?: boolean | undefined;
                        nsfw?: boolean | undefined;
                        reason?: string | undefined;
                    } | undefined;
                    flairs?: {
                        [x: string]: unknown;
                        text: string;
                        backgroundColor?: string | undefined;
                        textColor?: string | undefined;
                        expiresAt?: number | undefined;
                    }[] | undefined;
                    spoiler?: boolean | undefined;
                    nsfw?: boolean | undefined;
                    pinned?: boolean | undefined;
                    locked?: boolean | undefined;
                    removed?: boolean | undefined;
                    reason?: string | undefined;
                    approved?: boolean | undefined;
                    author?: {
                        [x: string]: unknown;
                        subplebbit?: {
                            [x: string]: unknown;
                            postScore: number;
                            replyScore: number;
                            firstCommentTimestamp: number;
                            lastCommentCid: string;
                            banExpiresAt?: number | undefined;
                            flairs?: {
                                [x: string]: unknown;
                                text: string;
                                backgroundColor?: string | undefined;
                                textColor?: string | undefined;
                                expiresAt?: number | undefined;
                            }[] | undefined;
                        } | undefined;
                    } | undefined;
                    lastChildCid?: string | undefined;
                    lastReplyTimestamp?: number | undefined;
                    replies?: /*elided*/ any | undefined;
                };
            }[];
            nextCid?: string | undefined;
        }>;
        pageCids?: Record<string, string> | undefined;
    } | undefined;
}>;
export declare function mockPlebbitToTimeoutFetchingCid(plebbit: Plebbit): {
    cleanUp: () => void;
};
export declare function mockCommentToNotUsePagesForUpdates(comment: Comment): void;
export declare function forceLocalSubPagesToAlwaysGenerateMultipleChunks({ subplebbit, parentComment, forcedPreloadedPageSizeBytes, parentCommentReplyProps, subplebbitPostsCommentProps }: {
    subplebbit: LocalSubplebbit | RemoteSubplebbit;
    parentComment?: Comment;
    forcedPreloadedPageSizeBytes?: number;
    parentCommentReplyProps?: Partial<CreateCommentOptions>;
    subplebbitPostsCommentProps?: CreateCommentOptions;
}): Promise<{
    cleanup: () => void;
}>;
export declare function findOrPublishCommentWithDepth({ depth, subplebbit, plebbit }: {
    depth: number;
    subplebbit: RemoteSubplebbit;
    plebbit?: Plebbit;
}): Promise<Comment>;
export declare function findOrPublishCommentWithDepthWithHttpServerShortcut({ depth, subplebbit, plebbit }: {
    depth: number;
    subplebbit: RemoteSubplebbit;
    plebbit?: Plebbit;
}): Promise<Comment>;
export declare function publishCommentWithDepth({ depth, subplebbit }: {
    depth: number;
    subplebbit: RemoteSubplebbit;
}): Promise<Comment>;
export declare function getCommentWithCommentUpdateProps({ cid, plebbit }: {
    cid: string;
    plebbit: Plebbit;
}): Promise<Comment>;
export declare function publishCommentToModQueue({ subplebbit, plebbit, parentComment, commentProps }: {
    subplebbit: RemoteSubplebbit;
    plebbit?: Plebbit;
    parentComment?: Comment;
    commentProps?: Partial<CreateCommentOptions>;
}): Promise<{
    comment: Comment;
    challengeVerification: DecryptedChallengeVerificationMessageType;
}>;
export declare function publishToModQueueWithDepth({ subplebbit, depth, plebbit, modCommentProps, commentProps }: {
    subplebbit: RemoteSubplebbit;
    plebbit: Plebbit;
    depth: number;
    modCommentProps?: Partial<CreateCommentOptions>;
    commentProps?: Partial<CreateCommentOptions>;
}): Promise<{
    comment: Comment;
    challengeVerification: unknown;
}>;
export declare function forceSubplebbitToGenerateAllPostsPages(subplebbit: RemoteSubplebbit, commentProps?: CreateCommentOptions): Promise<void>;
export declare function mockReplyToUseParentPagesForUpdates(reply: Comment): void;
export declare function mockUpdatingCommentResolvingAuthor(comment: Comment, mockFunction: Comment["_clientsManager"]["resolveAuthorAddressIfNeeded"]): void;
export declare function mockCacheOfTextRecord(opts: {
    plebbit: Plebbit;
    domain: string;
    textRecord: string;
    value: string;
}): Promise<void>;
export declare function getRandomPostCidFromSub(subplebbitAddress: string, plebbit: Plebbit): Promise<string>;
export declare const describeSkipIfRpc: any;
export declare const describeIfRpc: any;
export declare const itSkipIfRpc: any;
export declare const itIfRpc: any;
export declare function mockViemClient({ plebbit, chainTicker, url, mockedViem }: {
    plebbit: Plebbit;
    chainTicker: string;
    url: string;
    mockedViem: any;
}): void;
export declare function processAllCommentsRecursively(comments: (Comment | CommentWithinRepliesPostsPageJson)[] | undefined, processor: (comment: Comment | CommentWithinRepliesPostsPageJson) => void): void;
export {};
