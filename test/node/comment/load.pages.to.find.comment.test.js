import { expect } from "chai";
import { describe, it } from "vitest";
import { addStringToIpfs } from "../../../dist/node/test/test-util.js";
import { loadAllPagesUnderSubplebbitToFindComment } from "../../../src/publications/comment/comment-util.js";

const REPLY_DEPTHS = [1, 2, 3, 5, 10, 15];

const makeComment = ({ cid, depth, postCid, parentCid }) => ({
    comment: {
        cid,
        depth,
        parentCid,
        postCid,
        subplebbitAddress: "s/test",
        signature: {},
        author: { address: "author" }
    },
    commentUpdate: {
        cid,
        updatedAt: depth,
        replies: undefined
    }
});

async function createTestContext({
    depth,
    postsStorage,
    repliesStorage = "pages",
    targetOnSecondPostPage = false,
    targetOnSecondReplyPage = false,
    extraPosts = 0
}) {
    const counters = { postPageCalls: 0, replyPageCalls: 0, postPageCids: [], replyPageParents: [] };
    const postCid = `post-${Math.random().toString(16).slice(2)}`;
    const commentsChain = [];
    for (let i = 0; i <= depth; i++) {
        const cid = i === 0 ? postCid : `reply-${i}-${Math.random().toString(16).slice(2)}`;
        commentsChain.push(
            makeComment({ cid, depth: i, postCid, parentCid: i === 0 ? undefined : commentsChain[i - 1].commentUpdate.cid })
        );
    }
    const targetComment = commentsChain[depth];

    const postPagesByCid = {};
    const replyPagesByParent = new Map();
    const commentInstances = new Map();

    const registerReplyPage = async (parentCid, page) => {
        const cid = await addStringToIpfs(JSON.stringify(page));
        const pagesForParent = replyPagesByParent.get(parentCid) || {};
        pagesForParent[cid] = page;
        replyPagesByParent.set(parentCid, pagesForParent);
        return cid;
    };

    const buildRepliesForParent = async (parentComment, childComment, useSecondPage) => {
        const parentCid = parentComment.commentUpdate.cid;
        if (repliesStorage === "pages") {
            let secondPageCid;
            if (useSecondPage) {
                const secondPage = { comments: [childComment] };
                secondPageCid = await registerReplyPage(parentCid, secondPage);
            }
            const firstPage = useSecondPage ? { comments: [], nextCid: secondPageCid } : { comments: [childComment] };
            if (secondPageCid) replyPagesByParent.get(parentCid)[secondPageCid] = replyPagesByParent.get(parentCid)[secondPageCid];
            return { pages: { best: firstPage } };
        } else {
            const firstPage = useSecondPage ? { comments: [] } : { comments: [childComment] };
            const firstPageCid = await registerReplyPage(parentCid, firstPage);
            if (useSecondPage) {
                const secondPage = { comments: [childComment] };
                const secondPageCid = await registerReplyPage(parentCid, secondPage);
                firstPage.nextCid = secondPageCid;
            }
            return { pageCids: { best: firstPageCid } };
        }
    };

    for (let i = 0; i < depth; i++) {
        const parent = commentsChain[i];
        const child = commentsChain[i + 1];
        const replies = await buildRepliesForParent(parent, child, targetOnSecondReplyPage && i === 0);
        parent.commentUpdate.replies = replies;
        commentInstances.set(parent.commentUpdate.cid, {
            cid: parent.commentUpdate.cid,
            replies: {
                ...replies,
                getPage: async (cid) => {
                    counters.replyPageCalls++;
                    counters.replyPageParents.push(parent.commentUpdate.cid);
                    const map = replyPagesByParent.get(parent.commentUpdate.cid) || {};
                    return map[cid];
                }
            }
        });
    }

    const extraPostsComments = [];
    for (let i = 0; i < extraPosts; i++) {
        const extraPostCid = `post-extra-${i}-${Math.random().toString(16).slice(2)}`;
        const extraPost = makeComment({ cid: extraPostCid, depth: 0, postCid: extraPostCid, parentCid: undefined });
        const extraReply = makeComment({
            cid: `reply-extra-${i}-${Math.random().toString(16).slice(2)}`,
            depth: 1,
            postCid: extraPostCid,
            parentCid: extraPostCid
        });
        const replies = await buildRepliesForParent(extraPost, extraReply, false);
        extraPost.commentUpdate.replies = replies;
        commentInstances.set(extraPost.commentUpdate.cid, {
            cid: extraPost.commentUpdate.cid,
            replies: {
                ...replies,
                getPage: async (cid) => {
                    counters.replyPageCalls++;
                    counters.replyPageParents.push(extraPostCid);
                    const map = replyPagesByParent.get(extraPost.commentUpdate.cid) || {};
                    return map[cid];
                }
            }
        });
        extraPostsComments.push(extraPost);
    }

    const registerPostPage = async (page) => {
        const cid = await addStringToIpfs(JSON.stringify(page));
        postPagesByCid[cid] = page;
        return cid;
    };

    const postComment = commentsChain[0];
    let postsPages = {};
    let postsPageCids = {};
    if (postsStorage === "pages") {
        let secondPageCid;
        const firstPageComments = targetOnSecondPostPage ? extraPostsComments : [postComment, ...extraPostsComments];
        if (targetOnSecondPostPage) {
            const secondPage = { comments: [postComment] };
            secondPageCid = await registerPostPage(secondPage);
        }
        const firstPage = targetOnSecondPostPage
            ? { comments: firstPageComments, nextCid: secondPageCid }
            : { comments: firstPageComments };
        postsPages = { hot: firstPage };
    } else {
        const firstPage = targetOnSecondPostPage
            ? { comments: [...extraPostsComments] }
            : { comments: [postComment, ...extraPostsComments] };
        const firstPageCid = await registerPostPage(firstPage);
        if (targetOnSecondPostPage) {
            const secondPage = { comments: [postComment] };
            const secondPageCid = await registerPostPage(secondPage);
            firstPage.nextCid = secondPageCid;
            postPagesByCid[firstPageCid] = firstPage;
        }
        postsPageCids = { new: firstPageCid };
    }

    const plebbitMock = {
        getComment: async (cid) => {
            const instance = commentInstances.get(cid);
            if (!instance) throw Error(`Mocked comment instance for ${cid} not found`);
            return instance;
        }
    };

    const subplebbit = {
        address: "s/test",
        _plebbit: plebbitMock,
        posts: {
            pages: postsPages,
            pageCids: postsPageCids,
            getPage: async (cid) => {
                counters.postPageCalls++;
                counters.postPageCids.push(cid);
                return postPagesByCid[cid];
            }
        }
    };

    return {
        subplebbit,
        targetCid: targetComment.commentUpdate.cid,
        postCid,
        parentCid: depth > 0 ? commentsChain[depth - 1].commentUpdate.cid : undefined,
        counters,
        extraPostCids: extraPostsComments.map((post) => post.commentUpdate.cid)
    };
}

