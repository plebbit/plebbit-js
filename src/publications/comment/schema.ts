import { z } from "zod";
import {
    AuthorFlairSchema,
    AuthorJsonBaseSchema,
    AuthorPubsubJsonSchema,
    AuthorPubsubSchema,
    ChallengeRequestToEncryptBaseSchema,
    CommentCidSchema,
    CreatePublicationUserOptionsSchema,
    JsonSignatureSchema,
    PlebbitTimestampSchema,
    ProtocolVersionSchema,
    PublicationBaseBeforeSigning,
    ShortCidSchema,
    ShortSubplebbitAddressSchema,
    SignerWithAddressPublicKeySchema,
    SubplebbitAuthorSchema
} from "../../schema/schema";
import { AuthorCommentEditPubsubSchema } from "../comment-edit/schema";
import { CommentSignedPropertyNamesUnion } from "../../signer/types";
import { CommentSignedPropertyNames } from "../../signer/constants";
import * as remeda from "remeda";
import { PagesTypeIpfs, RepliesPagesTypeIpfs, RepliesPagesTypeJson } from "../../types";
import { Comment } from "./comment";
import { CommentIpfsType, CommentPubsubMessage, CommentTypeJson, CreateCommentOptions } from "./types";
import { messages } from "../../errors";

// Comment schemas here

const CommentContentSchema = z.string();

// Create Comment schemas here

// Need to validate if post.link is valid
// Also add a limitation of 2000 characters to link
// Need to have multiple types of schema for posts with or without link
// link posts have no content

export const CreateCommentOptionsSchema = z
    .object({
        flair: AuthorFlairSchema.optional(), // Author chosen colored label for the comment
        spoiler: z.boolean().optional(), // Hide the comment thumbnail behind spoiler warning
        content: CommentContentSchema.optional(),
        title: z.string().optional(),
        link: z.string().url(messages.ERR_POST_HAS_INVALID_LINK_FIELD).max(2000, messages.COMMENT_LINK_LENGTH_IS_OVER_LIMIT).optional(),
        linkWidth: z.number().positive().optional(), // author can optionally provide dimensions of image/video link which helps UI clients with infinite scrolling feeds
        linkHeight: z.number().positive().optional(),
        linkHtmlTagName: z.enum(["a", "img", "video", "audio"]).optional(),
        parentCid: CommentCidSchema.optional() // The parent comment CID
    })
    .merge(CreatePublicationUserOptionsSchema)
    .strict();

export const CommentOptionsToSignSchema = CreateCommentOptionsSchema.merge(PublicationBaseBeforeSigning);

// Below is what's used to initialize a local publication to be published

export const LocalCommentSchema = CommentOptionsToSignSchema.extend({ signature: JsonSignatureSchema }).merge(
    ChallengeRequestToEncryptBaseSchema
);

const commentPubsubKeys = <Record<CommentSignedPropertyNamesUnion | "signature" | "protocolVersion", true>>(
    remeda.mapToObj([...CommentSignedPropertyNames, "signature", "protocolVersion"], (x) => [x, true])
);

export const CommentPubsubMessageSchema = LocalCommentSchema.pick(commentPubsubKeys).strict();

export const CommentChallengeRequestToEncryptSchema = ChallengeRequestToEncryptBaseSchema.extend({
    publication: CommentPubsubMessageSchema
}).strict();

// Remote comments

// These are the props added by the subplebbit before adding the comment to ipfs
export const CommentIpfsSchema = CommentPubsubMessageSchema.extend({
    depth: z.number().nonnegative().int(),
    postCid: CommentCidSchema.optional(),
    thumbnailUrl: z.string().url().optional(),
    thumbnailUrlWidth: z.number().positive().optional(),
    thumbnailUrlHeight: z.number().positive().optional(),
    previousCid: CommentCidSchema.optional()
}).strict();

export const CommentIpfsWithCidSchema = CommentIpfsSchema.extend({
    cid: CommentCidSchema,
    postCid: CommentCidSchema
}).strict();

// Comment update schemas

const AuthorWithCommentUpdateSchema = CommentPubsubMessageSchema.shape.author
    .extend({
        subplebbit: SubplebbitAuthorSchema.optional()
    })
    .strict();

