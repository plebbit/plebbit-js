import {shouldExcludeChallengeCommentCids, shouldExcludePublication, shouldExcludeChallengeSuccess, addToRateLimiter} from './exclude'

// all challenges included with plebbit-js, in Plebbit.challenges
import textMath from './plebbit-js-challenges/text-math'
import captchaCanvasV3 from './plebbit-js-challenges/captcha-canvas-v3'
import fail from './plebbit-js-challenges/fail'
import blacklist from './plebbit-js-challenges/blacklist'
import question from './plebbit-js-challenges/question'
import evmContractCall from './plebbit-js-challenges/evm-contract-call'
import { ChallengeVerificationMessageType, DecryptedChallengeAnswer, DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor } from '../../../../types'
import { Challenge, ChallengeFile, ChallengeFileFactory, ChallengeResult, SubplebbitChallenge, SubplebbitChallengeSettings } from '../../../../subplebbit/types'
import { ChallengeVerificationMessage } from '../../../../challenge'
import { LocalSubplebbit } from '../local-subplebbit'


type PendingChallenge = Challenge & {index: number};

export type GetChallengeAnswers = (challenges: Omit<Challenge, "verify">[]) => Promise<string[]>

const plebbitJsChallenges: Record<string, ChallengeFileFactory> = {
  'text-math': textMath,
  'captcha-canvas-v3': captchaCanvasV3,
  'fail': fail,
  'blacklist': blacklist,
  'question': question,
  'evm-contract-call': evmContractCall
}

const validateChallengeFileFactory = (challengeFileFactory: ChallengeFileFactory, challengeIndex: number, subplebbit: LocalSubplebbit) => {
  const subplebbitChallengeSettings = subplebbit.settings.challenges[challengeIndex]
  if (typeof challengeFileFactory !== 'function') {
    throw Error(`invalid challenge file factory export from subplebbit challenge '${subplebbitChallengeSettings.name || subplebbitChallengeSettings.path}' (challenge #${challengeIndex+1})`)
  }
}

const validateChallengeFile = (challengeFile: ChallengeFile, challengeIndex: number, subplebbit: LocalSubplebbit) => {
  const subplebbitChallengeSettings = subplebbit.settings.challenges[challengeIndex]
  if (typeof challengeFile?.getChallenge !== 'function') {
    throw Error(`invalid challenge file from subplebbit challenge '${subplebbitChallengeSettings.name || subplebbitChallengeSettings.path}' (challenge #${challengeIndex+1})`)
  }
}

const validateChallengeResult = (challengeResult: ChallengeResult, challengeIndex: number, subplebbit: LocalSubplebbit) => {
  const subplebbitChallengeSettings = subplebbit.settings.challenges[challengeIndex]
  const error = `invalid challenge result from subplebbit challenge '${subplebbitChallengeSettings.name || subplebbitChallengeSettings.path}' (challenge #${challengeIndex+1})`
  if (typeof challengeResult?.success !== 'boolean') {
    throw Error(error)
  }
}

const validateChallengeOrChallengeResult = (challengeOrChallengeResult: Challenge | ChallengeResult, getChallengeError: Error, challengeIndex: number, subplebbit: LocalSubplebbit) => {
  if (challengeOrChallengeResult?.["success"] !== undefined) {
    validateChallengeResult(<ChallengeResult>challengeOrChallengeResult, challengeIndex, subplebbit)
  }
  else if (
    typeof challengeOrChallengeResult?.["challenge"] !== 'string' ||
    typeof challengeOrChallengeResult?.["type"] !== 'string' ||
    typeof challengeOrChallengeResult?.["verify"] !== 'function'
  ) {
    const subplebbitChallengeSettings = subplebbit.settings.challenges[challengeIndex]
    let errorMessage = `invalid getChallenge response from subplebbit challenge '${subplebbitChallengeSettings.name || subplebbitChallengeSettings.path}' (challenge #${challengeIndex+1})`
    if (getChallengeError) {
      getChallengeError.message = `${errorMessage}: ${getChallengeError.message}`
    }
    throw getChallengeError || Error(errorMessage)
  }
}

