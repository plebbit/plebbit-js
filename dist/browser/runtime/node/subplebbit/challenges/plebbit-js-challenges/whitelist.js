import { derivePublicationFromChallengeRequest } from "../../../../../util.js";
const optionInputs = [
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
const type = "text/plain";
const description = "Whitelist author addresses only.";
const getChallenge = async (subplebbitChallengeSettings, challengeRequestMessage, challengeIndex) => {
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
function ChallengeFileFactory(subplebbitChallengeSettings) {
    return { getChallenge, optionInputs, type, description };
}
export default ChallengeFileFactory;
//# sourceMappingURL=whitelist.js.map