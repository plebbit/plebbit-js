import {
    loadAllPages,
    publishRandomPost,
    findCommentInPage,
    mockGatewayPlebbit,
    mockPlebbit,
    addStringToIpfs,
    getRemotePlebbitConfigs,
    waitTillPostInSubplebbitPages,
    publishRandomReply,
    resolveWhenConditionIsTrue,
    waitTillReplyInParentPages
} from "../../../dist/node/test/test-util.js";
import { TIMEFRAMES_TO_SECONDS, POSTS_SORT_TYPES, REPLIES_SORT_TYPES } from "../../../dist/node/pages/util.js";
import { expect } from "chai";
import signers from "../../fixtures/signers.js";
import * as remeda from "remeda";
import { of as calculateIpfsHash } from "typestub-ipfs-only-hash";
import { messages } from "../../../dist/node/errors.js";

let subplebbit;
const subPostsBySortName = {}; // we will load all subplebbit pages and store its posts by sort name here
const subplebbitAddress = signers[0].address;

// TODO add a test where you load all posts using lastPostCid and compare them with pages

const testCommentFields = (comment) => {
    if (!comment.link && !comment.content && !comment.title) expect.fail("Comment should either have link, content or title defined");
    expect(comment.author.address).to.be.a("string");
    expect(comment.cid).to.be.a("string");
    expect(comment.shortCid).to.be.a("string");
    if (!comment.link) expect(comment.content).to.be.a("string");
    expect(comment.depth).to.be.a("number");

    if (comment.depth === 0) {
        // A post
        expect(comment.postCid).to.equal(comment.cid);
        expect(comment.title).to.be.a("string");
    }
    if (comment.depth === 1) expect(comment.postCid).to.equal(comment.parentCid);

    expect(comment.protocolVersion).to.be.a("string");
    expect(comment.replyCount).to.be.a("number");

    expect(comment.signature).to.be.a("object");
    expect(comment.subplebbitAddress).to.equal(subplebbitAddress);
    expect(comment.timestamp).to.be.a("number");

    // Verify CommentUpdate fields
    expect(comment.updatedAt).to.be.a("number");
    expect(comment.author.subplebbit).to.be.a("object");
    expect(comment.author.subplebbit.postScore).to.be.a("number");
    expect(comment.author.subplebbit.replyScore).to.be.a("number");
    expect(comment.author.subplebbit.firstCommentTimestamp).to.be.a("number");
    expect(comment.author.subplebbit.lastCommentCid).to.be.a("string");
    expect(comment.author.shortAddress).to.be.a("string");

    expect(comment.downvoteCount).to.be.a("number");
    expect(comment.upvoteCount).to.be.a("number");
    expect(comment.original.author.address).to.be.a("string");
    if (!comment.link) expect(comment.original.content).to.be.a("string");
    // TODO verify flair here when implemented

    if (comment.edit) {
        expect(comment.author.address).to.equal(comment.author.address);
        expect(comment.edit.authorAddress).to.be.undefined; // Shouldn't be included (extra from db)
        expect(comment.edit.challengeRequestId).to.be.undefined;
        expect(comment.edit.commentCid).to.equal(comment.cid);
        expect(comment.edit.signature).to.be.a("object");
        expect(comment.edit.subplebbitAddress).to.equal(comment.subplebbitAddress);
        expect(comment.timestamp).to.be.a("number");
    }

    // Props that shouldn't be there
    expect(comment.ipnsKeyName).to.be.undefined;
    expect(comment.challengeRequestId).to.be.undefined;
    expect(comment.signer).to.be.undefined;
    expect(comment._signer).to.be.undefined;
};

const activeScore = async (comment, plebbit) => {
    if (!comment.replies) return comment.timestamp;
    let maxTimestamp = comment.timestamp;

    const updateMaxTimestamp = async (localComments) => {
        for (const localComment of localComments) {
            if (localComment.deleted || localComment.removed) continue; // shouldn't count
            if (localComment.timestamp > maxTimestamp) maxTimestamp = localComment.timestamp;
            if (localComment.replies) {
                const commentInstance = await plebbit.createComment(localComment);
                const childrenComments = await loadAllPages(localComment.replies.pageCids.new, commentInstance.replies);
                await updateMaxTimestamp(childrenComments);
            }
        }
    };

    const commentInstance = await plebbit.createComment(comment);
    const childrenComments = await loadAllPages(comment.replies.pageCids.new, commentInstance.replies);

    await updateMaxTimestamp(childrenComments);
    return maxTimestamp;
};

