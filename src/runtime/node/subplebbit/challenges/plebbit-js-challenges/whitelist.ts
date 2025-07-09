import { Challenge, ChallengeFile, ChallengeResult, SubplebbitChallengeSetting } from "../../../../../subplebbit/types.js";
import type { DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor } from "../../../../../pubsub-messages/types.js";
import { derivePublicationFromChallengeRequest } from "../../../../../util.js";

const optionInputs = <NonNullable<ChallengeFile["optionInputs"]>>[
    {
        option: "whitelist",
        label: "Whitelist",
        default: "",
        description: "Comma separated list of author addresses to be whitelisted.",
        placeholder: `address1.eth,address2.eth,address3.eth`
    },
    {
        option: "error",
        label: "Error",
        default: `You're not whitelisted.`,
        description: "The error to display to the author.",
        placeholder: `You're not whitelisted.`
    }
];

const type: Challenge["type"] = "text/plain";

const description = "Whitelist author addresses only.";

const getChallenge = async (
    subplebbitChallengeSettings: SubplebbitChallengeSetting,
    challengeRequestMessage: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor,
    challengeIndex: number
): Promise<ChallengeResult> => {
    // add a custom error message to display to the author
    const error = subplebbitChallengeSettings?.options?.error;
    const whitelist = subplebbitChallengeSettings?.options?.whitelist?.split(",");
    const whitelistSet = new Set(whitelist);

    const publication = derivePublicationFromChallengeRequest(challengeRequestMessage);
    if (!whitelistSet.has(publication?.author?.address)) {
        return {
            success: false,
            error: error || `You're not whitelisted.`
        };
    }

    return {
        success: true
    };
};

function ChallengeFileFactory(subplebbitChallengeSettings: SubplebbitChallengeSetting): ChallengeFile {
    return { getChallenge, optionInputs, type, description };
}

export default ChallengeFileFactory; 