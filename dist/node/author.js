"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Author = /** @class */ (function () {
    function Author(props) {
        Object.assign(this, props);
    }
    Author.prototype.toJSON = function () {
        return { address: this.address, displayName: this.displayName, avatar: this.avatar };
    };
    Author.prototype.toJSONForDb = function () {
        return { address: this.address };
    };
    return Author;
}());
exports.default = Author;
