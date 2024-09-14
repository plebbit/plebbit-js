import { z } from "zod";
import {
    CommentChallengeRequestToEncryptSchema,
    CommentIpfsSchema,
    CommentIpfsWithCidDefinedSchema,
    CommentIpfsWithCidPostCidDefinedSchema,
    CommentOptionsToSignSchema,
    CommentPubsubMessagePublicationSchema,
    CommentUpdateNoRepliesSchema,
    CreateCommentOptionsSchema,
    LocalCommentSchema,
    OriginalCommentFieldsBeforeCommentUpdateSchema
} from "./schema.js";
import { SubplebbitAuthorSchema } from "../../schema/schema.js";
import { RpcCommentUpdateResultSchema } from "../../clients/rpc-client/schema.js";
import type { AuthorTypeWithCommentUpdate, JsonOfClass } from "../../types.js";
import { Comment } from "./comment.js";
import type { RepliesPagesIpfsDefinedManuallyType, RepliesPagesTypeJson } from "../../pages/types.js";
import type { PublicationState } from "../types.js";

export type SubplebbitAuthor = z.infer<typeof SubplebbitAuthorSchema>;

export type CreateCommentOptions = z.infer<typeof CreateCommentOptionsSchema>;

export type CommentOptionsToSign = z.infer<typeof CommentOptionsToSignSchema>;

export type CommentPubsubMessagePublication = z.infer<typeof CommentPubsubMessagePublicationSchema>;

export type LocalCommentOptions = z.infer<typeof LocalCommentSchema>;

export type CommentUpdateType = z.infer<typeof CommentUpdateNoRepliesSchema> & {
    replies?: RepliesPagesIpfsDefinedManuallyType;
};

export type CommentIpfsType = z.infer<typeof CommentIpfsSchema>;

export type CommentIpfsWithCidDefined = z.infer<typeof CommentIpfsWithCidDefinedSchema>;

export type CommentIpfsWithCidPostCidDefined = z.infer<typeof CommentIpfsWithCidPostCidDefinedSchema>;

export type CommentChallengeRequestToEncryptType = z.infer<typeof CommentChallengeRequestToEncryptSchema>;

export type RpcCommentUpdateResultType = z.infer<typeof RpcCommentUpdateResultSchema>;

type CommentOriginalField = z.infer<typeof OriginalCommentFieldsBeforeCommentUpdateSchema>;

// JSON types

export type CommentJson = JsonOfClass<Comment>;

type AuthorWithShortSubplebbitAddress = AuthorTypeWithCommentUpdate & { shortAddress: string };

// subplebbit.posts.pages.hot.comments[0] will have this shape
export interface CommentWithinPageJson extends CommentIpfsWithCidPostCidDefined, Omit<CommentUpdateType, "replies"> {
    original: CommentOriginalField;
    shortCid: string;
    shortSubplebbitAddress: string;
    author: AuthorWithShortSubplebbitAddress;
    deleted?: boolean;
    replies?: Omit<RepliesPagesTypeJson, "clients">;
}

// Comment states

export type CommentState = PublicationState | "updating";

export type CommentUpdatingState =
    | "stopped"
    | "resolving-author-address"
    | "fetching-ipfs"
    | "fetching-update-ipfs"
    | "resolving-subplebbit-address"
    | "fetching-subplebbit-ipns"
    | "fetching-subplebbit-ipfs"
    | "failed"
    | "succeeded";

// Native types here

export interface CommentPubsubMessageWithSubplebbitAuthor extends CommentPubsubMessagePublication {
    author: AuthorTypeWithCommentUpdate;
}

export interface PostPubsubMessageWithSubplebbitAuthor extends CommentPubsubMessageWithSubplebbitAuthor {
    parentCid: undefined;
}

export interface ReplyPubsubMessageWithSubplebbitAuthor extends CommentPubsubMessageWithSubplebbitAuthor {
    parentCid: string;
}
