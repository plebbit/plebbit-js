import { z } from "zod";
import { PageIpfsSchema, PostSortNameSchema, PostsPagesIpfsSchema, RepliesPagesIpfsSchema, ReplySortNameSchema } from "./schema";
import type {
    CommentIpfsType,
    CommentUpdateForChallengeVerification,
    CommentUpdateType,
    CommentWithinPageJson
} from "../publications/comment/types";
import { JsonOfClass } from "../types";
import { PostsPages, RepliesPages } from "./pages";

export type PageIpfs = z.infer<typeof PageIpfsSchema>;

export interface PageIpfsManuallyDefined {
    comments: { comment: CommentIpfsType; commentUpdate: CommentUpdateType }[];
    nextCid?: string; // "QmXsYKgNH7XoZXdLko5uDvtWSRNE2AXuQ4u8KxVpCacrZx" for example
}

export type RepliesPagesTypeIpfs = z.infer<typeof RepliesPagesIpfsSchema>;

export type PostsPagesTypeIpfs = z.infer<typeof PostsPagesIpfsSchema>;

export type PagesTypeIpfs = RepliesPagesTypeIpfs | PostsPagesTypeIpfs;

export type PostSortName = z.infer<typeof PostSortNameSchema>;
export type ReplySortName = z.infer<typeof ReplySortNameSchema>;

export type ModQueueSortName = "pendingApproval";

export interface RepliesPagesIpfsDefinedManuallyType {
    pages: Record<ReplySortName, PageIpfsManuallyDefined>;
    pageCids?: Record<ReplySortName, string>;
}

export type Timeframe = "HOUR" | "DAY" | "WEEK" | "MONTH" | "YEAR" | "ALL";

export type SortProps = {
    score: (comment: { comment: CommentIpfsType; commentUpdate: CommentUpdateType }) => number;
    timeframe?: Timeframe;
    flat?: boolean;
};

export type PostSort = Record<PostSortName, SortProps>;

export type ReplySort = Record<ReplySortName, SortProps>;

// JSON types

export interface PageTypeJson extends Omit<PageIpfs, "comments"> {
    comments: CommentWithinPageJson[];
}

export type PostsPagesTypeJson = JsonOfClass<PostsPages>;
export type RepliesPagesTypeJson = JsonOfClass<RepliesPages>;

export type PagesTypeJson = PostsPagesTypeJson | RepliesPagesTypeJson;

export type ModQueueCommentInPage = {
    comment: CommentIpfsType;
    commentUpdate: CommentUpdateForChallengeVerification & { pendingApproval: true };
};

export type ModQueuePageIpfs = {
    comments: ModQueueCommentInPage[];
    nextCid?: string;
};
