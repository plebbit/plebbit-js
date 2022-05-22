"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({__proto__: []} instanceof Array && function (d, b) {
                d.__proto__ = b;
            }) ||
            function (d, b) {
                for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
            };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);

        function __() {
            this.constructor = d;
        }

        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", {value: true});
exports.ChallengeVerificationMessage = exports.ChallengeAnswerMessage = exports.ChallengeMessage = exports.ChallengeRequestMessage = exports.Challenge = exports.CHALLENGE_TYPES = exports.PUBSUB_MESSAGE_TYPES = void 0;
var util_1 = require("./util");
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
var Challenge = /** @class */ (function () {
    function Challenge(props) {
        this.challenge = props["challenge"];
        this.type = props["type"]; // will be dozens of challenge types, like holding a certain amount of a token
    }

    return Challenge;
}());
exports.Challenge = Challenge;
var ChallengeBase = /** @class */ (function () {
    function ChallengeBase() {
    }

    ChallengeBase.prototype.toJSONForDb = function () {
        var obj = JSON.parse(JSON.stringify(this));
        delete obj.encryptedPublication;
        return obj;
    };
    return ChallengeBase;
}());
var ChallengeRequestMessage = /** @class */ (function (_super) {
    __extends(ChallengeRequestMessage, _super);

    function ChallengeRequestMessage(props) {
        var _this = _super.call(this) || this;
        _this.type = exports.PUBSUB_MESSAGE_TYPES.CHALLENGEREQUEST; // One of CHALLENGE_STAGES
        _this.challengeRequestId = props["challengeRequestId"];
        _this.acceptedChallengeTypes = (0, util_1.parseJsonIfString)(props["acceptedChallengeTypes"]);
        _this.encryptedPublication = props["encryptedPublication"];
        return _this;
    }

    ChallengeRequestMessage.prototype.toJSONForDb = function () {
        return __assign(__assign({}, _super.prototype.toJSONForDb.call(this)), {acceptedChallengeTypes: JSON.stringify(this.acceptedChallengeTypes)});
    };
    return ChallengeRequestMessage;
}(ChallengeBase));
exports.ChallengeRequestMessage = ChallengeRequestMessage;
var ChallengeMessage = /** @class */ (function (_super) {
    __extends(ChallengeMessage, _super);

    function ChallengeMessage(props) {
        var _this = _super.call(this) || this;
        _this.type = exports.PUBSUB_MESSAGE_TYPES.CHALLENGE;
        _this.challengeRequestId = props["challengeRequestId"];
        _this.challenges = (0, util_1.parseJsonIfString)(props["challenges"]);
        return _this;
    }

    ChallengeMessage.prototype.toJSONForDb = function () {
        return __assign(__assign({}, _super.prototype.toJSONForDb.call(this)), {challenges: JSON.stringify(this.challenges)});
    };
    return ChallengeMessage;
}(ChallengeBase));
exports.ChallengeMessage = ChallengeMessage;
var ChallengeAnswerMessage = /** @class */ (function (_super) {
    __extends(ChallengeAnswerMessage, _super);

    function ChallengeAnswerMessage(props) {
        var _this = _super.call(this) || this;
        _this.type = exports.PUBSUB_MESSAGE_TYPES.CHALLENGEANSWER;
        _this.challengeRequestId = props["challengeRequestId"];
        _this.challengeAnswerId = props["challengeAnswerId"];
        _this.challengeAnswers = (0, util_1.parseJsonIfString)(props["challengeAnswers"]);
        return _this;
    }

    ChallengeAnswerMessage.prototype.toJSONForDb = function () {
        return __assign(__assign({}, _super.prototype.toJSONForDb.call(this)), {challengeAnswers: JSON.stringify(this.challengeAnswers)});
    };
    return ChallengeAnswerMessage;
}(ChallengeBase));
exports.ChallengeAnswerMessage = ChallengeAnswerMessage;
var ChallengeVerificationMessage = /** @class */ (function (_super) {
    __extends(ChallengeVerificationMessage, _super);

    function ChallengeVerificationMessage(props) {
        var _this = _super.call(this) || this;
        _this.type = exports.PUBSUB_MESSAGE_TYPES.CHALLENGEVERIFICATION;
        _this.challengeRequestId = props["challengeRequestId"];
        _this.challengeAnswerId = props["challengeAnswerId"];
        _this.challengeSuccess = props["challengeSuccess"];
        _this.challengeErrors = (0, util_1.parseJsonIfString)(props["challengeErrors"]);
        _this.reason = props["reason"];
        _this.encryptedPublication = props["encryptedPublication"];
        return _this;
    }

    ChallengeVerificationMessage.prototype.toJSONForDb = function () {
        return __assign(__assign({}, _super.prototype.toJSONForDb.call(this)), {challengeErrors: JSON.stringify(this.challengeErrors)});
    };
    return ChallengeVerificationMessage;
}(ChallengeBase));
exports.ChallengeVerificationMessage = ChallengeVerificationMessage;
