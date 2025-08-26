import type { Challenge, ChallengeFile, ChallengeResult, SubplebbitChallengeSetting } from "../../../../../subplebbit/types.js";
import type { DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor } from "../../../../../pubsub-messages/types.js";
import * as fs from "node:fs";
import * as path from "node:path";
import type { LocalSubplebbit } from "../../local-subplebbit.js";

const defaultDescription =
    "Distribute unique voucher codes to specific authors. Each author gets their own voucher code that only works for them.";

const optionInputs = <NonNullable<ChallengeFile["optionInputs"]>>[
    {
        option: "question",
        label: "Question",
        default: "What is your voucher code?",
        description: "The question to ask for the voucher code.",
        placeholder: "What is your voucher code?"
    },
    {
        option: "vouchers",
        label: "Available Vouchers",
        default: "",
        description: "Comma-separated list of voucher codes available for redemption",
        placeholder: "VOUCHER123,VOUCHER456,VOUCHER789",
        required: true
    },
    {
        option: "description",
        label: "Description",
        default: defaultDescription,
        description: "Custom description for the challenge that explains the voucher system.",
        placeholder: "Enter your exclusive access code"
    },
    {
        option: "invalidVoucherError",
        label: "Invalid Voucher Error",
        default: "Invalid voucher code.",
        description: "Error message shown when an invalid voucher code is entered.",
        placeholder: "Invalid voucher code."
    },
    {
        option: "alreadyRedeemedError",
        label: "Already Redeemed Error",
        default: "This voucher has already been redeemed by another author.",
        description: "Error message shown when a voucher has already been redeemed by someone else.",
        placeholder: "This voucher has already been redeemed by another author."
    }
];

const type: Challenge["type"] = "text/plain";

const getVoucherStateFilePath = (subplebbit: LocalSubplebbit): string => {
    const challengeDataDir = path.join(subplebbit._plebbit.dataPath!, "subplebbits", `${subplebbit.address}-challenge-data`);
    return path.join(challengeDataDir, "voucher_redemption_states.json");
};

const loadRedeemedVouchers = async (subplebbit: LocalSubplebbit): Promise<Record<string, string>> => {
    const filePath = getVoucherStateFilePath(subplebbit);

    try {
        const data = await fs.promises.readFile(filePath, "utf8");
        return JSON.parse(data);
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") {
            const dir = path.dirname(filePath);
            await fs.promises.mkdir(dir, { recursive: true });
            await fs.promises.writeFile(filePath, JSON.stringify({}, null, 2));
            return {};
        }
        throw error;
    }
};

const saveRedeemedVouchers = async (subplebbit: LocalSubplebbit, redeemedVouchers: Record<string, string>): Promise<void> => {
    const filePath = getVoucherStateFilePath(subplebbit);
    const dir = path.dirname(filePath);

    await fs.promises.mkdir(dir, { recursive: true });
    await fs.promises.writeFile(filePath, JSON.stringify(redeemedVouchers, null, 2));
};

const getChallenge = async (
    subplebbitChallengeSettings: SubplebbitChallengeSetting,
    challengeRequestMessage: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor,
    challengeIndex: number,
    subplebbit: LocalSubplebbit
): Promise<Challenge | ChallengeResult> => {
    if (!subplebbitChallengeSettings?.options?.question) throw Error("No option question");

    const vouchersString = subplebbitChallengeSettings?.options?.vouchers;
    if (!vouchersString || typeof vouchersString !== "string") {
        throw Error("No vouchers configured");
    }

    const availableVouchers = vouchersString
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);
    if (availableVouchers.length === 0) {
        throw Error("No valid vouchers configured");
    }

    const redeemedVouchers = await loadRedeemedVouchers(subplebbit);
    
    const invalidVoucherError = subplebbitChallengeSettings?.options?.invalidVoucherError || "Invalid voucher code.";
    const alreadyRedeemedError = subplebbitChallengeSettings?.options?.alreadyRedeemedError || "This voucher has already been redeemed by another author.";

    const getAuthorAddress = (): string | undefined => {
        return (
            challengeRequestMessage?.comment?.author?.address ||
            challengeRequestMessage?.vote?.author?.address ||
            challengeRequestMessage?.commentEdit?.author?.address ||
            challengeRequestMessage?.commentModeration?.author?.address ||
            challengeRequestMessage?.subplebbitEdit?.author?.address
        );
    };

    const authorAddress = getAuthorAddress();
    if (!authorAddress) {
        throw Error("No author address found");
    }

    const challengeAnswer = challengeRequestMessage?.challengeAnswers?.[challengeIndex];

    if (challengeAnswer === undefined) {
        return {
            challenge: subplebbitChallengeSettings?.options?.question,
            verify: async (_answer: string) => {
                if (!availableVouchers.includes(_answer)) {
                    return {
                        success: false,
                        error: invalidVoucherError
                    };
                }

                if (redeemedVouchers[_answer] && redeemedVouchers[_answer] !== authorAddress) {
                    return {
                        success: false,
                        error: alreadyRedeemedError
                    };
                }

                if (redeemedVouchers[_answer] === authorAddress) {
                    return {
                        success: true
                    };
                }

                redeemedVouchers[_answer] = authorAddress;
                await saveRedeemedVouchers(subplebbit, redeemedVouchers);

                return {
                    success: true
                };
            },
            type
        };
    }

    if (!availableVouchers.includes(challengeAnswer)) {
        return {
            success: false,
            error: invalidVoucherError
        };
    }

    if (redeemedVouchers[challengeAnswer] && redeemedVouchers[challengeAnswer] !== authorAddress) {
        return {
            success: false,
            error: alreadyRedeemedError
        };
    }

    if (redeemedVouchers[challengeAnswer] !== authorAddress) {
        redeemedVouchers[challengeAnswer] = authorAddress;
        await saveRedeemedVouchers(subplebbit, redeemedVouchers);
    }

    return {
        success: true
    };
};

function ChallengeFileFactory(subplebbitChallengeSettings: SubplebbitChallengeSetting): ChallengeFile {
    const question = subplebbitChallengeSettings?.options?.question;
    const challenge = question;
    const description = subplebbitChallengeSettings?.options?.description || defaultDescription;

    return { getChallenge, optionInputs, type, challenge, description };
}

export default ChallengeFileFactory;