const CommentUpdateNoRepliesSchema = z.object({
    cid: CommentCidSchema, // cid of the comment, need it in signature to prevent attack
    upvoteCount: z.number().nonnegative().int(),
    downvoteCount: z.number().nonnegative().int(),
    replyCount: z.number().nonnegative().int(),
    edit: AuthorCommentEditPubsubSchema.optional(), // most recent edit by comment author, commentUpdate.edit.content, commentUpdate.edit.deleted, commentUpdate.edit.flair override Comment instance props. Validate commentUpdate.edit.signature
    flair: AuthorFlairSchema.optional(), // arbitrary colored string to describe the comment, added by mods, override comment.flair and comment.edit.flair (which are added by author)
    spoiler: z.boolean().optional(),
    pinned: z.boolean().optional(),
    locked: z.boolean().optional(), // mod locked a post
    removed: z.boolean().optional(), // mod deleted a comment
    reason: z.string().optional(), // reason the mod took a mood action,
    updatedAt: PlebbitTimestampSchema, // timestamp in seconds the CommentUpdate was updated
    author: AuthorWithCommentUpdateSchema.pick({ subplebbit: true }).optional(), // add commentUpdate.author.subplebbit to comment.author.subplebbit, override comment.author.flair with commentUpdate.author.subplebbit.flair if any

    lastChildCid: CommentCidSchema.optional(), // The cid of the most recent direct child of the comment
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

export const CommentWithCommentUpdateNoRepliesJsonSchema = CommentIpfsWithCidSchema.merge(CommentUpdateNoRepliesSchema)
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

export const CommentJsonAfterChallengeVerificationNoCommentUpdateSchema = CommentIpfsWithCidSchema.extend({
    shortCid: ShortCidSchema,
    shortSubplebbitAddress: ShortSubplebbitAddressSchema,
    author: AuthorPubsubJsonSchema
}).strict();

export const CommentJsonBeforeChallengeVerificationSchema = CommentPubsubMessageSchema.extend({
    shortSubplebbitAddress: ShortSubplebbitAddressSchema,
    author: AuthorPubsubJsonSchema
}).strict();

const CommentJsonSchema = CommentWithCommentUpdateJsonSchema.or(CommentJsonAfterChallengeVerificationNoCommentUpdateSchema).or(
    CommentJsonBeforeChallengeVerificationSchema
);

// Comment pubsub message here

// Comment table here

export const CommentsTableRowSchema = CommentIpfsWithCidSchema.extend({
    authorAddress: AuthorPubsubSchema.shape.address,
    challengeRequestPublicationSha256: z.string(),
    ipnsName: z.string().optional(),
    id: z.number().nonnegative().int(),
    insertedAt: PlebbitTimestampSchema,
    authorSignerAddress: SignerWithAddressPublicKeySchema.shape.address
}).strict();

// Plebbit.createComment here

// TODO move the refine function to createComment args
const validateCommentPropsRefine = (options: CreateCommentOptions | CommentPubsubMessage | CommentIpfsType | CommentTypeJson) => (
    options.link || options.title || options.content, "The comment needs to have at least link, or title, or content defined"
);

export const CreateCommentFunctionArguments = CreateCommentOptionsSchema.refine(validateCommentPropsRefine)
    .or(CommentJsonSchema)
    .refine(validateCommentPropsRefine)
    .or(CommentIpfsSchema)
    .refine(validateCommentPropsRefine)
    .or(CommentIpfsWithCidSchema)
    .refine(validateCommentPropsRefine)
    .or(CommentPubsubMessageSchema)
    .refine(validateCommentPropsRefine)
    .or(CommentChallengeRequestToEncryptSchema)
    .or(CommentsTableRowSchema)
    .or(z.instanceof(Comment))
    .or(CommentIpfsWithCidSchema.pick({ cid: true }))
    .or(CommentIpfsWithCidSchema.pick({ cid: true, subplebbitAddress: true }));

// Comment pages here

export const ReplySortNameSchema = z.enum(["topAll", "new", "old", "controversialAll"]);

export const PageIpfsSchema = z.object({
    comments: z.object({ comment: CommentIpfsWithCidSchema, update: CommentUpdateSchema }).array(),
    nextCid: CommentCidSchema.optional()
});

const PageJsonSchema = z.object({
    comments: CommentWithCommentUpdateJsonSchema.array(),
    nextCid: CommentCidSchema.optional()
});

// need to prevent infinite recursion here
export const RepliesPagesIpfsSchema = z.object({
    pages: z.record(ReplySortNameSchema, PageIpfsSchema), // should be partial
    pageCids: z.record(ReplySortNameSchema, CommentCidSchema)
});

export const RepliesPagesJsonSchema = z.object({
    pages: z.record(ReplySortNameSchema, PageJsonSchema),
    pageCids: RepliesPagesIpfsSchema.shape.pageCids
});
