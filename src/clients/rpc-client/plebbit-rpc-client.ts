import Logger from "@plebbit/plebbit-logger";
import { Client as WebSocketClient } from "rpc-websockets";
import { Comment } from "../../publications/comment/comment.js";
import { Plebbit } from "../../plebbit.js";
import assert from "assert";
import { PlebbitError } from "../../plebbit-error.js";
import EventEmitter from "events";
import pTimeout from "p-timeout";
import { hideClassPrivateProps, replaceXWithY, throwWithErrorCode } from "../../util.js";
import type {
    CreateNewLocalSubplebbitUserOptions,
    RpcInternalSubplebbitRecordBeforeFirstUpdateType,
    SubplebbitEditOptions,
    RpcLocalSubplebbitUpdateResultType
} from "../../subplebbit/types.js";
import { RpcLocalSubplebbit } from "../../subplebbit/rpc-local-subplebbit.js";
import type { PageIpfs } from "../../pages/types.js";
import { SubscriptionIdSchema } from "./schema.js";
import { AuthorAddressSchema, SubplebbitAddressSchema } from "../../schema/schema.js";
import type { DecryptedChallengeAnswer, DecryptedChallengeRequest } from "../../pubsub-messages/types.js";
import type { PlebbitWsServerSettingsSerialized, SetNewSettingsPlebbitWsServer } from "../../rpc/src/types.js";
import {
    parseCidStringSchemaWithPlebbitErrorIfItFails,
    parseCommentIpfsSchemaWithPlebbitErrorIfItFails,
    parseSetNewSettingsPlebbitWsServerSchemaWithPlebbitErrorIfItFails
} from "../../schema/schema-util.js";
import { ZodError } from "zod";

const log = Logger("plebbit-js:PlebbitRpcClient");

