import { ethers } from "ethers";
export declare class Resolver {
    private cachedChainProviders;
    private plebbit;
    constructor(plebbit: Resolver["plebbit"]);
    toJSON(): any;
    toString(): any;
    _getChainProvider(chainTicker: string): ethers.providers.BaseProvider;
    _resolveEnsTxtRecord(ensName: string, txtRecordName: string): Promise<string | undefined>;
    isDomain(address: string): boolean;
}
