import { TIMEFRAMES_TO_SECONDS, timestamp } from "./util";
import { Signer } from "./signer";
import { Comment } from "./comment";
import Post from "./post";
import assert from "assert";
import { Plebbit } from "./plebbit";
import Vote from "./vote";
import { Pages } from "./pages";
import { Subplebbit } from "./subplebbit";
import { CommentType } from "./types";

function generateRandomTimestamp(parentTimestamp?: number): number {
    const [lowerLimit, upperLimit] = [parentTimestamp || 0, timestamp()];

    let randomTimestamp;
    while (!randomTimestamp) {
        const randomTimeframeIndex = (Object.keys(TIMEFRAMES_TO_SECONDS).length * Math.random()) << 0;
        const tempTimestamp = lowerLimit + Object.values(TIMEFRAMES_TO_SECONDS)[randomTimeframeIndex];
        if (tempTimestamp >= lowerLimit && tempTimestamp <= upperLimit) randomTimestamp = tempTimestamp;
    }

    return randomTimestamp;
}

export async function generateMockPost(
    subplebbitAddress: string,
    plebbit: Plebbit,
    signer?: Signer,
    randomTimestamp = false,
    postProps = {}
) {
    const postTimestamp = (randomTimestamp && generateRandomTimestamp()) || timestamp();
    const postStartTestTime = Date.now() / 1000 + Math.random();
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
    randomTimestamp = false,
    commentProps = {}
): Promise<Comment> {
    assert(parentPostOrComment, "Need to have parentComment defined to generate mock comment");
    const commentTimestamp = (randomTimestamp && generateRandomTimestamp(parentPostOrComment.timestamp)) || timestamp();
    const commentTime = Date.now() / 1000 + Math.random();
    signer = signer || (await plebbit.createSigner());
    const comment = await plebbit.createComment({
        author: { displayName: `Mock Author - ${commentTime}` },
        signer: signer,
        content: `Mock comment - ${commentTime}`,
        parentCid: parentPostOrComment.cid,
        subplebbitAddress: parentPostOrComment.subplebbitAddress,
        timestamp: commentTimestamp,
        ...commentProps
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
    const commentCid = parentPostOrComment.cid || parentPostOrComment.postCid;
    assert(typeof commentCid === "string");

    signer = signer || (await plebbit.createSigner());
    const voteObj = await plebbit.createVote({
        author: { displayName: `Mock Author - ${voteTime}` },
        signer: signer,
        commentCid: commentCid,
        vote: vote,
        subplebbitAddress: parentPostOrComment.subplebbitAddress
    });
    voteObj.once("challenge", (challengeMsg) => {
        voteObj.publishChallengeAnswers(undefined);
    });
    return voteObj;
}

export async function loadAllPages(pageCid: string, pagesInstance: Pages): Promise<Comment[]> {
    assert(typeof pageCid === "string");
    let sortedCommentsPage = await pagesInstance.getPage(pageCid);
    let sortedComments: Comment[] | CommentType[] = sortedCommentsPage.comments;
    while (sortedCommentsPage.nextCid) {
        sortedCommentsPage = await pagesInstance.getPage(sortedCommentsPage.nextCid);
        sortedComments = sortedComments.concat(sortedCommentsPage.comments);
    }
    sortedComments = await Promise.all(
        sortedComments.map(async (commentProps) => pagesInstance.subplebbit.plebbit.createComment(commentProps))
    );
    return <Comment[]>sortedComments;
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
