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
const challenge_1 = require("./challenge");
const from_string_1 = require("uint8arrays/from-string");
const uuid_1 = require("uuid");
const to_string_1 = require("uint8arrays/to-string");
const events_1 = __importDefault(require("events"));
const util_1 = require("./util");
const author_1 = __importDefault(require("./author"));
const assert_1 = __importDefault(require("assert"));
const signer_1 = require("./signer");
const debugs = (0, util_1.getDebugLevels)("publication");
class Publication extends events_1.default {
    constructor(props, subplebbit) {
        super();
        this.subplebbit = subplebbit;
        this._initProps(props);
    }
    _initProps(props) {
        this.subplebbitAddress = props["subplebbitAddress"];
        this.timestamp = props["timestamp"];
        this.signer = this.signer || props["signer"];
        this.signature = (0, util_1.parseJsonIfString)(props["signature"]);
        this.author = props["author"] ? new author_1.default((0, util_1.parseJsonIfString)(props["author"])) : undefined;
    }
    getType() {
        if (this.hasOwnProperty("title"))
            return "post";
        else if (this.hasOwnProperty("vote"))
            return "vote";
        else
            return "comment";
    }
    toJSON() {
        return Object.assign({}, this.toJSONSkeleton());
    }
    toJSONSkeleton() {
        return {
            subplebbitAddress: this.subplebbitAddress,
            timestamp: this.timestamp,
            signature: this.signature,
            author: this.author
        };
    }
    handleChallengeExchange(pubsubMsg) {
        return __awaiter(this, void 0, void 0, function* () {
            const msgParsed = JSON.parse((0, to_string_1.toString)(pubsubMsg["data"]));
            if ((msgParsed === null || msgParsed === void 0 ? void 0 : msgParsed.challengeRequestId) !== this.challenge.challengeRequestId)
                return; // Process only this publication's challenge
            if ((msgParsed === null || msgParsed === void 0 ? void 0 : msgParsed.type) === challenge_1.PUBSUB_MESSAGE_TYPES.CHALLENGE) {
                debugs.INFO(`Received challenges, will emit them and wait for user to solve them and call publishChallengeAnswers`);
                this.emit("challenge", msgParsed);
            }
            else if ((msgParsed === null || msgParsed === void 0 ? void 0 : msgParsed.type) === challenge_1.PUBSUB_MESSAGE_TYPES.CHALLENGEVERIFICATION) {
                if (!msgParsed.challengeSuccess)
                    debugs.WARN(`Challenge ${msgParsed.challengeRequestId} has failed to pass. Challenge errors = ${msgParsed.challengeErrors}, reason = ${msgParsed.reason}`);
                else {
                    debugs.INFO(`Challenge (${msgParsed.challengeRequestId}) has passed. Will update publication props from ChallengeVerificationMessage.publication`);
                    msgParsed.publication = JSON.parse(yield (0, signer_1.decrypt)(msgParsed.encryptedPublication.encrypted, msgParsed.encryptedPublication.encryptedKey, this.signer.privateKey));
                    this._initProps(msgParsed.publication);
                }
                this.emit("challengeverification", msgParsed, this);
                yield this.subplebbit.plebbit.pubsubIpfsClient.pubsub.unsubscribe(this.subplebbit.pubsubTopic);
            }
        });
    }
    publishChallengeAnswers(challengeAnswers) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!Array.isArray(challengeAnswers))
                    challengeAnswers = [challengeAnswers];
                debugs.DEBUG(`Challenge Answers: ${challengeAnswers}`);
                const challengeAnswer = new challenge_1.ChallengeAnswerMessage({
                    challengeRequestId: this.challenge.challengeRequestId,
                    challengeAnswerId: (0, uuid_1.v4)(),
                    challengeAnswers: challengeAnswers
                });
                yield this.subplebbit.plebbit.pubsubIpfsClient.pubsub.publish(this.subplebbit.pubsubTopic, (0, from_string_1.fromString)(JSON.stringify(challengeAnswer)));
                debugs.DEBUG(`Responded to challenge (${challengeAnswer.challengeRequestId}) with answers ${JSON.stringify(challengeAnswers)}`);
            }
            catch (e) {
                debugs.ERROR(`Failed to publish challenge answers: `, e);
            }
        });
    }
    publish(userOptions) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const [isSignatureValid, failedVerificationReason] = yield (0, signer_1.verifyPublication)(this, this.subplebbit.plebbit, false);
            assert_1.default.ok(isSignatureValid, `Failed to publish since signature is invalid, failed verification reason: ${failedVerificationReason}`);
            assert_1.default.ok(this.subplebbitAddress);
            const options = Object.assign({ acceptedChallengeTypes: [] }, userOptions);
            debugs.DEBUG(`Attempting to publish ${this.getType()} with options (${JSON.stringify(options)})`);
            this.subplebbit = yield this.subplebbit.plebbit.getSubplebbit(this.subplebbitAddress);
            assert_1.default.ok((_b = (_a = this.subplebbit) === null || _a === void 0 ? void 0 : _a.encryption) === null || _b === void 0 ? void 0 : _b.publicKey, "Failed to load subplebbit for publishing");
            const encryptedPublication = yield (0, signer_1.encrypt)(JSON.stringify(this), this.subplebbit.encryption.publicKey);
            this.challenge = new challenge_1.ChallengeRequestMessage(Object.assign({ encryptedPublication: encryptedPublication, challengeRequestId: (0, uuid_1.v4)() }, options));
            yield Promise.all([
                this.subplebbit.plebbit.pubsubIpfsClient.pubsub.publish(this.subplebbit.pubsubTopic, (0, from_string_1.fromString)(JSON.stringify(this.challenge))),
                this.subplebbit.plebbit.pubsubIpfsClient.pubsub.subscribe(this.subplebbit.pubsubTopic, this.handleChallengeExchange.bind(this))
            ]);
            debugs.INFO(`Sent a challenge request (${this.challenge.challengeRequestId})`);
        });
    }
}
exports.default = Publication;
