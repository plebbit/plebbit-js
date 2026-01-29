import { expect } from "chai";
import {
    mockPlebbit,
    createSubWithNoChallenge,
    generateMockPost,
    overrideCommentInstancePropsAndSign,
    publishWithExpectedResult,
    mockPlebbitNoDataPathWithOnlyKuboClient,
    resolveWhenConditionIsTrue,
    publishRandomPost,
    generateMockVote,
    publishRandomReply
} from "../../../../dist/node/test/test-util.js";
import { messages } from "../../../../dist/node/errors.js";
import { describe, it, beforeAll, afterAll } from "vitest";
import type { Plebbit } from "../../../../dist/node/plebbit/plebbit.js";
import type { LocalSubplebbit } from "../../../../dist/node/runtime/node/subplebbit/local-subplebbit.js";
import type { RpcLocalSubplebbit } from "../../../../dist/node/subplebbit/rpc-local-subplebbit.js";
import type { Comment } from "../../../../dist/node/publications/comment/comment.js";
import type { RemoteSubplebbit } from "../../../../dist/node/subplebbit/remote-subplebbit.js";
import type { CommentIpfsWithCidDefined } from "../../../../dist/node/publications/comment/types.js";

describe(`subplebbit.features.requirePostLink`, async () => {
    let plebbit: Plebbit;
    let remotePlebbit: Plebbit;
    let subplebbit: LocalSubplebbit | RpcLocalSubplebbit;
    beforeAll(async () => {
        plebbit = await mockPlebbit();
        remotePlebbit = await mockPlebbitNoDataPathWithOnlyKuboClient();
        subplebbit = await createSubWithNoChallenge({}, plebbit);
        await subplebbit.start();
        await resolveWhenConditionIsTrue({ toUpdate: subplebbit, predicate: async () => typeof subplebbit.updatedAt === "number" });
    });

    afterAll(async () => {
        await subplebbit.delete();
        await plebbit.destroy();
        await remotePlebbit.destroy();
    });

    it.sequential(`Feature is updated correctly in props`, async () => {
        expect(subplebbit.features).to.be.undefined;
        await subplebbit.edit({ features: { ...subplebbit.features, requirePostLink: true } });
        expect(subplebbit.features?.requirePostLink).to.be.true;

        const remoteSub = await remotePlebbit.getSubplebbit({ address: subplebbit.address });
        await remoteSub.update();
        await resolveWhenConditionIsTrue({ toUpdate: remoteSub, predicate: async () => remoteSub.features?.requirePostLink === true });

        expect(remoteSub.features?.requirePostLink).to.be.true;
        await remoteSub.stop();
    });

    it(`Can't publish a post with invalid link`, async () => {
        const invalidUrl = "test.com"; // invalid because it has no protocol
        const post = await generateMockPost(subplebbit.address, remotePlebbit, false);
        await overrideCommentInstancePropsAndSign(post, { link: invalidUrl } as Parameters<typeof overrideCommentInstancePropsAndSign>[1]);
        expect(post.link).to.equal(invalidUrl);
        await publishWithExpectedResult(post, false, messages.ERR_COMMENT_HAS_INVALID_LINK_FIELD);
    });
    it(`Can publish a post with valid link`, async () => {
        const validUrl = "https://google.com";
        const post = await generateMockPost(subplebbit.address, remotePlebbit, false, { link: validUrl });
        await publishWithExpectedResult(post, true);
        expect(post.link).to.equal(validUrl);
    });
});

