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
exports.createSigner = exports.Signer = exports.decrypt = exports.encrypt = exports.Signature = exports.verifyPublication = exports.signPublication = void 0;
var util_1 = require("./util");
var assert_1 = __importDefault(require("assert"));
var signatures_1 = require("./signatures");
Object.defineProperty(exports, "signPublication", { enumerable: true, get: function () { return signatures_1.signPublication; } });
Object.defineProperty(exports, "verifyPublication", { enumerable: true, get: function () { return signatures_1.verifyPublication; } });
Object.defineProperty(exports, "Signature", { enumerable: true, get: function () { return signatures_1.Signature; } });
var encryption_1 = require("./encryption");
Object.defineProperty(exports, "encrypt", { enumerable: true, get: function () { return encryption_1.encrypt; } });
Object.defineProperty(exports, "decrypt", { enumerable: true, get: function () { return encryption_1.decrypt; } });
var Signer = /** @class */ (function () {
    function Signer(props) {
        this.type = props.type;
        this.privateKey = props.privateKey;
        this.publicKey = props.publicKey;
        this.address = props.address;
        this.ipfsKey = props.ipfsKey ? new Uint8Array(props.ipfsKey) : undefined;
        this.usage = props.usage;
        this.ipnsKeyName = props.ipnsKeyName;
    }
    return Signer;
}());
exports.Signer = Signer;
var createSigner = function (createSignerOptions) {
    if (createSignerOptions === void 0) { createSignerOptions = {}; }
    return __awaiter(void 0, void 0, void 0, function () {
        var privateKey, signerType, publicKeyPem, address, ipfsKey;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    privateKey = createSignerOptions.privateKey, signerType = createSignerOptions.type;
                    if (!privateKey) return [3 /*break*/, 1];
                    assert_1.default.equal(signerType, "rsa", "invalid signer createSignerOptions.type, not 'rsa'");
                    return [3 /*break*/, 3];
                case 1: return [4 /*yield*/, (0, util_1.generatePrivateKeyPem)()];
                case 2:
                    privateKey = _a.sent();
                    signerType = "rsa";
                    _a.label = 3;
                case 3:
                    (0, assert_1.default)(typeof signerType === "string");
                    return [4 /*yield*/, (0, util_1.getPublicKeyPemFromPrivateKeyPem)(privateKey)];
                case 4:
                    publicKeyPem = _a.sent();
                    return [4 /*yield*/, (0, util_1.getPlebbitAddressFromPrivateKeyPem)(privateKey)];
                case 5:
                    address = _a.sent();
                    return [4 /*yield*/, (0, util_1.getIpfsKeyFromPrivateKeyPem)(privateKey)];
                case 6:
                    ipfsKey = _a.sent();
                    return [2 /*return*/, new Signer({
                            privateKey: privateKey,
                            type: signerType,
                            publicKey: publicKeyPem,
                            address: address,
                            ipfsKey: ipfsKey
                        })];
            }
        });
    });
};
exports.createSigner = createSigner;
