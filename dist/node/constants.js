import { LRUCache } from "lru-cache";
import { createPublicClient, http } from "viem";
import * as chains from "viem/chains"; // This will increase bundle size, should only import needed chains
import Logger from "@plebbit/plebbit-logger";
export var STORAGE_KEYS;
(function (STORAGE_KEYS) {
    STORAGE_KEYS[STORAGE_KEYS["INTERNAL_SUBPLEBBIT"] = 0] = "INTERNAL_SUBPLEBBIT";
    STORAGE_KEYS[STORAGE_KEYS["PERSISTENT_DELETED_SUBPLEBBITS"] = 1] = "PERSISTENT_DELETED_SUBPLEBBITS"; // These are basically sub db files that we're unable to remove for some reason on windows
})(STORAGE_KEYS || (STORAGE_KEYS = {}));
// Configs for LRU storage
export const postTimestampConfig = {
    cacheName: "plebbitjs_lrustorage_postTimestamp",
    maxItems: 500
};
export const commentPostUpdatesParentsPathConfig = {
    cacheName: "plebbitjs_lrustorage_commentPostUpdatesParentsPath",
    maxItems: 500
};
// Memory caches
export const subplebbitForPublishingCache = new LRUCache({
    max: 100,
    ttl: 600000
}); // Cache for only 10 mins
export const pageCidToSortTypesCache = new LRUCache({ max: 500 });
// Below will be the caches for promises of fetching or resolving
export const domainResolverPromiseCache = new LRUCache({ ttl: 60 * 1000, max: 50 }); // cache key will be (address + txtRecordName + chain + chainproviderUrl) and value will be the promise of resolving through viem or ethers
export const gatewayFetchPromiseCache = new LRUCache({ max: 200 }); // cache key will be url and value will be text of the response. The reason for low ttl is because we ipns is published regularly
export const p2pIpnsPromiseCache = new LRUCache({ max: 200 }); // cache key will be ipnsName and the result will be a promise of cid
export const p2pCidPromiseCache = new LRUCache({ max: 50, ttl: 60 * 1000 }); // cache key will be cid and the result will be a promise of content of cid
// Caches for signature validation
export const subplebbitVerificationCache = new LRUCache({ max: 100, ttl: 5 * 60 * 100 });
export const pageVerificationCache = new LRUCache({ max: 300 });
export const commentUpdateVerificationCache = new LRUCache({ max: 300 });
// Storing clients of viem here, and re-using them as needed
export const _viemClients = {}; // Should not be accessed
export const getViemClient = async (plebbit, chainTicker, chainProviderUrl) => {
    const cacheKey = chainTicker + chainProviderUrl;
    if (_viemClients[cacheKey])
        return _viemClients[cacheKey];
    const log = Logger("plebbit-js:getViemClient");
    log("Creating a new viem instance for chain ticker", chainTicker, "And chain provider url", chainProviderUrl);
    if (chainTicker === "eth" && chainProviderUrl === "viem") {
        _viemClients[cacheKey] = createPublicClient({
            chain: chains.mainnet,
            transport: http()
        });
    }
    else {
        // TODO should use viem's extractChain here
        const chainId = plebbit.chainProviders[chainTicker].chainId;
        const chain = Object.values(chains).find((chain) => chain.id === chainId);
        if (!chain)
            throw Error(`Was not able to create viem client for ${chainTicker} due to not being able to find chain id`);
        _viemClients[cacheKey] = createPublicClient({
            chain,
            transport: http(chainProviderUrl)
        });
    }
    return _viemClients[cacheKey];
};
//# sourceMappingURL=constants.js.map