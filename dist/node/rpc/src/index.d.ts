import { Server as RpcWebsocketsServer } from "rpc-websockets";
import { setPlebbitJs } from "./lib/plebbit-js/index.js";
import type { PlebbitWsServerClassOptions, JsonRpcSendNotificationOptions, CreatePlebbitWsServerOptions, PlebbitRpcServerEvents } from "./types.js";
import { Plebbit } from "../../plebbit/plebbit.js";
import WebSocket from "ws";
import Publication from "../../publications/publication.js";
import { LocalSubplebbit } from "../../runtime/node/subplebbit/local-subplebbit.js";
import type { CommentIpfsType } from "../../publications/comment/types.js";
import type { RpcInternalSubplebbitRecordBeforeFirstUpdateType } from "../../subplebbit/types.js";
import { RpcPublishResult } from "../../publications/types.js";
import { TypedEmitter } from "tiny-typed-emitter";
declare class PlebbitWsServer extends TypedEmitter<PlebbitRpcServerEvents> {
    plebbit: Plebbit;
    rpcWebsockets: RpcWebsocketsServer;
    ws: RpcWebsocketsServer["wss"];
    connections: {
        [connectionId: string]: WebSocket;
    };
    subscriptionCleanups: {
        [connectionId: string]: {
            [subscriptionId: number]: () => void;
        };
    };
    publishing: {
        [subscriptionId: number]: Publication;
    };
    authKey: string | undefined;
    private _getIpFromConnectionRequest;
    private _onSettingsChange;
    constructor({ port, server, plebbit, authKey }: PlebbitWsServerClassOptions);
    private _emitError;
    rpcWebsocketsRegister(method: string, callback: Function): void;
    jsonRpcSendNotification({ method, result, subscription, event, connectionId }: JsonRpcSendNotificationOptions): void;
    getComment(params: any): Promise<CommentIpfsType>;
    getSubplebbitPage(params: any): Promise<import("../../pages/types.js").PageIpfsManuallyDefined>;
    getCommentPage(params: any): Promise<import("../../pages/types.js").PageIpfsManuallyDefined>;
    createSubplebbit(params: any): Promise<RpcInternalSubplebbitRecordBeforeFirstUpdateType>;
    _setupStartedEvents(subplebbit: LocalSubplebbit, connectionId: string, subscriptionId: number): void;
    startSubplebbit(params: any, connectionId: string): Promise<number>;
    stopSubplebbit(params: any): Promise<boolean>;
    private _postStoppingOrDeleting;
    editSubplebbit(params: any): Promise<RpcInternalSubplebbitRecordBeforeFirstUpdateType>;
    deleteSubplebbit(params: any): Promise<boolean>;
    subplebbitsSubscribe(params: any, connectionId: string): Promise<number>;
    fetchCid(params: any): Promise<string>;
    private _getCurrentSettings;
    settingsSubscribe(params: any, connectionId: string): Promise<number>;
    private _initPlebbit;
    private _createPlebbitInstanceFromSetSettings;
    setSettings(params: any): Promise<boolean>;
    commentUpdateSubscribe(params: any, connectionId: string): Promise<number>;
    subplebbitUpdateSubscribe(params: any, connectionId: string): Promise<number>;
    private _createCommentInstanceFromPublishCommentParams;
    publishComment(params: any, connectionId: string): Promise<RpcPublishResult>;
    private _createVoteInstanceFromPublishVoteParams;
    publishVote(params: any, connectionId: string): Promise<RpcPublishResult>;
    private _createSubplebbitEditInstanceFromPublishSubplebbitEditParams;
    publishSubplebbitEdit(params: any, connectionId: string): Promise<RpcPublishResult>;
    private _createCommentEditInstanceFromPublishCommentEditParams;
    publishCommentEdit(params: any, connectionId: string): Promise<RpcPublishResult>;
    private _createCommentModerationInstanceFromPublishCommentModerationParams;
    publishCommentModeration(params: any, connectionId: string): Promise<RpcPublishResult>;
    publishChallengeAnswers(params: any): Promise<boolean>;
    resolveAuthorAddress(params: any): Promise<string | null>;
    unsubscribe(params: any, connectionId: string): Promise<boolean>;
    destroy(): Promise<void>;
}
declare const PlebbitRpc: {
    PlebbitWsServer: (options: CreatePlebbitWsServerOptions) => Promise<PlebbitWsServer>;
    setPlebbitJs: typeof setPlebbitJs;
};
export default PlebbitRpc;
