// Comment edit schemas here

import { z } from "zod";
import {
    AuthorFlairSchema,
    AuthorPubsubJsonSchema,
    CommentCidSchema,
    CreatePublicationUserOptionsSchema,
    DecryptedChallengeRequestBaseSchema,
    JsonSignatureSchema,
    PublicationBaseBeforeSigning,
    ShortSubplebbitAddressSchema
} from "../../schema/schema";
import * as remeda from "remeda";
import type { CommentEditSignedPropertyNamesUnion } from "../../signer/types";
import { CommentEditSignedPropertyNames } from "../../signer/constants";
import { CommentAuthorSchema } from "../comment/schema";

export const AuthorCommentEditOptionsSchema = z
    .object({
        commentCid: CommentCidSchema,
        content: z.string().optional(), // TODO Should use CommentIpfsSchema.content later on
        deleted: z.boolean().optional(),
        flair: AuthorFlairSchema.optional(),
        spoiler: z.boolean().optional(),
        reason: z.string().optional()
    })
    .strict();

export const ModeratorCommentEditOptionsSchema = z
    .object({
        commentCid: CommentCidSchema,
        flair: AuthorFlairSchema.optional(),
        spoiler: z.boolean().optional(),
        pinned: z.boolean().optional(),
        locked: z.boolean().optional(),
        removed: z.boolean().optional(),
        reason: z.string().optional(),
        commentAuthor: CommentAuthorSchema.optional()
    })
    .strict();

// I have to explicitly include the cast here, it may be fixed in the future
export const uniqueModFields = <["pinned", "locked", "removed", "commentAuthor"]>(
    remeda.difference(remeda.keys.strict(ModeratorCommentEditOptionsSchema.shape), remeda.keys.strict(AuthorCommentEditOptionsSchema.shape))
);

export const uniqueAuthorFields = <["content", "deleted"]>(
    remeda.difference(remeda.keys.strict(AuthorCommentEditOptionsSchema.shape), remeda.keys.strict(ModeratorCommentEditOptionsSchema.shape))
);

export const CreateCommentEditAuthorPublicationSchema = CreatePublicationUserOptionsSchema.merge(AuthorCommentEditOptionsSchema);
export const CreateCommentEditModeratorPublicationSchema = CreatePublicationUserOptionsSchema.merge(ModeratorCommentEditOptionsSchema);

// Before signing, and after filling the missing props of CreateCommentEditUserOptions
export const CommentEditModeratorOptionsToSignSchema = CreateCommentEditModeratorPublicationSchema.merge(PublicationBaseBeforeSigning);
export const CommentEditAuthorOptionsToSignSchema = CreateCommentEditAuthorPublicationSchema.merge(PublicationBaseBeforeSigning);

// after signing, and before initializing the local comment edit props
export const LocalCommentEditAfterSigningSchema = CommentEditModeratorOptionsToSignSchema.merge(
    CommentEditAuthorOptionsToSignSchema
).extend({
    signature: JsonSignatureSchema
});

// ChallengeRequest.publication
const editPubsubPickOptions = <Record<CommentEditSignedPropertyNamesUnion | "signature" | "protocolVersion", true>>(
    remeda.mapToObj([...CommentEditSignedPropertyNames, "signature", "protocolVersion"], (x) => [x, true])
);
export const AuthorCommentEditPubsubSchema = LocalCommentEditAfterSigningSchema.pick(remeda.omit(editPubsubPickOptions, uniqueModFields));
export const ModeratorCommentEditPubsubSchema = LocalCommentEditAfterSigningSchema.pick(
    remeda.omit(editPubsubPickOptions, uniqueAuthorFields)
);
export const CommentEditPubsubMessageSchema = AuthorCommentEditPubsubSchema.merge(ModeratorCommentEditPubsubSchema);

export const DecryptedChallengeRequestCommentEditSchema = DecryptedChallengeRequestBaseSchema.extend({
    publication: CommentEditPubsubMessageSchema
}).strict();

export const CommentEditJsonSchema = CommentEditPubsubMessageSchema.extend({
    shortSubplebbitAddress: ShortSubplebbitAddressSchema,
    author: AuthorPubsubJsonSchema
}).strict();

export const CreateCommentEditFunctionArgumentSchema = CreateCommentEditAuthorPublicationSchema.or(
    CreateCommentEditModeratorPublicationSchema
)
    .or(CommentEditPubsubMessageSchema)
    .or(DecryptedChallengeRequestCommentEditSchema)
    .or(CommentEditJsonSchema);
