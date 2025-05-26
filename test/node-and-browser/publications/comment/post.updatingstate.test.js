import { expect } from "chai";
import signers from "../../../fixtures/signers.js";
import {
    publishRandomPost,
    mockPostToReturnSpecificCommentUpdate,
    mockPlebbitToReturnSpecificSubplebbit,
    createCommentUpdateWithInvalidSignature,
    mockPlebbitNoDataPathWithOnlyKuboClient,
    mockCommentToNotUsePagesForUpdates,
    resolveWhenConditionIsTrue,
    describeSkipIfRpc,
    getRemotePlebbitConfigs,
    addStringToIpfs
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

getRemotePlebbitConfigs().map((config) => {
    describeSkipIfRpc(`post.updatingState - ${config.name}`, async () => {
        let plebbit;
        before(async () => {
            plebbit = await config.plebbitInstancePromise();
        });

        after(async () => {
            await plebbit.destroy();
        });

        it(`post.updatingState defaults to stopped after plebbit.createComment()`, async () => {
            const comment = await plebbit.createComment({ cid: "QmUrxBiaphUt3K6qDs2JspQJAgm34sKQaa5YaRmyAWXN4D" });
            expect(comment.updatingState).to.equal("stopped");
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

        it(`the order of state-event-statechange is correct when we get an unretriable error from post`, async () => {
            const cidOfInvalidJson = await addStringToIpfs("<html>something");
            const createdComment = await plebbit.createComment({ cid: cidOfInvalidJson });

            const updatingStates = [];
            createdComment.on("updatingstatechange", () => updatingStates.push(createdComment.updatingState));
            const errors = [];
            createdComment.on("error", (err) => errors.push(err));

            const commentErrorPromise = new Promise((resolve, reject) => {
                createdComment.once("error", (err) => {
                    if (err.code !== "ERR_INVALID_JSON") reject("error should be ERR_INVALID_JSON");
                    if (createdComment.updatingState !== "failed") reject("updating state should be failed after getting error");
                    if (updatingStates.length === 0) reject("should have emitted an event");
                    if (updatingStates[updatingStates.length - 1] === "failed") reject("should not emit an event just yet");
                    resolve();
                });
            });

            // should stop updating by itself because of the critical error

            await createdComment.update();
            await commentErrorPromise;

            expect(createdComment.depth).to.be.undefined; // Make sure it did not use the props from the invalid CommentIpfs
            expect(createdComment.state).to.equal("stopped");
            expect(createdComment.updatingState).to.equal("failed");
        });
    });
});

describe("comment.updatingState", async () => {
    // We're using Math CLI subplebbit because the default subplebbit may contain comments with ENS for author address
    // Which will change the expected states
    // We should probably add a test for state when a comment with ENS for author address is in pages

    it(`Add a test for updatingState with resolving-author-address`);
});
