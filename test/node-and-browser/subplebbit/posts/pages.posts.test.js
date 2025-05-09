import { expect } from "chai";
import {
    publishRandomPost,
    mockGatewayPlebbit,
    addStringToIpfs,
    getRemotePlebbitConfigs,
    mockPlebbitNoDataPathWithOnlyKuboClient,
    loadAllPagesBySortName,
    waitTillPostInSubplebbitPages,
    forceSubplebbitToGenerateAllPostsPages,
    publishRandomReply,
    isPlebbitFetchingUsingGateways,
    resolveWhenConditionIsTrue,
    itSkipIfRpc,
    iterateThroughPagesToFindCommentInParentPagesInstance,
    iterateThroughPageCidToFindComment
} from "../../../../dist/node/test/test-util.js";
import { POSTS_SORT_TYPES } from "../../../../dist/node/pages/util.js";
import { testCommentFieldsInPageJson, testPageCommentsIfSortedCorrectly } from "../../pages/pages-test-util.js";
import signers from "../../../fixtures/signers.js";
import * as remeda from "remeda";
import { of as calculateIpfsHash } from "typestub-ipfs-only-hash";
import { Buffer } from "buffer";
import { messages } from "../../../../dist/node/errors.js";

const subplebbitAddress = signers[0].address;
const subPostsBySortName = {}; // we will load all subplebbit pages and store its posts by sort name here

// TODO add a test where you load all posts using lastPostCid and compare them with pages

const testPostsSort = async (sortName, subplebbit) => {
    const posts = await loadAllPagesBySortName(sortName, subplebbit.posts);

    subPostsBySortName[sortName] = posts;

    await testPageCommentsIfSortedCorrectly(posts, sortName, subplebbit);
    return posts;
};

