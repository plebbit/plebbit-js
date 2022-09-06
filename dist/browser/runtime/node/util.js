"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setNativeFunctions = exports.nativeFunctions = exports.isRuntimeNode = exports.mkdir = void 0;
var fs_1 = require("fs");
var native_functions_1 = __importDefault(require("./native-functions"));
exports.mkdir = fs_1.promises.mkdir;
exports.isRuntimeNode = true;
exports.nativeFunctions = native_functions_1.default;
var setNativeFunctions = function (pNativeFunctions) {
    return (exports.nativeFunctions = __assign(__assign({}, exports.nativeFunctions), pNativeFunctions));
};
exports.setNativeFunctions = setNativeFunctions;
exports.default = {
    isRuntimeNode: exports.isRuntimeNode,
    nativeFunctions: exports.nativeFunctions,
    setNativeFunctions: exports.setNativeFunctions
};
