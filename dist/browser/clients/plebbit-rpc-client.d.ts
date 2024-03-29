/// <reference types="node" />
import { DecryptedChallengeRequest, PageIpfs, PlebbitWsServerSettings, PlebbitWsServerSettingsSerialized } from "../types.js";
import { Comment } from "../comment.js";
import { Plebbit } from "../plebbit.js";
import EventEmitter from "events";
import { CreateSubplebbitOptions, InternalSubplebbitRpcType, SubplebbitEditOptions } from "../subplebbit/types.js";
import { RpcLocalSubplebbit } from "../subplebbit/rpc-local-subplebbit.js";
export default class PlebbitRpcClient {
    private _webSocketClient;
    private _plebbit;
    private _subscriptionEvents;
    private _pendingSubscriptionMsgs;
    private _timeoutSeconds;
    private _openConnectionPromise;
    private _listSubsSubscriptionId?;
    private _lastListedSubs?;
    constructor(plebbit: Plebbit);
    _init(): Promise<void>;
    destroy(): Promise<void>;
    toJSON(): any;
    getSubscription(subscriptionId: number): EventEmitter;
    unsubscribe(subscriptionId: number): Promise<void>;
    emitAllPendingMessages(subscriptionId: number): void;
    getComment(commentCid: string): Promise<Comment>;
    getCommentPage(pageCid: string, commentCid: string, subplebbitAddress: string): Promise<PageIpfs>;
    getSubplebbitPage(pageCid: string, subplebbitAddress: string): Promise<PageIpfs>;
    createSubplebbit(createSubplebbitOptions: CreateSubplebbitOptions): Promise<RpcLocalSubplebbit>;
    private _initSubscriptionEvent;
    startSubplebbit(subplebbitAddress: string): Promise<number>;
    stopSubplebbit(subplebbitAddress: string): Promise<void>;
    editSubplebbit(subplebbitAddress: string, subplebbitEditOptions: SubplebbitEditOptions): Promise<InternalSubplebbitRpcType>;
    deleteSubplebbit(subplebbitAddress: string): Promise<void>;
    subplebbitUpdate(subplebbitAddress: string): Promise<number>;
    publishComment(commentProps: DecryptedChallengeRequest): Promise<number>;
    publishCommentEdit(commentEditProps: DecryptedChallengeRequest): Promise<number>;
    publishVote(voteProps: DecryptedChallengeRequest): Promise<number>;
    commentUpdate(commentCid: string): Promise<number>;
    publishChallengeAnswers(subscriptionId: number, challengeAnswers: string[]): Promise<boolean>;
    resolveAuthorAddress(authorAddress: string): Promise<string>;
    listSubplebbits(): Promise<string[]>;
    fetchCid(cid: string): Promise<string>;
    setSettings(settings: PlebbitWsServerSettings): Promise<boolean>;
    getSettings(): Promise<PlebbitWsServerSettingsSerialized>;
    rpcCall(method: string, params: any[]): Promise<any>;
    getDefaults(): Promise<void>;
    getPeers(): Promise<void>;
    getStats(): Promise<void>;
}
