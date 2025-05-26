import { expect } from "chai";
import signers from "../../../fixtures/signers.js";
import {
    publishRandomPost,
    mockGatewayPlebbit,
    findOrGenerateReplyUnderPostWithMultiplePages,
    mockPostToReturnSpecificCommentUpdate,
    mockPlebbitToReturnSpecificSubplebbit,
    createCommentUpdateWithInvalidSignature,
    mockPlebbitNoDataPathWithOnlyKuboClient,
    mockCommentToNotUsePagesForUpdates,
    resolveWhenConditionIsTrue,
    publishRandomReply,
    waitTillReplyInParentPagesInstance,
    mockReplyToUseParentPagesForUpdates,
    describeSkipIfRpc,
    getRemotePlebbitConfigs
} from "../../../../dist/node/test/test-util.js";
const subplebbitAddress = signers[0].address;

// Helper function to clean up state arrays by removing:
// 1. All "waiting-retry" entries
// 2. Adjacent duplicate entries (e.g., ["fetching-subplebbit-ipns", "fetching-subplebbit-ipns"] -> ["fetching-subplebbit-ipns"])
// 3. Repeating pairs of ["fetching-subplebbit-ipns", "fetching-subplebbit-ipfs"]
const cleanupStateArray = (states) => {
    const filteredStates = [...states];

    // Remove standalone "waiting-retry" entries
    for (let i = 0; i < filteredStates.length; i++) {
        if (filteredStates[i] === "waiting-retry") {
            filteredStates.splice(i, 1);
            i--; // Adjust index after removing element
        }
    }

    // Remove adjacent duplicates
    for (let i = 0; i < filteredStates.length - 1; i++) {
        if (filteredStates[i] === filteredStates[i + 1]) {
            filteredStates.splice(i + 1, 1);
            i--; // Adjust index after removing element
        }
    }

    // Remove repeating ["fetching-subplebbit-ipns", "fetching-subplebbit-ipfs"] pairs
    const patternA = "fetching-subplebbit-ipns";
    const patternB = "fetching-subplebbit-ipfs";
    for (let i = 0; i <= filteredStates.length - 4; i++) {
        if (
            filteredStates[i] === patternA &&
            filteredStates[i + 1] === patternB &&
            filteredStates[i + 2] === patternA &&
            filteredStates[i + 3] === patternB
        ) {
            filteredStates.splice(i + 2, 2); // Remove the second pair
            i--; // Adjust index to re-check the current position after removal
        }
    }

    // Remove repeating ["fetching-subplebbit-ipns", "fetching-subplebbit-ipfs", "fetching-update-ipfs", "succeeded"] sequences
    const patternC = "fetching-update-ipfs";
    const patternD = "succeeded";
    for (let i = 0; i <= filteredStates.length - 8; i++) {
        // Need to check 8 elements for two consecutive patterns
        if (
            filteredStates[i] === patternA &&
            filteredStates[i + 1] === patternB &&
            filteredStates[i + 2] === patternC &&
            filteredStates[i + 3] === patternD &&
            filteredStates[i + 4] === patternA && // Start of the second sequence
            filteredStates[i + 5] === patternB &&
            filteredStates[i + 6] === patternC &&
            filteredStates[i + 7] === patternD
        ) {
            filteredStates.splice(i + 4, 4); // Remove the second sequence
            i--; // Adjust index to re-check the current position after removal
        }
    }

    return filteredStates;
};

