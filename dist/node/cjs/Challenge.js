"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PUBSUB_MESSAGE_TYPES = exports.ChallengeVerificationMessage = exports.ChallengeRequestMessage = exports.ChallengeMessage = exports.ChallengeAnswerMessage = exports.Challenge = exports.CHALLENGE_TYPES = void 0;

var _Util = require("./Util.js");

const PUBSUB_MESSAGE_TYPES = Object.freeze({
  CHALLENGEREQUEST: "CHALLENGEREQUEST",
  CHALLENGE: "CHALLENGE",
  CHALLENGEANSWER: "CHALLENGEANSWER",
  CHALLENGEVERIFICATION: "CHALLENGEVERIFICATION"
});
exports.PUBSUB_MESSAGE_TYPES = PUBSUB_MESSAGE_TYPES;
const CHALLENGE_TYPES = Object.freeze({
  IMAGE: "image",
  TEXT: "text",
  VIDEO: "video",
  AUDIO: "audio",
  HTML: "html"
});
exports.CHALLENGE_TYPES = CHALLENGE_TYPES;

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
    this.type = PUBSUB_MESSAGE_TYPES.CHALLENGEREQUEST; // One of CHALLENGE_STAGES

    this.challengeRequestId = props["challengeRequestId"];
    this.acceptedChallengeTypes = (0, _Util.parseJsonIfString)(props["acceptedChallengeTypes"]);
    this.encryptedPublication = props["encryptedPublication"];
  }

  toJSONForDb() {
    return { ...super.toJSONForDb(),
      "acceptedChallengeTypes": JSON.stringify(this.acceptedChallengeTypes)
    };
  }

}

exports.ChallengeRequestMessage = ChallengeRequestMessage;

class ChallengeMessage extends ChallengeBase {
  constructor(props) {
    super();
    this.type = PUBSUB_MESSAGE_TYPES.CHALLENGE;
    this.challengeRequestId = props["challengeRequestId"];
    this.challenges = (0, _Util.parseJsonIfString)(props["challenges"]);
  }

  toJSONForDb() {
    return { ...super.toJSONForDb(),
      "challenges": JSON.stringify(this.challenges)
    };
  }

}

exports.ChallengeMessage = ChallengeMessage;

class ChallengeAnswerMessage extends ChallengeBase {
  constructor(props) {
    super();
    this.type = PUBSUB_MESSAGE_TYPES.CHALLENGEANSWER;
    this.challengeRequestId = props["challengeRequestId"];
    this.challengeAnswerId = props["challengeAnswerId"];
    this.challengeAnswers = (0, _Util.parseJsonIfString)(props["challengeAnswers"]);
  }

  toJSONForDb() {
    return { ...super.toJSONForDb(),
      "challengeAnswers": JSON.stringify(this.challengeAnswers)
    };
  }

}

exports.ChallengeAnswerMessage = ChallengeAnswerMessage;

class ChallengeVerificationMessage extends ChallengeBase {
  constructor(props) {
    super();
    this.type = PUBSUB_MESSAGE_TYPES.CHALLENGEVERIFICATION;
    this.challengeRequestId = props["challengeRequestId"];
    this.challengeAnswerId = props["challengeAnswerId"];
    this.challengePassed = props["challengePassed"];
    this.challengeErrors = (0, _Util.parseJsonIfString)(props["challengeErrors"]);
    this.reason = props["reason"];
    this.encryptedPublication = props["encryptedPublication"];
  }

  toJSONForDb() {
    return { ...super.toJSONForDb(),
      "challengeErrors": JSON.stringify(this.challengeErrors)
    };
  }

}

exports.ChallengeVerificationMessage = ChallengeVerificationMessage;