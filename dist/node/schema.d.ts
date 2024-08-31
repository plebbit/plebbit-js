import { z } from "zod";
export declare const ChainTickerSchema: z.ZodString;
export declare const ChainProviderSchema: z.ZodObject<{
    urls: z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodEnum<["viem", "ethers.js", "web3.js"]>]>, "many">;
    chainId: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    chainId: number;
    urls: string[];
}, {
    chainId: number;
    urls: string[];
}>;
export declare const PlebbitUserOptionsSchema: z.ZodObject<z.objectUtil.extendShape<{
    ipfsGatewayUrls: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    ipfsHttpClientsOptions: z.ZodOptional<z.ZodEffects<z.ZodArray<z.ZodType<string | URL | import("kubo-rpc-client").Options | import("@multiformats/multiaddr").Multiaddr | undefined, z.ZodTypeDef, string | URL | import("kubo-rpc-client").Options | import("@multiformats/multiaddr").Multiaddr | undefined>, "many">, import("kubo-rpc-client").Options[], (string | URL | import("kubo-rpc-client").Options | import("@multiformats/multiaddr").Multiaddr | undefined)[]>>;
    pubsubHttpClientsOptions: z.ZodOptional<z.ZodEffects<z.ZodArray<z.ZodType<string | URL | import("kubo-rpc-client").Options | import("@multiformats/multiaddr").Multiaddr | undefined, z.ZodTypeDef, string | URL | import("kubo-rpc-client").Options | import("@multiformats/multiaddr").Multiaddr | undefined>, "many">, import("kubo-rpc-client").Options[], (string | URL | import("kubo-rpc-client").Options | import("@multiformats/multiaddr").Multiaddr | undefined)[]>>;
    plebbitRpcClientsOptions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    dataPath: z.ZodOptional<z.ZodString>;
    chainProviders: z.ZodRecord<z.ZodString, z.ZodObject<{
        urls: z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodEnum<["viem", "ethers.js", "web3.js"]>]>, "many">;
        chainId: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        chainId: number;
        urls: string[];
    }, {
        chainId: number;
        urls: string[];
    }>>;
    resolveAuthorAddresses: z.ZodBoolean;
    publishInterval: z.ZodNumber;
    updateInterval: z.ZodNumber;
    noData: z.ZodBoolean;
    browserLibp2pJsPublish: z.ZodBoolean;
    userAgent: z.ZodString;
}, {
    ipfsGatewayUrls: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    pubsubHttpClientsOptions: z.ZodDefault<z.ZodOptional<z.ZodEffects<z.ZodArray<z.ZodType<string | URL | import("kubo-rpc-client").Options | import("@multiformats/multiaddr").Multiaddr | undefined, z.ZodTypeDef, string | URL | import("kubo-rpc-client").Options | import("@multiformats/multiaddr").Multiaddr | undefined>, "many">, import("kubo-rpc-client").Options[], (string | URL | import("kubo-rpc-client").Options | import("@multiformats/multiaddr").Multiaddr | undefined)[]>>>;
    chainProviders: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodObject<{
        urls: z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodEnum<["viem", "ethers.js", "web3.js"]>]>, "many">;
        chainId: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        chainId: number;
        urls: string[];
    }, {
        chainId: number;
        urls: string[];
    }>>>;
    resolveAuthorAddresses: z.ZodDefault<z.ZodBoolean>;
    publishInterval: z.ZodDefault<z.ZodNumber>;
    updateInterval: z.ZodDefault<z.ZodNumber>;
    noData: z.ZodDefault<z.ZodBoolean>;
    browserLibp2pJsPublish: z.ZodDefault<z.ZodBoolean>;
    userAgent: z.ZodDefault<z.ZodString>;
}>, "strict", z.ZodTypeAny, {
    ipfsGatewayUrls: string[];
    pubsubHttpClientsOptions: import("kubo-rpc-client").Options[];
    chainProviders: Record<string, {
        chainId: number;
        urls: string[];
    }>;
    resolveAuthorAddresses: boolean;
    publishInterval: number;
    updateInterval: number;
    noData: boolean;
    browserLibp2pJsPublish: boolean;
    userAgent: string;
    ipfsHttpClientsOptions?: import("kubo-rpc-client").Options[] | undefined;
    plebbitRpcClientsOptions?: string[] | undefined;
    dataPath?: string | undefined;
}, {
    ipfsGatewayUrls?: string[] | undefined;
    ipfsHttpClientsOptions?: (string | URL | import("kubo-rpc-client").Options | import("@multiformats/multiaddr").Multiaddr | undefined)[] | undefined;
    pubsubHttpClientsOptions?: (string | URL | import("kubo-rpc-client").Options | import("@multiformats/multiaddr").Multiaddr | undefined)[] | undefined;
    plebbitRpcClientsOptions?: string[] | undefined;
    dataPath?: string | undefined;
    chainProviders?: Record<string, {
        chainId: number;
        urls: string[];
    }> | undefined;
    resolveAuthorAddresses?: boolean | undefined;
    publishInterval?: number | undefined;
    updateInterval?: number | undefined;
    noData?: boolean | undefined;
    browserLibp2pJsPublish?: boolean | undefined;
    userAgent?: string | undefined;
}>;
export declare const PlebbitParsedOptionsSchema: z.ZodObject<z.objectUtil.extendShape<{
    ipfsGatewayUrls: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    ipfsHttpClientsOptions: z.ZodOptional<z.ZodEffects<z.ZodArray<z.ZodType<string | URL | import("kubo-rpc-client").Options | import("@multiformats/multiaddr").Multiaddr | undefined, z.ZodTypeDef, string | URL | import("kubo-rpc-client").Options | import("@multiformats/multiaddr").Multiaddr | undefined>, "many">, import("kubo-rpc-client").Options[], (string | URL | import("kubo-rpc-client").Options | import("@multiformats/multiaddr").Multiaddr | undefined)[]>>;
    pubsubHttpClientsOptions: z.ZodOptional<z.ZodEffects<z.ZodArray<z.ZodType<string | URL | import("kubo-rpc-client").Options | import("@multiformats/multiaddr").Multiaddr | undefined, z.ZodTypeDef, string | URL | import("kubo-rpc-client").Options | import("@multiformats/multiaddr").Multiaddr | undefined>, "many">, import("kubo-rpc-client").Options[], (string | URL | import("kubo-rpc-client").Options | import("@multiformats/multiaddr").Multiaddr | undefined)[]>>;
    plebbitRpcClientsOptions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    dataPath: z.ZodOptional<z.ZodString>;
    chainProviders: z.ZodRecord<z.ZodString, z.ZodObject<{
        urls: z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodEnum<["viem", "ethers.js", "web3.js"]>]>, "many">;
        chainId: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        chainId: number;
        urls: string[];
    }, {
        chainId: number;
        urls: string[];
    }>>;
    resolveAuthorAddresses: z.ZodBoolean;
    publishInterval: z.ZodNumber;
    updateInterval: z.ZodNumber;
    noData: z.ZodBoolean;
    browserLibp2pJsPublish: z.ZodBoolean;
    userAgent: z.ZodString;
}, {
    ipfsHttpClientsOptions: z.ZodOptional<z.ZodType<import("kubo-rpc-client").Options[], z.ZodTypeDef, import("kubo-rpc-client").Options[]>>;
    pubsubHttpClientsOptions: z.ZodOptional<z.ZodType<import("kubo-rpc-client").Options[], z.ZodTypeDef, import("kubo-rpc-client").Options[]>>;
}>, "strict", z.ZodTypeAny, {
    chainProviders: Record<string, {
        chainId: number;
        urls: string[];
    }>;
    resolveAuthorAddresses: boolean;
    publishInterval: number;
    updateInterval: number;
    noData: boolean;
    browserLibp2pJsPublish: boolean;
    userAgent: string;
    ipfsGatewayUrls?: string[] | undefined;
    ipfsHttpClientsOptions?: import("kubo-rpc-client").Options[] | undefined;
    pubsubHttpClientsOptions?: import("kubo-rpc-client").Options[] | undefined;
    plebbitRpcClientsOptions?: string[] | undefined;
    dataPath?: string | undefined;
}, {
    chainProviders: Record<string, {
        chainId: number;
        urls: string[];
    }>;
    resolveAuthorAddresses: boolean;
    publishInterval: number;
    updateInterval: number;
    noData: boolean;
    browserLibp2pJsPublish: boolean;
    userAgent: string;
    ipfsGatewayUrls?: string[] | undefined;
    ipfsHttpClientsOptions?: import("kubo-rpc-client").Options[] | undefined;
    pubsubHttpClientsOptions?: import("kubo-rpc-client").Options[] | undefined;
    plebbitRpcClientsOptions?: string[] | undefined;
    dataPath?: string | undefined;
}>;
