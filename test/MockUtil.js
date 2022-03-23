import {loadIpfsFileAsJson, TIMEFRAMES_TO_SECONDS, timestamp} from "../src/Util.js";
import {SortedComments} from "../src/SortHandler.js";

export async function generateMockComment(parentPostOrComment, subplebbit) {
    const commentTime = Date.now() / 1000;
    const mockAuthorIpns = await subplebbit.plebbit.ipfsClient.key.gen(`Mock User - ${commentTime}`);
    return subplebbit.plebbit.createComment({
        "author": {"displayName": `Mock Author - ${commentTime}`, "address": mockAuthorIpns["id"]},
        "content": `Mock comment - ${commentTime}`,
        "postCid": parentPostOrComment.postCid,
        "parentCid": parentPostOrComment.commentCid,
        "subplebbitAddress": subplebbit.subplebbitAddress
    });
}

export async function generateMockPost(subplebbit) {
    const postStartTestTime = Date.now() / 1000;
    const mockAuthorIpns = await subplebbit.plebbit.ipfsClient.key.gen(`Mock User - ${postStartTestTime}`);
    return subplebbit.plebbit.createComment({
        "author": {"displayName": `Mock Author - ${postStartTestTime}`, "address": mockAuthorIpns["id"]},
        "title": `Mock Post - ${postStartTestTime}`,
        "content": `Mock content - ${postStartTestTime}`,
        "subplebbitAddress": subplebbit.subplebbitAddress
    });
}

export async function generateMockPostWithRandomTimestamp(subplebbit) {
    const randomTimeframeIndex = Math.floor(Math.random() * (Object.keys(TIMEFRAMES_TO_SECONDS).length - 1));
    const postTimestamp = timestamp() - (Math.random > 0.5 ? TIMEFRAMES_TO_SECONDS[randomTimeframeIndex] : 0);
    const postTime = Date.now();
    const mockAuthorIpns = await subplebbit.plebbit.ipfsClient.key.gen(`Mock User - ${postTime}`);
    return subplebbit.plebbit.createComment({
        "author": {"displayName": `Mock Author - ${postTime}`, "address": mockAuthorIpns["id"]},
        "title": `Mock Post - ${postTime}`,
        "content": `Mock content - ${postTime}`,
        "subplebbitAddress": subplebbit.subplebbitAddress,
        "timestamp": postTimestamp
    });

}

export async function generateMockVote(parentPostOrComment, vote, subplebbit) {
    const voteTime = Date.now() / 1000;
    const mockAuthorIpns = await subplebbit.plebbit.ipfsClient.key.gen(`Mock User - ${voteTime}`);
    return subplebbit.plebbit.createVote({
        "author": {"displayName": `Mock Author - ${voteTime}`, "address": mockAuthorIpns["id"]},
        "commentCid": parentPostOrComment.commentCid || parentPostOrComment.postCid,
        "vote": vote,
        "subplebbitAddress": subplebbit.subplebbitAddress
    });
}

export async function loadAllPagesThroughSortedComments(sortedCommentsCid, plebbit) {
    if (!sortedCommentsCid)
        return [];
    const loadComments = async (comment) => {
        const loadedComment = await plebbit.getPostOrComment(comment.commentCid);
        await loadedComment.update();
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