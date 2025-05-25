import { expect } from "chai";
import signers from "../../../fixtures/signers.js";
import {
    generateMockPost,
    publishWithExpectedResult,
    mockRemotePlebbit,
    mockGatewayPlebbit,
    generatePostToAnswerMathQuestion,
    itSkipIfRpc,
    mockPlebbitNoDataPathWithOnlyKuboClient
} from "../../../../dist/node/test/test-util.js";
const subplebbitAddress = signers[0].address;
const mathCliSubplebbitAddress = signers[1].address;

describe(`comment.publishingState`, async () => {
    it(`publishingState is stopped by default`, async () => {
        const plebbit = await mockPlebbitNoDataPathWithOnlyKuboClient();
        const comment = await generateMockPost(subplebbitAddress, plebbit);
        expect(comment.publishingState).to.equal("stopped");
        await plebbit.destroy();
    });

    it(`comment.publishingState stays as stopped after calling comment.update() - IPFS client`, async () => {
        const plebbit = await mockPlebbitNoDataPathWithOnlyKuboClient();
        const sub = await plebbit.getSubplebbit(subplebbitAddress);
        const commentCid = sub.posts.pages.hot.comments[0].cid;
        const comment = await plebbit.createComment({ cid: commentCid });
        expect(comment.publishingState).to.equal("stopped");
        comment.on("publishingstatechange", (newState) => {
            if (newState !== "stopped") expect.fail("Should not change publishing state");
        });
        await comment.update();
        await new Promise((resolve) => comment.once("update", resolve)); // comment ipfs
        await new Promise((resolve) => comment.once("update", resolve)); // comment update
        await comment.stop();
        await plebbit.destroy();
    });

    it(`comment.publishingState stays as stopped after calling comment.update() - IPFS Gateway`, async () => {
        const plebbit = await mockGatewayPlebbit();
        const sub = await plebbit.getSubplebbit(subplebbitAddress);
        const commentCid = sub.posts.pages.hot.comments[0].cid;
        const comment = await plebbit.createComment({ cid: commentCid });
        expect(comment.publishingState).to.equal("stopped");
        comment.on("publishingstatechange", (newState) => {
            if (newState !== "stopped") expect.fail("Should not change publishing state");
        });
        await comment.update();
        await new Promise((resolve) => comment.once("update", resolve)); // comment ipfs
        await new Promise((resolve) => comment.once("update", resolve)); // comment update
        await comment.stop();
        await plebbit.destroy();
    });

    itSkipIfRpc(`publishing states is in correct order upon publishing a comment with IPFS client (uncached)`, async () => {
        const plebbit = await mockPlebbitNoDataPathWithOnlyKuboClient();
        const expectedStates = [
            "fetching-subplebbit-ipns",
            "fetching-subplebbit-ipfs",
            "publishing-challenge-request",
            "waiting-challenge",
            "waiting-challenge-answers",
            "publishing-challenge-answer",
            "waiting-challenge-verification",
            "succeeded"
        ];
        const recordedStates = [];
        const mockPost = await generatePostToAnswerMathQuestion({ subplebbitAddress: mathCliSubplebbitAddress }, plebbit);
        mockPost._getSubplebbitCache = () => undefined;

        mockPost.on("publishingstatechange", (newState) => recordedStates.push(newState));

        await publishWithExpectedResult(mockPost, true);

        expect(recordedStates).to.deep.equal(expectedStates);
        await plebbit.destroy();
    });

    itSkipIfRpc(`publishing states is in correct order upon publishing a comment with IPFS client (cached)`, async () => {
        const plebbit = await mockPlebbitNoDataPathWithOnlyKuboClient();
        const expectedStates = [
            "publishing-challenge-request",
            "waiting-challenge",
            "waiting-challenge-answers",
            "publishing-challenge-answer",
            "waiting-challenge-verification",
            "succeeded"
        ];
        const recordedStates = [];
        const mathCliSubplebbitAddress = signers[1].address;
        await plebbit.getSubplebbit(mathCliSubplebbitAddress); // address of math cli, we fetch it here to make sure it's cached
        const mockPost = await generatePostToAnswerMathQuestion({ subplebbitAddress: mathCliSubplebbitAddress }, plebbit);

        mockPost.on("publishingstatechange", (newState) => recordedStates.push(newState));

        await publishWithExpectedResult(mockPost, true);

        expect(recordedStates).to.deep.equal(expectedStates);
        await plebbit.destroy();
    });

    itSkipIfRpc(`publishing states is in correct order upon publishing a comment to plebbit.eth with IPFS client (uncached)`, async () => {
        const plebbit = await mockPlebbitNoDataPathWithOnlyKuboClient();
        const expectedStates = [
            "resolving-subplebbit-address",
            "fetching-subplebbit-ipns",
            "fetching-subplebbit-ipfs",
            "publishing-challenge-request",
            "waiting-challenge",
            "succeeded"
        ];
        const recordedStates = [];
        const mockPost = await generateMockPost("plebbit.eth", plebbit);
        mockPost._getSubplebbitCache = () => undefined;

        mockPost.on("publishingstatechange", (newState) => recordedStates.push(newState));

        await publishWithExpectedResult(mockPost, true);

        expect(recordedStates).to.deep.equal(expectedStates);
        await plebbit.destroy();
    });

    itSkipIfRpc(`publishing states is in correct order upon publishing a comment with gateway (cached)`, async () => {
        const gatewayPlebbit = await mockGatewayPlebbit();
        const expectedStates = [
            "publishing-challenge-request",
            "waiting-challenge",
            "waiting-challenge-answers",
            "publishing-challenge-answer",
            "waiting-challenge-verification",
            "succeeded"
        ];
        const recordedStates = [];
        await gatewayPlebbit.getSubplebbit(mathCliSubplebbitAddress); // Make sure it's cached
        const mockPost = await generatePostToAnswerMathQuestion({ subplebbitAddress: mathCliSubplebbitAddress }, gatewayPlebbit);

        mockPost.on("publishingstatechange", (newState) => recordedStates.push(newState));

        await publishWithExpectedResult(mockPost, true);

        expect(recordedStates).to.deep.equal(expectedStates);
        await gatewayPlebbit.destroy();
    });

    itSkipIfRpc(`publishing states is in correct order upon publishing a comment with gateway (uncached)`, async () => {
        const gatewayPlebbit = await mockGatewayPlebbit();
        const expectedStates = [
            "fetching-subplebbit-ipns",
            "publishing-challenge-request",
            "waiting-challenge",
            "waiting-challenge-answers",
            "publishing-challenge-answer",
            "waiting-challenge-verification",
            "succeeded"
        ];
        const recordedStates = [];
        const mockPost = await generatePostToAnswerMathQuestion({ subplebbitAddress: mathCliSubplebbitAddress }, gatewayPlebbit);
        mockPost._getSubplebbitCache = () => undefined;

        mockPost.on("publishingstatechange", (newState) => recordedStates.push(newState));

        await publishWithExpectedResult(mockPost, true);

        expect(recordedStates).to.deep.equal(expectedStates);
        await gatewayPlebbit.destroy();
    });

    it(`comment.publishingState = 'failed' if user provide incorrect answer`, async () => {
        const plebbit = await mockRemotePlebbit();
        const mockPost = await generateMockPost(mathCliSubplebbitAddress, plebbit);
        mockPost.removeAllListeners("challenge");

        mockPost.once("challenge", async (challengeMsg) => {
            expect(challengeMsg?.challenges[0]?.challenge).to.be.a("string");
            await mockPost.publishChallengeAnswers(["12345"]); // Wrong answer here
        });

        await publishWithExpectedResult(mockPost, false);

        expect(mockPost.publishingState).to.equal("failed");
        await mockPost.stop();
        await plebbit.destroy();
    });

    itSkipIfRpc(`comment.publishingState = 'failed' if pubsub provider is down`, async () => {
        const offlinePubsubUrl = "http://localhost:23425";
        const offlinePubsubPlebbit = await mockPlebbitNoDataPathWithOnlyKuboClient({
            pubsubKuboRpcClientsOptions: [offlinePubsubUrl]
        });
        offlinePubsubPlebbit.on("error", () => {});
        const mockPost = await generateMockPost(signers[1].address, offlinePubsubPlebbit);

        try {
            await mockPost.publish();
            expect.fail("Should have thrown");
        } catch (e) {
            expect(e.code).to.equal("ERR_ALL_PUBSUB_PROVIDERS_THROW_ERRORS");
        }

        expect(mockPost.publishingState).to.equal("failed");
        expect(mockPost.clients.pubsubKuboRpcClients[offlinePubsubUrl].state).to.equal("stopped");
        await offlinePubsubPlebbit.destroy();
    });
});
