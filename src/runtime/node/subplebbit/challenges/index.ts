import {
    shouldExcludeChallengeCommentCids,
    shouldExcludePublication,
    shouldExcludeChallengeSuccess,
    addToRateLimiter
} from "./exclude/index.js";

// all challenges included with plebbit-js, in Plebbit.challenges
import textMath from "./plebbit-js-challenges/text-math.js";
import captchaCanvasV3 from "./plebbit-js-challenges/captcha-canvas-v3/index.js";
import fail from "./plebbit-js-challenges/fail.js";
import blacklist from "./plebbit-js-challenges/blacklist.js";
import question from "./plebbit-js-challenges/question.js";
import evmContractCall from "./plebbit-js-challenges/evm-contract-call/index.js";
import type {
    ChallengeVerificationMessageType,
    DecryptedChallengeAnswer,
    DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor
} from "../../../../pubsub-messages/types.js";
import type {
    Challenge,
    ChallengeFile,
    ChallengeFileFactory,
    ChallengeResult,
    SubplebbitChallenge,
    SubplebbitChallengeSetting
} from "../../../../subplebbit/types.js";
import { LocalSubplebbit } from "../local-subplebbit.js";
import * as remeda from "remeda";
import { ChallengeFileFactorySchema, ChallengeFileSchema, SubplebbitChallengeSettingSchema } from "../../../../subplebbit/schema.js";
import { PlebbitError } from "../../../../plebbit-error.js";
import { derivePublicationFromChallengeRequest } from "../../../../util.js";

type PendingChallenge = Challenge & { index: number };

export type GetChallengeAnswers = (challenges: Omit<Challenge, "verify">[]) => Promise<DecryptedChallengeAnswer["challengeAnswers"]>;

const plebbitJsChallenges: Record<string, ChallengeFileFactory> = {
    "text-math": textMath,
    "captcha-canvas-v3": captchaCanvasV3,
    fail: fail,
    blacklist: blacklist,
    question: question,
    "evm-contract-call": evmContractCall
};

const validateChallengeFileFactory = (challengeFileFactory: ChallengeFileFactory, challengeIndex: number, subplebbit: LocalSubplebbit) => {
    const subplebbitChallengeSettings = subplebbit?.settings?.challenges?.[challengeIndex];
    if (typeof challengeFileFactory !== "function") {
        throw Error(
            `invalid challenge file factory export from subplebbit challenge '${subplebbitChallengeSettings?.name || subplebbitChallengeSettings?.path}' (challenge #${challengeIndex + 1})`
        );
    }
};

const validateChallengeFile = (challengeFile: ChallengeFile, challengeIndex: number, subplebbit: LocalSubplebbit) => {
    const subplebbitChallengeSettings = subplebbit.settings?.challenges?.[challengeIndex];
    if (typeof challengeFile?.getChallenge !== "function") {
        throw Error(
            `invalid challenge file from subplebbit challenge '${subplebbitChallengeSettings?.name || subplebbitChallengeSettings?.path}' (challenge #${challengeIndex + 1})`
        );
    }
};

const validateChallengeResult = (challengeResult: ChallengeResult, challengeIndex: number, subplebbit: LocalSubplebbit) => {
    const subplebbitChallengeSettings = subplebbit.settings?.challenges?.[challengeIndex];
    const error = `invalid challenge result from subplebbit challenge '${subplebbitChallengeSettings?.name || subplebbitChallengeSettings?.path}' (challenge #${challengeIndex + 1})`;
    if (typeof challengeResult?.success !== "boolean") {
        throw Error(error);
    }
};

const validateChallengeOrChallengeResult = (
    challengeOrChallengeResult: Challenge | ChallengeResult,
    challengeIndex: number,
    subplebbit: LocalSubplebbit
) => {
    if ("success" in challengeOrChallengeResult) {
        validateChallengeResult(challengeOrChallengeResult, challengeIndex, subplebbit);
    } else if (
        typeof challengeOrChallengeResult?.["challenge"] !== "string" ||
        typeof challengeOrChallengeResult?.["type"] !== "string" ||
        typeof challengeOrChallengeResult?.["verify"] !== "function"
    ) {
        throw Error("The challenge does not contain the correct {challenge, type, verify}");
    }
};

