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
exports.PagesIpfsClient = exports.SubplebbitIpfsClient = exports.CommentIpfsClient = exports.PublicationIpfsClient = exports.GenericIpfsClient = void 0;
var tiny_typed_emitter_1 = require("tiny-typed-emitter");
// Client classes
var BaseIpfsClient = /** @class */ (function (_super) {
    __extends(BaseIpfsClient, _super);
    function BaseIpfsClient(state) {
        var _this = _super.call(this) || this;
        _this.state = state;
        return _this;
    }
    return BaseIpfsClient;
}(tiny_typed_emitter_1.TypedEmitter));
var GenericIpfsClient = /** @class */ (function (_super) {
    __extends(GenericIpfsClient, _super);
    function GenericIpfsClient() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return GenericIpfsClient;
}(BaseIpfsClient));
exports.GenericIpfsClient = GenericIpfsClient;
var PublicationIpfsClient = /** @class */ (function (_super) {
    __extends(PublicationIpfsClient, _super);
    function PublicationIpfsClient() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return PublicationIpfsClient;
}(BaseIpfsClient));
exports.PublicationIpfsClient = PublicationIpfsClient;
var CommentIpfsClient = /** @class */ (function (_super) {
    __extends(CommentIpfsClient, _super);
    function CommentIpfsClient() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return CommentIpfsClient;
}(BaseIpfsClient));
exports.CommentIpfsClient = CommentIpfsClient;
var SubplebbitIpfsClient = /** @class */ (function (_super) {
    __extends(SubplebbitIpfsClient, _super);
    function SubplebbitIpfsClient() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return SubplebbitIpfsClient;
}(BaseIpfsClient));
exports.SubplebbitIpfsClient = SubplebbitIpfsClient;
var PagesIpfsClient = /** @class */ (function (_super) {
    __extends(PagesIpfsClient, _super);
    function PagesIpfsClient() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return PagesIpfsClient;
}(BaseIpfsClient));
exports.PagesIpfsClient = PagesIpfsClient;
//# sourceMappingURL=ipfs-client.js.map