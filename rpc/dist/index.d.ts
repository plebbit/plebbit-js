/// <reference types="node" />
import { Server as RpcWebsocketsServer } from 'rpc-websockets';
import { setPlebbitJs } from './lib/plebbit-js';
import { EventEmitter } from 'events';
import { PlebbitWsServerClassOptions, PlebbitWsServerOptions, JsonRpcSendNotificationOptions } from './types';
import { Plebbit } from '../../dist/node/plebbit';
import { PlebbitOptions } from '../../dist/node/types';
import { WebSocket } from 'ws';
import Publication from '../../dist/node/publication';
declare class PlebbitWsServer extends EventEmitter {
    plebbit: Plebbit;
    plebbitOptions?: PlebbitOptions;
    rpcWebsockets: RpcWebsocketsServer;
    ws: RpcWebsocketsServer['wss'];
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
    constructor({ port, plebbit, plebbitOptions }: PlebbitWsServerClassOptions);
    rpcWebsocketsRegister(method: string, callback: Function): void;
    jsonRpcSendNotification({ method, result, subscription, event, connectionId }: JsonRpcSendNotificationOptions): void;
    getComment(params: any): Promise<any>;
    getSubplebbitPage(params: any): Promise<import("../../dist/node/types").PageIpfs>;
    getCommentPage(params: any): Promise<import("../../dist/node/types").PageIpfs>;
    createSubplebbit(params: any): Promise<import("../../dist/node/subplebbit/types").InternalSubplebbitRpcType>;
    startSubplebbit(params: any, connectionId: string): Promise<number>;
    stopSubplebbit(params: any): Promise<boolean>;
    editSubplebbit(params: any): Promise<import("../../dist/node/subplebbit/types").InternalSubplebbitRpcType>;
    deleteSubplebbit(params: any): Promise<boolean>;
    listSubplebbits(params: any): Promise<any>;
    fetchCid(params: any): Promise<string>;
    getPlebbitOptions(params: any): Promise<PlebbitOptions>;
    setPlebbitOptions(params: any): Promise<boolean>;
    commentUpdate(params: any, connectionId: string): Promise<number>;
    subplebbitUpdate(params: any, connectionId: string): Promise<number>;
    publishComment(params: any, connectionId: string): Promise<number>;
    publishVote(params: any, connectionId: string): Promise<number>;
    publishCommentEdit(params: any, connectionId: string): Promise<number>;
    publishChallengeAnswers(params: any): Promise<boolean>;
    resolveAuthorAddress(params: any): Promise<string>;
    unsubscribe(params: any, connectionId: string): Promise<boolean>;
}
declare const PlebbitRpc: {
    PlebbitWsServer: ({ port, plebbitOptions }: PlebbitWsServerOptions) => Promise<PlebbitWsServer>;
    setPlebbitJs: typeof setPlebbitJs;
};
export = PlebbitRpc;
