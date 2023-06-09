import { ethers } from "ethers";
import { Chain } from "./types";
export declare class Resolver {
    private plebbit;
    constructor(plebbit: Resolver["plebbit"]);
    toJSON(): any;
    toString(): any;
    _getChainProvider(chainTicker: Chain, chainProviderUrl: string): ethers.providers.BaseProvider;
    resolveTxtRecord(address: string, txtRecordName: string, chain: Chain, chainProviderUrl: string): Promise<string | null>;
    isDomain(address: string): boolean;
}
