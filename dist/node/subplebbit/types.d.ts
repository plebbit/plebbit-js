import { JsonSignature, SignerType } from "../signer/constants.js";
import { ChallengeType, DecryptedChallengeRequestMessageType, PagesTypeIpfs, PagesTypeJson, ProtocolVersion } from "../types.js";
import { RemoteSubplebbit } from "./remote-subplebbit.js";
export type SubplebbitStats = {
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
    requirePostLink?: boolean;
    requirePostLinkIsMedia?: boolean;
};
export type SubplebbitSuggested = {
    primaryColor?: string;
    secondaryColor?: string;
    avatarUrl?: string;
    bannerUrl?: string;
    backgroundUrl?: string;
    language?: string;
};
export type Flair = {
    text: string;
    backgroundColor?: string;
    textColor?: string;
    expiresAt?: number;
};
export type SubplebbitEncryption = {
    type: "ed25519-aes-gcm";
    publicKey: string;
};
export type SubplebbitRole = {
    role: "owner" | "admin" | "moderator";
};
export type FlairOwner = "post" | "author";
export interface SubplebbitType extends Omit<CreateSubplebbitOptions, "database" | "signer"> {
    signature: JsonSignature;
    encryption: SubplebbitEncryption;
    address: string;
    shortAddress: string;
    signer?: SignerType;
    createdAt: number;
    updatedAt: number;
    pubsubTopic?: string;
    statsCid?: string;
    protocolVersion: ProtocolVersion;
    posts?: PagesTypeJson;
    postUpdates?: {
        [timestampRange: string]: string;
    };
}
export interface SubplebbitIpfsType extends Omit<SubplebbitType, "posts" | "shortAddress" | "settings" | "signer"> {
    posts?: PagesTypeIpfs;
    challenges: Required<SubplebbitType["challenges"]>;
}
export interface InternalSubplebbitType extends SubplebbitIpfsType, Pick<CreateSubplebbitOptions, "settings"> {
    signer: Pick<SignerType, "address" | "privateKey" | "type">;
    _subplebbitUpdateTrigger: boolean;
    _usingDefaultChallenge: boolean;
    startedState: RemoteSubplebbit["startedState"];
}
export interface InternalSubplebbitRpcType extends Omit<InternalSubplebbitType, "signer" | "_subplebbitUpdateTrigger"> {
}
export interface CreateSubplebbitOptions extends SubplebbitEditOptions {
    createdAt?: number;
    updatedAt?: number;
    signer?: Pick<SignerType, "privateKey" | "type">;
    encryption?: SubplebbitEncryption;
    signature?: JsonSignature;
}
export interface SubplebbitEditOptions {
    title?: string;
    description?: string;
    roles?: {
        [authorAddress: string]: SubplebbitRole;
    };
    rules?: string[];
    lastPostCid?: string;
    lastCommentCid?: string;
    pubsubTopic?: string;
    stats?: SubplebbitStats;
    features?: SubplebbitFeatures;
    suggested?: SubplebbitSuggested;
    flairs?: Record<FlairOwner, Flair[]>;
    address?: string;
    settings?: SubplebbitSettings;
    challenges?: SubplebbitChallenge[];
}
interface ExcludeSubplebbit {
    addresses: string[];
    maxCommentCids: number;
    postScore?: number;
    postReply?: number;
    firstCommentTimestamp?: number;
}
export interface Exclude {
    subplebbit?: ExcludeSubplebbit;
    postScore?: number;
    replyScore?: number;
    firstCommentTimestamp?: number;
    challenges?: number[];
    post?: boolean;
    reply?: boolean;
    vote?: boolean;
    role?: SubplebbitRole["role"][];
    address?: string[];
    rateLimit?: number;
    rateLimitChallengeSuccess?: boolean;
}
interface ExcludeSubplebbit {
    addresses: string[];
    maxCommentCids: number;
    postScore?: number;
    replyScore?: number;
    firstCommentTimestamp?: number;
}
interface OptionInput {
    option: string;
    label: string;
    default?: string;
    description?: string;
    placeholder?: string;
    required?: boolean;
}
export interface SubplebbitChallenge {
    exclude?: Exclude[];
    description?: string;
    challenge?: string;
    type?: string;
}
export interface SubplebbitChallengeSettings {
    path?: string;
    name?: string;
    options?: {
        [optionPropertyName: string]: string;
    };
    exclude?: Exclude[];
    description?: string;
}
export interface Challenge {
    challenge: string;
    verify: (answer: string) => Promise<ChallengeResult>;
    type: ChallengeType["type"];
}
export interface ChallengeResult {
    success: boolean;
    error?: string;
}
export interface ChallengeFile {
    optionInputs?: OptionInput[];
    type: "image/png" | "text/plain" | "chain/<chainTicker>";
    challenge?: string;
    description?: string;
    getChallenge: (challenge: SubplebbitChallengeSettings, challengeRequest: DecryptedChallengeRequestMessageType, challengeIndex: number) => Promise<Challenge | ChallengeResult>;
}
export type ChallengeFileFactory = (subplebbitChallengeSettings: SubplebbitChallengeSettings) => ChallengeFile;
export type SubplebbitSettings = {
    fetchThumbnailUrls?: boolean;
    fetchThumbnailUrlsProxyUrl?: string;
    challenges?: SubplebbitChallengeSettings[] | null | undefined;
};
export {};
