"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var challenge_1 = require("./challenge");
var author_1 = __importDefault(require("./author"));
var assert_1 = __importDefault(require("assert"));
var signer_1 = require("./signer");
var plebbit_logger_1 = __importDefault(require("@plebbit/plebbit-logger"));
var version_1 = __importDefault(require("./version"));
var signatures_1 = require("./signer/signatures");
var util_1 = require("./util");
var tiny_typed_emitter_1 = require("tiny-typed-emitter");
var comment_1 = require("./comment");
var plebbit_error_1 = require("./plebbit-error");
var util_2 = require("./signer/util");
var client_manager_1 = require("./clients/client-manager");
var cborg = __importStar(require("cborg"));
var lodash_1 = __importDefault(require("lodash"));
var constants_1 = require("./constants");
var Publication = /** @class */ (function (_super) {
    __extends(Publication, _super);
    function Publication(props, plebbit) {
        var _this = _super.call(this) || this;
        _this._plebbit = plebbit;
        _this._receivedChallengeFromSub = _this._receivedChallengeVerification = false;
        _this._updatePublishingState("stopped");
        _this._updateState("stopped");
        _this._initClients();
        _this._initProps(props);
        _this.handleChallengeExchange = _this.handleChallengeExchange.bind(_this);
        _this.publish = _this.publish.bind(_this);
        _this.on("error", function () {
            var _a;
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return (_a = _this._plebbit).emit.apply(_a, __spreadArray(["error"], args, false));
        });
        _this._publishToDifferentProviderThresholdSeconds = 10;
        _this._setProviderFailureThresholdSeconds = 60 * 2; // Two minutes
        // public method should be bound
        _this.publishChallengeAnswers = _this.publishChallengeAnswers.bind(_this);
        return _this;
    }
    Publication.prototype._initClients = function () {
        this._clientsManager = new client_manager_1.PublicationClientsManager(this);
        this.clients = this._clientsManager.clients;
    };
    Publication.prototype._initProps = function (props) {
        this.subplebbitAddress = props.subplebbitAddress;
        if (this.subplebbitAddress)
            this.shortSubplebbitAddress = (0, util_1.shortifyAddress)(this.subplebbitAddress);
        this.timestamp = props.timestamp;
        this.signer = this.signer || props["signer"];
        this.signature = props.signature;
        if (props.author)
            this.author = new author_1.default(props.author);
        this.protocolVersion = props.protocolVersion;
    };
    Publication.prototype.getType = function () {
        throw new Error("Should be implemented by children of Publication");
    };
    // This is the publication that user publishes over pubsub
    Publication.prototype.toJSONPubsubMessagePublication = function () {
        return {
            subplebbitAddress: this.subplebbitAddress,
            timestamp: this.timestamp,
            signature: this.signature,
            author: this.author.toJSONIpfs(),
            protocolVersion: this.protocolVersion
        };
    };
    Publication.prototype.handleChallengeExchange = function (pubsubMsg) {
        return __awaiter(this, void 0, void 0, function () {
            var log, msgParsed, challengeMsgValidity, error, decryptedChallenges, _a, _b, decryptedChallenge, subscribedProviders, signatureValidation, error, decryptedPublication, _c, _d;
            var _this = this;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:publication:handleChallengeExchange");
                        msgParsed = cborg.decode(pubsubMsg.data);
                        if (!this._publishedChallengeRequests.some(function (requestMsg) {
                            return lodash_1.default.isEqual(msgParsed === null || msgParsed === void 0 ? void 0 : msgParsed.challengeRequestId, requestMsg.challengeRequestId);
                        }))
                            return [2 /*return*/]; // Process only this publication's challenge requests
                        if (!((msgParsed === null || msgParsed === void 0 ? void 0 : msgParsed.type) === "CHALLENGE")) return [3 /*break*/, 3];
                        if (this._receivedChallengeFromSub)
                            return [2 /*return*/]; // We already processed a challenge
                        return [4 /*yield*/, (0, signatures_1.verifyChallengeMessage)(msgParsed, this._pubsubTopicWithfallback(), true)];
                    case 1:
                        challengeMsgValidity = _e.sent();
                        if (!challengeMsgValidity.valid) {
                            error = new plebbit_error_1.PlebbitError("ERR_CHALLENGE_SIGNATURE_IS_INVALID", {
                                pubsubMsg: msgParsed,
                                reason: challengeMsgValidity.reason
                            });
                            log.error(error.toString());
                            this.emit("error", error);
                            return [2 /*return*/];
                        }
                        this._receivedChallengeFromSub = true;
                        log("Received encrypted challenges.  Will decrypt and emit them on \"challenge\" event. User shoud publish solution by calling publishChallengeAnswers");
                        _b = (_a = JSON).parse;
                        return [4 /*yield*/, (0, signer_1.decryptEd25519AesGcm)(msgParsed.encryptedChallenges, this.pubsubMessageSigner.privateKey, this.subplebbit.encryption.publicKey)];
                    case 2:
                        decryptedChallenges = _b.apply(_a, [_e.sent()]);
                        decryptedChallenge = __assign(__assign({}, msgParsed), { challenges: decryptedChallenges });
                        this._challenge = decryptedChallenge;
                        this._updatePublishingState("waiting-challenge-answers");
                        subscribedProviders = Object.entries(this._clientsManager.providerSubscriptions)
                            .filter(function (_a) {
                            var pubsubTopics = _a[1];
                            return pubsubTopics.includes(_this._pubsubTopicWithfallback());
                        })
                            .map(function (_a) {
                            var provider = _a[0];
                            return provider;
                        });
                        subscribedProviders.forEach(function (provider) { return _this._clientsManager.updatePubsubState("waiting-challenge-answers", provider); });
                        this.emit("challenge", decryptedChallenge);
                        return [3 /*break*/, 10];
                    case 3:
                        if (!((msgParsed === null || msgParsed === void 0 ? void 0 : msgParsed.type) === "CHALLENGEVERIFICATION")) return [3 /*break*/, 10];
                        if (this._receivedChallengeVerification)
                            return [2 /*return*/];
                        return [4 /*yield*/, (0, signatures_1.verifyChallengeVerification)(msgParsed, this._pubsubTopicWithfallback(), true)];
                    case 4:
                        signatureValidation = _e.sent();
                        if (!signatureValidation.valid) {
                            error = new plebbit_error_1.PlebbitError("ERR_CHALLENGE_VERIFICATION_SIGNATURE_IS_INVALID", {
                                pubsubMsg: msgParsed,
                                reason: signatureValidation.reason
                            });
                            this._updatePublishingState("failed");
                            log.error(error.toString());
                            this.emit("error", error);
                            return [2 /*return*/];
                        }
                        this._receivedChallengeVerification = true;
                        decryptedPublication = void 0;
                        if (!msgParsed.challengeSuccess) return [3 /*break*/, 7];
                        this._updatePublishingState("succeeded");
                        log("Challenge (".concat(msgParsed.challengeRequestId, ") has passed"));
                        if (!msgParsed.encryptedPublication) return [3 /*break*/, 6];
                        _d = (_c = JSON).parse;
                        return [4 /*yield*/, (0, signer_1.decryptEd25519AesGcm)(msgParsed.encryptedPublication, this.pubsubMessageSigner.privateKey, this.subplebbit.encryption.publicKey)];
                    case 5:
                        decryptedPublication = _d.apply(_c, [_e.sent()]);
                        (0, assert_1.default)(decryptedPublication);
                        this._initProps(decryptedPublication);
                        _e.label = 6;
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        this._updatePublishingState("failed");
                        log("Challenge ".concat(msgParsed.challengeRequestId, " has failed to pass. Challenge errors = ").concat(msgParsed.challengeErrors, ", reason = '").concat(msgParsed.reason, "'"));
                        _e.label = 8;
                    case 8: return [4 /*yield*/, this._clientsManager.pubsubUnsubscribe(this._pubsubTopicWithfallback(), this.handleChallengeExchange)];
                    case 9:
                        _e.sent();
                        this._pubsubProviders.forEach(function (provider) { return _this._clientsManager.updatePubsubState("stopped", provider); });
                        this.emit("challengeverification", __assign(__assign({}, msgParsed), { publication: decryptedPublication }), this instanceof comment_1.Comment && decryptedPublication ? this : undefined);
                        _e.label = 10;
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    Publication.prototype.publishChallengeAnswers = function (challengeAnswers) {
        return __awaiter(this, void 0, void 0, function () {
            var log, encryptedChallengeAnswers, toSignAnswer, _a, _b, _c, providers;
            var _d;
            var _this = this;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        (0, assert_1.default)(this.subplebbit, "Subplebbit is not defined");
                        log = (0, plebbit_logger_1.default)("plebbit-js:publication:publishChallengeAnswers");
                        if (!Array.isArray(challengeAnswers))
                            challengeAnswers = [challengeAnswers];
                        return [4 /*yield*/, (0, signer_1.encryptEd25519AesGcm)(JSON.stringify(challengeAnswers), this.pubsubMessageSigner.privateKey, this.subplebbit.encryption.publicKey)];
                    case 1:
                        encryptedChallengeAnswers = _e.sent();
                        toSignAnswer = {
                            type: "CHALLENGEANSWER",
                            challengeRequestId: this._challenge.challengeRequestId,
                            encryptedChallengeAnswers: encryptedChallengeAnswers,
                            userAgent: version_1.default.USER_AGENT,
                            protocolVersion: version_1.default.PROTOCOL_VERSION,
                            timestamp: (0, util_1.timestamp)()
                        };
                        _a = this;
                        _b = challenge_1.ChallengeAnswerMessage.bind;
                        _c = [__assign({}, toSignAnswer)];
                        _d = {};
                        return [4 /*yield*/, (0, signatures_1.signChallengeAnswer)(toSignAnswer, this.pubsubMessageSigner)];
                    case 2:
                        _a._challengeAnswer = new (_b.apply(challenge_1.ChallengeAnswerMessage, [void 0, __assign.apply(void 0, _c.concat([(_d.signature = _e.sent(), _d)]))]))();
                        this._updatePublishingState("publishing-challenge-answer");
                        this._clientsManager.updatePubsubState("publishing-challenge-answer", this._pubsubProviders[this._currentPubsubProviderIndex]);
                        return [4 /*yield*/, this._clientsManager.pubsubPublishOnProvider(this._pubsubTopicWithfallback(), this._challengeAnswer, this._pubsubProviders[this._currentPubsubProviderIndex])];
                    case 3:
                        _e.sent();
                        this._updatePublishingState("waiting-challenge-verification");
                        providers = Object.entries(this._clientsManager.providerSubscriptions)
                            .filter(function (_a) {
                            var pubsubTopics = _a[1];
                            return pubsubTopics.includes(_this._pubsubTopicWithfallback());
                        })
                            .map(function (_a) {
                            var provider = _a[0];
                            return provider;
                        });
                        providers.forEach(function (provider) { return _this._clientsManager.updatePubsubState("waiting-challenge-verification", provider); });
                        log("Responded to challenge (".concat(this._challengeAnswer.challengeRequestId, ") with answers"), challengeAnswers);
                        this.emit("challengeanswer", __assign(__assign({}, this._challengeAnswer), { challengeAnswers: challengeAnswers }));
                        return [2 /*return*/];
                }
            });
        });
    };
    Publication.prototype._validatePublicationFields = function () {
        var _a, _b;
        if (typeof this.timestamp !== "number" || this.timestamp < 0)
            (0, util_1.throwWithErrorCode)("ERR_PUBLICATION_MISSING_FIELD", { type: this.getType, timestamp: this.timestamp });
        if (typeof ((_a = this.author) === null || _a === void 0 ? void 0 : _a.address) !== "string")
            (0, util_1.throwWithErrorCode)("ERR_PUBLICATION_MISSING_FIELD", { type: this.getType(), authorAddress: (_b = this.author) === null || _b === void 0 ? void 0 : _b.address });
        if (typeof this.subplebbitAddress !== "string")
            (0, util_1.throwWithErrorCode)("ERR_PUBLICATION_MISSING_FIELD", { type: this.getType(), subplebbitAddress: this.subplebbitAddress });
    };
    Publication.prototype._validateSubFields = function () {
        var _a, _b, _c, _d, _e, _f;
        if (typeof ((_b = (_a = this.subplebbit) === null || _a === void 0 ? void 0 : _a.encryption) === null || _b === void 0 ? void 0 : _b.publicKey) !== "string")
            (0, util_1.throwWithErrorCode)("ERR_SUBPLEBBIT_MISSING_FIELD", { subplebbitPublicKey: (_d = (_c = this.subplebbit) === null || _c === void 0 ? void 0 : _c.encryption) === null || _d === void 0 ? void 0 : _d.publicKey });
        if (typeof this._pubsubTopicWithfallback() !== "string")
            (0, util_1.throwWithErrorCode)("ERR_SUBPLEBBIT_MISSING_FIELD", {
                pubsubTopic: (_e = this.subplebbit) === null || _e === void 0 ? void 0 : _e.pubsubTopic,
                address: (_f = this.subplebbit) === null || _f === void 0 ? void 0 : _f.address
            });
    };
    Publication.prototype._updatePublishingState = function (newState) {
        this.publishingState = newState;
        this.emit("publishingstatechange", this.publishingState);
    };
    Publication.prototype._updateState = function (newState) {
        this.state = newState;
        this.emit("statechange", this.state);
    };
    Publication.prototype._pubsubTopicWithfallback = function () {
        return this.subplebbit.pubsubTopic || this.subplebbit.address;
    };
    Publication.prototype._getSubplebbitCache = function () {
        var cachedSubplebbit = constants_1.subplebbitForPublishingCache.get(this.subplebbitAddress);
        return cachedSubplebbit;
    };
    Publication.prototype.stop = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.subplebbit) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._clientsManager.pubsubUnsubscribe(this._pubsubTopicWithfallback(), this.handleChallengeExchange)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        this._updatePublishingState("stopped");
                        return [2 /*return*/];
                }
            });
        });
    };
    Publication.prototype._isAllAttemptsExhausted = function () {
        // When all providers failed to publish
        // OR they're done with waiting
        var allProvidersFailedToPublish = this._currentPubsubProviderIndex === this._pubsubProviders.length && this._publishedChallengeRequests.length === 0;
        var allProvidersDoneWithWaiting = Object.keys(this._pubsubProvidersDoneWaiting).length === 0
            ? false
            : Object.values(this._pubsubProvidersDoneWaiting).every(function (b) { return b; });
        return allProvidersFailedToPublish || allProvidersDoneWithWaiting;
    };
    Publication.prototype._setProviderToFailIfNoResponse = function (providerIndex) {
        var _this = this;
        setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
            var log, allAttemptsFailedError;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this._pubsubProvidersDoneWaiting[this._pubsubProviders[providerIndex]] = true;
                        if (!(!this._receivedChallengeFromSub && !this._receivedChallengeVerification)) return [3 /*break*/, 2];
                        log = (0, plebbit_logger_1.default)("plebbit-js:publication:publish");
                        log.error("Provider (".concat(this._pubsubProviders[providerIndex], ") did not receive a response after ").concat(this._setProviderFailureThresholdSeconds, "s, will unsubscribe and set state to stopped"));
                        return [4 /*yield*/, this._clientsManager.pubsubUnsubscribeOnProvider(this._pubsubTopicWithfallback(), this._pubsubProviders[providerIndex], this.handleChallengeExchange)];
                    case 1:
                        _a.sent();
                        this._clientsManager.updatePubsubState("stopped", this._pubsubProviders[providerIndex]);
                        if (this._isAllAttemptsExhausted()) {
                            allAttemptsFailedError = new plebbit_error_1.PlebbitError("ERR_CHALLENGE_REQUEST_RECEIVED_NO_RESPONSE_FROM_ANY_PROVIDER", {
                                pubsubProviders: this._pubsubProviders,
                                pubsubTopic: this._pubsubTopicWithfallback()
                            });
                            log.error(String(allAttemptsFailedError));
                            this._updatePublishingState("failed");
                            this.emit("error", allAttemptsFailedError);
                        }
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        }); }, this._setProviderFailureThresholdSeconds * 1000);
    };
    Publication.prototype.publish = function () {
        return __awaiter(this, void 0, void 0, function () {
            var log, options, _a, _b, e_1, _c, encryptedPublication, challengeRequestId, toSignMsg, challengeRequest, _d, _e, e_2, allAttemptsFailedError;
            var _f;
            var _this = this;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:publication:publish");
                        this._validatePublicationFields();
                        if (!this._publishedChallengeRequests) {
                            this._publishedChallengeRequests = [];
                            this._pubsubProviders = Object.keys(this._plebbit.clients.pubsubClients);
                            this._pubsubProvidersDoneWaiting = {};
                            this._currentPubsubProviderIndex = 0;
                            if (this._pubsubProviders.length === 1)
                                this._pubsubProviders.push(this._pubsubProviders[0]); // Same provider should be retried twice if publishing fails
                        }
                        (0, assert_1.default)(this._currentPubsubProviderIndex < this._pubsubProviders.length, "There is miscalculation of current pubsub provider index");
                        this._updateState("publishing");
                        options = { acceptedChallengeTypes: [] };
                        _g.label = 1;
                    case 1:
                        _g.trys.push([1, 4, , 5]);
                        _a = this;
                        _b = this._getSubplebbitCache();
                        if (_b) return [3 /*break*/, 3];
                        return [4 /*yield*/, this._clientsManager.fetchSubplebbitForPublishing(this.subplebbitAddress)];
                    case 2:
                        _b = (_g.sent());
                        _g.label = 3;
                    case 3:
                        _a.subplebbit = _b;
                        return [3 /*break*/, 5];
                    case 4:
                        e_1 = _g.sent();
                        this._updateState("stopped");
                        this._updatePublishingState("failed");
                        if (this._clientsManager._defaultIpfsProviderUrl)
                            this._clientsManager.updateIpfsState("stopped");
                        throw e_1;
                    case 5:
                        this._validateSubFields();
                        _c = this;
                        return [4 /*yield*/, this._plebbit.createSigner()];
                    case 6:
                        _c.pubsubMessageSigner = _g.sent();
                        return [4 /*yield*/, (0, signer_1.encryptEd25519AesGcm)(JSON.stringify(this.toJSONPubsubMessagePublication()), this.pubsubMessageSigner.privateKey, this.subplebbit.encryption.publicKey)];
                    case 7:
                        encryptedPublication = _g.sent();
                        return [4 /*yield*/, (0, util_2.getBufferedPlebbitAddressFromPublicKey)(this.pubsubMessageSigner.publicKey)];
                    case 8:
                        challengeRequestId = _g.sent();
                        toSignMsg = {
                            type: "CHALLENGEREQUEST",
                            encryptedPublication: encryptedPublication,
                            challengeRequestId: challengeRequestId,
                            acceptedChallengeTypes: options.acceptedChallengeTypes,
                            userAgent: version_1.default.USER_AGENT,
                            protocolVersion: version_1.default.PROTOCOL_VERSION,
                            timestamp: (0, util_1.timestamp)()
                        };
                        _d = challenge_1.ChallengeRequestMessage.bind;
                        _e = [__assign({}, toSignMsg)];
                        _f = {};
                        return [4 /*yield*/, (0, signatures_1.signChallengeRequest)(toSignMsg, this.pubsubMessageSigner)];
                    case 9:
                        challengeRequest = new (_d.apply(challenge_1.ChallengeRequestMessage, [void 0, __assign.apply(void 0, _e.concat([(_f.signature = _g.sent(), _f)]))]))();
                        log("Attempting to publish ".concat(this.getType(), " with challenge id (").concat(challengeRequest.challengeRequestId, ") to pubsub topic (").concat(this._pubsubTopicWithfallback(), ") with provider (").concat(this._pubsubProviders[this._currentPubsubProviderIndex], "): "), this.toJSONPubsubMessagePublication());
                        _g.label = 10;
                    case 10:
                        if (!(this._currentPubsubProviderIndex < this._pubsubProviders.length)) return [3 /*break*/, 19];
                        this._updatePublishingState("publishing-challenge-request");
                        this._clientsManager.updatePubsubState("subscribing-pubsub", this._pubsubProviders[this._currentPubsubProviderIndex]);
                        _g.label = 11;
                    case 11:
                        _g.trys.push([11, 14, , 18]);
                        return [4 /*yield*/, this._clientsManager.pubsubSubscribeOnProvider(this._pubsubTopicWithfallback(), this.handleChallengeExchange, this._pubsubProviders[this._currentPubsubProviderIndex])];
                    case 12:
                        _g.sent();
                        this._clientsManager.updatePubsubState("publishing-challenge-request", this._pubsubProviders[this._currentPubsubProviderIndex]);
                        return [4 /*yield*/, this._clientsManager.pubsubPublishOnProvider(this._pubsubTopicWithfallback(), challengeRequest, this._pubsubProviders[this._currentPubsubProviderIndex])];
                    case 13:
                        _g.sent();
                        return [3 /*break*/, 18];
                    case 14:
                        e_2 = _g.sent();
                        this._clientsManager.updatePubsubState("stopped", this._pubsubProviders[this._currentPubsubProviderIndex]);
                        log.error("Failed to publish challenge request using provider ", this._pubsubProviders[this._currentPubsubProviderIndex]);
                        this._currentPubsubProviderIndex += 1;
                        if (!this._isAllAttemptsExhausted()) return [3 /*break*/, 16];
                        return [4 /*yield*/, this._clientsManager.pubsubUnsubscribe(this._pubsubTopicWithfallback(), this.handleChallengeExchange)];
                    case 15:
                        _g.sent();
                        this._updatePublishingState("failed");
                        allAttemptsFailedError = new plebbit_error_1.PlebbitError("ERR_ALL_PUBSUB_PROVIDERS_THROW_ERRORS", {
                            pubsubProviders: this._pubsubProviders,
                            pubsubTopic: this._pubsubTopicWithfallback()
                        });
                        log.error(String(allAttemptsFailedError));
                        this.emit("error", allAttemptsFailedError);
                        throw allAttemptsFailedError;
                    case 16:
                        if (this._currentPubsubProviderIndex === this._pubsubProviders.length)
                            return [2 /*return*/];
                        else
                            return [3 /*break*/, 10];
                        _g.label = 17;
                    case 17: return [3 /*break*/, 18];
                    case 18:
                        this._pubsubProvidersDoneWaiting[this._pubsubProviders[this._currentPubsubProviderIndex]] = false;
                        this._publishedChallengeRequests.push(challengeRequest);
                        this._clientsManager.updatePubsubState("waiting-challenge", this._pubsubProviders[this._currentPubsubProviderIndex]);
                        this._setProviderToFailIfNoResponse(this._currentPubsubProviderIndex);
                        this._updatePublishingState("waiting-challenge");
                        log("Sent a challenge request (".concat(challengeRequest.challengeRequestId, ") with provider (").concat(this._pubsubProviders[this._currentPubsubProviderIndex], ")"));
                        this.emit("challengerequest", __assign(__assign({}, challengeRequest), { publication: this.toJSONPubsubMessagePublication() }));
                        return [3 /*break*/, 19];
                    case 19:
                        // to handle cases where request is published but we didn't receive response within certain timeframe (20s for now)
                        // Maybe the sub didn't receive the request, or the provider did not relay the challenge from sub for some reason
                        setTimeout(function () {
                            if (!_this._receivedChallengeFromSub && !_this._receivedChallengeVerification) {
                                if (_this._isAllAttemptsExhausted()) {
                                    // plebbit-js tried all providers and still no response is received
                                    log.error("Failed to receive any response for publication");
                                    _this._updatePublishingState("failed");
                                    var error = new plebbit_error_1.PlebbitError("ERR_PUBSUB_DID_NOT_RECEIVE_RESPONSE_AFTER_PUBLISHING_CHALLENGE_REQUEST", {
                                        pubsubProviders: _this._pubsubProviders,
                                        publishedChallengeRequests: _this._publishedChallengeRequests,
                                        publishToDifferentProviderThresholdSeconds: _this._publishToDifferentProviderThresholdSeconds
                                    });
                                    _this.emit("error", error);
                                }
                                else {
                                    log("Re-publishing publication after ".concat(_this._publishToDifferentProviderThresholdSeconds, "s of not receiving challenge from provider (").concat(_this._pubsubProviders[_this._currentPubsubProviderIndex], ")"));
                                    _this._plebbit.stats.recordGatewayFailure(_this._pubsubProviders[_this._currentPubsubProviderIndex], "pubsub-publish");
                                    _this._plebbit.stats.recordGatewayFailure(_this._pubsubProviders[_this._currentPubsubProviderIndex], "pubsub-subscribe");
                                    _this._currentPubsubProviderIndex += 1;
                                    if (_this._currentPubsubProviderIndex < _this._pubsubProviders.length)
                                        _this.publish();
                                }
                            }
                        }, this._publishToDifferentProviderThresholdSeconds * 1000);
                        return [2 /*return*/];
                }
            });
        });
    };
    return Publication;
}(tiny_typed_emitter_1.TypedEmitter));
exports.default = Publication;
//# sourceMappingURL=publication.js.map