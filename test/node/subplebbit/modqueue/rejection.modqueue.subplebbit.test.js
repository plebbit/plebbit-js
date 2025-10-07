import { expect } from "chai";
import {
    mockPlebbit,
    publishWithExpectedResult,
    resolveWhenConditionIsTrue,
    generateMockComment,
    processAllCommentsRecursively,
    forceSubplebbitToGenerateAllRepliesPages,
    mockGatewayPlebbit,
    getCommentWithCommentUpdateProps,
    forceSubplebbitToGenerateAllPostsPages,
    publishToModQueueWithDepth,
    generateMockVote,
    loadAllPages
} from "../../../../dist/node/test/test-util.js";
import { messages } from "../../../../dist/node/errors.js";

const depthsToTest = [0, 1, 2, 3];

const commentModProps = [
    { approved: false, reason: "Test reason 1234" },
    { approved: false },
    {
        approved: false,
        reason: "New reason to be picked up and used",
        spoiler: true,
        nsfw: true,
        pinned: true,
        removed: true
    },
    { approved: false, reason: "Test removed and approved", removed: true }
];

for (const commentMod of commentModProps) {
    for (const pendingCommentDepth of depthsToTest) {
        const shouldCommentBePurged = Object.keys(commentMod).length === 1; // only approved=false, no other props
        describe(
            `Comment moderation rejection of pending comment with depth ` +
                pendingCommentDepth +
                " and commentModeration=" +
                JSON.stringify(commentMod),
            async () => {
                let plebbit;
                let remotePlebbit;
                let commentToBeRejected;
                let modSigner;
                let subplebbit;

                before(async () => {
                    plebbit = await mockPlebbit();
                    remotePlebbit = await mockGatewayPlebbit();
                    subplebbit = await plebbit.createSubplebbit();
                    subplebbit.setMaxListeners(100);
                    await subplebbit.start();
                    modSigner = await plebbit.createSigner();
                    await subplebbit.edit({
                        roles: {
                            [modSigner.address]: { role: "moderator" }
                        },
                        settings: { challenges: [{ ...subplebbit.settings.challenges[0], pendingApproval: true }] }
                    });

                    await resolveWhenConditionIsTrue(subplebbit, () => subplebbit.updatedAt);

                    const pending = await publishToModQueueWithDepth({
                        subplebbit,
                        plebbit: remotePlebbit,
                        depth: pendingCommentDepth,
                        modCommentProps: { signer: modSigner }
                    });
                    commentToBeRejected = pending.comment;

                    await resolveWhenConditionIsTrue(subplebbit, () => subplebbit.modQueue.pageCids.pendingApproval); // wait until we publish a new mod queue with this new comment
                    await commentToBeRejected.update();
                });

                after(async () => {
                    await commentToBeRejected.stop();
                    await subplebbit.delete();
                    await plebbit.destroy();
                    await remotePlebbit.destroy();
                });

                it(`Can reject comment with commentModeration=${JSON.stringify(commentMod)}`, async () => {
                    const commentModeration = await plebbit.createCommentModeration({
                        subplebbitAddress: subplebbit.address,
                        signer: modSigner,
                        commentModeration: commentMod,
                        commentCid: commentToBeRejected.cid
                    });

                    await publishWithExpectedResult(commentModeration, true);
                });

                it(`Rejecting a pending comment will purge it from modQueue`, async () => {
                    await resolveWhenConditionIsTrue(subplebbit, () => !subplebbit.modQueue.pageCids.pendingApproval); // wait until we publish a new mod queue with this new comment
                    expect(subplebbit.modQueue.pageCids.pendingApproval).to.be.undefined;
                });

                if (!shouldCommentBePurged)
                    it(`Rejecting a pending comment with ${JSON.stringify(commentMod)} will not remove it from database of subplebbit because it has more than {approved: false}`, async () => {
                        const queryRes = subplebbit._dbHandler.queryComment(commentToBeRejected.cid);
                        expect(queryRes).to.be.exist;
                    });
                if (shouldCommentBePurged) {
                    it(`Rejecting a pending comment with only ${JSON.stringify(commentMod)} will purge it out of DB`, async () => {
                        const queryRes = subplebbit._dbHandler.queryComment(commentToBeRejected.cid);
                        expect(queryRes).to.be.not.exist;
                    });
                }

                if (pendingCommentDepth > 0) {
                    it(`Rejected reply does not show up in parentComment.replyCount`, async () => {
                        expect(
                            (await getCommentWithCommentUpdateProps({ cid: commentToBeRejected.parentCid, plebbit })).replyCount
                        ).to.equal(0);
                    });

                    it(`Rejected reply does not show up in parentComment.childCount`, async () => {
                        expect(
                            (await getCommentWithCommentUpdateProps({ cid: commentToBeRejected.parentCid, plebbit })).childCount
                        ).to.equal(0);
                    });

                    it(`Rejected reply does not show up in parentComment.lastChildCid`, async () => {
                        expect((await getCommentWithCommentUpdateProps({ cid: commentToBeRejected.parentCid, plebbit })).lastChildCid).to.be
                            .undefined;
                    });
                    it(`Rejected reply does not show up in parentComment.lastReplyTimestamp`, async () => {
                        expect((await getCommentWithCommentUpdateProps({ cid: commentToBeRejected.parentCid, plebbit })).lastReplyTimestamp)
                            .to.be.undefined;
                    });
                }

                if (pendingCommentDepth === 0)
                    it(`Rejected post does not show up in subplebbit.lastPostCid`, async () => {
                        expect(subplebbit.lastPostCid).to.not.equal(commentToBeRejected.cid);
                    });

                it(`Rejected comment does not show up in subplebbit.lastCommentCid`, async () => {
                    expect(subplebbit.lastCommentCid).to.not.equal(commentToBeRejected.cid);
                });

                it(`A rejected comment with only ${JSON.stringify(commentMod)} will never show up in subplebbit.posts`, async () => {
                    let foundInPosts = false;
                    // for posts
                    // there never gonna in subplebbit.posts

                    const expectedResult =
                        pendingCommentDepth === 0 ? false : pendingCommentDepth > 0 && shouldCommentBePurged ? false : true; // if it's a reply then it will be nested within another commment and will appear in subplebbit.post
                    processAllCommentsRecursively(subplebbit.posts.pages.hot?.comments || [], (comment) => {
                        if (comment.cid === commentToBeRejected.cid) {
                            foundInPosts = true;
                            return;
                        }
                    });
                    expect(foundInPosts).to.equal(expectedResult);

                    await forceSubplebbitToGenerateAllPostsPages(subplebbit, { signer: modSigner }); // the goal of this is to force the subplebbit to have all pages and page.cids

                    expect(subplebbit.posts.pageCids).to.not.deep.equal({}); // should not be empty

                    for (const pageCid of Object.values(subplebbit.posts.pageCids)) {
                        const pageComments = await loadAllPages(pageCid, subplebbit.posts);
                        expect(pageComments.length).to.be.greaterThan(0);

                        processAllCommentsRecursively(pageComments, (comment) => {
                            if (comment.cid === commentToBeRejected.cid) {
                                foundInPosts = true;
                                return;
                            }
                        });
                        expect(foundInPosts).to.equal(expectedResult);
                    }
                });

                if (pendingCommentDepth > 0)
                    it(`A rejected reply will ${shouldCommentBePurged ? "not" : ""} show up in parentComment.replies`, async () => {
                        const parentComment = await plebbit.getComment(commentToBeRejected.parentCid);
                        await parentComment.update();
                        await resolveWhenConditionIsTrue(parentComment, () => parentComment.updatedAt);
                        const expectedResult = !shouldCommentBePurged;
                        let foundInReplies = false;
                        processAllCommentsRecursively(parentComment.replies.pages.best?.comments || [], (comment) => {
                            if (comment.cid === commentToBeRejected.cid) {
                                foundInReplies = true;
                                return;
                            }
                        });
                        expect(foundInReplies).to.equal(expectedResult);

                        await forceSubplebbitToGenerateAllRepliesPages(parentComment, { signer: modSigner }); // the goal of this is to force the subplebbit to have all pages and page.cids

                        expect(parentComment.replies.pageCids).to.not.deep.equal({}); // should not be empty

                        for (const pageCid of Object.values(parentComment.replies.pageCids)) {
                            foundInReplies = false;
                            const pageComments = await loadAllPages(pageCid, parentComment.replies);

                            expect(pageComments.length).to.be.greaterThan(0);
                            processAllCommentsRecursively(pageComments, (comment) => {
                                if (comment.cid === commentToBeRejected.cid) {
                                    foundInReplies = true;
                                    return;
                                }
                            });
                            expect(foundInReplies).to.equal(expectedResult);
                        }
                        await parentComment.stop();
                    });
                if (pendingCommentDepth > 0)
                    it(`A rejected reply will ${shouldCommentBePurged ? "not" : ""} show up in flat pages of post`, async () => {
                        const postComment = await plebbit.getComment(commentToBeRejected.postCid);
                        await postComment.update();
                        await resolveWhenConditionIsTrue(postComment, () => postComment.updatedAt);
                        await forceSubplebbitToGenerateAllRepliesPages(postComment, { signer: modSigner }); // the goal of this is to force the subplebbit to have all pages and page.cids

                        const expectedResult = !shouldCommentBePurged;

                        const flatPageCids = [postComment.replies.pageCids.newFlat, postComment.replies.pageCids.oldFlat];

                        for (const flatPageCid of flatPageCids) {
                            let foundInFlatPages = false;
                            const flatPageComments = await loadAllPages(flatPageCid, postComment.replies);

                            expect(flatPageComments.length).to.be.greaterThan(0);
                            processAllCommentsRecursively(flatPageComments, (comment) => {
                                if (comment.cid === commentToBeRejected.cid) {
                                    foundInFlatPages = true;
                                    return;
                                }
                            });
                            expect(foundInFlatPages).to.equal(expectedResult);
                        }

                        await postComment.stop();
                    });

                it(`comments with approved: false should not be in pageCids.pendingApproval`, async () => {
                    expect(subplebbit.modQueue.pageCids.pendingApproval).to.be.undefined;
                });
                if (pendingCommentDepth === 0)
                    it(`Rejecting a pending post with ${JSON.stringify(commentMod)} will ${shouldCommentBePurged ? "not" : ""} keep it in subplebbit.postUpdates`, async () => {
                        expect(subplebbit.postUpdates).to.exist;
                        const localMfsPath = `/${subplebbit.address}/postUpdates/86400/${commentToBeRejected.cid}/update`;
                        const kuboRpc = Object.values(plebbit.clients.kuboRpcClients)[0]._client;

                        try {
                            const res = await kuboRpc.files.stat(localMfsPath); // this call needs to pass because file should exist

                            if (!shouldCommentBePurged) expect(res.size).to.be.greaterThan(0);
                            else expect.fail("call should not succeed");
                        } catch (e) {
                            if (shouldCommentBePurged) expect(e.message).to.equal("file does not exist");
                            else expect.fail("should not fail");
                        }
                    });

                if (shouldCommentBePurged)
                    it(`Should not be able to update a rejected comment with ${JSON.stringify(commentMod)} and retrieve its update`, async () => {
                        const newComment = await remotePlebbit.createComment(commentToBeRejected);

                        const errors = [];
                        const failIfUpdated = () =>
                            newComment.raw.commentUpdate &&
                            expect.fail("Rejected comment unexpectedly emitted an update event with CommentUpdate");
                        newComment.on("update", failIfUpdated);
                        newComment.on("error", (err) => errors.push(err));
                        await newComment.update();

                        await resolveWhenConditionIsTrue(newComment, () => errors.length > 0, "error");
                        newComment.removeListener("update", failIfUpdated);

                        expect(errors[0].code).to.be.oneOf([
                            "ERR_FAILED_TO_FETCH_COMMENT_UPDATE_FROM_ALL_POST_UPDATES_RANGES",
                            "ERR_FAILED_TO_FIND_REPLY_COMMENT_UPDATE_WITHIN_PARENT_COMMENT_PAGE_CIDS"
                        ]);
                    });

                if (!shouldCommentBePurged)
                    it(`Can update a rejected comment with ${JSON.stringify(commentMod)} and retrieve its update`, async () => {
                        const newComment = await remotePlebbit.createComment(commentToBeRejected);

                        await newComment.update();
                        await resolveWhenConditionIsTrue(newComment, () => newComment.updatedAt);

                        // will test for approved, removed, reason, etc
                        for (const commentModKey of Object.keys(commentMod)) {
                            expect(newComment[commentModKey]).to.equal(commentMod[commentModKey]);
                            expect(newComment.raw.commentUpdate[commentModKey]).to.equal(commentMod[commentModKey]);
                        }

                        expect(newComment.updatedAt).to.be.a("number"); // updatedAt should be published along approved: false
                        expect(newComment.upvoteCount).to.equal(0);
                        expect(newComment.replyCount).to.equal(0);
                        expect(newComment.childCount).to.equal(0);
                        // `Publishing approved:false adds removed:true automatically to comment update
                        expect(newComment.removed).to.be.true;

                        expect(newComment.raw.commentUpdate.updatedAt).to.be.a("number"); // updatedAt should be published along approved: false
                        expect(newComment.raw.commentUpdate.upvoteCount).to.equal(0);
                        expect(newComment.raw.commentUpdate.replyCount).to.equal(0);
                        expect(newComment.raw.commentUpdate.childCount).to.equal(0);

                        expect(newComment.raw.commentUpdate.removed).to.be.true;

                        await newComment.stop();
                    });

                if (Object.keys(commentMod).length !== 1)
                    // if only {approved:false} then we're not getting an update
                    it(`A rejected comment will have pendingApproval=false after receiving an update with ${JSON.stringify(commentMod)}`, async () => {
                        expect(commentToBeRejected.pendingApproval).to.be.false;
                    });

                it(`Can't vote on rejected comment`, async () => {
                    const expectedMessage = commentMod.removed
                        ? messages.ERR_SUB_PUBLICATION_PARENT_HAS_BEEN_REMOVED
                        : shouldCommentBePurged
                          ? messages.ERR_PUBLICATION_PARENT_DOES_NOT_EXIST_IN_SUB
                          : messages.ERR_USER_PUBLISHED_UNDER_DISAPPROVED_COMMENT;
                    const vote = await generateMockVote(commentToBeRejected, 1, plebbit, modSigner); // need to publish under mod otherwise we're gonna get captcha challenge
                    await publishWithExpectedResult(vote, false, expectedMessage);
                });

                it(`Can't publish a reply under a rejected comment`, async () => {
                    const expectedMessage = commentMod.removed
                        ? messages.ERR_SUB_PUBLICATION_PARENT_HAS_BEEN_REMOVED
                        : shouldCommentBePurged
                          ? messages.ERR_PUBLICATION_PARENT_DOES_NOT_EXIST_IN_SUB
                          : messages.ERR_USER_PUBLISHED_UNDER_DISAPPROVED_COMMENT;
                    const reply = await generateMockComment(commentToBeRejected, plebbit, false);
                    await publishWithExpectedResult(reply, false, expectedMessage);
                });

                it(`Can't publish an edit under a rejected comment`, async () => {
                    const expectedMessage = commentMod.removed
                        ? messages.ERR_SUB_PUBLICATION_PARENT_HAS_BEEN_REMOVED
                        : shouldCommentBePurged
                          ? messages.ERR_PUBLICATION_PARENT_DOES_NOT_EXIST_IN_SUB
                          : messages.ERR_USER_PUBLISHED_UNDER_DISAPPROVED_COMMENT;
                    const edit = await plebbit.createCommentEdit({
                        subplebbitAddress: commentToBeRejected.subplebbitAddress,
                        commentCid: commentToBeRejected.cid,
                        reason: "random reason should fail",
                        content: "text to edit on pending comment",
                        signer: commentToBeRejected.signer
                    });
                    await publishWithExpectedResult(edit, false, expectedMessage);
                });

                it(`A rejected comment is not pinned to IPFS node`, async () => {
                    const kuboRpc = Object.values(plebbit.clients.kuboRpcClients)[0]._client;

                    // Collect all pinned CIDs
                    for await (const pin of kuboRpc.pin.ls()) {
                        expect(pin.cid.toString()).to.not.equal(commentToBeRejected.cid); // pending comment should not be pinned in kubo
                    }
                });

                it(`Sub should reject CommentModeration if a mod published disapproval for a comment that already got disapproved`, async () => {
                    const expectedMessage = shouldCommentBePurged
                        ? messages.ERR_PUBLICATION_PARENT_DOES_NOT_EXIST_IN_SUB
                        : messages.ERR_MOD_ATTEMPTING_TO_APPROVE_OR_DISAPPROVE_COMMENT_THAT_IS_NOT_PENDING;
                    const commentModerationDisapproval = await plebbit.createCommentModeration({
                        subplebbitAddress: subplebbit.address,
                        signer: modSigner,
                        commentModeration: { approved: false },
                        commentCid: commentToBeRejected.cid
                    });

                    await publishWithExpectedResult(commentModerationDisapproval, false, expectedMessage);
                });

                it(`A rejected comment is not pinned to IPFS node after restarting the sub`, async () => {
                    await subplebbit.stop();

                    const updatePromise = new Promise((resolve) => subplebbit.once("update", resolve));
                    await subplebbit.start();
                    await updatePromise;

                    const kuboRpc = Object.values(plebbit.clients.kuboRpcClients)[0]._client;

                    // Collect all pinned CIDs
                    for await (const pin of kuboRpc.pin.ls()) {
                        expect(pin.cid.toString()).to.not.equal(commentToBeRejected.cid); // pending comment should not be pinned in kubo
                    }
                });
            }
        );
    }
}
