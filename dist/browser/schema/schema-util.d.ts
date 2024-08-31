import type { PageIpfs } from "../pages/types.js";
import type { CommentIpfsType, CommentUpdateType } from "../publications/comment/types.js";
import type { RpcRemoteSubplebbitUpdateEventResultType, SubplebbitIpfsType } from "../subplebbit/types.js";
import type { DecryptedChallenge, DecryptedChallengeVerification } from "../pubsub-messages/types.js";
export declare function parseJsonWithPlebbitErrorIfFails(x: string): any;
export declare function parseSubplebbitIpfsSchemaPassthroughWithPlebbitErrorIfItFails(subIpfs: any): SubplebbitIpfsType;
export declare function parseCommentIpfsSchemaWithPlebbitErrorIfItFails(commentIpfsJson: any): CommentIpfsType;
export declare function parseCommentUpdateSchemaWithPlebbitErrorIfItFails(commentUpdateJson: any): CommentUpdateType;
export declare function parsePageIpfsSchemaWithPlebbitErrorIfItFails(pageIpfsJson: any): PageIpfs;
export declare function parseDecryptedChallengeWithPlebbitErrorIfItFails(decryptedChallengeJson: any): DecryptedChallenge;
export declare function parseDecryptedChallengeVerification(decryptedChallengeVerificationJson: any): DecryptedChallengeVerification;
export declare function parseRpcRemoteSubplebbitUpdateEventWithPlebbitErrorIfItFails(rpcRemoteSubplebbit: RpcRemoteSubplebbitUpdateEventResultType): {
    subplebbit: {
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
            pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
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
    } & {
        [k: string]: unknown;
    };
    updateCid: string;
};
export declare function parseCidStringSchemaWithPlebbitErrorIfItFails(cidString: any): string;
export declare function parseRpcCommentUpdateEventWithPlebbitErrorIfItFails(updateResult: any): CommentIpfsType | CommentUpdateType;
