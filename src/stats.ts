import { CacheInterface } from "./types";
import Logger from "@plebbit/plebbit-logger";

export default class Stats {
    private _cache: CacheInterface;
    constructor(cache: CacheInterface) {
        this._cache = cache;
    }

    async recordGatewaySuccess(gatewayUrl: string, type: "ipns" | "cid", timeElapsedMs: number) {
        const log = Logger("plebbit-js:stats:gateway:success");

        log.trace(`Attempting to record gateway (${gatewayUrl}) success for type (${type}) that took ${timeElapsedMs}ms`);
        const basekey = `STATS_${gatewayUrl}_${type}_SUCCESS`;
        const countKey = `${basekey}_COUNT`;
        const averageKey = `${basekey}_AVERAGE`;

        const curAverage: number = (await this._cache.getItem(averageKey)) || 0;
        const curCount: number = (await this._cache.getItem(countKey)) || 0;

        const newAverage = curAverage + (curCount === 0 ? timeElapsedMs : timeElapsedMs / curCount);
        const newCount = curCount + 1;

        await Promise.all([this._cache.setItem(averageKey, newAverage), this._cache.setItem(countKey, newCount)]);

        log.trace(
            `Updated gateway (${gatewayUrl}) success average from (${curAverage}) to ${newAverage} and count from (${curCount}) to (${newCount})`
        );
    }

    async recordGatewayFailure(gatewayUrl: string, type: "ipns" | "cid") {
        const log = Logger("plebbit-js:stats:gateway:failure");

        log.trace(`Attempting to record gateway (${gatewayUrl}) failure for type (${type})`);

        const basekey = `STATS_${gatewayUrl}_${type}_FAILURE`;
        const countKey = `${basekey}_COUNT`;

        const curCount: number = (await this._cache.getItem(countKey)) || 0;

        const newCount: number = curCount + 1;
        await this._cache.setItem(countKey, newCount);

        log.trace(`Updated gateway (${gatewayUrl}) failure  count from (${curCount}) to (${newCount})`);
    }
}
