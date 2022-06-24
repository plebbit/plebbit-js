import { Options } from "ipfs-http-client";
import { Knex } from "knex";
import { Pages } from "./pages";
import { Signature, Signer } from "./signer";

// TODO: define types
export type PlebbitOptions = {
    ipfsHttpClientOptions: Options;
    ipfsGatewayUrl: string;
    pubsubHttpClientOptions: Options;
    dataPath: string;
    blockchainProviders: Object;
};
export type CreateSignerOptions = any;
export type Encrypted = any;
export type SubplebbitEncryption = any;
export type Nft = { chainTicker: string; id: string; address: string; signature: string };
export type SubplebbitRole = { role: "owner" | "admin" | "moderator" };
export type ChallengeType = {
    type: "image" | "text" | "video" | "audio" | "html";
};

export type SubplebbitMetrics = {
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

export type SubplebbitFeatures = {
    // any boolean that changes the functionality of the sub, add "no" in front if doesn't default to false
    noVideos?: boolean;
    noSpoilers?: boolean; // author can't comment.spoiler = true their own comments
    noImages?: boolean;
    noVideoReplies?: boolean;
    noSpoilerReplies?: boolean;
    noImageReplies?: boolean;
    noPolls?: boolean;
    noCrossposts?: boolean;
    noUpvotes?: boolean;
    noDownvotes?: boolean;
    noAuthors?: boolean; // no authors at all, like 4chan
    anonymousAuthors?: boolean; // authors are given anonymous ids inside threads, like 4chan
    noNestedReplies?: boolean; // no nested replies, like old school forums and 4chan
    safeForWork?: boolean;
    authorFlairs?: boolean; // authors can choose their own author flairs (otherwise only mods can)
    requireAuthorFlairs?: boolean; // force authors to choose an author flair before posting
    postFlairs?: boolean; // authors can choose their own post flairs (otherwise only mods can)
    requirePostFlairs?: boolean; // force authors to choose a post flair before posting
    noMarkdownImages?: boolean; // don't embed images in text posts markdown
    noMarkdownVideos?: boolean; // don't embed videos in text posts markdown
    markdownImageReplies?: boolean;
    markdownVideoReplies?: boolean;
};

export type SubplebbitSuggested = {
    // values suggested by the sub owner, the client/user can ignore them without breaking interoperability
    primaryColor?: string;
    secondaryColor?: string;
    avatarUrl?: string;
    bannerUrl?: string;
    backgroundUrl?: string;
    language?: string;
    // TODO: menu links, wiki pages, sidebar widgets
};

export type Flair = {
    text: string;
    backgroundColor?: string;
    textColor?: string;
    expiresAt?: number; // timestamp in second, a flair assigned to an author by a mod will follow the author in future comments, unless it expires
};

export interface SubplebbitType {
    title?: string;
    description?: string;
    roles?: { [authorAddress: string]: SubplebbitRole }; // each author address can be mapped to 1 SubplebbitRole
    pubsubTopic?: string; // the string to publish to in the pubsub, a public key of the subplebbit owner's choice
    latestPostCid?: string; // the most recent post in the linked list of posts
    posts?: Pages; // only preload page 1 sorted by 'hot', might preload more later, comments should include Comment + CommentUpdate data
    challengeTypes?: ChallengeType[]; // optional, only used for displaying on frontend, don't rely on it for challenge negotiation
    metricsCid?: string;
    createdAt?: number;
    updatedAt?: number;
    features?: SubplebbitFeatures;
    suggested?: SubplebbitSuggested;
    rules?: string[];
    address?: string;
    signer?: Signer;
    // flairs: {[key: 'post' | 'author']: Flair[]} // list of post/author flairs authors and mods can choose from
    protocolVersion: "1.0.0"; // semantic version of the protocol https://semver.org/
    encryption?: SubplebbitEncryption;
    signature?: Signature; // signature of the Subplebbit update by the sub owner to protect against malicious gateway
}
export type CreateSubplebbitOptions = SubplebbitType & { database?: Knex.Config };

export interface SubplebbitEditOptions {
    title?: string;
    description?: string;
    roles?: { [authorAddress: string]: SubplebbitRole };
    latestPostCid?: string;
    posts?: Pages;
    pubsubTopic?: string;
    challengeTypes?: ChallengeType[];
    metrics?: SubplebbitMetrics;
    features?: SubplebbitFeatures;
    suggested?: SubplebbitSuggested;
    // flairs?: Flair[];
    address?: string;
}
