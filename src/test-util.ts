import { getDebugLevels, TIMEFRAMES_TO_SECONDS, timestamp } from "./util";
import { Signer } from "./signer";
import { Comment } from "./comment";
import Post from "./post";
import assert from "assert";
import { Plebbit } from "./plebbit";
const debugs = getDebugLevels("test-util");

export async function generateMockPost(subplebbitAddress: string, plebbit: Plebbit, signer?: Signer) {
    const postStartTestTime = Date.now() / 1000;
    signer = signer || (await plebbit.createSigner());
    const post = await plebbit.createComment({
        author: { displayName: `Mock Author - ${postStartTestTime}` },
        signer: signer,
        title: `Mock Post - ${postStartTestTime}`,
        content: `Mock content - ${postStartTestTime}`,
        subplebbitAddress: subplebbitAddress
    });
    assert.equal(post.constructor.name, "Post", "createComment should return Post if title is provided");
    post.once("challenge", (challengeMsg) => {
        post.publishChallengeAnswers(undefined);
    });
    return post;
}

export async function generateMockComment(parentPostOrComment: Post | Comment, plebbit: Plebbit, signer?: Signer): Promise<Comment> {
    const commentTime = Date.now() / 1000;
    signer = signer || (await plebbit.createSigner());
    const comment = await plebbit.createComment({
        author: { displayName: `Mock Author - ${commentTime}` },
        signer: signer,
        content: `Mock comment - ${commentTime}`,
        postCid: parentPostOrComment.postCid || parentPostOrComment.cid,
        parentCid: parentPostOrComment.cid,
        subplebbitAddress: parentPostOrComment.subplebbitAddress
    });
    comment.once("challenge", (challengeMsg) => {
        comment.publishChallengeAnswers(undefined);
    });
    return comment;
}

export async function generateMockPostWithRandomTimestamp(subplebbitAddress, plebbit, signer) {
    const randomTimeframeIndex = Math.floor(Math.random() * (Object.keys(TIMEFRAMES_TO_SECONDS).length - 1));
    const postTimestamp = timestamp() - (Math.random() > 0.5 ? TIMEFRAMES_TO_SECONDS[randomTimeframeIndex] : 0);
    const postTime = Date.now();
    signer = signer || (await plebbit.createSigner());
    const post = await plebbit.createComment({
        author: { displayName: `Mock Author - ${postTime}` },
        signer: signer,
        title: `Mock Post - ${postTime}`,
        content: `Mock content - ${postTime}`,
        subplebbitAddress: subplebbitAddress,
        timestamp: postTimestamp
    });

    post.once("challenge", (challengeMsg) => {
        post.publishChallengeAnswers(undefined);
    });
    return post;
}

export async function generateMockVote(parentPostOrComment, vote, plebbit, signer) {
    const voteTime = Date.now() / 1000;
    signer = signer || (await plebbit.createSigner());
    const voteObj = await plebbit.createVote({
        author: { displayName: `Mock Author - ${voteTime}` },
        signer: signer,
        commentCid: parentPostOrComment.cid || parentPostOrComment.postCid,
        vote: vote,
        subplebbitAddress: parentPostOrComment.subplebbitAddress
    });
    voteObj.once("challenge", (challengeMsg) => {
        voteObj.publishChallengeAnswers(undefined);
    });
    return voteObj;
}

export async function loadAllPages(pageCid, pagesInstance) {
    if (!pageCid) return [];
    try {
        let sortedCommentsPage = await pagesInstance.getPage(pageCid);
        let sortedComments = sortedCommentsPage.comments;
        while (sortedCommentsPage.nextCid) {
            sortedCommentsPage = await pagesInstance.getPage(sortedCommentsPage.nextCid);
            sortedComments = sortedComments.concat(sortedCommentsPage.comments);
        }
        sortedComments = await Promise.all(
            sortedComments.map(async (commentProps) => pagesInstance.subplebbit.plebbit.createComment(commentProps))
        );
        return sortedComments;
    } catch (e) {
        debugs.ERROR(`Error while loading all pages under cid (${pageCid}): ${e}`);
    }
}
