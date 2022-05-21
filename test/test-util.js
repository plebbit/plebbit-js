// Be careful of using async keyword here, it triggers babel to parse this file as a module for some reason
// Always use promises

function generateMockPost(subplebbitAddress, plebbit) {
    return new Promise((resolve) => {
        const postStartTestTime = Date.now() / 1000;
        plebbit.createSigner().then((signer) => {
            plebbit
                .createComment({
                    author: { displayName: `Mock Author - ${postStartTestTime}` },
                    signer: signer,
                    title: `Mock Post - ${postStartTestTime}`,
                    content: `Mock content - ${postStartTestTime}`,
                    subplebbitAddress: subplebbitAddress
                })
                .then((post) => {
                    post.once("challenge", (challengeMsg) => {
                        post.publishChallengeAnswers(undefined);
                    });
                    resolve(post);
                });
        });
    });
}

function generateMockComment(parentPostOrComment, plebbit) {
    return new Promise((resolve) => {
        const commentTime = Date.now() / 1000;
        plebbit.createSigner().then((signer) => {
            plebbit
                .createComment({
                    author: { displayName: `Mock Author - ${commentTime}` },
                    signer: signer,
                    content: `Mock comment - ${commentTime}`,
                    postCid: parentPostOrComment.postCid || parentPostOrComment.cid,
                    parentCid: parentPostOrComment.cid,
                    subplebbitAddress: parentPostOrComment.subplebbitAddress
                })
                .then((comment) => {
                    comment.once("challenge", (challengeMsg) => {
                        comment.publishChallengeAnswers(undefined);
                    });
                    resolve(comment);
                });
        });
    });
}

module.exports = { generateMockPost, generateMockComment };
