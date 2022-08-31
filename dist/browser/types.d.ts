import { Options } from "ipfs-http-client";
import { Knex } from "knex";
import { Pages } from "./pages";
import { Subplebbit } from "./subplebbit";
export declare type ProtocolVersion = "1.0.0";
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
export interface PageType {
    comments: CommentType[];
    nextCid?: string;
}
export interface PagesType {
    pages: Partial<Record<PostSortName | ReplySortName, PageType>>;
    pageCids: Partial<Record<PostSortName | ReplySortName, string>>;
    subplebbit: Subplebbit;
}
export interface SignerType {
    type: "rsa";
    privateKey: string;
    publicKey?: string;
    address?: string;
    ipfsKey?: Uint8Array;
    usage?: "comment" | "subplebbit";
    ipnsKeyName?: string;
}
export declare type Encrypted = {
    encrypted: string;
    encryptedKey: string;
    type: "aes-cbc";
};
export declare type SubplebbitEncryption = {
    type: "aes-cbc";
    publicKey: string;
};
export interface CreateCommentOptions extends CreatePublicationOptions {
    signer: SignerType;
    parentCid?: string;
    content?: string;
    title?: string;
    link?: string;
    spoiler?: boolean;
    flair?: Flair;
    cid?: string;
    ipnsName?: string;
}
export interface CreateVoteOptions extends CreatePublicationOptions {
    commentCid: string;
    vote: 1 | 0 | -1;
    signer: SignerType;
}
export interface VoteType extends Omit<CreateVoteOptions, "signer">, PublicationType {
    author: AuthorType;
    timestamp: number;
    signer?: SignerType;
}
export interface AuthorType {
    address: string;
    previousCommentCid?: string;
    displayName?: string;
    wallets?: {
        [chainTicker: string]: Wallet;
    };
    avatar?: Nft;
    flair?: Flair;
    banExpiresAt?: number;
}
export declare type Wallet = {
    address: string;
};
export interface SignatureType {
    signature: string;
    publicKey: string;
    type: "rsa";
    signedPropertyNames: SignedPropertyNames;
}
export interface PublicationType extends Required<CreatePublicationOptions> {
    author: AuthorType;
    signature: SignatureType;
    protocolVersion: ProtocolVersion;
}
interface CreatePublicationOptions {
    author?: Partial<AuthorType>;
    subplebbitAddress: string;
    timestamp?: number;
}
export interface ModeratorCommentEditOptions {
    commentCid: string;
    flair?: Flair;
    spoiler?: boolean;
    pinned?: boolean;
    locked?: boolean;
    removed?: boolean;
    moderatorReason?: string;
    commentAuthor?: CommentAuthorEditOptions;
}
interface AuthorCommentEditOptions {
    commentCid: string;
    content?: string;
    deleted?: boolean;
    flair?: Flair;
    spoiler?: boolean;
    reason?: string;
}
export interface AuthorCommentEdit extends AuthorCommentEditOptions, PublicationType {
}
export interface ModeratorCommentEdit extends ModeratorCommentEditOptions, PublicationType {
}
export declare type CommentAuthorEditOptions = Pick<AuthorType, "banExpiresAt" | "flair">;
export interface CreateCommentEditOptions extends AuthorCommentEdit, ModeratorCommentEdit {
    signer: SignerType;
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
export interface SubplebbitType extends CreateSubplebbitOptions {
    signature: SignatureType;
    encryption: SubplebbitEncryption;
    address: string;
    createdAt: number;
    updatedAt: number;
    pubsubTopic: string;
    metricsCid?: string;
    protocolVersion: ProtocolVersion;
}
export interface CreateSubplebbitOptions extends SubplebbitEditOptions {
    createdAt?: number;
    updatedAt?: number;
    signer?: SignerType;
    encryption?: SubplebbitEncryption;
    signature?: SignatureType;
    database?: Knex.Config;
}
export interface SubplebbitEditOptions {
    title?: string;
    description?: string;
    roles?: {
        [authorAddress: string]: SubplebbitRole;
    };
    rules?: string[];
    lastPostCid?: string;
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
    score?: (comment: CommentType) => number;
    timeframe?: Timeframe;
};
export declare type PostSort = Record<PostSortName, SortProps>;
export declare type ReplySort = Record<ReplySortName, SortProps>;
export interface CommentUpdate {
    upvoteCount: number;
    downvoteCount: number;
    replyCount: number;
    authorEdit?: AuthorCommentEdit;
    replies?: Pages;
    flair?: Flair;
    spoiler?: boolean;
    pinned?: boolean;
    locked?: boolean;
    removed?: boolean;
    moderatorReason?: string;
    updatedAt: number;
    protocolVersion: ProtocolVersion;
    signature: SignatureType;
    author?: CommentAuthorEditOptions;
}
export interface CommentType extends Partial<CommentUpdate>, Omit<CreateCommentOptions, "signer">, PublicationType {
    author: AuthorType;
    timestamp: number;
    protocolVersion: ProtocolVersion;
    signature: SignatureType;
    postCid?: string;
    previousCid?: string;
    ipnsKeyName?: string;
    depth?: number;
    signer?: SignerType;
    original?: Pick<Partial<CommentType>, "author" | "content" | "flair">;
    thumbnailUrl?: string;
}
export interface PostType extends CommentType {
    parentCid: undefined;
    title: string;
    depth: 0;
    link?: string;
    thumbnailUrl?: string;
}
export interface CommentEditType extends PublicationType, Omit<CreateCommentEditOptions, "signer"> {
    signer?: SignerType;
}
export declare type PublicationTypeName = "comment" | "vote" | "commentedit" | "commentupdate" | "subplebbit";
export declare type CommentSignedPropertyNames = (keyof Pick<CreateCommentOptions, "subplebbitAddress" | "author" | "timestamp" | "content" | "title" | "link" | "parentCid">)[];
export declare type CommentEditSignedPropertyNames = (keyof Omit<CreateCommentEditOptions, "signer" | "signature" | "protocolVersion">)[];
export declare type CommentUpdatedSignedPropertyNames = (keyof Omit<CommentUpdate, "signature" | "protocolVersion">)[];
export declare type VoteSignedPropertyNames = (keyof Omit<CreateVoteOptions, "signer" | "protocolVersion">)[];
export declare type SubplebbitSignedPropertyNames = (keyof Omit<SubplebbitType, "signer" | "signature" | "protocolVersion">)[];
export declare type SignedPropertyNames = CommentSignedPropertyNames | CommentEditSignedPropertyNames | VoteSignedPropertyNames | SubplebbitSignedPropertyNames | CommentUpdatedSignedPropertyNames;
export {};
