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
    targetOnSecondReplyPage = false
}) {
    const postCid = `post-${Math.random().toString(16).slice(2)}`;
    const commentsChain = [];
    for (let i = 0; i <= depth; i++) {
        const cid = `${i === 0 ? "post" : "reply"}-${i}-${Math.random().toString(16).slice(2)}`;
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
        parent.commentUpdate.replies = await buildRepliesForParent(parent, child, targetOnSecondReplyPage && i === 0);
        commentInstances.set(parent.commentUpdate.cid, {
            cid: parent.commentUpdate.cid,
            replies: {
                getPage: async (cid) => {
                    const map = replyPagesByParent.get(parent.commentUpdate.cid) || {};
                    return map[cid];
                }
            }
        });
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
        if (targetOnSecondPostPage) {
            const secondPage = { comments: [postComment] };
            secondPageCid = await registerPostPage(secondPage);
        }
        const firstPage = targetOnSecondPostPage ? { comments: [], nextCid: secondPageCid } : { comments: [postComment] };
        postsPages = { hot: firstPage };
    } else {
        const firstPage = targetOnSecondPostPage ? { comments: [] } : { comments: [postComment] };
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
            getPage: async (cid) => postPagesByCid[cid]
        }
    };

    return { subplebbit, targetCid: targetComment.commentUpdate.cid };
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
});
