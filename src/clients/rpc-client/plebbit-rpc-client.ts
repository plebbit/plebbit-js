import Logger from "@plebbit/plebbit-logger";
import { Client as WebSocketClient } from "rpc-websockets";
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
import type { PageIpfs } from "../../pages/types.js";
import { SubscriptionIdSchema } from "./schema.js";
import { SubplebbitAddressSchema } from "../../schema/schema.js";
import type { DecryptedChallengeAnswer, DecryptedChallengeRequest } from "../../pubsub-messages/types.js";
import type { PlebbitWsServerSettingsSerialized } from "../../rpc/src/types.js";
import {
    parseCidStringSchemaWithPlebbitErrorIfItFails,
    parseSetNewSettingsPlebbitWsServerSchemaWithPlebbitErrorIfItFails
} from "../../schema/schema-util.js";
import { ZodError } from "zod";
import type { CommentIpfsType } from "../../publications/comment/types.js";
import { SetNewSettingsPlebbitWsServerSchema } from "../../rpc/src/schema.js";
import * as z from "zod";
import { TypedEmitter } from "tiny-typed-emitter";
import type { PlebbitRpcClientEvents } from "../../types.js";

const log = Logger("plebbit-js:PlebbitRpcClient");

export default class PlebbitRpcClient extends TypedEmitter<PlebbitRpcClientEvents> {
    state: "stopped" | "connecting" | "failed" | "connected";
    subplebbits: string[];
    settings?: PlebbitWsServerSettingsSerialized;

    private _webSocketClient: WebSocketClient;
    private _websocketServerUrl: string;
    private _subscriptionEvents: Record<string, EventEmitter>; // subscription ID -> event emitter
    private _pendingSubscriptionMsgs: Record<string, any[]> = {};
    private _timeoutSeconds: number;
    private _openConnectionPromise?: Promise<any>;
    constructor(rpcServerUrl: string) {
        super();
        assert(rpcServerUrl, "plebbit.plebbitRpcClientsOptions needs to be defined to create a new rpc client");

        this._websocketServerUrl = rpcServerUrl; // default to first for now. Will change later
        this._timeoutSeconds = 20;
        this.subplebbits = [];
        this._subscriptionEvents = {};

        this.on("subplebbitschange", (newSubs) => {
            this.subplebbits = newSubs;
        });

        this.on("settingschange", (newSettings) => {
            this.settings = newSettings;
        });

        // temporary place holder because we don't want to initialize the web socket client until we call
        //@ts-expect-error
        this._webSocketClient = {
            call: async (...args) => {
                await this._init();
                return this._webSocketClient.call(...args);
            }
        };
        hideClassPrivateProps(this);
        this.state = "stopped";
    }

    setState(newState: PlebbitRpcClient["state"]) {
        if (newState === this.state) return;
        this.state = newState;
        this.emit("statechange", this.state);
    }

