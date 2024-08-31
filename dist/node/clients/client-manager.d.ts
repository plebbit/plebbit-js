import Publication from "../publications/publication.js";
import { Plebbit } from "../plebbit.js";
import { Comment } from "../publications/comment/comment.js";
import type { ChainTicker } from "../types.js";
import { PlebbitError } from "../plebbit-error.js";
import { CommentIpfsClient, GenericIpfsClient, PublicationIpfsClient, SubplebbitIpfsClient } from "./ipfs-client.js";
import { GenericPubsubClient, PublicationPubsubClient, SubplebbitPubsubClient } from "./pubsub-client.js";
import { GenericChainProviderClient } from "./chain-provider-client.js";
import { CommentIpfsGatewayClient, GenericIpfsGatewayClient, PublicationIpfsGatewayClient, SubplebbitIpfsGatewayClient } from "./ipfs-gateway-client.js";
import { BaseClientsManager, LoadType } from "./base-client-manager.js";
import { CommentPlebbitRpcStateClient, GenericPlebbitRpcStateClient, PublicationPlebbitRpcStateClient, SubplebbitPlebbitRpcStateClient } from "./rpc-client/plebbit-rpc-state-client.js";
import type { SubplebbitIpfsType } from "../subplebbit/types.js";
import type { CommentIpfsType, CommentIpfsWithCidDefined, CommentUpdateType } from "../publications/comment/types.js";
type ResultOfFetchingSubplebbit = {
    subplebbit: SubplebbitIpfsType;
    cid: string;
};
export declare class ClientsManager extends BaseClientsManager {
    clients: {
        ipfsGateways: {
            [ipfsGatewayUrl: string]: GenericIpfsGatewayClient;
        };
        ipfsClients: {
            [ipfsClientUrl: string]: GenericIpfsClient;
        };
        pubsubClients: {
            [pubsubClientUrl: string]: GenericPubsubClient;
        };
        chainProviders: Record<ChainTicker, {
            [chainProviderUrl: string]: GenericChainProviderClient;
        }>;
        plebbitRpcClients: {
            [plebbitRpcClientUrl: string]: GenericPlebbitRpcStateClient;
        };
    };
    constructor(plebbit: Plebbit);
    protected _initIpfsGateways(): void;
    protected _initIpfsClients(): void;
    protected _initPubsubClients(): void;
    protected _initChainProviders(): void;
    protected _initPlebbitRpcClients(): void;
    preFetchGateway(gatewayUrl: string, path: string, loadType: LoadType): void;
    postFetchGatewayFailure(gatewayUrl: string, path: string, loadType: LoadType): void;
    postFetchGatewaySuccess(gatewayUrl: string, path: string, loadType: LoadType): void;
    postFetchGatewayAborted(gatewayUrl: string, path: string, loadType: LoadType): void;
    preResolveTextRecord(address: string, txtRecordName: "subplebbit-address" | "plebbit-author-address", chain: ChainTicker, chainProviderUrl: string): void;
    postResolveTextRecordSuccess(address: string, txtRecordName: "subplebbit-address" | "plebbit-author-address", resolvedTextRecord: string, chain: ChainTicker, chainProviderUrl: string): void;
    postResolveTextRecordFailure(address: string, txtRecordName: "subplebbit-address" | "plebbit-author-address", chain: ChainTicker, chainProviderUrl: string): void;
    updatePubsubState(newState: GenericPubsubClient["state"], pubsubProvider: string | undefined): void;
    updateIpfsState(newState: GenericIpfsClient["state"]): void;
    updateGatewayState(newState: GenericIpfsGatewayClient["state"], gateway: string): void;
    updateChainProviderState(newState: GenericChainProviderClient["state"], chainTicker: ChainTicker, chainProviderUrl: string): void;
    fetchCid(cid: string): Promise<string>;
    private _findErrorInSubplebbitRecord;
    fetchSubplebbit(subAddress: string): Promise<ResultOfFetchingSubplebbit>;
    private _fetchSubplebbitIpnsP2PAndVerify;
    private _fetchSubplebbitIpns;
    private _fetchSubplebbitFromGateways;
    protected _getStatePriorToResolvingSubplebbitIpns(): "fetching-subplebbit-ipns" | "fetching-ipns";
    protected _getSubplebbitAddressFromInstance(): string;
    protected postFetchSubplebbitInvalidRecord(subRawJson: string, subError: PlebbitError): void;
    protected preFetchSubplebbitIpns(subIpnsName: string): void;
    protected preResolveSubplebbitIpnsP2P(subIpnsName: string): void;
    protected postResolveSubplebbitIpnsP2PSuccess(subIpnsName: string, subplebbitCid: string): void;
    protected postResolveSubplebbitIpnsP2PFailure(subIpnsName: string, err: PlebbitError): void;
    protected postFetchSubplebbitStringJsonP2PSuccess(): void;
    protected postFetchSubplebbitStringJsonP2PFailure(subIpnsName: string, subplebbitCid: string, err: PlebbitError): void;
    protected postFetchSubplebbitIpfsSuccess(subRes: ResultOfFetchingSubplebbit): void;
}
export declare class PublicationClientsManager extends ClientsManager {
    clients: {
        ipfsGateways: {
            [ipfsGatewayUrl: string]: PublicationIpfsGatewayClient | CommentIpfsGatewayClient;
        };
        ipfsClients: {
            [ipfsClientUrl: string]: PublicationIpfsClient | CommentIpfsClient;
        };
        pubsubClients: {
            [pubsubClientUrl: string]: PublicationPubsubClient;
        };
        chainProviders: Record<ChainTicker, {
            [chainProviderUrl: string]: GenericChainProviderClient;
        }>;
        plebbitRpcClients: Record<string, PublicationPlebbitRpcStateClient>;
    };
    _publication: Publication;
    constructor(publication: Publication);
    protected _initIpfsClients(): void;
    protected _initPubsubClients(): void;
    protected _initPlebbitRpcClients(): void;
    preResolveTextRecord(address: string, txtRecordName: "subplebbit-address" | "plebbit-author-address", chain: ChainTicker, chainProviderUrl: string): void;
    postResolveTextRecordSuccess(address: string, txtRecordName: "subplebbit-address" | "plebbit-author-address", resolvedTextRecord: string, chain: ChainTicker, chainProviderUrl: string): void;
    emitError(e: PlebbitError): void;
    updateIpfsState(newState: PublicationIpfsClient["state"] | CommentIpfsClient["state"]): void;
    updatePubsubState(newState: PublicationPubsubClient["state"], pubsubProvider: string | undefined): void;
    updateGatewayState(newState: PublicationIpfsGatewayClient["state"], gateway: string): void;
    protected _getSubplebbitAddressFromInstance(): string;
    protected preFetchSubplebbitIpns(subIpnsName: string): void;
    protected preResolveSubplebbitIpnsP2P(subIpnsName: string): void;
    protected postResolveSubplebbitIpnsP2PSuccess(subIpnsName: string, subplebbitCid: string): void;
    protected postResolveSubplebbitIpnsP2PFailure(subIpnsName: string, err: PlebbitError): void;
    protected postFetchSubplebbitStringJsonP2PSuccess(): void;
    protected postFetchSubplebbitStringJsonP2PFailure(subIpnsName: string, subplebbitCid: string, err: PlebbitError): void;
    protected postFetchSubplebbitIpfsSuccess(subJson: ResultOfFetchingSubplebbit): void;
    protected postFetchSubplebbitInvalidRecord(subJson: string, subError: PlebbitError): void;
}
export declare class CommentClientsManager extends PublicationClientsManager {
    clients: {
        ipfsGateways: {
            [ipfsGatewayUrl: string]: CommentIpfsGatewayClient;
        };
        ipfsClients: {
            [ipfsClientUrl: string]: CommentIpfsClient;
        };
        pubsubClients: {
            [pubsubClientUrl: string]: PublicationPubsubClient;
        };
        chainProviders: Record<ChainTicker, {
            [chainProviderUrl: string]: GenericChainProviderClient;
        }>;
        plebbitRpcClients: Record<string, CommentPlebbitRpcStateClient>;
    };
    private _comment;
    constructor(comment: Comment);
    protected _initIpfsClients(): void;
    protected _initPlebbitRpcClients(): void;
    preResolveTextRecord(address: string, txtRecordName: "subplebbit-address" | "plebbit-author-address", chain: ChainTicker, chainProviderUrl: string): void;
    _findCommentInSubplebbitPosts(subIpns: SubplebbitIpfsType, commentCidToLookFor: string): {
        timestamp: number;
        signature: {
            type: "ed25519" | "eip191";
            publicKey: string;
            signature: string;
            signedPropertyNames: [string, ...string[]];
        };
        author: {
            address: string;
            previousCommentCid?: string | undefined;
            displayName?: string | undefined;
            wallets?: Record<string, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }> | undefined;
            avatar?: import("zod").objectOutputType<{
                chainTicker: import("zod").ZodString;
                address: import("zod").ZodString;
                id: import("zod").ZodString;
                timestamp: import("zod").ZodNumber;
                signature: import("zod").ZodObject<{
                    signature: import("zod").ZodString;
                    type: import("zod").ZodEnum<["eip191"]>;
                }, "strip", import("zod").ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
                    signature: string;
                }>;
            }, import("zod").ZodTypeAny, "passthrough"> | undefined;
            flair?: import("zod").objectOutputType<{
                text: import("zod").ZodString;
                backgroundColor: import("zod").ZodOptional<import("zod").ZodString>;
                textColor: import("zod").ZodOptional<import("zod").ZodString>;
                expiresAt: import("zod").ZodOptional<import("zod").ZodNumber>;
            }, import("zod").ZodTypeAny, "passthrough"> | undefined;
        } & {
            [k: string]: unknown;
        };
        subplebbitAddress: string;
        protocolVersion: string;
        cid: string;
        depth: number;
        postCid: string;
        flair?: import("zod").objectOutputType<{
            text: import("zod").ZodString;
            backgroundColor: import("zod").ZodOptional<import("zod").ZodString>;
            textColor: import("zod").ZodOptional<import("zod").ZodString>;
            expiresAt: import("zod").ZodOptional<import("zod").ZodNumber>;
        }, import("zod").ZodTypeAny, "passthrough"> | undefined;
        link?: string | undefined;
        spoiler?: boolean | undefined;
        content?: string | undefined;
        title?: string | undefined;
        linkWidth?: number | undefined;
        linkHeight?: number | undefined;
        linkHtmlTagName?: "audio" | "video" | "a" | "img" | undefined;
        parentCid?: string | undefined;
        thumbnailUrl?: string | undefined;
        thumbnailUrlWidth?: number | undefined;
        thumbnailUrlHeight?: number | undefined;
        previousCid?: string | undefined;
    } | undefined;
    _fetchParentCommentForCommentUpdate(parentCid: string): Promise<CommentIpfsWithCidDefined>;
    _getParentsPath(subIpns: SubplebbitIpfsType): Promise<string>;
    private _calculatePathForCommentUpdate;
    private _fetchCommentUpdateIpfsP2P;
    _shouldWeFetchCommentUpdateFromNextTimestamp(err: PlebbitError): boolean;
    private _throwIfCommentUpdateHasInvalidSignature;
    private _fetchCommentUpdateFromGateways;
    fetchCommentUpdate(): Promise<CommentUpdateType>;
    private _fetchRawCommentCidIpfsP2P;
    private _fetchCommentIpfsFromGateways;
    private _throwIfCommentIpfsIsInvalid;
    fetchAndVerifyCommentCid(cid: string): Promise<CommentIpfsType>;
    updateIpfsState(newState: CommentIpfsClient["state"]): void;
    protected _isPublishing(): boolean;
    postResolveTextRecordSuccess(address: string, txtRecordName: "subplebbit-address" | "plebbit-author-address", resolvedTextRecord: string, chain: ChainTicker, chainProviderUrl: string): void;
    protected preFetchSubplebbitIpns(subIpnsName: string): void;
    protected preResolveSubplebbitIpnsP2P(subIpnsName: string): void;
    protected postResolveSubplebbitIpnsP2PSuccess(subIpnsName: string, subplebbitCid: string): void;
    protected postResolveSubplebbitIpnsP2PFailure(subIpnsName: string, err: PlebbitError): void;
    protected postFetchSubplebbitStringJsonP2PSuccess(): void;
    protected postFetchSubplebbitStringJsonP2PFailure(subIpnsName: string, subplebbitCid: string, err: PlebbitError): void;
    protected postFetchSubplebbitIpfsSuccess(subJson: ResultOfFetchingSubplebbit): void;
    protected postFetchSubplebbitInvalidRecord(subJson: string, subError: PlebbitError): void;
    postFetchGatewaySuccess(gatewayUrl: string, path: string, loadType: LoadType): void;
}
export declare class SubplebbitClientsManager extends ClientsManager {
    clients: {
        ipfsGateways: {
            [ipfsGatewayUrl: string]: SubplebbitIpfsGatewayClient;
        };
        ipfsClients: {
            [ipfsClientUrl: string]: SubplebbitIpfsClient;
        };
        pubsubClients: {
            [pubsubClientUrl: string]: SubplebbitPubsubClient;
        };
        chainProviders: Record<ChainTicker, {
            [chainProviderUrl: string]: GenericChainProviderClient;
        }>;
        plebbitRpcClients: Record<string, SubplebbitPlebbitRpcStateClient>;
    };
    private _subplebbit;
    constructor(subplebbit: SubplebbitClientsManager["_subplebbit"]);
    protected _initIpfsClients(): void;
    protected _initPubsubClients(): void;
    protected _initPlebbitRpcClients(): void;
    updateIpfsState(newState: SubplebbitIpfsClient["state"]): void;
    updatePubsubState(newState: SubplebbitPubsubClient["state"], pubsubProvider: string | undefined): void;
    updateGatewayState(newState: CommentIpfsGatewayClient["state"], gateway: string): void;
    emitError(e: PlebbitError): void;
    protected _getStatePriorToResolvingSubplebbitIpns(): "fetching-subplebbit-ipns" | "fetching-ipns";
    preResolveTextRecord(address: string, txtRecordName: "subplebbit-address" | "plebbit-author-address", chain: ChainTicker, chainProviderUrl: string): void;
    postResolveTextRecordSuccess(address: string, txtRecordName: "subplebbit-address" | "plebbit-author-address", resolvedTextRecord: string, chain: ChainTicker, chainProviderUrl: string): void;
    protected _getSubplebbitAddressFromInstance(): string;
    protected preFetchSubplebbitIpns(subIpnsName: string): void;
    protected preResolveSubplebbitIpnsP2P(subIpnsName: string): void;
    protected postResolveSubplebbitIpnsP2PSuccess(subIpnsName: string, subplebbitCid: string): void;
    protected postResolveSubplebbitIpnsP2PFailure(subIpnsName: string, err: PlebbitError): void;
    protected postFetchSubplebbitStringJsonP2PSuccess(): void;
    protected postFetchSubplebbitStringJsonP2PFailure(subIpnsName: string, subplebbitCid: string, err: PlebbitError): void;
    protected postFetchSubplebbitIpfsSuccess(subJson: ResultOfFetchingSubplebbit): void;
    protected postFetchSubplebbitInvalidRecord(subJson: string, subError: PlebbitError): void;
}
export {};
