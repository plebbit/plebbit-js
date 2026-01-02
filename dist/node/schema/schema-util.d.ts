import { ModQueuePageIpfsSchema, PageIpfsSchema } from "../pages/schema.js";
import type { PageIpfs } from "../pages/types.js";
import { CommentChallengeRequestToEncryptSchema, CommentIpfsSchema, CommentPubsubMessagePublicationSchema, CommentUpdateSchema, CreateCommentOptionsSchema } from "../publications/comment/schema.js";
import type { CommentChallengeRequestToEncryptType, CommentIpfsType, CommentUpdateType } from "../publications/comment/types.js";
import { DecryptedChallengeAnswerSchema, DecryptedChallengeSchema, DecryptedChallengeVerificationSchema } from "../pubsub-messages/schema.js";
import { CreateNewLocalSubplebbitUserOptionsSchema, CreateRemoteSubplebbitFunctionArgumentSchema, CreateRpcSubplebbitFunctionArgumentSchema, CreateSubplebbitFunctionArgumentsSchema, SubplebbitEditOptionsSchema, SubplebbitIpfsSchema } from "../subplebbit/schema.js";
import type { CreateNewLocalSubplebbitUserOptions, RpcRemoteSubplebbitUpdateEventResultType, SubplebbitEditOptions, SubplebbitIpfsType } from "../subplebbit/types.js";
import type { DecryptedChallenge, DecryptedChallengeAnswer, DecryptedChallengeVerification } from "../pubsub-messages/types.js";
import { CidStringSchema } from "./schema.js";
import { RpcCommentEventResultSchema, RpcCommentUpdateResultSchema } from "../clients/rpc-client/schema.js";
import { CreatePlebbitWsServerOptionsSchema, SetNewSettingsPlebbitWsServerSchema } from "../rpc/src/schema.js";
import type { CreatePlebbitWsServerOptions } from "../rpc/src/types.js";
import type { CommentModerationChallengeRequestToEncrypt } from "../publications/comment-moderation/types.js";
import { CommentModerationChallengeRequestToEncryptSchema, CommentModerationPubsubMessagePublicationSchema, CreateCommentModerationOptionsSchema } from "../publications/comment-moderation/schema.js";
import type { VoteChallengeRequestToEncryptType } from "../publications/vote/types.js";
import { CreateVoteUserOptionsSchema, VoteChallengeRequestToEncryptSchema, VotePubsubMessagePublicationSchema } from "../publications/vote/schema.js";
import type { CommentEditChallengeRequestToEncryptType } from "../publications/comment-edit/types.js";
import { CommentEditChallengeRequestToEncryptSchema, CommentEditPubsubMessagePublicationSchema, CreateCommentEditOptionsSchema } from "../publications/comment-edit/schema.js";
import { PlebbitUserOptionsSchema } from "../schema.js";
import { z, type ZodObject } from "zod";
import type { CreateSubplebbitEditPublicationOptions, SubplebbitEditChallengeRequestToEncryptType, SubplebbitEditPubsubMessagePublication } from "../publications/subplebbit-edit/types.js";
import { SubplebbitEditPublicationChallengeRequestToEncryptSchema } from "../publications/subplebbit-edit/schema.js";
export declare function parseJsonWithPlebbitErrorIfFails(x: string): any;
export declare function parseSubplebbitIpfsSchemaPassthroughWithPlebbitErrorIfItFails(subIpfs: z.infer<typeof SubplebbitIpfsSchema>): SubplebbitIpfsType;
export declare function parseCommentIpfsSchemaWithPlebbitErrorIfItFails(commentIpfsJson: z.infer<typeof CommentIpfsSchema>): CommentIpfsType;
export declare function parseCommentUpdateSchemaWithPlebbitErrorIfItFails(commentUpdateJson: z.infer<typeof CommentUpdateSchema>): CommentUpdateType;
export declare function parsePageIpfsSchemaWithPlebbitErrorIfItFails(pageIpfsJson: z.infer<typeof PageIpfsSchema>): PageIpfs;
export declare function parseModQueuePageIpfsSchemaWithPlebbitErrorIfItFails(modQueuePageIpfsJson: z.infer<typeof ModQueuePageIpfsSchema>): {
    comments: {
        comment: {
            [x: string]: unknown;
            timestamp: number;
            signature: {
                type: string;
                signature: string;
                publicKey: string;
                signedPropertyNames: string[];
            };
            subplebbitAddress: string;
            protocolVersion: string;
            author: {
                [x: string]: unknown;
                address: string;
                previousCommentCid?: string | undefined;
                displayName?: string | undefined;
                wallets?: Record<string, {
                    address: string;
                    timestamp: number;
                    signature: {
                        signature: string;
                        type: string;
                    };
                }> | undefined;
                avatar?: {
                    [x: string]: unknown;
                    chainTicker: string;
                    address: string;
                    id: string;
                    timestamp: number;
                    signature: {
                        signature: string;
                        type: string;
                    };
                } | undefined;
                flair?: {
                    [x: string]: unknown;
                    text: string;
                    backgroundColor?: string | undefined;
                    textColor?: string | undefined;
                    expiresAt?: number | undefined;
                } | undefined;
            };
            depth: number;
            flair?: {
                [x: string]: unknown;
                text: string;
                backgroundColor?: string | undefined;
                textColor?: string | undefined;
                expiresAt?: number | undefined;
            } | undefined;
            content?: string | undefined;
            spoiler?: boolean | undefined;
            nsfw?: boolean | undefined;
            link?: string | undefined;
            title?: string | undefined;
            linkWidth?: number | undefined;
            linkHeight?: number | undefined;
            linkHtmlTagName?: string | undefined;
            parentCid?: string | undefined;
            postCid?: string | undefined;
            thumbnailUrl?: string | undefined;
            thumbnailUrlWidth?: number | undefined;
            thumbnailUrlHeight?: number | undefined;
            previousCid?: string | undefined;
        };
        commentUpdate: {
            [x: string]: unknown;
            signature: {
                type: string;
                signature: string;
                publicKey: string;
                signedPropertyNames: string[];
            };
            protocolVersion: string;
            cid: string;
            author?: {
                [x: string]: unknown;
                subplebbit?: {
                    [x: string]: unknown;
                    postScore: number;
                    replyScore: number;
                    firstCommentTimestamp: number;
                    lastCommentCid: string;
                    banExpiresAt?: number | undefined;
                    flair?: {
                        [x: string]: unknown;
                        text: string;
                        backgroundColor?: string | undefined;
                        textColor?: string | undefined;
                        expiresAt?: number | undefined;
                    } | undefined;
                } | undefined;
            } | undefined;
            pendingApproval?: boolean | undefined;
        };
    }[];
    nextCid?: string | undefined;
};
export declare function parseDecryptedChallengeWithPlebbitErrorIfItFails(decryptedChallengeJson: z.infer<typeof DecryptedChallengeSchema>): DecryptedChallenge;
export declare function parseDecryptedChallengeVerification(decryptedChallengeVerificationJson: z.infer<typeof DecryptedChallengeVerificationSchema>): DecryptedChallengeVerification;
export declare function parseRpcRemoteSubplebbitUpdateEventWithPlebbitErrorIfItFails(rpcRemoteSubplebbit: RpcRemoteSubplebbitUpdateEventResultType): {
    subplebbit: {
        [x: string]: unknown;
        challenges: {
            [x: string]: unknown;
            type: string;
            exclude?: {
                [x: string]: unknown;
                subplebbit?: {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                } | undefined;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
                challenges?: number[] | undefined;
                role?: string[] | undefined;
                address?: string[] | undefined;
                rateLimit?: number | undefined;
                rateLimitChallengeSuccess?: boolean | undefined;
                publicationType?: {
                    [x: string]: unknown;
                    post?: boolean | undefined;
                    reply?: boolean | undefined;
                    vote?: boolean | undefined;
                    commentEdit?: boolean | undefined;
                    commentModeration?: boolean | undefined;
                    subplebbitEdit?: boolean | undefined;
                } | undefined;
            }[] | undefined;
            description?: string | undefined;
            challenge?: string | undefined;
            caseInsensitive?: boolean | undefined;
            pendingApproval?: boolean | undefined;
        }[];
        signature: {
            type: string;
            signature: string;
            publicKey: string;
            signedPropertyNames: string[];
        };
        encryption: {
            [x: string]: unknown;
            type: string;
            publicKey: string;
        };
        address: string;
        createdAt: number;
        updatedAt: number;
        statsCid: string;
        protocolVersion: string;
        posts?: {
            pages: Record<string, {
                comments: {
                    comment: {
                        [x: string]: unknown;
                        timestamp: number;
                        signature: {
                            type: string;
                            signature: string;
                            publicKey: string;
                            signedPropertyNames: string[];
                        };
                        subplebbitAddress: string;
                        protocolVersion: string;
                        author: {
                            [x: string]: unknown;
                            address: string;
                            previousCommentCid?: string | undefined;
                            displayName?: string | undefined;
                            wallets?: Record<string, {
                                address: string;
                                timestamp: number;
                                signature: {
                                    signature: string;
                                    type: string;
                                };
                            }> | undefined;
                            avatar?: {
                                [x: string]: unknown;
                                chainTicker: string;
                                address: string;
                                id: string;
                                timestamp: number;
                                signature: {
                                    signature: string;
                                    type: string;
                                };
                            } | undefined;
                            flair?: {
                                [x: string]: unknown;
                                text: string;
                                backgroundColor?: string | undefined;
                                textColor?: string | undefined;
                                expiresAt?: number | undefined;
                            } | undefined;
                        };
                        depth: number;
                        flair?: {
                            [x: string]: unknown;
                            text: string;
                            backgroundColor?: string | undefined;
                            textColor?: string | undefined;
                            expiresAt?: number | undefined;
                        } | undefined;
                        content?: string | undefined;
                        spoiler?: boolean | undefined;
                        nsfw?: boolean | undefined;
                        link?: string | undefined;
                        title?: string | undefined;
                        linkWidth?: number | undefined;
                        linkHeight?: number | undefined;
                        linkHtmlTagName?: string | undefined;
                        parentCid?: string | undefined;
                        postCid?: string | undefined;
                        thumbnailUrl?: string | undefined;
                        thumbnailUrlWidth?: number | undefined;
                        thumbnailUrlHeight?: number | undefined;
                        previousCid?: string | undefined;
                    };
                    commentUpdate: {
                        [x: string]: unknown;
                        cid: string;
                        upvoteCount: number;
                        downvoteCount: number;
                        replyCount: number;
                        updatedAt: number;
                        signature: {
                            type: string;
                            signature: string;
                            publicKey: string;
                            signedPropertyNames: string[];
                        };
                        protocolVersion: string;
                        childCount?: number | undefined;
                        number?: number | undefined;
                        postNumber?: number | undefined;
                        edit?: {
                            [x: string]: unknown;
                            timestamp: number;
                            signature: {
                                type: string;
                                signature: string;
                                publicKey: string;
                                signedPropertyNames: string[];
                            };
                            subplebbitAddress: string;
                            protocolVersion: string;
                            commentCid: string;
                            author: {
                                [x: string]: unknown;
                                address: string;
                                previousCommentCid?: string | undefined;
                                displayName?: string | undefined;
                                wallets?: Record<string, {
                                    address: string;
                                    timestamp: number;
                                    signature: {
                                        signature: string;
                                        type: string;
                                    };
                                }> | undefined;
                                avatar?: {
                                    [x: string]: unknown;
                                    chainTicker: string;
                                    address: string;
                                    id: string;
                                    timestamp: number;
                                    signature: {
                                        signature: string;
                                        type: string;
                                    };
                                } | undefined;
                                flair?: {
                                    [x: string]: unknown;
                                    text: string;
                                    backgroundColor?: string | undefined;
                                    textColor?: string | undefined;
                                    expiresAt?: number | undefined;
                                } | undefined;
                            };
                            flair?: {
                                [x: string]: unknown;
                                text: string;
                                backgroundColor?: string | undefined;
                                textColor?: string | undefined;
                                expiresAt?: number | undefined;
                            } | undefined;
                            content?: string | undefined;
                            deleted?: boolean | undefined;
                            spoiler?: boolean | undefined;
                            nsfw?: boolean | undefined;
                            reason?: string | undefined;
                        } | undefined;
                        flair?: {
                            [x: string]: unknown;
                            text: string;
                            backgroundColor?: string | undefined;
                            textColor?: string | undefined;
                            expiresAt?: number | undefined;
                        } | undefined;
                        spoiler?: boolean | undefined;
                        nsfw?: boolean | undefined;
                        pinned?: boolean | undefined;
                        locked?: boolean | undefined;
                        removed?: boolean | undefined;
                        reason?: string | undefined;
                        approved?: boolean | undefined;
                        author?: {
                            [x: string]: unknown;
                            subplebbit?: {
                                [x: string]: unknown;
                                postScore: number;
                                replyScore: number;
                                firstCommentTimestamp: number;
                                lastCommentCid: string;
                                banExpiresAt?: number | undefined;
                                flair?: {
                                    [x: string]: unknown;
                                    text: string;
                                    backgroundColor?: string | undefined;
                                    textColor?: string | undefined;
                                    expiresAt?: number | undefined;
                                } | undefined;
                            } | undefined;
                        } | undefined;
                        lastChildCid?: string | undefined;
                        lastReplyTimestamp?: number | undefined;
                        replies?: {
                            pages: Record<string, /*elided*/ any>;
                            pageCids?: Record<string, string> | undefined;
                        } | undefined;
                    };
                }[];
                nextCid?: string | undefined;
            }>;
            pageCids?: Record<string, string> | undefined;
        } | undefined;
        modQueue?: {
            pageCids: Record<string, string>;
        } | undefined;
        pubsubTopic?: string | undefined;
        postUpdates?: Record<string, string> | undefined;
        title?: string | undefined;
        description?: string | undefined;
        roles?: Record<string, {
            [x: string]: unknown;
            role: string;
        }> | undefined;
        rules?: string[] | undefined;
        lastPostCid?: string | undefined;
        lastCommentCid?: string | undefined;
        features?: {
            [x: string]: unknown;
            noVideos?: boolean | undefined;
            noSpoilers?: boolean | undefined;
            noImages?: boolean | undefined;
            noVideoReplies?: boolean | undefined;
            noSpoilerReplies?: boolean | undefined;
            noImageReplies?: boolean | undefined;
            noPolls?: boolean | undefined;
            noCrossposts?: boolean | undefined;
            noAuthors?: boolean | undefined;
            anonymousAuthors?: boolean | undefined;
            noNestedReplies?: boolean | undefined;
            safeForWork?: boolean | undefined;
            authorFlairs?: boolean | undefined;
            requireAuthorFlairs?: boolean | undefined;
            postFlairs?: boolean | undefined;
            requirePostFlairs?: boolean | undefined;
            noMarkdownImages?: boolean | undefined;
            noMarkdownVideos?: boolean | undefined;
            markdownImageReplies?: boolean | undefined;
            markdownVideoReplies?: boolean | undefined;
            noPostUpvotes?: boolean | undefined;
            noReplyUpvotes?: boolean | undefined;
            noPostDownvotes?: boolean | undefined;
            noReplyDownvotes?: boolean | undefined;
            noUpvotes?: boolean | undefined;
            noDownvotes?: boolean | undefined;
            requirePostLink?: boolean | undefined;
            requirePostLinkIsMedia?: boolean | undefined;
            pseudonymityMode?: "per-post" | "per-reply" | "per-author" | undefined;
        } | undefined;
        suggested?: {
            [x: string]: unknown;
            primaryColor?: string | undefined;
            secondaryColor?: string | undefined;
            avatarUrl?: string | undefined;
            bannerUrl?: string | undefined;
            backgroundUrl?: string | undefined;
            language?: string | undefined;
        } | undefined;
        flairs?: Record<string, {
            [x: string]: unknown;
            text: string;
            backgroundColor?: string | undefined;
            textColor?: string | undefined;
            expiresAt?: number | undefined;
        }[]> | undefined;
    };
    updateCid: string;
    updatingState?: import("../subplebbit/types.js").SubplebbitUpdatingState | undefined;
};
export declare function parseCidStringSchemaWithPlebbitErrorIfItFails(cidString: z.infer<typeof CidStringSchema>): string;
export declare function parseRpcCommentUpdateEventWithPlebbitErrorIfItFails(updateResult: z.infer<typeof RpcCommentUpdateResultSchema>): CommentUpdateType;
export declare function parseRpcCommentEventWithPlebbitErrorIfItFails(updateResult: z.infer<typeof RpcCommentEventResultSchema>): CommentIpfsType;
export declare function parseSubplebbitEditPubsubMessagePublicationSchemaWithPlebbitErrorIfItFails(args: SubplebbitEditPubsubMessagePublication): {
    timestamp: number;
    signature: {
        type: string;
        signature: string;
        publicKey: string;
        signedPropertyNames: string[];
    };
    subplebbitAddress: string;
    author: {
        [x: string]: unknown;
        address: string;
        previousCommentCid?: string | undefined;
        displayName?: string | undefined;
        wallets?: Record<string, {
            address: string;
            timestamp: number;
            signature: {
                signature: string;
                type: string;
            };
        }> | undefined;
        avatar?: {
            [x: string]: unknown;
            chainTicker: string;
            address: string;
            id: string;
            timestamp: number;
            signature: {
                signature: string;
                type: string;
            };
        } | undefined;
        flair?: {
            [x: string]: unknown;
            text: string;
            backgroundColor?: string | undefined;
            textColor?: string | undefined;
            expiresAt?: number | undefined;
        } | undefined;
    };
    protocolVersion: string;
    subplebbitEdit: {
        address?: string | undefined;
        title?: string | undefined;
        description?: string | undefined;
        pubsubTopic?: string | undefined;
        rules?: string[] | undefined;
        features?: {
            [x: string]: unknown;
            noVideos?: boolean | undefined;
            noSpoilers?: boolean | undefined;
            noImages?: boolean | undefined;
            noVideoReplies?: boolean | undefined;
            noSpoilerReplies?: boolean | undefined;
            noImageReplies?: boolean | undefined;
            noPolls?: boolean | undefined;
            noCrossposts?: boolean | undefined;
            noAuthors?: boolean | undefined;
            anonymousAuthors?: boolean | undefined;
            noNestedReplies?: boolean | undefined;
            safeForWork?: boolean | undefined;
            authorFlairs?: boolean | undefined;
            requireAuthorFlairs?: boolean | undefined;
            postFlairs?: boolean | undefined;
            requirePostFlairs?: boolean | undefined;
            noMarkdownImages?: boolean | undefined;
            noMarkdownVideos?: boolean | undefined;
            markdownImageReplies?: boolean | undefined;
            markdownVideoReplies?: boolean | undefined;
            noPostUpvotes?: boolean | undefined;
            noReplyUpvotes?: boolean | undefined;
            noPostDownvotes?: boolean | undefined;
            noReplyDownvotes?: boolean | undefined;
            noUpvotes?: boolean | undefined;
            noDownvotes?: boolean | undefined;
            requirePostLink?: boolean | undefined;
            requirePostLinkIsMedia?: boolean | undefined;
            pseudonymityMode?: "per-post" | "per-reply" | "per-author" | undefined;
        } | undefined;
        suggested?: {
            [x: string]: unknown;
            primaryColor?: string | undefined;
            secondaryColor?: string | undefined;
            avatarUrl?: string | undefined;
            bannerUrl?: string | undefined;
            backgroundUrl?: string | undefined;
            language?: string | undefined;
        } | undefined;
        flairs?: Record<string, {
            [x: string]: unknown;
            text: string;
            backgroundColor?: string | undefined;
            textColor?: string | undefined;
            expiresAt?: number | undefined;
        }[]> | undefined;
        settings?: {
            fetchThumbnailUrls?: boolean | undefined;
            fetchThumbnailUrlsProxyUrl?: string | undefined;
            challenges?: {
                path?: string | undefined;
                name?: string | undefined;
                options?: Record<string, string> | undefined;
                exclude?: {
                    [x: string]: unknown;
                    subplebbit?: {
                        addresses: string[];
                        maxCommentCids: number;
                        postScore?: number | undefined;
                        replyScore?: number | undefined;
                        firstCommentTimestamp?: number | undefined;
                    } | undefined;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                    challenges?: number[] | undefined;
                    role?: string[] | undefined;
                    address?: string[] | undefined;
                    rateLimit?: number | undefined;
                    rateLimitChallengeSuccess?: boolean | undefined;
                    publicationType?: {
                        [x: string]: unknown;
                        post?: boolean | undefined;
                        reply?: boolean | undefined;
                        vote?: boolean | undefined;
                        commentEdit?: boolean | undefined;
                        commentModeration?: boolean | undefined;
                        subplebbitEdit?: boolean | undefined;
                    } | undefined;
                }[] | undefined;
                description?: string | undefined;
                pendingApproval?: boolean | undefined;
            }[] | undefined;
            maxPendingApprovalCount?: number | undefined;
            purgeDisapprovedCommentsOlderThan?: number | undefined;
        } | undefined;
        roles?: Record<string, {
            [x: string]: unknown;
            role: string;
        } | undefined> | undefined;
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
        rules?: string[] | undefined;
        features?: {
            [x: string]: unknown;
            noVideos?: boolean | undefined;
            noSpoilers?: boolean | undefined;
            noImages?: boolean | undefined;
            noVideoReplies?: boolean | undefined;
            noSpoilerReplies?: boolean | undefined;
            noImageReplies?: boolean | undefined;
            noPolls?: boolean | undefined;
            noCrossposts?: boolean | undefined;
            noAuthors?: boolean | undefined;
            anonymousAuthors?: boolean | undefined;
            noNestedReplies?: boolean | undefined;
            safeForWork?: boolean | undefined;
            authorFlairs?: boolean | undefined;
            requireAuthorFlairs?: boolean | undefined;
            postFlairs?: boolean | undefined;
            requirePostFlairs?: boolean | undefined;
            noMarkdownImages?: boolean | undefined;
            noMarkdownVideos?: boolean | undefined;
            markdownImageReplies?: boolean | undefined;
            markdownVideoReplies?: boolean | undefined;
            noPostUpvotes?: boolean | undefined;
            noReplyUpvotes?: boolean | undefined;
            noPostDownvotes?: boolean | undefined;
            noReplyDownvotes?: boolean | undefined;
            noUpvotes?: boolean | undefined;
            noDownvotes?: boolean | undefined;
            requirePostLink?: boolean | undefined;
            requirePostLinkIsMedia?: boolean | undefined;
            pseudonymityMode?: "per-post" | "per-reply" | "per-author" | undefined;
        } | undefined;
        suggested?: {
            [x: string]: unknown;
            primaryColor?: string | undefined;
            secondaryColor?: string | undefined;
            avatarUrl?: string | undefined;
            bannerUrl?: string | undefined;
            backgroundUrl?: string | undefined;
            language?: string | undefined;
        } | undefined;
        flairs?: Record<string, {
            [x: string]: unknown;
            text: string;
            backgroundColor?: string | undefined;
            textColor?: string | undefined;
            expiresAt?: number | undefined;
        }[]> | undefined;
        settings?: {
            fetchThumbnailUrls?: boolean | undefined;
            fetchThumbnailUrlsProxyUrl?: string | undefined;
            challenges?: {
                path?: string | undefined;
                name?: string | undefined;
                options?: Record<string, string> | undefined;
                exclude?: {
                    [x: string]: unknown;
                    subplebbit?: {
                        addresses: string[];
                        maxCommentCids: number;
                        postScore?: number | undefined;
                        replyScore?: number | undefined;
                        firstCommentTimestamp?: number | undefined;
                    } | undefined;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                    challenges?: number[] | undefined;
                    role?: string[] | undefined;
                    address?: string[] | undefined;
                    rateLimit?: number | undefined;
                    rateLimitChallengeSuccess?: boolean | undefined;
                    publicationType?: {
                        [x: string]: unknown;
                        post?: boolean | undefined;
                        reply?: boolean | undefined;
                        vote?: boolean | undefined;
                        commentEdit?: boolean | undefined;
                        commentModeration?: boolean | undefined;
                        subplebbitEdit?: boolean | undefined;
                    } | undefined;
                }[] | undefined;
                description?: string | undefined;
                pendingApproval?: boolean | undefined;
            }[] | undefined;
            maxPendingApprovalCount?: number | undefined;
            purgeDisapprovedCommentsOlderThan?: number | undefined;
        } | undefined;
        roles?: Record<string, {
            [x: string]: unknown;
            role: string;
        } | undefined> | undefined;
    };
    author?: {
        [x: string]: unknown;
        address?: string | undefined;
        previousCommentCid?: string | undefined;
        displayName?: string | undefined;
        wallets?: Record<string, {
            address: string;
            timestamp: number;
            signature: {
                signature: string;
                type: string;
            };
        }> | undefined;
        avatar?: {
            [x: string]: unknown;
            chainTicker: string;
            address: string;
            id: string;
            timestamp: number;
            signature: {
                signature: string;
                type: string;
            };
        } | undefined;
        flair?: {
            [x: string]: unknown;
            text: string;
            backgroundColor?: string | undefined;
            textColor?: string | undefined;
            expiresAt?: number | undefined;
        } | undefined;
    } | undefined;
    protocolVersion?: string | undefined;
    timestamp?: number | undefined;
    challengeRequest?: {
        challengeAnswers?: string[] | undefined;
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
    commentModeration: {
        [x: string]: unknown;
        flair?: {
            [x: string]: unknown;
            text: string;
            backgroundColor?: string | undefined;
            textColor?: string | undefined;
            expiresAt?: number | undefined;
        } | undefined;
        spoiler?: boolean | undefined;
        nsfw?: boolean | undefined;
        pinned?: boolean | undefined;
        locked?: boolean | undefined;
        approved?: boolean | undefined;
        removed?: boolean | undefined;
        purged?: boolean | undefined;
        reason?: string | undefined;
        author?: {
            [x: string]: unknown;
            flair?: {
                [x: string]: unknown;
                text: string;
                backgroundColor?: string | undefined;
                textColor?: string | undefined;
                expiresAt?: number | undefined;
            } | undefined;
            banExpiresAt?: number | undefined;
        } | undefined;
    };
    commentCid: string;
    author?: {
        [x: string]: unknown;
        address?: string | undefined;
        previousCommentCid?: string | undefined;
        displayName?: string | undefined;
        wallets?: Record<string, {
            address: string;
            timestamp: number;
            signature: {
                signature: string;
                type: string;
            };
        }> | undefined;
        avatar?: {
            [x: string]: unknown;
            chainTicker: string;
            address: string;
            id: string;
            timestamp: number;
            signature: {
                signature: string;
                type: string;
            };
        } | undefined;
        flair?: {
            [x: string]: unknown;
            text: string;
            backgroundColor?: string | undefined;
            textColor?: string | undefined;
            expiresAt?: number | undefined;
        } | undefined;
    } | undefined;
    protocolVersion?: string | undefined;
    timestamp?: number | undefined;
    challengeRequest?: {
        challengeAnswers?: string[] | undefined;
        challengeCommentCids?: string[] | undefined;
    } | undefined;
};
export declare function parseCommentModerationPubsubMessagePublicationSchemaWithPlebbitErrorIfItFails(args: z.infer<typeof CommentModerationPubsubMessagePublicationSchema>): {
    timestamp: number;
    signature: {
        type: string;
        signature: string;
        publicKey: string;
        signedPropertyNames: string[];
    };
    subplebbitAddress: string;
    author: {
        [x: string]: unknown;
        address: string;
        previousCommentCid?: string | undefined;
        displayName?: string | undefined;
        wallets?: Record<string, {
            address: string;
            timestamp: number;
            signature: {
                signature: string;
                type: string;
            };
        }> | undefined;
        avatar?: {
            [x: string]: unknown;
            chainTicker: string;
            address: string;
            id: string;
            timestamp: number;
            signature: {
                signature: string;
                type: string;
            };
        } | undefined;
        flair?: {
            [x: string]: unknown;
            text: string;
            backgroundColor?: string | undefined;
            textColor?: string | undefined;
            expiresAt?: number | undefined;
        } | undefined;
    };
    protocolVersion: string;
    commentCid: string;
    commentModeration: {
        [x: string]: unknown;
        flair?: {
            [x: string]: unknown;
            text: string;
            backgroundColor?: string | undefined;
            textColor?: string | undefined;
            expiresAt?: number | undefined;
        } | undefined;
        spoiler?: boolean | undefined;
        nsfw?: boolean | undefined;
        pinned?: boolean | undefined;
        locked?: boolean | undefined;
        approved?: boolean | undefined;
        removed?: boolean | undefined;
        purged?: boolean | undefined;
        reason?: string | undefined;
        author?: {
            [x: string]: unknown;
            flair?: {
                [x: string]: unknown;
                text: string;
                backgroundColor?: string | undefined;
                textColor?: string | undefined;
                expiresAt?: number | undefined;
            } | undefined;
            banExpiresAt?: number | undefined;
        } | undefined;
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
    author?: {
        [x: string]: unknown;
        address?: string | undefined;
        previousCommentCid?: string | undefined;
        displayName?: string | undefined;
        wallets?: Record<string, {
            address: string;
            timestamp: number;
            signature: {
                signature: string;
                type: string;
            };
        }> | undefined;
        avatar?: {
            [x: string]: unknown;
            chainTicker: string;
            address: string;
            id: string;
            timestamp: number;
            signature: {
                signature: string;
                type: string;
            };
        } | undefined;
        flair?: {
            [x: string]: unknown;
            text: string;
            backgroundColor?: string | undefined;
            textColor?: string | undefined;
            expiresAt?: number | undefined;
        } | undefined;
    } | undefined;
    protocolVersion?: string | undefined;
    timestamp?: number | undefined;
    challengeRequest?: {
        challengeAnswers?: string[] | undefined;
        challengeCommentCids?: string[] | undefined;
    } | undefined;
};
export declare function parseVotePubsubMessagePublicationSchemaWithPlebbitErrorIfItFails(args: z.infer<typeof VotePubsubMessagePublicationSchema>): {
    timestamp: number;
    signature: {
        type: string;
        signature: string;
        publicKey: string;
        signedPropertyNames: string[];
    };
    subplebbitAddress: string;
    author: {
        [x: string]: unknown;
        address: string;
        previousCommentCid?: string | undefined;
        displayName?: string | undefined;
        wallets?: Record<string, {
            address: string;
            timestamp: number;
            signature: {
                signature: string;
                type: string;
            };
        }> | undefined;
        avatar?: {
            [x: string]: unknown;
            chainTicker: string;
            address: string;
            id: string;
            timestamp: number;
            signature: {
                signature: string;
                type: string;
            };
        } | undefined;
        flair?: {
            [x: string]: unknown;
            text: string;
            backgroundColor?: string | undefined;
            textColor?: string | undefined;
            expiresAt?: number | undefined;
        } | undefined;
    };
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
    author?: {
        [x: string]: unknown;
        address?: string | undefined;
        previousCommentCid?: string | undefined;
        displayName?: string | undefined;
        wallets?: Record<string, {
            address: string;
            timestamp: number;
            signature: {
                signature: string;
                type: string;
            };
        }> | undefined;
        avatar?: {
            [x: string]: unknown;
            chainTicker: string;
            address: string;
            id: string;
            timestamp: number;
            signature: {
                signature: string;
                type: string;
            };
        } | undefined;
        flair?: {
            [x: string]: unknown;
            text: string;
            backgroundColor?: string | undefined;
            textColor?: string | undefined;
            expiresAt?: number | undefined;
        } | undefined;
    } | undefined;
    protocolVersion?: string | undefined;
    timestamp?: number | undefined;
    challengeRequest?: {
        challengeAnswers?: string[] | undefined;
        challengeCommentCids?: string[] | undefined;
    } | undefined;
    content?: string | undefined;
    deleted?: boolean | undefined;
    flair?: {
        [x: string]: unknown;
        text: string;
        backgroundColor?: string | undefined;
        textColor?: string | undefined;
        expiresAt?: number | undefined;
    } | undefined;
    spoiler?: boolean | undefined;
    nsfw?: boolean | undefined;
    reason?: string | undefined;
};
export declare function parseCommentEditPubsubMessagePublicationSchemaWithPlebbitErrorIfItFails(args: z.infer<typeof CommentEditPubsubMessagePublicationSchema>): {
    timestamp: number;
    signature: {
        type: string;
        signature: string;
        publicKey: string;
        signedPropertyNames: string[];
    };
    subplebbitAddress: string;
    author: {
        address: string;
        previousCommentCid?: string | undefined;
        displayName?: string | undefined;
        wallets?: Record<string, {
            address: string;
            timestamp: number;
            signature: {
                signature: string;
                type: string;
            };
        }> | undefined;
        avatar?: {
            [x: string]: unknown;
            chainTicker: string;
            address: string;
            id: string;
            timestamp: number;
            signature: {
                signature: string;
                type: string;
            };
        } | undefined;
        flair?: {
            [x: string]: unknown;
            text: string;
            backgroundColor?: string | undefined;
            textColor?: string | undefined;
            expiresAt?: number | undefined;
        } | undefined;
    };
    protocolVersion: string;
    commentCid: string;
    flair?: {
        [x: string]: unknown;
        text: string;
        backgroundColor?: string | undefined;
        textColor?: string | undefined;
        expiresAt?: number | undefined;
    } | undefined;
    content?: string | undefined;
    deleted?: boolean | undefined;
    spoiler?: boolean | undefined;
    nsfw?: boolean | undefined;
    reason?: string | undefined;
};
export declare function parseCreateSubplebbitFunctionArgumentsSchemaWithPlebbitErrorIfItFails(args: z.infer<typeof CreateSubplebbitFunctionArgumentsSchema>): {
    [x: string]: unknown;
    challenges: {
        [x: string]: unknown;
        type: string;
        exclude?: {
            [x: string]: unknown;
            subplebbit?: {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            } | undefined;
            postScore?: number | undefined;
            replyScore?: number | undefined;
            firstCommentTimestamp?: number | undefined;
            challenges?: number[] | undefined;
            role?: string[] | undefined;
            address?: string[] | undefined;
            rateLimit?: number | undefined;
            rateLimitChallengeSuccess?: boolean | undefined;
            publicationType?: {
                [x: string]: unknown;
                post?: boolean | undefined;
                reply?: boolean | undefined;
                vote?: boolean | undefined;
                commentEdit?: boolean | undefined;
                commentModeration?: boolean | undefined;
                subplebbitEdit?: boolean | undefined;
            } | undefined;
        }[] | undefined;
        description?: string | undefined;
        challenge?: string | undefined;
        caseInsensitive?: boolean | undefined;
        pendingApproval?: boolean | undefined;
    }[];
    signature: {
        type: string;
        signature: string;
        publicKey: string;
        signedPropertyNames: string[];
    };
    encryption: {
        [x: string]: unknown;
        type: string;
        publicKey: string;
    };
    address: string;
    createdAt: number;
    updatedAt: number;
    statsCid: string;
    protocolVersion: string;
    posts?: {
        pages: Record<string, {
            comments: {
                comment: {
                    [x: string]: unknown;
                    timestamp: number;
                    signature: {
                        type: string;
                        signature: string;
                        publicKey: string;
                        signedPropertyNames: string[];
                    };
                    subplebbitAddress: string;
                    protocolVersion: string;
                    author: {
                        [x: string]: unknown;
                        address: string;
                        previousCommentCid?: string | undefined;
                        displayName?: string | undefined;
                        wallets?: Record<string, {
                            address: string;
                            timestamp: number;
                            signature: {
                                signature: string;
                                type: string;
                            };
                        }> | undefined;
                        avatar?: {
                            [x: string]: unknown;
                            chainTicker: string;
                            address: string;
                            id: string;
                            timestamp: number;
                            signature: {
                                signature: string;
                                type: string;
                            };
                        } | undefined;
                        flair?: {
                            [x: string]: unknown;
                            text: string;
                            backgroundColor?: string | undefined;
                            textColor?: string | undefined;
                            expiresAt?: number | undefined;
                        } | undefined;
                    };
                    depth: number;
                    flair?: {
                        [x: string]: unknown;
                        text: string;
                        backgroundColor?: string | undefined;
                        textColor?: string | undefined;
                        expiresAt?: number | undefined;
                    } | undefined;
                    content?: string | undefined;
                    spoiler?: boolean | undefined;
                    nsfw?: boolean | undefined;
                    link?: string | undefined;
                    title?: string | undefined;
                    linkWidth?: number | undefined;
                    linkHeight?: number | undefined;
                    linkHtmlTagName?: string | undefined;
                    parentCid?: string | undefined;
                    postCid?: string | undefined;
                    thumbnailUrl?: string | undefined;
                    thumbnailUrlWidth?: number | undefined;
                    thumbnailUrlHeight?: number | undefined;
                    previousCid?: string | undefined;
                };
                commentUpdate: {
                    [x: string]: unknown;
                    cid: string;
                    upvoteCount: number;
                    downvoteCount: number;
                    replyCount: number;
                    updatedAt: number;
                    signature: {
                        type: string;
                        signature: string;
                        publicKey: string;
                        signedPropertyNames: string[];
                    };
                    protocolVersion: string;
                    childCount?: number | undefined;
                    number?: number | undefined;
                    postNumber?: number | undefined;
                    edit?: {
                        [x: string]: unknown;
                        timestamp: number;
                        signature: {
                            type: string;
                            signature: string;
                            publicKey: string;
                            signedPropertyNames: string[];
                        };
                        subplebbitAddress: string;
                        protocolVersion: string;
                        commentCid: string;
                        author: {
                            [x: string]: unknown;
                            address: string;
                            previousCommentCid?: string | undefined;
                            displayName?: string | undefined;
                            wallets?: Record<string, {
                                address: string;
                                timestamp: number;
                                signature: {
                                    signature: string;
                                    type: string;
                                };
                            }> | undefined;
                            avatar?: {
                                [x: string]: unknown;
                                chainTicker: string;
                                address: string;
                                id: string;
                                timestamp: number;
                                signature: {
                                    signature: string;
                                    type: string;
                                };
                            } | undefined;
                            flair?: {
                                [x: string]: unknown;
                                text: string;
                                backgroundColor?: string | undefined;
                                textColor?: string | undefined;
                                expiresAt?: number | undefined;
                            } | undefined;
                        };
                        flair?: {
                            [x: string]: unknown;
                            text: string;
                            backgroundColor?: string | undefined;
                            textColor?: string | undefined;
                            expiresAt?: number | undefined;
                        } | undefined;
                        content?: string | undefined;
                        deleted?: boolean | undefined;
                        spoiler?: boolean | undefined;
                        nsfw?: boolean | undefined;
                        reason?: string | undefined;
                    } | undefined;
                    flair?: {
                        [x: string]: unknown;
                        text: string;
                        backgroundColor?: string | undefined;
                        textColor?: string | undefined;
                        expiresAt?: number | undefined;
                    } | undefined;
                    spoiler?: boolean | undefined;
                    nsfw?: boolean | undefined;
                    pinned?: boolean | undefined;
                    locked?: boolean | undefined;
                    removed?: boolean | undefined;
                    reason?: string | undefined;
                    approved?: boolean | undefined;
                    author?: {
                        [x: string]: unknown;
                        subplebbit?: {
                            [x: string]: unknown;
                            postScore: number;
                            replyScore: number;
                            firstCommentTimestamp: number;
                            lastCommentCid: string;
                            banExpiresAt?: number | undefined;
                            flair?: {
                                [x: string]: unknown;
                                text: string;
                                backgroundColor?: string | undefined;
                                textColor?: string | undefined;
                                expiresAt?: number | undefined;
                            } | undefined;
                        } | undefined;
                    } | undefined;
                    lastChildCid?: string | undefined;
                    lastReplyTimestamp?: number | undefined;
                    replies?: {
                        pages: Record<string, /*elided*/ any>;
                        pageCids?: Record<string, string> | undefined;
                    } | undefined;
                };
            }[];
            nextCid?: string | undefined;
        }>;
        pageCids?: Record<string, string> | undefined;
    } | undefined;
    modQueue?: {
        pageCids: Record<string, string>;
    } | undefined;
    pubsubTopic?: string | undefined;
    postUpdates?: Record<string, string> | undefined;
    title?: string | undefined;
    description?: string | undefined;
    roles?: Record<string, {
        [x: string]: unknown;
        role: string;
    }> | undefined;
    rules?: string[] | undefined;
    lastPostCid?: string | undefined;
    lastCommentCid?: string | undefined;
    features?: {
        [x: string]: unknown;
        noVideos?: boolean | undefined;
        noSpoilers?: boolean | undefined;
        noImages?: boolean | undefined;
        noVideoReplies?: boolean | undefined;
        noSpoilerReplies?: boolean | undefined;
        noImageReplies?: boolean | undefined;
        noPolls?: boolean | undefined;
        noCrossposts?: boolean | undefined;
        noAuthors?: boolean | undefined;
        anonymousAuthors?: boolean | undefined;
        noNestedReplies?: boolean | undefined;
        safeForWork?: boolean | undefined;
        authorFlairs?: boolean | undefined;
        requireAuthorFlairs?: boolean | undefined;
        postFlairs?: boolean | undefined;
        requirePostFlairs?: boolean | undefined;
        noMarkdownImages?: boolean | undefined;
        noMarkdownVideos?: boolean | undefined;
        markdownImageReplies?: boolean | undefined;
        markdownVideoReplies?: boolean | undefined;
        noPostUpvotes?: boolean | undefined;
        noReplyUpvotes?: boolean | undefined;
        noPostDownvotes?: boolean | undefined;
        noReplyDownvotes?: boolean | undefined;
        noUpvotes?: boolean | undefined;
        noDownvotes?: boolean | undefined;
        requirePostLink?: boolean | undefined;
        requirePostLinkIsMedia?: boolean | undefined;
        pseudonymityMode?: "per-post" | "per-reply" | "per-author" | undefined;
    } | undefined;
    suggested?: {
        [x: string]: unknown;
        primaryColor?: string | undefined;
        secondaryColor?: string | undefined;
        avatarUrl?: string | undefined;
        bannerUrl?: string | undefined;
        backgroundUrl?: string | undefined;
        language?: string | undefined;
    } | undefined;
    flairs?: Record<string, {
        [x: string]: unknown;
        text: string;
        backgroundColor?: string | undefined;
        textColor?: string | undefined;
        expiresAt?: number | undefined;
    }[]> | undefined;
} | {
    title?: string | undefined;
    description?: string | undefined;
    pubsubTopic?: string | undefined;
    rules?: string[] | undefined;
    features?: {
        [x: string]: unknown;
        noVideos?: boolean | undefined;
        noSpoilers?: boolean | undefined;
        noImages?: boolean | undefined;
        noVideoReplies?: boolean | undefined;
        noSpoilerReplies?: boolean | undefined;
        noImageReplies?: boolean | undefined;
        noPolls?: boolean | undefined;
        noCrossposts?: boolean | undefined;
        noAuthors?: boolean | undefined;
        anonymousAuthors?: boolean | undefined;
        noNestedReplies?: boolean | undefined;
        safeForWork?: boolean | undefined;
        authorFlairs?: boolean | undefined;
        requireAuthorFlairs?: boolean | undefined;
        postFlairs?: boolean | undefined;
        requirePostFlairs?: boolean | undefined;
        noMarkdownImages?: boolean | undefined;
        noMarkdownVideos?: boolean | undefined;
        markdownImageReplies?: boolean | undefined;
        markdownVideoReplies?: boolean | undefined;
        noPostUpvotes?: boolean | undefined;
        noReplyUpvotes?: boolean | undefined;
        noPostDownvotes?: boolean | undefined;
        noReplyDownvotes?: boolean | undefined;
        noUpvotes?: boolean | undefined;
        noDownvotes?: boolean | undefined;
        requirePostLink?: boolean | undefined;
        requirePostLinkIsMedia?: boolean | undefined;
        pseudonymityMode?: "per-post" | "per-reply" | "per-author" | undefined;
    } | undefined;
    suggested?: {
        [x: string]: unknown;
        primaryColor?: string | undefined;
        secondaryColor?: string | undefined;
        avatarUrl?: string | undefined;
        bannerUrl?: string | undefined;
        backgroundUrl?: string | undefined;
        language?: string | undefined;
    } | undefined;
    flairs?: Record<string, {
        [x: string]: unknown;
        text: string;
        backgroundColor?: string | undefined;
        textColor?: string | undefined;
        expiresAt?: number | undefined;
    }[]> | undefined;
    settings?: {
        fetchThumbnailUrls?: boolean | undefined;
        fetchThumbnailUrlsProxyUrl?: string | undefined;
        challenges?: {
            path?: string | undefined;
            name?: string | undefined;
            options?: Record<string, string> | undefined;
            exclude?: {
                [x: string]: unknown;
                subplebbit?: {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                } | undefined;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
                challenges?: number[] | undefined;
                role?: string[] | undefined;
                address?: string[] | undefined;
                rateLimit?: number | undefined;
                rateLimitChallengeSuccess?: boolean | undefined;
                publicationType?: {
                    [x: string]: unknown;
                    post?: boolean | undefined;
                    reply?: boolean | undefined;
                    vote?: boolean | undefined;
                    commentEdit?: boolean | undefined;
                    commentModeration?: boolean | undefined;
                    subplebbitEdit?: boolean | undefined;
                } | undefined;
            }[] | undefined;
            description?: string | undefined;
            pendingApproval?: boolean | undefined;
        }[] | undefined;
        maxPendingApprovalCount?: number | undefined;
        purgeDisapprovedCommentsOlderThan?: number | undefined;
    } | undefined;
    signer?: {
        type: "ed25519";
        privateKey: string;
    } | undefined;
    roles?: Record<string, {
        [x: string]: unknown;
        role: string;
    }> | undefined;
} | {
    address: string;
    modQueue?: {
        pageCids: Record<string, string>;
    } | undefined;
    challenges?: {
        [x: string]: unknown;
        type: string;
        exclude?: {
            [x: string]: unknown;
            subplebbit?: {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            } | undefined;
            postScore?: number | undefined;
            replyScore?: number | undefined;
            firstCommentTimestamp?: number | undefined;
            challenges?: number[] | undefined;
            role?: string[] | undefined;
            address?: string[] | undefined;
            rateLimit?: number | undefined;
            rateLimitChallengeSuccess?: boolean | undefined;
            publicationType?: {
                [x: string]: unknown;
                post?: boolean | undefined;
                reply?: boolean | undefined;
                vote?: boolean | undefined;
                commentEdit?: boolean | undefined;
                commentModeration?: boolean | undefined;
                subplebbitEdit?: boolean | undefined;
            } | undefined;
        }[] | undefined;
        description?: string | undefined;
        challenge?: string | undefined;
        caseInsensitive?: boolean | undefined;
        pendingApproval?: boolean | undefined;
    }[] | undefined;
    signature?: {
        type: string;
        signature: string;
        publicKey: string;
        signedPropertyNames: string[];
    } | undefined;
    encryption?: {
        [x: string]: unknown;
        type: string;
        publicKey: string;
    } | undefined;
    createdAt?: number | undefined;
    updatedAt?: number | undefined;
    pubsubTopic?: string | undefined;
    statsCid?: string | undefined;
    protocolVersion?: string | undefined;
    postUpdates?: Record<string, string> | undefined;
    title?: string | undefined;
    description?: string | undefined;
    roles?: Record<string, {
        [x: string]: unknown;
        role: string;
    }> | undefined;
    rules?: string[] | undefined;
    lastPostCid?: string | undefined;
    lastCommentCid?: string | undefined;
    features?: {
        [x: string]: unknown;
        noVideos?: boolean | undefined;
        noSpoilers?: boolean | undefined;
        noImages?: boolean | undefined;
        noVideoReplies?: boolean | undefined;
        noSpoilerReplies?: boolean | undefined;
        noImageReplies?: boolean | undefined;
        noPolls?: boolean | undefined;
        noCrossposts?: boolean | undefined;
        noAuthors?: boolean | undefined;
        anonymousAuthors?: boolean | undefined;
        noNestedReplies?: boolean | undefined;
        safeForWork?: boolean | undefined;
        authorFlairs?: boolean | undefined;
        requireAuthorFlairs?: boolean | undefined;
        postFlairs?: boolean | undefined;
        requirePostFlairs?: boolean | undefined;
        noMarkdownImages?: boolean | undefined;
        noMarkdownVideos?: boolean | undefined;
        markdownImageReplies?: boolean | undefined;
        markdownVideoReplies?: boolean | undefined;
        noPostUpvotes?: boolean | undefined;
        noReplyUpvotes?: boolean | undefined;
        noPostDownvotes?: boolean | undefined;
        noReplyDownvotes?: boolean | undefined;
        noUpvotes?: boolean | undefined;
        noDownvotes?: boolean | undefined;
        requirePostLink?: boolean | undefined;
        requirePostLinkIsMedia?: boolean | undefined;
        pseudonymityMode?: "per-post" | "per-reply" | "per-author" | undefined;
    } | undefined;
    suggested?: {
        [x: string]: unknown;
        primaryColor?: string | undefined;
        secondaryColor?: string | undefined;
        avatarUrl?: string | undefined;
        bannerUrl?: string | undefined;
        backgroundUrl?: string | undefined;
        language?: string | undefined;
    } | undefined;
    flairs?: Record<string, {
        [x: string]: unknown;
        text: string;
        backgroundColor?: string | undefined;
        textColor?: string | undefined;
        expiresAt?: number | undefined;
    }[]> | undefined;
    posts?: {
        pages: Record<string, {
            comments: {
                comment: {
                    [x: string]: unknown;
                    timestamp: number;
                    signature: {
                        type: string;
                        signature: string;
                        publicKey: string;
                        signedPropertyNames: string[];
                    };
                    subplebbitAddress: string;
                    protocolVersion: string;
                    author: {
                        [x: string]: unknown;
                        address: string;
                        previousCommentCid?: string | undefined;
                        displayName?: string | undefined;
                        wallets?: Record<string, {
                            address: string;
                            timestamp: number;
                            signature: {
                                signature: string;
                                type: string;
                            };
                        }> | undefined;
                        avatar?: {
                            [x: string]: unknown;
                            chainTicker: string;
                            address: string;
                            id: string;
                            timestamp: number;
                            signature: {
                                signature: string;
                                type: string;
                            };
                        } | undefined;
                        flair?: {
                            [x: string]: unknown;
                            text: string;
                            backgroundColor?: string | undefined;
                            textColor?: string | undefined;
                            expiresAt?: number | undefined;
                        } | undefined;
                    };
                    depth: number;
                    flair?: {
                        [x: string]: unknown;
                        text: string;
                        backgroundColor?: string | undefined;
                        textColor?: string | undefined;
                        expiresAt?: number | undefined;
                    } | undefined;
                    content?: string | undefined;
                    spoiler?: boolean | undefined;
                    nsfw?: boolean | undefined;
                    link?: string | undefined;
                    title?: string | undefined;
                    linkWidth?: number | undefined;
                    linkHeight?: number | undefined;
                    linkHtmlTagName?: string | undefined;
                    parentCid?: string | undefined;
                    postCid?: string | undefined;
                    thumbnailUrl?: string | undefined;
                    thumbnailUrlWidth?: number | undefined;
                    thumbnailUrlHeight?: number | undefined;
                    previousCid?: string | undefined;
                };
                commentUpdate: {
                    [x: string]: unknown;
                    cid: string;
                    upvoteCount: number;
                    downvoteCount: number;
                    replyCount: number;
                    updatedAt: number;
                    signature: {
                        type: string;
                        signature: string;
                        publicKey: string;
                        signedPropertyNames: string[];
                    };
                    protocolVersion: string;
                    childCount?: number | undefined;
                    number?: number | undefined;
                    postNumber?: number | undefined;
                    edit?: {
                        [x: string]: unknown;
                        timestamp: number;
                        signature: {
                            type: string;
                            signature: string;
                            publicKey: string;
                            signedPropertyNames: string[];
                        };
                        subplebbitAddress: string;
                        protocolVersion: string;
                        commentCid: string;
                        author: {
                            [x: string]: unknown;
                            address: string;
                            previousCommentCid?: string | undefined;
                            displayName?: string | undefined;
                            wallets?: Record<string, {
                                address: string;
                                timestamp: number;
                                signature: {
                                    signature: string;
                                    type: string;
                                };
                            }> | undefined;
                            avatar?: {
                                [x: string]: unknown;
                                chainTicker: string;
                                address: string;
                                id: string;
                                timestamp: number;
                                signature: {
                                    signature: string;
                                    type: string;
                                };
                            } | undefined;
                            flair?: {
                                [x: string]: unknown;
                                text: string;
                                backgroundColor?: string | undefined;
                                textColor?: string | undefined;
                                expiresAt?: number | undefined;
                            } | undefined;
                        };
                        flair?: {
                            [x: string]: unknown;
                            text: string;
                            backgroundColor?: string | undefined;
                            textColor?: string | undefined;
                            expiresAt?: number | undefined;
                        } | undefined;
                        content?: string | undefined;
                        deleted?: boolean | undefined;
                        spoiler?: boolean | undefined;
                        nsfw?: boolean | undefined;
                        reason?: string | undefined;
                    } | undefined;
                    flair?: {
                        [x: string]: unknown;
                        text: string;
                        backgroundColor?: string | undefined;
                        textColor?: string | undefined;
                        expiresAt?: number | undefined;
                    } | undefined;
                    spoiler?: boolean | undefined;
                    nsfw?: boolean | undefined;
                    pinned?: boolean | undefined;
                    locked?: boolean | undefined;
                    removed?: boolean | undefined;
                    reason?: string | undefined;
                    approved?: boolean | undefined;
                    author?: {
                        [x: string]: unknown;
                        subplebbit?: {
                            [x: string]: unknown;
                            postScore: number;
                            replyScore: number;
                            firstCommentTimestamp: number;
                            lastCommentCid: string;
                            banExpiresAt?: number | undefined;
                            flair?: {
                                [x: string]: unknown;
                                text: string;
                                backgroundColor?: string | undefined;
                                textColor?: string | undefined;
                                expiresAt?: number | undefined;
                            } | undefined;
                        } | undefined;
                    } | undefined;
                    lastChildCid?: string | undefined;
                    lastReplyTimestamp?: number | undefined;
                    replies?: {
                        pages: Record<string, /*elided*/ any>;
                        pageCids?: Record<string, string> | undefined;
                    } | undefined;
                };
            }[];
            nextCid?: string | undefined;
        }>;
        pageCids?: Record<string, string> | undefined;
    } | {
        pageCids?: Record<string, string> | undefined;
    } | undefined;
    updateCid?: string | undefined;
};
export declare function parsePlebbitUserOptionsSchemaWithPlebbitErrorIfItFails(args: any): z.infer<typeof PlebbitUserOptionsSchema>;
export declare function parseCreateRpcSubplebbitFunctionArgumentSchemaWithPlebbitErrorIfItFails(args: z.infer<typeof CreateRpcSubplebbitFunctionArgumentSchema>): {
    [x: string]: unknown;
    challenges: {
        [x: string]: unknown;
        type: string;
        exclude?: {
            [x: string]: unknown;
            subplebbit?: {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            } | undefined;
            postScore?: number | undefined;
            replyScore?: number | undefined;
            firstCommentTimestamp?: number | undefined;
            challenges?: number[] | undefined;
            role?: string[] | undefined;
            address?: string[] | undefined;
            rateLimit?: number | undefined;
            rateLimitChallengeSuccess?: boolean | undefined;
            publicationType?: {
                [x: string]: unknown;
                post?: boolean | undefined;
                reply?: boolean | undefined;
                vote?: boolean | undefined;
                commentEdit?: boolean | undefined;
                commentModeration?: boolean | undefined;
                subplebbitEdit?: boolean | undefined;
            } | undefined;
        }[] | undefined;
        description?: string | undefined;
        challenge?: string | undefined;
        caseInsensitive?: boolean | undefined;
        pendingApproval?: boolean | undefined;
    }[];
    signature: {
        type: string;
        signature: string;
        publicKey: string;
        signedPropertyNames: string[];
    };
    encryption: {
        [x: string]: unknown;
        type: string;
        publicKey: string;
    };
    address: string;
    createdAt: number;
    updatedAt: number;
    statsCid: string;
    protocolVersion: string;
    posts?: {
        pages: Record<string, {
            comments: {
                comment: {
                    [x: string]: unknown;
                    timestamp: number;
                    signature: {
                        type: string;
                        signature: string;
                        publicKey: string;
                        signedPropertyNames: string[];
                    };
                    subplebbitAddress: string;
                    protocolVersion: string;
                    author: {
                        [x: string]: unknown;
                        address: string;
                        previousCommentCid?: string | undefined;
                        displayName?: string | undefined;
                        wallets?: Record<string, {
                            address: string;
                            timestamp: number;
                            signature: {
                                signature: string;
                                type: string;
                            };
                        }> | undefined;
                        avatar?: {
                            [x: string]: unknown;
                            chainTicker: string;
                            address: string;
                            id: string;
                            timestamp: number;
                            signature: {
                                signature: string;
                                type: string;
                            };
                        } | undefined;
                        flair?: {
                            [x: string]: unknown;
                            text: string;
                            backgroundColor?: string | undefined;
                            textColor?: string | undefined;
                            expiresAt?: number | undefined;
                        } | undefined;
                    };
                    depth: number;
                    flair?: {
                        [x: string]: unknown;
                        text: string;
                        backgroundColor?: string | undefined;
                        textColor?: string | undefined;
                        expiresAt?: number | undefined;
                    } | undefined;
                    content?: string | undefined;
                    spoiler?: boolean | undefined;
                    nsfw?: boolean | undefined;
                    link?: string | undefined;
                    title?: string | undefined;
                    linkWidth?: number | undefined;
                    linkHeight?: number | undefined;
                    linkHtmlTagName?: string | undefined;
                    parentCid?: string | undefined;
                    postCid?: string | undefined;
                    thumbnailUrl?: string | undefined;
                    thumbnailUrlWidth?: number | undefined;
                    thumbnailUrlHeight?: number | undefined;
                    previousCid?: string | undefined;
                };
                commentUpdate: {
                    [x: string]: unknown;
                    cid: string;
                    upvoteCount: number;
                    downvoteCount: number;
                    replyCount: number;
                    updatedAt: number;
                    signature: {
                        type: string;
                        signature: string;
                        publicKey: string;
                        signedPropertyNames: string[];
                    };
                    protocolVersion: string;
                    childCount?: number | undefined;
                    number?: number | undefined;
                    postNumber?: number | undefined;
                    edit?: {
                        [x: string]: unknown;
                        timestamp: number;
                        signature: {
                            type: string;
                            signature: string;
                            publicKey: string;
                            signedPropertyNames: string[];
                        };
                        subplebbitAddress: string;
                        protocolVersion: string;
                        commentCid: string;
                        author: {
                            [x: string]: unknown;
                            address: string;
                            previousCommentCid?: string | undefined;
                            displayName?: string | undefined;
                            wallets?: Record<string, {
                                address: string;
                                timestamp: number;
                                signature: {
                                    signature: string;
                                    type: string;
                                };
                            }> | undefined;
                            avatar?: {
                                [x: string]: unknown;
                                chainTicker: string;
                                address: string;
                                id: string;
                                timestamp: number;
                                signature: {
                                    signature: string;
                                    type: string;
                                };
                            } | undefined;
                            flair?: {
                                [x: string]: unknown;
                                text: string;
                                backgroundColor?: string | undefined;
                                textColor?: string | undefined;
                                expiresAt?: number | undefined;
                            } | undefined;
                        };
                        flair?: {
                            [x: string]: unknown;
                            text: string;
                            backgroundColor?: string | undefined;
                            textColor?: string | undefined;
                            expiresAt?: number | undefined;
                        } | undefined;
                        content?: string | undefined;
                        deleted?: boolean | undefined;
                        spoiler?: boolean | undefined;
                        nsfw?: boolean | undefined;
                        reason?: string | undefined;
                    } | undefined;
                    flair?: {
                        [x: string]: unknown;
                        text: string;
                        backgroundColor?: string | undefined;
                        textColor?: string | undefined;
                        expiresAt?: number | undefined;
                    } | undefined;
                    spoiler?: boolean | undefined;
                    nsfw?: boolean | undefined;
                    pinned?: boolean | undefined;
                    locked?: boolean | undefined;
                    removed?: boolean | undefined;
                    reason?: string | undefined;
                    approved?: boolean | undefined;
                    author?: {
                        [x: string]: unknown;
                        subplebbit?: {
                            [x: string]: unknown;
                            postScore: number;
                            replyScore: number;
                            firstCommentTimestamp: number;
                            lastCommentCid: string;
                            banExpiresAt?: number | undefined;
                            flair?: {
                                [x: string]: unknown;
                                text: string;
                                backgroundColor?: string | undefined;
                                textColor?: string | undefined;
                                expiresAt?: number | undefined;
                            } | undefined;
                        } | undefined;
                    } | undefined;
                    lastChildCid?: string | undefined;
                    lastReplyTimestamp?: number | undefined;
                    replies?: {
                        pages: Record<string, /*elided*/ any>;
                        pageCids?: Record<string, string> | undefined;
                    } | undefined;
                };
            }[];
            nextCid?: string | undefined;
        }>;
        pageCids?: Record<string, string> | undefined;
    } | undefined;
    modQueue?: {
        pageCids: Record<string, string>;
    } | undefined;
    pubsubTopic?: string | undefined;
    postUpdates?: Record<string, string> | undefined;
    title?: string | undefined;
    description?: string | undefined;
    roles?: Record<string, {
        [x: string]: unknown;
        role: string;
    }> | undefined;
    rules?: string[] | undefined;
    lastPostCid?: string | undefined;
    lastCommentCid?: string | undefined;
    features?: {
        [x: string]: unknown;
        noVideos?: boolean | undefined;
        noSpoilers?: boolean | undefined;
        noImages?: boolean | undefined;
        noVideoReplies?: boolean | undefined;
        noSpoilerReplies?: boolean | undefined;
        noImageReplies?: boolean | undefined;
        noPolls?: boolean | undefined;
        noCrossposts?: boolean | undefined;
        noAuthors?: boolean | undefined;
        anonymousAuthors?: boolean | undefined;
        noNestedReplies?: boolean | undefined;
        safeForWork?: boolean | undefined;
        authorFlairs?: boolean | undefined;
        requireAuthorFlairs?: boolean | undefined;
        postFlairs?: boolean | undefined;
        requirePostFlairs?: boolean | undefined;
        noMarkdownImages?: boolean | undefined;
        noMarkdownVideos?: boolean | undefined;
        markdownImageReplies?: boolean | undefined;
        markdownVideoReplies?: boolean | undefined;
        noPostUpvotes?: boolean | undefined;
        noReplyUpvotes?: boolean | undefined;
        noPostDownvotes?: boolean | undefined;
        noReplyDownvotes?: boolean | undefined;
        noUpvotes?: boolean | undefined;
        noDownvotes?: boolean | undefined;
        requirePostLink?: boolean | undefined;
        requirePostLinkIsMedia?: boolean | undefined;
        pseudonymityMode?: "per-post" | "per-reply" | "per-author" | undefined;
    } | undefined;
    suggested?: {
        [x: string]: unknown;
        primaryColor?: string | undefined;
        secondaryColor?: string | undefined;
        avatarUrl?: string | undefined;
        bannerUrl?: string | undefined;
        backgroundUrl?: string | undefined;
        language?: string | undefined;
    } | undefined;
    flairs?: Record<string, {
        [x: string]: unknown;
        text: string;
        backgroundColor?: string | undefined;
        textColor?: string | undefined;
        expiresAt?: number | undefined;
    }[]> | undefined;
} | {
    title?: string | undefined;
    description?: string | undefined;
    pubsubTopic?: string | undefined;
    rules?: string[] | undefined;
    features?: {
        [x: string]: unknown;
        noVideos?: boolean | undefined;
        noSpoilers?: boolean | undefined;
        noImages?: boolean | undefined;
        noVideoReplies?: boolean | undefined;
        noSpoilerReplies?: boolean | undefined;
        noImageReplies?: boolean | undefined;
        noPolls?: boolean | undefined;
        noCrossposts?: boolean | undefined;
        noAuthors?: boolean | undefined;
        anonymousAuthors?: boolean | undefined;
        noNestedReplies?: boolean | undefined;
        safeForWork?: boolean | undefined;
        authorFlairs?: boolean | undefined;
        requireAuthorFlairs?: boolean | undefined;
        postFlairs?: boolean | undefined;
        requirePostFlairs?: boolean | undefined;
        noMarkdownImages?: boolean | undefined;
        noMarkdownVideos?: boolean | undefined;
        markdownImageReplies?: boolean | undefined;
        markdownVideoReplies?: boolean | undefined;
        noPostUpvotes?: boolean | undefined;
        noReplyUpvotes?: boolean | undefined;
        noPostDownvotes?: boolean | undefined;
        noReplyDownvotes?: boolean | undefined;
        noUpvotes?: boolean | undefined;
        noDownvotes?: boolean | undefined;
        requirePostLink?: boolean | undefined;
        requirePostLinkIsMedia?: boolean | undefined;
        pseudonymityMode?: "per-post" | "per-reply" | "per-author" | undefined;
    } | undefined;
    suggested?: {
        [x: string]: unknown;
        primaryColor?: string | undefined;
        secondaryColor?: string | undefined;
        avatarUrl?: string | undefined;
        bannerUrl?: string | undefined;
        backgroundUrl?: string | undefined;
        language?: string | undefined;
    } | undefined;
    flairs?: Record<string, {
        [x: string]: unknown;
        text: string;
        backgroundColor?: string | undefined;
        textColor?: string | undefined;
        expiresAt?: number | undefined;
    }[]> | undefined;
    settings?: {
        fetchThumbnailUrls?: boolean | undefined;
        fetchThumbnailUrlsProxyUrl?: string | undefined;
        challenges?: {
            path?: string | undefined;
            name?: string | undefined;
            options?: Record<string, string> | undefined;
            exclude?: {
                [x: string]: unknown;
                subplebbit?: {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                } | undefined;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
                challenges?: number[] | undefined;
                role?: string[] | undefined;
                address?: string[] | undefined;
                rateLimit?: number | undefined;
                rateLimitChallengeSuccess?: boolean | undefined;
                publicationType?: {
                    [x: string]: unknown;
                    post?: boolean | undefined;
                    reply?: boolean | undefined;
                    vote?: boolean | undefined;
                    commentEdit?: boolean | undefined;
                    commentModeration?: boolean | undefined;
                    subplebbitEdit?: boolean | undefined;
                } | undefined;
            }[] | undefined;
            description?: string | undefined;
            pendingApproval?: boolean | undefined;
        }[] | undefined;
        maxPendingApprovalCount?: number | undefined;
        purgeDisapprovedCommentsOlderThan?: number | undefined;
    } | undefined;
    signer?: {
        type: "ed25519";
        privateKey: string;
    } | undefined;
    roles?: Record<string, {
        [x: string]: unknown;
        role: string;
    }> | undefined;
} | {
    address: string;
    modQueue?: {
        pageCids: Record<string, string>;
    } | undefined;
    challenges?: {
        [x: string]: unknown;
        type: string;
        exclude?: {
            [x: string]: unknown;
            subplebbit?: {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            } | undefined;
            postScore?: number | undefined;
            replyScore?: number | undefined;
            firstCommentTimestamp?: number | undefined;
            challenges?: number[] | undefined;
            role?: string[] | undefined;
            address?: string[] | undefined;
            rateLimit?: number | undefined;
            rateLimitChallengeSuccess?: boolean | undefined;
            publicationType?: {
                [x: string]: unknown;
                post?: boolean | undefined;
                reply?: boolean | undefined;
                vote?: boolean | undefined;
                commentEdit?: boolean | undefined;
                commentModeration?: boolean | undefined;
                subplebbitEdit?: boolean | undefined;
            } | undefined;
        }[] | undefined;
        description?: string | undefined;
        challenge?: string | undefined;
        caseInsensitive?: boolean | undefined;
        pendingApproval?: boolean | undefined;
    }[] | undefined;
    signature?: {
        type: string;
        signature: string;
        publicKey: string;
        signedPropertyNames: string[];
    } | undefined;
    encryption?: {
        [x: string]: unknown;
        type: string;
        publicKey: string;
    } | undefined;
    createdAt?: number | undefined;
    updatedAt?: number | undefined;
    pubsubTopic?: string | undefined;
    statsCid?: string | undefined;
    protocolVersion?: string | undefined;
    postUpdates?: Record<string, string> | undefined;
    title?: string | undefined;
    description?: string | undefined;
    roles?: Record<string, {
        [x: string]: unknown;
        role: string;
    }> | undefined;
    rules?: string[] | undefined;
    lastPostCid?: string | undefined;
    lastCommentCid?: string | undefined;
    features?: {
        [x: string]: unknown;
        noVideos?: boolean | undefined;
        noSpoilers?: boolean | undefined;
        noImages?: boolean | undefined;
        noVideoReplies?: boolean | undefined;
        noSpoilerReplies?: boolean | undefined;
        noImageReplies?: boolean | undefined;
        noPolls?: boolean | undefined;
        noCrossposts?: boolean | undefined;
        noAuthors?: boolean | undefined;
        anonymousAuthors?: boolean | undefined;
        noNestedReplies?: boolean | undefined;
        safeForWork?: boolean | undefined;
        authorFlairs?: boolean | undefined;
        requireAuthorFlairs?: boolean | undefined;
        postFlairs?: boolean | undefined;
        requirePostFlairs?: boolean | undefined;
        noMarkdownImages?: boolean | undefined;
        noMarkdownVideos?: boolean | undefined;
        markdownImageReplies?: boolean | undefined;
        markdownVideoReplies?: boolean | undefined;
        noPostUpvotes?: boolean | undefined;
        noReplyUpvotes?: boolean | undefined;
        noPostDownvotes?: boolean | undefined;
        noReplyDownvotes?: boolean | undefined;
        noUpvotes?: boolean | undefined;
        noDownvotes?: boolean | undefined;
        requirePostLink?: boolean | undefined;
        requirePostLinkIsMedia?: boolean | undefined;
        pseudonymityMode?: "per-post" | "per-reply" | "per-author" | undefined;
    } | undefined;
    suggested?: {
        [x: string]: unknown;
        primaryColor?: string | undefined;
        secondaryColor?: string | undefined;
        avatarUrl?: string | undefined;
        bannerUrl?: string | undefined;
        backgroundUrl?: string | undefined;
        language?: string | undefined;
    } | undefined;
    flairs?: Record<string, {
        [x: string]: unknown;
        text: string;
        backgroundColor?: string | undefined;
        textColor?: string | undefined;
        expiresAt?: number | undefined;
    }[]> | undefined;
    posts?: {
        pages: Record<string, {
            comments: {
                comment: {
                    [x: string]: unknown;
                    timestamp: number;
                    signature: {
                        type: string;
                        signature: string;
                        publicKey: string;
                        signedPropertyNames: string[];
                    };
                    subplebbitAddress: string;
                    protocolVersion: string;
                    author: {
                        [x: string]: unknown;
                        address: string;
                        previousCommentCid?: string | undefined;
                        displayName?: string | undefined;
                        wallets?: Record<string, {
                            address: string;
                            timestamp: number;
                            signature: {
                                signature: string;
                                type: string;
                            };
                        }> | undefined;
                        avatar?: {
                            [x: string]: unknown;
                            chainTicker: string;
                            address: string;
                            id: string;
                            timestamp: number;
                            signature: {
                                signature: string;
                                type: string;
                            };
                        } | undefined;
                        flair?: {
                            [x: string]: unknown;
                            text: string;
                            backgroundColor?: string | undefined;
                            textColor?: string | undefined;
                            expiresAt?: number | undefined;
                        } | undefined;
                    };
                    depth: number;
                    flair?: {
                        [x: string]: unknown;
                        text: string;
                        backgroundColor?: string | undefined;
                        textColor?: string | undefined;
                        expiresAt?: number | undefined;
                    } | undefined;
                    content?: string | undefined;
                    spoiler?: boolean | undefined;
                    nsfw?: boolean | undefined;
                    link?: string | undefined;
                    title?: string | undefined;
                    linkWidth?: number | undefined;
                    linkHeight?: number | undefined;
                    linkHtmlTagName?: string | undefined;
                    parentCid?: string | undefined;
                    postCid?: string | undefined;
                    thumbnailUrl?: string | undefined;
                    thumbnailUrlWidth?: number | undefined;
                    thumbnailUrlHeight?: number | undefined;
                    previousCid?: string | undefined;
                };
                commentUpdate: {
                    [x: string]: unknown;
                    cid: string;
                    upvoteCount: number;
                    downvoteCount: number;
                    replyCount: number;
                    updatedAt: number;
                    signature: {
                        type: string;
                        signature: string;
                        publicKey: string;
                        signedPropertyNames: string[];
                    };
                    protocolVersion: string;
                    childCount?: number | undefined;
                    number?: number | undefined;
                    postNumber?: number | undefined;
                    edit?: {
                        [x: string]: unknown;
                        timestamp: number;
                        signature: {
                            type: string;
                            signature: string;
                            publicKey: string;
                            signedPropertyNames: string[];
                        };
                        subplebbitAddress: string;
                        protocolVersion: string;
                        commentCid: string;
                        author: {
                            [x: string]: unknown;
                            address: string;
                            previousCommentCid?: string | undefined;
                            displayName?: string | undefined;
                            wallets?: Record<string, {
                                address: string;
                                timestamp: number;
                                signature: {
                                    signature: string;
                                    type: string;
                                };
                            }> | undefined;
                            avatar?: {
                                [x: string]: unknown;
                                chainTicker: string;
                                address: string;
                                id: string;
                                timestamp: number;
                                signature: {
                                    signature: string;
                                    type: string;
                                };
                            } | undefined;
                            flair?: {
                                [x: string]: unknown;
                                text: string;
                                backgroundColor?: string | undefined;
                                textColor?: string | undefined;
                                expiresAt?: number | undefined;
                            } | undefined;
                        };
                        flair?: {
                            [x: string]: unknown;
                            text: string;
                            backgroundColor?: string | undefined;
                            textColor?: string | undefined;
                            expiresAt?: number | undefined;
                        } | undefined;
                        content?: string | undefined;
                        deleted?: boolean | undefined;
                        spoiler?: boolean | undefined;
                        nsfw?: boolean | undefined;
                        reason?: string | undefined;
                    } | undefined;
                    flair?: {
                        [x: string]: unknown;
                        text: string;
                        backgroundColor?: string | undefined;
                        textColor?: string | undefined;
                        expiresAt?: number | undefined;
                    } | undefined;
                    spoiler?: boolean | undefined;
                    nsfw?: boolean | undefined;
                    pinned?: boolean | undefined;
                    locked?: boolean | undefined;
                    removed?: boolean | undefined;
                    reason?: string | undefined;
                    approved?: boolean | undefined;
                    author?: {
                        [x: string]: unknown;
                        subplebbit?: {
                            [x: string]: unknown;
                            postScore: number;
                            replyScore: number;
                            firstCommentTimestamp: number;
                            lastCommentCid: string;
                            banExpiresAt?: number | undefined;
                            flair?: {
                                [x: string]: unknown;
                                text: string;
                                backgroundColor?: string | undefined;
                                textColor?: string | undefined;
                                expiresAt?: number | undefined;
                            } | undefined;
                        } | undefined;
                    } | undefined;
                    lastChildCid?: string | undefined;
                    lastReplyTimestamp?: number | undefined;
                    replies?: {
                        pages: Record<string, /*elided*/ any>;
                        pageCids?: Record<string, string> | undefined;
                    } | undefined;
                };
            }[];
            nextCid?: string | undefined;
        }>;
        pageCids?: Record<string, string> | undefined;
    } | {
        pageCids?: Record<string, string> | undefined;
    } | undefined;
    updateCid?: string | undefined;
};
export declare function parseCommentPubsubMessagePublicationWithPlebbitErrorIfItFails(args: z.infer<typeof CommentPubsubMessagePublicationSchema>): {
    timestamp: number;
    signature: {
        type: string;
        signature: string;
        publicKey: string;
        signedPropertyNames: string[];
    };
    subplebbitAddress: string;
    author: {
        address: string;
        previousCommentCid?: string | undefined;
        displayName?: string | undefined;
        wallets?: Record<string, {
            address: string;
            timestamp: number;
            signature: {
                signature: string;
                type: string;
            };
        }> | undefined;
        avatar?: {
            [x: string]: unknown;
            chainTicker: string;
            address: string;
            id: string;
            timestamp: number;
            signature: {
                signature: string;
                type: string;
            };
        } | undefined;
        flair?: {
            [x: string]: unknown;
            text: string;
            backgroundColor?: string | undefined;
            textColor?: string | undefined;
            expiresAt?: number | undefined;
        } | undefined;
    };
    protocolVersion: string;
    flair?: {
        [x: string]: unknown;
        text: string;
        backgroundColor?: string | undefined;
        textColor?: string | undefined;
        expiresAt?: number | undefined;
    } | undefined;
    content?: string | undefined;
    spoiler?: boolean | undefined;
    nsfw?: boolean | undefined;
    link?: string | undefined;
    title?: string | undefined;
    linkWidth?: number | undefined;
    linkHeight?: number | undefined;
    linkHtmlTagName?: string | undefined;
    parentCid?: string | undefined;
    postCid?: string | undefined;
};
export declare function parseCreateCommentOptionsSchemaWithPlebbitErrorIfItFails(args: z.infer<typeof CreateCommentOptionsSchema>): {
    signer: {
        type: "ed25519";
        privateKey: string;
    };
    subplebbitAddress: string;
    flair?: {
        [x: string]: unknown;
        text: string;
        backgroundColor?: string | undefined;
        textColor?: string | undefined;
        expiresAt?: number | undefined;
    } | undefined;
    spoiler?: boolean | undefined;
    nsfw?: boolean | undefined;
    content?: string | undefined;
    title?: string | undefined;
    link?: string | undefined;
    linkWidth?: number | undefined;
    linkHeight?: number | undefined;
    linkHtmlTagName?: string | undefined;
    parentCid?: string | undefined;
    postCid?: string | undefined;
    author?: {
        [x: string]: unknown;
        address?: string | undefined;
        previousCommentCid?: string | undefined;
        displayName?: string | undefined;
        wallets?: Record<string, {
            address: string;
            timestamp: number;
            signature: {
                signature: string;
                type: string;
            };
        }> | undefined;
        avatar?: {
            [x: string]: unknown;
            chainTicker: string;
            address: string;
            id: string;
            timestamp: number;
            signature: {
                signature: string;
                type: string;
            };
        } | undefined;
        flair?: {
            [x: string]: unknown;
            text: string;
            backgroundColor?: string | undefined;
            textColor?: string | undefined;
            expiresAt?: number | undefined;
        } | undefined;
    } | undefined;
    protocolVersion?: string | undefined;
    timestamp?: number | undefined;
    challengeRequest?: {
        challengeAnswers?: string[] | undefined;
        challengeCommentCids?: string[] | undefined;
    } | undefined;
};
export declare function parseSubplebbitAddressWithPlebbitErrorIfItFails(args: z.infer<typeof CreateCommentOptionsSchema.shape.subplebbitAddress>): string;
export type SchemaRowParserOptions = {
    prefix?: string;
    coerceBooleans?: boolean;
    parseJsonStrings?: boolean;
    loose?: boolean;
    validate?: boolean;
};
type ObjectSchema = ZodObject<any, any>;
export interface SchemaRowParserResult<Schema extends ObjectSchema> {
    data: z.output<Schema>;
    extras: Record<string, unknown>;
}
export declare function createSchemaRowParser<Schema extends ObjectSchema>(schema: Schema, options?: SchemaRowParserOptions): (row: unknown) => SchemaRowParserResult<Schema>;
export {};
