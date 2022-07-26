"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("./util");
var Author = /** @class */ (function () {
    function Author(props) {
        this.address = props.address;
        this.previousCommentCid = props.previousCommentCid;
        this.displayName = props.displayName;
        this.wallets = props.wallets;
        this.avatar = props.avatar;
        this.flair = (0, util_1.parseJsonIfString)(props.flair);
        this.banExpiresAt = props.banExpiresAt;
    }
    Author.prototype.toJSON = function () {
        return {
            address: this.address,
            previousCommentCid: this.previousCommentCid,
            displayName: this.displayName,
            wallets: this.wallets,
            avatar: this.avatar,
            flair: this.flair,
            banExpiresAt: this.banExpiresAt
        };
    };
    Author.prototype.toJSONForDb = function () {
        return { address: this.address, banExpiresAt: this.banExpiresAt, flair: this.flair };
    };
    return Author;
}());
exports.default = Author;
