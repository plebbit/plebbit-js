import { z } from "zod";
import { create as CreateKuboRpcClient } from "kubo-rpc-client";
import { parseIpfsRawOptionToIpfsOptions } from "./util";

// This file will have misc schemas, as well as Plebbit class schema

export const ChainTickerSchema = z.enum(["eth", "matic", "avax", "sol"]);

const LibraryChainProvider = z.enum(["viem", "ethers.js", "web3.js"]);
export const ChainProviderSchema = z.object({
    urls: z.string().url().or(LibraryChainProvider).array(),
    chainId: z.number().int()
});

const IpfsGatewayUrlSchema = z.string().url();

const RpcUrlSchema = z.string().url(); // Optional websocket URLs of plebbit RPC servers, required to run a sub from a browser/electron/webview

const IpfsHttpCreateClientOptionSchema = z.custom<Parameters<typeof CreateKuboRpcClient>[0]>(); // Kubo-rpc-client library will do the validation for us

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

const TransformIpfsHttpClientOptionsSchema = IpfsHttpCreateClientOptionSchema.array().transform((options) =>
    options.map(parseIpfsRawOptionToIpfsOptions)
);

const ParsedIpfsHttpClientOptionsSchema = z.custom<z.output<typeof TransformIpfsHttpClientOptionsSchema>>();

const PlebbitUserOptionBaseSchema = z.object({
    ipfsGatewayUrls: IpfsGatewayUrlSchema.array().optional(),
    ipfsHttpClientsOptions: TransformIpfsHttpClientOptionsSchema.optional(),
    pubsubHttpClientsOptions: TransformIpfsHttpClientOptionsSchema.optional(),
    plebbitRpcClientsOptions: RpcUrlSchema.array().optional(),
    dataPath: DirectoryPathSchema.optional(),
    chainProviders: z.record(ChainTickerSchema, ChainProviderSchema),
    resolveAuthorAddresses: z.boolean(),
    // Options for tests only. Should not be used in production
    publishInterval: z.number().positive(), // in ms, the time to wait for subplebbit instances to publish updates. Default is 20s
    updateInterval: z.number().positive(), // in ms, the time to wait for comment/subplebbit instances to check for updates. Default is 1min
    noData: z.boolean(), // if true, dataPath is ignored, all database and cache data is saved in memory
    browserLibp2pJsPublish: z.boolean() // if true and on browser, it will bootstrap pubsub through libp2p instead of relying on pubsub providers
});

export const PlebbitUserOptionsSchema = PlebbitUserOptionBaseSchema.extend({
    // used in await Plebbit({PlebbitOption}), will set defaults here
    ipfsGatewayUrls: PlebbitUserOptionBaseSchema.shape.ipfsGatewayUrls.default(["https://cloudflare-ipfs.com", "https://ipfs.io"]),
    pubsubHttpClientsOptions: PlebbitUserOptionBaseSchema.shape.pubsubHttpClientsOptions.default([
        { url: "https://pubsubprovider.xyz/api/v0" }
    ]),
    chainProviders: PlebbitUserOptionBaseSchema.shape.chainProviders.default(defaultChainProviders),
    resolveAuthorAddresses: PlebbitUserOptionBaseSchema.shape.resolveAuthorAddresses.default(true),
    publishInterval: PlebbitUserOptionBaseSchema.shape.publishInterval.default(20000),
    updateInterval: PlebbitUserOptionBaseSchema.shape.updateInterval.default(60000),
    noData: PlebbitUserOptionBaseSchema.shape.noData.default(false),
    browserLibp2pJsPublish: PlebbitUserOptionBaseSchema.shape.browserLibp2pJsPublish.default(false)
}).strict();

export const PlebbitParsedOptionsSchema = PlebbitUserOptionBaseSchema.extend({
    // used to parse responses from rpc when calling getSettings
    ipfsHttpClientsOptions: ParsedIpfsHttpClientOptionsSchema.optional(),
    pubsubHttpClientsOptions: ParsedIpfsHttpClientOptionsSchema.optional()
}).strict();