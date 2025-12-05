import { GetPageParam } from "./schema.js";

export const parsePageCidParams = (params: unknown) => GetPageParam.parse(params);
