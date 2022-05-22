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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var challenge_1 = require("./challenge");
var from_string_1 = require("uint8arrays/from-string");
var uuid_1 = require("uuid");
var to_string_1 = require("uint8arrays/to-string");
var events_1 = __importDefault(require("events"));
var debug_1 = __importDefault(require("debug"));
var util_1 = require("./util");
var author_1 = __importDefault(require("./author"));
var assert_1 = __importDefault(require("assert"));
var signer_1 = require("./signer");
var debug = (0, debug_1.default)("plebbit-js:publication");
var Publication = /** @class */ (function (_super) {
    __extends(Publication, _super);
    function Publication(props, subplebbit) {
        var _this = _super.call(this) || this;
        _this.subplebbit = subplebbit;
        _this._initProps(props);
        return _this;
    }
    Publication.prototype._initProps = function (props) {
        this.subplebbitAddress = props["subplebbitAddress"];
        this.timestamp = props["timestamp"];
        this.signer = this.signer || props["signer"];
        this.signature = (0, util_1.parseJsonIfString)(props["signature"]);
        this.author = props["author"] ? new author_1.default(props["author"]) : undefined;
    };
    Publication.prototype.getType = function () {
        if (this.hasOwnProperty("title"))
            return "post";
        else if (this.hasOwnProperty("vote"))
            return "vote";
        else
            return "comment";
    };
    Publication.prototype.toJSON = function () {
        return __assign({}, this.toJSONSkeleton());
    };
    Publication.prototype.toJSONSkeleton = function () {
        return {
            subplebbitAddress: this.subplebbitAddress,
            timestamp: this.timestamp,
            signature: this.signature,
            author: this.author
        };
    };
    Publication.prototype.handleChallengeExchange = function (pubsubMsg) {
        return __awaiter(this, void 0, void 0, function () {
            var msgParsed, _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        msgParsed = JSON.parse((0, to_string_1.toString)(pubsubMsg["data"]));
                        if ((msgParsed === null || msgParsed === void 0 ? void 0 : msgParsed.challengeRequestId) !== this.challenge.challengeRequestId)
                            return [2 /*return*/]; // Process only this publication's challenge
                        if (!((msgParsed === null || msgParsed === void 0 ? void 0 : msgParsed.type) === challenge_1.PUBSUB_MESSAGE_TYPES.CHALLENGE)) return [3 /*break*/, 1];
                        debug("Received challenges, will emit them and wait for user to solve them and call publishChallengeAnswers");
                        this.emit("challenge", msgParsed);
                        return [3 /*break*/, 6];
                    case 1:
                        if (!((msgParsed === null || msgParsed === void 0 ? void 0 : msgParsed.type) === challenge_1.PUBSUB_MESSAGE_TYPES.CHALLENGEVERIFICATION)) return [3 /*break*/, 6];
                        if (!!msgParsed.challengePassed) return [3 /*break*/, 2];
                        debug("Challenge ".concat(msgParsed.challengeRequestId, " has failed to pass. Challenge errors = ").concat(msgParsed.challengeErrors, ", reason = ").concat(msgParsed.reason));
                        return [3 /*break*/, 4];
                    case 2:
                        debug("Challenge (".concat(msgParsed.challengeRequestId, ") has passed. Will update publication props from ChallengeVerificationMessage.publication"));
                        _a = msgParsed;
                        _c = (_b = JSON).parse;
                        return [4 /*yield*/, (0, signer_1.decrypt)(msgParsed.encryptedPublication.encrypted, msgParsed.encryptedPublication.encryptedKey, this.signer.privateKey)];
                    case 3:
                        _a.publication = _c.apply(_b, [_d.sent()]);
                        this._initProps(msgParsed.publication);
                        _d.label = 4;
                    case 4:
                        this.emit("challengeverification", [msgParsed, this]);
                        return [4 /*yield*/, this.subplebbit.plebbit.pubsubIpfsClient.pubsub.unsubscribe(this.subplebbit.pubsubTopic)];
                    case 5:
                        _d.sent();
                        _d.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    Publication.prototype.publishChallengeAnswers = function (challengeAnswers) {
        return __awaiter(this, void 0, void 0, function () {
            var challengeAnswer, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!Array.isArray(challengeAnswers))
                            challengeAnswers = [challengeAnswers];
                        debug("Challenge Answers: ".concat(challengeAnswers));
                        challengeAnswer = new challenge_1.ChallengeAnswerMessage({
                            challengeRequestId: this.challenge.challengeRequestId,
                            challengeAnswerId: (0, uuid_1.v4)(),
                            challengeAnswers: challengeAnswers
                        });
                        return [4 /*yield*/, this.subplebbit.plebbit.pubsubIpfsClient.pubsub.publish(this.subplebbit.pubsubTopic, (0, from_string_1.fromString)(JSON.stringify(challengeAnswer)))];
                    case 1:
                        _a.sent();
                        debug("Responded to challenge (".concat(challengeAnswer.challengeRequestId, ") with answers ").concat(JSON.stringify(challengeAnswers)));
                        return [3 /*break*/, 3];
                    case 2:
                        e_1 = _a.sent();
                        debug("Failed to publish challenge answers: ", e_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    Publication.prototype.publish = function (userOptions) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var options, _c, encryptedPublication, e_2;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 4, , 5]);
                        options = __assign({ acceptedChallengeTypes: [] }, userOptions);
                        debug("Attempting to publish ".concat(this.getType(), " with options (").concat(JSON.stringify(options), ")"));
                        _c = this;
                        return [4 /*yield*/, this.subplebbit.plebbit.getSubplebbit(this.subplebbitAddress)];
                    case 1:
                        _c.subplebbit = _d.sent();
                        assert_1.default.ok((_b = (_a = this.subplebbit) === null || _a === void 0 ? void 0 : _a.encryption) === null || _b === void 0 ? void 0 : _b.publicKey, "Failed to load subplebbit for publishing");
                        return [4 /*yield*/, (0, signer_1.encrypt)(JSON.stringify(this), this.subplebbit.encryption.publicKey)];
                    case 2:
                        encryptedPublication = _d.sent();
                        this.challenge = new challenge_1.ChallengeRequestMessage(__assign({ encryptedPublication: encryptedPublication, challengeRequestId: (0, uuid_1.v4)() }, options));
                        return [4 /*yield*/, Promise.all([
                                this.subplebbit.plebbit.pubsubIpfsClient.pubsub.publish(this.subplebbit.pubsubTopic, (0, from_string_1.fromString)(JSON.stringify(this.challenge))),
                                this.subplebbit.plebbit.pubsubIpfsClient.pubsub.subscribe(this.subplebbit.pubsubTopic, this.handleChallengeExchange.bind(this))
                            ])];
                    case 3:
                        _d.sent();
                        debug("Sent a challenge request (".concat(this.challenge.challengeRequestId, ")"));
                        return [3 /*break*/, 5];
                    case 4:
                        e_2 = _d.sent();
                        debug("Failed to publish: ", e_2);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    return Publication;
}(events_1.default));
exports.default = Publication;
