"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SqliteCache = void 0;
var better_sqlite3_1 = __importDefault(require("better-sqlite3"));
var cbor_1 = __importDefault(require("cbor"));
var debounce_1 = __importDefault(require("debounce"));
function initSqliteCache(configuration) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            db = new better_sqlite3_1.default(configuration.database, {});
            db.transaction(function () {
                db.prepare("CREATE TABLE IF NOT EXISTS ".concat(configuration.cacheTableName, " (\n        key TEXT PRIMARY KEY,\n        value BLOB,\n        expires INT,\n        lastAccess INT\n      )")).run();
                db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS key ON ".concat(configuration.cacheTableName, " (key)")).run();
                db.prepare("CREATE INDEX IF NOT EXISTS expires ON ".concat(configuration.cacheTableName, " (expires)")).run();
                db.prepare("CREATE INDEX IF NOT EXISTS lastAccess ON ".concat(configuration.cacheTableName, " (lastAccess)")).run();
            })();
            return [2 /*return*/, {
                    db: db,
                    getStatement: db.prepare("UPDATE OR IGNORE ".concat(configuration.cacheTableName, "\n      SET lastAccess = @now\n      WHERE key = @key AND (expires > @now OR expires IS NULL)\n      RETURNING value")),
                    setStatement: db.prepare("INSERT OR REPLACE INTO ".concat(configuration.cacheTableName, "\n      (key, value, expires, lastAccess) VALUES (@key, @value, @expires, @now)")),
                    deleteStatement: db.prepare("DELETE FROM ".concat(configuration.cacheTableName, " WHERE key = @key")),
                    clearStatement: db.prepare("DELETE FROM ".concat(configuration.cacheTableName)),
                    cleanupExpiredStatement: db.prepare("\n      DELETE FROM ".concat(configuration.cacheTableName, " WHERE expires < @now\n    ")),
                    cleanupLruStatement: db.prepare("\n      WITH lru AS (SELECT key FROM ".concat(configuration.cacheTableName, " ORDER BY lastAccess DESC LIMIT -1 OFFSET @maxItems)\n      DELETE FROM ").concat(configuration.cacheTableName, " WHERE key IN lru\n    "))
                }];
        });
    });
}
function now() {
    return Date.now();
}
var SqliteCache = /** @class */ (function () {
    function SqliteCache(configuration) {
        var _this = this;
        this.isClosed = false;
        this.checkForExpiredItems = (0, debounce_1.default)(function () { return __awaiter(_this, void 0, void 0, function () {
            var db, ex_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.isClosed) {
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.db];
                    case 2:
                        db = _a.sent();
                        db.cleanupExpiredStatement.run({ now: now() });
                        if (this._config.maxItems) {
                            db.cleanupLruStatement.run({
                                maxItems: this._config.maxItems
                            });
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        ex_1 = _a.sent();
                        console.error("Error in cache-sqlite-lru-ttl when checking for expired items", ex_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); }, 100, true);
        this._config = configuration;
        this.db = initSqliteCache(configuration);
        this.checkInterval = setInterval(this.checkForExpiredItems, 1000);
    }
    /**
     * Get cache item by it's key.
     */
    SqliteCache.prototype.get = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var res, value;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.isClosed) {
                            throw new Error("Cache is closed");
                        }
                        return [4 /*yield*/, this.db];
                    case 1:
                        res = (_a.sent()).getStatement.get({
                            key: key,
                            now: now()
                        });
                        if (!res) {
                            return [2 /*return*/, undefined];
                        }
                        value = res.value;
                        return [2 /*return*/, cbor_1.default.decode(value)];
                }
            });
        });
    };
    /**
     * Updates cache item by key or creates new one if it doesn't exist.
     */
    SqliteCache.prototype.set = function (key, value, opts) {
        var _a;
        if (opts === void 0) { opts = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var ttl, expires, valueBuffer;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.isClosed) {
                            throw new Error("Cache is closed");
                        }
                        ttl = (_a = opts.ttlMs) !== null && _a !== void 0 ? _a : opts.ttlMs;
                        expires = ttl !== undefined ? new Date(Date.now() + ttl) : undefined;
                        valueBuffer = cbor_1.default.encode(value);
                        return [4 /*yield*/, this.db];
                    case 1:
                        (_b.sent()).setStatement.run({
                            key: key,
                            value: valueBuffer,
                            expires: expires === null || expires === void 0 ? void 0 : expires.getTime(),
                            now: now()
                        });
                        setImmediate(this.checkForExpiredItems.bind(this));
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Remove specific item from the cache.
     */
    SqliteCache.prototype.delete = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.isClosed) {
                            throw new Error("Cache is closed");
                        }
                        return [4 /*yield*/, this.db];
                    case 1:
                        (_a.sent()).deleteStatement.run({ key: key, now: now() });
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Remove all items from the cache.
     */
    SqliteCache.prototype.clear = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.isClosed) {
                            throw new Error("Cache is closed");
                        }
                        return [4 /*yield*/, this.db];
                    case 1:
                        (_a.sent()).clearStatement.run({});
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Close database and cleanup resources.
     */
    SqliteCache.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        clearInterval(this.checkInterval);
                        return [4 /*yield*/, this.db];
                    case 1:
                        (_a.sent()).db.close();
                        this.isClosed = true;
                        return [2 /*return*/];
                }
            });
        });
    };
    return SqliteCache;
}());
exports.SqliteCache = SqliteCache;
exports.default = SqliteCache;
//# sourceMappingURL=sqlite-lru-cache.js.map