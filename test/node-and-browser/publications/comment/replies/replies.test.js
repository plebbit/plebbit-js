import { expect } from "chai";
import {
    loadAllPages,
    publishRandomPost,
    getAvailablePlebbitConfigsToTestAgainst,
    publishRandomReply,
    mockPlebbitV2,
    forceSubplebbitToGenerateAllRepliesPages,
    loadAllPagesBySortName,
    isPlebbitFetchingUsingGateways,
    waitTillReplyInParentPagesInstance,
    resolveWhenConditionIsTrue,
    itSkipIfRpc
} from "../../../../../dist/node/test/test-util.js";
import { POST_REPLIES_SORT_TYPES, REPLY_REPLIES_SORT_TYPES } from "../../../../../dist/node/pages/util.js";
import signers from "../../../../fixtures/signers.js";
import { of as calculateIpfsHash } from "typestub-ipfs-only-hash";
import { messages } from "../../../../../dist/node/errors.js";
import { testCommentFieldsInPageJson, testPageCommentsIfSortedCorrectly } from "../../../pages/pages-test-util.js";
import { describe, it } from "vitest";

const subplebbitAddress = signers[0].address;

const testPostRepliesSort = async (post, replySortName, subplebbit) => {
    const repliesUnderPost = await loadAllPagesBySortName(replySortName, post.replies);
    if (repliesUnderPost.length === 0) throw Error("Can't test replies with when parent comment has no replies");
    await testPageCommentsIfSortedCorrectly(repliesUnderPost, replySortName, subplebbit);

    for (const replyUnderPost of repliesUnderPost) {
        expect(replyUnderPost.postCid).to.equal(post.cid);
        if (replyUnderPost.depth === 1) expect(replyUnderPost.parentCid).to.equal(post.cid);
    }
};

const testReplyRepliesSort = async (reply, replySortName, subplebbit) => {
    const repliesUnderReply = await loadAllPagesBySortName(replySortName, reply.replies);
    if (repliesUnderReply.length === 0) throw Error("Can't test replies with when parent comment has no replies");
    await testPageCommentsIfSortedCorrectly(repliesUnderReply, replySortName, subplebbit);

    for (const replyUnderReply of repliesUnderReply) {
        expect(replyUnderReply.postCid).to.equal(reply.postCid);
        expect(replyUnderReply.parentCid).to.equal(reply.cid);
    }
};

