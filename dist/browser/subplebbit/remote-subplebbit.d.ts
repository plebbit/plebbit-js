/// <reference types="node" />
import { PostsPages } from "../pages.js";
import { Plebbit } from "../plebbit.js";
import { PostsPagesTypeIpfs, ProtocolVersion, SubplebbitEvents } from "../types.js";
import { JsonSignature } from "../signer/constants.js";
import { TypedEmitter } from "tiny-typed-emitter";
import { RetryOperation } from "retry";
import { SubplebbitClientsManager } from "../clients/client-manager.js";
import type { CreateRemoteSubplebbitOptions, Flair, FlairOwner, RemoteSubplebbitJsonType, SubplebbitEditOptions, SubplebbitEncryption, SubplebbitFeatures, SubplebbitIpfsType, SubplebbitRole, SubplebbitStats, SubplebbitSuggested } from "./types.js";
import { LocalSubplebbit } from "../runtime/browser/subplebbit/local-subplebbit.js";
export declare class RemoteSubplebbit extends TypedEmitter<SubplebbitEvents> {
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
    statsCid: string;
    createdAt: number;
    updatedAt: number;
    encryption: SubplebbitEncryption;
    protocolVersion: ProtocolVersion;
    signature: JsonSignature;
    rules?: string[];
    challenges: SubplebbitIpfsType["challenges"];
    postUpdates?: {
        [timestampRange: string]: string;
    };
    state: "stopped" | "updating" | "started";
    updatingState: "stopped" | "resolving-address" | "fetching-ipns" | "fetching-ipfs" | "failed" | "succeeded" | LocalSubplebbit["startedState"];
    plebbit: Plebbit;
    clients: SubplebbitClientsManager["clients"];
    clientsManager: SubplebbitClientsManager;
    _ipnsLoadingOperation?: RetryOperation;
    protected _updateTimeout?: NodeJS.Timeout;
    constructor(plebbit: Plebbit);
    _updateLocalPostsInstance(newPosts: SubplebbitIpfsType["posts"] | RemoteSubplebbitJsonType["posts"] | Pick<PostsPagesTypeIpfs, "pageCids">): Promise<void>;
    initRemoteSubplebbitPropsNoMerge(newProps: SubplebbitIpfsType | RemoteSubplebbitJsonType | CreateRemoteSubplebbitOptions): Promise<void>;
    setAddress(newAddress: string): void;
    toJSON(): RemoteSubplebbitJsonType;
    protected _toJSONBase(): {
        title: string | undefined;
        description: string | undefined;
        lastPostCid: string | undefined;
        lastCommentCid: string | undefined;
        pubsubTopic: string | undefined;
        address: string;
        challenges: import("./types.js").SubplebbitChallenge[];
        statsCid: string;
        createdAt: number;
        updatedAt: number;
        encryption: SubplebbitEncryption;
        roles: {
            [authorAddress: string]: SubplebbitRole;
        } | undefined;
        protocolVersion: "1.0.0";
        signature: JsonSignature;
        features: SubplebbitFeatures | undefined;
        suggested: SubplebbitSuggested | undefined;
        rules: string[] | undefined;
        flairs: Record<FlairOwner, Flair[]> | undefined;
        postUpdates: {
            [timestampRange: string]: string;
        } | undefined;
    };
    toJSONIpfs(): SubplebbitIpfsType;
    protected _setState(newState: RemoteSubplebbit["state"]): void;
    _setUpdatingState(newState: RemoteSubplebbit["updatingState"]): void;
    private _isCriticalErrorWhenLoading;
    private _retryLoadingSubplebbitIpns;
    private updateOnce;
    update(): Promise<void>;
    stop(): Promise<void>;
    edit(newSubplebbitOptions: SubplebbitEditOptions): Promise<this>;
    start(): Promise<void>;
    delete(): Promise<void>;
}
