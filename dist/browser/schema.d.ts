import { z } from "zod";
export declare const ChainTickerSchema: z.ZodString;
export declare const nonNegativeIntStringSchema: z.ZodString;
export declare const Uint8ArraySchema: z.ZodCustom<Uint8Array<ArrayBufferLike>, Uint8Array<ArrayBufferLike>>;
export declare const ChainProviderSchema: z.ZodObject<{
    urls: z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodEnum<{
        viem: "viem";
        "ethers.js": "ethers.js";
        "web3.js": "web3.js";
    }>]>>;
    chainId: z.ZodNumber;
}, z.core.$strip>;
export declare const PlebbitUserOptionBaseSchema: z.ZodObject<{
    ipfsGatewayUrls: z.ZodOptional<z.ZodArray<z.ZodString>>;
    kuboRpcClientsOptions: z.ZodOptional<z.ZodPipe<z.ZodArray<z.ZodCustom<string | URL | import("@multiformats/multiaddr").Multiaddr | import("kubo-rpc-client").Options | undefined, string | URL | import("@multiformats/multiaddr").Multiaddr | import("kubo-rpc-client").Options | undefined>>, z.ZodTransform<import("kubo-rpc-client").Options[], (string | URL | import("@multiformats/multiaddr").Multiaddr | import("kubo-rpc-client").Options | undefined)[]>>>;
    httpRoutersOptions: z.ZodOptional<z.ZodArray<z.ZodString>>;
    pubsubKuboRpcClientsOptions: z.ZodOptional<z.ZodPipe<z.ZodArray<z.ZodCustom<string | URL | import("@multiformats/multiaddr").Multiaddr | import("kubo-rpc-client").Options | undefined, string | URL | import("@multiformats/multiaddr").Multiaddr | import("kubo-rpc-client").Options | undefined>>, z.ZodTransform<import("kubo-rpc-client").Options[], (string | URL | import("@multiformats/multiaddr").Multiaddr | import("kubo-rpc-client").Options | undefined)[]>>>;
    plebbitRpcClientsOptions: z.ZodOptional<z.ZodArray<z.ZodString>>;
    dataPath: z.ZodOptional<z.ZodString>;
    chainProviders: z.ZodRecord<z.ZodString, z.ZodObject<{
        urls: z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodEnum<{
            viem: "viem";
            "ethers.js": "ethers.js";
            "web3.js": "web3.js";
        }>]>>;
        chainId: z.ZodNumber;
    }, z.core.$strip>>;
    resolveAuthorAddresses: z.ZodBoolean;
    publishInterval: z.ZodNumber;
    updateInterval: z.ZodNumber;
    noData: z.ZodBoolean;
    validatePages: z.ZodBoolean;
    userAgent: z.ZodString;
    libp2pJsClientsOptions: z.ZodOptional<z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        libp2pOptions: z.ZodDefault<z.ZodCustom<Partial<import("libp2p").Libp2pInit<import("helia").DefaultLibp2pServices> & {
            start?: boolean;
        } & Required<Pick<import("libp2p").Libp2pOptions<import("helia").DefaultLibp2pServices>, "services">>>, Partial<import("libp2p").Libp2pInit<import("helia").DefaultLibp2pServices> & {
            start?: boolean;
        } & Required<Pick<import("libp2p").Libp2pOptions<import("helia").DefaultLibp2pServices>, "services">>>>>;
        heliaOptions: z.ZodDefault<z.ZodCustom<Partial<Partial<import("helia").HeliaInit<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices>>> | undefined>, Partial<Partial<import("helia").HeliaInit<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices>>> | undefined>>>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export declare const PlebbitUserOptionsSchema: z.ZodPipe<z.ZodObject<{
    kuboRpcClientsOptions: z.ZodOptional<z.ZodPipe<z.ZodArray<z.ZodCustom<string | URL | import("@multiformats/multiaddr").Multiaddr | import("kubo-rpc-client").Options | undefined, string | URL | import("@multiformats/multiaddr").Multiaddr | import("kubo-rpc-client").Options | undefined>>, z.ZodTransform<import("kubo-rpc-client").Options[], (string | URL | import("@multiformats/multiaddr").Multiaddr | import("kubo-rpc-client").Options | undefined)[]>>>;
    plebbitRpcClientsOptions: z.ZodOptional<z.ZodArray<z.ZodString>>;
    dataPath: z.ZodOptional<z.ZodString>;
    libp2pJsClientsOptions: z.ZodOptional<z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        libp2pOptions: z.ZodDefault<z.ZodCustom<Partial<import("libp2p").Libp2pInit<import("helia").DefaultLibp2pServices> & {
            start?: boolean;
        } & Required<Pick<import("libp2p").Libp2pOptions<import("helia").DefaultLibp2pServices>, "services">>>, Partial<import("libp2p").Libp2pInit<import("helia").DefaultLibp2pServices> & {
            start?: boolean;
        } & Required<Pick<import("libp2p").Libp2pOptions<import("helia").DefaultLibp2pServices>, "services">>>>>;
        heliaOptions: z.ZodDefault<z.ZodCustom<Partial<Partial<import("helia").HeliaInit<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices>>> | undefined>, Partial<Partial<import("helia").HeliaInit<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices>>> | undefined>>>;
    }, z.core.$strip>>>;
    ipfsGatewayUrls: z.ZodPipe<z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>, z.ZodTransform<string[], string[]>>;
    pubsubKuboRpcClientsOptions: z.ZodDefault<z.ZodOptional<z.ZodPipe<z.ZodArray<z.ZodCustom<string | URL | import("@multiformats/multiaddr").Multiaddr | import("kubo-rpc-client").Options | undefined, string | URL | import("@multiformats/multiaddr").Multiaddr | import("kubo-rpc-client").Options | undefined>>, z.ZodTransform<import("kubo-rpc-client").Options[], (string | URL | import("@multiformats/multiaddr").Multiaddr | import("kubo-rpc-client").Options | undefined)[]>>>>;
    httpRoutersOptions: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
    chainProviders: z.ZodPipe<z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodObject<{
        urls: z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodEnum<{
            viem: "viem";
            "ethers.js": "ethers.js";
            "web3.js": "web3.js";
        }>]>>;
        chainId: z.ZodNumber;
    }, z.core.$strip>>>, z.ZodTransform<{
        eth: {
            urls: string[];
            chainId: number;
        };
        avax: {
            urls: string[];
            chainId: number;
        };
        matic: {
            urls: string[];
            chainId: number;
        };
        sol: {
            urls: string[];
            chainId: number;
        };
    }, Record<string, {
        urls: string[];
        chainId: number;
    }>>>;
    resolveAuthorAddresses: z.ZodDefault<z.ZodBoolean>;
    publishInterval: z.ZodDefault<z.ZodNumber>;
    updateInterval: z.ZodDefault<z.ZodNumber>;
    noData: z.ZodDefault<z.ZodBoolean>;
    validatePages: z.ZodDefault<z.ZodBoolean>;
    userAgent: z.ZodDefault<z.ZodString>;
}, z.core.$strip>, z.ZodTransform<{
    pubsubKuboRpcClientsOptions: z.infer<typeof PlebbitUserOptionBaseSchema.shape.pubsubKuboRpcClientsOptions>;
    ipfsGatewayUrls: string[];
    httpRoutersOptions: string[];
    chainProviders: {
        eth: {
            urls: string[];
            chainId: number;
        };
        avax: {
            urls: string[];
            chainId: number;
        };
        matic: {
            urls: string[];
            chainId: number;
        };
        sol: {
            urls: string[];
            chainId: number;
        };
    };
    resolveAuthorAddresses: boolean;
    publishInterval: number;
    updateInterval: number;
    noData: boolean;
    validatePages: boolean;
    userAgent: string;
    kuboRpcClientsOptions?: import("kubo-rpc-client").Options[] | undefined;
    plebbitRpcClientsOptions?: string[] | undefined;
    dataPath?: string | undefined;
    libp2pJsClientsOptions?: {
        key: string;
        libp2pOptions: Partial<import("libp2p").Libp2pInit<import("helia").DefaultLibp2pServices> & {
            start?: boolean;
        } & Required<Pick<import("libp2p").Libp2pOptions<import("helia").DefaultLibp2pServices>, "services">>>;
        heliaOptions: Partial<Partial<import("helia").HeliaInit<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices>>>>;
    }[] | undefined;
}, {
    ipfsGatewayUrls: string[];
    pubsubKuboRpcClientsOptions: import("kubo-rpc-client").Options[];
    httpRoutersOptions: string[];
    chainProviders: {
        eth: {
            urls: string[];
            chainId: number;
        };
        avax: {
            urls: string[];
            chainId: number;
        };
        matic: {
            urls: string[];
            chainId: number;
        };
        sol: {
            urls: string[];
            chainId: number;
        };
    };
    resolveAuthorAddresses: boolean;
    publishInterval: number;
    updateInterval: number;
    noData: boolean;
    validatePages: boolean;
    userAgent: string;
    kuboRpcClientsOptions?: import("kubo-rpc-client").Options[] | undefined;
    plebbitRpcClientsOptions?: string[] | undefined;
    dataPath?: string | undefined;
    libp2pJsClientsOptions?: {
        key: string;
        libp2pOptions: Partial<import("libp2p").Libp2pInit<import("helia").DefaultLibp2pServices> & {
            start?: boolean;
        } & Required<Pick<import("libp2p").Libp2pOptions<import("helia").DefaultLibp2pServices>, "services">>>;
        heliaOptions: Partial<Partial<import("helia").HeliaInit<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices>>>>;
    }[] | undefined;
}>>;
export declare const PlebbitParsedOptionsSchema: z.ZodObject<{
    ipfsGatewayUrls: z.ZodOptional<z.ZodArray<z.ZodString>>;
    httpRoutersOptions: z.ZodOptional<z.ZodArray<z.ZodString>>;
    plebbitRpcClientsOptions: z.ZodOptional<z.ZodArray<z.ZodString>>;
    dataPath: z.ZodOptional<z.ZodString>;
    chainProviders: z.ZodRecord<z.ZodString, z.ZodObject<{
        urls: z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodEnum<{
            viem: "viem";
            "ethers.js": "ethers.js";
            "web3.js": "web3.js";
        }>]>>;
        chainId: z.ZodNumber;
    }, z.core.$strip>>;
    resolveAuthorAddresses: z.ZodBoolean;
    publishInterval: z.ZodNumber;
    updateInterval: z.ZodNumber;
    noData: z.ZodBoolean;
    validatePages: z.ZodBoolean;
    userAgent: z.ZodString;
    libp2pJsClientsOptions: z.ZodOptional<z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        libp2pOptions: z.ZodDefault<z.ZodCustom<Partial<import("libp2p").Libp2pInit<import("helia").DefaultLibp2pServices> & {
            start?: boolean;
        } & Required<Pick<import("libp2p").Libp2pOptions<import("helia").DefaultLibp2pServices>, "services">>>, Partial<import("libp2p").Libp2pInit<import("helia").DefaultLibp2pServices> & {
            start?: boolean;
        } & Required<Pick<import("libp2p").Libp2pOptions<import("helia").DefaultLibp2pServices>, "services">>>>>;
        heliaOptions: z.ZodDefault<z.ZodCustom<Partial<Partial<import("helia").HeliaInit<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices>>> | undefined>, Partial<Partial<import("helia").HeliaInit<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices>>> | undefined>>>;
    }, z.core.$strip>>>;
    kuboRpcClientsOptions: z.ZodOptional<z.ZodCustom<import("kubo-rpc-client").Options[], import("kubo-rpc-client").Options[]>>;
    pubsubKuboRpcClientsOptions: z.ZodOptional<z.ZodCustom<import("kubo-rpc-client").Options[], import("kubo-rpc-client").Options[]>>;
}, z.core.$strict>;
