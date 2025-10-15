import { z } from "zod";
import { CommentIpfsSchema, CommentUpdateSchema } from "../../publications/comment/schema.js";
export const SubscriptionIdSchema = z.number().positive().int();
export const RpcCommentUpdateResultSchema = CommentIpfsSchema.loose().or(CommentUpdateSchema);
//# sourceMappingURL=schema.js.map