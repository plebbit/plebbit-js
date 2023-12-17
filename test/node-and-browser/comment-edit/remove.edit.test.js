const Plebbit = require("../../../dist/node");
const signers = require("../../fixtures/signers");
const {
    publishRandomPost,
    publishRandomReply,
    generateMockComment,
    generateMockVote,
    publishWithExpectedResult,
    findCommentInPage,
    mockRemotePlebbit
} = require("../../../dist/node/test/test-util");
const { expect } = require("chai");
const { messages } = require("../../../dist/node/errors");
const { default: waitUntil } = require("async-wait-until");
const lodash = require("lodash");

const subplebbitAddress = signers[0].address;
const roles = [
    { role: "owner", signer: signers[1] },
    { role: "admin", signer: signers[2] },
    { role: "mod", signer: signers[3] }
];

describe(`Removing post`, async () => {
    let plebbit, postToRemove, postReply;
    before(async () => {
        plebbit = await mockRemotePlebbit();
        postToRemove = await publishRandomPost(subplebbitAddress, plebbit, {}, false);
        postReply = await publishRandomReply(postToRemove, plebbit, {}, false);
        await postToRemove.update();
    });
    after(async () => {
        postToRemove.stop();
    });

    it(`Mod can mark a post as removed`, async () => {
        const removeEdit = await plebbit.createCommentEdit({
            subplebbitAddress: postToRemove.subplebbitAddress,
            commentCid: postToRemove.cid,
            reason: "To remove a post",
            removed: true,
            signer: roles[2].signer // Mod role
        });
        await publishWithExpectedResult(removeEdit, true);
    });

    it(`A new CommentUpdate is published with removed=true`, async () => {
        await waitUntil(() => postToRemove.removed, { timeout: 200000 });
        expect(postToRemove.removed).to.be.true;
        expect(postToRemove.reason).to.equal("To remove a post");
    });
    it(`Removed post don't show in subplebbit.posts`, async () => {
        const sub = await plebbit.createSubplebbit({ address: subplebbitAddress });
        sub.update();

        await new Promise((resolve) =>
            sub.on("update", async () => {
                const removedPostInPage = await findCommentInPage(postToRemove.cid, sub.posts.pageCids.new, sub.posts);
                if (!removedPostInPage) resolve();
            })
        );

        await sub.stop();

        for (const pageCid of Object.values(sub.posts.pageCids)) {
            const removedPostInPage = await findCommentInPage(postToRemove.cid, pageCid, sub.posts);

            expect(removedPostInPage).to.be.undefined;
        }
    });

    it(`Sub rejects votes on removed post`, async () => {
        const vote = await generateMockVote(postToRemove, 1, plebbit, lodash.sample(signers));
        await publishWithExpectedResult(vote, false, messages.ERR_SUB_PUBLICATION_PARENT_HAS_BEEN_REMOVED);
    });

    it(`Sub rejects replies on removed post`, async () => {
        const reply = await generateMockComment(postToRemove, plebbit, false, { signer: lodash.sample(signers) });
        await publishWithExpectedResult(reply, false, messages.ERR_SUB_PUBLICATION_PARENT_HAS_BEEN_REMOVED);
    });

    it(`Sub rejects votes on a reply of a removed post`, async () => {
        const vote = await generateMockVote(postReply, 1, plebbit, lodash.sample(signers));
        await publishWithExpectedResult(vote, false, messages.ERR_SUB_PUBLICATION_POST_HAS_BEEN_REMOVED);
    });

    it(`Sub rejects replies on a reply of a removed post`, async () => {
        const reply = await generateMockComment(postReply, plebbit, false, { signer: lodash.sample(signers) });
        await publishWithExpectedResult(reply, false, messages.ERR_SUB_PUBLICATION_POST_HAS_BEEN_REMOVED);
    });

    it(`Author of post can't remove it`, async () => {
        const postToBeRemoved = await publishRandomPost(subplebbitAddress, plebbit, {}, false);
        const removeEdit = await plebbit.createCommentEdit({
            subplebbitAddress: postToBeRemoved.subplebbitAddress,
            commentCid: postToBeRemoved.cid,
            reason: "To remove a post" + Date.now(),
            removed: true,
            signer: postToBeRemoved.signer
        });
        await publishWithExpectedResult(removeEdit, false, messages.ERR_SUB_COMMENT_EDIT_AUTHOR_INVALID_FIELD);
    });

    it(`Mod can unremove a post`, async () => {
        const unremoveEdit = await plebbit.createCommentEdit({
            subplebbitAddress: postToRemove.subplebbitAddress,
            commentCid: postToRemove.cid,
            reason: "To unremove a post",
            removed: false,
            signer: roles[2].signer
        });
        await publishWithExpectedResult(unremoveEdit, true);
    });

    it(`A new CommentUpdate is published for unremoving a post`, async () => {
        await waitUntil(() => postToRemove.removed === false, { timeout: 200000 });
        expect(postToRemove.removed).to.be.false;
        expect(postToRemove.reason).to.equal("To unremove a post");
    });

    it(`Unremoved post in included in subplebbit.posts with removed=false`, async () => {
        const sub = await plebbit.createSubplebbit({ address: subplebbitAddress });
        sub.update();

        await new Promise((resolve) =>
            sub.on("update", async () => {
                const unremovedPostInPage = await findCommentInPage(postToRemove.cid, sub.posts.pageCids.new, sub.posts);
                if (unremovedPostInPage) resolve();
            })
        );
        await sub.stop();

        for (const pageCid of Object.values(sub.posts.pageCids)) {
            const unremovedPostInPage = await findCommentInPage(postToRemove.cid, pageCid, sub.posts);
            expect(unremovedPostInPage).to.exist;
            expect(unremovedPostInPage.removed).to.equal(false);
            expect(unremovedPostInPage.reason).to.equal("To unremove a post");
        }
    });

    it(`Mods can remove their own comments`, async () => {
        const post = await publishRandomPost(subplebbitAddress, plebbit, { signer: roles[2].signer }, false);

        const removeEdit = await plebbit.createCommentEdit({
            subplebbitAddress: post.subplebbitAddress,
            commentCid: post.cid,
            reason: "For mods to remove their own post",
            removed: true,
            signer: roles[2].signer
        });
        await publishWithExpectedResult(removeEdit, true);
    });
});

