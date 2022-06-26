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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSigner = exports.Signer = exports.decrypt = exports.encrypt = exports.Signature = exports.verifyPublication = exports.signPublication = void 0;
const util_1 = require("./util");
const assert_1 = __importDefault(require("assert"));
var signatures_1 = require("./signatures");
Object.defineProperty(exports, "signPublication", { enumerable: true, get: function () { return signatures_1.signPublication; } });
Object.defineProperty(exports, "verifyPublication", { enumerable: true, get: function () { return signatures_1.verifyPublication; } });
Object.defineProperty(exports, "Signature", { enumerable: true, get: function () { return signatures_1.Signature; } });
var encryption_1 = require("./encryption");
Object.defineProperty(exports, "encrypt", { enumerable: true, get: function () { return encryption_1.encrypt; } });
Object.defineProperty(exports, "decrypt", { enumerable: true, get: function () { return encryption_1.decrypt; } });
class Signer {
    constructor(props) {
        this.type = props.type;
        this.privateKey = props.privateKey;
        this.publicKey = props.publicKey;
        this.address = props.address;
        this.ipfsKey = new Uint8Array(props.ipfsKey);
    }
    toJSON() {
        return {
            type: this.type,
            privateKey: this.privateKey,
            publicKey: this.publicKey,
            address: this.address,
            ipfsKey: this.ipfsKey
        };
    }
}
exports.Signer = Signer;
const createSigner = (createSignerOptions = {}) => __awaiter(void 0, void 0, void 0, function* () {
    let { privateKey, type: signerType } = createSignerOptions;
    if (privateKey) {
        assert_1.default.equal(signerType, "rsa", "invalid signer createSignerOptions.type, not 'rsa'");
    }
    else {
        privateKey = yield (0, util_1.generatePrivateKeyPem)();
        signerType = "rsa";
    }
    const publicKeyPem = yield (0, util_1.getPublicKeyPemFromPrivateKeyPem)(privateKey);
    const address = yield (0, util_1.getPlebbitAddressFromPrivateKeyPem)(privateKey);
    const ipfsKey = yield (0, util_1.getIpfsKeyFromPrivateKeyPem)(privateKey);
    return new Signer({
        privateKey: privateKey,
        type: signerType,
        publicKey: publicKeyPem,
        address: address,
        ipfsKey: ipfsKey
    });
});
exports.createSigner = createSigner;
