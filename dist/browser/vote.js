"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const publication_1 = __importDefault(require("./publication"));
const assert_1 = __importDefault(require("assert"));
class Vote extends publication_1.default {
    constructor(props, subplebbit) {
        super(props, subplebbit);
        this.commentCid = props["commentCid"];
        this.vote = props["vote"]; // Either 1, 0, -1 (upvote, cancel vote, downvote)
    }
    toJSON() {
        return Object.assign(Object.assign({}, super.toJSON()), { author: this.author, timestamp: this.timestamp, signature: this.signature, commentCid: this.commentCid, vote: this.vote });
    }
    toJSONForDb(challengeRequestId) {
        const json = this.toJSON();
        // @ts-ignore
        json["author"] = JSON.stringify(this.author);
        json["authorAddress"] = this.author.address;
        json["challengeRequestId"] = challengeRequestId;
        // @ts-ignore
        json["signature"] = JSON.stringify(this.signature);
        return json;
    }
    publish(userOptions) {
        const _super = Object.create(null, {
            publish: { get: () => super.publish }
        });
        return __awaiter(this, void 0, void 0, function* () {
            (0, assert_1.default)([-1, 0, 1].includes(this.vote) && this.commentCid, "Need vote and commentCid to be defined to publish Vote");
            (0, assert_1.default)(this.timestamp, "Need timestamp field to publish comment");
            (0, assert_1.default)(this.author, "Need author to publish comment");
            return _super.publish.call(this, userOptions);
        });
    }
}
exports.default = Vote;
