"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Comment = require("./Comment.js");

class Post extends _Comment.Comment {
  _initProps(props) {
    super._initProps(props);

    this.parentCid = undefined;
    this.title = props["title"];
  }

  toJSONSkeleton() {
    return { ...super.toJSONSkeleton(),
      "title": this.title
    };
  }

}

var _default = Post;
exports.default = _default;
module.exports = exports.default;