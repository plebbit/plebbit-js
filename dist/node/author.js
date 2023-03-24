"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
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
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var assert_1 = __importDefault(require("assert"));
var util_1 = require("./util");
var Author = /** @class */ (function () {
    function Author(props) {
        this.address = props.address;
        this.previousCommentCid = props.previousCommentCid;
        this.displayName = props.displayName;
        this.wallets = props.wallets;
        this.avatar = props.avatar;
        this.flair = props.flair;
        this.subplebbit = props["subplebbit"];
        this.shortAddress = (0, util_1.shortifyAddress)(this.address);
    }
    Author.prototype.toJSON = function () {
        return __assign(__assign({}, (this.subplebbit ? this.toJSONIpfsWithCommentUpdate() : this.toJSONIpfs())), { shortAddress: this.shortAddress });
    };
    Author.prototype.toJSONIpfs = function () {
        return {
            address: this.address,
            previousCommentCid: this.previousCommentCid,
            displayName: this.displayName,
            wallets: this.wallets,
            avatar: this.avatar,
            flair: this.flair
        };
    };
    Author.prototype.toJSONIpfsWithCommentUpdate = function () {
        (0, assert_1.default)(this.subplebbit);
        return __assign(__assign({}, this.toJSONIpfs()), { subplebbit: this.subplebbit });
    };
    return Author;
}());
exports.default = Author;
//# sourceMappingURL=author.js.map