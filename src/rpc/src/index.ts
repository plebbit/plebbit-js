import { Server as RpcWebsocketsServer } from "rpc-websockets";
import PlebbitJs, { setPlebbitJs } from "./lib/plebbit-js/index.js";
import {
    clone,
    encodeChallengeAnswerMessage,
    encodeChallengeMessage,
    encodeChallengeRequest,
    encodeChallengeVerificationMessage,
    generateSubscriptionId
} from "./utils.js";
import Logger from "@plebbit/plebbit-logger";
import { EventEmitter } from "events";
import type {
    PlebbitWsServerClassOptions,
    JsonRpcSendNotificationOptions,
    CreatePlebbitWsServerOptions,
    PlebbitWsServerSettingsSerialized
} from "./types.js";
import { Plebbit } from "../../plebbit/plebbit.js";
import type {
    DecryptedChallengeAnswerMessageType,
    DecryptedChallengeMessageType,
    DecryptedChallengeRequestMessageType,
    DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor,
    DecryptedChallengeVerificationMessageType
} from "../../pubsub-messages/types.js";
import WebSocket from "ws";
import Publication from "../../publications/publication.js";
import { PlebbitError } from "../../plebbit-error.js";
import { LocalSubplebbit } from "../../runtime/node/subplebbit/local-subplebbit.js";
import { RemoteSubplebbit } from "../../subplebbit/remote-subplebbit.js";
import { hideClassPrivateProps, replaceXWithY, throwWithErrorCode } from "../../util.js";
import * as remeda from "remeda";
import type { IncomingMessage } from "http";
import type { CommentChallengeRequestToEncryptType, CommentIpfsType, CommentRpcErrorToTransmit } from "../../publications/comment/types.js";
import { AuthorAddressSchema, SubplebbitAddressSchema } from "../../schema/schema.js";
import { SubscriptionIdSchema } from "../../clients/rpc-client/schema.js";
import type {
    RpcInternalSubplebbitRecordAfterFirstUpdateType,
    RpcInternalSubplebbitRecordBeforeFirstUpdateType,
    RpcRemoteSubplebbitType,
    SubplebbitRpcErrorToTransmit
} from "../../subplebbit/types.js";
import {
    parseCidStringSchemaWithPlebbitErrorIfItFails,
    parseCommentChallengeRequestToEncryptSchemaWithPlebbitErrorIfItFails,
    parseCommentEditChallengeRequestToEncryptSchemaWithPlebbitErrorIfItFails,
    parseCommentModerationChallengeRequestToEncryptSchemaWithPlebbitErrorIfItFails,
    parseCreateNewLocalSubplebbitUserOptionsSchemaWithPlebbitErrorIfItFails,
    parseCreatePlebbitWsServerOptionsSchemaWithPlebbitErrorIfItFails,
    parseDecryptedChallengeAnswerWithPlebbitErrorIfItFails,
    parseSetNewSettingsPlebbitWsServerSchemaWithPlebbitErrorIfItFails,
    parseSubplebbitEditChallengeRequestToEncryptSchemaWithPlebbitErrorIfItFails,
    parseSubplebbitEditOptionsSchemaWithPlebbitErrorIfItFails,
    parseVoteChallengeRequestToEncryptSchemaWithPlebbitErrorIfItFails
} from "../../schema/schema-util.js";
import { stringify as deterministicStringify } from "safe-stable-stringify";
import type { VoteChallengeRequestToEncryptType } from "../../publications/vote/types.js";
import type { CommentEditChallengeRequestToEncryptType } from "../../publications/comment-edit/types.js";
import type { CommentModerationChallengeRequestToEncrypt } from "../../publications/comment-moderation/types.js";
import type { InputPlebbitOptions } from "../../types.js";
import type { SubplebbitEditChallengeRequestToEncryptType } from "../../publications/subplebbit-edit/types.js";
import { PublicationRpcErrorToTransmit, RpcPublishResult } from "../../publications/types.js";

// store started subplebbits  to be able to stop them
// store as a singleton because not possible to start the same sub twice at the same time
const startedSubplebbits: { [address: string]: "pending" | LocalSubplebbit } = {};
const getStartedSubplebbit = async (address: string): Promise<LocalSubplebbit> => {
    if (!(address in startedSubplebbits)) throw Error("Can't call getStartedSubplebbit when the sub hasn't been started");
    // if pending, wait until no longer pendng
    while (startedSubplebbits[address] === "pending") {
        await new Promise((r) => setTimeout(r, 20));
    }
    return <LocalSubplebbit>startedSubplebbits[address];
};

const log = Logger("plebbit-js-rpc:plebbit-ws-server");

class PlebbitWsServer {
    plebbit!: Plebbit;
    rpcWebsockets: RpcWebsocketsServer;
    ws: RpcWebsocketsServer["wss"];
    connections: { [connectionId: string]: WebSocket } = {};
    subscriptionCleanups: { [connectionId: string]: { [subscriptionId: number]: () => void } } = {};
    // store publishing publications so they can be used by publishChallengeAnswers
    publishing: { [subscriptionId: number]: Publication } = {};
    authKey: string | undefined;
    private _getIpFromConnectionRequest = (req: IncomingMessage) => <string>req.socket.remoteAddress; // we set it up here so we can mock it in tests

    private _onSettingsChange: { [connectionId: string]: { [subscriptionId: number]: () => void } } = {};

