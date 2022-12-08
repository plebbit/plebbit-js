"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChallengeVerificationMessage = exports.ChallengeAnswerMessage = exports.ChallengeMessage = exports.ChallengeRequestMessage = exports.Challenge = exports.PUBSUB_MESSAGE_TYPES = void 0;
exports.PUBSUB_MESSAGE_TYPES = Object.freeze({
    CHALLENGEREQUEST: "CHALLENGEREQUEST",
    CHALLENGE: "CHALLENGE",
    CHALLENGEANSWER: "CHALLENGEANSWER",
    CHALLENGEVERIFICATION: "CHALLENGEVERIFICATION"
});
var Challenge = /** @class */ (function () {
    function Challenge(props) {
        this.challenge = props.challenge;
        this.type = props.type;
    }
    Challenge.prototype.toJSON = function () {
        return {
            challenge: this.challenge,
            type: this.type
        };
    };
    return Challenge;
}());
exports.Challenge = Challenge;
var ChallengeRequestMessage = /** @class */ (function () {
    function ChallengeRequestMessage(props) {
        this.type = "CHALLENGEREQUEST";
        this.challengeRequestId = props.challengeRequestId;
        this.acceptedChallengeTypes = props.acceptedChallengeTypes;
        this.encryptedPublication = props.encryptedPublication;
        this.signature = props.signature;
        this.protocolVersion = props.protocolVersion;
        this.userAgent = props.userAgent;
    }
    ChallengeRequestMessage.prototype.toJSON = function () {
        return {
            type: this.type,
            challengeRequestId: this.challengeRequestId,
            acceptedChallengeTypes: this.acceptedChallengeTypes,
            encryptedPublication: this.encryptedPublication,
            signature: this.signature,
            userAgent: this.userAgent,
            protocolVersion: this.protocolVersion
        };
    };
    ChallengeRequestMessage.prototype.toJSONForDb = function () {
        return {
            type: this.type,
            challengeRequestId: this.challengeRequestId,
            acceptedChallengeTypes: this.acceptedChallengeTypes,
            userAgent: this.userAgent,
            protocolVersion: this.protocolVersion
        };
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
    }
    ChallengeMessage.prototype.toJSON = function () {
        return {
            encryptedChallenges: this.encryptedChallenges,
            type: this.type,
            challengeRequestId: this.challengeRequestId,
            signature: this.signature,
            userAgent: this.userAgent,
            protocolVersion: this.protocolVersion
        };
    };
    ChallengeMessage.prototype.toJSONForDb = function () {
        return {
            type: this.type,
            challengeRequestId: this.challengeRequestId,
            userAgent: this.userAgent,
            protocolVersion: this.protocolVersion
        };
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
    }
    ChallengeAnswerMessage.prototype.toJSON = function () {
        return {
            type: this.type,
            challengeRequestId: this.challengeRequestId,
            challengeAnswerId: this.challengeAnswerId,
            encryptedChallengeAnswers: this.encryptedChallengeAnswers,
            signature: this.signature,
            protocolVersion: this.protocolVersion,
            userAgent: this.userAgent
        };
    };
    ChallengeAnswerMessage.prototype.toJSONForDb = function () {
        return {
            type: this.type,
            challengeRequestId: this.challengeRequestId,
            challengeAnswerId: this.challengeAnswerId,
            protocolVersion: this.protocolVersion,
            userAgent: this.userAgent
        };
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
            userAgent: this.userAgent
        };
    };
    ChallengeVerificationMessage.prototype.toJSONForDb = function () {
        return {
            type: this.type,
            challengeRequestId: this.challengeRequestId,
            challengeAnswerId: this.challengeAnswerId,
            challengeSuccess: this.challengeSuccess,
            challengeErrors: this.challengeErrors,
            reason: this.reason,
            protocolVersion: this.protocolVersion,
            userAgent: this.userAgent
        };
    };
    return ChallengeVerificationMessage;
}());
exports.ChallengeVerificationMessage = ChallengeVerificationMessage;
//# sourceMappingURL=challenge.js.map