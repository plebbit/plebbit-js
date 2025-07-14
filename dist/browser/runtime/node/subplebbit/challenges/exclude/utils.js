import { isRequestPubsubPublicationOfPost, isRequestPubsubPublicationOfReply } from "../../../../../util.js";
// e.g. secondsToGoBack = 60 would return the timestamp 1 minute ago
const getTimestampSecondsAgo = (secondsToGoBack) => Math.round(Date.now() / 1000) - secondsToGoBack;
const testScore = (excludeScore, authorScore) => excludeScore === undefined || excludeScore <= (authorScore || 0);
// firstCommentTimestamp value first needs to be put through Date.now() - firstCommentTimestamp
const testFirstCommentTimestamp = (excludeTime, authorFirstCommentTimestamp) => excludeTime === undefined || getTimestampSecondsAgo(excludeTime) >= (authorFirstCommentTimestamp || Infinity);
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
const isVote = (request) => Boolean(request.vote);
const isReply = (request) => isRequestPubsubPublicationOfReply(request);
const isPost = (request) => isRequestPubsubPublicationOfPost(request);
const isCommentEdit = (request) => Boolean(request.commentEdit);
const isCommentModeration = (request) => Boolean(request.commentModeration);
const isSubplebbitEdit = (request) => Boolean(request.subplebbitEdit);
const testPublicationType = (excludePublicationType, request) => {
    if (excludePublicationType === undefined) {
        return true;
    }
    if (excludePublicationType.post && isPost(request)) {
        return true;
    }
    if (excludePublicationType.reply && isReply(request)) {
        return true;
    }
    if (excludePublicationType.vote && isVote(request)) {
        return true;
    }
    if (excludePublicationType.commentEdit && isCommentEdit(request)) {
        return true;
    }
    if (excludePublicationType.commentModeration && isCommentModeration(request)) {
        return true;
    }
    if (excludePublicationType.subplebbitEdit && isSubplebbitEdit(request)) {
        return true;
    }
    return false;
};
export { isVote, isReply, isPost, isCommentEdit, isCommentModeration, isSubplebbitEdit, testPublicationType, testScore, testFirstCommentTimestamp, testRole };
//# sourceMappingURL=utils.js.map