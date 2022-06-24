import { Options } from "ipfs-http-client";
import { Knex } from "knex";
import { Pages } from "./pages";
import { Signature, Signer } from "./signer";
export declare type PlebbitOptions = {
    ipfsHttpClientOptions: Options;
    ipfsGatewayUrl: string;
    pubsubHttpClientOptions: Options;
    dataPath: string;
    blockchainProviders: Object;
};
export declare type CreateSignerOptions = any;
export declare type Encrypted = any;
export declare type SubplebbitEncryption = any;
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
    protocolVersion: "1.0.0";
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
    address?: string;
}
