import { shouldExcludeChallengeCommentCids, shouldExcludePublication, shouldExcludeChallengeSuccess, addToRateLimiter } from "./exclude/index.js";
// all challenges included with plebbit-js, in Plebbit.challenges
import textMath from "./plebbit-js-challenges/text-math.js";
import captchaCanvasV3 from "./plebbit-js-challenges/captcha-canvas-v3/index.js";
import fail from "./plebbit-js-challenges/fail.js";
import blacklist from "./plebbit-js-challenges/blacklist.js";
import question from "./plebbit-js-challenges/question.js";
import evmContractCall from "./plebbit-js-challenges/evm-contract-call/index.js";
const plebbitJsChallenges = {
    "text-math": textMath,
    "captcha-canvas-v3": captchaCanvasV3,
    fail: fail,
    blacklist: blacklist,
    question: question,
    "evm-contract-call": evmContractCall
};
const validateChallengeFileFactory = (challengeFileFactory, challengeIndex, subplebbit) => {
    const subplebbitChallengeSettings = subplebbit?.settings?.challenges?.[challengeIndex];
    if (typeof challengeFileFactory !== "function") {
        throw Error(`invalid challenge file factory export from subplebbit challenge '${subplebbitChallengeSettings?.name || subplebbitChallengeSettings?.path}' (challenge #${challengeIndex + 1})`);
    }
};
const validateChallengeFile = (challengeFile, challengeIndex, subplebbit) => {
    const subplebbitChallengeSettings = subplebbit.settings?.challenges?.[challengeIndex];
    if (typeof challengeFile?.getChallenge !== "function") {
        throw Error(`invalid challenge file from subplebbit challenge '${subplebbitChallengeSettings?.name || subplebbitChallengeSettings?.path}' (challenge #${challengeIndex + 1})`);
    }
};
const validateChallengeResult = (challengeResult, challengeIndex, subplebbit) => {
    const subplebbitChallengeSettings = subplebbit.settings?.challenges?.[challengeIndex];
    const error = `invalid challenge result from subplebbit challenge '${subplebbitChallengeSettings?.name || subplebbitChallengeSettings?.path}' (challenge #${challengeIndex + 1})`;
    if (typeof challengeResult?.success !== "boolean") {
        throw Error(error);
    }
};
const validateChallengeOrChallengeResult = (challengeOrChallengeResult, challengeIndex, subplebbit) => {
    if ("success" in challengeOrChallengeResult) {
        validateChallengeResult(challengeOrChallengeResult, challengeIndex, subplebbit);
    }
    else if (typeof challengeOrChallengeResult?.["challenge"] !== "string" ||
        typeof challengeOrChallengeResult?.["type"] !== "string" ||
        typeof challengeOrChallengeResult?.["verify"] !== "function") {
        throw Error("The challenge does not contain the correct {challenge, type, verify}");
    }
};
const getPendingChallengesOrChallengeVerification = async (challengeRequestMessage, subplebbit) => {
    // if sub has no challenges, no need to send a challenge
    if (!Array.isArray(subplebbit.settings?.challenges))
        return { challengeSuccess: true };
    const challengeOrChallengeResults = [];
    // interate over all challenges of the subplebbit, can be more than 1
    for (const i in subplebbit.settings.challenges) {
        const challengeIndex = Number(i);
        const subplebbitChallengeSettings = subplebbit.settings.challenges[challengeIndex];
        // if the challenge is an external file, fetch it and override the subplebbitChallengeSettings values
        let challengeFile;
        if (subplebbitChallengeSettings.path) {
            try {
                const ChallengeFileFactory = require(subplebbitChallengeSettings.path);
                validateChallengeFileFactory(ChallengeFileFactory, challengeIndex, subplebbit);
                challengeFile = ChallengeFileFactory(subplebbitChallengeSettings);
                validateChallengeFile(challengeFile, challengeIndex, subplebbit);
            }
            catch (e) {
                if (e instanceof Error)
                    e.message = `failed importing challenge with path '${subplebbitChallengeSettings.path}': ${e.message}`;
                throw e;
            }
        }
        // else, the challenge is included with plebbit-js
        else if (subplebbitChallengeSettings.name) {
            const ChallengeFileFactory = plebbitJsChallenges[subplebbitChallengeSettings.name];
            if (!ChallengeFileFactory) {
                throw Error(`plebbit-js challenge with name '${subplebbitChallengeSettings.name}' doesn't exist`);
            }
            validateChallengeFileFactory(ChallengeFileFactory, challengeIndex, subplebbit);
            challengeFile = ChallengeFileFactory(subplebbitChallengeSettings);
            validateChallengeFile(challengeFile, challengeIndex, subplebbit);
        }
        else
            throw Error("Failed to set up challenge file instance");
        let challengeOrChallengeResult;
        try {
            // the getChallenge function could throw
            challengeOrChallengeResult = await challengeFile.getChallenge(subplebbitChallengeSettings, challengeRequestMessage, challengeIndex, subplebbit);
        }
        catch (e) {
            if (e instanceof Error) {
                let errorMessage = `invalid getChallenge response from subplebbit challenge '${subplebbitChallengeSettings.name || subplebbitChallengeSettings.path}' (challenge #${challengeIndex + 1})`;
                e.message = `${errorMessage}: ${e.message}`;
            }
            throw e;
        }
        validateChallengeOrChallengeResult(challengeOrChallengeResult, challengeIndex, subplebbit);
        challengeOrChallengeResults.push(challengeOrChallengeResult);
    }
    // check failures and errors
    let challengeFailureCount = 0;
    let pendingChallenges = [];
    const challengeErrors = new Array(challengeOrChallengeResults.length);
    for (const i in challengeOrChallengeResults) {
        const challengeIndex = Number(i);
        const challengeOrChallengeResult = challengeOrChallengeResults[challengeIndex];
        const subplebbitChallengeSettings = subplebbit.settings.challenges[challengeIndex];
        const subplebbitChallenge = getSubplebbitChallengeFromSubplebbitChallengeSettings(subplebbitChallengeSettings);
        // exclude author from challenge based on the subplebbit minimum karma settings
        if (shouldExcludePublication(subplebbitChallenge, challengeRequestMessage.publication, subplebbit)) {
            continue;
        }
        if (await shouldExcludeChallengeCommentCids(subplebbitChallenge, challengeRequestMessage, subplebbit.plebbit)) {
            continue;
        }
        // exclude based on other challenges successes
        if (shouldExcludeChallengeSuccess(subplebbitChallenge, challengeOrChallengeResults)) {
            continue;
        }
        if ("success" in challengeOrChallengeResult && challengeOrChallengeResult.success === false) {
            challengeFailureCount++;
            challengeErrors[challengeIndex] = challengeOrChallengeResult.error;
        }
        else if ("success" in challengeOrChallengeResult && challengeOrChallengeResult.success === true) {
            // do nothing
        }
        else {
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
    }
    else if (challengeSuccess === false) {
        return { challengeSuccess, challengeErrors };
    }
    else {
        return { pendingChallenges };
    }
};
const getChallengeVerificationFromChallengeAnswers = async (pendingChallenges, challengeAnswers, subplebbit) => {
    const verifyChallengePromises = [];
    for (const i in pendingChallenges) {
        verifyChallengePromises.push(pendingChallenges[i].verify(challengeAnswers[i]));
    }
    const challengeResultsWithPendingIndexes = await Promise.all(verifyChallengePromises);
    // validate results
    for (const i in challengeResultsWithPendingIndexes) {
        const challengeResult = challengeResultsWithPendingIndexes[Number(i)];
        validateChallengeResult(challengeResult, pendingChallenges[Number(i)].index, subplebbit);
    }
    // when filtering only pending challenges, the original indexes get lost so restore them
    const challengeResults = [];
    const challengeResultToPendingChallenge = [];
    for (const i in challengeResultsWithPendingIndexes) {
        challengeResults[pendingChallenges[i].index] = challengeResultsWithPendingIndexes[i];
        challengeResultToPendingChallenge[pendingChallenges[i].index] = pendingChallenges[i];
    }
    let challengeFailureCount = 0;
    const challengeErrors = [];
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
const getChallengeVerification = async (challengeRequestMessage, subplebbit, getChallengeAnswers) => {
    if (!challengeRequestMessage) {
        throw Error(`getChallengeVerification invalid challengeRequestMessage argument '${challengeRequestMessage}'`);
    }
    if (typeof subplebbit?.plebbit?.getComment !== "function") {
        throw Error(`getChallengeVerification invalid subplebbit argument '${subplebbit}' invalid subplebbit.plebbit instance`);
    }
    if (typeof getChallengeAnswers !== "function") {
        throw Error(`getChallengeVerification invalid getChallengeAnswers argument '${getChallengeAnswers}' not a function`);
    }
    if (!Array.isArray(subplebbit.settings?.challenges))
        throw Error("subplebbit.settings?.challenges is not defined");
    const res = await getPendingChallengesOrChallengeVerification(challengeRequestMessage, subplebbit);
    let challengeVerification;
    // was able to verify without asking author for challenges
    if ("challengeSuccess" in res) {
        challengeVerification = { challengeSuccess: res.challengeSuccess };
        if ("challengeErrors" in res)
            challengeVerification.challengeErrors = res.challengeErrors;
    }
    // author still has some pending challenges to complete
    else {
        const challengeAnswers = await getChallengeAnswers(res.pendingChallenges);
        challengeVerification = await getChallengeVerificationFromChallengeAnswers(res.pendingChallenges, challengeAnswers, subplebbit);
    }
    // store the publication result and author address in mem cache for rateLimit exclude challenge settings
    addToRateLimiter(subplebbit.settings?.challenges, challengeRequestMessage.publication, challengeVerification.challengeSuccess);
    return challengeVerification;
};
// get the data to be published publicly to subplebbit.challenges
const getSubplebbitChallengeFromSubplebbitChallengeSettings = (subplebbitChallengeSettings) => {
    if (!subplebbitChallengeSettings) {
        throw Error(`getSubplebbitChallengeFromSubplebbitChallengeSettings invalid subplebbitChallengeSettings argument '${subplebbitChallengeSettings}'`);
    }
    // if the challenge is an external file, fetch it and override the subplebbitChallengeSettings values
    let challengeFile = undefined;
    if (subplebbitChallengeSettings.path) {
        try {
            const ChallengeFileFactory = require(subplebbitChallengeSettings.path);
            if (typeof ChallengeFileFactory !== "function") {
                throw Error(`invalid challenge file factory exported`);
            }
            challengeFile = ChallengeFileFactory(subplebbitChallengeSettings);
            if (typeof challengeFile?.getChallenge !== "function") {
                throw Error(`invalid challenge file`);
            }
        }
        catch (e) {
            if (e instanceof Error)
                e.message = `getSubplebbitChallengeFromSubplebbitChallengeSettings failed importing challenge with path '${subplebbitChallengeSettings.path}': ${e.message}`;
            throw e;
        }
    }
    // else, the challenge is included with plebbit-js
    else if (subplebbitChallengeSettings.name) {
        const ChallengeFileFactory = plebbitJsChallenges[subplebbitChallengeSettings.name];
        if (!ChallengeFileFactory) {
            throw Error(`getSubplebbitChallengeFromSubplebbitChallengeSettings plebbit-js challenge with name '${subplebbitChallengeSettings.name}' doesn't exist`);
        }
        if (typeof ChallengeFileFactory !== "function") {
            throw Error(`getSubplebbitChallengeFromSubplebbitChallengeSettings invalid challenge file factory exported from subplebbit challenge '${subplebbitChallengeSettings.name}'`);
        }
        challengeFile = ChallengeFileFactory(subplebbitChallengeSettings);
        if (typeof challengeFile?.getChallenge !== "function") {
            throw Error(`getSubplebbitChallengeFromSubplebbitChallengeSettings invalid challenge file from subplebbit challenge '${subplebbitChallengeSettings.name}'`);
        }
    }
    if (!challengeFile)
        throw Error("Failed to load challenge file");
    const { challenge, type } = challengeFile;
    return {
        exclude: subplebbitChallengeSettings.exclude,
        description: subplebbitChallengeSettings.description || challengeFile.description,
        challenge,
        type
    };
};
export { plebbitJsChallenges, getPendingChallengesOrChallengeVerification, getChallengeVerificationFromChallengeAnswers, getChallengeVerification, getSubplebbitChallengeFromSubplebbitChallengeSettings };
//# sourceMappingURL=index.js.map