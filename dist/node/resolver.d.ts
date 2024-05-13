import { ChainTicker } from "./types.js";
import { createPublicClient as createViemClient } from "viem";
import { ethers } from "ethers";
import { Connection as SolanaConnection } from "@solana/web3.js";
export declare const viemClients: Record<string, ReturnType<typeof createViemClient>>;
export declare const solanaConnections: Record<string, SolanaConnection>;
export declare const ethersClients: Record<string, ReturnType<typeof ethers.getDefaultProvider>>;
export declare function resolveTxtRecord(address: string, txtRecordName: string, chain: ChainTicker, chainProviderUrl: string, chainId: number | undefined): Promise<string | null>;
