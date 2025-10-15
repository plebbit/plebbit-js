import type {
    ChallengeFileInput,
    ChallengeInput,
    ChallengeResultInput,
    SubplebbitChallengeSetting
} from "../../../../../../subplebbit/types.js";
import type { DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor } from "../../../../../../pubsub-messages/types.js";
import type { SetCaptchaOption } from "captcha-canvas/dist/constants.js";

const optionInputs = <NonNullable<ChallengeFileInput["optionInputs"]>>[
    {
        option: "characters",
        label: "Characters",
        description: "Amount of characters of the captcha.",
        default: "6",
        placeholder: "example: 6"
    },
    {
        option: "height",
        label: "Height",
        description: "Height of the captcha in pixels.",
        default: "100",
        placeholder: "example: 100"
    },
    {
        option: "width",
        label: "Width",
        description: "Width of the captcha in pixels.",
        default: "300",
        placeholder: "example: 300"
    },
    {
        option: "colors",
        label: "Colors",
        description: "Colors of the captcha text as hex comma separated values.",
        default: "#32cf7e",
        placeholder: "example: #ff0000,#00ff00,#0000ff"
    }
];

const type: ChallengeInput["type"] = "image/png";

const description = "make custom image captcha";

const getChallenge = async (
    subplebbitChallengeSettings: SubplebbitChallengeSetting,
    challengeRequestMessage: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor,
    challengeIndex: number
): Promise<ChallengeInput> => {
    const { createCaptcha } = await import("captcha-canvas");
    // setCaptchaOptions https://captcha-canvas.js.org/global.html#SetCaptchaOptions

    const width = subplebbitChallengeSettings?.options?.width ? Number(subplebbitChallengeSettings?.options?.width) : 300;
    const height = subplebbitChallengeSettings?.options?.height ? Number(subplebbitChallengeSettings?.options?.height) : 100;
    const characters = subplebbitChallengeSettings?.options?.characters ? Number(subplebbitChallengeSettings?.options?.characters) : 6;
    const colors = subplebbitChallengeSettings?.options?.colors ? (subplebbitChallengeSettings?.options?.colors).split(",") : ["#32cf7e"];

    const setCaptchaOptions: SetCaptchaOption = {};
    if (characters) setCaptchaOptions.characters = characters;
    if (colors) setCaptchaOptions.colors = colors;
    const res = createCaptcha(width, height, { captcha: setCaptchaOptions });

    const imageBase64 = (await res.image).toString("base64");

    const verify = async (_answer: string): Promise<ChallengeResultInput> => {
        if (res.text.toLowerCase() === _answer.toLowerCase().trim()) {
            return { success: true };
        }
        return {
            success: false,
            error: "Wrong captcha."
        };
    };
    // const challenge = (await res.image).toString('base64')
    const challenge = imageBase64;
    return { challenge, verify, type, caseInsensitive: true };
};

function ChallengeFileFactory(subplebbitChallengeSettings: SubplebbitChallengeSetting): ChallengeFileInput {
    return { getChallenge, optionInputs, type, description, caseInsensitive: true };
}

export default ChallengeFileFactory;
