import { PageIpfsSchema } from "../pages/schema.js";
import type { PageIpfs } from "../pages/types.js";
import { CommentChallengeRequestToEncryptSchema, CommentIpfsSchema, CommentPubsubMessagePublicationSchema, CommentUpdateSchema, CreateCommentOptionsSchema } from "../publications/comment/schema.js";
import type { CommentChallengeRequestToEncryptType, CommentIpfsType, CommentUpdateType } from "../publications/comment/types.js";
import { DecryptedChallengeAnswerSchema, DecryptedChallengeSchema, DecryptedChallengeVerificationSchema } from "../pubsub-messages/schema.js";
import { CreateNewLocalSubplebbitUserOptionsSchema, CreateRemoteSubplebbitFunctionArgumentSchema, CreateRpcSubplebbitFunctionArgumentSchema, CreateSubplebbitFunctionArgumentsSchema, SubplebbitEditOptionsSchema, SubplebbitIpfsSchema } from "../subplebbit/schema.js";
import type { CreateNewLocalSubplebbitUserOptions, RpcRemoteSubplebbitUpdateEventResultType, SubplebbitEditOptions, SubplebbitIpfsType } from "../subplebbit/types.js";
import type { DecryptedChallenge, DecryptedChallengeAnswer, DecryptedChallengeVerification } from "../pubsub-messages/types.js";
import { CidStringSchema } from "./schema.js";
import { RpcCommentUpdateResultSchema } from "../clients/rpc-client/schema.js";
import { CreatePlebbitWsServerOptionsSchema, SetNewSettingsPlebbitWsServerSchema } from "../rpc/src/schema.js";
import type { CreatePlebbitWsServerOptions } from "../rpc/src/types.js";
import type { CommentModerationChallengeRequestToEncrypt } from "../publications/comment-moderation/types.js";
import { CommentModerationChallengeRequestToEncryptSchema, CommentModerationPubsubMessagePublicationSchema, CreateCommentModerationOptionsSchema } from "../publications/comment-moderation/schema.js";
import type { VoteChallengeRequestToEncryptType } from "../publications/vote/types.js";
import { CreateVoteUserOptionsSchema, VoteChallengeRequestToEncryptSchema, VotePubsubMessagePublicationSchema } from "../publications/vote/schema.js";
import type { CommentEditChallengeRequestToEncryptType } from "../publications/comment-edit/types.js";
import { CommentEditChallengeRequestToEncryptSchema, CommentEditPubsubMessagePublicationSchema, CreateCommentEditOptionsSchema } from "../publications/comment-edit/schema.js";
import { z } from "zod";
import type { CreateSubplebbitEditPublicationOptions, SubplebbitEditChallengeRequestToEncryptType, SubplebbitEditPubsubMessagePublication } from "../publications/subplebbit-edit/types.js";
import { SubplebbitEditPublicationChallengeRequestToEncryptSchema } from "../publications/subplebbit-edit/schema.js";
export declare function parseJsonWithPlebbitErrorIfFails(x: string): any;
export declare function parseSubplebbitIpfsSchemaPassthroughWithPlebbitErrorIfItFails(subIpfs: z.infer<typeof SubplebbitIpfsSchema>): SubplebbitIpfsType;
export declare function parseCommentIpfsSchemaWithPlebbitErrorIfItFails(commentIpfsJson: z.infer<typeof CommentIpfsSchema>): CommentIpfsType;
export declare function parseCommentUpdateSchemaWithPlebbitErrorIfItFails(commentUpdateJson: z.infer<typeof CommentUpdateSchema>): CommentUpdateType;
export declare function parsePageIpfsSchemaWithPlebbitErrorIfItFails(pageIpfsJson: z.infer<typeof PageIpfsSchema>): PageIpfs;
export declare function parseDecryptedChallengeWithPlebbitErrorIfItFails(decryptedChallengeJson: z.infer<typeof DecryptedChallengeSchema>): DecryptedChallenge;
export declare function parseDecryptedChallengeVerification(decryptedChallengeVerificationJson: z.infer<typeof DecryptedChallengeVerificationSchema>): DecryptedChallengeVerification;
export declare function parseRpcRemoteSubplebbitUpdateEventWithPlebbitErrorIfItFails(rpcRemoteSubplebbit: RpcRemoteSubplebbitUpdateEventResultType): {
    subplebbit: {
        address: string;
        signature: {
            type: string;
            publicKey: string;
            signature: string;
            signedPropertyNames: string[];
        };
        protocolVersion: string;
        updatedAt: number;
        challenges: z.objectOutputType<{
            exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "atleastone">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: [string, ...string[]];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: [string, ...string[]];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
                publicationType: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, z.ZodTypeAny, "passthrough">>, z.objectOutputType<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "atleastone">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: [string, ...string[]];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: [string, ...string[]];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
                publicationType: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, z.ZodTypeAny, "passthrough">>, z.objectOutputType<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "atleastone">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: [string, ...string[]];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: [string, ...string[]];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
                publicationType: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, z.ZodTypeAny, "passthrough">>, z.objectOutputType<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, z.ZodTypeAny, "passthrough">>, "atleastone">>;
            description: z.ZodOptional<z.ZodString>;
            challenge: z.ZodOptional<z.ZodString>;
            type: z.ZodString;
            caseInsensitive: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">[];
        encryption: {
            type: "ed25519-aes-gcm";
            publicKey: string;
        } & {
            [k: string]: unknown;
        };
        createdAt: number;
        statsCid: string;
        lastCommentCid?: string | undefined;
        title?: string | undefined;
        posts?: {
            pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
            pageCids?: Record<string, string> | undefined;
        } | undefined;
        description?: string | undefined;
        pubsubTopic?: string | undefined;
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
            noPostUpvotes: z.ZodOptional<z.ZodBoolean>;
            noReplyUpvotes: z.ZodOptional<z.ZodBoolean>;
            noPostDownvotes: z.ZodOptional<z.ZodBoolean>;
            noReplyDownvotes: z.ZodOptional<z.ZodBoolean>;
            noUpvotes: z.ZodOptional<z.ZodBoolean>;
            noDownvotes: z.ZodOptional<z.ZodBoolean>;
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
};
export declare function parseCidStringSchemaWithPlebbitErrorIfItFails(cidString: z.infer<typeof CidStringSchema>): string;
export declare function parseRpcCommentUpdateEventWithPlebbitErrorIfItFails(updateResult: z.infer<typeof RpcCommentUpdateResultSchema>): CommentIpfsType | CommentUpdateType;
export declare function parseSubplebbitEditPubsubMessagePublicationSchemaWithPlebbitErrorIfItFails(args: SubplebbitEditPubsubMessagePublication): {
    timestamp: number;
    signature: {
        type: string;
        publicKey: string;
        signature: string;
        signedPropertyNames: string[];
    };
    author: {
        address: string;
        previousCommentCid?: string | undefined;
        displayName?: string | undefined;
        wallets?: Record<string, {
            address: string;
            timestamp: number;
            signature: {
                type: string;
                signature: string;
            };
        }> | undefined;
        avatar?: z.objectOutputType<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: string;
                signature: string;
            }, {
                type: string;
                signature: string;
            }>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
        flair?: z.objectOutputType<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
    } & {
        [k: string]: unknown;
    };
    subplebbitAddress: string;
    protocolVersion: string;
    subplebbitEdit: {
        address?: string | undefined;
        title?: string | undefined;
        description?: string | undefined;
        pubsubTopic?: string | undefined;
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
            noPostUpvotes: z.ZodOptional<z.ZodBoolean>;
            noReplyUpvotes: z.ZodOptional<z.ZodBoolean>;
            noPostDownvotes: z.ZodOptional<z.ZodBoolean>;
            noReplyDownvotes: z.ZodOptional<z.ZodBoolean>;
            noUpvotes: z.ZodOptional<z.ZodBoolean>;
            noDownvotes: z.ZodOptional<z.ZodBoolean>;
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
                exclude?: [z.objectOutputType<{
                    subplebbit: z.ZodOptional<z.ZodObject<{
                        addresses: z.ZodArray<z.ZodString, "atleastone">;
                        maxCommentCids: z.ZodNumber;
                        postScore: z.ZodOptional<z.ZodNumber>;
                        replyScore: z.ZodOptional<z.ZodNumber>;
                        firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                    }, "strict", z.ZodTypeAny, {
                        addresses: [string, ...string[]];
                        maxCommentCids: number;
                        postScore?: number | undefined;
                        replyScore?: number | undefined;
                        firstCommentTimestamp?: number | undefined;
                    }, {
                        addresses: [string, ...string[]];
                        maxCommentCids: number;
                        postScore?: number | undefined;
                        replyScore?: number | undefined;
                        firstCommentTimestamp?: number | undefined;
                    }>>;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                    challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                    role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                    address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                    rateLimit: z.ZodOptional<z.ZodNumber>;
                    rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
                    publicationType: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                        post: z.ZodOptional<z.ZodBoolean>;
                        reply: z.ZodOptional<z.ZodBoolean>;
                        vote: z.ZodOptional<z.ZodBoolean>;
                        commentEdit: z.ZodOptional<z.ZodBoolean>;
                        commentModeration: z.ZodOptional<z.ZodBoolean>;
                    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                        post: z.ZodOptional<z.ZodBoolean>;
                        reply: z.ZodOptional<z.ZodBoolean>;
                        vote: z.ZodOptional<z.ZodBoolean>;
                        commentEdit: z.ZodOptional<z.ZodBoolean>;
                        commentModeration: z.ZodOptional<z.ZodBoolean>;
                    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                        post: z.ZodOptional<z.ZodBoolean>;
                        reply: z.ZodOptional<z.ZodBoolean>;
                        vote: z.ZodOptional<z.ZodBoolean>;
                        commentEdit: z.ZodOptional<z.ZodBoolean>;
                        commentModeration: z.ZodOptional<z.ZodBoolean>;
                    }, z.ZodTypeAny, "passthrough">>, z.objectOutputType<{
                        post: z.ZodOptional<z.ZodBoolean>;
                        reply: z.ZodOptional<z.ZodBoolean>;
                        vote: z.ZodOptional<z.ZodBoolean>;
                        commentEdit: z.ZodOptional<z.ZodBoolean>;
                        commentModeration: z.ZodOptional<z.ZodBoolean>;
                    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                        post: z.ZodOptional<z.ZodBoolean>;
                        reply: z.ZodOptional<z.ZodBoolean>;
                        vote: z.ZodOptional<z.ZodBoolean>;
                        commentEdit: z.ZodOptional<z.ZodBoolean>;
                        commentModeration: z.ZodOptional<z.ZodBoolean>;
                    }, z.ZodTypeAny, "passthrough">>>;
                }, z.ZodTypeAny, "passthrough">, ...z.objectOutputType<{
                    subplebbit: z.ZodOptional<z.ZodObject<{
                        addresses: z.ZodArray<z.ZodString, "atleastone">;
                        maxCommentCids: z.ZodNumber;
                        postScore: z.ZodOptional<z.ZodNumber>;
                        replyScore: z.ZodOptional<z.ZodNumber>;
                        firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                    }, "strict", z.ZodTypeAny, {
                        addresses: [string, ...string[]];
                        maxCommentCids: number;
                        postScore?: number | undefined;
                        replyScore?: number | undefined;
                        firstCommentTimestamp?: number | undefined;
                    }, {
                        addresses: [string, ...string[]];
                        maxCommentCids: number;
                        postScore?: number | undefined;
                        replyScore?: number | undefined;
                        firstCommentTimestamp?: number | undefined;
                    }>>;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                    challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                    role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                    address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                    rateLimit: z.ZodOptional<z.ZodNumber>;
                    rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
                    publicationType: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                        post: z.ZodOptional<z.ZodBoolean>;
                        reply: z.ZodOptional<z.ZodBoolean>;
                        vote: z.ZodOptional<z.ZodBoolean>;
                        commentEdit: z.ZodOptional<z.ZodBoolean>;
                        commentModeration: z.ZodOptional<z.ZodBoolean>;
                    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                        post: z.ZodOptional<z.ZodBoolean>;
                        reply: z.ZodOptional<z.ZodBoolean>;
                        vote: z.ZodOptional<z.ZodBoolean>;
                        commentEdit: z.ZodOptional<z.ZodBoolean>;
                        commentModeration: z.ZodOptional<z.ZodBoolean>;
                    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                        post: z.ZodOptional<z.ZodBoolean>;
                        reply: z.ZodOptional<z.ZodBoolean>;
                        vote: z.ZodOptional<z.ZodBoolean>;
                        commentEdit: z.ZodOptional<z.ZodBoolean>;
                        commentModeration: z.ZodOptional<z.ZodBoolean>;
                    }, z.ZodTypeAny, "passthrough">>, z.objectOutputType<{
                        post: z.ZodOptional<z.ZodBoolean>;
                        reply: z.ZodOptional<z.ZodBoolean>;
                        vote: z.ZodOptional<z.ZodBoolean>;
                        commentEdit: z.ZodOptional<z.ZodBoolean>;
                        commentModeration: z.ZodOptional<z.ZodBoolean>;
                    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                        post: z.ZodOptional<z.ZodBoolean>;
                        reply: z.ZodOptional<z.ZodBoolean>;
                        vote: z.ZodOptional<z.ZodBoolean>;
                        commentEdit: z.ZodOptional<z.ZodBoolean>;
                        commentModeration: z.ZodOptional<z.ZodBoolean>;
                    }, z.ZodTypeAny, "passthrough">>>;
                }, z.ZodTypeAny, "passthrough">[]] | undefined;
                description?: string | undefined;
                name?: string | undefined;
            }[] | undefined;
            fetchThumbnailUrls?: boolean | undefined;
            fetchThumbnailUrlsProxyUrl?: string | undefined;
        } | undefined;
    };
};
export declare function parseCreateSubplebbitEditPublicationOptionsSchemaWithPlebbitErrorIfItFails(args: CreateSubplebbitEditPublicationOptions): {
    signer: {
        type: "ed25519";
        privateKey: string;
    };
    subplebbitAddress: string;
    subplebbitEdit: {
        address?: string | undefined;
        title?: string | undefined;
        description?: string | undefined;
        pubsubTopic?: string | undefined;
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
            noPostUpvotes: z.ZodOptional<z.ZodBoolean>;
            noReplyUpvotes: z.ZodOptional<z.ZodBoolean>;
            noPostDownvotes: z.ZodOptional<z.ZodBoolean>;
            noReplyDownvotes: z.ZodOptional<z.ZodBoolean>;
            noUpvotes: z.ZodOptional<z.ZodBoolean>;
            noDownvotes: z.ZodOptional<z.ZodBoolean>;
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
                exclude?: [z.objectOutputType<{
                    subplebbit: z.ZodOptional<z.ZodObject<{
                        addresses: z.ZodArray<z.ZodString, "atleastone">;
                        maxCommentCids: z.ZodNumber;
                        postScore: z.ZodOptional<z.ZodNumber>;
                        replyScore: z.ZodOptional<z.ZodNumber>;
                        firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                    }, "strict", z.ZodTypeAny, {
                        addresses: [string, ...string[]];
                        maxCommentCids: number;
                        postScore?: number | undefined;
                        replyScore?: number | undefined;
                        firstCommentTimestamp?: number | undefined;
                    }, {
                        addresses: [string, ...string[]];
                        maxCommentCids: number;
                        postScore?: number | undefined;
                        replyScore?: number | undefined;
                        firstCommentTimestamp?: number | undefined;
                    }>>;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                    challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                    role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                    address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                    rateLimit: z.ZodOptional<z.ZodNumber>;
                    rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
                    publicationType: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                        post: z.ZodOptional<z.ZodBoolean>;
                        reply: z.ZodOptional<z.ZodBoolean>;
                        vote: z.ZodOptional<z.ZodBoolean>;
                        commentEdit: z.ZodOptional<z.ZodBoolean>;
                        commentModeration: z.ZodOptional<z.ZodBoolean>;
                    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                        post: z.ZodOptional<z.ZodBoolean>;
                        reply: z.ZodOptional<z.ZodBoolean>;
                        vote: z.ZodOptional<z.ZodBoolean>;
                        commentEdit: z.ZodOptional<z.ZodBoolean>;
                        commentModeration: z.ZodOptional<z.ZodBoolean>;
                    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                        post: z.ZodOptional<z.ZodBoolean>;
                        reply: z.ZodOptional<z.ZodBoolean>;
                        vote: z.ZodOptional<z.ZodBoolean>;
                        commentEdit: z.ZodOptional<z.ZodBoolean>;
                        commentModeration: z.ZodOptional<z.ZodBoolean>;
                    }, z.ZodTypeAny, "passthrough">>, z.objectOutputType<{
                        post: z.ZodOptional<z.ZodBoolean>;
                        reply: z.ZodOptional<z.ZodBoolean>;
                        vote: z.ZodOptional<z.ZodBoolean>;
                        commentEdit: z.ZodOptional<z.ZodBoolean>;
                        commentModeration: z.ZodOptional<z.ZodBoolean>;
                    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                        post: z.ZodOptional<z.ZodBoolean>;
                        reply: z.ZodOptional<z.ZodBoolean>;
                        vote: z.ZodOptional<z.ZodBoolean>;
                        commentEdit: z.ZodOptional<z.ZodBoolean>;
                        commentModeration: z.ZodOptional<z.ZodBoolean>;
                    }, z.ZodTypeAny, "passthrough">>>;
                }, z.ZodTypeAny, "passthrough">, ...z.objectOutputType<{
                    subplebbit: z.ZodOptional<z.ZodObject<{
                        addresses: z.ZodArray<z.ZodString, "atleastone">;
                        maxCommentCids: z.ZodNumber;
                        postScore: z.ZodOptional<z.ZodNumber>;
                        replyScore: z.ZodOptional<z.ZodNumber>;
                        firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                    }, "strict", z.ZodTypeAny, {
                        addresses: [string, ...string[]];
                        maxCommentCids: number;
                        postScore?: number | undefined;
                        replyScore?: number | undefined;
                        firstCommentTimestamp?: number | undefined;
                    }, {
                        addresses: [string, ...string[]];
                        maxCommentCids: number;
                        postScore?: number | undefined;
                        replyScore?: number | undefined;
                        firstCommentTimestamp?: number | undefined;
                    }>>;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                    challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                    role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                    address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                    rateLimit: z.ZodOptional<z.ZodNumber>;
                    rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
                    publicationType: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                        post: z.ZodOptional<z.ZodBoolean>;
                        reply: z.ZodOptional<z.ZodBoolean>;
                        vote: z.ZodOptional<z.ZodBoolean>;
                        commentEdit: z.ZodOptional<z.ZodBoolean>;
                        commentModeration: z.ZodOptional<z.ZodBoolean>;
                    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                        post: z.ZodOptional<z.ZodBoolean>;
                        reply: z.ZodOptional<z.ZodBoolean>;
                        vote: z.ZodOptional<z.ZodBoolean>;
                        commentEdit: z.ZodOptional<z.ZodBoolean>;
                        commentModeration: z.ZodOptional<z.ZodBoolean>;
                    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                        post: z.ZodOptional<z.ZodBoolean>;
                        reply: z.ZodOptional<z.ZodBoolean>;
                        vote: z.ZodOptional<z.ZodBoolean>;
                        commentEdit: z.ZodOptional<z.ZodBoolean>;
                        commentModeration: z.ZodOptional<z.ZodBoolean>;
                    }, z.ZodTypeAny, "passthrough">>, z.objectOutputType<{
                        post: z.ZodOptional<z.ZodBoolean>;
                        reply: z.ZodOptional<z.ZodBoolean>;
                        vote: z.ZodOptional<z.ZodBoolean>;
                        commentEdit: z.ZodOptional<z.ZodBoolean>;
                        commentModeration: z.ZodOptional<z.ZodBoolean>;
                    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                        post: z.ZodOptional<z.ZodBoolean>;
                        reply: z.ZodOptional<z.ZodBoolean>;
                        vote: z.ZodOptional<z.ZodBoolean>;
                        commentEdit: z.ZodOptional<z.ZodBoolean>;
                        commentModeration: z.ZodOptional<z.ZodBoolean>;
                    }, z.ZodTypeAny, "passthrough">>>;
                }, z.ZodTypeAny, "passthrough">[]] | undefined;
                description?: string | undefined;
                name?: string | undefined;
            }[] | undefined;
            fetchThumbnailUrls?: boolean | undefined;
            fetchThumbnailUrlsProxyUrl?: string | undefined;
        } | undefined;
    };
    timestamp?: number | undefined;
    author?: z.objectOutputType<{
        address: z.ZodOptional<z.ZodString>;
        previousCommentCid: z.ZodOptional<z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>>;
        displayName: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        wallets: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
            address: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: string;
                signature: string;
            }, {
                type: string;
                signature: string;
            }>;
        }, "strip", z.ZodTypeAny, {
            address: string;
            timestamp: number;
            signature: {
                type: string;
                signature: string;
            };
        }, {
            address: string;
            timestamp: number;
            signature: {
                type: string;
                signature: string;
            };
        }>>>>;
        avatar: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: string;
                signature: string;
            }, {
                type: string;
                signature: string;
            }>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: string;
                signature: string;
            }, {
                type: string;
                signature: string;
            }>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: string;
                signature: string;
            }, {
                type: string;
                signature: string;
            }>;
        }, z.ZodTypeAny, "passthrough">>>>;
        flair: z.ZodOptional<z.ZodOptional<z.ZodObject<{
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
        }, z.ZodTypeAny, "passthrough">>>>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    protocolVersion?: string | undefined;
    challengeRequest?: {
        challengeAnswers?: [string, ...string[]] | undefined;
        challengeCommentCids?: string[] | undefined;
    } | undefined;
};
export declare function parseDecryptedChallengeAnswerWithPlebbitErrorIfItFails(decryptedChallengeAnswers: z.infer<typeof DecryptedChallengeAnswerSchema>): DecryptedChallengeAnswer;
export declare function parseCreatePlebbitWsServerOptionsSchemaWithPlebbitErrorIfItFails(options: z.infer<typeof CreatePlebbitWsServerOptionsSchema>): CreatePlebbitWsServerOptions;
export declare function parseCommentModerationChallengeRequestToEncryptSchemaWithPlebbitErrorIfItFails(toEncrypt: z.infer<typeof CommentModerationChallengeRequestToEncryptSchema>): CommentModerationChallengeRequestToEncrypt;
export declare function parseSubplebbitEditChallengeRequestToEncryptSchemaWithPlebbitErrorIfItFails(toEncrypt: z.infer<typeof SubplebbitEditPublicationChallengeRequestToEncryptSchema>): SubplebbitEditChallengeRequestToEncryptType;
export declare function parseSubplebbitEditOptionsSchemaWithPlebbitErrorIfItFails(editOptions: z.infer<typeof SubplebbitEditOptionsSchema>): SubplebbitEditOptions;
export declare function parseCommentChallengeRequestToEncryptSchemaWithPlebbitErrorIfItFails(toEncrypt: z.infer<typeof CommentChallengeRequestToEncryptSchema>): CommentChallengeRequestToEncryptType;
export declare function parseVoteChallengeRequestToEncryptSchemaWithPlebbitErrorIfItFails(toEncrypt: z.infer<typeof VoteChallengeRequestToEncryptSchema>): VoteChallengeRequestToEncryptType;
export declare function parseCommentEditChallengeRequestToEncryptSchemaWithPlebbitErrorIfItFails(toEncrypt: z.infer<typeof CommentEditChallengeRequestToEncryptSchema>): CommentEditChallengeRequestToEncryptType;
export declare function parseCreateNewLocalSubplebbitUserOptionsSchemaWithPlebbitErrorIfItFails(options: z.infer<typeof CreateNewLocalSubplebbitUserOptionsSchema>): CreateNewLocalSubplebbitUserOptions;
export declare function parseSetNewSettingsPlebbitWsServerSchemaWithPlebbitErrorIfItFails(settings: z.input<typeof SetNewSettingsPlebbitWsServerSchema>): z.input<typeof SetNewSettingsPlebbitWsServerSchema>;
export declare function parseCreateCommentModerationOptionsSchemaWithPlebbitErrorIfItFails(args: z.infer<typeof CreateCommentModerationOptionsSchema>): {
    signer: {
        type: "ed25519";
        privateKey: string;
    };
    subplebbitAddress: string;
    commentCid: string;
    commentModeration: {
        flair?: z.objectOutputType<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
        author?: z.objectOutputType<Pick<{
            postScore: z.ZodNumber;
            replyScore: z.ZodNumber;
            banExpiresAt: z.ZodOptional<z.ZodNumber>;
            flair: z.ZodOptional<z.ZodObject<{
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
            }, z.ZodTypeAny, "passthrough">>>;
            firstCommentTimestamp: z.ZodNumber;
            lastCommentCid: z.ZodEffects<z.ZodString, string, string>;
        }, "flair" | "banExpiresAt">, z.ZodTypeAny, "passthrough"> | undefined;
        spoiler?: boolean | undefined;
        nsfw?: boolean | undefined;
        reason?: string | undefined;
        pinned?: boolean | undefined;
        locked?: boolean | undefined;
        removed?: boolean | undefined;
        purged?: boolean | undefined;
    } & {
        [k: string]: unknown;
    };
    timestamp?: number | undefined;
    author?: z.objectOutputType<{
        address: z.ZodOptional<z.ZodString>;
        previousCommentCid: z.ZodOptional<z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>>;
        displayName: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        wallets: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
            address: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: string;
                signature: string;
            }, {
                type: string;
                signature: string;
            }>;
        }, "strip", z.ZodTypeAny, {
            address: string;
            timestamp: number;
            signature: {
                type: string;
                signature: string;
            };
        }, {
            address: string;
            timestamp: number;
            signature: {
                type: string;
                signature: string;
            };
        }>>>>;
        avatar: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: string;
                signature: string;
            }, {
                type: string;
                signature: string;
            }>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: string;
                signature: string;
            }, {
                type: string;
                signature: string;
            }>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: string;
                signature: string;
            }, {
                type: string;
                signature: string;
            }>;
        }, z.ZodTypeAny, "passthrough">>>>;
        flair: z.ZodOptional<z.ZodOptional<z.ZodObject<{
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
        }, z.ZodTypeAny, "passthrough">>>>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    protocolVersion?: string | undefined;
    challengeRequest?: {
        challengeAnswers?: [string, ...string[]] | undefined;
        challengeCommentCids?: string[] | undefined;
    } | undefined;
};
export declare function parseCommentModerationPubsubMessagePublicationSchemaWithPlebbitErrorIfItFails(args: z.infer<typeof CommentModerationPubsubMessagePublicationSchema>): {
    timestamp: number;
    signature: {
        type: string;
        publicKey: string;
        signature: string;
        signedPropertyNames: string[];
    };
    author: {
        address: string;
        previousCommentCid?: string | undefined;
        displayName?: string | undefined;
        wallets?: Record<string, {
            address: string;
            timestamp: number;
            signature: {
                type: string;
                signature: string;
            };
        }> | undefined;
        avatar?: z.objectOutputType<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: string;
                signature: string;
            }, {
                type: string;
                signature: string;
            }>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
        flair?: z.objectOutputType<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
    } & {
        [k: string]: unknown;
    };
    subplebbitAddress: string;
    protocolVersion: string;
    commentCid: string;
    commentModeration: {
        flair?: z.objectOutputType<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
        author?: z.objectOutputType<Pick<{
            postScore: z.ZodNumber;
            replyScore: z.ZodNumber;
            banExpiresAt: z.ZodOptional<z.ZodNumber>;
            flair: z.ZodOptional<z.ZodObject<{
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
            }, z.ZodTypeAny, "passthrough">>>;
            firstCommentTimestamp: z.ZodNumber;
            lastCommentCid: z.ZodEffects<z.ZodString, string, string>;
        }, "flair" | "banExpiresAt">, z.ZodTypeAny, "passthrough"> | undefined;
        spoiler?: boolean | undefined;
        nsfw?: boolean | undefined;
        reason?: string | undefined;
        pinned?: boolean | undefined;
        locked?: boolean | undefined;
        removed?: boolean | undefined;
        purged?: boolean | undefined;
    } & {
        [k: string]: unknown;
    };
};
export declare function parseCreateRemoteSubplebbitFunctionArgumentSchemaWithPlebbitErrorIfItFails(args: any): z.infer<typeof CreateRemoteSubplebbitFunctionArgumentSchema>;
export declare function parseCreateVoteOptionsSchemaWithPlebbitErrorIfItFails(args: z.infer<typeof CreateVoteUserOptionsSchema>): {
    signer: {
        type: "ed25519";
        privateKey: string;
    };
    subplebbitAddress: string;
    commentCid: string;
    vote: 0 | 1 | -1;
    timestamp?: number | undefined;
    author?: z.objectOutputType<{
        address: z.ZodOptional<z.ZodString>;
        previousCommentCid: z.ZodOptional<z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>>;
        displayName: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        wallets: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
            address: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: string;
                signature: string;
            }, {
                type: string;
                signature: string;
            }>;
        }, "strip", z.ZodTypeAny, {
            address: string;
            timestamp: number;
            signature: {
                type: string;
                signature: string;
            };
        }, {
            address: string;
            timestamp: number;
            signature: {
                type: string;
                signature: string;
            };
        }>>>>;
        avatar: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: string;
                signature: string;
            }, {
                type: string;
                signature: string;
            }>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: string;
                signature: string;
            }, {
                type: string;
                signature: string;
            }>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: string;
                signature: string;
            }, {
                type: string;
                signature: string;
            }>;
        }, z.ZodTypeAny, "passthrough">>>>;
        flair: z.ZodOptional<z.ZodOptional<z.ZodObject<{
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
        }, z.ZodTypeAny, "passthrough">>>>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    protocolVersion?: string | undefined;
    challengeRequest?: {
        challengeAnswers?: [string, ...string[]] | undefined;
        challengeCommentCids?: string[] | undefined;
    } | undefined;
};
export declare function parseVotePubsubMessagePublicationSchemaWithPlebbitErrorIfItFails(args: z.infer<typeof VotePubsubMessagePublicationSchema>): {
    timestamp: number;
    signature: {
        type: string;
        publicKey: string;
        signature: string;
        signedPropertyNames: string[];
    };
    author: {
        address: string;
        previousCommentCid?: string | undefined;
        displayName?: string | undefined;
        wallets?: Record<string, {
            address: string;
            timestamp: number;
            signature: {
                type: string;
                signature: string;
            };
        }> | undefined;
        avatar?: z.objectOutputType<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: string;
                signature: string;
            }, {
                type: string;
                signature: string;
            }>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
        flair?: z.objectOutputType<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
    } & {
        [k: string]: unknown;
    };
    subplebbitAddress: string;
    protocolVersion: string;
    commentCid: string;
    vote: 0 | 1 | -1;
};
export declare function parseCreateCommentEditOptionsSchemaWithPlebbitErrorIfItFails(args: z.infer<typeof CreateCommentEditOptionsSchema>): {
    signer: {
        type: "ed25519";
        privateKey: string;
    };
    subplebbitAddress: string;
    commentCid: string;
    timestamp?: number | undefined;
    flair?: z.objectOutputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    author?: z.objectOutputType<{
        address: z.ZodOptional<z.ZodString>;
        previousCommentCid: z.ZodOptional<z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>>;
        displayName: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        wallets: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
            address: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: string;
                signature: string;
            }, {
                type: string;
                signature: string;
            }>;
        }, "strip", z.ZodTypeAny, {
            address: string;
            timestamp: number;
            signature: {
                type: string;
                signature: string;
            };
        }, {
            address: string;
            timestamp: number;
            signature: {
                type: string;
                signature: string;
            };
        }>>>>;
        avatar: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: string;
                signature: string;
            }, {
                type: string;
                signature: string;
            }>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: string;
                signature: string;
            }, {
                type: string;
                signature: string;
            }>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: string;
                signature: string;
            }, {
                type: string;
                signature: string;
            }>;
        }, z.ZodTypeAny, "passthrough">>>>;
        flair: z.ZodOptional<z.ZodOptional<z.ZodObject<{
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
        }, z.ZodTypeAny, "passthrough">>>>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    protocolVersion?: string | undefined;
    challengeRequest?: {
        challengeAnswers?: [string, ...string[]] | undefined;
        challengeCommentCids?: string[] | undefined;
    } | undefined;
    content?: string | undefined;
    deleted?: boolean | undefined;
    spoiler?: boolean | undefined;
    nsfw?: boolean | undefined;
    reason?: string | undefined;
};
export declare function parseCommentEditPubsubMessagePublicationSchemaWithPlebbitErrorIfItFails(args: z.infer<typeof CommentEditPubsubMessagePublicationSchema>): {
    timestamp: number;
    signature: {
        type: string;
        publicKey: string;
        signature: string;
        signedPropertyNames: string[];
    };
    author: {
        address: string;
        previousCommentCid?: string | undefined;
        displayName?: string | undefined;
        wallets?: Record<string, {
            address: string;
            timestamp: number;
            signature: {
                type: string;
                signature: string;
            };
        }> | undefined;
        avatar?: z.objectOutputType<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: string;
                signature: string;
            }, {
                type: string;
                signature: string;
            }>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
        flair?: z.objectOutputType<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
    };
    subplebbitAddress: string;
    protocolVersion: string;
    commentCid: string;
    flair?: z.objectOutputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    content?: string | undefined;
    deleted?: boolean | undefined;
    spoiler?: boolean | undefined;
    nsfw?: boolean | undefined;
    reason?: string | undefined;
};
export declare function parseCreateSubplebbitFunctionArgumentsSchemaWithPlebbitErrorIfItFails(args: z.infer<typeof CreateSubplebbitFunctionArgumentsSchema>): z.objectOutputType<{
    posts: z.ZodOptional<z.ZodObject<{
        pages: z.ZodRecord<z.ZodUnion<[z.ZodEnum<["hot", "new", "topHour", "topDay", "topWeek", "topMonth", "topYear", "topAll", "active"]>, z.ZodString]>, z.ZodType<import("../pages/types.js").PageIpfsManuallyDefined, z.ZodTypeDef, import("../pages/types.js").PageIpfsManuallyDefined>>;
        pageCids: z.ZodOptional<z.ZodRecord<z.ZodUnion<[z.ZodEnum<["hot", "new", "topHour", "topDay", "topWeek", "topMonth", "topYear", "topAll", "active"]>, z.ZodString]>, z.ZodEffects<z.ZodString, string, string>>>;
    }, "strip", z.ZodTypeAny, {
        pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
        pageCids?: Record<string, string> | undefined;
    }, {
        pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
        pageCids?: Record<string, string> | undefined;
    }>>;
    challenges: z.ZodArray<z.ZodObject<{
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "atleastone">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: [string, ...string[]];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: [string, ...string[]];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            publicationType: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">>, z.objectOutputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">>>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "atleastone">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: [string, ...string[]];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: [string, ...string[]];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            publicationType: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">>, z.objectOutputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">>>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "atleastone">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: [string, ...string[]];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: [string, ...string[]];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            publicationType: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">>, z.objectOutputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">>>;
        }, z.ZodTypeAny, "passthrough">>, "atleastone">>;
        description: z.ZodOptional<z.ZodString>;
        challenge: z.ZodOptional<z.ZodString>;
        type: z.ZodString;
        caseInsensitive: z.ZodOptional<z.ZodBoolean>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "atleastone">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: [string, ...string[]];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: [string, ...string[]];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            publicationType: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">>, z.objectOutputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">>>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "atleastone">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: [string, ...string[]];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: [string, ...string[]];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            publicationType: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">>, z.objectOutputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">>>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "atleastone">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: [string, ...string[]];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: [string, ...string[]];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            publicationType: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">>, z.objectOutputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">>>;
        }, z.ZodTypeAny, "passthrough">>, "atleastone">>;
        description: z.ZodOptional<z.ZodString>;
        challenge: z.ZodOptional<z.ZodString>;
        type: z.ZodString;
        caseInsensitive: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "atleastone">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: [string, ...string[]];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: [string, ...string[]];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            publicationType: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">>, z.objectOutputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">>>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "atleastone">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: [string, ...string[]];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: [string, ...string[]];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            publicationType: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">>, z.objectOutputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">>>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "atleastone">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: [string, ...string[]];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: [string, ...string[]];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            publicationType: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">>, z.objectOutputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">>>;
        }, z.ZodTypeAny, "passthrough">>, "atleastone">>;
        description: z.ZodOptional<z.ZodString>;
        challenge: z.ZodOptional<z.ZodString>;
        type: z.ZodString;
        caseInsensitive: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">>, "many">;
    signature: z.ZodObject<{
        type: z.ZodString;
        signature: z.ZodString;
        publicKey: z.ZodString;
        signedPropertyNames: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        type: string;
        publicKey: string;
        signature: string;
        signedPropertyNames: string[];
    }, {
        type: string;
        publicKey: string;
        signature: string;
        signedPropertyNames: string[];
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
    postUpdates: z.ZodOptional<z.ZodRecord<z.ZodEffects<z.ZodString, string, string>, z.ZodEffects<z.ZodString, string, string>>>;
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
        noPostUpvotes: z.ZodOptional<z.ZodBoolean>;
        noReplyUpvotes: z.ZodOptional<z.ZodBoolean>;
        noPostDownvotes: z.ZodOptional<z.ZodBoolean>;
        noReplyDownvotes: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
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
        noPostUpvotes: z.ZodOptional<z.ZodBoolean>;
        noReplyUpvotes: z.ZodOptional<z.ZodBoolean>;
        noPostDownvotes: z.ZodOptional<z.ZodBoolean>;
        noReplyDownvotes: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
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
        noPostUpvotes: z.ZodOptional<z.ZodBoolean>;
        noReplyUpvotes: z.ZodOptional<z.ZodBoolean>;
        noPostDownvotes: z.ZodOptional<z.ZodBoolean>;
        noReplyDownvotes: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
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
}, z.ZodTypeAny, "passthrough"> | {
    signer?: {
        type: "ed25519";
        privateKey: string;
    } | undefined;
    title?: string | undefined;
    description?: string | undefined;
    pubsubTopic?: string | undefined;
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
        noPostUpvotes: z.ZodOptional<z.ZodBoolean>;
        noReplyUpvotes: z.ZodOptional<z.ZodBoolean>;
        noPostDownvotes: z.ZodOptional<z.ZodBoolean>;
        noReplyDownvotes: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
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
            exclude?: [z.objectOutputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "atleastone">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: [string, ...string[]];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: [string, ...string[]];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
                publicationType: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, z.ZodTypeAny, "passthrough">>, z.objectOutputType<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, z.ZodTypeAny, "passthrough">, ...z.objectOutputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "atleastone">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: [string, ...string[]];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: [string, ...string[]];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
                publicationType: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, z.ZodTypeAny, "passthrough">>, z.objectOutputType<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, z.ZodTypeAny, "passthrough">[]] | undefined;
            description?: string | undefined;
            name?: string | undefined;
        }[] | undefined;
        fetchThumbnailUrls?: boolean | undefined;
        fetchThumbnailUrlsProxyUrl?: string | undefined;
    } | undefined;
} | {
    address: string;
    signature?: {
        type: string;
        publicKey: string;
        signature: string;
        signedPropertyNames: string[];
    } | undefined;
    protocolVersion?: string | undefined;
    lastCommentCid?: string | undefined;
    title?: string | undefined;
    updatedAt?: number | undefined;
    posts?: {
        pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
        pageCids?: Record<string, string> | undefined;
    } | {
        pageCids?: Record<string, string> | undefined;
    } | undefined;
    challenges?: z.objectOutputType<{
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "atleastone">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: [string, ...string[]];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: [string, ...string[]];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            publicationType: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">>, z.objectOutputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">>>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "atleastone">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: [string, ...string[]];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: [string, ...string[]];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            publicationType: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">>, z.objectOutputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">>>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "atleastone">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: [string, ...string[]];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: [string, ...string[]];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            publicationType: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">>, z.objectOutputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">>>;
        }, z.ZodTypeAny, "passthrough">>, "atleastone">>;
        description: z.ZodOptional<z.ZodString>;
        challenge: z.ZodOptional<z.ZodString>;
        type: z.ZodString;
        caseInsensitive: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">[] | undefined;
    description?: string | undefined;
    encryption?: z.objectOutputType<{
        type: z.ZodEnum<["ed25519-aes-gcm"]>;
        publicKey: z.ZodString;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    createdAt?: number | undefined;
    pubsubTopic?: string | undefined;
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
        noPostUpvotes: z.ZodOptional<z.ZodBoolean>;
        noReplyUpvotes: z.ZodOptional<z.ZodBoolean>;
        noPostDownvotes: z.ZodOptional<z.ZodBoolean>;
        noReplyDownvotes: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
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
};
export declare function parsePlebbitUserOptionsSchemaWithPlebbitErrorIfItFails(args: any): {
    userAgent: string;
    ipfsGatewayUrls: string[];
    httpRoutersOptions: string[];
    pubsubKuboRpcClientsOptions: import("kubo-rpc-client").Options[];
    chainProviders: {
        eth: {
            urls: string[];
            chainId: number;
        };
        avax: {
            urls: string[];
            chainId: number;
        };
        matic: {
            urls: string[];
            chainId: number;
        };
        sol: {
            urls: string[];
            chainId: number;
        };
    };
    resolveAuthorAddresses: boolean;
    publishInterval: number;
    updateInterval: number;
    noData: boolean;
    validatePages: boolean;
    kuboRpcClientsOptions?: import("kubo-rpc-client").Options[] | undefined;
    plebbitRpcClientsOptions?: [string, ...string[]] | undefined;
    dataPath?: string | undefined;
};
export declare function parseCreateRpcSubplebbitFunctionArgumentSchemaWithPlebbitErrorIfItFails(args: z.infer<typeof CreateRpcSubplebbitFunctionArgumentSchema>): z.objectOutputType<{
    posts: z.ZodOptional<z.ZodObject<{
        pages: z.ZodRecord<z.ZodUnion<[z.ZodEnum<["hot", "new", "topHour", "topDay", "topWeek", "topMonth", "topYear", "topAll", "active"]>, z.ZodString]>, z.ZodType<import("../pages/types.js").PageIpfsManuallyDefined, z.ZodTypeDef, import("../pages/types.js").PageIpfsManuallyDefined>>;
        pageCids: z.ZodOptional<z.ZodRecord<z.ZodUnion<[z.ZodEnum<["hot", "new", "topHour", "topDay", "topWeek", "topMonth", "topYear", "topAll", "active"]>, z.ZodString]>, z.ZodEffects<z.ZodString, string, string>>>;
    }, "strip", z.ZodTypeAny, {
        pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
        pageCids?: Record<string, string> | undefined;
    }, {
        pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
        pageCids?: Record<string, string> | undefined;
    }>>;
    challenges: z.ZodArray<z.ZodObject<{
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "atleastone">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: [string, ...string[]];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: [string, ...string[]];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            publicationType: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">>, z.objectOutputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">>>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "atleastone">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: [string, ...string[]];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: [string, ...string[]];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            publicationType: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">>, z.objectOutputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">>>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "atleastone">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: [string, ...string[]];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: [string, ...string[]];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            publicationType: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">>, z.objectOutputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">>>;
        }, z.ZodTypeAny, "passthrough">>, "atleastone">>;
        description: z.ZodOptional<z.ZodString>;
        challenge: z.ZodOptional<z.ZodString>;
        type: z.ZodString;
        caseInsensitive: z.ZodOptional<z.ZodBoolean>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "atleastone">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: [string, ...string[]];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: [string, ...string[]];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            publicationType: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">>, z.objectOutputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">>>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "atleastone">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: [string, ...string[]];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: [string, ...string[]];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            publicationType: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">>, z.objectOutputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">>>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "atleastone">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: [string, ...string[]];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: [string, ...string[]];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            publicationType: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">>, z.objectOutputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">>>;
        }, z.ZodTypeAny, "passthrough">>, "atleastone">>;
        description: z.ZodOptional<z.ZodString>;
        challenge: z.ZodOptional<z.ZodString>;
        type: z.ZodString;
        caseInsensitive: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "atleastone">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: [string, ...string[]];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: [string, ...string[]];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            publicationType: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">>, z.objectOutputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">>>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "atleastone">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: [string, ...string[]];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: [string, ...string[]];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            publicationType: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">>, z.objectOutputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">>>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "atleastone">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: [string, ...string[]];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: [string, ...string[]];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            publicationType: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">>, z.objectOutputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">>>;
        }, z.ZodTypeAny, "passthrough">>, "atleastone">>;
        description: z.ZodOptional<z.ZodString>;
        challenge: z.ZodOptional<z.ZodString>;
        type: z.ZodString;
        caseInsensitive: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">>, "many">;
    signature: z.ZodObject<{
        type: z.ZodString;
        signature: z.ZodString;
        publicKey: z.ZodString;
        signedPropertyNames: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        type: string;
        publicKey: string;
        signature: string;
        signedPropertyNames: string[];
    }, {
        type: string;
        publicKey: string;
        signature: string;
        signedPropertyNames: string[];
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
    postUpdates: z.ZodOptional<z.ZodRecord<z.ZodEffects<z.ZodString, string, string>, z.ZodEffects<z.ZodString, string, string>>>;
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
        noPostUpvotes: z.ZodOptional<z.ZodBoolean>;
        noReplyUpvotes: z.ZodOptional<z.ZodBoolean>;
        noPostDownvotes: z.ZodOptional<z.ZodBoolean>;
        noReplyDownvotes: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
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
        noPostUpvotes: z.ZodOptional<z.ZodBoolean>;
        noReplyUpvotes: z.ZodOptional<z.ZodBoolean>;
        noPostDownvotes: z.ZodOptional<z.ZodBoolean>;
        noReplyDownvotes: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
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
        noPostUpvotes: z.ZodOptional<z.ZodBoolean>;
        noReplyUpvotes: z.ZodOptional<z.ZodBoolean>;
        noPostDownvotes: z.ZodOptional<z.ZodBoolean>;
        noReplyDownvotes: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
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
}, z.ZodTypeAny, "passthrough"> | {
    signer?: {
        type: "ed25519";
        privateKey: string;
    } | undefined;
    title?: string | undefined;
    description?: string | undefined;
    pubsubTopic?: string | undefined;
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
        noPostUpvotes: z.ZodOptional<z.ZodBoolean>;
        noReplyUpvotes: z.ZodOptional<z.ZodBoolean>;
        noPostDownvotes: z.ZodOptional<z.ZodBoolean>;
        noReplyDownvotes: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
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
            exclude?: [z.objectOutputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "atleastone">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: [string, ...string[]];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: [string, ...string[]];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
                publicationType: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, z.ZodTypeAny, "passthrough">>, z.objectOutputType<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, z.ZodTypeAny, "passthrough">, ...z.objectOutputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "atleastone">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: [string, ...string[]];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: [string, ...string[]];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
                publicationType: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, z.ZodTypeAny, "passthrough">>, z.objectOutputType<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, z.ZodTypeAny, "passthrough">[]] | undefined;
            description?: string | undefined;
            name?: string | undefined;
        }[] | undefined;
        fetchThumbnailUrls?: boolean | undefined;
        fetchThumbnailUrlsProxyUrl?: string | undefined;
    } | undefined;
} | {
    address: string;
    signature?: {
        type: string;
        publicKey: string;
        signature: string;
        signedPropertyNames: string[];
    } | undefined;
    protocolVersion?: string | undefined;
    lastCommentCid?: string | undefined;
    title?: string | undefined;
    updatedAt?: number | undefined;
    posts?: {
        pages: Record<string, import("../pages/types.js").PageIpfsManuallyDefined>;
        pageCids?: Record<string, string> | undefined;
    } | {
        pageCids?: Record<string, string> | undefined;
    } | undefined;
    challenges?: z.objectOutputType<{
        exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "atleastone">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: [string, ...string[]];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: [string, ...string[]];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            publicationType: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">>, z.objectOutputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">>>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "atleastone">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: [string, ...string[]];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: [string, ...string[]];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            publicationType: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">>, z.objectOutputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">>>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            subplebbit: z.ZodOptional<z.ZodObject<{
                addresses: z.ZodArray<z.ZodString, "atleastone">;
                maxCommentCids: z.ZodNumber;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                addresses: [string, ...string[]];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: [string, ...string[]];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: z.ZodOptional<z.ZodNumber>;
            replyScore: z.ZodOptional<z.ZodNumber>;
            firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
            challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rateLimit: z.ZodOptional<z.ZodNumber>;
            rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            publicationType: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">>, z.objectOutputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                commentEdit: z.ZodOptional<z.ZodBoolean>;
                commentModeration: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">>>;
        }, z.ZodTypeAny, "passthrough">>, "atleastone">>;
        description: z.ZodOptional<z.ZodString>;
        challenge: z.ZodOptional<z.ZodString>;
        type: z.ZodString;
        caseInsensitive: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">[] | undefined;
    description?: string | undefined;
    encryption?: z.objectOutputType<{
        type: z.ZodEnum<["ed25519-aes-gcm"]>;
        publicKey: z.ZodString;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    createdAt?: number | undefined;
    pubsubTopic?: string | undefined;
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
        noPostUpvotes: z.ZodOptional<z.ZodBoolean>;
        noReplyUpvotes: z.ZodOptional<z.ZodBoolean>;
        noPostDownvotes: z.ZodOptional<z.ZodBoolean>;
        noReplyDownvotes: z.ZodOptional<z.ZodBoolean>;
        noUpvotes: z.ZodOptional<z.ZodBoolean>;
        noDownvotes: z.ZodOptional<z.ZodBoolean>;
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
};
export declare function parseCommentPubsubMessagePublicationWithPlebbitErrorIfItFails(args: z.infer<typeof CommentPubsubMessagePublicationSchema>): {
    timestamp: number;
    signature: {
        type: string;
        publicKey: string;
        signature: string;
        signedPropertyNames: string[];
    };
    author: {
        address: string;
        previousCommentCid?: string | undefined;
        displayName?: string | undefined;
        wallets?: Record<string, {
            address: string;
            timestamp: number;
            signature: {
                type: string;
                signature: string;
            };
        }> | undefined;
        avatar?: z.objectOutputType<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: string;
                signature: string;
            }, {
                type: string;
                signature: string;
            }>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
        flair?: z.objectOutputType<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
    };
    subplebbitAddress: string;
    protocolVersion: string;
    flair?: z.objectOutputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    content?: string | undefined;
    spoiler?: boolean | undefined;
    nsfw?: boolean | undefined;
    title?: string | undefined;
    link?: string | undefined;
    linkWidth?: number | undefined;
    linkHeight?: number | undefined;
    linkHtmlTagName?: "a" | "img" | "video" | "audio" | undefined;
    parentCid?: string | undefined;
    postCid?: string | undefined;
};
export declare function parseCreateCommentOptionsSchemaWithPlebbitErrorIfItFails(args: z.infer<typeof CreateCommentOptionsSchema>): {
    signer: {
        type: "ed25519";
        privateKey: string;
    };
    subplebbitAddress: string;
    timestamp?: number | undefined;
    flair?: z.objectOutputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    author?: z.objectOutputType<{
        address: z.ZodOptional<z.ZodString>;
        previousCommentCid: z.ZodOptional<z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>>;
        displayName: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        wallets: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
            address: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: string;
                signature: string;
            }, {
                type: string;
                signature: string;
            }>;
        }, "strip", z.ZodTypeAny, {
            address: string;
            timestamp: number;
            signature: {
                type: string;
                signature: string;
            };
        }, {
            address: string;
            timestamp: number;
            signature: {
                type: string;
                signature: string;
            };
        }>>>>;
        avatar: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: string;
                signature: string;
            }, {
                type: string;
                signature: string;
            }>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: string;
                signature: string;
            }, {
                type: string;
                signature: string;
            }>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: string;
                signature: string;
            }, {
                type: string;
                signature: string;
            }>;
        }, z.ZodTypeAny, "passthrough">>>>;
        flair: z.ZodOptional<z.ZodOptional<z.ZodObject<{
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
        }, z.ZodTypeAny, "passthrough">>>>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    protocolVersion?: string | undefined;
    challengeRequest?: {
        challengeAnswers?: [string, ...string[]] | undefined;
        challengeCommentCids?: string[] | undefined;
    } | undefined;
    content?: string | undefined;
    spoiler?: boolean | undefined;
    nsfw?: boolean | undefined;
    title?: string | undefined;
    link?: string | undefined;
    linkWidth?: number | undefined;
    linkHeight?: number | undefined;
    linkHtmlTagName?: "a" | "img" | "video" | "audio" | undefined;
    parentCid?: string | undefined;
    postCid?: string | undefined;
};
export declare function parseSubplebbitAddressWithPlebbitErrorIfItFails(args: z.infer<typeof CreateCommentOptionsSchema.shape.subplebbitAddress>): string;