    constructor({ port, server, plebbit, authKey }: PlebbitWsServerClassOptions) {
        const log = Logger("plebbit-js:PlebbitWsServer");
        this.authKey = authKey;
        // don't instantiate plebbit in constructor because it's an async function
        this._initPlebbit(plebbit);
        this.rpcWebsockets = new RpcWebsocketsServer({
            port,
            server,
            verifyClient: ({ req }, callback) => {
                // block non-localhost requests without auth key for security

                const requestOriginatorIp = this._getIpFromConnectionRequest(req);
                log.trace("Received new connection request from", requestOriginatorIp, "with url", req.url);
                const xForwardedFor = Boolean(req.rawHeaders.find((item, i) => item.toLowerCase() === "x-forwarded-for" && i % 2 === 0));

                // client is on localhost and server is not forwarded by a proxy
                // req.socket.localAddress is the local address of the rpc server
                const isLocalhost = req.socket.localAddress && req.socket.localAddress === requestOriginatorIp && !xForwardedFor;

                // the request path is the auth key, e.g. localhost:9138/some-random-auth-key (not secure on http)
                const hasAuth = this.authKey && `/${this.authKey}` === req.url;

                // if isn't localhost and doesn't have auth, block access
                if (!isLocalhost && !hasAuth) {
                    log(
                        `Rejecting RPC connection request from`,
                        requestOriginatorIp,
                        `rejected because there is no auth key, url:`,
                        req.url
                    );
                    callback(false, 403, "You need to set the auth key to connect remotely");
                } else callback(true);
            }
        });
        // rpc-sockets uses this library https://www.npmjs.com/package/ws
        this.ws = this.rpcWebsockets.wss;

        // forward errors to PlebbitWsServer
        this.rpcWebsockets.on("error", (error) => {
            log.error("RPC server", "Received an error on rpc-websockets", error);
        });

        // save connections to send messages to them later
        this.ws.on("connection", (ws) => {
            //@ts-ignore-error
            this.connections[ws._id] = ws;
            //@ts-ignore-error
            this.subscriptionCleanups[ws._id] = {};
            //@ts-expect-error
            this._onSettingsChange[ws._id] = {};
            //@ts-expect-error
            log("Established connection with new RPC client", ws._id);
        });

        // cleanup on disconnect
        this.rpcWebsockets.on("disconnection", (ws) => {
            const subscriptionCleanups = this.subscriptionCleanups[ws._id];
            for (const subscriptionId in subscriptionCleanups) {
                subscriptionCleanups[subscriptionId]();
                delete subscriptionCleanups[subscriptionId];
            }
            delete this.subscriptionCleanups[ws._id];
            delete this.connections[ws._id];
            delete this._onSettingsChange[ws._id];
            log("Disconnected from RPC client", ws._id);
        });

        // register all JSON RPC methods
        this.rpcWebsocketsRegister("getComment", this.getComment.bind(this));
        this.rpcWebsocketsRegister("getSubplebbitPage", this.getSubplebbitPage.bind(this));
        this.rpcWebsocketsRegister("getCommentPage", this.getCommentPage.bind(this));
        this.rpcWebsocketsRegister("createSubplebbit", this.createSubplebbit.bind(this));
        this.rpcWebsocketsRegister("startSubplebbit", this.startSubplebbit.bind(this));
        this.rpcWebsocketsRegister("stopSubplebbit", this.stopSubplebbit.bind(this));
        this.rpcWebsocketsRegister("editSubplebbit", this.editSubplebbit.bind(this));
        this.rpcWebsocketsRegister("deleteSubplebbit", this.deleteSubplebbit.bind(this));
        this.rpcWebsocketsRegister("subplebbitsSubscribe", this.subplebbitsSubscribe.bind(this));
        this.rpcWebsocketsRegister("settingsSubscribe", this.settingsSubscribe.bind(this));

        this.rpcWebsocketsRegister("fetchCid", this.fetchCid.bind(this));
        this.rpcWebsocketsRegister("resolveAuthorAddress", this.resolveAuthorAddress.bind(this));
        this.rpcWebsocketsRegister("setSettings", this.setSettings.bind(this));
        // JSON RPC pubsub methods
        this.rpcWebsocketsRegister("commentUpdateSubscribe", this.commentUpdateSubscribe.bind(this));
        this.rpcWebsocketsRegister("subplebbitUpdateSubscribe", this.subplebbitUpdateSubscribe.bind(this));
        this.rpcWebsocketsRegister("publishComment", this.publishComment.bind(this));
        this.rpcWebsocketsRegister("publishSubplebbitEdit", this.publishSubplebbitEdit.bind(this));
        this.rpcWebsocketsRegister("publishVote", this.publishVote.bind(this));
        this.rpcWebsocketsRegister("publishCommentEdit", this.publishCommentEdit.bind(this));
        this.rpcWebsocketsRegister("publishCommentModeration", this.publishCommentModeration.bind(this));
        this.rpcWebsocketsRegister("publishChallengeAnswers", this.publishChallengeAnswers.bind(this));
        this.rpcWebsocketsRegister("unsubscribe", this.unsubscribe.bind(this));

        hideClassPrivateProps(this);
    }

    // util function to log errors of registered methods
    rpcWebsocketsRegister(method: string, callback: Function) {
        const callbackWithErrorHandled = async (params: any, connectionId: string) => {
            try {
                const res = await callback(params, connectionId);
                return res;
            } catch (e: any) {
                const typedError = <PlebbitError | Error>e;
                log.error(`${callback.name} error`, { params, error: typedError });
                // We need to stringify the error here because rpc-websocket will remove props from PlebbitError
                if (typedError instanceof PlebbitError) {
                    const errorJson = JSON.parse(JSON.stringify(typedError));
                    delete errorJson["stack"];
                    throw errorJson;
                } else throw typedError;
            }
        };
        this.rpcWebsockets.register(method, callbackWithErrorHandled);

        // register localhost:9138/<auth-key> to bypass block on non-localhost requests, using /<auth-key> as namespace
        if (this.authKey) {
            this.rpcWebsockets.register(method, callbackWithErrorHandled, `/${this.authKey}`);
        }
    }

    // send json rpc notification message (no id field, but must have subscription id)
    jsonRpcSendNotification({ method, result, subscription, event, connectionId }: JsonRpcSendNotificationOptions) {
        const message = {
            jsonrpc: "2.0",
            method,
            params: {
                result,
                subscription,
                event
            }
        };
        if (event === "error") {
            delete message?.params?.result?.stack;
            delete message?.params?.result?.details?.error?.stack;
        }
        this.connections[connectionId]?.send?.(JSON.stringify(message));
    }

    async getComment(params: any): Promise<CommentIpfsType> {
        const cid = parseCidStringSchemaWithPlebbitErrorIfItFails(params[0]);
        const comment = await this.plebbit.getComment(cid);
        return comment.toJSONIpfs();
    }