export default class PlebbitRpcClient {
    private _webSocketClient: WebSocketClient;
    private _plebbit: Plebbit;
    private _subscriptionEvents: Record<string, EventEmitter> = {}; // subscription ID -> event emitter
    private _pendingSubscriptionMsgs: Record<string, any[]> = {};
    private _timeoutSeconds: number;
    private _openConnectionPromise?: Promise<any>;
    constructor(plebbit: Plebbit) {
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
        let lastWebsocketError: Error | undefined;
        if (!(this._webSocketClient instanceof WebSocketClient)) {
            // Set up events here
            // save all subscription messages (ie json rpc messages without 'id', also called json rpc 'notifications')
            // NOTE: it is possible to receive a subscription message before receiving the subscription id

            this._webSocketClient = new WebSocketClient(this._plebbit.plebbitRpcClientsOptions![0]);
            log("Created a new WebSocket instance with url " + this._plebbit.plebbitRpcClientsOptions![0]);
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
                    else this._subscriptionEvents[subscriptionId].emit(message?.params?.event, message);
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
                } catch (e) {
                    const typedError = <PlebbitError | { code: number; message: string } | Error | ZodError>e;
                    //e is an error json representation of PlebbitError
                    if ("code" in typedError && typeof typedError.code === "string") {
                        const actualPlebError = typedError as PlebbitError;
                        throw new PlebbitError(actualPlebError.code, { ...actualPlebError.details, rpcArgs: args });
                    } else if ("name" in typedError && typedError["name"] === "ZodError")
                        throw new PlebbitError("ERR_GENERIC_RPC_INVALID_SCHEMA", {
                            zodError: typedError,
                            rpcArgs: args
                        });
                    else throw new PlebbitError("ERR_GENERIC_RPC_CLIENT_CALL_ERROR", { error: typedError, rpcArgs: args });
                }
            };
        }
        // @ts-expect-error
        if (this._webSocketClient.ready) return;
        if (!this._openConnectionPromise)
            this._openConnectionPromise = pTimeout(new Promise(async (resolve) => this._webSocketClient.once("open", resolve)), {
                milliseconds: this._timeoutSeconds * 1000
            });

        try {
            await this._openConnectionPromise;
        } catch (e) {
            throwWithErrorCode("ERR_FAILED_TO_OPEN_CONNECTION_TO_RPC", {
                plebbitRpcUrl: this._plebbit.plebbitRpcClientsOptions![0],
                timeoutSeconds: this._timeoutSeconds,
                error: lastWebsocketError
            });
        }
    }

    async destroy() {
        try {
            for (const subscriptionId of Object.keys(this._subscriptionEvents)) await this.unsubscribe(Number(subscriptionId));
        } catch {}

        try {
            this._webSocketClient.close();
        } catch {}

        //@ts-expect-error
        this._webSocketClient = //@ts-expect-error
            this._subscriptionEvents = //@ts-expect-error
            this._pendingSubscriptionMsgs =
                undefined;
    }

    toJSON() {
        return undefined;
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
        const parsedCommentCid = parseCidStringSchemaWithPlebbitErrorIfItFails(commentCid);
        const commentProps = parseCommentIpfsSchemaWithPlebbitErrorIfItFails(
            await this._webSocketClient.call("getComment", [parsedCommentCid])
        );
        return this._plebbit.createComment({ cid: parsedCommentCid, ...commentProps });
    }

    async getCommentPage(pageCid: string, commentCid: string, subplebbitAddress: string): Promise<PageIpfs> {
        const parsedPageCid = parseCidStringSchemaWithPlebbitErrorIfItFails(pageCid);
        const parsedCommentCid = parseCidStringSchemaWithPlebbitErrorIfItFails(commentCid);
        const parsedSubplebbitAddress = SubplebbitAddressSchema.parse(subplebbitAddress);
        const pageIpfs = <PageIpfs>(
            await this._webSocketClient.call("getCommentPage", [parsedPageCid, parsedCommentCid, parsedSubplebbitAddress])
        );
        return pageIpfs;
    }

    async getSubplebbitPage(pageCid: string, subplebbitAddress: string): Promise<PageIpfs> {
        const parsedPageCid = parseCidStringSchemaWithPlebbitErrorIfItFails(pageCid);
        const parsedSubplebbitAddress = SubplebbitAddressSchema.parse(subplebbitAddress);
        const pageIpfs = <PageIpfs>await this._webSocketClient.call("getSubplebbitPage", [parsedPageCid, parsedSubplebbitAddress]);
        return pageIpfs;
    }

    async createSubplebbit(createSubplebbitOptions: CreateNewLocalSubplebbitUserOptions): Promise<RpcLocalSubplebbit> {
        // This is gonna create a new local sub. Not an instance of an existing sub
        const subProps = <RpcInternalSubplebbitRecordBeforeFirstUpdateType>(
            await this._webSocketClient.call("createSubplebbit", [createSubplebbitOptions])
        );
        const subplebbit = new RpcLocalSubplebbit(this._plebbit); // We're not using plebbit.createSubplebbit because it might try to create a local sub, we need to make sure this sub can't do any native functions
        await subplebbit.initRpcInternalSubplebbitBeforeFirstUpdateNoMerge(subProps);
        return subplebbit;
    }

    private _initSubscriptionEvent(subscriptionId: number) {
        if (!this._subscriptionEvents[subscriptionId]) this._subscriptionEvents[subscriptionId] = new EventEmitter();
        if (!this._pendingSubscriptionMsgs[subscriptionId]) this._pendingSubscriptionMsgs[subscriptionId] = [];
    }

    async startSubplebbit(subplebbitAddress: string) {
        const parsedSubplebbitAddress = SubplebbitAddressSchema.parse(subplebbitAddress);
        const subscriptionId = SubscriptionIdSchema.parse(await this._webSocketClient.call("startSubplebbit", [parsedSubplebbitAddress]));
        this._initSubscriptionEvent(subscriptionId);
        return subscriptionId;
    }

    async stopSubplebbit(subplebbitAddress: string): Promise<void> {
        const parsedSubplebbitAddress = SubplebbitAddressSchema.parse(subplebbitAddress);

        const res = await this._webSocketClient.call("stopSubplebbit", [parsedSubplebbitAddress]);
        if (res !== true) throw Error("Calling RPC function should throw or return true");
    }

    async editSubplebbit(
        subplebbitAddress: string,
        subplebbitEditOptions: SubplebbitEditOptions
    ): Promise<RpcLocalSubplebbitUpdateResultType> {
        const parsedAddress = SubplebbitAddressSchema.parse(subplebbitAddress);
        const propsAfterReplacing = replaceXWithY(subplebbitEditOptions, undefined, null);
        const rawRes = <RpcLocalSubplebbitUpdateResultType>(
            await this._webSocketClient.call("editSubplebbit", [parsedAddress, propsAfterReplacing])
        );
        return rawRes;
    }

    async deleteSubplebbit(subplebbitAddress: string) {
        const parsedSubplebbitAddress = SubplebbitAddressSchema.parse(subplebbitAddress);
        const res = await this._webSocketClient.call("deleteSubplebbit", [parsedSubplebbitAddress]);
        if (res !== true) throw Error("Calling RPC function deleteSubplebbit should either return true or throw");
    }

    async subplebbitUpdateSubscribe(subplebbitAddress: string): Promise<number> {
        const parsedSubplebbitAddress = SubplebbitAddressSchema.parse(subplebbitAddress);
        const subscriptionId = SubscriptionIdSchema.parse(
            await this._webSocketClient.call("subplebbitUpdateSubscribe", [parsedSubplebbitAddress])
        );
        this._initSubscriptionEvent(subscriptionId);
        return subscriptionId;
    }

    async publishComment(commentProps: DecryptedChallengeRequest) {
        const subscriptionId = SubscriptionIdSchema.parse(await this._webSocketClient.call("publishComment", [commentProps]));
        return subscriptionId;
    }

    async publishCommentEdit(commentEditProps: DecryptedChallengeRequest) {
        const subscriptionId = SubscriptionIdSchema.parse(await this._webSocketClient.call("publishCommentEdit", [commentEditProps]));
        return subscriptionId;
    }

    async publishCommentModeration(commentModProps: DecryptedChallengeRequest) {
        const subscriptionId = SubscriptionIdSchema.parse(await this._webSocketClient.call("publishCommentModeration", [commentModProps]));
        return subscriptionId;
    }

    async publishVote(voteProps: DecryptedChallengeRequest) {
        const subscriptionId = SubscriptionIdSchema.parse(await this._webSocketClient.call("publishVote", [voteProps]));
        return subscriptionId;
    }

    async commentUpdateSubscribe(commentCid: string) {
        const parsedCid = parseCidStringSchemaWithPlebbitErrorIfItFails(commentCid);
        const subscriptionId = SubscriptionIdSchema.parse(await this._webSocketClient.call("commentUpdateSubscribe", [parsedCid]));
        this._initSubscriptionEvent(subscriptionId);
        return subscriptionId;
    }

    async publishChallengeAnswers(subscriptionId: number, challengeAnswers: DecryptedChallengeAnswer["challengeAnswers"]) {
        const parsedId = SubscriptionIdSchema.parse(subscriptionId);
        const res = <boolean>await this._webSocketClient.call("publishChallengeAnswers", [parsedId, { challengeAnswers }]);
        if (res !== true) throw Error("RPC function publishChallengeAnswers should either return true or throw");
        return res;
    }

    async resolveAuthorAddress(authorAddress: string) {
        const parsedAuthorAddress = AuthorAddressSchema.parse(authorAddress);
        const res = <string | null>await this._webSocketClient.call("resolveAuthorAddress", [parsedAuthorAddress]);
        if (typeof res !== "string" && res !== null)
            throw Error("RPC function resolveAuthorAddress should either respond with string or null");
        return res;
    }

    async initalizeSubplebbitschangeEvent() {
        const subscriptionId = SubscriptionIdSchema.parse(await this._webSocketClient.call("subplebbitsSubscribe", []));
        this._initSubscriptionEvent(subscriptionId);
        this.getSubscription(subscriptionId).on("subplebbitschange", (res) => {
            this._plebbit.emit("subplebbitschange", <string[]>res.params.result);
        });
        this.emitAllPendingMessages(subscriptionId);
    }

    async fetchCid(cid: string): Promise<string> {
        const parsedCid = parseCidStringSchemaWithPlebbitErrorIfItFails(cid);
        const res = <string>await this._webSocketClient.call("fetchCid", [parsedCid]);
        if (typeof res !== "string") throw Error("RPC function fetchCid did not respond with string");
        return res;
    }

    async setSettings(settings: SetNewSettingsPlebbitWsServer) {
        const parsedSettings = parseSetNewSettingsPlebbitWsServerSchemaWithPlebbitErrorIfItFails(settings);
        const res = <boolean>await this._webSocketClient.call("setSettings", [parsedSettings]);
        if (res !== true) throw Error("result of setSettings should be true");
        return res;
    }

    async getSettings() {
        const res = <PlebbitWsServerSettingsSerialized>await this._webSocketClient.call("getSettings", []);
        return res;
    }

    async rpcCall(method: string, params: any[]): Promise<any> {
        // This function can be used to call any function on the rpc server
        const res = <any>await this._webSocketClient.call(method, params);
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
