import { expect } from "chai";
import signers from "../../../fixtures/signers.js";
import {
    publishRandomReply,
    generateMockComment,
    publishCommentWithDepth,
    generateMockVote,
    publishWithExpectedResult,
    resolveWhenConditionIsTrue,
    getRemotePlebbitConfigs,
    waitTillReplyInParentPages,
    mockPlebbitNoDataPathWithOnlyKuboClient,
    describeSkipIfRpc
} from "../../../../dist/node/test/test-util.js";
import { messages } from "../../../../dist/node/errors.js";
import { CID } from "kubo-rpc-client";

import * as remeda from "remeda";
import { findCommentInPageInstanceRecursively } from "../../../../dist/node/pages/util.js";

const subplebbitAddress = signers[6].address;
const roles = [
    { role: "owner", signer: signers[1] },
    { role: "admin", signer: signers[2] },
    { role: "mod", signer: signers[3] }
];

// I think the bug is in purging that's causing MFS timeout
// could it because we try to files.rm, where the file block itself is not there?

getRemotePlebbitConfigs().map((config) => {
    [0, 1, 2, 3].map((commentDepth) => {
        describeSkipIfRpc(`Purging comment with depth ${commentDepth} - ${config.name}`, async () => {
            let plebbit, commentToPurge, replyOfCommentToPurge, replyUnderReplyOfCommentToPurge;
            let remotePlebbitIpfs;
            before(async () => {
                plebbit = await config.plebbitInstancePromise();
                remotePlebbitIpfs = await mockPlebbitNoDataPathWithOnlyKuboClient(); // this instance is connected to the same IPFS node as the sub
                const subplebbit = await plebbit.getSubplebbit(subplebbitAddress);
                commentToPurge = await publishCommentWithDepth({ depth: commentDepth, subplebbit });
                await commentToPurge.update();
                await resolveWhenConditionIsTrue(commentToPurge, () => typeof commentToPurge.updatedAt === "number");

                replyOfCommentToPurge = await publishRandomReply(commentToPurge, plebbit);
                await replyOfCommentToPurge.update();

                replyUnderReplyOfCommentToPurge = await publishRandomReply(replyOfCommentToPurge, plebbit);
                await replyUnderReplyOfCommentToPurge.update();
                await waitTillReplyInParentPages(replyUnderReplyOfCommentToPurge, plebbit);

                await Promise.all(
                    [commentToPurge, replyOfCommentToPurge, replyUnderReplyOfCommentToPurge].map((comment) =>
                        resolveWhenConditionIsTrue(comment, () => typeof comment.updatedAt === "number")
                    )
                );

                // make sure both postToPurge and postReply exists on the IPFS node

                for (const cid of [commentToPurge.cid, replyOfCommentToPurge.cid, replyUnderReplyOfCommentToPurge.cid]) {
                    const res =
                        await remotePlebbitIpfs.clients.kuboRpcClients[
                            Object.keys(remotePlebbitIpfs.clients.kuboRpcClients)[0]
                        ]._client.block.stat(cid);
                    expect(res.size).to.be.a("number");
                }
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

            it(`The whole reply tree including comment, replies and their pages should not be stored in the ipfs node of the subplebbit`, async () => {
                await new Promise((resolve) => setTimeout(resolve, 5000));
                const cids = remeda.unique([
                    commentToPurge.cid,
                    replyOfCommentToPurge.cid,
                    replyUnderReplyOfCommentToPurge.cid,
                    ...Object.values(commentToPurge.replies.pageCids),
                    ...Object.values(replyOfCommentToPurge.replies.pageCids)
                ]);
                const cidsV1 = cids.map((cid) => CID.parse(cid).toV1().toString());

                const allCids = [...cids, ...cidsV1];
                const ipfsClientOfSub =
                    remotePlebbitIpfs.clients.kuboRpcClients[Object.keys(remotePlebbitIpfs.clients.kuboRpcClients)[0]]._client;
                // Collect all pinned CIDs
                for await (const pin of ipfsClientOfSub.pin.ls()) {
                    expect(!allCids.includes(pin.cid.toString())).to.be.true;
                }
            });

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

                await resolveWhenConditionIsTrue(sub, () => typeof sub.updatedAt === "number");

                expect(sub.posts.pageCids).to.deep.equal({}); // let's assume sub has no page cids

                await resolveWhenConditionIsTrue(sub, async () => {
                    const purgedPostInPage = await findCommentInPageInstanceRecursively(sub.posts, commentToPurge.cid);
                    return purgedPostInPage === undefined; // if we can't find it then it's purged
                });

                await sub.stop();

                await plebbit.destroy();
            });

            it(`Purged post should not appear in subplebbit.postUpdates`);

            it(`Should not be able to load a comment update of a purged post or its reply tree`, async () => {
                const differentPlebbit = await mockPlebbitNoDataPathWithOnlyKuboClient();
                differentPlebbit._timeouts["comment-ipfs"] = 2000;
                differentPlebbit._timeouts["comment-update-ipfs"] = 2000;

                const commentsWithDifferentPlebbit = await Promise.all(
                    [commentToPurge, replyOfCommentToPurge, replyUnderReplyOfCommentToPurge].map((comment) =>
                        differentPlebbit.createComment({ cid: comment.cid })
                    )
                );
                await Promise.all(
                    commentsWithDifferentPlebbit.map(async (purgedComment) => {
                        const waitingRetryErrs = [];
                        purgedComment.on("error", (err) => waitingRetryErrs.push(err));

                        // Create a promise that rejects if update event is emitted
                        const updateEventPromise = new Promise((_, reject) => {
                            purgedComment.on("update", () => {
                                reject(new Error("Purged comment should not emit update event"));
                            });
                        });

                        // Create a promise that resolves when we get the expected errors
                        const errorConditionPromise = resolveWhenConditionIsTrue(
                            purgedComment,
                            () => waitingRetryErrs.length === 2,
                            "error"
                        );

                        await purgedComment.update();

                        // Race between getting the expected errors or getting an unexpected update event
                        await Promise.race([errorConditionPromise, updateEventPromise]);

                        // we've attempted to load twice but it's not defined yet
                        // plebbit-js keeps on retrying to load the comment update, but it's not loading because ipfs node removed it from MFS
                        expect(waitingRetryErrs.length).to.be.greaterThan(0);
                        expect(purgedComment.updatedAt).to.be.undefined; // should not load comment update
                        expect(purgedComment.depth).to.be.undefined; // should not load comment ipfs

                        await purgedComment.stop();
                    })
                );
                await differentPlebbit.destroy();
            });
        });
    });
});
