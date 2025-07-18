import { Challenge, ChallengeFile, ChallengeResult, SubplebbitChallengeSetting } from "../../../../../subplebbit/types.js";
import type { DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor } from "../../../../../pubsub-messages/types.js";
import { derivePublicationFromChallengeRequest } from "../../../../../util.js";

const optionInputs = <NonNullable<ChallengeFile["optionInputs"]>>[
    {
        option: "addresses",
        label: "Addresses",
        default: "",
        description: "Comma separated list of author addresses to be blacklisted.",
        placeholder: `address1.eth,address2.eth,address3.eth`
    },
    {
        option: "urls",
        label: "URLs",
        default: "",
        description: "Comma separated list of URLs to fetch blacklists from (JSON arrays of addresses)",
        placeholder: `https://example.com/file.json,https://github.com/blacklist.json`
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

class UrlsAddressesSet {
    urlsString: string | undefined
    urls: string[] = []
    urlsSets: {[url: string]: Set<string>} = {}
    constructor() {
        // refetch urls every 5min
        setInterval(() => this.updateUrlsSets(), 1000 * 60 * 5).unref?.()
    }
    setUrls(urlsString?: string) {
        // no changes
        if (urlsString === this.urlsString) {
            return
        }
        this.urlsString = urlsString
        this.urls = this.urlsString?.split(",").map(u => u.trim()).filter(Boolean) || []
        this.urlsSets = {}
        for (const url of this.urls) {
            this.urlsSets[url] = new Set()
        }
        this.updateUrlsSets()
    }
    has(address?: string) {
        if (address) {
            for (const urlSet of Object.values(this.urlsSets)) {
                if (urlSet.has(address)) {
                    return true
                }
            }
        }
        return false
    }
    updateUrlsSets() {
        this.urls.forEach((url) => fetch(url).then(res => res.json().then(addresses => {
            this.urlsSets[url] = new Set(addresses)
        }).catch(() => {})))
    }
}
const urlsAddressesSet = new UrlsAddressesSet()

const getChallenge = async (
    subplebbitChallengeSettings: SubplebbitChallengeSetting,
    challengeRequestMessage: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor,
    challengeIndex: number
): Promise<ChallengeResult> => {
    // add a custom error message to display to the author
    const error = subplebbitChallengeSettings?.options?.error;
    const addresses = subplebbitChallengeSettings?.options?.addresses?.split(",").map(u => u.trim()).filter(Boolean)
    const addressesSet = new Set(addresses);

    const publication = derivePublicationFromChallengeRequest(challengeRequestMessage);
    if (addressesSet.has(publication?.author?.address) || urlsAddressesSet.has(publication?.author?.address)) {
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
    urlsAddressesSet.setUrls(subplebbitChallengeSettings?.options?.urls)
    return { getChallenge, optionInputs, type, description };
}

export default ChallengeFileFactory;
