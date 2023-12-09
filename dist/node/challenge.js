"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChallengeVerificationMessage = exports.ChallengeAnswerMessage = exports.ChallengeMessage = exports.ChallengeRequestMessage = void 0;
var ChallengeRequestMessage = /** @class */ (function () {
    function ChallengeRequestMessage(props) {
        this.type = "CHALLENGEREQUEST";
        this.challengeRequestId = props.challengeRequestId;
        this.acceptedChallengeTypes = props.acceptedChallengeTypes;
        this.encrypted = props.encrypted;
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
            encrypted: this.encrypted,
            signature: this.signature,
            userAgent: this.userAgent,
            protocolVersion: this.protocolVersion,
            timestamp: this.timestamp
        };
    };
    return ChallengeRequestMessage;
}());
exports.ChallengeRequestMessage = ChallengeRequestMessage;
var ChallengeMessage = /** @class */ (function () {
    function ChallengeMessage(props) {
        this.type = "CHALLENGE";
        this.challengeRequestId = props.challengeRequestId;
        this.encrypted = props.encrypted;
        this.signature = props.signature;
        this.protocolVersion = props.protocolVersion;
        this.userAgent = props.userAgent;
        this.timestamp = props.timestamp;
    }
    ChallengeMessage.prototype.toJSON = function () {
        return {
            encrypted: this.encrypted,
            type: this.type,
            challengeRequestId: this.challengeRequestId,
            signature: this.signature,
            userAgent: this.userAgent,
            protocolVersion: this.protocolVersion,
            timestamp: this.timestamp
        };
    };
    return ChallengeMessage;
}());
exports.ChallengeMessage = ChallengeMessage;
var ChallengeAnswerMessage = /** @class */ (function () {
    function ChallengeAnswerMessage(props) {
        this.type = "CHALLENGEANSWER";
        this.encrypted = props.encrypted;
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
            encrypted: this.encrypted,
            signature: this.signature,
            protocolVersion: this.protocolVersion,
            userAgent: this.userAgent,
            timestamp: this.timestamp
        };
    };
    return ChallengeAnswerMessage;
}());
exports.ChallengeAnswerMessage = ChallengeAnswerMessage;
var ChallengeVerificationMessage = /** @class */ (function () {
    function ChallengeVerificationMessage(props) {
        this.type = "CHALLENGEVERIFICATION";
        this.challengeRequestId = props.challengeRequestId;
        this.challengeSuccess = props.challengeSuccess;
        this.challengeErrors = props.challengeErrors;
        this.reason = props.reason;
        this.encrypted = props.encrypted;
        this.signature = props.signature;
        this.protocolVersion = props.protocolVersion;
        this.userAgent = props.userAgent;
        this.timestamp = props.timestamp;
    }
    ChallengeVerificationMessage.prototype.toJSON = function () {
        return {
            type: this.type,
            challengeRequestId: this.challengeRequestId,
            challengeSuccess: this.challengeSuccess,
            challengeErrors: this.challengeErrors,
            reason: this.reason,
            encrypted: this.encrypted,
            signature: this.signature,
            protocolVersion: this.protocolVersion,
            userAgent: this.userAgent,
            timestamp: this.timestamp
        };
    };
    return ChallengeVerificationMessage;
}());
exports.ChallengeVerificationMessage = ChallengeVerificationMessage;
//# sourceMappingURL=challenge.js.map