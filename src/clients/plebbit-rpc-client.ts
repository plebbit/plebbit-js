import Logger from "@plebbit/plebbit-logger";
import {
    ChallengeAnswerMessageType,
    CommentIpfsType,
    CreateCommentEditOptions,
    CreateCommentOptions,
    CreateSubplebbitOptions,
    CreateVoteOptions,
    PageIpfs,
    PageType,
    PlebbitOptions,
    SubplebbitEditOptions,
    SubplebbitType
} from "../types";
import { Client as WebSocketClient } from "rpc-websockets";
import { Comment } from "../comment";
import { Plebbit } from "../plebbit";
import assert from "assert";
import { Subplebbit } from "../subplebbit";
import { PlebbitError } from "../plebbit-error";
import EventEmitter from "events";
import { ChallengeAnswerMessage } from "../challenge";
import { parsePubsubMsgFromRpc } from "../util";

export default class PlebbitRpcClient {
    private _webSocketClient: WebSocketClient;
    private _plebbit: Plebbit;
    private _subscriptionEvents: Record<string, EventEmitter> = {}; // subscription ID -> event emitter
    private _pendingSubscriptionMsgs: Record<string, any[]> = {};
    constructor(plebbit: Plebbit) {
        assert(plebbit.plebbitRpcClientsOptions);
        this._plebbit = plebbit;
        this._webSocketClient = new WebSocketClient(plebbit.plebbitRpcClientsOptions[0]);
    }

    async init() {
        const log = Logger("plebbit-js:PlebbitRpcClient");
        // wait for websocket connection to open
        await new Promise((resolve) => this._webSocketClient.on("open", resolve));
        // save all subscription messages (ie json rpc messages without 'id', also called json rpc 'notifications')
        // NOTE: it is possible to receive a subscription message before receiving the subscription id
        //@ts-expect-error
        this._webSocketClient.socket.on("message", (jsonMessage) => {
            const message = JSON.parse(jsonMessage);
            const subscriptionId = message?.params?.subscription;
            if (subscriptionId) {
                if (!this._subscriptionEvents[subscriptionId]) this._subscriptionEvents[subscriptionId] = new EventEmitter();

                // We need to parse error props into PlebbitErrors
                if (message?.params?.event === "error") {
                    message.params.result = new PlebbitError(message.params.result.code, message.params.result.details);
                    delete message.params.result.stack; // Need to delete locally generated PlebbitError stack
                }
                if (this._subscriptionEvents[subscriptionId].listenerCount(message?.params?.event) === 0) {
                    if (!this._pendingSubscriptionMsgs[subscriptionId]) this._pendingSubscriptionMsgs[subscriptionId] = [];
                    else this._pendingSubscriptionMsgs[subscriptionId].push(message);
                } else this._subscriptionEvents[subscriptionId].emit(message?.params?.event, message);
            }
        });

        // debug raw JSON RPC messages in console (optional)
        //@ts-expect-error
        this._webSocketClient.socket.on("message", (message) => log.trace("from RPC server:", message.toString()));

        // forward errors to Plebbit
        this._webSocketClient.on("error", (error) => {
            this._plebbit.emit("error", error);
        });

        // Process error JSON from server into a PlebbitError instance
        const originalWebsocketCall = this._webSocketClient.call.bind(this._webSocketClient);
        this._webSocketClient.call = (...args) => {
            try {
                return originalWebsocketCall(...args);
            } catch (e) {
                //e is an error json representation of PlebbitError
                throw new PlebbitError(e?.code, e?.details);
            }
        };
    }

    getSubscription(subscriptionId: number) {
        if (!this._subscriptionEvents[subscriptionId]) throw Error(`No subscription to RPC with id (${subscriptionId})`);
        else return this._subscriptionEvents[subscriptionId];
    }

    async unsubscribe(subscriptionId: number) {
        await this._webSocketClient.call("unsubscribe", [subscriptionId]);
        if (this._subscriptionEvents[subscriptionId]) this._subscriptionEvents[subscriptionId].removeAllListeners();
        delete this._subscriptionEvents[subscriptionId];
        delete this._pendingSubscriptionMsgs[subscriptionId];
    }

    emitAllPendingMessages(subscriptionId: number) {
        this._pendingSubscriptionMsgs[subscriptionId].forEach((message) =>
            this._subscriptionEvents[subscriptionId].emit(message?.params?.event, message)
        );
        delete this._pendingSubscriptionMsgs[subscriptionId];
    }

