"use strict";
// NOTE: don't import plebbit-js directly to be able to replace the implementation
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restorePlebbitJs = exports.setPlebbitJs = void 0;
// @plebbit/plebbit-js imported from parent folder
var index_1 = __importDefault(require("../../../../index"));
var assert_1 = __importDefault(require("assert"));
var plebbit_logger_1 = __importDefault(require("@plebbit/plebbit-logger"));
var log = (0, plebbit_logger_1.default)("plebbit-react-hooks:plebbit-js");
var PlebbitJs = {
    Plebbit: index_1.default
};
/**
 * replace PlebbitJs with a different implementation, for
 * example to mock it during unit tests, to add mock content
 * for developing the front-end or to add a PlebbitJs with
 * desktop privileges in the Electron build.
 */
function setPlebbitJs(_Plebbit) {
    var _a;
    (0, assert_1.default)(typeof _Plebbit === "function", "setPlebbitJs invalid Plebbit argument '".concat(_Plebbit, "' not a function"));
    PlebbitJs.Plebbit = _Plebbit;
    log("setPlebbitJs", (_a = _Plebbit === null || _Plebbit === void 0 ? void 0 : _Plebbit.constructor) === null || _a === void 0 ? void 0 : _a.name);
}
exports.setPlebbitJs = setPlebbitJs;
function restorePlebbitJs() {
    PlebbitJs.Plebbit = index_1.default;
    log("restorePlebbitJs");
}
exports.restorePlebbitJs = restorePlebbitJs;
exports.default = PlebbitJs;
//# sourceMappingURL=index.js.map