const getPendingChallengesOrChallengeVerification = async (challengeRequestMessage: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor, subplebbit: LocalSubplebbit) => {
  const challengeResults: (Challenge | ChallengeResult)[] = []
  // interate over all challenges of the subplebbit, can be more than 1
  for (const i in subplebbit.settings?.challenges) {
    const challengeIndex = Number(i)
    const subplebbitChallengeSettings = subplebbit.settings?.challenges[challengeIndex]

    // if the challenge is an external file, fetch it and override the subplebbitChallengeSettings values
    let challengeFile: ChallengeFile
    if (subplebbitChallengeSettings.path) {
      try {
        const ChallengeFileFactory = require(subplebbitChallengeSettings.path) as ChallengeFileFactory
        validateChallengeFileFactory(ChallengeFileFactory, challengeIndex, subplebbit)
        challengeFile = ChallengeFileFactory(subplebbitChallengeSettings)
        validateChallengeFile(challengeFile, challengeIndex, subplebbit)
      }
      catch (e) {
        e.message = `failed importing challenge with path '${subplebbitChallengeSettings.path}': ${e.message}`
        throw e
      }
    }
    // else, the challenge is included with plebbit-js
    else if (subplebbitChallengeSettings.name) {
      const ChallengeFileFactory = plebbitJsChallenges[subplebbitChallengeSettings.name]
      if (!ChallengeFileFactory) {
        throw Error(`plebbit-js challenge with name '${subplebbitChallengeSettings.name}' doesn't exist`)
      }
      validateChallengeFileFactory(ChallengeFileFactory, challengeIndex, subplebbit)
      challengeFile = ChallengeFileFactory(subplebbitChallengeSettings)
      validateChallengeFile(challengeFile, challengeIndex, subplebbit)
    }

    let challengeResult: Challenge | ChallengeResult, getChallengeError: Error
    try {
      // the getChallenge function could throw
      challengeResult = await challengeFile.getChallenge(subplebbitChallengeSettings, challengeRequestMessage, challengeIndex)
    }
    catch (e) {
      getChallengeError = e
    }
    validateChallengeOrChallengeResult(challengeResult, getChallengeError, challengeIndex, subplebbit)
    challengeResults.push(challengeResult)
  }

  // check failures and errors
  let challengeFailureCount = 0
  let pendingChallenges: PendingChallenge[] = []
  const challengeErrors: string[] = new Array(challengeResults.length)
  for (const i in challengeResults) {
    const challengeIndex = Number(i)
    const challengeResult = challengeResults[challengeIndex]

    const subplebbitChallengeSettings = subplebbit.settings.challenges[challengeIndex]
    const subplebbitChallenge = getSubplebbitChallengeFromSubplebbitChallengeSettings(subplebbitChallengeSettings)

    // exclude author from challenge based on the subplebbit minimum karma settings
    if (shouldExcludePublication(subplebbitChallenge, challengeRequestMessage.publication, subplebbit)) {
      continue
    }
    if (await shouldExcludeChallengeCommentCids(subplebbitChallenge, challengeRequestMessage, subplebbit.plebbit)) {
      continue
    }

    // exclude based on other challenges successes
    if (shouldExcludeChallengeSuccess(subplebbitChallenge, challengeResults)) {
      continue
    }

    if (challengeResult["success"] === false) {
      challengeFailureCount++
      challengeErrors[challengeIndex] = (<ChallengeResult>challengeResult).error
    }
    else if (challengeResult["success"] === true) {
      // do nothing
    }
    else {
      // index is needed to exlude based on other challenge success in getChallengeVerification
      pendingChallenges.push({...<Challenge>challengeResult, index: challengeIndex})
    }
  }

  // challenge success can be undefined if there are pending challenges
  let challengeSuccess = undefined

  // if there are any failures, success is false and pending challenges are ignored
  if (challengeFailureCount > 0) {
    challengeSuccess = false
    pendingChallenges = []
  }

  // if there are no pending challenges and no failures, success is true
  if (pendingChallenges.length === 0 && challengeFailureCount === 0) {
    challengeSuccess = true
  }

  // create return value
  if (challengeSuccess === true) {
    return {challengeSuccess}
  }
  else if (challengeSuccess === false) {
    return {challengeSuccess, challengeErrors}
  }
  else {
    return {pendingChallenges}
  }
}

const getChallengeVerificationFromChallengeAnswers = async (pendingChallenges: PendingChallenge[], challengeAnswers: DecryptedChallengeAnswer["challengeAnswers"], subplebbit: LocalSubplebbit) => {
  const verifyChallengePromises: Promise<ChallengeResult>[] = []
  for (const i in pendingChallenges) {
    verifyChallengePromises.push(pendingChallenges[i].verify(challengeAnswers[i]))
  }
  const challengeResultsWithPendingIndexes = await Promise.all(verifyChallengePromises)

  // validate results
  for (const i in challengeResultsWithPendingIndexes) {
    const challengeResult = challengeResultsWithPendingIndexes[Number(i)]
    validateChallengeResult(challengeResult, pendingChallenges[Number(i)].index, subplebbit)
  }

  // when filtering only pending challenges, the original indexes get lost so restore them
  const challengeResults: ChallengeResult[] = []
  const challengeResultToPendingChallenge: PendingChallenge[] = []
  for (const i in challengeResultsWithPendingIndexes) {
    challengeResults[pendingChallenges[i].index] = challengeResultsWithPendingIndexes[i]
    challengeResultToPendingChallenge[pendingChallenges[i].index] = pendingChallenges[i]
  }

  let challengeFailureCount = 0
  const challengeErrors: ChallengeResult["error"][] = []
  for (let i in challengeResults) {
    const challengeIndex = Number(i)
    const challengeResult = challengeResults[challengeIndex]

    // the challenge results that were filtered out were already successful
    if (challengeResult === undefined) {
      continue
    }

    // exclude based on other challenges successes
    if (shouldExcludeChallengeSuccess(subplebbit.settings.challenges[challengeIndex], challengeResults)) {
      continue
    }

    if (challengeResult.success === false) {
      challengeFailureCount++
      challengeErrors[challengeIndex] = challengeResult.error
    }
  }

  if (challengeFailureCount > 0) {
    return {
      challengeSuccess: false,
      challengeErrors
    }
  }
  return {
    challengeSuccess: true,
  }
}

