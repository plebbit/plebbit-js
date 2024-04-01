import signers from "../../fixtures/signers.js";
import {
    publishRandomPost,
    publishRandomReply,
    generateMockComment,
    generateMockVote,
    publishWithExpectedResult,
    findCommentInPage,
    mockRemotePlebbit,
    resolveWhenConditionIsTrue
} from "../../../dist/node/test/test-util.js";
import { expect } from "chai";
import { messages } from "../../../dist/node/errors.js";
import * as remeda from "remeda";

const subplebbitAddress = signers[0].address;
const roles = [
    { role: "owner", signer: signers[1] },
    { role: "admin", signer: signers[2] },
    { role: "mod", signer: signers[3] }
];
describe("Deleting a post", async () => {
    let plebbit, postToDelete, modPostToDelete, postReply;

    before(async () => {
        plebbit = await mockRemotePlebbit();
        [postToDelete, modPostToDelete] = await Promise.all([
            publishRandomPost(subplebbitAddress, plebbit, {}, false),
            publishRandomPost(subplebbitAddress, plebbit, { signer: roles[2].signer }, false)
        ]);
        postReply = await publishRandomReply(postToDelete, plebbit, {}, false);
        postToDelete.update();
        modPostToDelete.update();
        postReply.update();
    });

    after(async () => {
        await postToDelete.stop();
        await modPostToDelete.stop();
        await postReply.stop();
    });
    it(`Regular author can't mark a post that is not theirs as deleted`, async () => {
        const deleteEdit = await plebbit.createCommentEdit({
            subplebbitAddress: postToDelete.subplebbitAddress,
            commentCid: postToDelete.cid,
            deleted: true,
            signer: await plebbit.createSigner()
        });
        await publishWithExpectedResult(deleteEdit, false, messages.ERR_UNAUTHORIZED_COMMENT_EDIT);
    });

    it(`Mod can't delete a post that is not theirs`, async () => {
        const deleteEdit = await plebbit.createCommentEdit({
            subplebbitAddress: postToDelete.subplebbitAddress,
            commentCid: postToDelete.cid,
            deleted: true,
            signer: roles[2].signer
        });
        await publishWithExpectedResult(deleteEdit, false, messages.ERR_SUB_COMMENT_EDIT_UNAUTHORIZED_FIELD);
    });

    it(`Author of post can delete their own post`, async () => {
        const deleteEdit = await plebbit.createCommentEdit({
            subplebbitAddress: postToDelete.subplebbitAddress,
            commentCid: postToDelete.cid,
            deleted: true,
            signer: postToDelete.signer,
            reason: "To test delete for author"
        });
        await publishWithExpectedResult(deleteEdit, true);
    });

    it(`A new CommentUpdate is published with deleted=true for author deleted post`, async () => {
        await resolveWhenConditionIsTrue(postToDelete, () => postToDelete.deleted === true);
        expect(postToDelete.deleted).to.be.true;
        expect(postToDelete._rawCommentUpdate.deleted).to.be.undefined;
        expect(postToDelete._rawCommentUpdate.edit.deleted).to.be.true;
        expect(postToDelete.reason).to.equal("To test delete for author");
        expect(postToDelete.edit.reason).to.equal("To test delete for author");
        expect(postToDelete._rawCommentUpdate.edit.reason).to.equal("To test delete for author");
        expect(postToDelete._rawCommentUpdate.reason).to.be.undefined;
    });

    it(`Deleted post is omitted from subplebbit.posts`, async () => {
        const sub = await plebbit.createSubplebbit({ address: postToDelete.subplebbitAddress });
        sub.update();

        await new Promise((resolve) =>
            sub.on("update", async () => {
                const postInPage = await findCommentInPage(postToDelete.cid, sub.posts.pageCids.new, sub.posts);
                if (!postInPage) resolve();
            })
        );
        await sub.stop();

        for (const pageCid of Object.values(sub.posts.pageCids)) {
            const postInPage = await findCommentInPage(postToDelete.cid, pageCid, sub.posts);

            expect(postInPage).to.be.undefined;
        }
    });

    it(`Can't publish vote on deleted post`, async () => {
        const voteUnderDeletedPost = await generateMockVote(postToDelete, 1, plebbit, lodash.sample(signers));
        await publishWithExpectedResult(voteUnderDeletedPost, false, messages.ERR_SUB_PUBLICATION_PARENT_HAS_BEEN_DELETED);
    });

    it(`Can't publish reply under deleted post`, async () => {
        const replyUnderDeletedPost = await generateMockComment(postToDelete, plebbit, false, { signer: lodash.sample(signers) });
        await publishWithExpectedResult(replyUnderDeletedPost, false, messages.ERR_SUB_PUBLICATION_PARENT_HAS_BEEN_DELETED);
    });

    it(`Can't publish a reply under a reply of a deleted post`, async () => {
        const reply = await generateMockComment(postReply, plebbit, false, { signer: lodash.sample(signers) });
        await publishWithExpectedResult(reply, false, messages.ERR_SUB_PUBLICATION_POST_HAS_BEEN_DELETED);
    });

    it(`Can't publish a vote under a reply of a deleted post`, async () => {
        const vote = await generateMockVote(postReply, 1, plebbit, lodash.sample(signers));
        await publishWithExpectedResult(vote, false, messages.ERR_SUB_PUBLICATION_POST_HAS_BEEN_DELETED);
    });
    it(`Mod can delete their own post`, async () => {
        const deleteEdit = await plebbit.createCommentEdit({
            subplebbitAddress: modPostToDelete.subplebbitAddress,
            commentCid: modPostToDelete.cid,
            deleted: true,
            signer: modPostToDelete.signer,
            reason: "For mod to test deleting their own post"
        });
        await publishWithExpectedResult(deleteEdit, true);
    });

    it(`A new CommentUpdate is published with deleted=true for mod deleted post`, async () => {
        await resolveWhenConditionIsTrue(modPostToDelete, () => modPostToDelete.deleted === true);
        expect(modPostToDelete.deleted).to.be.true;
        expect(modPostToDelete._rawCommentUpdate.deleted).to.be.undefined;
        expect(modPostToDelete._rawCommentUpdate.edit.deleted).to.be.true;
        expect(modPostToDelete.reason).to.equal("For mod to test deleting their own post");
        expect(modPostToDelete.edit.reason).to.equal("For mod to test deleting their own post");
        expect(modPostToDelete._rawCommentUpdate.edit.reason).to.equal("For mod to test deleting their own post");
        expect(modPostToDelete._rawCommentUpdate.reason).to.be.undefined;
    });

    it(`Author can undelete their own post`, async () => {
        const undeleteEdit = await plebbit.createCommentEdit({
            subplebbitAddress: postToDelete.subplebbitAddress,
            commentCid: postToDelete.cid,
            deleted: false,
            signer: postToDelete.signer,
            reason: "For author to test undelete their own post"
        });
        await publishWithExpectedResult(undeleteEdit, true);
    });

    it(`A new CommentUpdate is published with deleted=false for author undeleted post`, async () => {
        await resolveWhenConditionIsTrue(postToDelete, () => postToDelete.deleted === false);
        expect(postToDelete.deleted).to.be.false;
        expect(postToDelete._rawCommentUpdate.deleted).to.be.undefined;
        expect(postToDelete._rawCommentUpdate.edit.deleted).to.be.false;
        expect(postToDelete.reason).to.equal("For author to test undelete their own post");
        expect(postToDelete.edit.reason).to.equal("For author to test undelete their own post");
        expect(postToDelete._rawCommentUpdate.edit.reason).to.equal("For author to test undelete their own post");
        expect(postToDelete._rawCommentUpdate.reason).to.be.undefined;
    });
    it(`Mod can undelete their own post`, async () => {
        const undeleteEdit = await plebbit.createCommentEdit({
            subplebbitAddress: modPostToDelete.subplebbitAddress,
            commentCid: modPostToDelete.cid,
            deleted: false,
            signer: modPostToDelete.signer,
            reason: "For mod to test undeleting their own post"
        });
        await publishWithExpectedResult(undeleteEdit, true);
    });

    it(`A new CommentUpdate is published with deleted=false for mod undeleted post`, async () => {
        await resolveWhenConditionIsTrue(modPostToDelete, () => modPostToDelete.deleted === false);
        expect(modPostToDelete.deleted).to.be.false;
        expect(modPostToDelete._rawCommentUpdate.deleted).to.be.undefined;
        expect(modPostToDelete._rawCommentUpdate.edit.deleted).to.be.false;
        expect(modPostToDelete.reason).to.equal("For mod to test undeleting their own post");
        expect(modPostToDelete.edit.reason).to.equal("For mod to test undeleting their own post");
        expect(modPostToDelete._rawCommentUpdate.edit.reason).to.equal("For mod to test undeleting their own post");
        expect(modPostToDelete._rawCommentUpdate.reason).to.be.undefined;
    });
});

