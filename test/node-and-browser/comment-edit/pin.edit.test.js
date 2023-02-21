const signers = require("../../fixtures/signers");
const {
    mockPlebbit,
    publishRandomPost,
    publishWithExpectedResult,
    loadAllPages,
    publishRandomReply
} = require("../../../dist/node/test/test-util");
const { expect } = require("chai");
const { messages } = require("../../../dist/node/errors");
const lodash = require("lodash");
const { default: waitUntil } = require("async-wait-until");
const { POSTS_SORT_TYPES, REPLIES_SORT_TYPES } = require("../../../dist/node/sort-handler");

const subplebbitAddress = signers[0].address;
const updateInterval = 300;
const roles = [
    { role: "owner", signer: signers[1] },
    { role: "admin", signer: signers[2] },
    { role: "mod", signer: signers[3] }
];

const removeAllPins = async (allComments, plebbit) => {
    // We need to remove all pins from previous tests session so it wouldn't interfere with the results of this test
    await Promise.all(
        allComments
            .filter((comment) => comment.pinned)
            .map(async (comment) =>
                publishWithExpectedResult(
                    await plebbit.createCommentEdit({
                        subplebbitAddress: comment.subplebbitAddress,
                        commentCid: comment.cid,
                        pinned: false,
                        signer: roles[2].signer
                    }),
                    true
                )
            )
    );
};
describe(`Pinning posts`, async () => {
    let plebbit, postToPin, secondPostToPin, sub;

    before(async () => {
        plebbit = await mockPlebbit();
        sub = await plebbit.getSubplebbit(subplebbitAddress);
        sub._updateIntervalMs = updateInterval;
        await sub.update();

        postToPin = await publishRandomPost(subplebbitAddress, plebbit, { timestamp: 1100 });
        secondPostToPin = await publishRandomPost(subplebbitAddress, plebbit, { timestamp: 1000 });

        await postToPin.update();
        await secondPostToPin.update();
        await removeAllPins(await loadAllPages(sub.posts.pageCids.new, sub.posts), plebbit);
    });

    after(async () => {
        await postToPin.stop();
        await secondPostToPin.stop();
        await sub.stop();
    });

    it(`Author can't pin their own post`, async () => {
        const pinEdit = await plebbit.createCommentEdit({
            subplebbitAddress: postToPin.subplebbitAddress,
            commentCid: postToPin.cid,
            reason: "To pin a post",
            pinned: true,
            signer: postToPin.signer
        });
        await publishWithExpectedResult(pinEdit, false, messages.ERR_SUB_COMMENT_EDIT_AUTHOR_INVALID_FIELD);
    });
    it(`Regular author can't pin another author comment`, async () => {
        const pinEdit = await plebbit.createCommentEdit({
            subplebbitAddress: postToPin.subplebbitAddress,
            commentCid: postToPin.cid,
            reason: "To pin a post",
            pinned: true,
            signer: await plebbit.createSigner()
        });
        await publishWithExpectedResult(pinEdit, false, messages.ERR_UNAUTHORIZED_COMMENT_EDIT);
    });

    it(`Mod can pin a post`, async () => {
        const pinEdit = await plebbit.createCommentEdit({
            subplebbitAddress: postToPin.subplebbitAddress,
            commentCid: postToPin.cid,
            reason: "To pin a post",
            pinned: true,
            signer: roles[2].signer
        });
        await publishWithExpectedResult(pinEdit, true);
    });
    it(`A new CommentUpdate is published with pinned=true`, async () => {
        await waitUntil(() => postToPin.pinned === true, { timeout: 200000 });
        expect(postToPin.pinned).to.be.true;
        expect(postToPin.reason).to.equal("To pin a post");
    });
    it(`A pinned post is on the top of every page in subplebbit.posts`, async () => {
        const sub = await plebbit.getSubplebbit(subplebbitAddress);
        sub._updateIntervalMs = updateInterval;
        await sub.update();

        // Seems like all pages don't get updated at the same time, so waitUntil will stop until all pages include the pinned post
        await waitUntil(
            async () => {
                const pageComments = await loadAllPages(sub.posts.pageCids.new, sub.posts);
                return pageComments.find((comment) => comment.cid === postToPin.cid)?.pinned;
            },
            {
                timeout: 300000,
                intervalBetweenAttempts: 100
            }
        );

        expect(Object.keys(sub.posts.pageCids).every((key) => Object.keys(POSTS_SORT_TYPES).includes(key))).to.be.true; // Should include pages with timeframes
        await sub.stop();
        for (const [sortName, pageCid] of Object.entries(sub.posts.pageCids)) {
            const pageComments = await loadAllPages(pageCid, sub.posts);
            const postInPage = pageComments.find((comment) => comment.cid === postToPin.cid);
            expect(postInPage).to.exist;
            expect(postInPage.pinned).to.be.true;
            expect(postInPage.reason).to.equal("To pin a post");
        }
    });

    it(`Mod can pin another post`, async () => {
        const pinEdit = await plebbit.createCommentEdit({
            subplebbitAddress: secondPostToPin.subplebbitAddress,
            commentCid: secondPostToPin.cid,
            reason: "To pin the second post",
            pinned: true,
            signer: roles[2].signer
        });
        await publishWithExpectedResult(pinEdit, true);
    });
    it(`Pinned posts are sorted according to the page sort they're in`, async () => {
        // We're gonna test whether posts.new has pinned posts on top
        // 'postToPin' should be the first on the list, since it's pinned and has a higher timestamp
        await waitUntil(
            async () => {
                const pageComments = await loadAllPages(sub.posts.pageCids.new, sub.posts);
                const postInPage = pageComments.find((comment) => comment.cid === secondPostToPin.cid);
                return postInPage.pinned;
            },
            {
                timeout: 300000,
                intervalBetweenAttempts: 200
            }
        );

        for (const [sortName, pageCid] of Object.entries(sub.posts.pageCids)) {
            const pageComments = await loadAllPages(pageCid, sub.posts);
            const pinnedComments = pageComments.filter((comment) => comment.pinned);
            expect(pinnedComments.length).to.equal(2);
            const restOfComments = pageComments.filter((comment) => !comment.pinned);

            for (const comments of [pinnedComments, restOfComments]) {
                for (let i = 0; i < comments.length - 1; i++) {
                    const [commentA, commentB] = comments.slice(i, i + 2);
                    const scoreFunc = POSTS_SORT_TYPES[sortName].score;

                    const [scoreA, scoreB] = [scoreFunc(commentA), scoreFunc(commentB)];
                    expect(scoreA).to.be.greaterThanOrEqual(scoreB);
                }
            }
        }
    });

    it(`Mod can unpin a post`, async () => {
        const pinEdit = await plebbit.createCommentEdit({
            subplebbitAddress: secondPostToPin.subplebbitAddress,
            commentCid: secondPostToPin.cid,
            reason: "To unpin the second post",
            pinned: false,
            signer: roles[2].signer
        });
        await publishWithExpectedResult(pinEdit, true);
    });
    it(`A new CommentUpdate is published with pinned=false`, async () => {
        await waitUntil(() => secondPostToPin.pinned === false && secondPostToPin.reason === "To unpin the second post", {
            timeout: 200000
        });
    });
    it(`Unpinned posts is sorted like regular posts`, async () => {
        await waitUntil(
            async () =>
                (
                    await loadAllPages(sub.posts.pageCids.new, sub.posts)
                ).some((comment) => comment.cid === secondPostToPin.cid && !comment.pinned),
            {
                timeout: 300000,
                intervalBetweenAttempts: 200
            }
        );

        for (const [sortName, pageCid] of Object.entries(sub.posts.pageCids)) {
            const pageComments = await loadAllPages(pageCid, sub.posts);
            expect(pageComments[0].cid).to.equal(postToPin.cid);
            expect(pageComments[0].pinned).to.be.true;
            expect(pageComments[0].reason).to.equal("To pin a post");

            if (!POSTS_SORT_TYPES[sortName].timeframe || POSTS_SORT_TYPES[sortName].timeframe === "ALL") {
                const secondPinnedPostInPage = pageComments.find((comment) => comment.cid === secondPostToPin.cid);
                // post may not be included in the page since it's not pinned anymore and can only be included if its timestamp matches the page timeframe
                expect(secondPinnedPostInPage).to.exist;
                expect(secondPinnedPostInPage.pinned).to.be.false;
                expect(secondPinnedPostInPage.reason).to.equal("To unpin the second post");
            }

            // Rest of comments should be sorted like regular page

            for (let i = 1; i < pageComments.length - 1; i++) {
                const [commentA, commentB] = [pageComments[i], pageComments[i + 1]];
                const scoreFunc = POSTS_SORT_TYPES[sortName].score;

                const [scoreA, scoreB] = [scoreFunc(commentA), scoreFunc(commentB)];
                expect(scoreA).to.be.greaterThanOrEqual(scoreB);
            }
        }
    });
});