const getChallengeVerification = async (challengeRequestMessage: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor, subplebbit: LocalSubplebbit, getChallengeAnswers: GetChallengeAnswers): Promise<Pick<ChallengeVerificationMessageType, "challengeErrors" | "challengeSuccess" >> => {
  if (!challengeRequestMessage) {
    throw Error(`getChallengeVerification invalid challengeRequestMessage argument '${challengeRequestMessage}'`)
  }
  if (typeof subplebbit?.plebbit?.getComment !== 'function') {
    throw Error(`getChallengeVerification invalid subplebbit argument '${subplebbit}' invalid subplebbit.plebbit instance`)
  }
  if (typeof getChallengeAnswers !== 'function') {
    throw Error(`getChallengeVerification invalid getChallengeAnswers argument '${getChallengeAnswers}' not a function`)
  }

  const {pendingChallenges, challengeSuccess, challengeErrors} = await getPendingChallengesOrChallengeVerification(challengeRequestMessage, subplebbit)

  let challengeVerification: Pick<ChallengeVerificationMessage, "challengeSuccess" | "challengeErrors">
  // was able to verify without asking author for challenges
  if (!pendingChallenges) {
    challengeVerification = {challengeSuccess}
    if (challengeErrors) {
      challengeVerification.challengeErrors = challengeErrors
    }
  }
  // author still has some pending challenges to complete
  else {
    const challengeAnswers = await getChallengeAnswers(pendingChallenges)
    challengeVerification = await getChallengeVerificationFromChallengeAnswers(pendingChallenges, challengeAnswers, subplebbit)
  }

  // store the publication result and author address in mem cache for rateLimit exclude challenge settings
  addToRateLimiter(subplebbit.settings?.challenges, challengeRequestMessage.publication, challengeVerification.challengeSuccess)

  return challengeVerification
}

// get the data to be published publicly to subplebbit.challenges
const getSubplebbitChallengeFromSubplebbitChallengeSettings = (subplebbitChallengeSettings: SubplebbitChallengeSettings): SubplebbitChallenge => {
  if (!subplebbitChallengeSettings) {
    throw Error(`getSubplebbitChallengeFromSubplebbitChallengeSettings invalid subplebbitChallengeSettings argument '${subplebbitChallengeSettings}'`)
  }

  // if the challenge is an external file, fetch it and override the subplebbitChallengeSettings values
  let challengeFile: ChallengeFile
  if (subplebbitChallengeSettings.path) {
    try {
      const ChallengeFileFactory = require(subplebbitChallengeSettings.path)
      if (typeof ChallengeFileFactory !== 'function') {
        throw Error(`invalid challenge file factory exported`)
      }
      challengeFile = ChallengeFileFactory(subplebbitChallengeSettings)
      if (typeof challengeFile?.getChallenge !== 'function') {
        throw Error(`invalid challenge file`)
      }
    }
    catch (e) {
      e.message = `getSubplebbitChallengeFromSubplebbitChallengeSettings failed importing challenge with path '${subplebbitChallengeSettings.path}': ${e.message}`
      throw e
    }
  }
  // else, the challenge is included with plebbit-js
  else if (subplebbitChallengeSettings.name) {
    const ChallengeFileFactory = plebbitJsChallenges[subplebbitChallengeSettings.name]
    if (!ChallengeFileFactory) {
      throw Error(`getSubplebbitChallengeFromSubplebbitChallengeSettings plebbit-js challenge with name '${subplebbitChallengeSettings.name}' doesn't exist`)
    }
    if (typeof ChallengeFileFactory !== 'function') {
      throw Error(`getSubplebbitChallengeFromSubplebbitChallengeSettings invalid challenge file factory exported from subplebbit challenge '${subplebbitChallengeSettings.name}'`)
    }
    challengeFile = ChallengeFileFactory(subplebbitChallengeSettings)
    if (typeof challengeFile?.getChallenge !== 'function') {
      throw Error(`getSubplebbitChallengeFromSubplebbitChallengeSettings invalid challenge file from subplebbit challenge '${subplebbitChallengeSettings.name}'`)
    }
  }
  const {challenge, type} = challengeFile
  return {exclude: subplebbitChallengeSettings.exclude, description: subplebbitChallengeSettings.description || challengeFile.description, challenge, type}
}

export {
  plebbitJsChallenges,
  getPendingChallengesOrChallengeVerification,
  getChallengeVerificationFromChallengeAnswers,
  getChallengeVerification,
  getSubplebbitChallengeFromSubplebbitChallengeSettings
}
