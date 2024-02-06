import { CreateCaptchaOptions } from "captcha-canvas/js-script/constants"

import { Challenge, ChallengeFile, SubplebbitChallengeSettings } from "../../../../../../subplebbit/types"
import {  DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor } from "../../../../../../types"
import { createCaptcha } from "captcha-canvas"


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


  const res = createCaptcha(width, height, {captcha: setCaptchaOptions});

  const imageBase64 = (await res.image).toString("base64");

  const verify = async (_answer: string) => {
    if (res.text.toLowerCase() === _answer.toLowerCase().trim()) {
      return {success: true}
    }
    return {
      success: false, error: 'Wrong captcha.'
    }
  }
  // const challenge = (await res.image).toString('base64')
  const challenge = imageBase64
  return {challenge, verify, type}
}

function ChallengeFileFactory (subplebbitChallengeSettings: SubplebbitChallengeSettings): ChallengeFile {
  return {getChallenge, optionInputs, type, description}
}

export default ChallengeFileFactory
