import { ChainTicker } from "./types.js";
type StatTypes = "ipns" | "ipfs" | "pubsub-publish" | "pubsub-subscribe" | ChainTicker;
export default class Stats {
    private _plebbit;
    constructor(plebbit: Stats["_plebbit"]);
    toJSON(): undefined;
    private _getSuccessCountKey;
    private _getSuccessAverageKey;
    recordGatewaySuccess(gatewayUrl: string, type: StatTypes, timeElapsedMs: number): Promise<void>;
    private _getBaseKey;
    private _getFailuresCountKey;
    recordGatewayFailure(gatewayUrl: string, type: StatTypes): Promise<void>;
    private _gatewayScore;
    sortGatewaysAccordingToScore(type: StatTypes): Promise<string[]>;
}
export {};
