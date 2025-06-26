import { expect } from "chai";
import signers from "../../../../fixtures/signers.js";
import {
    publishRandomPost,
    publishRandomReply,
    mockPlebbitNoDataPathWithOnlyKuboClient,
    mockPostToFailToLoadFromPostUpdates,
    mockReplyToUseParentPagesForUpdates,
    createCommentUpdateWithInvalidSignature,
    mockPostToHaveSubplebbitWithNoPostUpdates,
    addStringToIpfs,
    resolveWhenConditionIsTrue,
    getRemotePlebbitConfigs,
    findOrPublishCommentWithDepth,
    mockPostToReturnSpecificCommentUpdate,
    isPlebbitFetchingUsingGateways,
    itSkipIfRpc,
    waitTillReplyInParentPagesInstance,
    forceSubplebbitToGenerateAllRepliesPages
} from "../../../../../dist/node/test/test-util.js";
import { cleanUpBeforePublishing } from "../../../../../dist/node/signer/signatures.js";

const subplebbitAddress = signers[0].address;

getRemotePlebbitConfigs().map((config) => {
    describe(`comment.update - ${config.name}`, async () => {
        let plebbit;
        before(async () => {
            plebbit = await config.plebbitInstancePromise();
        });

        after(async () => {
            await plebbit.destroy();
        });

        it(`plebbit.createComment({cid}).update() fetches comment ipfs and update correctly when cid is the cid of a post`, async () => {
            const originalPost = await publishRandomPost(subplebbitAddress, plebbit);

            const recreatedPost = await plebbit.createComment({ cid: originalPost.cid });

            const commentIpfsPromise = new Promise((resolve) => recreatedPost.once("update", resolve));
            await recreatedPost.update();

            await commentIpfsPromise; // Comment ipfs props should be defined now, but not CommentUpdate
            expect(recreatedPost.updatedAt).to.be.undefined;

            expect(recreatedPost.toJSONIpfs()).to.deep.equal(originalPost.toJSONIpfs());

            await new Promise((resolve) => recreatedPost.once("update", resolve));
            await recreatedPost.stop();
            expect(recreatedPost.updatedAt).to.be.a("number");
        });

        it(`plebbit.createComment({cid}).update() fetches comment ipfs and update correctly when cid is the cid of a reply`, async () => {
            const subplebbit = await plebbit.getSubplebbit(subplebbitAddress);

            const reply = await publishRandomReply(
                subplebbit.posts.pages.hot.comments.find((post) => post.replyCount > 0 && !post.locked),
                plebbit
            );

            const recreatedReply = await plebbit.createComment({ cid: reply.cid });

            const commentIpfsPromise = new Promise((resolve) => recreatedReply.once("update", resolve));
            await recreatedReply.update();

            await commentIpfsPromise;
            const commentUpdatePromise = new Promise((resolve) => recreatedReply.once("update", resolve));
            // Comment ipfs props should be defined now, but not CommentUpdate
            expect(recreatedReply.updatedAt).to.be.undefined;

            expect(recreatedReply.toJSONIpfs()).to.deep.equal(reply.toJSONIpfs());

            await commentUpdatePromise;
            await recreatedReply.stop();

            expect(recreatedReply.updatedAt).to.be.a("number");
        });

        it(`comment.stop() stops loading of comment updates (before update)`, async () => {
            const subplebbit = await plebbit.getSubplebbit(subplebbitAddress);

            const comment = await plebbit.createComment({ cid: subplebbit.posts.pages.hot.comments[0].cid });
            await comment.update();
            let updatedHasBeenCalled = false;
            await comment.stop();
            comment._setUpdatingState = async () => {
                updatedHasBeenCalled = true;
            };
            await new Promise((resolve) => setTimeout(resolve, plebbit.updateInterval * 2));
            expect(updatedHasBeenCalled).to.be.false;
        });

        it(`comment.stop() stops loading of comment updates (after update)`, async () => {
            const subplebbit = await plebbit.getSubplebbit(subplebbitAddress);

            const comment = await plebbit.createComment({ cid: subplebbit.posts.pages.hot.comments[0].cid });
            await comment.update();
            await resolveWhenConditionIsTrue(comment, () => typeof comment.updatedAt === "number");
            await comment.stop();
            await new Promise((resolve) => setTimeout(resolve, plebbit.updateInterval + 1));
            let updatedHasBeenCalled = false;
            comment._setUpdatingState = async () => {
                updatedHasBeenCalled = true;
            };

            await new Promise((resolve) => setTimeout(resolve, plebbit.updateInterval * 2));
            expect(updatedHasBeenCalled).to.be.false;
        });

        it(`comment.update() is working as expected after calling comment.stop()`, async () => {
            const plebbit = await config.plebbitInstancePromise();
            const subplebbit = await plebbit.getSubplebbit(subplebbitAddress);
            const postToStop = await plebbit.createComment({ cid: subplebbit.posts.pages.hot.comments[0].cid });

            await postToStop.update();
            await resolveWhenConditionIsTrue(postToStop, () => typeof postToStop.updatedAt === "number"); // CommentIpfs and CommentUpdate should be defined now
            await postToStop.stop();

            await postToStop.update();

            const reply = await publishRandomReply(postToStop, plebbit);
            await waitTillReplyInParentPagesInstance(reply, postToStop);
            await postToStop.stop();
            await plebbit.destroy();
        });

        it(`comment.update() is working as expected after comment.publish()`, async () => {
            const post = await publishRandomPost(subplebbitAddress, plebbit);
            await post.update();
            await resolveWhenConditionIsTrue(post, () => typeof post.updatedAt === "number");
            expect(post.updatedAt).to.be.a("number");
            await post.stop();
        });

        it(`reply can receive comment updates`, async () => {
            const post = await publishRandomPost(subplebbitAddress, plebbit);
            const reply = await publishRandomReply(post, plebbit);
            await reply.update();
            await resolveWhenConditionIsTrue(reply, () => typeof reply.updatedAt === "number");

            await reply.stop();
            expect(reply.updatedAt).to.be.a("number");
            expect(reply.author.subplebbit).to.be.a("object");
        });

        [1, 2, 3].map((replyDepth) => {
            itSkipIfRpc(
                `reply with depth = ${replyDepth} can receive comment updates from parent comment page cids, if parent comment is stopped`,
                async () => {
                    const subplebbit = await plebbit.getSubplebbit(subplebbitAddress);

                    const parentCid = await findOrPublishCommentWithDepth(replyDepth - 1, subplebbit);

                    const parentComment = await plebbit.getComment(parentCid);
                    expect(parentComment.depth).to.equal(replyDepth - 1);
                    await parentComment.update();
                    await resolveWhenConditionIsTrue(parentComment, () => typeof parentComment.updatedAt === "number");
                    await forceSubplebbitToGenerateAllRepliesPages(parentComment);
                    await parentComment.stop();

                    expect(parentComment.replies.pageCids).to.not.deep.equal({});

                    const reply = await publishRandomReply(parentComment, plebbit);
                    expect(reply.depth).to.equal(replyDepth);

                    const replyRecreated = await plebbit.createComment({ cid: reply.cid });
                    await replyRecreated.update();
                    mockReplyToUseParentPagesForUpdates(replyRecreated);

                    await resolveWhenConditionIsTrue(replyRecreated, () => typeof replyRecreated.updatedAt === "number");

                    expect(replyRecreated._commentUpdateIpfsPath).to.be.undefined; // should be undefined for replies since we're not including them in post updates
                    expect(replyRecreated.updatedAt).to.be.a("number"); // check for commentUpdate props
                    expect(replyRecreated.content).to.be.a("string"); // check for CommentIpfs props

                    const updatingReply = replyRecreated._plebbit._updatingComments[replyRecreated.cid];
                    expect(updatingReply._clientsManager._parentFirstPageCidsAlreadyLoaded.size).to.be.greaterThan(0);

                    await replyRecreated.stop();
                }
            );

            itSkipIfRpc(
                `Reply with depth = ${replyDepth} can receive comment updates from parent comment page cids, if parent comment is updating`,
                async () => {
                    const subplebbit = await plebbit.getSubplebbit(subplebbitAddress);

                    const parentCid = await findOrPublishCommentWithDepth(replyDepth - 1, subplebbit);

                    const parentComment = await plebbit.getComment(parentCid);
                    expect(parentComment.depth).to.equal(replyDepth - 1);
                    await parentComment.update();
                    await resolveWhenConditionIsTrue(parentComment, () => typeof parentComment.updatedAt === "number");
                    await forceSubplebbitToGenerateAllRepliesPages(parentComment);
                    // keep parent comment updating

                    expect(parentComment.replies.pageCids).to.not.deep.equal({});

                    const reply = await publishRandomReply(parentComment, plebbit);
                    expect(reply.depth).to.equal(reply.depth);

                    const replyRecreated = await plebbit.createComment({ cid: reply.cid });
                    await replyRecreated.update();
                    mockReplyToUseParentPagesForUpdates(replyRecreated);

                    await resolveWhenConditionIsTrue(replyRecreated, () => typeof replyRecreated.updatedAt === "number");

                    expect(replyRecreated._commentUpdateIpfsPath).to.be.undefined; // should be undefined for replies since we're not including them in post updates
                    expect(replyRecreated.updatedAt).to.be.a("number"); // check for commentUpdate props
                    expect(replyRecreated.content).to.be.a("string"); // check for CommentIpfs props

                    const updatingReply = replyRecreated._plebbit._updatingComments[replyRecreated.cid];
                    expect(updatingReply._clientsManager._parentFirstPageCidsAlreadyLoaded.size).to.be.greaterThan(0);

                    await replyRecreated.stop();
                    await parentComment.stop();
                }
            );
        });
    });
});

