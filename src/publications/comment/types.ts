import { z } from "zod";
import {
    CommentChallengeRequestToEncryptSchema,
    CommentIpfsSchema,
    CommentPubsubMessagePublicationSchema,
    CommentSignedPropertyNames,
    CommentsTableRowSchema,
    CommentUpdateForChallengeVerificationSchema,
    CommentUpdateForChallengeVerificationSignedPropertyNames,
    CommentUpdateNoRepliesSchema,
    CommentUpdateSignedPropertyNames,
    CreateCommentOptionsSchema,
    OriginalCommentFieldsBeforeCommentUpdateSchema
} from "./schema.js";
import { SubplebbitAuthorSchema } from "../../schema/schema.js";
import { RpcCommentUpdateResultSchema } from "../../clients/rpc-client/schema.js";
import type { AuthorTypeWithCommentUpdate, JsonOfClass } from "../../types.js";
import { Comment } from "./comment.js";
import type { RepliesPagesIpfsDefinedManuallyType, RepliesPagesTypeJson } from "../../pages/types.js";
import type { PublicationRpcErrorToTransmit, PublicationState } from "../types.js";
import type { JsonSignature, SignerType } from "../../signer/types.js";

export type SubplebbitAuthor = z.infer<typeof SubplebbitAuthorSchema>;

export type CreateCommentOptions = z.infer<typeof CreateCommentOptionsSchema>;

export type CommentPubsubMessagePublication = z.infer<typeof CommentPubsubMessagePublicationSchema>;

export interface CommentOptionsToSign extends Omit<CommentPubsubMessagePublication, "signature"> {
    signer: SignerType;
}

export type CommentUpdateType = z.infer<typeof CommentUpdateNoRepliesSchema> & {
    replies?: RepliesPagesIpfsDefinedManuallyType;
};

export type CommentUpdateForChallengeVerification = z.infer<typeof CommentUpdateForChallengeVerificationSchema>;

export type CommentIpfsType = z.infer<typeof CommentIpfsSchema>;

export type CommentChallengeRequestToEncryptType = z.infer<typeof CommentChallengeRequestToEncryptSchema>;

export type RpcCommentUpdateResultType = z.infer<typeof RpcCommentUpdateResultSchema>;

type CommentOriginalField = z.infer<typeof OriginalCommentFieldsBeforeCommentUpdateSchema>;

// JSON types

export type CommentJson = JsonOfClass<Comment>;

type AuthorWithShortSubplebbitAddress = AuthorTypeWithCommentUpdate & { shortAddress: string };

export interface CommentIpfsWithCidDefined extends CommentIpfsType {
    cid: string;
}

export interface CommentIpfsWithCidPostCidDefined extends CommentIpfsWithCidDefined {
    postCid: string;
}

// subplebbit.posts.pages.hot.comments[0] will have this shape
export interface CommentWithinPageJson extends CommentIpfsWithCidPostCidDefined, Omit<CommentUpdateType, "replies"> {
    original: CommentOriginalField;
    shortCid: string;
    shortSubplebbitAddress: string;
    author: AuthorWithShortSubplebbitAddress;
    deleted?: boolean;
    replies?: Omit<RepliesPagesTypeJson, "clients">;
    raw: { comment: CommentIpfsType; commentUpdate: CommentUpdateType };
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
    | "succeeded"
    | "waiting-retry";

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

// Signatures here

export interface CommentPubsubMessagPublicationSignature extends JsonSignature {
    signedPropertyNames: typeof CommentSignedPropertyNames;
}

export interface CommentUpdateForChallengeVerificationSignature extends JsonSignature {
    signedPropertyNames: typeof CommentUpdateForChallengeVerificationSignedPropertyNames;
}

export interface CommentUpdateSignature extends JsonSignature {
    signedPropertyNames: typeof CommentUpdateSignedPropertyNames;
}

export type MinimumCommentFieldsToFetchPages = Pick<CommentIpfsWithCidDefined, "cid" | "subplebbitAddress" | "depth" | "postCid">;

export type CommentRpcErrorToTransmit = PublicationRpcErrorToTransmit & {
    details?: PublicationRpcErrorToTransmit["details"] & {
        newUpdatingState?: Comment["updatingState"];
    };
};

// DB Table

export type CommentsTableRow = z.infer<typeof CommentsTableRowSchema>;

export interface CommentsTableRowInsert extends Omit<CommentsTableRow, "rowid"> {}

// CommentUpdates table

export interface CommentUpdatesRow extends CommentUpdateType {
    insertedAt: number;
    postUpdatesBucket: number | undefined; // the post updates bucket of post CommentUpdate, not applicable to replies
    publishedToPostUpdatesMFS: boolean; // whether the comment latest update has been published
    postCommentUpdateCid: string | undefined; // the cid of the post comment update, cid v0. Not applicable to replies
}

export type CommentUpdatesTableRowInsert = CommentUpdatesRow;
