import type { SubplebbitIpfsType, SubplebbitRole } from "../../../../../subplebbit/types.js";
import type { DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor } from "../../../../../pubsub-messages/types.js";
import { isRequestPubsubPublicationOfPost, isRequestPubsubPublicationOfReply } from "../../../../../util.js";

// e.g. secondsToGoBack = 60 would return the timestamp 1 minute ago
const getTimestampSecondsAgo = (secondsToGoBack: number) => Math.round(Date.now() / 1000) - secondsToGoBack;

const testScore = (excludeScore: number | undefined, authorScore: number | undefined) =>
    excludeScore === undefined || excludeScore <= (authorScore || 0);
// firstCommentTimestamp value first needs to be put through Date.now() - firstCommentTimestamp
const testFirstCommentTimestamp = (excludeTime: number | undefined, authorFirstCommentTimestamp: number | undefined) =>
    excludeTime === undefined || getTimestampSecondsAgo(excludeTime) >= (authorFirstCommentTimestamp || Infinity);

const isVote = (request: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor) => Boolean(request.vote);
const isCommentEdit = (request: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor) => Boolean(request.commentEdit);
const isCommentModeration = (request: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor) => Boolean(request.commentModeration);

const isReply = (request: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor) => isRequestPubsubPublicationOfReply(request);
const isPost = (request: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor) => isRequestPubsubPublicationOfPost(request);

// boilerplate function to test if an exclude of a specific publication type passes
const testType = (
    excludePublicationType: boolean | undefined,
    request: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor,
    isType: (request: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor) => boolean
) => {
    if (excludePublicationType === true) {
        if (isType(request)) return true;
        else return false;
    }
    if (excludePublicationType === false) {
        if (isType(request)) return false;
        else return true;
    }
    // excludePublicationType is invalid, return true
    return true;
};
const testVote = (excludeVote: boolean | undefined, request: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor) =>
    testType(excludeVote, request, isVote);

const testCommentEdit = (excludeCommentEdit: boolean | undefined, request: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor) =>
    testType(excludeCommentEdit, request, isCommentEdit);

const testCommentModeration = (
    excludeCommentModeration: boolean | undefined,
    request: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor
) => testType(excludeCommentModeration, request, isCommentModeration);
const testReply = (excludeReply: boolean | undefined, request: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor) =>
    testType(excludeReply, request, isReply);
const testPost = (excludePost: boolean | undefined, request: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor) =>
    testType(excludePost, request, isPost);
const testRole = (excludeRole: SubplebbitRole["role"][], authorAddress: string, subplebbitRoles: SubplebbitIpfsType["roles"]) => {
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

export {
    isVote,
    isReply,
    isPost,
    isCommentEdit,
    isCommentModeration,
    testVote,
    testReply,
    testPost,
    testScore,
    testFirstCommentTimestamp,
    testRole,
    testCommentEdit,
    testCommentModeration
};
