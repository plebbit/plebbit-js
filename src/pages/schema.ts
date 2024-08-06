import { z } from "zod";
import { CidStringSchema } from "../schema/schema.js";
import { CommentIpfsWithCidPostCidDefinedSchema, CommentUpdateSchema } from "../publications/comment/schema.js";

// Pages schemas here

export const PageIpfsSchema = z.object({
    comments: z.lazy(() => z.object({ comment: CommentIpfsWithCidPostCidDefinedSchema, update: CommentUpdateSchema }).array()),
    nextCid: CidStringSchema.optional()
});

// TODO change this to be flexible
export const PostSortNameSchema = z.enum([
    "hot",
    "new",
    "topHour",
    "topDay",
    "topWeek",
    "topMonth",
    "topYear",
    "topAll",
    "controversialHour",
    "controversialDay",
    "controversialWeek",
    "controversialMonth",
    "controversialYear",
    "controversialAll",
    "active"
]);

// Comment pages here

export const ReplySortNameSchema = z.enum(["topAll", "new", "old", "controversialAll"]);

// TODO combine the two into one schema
export const PostsPagesIpfsSchema = z.object({
    pages: z.record(PostSortNameSchema, PageIpfsSchema), // should be partial
    pageCids: z.record(PostSortNameSchema, CidStringSchema)
});

export const RepliesPagesIpfsSchema = z.object({
    pages: z.record(ReplySortNameSchema, PageIpfsSchema), // should be partial
    pageCids: z.record(ReplySortNameSchema, CidStringSchema)
});
