import { expect } from "chai";
import {
    mockRemotePlebbit,
    describeSkipIfRpc,
    resolveWhenConditionIsTrue,
    findOrGeneratePostWithMultiplePages
} from "../../../dist/node/test/test-util.js";
import { PlebbitError } from "../../../dist/node/plebbit-error.js";
import signers from "../../fixtures/signers.js";
import * as remeda from "remeda";
import { signCommentUpdate } from "../../../dist/node/signer/signatures.js";

describeSkipIfRpc("plebbit.validateComment", async () => {
    let plebbit, subplebbit, postCommentInstance, postPageComment, replyFromFlatPage;

    before(async () => {
        plebbit = await mockRemotePlebbit();
        subplebbit = await plebbit.getSubplebbit(signers[0].address);

        await resolveWhenConditionIsTrue(subplebbit, () => typeof subplebbit.lastPostCid === "string");

        // Get a post instance
        postCommentInstance = await plebbit.getComment(subplebbit.lastPostCid);
        await postCommentInstance.update();
        await resolveWhenConditionIsTrue(postCommentInstance, () => typeof postCommentInstance.updatedAt === "number");

        // Find a post page comment
        postPageComment = subplebbit.posts.pages.hot.comments.find((c) => c.cid === postCommentInstance.cid);
        expect(postPageComment, "Failed to find the post comment in the page").to.exist;

        // Find or generate a post with multiple pages to ensure flat pages exist
        const postWithAllPages = await findOrGeneratePostWithMultiplePages(subplebbit);
        // Get a flat page for replies of that post
        const flatPage = await postWithAllPages.replies.getPage(postWithAllPages.replies.pageCids.newFlat);
        expect(flatPage.comments.length).to.be.greaterThan(0, "Flat page must contain comments");
        replyFromFlatPage = flatPage.comments[0]; // Get a reply from the flat page
        expect(replyFromFlatPage, "Failed to get a reply from the flat page").to.exist;
        expect(replyFromFlatPage.pageComment.comment.depth, "Reply from flat page should have depth > 0").to.be.greaterThan(0);
    });

    after(async () => {
        if (postCommentInstance) await postCommentInstance.stop();
        // No need to stop replyFromFlatPage as it's just data
        if (plebbit) await plebbit.destroy();
    });

    describe("Valid Comments", () => {
        // --- Tests for Post Comment Instance ---
        it("should validate a valid Post Comment instance (validateReplies=undefined)", async () => {
            try {
                await plebbit.validateComment(postCommentInstance);
            } catch (e) {
                expect.fail(`Expected promise to fulfill, but it rejected with: ${e}`);
            }
        });

        it("should validate a valid Post Comment instance (validateReplies=false)", async () => {
            try {
                await plebbit.validateComment(postCommentInstance, { validateReplies: false });
            } catch (e) {
                expect.fail(`Expected promise to fulfill, but it rejected with: ${e}`);
            }
        });

        it("should validate a valid Post Comment instance (validateReplies=true)", async () => {
            try {
                await plebbit.validateComment(postCommentInstance, { validateReplies: true });
            } catch (e) {
                expect.fail(`Expected promise to fulfill, but it rejected with: ${e}`);
            }
        });

        // --- Tests for Post Page Comment ---
        it("should validate a valid Post pageComment object (validateReplies=undefined)", async () => {
            try {
                await plebbit.validateComment(postPageComment);
            } catch (e) {
                expect.fail(`Expected promise to fulfill, but it rejected with: ${e}`);
            }
        });

        it("should validate a valid Post pageComment object (validateReplies=false)", async () => {
            try {
                await plebbit.validateComment(postPageComment, { validateReplies: false });
            } catch (e) {
                expect.fail(`Expected promise to fulfill, but it rejected with: ${e}`);
            }
        });

        it("should validate a valid Post pageComment object (validateReplies=true)", async () => {
            try {
                await plebbit.validateComment(postPageComment, { validateReplies: true });
            } catch (e) {
                expect.fail(`Expected promise to fulfill, but it rejected with: ${e}`);
            }
        });

        // --- Tests for Reply Page Comment (from Flat Page) ---
        it("should validate a valid Reply pageComment object from flat page (validateReplies=undefined)", async () => {
            try {
                await plebbit.validateComment(replyFromFlatPage);
            } catch (e) {
                expect.fail(`Expected promise to fulfill for replyFromFlatPage, but it rejected with: ${e}`);
            }
        });

        it("should validate a valid Reply pageComment object from flat page (validateReplies=false)", async () => {
            try {
                await plebbit.validateComment(replyFromFlatPage, { validateReplies: false });
            } catch (e) {
                expect.fail(`Expected promise to fulfill for replyFromFlatPage, but it rejected with: ${e}`);
            }
        });

        it("should validate a valid Reply pageComment object from flat page (validateReplies=true)", async () => {
            // Since this reply might itself have replies (even though fetched via flat page), validating them is valid
            try {
                await plebbit.validateComment(replyFromFlatPage, { validateReplies: true });
            } catch (e) {
                expect.fail(`Expected promise to fulfill for replyFromFlatPage, but it rejected with: ${e}`);
            }
        });
    });

    describe("Invalid Comments", () => {
        let plebbit; // Use a separate plebbit instance for invalid tests to reset caches if needed
        beforeEach(async () => {
            plebbit = await mockRemotePlebbit();
        });
        afterEach(async () => {
            if (plebbit) await plebbit.destroy();
        });

        // --- Invalid Post Comment Instance Tests ---
        it("should reject Post instance if CommentIpfs signature is invalid", async () => {
            let invalidComment;
            try {
                invalidComment = await plebbit.createComment(postCommentInstance);
                invalidComment._rawCommentIpfs = remeda.clone(invalidComment._rawCommentIpfs);
                invalidComment._rawCommentIpfs.signature.signature += "invalid";
                await plebbit.validateComment(invalidComment);
                expect.fail("Expected promise to reject, but it fulfilled.");
            } catch (e) {
                expect(e).to.be.instanceOf(PlebbitError);
                expect(e.code).to.equal("ERR_INVALID_COMMENT_IPFS");
            } finally {
                if (invalidComment) await invalidComment.stop();
            }
        });

        it("should reject Post instance if CommentUpdate signature is invalid", async () => {
            let invalidComment;
            try {
                invalidComment = await plebbit.createComment(postCommentInstance);
                const tamperedUpdate = remeda.clone(invalidComment._rawCommentUpdate);
                tamperedUpdate.signature.signature += "invalid"; // Tamper signature directly
                invalidComment._rawCommentUpdate = tamperedUpdate;
                await plebbit.validateComment(invalidComment);
                expect.fail("Expected promise to reject, but it fulfilled.");
            } catch (e) {
                expect(e).to.be.instanceOf(PlebbitError);
                expect(e.code).to.equal("ERR_INVALID_COMMENT_UPDATE");
            } finally {
                if (invalidComment) await invalidComment.stop();
            }
        });

        it("should reject Post instance if CommentIpfs data is missing", async () => {
            let invalidComment;
            try {
                invalidComment = await plebbit.createComment(remeda.clone(postCommentInstance));
                invalidComment._rawCommentIpfs = undefined;
                await plebbit.validateComment(invalidComment);
                expect.fail("Expected promise to reject, but it fulfilled.");
            } catch (e) {
                expect(e).to.be.instanceOf(PlebbitError);
                expect(e.code).to.equal("ERR_COMMENT_MISSING_IPFS");
            } finally {
                if (invalidComment) await invalidComment.stop();
            }
        });

        it("should reject Post instance if CommentUpdate data is missing", async () => {
            let invalidComment;
            try {
                invalidComment = await plebbit.createComment(postCommentInstance);
                invalidComment._rawCommentUpdate = undefined;
                await plebbit.validateComment(invalidComment);
                expect.fail("Expected promise to reject, but it fulfilled.");
            } catch (e) {
                expect(e).to.be.instanceOf(PlebbitError);
                expect(e.code).to.equal("ERR_COMMENT_MISSING_UPDATE");
            } finally {
                if (invalidComment) await invalidComment.stop();
            }
        });

        it("should reject Post instance if CID is missing", async () => {
            let invalidComment;
            try {
                invalidComment = await plebbit.createComment(postCommentInstance);
                invalidComment.cid = undefined;
                invalidComment._rawCommentUpdate.cid = undefined;
                await plebbit.validateComment(invalidComment);
                expect.fail("Expected promise to reject, but it fulfilled.");
            } catch (e) {
                expect(e).to.be.instanceOf(PlebbitError);
                expect(e.code).to.equal("ERR_COMMENT_MISSING_CID");
            } finally {
                if (invalidComment) await invalidComment.stop();
            }
        });

        it("should reject Post instance if postCid is missing", async () => {
            let invalidComment;
            try {
                invalidComment = await plebbit.createComment(postCommentInstance);
                invalidComment.postCid = undefined;
                await plebbit.validateComment(invalidComment);
                expect.fail("Expected promise to reject, but it fulfilled.");
            } catch (e) {
                expect(e).to.be.instanceOf(PlebbitError);
                expect(e.code).to.equal("ERR_COMMENT_MISSING_POST_CID");
            } finally {
                if (invalidComment) await invalidComment.stop();
            }
        });

        // --- Invalid Post Page Comment Tests ---
        it("should reject Post pageComment if comment signature is invalid", async () => {
            try {
                const invalidPageComment = remeda.clone(postPageComment);
                invalidPageComment.pageComment.comment.signature.signature += "invalid";
                await plebbit.validateComment(invalidPageComment);
                expect.fail("Expected promise to reject, but it fulfilled.");
            } catch (e) {
                expect(e).to.be.instanceOf(PlebbitError);
                expect(e.code).to.equal("ERR_INVALID_COMMENT_IPFS");
            }
        });

        it("should reject Post pageComment if commentUpdate signature is invalid", async () => {
            try {
                const invalidPageComment = remeda.clone(postPageComment);
                const wrongSigner = await plebbit.createSigner(signers[1]); // Different signer
                const tamperedUpdate = remeda.clone(invalidPageComment.pageComment.commentUpdate);
                tamperedUpdate.signature = await signCommentUpdate(tamperedUpdate, wrongSigner);
                invalidPageComment.pageComment.commentUpdate = tamperedUpdate;
                await plebbit.validateComment(invalidPageComment);
                expect.fail("Expected promise to reject, but it fulfilled.");
            } catch (e) {
                expect(e).to.be.instanceOf(PlebbitError);
                expect(e.code).to.equal("ERR_INVALID_COMMENT_UPDATE");
            }
        });

        it("should reject Post pageComment if comment data is missing", async () => {
            try {
                const invalidPageComment = remeda.clone(postPageComment);
                invalidPageComment.pageComment.comment = undefined;
                await plebbit.validateComment(invalidPageComment);
                expect.fail("Expected promise to reject, but it fulfilled.");
            } catch (e) {
                expect(e).to.be.instanceOf(PlebbitError);
                expect(e.code).to.equal("ERR_COMMENT_MISSING_IPFS");
            }
        });

        it("should reject Post pageComment if commentUpdate data is missing", async () => {
            try {
                const invalidPageComment = remeda.clone(postPageComment);
                invalidPageComment.pageComment.commentUpdate = undefined;
                await plebbit.validateComment(invalidPageComment);
                expect.fail("Expected promise to reject, but it fulfilled.");
            } catch (e) {
                expect(e).to.be.instanceOf(PlebbitError);
                // Missing commentUpdate leads to missing CID check failure
                expect(e.code).to.equal("ERR_COMMENT_MISSING_CID");
            }
        });

        it("should reject Post pageComment if commentUpdate.cid is missing", async () => {
            try {
                const invalidPageComment = remeda.clone(postPageComment);
                invalidPageComment.pageComment.commentUpdate.cid = undefined;
                await plebbit.validateComment(invalidPageComment);
                expect.fail("Expected promise to reject, but it fulfilled.");
            } catch (e) {
                expect(e).to.be.instanceOf(PlebbitError);
                expect(e.code).to.equal("ERR_COMMENT_MISSING_CID");
            }
        });

        it("should reject Post pageComment if postCid is missing", async () => {
            try {
                const invalidPageComment = remeda.clone(postPageComment);
                invalidPageComment.postCid = undefined;
                await plebbit.validateComment(invalidPageComment);
                expect.fail("Expected promise to reject, but it fulfilled.");
            } catch (e) {
                expect(e).to.be.instanceOf(PlebbitError);
                expect(e.code).to.equal("ERR_COMMENT_MISSING_POST_CID");
            }
        });

        // --- Invalid Reply Page Comment (from Flat Page) Tests ---
        it("should reject Reply pageComment (flat) if comment signature is invalid", async () => {
            try {
                const invalidReply = remeda.clone(replyFromFlatPage);
                invalidReply.pageComment.comment.signature.signature += "invalid";
                await plebbit.validateComment(invalidReply);
                expect.fail("Expected promise to reject, but it fulfilled.");
            } catch (e) {
                expect(e).to.be.instanceOf(PlebbitError);
                expect(e.code).to.equal("ERR_INVALID_COMMENT_IPFS");
            }
        });

        it("should reject Reply pageComment (flat) if commentUpdate signature is invalid", async () => {
            try {
                const invalidReply = remeda.clone(replyFromFlatPage);
                const wrongSigner = await plebbit.createSigner(signers[1]); // Different signer
                const tamperedUpdate = remeda.clone(invalidReply.pageComment.commentUpdate);
                tamperedUpdate.signature = await signCommentUpdate(tamperedUpdate, wrongSigner);
                invalidReply.pageComment.commentUpdate = tamperedUpdate;
                await plebbit.validateComment(invalidReply);
                expect.fail("Expected promise to reject, but it fulfilled.");
            } catch (e) {
                expect(e).to.be.instanceOf(PlebbitError);
                expect(e.code).to.equal("ERR_INVALID_COMMENT_UPDATE");
            }
        });

        it("should reject Reply pageComment (flat) if comment data is missing", async () => {
            try {
                const invalidReply = remeda.clone(replyFromFlatPage);
                invalidReply.pageComment.comment = undefined;
                await plebbit.validateComment(invalidReply);
                expect.fail("Expected promise to reject, but it fulfilled.");
            } catch (e) {
                expect(e).to.be.instanceOf(PlebbitError);
                expect(e.code).to.equal("ERR_COMMENT_MISSING_IPFS");
            }
        });

        it("should reject Reply pageComment (flat) if commentUpdate data is missing", async () => {
            try {
                const invalidReply = remeda.clone(replyFromFlatPage);
                invalidReply.pageComment.commentUpdate = undefined;
                await plebbit.validateComment(invalidReply);
                expect.fail("Expected promise to reject, but it fulfilled.");
            } catch (e) {
                expect(e).to.be.instanceOf(PlebbitError);
                // Missing commentUpdate leads to missing CID check failure
                expect(e.code).to.equal("ERR_COMMENT_MISSING_CID");
            }
        });

        it("should reject Reply pageComment (flat) if commentUpdate.cid is missing", async () => {
            try {
                const invalidReply = remeda.clone(replyFromFlatPage);
                invalidReply.pageComment.commentUpdate.cid = undefined;
                await plebbit.validateComment(invalidReply);
                expect.fail("Expected promise to reject, but it fulfilled.");
            } catch (e) {
                expect(e).to.be.instanceOf(PlebbitError);
                expect(e.code).to.equal("ERR_COMMENT_MISSING_CID");
            }
        });

        it("should reject Reply pageComment (flat) if postCid is missing", async () => {
            try {
                const invalidReply = remeda.clone(replyFromFlatPage);
                invalidReply.postCid = undefined;
                await plebbit.validateComment(invalidReply);
                expect.fail("Expected promise to reject, but it fulfilled.");
            } catch (e) {
                expect(e).to.be.instanceOf(PlebbitError);
                expect(e.code).to.equal("ERR_COMMENT_MISSING_POST_CID");
            }
        });
    });
});
