import { fromString as uint8ArrayFromString } from "uint8arrays/from-string";
function _decodeChallengeRequestId(requestId) {
    return uint8ArrayFromString(requestId, "base58btc");
}
function _decodeEncryption(encrypted) {
    return {
        ...encrypted,
        tag: uint8ArrayFromString(encrypted.tag, "base64"),
        iv: uint8ArrayFromString(encrypted.iv, "base64"),
        ciphertext: uint8ArrayFromString(encrypted.ciphertext, "base64")
    };
}
function _decodeSignature(signature) {
    return {
        ...signature,
        publicKey: uint8ArrayFromString(signature.publicKey, "base64"),
        signature: uint8ArrayFromString(signature.signature, "base64")
    };
}
export function decodeRpcChallengeRequestPubsubMsg(msg) {
    return {
        ...msg,
        challengeRequestId: _decodeChallengeRequestId(msg.challengeRequestId),
        encrypted: _decodeEncryption(msg.encrypted),
        signature: _decodeSignature(msg.signature)
    };
}
export function decodeRpcChallengePubsubMsg(msg) {
    return {
        ...msg,
        challengeRequestId: _decodeChallengeRequestId(msg.challengeRequestId),
        encrypted: _decodeEncryption(msg.encrypted),
        signature: _decodeSignature(msg.signature)
    };
}
export function decodeRpcChallengeAnswerPubsubMsg(msg) {
    return {
        ...msg,
        challengeRequestId: _decodeChallengeRequestId(msg.challengeRequestId),
        encrypted: _decodeEncryption(msg.encrypted),
        signature: _decodeSignature(msg.signature)
    };
}
export function decodeRpcChallengeVerificationPubsubMsg(msg) {
    const encrypted = msg.encrypted ? _decodeEncryption(msg.encrypted) : undefined;
    return {
        ...msg,
        challengeRequestId: _decodeChallengeRequestId(msg.challengeRequestId),
        signature: _decodeSignature(msg.signature),
        encrypted
    };
}
//# sourceMappingURL=decode-rpc-response-util.js.map