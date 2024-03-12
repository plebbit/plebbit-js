import { Chain } from "./types.js";
export declare class Resolver {
    private plebbit;
    constructor(plebbit: Resolver["plebbit"]);
    toJSON(): any;
    toString(): any;
    _resolveViaViem(chainTicker: Chain, address: string, txtRecordName: string, chainProviderUrl: string): Promise<string | null>;
    _resolveViaSolana(address: string, txtRecordName: string, chainProviderUrl: string): Promise<string>;
    _resolveViaEthers(chainTicker: Chain, address: string, txtRecordName: string): Promise<string>;
    resolveTxtRecord(address: string, txtRecordName: string, chain: Chain, chainProviderUrl: string): Promise<string | null>;
    isDomain(address: string): boolean;
}
