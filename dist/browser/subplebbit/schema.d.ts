import { z } from "zod";
import { LocalSubplebbit } from "../runtime/browser/subplebbit/local-subplebbit.js";
import type { DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor } from "../pubsub-messages/types.js";
export declare const SubplebbitEncryptionSchema: z.ZodObject<{
    type: z.ZodEnum<["ed25519-aes-gcm"]>;
    publicKey: z.ZodString;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    type: z.ZodEnum<["ed25519-aes-gcm"]>;
    publicKey: z.ZodString;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    type: z.ZodEnum<["ed25519-aes-gcm"]>;
    publicKey: z.ZodString;
}, z.ZodTypeAny, "passthrough">>;
export declare const SubplebbitRoleSchema: z.ZodObject<{
    role: z.ZodEnum<["owner", "admin", "moderator"]>;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    role: z.ZodEnum<["owner", "admin", "moderator"]>;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    role: z.ZodEnum<["owner", "admin", "moderator"]>;
}, z.ZodTypeAny, "passthrough">>;
export declare const PubsubTopicSchema: z.ZodString;
export declare const SubplebbitSuggestedSchema: z.ZodObject<{
    primaryColor: z.ZodOptional<z.ZodString>;
    secondaryColor: z.ZodOptional<z.ZodString>;
    avatarUrl: z.ZodOptional<z.ZodString>;
    bannerUrl: z.ZodOptional<z.ZodString>;
    backgroundUrl: z.ZodOptional<z.ZodString>;
    language: z.ZodOptional<z.ZodString>;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    primaryColor: z.ZodOptional<z.ZodString>;
    secondaryColor: z.ZodOptional<z.ZodString>;
    avatarUrl: z.ZodOptional<z.ZodString>;
    bannerUrl: z.ZodOptional<z.ZodString>;
    backgroundUrl: z.ZodOptional<z.ZodString>;
    language: z.ZodOptional<z.ZodString>;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    primaryColor: z.ZodOptional<z.ZodString>;
    secondaryColor: z.ZodOptional<z.ZodString>;
    avatarUrl: z.ZodOptional<z.ZodString>;
    bannerUrl: z.ZodOptional<z.ZodString>;
    backgroundUrl: z.ZodOptional<z.ZodString>;
    language: z.ZodOptional<z.ZodString>;
}, z.ZodTypeAny, "passthrough">>;
export declare const SubplebbitFeaturesSchema: z.ZodObject<{
    noVideos: z.ZodOptional<z.ZodBoolean>;
    noSpoilers: z.ZodOptional<z.ZodBoolean>;
    noImages: z.ZodOptional<z.ZodBoolean>;
    noVideoReplies: z.ZodOptional<z.ZodBoolean>;
    noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
    noImageReplies: z.ZodOptional<z.ZodBoolean>;
    noPolls: z.ZodOptional<z.ZodBoolean>;
    noCrossposts: z.ZodOptional<z.ZodBoolean>;
    noUpvotes: z.ZodOptional<z.ZodBoolean>;
    noDownvotes: z.ZodOptional<z.ZodBoolean>;
    noAuthors: z.ZodOptional<z.ZodBoolean>;
    anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
    noNestedReplies: z.ZodOptional<z.ZodBoolean>;
    safeForWork: z.ZodOptional<z.ZodBoolean>;
    authorFlairs: z.ZodOptional<z.ZodBoolean>;
    requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
    postFlairs: z.ZodOptional<z.ZodBoolean>;
    requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
    noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
    noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
    markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
    markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
    requirePostLink: z.ZodOptional<z.ZodBoolean>;
    requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    noVideos: z.ZodOptional<z.ZodBoolean>;
    noSpoilers: z.ZodOptional<z.ZodBoolean>;
    noImages: z.ZodOptional<z.ZodBoolean>;
    noVideoReplies: z.ZodOptional<z.ZodBoolean>;
    noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
    noImageReplies: z.ZodOptional<z.ZodBoolean>;
    noPolls: z.ZodOptional<z.ZodBoolean>;
    noCrossposts: z.ZodOptional<z.ZodBoolean>;
    noUpvotes: z.ZodOptional<z.ZodBoolean>;
    noDownvotes: z.ZodOptional<z.ZodBoolean>;
    noAuthors: z.ZodOptional<z.ZodBoolean>;
    anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
    noNestedReplies: z.ZodOptional<z.ZodBoolean>;
    safeForWork: z.ZodOptional<z.ZodBoolean>;
    authorFlairs: z.ZodOptional<z.ZodBoolean>;
    requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
    postFlairs: z.ZodOptional<z.ZodBoolean>;
    requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
    noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
    noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
    markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
    markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
    requirePostLink: z.ZodOptional<z.ZodBoolean>;
    requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    noVideos: z.ZodOptional<z.ZodBoolean>;
    noSpoilers: z.ZodOptional<z.ZodBoolean>;
    noImages: z.ZodOptional<z.ZodBoolean>;
    noVideoReplies: z.ZodOptional<z.ZodBoolean>;
    noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
    noImageReplies: z.ZodOptional<z.ZodBoolean>;
    noPolls: z.ZodOptional<z.ZodBoolean>;
    noCrossposts: z.ZodOptional<z.ZodBoolean>;
    noUpvotes: z.ZodOptional<z.ZodBoolean>;
    noDownvotes: z.ZodOptional<z.ZodBoolean>;
    noAuthors: z.ZodOptional<z.ZodBoolean>;
    anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
    noNestedReplies: z.ZodOptional<z.ZodBoolean>;
    safeForWork: z.ZodOptional<z.ZodBoolean>;
    authorFlairs: z.ZodOptional<z.ZodBoolean>;
    requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
    postFlairs: z.ZodOptional<z.ZodBoolean>;
    requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
    noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
    noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
    markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
    markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
    requirePostLink: z.ZodOptional<z.ZodBoolean>;
    requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
}, z.ZodTypeAny, "passthrough">>;
export declare const ChallengeOptionInputSchema: z.ZodObject<{
    option: z.ZodString;
    label: z.ZodString;
    default: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    placeholder: z.ZodOptional<z.ZodString>;
    required: z.ZodOptional<z.ZodBoolean>;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    option: z.ZodString;
    label: z.ZodString;
    default: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    placeholder: z.ZodOptional<z.ZodString>;
    required: z.ZodOptional<z.ZodBoolean>;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    option: z.ZodString;
    label: z.ZodString;
    default: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    placeholder: z.ZodOptional<z.ZodString>;
    required: z.ZodOptional<z.ZodBoolean>;
}, z.ZodTypeAny, "passthrough">>;
export declare const ChallengeResultSchema: z.ZodUnion<[z.ZodObject<{
    success: z.ZodLiteral<true>;
}, "strip", z.ZodTypeAny, {
    success: true;
}, {
    success: true;
}>, z.ZodObject<{
    success: z.ZodLiteral<false>;
    error: z.ZodString;
}, "strip", z.ZodTypeAny, {
    error: string;
    success: false;
}, {
    error: string;
    success: false;
}>]>;
export declare const ChallengeFromGetChallengeSchema: z.ZodObject<{
    challenge: z.ZodString;
    verify: z.ZodFunction<z.ZodTuple<[z.ZodLazy<z.ZodString>], z.ZodUnknown>, z.ZodPromise<z.ZodUnion<[z.ZodObject<{
        success: z.ZodLiteral<true>;
    }, "strip", z.ZodTypeAny, {
        success: true;
    }, {
        success: true;
    }>, z.ZodObject<{
        success: z.ZodLiteral<false>;
        error: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        error: string;
        success: false;
    }, {
        error: string;
        success: false;
    }>]>>>;
    type: z.ZodString;
}, "strict", z.ZodTypeAny, {
    type: string;
    challenge: string;
    verify: (args_0: string, ...args_1: unknown[]) => Promise<{
        success: true;
    } | {
        error: string;
        success: false;
    }>;
}, {
    type: string;
    challenge: string;
    verify: (args_0: string, ...args_1: unknown[]) => Promise<{
        success: true;
    } | {
        error: string;
        success: false;
    }>;
}>;
export declare const ResultOfGetChallengeSchema: z.ZodUnion<[z.ZodObject<{
    challenge: z.ZodString;
    verify: z.ZodFunction<z.ZodTuple<[z.ZodLazy<z.ZodString>], z.ZodUnknown>, z.ZodPromise<z.ZodUnion<[z.ZodObject<{
        success: z.ZodLiteral<true>;
    }, "strip", z.ZodTypeAny, {
        success: true;
    }, {
        success: true;
    }>, z.ZodObject<{
        success: z.ZodLiteral<false>;
        error: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        error: string;
        success: false;
    }, {
        error: string;
        success: false;
    }>]>>>;
    type: z.ZodString;
}, "strict", z.ZodTypeAny, {
    type: string;
    challenge: string;
    verify: (args_0: string, ...args_1: unknown[]) => Promise<{
        success: true;
    } | {
        error: string;
        success: false;
    }>;
}, {
    type: string;
    challenge: string;
    verify: (args_0: string, ...args_1: unknown[]) => Promise<{
        success: true;
    } | {
        error: string;
        success: false;
    }>;
}>, z.ZodUnion<[z.ZodObject<{
    success: z.ZodLiteral<true>;
}, "strip", z.ZodTypeAny, {
    success: true;
}, {
    success: true;
}>, z.ZodObject<{
    success: z.ZodLiteral<false>;
    error: z.ZodString;
}, "strip", z.ZodTypeAny, {
    error: string;
    success: false;
}, {
    error: string;
    success: false;
}>]>]>;
export declare const ChallengeExcludeSubplebbitSchema: z.ZodObject<{
    addresses: z.ZodArray<z.ZodString, "many">;
    maxCommentCids: z.ZodNumber;
    postScore: z.ZodOptional<z.ZodNumber>;
    replyScore: z.ZodOptional<z.ZodNumber>;
    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
}, "strict", z.ZodTypeAny, {
    addresses: string[];
    maxCommentCids: number;
    postScore?: number | undefined;
    replyScore?: number | undefined;
    firstCommentTimestamp?: number | undefined;
}, {
    addresses: string[];
    maxCommentCids: number;
    postScore?: number | undefined;
    replyScore?: number | undefined;
    firstCommentTimestamp?: number | undefined;
}>;
export declare const ChallengeExcludeSchema: z.ZodObject<{
    subplebbit: z.ZodOptional<z.ZodObject<{
        addresses: z.ZodArray<z.ZodString, "many">;
        maxCommentCids: z.ZodNumber;
        postScore: z.ZodOptional<z.ZodNumber>;
        replyScore: z.ZodOptional<z.ZodNumber>;
        firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
    }, "strict", z.ZodTypeAny, {
        addresses: string[];
        maxCommentCids: number;
        postScore?: number | undefined;
        replyScore?: number | undefined;
        firstCommentTimestamp?: number | undefined;
    }, {
        addresses: string[];
        maxCommentCids: number;
        postScore?: number | undefined;
        replyScore?: number | undefined;
        firstCommentTimestamp?: number | undefined;
    }>>;
    postScore: z.ZodOptional<z.ZodNumber>;
    replyScore: z.ZodOptional<z.ZodNumber>;
    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
    challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
    post: z.ZodOptional<z.ZodBoolean>;
    reply: z.ZodOptional<z.ZodBoolean>;
    vote: z.ZodOptional<z.ZodBoolean>;
    role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
    address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    rateLimit: z.ZodOptional<z.ZodNumber>;
    rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    subplebbit: z.ZodOptional<z.ZodObject<{
        addresses: z.ZodArray<z.ZodString, "many">;
        maxCommentCids: z.ZodNumber;
        postScore: z.ZodOptional<z.ZodNumber>;
        replyScore: z.ZodOptional<z.ZodNumber>;
        firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
    }, "strict", z.ZodTypeAny, {
        addresses: string[];
        maxCommentCids: number;
        postScore?: number | undefined;
        replyScore?: number | undefined;
        firstCommentTimestamp?: number | undefined;
    }, {
        addresses: string[];
        maxCommentCids: number;
        postScore?: number | undefined;
        replyScore?: number | undefined;
        firstCommentTimestamp?: number | undefined;
    }>>;
    postScore: z.ZodOptional<z.ZodNumber>;
    replyScore: z.ZodOptional<z.ZodNumber>;
    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
    challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
    post: z.ZodOptional<z.ZodBoolean>;
    reply: z.ZodOptional<z.ZodBoolean>;
    vote: z.ZodOptional<z.ZodBoolean>;
    role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
    address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    rateLimit: z.ZodOptional<z.ZodNumber>;
    rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    subplebbit: z.ZodOptional<z.ZodObject<{
        addresses: z.ZodArray<z.ZodString, "many">;
        maxCommentCids: z.ZodNumber;
        postScore: z.ZodOptional<z.ZodNumber>;
        replyScore: z.ZodOptional<z.ZodNumber>;
        firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
    }, "strict", z.ZodTypeAny, {
        addresses: string[];
        maxCommentCids: number;
        postScore?: number | undefined;
        replyScore?: number | undefined;
        firstCommentTimestamp?: number | undefined;
    }, {
        addresses: string[];
        maxCommentCids: number;
        postScore?: number | undefined;
        replyScore?: number | undefined;
        firstCommentTimestamp?: number | undefined;
    }>>;
    postScore: z.ZodOptional<z.ZodNumber>;
    replyScore: z.ZodOptional<z.ZodNumber>;
    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
    challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
    post: z.ZodOptional<z.ZodBoolean>;
    reply: z.ZodOptional<z.ZodBoolean>;
    vote: z.ZodOptional<z.ZodBoolean>;
    role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
    address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    rateLimit: z.ZodOptional<z.ZodNumber>;
    rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
}, z.ZodTypeAny, "passthrough">>;
export declare const SubplebbitChallengeSchema: z.ZodObject<{
    exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
        subplebbit: z.ZodOptional<z.ZodObject<{
            addresses: z.ZodArray<z.ZodString, "many">;
            maxCommentCids: z.ZodNumber;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
        }, "strict", z.ZodTypeAny, {
            addresses: string[];
            maxCommentCids: number;
            postScore?: number | undefined;
            replyScore?: number | undefined;
            firstCommentTimestamp?: number | undefined;
        }, {
            addresses: string[];
            maxCommentCids: number;
            postScore?: number | undefined;
            replyScore?: number | undefined;
            firstCommentTimestamp?: number | undefined;
        }>>;
        postScore: z.ZodOptional<z.ZodNumber>;
        replyScore: z.ZodOptional<z.ZodNumber>;
        firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
        challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        post: z.ZodOptional<z.ZodBoolean>;
        reply: z.ZodOptional<z.ZodBoolean>;
        vote: z.ZodOptional<z.ZodBoolean>;
        role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
        address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        rateLimit: z.ZodOptional<z.ZodNumber>;
        rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        subplebbit: z.ZodOptional<z.ZodObject<{
            addresses: z.ZodArray<z.ZodString, "many">;
            maxCommentCids: z.ZodNumber;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
        }, "strict", z.ZodTypeAny, {
            addresses: string[];
            maxCommentCids: number;
            postScore?: number | undefined;
            replyScore?: number | undefined;
            firstCommentTimestamp?: number | undefined;
        }, {
            addresses: string[];
            maxCommentCids: number;
            postScore?: number | undefined;
            replyScore?: number | undefined;
            firstCommentTimestamp?: number | undefined;
        }>>;
        postScore: z.ZodOptional<z.ZodNumber>;
        replyScore: z.ZodOptional<z.ZodNumber>;
        firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
        challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        post: z.ZodOptional<z.ZodBoolean>;
        reply: z.ZodOptional<z.ZodBoolean>;
        vote: z.ZodOptional<z.ZodBoolean>;
        role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
        address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        rateLimit: z.ZodOptional<z.ZodNumber>;
        rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        subplebbit: z.ZodOptional<z.ZodObject<{
            addresses: z.ZodArray<z.ZodString, "many">;
            maxCommentCids: z.ZodNumber;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
        }, "strict", z.ZodTypeAny, {
            addresses: string[];
            maxCommentCids: number;
            postScore?: number | undefined;
            replyScore?: number | undefined;
            firstCommentTimestamp?: number | undefined;
        }, {
            addresses: string[];
            maxCommentCids: number;
            postScore?: number | undefined;
            replyScore?: number | undefined;
            firstCommentTimestamp?: number | undefined;
        }>>;
        postScore: z.ZodOptional<z.ZodNumber>;
        replyScore: z.ZodOptional<z.ZodNumber>;
        firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
        challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        post: z.ZodOptional<z.ZodBoolean>;
        reply: z.ZodOptional<z.ZodBoolean>;
        vote: z.ZodOptional<z.ZodBoolean>;
        role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
        address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        rateLimit: z.ZodOptional<z.ZodNumber>;
        rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">>, "many">>;
    description: z.ZodOptional<z.ZodString>;
    challenge: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodString>;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
        subplebbit: z.ZodOptional<z.ZodObject<{
            addresses: z.ZodArray<z.ZodString, "many">;
            maxCommentCids: z.ZodNumber;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
        }, "strict", z.ZodTypeAny, {
            addresses: string[];
            maxCommentCids: number;
            postScore?: number | undefined;
            replyScore?: number | undefined;
            firstCommentTimestamp?: number | undefined;
        }, {
            addresses: string[];
            maxCommentCids: number;
            postScore?: number | undefined;
            replyScore?: number | undefined;
            firstCommentTimestamp?: number | undefined;
        }>>;
        postScore: z.ZodOptional<z.ZodNumber>;
        replyScore: z.ZodOptional<z.ZodNumber>;
        firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
        challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        post: z.ZodOptional<z.ZodBoolean>;
        reply: z.ZodOptional<z.ZodBoolean>;
        vote: z.ZodOptional<z.ZodBoolean>;
        role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
        address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        rateLimit: z.ZodOptional<z.ZodNumber>;
        rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        subplebbit: z.ZodOptional<z.ZodObject<{
            addresses: z.ZodArray<z.ZodString, "many">;
            maxCommentCids: z.ZodNumber;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
        }, "strict", z.ZodTypeAny, {
            addresses: string[];
            maxCommentCids: number;
            postScore?: number | undefined;
            replyScore?: number | undefined;
            firstCommentTimestamp?: number | undefined;
        }, {
            addresses: string[];
            maxCommentCids: number;
            postScore?: number | undefined;
            replyScore?: number | undefined;
            firstCommentTimestamp?: number | undefined;
        }>>;
        postScore: z.ZodOptional<z.ZodNumber>;
        replyScore: z.ZodOptional<z.ZodNumber>;
        firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
        challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        post: z.ZodOptional<z.ZodBoolean>;
        reply: z.ZodOptional<z.ZodBoolean>;
        vote: z.ZodOptional<z.ZodBoolean>;
        role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
        address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        rateLimit: z.ZodOptional<z.ZodNumber>;
        rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        subplebbit: z.ZodOptional<z.ZodObject<{
            addresses: z.ZodArray<z.ZodString, "many">;
            maxCommentCids: z.ZodNumber;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
        }, "strict", z.ZodTypeAny, {
            addresses: string[];
            maxCommentCids: number;
            postScore?: number | undefined;
            replyScore?: number | undefined;
            firstCommentTimestamp?: number | undefined;
        }, {
            addresses: string[];
            maxCommentCids: number;
            postScore?: number | undefined;
            replyScore?: number | undefined;
            firstCommentTimestamp?: number | undefined;
        }>>;
        postScore: z.ZodOptional<z.ZodNumber>;
        replyScore: z.ZodOptional<z.ZodNumber>;
        firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
        challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        post: z.ZodOptional<z.ZodBoolean>;
        reply: z.ZodOptional<z.ZodBoolean>;
        vote: z.ZodOptional<z.ZodBoolean>;
        role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
        address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        rateLimit: z.ZodOptional<z.ZodNumber>;
        rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">>, "many">>;
    description: z.ZodOptional<z.ZodString>;
    challenge: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodString>;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
        subplebbit: z.ZodOptional<z.ZodObject<{
            addresses: z.ZodArray<z.ZodString, "many">;
            maxCommentCids: z.ZodNumber;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
        }, "strict", z.ZodTypeAny, {
            addresses: string[];
            maxCommentCids: number;
            postScore?: number | undefined;
            replyScore?: number | undefined;
            firstCommentTimestamp?: number | undefined;
        }, {
            addresses: string[];
            maxCommentCids: number;
            postScore?: number | undefined;
            replyScore?: number | undefined;
            firstCommentTimestamp?: number | undefined;
        }>>;
        postScore: z.ZodOptional<z.ZodNumber>;
        replyScore: z.ZodOptional<z.ZodNumber>;
        firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
        challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        post: z.ZodOptional<z.ZodBoolean>;
        reply: z.ZodOptional<z.ZodBoolean>;
        vote: z.ZodOptional<z.ZodBoolean>;
        role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
        address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        rateLimit: z.ZodOptional<z.ZodNumber>;
        rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        subplebbit: z.ZodOptional<z.ZodObject<{
            addresses: z.ZodArray<z.ZodString, "many">;
            maxCommentCids: z.ZodNumber;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
        }, "strict", z.ZodTypeAny, {
            addresses: string[];
            maxCommentCids: number;
            postScore?: number | undefined;
            replyScore?: number | undefined;
            firstCommentTimestamp?: number | undefined;
        }, {
            addresses: string[];
            maxCommentCids: number;
            postScore?: number | undefined;
            replyScore?: number | undefined;
            firstCommentTimestamp?: number | undefined;
        }>>;
        postScore: z.ZodOptional<z.ZodNumber>;
        replyScore: z.ZodOptional<z.ZodNumber>;
        firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
        challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        post: z.ZodOptional<z.ZodBoolean>;
        reply: z.ZodOptional<z.ZodBoolean>;
        vote: z.ZodOptional<z.ZodBoolean>;
        role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
        address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        rateLimit: z.ZodOptional<z.ZodNumber>;
        rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        subplebbit: z.ZodOptional<z.ZodObject<{
            addresses: z.ZodArray<z.ZodString, "many">;
            maxCommentCids: z.ZodNumber;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
        }, "strict", z.ZodTypeAny, {
            addresses: string[];
            maxCommentCids: number;
            postScore?: number | undefined;
            replyScore?: number | undefined;
            firstCommentTimestamp?: number | undefined;
        }, {
            addresses: string[];
            maxCommentCids: number;
            postScore?: number | undefined;
            replyScore?: number | undefined;
            firstCommentTimestamp?: number | undefined;
        }>>;
        postScore: z.ZodOptional<z.ZodNumber>;
        replyScore: z.ZodOptional<z.ZodNumber>;
        firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
        challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        post: z.ZodOptional<z.ZodBoolean>;
        reply: z.ZodOptional<z.ZodBoolean>;
        vote: z.ZodOptional<z.ZodBoolean>;
        role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
        address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        rateLimit: z.ZodOptional<z.ZodNumber>;
        rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">>, "many">>;
    description: z.ZodOptional<z.ZodString>;
    challenge: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodString>;
}, z.ZodTypeAny, "passthrough">>;
export declare const SubplebbitChallengeSettingSchema: z.ZodEffects<z.ZodObject<{
    path: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    options: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
        subplebbit: z.ZodOptional<z.ZodObject<{
            addresses: z.ZodArray<z.ZodString, "many">;
            maxCommentCids: z.ZodNumber;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
        }, "strict", z.ZodTypeAny, {
            addresses: string[];
            maxCommentCids: number;
            postScore?: number | undefined;
            replyScore?: number | undefined;
            firstCommentTimestamp?: number | undefined;
        }, {
            addresses: string[];
            maxCommentCids: number;
            postScore?: number | undefined;
            replyScore?: number | undefined;
            firstCommentTimestamp?: number | undefined;
        }>>;
        postScore: z.ZodOptional<z.ZodNumber>;
        replyScore: z.ZodOptional<z.ZodNumber>;
        firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
        challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        post: z.ZodOptional<z.ZodBoolean>;
        reply: z.ZodOptional<z.ZodBoolean>;
        vote: z.ZodOptional<z.ZodBoolean>;
        role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
        address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        rateLimit: z.ZodOptional<z.ZodNumber>;
        rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        subplebbit: z.ZodOptional<z.ZodObject<{
            addresses: z.ZodArray<z.ZodString, "many">;
            maxCommentCids: z.ZodNumber;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
        }, "strict", z.ZodTypeAny, {
            addresses: string[];
            maxCommentCids: number;
            postScore?: number | undefined;
            replyScore?: number | undefined;
            firstCommentTimestamp?: number | undefined;
        }, {
            addresses: string[];
            maxCommentCids: number;
            postScore?: number | undefined;
            replyScore?: number | undefined;
            firstCommentTimestamp?: number | undefined;
        }>>;
        postScore: z.ZodOptional<z.ZodNumber>;
        replyScore: z.ZodOptional<z.ZodNumber>;
        firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
        challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        post: z.ZodOptional<z.ZodBoolean>;
        reply: z.ZodOptional<z.ZodBoolean>;
        vote: z.ZodOptional<z.ZodBoolean>;
        role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
        address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        rateLimit: z.ZodOptional<z.ZodNumber>;
        rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        subplebbit: z.ZodOptional<z.ZodObject<{
            addresses: z.ZodArray<z.ZodString, "many">;
            maxCommentCids: z.ZodNumber;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
        }, "strict", z.ZodTypeAny, {
            addresses: string[];
            maxCommentCids: number;
            postScore?: number | undefined;
            replyScore?: number | undefined;
            firstCommentTimestamp?: number | undefined;
        }, {
            addresses: string[];
            maxCommentCids: number;
            postScore?: number | undefined;
            replyScore?: number | undefined;
            firstCommentTimestamp?: number | undefined;
        }>>;
        postScore: z.ZodOptional<z.ZodNumber>;
        replyScore: z.ZodOptional<z.ZodNumber>;
        firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
        challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        post: z.ZodOptional<z.ZodBoolean>;
        reply: z.ZodOptional<z.ZodBoolean>;
        vote: z.ZodOptional<z.ZodBoolean>;
        role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
        address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        rateLimit: z.ZodOptional<z.ZodNumber>;
        rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">>, "many">>;
    description: z.ZodOptional<z.ZodString>;
}, "strict", z.ZodTypeAny, {
    path?: string | undefined;
    options?: Record<string, string> | undefined;
    name?: string | undefined;
    description?: string | undefined;
    exclude?: z.objectOutputType<{
        subplebbit: z.ZodOptional<z.ZodObject<{
            addresses: z.ZodArray<z.ZodString, "many">;
            maxCommentCids: z.ZodNumber;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
        }, "strict", z.ZodTypeAny, {
            addresses: string[];
            maxCommentCids: number;
            postScore?: number | undefined;
            replyScore?: number | undefined;
            firstCommentTimestamp?: number | undefined;
        }, {
            addresses: string[];
            maxCommentCids: number;
            postScore?: number | undefined;
            replyScore?: number | undefined;
            firstCommentTimestamp?: number | undefined;
        }>>;
        postScore: z.ZodOptional<z.ZodNumber>;
        replyScore: z.ZodOptional<z.ZodNumber>;
        firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
        challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        post: z.ZodOptional<z.ZodBoolean>;
        reply: z.ZodOptional<z.ZodBoolean>;
        vote: z.ZodOptional<z.ZodBoolean>;
        role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
        address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        rateLimit: z.ZodOptional<z.ZodNumber>;
        rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">[] | undefined;
}, {
    path?: string | undefined;
    options?: Record<string, string> | undefined;
    name?: string | undefined;
    description?: string | undefined;
    exclude?: z.objectInputType<{
        subplebbit: z.ZodOptional<z.ZodObject<{
            addresses: z.ZodArray<z.ZodString, "many">;
            maxCommentCids: z.ZodNumber;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
        }, "strict", z.ZodTypeAny, {
            addresses: string[];
            maxCommentCids: number;
            postScore?: number | undefined;
            replyScore?: number | undefined;
            firstCommentTimestamp?: number | undefined;
        }, {
            addresses: string[];
            maxCommentCids: number;
            postScore?: number | undefined;
            replyScore?: number | undefined;
            firstCommentTimestamp?: number | undefined;
        }>>;
        postScore: z.ZodOptional<z.ZodNumber>;
        replyScore: z.ZodOptional<z.ZodNumber>;
        firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
        challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        post: z.ZodOptional<z.ZodBoolean>;
        reply: z.ZodOptional<z.ZodBoolean>;
        vote: z.ZodOptional<z.ZodBoolean>;
        role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
        address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        rateLimit: z.ZodOptional<z.ZodNumber>;
        rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">[] | undefined;
}>, {
    path?: string | undefined;
    options?: Record<string, string> | undefined;
    name?: string | undefined;
    description?: string | undefined;
    exclude?: z.objectOutputType<{
        subplebbit: z.ZodOptional<z.ZodObject<{
            addresses: z.ZodArray<z.ZodString, "many">;
            maxCommentCids: z.ZodNumber;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
        }, "strict", z.ZodTypeAny, {
            addresses: string[];
            maxCommentCids: number;
            postScore?: number | undefined;
            replyScore?: number | undefined;
            firstCommentTimestamp?: number | undefined;
        }, {
            addresses: string[];
            maxCommentCids: number;
            postScore?: number | undefined;
            replyScore?: number | undefined;
            firstCommentTimestamp?: number | undefined;
        }>>;
        postScore: z.ZodOptional<z.ZodNumber>;
        replyScore: z.ZodOptional<z.ZodNumber>;
        firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
        challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        post: z.ZodOptional<z.ZodBoolean>;
        reply: z.ZodOptional<z.ZodBoolean>;
        vote: z.ZodOptional<z.ZodBoolean>;
        role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
        address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        rateLimit: z.ZodOptional<z.ZodNumber>;
        rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">[] | undefined;
}, {
    path?: string | undefined;
    options?: Record<string, string> | undefined;
    name?: string | undefined;
    description?: string | undefined;
    exclude?: z.objectInputType<{
        subplebbit: z.ZodOptional<z.ZodObject<{
            addresses: z.ZodArray<z.ZodString, "many">;
            maxCommentCids: z.ZodNumber;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
        }, "strict", z.ZodTypeAny, {
            addresses: string[];
            maxCommentCids: number;
            postScore?: number | undefined;
            replyScore?: number | undefined;
            firstCommentTimestamp?: number | undefined;
        }, {
            addresses: string[];
            maxCommentCids: number;
            postScore?: number | undefined;
            replyScore?: number | undefined;
            firstCommentTimestamp?: number | undefined;
        }>>;
        postScore: z.ZodOptional<z.ZodNumber>;
        replyScore: z.ZodOptional<z.ZodNumber>;
        firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
        challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        post: z.ZodOptional<z.ZodBoolean>;
        reply: z.ZodOptional<z.ZodBoolean>;
        vote: z.ZodOptional<z.ZodBoolean>;
        role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
        address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        rateLimit: z.ZodOptional<z.ZodNumber>;
        rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">[] | undefined;
}>;
export declare const ChallengeFileSchema: z.ZodObject<{
    optionInputs: z.ZodOptional<z.ZodArray<z.ZodObject<{
        option: z.ZodString;
        label: z.ZodString;
        default: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        placeholder: z.ZodOptional<z.ZodString>;
        required: z.ZodOptional<z.ZodBoolean>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        option: z.ZodString;
        label: z.ZodString;
        default: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        placeholder: z.ZodOptional<z.ZodString>;
        required: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        option: z.ZodString;
        label: z.ZodString;
        default: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        placeholder: z.ZodOptional<z.ZodString>;
        required: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">>, "many">>;
    type: z.ZodString;
    challenge: z.ZodOptional<z.ZodString>;
    caseInsensitive: z.ZodOptional<z.ZodBoolean>;
    description: z.ZodOptional<z.ZodString>;
    getChallenge: z.ZodFunction<z.ZodTuple<[z.ZodEffects<z.ZodObject<{
        path: z.ZodOptional<z.ZodString>;
        name: z.ZodOptional<z.ZodString>;
        options: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        description: z.ZodOptional<z.ZodString>;
    }, "strict", z.ZodTypeAny, {
        path?: string | undefined;
        options?: Record<string, string> | undefined;
        name?: string | undefined;
        description?: string | undefined;
        exclude?: z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">[] | undefined;
    }, {
        path?: string | undefined;
        options?: Record<string, string> | undefined;
        name?: string | undefined;
        description?: string | undefined;
        exclude?: z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">[] | undefined;
    }>, {
        path?: string | undefined;
        options?: Record<string, string> | undefined;
        name?: string | undefined;
        description?: string | undefined;
        exclude?: z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">[] | undefined;
    }, {
        path?: string | undefined;
        options?: Record<string, string> | undefined;
        name?: string | undefined;
        description?: string | undefined;
        exclude?: z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">[] | undefined;
    }>, z.ZodType<DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor, z.ZodTypeDef, DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor>, z.ZodNumber, z.ZodType<LocalSubplebbit, z.ZodTypeDef, LocalSubplebbit>], z.ZodUnknown>, z.ZodPromise<z.ZodUnion<[z.ZodObject<{
        challenge: z.ZodString;
        verify: z.ZodFunction<z.ZodTuple<[z.ZodLazy<z.ZodString>], z.ZodUnknown>, z.ZodPromise<z.ZodUnion<[z.ZodObject<{
            success: z.ZodLiteral<true>;
        }, "strip", z.ZodTypeAny, {
            success: true;
        }, {
            success: true;
        }>, z.ZodObject<{
            success: z.ZodLiteral<false>;
            error: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            error: string;
            success: false;
        }, {
            error: string;
            success: false;
        }>]>>>;
        type: z.ZodString;
    }, "strict", z.ZodTypeAny, {
        type: string;
        challenge: string;
        verify: (args_0: string, ...args_1: unknown[]) => Promise<{
            success: true;
        } | {
            error: string;
            success: false;
        }>;
    }, {
        type: string;
        challenge: string;
        verify: (args_0: string, ...args_1: unknown[]) => Promise<{
            success: true;
        } | {
            error: string;
            success: false;
        }>;
    }>, z.ZodUnion<[z.ZodObject<{
        success: z.ZodLiteral<true>;
    }, "strip", z.ZodTypeAny, {
        success: true;
    }, {
        success: true;
    }>, z.ZodObject<{
        success: z.ZodLiteral<false>;
        error: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        error: string;
        success: false;
    }, {
        error: string;
        success: false;
    }>]>]>>>;
}, "strict", z.ZodTypeAny, {
    type: string;
    getChallenge: (args_0: {
        path?: string | undefined;
        options?: Record<string, string> | undefined;
        name?: string | undefined;
        description?: string | undefined;
        exclude?: z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">[] | undefined;
    }, args_1: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor, args_2: number, args_3: LocalSubplebbit, ...args_4: unknown[]) => Promise<{
        success: true;
    } | {
        error: string;
        success: false;
    } | {
        type: string;
        challenge: string;
        verify: (args_0: string, ...args_1: unknown[]) => Promise<{
            success: true;
        } | {
            error: string;
            success: false;
        }>;
    }>;
    description?: string | undefined;
    challenge?: string | undefined;
    caseInsensitive?: boolean | undefined;
    optionInputs?: z.objectOutputType<{
        option: z.ZodString;
        label: z.ZodString;
        default: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        placeholder: z.ZodOptional<z.ZodString>;
        required: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">[] | undefined;
}, {
    type: string;
    getChallenge: (args_0: {
        path?: string | undefined;
        options?: Record<string, string> | undefined;
        name?: string | undefined;
        description?: string | undefined;
        exclude?: z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">[] | undefined;
    }, args_1: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor, args_2: number, args_3: LocalSubplebbit, ...args_4: unknown[]) => Promise<{
        success: true;
    } | {
        error: string;
        success: false;
    } | {
        type: string;
        challenge: string;
        verify: (args_0: string, ...args_1: unknown[]) => Promise<{
            success: true;
        } | {
            error: string;
            success: false;
        }>;
    }>;
    description?: string | undefined;
    challenge?: string | undefined;
    caseInsensitive?: boolean | undefined;
    optionInputs?: z.objectInputType<{
        option: z.ZodString;
        label: z.ZodString;
        default: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        placeholder: z.ZodOptional<z.ZodString>;
        required: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">[] | undefined;
}>;
export declare const ChallengeFileFactorySchema: z.ZodFunction<z.ZodTuple<[z.ZodEffects<z.ZodObject<{
    path: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    options: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
        subplebbit: z.ZodOptional<z.ZodObject<{
            addresses: z.ZodArray<z.ZodString, "many">;
            maxCommentCids: z.ZodNumber;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
        }, "strict", z.ZodTypeAny, {
            addresses: string[];
            maxCommentCids: number;
            postScore?: number | undefined;
            replyScore?: number | undefined;
            firstCommentTimestamp?: number | undefined;
        }, {
            addresses: string[];
            maxCommentCids: number;
            postScore?: number | undefined;
            replyScore?: number | undefined;
            firstCommentTimestamp?: number | undefined;
        }>>;
        postScore: z.ZodOptional<z.ZodNumber>;
        replyScore: z.ZodOptional<z.ZodNumber>;
        firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
        challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        post: z.ZodOptional<z.ZodBoolean>;
        reply: z.ZodOptional<z.ZodBoolean>;
        vote: z.ZodOptional<z.ZodBoolean>;
        role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
        address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        rateLimit: z.ZodOptional<z.ZodNumber>;
        rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        subplebbit: z.ZodOptional<z.ZodObject<{
            addresses: z.ZodArray<z.ZodString, "many">;
            maxCommentCids: z.ZodNumber;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
        }, "strict", z.ZodTypeAny, {
            addresses: string[];
            maxCommentCids: number;
            postScore?: number | undefined;
            replyScore?: number | undefined;
            firstCommentTimestamp?: number | undefined;
        }, {
            addresses: string[];
            maxCommentCids: number;
            postScore?: number | undefined;
            replyScore?: number | undefined;
            firstCommentTimestamp?: number | undefined;
        }>>;
        postScore: z.ZodOptional<z.ZodNumber>;
        replyScore: z.ZodOptional<z.ZodNumber>;
        firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
        challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        post: z.ZodOptional<z.ZodBoolean>;
        reply: z.ZodOptional<z.ZodBoolean>;
        vote: z.ZodOptional<z.ZodBoolean>;
        role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
        address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        rateLimit: z.ZodOptional<z.ZodNumber>;
        rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        subplebbit: z.ZodOptional<z.ZodObject<{
            addresses: z.ZodArray<z.ZodString, "many">;
            maxCommentCids: z.ZodNumber;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
        }, "strict", z.ZodTypeAny, {
            addresses: string[];
            maxCommentCids: number;
            postScore?: number | undefined;
            replyScore?: number | undefined;
            firstCommentTimestamp?: number | undefined;
        }, {
            addresses: string[];
            maxCommentCids: number;
            postScore?: number | undefined;
            replyScore?: number | undefined;
            firstCommentTimestamp?: number | undefined;
        }>>;
        postScore: z.ZodOptional<z.ZodNumber>;
        replyScore: z.ZodOptional<z.ZodNumber>;
        firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
        challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        post: z.ZodOptional<z.ZodBoolean>;
        reply: z.ZodOptional<z.ZodBoolean>;
        vote: z.ZodOptional<z.ZodBoolean>;
        role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
        address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        rateLimit: z.ZodOptional<z.ZodNumber>;
        rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">>, "many">>;
    description: z.ZodOptional<z.ZodString>;
}, "strict", z.ZodTypeAny, {
    path?: string | undefined;
    options?: Record<string, string> | undefined;
    name?: string | undefined;
    description?: string | undefined;
    exclude?: z.objectOutputType<{
        subplebbit: z.ZodOptional<z.ZodObject<{
            addresses: z.ZodArray<z.ZodString, "many">;
            maxCommentCids: z.ZodNumber;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
        }, "strict", z.ZodTypeAny, {
            addresses: string[];
            maxCommentCids: number;
            postScore?: number | undefined;
            replyScore?: number | undefined;
            firstCommentTimestamp?: number | undefined;
        }, {
            addresses: string[];
            maxCommentCids: number;
            postScore?: number | undefined;
            replyScore?: number | undefined;
            firstCommentTimestamp?: number | undefined;
        }>>;
        postScore: z.ZodOptional<z.ZodNumber>;
        replyScore: z.ZodOptional<z.ZodNumber>;
        firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
        challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        post: z.ZodOptional<z.ZodBoolean>;
        reply: z.ZodOptional<z.ZodBoolean>;
        vote: z.ZodOptional<z.ZodBoolean>;
        role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
        address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        rateLimit: z.ZodOptional<z.ZodNumber>;
        rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">[] | undefined;
}, {
    path?: string | undefined;
    options?: Record<string, string> | undefined;
    name?: string | undefined;
    description?: string | undefined;
    exclude?: z.objectInputType<{
        subplebbit: z.ZodOptional<z.ZodObject<{
            addresses: z.ZodArray<z.ZodString, "many">;
            maxCommentCids: z.ZodNumber;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
        }, "strict", z.ZodTypeAny, {
            addresses: string[];
            maxCommentCids: number;
            postScore?: number | undefined;
            replyScore?: number | undefined;
            firstCommentTimestamp?: number | undefined;
        }, {
            addresses: string[];
            maxCommentCids: number;
            postScore?: number | undefined;
            replyScore?: number | undefined;
            firstCommentTimestamp?: number | undefined;
        }>>;
        postScore: z.ZodOptional<z.ZodNumber>;
        replyScore: z.ZodOptional<z.ZodNumber>;
        firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
        challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        post: z.ZodOptional<z.ZodBoolean>;
        reply: z.ZodOptional<z.ZodBoolean>;
        vote: z.ZodOptional<z.ZodBoolean>;
        role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
        address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        rateLimit: z.ZodOptional<z.ZodNumber>;
        rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">[] | undefined;
}>, {
    path?: string | undefined;
    options?: Record<string, string> | undefined;
    name?: string | undefined;
    description?: string | undefined;
    exclude?: z.objectOutputType<{
        subplebbit: z.ZodOptional<z.ZodObject<{
            addresses: z.ZodArray<z.ZodString, "many">;
            maxCommentCids: z.ZodNumber;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
        }, "strict", z.ZodTypeAny, {
            addresses: string[];
            maxCommentCids: number;
            postScore?: number | undefined;
            replyScore?: number | undefined;
            firstCommentTimestamp?: number | undefined;
        }, {
            addresses: string[];
            maxCommentCids: number;
            postScore?: number | undefined;
            replyScore?: number | undefined;
            firstCommentTimestamp?: number | undefined;
        }>>;
        postScore: z.ZodOptional<z.ZodNumber>;
        replyScore: z.ZodOptional<z.ZodNumber>;
        firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
        challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        post: z.ZodOptional<z.ZodBoolean>;
        reply: z.ZodOptional<z.ZodBoolean>;
        vote: z.ZodOptional<z.ZodBoolean>;
        role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
        address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        rateLimit: z.ZodOptional<z.ZodNumber>;
        rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">[] | undefined;
}, {
    path?: string | undefined;
    options?: Record<string, string> | undefined;
    name?: string | undefined;
    description?: string | undefined;
    exclude?: z.objectInputType<{
        subplebbit: z.ZodOptional<z.ZodObject<{
            addresses: z.ZodArray<z.ZodString, "many">;
            maxCommentCids: z.ZodNumber;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
        }, "strict", z.ZodTypeAny, {
            addresses: string[];
            maxCommentCids: number;
            postScore?: number | undefined;
            replyScore?: number | undefined;
            firstCommentTimestamp?: number | undefined;
        }, {
            addresses: string[];
            maxCommentCids: number;
            postScore?: number | undefined;
            replyScore?: number | undefined;
            firstCommentTimestamp?: number | undefined;
        }>>;
        postScore: z.ZodOptional<z.ZodNumber>;
        replyScore: z.ZodOptional<z.ZodNumber>;
        firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
        challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        post: z.ZodOptional<z.ZodBoolean>;
        reply: z.ZodOptional<z.ZodBoolean>;
        vote: z.ZodOptional<z.ZodBoolean>;
        role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
        address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        rateLimit: z.ZodOptional<z.ZodNumber>;
        rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">[] | undefined;
}>], z.ZodUnknown>, z.ZodObject<{
    optionInputs: z.ZodOptional<z.ZodArray<z.ZodObject<{
        option: z.ZodString;
        label: z.ZodString;
        default: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        placeholder: z.ZodOptional<z.ZodString>;
        required: z.ZodOptional<z.ZodBoolean>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        option: z.ZodString;
        label: z.ZodString;
        default: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        placeholder: z.ZodOptional<z.ZodString>;
        required: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        option: z.ZodString;
        label: z.ZodString;
        default: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        placeholder: z.ZodOptional<z.ZodString>;
        required: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">>, "many">>;
    type: z.ZodString;
    challenge: z.ZodOptional<z.ZodString>;
    caseInsensitive: z.ZodOptional<z.ZodBoolean>;
    description: z.ZodOptional<z.ZodString>;
    getChallenge: z.ZodFunction<z.ZodTuple<[z.ZodEffects<z.ZodObject<{
        path: z.ZodOptional<z.ZodString>;
        name: z.ZodOptional<z.ZodString>;
        options: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        description: z.ZodOptional<z.ZodString>;
    }, "strict", z.ZodTypeAny, {
        path?: string | undefined;
        options?: Record<string, string> | undefined;
        name?: string | undefined;
        description?: string | undefined;
        exclude?: z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">[] | undefined;
    }, {
        path?: string | undefined;
        options?: Record<string, string> | undefined;
        name?: string | undefined;
        description?: string | undefined;
        exclude?: z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">[] | undefined;
    }>, {
        path?: string | undefined;
        options?: Record<string, string> | undefined;
        name?: string | undefined;
        description?: string | undefined;
        exclude?: z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">[] | undefined;
    }, {
        path?: string | undefined;
        options?: Record<string, string> | undefined;
        name?: string | undefined;
        description?: string | undefined;
        exclude?: z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">[] | undefined;
    }>, z.ZodType<DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor, z.ZodTypeDef, DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor>, z.ZodNumber, z.ZodType<LocalSubplebbit, z.ZodTypeDef, LocalSubplebbit>], z.ZodUnknown>, z.ZodPromise<z.ZodUnion<[z.ZodObject<{
        challenge: z.ZodString;
        verify: z.ZodFunction<z.ZodTuple<[z.ZodLazy<z.ZodString>], z.ZodUnknown>, z.ZodPromise<z.ZodUnion<[z.ZodObject<{
            success: z.ZodLiteral<true>;
        }, "strip", z.ZodTypeAny, {
            success: true;
        }, {
            success: true;
        }>, z.ZodObject<{
            success: z.ZodLiteral<false>;
            error: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            error: string;
            success: false;
        }, {
            error: string;
            success: false;
        }>]>>>;
        type: z.ZodString;
    }, "strict", z.ZodTypeAny, {
        type: string;
        challenge: string;
        verify: (args_0: string, ...args_1: unknown[]) => Promise<{
            success: true;
        } | {
            error: string;
            success: false;
        }>;
    }, {
        type: string;
        challenge: string;
        verify: (args_0: string, ...args_1: unknown[]) => Promise<{
            success: true;
        } | {
            error: string;
            success: false;
        }>;
    }>, z.ZodUnion<[z.ZodObject<{
        success: z.ZodLiteral<true>;
    }, "strip", z.ZodTypeAny, {
        success: true;
    }, {
        success: true;
    }>, z.ZodObject<{
        success: z.ZodLiteral<false>;
        error: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        error: string;
        success: false;
    }, {
        error: string;
        success: false;
    }>]>]>>>;
}, "strict", z.ZodTypeAny, {
    type: string;
    getChallenge: (args_0: {
        path?: string | undefined;
        options?: Record<string, string> | undefined;
        name?: string | undefined;
        description?: string | undefined;
        exclude?: z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">[] | undefined;
    }, args_1: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor, args_2: number, args_3: LocalSubplebbit, ...args_4: unknown[]) => Promise<{
        success: true;
    } | {
        error: string;
        success: false;
    } | {
        type: string;
        challenge: string;
        verify: (args_0: string, ...args_1: unknown[]) => Promise<{
            success: true;
        } | {
            error: string;
            success: false;
        }>;
    }>;
    description?: string | undefined;
    challenge?: string | undefined;
    caseInsensitive?: boolean | undefined;
    optionInputs?: z.objectOutputType<{
        option: z.ZodString;
        label: z.ZodString;
        default: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        placeholder: z.ZodOptional<z.ZodString>;
        required: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">[] | undefined;
}, {
    type: string;
    getChallenge: (args_0: {
        path?: string | undefined;
        options?: Record<string, string> | undefined;
        name?: string | undefined;
        description?: string | undefined;
        exclude?: z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">[] | undefined;
    }, args_1: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor, args_2: number, args_3: LocalSubplebbit, ...args_4: unknown[]) => Promise<{
        success: true;
    } | {
        error: string;
        success: false;
    } | {
        type: string;
        challenge: string;
        verify: (args_0: string, ...args_1: unknown[]) => Promise<{
            success: true;
        } | {
            error: string;
            success: false;
        }>;
    }>;
    description?: string | undefined;
    challenge?: string | undefined;
    caseInsensitive?: boolean | undefined;
    optionInputs?: z.objectInputType<{
        option: z.ZodString;
        label: z.ZodString;
        default: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        placeholder: z.ZodOptional<z.ZodString>;
        required: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">[] | undefined;
}>>;
export declare const SubplebbitIpfsSchema: z.ZodObject<{
    posts: z.ZodOptional<z.ZodObject<{
        pages: z.ZodRecord<z.ZodUnion<[z.ZodEnum<["hot", "new", "topHour", "topDay", "topWeek", "topMonth", "topYear", "topAll", "controversialHour", "controversialDay", "controversialWeek", "controversialMonth", "controversialYear", "controversialAll", "active"]>, z.ZodString]>, z.ZodType<import("../pages/types.js").PageIpfsManuallyDefined, z.ZodTypeDef, import("../pages/types.js").PageIpfsManuallyDefined>>;
        pageCids: z.ZodRecord<z.ZodUnion<[z.ZodEnum<["hot", "new", "topHour", "topDay", "topWeek", "topMonth", "topYear", "topAll", "controversialHour", "controversialDay", "controversialWeek", "controversialMonth", "controversialYear", "controversialAll", "active"]>, z.ZodString]>, z.ZodEffects<z.ZodString, string, string>>;
    }, "strip", z.ZodTypeAny, {
        pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
        pageCids: Record<string, string>;
    }, {
        pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
        pageCids: Record<string, string>;
    }>>;
    challenges: z.ZodArray<z.ZodObject<{
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        description: z.ZodOptional<z.ZodString>;
        challenge: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        description: z.ZodOptional<z.ZodString>;
        challenge: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        description: z.ZodOptional<z.ZodString>;
        challenge: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>, "many">;
    signature: z.ZodObject<{
        type: z.ZodEnum<["ed25519", "eip191"]>;
        signature: z.ZodString;
        publicKey: z.ZodString;
        signedPropertyNames: z.ZodArray<z.ZodString, "atleastone">;
    }, "strip", z.ZodTypeAny, {
        type: "ed25519" | "eip191";
        publicKey: string;
        signature: string;
        signedPropertyNames: [string, ...string[]];
    }, {
        type: "ed25519" | "eip191";
        publicKey: string;
        signature: string;
        signedPropertyNames: [string, ...string[]];
    }>;
    encryption: z.ZodObject<{
        type: z.ZodEnum<["ed25519-aes-gcm"]>;
        publicKey: z.ZodString;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        type: z.ZodEnum<["ed25519-aes-gcm"]>;
        publicKey: z.ZodString;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        type: z.ZodEnum<["ed25519-aes-gcm"]>;
        publicKey: z.ZodString;
    }, z.ZodTypeAny, "passthrough">>;
    address: z.ZodString;
    createdAt: z.ZodNumber;
    updatedAt: z.ZodNumber;
    pubsubTopic: z.ZodOptional<z.ZodString>;
    statsCid: z.ZodEffects<z.ZodString, string, string>;
    protocolVersion: z.ZodString;
    postUpdates: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodEffects<z.ZodString, string, string>>>;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    roles: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough">>>>;
    rules: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    lastPostCid: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    lastCommentCid: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    features: z.ZodOptional<z.ZodObject<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">>>;
    suggested: z.ZodOptional<z.ZodObject<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>>;
    flairs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodArray<z.ZodObject<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">>, "many">>>;
}, "strict", z.ZodTypeAny, {
    address: string;
    signature: {
        type: "ed25519" | "eip191";
        publicKey: string;
        signature: string;
        signedPropertyNames: [string, ...string[]];
    };
    protocolVersion: string;
    challenges: z.objectOutputType<{
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        description: z.ZodOptional<z.ZodString>;
        challenge: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">[];
    updatedAt: number;
    encryption: {
        type: "ed25519-aes-gcm";
        publicKey: string;
    } & {
        [k: string]: unknown;
    };
    createdAt: number;
    statsCid: string;
    lastCommentCid?: string | undefined;
    description?: string | undefined;
    pubsubTopic?: string | undefined;
    title?: string | undefined;
    posts?: {
        pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
        pageCids: Record<string, string>;
    } | undefined;
    postUpdates?: Record<string, string> | undefined;
    roles?: Record<string, z.objectOutputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough">> | undefined;
    rules?: string[] | undefined;
    lastPostCid?: string | undefined;
    features?: z.objectOutputType<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    suggested?: z.objectOutputType<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    flairs?: Record<string, z.objectOutputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">[]> | undefined;
}, {
    address: string;
    signature: {
        type: "ed25519" | "eip191";
        publicKey: string;
        signature: string;
        signedPropertyNames: [string, ...string[]];
    };
    protocolVersion: string;
    challenges: z.objectInputType<{
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        description: z.ZodOptional<z.ZodString>;
        challenge: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">[];
    updatedAt: number;
    encryption: {
        type: "ed25519-aes-gcm";
        publicKey: string;
    } & {
        [k: string]: unknown;
    };
    createdAt: number;
    statsCid: string;
    lastCommentCid?: string | undefined;
    description?: string | undefined;
    pubsubTopic?: string | undefined;
    title?: string | undefined;
    posts?: {
        pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
        pageCids: Record<string, string>;
    } | undefined;
    postUpdates?: Record<string, string> | undefined;
    roles?: Record<string, z.objectInputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough">> | undefined;
    rules?: string[] | undefined;
    lastPostCid?: string | undefined;
    features?: z.objectInputType<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    suggested?: z.objectInputType<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    flairs?: Record<string, z.objectInputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">[]> | undefined;
}>;
export declare const SubplebbitSignedPropertyNames: ("address" | "protocolVersion" | "lastCommentCid" | "description" | "pubsubTopic" | "title" | "challenges" | "updatedAt" | "posts" | "encryption" | "createdAt" | "statsCid" | "postUpdates" | "roles" | "rules" | "lastPostCid" | "features" | "suggested" | "flairs")[];
export declare const RpcRemoteSubplebbitUpdateEventResultSchema: z.ZodObject<{
    subplebbit: z.ZodObject<{
        posts: z.ZodOptional<z.ZodObject<{
            pages: z.ZodRecord<z.ZodUnion<[z.ZodEnum<["hot", "new", "topHour", "topDay", "topWeek", "topMonth", "topYear", "topAll", "controversialHour", "controversialDay", "controversialWeek", "controversialMonth", "controversialYear", "controversialAll", "active"]>, z.ZodString]>, z.ZodType<import("../pages/types.js").PageIpfsManuallyDefined, z.ZodTypeDef, import("../pages/types.js").PageIpfsManuallyDefined>>;
            pageCids: z.ZodRecord<z.ZodUnion<[z.ZodEnum<["hot", "new", "topHour", "topDay", "topWeek", "topMonth", "topYear", "topAll", "controversialHour", "controversialDay", "controversialWeek", "controversialMonth", "controversialYear", "controversialAll", "active"]>, z.ZodString]>, z.ZodEffects<z.ZodString, string, string>>;
        }, "strip", z.ZodTypeAny, {
            pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
            pageCids: Record<string, string>;
        }, {
            pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
            pageCids: Record<string, string>;
        }>>;
        challenges: z.ZodArray<z.ZodObject<{
            exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">>, "many">>;
            description: z.ZodOptional<z.ZodString>;
            challenge: z.ZodOptional<z.ZodString>;
            type: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">>, "many">>;
            description: z.ZodOptional<z.ZodString>;
            challenge: z.ZodOptional<z.ZodString>;
            type: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">>, "many">>;
            description: z.ZodOptional<z.ZodString>;
            challenge: z.ZodOptional<z.ZodString>;
            type: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>, "many">;
        signature: z.ZodObject<{
            type: z.ZodEnum<["ed25519", "eip191"]>;
            signature: z.ZodString;
            publicKey: z.ZodString;
            signedPropertyNames: z.ZodArray<z.ZodString, "atleastone">;
        }, "strip", z.ZodTypeAny, {
            type: "ed25519" | "eip191";
            publicKey: string;
            signature: string;
            signedPropertyNames: [string, ...string[]];
        }, {
            type: "ed25519" | "eip191";
            publicKey: string;
            signature: string;
            signedPropertyNames: [string, ...string[]];
        }>;
        encryption: z.ZodObject<{
            type: z.ZodEnum<["ed25519-aes-gcm"]>;
            publicKey: z.ZodString;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            type: z.ZodEnum<["ed25519-aes-gcm"]>;
            publicKey: z.ZodString;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            type: z.ZodEnum<["ed25519-aes-gcm"]>;
            publicKey: z.ZodString;
        }, z.ZodTypeAny, "passthrough">>;
        address: z.ZodString;
        createdAt: z.ZodNumber;
        updatedAt: z.ZodNumber;
        pubsubTopic: z.ZodOptional<z.ZodString>;
        statsCid: z.ZodEffects<z.ZodString, string, string>;
        protocolVersion: z.ZodString;
        postUpdates: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodEffects<z.ZodString, string, string>>>;
        title: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        roles: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
            role: z.ZodEnum<["owner", "admin", "moderator"]>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            role: z.ZodEnum<["owner", "admin", "moderator"]>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            role: z.ZodEnum<["owner", "admin", "moderator"]>;
        }, z.ZodTypeAny, "passthrough">>>>;
        rules: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        lastPostCid: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
        lastCommentCid: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
        features: z.ZodOptional<z.ZodObject<{
            noVideos: z.ZodOptional<z.ZodBoolean>;
            noSpoilers: z.ZodOptional<z.ZodBoolean>;
            noImages: z.ZodOptional<z.ZodBoolean>;
            noVideoReplies: z.ZodOptional<z.ZodBoolean>;
            noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
            noImageReplies: z.ZodOptional<z.ZodBoolean>;
            noPolls: z.ZodOptional<z.ZodBoolean>;
            noCrossposts: z.ZodOptional<z.ZodBoolean>;
            noUpvotes: z.ZodOptional<z.ZodBoolean>;
            noDownvotes: z.ZodOptional<z.ZodBoolean>;
            noAuthors: z.ZodOptional<z.ZodBoolean>;
            anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
            noNestedReplies: z.ZodOptional<z.ZodBoolean>;
            safeForWork: z.ZodOptional<z.ZodBoolean>;
            authorFlairs: z.ZodOptional<z.ZodBoolean>;
            requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
            postFlairs: z.ZodOptional<z.ZodBoolean>;
            requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
            noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
            noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
            markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
            markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
            requirePostLink: z.ZodOptional<z.ZodBoolean>;
            requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            noVideos: z.ZodOptional<z.ZodBoolean>;
            noSpoilers: z.ZodOptional<z.ZodBoolean>;
            noImages: z.ZodOptional<z.ZodBoolean>;
            noVideoReplies: z.ZodOptional<z.ZodBoolean>;
            noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
            noImageReplies: z.ZodOptional<z.ZodBoolean>;
            noPolls: z.ZodOptional<z.ZodBoolean>;
            noCrossposts: z.ZodOptional<z.ZodBoolean>;
            noUpvotes: z.ZodOptional<z.ZodBoolean>;
            noDownvotes: z.ZodOptional<z.ZodBoolean>;
            noAuthors: z.ZodOptional<z.ZodBoolean>;
            anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
            noNestedReplies: z.ZodOptional<z.ZodBoolean>;
            safeForWork: z.ZodOptional<z.ZodBoolean>;
            authorFlairs: z.ZodOptional<z.ZodBoolean>;
            requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
            postFlairs: z.ZodOptional<z.ZodBoolean>;
            requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
            noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
            noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
            markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
            markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
            requirePostLink: z.ZodOptional<z.ZodBoolean>;
            requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            noVideos: z.ZodOptional<z.ZodBoolean>;
            noSpoilers: z.ZodOptional<z.ZodBoolean>;
            noImages: z.ZodOptional<z.ZodBoolean>;
            noVideoReplies: z.ZodOptional<z.ZodBoolean>;
            noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
            noImageReplies: z.ZodOptional<z.ZodBoolean>;
            noPolls: z.ZodOptional<z.ZodBoolean>;
            noCrossposts: z.ZodOptional<z.ZodBoolean>;
            noUpvotes: z.ZodOptional<z.ZodBoolean>;
            noDownvotes: z.ZodOptional<z.ZodBoolean>;
            noAuthors: z.ZodOptional<z.ZodBoolean>;
            anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
            noNestedReplies: z.ZodOptional<z.ZodBoolean>;
            safeForWork: z.ZodOptional<z.ZodBoolean>;
            authorFlairs: z.ZodOptional<z.ZodBoolean>;
            requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
            postFlairs: z.ZodOptional<z.ZodBoolean>;
            requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
            noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
            noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
            markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
            markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
            requirePostLink: z.ZodOptional<z.ZodBoolean>;
            requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>>;
        suggested: z.ZodOptional<z.ZodObject<{
            primaryColor: z.ZodOptional<z.ZodString>;
            secondaryColor: z.ZodOptional<z.ZodString>;
            avatarUrl: z.ZodOptional<z.ZodString>;
            bannerUrl: z.ZodOptional<z.ZodString>;
            backgroundUrl: z.ZodOptional<z.ZodString>;
            language: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            primaryColor: z.ZodOptional<z.ZodString>;
            secondaryColor: z.ZodOptional<z.ZodString>;
            avatarUrl: z.ZodOptional<z.ZodString>;
            bannerUrl: z.ZodOptional<z.ZodString>;
            backgroundUrl: z.ZodOptional<z.ZodString>;
            language: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            primaryColor: z.ZodOptional<z.ZodString>;
            secondaryColor: z.ZodOptional<z.ZodString>;
            avatarUrl: z.ZodOptional<z.ZodString>;
            bannerUrl: z.ZodOptional<z.ZodString>;
            backgroundUrl: z.ZodOptional<z.ZodString>;
            language: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>>;
        flairs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodArray<z.ZodObject<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough">>, "many">>>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        posts: z.ZodOptional<z.ZodObject<{
            pages: z.ZodRecord<z.ZodUnion<[z.ZodEnum<["hot", "new", "topHour", "topDay", "topWeek", "topMonth", "topYear", "topAll", "controversialHour", "controversialDay", "controversialWeek", "controversialMonth", "controversialYear", "controversialAll", "active"]>, z.ZodString]>, z.ZodType<import("../pages/types.js").PageIpfsManuallyDefined, z.ZodTypeDef, import("../pages/types.js").PageIpfsManuallyDefined>>;
            pageCids: z.ZodRecord<z.ZodUnion<[z.ZodEnum<["hot", "new", "topHour", "topDay", "topWeek", "topMonth", "topYear", "topAll", "controversialHour", "controversialDay", "controversialWeek", "controversialMonth", "controversialYear", "controversialAll", "active"]>, z.ZodString]>, z.ZodEffects<z.ZodString, string, string>>;
        }, "strip", z.ZodTypeAny, {
            pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
            pageCids: Record<string, string>;
        }, {
            pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
            pageCids: Record<string, string>;
        }>>;
        challenges: z.ZodArray<z.ZodObject<{
            exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">>, "many">>;
            description: z.ZodOptional<z.ZodString>;
            challenge: z.ZodOptional<z.ZodString>;
            type: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">>, "many">>;
            description: z.ZodOptional<z.ZodString>;
            challenge: z.ZodOptional<z.ZodString>;
            type: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">>, "many">>;
            description: z.ZodOptional<z.ZodString>;
            challenge: z.ZodOptional<z.ZodString>;
            type: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>, "many">;
        signature: z.ZodObject<{
            type: z.ZodEnum<["ed25519", "eip191"]>;
            signature: z.ZodString;
            publicKey: z.ZodString;
            signedPropertyNames: z.ZodArray<z.ZodString, "atleastone">;
        }, "strip", z.ZodTypeAny, {
            type: "ed25519" | "eip191";
            publicKey: string;
            signature: string;
            signedPropertyNames: [string, ...string[]];
        }, {
            type: "ed25519" | "eip191";
            publicKey: string;
            signature: string;
            signedPropertyNames: [string, ...string[]];
        }>;
        encryption: z.ZodObject<{
            type: z.ZodEnum<["ed25519-aes-gcm"]>;
            publicKey: z.ZodString;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            type: z.ZodEnum<["ed25519-aes-gcm"]>;
            publicKey: z.ZodString;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            type: z.ZodEnum<["ed25519-aes-gcm"]>;
            publicKey: z.ZodString;
        }, z.ZodTypeAny, "passthrough">>;
        address: z.ZodString;
        createdAt: z.ZodNumber;
        updatedAt: z.ZodNumber;
        pubsubTopic: z.ZodOptional<z.ZodString>;
        statsCid: z.ZodEffects<z.ZodString, string, string>;
        protocolVersion: z.ZodString;
        postUpdates: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodEffects<z.ZodString, string, string>>>;
        title: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        roles: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
            role: z.ZodEnum<["owner", "admin", "moderator"]>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            role: z.ZodEnum<["owner", "admin", "moderator"]>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            role: z.ZodEnum<["owner", "admin", "moderator"]>;
        }, z.ZodTypeAny, "passthrough">>>>;
        rules: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        lastPostCid: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
        lastCommentCid: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
        features: z.ZodOptional<z.ZodObject<{
            noVideos: z.ZodOptional<z.ZodBoolean>;
            noSpoilers: z.ZodOptional<z.ZodBoolean>;
            noImages: z.ZodOptional<z.ZodBoolean>;
            noVideoReplies: z.ZodOptional<z.ZodBoolean>;
            noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
            noImageReplies: z.ZodOptional<z.ZodBoolean>;
            noPolls: z.ZodOptional<z.ZodBoolean>;
            noCrossposts: z.ZodOptional<z.ZodBoolean>;
            noUpvotes: z.ZodOptional<z.ZodBoolean>;
            noDownvotes: z.ZodOptional<z.ZodBoolean>;
            noAuthors: z.ZodOptional<z.ZodBoolean>;
            anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
            noNestedReplies: z.ZodOptional<z.ZodBoolean>;
            safeForWork: z.ZodOptional<z.ZodBoolean>;
            authorFlairs: z.ZodOptional<z.ZodBoolean>;
            requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
            postFlairs: z.ZodOptional<z.ZodBoolean>;
            requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
            noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
            noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
            markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
            markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
            requirePostLink: z.ZodOptional<z.ZodBoolean>;
            requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            noVideos: z.ZodOptional<z.ZodBoolean>;
            noSpoilers: z.ZodOptional<z.ZodBoolean>;
            noImages: z.ZodOptional<z.ZodBoolean>;
            noVideoReplies: z.ZodOptional<z.ZodBoolean>;
            noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
            noImageReplies: z.ZodOptional<z.ZodBoolean>;
            noPolls: z.ZodOptional<z.ZodBoolean>;
            noCrossposts: z.ZodOptional<z.ZodBoolean>;
            noUpvotes: z.ZodOptional<z.ZodBoolean>;
            noDownvotes: z.ZodOptional<z.ZodBoolean>;
            noAuthors: z.ZodOptional<z.ZodBoolean>;
            anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
            noNestedReplies: z.ZodOptional<z.ZodBoolean>;
            safeForWork: z.ZodOptional<z.ZodBoolean>;
            authorFlairs: z.ZodOptional<z.ZodBoolean>;
            requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
            postFlairs: z.ZodOptional<z.ZodBoolean>;
            requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
            noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
            noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
            markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
            markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
            requirePostLink: z.ZodOptional<z.ZodBoolean>;
            requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            noVideos: z.ZodOptional<z.ZodBoolean>;
            noSpoilers: z.ZodOptional<z.ZodBoolean>;
            noImages: z.ZodOptional<z.ZodBoolean>;
            noVideoReplies: z.ZodOptional<z.ZodBoolean>;
            noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
            noImageReplies: z.ZodOptional<z.ZodBoolean>;
            noPolls: z.ZodOptional<z.ZodBoolean>;
            noCrossposts: z.ZodOptional<z.ZodBoolean>;
            noUpvotes: z.ZodOptional<z.ZodBoolean>;
            noDownvotes: z.ZodOptional<z.ZodBoolean>;
            noAuthors: z.ZodOptional<z.ZodBoolean>;
            anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
            noNestedReplies: z.ZodOptional<z.ZodBoolean>;
            safeForWork: z.ZodOptional<z.ZodBoolean>;
            authorFlairs: z.ZodOptional<z.ZodBoolean>;
            requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
            postFlairs: z.ZodOptional<z.ZodBoolean>;
            requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
            noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
            noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
            markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
            markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
            requirePostLink: z.ZodOptional<z.ZodBoolean>;
            requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>>;
        suggested: z.ZodOptional<z.ZodObject<{
            primaryColor: z.ZodOptional<z.ZodString>;
            secondaryColor: z.ZodOptional<z.ZodString>;
            avatarUrl: z.ZodOptional<z.ZodString>;
            bannerUrl: z.ZodOptional<z.ZodString>;
            backgroundUrl: z.ZodOptional<z.ZodString>;
            language: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            primaryColor: z.ZodOptional<z.ZodString>;
            secondaryColor: z.ZodOptional<z.ZodString>;
            avatarUrl: z.ZodOptional<z.ZodString>;
            bannerUrl: z.ZodOptional<z.ZodString>;
            backgroundUrl: z.ZodOptional<z.ZodString>;
            language: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            primaryColor: z.ZodOptional<z.ZodString>;
            secondaryColor: z.ZodOptional<z.ZodString>;
            avatarUrl: z.ZodOptional<z.ZodString>;
            bannerUrl: z.ZodOptional<z.ZodString>;
            backgroundUrl: z.ZodOptional<z.ZodString>;
            language: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>>;
        flairs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodArray<z.ZodObject<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough">>, "many">>>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        posts: z.ZodOptional<z.ZodObject<{
            pages: z.ZodRecord<z.ZodUnion<[z.ZodEnum<["hot", "new", "topHour", "topDay", "topWeek", "topMonth", "topYear", "topAll", "controversialHour", "controversialDay", "controversialWeek", "controversialMonth", "controversialYear", "controversialAll", "active"]>, z.ZodString]>, z.ZodType<import("../pages/types.js").PageIpfsManuallyDefined, z.ZodTypeDef, import("../pages/types.js").PageIpfsManuallyDefined>>;
            pageCids: z.ZodRecord<z.ZodUnion<[z.ZodEnum<["hot", "new", "topHour", "topDay", "topWeek", "topMonth", "topYear", "topAll", "controversialHour", "controversialDay", "controversialWeek", "controversialMonth", "controversialYear", "controversialAll", "active"]>, z.ZodString]>, z.ZodEffects<z.ZodString, string, string>>;
        }, "strip", z.ZodTypeAny, {
            pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
            pageCids: Record<string, string>;
        }, {
            pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
            pageCids: Record<string, string>;
        }>>;
        challenges: z.ZodArray<z.ZodObject<{
            exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">>, "many">>;
            description: z.ZodOptional<z.ZodString>;
            challenge: z.ZodOptional<z.ZodString>;
            type: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">>, "many">>;
            description: z.ZodOptional<z.ZodString>;
            challenge: z.ZodOptional<z.ZodString>;
            type: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">>, "many">>;
            description: z.ZodOptional<z.ZodString>;
            challenge: z.ZodOptional<z.ZodString>;
            type: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>, "many">;
        signature: z.ZodObject<{
            type: z.ZodEnum<["ed25519", "eip191"]>;
            signature: z.ZodString;
            publicKey: z.ZodString;
            signedPropertyNames: z.ZodArray<z.ZodString, "atleastone">;
        }, "strip", z.ZodTypeAny, {
            type: "ed25519" | "eip191";
            publicKey: string;
            signature: string;
            signedPropertyNames: [string, ...string[]];
        }, {
            type: "ed25519" | "eip191";
            publicKey: string;
            signature: string;
            signedPropertyNames: [string, ...string[]];
        }>;
        encryption: z.ZodObject<{
            type: z.ZodEnum<["ed25519-aes-gcm"]>;
            publicKey: z.ZodString;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            type: z.ZodEnum<["ed25519-aes-gcm"]>;
            publicKey: z.ZodString;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            type: z.ZodEnum<["ed25519-aes-gcm"]>;
            publicKey: z.ZodString;
        }, z.ZodTypeAny, "passthrough">>;
        address: z.ZodString;
        createdAt: z.ZodNumber;
        updatedAt: z.ZodNumber;
        pubsubTopic: z.ZodOptional<z.ZodString>;
        statsCid: z.ZodEffects<z.ZodString, string, string>;
        protocolVersion: z.ZodString;
        postUpdates: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodEffects<z.ZodString, string, string>>>;
        title: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        roles: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
            role: z.ZodEnum<["owner", "admin", "moderator"]>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            role: z.ZodEnum<["owner", "admin", "moderator"]>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            role: z.ZodEnum<["owner", "admin", "moderator"]>;
        }, z.ZodTypeAny, "passthrough">>>>;
        rules: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        lastPostCid: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
        lastCommentCid: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
        features: z.ZodOptional<z.ZodObject<{
            noVideos: z.ZodOptional<z.ZodBoolean>;
            noSpoilers: z.ZodOptional<z.ZodBoolean>;
            noImages: z.ZodOptional<z.ZodBoolean>;
            noVideoReplies: z.ZodOptional<z.ZodBoolean>;
            noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
            noImageReplies: z.ZodOptional<z.ZodBoolean>;
            noPolls: z.ZodOptional<z.ZodBoolean>;
            noCrossposts: z.ZodOptional<z.ZodBoolean>;
            noUpvotes: z.ZodOptional<z.ZodBoolean>;
            noDownvotes: z.ZodOptional<z.ZodBoolean>;
            noAuthors: z.ZodOptional<z.ZodBoolean>;
            anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
            noNestedReplies: z.ZodOptional<z.ZodBoolean>;
            safeForWork: z.ZodOptional<z.ZodBoolean>;
            authorFlairs: z.ZodOptional<z.ZodBoolean>;
            requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
            postFlairs: z.ZodOptional<z.ZodBoolean>;
            requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
            noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
            noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
            markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
            markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
            requirePostLink: z.ZodOptional<z.ZodBoolean>;
            requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            noVideos: z.ZodOptional<z.ZodBoolean>;
            noSpoilers: z.ZodOptional<z.ZodBoolean>;
            noImages: z.ZodOptional<z.ZodBoolean>;
            noVideoReplies: z.ZodOptional<z.ZodBoolean>;
            noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
            noImageReplies: z.ZodOptional<z.ZodBoolean>;
            noPolls: z.ZodOptional<z.ZodBoolean>;
            noCrossposts: z.ZodOptional<z.ZodBoolean>;
            noUpvotes: z.ZodOptional<z.ZodBoolean>;
            noDownvotes: z.ZodOptional<z.ZodBoolean>;
            noAuthors: z.ZodOptional<z.ZodBoolean>;
            anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
            noNestedReplies: z.ZodOptional<z.ZodBoolean>;
            safeForWork: z.ZodOptional<z.ZodBoolean>;
            authorFlairs: z.ZodOptional<z.ZodBoolean>;
            requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
            postFlairs: z.ZodOptional<z.ZodBoolean>;
            requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
            noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
            noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
            markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
            markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
            requirePostLink: z.ZodOptional<z.ZodBoolean>;
            requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            noVideos: z.ZodOptional<z.ZodBoolean>;
            noSpoilers: z.ZodOptional<z.ZodBoolean>;
            noImages: z.ZodOptional<z.ZodBoolean>;
            noVideoReplies: z.ZodOptional<z.ZodBoolean>;
            noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
            noImageReplies: z.ZodOptional<z.ZodBoolean>;
            noPolls: z.ZodOptional<z.ZodBoolean>;
            noCrossposts: z.ZodOptional<z.ZodBoolean>;
            noUpvotes: z.ZodOptional<z.ZodBoolean>;
            noDownvotes: z.ZodOptional<z.ZodBoolean>;
            noAuthors: z.ZodOptional<z.ZodBoolean>;
            anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
            noNestedReplies: z.ZodOptional<z.ZodBoolean>;
            safeForWork: z.ZodOptional<z.ZodBoolean>;
            authorFlairs: z.ZodOptional<z.ZodBoolean>;
            requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
            postFlairs: z.ZodOptional<z.ZodBoolean>;
            requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
            noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
            noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
            markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
            markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
            requirePostLink: z.ZodOptional<z.ZodBoolean>;
            requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>>;
        suggested: z.ZodOptional<z.ZodObject<{
            primaryColor: z.ZodOptional<z.ZodString>;
            secondaryColor: z.ZodOptional<z.ZodString>;
            avatarUrl: z.ZodOptional<z.ZodString>;
            bannerUrl: z.ZodOptional<z.ZodString>;
            backgroundUrl: z.ZodOptional<z.ZodString>;
            language: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            primaryColor: z.ZodOptional<z.ZodString>;
            secondaryColor: z.ZodOptional<z.ZodString>;
            avatarUrl: z.ZodOptional<z.ZodString>;
            bannerUrl: z.ZodOptional<z.ZodString>;
            backgroundUrl: z.ZodOptional<z.ZodString>;
            language: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            primaryColor: z.ZodOptional<z.ZodString>;
            secondaryColor: z.ZodOptional<z.ZodString>;
            avatarUrl: z.ZodOptional<z.ZodString>;
            bannerUrl: z.ZodOptional<z.ZodString>;
            backgroundUrl: z.ZodOptional<z.ZodString>;
            language: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>>;
        flairs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodArray<z.ZodObject<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough">>, "many">>>;
    }, z.ZodTypeAny, "passthrough">>;
    updateCid: z.ZodEffects<z.ZodString, string, string>;
}, "strip", z.ZodTypeAny, {
    subplebbit: {
        address: string;
        signature: {
            type: "ed25519" | "eip191";
            publicKey: string;
            signature: string;
            signedPropertyNames: [string, ...string[]];
        };
        protocolVersion: string;
        challenges: z.objectOutputType<{
            exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">>, "many">>;
            description: z.ZodOptional<z.ZodString>;
            challenge: z.ZodOptional<z.ZodString>;
            type: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">[];
        updatedAt: number;
        encryption: {
            type: "ed25519-aes-gcm";
            publicKey: string;
        } & {
            [k: string]: unknown;
        };
        createdAt: number;
        statsCid: string;
        lastCommentCid?: string | undefined;
        description?: string | undefined;
        pubsubTopic?: string | undefined;
        title?: string | undefined;
        posts?: {
            pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
            pageCids: Record<string, string>;
        } | undefined;
        postUpdates?: Record<string, string> | undefined;
        roles?: Record<string, z.objectOutputType<{
            role: z.ZodEnum<["owner", "admin", "moderator"]>;
        }, z.ZodTypeAny, "passthrough">> | undefined;
        rules?: string[] | undefined;
        lastPostCid?: string | undefined;
        features?: z.objectOutputType<{
            noVideos: z.ZodOptional<z.ZodBoolean>;
            noSpoilers: z.ZodOptional<z.ZodBoolean>;
            noImages: z.ZodOptional<z.ZodBoolean>;
            noVideoReplies: z.ZodOptional<z.ZodBoolean>;
            noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
            noImageReplies: z.ZodOptional<z.ZodBoolean>;
            noPolls: z.ZodOptional<z.ZodBoolean>;
            noCrossposts: z.ZodOptional<z.ZodBoolean>;
            noUpvotes: z.ZodOptional<z.ZodBoolean>;
            noDownvotes: z.ZodOptional<z.ZodBoolean>;
            noAuthors: z.ZodOptional<z.ZodBoolean>;
            anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
            noNestedReplies: z.ZodOptional<z.ZodBoolean>;
            safeForWork: z.ZodOptional<z.ZodBoolean>;
            authorFlairs: z.ZodOptional<z.ZodBoolean>;
            requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
            postFlairs: z.ZodOptional<z.ZodBoolean>;
            requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
            noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
            noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
            markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
            markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
            requirePostLink: z.ZodOptional<z.ZodBoolean>;
            requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
        suggested?: z.objectOutputType<{
            primaryColor: z.ZodOptional<z.ZodString>;
            secondaryColor: z.ZodOptional<z.ZodString>;
            avatarUrl: z.ZodOptional<z.ZodString>;
            bannerUrl: z.ZodOptional<z.ZodString>;
            backgroundUrl: z.ZodOptional<z.ZodString>;
            language: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
        flairs?: Record<string, z.objectOutputType<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough">[]> | undefined;
    } & {
        [k: string]: unknown;
    };
    updateCid: string;
}, {
    subplebbit: {
        address: string;
        signature: {
            type: "ed25519" | "eip191";
            publicKey: string;
            signature: string;
            signedPropertyNames: [string, ...string[]];
        };
        protocolVersion: string;
        challenges: z.objectInputType<{
            exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">>, "many">>;
            description: z.ZodOptional<z.ZodString>;
            challenge: z.ZodOptional<z.ZodString>;
            type: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">[];
        updatedAt: number;
        encryption: {
            type: "ed25519-aes-gcm";
            publicKey: string;
        } & {
            [k: string]: unknown;
        };
        createdAt: number;
        statsCid: string;
        lastCommentCid?: string | undefined;
        description?: string | undefined;
        pubsubTopic?: string | undefined;
        title?: string | undefined;
        posts?: {
            pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
            pageCids: Record<string, string>;
        } | undefined;
        postUpdates?: Record<string, string> | undefined;
        roles?: Record<string, z.objectInputType<{
            role: z.ZodEnum<["owner", "admin", "moderator"]>;
        }, z.ZodTypeAny, "passthrough">> | undefined;
        rules?: string[] | undefined;
        lastPostCid?: string | undefined;
        features?: z.objectInputType<{
            noVideos: z.ZodOptional<z.ZodBoolean>;
            noSpoilers: z.ZodOptional<z.ZodBoolean>;
            noImages: z.ZodOptional<z.ZodBoolean>;
            noVideoReplies: z.ZodOptional<z.ZodBoolean>;
            noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
            noImageReplies: z.ZodOptional<z.ZodBoolean>;
            noPolls: z.ZodOptional<z.ZodBoolean>;
            noCrossposts: z.ZodOptional<z.ZodBoolean>;
            noUpvotes: z.ZodOptional<z.ZodBoolean>;
            noDownvotes: z.ZodOptional<z.ZodBoolean>;
            noAuthors: z.ZodOptional<z.ZodBoolean>;
            anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
            noNestedReplies: z.ZodOptional<z.ZodBoolean>;
            safeForWork: z.ZodOptional<z.ZodBoolean>;
            authorFlairs: z.ZodOptional<z.ZodBoolean>;
            requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
            postFlairs: z.ZodOptional<z.ZodBoolean>;
            requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
            noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
            noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
            markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
            markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
            requirePostLink: z.ZodOptional<z.ZodBoolean>;
            requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
        suggested?: z.objectInputType<{
            primaryColor: z.ZodOptional<z.ZodString>;
            secondaryColor: z.ZodOptional<z.ZodString>;
            avatarUrl: z.ZodOptional<z.ZodString>;
            bannerUrl: z.ZodOptional<z.ZodString>;
            backgroundUrl: z.ZodOptional<z.ZodString>;
            language: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
        flairs?: Record<string, z.objectInputType<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough">[]> | undefined;
    } & {
        [k: string]: unknown;
    };
    updateCid: string;
}>;
export declare const CreateRemoteSubplebbitOptionsSchema: z.ZodObject<z.objectUtil.extendShape<z.objectUtil.extendShape<{
    posts: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        pages: z.ZodRecord<z.ZodUnion<[z.ZodEnum<["hot", "new", "topHour", "topDay", "topWeek", "topMonth", "topYear", "topAll", "controversialHour", "controversialDay", "controversialWeek", "controversialMonth", "controversialYear", "controversialAll", "active"]>, z.ZodString]>, z.ZodType<import("../pages/types.js").PageIpfsManuallyDefined, z.ZodTypeDef, import("../pages/types.js").PageIpfsManuallyDefined>>;
        pageCids: z.ZodRecord<z.ZodUnion<[z.ZodEnum<["hot", "new", "topHour", "topDay", "topWeek", "topMonth", "topYear", "topAll", "controversialHour", "controversialDay", "controversialWeek", "controversialMonth", "controversialYear", "controversialAll", "active"]>, z.ZodString]>, z.ZodEffects<z.ZodString, string, string>>;
    }, "strip", z.ZodTypeAny, {
        pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
        pageCids: Record<string, string>;
    }, {
        pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
        pageCids: Record<string, string>;
    }>>>;
    challenges: z.ZodOptional<z.ZodArray<z.ZodObject<{
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        description: z.ZodOptional<z.ZodString>;
        challenge: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        description: z.ZodOptional<z.ZodString>;
        challenge: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        description: z.ZodOptional<z.ZodString>;
        challenge: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>, "many">>;
    signature: z.ZodOptional<z.ZodObject<{
        type: z.ZodEnum<["ed25519", "eip191"]>;
        signature: z.ZodString;
        publicKey: z.ZodString;
        signedPropertyNames: z.ZodArray<z.ZodString, "atleastone">;
    }, "strip", z.ZodTypeAny, {
        type: "ed25519" | "eip191";
        publicKey: string;
        signature: string;
        signedPropertyNames: [string, ...string[]];
    }, {
        type: "ed25519" | "eip191";
        publicKey: string;
        signature: string;
        signedPropertyNames: [string, ...string[]];
    }>>;
    encryption: z.ZodOptional<z.ZodObject<{
        type: z.ZodEnum<["ed25519-aes-gcm"]>;
        publicKey: z.ZodString;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        type: z.ZodEnum<["ed25519-aes-gcm"]>;
        publicKey: z.ZodString;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        type: z.ZodEnum<["ed25519-aes-gcm"]>;
        publicKey: z.ZodString;
    }, z.ZodTypeAny, "passthrough">>>;
    address: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodOptional<z.ZodNumber>;
    updatedAt: z.ZodOptional<z.ZodNumber>;
    pubsubTopic: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    statsCid: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    protocolVersion: z.ZodOptional<z.ZodString>;
    postUpdates: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodEffects<z.ZodString, string, string>>>>;
    title: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    roles: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough">>>>>;
    rules: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    lastPostCid: z.ZodOptional<z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>>;
    lastCommentCid: z.ZodOptional<z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>>;
    features: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">>>>;
    suggested: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>>>;
    flairs: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodArray<z.ZodObject<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">>, "many">>>>;
}, Pick<{
    posts: z.ZodOptional<z.ZodObject<{
        pages: z.ZodRecord<z.ZodUnion<[z.ZodEnum<["hot", "new", "topHour", "topDay", "topWeek", "topMonth", "topYear", "topAll", "controversialHour", "controversialDay", "controversialWeek", "controversialMonth", "controversialYear", "controversialAll", "active"]>, z.ZodString]>, z.ZodType<import("../pages/types.js").PageIpfsManuallyDefined, z.ZodTypeDef, import("../pages/types.js").PageIpfsManuallyDefined>>;
        pageCids: z.ZodRecord<z.ZodUnion<[z.ZodEnum<["hot", "new", "topHour", "topDay", "topWeek", "topMonth", "topYear", "topAll", "controversialHour", "controversialDay", "controversialWeek", "controversialMonth", "controversialYear", "controversialAll", "active"]>, z.ZodString]>, z.ZodEffects<z.ZodString, string, string>>;
    }, "strip", z.ZodTypeAny, {
        pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
        pageCids: Record<string, string>;
    }, {
        pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
        pageCids: Record<string, string>;
    }>>;
    challenges: z.ZodArray<z.ZodObject<{
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        description: z.ZodOptional<z.ZodString>;
        challenge: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        description: z.ZodOptional<z.ZodString>;
        challenge: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        description: z.ZodOptional<z.ZodString>;
        challenge: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>, "many">;
    signature: z.ZodObject<{
        type: z.ZodEnum<["ed25519", "eip191"]>;
        signature: z.ZodString;
        publicKey: z.ZodString;
        signedPropertyNames: z.ZodArray<z.ZodString, "atleastone">;
    }, "strip", z.ZodTypeAny, {
        type: "ed25519" | "eip191";
        publicKey: string;
        signature: string;
        signedPropertyNames: [string, ...string[]];
    }, {
        type: "ed25519" | "eip191";
        publicKey: string;
        signature: string;
        signedPropertyNames: [string, ...string[]];
    }>;
    encryption: z.ZodObject<{
        type: z.ZodEnum<["ed25519-aes-gcm"]>;
        publicKey: z.ZodString;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        type: z.ZodEnum<["ed25519-aes-gcm"]>;
        publicKey: z.ZodString;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        type: z.ZodEnum<["ed25519-aes-gcm"]>;
        publicKey: z.ZodString;
    }, z.ZodTypeAny, "passthrough">>;
    address: z.ZodString;
    createdAt: z.ZodNumber;
    updatedAt: z.ZodNumber;
    pubsubTopic: z.ZodOptional<z.ZodString>;
    statsCid: z.ZodEffects<z.ZodString, string, string>;
    protocolVersion: z.ZodString;
    postUpdates: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodEffects<z.ZodString, string, string>>>;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    roles: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough">>>>;
    rules: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    lastPostCid: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    lastCommentCid: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    features: z.ZodOptional<z.ZodObject<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">>>;
    suggested: z.ZodOptional<z.ZodObject<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>>;
    flairs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodArray<z.ZodObject<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">>, "many">>>;
}, "address">>, {
    posts: z.ZodUnion<[z.ZodOptional<z.ZodObject<{
        pages: z.ZodRecord<z.ZodUnion<[z.ZodEnum<["hot", "new", "topHour", "topDay", "topWeek", "topMonth", "topYear", "topAll", "controversialHour", "controversialDay", "controversialWeek", "controversialMonth", "controversialYear", "controversialAll", "active"]>, z.ZodString]>, z.ZodType<import("../pages/types.js").PageIpfsManuallyDefined, z.ZodTypeDef, import("../pages/types.js").PageIpfsManuallyDefined>>;
        pageCids: z.ZodRecord<z.ZodUnion<[z.ZodEnum<["hot", "new", "topHour", "topDay", "topWeek", "topMonth", "topYear", "topAll", "controversialHour", "controversialDay", "controversialWeek", "controversialMonth", "controversialYear", "controversialAll", "active"]>, z.ZodString]>, z.ZodEffects<z.ZodString, string, string>>;
    }, "strip", z.ZodTypeAny, {
        pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
        pageCids: Record<string, string>;
    }, {
        pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
        pageCids: Record<string, string>;
    }>>, z.ZodObject<Pick<{
        pages: z.ZodRecord<z.ZodUnion<[z.ZodEnum<["hot", "new", "topHour", "topDay", "topWeek", "topMonth", "topYear", "topAll", "controversialHour", "controversialDay", "controversialWeek", "controversialMonth", "controversialYear", "controversialAll", "active"]>, z.ZodString]>, z.ZodType<import("../pages/types.js").PageIpfsManuallyDefined, z.ZodTypeDef, import("../pages/types.js").PageIpfsManuallyDefined>>;
        pageCids: z.ZodRecord<z.ZodUnion<[z.ZodEnum<["hot", "new", "topHour", "topDay", "topWeek", "topMonth", "topYear", "topAll", "controversialHour", "controversialDay", "controversialWeek", "controversialMonth", "controversialYear", "controversialAll", "active"]>, z.ZodString]>, z.ZodEffects<z.ZodString, string, string>>;
    }, "pageCids">, "strip", z.ZodTypeAny, {
        pageCids: Record<string, string>;
    }, {
        pageCids: Record<string, string>;
    }>]>;
    updateCid: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
}>, "strict", z.ZodTypeAny, {
    address: string;
    signature?: {
        type: "ed25519" | "eip191";
        publicKey: string;
        signature: string;
        signedPropertyNames: [string, ...string[]];
    } | undefined;
    protocolVersion?: string | undefined;
    lastCommentCid?: string | undefined;
    description?: string | undefined;
    pubsubTopic?: string | undefined;
    title?: string | undefined;
    challenges?: z.objectOutputType<{
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        description: z.ZodOptional<z.ZodString>;
        challenge: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">[] | undefined;
    updatedAt?: number | undefined;
    posts?: {
        pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
        pageCids: Record<string, string>;
    } | {
        pageCids: Record<string, string>;
    } | undefined;
    encryption?: z.objectOutputType<{
        type: z.ZodEnum<["ed25519-aes-gcm"]>;
        publicKey: z.ZodString;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    createdAt?: number | undefined;
    statsCid?: string | undefined;
    postUpdates?: Record<string, string> | undefined;
    roles?: Record<string, z.objectOutputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough">> | undefined;
    rules?: string[] | undefined;
    lastPostCid?: string | undefined;
    features?: z.objectOutputType<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    suggested?: z.objectOutputType<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    flairs?: Record<string, z.objectOutputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">[]> | undefined;
    updateCid?: string | undefined;
}, {
    address: string;
    signature?: {
        type: "ed25519" | "eip191";
        publicKey: string;
        signature: string;
        signedPropertyNames: [string, ...string[]];
    } | undefined;
    protocolVersion?: string | undefined;
    lastCommentCid?: string | undefined;
    description?: string | undefined;
    pubsubTopic?: string | undefined;
    title?: string | undefined;
    challenges?: z.objectInputType<{
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        description: z.ZodOptional<z.ZodString>;
        challenge: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">[] | undefined;
    updatedAt?: number | undefined;
    posts?: {
        pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
        pageCids: Record<string, string>;
    } | {
        pageCids: Record<string, string>;
    } | undefined;
    encryption?: z.objectInputType<{
        type: z.ZodEnum<["ed25519-aes-gcm"]>;
        publicKey: z.ZodString;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    createdAt?: number | undefined;
    statsCid?: string | undefined;
    postUpdates?: Record<string, string> | undefined;
    roles?: Record<string, z.objectInputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough">> | undefined;
    rules?: string[] | undefined;
    lastPostCid?: string | undefined;
    features?: z.objectInputType<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    suggested?: z.objectInputType<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    flairs?: Record<string, z.objectInputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">[]> | undefined;
    updateCid?: string | undefined;
}>;
export declare const SubplebbitSettingsSchema: z.ZodObject<{
    fetchThumbnailUrls: z.ZodOptional<z.ZodBoolean>;
    fetchThumbnailUrlsProxyUrl: z.ZodOptional<z.ZodString>;
    challenges: z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodObject<{
        path: z.ZodOptional<z.ZodString>;
        name: z.ZodOptional<z.ZodString>;
        options: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        description: z.ZodOptional<z.ZodString>;
    }, "strict", z.ZodTypeAny, {
        path?: string | undefined;
        options?: Record<string, string> | undefined;
        name?: string | undefined;
        description?: string | undefined;
        exclude?: z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">[] | undefined;
    }, {
        path?: string | undefined;
        options?: Record<string, string> | undefined;
        name?: string | undefined;
        description?: string | undefined;
        exclude?: z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">[] | undefined;
    }>, {
        path?: string | undefined;
        options?: Record<string, string> | undefined;
        name?: string | undefined;
        description?: string | undefined;
        exclude?: z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">[] | undefined;
    }, {
        path?: string | undefined;
        options?: Record<string, string> | undefined;
        name?: string | undefined;
        description?: string | undefined;
        exclude?: z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">[] | undefined;
    }>, "many">>;
}, "strict", z.ZodTypeAny, {
    challenges?: {
        path?: string | undefined;
        options?: Record<string, string> | undefined;
        name?: string | undefined;
        description?: string | undefined;
        exclude?: z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">[] | undefined;
    }[] | undefined;
    fetchThumbnailUrls?: boolean | undefined;
    fetchThumbnailUrlsProxyUrl?: string | undefined;
}, {
    challenges?: {
        path?: string | undefined;
        options?: Record<string, string> | undefined;
        name?: string | undefined;
        description?: string | undefined;
        exclude?: z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">[] | undefined;
    }[] | undefined;
    fetchThumbnailUrls?: boolean | undefined;
    fetchThumbnailUrlsProxyUrl?: string | undefined;
}>;
export declare const SubplebbitEditOptionsSchema: z.ZodObject<{
    address: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    pubsubTopic: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    title: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    rules: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    features: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">>>>;
    suggested: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>>>;
    flairs: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodArray<z.ZodObject<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">>, "many">>>>;
    settings: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        fetchThumbnailUrls: z.ZodOptional<z.ZodBoolean>;
        fetchThumbnailUrlsProxyUrl: z.ZodOptional<z.ZodString>;
        challenges: z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodObject<{
            path: z.ZodOptional<z.ZodString>;
            name: z.ZodOptional<z.ZodString>;
            options: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">>, "many">>;
            description: z.ZodOptional<z.ZodString>;
        }, "strict", z.ZodTypeAny, {
            path?: string | undefined;
            options?: Record<string, string> | undefined;
            name?: string | undefined;
            description?: string | undefined;
            exclude?: z.objectOutputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">[] | undefined;
        }, {
            path?: string | undefined;
            options?: Record<string, string> | undefined;
            name?: string | undefined;
            description?: string | undefined;
            exclude?: z.objectInputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">[] | undefined;
        }>, {
            path?: string | undefined;
            options?: Record<string, string> | undefined;
            name?: string | undefined;
            description?: string | undefined;
            exclude?: z.objectOutputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">[] | undefined;
        }, {
            path?: string | undefined;
            options?: Record<string, string> | undefined;
            name?: string | undefined;
            description?: string | undefined;
            exclude?: z.objectInputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">[] | undefined;
        }>, "many">>;
    }, "strict", z.ZodTypeAny, {
        challenges?: {
            path?: string | undefined;
            options?: Record<string, string> | undefined;
            name?: string | undefined;
            description?: string | undefined;
            exclude?: z.objectOutputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">[] | undefined;
        }[] | undefined;
        fetchThumbnailUrls?: boolean | undefined;
        fetchThumbnailUrlsProxyUrl?: string | undefined;
    }, {
        challenges?: {
            path?: string | undefined;
            options?: Record<string, string> | undefined;
            name?: string | undefined;
            description?: string | undefined;
            exclude?: z.objectInputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">[] | undefined;
        }[] | undefined;
        fetchThumbnailUrls?: boolean | undefined;
        fetchThumbnailUrlsProxyUrl?: string | undefined;
    }>>>;
    roles: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodObject<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough">>, z.ZodUndefined]>>>>;
}, "strict", z.ZodTypeAny, {
    address?: string | undefined;
    description?: string | undefined;
    pubsubTopic?: string | undefined;
    title?: string | undefined;
    roles?: Record<string, z.objectOutputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough"> | undefined> | undefined;
    rules?: string[] | undefined;
    features?: z.objectOutputType<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    suggested?: z.objectOutputType<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    flairs?: Record<string, z.objectOutputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">[]> | undefined;
    settings?: {
        challenges?: {
            path?: string | undefined;
            options?: Record<string, string> | undefined;
            name?: string | undefined;
            description?: string | undefined;
            exclude?: z.objectOutputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">[] | undefined;
        }[] | undefined;
        fetchThumbnailUrls?: boolean | undefined;
        fetchThumbnailUrlsProxyUrl?: string | undefined;
    } | undefined;
}, {
    address?: string | undefined;
    description?: string | undefined;
    pubsubTopic?: string | undefined;
    title?: string | undefined;
    roles?: Record<string, z.objectInputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough"> | undefined> | undefined;
    rules?: string[] | undefined;
    features?: z.objectInputType<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    suggested?: z.objectInputType<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    flairs?: Record<string, z.objectInputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">[]> | undefined;
    settings?: {
        challenges?: {
            path?: string | undefined;
            options?: Record<string, string> | undefined;
            name?: string | undefined;
            description?: string | undefined;
            exclude?: z.objectInputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">[] | undefined;
        }[] | undefined;
        fetchThumbnailUrls?: boolean | undefined;
        fetchThumbnailUrlsProxyUrl?: string | undefined;
    } | undefined;
}>;
export declare const CreateNewLocalSubplebbitUserOptionsSchema: z.ZodObject<z.objectUtil.extendShape<Omit<{
    address: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    pubsubTopic: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    title: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    rules: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    features: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">>>>;
    suggested: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>>>;
    flairs: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodArray<z.ZodObject<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">>, "many">>>>;
    settings: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        fetchThumbnailUrls: z.ZodOptional<z.ZodBoolean>;
        fetchThumbnailUrlsProxyUrl: z.ZodOptional<z.ZodString>;
        challenges: z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodObject<{
            path: z.ZodOptional<z.ZodString>;
            name: z.ZodOptional<z.ZodString>;
            options: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">>, "many">>;
            description: z.ZodOptional<z.ZodString>;
        }, "strict", z.ZodTypeAny, {
            path?: string | undefined;
            options?: Record<string, string> | undefined;
            name?: string | undefined;
            description?: string | undefined;
            exclude?: z.objectOutputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">[] | undefined;
        }, {
            path?: string | undefined;
            options?: Record<string, string> | undefined;
            name?: string | undefined;
            description?: string | undefined;
            exclude?: z.objectInputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">[] | undefined;
        }>, {
            path?: string | undefined;
            options?: Record<string, string> | undefined;
            name?: string | undefined;
            description?: string | undefined;
            exclude?: z.objectOutputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">[] | undefined;
        }, {
            path?: string | undefined;
            options?: Record<string, string> | undefined;
            name?: string | undefined;
            description?: string | undefined;
            exclude?: z.objectInputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">[] | undefined;
        }>, "many">>;
    }, "strict", z.ZodTypeAny, {
        challenges?: {
            path?: string | undefined;
            options?: Record<string, string> | undefined;
            name?: string | undefined;
            description?: string | undefined;
            exclude?: z.objectOutputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">[] | undefined;
        }[] | undefined;
        fetchThumbnailUrls?: boolean | undefined;
        fetchThumbnailUrlsProxyUrl?: string | undefined;
    }, {
        challenges?: {
            path?: string | undefined;
            options?: Record<string, string> | undefined;
            name?: string | undefined;
            description?: string | undefined;
            exclude?: z.objectInputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">[] | undefined;
        }[] | undefined;
        fetchThumbnailUrls?: boolean | undefined;
        fetchThumbnailUrlsProxyUrl?: string | undefined;
    }>>>;
    roles: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodObject<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough">>, z.ZodUndefined]>>>>;
}, "address">, {
    signer: z.ZodOptional<z.ZodObject<{
        type: z.ZodEnum<["ed25519"]>;
        privateKey: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: "ed25519";
        privateKey: string;
    }, {
        type: "ed25519";
        privateKey: string;
    }>>;
    roles: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough">>>>;
}>, "strict", z.ZodTypeAny, {
    signer?: {
        type: "ed25519";
        privateKey: string;
    } | undefined;
    description?: string | undefined;
    pubsubTopic?: string | undefined;
    title?: string | undefined;
    roles?: Record<string, z.objectOutputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough">> | undefined;
    rules?: string[] | undefined;
    features?: z.objectOutputType<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    suggested?: z.objectOutputType<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    flairs?: Record<string, z.objectOutputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">[]> | undefined;
    settings?: {
        challenges?: {
            path?: string | undefined;
            options?: Record<string, string> | undefined;
            name?: string | undefined;
            description?: string | undefined;
            exclude?: z.objectOutputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">[] | undefined;
        }[] | undefined;
        fetchThumbnailUrls?: boolean | undefined;
        fetchThumbnailUrlsProxyUrl?: string | undefined;
    } | undefined;
}, {
    signer?: {
        type: "ed25519";
        privateKey: string;
    } | undefined;
    description?: string | undefined;
    pubsubTopic?: string | undefined;
    title?: string | undefined;
    roles?: Record<string, z.objectInputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough">> | undefined;
    rules?: string[] | undefined;
    features?: z.objectInputType<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    suggested?: z.objectInputType<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    flairs?: Record<string, z.objectInputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">[]> | undefined;
    settings?: {
        challenges?: {
            path?: string | undefined;
            options?: Record<string, string> | undefined;
            name?: string | undefined;
            description?: string | undefined;
            exclude?: z.objectInputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">[] | undefined;
        }[] | undefined;
        fetchThumbnailUrls?: boolean | undefined;
        fetchThumbnailUrlsProxyUrl?: string | undefined;
    } | undefined;
}>;
export declare const CreateNewLocalSubplebbitParsedOptionsSchema: z.ZodObject<z.objectUtil.extendShape<z.objectUtil.extendShape<Omit<{
    address: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    pubsubTopic: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    title: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    rules: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    features: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">>>>;
    suggested: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>>>;
    flairs: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodArray<z.ZodObject<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">>, "many">>>>;
    settings: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        fetchThumbnailUrls: z.ZodOptional<z.ZodBoolean>;
        fetchThumbnailUrlsProxyUrl: z.ZodOptional<z.ZodString>;
        challenges: z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodObject<{
            path: z.ZodOptional<z.ZodString>;
            name: z.ZodOptional<z.ZodString>;
            options: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">>, "many">>;
            description: z.ZodOptional<z.ZodString>;
        }, "strict", z.ZodTypeAny, {
            path?: string | undefined;
            options?: Record<string, string> | undefined;
            name?: string | undefined;
            description?: string | undefined;
            exclude?: z.objectOutputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">[] | undefined;
        }, {
            path?: string | undefined;
            options?: Record<string, string> | undefined;
            name?: string | undefined;
            description?: string | undefined;
            exclude?: z.objectInputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">[] | undefined;
        }>, {
            path?: string | undefined;
            options?: Record<string, string> | undefined;
            name?: string | undefined;
            description?: string | undefined;
            exclude?: z.objectOutputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">[] | undefined;
        }, {
            path?: string | undefined;
            options?: Record<string, string> | undefined;
            name?: string | undefined;
            description?: string | undefined;
            exclude?: z.objectInputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">[] | undefined;
        }>, "many">>;
    }, "strict", z.ZodTypeAny, {
        challenges?: {
            path?: string | undefined;
            options?: Record<string, string> | undefined;
            name?: string | undefined;
            description?: string | undefined;
            exclude?: z.objectOutputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">[] | undefined;
        }[] | undefined;
        fetchThumbnailUrls?: boolean | undefined;
        fetchThumbnailUrlsProxyUrl?: string | undefined;
    }, {
        challenges?: {
            path?: string | undefined;
            options?: Record<string, string> | undefined;
            name?: string | undefined;
            description?: string | undefined;
            exclude?: z.objectInputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">[] | undefined;
        }[] | undefined;
        fetchThumbnailUrls?: boolean | undefined;
        fetchThumbnailUrlsProxyUrl?: string | undefined;
    }>>>;
    roles: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodObject<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough">>, z.ZodUndefined]>>>>;
}, "address">, {
    signer: z.ZodOptional<z.ZodObject<{
        type: z.ZodEnum<["ed25519"]>;
        privateKey: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: "ed25519";
        privateKey: string;
    }, {
        type: "ed25519";
        privateKey: string;
    }>>;
    roles: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough">>>>;
}>, {
    address: z.ZodString;
    signer: z.ZodObject<z.objectUtil.extendShape<{
        type: z.ZodEnum<["ed25519"]>;
        privateKey: z.ZodString;
    }, {
        address: z.ZodString;
        publicKey: z.ZodString;
    }>, "strip", z.ZodTypeAny, {
        type: "ed25519";
        privateKey: string;
        address: string;
        publicKey: string;
    }, {
        type: "ed25519";
        privateKey: string;
        address: string;
        publicKey: string;
    }>;
}>, "strict", z.ZodTypeAny, {
    address: string;
    signer: {
        type: "ed25519";
        privateKey: string;
        address: string;
        publicKey: string;
    };
    description?: string | undefined;
    pubsubTopic?: string | undefined;
    title?: string | undefined;
    roles?: Record<string, z.objectOutputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough">> | undefined;
    rules?: string[] | undefined;
    features?: z.objectOutputType<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    suggested?: z.objectOutputType<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    flairs?: Record<string, z.objectOutputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">[]> | undefined;
    settings?: {
        challenges?: {
            path?: string | undefined;
            options?: Record<string, string> | undefined;
            name?: string | undefined;
            description?: string | undefined;
            exclude?: z.objectOutputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">[] | undefined;
        }[] | undefined;
        fetchThumbnailUrls?: boolean | undefined;
        fetchThumbnailUrlsProxyUrl?: string | undefined;
    } | undefined;
}, {
    address: string;
    signer: {
        type: "ed25519";
        privateKey: string;
        address: string;
        publicKey: string;
    };
    description?: string | undefined;
    pubsubTopic?: string | undefined;
    title?: string | undefined;
    roles?: Record<string, z.objectInputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough">> | undefined;
    rules?: string[] | undefined;
    features?: z.objectInputType<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    suggested?: z.objectInputType<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    flairs?: Record<string, z.objectInputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">[]> | undefined;
    settings?: {
        challenges?: {
            path?: string | undefined;
            options?: Record<string, string> | undefined;
            name?: string | undefined;
            description?: string | undefined;
            exclude?: z.objectInputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">[] | undefined;
        }[] | undefined;
        fetchThumbnailUrls?: boolean | undefined;
        fetchThumbnailUrlsProxyUrl?: string | undefined;
    } | undefined;
}>;
export declare const CreateRemoteSubplebbitFunctionArgumentSchema: z.ZodUnion<[z.ZodObject<z.objectUtil.extendShape<z.objectUtil.extendShape<{
    posts: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        pages: z.ZodRecord<z.ZodUnion<[z.ZodEnum<["hot", "new", "topHour", "topDay", "topWeek", "topMonth", "topYear", "topAll", "controversialHour", "controversialDay", "controversialWeek", "controversialMonth", "controversialYear", "controversialAll", "active"]>, z.ZodString]>, z.ZodType<import("../pages/types.js").PageIpfsManuallyDefined, z.ZodTypeDef, import("../pages/types.js").PageIpfsManuallyDefined>>;
        pageCids: z.ZodRecord<z.ZodUnion<[z.ZodEnum<["hot", "new", "topHour", "topDay", "topWeek", "topMonth", "topYear", "topAll", "controversialHour", "controversialDay", "controversialWeek", "controversialMonth", "controversialYear", "controversialAll", "active"]>, z.ZodString]>, z.ZodEffects<z.ZodString, string, string>>;
    }, "strip", z.ZodTypeAny, {
        pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
        pageCids: Record<string, string>;
    }, {
        pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
        pageCids: Record<string, string>;
    }>>>;
    challenges: z.ZodOptional<z.ZodArray<z.ZodObject<{
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        description: z.ZodOptional<z.ZodString>;
        challenge: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        description: z.ZodOptional<z.ZodString>;
        challenge: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        description: z.ZodOptional<z.ZodString>;
        challenge: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>, "many">>;
    signature: z.ZodOptional<z.ZodObject<{
        type: z.ZodEnum<["ed25519", "eip191"]>;
        signature: z.ZodString;
        publicKey: z.ZodString;
        signedPropertyNames: z.ZodArray<z.ZodString, "atleastone">;
    }, "strip", z.ZodTypeAny, {
        type: "ed25519" | "eip191";
        publicKey: string;
        signature: string;
        signedPropertyNames: [string, ...string[]];
    }, {
        type: "ed25519" | "eip191";
        publicKey: string;
        signature: string;
        signedPropertyNames: [string, ...string[]];
    }>>;
    encryption: z.ZodOptional<z.ZodObject<{
        type: z.ZodEnum<["ed25519-aes-gcm"]>;
        publicKey: z.ZodString;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        type: z.ZodEnum<["ed25519-aes-gcm"]>;
        publicKey: z.ZodString;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        type: z.ZodEnum<["ed25519-aes-gcm"]>;
        publicKey: z.ZodString;
    }, z.ZodTypeAny, "passthrough">>>;
    address: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodOptional<z.ZodNumber>;
    updatedAt: z.ZodOptional<z.ZodNumber>;
    pubsubTopic: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    statsCid: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    protocolVersion: z.ZodOptional<z.ZodString>;
    postUpdates: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodEffects<z.ZodString, string, string>>>>;
    title: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    roles: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough">>>>>;
    rules: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    lastPostCid: z.ZodOptional<z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>>;
    lastCommentCid: z.ZodOptional<z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>>;
    features: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">>>>;
    suggested: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>>>;
    flairs: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodArray<z.ZodObject<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">>, "many">>>>;
}, Pick<{
    posts: z.ZodOptional<z.ZodObject<{
        pages: z.ZodRecord<z.ZodUnion<[z.ZodEnum<["hot", "new", "topHour", "topDay", "topWeek", "topMonth", "topYear", "topAll", "controversialHour", "controversialDay", "controversialWeek", "controversialMonth", "controversialYear", "controversialAll", "active"]>, z.ZodString]>, z.ZodType<import("../pages/types.js").PageIpfsManuallyDefined, z.ZodTypeDef, import("../pages/types.js").PageIpfsManuallyDefined>>;
        pageCids: z.ZodRecord<z.ZodUnion<[z.ZodEnum<["hot", "new", "topHour", "topDay", "topWeek", "topMonth", "topYear", "topAll", "controversialHour", "controversialDay", "controversialWeek", "controversialMonth", "controversialYear", "controversialAll", "active"]>, z.ZodString]>, z.ZodEffects<z.ZodString, string, string>>;
    }, "strip", z.ZodTypeAny, {
        pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
        pageCids: Record<string, string>;
    }, {
        pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
        pageCids: Record<string, string>;
    }>>;
    challenges: z.ZodArray<z.ZodObject<{
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        description: z.ZodOptional<z.ZodString>;
        challenge: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        description: z.ZodOptional<z.ZodString>;
        challenge: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        description: z.ZodOptional<z.ZodString>;
        challenge: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>, "many">;
    signature: z.ZodObject<{
        type: z.ZodEnum<["ed25519", "eip191"]>;
        signature: z.ZodString;
        publicKey: z.ZodString;
        signedPropertyNames: z.ZodArray<z.ZodString, "atleastone">;
    }, "strip", z.ZodTypeAny, {
        type: "ed25519" | "eip191";
        publicKey: string;
        signature: string;
        signedPropertyNames: [string, ...string[]];
    }, {
        type: "ed25519" | "eip191";
        publicKey: string;
        signature: string;
        signedPropertyNames: [string, ...string[]];
    }>;
    encryption: z.ZodObject<{
        type: z.ZodEnum<["ed25519-aes-gcm"]>;
        publicKey: z.ZodString;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        type: z.ZodEnum<["ed25519-aes-gcm"]>;
        publicKey: z.ZodString;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        type: z.ZodEnum<["ed25519-aes-gcm"]>;
        publicKey: z.ZodString;
    }, z.ZodTypeAny, "passthrough">>;
    address: z.ZodString;
    createdAt: z.ZodNumber;
    updatedAt: z.ZodNumber;
    pubsubTopic: z.ZodOptional<z.ZodString>;
    statsCid: z.ZodEffects<z.ZodString, string, string>;
    protocolVersion: z.ZodString;
    postUpdates: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodEffects<z.ZodString, string, string>>>;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    roles: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough">>>>;
    rules: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    lastPostCid: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    lastCommentCid: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    features: z.ZodOptional<z.ZodObject<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">>>;
    suggested: z.ZodOptional<z.ZodObject<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>>;
    flairs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodArray<z.ZodObject<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">>, "many">>>;
}, "address">>, {
    posts: z.ZodUnion<[z.ZodOptional<z.ZodObject<{
        pages: z.ZodRecord<z.ZodUnion<[z.ZodEnum<["hot", "new", "topHour", "topDay", "topWeek", "topMonth", "topYear", "topAll", "controversialHour", "controversialDay", "controversialWeek", "controversialMonth", "controversialYear", "controversialAll", "active"]>, z.ZodString]>, z.ZodType<import("../pages/types.js").PageIpfsManuallyDefined, z.ZodTypeDef, import("../pages/types.js").PageIpfsManuallyDefined>>;
        pageCids: z.ZodRecord<z.ZodUnion<[z.ZodEnum<["hot", "new", "topHour", "topDay", "topWeek", "topMonth", "topYear", "topAll", "controversialHour", "controversialDay", "controversialWeek", "controversialMonth", "controversialYear", "controversialAll", "active"]>, z.ZodString]>, z.ZodEffects<z.ZodString, string, string>>;
    }, "strip", z.ZodTypeAny, {
        pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
        pageCids: Record<string, string>;
    }, {
        pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
        pageCids: Record<string, string>;
    }>>, z.ZodObject<Pick<{
        pages: z.ZodRecord<z.ZodUnion<[z.ZodEnum<["hot", "new", "topHour", "topDay", "topWeek", "topMonth", "topYear", "topAll", "controversialHour", "controversialDay", "controversialWeek", "controversialMonth", "controversialYear", "controversialAll", "active"]>, z.ZodString]>, z.ZodType<import("../pages/types.js").PageIpfsManuallyDefined, z.ZodTypeDef, import("../pages/types.js").PageIpfsManuallyDefined>>;
        pageCids: z.ZodRecord<z.ZodUnion<[z.ZodEnum<["hot", "new", "topHour", "topDay", "topWeek", "topMonth", "topYear", "topAll", "controversialHour", "controversialDay", "controversialWeek", "controversialMonth", "controversialYear", "controversialAll", "active"]>, z.ZodString]>, z.ZodEffects<z.ZodString, string, string>>;
    }, "pageCids">, "strip", z.ZodTypeAny, {
        pageCids: Record<string, string>;
    }, {
        pageCids: Record<string, string>;
    }>]>;
    updateCid: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
}>, "strict", z.ZodTypeAny, {
    address: string;
    signature?: {
        type: "ed25519" | "eip191";
        publicKey: string;
        signature: string;
        signedPropertyNames: [string, ...string[]];
    } | undefined;
    protocolVersion?: string | undefined;
    lastCommentCid?: string | undefined;
    description?: string | undefined;
    pubsubTopic?: string | undefined;
    title?: string | undefined;
    challenges?: z.objectOutputType<{
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        description: z.ZodOptional<z.ZodString>;
        challenge: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">[] | undefined;
    updatedAt?: number | undefined;
    posts?: {
        pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
        pageCids: Record<string, string>;
    } | {
        pageCids: Record<string, string>;
    } | undefined;
    encryption?: z.objectOutputType<{
        type: z.ZodEnum<["ed25519-aes-gcm"]>;
        publicKey: z.ZodString;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    createdAt?: number | undefined;
    statsCid?: string | undefined;
    postUpdates?: Record<string, string> | undefined;
    roles?: Record<string, z.objectOutputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough">> | undefined;
    rules?: string[] | undefined;
    lastPostCid?: string | undefined;
    features?: z.objectOutputType<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    suggested?: z.objectOutputType<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    flairs?: Record<string, z.objectOutputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">[]> | undefined;
    updateCid?: string | undefined;
}, {
    address: string;
    signature?: {
        type: "ed25519" | "eip191";
        publicKey: string;
        signature: string;
        signedPropertyNames: [string, ...string[]];
    } | undefined;
    protocolVersion?: string | undefined;
    lastCommentCid?: string | undefined;
    description?: string | undefined;
    pubsubTopic?: string | undefined;
    title?: string | undefined;
    challenges?: z.objectInputType<{
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        description: z.ZodOptional<z.ZodString>;
        challenge: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">[] | undefined;
    updatedAt?: number | undefined;
    posts?: {
        pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
        pageCids: Record<string, string>;
    } | {
        pageCids: Record<string, string>;
    } | undefined;
    encryption?: z.objectInputType<{
        type: z.ZodEnum<["ed25519-aes-gcm"]>;
        publicKey: z.ZodString;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    createdAt?: number | undefined;
    statsCid?: string | undefined;
    postUpdates?: Record<string, string> | undefined;
    roles?: Record<string, z.objectInputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough">> | undefined;
    rules?: string[] | undefined;
    lastPostCid?: string | undefined;
    features?: z.objectInputType<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    suggested?: z.objectInputType<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    flairs?: Record<string, z.objectInputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">[]> | undefined;
    updateCid?: string | undefined;
}>, z.ZodObject<{
    posts: z.ZodOptional<z.ZodObject<{
        pages: z.ZodRecord<z.ZodUnion<[z.ZodEnum<["hot", "new", "topHour", "topDay", "topWeek", "topMonth", "topYear", "topAll", "controversialHour", "controversialDay", "controversialWeek", "controversialMonth", "controversialYear", "controversialAll", "active"]>, z.ZodString]>, z.ZodType<import("../pages/types.js").PageIpfsManuallyDefined, z.ZodTypeDef, import("../pages/types.js").PageIpfsManuallyDefined>>;
        pageCids: z.ZodRecord<z.ZodUnion<[z.ZodEnum<["hot", "new", "topHour", "topDay", "topWeek", "topMonth", "topYear", "topAll", "controversialHour", "controversialDay", "controversialWeek", "controversialMonth", "controversialYear", "controversialAll", "active"]>, z.ZodString]>, z.ZodEffects<z.ZodString, string, string>>;
    }, "strip", z.ZodTypeAny, {
        pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
        pageCids: Record<string, string>;
    }, {
        pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
        pageCids: Record<string, string>;
    }>>;
    challenges: z.ZodArray<z.ZodObject<{
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        description: z.ZodOptional<z.ZodString>;
        challenge: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        description: z.ZodOptional<z.ZodString>;
        challenge: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        description: z.ZodOptional<z.ZodString>;
        challenge: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>, "many">;
    signature: z.ZodObject<{
        type: z.ZodEnum<["ed25519", "eip191"]>;
        signature: z.ZodString;
        publicKey: z.ZodString;
        signedPropertyNames: z.ZodArray<z.ZodString, "atleastone">;
    }, "strip", z.ZodTypeAny, {
        type: "ed25519" | "eip191";
        publicKey: string;
        signature: string;
        signedPropertyNames: [string, ...string[]];
    }, {
        type: "ed25519" | "eip191";
        publicKey: string;
        signature: string;
        signedPropertyNames: [string, ...string[]];
    }>;
    encryption: z.ZodObject<{
        type: z.ZodEnum<["ed25519-aes-gcm"]>;
        publicKey: z.ZodString;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        type: z.ZodEnum<["ed25519-aes-gcm"]>;
        publicKey: z.ZodString;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        type: z.ZodEnum<["ed25519-aes-gcm"]>;
        publicKey: z.ZodString;
    }, z.ZodTypeAny, "passthrough">>;
    address: z.ZodString;
    createdAt: z.ZodNumber;
    updatedAt: z.ZodNumber;
    pubsubTopic: z.ZodOptional<z.ZodString>;
    statsCid: z.ZodEffects<z.ZodString, string, string>;
    protocolVersion: z.ZodString;
    postUpdates: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodEffects<z.ZodString, string, string>>>;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    roles: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough">>>>;
    rules: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    lastPostCid: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    lastCommentCid: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    features: z.ZodOptional<z.ZodObject<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">>>;
    suggested: z.ZodOptional<z.ZodObject<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>>;
    flairs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodArray<z.ZodObject<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">>, "many">>>;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    posts: z.ZodOptional<z.ZodObject<{
        pages: z.ZodRecord<z.ZodUnion<[z.ZodEnum<["hot", "new", "topHour", "topDay", "topWeek", "topMonth", "topYear", "topAll", "controversialHour", "controversialDay", "controversialWeek", "controversialMonth", "controversialYear", "controversialAll", "active"]>, z.ZodString]>, z.ZodType<import("../pages/types.js").PageIpfsManuallyDefined, z.ZodTypeDef, import("../pages/types.js").PageIpfsManuallyDefined>>;
        pageCids: z.ZodRecord<z.ZodUnion<[z.ZodEnum<["hot", "new", "topHour", "topDay", "topWeek", "topMonth", "topYear", "topAll", "controversialHour", "controversialDay", "controversialWeek", "controversialMonth", "controversialYear", "controversialAll", "active"]>, z.ZodString]>, z.ZodEffects<z.ZodString, string, string>>;
    }, "strip", z.ZodTypeAny, {
        pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
        pageCids: Record<string, string>;
    }, {
        pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
        pageCids: Record<string, string>;
    }>>;
    challenges: z.ZodArray<z.ZodObject<{
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        description: z.ZodOptional<z.ZodString>;
        challenge: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        description: z.ZodOptional<z.ZodString>;
        challenge: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        description: z.ZodOptional<z.ZodString>;
        challenge: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>, "many">;
    signature: z.ZodObject<{
        type: z.ZodEnum<["ed25519", "eip191"]>;
        signature: z.ZodString;
        publicKey: z.ZodString;
        signedPropertyNames: z.ZodArray<z.ZodString, "atleastone">;
    }, "strip", z.ZodTypeAny, {
        type: "ed25519" | "eip191";
        publicKey: string;
        signature: string;
        signedPropertyNames: [string, ...string[]];
    }, {
        type: "ed25519" | "eip191";
        publicKey: string;
        signature: string;
        signedPropertyNames: [string, ...string[]];
    }>;
    encryption: z.ZodObject<{
        type: z.ZodEnum<["ed25519-aes-gcm"]>;
        publicKey: z.ZodString;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        type: z.ZodEnum<["ed25519-aes-gcm"]>;
        publicKey: z.ZodString;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        type: z.ZodEnum<["ed25519-aes-gcm"]>;
        publicKey: z.ZodString;
    }, z.ZodTypeAny, "passthrough">>;
    address: z.ZodString;
    createdAt: z.ZodNumber;
    updatedAt: z.ZodNumber;
    pubsubTopic: z.ZodOptional<z.ZodString>;
    statsCid: z.ZodEffects<z.ZodString, string, string>;
    protocolVersion: z.ZodString;
    postUpdates: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodEffects<z.ZodString, string, string>>>;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    roles: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough">>>>;
    rules: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    lastPostCid: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    lastCommentCid: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    features: z.ZodOptional<z.ZodObject<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">>>;
    suggested: z.ZodOptional<z.ZodObject<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>>;
    flairs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodArray<z.ZodObject<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">>, "many">>>;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    posts: z.ZodOptional<z.ZodObject<{
        pages: z.ZodRecord<z.ZodUnion<[z.ZodEnum<["hot", "new", "topHour", "topDay", "topWeek", "topMonth", "topYear", "topAll", "controversialHour", "controversialDay", "controversialWeek", "controversialMonth", "controversialYear", "controversialAll", "active"]>, z.ZodString]>, z.ZodType<import("../pages/types.js").PageIpfsManuallyDefined, z.ZodTypeDef, import("../pages/types.js").PageIpfsManuallyDefined>>;
        pageCids: z.ZodRecord<z.ZodUnion<[z.ZodEnum<["hot", "new", "topHour", "topDay", "topWeek", "topMonth", "topYear", "topAll", "controversialHour", "controversialDay", "controversialWeek", "controversialMonth", "controversialYear", "controversialAll", "active"]>, z.ZodString]>, z.ZodEffects<z.ZodString, string, string>>;
    }, "strip", z.ZodTypeAny, {
        pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
        pageCids: Record<string, string>;
    }, {
        pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
        pageCids: Record<string, string>;
    }>>;
    challenges: z.ZodArray<z.ZodObject<{
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        description: z.ZodOptional<z.ZodString>;
        challenge: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        description: z.ZodOptional<z.ZodString>;
        challenge: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        description: z.ZodOptional<z.ZodString>;
        challenge: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>, "many">;
    signature: z.ZodObject<{
        type: z.ZodEnum<["ed25519", "eip191"]>;
        signature: z.ZodString;
        publicKey: z.ZodString;
        signedPropertyNames: z.ZodArray<z.ZodString, "atleastone">;
    }, "strip", z.ZodTypeAny, {
        type: "ed25519" | "eip191";
        publicKey: string;
        signature: string;
        signedPropertyNames: [string, ...string[]];
    }, {
        type: "ed25519" | "eip191";
        publicKey: string;
        signature: string;
        signedPropertyNames: [string, ...string[]];
    }>;
    encryption: z.ZodObject<{
        type: z.ZodEnum<["ed25519-aes-gcm"]>;
        publicKey: z.ZodString;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        type: z.ZodEnum<["ed25519-aes-gcm"]>;
        publicKey: z.ZodString;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        type: z.ZodEnum<["ed25519-aes-gcm"]>;
        publicKey: z.ZodString;
    }, z.ZodTypeAny, "passthrough">>;
    address: z.ZodString;
    createdAt: z.ZodNumber;
    updatedAt: z.ZodNumber;
    pubsubTopic: z.ZodOptional<z.ZodString>;
    statsCid: z.ZodEffects<z.ZodString, string, string>;
    protocolVersion: z.ZodString;
    postUpdates: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodEffects<z.ZodString, string, string>>>;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    roles: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough">>>>;
    rules: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    lastPostCid: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    lastCommentCid: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    features: z.ZodOptional<z.ZodObject<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">>>;
    suggested: z.ZodOptional<z.ZodObject<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>>;
    flairs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodArray<z.ZodObject<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">>, "many">>>;
}, z.ZodTypeAny, "passthrough">>]>;
export declare const CreateRpcSubplebbitFunctionArgumentSchema: z.ZodUnion<[z.ZodUnion<[z.ZodObject<z.objectUtil.extendShape<z.objectUtil.extendShape<{
    posts: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        pages: z.ZodRecord<z.ZodUnion<[z.ZodEnum<["hot", "new", "topHour", "topDay", "topWeek", "topMonth", "topYear", "topAll", "controversialHour", "controversialDay", "controversialWeek", "controversialMonth", "controversialYear", "controversialAll", "active"]>, z.ZodString]>, z.ZodType<import("../pages/types.js").PageIpfsManuallyDefined, z.ZodTypeDef, import("../pages/types.js").PageIpfsManuallyDefined>>;
        pageCids: z.ZodRecord<z.ZodUnion<[z.ZodEnum<["hot", "new", "topHour", "topDay", "topWeek", "topMonth", "topYear", "topAll", "controversialHour", "controversialDay", "controversialWeek", "controversialMonth", "controversialYear", "controversialAll", "active"]>, z.ZodString]>, z.ZodEffects<z.ZodString, string, string>>;
    }, "strip", z.ZodTypeAny, {
        pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
        pageCids: Record<string, string>;
    }, {
        pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
        pageCids: Record<string, string>;
    }>>>;
    challenges: z.ZodOptional<z.ZodArray<z.ZodObject<{
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        description: z.ZodOptional<z.ZodString>;
        challenge: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        description: z.ZodOptional<z.ZodString>;
        challenge: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        description: z.ZodOptional<z.ZodString>;
        challenge: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>, "many">>;
    signature: z.ZodOptional<z.ZodObject<{
        type: z.ZodEnum<["ed25519", "eip191"]>;
        signature: z.ZodString;
        publicKey: z.ZodString;
        signedPropertyNames: z.ZodArray<z.ZodString, "atleastone">;
    }, "strip", z.ZodTypeAny, {
        type: "ed25519" | "eip191";
        publicKey: string;
        signature: string;
        signedPropertyNames: [string, ...string[]];
    }, {
        type: "ed25519" | "eip191";
        publicKey: string;
        signature: string;
        signedPropertyNames: [string, ...string[]];
    }>>;
    encryption: z.ZodOptional<z.ZodObject<{
        type: z.ZodEnum<["ed25519-aes-gcm"]>;
        publicKey: z.ZodString;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        type: z.ZodEnum<["ed25519-aes-gcm"]>;
        publicKey: z.ZodString;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        type: z.ZodEnum<["ed25519-aes-gcm"]>;
        publicKey: z.ZodString;
    }, z.ZodTypeAny, "passthrough">>>;
    address: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodOptional<z.ZodNumber>;
    updatedAt: z.ZodOptional<z.ZodNumber>;
    pubsubTopic: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    statsCid: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    protocolVersion: z.ZodOptional<z.ZodString>;
    postUpdates: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodEffects<z.ZodString, string, string>>>>;
    title: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    roles: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough">>>>>;
    rules: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    lastPostCid: z.ZodOptional<z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>>;
    lastCommentCid: z.ZodOptional<z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>>;
    features: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">>>>;
    suggested: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>>>;
    flairs: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodArray<z.ZodObject<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">>, "many">>>>;
}, Pick<{
    posts: z.ZodOptional<z.ZodObject<{
        pages: z.ZodRecord<z.ZodUnion<[z.ZodEnum<["hot", "new", "topHour", "topDay", "topWeek", "topMonth", "topYear", "topAll", "controversialHour", "controversialDay", "controversialWeek", "controversialMonth", "controversialYear", "controversialAll", "active"]>, z.ZodString]>, z.ZodType<import("../pages/types.js").PageIpfsManuallyDefined, z.ZodTypeDef, import("../pages/types.js").PageIpfsManuallyDefined>>;
        pageCids: z.ZodRecord<z.ZodUnion<[z.ZodEnum<["hot", "new", "topHour", "topDay", "topWeek", "topMonth", "topYear", "topAll", "controversialHour", "controversialDay", "controversialWeek", "controversialMonth", "controversialYear", "controversialAll", "active"]>, z.ZodString]>, z.ZodEffects<z.ZodString, string, string>>;
    }, "strip", z.ZodTypeAny, {
        pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
        pageCids: Record<string, string>;
    }, {
        pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
        pageCids: Record<string, string>;
    }>>;
    challenges: z.ZodArray<z.ZodObject<{
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        description: z.ZodOptional<z.ZodString>;
        challenge: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        description: z.ZodOptional<z.ZodString>;
        challenge: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        description: z.ZodOptional<z.ZodString>;
        challenge: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>, "many">;
    signature: z.ZodObject<{
        type: z.ZodEnum<["ed25519", "eip191"]>;
        signature: z.ZodString;
        publicKey: z.ZodString;
        signedPropertyNames: z.ZodArray<z.ZodString, "atleastone">;
    }, "strip", z.ZodTypeAny, {
        type: "ed25519" | "eip191";
        publicKey: string;
        signature: string;
        signedPropertyNames: [string, ...string[]];
    }, {
        type: "ed25519" | "eip191";
        publicKey: string;
        signature: string;
        signedPropertyNames: [string, ...string[]];
    }>;
    encryption: z.ZodObject<{
        type: z.ZodEnum<["ed25519-aes-gcm"]>;
        publicKey: z.ZodString;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        type: z.ZodEnum<["ed25519-aes-gcm"]>;
        publicKey: z.ZodString;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        type: z.ZodEnum<["ed25519-aes-gcm"]>;
        publicKey: z.ZodString;
    }, z.ZodTypeAny, "passthrough">>;
    address: z.ZodString;
    createdAt: z.ZodNumber;
    updatedAt: z.ZodNumber;
    pubsubTopic: z.ZodOptional<z.ZodString>;
    statsCid: z.ZodEffects<z.ZodString, string, string>;
    protocolVersion: z.ZodString;
    postUpdates: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodEffects<z.ZodString, string, string>>>;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    roles: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough">>>>;
    rules: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    lastPostCid: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    lastCommentCid: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    features: z.ZodOptional<z.ZodObject<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">>>;
    suggested: z.ZodOptional<z.ZodObject<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>>;
    flairs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodArray<z.ZodObject<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">>, "many">>>;
}, "address">>, {
    posts: z.ZodUnion<[z.ZodOptional<z.ZodObject<{
        pages: z.ZodRecord<z.ZodUnion<[z.ZodEnum<["hot", "new", "topHour", "topDay", "topWeek", "topMonth", "topYear", "topAll", "controversialHour", "controversialDay", "controversialWeek", "controversialMonth", "controversialYear", "controversialAll", "active"]>, z.ZodString]>, z.ZodType<import("../pages/types.js").PageIpfsManuallyDefined, z.ZodTypeDef, import("../pages/types.js").PageIpfsManuallyDefined>>;
        pageCids: z.ZodRecord<z.ZodUnion<[z.ZodEnum<["hot", "new", "topHour", "topDay", "topWeek", "topMonth", "topYear", "topAll", "controversialHour", "controversialDay", "controversialWeek", "controversialMonth", "controversialYear", "controversialAll", "active"]>, z.ZodString]>, z.ZodEffects<z.ZodString, string, string>>;
    }, "strip", z.ZodTypeAny, {
        pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
        pageCids: Record<string, string>;
    }, {
        pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
        pageCids: Record<string, string>;
    }>>, z.ZodObject<Pick<{
        pages: z.ZodRecord<z.ZodUnion<[z.ZodEnum<["hot", "new", "topHour", "topDay", "topWeek", "topMonth", "topYear", "topAll", "controversialHour", "controversialDay", "controversialWeek", "controversialMonth", "controversialYear", "controversialAll", "active"]>, z.ZodString]>, z.ZodType<import("../pages/types.js").PageIpfsManuallyDefined, z.ZodTypeDef, import("../pages/types.js").PageIpfsManuallyDefined>>;
        pageCids: z.ZodRecord<z.ZodUnion<[z.ZodEnum<["hot", "new", "topHour", "topDay", "topWeek", "topMonth", "topYear", "topAll", "controversialHour", "controversialDay", "controversialWeek", "controversialMonth", "controversialYear", "controversialAll", "active"]>, z.ZodString]>, z.ZodEffects<z.ZodString, string, string>>;
    }, "pageCids">, "strip", z.ZodTypeAny, {
        pageCids: Record<string, string>;
    }, {
        pageCids: Record<string, string>;
    }>]>;
    updateCid: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
}>, "strict", z.ZodTypeAny, {
    address: string;
    signature?: {
        type: "ed25519" | "eip191";
        publicKey: string;
        signature: string;
        signedPropertyNames: [string, ...string[]];
    } | undefined;
    protocolVersion?: string | undefined;
    lastCommentCid?: string | undefined;
    description?: string | undefined;
    pubsubTopic?: string | undefined;
    title?: string | undefined;
    challenges?: z.objectOutputType<{
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        description: z.ZodOptional<z.ZodString>;
        challenge: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">[] | undefined;
    updatedAt?: number | undefined;
    posts?: {
        pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
        pageCids: Record<string, string>;
    } | {
        pageCids: Record<string, string>;
    } | undefined;
    encryption?: z.objectOutputType<{
        type: z.ZodEnum<["ed25519-aes-gcm"]>;
        publicKey: z.ZodString;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    createdAt?: number | undefined;
    statsCid?: string | undefined;
    postUpdates?: Record<string, string> | undefined;
    roles?: Record<string, z.objectOutputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough">> | undefined;
    rules?: string[] | undefined;
    lastPostCid?: string | undefined;
    features?: z.objectOutputType<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    suggested?: z.objectOutputType<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    flairs?: Record<string, z.objectOutputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">[]> | undefined;
    updateCid?: string | undefined;
}, {
    address: string;
    signature?: {
        type: "ed25519" | "eip191";
        publicKey: string;
        signature: string;
        signedPropertyNames: [string, ...string[]];
    } | undefined;
    protocolVersion?: string | undefined;
    lastCommentCid?: string | undefined;
    description?: string | undefined;
    pubsubTopic?: string | undefined;
    title?: string | undefined;
    challenges?: z.objectInputType<{
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        description: z.ZodOptional<z.ZodString>;
        challenge: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">[] | undefined;
    updatedAt?: number | undefined;
    posts?: {
        pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
        pageCids: Record<string, string>;
    } | {
        pageCids: Record<string, string>;
    } | undefined;
    encryption?: z.objectInputType<{
        type: z.ZodEnum<["ed25519-aes-gcm"]>;
        publicKey: z.ZodString;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    createdAt?: number | undefined;
    statsCid?: string | undefined;
    postUpdates?: Record<string, string> | undefined;
    roles?: Record<string, z.objectInputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough">> | undefined;
    rules?: string[] | undefined;
    lastPostCid?: string | undefined;
    features?: z.objectInputType<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    suggested?: z.objectInputType<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    flairs?: Record<string, z.objectInputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">[]> | undefined;
    updateCid?: string | undefined;
}>, z.ZodObject<{
    posts: z.ZodOptional<z.ZodObject<{
        pages: z.ZodRecord<z.ZodUnion<[z.ZodEnum<["hot", "new", "topHour", "topDay", "topWeek", "topMonth", "topYear", "topAll", "controversialHour", "controversialDay", "controversialWeek", "controversialMonth", "controversialYear", "controversialAll", "active"]>, z.ZodString]>, z.ZodType<import("../pages/types.js").PageIpfsManuallyDefined, z.ZodTypeDef, import("../pages/types.js").PageIpfsManuallyDefined>>;
        pageCids: z.ZodRecord<z.ZodUnion<[z.ZodEnum<["hot", "new", "topHour", "topDay", "topWeek", "topMonth", "topYear", "topAll", "controversialHour", "controversialDay", "controversialWeek", "controversialMonth", "controversialYear", "controversialAll", "active"]>, z.ZodString]>, z.ZodEffects<z.ZodString, string, string>>;
    }, "strip", z.ZodTypeAny, {
        pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
        pageCids: Record<string, string>;
    }, {
        pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
        pageCids: Record<string, string>;
    }>>;
    challenges: z.ZodArray<z.ZodObject<{
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        description: z.ZodOptional<z.ZodString>;
        challenge: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        description: z.ZodOptional<z.ZodString>;
        challenge: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        description: z.ZodOptional<z.ZodString>;
        challenge: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>, "many">;
    signature: z.ZodObject<{
        type: z.ZodEnum<["ed25519", "eip191"]>;
        signature: z.ZodString;
        publicKey: z.ZodString;
        signedPropertyNames: z.ZodArray<z.ZodString, "atleastone">;
    }, "strip", z.ZodTypeAny, {
        type: "ed25519" | "eip191";
        publicKey: string;
        signature: string;
        signedPropertyNames: [string, ...string[]];
    }, {
        type: "ed25519" | "eip191";
        publicKey: string;
        signature: string;
        signedPropertyNames: [string, ...string[]];
    }>;
    encryption: z.ZodObject<{
        type: z.ZodEnum<["ed25519-aes-gcm"]>;
        publicKey: z.ZodString;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        type: z.ZodEnum<["ed25519-aes-gcm"]>;
        publicKey: z.ZodString;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        type: z.ZodEnum<["ed25519-aes-gcm"]>;
        publicKey: z.ZodString;
    }, z.ZodTypeAny, "passthrough">>;
    address: z.ZodString;
    createdAt: z.ZodNumber;
    updatedAt: z.ZodNumber;
    pubsubTopic: z.ZodOptional<z.ZodString>;
    statsCid: z.ZodEffects<z.ZodString, string, string>;
    protocolVersion: z.ZodString;
    postUpdates: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodEffects<z.ZodString, string, string>>>;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    roles: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough">>>>;
    rules: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    lastPostCid: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    lastCommentCid: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    features: z.ZodOptional<z.ZodObject<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">>>;
    suggested: z.ZodOptional<z.ZodObject<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>>;
    flairs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodArray<z.ZodObject<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">>, "many">>>;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    posts: z.ZodOptional<z.ZodObject<{
        pages: z.ZodRecord<z.ZodUnion<[z.ZodEnum<["hot", "new", "topHour", "topDay", "topWeek", "topMonth", "topYear", "topAll", "controversialHour", "controversialDay", "controversialWeek", "controversialMonth", "controversialYear", "controversialAll", "active"]>, z.ZodString]>, z.ZodType<import("../pages/types.js").PageIpfsManuallyDefined, z.ZodTypeDef, import("../pages/types.js").PageIpfsManuallyDefined>>;
        pageCids: z.ZodRecord<z.ZodUnion<[z.ZodEnum<["hot", "new", "topHour", "topDay", "topWeek", "topMonth", "topYear", "topAll", "controversialHour", "controversialDay", "controversialWeek", "controversialMonth", "controversialYear", "controversialAll", "active"]>, z.ZodString]>, z.ZodEffects<z.ZodString, string, string>>;
    }, "strip", z.ZodTypeAny, {
        pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
        pageCids: Record<string, string>;
    }, {
        pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
        pageCids: Record<string, string>;
    }>>;
    challenges: z.ZodArray<z.ZodObject<{
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        description: z.ZodOptional<z.ZodString>;
        challenge: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        description: z.ZodOptional<z.ZodString>;
        challenge: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        description: z.ZodOptional<z.ZodString>;
        challenge: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>, "many">;
    signature: z.ZodObject<{
        type: z.ZodEnum<["ed25519", "eip191"]>;
        signature: z.ZodString;
        publicKey: z.ZodString;
        signedPropertyNames: z.ZodArray<z.ZodString, "atleastone">;
    }, "strip", z.ZodTypeAny, {
        type: "ed25519" | "eip191";
        publicKey: string;
        signature: string;
        signedPropertyNames: [string, ...string[]];
    }, {
        type: "ed25519" | "eip191";
        publicKey: string;
        signature: string;
        signedPropertyNames: [string, ...string[]];
    }>;
    encryption: z.ZodObject<{
        type: z.ZodEnum<["ed25519-aes-gcm"]>;
        publicKey: z.ZodString;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        type: z.ZodEnum<["ed25519-aes-gcm"]>;
        publicKey: z.ZodString;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        type: z.ZodEnum<["ed25519-aes-gcm"]>;
        publicKey: z.ZodString;
    }, z.ZodTypeAny, "passthrough">>;
    address: z.ZodString;
    createdAt: z.ZodNumber;
    updatedAt: z.ZodNumber;
    pubsubTopic: z.ZodOptional<z.ZodString>;
    statsCid: z.ZodEffects<z.ZodString, string, string>;
    protocolVersion: z.ZodString;
    postUpdates: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodEffects<z.ZodString, string, string>>>;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    roles: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough">>>>;
    rules: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    lastPostCid: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    lastCommentCid: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    features: z.ZodOptional<z.ZodObject<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">>>;
    suggested: z.ZodOptional<z.ZodObject<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>>;
    flairs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodArray<z.ZodObject<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">>, "many">>>;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    posts: z.ZodOptional<z.ZodObject<{
        pages: z.ZodRecord<z.ZodUnion<[z.ZodEnum<["hot", "new", "topHour", "topDay", "topWeek", "topMonth", "topYear", "topAll", "controversialHour", "controversialDay", "controversialWeek", "controversialMonth", "controversialYear", "controversialAll", "active"]>, z.ZodString]>, z.ZodType<import("../pages/types.js").PageIpfsManuallyDefined, z.ZodTypeDef, import("../pages/types.js").PageIpfsManuallyDefined>>;
        pageCids: z.ZodRecord<z.ZodUnion<[z.ZodEnum<["hot", "new", "topHour", "topDay", "topWeek", "topMonth", "topYear", "topAll", "controversialHour", "controversialDay", "controversialWeek", "controversialMonth", "controversialYear", "controversialAll", "active"]>, z.ZodString]>, z.ZodEffects<z.ZodString, string, string>>;
    }, "strip", z.ZodTypeAny, {
        pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
        pageCids: Record<string, string>;
    }, {
        pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
        pageCids: Record<string, string>;
    }>>;
    challenges: z.ZodArray<z.ZodObject<{
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        description: z.ZodOptional<z.ZodString>;
        challenge: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        description: z.ZodOptional<z.ZodString>;
        challenge: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        description: z.ZodOptional<z.ZodString>;
        challenge: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>, "many">;
    signature: z.ZodObject<{
        type: z.ZodEnum<["ed25519", "eip191"]>;
        signature: z.ZodString;
        publicKey: z.ZodString;
        signedPropertyNames: z.ZodArray<z.ZodString, "atleastone">;
    }, "strip", z.ZodTypeAny, {
        type: "ed25519" | "eip191";
        publicKey: string;
        signature: string;
        signedPropertyNames: [string, ...string[]];
    }, {
        type: "ed25519" | "eip191";
        publicKey: string;
        signature: string;
        signedPropertyNames: [string, ...string[]];
    }>;
    encryption: z.ZodObject<{
        type: z.ZodEnum<["ed25519-aes-gcm"]>;
        publicKey: z.ZodString;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        type: z.ZodEnum<["ed25519-aes-gcm"]>;
        publicKey: z.ZodString;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        type: z.ZodEnum<["ed25519-aes-gcm"]>;
        publicKey: z.ZodString;
    }, z.ZodTypeAny, "passthrough">>;
    address: z.ZodString;
    createdAt: z.ZodNumber;
    updatedAt: z.ZodNumber;
    pubsubTopic: z.ZodOptional<z.ZodString>;
    statsCid: z.ZodEffects<z.ZodString, string, string>;
    protocolVersion: z.ZodString;
    postUpdates: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodEffects<z.ZodString, string, string>>>;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    roles: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough">>>>;
    rules: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    lastPostCid: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    lastCommentCid: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    features: z.ZodOptional<z.ZodObject<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">>>;
    suggested: z.ZodOptional<z.ZodObject<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>>;
    flairs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodArray<z.ZodObject<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">>, "many">>>;
}, z.ZodTypeAny, "passthrough">>]>, z.ZodObject<z.objectUtil.extendShape<Omit<{
    address: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    pubsubTopic: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    title: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    rules: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    features: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">>>>;
    suggested: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>>>;
    flairs: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodArray<z.ZodObject<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">>, "many">>>>;
    settings: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        fetchThumbnailUrls: z.ZodOptional<z.ZodBoolean>;
        fetchThumbnailUrlsProxyUrl: z.ZodOptional<z.ZodString>;
        challenges: z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodObject<{
            path: z.ZodOptional<z.ZodString>;
            name: z.ZodOptional<z.ZodString>;
            options: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">>, "many">>;
            description: z.ZodOptional<z.ZodString>;
        }, "strict", z.ZodTypeAny, {
            path?: string | undefined;
            options?: Record<string, string> | undefined;
            name?: string | undefined;
            description?: string | undefined;
            exclude?: z.objectOutputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">[] | undefined;
        }, {
            path?: string | undefined;
            options?: Record<string, string> | undefined;
            name?: string | undefined;
            description?: string | undefined;
            exclude?: z.objectInputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">[] | undefined;
        }>, {
            path?: string | undefined;
            options?: Record<string, string> | undefined;
            name?: string | undefined;
            description?: string | undefined;
            exclude?: z.objectOutputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">[] | undefined;
        }, {
            path?: string | undefined;
            options?: Record<string, string> | undefined;
            name?: string | undefined;
            description?: string | undefined;
            exclude?: z.objectInputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">[] | undefined;
        }>, "many">>;
    }, "strict", z.ZodTypeAny, {
        challenges?: {
            path?: string | undefined;
            options?: Record<string, string> | undefined;
            name?: string | undefined;
            description?: string | undefined;
            exclude?: z.objectOutputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">[] | undefined;
        }[] | undefined;
        fetchThumbnailUrls?: boolean | undefined;
        fetchThumbnailUrlsProxyUrl?: string | undefined;
    }, {
        challenges?: {
            path?: string | undefined;
            options?: Record<string, string> | undefined;
            name?: string | undefined;
            description?: string | undefined;
            exclude?: z.objectInputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">[] | undefined;
        }[] | undefined;
        fetchThumbnailUrls?: boolean | undefined;
        fetchThumbnailUrlsProxyUrl?: string | undefined;
    }>>>;
    roles: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodObject<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough">>, z.ZodUndefined]>>>>;
}, "address">, {
    signer: z.ZodOptional<z.ZodObject<{
        type: z.ZodEnum<["ed25519"]>;
        privateKey: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: "ed25519";
        privateKey: string;
    }, {
        type: "ed25519";
        privateKey: string;
    }>>;
    roles: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough">>>>;
}>, "strict", z.ZodTypeAny, {
    signer?: {
        type: "ed25519";
        privateKey: string;
    } | undefined;
    description?: string | undefined;
    pubsubTopic?: string | undefined;
    title?: string | undefined;
    roles?: Record<string, z.objectOutputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough">> | undefined;
    rules?: string[] | undefined;
    features?: z.objectOutputType<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    suggested?: z.objectOutputType<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    flairs?: Record<string, z.objectOutputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">[]> | undefined;
    settings?: {
        challenges?: {
            path?: string | undefined;
            options?: Record<string, string> | undefined;
            name?: string | undefined;
            description?: string | undefined;
            exclude?: z.objectOutputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">[] | undefined;
        }[] | undefined;
        fetchThumbnailUrls?: boolean | undefined;
        fetchThumbnailUrlsProxyUrl?: string | undefined;
    } | undefined;
}, {
    signer?: {
        type: "ed25519";
        privateKey: string;
    } | undefined;
    description?: string | undefined;
    pubsubTopic?: string | undefined;
    title?: string | undefined;
    roles?: Record<string, z.objectInputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough">> | undefined;
    rules?: string[] | undefined;
    features?: z.objectInputType<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    suggested?: z.objectInputType<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    flairs?: Record<string, z.objectInputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">[]> | undefined;
    settings?: {
        challenges?: {
            path?: string | undefined;
            options?: Record<string, string> | undefined;
            name?: string | undefined;
            description?: string | undefined;
            exclude?: z.objectInputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">[] | undefined;
        }[] | undefined;
        fetchThumbnailUrls?: boolean | undefined;
        fetchThumbnailUrlsProxyUrl?: string | undefined;
    } | undefined;
}>]>;
export declare const CreateSubplebbitFunctionArgumentsSchema: z.ZodUnion<[z.ZodObject<z.objectUtil.extendShape<Omit<{
    address: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    pubsubTopic: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    title: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    rules: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    features: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">>>>;
    suggested: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>>>;
    flairs: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodArray<z.ZodObject<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">>, "many">>>>;
    settings: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        fetchThumbnailUrls: z.ZodOptional<z.ZodBoolean>;
        fetchThumbnailUrlsProxyUrl: z.ZodOptional<z.ZodString>;
        challenges: z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodObject<{
            path: z.ZodOptional<z.ZodString>;
            name: z.ZodOptional<z.ZodString>;
            options: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">>, "many">>;
            description: z.ZodOptional<z.ZodString>;
        }, "strict", z.ZodTypeAny, {
            path?: string | undefined;
            options?: Record<string, string> | undefined;
            name?: string | undefined;
            description?: string | undefined;
            exclude?: z.objectOutputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">[] | undefined;
        }, {
            path?: string | undefined;
            options?: Record<string, string> | undefined;
            name?: string | undefined;
            description?: string | undefined;
            exclude?: z.objectInputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">[] | undefined;
        }>, {
            path?: string | undefined;
            options?: Record<string, string> | undefined;
            name?: string | undefined;
            description?: string | undefined;
            exclude?: z.objectOutputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">[] | undefined;
        }, {
            path?: string | undefined;
            options?: Record<string, string> | undefined;
            name?: string | undefined;
            description?: string | undefined;
            exclude?: z.objectInputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">[] | undefined;
        }>, "many">>;
    }, "strict", z.ZodTypeAny, {
        challenges?: {
            path?: string | undefined;
            options?: Record<string, string> | undefined;
            name?: string | undefined;
            description?: string | undefined;
            exclude?: z.objectOutputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">[] | undefined;
        }[] | undefined;
        fetchThumbnailUrls?: boolean | undefined;
        fetchThumbnailUrlsProxyUrl?: string | undefined;
    }, {
        challenges?: {
            path?: string | undefined;
            options?: Record<string, string> | undefined;
            name?: string | undefined;
            description?: string | undefined;
            exclude?: z.objectInputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">[] | undefined;
        }[] | undefined;
        fetchThumbnailUrls?: boolean | undefined;
        fetchThumbnailUrlsProxyUrl?: string | undefined;
    }>>>;
    roles: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodObject<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough">>, z.ZodUndefined]>>>>;
}, "address">, {
    signer: z.ZodOptional<z.ZodObject<{
        type: z.ZodEnum<["ed25519"]>;
        privateKey: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: "ed25519";
        privateKey: string;
    }, {
        type: "ed25519";
        privateKey: string;
    }>>;
    roles: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough">>>>;
}>, "strict", z.ZodTypeAny, {
    signer?: {
        type: "ed25519";
        privateKey: string;
    } | undefined;
    description?: string | undefined;
    pubsubTopic?: string | undefined;
    title?: string | undefined;
    roles?: Record<string, z.objectOutputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough">> | undefined;
    rules?: string[] | undefined;
    features?: z.objectOutputType<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    suggested?: z.objectOutputType<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    flairs?: Record<string, z.objectOutputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">[]> | undefined;
    settings?: {
        challenges?: {
            path?: string | undefined;
            options?: Record<string, string> | undefined;
            name?: string | undefined;
            description?: string | undefined;
            exclude?: z.objectOutputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">[] | undefined;
        }[] | undefined;
        fetchThumbnailUrls?: boolean | undefined;
        fetchThumbnailUrlsProxyUrl?: string | undefined;
    } | undefined;
}, {
    signer?: {
        type: "ed25519";
        privateKey: string;
    } | undefined;
    description?: string | undefined;
    pubsubTopic?: string | undefined;
    title?: string | undefined;
    roles?: Record<string, z.objectInputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough">> | undefined;
    rules?: string[] | undefined;
    features?: z.objectInputType<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    suggested?: z.objectInputType<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    flairs?: Record<string, z.objectInputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">[]> | undefined;
    settings?: {
        challenges?: {
            path?: string | undefined;
            options?: Record<string, string> | undefined;
            name?: string | undefined;
            description?: string | undefined;
            exclude?: z.objectInputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">[] | undefined;
        }[] | undefined;
        fetchThumbnailUrls?: boolean | undefined;
        fetchThumbnailUrlsProxyUrl?: string | undefined;
    } | undefined;
}>, z.ZodUnion<[z.ZodObject<z.objectUtil.extendShape<z.objectUtil.extendShape<{
    posts: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        pages: z.ZodRecord<z.ZodUnion<[z.ZodEnum<["hot", "new", "topHour", "topDay", "topWeek", "topMonth", "topYear", "topAll", "controversialHour", "controversialDay", "controversialWeek", "controversialMonth", "controversialYear", "controversialAll", "active"]>, z.ZodString]>, z.ZodType<import("../pages/types.js").PageIpfsManuallyDefined, z.ZodTypeDef, import("../pages/types.js").PageIpfsManuallyDefined>>;
        pageCids: z.ZodRecord<z.ZodUnion<[z.ZodEnum<["hot", "new", "topHour", "topDay", "topWeek", "topMonth", "topYear", "topAll", "controversialHour", "controversialDay", "controversialWeek", "controversialMonth", "controversialYear", "controversialAll", "active"]>, z.ZodString]>, z.ZodEffects<z.ZodString, string, string>>;
    }, "strip", z.ZodTypeAny, {
        pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
        pageCids: Record<string, string>;
    }, {
        pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
        pageCids: Record<string, string>;
    }>>>;
    challenges: z.ZodOptional<z.ZodArray<z.ZodObject<{
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        description: z.ZodOptional<z.ZodString>;
        challenge: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        description: z.ZodOptional<z.ZodString>;
        challenge: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        description: z.ZodOptional<z.ZodString>;
        challenge: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>, "many">>;
    signature: z.ZodOptional<z.ZodObject<{
        type: z.ZodEnum<["ed25519", "eip191"]>;
        signature: z.ZodString;
        publicKey: z.ZodString;
        signedPropertyNames: z.ZodArray<z.ZodString, "atleastone">;
    }, "strip", z.ZodTypeAny, {
        type: "ed25519" | "eip191";
        publicKey: string;
        signature: string;
        signedPropertyNames: [string, ...string[]];
    }, {
        type: "ed25519" | "eip191";
        publicKey: string;
        signature: string;
        signedPropertyNames: [string, ...string[]];
    }>>;
    encryption: z.ZodOptional<z.ZodObject<{
        type: z.ZodEnum<["ed25519-aes-gcm"]>;
        publicKey: z.ZodString;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        type: z.ZodEnum<["ed25519-aes-gcm"]>;
        publicKey: z.ZodString;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        type: z.ZodEnum<["ed25519-aes-gcm"]>;
        publicKey: z.ZodString;
    }, z.ZodTypeAny, "passthrough">>>;
    address: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodOptional<z.ZodNumber>;
    updatedAt: z.ZodOptional<z.ZodNumber>;
    pubsubTopic: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    statsCid: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    protocolVersion: z.ZodOptional<z.ZodString>;
    postUpdates: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodEffects<z.ZodString, string, string>>>>;
    title: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    roles: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough">>>>>;
    rules: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    lastPostCid: z.ZodOptional<z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>>;
    lastCommentCid: z.ZodOptional<z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>>;
    features: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">>>>;
    suggested: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>>>;
    flairs: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodArray<z.ZodObject<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">>, "many">>>>;
}, Pick<{
    posts: z.ZodOptional<z.ZodObject<{
        pages: z.ZodRecord<z.ZodUnion<[z.ZodEnum<["hot", "new", "topHour", "topDay", "topWeek", "topMonth", "topYear", "topAll", "controversialHour", "controversialDay", "controversialWeek", "controversialMonth", "controversialYear", "controversialAll", "active"]>, z.ZodString]>, z.ZodType<import("../pages/types.js").PageIpfsManuallyDefined, z.ZodTypeDef, import("../pages/types.js").PageIpfsManuallyDefined>>;
        pageCids: z.ZodRecord<z.ZodUnion<[z.ZodEnum<["hot", "new", "topHour", "topDay", "topWeek", "topMonth", "topYear", "topAll", "controversialHour", "controversialDay", "controversialWeek", "controversialMonth", "controversialYear", "controversialAll", "active"]>, z.ZodString]>, z.ZodEffects<z.ZodString, string, string>>;
    }, "strip", z.ZodTypeAny, {
        pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
        pageCids: Record<string, string>;
    }, {
        pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
        pageCids: Record<string, string>;
    }>>;
    challenges: z.ZodArray<z.ZodObject<{
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        description: z.ZodOptional<z.ZodString>;
        challenge: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        description: z.ZodOptional<z.ZodString>;
        challenge: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        description: z.ZodOptional<z.ZodString>;
        challenge: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>, "many">;
    signature: z.ZodObject<{
        type: z.ZodEnum<["ed25519", "eip191"]>;
        signature: z.ZodString;
        publicKey: z.ZodString;
        signedPropertyNames: z.ZodArray<z.ZodString, "atleastone">;
    }, "strip", z.ZodTypeAny, {
        type: "ed25519" | "eip191";
        publicKey: string;
        signature: string;
        signedPropertyNames: [string, ...string[]];
    }, {
        type: "ed25519" | "eip191";
        publicKey: string;
        signature: string;
        signedPropertyNames: [string, ...string[]];
    }>;
    encryption: z.ZodObject<{
        type: z.ZodEnum<["ed25519-aes-gcm"]>;
        publicKey: z.ZodString;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        type: z.ZodEnum<["ed25519-aes-gcm"]>;
        publicKey: z.ZodString;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        type: z.ZodEnum<["ed25519-aes-gcm"]>;
        publicKey: z.ZodString;
    }, z.ZodTypeAny, "passthrough">>;
    address: z.ZodString;
    createdAt: z.ZodNumber;
    updatedAt: z.ZodNumber;
    pubsubTopic: z.ZodOptional<z.ZodString>;
    statsCid: z.ZodEffects<z.ZodString, string, string>;
    protocolVersion: z.ZodString;
    postUpdates: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodEffects<z.ZodString, string, string>>>;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    roles: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough">>>>;
    rules: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    lastPostCid: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    lastCommentCid: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    features: z.ZodOptional<z.ZodObject<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">>>;
    suggested: z.ZodOptional<z.ZodObject<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>>;
    flairs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodArray<z.ZodObject<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">>, "many">>>;
}, "address">>, {
    posts: z.ZodUnion<[z.ZodOptional<z.ZodObject<{
        pages: z.ZodRecord<z.ZodUnion<[z.ZodEnum<["hot", "new", "topHour", "topDay", "topWeek", "topMonth", "topYear", "topAll", "controversialHour", "controversialDay", "controversialWeek", "controversialMonth", "controversialYear", "controversialAll", "active"]>, z.ZodString]>, z.ZodType<import("../pages/types.js").PageIpfsManuallyDefined, z.ZodTypeDef, import("../pages/types.js").PageIpfsManuallyDefined>>;
        pageCids: z.ZodRecord<z.ZodUnion<[z.ZodEnum<["hot", "new", "topHour", "topDay", "topWeek", "topMonth", "topYear", "topAll", "controversialHour", "controversialDay", "controversialWeek", "controversialMonth", "controversialYear", "controversialAll", "active"]>, z.ZodString]>, z.ZodEffects<z.ZodString, string, string>>;
    }, "strip", z.ZodTypeAny, {
        pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
        pageCids: Record<string, string>;
    }, {
        pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
        pageCids: Record<string, string>;
    }>>, z.ZodObject<Pick<{
        pages: z.ZodRecord<z.ZodUnion<[z.ZodEnum<["hot", "new", "topHour", "topDay", "topWeek", "topMonth", "topYear", "topAll", "controversialHour", "controversialDay", "controversialWeek", "controversialMonth", "controversialYear", "controversialAll", "active"]>, z.ZodString]>, z.ZodType<import("../pages/types.js").PageIpfsManuallyDefined, z.ZodTypeDef, import("../pages/types.js").PageIpfsManuallyDefined>>;
        pageCids: z.ZodRecord<z.ZodUnion<[z.ZodEnum<["hot", "new", "topHour", "topDay", "topWeek", "topMonth", "topYear", "topAll", "controversialHour", "controversialDay", "controversialWeek", "controversialMonth", "controversialYear", "controversialAll", "active"]>, z.ZodString]>, z.ZodEffects<z.ZodString, string, string>>;
    }, "pageCids">, "strip", z.ZodTypeAny, {
        pageCids: Record<string, string>;
    }, {
        pageCids: Record<string, string>;
    }>]>;
    updateCid: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
}>, "strict", z.ZodTypeAny, {
    address: string;
    signature?: {
        type: "ed25519" | "eip191";
        publicKey: string;
        signature: string;
        signedPropertyNames: [string, ...string[]];
    } | undefined;
    protocolVersion?: string | undefined;
    lastCommentCid?: string | undefined;
    description?: string | undefined;
    pubsubTopic?: string | undefined;
    title?: string | undefined;
    challenges?: z.objectOutputType<{
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        description: z.ZodOptional<z.ZodString>;
        challenge: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">[] | undefined;
    updatedAt?: number | undefined;
    posts?: {
        pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
        pageCids: Record<string, string>;
    } | {
        pageCids: Record<string, string>;
    } | undefined;
    encryption?: z.objectOutputType<{
        type: z.ZodEnum<["ed25519-aes-gcm"]>;
        publicKey: z.ZodString;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    createdAt?: number | undefined;
    statsCid?: string | undefined;
    postUpdates?: Record<string, string> | undefined;
    roles?: Record<string, z.objectOutputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough">> | undefined;
    rules?: string[] | undefined;
    lastPostCid?: string | undefined;
    features?: z.objectOutputType<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    suggested?: z.objectOutputType<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    flairs?: Record<string, z.objectOutputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">[]> | undefined;
    updateCid?: string | undefined;
}, {
    address: string;
    signature?: {
        type: "ed25519" | "eip191";
        publicKey: string;
        signature: string;
        signedPropertyNames: [string, ...string[]];
    } | undefined;
    protocolVersion?: string | undefined;
    lastCommentCid?: string | undefined;
    description?: string | undefined;
    pubsubTopic?: string | undefined;
    title?: string | undefined;
    challenges?: z.objectInputType<{
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        description: z.ZodOptional<z.ZodString>;
        challenge: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">[] | undefined;
    updatedAt?: number | undefined;
    posts?: {
        pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
        pageCids: Record<string, string>;
    } | {
        pageCids: Record<string, string>;
    } | undefined;
    encryption?: z.objectInputType<{
        type: z.ZodEnum<["ed25519-aes-gcm"]>;
        publicKey: z.ZodString;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    createdAt?: number | undefined;
    statsCid?: string | undefined;
    postUpdates?: Record<string, string> | undefined;
    roles?: Record<string, z.objectInputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough">> | undefined;
    rules?: string[] | undefined;
    lastPostCid?: string | undefined;
    features?: z.objectInputType<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    suggested?: z.objectInputType<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    flairs?: Record<string, z.objectInputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">[]> | undefined;
    updateCid?: string | undefined;
}>, z.ZodObject<{
    posts: z.ZodOptional<z.ZodObject<{
        pages: z.ZodRecord<z.ZodUnion<[z.ZodEnum<["hot", "new", "topHour", "topDay", "topWeek", "topMonth", "topYear", "topAll", "controversialHour", "controversialDay", "controversialWeek", "controversialMonth", "controversialYear", "controversialAll", "active"]>, z.ZodString]>, z.ZodType<import("../pages/types.js").PageIpfsManuallyDefined, z.ZodTypeDef, import("../pages/types.js").PageIpfsManuallyDefined>>;
        pageCids: z.ZodRecord<z.ZodUnion<[z.ZodEnum<["hot", "new", "topHour", "topDay", "topWeek", "topMonth", "topYear", "topAll", "controversialHour", "controversialDay", "controversialWeek", "controversialMonth", "controversialYear", "controversialAll", "active"]>, z.ZodString]>, z.ZodEffects<z.ZodString, string, string>>;
    }, "strip", z.ZodTypeAny, {
        pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
        pageCids: Record<string, string>;
    }, {
        pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
        pageCids: Record<string, string>;
    }>>;
    challenges: z.ZodArray<z.ZodObject<{
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        description: z.ZodOptional<z.ZodString>;
        challenge: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        description: z.ZodOptional<z.ZodString>;
        challenge: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        description: z.ZodOptional<z.ZodString>;
        challenge: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>, "many">;
    signature: z.ZodObject<{
        type: z.ZodEnum<["ed25519", "eip191"]>;
        signature: z.ZodString;
        publicKey: z.ZodString;
        signedPropertyNames: z.ZodArray<z.ZodString, "atleastone">;
    }, "strip", z.ZodTypeAny, {
        type: "ed25519" | "eip191";
        publicKey: string;
        signature: string;
        signedPropertyNames: [string, ...string[]];
    }, {
        type: "ed25519" | "eip191";
        publicKey: string;
        signature: string;
        signedPropertyNames: [string, ...string[]];
    }>;
    encryption: z.ZodObject<{
        type: z.ZodEnum<["ed25519-aes-gcm"]>;
        publicKey: z.ZodString;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        type: z.ZodEnum<["ed25519-aes-gcm"]>;
        publicKey: z.ZodString;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        type: z.ZodEnum<["ed25519-aes-gcm"]>;
        publicKey: z.ZodString;
    }, z.ZodTypeAny, "passthrough">>;
    address: z.ZodString;
    createdAt: z.ZodNumber;
    updatedAt: z.ZodNumber;
    pubsubTopic: z.ZodOptional<z.ZodString>;
    statsCid: z.ZodEffects<z.ZodString, string, string>;
    protocolVersion: z.ZodString;
    postUpdates: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodEffects<z.ZodString, string, string>>>;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    roles: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough">>>>;
    rules: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    lastPostCid: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    lastCommentCid: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    features: z.ZodOptional<z.ZodObject<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">>>;
    suggested: z.ZodOptional<z.ZodObject<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>>;
    flairs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodArray<z.ZodObject<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">>, "many">>>;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    posts: z.ZodOptional<z.ZodObject<{
        pages: z.ZodRecord<z.ZodUnion<[z.ZodEnum<["hot", "new", "topHour", "topDay", "topWeek", "topMonth", "topYear", "topAll", "controversialHour", "controversialDay", "controversialWeek", "controversialMonth", "controversialYear", "controversialAll", "active"]>, z.ZodString]>, z.ZodType<import("../pages/types.js").PageIpfsManuallyDefined, z.ZodTypeDef, import("../pages/types.js").PageIpfsManuallyDefined>>;
        pageCids: z.ZodRecord<z.ZodUnion<[z.ZodEnum<["hot", "new", "topHour", "topDay", "topWeek", "topMonth", "topYear", "topAll", "controversialHour", "controversialDay", "controversialWeek", "controversialMonth", "controversialYear", "controversialAll", "active"]>, z.ZodString]>, z.ZodEffects<z.ZodString, string, string>>;
    }, "strip", z.ZodTypeAny, {
        pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
        pageCids: Record<string, string>;
    }, {
        pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
        pageCids: Record<string, string>;
    }>>;
    challenges: z.ZodArray<z.ZodObject<{
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        description: z.ZodOptional<z.ZodString>;
        challenge: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        description: z.ZodOptional<z.ZodString>;
        challenge: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        description: z.ZodOptional<z.ZodString>;
        challenge: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>, "many">;
    signature: z.ZodObject<{
        type: z.ZodEnum<["ed25519", "eip191"]>;
        signature: z.ZodString;
        publicKey: z.ZodString;
        signedPropertyNames: z.ZodArray<z.ZodString, "atleastone">;
    }, "strip", z.ZodTypeAny, {
        type: "ed25519" | "eip191";
        publicKey: string;
        signature: string;
        signedPropertyNames: [string, ...string[]];
    }, {
        type: "ed25519" | "eip191";
        publicKey: string;
        signature: string;
        signedPropertyNames: [string, ...string[]];
    }>;
    encryption: z.ZodObject<{
        type: z.ZodEnum<["ed25519-aes-gcm"]>;
        publicKey: z.ZodString;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        type: z.ZodEnum<["ed25519-aes-gcm"]>;
        publicKey: z.ZodString;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        type: z.ZodEnum<["ed25519-aes-gcm"]>;
        publicKey: z.ZodString;
    }, z.ZodTypeAny, "passthrough">>;
    address: z.ZodString;
    createdAt: z.ZodNumber;
    updatedAt: z.ZodNumber;
    pubsubTopic: z.ZodOptional<z.ZodString>;
    statsCid: z.ZodEffects<z.ZodString, string, string>;
    protocolVersion: z.ZodString;
    postUpdates: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodEffects<z.ZodString, string, string>>>;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    roles: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough">>>>;
    rules: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    lastPostCid: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    lastCommentCid: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    features: z.ZodOptional<z.ZodObject<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">>>;
    suggested: z.ZodOptional<z.ZodObject<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>>;
    flairs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodArray<z.ZodObject<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">>, "many">>>;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    posts: z.ZodOptional<z.ZodObject<{
        pages: z.ZodRecord<z.ZodUnion<[z.ZodEnum<["hot", "new", "topHour", "topDay", "topWeek", "topMonth", "topYear", "topAll", "controversialHour", "controversialDay", "controversialWeek", "controversialMonth", "controversialYear", "controversialAll", "active"]>, z.ZodString]>, z.ZodType<import("../pages/types.js").PageIpfsManuallyDefined, z.ZodTypeDef, import("../pages/types.js").PageIpfsManuallyDefined>>;
        pageCids: z.ZodRecord<z.ZodUnion<[z.ZodEnum<["hot", "new", "topHour", "topDay", "topWeek", "topMonth", "topYear", "topAll", "controversialHour", "controversialDay", "controversialWeek", "controversialMonth", "controversialYear", "controversialAll", "active"]>, z.ZodString]>, z.ZodEffects<z.ZodString, string, string>>;
    }, "strip", z.ZodTypeAny, {
        pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
        pageCids: Record<string, string>;
    }, {
        pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
        pageCids: Record<string, string>;
    }>>;
    challenges: z.ZodArray<z.ZodObject<{
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        description: z.ZodOptional<z.ZodString>;
        challenge: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        description: z.ZodOptional<z.ZodString>;
        challenge: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "many">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            post: z.ZodOptional<z.ZodBoolean>;
            reply: z.ZodOptional<z.ZodBoolean>;
            vote: z.ZodOptional<z.ZodBoolean>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        description: z.ZodOptional<z.ZodString>;
        challenge: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>, "many">;
    signature: z.ZodObject<{
        type: z.ZodEnum<["ed25519", "eip191"]>;
        signature: z.ZodString;
        publicKey: z.ZodString;
        signedPropertyNames: z.ZodArray<z.ZodString, "atleastone">;
    }, "strip", z.ZodTypeAny, {
        type: "ed25519" | "eip191";
        publicKey: string;
        signature: string;
        signedPropertyNames: [string, ...string[]];
    }, {
        type: "ed25519" | "eip191";
        publicKey: string;
        signature: string;
        signedPropertyNames: [string, ...string[]];
    }>;
    encryption: z.ZodObject<{
        type: z.ZodEnum<["ed25519-aes-gcm"]>;
        publicKey: z.ZodString;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        type: z.ZodEnum<["ed25519-aes-gcm"]>;
        publicKey: z.ZodString;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        type: z.ZodEnum<["ed25519-aes-gcm"]>;
        publicKey: z.ZodString;
    }, z.ZodTypeAny, "passthrough">>;
    address: z.ZodString;
    createdAt: z.ZodNumber;
    updatedAt: z.ZodNumber;
    pubsubTopic: z.ZodOptional<z.ZodString>;
    statsCid: z.ZodEffects<z.ZodString, string, string>;
    protocolVersion: z.ZodString;
    postUpdates: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodEffects<z.ZodString, string, string>>>;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    roles: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        role: z.ZodEnum<["owner", "admin", "moderator"]>;
    }, z.ZodTypeAny, "passthrough">>>>;
    rules: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    lastPostCid: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    lastCommentCid: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    features: z.ZodOptional<z.ZodObject<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        noVideos: z.ZodOptional<z.ZodBoolean>;
        noSpoilers: z.ZodOptional<z.ZodBoolean>;
        noImages: z.ZodOptional<z.ZodBoolean>;
        noVideoReplies: z.ZodOptional<z.ZodBoolean>;
        noSpoilerReplies: z.ZodOptional<z.ZodBoolean>;
        noImageReplies: z.ZodOptional<z.ZodBoolean>;
        noPolls: z.ZodOptional<z.ZodBoolean>;
        noCrossposts: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
        noAuthors: z.ZodOptional<z.ZodBoolean>;
        anonymousAuthors: z.ZodOptional<z.ZodBoolean>;
        noNestedReplies: z.ZodOptional<z.ZodBoolean>;
        safeForWork: z.ZodOptional<z.ZodBoolean>;
        authorFlairs: z.ZodOptional<z.ZodBoolean>;
        requireAuthorFlairs: z.ZodOptional<z.ZodBoolean>;
        postFlairs: z.ZodOptional<z.ZodBoolean>;
        requirePostFlairs: z.ZodOptional<z.ZodBoolean>;
        noMarkdownImages: z.ZodOptional<z.ZodBoolean>;
        noMarkdownVideos: z.ZodOptional<z.ZodBoolean>;
        markdownImageReplies: z.ZodOptional<z.ZodBoolean>;
        markdownVideoReplies: z.ZodOptional<z.ZodBoolean>;
        requirePostLink: z.ZodOptional<z.ZodBoolean>;
        requirePostLinkIsMedia: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">>>;
    suggested: z.ZodOptional<z.ZodObject<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
        backgroundUrl: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>>;
    flairs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodArray<z.ZodObject<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">>, "many">>>;
}, z.ZodTypeAny, "passthrough">>]>]>;
export declare const ListOfSubplebbitsSchema: z.ZodArray<z.ZodString, "many">;
export declare const SubplebbitIpfsReservedFields: string[];