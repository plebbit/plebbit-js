"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setNativeFunctions = exports.nativeFunctions = exports.mkdir = exports.getDefaultDataPath = void 0;
var native_functions_1 = __importDefault(require("./native-functions"));
var getDefaultDataPath = function () { return undefined; };
exports.getDefaultDataPath = getDefaultDataPath;
var mkdir = function () { return undefined; };
exports.mkdir = mkdir;
exports.nativeFunctions = native_functions_1.default;
var setNativeFunctions = function (newNativeFunctions) {
    if (!newNativeFunctions)
        throw Error("User passed an undefined object to setNativeFunctions");
    for (var i in newNativeFunctions)
        exports.nativeFunctions[i] = newNativeFunctions[i];
};
exports.setNativeFunctions = setNativeFunctions;
exports.default = {
    getDefaultDataPath: exports.getDefaultDataPath,
    setNativeFunctions: exports.setNativeFunctions,
    nativeFunctions: exports.nativeFunctions,
    mkdir: exports.mkdir
};
