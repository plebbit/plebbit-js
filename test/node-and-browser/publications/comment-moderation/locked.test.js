import { expect } from "chai";
import signers from "../../../fixtures/signers.js";
import {
    publishRandomPost,
    generateMockComment,
    generateMockVote,
    publishRandomReply,
    publishWithExpectedResult,
    mockRemotePlebbit,
    resolveWhenConditionIsTrue,
    getAvailablePlebbitConfigsToTestAgainst,
    iterateThroughPagesToFindCommentInParentPagesInstance,
    iterateThroughPageCidToFindComment
} from "../../../../dist/node/test/test-util.js";
import { messages } from "../../../../dist/node/errors.js";

const subplebbitAddress = signers[11].address;
const roles = [
    { role: "owner", signer: signers[1] },
    { role: "admin", signer: signers[2] },
    { role: "mod", signer: signers[3] }
];

getAvailablePlebbitConfigsToTestAgainst().map((config) => {
    describe(`Locking posts - ${config.name}`, async () => {
        let plebbit, postToBeLocked, replyUnderPostToBeLocked, modPost, sub;
        before(async () => {
            plebbit = await mockRemotePlebbit();
            sub = await plebbit.getSubplebbit(subplebbitAddress);
            await sub.update();
            postToBeLocked = await publishRandomPost(subplebbitAddress, plebbit);
            modPost = await publishRandomPost(subplebbitAddress, plebbit, { signer: roles[2].signer });

            await postToBeLocked.update();
            replyUnderPostToBeLocked = await publishRandomReply(postToBeLocked, plebbit);
            await modPost.update();
        });
        after(async () => {
            await plebbit.destroy();
        });
        it(`Author can't lock their own post`, async () => {
            const lockedEdit = await plebbit.createCommentModeration({
                subplebbitAddress: postToBeLocked.subplebbitAddress,
                commentCid: postToBeLocked.cid,
                commentModeration: { locked: true },
                signer: postToBeLocked.signer
            });
            await publishWithExpectedResult(lockedEdit, false, messages.ERR_COMMENT_MODERATION_ATTEMPTED_WITHOUT_BEING_MODERATOR);
        });
        it(`Regular author can't lock another author comment`, async () => {
            const lockedEdit = await plebbit.createCommentModeration({
                subplebbitAddress: postToBeLocked.subplebbitAddress,
                commentCid: postToBeLocked.cid,
                commentModeration: { locked: true },
                signer: await plebbit.createSigner()
            });
            await publishWithExpectedResult(lockedEdit, false, messages.ERR_COMMENT_MODERATION_ATTEMPTED_WITHOUT_BEING_MODERATOR);
        });

        it(`Mod Can't lock a reply`, async () => {
            // This is prior to locking the post
            const lockedEdit = await plebbit.createCommentModeration({
                subplebbitAddress: replyUnderPostToBeLocked.subplebbitAddress,
                commentCid: replyUnderPostToBeLocked.cid,
                commentModeration: { locked: true },
                signer: roles[2].signer
            });
            await publishWithExpectedResult(lockedEdit, false, messages.ERR_SUB_COMMENT_EDIT_CAN_NOT_LOCK_REPLY);
        });

        it(`Mod can lock an author post`, async () => {
            const lockedEdit = await plebbit.createCommentModeration({
                subplebbitAddress: postToBeLocked.subplebbitAddress,
                commentCid: postToBeLocked.cid,
                commentModeration: { locked: true, reason: "To lock an author post" },
                signer: roles[2].signer
            });
            await publishWithExpectedResult(lockedEdit, true);
        });

        it(`A new CommentUpdate with locked=true is published`, async () => {
            await resolveWhenConditionIsTrue({ toUpdate: postToBeLocked, predicate: () => postToBeLocked.locked === true });
            expect(postToBeLocked.locked).to.be.true;
            expect(postToBeLocked.reason).to.equal("To lock an author post");
            expect(postToBeLocked.raw.commentUpdate.reason).to.equal("To lock an author post");
            expect(postToBeLocked.raw.commentUpdate.locked).to.be.true;
            expect(postToBeLocked.raw.commentUpdate.edit).to.be.undefined;
        });

        it(`subplebbit.posts includes locked post with locked=true`, async () => {
            const sub = await plebbit.createSubplebbit({ address: postToBeLocked.subplebbitAddress });

            await sub.update();

            await resolveWhenConditionIsTrue({ toUpdate: sub, predicate: async () => {
                const lockedPostInPage = await iterateThroughPagesToFindCommentInParentPagesInstance(postToBeLocked.cid, sub.posts);
                return lockedPostInPage?.locked === true;
            } });

            await sub.stop();

            for (const pageCid of Object.values(sub.posts.pageCids)) {
                const lockedPostInPage = await iterateThroughPageCidToFindComment(postToBeLocked.cid, pageCid, sub.posts);
                expect(lockedPostInPage.locked).to.be.true;
                expect(lockedPostInPage.reason).to.equal("To lock an author post");
            }
        });

        it(`locked=true for author post when it's locked by mod in pages of subplebbit`, async () => {
            const sub = await plebbit.getSubplebbit(postToBeLocked.subplebbitAddress);
            const postInSubplebbitPage = await iterateThroughPagesToFindCommentInParentPagesInstance(postToBeLocked.cid, sub.posts);
            expect(postInSubplebbitPage.locked).to.be.true;
        });

        it(`Mod can lock their own post`, async () => {
            const lockedEdit = await plebbit.createCommentModeration({
                subplebbitAddress: modPost.subplebbitAddress,
                commentCid: modPost.cid,
                commentModeration: { locked: true, reason: "To lock a mod post" },
                signer: modPost.signer
            });
            await publishWithExpectedResult(lockedEdit, true);
        });

        it(`A new CommentUpdate with locked=true is published`, async () => {
            await resolveWhenConditionIsTrue({ toUpdate: modPost, predicate: () => modPost.locked === true });
            expect(modPost.locked).to.be.true;
            expect(modPost.reason).to.equal("To lock a mod post");
            expect(modPost.raw.commentUpdate.reason).to.equal("To lock a mod post");
            expect(postToBeLocked.raw.commentUpdate.locked).to.be.true;
            expect(postToBeLocked.raw.commentUpdate.edit).to.be.undefined;
        });

        it(`locked=true for mod post when it's locked by mod in getPage of subplebbit`, async () => {
            const sub = await plebbit.getSubplebbit(modPost.subplebbitAddress);
            const postInSubplebbitPage = await iterateThroughPagesToFindCommentInParentPagesInstance(modPost.cid, sub.posts);
            expect(postInSubplebbitPage.locked).to.be.true;
        });

        it(`Can't publish a reply on a locked post`, async () => {
            const comment = await generateMockComment(postToBeLocked, plebbit, false);
            await publishWithExpectedResult(comment, false, messages.ERR_SUB_PUBLICATION_POST_IS_LOCKED);
        });

        it(`Can't vote on a locked post`, async () => {
            const vote = await generateMockVote(postToBeLocked, 1, plebbit);
            await publishWithExpectedResult(vote, false, messages.ERR_SUB_PUBLICATION_POST_IS_LOCKED);
        });

        it(`Can't vote on a reply of a locked post`, async () => {
            const vote = await generateMockVote(replyUnderPostToBeLocked, 1, plebbit);
            await publishWithExpectedResult(vote, false, messages.ERR_SUB_PUBLICATION_POST_IS_LOCKED);
        });

        it(`Can't reply on a reply of a locked post`, async () => {
            const reply = await generateMockComment(replyUnderPostToBeLocked, plebbit);
            await publishWithExpectedResult(reply, false, messages.ERR_SUB_PUBLICATION_POST_IS_LOCKED);
        });

        it(`Mod can unlock a post`, async () => {
            const unlockEdit = await plebbit.createCommentModeration({
                subplebbitAddress: postToBeLocked.subplebbitAddress,
                commentCid: postToBeLocked.cid,
                commentModeration: { locked: false, reason: "To unlock an author post" },
                signer: roles[2].signer
            });
            await publishWithExpectedResult(unlockEdit, true);
        });

        it(`A new CommentUpdate with locked=false is published`, async () => {
            await resolveWhenConditionIsTrue({ toUpdate: postToBeLocked, predicate: () => postToBeLocked.locked === false });
            expect(postToBeLocked.locked).to.be.false;
            expect(postToBeLocked.reason).to.equal("To unlock an author post");
            expect(postToBeLocked.raw.commentUpdate.reason).to.equal("To unlock an author post");
            expect(postToBeLocked.raw.commentUpdate.locked).to.be.false;
            expect(postToBeLocked.raw.commentUpdate.edit).to.be.undefined;
        });

        it(`locked=false in getPage of subplebbit after the mod unlocks it`, async () => {
            const sub = await plebbit.getSubplebbit(postToBeLocked.subplebbitAddress);
            const postInSubplebbitPage = await iterateThroughPagesToFindCommentInParentPagesInstance(postToBeLocked.cid, sub.posts);
            expect(postInSubplebbitPage.locked).to.be.false;
        });

        it(`Unlocked post can receive replies`, async () => {
            const reply = await generateMockComment(replyUnderPostToBeLocked, plebbit);
            await publishWithExpectedResult(reply, true);
        });
        it(`Unlocked post can receive votes `, async () => {
            const vote = await generateMockVote(replyUnderPostToBeLocked, 1, plebbit);
            await publishWithExpectedResult(vote, true);
        });
    });
});
