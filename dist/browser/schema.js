import { z } from "zod";
import { parseIpfsRawOptionToIpfsOptions } from "./util.js";
import { UserAgentSchema } from "./schema/schema.js";
import version from "./version.js";
// This file will have misc schemas, as well as Plebbit class schema
export const ChainTickerSchema = z.string().min(1);
export const nonNegativeIntStringSchema = z
    .string()
    .regex(/^\d+$/)
    .refine((val) => parseInt(val) >= 0, {
    message: "Must be a non-negative integer"
});
const LibraryChainProvider = z.enum(["viem", "ethers.js", "web3.js"]);
export const ChainProviderSchema = z.object({
    urls: z.string().url().or(LibraryChainProvider).array(),
    chainId: z.number().int()
});
const IpfsGatewayUrlSchema = z.string().url().startsWith("http");
const RpcUrlSchema = z.string().url(); // Optional websocket URLs of plebbit RPC servers, required to run a sub from a browser/electron/webview
const KuboRpcCreateClientOptionSchema = z.custom(); // Kubo-rpc-client library will do the validation for us
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
const TransformKuboRpcClientOptionsSchema = KuboRpcCreateClientOptionSchema.array()
    .nonempty()
    .transform((options) => options.map(parseIpfsRawOptionToIpfsOptions));
const ParsedKuboRpcClientOptionsSchema = z.custom();
const PlebbitUserOptionBaseSchema = z.object({
    ipfsGatewayUrls: IpfsGatewayUrlSchema.array().optional(),
    kuboRpcClientsOptions: TransformKuboRpcClientOptionsSchema.optional(),
    httpRoutersOptions: z.string().url().array().optional(),
    pubsubKuboRpcClientsOptions: TransformKuboRpcClientOptionsSchema.optional(),
    plebbitRpcClientsOptions: RpcUrlSchema.array().nonempty().optional(),
    dataPath: DirectoryPathSchema.optional(),
    chainProviders: z.record(ChainTickerSchema, ChainProviderSchema),
    resolveAuthorAddresses: z.boolean(),
    // Options for tests only. Should not be used in production
    publishInterval: z.number().positive(), // in ms, the time to wait for subplebbit instances to publish updates. Default is 20s
    updateInterval: z.number().positive(), // in ms, the time to wait for comment/subplebbit instances to check for updates. Default is 1min
    noData: z.boolean(), // if true, dataPath is ignored, all database and cache data is saved in memory
    validatePages: z.boolean(), // if false, plebbit-js will not validate pages in commentUpdate/Subplebbit/getPage
    userAgent: UserAgentSchema
});
const defaultPubsubKuboRpcClientsOptions = [
    { url: "https://pubsubprovider.xyz/api/v0" },
    { url: "https://plebpubsub.xyz/api/v0" }
];
const defaultIpfsGatewayUrls = ["https://ipfsgateway.xyz", "https://gateway.plebpubsub.xyz", "https://gateway.forumindex.com"];
export const PlebbitUserOptionsSchema = PlebbitUserOptionBaseSchema.extend({
    // used in await Plebbit({PlebbitOption}), will set defaults here
    ipfsGatewayUrls: PlebbitUserOptionBaseSchema.shape.ipfsGatewayUrls
        .default([...defaultIpfsGatewayUrls])
        .transform((val) => (val === undefined ? [...defaultIpfsGatewayUrls] : val)),
    pubsubKuboRpcClientsOptions: PlebbitUserOptionBaseSchema.shape.pubsubKuboRpcClientsOptions.default([
        ...defaultPubsubKuboRpcClientsOptions
    ]),
    httpRoutersOptions: PlebbitUserOptionBaseSchema.shape.httpRoutersOptions.default([
        "https://peers.pleb.bot",
        "https://routing.lol",
        "https://peers.forumindex.com",
        "https://peers.plebpubsub.xyz"
    ]),
    chainProviders: PlebbitUserOptionBaseSchema.shape.chainProviders.default(defaultChainProviders),
    resolveAuthorAddresses: PlebbitUserOptionBaseSchema.shape.resolveAuthorAddresses.default(true),
    publishInterval: PlebbitUserOptionBaseSchema.shape.publishInterval.default(20000),
    updateInterval: PlebbitUserOptionBaseSchema.shape.updateInterval.default(60000),
    noData: PlebbitUserOptionBaseSchema.shape.noData.default(false),
    validatePages: PlebbitUserOptionBaseSchema.shape.validatePages.default(true),
    userAgent: PlebbitUserOptionBaseSchema.shape.userAgent.default(version.USER_AGENT)
}).strict();
export const PlebbitParsedOptionsSchema = PlebbitUserOptionBaseSchema.extend({
    // used to parse responses from rpc when calling getSettings
    kuboRpcClientsOptions: ParsedKuboRpcClientOptionsSchema.optional(),
    pubsubKuboRpcClientsOptions: ParsedKuboRpcClientOptionsSchema.optional()
}).strict();
//# sourceMappingURL=schema.js.map