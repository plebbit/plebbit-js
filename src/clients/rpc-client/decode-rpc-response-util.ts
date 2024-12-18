import type {
    DecryptedChallengeAnswerMessageType,
    DecryptedChallengeMessageType,
    DecryptedChallengeRequestMessageType,
    DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor,
    DecryptedChallengeVerificationMessageType,
    EncodedDecryptedChallengeAnswerMessageType,
    EncodedDecryptedChallengeMessageType,
    EncodedDecryptedChallengeRequestMessageTypeWithSubplebbitAuthor,
    EncodedDecryptedChallengeVerificationMessageType
} from "../../pubsub-messages/types";
import { fromString as uint8ArrayFromString } from "uint8arrays/from-string";

function _decodeChallengeRequestId(
    requestId: EncodedDecryptedChallengeRequestMessageTypeWithSubplebbitAuthor["challengeRequestId"]
): DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor["challengeRequestId"] {
    return uint8ArrayFromString(requestId, "base58btc");
}

function _decodeEncryption(
    encrypted: EncodedDecryptedChallengeRequestMessageTypeWithSubplebbitAuthor["encrypted"]
): DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor["encrypted"] {
    return {
        ...encrypted,
        tag: uint8ArrayFromString(encrypted.tag, "base64"),
        iv: uint8ArrayFromString(encrypted.iv, "base64"),
        ciphertext: uint8ArrayFromString(encrypted.ciphertext, "base64")
    };
}

function _decodeSignature(
    signature: EncodedDecryptedChallengeRequestMessageTypeWithSubplebbitAuthor["signature"]
): DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor["signature"] {
    return {
        ...signature,
        publicKey: uint8ArrayFromString(signature.publicKey, "base64"),
        signature: uint8ArrayFromString(signature.signature, "base64")
    };
}

export function decodeRpcChallengeRequestPubsubMsg(
    msg: EncodedDecryptedChallengeRequestMessageTypeWithSubplebbitAuthor
): DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor | DecryptedChallengeRequestMessageType {
    return {
        ...msg,
        challengeRequestId: _decodeChallengeRequestId(msg.challengeRequestId),
        encrypted: _decodeEncryption(msg.encrypted),
        signature: _decodeSignature(msg.signature)
    };
}

export function decodeRpcChallengePubsubMsg(msg: EncodedDecryptedChallengeMessageType): DecryptedChallengeMessageType {
    return {
        ...msg,
        challengeRequestId: _decodeChallengeRequestId(msg.challengeRequestId),
        encrypted: _decodeEncryption(msg.encrypted),
        signature: _decodeSignature(msg.signature)
    };
}

export function decodeRpcChallengeAnswerPubsubMsg(msg: EncodedDecryptedChallengeAnswerMessageType): DecryptedChallengeAnswerMessageType {
    return {
        ...msg,
        challengeRequestId: _decodeChallengeRequestId(msg.challengeRequestId),
        encrypted: _decodeEncryption(msg.encrypted),
        signature: _decodeSignature(msg.signature)
    };
}

export function decodeRpcChallengeVerificationPubsubMsg(
    msg: EncodedDecryptedChallengeVerificationMessageType
): DecryptedChallengeVerificationMessageType {
    const encrypted = msg.encrypted ? _decodeEncryption(msg.encrypted) : undefined;
    return {
        ...msg,
        challengeRequestId: _decodeChallengeRequestId(msg.challengeRequestId),
        signature: _decodeSignature(msg.signature),
        encrypted
    };
}
