import { z } from "zod";
import {
    CommentModerationOptionsToSignSchema,
    CreateCommentModerationOptionsSchema,
    CommentModerationPubsubMessagePublicationSchema,
    LocalCommentModerationAfterSigningSchema,
    CommentModerationChallengeRequestToEncryptSchema
} from "./schema";
import type { AuthorTypeWithCommentUpdate, JsonOfClass } from "../../types";
import { CommentModeration } from "./comment-moderation";

export type CreateCommentModerationOptions = z.infer<typeof CreateCommentModerationOptionsSchema>;

export type CommentModerationOptionsToSign = z.infer<typeof CommentModerationOptionsToSignSchema>;

export type LocalCommentModerationAfterSigning = z.infer<typeof LocalCommentModerationAfterSigningSchema>;

export type CommentModerationPubsubMessagePublication = z.infer<typeof CommentModerationPubsubMessagePublicationSchema>;

export type CommentModerationTypeJson = JsonOfClass<CommentModeration>;

export type CommentModerationChallengeRequestToEncrypt = z.infer<typeof CommentModerationChallengeRequestToEncryptSchema>;

export interface CommentModerationPubsubMessagePublicationWithSubplebbitAuthor extends CommentModerationPubsubMessagePublication {
    author: AuthorTypeWithCommentUpdate;
}
