import { expect } from "chai";
import { testRateLimit, addToRateLimiter } from "../../dist/node/runtime/node/subplebbit/challenges/exclude/rate-limiter.js";
// sometimes use random addresses because the rate limiter
// is based on author addresses and doesn't reset between tests
const getRandomAddress = () => String(Math.random());

describe("testRateLimit", () => {
    // util function to create the argument of addToRateLimiter from an
    const createSubplebbitChallenges = (excludeArray) => {
        return [
            {
                exclude: excludeArray
            }
        ];
    };

    it("1 any publication type", async () => {
        const author1 = { address: getRandomAddress() };
        const author2 = { address: getRandomAddress() };
        const exclude = { rateLimit: 1 };
        const subplebbitChallenges = [{ exclude: [exclude] }];
        const publication1 = { author: author1 };
        const publication2 = { author: author2 };
        const challengeSuccess = true;
        expect(testRateLimit(exclude, { comment: publication1 })).to.equal(true);
        addToRateLimiter(subplebbitChallenges, { comment: publication1 }, challengeSuccess);
        expect(testRateLimit(exclude, { comment: publication1 })).to.equal(false);
        expect(testRateLimit(exclude, { comment: publication2 })).to.equal(true);
    });

    it("1 any publication type challengeSuccess false", async () => {
        const author1 = { address: getRandomAddress() };
        const author2 = { address: getRandomAddress() };
        const exclude = { rateLimit: 1 };
        const subplebbitChallenges = [{ exclude: [exclude] }];
        const publication1 = { author: author1 };
        const publication2 = { author: author2 };
        const challengeSuccess = false;
        expect(testRateLimit(exclude, { comment: publication1 })).to.equal(true);
        addToRateLimiter(subplebbitChallenges, { comment: publication1 }, challengeSuccess);
        // without rateLimitChallengeSuccess set, only successful publications are rate limited
        expect(testRateLimit(exclude, { comment: publication1 })).to.equal(true);
        expect(testRateLimit(exclude, { comment: publication2 })).to.equal(true);
    });

    it("10 any publication type", async () => {
        const exclude = { rateLimit: 10 };
        const subplebbitChallenges = [{ exclude: [exclude] }];
        const publication = { author: { address: getRandomAddress() } };
        const challengeSuccess = true;
        expect(testRateLimit(exclude, { comment: publication })).to.equal(true);
        let count = 20;
        while (count--) {
            addToRateLimiter(subplebbitChallenges, { comment: publication }, challengeSuccess);
        }
        expect(testRateLimit(exclude, { comment: publication })).to.equal(false);
    });

    it("1 publicationType.post true", async () => {
        const author = { address: getRandomAddress() };
        const exclude = { rateLimit: 1, publicationType: { post: true } };
        const subplebbitChallenges = [{ exclude: [exclude] }];
        const publicationPost = { author };
        const publicationReply = { author, parentCid: "Qm..." };
        const publicationVote = { author, commentCid: "Qm...", vote: 0 };
        const publicationCommentEdit = { author, commentCid: "Qm...", content: "edited content" };
        const publicationCommentModeration = { author, commentCid: "Qm...", commentModeration: { locked: true } };
        const publicationSubplebbitEdit = { author, subplebbitAddress: "Qm...", subplebbitEdit: { title: "New Title" } };

        const challengeSuccess = true;
        expect(testRateLimit(exclude, { comment: publicationPost })).to.equal(true);
        expect(testRateLimit(exclude, { comment: publicationReply })).to.equal(true);
        expect(testRateLimit(exclude, { vote: publicationVote })).to.equal(true);
        addToRateLimiter(subplebbitChallenges, { comment: publicationPost }, challengeSuccess);
        expect(testRateLimit(exclude, { comment: publicationPost })).to.equal(false);
        expect(testRateLimit(exclude, { comment: publicationReply })).to.equal(true);
        expect(testRateLimit(exclude, { vote: publicationVote })).to.equal(true);
        addToRateLimiter(subplebbitChallenges, { comment: publicationReply }, challengeSuccess);
        expect(testRateLimit(exclude, { comment: publicationPost })).to.equal(false);
        expect(testRateLimit(exclude, { comment: publicationReply })).to.equal(true);
        expect(testRateLimit(exclude, { vote: publicationVote })).to.equal(true);
        addToRateLimiter(subplebbitChallenges, { vote: publicationVote }, challengeSuccess);
        expect(testRateLimit(exclude, { comment: publicationPost })).to.equal(false);
        expect(testRateLimit(exclude, { comment: publicationReply })).to.equal(true);
        expect(testRateLimit(exclude, { vote: publicationVote })).to.equal(true);
        expect(testRateLimit(exclude, { commentEdit: publicationCommentEdit })).to.equal(true);
        expect(testRateLimit(exclude, { commentModeration: publicationCommentModeration })).to.equal(true);
        expect(testRateLimit(exclude, { subplebbitEdit: publicationSubplebbitEdit })).to.equal(true);
    });

    it("1 publicationType.commentEdit true", async () => {
        const author = { address: getRandomAddress() };
        const exclude = { rateLimit: 1, publicationType: { commentEdit: true } };
        const subplebbitChallenges = [{ exclude: [exclude] }];
        const publicationCommentEdit = { author, commentCid: "Qm...", content: "edited content" };
        const publicationReply = { author, parentCid: "Qm..." };
        const publicationVote = { author, commentCid: "Qm...", vote: 0 };
        const challengeSuccess = true;
        expect(testRateLimit(exclude, { commentEdit: publicationCommentEdit })).to.equal(true);
        expect(testRateLimit(exclude, { comment: publicationReply })).to.equal(true);
        expect(testRateLimit(exclude, { vote: publicationVote })).to.equal(true);
        addToRateLimiter(subplebbitChallenges, { commentEdit: publicationCommentEdit }, challengeSuccess);
        expect(testRateLimit(exclude, { commentEdit: publicationCommentEdit })).to.equal(false);
        expect(testRateLimit(exclude, { comment: publicationReply })).to.equal(true);
        expect(testRateLimit(exclude, { vote: publicationVote })).to.equal(true);
        addToRateLimiter(subplebbitChallenges, { comment: publicationReply }, challengeSuccess);
        expect(testRateLimit(exclude, { commentEdit: publicationCommentEdit })).to.equal(false);
        expect(testRateLimit(exclude, { comment: publicationReply })).to.equal(true);
        expect(testRateLimit(exclude, { vote: publicationVote })).to.equal(true);
        addToRateLimiter(subplebbitChallenges, { vote: publicationVote }, challengeSuccess);
        expect(testRateLimit(exclude, { commentEdit: publicationCommentEdit })).to.equal(false);
        expect(testRateLimit(exclude, { comment: publicationReply })).to.equal(true);
        expect(testRateLimit(exclude, { vote: publicationVote })).to.equal(true);
    });

    it("1 publicationType.commentModeration true", async () => {
        const author = { address: getRandomAddress() };
        const exclude = { rateLimit: 1, publicationType: { commentModeration: true } };
        const subplebbitChallenges = [{ exclude: [exclude] }];
        const publicationCommentModeration = { author, commentCid: "Qm...", commentModeration: { locked: true } };
        const publicationReply = { author, parentCid: "Qm..." };
        const publicationVote = { author, commentCid: "Qm...", vote: 0 };
        const challengeSuccess = true;
        expect(testRateLimit(exclude, { commentModeration: publicationCommentModeration })).to.equal(true);
        expect(testRateLimit(exclude, { comment: publicationReply })).to.equal(true);
        expect(testRateLimit(exclude, { vote: publicationVote })).to.equal(true);
        addToRateLimiter(subplebbitChallenges, { commentModeration: publicationCommentModeration }, challengeSuccess);
        expect(testRateLimit(exclude, { commentModeration: publicationCommentModeration })).to.equal(false);
        expect(testRateLimit(exclude, { comment: publicationReply })).to.equal(true);
        expect(testRateLimit(exclude, { vote: publicationVote })).to.equal(true);
        addToRateLimiter(subplebbitChallenges, { comment: publicationReply }, challengeSuccess);
        expect(testRateLimit(exclude, { commentModeration: publicationCommentModeration })).to.equal(false);
        expect(testRateLimit(exclude, { comment: publicationReply })).to.equal(true);
        expect(testRateLimit(exclude, { vote: publicationVote })).to.equal(true);
        addToRateLimiter(subplebbitChallenges, { vote: publicationVote }, challengeSuccess);
        expect(testRateLimit(exclude, { commentModeration: publicationCommentModeration })).to.equal(false);
        expect(testRateLimit(exclude, { comment: publicationReply })).to.equal(true);
        expect(testRateLimit(exclude, { vote: publicationVote })).to.equal(true);
    });

    it("1 publicationType.subplebbitEdit true", async () => {
        const author = { address: getRandomAddress() };
        const exclude = { rateLimit: 1, publicationType: { subplebbitEdit: true } };
        const subplebbitChallenges = [{ exclude: [exclude] }];
        const publicationSubplebbitEdit = { author, subplebbitAddress: "Qm...", subplebbitEdit: { title: "New Title" } };
        const publicationReply = { author, parentCid: "Qm..." };
        const publicationVote = { author, commentCid: "Qm...", vote: 0 };
        const challengeSuccess = true;
        expect(testRateLimit(exclude, { subplebbitEdit: publicationSubplebbitEdit })).to.equal(true);
        expect(testRateLimit(exclude, { comment: publicationReply })).to.equal(true);
        expect(testRateLimit(exclude, { vote: publicationVote })).to.equal(true);
        addToRateLimiter(subplebbitChallenges, { subplebbitEdit: publicationSubplebbitEdit }, challengeSuccess);
        expect(testRateLimit(exclude, { subplebbitEdit: publicationSubplebbitEdit })).to.equal(false);
        expect(testRateLimit(exclude, { comment: publicationReply })).to.equal(true);
        expect(testRateLimit(exclude, { vote: publicationVote })).to.equal(true);
        addToRateLimiter(subplebbitChallenges, { comment: publicationReply }, challengeSuccess);
        expect(testRateLimit(exclude, { subplebbitEdit: publicationSubplebbitEdit })).to.equal(false);
        expect(testRateLimit(exclude, { comment: publicationReply })).to.equal(true);
        expect(testRateLimit(exclude, { vote: publicationVote })).to.equal(true);
        addToRateLimiter(subplebbitChallenges, { vote: publicationVote }, challengeSuccess);
        expect(testRateLimit(exclude, { subplebbitEdit: publicationSubplebbitEdit })).to.equal(false);
        expect(testRateLimit(exclude, { comment: publicationReply })).to.equal(true);
        expect(testRateLimit(exclude, { vote: publicationVote })).to.equal(true);
    });

    it("1 publicationType.post true challengeSuccess false", async () => {
        const author = { address: getRandomAddress() };
        const exclude = { rateLimit: 1, publicationType: { post: true } };
        const subplebbitChallenges = [{ exclude: [exclude] }];
        const publicationPost = { author };
        const publicationReply = { author, parentCid: "Qm..." };
        const publicationVote = { author, commentCid: "Qm...", vote: 0 };
        const challengeSuccess = false;
        expect(testRateLimit(exclude, { comment: publicationPost })).to.equal(true);
        expect(testRateLimit(exclude, { comment: publicationReply })).to.equal(true);
        expect(testRateLimit(exclude, { vote: publicationVote })).to.equal(true);
        addToRateLimiter(subplebbitChallenges, { comment: publicationPost }, challengeSuccess);
        // without rateLimitChallengeSuccess set, only successful publications are rate limited
        expect(testRateLimit(exclude, { comment: publicationPost })).to.equal(true);
        expect(testRateLimit(exclude, { comment: publicationReply })).to.equal(true);
        expect(testRateLimit(exclude, { vote: publicationVote })).to.equal(true);
    });

    it("1 publicationType.post false", async () => {
        const author = { address: getRandomAddress() };
        // publicationType was changed to use OR algo, so not possible to use {post: false}, must set all to true except post
        const exclude = {
            rateLimit: 1,
            publicationType: { reply: true, vote: true, commentEdit: true, commentModeration: true, subplebbitEdit: true }
        };
        const subplebbitChallenges = [{ exclude: [exclude] }];
        const publicationPost = { author };
        const publicationReply = { author, parentCid: "Qm..." };
        const publicationVote = { author, commentCid: "Qm...", vote: 0 };
        const challengeSuccess = true;
        expect(testRateLimit(exclude, { comment: publicationPost })).to.equal(true);
        expect(testRateLimit(exclude, { comment: publicationReply })).to.equal(true);
        expect(testRateLimit(exclude, { vote: publicationVote })).to.equal(true);
        addToRateLimiter(subplebbitChallenges, { comment: publicationPost }, challengeSuccess);
        expect(testRateLimit(exclude, { comment: publicationPost })).to.equal(true);
        expect(testRateLimit(exclude, { comment: publicationReply })).to.equal(true);
        expect(testRateLimit(exclude, { vote: publicationVote })).to.equal(true);
        addToRateLimiter(subplebbitChallenges, { comment: publicationReply }, challengeSuccess);
        addToRateLimiter(subplebbitChallenges, { vote: publicationVote }, challengeSuccess);
        expect(testRateLimit(exclude, { comment: publicationPost })).to.equal(true);
        expect(testRateLimit(exclude, { comment: publicationReply })).to.equal(false);
        expect(testRateLimit(exclude, { vote: publicationVote })).to.equal(false);
    });

    it("1 publicationType.post and publicationType.reply false", async () => {
        const author = { address: getRandomAddress() };
        // publicationType was changed to use OR algo, so not possible to use {post: false, reply: false}, must set all to true except post, reply
        const exclude = { rateLimit: 1, publicationType: { vote: true, commentEdit: true, commentModeration: true, subplebbitEdit: true } };
        const subplebbitChallenges = [{ exclude: [exclude] }];
        const publicationPost = { author };
        const publicationReply = { author, parentCid: "Qm..." };
        const publicationVote = { author, commentCid: "Qm...", vote: 0 };
        const challengeSuccess = true;
        expect(testRateLimit(exclude, { comment: publicationPost })).to.equal(true);
        expect(testRateLimit(exclude, { comment: publicationReply })).to.equal(true);
        expect(testRateLimit(exclude, { vote: publicationVote })).to.equal(true);
        addToRateLimiter(subplebbitChallenges, { comment: publicationPost }, challengeSuccess);
        addToRateLimiter(subplebbitChallenges, { comment: publicationReply }, challengeSuccess);
        addToRateLimiter(subplebbitChallenges, { vote: publicationVote }, challengeSuccess);
        expect(testRateLimit(exclude, { comment: publicationPost })).to.equal(true);
        expect(testRateLimit(exclude, { comment: publicationReply })).to.equal(true);
        expect(testRateLimit(exclude, { vote: publicationVote })).to.equal(false);
    });

    it("1 any publication type rateLimitChallengeSuccess true", async () => {
        const author1 = { address: getRandomAddress() };
        const author2 = { address: getRandomAddress() };
        const exclude = { rateLimit: 1, rateLimitChallengeSuccess: true };
        const subplebbitChallenges = [{ exclude: [exclude] }];
        const publication1 = { author: author1 };
        const publication2 = { author: author2 };
        const challengeSuccess = true;
        expect(testRateLimit(exclude, { comment: publication1 })).to.equal(true);
        addToRateLimiter(subplebbitChallenges, { comment: publication1 }, challengeSuccess);
        expect(testRateLimit(exclude, { comment: publication1 })).to.equal(false);
        expect(testRateLimit(exclude, { comment: publication2 })).to.equal(true);
    });

    it("1 any publication type rateLimitChallengeSuccess true challengeSuccess false", async () => {
        const author1 = { address: getRandomAddress() };
        const author2 = { address: getRandomAddress() };
        const exclude = { rateLimit: 1, rateLimitChallengeSuccess: true };
        const subplebbitChallenges = [{ exclude: [exclude] }];
        const publication1 = { author: author1 };
        const publication2 = { author: author2 };
        const challengeSuccess = false;
        expect(testRateLimit(exclude, { comment: publication1 })).to.equal(true);
        addToRateLimiter(subplebbitChallenges, { comment: publication1 }, challengeSuccess);
        // true because if rateLimitChallengeSuccess true, dont count challengeSuccess false
        expect(testRateLimit(exclude, { comment: publication1 })).to.equal(true);
        expect(testRateLimit(exclude, { comment: publication2 })).to.equal(true);
    });

    it("1 any publication type rateLimitChallengeSuccess false challengeSuccess true", async () => {
        const author1 = { address: getRandomAddress() };
        const author2 = { address: getRandomAddress() };
        const exclude = { rateLimit: 1, rateLimitChallengeSuccess: false };
        const subplebbitChallenges = [{ exclude: [exclude] }];
        const publication1 = { author: author1 };
        const publication2 = { author: author2 };
        const challengeSuccess = true;
        expect(testRateLimit(exclude, { comment: publication1 })).to.equal(true);
        addToRateLimiter(subplebbitChallenges, { comment: publication1 }, challengeSuccess);
        // true because if rateLimitChallengeSuccess false, dont count challengeSuccess true
        expect(testRateLimit(exclude, { comment: publication1 })).to.equal(true);
        expect(testRateLimit(exclude, { comment: publication2 })).to.equal(true);
    });

    it("1 any publication type rateLimitChallengeSuccess false challengeSuccess false", async () => {
        const author1 = { address: getRandomAddress() };
        const author2 = { address: getRandomAddress() };
        const exclude = { rateLimit: 1, rateLimitChallengeSuccess: false };
        const subplebbitChallenges = [{ exclude: [exclude] }];
        const publication1 = { author: author1 };
        const publication2 = { author: author2 };
        const challengeSuccess = false;
        expect(testRateLimit(exclude, { comment: publication1 })).to.equal(true);
        addToRateLimiter(subplebbitChallenges, { comment: publication1 }, challengeSuccess);
        // false because if rateLimitChallengeSuccess false, count challengeSuccess false
        expect(testRateLimit(exclude, { comment: publication1 })).to.equal(false);
        expect(testRateLimit(exclude, { comment: publication2 })).to.equal(true);
    });

    it("1 publicationType.post true rateLimitChallengeSuccess true", async () => {
        const author = { address: getRandomAddress() };
        const exclude = { rateLimit: 1, publicationType: { post: true }, rateLimitChallengeSuccess: true };
        const subplebbitChallenges = [{ exclude: [exclude] }];
        const publicationPost = { author };
        const publicationReply = { author, parentCid: "Qm..." };
        const publicationVote = { author, commentCid: "Qm...", vote: 0 };
        const challengeSuccess = true;
        expect(testRateLimit(exclude, { comment: publicationPost })).to.equal(true);
        expect(testRateLimit(exclude, { comment: publicationReply })).to.equal(true);
        expect(testRateLimit(exclude, { vote: publicationVote })).to.equal(true);
        addToRateLimiter(subplebbitChallenges, { comment: publicationPost }, challengeSuccess);
        expect(testRateLimit(exclude, { comment: publicationPost })).to.equal(false);
        expect(testRateLimit(exclude, { comment: publicationReply })).to.equal(true);
        expect(testRateLimit(exclude, { vote: publicationVote })).to.equal(true);
        addToRateLimiter(subplebbitChallenges, { comment: publicationReply }, challengeSuccess);
        expect(testRateLimit(exclude, { comment: publicationPost })).to.equal(false);
        expect(testRateLimit(exclude, { comment: publicationReply })).to.equal(true);
        expect(testRateLimit(exclude, { vote: publicationVote })).to.equal(true);
        addToRateLimiter(subplebbitChallenges, { vote: publicationVote }, challengeSuccess);
        expect(testRateLimit(exclude, { comment: publicationPost })).to.equal(false);
        expect(testRateLimit(exclude, { comment: publicationReply })).to.equal(true);
        expect(testRateLimit(exclude, { vote: publicationVote })).to.equal(true);
    });

    it("1 publicationType.post true rateLimitChallengeSuccess true challengeSuccess false", async () => {
        const author = { address: getRandomAddress() };
        const exclude = { rateLimit: 1, publicationType: { post: true }, rateLimitChallengeSuccess: true };
        const subplebbitChallenges = [{ exclude: [exclude] }];
        const publicationPost = { author };
        const publicationReply = { author, parentCid: "Qm..." };
        const publicationVote = { author, commentCid: "Qm...", vote: 0 };
        const challengeSuccess = false;
        expect(testRateLimit(exclude, { comment: publicationPost })).to.equal(true);
        expect(testRateLimit(exclude, { comment: publicationReply })).to.equal(true);
        expect(testRateLimit(exclude, { vote: publicationVote })).to.equal(true);
        addToRateLimiter(subplebbitChallenges, { comment: publicationPost }, challengeSuccess);
        expect(testRateLimit(exclude, { comment: publicationPost })).to.equal(true);
        expect(testRateLimit(exclude, { comment: publicationReply })).to.equal(true);
        expect(testRateLimit(exclude, { vote: publicationVote })).to.equal(true);
        addToRateLimiter(subplebbitChallenges, { comment: publicationReply }, challengeSuccess);
        expect(testRateLimit(exclude, { comment: publicationPost })).to.equal(true);
        expect(testRateLimit(exclude, { comment: publicationReply })).to.equal(true);
        expect(testRateLimit(exclude, { vote: publicationVote })).to.equal(true);
        addToRateLimiter(subplebbitChallenges, { vote: publicationVote }, challengeSuccess);
        expect(testRateLimit(exclude, { comment: publicationPost })).to.equal(true);
        expect(testRateLimit(exclude, { comment: publicationReply })).to.equal(true);
        expect(testRateLimit(exclude, { vote: publicationVote })).to.equal(true);
    });

    it("1 publicationType.post true rateLimitChallengeSuccess false challengeSuccess true", async () => {
        const author = { address: getRandomAddress() };
        const exclude = { rateLimit: 1, publicationType: { post: true }, rateLimitChallengeSuccess: false };
        const subplebbitChallenges = [{ exclude: [exclude] }];
        const publicationPost = { author };
        const publicationReply = { author, parentCid: "Qm..." };
        const publicationVote = { author, commentCid: "Qm...", vote: 0 };
        const challengeSuccess = true;
        expect(testRateLimit(exclude, { comment: publicationPost })).to.equal(true);
        expect(testRateLimit(exclude, { comment: publicationReply })).to.equal(true);
        expect(testRateLimit(exclude, { vote: publicationVote })).to.equal(true);
        addToRateLimiter(subplebbitChallenges, { comment: publicationPost }, challengeSuccess);
        expect(testRateLimit(exclude, { comment: publicationPost })).to.equal(true);
        expect(testRateLimit(exclude, { comment: publicationReply })).to.equal(true);
        expect(testRateLimit(exclude, { vote: publicationVote })).to.equal(true);
        addToRateLimiter(subplebbitChallenges, { comment: publicationReply }, challengeSuccess);
        expect(testRateLimit(exclude, { comment: publicationPost })).to.equal(true);
        expect(testRateLimit(exclude, { comment: publicationReply })).to.equal(true);
        expect(testRateLimit(exclude, { vote: publicationVote })).to.equal(true);
        addToRateLimiter(subplebbitChallenges, { vote: publicationVote }, challengeSuccess);
        expect(testRateLimit(exclude, { comment: publicationPost })).to.equal(true);
        expect(testRateLimit(exclude, { comment: publicationReply })).to.equal(true);
        expect(testRateLimit(exclude, { vote: publicationVote })).to.equal(true);
    });

    it("1 publicationType.post true rateLimitChallengeSuccess false challengeSuccess false", async () => {
        const author = { address: getRandomAddress() };
        const exclude = { rateLimit: 1, publicationType: { post: true }, rateLimitChallengeSuccess: false };
        const subplebbitChallenges = [{ exclude: [exclude] }];
        const publicationPost = { author };
        const publicationReply = { author, parentCid: "Qm..." };
        const publicationVote = { author, commentCid: "Qm...", vote: 0 };
        const publicationCommentEdit = { author, commentCid: "Qm...", content: "edited content" };
        const publicationCommentModeration = { author, commentCid: "Qm...", commentModeration: { locked: true } };
        const publicationSubplebbitEdit = { author, subplebbitAddress: "Qm...", subplebbitEdit: { title: "New Title" } };

        const challengeSuccess = false;
        expect(testRateLimit(exclude, { comment: publicationPost })).to.equal(true);
        expect(testRateLimit(exclude, { comment: publicationReply })).to.equal(true);
        expect(testRateLimit(exclude, { vote: publicationVote })).to.equal(true);
        addToRateLimiter(subplebbitChallenges, { comment: publicationPost }, challengeSuccess);
        expect(testRateLimit(exclude, { comment: publicationPost })).to.equal(false);
        expect(testRateLimit(exclude, { comment: publicationReply })).to.equal(true);
        expect(testRateLimit(exclude, { vote: publicationVote })).to.equal(true);
        addToRateLimiter(subplebbitChallenges, { comment: publicationReply }, challengeSuccess);
        expect(testRateLimit(exclude, { comment: publicationPost })).to.equal(false);
        expect(testRateLimit(exclude, { comment: publicationReply })).to.equal(true);
        expect(testRateLimit(exclude, { vote: publicationVote })).to.equal(true);
        addToRateLimiter(subplebbitChallenges, { vote: publicationVote }, challengeSuccess);
        expect(testRateLimit(exclude, { comment: publicationPost })).to.equal(false);
        expect(testRateLimit(exclude, { comment: publicationReply })).to.equal(true);
        expect(testRateLimit(exclude, { vote: publicationVote })).to.equal(true);
        expect(testRateLimit(exclude, { commentEdit: publicationCommentEdit })).to.equal(true);
        expect(testRateLimit(exclude, { commentModeration: publicationCommentModeration })).to.equal(true);
        expect(testRateLimit(exclude, { subplebbitEdit: publicationSubplebbitEdit })).to.equal(true);

        addToRateLimiter(subplebbitChallenges, { commentEdit: publicationCommentEdit }, challengeSuccess);
        expect(testRateLimit(exclude, { comment: publicationPost })).to.equal(false);
        expect(testRateLimit(exclude, { comment: publicationReply })).to.equal(true);
        expect(testRateLimit(exclude, { vote: publicationVote })).to.equal(true);
        expect(testRateLimit(exclude, { commentEdit: publicationCommentEdit })).to.equal(true);
        expect(testRateLimit(exclude, { commentModeration: publicationCommentModeration })).to.equal(true);
        expect(testRateLimit(exclude, { subplebbitEdit: publicationSubplebbitEdit })).to.equal(true);

        addToRateLimiter(subplebbitChallenges, { commentModeration: publicationCommentModeration }, challengeSuccess);
        expect(testRateLimit(exclude, { comment: publicationPost })).to.equal(false);
        expect(testRateLimit(exclude, { comment: publicationReply })).to.equal(true);
        expect(testRateLimit(exclude, { vote: publicationVote })).to.equal(true);
        expect(testRateLimit(exclude, { commentEdit: publicationCommentEdit })).to.equal(true);
        expect(testRateLimit(exclude, { commentModeration: publicationCommentModeration })).to.equal(true);
        expect(testRateLimit(exclude, { subplebbitEdit: publicationSubplebbitEdit })).to.equal(true);

        addToRateLimiter(subplebbitChallenges, { subplebbitEdit: publicationSubplebbitEdit }, challengeSuccess);
        expect(testRateLimit(exclude, { comment: publicationPost })).to.equal(false);
        expect(testRateLimit(exclude, { comment: publicationReply })).to.equal(true);
        expect(testRateLimit(exclude, { vote: publicationVote })).to.equal(true);
        expect(testRateLimit(exclude, { commentEdit: publicationCommentEdit })).to.equal(true);
        expect(testRateLimit(exclude, { commentModeration: publicationCommentModeration })).to.equal(true);
        expect(testRateLimit(exclude, { subplebbitEdit: publicationSubplebbitEdit })).to.equal(true);
    });

    it("multiple exclude publicationType", async () => {
        const author = { address: getRandomAddress() };
        const excludePost = { rateLimit: 1, publicationType: { post: true } };
        const excludeReply = { rateLimit: 1, publicationType: { reply: true } };
        const excludeVote = { rateLimit: 1, publicationType: { vote: true } };
        const subplebbitChallenges = [{ exclude: [excludePost] }, { exclude: [excludeReply] }, { exclude: [excludeVote] }];

        const publicationPost = { author };
        const publicationReply = { author, parentCid: "Qm..." };
        const publicationVote = { author, commentCid: "Qm...", vote: 0 };
        const challengeSuccess = true;

        expect(testRateLimit(excludePost, { comment: publicationPost })).to.equal(true);
        expect(testRateLimit(excludeReply, { comment: publicationPost })).to.equal(true);
        expect(testRateLimit(excludeVote, { comment: publicationPost })).to.equal(true);
        expect(testRateLimit(excludePost, { comment: publicationReply })).to.equal(true);
        expect(testRateLimit(excludeReply, { comment: publicationReply })).to.equal(true);
        expect(testRateLimit(excludeVote, { comment: publicationReply })).to.equal(true);

        // publish one post
        addToRateLimiter(subplebbitChallenges, { comment: publicationPost }, challengeSuccess);

        // test post publication against all exclude, only post exclude fails
        expect(testRateLimit(excludePost, { comment: publicationPost })).to.equal(false);
        expect(testRateLimit(excludeReply, { comment: publicationPost })).to.equal(true);
        expect(testRateLimit(excludeVote, { comment: publicationPost })).to.equal(true);

        // test reply publication against all exclude, none fail because no reply published yet
        expect(testRateLimit(excludePost, { comment: publicationReply })).to.equal(true);
        expect(testRateLimit(excludeReply, { comment: publicationReply })).to.equal(true);
        expect(testRateLimit(excludeVote, { comment: publicationReply })).to.equal(true);

        // publish one reply
        addToRateLimiter(subplebbitChallenges, { comment: publicationReply }, challengeSuccess);

        // test post publication against all exclude, only post exclude fails
        expect(testRateLimit(excludePost, { comment: publicationPost })).to.equal(false);
        expect(testRateLimit(excludeReply, { comment: publicationPost })).to.equal(true);
        expect(testRateLimit(excludeVote, { comment: publicationPost })).to.equal(true);

        // test reply publication against all exclude, only reply exclude fails
        expect(testRateLimit(excludePost, { comment: publicationReply })).to.equal(true);
        expect(testRateLimit(excludeReply, { comment: publicationReply })).to.equal(false);
        expect(testRateLimit(excludeVote, { comment: publicationReply })).to.equal(true);
    });

    it("same exclude rateLimit publicationType multiple times", async () => {
        const author = { address: getRandomAddress() };
        const exclude1 = { rateLimit: 1 };
        const exclude1Copy = { rateLimit: 1 };
        const exclude2 = { rateLimit: 2 };
        const excludePost1 = { rateLimit: 1, publicationType: { post: true } };
        const excludePost2 = { rateLimit: 2, publicationType: { post: true } };
        const subplebbitChallenges = [
            { exclude: [exclude1] },
            { exclude: [exclude1Copy] },
            { exclude: [exclude2] },
            { exclude: [excludePost1] },
            { exclude: [excludePost2] }
        ];
        const publicationPost = { author };
        const challengeSuccess = true;

        expect(testRateLimit(exclude1, { comment: publicationPost })).to.equal(true);
        expect(testRateLimit(exclude2, { comment: publicationPost })).to.equal(true);
        expect(testRateLimit(excludePost1, { comment: publicationPost })).to.equal(true);
        expect(testRateLimit(excludePost2, { comment: publicationPost })).to.equal(true);

        // publish 1 post
        addToRateLimiter(subplebbitChallenges, { comment: publicationPost }, challengeSuccess);

        expect(testRateLimit(exclude1, { comment: publicationPost })).to.equal(false);
        expect(testRateLimit(exclude2, { comment: publicationPost })).to.equal(true);
        expect(testRateLimit(excludePost1, { comment: publicationPost })).to.equal(false);
        expect(testRateLimit(excludePost2, { comment: publicationPost })).to.equal(true);

        // // publish 2 post
        addToRateLimiter(subplebbitChallenges, { comment: publicationPost }, challengeSuccess);

        expect(testRateLimit(exclude1, { comment: publicationPost })).to.equal(false);
        expect(testRateLimit(exclude2, { comment: publicationPost })).to.equal(false);
        expect(testRateLimit(excludePost1, { comment: publicationPost })).to.equal(false);
        expect(testRateLimit(excludePost2, { comment: publicationPost })).to.equal(false);
    });

    it("same exclude rateLimit multiple times different rateLimitChallengeSuccess", async () => {
        const author = { address: getRandomAddress() };
        const exclude1 = { rateLimit: 1 };
        const exclude2 = { rateLimit: 1, rateLimitChallengeSuccess: false };
        const subplebbitChallenges = [{ exclude: [exclude1] }, { exclude: [exclude2] }];
        const publicationPost = { author };
        let challengeSuccess = true;

        expect(testRateLimit(exclude1, { comment: publicationPost })).to.equal(true);
        expect(testRateLimit(exclude2, { comment: publicationPost })).to.equal(true);

        // publish 1 post
        addToRateLimiter(subplebbitChallenges, { comment: publicationPost }, challengeSuccess);

        expect(testRateLimit(exclude1, { comment: publicationPost })).to.equal(false);
        expect(testRateLimit(exclude2, { comment: publicationPost })).to.equal(true);

        // publish 2 post
        challengeSuccess = false;
        addToRateLimiter(subplebbitChallenges, { comment: publicationPost }, challengeSuccess);

        expect(testRateLimit(exclude1, { comment: publicationPost })).to.equal(false);
        expect(testRateLimit(exclude2, { comment: publicationPost })).to.equal(false);
    });

    it("0 any publication type", async () => {
        const author1 = { address: getRandomAddress() };
        const exclude = { rateLimit: 0 };
        const subplebbitChallenges = [{ exclude: [exclude] }];
        const publication1 = { author: author1 };
        const challengeSuccess = true;
        expect(testRateLimit(exclude, { comment: publication1 })).to.equal(false);
        addToRateLimiter(subplebbitChallenges, { comment: publication1 }, challengeSuccess);
        expect(testRateLimit(exclude, { comment: publication1 })).to.equal(false);
    });

    it("0 any publication type rateLimitChallengeSuccess true", async () => {
        const author1 = { address: getRandomAddress() };
        const exclude = { rateLimit: 0, rateLimitChallengeSuccess: true };
        const subplebbitChallenges = [{ exclude: [exclude] }];
        const publication1 = { author: author1 };
        const challengeSuccess = true;
        expect(testRateLimit(exclude, { comment: publication1 })).to.equal(false);
        addToRateLimiter(subplebbitChallenges, { comment: publication1 }, challengeSuccess);
        expect(testRateLimit(exclude, { comment: publication1 })).to.equal(false);
    });

    it("0 any publication type rateLimitChallengeSuccess false", async () => {
        const author1 = { address: getRandomAddress() };
        const exclude = { rateLimit: 0, rateLimitChallengeSuccess: false };
        const subplebbitChallenges = [{ exclude: [exclude] }];
        const publication1 = { author: author1 };
        const challengeSuccess = true;
        expect(testRateLimit(exclude, { comment: publication1 })).to.equal(false);
        addToRateLimiter(subplebbitChallenges, { comment: publication1 }, challengeSuccess);
        expect(testRateLimit(exclude, { comment: publication1 })).to.equal(false);
    });
});
