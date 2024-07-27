import { z } from "zod";
import {
    FlairSchema,
    AuthorJsonBaseSchema,
    AuthorPubsubJsonSchema,
    AuthorPubsubSchema,
    ChallengeRequestToEncryptBaseSchema,
    CidStringSchema,
    CreatePublicationUserOptionsSchema,
    JsonSignatureSchema,
    PlebbitTimestampSchema,
    ProtocolVersionSchema,
    PublicationBaseBeforeSigning,
    ShortCidSchema,
    ShortSubplebbitAddressSchema,
    SignerWithAddressPublicKeySchema,
    SubplebbitAuthorSchema
} from "../../schema/schema.js";
import { AuthorCommentEditPubsubSchema } from "../comment-edit/schema.js";
import type { CommentSignedPropertyNamesUnion } from "../../signer/types";
import * as remeda from "remeda";
import type { RepliesPagesTypeIpfs, RepliesPagesTypeJson } from "../../pages/types";
import { Comment } from "./comment.js";
import { messages } from "../../errors.js";
import { keysToOmitFromSignature } from "../../signer/constants.js";
import { isLinkValid } from "../../util.js";
import { RepliesPagesIpfsSchema, RepliesPagesJsonSchema } from "../../pages/schema.js";
import { PublicationStateSchema } from "../schema.js";

// Comment schemas here

const CommentContentSchema = z.string();

export const CommentStateSchema = z.enum([...PublicationStateSchema.options, "updating"]);

export const CommentUpdatingStateSchema = z.enum([
    "stopped",
    "resolving-author-address",
    "fetching-ipfs",
    "fetching-update-ipfs",
    "resolving-subplebbit-address",
    "fetching-subplebbit-ipns",
    "fetching-subplebbit-ipfs",
    "failed",
    "succeeded"
]);

// Create Comment schemas here

// Need to validate if post.link is valid
// Also add a limitation of 2000 characters to link
// Need to have multiple types of schema for posts with or without link
// link posts have no content

export const CreateCommentOptionsSchema = z
    .object({
        flair: FlairSchema.optional(), // Author chosen colored label for the comment
        spoiler: z.boolean().optional(), // Hide the comment thumbnail behind spoiler warning
        content: CommentContentSchema.optional(),
        title: z.string().optional(),
        link: z.string().max(2000, messages.COMMENT_LINK_LENGTH_IS_OVER_LIMIT).url().optional(),
        linkWidth: z.number().positive().optional(), // author can optionally provide dimensions of image/video link which helps UI clients with infinite scrolling feeds
        linkHeight: z.number().positive().optional(),
        linkHtmlTagName: z.enum(["a", "img", "video", "audio"]).optional(),
        parentCid: CidStringSchema.optional() // The parent comment CID
    })
    .merge(CreatePublicationUserOptionsSchema)
    .strict();

// This one is used for parsing user's input
export const CreateCommentOptionsWithRefinementSchema = CreateCommentOptionsSchema.refine(
    (arg) => arg.link || arg.content || arg.title,
    messages.ERR_COMMENT_HAS_NO_CONTENT_LINK_TITLE
);

export const CommentOptionsToSignSchema = CreateCommentOptionsSchema.merge(PublicationBaseBeforeSigning);

// Below is what's used to initialize a local publication to be published

export const LocalCommentSchema = CommentOptionsToSignSchema.extend({ signature: JsonSignatureSchema }).merge(
    ChallengeRequestToEncryptBaseSchema
);

export const CommentSignedPropertyNames = remeda.keys.strict(remeda.omit(CreateCommentOptionsSchema.shape, keysToOmitFromSignature));

const commentPubsubKeys = <Record<CommentSignedPropertyNamesUnion | "signature" | "protocolVersion", true>>(
    remeda.mapToObj([...CommentSignedPropertyNames, "signature", "protocolVersion"], (x) => [x, true])
);

export const CommentPubsubMessageSchema = LocalCommentSchema.pick(commentPubsubKeys).strict();

export const CommentPubsubMessageWithRefinementSchema = CommentPubsubMessageSchema.refine(
    (arg) => arg.link || arg.content || arg.title,
    messages.ERR_COMMENT_HAS_NO_CONTENT_LINK_TITLE
);

export const CommentChallengeRequestToEncryptSchema = ChallengeRequestToEncryptBaseSchema.extend({
    publication: CommentPubsubMessageSchema
}).strict();

// Remote comments

// These are the props added by the subplebbit before adding the comment to ipfs
export const CommentIpfsSchema = CommentPubsubMessageSchema.extend({
    depth: z.number().nonnegative().int(),
    postCid: CidStringSchema.optional(),
    thumbnailUrl: z.string().url().optional(),
    thumbnailUrlWidth: z.number().positive().optional(),
    thumbnailUrlHeight: z.number().positive().optional(),
    previousCid: CidStringSchema.optional()
}).strict();

// This one should be used for parsing user's input or from gateway/p2p etc
export const CommentIpfsWithRefinmentSchema = CommentIpfsSchema.refine(
    (arg) => arg.link || arg.content || arg.title,
    messages.ERR_COMMENT_HAS_NO_CONTENT_LINK_TITLE
);

export const CommentIpfsWithCidDefinedSchema = CommentIpfsSchema.extend({
    cid: CidStringSchema
}).strict();

export const CommentIpfsWithCidPostCidDefinedSchema = CommentIpfsWithCidDefinedSchema.extend({
    postCid: CidStringSchema
}).strict();

// Comment update schemas

export const AuthorWithCommentUpdateSchema = CommentPubsubMessageSchema.shape.author
    .extend({
        subplebbit: SubplebbitAuthorSchema.optional()
    })
    .strict();

