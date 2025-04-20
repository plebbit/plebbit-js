import { expect } from "chai";
import { mockRemotePlebbit, describeSkipIfRpc, resolveWhenConditionIsTrue } from "../../../dist/node/test/test-util.js";
import { PlebbitError } from "../../../dist/node/plebbit-error.js";
import signers from "../../fixtures/signers.js";
import * as remeda from "remeda";
import { signCommentUpdate } from "../../../dist/node/signer/signatures.js";

describeSkipIfRpc("plebbit.validateComment - subplebbit.posts", async () => {
    let plebbit, subplebbit, posts, postCommentInstance, page, postPageComment;

    before(async () => {
        plebbit = await mockRemotePlebbit();
        // Use a known subplebbit address for consistency if needed, otherwise create/get one
        subplebbit = await plebbit.getSubplebbit(signers[0].address);

        await resolveWhenConditionIsTrue(subplebbit, () => typeof subplebbit.lastPostCid === "string");
        // Get a comment instance
        postCommentInstance = await plebbit.getComment(subplebbit.lastPostCid);
        await postCommentInstance.update();
        await resolveWhenConditionIsTrue(postCommentInstance, () => typeof postCommentInstance.updatedAt === "number");

        // Find the specific comment in the page comments
        postPageComment = subplebbit.posts.pages.hot.comments[0];
        expect(postPageComment, "Failed to find the comment in the page").to.exist;
    });

    after(async () => {
        if (postCommentInstance) await postCommentInstance.stop();
        if (plebbit) await plebbit.destroy();
    });

    describe("Valid Comments", () => {
        it("should validate a valid Comment instance (validateReplies=undefined)", async () => {
            try {
                await plebbit.validateComment(postCommentInstance);
            } catch (e) {
                expect.fail(`Expected promise to fulfill, but it rejected with: ${e}`);
            }
        });

        it("should validate a valid Comment instance (validateReplies=false)", async () => {
            try {
                await plebbit.validateComment(postCommentInstance, { validateReplies: false });
            } catch (e) {
                expect.fail(`Expected promise to fulfill, but it rejected with: ${e}`);
            }
        });

        it("should validate a valid Comment instance (validateReplies=true)", async () => {
            try {
                // This test assumes the comment might have replies, but validation should pass even if it doesn't
                // If validatePages=true (default or explicit), it will attempt page validation internally if needed.
                await plebbit.validateComment(postCommentInstance, { validateReplies: true });
            } catch (e) {
                expect.fail(`Expected promise to fulfill, but it rejected with: ${e}`);
            }
        });

        it("should validate a valid pageComment object (validateReplies=undefined)", async () => {
            try {
                await plebbit.validateComment(postPageComment);
            } catch (e) {
                expect.fail(`Expected promise to fulfill, but it rejected with: ${e}`);
            }
        });

        it("should validate a valid pageComment object (validateReplies=false)", async () => {
            try {
                await plebbit.validateComment(postPageComment, { validateReplies: false });
            } catch (e) {
                expect.fail(`Expected promise to fulfill, but it rejected with: ${e}`);
            }
        });

        it("should validate a valid pageComment object (validateReplies=true)", async () => {
            try {
                await plebbit.validateComment(postPageComment, { validateReplies: true });
            } catch (e) {
                expect.fail(`Expected promise to fulfill, but it rejected with: ${e}`);
            }
        });

        // Note: The above tests implicitly cover flat pages if the fetched comment has no replies.
        // We can add a specific test if we ensure creation of a comment with no replies.
    });

    describe("Invalid Comments", () => {
        let plebbit;
        beforeEach(async () => {
            plebbit = await mockRemotePlebbit();
        });
        afterEach(async () => {
            if (plebbit) await plebbit.destroy(); // need to reset the cache of signatures
        });
        it("should reject if CommentIpfs signature is invalid", async () => {
            let invalidComment;
            try {
                invalidComment = await plebbit.createComment(postCommentInstance); // Clone to avoid modifying original
                invalidComment._rawCommentIpfs = remeda.clone(invalidComment._rawCommentIpfs);
                invalidComment._rawCommentIpfs.signature.signature += "invalid"; // Tamper signature
                await plebbit.validateComment(invalidComment);
                expect.fail("Expected promise to reject, but it fulfilled.");
            } catch (e) {
                expect(e).to.be.instanceOf(PlebbitError);
                expect(e.code).to.equal("ERR_INVALID_COMMENT_IPFS");
            } finally {
                if (invalidComment) await invalidComment.stop(); // Clean up cloned instance resources
            }
        });

        it("should reject if pageComment.comment signature is invalid", async () => {
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

        it("should reject if CommentUpdate signature is invalid", async () => {
            let invalidComment;
            try {
                invalidComment = await plebbit.createComment(postCommentInstance);
                // Sign with a wrong key (using signer[1] instead of subplebbit's signer[0])
                const wrongSigner = await plebbit.createSigner(signers[1]);
                const tamperedUpdate = remeda.clone(invalidComment._rawCommentUpdate);
                tamperedUpdate.signature.signature += "invalid";
                invalidComment._rawCommentUpdate = tamperedUpdate; // Assign tampered update
                await plebbit.validateComment(invalidComment);
                expect.fail("Expected promise to reject, but it fulfilled.");
            } catch (e) {
                expect(e).to.be.instanceOf(PlebbitError);
                expect(e.code).to.equal("ERR_INVALID_COMMENT_UPDATE"); // It fails because update isn't signed by the correct subplebbit key
            } finally {
                if (invalidComment) await invalidComment.stop();
            }
        });

        it("should reject if pageComment.commentUpdate signature is invalid", async () => {
            try {
                const invalidPageComment = remeda.clone(postPageComment);
                // Sign with a wrong key (using signer[1] instead of subplebbit's signer[0])
                const wrongSigner = await plebbit.createSigner(signers[1]);
                const tamperedUpdate = remeda.clone(invalidPageComment.pageComment.commentUpdate);
                tamperedUpdate.signature = await signCommentUpdate(tamperedUpdate, wrongSigner); // Re-sign with wrong key
                invalidPageComment.pageComment.commentUpdate = tamperedUpdate; // Assign tampered update
                await plebbit.validateComment(invalidPageComment);
                expect.fail("Expected promise to reject, but it fulfilled.");
            } catch (e) {
                expect(e).to.be.instanceOf(PlebbitError);
                expect(e.code).to.equal("ERR_INVALID_COMMENT_UPDATE"); // It fails because update isn't signed by the correct subplebbit key
            }
        });

        it("should reject if CommentIpfs data is missing", async () => {
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

        it("should reject if pageComment.comment data is missing", async () => {
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

        it("should reject if CommentUpdate data is missing", async () => {
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

        it("should reject if pageComment.commentUpdate data is missing", async () => {
            try {
                const invalidPageComment = remeda.clone(postPageComment);
                invalidPageComment.pageComment.commentUpdate = undefined;
                await plebbit.validateComment(invalidPageComment);
                expect.fail("Expected promise to reject, but it fulfilled.");
            } catch (e) {
                expect(e).to.be.instanceOf(PlebbitError);
                expect(e.code).to.equal("ERR_COMMENT_MISSING_CID");
            }
        });

        it("should reject if CID is missing", async () => {
            let invalidComment;
            try {
                invalidComment = await plebbit.createComment(postCommentInstance);
                invalidComment.cid = undefined; // CID is primarily derived/set, but let's force it for test
                invalidComment._rawCommentUpdate.cid = undefined; // Also remove from update where it's checked
                await plebbit.validateComment(invalidComment);
                expect.fail("Expected promise to reject, but it fulfilled.");
            } catch (e) {
                expect(e).to.be.instanceOf(PlebbitError);
                expect(e.code).to.equal("ERR_COMMENT_MISSING_CID");
            } finally {
                if (invalidComment) await invalidComment.stop();
            }
        });

        it("should reject if pageComment.commentUpdate.cid is missing", async () => {
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

        it("should reject if postCid is missing", async () => {
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

        it("should reject if pageComment.postCid is missing", async () => {
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
    });
});
