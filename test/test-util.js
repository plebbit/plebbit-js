async function generateMockPost(subplebbitAddress, plebbit) {
    const postStartTestTime = Date.now() / 1000;
    const signer = await plebbit.createSigner();
    const post = await plebbit.createComment({
        author: { displayName: `Mock Author - ${postStartTestTime}` },
        signer: signer,
        title: `Mock Post - ${postStartTestTime}`,
        content: `Mock content - ${postStartTestTime}`,
        subplebbitAddress: subplebbitAddress
    });
    post.once("challenge", (challengeMsg) => {
        post.publishChallengeAnswers(undefined);
    });
    return post;
}

async function generateMockComment(parentPostOrComment, plebbit) {
    const commentTime = Date.now() / 1000;
    const signer = await plebbit.createSigner();
    const comment = await plebbit.createComment({
        author: { displayName: `Mock Author - ${commentTime}` },
        signer: signer,
        content: `Mock comment - ${commentTime}`,
        postCid: parentPostOrComment.cid,
        parentCid: parentPostOrComment.cid,
        subplebbitAddress: parentPostOrComment.subplebbitAddress
    });
    comment.once("challenge", (challengeMsg) => {
        comment.publishChallengeAnswers(undefined);
    });
    return comment;
}

module.exports = { generateMockPost, generateMockComment };