const testListOfSortedComments = async (sortedComments, sortName, plebbit) => {
    const currentTimeframe = Object.keys(TIMEFRAMES_TO_SECONDS).filter((timeframe) =>
        sortName.toLowerCase().includes(timeframe.toLowerCase())
    )[0];

    for (let j = 0; j < sortedComments.length - 1; j++) {
        // Check if timestamp is within [timestamp() - timeframe, subplebbit.updatedAt]
        testCommentFields(sortedComments[j]);
        if (currentTimeframe && !sortedComments[j].pinned) {
            const syncIntervalSeconds = 5 * 60;

            const sortStart = subplebbit.updatedAt - TIMEFRAMES_TO_SECONDS[currentTimeframe] - syncIntervalSeconds; // Should probably add extra buffer here
            const errMsg = `${sortName} sort includes posts from different timeframes`;
            expect(sortedComments[j].timestamp).to.be.greaterThanOrEqual(sortStart, errMsg);
            expect(sortedComments[j].timestamp).to.be.lessThanOrEqual(subplebbit.updatedAt, errMsg);
            expect(sortedComments[j + 1].timestamp).to.be.greaterThanOrEqual(sortStart, errMsg);
            expect(sortedComments[j + 1].timestamp).to.be.lessThanOrEqual(subplebbit.updatedAt, errMsg);
        }
        if (sortedComments[j].pinned || sortedComments[j + 1].pinned) continue; // Ignore pinned posts as they don't follow regular sorting

        const sort = { ...POSTS_SORT_TYPES, ...REPLIES_SORT_TYPES }[sortName];
        let scoreA, scoreB;
        if (sortName === "active") {
            scoreA = await activeScore(sortedComments[j], plebbit);
            scoreB = await activeScore(sortedComments[j + 1], plebbit);
        } else {
            scoreA = sort.score({ comment: sortedComments[j], commentUpdate: sortedComments[j] });
            scoreB = sort.score({ comment: sortedComments[j + 1], commentUpdate: sortedComments[j + 1] });
        }
        expect(scoreA).to.be.greaterThanOrEqual(scoreB);
    }
};

const testPostsSort = async (sortName) => {
    const posts = await loadAllPages(subplebbit.posts.pageCids[sortName], subplebbit.posts);

    subPostsBySortName[sortName] = posts;

    await testListOfSortedComments(posts, sortName, subplebbit._plebbit);
    return posts;
};

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