    async getSubplebbitPage(params: any) {
        const pageCid = parseCidStringSchemaWithPlebbitErrorIfItFails(params[0]);
        const subplebbitAddress = SubplebbitAddressSchema.parse(params[1]);

        // Use started subplebbit to fetch the page if possible, to expediete the process
        const sub =
            subplebbitAddress in startedSubplebbits
                ? await getStartedSubplebbit(subplebbitAddress)
                : <RemoteSubplebbit | LocalSubplebbit>await this.plebbit.createSubplebbit({ address: subplebbitAddress });
        const page = await sub.posts._fetchAndVerifyPage(pageCid);
        return page;
    }

    async getCommentPage(params: any) {
        const pageCid = parseCidStringSchemaWithPlebbitErrorIfItFails(params[0]);
        const commentCid = parseCidStringSchemaWithPlebbitErrorIfItFails(params[1]);
        const subplebbitAddress = SubplebbitAddressSchema.parse(params[2]);
        const comment = await this.plebbit.createComment({ cid: commentCid, subplebbitAddress });
        const page = await comment.replies._fetchAndVerifyPage(pageCid);
        return page;
    }

    async createSubplebbit(params: any) {
        const createSubplebbitOptions = parseCreateNewLocalSubplebbitUserOptionsSchemaWithPlebbitErrorIfItFails(params[0]);
        const subplebbit = <LocalSubplebbit>await this.plebbit.createSubplebbit(createSubplebbitOptions);
        if (!(subplebbit instanceof LocalSubplebbit)) throw Error("Failed to create a local subplebbit. This is a critical error");
        return subplebbit.toJSONInternalRpcBeforeFirstUpdate();
    }

    _setupStartedEvents(subplebbit: LocalSubplebbit, connectionId: string, subscriptionId: number) {
        const sendEvent = (event: string, result: any) =>
            this.jsonRpcSendNotification({ method: "startSubplebbit", subscription: subscriptionId, event, result, connectionId });

        const getUpdateJson = () =>
            typeof subplebbit.updatedAt === "number"
                ? subplebbit.toJSONInternalRpcAfterFirstUpdate()
                : subplebbit.toJSONInternalRpcBeforeFirstUpdate();
        const updateListener = () => sendEvent("update", getUpdateJson());
        subplebbit.on("update", updateListener);

        const startedStateListener = () => sendEvent("startedstatechange", subplebbit.startedState);
        subplebbit.on("startedstatechange", startedStateListener);

        const requestListener = (request: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor) =>
            sendEvent("challengerequest", encodeChallengeRequest(request));
        subplebbit.on("challengerequest", requestListener);

        const challengeListener = (challenge: DecryptedChallengeMessageType) => sendEvent("challenge", encodeChallengeMessage(challenge));
        subplebbit.on("challenge", challengeListener);

        const challengeAnswerListener = (answer: DecryptedChallengeAnswerMessageType) =>
            sendEvent("challengeanswer", encodeChallengeAnswerMessage(answer));
        subplebbit.on("challengeanswer", challengeAnswerListener);

        const challengeVerificationListener = (challengeVerification: DecryptedChallengeVerificationMessageType) =>
            sendEvent("challengeverification", encodeChallengeVerificationMessage(challengeVerification));
        subplebbit.on("challengeverification", challengeVerificationListener);

        const errorListener = (error: PlebbitError | Error) => {
            const rpcError = error as SubplebbitRpcErrorToTransmit;
            if (subplebbit.state === "started") rpcError.details = { ...rpcError.details, newStartedState: subplebbit.startedState };
            else if (subplebbit.state === "updating")
                rpcError.details = { ...rpcError.details, newUpdatingState: subplebbit.updatingState };
            log("subplebbit rpc error", rpcError);
            sendEvent("error", rpcError);
        };
        subplebbit.on("error", errorListener);

        // cleanup function
        this.subscriptionCleanups[connectionId][subscriptionId] = () => {
            subplebbit.removeListener("update", updateListener);
            subplebbit.removeListener("startedstatechange", startedStateListener);
            subplebbit.removeListener("challengerequest", requestListener);
            subplebbit.removeListener("challenge", challengeListener);
            subplebbit.removeListener("challengeanswer", challengeAnswerListener);
            subplebbit.removeListener("challengeverification", challengeVerificationListener);
            subplebbit.removeListener("error", errorListener);
        };
    }

    async startSubplebbit(params: any, connectionId: string) {
        const address = SubplebbitAddressSchema.parse(params[0]);

        const localSubs = this.plebbit.subplebbits;
        if (!localSubs.includes(address))
            throwWithErrorCode("ERR_RPC_CLIENT_ATTEMPTING_TO_START_A_REMOTE_SUB", { subplebbitAddress: address });

        const subscriptionId = generateSubscriptionId();

        const isSubStarted = address in startedSubplebbits;
        if (isSubStarted) {
            const subplebbit = await getStartedSubplebbit(address);
            this._setupStartedEvents(subplebbit, connectionId, subscriptionId);
        } else {
            try {
                startedSubplebbits[address] = "pending";
                const subplebbit = <LocalSubplebbit>await this.plebbit.createSubplebbit({ address });
                this._setupStartedEvents(subplebbit, connectionId, subscriptionId);
                subplebbit.started = true; // a small hack to make sure first update has started=true
                subplebbit.emit("update", subplebbit); // Need to emit an update so rpc user can receive sub props prior to running
                await subplebbit.start();
                startedSubplebbits[address] = subplebbit;
            } catch (e) {
                if (this.subscriptionCleanups?.[connectionId]?.[subscriptionId]) this.subscriptionCleanups[connectionId][subscriptionId]();
                delete startedSubplebbits[address];
                throw e;
            }
        }

        return subscriptionId;
    }