    async getComment(commentCid: string): Promise<Comment> {
        const commentProps = <CommentIpfsType>await this._webSocketClient.call("getComment", [commentCid]);
        return this._plebbit.createComment(commentProps);
    }

    async getCommentPage(pageCid: string, commentCid: string, subplebbitAddress: string): Promise<PageIpfs> {
        const pageIpfs = <PageIpfs>await this._webSocketClient.call("getCommentPage", [pageCid, commentCid, subplebbitAddress]);
        return pageIpfs;
    }

    async getSubplebbitPage(pageCid: string, subplebbitAddress: string): Promise<PageIpfs> {
        const pageIpfs = <PageIpfs>await this._webSocketClient.call("getSubplebbitPage", [pageCid, subplebbitAddress]);
        return pageIpfs;
    }

    async createSubplebbit(createSubplebbitOptions: CreateSubplebbitOptions): Promise<Subplebbit> {
        const subProps = <SubplebbitType>await this._webSocketClient.call("createSubplebbit", [createSubplebbitOptions]);
        const subplebbit = new Subplebbit(this._plebbit); // We're not using plebbit.createSubplebbit because it might try to create a local sub, we need to make sure this sub can't do any native functions
        await subplebbit.initSubplebbit(subProps);
        return subplebbit;
    }

    async startSubplebbit(subplebbitAddress: string): Promise<void> {
        await this._webSocketClient.call("startSubplebbit", [subplebbitAddress]);
    }

    async stopSubplebbit(subplebbitAddress: string): Promise<void> {
        await this._webSocketClient.call("stopSubplebbit", [subplebbitAddress]);
    }

    async editSubplebbit(subplebbitAddress: string, subplebbitEditOptions: SubplebbitEditOptions) {
        await this._webSocketClient.call("editSubplebbit", [subplebbitAddress, subplebbitEditOptions]);
    }

    async deleteSubplebbit(subplebbitAddress: string) {
        await this._webSocketClient.call("deleteSubplebbit", [subplebbitAddress]);
    }

    async subplebbitUpdate(subplebbitAddress: string): Promise<number> {
        const subscriptionId = <number>await this._webSocketClient.call("subplebbitUpdate", [subplebbitAddress]);
        return subscriptionId;
    }

    async publishComment(commentProps: CreateCommentOptions) {
        const subscriptionId = <number>await this._webSocketClient.call("publishComment", [commentProps]);
        return subscriptionId;
    }

    async publishCommentEdit(commentEditProps: CreateCommentEditOptions) {
        const subscriptionId = <number>await this._webSocketClient.call("publishCommentEdit", [commentEditProps]);
        return subscriptionId;
    }

    async publishVote(voteProps: CreateVoteOptions) {
        const subscriptionId = <number>await this._webSocketClient.call("publishVote", [voteProps]);
        return subscriptionId;
    }

    async commentUpdate(commentCid: string, ipnsName?: string) {
        assert(commentCid, "Need to have comment cid in order to call RPC commentUpdate");
        const subscriptionId = <number>await this._webSocketClient.call("commentUpdate", [commentCid, ipnsName]);
        return subscriptionId;
    }

    async publishChallengeAnswers(subscriptionId: number, challengeAnswers: string[]) {
        const rawChallengeAnswer = await this._webSocketClient.call("publishChallengeAnswers", [subscriptionId, challengeAnswers]);
        const challengeAnswerMessage = <ChallengeAnswerMessageType>parsePubsubMsgFromRpc(rawChallengeAnswer);
        // Need to parse challengeRequestId, encryptedChallengeAnswers, encryptedPublication, encryptedChallenges
        return new ChallengeAnswerMessage(challengeAnswerMessage);
    }

    async listSubplebbits(): Promise<string[]> {
        const subs = <string[]>await this._webSocketClient.call("listSubplebbits", []);
        return subs;
    }

    async getDefaults() {
        throw Error("Not implemented");
    }

    async fetchCid(cid: string): Promise<string> {
        const res = <string>await this._webSocketClient.call("fetchCid", [cid]);
        return res;
    }

    async getPeers() {
        throw Error("Not implemented");
    }

    async getStats() {
        throw Error("Not implemented");
    }
}