describe.concurrent(`subplebbit.features.requirePostLinkIsMedia`, async () => {
    let plebbit: Plebbit;
    let remotePlebbit: Plebbit;
    let subplebbit: LocalSubplebbit | RpcLocalSubplebbit;
    beforeAll(async () => {
        plebbit = await mockPlebbit();
        remotePlebbit = await mockPlebbitNoDataPathWithOnlyKuboClient();
        subplebbit = await createSubWithNoChallenge({}, plebbit);
        await subplebbit.start();
        await resolveWhenConditionIsTrue({ toUpdate: subplebbit, predicate: async () => typeof subplebbit.updatedAt === "number" });
    });

    afterAll(async () => {
        await subplebbit.delete();
        await plebbit.destroy();
        await remotePlebbit.destroy();
    });

    it.sequential(`Feature is updated correctly in props`, async () => {
        expect(subplebbit.features).to.be.undefined;
        await subplebbit.edit({ features: { ...subplebbit.features, requirePostLinkIsMedia: true } });

        expect(subplebbit.features?.requirePostLinkIsMedia).to.be.true;
        const remoteSub = await remotePlebbit.getSubplebbit({ address: subplebbit.address });
        await remoteSub.update();
        await resolveWhenConditionIsTrue({ toUpdate: remoteSub, predicate: async () => remoteSub.features?.requirePostLinkIsMedia === true });
        expect(remoteSub.features?.requirePostLinkIsMedia).to.be.true;
        await remoteSub.stop();
    });

    it(`Can't publish a post with link that isn't of a media`, async () => {
        const urlOfNotMedia = "https://google.com";
        const post = await generateMockPost(subplebbit.address, remotePlebbit, false, { link: urlOfNotMedia });
        expect(post.link).to.equal(urlOfNotMedia);
        await publishWithExpectedResult(post, false, messages.ERR_POST_LINK_IS_NOT_OF_MEDIA);
    });
    it(`Can publish a post with valid media link`, async () => {
        const validUrl = "https://img1.wsimg.com/isteam/ip/eb02f20b-e787-4a02-b188-d0fcbc250ba1/blob-6af1ead.png";
        const post = await generateMockPost(subplebbit.address, remotePlebbit, false, { link: validUrl });
        expect(post.link).to.equal(validUrl);
        await publishWithExpectedResult(post, true);
        expect(post.link).to.equal(validUrl);
    });
});