const getPendingChallengesOrChallengeVerification = async (
    challengeRequestMessage: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor,
    subplebbit: LocalSubplebbit
): Promise<
    { challengeSuccess: true } | { challengeSuccess: false; challengeErrors: string[] } | { pendingChallenges: PendingChallenge[] }
> => {
    // if sub has no challenges, no need to send a challenge
    if (!Array.isArray(subplebbit.settings?.challenges)) return { challengeSuccess: true };
    const challengeOrChallengeResults: (Challenge | ChallengeResult)[] = [];
    // interate over all challenges of the subplebbit, can be more than 1
    for (const i in subplebbit.settings.challenges) {
        const challengeIndex = Number(i);
        const subplebbitChallengeSettings = subplebbit.settings.challenges[challengeIndex];

        if (!subplebbitChallengeSettings.path && !plebbitJsChallenges[subplebbitChallengeSettings.name!])
            throw Error("You have to provide either path or a stored plebbit-js challenge");
        // if the challenge is an external file, fetch it and override the subplebbitChallengeSettings values
        let ChallengeFileFactory: ChallengeFileFactory;

        try {
            ChallengeFileFactory = ChallengeFileFactorySchema.parse(
                subplebbitChallengeSettings.path
                    ? require(subplebbitChallengeSettings.path)
                    : plebbitJsChallenges[subplebbitChallengeSettings.name!]
            );
            validateChallengeFileFactory(ChallengeFileFactory, challengeIndex, subplebbit);
        } catch (e) {
            throw new PlebbitError("ERR_FAILED_TO_IMPORT_CHALLENGE_FILE_FACTORY", {
                path: subplebbitChallengeSettings.path,
                subplebbitChallengeSettings,
                error: e,
                challengeIndex
            });
        }

        const challengeFile = ChallengeFileFactory(subplebbitChallengeSettings);
        validateChallengeFile(challengeFile, challengeIndex, subplebbit);

        let challengeOrChallengeResult: Challenge | ChallengeResult;
        try {
            // the getChallenge function could throw
            challengeOrChallengeResult = await challengeFile.getChallenge(
                subplebbitChallengeSettings,
                challengeRequestMessage,
                challengeIndex,
                subplebbit
            );
            validateChallengeOrChallengeResult(challengeOrChallengeResult, challengeIndex, subplebbit);
        } catch (e) {
            throw new PlebbitError("ERR_INVALID_RESULT_FROM_GET_CHALLENGE_FUNCTION", {
                subplebbitChallengeSettings,
                challengeName: subplebbitChallengeSettings.name || subplebbitChallengeSettings.path,
                challengeRequestMessage,
                challengeIndex: challengeIndex + 1,
                error: e
            });
        }
        challengeOrChallengeResults.push(challengeOrChallengeResult);
    }

    // check failures and errors
    let challengeFailureCount = 0;
    let pendingChallenges: PendingChallenge[] = [];
    const challengeErrors: string[] = new Array(challengeOrChallengeResults.length);
    const publication = derivePublicationFromChallengeRequest(challengeRequestMessage);
    for (const i in challengeOrChallengeResults) {
        const challengeIndex = Number(i);
        const challengeOrChallengeResult = challengeOrChallengeResults[challengeIndex];

        const subplebbitChallengeSettings = subplebbit.settings.challenges[challengeIndex];
        const subplebbitChallenge = getSubplebbitChallengeFromSubplebbitChallengeSettings(subplebbitChallengeSettings);

        // exclude author from challenge based on the subplebbit minimum karma settings
        if (shouldExcludePublication(subplebbitChallenge, challengeRequestMessage, subplebbit)) {
            continue;
        }
        if (await shouldExcludeChallengeCommentCids(subplebbitChallenge, challengeRequestMessage, subplebbit._plebbit)) {
            continue;
        }

        // exclude based on other challenges successes
        if (shouldExcludeChallengeSuccess(subplebbitChallenge, challengeOrChallengeResults)) {
            continue;
        }

        if ("success" in challengeOrChallengeResult && challengeOrChallengeResult.success === false) {
            challengeFailureCount++;
            challengeErrors[challengeIndex] = challengeOrChallengeResult.error;
        } else if ("success" in challengeOrChallengeResult && challengeOrChallengeResult.success === true) {
            // do nothing
        } else {
            // index is needed to exlude based on other challenge success in getChallengeVerification
            pendingChallenges.push({ ...challengeOrChallengeResult, index: challengeIndex });
        }
    }

    // challenge success can be undefined if there are pending challenges
    let challengeSuccess = undefined;

    // if there are any failures, success is false and pending challenges are ignored
    if (challengeFailureCount > 0) {
        challengeSuccess = false;
        pendingChallenges = [];
    }

    // if there are no pending challenges and no failures, success is true
    if (pendingChallenges.length === 0 && challengeFailureCount === 0) {
        challengeSuccess = true;
    }

    // create return value
    if (challengeSuccess === true) {
        return { challengeSuccess };
    } else if (challengeSuccess === false) {
        return { challengeSuccess, challengeErrors };
    } else {
        return { pendingChallenges };
    }
};

