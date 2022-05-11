"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Author = _interopRequireDefault(require("./Author.js"));

var _Publication = _interopRequireDefault(require("./Publication.js"));

var _Util = require("./Util.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Vote extends _Publication.default {
  constructor(props, subplebbit) {
    super(props, subplebbit); // Publication

    this.author = new _Author.default(props["author"]);
    this.timestamp = props["timestamp"];
    this.signature = (0, _Util.parseJsonIfString)(props["signature"]);
    this.commentCid = props["commentCid"];
    this.vote = props["vote"]; // Either 1, 0, -1 (upvote, cancel vote, downvote)
  }

  toJSON() {
    return { ...super.toJSON(),
      "author": this.author,
      "timestamp": this.timestamp,
      "signature": this.signature,
      "commentCid": this.commentCid,
      "vote": this.vote
    };
  }

  toJSONForDb(challengeRequestId) {
    const json = this.toJSON();
    delete json["author"];
    json["authorAddress"] = this.author.address;
    json["challengeRequestId"] = challengeRequestId;
    json["signature"] = JSON.stringify(this.signature);
    return json;
  }

}

var _default = Vote;
exports.default = _default;
module.exports = exports.default;