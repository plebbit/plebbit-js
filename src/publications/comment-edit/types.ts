import { z } from "zod";
import {
    AuthorCommentEditOptionsSchema,
    CommentEditOptionsToSignSchema,
    CommentEditChallengeRequestToEncryptSchema,
    CreateCommentEditOptionsSchema,
    LocalCommentEditAfterSigningSchema,
    CommentEditPubsubMessagePublicationSchema
} from "./schema";
import { CommentAuthorSchema } from "../../schema/schema";
import type { AuthorTypeWithCommentUpdate, JsonOfClass } from "../../types";
import { CommentEdit } from "./comment-edit";
import { CommentModerationsTableRowSchema } from "../comment-moderation/schema";

export type LocalCommentEditOptions = z.infer<typeof LocalCommentEditAfterSigningSchema>;

export type CommentEditOptionsToSign = z.infer<typeof CommentEditOptionsToSignSchema>;

export type CommentAuthorEditOptions = z.infer<typeof CommentAuthorSchema>;

// CommentEdit section

export type AuthorCommentEditOptions = z.infer<typeof AuthorCommentEditOptionsSchema>;

export type CreateCommentEditOptions = z.infer<typeof CreateCommentEditOptionsSchema>;

export type CommentEditPubsubMessagePublication = z.infer<typeof CommentEditPubsubMessagePublicationSchema>;

export type CommentEditChallengeRequestToEncryptType = z.infer<typeof CommentEditChallengeRequestToEncryptSchema>;

export type CommentEditTypeJson = JsonOfClass<CommentEdit>;

export type CommentModerationTableRow = z.infer<typeof CommentModerationsTableRowSchema>;

export interface CommentEditPubsubMessagePublicationWithSubplebbitAuthor extends CommentEditPubsubMessagePublication {
    author: AuthorTypeWithCommentUpdate;
}