const getChallengeVerificationFromChallengeAnswers = async (
    pendingChallenges: PendingChallenge[],
    challengeAnswers: DecryptedChallengeAnswer["challengeAnswers"],
    subplebbit: LocalSubplebbit
): Promise<{ challengeSuccess: true } | { challengeSuccess: false; challengeErrors: string[] }> => {
    const verifyChallengePromises: Promise<ChallengeResult>[] = [];
    for (const i in pendingChallenges) {
        verifyChallengePromises.push(pendingChallenges[i].verify(challengeAnswers[i])); // TODO double check if zod verifies output of a promise
    }
    const challengeResultsWithPendingIndexes = await Promise.all(verifyChallengePromises);

    // validate results
    for (const i in challengeResultsWithPendingIndexes) {
        const challengeResult = challengeResultsWithPendingIndexes[Number(i)];
        validateChallengeResult(challengeResult, pendingChallenges[Number(i)].index, subplebbit);
    }

    // when filtering only pending challenges, the original indexes get lost so restore them
    const challengeResults: ChallengeResult[] = [];
    const challengeResultToPendingChallenge: PendingChallenge[] = [];
    for (const i in challengeResultsWithPendingIndexes) {
        challengeResults[pendingChallenges[i].index] = challengeResultsWithPendingIndexes[i];
        challengeResultToPendingChallenge[pendingChallenges[i].index] = pendingChallenges[i];
    }

    let challengeFailureCount = 0;
    const challengeErrors: string[] = [];
    for (let i in challengeResults) {
        const challengeIndex = Number(i);
        if (!subplebbit.settings?.challenges?.[challengeIndex])
            throw Error("subplebbit.settings.challenges[challengeIndex] does not exist");
        const challengeResult = challengeResults[challengeIndex];

        // the challenge results that were filtered out were already successful
        if (challengeResult === undefined) {
            continue;
        }

        // exclude based on other challenges successes
        if (shouldExcludeChallengeSuccess(subplebbit.settings.challenges[challengeIndex], challengeResults)) {
            continue;
        }

        if (challengeResult.success === false) {
            challengeFailureCount++;
            challengeErrors[challengeIndex] = challengeResult.error;
        }
    }

    if (challengeFailureCount > 0) {
        return {
            challengeSuccess: false,
            challengeErrors
        };
    }
    return {
        challengeSuccess: true
    };
};

