/// <reference types="node" />
import { Server as RpcWebsocketsServer } from 'rpc-websockets';
import { setPlebbitJs } from './lib/plebbit-js';
import { EventEmitter } from 'events';
import { PlebbitWsServerClassOptions, PlebbitWsServerOptions, JsonRpcSendNotificationOptions } from './types';
declare class PlebbitWsServer extends EventEmitter {
    plebbit: any;
    plebbitOptions?: {
        [key: string]: any;
    };
    rpcWebsockets: RpcWebsocketsServer;
    ws: any;
    connections: {
        [connectionId: string]: any;
    };
    subscriptionCleanups: {
        [connectionId: string]: {
            [subscriptionId: number]: () => void;
        };
    };
    publishing: {
        [subscriptionId: number]: any;
    };
    constructor({ port, plebbit, plebbitOptions }: PlebbitWsServerClassOptions);
    rpcWebsocketsRegister(method: string, callback: Function): void;
    jsonRpcSendNotification({ method, result, subscription, event, connectionId }: JsonRpcSendNotificationOptions): void;
    getComment(params: any): Promise<any>;
    getSubplebbitPage(params: any): Promise<any>;
    createSubplebbit(params: any): Promise<any>;
    startSubplebbit(params: any): Promise<boolean>;
    stopSubplebbit(params: any): Promise<boolean>;
    editSubplebbit(params: any): Promise<any>;
    deleteSubplebbit(params: any): Promise<boolean>;
    listSubplebbits(params: any): Promise<any>;
    fetchCid(params: any): Promise<any>;
    getPlebbitOptions(params: any): Promise<{
        [key: string]: any;
    }>;
    setPlebbitOptions(params: any): Promise<boolean>;
    commentUpdate(params: any, connectionId: string): Promise<number>;
    subplebbitUpdate(params: any, connectionId: string): Promise<number>;
    publishComment(params: any, connectionId: string): Promise<number>;
    publishVote(params: any, connectionId: string): Promise<number>;
    publishCommentEdit(params: any, connectionId: string): Promise<number>;
    publishChallengeAnswers(params: any): Promise<boolean>;
    unsubscribe(params: any, connectionId: string): Promise<boolean>;
}
declare const PlebbitRpc: {
    PlebbitWsServer: ({ port, plebbitOptions }: PlebbitWsServerOptions) => Promise<PlebbitWsServer>;
    setPlebbitJs: typeof setPlebbitJs;
};
export = PlebbitRpc;
