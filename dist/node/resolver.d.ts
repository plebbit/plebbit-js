import { Plebbit } from "./plebbit";
export declare class Resolver {
    blockchainProviders: Object;
    cachedBlockchainProviders: Object;
    plebbit: Plebbit;
    constructor(options: {
        plebbit: Plebbit;
        blockchainProviders: Object;
    });
    _getBlockchainProvider(chainTicker: string): any;
    _resolveEnsTxtRecord(ensName: string, txtRecordName: string): Promise<string>;
    resolveAuthorAddressIfNeeded(authorAddress: string): Promise<string>;
    resolveSubplebbitAddressIfNeeded(subplebbitAddress: string): Promise<string>;
    isDomain(address: string): boolean;
}
