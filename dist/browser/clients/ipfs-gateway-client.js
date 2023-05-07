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
exports.GenericIpfsGatewayClient = void 0;
var tiny_typed_emitter_1 = require("tiny-typed-emitter");
var GenericIpfsGatewayClient = /** @class */ (function (_super) {
    __extends(GenericIpfsGatewayClient, _super);
    function GenericIpfsGatewayClient(state) {
        var _this = _super.call(this) || this;
        _this.state = state;
        return _this;
    }
    return GenericIpfsGatewayClient;
}(tiny_typed_emitter_1.TypedEmitter));
exports.GenericIpfsGatewayClient = GenericIpfsGatewayClient;
//# sourceMappingURL=ipfs-gateway-client.js.map