    async stopSubplebbit(params: any) {
        const address = SubplebbitAddressSchema.parse(params[0]);

        const localSubs = this.plebbit.subplebbits;
        if (!localSubs.includes(address)) throwWithErrorCode("ERR_RPC_CLIENT_TRYING_TO_STOP_REMOTE_SUB", { subplebbitAddress: address });
        const isSubStarted = address in startedSubplebbits;
        if (!isSubStarted) throwWithErrorCode("ERR_RPC_CLIENT_TRYING_TO_STOP_SUB_THAT_IS_NOT_RUNNING", { subplebbitAddress: address });
        const startedSubplebbit = await getStartedSubplebbit(address);
        await startedSubplebbit.stop();
        // emit last updates so subscribed instances can set their state to stopped
        await this._postStoppingOrDeleting(startedSubplebbit);
        delete startedSubplebbits[address];

        return true;
    }

    private async _postStoppingOrDeleting(subplebbit: LocalSubplebbit) {
        // emit the last updates
        // remove all listeners
        subplebbit.emit("update", subplebbit);
        subplebbit.emit("startedstatechange", subplebbit.startedState);

        subplebbit.removeAllListeners("challengerequest");
        subplebbit.removeAllListeners("challenge");
        subplebbit.removeAllListeners("challengeanswer");
        subplebbit.removeAllListeners("challengeverification");
        subplebbit.removeAllListeners("update");
        subplebbit.removeAllListeners("startedstatechange");
        subplebbit.removeAllListeners("statechange");
        subplebbit.removeAllListeners("updatingstatechange");
        subplebbit.removeAllListeners("error");
    }

    async editSubplebbit(params: any) {
        const address = SubplebbitAddressSchema.parse(params[0]);
        const replacedProps = replaceXWithY(params[1], null, undefined);
        const editSubplebbitOptions = parseSubplebbitEditOptionsSchemaWithPlebbitErrorIfItFails(replacedProps);

        const localSubs = this.plebbit.subplebbits;
        if (!localSubs.includes(address)) throwWithErrorCode("ERR_RPC_CLIENT_TRYING_TO_EDIT_REMOTE_SUB", { subplebbitAddress: address });
        let subplebbit: LocalSubplebbit;
        if (startedSubplebbits[address] instanceof LocalSubplebbit) subplebbit = <LocalSubplebbit>startedSubplebbits[address];
        else {
            subplebbit = <LocalSubplebbit>await this.plebbit.createSubplebbit({ address });
            subplebbit.once("error", (error: PlebbitError | Error) => {
                log.error("RPC server Received an error on subplebbit", subplebbit.address, "edit", error);
            });
        }

        await subplebbit.edit(editSubplebbitOptions);
        if (editSubplebbitOptions.address && startedSubplebbits[address]) {
            startedSubplebbits[editSubplebbitOptions.address] = startedSubplebbits[address];
            delete startedSubplebbits[address];
        }
        if (typeof subplebbit.updatedAt === "number") return subplebbit.toJSONInternalRpcAfterFirstUpdate();
        else return subplebbit.toJSONInternalRpcBeforeFirstUpdate();
    }

    async deleteSubplebbit(params: any) {
        const address = SubplebbitAddressSchema.parse(params[0]);

        const addresses = this.plebbit.subplebbits;
        if (!addresses.includes(address)) throwWithErrorCode("ERR_RPC_CLIENT_TRYING_TO_DELETE_REMOTE_SUB", { subplebbitAddress: address });

        const isSubStarted = address in startedSubplebbits;
        const subplebbit = isSubStarted
            ? await getStartedSubplebbit(address)
            : <LocalSubplebbit>await this.plebbit.createSubplebbit({ address });
        await subplebbit.delete();
        await this._postStoppingOrDeleting(subplebbit);
        delete startedSubplebbits[address];

        return true;
    }

    async subplebbitsSubscribe(params: any, connectionId: string) {
        const subscriptionId = generateSubscriptionId();
        const sendEvent = (event: string, result: any) => {
            this.jsonRpcSendNotification({
                method: "subplebbitsNotification",
                subscription: Number(subscriptionId),
                event,
                result,
                connectionId
            });
        };

        const plebbitSubscribeEvent = (newSubs: string[]) => sendEvent("subplebbitschange", newSubs);

        this.plebbit.on("subplebbitschange", plebbitSubscribeEvent);

        this.subscriptionCleanups[connectionId][subscriptionId] = () =>
            this.plebbit.removeListener("subplebbitschange", plebbitSubscribeEvent);

        sendEvent("subplebbitschange", this.plebbit.subplebbits);

        return subscriptionId;
    }

    async fetchCid(params: any) {
        const cid = parseCidStringSchemaWithPlebbitErrorIfItFails(params[0]);
        const res = await this.plebbit.fetchCid(cid);
        if (typeof res !== "string") throw Error("Result of fetchCid should be a string");
        return res;
    }

    private _getCurrentSettings(): PlebbitWsServerSettingsSerialized {
        const plebbitOptions = this.plebbit.parsedPlebbitOptions;
        const challenges = remeda.mapValues(PlebbitJs.Plebbit.challenges, (challengeFactory) =>
            remeda.omit(challengeFactory({}), ["getChallenge"])
        );

        const rpcSettings = <PlebbitWsServerSettingsSerialized>{ plebbitOptions, challenges };
        return rpcSettings;
    }

    async settingsSubscribe(params: any, connectionId: string): Promise<number> {
        const subscriptionId = generateSubscriptionId();
        const sendEvent = (event: string, result: any) => {
            this.jsonRpcSendNotification({
                method: "settingsNotification",
                subscription: Number(subscriptionId),
                event,
                result,
                connectionId
            });
        };

        const sendRpcSettings = () => {
            sendEvent("settingschange", this._getCurrentSettings());
        };

        this.subscriptionCleanups[connectionId][subscriptionId] = () => {
            delete this._onSettingsChange[connectionId][subscriptionId];
        };

        this._onSettingsChange[connectionId][subscriptionId] = sendRpcSettings;
        sendRpcSettings();

        return subscriptionId;
    }

    private _initPlebbit(plebbit: Plebbit) {
        this.plebbit = plebbit;
        plebbit.on("error", (error: any) => log.error("RPC server", "Received an error on plebbit instance", error));
    }

    private async _createPlebbitInstanceFromSetSettings(newOptions: InputPlebbitOptions) {
        return PlebbitJs.Plebbit(newOptions);
    }