const CommentUpdateNoRepliesSchema = z.object({
    cid: CidStringSchema, // cid of the comment, need it in signature to prevent attack
    upvoteCount: z.number().nonnegative().int(),
    downvoteCount: z.number().nonnegative().int(),
    replyCount: z.number().nonnegative().int(),
    edit: AuthorCommentEditPubsubSchema.optional(), // most recent edit by comment author, commentUpdate.edit.content, commentUpdate.edit.deleted, commentUpdate.edit.flair override Comment instance props. Validate commentUpdate.edit.signature
    flair: FlairSchema.optional(), // arbitrary colored string to describe the comment, added by mods, override comment.flair and comment.edit.flair (which are added by author)
    spoiler: z.boolean().optional(),
    pinned: z.boolean().optional(),
    locked: z.boolean().optional(), // mod locked a post
    removed: z.boolean().optional(), // mod deleted a comment
    reason: z.string().optional(), // reason the mod took a mood action,
    updatedAt: PlebbitTimestampSchema, // timestamp in seconds the CommentUpdate was updated
    author: AuthorWithCommentUpdateSchema.pick({ subplebbit: true }).optional(), // add commentUpdate.author.subplebbit to comment.author.subplebbit, override comment.author.flair with commentUpdate.author.subplebbit.flair if any

    lastChildCid: CidStringSchema.optional(), // The cid of the most recent direct child of the comment
    lastReplyTimestamp: PlebbitTimestampSchema.optional(), // The timestamp of the most recent direct or indirect child of the comment
    signature: JsonSignatureSchema, // signature of the CommentUpdate by the sub owner to protect against malicious gateway
    protocolVersion: ProtocolVersionSchema
});

type CommentUpdateWithRepliesType = z.infer<typeof CommentUpdateNoRepliesSchema> & {
    replies?: RepliesPagesTypeIpfs;
};

export const CommentUpdateSchema: z.ZodType<CommentUpdateWithRepliesType> = CommentUpdateNoRepliesSchema.extend({
    replies: z.lazy(() => RepliesPagesIpfsSchema.optional()) // only preload page 1 sorted by 'topAll', might preload more later, only provide sorting for posts (not comments) that have 100+ child comments
}).strict();

const OriginalCommentFieldsBeforeCommentUpdateSchema = CommentPubsubMessageSchema.pick({
    author: true,
    content: true,
    flair: true,
    protocolVersion: true
}).strict();

// Comment JSON schemas here

const AuthorWithCommentUpdateJsonSchema = AuthorWithCommentUpdateSchema.merge(AuthorJsonBaseSchema).strict();

export const CommentWithCommentUpdateNoRepliesJsonSchema = CommentIpfsWithCidPostCidDefinedSchema.merge(CommentUpdateNoRepliesSchema)
    .extend({
        original: OriginalCommentFieldsBeforeCommentUpdateSchema,
        shortCid: ShortCidSchema,
        author: AuthorWithCommentUpdateJsonSchema,
        deleted: z.boolean().optional(),
        shortSubplebbitAddress: ShortSubplebbitAddressSchema
    })
    .strict();

type CommentWithCommentUpdateWithRepliesJsonSchema = z.infer<typeof CommentWithCommentUpdateNoRepliesJsonSchema> & {
    replies?: RepliesPagesTypeJson;
};

export const CommentWithCommentUpdateJsonSchema: z.ZodType<CommentWithCommentUpdateWithRepliesJsonSchema> =
    CommentWithCommentUpdateNoRepliesJsonSchema.extend({
        replies: z.lazy(() => RepliesPagesJsonSchema.optional())
    }).strict();

export const CommentJsonAfterChallengeVerificationNoCommentUpdateSchema = CommentIpfsWithCidPostCidDefinedSchema.extend({
    shortCid: ShortCidSchema,
    shortSubplebbitAddress: ShortSubplebbitAddressSchema,
    author: AuthorPubsubJsonSchema
}).strict();

export const CommentJsonBeforeChallengeVerificationSchema = CommentPubsubMessageSchema.extend({
    shortSubplebbitAddress: ShortSubplebbitAddressSchema,
    author: AuthorPubsubJsonSchema
}).strict();

export const CommentJsonSchema = CommentWithCommentUpdateJsonSchema.or(CommentJsonAfterChallengeVerificationNoCommentUpdateSchema).or(
    CommentJsonBeforeChallengeVerificationSchema
);

// Comment pubsub message here

// Comment table here

export const CommentsTableRowSchema = CommentIpfsWithCidPostCidDefinedSchema.extend({
    authorAddress: AuthorPubsubSchema.shape.address,
    challengeRequestPublicationSha256: z.string(),
    ipnsName: z.string().optional(),
    id: z.number().nonnegative().int(),
    insertedAt: PlebbitTimestampSchema,
    authorSignerAddress: SignerWithAddressPublicKeySchema.shape.address
}).strict();

// Plebbit.createComment here

export const CreateCommentFunctionArguments = CreateCommentOptionsWithRefinementSchema.or(CommentJsonSchema)
    .or(CommentIpfsWithRefinmentSchema)
    .or(CommentIpfsWithCidDefinedSchema)
    .or(CommentIpfsWithCidPostCidDefinedSchema)
    .or(CommentPubsubMessageWithRefinementSchema)
    .or(CommentChallengeRequestToEncryptSchema)
    .or(z.custom<Comment>((data) => data instanceof Comment))
    .or(CommentIpfsWithCidDefinedSchema.pick({ cid: true }))
    .or(CommentIpfsWithCidDefinedSchema.pick({ cid: true, subplebbitAddress: true }));
