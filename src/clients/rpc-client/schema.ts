import { z } from "zod";
import { CommentIpfsSchema, CommentUpdateSchema } from "../../publications/comment/schema";
export const SubscriptionIdSchema = z.number().positive().int();

export const RpcCommentUpdateResultSchema = CommentIpfsSchema.passthrough().or(CommentUpdateSchema);
