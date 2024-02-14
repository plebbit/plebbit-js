import Logger from "@plebbit/plebbit-logger";
import { Client as WebSocketClient } from "rpc-websockets";
import assert from "assert";
import { PlebbitError } from "../plebbit-error.js";
import EventEmitter from "events";
import pTimeout from "p-timeout";
import { throwWithErrorCode } from "../util.js";
import { RpcLocalSubplebbit } from "../subplebbit/rpc-local-subplebbit.js";
const log = Logger("plebbit-js:PlebbitRpcClient");
export default class PlebbitRpcClient {
    constructor(plebbit) {
        this._subscriptionEvents = {}; // subscription ID -> event emitter
        this._pendingSubscriptionMsgs = {};
        assert(plebbit.plebbitRpcClientsOptions);
        this._plebbit = plebbit;
        this._timeoutSeconds = 20;
        // temporary place holder because we don't want to initialize the web socket client until we call
        //@ts-expect-error
        this._webSocketClient = {
            call: async (...args) => {
                await this._init();
                return this._webSocketClient.call(...args);
            }
        };
    }
    async _init() {
        const log = Logger("plebbit-js:plebbit-rpc-client:_init");
        // wait for websocket connection to open
        if (!(this._webSocketClient instanceof WebSocketClient)) {
            // Set up events here
            // save all subscription messages (ie json rpc messages without 'id', also called json rpc 'notifications')
            // NOTE: it is possible to receive a subscription message before receiving the subscription id
            this._webSocketClient = new WebSocketClient(this._plebbit.plebbitRpcClientsOptions[0]);
            log("Created a new WebSocket instance with url " + this._plebbit.plebbitRpcClientsOptions[0]);
            //@ts-expect-error
            this._webSocketClient.socket.on("message", (jsonMessage) => {
                const message = JSON.parse(jsonMessage);
                const subscriptionId = message?.params?.subscription;
                if (subscriptionId) {
                    this._initSubscriptionEvent(subscriptionId);
                    // We need to parse error props into PlebbitErrors
                    if (message?.params?.event === "error") {
                        message.params.result = new PlebbitError(message.params.result.code, message.params.result.details);
                        delete message.params.result.stack; // Need to delete locally generated PlebbitError stack
                    }
                    if (this._subscriptionEvents[subscriptionId].listenerCount(message?.params?.event) === 0)
                        this._pendingSubscriptionMsgs[subscriptionId].push(message);
                    else
                        this._subscriptionEvents[subscriptionId].emit(message?.params?.event, message);
                }
            });
            // debug raw JSON RPC messages in console (optional)
            //@ts-expect-error
            this._webSocketClient.socket.on("message", (message) => log.trace("from RPC server:", message.toString()));
            // forward errors to Plebbit
            this._webSocketClient.on("error", (error) => {
                this._plebbit.emit("error", error);
            });
            this._webSocketClient.on("close", () => {
                log.error("connection with web socket has been closed");
                this._openConnectionPromise = undefined;
            });
            // Process error JSON from server into a PlebbitError instance
            const originalWebsocketCall = this._webSocketClient.call.bind(this._webSocketClient);
            this._webSocketClient.call = async (...args) => {
                try {
                    await this._init();
                    return await originalWebsocketCall(...args);
                }
                catch (e) {
                    //e is an error json representation of PlebbitError
                    if (Object.keys(e).length === 0)
                        throw Error("RPC server sent an empty error for call " + args[0]);
                    if (e?.code)
                        throw new PlebbitError(e?.code, e?.details);
                    else
                        throw new Error(e.message);
                }
            };
        }
        // @ts-expect-error
        if (this._webSocketClient.ready)
            return;
        if (!this._openConnectionPromise)
            this._openConnectionPromise = pTimeout(new Promise(async (resolve) => this._webSocketClient.once("open", resolve)), {
                milliseconds: this._timeoutSeconds * 1000
            });
        try {
            await this._openConnectionPromise;
        }
        catch (e) {
            throwWithErrorCode("ERR_FAILED_TO_OPEN_CONNECTION_TO_RPC", {
                plebbitRpcUrl: this._plebbit.plebbitRpcClientsOptions[0],
                timeoutSeconds: this._timeoutSeconds,
                error: e
            });
        }
    }
    async destroy() {
        this._webSocketClient.close();
        this._webSocketClient = undefined;
        this._subscriptionEvents = undefined;
        this._pendingSubscriptionMsgs = undefined;
    }
    toJSON() {
        return undefined;
    }
    getSubscription(subscriptionId) {
        if (!this._subscriptionEvents[subscriptionId])
            throw Error(`No subscription to RPC with id (${subscriptionId})`);
        else
            return this._subscriptionEvents[subscriptionId];
    }
    async unsubscribe(subscriptionId) {
        await this._webSocketClient.call("unsubscribe", [subscriptionId]);
        if (this._subscriptionEvents[subscriptionId])
            this._subscriptionEvents[subscriptionId].removeAllListeners();
        delete this._subscriptionEvents[subscriptionId];
        delete this._pendingSubscriptionMsgs[subscriptionId];
    }
    emitAllPendingMessages(subscriptionId) {
        this._pendingSubscriptionMsgs[subscriptionId].forEach((message) => this._subscriptionEvents[subscriptionId].emit(message?.params?.event, message));
        delete this._pendingSubscriptionMsgs[subscriptionId];
    }
    async getComment(commentCid) {
        const commentProps = await this._webSocketClient.call("getComment", [commentCid]);
        return this._plebbit.createComment(commentProps);
    }
    async getCommentPage(pageCid, commentCid, subplebbitAddress) {
        const pageIpfs = await this._webSocketClient.call("getCommentPage", [pageCid, commentCid, subplebbitAddress]);
        return pageIpfs;
    }
    async getSubplebbitPage(pageCid, subplebbitAddress) {
        const pageIpfs = await this._webSocketClient.call("getSubplebbitPage", [pageCid, subplebbitAddress]);
        return pageIpfs;
    }
    async createSubplebbit(createSubplebbitOptions) {
        // This is gonna create a new local sub. Not an instance of an existing sub
        const subProps = await this._webSocketClient.call("createSubplebbit", [createSubplebbitOptions]);
        const subplebbit = new RpcLocalSubplebbit(this._plebbit); // We're not using plebbit.createSubplebbit because it might try to create a local sub, we need to make sure this sub can't do any native functions
        await subplebbit.initRpcInternalSubplebbit(subProps);
        return subplebbit;
    }
    _initSubscriptionEvent(subscriptionId) {
        if (!this._subscriptionEvents[subscriptionId])
            this._subscriptionEvents[subscriptionId] = new EventEmitter();
        if (!this._pendingSubscriptionMsgs[subscriptionId])
            this._pendingSubscriptionMsgs[subscriptionId] = [];
    }
    async startSubplebbit(subplebbitAddress) {
        const subscriptionId = await this._webSocketClient.call("startSubplebbit", [subplebbitAddress]);
        this._initSubscriptionEvent(subscriptionId);
        return subscriptionId;
    }
    async stopSubplebbit(subplebbitAddress) {
        await this._webSocketClient.call("stopSubplebbit", [subplebbitAddress]);
    }
    async editSubplebbit(subplebbitAddress, subplebbitEditOptions) {
        const editedSub = (await this._webSocketClient.call("editSubplebbit", [subplebbitAddress, subplebbitEditOptions]));
        return editedSub;
    }
    async deleteSubplebbit(subplebbitAddress) {
        await this._webSocketClient.call("deleteSubplebbit", [subplebbitAddress]);
    }
    async subplebbitUpdate(subplebbitAddress) {
        const subscriptionId = await this._webSocketClient.call("subplebbitUpdate", [subplebbitAddress]);
        this._initSubscriptionEvent(subscriptionId);
        return subscriptionId;
    }
    async publishComment(commentProps) {
        const subscriptionId = await this._webSocketClient.call("publishComment", [commentProps]);
        return subscriptionId;
    }
    async publishCommentEdit(commentEditProps) {
        const subscriptionId = await this._webSocketClient.call("publishCommentEdit", [commentEditProps]);
        return subscriptionId;
    }
    async publishVote(voteProps) {
        const subscriptionId = await this._webSocketClient.call("publishVote", [voteProps]);
        return subscriptionId;
    }
    async commentUpdate(commentCid) {
        assert(commentCid, "Need to have comment cid in order to call RPC commentUpdate");
        const subscriptionId = await this._webSocketClient.call("commentUpdate", [commentCid]);
        this._initSubscriptionEvent(subscriptionId);
        return subscriptionId;
    }
    async publishChallengeAnswers(subscriptionId, challengeAnswers) {
        const res = await this._webSocketClient.call("publishChallengeAnswers", [subscriptionId, challengeAnswers]);
        return res;
    }
    async resolveAuthorAddress(authorAddress) {
        const res = await this._webSocketClient.call("resolveAuthorAddress", [authorAddress]);
        return res;
    }
    async listSubplebbits() {
        const subs = await this._webSocketClient.call("listSubplebbits", []);
        return subs;
    }
    async fetchCid(cid) {
        const res = await this._webSocketClient.call("fetchCid", [cid]);
        return res;
    }
    async setSettings(settings) {
        const res = await this._webSocketClient.call("setSettings", [settings]);
        return res;
    }
    async getSettings() {
        const res = await this._webSocketClient.call("getSettings", []);
        return res;
    }
    async getDefaults() {
        throw Error("Not implemented");
    }
    async getPeers() {
        throw Error("Not implemented");
    }
    async getStats() {
        throw Error("Not implemented");
    }
}
//# sourceMappingURL=plebbit-rpc-client.js.map