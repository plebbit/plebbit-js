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