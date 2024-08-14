// Comment edit schemas here

import { z } from "zod";
import {
    FlairSchema,
    ChallengeRequestToEncryptBaseSchema,
    CommentAuthorSchema,
    CidStringSchema,
    CreatePublicationUserOptionsSchema,
    JsonSignatureSchema,
    PublicationBaseBeforeSigning,
    PlebbitTimestampSchema,
    SignerWithAddressPublicKeySchema
} from "../../schema/schema.js";
import * as remeda from "remeda";
import type { CommentEditSignedPropertyNamesUnion } from "../../signer/types";
import { keysToOmitFromSignedPropertyNames } from "../../signer/constants.js";
import type { AuthorCommentEdit } from "./types.js";

export const AuthorCommentEditOptionsSchema = z
    .object({
        commentCid: CidStringSchema,
        content: z.string().optional(), // TODO Should use CommentIpfsSchema.content later on
        deleted: z.boolean().optional(),
        flair: FlairSchema.optional(),
        spoiler: z.boolean().optional(),
        reason: z.string().optional()
    })
    .strict();

export const ModeratorCommentEditOptionsSchema = z
    .object({
        commentCid: CidStringSchema,
        flair: FlairSchema.optional(),
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

export const CreateCommentEditAuthorPublicationSchema = CreatePublicationUserOptionsSchema.merge(AuthorCommentEditOptionsSchema).strict();
export const CreateCommentEditModeratorPublicationSchema =
    CreatePublicationUserOptionsSchema.merge(ModeratorCommentEditOptionsSchema).strict();

// Before signing, and after filling the missing props of CreateCommentEditUserOptions
export const CommentEditModeratorOptionsToSignSchema = CreateCommentEditModeratorPublicationSchema.merge(PublicationBaseBeforeSigning);
export const CommentEditAuthorOptionsToSignSchema = CreateCommentEditAuthorPublicationSchema.merge(PublicationBaseBeforeSigning);

export const CreateCommentEditOptionsSchema = CommentEditModeratorOptionsToSignSchema.merge(CommentEditAuthorOptionsToSignSchema);

// after signing, and before initializing the local comment edit props
export const LocalCommentEditAfterSigningSchema = CreateCommentEditOptionsSchema.extend({
    signature: JsonSignatureSchema
});

// ChallengeRequest.publication

export const CommentEditSignedPropertyNames = remeda.keys.strict(
    remeda.omit(CreateCommentEditOptionsSchema.shape, keysToOmitFromSignedPropertyNames)
);
const editPubsubPickOptions = <Record<CommentEditSignedPropertyNamesUnion | "signature" | "protocolVersion", true>>(
    remeda.mapToObj([...CommentEditSignedPropertyNames, "signature", "protocolVersion"], (x) => [x, true])
);
export const AuthorCommentEditPubsubSchema = LocalCommentEditAfterSigningSchema.pick(remeda.omit(editPubsubPickOptions, uniqueModFields));
export const AuthorCommentEditPubsubPassthroughSchema = <z.ZodType<AuthorCommentEdit>>AuthorCommentEditPubsubSchema.passthrough();
export const ModeratorCommentEditPubsubSchema = LocalCommentEditAfterSigningSchema.pick(
    remeda.omit(editPubsubPickOptions, uniqueAuthorFields)
);
export const CommentEditPubsubMessageSchema = AuthorCommentEditPubsubSchema.merge(ModeratorCommentEditPubsubSchema).strict();

export const CommentEditsTableRowSchema = CommentEditPubsubMessageSchema.extend({
    authorAddress: CommentEditPubsubMessageSchema.shape.author.shape.address,
    insertedAt: PlebbitTimestampSchema,
    authorSignerAddress: SignerWithAddressPublicKeySchema.shape.address,
    isAuthorEdit: z.boolean(), // if true, then it was an author at the time of editing, otherwise it's a mod
    extraProps: z.object({}).passthrough().optional() // will hold unknown props
}).strict();

export const CommentEditReservedFields = remeda.difference(
    [
        ...remeda.keys.strict(CommentEditsTableRowSchema.shape),
        ...remeda.keys.strict(ChallengeRequestToEncryptBaseSchema.shape),
        "shortSubplebbitAddress",
        "state",
        "publishingState",
        "signer",
        "clients"
    ],
    remeda.keys.strict(CommentEditPubsubMessageSchema.shape)
);

export const CommentEditChallengeRequestToEncryptSchema = ChallengeRequestToEncryptBaseSchema.extend({
    publication: CommentEditPubsubMessageSchema.passthrough()
});

export const CreateCommentEditFunctionArgumentSchema = CreateCommentEditAuthorPublicationSchema.or(
    CreateCommentEditModeratorPublicationSchema
)
    .or(CommentEditPubsubMessageSchema)
    .or(CommentEditChallengeRequestToEncryptSchema);
