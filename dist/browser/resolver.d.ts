import { ethers } from "ethers";
import { ChainProvider } from "./types";
export declare class Resolver {
    chainProviders: {
        [chainTicker: string]: ChainProvider;
    };
    private cachedChainProviders;
    private plebbit;
    constructor(options: {
        plebbit: Resolver["plebbit"];
        chainProviders: {
            [chainTicker: string]: ChainProvider;
        };
    });
    toJSON(): {
        chainProviders: {
            [chainTicker: string]: ChainProvider;
        };
    };
    toString(): string;
    _getChainProvider(chainTicker: string): ethers.providers.BaseProvider;
    _resolveEnsTxtRecord(ensName: string, txtRecordName: string): Promise<string>;
    resolveAuthorAddressIfNeeded(authorAddress: string): Promise<string>;
    resolveSubplebbitAddressIfNeeded(subplebbitAddress: string): Promise<string>;
    isDomain(address: string): boolean;
}
