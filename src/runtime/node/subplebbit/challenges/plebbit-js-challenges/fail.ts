// the purpose of this challenge is to always fail, can be used with SubplebbitChallenge.exclude to whitelist users

import { Challenge, ChallengeFile, SubplebbitChallengeSettings } from "../../../../../subplebbit/types"
import { DecryptedChallengeRequestMessageType } from "../../../../../types"

const optionInputs = [
  {
    option: 'error',
    label: 'Error',
    default: `You're not allowed to publish.`,
    description: 'The error to display to the author.',
    placeholder: `You're not allowed to publish.`
  }
]

const type: Challenge["type"] = "text/plain"

const description = 'A challenge that automatically fails with a custom error message.'

const getChallenge = async (subplebbitChallengeSettings: SubplebbitChallengeSettings, challengeRequestMessage: DecryptedChallengeRequestMessageType, challengeIndex: number) => {
  // add a custom error message to display to the author
  const error = subplebbitChallengeSettings?.options?.error

  // the only way to succeed the 'fail' challenge is to be excluded
  return { 
    success: false,
    error: error || `You're not allowed to publish.`
  }
}

function ChallengeFileFactory (subplebbitChallengeSettings: SubplebbitChallengeSettings): ChallengeFile {
  return {getChallenge, optionInputs, type, description}
}

export default ChallengeFileFactory
