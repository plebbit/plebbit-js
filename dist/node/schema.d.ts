import { z } from "zod";
export declare const ChainTickerSchema: z.ZodString;
export declare const nonNegativeIntStringSchema: z.ZodEffects<z.ZodString, string, string>;
export declare const ChainProviderSchema: z.ZodObject<{
    urls: z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodEnum<["viem", "ethers.js", "web3.js"]>]>, "many">;
    chainId: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    urls: string[];
    chainId: number;
}, {
    urls: string[];
    chainId: number;
}>;
export declare const PlebbitUserOptionsSchema: z.ZodObject<{
    kuboRpcClientsOptions: z.ZodOptional<z.ZodEffects<z.ZodArray<z.ZodType<string | URL | import("@multiformats/multiaddr").Multiaddr | import("kubo-rpc-client").Options | undefined, z.ZodTypeDef, string | URL | import("@multiformats/multiaddr").Multiaddr | import("kubo-rpc-client").Options | undefined>, "atleastone">, import("kubo-rpc-client").Options[], [string | URL | import("@multiformats/multiaddr").Multiaddr | import("kubo-rpc-client").Options | undefined, ...(string | URL | import("@multiformats/multiaddr").Multiaddr | import("kubo-rpc-client").Options | undefined)[]]>>;
    plebbitRpcClientsOptions: z.ZodOptional<z.ZodArray<z.ZodString, "atleastone">>;
    dataPath: z.ZodOptional<z.ZodString>;
} & {
    ipfsGatewayUrls: z.ZodEffects<z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>, string[], string[] | undefined>;
    pubsubKuboRpcClientsOptions: z.ZodDefault<z.ZodOptional<z.ZodEffects<z.ZodArray<z.ZodType<string | URL | import("@multiformats/multiaddr").Multiaddr | import("kubo-rpc-client").Options | undefined, z.ZodTypeDef, string | URL | import("@multiformats/multiaddr").Multiaddr | import("kubo-rpc-client").Options | undefined>, "atleastone">, import("kubo-rpc-client").Options[], [string | URL | import("@multiformats/multiaddr").Multiaddr | import("kubo-rpc-client").Options | undefined, ...(string | URL | import("@multiformats/multiaddr").Multiaddr | import("kubo-rpc-client").Options | undefined)[]]>>>;
    httpRoutersOptions: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    chainProviders: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodObject<{
        urls: z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodEnum<["viem", "ethers.js", "web3.js"]>]>, "many">;
        chainId: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        urls: string[];
        chainId: number;
    }, {
        urls: string[];
        chainId: number;
    }>>>;
    resolveAuthorAddresses: z.ZodDefault<z.ZodBoolean>;
    publishInterval: z.ZodDefault<z.ZodNumber>;
    updateInterval: z.ZodDefault<z.ZodNumber>;
    noData: z.ZodDefault<z.ZodBoolean>;
    validatePages: z.ZodDefault<z.ZodBoolean>;
    userAgent: z.ZodDefault<z.ZodString>;
}, "strict", z.ZodTypeAny, {
    userAgent: string;
    ipfsGatewayUrls: string[];
    pubsubKuboRpcClientsOptions: import("kubo-rpc-client").Options[];
    resolveAuthorAddresses: boolean;
    chainProviders: Record<string, {
        urls: string[];
        chainId: number;
    }>;
    publishInterval: number;
    updateInterval: number;
    noData: boolean;
    validatePages: boolean;
    httpRoutersOptions: string[];
    kuboRpcClientsOptions?: import("kubo-rpc-client").Options[] | undefined;
    plebbitRpcClientsOptions?: [string, ...string[]] | undefined;
    dataPath?: string | undefined;
}, {
    userAgent?: string | undefined;
    ipfsGatewayUrls?: string[] | undefined;
    kuboRpcClientsOptions?: [string | URL | import("@multiformats/multiaddr").Multiaddr | import("kubo-rpc-client").Options | undefined, ...(string | URL | import("@multiformats/multiaddr").Multiaddr | import("kubo-rpc-client").Options | undefined)[]] | undefined;
    pubsubKuboRpcClientsOptions?: [string | URL | import("@multiformats/multiaddr").Multiaddr | import("kubo-rpc-client").Options | undefined, ...(string | URL | import("@multiformats/multiaddr").Multiaddr | import("kubo-rpc-client").Options | undefined)[]] | undefined;
    plebbitRpcClientsOptions?: [string, ...string[]] | undefined;
    dataPath?: string | undefined;
    resolveAuthorAddresses?: boolean | undefined;
    chainProviders?: Record<string, {
        urls: string[];
        chainId: number;
    }> | undefined;
    publishInterval?: number | undefined;
    updateInterval?: number | undefined;
    noData?: boolean | undefined;
    validatePages?: boolean | undefined;
    httpRoutersOptions?: string[] | undefined;
}>;
export declare const PlebbitParsedOptionsSchema: z.ZodObject<{
    ipfsGatewayUrls: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    httpRoutersOptions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    plebbitRpcClientsOptions: z.ZodOptional<z.ZodArray<z.ZodString, "atleastone">>;
    dataPath: z.ZodOptional<z.ZodString>;
    chainProviders: z.ZodRecord<z.ZodString, z.ZodObject<{
        urls: z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodEnum<["viem", "ethers.js", "web3.js"]>]>, "many">;
        chainId: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        urls: string[];
        chainId: number;
    }, {
        urls: string[];
        chainId: number;
    }>>;
    resolveAuthorAddresses: z.ZodBoolean;
    publishInterval: z.ZodNumber;
    updateInterval: z.ZodNumber;
    noData: z.ZodBoolean;
    validatePages: z.ZodBoolean;
    userAgent: z.ZodString;
} & {
    kuboRpcClientsOptions: z.ZodOptional<z.ZodType<import("kubo-rpc-client").Options[], z.ZodTypeDef, import("kubo-rpc-client").Options[]>>;
    pubsubKuboRpcClientsOptions: z.ZodOptional<z.ZodType<import("kubo-rpc-client").Options[], z.ZodTypeDef, import("kubo-rpc-client").Options[]>>;
}, "strict", z.ZodTypeAny, {
    userAgent: string;
    resolveAuthorAddresses: boolean;
    chainProviders: Record<string, {
        urls: string[];
        chainId: number;
    }>;
    publishInterval: number;
    updateInterval: number;
    noData: boolean;
    validatePages: boolean;
    ipfsGatewayUrls?: string[] | undefined;
    kuboRpcClientsOptions?: import("kubo-rpc-client").Options[] | undefined;
    pubsubKuboRpcClientsOptions?: import("kubo-rpc-client").Options[] | undefined;
    plebbitRpcClientsOptions?: [string, ...string[]] | undefined;
    dataPath?: string | undefined;
    httpRoutersOptions?: string[] | undefined;
}, {
    userAgent: string;
    resolveAuthorAddresses: boolean;
    chainProviders: Record<string, {
        urls: string[];
        chainId: number;
    }>;
    publishInterval: number;
    updateInterval: number;
    noData: boolean;
    validatePages: boolean;
    ipfsGatewayUrls?: string[] | undefined;
    kuboRpcClientsOptions?: import("kubo-rpc-client").Options[] | undefined;
    pubsubKuboRpcClientsOptions?: import("kubo-rpc-client").Options[] | undefined;
    plebbitRpcClientsOptions?: [string, ...string[]] | undefined;
    dataPath?: string | undefined;
    httpRoutersOptions?: string[] | undefined;
}>;
