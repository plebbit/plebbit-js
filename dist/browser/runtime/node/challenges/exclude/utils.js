"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testRole = exports.testFirstCommentTimestamp = exports.testScore = exports.testPost = exports.testReply = exports.testVote = exports.isPost = exports.isReply = exports.isVote = void 0;
// e.g. secondsToGoBack = 60 would return the timestamp 1 minute ago
var getTimestampSecondsAgo = function (secondsToGoBack) { return Math.round(Date.now() / 1000) - secondsToGoBack; };
var testScore = function (excludeScore, authorScore) { return excludeScore === undefined || excludeScore <= (authorScore || 0); };
exports.testScore = testScore;
// firstCommentTimestamp value first needs to be put through Date.now() - firstCommentTimestamp
var testFirstCommentTimestamp = function (excludeTime, authorFirstCommentTimestamp) { return excludeTime === undefined || getTimestampSecondsAgo(excludeTime) >= (authorFirstCommentTimestamp || Infinity); };
exports.testFirstCommentTimestamp = testFirstCommentTimestamp;
var isVote = function (publication) { return Boolean(publication["vote"] !== undefined && publication["commentCid"]); };
exports.isVote = isVote;
var isReply = function (publication) { return Boolean(publication["parentCid"] && !publication["commentCid"]); };
exports.isReply = isReply;
var isPost = function (publication) { return Boolean(!publication["parentCid"] && !publication["commentCid"]); };
exports.isPost = isPost;
// boilerplate function to test if an exclude of a specific publication type passes
var testType = function (excludePublicationType, publication, isType) {
    if (excludePublicationType === undefined)
        return true;
    if (excludePublicationType === true) {
        if (isType(publication))
            return true;
        else
            return false;
    }
    if (excludePublicationType === false) {
        if (isType(publication))
            return false;
        else
            return true;
    }
    // excludePublicationType is invalid, return true
    return true;
};
var testVote = function (excludeVote, publication) { return testType(excludeVote, publication, isVote); };
exports.testVote = testVote;
var testReply = function (excludeReply, publication) { return testType(excludeReply, publication, isReply); };
exports.testReply = testReply;
var testPost = function (excludePost, publication) { return testType(excludePost, publication, isPost); };
exports.testPost = testPost;
var testRole = function (excludeRole, authorAddress, subplebbitRoles) {
    var _a;
    if (excludeRole === undefined || subplebbitRoles === undefined) {
        return true;
    }
    for (var _i = 0, excludeRole_1 = excludeRole; _i < excludeRole_1.length; _i++) {
        var roleName = excludeRole_1[_i];
        if (((_a = subplebbitRoles[authorAddress]) === null || _a === void 0 ? void 0 : _a.role) === roleName) {
            return true;
        }
    }
    return false;
};
exports.testRole = testRole;
//# sourceMappingURL=utils.js.map