    async setSettings(params: any) {
        const settings = parseSetNewSettingsPlebbitWsServerSchemaWithPlebbitErrorIfItFails(params[0]);
        if (deterministicStringify(settings.plebbitOptions) === deterministicStringify(this._getCurrentSettings().plebbitOptions)) {
            log("RPC client called setSettings with the same settings as the current one, aborting");
            return true;
        }

        log(`RPC client called setSettings, the clients need to call all subscription methods again`);
        await this.plebbit.destroy(); // make sure to destroy previous fs watcher before changing the instance

        this._initPlebbit(await this._createPlebbitInstanceFromSetSettings(settings.plebbitOptions));

        // restart all started subplebbits with new plebbit options
        for (const address in startedSubplebbits) {
            const startedSubplebbit = await getStartedSubplebbit(address);
            try {
                await startedSubplebbit.stop();
            } catch (error) {
                log.error("setPlebbitOptions failed stopping subplebbit", { error, address, params });
            }
            try {
                startedSubplebbits[address] = <LocalSubplebbit>await this.plebbit.createSubplebbit({ address });
                await (<LocalSubplebbit>startedSubplebbits[address]).start();
            } catch (error) {
                log.error("setPlebbitOptions failed restarting subplebbit", { error, address, params });
            }
        }

        // send a settingsNotification to all subscribers
        for (const connectionId of remeda.keys.strict(this._onSettingsChange))
            for (const subscriptionId of remeda.keys.strict(this._onSettingsChange[connectionId]))
                await this._onSettingsChange[connectionId][subscriptionId]();

        // TODO: possibly restart all updating comment/subplebbit subscriptions with new plebbit options,
        // not sure if needed because plebbit-react-hooks clients can just reload the page, low priority

        return true;
    }

    async commentUpdateSubscribe(params: any, connectionId: string) {
        const cid = parseCidStringSchemaWithPlebbitErrorIfItFails(params[0]);
        const subscriptionId = generateSubscriptionId();

        const sendEvent = (event: string, result: any) =>
            this.jsonRpcSendNotification({
                method: "commentUpdateNotification",
                subscription: subscriptionId,
                event,
                result,
                connectionId
            });

        let sentCommentIpfsUpdateEvent = false;
        const comment = await this.plebbit.createComment({ cid });
        const sendUpdate = () => {
            if (!sentCommentIpfsUpdateEvent && comment.raw.comment) {
                const commentIpfsRecord = comment.toJSONIpfs();
                sendEvent("update", commentIpfsRecord);
                sentCommentIpfsUpdateEvent = true;
            }
            if (comment.raw.commentUpdate) {
                sendEvent("update", comment.raw.commentUpdate);
            }
        };
        const updateListener = () => sendUpdate();
        comment.on("update", updateListener);

        const updatingStateListener = () => sendEvent("updatingstatechange", comment.updatingState);
        comment.on("updatingstatechange", updatingStateListener);

        const stateListener = () => sendEvent("statechange", comment.state);
        comment.on("statechange", stateListener);

        const errorListener = (error: PlebbitError | Error) => {
            const errorWithNewUpdatingState = error as CommentRpcErrorToTransmit;
            if (comment.state === "publishing")
                errorWithNewUpdatingState.details = { ...errorWithNewUpdatingState.details, newPublishingState: comment.publishingState };
            else if (comment.state === "updating")
                errorWithNewUpdatingState.details = { ...errorWithNewUpdatingState.details, newUpdatingState: comment.updatingState };
            sendEvent("error", errorWithNewUpdatingState);
        };
        comment.on("error", errorListener);

        // cleanup function
        this.subscriptionCleanups[connectionId][subscriptionId] = () => {
            comment.removeListener("update", updateListener);
            comment.removeListener("updatingstatechange", updatingStateListener);
            comment.removeListener("statechange", stateListener);
            comment.removeListener("error", errorListener);
            comment.stop().catch((error) => log.error("commentUpdate stop error", { error, params }));
        };

        // if fail, cleanup
        try {
            sendUpdate();
            await comment.update();
        } catch (e) {
            this.subscriptionCleanups[connectionId][subscriptionId]();
            throw e;
        }

        return subscriptionId;
    }

    async subplebbitUpdateSubscribe(params: any, connectionId: string) {
        const address = SubplebbitAddressSchema.parse(params[0]);
        const subscriptionId = generateSubscriptionId();

        const sendEvent = (event: string, result: any) =>
            this.jsonRpcSendNotification({
                method: "subplebbitUpdateNotification",
                subscription: subscriptionId,
                event,
                result,
                connectionId
            });

        const isSubStarted = address in startedSubplebbits;
        const subplebbit = isSubStarted
            ? await getStartedSubplebbit(address)
            : <LocalSubplebbit | RemoteSubplebbit>await this.plebbit.createSubplebbit({ address });

        const sendSubJson = () => {
            let jsonToSend:
                | RpcRemoteSubplebbitType
                | RpcInternalSubplebbitRecordAfterFirstUpdateType
                | RpcInternalSubplebbitRecordBeforeFirstUpdateType;
            if (subplebbit instanceof LocalSubplebbit)
                jsonToSend =
                    typeof subplebbit.updatedAt === "number"
                        ? subplebbit.toJSONInternalRpcAfterFirstUpdate()
                        : subplebbit.toJSONInternalRpcBeforeFirstUpdate();
            else jsonToSend = subplebbit.toJSONRpcRemote();

            sendEvent("update", jsonToSend);
        };

        const updateListener = () => sendSubJson();
        subplebbit.on("update", updateListener);

        const updatingStateListener = () => sendEvent("updatingstatechange", subplebbit.updatingState);
        subplebbit.on("updatingstatechange", updatingStateListener);

        // listener for startestatechange
        const startedStateListener = () => sendEvent("updatingstatechange", subplebbit.startedState);
        if (isSubStarted) subplebbit.on("startedstatechange", startedStateListener);

        const errorListener = (error: PlebbitError | Error) => {
            const rpcError = error as SubplebbitRpcErrorToTransmit;
            if (subplebbit.state === "started") rpcError.details = { ...rpcError.details, newStartedState: subplebbit.startedState };
            else if (subplebbit.state === "updating")
                rpcError.details = { ...rpcError.details, newUpdatingState: subplebbit.updatingState };
            log("subplebbit rpc error", rpcError);
            sendEvent("error", rpcError);
        };
        subplebbit.on("error", errorListener);

        // cleanup function
        this.subscriptionCleanups[connectionId][subscriptionId] = () => {
            subplebbit.removeListener("update", updateListener);
            subplebbit.removeListener("updatingstatechange", updatingStateListener);
            subplebbit.removeListener("error", errorListener);
            subplebbit.removeListener("startedstatechange", startedStateListener);

            // We don't wanna stop the local sub if it's running already, this function is just for fetching updates
            if (!isSubStarted && subplebbit.state !== "stopped")
                subplebbit.stop().catch((error) => log.error("subplebbitUpdate stop error", { error, params }));
        };

        // if fail, cleanup
        try {
            // need to send an update with first subplebbitUpdate if it's a local sub
            if ("signer" in subplebbit || subplebbit.raw.subplebbitIpfs) sendSubJson();

            // No need to call .update() if it's already running locally because we're listening to update event
            if (!isSubStarted) await subplebbit.update();
        } catch (e) {
            this.subscriptionCleanups[connectionId][subscriptionId]();
            throw e;
        }

        return subscriptionId;
    }

