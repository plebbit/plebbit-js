const optionInputs = [
  {
    option: 'blacklist',
    label: 'Blacklist',
    default: '',
    description: 'Comma separated list of author addresses to be blacklisted.',
    placeholder: `address1.eth,address2.eth,address3.eth`
  },
  {
    option: 'error',
    label: 'Error',
    default: `You're blacklisted.`,
    description: 'The error to display to the author.',
    placeholder: `You're blacklisted.`
  }
]

const type = 'text'

const description = 'Blacklist author addresses.'

const getChallenge = async (subplebbitChallengeSettings, challengeRequestMessage, challengeIndex) => {
  // add a custom error message to display to the author
  const error = subplebbitChallengeSettings?.options?.error
  const blacklist = subplebbitChallengeSettings?.options?.blacklist?.split(',')
  const blacklistSet = new Set(blacklist)

  if (blacklistSet.has(challengeRequestMessage.publication?.author?.address)) {
    return {
      success: false,
      error: error || `You're blacklisted.`
    }
  }

  return {
    success: true
  }
}


function ChallengeFileFactory (subplebbitChallengeSettings) {
  return {getChallenge, optionInputs, type, description}
}

export default ChallengeFileFactory