getRemotePlebbitConfigs({ includeOnlyTheseTests: ["remote-kubo-rpc", "remote-libp2pjs"] }).map((config) => {
    describeSkipIfRpc(`post.updatingState - ${config.name}`, async () => {
        let plebbit;
        before(async () => {
            plebbit = await config.plebbitInstancePromise();
        });

        afterEach(async () => {
            if (plebbit) await plebbit.destroy();
            plebbit = await config.plebbitInstancePromise();
        });

        after(async () => {
            await plebbit.destroy();
        });

        it(`Updating states is in correct upon updating a post that's included in preloaded pages of subplebbit`, async () => {
            const sub = await plebbit.getSubplebbit(subplebbitAddress);
            const postCid = sub.posts.pages.hot.comments.find((comment) => !comment.author.address.includes(".")).cid;
            const mockPost = await plebbit.createComment({ cid: postCid });
            const recordedStates = [];
            mockPost.on("updatingstatechange", (newState) => recordedStates.push(newState));

            await mockPost.update();
            const expectedStates = [
                "fetching-ipfs",
                "succeeded",
                "fetching-subplebbit-ipns",
                "fetching-subplebbit-ipfs", // found CommentUpdate of post here
                "succeeded",
                "stopped"
            ];

            await mockPost.update();
            await resolveWhenConditionIsTrue(mockPost, () => typeof mockPost.updatedAt === "number");
            await mockPost.stop();

            expect(mockPost._commentUpdateIpfsPath).to.not.exist;
            expect(recordedStates.slice(recordedStates.length - expectedStates.length)).to.deep.equal(expectedStates);
        });

        it(`updating states is in correct order upon updating a post with IPFS client using postUpdates`, async () => {
            const sub = await plebbit.getSubplebbit(subplebbitAddress);
            const postCid = sub.posts.pages.hot.comments[0].cid;
            const mockPost = await plebbit.createComment({ cid: postCid });
            const expectedStates = ["fetching-subplebbit-ipns", "fetching-subplebbit-ipfs", "fetching-update-ipfs", "succeeded", "stopped"];
            const recordedStates = [];
            mockPost.on("updatingstatechange", (newState) => recordedStates.push(newState));

            await mockPost.update();
            mockCommentToNotUsePagesForUpdates(mockPost); // we want to force it to fetch from the post updates
            await resolveWhenConditionIsTrue(mockPost, () => typeof mockPost.updatedAt === "number");
            await mockPost.stop();

            expect(mockPost._commentUpdateIpfsPath).to.exist;
            expect(recordedStates.slice(recordedStates.length - expectedStates.length)).to.deep.equal(expectedStates);
        });

        it(`the order of state-event-statechange is correct when we get a new update from post`, async () => {
            const sub = await plebbit.getSubplebbit(subplebbitAddress);
            const postCid = sub.posts.pages.hot.comments[0].cid;
            const mockPost = await plebbit.createComment({ cid: postCid });
            expect(mockPost.updatedAt).to.be.undefined;
            const recordedStates = [];
            mockPost.on("updatingstatechange", (newState) => recordedStates.push(newState));

            const commentIpfsUpdate = new Promise((resolve, reject) => {
                mockPost.once("update", () => {
                    if (mockPost.updatingState !== "succeeded") reject("updating state should be succeeded after getting comment ipfs");
                    if (recordedStates.length === 0) reject("should have emitted an event");
                    if (recordedStates[recordedStates.length - 1] === "succeeded") reject("should not emit an event just yet");
                    resolve();
                });
            });

            const commentUpdatePromise = new Promise((resolve, reject) => {
                mockPost.on("update", () => {
                    if (!mockPost.updatedAt) return;
                    if (mockPost.updatingState !== "succeeded") reject("updating state should be succeeded after getting comment ipfs");
                    if (recordedStates.length === 0) reject("should have emitted an event");
                    if (recordedStates[recordedStates.length - 1] === "succeeded") reject("should not emit an event just yet");
                    resolve();
                });
            });

            await mockPost.update();
            await commentIpfsUpdate;
            await commentUpdatePromise;

            await mockPost.stop();
        });

        it(`updating state of post is set to failed if sub has an invalid Subplebbit record`, async () => {
            const plebbit = await mockPlebbitNoDataPathWithOnlyKuboClient({ resolveAuthorAddresses: false }); // set resolve to false so it wouldn't show up in states
            const sub = await plebbit.getSubplebbit(subplebbitAddress);
            const subInvalidRecord = { ...sub.toJSONIpfs(), updatedAt: 12345 + Math.round(Math.random() * 1000) }; //override updatedAt which will give us an invalid signature
            const createdPost = await plebbit.createComment({
                cid: sub.posts.pages.hot.comments[0].cid
            });
            expect(createdPost.content).to.be.undefined;
            expect(createdPost.updatedAt).to.be.undefined;

            const updatingStates = [];
            createdPost.on("updatingstatechange", () => updatingStates.push(createdPost.updatingState));

            const createErrorPromise = () =>
                new Promise((resolve) =>
                    createdPost.once("error", (err) => {
                        if (err.code === "ERR_SUBPLEBBIT_SIGNATURE_IS_INVALID") resolve();
                    })
                );
            await sub.update(); // need to update it so that we can mock it below
            await mockPlebbitToReturnSpecificSubplebbit(createdPost._plebbit, subplebbitAddress, subInvalidRecord);
            expect(createdPost.updatedAt).to.be.undefined;
            await createdPost.update();
            expect(createdPost.updatedAt).to.be.undefined;

            await createErrorPromise();

            await createdPost.stop();
            await sub.stop();
            expect(createdPost.updatedAt).to.be.undefined;

            const expectedUpdateStates = [
                "fetching-ipfs", // fetching comment ipfs of post
                "succeeded", // succeeded loading comment ipfs of post
                "fetching-subplebbit-ipns", // fetching subplebbit ipns
                "fetching-subplebbit-ipfs", // fetching subplebbit ipfs
                "failed", // subplebbit ipfs record is invalid
                "stopped" // called post.stop()
            ];
            expect(updatingStates).to.deep.equal(expectedUpdateStates);
        });

        it(`updating state is set to failed if we load an invalid CommentUpdate record from postUpdates`, async () => {
            const sub = await plebbit.getSubplebbit(subplebbitAddress);
            const commentUpdateWithInvalidSignatureJson = await createCommentUpdateWithInvalidSignature(
                sub.posts.pages.hot.comments[0].cid
            );
            const createdComment = await plebbit.createComment({
                cid: commentUpdateWithInvalidSignatureJson.cid
            });

            const updatingStates = [];
            createdComment.on("updatingstatechange", () => updatingStates.push(createdComment.updatingState));

            const createErrorPromise = () =>
                new Promise((resolve) =>
                    createdComment.once("error", (err) => {
                        if (err.code === "ERR_COMMENT_UPDATE_SIGNATURE_IS_INVALID") resolve();
                    })
                );

            await createdComment.update();

            await mockPostToReturnSpecificCommentUpdate(createdComment, JSON.stringify(commentUpdateWithInvalidSignatureJson));

            await createErrorPromise();

            await publishRandomPost(subplebbitAddress, plebbit); // force subplebbit to publish a new update which will increase loading attempts
            await createErrorPromise();

            await createdComment.stop();

            expect(createdComment.updatedAt).to.be.undefined; // should not accept the comment update

            const expectedUpdateStates = [
                "fetching-ipfs",
                "succeeded",
                "fetching-subplebbit-ipns",
                "fetching-subplebbit-ipfs",
                "fetching-update-ipfs",
                "failed"
            ];
            expect(updatingStates.slice(0, expectedUpdateStates.length)).to.deep.equal(expectedUpdateStates);

            const restOfUpdatingStates = updatingStates.slice(expectedUpdateStates.length, updatingStates.length);
            for (let i = 0; i < restOfUpdatingStates.length; i += 2) {
                if (restOfUpdatingStates[i] === "fetching-subplebbit-ipns" && restOfUpdatingStates[i + 1] === "fetching-subplebbit-ipfs") {
                    expect(restOfUpdatingStates[i + 2]).to.equal("fetching-update-ipfs"); // this should be the second attempt to load invalid CommentUpdate
                    expect(restOfUpdatingStates[i + 3]).to.equal("failed");
                }
            }
            expect(updatingStates[updatingStates.length - 1]).to.equal("stopped");
        });
    });
});

