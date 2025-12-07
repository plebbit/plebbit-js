import { expect } from "chai";
import {
    mockPlebbit,
    publishWithExpectedResult,
    resolveWhenConditionIsTrue,
    generateMockComment,
    getCommentWithCommentUpdateProps,
    publishToModQueueWithDepth,
    generateMockVote,
    itSkipIfRpc,
    getAvailablePlebbitConfigsToTestAgainst,
    createPendingApprovalChallenge
} from "../../../../dist/node/test/test-util.js";
import { messages } from "../../../../dist/node/errors.js";
import { describe, it, vi } from "vitest";

const remotePlebbitConfigs = getAvailablePlebbitConfigsToTestAgainst({ includeAllPossibleConfigOnEnv: true });

const depthsToTest = [0, 1, 2, 15];
const pendingApprovalCommentProps = { challengeRequest: { challengeAnswers: ["pending"] } };

const commentModProps = [
    { approved: false },

    { approved: false, reason: "Test reason 1234" },
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

        // if a post is rejected, then it never appears in subplebbit.post, and if you wanna get its commentUpdate you can do so from postUpdates
        // but if a reply is rejected, then it will be included in pages only if shouldCommentBePurged = false
        const shouldCommentBeInPostsOrRepliesPages = pendingCommentDepth === 0 ? false : !shouldCommentBePurged; // if it's a reply then it will be nested within another commment and will appear in subplebbit.post

        describe.concurrent(
            `Comment moderation rejection of pending comment with depth ` +
                pendingCommentDepth +
                " and commentModeration=" +
                JSON.stringify(commentMod),
            () => {
                let plebbit;
                let commentToBeRejected;
                let modSigner;
                let subplebbit;

                before(async () => {
                    plebbit = await mockPlebbit();
                    subplebbit = await plebbit.createSubplebbit();
                    subplebbit.setMaxListeners(100);
                    modSigner = await plebbit.createSigner();
                    await subplebbit.edit({
                        roles: {
                            [modSigner.address]: { role: "moderator" }
                        },
                        settings: { challenges: [createPendingApprovalChallenge()] }
                    });

                    await subplebbit.start();
                    await resolveWhenConditionIsTrue({ toUpdate: subplebbit, predicate: () => Boolean(subplebbit.updatedAt) });

                    const pending = await publishToModQueueWithDepth({
                        subplebbit,
                        plebbit: plebbit, // needs to be remote or otherwise it will add comment to local node which will ruin our test
                        depth: pendingCommentDepth,
                        modCommentProps: { signer: modSigner, content: " 12" + Math.random() },
                        commentProps: pendingApprovalCommentProps
                    });
                    commentToBeRejected = pending.comment;

                    await resolveWhenConditionIsTrue({
                        toUpdate: subplebbit,
                        predicate: () => subplebbit.modQueue.pageCids.pendingApproval
                    }); // wait until we publish a new mod queue with this new comment
                    await commentToBeRejected.update();
                });

                after(async () => {
                    await subplebbit.delete();
                    await plebbit.destroy();
                });

                it.sequential(`Can reject comment with commentModeration=${JSON.stringify(commentMod)}`, async () => {
                    const commentModeration = await plebbit.createCommentModeration({
                        subplebbitAddress: subplebbit.address,
                        signer: modSigner,
                        commentModeration: commentMod,
                        commentCid: commentToBeRejected.cid
                    });

                    await publishWithExpectedResult(commentModeration, true);
                });

                it.sequential(`Rejecting a pending comment will purge it from modQueue`, async () => {
                    await resolveWhenConditionIsTrue({
                        toUpdate: subplebbit,
                        predicate: () => !subplebbit.modQueue.pageCids.pendingApproval
                    }); // wait until we publish a new mod queue with this new comment
                    expect(subplebbit.modQueue.pageCids.pendingApproval).to.be.undefined;
                });

                if (!shouldCommentBePurged)
                    itSkipIfRpc(
                        `Rejecting a pending comment with ${JSON.stringify(commentMod)} will not remove it from database of subplebbit because it has more than {approved: false}`,
                        async () => {
                            const queryRes = subplebbit._dbHandler.queryComment(commentToBeRejected.cid);
                            expect(queryRes).to.be.exist;
                        }
                    );
                if (shouldCommentBePurged) {
                    itSkipIfRpc(`Rejecting a pending comment with only ${JSON.stringify(commentMod)} will purge it out of DB`, async () => {
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

                itSkipIfRpc(
                    `A rejected comment with only ${JSON.stringify(commentMod)} will ${shouldCommentBeInPostsOrRepliesPages ? "" : "never"} show up in subplebbit.posts`,
                    async () => {
                        const preloadedSortName = "hot";
                        const { generated, capturedChunks } = await capturePostsGeneration(subplebbit, preloadedSortName, 1024 * 1024);

                        const foundInGeneratedPages = cidExistsInChunks(capturedChunks, commentToBeRejected.cid);
                        if (shouldCommentBeInPostsOrRepliesPages) {
                            expect(generated, "expected posts generation when rejected comment should be visible").to.exist;
                            expect(foundInGeneratedPages, "rejected comment should be present in generated posts").to.be.true;
                        } else {
                            expect(foundInGeneratedPages, "rejected comment should be excluded from generated posts").to.be.false;
                        }
                    }
                );

                if (pendingCommentDepth > 0)
                    itSkipIfRpc(
                        `A rejected reply will ${shouldCommentBePurged ? "not" : ""} show up in parentComment.replies`,
                        async () => {
                            const expectedResult = !shouldCommentBePurged;
                            const parentRow = subplebbit._dbHandler.queryComment(commentToBeRejected.parentCid);
                            expect(parentRow).to.exist;

                            const { generated, capturedChunks } = await captureRepliesGeneration({
                                subplebbit,
                                parentCid: parentRow.cid,
                                parentDepth: parentRow.depth,
                                preloadedSortName: "best",
                                preloadedPageSizeBytes: 1024 * 1024
                            });

                            const foundInReplies = cidExistsInChunks(capturedChunks, commentToBeRejected.cid);
                            expect(foundInReplies).to.equal(expectedResult);
                            if (expectedResult) expect(generated, "expected replies generation to contain the rejected comment").to.exist;
                        }
                    );
                if (pendingCommentDepth > 0)
                    itSkipIfRpc(`A rejected reply will ${shouldCommentBePurged ? "not" : ""} show up in flat pages of post`, async () => {
                        const shouldCommentBeInFlatPages = !shouldCommentBePurged;
                        const postRow = subplebbit._dbHandler.queryComment(commentToBeRejected.postCid);
                        expect(postRow).to.exist;

                        for (const sortName of ["newFlat", "oldFlat"]) {
                            const { generated, capturedChunks } = await captureRepliesGeneration({
                                subplebbit,
                                parentCid: postRow.cid,
                                parentDepth: postRow.depth,
                                preloadedSortName: sortName,
                                preloadedPageSizeBytes: 1024 * 1024
                            });

                            const foundInFlatPages = cidExistsInChunks(capturedChunks, commentToBeRejected.cid);
                            expect(foundInFlatPages).to.equal(shouldCommentBeInFlatPages);
                            if (shouldCommentBeInFlatPages)
                                expect(generated, "expected flat pages generation to include the rejected comment").to.exist;
                        }
                    });

                it(`comments with approved: false should not be in pageCids.pendingApproval`, async () => {
                    expect(subplebbit.modQueue.pageCids.pendingApproval).to.be.undefined;
                });
                if (pendingCommentDepth === 0)
                    itSkipIfRpc(
                        `Rejecting a pending post with ${JSON.stringify(commentMod)} will ${shouldCommentBePurged ? "not" : ""} keep it in subplebbit.postUpdates`,
                        async () => {
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
                        }
                    );

                remotePlebbitConfigs.forEach((remotePlebbitConfig) => {
                    const itSequentialIfRpc =
                        remotePlebbitConfig.testConfigCode === "remote-plebbit-rpc" ||
                        remotePlebbitConfig.testConfigCode === "local-kubo-rpc" ||
                        remotePlebbitConfig.testConfigCode === "remote-kubo-rpc"
                            ? it.sequential
                            : it;

                    if (shouldCommentBePurged) {
                        itSequentialIfRpc(
                            `Should not be able to update a rejected comment with ${JSON.stringify(commentMod)} and retrieve its CommentIpfs - Plebbit Config ${remotePlebbitConfig.name}`,
                            async () => {
                                const remotePlebbit = await remotePlebbitConfig.plebbitInstancePromise();
                                remotePlebbit._timeouts["comment-ipfs"] = 500; // speed up the test
                                try {
                                    const newComment = await remotePlebbit.createComment({
                                        cid: commentToBeRejected.cid,
                                        subplebbitAddress: commentToBeRejected.subplebbitAddress
                                    });

                                    const errors = [];
                                    const failIfUpdated = () =>
                                        newComment.raw.comment &&
                                        expect.fail("Rejected comment unexpectedly emitted an update event with CommentIpfs");
                                    newComment.on("update", failIfUpdated);
                                    newComment.on("error", (err) => errors.push(err));
                                    await newComment.update();

                                    await new Promise((resolve) => {
                                        let settled = false;
                                        let timeoutId;
                                        const onError = () => {
                                            if (settled) return;
                                            settled = true;
                                            clearTimeout(timeoutId);
                                            newComment.removeListener("error", onError);
                                            resolve();
                                        };
                                        timeoutId = setTimeout(() => {
                                            if (settled) return;
                                            settled = true;
                                            newComment.removeListener("error", onError);
                                            resolve();
                                        }, 10_000);
                                        newComment.on("error", onError);
                                    });

                                    newComment.removeListener("update", failIfUpdated);

                                    expect(newComment.raw.commentUpdate).to.be.undefined;
                                    expect(newComment.raw.comment).to.be.undefined;
                                    expect(newComment.signature).to.be.undefined;
                                    expect(newComment.updatedAt).to.be.undefined;
                                    errors.forEach((err) =>
                                        expect(err.code).to.be.oneOf([
                                            "ERR_FETCH_CID_P2P_TIMEOUT",
                                            "ERR_FAILED_TO_FETCH_COMMENT_IPFS_FROM_GATEWAYS"
                                        ])
                                    );
                                    await newComment.stop();
                                } finally {
                                    await remotePlebbit.destroy();
                                }
                            }
                        );

                        itSequentialIfRpc(
                            `Should not be able to update a rejected comment with ${JSON.stringify(commentMod)} and retrieve its CommentUpdate - Plebbit Config ${remotePlebbitConfig.name}`,
                            async () => {
                                const remotePlebbit = await remotePlebbitConfig.plebbitInstancePromise();
                                remotePlebbit._timeouts["comment-update-ipfs"] = 1000;
                                try {
                                    const newComment = await remotePlebbit.createComment(commentToBeRejected);
                                    expect(newComment.raw.comment).to.be.ok;

                                    const errors = [];
                                    const failIfUpdated = () =>
                                        newComment.raw.commentUpdate &&
                                        expect.fail("Rejected comment unexpectedly emitted an update event with CommentUpdate");
                                    newComment.on("update", failIfUpdated);
                                    newComment.on("error", (err) => errors.push(err));
                                    await newComment.update();

                                    await new Promise((resolve) => {
                                        let settled = false;
                                        let timeoutId;
                                        const onError = () => {
                                            if (settled) return;
                                            settled = true;
                                            clearTimeout(timeoutId);
                                            newComment.removeListener("error", onError);
                                            resolve();
                                        };
                                        timeoutId = setTimeout(() => {
                                            if (settled) return;
                                            settled = true;
                                            newComment.removeListener("error", onError);
                                            resolve();
                                        }, 10_000);
                                        newComment.on("error", onError);
                                    });

                                    newComment.removeListener("update", failIfUpdated);

                                    expect(newComment.raw.commentUpdate).to.be.undefined;
                                    expect(newComment.updatedAt).to.be.undefined;
                                    if (errors.length > 0)
                                        expect(errors[0].code).to.be.oneOf([
                                            "ERR_FAILED_TO_FETCH_COMMENT_UPDATE_FROM_ALL_POST_UPDATES_RANGES",
                                            "ERR_FAILED_TO_FIND_REPLY_COMMENT_UPDATE_WITHIN_PARENT_COMMENT_PAGE_CIDS",
                                            "ERR_SUBPLEBBIT_HAS_NO_POST_UPDATES"
                                        ]);
                                    await newComment.stop();
                                } finally {
                                    await remotePlebbit.destroy();
                                }
                            }
                        );
                    }

                    if (!shouldCommentBePurged) {
                        // test scenearios:
                        // have CommentIpfs but want to load commentUpdate
                        // have neither CommentUpdate or CommentIpfs

                        itSequentialIfRpc(
                            `Can update a rejected comment with ${JSON.stringify(commentMod)} and retrieve its update as long as we have its CommentIpfs - Plebbit Config ${remotePlebbitConfig.name}`,
                            async () => {
                                const remotePlebbit = await remotePlebbitConfig.plebbitInstancePromise();

                                try {
                                    const newComment = await remotePlebbit.createComment(commentToBeRejected);
                                    expect(newComment.raw.comment).to.be.ok;

                                    await newComment.update();
                                    await resolveWhenConditionIsTrue({ toUpdate: newComment, predicate: () => newComment.updatedAt });

                                    for (const commentModKey of Object.keys(commentMod)) {
                                        expect(newComment[commentModKey]).to.equal(commentMod[commentModKey]);
                                        expect(newComment.raw.commentUpdate[commentModKey]).to.equal(commentMod[commentModKey]);
                                    }

                                    expect(newComment.updatedAt).to.be.a("number");
                                    expect(newComment.upvoteCount).to.equal(0);
                                    expect(newComment.replyCount).to.equal(0);
                                    expect(newComment.childCount).to.equal(0);
                                    expect(newComment.removed).to.be.true;

                                    expect(newComment.raw.commentUpdate.updatedAt).to.be.a("number");
                                    expect(newComment.raw.commentUpdate.upvoteCount).to.equal(0);
                                    expect(newComment.raw.commentUpdate.replyCount).to.equal(0);
                                    expect(newComment.raw.commentUpdate.childCount).to.equal(0);
                                    expect(newComment.raw.commentUpdate.removed).to.be.true;

                                    await newComment.stop();
                                } finally {
                                    await remotePlebbit.destroy();
                                }
                            }
                        );

                        if (shouldCommentBeInPostsOrRepliesPages) {
                            itSequentialIfRpc(
                                `Can update a rejected comment with ${JSON.stringify(commentMod)} and retrieve both CommentIpfs and CommentUpdate - Plebbit Config ${remotePlebbitConfig.name}`,
                                async () => {
                                    const remotePlebbit = await remotePlebbitConfig.plebbitInstancePromise();
                                    remotePlebbit._timeouts["comment-ipfs"] = 500; // speed up the test
                                    try {
                                        const newComment = await remotePlebbit.createComment({
                                            cid: commentToBeRejected.cid,
                                            subplebbitAddress: commentToBeRejected.subplebbitAddress
                                        });

                                        await newComment.update();
                                        await resolveWhenConditionIsTrue({ toUpdate: newComment, predicate: () => newComment.updatedAt });

                                        for (const commentModKey of Object.keys(commentMod)) {
                                            expect(newComment[commentModKey]).to.equal(commentMod[commentModKey]);
                                            expect(newComment.raw.commentUpdate[commentModKey]).to.equal(commentMod[commentModKey]);
                                        }

                                        expect(newComment.updatedAt).to.be.a("number");
                                        expect(newComment.upvoteCount).to.equal(0);
                                        expect(newComment.replyCount).to.equal(0);
                                        expect(newComment.childCount).to.equal(0);
                                        expect(newComment.removed).to.be.true;

                                        expect(newComment.raw.commentUpdate.updatedAt).to.be.a("number");
                                        expect(newComment.raw.commentUpdate.upvoteCount).to.equal(0);
                                        expect(newComment.raw.commentUpdate.replyCount).to.equal(0);
                                        expect(newComment.raw.commentUpdate.childCount).to.equal(0);
                                        expect(newComment.raw.commentUpdate.removed).to.be.true;
                                        expect(newComment.pendingApproval).to.be.false;

                                        expect(newComment.raw.comment).to.be.ok;
                                        expect(newComment.signature).to.be.ok;

                                        await newComment.stop();
                                    } finally {
                                        await remotePlebbit.destroy();
                                    }
                                }
                            );
                        }

                        // if only {approved:false} then we're not getting an update
                        itSequentialIfRpc(
                            `A rejected comment will have pendingApproval=false after receiving an update with ${JSON.stringify(commentMod)} if it already had its CommentIpfs - Plebbit Config ${remotePlebbitConfig.name}`,
                            async () => {
                                const remotePlebbit = await remotePlebbitConfig.plebbitInstancePromise();
                                remotePlebbit._timeouts["comment-ipfs"] = 500; // it's gonna fail to load CID so this will make test run faster

                                try {
                                    const remoteCommentToBeRejected = await remotePlebbit.createComment({
                                        cid: commentToBeRejected.cid,
                                        raw: { comment: commentToBeRejected.raw.comment }
                                    });
                                    expect(remoteCommentToBeRejected.raw.comment).to.be.ok;
                                    await remoteCommentToBeRejected.update();
                                    await resolveWhenConditionIsTrue({
                                        toUpdate: remoteCommentToBeRejected,
                                        predicate: () => remoteCommentToBeRejected.pendingApproval === false
                                    });
                                    expect(remoteCommentToBeRejected.pendingApproval).to.be.false;
                                } finally {
                                    await remotePlebbit.destroy();
                                }
                            }
                        );

                        if (shouldCommentBeInPostsOrRepliesPages)
                            itSequentialIfRpc(
                                `A rejected comment will have pendingApproval=false after receiving an update with ${JSON.stringify(commentMod)} without CommentIpfs - Plebbit Config ${remotePlebbitConfig.name}`,
                                async () => {
                                    const remotePlebbit = await remotePlebbitConfig.plebbitInstancePromise();
                                    try {
                                        remotePlebbit._timeouts["comment-ipfs"] = 500; // it's gonna fail to load CID so this will make test run faster
                                        const remoteCommentToBeRejected = await remotePlebbit.createComment({
                                            cid: commentToBeRejected.cid,
                                            subplebbitAddress: commentToBeRejected.subplebbitAddress
                                        });
                                        await remoteCommentToBeRejected.update();
                                        await resolveWhenConditionIsTrue({
                                            toUpdate: remoteCommentToBeRejected,
                                            predicate: () => remoteCommentToBeRejected.pendingApproval === false
                                        });
                                        expect(remoteCommentToBeRejected.pendingApproval).to.be.false;
                                    } finally {
                                        await remotePlebbit.destroy();
                                    }
                                }
                            );
                    }
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

                itSkipIfRpc(`A rejected comment is not pinned to IPFS node`, async () => {
                    const kuboRpc = Object.values(plebbit.clients.kuboRpcClients)[0]._client;

                    // Collect all pinned CIDs
                    for await (const pin of kuboRpc.pin.ls()) {
                        expect(pin.cid.toString()).to.not.equal(commentToBeRejected.cid); // pending comment should not be pinned in kubo
                    }
                });

                it(`Should not be able to fetch rejected comment with only its CID since it's not provided anymore`, async () => {
                    const originalTimeout = JSON.parse(JSON.stringify(plebbit._timeouts["generic-ipfs"]));
                    plebbit._timeouts["generic-ipfs"] = 1000;
                    try {
                        await plebbit.fetchCid({ cid: commentToBeRejected.cid });
                        expect.fail("should fail");
                    } catch (e) {
                        expect(e.code).to.equal("ERR_FETCH_CID_P2P_TIMEOUT");
                    } finally {
                        plebbit._timeouts["generic-ipfs"] = originalTimeout;
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

                itSkipIfRpc.sequential(`A rejected comment is not pinned to IPFS node after restarting the sub`, async () => {
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

async function capturePostsGeneration(subplebbit, preloadedSortName, preloadedPageSizeBytes) {
    return captureSortChunks({
        subplebbit,
        matchParentCid: null,
        matchSortName: preloadedSortName,
        generate: () => subplebbit._pageGenerator.generateSubplebbitPosts(preloadedSortName, preloadedPageSizeBytes)
    });
}

async function captureRepliesGeneration({ subplebbit, parentCid, parentDepth, preloadedSortName, preloadedPageSizeBytes }) {
    const generator =
        parentDepth === 0
            ? () => subplebbit._pageGenerator.generatePostPages({ cid: parentCid }, preloadedSortName, preloadedPageSizeBytes)
            : () =>
                  subplebbit._pageGenerator.generateReplyPages(
                      { cid: parentCid, depth: parentDepth },
                      preloadedSortName,
                      preloadedPageSizeBytes
                  );

    return captureSortChunks({
        subplebbit,
        matchParentCid: parentCid,
        matchSortName: preloadedSortName,
        generate: generator
    });
}

async function captureSortChunks({ subplebbit, matchParentCid, matchSortName, generate }) {
    const capturedChunks = [];
    const originalSortAndChunk = subplebbit._pageGenerator.sortAndChunkComments.bind(subplebbit._pageGenerator);
    const sortSpy = vi.spyOn(subplebbit._pageGenerator, "sortAndChunkComments").mockImplementation(async (...args) => {
        const result = await originalSortAndChunk(...args);
        const [, sortName, options] = args;
        if (sortName === matchSortName && (options?.parentCid ?? null) === (matchParentCid ?? null)) {
            capturedChunks.push(...result);
        }
        return result;
    });

    try {
        const generated = await generate();
        return { generated, capturedChunks };
    } finally {
        sortSpy.mockRestore();
    }
}

function cidExistsInChunks(chunks, targetCid) {
    for (const chunk of chunks) {
        for (const comment of chunk) {
            if (commentContainsCid(comment, targetCid)) return true;
        }
    }
    return false;
}

function commentContainsCid(comment, targetCid) {
    if (extractCidFromChunkItem(comment) === targetCid) return true;
    const replies = comment?.commentUpdate?.replies ?? comment?.replies;
    const bestReplies = replies?.pages?.best?.comments;
    if (Array.isArray(bestReplies)) {
        for (const reply of bestReplies) {
            if (commentContainsCid(reply, targetCid)) return true;
        }
    }
    return false;
}

function extractCidFromChunkItem(comment) {
    return comment?.commentUpdate?.cid ?? comment?.cid ?? comment?.comment?.cid;
}