describe.concurrent(`subplebbit.features.noUpvotes`, async () => {
    let plebbit: Plebbit;
    let subplebbit: LocalSubplebbit | RpcLocalSubplebbit;
    let remotePlebbit: Plebbit;
    let postToVoteOn: Comment;

    beforeAll(async () => {
        plebbit = await mockPlebbit();
        remotePlebbit = await mockPlebbitNoDataPathWithOnlyKuboClient();
        subplebbit = await createSubWithNoChallenge({}, plebbit);

        await subplebbit.start();
        await resolveWhenConditionIsTrue({ toUpdate: subplebbit, predicate: async () => typeof subplebbit.updatedAt === "number" });

        postToVoteOn = await publishRandomPost(subplebbit.address, remotePlebbit);
    });

    afterAll(async () => {
        await subplebbit.delete();
        await plebbit.destroy();
        await remotePlebbit.destroy();
    });

    it.sequential(`Feature is updated correctly in subplebbit.features`, async () => {
        expect(subplebbit.features).to.be.undefined;

        await subplebbit.edit({ features: { ...subplebbit.features, noUpvotes: true } });
        expect(subplebbit.features?.noUpvotes).to.be.true;
        const remoteSub = await remotePlebbit.getSubplebbit({ address: subplebbit.address });
        await remoteSub.update();
        await resolveWhenConditionIsTrue({ toUpdate: remoteSub, predicate: async () => remoteSub.features?.noUpvotes === true }); // that means we published a new update

        expect(remoteSub.features?.noUpvotes).to.be.true;
        await remoteSub.stop();
    });

    it(`Not allowed to publish upvotes if subplebbit.features.noUpvotes=true`, async () => {
        const upvote = await generateMockVote(postToVoteOn as CommentIpfsWithCidDefined, 1, remotePlebbit); // should be rejected

        await publishWithExpectedResult(upvote, false, messages.ERR_NOT_ALLOWED_TO_PUBLISH_UPVOTES);
    });

    it(`Allowed to publish downvotes if subplebbit.features.noUpvotes=true`, async () => {
        const downvote = await generateMockVote(postToVoteOn as CommentIpfsWithCidDefined, -1, remotePlebbit); // should be accepted

        await publishWithExpectedResult(downvote, true);
    });
});
describe.concurrent(`subplebbit.features.noDownvotes`, async () => {
    let plebbit: Plebbit;
    let subplebbit: LocalSubplebbit | RpcLocalSubplebbit;
    let remotePlebbit: Plebbit;
    let postToVoteOn: Comment;

    beforeAll(async () => {
        plebbit = await mockPlebbit();
        remotePlebbit = await mockPlebbitNoDataPathWithOnlyKuboClient();
        subplebbit = await createSubWithNoChallenge({}, plebbit);

        await subplebbit.start();
        await resolveWhenConditionIsTrue({ toUpdate: subplebbit, predicate: async () => typeof subplebbit.updatedAt === "number" });

        postToVoteOn = await publishRandomPost(subplebbit.address, remotePlebbit);
    });

    afterAll(async () => {
        await subplebbit.delete();
        await plebbit.destroy();
        await remotePlebbit.destroy();
    });

    it.sequential(`Feature is updated correctly in subplebbit.features`, async () => {
        expect(subplebbit.features).to.be.undefined;
        await subplebbit.edit({ features: { ...subplebbit.features, noDownvotes: true } });
        expect(subplebbit.features?.noDownvotes).to.be.true;
        const remoteSub = await remotePlebbit.getSubplebbit({ address: subplebbit.address });
        await remoteSub.update();
        await resolveWhenConditionIsTrue({ toUpdate: remoteSub, predicate: async () => remoteSub.features?.noDownvotes === true }); // that means we published a new update

        await remoteSub.stop();
        expect(remoteSub.features?.noDownvotes).to.be.true;
    });

    it(`Not allowed to publish downvotes if subplebbit.features.noDownvotes=true`, async () => {
        const downvote = await generateMockVote(postToVoteOn as CommentIpfsWithCidDefined, -1, remotePlebbit); // should be rejected

        await publishWithExpectedResult(downvote, false, messages.ERR_NOT_ALLOWED_TO_PUBLISH_DOWNVOTES);
    });

    it(`Allowed to publish upvotes if subplebbit.features.noDownvotes=true`, async () => {
        const upvote = await generateMockVote(postToVoteOn as CommentIpfsWithCidDefined, 1, remotePlebbit); // should be accepted

        await publishWithExpectedResult(upvote, true);
    });
});

