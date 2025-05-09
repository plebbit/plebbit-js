import { expect } from "chai";
import {
    shouldExcludeChallengeCommentCids,
    shouldExcludePublication,
    shouldExcludeChallengeSuccess
} from "../../dist/node/runtime/node/subplebbit/challenges/exclude/index.js";
import { addToRateLimiter } from "../../dist/node/runtime/node/subplebbit/challenges/exclude/rate-limiter.js";
import * as remeda from "remeda";
import { Plebbit, authors } from "./fixtures/fixtures.js";
import validCommentEditFixture from "../fixtures/signatures/commentEdit/valid_comment_edit.json" with { type: "json" };
import validCommentFixture from "..//fixtures/signatures/comment/commentUpdate/valid_comment_ipfs.json" with { type: "json" };
import validVoteFixture from "../fixtures/valid_vote.json" with { type: "json" };

// sometimes use random addresses because the rate limiter
// is based on author addresses and doesn't reset between tests
const getRandomAddress = () => String(Math.random());

describe("shouldExcludePublication", () => {
    it("empty", () => {
        const publication = { author: { address: "Qm..." } };
        let subplebbitChallenge = { exclude: [] };
        expect(shouldExcludePublication(subplebbitChallenge, { comment: publication })).to.equal(false);
        subplebbitChallenge = { exclude: undefined };
        expect(shouldExcludePublication(subplebbitChallenge, { comment: publication })).to.equal(false);
    });

    it("postScore and replyScore", () => {
        const subplebbitChallenge = {
            exclude: [{ postScore: 100 }, { replyScore: 100 }]
        };
        const authorScoreUndefined = {
            author: { subplebbit: {} }
        };
        const authorSubplebbitUndefined = {
            author: {}
        };
        const authorPostScoreLow = {
            author: {
                subplebbit: {
                    postScore: 99
                }
            }
        };
        const authorPostScoreHigh = {
            author: {
                subplebbit: {
                    postScore: 100
                }
            }
        };
        const authorReplyScoreLow = {
            author: {
                subplebbit: {
                    replyScore: 99
                }
            }
        };
        const authorReplyScoreHigh = {
            author: {
                subplebbit: {
                    replyScore: 100
                }
            }
        };
        const authorReplyAndPostScoreHigh = {
            author: {
                subplebbit: {
                    postScore: 100,
                    replyScore: 100
                }
            }
        };
        const authorReplyAndPostScoreLow = {
            author: {
                subplebbit: {
                    postScore: 99,
                    replyScore: 99
                }
            }
        };
        expect(shouldExcludePublication(subplebbitChallenge, { comment: authorScoreUndefined })).to.equal(false);
        expect(shouldExcludePublication(subplebbitChallenge, { comment: authorSubplebbitUndefined })).to.equal(false);
        expect(shouldExcludePublication(subplebbitChallenge, { comment: authorPostScoreLow })).to.equal(false);
        expect(shouldExcludePublication(subplebbitChallenge, { comment: authorPostScoreHigh })).to.equal(true);
        expect(shouldExcludePublication(subplebbitChallenge, { comment: authorReplyScoreLow })).to.equal(false);
        expect(shouldExcludePublication(subplebbitChallenge, { comment: authorReplyScoreHigh }, authorReplyScoreHigh)).to.equal(true);
        expect(shouldExcludePublication(subplebbitChallenge, { comment: authorReplyAndPostScoreHigh })).to.equal(true);
        expect(shouldExcludePublication(subplebbitChallenge, { comment: authorReplyAndPostScoreLow })).to.equal(false);
    });

    it("firstCommentTimestamp", () => {
        const subplebbitChallenge = {
            exclude: [
                { firstCommentTimestamp: 60 * 60 * 24 * 100 } // 100 days
            ]
        };
        const oldAuthor = {
            author: {
                subplebbit: {
                    firstCommentTimestamp: Math.round(Date.now() / 1000) - 60 * 60 * 24 * 101 // 101 days
                }
            }
        };
        const newAuthor = {
            author: {
                subplebbit: {
                    firstCommentTimestamp: Math.round(Date.now() / 1000) - 60 * 60 * 24 * 99 // 99 days
                }
            }
        };
        expect(shouldExcludePublication(subplebbitChallenge, { comment: oldAuthor })).to.equal(true);
        expect(shouldExcludePublication(subplebbitChallenge, { comment: newAuthor })).to.equal(false);
    });

    it("firstCommentTimestamp and postScore", () => {
        const subplebbitChallenge = {
            exclude: [
                {
                    postScore: 100,
                    firstCommentTimestamp: 60 * 60 * 24 * 100 // 100 days
                }
            ]
        };
        const oldAuthor = {
            author: {
                subplebbit: {
                    postScore: 100,
                    firstCommentTimestamp: Math.round(Date.now() / 1000) - 60 * 60 * 24 * 101 // 101 days
                }
            }
        };
        const newAuthor = {
            author: {
                subplebbit: {
                    postScore: 99,
                    firstCommentTimestamp: Math.round(Date.now() / 1000) - 60 * 60 * 24 * 101 // 101 days
                }
            }
        };
        expect(shouldExcludePublication(subplebbitChallenge, { comment: oldAuthor })).to.equal(true);
        expect(shouldExcludePublication(subplebbitChallenge, { comment: newAuthor })).to.equal(false);
    });

    it("firstCommentTimestamp or (postScore and replyScore)", () => {
        const subplebbitChallenge = {
            exclude: [
                { postScore: 100, replyScore: 100 },
                { firstCommentTimestamp: 60 * 60 * 24 * 100 } // 100 days
            ]
        };
        const oldAuthor = {
            author: {
                subplebbit: {
                    firstCommentTimestamp: Math.round(Date.now() / 1000) - 60 * 60 * 24 * 101 // 101 days
                }
            }
        };
        const newAuthor = {
            author: {
                subplebbit: {
                    postScore: 101,
                    firstCommentTimestamp: Math.round(Date.now() / 1000) - 60 * 60 * 24 * 99 // 99 days
                }
            }
        };
        const popularAuthor = {
            author: {
                subplebbit: {
                    postScore: 100,
                    replyScore: 100
                }
            }
        };
        expect(shouldExcludePublication(subplebbitChallenge, { comment: oldAuthor })).to.equal(true);
        expect(shouldExcludePublication(subplebbitChallenge, { comment: newAuthor })).to.equal(false);
        expect(shouldExcludePublication(subplebbitChallenge, { comment: popularAuthor })).to.equal(true);
    });

    const author = { address: "Qm..." };
    const post = {
        content: "content",
        author
    };
    const reply = {
        content: "content",
        parentCid: "Qm...",
        author
    };
    const vote = {
        commentCid: "Qm...",
        vote: 0,
        author
    };
    const commentEdit = {
        commentCid: "Qm...",
        content: "edited content",
        author
    };
    const commentModeration = {
        commentCid: "Qm...",
        commentModeration: { locked: true },
        author
    };

    it("publicationType.post", () => {
        const subplebbitChallenge = {
            exclude: [{ publicationType: { post: true } }]
        };
        expect(shouldExcludePublication(subplebbitChallenge, { comment: post })).to.equal(true);
        expect(shouldExcludePublication(subplebbitChallenge, { comment: reply })).to.equal(false);
        expect(shouldExcludePublication(subplebbitChallenge, { vote })).to.equal(false);
    });

    it("publicationType.reply", () => {
        const subplebbitChallenge = {
            exclude: [{ publicationType: { reply: true } }]
        };
        expect(shouldExcludePublication(subplebbitChallenge, { comment: post })).to.equal(false);
        expect(shouldExcludePublication(subplebbitChallenge, { comment: reply })).to.equal(true);
        expect(shouldExcludePublication(subplebbitChallenge, { vote })).to.equal(false);
    });

    it("publicationType.vote", () => {
        const subplebbitChallenge = {
            exclude: [{ publicationType: { vote: true } }]
        };
        expect(shouldExcludePublication(subplebbitChallenge, { comment: post })).to.equal(false);
        expect(shouldExcludePublication(subplebbitChallenge, { comment: reply })).to.equal(false);
        expect(shouldExcludePublication(subplebbitChallenge, { vote })).to.equal(true);
    });

    it("publicationType.vote and publicationType.reply", () => {
        const subplebbitChallenge = {
            exclude: [{ publicationType: { vote: true, reply: true } }]
        };
        expect(shouldExcludePublication(subplebbitChallenge, { comment: post })).to.equal(false);
        expect(shouldExcludePublication(subplebbitChallenge, { comment: reply })).to.equal(true);
        expect(shouldExcludePublication(subplebbitChallenge, { vote })).to.equal(true);
    });

    it("publicationType.commentEdit", () => {
        const subplebbitChallenge = {
            exclude: [{ publicationType: { commentEdit: true } }]
        };
        expect(shouldExcludePublication(subplebbitChallenge, { comment: post })).to.equal(false);
        expect(shouldExcludePublication(subplebbitChallenge, { comment: reply })).to.equal(false);
        expect(shouldExcludePublication(subplebbitChallenge, { vote })).to.equal(false);
        expect(shouldExcludePublication(subplebbitChallenge, { commentEdit })).to.equal(true);
    });

    it("publicationType.commentModeration", () => {
        const subplebbitChallenge = {
            exclude: [{ publicationType: { commentModeration: true } }]
        };
        expect(shouldExcludePublication(subplebbitChallenge, { comment: post })).to.equal(false);
        expect(shouldExcludePublication(subplebbitChallenge, { comment: reply })).to.equal(false);
        expect(shouldExcludePublication(subplebbitChallenge, { vote })).to.equal(false);
        expect(shouldExcludePublication(subplebbitChallenge, { commentModeration })).to.equal(true);
    });

    // Exclude based on roles
    it("Moderator edits are excluded from challenges", async () => {
        const subplebbitChallenge = {
            exclude: [{ role: ["moderator", "admin", "owner"], publicationType: { commentModeration: true } }]
        };
        // high-karma.eth is a mod
        const modAuthor = { address: "high-karma.eth" };

        const commentEditOfMod = remeda.clone(validCommentEditFixture);
        commentEditOfMod.author = modAuthor;

        const postOfMod = remeda.clone(validCommentFixture);
        postOfMod.author = modAuthor;

        const replyOfMod = {
            ...postOfMod,
            parentCid: "Qm..."
        };
        const voteOfMod = remeda.clone(validVoteFixture);
        voteOfMod.author = modAuthor;

        expect(shouldExcludePublication(subplebbitChallenge, { commentModeration: commentEditOfMod })).to.equal(true);
        expect(shouldExcludePublication(subplebbitChallenge, { comment: postOfMod })).to.equal(false);
        expect(shouldExcludePublication(subplebbitChallenge, { comment: replyOfMod })).to.equal(false);
        expect(shouldExcludePublication(subplebbitChallenge, { vote: voteOfMod })).to.equal(false);
    });

    it("rateLimit", () => {
        const subplebbitChallenge = {
            exclude: [
                { rateLimit: 1 } // 1 publication per hour
            ]
        };
        const subplebbitChallenges = [subplebbitChallenge];
        const publicationAuthor1 = { author: { address: getRandomAddress() } };
        const publicationAuthor2 = { author: { address: getRandomAddress() } };
        const challengeSuccess = true;
        expect(shouldExcludePublication(subplebbitChallenge, { comment: publicationAuthor1 })).to.equal(true);
        addToRateLimiter(subplebbitChallenges, { comment: publicationAuthor1 }, challengeSuccess);
        expect(shouldExcludePublication(subplebbitChallenge, { comment: publicationAuthor1 })).to.equal(false);
        expect(shouldExcludePublication(subplebbitChallenge, { comment: publicationAuthor2 })).to.equal(true);
    });

    it("rateLimit and postScore", () => {
        const subplebbitChallenge = {
            exclude: [{ postScore: 100, rateLimit: 1 }]
        };
        const address = getRandomAddress();
        const authorScoreUndefined = {
            author: { address, subplebbit: {} }
        };
        const authorSubplebbitUndefined = {
            author: { address }
        };
        const authorPostScoreLow = {
            author: {
                address,
                subplebbit: {
                    postScore: 99
                }
            }
        };
        const authorPostScoreHigh = {
            author: {
                address,
                subplebbit: {
                    postScore: 100
                }
            }
        };
        expect(shouldExcludePublication(subplebbitChallenge, { comment: authorScoreUndefined })).to.equal(false);
        expect(shouldExcludePublication(subplebbitChallenge, { comment: authorSubplebbitUndefined })).to.equal(false);
        expect(shouldExcludePublication(subplebbitChallenge, { comment: authorPostScoreLow })).to.equal(false);
        expect(shouldExcludePublication(subplebbitChallenge, { comment: authorPostScoreHigh })).to.equal(true);

        // after rate limited
        const subplebbitChallenges = [subplebbitChallenge];
        const challengeSuccess = true;
        addToRateLimiter(subplebbitChallenges, { comment: authorPostScoreHigh }, challengeSuccess);
        expect(shouldExcludePublication(subplebbitChallenge, { comment: authorScoreUndefined })).to.equal(false);
        expect(shouldExcludePublication(subplebbitChallenge, { comment: authorSubplebbitUndefined })).to.equal(false);
        expect(shouldExcludePublication(subplebbitChallenge, { comment: authorPostScoreLow })).to.equal(false);
        expect(shouldExcludePublication(subplebbitChallenge, { comment: authorPostScoreHigh })).to.equal(false);
    });

    it("rateLimit challengeSuccess false", () => {
        const subplebbitChallenge = {
            exclude: [
                { rateLimit: 1 } // 1 publication per hour
            ]
        };
        const subplebbitChallenges = [subplebbitChallenge];
        const publicationAuthor1 = { author: { address: getRandomAddress() } };
        const publicationAuthor2 = { author: { address: getRandomAddress() } };
        const challengeSuccess = false;
        expect(shouldExcludePublication(subplebbitChallenge, { comment: publicationAuthor1 })).to.equal(true);
        addToRateLimiter(subplebbitChallenges, { comment: publicationAuthor1 }, challengeSuccess);
        // without rateLimitChallengeSuccess, rateLimit only applies to challengeSuccess true publications
        expect(shouldExcludePublication(subplebbitChallenge, { comment: publicationAuthor1 })).to.equal(true);
        expect(shouldExcludePublication(subplebbitChallenge, { comment: publicationAuthor2 })).to.equal(true);
    });

    it("rateLimit post, reply, vote", () => {
        const subplebbitChallenge = {
            exclude: [
                { publicationType: { post: true }, rateLimit: 1 }, // 1 per hour
                { publicationType: { reply: true }, rateLimit: 1 }, // 1 per hour
                { publicationType: { vote: true }, rateLimit: 1 } // 1 per hour
            ]
        };
        const subplebbitChallenges = [subplebbitChallenge];
        const author = { address: getRandomAddress() };
        const publicationPost = { author };
        const publicationReply = { author, parentCid: "Qm..." };
        const publicationVote = { author, commentCid: "Qm...", vote: 0 };
        let challengeSuccess = true;
        expect(shouldExcludePublication(subplebbitChallenge, { comment: publicationPost })).to.equal(true);
        expect(shouldExcludePublication(subplebbitChallenge, { comment: publicationReply })).to.equal(true);
        expect(shouldExcludePublication(subplebbitChallenge, { vote: publicationVote })).to.equal(true);
        addToRateLimiter(subplebbitChallenges, { comment: publicationPost }, challengeSuccess);
        expect(shouldExcludePublication(subplebbitChallenge, { comment: publicationPost })).to.equal(false);
        expect(shouldExcludePublication(subplebbitChallenge, { comment: publicationReply })).to.equal(true);
        expect(shouldExcludePublication(subplebbitChallenge, { vote: publicationVote })).to.equal(true);
        addToRateLimiter(subplebbitChallenges, { comment: publicationReply }, challengeSuccess);
        expect(shouldExcludePublication(subplebbitChallenge, { comment: publicationPost })).to.equal(false);
        expect(shouldExcludePublication(subplebbitChallenge, { comment: publicationReply })).to.equal(false);
        expect(shouldExcludePublication(subplebbitChallenge, { vote: publicationVote })).to.equal(true);

        // publish with challengeSuccess false, should do nothing
        challengeSuccess = false;
        addToRateLimiter(subplebbitChallenges, { vote: publicationVote }, challengeSuccess);
        expect(shouldExcludePublication(subplebbitChallenge, { comment: publicationPost })).to.equal(false);
        expect(shouldExcludePublication(subplebbitChallenge, { comment: publicationReply })).to.equal(false);
        expect(shouldExcludePublication(subplebbitChallenge, { vote: publicationVote })).to.equal(true);

        // publish with challengeSuccess true, should rate limit
        challengeSuccess = true;
        addToRateLimiter(subplebbitChallenges, { vote: publicationVote }, challengeSuccess);
        expect(shouldExcludePublication(subplebbitChallenge, { comment: publicationPost })).to.equal(false);
        expect(shouldExcludePublication(subplebbitChallenge, { comment: publicationReply })).to.equal(false);
        expect(shouldExcludePublication(subplebbitChallenge, { vote: publicationVote })).to.equal(false);
    });

    it("rateLimit rateLimitChallengeSuccess true", () => {
        const subplebbitChallenge = {
            exclude: [
                { rateLimit: 1, rateLimitChallengeSuccess: true } // 1 publication per hour
            ]
        };
        const subplebbitChallenges = [subplebbitChallenge];
        const publicationAuthor1 = { author: { address: getRandomAddress() } };
        const publicationAuthor2 = { author: { address: getRandomAddress() } };
        const challengeSuccess = true;
        expect(shouldExcludePublication(subplebbitChallenge, { comment: publicationAuthor1 })).to.equal(true);
        addToRateLimiter(subplebbitChallenges, { comment: publicationAuthor1 }, challengeSuccess);
        expect(shouldExcludePublication(subplebbitChallenge, { comment: publicationAuthor1 })).to.equal(false);
        expect(shouldExcludePublication(subplebbitChallenge, { comment: publicationAuthor2 })).to.equal(true);
    });

    it("rateLimit rateLimitChallengeSuccess true challengeSuccess false", () => {
        const subplebbitChallenge = {
            exclude: [
                { rateLimit: 1, rateLimitChallengeSuccess: true } // 1 publication per hour
            ]
        };
        const subplebbitChallenges = [subplebbitChallenge];
        const publicationAuthor1 = { author: { address: getRandomAddress() } };
        const publicationAuthor2 = { author: { address: getRandomAddress() } };
        const challengeSuccess = false;
        expect(shouldExcludePublication(subplebbitChallenge, { comment: publicationAuthor1 })).to.equal(true);
        addToRateLimiter(subplebbitChallenges, { comment: publicationAuthor1 }, challengeSuccess);
        expect(shouldExcludePublication(subplebbitChallenge, { comment: publicationAuthor1 })).to.equal(true);
        expect(shouldExcludePublication(subplebbitChallenge, { comment: publicationAuthor2 })).to.equal(true);
    });

    it("rateLimit rateLimitChallengeSuccess false challengeSuccess true", () => {
        const subplebbitChallenge = {
            exclude: [
                { rateLimit: 1, rateLimitChallengeSuccess: false } // 1 publication per hour
            ]
        };
        const subplebbitChallenges = [subplebbitChallenge];
        const publicationAuthor1 = { author: { address: getRandomAddress() } };
        const publicationAuthor2 = { author: { address: getRandomAddress() } };
        const challengeSuccess = true;
        expect(shouldExcludePublication(subplebbitChallenge, { comment: publicationAuthor1 })).to.equal(true);
        addToRateLimiter(subplebbitChallenges, { comment: publicationAuthor1 }, challengeSuccess);
        expect(shouldExcludePublication(subplebbitChallenge, { comment: publicationAuthor1 })).to.equal(true);
        expect(shouldExcludePublication(subplebbitChallenge, { comment: publicationAuthor2 })).to.equal(true);
    });

    it("rateLimit rateLimitChallengeSuccess false challengeSuccess false", () => {
        const subplebbitChallenge = {
            exclude: [
                { rateLimit: 1, rateLimitChallengeSuccess: false } // 1 publication per hour
            ]
        };
        const subplebbitChallenges = [subplebbitChallenge];
        const publicationAuthor1 = { author: { address: getRandomAddress() } };
        const publicationAuthor2 = { author: { address: getRandomAddress() } };
        const challengeSuccess = false;
        expect(shouldExcludePublication(subplebbitChallenge, { comment: publicationAuthor1 })).to.equal(true);
        addToRateLimiter(subplebbitChallenges, { comment: publicationAuthor1 }, challengeSuccess);
        expect(shouldExcludePublication(subplebbitChallenge, { comment: publicationAuthor1 })).to.equal(false);
        expect(shouldExcludePublication(subplebbitChallenge, { comment: publicationAuthor2 })).to.equal(true);
    });

    it("rateLimit post, reply rateLimitChallengeSuccess false", () => {
        const subplebbitChallenge = {
            exclude: [
                { publicationType: { post: true }, rateLimit: 1, rateLimitChallengeSuccess: false }, // 1 per hour
                { publicationType: { reply: true }, rateLimit: 1 } // 1 per hour
            ]
        };
        const subplebbitChallenges = [subplebbitChallenge];
        const author = { address: getRandomAddress() };
        const publicationPost = { author };
        const publicationReply = { author, parentCid: "Qm..." };
        const publicationVote = { author, commentCid: "Qm...", vote: 0 };
        let challengeSuccess = true;

        expect(shouldExcludePublication(subplebbitChallenge, { comment: publicationPost })).to.equal(true);
        expect(shouldExcludePublication(subplebbitChallenge, { comment: publicationReply })).to.equal(true);
        // vote can never pass because it's not included in any of the excludes
        expect(shouldExcludePublication(subplebbitChallenge, { vote: publicationVote })).to.equal(false);

        // no effect because post true and rateLimitChallengeSuccess false
        addToRateLimiter(subplebbitChallenges, { comment: publicationPost }, challengeSuccess);
        expect(shouldExcludePublication(subplebbitChallenge, { comment: publicationPost })).to.equal(true);
        expect(shouldExcludePublication(subplebbitChallenge, { comment: publicationReply })).to.equal(true);
        expect(shouldExcludePublication(subplebbitChallenge, { vote: publicationVote })).to.equal(false);

        // now has effect because success false
        challengeSuccess = false;
        addToRateLimiter(subplebbitChallenges, { comment: publicationPost }, challengeSuccess);
        expect(shouldExcludePublication(subplebbitChallenge, { comment: publicationPost })).to.equal(false);
        expect(shouldExcludePublication(subplebbitChallenge, { comment: publicationReply })).to.equal(true);
        expect(shouldExcludePublication(subplebbitChallenge, { vote: publicationVote })).to.equal(false);

        // no effect because reply true, challengeSuccess false and rateLimitChallengeSuccess undefined
        addToRateLimiter(subplebbitChallenges, { comment: publicationReply }, challengeSuccess);
        expect(shouldExcludePublication(subplebbitChallenge, { comment: publicationPost })).to.equal(false);
        expect(shouldExcludePublication(subplebbitChallenge, { comment: publicationReply })).to.equal(true);
        expect(shouldExcludePublication(subplebbitChallenge, { vote: publicationVote })).to.equal(false);

        // now has effect because success true
        challengeSuccess = true;
        addToRateLimiter(subplebbitChallenges, { comment: publicationReply }, challengeSuccess);
        expect(shouldExcludePublication(subplebbitChallenge, { comment: publicationPost })).to.equal(false);
        expect(shouldExcludePublication(subplebbitChallenge, { comment: publicationReply })).to.equal(false);
        expect(shouldExcludePublication(subplebbitChallenge, { vote: publicationVote })).to.equal(false);
    });
});

