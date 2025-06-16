import { z } from "zod";
import type { Server as HTTPServer } from "http";
import type { Server as HTTPSServer } from "https";
export declare const CreatePlebbitWsServerOptionsSchema: z.ZodObject<{
    plebbitOptions: z.ZodOptional<z.ZodType<{
        userAgent?: string | undefined;
        ipfsGatewayUrls?: string[] | undefined;
        kuboRpcClientsOptions?: (string | URL | import("@multiformats/multiaddr").Multiaddr | import("kubo-rpc-client").Options | undefined)[] | undefined;
        httpRoutersOptions?: string[] | undefined;
        pubsubKuboRpcClientsOptions?: (string | URL | import("@multiformats/multiaddr").Multiaddr | import("kubo-rpc-client").Options | undefined)[] | undefined;
        plebbitRpcClientsOptions?: [string, ...string[]] | undefined;
        dataPath?: string | undefined;
        chainProviders?: Record<string, {
            urls: string[];
            chainId: number;
        }> | undefined;
        resolveAuthorAddresses?: boolean | undefined;
        publishInterval?: number | undefined;
        updateInterval?: number | undefined;
        noData?: boolean | undefined;
        validatePages?: boolean | undefined;
        libp2pJsClientOptions?: {
            key: string;
            libp2pOptions?: Partial<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices> | Omit<import("libp2p").Libp2pOptions<any>, "start"> | undefined>;
            heliaOptions?: Partial<Partial<import("helia").HeliaInit<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices>>> | undefined>;
        }[] | undefined;
    }, z.ZodTypeDef, {
        userAgent?: string | undefined;
        ipfsGatewayUrls?: string[] | undefined;
        kuboRpcClientsOptions?: (string | URL | import("@multiformats/multiaddr").Multiaddr | import("kubo-rpc-client").Options | undefined)[] | undefined;
        httpRoutersOptions?: string[] | undefined;
        pubsubKuboRpcClientsOptions?: (string | URL | import("@multiformats/multiaddr").Multiaddr | import("kubo-rpc-client").Options | undefined)[] | undefined;
        plebbitRpcClientsOptions?: [string, ...string[]] | undefined;
        dataPath?: string | undefined;
        chainProviders?: Record<string, {
            urls: string[];
            chainId: number;
        }> | undefined;
        resolveAuthorAddresses?: boolean | undefined;
        publishInterval?: number | undefined;
        updateInterval?: number | undefined;
        noData?: boolean | undefined;
        validatePages?: boolean | undefined;
        libp2pJsClientOptions?: {
            key: string;
            libp2pOptions?: Partial<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices> | Omit<import("libp2p").Libp2pOptions<any>, "start"> | undefined>;
            heliaOptions?: Partial<Partial<import("helia").HeliaInit<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices>>> | undefined>;
        }[] | undefined;
    }>>;
    authKey: z.ZodOptional<z.ZodString>;
} & {
    port: z.ZodOptional<z.ZodNumber>;
    server: z.ZodOptional<z.ZodType<HTTPServer<typeof import("http").IncomingMessage, typeof import("http").ServerResponse> | HTTPSServer<typeof import("http").IncomingMessage, typeof import("http").ServerResponse>, z.ZodTypeDef, HTTPServer<typeof import("http").IncomingMessage, typeof import("http").ServerResponse> | HTTPSServer<typeof import("http").IncomingMessage, typeof import("http").ServerResponse>>>;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    plebbitOptions: z.ZodOptional<z.ZodType<{
        userAgent?: string | undefined;
        ipfsGatewayUrls?: string[] | undefined;
        kuboRpcClientsOptions?: (string | URL | import("@multiformats/multiaddr").Multiaddr | import("kubo-rpc-client").Options | undefined)[] | undefined;
        httpRoutersOptions?: string[] | undefined;
        pubsubKuboRpcClientsOptions?: (string | URL | import("@multiformats/multiaddr").Multiaddr | import("kubo-rpc-client").Options | undefined)[] | undefined;
        plebbitRpcClientsOptions?: [string, ...string[]] | undefined;
        dataPath?: string | undefined;
        chainProviders?: Record<string, {
            urls: string[];
            chainId: number;
        }> | undefined;
        resolveAuthorAddresses?: boolean | undefined;
        publishInterval?: number | undefined;
        updateInterval?: number | undefined;
        noData?: boolean | undefined;
        validatePages?: boolean | undefined;
        libp2pJsClientOptions?: {
            key: string;
            libp2pOptions?: Partial<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices> | Omit<import("libp2p").Libp2pOptions<any>, "start"> | undefined>;
            heliaOptions?: Partial<Partial<import("helia").HeliaInit<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices>>> | undefined>;
        }[] | undefined;
    }, z.ZodTypeDef, {
        userAgent?: string | undefined;
        ipfsGatewayUrls?: string[] | undefined;
        kuboRpcClientsOptions?: (string | URL | import("@multiformats/multiaddr").Multiaddr | import("kubo-rpc-client").Options | undefined)[] | undefined;
        httpRoutersOptions?: string[] | undefined;
        pubsubKuboRpcClientsOptions?: (string | URL | import("@multiformats/multiaddr").Multiaddr | import("kubo-rpc-client").Options | undefined)[] | undefined;
        plebbitRpcClientsOptions?: [string, ...string[]] | undefined;
        dataPath?: string | undefined;
        chainProviders?: Record<string, {
            urls: string[];
            chainId: number;
        }> | undefined;
        resolveAuthorAddresses?: boolean | undefined;
        publishInterval?: number | undefined;
        updateInterval?: number | undefined;
        noData?: boolean | undefined;
        validatePages?: boolean | undefined;
        libp2pJsClientOptions?: {
            key: string;
            libp2pOptions?: Partial<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices> | Omit<import("libp2p").Libp2pOptions<any>, "start"> | undefined>;
            heliaOptions?: Partial<Partial<import("helia").HeliaInit<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices>>> | undefined>;
        }[] | undefined;
    }>>;
    authKey: z.ZodOptional<z.ZodString>;
} & {
    port: z.ZodOptional<z.ZodNumber>;
    server: z.ZodOptional<z.ZodType<HTTPServer<typeof import("http").IncomingMessage, typeof import("http").ServerResponse> | HTTPSServer<typeof import("http").IncomingMessage, typeof import("http").ServerResponse>, z.ZodTypeDef, HTTPServer<typeof import("http").IncomingMessage, typeof import("http").ServerResponse> | HTTPSServer<typeof import("http").IncomingMessage, typeof import("http").ServerResponse>>>;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    plebbitOptions: z.ZodOptional<z.ZodType<{
        userAgent?: string | undefined;
        ipfsGatewayUrls?: string[] | undefined;
        kuboRpcClientsOptions?: (string | URL | import("@multiformats/multiaddr").Multiaddr | import("kubo-rpc-client").Options | undefined)[] | undefined;
        httpRoutersOptions?: string[] | undefined;
        pubsubKuboRpcClientsOptions?: (string | URL | import("@multiformats/multiaddr").Multiaddr | import("kubo-rpc-client").Options | undefined)[] | undefined;
        plebbitRpcClientsOptions?: [string, ...string[]] | undefined;
        dataPath?: string | undefined;
        chainProviders?: Record<string, {
            urls: string[];
            chainId: number;
        }> | undefined;
        resolveAuthorAddresses?: boolean | undefined;
        publishInterval?: number | undefined;
        updateInterval?: number | undefined;
        noData?: boolean | undefined;
        validatePages?: boolean | undefined;
        libp2pJsClientOptions?: {
            key: string;
            libp2pOptions?: Partial<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices> | Omit<import("libp2p").Libp2pOptions<any>, "start"> | undefined>;
            heliaOptions?: Partial<Partial<import("helia").HeliaInit<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices>>> | undefined>;
        }[] | undefined;
    }, z.ZodTypeDef, {
        userAgent?: string | undefined;
        ipfsGatewayUrls?: string[] | undefined;
        kuboRpcClientsOptions?: (string | URL | import("@multiformats/multiaddr").Multiaddr | import("kubo-rpc-client").Options | undefined)[] | undefined;
        httpRoutersOptions?: string[] | undefined;
        pubsubKuboRpcClientsOptions?: (string | URL | import("@multiformats/multiaddr").Multiaddr | import("kubo-rpc-client").Options | undefined)[] | undefined;
        plebbitRpcClientsOptions?: [string, ...string[]] | undefined;
        dataPath?: string | undefined;
        chainProviders?: Record<string, {
            urls: string[];
            chainId: number;
        }> | undefined;
        resolveAuthorAddresses?: boolean | undefined;
        publishInterval?: number | undefined;
        updateInterval?: number | undefined;
        noData?: boolean | undefined;
        validatePages?: boolean | undefined;
        libp2pJsClientOptions?: {
            key: string;
            libp2pOptions?: Partial<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices> | Omit<import("libp2p").Libp2pOptions<any>, "start"> | undefined>;
            heliaOptions?: Partial<Partial<import("helia").HeliaInit<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices>>> | undefined>;
        }[] | undefined;
    }>>;
    authKey: z.ZodOptional<z.ZodString>;
} & {
    port: z.ZodOptional<z.ZodNumber>;
    server: z.ZodOptional<z.ZodType<HTTPServer<typeof import("http").IncomingMessage, typeof import("http").ServerResponse> | HTTPSServer<typeof import("http").IncomingMessage, typeof import("http").ServerResponse>, z.ZodTypeDef, HTTPServer<typeof import("http").IncomingMessage, typeof import("http").ServerResponse> | HTTPSServer<typeof import("http").IncomingMessage, typeof import("http").ServerResponse>>>;
}, z.ZodTypeAny, "passthrough">>;
export declare const SetNewSettingsPlebbitWsServerSchema: z.ZodObject<{
    plebbitOptions: z.ZodObject<{
        ipfsGatewayUrls: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        kuboRpcClientsOptions: z.ZodOptional<z.ZodEffects<z.ZodArray<z.ZodType<string | URL | import("@multiformats/multiaddr").Multiaddr | import("kubo-rpc-client").Options | undefined, z.ZodTypeDef, string | URL | import("@multiformats/multiaddr").Multiaddr | import("kubo-rpc-client").Options | undefined>, "many">, import("kubo-rpc-client").Options[], (string | URL | import("@multiformats/multiaddr").Multiaddr | import("kubo-rpc-client").Options | undefined)[]>>;
        httpRoutersOptions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        pubsubKuboRpcClientsOptions: z.ZodOptional<z.ZodEffects<z.ZodArray<z.ZodType<string | URL | import("@multiformats/multiaddr").Multiaddr | import("kubo-rpc-client").Options | undefined, z.ZodTypeDef, string | URL | import("@multiformats/multiaddr").Multiaddr | import("kubo-rpc-client").Options | undefined>, "many">, import("kubo-rpc-client").Options[], (string | URL | import("@multiformats/multiaddr").Multiaddr | import("kubo-rpc-client").Options | undefined)[]>>;
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
        libp2pJsClientOptions: z.ZodOptional<z.ZodArray<z.ZodObject<{
            key: z.ZodString;
            libp2pOptions: z.ZodType<Partial<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices> | Omit<import("libp2p").Libp2pOptions<any>, "start"> | undefined>, z.ZodTypeDef, Partial<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices> | Omit<import("libp2p").Libp2pOptions<any>, "start"> | undefined>>;
            heliaOptions: z.ZodType<Partial<Partial<import("helia").HeliaInit<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices>>> | undefined>, z.ZodTypeDef, Partial<Partial<import("helia").HeliaInit<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices>>> | undefined>>;
        }, "strip", z.ZodTypeAny, {
            key: string;
            libp2pOptions?: Partial<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices> | Omit<import("libp2p").Libp2pOptions<any>, "start"> | undefined>;
            heliaOptions?: Partial<Partial<import("helia").HeliaInit<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices>>> | undefined>;
        }, {
            key: string;
            libp2pOptions?: Partial<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices> | Omit<import("libp2p").Libp2pOptions<any>, "start"> | undefined>;
            heliaOptions?: Partial<Partial<import("helia").HeliaInit<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices>>> | undefined>;
        }>, "many">>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        ipfsGatewayUrls: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        kuboRpcClientsOptions: z.ZodOptional<z.ZodEffects<z.ZodArray<z.ZodType<string | URL | import("@multiformats/multiaddr").Multiaddr | import("kubo-rpc-client").Options | undefined, z.ZodTypeDef, string | URL | import("@multiformats/multiaddr").Multiaddr | import("kubo-rpc-client").Options | undefined>, "many">, import("kubo-rpc-client").Options[], (string | URL | import("@multiformats/multiaddr").Multiaddr | import("kubo-rpc-client").Options | undefined)[]>>;
        httpRoutersOptions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        pubsubKuboRpcClientsOptions: z.ZodOptional<z.ZodEffects<z.ZodArray<z.ZodType<string | URL | import("@multiformats/multiaddr").Multiaddr | import("kubo-rpc-client").Options | undefined, z.ZodTypeDef, string | URL | import("@multiformats/multiaddr").Multiaddr | import("kubo-rpc-client").Options | undefined>, "many">, import("kubo-rpc-client").Options[], (string | URL | import("@multiformats/multiaddr").Multiaddr | import("kubo-rpc-client").Options | undefined)[]>>;
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
        libp2pJsClientOptions: z.ZodOptional<z.ZodArray<z.ZodObject<{
            key: z.ZodString;
            libp2pOptions: z.ZodType<Partial<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices> | Omit<import("libp2p").Libp2pOptions<any>, "start"> | undefined>, z.ZodTypeDef, Partial<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices> | Omit<import("libp2p").Libp2pOptions<any>, "start"> | undefined>>;
            heliaOptions: z.ZodType<Partial<Partial<import("helia").HeliaInit<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices>>> | undefined>, z.ZodTypeDef, Partial<Partial<import("helia").HeliaInit<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices>>> | undefined>>;
        }, "strip", z.ZodTypeAny, {
            key: string;
            libp2pOptions?: Partial<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices> | Omit<import("libp2p").Libp2pOptions<any>, "start"> | undefined>;
            heliaOptions?: Partial<Partial<import("helia").HeliaInit<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices>>> | undefined>;
        }, {
            key: string;
            libp2pOptions?: Partial<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices> | Omit<import("libp2p").Libp2pOptions<any>, "start"> | undefined>;
            heliaOptions?: Partial<Partial<import("helia").HeliaInit<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices>>> | undefined>;
        }>, "many">>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        ipfsGatewayUrls: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        kuboRpcClientsOptions: z.ZodOptional<z.ZodEffects<z.ZodArray<z.ZodType<string | URL | import("@multiformats/multiaddr").Multiaddr | import("kubo-rpc-client").Options | undefined, z.ZodTypeDef, string | URL | import("@multiformats/multiaddr").Multiaddr | import("kubo-rpc-client").Options | undefined>, "many">, import("kubo-rpc-client").Options[], (string | URL | import("@multiformats/multiaddr").Multiaddr | import("kubo-rpc-client").Options | undefined)[]>>;
        httpRoutersOptions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        pubsubKuboRpcClientsOptions: z.ZodOptional<z.ZodEffects<z.ZodArray<z.ZodType<string | URL | import("@multiformats/multiaddr").Multiaddr | import("kubo-rpc-client").Options | undefined, z.ZodTypeDef, string | URL | import("@multiformats/multiaddr").Multiaddr | import("kubo-rpc-client").Options | undefined>, "many">, import("kubo-rpc-client").Options[], (string | URL | import("@multiformats/multiaddr").Multiaddr | import("kubo-rpc-client").Options | undefined)[]>>;
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
        libp2pJsClientOptions: z.ZodOptional<z.ZodArray<z.ZodObject<{
            key: z.ZodString;
            libp2pOptions: z.ZodType<Partial<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices> | Omit<import("libp2p").Libp2pOptions<any>, "start"> | undefined>, z.ZodTypeDef, Partial<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices> | Omit<import("libp2p").Libp2pOptions<any>, "start"> | undefined>>;
            heliaOptions: z.ZodType<Partial<Partial<import("helia").HeliaInit<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices>>> | undefined>, z.ZodTypeDef, Partial<Partial<import("helia").HeliaInit<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices>>> | undefined>>;
        }, "strip", z.ZodTypeAny, {
            key: string;
            libp2pOptions?: Partial<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices> | Omit<import("libp2p").Libp2pOptions<any>, "start"> | undefined>;
            heliaOptions?: Partial<Partial<import("helia").HeliaInit<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices>>> | undefined>;
        }, {
            key: string;
            libp2pOptions?: Partial<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices> | Omit<import("libp2p").Libp2pOptions<any>, "start"> | undefined>;
            heliaOptions?: Partial<Partial<import("helia").HeliaInit<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices>>> | undefined>;
        }>, "many">>;
    }, z.ZodTypeAny, "passthrough">>;
}, "strip", z.ZodTypeAny, {
    plebbitOptions: {
        userAgent: string;
        chainProviders: Record<string, {
            urls: string[];
            chainId: number;
        }>;
        resolveAuthorAddresses: boolean;
        publishInterval: number;
        updateInterval: number;
        noData: boolean;
        validatePages: boolean;
        ipfsGatewayUrls?: string[] | undefined;
        kuboRpcClientsOptions?: import("kubo-rpc-client").Options[] | undefined;
        httpRoutersOptions?: string[] | undefined;
        pubsubKuboRpcClientsOptions?: import("kubo-rpc-client").Options[] | undefined;
        plebbitRpcClientsOptions?: [string, ...string[]] | undefined;
        dataPath?: string | undefined;
        libp2pJsClientOptions?: {
            key: string;
            libp2pOptions?: Partial<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices> | Omit<import("libp2p").Libp2pOptions<any>, "start"> | undefined>;
            heliaOptions?: Partial<Partial<import("helia").HeliaInit<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices>>> | undefined>;
        }[] | undefined;
    } & {
        [k: string]: unknown;
    };
}, {
    plebbitOptions: {
        userAgent: string;
        chainProviders: Record<string, {
            urls: string[];
            chainId: number;
        }>;
        resolveAuthorAddresses: boolean;
        publishInterval: number;
        updateInterval: number;
        noData: boolean;
        validatePages: boolean;
        ipfsGatewayUrls?: string[] | undefined;
        kuboRpcClientsOptions?: (string | URL | import("@multiformats/multiaddr").Multiaddr | import("kubo-rpc-client").Options | undefined)[] | undefined;
        httpRoutersOptions?: string[] | undefined;
        pubsubKuboRpcClientsOptions?: (string | URL | import("@multiformats/multiaddr").Multiaddr | import("kubo-rpc-client").Options | undefined)[] | undefined;
        plebbitRpcClientsOptions?: [string, ...string[]] | undefined;
        dataPath?: string | undefined;
        libp2pJsClientOptions?: {
            key: string;
            libp2pOptions?: Partial<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices> | Omit<import("libp2p").Libp2pOptions<any>, "start"> | undefined>;
            heliaOptions?: Partial<Partial<import("helia").HeliaInit<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices>>> | undefined>;
        }[] | undefined;
    } & {
        [k: string]: unknown;
    };
}>;
export declare const PlebbitWsServerSettingsSerializedSchema: z.ZodObject<{
    plebbitOptions: z.ZodObject<{
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
        libp2pJsClientOptions: z.ZodOptional<z.ZodArray<z.ZodObject<{
            key: z.ZodString;
            libp2pOptions: z.ZodType<Partial<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices> | Omit<import("libp2p").Libp2pOptions<any>, "start"> | undefined>, z.ZodTypeDef, Partial<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices> | Omit<import("libp2p").Libp2pOptions<any>, "start"> | undefined>>;
            heliaOptions: z.ZodType<Partial<Partial<import("helia").HeliaInit<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices>>> | undefined>, z.ZodTypeDef, Partial<Partial<import("helia").HeliaInit<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices>>> | undefined>>;
        }, "strip", z.ZodTypeAny, {
            key: string;
            libp2pOptions?: Partial<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices> | Omit<import("libp2p").Libp2pOptions<any>, "start"> | undefined>;
            heliaOptions?: Partial<Partial<import("helia").HeliaInit<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices>>> | undefined>;
        }, {
            key: string;
            libp2pOptions?: Partial<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices> | Omit<import("libp2p").Libp2pOptions<any>, "start"> | undefined>;
            heliaOptions?: Partial<Partial<import("helia").HeliaInit<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices>>> | undefined>;
        }>, "many">>;
    } & {
        kuboRpcClientsOptions: z.ZodOptional<z.ZodType<import("kubo-rpc-client").Options[], z.ZodTypeDef, import("kubo-rpc-client").Options[]>>;
        pubsubKuboRpcClientsOptions: z.ZodOptional<z.ZodType<import("kubo-rpc-client").Options[], z.ZodTypeDef, import("kubo-rpc-client").Options[]>>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
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
        libp2pJsClientOptions: z.ZodOptional<z.ZodArray<z.ZodObject<{
            key: z.ZodString;
            libp2pOptions: z.ZodType<Partial<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices> | Omit<import("libp2p").Libp2pOptions<any>, "start"> | undefined>, z.ZodTypeDef, Partial<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices> | Omit<import("libp2p").Libp2pOptions<any>, "start"> | undefined>>;
            heliaOptions: z.ZodType<Partial<Partial<import("helia").HeliaInit<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices>>> | undefined>, z.ZodTypeDef, Partial<Partial<import("helia").HeliaInit<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices>>> | undefined>>;
        }, "strip", z.ZodTypeAny, {
            key: string;
            libp2pOptions?: Partial<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices> | Omit<import("libp2p").Libp2pOptions<any>, "start"> | undefined>;
            heliaOptions?: Partial<Partial<import("helia").HeliaInit<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices>>> | undefined>;
        }, {
            key: string;
            libp2pOptions?: Partial<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices> | Omit<import("libp2p").Libp2pOptions<any>, "start"> | undefined>;
            heliaOptions?: Partial<Partial<import("helia").HeliaInit<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices>>> | undefined>;
        }>, "many">>;
    } & {
        kuboRpcClientsOptions: z.ZodOptional<z.ZodType<import("kubo-rpc-client").Options[], z.ZodTypeDef, import("kubo-rpc-client").Options[]>>;
        pubsubKuboRpcClientsOptions: z.ZodOptional<z.ZodType<import("kubo-rpc-client").Options[], z.ZodTypeDef, import("kubo-rpc-client").Options[]>>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
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
        libp2pJsClientOptions: z.ZodOptional<z.ZodArray<z.ZodObject<{
            key: z.ZodString;
            libp2pOptions: z.ZodType<Partial<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices> | Omit<import("libp2p").Libp2pOptions<any>, "start"> | undefined>, z.ZodTypeDef, Partial<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices> | Omit<import("libp2p").Libp2pOptions<any>, "start"> | undefined>>;
            heliaOptions: z.ZodType<Partial<Partial<import("helia").HeliaInit<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices>>> | undefined>, z.ZodTypeDef, Partial<Partial<import("helia").HeliaInit<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices>>> | undefined>>;
        }, "strip", z.ZodTypeAny, {
            key: string;
            libp2pOptions?: Partial<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices> | Omit<import("libp2p").Libp2pOptions<any>, "start"> | undefined>;
            heliaOptions?: Partial<Partial<import("helia").HeliaInit<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices>>> | undefined>;
        }, {
            key: string;
            libp2pOptions?: Partial<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices> | Omit<import("libp2p").Libp2pOptions<any>, "start"> | undefined>;
            heliaOptions?: Partial<Partial<import("helia").HeliaInit<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices>>> | undefined>;
        }>, "many">>;
    } & {
        kuboRpcClientsOptions: z.ZodOptional<z.ZodType<import("kubo-rpc-client").Options[], z.ZodTypeDef, import("kubo-rpc-client").Options[]>>;
        pubsubKuboRpcClientsOptions: z.ZodOptional<z.ZodType<import("kubo-rpc-client").Options[], z.ZodTypeDef, import("kubo-rpc-client").Options[]>>;
    }, z.ZodTypeAny, "passthrough">>;
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
        }, z.ZodTypeAny, "passthrough">>, "atleastone">>;
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
                    addresses: z.ZodArray<z.ZodString, "atleastone">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: [string, ...string[]];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: [string, ...string[]];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                role: z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodEnum<["owner", "admin", "moderator"]>, z.ZodString]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
                publicationType: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, z.ZodTypeAny, "passthrough">>, z.objectOutputType<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "atleastone">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: [string, ...string[]];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: [string, ...string[]];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                role: z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodEnum<["owner", "admin", "moderator"]>, z.ZodString]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
                publicationType: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, z.ZodTypeAny, "passthrough">>, z.objectOutputType<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "atleastone">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: [string, ...string[]];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: [string, ...string[]];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                role: z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodEnum<["owner", "admin", "moderator"]>, z.ZodString]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
                publicationType: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, z.ZodTypeAny, "passthrough">>, z.objectOutputType<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, z.ZodTypeAny, "passthrough">>, "atleastone">>;
            description: z.ZodOptional<z.ZodString>;
        }, "strict", z.ZodTypeAny, {
            path?: string | undefined;
            options?: Record<string, string> | undefined;
            exclude?: [z.objectOutputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "atleastone">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: [string, ...string[]];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: [string, ...string[]];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                role: z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodEnum<["owner", "admin", "moderator"]>, z.ZodString]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
                publicationType: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, z.ZodTypeAny, "passthrough">>, z.objectOutputType<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, z.ZodTypeAny, "passthrough">, ...z.objectOutputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "atleastone">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: [string, ...string[]];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: [string, ...string[]];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                role: z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodEnum<["owner", "admin", "moderator"]>, z.ZodString]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
                publicationType: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, z.ZodTypeAny, "passthrough">>, z.objectOutputType<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, z.ZodTypeAny, "passthrough">[]] | undefined;
            description?: string | undefined;
            name?: string | undefined;
        }, {
            path?: string | undefined;
            options?: Record<string, string> | undefined;
            exclude?: [z.objectInputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "atleastone">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: [string, ...string[]];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: [string, ...string[]];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                role: z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodEnum<["owner", "admin", "moderator"]>, z.ZodString]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
                publicationType: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, z.ZodTypeAny, "passthrough">>, z.objectOutputType<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, z.ZodTypeAny, "passthrough">, ...z.objectInputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "atleastone">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: [string, ...string[]];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: [string, ...string[]];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                role: z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodEnum<["owner", "admin", "moderator"]>, z.ZodString]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
                publicationType: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, z.ZodTypeAny, "passthrough">>, z.objectOutputType<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, z.ZodTypeAny, "passthrough">[]] | undefined;
            description?: string | undefined;
            name?: string | undefined;
        }>, {
            path?: string | undefined;
            options?: Record<string, string> | undefined;
            exclude?: [z.objectOutputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "atleastone">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: [string, ...string[]];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: [string, ...string[]];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                role: z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodEnum<["owner", "admin", "moderator"]>, z.ZodString]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
                publicationType: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, z.ZodTypeAny, "passthrough">>, z.objectOutputType<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, z.ZodTypeAny, "passthrough">, ...z.objectOutputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "atleastone">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: [string, ...string[]];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: [string, ...string[]];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                role: z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodEnum<["owner", "admin", "moderator"]>, z.ZodString]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
                publicationType: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, z.ZodTypeAny, "passthrough">>, z.objectOutputType<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, z.ZodTypeAny, "passthrough">[]] | undefined;
            description?: string | undefined;
            name?: string | undefined;
        }, {
            path?: string | undefined;
            options?: Record<string, string> | undefined;
            exclude?: [z.objectInputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "atleastone">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: [string, ...string[]];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: [string, ...string[]];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                role: z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodEnum<["owner", "admin", "moderator"]>, z.ZodString]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
                publicationType: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, z.ZodTypeAny, "passthrough">>, z.objectOutputType<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, z.ZodTypeAny, "passthrough">, ...z.objectInputType<{
                subplebbit: z.ZodOptional<z.ZodObject<{
                    addresses: z.ZodArray<z.ZodString, "atleastone">;
                    maxCommentCids: z.ZodNumber;
                    postScore: z.ZodOptional<z.ZodNumber>;
                    replyScore: z.ZodOptional<z.ZodNumber>;
                    firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                }, "strict", z.ZodTypeAny, {
                    addresses: [string, ...string[]];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: [string, ...string[]];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: z.ZodOptional<z.ZodNumber>;
                replyScore: z.ZodOptional<z.ZodNumber>;
                firstCommentTimestamp: z.ZodOptional<z.ZodNumber>;
                challenges: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                role: z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodEnum<["owner", "admin", "moderator"]>, z.ZodString]>, "many">>;
                address: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rateLimit: z.ZodOptional<z.ZodNumber>;
                rateLimitChallengeSuccess: z.ZodOptional<z.ZodBoolean>;
                publicationType: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, z.ZodTypeAny, "passthrough">>, z.objectOutputType<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    post: z.ZodOptional<z.ZodBoolean>;
                    reply: z.ZodOptional<z.ZodBoolean>;
                    vote: z.ZodOptional<z.ZodBoolean>;
                    commentEdit: z.ZodOptional<z.ZodBoolean>;
                    commentModeration: z.ZodOptional<z.ZodBoolean>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, z.ZodTypeAny, "passthrough">[]] | undefined;
            description?: string | undefined;
            name?: string | undefined;
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
                success: false;
                error: string;
            }, {
                success: false;
                error: string;
            }>]>>>;
            type: z.ZodString;
            caseInsensitive: z.ZodOptional<z.ZodBoolean>;
        }, "strict", z.ZodTypeAny, {
            type: string;
            challenge: string;
            verify: (args_0: string, ...args: unknown[]) => Promise<{
                success: true;
            } | {
                success: false;
                error: string;
            }>;
            caseInsensitive?: boolean | undefined;
        }, {
            type: string;
            challenge: string;
            verify: (args_0: string, ...args: unknown[]) => Promise<{
                success: true;
            } | {
                success: false;
                error: string;
            }>;
            caseInsensitive?: boolean | undefined;
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
            success: false;
            error: string;
        }, {
            success: false;
            error: string;
        }>]>]>>>;
    }, "getChallenge">, "strict", z.ZodTypeAny, {
        type: string;
        description?: string | undefined;
        optionInputs?: [z.objectOutputType<{
            option: z.ZodString;
            label: z.ZodString;
            default: z.ZodOptional<z.ZodString>;
            description: z.ZodOptional<z.ZodString>;
            placeholder: z.ZodOptional<z.ZodString>;
            required: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, ...z.objectOutputType<{
            option: z.ZodString;
            label: z.ZodString;
            default: z.ZodOptional<z.ZodString>;
            description: z.ZodOptional<z.ZodString>;
            placeholder: z.ZodOptional<z.ZodString>;
            required: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">[]] | undefined;
        challenge?: string | undefined;
        caseInsensitive?: boolean | undefined;
    }, {
        type: string;
        description?: string | undefined;
        optionInputs?: [z.objectInputType<{
            option: z.ZodString;
            label: z.ZodString;
            default: z.ZodOptional<z.ZodString>;
            description: z.ZodOptional<z.ZodString>;
            placeholder: z.ZodOptional<z.ZodString>;
            required: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, ...z.objectInputType<{
            option: z.ZodString;
            label: z.ZodString;
            default: z.ZodOptional<z.ZodString>;
            description: z.ZodOptional<z.ZodString>;
            placeholder: z.ZodOptional<z.ZodString>;
            required: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">[]] | undefined;
        challenge?: string | undefined;
        caseInsensitive?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    challenges: Record<string, {
        type: string;
        description?: string | undefined;
        optionInputs?: [z.objectOutputType<{
            option: z.ZodString;
            label: z.ZodString;
            default: z.ZodOptional<z.ZodString>;
            description: z.ZodOptional<z.ZodString>;
            placeholder: z.ZodOptional<z.ZodString>;
            required: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, ...z.objectOutputType<{
            option: z.ZodString;
            label: z.ZodString;
            default: z.ZodOptional<z.ZodString>;
            description: z.ZodOptional<z.ZodString>;
            placeholder: z.ZodOptional<z.ZodString>;
            required: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">[]] | undefined;
        challenge?: string | undefined;
        caseInsensitive?: boolean | undefined;
    }>;
    plebbitOptions: {
        userAgent: string;
        chainProviders: Record<string, {
            urls: string[];
            chainId: number;
        }>;
        resolveAuthorAddresses: boolean;
        publishInterval: number;
        updateInterval: number;
        noData: boolean;
        validatePages: boolean;
        ipfsGatewayUrls?: string[] | undefined;
        kuboRpcClientsOptions?: import("kubo-rpc-client").Options[] | undefined;
        httpRoutersOptions?: string[] | undefined;
        pubsubKuboRpcClientsOptions?: import("kubo-rpc-client").Options[] | undefined;
        plebbitRpcClientsOptions?: [string, ...string[]] | undefined;
        dataPath?: string | undefined;
        libp2pJsClientOptions?: {
            key: string;
            libp2pOptions?: Partial<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices> | Omit<import("libp2p").Libp2pOptions<any>, "start"> | undefined>;
            heliaOptions?: Partial<Partial<import("helia").HeliaInit<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices>>> | undefined>;
        }[] | undefined;
    } & {
        [k: string]: unknown;
    };
}, {
    challenges: Record<string, {
        type: string;
        description?: string | undefined;
        optionInputs?: [z.objectInputType<{
            option: z.ZodString;
            label: z.ZodString;
            default: z.ZodOptional<z.ZodString>;
            description: z.ZodOptional<z.ZodString>;
            placeholder: z.ZodOptional<z.ZodString>;
            required: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, ...z.objectInputType<{
            option: z.ZodString;
            label: z.ZodString;
            default: z.ZodOptional<z.ZodString>;
            description: z.ZodOptional<z.ZodString>;
            placeholder: z.ZodOptional<z.ZodString>;
            required: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">[]] | undefined;
        challenge?: string | undefined;
        caseInsensitive?: boolean | undefined;
    }>;
    plebbitOptions: {
        userAgent: string;
        chainProviders: Record<string, {
            urls: string[];
            chainId: number;
        }>;
        resolveAuthorAddresses: boolean;
        publishInterval: number;
        updateInterval: number;
        noData: boolean;
        validatePages: boolean;
        ipfsGatewayUrls?: string[] | undefined;
        kuboRpcClientsOptions?: import("kubo-rpc-client").Options[] | undefined;
        httpRoutersOptions?: string[] | undefined;
        pubsubKuboRpcClientsOptions?: import("kubo-rpc-client").Options[] | undefined;
        plebbitRpcClientsOptions?: [string, ...string[]] | undefined;
        dataPath?: string | undefined;
        libp2pJsClientOptions?: {
            key: string;
            libp2pOptions?: Partial<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices> | Omit<import("libp2p").Libp2pOptions<any>, "start"> | undefined>;
            heliaOptions?: Partial<Partial<import("helia").HeliaInit<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices>>> | undefined>;
        }[] | undefined;
    } & {
        [k: string]: unknown;
    };
}>;
