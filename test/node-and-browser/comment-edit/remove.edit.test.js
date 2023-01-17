const signers = require("../../fixtures/signers");
const {
    publishRandomPost,
    publishRandomReply,
    mockPlebbit,
    generateMockComment,
    generateMockVote,
    publishWithExpectedResult,
    loadAllPages
} = require("../../../dist/node/test/test-util");
const { expect } = require("chai");
const { messages } = require("../../../dist/node/errors");
const { default: waitUntil } = require("async-wait-until");

const subplebbitAddress = signers[0].address;
const updateInterval = 300;
const roles = [
    { role: "owner", signer: signers[1] },
    { role: "admin", signer: signers[2] },
    { role: "mod", signer: signers[3] }
];

describe(`Removing post`, async () => {
    let plebbit, postToRemove, postReply;
    before(async () => {
        plebbit = await mockPlebbit();
        postToRemove = await publishRandomPost(subplebbitAddress, plebbit);
        postReply = await publishRandomReply(postToRemove, plebbit);
        await postToRemove.update();
    });
    after(async () => {
        postToRemove.stop();
    });

    it(`Author can't publish a Post with removed=true`);

    it(`Mod can mark a post as removed`, async () => {
        const removeEdit = await plebbit.createCommentEdit({
            subplebbitAddress: postToRemove.subplebbitAddress,
            commentCid: postToRemove.cid,
            moderatorReason: "To remove a post",
            removed: true,
            signer: roles[2].signer // Mod role
        });
        await publishWithExpectedResult(removeEdit, true);
    });

    it(`A new CommentUpdate is published with removed=true`, async () => {
        await new Promise((resolve) => postToRemove.once("update", resolve));
        expect(postToRemove.removed).to.be.true;
        expect(postToRemove.moderatorReason).to.equal("To remove a post");
    });
    it(`Removed post don't show in subplebbit.posts`, async () => {
        const sub = await plebbit.getSubplebbit(subplebbitAddress);
        const isPostInAnyPage = async () => {
            for (const pageCid of Object.values(sub.posts.pageCids)) {
                const pageComments = await loadAllPages(pageCid, sub.posts);
                const isPostInPage = pageComments.some((comment) => comment.cid === postToRemove.cid);
                if (isPostInPage) return true;
            }
            return false;
        };
        if (!(await isPostInAnyPage())) return;

        sub._updateIntervalMs = updateInterval;
        await sub.update();
        await new Promise((resolve) =>
            sub.on("update", async () => {
                if (!(await isPostInAnyPage())) resolve();
            })
        );
        sub.stop();
    });

    it(`Sub rejects votes on removed post`, async () => {
        const vote = await generateMockVote(postToRemove, 1, plebbit);
        await publishWithExpectedResult(vote, false, messages.ERR_SUB_PUBLICATION_PARENT_HAS_BEEN_REMOVED);
    });

    it(`Sub rejects replies on removed post`, async () => {
        const reply = await generateMockComment(postToRemove, plebbit);
        await publishWithExpectedResult(reply, false, messages.ERR_SUB_PUBLICATION_PARENT_HAS_BEEN_REMOVED);
    });

    it(`Sub rejects votes on a reply of a removed post`, async () => {
        const vote = await generateMockVote(postReply, 1, plebbit);
        await publishWithExpectedResult(vote, false, messages.ERR_SUB_PUBLICATION_POST_HAS_BEEN_REMOVED);
    });

    it(`Sub rejects replies on a reply of a removed post`, async () => {
        const reply = await generateMockComment(postReply, plebbit);
        await publishWithExpectedResult(reply, false, messages.ERR_SUB_PUBLICATION_POST_HAS_BEEN_REMOVED);
    });

    it(`Author of post can't remove it`, async () => {
        const postToBeRemoved = await publishRandomPost(subplebbitAddress, plebbit);
        const removeEdit = await plebbit.createCommentEdit({
            subplebbitAddress: postToBeRemoved.subplebbitAddress,
            commentCid: postToBeRemoved.cid,
            moderatorReason: "To remove a post" + Date.now(),
            removed: true,
            signer: postToBeRemoved.signer
        });
        await publishWithExpectedResult(removeEdit, false, messages.ERR_SUB_COMMENT_EDIT_AUTHOR_INVALID_FIELD);
    });

    it(`Mod can unremove a post`, async () => {
        const unremoveEdit = await plebbit.createCommentEdit({
            subplebbitAddress: postToRemove.subplebbitAddress,
            commentCid: postToRemove.cid,
            moderatorReason: "To unremove a post",
            removed: false,
            signer: roles[2].signer
        });
        await publishWithExpectedResult(unremoveEdit, true);
    });

    it(`A new CommentUpdate is published for unremoving a post`, async () => {
        await waitUntil(() => postToRemove.removed === false, { timeout: 200000 });
        expect(postToRemove.removed).to.be.false;
        expect(postToRemove.moderatorReason).to.equal("To unremove a post");
    });

    it(`Unremoved post in included in subplebbit.posts with removed=false`, async () => {
        const sub = await plebbit.getSubplebbit(subplebbitAddress);
        const isUnremovedInPage = async () => {
            const newComments = await loadAllPages(sub.posts.pageCids.new, sub.posts);
            return newComments.some((comment) => comment.cid === postToRemove.cid);
        };
        sub._updateIntervalMs = updateInterval;
        await sub.update();
        await waitUntil(isUnremovedInPage, { timeout: 200000 });
        await sub.stop();

        for (const pageCid of Object.values(sub.posts.pageCids)) {
            const pageComments = await loadAllPages(pageCid, sub.posts);
            const postInPage = pageComments.find((comment) => comment.cid === postToRemove.cid);
            expect(postInPage).to.exist;
            expect(postInPage.removed).to.equal(false);
            expect(postInPage.moderatorReason).to.equal("To unremove a post");
        }
    });
});

