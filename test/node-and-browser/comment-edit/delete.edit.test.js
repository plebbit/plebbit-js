const signers = require("../../fixtures/signers");
const {
    publishRandomPost,
    publishRandomReply,
    mockPlebbit,
    generateMockComment,
    generateMockVote
} = require("../../../dist/node/test/test-util");
const { expect } = require("chai");
const { messages } = require("../../../dist/node/errors");

const subplebbitAddress = signers[0].address;
const updateInterval = 300;
const roles = [
    { role: "owner", signer: signers[1] },
    { role: "admin", signer: signers[2] },
    { role: "mod", signer: signers[3] }
];
describe("Marking post as deleted", async () => {
    let plebbit, postToDelete, modPostToDelete, postReply;

    before(async () => {
        plebbit = await mockPlebbit();
        [postToDelete, modPostToDelete] = await Promise.all([
            publishRandomPost(subplebbitAddress, plebbit),
            publishRandomPost(subplebbitAddress, plebbit, { signer: roles[2].signer })
        ]);
        postReply = await publishRandomReply(postToDelete, plebbit);
    });
    it(`Regular author can't mark a post that is not theirs as deleted`, async () => {
        const deleteEdit = await plebbit.createCommentEdit({
            subplebbitAddress: postToDelete.subplebbitAddress,
            commentCid: postToDelete.cid,
            moderatorReason: "To delete a post" + Date.now(),
            deleted: true,
            signer: await plebbit.createSigner()
        });
        await deleteEdit.publish();
        await new Promise((resolve) =>
            deleteEdit.once("challengeverification", (verificationMsg, _) => {
                expect(verificationMsg.challengeSuccess).to.be.false;
                expect(verificationMsg.reason).to.equal(messages.ERR_UNAUTHORIZED_COMMENT_EDIT);
                resolve();
            })
        );
    });

    it(`Mod can't delete a post that is not theirs`, async () => {
        const deleteEdit = await plebbit.createCommentEdit({
            subplebbitAddress: postToDelete.subplebbitAddress,
            commentCid: postToDelete.cid,
            moderatorReason: "To delete a post" + Date.now(),
            deleted: true,
            signer: roles[2].signer
        });
        await deleteEdit.publish();
        await new Promise((resolve) =>
            deleteEdit.once("challengeverification", (verificationMsg, _) => {
                expect(verificationMsg.challengeSuccess).to.be.false;
                expect(verificationMsg.reason).to.equal(messages.ERR_SUB_COMMENT_EDIT_MOD_INVALID_FIELD);
                resolve();
            })
        );
    });

    it(`Author of post can delete their own post`, async () => {
        const deleteEdit = await plebbit.createCommentEdit({
            subplebbitAddress: postToDelete.subplebbitAddress,
            commentCid: postToDelete.cid,
            deleted: true,
            signer: postToDelete.signer
        });
        await deleteEdit.publish();
        await new Promise((resolve) =>
            deleteEdit.once("challengeverification", (verificationMsg, _) => {
                expect(verificationMsg.challengeSuccess).to.be.true;
                resolve();
            })
        );
    });

    it(`Can't publish a reply or vote under a reply of a deleted post`, async () => {
        const [reply, vote] = [await generateMockComment(postReply, plebbit), await generateMockVote(postReply, 1, plebbit)];

        await Promise.all([reply.publish(), vote.publish()]);
        await Promise.all(
            [reply, vote].map(
                (pub) =>
                    new Promise((resolve) =>
                        pub.once("challengeverification", (verificationMsg, _) => {
                            expect(verificationMsg.challengeSuccess).to.be.false;
                            expect(verificationMsg.reason).to.equal(messages.ERR_SUB_PUBLICATION_POST_HAS_BEEN_DELETED);
                            resolve();
                        })
                    )
            )
        );
    });

    it(`Deleted post is omitted from subplebbit.posts`, async () => {
        const sub = await plebbit.getSubplebbit(postToDelete.subplebbitAddress);
        const isPostInPages = async () => {
            const pages = await Promise.all(Object.values(sub.posts.pageCids).map((pageCid) => sub.posts.getPage(pageCid)));
            return pages.some((page) => page.comments.some((comment) => comment.cid === postToDelete.cid));
        };
        if (!(await isPostInPages())) return;

        sub._updateIntervalMs = updateInterval;
        await sub.update();
        await new Promise((resolve) =>
            sub.on("update", async () => {
                if (!(await isPostInPages())) resolve();
            })
        );
        sub.stop();
    });

    it(`Sub rejects votes or comments under deleted post`, async () => {
        const replyUnderDeletedPost = await generateMockComment(postToDelete, plebbit);
        const voteUnderDeletedComment = await generateMockVote(postToDelete, 1, plebbit);
        await Promise.all([replyUnderDeletedPost.publish(), voteUnderDeletedComment.publish()]);
        await Promise.all(
            [replyUnderDeletedPost, voteUnderDeletedComment].map(
                (pub) =>
                    new Promise((resolve) =>
                        pub.once("challengeverification", (verificationMsg, _) => {
                            expect(verificationMsg.challengeSuccess).to.be.false;
                            expect(verificationMsg.reason).to.equal(messages.ERR_SUB_PUBLICATION_PARENT_HAS_BEEN_DELETED);
                            resolve();
                        })
                    )
            )
        );
    });
    it(`Mod can delete their own post`, async () => {
        const deleteEdit = await plebbit.createCommentEdit({
            subplebbitAddress: modPostToDelete.subplebbitAddress,
            commentCid: modPostToDelete.cid,
            deleted: true,
            signer: modPostToDelete.signer
        });
        await deleteEdit.publish();
        await new Promise((resolve) =>
            deleteEdit.once("challengeverification", (verificationMsg, _) => {
                expect(verificationMsg.challengeSuccess).to.be.true;
                resolve();
            })
        );
    });
    it(`Author can undelete their own post`, async () => {
        const undeleteEdit = await plebbit.createCommentEdit({
            subplebbitAddress: postToDelete.subplebbitAddress,
            commentCid: postToDelete.cid,
            deleted: false,
            signer: postToDelete.signer
        });
        await undeleteEdit.publish();
        await new Promise((resolve) =>
            undeleteEdit.once("challengeverification", (verificationMsg, _) => {
                expect(verificationMsg.challengeSuccess).to.be.true;
                resolve();
            })
        );
    });
    it(`Mod can undelete their own post`, async () => {
        const undeleteEdit = await plebbit.createCommentEdit({
            subplebbitAddress: modPostToDelete.subplebbitAddress,
            commentCid: modPostToDelete.cid,
            deleted: false,
            signer: modPostToDelete.signer
        });
        await undeleteEdit.publish();
        await new Promise((resolve) =>
            undeleteEdit.once("challengeverification", (verificationMsg, _) => {
                expect(verificationMsg.challengeSuccess).to.be.true;
                resolve();
            })
        );
    });
});

