import { Plebbit } from "./plebbit";
import Logger from "@plebbit/plebbit-logger";
import lodash from "lodash";

export default class Stats {
    private _plebbit: Pick<Plebbit, "_cache" | "clients">;
    constructor(plebbit: Stats["_plebbit"]) {
        this._plebbit = plebbit;
    }

    toJSON() {
        return undefined;
    }

    private _getSuccessCountKey(gatewayUrl: string, type: "ipns" | "cid") {
        return `${this._getBaseKey(gatewayUrl, type)}_COUNT_SUCCESS`;
    }

    private _getSuccessAverageKey(gatewayUrl: string, type: "ipns" | "cid") {
        return `${this._getBaseKey(gatewayUrl, type)}_AVERAGE_SUCCESS`;
    }

    async recordGatewaySuccess(gatewayUrl: string, type: "ipns" | "cid", timeElapsedMs: number) {
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
            `Updated gateway (${gatewayUrl}) success average from (${curAverage}) to ${newAverage} and count from (${curCount}) to (${newCount})`
        );
    }

    private _getBaseKey(gatewayUrl: string, type: "ipns" | "cid") {
        return `STATS_${gatewayUrl}_${type}`;
    }

    private _getFailuresCountKey(gatewayUrl: string, type: "ipns" | "cid") {
        return `${this._getBaseKey(gatewayUrl, type)}_COUNT_FAILURE`;
    }

    async recordGatewayFailure(gatewayUrl: string, type: "ipns" | "cid") {
        const log = Logger("plebbit-js:stats:gateway:failure");

        log.trace(`Attempting to record gateway (${gatewayUrl}) failure for type (${type})`);

        const countKey = this._getFailuresCountKey(gatewayUrl, type);

        const curCount: number = (await this._plebbit._cache.getItem(countKey)) || 0;

        const newCount: number = curCount + 1;
        await this._plebbit._cache.setItem(countKey, newCount);

        log.trace(`Updated gateway (${gatewayUrl}) failure  count from (${curCount}) to (${newCount})`);
    }

    async sortGatewaysAccordingToScore(type: "ipns" | "cid"): Promise<string[]> {
        const log = Logger("plebbit-js:stats:gateway:sort");
        const ipfsGateways = Object.keys(this._plebbit.clients.ipfsGateways);

        const score = async (gatewayUrl: string) => {
            const failureCounts: number = (await this._plebbit._cache.getItem(this._getFailuresCountKey(gatewayUrl, type))) || 0;
            const successCounts: number = (await this._plebbit._cache.getItem(this._getSuccessCountKey(gatewayUrl, type))) || 0;
            const successAverageMs: number = (await this._plebbit._cache.getItem(this._getSuccessAverageKey(gatewayUrl, type))) || 0;

            // Thanks for @thisisnotph for their input on this formula
            const gatewayScore =
                (1 / (successAverageMs + 1) / (1 / (successAverageMs + 1) + 1 / 300)) * 0.3 +
                ((successCounts + 0.288) / (failureCounts * 2 + successCounts + 1)) * 0.7;

            log.trace(`gateway (${gatewayUrl}) score is (${gatewayScore}) for type (${type})`);
            return score;
        };

        const gatewaysSorted = lodash.sortBy(ipfsGateways, score);
        return gatewaysSorted;
    }
}
