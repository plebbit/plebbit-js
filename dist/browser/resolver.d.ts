import { ethers } from "ethers";
import { Plebbit } from "./plebbit";
import { BlockchainProvider } from "./types";
export declare class Resolver {
    blockchainProviders: {
        [chainTicker: string]: BlockchainProvider;
    };
    private cachedBlockchainProviders;
    private plebbit;
    constructor(options: {
        plebbit: Plebbit;
        blockchainProviders: {
            [chainTicker: string]: BlockchainProvider;
        };
    });
    toJSON(): {
        blockchainProviders: {
            [chainTicker: string]: BlockchainProvider;
        };
    };
    _getBlockchainProvider(chainTicker: string): ethers.providers.BaseProvider;
    _resolveEnsTxtRecord(ensName: string, txtRecordName: string): Promise<string>;
    resolveAuthorAddressIfNeeded(authorAddress: string): Promise<string>;
    resolveSubplebbitAddressIfNeeded(subplebbitAddress: string): Promise<string>;
    isDomain(address: string): boolean;
}
