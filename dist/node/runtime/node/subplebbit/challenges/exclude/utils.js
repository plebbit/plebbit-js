import { isRequestPubsubPublicationOfPost, isRequestPubsubPublicationOfReply } from "../../../../../util.js";
// e.g. secondsToGoBack = 60 would return the timestamp 1 minute ago
const getTimestampSecondsAgo = (secondsToGoBack) => Math.round(Date.now() / 1000) - secondsToGoBack;
const testScore = (excludeScore, authorScore) => excludeScore === undefined || excludeScore <= (authorScore || 0);
// firstCommentTimestamp value first needs to be put through Date.now() - firstCommentTimestamp
const testFirstCommentTimestamp = (excludeTime, authorFirstCommentTimestamp) => excludeTime === undefined || getTimestampSecondsAgo(excludeTime) >= (authorFirstCommentTimestamp || Infinity);
const isVote = (request) => Boolean(request.vote);
const isReply = (request) => isRequestPubsubPublicationOfReply(request);
const isPost = (request) => isRequestPubsubPublicationOfPost(request);
// boilerplate function to test if an exclude of a specific publication type passes
const testType = (excludePublicationType, request, isType) => {
    if (excludePublicationType === true) {
        if (isType(request))
            return true;
        else
            return false;
    }
    if (excludePublicationType === false) {
        if (isType(request))
            return false;
        else
            return true;
    }
    // excludePublicationType is invalid, return true
    return true;
};
const testVote = (excludeVote, request) => testType(excludeVote, request, isVote);
const testReply = (excludeReply, request) => testType(excludeReply, request, isReply);
const testPost = (excludePost, request) => testType(excludePost, request, isPost);
const testRole = (excludeRole, authorAddress, subplebbitRoles) => {
    if (excludeRole === undefined || subplebbitRoles === undefined) {
        return true;
    }
    for (const roleName of excludeRole) {
        if (subplebbitRoles[authorAddress]?.role === roleName) {
            return true;
        }
    }
    return false;
};
export { isVote, isReply, isPost, testVote, testReply, testPost, testScore, testFirstCommentTimestamp, testRole };
//# sourceMappingURL=utils.js.map