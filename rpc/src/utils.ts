import {randomInt} from 'crypto'
import {
  DecryptedChallengeAnswerMessageType,
  DecryptedChallengeMessageType,
  DecryptedChallengeRequestMessageType,
  DecryptedChallengeVerificationMessageType,
  EncodedDecryptedChallengeAnswerMessageType,
  EncodedDecryptedChallengeMessageType,
  EncodedDecryptedChallengeRequestMessageType,
  EncodedDecryptedChallengeVerificationMessageType,
} from '../../dist/node/types'
const {toString: uint8ArrayToString} = require('uint8arrays/to-string')

// don't pass stateful objects to JSON RPC
export const clone = (obj: any) => JSON.parse(JSON.stringify(obj))

const maxRandomInt = 281474976710655
export const generateSubscriptionId = () => randomInt(1, maxRandomInt)

export const encodePubsubMsg = (
  pubsubMsg: DecryptedChallengeMessageType | DecryptedChallengeAnswerMessageType | DecryptedChallengeRequestMessageType | DecryptedChallengeVerificationMessageType
) => {
  let encodedMsg:
    | EncodedDecryptedChallengeMessageType
    | EncodedDecryptedChallengeAnswerMessageType
    | EncodedDecryptedChallengeRequestMessageType
    | EncodedDecryptedChallengeVerificationMessageType = clone(pubsubMsg)
  encodedMsg.challengeRequestId = uint8ArrayToString(pubsubMsg.challengeRequestId, 'base58btc')
  if ((<any>pubsubMsg)['encryptedPublication']) {
    pubsubMsg = <DecryptedChallengeRequestMessageType | DecryptedChallengeVerificationMessageType>pubsubMsg
    encodedMsg = <EncodedDecryptedChallengeRequestMessageType | EncodedDecryptedChallengeVerificationMessageType>encodedMsg
    encodedMsg.encryptedPublication.tag = uint8ArrayToString(pubsubMsg.encryptedPublication?.tag, 'base64')
    encodedMsg.encryptedPublication.iv = uint8ArrayToString(pubsubMsg.encryptedPublication?.iv, 'base64')
    encodedMsg.encryptedPublication.ciphertext = uint8ArrayToString(pubsubMsg.encryptedPublication?.ciphertext, 'base64')
  }

  encodedMsg.signature.publicKey = uint8ArrayToString(pubsubMsg.signature.publicKey, 'base64')
  encodedMsg.signature.signature = uint8ArrayToString(pubsubMsg.signature.signature, 'base64')

  if ((<any>pubsubMsg)['encryptedChallenges']) {
    pubsubMsg = <DecryptedChallengeMessageType>pubsubMsg
    encodedMsg = <EncodedDecryptedChallengeMessageType>encodedMsg
    encodedMsg.encryptedChallenges.ciphertext = uint8ArrayToString(pubsubMsg.encryptedChallenges.ciphertext, 'base64')
    encodedMsg.encryptedChallenges.iv = uint8ArrayToString(pubsubMsg.encryptedChallenges.iv, 'base64')
    encodedMsg.encryptedChallenges.tag = uint8ArrayToString(pubsubMsg.encryptedChallenges.tag, 'base64')
  }

  if ((<any>pubsubMsg)['encryptedChallengeAnswers']) {
    pubsubMsg = <DecryptedChallengeAnswerMessageType>pubsubMsg
    encodedMsg = <EncodedDecryptedChallengeAnswerMessageType>encodedMsg
    encodedMsg.encryptedChallengeAnswers.ciphertext = uint8ArrayToString(pubsubMsg.encryptedChallengeAnswers.ciphertext, 'base64')
    encodedMsg.encryptedChallengeAnswers.iv = uint8ArrayToString(pubsubMsg.encryptedChallengeAnswers.iv, 'base64')
    encodedMsg.encryptedChallengeAnswers.tag = uint8ArrayToString(pubsubMsg.encryptedChallengeAnswers.tag, 'base64')
  }

  return encodedMsg
}
