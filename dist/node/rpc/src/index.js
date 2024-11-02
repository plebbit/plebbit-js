import { Server as RpcWebsocketsServer } from "rpc-websockets";
import PlebbitJs, { setPlebbitJs } from "./lib/plebbit-js/index.js";
import { encodeChallengeAnswerMessage, encodeChallengeMessage, encodeChallengeRequest, encodeChallengeVerificationMessage, generateSubscriptionId } from "./utils.js";
import Logger from "@plebbit/plebbit-logger";
import { EventEmitter } from "events";
import { PlebbitError } from "../../plebbit-error.js";
import { LocalSubplebbit } from "../../runtime/node/subplebbit/local-subplebbit.js";
import { hideClassPrivateProps, replaceXWithY, throwWithErrorCode } from "../../util.js";
import * as remeda from "remeda";
import { AuthorAddressSchema, SubplebbitAddressSchema } from "../../schema/schema.js";
import { SubscriptionIdSchema } from "../../clients/rpc-client/schema.js";
import { parseCidStringSchemaWithPlebbitErrorIfItFails, parseCommentChallengeRequestToEncryptSchemaWithPlebbitErrorIfItFails, parseCommentEditChallengeRequestToEncryptSchemaWithPlebbitErrorIfItFails, parseCommentModerationChallengeRequestToEncryptSchemaWithPlebbitErrorIfItFails, parseCreateNewLocalSubplebbitUserOptionsSchemaWithPlebbitErrorIfItFails, parseCreatePlebbitWsServerOptionsSchemaWithPlebbitErrorIfItFails, parseDecryptedChallengeAnswerWithPlebbitErrorIfItFails, parseSetNewSettingsPlebbitWsServerSchemaWithPlebbitErrorIfItFails, parseSubplebbitEditOptionsSchemaWithPlebbitErrorIfItFails, parseVoteChallengeRequestToEncryptSchemaWithPlebbitErrorIfItFails } from "../../schema/schema-util.js";
import { stringify as deterministicStringify } from "safe-stable-stringify";
// store started subplebbits  to be able to stop them
// store as a singleton because not possible to start the same sub twice at the same time
const startedSubplebbits = {};
const getStartedSubplebbit = async (address) => {
    if (!(address in startedSubplebbits))
        throw Error("Can't call getStartedSubplebbit when the sub hasn't been started");
    // if pending, wait until no longer pendng
    while (startedSubplebbits[address] === "pending") {
        await new Promise((r) => setTimeout(r, 20));
    }
    return startedSubplebbits[address];
};
const log = Logger("plebbit-js-rpc:plebbit-ws-server");
class PlebbitWsServer extends EventEmitter {
    constructor({ port, server, plebbit, authKey }) {
        super();
        this.connections = {};
        this.subscriptionCleanups = {};
        // store publishing publications so they can be used by publishChallengeAnswers
        this.publishing = {};
        this._getIpFromConnectionRequest = (req) => req.socket.remoteAddress; // we set it up here so we can mock it in tests
        this._onSettingsChange = {};
        const log = Logger("plebbit-js:PlebbitWsServer");
        this.authKey = authKey;
        // don't instantiate plebbit in constructor because it's an async function
        this.plebbit = plebbit;
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
                    log(`Rejecting RPC connection request from`, requestOriginatorIp, `rejected because there is no auth key, url:`, req.url);
                    callback(false, 403, "You need to set the auth key to connect remotely");
                }
                else
                    callback(true);
            }
        });
        // rpc-sockets uses this library https://www.npmjs.com/package/ws
        this.ws = this.rpcWebsockets.wss;
        // forward errors to PlebbitWsServer
        this.rpcWebsockets.on("error", (error) => {
            this.emit("error", error);
        });
        this.plebbit.on("error", (error) => {
            this.emit("error", error);
        });
        this.on("error", (err) => {
            log.error(err);
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
        this.rpcWebsocketsRegister("publishVote", this.publishVote.bind(this));
        this.rpcWebsocketsRegister("publishCommentEdit", this.publishCommentEdit.bind(this));
        this.rpcWebsocketsRegister("publishCommentModeration", this.publishCommentModeration.bind(this));
        this.rpcWebsocketsRegister("publishChallengeAnswers", this.publishChallengeAnswers.bind(this));
        this.rpcWebsocketsRegister("unsubscribe", this.unsubscribe.bind(this));
        hideClassPrivateProps(this);
    }
    // util function to log errors of registered methods
    rpcWebsocketsRegister(method, callback) {
        const callbackWithErrorHandled = async (params, connectionId) => {
            try {
                const res = await callback(params, connectionId);
                return res;
            }
            catch (e) {
                log.error(`${callback.name} error`, { params, error: e });
                // We need to stringify the error here because rpc-websocket will remove props from PlebbitError
                const errorJson = JSON.parse(JSON.stringify(e));
                delete errorJson["stack"];
                throw errorJson;
            }
        };
        this.rpcWebsockets.register(method, callbackWithErrorHandled);
        // register localhost:9138/<auth-key> to bypass block on non-localhost requests, using /<auth-key> as namespace
        if (this.authKey) {
            this.rpcWebsockets.register(method, callbackWithErrorHandled, `/${this.authKey}`);
        }
    }
    // send json rpc notification message (no id field, but must have subscription id)
    jsonRpcSendNotification({ method, result, subscription, event, connectionId }) {
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
    async getComment(params) {
        const cid = parseCidStringSchemaWithPlebbitErrorIfItFails(params[0]);
        const comment = await this.plebbit.getComment(cid);
        return comment.toJSONIpfs();
    }
    async getSubplebbitPage(params) {
        const pageCid = parseCidStringSchemaWithPlebbitErrorIfItFails(params[0]);
        const subplebbitAddress = SubplebbitAddressSchema.parse(params[1]);
        // Use started subplebbit to fetch the page if possible, to expediete the process
        const sub = subplebbitAddress in startedSubplebbits
            ? await getStartedSubplebbit(subplebbitAddress)
            : await this.plebbit.createSubplebbit({ address: subplebbitAddress });
        const page = await sub.posts._fetchAndVerifyPage(pageCid);
        return page;
    }
    async getCommentPage(params) {
        const pageCid = parseCidStringSchemaWithPlebbitErrorIfItFails(params[0]);
        const commentCid = parseCidStringSchemaWithPlebbitErrorIfItFails(params[1]);
        const subplebbitAddress = SubplebbitAddressSchema.parse(params[2]);
        const comment = await this.plebbit.createComment({ cid: commentCid, subplebbitAddress });
        const page = await comment.replies._fetchAndVerifyPage(pageCid);
        return page;
    }
    async createSubplebbit(params) {
        const createSubplebbitOptions = parseCreateNewLocalSubplebbitUserOptionsSchemaWithPlebbitErrorIfItFails(params[0]);
        const subplebbit = await this.plebbit.createSubplebbit(createSubplebbitOptions);
        if (!(subplebbit instanceof LocalSubplebbit))
            throw Error("Failed to create a local subplebbit. This is a critical error");
        return subplebbit.toJSONInternalRpcBeforeFirstUpdate();
    }
    _setupStartedEvents(subplebbit, connectionId, subscriptionId) {
        const sendEvent = (event, result) => this.jsonRpcSendNotification({ method: "startSubplebbit", subscription: subscriptionId, event, result, connectionId });
        const getUpdateJson = () => typeof subplebbit.updatedAt === "number"
            ? subplebbit.toJSONInternalRpcAfterFirstUpdate()
            : subplebbit.toJSONInternalRpcBeforeFirstUpdate();
        const updateListener = () => sendEvent("update", getUpdateJson());
        subplebbit.on("update", updateListener);
        const startedStateListener = () => sendEvent("startedstatechange", subplebbit.startedState);
        subplebbit.on("startedstatechange", startedStateListener);
        const requestListener = (request) => sendEvent("challengerequest", encodeChallengeRequest(request));
        subplebbit.on("challengerequest", requestListener);
        const challengeListener = (challenge) => sendEvent("challenge", encodeChallengeMessage(challenge));
        subplebbit.on("challenge", challengeListener);
        const challengeAnswerListener = (answer) => sendEvent("challengeanswer", encodeChallengeAnswerMessage(answer));
        subplebbit.on("challengeanswer", challengeAnswerListener);
        const challengeVerificationListener = (challengeVerification) => sendEvent("challengeverification", encodeChallengeVerificationMessage(challengeVerification));
        subplebbit.on("challengeverification", challengeVerificationListener);
        const errorListener = (error) => sendEvent("error", error);
        subplebbit.on("error", errorListener);
        // cleanup function
        this.subscriptionCleanups[connectionId][subscriptionId] = () => {
            subplebbit.removeListener("update", updateListener);
            subplebbit.removeListener("startedstatechange", startedStateListener);
            subplebbit.removeListener("challengerequest", requestListener);
            subplebbit.removeListener("challenge", challengeListener);
            subplebbit.removeListener("challengeanswer", challengeAnswerListener);
            subplebbit.removeListener("challengeverification", challengeVerificationListener);
        };
    }
    async startSubplebbit(params, connectionId) {
        const address = SubplebbitAddressSchema.parse(params[0]);
        const localSubs = this.plebbit.subplebbits;
        if (!localSubs.includes(address))
            throwWithErrorCode("ERR_RPC_CLIENT_ATTEMPTING_TO_START_A_REMOTE_SUB", { subplebbitAddress: address });
        const subscriptionId = generateSubscriptionId();
        const isSubStarted = address in startedSubplebbits;
        if (isSubStarted) {
            const subplebbit = await getStartedSubplebbit(address);
            this._setupStartedEvents(subplebbit, connectionId, subscriptionId);
        }
        else {
            try {
                startedSubplebbits[address] = "pending";
                const subplebbit = await this.plebbit.createSubplebbit({ address });
                this._setupStartedEvents(subplebbit, connectionId, subscriptionId);
                subplebbit.started = true; // a small hack to make sure first update has started=true
                subplebbit.emit("update", subplebbit); // Need to emit an update so rpc user can receive sub props prior to running
                await subplebbit.start();
                startedSubplebbits[address] = subplebbit;
            }
            catch (e) {
                if (this.subscriptionCleanups?.[connectionId]?.[subscriptionId])
                    this.subscriptionCleanups[connectionId][subscriptionId]();
                delete startedSubplebbits[address];
                throw e;
            }
        }
        return subscriptionId;
    }
    async stopSubplebbit(params) {
        const address = SubplebbitAddressSchema.parse(params[0]);
        const localSubs = this.plebbit.subplebbits;
        if (!localSubs.includes(address))
            throwWithErrorCode("ERR_RPC_CLIENT_TRYING_TO_STOP_REMOTE_SUB", { subplebbitAddress: address });
        const isSubStarted = address in startedSubplebbits;
        if (!isSubStarted)
            throwWithErrorCode("ERR_RPC_CLIENT_TRYING_TO_STOP_SUB_THAT_IS_NOT_RUNNING", { subplebbitAddress: address });
        const startedSubplebbit = await getStartedSubplebbit(address);
        await startedSubplebbit.stop();
        // emit last updates so subscribed instances can set their state to stopped
        await this._postStoppingOrDeleting(startedSubplebbit);
        delete startedSubplebbits[address];
        return true;
    }
    async _postStoppingOrDeleting(subplebbit) {
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
    async editSubplebbit(params) {
        const address = SubplebbitAddressSchema.parse(params[0]);
        const replacedProps = replaceXWithY(params[1], null, undefined);
        const editSubplebbitOptions = parseSubplebbitEditOptionsSchemaWithPlebbitErrorIfItFails(replacedProps);
        const localSubs = this.plebbit.subplebbits;
        if (!localSubs.includes(address))
            throwWithErrorCode("ERR_RPC_CLIENT_TRYING_TO_EDIT_REMOTE_SUB", { subplebbitAddress: address });
        let subplebbit;
        if (startedSubplebbits[address] instanceof LocalSubplebbit)
            subplebbit = startedSubplebbits[address];
        else
            subplebbit = await this.plebbit.createSubplebbit({ address });
        await subplebbit.edit(editSubplebbitOptions);
        if (editSubplebbitOptions.address && startedSubplebbits[address]) {
            startedSubplebbits[editSubplebbitOptions.address] = startedSubplebbits[address];
            delete startedSubplebbits[address];
        }
        if (typeof subplebbit.updatedAt === "number")
            return subplebbit.toJSONInternalRpcAfterFirstUpdate();
        else
            return subplebbit.toJSONInternalRpcBeforeFirstUpdate();
    }
    async deleteSubplebbit(params) {
        const address = SubplebbitAddressSchema.parse(params[0]);
        const addresses = this.plebbit.subplebbits;
        if (!addresses.includes(address))
            throwWithErrorCode("ERR_RPC_CLIENT_TRYING_TO_DELETE_REMOTE_SUB", { subplebbitAddress: address });
        const isSubStarted = address in startedSubplebbits;
        const subplebbit = isSubStarted
            ? await getStartedSubplebbit(address)
            : await this.plebbit.createSubplebbit({ address });
        await subplebbit.delete();
        await this._postStoppingOrDeleting(subplebbit);
        delete startedSubplebbits[address];
        return true;
    }
    async subplebbitsSubscribe(params, connectionId) {
        const subscriptionId = generateSubscriptionId();
        const sendEvent = (event, result) => {
            this.jsonRpcSendNotification({
                method: "subplebbitsNotification",
                subscription: Number(subscriptionId),
                event,
                result,
                connectionId
            });
        };
        const plebbitSubscribeEvent = (newSubs) => sendEvent("subplebbitschange", newSubs);
        this.plebbit.on("subplebbitschange", plebbitSubscribeEvent);
        this.subscriptionCleanups[connectionId][subscriptionId] = () => this.plebbit.removeListener("subplebbitschange", plebbitSubscribeEvent);
        sendEvent("subplebbitschange", this.plebbit.subplebbits);
        return subscriptionId;
    }
    async fetchCid(params) {
        const cid = parseCidStringSchemaWithPlebbitErrorIfItFails(params[0]);
        const res = await this.plebbit.fetchCid(cid);
        if (typeof res !== "string")
            throw Error("Result of fetchCid should be a string");
        return res;
    }
    _getCurrentSettings() {
        const plebbitOptions = this.plebbit.parsedPlebbitOptions;
        const challenges = remeda.mapValues(PlebbitJs.Plebbit.challenges, (challengeFactory) => remeda.omit(challengeFactory({}), ["getChallenge"]));
        const rpcSettings = { plebbitOptions, challenges };
        return rpcSettings;
    }
    async settingsSubscribe(params, connectionId) {
        const subscriptionId = generateSubscriptionId();
        const sendEvent = (event, result) => {
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
    async _createPlebbitInstanceFromSetSettings(newOptions) {
        return PlebbitJs.Plebbit(newOptions);
    }
    async setSettings(params) {
        const settings = parseSetNewSettingsPlebbitWsServerSchemaWithPlebbitErrorIfItFails(params[0]);
        if (deterministicStringify(settings.plebbitOptions) === deterministicStringify(this._getCurrentSettings().plebbitOptions)) {
            log("RPC client called setSettings with the same settings as the current one, aborting");
            return true;
        }
        log(`RPC client called setSettings, the clients need to call all subscription methods again`);
        await this.plebbit.destroy(); // make sure to destroy previous fs watcher before changing the instance
        this.plebbit = await this._createPlebbitInstanceFromSetSettings(settings.plebbitOptions);
        this.plebbit.on("error", (error) => {
            this.emit("error", error);
        });
        // restart all started subplebbits with new plebbit options
        for (const address in startedSubplebbits) {
            const startedSubplebbit = await getStartedSubplebbit(address);
            try {
                await startedSubplebbit.stop();
            }
            catch (error) {
                log.error("setPlebbitOptions failed stopping subplebbit", { error, address, params });
            }
            try {
                startedSubplebbits[address] = await this.plebbit.createSubplebbit({ address });
                await startedSubplebbits[address].start();
            }
            catch (error) {
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
    async commentUpdateSubscribe(params, connectionId) {
        const cid = parseCidStringSchemaWithPlebbitErrorIfItFails(params[0]);
        const subscriptionId = generateSubscriptionId();
        const sendEvent = (event, result) => this.jsonRpcSendNotification({
            method: "commentUpdateNotification",
            subscription: subscriptionId,
            event,
            result,
            connectionId
        });
        const comment = await this.plebbit.createComment({ cid });
        comment.on("update", () => {
            if (typeof comment.updatedAt === "number") {
                const commentUpdateRecord = comment._rawCommentUpdate;
                if (!commentUpdateRecord)
                    throw Error("comment._rawCommentUpdate should be available if updatedAt is defined");
                sendEvent("update", commentUpdateRecord);
            }
            else {
                const commentIpfsRecord = comment.toJSONIpfs();
                sendEvent("update", commentIpfsRecord);
            }
        });
        comment.on("updatingstatechange", () => sendEvent("updatingstatechange", comment.updatingState));
        comment.on("statechange", () => sendEvent("statechange", comment.state));
        comment.on("error", (error) => sendEvent("error", error));
        // cleanup function
        this.subscriptionCleanups[connectionId][subscriptionId] = () => {
            comment.removeAllListeners("update");
            comment.removeAllListeners("updatingstatechange");
            comment.removeAllListeners("statechange");
            comment.stop().catch((error) => log.error("commentUpdate stop error", { error, params }));
        };
        // if fail, cleanup
        try {
            await comment.update();
        }
        catch (e) {
            this.subscriptionCleanups[connectionId][subscriptionId]();
            throw e;
        }
        return subscriptionId;
    }
    async subplebbitUpdateSubscribe(params, connectionId) {
        const address = SubplebbitAddressSchema.parse(params[0]);
        const subscriptionId = generateSubscriptionId();
        const sendEvent = (event, result) => this.jsonRpcSendNotification({
            method: "subplebbitUpdateNotification",
            subscription: subscriptionId,
            event,
            result,
            connectionId
        });
        const isSubStarted = address in startedSubplebbits;
        const subplebbit = isSubStarted
            ? await getStartedSubplebbit(address)
            : await this.plebbit.createSubplebbit({ address });
        const sendSubJson = () => {
            let jsonToSend;
            if (subplebbit instanceof LocalSubplebbit)
                jsonToSend =
                    typeof subplebbit.updatedAt === "number"
                        ? subplebbit.toJSONInternalRpcAfterFirstUpdate()
                        : subplebbit.toJSONInternalRpcBeforeFirstUpdate();
            else
                jsonToSend = subplebbit.toJSONRpcRemote();
            sendEvent("update", jsonToSend);
        };
        const updateListener = () => sendSubJson();
        subplebbit.on("update", updateListener);
        const updatingStateListener = () => sendEvent("updatingstatechange", subplebbit.updatingState);
        subplebbit.on("updatingstatechange", updatingStateListener);
        // listener for startestatechange
        const startedStateListener = () => sendEvent("updatingstatechange", subplebbit.startedState);
        if (isSubStarted)
            subplebbit.on("startedstatechange", startedStateListener);
        const errorListener = (error) => sendEvent("error", error);
        subplebbit.on("error", errorListener);
        // cleanup function
        this.subscriptionCleanups[connectionId][subscriptionId] = () => {
            subplebbit.removeListener("update", updateListener);
            subplebbit.removeListener("updatingstatechange", updatingStateListener);
            subplebbit.removeListener("error", errorListener);
            subplebbit.removeListener("startedstatechange", startedStateListener);
            // We don't wanna stop the local sub if it's running already, this function is just for fetching updates
            if (!isSubStarted)
                subplebbit.stop().catch((error) => log.error("subplebbitUpdate stop error", { error, params }));
        };
        // if fail, cleanup
        try {
            // need to send an update with first subplebbitUpdate if it's a local sub
            if ("signer" in subplebbit)
                sendSubJson();
            // No need to call .update() if it's already running locally because we're listening to update event
            if (!isSubStarted)
                await subplebbit.update();
        }
        catch (e) {
            this.subscriptionCleanups[connectionId][subscriptionId]();
            throw e;
        }
        return subscriptionId;
    }
    async _createCommentInstanceFromPublishCommentParams(params) {
        const comment = await this.plebbit.createComment(params.comment);
        comment.challengeRequest = remeda.omit(params, ["comment"]);
        return comment;
    }
    async publishComment(params, connectionId) {
        const publishOptions = parseCommentChallengeRequestToEncryptSchemaWithPlebbitErrorIfItFails(params[0]);
        const subscriptionId = generateSubscriptionId();
        const sendEvent = (event, result) => this.jsonRpcSendNotification({
            method: "publishCommentNotification",
            subscription: subscriptionId,
            event,
            result,
            connectionId
        });
        const comment = await this._createCommentInstanceFromPublishCommentParams(publishOptions);
        this.publishing[subscriptionId] = comment;
        comment.on("challenge", (challenge) => sendEvent("challenge", encodeChallengeMessage(challenge)));
        comment.on("challengeanswer", (answer) => sendEvent("challengeanswer", encodeChallengeAnswerMessage(answer)));
        comment.on("challengerequest", (request) => sendEvent("challengerequest", encodeChallengeRequest(request)));
        comment.on("challengeverification", (challengeVerification) => sendEvent("challengeverification", encodeChallengeVerificationMessage(challengeVerification)));
        comment.on("publishingstatechange", () => sendEvent("publishingstatechange", comment.publishingState));
        comment.on("statechange", () => sendEvent("statechange", comment.state));
        comment.on("error", (error) => sendEvent("error", error));
        // cleanup function
        this.subscriptionCleanups[connectionId][subscriptionId] = () => {
            comment.removeAllListeners("challenge");
            comment.removeAllListeners("challengeanswer");
            comment.removeAllListeners("challengerequest");
            comment.removeAllListeners("challengeverification");
            comment.removeAllListeners("publishingstatechange");
            comment.removeAllListeners("statechange");
            delete this.publishing[subscriptionId];
            comment.stop().catch((error) => log.error("publishComment stop error", { error, params }));
        };
        // if fail, cleanup
        try {
            await comment.publish();
        }
        catch (e) {
            this.subscriptionCleanups[connectionId][subscriptionId]();
            throw e;
        }
        return subscriptionId;
    }
    async _createVoteInstanceFromPublishVoteParams(params) {
        const vote = await this.plebbit.createVote(params.vote);
        vote.challengeRequest = remeda.omit(params, ["vote"]);
        return vote;
    }
    async publishVote(params, connectionId) {
        const publishOptions = parseVoteChallengeRequestToEncryptSchemaWithPlebbitErrorIfItFails(params[0]);
        const subscriptionId = generateSubscriptionId();
        const sendEvent = (event, result) => this.jsonRpcSendNotification({ method: "publishVoteNotification", subscription: subscriptionId, event, result, connectionId });
        const vote = await this._createVoteInstanceFromPublishVoteParams(publishOptions);
        this.publishing[subscriptionId] = vote;
        vote.on("challenge", (challenge) => sendEvent("challenge", encodeChallengeMessage(challenge)));
        vote.on("challengeanswer", (answer) => sendEvent("challengeanswer", encodeChallengeAnswerMessage(answer)));
        vote.on("challengerequest", (request) => sendEvent("challengerequest", encodeChallengeRequest(request)));
        vote.on("challengeverification", (challengeVerification) => sendEvent("challengeverification", encodeChallengeVerificationMessage(challengeVerification)));
        vote.on("publishingstatechange", () => sendEvent("publishingstatechange", vote.publishingState));
        vote.on("error", (error) => sendEvent("error", error));
        // cleanup function
        this.subscriptionCleanups[connectionId][subscriptionId] = () => {
            delete this.publishing[subscriptionId];
            vote.stop().catch((error) => log.error("publishVote stop error", { error, params }));
            vote.removeAllListeners("challenge");
            vote.removeAllListeners("challengeanswer");
            vote.removeAllListeners("challengerequest");
            vote.removeAllListeners("challengeverification");
            vote.removeAllListeners("publishingstatechange");
        };
        // if fail, cleanup
        try {
            await vote.publish();
        }
        catch (e) {
            this.subscriptionCleanups[connectionId][subscriptionId]();
            throw e;
        }
        return subscriptionId;
    }
    async _createCommentEditInstanceFromPublishCommentEditParams(params) {
        const commentEdit = await this.plebbit.createCommentEdit(params.commentEdit);
        commentEdit.challengeRequest = remeda.omit(params, ["commentEdit"]);
        return commentEdit;
    }
    async publishCommentEdit(params, connectionId) {
        const publishOptions = parseCommentEditChallengeRequestToEncryptSchemaWithPlebbitErrorIfItFails(params[0]);
        const subscriptionId = generateSubscriptionId();
        const sendEvent = (event, result) => this.jsonRpcSendNotification({
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
        commentEdit.on("challengeverification", (challengeVerification) => sendEvent("challengeverification", encodeChallengeVerificationMessage(challengeVerification)));
        commentEdit.on("publishingstatechange", () => sendEvent("publishingstatechange", commentEdit.publishingState));
        commentEdit.on("error", (error) => sendEvent("error", error));
        // cleanup function
        this.subscriptionCleanups[connectionId][subscriptionId] = () => {
            delete this.publishing[subscriptionId];
            commentEdit.stop().catch((error) => log.error("publishCommentEdit stop error", { error, params }));
            commentEdit.removeAllListeners("challengerequest");
            commentEdit.removeAllListeners("challenge");
            commentEdit.removeAllListeners("challengeanswer");
            commentEdit.removeAllListeners("challengeverification");
            commentEdit.removeAllListeners("publishingstatechange");
        };
        // if fail, cleanup
        try {
            await commentEdit.publish();
        }
        catch (e) {
            this.subscriptionCleanups[connectionId][subscriptionId]();
            throw e;
        }
        return subscriptionId;
    }
    async _createCommentModerationInstanceFromPublishCommentModerationParams(params) {
        const commentModeration = await this.plebbit.createCommentModeration(params.commentModeration);
        commentModeration.challengeRequest = remeda.omit(params, ["commentModeration"]);
        return commentModeration;
    }
    async publishCommentModeration(params, connectionId) {
        const publishOptions = parseCommentModerationChallengeRequestToEncryptSchemaWithPlebbitErrorIfItFails(params[0]);
        const subscriptionId = generateSubscriptionId();
        const sendEvent = (event, result) => this.jsonRpcSendNotification({
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
        commentMod.on("challengeverification", (challengeVerification) => sendEvent("challengeverification", encodeChallengeVerificationMessage(challengeVerification)));
        commentMod.on("publishingstatechange", () => sendEvent("publishingstatechange", commentMod.publishingState));
        commentMod.on("error", (error) => sendEvent("error", error));
        // cleanup function
        this.subscriptionCleanups[connectionId][subscriptionId] = () => {
            delete this.publishing[subscriptionId];
            commentMod.stop().catch((error) => log.error("publishCommentModeration stop error", { error, params }));
            commentMod.removeAllListeners("challengerequest");
            commentMod.removeAllListeners("challenge");
            commentMod.removeAllListeners("challengeanswer");
            commentMod.removeAllListeners("challengeverification");
            commentMod.removeAllListeners("publishingstatechange");
        };
        // if fail, cleanup
        try {
            await commentMod.publish();
        }
        catch (e) {
            this.subscriptionCleanups[connectionId][subscriptionId]();
            throw e;
        }
        return subscriptionId;
    }
    async publishChallengeAnswers(params) {
        const subscriptionId = SubscriptionIdSchema.parse(params[0]);
        const decryptedChallengeAnswers = parseDecryptedChallengeAnswerWithPlebbitErrorIfItFails(params[1]);
        if (!this.publishing[subscriptionId]) {
            throw Error(`no subscription with id '${subscriptionId}'`);
        }
        const publication = this.publishing[subscriptionId];
        await publication.publishChallengeAnswers(decryptedChallengeAnswers.challengeAnswers);
        return true;
    }
    async resolveAuthorAddress(params) {
        const authorAddress = AuthorAddressSchema.parse(params[0]);
        const resolvedAuthorAddress = await this.plebbit.resolveAuthorAddress(authorAddress);
        return resolvedAuthorAddress;
    }
    async unsubscribe(params, connectionId) {
        const subscriptionId = SubscriptionIdSchema.parse(params[0]);
        if (!this.subscriptionCleanups[connectionId][subscriptionId])
            return true;
        this.subscriptionCleanups[connectionId][subscriptionId]();
        delete this.subscriptionCleanups[connectionId][subscriptionId];
        return true;
    }
    async destroy() {
        for (const subplebbitAddress of remeda.keys.strict(startedSubplebbits)) {
            const startedSub = await getStartedSubplebbit(subplebbitAddress);
            await startedSub.stop();
            delete startedSubplebbits[subplebbitAddress];
        }
        for (const connectionId of remeda.keys.strict(this.subscriptionCleanups))
            for (const subscriptionId of remeda.keys.strict(this.subscriptionCleanups[connectionId]))
                await this.unsubscribe([Number(subscriptionId)], connectionId);
        this.ws.close();
        await this.plebbit.destroy();
        this._onSettingsChange = {};
    }
}
const createPlebbitWsServer = async (options) => {
    const parsedOptions = parseCreatePlebbitWsServerOptionsSchemaWithPlebbitErrorIfItFails(options);
    const plebbit = await PlebbitJs.Plebbit(parsedOptions.plebbitOptions);
    const plebbitWss = new PlebbitWsServer({
        plebbit,
        port: parsedOptions.port,
        server: parsedOptions.server,
        authKey: parsedOptions.authKey
    });
    let error = undefined;
    const errorListener = (err) => (error = err);
    plebbitWss.on("error", errorListener);
    await new Promise((resolve) => setTimeout(resolve, 500)); // Wait 0.5s to see if there are any errors
    if (error)
        throw new PlebbitError("ERR_FAILED_TO_CREATE_WS_RPC_SERVER", {
            error: error,
            options: parsedOptions
        });
    plebbitWss.removeListener("error", errorListener);
    return plebbitWss;
};
const PlebbitRpc = {
    PlebbitWsServer: createPlebbitWsServer,
    // for mocking plebbit-js during tests
    setPlebbitJs
};
export default PlebbitRpc;
//# sourceMappingURL=index.js.map