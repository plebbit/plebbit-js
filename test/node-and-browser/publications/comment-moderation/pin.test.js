import signers from "../../../fixtures/signers.js";
import {
    publishRandomPost,
    publishWithExpectedResult,
    loadAllPages,
    iterateThroughPagesToFindCommentInParentPagesInstance,
    publishRandomReply,
    waitTillPostInSubplebbitInstancePages,
    resolveWhenConditionIsTrue,
    getRemotePlebbitConfigs
} from "../../../../dist/node/test/test-util.js";
import { expect } from "chai";
import { messages } from "../../../../dist/node/errors.js";
import * as remeda from "remeda";
import { POSTS_SORT_TYPES, REPLIES_SORT_TYPES } from "../../../../dist/node/pages/util.js";

const subplebbitAddress = "plebbit.eth";
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
                    await plebbit.createCommentModeration({
                        subplebbitAddress: comment.subplebbitAddress,
                        commentCid: comment.cid,
                        commentModeration: { pinned: false },
                        signer: roles[2].signer
                    }),
                    true
                )
            )
    );
};

getRemotePlebbitConfigs().map((config) => {
    describe(`Pinning posts - ${config.name}`, async () => {
        let plebbit, postToPin, secondPostToPin, sub;

        const populateSub = async (subplebbit) => {
            const subplebbitPage = subplebbit.posts.pageCids.new
                ? await subplebbit.posts.getPage(subplebbit.posts.pageCids.new)
                : subplebbit.posts.pages.hot;
            if (subplebbitPage.comments.length < 10) {
                await Promise.all(
                    new Array(5).fill(null).map(async (x) => {
                        const post = await publishRandomPost(subplebbit.address, plebbit);
                        await waitTillPostInSubplebbitInstancePages(post, subplebbit);
                        return post;
                    })
                );
            }
        };
        before(async () => {
            plebbit = await config.plebbitInstancePromise();
            sub = await plebbit.getSubplebbit(subplebbitAddress);
            await populateSub(sub);
            await sub.update();

            postToPin = await publishRandomPost(subplebbitAddress, plebbit, { timestamp: Math.round(Date.now() / 1000) - 110 });
            secondPostToPin = await publishRandomPost(subplebbitAddress, plebbit, { timestamp: Math.round(Date.now() / 1000) - 100 });

            await postToPin.update();
            await secondPostToPin.update();
            await waitTillPostInSubplebbitInstancePages(secondPostToPin, sub);
            const firstPage = sub.posts.pageCids.new ? await sub.posts.getPage(sub.posts.pageCids.new) : sub.posts.pages.hot;
            const posts = firstPage.comments;
            await removeAllPins(posts, plebbit);
            // wait until all posts are unpinned
            await resolveWhenConditionIsTrue(sub, async () => {
                const firstPage = sub.posts.pageCids.new ? await sub.posts.getPage(sub.posts.pageCids.new) : sub.posts.pages.hot;
                const posts = firstPage.comments;
                return posts.every((comment) => !comment.pinned);
            });
        });

        after(async () => {
            await postToPin.stop();
            await secondPostToPin.stop();
            await sub.stop();
            await plebbit.destroy();
        });

        it(`Author can't pin their own post`, async () => {
            const pinEdit = await plebbit.createCommentModeration({
                subplebbitAddress: postToPin.subplebbitAddress,
                commentCid: postToPin.cid,
                commentModeration: { reason: "To pin a post", pinned: true },
                signer: postToPin.signer
            });
            await publishWithExpectedResult(pinEdit, false, messages.ERR_COMMENT_MODERATION_ATTEMPTED_WITHOUT_BEING_MODERATOR);
        });
        it(`Regular author can't pin another author comment`, async () => {
            const pinEdit = await plebbit.createCommentModeration({
                subplebbitAddress: postToPin.subplebbitAddress,
                commentCid: postToPin.cid,
                commentModeration: { reason: "To pin a post", pinned: true },
                signer: await plebbit.createSigner()
            });
            await publishWithExpectedResult(pinEdit, false, messages.ERR_COMMENT_MODERATION_ATTEMPTED_WITHOUT_BEING_MODERATOR);
        });

        it(`Mod can pin a post`, async () => {
            const pinEdit = await plebbit.createCommentModeration({
                subplebbitAddress: postToPin.subplebbitAddress,
                commentCid: postToPin.cid,
                commentModeration: { reason: "To pin a post", pinned: true },
                signer: roles[2].signer
            });
            await publishWithExpectedResult(pinEdit, true);
        });
        it(`A new CommentUpdate is published with pinned=true`, async () => {
            await resolveWhenConditionIsTrue(postToPin, () => postToPin.pinned === true);
            expect(postToPin.pinned).to.be.true;
            expect(postToPin._rawCommentUpdate.pinned).to.be.true;
            expect(postToPin._rawCommentUpdate.edit).to.be.undefined;
            expect(postToPin.reason).to.equal("To pin a post");
            expect(postToPin._rawCommentUpdate.reason).to.equal("To pin a post");
        });

        it(`pinned=true appears in pages of subplebbit`, async () => {
            const sub = await plebbit.getSubplebbit(postToPin.subplebbitAddress);
            const commentInPage = await iterateThroughPagesToFindCommentInParentPagesInstance(postToPin.cid, sub.posts);
            expect(commentInPage.pinned).to.be.true;
        });
        it(`A pinned post is on the top of every page in subplebbit.posts`, async () => {
            const sub = await plebbit.createSubplebbit({ address: subplebbitAddress });
            await sub.update();

            await resolveWhenConditionIsTrue(sub, async () => {
                const postInPage = await iterateThroughPagesToFindCommentInParentPagesInstance(postToPin.cid, sub.posts);
                return postInPage?.pinned;
            });

            expect(Object.keys(sub.posts.pageCids).every((key) => Object.keys(POSTS_SORT_TYPES).includes(key))).to.be.true; // Should include pages with timeframes
            await sub.stop();
            for (const [sortName, pageCid] of Object.entries(sub.posts.pageCids)) {
                const pageComments = (await sub.posts.getPage(pageCid)).comments; // Get 50 comments, pinned posts should always be on top
                const postInPage = pageComments.find((comment) => comment.cid === postToPin.cid);
                expect(postInPage).to.exist;
                expect(postInPage.pinned).to.be.true;
                expect(postInPage.reason).to.equal("To pin a post");
                for (let i = 0; i < pageComments.length - 1; i++)
                    if (!pageComments[i].pinned && pageComments[i + 1].pinned) expect.fail("Pinned posts should always be on top");
            }
        });

        it(`Mod can pin another post`, async () => {
            const pinEdit = await plebbit.createCommentModeration({
                subplebbitAddress: secondPostToPin.subplebbitAddress,
                commentCid: secondPostToPin.cid,
                commentModeration: { reason: "To pin the second post", pinned: true },
                signer: roles[2].signer
            });
            await publishWithExpectedResult(pinEdit, true);
        });
        it(`Pinned posts are sorted according to the page sort they're in`, async () => {
            // We're gonna test whether posts.new has pinned posts on top
            // 'postToPin' should be the first on the list, since it's pinned and has a higher timestamp
            const sub = await plebbit.createSubplebbit({ address: subplebbitAddress });
            await sub.update();

            await resolveWhenConditionIsTrue(sub, async () => {
                const postInPage = await iterateThroughPagesToFindCommentInParentPagesInstance(secondPostToPin.cid, sub.posts);
                return postInPage?.pinned;
            });

            await sub.stop();
            for (const [sortName, pageCid] of Object.entries(sub.posts.pageCids)) {
                const pageComments = await loadAllPages(pageCid, sub.posts);
                const pinnedComments = pageComments.filter((comment) => comment.pinned);
                expect(pinnedComments.length).to.equal(2);
                const restOfComments = pageComments.filter((comment) => !comment.pinned);

                for (const comments of [pinnedComments, restOfComments]) {
                    for (let i = 0; i < comments.length - 1; i++) {
                        const [commentA, commentB] = comments.slice(i, i + 2);
                        const scoreFunc = POSTS_SORT_TYPES[sortName].score;

                        if (sortName !== "active") {
                            // Temporary. Active does not have a sorting function as of now
                            const [scoreA, scoreB] = [
                                scoreFunc({ comment: commentA, commentUpdate: commentA }),
                                scoreFunc({ comment: commentB, commentUpdate: commentB })
                            ];
                            expect(scoreA).to.be.greaterThanOrEqual(scoreB);
                        }
                    }
                }
            }
        });

        it(`Mod can unpin a post`, async () => {
            const pinEdit = await plebbit.createCommentModeration({
                subplebbitAddress: secondPostToPin.subplebbitAddress,
                commentCid: secondPostToPin.cid,
                commentModeration: { reason: "To unpin the second post", pinned: false },
                signer: roles[2].signer
            });
            await publishWithExpectedResult(pinEdit, true);
        });
        it(`A new CommentUpdate is published with pinned=false`, async () => {
            await resolveWhenConditionIsTrue(secondPostToPin, () => secondPostToPin.pinned === false);
            expect(secondPostToPin.pinned).to.be.false;
            expect(secondPostToPin._rawCommentUpdate.pinned).to.be.false;
            expect(secondPostToPin._rawCommentUpdate.edit).to.be.undefined;
            expect(secondPostToPin.reason).to.equal("To unpin the second post");
            expect(secondPostToPin._rawCommentUpdate.reason).to.equal("To unpin the second post");
        });

        it(`pinned=true appears in pages of subplebbit`, async () => {
            const sub = await plebbit.getSubplebbit(secondPostToPin.subplebbitAddress);
            const commentInPage = await iterateThroughPagesToFindCommentInParentPagesInstance(secondPostToPin.cid, sub.posts);
            expect(commentInPage.pinned).to.be.false;
        });
        it(`Unpinned posts is sorted like regular posts`, async () => {
            const sub = await plebbit.createSubplebbit({ address: subplebbitAddress });
            await sub.update();

            await resolveWhenConditionIsTrue(sub, async () => {
                const postInPage = await iterateThroughPagesToFindCommentInParentPagesInstance(secondPostToPin.cid, sub.posts);
                return !postInPage?.pinned;
            });

            await sub.stop();

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

                    if (sortName !== "active") {
                        // Temporary. Active does not have a sorting function as of now
                        const [scoreA, scoreB] = [
                            scoreFunc({ comment: commentA, commentUpdate: commentA }),
                            scoreFunc({ comment: commentB, commentUpdate: commentB })
                        ];
                        expect(scoreA).to.be.greaterThanOrEqual(scoreB);
                    }
                }
            }
        });
    });

    describe(`Pinning replies - ${config.name}`, async () => {
        let plebbit, post, replyToPin, sub;

        const populatePost = async () => {
            if (post.replyCount < 5) {
                await Promise.all(new Array(10).fill(null).map((x) => publishRandomReply(post, plebbit)));
                await resolveWhenConditionIsTrue(post, () => post.replyCount > 5);
            }
        };
        before(async () => {
            plebbit = await config.plebbitInstancePromise();
            sub = await plebbit.getSubplebbit(subplebbitAddress);

            const allPosts = sub.posts.pageCids.new ? await loadAllPages(sub.posts.pageCids.new, sub.posts) : sub.posts.pages.hot.comments;
            post = await plebbit.createComment(remeda.maxBy(allPosts, (c) => c.replyCount));
            await post.update();
            await populatePost();
            expect(post.replyCount).to.be.greaterThan(5); // Arbitary number
            replyToPin = await publishRandomReply(post, plebbit);
            await removeAllPins(
                post.replies.pageCids.topAll
                    ? await loadAllPages(post.replies.pageCids.topAll, post.replies)
                    : post.replies.pages.topAll.comments,
                plebbit
            );
        });

        after(async () => await plebbit.destroy());

        it(`Mod can pin reply`, async () => {
            const pinEdit = await plebbit.createCommentModeration({
                subplebbitAddress: replyToPin.subplebbitAddress,
                commentCid: replyToPin.cid,
                commentModeration: { reason: "To pin the reply", pinned: true },
                signer: roles[2].signer
            });
            await publishWithExpectedResult(pinEdit, true);
        });

        it(`A pinned reply is on the top of every page in parentComment.replies`, async () => {
            // Seems like all pages don't get updated at the same time, so will wait until all pages include the pinned post
            const postToRecreate = await plebbit.createComment({ cid: post.cid });

            await postToRecreate.update();

            await resolveWhenConditionIsTrue(postToRecreate, async () => {
                const replyInPage = await iterateThroughPagesToFindCommentInParentPagesInstance(replyToPin.cid, postToRecreate.replies);
                return replyInPage?.pinned;
            });

            await postToRecreate.stop();

            expect(Object.keys(postToRecreate.replies.pageCids).every((key) => Object.keys(REPLIES_SORT_TYPES).includes(key))).to.be.true; // Should include pages with timeframes
            for (const [sortName, pageCid] of Object.entries(postToRecreate.replies.pageCids)) {
                const pageComments = (await postToRecreate.replies.getPage(pageCid)).comments;
                const replyInPage = pageComments.find((comment) => comment.cid === replyToPin.cid);
                expect(replyInPage).to.exist;
                expect(replyInPage.pinned).to.be.true;
                expect(replyInPage.reason).to.equal("To pin the reply");
                for (let i = 0; i < pageComments.length - 1; i++)
                    if (!pageComments[i].pinned && pageComments[i + 1].pinned) expect.fail("Pinned replies should always be on top");
            }
        });

        it(`pinned=true appears in pages of parent comment`, async () => {
            const pinnedReplyInPage = await iterateThroughPagesToFindCommentInParentPagesInstance(replyToPin.cid, post.replies);
            expect(pinnedReplyInPage.pinned).to.be.true;
        });
    });
});
