import { Challenge, ChallengeFile, ChallengeResult, SubplebbitChallengeSetting } from "../../../../../subplebbit/types.js";
import type { DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor } from "../../../../../pubsub-messages/types.js";
import { derivePublicationFromChallengeRequest } from "../../../../../util.js";

const optionInputs = <NonNullable<ChallengeFile["optionInputs"]>>[
    {
        option: "blacklist",
        label: "Blacklist",
        default: "",
        description: "Comma separated list of author addresses to be blacklisted.",
        placeholder: `address1.eth,address2.eth,address3.eth`
    },
    {
        option: "error",
        label: "Error",
        default: `You're blacklisted.`,
        description: "The error to display to the author.",
        placeholder: `You're blacklisted.`
    }
];

const type: Challenge["type"] = "text/plain";

const description = "Blacklist author addresses.";

const getChallenge = async (
    subplebbitChallengeSettings: SubplebbitChallengeSetting,
    challengeRequestMessage: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor,
    challengeIndex: number
): Promise<ChallengeResult> => {
    // add a custom error message to display to the author
    const error = subplebbitChallengeSettings?.options?.error;
    const blacklist = subplebbitChallengeSettings?.options?.blacklist?.split(",");
    const blacklistSet = new Set(blacklist);

    const publication = derivePublicationFromChallengeRequest(challengeRequestMessage);
    if (blacklistSet.has(publication?.author?.address)) {
        return {
            success: false,
            error: error || `You're blacklisted.`
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
