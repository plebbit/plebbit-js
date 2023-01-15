const { TIMEFRAMES_TO_SECONDS } = require("../../dist/node/util");
const Plebbit = require("../../dist/node");
const { expect } = require("chai");
const { POSTS_SORT_TYPES, REPLIES_SORT_TYPES } = require("../../dist/node/sort-handler");
const signers = require("../fixtures/signers");
const { loadAllPages, publishRandomPost, mockPlebbit } = require("../../dist/node/test/test-util");
const lodash = require("lodash");

let subplebbit;
const subCommentPages = {};
const subplebbitAddress = signers[0].address;

// TODO add a test where you load all posts using lastPostCid and compare them with pages

if (globalThis["navigator"]?.userAgent?.includes("Electron")) Plebbit.setNativeFunctions(window.plebbitJsNativeFunctions);

const testCommentFields = (comment) => {
    expect(comment.author.address).to.be.a("string");
    expect(comment.cid).to.be.a("string");
    if (!comment.link) expect(comment.content).to.be.a("string");
    expect(comment.depth).to.be.a("number");

    expect(comment.ipnsName).to.be.a("string");
    if (comment.depth === 0) {
        // A post
        expect(comment.postCid).to.equal(comment.cid);
        expect(comment.title).to.be.a("string");
    }
    if (comment.depth === 1) {
        // Comment (reply)
        expect(comment.postCid).to.equal(comment.parentCid);
        expect(comment.title).to.be.undefined;
    }
    expect(comment.protocolVersion).to.be.a("string");
    expect(comment.replyCount).to.be.a("number");
    if (comment.replyCount > 0) {
        expect(comment.replies.pages.topAll.comments.length).to.equal(comment.replyCount);
        expect(comment.replies.pageCids).to.have.keys(["controversialAll", "new", "old", "topAll"]);
    }

    expect(comment.signature).to.be.a("object");
    expect(comment.subplebbitAddress).to.equal(subplebbitAddress);
    expect(comment.timestamp).to.be.a("number");

    // Verify CommentUpdate fields
    expect(comment.updatedAt).to.be.a("number");
    expect(comment.author.subplebbit).to.be.a("object");
    expect(comment.author.subplebbit.postScore).to.be.a("number");
    expect(comment.author.subplebbit.replyScore).to.be.a("number");
    expect(comment.author.subplebbit.lastCommentCid).to.be.a("string");

    expect(comment.downvoteCount).to.be.a("number");
    expect(comment.upvoteCount).to.be.a("number");
    expect(comment.original.author.address).to.be.a("string");
    if (!comment.link) expect(comment.original.content).to.be.a("string");
    // TODO verify flair here when implemented

    if (comment.authorEdit) {
        expect(comment.author.address).to.equal(comment.author.address);
        expect(comment.authorEdit.authorAddress).to.be.undefined; // Shouldn't be included (extra from db)
        expect(comment.authorEdit.challengeRequestId).to.be.undefined;
        expect(comment.authorEdit.commentCid).to.equal(comment.cid);
        expect(comment.authorEdit.signature).to.be.a("object");
        expect(comment.authorEdit.subplebbitAddress).to.equal(comment.subplebbitAddress);
        expect(comment.timestamp).to.be.a("number");
    }

    // Props that shouldn't be there
    expect(comment.ipnsKeyName).to.be.undefined;
    expect(comment.challengeRequestId).to.be.undefined;
    expect(comment.signer).to.be.undefined;
};

const testListOfSortedComments = (sortedComments, sortName) => {
    console.log(`Testing sort ${sortName}. There are ${sortedComments.length} comments under ${sortName}`);

    const currentTimeframe = Object.keys(TIMEFRAMES_TO_SECONDS).filter((timeframe) =>
        sortName.toLowerCase().includes(timeframe.toLowerCase())
    )[0];
    console.log(`Current sort ${sortName} current timeframe = ${currentTimeframe}`);

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
        const scoreA = sort.score(sortedComments[j]);
        const scoreB = sort.score(sortedComments[j + 1]);
        expect(scoreA).to.be.greaterThanOrEqual(scoreB);
    }
    console.log(`Passed tests for current sort ${sortName}`);
};

const testPostsSort = async (sortName) => {
    const posts = await loadAllPages(subplebbit.posts.pageCids[sortName], subplebbit.posts);

    subCommentPages[sortName] = posts;

    testListOfSortedComments(posts, sortName);
    return posts;
};

const testRepliesSort = async (parentComments, replySortName) => {
    for (const comment of parentComments) {
        if (comment.replyCount === 0) {
            expect(comment.replies.pageCids).to.be.undefined;
            expect(comment.replies.pages).to.deep.equal({});
            continue;
        }

        expect(Object.keys(comment.replies.pageCids)).to.deep.equal(Object.keys(REPLIES_SORT_TYPES));
        expect(comment.replies.pages.topAll.comments.length).to.equal(comment.replyCount);
        const commentPages = await loadAllPages(comment.replies.pageCids[replySortName], subplebbit.posts);
        expect(commentPages.length).to.equal(comment.replyCount);
        testListOfSortedComments(commentPages, replySortName);
        await testRepliesSort(commentPages, replySortName);
    }
};

describe("Test pages sorting", async () => {
    let plebbit, newPost;
    before(async () => {
        plebbit = await mockPlebbit();
        newPost = await publishRandomPost(subplebbitAddress, plebbit); // After publishing this post the subplebbit should have all pages
        subplebbit = await plebbit.getSubplebbit(subplebbitAddress);
    });

    describe("subplebbit.posts", async () => {
        it(`Newly published post appears in all subplebbit.posts.pageCids`, async () => {
            for (const pageCid of Object.values(subplebbit.posts.pageCids)) {
                const pageComments = await loadAllPages(pageCid, subplebbit.posts);
                expect(pageComments.some((c) => c.cid === newPost.cid)).to.be.true;
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

            const pagesByTimeframe = lodash.groupBy(Object.entries(POSTS_SORT_TYPES), ([_, sort]) => sort.timeframe);

            for (const pagesGrouped of Object.values(pagesByTimeframe)) {
                const pages = pagesGrouped.map(([sortName, _]) => subCommentPages[sortName]);
                expect(pages.length).to.be.greaterThanOrEqual(2);
                expect(pages.map((page) => page.length).every((val, i, arr) => val === arr[0])).to.be.true; // All pages are expected to have the same length

                for (const comment of pages[0]) {
                    const otherPageComments = pages.map((page) => page.find((c) => c.cid === comment.cid));
                    expect(otherPageComments.length).to.equal(pages.length);
                    for (const otherPageComment of otherPageComments) expect(comment).to.deep.equal(otherPageComment);
                }
            }
        });
    });

    describe("comment.replies", async () => {
        let posts;
        before(async () => {
            posts = await loadAllPages(subplebbit.posts.pageCids.new, subplebbit.posts);
        });
        Object.keys(REPLIES_SORT_TYPES).map((sortName) =>
            it(`${sortName} pages under a comment are sorted correctly`, async () => await testRepliesSort(posts, sortName))
        );
    });
});
