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
    // any boolean that changes the functionality of the sub, add "no" in front if doesn't default to false
    noVideos?: boolean; // Not implemented
    noSpoilers?: boolean; // Not implemented. Author can't comment.spoiler = true their own comments
    noImages?: boolean; // Not implemented
    noVideoReplies?: boolean; // Not implemented
    noSpoilerReplies?: boolean; // Not implemented
    noImageReplies?: boolean; // Not implemented
    noPolls?: boolean; // Not impllemented
    noCrossposts?: boolean; // Not implemented
    noUpvotes?: boolean; // Not implemented
    noDownvotes?: boolean; // Not implemented
    noAuthors?: boolean; // Not implemented. No authors at all, like 4chan
    anonymousAuthors?: boolean; // Not implemented. Authors are given anonymous ids inside threads, like 4chan
    noNestedReplies?: boolean; // Not implemented. No nested replies, like old school forums and 4chan
    safeForWork?: boolean; // Not implemented
    authorFlairs?: boolean; // Not implemented. Authors can choose their own author flairs (otherwise only mods can)
    requireAuthorFlairs?: boolean; // Not implemented. Force authors to choose an author flair before posting
    postFlairs?: boolean; // Not implemented. Authors can choose their own post flairs (otherwise only mods can)
    requirePostFlairs?: boolean; // Not implemented. Force authors to choose a post flair before posting
    noMarkdownImages?: boolean; // Not implemented. Don't embed images in text posts markdown
    noMarkdownVideos?: boolean; // Not implemented. Don't embed videos in text posts markdown
    markdownImageReplies?: boolean; // Not implemented
    markdownVideoReplies?: boolean; // Not implemented
    requirePostLink?: boolean; // post.link must be defined and a valid https url
    requirePostLinkIsMedia?: boolean; // post.link must be of media (audio, video, image)
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

export type SubplebbitEncryption = {
    type: "ed25519-aes-gcm"; // https://github.com/plebbit/plebbit-js/blob/master/docs/encryption.md
    publicKey: string; // 32 bytes base64 string (same as subplebbit.signer.publicKey)
};

export type SubplebbitRole = { role: "owner" | "admin" | "moderator" };

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
    protocolVersion: ProtocolVersion; // semantic version of the protocol https://semver.org/
    posts?: PagesTypeJson;
    postUpdates?: { [timestampRange: string]: string }; // Timestamp range to cid of folder
}

export interface SubplebbitIpfsType extends Omit<SubplebbitType, "posts" | "shortAddress" | "settings" | "signer"> {
    posts?: PagesTypeIpfs;
    challenges: Required<SubplebbitType["challenges"]>;
}

// This type will be stored in the db as the current state
export interface InternalSubplebbitType extends SubplebbitIpfsType, Pick<CreateSubplebbitOptions, "settings"> {
    signer: Pick<SignerType, "address" | "privateKey" | "type">;
    _subplebbitUpdateTrigger: boolean;
    _usingDefaultChallenge: boolean;
    startedState: RemoteSubplebbit["startedState"];
}

export interface InternalSubplebbitRpcType extends Omit<InternalSubplebbitType, "signer" | "_subplebbitUpdateTrigger"> {}

export interface CreateSubplebbitOptions extends SubplebbitEditOptions {
    createdAt?: number;
    updatedAt?: number;
    signer?: Pick<SignerType, "privateKey" | "type">;
    encryption?: SubplebbitEncryption;
    signature?: JsonSignature; // signature of the Subplebbit update by the sub owner to protect against malicious gateway
}

export interface SubplebbitEditOptions {
    title?: string;
    description?: string;
    roles?: { [authorAddress: string]: SubplebbitRole };
    rules?: string[];
    lastPostCid?: string;
    lastCommentCid?: string;
    pubsubTopic?: string;
    stats?: SubplebbitStats;
    features?: SubplebbitFeatures;
    suggested?: SubplebbitSuggested;
    flairs?: Record<FlairOwner, Flair[]>; // list of post/author flairs authors and mods can choose from
    address?: string;
    settings?: SubplebbitSettings;
    challenges?: SubplebbitChallenge[];
}

interface ExcludeSubplebbit {
    // singular because it only has to match 1 subplebbit
    addresses: string[]; // list of subplebbit addresses that can be used to exclude, plural because not a condition field like 'role'
    maxCommentCids: number; // maximum amount of comment cids that will be fetched to check
    postScore?: number;
    postReply?: number;
    firstCommentTimestamp?: number; // exclude if author account age is greater or equal than now - firstCommentTimestamp
}

