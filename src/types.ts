import { Options } from "ipfs-http-client";

// TODO: define types
export type PlebbitOptions = {
    ipfsHttpClientOptions: Options;
    ipfsGatewayUrl: string;
    pubsubHttpClientOptions: Options;
    dataPath: string;
    blockchainProviders: Object;
};
export type CreateSignerOptions = any;
export type Subplebbit = any;
export type Encrypted = any;
export type SubplebbitEncryption = any;
export type Nft = { chainTicker: string; id: string; address: string; signature: string };
