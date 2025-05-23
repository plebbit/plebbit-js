//@ts-expect-error
import TinyCache from "tinycache";
import QuickLRU from "quick-lru";
import { testScore, testFirstCommentTimestamp, testRole, testPublicationType } from "./utils.js";
import { testRateLimit } from "./rate-limiter.js";
import { derivePublicationFromChallengeRequest } from "../../../../../util.js";
const shouldExcludePublication = (subplebbitChallenge, request, subplebbit) => {
    if (!subplebbitChallenge) {
        throw Error(`shouldExcludePublication invalid subplebbitChallenge argument '${subplebbitChallenge}'`);
    }
    const publication = derivePublicationFromChallengeRequest(request);
    if (!publication?.author) {
        throw Error(`shouldExcludePublication invalid publication argument '${publication}'`);
    }
    const author = publication.author;
    if (!subplebbitChallenge.exclude) {
        return false;
    }
    if (!Array.isArray(subplebbitChallenge.exclude)) {
        throw Error(`shouldExcludePublication invalid subplebbitChallenge argument '${subplebbitChallenge}' subplebbitChallenge.exclude not an array`);
    }
    // if match any of the exclude array, should exclude
    for (const exclude of subplebbitChallenge.exclude) {
        // if doesn't have any author excludes, shouldn't exclude
        if (typeof exclude.postScore !== "number" &&
            typeof exclude.replyScore !== "number" &&
            typeof exclude.firstCommentTimestamp !== "number" &&
            !exclude.address?.length &&
            exclude.publicationType === undefined &&
            exclude.rateLimit === undefined &&
            !exclude.role?.length) {
            continue;
        }
        // if match all of the exclude item properties, should exclude
        // keep separated for easier debugging
        let shouldExclude = true;
        if (!testScore(exclude.postScore, author.subplebbit?.postScore)) {
            shouldExclude = false;
        }
        if (!testScore(exclude.replyScore, author.subplebbit?.replyScore)) {
            shouldExclude = false;
        }
        if (!testFirstCommentTimestamp(exclude.firstCommentTimestamp, author.subplebbit?.firstCommentTimestamp)) {
            shouldExclude = false;
        }
        if (!testPublicationType(exclude.publicationType, request)) {
            shouldExclude = false;
        }
        if (!testRateLimit(exclude, request)) {
            shouldExclude = false;
        }
        if (exclude.address && !exclude.address.includes(author.address)) {
            shouldExclude = false;
        }
        if (Array.isArray(exclude.role) && !testRole(exclude.role, publication.author.address, subplebbit?.roles)) {
            shouldExclude = false;
        }
        // if one of the exclude item is successful, should exclude author
        if (shouldExclude) {
            return true;
        }
    }
    return false;
};
const shouldExcludeChallengeSuccess = (subplebbitChallenge, challengeResults) => {
    if (!subplebbitChallenge) {
        throw Error(`shouldExcludeChallengeSuccess invalid subplebbitChallenge argument '${subplebbitChallenge}'`);
    }
    if (challengeResults && !Array.isArray(challengeResults)) {
        throw Error(`shouldExcludeChallengeSuccess invalid challengeResults argument '${challengeResults}'`);
    }
    // no challenge results or no exclude rules
    if (!challengeResults?.length || !subplebbitChallenge.exclude?.length) {
        return false;
    }
    // if match any of the exclude array, should exclude
    for (const excludeItem of subplebbitChallenge.exclude) {
        // has no challenge success exclude rules
        if (!excludeItem.challenges?.length) {
            continue;
        }
        // if any of exclude.challenges failed, don't exclude
        let shouldExclude = true;
        for (const challengeIndex of excludeItem.challenges) {
            const challengeRes = challengeResults[challengeIndex];
            if (!("success" in challengeRes) || ("success" in challengeRes && challengeRes.success !== true)) {
                // found a false, should not exclude based on this exclude item,
                // but try again in the next exclude item
                shouldExclude = false;
                break;
            }
        }
        // if all exclude.challenges succeeded, should exclude
        if (shouldExclude) {
            return true;
        }
    }
    return false;
};
const commentCache = new QuickLRU({
    maxSize: 10000
});
// cache for fetching comment updates, expire after 1 day
const commentUpdateCache = new TinyCache();
const commentUpdateCacheTime = 1000 * 60 * 60;
const getCommentPending = {}; // cid -> boolean if it's loading or not
const shouldExcludeChallengeCommentCids = async (subplebbitChallenge, challengeRequestMessage, plebbit) => {
    if (!subplebbitChallenge) {
        throw Error(`shouldExcludeChallengeCommentCids invalid subplebbitChallenge argument '${subplebbitChallenge}'`);
    }
    if (!challengeRequestMessage) {
        throw Error(`shouldExcludeChallengeCommentCids invalid challengeRequestMessage argument '${challengeRequestMessage}'`);
    }
    if (typeof plebbit?.getComment !== "function") {
        throw Error(`shouldExcludeChallengeCommentCids invalid plebbit argument '${plebbit}'`);
    }
    const publication = derivePublicationFromChallengeRequest(challengeRequestMessage);
    const commentCids = challengeRequestMessage.challengeCommentCids;
    const author = publication?.author;
    if (commentCids && !Array.isArray(commentCids)) {
        throw Error(`shouldExcludeChallengeCommentCids invalid commentCids argument '${commentCids}'`);
    }
    if (!author?.address || typeof author?.address !== "string") {
        throw Error(`shouldExcludeChallengeCommentCids invalid challengeRequestMessage.publication.author.address argument '${author?.address}'`);
    }
    const _getComment = async (commentCid, addressesSet) => {
        // comment is cached
        let cachedComment = commentCache.get(commentCid);
        // comment is not cached, add to cache
        let comment;
        if (!cachedComment) {
            comment = await plebbit.getComment(commentCid);
            // only cache useful values
            cachedComment = { subplebbitAddress: comment.subplebbitAddress, author: { address: comment.author.address } };
            commentCache.set(commentCid, cachedComment);
        }
        // subplebbit address doesn't match filter
        if (!addressesSet.has(cachedComment.subplebbitAddress)) {
            throw Error(`comment doesn't have subplebbit address`);
        }
        // author address doesn't match author
        if (cachedComment?.author?.address !== author.address) {
            throw Error(`comment author address doesn't match publication author address`);
        }
        // comment hasn't been updated yet
        let cachedCommentUpdate = commentUpdateCache.get(commentCid);
        if (!cachedCommentUpdate) {
            const commentUpdate = comment || (await plebbit.createComment({ cid: commentCid }));
            const commentUpdatePromise = new Promise((resolve) => commentUpdate.on("update", () => typeof commentUpdate.updatedAt === "number" && resolve(1)));
            await commentUpdate.update();
            await commentUpdatePromise;
            await commentUpdate.stop();
            commentUpdate.removeAllListeners("update");
            // only cache useful values
            if (commentUpdate?.author?.subplebbit) {
                cachedCommentUpdate = { author: { subplebbit: commentUpdate?.author?.subplebbit } };
                commentUpdateCache.put(commentCid, cachedCommentUpdate, commentUpdateCacheTime);
            }
            commentUpdateCache._timeouts[commentCid].unref?.();
        }
        return { ...cachedComment, author: { ...cachedComment.author, ...cachedCommentUpdate?.author } };
    };
    const getComment = async (commentCid, addressesSet) => {
        // don't fetch the same comment twice
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const pendingKey = commentCid + plebbit.parsedPlebbitOptions?.ipfsGatewayUrls?.[0] + plebbit.parsedPlebbitOptions?.kuboRpcClientsOptions?.[0].url;
        while (getCommentPending[pendingKey] === true) {
            await sleep(20);
        }
        getCommentPending[pendingKey] = true;
        try {
            const res = await _getComment(commentCid, addressesSet);
            return res;
        }
        catch (e) {
            throw e;
        }
        finally {
            getCommentPending[pendingKey] = false;
        }
    };
    const validateComment = async (commentCid, addressesSet, exclude) => {
        const comment = await getComment(commentCid, addressesSet);
        const { postScore, replyScore, firstCommentTimestamp } = exclude?.subplebbit || {};
        if (testScore(postScore, comment.author?.subplebbit?.postScore) &&
            testScore(replyScore, comment.author?.subplebbit?.replyScore) &&
            testFirstCommentTimestamp(firstCommentTimestamp, comment.author?.subplebbit?.firstCommentTimestamp)) {
            // do nothing, comment is valid
            return;
        }
        throw Error(`should not exclude comment cid`);
    };
    const validateExclude = async (exclude) => {
        let { addresses, maxCommentCids } = exclude?.subplebbit || {};
        if (!maxCommentCids) {
            maxCommentCids = 3;
        }
        // no friendly sub addresses
        if (!addresses?.length) {
            throw Error("no friendly sub addresses");
        }
        const addressesSet = new Set(addresses);
        // author didn't provide comment cids
        if (!commentCids?.length) {
            throw Error(`author didn't provide comment cids`);
        }
        // fetch and test all comments of the author async
        const validateCommentPromises = [];
        let i = 0;
        while (i < maxCommentCids) {
            const commentCid = commentCids[i++];
            if (commentCid) {
                validateCommentPromises.push(validateComment(commentCid, addressesSet, exclude));
            }
        }
        // if doesn't throw, at least 1 comment was valid
        try {
            //@ts-expect-error
            await Promise.any(validateCommentPromises);
        }
        catch (e) {
            // console.log(validateCommentPromises) // debug all validate comments
            if (e instanceof Error)
                e.message = `should not exclude: ${e.message}`;
            throw e;
        }
        // if at least 1 comment was valid, do nothing, exclude is valid
    };
    // iterate over all excludes, and validate them async
    const validateExcludePromises = [];
    for (const exclude of subplebbitChallenge.exclude || []) {
        validateExcludePromises.push(validateExclude(exclude));
    }
    // if at least 1 valid exclude, should exclude
    try {
        // @ts-expect-error
        await Promise.any(validateExcludePromises);
        return true;
    }
    catch (e) {
        // console.log(validateExcludePromises) // debug all validate excludes
    }
    // if no exclude are valid, should not exclude
    return false;
};
export { shouldExcludeChallengeCommentCids, shouldExcludePublication, shouldExcludeChallengeSuccess };
//# sourceMappingURL=exclude.js.map