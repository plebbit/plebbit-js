import type { LocalSubplebbit } from "../runtime/node/subplebbit/local-subplebbit.js";
import type { JsonSignature, SignerType } from "../signer/constants.js";
import { SignerWithPublicKeyAddress } from "../signer/index.js";
import type { ChallengeType, DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor, PostsPagesTypeIpfs, PostsPagesTypeJson, ProtocolVersion } from "../types.js";
import type { RpcLocalSubplebbit } from "./rpc-local-subplebbit.js";
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
export interface RemoteSubplebbitJsonType extends Omit<SubplebbitIpfsType, "posts"> {
    shortAddress: string;
    posts?: PostsPagesTypeJson;
}
export interface LocalSubplebbitJsonType extends Omit<InternalSubplebbitType, "posts" | "signer"> {
    shortAddress: string;
    posts?: PostsPagesTypeJson;
    signer: InternalSubplebbitRpcType["signer"];
}
export type LocalSubplebbitRpcJsonType = Omit<InternalSubplebbitRpcType, "posts"> & {
    shortAddress: string;
    posts?: PostsPagesTypeJson;
};
export interface SubplebbitIpfsType {
    posts?: PostsPagesTypeIpfs;
    challenges: SubplebbitChallenge[];
    signature: JsonSignature;
    encryption: SubplebbitEncryption;
    address: string;
    createdAt: number;
    updatedAt: number;
    pubsubTopic?: string;
    statsCid: string;
    protocolVersion: ProtocolVersion;
    postUpdates?: {
        [timestampRange: string]: string;
    };
    title?: string;
    description?: string;
    roles?: {
        [authorAddress: string]: SubplebbitRole;
    };
    rules?: string[];
    lastPostCid?: string;
    lastCommentCid?: string;
    features?: SubplebbitFeatures;
    suggested?: SubplebbitSuggested;
    flairs?: Record<FlairOwner, Flair[]>;
}
export interface InternalSubplebbitType extends SubplebbitIpfsType, Pick<SubplebbitEditOptions, "settings"> {
    signer: Pick<SignerWithPublicKeyAddress, "address" | "privateKey" | "type" | "shortAddress" | "publicKey">;
    _subplebbitUpdateTrigger: boolean;
    _usingDefaultChallenge: boolean;
}
export interface InternalSubplebbitRpcType extends Omit<InternalSubplebbitType, "signer" | "_subplebbitUpdateTrigger"> {
    started: RpcLocalSubplebbit["started"];
    signer: Pick<InternalSubplebbitType["signer"], "address" | "type" | "shortAddress" | "publicKey">;
}
export interface CreateRemoteSubplebbitOptions extends Partial<SubplebbitIpfsType> {
    address: SubplebbitIpfsType["address"];
}
export interface CreateNewLocalSubplebbitUserOptions extends Omit<SubplebbitEditOptions, "address"> {
    signer?: Pick<SignerType, "privateKey" | "type">;
}
export type CreateNewLocalSubplebbitParsedOptions = CreateNewLocalSubplebbitUserOptions & {
    address: SignerType["address"];
    signer: SignerWithPublicKeyAddress;
};
export type CreateInstanceOfLocalOrRemoteSubplebbitOptions = {
    address: SubplebbitIpfsType["address"];
};
export interface SubplebbitEditOptions extends Partial<Pick<SubplebbitIpfsType, "flairs" | "address" | "title" | "description" | "roles" | "rules" | "lastPostCid" | "lastCommentCid" | "pubsubTopic" | "features" | "suggested">> {
    settings?: SubplebbitSettings;
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
export type ChallengeResult = {
    success: true;
} | {
    success: false;
    error: string;
};
export interface ChallengeFile {
    optionInputs?: OptionInput[];
    type: ChallengeType["type"];
    challenge?: ChallengeType["challenge"];
    caseInsensitive?: ChallengeType["caseInsensitive"];
    description?: string;
    getChallenge: (challenge: SubplebbitChallengeSettings, challengeRequest: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor, challengeIndex: number, subplebbit: LocalSubplebbit) => Promise<Challenge | ChallengeResult>;
}
export type ChallengeFileFactory = (subplebbitChallengeSettings: SubplebbitChallengeSettings) => ChallengeFile;
export type SubplebbitSettings = {
    fetchThumbnailUrls?: boolean;
    fetchThumbnailUrlsProxyUrl?: string;
    challenges?: SubplebbitChallengeSettings[] | null | undefined;
};
export {};
