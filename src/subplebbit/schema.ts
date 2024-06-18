import { z } from "zod";
import {
    AuthorAddressSchema,
    CommentCidSchema,
    FlairSchema,
    JsonSignatureSchema,
    PlebbitTimestampSchema,
    ProtocolVersionSchema,
    SignerWithAddressPublicKeySchema,
    SubplebbitAddressSchema
} from "../schema/schema.js";
import { PostsPagesIpfsSchema } from "../pages/schema.js";

// Other props of Subplebbit Ipfs here
export const SubplebbitEncryptionSchema = z.object({
    type: z.enum(["ed25519-aes-gcm"]), // https://github.com/plebbit/plebbit-js/blob/master/docs/encryption.md
    publicKey: SignerWithAddressPublicKeySchema.shape.publicKey // 32 bytes base64 string (same as subplebbit.signer.publicKey)
});

export const SubplebbitRoleSchema = z.object({
    role: z.enum(["owner", "admin", "moderator"])
});

export const SubplebbitSuggestedSchema = z.object({
    // values suggested by the sub owner, the client/user can ignore them without breaking interoperability
    primaryColor: z.string().optional(),
    secondaryColor: z.string().optional(),
    avatarUrl: z.string().optional(),
    bannerUrl: z.string().optional(),
    backgroundUrl: z.string().optional(),
    language: z.string().optional()
    // TODO: menu links, wiki pages, sidebar widgets
});

export const SubplebbitFeaturesSchema = z.object({
    // any boolean that changes the functionality of the sub, add "no" in front if doesn't default to false
    noVideos: z.boolean().optional(), // Not implemented
    noSpoilers: z.boolean().optional(), // Not implemented. Author can't comment.spoiler = true their own comments
    noImages: z.boolean().optional(), // Not implemented
    noVideoReplies: z.boolean().optional(), // Not implemented
    noSpoilerReplies: z.boolean().optional(), // Not implemented
    noImageReplies: z.boolean().optional(), // Not implemented
    noPolls: z.boolean().optional(), // Not impllemented
    noCrossposts: z.boolean().optional(), // Not implemented
    noUpvotes: z.boolean().optional(), // Not implemented
    noDownvotes: z.boolean().optional(), // Not implemented
    noAuthors: z.boolean().optional(), // Not implemented. No authors at all, like 4chan
    anonymousAuthors: z.boolean().optional(), // Not implemented. Authors are given anonymous ids inside threads, like 4chan
    noNestedReplies: z.boolean().optional(), // Not implemented. No nested replies, like old school forums and 4chan
    safeForWork: z.boolean().optional(), // Not implemented
    authorFlairs: z.boolean().optional(), // Not implemented. Authors can choose their own author flairs (otherwise only mods can)
    requireAuthorFlairs: z.boolean().optional(), // Not implemented. Force authors to choose an author flair before posting
    postFlairs: z.boolean().optional(), // Not implemented. Authors can choose their own post flairs (otherwise only mods can)
    requirePostFlairs: z.boolean().optional(), // Not implemented. Force authors to choose a post flair before posting
    noMarkdownImages: z.boolean().optional(), // Not implemented. Don't embed images in text posts markdown
    noMarkdownVideos: z.boolean().optional(), // Not implemented. Don't embed videos in text posts markdown
    markdownImageReplies: z.boolean().optional(), // Not implemented
    markdownVideoReplies: z.boolean().optional(), // Not implemented
    requirePostLink: z.boolean().optional(), // post.link must be defined and a valid https url
    requirePostLinkIsMedia: z.boolean().optional() // post.link must be of media (audio, video, image)
});

export const ChallengeExcludeSubplebbitSchema = z.object({
    addresses: SubplebbitAddressSchema.array(), // list of subplebbit addresses that can be used to exclude, plural because not a condition field like 'role'
    maxCommentCids: z.number().nonnegative(), // maximum amount of comment cids that will be fetched to check
    postScore: z.number().int().optional(),
    replyScore: z.number().int().optional(),
    firstCommentTimestamp: PlebbitTimestampSchema.optional() // exclude if author account age is greater or equal than now - firstCommentTimestamp
});

export const ChallengeExcludeSchema = z.object({
    subplebbit: ChallengeExcludeSubplebbitSchema.optional(),
    postScore: z.number().int().optional(),
    replyScore: z.number().int().optional(),
    firstCommentTimestamp: PlebbitTimestampSchema.optional(),
    challenges: z.number().nonnegative().array().optional(),
    post: z.boolean().optional(),
    reply: z.boolean().optional(),
    vote: z.boolean().optional(),
    role: SubplebbitRoleSchema.shape.role.array().optional(),
    address: AuthorAddressSchema.array().optional(),
    rateLimit: z.number().nonnegative().int().optional(),
    rateLimitChallengeSuccess: z.boolean().optional()
});

export const SubplebbitChallengeSchema = z.object({
    exclude: ChallengeExcludeSchema.array().optional(),
    description: z.string().optional(), // TODO eventually use ChallengeFile.description
    challenge: z.string().optional(), // TODO eventually use ChallengeFile.challenge
    type: z.string().optional() // TODO eventually use ChallengeFile.type
});

// Subplebbit actual schemas here

export const SubplebbitIpfsSchema = z.object({
    posts: PostsPagesIpfsSchema.optional(),
    challenges: SubplebbitChallengeSchema.array(),
    signature: JsonSignatureSchema,
    encryption: SubplebbitEncryptionSchema,
    address: SubplebbitAddressSchema,
    createdAt: PlebbitTimestampSchema,
    updatedAt: PlebbitTimestampSchema,
    pubsubTopic: z.string().optional(),
    statsCid: CommentCidSchema,
    protocolVersion: ProtocolVersionSchema,
    postUpdates: z.record(z.string(), CommentCidSchema).optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    roles: z.record(AuthorAddressSchema, SubplebbitRoleSchema).optional(),
    rules: z.string().array().optional(),
    lastPostCid: CommentCidSchema.optional(),
    lastCommentCid: CommentCidSchema.optional(),
    features: SubplebbitFeaturesSchema.optional(),
    suggested: SubplebbitSuggestedSchema.optional(),
    flairs: z.record(z.enum(["post", "author"], FlairSchema.array())).optional()
});
