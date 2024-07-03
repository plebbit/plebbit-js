import Logger from "@plebbit/plebbit-logger";
import type { PlebbitWsServerSettings, PlebbitWsServerSettingsSerialized } from "../../types.js";
import { Client as WebSocketClient } from "rpc-websockets";
import { Comment } from "../../publications/comment/comment.js";
import { Plebbit } from "../../plebbit.js";
import assert from "assert";
import { PlebbitError } from "../../plebbit-error.js";
import EventEmitter from "events";
import pTimeout from "p-timeout";
import { throwWithErrorCode } from "../../util.js";
import type { CreateNewLocalSubplebbitUserOptions, InternalSubplebbitRpcType, SubplebbitEditOptions } from "../../subplebbit/types.js";
import { RpcLocalSubplebbit } from "../../subplebbit/rpc-local-subplebbit.js";
import type { VoteChallengeRequestToEncryptType } from "../../publications/vote/types.js";
import type { CommentChallengeRequestToEncryptType } from "../../publications/comment/types.js";
import type { PageIpfs } from "../../pages/types.js";
import { CommentChallengeRequestToEncryptSchema, CommentIpfsSchema } from "../../publications/comment/schema.js";
import { PageIpfsSchema } from "../../pages/schema.js";
import {
    CreateNewLocalSubplebbitUserOptionsSchema,
    ListOfSubplebbitsSchema,
    RpcInternalSubplebbitRecordSchema
} from "../../subplebbit/schema.js";
import { SubscriptionIdSchema } from "./schema.js";
import { AuthorAddressSchema, CommentCidSchema, SubplebbitAddressSchema } from "../../schema/schema.js";
import { DecryptedChallengeAnswerSchema } from "../../pubsub-messages/schema.js";
import type { DecryptedChallengeAnswer } from "../../pubsub-messages/types.js";
import { CommentEditChallengeRequestToEncryptType } from "../../publications/comment-edit/types.js";
import { CommentEditChallengeRequestToEncryptSchema } from "../../publications/comment-edit/schema.js";
import { VoteChallengeRequestToEncryptSchema } from "../../publications/vote/schema.js";

const log = Logger("plebbit-js:PlebbitRpcClient");

export default class PlebbitRpcClient {
    private _webSocketClient: WebSocketClient;
    private _plebbit: Plebbit;
    private _subscriptionEvents: Record<string, EventEmitter> = {}; // subscription ID -> event emitter
    private _pendingSubscriptionMsgs: Record<string, any[]> = {};
    private _timeoutSeconds: number;
    private _openConnectionPromise?: Promise<any>;
    private _listSubsSubscriptionId?: number;
    private _lastListedSubs?: string[];
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
                    //e is an error json representation of PlebbitError
                    if ("code" in <PlebbitError>e) {
                        const actualPlebError = e as PlebbitError;
                        // zod here
                        throw new PlebbitError(actualPlebError.code, actualPlebError.details);
                    } else if ("message" in <Error>e) throw new Error((<Error>e).message);
                    else {
                        throw Error("plebbit rpc client call throwed a non Error" + e);
                    }
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

    getSubscription(subscriptionId: number) {
        if (!this._subscriptionEvents[subscriptionId]) throw Error(`No subscription to RPC with id (${subscriptionId})`);
        else return this._subscriptionEvents[subscriptionId];
    }

    async unsubscribe(subscriptionId: number) {
        await this._webSocketClient.call("unsubscribe", [subscriptionId]);
        if (this._subscriptionEvents[subscriptionId]) this._subscriptionEvents[subscriptionId].removeAllListeners();
        if (subscriptionId === this._listSubsSubscriptionId) this._listSubsSubscriptionId = undefined;
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
        const parsedCommentCid = CommentCidSchema.parse(commentCid);
        const commentProps = CommentIpfsSchema.parse(await this._webSocketClient.call("getComment", [parsedCommentCid]));
        return this._plebbit.createComment({ cid: parsedCommentCid, ...commentProps });
    }

    async getCommentPage(pageCid: string, commentCid: string, subplebbitAddress: string): Promise<PageIpfs> {
        const parsedPageCid = CommentCidSchema.parse(pageCid);
        const parsedCommentCid = CommentCidSchema.parse(commentCid);
        const parsedSubplebbitAddress = SubplebbitAddressSchema.parse(subplebbitAddress);
        const pageIpfs = PageIpfsSchema.parse(
            await this._webSocketClient.call("getCommentPage", [parsedPageCid, parsedCommentCid, parsedSubplebbitAddress])
        );
        return pageIpfs;
    }

    async getSubplebbitPage(pageCid: string, subplebbitAddress: string): Promise<PageIpfs> {
        const parsedPageCid = CommentCidSchema.parse(pageCid);
        const parsedSubplebbitAddress = SubplebbitAddressSchema.parse(subplebbitAddress);
        const pageIpfs = PageIpfsSchema.parse(
            await this._webSocketClient.call("getSubplebbitPage", [parsedPageCid, parsedSubplebbitAddress])
        );
        return pageIpfs;
    }

