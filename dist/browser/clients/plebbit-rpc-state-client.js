"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PagesPlebbitRpcStateClient = exports.SubplebbitPlebbitRpcStateClient = exports.CommentPlebbitRpcStateClient = exports.PublicationPlebbitRpcStateClient = exports.GenericPlebbitRpcStateClient = void 0;
var tiny_typed_emitter_1 = require("tiny-typed-emitter");
// Client classes
var BasePlebbitRpcStateClient = /** @class */ (function (_super) {
    __extends(BasePlebbitRpcStateClient, _super);
    function BasePlebbitRpcStateClient(state) {
        var _this = _super.call(this) || this;
        _this.state = state;
        return _this;
    }
    return BasePlebbitRpcStateClient;
}(tiny_typed_emitter_1.TypedEmitter));
var GenericPlebbitRpcStateClient = /** @class */ (function (_super) {
    __extends(GenericPlebbitRpcStateClient, _super);
    function GenericPlebbitRpcStateClient() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return GenericPlebbitRpcStateClient;
}(BasePlebbitRpcStateClient));
exports.GenericPlebbitRpcStateClient = GenericPlebbitRpcStateClient;
var PublicationPlebbitRpcStateClient = /** @class */ (function (_super) {
    __extends(PublicationPlebbitRpcStateClient, _super);
    function PublicationPlebbitRpcStateClient() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return PublicationPlebbitRpcStateClient;
}(BasePlebbitRpcStateClient));
exports.PublicationPlebbitRpcStateClient = PublicationPlebbitRpcStateClient;
var CommentPlebbitRpcStateClient = /** @class */ (function (_super) {
    __extends(CommentPlebbitRpcStateClient, _super);
    function CommentPlebbitRpcStateClient() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return CommentPlebbitRpcStateClient;
}(BasePlebbitRpcStateClient));
exports.CommentPlebbitRpcStateClient = CommentPlebbitRpcStateClient;
var SubplebbitPlebbitRpcStateClient = /** @class */ (function (_super) {
    __extends(SubplebbitPlebbitRpcStateClient, _super);
    function SubplebbitPlebbitRpcStateClient() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return SubplebbitPlebbitRpcStateClient;
}(BasePlebbitRpcStateClient));
exports.SubplebbitPlebbitRpcStateClient = SubplebbitPlebbitRpcStateClient;
var PagesPlebbitRpcStateClient = /** @class */ (function (_super) {
    __extends(PagesPlebbitRpcStateClient, _super);
    function PagesPlebbitRpcStateClient() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return PagesPlebbitRpcStateClient;
}(BasePlebbitRpcStateClient));
exports.PagesPlebbitRpcStateClient = PagesPlebbitRpcStateClient;
//# sourceMappingURL=plebbit-rpc-state-client.js.map