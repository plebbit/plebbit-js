import signers from "../../../fixtures/signers.js";
import {
    generateMockPost,
    mockRemotePlebbit,
    publishRandomPost,
    publishWithExpectedResult,
    mockGatewayPlebbit,
    itSkipIfRpc,
    itIfRpc,
    mockCommentToReturnSpecificCommentUpdate,
    mockPlebbitToReturnSpecificSubplebbit,
    generatePostToAnswerMathQuestion,
    mockRpcRemotePlebbit,
    createCommentUpdateWithInvalidSignature,
    waitTillPostInSubplebbitPages,
    mockPlebbitNoDataPathWithOnlyKuboClient,
    mockCommentToNotUsePagesForUpdates
} from "../../../../dist/node/test/test-util.js";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);
const { expect, assert } = chai;

const subplebbitAddress = signers[0].address;
const mathCliSubplebbitAddress = signers[1].address;

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
        mockCommentToNotUsePagesForUpdates(mockPost); // we want to force it to fetch from the network
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
        mockCommentToNotUsePagesForUpdates(mockPost);

        await new Promise((resolve) => mockPost.once("update", resolve));
        await mockPost.stop();

        expect(recordedStates.slice(recordedStates.length - expectedStates.length)).to.deep.equal(expectedStates);
    });

    itIfRpc(`updating states is in correct order upon updating a comment with RPC`, async () => {
        const plebbit = await mockRpcRemotePlebbit();
        const mockPost = await publishRandomPost(subplebbitAddress, plebbit);
        await waitTillPostInSubplebbitPages(mockPost, plebbit);
        const postToUpdate = await plebbit.createComment({ cid: mockPost.cid });

        const recordedStates = [];
        postToUpdate.on("updatingstatechange", (newState) => recordedStates.push(newState));

        await postToUpdate.update();

        await new Promise((resolve) => postToUpdate.once("update", resolve)); // CommentIpfs update
        await new Promise((resolve) => postToUpdate.once("update", resolve)); // CommentUpdate update
        await postToUpdate.stop();

        expect(recordedStates.slice(0, 4)).to.deep.equal([
            "fetching-ipfs",
            "succeeded",
            "fetching-subplebbit-ipns",
            "fetching-subplebbit-ipfs"
        ]);

        if (recordedStates.length === 6)
            // the rpc server did not fetch update-ipfs, it got a new CommentUpdate from subplebbit.posts
            expect(recordedStates.slice(4)).to.deep.equal(["succeeded", "stopped"]);
        else expect(recordedStates.slice(4)).to.deep.equal(["fetching-update-ipfs", "succeeded", "stopped"]);
    });

    it(`Add a test for updatingState with resolving-author-address`);

    itSkipIfRpc(`updating state is set to failed if we encounter an invalid CommentUpdate record`, async () => {
        const sub = await plebbit.getSubplebbit(subplebbitAddress);
        const commentUpdateWithInvalidSignatureJson = await createCommentUpdateWithInvalidSignature(sub.posts.pages.hot.comments[0].cid);
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

        await mockCommentToReturnSpecificCommentUpdate(createdComment, JSON.stringify(commentUpdateWithInvalidSignatureJson));

        await createErrorPromise();

        await publishRandomPost(subplebbitAddress, plebbit); // force subplebbit to publish a new update which will increase loading attempts
        await createErrorPromise();

        await createdComment.stop();

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
    it(`updating state is set to failed if sub has an invalid Subplebbit record`, async () => {
        const plebbit = await mockPlebbitNoDataPathWithOnlyKuboClient();
        const sub = await plebbit.getSubplebbit(subplebbitAddress);
        const subInvalidRecord = { ...sub.toJSONIpfs(), updatedAt: 12345 + Math.round(Math.random() * 1000) }; //override updatedAt which will give us an invalid signature
        const createdComment = await plebbit.createComment({
            cid: sub.posts.pages.hot.comments[0].cid
        });

        const updatingStates = [];
        createdComment.on("updatingstatechange", () => updatingStates.push(createdComment.updatingState));

        const createErrorPromise = () =>
            new Promise((resolve) =>
                createdComment.once("error", (err) => {
                    if (err.code === "ERR_SUBPLEBBIT_SIGNATURE_IS_INVALID") resolve();
                })
            );
        await sub.update(); // need to update it so that we can mock it below
        await new Promise((resolve) => setTimeout(resolve, 500));
        await mockPlebbitToReturnSpecificSubplebbit(createdComment._plebbit, subplebbitAddress, subInvalidRecord);
        await createdComment.update();

        await createErrorPromise();

        await createdComment.stop();
        await sub.stop();
        expect(createdComment.updatedAt).to.be.undefined;

        const expectedUpdateStates = [
            "fetching-ipfs",
            "succeeded",
            "fetching-subplebbit-ipns",
            "fetching-subplebbit-ipfs",
            "failed",
            "stopped"
        ];
        expect(updatingStates).to.deep.equal(expectedUpdateStates);
    });
});
