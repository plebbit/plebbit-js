import { z } from "zod";
import type { Server as HTTPServer } from "http";
import type { Server as HTTPSServer } from "https";
export declare const CreatePlebbitWsServerOptionsSchema: z.ZodObject<{
    plebbitOptions: z.ZodOptional<z.ZodCustom<{
        kuboRpcClientsOptions?: (string | URL | import("@multiformats/multiaddr").Multiaddr | import("kubo-rpc-client").Options | undefined)[] | undefined;
        plebbitRpcClientsOptions?: string[] | undefined;
        dataPath?: string | undefined;
        libp2pJsClientsOptions?: {
            key: string;
            libp2pOptions?: Partial<import("libp2p").Libp2pInit<import("helia").DefaultLibp2pServices> & {
                start?: boolean;
            } & Required<Pick<import("libp2p").Libp2pOptions<import("helia").DefaultLibp2pServices>, "services">>> | undefined;
            heliaOptions?: Partial<Partial<import("helia").HeliaInit<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices>>> | undefined>;
        }[] | undefined;
        ipfsGatewayUrls?: string[] | undefined;
        pubsubKuboRpcClientsOptions?: (string | URL | import("@multiformats/multiaddr").Multiaddr | import("kubo-rpc-client").Options | undefined)[] | undefined;
        httpRoutersOptions?: string[] | undefined;
        chainProviders?: Record<string, {
            urls: string[];
            chainId: number;
        }> | undefined;
        resolveAuthorAddresses?: boolean | undefined;
        publishInterval?: number | undefined;
        updateInterval?: number | undefined;
        noData?: boolean | undefined;
        validatePages?: boolean | undefined;
        userAgent?: string | undefined;
    }, {
        kuboRpcClientsOptions?: (string | URL | import("@multiformats/multiaddr").Multiaddr | import("kubo-rpc-client").Options | undefined)[] | undefined;
        plebbitRpcClientsOptions?: string[] | undefined;
        dataPath?: string | undefined;
        libp2pJsClientsOptions?: {
            key: string;
            libp2pOptions?: Partial<import("libp2p").Libp2pInit<import("helia").DefaultLibp2pServices> & {
                start?: boolean;
            } & Required<Pick<import("libp2p").Libp2pOptions<import("helia").DefaultLibp2pServices>, "services">>> | undefined;
            heliaOptions?: Partial<Partial<import("helia").HeliaInit<import("libp2p").Libp2p<import("helia").DefaultLibp2pServices>>> | undefined>;
        }[] | undefined;
        ipfsGatewayUrls?: string[] | undefined;
        pubsubKuboRpcClientsOptions?: (string | URL | import("@multiformats/multiaddr").Multiaddr | import("kubo-rpc-client").Options | undefined)[] | undefined;
        httpRoutersOptions?: string[] | undefined;
        chainProviders?: Record<string, {
            urls: string[];
            chainId: number;
        }> | undefined;
        resolveAuthorAddresses?: boolean | undefined;
        publishInterval?: number | undefined;
        updateInterval?: number | undefined;
        noData?: boolean | undefined;
        validatePages?: boolean | undefined;
        userAgent?: string | undefined;
    }>>;
    authKey: z.ZodOptional<z.ZodString>;
    port: z.ZodOptional<z.ZodNumber>;
    server: z.ZodOptional<z.ZodCustom<HTTPServer<typeof import("http").IncomingMessage, typeof import("http").ServerResponse> | HTTPSServer<typeof import("http").IncomingMessage, typeof import("http").ServerResponse>, HTTPServer<typeof import("http").IncomingMessage, typeof import("http").ServerResponse> | HTTPSServer<typeof import("http").IncomingMessage, typeof import("http").ServerResponse>>>;
}, z.core.$loose>;
export declare const SetNewSettingsPlebbitWsServerSchema: z.ZodObject<{
    plebbitOptions: z.ZodObject<{
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
    }, z.core.$loose>;
}, z.core.$strip>;
export declare const PlebbitWsServerSettingsSerializedSchema: z.ZodObject<{
    plebbitOptions: z.ZodObject<{
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
    }, z.core.$loose>;
    challenges: z.ZodRecord<z.ZodString, z.ZodObject<{
        type: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        optionInputs: z.ZodOptional<z.ZodArray<z.ZodObject<{
            option: z.ZodString;
            label: z.ZodString;
            default: z.ZodOptional<z.ZodString>;
            description: z.ZodOptional<z.ZodString>;
            placeholder: z.ZodOptional<z.ZodString>;
            required: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$loose>>>;
        challenge: z.ZodOptional<z.ZodString>;
        caseInsensitive: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strict>>;
}, z.core.$strip>;
