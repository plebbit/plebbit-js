import { MessageHandlerFn } from "ipfs-http-client/types/src/pubsub/subscription-tracker";
import Publication from "../publication";
import { Plebbit } from "../plebbit";
import { Comment } from "../comment";
import { CommentIpfsType, CommentUpdate, SubplebbitIpfsType } from "../types";
import { Subplebbit } from "../subplebbit";
import { PlebbitError } from "../plebbit-error";
import { GenericIpfsGatewayClient } from "./ipfs-gateway-client";
import { CommentIpfsClient, GenericIpfsClient, PublicationIpfsClient, SubplebbitIpfsClient } from "./ipfs-client";
import { GenericPubsubClient, PublicationPubsubClient, SubplebbitPubsubClient } from "./pubsub-client";
import { GenericChainProviderClient } from "./chain-provider-client";
export declare class ClientsManager {
    protected _plebbit: Plebbit;
    protected curPubsubNodeUrl: string;
    protected curIpfsNodeUrl: string | undefined;
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
        chainProviders: {
            [chainProviderUrl: string]: GenericChainProviderClient;
        };
    };
    constructor(plebbit: Plebbit);
    toJSON(): any;
    protected _initIpfsGateways(): void;
    protected _initIpfsClients(): void;
    protected _initPubsubClients(): void;
    protected _initChainProviders(): void;
    getCurrentPubsub(): import("../types").PubsubClient;
    getCurrentIpfs(): import("../types").IpfsClient;
    pubsubSubscribe(pubsubTopic: string, handler: MessageHandlerFn): Promise<void>;
    pubsubUnsubscribe(pubsubTopic: string, handler?: MessageHandlerFn): Promise<void>;
    pubsubPublish(pubsubTopic: string, data: string): Promise<void>;
    private _fetchWithLimit;
    resolveIpnsToCidP2P(ipns: string): Promise<string>;
    fetchCidP2P(cid: string): Promise<string>;
    private _verifyContentIsSameAsCid;
    protected fetchWithGateway(gateway: string, path: string): Promise<string | {
        error: PlebbitError;
    }>;
    fetchFromMultipleGateways(loadOpts: {
        cid?: string;
        ipns?: string;
    }): Promise<string>;
    updatePubsubState(newState: GenericPubsubClient["state"]): void;
    updateIpfsState(newState: GenericIpfsClient["state"]): void;
    updateGatewayState(newState: GenericIpfsGatewayClient["state"], gateway: string): void;
    updateChainProviderState(newState: GenericChainProviderClient["state"], chainTicker: string): void;
    handleError(e: PlebbitError): void;
    resolveSubplebbitAddressIfNeeded(subplebbitAddress: string): Promise<string | undefined>;
    resolveAuthorAddressIfNeeded(authorAddress: string): Promise<string>;
    fetchIpns(ipns: string): Promise<string>;
    fetchCid(cid: string): Promise<string>;
}
export declare class PublicationClientsManager extends ClientsManager {
    clients: {
        ipfsGateways: {
            [ipfsGatewayUrl: string]: GenericIpfsGatewayClient;
        };
        ipfsClients: {
            [ipfsClientUrl: string]: PublicationIpfsClient | CommentIpfsClient;
        };
        pubsubClients: {
            [pubsubClientUrl: string]: PublicationPubsubClient;
        };
        chainProviders: {
            [chainProviderUrl: string]: GenericChainProviderClient;
        };
    };
    _publication: Publication;
    constructor(publication: Publication);
    protected _initIpfsClients(): void;
    protected _initPubsubClients(): void;
    publishChallengeRequest(pubsubTopic: string, data: string): Promise<void>;
    publishChallengeAnswer(pubsubTopic: string, data: string): Promise<void>;
    handleError(e: PlebbitError): void;
    fetchSubplebbitForPublishing(subplebbitAddress: string): Promise<SubplebbitIpfsType>;
    updateIpfsState(newState: PublicationIpfsClient["state"] | CommentIpfsClient["state"]): void;
    updatePubsubState(newState: PublicationPubsubClient["state"]): void;
}
export declare class CommentClientsManager extends PublicationClientsManager {
    clients: {
        ipfsGateways: {
            [ipfsGatewayUrl: string]: GenericIpfsGatewayClient;
        };
        ipfsClients: {
            [ipfsClientUrl: string]: CommentIpfsClient;
        };
        pubsubClients: {
            [pubsubClientUrl: string]: PublicationPubsubClient;
        };
        chainProviders: {
            [chainProviderUrl: string]: GenericChainProviderClient;
        };
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
            [ipfsGatewayUrl: string]: GenericIpfsGatewayClient;
        };
        ipfsClients: {
            [ipfsClientUrl: string]: SubplebbitIpfsClient;
        };
        pubsubClients: {
            [pubsubClientUrl: string]: SubplebbitPubsubClient;
        };
        chainProviders: {
            [chainProviderUrl: string]: GenericChainProviderClient;
        };
    };
    private _subplebbit;
    constructor(subplebbit: Subplebbit);
    protected _initIpfsClients(): void;
    protected _initPubsubClients(): void;
    fetchSubplebbit(ipnsName: string): Promise<SubplebbitIpfsType>;
    updateIpfsState(newState: SubplebbitIpfsClient["state"]): void;
    updatePubsubState(newState: SubplebbitPubsubClient["state"]): void;
    handleError(e: PlebbitError): void;
}
