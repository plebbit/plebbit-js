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
exports.PagesIpfsGatewayClient = exports.SubplebbitIpfsGatewayClient = exports.CommentIpfsGatewayClient = exports.PublicationIpfsGatewayClient = exports.GenericIpfsGatewayClient = void 0;
var tiny_typed_emitter_1 = require("tiny-typed-emitter");
// Client classes
var BaseIpfsGateway = /** @class */ (function (_super) {
    __extends(BaseIpfsGateway, _super);
    function BaseIpfsGateway(state) {
        var _this = _super.call(this) || this;
        _this.state = state;
        return _this;
    }
    return BaseIpfsGateway;
}(tiny_typed_emitter_1.TypedEmitter));
var GenericIpfsGatewayClient = /** @class */ (function (_super) {
    __extends(GenericIpfsGatewayClient, _super);
    function GenericIpfsGatewayClient() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return GenericIpfsGatewayClient;
}(BaseIpfsGateway));
exports.GenericIpfsGatewayClient = GenericIpfsGatewayClient;
var PublicationIpfsGatewayClient = /** @class */ (function (_super) {
    __extends(PublicationIpfsGatewayClient, _super);
    function PublicationIpfsGatewayClient() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return PublicationIpfsGatewayClient;
}(BaseIpfsGateway));
exports.PublicationIpfsGatewayClient = PublicationIpfsGatewayClient;
var CommentIpfsGatewayClient = /** @class */ (function (_super) {
    __extends(CommentIpfsGatewayClient, _super);
    function CommentIpfsGatewayClient() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return CommentIpfsGatewayClient;
}(BaseIpfsGateway));
exports.CommentIpfsGatewayClient = CommentIpfsGatewayClient;
var SubplebbitIpfsGatewayClient = /** @class */ (function (_super) {
    __extends(SubplebbitIpfsGatewayClient, _super);
    function SubplebbitIpfsGatewayClient() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return SubplebbitIpfsGatewayClient;
}(BaseIpfsGateway));
exports.SubplebbitIpfsGatewayClient = SubplebbitIpfsGatewayClient;
var PagesIpfsGatewayClient = /** @class */ (function (_super) {
    __extends(PagesIpfsGatewayClient, _super);
    function PagesIpfsGatewayClient() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return PagesIpfsGatewayClient;
}(BaseIpfsGateway));
exports.PagesIpfsGatewayClient = PagesIpfsGatewayClient;
//# sourceMappingURL=ipfs-gateway-client.js.map