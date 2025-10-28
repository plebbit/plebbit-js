import { z } from "zod";
import { CidStringSchema, CreatePublicationUserOptionsSchema, FlairSchema, JsonSignatureSchema, PlebbitTimestampSchema, PublicationBaseBeforeSigning, SignerWithAddressPublicKeySchema, SubplebbitAuthorSchema } from "../../schema/schema.js";
import * as remeda from "remeda";
import { keysToOmitFromSignedPropertyNames } from "../../signer/constants.js";
export const ModeratorOptionsSchema = z
    .object({
    flair: FlairSchema.optional(),
    spoiler: z.boolean().optional(),
    nsfw: z.boolean().optional(),
    pinned: z.boolean().optional(),
    locked: z.boolean().optional(),
    approved: z.boolean().optional(), // approving a comment that's pending approval
    removed: z.boolean().optional(),
    purged: z.boolean().optional(),
    reason: z.string().optional(),
    author: SubplebbitAuthorSchema.pick({ banExpiresAt: true, flair: true }).loose().optional()
})
    .strict();
export const CreateCommentModerationOptionsSchema = CreatePublicationUserOptionsSchema.extend({
    commentModeration: ModeratorOptionsSchema.loose(),
    commentCid: CidStringSchema
}).strict();
// ChallengeRequest.publication
export const CommentModerationSignedPropertyNames = remeda.keys.strict(remeda.omit(CreateCommentModerationOptionsSchema.shape, keysToOmitFromSignedPropertyNames));
const commentModerationPickOptions = (remeda.mapToObj([...CommentModerationSignedPropertyNames, "signature"], (x) => [x, true]));
// Will be used by the sub when parsing request.publication
export const CommentModerationPubsubMessagePublicationSchema = CreateCommentModerationOptionsSchema.merge(PublicationBaseBeforeSigning)
    .extend({
    signature: JsonSignatureSchema,
    author: PublicationBaseBeforeSigning.shape.author.loose()
})
    .pick(commentModerationPickOptions)
    .strict();
export const CommentModerationsTableRowSchema = CommentModerationPubsubMessagePublicationSchema.extend({
    insertedAt: PlebbitTimestampSchema,
    modSignerAddress: SignerWithAddressPublicKeySchema.shape.address,
    extraProps: z.looseObject({}).optional()
});
export const CommentModerationChallengeRequestToEncryptSchema = CreateCommentModerationOptionsSchema.shape.challengeRequest
    .unwrap()
    .extend({
    commentModeration: CommentModerationPubsubMessagePublicationSchema.loose()
});
export const CommentModerationReservedFields = remeda.difference([
    ...remeda.keys.strict(CommentModerationsTableRowSchema.shape),
    ...remeda.keys.strict(CommentModerationChallengeRequestToEncryptSchema.shape),
    "shortSubplebbitAddress",
    "shortCommentCid",
    "state",
    "publishingState",
    "signer",
    "clients"
], remeda.keys.strict(CommentModerationPubsubMessagePublicationSchema.shape));
//# sourceMappingURL=schema.js.map