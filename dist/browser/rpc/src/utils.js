import { randomInt } from "crypto";
import { toString as uint8ArrayToString } from "uint8arrays/to-string";
// don't pass stateful objects to JSON RPC
export const clone = (obj) => JSON.parse(JSON.stringify(obj));
const maxRandomInt = 281474976710655;
export const generateSubscriptionId = () => randomInt(1, maxRandomInt);
export const encodePubsubMsg = (pubsubMsg) => {
    let encodedMsg = clone(pubsubMsg);
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
//# sourceMappingURL=utils.js.map