describe("Deleting a reply", async () => {
    let plebbit, replyToDelete, post, replyUnderDeletedReply;

    before(async () => {
        plebbit = await mockRemotePlebbit();
        post = await publishRandomPost(subplebbitAddress, plebbit, {}, false);
        replyToDelete = await publishRandomReply(post, plebbit, {}, false);
        replyUnderDeletedReply = await publishRandomReply(replyToDelete, plebbit, {}, false);
        await Promise.all([replyToDelete.update(), post.update()]);
    });
    after(async () => {
        post.stop();
        replyToDelete.stop();
    });

    it(`Author can delete their own reply`, async () => {
        const deleteEdit = await plebbit.createCommentEdit({
            subplebbitAddress: replyToDelete.subplebbitAddress,
            commentCid: replyToDelete.cid,
            deleted: true,
            signer: replyToDelete.signer
        });
        await publishWithExpectedResult(deleteEdit, true);
    });
    it(`A new CommentUpdate is pushed for removing a reply`, async () => {
        await resolveWhenConditionIsTrue(replyToDelete, () => replyToDelete.deleted === true);
        expect(replyToDelete.deleted).to.be.true;
        expect(replyToDelete.reason).to.be.undefined;
    });
    it(`Deleted replies show in parent comment pages with 'deleted' = true`, async () => {
        const parentComment = await plebbit.createComment({ cid: replyToDelete.parentCid });
        parentComment.update();

        await new Promise((resolve) =>
            parentComment.on("update", async () => {
                const deletedReplyUnderPost = await findCommentInPage(
                    replyToDelete.cid,
                    parentComment.replies.pageCids.new,
                    parentComment.replies
                );
                if (deletedReplyUnderPost.deleted === true) resolve();
            })
        );

        // Need to test for all pages here

        await parentComment.stop();
        for (const pageCid of Object.values(parentComment.replies.pageCids)) {
            const replyInPage = await findCommentInPage(replyToDelete.cid, pageCid, parentComment.replies);
            expect(replyInPage.deleted).to.be.true;
        }
    });

    it(`Can publish a reply or vote under a reply of a deleted reply`, async () => {
        // post
        //   -- replyToDeleted (deleted=true)
        //     -- replyUnderDeletedReply (deleted = false)
        // We're testing publishing under replyUnderDeletedReply
        const [reply, vote] = [
            await generateMockComment(replyUnderDeletedReply, plebbit),
            await generateMockVote(replyUnderDeletedReply, 1, plebbit)
        ];
        await Promise.all([reply, vote].map((pub) => publishWithExpectedResult(pub, true)));
    });
});
