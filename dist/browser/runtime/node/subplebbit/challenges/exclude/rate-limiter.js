import QuickLRU from "quick-lru";
import { isVote, isReply, isPost, testVote, testReply, testPost } from "./utils.js";
import { RateLimiter } from "limiter-es6-compat";
import { derivePublicationFromChallengeRequest, isRequestPubsubPublicationOfPost, isRequestPubsubPublicationOfReply } from "../../../../../util.js";
// each author could have 20+ rate limiters each if the sub has
// several rate limit rules so keep a large cache
const rateLimiters = new QuickLRU({ maxSize: 50000 });
const getRateLimiterName = (exclude, publication, publicationType, challengeSuccess) => `${publication.author.address}-${exclude.rateLimit}-${publicationType}-${challengeSuccess}`;
const getOrCreateRateLimiter = (exclude, publication, publicationType, challengeSuccess) => {
    if (typeof exclude.rateLimit !== "number")
        throw Error("Can't create a RateLimiter without exclude.rateLimit");
    const rateLimiterName = getRateLimiterName(exclude, publication, publicationType, challengeSuccess);
    let rateLimiter = rateLimiters.get(rateLimiterName);
    if (!rateLimiter) {
        rateLimiter = new RateLimiter({ tokensPerInterval: exclude.rateLimit, interval: "hour", fireImmediately: true });
        //@ts-expect-error
        rateLimiter.name = rateLimiterName; // add name for debugging
        rateLimiters.set(rateLimiterName, rateLimiter);
    }
    return rateLimiter;
};
const addFilteredRateLimiter = (exclude, publication, publicationType, challengeSuccess, filteredRateLimiters) => {
    filteredRateLimiters[getRateLimiterName(exclude, publication, publicationType, challengeSuccess)] = getOrCreateRateLimiter(exclude, publication, publicationType, challengeSuccess);
};
const getRateLimitersToTest = (exclude, request, challengeSuccess) => {
    const publication = derivePublicationFromChallengeRequest(request);
    // get all rate limiters associated with the exclude (publication type and challengeSuccess true/false)
    const filteredRateLimiters = {};
    if (testPost(exclude.post, request) && ![exclude.reply, exclude.vote].includes(true)) {
        addFilteredRateLimiter(exclude, publication, "post", challengeSuccess, filteredRateLimiters);
    }
    if (testReply(exclude.reply, request) && ![exclude.post, exclude.vote].includes(true)) {
        addFilteredRateLimiter(exclude, publication, "reply", challengeSuccess, filteredRateLimiters);
    }
    if (testVote(exclude.vote, request) && ![exclude.post, exclude.reply].includes(true)) {
        addFilteredRateLimiter(exclude, publication, "vote", challengeSuccess, filteredRateLimiters);
    }
    return filteredRateLimiters;
};
const testRateLimit = (exclude, request) => {
    if (exclude?.rateLimit === undefined ||
        (exclude.post === true && !isPost(request)) ||
        (exclude.reply === true && !isReply(request)) ||
        (exclude.vote === true && !isVote(request)) ||
        (exclude.post === false && isPost(request)) ||
        (exclude.reply === false && isReply(request)) ||
        (exclude.vote === false && isVote(request))) {
        // early exit based on exclude type and publication type
        return true;
    }
    // if rateLimitChallengeSuccess is undefined or true, only use {challengeSuccess: true} rate limiters
    let challengeSuccess = true;
    if (exclude.rateLimitChallengeSuccess === false) {
        challengeSuccess = false;
    }
    // check all the rate limiters that match the exclude and publication type
    const rateLimiters = getRateLimitersToTest(exclude, request, challengeSuccess);
    // if any of the matching rate limiter is out of tokens, test failed
    for (const rateLimiter of Object.values(rateLimiters)) {
        const tokensRemaining = rateLimiter.getTokensRemaining();
        // token per action is 1, so any value below 1 is invalid
        if (tokensRemaining < 1)
            return false;
    }
    return true;
};
const getRateLimitersToAddTo = (excludeArray, request, challengeSuccess) => {
    // get all rate limiters associated with the exclude (publication type and challengeSuccess true/false)
    const filteredRateLimiters = {};
    const publication = derivePublicationFromChallengeRequest(request);
    for (const exclude of excludeArray) {
        if (exclude?.rateLimit === undefined) {
            continue;
        }
        if (isRequestPubsubPublicationOfPost(request)) {
            addFilteredRateLimiter(exclude, publication, "post", challengeSuccess, filteredRateLimiters);
        }
        if (isRequestPubsubPublicationOfReply(request)) {
            addFilteredRateLimiter(exclude, publication, "reply", challengeSuccess, filteredRateLimiters);
        }
        if (request.vote) {
            addFilteredRateLimiter(exclude, publication, "vote", challengeSuccess, filteredRateLimiters);
        }
    }
    return filteredRateLimiters;
};
const addToRateLimiter = (subplebbitChallenges, request, challengeSuccess) => {
    if (!subplebbitChallenges) {
        // subplebbit has no challenges, no need to rate limit
        return;
    }
    if (!Array.isArray(subplebbitChallenges)) {
        throw Error(`addToRateLimiter invalid argument subplebbitChallenges '${subplebbitChallenges}' not an array`);
    }
    if (typeof challengeSuccess !== "boolean") {
        throw Error(`addToRateLimiter invalid argument challengeSuccess '${challengeSuccess}' not a boolean`);
    }
    // get all exclude items from all subplebbit challenges
    const excludeArray = [];
    for (const subplebbitChallenge of subplebbitChallenges) {
        for (const exclude of subplebbitChallenge?.exclude || []) {
            excludeArray.push(exclude);
        }
    }
    if (!excludeArray.length) {
        // no need to add to rate limiter if the subplebbit has no exclude rules in any challenges
        return;
    }
    const rateLimiters = getRateLimitersToAddTo(excludeArray, request, challengeSuccess);
    for (const rateLimiter of Object.values(rateLimiters)) {
        rateLimiter.tryRemoveTokens(1);
    }
};
export { addToRateLimiter, testRateLimit };
//# sourceMappingURL=rate-limiter.js.map