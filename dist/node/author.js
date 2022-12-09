"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Author = /** @class */ (function () {
    function Author(props) {
        this.address = props.address;
        this.previousCommentCid = props.previousCommentCid;
        this.displayName = props.displayName;
        this.wallets = props.wallets;
        this.avatar = props.avatar;
        this.flair = props.flair;
        this.banExpiresAt = props.banExpiresAt;
        this.subplebbit = props.subplebbit;
    }
    Author.prototype.toJSON = function () {
        return {
            address: this.address,
            previousCommentCid: this.previousCommentCid,
            displayName: this.displayName,
            wallets: this.wallets,
            avatar: this.avatar,
            flair: this.flair,
            banExpiresAt: this.banExpiresAt,
            subplebbit: this.subplebbit
        };
    };
    Author.prototype.toJSONForDb = function () {
        return { address: this.address, banExpiresAt: this.banExpiresAt, flair: this.flair };
    };
    return Author;
}());
exports.default = Author;
