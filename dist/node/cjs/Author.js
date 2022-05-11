"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

class Author {
  constructor(props) {
    this.displayName = props["displayName"];
    this.address = props["address"];
  }

  toJSON() {
    return {
      "address": this.address,
      "displayName": this.displayName
    };
  }

}

var _default = Author;
exports.default = _default;
module.exports = exports.default;