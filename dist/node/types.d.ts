import { Options } from "ipfs-http-client";
import { Knex } from "knex";
import Author from "./author";
import { Comment } from "./comment";
import { Pages } from "./pages";
import { Signature, Signer } from "./signer";
export declare type BlockchainProvider = {
    url: string;
    chainId: number;
};
export interface PlebbitOptions {
    ipfsGatewayUrl?: string;
    ipfsHttpClientOptions?: Options;
    pubsubHttpClientOptions?: Options;
    dataPath?: string;
    blockchainProviders?: {
        [chainTicker: string]: BlockchainProvider;
    };
    resolveAuthorAddresses?: boolean;
}
export declare type CreateSignerOptions = {
    privateKey?: string;
    type?: "rsa";
};
export declare type Encrypted = {
    encrypted: string;
    encryptedKey: string;
    type: "aes-cbc";
};
export declare type SubplebbitEncryption = {
    type: "aes-cbc";
    publicKey: string;
};
export interface CreateCommentOptions {
    subplebbitAddress: string;
    timestamp?: number;
    author: Author;
    signer: Signer;
    parentCid?: string;
    content?: string;
    title?: string;
    link?: string;
    spoiler?: boolean;
    flair?: Flair;
    cid?: string;
    ipnsName?: string;
}
export interface CreateVoteOptions {
    subplebbitAddress: string;
    commentCid: string;
    author: Author;
    vote: 1 | 0 | -1;
    signer: Signer;
    timestamp?: number;
}
export interface CreateCommentEditOptions {
    subplebbitAddress: string;
    commentCid: string;
    signer: Signer;
    content?: string;
    editTimestamp?: number;
    editReason?: string;
    deleted?: boolean;
    flair?: Flair;
    spoiler?: boolean;
    pinned?: boolean;
    locked?: boolean;
    removed?: boolean;
    authorBanExpiresAt?: number;
    authorFlair?: Flair;
    moderatorReason?: string;
}
export declare type Nft = {
    chainTicker: string;
    id: string;
    address: string;
    signature: string;
};
export declare type SubplebbitRole = {
    role: "owner" | "admin" | "moderator";
};
export declare type ChallengeType = {
    type: "image" | "text" | "video" | "audio" | "html";
};
export declare type SubplebbitMetrics = {
    hourActiveUserCount: number;
    dayActiveUserCount: number;
    weekActiveUserCount: number;
    monthActiveUserCount: number;
    yearActiveUserCount: number;
    allActiveUserCount: number;
    hourPostCount: number;
    dayPostCount: number;
    weekPostCount: number;
    monthPostCount: number;
    yearPostCount: number;
    allPostCount: number;
};
export declare type SubplebbitFeatures = {
    noVideos?: boolean;
    noSpoilers?: boolean;
    noImages?: boolean;
    noVideoReplies?: boolean;
    noSpoilerReplies?: boolean;
    noImageReplies?: boolean;
    noPolls?: boolean;
    noCrossposts?: boolean;
    noUpvotes?: boolean;
    noDownvotes?: boolean;
    noAuthors?: boolean;
    anonymousAuthors?: boolean;
    noNestedReplies?: boolean;
    safeForWork?: boolean;
    authorFlairs?: boolean;
    requireAuthorFlairs?: boolean;
    postFlairs?: boolean;
    requirePostFlairs?: boolean;
    noMarkdownImages?: boolean;
    noMarkdownVideos?: boolean;
    markdownImageReplies?: boolean;
    markdownVideoReplies?: boolean;
};
export declare type SubplebbitSuggested = {
    primaryColor?: string;
    secondaryColor?: string;
    avatarUrl?: string;
    bannerUrl?: string;
    backgroundUrl?: string;
    language?: string;
};
export declare type Flair = {
    text: string;
    backgroundColor?: string;
    textColor?: string;
    expiresAt?: number;
};
export declare type FlairOwner = "post" | "author";
export interface SubplebbitType {
    title?: string;
    description?: string;
    roles?: {
        [authorAddress: string]: SubplebbitRole;
    };
    pubsubTopic?: string;
    latestPostCid?: string;
    posts?: Pages;
    challengeTypes?: ChallengeType[];
    metricsCid?: string;
    createdAt?: number;
    updatedAt?: number;
    features?: SubplebbitFeatures;
    suggested?: SubplebbitSuggested;
    rules?: string[];
    address?: string;
    signer?: Signer;
    flairs?: Record<FlairOwner, Flair[]>;
    protocolVersion?: "1.0.0";
    encryption?: SubplebbitEncryption;
    signature?: Signature;
}
export declare type CreateSubplebbitOptions = SubplebbitType & {
    database?: Knex.Config;
};
export interface SubplebbitEditOptions {
    title?: string;
    description?: string;
    roles?: {
        [authorAddress: string]: SubplebbitRole;
    };
    latestPostCid?: string;
    posts?: Pages;
    pubsubTopic?: string;
    challengeTypes?: ChallengeType[];
    metrics?: SubplebbitMetrics;
    features?: SubplebbitFeatures;
    suggested?: SubplebbitSuggested;
    flairs?: Record<FlairOwner, Flair[]>;
    address?: string;
}
export declare type Timeframe = "HOUR" | "DAY" | "WEEK" | "MONTH" | "YEAR" | "ALL";
export declare type PostSortName = "hot" | "new" | "topHour" | "topDay" | "topWeek" | "topMonth" | "topYear" | "topAll" | "controversialHour" | "controversialDay" | "controversialWeek" | "controversialMonth" | "controversialYear" | "controversialAll";
export declare type ReplySortName = "topAll" | "new" | "old" | "controversialAll";
export declare type SortProps = {
    score?: (comment: Comment) => number;
    timeframe?: Timeframe;
};
export declare type PostSort = Record<PostSortName, SortProps>;
export declare type ReplySort = Record<ReplySortName, SortProps>;
export interface CommentUpdate {
    content?: string;
    editSignature?: Signature;
    editTimestamp?: number;
    editReason?: string;
    deleted?: boolean;
    upvoteCount?: number;
    downvoteCount?: number;
    replies?: Pages;
    flair?: Flair;
    spoiler?: boolean;
    pinned?: boolean;
    locked?: boolean;
    removed?: boolean;
    authorBanExpiresAt?: number;
    moderatorReason?: string;
    updatedAt?: number;
    authorFlair?: Flair;
    protocolVersion: "1.0.0";
    signature: Signature;
}
export declare type CommentSignedPropertyNames = (keyof Pick<CreateCommentOptions, "subplebbitAddress" | "author" | "timestamp" | "content" | "title" | "link" | "parentCid">)[];
export declare type CommentEditSignedPropertyNames = (keyof Pick<CreateCommentEditOptions, "subplebbitAddress" | "content" | "commentCid" | "editTimestamp" | "editReason" | "deleted" | "spoiler" | "pinned" | "locked" | "removed" | "moderatorReason">)[];
export declare type CommentUpdatedSignedPropertyNames = (keyof Omit<CommentUpdate, "signature">)[];
export declare type VoteSignedPropertyNames = (keyof Omit<CreateVoteOptions, "signer">)[];
export declare type SubplebbitSignedPropertyNames = (keyof Omit<SubplebbitType, "signer" | "signature">)[];
export declare type SignedPropertyNames = CommentSignedPropertyNames | CommentEditSignedPropertyNames | VoteSignedPropertyNames | SubplebbitSignedPropertyNames | CommentUpdatedSignedPropertyNames;
