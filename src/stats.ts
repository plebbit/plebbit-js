import { Plebbit } from "./plebbit";
import Logger from "@plebbit/plebbit-logger";
import assert from "assert";
import lodash from "lodash";
import { Chain } from "./types";

type StatTypes = "ipns" | "cid" | "pubsub-publish" | Chain;
export default class Stats {
    private _plebbit: Pick<Plebbit, "_cache" | "clients">;
    constructor(plebbit: Stats["_plebbit"]) {
        this._plebbit = plebbit;
    }

    toJSON() {
        return undefined;
    }

    private _getSuccessCountKey(gatewayUrl: string, type: StatTypes) {
        return `${this._getBaseKey(gatewayUrl, type)}_COUNT_SUCCESS`;
    }

    private _getSuccessAverageKey(gatewayUrl: string, type: StatTypes) {
        return `${this._getBaseKey(gatewayUrl, type)}_AVERAGE_SUCCESS`;
    }

    async recordGatewaySuccess(gatewayUrl: string, type: StatTypes, timeElapsedMs: number) {
        const log = Logger("plebbit-js:stats:gateway:success");

        log.trace(`Attempting to record gateway (${gatewayUrl}) success for type (${type}) that took ${timeElapsedMs}ms`);
        const countKey = this._getSuccessCountKey(gatewayUrl, type);
        const averageKey = this._getSuccessAverageKey(gatewayUrl, type);

        const curAverage: number = (await this._plebbit._cache.getItem(averageKey)) || 0;
        const curCount: number = (await this._plebbit._cache.getItem(countKey)) || 0;

        const newAverage = curAverage + (timeElapsedMs - curAverage) / (curCount + 1);
        const newCount = curCount + 1;

        await Promise.all([this._plebbit._cache.setItem(averageKey, newAverage), this._plebbit._cache.setItem(countKey, newCount)]);

        log.trace(
            `Updated gateway (${gatewayUrl}) success average from (${curAverage}) to ${newAverage} and count from (${curCount}) to (${newCount}) for type (${type})`
        );
    }

    private _getBaseKey(url: string, type: StatTypes) {
        return `STATS_${url}_${type}`;
    }

    private _getFailuresCountKey(url: string, type: StatTypes) {
        return `${this._getBaseKey(url, type)}_COUNT_FAILURE`;
    }

    async recordGatewayFailure(gatewayUrl: string, type: StatTypes) {
        const log = Logger("plebbit-js:stats:gateway:failure");

        log.trace(`Attempting to record gateway (${gatewayUrl}) failure for type (${type})`);

        const countKey = this._getFailuresCountKey(gatewayUrl, type);

        const curCount: number = (await this._plebbit._cache.getItem(countKey)) || 0;

        const newCount: number = curCount + 1;
        await this._plebbit._cache.setItem(countKey, newCount);

        log.trace(`Updated gateway (${gatewayUrl}) failure  count from (${curCount}) to (${newCount}) for type (${type})`);
    }

    private _gatewayScore(failureCounts: number, successCounts: number, successAverageMs: number) {
        // Thanks for @thisisnotph for their input on this formula
        return (
            (1 / (successAverageMs + 150) / (1 / (successAverageMs + 100) + 1 / 150)) * 0.2 +
            ((successCounts + 0.288) / (failureCounts * 2 + successCounts + 1)) * 0.8
        );
    }

    async sortGatewaysAccordingToScore(type: StatTypes): Promise<string[]> {
        const log = Logger("plebbit-js:stats:gateway:sort");
        const gatewayType =
            type === "cid" || type === "ipns"
                ? "ipfsGateways"
                : type === "pubsub-publish"
                ? "pubsubClients"
                : type === "eth" || type === "avax" || type === "matic"
                ? "chainProviders"
                : undefined;
        assert(gatewayType);
        const gateways =
            gatewayType === "chainProviders"
                ? this._plebbit.clients.chainProviders[type].urls
                : Object.keys(this._plebbit.clients[gatewayType]);

        const score = async (gatewayUrl: string) => {
            const failureCounts: number = (await this._plebbit._cache.getItem(this._getFailuresCountKey(gatewayUrl, type))) || 0;
            const successCounts: number = (await this._plebbit._cache.getItem(this._getSuccessCountKey(gatewayUrl, type))) || 0;
            const successAverageMs: number = (await this._plebbit._cache.getItem(this._getSuccessAverageKey(gatewayUrl, type))) || 0;

            const gatewayScore = this._gatewayScore(failureCounts, successCounts, successAverageMs);
            log.trace(`gateway (${gatewayUrl}) score is (${gatewayScore}) for type (${type})`);
            return score;
        };

        const gatewaysSorted = lodash.sortBy(gateways, score);
        return gatewaysSorted;
    }
}