getRemotePlebbitConfigs({ includeOnlyTheseTests: ["remote-ipfs-gateway"] }).map((config) => {
    describeSkipIfRpc(`post.updatingState - ${config.name}`, async () => {
        let plebbit;
        before(async () => {
            plebbit = await config.plebbitInstancePromise();
        });

        afterEach(async () => {
            if (plebbit) await plebbit.destroy();
            plebbit = await config.plebbitInstancePromise();
        });

        after(async () => {
            await plebbit.destroy();
        });

        it(`updating state of post is set to failed if sub has an invalid Subplebbit record`, async () => {
            const sub = await plebbit.getSubplebbit(subplebbitAddress);
            const subInvalidRecord = { ...sub.toJSONIpfs(), updatedAt: 12345 + Math.round(Math.random() * 1000) }; //override updatedAt which will give us an invalid signature
            const createdPost = await plebbit.createComment({
                cid: sub.posts.pages.hot.comments[0].cid
            });
            expect(createdPost.content).to.be.undefined;
            expect(createdPost.updatedAt).to.be.undefined;

            const recordedStates = [];
            createdPost.on("updatingstatechange", () => recordedStates.push(createdPost.updatingState));

            const createErrorPromise = () =>
                new Promise((resolve) =>
                    createdPost.once("error", (err) => {
                        if (err.details.gatewayToError["http://localhost:18080"].code === "ERR_SUBPLEBBIT_SIGNATURE_IS_INVALID") resolve();
                    })
                );
            await sub.update(); // need to update it so that we can mock it below
            await mockPlebbitToReturnSpecificSubplebbit(createdPost._plebbit, subplebbitAddress, subInvalidRecord);
            await createdPost.update();

            await createErrorPromise();

            await createdPost.stop();
            await sub.stop();
            expect(createdPost.updatedAt).to.be.undefined;

            const expectedUpdateStates = [
                "fetching-ipfs", // fetching comment ipfs of post
                "succeeded", // succeeded loading comment ipfs of post
                "fetching-subplebbit-ipns", // fetching subplebbit ipnsa from gateway
                "failed", // subplebbit ipfs record is invalid
                "stopped" // called post.stop()
            ];
            expect(recordedStates).to.deep.equal(expectedUpdateStates);
        });

        it(`updating state is set to failed if we load an invalid CommentUpdate record from postUpdates`, async () => {
            const sub = await plebbit.getSubplebbit(subplebbitAddress);
            const commentUpdateWithInvalidSignatureJson = await createCommentUpdateWithInvalidSignature(
                sub.posts.pages.hot.comments[0].cid
            );
            const createdComment = await plebbit.createComment({
                cid: commentUpdateWithInvalidSignatureJson.cid
            });

            const recordedStates = [];
            createdComment.on("updatingstatechange", () => recordedStates.push(createdComment.updatingState));

            const createErrorPromise = () =>
                new Promise((resolve) =>
                    createdComment.once("error", (err) => {
                        if (err.details.gatewayToError["http://localhost:18080"].code === "ERR_COMMENT_UPDATE_SIGNATURE_IS_INVALID")
                            resolve();
                    })
                );

            await createdComment.update();

            await mockPostToReturnSpecificCommentUpdate(createdComment, JSON.stringify(commentUpdateWithInvalidSignatureJson));

            await createErrorPromise();

            await publishRandomPost(subplebbitAddress, plebbit); // force subplebbit to publish a new update which will increase loading attempts
            await createErrorPromise();

            await createdComment.stop();

            expect(createdComment.updatedAt).to.be.undefined; // should not accept the comment update

            const expectedUpdateStates = ["fetching-ipfs", "succeeded", "fetching-subplebbit-ipns", "fetching-update-ipfs", "failed"];
            expect(recordedStates.slice(0, expectedUpdateStates.length)).to.deep.equal(expectedUpdateStates);

            const restOfUpdatingStates = recordedStates.slice(expectedUpdateStates.length, recordedStates.length);
            for (let i = 0; i < restOfUpdatingStates.length; i += 2) {
                if (restOfUpdatingStates[i] === "fetching-subplebbit-ipns" && restOfUpdatingStates[i + 1] === "fetching-subplebbit-ipfs") {
                    expect(restOfUpdatingStates[i + 2]).to.equal("fetching-update-ipfs"); // this should be the second attempt to load invalid CommentUpdate
                    expect(restOfUpdatingStates[i + 3]).to.equal("failed");
                }
            }
            expect(recordedStates[recordedStates.length - 1]).to.equal("stopped");
        });
        it(`Updating states is in correct upon updating a post that's included in preloaded pages of subplebbit`, async () => {
            const sub = await plebbit.getSubplebbit(subplebbitAddress);
            const postCid = sub.posts.pages.hot.comments[0].cid;
            const mockPost = await plebbit.createComment({ cid: postCid });
            const recordedStates = [];
            mockPost.on("updatingstatechange", (newState) => recordedStates.push(newState));

            await mockPost.update();
            const expectedStates = [
                "fetching-ipfs",
                "succeeded",
                "fetching-subplebbit-ipns", // found CommentUpdate of post here
                "succeeded",
                "stopped"
            ];

            await mockPost.update();
            await resolveWhenConditionIsTrue(mockPost, () => typeof mockPost.updatedAt === "number");
            await mockPost.stop();

            expect(mockPost._commentUpdateIpfsPath).to.not.exist;
            expect(recordedStates.slice(recordedStates.length - expectedStates.length)).to.deep.equal(expectedStates);
        });

        it(`updating states is in correct order upon updating a post with gateway using postUpdates`, async () => {
            const subplebbit = await plebbit.getSubplebbit(subplebbitAddress);
            const postCid = subplebbit.posts.pages.hot.comments[0].cid;
            const mockPost = await plebbit.createComment({ cid: postCid });
            const expectedStates = [
                "fetching-ipfs",
                "succeeded",
                "fetching-subplebbit-ipns",
                "fetching-update-ipfs",
                "succeeded",
                "stopped"
            ];
            const recordedStates = [];
            mockPost.on("updatingstatechange", (newState) => recordedStates.push(newState));

            await mockPost.update();
            mockCommentToNotUsePagesForUpdates(mockPost);

            await resolveWhenConditionIsTrue(mockPost, () => typeof mockPost.updatedAt === "number");
            await mockPost.stop();

            expect(mockPost._commentUpdateIpfsPath).to.exist;

            const filteredExpectedStates = cleanupStateArray(expectedStates);
            const filteredRecordedStates = cleanupStateArray(recordedStates);
            expect(filteredRecordedStates).to.deep.equal(filteredExpectedStates);
        });
    });
});