const addCommentIpfsWithInvalidSignatureToIpfs = async () => {
    const plebbit = await mockPlebbitNoDataPathWithOnlyKuboClient();
    const subplebbit = await plebbit.getSubplebbit(subplebbitAddress);

    const postIpfs = cleanUpBeforePublishing((await plebbit.getComment(subplebbit.posts.pages.hot.comments[0].cid)).toJSONIpfs());

    postIpfs.title += "1234"; // Invalidate signature
    const postWithInvalidSignatureCid = addStringToIpfs(JSON.stringify(postIpfs));

    await plebbit.destroy();

    return postWithInvalidSignatureCid;
};

const addCommentIpfsWithInvalidSchemaToIpfs = async () => {
    const plebbit = await mockPlebbitNoDataPathWithOnlyKuboClient();
    const subplebbit = await plebbit.getSubplebbit(subplebbitAddress);

    const postIpfs = (await plebbit.getComment(subplebbit.posts.pages.hot.comments[0].cid)).toJSONIpfs();

    postIpfs.content = 1234; // Content is supposed to be a string, this will make the schema invalid

    const postWithInvalidSchemaCid = addStringToIpfs(JSON.stringify(postIpfs));

    await plebbit.destroy();

    return postWithInvalidSchemaCid;
};

const addInvalidJsonToIpfs = async () => {
    return addStringToIpfs("<html>something</html>");
};

