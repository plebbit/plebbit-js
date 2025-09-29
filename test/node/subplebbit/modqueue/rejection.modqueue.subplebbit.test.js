import { expect } from "chai";
import {
    mockPlebbit,
    publishWithExpectedResult,
    resolveWhenConditionIsTrue,
    generateMockComment,
    processAllCommentsRecursively,
    forceSubplebbitToGenerateAllRepliesPages,
    mockGatewayPlebbit,
    forceSubplebbitToGenerateAllPostsPages,
    publishToModQueueWithDepth,
    generateMockVote,
    loadAllPages
} from "../../../../dist/node/test/test-util.js";
import { messages } from "../../../../dist/node/errors.js";

// TODO test skeletons
// comment.approved = true is treated like a regular comment, should be pinned to IPFS node as well

const depthsToTest = [0, 1, 2, 3];

const getLatestUpdateOfParentComment = async (commentToBeRejected) => {
    const parentComment = await commentToBeRejected._plebbit.getComment(commentToBeRejected.parentCid);
    await parentComment.update();
    await resolveWhenConditionIsTrue(parentComment, () => parentComment.updatedAt);
    return parentComment;
};

for (const pendingCommentDepth of depthsToTest) {
    describe(`Comment moderation rejection of pending comment with depth ` + pendingCommentDepth, async () => {
        let plebbit;
        let remotePlebbit;
        let commentToBeRejected;
        let modSigner;
        const reasonForRejection = "Rejection of comment with depth " + pendingCommentDepth + " Because of reason" + Math.random();
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

            await resolveWhenConditionIsTrue(subplebbit, () => subplebbit.moderation.pageCids.pendingApproval); // wait until we publish a new mod queue with this new comment
            await commentToBeRejected.update();
        });

        after(async () => {
            await subplebbit.delete();
            await plebbit.destroy();
            await remotePlebbit.destroy();
        });

        it(`Can reject comment with approved: false`, async () => {
            const commentModeration = await plebbit.createCommentModeration({
                subplebbitAddress: subplebbit.address,
                signer: modSigner,
                commentModeration: { approved: false, reason: reasonForRejection },
                commentCid: commentToBeRejected.cid
            });

            await publishWithExpectedResult(commentModeration, true);
        });

        it(`Rejecting a pending comment will purge it from modQueue`, async () => {
            await resolveWhenConditionIsTrue(subplebbit, () => !subplebbit.moderation.pageCids.pendingApproval); // wait until we publish a new mod queue with this new comment
            expect(subplebbit.moderation.pageCids.pendingApproval).to.be.undefined;
        });

        it(`Rejecting a pending comment will not remove it from database of subplebbit`, async () => {
            const queryRes = subplebbit._dbHandler.queryComment(commentToBeRejected.cid);
            expect(queryRes).to.be.exist;
        });

        if (pendingCommentDepth > 0) {
            it(`Rejected reply does not show up in parentComment.replyCount`, async () => {
                expect((await getLatestUpdateOfParentComment(commentToBeRejected)).replyCount).to.equal(0);
            });

            it(`Rejected reply does not show up in parentComment.childCount`, async () => {
                expect((await getLatestUpdateOfParentComment(commentToBeRejected)).childCount).to.equal(0);
            });

            it(`Rejected reply does not show up in parentComment.lastChildCid`, async () => {
                expect((await getLatestUpdateOfParentComment(commentToBeRejected)).lastChildCid).to.be.undefined;
            });
            it(`Rejected reply does not show up in parentComment.lastReplyTimestamp`, async () => {
                expect((await getLatestUpdateOfParentComment(commentToBeRejected)).lastReplyTimestamp).to.be.undefined;
            });
        }

        if (pendingCommentDepth === 0)
            it(`Rejected post does not show up in subplebbit.lastPostCid`, async () => {
                expect(subplebbit.lastPostCid).to.not.equal(commentToBeRejected.cid);
            });

        it(`Rejected comment does not show up in subplebbit.lastCommentCid`, async () => {
            expect(subplebbit.lastCommentCid).to.not.equal(commentToBeRejected.cid);
        });

        it(`A rejected comment will not show up in subplebbit.posts`, async () => {
            let foundInPosts = false;
            processAllCommentsRecursively(subplebbit.posts.pages.hot?.comments || [], (comment) => {
                if (comment.cid === commentToBeRejected.cid) {
                    foundInPosts = true;
                    return;
                }
            });
            expect(foundInPosts).to.be.false;

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
                expect(foundInPosts).to.be.false;
            }
        });

        if (pendingCommentDepth > 0)
            it("A rejected reply will not show up in parentComment.replies", async () => {
                const parentComment = await plebbit.getComment(commentToBeRejected.parentCid);
                await parentComment.update();
                await resolveWhenConditionIsTrue(parentComment, () => parentComment.updatedAt);
                let foundInReplies = false;
                processAllCommentsRecursively(parentComment.replies.pages.best?.comments || [], (comment) => {
                    if (comment.cid === commentToBeRejected.cid) {
                        foundInReplies = true;
                        return;
                    }
                });
                expect(foundInReplies).to.be.false;

                await forceSubplebbitToGenerateAllRepliesPages(parentComment, { signer: modSigner }); // the goal of this is to force the subplebbit to have all pages and page.cids

                expect(parentComment.replies.pageCids).to.not.deep.equal({}); // should not be empty

                for (const pageCid of Object.values(parentComment.replies.pageCids)) {
                    const pageComments = await loadAllPages(pageCid, parentComment.replies);

                    expect(pageComments.length).to.be.greaterThan(0);
                    processAllCommentsRecursively(pageComments, (comment) => {
                        if (comment.cid === commentToBeRejected.cid) {
                            foundInReplies = true;
                            return;
                        }
                    });
                    expect(foundInReplies).to.be.false;
                }
                await parentComment.stop();
            });
        if (pendingCommentDepth > 0)
            it(`A rejected reply will not show up in flat pages of post`, async () => {
                const postComment = await plebbit.getComment(commentToBeRejected.postCid);
                await postComment.update();
                await resolveWhenConditionIsTrue(postComment, () => postComment.updatedAt);
                await forceSubplebbitToGenerateAllRepliesPages(postComment, { signer: modSigner }); // the goal of this is to force the subplebbit to have all pages and page.cids

                const flatPageCids = [postComment.replies.pageCids.newFlat, postComment.replies.pageCids.oldFlat];

                let foundInFlatPages = false;
                for (const flatPageCid of flatPageCids) {
                    const flatPageComments = await loadAllPages(flatPageCid, postComment.replies);

                    expect(flatPageComments.length).to.be.greaterThan(0);
                    processAllCommentsRecursively(flatPageComments, (comment) => {
                        if (comment.cid === commentToBeRejected.cid) {
                            foundInFlatPages = true;
                            return;
                        }
                    });
                    expect(foundInFlatPages).to.be.false;
                }

                await postComment.stop();
            });

        it(`comments with approved: false should not be in pageCids.pendingApproval`, async () => {
            expect(subplebbit.moderation.pageCids.pendingApproval).to.be.undefined;
        });
        if (pendingCommentDepth === 0)
            it(`Rejecting a pending post will still keep it in subplebbit.postUpdates`, async () => {
                expect(subplebbit.postUpdates).to.exist;
                const localMfsPath = `/${subplebbit.address}/postUpdates/86400/${commentToBeRejected.cid}/update`;
                const kuboRpc = Object.values(plebbit.clients.kuboRpcClients)[0]._client;

                const res = await kuboRpc.files.stat(localMfsPath); // this call needs to pass because file should exist

                expect(res.size).to.be.greaterThan(0);
            });

        it(`A rejected comment will expire and get removed from postUpdates and DB`);

        // TODO remove this later when we implement a fix for updating a reply with approved=false
        if (pendingCommentDepth === 0) {
            it(`Can update a rejected comment and retrieve its update`, async () => {
                const newComment = await remotePlebbit.createComment(commentToBeRejected);

                await newComment.update();
                await resolveWhenConditionIsTrue(newComment, () => newComment.updatedAt);

                expect(newComment.approved).to.be.false;
                expect(newComment.reason).to.equal(reasonForRejection);
                expect(newComment.updatedAt).to.be.a("number"); // updatedAt should be published along approved: false
                expect(newComment.upvoteCount).to.equal(0);
                expect(newComment.replyCount).to.equal(0);
                expect(newComment.childCount).to.equal(0);
                // `Publishing approved:false adds removed:true automatically to comment update
                expect(newComment.removed).to.be.true;

                expect(newComment.raw.commentUpdate.approved).to.be.false;
                expect(newComment.raw.commentUpdate.reason).to.equal(reasonForRejection);
                expect(newComment.raw.commentUpdate.updatedAt).to.be.a("number"); // updatedAt should be published along approved: false
                expect(newComment.raw.commentUpdate.upvoteCount).to.equal(0);
                expect(newComment.raw.commentUpdate.replyCount).to.equal(0);
                expect(newComment.raw.commentUpdate.childCount).to.equal(0);

                expect(newComment.raw.commentUpdate.removed).to.be.true;

                await newComment.stop();
            });

            it(`A different mod can publish CommentModeration on top of approved:false, and its props would be picked up`, async () => {
                const commentModerationProps = {
                    reason: "New reason to be picked up and used" + Math.random(),
                    spoiler: true,
                    nsfw: true,
                    pinned: true,
                    removed: false
                };
                const commentModeration = await plebbit.createCommentModeration({
                    subplebbitAddress: subplebbit.address,
                    signer: modSigner,
                    commentModeration: commentModerationProps,
                    commentCid: commentToBeRejected.cid
                });

                await publishWithExpectedResult(commentModeration, true);

                await commentToBeRejected.update();

                await resolveWhenConditionIsTrue(commentToBeRejected, () => commentToBeRejected.reason === commentModerationProps.reason);

                for (const moderationKey of Object.keys(commentModerationProps)) {
                    expect(commentToBeRejected[moderationKey]).to.equal(commentModerationProps[moderationKey]);
                    expect(commentToBeRejected.raw.commentUpdate[moderationKey]).to.equal(commentModerationProps[moderationKey]);
                }

                expect(commentToBeRejected["approved"]).to.be.false;
                expect(commentToBeRejected.raw.commentUpdate["approved"]).to.be.false;
            });

            it(`A rejected comment will have pendingApproval=false`, async () => {
                expect(commentToBeRejected.pendingApproval).to.be.false;
            });
        }

        it(`Can't vote on rejected comment`, async () => {
            const vote = await generateMockVote(commentToBeRejected, 1, plebbit, modSigner); // need to publish under mod otherwise we're gonna get captcha challenge
            await publishWithExpectedResult(vote, false, messages.ERR_USER_PUBLISHED_UNDER_DISAPPROVED_COMMENT);
        });

        it(`Can't publish a reply under a rejected comment`, async () => {
            const reply = await generateMockComment(commentToBeRejected, plebbit, false);
            await publishWithExpectedResult(reply, false, messages.ERR_USER_PUBLISHED_UNDER_DISAPPROVED_COMMENT);
        });

        it(`Can't publish an edit under a rejected comment`, async () => {
            const edit = await plebbit.createCommentEdit({
                subplebbitAddress: commentToBeRejected.subplebbitAddress,
                commentCid: commentToBeRejected.cid,
                reason: "random reason should fail",
                content: "text to edit on pending comment",
                signer: commentToBeRejected.signer
            });
            await publishWithExpectedResult(edit, false, messages.ERR_USER_PUBLISHED_UNDER_DISAPPROVED_COMMENT);
        });
    });
}
