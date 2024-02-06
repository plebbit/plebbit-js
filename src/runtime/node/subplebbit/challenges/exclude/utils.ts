import { RemoteSubplebbit } from "../../../../../subplebbit/remote-subplebbit.js"
import { SubplebbitRole } from "../../../../../subplebbit/types.js"
import { DecryptedChallengeRequestMessageType } from "../../../../../types.js"

// e.g. secondsToGoBack = 60 would return the timestamp 1 minute ago
const getTimestampSecondsAgo = (secondsToGoBack: number) => Math.round(Date.now() / 1000) - secondsToGoBack

const testScore = (excludeScore: number | undefined, authorScore: number) => excludeScore === undefined || excludeScore <= (authorScore || 0)
// firstCommentTimestamp value first needs to be put through Date.now() - firstCommentTimestamp
const testFirstCommentTimestamp = (excludeTime: number | undefined, authorFirstCommentTimestamp: number | undefined) => excludeTime === undefined || getTimestampSecondsAgo(excludeTime) >= (authorFirstCommentTimestamp || Infinity)

const isVote = (publication: DecryptedChallengeRequestMessageType["publication"]) => Boolean(publication["vote"] !== undefined && publication["commentCid"])
const isReply = (publication: DecryptedChallengeRequestMessageType["publication"]) => Boolean(publication["parentCid"] && !publication["commentCid"])
const isPost = (publication: DecryptedChallengeRequestMessageType["publication"]) => Boolean(!publication["parentCid"] && !publication["commentCid"])

// boilerplate function to test if an exclude of a specific publication type passes
const testType = (excludePublicationType: boolean | undefined, publication: DecryptedChallengeRequestMessageType["publication"], isType: (publication: DecryptedChallengeRequestMessageType["publication"]) => boolean) => {
  if (excludePublicationType === undefined) return true
  if (excludePublicationType === true) {
    if (isType(publication)) return true
    else return false
  }
  if (excludePublicationType === false) {
    if (isType(publication)) return false
    else return true
  }
  // excludePublicationType is invalid, return true
  return true
}
const testVote = (excludeVote: boolean, publication: DecryptedChallengeRequestMessageType["publication"]) => testType(excludeVote, publication, isVote)
const testReply = (excludeReply: boolean, publication: DecryptedChallengeRequestMessageType["publication"]) => testType(excludeReply, publication, isReply)
const testPost = (excludePost: boolean, publication: DecryptedChallengeRequestMessageType["publication"]) => testType(excludePost, publication, isPost)
const testRole = (excludeRole: SubplebbitRole["role"][], authorAddress: string, subplebbitRoles: RemoteSubplebbit["roles"]) => {
  if (excludeRole === undefined || subplebbitRoles === undefined) {
    return true
  }
  for (const roleName of excludeRole) {
    if (subplebbitRoles[authorAddress]?.role === roleName) {
      return true
    }
  }
  return false
}

export {
  isVote, 
  isReply, 
  isPost, 
  testVote, 
  testReply,
  testPost,
  testScore,
  testFirstCommentTimestamp,
  testRole
}
