import Plebbit from "../../../../dist/node/index.js";
import signers from "../../../fixtures/signers.js";
import {
    generateMockPost,
    mockRemotePlebbit,
    publishWithExpectedResult,
    mockGatewayPlebbit,
    describeSkipIfRpc
} from "../../../../dist/node/test/test-util.js";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);
const { expect, assert } = chai;

const subplebbitAddress = signers[0].address;

describeSkipIfRpc(`comment.clients.kuboRpcClients`, async () => {
    let plebbit, gatewayPlebbit;
    before(async () => {
        plebbit = await mockRemotePlebbit();
        gatewayPlebbit = await mockGatewayPlebbit();
    });
    it(`comment.clients.kuboRpcClients is undefined for gateway plebbit`, async () => {
        const mockPost = await generateMockPost(subplebbitAddress, gatewayPlebbit);
        expect(mockPost.clients.kuboRpcClients).to.be.undefined;
    });

    it(`comment.clients.kuboRpcClients[url] is stopped by default`, async () => {
        const mockPost = await generateMockPost(subplebbitAddress, plebbit);
        expect(Object.keys(mockPost.clients.kuboRpcClients).length).to.equal(1);
        expect(Object.values(mockPost.clients.kuboRpcClients)[0].state).to.equal("stopped");
    });

    it(`Correct order of kuboRpcClients state when updating a comment that was created with plebbit.createComment({cid})`, async () => {
        const sub = await plebbit.getSubplebbit(signers[0].address);

        const mockPost = await plebbit.createComment({ cid: sub.posts.pages.hot.comments[0].cid });

        const expectedStates = [
            "fetching-ipfs",
            "stopped",
            "fetching-subplebbit-ipns",
            "fetching-subplebbit-ipfs",
            "fetching-update-ipfs",
            "stopped"
        ];

        const actualStates = [];

        const kuboRpcUrl = Object.keys(mockPost.clients.kuboRpcClients)[0];

        mockPost.clients.kuboRpcClients[kuboRpcUrl].on("statechange", (newState) => actualStates.push(newState));

        await mockPost.update();
        await new Promise((resolve) => mockPost.on("update", () => typeof mockPost.upvoteCount === "number" && resolve()));
        await mockPost.stop();

        expect(actualStates).to.deep.equal(expectedStates);
    });

    it(`Correct order of kuboRpcClients state when updating a comment that was created with plebbit.getComment(cid)`, async () => {
        const sub = await plebbit.getSubplebbit(signers[0].address);

        const mockPost = await plebbit.getComment(sub.posts.pages.hot.comments[0].cid);

        const expectedStates = ["fetching-subplebbit-ipns", "fetching-subplebbit-ipfs", "fetching-update-ipfs", "stopped"];

        const actualStates = [];

        const kuboRpcUrl = Object.keys(mockPost.clients.kuboRpcClients)[0];

        mockPost.clients.kuboRpcClients[kuboRpcUrl].on("statechange", (newState) => actualStates.push(newState));

        await mockPost.update();
        await new Promise((resolve) => mockPost.once("update", resolve));
        await mockPost.stop();

        expect(actualStates).to.deep.equal(expectedStates);
    });

    it(`Correct order of kuboRpcClients state when publishing a comment (uncached)`, async () => {
        const mockPost = await generateMockPost(signers[0].address, plebbit);
        mockPost._getSubplebbitCache = () => undefined;
        const expectedStates = ["fetching-subplebbit-ipns", "fetching-subplebbit-ipfs", "stopped"];

        const actualStates = [];

        const kuboRpcUrl = Object.keys(mockPost.clients.kuboRpcClients)[0];

        mockPost.clients.kuboRpcClients[kuboRpcUrl].on("statechange", (newState) => actualStates.push(newState));

        await publishWithExpectedResult(mockPost, true);

        expect(actualStates).to.deep.equal(expectedStates);
    });

    it(`Correct order of kuboRpcClients state when publishing a comment (cached)`, async () => {
        const mockPost = await generateMockPost(signers[0].address, plebbit);

        const expectedStates = []; // Empty because we're using the cached subplebbit

        const actualStates = [];

        const kuboRpcUrl = Object.keys(mockPost.clients.kuboRpcClients)[0];

        mockPost.clients.kuboRpcClients[kuboRpcUrl].on("statechange", (newState) => actualStates.push(newState));

        await publishWithExpectedResult(mockPost, true);

        expect(actualStates).to.deep.equal(expectedStates);
    });
});
