import Plebbit from "../../../../dist/node/index.js";
import signers from "../../../fixtures/signers.js";
import {
    generateMockPost,
    mockRemotePlebbit,
    publishRandomPost,
    publishWithExpectedResult,
    mockGatewayPlebbit,
    itSkipIfRpc,
    itIfRpc,
    generatePostToAnswerMathQuestion
} from "../../../../dist/node/test/test-util.js";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);
const { expect, assert } = chai;

const subplebbitAddress = signers[0].address;
const mathCliSubplebbitAddress = signers[1].address;

describe(`comment.state`, async () => {
    let plebbit, comment;
    before(async () => {
        plebbit = await mockRemotePlebbit();
        comment = await generateMockPost(subplebbitAddress, plebbit);
    });

    it(`state is stopped by default`, async () => {
        expect(comment.state).to.equal("stopped");
    });

    it(`state changes to publishing after calling .publish()`, async () => {
        publishWithExpectedResult(comment, true);
        if (comment.publishingState !== "publishing")
            await new Promise((resolve) =>
                comment.once("statechange", (state) => {
                    if (state === "publishing") resolve();
                })
            );
    });

    it(`state changes to updating after calling .update()`, async () => {
        const tempComment = await plebbit.createComment({
            cid: (await plebbit.getSubplebbit(signers[0].address)).posts.pages.hot.comments[0].cid
        });
        await tempComment.update();
        expect(tempComment.state).to.equal("updating");
        await tempComment.stop();
    });
});

describe("comment.updatingState", async () => {
    let plebbit;
    before(async () => {
        plebbit = await mockRemotePlebbit();
    });

    it(`updatingState is stopped by default`, async () => {
        const mockPost = await generateMockPost(subplebbitAddress, plebbit);
        expect(mockPost.updatingState).to.equal("stopped");
    });

    // We're using Math CLI subplebbit because the default subplebbit may contain comments with ENS for author address
    // Which will change the expected states
    // We should probably add a test for state when a comment with ENS for author address is in pages

    itSkipIfRpc(`updating states is in correct order upon updating a comment with IPFS client`, async () => {
        const mockPost = await generatePostToAnswerMathQuestion({ subplebbitAddress: mathCliSubplebbitAddress }, plebbit);
        await publishWithExpectedResult(mockPost, true);
        const expectedStates = ["fetching-subplebbit-ipns", "fetching-subplebbit-ipfs", "fetching-update-ipfs", "succeeded", "stopped"];
        const recordedStates = [];
        mockPost.on("updatingstatechange", (newState) => recordedStates.push(newState));

        await mockPost.update();
        await new Promise((resolve) => mockPost.once("update", resolve));
        if (!mockPost.updatedAt) await new Promise((resolve) => mockPost.once("update", resolve));
        await mockPost.stop();

        expect(recordedStates.slice(recordedStates.length - expectedStates.length)).to.deep.equal(expectedStates);
    });

    itSkipIfRpc(`updating states is in correct order upon updating a comment with gateway`, async () => {
        const gatewayPlebbit = await mockGatewayPlebbit();
        const mockPost = await generatePostToAnswerMathQuestion({ subplebbitAddress: mathCliSubplebbitAddress }, gatewayPlebbit);
        await publishWithExpectedResult(mockPost, true);
        const expectedStates = ["fetching-subplebbit-ipns", "fetching-update-ipfs", "succeeded", "stopped"];
        const recordedStates = [];
        mockPost.on("updatingstatechange", (newState) => recordedStates.push(newState));

        await mockPost.update();

        await new Promise((resolve) => mockPost.once("update", resolve));
        await mockPost.stop();

        expect(recordedStates.slice(recordedStates.length - expectedStates.length)).to.deep.equal(expectedStates);
    });

    itIfRpc(`updating states is in correct order upon updating a comment with RPC`, async () => {
        const mockPost = await publishRandomPost(subplebbitAddress, plebbit, {}, true);
        const postToUpdate = await plebbit.createComment({ cid: mockPost.cid });
        const expectedStates = [
            "fetching-ipfs",
            "succeeded",
            "fetching-subplebbit-ipns",
            "fetching-subplebbit-ipfs",
            "fetching-update-ipfs",
            "succeeded",
            "stopped"
        ];
        const recordedStates = [];
        postToUpdate.on("updatingstatechange", (newState) => recordedStates.push(newState));

        await postToUpdate.update();

        await new Promise((resolve) => postToUpdate.once("update", resolve)); // CommentIpfs update
        await new Promise((resolve) => postToUpdate.once("update", resolve)); // CommentUpdate update
        await postToUpdate.stop();

        expect(recordedStates).to.deep.equal(expectedStates);
    });

    it(`Add a test for updatingState with resolving-author-address`);
});
