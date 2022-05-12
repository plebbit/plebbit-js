function _classPrivateMethodInitSpec(obj, privateSet) { _checkPrivateRedeclaration(obj, privateSet); privateSet.add(obj); }

function _checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }

function _classPrivateMethodGet(receiver, privateSet, fn) { if (!privateSet.has(receiver)) { throw new TypeError("attempted to get private field on non-instance"); } return fn; }

import { ChallengeAnswerMessage, ChallengeRequestMessage, PUBSUB_MESSAGE_TYPES } from "./Challenge.js";
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string';
import { v4 as uuidv4 } from 'uuid';
import { toString as uint8ArrayToString } from 'uint8arrays/to-string';
import EventEmitter from "events";
import Debug from "debug";
import { parseJsonIfString, timestamp } from "./Util.js";
import Author from "./Author.js";
import { decrypt, encrypt } from "./Signer.js";
import assert from "assert";
const debug = Debug("plebbit-js:Publication");

var _handleChallengeExchange = /*#__PURE__*/new WeakSet();

class Publication extends EventEmitter {
  constructor(props, subplebbit) {
    super();

    _classPrivateMethodInitSpec(this, _handleChallengeExchange);

    this.subplebbit = subplebbit;

    this._initProps(props);
  }

  _initProps(props) {
    this.subplebbitAddress = props["subplebbitAddress"];
    this.timestamp = props["timestamp"];
    this.signer = this.signer || props["signer"];
    this.signature = parseJsonIfString(props["signature"]);
    this.author = props["author"] ? new Author(props["author"]) : undefined;
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
    try {
      if (!Array.isArray(challengeAnswers)) challengeAnswers = [challengeAnswers];
      debug(`Challenge Answers: ${challengeAnswers}`);
      const challengeAnswer = new ChallengeAnswerMessage({
        "challengeRequestId": this.challenge.challengeRequestId,
        "challengeAnswerId": uuidv4(),
        "challengeAnswers": challengeAnswers
      });
      await this.subplebbit.plebbit.ipfsClient.pubsub.publish(this.subplebbit.pubsubTopic, uint8ArrayFromString(JSON.stringify(challengeAnswer)));
      debug(`Responded to challenge (${challengeAnswer.challengeRequestId}) with answers`);
    } catch (e) {
      debug(`Failed to publish challenge answers: `, e);
    }
  }

  async publish(userOptions) {
    try {
      var _this$subplebbit;

      const options = {
        "acceptedChallengeTypes": [],
        ...userOptions
      };
      debug(`Attempting to publish ${this.getType()} with options (${JSON.stringify(options)})`);
      this.subplebbit = await this.subplebbit.plebbit.getSubplebbit(this.subplebbitAddress);
      assert.equal(Boolean((_this$subplebbit = this.subplebbit) === null || _this$subplebbit === void 0 ? void 0 : _this$subplebbit.encryption.publicKey), true, "Failed to load subplebbit for publishing");
      const encryptedPublication = await encrypt(JSON.stringify(this), this.subplebbit.encryption.publicKey);
      this.challenge = new ChallengeRequestMessage({
        "encryptedPublication": encryptedPublication,
        "challengeRequestId": uuidv4(),
        ...options
      });
      await Promise.all([this.subplebbit.plebbit.ipfsClient.pubsub.publish(this.subplebbit.pubsubTopic, uint8ArrayFromString(JSON.stringify(this.challenge))), this.subplebbit.plebbit.ipfsClient.pubsub.subscribe(this.subplebbit.pubsubTopic, _classPrivateMethodGet(this, _handleChallengeExchange, _handleChallengeExchange2).bind(this))]);
      debug(`Sent a challenge request (${this.challenge.challengeRequestId})`);
    } catch (e) {
      debug(`Failed to publish: `, e);
    }
  }

}

async function _handleChallengeExchange2(pubsubMsg) {
  const msgParsed = JSON.parse(uint8ArrayToString(pubsubMsg["data"]));
  if ((msgParsed === null || msgParsed === void 0 ? void 0 : msgParsed.challengeRequestId) !== this.challenge.challengeRequestId) return; // Process only this publication's challenge

  if ((msgParsed === null || msgParsed === void 0 ? void 0 : msgParsed.type) === PUBSUB_MESSAGE_TYPES.CHALLENGE) {
    debug(`Received challenges, will emit them and wait for user to solve them and call publishChallengeAnswers`);
    this.emit("challenge", msgParsed);
  } else if ((msgParsed === null || msgParsed === void 0 ? void 0 : msgParsed.type) === PUBSUB_MESSAGE_TYPES.CHALLENGEVERIFICATION) {
    if (!msgParsed.challengePassed) debug(`Challenge ${msgParsed.challengeRequestId} has failed to pass. Challenge errors = ${msgParsed.challengeErrors}, reason = ${msgParsed.reason}`);else {
      debug(`Challenge (${msgParsed.challengeRequestId}) has passed. Will update publication props from ChallengeVerificationMessage.publication`);
      msgParsed.publication = JSON.parse(await decrypt(msgParsed.encryptedPublication.encryptedString, msgParsed.encryptedPublication.encryptedKey, this.signer.privateKey));

      this._initProps(msgParsed.publication);
    }
    this.emit("challengeverification", [msgParsed, this]);
  }
}

export default Publication;