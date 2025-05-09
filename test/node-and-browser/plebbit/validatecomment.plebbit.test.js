import { expect } from "chai";
import {
    mockRemotePlebbit,
    describeSkipIfRpc,
    resolveWhenConditionIsTrue,
    findOrGeneratePostWithMultiplePages,
    publishRandomReply
} from "../../../dist/node/test/test-util.js";
import { PlebbitError } from "../../../dist/node/plebbit-error.js";
import signers from "../../fixtures/signers.js";
import * as remeda from "remeda";
import { signCommentUpdate } from "../../../dist/node/signer/signatures.js";

describeSkipIfRpc("plebbit.validateComment", async () => {
    let plebbit, subplebbit, postCommentInstance, postPageComment, replyFromFlatPage, replyFromBestPage;

    before(async () => {
        plebbit = await mockRemotePlebbit();
        subplebbit = await plebbit.getSubplebbit(signers[0].address);

        await resolveWhenConditionIsTrue(subplebbit, () => subplebbit.posts.pages.hot);

        // Get a post instance
        postCommentInstance = await plebbit.getComment(subplebbit.posts.pages.hot.comments[0].cid);
        await postCommentInstance.update();
        await resolveWhenConditionIsTrue(postCommentInstance, () => typeof postCommentInstance.updatedAt === "number");

        // Find a post page comment
        postPageComment = subplebbit.posts.pages.hot.comments.find((c) => c.cid === postCommentInstance.cid);
        expect(postPageComment, "Failed to find the post comment in the page").to.exist;

        // --- Setup for Reply Tests ---
        // Find or generate a post with multiple pages to ensure flat pages exist
        const postWithReplies = await findOrGeneratePostWithMultiplePages(subplebbit);
        const postWithRepliesInstance = await plebbit.getComment(postWithReplies.cid);
        await postWithRepliesInstance.update(); // Ensure it has data

        // Ensure there's at least one reply on the 'best' page
        if (!postWithRepliesInstance.replies?.pages?.best?.comments?.length > 0) {
            console.log(`Post ${postWithRepliesInstance.cid} has no replies on 'best' page, creating one...`);
            await publishRandomReply(postWithRepliesInstance, plebbit);
            await postWithRepliesInstance.update(); // Update again to fetch the new reply
            await resolveWhenConditionIsTrue(
                postWithRepliesInstance,
                () => postWithRepliesInstance.replies.pages.best?.comments?.length > 0
            );
            console.log(`Reply created for post ${postWithRepliesInstance.cid}.`);
        }
        expect(
            postWithRepliesInstance.replies?.pages?.best?.comments?.length,
            "Post must have replies on 'best' page for test"
        ).to.be.greaterThan(0);
        replyFromBestPage = postWithRepliesInstance.replies.pages.best.comments[0];
        expect(replyFromBestPage, "Failed to get a reply from the 'best' page").to.exist;

        // Get a flat page for replies of that post
        const flatPage = await postWithRepliesInstance.replies.getPage(postWithReplies.replies.pageCids.newFlat);
        expect(flatPage.comments.length).to.be.greaterThan(0, "Flat page must contain comments");
        replyFromFlatPage = flatPage.comments[0]; // Get a reply from the flat page
        expect(replyFromFlatPage, "Failed to get a reply from the flat page").to.exist;
        expect(replyFromFlatPage.raw.comment.depth, "Reply from flat page should have depth > 0").to.be.greaterThan(0);

        // Clean up the extra instance
        await postWithRepliesInstance.stop();
    });

    after(async () => {
        if (postCommentInstance) await postCommentInstance.stop();
        // No need to stop replyFromFlatPage/replyFromBestPage as it's just data
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

        // --- Tests for Reply Page Comment (from Best Page) ---
        it("should validate a valid Reply pageComment object from best page (validateReplies=undefined)", async () => {
            try {
                await plebbit.validateComment(replyFromBestPage);
            } catch (e) {
                expect.fail(`Expected promise to fulfill for replyFromBestPage, but it rejected with: ${e}`);
            }
        });

        it("should validate a valid Reply pageComment object from best page (validateReplies=false)", async () => {
            try {
                await plebbit.validateComment(replyFromBestPage, { validateReplies: false });
            } catch (e) {
                expect.fail(`Expected promise to fulfill for replyFromBestPage, but it rejected with: ${e}`);
            }
        });

        it("should validate a valid Reply pageComment object from best page (validateReplies=true)", async () => {
            // Since this reply might itself have replies, validating them is valid
            try {
                await plebbit.validateComment(replyFromBestPage, { validateReplies: true });
            } catch (e) {
                expect.fail(`Expected promise to fulfill for replyFromBestPage, but it rejected with: ${e}`);
            }
        });
    });

    describe("Invalid Comments", () => {
        let plebbit; // Use a separate plebbit instance for invalid tests to reset caches if needed
        let sourcePostCommentInstance; // Need a valid instance for cloning/copying tests
        beforeEach(async () => {
            plebbit = await mockRemotePlebbit();
            // Get a valid instance to use as source for invalid data tests
            const sub = await plebbit.getSubplebbit(signers[0].address);
            await resolveWhenConditionIsTrue(sub, () => typeof sub.lastPostCid === "string");
            sourcePostCommentInstance = await plebbit.getComment(sub.lastPostCid);
            await sourcePostCommentInstance.update();
            await resolveWhenConditionIsTrue(sourcePostCommentInstance, () => typeof sourcePostCommentInstance.updatedAt === "number");
        });
        afterEach(async () => {
            if (sourcePostCommentInstance) await sourcePostCommentInstance.stop();
            if (plebbit) await plebbit.destroy();
        });

        // --- Invalid Post Comment Instance Tests ---
        it("should reject Post instance if CommentIpfs signature is invalid", async () => {
            let invalidComment;
            try {
                invalidComment = await plebbit.createComment(sourcePostCommentInstance); // Use source
                invalidComment.raw.comment = remeda.clone(invalidComment.raw.comment);
                invalidComment.raw.comment.signature.signature += "invalid";
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
                invalidComment = await plebbit.createComment(sourcePostCommentInstance); // Use source
                const tamperedUpdate = remeda.clone(invalidComment.raw.commentUpdate);
                tamperedUpdate.signature.signature += "invalid"; // Tamper signature directly
                invalidComment.raw.commentUpdate = tamperedUpdate;
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
                invalidComment = await plebbit.createComment(remeda.clone(sourcePostCommentInstance)); // Use source
                invalidComment.raw.comment = undefined;
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
                invalidComment = await plebbit.createComment(sourcePostCommentInstance); // Use source
                invalidComment.raw.commentUpdate = undefined;
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
                invalidComment = await plebbit.createComment(sourcePostCommentInstance); // Use source
                invalidComment.cid = undefined;
                invalidComment.raw.commentUpdate.cid = undefined;
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
                invalidComment = await plebbit.createComment(sourcePostCommentInstance); // Use source
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

        // --- Invalid Shallow/Deep Copy Tests ---
        it("should fulfill when validating a shallow copy of a valid Comment instance", async () => {
            // Shallow copies lack prototype chain but retain own enumerable properties.
            // validateComment only accesses .raw, .cid, .postCid which are preserved.
            const shallowCopy = { ...sourcePostCommentInstance };
            try {
                await plebbit.validateComment(shallowCopy);
                // Expect fulfillment
            } catch (e) {
                expect.fail(`Expected promise to fulfill for shallow copy, but it rejected with: ${e}`);
            }
        });

        it("should fulfill when validating a deep-cloned plain object of a valid Comment instance", async () => {
            // Deep copies (via JSON) lose methods/prototype but retain serializable data.
            // validateComment only accesses .raw, .cid, .postCid which are preserved.
            const deepCopy = JSON.parse(JSON.stringify(sourcePostCommentInstance));
            try {
                await plebbit.validateComment(deepCopy);
                // Expect fulfillment
            } catch (e) {
                expect.fail(`Expected promise to fulfill for deep copy, but it rejected with: ${e}`);
            }
        });

        // --- Invalid Post Page Comment Tests ---
        it("should reject Post pageComment if comment signature is invalid", async () => {
            try {
                const invalidPageComment = remeda.clone(postPageComment);
                invalidPageComment.raw.comment.signature.signature += "invalid";
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
                const tamperedUpdate = remeda.clone(invalidPageComment.raw.commentUpdate);
                tamperedUpdate.signature = await signCommentUpdate(tamperedUpdate, wrongSigner);
                invalidPageComment.raw.commentUpdate = tamperedUpdate;
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
                invalidPageComment.raw.comment = undefined;
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
                invalidPageComment.raw.commentUpdate = undefined;
                await plebbit.validateComment(invalidPageComment);
                expect.fail("Expected promise to reject, but it fulfilled.");
            } catch (e) {
                expect(e).to.be.instanceOf(PlebbitError);
                expect(e.code).to.equal("ERR_COMMENT_MISSING_UPDATE");
            }
        });

        it("should reject Post pageComment if commentUpdate.cid is missing", async () => {
            try {
                const invalidPageComment = remeda.clone(postPageComment);
                invalidPageComment.raw.commentUpdate.cid = undefined;
                invalidPageComment.cid = undefined;
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
    });
});
