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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : {"default": mod};
};
Object.defineProperty(exports, "__esModule", {value: true});
var author_1 = __importDefault(require("./author"));
var publication_1 = __importDefault(require("./publication"));
var util_1 = require("./util");
var Vote = /** @class */ (function (_super) {
    __extends(Vote, _super);
    function Vote(props, subplebbit) {
        var _this = _super.call(this, props, subplebbit) || this;
        // Publication
        _this.author = new author_1.default(props["author"]);
        _this.timestamp = props["timestamp"];
        _this.signature = (0, util_1.parseJsonIfString)(props["signature"]);
        _this.commentCid = props["commentCid"];
        _this.vote = props["vote"]; // Either 1, 0, -1 (upvote, cancel vote, downvote)
        return _this;
    }
    Vote.prototype.toJSON = function () {
        return __assign(__assign({}, _super.prototype.toJSON.call(this)), {
            author: this.author,
            timestamp: this.timestamp,
            signature: this.signature,
            commentCid: this.commentCid,
            vote: this.vote
        });
    };
    Vote.prototype.toJSONForDb = function (challengeRequestId) {
        var json = this.toJSON();
        delete json["author"];
        json["authorAddress"] = this.author.address;
        json["challengeRequestId"] = challengeRequestId;
        json["signature"] = JSON.stringify(this.signature);
        return json;
    };
    return Vote;
}(publication_1.default));
exports.default = Vote;
