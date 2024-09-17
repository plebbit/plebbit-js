// Comment edit schemas here

import { z } from "zod";
import {
    FlairSchema,
    ChallengeRequestToEncryptBaseSchema,
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

export const CreateCommentEditOptionsSchema = CreatePublicationUserOptionsSchema.merge(AuthorCommentEditOptionsSchema).strict();

// Before signing, and after filling the missing props of CreateCommentEditUserOptions
export const CommentEditOptionsToSignSchema = CreateCommentEditOptionsSchema.merge(PublicationBaseBeforeSigning);

// after signing, and before initializing the local comment edit props
export const LocalCommentEditAfterSigningSchema = CommentEditOptionsToSignSchema.extend({
    signature: JsonSignatureSchema
});

// ChallengeRequest.publication

export const CommentEditSignedPropertyNames = remeda.keys.strict(
    remeda.omit(CreateCommentEditOptionsSchema.shape, keysToOmitFromSignedPropertyNames)
);
const editPubsubPickOptions = <Record<CommentEditSignedPropertyNamesUnion | "signature", true>>(
    remeda.mapToObj([...CommentEditSignedPropertyNames, "signature"], (x) => [x, true])
);
export const CommentEditPubsubMessagePublicationSchema = LocalCommentEditAfterSigningSchema.pick(editPubsubPickOptions).strict();

export const CommentEditPubsubMessagePublicationWithFlexibleAuthorSchema = CommentEditPubsubMessagePublicationSchema.extend({
    author: CommentEditPubsubMessagePublicationSchema.shape.author.passthrough()
}).passthrough();

export const CommentEditsTableRowSchema = CommentEditPubsubMessagePublicationSchema.extend({
    insertedAt: PlebbitTimestampSchema,
    authorSignerAddress: SignerWithAddressPublicKeySchema.shape.address,
    isAuthorEdit: z.boolean(), // if true, then it was an author at the time of editing
    extraProps: z.object({}).passthrough().optional(), // will hold unknown props,
    id: z.number().nonnegative().int()
}).strict();

export const CommentEditReservedFields = remeda.difference(
    remeda.unique([
        ...remeda.keys.strict(CommentEditsTableRowSchema.shape),
        ...remeda.keys.strict(ChallengeRequestToEncryptBaseSchema.shape),
        "shortCommentCid",
        "shortSubplebbitAddress",
        "state",
        "publishingState",
        "signer",
        "clients"
    ]),
    remeda.keys.strict(CommentEditPubsubMessagePublicationSchema.shape)
);

export const CommentEditChallengeRequestToEncryptSchema = ChallengeRequestToEncryptBaseSchema.extend({
    publication: CommentEditPubsubMessagePublicationWithFlexibleAuthorSchema.passthrough()
});

export const CreateCommentEditFunctionArgumentSchema = CreateCommentEditOptionsSchema.or(CommentEditPubsubMessagePublicationSchema).or(
    CommentEditChallengeRequestToEncryptSchema
);
