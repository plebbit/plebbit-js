import { LRUCache } from "lru-cache";
import type { ChainTicker, LRUStorageConstructor } from "./types.js";
import { PublicClient as ViemClient } from "viem";
import { Plebbit } from "./plebbit.js";
export declare enum STORAGE_KEYS {
    INTERNAL_SUBPLEBBIT = 0,// InternalSubplebbitType
    PERSISTENT_DELETED_SUBPLEBBITS = 1,// These are basically sub db files that we're unable to remove for some reason on windows
    COMMENTS_WITH_INVALID_SCHEMA = 2
}
export declare const postTimestampConfig: Omit<LRUStorageConstructor, "plebbit">;
export declare const commentPostUpdatesParentsPathConfig: Omit<LRUStorageConstructor, "plebbit">;
export declare const subplebbitForPublishingCache: LRUCache<string, Pick<{
    address: string;
    signature: {
        type: "ed25519" | "eip191";
        publicKey: string;
        signature: string;
        signedPropertyNames: [string, ...string[]];
    };
    protocolVersion: string;
    challenges: import("zod").objectOutputType<{
        exclude: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodObject<{
            subplebbit: import("zod").ZodOptional<import("zod").ZodObject<{
                addresses: import("zod").ZodArray<import("zod").ZodString, "many">;
                maxCommentCids: import("zod").ZodNumber;
                postScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                replyScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                firstCommentTimestamp: import("zod").ZodOptional<import("zod").ZodNumber>;
            }, "strict", import("zod").ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: import("zod").ZodOptional<import("zod").ZodNumber>;
            replyScore: import("zod").ZodOptional<import("zod").ZodNumber>;
            firstCommentTimestamp: import("zod").ZodOptional<import("zod").ZodNumber>;
            challenges: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodNumber, "many">>;
            post: import("zod").ZodOptional<import("zod").ZodBoolean>;
            reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
            vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
            role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
            rateLimit: import("zod").ZodOptional<import("zod").ZodNumber>;
            rateLimitChallengeSuccess: import("zod").ZodOptional<import("zod").ZodBoolean>;
        }, "passthrough", import("zod").ZodTypeAny, import("zod").objectOutputType<{
            subplebbit: import("zod").ZodOptional<import("zod").ZodObject<{
                addresses: import("zod").ZodArray<import("zod").ZodString, "many">;
                maxCommentCids: import("zod").ZodNumber;
                postScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                replyScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                firstCommentTimestamp: import("zod").ZodOptional<import("zod").ZodNumber>;
            }, "strict", import("zod").ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: import("zod").ZodOptional<import("zod").ZodNumber>;
            replyScore: import("zod").ZodOptional<import("zod").ZodNumber>;
            firstCommentTimestamp: import("zod").ZodOptional<import("zod").ZodNumber>;
            challenges: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodNumber, "many">>;
            post: import("zod").ZodOptional<import("zod").ZodBoolean>;
            reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
            vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
            role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
            rateLimit: import("zod").ZodOptional<import("zod").ZodNumber>;
            rateLimitChallengeSuccess: import("zod").ZodOptional<import("zod").ZodBoolean>;
        }, import("zod").ZodTypeAny, "passthrough">, import("zod").objectInputType<{
            subplebbit: import("zod").ZodOptional<import("zod").ZodObject<{
                addresses: import("zod").ZodArray<import("zod").ZodString, "many">;
                maxCommentCids: import("zod").ZodNumber;
                postScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                replyScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                firstCommentTimestamp: import("zod").ZodOptional<import("zod").ZodNumber>;
            }, "strict", import("zod").ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: import("zod").ZodOptional<import("zod").ZodNumber>;
            replyScore: import("zod").ZodOptional<import("zod").ZodNumber>;
            firstCommentTimestamp: import("zod").ZodOptional<import("zod").ZodNumber>;
            challenges: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodNumber, "many">>;
            post: import("zod").ZodOptional<import("zod").ZodBoolean>;
            reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
            vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
            role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
            rateLimit: import("zod").ZodOptional<import("zod").ZodNumber>;
            rateLimitChallengeSuccess: import("zod").ZodOptional<import("zod").ZodBoolean>;
        }, import("zod").ZodTypeAny, "passthrough">>, "many">>;
        description: import("zod").ZodOptional<import("zod").ZodString>;
        challenge: import("zod").ZodOptional<import("zod").ZodString>;
        type: import("zod").ZodOptional<import("zod").ZodString>;
    }, import("zod").ZodTypeAny, "passthrough">[];
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
        pages: Record<string, import("./pages/types.js").PageIpfsManuallyDefined>;
        pageCids: Record<string, string>;
    } | undefined;
    postUpdates?: Record<string, string> | undefined;
    roles?: Record<string, import("zod").objectOutputType<{
        role: import("zod").ZodEnum<["owner", "admin", "moderator"]>;
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
        noUpvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
        noDownvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
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
}, "address" | "pubsubTopic" | "encryption">, unknown>;
export declare const pageCidToSortTypesCache: LRUCache<string, string[], unknown>;
export declare const domainResolverPromiseCache: LRUCache<string, Promise<string | null>, unknown>;
export declare const gatewayFetchPromiseCache: LRUCache<string, Promise<{
    resText: string;
    res: Response;
}>, unknown>;
export declare const p2pIpnsPromiseCache: LRUCache<string, Promise<string | undefined>, unknown>;
export declare const p2pCidPromiseCache: LRUCache<string, Promise<string | undefined>, unknown>;
export declare const subplebbitVerificationCache: LRUCache<string, boolean, unknown>;
export declare const pageVerificationCache: LRUCache<string, boolean, unknown>;
export declare const commentUpdateVerificationCache: LRUCache<string, boolean, unknown>;
export declare const _viemClients: Record<string, ViemClient>;
export declare const getViemClient: (plebbit: Plebbit, chainTicker: ChainTicker, chainProviderUrl: string) => Promise<ViemClient>;
