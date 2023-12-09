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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInstance = void 0;
var localforage_1 = __importDefault(require("localforage"));
function createLocalForageInstance(localForageLruOptions) {
    var _this = this;
    if (typeof (localForageLruOptions === null || localForageLruOptions === void 0 ? void 0 : localForageLruOptions.size) !== "number") {
        throw Error("LocalForageLru.createInstance localForageLruOptions.size '".concat(localForageLruOptions === null || localForageLruOptions === void 0 ? void 0 : localForageLruOptions.size, "' not a number"));
    }
    var localForageOptions = __assign({}, localForageLruOptions);
    delete localForageOptions.size;
    var database1, database2, databaseSize, initialized = false;
    var initializationPromize = new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
        var localForage1, localForage2, _a, localForage1Size, localForage2Size;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    localForage1 = localforage_1.default.createInstance(__assign(__assign({}, localForageOptions), { name: localForageLruOptions.name }));
                    localForage2 = localforage_1.default.createInstance(__assign(__assign({}, localForageOptions), { name: localForageLruOptions.name + "2" }));
                    return [4 /*yield*/, Promise.all([localForage1.length(), localForage2.length()])];
                case 1:
                    _a = _b.sent(), localForage1Size = _a[0], localForage2Size = _a[1];
                    // largest db is always active db, unless is max size, because max sized db is always inactive
                    if ((localForage1Size >= localForage2Size && localForage1Size !== localForageLruOptions.size) ||
                        localForage2Size === localForageLruOptions.size) {
                        database2 = localForage2;
                        database1 = localForage1;
                        databaseSize = localForage1Size;
                    }
                    else {
                        database2 = localForage1;
                        database1 = localForage2;
                        databaseSize = localForage2Size;
                    }
                    initialized = true;
                    resolve(undefined);
                    return [2 /*return*/];
            }
        });
    }); });
    return {
        getItem: function (key) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, value, value2, returnValue;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, initialization()];
                        case 1:
                            _b.sent();
                            return [4 /*yield*/, Promise.all([database1.getItem(key), database2.getItem(key)])];
                        case 2:
                            _a = _b.sent(), value = _a[0], value2 = _a[1];
                            returnValue = value;
                            if (returnValue !== null && returnValue !== undefined)
                                return [2 /*return*/, returnValue];
                            if (!((returnValue = value2) !== null && (returnValue = value2) !== undefined)) return [3 /*break*/, 4];
                            return [4 /*yield*/, updateDatabases(key, returnValue)];
                        case 3:
                            _b.sent();
                            return [2 /*return*/, returnValue];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        },
        setItem: function (key, value) {
            return __awaiter(this, void 0, void 0, function () {
                var databaseValue, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, initialization()];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, database1.getItem(key)];
                        case 2:
                            databaseValue = _a.sent();
                            if (!(databaseValue !== null && databaseValue !== undefined)) return [3 /*break*/, 7];
                            _a.label = 3;
                        case 3:
                            _a.trys.push([3, 5, , 6]);
                            return [4 /*yield*/, database1.setItem(key, value)];
                        case 4:
                            _a.sent();
                            return [3 /*break*/, 6];
                        case 5:
                            error_1 = _a.sent();
                            console.error("localforageLru.setItem setItem error", { error: error_1, errorMessage: error_1 === null || error_1 === void 0 ? void 0 : error_1.message, key: key, value: value });
                            throw error_1;
                        case 6: return [3 /*break*/, 9];
                        case 7: return [4 /*yield*/, updateDatabases(key, value)];
                        case 8:
                            _a.sent();
                            _a.label = 9;
                        case 9: return [2 /*return*/];
                    }
                });
            });
        },
        removeItem: function (key) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, initialization()];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, Promise.all([database1.removeItem(key), database2.removeItem(key)])];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        },
        clear: function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, initialization()];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, Promise.all([database1.clear(), database2.clear()])];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        },
        key: function (keyIndex) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    throw Error("not implemented");
                });
            });
        },
        // don't use for init react state, use entries() instead
        keys: function () {
            return __awaiter(this, void 0, void 0, function () {
                var _a, keys1, keys2;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, initialization()];
                        case 1:
                            _b.sent();
                            return [4 /*yield*/, Promise.all([database1.keys(), database2.keys()])];
                        case 2:
                            _a = _b.sent(), keys1 = _a[0], keys2 = _a[1];
                            return [2 /*return*/, Array.from(new Set(__spreadArray(__spreadArray([], keys1, true), keys2, true)))];
                    }
                });
            });
        },
        // useful to init a react state on load
        entries: function () {
            return __awaiter(this, void 0, void 0, function () {
                var _a, keys1, keys2, keys, entries, getItem;
                var _this = this;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, initialization()];
                        case 1:
                            _b.sent();
                            return [4 /*yield*/, Promise.all([database1.keys(), database2.keys()])];
                        case 2:
                            _a = _b.sent(), keys1 = _a[0], keys2 = _a[1];
                            keys = Array.from(new Set(__spreadArray(__spreadArray([], keys1, true), keys2, true)));
                            entries = [];
                            getItem = function (key) { return __awaiter(_this, void 0, void 0, function () {
                                var _a, value, value2;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0: return [4 /*yield*/, Promise.all([database1.getItem(key), database2.getItem(key)])];
                                        case 1:
                                            _a = _b.sent(), value = _a[0], value2 = _a[1];
                                            if (value !== null && value !== undefined) {
                                                return [2 /*return*/, value];
                                            }
                                            return [2 /*return*/, value2];
                                    }
                                });
                            }); };
                            return [4 /*yield*/, Promise.all(keys.map(function (key, i) {
                                    return getItem(key).then(function (value) {
                                        entries[i] = [key, value];
                                    });
                                }))];
                        case 3:
                            _b.sent();
                            return [2 /*return*/, entries];
                    }
                });
            });
        },
        length: function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    throw Error("not implemented");
                });
            });
        }
    };
    function updateDatabases(key, value) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var error_2, database1Temp, database2Temp;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, database1.setItem(key, value)];
                    case 1:
                        _c.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _c.sent();
                        console.error("localforageLru updateDatabases setItem error", { error: error_2, errorMessage: error_2 === null || error_2 === void 0 ? void 0 : error_2.message, key: key, value: value });
                        // ignore this error, don't know why it happens
                        if ((_b = (_a = error_2 === null || error_2 === void 0 ? void 0 : error_2.message) === null || _a === void 0 ? void 0 : _a.includes) === null || _b === void 0 ? void 0 : _b.call(_a, "unit storage quota has been exceeded")) {
                            return [2 /*return*/];
                        }
                        throw error_2;
                    case 3:
                        databaseSize++;
                        if (!(databaseSize >= localForageLruOptions.size)) return [3 /*break*/, 5];
                        databaseSize = 0;
                        database1Temp = database1;
                        database2Temp = database2;
                        database2 = database1Temp;
                        database1 = database2Temp;
                        return [4 /*yield*/, database1.clear()];
                    case 4:
                        _c.sent();
                        _c.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    }
    function initialization() {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (initialized) {
                    return [2 /*return*/];
                }
                return [2 /*return*/, initializationPromize];
            });
        });
    }
}
var instances = {};
var createInstance = function (localForageLruOptions) {
    if (typeof (localForageLruOptions === null || localForageLruOptions === void 0 ? void 0 : localForageLruOptions.name) !== "string") {
        throw Error("LocalForageLru.createInstance localForageLruOptions.name '".concat(localForageLruOptions === null || localForageLruOptions === void 0 ? void 0 : localForageLruOptions.name, "' not a string"));
    }
    if (instances[localForageLruOptions.name])
        return instances[localForageLruOptions.name];
    instances[localForageLruOptions.name] = createLocalForageInstance(localForageLruOptions);
    return instances[localForageLruOptions.name];
};
exports.createInstance = createInstance;
//# sourceMappingURL=localforage-lru.js.map