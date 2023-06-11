import QuickLRU from "quick-lru";
import { SubplebbitIpfsType } from "./types";

export enum CACHE_KEYS {
    SUBPLEBBIT_IPNS,
    INTERNAL_SUBPLEBBIT
}
export const subplebbitForPublishingCache = new QuickLRU<string, Pick<SubplebbitIpfsType, "address" | "encryption" | "pubsubTopic">>({
    maxSize: 100
}); // Cache for only 10 mins
