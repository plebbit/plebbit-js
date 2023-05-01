import Author from "./author";
import { Signer } from "./signer";
import { ProtocolVersion, PublicationEvents, PublicationType, PublicationTypeName, SubplebbitIpfsType } from "./types";
import { Plebbit } from "./plebbit";
import { SignatureType } from "./signer/constants";
import { TypedEmitter } from "tiny-typed-emitter";
import { CommentClientsManager, PublicationClientsManager } from "./client";
declare class Publication extends TypedEmitter<PublicationEvents> implements PublicationType {
    clients: {
        ipfsGateways: {
            [ipfsGatewayUrl: string]: {
                state: "stopped" | "fetching-ipfs" | "fetching-ipns";
            };
        };
        ipfsClients: {
            [ipfsClientUrl: string]: {
                state: "stopped" | "fetching-subplebbit-ipns" | "fetching-subplebbit-ipfs";
            } | {
                state: "fetching-subplebbit-ipns" | "fetching-subplebbit-ipfs" | "fetching-ipfs" | "fetching-update-ipns" | "fetching-update-ipfs" | "stopped";
            };
        };
        pubsubClients: {
            [pubsubClientUrl: string]: {
                state: "stopped" | "publishing-challenge-request" | "waiting-challenge" | "waiting-challenge-answers" | "publishing-challenge-answers" | "waiting-challenge-verification";
            };
        };
        chainProviders: {
            [chainProviderUrl: string]: {
                state: "stopped" | "resolving-subplebbit-address" | "resolving-author-address";
            };
        };
    };
    subplebbitAddress: string;
    timestamp: number;
    signature: SignatureType;
    signer: Signer;
    author: Author;
    protocolVersion: ProtocolVersion;
    state: "stopped" | "updating" | "publishing";
    publishingState: "stopped" | "resolving-subplebbit-address" | "fetching-subplebbit-ipns" | "fetching-subplebbit-ipfs" | "publishing-challenge-request" | "waiting-challenge" | "waiting-challenge-answers" | "publishing-challenge-answer" | "waiting-challenge-verification" | "failed" | "succeeded";
    protected subplebbit?: SubplebbitIpfsType;
    protected pubsubMessageSigner: Signer;
    private _challengeAnswer;
    private _challengeRequest;
    _clientsManager: PublicationClientsManager | CommentClientsManager;
    _plebbit: Plebbit;
    constructor(props: PublicationType, plebbit: Plebbit);
    _initProps(props: PublicationType): void;
    protected getType(): PublicationTypeName;
    toJSONPubsubMessagePublication(): PublicationType;
    private handleChallengeExchange;
    publishChallengeAnswers(challengeAnswers: string[]): Promise<void>;
    private _validatePublicationFields;
    private _validateSubFields;
    _updatePublishingState(newState: Publication["publishingState"]): void;
    protected _updateState(newState: Publication["state"]): void;
    private _pubsubTopicWithfallback;
    publish(): Promise<void>;
}
export default Publication;
