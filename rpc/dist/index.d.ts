/// <reference types="node" />
import { Server as WebSocketServer } from 'rpc-websockets';
import { setPlebbitJs } from './lib/plebbit-js';
import { EventEmitter } from 'events';
type PlebbitWsServerClassOptions = {
    port: number;
    plebbit: any;
};
declare class PlebbitWsServer extends EventEmitter {
    plebbit: any;
    wss: WebSocketServer;
    constructor({ port, plebbit }: PlebbitWsServerClassOptions);
    wssRegister(method: string, callback: Function): void;
    getComment(params: any): Promise<any>;
    getCommentUpdate(params: any): Promise<any>;
    getSubplebbitUpdate(params: any): Promise<any>;
    getSubplebbitPage(params: any): Promise<any>;
    createSubplebbit(params: any): Promise<any>;
    startSubplebbit(params: any): Promise<null>;
    stopSubplebbit(params: any): Promise<null>;
    editSubplebbit(params: any): Promise<any>;
    listSubplebbits(params: any): Promise<any>;
    publishComment(params: any): Promise<any>;
    publishVote(params: any): Promise<any>;
    publishCommentEdit(params: any): Promise<any>;
    publishChallengeAnswers(params: any): Promise<any>;
    fetchCid(params: any): Promise<any>;
}
type PlebbitWsServerOptions = {
    port: number;
    plebbitOptions?: any;
};
declare const PlebbitRpc: {
    PlebbitWsServer: ({ port, plebbitOptions }: PlebbitWsServerOptions) => Promise<PlebbitWsServer>;
    setPlebbitJs: typeof setPlebbitJs;
};
export = PlebbitRpc;
