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
exports.PlebbitError = void 0;
var errors_1 = require("./errors");
var ts_custom_error_1 = require("ts-custom-error");
var PlebbitError = /** @class */ (function (_super) {
    __extends(PlebbitError, _super);
    function PlebbitError(code, details) {
        var _this = _super.call(this, errors_1.messages[code]) || this;
        _this.code = code;
        _this.message = errors_1.messages[code];
        _this.details = details;
        return _this;
    }
    PlebbitError.prototype.toString = function () {
        return "".concat(this.constructor.name, ": ").concat(this.code, ": ").concat(this.message, ": ").concat(JSON.stringify(this.details));
    };
    PlebbitError.prototype.toJSON = function () {
        return {
            code: this.code,
            message: this.message,
            stack: this.stack,
            details: this.details
        };
    };
    return PlebbitError;
}(ts_custom_error_1.CustomError));
exports.PlebbitError = PlebbitError;
//# sourceMappingURL=plebbit-error.js.map