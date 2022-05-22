"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : {"default": mod};
};
Object.defineProperty(exports, "__esModule", {value: true});
exports.getDefaultDataPath = void 0;
var path_1 = __importDefault(require("path"));
var getDefaultDataPath = function () {
    return path_1.default.join(process.cwd(), ".plebbit");
};
exports.getDefaultDataPath = getDefaultDataPath;
exports.default = {
    getDefaultDataPath: exports.getDefaultDataPath
};
