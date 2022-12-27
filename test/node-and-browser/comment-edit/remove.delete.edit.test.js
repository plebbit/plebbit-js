const signers = require("../../fixtures/signers");
const { waitTillNewCommentIsPublished, mockPlebbit, generateMockComment, generateMockVote } = require("../../../dist/node/test/test-util");
const { expect } = require("chai");
const { messages } = require("../../../dist/node/errors");

const subplebbitAddress = signers[0].address;
const updateInterval = 300;
const roles = [
    { role: "owner", signer: signers[1] },
    { role: "admin", signer: signers[2] },
    { role: "mod", signer: signers[3] }
];

describe(`Marking posts as removed`, async () => {
    let plebbit, postToRemove;
    before(async () => {
        plebbit = await mockPlebbit();
        postToRemove = await waitTillNewCommentIsPublished(subplebbitAddress, plebbit);
        postToRemove._updateIntervalMs = updateInterval;
        await Promise.all([new Promise((resolve) => postToRemove.once("update", resolve)), postToRemove.update()]);
    });
    after(async () => {
        postToRemove.stop();
    });
    it(`Mod can mark a post as removed`, async () => {
        const removeEdit = await plebbit.createCommentEdit({
            subplebbitAddress: postToRemove.subplebbitAddress,
            commentCid: postToRemove.cid,
            moderatorReason: "To remove a post" + Date.now(),
            removed: true,
            signer: roles[2].signer // Mod role
        });
        await removeEdit.publish();
        await new Promise((resolve) =>
            removeEdit.once("challengeverification", (verificationMsg, _) => {
                expect(verificationMsg.challengeSuccess).to.be.true;
                resolve();
            })
        );

        await new Promise((resolve) => postToRemove.once("update", resolve));
        expect(postToRemove.removed).to.be.true;
        expect(postToRemove.moderatorReason).to.equal(removeEdit.moderatorReason);
    });
    it(`Removed post don't show in subplebbit.posts`, async () => {
        const sub = await plebbit.getSubplebbit(subplebbitAddress);
        const isPostInPages = async () => {
            const pages = await Promise.all(Object.values(sub.posts.pageCids).map((pageCid) => sub.posts.getPage(pageCid)));
            const isPostInAnyPage = pages.some((page) => page.comments.some((comment) => comment.cid === postToRemove.cid));
            return isPostInAnyPage;
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

    it(`Sub rejects votes or comments under removed post`, async () => {
        const replyUnderRemovedPost = await generateMockComment(postToRemove, plebbit);
        const voteUnderRemovedComment = await generateMockVote(postToRemove, 1, plebbit);
        await Promise.all([replyUnderRemovedPost.publish(), voteUnderRemovedComment.publish()]);
        await Promise.all(
            [replyUnderRemovedPost, voteUnderRemovedComment].map(
                (pub) =>
                    new Promise((resolve) =>
                        pub.once("challengeverification", (verificationMsg, _) => {
                            expect(verificationMsg.challengeSuccess).to.be.false;
                            expect(verificationMsg.reason).to.equal(messages.ERR_SUB_PUBLICATION_PARENT_HAS_BEEN_REMOVED);
                            resolve();
                        })
                    )
            )
        );
    });
    it(`Author of post can't mark it as removed`, async () => {
        const postToBeRemoved = await waitTillNewCommentIsPublished(subplebbitAddress, plebbit);
        const removeEdit = await plebbit.createCommentEdit({
            subplebbitAddress: postToBeRemoved.subplebbitAddress,
            commentCid: postToBeRemoved.cid,
            moderatorReason: "To remove a post" + Date.now(),
            removed: true,
            signer: postToBeRemoved.signer
        });
        await removeEdit.publish();
        await new Promise((resolve) =>
            removeEdit.once("challengeverification", (verificationMsg, _) => {
                expect(verificationMsg.challengeSuccess).to.be.false;
                expect(verificationMsg.reason).to.equal(messages.ERR_SUB_COMMENT_EDIT_AUTHOR_INVALID_FIELD);
                resolve();
            })
        );
    });

    it(`Mod can unremove a post`, async () => {
        const unremoveEdit = await plebbit.createCommentEdit({
            subplebbitAddress: postToRemove.subplebbitAddress,
            commentCid: postToRemove.cid,
            moderatorReason: "To unremove a post" + Date.now(),
            removed: false,
            signer: roles[2].signer
        });
        await unremoveEdit.publish();
        await new Promise((resolve) =>
            unremoveEdit.once("challengeverification", (verificationMsg, _) => {
                expect(verificationMsg.challengeSuccess).to.be.true;
                resolve();
            })
        );

        await new Promise((resolve) => postToRemove.once("update", resolve));
        expect(postToRemove.removed).to.be.false;
        expect(postToRemove.moderatorReason).to.equal(unremoveEdit.moderatorReason);

        const sub = await plebbit.getSubplebbit(subplebbitAddress);
        sub._updateIntervalMs = updateInterval;
        await Promise.all([
            sub.update(),
            new Promise((resolve) =>
                sub.on("update", () => sub.posts.pages.hot.comments.some((comment) => comment.cid === postToRemove.cid) && resolve())
            )
        ]);
        await sub.stop();
        const subPages = await Promise.all(Object.values(sub.posts.pageCids).map((pageCid) => sub.posts.getPage(pageCid)));

        subPages.forEach((page) => {
            const postInPage = page.comments.find((comment) => comment.cid === postToRemove.cid);
            expect(postInPage).to.exist;
            expect(postInPage.removed).to.equal(false);
        });
    });
});

describe(`Marking reply as removed`, async () => {
    let plebbit, post, replyToBeRemoved;
    before(async () => {
        plebbit = await mockPlebbit();
        post = await waitTillNewCommentIsPublished(subplebbitAddress, plebbit);
        post._updateIntervalMs = updateInterval;
        await Promise.all([post.update(), new Promise((resolve) => post.once("update", resolve))]);
        expect(post.replies.pages.topAll).to.be.undefined;
        replyToBeRemoved = await generateMockComment(post, plebbit);
        replyToBeRemoved._updateIntervalMs = updateInterval;
        await replyToBeRemoved.publish();
        await new Promise((resolve) => post.once("update", resolve));
        await replyToBeRemoved.update();
    });

    after(async () => {
        post.stop();
        replyToBeRemoved.stop();
    });
    it(`Removed replies show in parent comment pages with 'removed' = true`, async () => {
        expect(post.replies.pages.topAll.comments[0].cid).to.equal(replyToBeRemoved.cid); // Have at least one comment
        expect(post.replies.pages.topAll.comments[0].removed).to.be.false; // Have at least one comment
        expect(post.replyCount).to.equal(1);
        const removeEdit = await plebbit.createCommentEdit({
            subplebbitAddress: replyToBeRemoved.subplebbitAddress,
            commentCid: replyToBeRemoved.cid,
            moderatorReason: "To remove a reply" + Date.now(),
            removed: true,
            signer: roles[2].signer // Mod role
        });
        await removeEdit.publish();
        await Promise.all([
            new Promise((resolve) => replyToBeRemoved.once("update", resolve)),
            new Promise((resolve) => post.once("update", resolve))
        ]);
        expect(replyToBeRemoved.removed).to.be.true;
        expect(post.replies.pages.topAll.comments[0].removed).to.be.true;
        expect(post.replyCount).to.equal(1);
    });

    it(`Removed replies show up in subplebbit.posts with 'removed'=true`, async () => {
        const loadedSub = await plebbit.getSubplebbit(post.subplebbitAddress);
        const subPages = await Promise.all(Object.values(loadedSub.posts.pageCids).map((pageCid) => loadedSub.posts.getPage(pageCid)));

        await Promise.all(
            subPages.map(async (page) => {
                const postInPage = page.comments.find((comment) => comment.cid === post.cid);
                const postPages = await Promise.all(
                    Object.values(postInPage.replies.pageCids).map((pageCid) => loadedSub.posts.getPage(pageCid))
                );
                postPages.forEach((page) => expect(page.comments[0].removed).to.be.true);
            })
        );
    });

    it("Mod can unremove a reply", async () => {
        const unremoveEdit = await plebbit.createCommentEdit({
            subplebbitAddress: replyToBeRemoved.subplebbitAddress,
            commentCid: replyToBeRemoved.cid,
            moderatorReason: "To unremove a reply" + Date.now(),
            removed: false,
            signer: roles[2].signer
        });
        await unremoveEdit.publish();
        await new Promise((resolve) =>
            unremoveEdit.once("challengeverification", (verificationMsg, _) => {
                expect(verificationMsg.challengeSuccess).to.be.true;
                resolve();
            })
        );

        await new Promise((resolve) => replyToBeRemoved.once("update", resolve));
        expect(replyToBeRemoved.removed).to.be.false;
        expect(replyToBeRemoved.moderatorReason).to.equal(unremoveEdit.moderatorReason);

        const sub = await plebbit.getSubplebbit(replyToBeRemoved.subplebbitAddress);
        const subPages = await Promise.all(Object.values(sub.posts.pageCids).map((pageCid) => sub.posts.getPage(pageCid)));

        subPages.forEach(async (page) => {
            const postInPage = page.comments.find((comment) => comment.cid === post.cid);
            const repliesPages = await Promise.all(
                Object.values(postInPage.replies.pageCids).map((pageCid) => postInPage.replies.getPage(pageCid))
            );
            repliesPages.forEach(
                (page) =>
                    expect(page.comments[0].removed).to.be.false &&
                    expect(page.comments[0].moderatorReason).to.equal(unremoveEdit.moderatorReason)
            );
        });
    });
});

describe("Marking post as deleted", async () => {
    let plebbit, postToDelete, modPostToDelete;

    before(async () => {
        plebbit = await mockPlebbit();
        [postToDelete, modPostToDelete] = await Promise.all([
            waitTillNewCommentIsPublished(subplebbitAddress, plebbit),
            waitTillNewCommentIsPublished(subplebbitAddress, plebbit, { signer: roles[2].signer })
        ]);
    });
    it(`Regular author can't mark a post that is not theirs as deleted`, async () => {
        const removeEdit = await plebbit.createCommentEdit({
            subplebbitAddress: postToDelete.subplebbitAddress,
            commentCid: postToDelete.cid,
            moderatorReason: "To delete a post" + Date.now(),
            deleted: true,
            signer: await plebbit.createSigner()
        });
        await removeEdit.publish();
        await new Promise((resolve) =>
            removeEdit.once("challengeverification", (verificationMsg, _) => {
                expect(verificationMsg.challengeSuccess).to.be.false;
                expect(verificationMsg.reason).to.equal(messages.ERR_UNAUTHORIZED_COMMENT_EDIT);
                resolve();
            })
        );
    });

    it(`Author of post can delete their own post`, async () => {
        const removeEdit = await plebbit.createCommentEdit({
            subplebbitAddress: postToDelete.subplebbitAddress,
            commentCid: postToDelete.cid,
            deleted: true,
            signer: postToDelete.signer
        });
        await removeEdit.publish();
        await new Promise((resolve) =>
            removeEdit.once("challengeverification", (verificationMsg, _) => {
                expect(verificationMsg.challengeSuccess).to.be.true;
                resolve();
            })
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
    it(`Regular author can't mark a reply that is not theirs as deleted`, async () => {});
    it(`Author can delete their own reply`);
    it(`Deleted reply don't show in subplebbit posts`);
    it(`Deleted replies don't show in comment.replies pages`);
    it(`Mod can delete their own replies`);
    it(`Sub rejects votes or replies under replies comment`);
});
