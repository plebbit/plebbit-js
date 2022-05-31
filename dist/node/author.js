"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Author = /** @class */ (function () {
    function Author(props) {
        this.displayName = props["displayName"];
        this.address = props["address"];
    }
    Author.prototype.toJSON = function () {
        return { address: this.address, displayName: this.displayName };
    };
    Author.prototype.toJSONForDb = function () {
        return { address: this.address };
    };
    return Author;
}());
exports.default = Author;
