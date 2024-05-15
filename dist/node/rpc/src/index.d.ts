/// <reference types="node" />
import { Server as RpcWebsocketsServer } from "rpc-websockets";
import { setPlebbitJs } from "./lib/plebbit-js/index.js";
import { EventEmitter } from "events";
import { PlebbitWsServerClassOptions, PlebbitWsServerOptions, JsonRpcSendNotificationOptions } from "./types.js";
import { Plebbit } from "../../plebbit.js";
import { CommentIpfsWithCid, PlebbitWsServerSettingsSerialized } from "../../types.js";
import WebSocket from "ws";
import Publication from "../../publications/publication.js";
import { LocalSubplebbit } from "../../runtime/node/subplebbit/local-subplebbit.js";
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
    getComment(params: any): Promise<CommentIpfsWithCid>;
    getSubplebbitPage(params: any): Promise<import("../../types.js").PageIpfs>;
    getCommentPage(params: any): Promise<import("../../types.js").PageIpfs>;
    createSubplebbit(params: any): Promise<import("../../subplebbit/types.js").InternalSubplebbitRpcType>;
    _setupStartedEvents(subplebbit: LocalSubplebbit, connectionId: string, subscriptionId: number): void;
    startSubplebbit(params: any, connectionId: string): Promise<number>;
    stopSubplebbit(params: any): Promise<boolean>;
    private _postStoppingOrDeleting;
    editSubplebbit(params: any): Promise<import("../../subplebbit/types.js").InternalSubplebbitRpcType>;
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
    PlebbitWsServer: ({ port, server, plebbitOptions, authKey }: PlebbitWsServerOptions) => Promise<PlebbitWsServer>;
    setPlebbitJs: typeof setPlebbitJs;
};
export default PlebbitRpc;
