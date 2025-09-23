import { z } from "zod";
import { createSchemaRowParser } from "../../../schema/schema-util.js";
import {
    CommentIpfsSchema,
    CommentUpdateSchema,
    CommentUpdateTableRowSchema,
    CommentsTableRowSchema
} from "../../../publications/comment/schema.js";
import { CommentEditsTableRowSchema } from "../../../publications/comment-edit/schema.js";
import { VoteTablesRowSchema } from "../../../publications/vote/schema.js";
import type { CommentUpdateType, CommentsTableRow, CommentUpdatesRow, CommentIpfsType } from "../../../publications/comment/types.js";
import type { CommentEditsTableRow } from "../../../publications/comment-edit/types.js";
import type { VotesTableRow } from "../../../publications/vote/types.js";

// Types for query results with prefixed columns
export type CommentIpfsPrefixedColumns = {
    [K in keyof CommentsTableRow as `commentIpfs_${string & K}`]?: CommentsTableRow[K];
};

export type CommentUpdatePrefixedColumns = {
    [K in keyof CommentUpdatesRow as `commentUpdate_${string & K}`]?: CommentUpdatesRow[K];
};

export type PrefixedCommentRow = CommentIpfsPrefixedColumns & CommentUpdatePrefixedColumns;

const CommentIpfsRowWithExtraPropsSchema = CommentIpfsSchema.extend({
    extraProps: CommentsTableRowSchema.shape.extraProps
});

const CommentEditsRowWithLegacySchema = CommentEditsTableRowSchema.extend({
    commentAuthor: z.string().optional(),
    pendingApproval: z.boolean().optional(),
    id: z.union([z.number().int(), z.string()]).optional()
});

const parsePrefixedCommentIpfsSchema = createSchemaRowParser(CommentIpfsRowWithExtraPropsSchema, { prefix: "commentIpfs_" });
const parsePrefixedCommentUpdateSchema = createSchemaRowParser(CommentUpdateSchema, { prefix: "commentUpdate_" });
const parseCommentsTableRowSchema = createSchemaRowParser(CommentsTableRowSchema);
const parseCommentUpdatesTableRowSchema = createSchemaRowParser(CommentUpdateTableRowSchema);
const parseCommentEditsTableRowSchema = createSchemaRowParser(CommentEditsRowWithLegacySchema);
const parseVotesTableRowSchema = createSchemaRowParser(VoteTablesRowSchema);

export function parsePrefixedComment(row: PrefixedCommentRow): {
    comment: CommentIpfsType;
    commentUpdate: CommentUpdateType;
    extras: Record<string, unknown>;
} {
    if (row["commentIpfs_depth"] === 0) delete row["commentIpfs_postCid"];

    const commentIpfsParsed = parsePrefixedCommentIpfsSchema(row);
    const commentUpdateParsed = parsePrefixedCommentUpdateSchema(row);

    return {
        comment: commentIpfsParsed.data,
        commentUpdate: commentUpdateParsed.data,
        extras: { ...commentIpfsParsed.extras, ...commentUpdateParsed.extras }
    };
}

export function parseCommentsTableRow(row: unknown): CommentsTableRow {
    const { data } = parseCommentsTableRowSchema(row as Record<string, unknown>);
    return data as CommentsTableRow;
}

export function parseCommentUpdateRow(row: unknown): CommentUpdatesRow {
    const { data } = parseCommentUpdatesTableRowSchema(row as Record<string, unknown>);
    return data as CommentUpdatesRow;
}

export function parseCommentEditsRow(row: unknown): CommentEditsTableRow & {
    commentAuthor?: string;
    pendingApproval?: boolean;
    id?: number | string;
} {
    const { data } = parseCommentEditsTableRowSchema(row as Record<string, unknown>);
    const parsed = data as CommentEditsTableRow & {
        commentAuthor?: string;
        pendingApproval?: boolean;
        id?: number | string;
    };

    if (typeof parsed.id === "string") {
        const numericId = Number(parsed.id);
        if (!Number.isNaN(numericId)) parsed.id = numericId;
    }

    return parsed;
}

export function parseVoteRow(row: unknown): VotesTableRow {
    const { data } = parseVotesTableRowSchema(row as Record<string, unknown>);
    return data as VotesTableRow;
}
