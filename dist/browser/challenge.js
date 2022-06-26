"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChallengeVerificationMessage = exports.ChallengeAnswerMessage = exports.ChallengeMessage = exports.ChallengeRequestMessage = exports.Challenge = exports.CHALLENGE_TYPES = exports.PUBSUB_MESSAGE_TYPES = void 0;
const util_1 = require("./util");
exports.PUBSUB_MESSAGE_TYPES = Object.freeze({
    CHALLENGEREQUEST: "CHALLENGEREQUEST",
    CHALLENGE: "CHALLENGE",
    CHALLENGEANSWER: "CHALLENGEANSWER",
    CHALLENGEVERIFICATION: "CHALLENGEVERIFICATION"
});
exports.CHALLENGE_TYPES = Object.freeze({
    IMAGE: "image",
    TEXT: "text",
    VIDEO: "video",
    AUDIO: "audio",
    HTML: "html"
});
class Challenge {
    constructor(props) {
        this.challenge = props["challenge"];
        this.type = props["type"]; // will be dozens of challenge types, like holding a certain amount of a token
    }
}
exports.Challenge = Challenge;
class ChallengeBase {
    toJSONForDb() {
        const obj = JSON.parse(JSON.stringify(this));
        delete obj.encryptedPublication;
        return obj;
    }
}
class ChallengeRequestMessage extends ChallengeBase {
    constructor(props) {
        super();
        this.type = exports.PUBSUB_MESSAGE_TYPES.CHALLENGEREQUEST; // One of CHALLENGE_STAGES
        this.challengeRequestId = props["challengeRequestId"];
        this.acceptedChallengeTypes = (0, util_1.parseJsonIfString)(props["acceptedChallengeTypes"]);
        this.encryptedPublication = props["encryptedPublication"];
    }
    toJSONForDb() {
        return Object.assign(Object.assign({}, super.toJSONForDb()), { acceptedChallengeTypes: JSON.stringify(this.acceptedChallengeTypes) });
    }
}
exports.ChallengeRequestMessage = ChallengeRequestMessage;
class ChallengeMessage extends ChallengeBase {
    constructor(props) {
        super();
        this.type = exports.PUBSUB_MESSAGE_TYPES.CHALLENGE;
        this.challengeRequestId = props["challengeRequestId"];
        this.challenges = (0, util_1.parseJsonIfString)(props["challenges"]);
    }
    toJSONForDb() {
        return Object.assign(Object.assign({}, super.toJSONForDb()), { challenges: JSON.stringify(this.challenges) });
    }
}
exports.ChallengeMessage = ChallengeMessage;
class ChallengeAnswerMessage extends ChallengeBase {
    constructor(props) {
        super();
        this.type = exports.PUBSUB_MESSAGE_TYPES.CHALLENGEANSWER;
        this.challengeRequestId = props["challengeRequestId"];
        this.challengeAnswerId = props["challengeAnswerId"];
        this.challengeAnswers = (0, util_1.parseJsonIfString)(props["challengeAnswers"]);
    }
    toJSONForDb() {
        return Object.assign(Object.assign({}, super.toJSONForDb()), { challengeAnswers: JSON.stringify(this.challengeAnswers) });
    }
}
exports.ChallengeAnswerMessage = ChallengeAnswerMessage;
class ChallengeVerificationMessage extends ChallengeBase {
    constructor(props) {
        super();
        this.type = exports.PUBSUB_MESSAGE_TYPES.CHALLENGEVERIFICATION;
        this.challengeRequestId = props["challengeRequestId"];
        this.challengeAnswerId = props["challengeAnswerId"];
        this.challengeSuccess = props["challengeSuccess"];
        this.challengeErrors = (0, util_1.parseJsonIfString)(props["challengeErrors"]);
        this.reason = props["reason"];
        this.encryptedPublication = props["encryptedPublication"];
    }
    toJSONForDb() {
        return Object.assign(Object.assign({}, super.toJSONForDb()), { challengeErrors: JSON.stringify(this.challengeErrors) });
    }
}
exports.ChallengeVerificationMessage = ChallengeVerificationMessage;
