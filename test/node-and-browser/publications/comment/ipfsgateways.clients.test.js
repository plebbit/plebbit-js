import { expect } from "chai";
import signers from "../../../fixtures/signers.js";
import {
    generateMockPost,
    publishWithExpectedResult,
    describeSkipIfRpc,
    mockGatewayPlebbit,
    mockCommentToNotUsePagesForUpdates,
    createCommentUpdateWithInvalidSignature,
    mockRemotePlebbit,
    resolveWhenConditionIsTrue,
    mockPlebbitToReturnSpecificSubplebbit,
    mockPostToReturnSpecificCommentUpdate
} from "../../../../dist/node/test/test-util.js";
const subplebbitAddress = signers[0].address;

describeSkipIfRpc(`comment.clients.ipfsGateways`, async () => {
    let plebbit, gatewayPlebbit;
    before(async () => {
        plebbit = await mockRemotePlebbit();
        gatewayPlebbit = await mockGatewayPlebbit();
    });

    after(async () => {
        await plebbit.destroy();
        await gatewayPlebbit.destroy();
    });
    // All tests below use Plebbit instance that doesn't have clients.kuboRpcClients
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
        mockCommentToNotUsePagesForUpdates(mockPost);
        await resolveWhenConditionIsTrue(mockPost, () => typeof mockPost.upvoteCount === "number");
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
        mockCommentToNotUsePagesForUpdates(mockPost);
        await resolveWhenConditionIsTrue(mockPost, () => typeof mockPost.upvoteCount === "number");
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

    it(`Correct order of ipfs gateway clients state when we update a comment but its subplebbit is not publishing new updates`, async () => {
        const gatewayPlebbit = await mockGatewayPlebbit();

        const sub = await gatewayPlebbit.createSubplebbit({ address: signers[0].address });

        const updatePromise1 = new Promise((resolve) => sub.once("update", resolve));
        await sub.update();
        // now plebbit._updatingSubplebbits will be defined
        await updatePromise1;
        const subRecord = JSON.parse(JSON.stringify(sub.toJSONIpfs()));

        const updatePromise2 = new Promise((resolve) => sub.once("update", resolve));
        await mockPlebbitToReturnSpecificSubplebbit(gatewayPlebbit, sub.address, subRecord);
        await updatePromise2;
        const mockPost = await gatewayPlebbit.createComment({ cid: sub.posts.pages.hot.comments[0].cid });

        const recordedStates = [];

        const gatewayUrl = Object.keys(mockPost.clients.ipfsGateways)[0];

        mockPost.clients.ipfsGateways[gatewayUrl].on("statechange", (newState) => recordedStates.push(newState));

        await mockPost.update();
        mockCommentToNotUsePagesForUpdates(mockPost);

        await resolveWhenConditionIsTrue(mockPost, () => typeof mockPost.updatedAt === "number");

        await new Promise((resolve) => setTimeout(resolve, gatewayPlebbit.updateInterval * 4));

        await sub.stop();
        await mockPost.stop();

        const expectedFirstStates = ["fetching-ipfs", "stopped", "fetching-subplebbit-ipns", "fetching-update-ipfs", "stopped"]; // for comment ipfs and comment update
        expect(recordedStates.slice(0, expectedFirstStates.length)).to.deep.equal(expectedFirstStates);

        const noNewUpdateStates = recordedStates.slice(expectedFirstStates.length, recordedStates.length); // should be just 'fetching-ipns' and 'succeeded

        // the rest should be just ["fetching-subplebbit-ipns", "stopped"]
        // because it can't find a new record
        for (let i = 0; i < noNewUpdateStates.length; i += 2) {
            expect(noNewUpdateStates[i]).to.equal("fetching-subplebbit-ipns");
            expect(noNewUpdateStates[i + 1]).to.equal("stopped");
        }
    });

    it(`Correct order of ipfs gateway states when we update a comment but its commentupdate is an invalid record (bad signature/schema/etc)`, async () => {
        const sub = await gatewayPlebbit.getSubplebbit(signers[0].address);

        const commentUpdateWithInvalidSignatureJson = await createCommentUpdateWithInvalidSignature(sub.posts.pages.hot.comments[0].cid);

        const createdComment = await gatewayPlebbit.createComment({
            cid: commentUpdateWithInvalidSignatureJson.cid
        });

        const ipfsGatewayStates = [];
        const kuboGatewayUrl = Object.keys(createdComment.clients.ipfsGateways)[0];
        createdComment.clients.ipfsGateways[kuboGatewayUrl].on("statechange", (state) => ipfsGatewayStates.push(state));

        const createErrorPromise = () => new Promise((resolve) => createdComment.once("error", resolve));
        await createdComment.update();

        mockPostToReturnSpecificCommentUpdate(createdComment, JSON.stringify(commentUpdateWithInvalidSignatureJson));

        await createErrorPromise();

        await new Promise((resolve) => setTimeout(resolve, plebbit.updateInterval * 3));
        await createdComment.stop();

        expect(createdComment.updatedAt).to.be.undefined; // should not accept the comment update
        const expectedIpfsGatewayStates = [
            "fetching-ipfs", // fetching comment-ipfs
            "stopped",
            "fetching-subplebbit-ipns", // fetching subplebbit + comment update
            "fetching-update-ipfs",
            "stopped"
        ];

        expect(ipfsGatewayStates.slice(0, expectedIpfsGatewayStates.length)).to.deep.equal(expectedIpfsGatewayStates);

        const restOfIpfsStates = ipfsGatewayStates.slice(expectedIpfsGatewayStates.length, ipfsGatewayStates.length);
        for (let i = 0; i < restOfIpfsStates.length; i += 2) {
            if (restOfIpfsStates[i] === "fetching-subplebbit-ipns" && restOfIpfsStates[i + 1] === "fetching-subplebbit-ipfs") {
                expect(restOfIpfsStates[i + 2]).to.equal("fetching-update-ipfs"); // this should be the second attempt to load invalid CommentUpdate
                expect(restOfIpfsStates[i + 3]).to.equal("stopped");
            }
        }
        expect(ipfsGatewayStates[ipfsGatewayStates.length - 1]).to.equal("stopped");
    });
});
