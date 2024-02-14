import { Chain } from "./types.js";
import { PublicClient } from "viem";
export declare class Resolver {
    private plebbit;
    constructor(plebbit: Resolver["plebbit"]);
    toJSON(): any;
    toString(): any;
    _getChainProvider(chainTicker: Chain, chainProviderUrl: string): PublicClient;
    _resolveViaEthers(chainTicker: Chain, address: string, txtRecordName: string): Promise<string>;
    resolveTxtRecord(address: string, txtRecordName: string, chain: Chain, chainProviderUrl: string): Promise<string | null>;
    isDomain(address: string): boolean;
}
