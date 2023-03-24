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
        while (_) try {
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
exports.createSigner = exports.Signer = exports.decrypt = exports.encrypt = exports.verifyVote = exports.verifySubplebbit = exports.verifyComment = void 0;
var assert_1 = __importDefault(require("assert"));
var util_1 = require("./util");
var signatures_1 = require("./signatures");
Object.defineProperty(exports, "verifyComment", { enumerable: true, get: function () { return signatures_1.verifyComment; } });
Object.defineProperty(exports, "verifySubplebbit", { enumerable: true, get: function () { return signatures_1.verifySubplebbit; } });
Object.defineProperty(exports, "verifyVote", { enumerable: true, get: function () { return signatures_1.verifyVote; } });
var encryption_1 = require("./encryption");
Object.defineProperty(exports, "encrypt", { enumerable: true, get: function () { return encryption_1.encryptEd25519AesGcm; } });
Object.defineProperty(exports, "decrypt", { enumerable: true, get: function () { return encryption_1.decryptEd25519AesGcm; } });
var Signer = /** @class */ (function () {
    function Signer(props) {
        var _a, _b;
        this.type = props.type;
        this.privateKey = props.privateKey;
        this.publicKey = props.publicKey;
        this.address = props.address;
        this.ipnsKeyName = props.ipnsKeyName;
        this.ipfsKey =
            ((_b = (_a = props.ipfsKey) === null || _a === void 0 ? void 0 : _a.constructor) === null || _b === void 0 ? void 0 : _b.name) === "Object"
                ? new Uint8Array(Object.values(props.ipfsKey))
                : props.ipfsKey
                    ? new Uint8Array(props.ipfsKey)
                    : undefined;
    }
    Signer.prototype.toJSONSignersTableRow = function () {
        (0, assert_1.default)(this.type && this.privateKey && this.ipnsKeyName);
        return { type: this.type, privateKey: this.privateKey, ipnsKeyName: this.ipnsKeyName };
    };
    return Signer;
}());
exports.Signer = Signer;
var createSigner = function (createSignerOptions) {
    if (createSignerOptions === void 0) { createSignerOptions = {}; }
    return __awaiter(void 0, void 0, void 0, function () {
        var privateKey, signerType, _a, publicKey, address;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    privateKey = createSignerOptions.privateKey, signerType = createSignerOptions.type;
                    if (!privateKey) return [3 /*break*/, 1];
                    if (signerType !== "ed25519")
                        throw Error("invalid signer createSignerOptions.type, not 'ed25519'");
                    return [3 /*break*/, 3];
                case 1: return [4 /*yield*/, (0, util_1.generatePrivateKey)()];
                case 2:
                    privateKey = _b.sent();
                    signerType = "ed25519";
                    _b.label = 3;
                case 3:
                    if (typeof signerType !== "string")
                        throw Error("createSignerOptions does not include type");
                    return [4 /*yield*/, Promise.all([(0, util_1.getPublicKeyFromPrivateKey)(privateKey), (0, util_1.getPlebbitAddressFromPrivateKey)(privateKey)])];
                case 4:
                    _a = _b.sent(), publicKey = _a[0], address = _a[1];
                    return [2 /*return*/, new Signer({
                            type: signerType,
                            publicKey: publicKey,
                            address: address,
                            privateKey: privateKey
                        })];
            }
        });
    });
};
exports.createSigner = createSigner;
//# sourceMappingURL=index.js.map