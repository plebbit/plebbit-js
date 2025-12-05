import { GetPageParam } from "./schema";

export const parsePageCidParams = (params: unknown) => GetPageParam.parse(params);
