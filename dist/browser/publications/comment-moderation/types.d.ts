import { z } from "zod";
import { CreateCommentModerationOptionsSchema, CommentModerationPubsubMessagePublicationSchema, CommentModerationChallengeRequestToEncryptSchema, CommentModerationSignedPropertyNames, CommentModerationsTableRowSchema } from "./schema";
import type { AuthorTypeWithCommentUpdate, JsonOfClass } from "../../types";
import type { CommentModeration } from "./comment-moderation";
import type { JsonSignature, SignerType } from "../../signer/types";
export type CreateCommentModerationOptions = z.infer<typeof CreateCommentModerationOptionsSchema>;
export type CommentModerationTypeJson = JsonOfClass<CommentModeration>;
export type CommentModerationChallengeRequestToEncrypt = z.infer<typeof CommentModerationChallengeRequestToEncryptSchema>;
export interface CommentModerationOptionsToSign extends Omit<CommentModerationPubsubMessagePublication, "signature"> {
    signer: SignerType;
}
export interface CommentModerationSignature extends JsonSignature {
    signedPropertyNames: typeof CommentModerationSignedPropertyNames;
}
export type CommentModerationPubsubMessagePublication = z.infer<typeof CommentModerationPubsubMessagePublicationSchema>;
export interface CommentModerationPubsubMessagePublicationWithSubplebbitAuthor extends CommentModerationPubsubMessagePublication {
    author: AuthorTypeWithCommentUpdate;
}
export type CommentModerationTableRow = z.infer<typeof CommentModerationsTableRowSchema>;
export interface CommentModerationsTableRowInsert extends Omit<CommentModerationTableRow, "rowid"> {
}
