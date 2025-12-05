import { z } from "zod";
import { CommentIpfsSchema, CommentUpdateSchema } from "../../publications/comment/schema.js";
import { AuthorAddressSchema, CidStringSchema, SubplebbitAddressSchema } from "../../schema/schema.js";
export const SubscriptionIdSchema = z.number().positive().int();

export const RpcCommentUpdateResultSchema = CommentIpfsSchema.loose().or(CommentUpdateSchema);

export const RpcCidParamSchema = z.object({ cid: CidStringSchema });
export const RpcSubplebbitAddressParamSchema = z.object({ address: SubplebbitAddressSchema });
export const RpcAuthorAddressParamSchema = z.object({ address: AuthorAddressSchema });
export const RpcSubplebbitPageParamSchema = RpcCidParamSchema.extend({ subplebbitAddress: SubplebbitAddressSchema });
export const RpcCommentRepliesPageParamSchema = RpcSubplebbitPageParamSchema.extend({ commentCid: CidStringSchema });
