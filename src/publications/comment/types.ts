import { z } from "zod";
import {
    CommentChallengeRequestToEncryptSchema,
    CommentIpfsSchema,
    CommentIpfsWithCidSchema,
    CommentJsonAfterChallengeVerificationNoCommentUpdateSchema,
    CommentJsonBeforeChallengeVerificationSchema,
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

// Below is what's used to initialize a local publication to be published

export type LocalCommentOptions = z.infer<typeof LocalCommentSchema>;

export type CommentUpdate = z.infer<typeof CommentUpdateSchema>;

export type CommentWithCommentUpdateJson = z.infer<typeof CommentWithCommentUpdateJsonSchema>;

export type CommentIpfsType = z.infer<typeof CommentIpfsSchema>;

export type CommentIpfsWithCid = z.infer<typeof CommentIpfsWithCidSchema>;

type CommentTypeJsonAfterChallengeVerificationNoCommentUpdate = z.infer<typeof CommentJsonAfterChallengeVerificationNoCommentUpdateSchema>;

type CommentTypeJsonBeforeChallengeVerification = z.infer<typeof CommentJsonBeforeChallengeVerificationSchema>;

export type CommentTypeJson =
    | CommentWithCommentUpdateJson
    | CommentTypeJsonAfterChallengeVerificationNoCommentUpdate
    | CommentTypeJsonBeforeChallengeVerification;

export type CommentChallengeRequestToEncryptType = z.infer<typeof CommentChallengeRequestToEncryptSchema>;