    async createSubplebbit(createSubplebbitOptions: CreateNewLocalSubplebbitUserOptions): Promise<RpcLocalSubplebbit> {
        // This is gonna create a new local sub. Not an instance of an existing sub
        const parsedCreateSubplebbitOptions = CreateNewLocalSubplebbitUserOptionsSchema.parse(createSubplebbitOptions);
        const subProps = RpcInternalSubplebbitRecordSchema.parse(
            await this._webSocketClient.call("createSubplebbit", [parsedCreateSubplebbitOptions])
        );
        const subplebbit = new RpcLocalSubplebbit(this._plebbit); // We're not using plebbit.createSubplebbit because it might try to create a local sub, we need to make sure this sub can't do any native functions
        await subplebbit.initRpcInternalSubplebbitNoMerge(subProps);
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

    async editSubplebbit(subplebbitAddress: string, subplebbitEditOptions: SubplebbitEditOptions) {
        // zod here
        const editedSub = <InternalSubplebbitRpcType>(
            await this._webSocketClient.call("editSubplebbit", [subplebbitAddress, subplebbitEditOptions])
        );
        return editedSub;
    }

    async deleteSubplebbit(subplebbitAddress: string) {
        const parsedSubplebbitAddress = SubplebbitAddressSchema.parse(subplebbitAddress);
        const res = await this._webSocketClient.call("deleteSubplebbit", [parsedSubplebbitAddress]);
        if (res !== true) throw Error("Calling RPC function deleteSubplebbit should either return true or throw");
    }

    async subplebbitUpdate(subplebbitAddress: string): Promise<number> {
        const parsedSubplebbitAddress = SubplebbitAddressSchema.parse(subplebbitAddress);
        const subscriptionId = SubscriptionIdSchema.parse(await this._webSocketClient.call("subplebbitUpdate", [parsedSubplebbitAddress]));
        this._initSubscriptionEvent(subscriptionId);
        return subscriptionId;
    }

    async publishComment(commentProps: CommentChallengeRequestToEncryptType) {
        const parsedProps = CommentChallengeRequestToEncryptSchema.parse(commentProps);
        const subscriptionId = SubscriptionIdSchema.parse(await this._webSocketClient.call("publishComment", [parsedProps]));
        return subscriptionId;
    }

    async publishCommentEdit(commentEditProps: CommentEditChallengeRequestToEncryptType) {
        const parsedProps = CommentEditChallengeRequestToEncryptSchema.parse(commentEditProps);
        const subscriptionId = SubscriptionIdSchema.parse(await this._webSocketClient.call("publishCommentEdit", [parsedProps]));
        return subscriptionId;
    }

    async publishVote(voteProps: VoteChallengeRequestToEncryptType) {
        const parsedProps = VoteChallengeRequestToEncryptSchema.parse(voteProps);
        const subscriptionId = SubscriptionIdSchema.parse(await this._webSocketClient.call("publishVote", [parsedProps]));
        return subscriptionId;
    }

    async commentUpdate(commentCid: string) {
        const parsedCid = CommentCidSchema.parse(commentCid);
        const subscriptionId = SubscriptionIdSchema.parse(await this._webSocketClient.call("commentUpdate", [parsedCid]));
        this._initSubscriptionEvent(subscriptionId);
        return subscriptionId;
    }

    async publishChallengeAnswers(subscriptionId: number, challengeAnswers: DecryptedChallengeAnswer["challengeAnswers"]) {
        const parsedId = SubscriptionIdSchema.parse(subscriptionId);
        const parsedChallengeAnswers = DecryptedChallengeAnswerSchema.shape.challengeAnswers.parse(challengeAnswers);
        const res = <boolean>await this._webSocketClient.call("publishChallengeAnswers", [parsedId, parsedChallengeAnswers]);
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

    async listSubplebbits(): Promise<string[]> {
        if (!this._listSubsSubscriptionId) {
            this._lastListedSubs = undefined;
            this._listSubsSubscriptionId = SubscriptionIdSchema.parse(await this._webSocketClient.call("listSubplebbits", []));
            this._initSubscriptionEvent(this._listSubsSubscriptionId);
            this.getSubscription(this._listSubsSubscriptionId).on("update", (newSubs) => {
                this._lastListedSubs = ListOfSubplebbitsSchema.parse(newSubs.params.result);
            });
            this.emitAllPendingMessages(this._listSubsSubscriptionId); // rpc server already emitted update with latest subs
        }
        if (!Array.isArray(this._lastListedSubs)) throw Error("Plebbit RPC server did not emit an event of listSubplebbits");

        return this._lastListedSubs;
    }

    async fetchCid(cid: string): Promise<string> {
        const parsedCid = CommentCidSchema.parse(cid);
        const res = <string>await this._webSocketClient.call("fetchCid", [parsedCid]);
        if (typeof res !== "string") throw Error("RPC function fetchCid did not respond with string");
        return res;
    }

    async setSettings(settings: PlebbitWsServerSettings) {
        // zod here
        const res = <boolean>await this._webSocketClient.call("setSettings", [settings]);
        return res;
    }

    async getSettings() {
        // zod here
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
