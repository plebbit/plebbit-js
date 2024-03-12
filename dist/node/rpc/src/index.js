import { Server as RpcWebsocketsServer } from "rpc-websockets";
import PlebbitJs, { setPlebbitJs } from "./lib/plebbit-js/index.js";
import { clone, encodePubsubMsg, generateSubscriptionId } from "./utils.js";
import Logger from "@plebbit/plebbit-logger";
import { EventEmitter } from "events";
const log = Logger("plebbit-js-rpc:plebbit-ws-server");
import lodash from "lodash";
import { PlebbitError } from "../../plebbit-error.js";
import path from "path";
import { watch as fsWatch } from "node:fs";
import { throwWithErrorCode } from "../../util.js";
// store started subplebbits  to be able to stop them
// store as a singleton because not possible to start the same sub twice at the same time
const startedSubplebbits = {};
const getStartedSubplebbit = async (address) => {
    // if pending, wait until no longer pendng
    while (startedSubplebbits[address] === "pending") {
        await new Promise((r) => setTimeout(r, 20));
    }
    return startedSubplebbits[address];
};
class PlebbitWsServer extends EventEmitter {
    constructor({ port, plebbit, plebbitOptions, authKey }) {
        super();
        this.connections = {};
        this.subscriptionCleanups = {};
        // store publishing publications so they can be used by publishChallengeAnswers
        this.publishing = {};
        this._listSubsSubscriptionIdToConnectionId = {};
        const log = Logger("plebbit:PlebbitWsServer");
        this.authKey = authKey;
        // don't instantiate plebbit in constructor because it's an async function
        this.plebbit = plebbit;
        this.rpcWebsockets = new RpcWebsocketsServer({
            port
            // might be needed to specify host for security later
            // host: 'localhost'
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
        // block non-localhost requests without auth key for security
        // @ts-ignore
        this.ws._server.on("upgrade", (req) => {
            const xForwardedFor = Boolean(req.rawHeaders.find((item, i) => item.toLowerCase() === "x-forwarded-for" && i % 2 === 0));
            // client is on localhost and server is not forwarded by a proxy
            const localHostUrls = ["::1", "::ffff:127.0.0.1"];
            const isLocalhost = localHostUrls.includes(req.socket.remoteAddress) && !xForwardedFor;
            // the request path is the auth key, e.g. localhost:9138/some-random-auth-key (not secure on http)
            const hasAuth = this.authKey && `/${this.authKey}` === req.url;
            // if isn't localhost and doesn't have auth, block access
            if (!isLocalhost && !hasAuth)
                req.destroy();
        });
        // save connections to send messages to them later
        this.ws.on("connection", (ws) => {
            //@ts-ignore-error
            this.connections[ws._id] = ws;
            //@ts-ignore-error
            this.subscriptionCleanups[ws._id] = {};
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
        this.rpcWebsocketsRegister("listSubplebbits", this.listSubplebbits.bind(this));
        this.rpcWebsocketsRegister("fetchCid", this.fetchCid.bind(this));
        this.rpcWebsocketsRegister("resolveAuthorAddress", this.resolveAuthorAddress.bind(this));
        this.rpcWebsocketsRegister("getSettings", this.getSettings.bind(this));
        this.rpcWebsocketsRegister("setSettings", this.setSettings.bind(this));
        // JSON RPC pubsub methods
        this.rpcWebsocketsRegister("commentUpdate", this.commentUpdate.bind(this));
        this.rpcWebsocketsRegister("subplebbitUpdate", this.subplebbitUpdate.bind(this));
        this.rpcWebsocketsRegister("publishComment", this.publishComment.bind(this));
        this.rpcWebsocketsRegister("publishVote", this.publishVote.bind(this));
        this.rpcWebsocketsRegister("publishCommentEdit", this.publishCommentEdit.bind(this));
        this.rpcWebsocketsRegister("publishChallengeAnswers", this.publishChallengeAnswers.bind(this));
        this.rpcWebsocketsRegister("unsubscribe", this.unsubscribe.bind(this));
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
                if (!e.code) {
                    const errorJson = JSON.parse(JSON.stringify(e, Object.getOwnPropertyNames(e)));
                    delete errorJson["stack"];
                    throw errorJson;
                }
                else {
                    // PlebbitError
                    const errorJson = clone(e);
                    delete errorJson["stack"];
                    throw errorJson;
                }
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
        const cid = params[0];
        const comment = await this.plebbit.getComment(cid);
        //@ts-expect-error
        return { cid, ...comment._rawCommentIpfs };
    }
    async getSubplebbitPage(params) {
        const pageCid = params[0];
        const subplebbitAddress = params[1];
        const subplebbit = await this.plebbit.createSubplebbit({ address: subplebbitAddress });
        const page = await subplebbit.posts._fetchAndVerifyPage(pageCid);
        return page;
    }
    async getCommentPage(params) {
        const [pageCid, commentCid, subplebbitAddress] = params;
        const comment = await this.plebbit.createComment({ cid: commentCid, subplebbitAddress });
        const page = await comment.replies._fetchAndVerifyPage(pageCid);
        return page;
    }
    async createSubplebbit(params) {
        const createSubplebbitOptions = params[0];
        if (createSubplebbitOptions?.address) {
            throw Error(`createSubplebbitOptions?.address '${createSubplebbitOptions?.address}' must be undefined to create a new subplebbit`);
        }
        const subplebbit = await this.plebbit.createSubplebbit(createSubplebbitOptions);
        return subplebbit.toJSONInternalRpc();
    }
    async startSubplebbit(params, connectionId) {
        const address = params[0];
        if (startedSubplebbits[address])
            throwWithErrorCode("ERR_SUB_ALREADY_STARTED", { subplebbitAddress: address });
        startedSubplebbits[address] = "pending";
        const subscriptionId = generateSubscriptionId();
        const sendEvent = (event, result) => this.jsonRpcSendNotification({ method: "startSubplebbit", subscription: subscriptionId, event, result, connectionId });
        try {
            const subplebbit = await this.plebbit.createSubplebbit({ address });
            subplebbit.on("update", () => sendEvent("update", subplebbit.toJSONInternalRpc()));
            subplebbit.on("startedstatechange", () => sendEvent("startedstatechange", subplebbit.startedState));
            subplebbit.on("challenge", (challenge) => sendEvent("challenge", encodePubsubMsg(challenge)));
            subplebbit.on("challengeanswer", (answer) => sendEvent("challengeanswer", encodePubsubMsg(answer)));
            subplebbit.on("challengerequest", (request) => sendEvent("challengerequest", encodePubsubMsg(request)));
            subplebbit.on("challengeverification", (challengeVerification) => sendEvent("challengeverification", encodePubsubMsg(challengeVerification)));
            subplebbit.on("error", (error) => sendEvent("error", error));
            // cleanup function
            this.subscriptionCleanups[connectionId][subscriptionId] = () => {
                subplebbit.removeAllListeners("update");
                subplebbit.removeAllListeners("startedstatechange");
                subplebbit.removeAllListeners("challenge");
                subplebbit.removeAllListeners("challengeanswer");
                subplebbit.removeAllListeners("challengerequest");
                subplebbit.removeAllListeners("challengeverification");
            };
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
        return subscriptionId;
    }
    async stopSubplebbit(params) {
        const address = params[0];
        const startedSubplebbit = await getStartedSubplebbit(address);
        if (!startedSubplebbit)
            throw Error("Attempting to stop a subplebbit that is not running");
        await startedSubplebbit.stop();
        delete startedSubplebbits[address];
        return true;
    }
    async editSubplebbit(params) {
        const address = params[0];
        const editSubplebbitOptions = params[1];
        const subplebbit = (await getStartedSubplebbit(address)) || await this.plebbit.createSubplebbit({ address });
        await subplebbit.edit(editSubplebbitOptions);
        if (editSubplebbitOptions.address && startedSubplebbits[address]) {
            startedSubplebbits[editSubplebbitOptions.address] = startedSubplebbits[address];
            delete startedSubplebbits[address];
        }
        return subplebbit.toJSONInternalRpc();
    }
    async deleteSubplebbit(params) {
        const address = params[0];
        const addresses = await this.plebbit.listSubplebbits();
        if (!addresses.includes(address)) {
            throw Error(`subplebbit with address '${address}' not found in plebbit.listSubplebbits()`);
        }
        const subplebbit = (await getStartedSubplebbit(address)) || await this.plebbit.createSubplebbit({ address });
        await subplebbit.delete();
        delete startedSubplebbits[address];
        return true;
    }
    async listSubplebbits(params, connectionId) {
        const sendEvent = (event, result) => {
            for (const [subscriptionId, connectionId] of Object.entries(this._listSubsSubscriptionIdToConnectionId)) {
                this.jsonRpcSendNotification({
                    method: "listSubplebbits",
                    subscription: Number(subscriptionId),
                    event,
                    result,
                    connectionId: connectionId
                });
            }
        };
        const getListedSubsWithTimestamp = async () => {
            return { subs: await this.plebbit.listSubplebbits(), timestamp: Date.now() };
        };
        const newSubscriptionId = generateSubscriptionId();
        const watchNotConfigured = Object.keys(this._listSubsSubscriptionIdToConnectionId).length === 0;
        if (watchNotConfigured) {
            // First time listSubplebbits is called, need to set up everything
            // set up fs watch here
            await this.plebbit.listSubplebbits(); // Just to mkdir plebbitDataPath/subplebbits
            const subsPath = path.join(this.plebbit.dataPath, "subplebbits");
            const watchAbortController = new AbortController();
            fsWatch(subsPath, { signal: watchAbortController.signal }, async (eventType, filename) => {
                if (filename.endsWith(".lock"))
                    return; // we only care about subplebbits
                const currentSubs = await getListedSubsWithTimestamp();
                if (currentSubs.timestamp > this._lastListedSubs.timestamp &&
                    JSON.stringify(currentSubs.subs) !== JSON.stringify(this._lastListedSubs.subs)) {
                    sendEvent("update", currentSubs.subs);
                    this._lastListedSubs = currentSubs;
                }
            });
            this.subscriptionCleanups[connectionId][newSubscriptionId] = () => {
                this._lastListedSubs = undefined;
                this._listSubsSubscriptionIdToConnectionId = {};
                watchAbortController.abort();
            };
        }
        this._listSubsSubscriptionIdToConnectionId[newSubscriptionId] = connectionId;
        if (!this._lastListedSubs)
            this._lastListedSubs = await getListedSubsWithTimestamp();
        sendEvent("update", this._lastListedSubs.subs);
        return newSubscriptionId;
    }
    async fetchCid(params) {
        const cid = params[0];
        const res = await this.plebbit.fetchCid(cid);
        return res;
    }
    async getSettings(params) {
        const plebbitOptions = this.plebbit.parsedPlebbitOptions;
        const challenges = lodash.mapValues(PlebbitJs.Plebbit.challenges, (challengeFactory) => lodash.omit(challengeFactory({}), "getChallenge"));
        return { plebbitOptions, challenges };
    }
    async setSettings(params) {
        const settings = params[0];
        this.plebbit = await PlebbitJs.Plebbit(settings.plebbitOptions);
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
        // TODO: possibly restart all updating comment/subplebbit subscriptions with new plebbit options,
        // not sure if needed because plebbit-react-hooks clients can just reload the page, low priority
        return true;
    }
    async commentUpdate(params, connectionId) {
        const cid = params[0];
        const subscriptionId = generateSubscriptionId();
        const sendEvent = (event, result) => this.jsonRpcSendNotification({ method: "commentUpdate", subscription: subscriptionId, event, result, connectionId });
        const comment = await this.plebbit.createComment({ cid });
        comment.on("update", () => 
        //@ts-expect-error
        sendEvent("update", comment.updatedAt ? comment._rawCommentUpdate : { cid, ...comment._rawCommentIpfs }));
        comment.on("updatingstatechange", () => sendEvent("updatingstatechange", comment.updatingState));
        comment.on("error", (error) => sendEvent("error", error));
        // cleanup function
        this.subscriptionCleanups[connectionId][subscriptionId] = () => {
            comment.stop().catch((error) => log.error("commentUpdate stop error", { error, params }));
            comment.removeAllListeners("update");
            comment.removeAllListeners("updatingstatechange");
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
    async subplebbitUpdate(params, connectionId) {
        const address = params[0];
        const subscriptionId = generateSubscriptionId();
        const sendEvent = (event, result) => this.jsonRpcSendNotification({ method: "subplebbitUpdate", subscription: subscriptionId, event, result, connectionId });
        // assume that the user wants to know the started states
        // possibly move it to a startedSubplebbitUpdate method
        // const startedSubplebbit = await getStartedSubplebbit(address)
        const subplebbit = await this.plebbit.createSubplebbit({ address });
        subplebbit.on("update", () => sendEvent("update", subplebbit["signer"] ? subplebbit["toJSONInternalRpc"]() : subplebbit.toJSONIpfs()));
        subplebbit.on("updatingstatechange", () => sendEvent("updatingstatechange", subplebbit.updatingState));
        subplebbit.on("error", (error) => sendEvent("error", error));
        // cleanup function
        this.subscriptionCleanups[connectionId][subscriptionId] = () => {
            subplebbit.stop().catch((error) => log.error("subplebbitUpdate stop error", { error, params }));
            subplebbit.removeAllListeners("update");
            subplebbit.removeAllListeners("updatingstatechange");
        };
        // if fail, cleanup
        try {
            if (subplebbit["signer"])
                // need to send an update when fetching sub from db for first time
                subplebbit.emit("update", subplebbit);
            await subplebbit.update();
        }
        catch (e) {
            this.subscriptionCleanups[connectionId][subscriptionId]();
            throw e;
        }
        return subscriptionId;
    }
    async publishComment(params, connectionId) {
        const publishOptions = params[0];
        const subscriptionId = generateSubscriptionId();
        const sendEvent = (event, result) => this.jsonRpcSendNotification({ method: "publishComment", subscription: subscriptionId, event, result, connectionId });
        const comment = await this.plebbit.createComment({
            challengeAnswers: publishOptions.challengeAnswers,
            challengeCommentCids: publishOptions.challengeCommentCids,
            ...publishOptions.publication
        });
        this.publishing[subscriptionId] = comment;
        comment.on("challenge", (challenge) => sendEvent("challenge", encodePubsubMsg(challenge)));
        comment.on("challengeanswer", (answer) => sendEvent("challengeanswer", encodePubsubMsg(answer)));
        comment.on("challengerequest", (request) => sendEvent("challengerequest", encodePubsubMsg(request)));
        comment.on("challengeverification", (challengeVerification) => sendEvent("challengeverification", encodePubsubMsg(challengeVerification)));
        comment.on("publishingstatechange", () => sendEvent("publishingstatechange", comment.publishingState));
        comment.on("error", (error) => sendEvent("error", error));
        // cleanup function
        this.subscriptionCleanups[connectionId][subscriptionId] = () => {
            delete this.publishing[subscriptionId];
            comment.stop().catch((error) => log.error("publishComment stop error", { error, params }));
            comment.removeAllListeners("challenge");
            comment.removeAllListeners("challengeanswer");
            comment.removeAllListeners("challengerequest");
            comment.removeAllListeners("challengeverification");
            comment.removeAllListeners("publishingstatechange");
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
    async publishVote(params, connectionId) {
        const publishOptions = params[0];
        const subscriptionId = generateSubscriptionId();
        const sendEvent = (event, result) => this.jsonRpcSendNotification({ method: "publishVote", subscription: subscriptionId, event, result, connectionId });
        const vote = await this.plebbit.createVote({
            ...publishOptions.publication,
            challengeAnswers: publishOptions.challengeAnswers,
            challengeCommentCids: publishOptions.challengeCommentCids
        });
        this.publishing[subscriptionId] = vote;
        vote.on("challenge", (challenge) => sendEvent("challenge", encodePubsubMsg(challenge)));
        vote.on("challengeanswer", (answer) => sendEvent("challengeanswer", encodePubsubMsg(answer)));
        vote.on("challengerequest", (request) => sendEvent("challengerequest", encodePubsubMsg(request)));
        vote.on("challengeverification", (challengeVerification) => sendEvent("challengeverification", encodePubsubMsg(challengeVerification)));
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
    async publishCommentEdit(params, connectionId) {
        const publishOptions = params[0];
        const subscriptionId = generateSubscriptionId();
        const sendEvent = (event, result) => this.jsonRpcSendNotification({ method: "publishCommentEdit", subscription: subscriptionId, event, result, connectionId });
        const commentEdit = await this.plebbit.createCommentEdit({
            ...publishOptions.publication,
            challengeCommentCids: publishOptions.challengeCommentCids,
            challengeAnswers: publishOptions.challengeAnswers
        });
        this.publishing[subscriptionId] = commentEdit;
        commentEdit.on("challenge", (challenge) => sendEvent("challenge", encodePubsubMsg(challenge)));
        commentEdit.on("challengeanswer", (answer) => sendEvent("challengeanswer", encodePubsubMsg(answer)));
        commentEdit.on("challengerequest", (request) => sendEvent("challengerequest", encodePubsubMsg(request)));
        commentEdit.on("challengeverification", (challengeVerification) => sendEvent("challengeverification", encodePubsubMsg(challengeVerification)));
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
    async publishChallengeAnswers(params) {
        const subscriptionId = params[0];
        const answers = params[1];
        if (!this.publishing[subscriptionId]) {
            throw Error(`no subscription with id '${subscriptionId}'`);
        }
        const publication = this.publishing[subscriptionId];
        await publication.publishChallengeAnswers(answers);
        return true;
    }
    async resolveAuthorAddress(params) {
        const authorAddress = params[0];
        const resolvedAuthorAddress = await this.plebbit.resolveAuthorAddress(authorAddress);
        return resolvedAuthorAddress;
    }
    async unsubscribe(params, connectionId) {
        const subscriptionId = params[0];
        if (this._listSubsSubscriptionIdToConnectionId[subscriptionId]) {
            const noClientSubscribingToListSubs = Object.keys(this._listSubsSubscriptionIdToConnectionId).length === 1;
            if (noClientSubscribingToListSubs)
                // clean up fs watch only when there is no rpc client listening for listSubplebbits
                this.subscriptionCleanups[connectionId][subscriptionId]();
            delete this.subscriptionCleanups[connectionId][subscriptionId];
            delete this._listSubsSubscriptionIdToConnectionId[subscriptionId];
            return true;
        }
        if (!this.subscriptionCleanups[connectionId][subscriptionId])
            return true;
        this.subscriptionCleanups[connectionId][subscriptionId]();
        delete this.subscriptionCleanups[connectionId][subscriptionId];
        return true;
    }
    async destroy() {
        for (const subplebbitAddress of Object.keys(startedSubplebbits)) {
            const startedSub = await getStartedSubplebbit(subplebbitAddress);
            await startedSub.stop();
            delete startedSubplebbits[subplebbitAddress];
        }
        for (const connectionId of Object.keys(this.subscriptionCleanups))
            for (const subscriptionId of Object.keys(this.subscriptionCleanups[connectionId]))
                await this.unsubscribe([Number(subscriptionId)], connectionId);
        this.ws.close();
        await this.plebbit.destroy();
    }
}
const createPlebbitWsServer = async ({ port, plebbitOptions, authKey }) => {
    if (typeof port !== "number") {
        throw Error(`createPlebbitWsServer port '${port}' not a number`);
    }
    const plebbit = await PlebbitJs.Plebbit(plebbitOptions);
    const plebbitWss = new PlebbitWsServer({ plebbit, port, plebbitOptions, authKey });
    let error;
    const errorListener = (err) => (error = err);
    plebbitWss.on("error", errorListener);
    await new Promise((resolve) => setTimeout(resolve, 500)); // Wait 0.5s to see if there are any errors
    if (error)
        throw new PlebbitError("ERR_FAILED_TO_CREATE_WS_RPC_SERVER", {
            error: error,
            options: { port, plebbitOptions, authKey }
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