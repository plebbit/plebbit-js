import { RemoteSubplebbit } from "../../../../../subplebbit/remote-subplebbit.js";
import type { SubplebbitRole } from "../../../../../subplebbit/types.js";
import type { DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor } from "../../../../../pubsub-messages/types.js";
import type { VotePubsubMessageWithSubplebbitAuthor } from "../../../../../publications/vote/types.js";
import type { CommentPubsubMessageWithSubplebbitAuthor } from "../../../../../publications/comment/types.js";

// e.g. secondsToGoBack = 60 would return the timestamp 1 minute ago
const getTimestampSecondsAgo = (secondsToGoBack: number) => Math.round(Date.now() / 1000) - secondsToGoBack;

const testScore = (excludeScore: number | undefined, authorScore: number | undefined) =>
    excludeScore === undefined || excludeScore <= (authorScore || 0);
// firstCommentTimestamp value first needs to be put through Date.now() - firstCommentTimestamp
const testFirstCommentTimestamp = (excludeTime: number | undefined, authorFirstCommentTimestamp: number | undefined) =>
    excludeTime === undefined || getTimestampSecondsAgo(excludeTime) >= (authorFirstCommentTimestamp || Infinity);

const isVote = (
    publication: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor["publication"]
): publication is VotePubsubMessageWithSubplebbitAuthor =>
    Boolean("vote" in publication && typeof publication.vote === "number" && publication["commentCid"]);
const isReply = (
    publication: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor["publication"]
): publication is CommentPubsubMessageWithSubplebbitAuthor => Boolean("parentCid" in publication && !("commentCid" in publication));
const isPost = (
    publication: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor["publication"]
): publication is CommentPubsubMessageWithSubplebbitAuthor => Boolean(!("parentCid" in publication) && !("commentCid" in publication));

// boilerplate function to test if an exclude of a specific publication type passes
const testType = (
    excludePublicationType: boolean | undefined,
    publication: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor["publication"],
    isType: (publication: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor["publication"]) => boolean
) => {
    if (excludePublicationType === true) {
        if (isType(publication)) return true;
        else return false;
    }
    if (excludePublicationType === false) {
        if (isType(publication)) return false;
        else return true;
    }
    // excludePublicationType is invalid, return true
    return true;
};
const testVote = (excludeVote: boolean | undefined, publication: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor["publication"]) =>
    testType(excludeVote, publication, isVote);
const testReply = (
    excludeReply: boolean | undefined,
    publication: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor["publication"]
) => testType(excludeReply, publication, isReply);
const testPost = (excludePost: boolean | undefined, publication: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor["publication"]) =>
    testType(excludePost, publication, isPost);
const testRole = (excludeRole: SubplebbitRole["role"][], authorAddress: string, subplebbitRoles: RemoteSubplebbit["roles"]) => {
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
