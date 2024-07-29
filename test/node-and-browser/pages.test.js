import {
    loadAllPages,
    publishRandomPost,
    findCommentInPage,
    mockRemotePlebbit,
    mockGatewayPlebbit,
    mockPlebbit,
    addStringToIpfs
} from "../../dist/node/test/test-util.js";
import { TIMEFRAMES_TO_SECONDS, POSTS_SORT_TYPES, REPLIES_SORT_TYPES } from "../../dist/node/pages/util.js";
import { expect } from "chai";
import signers from "../fixtures/signers.js";
import * as remeda from "remeda";

let subplebbit;
const subCommentPages = {};
const subplebbitAddress = signers[0].address;

// TODO add a test where you load all posts using lastPostCid and compare them with pages

const testCommentFields = (comment) => {
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
};

const activeScore = async (comment) => {
    if (Object.keys(comment.replies.pageCids).length === 0) return comment.timestamp;
    let maxTimestamp = comment.timestamp;

    const updateMaxTimestamp = async (localComments) => {
        for (const localComment of localComments) {
            if (localComment.timestamp > maxTimestamp) maxTimestamp = localComment.timestamp;
            if (Object.keys(localComment.replies.pageCids).length > 0) {
                const childrenComments = await loadAllPages(localComment.replies.pageCids.new, localComment.replies);
                await updateMaxTimestamp(childrenComments);
            }
        }
    };
    const childrenComments = await loadAllPages(comment.replies.pageCids.new, comment.replies);

    await updateMaxTimestamp(childrenComments);
    return maxTimestamp;
};

const testListOfSortedComments = async (sortedComments, sortName) => {
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
            scoreA = await activeScore(sortedComments[j]);
            scoreB = await activeScore(sortedComments[j + 1]);
        } else {
            scoreA = sort.score({ comment: sortedComments[j].toJSONIpfs(), update: sortedComments[j]._rawCommentUpdate });
            scoreB = sort.score({ comment: sortedComments[j + 1].toJSONIpfs(), update: sortedComments[j + 1]._rawCommentUpdate });
        }
        expect(scoreA).to.be.greaterThanOrEqual(scoreB);
    }
};

const testPostsSort = async (sortName) => {
    const posts = await loadAllPages(subplebbit.posts.pageCids[sortName], subplebbit.posts);

    subCommentPages[sortName] = posts;

    await testListOfSortedComments(posts, sortName);
    return posts;
};

const testRepliesSort = async (parentComments, replySortName) => {
    const commentsWithReplies = parentComments.filter((comment) => comment.replyCount > 0);
    for (const comment of commentsWithReplies) {
        expect(Object.keys(comment.replies.pageCids)).to.deep.equal(Object.keys(REPLIES_SORT_TYPES));
        const commentPages = await loadAllPages(comment.replies.pageCids[replySortName], comment.replies);
        await testListOfSortedComments(commentPages, replySortName);
        await testRepliesSort(commentPages, replySortName);
    }
};

describe("Test pages sorting", async () => {
    let plebbit, newPost;
    before(async () => {
        plebbit = await mockRemotePlebbit();
        newPost = await publishRandomPost(subplebbitAddress, plebbit, {}, true); // After publishing this post the subplebbit should have all pages
        subplebbit = await plebbit.getSubplebbit(subplebbitAddress);
    });

    describe("subplebbit.posts", async () => {
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
                const pages = pagesGrouped.map(([sortName, _]) => subCommentPages[sortName]);
                expect(pages.length).to.be.greaterThanOrEqual(2);
                expect(pages.map((page) => page.length).every((val, i, arr) => val === arr[0])).to.be.true; // All pages are expected to have the same length

                for (const comment of pages[0]) {
                    const otherPageComments = pages.map((page) => page.find((c) => c.cid === comment.cid));
                    expect(otherPageComments.length).to.equal(pages.length);
                    for (const otherPageComment of otherPageComments) expect(comment.toJSON()).to.deep.equal(otherPageComment.toJSON());
                }
            }
        });
    });

    describe("comment.replies", async () => {
        let posts;
        before(async () => {
            posts = (await subplebbit.posts.getPage(subplebbit.posts.pageCids.new)).comments;
            expect(posts.length).to.be.greaterThan(0);
        });

        it(`Stringified comment.replies still have all props`, async () => {
            for (const post of posts) {
                if (Object.keys(post.replies.pages).length === 0) continue;
                const stringifiedReplies = JSON.parse(JSON.stringify(post.replies)).pages.topAll.comments;
                for (const reply of stringifiedReplies) testCommentFields(reply);
            }
        });

        Object.keys(REPLIES_SORT_TYPES).map((sortName) =>
            it(`${sortName} pages under a comment are sorted correctly`, async () => await testRepliesSort(posts, sortName))
        );
    });
});

describe(`getPage`, async () => {
    it(`.getPage will throw if retrieved page is not equivalent to its CID - IPFS Gateway`, async () => {
        const gatewayUrl = "http://localhost:13415"; // a gateway that's gonna respond with invalid content
        const plebbit = await mockGatewayPlebbit({ ipfsGatewayUrls: [gatewayUrl] });

        const sub = await plebbit.getSubplebbit(subplebbitAddress);

        const invalidPageCid = "QmUFu8fzuT1th3jJYgR4oRgGpw3sgRALr4nbenA4pyoCav"; // Gateway will respond with content that is not mapped to this cid
        try {
            await sub.posts.getPage(invalidPageCid);
            expect.fail("Should fail");
        } catch (e) {
            expect(e.code).to.equal("ERR_FAILED_TO_FETCH_PAGE_IPFS_FROM_GATEWAYS");
            expect(e.details.gatewayToError[gatewayUrl].code).to.equal("ERR_CALCULATED_CID_DOES_NOT_MATCH");
        }
    });
    it(`.getPage will throw if retrieved page has an invalid signature - IPFS P2P`, async () => {
        const plebbit = await mockPlebbit();

        const sub = await plebbit.getSubplebbit(subplebbitAddress);

        const pageIpfs = sub.posts.toJSONIpfs().pages.hot;
        expect(pageIpfs).to.exist;

        const invalidPageIpfs = JSON.parse(JSON.stringify(pageIpfs));
        invalidPageIpfs.comments[0].comment.content += "invalidate signature";

        const invalidPageCid = await addStringToIpfs(JSON.stringify(invalidPageIpfs));

        try {
            await sub.posts.getPage(invalidPageCid);
            expect.fail("should fail");
        } catch (e) {
            expect(e.code).to.equal("ERR_PAGE_SIGNATURE_IS_INVALID");
        }
    });
});