describe.sequential("loadAllPagesUnderSubplebbitToFindComment", () => {
    describe("posts from preloaded pages", () => {
        it("finds post on the first page", async () => {
            const { subplebbit, targetCid } = await createTestContext({ depth: 0, postsStorage: "pages" });
            const found = await loadAllPagesUnderSubplebbitToFindComment({ commentCidToFind: targetCid, subplebbit });
            expect(found?.commentUpdate.cid).to.equal(targetCid);
        });

        it("finds post on the second page", async () => {
            const { subplebbit, targetCid } = await createTestContext({ depth: 0, postsStorage: "pages", targetOnSecondPostPage: true });
            const found = await loadAllPagesUnderSubplebbitToFindComment({ commentCidToFind: targetCid, subplebbit });
            expect(found?.commentUpdate.cid).to.equal(targetCid);
        });
    });

    describe("posts from pageCids", () => {
        it("finds post on the first page", async () => {
            const { subplebbit, targetCid } = await createTestContext({ depth: 0, postsStorage: "pageCids" });
            const found = await loadAllPagesUnderSubplebbitToFindComment({ commentCidToFind: targetCid, subplebbit });
            expect(found?.commentUpdate.cid).to.equal(targetCid);
        });

        it("finds post on the second page", async () => {
            const { subplebbit, targetCid } = await createTestContext({ depth: 0, postsStorage: "pageCids", targetOnSecondPostPage: true });
            const found = await loadAllPagesUnderSubplebbitToFindComment({ commentCidToFind: targetCid, subplebbit });
            expect(found?.commentUpdate.cid).to.equal(targetCid);
        });
    });

    describe("replies under posts pages", () => {
        REPLY_DEPTHS.forEach((depth) => {
            it(`finds depth ${depth} reply on the first replies page`, async () => {
                const { subplebbit, targetCid } = await createTestContext({
                    depth,
                    postsStorage: "pages",
                    repliesStorage: "pages",
                    targetOnSecondReplyPage: false
                });
                const found = await loadAllPagesUnderSubplebbitToFindComment({ commentCidToFind: targetCid, subplebbit });
                expect(found?.commentUpdate.cid).to.equal(targetCid);
            });

            it(`finds depth ${depth} reply on the second replies page`, async () => {
                const { subplebbit, targetCid } = await createTestContext({
                    depth,
                    postsStorage: "pages",
                    repliesStorage: "pages",
                    targetOnSecondReplyPage: true
                });
                const found = await loadAllPagesUnderSubplebbitToFindComment({ commentCidToFind: targetCid, subplebbit });
                expect(found?.commentUpdate.cid).to.equal(targetCid);
            });
        });
    });

    describe("replies under posts pageCids", () => {
        REPLY_DEPTHS.forEach((depth) => {
            it(`finds depth ${depth} reply on the first replies page`, async () => {
                const { subplebbit, targetCid } = await createTestContext({
                    depth,
                    postsStorage: "pageCids",
                    repliesStorage: "pageCids",
                    targetOnSecondReplyPage: false
                });
                const found = await loadAllPagesUnderSubplebbitToFindComment({ commentCidToFind: targetCid, subplebbit });
                expect(found?.commentUpdate.cid).to.equal(targetCid);
            });

            it(`finds depth ${depth} reply on the second replies page`, async () => {
                const { subplebbit, targetCid } = await createTestContext({
                    depth,
                    postsStorage: "pageCids",
                    repliesStorage: "pageCids",
                    targetOnSecondReplyPage: true
                });
                const found = await loadAllPagesUnderSubplebbitToFindComment({ commentCidToFind: targetCid, subplebbit });
                expect(found?.commentUpdate.cid).to.equal(targetCid);
            });
        });
    });

    describe("optimizes with hints", () => {
        it("navigates directly under the parentCid when provided", async () => {
            const { subplebbit, targetCid, parentCid } = await createTestContext({
                depth: 2,
                postsStorage: "pageCids",
                repliesStorage: "pageCids",
                targetOnSecondReplyPage: true
            });
            const found = await loadAllPagesUnderSubplebbitToFindComment({ commentCidToFind: targetCid, subplebbit, parentCid });
            expect(found?.commentUpdate.cid).to.equal(targetCid);
        });

        it("locates post first when postCid is provided", async () => {
            const { subplebbit, targetCid, postCid } = await createTestContext({
                depth: 3,
                postsStorage: "pageCids",
                repliesStorage: "pageCids",
                targetOnSecondPostPage: true,
                targetOnSecondReplyPage: true
            });
            const found = await loadAllPagesUnderSubplebbitToFindComment({ commentCidToFind: targetCid, subplebbit, postCid });
            expect(found?.commentUpdate.cid).to.equal(targetCid);
        });

        it("uses fewer post page fetches when parentCid is provided", async () => {
            const ctxWithoutHint = await createTestContext({
                depth: 2,
                postsStorage: "pageCids",
                repliesStorage: "pageCids",
                targetOnSecondPostPage: true,
                targetOnSecondReplyPage: true,
                extraPosts: 2
            });
            await loadAllPagesUnderSubplebbitToFindComment({
                commentCidToFind: ctxWithoutHint.targetCid,
                subplebbit: ctxWithoutHint.subplebbit
            });

            const ctxWithParentHint = await createTestContext({
                depth: 2,
                postsStorage: "pageCids",
                repliesStorage: "pageCids",
                targetOnSecondPostPage: true,
                targetOnSecondReplyPage: true,
                extraPosts: 2
            });
            await loadAllPagesUnderSubplebbitToFindComment({
                commentCidToFind: ctxWithParentHint.targetCid,
                subplebbit: ctxWithParentHint.subplebbit,
                parentCid: ctxWithParentHint.parentCid
            });

            expect(ctxWithoutHint.counters.postPageCalls).to.be.greaterThan(0);
            expect(ctxWithParentHint.counters.postPageCalls).to.equal(0);
            expect(ctxWithParentHint.counters.replyPageCalls).to.be.at.most(ctxWithoutHint.counters.replyPageCalls);
        });

        it("skips unrelated replies when postCid is provided", async () => {
            const baseOpts = {
                depth: 2,
                postsStorage: "pageCids",
                repliesStorage: "pageCids",
                targetOnSecondPostPage: true,
                targetOnSecondReplyPage: true,
                extraPosts: 2
            };

            const ctxWithoutPostHint = await createTestContext(baseOpts);
            const foundWithoutHint = await loadAllPagesUnderSubplebbitToFindComment({
                commentCidToFind: ctxWithoutPostHint.targetCid,
                subplebbit: ctxWithoutPostHint.subplebbit
            });
            expect(foundWithoutHint?.commentUpdate.cid).to.equal(ctxWithoutPostHint.targetCid);

            const ctxWithPostHint = await createTestContext(baseOpts);
            const foundWithPostHint = await loadAllPagesUnderSubplebbitToFindComment({
                commentCidToFind: ctxWithPostHint.targetCid,
                subplebbit: ctxWithPostHint.subplebbit,
                postCid: ctxWithPostHint.postCid
            });
            expect(foundWithPostHint?.commentUpdate.cid).to.equal(ctxWithPostHint.targetCid);

            const sawExtraRepliesWithoutHint = ctxWithoutPostHint.counters.replyPageParents.some((parentCid) =>
                ctxWithoutPostHint.extraPostCids.includes(parentCid)
            );
            const sawExtraRepliesWithHint = ctxWithPostHint.counters.replyPageParents.some((parentCid) =>
                ctxWithPostHint.extraPostCids.includes(parentCid)
            );

            expect(sawExtraRepliesWithoutHint).to.equal(true);
            expect(sawExtraRepliesWithHint).to.equal(false);
            expect(ctxWithPostHint.counters.replyPageCalls).to.be.lessThan(ctxWithoutPostHint.counters.replyPageCalls);
            expect(ctxWithPostHint.counters.postPageCalls).to.be.greaterThan(0); // sanity check that traversal ran
        });
    });
});
