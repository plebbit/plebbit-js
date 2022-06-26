"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Author {
    constructor(props) {
        this.displayName = props["displayName"];
        this.address = props["address"];
        this.avatar = props["avatar"];
    }
    toJSON() {
        return { address: this.address, displayName: this.displayName, avatar: this.avatar };
    }
    toJSONForDb() {
        return { address: this.address };
    }
}
exports.default = Author;