describe("shouldExcludeChallengeSuccess", () => {
    it("exclude 0, 1", () => {
        const subplebbitChallenge = {
            exclude: [{ challenges: [0, 1] }]
        };
        const challengeResultsSucceed2 = [{ success: true }, { success: true }, { success: false }];
        const challengeResultsSucceed3 = [{ success: true }, { success: true }, { success: true }];
        const challengeResultsFail1 = [{ success: true }, { success: false }];
        const challengeResultsFail2 = [{ success: false }, { success: false }];
        const challengeResultsEmpty = [];
        const challengeResultsMixed = [{ success: true }, { success: false }, { success: true }, { success: false }];
        expect(shouldExcludeChallengeSuccess(subplebbitChallenge, challengeResultsSucceed2)).to.equal(true);
        expect(shouldExcludeChallengeSuccess(subplebbitChallenge, challengeResultsSucceed3)).to.equal(true);
        expect(shouldExcludeChallengeSuccess(subplebbitChallenge, challengeResultsFail1)).to.equal(false);
        expect(shouldExcludeChallengeSuccess(subplebbitChallenge, challengeResultsFail2)).to.equal(false);
        expect(shouldExcludeChallengeSuccess(subplebbitChallenge, challengeResultsEmpty)).to.equal(false);
        expect(shouldExcludeChallengeSuccess(subplebbitChallenge, challengeResultsMixed)).to.equal(false);
    });

    it("exclude (0, 1) or 2", () => {
        const subplebbitChallenge = {
            exclude: [{ challenges: [0, 1] }, { challenges: [2] }]
        };
        const challengeResultsSucceed12 = [{ success: true }, { success: true }, { success: false }];
        const challengeResultsSucceed123 = [{ success: true }, { success: true }, { success: true }];
        const challengeResultsSucceed3 = [{ success: false }, { success: false }, { success: true }];
        const challengeResultsSucceed4 = [{ success: false }, { success: false }, { success: false }, { success: true }];
        const challengeResultsEmpty = [];
        expect(shouldExcludeChallengeSuccess(subplebbitChallenge, challengeResultsSucceed12)).to.equal(true);
        expect(shouldExcludeChallengeSuccess(subplebbitChallenge, challengeResultsSucceed123)).to.equal(true);
        expect(shouldExcludeChallengeSuccess(subplebbitChallenge, challengeResultsSucceed3)).to.equal(true);
        expect(shouldExcludeChallengeSuccess(subplebbitChallenge, challengeResultsSucceed4)).to.equal(false);
        expect(shouldExcludeChallengeSuccess(subplebbitChallenge, challengeResultsEmpty)).to.equal(false);
    });
});

