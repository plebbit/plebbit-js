import { z } from "zod";
import {
    AuthorCommentEditOptionsSchema,
    AuthorCommentEditPubsubSchema,
    CommentEditAuthorOptionsToSignSchema,
    CommentEditJsonSchema,
    CommentEditModeratorOptionsToSignSchema,
    CommentEditPubsubMessageSchema,
    CreateCommentEditOptionsSchema,
    DecryptedChallengeRequestCommentEditSchema,
    LocalCommentEditAfterSigningSchema,
    ModeratorCommentEditOptionsSchema
} from "./schema";
import type { AuthorPubsubType } from "../../types";
import { SubplebbitAuthor } from "../comment/types";
import { CommentAuthorSchema } from "../../schema/schema";

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

export type DecryptedChallengeRequestCommentEdit = z.infer<typeof DecryptedChallengeRequestCommentEditSchema>;

// TODO below type should be replaced with a generic
export type ChallengeRequestCommentEditWithSubplebbitAuthor = CommentEditPubsubMessage & {
    author: AuthorPubsubType & { subplebbit: SubplebbitAuthor | undefined };
};

export type CommentEditTypeJson = z.infer<typeof CommentEditJsonSchema>;