import { z } from "zod";
import {
    RpcAuthorAddressParamSchema,
    RpcCidParamSchema,
    RpcCommentRepliesPageParamSchema,
    RpcSubplebbitAddressParamSchema,
    RpcSubplebbitPageParamSchema
} from "./schema.js";

export type CidRpcParam = z.infer<typeof RpcCidParamSchema>;
export type SubplebbitAddressRpcParam = z.infer<typeof RpcSubplebbitAddressParamSchema>;
export type AuthorAddressRpcParam = z.infer<typeof RpcAuthorAddressParamSchema>;
export type CommentPageRpcParam = z.infer<typeof RpcCommentRepliesPageParamSchema>;
export type SubplebbitPageRpcParam = z.infer<typeof RpcSubplebbitPageParamSchema>;
