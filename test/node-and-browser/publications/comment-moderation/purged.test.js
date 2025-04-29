import { expect } from "chai";
import signers from "../../../fixtures/signers.js";
import {
    publishRandomPost,
    publishRandomReply,
    generateMockComment,
    generateMockVote,
    iterateThroughPagesToFindCommentInParentPagesInstance,
    publishWithExpectedResult,
    resolveWhenConditionIsTrue,
    getRemotePlebbitConfigs,
    waitTillReplyInParentPages,
    mockPlebbitNoDataPathWithOnlyKuboClient,
    describeSkipIfRpc,
    iterateThroughPageCidToFindComment
} from "../../../../dist/node/test/test-util.js";
import { messages } from "../../../../dist/node/errors.js";
import { CID } from "kubo-rpc-client";

import * as remeda from "remeda";

const subplebbitAddress = signers[0].address;
const roles = [
    { role: "owner", signer: signers[1] },
    { role: "admin", signer: signers[2] },
    { role: "mod", signer: signers[3] }
];

getRemotePlebbitConfigs().map((config) => {
    describeSkipIfRpc(`Purging post - ${config.name}`, async () => {
        let plebbit, postToPurge, postReply, replyUnderReply;
        let remotePlebbitIpfs;
        before(async () => {
            plebbit = await config.plebbitInstancePromise();
            remotePlebbitIpfs = await mockPlebbitNoDataPathWithOnlyKuboClient(); // this instance is connected to the same IPFS node as the sub
            postToPurge = await publishRandomPost(subplebbitAddress, plebbit, { content: "post to be purged" + Date.now() });
            await postToPurge.update();
            postReply = await publishRandomReply(postToPurge, plebbit);
            await postReply.update();

            replyUnderReply = await publishRandomReply(postReply, plebbit);
            await replyUnderReply.update();
            await waitTillReplyInParentPages(replyUnderReply, plebbit);

            await Promise.all(
                [postToPurge, postReply, replyUnderReply].map((comment) =>
                    resolveWhenConditionIsTrue(comment, () => typeof comment.updatedAt === "number")
                )
            );

            // make sure both postToPurge and postReply exists on the IPFS node

            for (const cid of [postToPurge.cid, postReply.cid, replyUnderReply.cid]) {
                const res =
                    await remotePlebbitIpfs.clients.kuboRpcClients[
                        Object.keys(remotePlebbitIpfs.clients.kuboRpcClients)[0]
                    ]._client.block.stat(cid);
                expect(res.size).to.be.a("number");
            }
        });
        after(async () => {
            await postToPurge.stop();
            await postReply.stop();
            await replyUnderReply.stop();
            await plebbit.destroy();
        });

        it(`Regular author can not purge a comment`, async () => {
            const purgeEdit = await plebbit.createCommentModeration({
                subplebbitAddress: postToPurge.subplebbitAddress,
                commentCid: postToPurge.cid,
                commentModeration: { reason: "To purge a post", purged: true },
                signer: await plebbit.createSigner() // random author
            });
            await publishWithExpectedResult(purgeEdit, false, messages.ERR_COMMENT_MODERATION_ATTEMPTED_WITHOUT_BEING_MODERATOR);
        });

        it(`Mod can mark an author post as purged`, async () => {
            const purgeEdit = await plebbit.createCommentModeration({
                subplebbitAddress: postToPurge.subplebbitAddress,
                commentCid: postToPurge.cid,
                commentModeration: { reason: "To purge a post", purged: true },
                signer: roles[2].signer // Mod role
            });
            await publishWithExpectedResult(purgeEdit, true);
        });

        it(`The whole reply tree including post, replies and their pages should not be stored in the ipfs node of the subplebbit`, async () => {
            const cids = remeda.unique([
                postToPurge.cid,
                postReply.cid,
                replyUnderReply.cid,
                ...Object.values(postToPurge.replies.pageCids),
                ...Object.values(postReply.replies.pageCids)
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

        it(`Sub rejects votes on purged post`, async () => {
            const vote = await generateMockVote(postToPurge, 1, plebbit, remeda.sample(signers, 1)[0]);
            await publishWithExpectedResult(vote, false, messages.ERR_PUBLICATION_PARENT_DOES_NOT_EXIST_IN_SUB);
        });

        it(`Sub rejects replies under purged post`, async () => {
            const reply = await generateMockComment(postToPurge, plebbit, false);
            await publishWithExpectedResult(reply, false, messages.ERR_PUBLICATION_PARENT_DOES_NOT_EXIST_IN_SUB);
        });

        it(`Sub rejects votes on a reply of a purged post`, async () => {
            const vote = await generateMockVote(postReply, 1, plebbit);
            await publishWithExpectedResult(vote, false, messages.ERR_PUBLICATION_PARENT_DOES_NOT_EXIST_IN_SUB);
        });

        it(`Sub rejects replies on a reply of a purged post`, async () => {
            const reply = await generateMockComment(postReply, plebbit, false);
            await publishWithExpectedResult(reply, false, messages.ERR_PUBLICATION_PARENT_DOES_NOT_EXIST_IN_SUB);
        });

        it(`Author of post can't purge their own comment`, async () => {
            const postToBePurged = await publishRandomPost(subplebbitAddress, plebbit, {}, false);
            const purgeCommentModeration = await plebbit.createCommentModeration({
                subplebbitAddress: postToBePurged.subplebbitAddress,
                commentCid: postToBePurged.cid,
                commentModeration: { reason: "To purge a post" + Date.now(), purged: true },
                signer: postToBePurged.signer
            });
            await publishWithExpectedResult(
                purgeCommentModeration,
                false,
                messages.ERR_COMMENT_MODERATION_ATTEMPTED_WITHOUT_BEING_MODERATOR
            );
        });

        it(`Mod can't un-purge a comment`, async () => {
            const unPurgeMod = await plebbit.createCommentModeration({
                subplebbitAddress: postToPurge.subplebbitAddress,
                commentCid: postToPurge.cid,
                commentModeration: { reason: "To unpurge a post", purged: false },
                signer: roles[2].signer
            });
            await publishWithExpectedResult(unPurgeMod, false, messages.ERR_PUBLICATION_PARENT_DOES_NOT_EXIST_IN_SUB);
        });

        it(`Purged post don't show in subplebbit.posts`, async () => {
            const plebbit = await config.plebbitInstancePromise();
            const sub = await plebbit.createSubplebbit({ address: postToPurge.subplebbitAddress });

            await sub.update();

            await resolveWhenConditionIsTrue(sub, () => typeof sub.updatedAt === "number");

            await resolveWhenConditionIsTrue(sub, async () => {
                const purgedPostInPage = await iterateThroughPagesToFindCommentInParentPagesInstance(postToPurge.cid, sub.posts);
                return purgedPostInPage === undefined; // if we can't find it then it's purged
            });

            await sub.stop();

            for (const pageCid of Object.values(sub.posts.pageCids)) {
                const purgedPostInPage = await iterateThroughPageCidToFindComment(postToPurge.cid, pageCid, sub.posts);

                expect(purgedPostInPage).to.be.undefined;
            }
            await plebbit.destroy();
        });

        it(`Should not be able to load a comment update of a purged post or its reply tree`, async () => {
            const differentPlebbit = await mockPlebbitNoDataPathWithOnlyKuboClient();
            differentPlebbit._timeouts["comment-ipfs"] = 100;

            const commentsWithDifferentPlebbit = await Promise.all(
                [postToPurge, postReply, replyUnderReply].map((comment) => differentPlebbit.createComment({ cid: comment.cid }))
            );
            await Promise.all(
                commentsWithDifferentPlebbit.map(async (purgedComment) => {
                    const waitingRetryErrs = [];
                    purgedComment.on("error", (err) => waitingRetryErrs.push(err));
                    await purgedComment.update();

                    await resolveWhenConditionIsTrue(purgedComment, () => waitingRetryErrs.length === 2, "error");

                    // we've attempted to load twice but it's not defined yet
                    // plebbit-js keeps on retrying to load the comment update, but it's not loading because ipfs node removed it from MFS
                    expect(waitingRetryErrs.length).to.be.greaterThan(0);
                    expect(purgedComment.updatedAt).to.be.undefined; // should not load comment update
                    expect(purgedComment.depth).to.be.undefined; // should not load comment ipfs

                    await purgedComment.stop();
                })
            );
        });
    });
});
