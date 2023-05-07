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
        while (_) try {
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
var uuid_1 = require("uuid");
var to_string_1 = require("uint8arrays/to-string");
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
var Publication = /** @class */ (function (_super) {
    __extends(Publication, _super);
    function Publication(props, plebbit) {
        var _this = _super.call(this) || this;
        _this._plebbit = plebbit;
        _this._updatePublishingState("stopped");
        _this._updateState("stopped");
        _this._initClients();
        _this._initProps(props);
        _this.handleChallengeExchange = _this.handleChallengeExchange.bind(_this);
        _this.on("error", function () {
            var _a;
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return (_a = _this._plebbit).emit.apply(_a, __spreadArray(["error"], args, false));
        });
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
            var log, msgParsed, msgSignerAddress, challengeMsgValidity, error, decryptedChallenges, _a, _b, decryptedChallenge, signatureValidation, error, decryptedPublication, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:publication:handleChallengeExchange");
                        msgParsed = JSON.parse((0, to_string_1.toString)(pubsubMsg["data"]));
                        return [4 /*yield*/, (0, util_2.getPlebbitAddressFromPublicKey)(msgParsed.signature.publicKey)];
                    case 1:
                        msgSignerAddress = _e.sent();
                        if (msgSignerAddress !== this._pubsubTopicWithfallback())
                            return [2 /*return*/]; // Process only responses from sub
                        if ((msgParsed === null || msgParsed === void 0 ? void 0 : msgParsed.challengeRequestId) !== this._challengeRequest.challengeRequestId)
                            return [2 /*return*/]; // Process only this publication's challenge
                        if (!((msgParsed === null || msgParsed === void 0 ? void 0 : msgParsed.type) === "CHALLENGE")) return [3 /*break*/, 4];
                        return [4 /*yield*/, (0, signatures_1.verifyChallengeMessage)(msgParsed)];
                    case 2:
                        challengeMsgValidity = _e.sent();
                        if (!challengeMsgValidity.valid) {
                            error = new plebbit_error_1.PlebbitError("ERR_SIGNATURE_IS_INVALID", {
                                pubsubMsg: msgParsed,
                                signatureValidity: challengeMsgValidity
                            });
                            log.error(error.toString());
                            this.emit("error", error);
                            return [2 /*return*/];
                        }
                        log("Received encrypted challenges.  Will decrypt and emit them on \"challenge\" event. User shoud publish solution by calling publishChallengeAnswers");
                        _b = (_a = JSON).parse;
                        return [4 /*yield*/, (0, signer_1.decrypt)(msgParsed.encryptedChallenges, this.pubsubMessageSigner.privateKey, this.subplebbit.encryption.publicKey)];
                    case 3:
                        decryptedChallenges = _b.apply(_a, [_e.sent()]);
                        decryptedChallenge = __assign(__assign({}, msgParsed), { challenges: decryptedChallenges });
                        this._updatePublishingState("waiting-challenge-answers");
                        this._clientsManager.updatePubsubState("waiting-challenge-answers");
                        this.emit("challenge", decryptedChallenge);
                        return [3 /*break*/, 11];
                    case 4:
                        if (!((msgParsed === null || msgParsed === void 0 ? void 0 : msgParsed.type) === "CHALLENGEVERIFICATION")) return [3 /*break*/, 11];
                        return [4 /*yield*/, (0, signatures_1.verifyChallengeVerification)(msgParsed)];
                    case 5:
                        signatureValidation = _e.sent();
                        if (!signatureValidation.valid) {
                            error = new plebbit_error_1.PlebbitError("ERR_SIGNATURE_IS_INVALID", {
                                signatureValidity: signatureValidation,
                                pubsubMsg: msgParsed
                            });
                            this._updatePublishingState("failed");
                            log.error(error.toString());
                            this.emit("error", error);
                            return [2 /*return*/];
                        }
                        decryptedPublication = void 0;
                        if (!msgParsed.challengeSuccess) return [3 /*break*/, 8];
                        this._updatePublishingState("succeeded");
                        log("Challenge (".concat(msgParsed.challengeRequestId, ") has passed"));
                        if (!msgParsed.encryptedPublication) return [3 /*break*/, 7];
                        _d = (_c = JSON).parse;
                        return [4 /*yield*/, (0, signer_1.decrypt)(msgParsed.encryptedPublication, this.pubsubMessageSigner.privateKey, this.subplebbit.encryption.publicKey)];
                    case 6:
                        decryptedPublication = _d.apply(_c, [_e.sent()]);
                        (0, assert_1.default)(decryptedPublication);
                        this._initProps(decryptedPublication);
                        _e.label = 7;
                    case 7: return [3 /*break*/, 9];
                    case 8:
                        this._updatePublishingState("failed");
                        log("Challenge ".concat(msgParsed.challengeRequestId, " has failed to pass. Challenge errors = ").concat(msgParsed.challengeErrors, ", reason = '").concat(msgParsed.reason, "'"));
                        _e.label = 9;
                    case 9: return [4 /*yield*/, this._clientsManager.pubsubUnsubscribe(this._pubsubTopicWithfallback(), this.handleChallengeExchange)];
                    case 10:
                        _e.sent();
                        this._clientsManager.updatePubsubState("stopped");
                        this.emit("challengeverification", __assign(__assign({}, msgParsed), { publication: decryptedPublication }), this instanceof comment_1.Comment && decryptedPublication ? this : undefined);
                        _e.label = 11;
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    Publication.prototype.publishChallengeAnswers = function (challengeAnswers) {
        return __awaiter(this, void 0, void 0, function () {
            var log, encryptedChallengeAnswers, toSignAnswer, _a, _b, _c;
            var _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        (0, assert_1.default)(this.subplebbit, "Subplebbit is not defined");
                        log = (0, plebbit_logger_1.default)("plebbit-js:publication:publishChallengeAnswers");
                        if (!Array.isArray(challengeAnswers))
                            challengeAnswers = [challengeAnswers];
                        this._updatePublishingState("publishing-challenge-answer");
                        this._clientsManager.updatePubsubState("publishing-challenge-answers");
                        return [4 /*yield*/, (0, signer_1.encrypt)(JSON.stringify(challengeAnswers), this.pubsubMessageSigner.privateKey, this.subplebbit.encryption.publicKey)];
                    case 1:
                        encryptedChallengeAnswers = _e.sent();
                        toSignAnswer = {
                            type: "CHALLENGEANSWER",
                            challengeRequestId: this._challengeRequest.challengeRequestId,
                            challengeAnswerId: (0, uuid_1.v4)(),
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
                        return [4 /*yield*/, this._clientsManager.publishChallengeAnswer(this._pubsubTopicWithfallback(), JSON.stringify(this._challengeAnswer))];
                    case 3:
                        _e.sent();
                        this._updatePublishingState("waiting-challenge-verification");
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
    Publication.prototype.publish = function () {
        return __awaiter(this, void 0, void 0, function () {
            var log, options, _a, _b, encryptedPublication, toSignMsg, _c, _d, _e;
            var _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:publication:publish");
                        this._updateState("publishing");
                        this._validatePublicationFields();
                        options = { acceptedChallengeTypes: [] };
                        this._updatePublishingState("resolving-subplebbit-address");
                        _a = this;
                        return [4 /*yield*/, this._clientsManager.fetchSubplebbitForPublishing(this.subplebbitAddress)];
                    case 1:
                        _a.subplebbit = _g.sent();
                        this._updatePublishingState("publishing-challenge-request");
                        this._clientsManager.updatePubsubState("publishing-challenge-request");
                        this._validateSubFields();
                        return [4 /*yield*/, this._clientsManager.pubsubUnsubscribe(this._pubsubTopicWithfallback(), this.handleChallengeExchange)];
                    case 2:
                        _g.sent();
                        _b = this;
                        return [4 /*yield*/, this._plebbit.createSigner()];
                    case 3:
                        _b.pubsubMessageSigner = _g.sent();
                        return [4 /*yield*/, (0, signer_1.encrypt)(JSON.stringify(this.toJSONPubsubMessagePublication()), this.pubsubMessageSigner.privateKey, this.subplebbit.encryption.publicKey)];
                    case 4:
                        encryptedPublication = _g.sent();
                        toSignMsg = {
                            type: "CHALLENGEREQUEST",
                            encryptedPublication: encryptedPublication,
                            challengeRequestId: (0, uuid_1.v4)(),
                            acceptedChallengeTypes: options.acceptedChallengeTypes,
                            userAgent: version_1.default.USER_AGENT,
                            protocolVersion: version_1.default.PROTOCOL_VERSION,
                            timestamp: (0, util_1.timestamp)()
                        };
                        _c = this;
                        _d = challenge_1.ChallengeRequestMessage.bind;
                        _e = [__assign({}, toSignMsg)];
                        _f = {};
                        return [4 /*yield*/, (0, signatures_1.signChallengeRequest)(toSignMsg, this.pubsubMessageSigner)];
                    case 5:
                        _c._challengeRequest = new (_d.apply(challenge_1.ChallengeRequestMessage, [void 0, __assign.apply(void 0, _e.concat([(_f.signature = _g.sent(), _f)]))]))();
                        log.trace("Attempting to publish ".concat(this.getType(), " with options"), options);
                        return [4 /*yield*/, this._clientsManager.publishChallengeRequest(this._pubsubTopicWithfallback(), JSON.stringify(this._challengeRequest))];
                    case 6:
                        _g.sent();
                        return [4 /*yield*/, this._clientsManager.pubsubSubscribe(this._pubsubTopicWithfallback(), this.handleChallengeExchange)];
                    case 7:
                        _g.sent();
                        this._clientsManager.updatePubsubState("waiting-challenge");
                        this._updatePublishingState("waiting-challenge");
                        log("Sent a challenge request (".concat(this._challengeRequest.challengeRequestId, ")"));
                        this.emit("challengerequest", __assign(__assign({}, this._challengeRequest), { publication: this.toJSONPubsubMessagePublication() }));
                        return [2 /*return*/];
                }
            });
        });
    };
    return Publication;
}(tiny_typed_emitter_1.TypedEmitter));
exports.default = Publication;
//# sourceMappingURL=publication.js.map