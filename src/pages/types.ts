import { z } from "zod";
import { PageIpfsSchema, PostSortNameSchema, PostsPagesIpfsSchema, RepliesPagesIpfsSchema, ReplySortNameSchema } from "./schema";
import type { CommentIpfsWithCidPostCidDefined, CommentUpdateType, CommentWithinPageJson } from "../publications/comment/types";
import { JsonOfClass } from "../types";
import { PostsPages, RepliesPages } from "./pages";

export type PageIpfs = z.infer<typeof PageIpfsSchema>;

export interface PageIpfsManuallyDefined {
    comments: { comment: CommentIpfsWithCidPostCidDefined; commentUpdate: CommentUpdateType }[];
    nextCid?: string;
}

export type RepliesPagesTypeIpfs = z.infer<typeof RepliesPagesIpfsSchema>;

export type PostsPagesTypeIpfs = z.infer<typeof PostsPagesIpfsSchema>;

export type PagesTypeIpfs = RepliesPagesTypeIpfs | PostsPagesTypeIpfs;

export type PostSortName = z.infer<typeof PostSortNameSchema>;
export type ReplySortName = z.infer<typeof ReplySortNameSchema>;

export interface RepliesPagesIpfsDefinedManuallyType {
    pages: Record<ReplySortName, PageIpfsManuallyDefined>;
    pageCids: Record<ReplySortName, string>;
}

export type Timeframe = "HOUR" | "DAY" | "WEEK" | "MONTH" | "YEAR" | "ALL";

export type SortProps = {
    score: (comment: { comment: CommentIpfsWithCidPostCidDefined; commentUpdate: CommentUpdateType }) => number;
    timeframe?: Timeframe;
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
