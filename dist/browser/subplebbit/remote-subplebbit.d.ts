/// <reference types="node" />
import { PostsPages } from "../pages.js";
import { Plebbit } from "../plebbit.js";
import { ProtocolVersion, SubplebbitEvents } from "../types.js";
import { JsonSignature } from "../signer/constants.js";
import { TypedEmitter } from "tiny-typed-emitter";
import { RetryOperation } from "retry";
import { SubplebbitClientsManager } from "../clients/client-manager.js";
import { CreateSubplebbitOptions, Flair, FlairOwner, SubplebbitEditOptions, SubplebbitEncryption, SubplebbitFeatures, SubplebbitIpfsType, SubplebbitRole, SubplebbitStats, SubplebbitSuggested, SubplebbitType } from "./types.js";
export declare class RemoteSubplebbit extends TypedEmitter<SubplebbitEvents> implements Omit<SubplebbitType, "posts"> {
    title?: string;
    description?: string;
    roles?: {
        [authorAddress: string]: SubplebbitRole;
    };
    lastPostCid?: string;
    lastCommentCid?: string;
    posts: PostsPages;
    pubsubTopic?: string;
    stats?: SubplebbitStats;
    features?: SubplebbitFeatures;
    suggested?: SubplebbitSuggested;
    flairs?: Record<FlairOwner, Flair[]>;
    address: string;
    shortAddress: string;
    statsCid?: string;
    createdAt: number;
    updatedAt: number;
    encryption: SubplebbitEncryption;
    protocolVersion: ProtocolVersion;
    signature: JsonSignature;
    rules?: string[];
    challenges: SubplebbitType["challenges"];
    postUpdates?: {
        [timestampRange: string]: string;
    };
    state: "stopped" | "updating" | "started";
    startedState: "stopped" | "publishing-ipns" | "failed" | "succeeded";
    updatingState: "stopped" | "resolving-address" | "fetching-ipns" | "fetching-ipfs" | "failed" | "succeeded";
    plebbit: Plebbit;
    clients: SubplebbitClientsManager["clients"];
    clientsManager: SubplebbitClientsManager;
    _ipnsLoadingOperation: RetryOperation;
    protected _updateTimeout?: NodeJS.Timeout;
    constructor(plebbit: Plebbit);
    initRemoteSubplebbitPropsNoMerge(newProps: SubplebbitIpfsType): Promise<void>;
    initRemoteSubplebbitPropsWithMerge(newProps: Partial<SubplebbitIpfsType | CreateSubplebbitOptions>): Promise<void>;
    setAddress(newAddress: string): void;
    toJSON(): SubplebbitType;
    protected _toJSONBase(): {
        title: string;
        description: string;
        lastPostCid: string;
        lastCommentCid: string;
        pubsubTopic: string;
        address: string;
        challenges: import("./types.js").SubplebbitChallenge[];
        statsCid: string;
        createdAt: number;
        updatedAt: number;
        encryption: SubplebbitEncryption;
        roles: {
            [authorAddress: string]: SubplebbitRole;
        };
        protocolVersion: "1.0.0";
        signature: JsonSignature;
        features: SubplebbitFeatures;
        suggested: SubplebbitSuggested;
        rules: string[];
        flairs: Record<FlairOwner, Flair[]>;
        postUpdates: {
            [timestampRange: string]: string;
        };
    };
    toJSONIpfs(): SubplebbitIpfsType;
    protected _setState(newState: RemoteSubplebbit["state"]): void;
    _setUpdatingState(newState: RemoteSubplebbit["updatingState"]): void;
    protected _setStartedState(newState: RemoteSubplebbit["startedState"]): void;
    private _isCriticalErrorWhenLoading;
    private _retryLoadingSubplebbitIpns;
    private updateOnce;
    update(): Promise<void>;
    stop(): Promise<void>;
    edit(newSubplebbitOptions: SubplebbitEditOptions): Promise<this>;
    start(): Promise<void>;
    delete(): Promise<void>;
}
