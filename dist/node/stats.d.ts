declare type StatTypes = "ipns" | "cid" | "pubsub-publish";
export default class Stats {
    private _plebbit;
    constructor(plebbit: Stats["_plebbit"]);
    toJSON(): any;
    private _getSuccessCountKey;
    private _getSuccessAverageKey;
    recordGatewaySuccess(gatewayUrl: string, type: StatTypes, timeElapsedMs: number): Promise<void>;
    private _getBaseKey;
    private _getFailuresCountKey;
    recordGatewayFailure(gatewayUrl: string, type: StatTypes): Promise<void>;
    sortGatewaysAccordingToScore(type: StatTypes): Promise<string[]>;
}
export {};
