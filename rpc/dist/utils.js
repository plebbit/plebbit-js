"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodePubsubMsg = exports.generateSubscriptionId = exports.clone = void 0;
const crypto_1 = require("crypto");
const { toString: uint8ArrayToString } = require('uint8arrays/to-string');
// don't pass stateful objects to JSON RPC
const clone = (obj) => JSON.parse(JSON.stringify(obj));
exports.clone = clone;
const maxRandomInt = 281474976710655;
const generateSubscriptionId = () => (0, crypto_1.randomInt)(1, maxRandomInt);
exports.generateSubscriptionId = generateSubscriptionId;
const encodePubsubMsg = (pubsubMsg) => {
    var _a, _b, _c;
    let encodedMsg = (0, exports.clone)(pubsubMsg);
    encodedMsg.challengeRequestId = uint8ArrayToString(pubsubMsg.challengeRequestId, 'base58btc');
    if (pubsubMsg.encrypted)
        encodedMsg.encrypted = {
            tag: uint8ArrayToString((_a = pubsubMsg.encrypted) === null || _a === void 0 ? void 0 : _a.tag, 'base64'),
            iv: uint8ArrayToString((_b = pubsubMsg.encrypted) === null || _b === void 0 ? void 0 : _b.iv, 'base64'),
            ciphertext: uint8ArrayToString((_c = pubsubMsg.encrypted) === null || _c === void 0 ? void 0 : _c.ciphertext, 'base64'),
            type: pubsubMsg.encrypted.type,
        };
    encodedMsg.signature.publicKey = uint8ArrayToString(pubsubMsg.signature.publicKey, 'base64');
    encodedMsg.signature.signature = uint8ArrayToString(pubsubMsg.signature.signature, 'base64');
    return encodedMsg;
};
exports.encodePubsubMsg = encodePubsubMsg;
