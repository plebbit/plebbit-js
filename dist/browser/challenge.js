"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChallengeVerificationMessage = exports.ChallengeAnswerMessage = exports.ChallengeMessage = exports.ChallengeRequestMessage = void 0;
var lodash_1 = __importDefault(require("lodash"));
var ChallengeRequestMessage = /** @class */ (function () {
    function ChallengeRequestMessage(props) {
        this.type = "CHALLENGEREQUEST";
        this.challengeRequestId = props.challengeRequestId;
        this.acceptedChallengeTypes = props.acceptedChallengeTypes;
        this.encryptedPublication = props.encryptedPublication;
        this.signature = props.signature;
        this.protocolVersion = props.protocolVersion;
        this.userAgent = props.userAgent;
        this.timestamp = props.timestamp;
    }
    ChallengeRequestMessage.prototype.toJSON = function () {
        return {
            type: this.type,
            challengeRequestId: this.challengeRequestId,
            acceptedChallengeTypes: this.acceptedChallengeTypes,
            encryptedPublication: this.encryptedPublication,
            signature: this.signature,
            userAgent: this.userAgent,
            protocolVersion: this.protocolVersion,
            timestamp: this.timestamp
        };
    };
    ChallengeRequestMessage.prototype.toJSONForDb = function () {
        return __assign({}, lodash_1.default.omit(this.toJSON(), ["type", "encryptedPublication"]));
    };
    return ChallengeRequestMessage;
}());
exports.ChallengeRequestMessage = ChallengeRequestMessage;
var ChallengeMessage = /** @class */ (function () {
    function ChallengeMessage(props) {
        this.type = "CHALLENGE";
        this.challengeRequestId = props.challengeRequestId;
        this.encryptedChallenges = props.encryptedChallenges;
        this.signature = props.signature;
        this.protocolVersion = props.protocolVersion;
        this.userAgent = props.userAgent;
        this.timestamp = props.timestamp;
    }
    ChallengeMessage.prototype.toJSON = function () {
        return {
            encryptedChallenges: this.encryptedChallenges,
            type: this.type,
            challengeRequestId: this.challengeRequestId,
            signature: this.signature,
            userAgent: this.userAgent,
            protocolVersion: this.protocolVersion,
            timestamp: this.timestamp
        };
    };
    ChallengeMessage.prototype.toJSONForDb = function (challengeTypes) {
        return __assign(__assign({}, lodash_1.default.omit(this.toJSON(), ["type", "encryptedChallenges"])), { challengeTypes: challengeTypes });
    };
    return ChallengeMessage;
}());
exports.ChallengeMessage = ChallengeMessage;
var ChallengeAnswerMessage = /** @class */ (function () {
    function ChallengeAnswerMessage(props) {
        this.type = "CHALLENGEANSWER";
        this.challengeAnswerId = props.challengeAnswerId;
        this.encryptedChallengeAnswers = props.encryptedChallengeAnswers;
        this.challengeRequestId = props.challengeRequestId;
        this.signature = props.signature;
        this.protocolVersion = props.protocolVersion;
        this.userAgent = props.userAgent;
        this.timestamp = props.timestamp;
    }
    ChallengeAnswerMessage.prototype.toJSON = function () {
        return {
            type: this.type,
            challengeRequestId: this.challengeRequestId,
            challengeAnswerId: this.challengeAnswerId,
            encryptedChallengeAnswers: this.encryptedChallengeAnswers,
            signature: this.signature,
            protocolVersion: this.protocolVersion,
            userAgent: this.userAgent,
            timestamp: this.timestamp
        };
    };
    ChallengeAnswerMessage.prototype.toJSONForDb = function (challengeAnswers) {
        return __assign(__assign({}, lodash_1.default.omit(this.toJSON(), ["type", "encryptedChallengeAnswers"])), { challengeAnswers: challengeAnswers });
    };
    return ChallengeAnswerMessage;
}());
exports.ChallengeAnswerMessage = ChallengeAnswerMessage;
var ChallengeVerificationMessage = /** @class */ (function () {
    function ChallengeVerificationMessage(props) {
        this.type = "CHALLENGEVERIFICATION";
        this.challengeRequestId = props.challengeRequestId;
        this.challengeAnswerId = props.challengeAnswerId;
        this.challengeSuccess = props.challengeSuccess;
        this.challengeErrors = props.challengeErrors;
        this.reason = props.reason;
        this.encryptedPublication = props.encryptedPublication;
        this.signature = props.signature;
        this.protocolVersion = props.protocolVersion;
        this.userAgent = props.userAgent;
        this.timestamp = props.timestamp;
    }
    ChallengeVerificationMessage.prototype.toJSON = function () {
        return {
            type: this.type,
            challengeRequestId: this.challengeRequestId,
            challengeAnswerId: this.challengeAnswerId,
            challengeSuccess: this.challengeSuccess,
            challengeErrors: this.challengeErrors,
            reason: this.reason,
            encryptedPublication: this.encryptedPublication,
            signature: this.signature,
            protocolVersion: this.protocolVersion,
            userAgent: this.userAgent,
            timestamp: this.timestamp
        };
    };
    ChallengeVerificationMessage.prototype.toJSONForDb = function () {
        return __assign({}, lodash_1.default.omit(this.toJSON(), ["type", "encryptedPublication"]));
    };
    return ChallengeVerificationMessage;
}());
exports.ChallengeVerificationMessage = ChallengeVerificationMessage;
