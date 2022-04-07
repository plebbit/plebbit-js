import {loadIpfsFileAsJson, TIMEFRAMES_TO_SECONDS, timestamp} from "../src/Util.js";
import {SortedComments} from "../src/SortHandler.js";

export async function generateMockComment(parentPostOrComment, subplebbit) {
    const commentTime = Date.now() / 1000;
    const mockAuthorIpns = await subplebbit.plebbit.ipfsClient.key.gen(`Mock User - ${commentTime}`);
    const comment = await subplebbit.plebbit.createComment({
        "author": {"displayName": `Mock Author - ${commentTime}`, "address": mockAuthorIpns["id"]},
        "content": `Mock comment - ${commentTime}`,
        "postCid": parentPostOrComment.postCid,
        "parentCid": parentPostOrComment.commentCid,
        "subplebbitAddress": subplebbit.subplebbitAddress
    });
    comment.once("challenge", challengeMsg => {
        comment.publishChallengeAnswers(undefined);
    });
    return comment;
}

export async function generateMockPost(subplebbitAddress, plebbit) {
    const postStartTestTime = Date.now() / 1000;
    const mockAuthorIpns = await plebbit.ipfsClient.key.gen(`Mock User - ${postStartTestTime}`);
    const post = await plebbit.createComment({
        "author": {"displayName": `Mock Author - ${postStartTestTime}`, "address": mockAuthorIpns["id"]},
        "title": `Mock Post - ${postStartTestTime}`,
        "content": `Mock content - ${postStartTestTime}`,
        "subplebbitAddress": subplebbitAddress
    });
    post.once("challenge", challengeMsg => {
        post.publishChallengeAnswers(undefined);
    });
    return post
}

export async function generateMockPostWithRandomTimestamp(subplebbitAddress, plebbit) {
    const randomTimeframeIndex = Math.floor(Math.random() * (Object.keys(TIMEFRAMES_TO_SECONDS).length - 1));
    const postTimestamp = timestamp() - (Math.random > 0.5 ? TIMEFRAMES_TO_SECONDS[randomTimeframeIndex] : 0);
    const postTime = Date.now();
    const mockAuthorIpns = await plebbit.ipfsClient.key.gen(`Mock User - ${postTime}`);
    const post = await plebbit.createComment({
        "author": {"displayName": `Mock Author - ${postTime}`, "address": mockAuthorIpns["id"]},
        "title": `Mock Post - ${postTime}`,
        "content": `Mock content - ${postTime}`,
        "subplebbitAddress": subplebbitAddress,
        "timestamp": postTimestamp
    });

    post.once("challenge", challengeMsg => {
        post.publishChallengeAnswers(undefined);
    });
    return post;

}

export async function generateMockVote(parentPostOrComment, vote, subplebbitAddress, plebbit) {
    const voteTime = Date.now() / 1000;
    const mockAuthorIpns = await plebbit.ipfsClient.key.gen(`Mock User - ${voteTime}`);
    const voteObj = await plebbit.createVote({
        "author": {"displayName": `Mock Author - ${voteTime}`, "address": mockAuthorIpns["id"]},
        "commentCid": parentPostOrComment.commentCid || parentPostOrComment.postCid,
        "vote": vote,
        "subplebbitAddress": subplebbitAddress
    });
    voteObj.once("challenge", challengeMsg => {
        voteObj.publishChallengeAnswers(undefined);
    });
    return voteObj;
}

export async function loadAllPagesThroughSortedComments(sortedCommentsCid, plebbit) {
    if (!sortedCommentsCid)
        return [];
    const loadComments = async (comment) => {
        const loadedComment = await plebbit.getPostOrComment(comment.commentCid);
        await loadedComment.update();
        await loadedComment.stop();
        return loadedComment;
    }
    let sortedCommentsPage = new SortedComments(await loadIpfsFileAsJson(sortedCommentsCid, plebbit.ipfsClient));
    let sortedComments = await Promise.all(sortedCommentsPage.comments.map(loadComments));
    while (sortedCommentsPage.nextSortedCommentsCid) {
        sortedCommentsPage = new SortedComments(await loadIpfsFileAsJson(sortedCommentsPage.nextSortedCommentsCid, plebbit.ipfsClient));
        sortedComments = sortedComments.concat(await Promise.all(sortedCommentsPage.comments.map(loadComments)));
    }
    return sortedComments;
}