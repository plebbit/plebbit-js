import { z } from "zod";
import {
    CommentChallengeRequestToEncryptSchema,
    CommentIpfsSchema,
    CommentIpfsWithCidDefinedSchema,
    CommentIpfsWithCidPostCidDefinedSchema,
    CommentOptionsToSignSchema,
    CommentPubsubMessageSchema,
    CommentUpdateSchema,
    CommentWithinPageJsonSchema,
    CreateCommentOptionsSchema,
    LocalCommentSchema
} from "./schema.js";
import { SubplebbitAuthorSchema } from "../../schema/schema.js";
import { RpcCommentUpdateResultSchema } from "../../clients/rpc-client/schema.js";
import { ClassWithNoEnumerables } from "../../types.js";
import { Comment } from "./comment.js";

export type SubplebbitAuthor = z.infer<typeof SubplebbitAuthorSchema>;

export type CreateCommentOptions = z.infer<typeof CreateCommentOptionsSchema>;

export type CommentOptionsToSign = z.infer<typeof CommentOptionsToSignSchema>;

export type CommentPubsubMessage = z.infer<typeof CommentPubsubMessageSchema>;

export type LocalCommentOptions = z.infer<typeof LocalCommentSchema>;

export type CommentUpdate = z.infer<typeof CommentUpdateSchema>;

export type CommentWithinPageJson = z.infer<typeof CommentWithinPageJsonSchema>;

export type CommentIpfsType = z.infer<typeof CommentIpfsSchema>;

export type CommentIpfsWithCidDefined = z.infer<typeof CommentIpfsWithCidDefinedSchema>;

export type CommentIpfsWithCidPostCidDefined = z.infer<typeof CommentIpfsWithCidPostCidDefinedSchema>;

export type CommentChallengeRequestToEncryptType = z.infer<typeof CommentChallengeRequestToEncryptSchema>;

export type RpcCommentUpdateResultType = z.infer<typeof RpcCommentUpdateResultSchema>;

// JSON types

export type CommentJson = ClassWithNoEnumerables<Comment>;