getRemotePlebbitConfigs().map((config) => {
    describe(`subplebbit.posts - ${config.name}`, async () => {
        let plebbit, newPost;
        before(async () => {
            plebbit = await config.plebbitInstancePromise();
            newPost = await publishRandomPost(subplebbitAddress, plebbit); // After publishing this post the subplebbit should have all pages
            await waitTillPostInSubplebbitPages(newPost, plebbit);
            subplebbit = await plebbit.getSubplebbit(subplebbitAddress);
        });

        it(`Stringified subplebbit.posts still have all props`, async () => {
            const stringifedPosts = JSON.parse(JSON.stringify(subplebbit)).posts.pages.hot;
            for (const post of stringifedPosts.comments) {
                testCommentFields(post);
                if (post.replies) for (const reply of post.replies.pages.topAll.comments) testCommentFields(reply);
            }
        });
        it(`Newly published post appears in all subplebbit.posts.pageCids`, async () => {
            for (const pageCid of Object.values(subplebbit.posts.pageCids)) {
                const postInPage = await findCommentInPage(newPost.cid, pageCid, subplebbit.posts);
                expect(postInPage).to.exist;
            }
        });
        it(`Hot page is pre-loaded`, () => expect(Object.keys(subplebbit.posts.pages)).to.deep.equal(["hot"]));
        it(`All pageCids exists`, () => {
            expect(Object.keys(subplebbit.posts.pageCids).sort()).to.deep.equal(Object.keys(POSTS_SORT_TYPES).sort());
        });
        Object.keys(POSTS_SORT_TYPES).map((sortName) =>
            it(`${sortName} pages are sorted correctly`, async () => await testPostsSort(sortName))
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

        describe(`subplebbit.posts.validatePage - ${config.name}`, async () => {
            let plebbit, subplebbit, validPageJson, newPost;

            before(async () => {
                plebbit = await config.plebbitInstancePromise({ validatePages: false });
                newPost = await publishRandomPost(subplebbitAddress, plebbit);
                await publishRandomReply(newPost, plebbit);
                await waitTillPostInSubplebbitPages(newPost, plebbit);
                subplebbit = await plebbit.getSubplebbit(subplebbitAddress);
                validPageJson = await subplebbit.posts.getPage(subplebbit.posts.pageCids.hot); // PageTypeJson, not PageIpfs
            });

            it("validates a legitimate page correctly", async () => {
                await subplebbit.posts.validatePage(validPageJson);
            });

            it("fails validation when a comment has invalid signature", async () => {
                const invalidPage = JSON.parse(JSON.stringify(validPageJson));
                invalidPage.comments[0].pageComment.comment.content = "modified content to invalidate signature";

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
                invalidPage.comments[0].pageComment.comment.subplebbitAddress = "different-address";

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
                invalidPage.comments[0].pageComment.comment.timestamp += 1000;

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
                invalidPage.comments[0].pageComment.comment.depth = 1; // Should be 0 for posts

                // Update the commentUpdate.cid to match the modified comment
                invalidPage.comments[0].pageComment.commentUpdate.cid = await calculateIpfsHash(
                    JSON.stringify(invalidPage.comments[0].pageComment.comment)
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
                invalidPage.comments[0].pageComment.comment.parentCid = "QmInvalidParentCid"; // Should be undefined for posts

                // Update the commentUpdate.cid to match the modified comment
                invalidPage.comments[0].pageComment.commentUpdate.cid = await calculateIpfsHash(
                    JSON.stringify(invalidPage.comments[0].pageComment.comment)
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
                await resolveWhenConditionIsTrue(post, () => post.replies?.pageCids?.topAll);
                await post.stop();

                // Get a replies page
                const repliesPage = await post.replies.getPage(post.replies.pageCids.topAll);

                // This should fail because we're using a replies page with posts.validatePage
                try {
                    await subplebbit.posts.validatePage(repliesPage);
                    expect.fail("Should have thrown");
                } catch (e) {
                    expect(e.code).to.equal("ERR_POSTS_PAGE_IS_INVALID");
                    expect(e.details.signatureValidity.reason).to.equal(messages.ERR_PARENT_CID_OF_COMMENT_IN_PAGE_IS_NOT_CORRECT);
                }
            });

            it("validates empty pages (no comments)", async () => {
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

    describe("comment.replies", async () => {
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

        describe("replies.validatePage validation tests", async () => {
            let plebbit, postWithReplies;

            before(async () => {
                plebbit = await config.plebbitInstancePromise({ validatePages: false });
                postWithReplies = await publishRandomPost(subplebbitAddress, plebbit);
                await publishRandomReply(postWithReplies, plebbit);

                await postWithReplies.update();
                await resolveWhenConditionIsTrue(postWithReplies, () => typeof postWithReplies.updatedAt === "number");
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
                    expect(e.details.signatureValidity.reason).to.equal(
                        messages.ERR_PAGE_COMMENT_DEPTH_VALUE_IS_NOT_RELATIVE_TO_ITS_PARENT
                    );
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
    });
});

describe(`getPage`, async () => {
    it(`.getPage will throw if retrieved page is not equivalent to its CID - IPFS Gateway`, async () => {
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
    it(`.getPage will throw if retrieved page has an invalid signature - IPFS P2P`, async () => {
        const plebbit = await mockPlebbit({ validatePages: true });

        const sub = await plebbit.getSubplebbit(subplebbitAddress);

        const pageIpfs = sub.posts.toJSONIpfs().pages.hot;
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
        }
    });
});
