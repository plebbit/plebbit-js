import signers from "../../../fixtures/signers.js";
import {
    generateMockPost,
    publishRandomPost,
    publishWithExpectedResult,
    describeIfRpc,
    mockRpcRemotePlebbit,
    waitTillPostInSubplebbitPages
} from "../../../../dist/node/test/test-util.js";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);
const { expect, assert } = chai;

const subplebbitAddress = signers[0].address;

describeIfRpc(`comment.clients.plebbitRpcClients`, async () => {
    let plebbit;
    before(async () => {
        plebbit = await mockRpcRemotePlebbit();
    });

    it(`Correct order of comment.clients.plebbitRpcClients states when publishing to a sub with challenge`, async () => {
        const mathCliSubplebbitAddress = signers[1].address;

        await plebbit.getSubplebbit(mathCliSubplebbitAddress); // Do this to cache subplebbit so we won't get fetching-subplebbit-ipns

        const rpcUrl = Object.keys(plebbit.clients.plebbitRpcClients)[0];
        const mockPost = await generateMockPost(mathCliSubplebbitAddress, plebbit);
        mockPost.removeAllListeners();

        const expectedStates = [
            "subscribing-pubsub",
            "publishing-challenge-request",
            "waiting-challenge",
            "waiting-challenge-answers",
            "publishing-challenge-answer",
            "waiting-challenge-verification",
            "stopped"
        ];

        const actualStates = [];

        mockPost.clients.plebbitRpcClients[rpcUrl].on("statechange", (newState) => actualStates.push(newState));

        mockPost.once("challenge", async (challengeMsg) => {
            await mockPost.publishChallengeAnswers(["2"]); // hardcode answer here
        });

        await publishWithExpectedResult(mockPost, true);

        expect(actualStates).to.deep.equal(expectedStates);
    });

    it(`Correct order of comment.clients.plebbitRpcClients states when updating a comment`, async () => {
        const mockPost = await publishRandomPost(subplebbitAddress, plebbit);
        await waitTillPostInSubplebbitPages(mockPost, plebbit);
        const postToUpdate = await plebbit.createComment({ cid: mockPost.cid });

        const recordedStates = [];
        const currentRpcUrl = Object.keys(plebbit.clients.plebbitRpcClients)[0];
        postToUpdate.clients.plebbitRpcClients[currentRpcUrl].on("statechange", (newState) => recordedStates.push(newState));

        await postToUpdate.update();

        await new Promise((resolve) => postToUpdate.once("update", resolve)); // CommentIpfs update
        await new Promise((resolve) => postToUpdate.once("update", resolve)); // CommentUpdate update
        await postToUpdate.stop();

        expect(postToUpdate.depth).to.be.a("number");
        expect(postToUpdate.updatedAt).to.be.a("number");

        if (recordedStates.length === 2) expect(recordedStates).to.deep.equal(["fetching-ipfs", "stopped"]);
        else {
            expect(recordedStates.slice(0, 4)).to.deep.equal([
                "fetching-ipfs",
                "stopped",
                "fetching-subplebbit-ipns",
                "fetching-subplebbit-ipfs"
            ]);

            if (recordedStates.length === 5)
                // the rpc server did not fetch update-ipfs
                expect(recordedStates.slice(4)).to.deep.equal(["stopped"]);
            else expect(recordedStates.slice(4)).to.deep.equal(["fetching-update-ipfs", "stopped"]);
        }
    });
});