describe(`Removing reply`, async () => {
    let plebbit, post, replyToBeRemoved, replyUnderRemovedReply;
    before(async () => {
        plebbit = await mockRemotePlebbit();
        post = await publishRandomPost(subplebbitAddress, plebbit, {}, false);
        replyToBeRemoved = await publishRandomReply(post, plebbit, {}, false);
        replyUnderRemovedReply = await publishRandomReply(replyToBeRemoved, plebbit, {}, false);
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
            reason: "To remove a reply",
            removed: true,
            signer: roles[2].signer // Mod role
        });
        await publishWithExpectedResult(removeEdit, true);
    });

    it(`A new CommentUpdate is published for removing a reply`, async () => {
        await waitUntil(() => replyToBeRemoved.removed === true, { timeout: 200000 });

        expect(replyToBeRemoved.removed).to.be.true;
        expect(replyToBeRemoved.reason).to.equal("To remove a reply");
    });
    it(`Removed replies show in parent comment pages with 'removed' = true`, async () => {
        const recreatedPost = await plebbit.createComment({ cid: post.cid });

        recreatedPost.update();

        await new Promise((resolve) =>
            recreatedPost.on("update", async () => {
                const removedReply = await findCommentInPage(
                    replyToBeRemoved.cid,
                    recreatedPost.replies.pageCids.new,
                    recreatedPost.replies
                );
                if (removedReply.removed === true) resolve();
            })
        );

        await recreatedPost.stop();
        for (const pageCid of Object.values(recreatedPost.replies.pageCids)) {
            const removedReplyInPage = await findCommentInPage(replyToBeRemoved.cid, pageCid, recreatedPost.replies);
            expect(removedReplyInPage).to.exist;
            expect(removedReplyInPage.removed).to.be.true;
            expect(removedReplyInPage.reason).to.equal("To remove a reply");
        }
    });

    it(`Can publish a reply or vote under a reply of a removed reply`, async () => {
        // post
        //   -- replyToBeRemoved (removed=true)
        //     -- replyUnderRemovedReply (removed = false)
        // We're testing publishing under replyUnderRemovedReply
        const [reply, vote] = [
            await generateMockComment(replyUnderRemovedReply, plebbit, false, { signer: lodash.sample(signers) }),
            await generateMockVote(replyUnderRemovedReply, 1, plebbit, lodash.sample(signers))
        ];
        await Promise.all([reply, vote].map((pub) => publishWithExpectedResult(pub, true)));
    });

    it(`Author can't unremove a reply`, async () => {
        const unremoveEdit = await plebbit.createCommentEdit({
            subplebbitAddress: replyToBeRemoved.subplebbitAddress,
            commentCid: replyToBeRemoved.cid,
            reason: "To unremove a reply by author" + Date.now(),
            removed: false,
            signer: replyToBeRemoved.signer
        });
        await publishWithExpectedResult(unremoveEdit, false, messages.ERR_SUB_COMMENT_EDIT_AUTHOR_INVALID_FIELD);
    });
    it("Mod can unremove a reply", async () => {
        const unremoveEdit = await plebbit.createCommentEdit({
            subplebbitAddress: replyToBeRemoved.subplebbitAddress,
            commentCid: replyToBeRemoved.cid,
            reason: "To unremove a reply",
            removed: false,
            signer: roles[2].signer
        });
        await publishWithExpectedResult(unremoveEdit, true);
    });

    it(`A new CommentUpdate is published for unremoving a reply`, async () => {
        await waitUntil(() => replyToBeRemoved.removed === false, { timeout: 300000 });
        expect(replyToBeRemoved.removed).to.be.false;
        expect(replyToBeRemoved.reason).to.equal("To unremove a reply");
    });
});
