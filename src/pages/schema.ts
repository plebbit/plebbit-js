import { z } from "zod";
import { CommentCidSchema } from "../schema/schema.js";
import {
    CommentIpfsWithCidPostCidDefinedSchema,
    CommentUpdateSchema,
    CommentWithCommentUpdateJsonSchema
} from "../publications/comment/schema.js";

// Pages schemas here

export const PageIpfsSchema = z.object({
    comments: z.lazy(() => z.object({ comment: CommentIpfsWithCidPostCidDefinedSchema, update: CommentUpdateSchema }).array()),
    nextCid: CommentCidSchema.optional()
});

export const PageJsonSchema = z.object({
    comments: z.lazy(() => CommentWithCommentUpdateJsonSchema.array()),
    nextCid: CommentCidSchema.optional()
});

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

export const PostsPagesIpfsSchema = z.object({
    pages: z.record(PostSortNameSchema, PageIpfsSchema), // should be partial
    pageCids: z.record(PostSortNameSchema, CommentCidSchema)
});

export const RepliesPagesIpfsSchema = z.object({
    pages: z.record(ReplySortNameSchema, PageIpfsSchema), // should be partial
    pageCids: z.record(ReplySortNameSchema, CommentCidSchema)
});

export const RepliesPagesJsonSchema = z.object({
    pages: z.record(ReplySortNameSchema, PageJsonSchema),
    pageCids: RepliesPagesIpfsSchema.shape.pageCids
});

export const PostsPagesJsonSchema = z.object({
    pages: z.record(PostSortNameSchema, PageJsonSchema),
    pageCids: PostsPagesIpfsSchema.shape.pageCids
});
