import signers from "../../fixtures/signers";
import {
    publishRandomPost,
    publishWithExpectedResult,
    loadAllPages,
    publishRandomReply,
    mockRemotePlebbit,
    findCommentInPage,
    resolveWhenConditionIsTrue
} from "../../../dist/node/test/test-util";
import { expect } from "chai";
import { messages } from "../../../dist/node/errors";
import lodash from "lodash";
import { POSTS_SORT_TYPES, REPLIES_SORT_TYPES } from "../../../dist/node/util";

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

    const populateSub = async (subplebbit) => {
        if (!subplebbit.posts.pageCids) {
            await Promise.all(new Array(5).fill(null).map((x) => publishRandomPost(subplebbit.address, plebbit, {}, false)));
            await new Promise((resolve) => subplebbit.once("update", resolve));
        }
    };
    before(async () => {
        plebbit = await mockRemotePlebbit();
        sub = await plebbit.getSubplebbit(subplebbitAddress);
        await sub.update();

        postToPin = await publishRandomPost(subplebbitAddress, plebbit, { timestamp: 1100 }, false);
        secondPostToPin = await publishRandomPost(subplebbitAddress, plebbit, { timestamp: 1000 }, false);

        await postToPin.update();
        await secondPostToPin.update();
        await populateSub(sub);
        const postsComments = (await sub.posts.getPage(sub.posts.pageCids.new)).comments;
        await removeAllPins(postsComments, plebbit);
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
        await resolveWhenConditionIsTrue(postToPin, () => postToPin.pinned === true);
        expect(postToPin.pinned).to.be.true;
        expect(postToPin._rawCommentUpdate.pinned).to.be.true;
        expect(postToPin._rawCommentUpdate.edit).to.be.undefined;
        expect(postToPin.reason).to.equal("To pin a post");
        expect(postToPin._rawCommentUpdate.reason).to.equal("To pin a post");
    });
    it(`A pinned post is on the top of every page in subplebbit.posts`, async () => {
        const sub = await plebbit.createSubplebbit({ address: subplebbitAddress });
        sub.update();

        await new Promise((resolve) =>
            sub.on("update", async () => {
                const postInPage = await findCommentInPage(postToPin.cid, sub.posts.pageCids.new, sub.posts);
                if (postInPage.pinned) resolve();
            })
        );

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
        const sub = await plebbit.createSubplebbit({ address: subplebbitAddress });
        sub.update();

        await new Promise((resolve) =>
            sub.on("update", async () => {
                const postInPage = await findCommentInPage(secondPostToPin.cid, sub.posts.pageCids.new, sub.posts);
                if (postInPage.pinned) resolve();
            })
        );

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
                            scoreFunc({ comment: commentA.toJSONIpfs(), update: commentA._rawCommentUpdate }),
                            scoreFunc({ comment: commentB.toJSONIpfs(), update: commentB._rawCommentUpdate })
                        ];
                        expect(scoreA).to.be.greaterThanOrEqual(scoreB);
                    }
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
        await resolveWhenConditionIsTrue(secondPostToPin, () => secondPostToPin.pinned === false);
        expect(secondPostToPin.pinned).to.be.false;
        expect(secondPostToPin._rawCommentUpdate.pinned).to.be.false;
        expect(secondPostToPin._rawCommentUpdate.edit).to.be.undefined;
        expect(secondPostToPin.reason).to.equal("To unpin the second post");
        expect(secondPostToPin._rawCommentUpdate.reason).to.equal("To unpin the second post");
    });
    it(`Unpinned posts is sorted like regular posts`, async () => {
        const sub = await plebbit.createSubplebbit({ address: subplebbitAddress });
        sub.update();

        await new Promise((resolve) =>
            sub.on("update", async () => {
                const postInPage = await findCommentInPage(secondPostToPin.cid, sub.posts.pageCids.new, sub.posts);
                if (!postInPage.pinned) resolve();
            })
        );
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
                        scoreFunc({ comment: commentA.toJSONIpfs(), update: commentA._rawCommentUpdate }),
                        scoreFunc({ comment: commentB.toJSONIpfs(), update: commentB._rawCommentUpdate })
                    ];
                    expect(scoreA).to.be.greaterThanOrEqual(scoreB);
                }
            }
        }
    });
});

describe(`Pinning replies`, async () => {
    let plebbit, post, replyToPin, sub;

    const populatePost = async () => {
        if (post.replyCount < 5) {
            await Promise.all(new Array(10).fill(null).map((x) => publishRandomReply(post, plebbit, {}, false)));
            await new Promise((resolve) =>
                post.on("update", () => {
                    if (post.replyCount > 5) resolve();
                })
            );
        }
    };
    before(async () => {
        plebbit = await mockRemotePlebbit();
        sub = await plebbit.getSubplebbit(subplebbitAddress);
        const allPosts = await loadAllPages(sub.posts.pageCids.new, sub.posts);
        post = await plebbit.createComment(lodash.maxBy(allPosts, (c) => c.replyCount));
        await post.update();
        await populatePost();
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
        // Seems like all pages don't get updated at the same time, so will wait until all pages include the pinned post
        const postToRecreate = await plebbit.createComment({ cid: post.cid });

        postToRecreate.update();

        await new Promise((resolve) =>
            postToRecreate.on("update", async () => {
                if (postToRecreate.replies?.pageCids) {
                    const replyInPage = await findCommentInPage(
                        replyToPin.cid,
                        postToRecreate.replies.pageCids.new,
                        postToRecreate.replies
                    );
                    if (replyInPage?.pinned) resolve();
                }
            })
        );

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
});