describe("Marking reply as deleted", async () => {
    let plebbit, replyToDelete, post, replyUnderDeletedReply;

    before(async () => {
        plebbit = await mockPlebbit();
        post = await publishRandomPost(subplebbitAddress, plebbit);
        replyToDelete = await publishRandomReply(post, plebbit);
        replyUnderDeletedReply = await publishRandomReply(replyToDelete, plebbit);
        await Promise.all([replyToDelete.update(), post.update()]);
    });
    after(async () => {
        post.stop();
        replyToDelete.stop();
    });

    it(`Author can delete their own reply`, async () => {
        const deleteEdit = await plebbit.createCommentEdit({
            subplebbitAddress: replyToDelete.subplebbitAddress,
            commentCid: replyToDelete.cid,
            deleted: true,
            signer: replyToDelete.signer
        });
        await deleteEdit.publish();

        await new Promise((resolve) =>
            deleteEdit.once("challengeverification", (verificationMsg, _) => {
                expect(verificationMsg.challengeSuccess).to.be.true;
                resolve();
            })
        );
    });
    it(`A new CommentUpdate is pushed for removing a reply`, async () => {
        await new Promise((resolve) => replyToDelete.once("update", resolve));
        expect(replyToDelete.deleted).to.be.true;
    });
    it(`Deleted replies show in parent comment pages with 'deleted' = true`, async () => {
        if (!post.replies.pages.topAll.comments[0].deleted) await new Promise((resolve) => post.once("update", resolve));
        expect(post.replies.pages.topAll.comments[0].deleted).to.be.true;
        expect(post.replyCount).to.equal(1);
    });
    it(`Deleted replies show up in subplebbit.posts with 'deleted' = true`, async () => {
        const loadedSub = await plebbit.getSubplebbit(post.subplebbitAddress);
        loadedSub._updateIntervalMs = updateInterval;
        await loadedSub.update();
        const isDeletedInPage = async () => {
            const newPage = await loadedSub.posts.getPage(loadedSub.posts.pageCids.new);
            return newPage.comments.find((comment) => comment.cid === post.cid).replies?.pages?.topAll?.comments[0]?.deleted;
        };
        if (!(await isDeletedInPage()))
            await new Promise((resolve) => loadedSub.on("update", async () => (await isDeletedInPage()) && resolve()));
        await loadedSub.stop();
        const subPages = await Promise.all(Object.values(loadedSub.posts.pageCids).map((pageCid) => loadedSub.posts.getPage(pageCid)));

        await Promise.all(
            subPages.map(async (page) => {
                const postInPage = page.comments.find((comment) => comment.cid === post.cid);
                const postPages = await Promise.all(
                    Object.values(postInPage.replies.pageCids).map((pageCid) => loadedSub.posts.getPage(pageCid))
                );
                for (const page of postPages) expect(page.comments[0].deleted).to.be.true;
            })
        );
    });

    it(`Can publish a reply or vote under a reply of a deleted reply`, async () => {
        // post
        //   -- replyToDeleted (deleted=true)
        //     -- replyUnderDeletedReply (deleted = false)
        // We're testing publishing under replyUnderDeletedReply
        const [reply, vote] = [
            await generateMockComment(replyUnderDeletedReply, plebbit),
            await generateMockVote(replyUnderDeletedReply, 1, plebbit)
        ];

        await Promise.all([reply.publish(), vote.publish()]);
        await Promise.all(
            [reply, vote].map(
                (pub) =>
                    new Promise((resolve) =>
                        pub.once("challengeverification", (verificationMsg, _) => {
                            expect(verificationMsg.challengeSuccess).to.be.true;
                            resolve();
                        })
                    )
            )
        );
    });
});
