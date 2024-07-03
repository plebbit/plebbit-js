import { z } from "zod";
import {
    AuthorCommentEditOptionsSchema,
    AuthorCommentEditPubsubSchema,
    CommentEditAuthorOptionsToSignSchema,
    CommentEditChallengeRequestToEncryptSchema,
    CommentEditJsonSchema,
    CommentEditModeratorOptionsToSignSchema,
    CommentEditPubsubMessageSchema,
    CreateCommentEditOptionsSchema,
    LocalCommentEditAfterSigningSchema,
    ModeratorCommentEditOptionsSchema
} from "./schema";
import { CommentAuthorSchema } from "../../schema/schema";
import { CommentEditPubsubMessageWithSubplebbitAuthorSchema } from "../../pubsub-messages/schema";

export type LocalCommentEditOptions = z.infer<typeof LocalCommentEditAfterSigningSchema>;

export type CommentEditOptionsToSign =
    | z.infer<typeof CommentEditModeratorOptionsToSignSchema>
    | z.infer<typeof CommentEditAuthorOptionsToSignSchema>;

export type CommentAuthorEditOptions = z.infer<typeof CommentAuthorSchema>;

// CommentEdit section

export type ModeratorCommentEditOptions = z.infer<typeof ModeratorCommentEditOptionsSchema>;

export type AuthorCommentEditOptions = z.infer<typeof AuthorCommentEditOptionsSchema>;

export type CreateCommentEditOptions = z.infer<typeof CreateCommentEditOptionsSchema>;

export type AuthorCommentEdit = z.infer<typeof AuthorCommentEditPubsubSchema>;

export type CommentEditPubsubMessage = z.infer<typeof CommentEditPubsubMessageSchema>;

export type CommentEditChallengeRequestToEncryptType = z.infer<typeof CommentEditChallengeRequestToEncryptSchema>;

export type CommentEditPubsubMessageWithSubplebbitAuthor = z.infer<typeof CommentEditPubsubMessageWithSubplebbitAuthorSchema>;

export type CommentEditTypeJson = z.infer<typeof CommentEditJsonSchema>;