describe.concurrent(`subplebbit.features.noPostDownvotes`, async () => {
    let plebbit: Plebbit;
    let subplebbit: LocalSubplebbit | RpcLocalSubplebbit;
    let remotePlebbit: Plebbit;
    let postToVoteOn: Comment;

    beforeAll(async () => {
        plebbit = await mockPlebbit();
        remotePlebbit = await mockPlebbitNoDataPathWithOnlyKuboClient();
        subplebbit = await createSubWithNoChallenge({}, plebbit);

        await subplebbit.edit({ features: { ...subplebbit.features, noPostDownvotes: true } });

        await subplebbit.start();
        await resolveWhenConditionIsTrue({ toUpdate: subplebbit, predicate: async () => typeof subplebbit.updatedAt === "number" });

        postToVoteOn = await publishRandomPost(subplebbit.address, remotePlebbit);
    });

    afterAll(async () => {
        await subplebbit.delete();
        await plebbit.destroy();
        await remotePlebbit.destroy();
    });

    it(`Not allowed to publish downvotes to posts if subplebbit.features.noPostDownvotes=true`, async () => {
        const downvote = await generateMockVote(postToVoteOn as CommentIpfsWithCidDefined, -1, remotePlebbit); // should be rejected

        await publishWithExpectedResult(downvote, false, messages.ERR_NOT_ALLOWED_TO_PUBLISH_POST_DOWNVOTES);
    });

    it(`Allowed to publish upvotes to posts if subplebbit.features.noPostDownvotes=true`, async () => {
        const upvote = await generateMockVote(postToVoteOn as CommentIpfsWithCidDefined, 1, remotePlebbit); // should be accepted

        await publishWithExpectedResult(upvote, true);
    });

    it(`Allowed to publish upvotes and downvotes to replies if subplebbit.noPostDownvotes=true`, async () => {
        const reply = await publishRandomReply(postToVoteOn as CommentIpfsWithCidDefined, plebbit);

        const upvote = await generateMockVote(reply as CommentIpfsWithCidDefined, 1, remotePlebbit);
        const downvote = await generateMockVote(reply as CommentIpfsWithCidDefined, -1, remotePlebbit);

        await Promise.all([upvote, downvote].map((vote) => publishWithExpectedResult(vote, true)));
    });
});
describe.concurrent(`subplebbit.features.noPostUpvotes`, async () => {
    let plebbit: Plebbit;
    let subplebbit: LocalSubplebbit | RpcLocalSubplebbit;
    let remotePlebbit: Plebbit;
    let postToVoteOn: Comment;

    beforeAll(async () => {
        plebbit = await mockPlebbit();
        remotePlebbit = await mockPlebbitNoDataPathWithOnlyKuboClient();
        subplebbit = await createSubWithNoChallenge({}, plebbit);

        await subplebbit.edit({ features: { ...subplebbit.features, noPostUpvotes: true } });

        await subplebbit.start();
        await resolveWhenConditionIsTrue({ toUpdate: subplebbit, predicate: async () => typeof subplebbit.updatedAt === "number" });

        postToVoteOn = await publishRandomPost(subplebbit.address, remotePlebbit);
    });

    afterAll(async () => {
        await subplebbit.delete();
        await plebbit.destroy();
        await remotePlebbit.destroy();
    });

    it(`Not allowed to publish upvotes to posts if subplebbit.features.noPostUpvotes=true`, async () => {
        const upvote = await generateMockVote(postToVoteOn as CommentIpfsWithCidDefined, 1, remotePlebbit); // should be rejected

        await publishWithExpectedResult(upvote, false, messages.ERR_NOT_ALLOWED_TO_PUBLISH_POST_UPVOTES);
    });

    it(`Allowed to publish downvotes to posts if subplebbit.features.noPostUpvotes=true`, async () => {
        const downvote = await generateMockVote(postToVoteOn as CommentIpfsWithCidDefined, -1, remotePlebbit); // should be accepted

        await publishWithExpectedResult(downvote, true);
    });

    it(`Allowed to publish upvotes and downvotes to replies if subplebbit.noPostUpvotes=true`, async () => {
        const reply = await publishRandomReply(postToVoteOn as CommentIpfsWithCidDefined, plebbit);

        const upvote = await generateMockVote(reply as CommentIpfsWithCidDefined, 1, remotePlebbit);
        const downvote = await generateMockVote(reply as CommentIpfsWithCidDefined, -1, remotePlebbit);

        await Promise.all([upvote, downvote].map((vote) => publishWithExpectedResult(vote, true)));
    });
});

