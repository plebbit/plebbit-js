import lru from "tiny-lru/lib/tiny-lru";
import { SubplebbitIpfsType } from "./types";
export enum CACHE_KEYS {
    SUBPLEBBIT_IPNS,
    INTERNAL_SUBPLEBBIT
}

export const subplebbitForPublishingCache = lru<Pick<SubplebbitIpfsType, "address" | "encryption" | "pubsubTopic">>(100, 600000); // Cache for only 10 mins
export const pageCidToSortTypesCache = lru<string[]>(500, 0);