getRemotePlebbitConfigs().map((config) => {
    describe(`comment.update() emits errors for issues with CommentIpfs or CommentUpdate record - ${config.name}`, async () => {
        let invalidCommentIpfsCid;
        let cidOfInvalidJson;
        let cidOfCommentIpfsWithInvalidSchema;
        let plebbit;
        let commentUpdateWithInvalidSignatureJson;
        before(async () => {
            plebbit = await config.plebbitInstancePromise();
            invalidCommentIpfsCid = await addCommentIpfsWithInvalidSignatureToIpfs();
            cidOfInvalidJson = await addInvalidJsonToIpfs();
            cidOfCommentIpfsWithInvalidSchema = await addCommentIpfsWithInvalidSchemaToIpfs();
            const sub = await plebbit.getSubplebbit(subplebbitAddress);
            commentUpdateWithInvalidSignatureJson = await createCommentUpdateWithInvalidSignature(sub.posts.pages.hot.comments[0].cid);
        });

        after(async () => {
            await plebbit.destroy();
        });

        it(`plebbit.createComment({cid}).update() emits error and stops updating if signature of CommentIpfs is invalid`, async () => {
            // A critical error, so it shouldn't keep on updating

            const createdComment = await plebbit.createComment({ cid: invalidCommentIpfsCid });
            expect(createdComment.content).to.be.undefined; // Make sure it didn't use the props sub pages

            const errors = [];
            const updatingStates = [];
            createdComment.on("updatingstatechange", () => updatingStates.push(createdComment.updatingState));
            createdComment.on("error", (err) => errors.push(err));
            let updateHasBeenEmitted = false;
            createdComment.once("update", () => (updateHasBeenEmitted = true));
            await createdComment.update();
            expect(createdComment.content).to.be.undefined; // Make sure it didn't use the props sub pages

            await resolveWhenConditionIsTrue(createdComment, () => errors.length >= 1, "error");
            expect(errors.length).to.equal(1);
            expect(errors[0].code).to.equal("ERR_COMMENT_IPFS_SIGNATURE_IS_INVALID");

            // should stop updating by itself because of the critical error

            expect(createdComment.depth).to.be.undefined; // Make sure it did not use the props from the invalid CommentIpfs
            expect(createdComment.state).to.equal("stopped");
            expect(createdComment.updatingState).to.equal("failed");
            expect(updatingStates).to.deep.equal(["fetching-ipfs", "failed"]);
            expect(updateHasBeenEmitted).to.be.false;
        });

        it(`comment.update() emits error and stops updating loop if CommentIpfs is an invalid json`, async () => {
            const createdComment = await plebbit.createComment({ cid: cidOfInvalidJson });

            const updatingStates = [];
            createdComment.on("updatingstatechange", () => updatingStates.push(createdComment.updatingState));
            const errors = [];
            createdComment.on("error", (err) => errors.push(err));
            let updateHasBeenEmitted = false;
            createdComment.once("update", () => (updateHasBeenEmitted = true));
            await createdComment.update();

            await resolveWhenConditionIsTrue(createdComment, () => errors.length >= 1, "error");
            expect(errors.length).to.equal(1);
            expect(errors[0].code).to.equal("ERR_INVALID_JSON");

            await new Promise((resolve) => setTimeout(resolve, 500)); // wait until RPC transmits other states
            // should stop updating by itself because of the critical error

            expect(createdComment.depth).to.be.undefined; // Make sure it did not use the props from the invalid CommentIpfs
            expect(createdComment.state).to.equal("stopped");
            expect(createdComment.updatingState).to.equal("failed");
            expect(updatingStates).to.deep.equal(["fetching-ipfs", "failed"]);
            expect(updateHasBeenEmitted).to.be.false;
        });

        it(`comment.update() emits error and stops updating loop if CommentIpfs is an invalid schema`, async () => {
            const createdComment = await plebbit.createComment({ cid: cidOfCommentIpfsWithInvalidSchema });

            const updatingStates = [];
            createdComment.on("updatingstatechange", () => updatingStates.push(createdComment.updatingState));
            let updateHasBeenEmitted = false;
            createdComment.once("update", () => (updateHasBeenEmitted = true));
            const errors = [];
            createdComment.on("error", (err) => errors.push(err));
            await createdComment.update();

            await resolveWhenConditionIsTrue(createdComment, () => errors.length >= 1, "error");
            expect(errors.length).to.equal(1);
            expect(errors[0].code).to.equal("ERR_INVALID_COMMENT_IPFS_SCHEMA");

            // should stop updating by itself because of the critical error

            expect(createdComment.depth).to.be.undefined; // Make sure it did not use the props from the invalid CommentIpfs
            expect(createdComment.state).to.equal("stopped");
            expect(createdComment.updatingState).to.equal("failed");
            expect(updatingStates).to.deep.equal(["fetching-ipfs", "failed"]);
            expect(updateHasBeenEmitted).to.be.false;
        });

        itSkipIfRpc(`comment.update() emit an error if CommentUpdate signature is invalid `, async () => {
            // Should emit an error as well but stay subscribed to sub updates

            const createdComment = await plebbit.createComment({
                cid: commentUpdateWithInvalidSignatureJson.cid
            });

            const errors = [];

            createdComment.on("error", (err) => errors.push(err));

            await createdComment.update();

            mockPostToReturnSpecificCommentUpdate(createdComment, JSON.stringify(commentUpdateWithInvalidSignatureJson));

            await Promise.all([
                resolveWhenConditionIsTrue(createdComment, () => errors.length === 2, "error"),
                publishRandomPost(subplebbitAddress, plebbit)
            ]);

            expect(createdComment.updatedAt).to.be.undefined; // Make sure it didn't use the props from the invalid CommentUpdate
            expect(createdComment.state).to.equal("updating");
            expect(errors.length).to.equal(2);
            expect(plebbit._updatingComments[createdComment.cid]._invalidCommentUpdateMfsPaths.size).to.equal(errors.length); // it should mark the path as invalid

            for (const error of errors) {
                if (isPlebbitFetchingUsingGateways(plebbit)) {
                    expect(error.code).to.equal("ERR_FAILED_TO_FETCH_COMMENT_UPDATE_FROM_GATEWAYS");
                    for (const gatewayUrl of Object.keys(plebbit.clients.ipfsGateways)) {
                        expect(error.details.gatewayToError[gatewayUrl].code).to.equal("ERR_COMMENT_UPDATE_SIGNATURE_IS_INVALID");
                    }
                } else expect(error.code).to.equal("ERR_COMMENT_UPDATE_SIGNATURE_IS_INVALID");
            }

            await createdComment.stop();
        });

        itSkipIfRpc(`comment.update() emits error if CommentUpdate is an invalid json`, async () => {
            // Should emit an error and keep on updating

            const invalidCommentUpdateJson = "<html>something</html>";
            // Should emit an error as well but stay subscribed to sub updates

            const createdComment = await plebbit.createComment({
                cid: commentUpdateWithInvalidSignatureJson.cid
            });

            const errors = [];

            createdComment.on("error", (err) => errors.push(err));

            await createdComment.update();
            await mockPostToReturnSpecificCommentUpdate(createdComment, invalidCommentUpdateJson);

            await Promise.all([
                resolveWhenConditionIsTrue(createdComment, () => errors.length === 2, "error"),
                publishRandomPost(subplebbitAddress, plebbit) // force sub to publish a new update
            ]);

            expect(createdComment.updatedAt).to.be.undefined; // Make sure it didn't use the props from the invalid CommentUpdate
            expect(createdComment.state).to.equal("updating");
            expect(errors.length).to.equal(2);
            expect(plebbit._updatingComments[createdComment.cid]._invalidCommentUpdateMfsPaths.size).to.equal(errors.length); // it should mark the path as invalid

            for (const error of errors) {
                if (isPlebbitFetchingUsingGateways(plebbit)) {
                    expect(error.code).to.equal("ERR_FAILED_TO_FETCH_COMMENT_UPDATE_FROM_GATEWAYS");
                    for (const gatewayUrl of Object.keys(plebbit.clients.ipfsGateways)) {
                        expect(error.details.gatewayToError[gatewayUrl].code).to.equal("ERR_INVALID_JSON");
                    }
                } else expect(error.code).to.equal("ERR_INVALID_JSON");
            }

            await createdComment.stop();
        });

        itSkipIfRpc(`comment.update() emits error if CommentUpdate is an invalid schema`, async () => {
            // Should emit an error as well but stay subscribed to sub updates
            const createdComment = await plebbit.createComment({
                cid: commentUpdateWithInvalidSignatureJson.cid
            });

            const invalidCommentUpdateSchema = { hello: "this should fail the schema parse" };

            const errors = [];

            createdComment.on("error", (err) => errors.push(err));

            await createdComment.update();

            await mockPostToReturnSpecificCommentUpdate(createdComment, JSON.stringify(invalidCommentUpdateSchema));

            await Promise.all([
                resolveWhenConditionIsTrue(createdComment, () => errors.length === 2, "error"),
                publishRandomPost(subplebbitAddress, plebbit) // force sub to publish a new update
            ]);

            expect(createdComment.updatedAt).to.be.undefined; // Make sure it didn't use the props from the invalid CommentUpdate
            expect(createdComment.state).to.equal("updating");
            expect(errors.length).to.equal(2);
            expect(plebbit._updatingComments[createdComment.cid]._invalidCommentUpdateMfsPaths.size).to.equal(errors.length); // it should mark the path as invalid

            for (const error of errors) {
                if (isPlebbitFetchingUsingGateways(plebbit)) {
                    expect(error.code).to.equal("ERR_FAILED_TO_FETCH_COMMENT_UPDATE_FROM_GATEWAYS");
                    for (const gatewayUrl of Object.keys(plebbit.clients.ipfsGateways)) {
                        expect(error.details.gatewayToError[gatewayUrl].code).to.equal("ERR_INVALID_COMMENT_UPDATE_SCHEMA");
                    }
                } else expect(error.code).to.equal("ERR_INVALID_COMMENT_UPDATE_SCHEMA");
            }

            await createdComment.stop();
        });

        itSkipIfRpc(`postCommentInstance.update() emits error when post fails to load from postUpdates`, async () => {
            const sub = await plebbit.getSubplebbit(subplebbitAddress);
            const postCid = sub.posts.pages.hot.comments[0].cid;

            const post = await plebbit.getComment(postCid);
            const errors = [];
            post.on("error", (err) => errors.push(err));
            await post.update();
            await mockPostToFailToLoadFromPostUpdates(post);

            await resolveWhenConditionIsTrue(post, () => errors.length === 1, "error");
            expect(post.updatingState).to.equal("waiting-retry"); // failing to load ipfs path is not critical error

            await post.stop();
            expect(post.state).to.equal("stopped");
            expect(post.updatingState).to.equal("stopped");

            expect(errors.length).to.equal(1);
            expect(errors[0].code).to.equal("ERR_FAILED_TO_FETCH_COMMENT_UPDATE_FROM_ALL_POST_UPDATES_RANGES");
        });

        itSkipIfRpc(`postCommentInstance.update() emits error when subplebbit has no postUpdates`, async () => {
            const sub = await plebbit.getSubplebbit(subplebbitAddress);
            const postCid = sub.posts.pages.hot.comments[0].cid;

            const post = await plebbit.getComment(postCid);
            const errors = [];
            post.on("error", (err) => errors.push(err));
            await post.update();
            await mockPostToHaveSubplebbitWithNoPostUpdates(post);

            await resolveWhenConditionIsTrue(post, () => errors.length === 1, "error");
            expect(post.updatingState).to.equal("failed");

            await post.stop();
            expect(post.state).to.equal("stopped");
            expect(post.updatingState).to.equal("stopped");

            expect(errors.length).to.equal(1);
            expect(errors[0].code).to.equal("ERR_SUBPLEBBIT_HAS_NO_POST_UPDATES");
        });
    });
});

