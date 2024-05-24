import { z } from "zod";
import {
    AuthorFlairSchema,
    AuthorJsonBaseSchema,
    AuthorPubsubJsonSchema,
    CommentCidSchema,
    CreatePublicationUserOptionsSchema,
    DecryptedChallengeRequestBaseSchema,
    JsonSignatureSchema,
    PlebbitTimestampSchema,
    ProtocolVersionSchema,
    PublicationBaseBeforeSigning,
    RepliesPagesIpfsSchema,
    RepliesPagesJsonSchema,
    ShortCidSchema,
    ShortSubplebbitAddressSchema
} from "../../schema/schema";
import { AuthorCommentEditPubsubSchema } from "../comment-edit/schema";
import { CommentSignedPropertyNamesUnion } from "../../signer/types";
import { CommentSignedPropertyNames } from "../../signer/constants";
import * as remeda from "remeda";
import { PagesTypeIpfs, RepliesPagesTypeIpfs, RepliesPagesTypeJson } from "../../types";

// Comment schemas here
export const SubplebbitAuthorSchema = z
    .object({
        postScore: z.number().positive(), // total post karma in the subplebbit
        replyScore: z.number().positive(), // total reply karma in the subplebbit
        banExpiresAt: PlebbitTimestampSchema.optional(), // timestamp in second, if defined the author was banned for this comment
        flair: AuthorFlairSchema.optional(), // not part of the signature, mod can edit it after comment is published
        firstCommentTimestamp: PlebbitTimestampSchema, // timestamp of the first comment by the author in the subplebbit, used for account age based challenges
        lastCommentCid: CommentCidSchema // last comment by the author in the subplebbit, can be used with author.previousCommentCid to get a recent author comment history in all subplebbits
    })
    .strict();
export const CommentAuthorSchema = SubplebbitAuthorSchema.pick({ banExpiresAt: true, flair: true });

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
        link: z.string().url().max(2000).optional(),
        linkWidth: z.number().positive().optional(), // author can optionally provide dimensions of image/video link which helps UI clients with infinite scrolling feeds
        linkHeight: z.number().positive().optional(),
        linkHtmlTagName: z.enum(["a", "img", "video", "audio"]).optional(),
        parentCid: CommentCidSchema.optional() // The parent comment CID
    })
    .merge(CreatePublicationUserOptionsSchema);

// TODO move the refine function to createComment args
// .refine(
// (options) => options.link || options.title || options.content,
// "The comment needs to have at least link, or title, or content defined"
// );

export const CommentOptionsToSignSchema = CreateCommentOptionsSchema.merge(PublicationBaseBeforeSigning);

// Below is what's used to initialize a local publication to be published

export const LocalCommentSchema = CommentOptionsToSignSchema.extend({ signature: JsonSignatureSchema }).merge(
    DecryptedChallengeRequestBaseSchema
);

const commentPubsubKeys = <Record<CommentSignedPropertyNamesUnion | "signature" | "protocolVersion", true>>(
    remeda.mapToObj([...CommentSignedPropertyNames, "signature", "protocolVersion"], (x) => [x, true])
);

export const CommentPubsubMessageSchema = LocalCommentSchema.pick(commentPubsubKeys);

// Remote comments

// These are the props added by the subplebbit before adding the comment to ipfs
export const CommentIpfsSchema = CommentPubsubMessageSchema.extend({
    depth: z.number().positive(),
    postCid: CommentCidSchema.optional(),
    thumbnailUrl: z.string().url().optional(),
    thumbnailUrlWidth: z.number().positive().optional(),
    thumbnailUrlHeight: z.number().positive().optional(),
    previousCid: CommentCidSchema.optional()
});

export const CommentIpfsWithCidSchema = CommentIpfsSchema.extend({
    cid: CommentCidSchema,
    postCid: CommentCidSchema
});

// Comment update schemas

const AuthorWithCommentUpdateSchema = CommentPubsubMessageSchema.shape.author.extend({
    subplebbit: SubplebbitAuthorSchema.optional()
});

const CommentUpdateNoRepliesSchema = z.object({
    cid: CommentCidSchema, // cid of the comment, need it in signature to prevent attack
    upvoteCount: z.number().positive(),
    downvoteCount: z.number().positive(),
    replyCount: z.number().positive(),
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
});

const OriginalCommentFieldsBeforeCommentUpdateSchema = CommentPubsubMessageSchema.pick({
    author: true,
    content: true,
    flair: true,
    protocolVersion: true
});

const AuthorWithCommentUpdateJsonSchema = AuthorWithCommentUpdateSchema.merge(AuthorJsonBaseSchema);

export const CommentWithCommentUpdateNoRepliesJsonSchema = CommentIpfsWithCidSchema.merge(CommentUpdateNoRepliesSchema).extend({
    original: OriginalCommentFieldsBeforeCommentUpdateSchema,
    shortCid: ShortCidSchema,
    author: AuthorWithCommentUpdateJsonSchema,
    deleted: z.boolean().optional(),
    shortSubplebbitAddress: ShortSubplebbitAddressSchema
});

type CommentWithCommentUpdateWithRepliesJsonSchema = z.infer<typeof CommentWithCommentUpdateNoRepliesJsonSchema> & {
    replies?: RepliesPagesTypeJson;
};

export const CommentWithCommentUpdateJsonSchema: z.ZodType<CommentWithCommentUpdateWithRepliesJsonSchema> =
    CommentWithCommentUpdateNoRepliesJsonSchema.extend({
        replies: z.lazy(() => RepliesPagesJsonSchema.optional())
    });
