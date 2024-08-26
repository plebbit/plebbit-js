// the purpose of this challenge is to always fail, can be used with SubplebbitChallenge.exclude to whitelist users

import type { Challenge, ChallengeFile, SubplebbitChallengeSetting } from "../../../../../subplebbit/types.js";
import type { DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor } from "../../../../../pubsub-messages/types.js";

const optionInputs = [
    {
        option: "error",
        label: "Error",
        default: `You're not allowed to publish.`,
        description: "The error to display to the author.",
        placeholder: `You're not allowed to publish.`
    }
];

const type: Challenge["type"] = "text/plain";

const description = "A challenge that automatically fails with a custom error message.";

const getChallenge = async (
    subplebbitChallengeSettings: SubplebbitChallengeSetting,
    challengeRequestMessage: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor,
    challengeIndex: number
) => {
    // add a custom error message to display to the author
    const error = subplebbitChallengeSettings?.options?.error;

    // the only way to succeed the 'fail' challenge is to be excluded
    return {
        success: false,
        error: error || `You're not allowed to publish.`
    };
};

function ChallengeFileFactory(subplebbitChallengeSettings: SubplebbitChallengeSetting): ChallengeFile {
    return { getChallenge, optionInputs, type, description };
}

export default ChallengeFileFactory;
