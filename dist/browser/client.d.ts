import { MessageHandlerFn } from "ipfs-http-client/types/src/pubsub/subscription-tracker";
import Publication from "./publication";
import { Plebbit } from "./plebbit";
import { Comment } from "./comment";
import { CommentIpfsType, CommentUpdate, SubplebbitIpfsType } from "./types";
import { Subplebbit } from "./subplebbit";
import { PlebbitError } from "./plebbit-error";
export declare class ClientsManager {
    private _plebbit;
    protected curPubsubNodeUrl: string;
    protected curIpfsNodeUrl: string | undefined;
    clients: Publication["clients"] | Comment["clients"] | Subplebbit["clients"];
    constructor(plebbit: Plebbit);
    toJSON(): any;
    getCurrentPubsub(): import("./types").PubsubClient;
    getCurrentIpfs(): import("./types").IpfsClient;
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
    updatePubsubState(newState: Publication["clients"]["pubsubClients"][0]["state"] | Subplebbit["clients"]["pubsubClients"][0]["state"]): void;
    updateIpfsState(newState: Publication["clients"]["ipfsClients"][0]["state"] | Subplebbit["clients"]["ipfsClients"][0]["state"]): void;
    updateGatewayState(newState: Publication["clients"]["ipfsGateways"][0]["state"] | Subplebbit["clients"]["ipfsGateways"][0]["state"], gateway: string): void;
    updateChainProviderState(newState: Publication["clients"]["chainProviders"][0]["state"] | Subplebbit["clients"]["chainProviders"][0]["state"], chainTicker: string): void;
    handleError(e: PlebbitError): void;
    resolveSubplebbitAddressIfNeeded(subplebbitAddress: string): Promise<string | undefined>;
    resolveAuthorAddressIfNeeded(authorAddress: string): Promise<string>;
    fetchIpns(ipns: string): Promise<string>;
    fetchCid(cid: string): Promise<string>;
}
export declare class PublicationClientsManager extends ClientsManager {
    clients: Publication["clients"];
    _publication: Publication;
    constructor(publication: Publication);
    publishChallengeRequest(pubsubTopic: string, data: string): Promise<void>;
    publishChallengeAnswer(pubsubTopic: string, data: string): Promise<void>;
    updatePubsubState(newState: Publication["clients"]["pubsubClients"][0]["state"]): void;
    updateIpfsState(newState: Publication["clients"]["ipfsClients"][0]["state"]): void;
    updateGatewayState(newState: Publication["clients"]["ipfsGateways"][0]["state"], gateway: string): void;
    updateChainProviderState(newState: Publication["clients"]["chainProviders"][0]["state"], chainTicker: string): void;
    handleError(e: PlebbitError): void;
    fetchSubplebbitForPublishing(subplebbitAddress: string): Promise<SubplebbitIpfsType>;
}
export declare class CommentClientsManager extends PublicationClientsManager {
    clients: Comment["clients"];
    private _comment;
    constructor(comment: Comment);
    fetchCommentUpdate(ipnsName: string): Promise<CommentUpdate>;
    fetchCommentCid(cid: string): Promise<CommentIpfsType>;
}
export declare class SubplebbitClientsManager extends ClientsManager {
    clients: Subplebbit["clients"];
    private _subplebbit;
    constructor(subplebbit: Subplebbit);
    fetchSubplebbit(ipnsName: string): Promise<SubplebbitIpfsType>;
    updatePubsubState(newState: Subplebbit["clients"]["pubsubClients"][0]["state"]): void;
    updateIpfsState(newState: Subplebbit["clients"]["ipfsClients"][0]["state"]): void;
    updateGatewayState(newState: Subplebbit["clients"]["ipfsGateways"][0]["state"], gateway: string): void;
    updateChainProviderState(newState: Subplebbit["clients"]["chainProviders"][0]["state"], chainTicker: string): void;
    handleError(e: PlebbitError): void;
}
