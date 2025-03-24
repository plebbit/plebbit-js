import {
    loadAllPages,
    publishRandomPost,
    mockPlebbit,
    getRemotePlebbitConfigs,
    publishRandomReply,
    isPlebbitFetchingUsingGateways,
    waitTillReplyInParentPagesInstance,
    resolveWhenConditionIsTrue,
    waitTillReplyInParentPages,
    itSkipIfRpc
} from "../../../dist/node/test/test-util.js";
import { REPLIES_SORT_TYPES } from "../../../dist/node/pages/util.js";
import { expect } from "chai";
import signers from "../../fixtures/signers.js";
import * as remeda from "remeda";
import { of as calculateIpfsHash } from "typestub-ipfs-only-hash";
import { messages } from "../../../dist/node/errors.js";

const testRepliesSort = async (commentsWithReplies, replySortName, plebbit) => {
    if (commentsWithReplies.length === 0) throw Error("Can't test replies with when parent comment has no replies");
    for (const commentWithReplies of commentsWithReplies) {
        if (commentWithReplies.depth === 0)
            expect(Object.keys(commentWithReplies.replies.pageCids).sort()).to.deep.equal(Object.keys(REPLIES_SORT_TYPES).sort());
        else
            expect(Object.keys(commentWithReplies.replies.pageCids).sort()).to.deep.equal(
                Object.keys(REPLIES_SORT_TYPES)
                    .filter((sortName) => !sortName.toLowerCase().includes("flat"))
                    .sort()
            );
        const commentInstance = await plebbit.createComment(commentWithReplies);
        const commentPages = await loadAllPages(commentWithReplies.replies.pageCids[replySortName], commentInstance.replies);
        await testListOfSortedComments(commentPages, replySortName, plebbit);
        const repliesWithReplies = commentPages.filter((pageComment) => pageComment.replies);
        if (repliesWithReplies.length > 0) await testRepliesSort(repliesWithReplies, replySortName, plebbit);
    }
};

