import type { ChainTicker } from "./types.js";
import { createPublicClient as createViemClient } from "viem";
import { Plebbit } from "./plebbit/plebbit.js";
export declare class DomainResolver {
    private _plebbit;
    _viemClients: Record<string, ReturnType<typeof createViemClient>>;
    private _solanaConnections;
    private _ethersClients;
    constructor(plebbit: Plebbit);
    destroy(): Promise<void>;
    _createViemClientIfNeeded(chainTicker: ChainTicker, chainProviderUrl: string): DomainResolver["_viemClients"][string];
    private _resolveViaViem;
    private _resolveViaSolana;
    private _resolveViaEthers;
    resolveTxtRecord(address: string, txtRecordName: string, chain: ChainTicker, chainProviderUrl: string, chainId: number | undefined): Promise<string | null>;
}