getRemotePlebbitConfigs({ includeOnlyTheseTests: ["remote-kubo-rpc", "remote-libp2pjs"] }).map((config) => {
    describeSkipIfRpc(`reply.updatingState - ${config.name}`, async () => {
        let plebbit, replyCid;
        before(async () => {
            const tempPlebbit = await config.plebbitInstancePromise();
            const sub = await tempPlebbit.getSubplebbit(subplebbitAddress);
            const post = sub.posts.pages.hot.comments[0];
            const reply = await publishRandomReply(post, tempPlebbit);
            replyCid = reply.cid;
            await tempPlebbit.destroy();
        });

        beforeEach(async () => {
            if (plebbit) await plebbit.destroy();
            plebbit = await config.plebbitInstancePromise();
        });

        after(async () => {
            await plebbit.destroy();
        });

        it(`Updating states is in correct upon updating a reply that's included in preloaded pages of its parent`, async () => {
            const mockReply = await plebbit.createComment({ cid: replyCid });
            const expectedStates = [
                "fetching-ipfs", // fetching comment ipfs of reply
                "succeeded", // succeeded loading comment ipfs of reply
                "fetching-subplebbit-ipns",
                "fetching-subplebbit-ipfs", // found CommentUpdate of reply here
                "succeeded",
                "stopped"
            ];
            const recordedStates = [];
            mockReply.on("updatingstatechange", (newState) => recordedStates.push(newState));

            await mockReply.update();

            await resolveWhenConditionIsTrue(mockReply, () => typeof mockReply.updatedAt === "number");
            await mockReply.stop();

            expect(mockReply._commentUpdateIpfsPath).to.not.exist;
            const filteredExpectedStates = cleanupStateArray(expectedStates);
            const filteredRecordedStates = cleanupStateArray(recordedStates);
            expect(filteredRecordedStates).to.deep.equal(filteredExpectedStates);
        });
        it(`updating state of reply is set to failed if sub has an invalid Subplebbit record`, async () => {
            const sub = await plebbit.getSubplebbit(subplebbitAddress);
            const subInvalidRecord = { ...sub.toJSONIpfs(), updatedAt: 12345 + Math.round(Math.random() * 1000) }; //override updatedAt which will give us an invalid signature

            const mockReply = await plebbit.createComment({ cid: replyCid });

            const recordedStates = [];
            mockReply.on("updatingstatechange", () => recordedStates.push(mockReply.updatingState));

            const createErrorPromise = () =>
                new Promise((resolve) =>
                    mockReply.once("error", (err) => {
                        if (err.code === "ERR_SUBPLEBBIT_SIGNATURE_IS_INVALID") resolve();
                    })
                );
            await sub.update(); // need to update it so that we can mock it below
            await mockPlebbitToReturnSpecificSubplebbit(mockReply._plebbit, subplebbitAddress, subInvalidRecord);
            await mockReply.update();

            await createErrorPromise();

            await mockReply.stop();
            await sub.stop();
            expect(mockReply.updatedAt).to.be.undefined;

            const expectedUpdateStates = [
                "fetching-ipfs", // fetching comment ipfs of reply
                "succeeded", // succeeded loading comment ipfs of reply
                "fetching-subplebbit-ipns", // fetching subplebbit ipns
                "fetching-subplebbit-ipfs", // fetching subplebbit ipfs
                "failed", // subplebbit ipfs record is invalid
                "stopped" // called post.stop()
            ];
            const filteredExpectedStates = cleanupStateArray(expectedUpdateStates);
            const filteredRecordedStates = cleanupStateArray(recordedStates);
            expect(filteredRecordedStates).to.deep.equal(filteredExpectedStates);
        });

        it(`Updating states is in correct upon updating a reply from its parent pageCids`, async () => {
            const subplebbit = await plebbit.getSubplebbit(subplebbitAddress);
            await subplebbit.update();
            const replyInPage = await findOrGenerateReplyUnderPostWithMultiplePages(subplebbit);

            const reply = await plebbit.createComment({ cid: replyInPage.cid });

            expect(reply.content).to.be.undefined;
            expect(reply.updatedAt).to.be.undefined;

            const expectedStates = [
                "fetching-ipfs", // fetching comment ipfs of reply
                "succeeded", // succeeded loading comment ipfs of reply
                "fetching-update-ipfs", // fetching comment update of reply by using pageCids of post
                "succeeded", // succeeded loading comment update of reply using pageCids of parent
                "fetching-subplebbit-ipns", // fetching subplebbit ipns
                "waiting-retry", // waiting for a new subplebbit update
                "fetching-subplebbit-ipns", // fetching subplebbit ipns
                "fetching-subplebbit-ipfs", // fetching subplebbit ipfs
                "fetching-update-ipfs", // fetching comment update of reply by using page cids of parent
                "succeeded", // succeeded loading comment update of reply using page cids of parent
                "stopped" // stopped
            ];
            const recordedStates = [];
            reply.on("updatingstatechange", (newState) => recordedStates.push(newState));

            await reply.update();
            mockReplyToUseParentPagesForUpdates(reply);
            expect(reply.content).to.be.undefined;
            expect(reply.updatedAt).to.be.undefined;
            await resolveWhenConditionIsTrue(reply, () => typeof reply.depth === "number");
            const nestedReply = await publishRandomReply(reply, plebbit);
            await waitTillReplyInParentPagesInstance(nestedReply, reply);
            await reply.stop();

            // Remove consecutive ["waiting-retry", "fetching-subplebbit-ipns"] entries
            const filteredExpectedStates = cleanupStateArray(expectedStates);
            const filteredRecordedStates = cleanupStateArray(recordedStates);

            console.log("recordedStates", recordedStates);
            console.log("filteredRecordedStates", filteredRecordedStates);
            console.log("filteredExpectedStates", filteredExpectedStates);
            expect(filteredRecordedStates).to.deep.equal(filteredExpectedStates);
        });
    });
});

