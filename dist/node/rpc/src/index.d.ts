/// <reference types="node" />
import { Server as RpcWebsocketsServer } from "rpc-websockets";
import { setPlebbitJs } from "./lib/plebbit-js";
import { EventEmitter } from "events";
import { PlebbitWsServerClassOptions, PlebbitWsServerOptions, JsonRpcSendNotificationOptions } from "./types";
import { Plebbit } from "../../plebbit";
import { PlebbitWsServerSettingsSerialized } from "../../types";
import { WebSocket } from "ws";
import Publication from "../../publication";
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
    constructor({ port, plebbit, plebbitOptions }: PlebbitWsServerClassOptions);
    rpcWebsocketsRegister(method: string, callback: Function): void;
    jsonRpcSendNotification({ method, result, subscription, event, connectionId }: JsonRpcSendNotificationOptions): void;
    getComment(params: any): Promise<{
        author: import("../../types").AuthorIpfsType;
        challengeAnswers?: string[];
        challengeCommentCids?: string[];
        parentCid?: string;
        content?: string;
        title?: string;
        link?: string;
        linkWidth?: number;
        linkHeight?: number;
        spoiler?: boolean;
        flair?: import("../../subplebbit/types").Flair;
        subplebbitAddress: string;
        signature: import("../../signer/constants").JsonSignature;
        protocolVersion: "1.0.0";
        timestamp: number;
        postCid?: string;
        previousCid?: string;
        thumbnailUrl?: string;
        thumbnailUrlWidth?: number;
        thumbnailUrlHeight?: number;
        depth: number;
        ipnsName: string;
        cid: string;
    }>;
    getSubplebbitPage(params: any): Promise<import("../../types").PageIpfs>;
    getCommentPage(params: any): Promise<import("../../types").PageIpfs>;
    createSubplebbit(params: any): Promise<import("../../subplebbit/types").InternalSubplebbitRpcType>;
    startSubplebbit(params: any, connectionId: string): Promise<number>;
    stopSubplebbit(params: any): Promise<boolean>;
    editSubplebbit(params: any): Promise<import("../../subplebbit/types").InternalSubplebbitRpcType>;
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
    PlebbitWsServer: ({ port, plebbitOptions }: PlebbitWsServerOptions) => Promise<PlebbitWsServer>;
    setPlebbitJs: typeof setPlebbitJs;
};
export = PlebbitRpc;
