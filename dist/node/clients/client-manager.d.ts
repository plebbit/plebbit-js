import Publication from "../publication";
import { Plebbit } from "../plebbit";
import { Comment } from "../comment";
import { Chain, CommentIpfsType, CommentUpdate, SubplebbitIpfsType } from "../types";
import { Subplebbit } from "../subplebbit";
import { PlebbitError } from "../plebbit-error";
import { CommentIpfsClient, GenericIpfsClient, PublicationIpfsClient, SubplebbitIpfsClient } from "./ipfs-client";
import { GenericPubsubClient, PublicationPubsubClient, SubplebbitPubsubClient } from "./pubsub-client";
import { GenericChainProviderClient } from "./chain-provider-client";
import { CommentIpfsGatewayClient, GenericIpfsGatewayClient, PublicationIpfsGatewayClient, SubplebbitIpfsGatewayClient } from "./ipfs-gateway-client";
import { BaseClientsManager, LoadType } from "./base-client-manager";
export declare class ClientsManager extends BaseClientsManager {
    protected _plebbit: Plebbit;
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
        chainProviders: Record<Chain, {
            [chainProviderUrl: string]: GenericChainProviderClient;
        }>;
    };
    constructor(plebbit: Plebbit);
    protected _initIpfsGateways(): void;
    protected _initIpfsClients(): void;
    protected _initPubsubClients(): void;
    protected _initChainProviders(): void;
    preFetchGateway(gatewayUrl: string, path: string, loadType: LoadType): void;
    postFetchGatewayFailure(gatewayUrl: string, path: string, loadType: LoadType): void;
    postFetchGatewaySuccess(gatewayUrl: string, path: string, loadType: LoadType): void;
    postFetchGatewayAborted(gatewayUrl: string, path: string, loadType: LoadType): void;
    preResolveTextRecord(address: string, txtRecordName: "subplebbit-address" | "plebbit-author-address", chain: string, chainProviderUrl: string): void;
    postResolveTextRecordSuccess(address: string, txtRecordName: "subplebbit-address" | "plebbit-author-address", resolvedTextRecord: string, chain: string, chainProviderUrl: string): void;
    postResolveTextRecordFailure(address: string, txtRecordName: "subplebbit-address" | "plebbit-author-address", chain: string, chainProviderUrl: string): void;
    updatePubsubState(newState: GenericPubsubClient["state"], pubsubProvider: string | undefined): void;
    updateIpfsState(newState: GenericIpfsClient["state"]): void;
    updateGatewayState(newState: GenericIpfsGatewayClient["state"], gateway: string): void;
    updateChainProviderState(newState: GenericChainProviderClient["state"], chainTicker: string, chainProviderUrl: string): void;
    fetchCid(cid: string): Promise<string>;
    protected _getStatePriorToResolvingSubplebbitIpns(): "fetching-subplebbit-ipns" | "fetching-ipns";
    protected _getStatePriorToResolvingSubplebbitIpfs(): "fetching-subplebbit-ipfs" | "fetching-ipfs";
    fetchSubplebbitIpns(ipnsAddress: string): Promise<string>;
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
        chainProviders: Record<Chain, {
            [chainProviderUrl: string]: GenericChainProviderClient;
        }>;
    };
    _publication: Publication;
    _attemptingToResolve: boolean;
    constructor(publication: Publication);
    protected _initIpfsClients(): void;
    protected _initPubsubClients(): void;
    protected prePubsubPublishProvider(pubsubTopic: string, pubsubProvider: string): void;
    protected postPubsubPublishProviderSuccess(pubsubTopic: string, pubsubProvider: string): void;
    protected postPubsubPublishProviderFailure(pubsubTopic: string, pubsubProvider: string): void;
    preResolveTextRecord(address: string, txtRecordName: "subplebbit-address" | "plebbit-author-address", resolvedTextRecord: string, chain: string): void;
    emitError(e: PlebbitError): void;
    fetchSubplebbitForPublishing(subplebbitAddress: string): Promise<SubplebbitIpfsType>;
    updateIpfsState(newState: PublicationIpfsClient["state"] | CommentIpfsClient["state"]): void;
    updatePubsubState(newState: PublicationPubsubClient["state"], pubsubProvider: string | undefined): void;
    updateGatewayState(newState: PublicationIpfsGatewayClient["state"], gateway: string): void;
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
        chainProviders: Record<Chain, {
            [chainProviderUrl: string]: GenericChainProviderClient;
        }>;
    };
    private _comment;
    constructor(comment: Comment);
    protected _initIpfsClients(): void;
    fetchCommentUpdate(ipnsName: string): Promise<CommentUpdate>;
    fetchCommentCid(cid: string): Promise<CommentIpfsType>;
    updateIpfsState(newState: CommentIpfsClient["state"]): void;
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
        chainProviders: Record<Chain, {
            [chainProviderUrl: string]: GenericChainProviderClient;
        }>;
    };
    private _subplebbit;
    constructor(subplebbit: Subplebbit);
    protected _initIpfsClients(): void;
    protected _initPubsubClients(): void;
    fetchSubplebbit(ipnsName: string): Promise<SubplebbitIpfsType>;
    updateIpfsState(newState: SubplebbitIpfsClient["state"]): void;
    updatePubsubState(newState: SubplebbitPubsubClient["state"], pubsubProvider: string | undefined): void;
    updateGatewayState(newState: CommentIpfsGatewayClient["state"], gateway: string): void;
    emitError(e: PlebbitError): void;
    protected _getStatePriorToResolvingSubplebbitIpns(): "fetching-subplebbit-ipns" | "fetching-ipns";
    protected _getStatePriorToResolvingSubplebbitIpfs(): "fetching-subplebbit-ipfs" | "fetching-ipfs";
}
