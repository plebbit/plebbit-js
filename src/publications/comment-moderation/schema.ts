import { z } from "zod";
import {
    ChallengeRequestToEncryptBaseSchema,
    CidStringSchema,
    CommentAuthorSchema,
    CreatePublicationUserOptionsSchema,
    FlairSchema,
    JsonSignatureSchema,
    PlebbitTimestampSchema,
    PublicationBaseBeforeSigning,
    SignerWithAddressPublicKeySchema,
    SubplebbitAuthorSchema
} from "../../schema/schema";
import * as remeda from "remeda";
import { keysToOmitFromSignedPropertyNames } from "../../signer/constants";
import { CommentModerationSignedPropertyNamesUnion } from "../../signer/types";

// // I have to explicitly include the cast here, it may be fixed in the future
// export const uniqueModFields = <["pinned", "locked", "removed", "commentAuthor"]>(
//     remeda.difference(remeda.keys.strict(ModeratorOptionsSchema.shape), remeda.keys.strict(AuthorCommentEditOptionsSchema.shape))
// );
export const ModeratorOptionsSchema = z
    .object({
        flair: FlairSchema.optional(),
        spoiler: z.boolean().optional(),
        pinned: z.boolean().optional(),
        locked: z.boolean().optional(),
        removed: z.boolean().optional(),
        reason: z.string().optional(),
        author: SubplebbitAuthorSchema.pick({ banExpiresAt: true, flair: true }).passthrough().optional()
    })
    .strict();

export const CreateCommentModerationOptionsSchema = CreatePublicationUserOptionsSchema.extend({
    commentModeration: ModeratorOptionsSchema.passthrough(),
    commentCid: CidStringSchema
}).strict();

export const CommentModerationOptionsToSignSchema = CreateCommentModerationOptionsSchema.merge(PublicationBaseBeforeSigning);

export const LocalCommentModerationAfterSigningSchema = CommentModerationOptionsToSignSchema.extend({
    signature: JsonSignatureSchema
}).merge(ChallengeRequestToEncryptBaseSchema);

// ChallengeRequest.publication

export const CommentModerationSignedPropertyNames = remeda.keys.strict(
    remeda.omit(CreateCommentModerationOptionsSchema.shape, keysToOmitFromSignedPropertyNames)
);

const commentModerationPickOptions = <Record<CommentModerationSignedPropertyNamesUnion | "signature", true>>(
    remeda.mapToObj([...CommentModerationSignedPropertyNames, "signature"], (x) => [x, true])
);

// Will be used by the sub when parsing request.publication
export const CommentModerationPubsubMessagePublicationSchema = LocalCommentModerationAfterSigningSchema.pick(commentModerationPickOptions)
    .merge(z.object({ author: LocalCommentModerationAfterSigningSchema.shape.author.passthrough() }))
    .strict();

export const CommentModerationsTableRowSchema = CommentModerationPubsubMessagePublicationSchema.extend({
    insertedAt: PlebbitTimestampSchema,
    id: z.number().nonnegative().int(),
    modSignerAddress: SignerWithAddressPublicKeySchema.shape.address,
    extraProps: z.object({}).passthrough().optional()
});

export const CommentModerationReservedFields = remeda.difference(
    [
        ...remeda.keys.strict(CommentModerationsTableRowSchema.shape),
        ...remeda.keys.strict(ChallengeRequestToEncryptBaseSchema.shape),
        ...remeda.keys.strict(LocalCommentModerationAfterSigningSchema.shape),
        "shortSubplebbitAddress",
        "shortCommentCid",
        "state",
        "publishingState",
        "signer",
        "clients"
    ],
    remeda.keys.strict(CommentModerationPubsubMessagePublicationSchema.shape)
);

export const CommentModerationChallengeRequestToEncryptSchema = ChallengeRequestToEncryptBaseSchema.extend({
    publication: CommentModerationPubsubMessagePublicationSchema.passthrough()
});

export const CreateCommentModerationFunctionArgumentSchema = CreateCommentModerationOptionsSchema.or(
    CommentModerationPubsubMessagePublicationSchema
).or(CommentModerationChallengeRequestToEncryptSchema);
