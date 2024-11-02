import { z } from "zod";
import { AuthorCommentEditOptionsSchema, CommentEditChallengeRequestToEncryptSchema, CreateCommentEditOptionsSchema, CommentEditPubsubMessagePublicationSchema, CommentEditSignedPropertyNames } from "./schema";
import { CommentAuthorSchema } from "../../schema/schema";
import type { AuthorTypeWithCommentUpdate, JsonOfClass } from "../../types";
import { CommentEdit } from "./comment-edit";
import { CommentModerationsTableRowSchema } from "../comment-moderation/schema";
import type { JsonSignature, SignerType } from "../../signer/types";
export type CommentAuthorEditOptions = z.infer<typeof CommentAuthorSchema>;
export type AuthorCommentEditOptions = z.infer<typeof AuthorCommentEditOptionsSchema>;
export type CreateCommentEditOptions = z.infer<typeof CreateCommentEditOptionsSchema>;
export type CommentEditChallengeRequestToEncryptType = z.infer<typeof CommentEditChallengeRequestToEncryptSchema>;
export type CommentEditTypeJson = JsonOfClass<CommentEdit>;
export type CommentModerationTableRow = z.infer<typeof CommentModerationsTableRowSchema>;
export interface CommentEditOptionsToSign extends Omit<CommentEditPubsubMessagePublication, "signature"> {
    signer: SignerType;
}
export interface CommentEditSignature extends JsonSignature {
    signedPropertyNames: typeof CommentEditSignedPropertyNames;
}
export type CommentEditPubsubMessagePublication = z.infer<typeof CommentEditPubsubMessagePublicationSchema>;
export interface CommentEditPubsubMessagePublicationWithSubplebbitAuthor extends CommentEditPubsubMessagePublication {
    author: AuthorTypeWithCommentUpdate;
}
