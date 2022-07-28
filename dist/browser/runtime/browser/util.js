"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRuntimeNode = exports.getDefaultDataPath = void 0;
// the browser has no data path
var getDefaultDataPath = function () { return undefined; };
exports.getDefaultDataPath = getDefaultDataPath;
exports.isRuntimeNode = false;
exports.default = {
    getDefaultDataPath: exports.getDefaultDataPath,
    isRuntimeNode: exports.isRuntimeNode
};