const getChallengeVerification = async (
    challengeRequestMessage: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor,
    subplebbit: LocalSubplebbit,
    getChallengeAnswers: GetChallengeAnswers
): Promise<Pick<ChallengeVerificationMessageType, "challengeErrors" | "challengeSuccess">> => {
    if (!challengeRequestMessage) {
        throw Error(`getChallengeVerification invalid challengeRequestMessage argument '${challengeRequestMessage}'`);
    }
    if (typeof subplebbit?._plebbit?.getComment !== "function") {
        throw Error(`getChallengeVerification invalid subplebbit argument '${subplebbit}' invalid subplebbit.plebbit instance`);
    }
    if (typeof getChallengeAnswers !== "function") {
        throw Error(`getChallengeVerification invalid getChallengeAnswers argument '${getChallengeAnswers}' not a function`);
    }
    if (!Array.isArray(subplebbit.settings?.challenges)) throw Error("subplebbit.settings?.challenges is not defined");

    const res = await getPendingChallengesOrChallengeVerification(challengeRequestMessage, subplebbit);

    let challengeVerification: Pick<ChallengeVerificationMessageType, "challengeSuccess" | "challengeErrors">;
    // was able to verify without asking author for challenges
    if ("challengeSuccess" in res) {
        challengeVerification = { challengeSuccess: res.challengeSuccess };
        if ("challengeErrors" in res) challengeVerification.challengeErrors = res.challengeErrors;
    }
    // author still has some pending challenges to complete
    else {
        const challengeAnswers = await getChallengeAnswers(
            res.pendingChallenges.map((challenge) => remeda.omit(challenge, ["index", "verify"]))
        );
        challengeVerification = await getChallengeVerificationFromChallengeAnswers(res.pendingChallenges, challengeAnswers, subplebbit);
    }

    // store the publication result and author address in mem cache for rateLimit exclude challenge settings
    addToRateLimiter(subplebbit.settings?.challenges, challengeRequestMessage, challengeVerification.challengeSuccess);

    return challengeVerification;
};

// get the data to be published publicly to subplebbit.challenges
const getSubplebbitChallengeFromSubplebbitChallengeSettings = (
    subplebbitChallengeSettings: SubplebbitChallengeSetting
): SubplebbitChallenge => {
    subplebbitChallengeSettings = SubplebbitChallengeSettingSchema.parse(subplebbitChallengeSettings);

    // if the challenge is an external file, fetch it and override the subplebbitChallengeSettings values
    let challengeFile: ChallengeFile | undefined = undefined;
    if (subplebbitChallengeSettings.path) {
        try {
            const ChallengeFileFactory = ChallengeFileFactorySchema.parse(require(subplebbitChallengeSettings.path));
            challengeFile = ChallengeFileSchema.parse(ChallengeFileFactory(subplebbitChallengeSettings));
        } catch (e) {
            if (e instanceof Error)
                e.message = `getSubplebbitChallengeFromSubplebbitChallengeSettings failed importing challenge with path '${subplebbitChallengeSettings.path}': ${e.message}`;
            throw e;
        }
    }
    // else, the challenge is included with plebbit-js
    else if (subplebbitChallengeSettings.name) {
        const ChallengeFileFactory = ChallengeFileFactorySchema.parse(plebbitJsChallenges[subplebbitChallengeSettings.name]);
        challengeFile = ChallengeFileSchema.parse(ChallengeFileFactory(subplebbitChallengeSettings));
    }
    if (!challengeFile) throw Error("Failed to load challenge file");
    const { challenge, type } = challengeFile;
    return {
        exclude: subplebbitChallengeSettings.exclude,
        description: subplebbitChallengeSettings.description || challengeFile.description,
        challenge,
        type
    };
};

export {
    plebbitJsChallenges,
    getPendingChallengesOrChallengeVerification,
    getChallengeVerificationFromChallengeAnswers,
    getChallengeVerification,
    getSubplebbitChallengeFromSubplebbitChallengeSettings
};
