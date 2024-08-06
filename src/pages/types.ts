import { z } from "zod";
import { PageIpfsSchema, PostSortNameSchema, PostsPagesIpfsSchema, RepliesPagesIpfsSchema, ReplySortNameSchema } from "./schema";
import type { CommentIpfsWithCidPostCidDefined, CommentUpdate, CommentWithinPageJson } from "../publications/comment/types";
import { ClassWithNoEnumerables } from "../types";
import { PostsPages, RepliesPages } from "./pages";

export type PageIpfs = z.infer<typeof PageIpfsSchema>;

export type RepliesPagesTypeIpfs = z.infer<typeof RepliesPagesIpfsSchema>;

export type PostsPagesTypeIpfs = z.infer<typeof PostsPagesIpfsSchema>;

export type PagesTypeIpfs = RepliesPagesTypeIpfs | PostsPagesTypeIpfs;

export type PostSortName = z.infer<typeof PostSortNameSchema>;
export type ReplySortName = z.infer<typeof ReplySortNameSchema>;

export type Timeframe = "HOUR" | "DAY" | "WEEK" | "MONTH" | "YEAR" | "ALL";

export type SortProps = {
    score: (comment: { comment: CommentIpfsWithCidPostCidDefined; update: CommentUpdate }) => number;
    timeframe?: Timeframe;
};

export type PostSort = Record<PostSortName, SortProps>;

export type ReplySort = Record<ReplySortName, SortProps>;

// JSON types

export interface PageTypeJson extends Omit<PageIpfs, "comments"> {
    comments: CommentWithinPageJson[];
}

export type PostsPagesTypeJson = ClassWithNoEnumerables<PostsPages>;
export type RepliesPagesTypeJson = ClassWithNoEnumerables<RepliesPages>;

export type PagesTypeJson = PostsPagesTypeJson | RepliesPagesTypeJson;