getAvailablePlebbitConfigsToTestAgainst().map((config) => {
    describe("post.replies - " + config.name, async () => {
        let plebbit, subplebbit;
        let post, firstLevelReply, secondLevelReply, thirdLevelReply;

        before(async () => {
            plebbit = await config.plebbitInstancePromise();
            subplebbit = await plebbit.getSubplebbit(signers[0].address);
            post = await publishRandomPost(subplebbit.address, plebbit);
            await post.update();
            await resolveWhenConditionIsTrue({ toUpdate: post, predicate: () => typeof post.updatedAt === "number" });
        });

        after(async () => {
            await plebbit.destroy();
        });

        it(`A post should have no replies field if it doesn't have replies`, async () => {
            expect(post.replies.pages).to.deep.equal({});
            expect(post.replies.pageCids).to.deep.equal({});
        });

        it(`If all replies fit in a single preloaded page, there should not be any pageCids on CommentUpdate`, async () => {
            firstLevelReply = await publishRandomReply(post, plebbit);
            secondLevelReply = await publishRandomReply(firstLevelReply, plebbit);
            thirdLevelReply = await publishRandomReply(secondLevelReply, plebbit);
            await waitTillReplyInParentPagesInstance(firstLevelReply, post);
            await post.stop(); // make sure updates are stopped so it does't change props while run our expect statements
            expect(post.replies.pages.best).to.exist;
            expect(post.replies.pages.best.comments.length).to.be.at.least(1); // we don't know if other tests will publish more replies
            expect(post.replies.pages.best.comments[0].cid).to.equal(firstLevelReply.cid);
            expect(post.replies.pages.best.nextCid).to.be.undefined; // only a single preloaded page
            expect(post.replies.pageCids).to.deep.equal({}); // no page cids cause it's a single preloaded page
            await post.update();
        });
        it(`A preloaded page should not have a corresponding CID in post.replies.pageCids`, async () => {
            for (const preloadedPageSortName of Object.keys(post.replies.pages))
                expect(post.replies.pageCids[preloadedPageSortName]).to.be.undefined;
        });

        it(`A post should have pageCids after maxing out its replies`, async () => {
            await forceSubplebbitToGenerateAllRepliesPages(post);
            expect(post.replies.pageCids).to.not.deep.equal({}); // we have multiple pages now
            expect(post.replies.pages.best.nextCid).to.exist;
        });

        it(`A preloaded page should not have a CID in post.replies.pageCids after maxing out its replies`, async () => {
            for (const preloadedPageSortName of Object.keys(post.replies.pages))
                expect(post.replies.pageCids[preloadedPageSortName]).to.be.undefined;
        });

        it(`Stringified post.replies still have all props`, async () => {
            const preloadedPages = post.replies.pages;
            for (const preloadedSortType of Object.keys(preloadedPages)) {
                const stringifiedReplies = JSON.parse(JSON.stringify(post.replies)).pages[preloadedSortType].comments;
                for (const reply of stringifiedReplies) testCommentFieldsInPageJson(reply);
            }
        });

        it(`A post has the right pageCids under it after maxing out its replies`, async () => {
            const pageCidsWithoutPreloadedPage = Object.keys(POST_REPLIES_SORT_TYPES).filter(
                (pageSortName) => !Object.keys(post.replies.pages).includes(pageSortName)
            );
            expect(Object.keys(post.replies.pageCids).sort()).to.deep.equal(pageCidsWithoutPreloadedPage.sort());
        });

        Object.keys(POST_REPLIES_SORT_TYPES).map((sortName) =>
            it.concurrent(
                `${sortName} pages under a post are sorted correctly`,
                async () => await testPostRepliesSort(post, sortName, subplebbit)
            )
        );

        Object.keys(POST_REPLIES_SORT_TYPES)
            .filter((replySortName) => POST_REPLIES_SORT_TYPES[replySortName].flat)
            .map((flatSortName) =>
                it.concurrent(
                    `flat sort (${flatSortName}) includes all nested fields, and has no replies field within its comments`,
                    async () => {
                        await post.update();
                        await resolveWhenConditionIsTrue({ toUpdate: post, predicate: () => typeof post.updatedAt === "number" });
                        await post.stop();

                        const flatReplies = await loadAllPages(post.replies.pageCids[flatSortName], post.replies);
                        // Verify all published replies are present in flatReplies
                        const flatRepliesCids = flatReplies.map((reply) => reply.cid);
                        expect(flatRepliesCids).to.include(firstLevelReply.cid);
                        expect(flatRepliesCids).to.include(secondLevelReply.cid);
                        expect(flatRepliesCids).to.include(thirdLevelReply.cid);

                        expect(flatReplies.length).to.be.greaterThan(3);
                        flatReplies.forEach((reply) => expect(reply.replies).to.be.undefined);
                    }
                )
            );

        it.concurrent(`The PageIpfs.comments.comment always correspond to PageIpfs.comment.commentUpdate.cid`, async () => {
            for (const postReplySortName of Object.keys(POST_REPLIES_SORT_TYPES)) {
                const commentsFromEachPage = await loadAllPagesBySortName(postReplySortName, post.replies);
                const commentsPageIpfs = commentsFromEachPage.map((comment) => comment.raw);

                for (const commentInPageIpfs of commentsPageIpfs) {
                    const calculatedCid = await calculateIpfsHash(JSON.stringify(commentInPageIpfs.comment));
                    expect(calculatedCid).to.equal(commentInPageIpfs.commentUpdate.cid);
                }
            }
        });
    });
});

