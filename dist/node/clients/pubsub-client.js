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
exports.SubplebbitPubsubClient = exports.PublicationPubsubClient = exports.GenericPubsubClient = void 0;
var tiny_typed_emitter_1 = require("tiny-typed-emitter");
// Client classes
var GenericPubsubClient = /** @class */ (function (_super) {
    __extends(GenericPubsubClient, _super);
    function GenericPubsubClient(state) {
        var _this = _super.call(this) || this;
        _this.state = state;
        return _this;
    }
    return GenericPubsubClient;
}(tiny_typed_emitter_1.TypedEmitter));
exports.GenericPubsubClient = GenericPubsubClient;
var PublicationPubsubClient = /** @class */ (function (_super) {
    __extends(PublicationPubsubClient, _super);
    function PublicationPubsubClient(state) {
        var _this = _super.call(this) || this;
        _this.state = state;
        return _this;
    }
    return PublicationPubsubClient;
}(tiny_typed_emitter_1.TypedEmitter));
exports.PublicationPubsubClient = PublicationPubsubClient;
var SubplebbitPubsubClient = /** @class */ (function (_super) {
    __extends(SubplebbitPubsubClient, _super);
    function SubplebbitPubsubClient(state) {
        var _this = _super.call(this) || this;
        _this.state = state;
        return _this;
    }
    return SubplebbitPubsubClient;
}(tiny_typed_emitter_1.TypedEmitter));
exports.SubplebbitPubsubClient = SubplebbitPubsubClient;
//# sourceMappingURL=pubsub-client.js.map