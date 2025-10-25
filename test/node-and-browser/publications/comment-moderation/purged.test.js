import { expect } from "chai";
import signers from "../../../fixtures/signers.js";
import {
    publishRandomReply,
    generateMockComment,
    publishCommentWithDepth,
    generateMockVote,
    publishWithExpectedResult,
    resolveWhenConditionIsTrue,
    getAvailablePlebbitConfigsToTestAgainst,
    waitTillReplyInParentPages,
    mockPlebbitNoDataPathWithOnlyKuboClient,
    mockPlebbitNoDataPathWithOnlyKuboClientNoAdd,
    describeSkipIfRpc,
    mockGatewayPlebbit
} from "../../../../dist/node/test/test-util.js";
import { messages } from "../../../../dist/node/errors.js";
import { CID } from "kubo-rpc-client";

import * as remeda from "remeda";
import { findCommentInPageInstanceRecursively } from "../../../../dist/node/pages/util.js";
import { of as calculateIpfsHash } from "typestub-ipfs-only-hash";

const subplebbitAddress = signers[6].address;
const roles = [
    { role: "owner", signer: signers[1] },
    { role: "admin", signer: signers[2] },
    { role: "mod", signer: signers[3] }
];

// I suspect libp2p config is not emitting error

getAvailablePlebbitConfigsToTestAgainst().map((config) => {
    [0, 1, 2, 3].map((commentDepth) => {
        describeSkipIfRpc(`Purging comment with depth ${commentDepth} - ${config.name}`, async () => {
            let plebbit, commentToPurge, replyOfCommentToPurge, replyUnderReplyOfCommentToPurge;
            let replyCountOfParentOfPurgedComment; // undefined if commentDepth is 0
            let remotePlebbitIpfs;
            let updateCidOfSubplebbitWithPurgedComment;
            before(async () => {
                plebbit = await config.plebbitInstancePromise();
                remotePlebbitIpfs = await mockPlebbitNoDataPathWithOnlyKuboClientNoAdd(); // this instance is connected to the same IPFS node as the sub
                const subplebbit = await plebbit.getSubplebbit(subplebbitAddress);
                const commentToPurgeTemp = await publishCommentWithDepth({ depth: commentDepth, subplebbit }); // reason why we publish in a different plebbit instance so it doesn't get added to local kubo node
                commentToPurge = await plebbit.createComment({ cid: commentToPurgeTemp.cid });
                await commentToPurge.update();
                await resolveWhenConditionIsTrue({
                    toUpdate: commentToPurge,
                    predicate: () => typeof commentToPurge.updatedAt === "number"
                });

                replyOfCommentToPurge = await publishRandomReply(commentToPurge, plebbit);
                await replyOfCommentToPurge.update();

                replyUnderReplyOfCommentToPurge = await publishRandomReply(replyOfCommentToPurge, plebbit);
                await replyUnderReplyOfCommentToPurge.update();
                await waitTillReplyInParentPages(replyUnderReplyOfCommentToPurge, plebbit);

                await Promise.all(
                    [commentToPurge, replyOfCommentToPurge, replyUnderReplyOfCommentToPurge].map((comment) =>
                        resolveWhenConditionIsTrue({ toUpdate: comment, predicate: () => typeof comment.updatedAt === "number" })
                    )
                );

                if (commentDepth > 0) {
                    const parentOfPurgedComment = await plebbit.createComment({ cid: commentToPurge.parentCid });
                    await parentOfPurgedComment.update();
                    await resolveWhenConditionIsTrue({
                        toUpdate: parentOfPurgedComment,
                        predicate: () => typeof parentOfPurgedComment.updatedAt === "number"
                    });
                    await parentOfPurgedComment.stop();

                    replyCountOfParentOfPurgedComment = parentOfPurgedComment.replyCount;
                    expect(replyCountOfParentOfPurgedComment).to.be.at.least(3); // direct purged comment + 2 replies
                }

                // make sure both postToPurge and postReply exists on the IPFS node

                for (const cid of [commentToPurge.cid, replyOfCommentToPurge.cid, replyUnderReplyOfCommentToPurge.cid]) {
                    const res =
                        await remotePlebbitIpfs.clients.kuboRpcClients[
                            Object.keys(remotePlebbitIpfs.clients.kuboRpcClients)[0]
                        ]._client.block.stat(cid);
                    expect(res.size).to.be.a("number");
                }

                // make sure comment to be purged is in pages of subplebbit
                const sub = await plebbit.getSubplebbit(subplebbitAddress);
                const purgedCommentInPage = findCommentInPageInstanceRecursively(sub.posts, commentToPurge.cid);
                expect(purgedCommentInPage).to.exist;
                updateCidOfSubplebbitWithPurgedComment = sub.updateCid;
            });
            after(async () => {
                await plebbit.destroy();
                await remotePlebbitIpfs.destroy();
            });

            it(`Regular author can not purge a comment with depth ${commentDepth}`, async () => {
                const purgeEdit = await plebbit.createCommentModeration({
                    subplebbitAddress: commentToPurge.subplebbitAddress,
                    commentCid: commentToPurge.cid,
                    commentModeration: { reason: "To purge a post", purged: true },
                    signer: await plebbit.createSigner() // random author
                });
                await publishWithExpectedResult(purgeEdit, false, messages.ERR_COMMENT_MODERATION_ATTEMPTED_WITHOUT_BEING_MODERATOR);
            });

            it(`Mod can mark an author comment with depth ${commentDepth} as purged`, async () => {
                const purgeEdit = await plebbit.createCommentModeration({
                    subplebbitAddress: commentToPurge.subplebbitAddress,
                    commentCid: commentToPurge.cid,
                    commentModeration: { reason: "To purge a post", purged: true },
                    signer: roles[2].signer // Mod role
                });
                await publishWithExpectedResult(purgeEdit, true);
            });

            if (commentDepth > 0) {
                it("the parent of purged comment replyCount should be reduced by 3", async () => {
                    const parentOfPurgedComment = await plebbit.createComment({ cid: commentToPurge.parentCid });
                    await parentOfPurgedComment.update();
                    await resolveWhenConditionIsTrue({
                        toUpdate: parentOfPurgedComment,
                        predicate: () => typeof parentOfPurgedComment.updatedAt === "number"
                    });
                    await parentOfPurgedComment.stop();

                    expect(parentOfPurgedComment.replyCount).to.be.at.least(replyCountOfParentOfPurgedComment - 3);
                });

                it("the purged comment should not appear in the parent's replies", async () => {
                    console.log("Parent of purged comment", commentToPurge.parentCid, "comment to purge cid", commentToPurge.cid);
                    const parentOfPurgedComment = await plebbit.createComment({ cid: commentToPurge.parentCid });
                    const intervalId = setInterval(async () => {
                        const remotePlebbitGateway = await mockGatewayPlebbit();
                        const parentOfPurgedCommentGateway = await remotePlebbitGateway.createComment({
                            cid: commentToPurge.parentCid
                        });
                        await parentOfPurgedCommentGateway.update();
                        await resolveWhenConditionIsTrue({
                            toUpdate: parentOfPurgedCommentGateway,
                            predicate: () => typeof parentOfPurgedCommentGateway.updatedAt === "number"
                        });
                        const purgedCommentInParentGateway = findCommentInPageInstanceRecursively(
                            parentOfPurgedCommentGateway.replies,
                            commentToPurge.cid
                        );
                        console.log(
                            "parent of purged comment with plebbit gateway",
                            parentOfPurgedCommentGateway.cid,
                            "does it have purgedComment?",
                            !!purgedCommentInParentGateway
                        );
                        await remotePlebbitGateway.destroy();
                    }, 20000);

                    await parentOfPurgedComment.update();
                    await resolveWhenConditionIsTrue({
                        toUpdate: parentOfPurgedComment,
                        predicate: () => typeof parentOfPurgedComment.updatedAt === "number"
                    });
                    console.log("Loaded comment update");
                    await resolveWhenConditionIsTrue({
                        toUpdate: parentOfPurgedComment,
                        predicate: () => {
                            const purgedCommentInParent = findCommentInPageInstanceRecursively(
                                parentOfPurgedComment.replies,
                                commentToPurge.cid
                            );
                            return purgedCommentInParent === undefined;
                        }
                    });
                    await parentOfPurgedComment.stop();
                    const purgedCommentInParent = findCommentInPageInstanceRecursively(parentOfPurgedComment.replies, commentToPurge.cid);
                    expect(purgedCommentInParent).to.be.undefined;
                    clearInterval(intervalId);
                });
            }

            it(`Sub rejects votes on purged comment with depth ${commentDepth}`, async () => {
                const vote = await generateMockVote(commentToPurge, 1, plebbit, remeda.sample(signers, 1)[0]);
                await publishWithExpectedResult(vote, false, messages.ERR_PUBLICATION_PARENT_DOES_NOT_EXIST_IN_SUB);
            });

            it(`Sub rejects replies under purged comment with depth ${commentDepth}`, async () => {
                const reply = await generateMockComment(commentToPurge, plebbit, false);
                await publishWithExpectedResult(reply, false, messages.ERR_PUBLICATION_PARENT_DOES_NOT_EXIST_IN_SUB);
            });

            it(`Sub rejects votes on a reply of a purged comment with depth ${commentDepth}`, async () => {
                const vote = await generateMockVote(replyOfCommentToPurge, 1, plebbit);
                await publishWithExpectedResult(vote, false, messages.ERR_PUBLICATION_PARENT_DOES_NOT_EXIST_IN_SUB);
            });

            it(`Sub rejects replies on a reply of a purged comment with depth ${commentDepth}`, async () => {
                const reply = await generateMockComment(replyOfCommentToPurge, plebbit, false);
                await publishWithExpectedResult(reply, false, messages.ERR_PUBLICATION_PARENT_DOES_NOT_EXIST_IN_SUB);
            });

            it(`Author of comment with depth ${commentDepth} can't purge their own comment`, async () => {
                const subplebbit = await plebbit.getSubplebbit(subplebbitAddress);
                const commentToAttemptToPurge = await publishCommentWithDepth({ depth: commentDepth, subplebbit });
                const purgeCommentModeration = await plebbit.createCommentModeration({
                    subplebbitAddress: commentToAttemptToPurge.subplebbitAddress,
                    commentCid: commentToAttemptToPurge.cid,
                    commentModeration: { reason: "To purge a post" + Date.now(), purged: true },
                    signer: commentToAttemptToPurge.signer
                });
                await publishWithExpectedResult(
                    purgeCommentModeration,
                    false,
                    messages.ERR_COMMENT_MODERATION_ATTEMPTED_WITHOUT_BEING_MODERATOR
                );
            });

            it(`Mod can't un-purge a comment with depth ${commentDepth}`, async () => {
                const unPurgeMod = await plebbit.createCommentModeration({
                    subplebbitAddress: commentToPurge.subplebbitAddress,
                    commentCid: commentToPurge.cid,
                    commentModeration: { reason: "To unpurge a post", purged: false },
                    signer: roles[2].signer
                });
                await publishWithExpectedResult(unPurgeMod, false, messages.ERR_PUBLICATION_PARENT_DOES_NOT_EXIST_IN_SUB);
            });

            it(`Purged comment with depth ${commentDepth} don't show in subplebbit.posts`, async () => {
                const plebbit = await config.plebbitInstancePromise();
                const sub = await plebbit.createSubplebbit({ address: commentToPurge.subplebbitAddress });

                await sub.update();

                await resolveWhenConditionIsTrue({ toUpdate: sub, predicate: () => typeof sub.updatedAt === "number" });

                const intervalId = setInterval(async () => {
                    const subplebbitLocalNode = await remotePlebbitIpfs.getSubplebbit(subplebbitAddress);
                    const purgedPostInLocalNode = findCommentInPageInstanceRecursively(subplebbitLocalNode.posts, commentToPurge.cid);

                    console.log(
                        "subplebbitLocalNode",
                        subplebbitLocalNode.updatedAt,
                        "does it have purged post in page?",
                        !!purgedPostInLocalNode
                    );

                    const ipnsRecordFromGateway = await fetch(`http://localhost:18080/ipns/${commentToPurge.subplebbitAddress}`, {
                        cache: "no-cache",
                        headers: {
                            "Cache-Control": "no-cache, no-store, must-revalidate",
                            Pragma: "no-cache",
                            Expires: "0"
                        }
                    }).then((res) => res.json());
                    const subFromGateway = await plebbit.createSubplebbit(ipnsRecordFromGateway);
                    const purgedPostInIpns = findCommentInPageInstanceRecursively(subFromGateway.posts, commentToPurge.cid);

                    console.log("subFromGateway", subFromGateway.updatedAt, "does it have purged post in page?", !!purgedPostInIpns);
                }, 20000);

                expect(sub.posts.pageCids).to.deep.equal({}); // let's assume sub has no page cids

                await resolveWhenConditionIsTrue({
                    toUpdate: sub,
                    predicate: () => {
                        const purgedPostInPage = findCommentInPageInstanceRecursively(sub.posts, commentToPurge.cid);
                        return purgedPostInPage === undefined; // if we can't find it then it's purged
                    }
                });

                clearInterval(intervalId);

                const purgedCommentInRemoteSubplebbitPage = findCommentInPageInstanceRecursively(sub.posts, commentToPurge.cid);
                expect(purgedCommentInRemoteSubplebbitPage).to.be.undefined;

                await sub.stop();

                await plebbit.destroy();
            });

            if (commentDepth === 0)
                it(`Purged post should not appear in subplebbit.postUpdates`, async () => {
                    const subplebbit = await plebbit.getSubplebbit(subplebbitAddress);
                    if (!subplebbit.postUpdates) return; // sub has no post updates, good!
                    const postUpdatesTimes = Object.keys(subplebbit.postUpdates);
                    expect(postUpdatesTimes.length).to.equal(1);
                    const mfsPath = `/${commentToPurge.subplebbitAddress}/postUpdates/${postUpdatesTimes[0]}/${commentToPurge.postCid}/update`;
                    try {
                        await remotePlebbitIpfs.clients.kuboRpcClients[
                            Object.keys(remotePlebbitIpfs.clients.kuboRpcClients)[0]
                        ]._client.files.stat(mfsPath);
                        expect.fail("Should have thrown an error");
                    } catch (e) {
                        expect(e.message).to.equal("file does not exist");
                    }
                });
            it(`purged comment should not appear in subplebbit.lastPostCid`, async () => {
                const subplebbit = await plebbit.createSubplebbit({ address: subplebbitAddress });
                await subplebbit.update();
                const intervalId = setInterval(() => {
                    if (subplebbit.state === "updating")
                        console.log(
                            "lastPostCid of subplebbit",
                            subplebbit.address,
                            "is",
                            subplebbit.lastPostCid,
                            "and updateCid is",
                            subplebbit.updateCid
                        );
                }, 20000);
                await resolveWhenConditionIsTrue({ toUpdate: subplebbit, predicate: () => subplebbit.lastPostCid !== commentToPurge.cid });
                expect(subplebbit.lastPostCid).to.not.equal(commentToPurge.cid);
                await subplebbit.stop();
                clearInterval(intervalId);
            });

            it(`purged comment should not appear in subplebbit.lastCommentCid`, async () => {
                const subplebbit = await plebbit.getSubplebbit(subplebbitAddress);
                expect(subplebbit.lastCommentCid).to.not.equal(commentToPurge.cid);
            });

            it(`The whole reply tree including comment, replies and their pages should not be stored in the ipfs node of the subplebbit`, async () => {
                await new Promise((resolve) => setTimeout(resolve, 3000));
                const cidEntries = [
                    { label: "updateCidOfSubplebbitWithPurgedComment", cid: updateCidOfSubplebbitWithPurgedComment },
                    { label: "commentToPurge.cid", cid: commentToPurge.cid },
                    { label: "replyOfCommentToPurge.cid", cid: replyOfCommentToPurge.cid },
                    { label: "replyUnderReplyOfCommentToPurge.cid", cid: replyUnderReplyOfCommentToPurge.cid },
                    {
                        label: "commentToPurge.raw.commentUpdate",
                        cid: await calculateIpfsHash(JSON.stringify(commentToPurge.raw.commentUpdate))
                    },
                    {
                        label: "replyOfCommentToPurge.raw.commentUpdate",
                        cid: await calculateIpfsHash(JSON.stringify(replyOfCommentToPurge.raw.commentUpdate))
                    },
                    {
                        label: "replyUnderReplyOfCommentToPurge.raw.commentUpdate",
                        cid: await calculateIpfsHash(JSON.stringify(replyUnderReplyOfCommentToPurge.raw.commentUpdate))
                    },
                    ...Object.entries(commentToPurge.replies.pageCids).map(([key, cid]) => ({
                        label: `commentToPurge.replies.pageCids.${key}`,
                        cid
                    })),
                    ...Object.entries(replyOfCommentToPurge.replies.pageCids).map(([key, cid]) => ({
                        label: `replyOfCommentToPurge.replies.pageCids.${key}`,
                        cid
                    }))
                ];

                const labeledCids = remeda.uniqueBy(cidEntries, (entry) => entry.cid);
                const labeledCidsV1 = labeledCids.map((entry) => ({
                    label: `${entry.label} (v1)`,
                    cid: CID.parse(entry.cid).toV1().toString()
                }));
                const allLabeledCids = [...labeledCids, ...labeledCidsV1];
                const cidLabelMap = new Map(allLabeledCids.map((entry) => [entry.cid, entry.label]));
                const ipfsClientOfSub =
                    remotePlebbitIpfs.clients.kuboRpcClients[Object.keys(remotePlebbitIpfs.clients.kuboRpcClients)[0]]._client;
                // Collect all pinned CIDs
                for await (const pin of ipfsClientOfSub.pin.ls()) {
                    const pinCid = pin.cid.toString();
                    const label = cidLabelMap.get(pinCid) ?? "unknown source";
                    expect(cidLabelMap.has(pinCid), `IPFS node should not pin ${pinCid} (${label})`).to.be.false;
                }
            });

            it(`Should not be able to load a comment update of a purged post or its reply tree`, async () => {
                const differentPlebbit = await mockPlebbitNoDataPathWithOnlyKuboClient();
                differentPlebbit._timeouts["comment-ipfs"] = 2000;
                differentPlebbit._timeouts["comment-update-ipfs"] = 2000;

                const commentsWithDifferentPlebbit = await Promise.all(
                    [commentToPurge, replyOfCommentToPurge, replyUnderReplyOfCommentToPurge].map((comment) =>
                        differentPlebbit.createComment({ cid: comment.cid })
                    )
                );

                for (const purgedComment of commentsWithDifferentPlebbit) {
                    expect(purgedComment.raw.comment).to.be.undefined;
                    expect(purgedComment.raw.commentUpdate).to.be.undefined;
                    expect(purgedComment.depth).to.be.undefined; // comment depth is not defined
                    expect(purgedComment.updatedAt).to.be.undefined; // comment update is not defined
                }
                await Promise.all(
                    commentsWithDifferentPlebbit.map(async (purgedComment) => {
                        const waitingRetryErrs = [];
                        purgedComment.on("error", (err) => waitingRetryErrs.push(err));

                        // Create a promise that rejects if update event is emitted
                        const updateEventPromise = new Promise((_, reject) => {
                            purgedComment.on("update", () => {
                                // we're fine with purgedComment.raw.comment because the publishing author may have added it to their node
                                // but it shouldn't get commentUpdate
                                if (purgedComment.raw.commentUpdate) {
                                    const message = `Purged comment should not emit update event with ${purgedComment.raw.commentUpdate ? "CommentUpdate props" : "CommentIpfs props"}`;
                                    reject(message);
                                }
                            });
                        });

                        // Create a promise that resolves when we get the expected errors
                        const errorConditionPromise = resolveWhenConditionIsTrue({
                            toUpdate: purgedComment,
                            predicate: () => waitingRetryErrs.length === 2,
                            eventName: "error"
                        });

                        // Fail fast if neither updates nor errors show up in time, but allow assertions to run afterward
                        const timeoutPromise = new Promise((resolve) => {
                            const timeoutId = setTimeout(() => resolve("timeout"), 10_000);
                            const clearTimer = () => clearTimeout(timeoutId);
                            errorConditionPromise.finally(clearTimer);
                            updateEventPromise.finally(clearTimer);
                        });

                        await purgedComment.update();

                        // Race between getting the expected errors, an unexpected update event, or a benign timeout
                        // on libp2pjs seems like we're not getting error events, so we need to have
                        await Promise.race([errorConditionPromise, updateEventPromise, timeoutPromise]);

                        // we've attempted to load twice but it's not defined yet
                        // plebbit-js keeps on retrying to load the comment update, but it's not loading because ipfs node removed it from MFS
                        // expect(waitingRetryErrs.length).to.be.greaterThan(0);
                        expect(purgedComment.updatedAt).to.be.undefined; // should not load comment update
                        // expect(purgedComment.depth).to.be.undefined; // should not load comment ipfs
                        // expect(purgedComment.raw.comment).to.be.undefined;
                        expect(purgedComment.raw.commentUpdate).to.be.undefined;

                        await purgedComment.stop();
                    })
                );
                await differentPlebbit.destroy();
            });
        });
    });
});