describe(`Removing reply`, async () => {
    let plebbit, post, replyToBeRemoved, replyUnderRemovedReply;
    before(async () => {
        plebbit = await mockPlebbit();
        post = await publishRandomPost(subplebbitAddress, plebbit);
        replyToBeRemoved = await publishRandomReply(post, plebbit);
        replyUnderRemovedReply = await publishRandomReply(replyToBeRemoved, plebbit);
        await Promise.all([replyToBeRemoved.update(), post.update(), new Promise((resolve) => post.once("update", resolve))]);
    });

    after(async () => {
        post.stop();
        replyToBeRemoved.stop();
    });

    it(`Mod can remove a reply`, async () => {
        const removeEdit = await plebbit.createCommentEdit({
            subplebbitAddress: replyToBeRemoved.subplebbitAddress,
            commentCid: replyToBeRemoved.cid,
            moderatorReason: "To remove a reply",
            removed: true,
            signer: roles[2].signer // Mod role
        });
        await publishWithExpectedResult(removeEdit, true);
    });

    it(`A new CommentUpdate is published for removing a reply`, async () => {
        await waitUntil(() => replyToBeRemoved.removed === true, { timeout: 200000 });

        expect(replyToBeRemoved.removed).to.be.true;
        expect(replyToBeRemoved.moderatorReason).to.equal("To remove a reply");
    });
    it(`Removed replies show in parent comment pages with 'removed' = true`, async () => {
        if (!post.replies.pages.topAll.comments[0].removed) await new Promise((resolve) => post.once("update", resolve));
        expect(post.replyCount).to.equal(1);
        const repliesPages = await Promise.all(Object.values(post.replies.pageCids).map((cid) => loadAllPages(cid, post.replies)));
        for (const comments of repliesPages) {
            const commentInPage = comments.find((comment) => comment.cid === replyToBeRemoved.cid);
            expect(commentInPage).to.exist;
            expect(commentInPage.removed).to.be.true;
        }
    });

    it(`Can publish a reply or vote under a reply of a removed reply`, async () => {
        // post
        //   -- replyToBeRemoved (removed=true)
        //     -- replyUnderRemovedReply (removed = false)
        // We're testing publishing under replyUnderRemovedReply
        const [reply, vote] = [
            await generateMockComment(replyUnderRemovedReply, plebbit),
            await generateMockVote(replyUnderRemovedReply, 1, plebbit)
        ];
        await Promise.all([reply, vote].map((pub) => publishWithExpectedResult(pub, true)));
    });

    it(`Author can't unremove a reply`, async () => {
        const unremoveEdit = await plebbit.createCommentEdit({
            subplebbitAddress: replyToBeRemoved.subplebbitAddress,
            commentCid: replyToBeRemoved.cid,
            moderatorReason: "To unremove a reply by author" + Date.now(),
            removed: false,
            signer: replyToBeRemoved.signer
        });
        await publishWithExpectedResult(unremoveEdit, false, messages.ERR_SUB_COMMENT_EDIT_AUTHOR_INVALID_FIELD);
    });
    it("Mod can unremove a reply", async () => {
        const unremoveEdit = await plebbit.createCommentEdit({
            subplebbitAddress: replyToBeRemoved.subplebbitAddress,
            commentCid: replyToBeRemoved.cid,
            moderatorReason: "To unremove a reply",
            removed: false,
            signer: roles[2].signer
        });
        await publishWithExpectedResult(unremoveEdit, true);
    });

    it(`A new CommentUpdate is published for unremoving a reply`, async () => {
        await waitUntil(() => replyToBeRemoved.removed === false, { timeout: 300000 });
        expect(replyToBeRemoved.removed).to.be.false;
        expect(replyToBeRemoved.moderatorReason).to.equal("To unremove a reply");
    });
});
