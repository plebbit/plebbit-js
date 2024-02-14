/// <reference types="node" />
import { Server as RpcWebsocketsServer } from "rpc-websockets";
import { setPlebbitJs } from "./lib/plebbit-js/index.js";
import { EventEmitter } from "events";
import { PlebbitWsServerClassOptions, PlebbitWsServerOptions, JsonRpcSendNotificationOptions } from "./types.js";
import { Plebbit } from "../../plebbit.js";
import { PlebbitWsServerSettingsSerialized } from "../../types.js";
import WebSocket from "ws";
import Publication from "../../publication.js";
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
    constructor({ port, plebbit, plebbitOptions, authKey }: PlebbitWsServerClassOptions);
    rpcWebsocketsRegister(method: string, callback: Function): void;
    jsonRpcSendNotification({ method, result, subscription, event, connectionId }: JsonRpcSendNotificationOptions): void;
    getComment(params: any): Promise<{
        author: import("../../types.js").AuthorIpfsType;
        challengeCommentCids?: string[];
        challengeAnswers?: string[];
        parentCid?: string;
        content?: string;
        title?: string;
        link?: string;
        linkWidth?: number;
        linkHeight?: number;
        spoiler?: boolean;
        flair?: import("../../subplebbit/types.js").Flair;
        subplebbitAddress: string;
        signature: import("../../signer/constants.js").JsonSignature;
        protocolVersion: "1.0.0";
        timestamp: number;
        postCid?: string;
        previousCid?: string;
        thumbnailUrl?: string;
        thumbnailUrlWidth?: number;
        thumbnailUrlHeight?: number;
        depth: number;
        cid: string;
    }>;
    getSubplebbitPage(params: any): Promise<import("../../types.js").PageIpfs>;
    getCommentPage(params: any): Promise<import("../../types.js").PageIpfs>;
    createSubplebbit(params: any): Promise<import("../../subplebbit/types.js").InternalSubplebbitRpcType>;
    startSubplebbit(params: any, connectionId: string): Promise<number>;
    stopSubplebbit(params: any): Promise<boolean>;
    editSubplebbit(params: any): Promise<import("../../subplebbit/types.js").InternalSubplebbitRpcType>;
    deleteSubplebbit(params: any): Promise<boolean>;
    listSubplebbits(params: any): Promise<any>;
    fetchCid(params: any): Promise<string>;
    getSettings(params: any): Promise<PlebbitWsServerSettingsSerialized>;
    setSettings(params: any): Promise<boolean>;
    commentUpdate(params: any, connectionId: string): Promise<number>;
    subplebbitUpdate(params: any, connectionId: string): Promise<number>;
    publishComment(params: any, connectionId: string): Promise<number>;
    publishVote(params: any, connectionId: string): Promise<number>;
    publishCommentEdit(params: any, connectionId: string): Promise<number>;
    publishChallengeAnswers(params: any): Promise<boolean>;
    resolveAuthorAddress(params: any): Promise<string>;
    unsubscribe(params: any, connectionId: string): Promise<boolean>;
    destroy(): Promise<void>;
}
declare const PlebbitRpc: {
    PlebbitWsServer: ({ port, plebbitOptions, authKey }: PlebbitWsServerOptions) => Promise<PlebbitWsServer>;
    setPlebbitJs: typeof setPlebbitJs;
};
export default PlebbitRpc;
