// e.g. secondsToGoBack = 60 would return the timestamp 1 minute ago
const getTimestampSecondsAgo = (secondsToGoBack) => Math.round(Date.now() / 1000) - secondsToGoBack

const testScore = (excludeScore, authorScore) => excludeScore === undefined || excludeScore <= (authorScore || 0)
// firstCommentTimestamp value first needs to be put through Date.now() - firstCommentTimestamp
const testFirstCommentTimestamp = (excludeTime, authorFirstCommentTimestamp) => excludeTime === undefined || getTimestampSecondsAgo(excludeTime) >= (authorFirstCommentTimestamp || Infinity)

const isVote = (publication) => publication.vote !== undefined && publication.commentCid
const isReply = (publication) => publication.parentCid && !publication.commentCid
const isPost = (publication) => !publication.parentCid && !publication.commentCid

// boilerplate function to test if an exclude of a specific publication type passes
const testType = (excludePublicationType, publication, isType) => {
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
const testVote = (excludeVote, publication) => testType(excludeVote, publication, isVote)
const testReply = (excludeReply, publication) => testType(excludeReply, publication, isReply)
const testPost = (excludePost, publication) => testType(excludePost, publication, isPost)
const testRole = (excludeRole, authorAddress, subplebbitRoles) => {
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
