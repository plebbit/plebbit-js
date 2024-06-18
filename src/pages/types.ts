import { z } from "zod";
import {
    PageIpfsSchema,
    PageJsonSchema,
    PostSortNameSchema,
    RepliesPagesIpfsSchema,
    RepliesPagesJsonSchema,
    ReplySortNameSchema
} from "./schema";
import type { CommentUpdatesRow, CommentsTableRow } from "../types";
import { Comment } from "../publications/comment/comment.js";

export interface PageInstanceType {
    comments: Comment[]; // TODO should be a comment instance with defined cid and other CommentWithCommentUpdateJson props
    nextCid?: string;
}

export type PageTypeJson = z.infer<typeof PageJsonSchema>;
export type PageIpfs = z.infer<typeof PageIpfsSchema>;

export interface PagesInstanceType {
    pages: Partial<Record<PostSortName | ReplySortName, PageInstanceType>>;
    pageCids: Record<PostSortName | ReplySortName, string> | {}; // defaults to empty if page instance is not initialized yet
}

export interface PagesTypeJson {
    pages: RepliesPagesTypeJson["pages"] | PostsPagesTypeJson["pages"];
    pageCids: RepliesPagesTypeJson["pageCids"] | PostsPagesTypeJson["pageCids"];
}

export interface PostsPagesTypeJson {
    pages: Partial<Record<PostSortName, PageTypeJson>>;
    pageCids: Record<PostSortName, string>;
}

export type RepliesPagesTypeIpfs = z.infer<typeof RepliesPagesIpfsSchema>;

export type RepliesPagesTypeJson = z.infer<typeof RepliesPagesJsonSchema>;

export interface PostsPagesTypeIpfs {
    pages: Partial<Record<PostSortName, PageIpfs>>;
    pageCids: Record<PostSortName, string>;
}

export type PagesTypeIpfs = RepliesPagesTypeIpfs | PostsPagesTypeIpfs;

export type PostSortName = z.infer<typeof PostSortNameSchema>;
export type ReplySortName = z.infer<typeof ReplySortNameSchema>;

export type Timeframe = "HOUR" | "DAY" | "WEEK" | "MONTH" | "YEAR" | "ALL";

export type SortProps = {
    score: (comment: { comment: CommentsTableRow; update: CommentUpdatesRow }) => number;
    timeframe?: Timeframe;
};

export type PostSort = Record<PostSortName, SortProps>;

export type ReplySort = Record<ReplySortName, SortProps>;
