import {randomInt} from 'crypto'
const {toString: uint8ArrayToString} = require('uint8arrays/to-string')

// don't pass stateful objects to JSON RPC
export const clone = (obj: any) => JSON.parse(JSON.stringify(obj))

const maxRandomInt = 281474976710655
export const generateSubscriptionId = () => randomInt(1, maxRandomInt)

export const formatPubsubMsg = (pubsubMsg: any) => {
  const formattedMsg = clone(pubsubMsg)
  formattedMsg.challengeRequestId = uint8ArrayToString(pubsubMsg.challengeRequestId, 'base58btc')
  if (pubsubMsg.encryptedPublication) {
    formattedMsg.encryptedPublication.tag = uint8ArrayToString(pubsubMsg.encryptedPublication.tag, 'base64')
    formattedMsg.encryptedPublication.iv = uint8ArrayToString(pubsubMsg.encryptedPublication.iv, 'base64')
    formattedMsg.encryptedPublication.ciphertext = uint8ArrayToString(pubsubMsg.encryptedPublication.ciphertext, 'base64')
  }

  formattedMsg.signature.publicKey = uint8ArrayToString(pubsubMsg.signature.publicKey, 'base64')
  formattedMsg.signature.signature = uint8ArrayToString(pubsubMsg.signature.signature, 'base64')

  if (pubsubMsg.encryptedChallenges) {
    formattedMsg.encryptedChallenges.ciphertext = uint8ArrayToString(pubsubMsg.encryptedChallenges.ciphertext, 'base64')
    formattedMsg.encryptedChallenges.iv = uint8ArrayToString(pubsubMsg.encryptedChallenges.iv, 'base64')
    formattedMsg.encryptedChallenges.tag = uint8ArrayToString(pubsubMsg.encryptedChallenges.tag, 'base64')
  }

  if (pubsubMsg.encryptedChallengeAnswers) {
    formattedMsg.encryptedChallengeAnswers.ciphertext = uint8ArrayToString(pubsubMsg.encryptedChallengeAnswers.ciphertext, 'base64')
    formattedMsg.encryptedChallengeAnswers.iv = uint8ArrayToString(pubsubMsg.encryptedChallengeAnswers.iv, 'base64')
    formattedMsg.encryptedChallengeAnswers.tag = uint8ArrayToString(pubsubMsg.encryptedChallengeAnswers.tag, 'base64')
  }

  return formattedMsg
}
