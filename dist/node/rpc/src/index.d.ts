import { Server as RpcWebsocketsServer } from "rpc-websockets";
import { setPlebbitJs } from "./lib/plebbit-js/index.js";
import { EventEmitter } from "events";
import type { PlebbitWsServerClassOptions, JsonRpcSendNotificationOptions, CreatePlebbitWsServerOptions, PlebbitWsServerSettingsSerialized } from "./types.js";
import { Plebbit } from "../../plebbit.js";
import WebSocket from "ws";
import Publication from "../../publications/publication.js";
import { LocalSubplebbit } from "../../runtime/node/subplebbit/local-subplebbit.js";
import type { CommentIpfsType } from "../../publications/comment/types.js";
import type { RpcInternalSubplebbitRecordBeforeFirstUpdateType } from "../../subplebbit/types.js";
declare class PlebbitWsServer extends EventEmitter {
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
    private _listSubsSubscriptionIdToConnectionId;
    private _lastListedSubs?;
    private _getIpFromConnectionRequest;
    constructor({ port, server, plebbit, authKey }: PlebbitWsServerClassOptions);
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
    listSubplebbits(params: any, connectionId: string): Promise<number>;
    fetchCid(params: any): Promise<string>;
    getSettings(params: any): Promise<PlebbitWsServerSettingsSerialized>;
    setSettings(params: any): Promise<boolean>;
    commentUpdate(params: any, connectionId: string): Promise<number>;
    subplebbitUpdate(params: any, connectionId: string): Promise<number>;
    publishComment(params: any, connectionId: string): Promise<number>;
    publishVote(params: any, connectionId: string): Promise<number>;
    publishCommentEdit(params: any, connectionId: string): Promise<number>;
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