getAvailablePlebbitConfigsToTestAgainst().map((config) => {
    let plebbit, reply, subplebbit;
    describe(`reply.replies - ${config.name}`, async () => {
        before(async () => {
            plebbit = await config.plebbitInstancePromise();
            subplebbit = await plebbit.getSubplebbit(subplebbitAddress);
            const post = await publishRandomPost(subplebbitAddress, plebbit);
            reply = await publishRandomReply(post, plebbit);
            await reply.update();
        });
        after(async () => {
            await plebbit.destroy();
        });

        it(`A reply should have no replies field if it doesn't have replies`, async () => {
            expect(reply.replies.pages).to.deep.equal({});
            expect(reply.replies.pageCids).to.deep.equal({});
        });

        it(`If all replies fit in a single preloaded page, there should not be any pageCids on CommentUpdate`, async () => {
            const replyUnderReply = await publishRandomReply(reply, plebbit);
            await waitTillReplyInParentPagesInstance(replyUnderReply, reply);
            expect(reply.replies.pages.best).to.exist;
            expect(reply.replies.pages.best.comments.length).to.equal(1);
            expect(reply.replies.pages.best.comments[0].cid).to.equal(replyUnderReply.cid);
            expect(reply.replies.pages.best.nextCid).to.be.undefined; // only a single preloaded page
            expect(reply.replies.pageCids).to.deep.equal({}); // no page cids cause it's a single preloaded page
        });

        it(`A preloaded page should not have a corresponding CID in reply.replies.pageCids`, async () => {
            for (const preloadedPageSortName of Object.keys(reply.replies.pages))
                expect(reply.replies.pageCids[preloadedPageSortName]).to.be.undefined;
        });

        it(`A reply should have pageCids after maxing out its replies`, async () => {
            await forceSubplebbitToGenerateAllRepliesPages(reply);
            expect(reply.replies.pageCids).to.not.deep.equal({}); // we have multiple pages now
            expect(reply.replies.pages.best.nextCid).to.exist;
        });

        it(`A preloaded page should not have a CID in reply.replies.pageCids after maxing out its replies`, async () => {
            for (const preloadedPageSortName of Object.keys(reply.replies.pages))
                expect(reply.replies.pageCids[preloadedPageSortName]).to.be.undefined;
        });

        it(`Stringified reply.replies still have all props`, async () => {
            const preloadedPages = reply.replies.pages;
            for (const preloadedSortType of Object.keys(preloadedPages)) {
                const stringifiedReplies = JSON.parse(JSON.stringify(reply.replies)).pages[preloadedSortType].comments;
                for (const reply of stringifiedReplies) testCommentFieldsInPageJson(reply);
            }
        });

        it(`A reply has the right pageCids under it after maxing out its replies`, async () => {
            const pageCidsWithoutPreloadedPageOrFlat = Object.keys(REPLY_REPLIES_SORT_TYPES).filter(
                (pageSortName) => !Object.keys(reply.replies.pages).includes(pageSortName) && !pageSortName.includes("Flat")
            );
            expect(Object.keys(reply.replies.pageCids).sort()).to.deep.equal(pageCidsWithoutPreloadedPageOrFlat.sort());
        });

        Object.keys(REPLY_REPLIES_SORT_TYPES).map((sortName) =>
            it.concurrent(
                `${sortName} pages under a reply are sorted correctly`,
                async () => await testReplyRepliesSort(reply, sortName, subplebbit)
            )
        );

        it.concurrent(`The PageIpfs.comments.comment always correspond to PageIpfs.comment.commentUpdate.cid`, async () => {
            const replySortTypesWithoutFlat = Object.keys(REPLY_REPLIES_SORT_TYPES);
            for (const replySortName of replySortTypesWithoutFlat) {
                const commentsFromEachPage = await loadAllPagesBySortName(replySortName, reply.replies);
                const commentsPageIpfs = commentsFromEachPage.map((comment) => comment.raw);

                for (const commentInPageIpfs of commentsPageIpfs) {
                    const calculatedCid = await calculateIpfsHash(JSON.stringify(commentInPageIpfs.comment));
                    expect(calculatedCid).to.equal(commentInPageIpfs.commentUpdate.cid);
                }
            }
        });
    });
});
getAvailablePlebbitConfigsToTestAgainst().map((config) => {
    describe("comment.replies - " + config.name, async () => {
        let plebbit, post;
        before(async () => {
            plebbit = await config.plebbitInstancePromise();
            post = await publishRandomPost(subplebbitAddress, plebbit);
        });

        after(async () => {
            await plebbit.destroy();
        });

        describe(`comment.replies.getPage - ${config.name}`, async () => {
            itSkipIfRpc("replies.getPage will throw a timeout error when request times out", async () => {
                // Create a plebbit instance with a very short timeout for page-ipfs
                const plebbit = await mockPlebbitV2({ plebbitOptions: { validatePages: false }, remotePlebbit: true });

                plebbit._timeouts["page-ipfs"] = 100;

                // Create a comment with a CID that doesn't exist or will time out
                const nonExistentCid = "QmbSiusGgY4Uk5LdAe91bzLkBzidyKyKHRKwhXPDz7gGzx"; // Random CID that doesn't exist

                const comment = await plebbit.getComment(post.cid);

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
                await plebbit.destroy();
            });
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
            await waitTillReplyInParentPagesInstance(reply, postWithReplies);
            await postWithReplies.stop();
        });

        after(async () => {
            await plebbit.destroy();
        });

        it(`replies.validatePage will throw if any comment is invalid`, async () => {
            const plebbit = await config.plebbitInstancePromise({ plebbitOptions: { validatePages: false } });

            const pageWithInvalidComment = postWithReplies.replies.pages.best.nextCid
                ? await postWithReplies.replies.getPage(postWithReplies.replies.pageCids.new)
                : JSON.parse(JSON.stringify(postWithReplies.replies.pages.best));
            pageWithInvalidComment.comments[0].raw.comment.content = "this is to invalidate signature";

            const post = await plebbit.getComment(postWithReplies.cid);
            try {
                await post.replies.validatePage(pageWithInvalidComment);
                expect.fail("Should have thrown");
            } catch (e) {
                expect(e.code).to.equal("ERR_REPLIES_PAGE_IS_INVALID");
                expect(e.details.signatureValidity.reason).to.equal(messages.ERR_SIGNATURE_IS_INVALID);
            }
            await plebbit.destroy();
        });

        it(`replies.validatePage will throw if any comment is not of the same post`, async () => {
            const plebbit = await config.plebbitInstancePromise({ plebbitOptions: { validatePages: false } });

            const pageWithInvalidComment = postWithReplies.replies.pages.best.nextCid
                ? await postWithReplies.replies.getPage(postWithReplies.replies.pageCids.new)
                : JSON.parse(JSON.stringify(postWithReplies.replies.pages.best));
            pageWithInvalidComment.comments[0].raw.comment.postCid += "1"; // will be a different post cid

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
            await plebbit.destroy();
        });

        it(`replies.validatePage will throw if postCid not defined on the parent comment`, async () => {
            const plebbit = await config.plebbitInstancePromise({ plebbitOptions: { validatePages: false } });

            const pageWithInvalidComment = postWithReplies.replies.pages.best.nextCid
                ? await postWithReplies.replies.getPage(postWithReplies.replies.pageCids.new)
                : JSON.parse(JSON.stringify(postWithReplies.replies.pages.best));

            const post = await plebbit.getComment(postWithReplies.cid);
            delete post.postCid;
            try {
                await post.replies.validatePage(pageWithInvalidComment);
                expect.fail("Should have thrown");
            } catch (e) {
                expect(e.code).to.equal("ERR_USER_ATTEMPTS_TO_VALIDATE_REPLIES_PAGE_WITHOUT_PARENT_COMMENT_POST_CID");
            }
            await plebbit.destroy();
        });

        it("validates flat pages correctly", async () => {
            if (!postWithReplies.replies.pages.best.nextCid) return; // can only test flat pages when we have multiple pages
            // Get a flat page
            const flatSortName = Object.keys(REPLIES_SORT_TYPES).find((name) => REPLIES_SORT_TYPES[name].flat);
            const flatPage = await postWithReplies.replies.getPage(postWithReplies.replies.pageCids[flatSortName]);
            // Verify that flat pages contain comments with different depths
            expect(flatPage.comments.some((comment) => comment.raw.comment.depth > 1)).to.be.true;
            expect(flatPage.comments.map((comment) => comment.raw.comment.depth)).to.not.deep.equal(
                Array(flatPage.comments.length).fill(flatPage.comments[0].raw.comment.depth)
            );

            // This should pass validation
            await postWithReplies.replies.validatePage(flatPage);

            // Modify the page to make it invalid and test that validation fails
            const invalidFlatPage = JSON.parse(JSON.stringify(flatPage));
            invalidFlatPage.comments[0].raw.comment.content = "modified content to invalidate signature";

            try {
                await postWithReplies.replies.validatePage(invalidFlatPage);
                expect.fail("Should have thrown");
            } catch (e) {
                expect(e.code).to.equal("ERR_REPLIES_PAGE_IS_INVALID");
                expect(e.details.signatureValidity.reason).to.equal(messages.ERR_SIGNATURE_IS_INVALID);
            }
        });

        it("fails validation when a comment has invalid depth (not parent.depth + 1)", async () => {
            const invalidPage = postWithReplies.replies.pages.best.nextCid
                ? await postWithReplies.replies.getPage(postWithReplies.replies.pageCids.new)
                : JSON.parse(JSON.stringify(postWithReplies.replies.pages.best));

            invalidPage.comments[0].raw.comment.depth = 5;
            invalidPage.comments[0].raw.commentUpdate.cid = await calculateIpfsHash(JSON.stringify(invalidPage.comments[0].raw.comment));
            try {
                await postWithReplies.replies.validatePage(invalidPage);
                expect.fail("Should have thrown");
            } catch (e) {
                expect(e.code).to.equal("ERR_REPLIES_PAGE_IS_INVALID");
                expect(e.details.signatureValidity.reason).to.equal(messages.ERR_PAGE_COMMENT_DEPTH_VALUE_IS_NOT_RELATIVE_TO_ITS_PARENT);
            }
        });

        it("fails validation when a comment has different subplebbitAddress", async () => {
            const invalidPage = postWithReplies.replies.pages.best.nextCid
                ? await postWithReplies.replies.getPage(postWithReplies.replies.pageCids.new)
                : JSON.parse(JSON.stringify(postWithReplies.replies.pages.best));

            invalidPage.comments[0].raw.comment.subplebbitAddress = "different-address";
            invalidPage.comments[0].raw.commentUpdate.cid = await calculateIpfsHash(JSON.stringify(invalidPage.comments[0].raw.comment));

            try {
                await postWithReplies.replies.validatePage(invalidPage);
                expect.fail("Should have thrown");
            } catch (e) {
                expect(e.code).to.equal("ERR_REPLIES_PAGE_IS_INVALID");
                expect(e.details.signatureValidity.reason).to.equal(messages.ERR_COMMENT_IN_PAGE_BELONG_TO_DIFFERENT_SUB);
            }
        });

        it("fails validation when a reply has incorrect parentCid", async () => {
            const invalidPage = postWithReplies.replies.pages.best.nextCid
                ? await postWithReplies.replies.getPage(postWithReplies.replies.pageCids.new)
                : JSON.parse(JSON.stringify(postWithReplies.replies.pages.best));

            // Change the parentCid to an invalid value
            invalidPage.comments[0].raw.comment.parentCid = "QmInvalidParentCid";

            try {
                await postWithReplies.replies.validatePage(invalidPage);
                expect.fail("Should have thrown");
            } catch (e) {
                expect(e.code).to.equal("ERR_REPLIES_PAGE_IS_INVALID");
                expect(e.details.signatureValidity.reason).to.equal(messages.ERR_PARENT_CID_OF_COMMENT_IN_PAGE_IS_NOT_CORRECT);
            }
        });

        it("fails validation when calculated CID doesn't match commentUpdate.cid", async () => {
            const invalidPage = postWithReplies.replies.pages.best.nextCid
                ? await postWithReplies.replies.getPage(postWithReplies.replies.pageCids.new)
                : JSON.parse(JSON.stringify(postWithReplies.replies.pages.best));

            // Modify the comment but keep the same commentUpdate.cid
            invalidPage.comments[0].raw.comment.timestamp += 1000; // Change timestamp
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
            const validPage = postWithReplies.replies.pages.best.nextCid
                ? await postWithReplies.replies.getPage(postWithReplies.replies.pageCids.new)
                : JSON.parse(JSON.stringify(postWithReplies.replies.pages.best));
            const emptyPage = {
                ...validPage,
                comments: []
            };

            // Empty pages should be valid
            await postWithReplies.replies.validatePage(emptyPage);
        });
    });
});