describe.concurrent(`subplebbit.features.noReplyDownvotes`, async () => {
    let plebbit: Plebbit;
    let subplebbit: LocalSubplebbit | RpcLocalSubplebbit;
    let remotePlebbit: Plebbit;
    let postToVoteOn: Comment;
    let replyToVoteOn: Comment;

    beforeAll(async () => {
        plebbit = await mockPlebbit();
        remotePlebbit = await mockPlebbitNoDataPathWithOnlyKuboClient();
        subplebbit = await createSubWithNoChallenge({}, plebbit);

        await subplebbit.edit({ features: { ...subplebbit.features, noReplyDownvotes: true } });

        await subplebbit.start();
        await resolveWhenConditionIsTrue({ toUpdate: subplebbit, predicate: async () => typeof subplebbit.updatedAt === "number" });

        postToVoteOn = await publishRandomPost(subplebbit.address, remotePlebbit);

        replyToVoteOn = await publishRandomReply(postToVoteOn as CommentIpfsWithCidDefined, remotePlebbit);
    });

    afterAll(async () => {
        await subplebbit.delete();
        await plebbit.destroy();
        await remotePlebbit.destroy();
    });

    it(`Not allowed to publish downvotes to replies if subplebbit.features.noReplyDownvotes=true`, async () => {
        const downvote = await generateMockVote(replyToVoteOn as CommentIpfsWithCidDefined, -1, remotePlebbit); // should be rejected

        await publishWithExpectedResult(downvote, false, messages.ERR_NOT_ALLOWED_TO_PUBLISH_REPLY_DOWNVOTES);
    });

    it(`Allowed to publish upvote to replies if subplebbit.features.noReplyDownvotes=true`, async () => {
        const upvote = await generateMockVote(postToVoteOn as CommentIpfsWithCidDefined, 1, remotePlebbit); // should be accepted

        await publishWithExpectedResult(upvote, true);
    });

    it(`Allowed to publish upvotes and downvotes to posts if subplebbit.noReplyDownvotes=true`, async () => {
        const upvote = await generateMockVote(postToVoteOn as CommentIpfsWithCidDefined, 1, remotePlebbit);
        const downvote = await generateMockVote(postToVoteOn as CommentIpfsWithCidDefined, -1, remotePlebbit);

        await Promise.all([upvote, downvote].map((vote) => publishWithExpectedResult(vote, true)));
    });
});
describe.concurrent(`subplebbit.features.noReplyUpvotes`, async () => {
    let plebbit: Plebbit;
    let subplebbit: LocalSubplebbit | RpcLocalSubplebbit;
    let remotePlebbit: Plebbit;
    let postToVoteOn: Comment;
    let replyToVoteOn: Comment;

    beforeAll(async () => {
        plebbit = await mockPlebbit();
        remotePlebbit = await mockPlebbitNoDataPathWithOnlyKuboClient();
        subplebbit = await createSubWithNoChallenge({}, plebbit);

        await subplebbit.edit({ features: { ...subplebbit.features, noReplyUpvotes: true } });

        await subplebbit.start();
        await resolveWhenConditionIsTrue({ toUpdate: subplebbit, predicate: async () => typeof subplebbit.updatedAt === "number" });

        postToVoteOn = await publishRandomPost(subplebbit.address, remotePlebbit);

        replyToVoteOn = await publishRandomReply(postToVoteOn as CommentIpfsWithCidDefined, remotePlebbit);
    });

    afterAll(async () => {
        await subplebbit.delete();
        await plebbit.destroy();
        await remotePlebbit.destroy();
    });

    it(`Not allowed to publish upvotes to replies if subplebbit.features.noReplyUpvotes=true`, async () => {
        const upvote = await generateMockVote(replyToVoteOn as CommentIpfsWithCidDefined, 1, remotePlebbit); // should be rejected

        await publishWithExpectedResult(upvote, false, messages.ERR_NOT_ALLOWED_TO_PUBLISH_REPLY_UPVOTES);
    });

    it(`Allowed to publish downvote to replies if subplebbit.features.noReplyUpvotes=true`, async () => {
        const downvote = await generateMockVote(postToVoteOn as CommentIpfsWithCidDefined, -1, remotePlebbit); // should be accepted

        await publishWithExpectedResult(downvote, true);
    });

    it(`Allowed to publish upvotes and downvotes to posts if subplebbit.noReplyUpvotes=true`, async () => {
        const upvote = await generateMockVote(postToVoteOn as CommentIpfsWithCidDefined, 1, remotePlebbit);
        const downvote = await generateMockVote(postToVoteOn as CommentIpfsWithCidDefined, -1, remotePlebbit);

        await Promise.all([upvote, downvote].map((vote) => publishWithExpectedResult(vote, true)));
    });
});
