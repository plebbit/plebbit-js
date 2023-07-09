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
// store started subplebbits to be able to stop them
const startedSubplebbits = {};
const getStartedSubplebbit = (address) => __awaiter(void 0, void 0, void 0, function* () {
    // if pending, wait until no longer pendng
    while (startedSubplebbits[address] === 'pending') {
        yield new Promise((r) => setTimeout(r, 20));
    }
    return startedSubplebbits[address];
});
// store publishing publications so they can be used by publishChallengeAnswers
const publishing = {};
class PlebbitWsServer extends events_1.EventEmitter {
    constructor({ port, plebbit }) {
        super();
        this.plebbit = plebbit;
        this.wss = new rpc_websockets_1.Server({
            port,
            // might be needed to specify host for security later
            // host: 'localhost'
        });
        // forward errors to PlebbitWsServer
        this.wss.on('error', (error) => {
            this.emit('error', error);
        });
        this.plebbit.on('error', (error) => {
            this.emit('error', error);
        });
        // register all JSON RPC methods
        this.wssRegister('getComment', this.getComment.bind(this));
        this.wssRegister('getCommentUpdate', this.getCommentUpdate.bind(this));
        this.wssRegister('getSubplebbitUpdate', this.getSubplebbitUpdate.bind(this));
        this.wssRegister('getSubplebbitPage', this.getSubplebbitPage.bind(this));
        this.wssRegister('createSubplebbit', this.createSubplebbit.bind(this));
        this.wssRegister('startSubplebbit', this.startSubplebbit.bind(this));
        this.wssRegister('stopSubplebbit', this.stopSubplebbit.bind(this));
        this.wssRegister('editSubplebbit', this.editSubplebbit.bind(this));
        this.wssRegister('listSubplebbits', this.listSubplebbits.bind(this));
        this.wssRegister('publishComment', this.publishComment.bind(this));
        this.wssRegister('publishVote', this.publishVote.bind(this));
        this.wssRegister('publishCommentEdit', this.publishCommentEdit.bind(this));
        this.wssRegister('publishChallengeAnswers', this.publishChallengeAnswers.bind(this));
        this.wssRegister('fetchCid', this.fetchCid.bind(this));
    }
    // util function to log errors of registered methods
    wssRegister(method, callback) {
        const callbackWithLog = (params) => __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield callback(params);
                return res;
            }
            catch (e) {
                log.error(`${callback.name} error`, { params, error: e });
                throw e;
            }
        });
        this.wss.register(method, callbackWithLog);
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
    getCommentUpdate(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const cid = params[0];
            const ipnsName = params[1];
            const updatedAtAfter = params[2] || 0;
            const comment = yield this.plebbit.createComment({ cid, ipnsName });
            // wait for an update with updatedAt greater than updatedAtAfter
            comment.update().catch((error) => log.error('getCommentUpdate update error', { error, params }));
            yield new Promise((resolve) => comment.on('update', () => {
                console.log(comment);
                if (comment.updatedAt && comment.updatedAt > updatedAtAfter) {
                    resolve(comment);
                }
            }));
            comment.stop().catch((error) => log.error('getCommentUpdate stop error', { error, params }));
            return (0, utils_1.clone)(comment);
        });
    }
    getSubplebbitUpdate(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const address = params[0];
            const updatedAtAfter = params[1] || 0;
            // assume that the user wants to know the started states
            // possibly move it to a getStartedSubplebbit method
            // const startedSubplebbit = await getStartedSubplebbit(address)
            // if (startedSubplebbit && startedSubplebbit.updatedAt > updatedAtAfter) {
            //   return startedSubplebbit
            // }
            const subplebbit = yield this.plebbit.createSubplebbit({ address });
            // wait for an update with updatedAt greater than updatedAtAfter
            subplebbit.update().catch((error) => log.error('getSubplebbitUpdate update error', { error, params }));
            yield new Promise((resolve) => subplebbit.on('update', () => {
                if (subplebbit.updatedAt && subplebbit.updatedAt > updatedAtAfter) {
                    resolve(subplebbit);
                }
            }));
            subplebbit.stop().catch((error) => log.error('getSubplebbitUpdate stop error', { error, params }));
            return (0, utils_1.clone)(subplebbit);
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
            // returning undefined is invalid JSON RPC
            return null;
        });
    }
    stopSubplebbit(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const address = params[0];
            if (!(yield getStartedSubplebbit(address))) {
                return null;
            }
            const subplebbit = yield this.plebbit.createSubplebbit({ address });
            yield subplebbit.stop();
            delete startedSubplebbits[address];
            // returning undefined is invalid JSON RPC
            return null;
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
    publishComment(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const createCommentOptions = params[0];
            const comment = yield this.plebbit.createComment(createCommentOptions);
            comment.publish();
            let challengeMessage = yield new Promise((r) => comment.once('challenge', (challengeMessage) => r(challengeMessage)));
            // try to convert the challengeRequestId to base58
            if (typeof challengeMessage.challengeRequestId !== 'string') {
                challengeMessage = Object.assign(Object.assign({}, challengeMessage), { challengeRequestId: uint8ArrayToString(challengeMessage.challengeRequestId, 'base58btc') });
            }
            challengeMessage = (0, utils_1.clone)(challengeMessage);
            publishing[challengeMessage.challengeRequestId] = comment;
            return challengeMessage;
        });
    }
    publishVote(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const createVoteOptions = params[0];
            const vote = yield this.plebbit.createVote(createVoteOptions);
            vote.publish();
            let challengeMessage = yield new Promise((r) => vote.once('challenge', (challengeMessage) => r(challengeMessage)));
            // try to convert the challengeRequestId to base58
            if (typeof challengeMessage.challengeRequestId !== 'string') {
                challengeMessage = Object.assign(Object.assign({}, challengeMessage), { challengeRequestId: uint8ArrayToString(challengeMessage.challengeRequestId, 'base58btc') });
            }
            challengeMessage = (0, utils_1.clone)(challengeMessage);
            publishing[challengeMessage.challengeRequestId] = vote;
            return challengeMessage;
        });
    }
    publishCommentEdit(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const createCommentEditOptions = params[0];
            const commentEdit = yield this.plebbit.createCommentEdit(createCommentEditOptions);
            commentEdit.publish();
            let challengeMessage = yield new Promise((r) => commentEdit.once('challenge', (challengeMessage) => r(challengeMessage)));
            // try to convert the challengeRequestId to base58
            if (typeof challengeMessage.challengeRequestId !== 'string') {
                challengeMessage = Object.assign(Object.assign({}, challengeMessage), { challengeRequestId: uint8ArrayToString(challengeMessage.challengeRequestId, 'base58btc') });
            }
            challengeMessage = (0, utils_1.clone)(challengeMessage);
            publishing[challengeMessage.challengeRequestId] = commentEdit;
            return challengeMessage;
        });
    }
    publishChallengeAnswers(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const challengeRequestId = params[0];
            const answers = params[1];
            if (!publishing[challengeRequestId]) {
                throw Error(`no publications with challengeRequestId '${challengeRequestId}'`);
            }
            const publication = publishing[challengeRequestId];
            publication.publishChallengeAnswers(answers);
            let challengeVerificationMessage = yield new Promise((r) => publication.once('challengeverification', (challengeVerificationMessage) => r(challengeVerificationMessage)));
            delete challengeVerificationMessage[challengeRequestId];
            // try to convert the challengeRequestId to base58
            if (typeof challengeVerificationMessage.challengeRequestId !== 'string') {
                challengeVerificationMessage = Object.assign(Object.assign({}, challengeVerificationMessage), { challengeRequestId: uint8ArrayToString(challengeVerificationMessage.challengeRequestId, 'base58btc') });
            }
            return (0, utils_1.clone)(challengeVerificationMessage);
        });
    }
    fetchCid(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const cid = params[0];
            const res = yield this.plebbit.fetchCid(cid);
            return (0, utils_1.clone)(res);
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
