import { z } from "zod";
import type { Server as HTTPServer } from "http";
import type { Server as HTTPSServer } from "https";
export declare const CreatePlebbitWsServerOptionsSchema: z.ZodObject<z.objectUtil.extendShape<{
    plebbitOptions: z.ZodOptional<z.ZodType<{
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
    }, z.ZodTypeDef, {
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
    }>>;
    authKey: z.ZodOptional<z.ZodString>;
}, {
    port: z.ZodOptional<z.ZodNumber>;
    server: z.ZodOptional<z.ZodType<HTTPServer<typeof import("http").IncomingMessage, typeof import("http").ServerResponse> | HTTPSServer<typeof import("http").IncomingMessage, typeof import("http").ServerResponse>, z.ZodTypeDef, HTTPServer<typeof import("http").IncomingMessage, typeof import("http").ServerResponse> | HTTPSServer<typeof import("http").IncomingMessage, typeof import("http").ServerResponse>>>;
}>, "passthrough", z.ZodTypeAny, z.objectOutputType<z.objectUtil.extendShape<{
    plebbitOptions: z.ZodOptional<z.ZodType<{
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
    }, z.ZodTypeDef, {
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
    }>>;
    authKey: z.ZodOptional<z.ZodString>;
}, {
    port: z.ZodOptional<z.ZodNumber>;
    server: z.ZodOptional<z.ZodType<HTTPServer<typeof import("http").IncomingMessage, typeof import("http").ServerResponse> | HTTPSServer<typeof import("http").IncomingMessage, typeof import("http").ServerResponse>, z.ZodTypeDef, HTTPServer<typeof import("http").IncomingMessage, typeof import("http").ServerResponse> | HTTPSServer<typeof import("http").IncomingMessage, typeof import("http").ServerResponse>>>;
}>, z.ZodTypeAny, "passthrough">, z.objectInputType<z.objectUtil.extendShape<{
    plebbitOptions: z.ZodOptional<z.ZodType<{
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
    }, z.ZodTypeDef, {
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
    }>>;
    authKey: z.ZodOptional<z.ZodString>;
}, {
    port: z.ZodOptional<z.ZodNumber>;
    server: z.ZodOptional<z.ZodType<HTTPServer<typeof import("http").IncomingMessage, typeof import("http").ServerResponse> | HTTPSServer<typeof import("http").IncomingMessage, typeof import("http").ServerResponse>, z.ZodTypeDef, HTTPServer<typeof import("http").IncomingMessage, typeof import("http").ServerResponse> | HTTPSServer<typeof import("http").IncomingMessage, typeof import("http").ServerResponse>>>;
}>, z.ZodTypeAny, "passthrough">>;
export declare const SetNewSettingsPlebbitWsServerSchema: z.ZodObject<{
    plebbitOptions: z.ZodObject<z.objectUtil.extendShape<{
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
    }>, "passthrough", z.ZodTypeAny, z.objectOutputType<z.objectUtil.extendShape<{
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
    }>, z.ZodTypeAny, "passthrough">, z.objectInputType<z.objectUtil.extendShape<{
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
    }>, z.ZodTypeAny, "passthrough">>;
}, "strip", z.ZodTypeAny, {
    plebbitOptions: {
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
    } & {
        [k: string]: unknown;
    };
}, {
    plebbitOptions: {
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
    } & {
        [k: string]: unknown;
    };
}>;
export declare const PlebbitWsServerSettingsSerializedSchema: z.ZodObject<{
    plebbitOptions: z.ZodObject<z.objectUtil.extendShape<{
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
    }>, "passthrough", z.ZodTypeAny, z.objectOutputType<z.objectUtil.extendShape<{
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
    }>, z.ZodTypeAny, "passthrough">, z.objectInputType<z.objectUtil.extendShape<{
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
    }>, z.ZodTypeAny, "passthrough">>;
    challenges: z.ZodRecord<z.ZodString, z.ZodObject<Omit<{
        optionInputs: z.ZodOptional<z.ZodArray<z.ZodObject<{
            option: z.ZodString;
            label: z.ZodString;
            default: z.ZodOptional<z.ZodString>;
            description: z.ZodOptional<z.ZodString>;
            placeholder: z.ZodOptional<z.ZodString>;
            required: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            option: z.ZodString;
            label: z.ZodString;
            default: z.ZodOptional<z.ZodString>;
            description: z.ZodOptional<z.ZodString>;
            placeholder: z.ZodOptional<z.ZodString>;
            required: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            option: z.ZodString;
            label: z.ZodString;
            default: z.ZodOptional<z.ZodString>;
            description: z.ZodOptional<z.ZodString>;
            placeholder: z.ZodOptional<z.ZodString>;
            required: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        type: z.ZodString;
        challenge: z.ZodOptional<z.ZodString>;
        caseInsensitive: z.ZodOptional<z.ZodBoolean>;
        description: z.ZodOptional<z.ZodString>;
        getChallenge: z.ZodFunction<z.ZodTuple<[z.ZodEffects<z.ZodObject<{
            path: z.ZodOptional<z.ZodString>;
            name: z.ZodOptional<z.ZodString>;
            options: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            exclude: z.ZodOptional<z.ZodArray<z.ZodObject<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">>, "many">>;
            description: z.ZodOptional<z.ZodString>;
        }, "strict", z.ZodTypeAny, {
            path?: string | undefined;
            options?: Record<string, string> | undefined;
            name?: string | undefined;
            description?: string | undefined;
            exclude?: z.objectOutputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">[] | undefined;
        }, {
            path?: string | undefined;
            options?: Record<string, string> | undefined;
            name?: string | undefined;
            description?: string | undefined;
            exclude?: z.objectInputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">[] | undefined;
        }>, {
            path?: string | undefined;
            options?: Record<string, string> | undefined;
            name?: string | undefined;
            description?: string | undefined;
            exclude?: z.objectOutputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">[] | undefined;
        }, {
            path?: string | undefined;
            options?: Record<string, string> | undefined;
            name?: string | undefined;
            description?: string | undefined;
            exclude?: z.objectInputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "many">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                post: z.ZodOptional<z.ZodBoolean>;
                reply: z.ZodOptional<z.ZodBoolean>;
                vote: z.ZodOptional<z.ZodBoolean>;
                role: z.ZodOptional<z.ZodArray<z.ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
            }, z.ZodTypeAny, "passthrough">[] | undefined;
        }>, z.ZodType<import("../../pubsub-messages/types.js").DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor, z.ZodTypeDef, import("../../pubsub-messages/types.js").DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor>, z.ZodNumber, z.ZodType<import("../../runtime/browser/subplebbit/local-subplebbit.js").LocalSubplebbit, z.ZodTypeDef, import("../../runtime/browser/subplebbit/local-subplebbit.js").LocalSubplebbit>], z.ZodUnknown>, z.ZodPromise<z.ZodUnion<[z.ZodObject<{
            challenge: z.ZodString;
            verify: z.ZodFunction<z.ZodTuple<[z.ZodLazy<z.ZodString>], z.ZodUnknown>, z.ZodPromise<z.ZodUnion<[z.ZodObject<{
                success: z.ZodLiteral<true>;
            }, "strip", z.ZodTypeAny, {
                success: true;
            }, {
                success: true;
            }>, z.ZodObject<{
                success: z.ZodLiteral<false>;
                error: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                error: string;
                success: false;
            }, {
                error: string;
                success: false;
            }>]>>>;
            type: z.ZodString;
        }, "strict", z.ZodTypeAny, {
            type: string;
            challenge: string;
            verify: (args_0: string, ...args_1: unknown[]) => Promise<{
                success: true;
            } | {
                error: string;
                success: false;
            }>;
        }, {
            type: string;
            challenge: string;
            verify: (args_0: string, ...args_1: unknown[]) => Promise<{
                success: true;
            } | {
                error: string;
                success: false;
            }>;
        }>, z.ZodUnion<[z.ZodObject<{
            success: z.ZodLiteral<true>;
        }, "strip", z.ZodTypeAny, {
            success: true;
        }, {
            success: true;
        }>, z.ZodObject<{
            success: z.ZodLiteral<false>;
            error: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            error: string;
            success: false;
        }, {
            error: string;
            success: false;
        }>]>]>>>;
    }, "getChallenge">, "strict", z.ZodTypeAny, {
        type: string;
        description?: string | undefined;
        challenge?: string | undefined;
        caseInsensitive?: boolean | undefined;
        optionInputs?: z.objectOutputType<{
            option: z.ZodString;
            label: z.ZodString;
            default: z.ZodOptional<z.ZodString>;
            description: z.ZodOptional<z.ZodString>;
            placeholder: z.ZodOptional<z.ZodString>;
            required: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">[] | undefined;
    }, {
        type: string;
        description?: string | undefined;
        challenge?: string | undefined;
        caseInsensitive?: boolean | undefined;
        optionInputs?: z.objectInputType<{
            option: z.ZodString;
            label: z.ZodString;
            default: z.ZodOptional<z.ZodString>;
            description: z.ZodOptional<z.ZodString>;
            placeholder: z.ZodOptional<z.ZodString>;
            required: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">[] | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    challenges: Record<string, {
        type: string;
        description?: string | undefined;
        challenge?: string | undefined;
        caseInsensitive?: boolean | undefined;
        optionInputs?: z.objectOutputType<{
            option: z.ZodString;
            label: z.ZodString;
            default: z.ZodOptional<z.ZodString>;
            description: z.ZodOptional<z.ZodString>;
            placeholder: z.ZodOptional<z.ZodString>;
            required: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">[] | undefined;
    }>;
    plebbitOptions: {
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
    } & {
        [k: string]: unknown;
    };
}, {
    challenges: Record<string, {
        type: string;
        description?: string | undefined;
        challenge?: string | undefined;
        caseInsensitive?: boolean | undefined;
        optionInputs?: z.objectInputType<{
            option: z.ZodString;
            label: z.ZodString;
            default: z.ZodOptional<z.ZodString>;
            description: z.ZodOptional<z.ZodString>;
            placeholder: z.ZodOptional<z.ZodString>;
            required: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">[] | undefined;
    }>;
    plebbitOptions: {
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
    } & {
        [k: string]: unknown;
    };
}>;