    private async _createCommentInstanceFromPublishCommentParams(params: CommentChallengeRequestToEncryptType) {
        const comment = await this.plebbit.createComment(params.comment);
        comment.challengeRequest = remeda.omit(params, ["comment"]);
        return comment;
    }

    async publishComment(params: any, connectionId: string): Promise<RpcPublishResult> {
        const publishOptions = parseCommentChallengeRequestToEncryptSchemaWithPlebbitErrorIfItFails(params[0]);

        const subscriptionId = generateSubscriptionId();

        const sendEvent = (event: string, result: any) =>
            this.jsonRpcSendNotification({
                method: "publishCommentNotification",
                subscription: subscriptionId,
                event,
                result,
                connectionId
            });

        const comment = await this._createCommentInstanceFromPublishCommentParams(publishOptions);
        this.publishing[subscriptionId] = comment;
        const challengeListener = (challenge: DecryptedChallengeMessageType) => sendEvent("challenge", encodeChallengeMessage(challenge));
        comment.on("challenge", challengeListener);

        const challengeAnswerListener = (answer: DecryptedChallengeAnswerMessageType) =>
            sendEvent("challengeanswer", encodeChallengeAnswerMessage(answer));
        comment.on("challengeanswer", challengeAnswerListener);

        const challengeRequestListener = (request: DecryptedChallengeRequestMessageType) =>
            sendEvent("challengerequest", encodeChallengeRequest(request));
        comment.on("challengerequest", challengeRequestListener);

        const challengeVerificationListener = (challengeVerification: DecryptedChallengeVerificationMessageType) =>
            sendEvent("challengeverification", encodeChallengeVerificationMessage(challengeVerification));
        comment.on("challengeverification", challengeVerificationListener);

        const publishingStateListener = () => {
            sendEvent("publishingstatechange", comment.publishingState);
        };
        comment.on("publishingstatechange", publishingStateListener);

        const stateListener = () => sendEvent("statechange", comment.state);
        comment.on("statechange", stateListener);

        const errorListener = (error: PlebbitError | Error) => {
            const commentRpcError = error as CommentRpcErrorToTransmit;
            commentRpcError.details = {
                ...commentRpcError.details,
                newPublishingState: comment.publishingState
            };
            sendEvent("error", commentRpcError);
        };
        comment.on("error", errorListener);

        // cleanup function
        this.subscriptionCleanups[connectionId][subscriptionId] = () => {
            comment.removeListener("challenge", challengeListener);
            comment.removeListener("challengeanswer", challengeAnswerListener);
            comment.removeListener("challengerequest", challengeRequestListener);
            comment.removeListener("challengeverification", challengeVerificationListener);
            comment.removeListener("publishingstatechange", publishingStateListener);
            comment.removeListener("statechange", stateListener);
            comment.removeListener("error", errorListener);
            delete this.publishing[subscriptionId];
            comment.stop().catch((error) => log.error("publishComment stop error", { error, params }));
        };

        // if fail, cleanup

        try {
            await comment.publish();
        } catch (e) {
            const error = e as PublicationRpcErrorToTransmit;
            error.details = { ...error.details, publishThrowError: true };
            errorListener(error);
            this.subscriptionCleanups[connectionId][subscriptionId]();
            return subscriptionId;
        }

        return subscriptionId;
    }

    private async _createVoteInstanceFromPublishVoteParams(params: VoteChallengeRequestToEncryptType) {
        const vote = await this.plebbit.createVote(params.vote);
        vote.challengeRequest = remeda.omit(params, ["vote"]);
        return vote;
    }
    async publishVote(params: any, connectionId: string): Promise<RpcPublishResult> {
        const publishOptions = parseVoteChallengeRequestToEncryptSchemaWithPlebbitErrorIfItFails(params[0]);

        const subscriptionId = generateSubscriptionId();

        const sendEvent = (event: string, result: any) =>
            this.jsonRpcSendNotification({ method: "publishVoteNotification", subscription: subscriptionId, event, result, connectionId });

        const vote = await this._createVoteInstanceFromPublishVoteParams(publishOptions);
        this.publishing[subscriptionId] = vote;
        vote.on("challenge", (challenge) => sendEvent("challenge", encodeChallengeMessage(challenge)));
        vote.on("challengeanswer", (answer) => sendEvent("challengeanswer", encodeChallengeAnswerMessage(answer)));
        vote.on("challengerequest", (request) => sendEvent("challengerequest", encodeChallengeRequest(request)));
        vote.on("challengeverification", (challengeVerification) =>
            sendEvent("challengeverification", encodeChallengeVerificationMessage(challengeVerification))
        );
        vote.on("publishingstatechange", () => sendEvent("publishingstatechange", vote.publishingState));

        const errorListener = (error: PlebbitError | Error) => {
            const voteRpcError = error as PublicationRpcErrorToTransmit;
            voteRpcError.details = { ...voteRpcError.details, newPublishingState: vote.publishingState };
            sendEvent("error", voteRpcError);
        };
        vote.on("error", errorListener);

        // cleanup function
        this.subscriptionCleanups[connectionId][subscriptionId] = () => {
            delete this.publishing[subscriptionId];
            vote.stop().catch((error: any) => log.error("publishVote stop error", { error, params }));
            vote.removeAllListeners("challenge");
            vote.removeAllListeners("challengeanswer");
            vote.removeAllListeners("challengerequest");
            vote.removeAllListeners("challengeverification");
            vote.removeAllListeners("publishingstatechange");
            vote.removeListener("error", errorListener);
        };

        // if fail, cleanup
        try {
            await vote.publish();
        } catch (e) {
            const error = e as PublicationRpcErrorToTransmit;
            error.details = { ...error.details, publishThrowError: true };
            errorListener(error);
            this.subscriptionCleanups[connectionId][subscriptionId]();
        }

        return subscriptionId;
    }

