import { z } from "zod";
import {
    FlairSchema,
    AuthorPubsubSchema,
    ChallengeRequestToEncryptBaseSchema,
    CidStringSchema,
    CreatePublicationUserOptionsSchema,
    JsonSignatureSchema,
    PlebbitTimestampSchema,
    ProtocolVersionSchema,
    PublicationBaseBeforeSigning,
    SignerWithAddressPublicKeySchema,
    SubplebbitAuthorSchema
} from "../../schema/schema.js";
import { CommentEditPubsubMessagePublicationWithFlexibleAuthorSchema } from "../comment-edit/schema.js";
import type { CommentSignedPropertyNamesUnion } from "../../signer/types";
import * as remeda from "remeda";
import { messages } from "../../errors.js";
import { keysToOmitFromSignedPropertyNames } from "../../signer/constants.js";
import { RepliesPagesIpfsSchema } from "../../pages/schema.js";
import type { CommentPubsubMessagePublication, CommentUpdateType } from "./types.js";

// Comment schemas here

const CommentContentSchema = z.string();

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

export const CommentSignedPropertyNames = remeda.keys.strict(
    remeda.omit(CreateCommentOptionsSchema.shape, keysToOmitFromSignedPropertyNames)
);

const commentPubsubKeys = <Record<CommentSignedPropertyNamesUnion | "signature", true>>(
    remeda.mapToObj([...CommentSignedPropertyNames, "signature"], (x) => [x, true])
);

export const CommentPubsubMessagePublicationSchema = LocalCommentSchema.pick(commentPubsubKeys).strict();

export const CommentPubsubMessageWithFlexibleAuthorSchema = CommentPubsubMessagePublicationSchema.merge(
    z.object({ author: AuthorPubsubSchema.passthrough() })
).strict();

// This is used by the subplebbit when parsing request.comment
export const CommentPubsubMessageWithFlexibleAuthorRefinementSchema = CommentPubsubMessageWithFlexibleAuthorSchema.passthrough().refine(
    (arg) => arg.link || arg.content || arg.title,
    messages.ERR_COMMENT_HAS_NO_CONTENT_LINK_TITLE
);

export const CommentPubsubMessageWithRefinementSchema = CommentPubsubMessagePublicationSchema.refine(
    (arg) => arg.link || arg.content || arg.title,
    messages.ERR_COMMENT_HAS_NO_CONTENT_LINK_TITLE
);

export const CommentChallengeRequestToEncryptSchema = ChallengeRequestToEncryptBaseSchema.extend({
    comment: CommentPubsubMessageWithFlexibleAuthorSchema.passthrough()
}).strict();

// Remote comments

// These are the props added by the subplebbit before adding the comment to ipfs
export const CommentIpfsSchema = CommentPubsubMessageWithFlexibleAuthorSchema.extend({
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

// Comment update schemas

export const AuthorWithCommentUpdateSchema = CommentPubsubMessagePublicationSchema.shape.author
    .extend({
        subplebbit: SubplebbitAuthorSchema.optional()
    })
    .passthrough();

export const CommentUpdateNoRepliesSchema = z.object({
    cid: CidStringSchema, // cid of the comment, need it in signature to prevent attack
    upvoteCount: z.number().nonnegative().int(),
    downvoteCount: z.number().nonnegative().int(),
    replyCount: z.number().nonnegative().int(),
    edit: CommentEditPubsubMessagePublicationWithFlexibleAuthorSchema.optional(), // most recent edit by comment author, commentUpdate.edit.content, commentUpdate.edit.deleted, commentUpdate.edit.flair override Comment instance props. Validate commentUpdate.edit.signature
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

export const CommentUpdateSchema = CommentUpdateNoRepliesSchema.extend({
    replies: z.lazy(() => RepliesPagesIpfsSchema.optional()) // only preload page 1 sorted by 'topAll', might preload more later, only provide sorting for posts (not comments) that have 100+ child comments
}).strict();

export const CommentUpdateSignedPropertyNames = remeda.keys.strict(remeda.omit(CommentUpdateSchema.shape, ["signature"]));

export const CommentUpdateForChallengeVerificationSchema = CommentUpdateSchema.pick({
    author: true,
    cid: true,
    signature: true,
    protocolVersion: true
}).strict();

export const CommentUpdateForChallengeVerificationSignedPropertyNames = remeda.keys.strict(
    remeda.omit(CommentUpdateForChallengeVerificationSchema.shape, ["signature"])
);

type OverlapCommentPubsubAndCommentUpdate =
    | (keyof CommentPubsubMessagePublication & keyof Omit<CommentUpdateType, "signature">)
    | "content";

const originalFields = <OverlapCommentPubsubAndCommentUpdate[]>(
    remeda
        .intersection(
            remeda.keys.strict(CommentPubsubMessagePublicationSchema.shape),
            remeda.keys.strict(remeda.omit(CommentUpdateSchema.shape, ["signature"]))
        )
        .concat("content") // have to hard code this here because Comment.content uses CommentUpdate.edit.content
);

const originalFieldsObj = <Record<OverlapCommentPubsubAndCommentUpdate, true>>remeda.fromKeys(originalFields, () => true);

export const OriginalCommentFieldsBeforeCommentUpdateSchema = CommentPubsubMessageWithFlexibleAuthorSchema.pick(originalFieldsObj).strip();

// Comment table here

export const CommentsTableRowSchema = CommentIpfsSchema.extend({
    cid: CidStringSchema,
    postCid: CidStringSchema,
    id: z.number().nonnegative().int(),
    insertedAt: PlebbitTimestampSchema,
    authorSignerAddress: SignerWithAddressPublicKeySchema.shape.address,
    extraProps: z.object({}).passthrough().optional()
}).strict();

// Comment pubsub message here

export const CommentPubsubMessageReservedFields = remeda.difference(
    remeda.unique([
        ...remeda.keys.strict(CommentIpfsSchema.shape),
        ...remeda.keys.strict(CommentsTableRowSchema.shape),
        ...remeda.keys.strict(ChallengeRequestToEncryptBaseSchema.shape),
        ...CommentUpdateSignedPropertyNames,
        "original",
        "shortCid",
        "shortSubplebbitAddress",
        "deleted",
        "signer",
        "state",
        "clients",
        "publishingState",
        "updatingState"
    ]),
    remeda.keys.strict(CommentPubsubMessagePublicationSchema.shape)
);

export const CommentUpdateReservedFields = remeda.difference(
    CommentPubsubMessageReservedFields,
    remeda.keys.strict(CommentUpdateSchema.shape)
);

// Plebbit.createComment here

export const CreateCommentFunctionArgumentsSchema = CreateCommentOptionsWithRefinementSchema.or(CommentIpfsWithRefinmentSchema)
    .or(CommentPubsubMessageWithRefinementSchema)
    .or(CommentUpdateSchema.pick({ cid: true }))
    .or(z.object({ subplebbitAddress: CommentPubsubMessagePublicationSchema.shape.subplebbitAddress, cid: CommentUpdateSchema.shape.cid }));
