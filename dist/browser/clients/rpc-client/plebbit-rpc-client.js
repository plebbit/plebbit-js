import Logger from "@plebbit/plebbit-logger";
import { Client as WebSocketClient } from "rpc-websockets";
import assert from "assert";
import { PlebbitError } from "../../plebbit-error.js";
import EventEmitter from "events";
import pTimeout from "p-timeout";
import { hideClassPrivateProps, replaceXWithY, throwWithErrorCode } from "../../util.js";
import { RpcLocalSubplebbit } from "../../subplebbit/rpc-local-subplebbit.js";
import { CommentChallengeRequestToEncryptSchema } from "../../publications/comment/schema.js";
import { PageIpfsSchema } from "../../pages/schema.js";
import { CreateNewLocalSubplebbitUserOptionsSchema, ListOfSubplebbitsSchema, SubplebbitEditOptionsSchema } from "../../subplebbit/schema.js";
import { SubscriptionIdSchema } from "./schema.js";
import { AuthorAddressSchema, SubplebbitAddressSchema } from "../../schema/schema.js";
import { DecryptedChallengeAnswerSchema } from "../../pubsub-messages/schema.js";
import { CommentEditChallengeRequestToEncryptSchema } from "../../publications/comment-edit/schema.js";
import { VoteChallengeRequestToEncryptSchema } from "../../publications/vote/schema.js";
import { PlebbitWsServerSettingsSerializedSchema, SetNewSettingsPlebbitWsServerSchema } from "../../rpc/src/schema.js";
import { parseCidStringSchemaWithPlebbitErrorIfItFails, parseCommentIpfsSchemaWithPlebbitErrorIfItFails } from "../../schema/schema-util.js";
const log = Logger("plebbit-js:PlebbitRpcClient");
export default class PlebbitRpcClient {
    constructor(plebbit) {
        this._subscriptionEvents = {}; // subscription ID -> event emitter
        this._pendingSubscriptionMsgs = {};
        assert(plebbit.plebbitRpcClientsOptions, "plebbit.plebbitRpcClientsOptions needs to be defined to create a new rpc client");
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
        hideClassPrivateProps(this);
    }
    async _init() {
        const log = Logger("plebbit-js:plebbit-rpc-client:_init");
        // wait for websocket connection to open
        let lastWebsocketError;
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
                        // zod here
                        message.params.result = new PlebbitError(message.params.result.code, message.params.result.details);
                        delete message.params.result.stack; // Need to delete locally generated PlebbitError stack
                    }
                    if (this._subscriptionEvents[subscriptionId].listenerCount(message?.params?.event) === 0)
                        this._pendingSubscriptionMsgs[subscriptionId].push(message);
                    else
                        this._subscriptionEvents[subscriptionId].emit(message?.params?.event, message);
                }
            });
            // forward errors to Plebbit
            this._webSocketClient.on("error", (error) => {
                this._plebbit.emit("error", error);
                lastWebsocketError = error;
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
                    if ("code" in e) {
                        const actualPlebError = e;
                        throw new PlebbitError(actualPlebError.code, actualPlebError.details);
                    }
                    else if ("message" in e)
                        throw new Error(e.message);
                    else
                        throw e;
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
                error: lastWebsocketError
            });
        }
    }
    async destroy() {
        try {
            for (const subscriptionId of Object.keys(this._subscriptionEvents))
                await this.unsubscribe(Number(subscriptionId));
        }
        catch { }
        try {
            this._webSocketClient.close();
        }
        catch { }
        //@ts-expect-error
        this._webSocketClient =
            this._listSubsSubscriptionId =
                this._lastListedSubs = //@ts-expect-error
                    this._subscriptionEvents = //@ts-expect-error
                        this._pendingSubscriptionMsgs =
                            undefined;
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
        if (subscriptionId === this._listSubsSubscriptionId)
            this._listSubsSubscriptionId = undefined;
        delete this._subscriptionEvents[subscriptionId];
        delete this._pendingSubscriptionMsgs[subscriptionId];
    }
    emitAllPendingMessages(subscriptionId) {
        this._pendingSubscriptionMsgs[subscriptionId].forEach((message) => this._subscriptionEvents[subscriptionId].emit(message?.params?.event, message));
        delete this._pendingSubscriptionMsgs[subscriptionId];
    }
    async getComment(commentCid) {
        const parsedCommentCid = parseCidStringSchemaWithPlebbitErrorIfItFails(commentCid);
        const commentProps = parseCommentIpfsSchemaWithPlebbitErrorIfItFails(await this._webSocketClient.call("getComment", [parsedCommentCid]));
        return this._plebbit.createComment({ cid: parsedCommentCid, ...commentProps });
    }
    async getCommentPage(pageCid, commentCid, subplebbitAddress) {
        const parsedPageCid = parseCidStringSchemaWithPlebbitErrorIfItFails(pageCid);
        const parsedCommentCid = parseCidStringSchemaWithPlebbitErrorIfItFails(commentCid);
        const parsedSubplebbitAddress = SubplebbitAddressSchema.parse(subplebbitAddress);
        const pageIpfs = PageIpfsSchema.parse(await this._webSocketClient.call("getCommentPage", [parsedPageCid, parsedCommentCid, parsedSubplebbitAddress]));
        return pageIpfs;
    }
    async getSubplebbitPage(pageCid, subplebbitAddress) {
        const parsedPageCid = parseCidStringSchemaWithPlebbitErrorIfItFails(pageCid);
        const parsedSubplebbitAddress = SubplebbitAddressSchema.parse(subplebbitAddress);
        const pageIpfs = PageIpfsSchema.parse(await this._webSocketClient.call("getSubplebbitPage", [parsedPageCid, parsedSubplebbitAddress]));
        return pageIpfs;
    }
    async createSubplebbit(createSubplebbitOptions) {
        // This is gonna create a new local sub. Not an instance of an existing sub
        const parsedCreateSubplebbitOptions = CreateNewLocalSubplebbitUserOptionsSchema.parse(createSubplebbitOptions);
        const subProps = (await this._webSocketClient.call("createSubplebbit", [parsedCreateSubplebbitOptions]));
        const subplebbit = new RpcLocalSubplebbit(this._plebbit); // We're not using plebbit.createSubplebbit because it might try to create a local sub, we need to make sure this sub can't do any native functions
        await subplebbit.initRpcInternalSubplebbitBeforeFirstUpdateNoMerge(subProps);
        return subplebbit;
    }
    _initSubscriptionEvent(subscriptionId) {
        if (!this._subscriptionEvents[subscriptionId])
            this._subscriptionEvents[subscriptionId] = new EventEmitter();
        if (!this._pendingSubscriptionMsgs[subscriptionId])
            this._pendingSubscriptionMsgs[subscriptionId] = [];
    }
    async startSubplebbit(subplebbitAddress) {
        const parsedSubplebbitAddress = SubplebbitAddressSchema.parse(subplebbitAddress);
        const subscriptionId = SubscriptionIdSchema.parse(await this._webSocketClient.call("startSubplebbit", [parsedSubplebbitAddress]));
        this._initSubscriptionEvent(subscriptionId);
        return subscriptionId;
    }
    async stopSubplebbit(subplebbitAddress) {
        const parsedSubplebbitAddress = SubplebbitAddressSchema.parse(subplebbitAddress);
        const res = await this._webSocketClient.call("stopSubplebbit", [parsedSubplebbitAddress]);
        if (res !== true)
            throw Error("Calling RPC function should throw or return true");
    }
    async editSubplebbit(subplebbitAddress, subplebbitEditOptions) {
        const parsedAddress = SubplebbitAddressSchema.parse(subplebbitAddress);
        const parsedEditOptions = SubplebbitEditOptionsSchema.parse(subplebbitEditOptions);
        const propsAfterReplacing = replaceXWithY(parsedEditOptions, undefined, null);
        const rawRes = (await this._webSocketClient.call("editSubplebbit", [parsedAddress, propsAfterReplacing]));
        return rawRes;
    }
    async deleteSubplebbit(subplebbitAddress) {
        const parsedSubplebbitAddress = SubplebbitAddressSchema.parse(subplebbitAddress);
        const res = await this._webSocketClient.call("deleteSubplebbit", [parsedSubplebbitAddress]);
        if (res !== true)
            throw Error("Calling RPC function deleteSubplebbit should either return true or throw");
    }
    async subplebbitUpdate(subplebbitAddress) {
        const parsedSubplebbitAddress = SubplebbitAddressSchema.parse(subplebbitAddress);
        const subscriptionId = SubscriptionIdSchema.parse(await this._webSocketClient.call("subplebbitUpdate", [parsedSubplebbitAddress]));
        this._initSubscriptionEvent(subscriptionId);
        return subscriptionId;
    }
    async publishComment(commentProps) {
        const parsedProps = CommentChallengeRequestToEncryptSchema.parse(commentProps);
        const subscriptionId = SubscriptionIdSchema.parse(await this._webSocketClient.call("publishComment", [parsedProps]));
        return subscriptionId;
    }
    async publishCommentEdit(commentEditProps) {
        const parsedProps = CommentEditChallengeRequestToEncryptSchema.parse(commentEditProps);
        const subscriptionId = SubscriptionIdSchema.parse(await this._webSocketClient.call("publishCommentEdit", [parsedProps]));
        return subscriptionId;
    }
    async publishVote(voteProps) {
        const parsedProps = VoteChallengeRequestToEncryptSchema.parse(voteProps);
        const subscriptionId = SubscriptionIdSchema.parse(await this._webSocketClient.call("publishVote", [parsedProps]));
        return subscriptionId;
    }
    async commentUpdate(commentCid) {
        const parsedCid = parseCidStringSchemaWithPlebbitErrorIfItFails(commentCid);
        const subscriptionId = SubscriptionIdSchema.parse(await this._webSocketClient.call("commentUpdate", [parsedCid]));
        this._initSubscriptionEvent(subscriptionId);
        return subscriptionId;
    }
    async publishChallengeAnswers(subscriptionId, challengeAnswers) {
        const parsedId = SubscriptionIdSchema.parse(subscriptionId);
        const parsedChallengeAnswers = DecryptedChallengeAnswerSchema.shape.challengeAnswers.parse(challengeAnswers);
        const res = await this._webSocketClient.call("publishChallengeAnswers", [parsedId, parsedChallengeAnswers]);
        if (res !== true)
            throw Error("RPC function publishChallengeAnswers should either return true or throw");
        return res;
    }
    async resolveAuthorAddress(authorAddress) {
        const parsedAuthorAddress = AuthorAddressSchema.parse(authorAddress);
        const res = await this._webSocketClient.call("resolveAuthorAddress", [parsedAuthorAddress]);
        if (typeof res !== "string" && res !== null)
            throw Error("RPC function resolveAuthorAddress should either respond with string or null");
        return res;
    }
    async listSubplebbits() {
        if (!this._listSubsSubscriptionId) {
            this._lastListedSubs = undefined;
            this._listSubsSubscriptionId = SubscriptionIdSchema.parse(await this._webSocketClient.call("listSubplebbits", []));
            this._initSubscriptionEvent(this._listSubsSubscriptionId);
            this.getSubscription(this._listSubsSubscriptionId).on("update", (newSubs) => {
                this._lastListedSubs = ListOfSubplebbitsSchema.parse(newSubs.params.result);
            });
            this.emitAllPendingMessages(this._listSubsSubscriptionId); // rpc server already emitted update with latest subs
        }
        if (!Array.isArray(this._lastListedSubs))
            throw Error("Plebbit RPC server did not emit an event of listSubplebbits");
        return this._lastListedSubs;
    }
    async fetchCid(cid) {
        const parsedCid = parseCidStringSchemaWithPlebbitErrorIfItFails(cid);
        const res = await this._webSocketClient.call("fetchCid", [parsedCid]);
        if (typeof res !== "string")
            throw Error("RPC function fetchCid did not respond with string");
        return res;
    }
    async setSettings(settings) {
        const parsedSettings = SetNewSettingsPlebbitWsServerSchema.parse(settings);
        const res = await this._webSocketClient.call("setSettings", [parsedSettings]);
        if (res !== true)
            throw Error("result of setSettings should be true");
        return res;
    }
    async getSettings() {
        const res = PlebbitWsServerSettingsSerializedSchema.passthrough().parse(await this._webSocketClient.call("getSettings", []));
        return res;
    }
    async rpcCall(method, params) {
        // This function can be used to call any function on the rpc server
        const res = await this._webSocketClient.call(method, params);
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