getRemotePlebbitConfigs().map((config) => {
    describe(`subplebbit.posts - ${config.name}`, async () => {
        let plebbit, newPost, subplebbit;
        before(async () => {
            plebbit = await config.plebbitInstancePromise();
            newPost = await publishRandomPost(subplebbitAddress, plebbit); // After publishing this post the subplebbit should have all pages
            await waitTillPostInSubplebbitPages(newPost, plebbit);
            subplebbit = await plebbit.getSubplebbit(subplebbitAddress);
            await forceSubplebbitToGenerateAllPostsPages(subplebbit); // the goal of this is to force the subplebbit to have all pages
            subplebbit = await plebbit.getSubplebbit(subplebbitAddress);
        });

        it(`Stringified subplebbit.posts still have all props`, async () => {
            const stringifedPosts = JSON.parse(JSON.stringify(subplebbit)).posts.pages.hot.comments;

            for (const post of stringifedPosts) {
                if (!post.replies?.pages) continue;
                const pages = post.replies.pages;
                for (const preloadedSortType of Object.keys(pages)) {
                    const stringifiedReplies = JSON.parse(JSON.stringify(post.replies)).pages[preloadedSortType].comments;
                    for (const reply of stringifiedReplies) testCommentFieldsInPageJson(reply);
                }
            }
        });

        it(`If all posts fit in a single preloaded page, there should not be any pageCids on SubplebbitIpfs`, async () => {
            if (subplebbit.posts.pages.hot.nextCid) return;
            expect(subplebbit.posts.pageCids).to.deep.equal({});
        });
        it(`A preloaded page should not have a corresponding CID in subplebbit.posts.pageCids`, async () => {
            for (const preloadedPageSortName of Object.keys(subplebbit.posts.pages))
                expect(subplebbit.posts.pageCids[preloadedPageSortName]).to.be.undefined;
        });

        it(`Newly published post appears on all pages`, async () => {
            const postInPreloadedPage = await iterateThroughPagesToFindCommentInParentPagesInstance(newPost.cid, subplebbit.posts);
            expect(postInPreloadedPage).to.exist;
            for (const pageCid of Object.values(subplebbit.posts.pageCids)) {
                const postInPage = await iterateThroughPageCidToFindComment(newPost.cid, pageCid, subplebbit.posts);
                expect(postInPage).to.exist;
            }
        });
        it(`Hot page is pre-loaded`, () => expect(Object.keys(subplebbit.posts.pages)).to.include("hot"));
        it(`All pageCids exists except preloaded`, () => {
            // If we have pre-loaded pages, we don't need to check for pageCids
            if (Object.keys(subplebbit.posts.pageCids).length > 0) {
                const pageCidsWithoutPreloaded = Object.keys(subplebbit.posts.pageCids).filter(
                    (pageCid) => !Object.keys(subplebbit.posts.pages).includes(pageCid)
                );

                expect(pageCidsWithoutPreloaded.length).to.be.greaterThan(0);
                expect(pageCidsWithoutPreloaded.sort()).to.deep.equal(Object.keys(subplebbit.posts.pageCids).sort());

                const allSortsWithoutPreloaded = Object.keys(POSTS_SORT_TYPES).filter(
                    (sortName) => !Object.keys(subplebbit.posts.pages).includes(sortName)
                );
                expect(allSortsWithoutPreloaded.length).to.be.greaterThan(0);
                expect(allSortsWithoutPreloaded.sort()).to.deep.equal(Object.keys(subplebbit.posts.pageCids).sort());
            }
        });
        Object.keys(POSTS_SORT_TYPES).map((sortName) =>
            it(`${sortName} pages are sorted correctly if there's more than a single page`, async () =>
                Object.keys(subplebbit.posts.pageCids).length > 0 && (await testPostsSort(sortName, subplebbit)))
        );
        it(`posts are the same within all pages`, async () => {
            // We need to separate pages by timeframe

            const pagesByTimeframe = remeda.groupBy(Object.entries(POSTS_SORT_TYPES), ([_, sort]) => sort.timeframe);

            for (const pagesGrouped of Object.values(pagesByTimeframe)) {
                const pages = pagesGrouped.map(([sortName, _]) => subPostsBySortName[sortName]);
                if (pages.length === 1) continue; // there's only a single page under this timeframe, not needed to verify against other pages
                expect(pages.length).to.be.greaterThanOrEqual(2);
                expect(pages.map((page) => page.length).every((val, i, arr) => val === arr[0])).to.be.true; // All pages are expected to have the same length

                for (const comment of pages[0]) {
                    const otherPageComments = pages.map((page) => page.find((c) => c.cid === comment.cid));
                    expect(otherPageComments.length).to.equal(pages.length);
                    for (const otherPageComment of otherPageComments) expect(comment).to.deep.equal(otherPageComment);
                }
            }
        });

        it(`The PageIpfs.comments.comment always correspond to PageIpfs.comment.commentUpdate.cid`, async () => {
            const pageCids = Object.values(subplebbit.posts.pageCids);

            for (const pageCid of pageCids) {
                const pageIpfs = JSON.parse(await plebbit.fetchCid(pageCid)); // will have PageIpfs type

                for (const commentInPageIpfs of pageIpfs.comments) {
                    const calculatedCid = await calculateIpfsHash(JSON.stringify(commentInPageIpfs.comment));
                    expect(calculatedCid).to.equal(commentInPageIpfs.commentUpdate.cid);
                }
            }
        });

        itSkipIfRpc("posts.getPage will throw a timeout error when request times out", async () => {
            // Create a plebbit instance with a very short timeout for page-ipfs
            const plebbit = await config.plebbitInstancePromise();

            plebbit._timeouts["page-ipfs"] = 100;

            // Create a comment with a CID that doesn't exist or will time out
            const nonExistentCid = "QmbSiusGgY4Uk5LdAe91bzLkBzidyKyKHRKwhXPDz7gGzx"; // Random CID that doesn't exist

            const sub = await plebbit.getSubplebbit(subplebbitAddress);

            // Override the pageCid to use our non-existent CID
            sub.posts.pageCids.hot = nonExistentCid;

            try {
                // This should time out
                await sub.posts.getPage(nonExistentCid);
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

        it(`.getPage will throw if the first page is over 1mb`, async () => {
            const subplebbit = await plebbit.getSubplebbit(subplebbitAddress);
            const page = remeda.clone(subplebbit.raw.subplebbitIpfs.posts.pages.hot);

            // Make sure the page is over 1MB
            // Keep adding comments until the page exceeds 1MB
            while (Buffer.byteLength(JSON.stringify(page)) <= 1024 * 1024) {
                page.comments.push(...page.comments);
            }

            // Verify the page is actually over 1MB
            const pageSizeInMB = Buffer.byteLength(JSON.stringify(page)) / (1024 * 1024);
            console.log(`Page size: ${pageSizeInMB.toFixed(2)}MB`);
            expect(pageSizeInMB).to.be.greaterThan(1, "Page should be larger than 1MB for this test");
            const pageCid = await addStringToIpfs(JSON.stringify(page));

            subplebbit.posts.pageCids.hot = pageCid;

            try {
                await subplebbit.posts.getPage(subplebbit.posts.pageCids.hot);
                expect.fail("Should have thrown");
            } catch (e) {
                if (isPlebbitFetchingUsingGateways(plebbit)) {
                    expect(e.code).to.equal("ERR_FAILED_TO_FETCH_PAGE_IPFS_FROM_GATEWAYS");
                    for (const gatewayUrl of Object.keys(plebbit.clients.ipfsGateways))
                        expect(e.details.gatewayToError[gatewayUrl].code).to.equal("ERR_OVER_DOWNLOAD_LIMIT");
                } else expect(e.code).to.equal("ERR_OVER_DOWNLOAD_LIMIT");
            }
        });

        describe(`subplebbit.posts.validatePage - ${config.name}`, async () => {
            let plebbit, subplebbit, validPageJson, newPost;

            before(async () => {
                plebbit = await config.plebbitInstancePromise({ validatePages: false });
                newPost = await publishRandomPost(subplebbitAddress, plebbit);
                await publishRandomReply(newPost, plebbit);
                await waitTillPostInSubplebbitPages(newPost, plebbit);
                subplebbit = await plebbit.getSubplebbit(subplebbitAddress);
                validPageJson = remeda.clone(subplebbit.posts.pages.hot); // PageTypeJson, not PageIpfs
            });

            it("validates a legitimate page correctly", async () => {
                await subplebbit.posts.validatePage(validPageJson);
            });

            it("fails validation when a comment has invalid signature", async () => {
                const invalidPage = JSON.parse(JSON.stringify(validPageJson));
                invalidPage.comments[0].raw.comment.content = "modified content to invalidate signature";

                try {
                    await subplebbit.posts.validatePage(invalidPage);
                    expect.fail("Should have thrown");
                } catch (e) {
                    expect(e.code).to.equal("ERR_POSTS_PAGE_IS_INVALID");
                    expect(e.details.signatureValidity.reason).to.equal(messages.ERR_SIGNATURE_IS_INVALID);
                }
            });

            it("fails validation when a comment belongs to a different subplebbit", async () => {
                const invalidPage = JSON.parse(JSON.stringify(validPageJson));
                invalidPage.comments[0].raw.comment.subplebbitAddress = "different-address";

                try {
                    await subplebbit.posts.validatePage(invalidPage);
                    expect.fail("Should have thrown");
                } catch (e) {
                    expect(e.code).to.equal("ERR_POSTS_PAGE_IS_INVALID");
                    expect(e.details.signatureValidity.reason).to.equal(messages.ERR_COMMENT_IN_PAGE_BELONG_TO_DIFFERENT_SUB);
                }
            });

            it("fails validation when calculated CID doesn't match commentUpdate.cid", async () => {
                const invalidPage = JSON.parse(JSON.stringify(validPageJson));
                // Modify the comment but keep the same commentUpdate.cid
                invalidPage.comments[0].raw.comment.timestamp += 1000;

                try {
                    await subplebbit.posts.validatePage(invalidPage);
                    expect.fail("Should have thrown");
                } catch (e) {
                    expect(e.code).to.equal("ERR_POSTS_PAGE_IS_INVALID");
                    expect(e.details.signatureValidity.reason).to.equal(messages.ERR_SIGNATURE_IS_INVALID);
                }
            });

            it("fails validation when a comment has incorrect depth (not 0)", async () => {
                const invalidPage = JSON.parse(JSON.stringify(validPageJson));
                invalidPage.comments[0].raw.comment.depth = 1; // Should be 0 for posts

                // Update the commentUpdate.cid to match the modified comment
                invalidPage.comments[0].raw.commentUpdate.cid = await calculateIpfsHash(
                    JSON.stringify(invalidPage.comments[0].raw.comment)
                );

                try {
                    await subplebbit.posts.validatePage(invalidPage);
                    expect.fail("Should have thrown");
                } catch (e) {
                    expect(e.code).to.equal("ERR_POSTS_PAGE_IS_INVALID");
                    expect(e.details.signatureValidity.reason).to.equal(
                        messages.ERR_PAGE_COMMENT_IS_A_REPLY_BUT_HAS_NO_PARENT_COMMENT_INSTANCE
                    );
                }
            });

            it("fails validation when a post has parentCid defined", async () => {
                const invalidPage = JSON.parse(JSON.stringify(validPageJson));
                invalidPage.comments[0].raw.comment.parentCid = "QmInvalidParentCid"; // Should be undefined for posts

                // Update the commentUpdate.cid to match the modified comment
                invalidPage.comments[0].raw.commentUpdate.cid = await calculateIpfsHash(
                    JSON.stringify(invalidPage.comments[0].raw.comment)
                );

                try {
                    await subplebbit.posts.validatePage(invalidPage);
                    expect.fail("Should have thrown");
                } catch (e) {
                    expect(e.code).to.equal("ERR_POSTS_PAGE_IS_INVALID");
                    expect(e.details.signatureValidity.reason).to.equal(messages.ERR_PARENT_CID_OF_COMMENT_IN_PAGE_IS_NOT_CORRECT);
                }
            });

            it("validates posts pages differently than replies pages", async () => {
                // Get a post with replies

                const post = await plebbit.getComment(newPost.cid);
                await post.update();
                await resolveWhenConditionIsTrue(post, () => post.replies.pages.best);
                await post.stop();

                // Get a replies page
                const repliesPage = remeda.clone(post.replies.pages.best);

                // This should fail because we're using a replies page with posts.validatePage
                try {
                    await subplebbit.posts.validatePage(repliesPage);
                    expect.fail("Should have thrown");
                } catch (e) {
                    expect(e.code).to.equal("ERR_POSTS_PAGE_IS_INVALID");
                    expect(e.details.signatureValidity.reason).to.equal(messages.ERR_PARENT_CID_OF_COMMENT_IN_PAGE_IS_NOT_CORRECT);
                }
            });

            it("validates empty posts pages (no comments)", async () => {
                // Create an empty page
                const emptyPage = {
                    ...validPageJson,
                    comments: []
                };

                // Empty pages should be valid
                await subplebbit.posts.validatePage(emptyPage);
            });
        });
    });
});

describe(`getPage`, async () => {
    itSkipIfRpc(`.getPage will throw if retrieved page is not equivalent to its CID - IPFS Gateway`, async () => {
        const gatewayUrl = "http://localhost:13415"; // a gateway that's gonna respond with invalid content
        const plebbit = await mockGatewayPlebbit({ ipfsGatewayUrls: [gatewayUrl], validatePages: true });

        const sub = await plebbit.getSubplebbit(subplebbitAddress);

        const invalidPageCid = "QmUFu8fzuT1th3jJYgR4oRgGpw3sgRALr4nbenA4pyoCav"; // Gateway will respond with content that is not mapped to this cid
        sub.posts.pageCids.active = invalidPageCid; // need to hardcode it here so we can calculate max size
        try {
            await sub.posts.getPage(invalidPageCid);
            expect.fail("Should fail");
        } catch (e) {
            expect(e.code).to.equal("ERR_FAILED_TO_FETCH_PAGE_IPFS_FROM_GATEWAYS");
            expect(e.details.gatewayToError[gatewayUrl].code).to.equal("ERR_CALCULATED_CID_DOES_NOT_MATCH");
        }
    });
    itSkipIfRpc(`.getPage will throw if retrieved page has an invalid signature - IPFS P2P`, async () => {
        const plebbit = await mockPlebbitNoDataPathWithOnlyKuboClient({ validatePages: true });

        const sub = await plebbit.getSubplebbit(subplebbitAddress);

        const pageIpfs = { comments: sub.posts.pages.hot.comments.map((comment) => comment.raw) };
        expect(pageIpfs).to.exist;

        const invalidPageIpfs = JSON.parse(JSON.stringify(pageIpfs));
        invalidPageIpfs.comments[0].comment.content += "invalidate signature";

        const invalidPageCid = await addStringToIpfs(JSON.stringify(invalidPageIpfs));
        sub.posts.pageCids.active = invalidPageCid; // need to hardcode it here so we can calculate max size

        try {
            await sub.posts.getPage(invalidPageCid);
            expect.fail("should fail");
        } catch (e) {
            expect(e.code).to.equal("ERR_POSTS_PAGE_IS_INVALID");
            expect(e.details.signatureValidity.reason).to.equal(messages.ERR_SIGNATURE_IS_INVALID);
        }
    });
});
