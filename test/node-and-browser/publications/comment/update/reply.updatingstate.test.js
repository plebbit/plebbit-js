import { expect } from "chai";
import signers from "../../../../fixtures/signers.js";
import {
    findOrGenerateReplyUnderPostWithMultiplePages,
    mockPlebbitToReturnSpecificSubplebbit,
    resolveWhenConditionIsTrue,
    publishRandomReply,
    waitTillReplyInParentPagesInstance,
    mockReplyToUseParentPagesForUpdates,
    describeSkipIfRpc,
    getRemotePlebbitConfigs
} from "../../../../../dist/node/test/test-util.js";
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
            plebbit = await config.plebbitInstancePromise();
        });

        afterEach(async () => {
            await plebbit.destroy();
        });

        it(`Updating states is in correct upon updating a reply that's included in preloaded pages of its parent`, async () => {
            const sub = await plebbit.getSubplebbit(subplebbitAddress);
            // we don't want domain name in author addrses so its resolving doesn't get included in expected states
            const preloadedReplyCid = sub.posts.pages.hot.comments
                .find((post) => post.replies)
                .replies.pages.best.comments.find((reply) => !reply.author.address.includes(".")).cid;
            expect(preloadedReplyCid).to.exist;
            const mockReply = await plebbit.createComment({ cid: preloadedReplyCid });
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
            const updatingMockReply = plebbit._updatingComments[mockReply.cid];
            expect(updatingMockReply._clientsManager._parentCommentCidsAlreadyLoaded.size).to.equal(0);
            await mockReply.stop();

            expect(mockReply._commentUpdateIpfsPath).to.not.exist;
            const filteredExpectedStates = cleanupStateArray(expectedStates);
            const filteredRecordedStates = cleanupStateArray(recordedStates);
            expect(filteredRecordedStates).to.deep.equal(
                filteredExpectedStates,
                "recorded states: " + recordedStates.join(", ") + "Author is " + JSON.stringify(mockReply.author)
            );
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

        // TODO enable this test and fix its flakiness
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
            const updatingMockReply = plebbit._updatingComments[reply.cid];
            const numOfUpdates = recordedStates.filter((state) => state === "succeeded").length - 1;
            expect(updatingMockReply._clientsManager._parentCommentCidsAlreadyLoaded.size).to.be.greaterThanOrEqual(numOfUpdates);
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

        // TODO enable this test and fix its flakiness
        it.skip(`updating state of reply is in correct order upon updating a reply that's loading from pageCids of its parent`, async () => {
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

getRemotePlebbitConfigs().map((config) => {
    describeSkipIfRpc(`reply.updatingState - ${config.name}`, async () => {
        let plebbit;
        before(async () => {
            plebbit = await config.plebbitInstancePromise();
        });

        after(async () => {
            await plebbit.destroy();
        });

        it(`the order of state-event-statechange is correct when we get a new update from reply`, async () => {
            const sub = await plebbit.getSubplebbit(subplebbitAddress);
            const replyCid = sub.posts.pages.hot.comments.find((post) => post.replies).replies.pages.best.comments[0].cid;
            const mockReply = await plebbit.createComment({ cid: replyCid });
            expect(mockReply.updatedAt).to.be.undefined;
            const recordedStates = [];
            mockReply.on("updatingstatechange", (newState) => recordedStates.push(newState));

            const commentIpfsUpdate = new Promise((resolve, reject) => {
                mockReply.once("update", () => {
                    if (mockReply.updatingState !== "succeeded") reject("updating state should be succeeded after getting comment ipfs");
                    if (recordedStates.length === 0) reject("should have emitted an event");
                    if (recordedStates[recordedStates.length - 1] === "succeeded") reject("should not emit an event just yet");
                    resolve();
                });
            });

            const commentUpdatePromise = new Promise((resolve, reject) => {
                mockReply.on("update", () => {
                    if (!mockReply.updatedAt) return;
                    if (mockReply.updatingState !== "succeeded") reject("updating state should be succeeded after getting comment ipfs");
                    if (recordedStates.length === 0) reject("should have emitted an event");
                    if (recordedStates[recordedStates.length - 1] === "succeeded") reject("should not emit an event just yet");
                    resolve();
                });
            });

            await mockReply.update();
            await commentIpfsUpdate;
            await commentUpdatePromise;

            await mockReply.stop();
        });

        it(`the order of state-event-statechange is correct when we retrieve a reply by loading it from its parent pageCids`, async () => {
            const subplebbit = await plebbit.getSubplebbit(subplebbitAddress);
            await subplebbit.update();
            const replyInPage = await findOrGenerateReplyUnderPostWithMultiplePages(subplebbit);

            const reply = await plebbit.createComment({ cid: replyInPage.cid });

            expect(reply.content).to.be.undefined;
            expect(reply.updatedAt).to.be.undefined;

            const recordedStates = [];
            reply.on("updatingstatechange", (newState) => recordedStates.push(newState));

            const commentUpdatePromise = new Promise((resolve, reject) => {
                reply.on("update", () => {
                    if (!reply.updatedAt) return;
                    if (reply.updatingState !== "succeeded") reject("updating state should be succeeded after getting comment ipfs");
                    if (recordedStates.length === 0) reject("should have emitted an event");
                    if (recordedStates[recordedStates.length - 1] === "succeeded") reject("should not emit an event just yet");
                    resolve();
                });
            });

            await reply.update();
            mockReplyToUseParentPagesForUpdates(reply);
            expect(reply.content).to.be.undefined;
            expect(reply.updatedAt).to.be.undefined;
            await commentUpdatePromise;
            await reply.stop();
            expect(reply.updatedAt).to.be.a("number"); // should load a new comment update
        });
    });
});