    private async _createSubplebbitEditInstanceFromPublishSubplebbitEditParams(params: SubplebbitEditChallengeRequestToEncryptType) {
        const subplebbitEdit = await this.plebbit.createSubplebbitEdit(params.subplebbitEdit);
        subplebbitEdit.challengeRequest = remeda.omit(params, ["subplebbitEdit"]);
        return subplebbitEdit;
    }

    async publishSubplebbitEdit(params: any, connectionId: string): Promise<RpcPublishResult> {
        const publishOptions = parseSubplebbitEditChallengeRequestToEncryptSchemaWithPlebbitErrorIfItFails(params[0]);

        const subscriptionId = generateSubscriptionId();

        const sendEvent = (event: string, result: any) =>
            this.jsonRpcSendNotification({
                method: "publishSubplebbitEditNotification",
                subscription: subscriptionId,
                event,
                result,
                connectionId
            });

        const subplebbitEdit = await this._createSubplebbitEditInstanceFromPublishSubplebbitEditParams(publishOptions);
        this.publishing[subscriptionId] = subplebbitEdit;
        subplebbitEdit.on("challenge", (challenge) => sendEvent("challenge", encodeChallengeMessage(challenge)));
        subplebbitEdit.on("challengeanswer", (answer) => sendEvent("challengeanswer", encodeChallengeAnswerMessage(answer)));
        subplebbitEdit.on("challengerequest", (request) => sendEvent("challengerequest", encodeChallengeRequest(request)));
        subplebbitEdit.on("challengeverification", (challengeVerification) =>
            sendEvent("challengeverification", encodeChallengeVerificationMessage(challengeVerification))
        );
        subplebbitEdit.on("publishingstatechange", () => sendEvent("publishingstatechange", subplebbitEdit.publishingState));

        const errorListener = (error: PlebbitError | Error) => {
            const editRpcError = error as PublicationRpcErrorToTransmit;
            editRpcError.details = { ...editRpcError.details, newPublishingState: subplebbitEdit.publishingState };
            sendEvent("error", editRpcError);
        };
        subplebbitEdit.on("error", errorListener);

        // cleanup function
        this.subscriptionCleanups[connectionId][subscriptionId] = () => {
            delete this.publishing[subscriptionId];
            subplebbitEdit.stop().catch((error: any) => log.error("publishSubplebbitEdit stop error", { error, params }));
            subplebbitEdit.removeAllListeners("challenge");
            subplebbitEdit.removeAllListeners("challengeanswer");
            subplebbitEdit.removeAllListeners("challengerequest");
            subplebbitEdit.removeAllListeners("challengeverification");
            subplebbitEdit.removeAllListeners("publishingstatechange");
            subplebbitEdit.removeListener("error", errorListener);
        };

        // if fail, cleanup
        try {
            await subplebbitEdit.publish();
        } catch (e) {
            const error = e as PublicationRpcErrorToTransmit;
            error.details = { ...error.details, publishThrowError: true };
            errorListener(error);
            this.subscriptionCleanups[connectionId][subscriptionId]();
        }

        return subscriptionId;
    }

    private async _createCommentEditInstanceFromPublishCommentEditParams(params: CommentEditChallengeRequestToEncryptType) {
        const commentEdit = await this.plebbit.createCommentEdit(params.commentEdit);
        commentEdit.challengeRequest = remeda.omit(params, ["commentEdit"]);
        return commentEdit;
    }

    async publishCommentEdit(params: any, connectionId: string): Promise<RpcPublishResult> {
        const publishOptions = parseCommentEditChallengeRequestToEncryptSchemaWithPlebbitErrorIfItFails(params[0]);
        const subscriptionId = generateSubscriptionId();

        const sendEvent = (event: string, result: any) =>
            this.jsonRpcSendNotification({
                method: "publishCommentEditNotification",
                subscription: subscriptionId,
                event,
                result,
                connectionId
            });

        const commentEdit = await this._createCommentEditInstanceFromPublishCommentEditParams(publishOptions);
        this.publishing[subscriptionId] = commentEdit;
        commentEdit.on("challenge", (challenge) => sendEvent("challenge", encodeChallengeMessage(challenge)));
        commentEdit.on("challengeanswer", (answer) => sendEvent("challengeanswer", encodeChallengeAnswerMessage(answer)));
        commentEdit.on("challengerequest", (request) => sendEvent("challengerequest", encodeChallengeRequest(request)));
        commentEdit.on("challengeverification", (challengeVerification) =>
            sendEvent("challengeverification", encodeChallengeVerificationMessage(challengeVerification))
        );
        commentEdit.on("publishingstatechange", () => sendEvent("publishingstatechange", commentEdit.publishingState));

        const errorListener = (error: PlebbitError | Error) => {
            const commentEditRpcError = error as PublicationRpcErrorToTransmit;
            commentEditRpcError.details = {
                ...commentEditRpcError.details,
                newPublishingState: commentEdit.publishingState
            };
            sendEvent("error", commentEditRpcError);
        };
        commentEdit.on("error", errorListener);

        // cleanup function
        this.subscriptionCleanups[connectionId][subscriptionId] = () => {
            delete this.publishing[subscriptionId];
            commentEdit.stop().catch((error: any) => log.error("publishCommentEdit stop error", { error, params }));
            commentEdit.removeAllListeners("challengerequest");
            commentEdit.removeAllListeners("challenge");
            commentEdit.removeAllListeners("challengeanswer");
            commentEdit.removeAllListeners("challengeverification");
            commentEdit.removeAllListeners("publishingstatechange");
            commentEdit.removeListener("error", errorListener);
        };

        // if fail, cleanup
        try {
            await commentEdit.publish();
        } catch (e) {
            const error = e as PublicationRpcErrorToTransmit;
            error.details = { ...error.details, publishThrowError: true };
            errorListener(error);
            this.subscriptionCleanups[connectionId][subscriptionId]();
        }

        return subscriptionId;
    }

