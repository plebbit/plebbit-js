"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Challenge = require("./Challenge.js");

var _fromString = require("uint8arrays/from-string");

var _uuid = require("uuid");

var _toString = require("uint8arrays/to-string");

var _events = _interopRequireDefault(require("events"));

var _debug = _interopRequireDefault(require("debug"));

var _Util = require("./Util.js");

var _Author = _interopRequireDefault(require("./Author.js"));

var _Signer = require("./Signer.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classPrivateMethodInitSpec(obj, privateSet) { _checkPrivateRedeclaration(obj, privateSet); privateSet.add(obj); }

function _checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }

function _classPrivateMethodGet(receiver, privateSet, fn) { if (!privateSet.has(receiver)) { throw new TypeError("attempted to get private field on non-instance"); } return fn; }

const debug = (0, _debug.default)("plebbit-js:Publication");

var _handleChallengeExchange = /*#__PURE__*/new WeakSet();

class Publication extends _events.default {
  constructor(props, subplebbit) {
    super();

    _classPrivateMethodInitSpec(this, _handleChallengeExchange);

    this.subplebbit = subplebbit;

    this._initProps(props);
  }

  _initProps(props) {
    this.subplebbitAddress = props["subplebbitAddress"] || this.subplebbit.address;
    this.timestamp = props["timestamp"];
    this.signer = this.signer || props["signer"];
    this.signature = (0, _Util.parseJsonIfString)(props["signature"]);
    this.author = props["author"] ? new _Author.default(props["author"]) : undefined;
  }

  setSubplebbit(newSubplebbit) {
    this.subplebbit = newSubplebbit;
    this.subplebbitAddress = this.subplebbit.address;
  }

  getType() {
    if (this.hasOwnProperty("title")) return "post";else if (this.hasOwnProperty("vote")) return "vote";else return "comment";
  }

  toJSON() {
    return { ...this.toJSONSkeleton()
    };
  }

  toJSONSkeleton() {
    return {
      "subplebbitAddress": this.subplebbitAddress,
      "timestamp": this.timestamp,
      "signature": this.signature,
      "author": this.author
    };
  }

  async publishChallengeAnswers(challengeAnswers) {
    if (!Array.isArray(challengeAnswers)) challengeAnswers = [challengeAnswers];
    debug(`Challenge Answers: ${challengeAnswers}`);
    const challengeAnswer = new _Challenge.ChallengeAnswerMessage({
      "challengeRequestId": this.challenge.challengeRequestId,
      "challengeAnswerId": (0, _uuid.v4)(),
      "challengeAnswers": challengeAnswers
    });
    await this.subplebbit.plebbit.ipfsClient.pubsub.publish(this.subplebbit.pubsubTopic, (0, _fromString.fromString)(JSON.stringify(challengeAnswer)));
    debug(`Responded to challenge (${challengeAnswer.challengeRequestId}) with answers`);
  }

  async publish(userOptions) {
    const options = {
      "acceptedChallengeTypes": [],
      ...userOptions
    };
    const encryptedPublication = await (0, _Signer.encrypt)(JSON.stringify(this), this.subplebbit.encryption.publicKey);
    this.challenge = new _Challenge.ChallengeRequestMessage({
      "encryptedPublication": encryptedPublication,
      "challengeRequestId": (0, _uuid.v4)(),
      ...options
    });
    await Promise.all([this.subplebbit.plebbit.ipfsClient.pubsub.publish(this.subplebbit.pubsubTopic, (0, _fromString.fromString)(JSON.stringify(this.challenge))), this.subplebbit.plebbit.ipfsClient.pubsub.subscribe(this.subplebbit.pubsubTopic, _classPrivateMethodGet(this, _handleChallengeExchange, _handleChallengeExchange2).bind(this))]);
    debug(`Sent a challenge request (${this.challenge.challengeRequestId})`);
  }

}

async function _handleChallengeExchange2(pubsubMsg) {
  const msgParsed = JSON.parse((0, _toString.toString)(pubsubMsg["data"]));
  if ((msgParsed === null || msgParsed === void 0 ? void 0 : msgParsed.challengeRequestId) !== this.challenge.challengeRequestId) return; // Process only this publication's challenge

  if (msgParsed.type === _Challenge.PUBSUB_MESSAGE_TYPES.CHALLENGE) {
    debug(`Received challenges, will emit them and wait for user to solve them and call publishChallengeAnswers`);
    this.emit("challenge", msgParsed);
  } else if (msgParsed.type === _Challenge.PUBSUB_MESSAGE_TYPES.CHALLENGEVERIFICATION) {
    if (!msgParsed.challengePassed) debug(`Challenge ${msgParsed.challengeRequestId} has failed to pass. Challenge errors = ${msgParsed.challengeErrors}, reason = ${msgParsed.reason}`);else {
      debug(`Challenge (${msgParsed.challengeRequestId}) has passed. Will update publication props from ChallengeVerificationMessage.publication`);
      msgParsed.publication = JSON.parse(await (0, _Signer.decrypt)(msgParsed.encryptedPublication.encryptedString, msgParsed.encryptedPublication.encryptedKey, this.signer.privateKey));

      this._initProps(msgParsed.publication);
    }
    this.emit("challengeverification", [msgParsed, this]);
  }
}

var _default = Publication;
exports.default = _default;
module.exports = exports.default;