describe(`Pinning replies`, async () => {
    let plebbit, post, replyToPin, sub;

    before(async () => {
        plebbit = await mockPlebbit();
        sub = await plebbit.getSubplebbit(subplebbitAddress);
        const allPosts = await loadAllPages(sub.posts.pageCids.new, sub.posts);
        post = await plebbit.createComment(lodash.maxBy(allPosts, (c) => c.replyCount));
        post._updateIntervalMs = updateInterval;
        await post.update();
        expect(post.replyCount).to.be.greaterThan(5); // Arbitary number
        replyToPin = await publishRandomReply(post, plebbit);
        await removeAllPins(await loadAllPages(post.replies.pageCids.topAll, post.replies), plebbit);
    });

    after(async () => post.stop());

    it(`Mod can pin reply`, async () => {
        const pinEdit = await plebbit.createCommentEdit({
            subplebbitAddress: replyToPin.subplebbitAddress,
            commentCid: replyToPin.cid,
            reason: "To pin the reply",
            pinned: true,
            signer: roles[2].signer
        });
        await publishWithExpectedResult(pinEdit, true);
    });

    it(`A pinned reply is on the top of every page in parentComment.replies`, async () => {
        // Seems like all pages don't get updated at the same time, so waitUntil will stop until all pages include the pinned post
        await waitUntil(
            async () => {
                return (await loadAllPages(post.replies.pageCids.topAll, post.replies)).some(
                    (comment) => comment.cid === replyToPin.cid && comment.pinned
                );
            },
            {
                timeout: 300000,
                intervalBetweenAttempts: 100
            }
        );

        expect(Object.keys(post.replies.pageCids).every((key) => Object.keys(REPLIES_SORT_TYPES).includes(key))).to.be.true; // Should include pages with timeframes
        for (const [sortName, pageCid] of Object.entries(post.replies.pageCids)) {
            const pageComments = await loadAllPages(pageCid, post.replies);
            const replyInPage = pageComments.find((comment) => comment.cid === replyToPin.cid);
            expect(replyInPage).to.exist;
            expect(replyInPage.pinned).to.be.true;
            expect(replyInPage.reason).to.equal("To pin the reply");
        }
    });
});