export interface Exclude {
    // all conditions in Exclude are AND, for OR, use another Exclude item in the Exclude array
    subplebbit?: ExcludeSubplebbit; // exclude if author karma (from challengeRequestMessage.challengeCommentCids) in another subplebbit is greater or equal
    postScore?: number; // exclude if author post score is greater or equal
    replyScore?: number; // exclude if author reply score is greater or equal
    firstCommentTimestamp?: number; // exclude if author account age is greater or equal than now - firstCommentTimestamp
    challenges?: number[]; // exclude if all challenges with indexes passed, e.g. challenges: [0, 1] excludes if challenges at index 0 AND 1 passed, plural because has to match all
    post?: boolean; // exclude challenge if publication is a post
    reply?: boolean; // exclude challenge if publication is a reply
    vote?: boolean; // exclude challenge if publication is a vote
    role?: SubplebbitRole["role"][]; // exclude challenge if author.role.role = one of the string, singular because it only has to match 1 role
    address?: string[]; // exclude challenge if author.address = one of the string, singular because it only has to match 1 address
    rateLimit?: number; // exclude if publication per hour is lower than ratelimit
    rateLimitChallengeSuccess?: boolean; // only rate limit if the challengeVerification.challengeSuccess === rateLimitChallengeSuccess
}

interface ExcludeSubplebbit {
    // singular because it only has to match 1 subplebbit
    addresses: string[]; // list of subplebbit addresses that can be used to exclude, plural because not a condition field like 'role'
    maxCommentCids: number; // maximum amount of comment cids that will be fetched to check
    postScore?: number;
    replyScore?: number;
    firstCommentTimestamp?: number; // exclude if author account age is greater or equal than now - firstCommentTimestamp
}
interface OptionInput {
    option: string; // option property name, e.g. characterCount
    label: string; // option title, e.g. Character Count
    default?: string; // option default value, e.g. 10
    description?: string; // e.g. Amount of characters of the captcha
    placeholder?: string; // the value to display if the input field is empty, e.g. 10
    required?: boolean; // the option is required, the challenge will throw without it
}

// public challenges types
export interface SubplebbitChallenge {
    // copy values from private subplebbit.settings and publish to subplebbit.challenges
    exclude?: Exclude[]; // copied from subplebbit.settings.challenges.exclude
    description?: string; // copied from subplebbit.settings.challenges.description
    challenge?: string; // copied from ChallengeFile.challenge
    type?: string; // copied from ChallengeFile.type
}

export interface SubplebbitChallengeSettings {
    // the private settings of the challenge (subplebbit.settings.challenges)
    path?: string; // (only if name is undefined) the path to the challenge js file, used to get the props ChallengeFile {optionInputs, type, getChallenge}
    name?: string; // (only if path is undefined) the challengeName from Plebbit.challenges to identify it
    options?: { [optionPropertyName: string]: string }; // the options to be used to the getChallenge function, all values must be strings for UI ease of use
    exclude?: Exclude[]; // singular because it only has to match 1 exclude, the client must know the exclude setting to configure what challengeCommentCids to send
    description?: string; // describe in the frontend what kind of challenge the user will receive when publishing
}

export interface Challenge {
    // if the result of a challenge can't be optained by getChallenge(), return a challenge
    challenge: string; // e.g. '2 + 2'
    verify: (answer: string) => Promise<ChallengeResult>;
    type: ChallengeType["type"];
}
export interface ChallengeResult {
    // if the result of a challenge can be optained by getChallenge, return the result
    success: boolean;
    error?: string; // the reason why the challenge failed, add it to ChallengeVerificationMessage.errors
}

export interface ChallengeFile {
    // the result of the function exported by the challenge file
    optionInputs?: OptionInput[]; // the options inputs fields to display to the user
    type: "image/png" | "text/plain" | "chain/<chainTicker>";
    challenge?: string; // some challenges can be static and asked before the user publishes, like a password for example
    description?: string; // describe what the challenge does to display in the UI
    getChallenge: (
        challenge: SubplebbitChallengeSettings,
        challengeRequest: DecryptedChallengeRequestMessageType,
        challengeIndex: number
    ) => Promise<Challenge | ChallengeResult>;
}

export type ChallengeFileFactory = (subplebbitChallengeSettings: SubplebbitChallengeSettings) => ChallengeFile;

export type SubplebbitSettings = {
    fetchThumbnailUrls?: boolean;
    fetchThumbnailUrlsProxyUrl?: string;
    challenges?: SubplebbitChallengeSettings[] | null | undefined;
};
