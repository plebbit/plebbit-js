import signers from "../../../fixtures/signers.js";
import {
    publishRandomPost,
    generateMockComment,
    generateMockVote,
    publishRandomReply,
    publishWithExpectedResult,
    mockRemotePlebbit,
    findCommentInPage,
    resolveWhenConditionIsTrue,
    getRemotePlebbitConfigs
} from "../../../../dist/node/test/test-util.js";
import { expect } from "chai";
import { messages } from "../../../../dist/node/errors.js";

const subplebbitAddress = signers[0].address;
const roles = [
    { role: "owner", signer: signers[1] },
    { role: "admin", signer: signers[2] },
    { role: "mod", signer: signers[3] }
];

getRemotePlebbitConfigs().map((config) => {
    describe(`Locking posts - ${config.name}`, async () => {
        let plebbit, postToBeLocked, replyUnderPostToBeLocked, modPost, sub;
        before(async () => {
            plebbit = await mockRemotePlebbit();
            sub = await plebbit.getSubplebbit(subplebbitAddress);
            await sub.update();
            postToBeLocked = await publishRandomPost(subplebbitAddress, plebbit, {});
            modPost = await publishRandomPost(subplebbitAddress, plebbit, { signer: roles[2].signer });

            postToBeLocked.update();
            replyUnderPostToBeLocked = await publishRandomReply(postToBeLocked, plebbit, {});
            modPost.update();
        });
        after(async () => {
            await postToBeLocked.stop();
            await modPost.stop();
            await sub.stop();
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
            await resolveWhenConditionIsTrue(postToBeLocked, () => postToBeLocked.locked === true);
            expect(postToBeLocked.locked).to.be.true;
            expect(postToBeLocked.reason).to.equal("To lock an author post");
            expect(postToBeLocked._rawCommentUpdate.reason).to.equal("To lock an author post");
            expect(postToBeLocked._rawCommentUpdate.locked).to.be.true;
            expect(postToBeLocked._rawCommentUpdate.edit).to.be.undefined;
        });
        it(`subplebbit.posts includes locked post with locked=true`, async () => {
            const sub = await plebbit.createSubplebbit({ address: postToBeLocked.subplebbitAddress });

            sub.update();

            await new Promise((resolve) =>
                sub.on("update", async () => {
                    const lockedPostInPage = await findCommentInPage(postToBeLocked.cid, sub.posts.pageCids.new, sub.posts);
                    if (lockedPostInPage.locked === true) resolve();
                })
            );

            await sub.stop();

            for (const pageCid of Object.values(sub.posts.pageCids)) {
                const lockedPostInPage = await findCommentInPage(postToBeLocked.cid, pageCid, sub.posts);
                expect(lockedPostInPage.locked).to.be.true;
                expect(lockedPostInPage.reason).to.equal("To lock an author post");
            }
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
            await resolveWhenConditionIsTrue(modPost, () => modPost.locked === true);
            expect(modPost.locked).to.be.true;
            expect(modPost.reason).to.equal("To lock a mod post");
            expect(modPost._rawCommentUpdate.reason).to.equal("To lock a mod post");
            expect(postToBeLocked._rawCommentUpdate.locked).to.be.true;
            expect(postToBeLocked._rawCommentUpdate.edit).to.be.undefined;
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
            await resolveWhenConditionIsTrue(postToBeLocked, () => postToBeLocked.locked === false);
            expect(postToBeLocked.locked).to.be.false;
            expect(postToBeLocked.reason).to.equal("To unlock an author post");
            expect(postToBeLocked._rawCommentUpdate.reason).to.equal("To unlock an author post");
            expect(postToBeLocked._rawCommentUpdate.locked).to.be.false;
            expect(postToBeLocked._rawCommentUpdate.edit).to.be.undefined;
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