getRemotePlebbitConfigs({ includeOnlyTheseTests: ["remote-ipfs-gateway"] }).map((config) => {
    describe(`reply.updatingState - ${config.name}`, async () => {
        let plebbit;
        before(async () => {
            plebbit = await config.plebbitInstancePromise();
        });

        afterEach(async () => {
            if (plebbit) await plebbit.destroy();
            plebbit = await config.plebbitInstancePromise();
        });

        after(async () => {
            await plebbit.destroy();
        });

        it(`updating state of reply is in correct order upon updating a reply that's included in preloaded pages of its parent`, async () => {
            const sub = await plebbit.getSubplebbit(subplebbitAddress);
            // we don't want domain name in author addrses so its resolving doesn't get included in expected states
            const replyCid = sub.posts.pages.hot.comments.find((post) => post.replies && !post.author.address.includes(".")).replies.pages
                .best.comments[0].cid;
            const mockReply = await plebbit.createComment({ cid: replyCid });
            const expectedStates = [
                "fetching-ipfs", // fetching comment ipfs of reply
                "succeeded", // succeeded loading comment ipfs of reply
                "fetching-subplebbit-ipns", // found CommentUpdate of reply here
                "succeeded",
                "stopped"
            ];
            const recordedStates = [];
            mockReply.on("updatingstatechange", (newState) => recordedStates.push(newState));

            await mockReply.update();

            await resolveWhenConditionIsTrue(mockReply, () => typeof mockReply.updatedAt === "number");
            await mockReply.stop();

            expect(mockReply._commentUpdateIpfsPath).to.not.exist;
            const filteredExpectedStates = cleanupStateArray(expectedStates);
            const filteredRecordedStates = cleanupStateArray(recordedStates);
            expect(filteredRecordedStates).to.deep.equal(filteredExpectedStates);
        });
        it(`updating state of reply is in correct order upon updating a reply that's loading from pageCids of its parent`, async () => {
            const subplebbit = await plebbit.getSubplebbit(subplebbitAddress);
            await subplebbit.update();
            const replyInPage = await findOrGenerateReplyUnderPostWithMultiplePages(subplebbit);

            const reply = await plebbit.createComment({ cid: replyInPage.cid });

            expect(reply.content).to.be.undefined;
            expect(reply.updatedAt).to.be.undefined;

            const expectedStates = [
                "fetching-ipfs", // fetching comment ipfs of reply
                "succeeded", // succeeded loading comment ipfs of reply
                "fetching-update-ipfs", // fetching comment update of reply by using pageCids of post
                "succeeded", // succeeded loading comment update of reply using pageCids of parent
                "fetching-subplebbit-ipns", // fetching subplebbit ipns
                "waiting-retry", // waiting for a new subplebbit update
                "fetching-subplebbit-ipns", // fetching subplebbit ipns
                "fetching-update-ipfs", // fetching comment update of reply by using page cids of parent
                "succeeded" // succeeded loading comment update of reply using page cids of parent
            ];
            const recordedStates = [];
            reply.on("updatingstatechange", (newState) => {
                recordedStates.push(newState);
            });

            await reply.update();
            mockReplyToUseParentPagesForUpdates(reply);
            expect(reply.content).to.be.undefined;
            expect(reply.updatedAt).to.be.undefined;
            await resolveWhenConditionIsTrue(reply, () => typeof reply.depth === "number");
            const nestedReply = await publishRandomReply(reply, plebbit);
            await waitTillReplyInParentPagesInstance(nestedReply, reply);
            await reply.stop();
            await nestedReply.stop();
            expect(reply.content).to.exist;
            expect(reply.updatedAt).to.be.a("number"); // should load a new comment update

            // Remove consecutive ["waiting-retry", "fetching-subplebbit-ipns"] entries
            const filteredExpectedStates = cleanupStateArray(expectedStates);
            const filteredRecordedStates = cleanupStateArray(recordedStates);

            const trimmedRecordedStates = filteredRecordedStates.slice(0, filteredExpectedStates.length);
            expect(trimmedRecordedStates).to.deep.equal(filteredExpectedStates);

            expect(filteredRecordedStates[filteredRecordedStates.length - 1]).to.equal("stopped");
        });
        it(`updating state of reply is set to failed if sub has an invalid Subplebbit record`, async () => {
            const sub = await plebbit.getSubplebbit(subplebbitAddress);
            const subInvalidRecord = { ...sub.toJSONIpfs(), updatedAt: 12345 + Math.round(Math.random() * 1000) }; //override updatedAt which will give us an invalid signature

            const replyCid = sub.posts.pages.hot.comments.find((post) => post.replies).replies.pages.best.comments[0].cid;
            const mockReply = await plebbit.createComment({ cid: replyCid });

            const recordedStates = [];
            mockReply.on("updatingstatechange", () => recordedStates.push(mockReply.updatingState));

            const createErrorPromise = () =>
                new Promise((resolve) =>
                    mockReply.once("error", (err) => {
                        if (err.details.gatewayToError["http://localhost:18080"].code === "ERR_SUBPLEBBIT_SIGNATURE_IS_INVALID") resolve();
                    })
                );
            await sub.update(); // need to update it so that we can mock it below
            await mockPlebbitToReturnSpecificSubplebbit(mockReply._plebbit, subplebbitAddress, subInvalidRecord);
            await mockReply.update();

            await createErrorPromise();

            await mockReply.stop();
            await sub.stop();
            expect(mockReply.updatedAt).to.be.undefined;

            const expectedUpdateStates = [
                "fetching-ipfs", // fetching comment ipfs of reply
                "succeeded", // succeeded loading comment ipfs of reply
                "fetching-subplebbit-ipns", // fetching subplebbit ipns from gateway
                "failed", // subplebbit ipfs record is invalid
                "stopped" // called post.stop()
            ];
            const filteredExpectedStates = cleanupStateArray(expectedUpdateStates);
            const filteredRecordedStates = cleanupStateArray(recordedStates);
            expect(filteredRecordedStates).to.deep.equal(filteredExpectedStates);
        });
    });
});

describe("comment.updatingState", async () => {
    // We're using Math CLI subplebbit because the default subplebbit may contain comments with ENS for author address
    // Which will change the expected states
    // We should probably add a test for state when a comment with ENS for author address is in pages

    it(`Add a test for updatingState with resolving-author-address`);
});
