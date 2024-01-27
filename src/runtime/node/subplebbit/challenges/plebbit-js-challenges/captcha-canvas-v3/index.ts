// import {createCaptcha} from 'captcha-canvas'
import { CreateCaptchaOptions } from "captcha-canvas/js-script/constants"
import nodeNativeFunctions from "../../../../../../runtime/node/native-functions"

import { Challenge, ChallengeFile, SubplebbitChallengeSettings } from "../../../../../../subplebbit/types"
import {  DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor } from "../../../../../../types"


const optionInputs = [
  {
    option: 'characters',
    label: 'Characters',
    description: 'Amount of characters of the captcha.',
  },
  {
    option: 'height',
    label: 'Height',
    description: 'Height of the captcha.',
  },
  {
    option: 'width',
    label: 'Width',
    description: 'Width of the captcha.',
  },
  {
    option: 'color',
    label: 'Color',
    description: 'Color of the captcha.',
  },
]

const type: Challenge["type"] = "image/png"

const description = "make custom image captcha" 

const getChallenge = async (subplebbitChallengeSettings: SubplebbitChallengeSettings, challengeRequestMessage: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor, challengeIndex: number) => {
  // setCaptchaOptions https://captcha-canvas.js.org/global.html#SetCaptchaOptions

  const width = subplebbitChallengeSettings?.options?.width ? Number(subplebbitChallengeSettings?.options?.width) : undefined
  const height = subplebbitChallengeSettings?.options?.height ? Number(subplebbitChallengeSettings?.options?.height) : undefined
  const characters = subplebbitChallengeSettings?.options?.characters ? Number(subplebbitChallengeSettings?.options?.height) : undefined;
  const colors = subplebbitChallengeSettings?.options?.colors ? (subplebbitChallengeSettings?.options?.colors).split(",") : undefined;

  const setCaptchaOptions: CreateCaptchaOptions["captcha"] = {}
  if (characters) setCaptchaOptions.characters = characters;
  if (colors) setCaptchaOptions.colors = colors;


  

  // const res = await createCaptcha(width, height, {captcha: setCaptchaOptions})
  const res = await nodeNativeFunctions.createImageCaptcha(width, height, {captcha: setCaptchaOptions})
  const answer = <string>res.text
  const verify = async (_answer: string) => {
    if (answer.toLowerCase() === _answer.toLowerCase().trim()) {
      return {success: true}
    }
    return {
      success: false, error: 'Wrong captcha.'
    }
  }
  // const challenge = (await res.image).toString('base64')
  const challenge = <string>res.image
  return {challenge, verify, type}
}

function ChallengeFileFactory (subplebbitChallengeSettings: SubplebbitChallengeSettings): ChallengeFile {
  return {getChallenge, optionInputs, type, description}
}

export default ChallengeFileFactory