    async _init() {
        const log = Logger("plebbit-js:plebbit-rpc-client:_init");
        // wait for websocket connection to open
        let lastWebsocketError: Error | undefined;
        if (!(this._webSocketClient instanceof WebSocketClient)) {
            this.setState("connecting");
            // Set up events here
            // save all subscription messages (ie json rpc messages without 'id', also called json rpc 'notifications')
            // NOTE: it is possible to receive a subscription message before receiving the subscription id

            this._webSocketClient = new WebSocketClient(this._websocketServerUrl);
            log("Created a new WebSocket instance with url " + this._websocketServerUrl);
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

            this._webSocketClient.on("open", () => {
                log("Connected to RPC server", this._websocketServerUrl);
                this.setState("connected");
            });
            // forward errors to Plebbit
            this._webSocketClient.on("error", (error) => {
                lastWebsocketError = error;
                this.emit("error", error);
            });

            this._webSocketClient.on("close", () => {
                log.error("connection with web socket has been closed", this._websocketServerUrl);
                this._openConnectionPromise = undefined;
                this.setState("stopped");
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
                        throw new PlebbitError(actualPlebError.code, {
                            ...actualPlebError.details,
                            rpcArgs: args,
                            rpcServerUrl: this._websocketServerUrl
                        });
                    } else if ("name" in typedError && typedError["name"] === "ZodError")
                        throw new PlebbitError("ERR_GENERIC_RPC_INVALID_SCHEMA", {
                            zodError: typedError,
                            rpcArgs: args,
                            rpcServerUrl: this._websocketServerUrl
                        });
                    else
                        throw new PlebbitError("ERR_GENERIC_RPC_CLIENT_CALL_ERROR", {
                            error: typedError,
                            rpcArgs: args,
                            rpcServerUrl: this._websocketServerUrl
                        });
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
            const err = new PlebbitError("ERR_FAILED_TO_OPEN_CONNECTION_TO_RPC", {
                timeoutSeconds: this._timeoutSeconds,
                error: lastWebsocketError,
                rpcServerUrl: this._websocketServerUrl
            });
            this.setState("failed");
            this.emit("error", err);
            throw err;
        }
    }

    async destroy() {
        for (const subscriptionId of Object.keys(this._subscriptionEvents))
            try {
                await this.unsubscribe(Number(subscriptionId));
            } catch (e) {
                log.error("Failed to unsubscribe to subscription ID", subscriptionId, e);
            }

        try {
            this._webSocketClient.close();
        } catch (e) {
            log.error("Failed to close websocket", e);
        }

        this.setState("stopped");
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

    async getComment(parsedCommentCid: string): Promise<CommentIpfsType> {
        const commentProps = <CommentIpfsType>await this._webSocketClient.call("getComment", [parsedCommentCid]);
        return commentProps;
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

    async createSubplebbit(
        createSubplebbitOptions: CreateNewLocalSubplebbitUserOptions
    ): Promise<RpcInternalSubplebbitRecordBeforeFirstUpdateType> {
        // This is gonna create a new local sub. Not an instance of an existing sub
        const subProps = <RpcInternalSubplebbitRecordBeforeFirstUpdateType>(
            await this._webSocketClient.call("createSubplebbit", [createSubplebbitOptions])
        );
        return subProps;
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

    async resolveAuthorAddress(parsedAuthorAddress: string) {
        const res = <string | null>await this._webSocketClient.call("resolveAuthorAddress", [parsedAuthorAddress]);
        if (typeof res !== "string" && res !== null)
            throw Error("RPC function resolveAuthorAddress should either respond with string or null");
        return res;
    }

    async initalizeSubplebbitschangeEvent() {
        const subscriptionId = SubscriptionIdSchema.parse(await this._webSocketClient.call("subplebbitsSubscribe", []));
        this._initSubscriptionEvent(subscriptionId);
        this.getSubscription(subscriptionId).on("subplebbitschange", (res) => {
            this.emit("subplebbitschange", <string[]>res.params.result);
        });
        this.emitAllPendingMessages(subscriptionId);
    }

    async initalizeSettingschangeEvent() {
        const subscriptionId = SubscriptionIdSchema.parse(await this._webSocketClient.call("settingsSubscribe", []));
        this._initSubscriptionEvent(subscriptionId);
        this.getSubscription(subscriptionId).on("settingschange", (res) => {
            this.emit("settingschange", <PlebbitWsServerSettingsSerialized>res.params.result);
        });
        this.emitAllPendingMessages(subscriptionId);
    }

    async fetchCid(parsedCid: string): Promise<string> {
        const res = <string>await this._webSocketClient.call("fetchCid", [parsedCid]);
        if (typeof res !== "string") throw Error("RPC function fetchCid did not respond with string");
        return res;
    }

    async setSettings(settings: z.input<typeof SetNewSettingsPlebbitWsServerSchema>) {
        const parsedSettings = parseSetNewSettingsPlebbitWsServerSchemaWithPlebbitErrorIfItFails(settings);
        const res = <boolean>await this._webSocketClient.call("setSettings", [parsedSettings]);
        if (res !== true) throw Error("Failed setSettings");
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
