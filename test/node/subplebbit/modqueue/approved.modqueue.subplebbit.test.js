import { expect } from "chai";
import {
    mockPlebbit,
    publishWithExpectedResult,
    resolveWhenConditionIsTrue,
    processAllCommentsRecursively,
    getCommentWithCommentUpdateProps,
    forceSubplebbitToGenerateAllRepliesPages,
    mockGatewayPlebbit,
    forceSubplebbitToGenerateAllPostsPages,
    publishToModQueueWithDepth,
    loadAllPages,
    describeSkipIfRpc,
    itSkipIfRpc
} from "../../../../dist/node/test/test-util.js";
import { messages } from "../../../../dist/node/errors.js";

const depthsToTest = [0, 1, 2, 3, 4];

for (const pendingCommentDepth of depthsToTest) {
    describe(`Approved comments after pending approval, with depth ` + pendingCommentDepth, async () => {
        let plebbit, subplebbit, approvedComment, modSigner, remotePlebbit;

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

            expect(Object.keys(subplebbit.modQueue.pageCids)).to.deep.equal([]); // should be empty

            const pending = await publishToModQueueWithDepth({
                subplebbit,
                plebbit: remotePlebbit,
                depth: pendingCommentDepth,
                modCommentProps: { signer: modSigner }
            });
            approvedComment = pending.comment;

            await resolveWhenConditionIsTrue(subplebbit, () => subplebbit.modQueue.pageCids.pendingApproval); // wait until we publish a new mod queue with this new comment
            await approvedComment.update();
        });

        after(async () => {
            await subplebbit.delete();
            await plebbit.destroy();
        });

        it("Should approve comment using createCommentModeration with approved: true", async () => {
            const commentModeration = await plebbit.createCommentModeration({
                subplebbitAddress: subplebbit.address,
                signer: modSigner,
                commentModeration: { approved: true, reason: "test approval" },
                commentCid: approvedComment.cid
            });

            await publishWithExpectedResult(commentModeration, true);
        });

        it(`pending comment after approval will receive updates now`, async () => {
            await resolveWhenConditionIsTrue(approvedComment, () => approvedComment.updatedAt);
            expect(approvedComment.updatedAt).to.be.a("number");
            expect(approvedComment.pendingApproval).to.be.false;
            expect(approvedComment.approved).to.be.true;
            expect(approvedComment.reason).to.equal("test approval");
            // regular comment update props are there
            expect(approvedComment.upvoteCount).to.equal(0);
            expect(approvedComment.downvoteCount).to.equal(0);

            expect(approvedComment.raw.commentUpdate.updatedAt).to.be.a("number");
            expect(approvedComment.raw.commentUpdate.pendingApproval).to.be.undefined;
            expect(approvedComment.raw.commentUpdate.approved).to.be.true;
            expect(approvedComment.raw.commentUpdate.reason).to.equal("test approval");
            // regular comment update props are there
            expect(approvedComment.raw.commentUpdate.upvoteCount).to.equal(0);
            expect(approvedComment.raw.commentUpdate.downvoteCount).to.equal(0);
        });

        if (pendingCommentDepth === 0)
            it(`Approved post is now reflected in subplebbit.lastPostCid`, async () => {
                expect(subplebbit.lastPostCid).to.equal(approvedComment.cid);
            });

        it(`Approved comment now appears in subplebbit.lastCommentCid`, async () => {
            expect(subplebbit.lastCommentCid).to.equal(approvedComment.cid);
        });

        if (pendingCommentDepth > 0) {
            it(`Approved reply show up in parentComment.replyCount`, async () => {
                expect((await getCommentWithCommentUpdateProps({ cid: approvedComment.parentCid, plebbit })).replyCount).to.equal(1);
            });
            it(`Approved reply show up in parentComment.childCount`, async () => {
                expect((await getCommentWithCommentUpdateProps({ cid: approvedComment.parentCid, plebbit })).childCount).to.equal(1);
            });
            it(`Approved reply show up in parentComment.lastChildCid`, async () => {
                expect((await getCommentWithCommentUpdateProps({ cid: approvedComment.parentCid, plebbit })).lastChildCid).to.equal(
                    approvedComment.cid
                );
            });
            it(`Approved reply show up in parentComment.lastReplyTimestamp`, async () => {
                expect((await getCommentWithCommentUpdateProps({ cid: approvedComment.parentCid, plebbit })).lastReplyTimestamp).to.equal(
                    approvedComment.timestamp
                );
            });
        }

        it(`Approved comment now appears in subplebbit.posts`, async () => {
            let foundInPosts = false;
            processAllCommentsRecursively(subplebbit.posts.pages.hot?.comments || [], (comment) => {
                if (comment.cid === approvedComment.cid) {
                    foundInPosts = true;
                    return;
                }
            });
            expect(foundInPosts).to.be.true;

            await forceSubplebbitToGenerateAllPostsPages(subplebbit, { signer: modSigner }); // the goal of this is to force the subplebbit to have all pages and page.cids

            expect(subplebbit.posts.pageCids).to.not.deep.equal({}); // should not be empty

            for (const pageCid of Object.values(subplebbit.posts.pageCids)) {
                foundInPosts = false;
                const pageComments = await loadAllPages(pageCid, subplebbit.posts);
                expect(pageComments.length).to.be.greaterThan(0);

                processAllCommentsRecursively(pageComments, (comment) => {
                    if (comment.cid === approvedComment.cid) {
                        foundInPosts = true;
                        return;
                    }
                });
                expect(foundInPosts).to.be.true;
            }
        });

        if (pendingCommentDepth > 0) {
            it(`Approved reply now shows up in parentComment.replies`, async () => {
                const parentComment = await plebbit.getComment(approvedComment.parentCid);
                await parentComment.update();
                await resolveWhenConditionIsTrue(parentComment, () => parentComment.updatedAt);
                let foundInReplies = false;
                processAllCommentsRecursively(parentComment.replies.pages.best?.comments || [], (comment) => {
                    if (comment.cid === approvedComment.cid) {
                        foundInReplies = true;
                        return;
                    }
                });
                expect(foundInReplies).to.be.true;

                await forceSubplebbitToGenerateAllRepliesPages(parentComment, { signer: modSigner }); // the goal of this is to force the subplebbit to have all pages and page.cids

                expect(parentComment.replies.pageCids).to.not.deep.equal({}); // should not be empty

                for (const pageCid of Object.values(parentComment.replies.pageCids)) {
                    foundInReplies = false;
                    const pageComments = await loadAllPages(pageCid, parentComment.replies);

                    expect(pageComments.length).to.be.greaterThan(0);
                    processAllCommentsRecursively(pageComments, (comment) => {
                        if (comment.cid === approvedComment.cid) {
                            foundInReplies = true;
                            return;
                        }
                    });
                    expect(foundInReplies).to.be.true;
                }
                await parentComment.stop();
            });
            it(`Approved reply now shows up in its post's flat pages`, async () => {
                const postComment = await plebbit.getComment(approvedComment.postCid);
                await postComment.update();
                await resolveWhenConditionIsTrue(postComment, () => postComment.updatedAt);
                await forceSubplebbitToGenerateAllRepliesPages(postComment, { signer: modSigner }); // the goal of this is to force the subplebbit to have all pages and page.cids

                const flatPageCids = [postComment.replies.pageCids.newFlat, postComment.replies.pageCids.oldFlat];

                for (const flatPageCid of flatPageCids) {
                    let foundInFlatPages = false;

                    const flatPageComments = await loadAllPages(flatPageCid, postComment.replies);

                    expect(flatPageComments.length).to.be.greaterThan(0);
                    processAllCommentsRecursively(flatPageComments, (comment) => {
                        if (comment.cid === approvedComment.cid) {
                            foundInFlatPages = true;
                            return;
                        }
                    });
                    expect(foundInFlatPages).to.be.true;
                }

                await postComment.stop();
            });
        }

        it(`Approved comment does not appear in modQueue.pageCids`, async () => {
            expect(subplebbit.modQueue.pageCids.pendingApproval).to.be.undefined;
        });

        if (pendingCommentDepth === 0)
            itSkipIfRpc(`Approved post shows up in subplebbit.postUpdates`, async () => {
                expect(subplebbit.postUpdates).to.exist;
                const localMfsPath = `/${subplebbit.address}/postUpdates/86400/${approvedComment.cid}/update`;
                const kuboRpc = Object.values(plebbit.clients.kuboRpcClients)[0]._client;

                const res = await kuboRpc.files.stat(localMfsPath); // this call needs to pass because file should exist

                expect(res.size).to.be.greaterThan(0);
            });

        itSkipIfRpc(`Approved comment is pinned to IPFS node`, async () => {
            const kuboRpc = Object.values(plebbit.clients.kuboRpcClients)[0]._client;

            const res = await kuboRpc.block.stat(approvedComment.cid);

            expect(res.size).to.be.greaterThan(0);

            const pinnedCids = [];

            for await (const { cid } of kuboRpc.pin.ls({ paths: approvedComment.cid })) {
                pinnedCids.push(cid.toString());
            }

            expect(pinnedCids).to.include(approvedComment.cid);
        });

        it(`Sub should reject CommentModeration if a mod publishes approval for a comment that already got approved`, async () => {
            const commentModeration = await plebbit.createCommentModeration({
                subplebbitAddress: subplebbit.address,
                signer: modSigner,
                commentModeration: { approved: true },
                commentCid: approvedComment.cid
            });

            await publishWithExpectedResult(
                commentModeration,
                false,
                messages.ERR_MOD_ATTEMPTING_TO_APPROVE_OR_DISAPPROVE_COMMENT_THAT_IS_NOT_PENDING
            );
        });
    });
}
