import { expect } from "chai";
import signers from "../../../fixtures/signers.js";
import {
    publishRandomPost,
    publishRandomReply,
    generateMockComment,
    generateMockVote,
    publishWithExpectedResult,
    resolveWhenConditionIsTrue,
    getRemotePlebbitConfigs,
    iterateThroughPagesToFindCommentInParentPagesInstance,
    iterateThroughPageCidToFindComment
} from "../../../../dist/node/test/test-util.js";
import { messages } from "../../../../dist/node/errors.js";
import * as remeda from "remeda";

const subplebbitAddress = signers[7].address;
const roles = [
    { role: "owner", signer: signers[1] },
    { role: "admin", signer: signers[2] },
    { role: "mod", signer: signers[3] }
];

getRemotePlebbitConfigs().map((config) => {
    describe(`Removing post - ${config.name}`, async () => {
        let plebbit, postToRemove, postReply;
        before(async () => {
            plebbit = await config.plebbitInstancePromise();
            postToRemove = await publishRandomPost(subplebbitAddress, plebbit);
            postReply = await publishRandomReply(postToRemove, plebbit);
            await postToRemove.update();
        });
        after(async () => {
            await plebbit.destroy();
        });

        it(`Mod can mark an author post as removed`, async () => {
            const removeEdit = await plebbit.createCommentModeration({
                subplebbitAddress: postToRemove.subplebbitAddress,
                commentCid: postToRemove.cid,
                commentModeration: { reason: "To remove a post", removed: true },
                signer: roles[2].signer // Mod role
            });
            await publishWithExpectedResult(removeEdit, true);
        });

        it(`A new CommentUpdate is published with removed=true`, async () => {
            await resolveWhenConditionIsTrue(postToRemove, () => postToRemove.removed === true);
            expect(postToRemove.removed).to.be.true;
            expect(postToRemove.reason).to.equal("To remove a post");
            expect(postToRemove.raw.commentUpdate.removed).to.be.true;
            expect(postToRemove.raw.commentUpdate.reason).to.equal("To remove a post");
            expect(postToRemove.raw.commentUpdate.edit).to.be.undefined;
        });
        it(`Removed post don't show in subplebbit.posts`, async () => {
            const sub = await plebbit.createSubplebbit({ address: subplebbitAddress });
            await sub.update();

            await resolveWhenConditionIsTrue(sub, async () => {
                const removedPostInPage = await iterateThroughPagesToFindCommentInParentPagesInstance(postToRemove.cid, sub.posts);
                return removedPostInPage === undefined;
            });

            await sub.stop();

            for (const pageCid of Object.values(sub.posts.pageCids)) {
                const removedPostInPage = await iterateThroughPageCidToFindComment(postToRemove.cid, pageCid, sub.posts);

                expect(removedPostInPage).to.be.undefined;
            }
        });

        it(`Sub rejects votes on removed post`, async () => {
            const vote = await generateMockVote(postToRemove, 1, plebbit, remeda.sample(signers, 1)[0]);
            await publishWithExpectedResult(vote, false, messages.ERR_SUB_PUBLICATION_PARENT_HAS_BEEN_REMOVED);
        });

        it(`Sub rejects replies on removed post`, async () => {
            const reply = await generateMockComment(postToRemove, plebbit, false, { signer: remeda.sample(signers, 1)[0] });
            await publishWithExpectedResult(reply, false, messages.ERR_SUB_PUBLICATION_PARENT_HAS_BEEN_REMOVED);
        });

        it(`Sub rejects votes on a reply of a removed post`, async () => {
            const vote = await generateMockVote(postReply, 1, plebbit, remeda.sample(signers, 1)[0]);
            await publishWithExpectedResult(vote, false, messages.ERR_SUB_PUBLICATION_POST_HAS_BEEN_REMOVED);
        });

        it(`Sub rejects replies on a reply of a removed post`, async () => {
            const reply = await generateMockComment(postReply, plebbit, false, { signer: remeda.sample(signers, 1)[0] });
            await publishWithExpectedResult(reply, false, messages.ERR_SUB_PUBLICATION_POST_HAS_BEEN_REMOVED);
        });

        it(`Author of post can't remove it`, async () => {
            const postToBeRemoved = await publishRandomPost(subplebbitAddress, plebbit, {}, false);
            const removeEdit = await plebbit.createCommentModeration({
                subplebbitAddress: postToBeRemoved.subplebbitAddress,
                commentCid: postToBeRemoved.cid,
                commentModeration: { reason: "To remove a post" + Date.now(), removed: true },
                signer: postToBeRemoved.signer
            });
            await publishWithExpectedResult(removeEdit, false, messages.ERR_COMMENT_MODERATION_ATTEMPTED_WITHOUT_BEING_MODERATOR);
        });

        it(`Mod can unremove a post`, async () => {
            const unremoveEdit = await plebbit.createCommentModeration({
                subplebbitAddress: postToRemove.subplebbitAddress,
                commentCid: postToRemove.cid,
                commentModeration: { reason: "To unremove a post", removed: false },
                signer: roles[2].signer
            });
            await publishWithExpectedResult(unremoveEdit, true);
        });

        it(`A new CommentUpdate is published for unremoving a post`, async () => {
            await resolveWhenConditionIsTrue(postToRemove, () => postToRemove.removed === false);
            expect(postToRemove.removed).to.be.false;
            expect(postToRemove.reason).to.equal("To unremove a post");
            expect(postToRemove.raw.commentUpdate.removed).to.be.false;
            expect(postToRemove.raw.commentUpdate.reason).to.equal("To unremove a post");
            expect(postToRemove.raw.commentUpdate.edit).to.be.undefined;
        });

        it(`Unremoved post is included in subplebbit.posts with removed=false`, async () => {
            const sub = await plebbit.createSubplebbit({ address: subplebbitAddress });
            await sub.update();

            await resolveWhenConditionIsTrue(sub, async () => {
                const unremovedPostInPage = await iterateThroughPagesToFindCommentInParentPagesInstance(postToRemove.cid, sub.posts);
                return Boolean(unremovedPostInPage);
            });

            await sub.stop();

            for (const pageCid of Object.values(sub.posts.pageCids)) {
                const unremovedPostInPage = await iterateThroughPageCidToFindComment(postToRemove.cid, pageCid, sub.posts);
                expect(unremovedPostInPage).to.exist;
                expect(unremovedPostInPage.removed).to.equal(false);
                expect(unremovedPostInPage.reason).to.equal("To unremove a post");
            }
        });
    });

    describe(`Mods removing their own posts - ${config.name}`, async () => {
        let plebbit, modPost;

        before(async () => {
            plebbit = await config.plebbitInstancePromise();
            modPost = await publishRandomPost(subplebbitAddress, plebbit, { signer: roles[2].signer });
            modPost.update();
        });

        after(async () => {
            await plebbit.destroy();
        });

        it(`Mods can remove their own posts`, async () => {
            const removeEdit = await plebbit.createCommentModeration({
                subplebbitAddress: modPost.subplebbitAddress,
                commentCid: modPost.cid,
                commentModeration: { reason: "For mods to remove their own post", removed: true },
                signer: roles[2].signer
            });
            await publishWithExpectedResult(removeEdit, true);
        });

        it(`A new CommentUpdate is published with removed=true`, async () => {
            await resolveWhenConditionIsTrue(modPost, () => modPost.removed === true);
            expect(modPost.removed).to.be.true;
            expect(modPost.raw.commentUpdate.removed).to.be.true;
            expect(modPost.raw.commentUpdate.edit).to.be.undefined;
            expect(modPost.reason).to.equal("For mods to remove their own post");
            expect(modPost.raw.commentUpdate.reason).to.equal("For mods to remove their own post");
        });
    });

    describe(`Removing reply`, async () => {
        let plebbit, post, replyToBeRemoved, replyUnderRemovedReply;
        before(async () => {
            plebbit = await config.plebbitInstancePromise();
            post = await publishRandomPost(subplebbitAddress, plebbit);
            replyToBeRemoved = await publishRandomReply(post, plebbit);
            replyUnderRemovedReply = await publishRandomReply(replyToBeRemoved, plebbit);
            await Promise.all([replyToBeRemoved.update(), post.update(), new Promise((resolve) => post.once("update", resolve))]);
        });

        after(async () => {
            await plebbit.destroy();
        });

        it(`Mod can remove a reply`, async () => {
            const removeEdit = await plebbit.createCommentModeration({
                subplebbitAddress: replyToBeRemoved.subplebbitAddress,
                commentCid: replyToBeRemoved.cid,
                commentModeration: { reason: "To remove a reply", removed: true },
                signer: roles[2].signer // Mod role
            });
            await publishWithExpectedResult(removeEdit, true);
        });

        it(`A new CommentUpdate is published for removing a reply`, async () => {
            await resolveWhenConditionIsTrue(replyToBeRemoved, () => replyToBeRemoved.removed === true);
            expect(replyToBeRemoved.removed).to.be.true;
            expect(replyToBeRemoved.reason).to.equal("To remove a reply");
            expect(replyToBeRemoved.raw.commentUpdate.removed).to.be.true;
            expect(replyToBeRemoved.raw.commentUpdate.edit).to.be.undefined;
            expect(replyToBeRemoved.raw.commentUpdate.reason).to.equal("To remove a reply");
        });
        it(`Removed replies show in parent comment pages with 'removed' = true`, async () => {
            const recreatedPost = await plebbit.createComment({ cid: post.cid });

            await recreatedPost.update();

            await resolveWhenConditionIsTrue(recreatedPost, async () => {
                const removedReply = await iterateThroughPagesToFindCommentInParentPagesInstance(
                    replyToBeRemoved.cid,
                    recreatedPost.replies
                );
                return removedReply?.removed === true;
            });

            await recreatedPost.stop();
            for (const pageCid of Object.values(recreatedPost.replies.pageCids)) {
                const removedReplyInPage = await iterateThroughPageCidToFindComment(replyToBeRemoved.cid, pageCid, recreatedPost.replies);
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
                await generateMockComment(replyUnderRemovedReply, plebbit, false, { signer: remeda.sample(signers, 1)[0] }),
                await generateMockVote(replyUnderRemovedReply, 1, plebbit, remeda.sample(signers, 1)[0])
            ];
            await Promise.all([reply, vote].map((pub) => publishWithExpectedResult(pub, true)));
        });

        it(`Author can't unremove a reply`, async () => {
            const unremoveEdit = await plebbit.createCommentModeration({
                subplebbitAddress: replyToBeRemoved.subplebbitAddress,
                commentCid: replyToBeRemoved.cid,
                commentModeration: { reason: "To unremove a reply by author" + Date.now(), removed: false },
                signer: replyToBeRemoved.signer
            });
            await publishWithExpectedResult(unremoveEdit, false, messages.ERR_SUB_COMMENT_EDIT_AUTHOR_INVALID_FIELD);
        });
        it("Mod can unremove a reply", async () => {
            const unremoveEdit = await plebbit.createCommentModeration({
                subplebbitAddress: replyToBeRemoved.subplebbitAddress,
                commentCid: replyToBeRemoved.cid,
                commentModeration: { reason: "To unremove a reply", removed: false },
                signer: roles[2].signer
            });
            await publishWithExpectedResult(unremoveEdit, true);
        });

        it(`A new CommentUpdate is published for unremoving a reply`, async () => {
            await resolveWhenConditionIsTrue(replyToBeRemoved, () => replyToBeRemoved.removed === false);
            expect(replyToBeRemoved.removed).to.be.false;
            expect(replyToBeRemoved.reason).to.equal("To unremove a reply");
            expect(replyToBeRemoved.raw.commentUpdate.removed).to.be.false;
            expect(replyToBeRemoved.raw.commentUpdate.edit).to.be.undefined;
            expect(replyToBeRemoved.raw.commentUpdate.reason).to.equal("To unremove a reply");
        });
    });
});
