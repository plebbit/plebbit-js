export default class Stats {
    private _plebbit;
    constructor(plebbit: Stats["_plebbit"]);
    toJSON(): any;
    private _getSuccessCountKey;
    private _getSuccessAverageKey;
    recordGatewaySuccess(gatewayUrl: string, type: "ipns" | "cid", timeElapsedMs: number): Promise<void>;
    private _getBaseKey;
    private _getFailuresCountKey;
    recordGatewayFailure(gatewayUrl: string, type: "ipns" | "cid"): Promise<void>;
    sortGatewaysAccordingToScore(type: "ipns" | "cid"): Promise<string[]>;
}
