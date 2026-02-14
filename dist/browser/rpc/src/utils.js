import { randomInt } from "crypto";
import { toString as uint8ArrayToString } from "uint8arrays/to-string";
// don't pass stateful objects to JSON RPC
export const clone = (obj) => JSON.parse(JSON.stringify(obj));
const maxRandomInt = 281474976710655;
export const generateSubscriptionId = () => randomInt(1, maxRandomInt);
function _encodeChallengeRequestId(id) {
    return uint8ArrayToString(id, "base58btc");
}
function _encodeEncrypted(encrypted) {
    return {
        tag: uint8ArrayToString(encrypted.tag, "base64"),
        iv: uint8ArrayToString(encrypted.iv, "base64"),
        ciphertext: uint8ArrayToString(encrypted.ciphertext, "base64"),
        type: encrypted.type
    };
}
function _encodeSignature(signature) {
    return {
        ...signature,
        publicKey: uint8ArrayToString(signature.publicKey, "base64"),
        signature: uint8ArrayToString(signature.signature, "base64")
    };
}
export function encodeChallengeRequest(msg) {
    return {
        ...msg,
        challengeRequestId: _encodeChallengeRequestId(msg.challengeRequestId),
        encrypted: _encodeEncrypted(msg.encrypted),
        signature: _encodeSignature(msg.signature)
    };
}
export function encodeChallengeMessage(msg) {
    return {
        ...msg,
        challengeRequestId: _encodeChallengeRequestId(msg.challengeRequestId),
        encrypted: _encodeEncrypted(msg.encrypted),
        signature: _encodeSignature(msg.signature)
    };
}
export function encodeChallengeAnswerMessage(msg) {
    return {
        ...msg,
        challengeRequestId: _encodeChallengeRequestId(msg.challengeRequestId),
        encrypted: _encodeEncrypted(msg.encrypted),
        signature: _encodeSignature(msg.signature)
    };
}
export function encodeChallengeVerificationMessage(msg) {
    const encrypted = msg.encrypted ? _encodeEncrypted(msg.encrypted) : undefined;
    return {
        ...msg,
        challengeRequestId: _encodeChallengeRequestId(msg.challengeRequestId),
        encrypted,
        signature: _encodeSignature(msg.signature)
    };
}
//# sourceMappingURL=utils.js.map