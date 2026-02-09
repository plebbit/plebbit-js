import {
    mockPlebbit,
    createSubWithNoChallenge,
    generateMockPost,
    generateMockComment,
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

describe.concurrent(`subplebbit.features.noMarkdownImages`, async () => {
    let plebbit: Plebbit;
    let remotePlebbit: Plebbit;
    let subplebbit: LocalSubplebbit | RpcLocalSubplebbit;
    let publishedPost: Comment;

    beforeAll(async () => {
        plebbit = await mockPlebbit();
        remotePlebbit = await mockPlebbitNoDataPathWithOnlyKuboClient();
        subplebbit = await createSubWithNoChallenge({}, plebbit);
        await subplebbit.start();
        await resolveWhenConditionIsTrue({ toUpdate: subplebbit, predicate: async () => typeof subplebbit.updatedAt === "number" });

        // Publish a post first (before enabling the feature) to test comment edits later
        publishedPost = await publishRandomPost(subplebbit.address, remotePlebbit);
    });

    afterAll(async () => {
        await subplebbit.delete();
        await plebbit.destroy();
        await remotePlebbit.destroy();
    });

    it.sequential(`Feature is updated correctly in props`, async () => {
        expect(subplebbit.features).to.be.undefined;
        await subplebbit.edit({ features: { ...subplebbit.features, noMarkdownImages: true } });
        expect(subplebbit.features?.noMarkdownImages).to.be.true;

        const remoteSub = await remotePlebbit.getSubplebbit({ address: subplebbit.address });
        await remoteSub.update();
        await resolveWhenConditionIsTrue({ toUpdate: remoteSub, predicate: async () => remoteSub.features?.noMarkdownImages === true });
        expect(remoteSub.features?.noMarkdownImages).to.be.true;
        await remoteSub.stop();
    });

    it(`Can't publish a post with markdown image syntax`, async () => {
        const contentWithMarkdownImage = "Here is some text with an image: ![alt text](https://example.com/image.png)";
        const post = await generateMockPost(subplebbit.address, remotePlebbit, false, { content: contentWithMarkdownImage });
        await publishWithExpectedResult(post, false, messages.ERR_COMMENT_CONTENT_CONTAINS_MARKDOWN_IMAGE);
    });

    it(`Can't publish a post with HTML img tag`, async () => {
        const contentWithHtmlImg = 'Here is some text with an image: <img src="https://example.com/image.png" />';
        const post = await generateMockPost(subplebbit.address, remotePlebbit, false, { content: contentWithHtmlImg });
        await publishWithExpectedResult(post, false, messages.ERR_COMMENT_CONTENT_CONTAINS_MARKDOWN_IMAGE);
    });

    it(`Can't publish a reply with markdown image`, async () => {
        const contentWithMarkdownImage = "Reply with image: ![photo](https://example.com/photo.jpg)";
        const reply = await generateMockComment(publishedPost as CommentIpfsWithCidDefined, remotePlebbit, false, {
            content: contentWithMarkdownImage
        });
        await publishWithExpectedResult(reply, false, messages.ERR_COMMENT_CONTENT_CONTAINS_MARKDOWN_IMAGE);
    });

    it(`Can publish a post with plain text content`, async () => {
        const plainContent = "This is just plain text without any images";
        const post = await generateMockPost(subplebbit.address, remotePlebbit, false, { content: plainContent });
        await publishWithExpectedResult(post, true);
    });

    it(`Can publish a post with regular markdown link (not image)`, async () => {
        const contentWithLink = "Check out this [link](https://example.com)";
        const post = await generateMockPost(subplebbit.address, remotePlebbit, false, { content: contentWithLink });
        await publishWithExpectedResult(post, true);
    });

    it(`Can publish a post with direct link field (not markdown content)`, async () => {
        const post = await generateMockPost(subplebbit.address, remotePlebbit, false, {
            link: "https://example.com/image.png",
            content: "Just text"
        });
        await publishWithExpectedResult(post, true);
    });

    it(`Can't edit a comment to add markdown image`, async () => {
        const contentWithMarkdownImage = "Edited to include an image: ![img](https://example.com/new.png)";
        const commentEdit = await remotePlebbit.createCommentEdit({
            commentCid: publishedPost.cid!,
            content: contentWithMarkdownImage,
            subplebbitAddress: subplebbit.address,
            signer: publishedPost.signer
        });
        await publishWithExpectedResult(commentEdit, false, messages.ERR_COMMENT_CONTENT_CONTAINS_MARKDOWN_IMAGE);
    });

    it(`Can edit a comment with plain text content`, async () => {
        const plainContent = "Edited to plain text content";
        const commentEdit = await remotePlebbit.createCommentEdit({
            commentCid: publishedPost.cid!,
            content: plainContent,
            subplebbitAddress: subplebbit.address,
            signer: publishedPost.signer
        });
        await publishWithExpectedResult(commentEdit, true);
    });
});

describe.concurrent(`subplebbit.features.noMarkdownVideos`, async () => {
    let plebbit: Plebbit;
    let remotePlebbit: Plebbit;
    let subplebbit: LocalSubplebbit | RpcLocalSubplebbit;
    let publishedPost: Comment;

    beforeAll(async () => {
        plebbit = await mockPlebbit();
        remotePlebbit = await mockPlebbitNoDataPathWithOnlyKuboClient();
        subplebbit = await createSubWithNoChallenge({}, plebbit);
        await subplebbit.start();
        await resolveWhenConditionIsTrue({ toUpdate: subplebbit, predicate: async () => typeof subplebbit.updatedAt === "number" });

        // Publish a post first (before enabling the feature) to test comment edits later
        publishedPost = await publishRandomPost(subplebbit.address, remotePlebbit);
    });

    afterAll(async () => {
        await subplebbit.delete();
        await plebbit.destroy();
        await remotePlebbit.destroy();
    });

    it.sequential(`Feature is updated correctly in props`, async () => {
        expect(subplebbit.features).to.be.undefined;
        await subplebbit.edit({ features: { ...subplebbit.features, noMarkdownVideos: true } });
        expect(subplebbit.features?.noMarkdownVideos).to.be.true;

        const remoteSub = await remotePlebbit.getSubplebbit({ address: subplebbit.address });
        await remoteSub.update();
        await resolveWhenConditionIsTrue({ toUpdate: remoteSub, predicate: async () => remoteSub.features?.noMarkdownVideos === true });
        expect(remoteSub.features?.noMarkdownVideos).to.be.true;
        await remoteSub.stop();
    });

    it(`Can't publish a post with markdown video syntax (video extension)`, async () => {
        const contentWithMarkdownVideo = "Here is a video: ![video](https://example.com/video.mp4)";
        const post = await generateMockPost(subplebbit.address, remotePlebbit, false, { content: contentWithMarkdownVideo });
        await publishWithExpectedResult(post, false, messages.ERR_COMMENT_CONTENT_CONTAINS_MARKDOWN_VIDEO);
    });

    it(`Can't publish a post with HTML video tag`, async () => {
        const contentWithHtmlVideo = 'Here is a video: <video src="https://example.com/video.mp4"></video>';
        const post = await generateMockPost(subplebbit.address, remotePlebbit, false, { content: contentWithHtmlVideo });
        await publishWithExpectedResult(post, false, messages.ERR_COMMENT_CONTENT_CONTAINS_MARKDOWN_VIDEO);
    });

    it(`Can't publish a post with HTML iframe tag`, async () => {
        const contentWithIframe = 'Embedded video: <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ"></iframe>';
        const post = await generateMockPost(subplebbit.address, remotePlebbit, false, { content: contentWithIframe });
        await publishWithExpectedResult(post, false, messages.ERR_COMMENT_CONTENT_CONTAINS_MARKDOWN_VIDEO);
    });

    it(`Can't publish a reply with markdown video`, async () => {
        const contentWithMarkdownVideo = "Reply with video: ![clip](https://example.com/clip.webm)";
        const reply = await generateMockComment(publishedPost as CommentIpfsWithCidDefined, remotePlebbit, false, {
            content: contentWithMarkdownVideo
        });
        await publishWithExpectedResult(reply, false, messages.ERR_COMMENT_CONTENT_CONTAINS_MARKDOWN_VIDEO);
    });

    it(`Can publish a post with plain text content`, async () => {
        const plainContent = "This is just plain text without any videos";
        const post = await generateMockPost(subplebbit.address, remotePlebbit, false, { content: plainContent });
        await publishWithExpectedResult(post, true);
    });

    it(`Can publish a post with markdown image (not video)`, async () => {
        // noMarkdownVideos should not block images
        const contentWithImage = "Here is an image: ![img](https://example.com/photo.jpg)";
        const post = await generateMockPost(subplebbit.address, remotePlebbit, false, { content: contentWithImage });
        await publishWithExpectedResult(post, true);
    });

    it(`Can publish a post with direct link field to video (not markdown content)`, async () => {
        const post = await generateMockPost(subplebbit.address, remotePlebbit, false, {
            link: "https://example.com/video.mp4",
            content: "Just text"
        });
        await publishWithExpectedResult(post, true);
    });

    it(`Can't edit a comment to add markdown video`, async () => {
        const contentWithMarkdownVideo = "Edited to include a video: ![vid](https://example.com/new.mp4)";
        const commentEdit = await remotePlebbit.createCommentEdit({
            commentCid: publishedPost.cid!,
            content: contentWithMarkdownVideo,
            subplebbitAddress: subplebbit.address,
            signer: publishedPost.signer
        });
        await publishWithExpectedResult(commentEdit, false, messages.ERR_COMMENT_CONTENT_CONTAINS_MARKDOWN_VIDEO);
    });

    it(`Can't edit a comment to add iframe embed`, async () => {
        const contentWithIframe = 'Edited: <iframe src="https://youtube.com/embed/xyz"></iframe>';
        const commentEdit = await remotePlebbit.createCommentEdit({
            commentCid: publishedPost.cid!,
            content: contentWithIframe,
            subplebbitAddress: subplebbit.address,
            signer: publishedPost.signer
        });
        await publishWithExpectedResult(commentEdit, false, messages.ERR_COMMENT_CONTENT_CONTAINS_MARKDOWN_VIDEO);
    });

    it(`Can edit a comment with plain text content`, async () => {
        const plainContent = "Edited to plain text content";
        const commentEdit = await remotePlebbit.createCommentEdit({
            commentCid: publishedPost.cid!,
            content: plainContent,
            subplebbitAddress: subplebbit.address,
            signer: publishedPost.signer
        });
        await publishWithExpectedResult(commentEdit, true);
    });
});

describe.concurrent(`subplebbit.features.noImages`, async () => {
    let plebbit: Plebbit;
    let remotePlebbit: Plebbit;
    let subplebbit: LocalSubplebbit | RpcLocalSubplebbit;
    let publishedPost: Comment;

    beforeAll(async () => {
        plebbit = await mockPlebbit();
        remotePlebbit = await mockPlebbitNoDataPathWithOnlyKuboClient();
        subplebbit = await createSubWithNoChallenge({}, plebbit);
        await subplebbit.start();
        await resolveWhenConditionIsTrue({ toUpdate: subplebbit, predicate: async () => typeof subplebbit.updatedAt === "number" });

        // Publish a post first (before enabling the feature)
        publishedPost = await publishRandomPost(subplebbit.address, remotePlebbit);
    });

    afterAll(async () => {
        await subplebbit.delete();
        await plebbit.destroy();
        await remotePlebbit.destroy();
    });

    it.sequential(`Feature is updated correctly in props`, async () => {
        expect(subplebbit.features).to.be.undefined;
        await subplebbit.edit({ features: { ...subplebbit.features, noImages: true } });
        expect(subplebbit.features?.noImages).to.be.true;

        const remoteSub = await remotePlebbit.getSubplebbit({ address: subplebbit.address });
        await remoteSub.update();
        await resolveWhenConditionIsTrue({ toUpdate: remoteSub, predicate: async () => remoteSub.features?.noImages === true });
        expect(remoteSub.features?.noImages).to.be.true;
        await remoteSub.stop();
    });

    it(`Can't publish a post with image link`, async () => {
        const post = await generateMockPost(subplebbit.address, remotePlebbit, false, {
            link: "https://example.com/image.png",
            content: "Just text"
        });
        await publishWithExpectedResult(post, false, messages.ERR_COMMENT_HAS_LINK_THAT_IS_IMAGE);
    });

    it(`Can't publish a reply with image link`, async () => {
        const reply = await generateMockComment(publishedPost as CommentIpfsWithCidDefined, remotePlebbit, false, {
            link: "https://example.com/photo.jpg"
        });
        await publishWithExpectedResult(reply, false, messages.ERR_COMMENT_HAS_LINK_THAT_IS_IMAGE);
    });

    it(`Can publish a post with video link (noImages doesn't block videos)`, async () => {
        const post = await generateMockPost(subplebbit.address, remotePlebbit, false, {
            link: "https://example.com/video.mp4",
            content: "Just text"
        });
        await publishWithExpectedResult(post, true);
    });

    it(`Can publish a post with plain content (no link)`, async () => {
        const post = await generateMockPost(subplebbit.address, remotePlebbit, false, {
            content: "Just plain text"
        });
        await publishWithExpectedResult(post, true);
    });

    it(`Can publish a post with markdown image in content (noImages only checks link field)`, async () => {
        const post = await generateMockPost(subplebbit.address, remotePlebbit, false, {
            content: "Here is an image: ![alt](https://example.com/image.png)"
        });
        await publishWithExpectedResult(post, true);
    });
});

describe.concurrent(`subplebbit.features.noVideos`, async () => {
    let plebbit: Plebbit;
    let remotePlebbit: Plebbit;
    let subplebbit: LocalSubplebbit | RpcLocalSubplebbit;
    let publishedPost: Comment;

    beforeAll(async () => {
        plebbit = await mockPlebbit();
        remotePlebbit = await mockPlebbitNoDataPathWithOnlyKuboClient();
        subplebbit = await createSubWithNoChallenge({}, plebbit);
        await subplebbit.start();
        await resolveWhenConditionIsTrue({ toUpdate: subplebbit, predicate: async () => typeof subplebbit.updatedAt === "number" });

        // Publish a post first (before enabling the feature)
        publishedPost = await publishRandomPost(subplebbit.address, remotePlebbit);
    });

    afterAll(async () => {
        await subplebbit.delete();
        await plebbit.destroy();
        await remotePlebbit.destroy();
    });

    it.sequential(`Feature is updated correctly in props`, async () => {
        expect(subplebbit.features).to.be.undefined;
        await subplebbit.edit({ features: { ...subplebbit.features, noVideos: true } });
        expect(subplebbit.features?.noVideos).to.be.true;

        const remoteSub = await remotePlebbit.getSubplebbit({ address: subplebbit.address });
        await remoteSub.update();
        await resolveWhenConditionIsTrue({ toUpdate: remoteSub, predicate: async () => remoteSub.features?.noVideos === true });
        expect(remoteSub.features?.noVideos).to.be.true;
        await remoteSub.stop();
    });

    it(`Can't publish a post with video link`, async () => {
        const post = await generateMockPost(subplebbit.address, remotePlebbit, false, {
            link: "https://example.com/video.mp4",
            content: "Just text"
        });
        await publishWithExpectedResult(post, false, messages.ERR_COMMENT_HAS_LINK_THAT_IS_VIDEO);
    });

    it(`Can't publish a reply with video link`, async () => {
        const reply = await generateMockComment(publishedPost as CommentIpfsWithCidDefined, remotePlebbit, false, {
            link: "https://example.com/movie.webm"
        });
        await publishWithExpectedResult(reply, false, messages.ERR_COMMENT_HAS_LINK_THAT_IS_VIDEO);
    });

    it(`Can publish a post with image link (noVideos doesn't block images)`, async () => {
        const post = await generateMockPost(subplebbit.address, remotePlebbit, false, {
            link: "https://example.com/image.png",
            content: "Just text"
        });
        await publishWithExpectedResult(post, true);
    });

    it(`Can publish a post with plain content (no link)`, async () => {
        const post = await generateMockPost(subplebbit.address, remotePlebbit, false, {
            content: "Just plain text"
        });
        await publishWithExpectedResult(post, true);
    });
});

describe.concurrent(`subplebbit.features.noSpoilers`, async () => {
    let plebbit: Plebbit;
    let remotePlebbit: Plebbit;
    let subplebbit: LocalSubplebbit | RpcLocalSubplebbit;
    let publishedPost: Comment;

    beforeAll(async () => {
        plebbit = await mockPlebbit();
        remotePlebbit = await mockPlebbitNoDataPathWithOnlyKuboClient();
        subplebbit = await createSubWithNoChallenge({}, plebbit);
        await subplebbit.start();
        await resolveWhenConditionIsTrue({ toUpdate: subplebbit, predicate: async () => typeof subplebbit.updatedAt === "number" });

        // Publish a post first (before enabling the feature)
        publishedPost = await publishRandomPost(subplebbit.address, remotePlebbit);
    });

    afterAll(async () => {
        await subplebbit.delete();
        await plebbit.destroy();
        await remotePlebbit.destroy();
    });

    it.sequential(`Feature is updated correctly in props`, async () => {
        expect(subplebbit.features).to.be.undefined;
        await subplebbit.edit({ features: { ...subplebbit.features, noSpoilers: true } });
        expect(subplebbit.features?.noSpoilers).to.be.true;

        const remoteSub = await remotePlebbit.getSubplebbit({ address: subplebbit.address });
        await remoteSub.update();
        await resolveWhenConditionIsTrue({ toUpdate: remoteSub, predicate: async () => remoteSub.features?.noSpoilers === true });
        expect(remoteSub.features?.noSpoilers).to.be.true;
        await remoteSub.stop();
    });

    it(`Can't publish a post with spoiler=true`, async () => {
        const post = await generateMockPost(subplebbit.address, remotePlebbit, false, {
            content: "Spoiler content",
            spoiler: true
        });
        await publishWithExpectedResult(post, false, messages.ERR_COMMENT_HAS_SPOILER_ENABLED);
    });

    it(`Can't publish a reply with spoiler=true`, async () => {
        const reply = await generateMockComment(publishedPost as CommentIpfsWithCidDefined, remotePlebbit, false, {
            content: "Spoiler reply",
            spoiler: true
        });
        await publishWithExpectedResult(reply, false, messages.ERR_COMMENT_HAS_SPOILER_ENABLED);
    });

    it(`Can publish a post without spoiler`, async () => {
        const post = await generateMockPost(subplebbit.address, remotePlebbit, false, {
            content: "Normal content"
        });
        await publishWithExpectedResult(post, true);
    });

    it(`Can publish a post with spoiler=false`, async () => {
        const post = await generateMockPost(subplebbit.address, remotePlebbit, false, {
            content: "Normal content",
            spoiler: false
        });
        await publishWithExpectedResult(post, true);
    });

    it(`Can't edit a comment to set spoiler=true`, async () => {
        const commentEdit = await remotePlebbit.createCommentEdit({
            commentCid: publishedPost.cid!,
            spoiler: true,
            subplebbitAddress: subplebbit.address,
            signer: publishedPost.signer
        });
        await publishWithExpectedResult(commentEdit, false, messages.ERR_COMMENT_HAS_SPOILER_ENABLED);
    });
});

describe.concurrent(`subplebbit.features.noImageReplies`, async () => {
    let plebbit: Plebbit;
    let remotePlebbit: Plebbit;
    let subplebbit: LocalSubplebbit | RpcLocalSubplebbit;
    let publishedPost: Comment;

    beforeAll(async () => {
        plebbit = await mockPlebbit();
        remotePlebbit = await mockPlebbitNoDataPathWithOnlyKuboClient();
        subplebbit = await createSubWithNoChallenge({}, plebbit);
        await subplebbit.start();
        await resolveWhenConditionIsTrue({ toUpdate: subplebbit, predicate: async () => typeof subplebbit.updatedAt === "number" });

        // Publish a post first (before enabling the feature)
        publishedPost = await publishRandomPost(subplebbit.address, remotePlebbit);
    });

    afterAll(async () => {
        await subplebbit.delete();
        await plebbit.destroy();
        await remotePlebbit.destroy();
    });

    it.sequential(`Feature is updated correctly in props`, async () => {
        expect(subplebbit.features).to.be.undefined;
        await subplebbit.edit({ features: { ...subplebbit.features, noImageReplies: true } });
        expect(subplebbit.features?.noImageReplies).to.be.true;

        const remoteSub = await remotePlebbit.getSubplebbit({ address: subplebbit.address });
        await remoteSub.update();
        await resolveWhenConditionIsTrue({ toUpdate: remoteSub, predicate: async () => remoteSub.features?.noImageReplies === true });
        expect(remoteSub.features?.noImageReplies).to.be.true;
        await remoteSub.stop();
    });

    it(`Can publish a post with image link (noImageReplies only blocks replies)`, async () => {
        const post = await generateMockPost(subplebbit.address, remotePlebbit, false, {
            link: "https://example.com/image.png",
            content: "Just text"
        });
        await publishWithExpectedResult(post, true);
    });

    it(`Can't publish a reply with image link`, async () => {
        const reply = await generateMockComment(publishedPost as CommentIpfsWithCidDefined, remotePlebbit, false, {
            link: "https://example.com/photo.jpg"
        });
        await publishWithExpectedResult(reply, false, messages.ERR_REPLY_HAS_LINK_THAT_IS_IMAGE);
    });

    it(`Can publish a reply without image link`, async () => {
        const reply = await generateMockComment(publishedPost as CommentIpfsWithCidDefined, remotePlebbit, false, {
            content: "Just text reply"
        });
        await publishWithExpectedResult(reply, true);
    });

    it(`Can publish a reply with video link (noImageReplies doesn't block videos)`, async () => {
        const reply = await generateMockComment(publishedPost as CommentIpfsWithCidDefined, remotePlebbit, false, {
            link: "https://example.com/video.mp4"
        });
        await publishWithExpectedResult(reply, true);
    });
});

describe.concurrent(`subplebbit.features.noVideoReplies`, async () => {
    let plebbit: Plebbit;
    let remotePlebbit: Plebbit;
    let subplebbit: LocalSubplebbit | RpcLocalSubplebbit;
    let publishedPost: Comment;

    beforeAll(async () => {
        plebbit = await mockPlebbit();
        remotePlebbit = await mockPlebbitNoDataPathWithOnlyKuboClient();
        subplebbit = await createSubWithNoChallenge({}, plebbit);
        await subplebbit.start();
        await resolveWhenConditionIsTrue({ toUpdate: subplebbit, predicate: async () => typeof subplebbit.updatedAt === "number" });

        // Publish a post first (before enabling the feature)
        publishedPost = await publishRandomPost(subplebbit.address, remotePlebbit);
    });

    afterAll(async () => {
        await subplebbit.delete();
        await plebbit.destroy();
        await remotePlebbit.destroy();
    });

    it.sequential(`Feature is updated correctly in props`, async () => {
        expect(subplebbit.features).to.be.undefined;
        await subplebbit.edit({ features: { ...subplebbit.features, noVideoReplies: true } });
        expect(subplebbit.features?.noVideoReplies).to.be.true;

        const remoteSub = await remotePlebbit.getSubplebbit({ address: subplebbit.address });
        await remoteSub.update();
        await resolveWhenConditionIsTrue({ toUpdate: remoteSub, predicate: async () => remoteSub.features?.noVideoReplies === true });
        expect(remoteSub.features?.noVideoReplies).to.be.true;
        await remoteSub.stop();
    });

    it(`Can publish a post with video link (noVideoReplies only blocks replies)`, async () => {
        const post = await generateMockPost(subplebbit.address, remotePlebbit, false, {
            link: "https://example.com/video.mp4",
            content: "Just text"
        });
        await publishWithExpectedResult(post, true);
    });

    it(`Can't publish a reply with video link`, async () => {
        const reply = await generateMockComment(publishedPost as CommentIpfsWithCidDefined, remotePlebbit, false, {
            link: "https://example.com/movie.webm"
        });
        await publishWithExpectedResult(reply, false, messages.ERR_REPLY_HAS_LINK_THAT_IS_VIDEO);
    });

    it(`Can publish a reply without video link`, async () => {
        const reply = await generateMockComment(publishedPost as CommentIpfsWithCidDefined, remotePlebbit, false, {
            content: "Just text reply"
        });
        await publishWithExpectedResult(reply, true);
    });

    it(`Can publish a reply with image link (noVideoReplies doesn't block images)`, async () => {
        const reply = await generateMockComment(publishedPost as CommentIpfsWithCidDefined, remotePlebbit, false, {
            link: "https://example.com/image.png"
        });
        await publishWithExpectedResult(reply, true);
    });
});

describe.concurrent(`subplebbit.features.noSpoilerReplies`, async () => {
    let plebbit: Plebbit;
    let remotePlebbit: Plebbit;
    let subplebbit: LocalSubplebbit | RpcLocalSubplebbit;
    let publishedPost: Comment;
    let publishedReply: Comment;

    beforeAll(async () => {
        plebbit = await mockPlebbit();
        remotePlebbit = await mockPlebbitNoDataPathWithOnlyKuboClient();
        subplebbit = await createSubWithNoChallenge({}, plebbit);
        await subplebbit.start();
        await resolveWhenConditionIsTrue({ toUpdate: subplebbit, predicate: async () => typeof subplebbit.updatedAt === "number" });

        // Publish a post and a reply first (before enabling the feature)
        publishedPost = await publishRandomPost(subplebbit.address, remotePlebbit);
        publishedReply = await publishRandomReply(publishedPost as CommentIpfsWithCidDefined, remotePlebbit);
    });

    afterAll(async () => {
        await subplebbit.delete();
        await plebbit.destroy();
        await remotePlebbit.destroy();
    });

    it.sequential(`Feature is updated correctly in props`, async () => {
        expect(subplebbit.features).to.be.undefined;
        await subplebbit.edit({ features: { ...subplebbit.features, noSpoilerReplies: true } });
        expect(subplebbit.features?.noSpoilerReplies).to.be.true;

        const remoteSub = await remotePlebbit.getSubplebbit({ address: subplebbit.address });
        await remoteSub.update();
        await resolveWhenConditionIsTrue({ toUpdate: remoteSub, predicate: async () => remoteSub.features?.noSpoilerReplies === true });
        expect(remoteSub.features?.noSpoilerReplies).to.be.true;
        await remoteSub.stop();
    });

    it(`Can publish a post with spoiler=true (noSpoilerReplies only blocks replies)`, async () => {
        const post = await generateMockPost(subplebbit.address, remotePlebbit, false, {
            content: "Spoiler content",
            spoiler: true
        });
        await publishWithExpectedResult(post, true);
    });

    it(`Can't publish a reply with spoiler=true`, async () => {
        const reply = await generateMockComment(publishedPost as CommentIpfsWithCidDefined, remotePlebbit, false, {
            content: "Spoiler reply",
            spoiler: true
        });
        await publishWithExpectedResult(reply, false, messages.ERR_REPLY_HAS_SPOILER_ENABLED);
    });

    it(`Can publish a reply without spoiler`, async () => {
        const reply = await generateMockComment(publishedPost as CommentIpfsWithCidDefined, remotePlebbit, false, {
            content: "Normal reply"
        });
        await publishWithExpectedResult(reply, true);
    });

    it(`Can't edit a reply to set spoiler=true`, async () => {
        const commentEdit = await remotePlebbit.createCommentEdit({
            commentCid: publishedReply.cid!,
            spoiler: true,
            subplebbitAddress: subplebbit.address,
            signer: publishedReply.signer
        });
        await publishWithExpectedResult(commentEdit, false, messages.ERR_REPLY_HAS_SPOILER_ENABLED);
    });

    it(`Can edit a post to set spoiler=true (noSpoilerReplies doesn't affect posts)`, async () => {
        const commentEdit = await remotePlebbit.createCommentEdit({
            commentCid: publishedPost.cid!,
            spoiler: true,
            subplebbitAddress: subplebbit.address,
            signer: publishedPost.signer
        });
        await publishWithExpectedResult(commentEdit, true);
    });
});