    private async _createCommentModerationInstanceFromPublishCommentModerationParams(params: CommentModerationChallengeRequestToEncrypt) {
        const commentModeration = await this.plebbit.createCommentModeration(params.commentModeration);
        commentModeration.challengeRequest = remeda.omit(params, ["commentModeration"]);
        return commentModeration;
    }

    async publishCommentModeration(params: any, connectionId: string): Promise<RpcPublishResult> {
        const publishOptions = parseCommentModerationChallengeRequestToEncryptSchemaWithPlebbitErrorIfItFails(params[0]);
        const subscriptionId = generateSubscriptionId();

        const sendEvent = (event: string, result: any) =>
            this.jsonRpcSendNotification({
                method: "publishCommentModerationNotification",
                subscription: subscriptionId,
                event,
                result,
                connectionId
            });

        const commentMod = await this._createCommentModerationInstanceFromPublishCommentModerationParams(publishOptions);

        this.publishing[subscriptionId] = commentMod;
        commentMod.on("challenge", (challenge) => sendEvent("challenge", encodeChallengeMessage(challenge)));
        commentMod.on("challengeanswer", (answer) => sendEvent("challengeanswer", encodeChallengeAnswerMessage(answer)));
        commentMod.on("challengerequest", (request) => sendEvent("challengerequest", encodeChallengeRequest(request)));
        commentMod.on("challengeverification", (challengeVerification) =>
            sendEvent("challengeverification", encodeChallengeVerificationMessage(challengeVerification))
        );
        commentMod.on("publishingstatechange", () => sendEvent("publishingstatechange", commentMod.publishingState));

        const errorListener = (error: PlebbitError | Error) => {
            const commentModRpcError = error as PublicationRpcErrorToTransmit;
            commentModRpcError.details = {
                ...commentModRpcError.details,
                newPublishingState: commentMod.publishingState
            };
            sendEvent("error", commentModRpcError);
        };
        commentMod.on("error", errorListener);

        // cleanup function
        this.subscriptionCleanups[connectionId][subscriptionId] = () => {
            delete this.publishing[subscriptionId];
            commentMod.stop().catch((error: any) => log.error("publishCommentModeration stop error", { error, params }));
            commentMod.removeAllListeners("challengerequest");
            commentMod.removeAllListeners("challenge");
            commentMod.removeAllListeners("challengeanswer");
            commentMod.removeAllListeners("challengeverification");
            commentMod.removeAllListeners("publishingstatechange");
        };

        // if fail, cleanup
        try {
            await commentMod.publish();
        } catch (e) {
            const error = e as PublicationRpcErrorToTransmit;
            error.details = { ...error.details, publishThrowError: true };
            errorListener(error);
            this.subscriptionCleanups[connectionId][subscriptionId]();
        }

        return subscriptionId;
    }

    async publishChallengeAnswers(params: any) {
        const subscriptionId = SubscriptionIdSchema.parse(params[0]);
        const decryptedChallengeAnswers = parseDecryptedChallengeAnswerWithPlebbitErrorIfItFails(params[1]);

        if (!this.publishing[subscriptionId]) {
            throw Error(`no subscription with id '${subscriptionId}'`);
        }
        const publication = this.publishing[subscriptionId];

        await publication.publishChallengeAnswers(decryptedChallengeAnswers.challengeAnswers);

        return true;
    }

    async resolveAuthorAddress(params: any) {
        const authorAddress = AuthorAddressSchema.parse(params[0]);
        const resolvedAuthorAddress = await this.plebbit.resolveAuthorAddress(authorAddress);
        return resolvedAuthorAddress;
    }

    async unsubscribe(params: any, connectionId: string) {
        const subscriptionId = SubscriptionIdSchema.parse(params[0]);

        if (!this.subscriptionCleanups[connectionId][subscriptionId]) return true;

        this.subscriptionCleanups[connectionId][subscriptionId]();
        delete this.subscriptionCleanups[connectionId][subscriptionId];
        return true;
    }

    async destroy() {
        for (const connectionId of remeda.keys.strict(this.subscriptionCleanups))
            for (const subscriptionId of remeda.keys.strict(this.subscriptionCleanups[connectionId]))
                await this.unsubscribe([Number(subscriptionId)], connectionId);

        this.ws.close();
        await this.plebbit.destroy(); // this will stop all started subplebbits
        for (const subplebbitAddress of remeda.keys.strict(startedSubplebbits)) {
            delete startedSubplebbits[subplebbitAddress];
        }
        this._onSettingsChange = {};
    }
}

const createPlebbitWsServer = async (options: CreatePlebbitWsServerOptions) => {
    const parsedOptions = parseCreatePlebbitWsServerOptionsSchemaWithPlebbitErrorIfItFails(options);
    const plebbit = await PlebbitJs.Plebbit(parsedOptions.plebbitOptions);

    const plebbitWss = new PlebbitWsServer({
        plebbit,
        port: parsedOptions.port,
        server: parsedOptions.server,
        authKey: parsedOptions.authKey
    });

    return plebbitWss;
};

const PlebbitRpc = {
    PlebbitWsServer: createPlebbitWsServer,
    // for mocking plebbit-js during tests
    setPlebbitJs
};

export default PlebbitRpc;