getRemotePlebbitConfigs({ includeOnlyTheseTests: ["remote-ipfs-gateway"] }).map((config) => {
    describe(`comment.update() emits errors for gateways that return content that does not correspond to their cids`, async () => {
        it(`comment.update() emit an error and stops updating loop if gateway responded with a CommentIpfs that's not derived from its CID - IPFS Gateway`, async () => {
            const gatewayUrl = "http://localhost:13415"; // This gateway responds with content that is not equivalent to its CID
            const plebbit = await config.plebbitInstancePromise({ plebbitOptions: { ipfsGatewayUrls: [gatewayUrl] } });

            const cid = "QmUFu8fzuT1th3jJYgR4oRgGpw3sgRALr4nbenA4pyoCav"; // Gateway will respond with random content for this cid
            const createdComment = await plebbit.createComment({ cid });

            const ipfsGatewayStates = [];
            const updatingStates = [];
            createdComment.on("updatingstatechange", () => updatingStates.push(createdComment.updatingState));
            const ipfsGatewayUrl = Object.keys(createdComment.clients.ipfsGateways)[0];
            createdComment.clients.ipfsGateways[ipfsGatewayUrl].on("statechange", (state) => ipfsGatewayStates.push(state));
            let updateHasBeenEmitted = false;
            createdComment.once("update", () => (updateHasBeenEmitted = true));
            await createdComment.update();

            const err = await new Promise((resolve) => createdComment.once("error", resolve));
            expect(err.code).to.equal("ERR_FAILED_TO_FETCH_COMMENT_IPFS_FROM_GATEWAYS");
            expect(err.details.gatewayToError[gatewayUrl].code).to.equal("ERR_CALCULATED_CID_DOES_NOT_MATCH");

            // should stop updating by itself because of the critical error

            expect(createdComment.state).to.equal("stopped");
            expect(createdComment.updatingState).to.equal("failed");
            expect(updatingStates).to.deep.equal(["fetching-ipfs", "failed"]);
            expect(ipfsGatewayStates).to.deep.equal(["fetching-ipfs", "stopped"]);
            expect(updateHasBeenEmitted).to.be.false;
            await plebbit.destroy();
        });
    });
});
