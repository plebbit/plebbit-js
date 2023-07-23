"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const rpc_websockets_1 = require("rpc-websockets");
const plebbit_js_1 = __importStar(require("./lib/plebbit-js"));
const { toString: uint8ArrayToString } = require('uint8arrays/to-string');
const utils_1 = require("./utils");
const plebbit_logger_1 = __importDefault(require("@plebbit/plebbit-logger"));
const events_1 = require("events");
const log = (0, plebbit_logger_1.default)('plebbit-js-rpc:plebbit-ws-server');
// store started subplebbits  to be able to stop them
// store as a singleton because not possible to start the same sub twice at the same time
const startedSubplebbits = {};
const getStartedSubplebbit = (address) => __awaiter(void 0, void 0, void 0, function* () {
    // if pending, wait until no longer pendng
    while (startedSubplebbits[address] === 'pending') {
        yield new Promise((r) => setTimeout(r, 20));
    }
    return startedSubplebbits[address];
});
class PlebbitWsServer extends events_1.EventEmitter {
    constructor({ port, plebbit }) {
        super();
        this.connections = {};
        this.subscriptionCleanups = {};
        // store publishing publications so they can be used by publishChallengeAnswers
        this.publishing = {};
        this.plebbit = plebbit;
        this.rpcWebsockets = new rpc_websockets_1.Server({
            port,
            // might be needed to specify host for security later
            // host: 'localhost'
        });
        // rpc-sockets uses this library https://www.npmjs.com/package/ws
        this.ws = this.rpcWebsockets.wss;
        // forward errors to PlebbitWsServer
        this.rpcWebsockets.on('error', (error) => {
            this.emit('error', error);
        });
        this.plebbit.on('error', (error) => {
            this.emit('error', error);
        });
        // save connections to send messages to them later
        this.ws.on('connection', (ws) => {
            this.connections[ws._id] = ws;
            this.subscriptionCleanups[ws._id] = {};
        });
        // cleanup on disconnect
        this.rpcWebsockets.on('disconnection', (ws) => {
            const subscriptionCleanups = this.subscriptionCleanups[ws._id];
            for (const subscriptionId in subscriptionCleanups) {
                subscriptionCleanups[subscriptionId]();
                delete subscriptionCleanups[subscriptionId];
            }
            delete this.subscriptionCleanups[ws._id];
            delete this.connections[ws._id];
        });
        // register all JSON RPC methods
        this.rpcWebsocketsRegister('getComment', this.getComment.bind(this));
        this.rpcWebsocketsRegister('getSubplebbitPage', this.getSubplebbitPage.bind(this));
        this.rpcWebsocketsRegister('createSubplebbit', this.createSubplebbit.bind(this));
        this.rpcWebsocketsRegister('startSubplebbit', this.startSubplebbit.bind(this));
        this.rpcWebsocketsRegister('stopSubplebbit', this.stopSubplebbit.bind(this));
        this.rpcWebsocketsRegister('editSubplebbit', this.editSubplebbit.bind(this));
        this.rpcWebsocketsRegister('listSubplebbits', this.listSubplebbits.bind(this));
        this.rpcWebsocketsRegister('fetchCid', this.fetchCid.bind(this));
        // JSON RPC pubsub methods
        this.rpcWebsocketsRegister('commentUpdate', this.commentUpdate.bind(this));
        this.rpcWebsocketsRegister('subplebbitUpdate', this.subplebbitUpdate.bind(this));
        this.rpcWebsocketsRegister('publishComment', this.publishComment.bind(this));
        this.rpcWebsocketsRegister('publishVote', this.publishVote.bind(this));
        this.rpcWebsocketsRegister('publishCommentEdit', this.publishCommentEdit.bind(this));
        this.rpcWebsocketsRegister('publishChallengeAnswers', this.publishChallengeAnswers.bind(this));
        this.rpcWebsocketsRegister('unsubscribe', this.unsubscribe.bind(this));
    }
    // util function to log errors of registered methods
    rpcWebsocketsRegister(method, callback) {
        const callbackWithLog = (params, connectionId) => __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield callback(params, connectionId);
                return res;
            }
            catch (e) {
                log.error(`${callback.name} error`, { params, error: e });
                throw e;
            }
        });
        this.rpcWebsockets.register(method, callbackWithLog);
    }
    // send json rpc notification message (no id field, but must have subscription id)
    jsonRpcSendNotification({ method, result, subscription, event, connectionId }) {
        var _a, _b;
        const message = {
            jsonrpc: '2.0',
            method,
            params: {
                result,
                subscription,
                event
            }
        };
        (_b = (_a = this.connections[connectionId]) === null || _a === void 0 ? void 0 : _a.send) === null || _b === void 0 ? void 0 : _b.call(_a, JSON.stringify(message));
    }
    getComment(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const cid = params[0];
            const comment = yield this.plebbit.createComment({ cid });
            // wait for first update which contains the IPFS file only
            comment.update().catch((error) => log.error('getComment update error', { error, params }));
            yield new Promise((resolve) => comment.once('update', resolve));
            comment.stop().catch((error) => log.error('getComment stop error', { error, params }));
            return (0, utils_1.clone)(comment);
        });
    }
    getSubplebbitPage(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const pageCid = params[0];
            const subplebbitAddress = params[1];
            const subplebbit = yield this.plebbit.createSubplebbit({ address: subplebbitAddress });
            const page = yield subplebbit.posts.getPage(pageCid);
            return (0, utils_1.clone)(page);
        });
    }
    createSubplebbit(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const createSubplebbitOptions = params[0];
            if (createSubplebbitOptions === null || createSubplebbitOptions === void 0 ? void 0 : createSubplebbitOptions.address) {
                throw Error(`createSubplebbitOptions?.address '${createSubplebbitOptions === null || createSubplebbitOptions === void 0 ? void 0 : createSubplebbitOptions.address}' must be undefined to create a new subplebbit`);
            }
            const subplebbit = yield this.plebbit.createSubplebbit(createSubplebbitOptions);
            return (0, utils_1.clone)(subplebbit);
        });
    }
    startSubplebbit(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const address = params[0];
            if (startedSubplebbits[address]) {
                throw Error(`subplebbit '${address}' already started`);
            }
            startedSubplebbits[address] = 'pending';
            try {
                const subplebbit = yield this.plebbit.createSubplebbit({ address });
                yield subplebbit.start();
            }
            catch (e) {
                delete startedSubplebbits[address];
                throw e;
            }
            return true;
        });
    }
    stopSubplebbit(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const address = params[0];
            if (!(yield getStartedSubplebbit(address))) {
                return true;
            }
            const subplebbit = yield this.plebbit.createSubplebbit({ address });
            yield subplebbit.stop();
            delete startedSubplebbits[address];
            return true;
        });
    }
    editSubplebbit(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const address = params[0];
            const editSubplebbitOptions = params[1];
            const subplebbit = yield this.plebbit.createSubplebbit({ address });
            yield subplebbit.edit(editSubplebbitOptions);
            return (0, utils_1.clone)(subplebbit);
        });
    }
    listSubplebbits(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const subplebbits = yield this.plebbit.listSubplebbits();
            return (0, utils_1.clone)(subplebbits);
        });
    }
    fetchCid(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const cid = params[0];
            const res = yield this.plebbit.fetchCid(cid);
            return (0, utils_1.clone)(res);
        });
    }
    commentUpdate(params, connectionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const cid = params[0];
            const ipnsName = params[1];
            const subscriptionId = (0, utils_1.generateSubscriptionId)();
            const sendEvent = (event, result) => this.jsonRpcSendNotification({ method: 'commentUpdate', subscription: subscriptionId, event, result, connectionId });
            const comment = yield this.plebbit.createComment({ cid, ipnsName });
            comment.on('update', () => sendEvent('update', (0, utils_1.clone)(comment)));
            comment.on('updatingstatechange', () => sendEvent('updatingstatechange', comment.updatingState));
            comment.on('error', (error) => sendEvent('error', error));
            // cleanup function
            this.subscriptionCleanups[connectionId][subscriptionId] = () => {
                comment.stop().catch((error) => log.error('commentUpdate stop error', { error, params }));
                comment.removeAllListeners('update');
                comment.removeAllListeners('updatingstatechange');
                comment.removeAllListeners('error');
            };
            // if fail, cleanup
            try {
                yield comment.update();
            }
            catch (e) {
                this.subscriptionCleanups[connectionId][subscriptionId]();
                throw e;
            }
            return subscriptionId;
        });
    }
    subplebbitUpdate(params, connectionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const address = params[0];
            const subscriptionId = (0, utils_1.generateSubscriptionId)();
            const sendEvent = (event, result) => this.jsonRpcSendNotification({ method: 'subplebbitUpdate', subscription: subscriptionId, event, result, connectionId });
            // assume that the user wants to know the started states
            // possibly move it to a startedSubplebbitUpdate method
            // const startedSubplebbit = await getStartedSubplebbit(address)
            const subplebbit = yield this.plebbit.createSubplebbit({ address });
            subplebbit.on('update', () => sendEvent('update', (0, utils_1.clone)(subplebbit)));
            subplebbit.on('updatingstatechange', () => sendEvent('updatingstatechange', subplebbit.updatingState));
            subplebbit.on('error', (error) => sendEvent('error', error));
            // cleanup function
            this.subscriptionCleanups[connectionId][subscriptionId] = () => {
                subplebbit.stop().catch((error) => log.error('subplebbitUpdate stop error', { error, params }));
                subplebbit.removeAllListeners('update');
                subplebbit.removeAllListeners('updatingstatechange');
                subplebbit.removeAllListeners('error');
            };
            // if fail, cleanup
            try {
                yield subplebbit.update();
            }
            catch (e) {
                this.subscriptionCleanups[connectionId][subscriptionId]();
                throw e;
            }
            return subscriptionId;
        });
    }
    publishComment(params, connectionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const createCommentOptions = params[0];
            const subscriptionId = (0, utils_1.generateSubscriptionId)();
            const sendEvent = (event, result) => this.jsonRpcSendNotification({ method: 'publishComment', subscription: subscriptionId, event, result, connectionId });
            const comment = yield this.plebbit.createComment(createCommentOptions);
            this.publishing[subscriptionId] = comment;
            comment.on('challenge', (challenge) => sendEvent('challenge', (0, utils_1.clone)(challenge)));
            comment.on('challengeverification', (challengeVerification) => sendEvent('challengeverification', (0, utils_1.clone)(challengeVerification)));
            comment.on('publishingstatechange', () => sendEvent('publishingstatechange', comment.publishingState));
            comment.on('error', (error) => sendEvent('error', error));
            // cleanup function
            this.subscriptionCleanups[connectionId][subscriptionId] = () => {
                delete this.publishing[subscriptionId];
                comment.stop().catch((error) => log.error('publishComment stop error', { error, params }));
                comment.removeAllListeners('challenge');
                comment.removeAllListeners('challengeverification');
                comment.removeAllListeners('publishingstatechange');
                comment.removeAllListeners('error');
            };
            // if fail, cleanup
            try {
                yield comment.publish();
            }
            catch (e) {
                this.subscriptionCleanups[connectionId][subscriptionId]();
                throw e;
            }
            return subscriptionId;
        });
    }
    publishVote(params, connectionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const createVoteOptions = params[0];
            const subscriptionId = (0, utils_1.generateSubscriptionId)();
            const sendEvent = (event, result) => this.jsonRpcSendNotification({ method: 'publishVote', subscription: subscriptionId, event, result, connectionId });
            const vote = yield this.plebbit.createVote(createVoteOptions);
            this.publishing[subscriptionId] = vote;
            vote.on('challenge', (challenge) => sendEvent('challenge', (0, utils_1.clone)(challenge)));
            vote.on('challengeverification', (challengeVerification) => sendEvent('challengeverification', (0, utils_1.clone)(challengeVerification)));
            vote.on('publishingstatechange', () => sendEvent('publishingstatechange', vote.publishingState));
            vote.on('error', (error) => sendEvent('error', error));
            // cleanup function
            this.subscriptionCleanups[connectionId][subscriptionId] = () => {
                delete this.publishing[subscriptionId];
                vote.stop().catch((error) => log.error('publishVote stop error', { error, params }));
                vote.removeAllListeners('challenge');
                vote.removeAllListeners('challengeverification');
                vote.removeAllListeners('publishingstatechange');
                vote.removeAllListeners('error');
            };
            // if fail, cleanup
            try {
                yield vote.publish();
            }
            catch (e) {
                this.subscriptionCleanups[connectionId][subscriptionId]();
                throw e;
            }
            return subscriptionId;
        });
    }
    publishCommentEdit(params, connectionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const createCommentEditOptions = params[0];
            const subscriptionId = (0, utils_1.generateSubscriptionId)();
            const sendEvent = (event, result) => this.jsonRpcSendNotification({ method: 'publishCommentEdit', subscription: subscriptionId, event, result, connectionId });
            const commentEdit = yield this.plebbit.createCommentEdit(createCommentEditOptions);
            this.publishing[subscriptionId] = commentEdit;
            commentEdit.on('challenge', (challenge) => sendEvent('challenge', (0, utils_1.clone)(challenge)));
            commentEdit.on('challengeverification', (challengeVerification) => sendEvent('challengeverification', (0, utils_1.clone)(challengeVerification)));
            commentEdit.on('publishingstatechange', () => sendEvent('publishingstatechange', commentEdit.publishingState));
            commentEdit.on('error', (error) => sendEvent('error', error));
            // cleanup function
            this.subscriptionCleanups[connectionId][subscriptionId] = () => {
                delete this.publishing[subscriptionId];
                commentEdit.stop().catch((error) => log.error('publishCommentEdit stop error', { error, params }));
                commentEdit.removeAllListeners('challenge');
                commentEdit.removeAllListeners('challengeverification');
                commentEdit.removeAllListeners('publishingstatechange');
                commentEdit.removeAllListeners('error');
            };
            // if fail, cleanup
            try {
                yield commentEdit.publish();
            }
            catch (e) {
                this.subscriptionCleanups[connectionId][subscriptionId]();
                throw e;
            }
            return subscriptionId;
        });
    }
    publishChallengeAnswers(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const subscriptionId = params[0];
            const answers = params[1];
            if (!this.publishing[subscriptionId]) {
                throw Error(`no subscription with id '${subscriptionId}'`);
            }
            const publication = this.publishing[subscriptionId];
            yield publication.publishChallengeAnswers(answers);
            return true;
        });
    }
    unsubscribe(params, connectionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const subscriptionId = params[0];
            if (!this.subscriptionCleanups[connectionId][subscriptionId]) {
                throw Error(`no subscription with id '${subscriptionId}'`);
            }
            this.subscriptionCleanups[connectionId][subscriptionId]();
            delete this.subscriptionCleanups[connectionId][subscriptionId];
            return true;
        });
    }
}
const createPlebbitWsServer = ({ port, plebbitOptions }) => __awaiter(void 0, void 0, void 0, function* () {
    if (typeof port !== 'number') {
        throw Error(`createPlebbitWsServer port '${port}' not a number`);
    }
    const plebbit = yield plebbit_js_1.default.Plebbit(plebbitOptions);
    const plebbitWss = new PlebbitWsServer({ plebbit, port });
    return plebbitWss;
});
const PlebbitRpc = {
    PlebbitWsServer: createPlebbitWsServer,
    // for mocking plebbit-js during tests
    setPlebbitJs: plebbit_js_1.setPlebbitJs
};
module.exports = PlebbitRpc;
