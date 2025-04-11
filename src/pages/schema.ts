import { z } from "zod";
import { CidStringSchema } from "../schema/schema.js";
import { CommentIpfsSchema, CommentUpdateSchema } from "../publications/comment/schema.js";
import type { PageIpfsManuallyDefined } from "./types.js";

// Pages schemas here

export const PageIpfsSchema = <z.ZodType<PageIpfsManuallyDefined>>z.object({
    comments: z.lazy(() =>
        z.object({ comment: CommentIpfsSchema.passthrough(), commentUpdate: CommentUpdateSchema.passthrough() }).array()
    ),
    nextCid: CidStringSchema.optional()
});

export const PostSortNameSchema = z
    .enum(["hot", "new", "topHour", "topDay", "topWeek", "topMonth", "topYear", "topAll", "active"])
    .or(z.string().min(1)); // this is added to allow flexibility

// Comment pages here

export const ReplySortNameSchema = z.enum(["best", "new", "old", "newFlat", "oldFlat"]).or(z.string().min(1)); // this is added to allow flexiblity;

// TODO combine the two into one schema
export const PostsPagesIpfsSchema = z.object({
    pages: z.record(PostSortNameSchema, PageIpfsSchema), // pre loaded pages
    pageCids: z.record(PostSortNameSchema, CidStringSchema).optional() // pageCids is optional if all posts can fit in one preloaded page
});

export const RepliesPagesIpfsSchema = z.object({
    pages: z.record(ReplySortNameSchema, PageIpfsSchema), // pre loaded pages
    pageCids: z.record(ReplySortNameSchema, CidStringSchema).optional() // pageCids is optional if all replies can fit in one preloaded page
});
