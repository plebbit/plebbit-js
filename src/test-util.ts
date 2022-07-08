import { getDebugLevels, TIMEFRAMES_TO_SECONDS, timestamp } from "./util";
import { Signer } from "./signer";
import { Comment } from "./comment";
import Post from "./post";
import assert from "assert";
import { Plebbit } from "./plebbit";
import Vote from "./vote";
import { Pages } from "./pages";
import { Subplebbit } from "./subplebbit";
const debugs = getDebugLevels("test-util");

export async function generateMockPost(
    subplebbitAddress: string,
    plebbit: Plebbit,
    signer?: Signer,
    randomTimestamp = false,
    postProps = {}
) {
    let postTimestamp: number | undefined;
    if (randomTimestamp) {
        const randomTimeframeIndex = (Object.keys(TIMEFRAMES_TO_SECONDS).length * Math.random()) << 0;
        postTimestamp = timestamp() - Object.values(TIMEFRAMES_TO_SECONDS)[randomTimeframeIndex];
        if (postTimestamp === Number.NEGATIVE_INFINITY) postTimestamp = 0;
    }

    const postStartTestTime = Date.now() / 1000;
    signer = signer || (await plebbit.createSigner());
    const post = await plebbit.createComment({
        author: { displayName: `Mock Author - ${postStartTestTime}` },
        signer: signer,
        title: `Mock Post - ${postStartTestTime}`,
        content: `Mock content - ${postStartTestTime}`,
        timestamp: postTimestamp,
        subplebbitAddress: subplebbitAddress,
        ...postProps
    });
    assert.equal(post.constructor.name, "Post", "createComment should return Post if title is provided");
    post.once("challenge", (challengeMsg) => {
        post.publishChallengeAnswers(undefined);
    });
    return post;
}

export async function generateMockComment(
    parentPostOrComment: Post | Comment,
    plebbit: Plebbit,
    signer?: Signer,
    randomTimestamp = false
): Promise<Comment> {
    let commentTimestamp: number | undefined;
    if (randomTimestamp) {
        const randomTimeframeIndex = (Object.keys(TIMEFRAMES_TO_SECONDS).length * Math.random()) << 0;
        commentTimestamp = timestamp() - Object.values(TIMEFRAMES_TO_SECONDS)[randomTimeframeIndex];
        if (commentTimestamp === Number.NEGATIVE_INFINITY) commentTimestamp = 0;
    }
    const commentTime = Date.now() / 1000;
    signer = signer || (await plebbit.createSigner());
    const comment = await plebbit.createComment({
        author: { displayName: `Mock Author - ${commentTime}` },
        signer: signer,
        content: `Mock comment - ${commentTime}`,
        postCid: parentPostOrComment.postCid || parentPostOrComment.cid,
        parentCid: parentPostOrComment.cid,
        subplebbitAddress: parentPostOrComment.subplebbitAddress,
        timestamp: commentTimestamp
    });
    comment.once("challenge", (challengeMsg) => {
        comment.publishChallengeAnswers(undefined);
    });
    return comment;
}

export async function generateMockVote(
    parentPostOrComment: Comment | Post,
    vote: -1 | 0 | 1,
    plebbit: Plebbit,
    signer?: Signer
): Promise<Vote> {
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

export async function loadAllPages(pageCid: string, pagesInstance: Pages): Promise<Comment[]> {
    if (!pageCid) return [];
    assert(pagesInstance.getPage);
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
}

export async function getAllCommentsUnderSubplebbit(subplebbit: Subplebbit): Promise<Comment[]> {
    const getChildrenComments = async (comment: Comment): Promise<Comment[]> => {
        return [
            await subplebbit.plebbit.createComment(comment),
            ...(await Promise.all(comment.replies?.pages?.topAll?.comments?.map(getChildrenComments) || [])).flat()
        ];
    };

    return (await Promise.all(subplebbit.posts?.pages.hot?.comments.map(getChildrenComments) || [])).flat();
}
