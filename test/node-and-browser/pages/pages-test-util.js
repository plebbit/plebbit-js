import { expect } from "chai";
import { loadAllUniqueCommentsUnderCommentInstance } from "../../../dist/node/test/test-util.js";
import { TIMEFRAMES_TO_SECONDS, POSTS_SORT_TYPES, POST_REPLIES_SORT_TYPES } from "../../../dist/node/pages/util.js";
import signers from "../../fixtures/signers.js";

const subplebbitAddress = signers[0].address;

export const testCommentFieldsInPageJson = (comment) => {
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
    expect(comment.childCount).to.be.a("number");

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
    expect(comment.pendingApproval).to.not.exist;
};

const activeScore = async (comment, plebbit) => {
    if (!comment.replies) return comment.timestamp;
    let maxTimestamp = comment.timestamp;

    const commentInstance = await plebbit.createComment(comment);
    const updateMaxTimestamp = async (localComments) => {
        for (const localComment of localComments) {
            if (localComment.deleted || localComment.removed) continue; // shouldn't count
            if (localComment.timestamp > maxTimestamp) maxTimestamp = localComment.timestamp;
            if (localComment.replies) {
                const localCommentInstance = await plebbit.createComment(localComment);
                const childrenComments = await loadAllUniqueCommentsUnderCommentInstance(localCommentInstance);
                await updateMaxTimestamp(childrenComments);
            }
        }
    };

    const childrenComments = await loadAllUniqueCommentsUnderCommentInstance(commentInstance);
    if (comment.replyCount > 0 && childrenComments.length === 0) expect.fail("Comment has replyCount but no replies");

    await updateMaxTimestamp(childrenComments);
    return maxTimestamp;
};

export const testPageCommentsIfSortedCorrectly = async (sortedComments, sortName, subplebbit) => {
    const currentTimeframe = Object.keys(TIMEFRAMES_TO_SECONDS).filter((timeframe) =>
        sortName.toLowerCase().includes(timeframe.toLowerCase())
    )[0];

    for (let j = 0; j < sortedComments.length - 1; j++) {
        // Check if timestamp is within [timestamp() - timeframe, subplebbit.updatedAt]
        testCommentFieldsInPageJson(sortedComments[j]);
        if (currentTimeframe && !sortedComments[j].pinned && currentTimeframe !== "ALL") {
            const syncIntervalSeconds = 5 * 60;

            const sortStart = subplebbit.updatedAt - TIMEFRAMES_TO_SECONDS[currentTimeframe] - syncIntervalSeconds; // Should probably add extra buffer here
            const errMsg = `${sortName} sort includes posts from different timeframes`;
            expect(sortedComments[j].timestamp).to.be.greaterThanOrEqual(sortStart, errMsg);
            expect(sortedComments[j].timestamp).to.be.lessThanOrEqual(subplebbit.updatedAt, errMsg);
            expect(sortedComments[j + 1].timestamp).to.be.greaterThanOrEqual(sortStart, errMsg);
            expect(sortedComments[j + 1].timestamp).to.be.lessThanOrEqual(subplebbit.updatedAt, errMsg);
        }
        if (sortedComments[j].pinned || sortedComments[j + 1].pinned) continue; // Ignore pinned posts as they don't follow regular sorting

        const sort = { ...POSTS_SORT_TYPES, ...POST_REPLIES_SORT_TYPES }[sortName];
        let scoreA, scoreB;
        if (sortName === "active") {
            scoreA = await activeScore(sortedComments[j], subplebbit._plebbit);
            scoreB = await activeScore(sortedComments[j + 1], subplebbit._plebbit);
        } else {
            scoreA = sort.score(sortedComments[j].raw);
            scoreB = sort.score(sortedComments[j + 1].raw);
        }
        expect(scoreA).to.be.greaterThanOrEqual(scoreB);
    }
};
