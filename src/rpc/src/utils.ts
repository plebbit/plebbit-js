import { randomInt } from "crypto";
import {
    DecryptedChallengeAnswerMessageType,
    DecryptedChallengeMessageType,
    DecryptedChallengeRequestMessageType,
    DecryptedChallengeVerificationMessageType,
    EncodedDecryptedChallengeAnswerMessageType,
    EncodedDecryptedChallengeMessageType,
    EncodedDecryptedChallengeRequestMessageType,
    EncodedDecryptedChallengeVerificationMessageType
} from "../../types";
const { toString: uint8ArrayToString } = require("uint8arrays/to-string");

// don't pass stateful objects to JSON RPC
export const clone = (obj: any) => JSON.parse(JSON.stringify(obj));

const maxRandomInt = 281474976710655;
export const generateSubscriptionId = () => randomInt(1, maxRandomInt);

export const encodePubsubMsg = (
    pubsubMsg:
        | DecryptedChallengeMessageType
        | DecryptedChallengeAnswerMessageType
        | DecryptedChallengeRequestMessageType
        | DecryptedChallengeVerificationMessageType
) => {
    let encodedMsg:
        | EncodedDecryptedChallengeMessageType
        | EncodedDecryptedChallengeAnswerMessageType
        | EncodedDecryptedChallengeRequestMessageType
        | EncodedDecryptedChallengeVerificationMessageType = clone(pubsubMsg);

    encodedMsg.challengeRequestId = uint8ArrayToString(pubsubMsg.challengeRequestId, "base58btc");
    if (pubsubMsg.encrypted)
        encodedMsg.encrypted = {
            tag: uint8ArrayToString(pubsubMsg.encrypted?.tag, "base64"),
            iv: uint8ArrayToString(pubsubMsg.encrypted?.iv, "base64"),
            ciphertext: uint8ArrayToString(pubsubMsg.encrypted?.ciphertext, "base64"),
            type: pubsubMsg.encrypted.type
        };

    encodedMsg.signature.publicKey = uint8ArrayToString(pubsubMsg.signature.publicKey, "base64");
    encodedMsg.signature.signature = uint8ArrayToString(pubsubMsg.signature.signature, "base64");

    return encodedMsg;
};
