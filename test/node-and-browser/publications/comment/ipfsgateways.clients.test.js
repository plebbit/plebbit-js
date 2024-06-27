import Plebbit from "../../../../dist/node/index.js";
import signers from "../../../fixtures/signers.js";
import {
    generateMockPost,
    publishWithExpectedResult,
    isRpcFlagOn,
    mockGatewayPlebbit,
    mockRemotePlebbit
} from "../../../../dist/node/test/test-util.js";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);
const { expect, assert } = chai;

const subplebbitAddress = signers[0].address;

const describeSkipIfRpc = isRpcFlagOn() ? describe.skip : describe;

describeSkipIfRpc(`comment.clients.ipfsGateways`, async () => {
    let plebbit, gatewayPlebbit;
    before(async () => {
        plebbit = await mockRemotePlebbit();
        gatewayPlebbit = await mockGatewayPlebbit();
    });
    // All tests below use Plebbit instance that doesn't have ipfsClient
    it(`comment.clients.ipfsGateways[url] is stopped by default`, async () => {
        const mockPost = await generateMockPost(subplebbitAddress, gatewayPlebbit);
        expect(Object.keys(mockPost.clients.ipfsGateways).length).to.equal(1);
        expect(Object.values(mockPost.clients.ipfsGateways)[0].state).to.equal("stopped");
    });

    it(`Correct order of ipfsGateways state when updating a comment that was created with plebbit.createComment({cid})`, async () => {
        const sub = await gatewayPlebbit.getSubplebbit(signers[0].address);

        const mockPost = await gatewayPlebbit.createComment({ cid: sub.posts.pages.hot.comments[0].cid });

        const expectedStates = ["fetching-ipfs", "stopped", "fetching-subplebbit-ipns", "fetching-update-ipfs", "stopped"];

        const actualStates = [];

        const gatewayUrl = Object.keys(mockPost.clients.ipfsGateways)[0];

        mockPost.clients.ipfsGateways[gatewayUrl].on("statechange", (newState) => actualStates.push(newState));

        await mockPost.update();
        await new Promise((resolve) => mockPost.on("update", () => typeof mockPost.upvoteCount === "number" && resolve()));
        await mockPost.stop();

        expect(actualStates).to.deep.equal(expectedStates);
    });

    it(`Correct order of ipfsGateways state when updating a comment that was created with plebbit.getComment(cid)`, async () => {
        const sub = await gatewayPlebbit.getSubplebbit(signers[0].address);

        const mockPost = await gatewayPlebbit.getComment(sub.posts.pages.hot.comments[0].cid);

        const expectedStates = ["fetching-subplebbit-ipns", "fetching-update-ipfs", "stopped"];

        const actualStates = [];

        const gatewayUrl = Object.keys(mockPost.clients.ipfsGateways)[0];

        mockPost.clients.ipfsGateways[gatewayUrl].on("statechange", (newState) => actualStates.push(newState));

        await mockPost.update();
        await new Promise((resolve) => mockPost.once("update", resolve));
        await mockPost.stop();

        expect(actualStates).to.deep.equal(expectedStates);
    });

    it(`Correct order of ipfsGateways state when publishing a comment (uncached subplebbit)`, async () => {
        const mockPost = await generateMockPost(signers[0].address, gatewayPlebbit);

        mockPost._getSubplebbitCache = () => undefined;

        const expectedStates = ["fetching-subplebbit-ipns", "stopped"];

        const actualStates = [];

        const gatewayUrl = Object.keys(mockPost.clients.ipfsGateways)[0];
        mockPost.clients.ipfsGateways[gatewayUrl].on("statechange", (newState) => actualStates.push(newState));

        await publishWithExpectedResult(mockPost, true);

        expect(actualStates).to.deep.equal(expectedStates);
    });

    it(`Correct order of ipfsGateways state when publishing a comment (cached subplebbit)`, async () => {
        const mockPost = await generateMockPost(signers[0].address, gatewayPlebbit);

        const expectedStates = []; // Should be empty since we're using cached subplebbit

        const actualStates = [];

        const gatewayUrl = Object.keys(mockPost.clients.ipfsGateways)[0];
        mockPost.clients.ipfsGateways[gatewayUrl].on("statechange", (newState) => actualStates.push(newState));

        await publishWithExpectedResult(mockPost, true);

        expect(actualStates).to.deep.equal(expectedStates);
    });
});
