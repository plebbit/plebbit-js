import { RpcAuthorAddressParamSchema, RpcCidParamSchema, RpcCommentRepliesPageParamSchema, RpcSubplebbitAddressParamSchema, RpcSubplebbitPageParamSchema } from "./schema.js";
export const parseRpcCidParam = (params) => RpcCidParamSchema.loose().parse(params);
export const parseRpcSubplebbitAddressParam = (params) => RpcSubplebbitAddressParamSchema.loose().parse(params);
export const parseRpcAuthorAddressParam = (params) => RpcAuthorAddressParamSchema.loose().parse(params);
export const parseRpcSubplebbitPageParam = (params) => RpcSubplebbitPageParamSchema.loose().parse(params);
export const parseRpcCommentRepliesPageParam = (params) => RpcCommentRepliesPageParamSchema.loose().parse(params);
//# sourceMappingURL=rpc-schema-util.js.map