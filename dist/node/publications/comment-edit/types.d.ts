import { z } from "zod";
import { AuthorCommentEditOptionsSchema, AuthorCommentEditPubsubSchema, CommentEditAuthorOptionsToSignSchema, CommentEditChallengeRequestToEncryptSchema, CommentEditModeratorOptionsToSignSchema, CommentEditPubsubMessageSchema, CreateCommentEditOptionsSchema, LocalCommentEditAfterSigningSchema, ModeratorCommentEditOptionsSchema } from "./schema";
import { CommentAuthorSchema } from "../../schema/schema";
import type { AuthorTypeWithCommentUpdate, JsonOfClass } from "../../types";
import { CommentEdit } from "./comment-edit";
export type LocalCommentEditOptions = z.infer<typeof LocalCommentEditAfterSigningSchema>;
export type CommentEditOptionsToSign = z.infer<typeof CommentEditModeratorOptionsToSignSchema> | z.infer<typeof CommentEditAuthorOptionsToSignSchema>;
export type CommentAuthorEditOptions = z.infer<typeof CommentAuthorSchema>;
export type ModeratorCommentEditOptions = z.infer<typeof ModeratorCommentEditOptionsSchema>;
export type AuthorCommentEditOptions = z.infer<typeof AuthorCommentEditOptionsSchema>;
export type CreateCommentEditOptions = z.infer<typeof CreateCommentEditOptionsSchema>;
export type AuthorCommentEdit = z.infer<typeof AuthorCommentEditPubsubSchema>;
export type CommentEditPubsubMessage = z.infer<typeof CommentEditPubsubMessageSchema>;
export type CommentEditChallengeRequestToEncryptType = z.infer<typeof CommentEditChallengeRequestToEncryptSchema>;
export type CommentEditTypeJson = JsonOfClass<CommentEdit>;
export interface CommentEditPubsubMessageWithSubplebbitAuthor extends CommentEditPubsubMessage {
    author: AuthorTypeWithCommentUpdate;
}