describe("shouldExcludeChallengeCommentCids", () => {
    const getChallengeRequestMessage = (commentCids) => {
        // define author based on high or low karma
        const author = { address: "Qm..." };
        const [subplebbitAddress, karma, age] = (commentCids?.[0] || "").replace("Qm...", "").split(",");
        if (karma === "high") {
            author.address = authors[0].address;
        } else if (karma === "low") {
            author.address = authors[1].address;
        }
        return {
            comment: { author },
            challengeCommentCids: commentCids
        };
    };

    let plebbit;
    before(async () => {
        plebbit = await Plebbit();
    });

    it("firstCommentTimestamp", async () => {
        const subplebbitChallenge = {
            exclude: [
                {
                    subplebbit: {
                        addresses: ["friendly-sub.eth"],
                        firstCommentTimestamp: 60 * 60 * 24 * 100, // 100 days
                        maxCommentCids: 2
                    }
                }
            ]
        };

        const commentCidsOld = getChallengeRequestMessage(["Qm...friendly-sub.eth,high,old", "Qm...friendly-sub.eth,high,old"]);
        const commentCidsNew = getChallengeRequestMessage(["Qm...friendly-sub.eth,high,new", "Qm...friendly-sub.eth,high,new"]);
        const commentCidsNoAuthorSubplebbit = getChallengeRequestMessage(["Qm...friendly-sub.eth", "Qm...friendly-sub.eth"]);
        const commentCidsEmpty = getChallengeRequestMessage([]);
        const commentCidsUndefined = getChallengeRequestMessage(undefined);
        const commentCidsWrongSubplebbitAddress = getChallengeRequestMessage(["Qm...wrong.eth,high,old", "Qm...wrong.eth,high,old"]);
        const commentCidsMoreThanMax = getChallengeRequestMessage([
            "Qm...friendly-sub.eth,high,new",
            "Qm...friendly-sub.eth,high,new",
            "Qm...friendly-sub.eth,high,old"
        ]);

        expect(await shouldExcludeChallengeCommentCids(subplebbitChallenge, commentCidsOld, plebbit)).to.equal(true);
        expect(await shouldExcludeChallengeCommentCids(subplebbitChallenge, commentCidsNew, plebbit)).to.equal(false);
        expect(await shouldExcludeChallengeCommentCids(subplebbitChallenge, commentCidsNoAuthorSubplebbit, plebbit)).to.equal(false);
        expect(await shouldExcludeChallengeCommentCids(subplebbitChallenge, commentCidsEmpty, plebbit)).to.equal(false);
        expect(await shouldExcludeChallengeCommentCids(subplebbitChallenge, commentCidsUndefined, plebbit)).to.equal(false);
        expect(await shouldExcludeChallengeCommentCids(subplebbitChallenge, commentCidsWrongSubplebbitAddress, plebbit)).to.equal(false);
        expect(await shouldExcludeChallengeCommentCids(subplebbitChallenge, commentCidsMoreThanMax, plebbit)).to.equal(false);
    });

    it("firstCommentTimestamp and postScore", async () => {
        const subplebbitChallenge = {
            exclude: [
                {
                    subplebbit: {
                        addresses: ["friendly-sub.eth"],
                        postScore: 100,
                        firstCommentTimestamp: 60 * 60 * 24 * 100, // 100 days
                        maxCommentCids: 2
                    }
                }
            ]
        };
        const commentCidsHighKarma = getChallengeRequestMessage(["Qm...friendly-sub.eth,high", "Qm...friendly-sub.eth,high"]);
        const commentCidsHighKarmaOld = getChallengeRequestMessage(["Qm...friendly-sub.eth,high,old", "Qm...friendly-sub.eth,high"]);
        const commentCidsHighKarmaNew = getChallengeRequestMessage(["Qm...friendly-sub.eth,high,new", "Qm...friendly-sub.eth,high"]);
        const commentCidsLowKarmaOld = getChallengeRequestMessage(["Qm...friendly-sub.eth,low,old", "Qm...friendly-sub.eth,low,old"]);
        const commentCidsNoAuthorSubplebbit = getChallengeRequestMessage(["Qm...friendly-sub.eth", "Qm...friendly-sub.eth"]);
        const commentCidsEmpty = getChallengeRequestMessage([]);
        const commentCidsWrongSubplebbitAddress = getChallengeRequestMessage(["Qm...wrong.eth,high", "Qm...wrong.eth,high"]);
        const commentCidsMoreThanMax = getChallengeRequestMessage([
            "Qm...friendly-sub.eth,low",
            "Qm...friendly-sub.eth,low",
            "Qm...friendly-sub.eth,high"
        ]);

        expect(await shouldExcludeChallengeCommentCids(subplebbitChallenge, commentCidsHighKarma, plebbit)).to.equal(false);
        expect(await shouldExcludeChallengeCommentCids(subplebbitChallenge, commentCidsHighKarmaOld, plebbit)).to.equal(true);
        expect(await shouldExcludeChallengeCommentCids(subplebbitChallenge, commentCidsHighKarmaNew, plebbit)).to.equal(false);
        expect(await shouldExcludeChallengeCommentCids(subplebbitChallenge, commentCidsLowKarmaOld, plebbit)).to.equal(false);
        expect(await shouldExcludeChallengeCommentCids(subplebbitChallenge, commentCidsNoAuthorSubplebbit, plebbit)).to.equal(false);
        expect(await shouldExcludeChallengeCommentCids(subplebbitChallenge, commentCidsEmpty, plebbit)).to.equal(false);
        expect(await shouldExcludeChallengeCommentCids(subplebbitChallenge, commentCidsWrongSubplebbitAddress, plebbit)).to.equal(false);
        expect(await shouldExcludeChallengeCommentCids(subplebbitChallenge, commentCidsMoreThanMax, plebbit)).to.equal(false);
    });

    it("firstCommentTimestamp or (postScore and replyScore)", async () => {
        const subplebbitChallenge = {
            exclude: [
                {
                    subplebbit: {
                        addresses: ["friendly-sub.eth"],
                        firstCommentTimestamp: 60 * 60 * 24 * 100, // 100 days
                        maxCommentCids: 2
                    }
                },
                {
                    subplebbit: {
                        addresses: ["friendly-sub.eth"],
                        replyScore: 100,
                        postScore: 100,
                        maxCommentCids: 2
                    }
                }
            ]
        };
        const commentCidsHighKarma = getChallengeRequestMessage(["Qm...friendly-sub.eth,high", "Qm...friendly-sub.eth,high"]);
        const commentCidsHighKarmaOld = getChallengeRequestMessage(["Qm...friendly-sub.eth,high,old", "Qm...friendly-sub.eth,high"]);
        const commentCidsHighKarmaNew = getChallengeRequestMessage(["Qm...friendly-sub.eth,high,new", "Qm...friendly-sub.eth,high"]);
        const commentCidsLowKarmaOld = getChallengeRequestMessage(["Qm...friendly-sub.eth,low,old", "Qm...friendly-sub.eth,low,old"]);
        const commentCidsLowKarmaNew = getChallengeRequestMessage(["Qm...friendly-sub.eth,low,new", "Qm...friendly-sub.eth,low,new"]);
        const commentCidsNoAuthorSubplebbit = getChallengeRequestMessage(["Qm...friendly-sub.eth", "Qm...friendly-sub.eth"]);
        const commentCidsEmpty = getChallengeRequestMessage([]);
        const commentCidsWrongSubplebbitAddress = getChallengeRequestMessage(["Qm...wrong.eth,high", "Qm...wrong.eth,high"]);
        const commentCidsMoreThanMax = getChallengeRequestMessage([
            "Qm...friendly-sub.eth,low",
            "Qm...friendly-sub.eth,low",
            "Qm...friendly-sub.eth,high"
        ]);

        expect(await shouldExcludeChallengeCommentCids(subplebbitChallenge, commentCidsHighKarma, plebbit)).to.equal(true);
        expect(await shouldExcludeChallengeCommentCids(subplebbitChallenge, commentCidsHighKarmaOld, plebbit)).to.equal(true);
        expect(await shouldExcludeChallengeCommentCids(subplebbitChallenge, commentCidsHighKarmaNew, plebbit)).to.equal(true);
        expect(await shouldExcludeChallengeCommentCids(subplebbitChallenge, commentCidsLowKarmaOld, plebbit)).to.equal(true);
        expect(await shouldExcludeChallengeCommentCids(subplebbitChallenge, commentCidsLowKarmaNew, plebbit)).to.equal(false);
        expect(await shouldExcludeChallengeCommentCids(subplebbitChallenge, commentCidsNoAuthorSubplebbit, plebbit)).to.equal(false);
        expect(await shouldExcludeChallengeCommentCids(subplebbitChallenge, commentCidsEmpty, plebbit)).to.equal(false);
        expect(await shouldExcludeChallengeCommentCids(subplebbitChallenge, commentCidsWrongSubplebbitAddress, plebbit)).to.equal(false);
        expect(await shouldExcludeChallengeCommentCids(subplebbitChallenge, commentCidsMoreThanMax, plebbit)).to.equal(false);
    });
});
