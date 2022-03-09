import {Comment, Post, Vote} from "../src/index.js";

export async function generateMockComment(parentPostOrComment, subplebbit) {
    const commentTime = Date.now() / 1000;
    const mockAuthorIpns = await subplebbit.ipfsClient.key.gen(`Mock User - ${commentTime}`);
    return new Comment({
        "author": {"displayName": `Mock Author - ${commentTime}`, "address": mockAuthorIpns["id"]},
        "content": `Mock comment - ${commentTime}`,
        "postCid": parentPostOrComment.postCid,
        "parentCommentCid": parentPostOrComment.commentCid
    }, parentPostOrComment.subplebbit);
}

export async function generateMockPost(subplebbit) {
    const postStartTestTime = Date.now() / 1000;
    const mockAuthorIpns = await subplebbit.ipfsClient.key.gen(`Mock User - ${postStartTestTime}`);
    return new Post({
        "author": {"displayName": `Mock Author - ${postStartTestTime}`, "address": mockAuthorIpns["id"]},
        "title": `Mock Post - ${postStartTestTime}`,
        "content": `Mock content - ${postStartTestTime}`,
    }, subplebbit);
}

export async function generateMockVote(parentPostOrComment, vote, subplebbit) {
    const voteTime = Date.now() / 1000;
    const mockAuthorIpns = await subplebbit.ipfsClient.key.gen(`Mock User - ${voteTime}`);
    return new Vote({
        "author": {"displayName": `Mock Author - ${voteTime}`, "address": mockAuthorIpns["id"]},
        "commentCid": parentPostOrComment.commentCid || parentPostOrComment.postCid,
        "vote": vote,
    }, parentPostOrComment.subplebbit);
}