const subplebbitAddress = signers[0].address;
getRemotePlebbitConfigs().map((config) => {
    describe("comment.replies - " + config.name, async () => {
        let plebbit, subplebbit;
        let postsWithReplies;
        let postWithNestedReplies;
        let firstLevelReply, secondLevelReply, thirdLevelReply;
        before(async () => {
            plebbit = await config.plebbitInstancePromise();
            subplebbit = await plebbit.getSubplebbit(subplebbitAddress);
            postsWithReplies = (await loadAllPages(subplebbit.posts.pageCids.new, subplebbit.posts)).filter(
                (post) => post.replies?.pages?.topAll
            );
            expect(postsWithReplies.length).to.be.greaterThan(0);
            postWithNestedReplies = await publishRandomPost(subplebbitAddress, plebbit);
            firstLevelReply = await publishRandomReply(postWithNestedReplies, plebbit);
            secondLevelReply = await publishRandomReply(firstLevelReply, plebbit);
            thirdLevelReply = await publishRandomReply(secondLevelReply, plebbit);
            await waitTillReplyInParentPages(thirdLevelReply, plebbit);
        });

        it(`Stringified comment.replies still have all props`, async () => {
            for (const post of postsWithReplies) {
                const stringifiedReplies = JSON.parse(JSON.stringify(post.replies)).pages.topAll.comments;
                for (const reply of stringifiedReplies) testCommentFields(reply);
            }
        });

        Object.keys(REPLIES_SORT_TYPES).map((sortName) =>
            it(`${sortName} pages under a comment are sorted correctly`, async () =>
                await testRepliesSort(postsWithReplies, sortName, subplebbit._plebbit))
        );

        Object.keys(REPLIES_SORT_TYPES)
            .filter((replySortName) => REPLIES_SORT_TYPES[replySortName].flat)
            .map((flatSortName) =>
                it(`flat sort (${flatSortName}) has no replies field within its comments`, async () => {
                    await postWithNestedReplies.update();
                    await resolveWhenConditionIsTrue(postWithNestedReplies, () => typeof postWithNestedReplies.updatedAt === "number");
                    await postWithNestedReplies.stop();

                    const flatReplies = await loadAllPages(
                        postWithNestedReplies.replies.pageCids[flatSortName],
                        postWithNestedReplies.replies
                    );
                    // Verify all published replies are present in flatReplies
                    const flatRepliesCids = flatReplies.map((reply) => reply.cid);
                    expect(flatRepliesCids).to.include(firstLevelReply.cid);
                    expect(flatRepliesCids).to.include(secondLevelReply.cid);
                    expect(flatRepliesCids).to.include(thirdLevelReply.cid);

                    expect(flatReplies.length).to.equal(3);
                    flatReplies.forEach((reply) => expect(reply.replies).to.be.undefined);
                })
            );

        it(`The PageIpfs.comments.comment always correspond to PageIpfs.comment.commentUpdate.cid`, async () => {
            for (const post of postsWithReplies) {
                const pageCids = Object.values(post.replies.pageCids);

                for (const pageCid of pageCids) {
                    const pageIpfs = JSON.parse(await plebbit.fetchCid(pageCid)); // will have PageIpfs type

                    for (const commentInPageIpfs of pageIpfs.comments) {
                        const calculatedCid = await calculateIpfsHash(JSON.stringify(commentInPageIpfs.comment));
                        expect(calculatedCid).to.equal(commentInPageIpfs.commentUpdate.cid);
                    }
                }
            }
        });
    });

    describe("replies.validatePage validation tests", async () => {
        let plebbit, postWithReplies;

        before(async () => {
            plebbit = await config.plebbitInstancePromise({ validatePages: false });
            postWithReplies = await publishRandomPost(subplebbitAddress, plebbit);
            const reply = await publishRandomReply(postWithReplies, plebbit);
            await publishRandomReply(reply, plebbit);

            await postWithReplies.update();
            await resolveWhenConditionIsTrue(postWithReplies, () => postWithReplies.replies.pageCids?.new);
            await waitTillReplyInParentPagesInstance(reply, plebbit);
            await postWithReplies.stop();
        });

        it(`replies.validatePage will throw if any comment is invalid`, async () => {
            const plebbit = await config.plebbitInstancePromise({ validatePages: false });

            const pageWithInvalidComment = await postWithReplies.replies.getPage(postWithReplies.replies.pageCids.new);
            pageWithInvalidComment.comments[0].pageComment.comment.content = "this is to invalidate signature";

            const post = await plebbit.getComment(postWithReplies.cid);
            try {
                await post.replies.validatePage(pageWithInvalidComment);
                expect.fail("Should have thrown");
            } catch (e) {
                expect(e.code).to.equal("ERR_REPLIES_PAGE_IS_INVALID");
                expect(e.details.signatureValidity.reason).to.equal(messages.ERR_SIGNATURE_IS_INVALID);
            }
        });

        it(`replies.validatePage will throw if any comment is not of the same post`, async () => {
            const plebbit = await config.plebbitInstancePromise({ validatePages: false });

            const pageWithInvalidComment = await postWithReplies.replies.getPage(postWithReplies.replies.pageCids.new);
            pageWithInvalidComment.comments[0].pageComment.comment.postCid += "1"; // will be a different post cid

            const post = await plebbit.getComment(postWithReplies.cid);
            try {
                await post.replies.validatePage(pageWithInvalidComment);
                expect.fail("Should have thrown");
            } catch (e) {
                expect(e.code).to.equal("ERR_REPLIES_PAGE_IS_INVALID");
                expect(e.details.signatureValidity.reason).to.equal(
                    messages.ERR_PAGE_COMMENT_POST_CID_IS_NOT_SAME_AS_POST_CID_OF_COMMENT_INSTANCE
                );
            }
        });

        it(`replies.validatePage will throw if postCid not defined on the parent comment`, async () => {
            const plebbit = await config.plebbitInstancePromise({ validatePages: false });

            const pageWithInvalidComment = await postWithReplies.replies.getPage(postWithReplies.replies.pageCids.new);

            const post = await plebbit.getComment(postWithReplies.cid);
            delete post.postCid;
            try {
                await post.replies.validatePage(pageWithInvalidComment);
                expect.fail("Should have thrown");
            } catch (e) {
                expect(e.code).to.equal("ERR_USER_ATTEMPTS_TO_VALIDATE_REPLIES_PAGE_WITHOUT_PARENT_COMMENT_POST_CID");
            }
        });

        it("validates flat pages correctly", async () => {
            // Get a flat page
            const flatSortName = Object.keys(REPLIES_SORT_TYPES).find((name) => REPLIES_SORT_TYPES[name].flat);
            const flatPage = await postWithReplies.replies.getPage(postWithReplies.replies.pageCids[flatSortName]);
            // Verify that flat pages contain comments with different depths
            expect(flatPage.comments.some((comment) => comment.pageComment.comment.depth > 1)).to.be.true;
            expect(flatPage.comments.map((comment) => comment.pageComment.comment.depth)).to.not.deep.equal(
                Array(flatPage.comments.length).fill(flatPage.comments[0].pageComment.comment.depth)
            );

            // This should pass validation
            await postWithReplies.replies.validatePage(flatPage);

            // Modify the page to make it invalid and test that validation fails
            const invalidFlatPage = JSON.parse(JSON.stringify(flatPage));
            invalidFlatPage.comments[0].pageComment.comment.content = "modified content to invalidate signature";

            try {
                await postWithReplies.replies.validatePage(invalidFlatPage);
                expect.fail("Should have thrown");
            } catch (e) {
                expect(e.code).to.equal("ERR_REPLIES_PAGE_IS_INVALID");
                expect(e.details.signatureValidity.reason).to.equal(messages.ERR_SIGNATURE_IS_INVALID);
            }
        });

        it("fails validation when a comment has invalid depth (not parent.depth + 1)", async () => {
            const page = await postWithReplies.replies.getPage(postWithReplies.replies.pageCids.new);
            const invalidPage = JSON.parse(JSON.stringify(page));

            invalidPage.comments[0].pageComment.comment.depth = 5;
            invalidPage.comments[0].pageComment.commentUpdate.cid = await calculateIpfsHash(
                JSON.stringify(invalidPage.comments[0].pageComment.comment)
            );
            try {
                await postWithReplies.replies.validatePage(invalidPage);
                expect.fail("Should have thrown");
            } catch (e) {
                expect(e.code).to.equal("ERR_REPLIES_PAGE_IS_INVALID");
                expect(e.details.signatureValidity.reason).to.equal(messages.ERR_PAGE_COMMENT_DEPTH_VALUE_IS_NOT_RELATIVE_TO_ITS_PARENT);
            }
        });

        it("fails validation when a comment has different subplebbitAddress", async () => {
            const page = await postWithReplies.replies.getPage(postWithReplies.replies.pageCids.new);
            const invalidPage = JSON.parse(JSON.stringify(page));

            invalidPage.comments[0].pageComment.comment.subplebbitAddress = "different-address";
            invalidPage.comments[0].pageComment.commentUpdate.cid = await calculateIpfsHash(
                JSON.stringify(invalidPage.comments[0].pageComment.comment)
            );

            try {
                await postWithReplies.replies.validatePage(invalidPage);
                expect.fail("Should have thrown");
            } catch (e) {
                expect(e.code).to.equal("ERR_REPLIES_PAGE_IS_INVALID");
                expect(e.details.signatureValidity.reason).to.equal(messages.ERR_COMMENT_IN_PAGE_BELONG_TO_DIFFERENT_SUB);
            }
        });

        it("fails validation when a comment has incorrect parentCid", async () => {
            const page = await postWithReplies.replies.getPage(postWithReplies.replies.pageCids.new);
            const invalidPage = JSON.parse(JSON.stringify(page));

            // Change the parentCid to an invalid value
            invalidPage.comments[0].pageComment.comment.parentCid = "QmInvalidParentCid";

            try {
                await postWithReplies.replies.validatePage(invalidPage);
                expect.fail("Should have thrown");
            } catch (e) {
                expect(e.code).to.equal("ERR_REPLIES_PAGE_IS_INVALID");
                expect(e.details.signatureValidity.reason).to.equal(messages.ERR_PARENT_CID_OF_COMMENT_IN_PAGE_IS_NOT_CORRECT);
            }
        });

        it("fails validation when calculated CID doesn't match commentUpdate.cid", async () => {
            const page = await postWithReplies.replies.getPage(postWithReplies.replies.pageCids.new);
            const invalidPage = JSON.parse(JSON.stringify(page));

            // Modify the comment but keep the same commentUpdate.cid
            invalidPage.comments[0].pageComment.comment.timestamp += 1000; // Change timestamp
            // The commentUpdate.cid will now be incorrect because it was calculated from the original comment

            try {
                await postWithReplies.replies.validatePage(invalidPage);
                expect.fail("Should have thrown");
            } catch (e) {
                expect(e.code).to.equal("ERR_REPLIES_PAGE_IS_INVALID");
                expect(e.details.signatureValidity.reason).to.equal(messages.ERR_SIGNATURE_IS_INVALID);
            }
        });

        it("validates empty pages (no comments)", async () => {
            // Create an empty page
            const validPage = await postWithReplies.replies.getPage(postWithReplies.replies.pageCids.new);
            const emptyPage = {
                ...validPage,
                comments: []
            };

            // Empty pages should be valid
            await postWithReplies.replies.validatePage(emptyPage);
        });
    });

    describe(`comment.replies.getPage - ${config.name}`, async () => {
        itSkipIfRpc("replies.getPage will throw a timeout error when request times out", async () => {
            // Create a plebbit instance with a very short timeout for page-ipfs
            const plebbit = await mockPlebbit({ validatePages: false });

            plebbit._timeouts["page-ipfs"] = 100;

            // Create a comment with a CID that doesn't exist or will time out
            const nonExistentCid = "QmbSiusGgY4Uk5LdAe91bzLkBzidyKyKHRKwhXPDz7gGzx"; // Random CID that doesn't exist

            const comment = await plebbit.getComment(postWithNestedReplies.cid);

            // Override the pageCid to use our non-existent CID
            comment.replies.pageCids.new = nonExistentCid;

            try {
                // This should time out
                await comment.replies.getPage(nonExistentCid);
                expect.fail("Should have timed out");
            } catch (e) {
                if (isPlebbitFetchingUsingGateways(plebbit)) {
                    expect(e.code).to.equal("ERR_FAILED_TO_FETCH_PAGE_IPFS_FROM_GATEWAYS");
                    for (const gatewayUrl of Object.keys(plebbit.clients.ipfsGateways))
                        expect(e.details.gatewayToError[gatewayUrl].code).to.equal("ERR_GATEWAY_TIMED_OUT_OR_ABORTED");
                } else {
                    expect(e.code).to.equal("ERR_FETCH_CID_P2P_TIMEOUT");
                }
            }
        });
    });
});
