import { z } from "zod";
import {
    CommentChallengeRequestToEncryptSchema,
    CommentIpfsSchema,
    CommentIpfsWithCidDefinedSchema,
    CommentIpfsWithCidPostCidDefinedSchema,
    CommentJsonSchema,
    CommentOptionsToSignSchema,
    CommentPubsubMessageSchema,
    CommentUpdateSchema,
    CommentWithCommentUpdateJsonSchema,
    CreateCommentOptionsSchema,
    LocalCommentSchema
} from "./schema";
import { SubplebbitAuthorSchema } from "../../schema/schema";

export type SubplebbitAuthor = z.infer<typeof SubplebbitAuthorSchema>;

export type CreateCommentOptions = z.infer<typeof CreateCommentOptionsSchema>;

export type CommentOptionsToSign = z.infer<typeof CommentOptionsToSignSchema>;

export type CommentPubsubMessage = z.infer<typeof CommentPubsubMessageSchema>;

export type LocalCommentOptions = z.infer<typeof LocalCommentSchema>;

export type CommentUpdate = z.infer<typeof CommentUpdateSchema>;

export type CommentWithCommentUpdateJson = z.infer<typeof CommentWithCommentUpdateJsonSchema>;

export type CommentIpfsType = z.infer<typeof CommentIpfsSchema>;

export type CommentIpfsWithCidDefined = z.infer<typeof CommentIpfsWithCidDefinedSchema>;

export type CommentIpfsWithCidPostCidDefined = z.infer<typeof CommentIpfsWithCidPostCidDefinedSchema>;

export type CommentTypeJson = z.infer<typeof CommentJsonSchema>;

export type CommentChallengeRequestToEncryptType = z.infer<typeof CommentChallengeRequestToEncryptSchema>;
