import { z } from "zod";
import { create as CreateKuboRpcClient } from "kubo-rpc-client";
import { parseIpfsRawOptionToIpfsOptions } from "./util";

// This file will have misc schemas, as well as Plebbit class schema

// export interface PlebbitOptions {
//     // Options as inputted by user
//     ipfsGatewayUrls?: string[];
//     ipfsHttpClientsOptions?: (IpfsHttpClientOptions | string)[];
//     pubsubHttpClientsOptions?: (IpfsHttpClientOptions | string)[];
//     plebbitRpcClientsOptions?: string[]; // Optional websocket URLs of plebbit RPC servers, required to run a sub from a browser/electron/webview
//     dataPath?: string;
//     chainProviders?: Partial<Record<ChainTicker, ChainProvider>>;
//     resolveAuthorAddresses?: boolean;
//     // Options for tests only. Should not be used in production
//     publishInterval?: number; // in ms, the time to wait for subplebbit instances to publish updates
//     updateInterval?: number; // in ms, the time to wait for comment/subplebbit instances to check for updates
//     noData?: boolean; // if true, dataPath is ignored, all database and cache data is saved in memory
//     browserLibp2pJsPublish?: boolean; // if true and on browser, it will bootstrap pubsub through libp2p instead of relying on pubsub providers
// }

export const ChainTickerSchema = z.enum(["eth", "matic", "avax", "sol"]);

export const ChainProviderSchema = z.object({ urls: z.string().url().array(), chainId: z.number().int() });

const IpfsGatewayUrlSchema = z.string().url();

const RpcUrlSchema = z.string().url(); // Optional websocket URLs of plebbit RPC servers, required to run a sub from a browser/electron/webview

const IpfsHttpClientOptionSchema = z.custom<Parameters<typeof CreateKuboRpcClient>[0]>(); // Kubo-rpc-client library will do the validation for us

const DirectoryPathSchema = z.string(); // TODO add validation for path

const defaultChainProviders = {
    eth: { urls: ["viem", "ethers.js"], chainId: 1 },
    avax: {
        urls: ["https://api.avax.network/ext/bc/C/rpc"],
        chainId: 43114
    },
    matic: {
        urls: ["https://polygon-rpc.com"],
        chainId: 137
    },
    sol: {
        urls: ["web3.js", "https://solana.api.onfinality.io/public"],
        chainId: -1 // no chain ID for solana
    }
};

const parsedIpfsHttpClientOptions = IpfsHttpClientOptionSchema.array().transform((options) => options.map(parseIpfsRawOptionToIpfsOptions));

export const PlebbitUserOptionsSchema = z.object({
    ipfsGatewayUrls: IpfsGatewayUrlSchema.array().default(["https://cloudflare-ipfs.com", "https://ipfs.io"]).optional(),
    ipfsHttpClientsOptions: parsedIpfsHttpClientOptions.optional(),
    pubsubHttpClientsOptions: parsedIpfsHttpClientOptions.default([{ url: "https://pubsubprovider.xyz/api/v0" }]).optional(),
    plebbitRpcClientsOptions: RpcUrlSchema.array().optional(),
    dataPath: DirectoryPathSchema.optional(),
    chainProviders: z.record(ChainTickerSchema, ChainProviderSchema).default(defaultChainProviders),
    resolveAuthorAddresses: z.boolean().default(true),
    // Options for tests only. Should not be used in production
    publishInterval: z.number().positive().default(20000), // in ms, the time to wait for subplebbit instances to publish updates. Default is 20s
    updateInterval: z.number().positive().default(60000), // in ms, the time to wait for comment/subplebbit instances to check for updates. Default is 1min
    noData: z.boolean().default(false), // if true, dataPath is ignored, all database and cache data is saved in memory
    browserLibp2pJsPublish: z.boolean().default(false) // if true and on browser, it will bootstrap pubsub through libp2p instead of relying on pubsub providers
});
