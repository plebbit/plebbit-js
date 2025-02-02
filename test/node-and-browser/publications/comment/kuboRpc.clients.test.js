import signers from "../../../fixtures/signers.js";
import {
    generateMockPost,
    mockRemotePlebbit,
    mockCommentToReturnSpecificCommentUpdate,
    publishWithExpectedResult,
    mockGatewayPlebbit,
    createCommentUpdateWithInvalidSignature,
    describeSkipIfRpc,
    resolveWhenConditionIsTrue,
    mockPlebbitNoDataPathWithOnlyKuboClient
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
        await resolveWhenConditionIsTrue(mockPost, () => typeof mockPost.upvoteCount === "number");
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

    it(`Correct order of ipfs clients state when we update a comment but its subplebbit is not publishing new subplebbit records`, async () => {
        const customPlebbit = await mockPlebbitNoDataPathWithOnlyKuboClient();

        const sub = await customPlebbit.createSubplebbit({ address: signers[0].address });

        // now plebbit._updatingSubplebbits will be defined

        const updatePromise = new Promise((resolve) => sub.once("update", resolve));
        await sub.update();
        await updatePromise;

        const updatingSubInstance = customPlebbit._updatingSubplebbits[sub.address];

        updatingSubInstance._clientsManager.resolveIpnsToCidP2P = () => sub.updateCid; // stop it from loading new IPNS

        const mockPost = await customPlebbit.createComment({ cid: sub.posts.pages.hot.comments[0].cid });

        const recordedStates = [];

        const kuboRpcUrl = Object.keys(mockPost.clients.kuboRpcClients)[0];

        mockPost.clients.kuboRpcClients[kuboRpcUrl].on("statechange", (newState) => recordedStates.push(newState));

        await mockPost.update();

        await resolveWhenConditionIsTrue(mockPost, () => typeof mockPost.updatedAt === "number");

        await new Promise((resolve) => setTimeout(resolve, customPlebbit.updateInterval * 4));

        await mockPost.stop();

        const expectedFirstStates = ["fetching-ipfs", "stopped", "fetching-update-ipfs", "stopped"]; // for comment ipfs and comment update
        expect(recordedStates.slice(0, expectedFirstStates.length)).to.deep.equal(expectedFirstStates);

        const noNewUpdateStates = recordedStates.slice(expectedFirstStates.length, recordedStates.length); // should be just 'fetching-ipns' and 'succeeded

        // the rest should be just ["fetching-subplebbit-ipns", "stopped"]
        // because it can't find a new record
        for (let i = 0; i < noNewUpdateStates.length; i += 2) {
            expect(noNewUpdateStates[i]).to.equal("fetching-subplebbit-ipns");
            expect(noNewUpdateStates[i + 1]).to.equal("stopped");
        }

        await sub.stop();
    });

    it(`Correct order of kubo rpc clients when we update a comment but its commentupdate is an invalid record (bad signature/schema/etc)`, async () => {
        const sub = await plebbit.getSubplebbit(signers[0].address);

        const commentUpdateWithInvalidSignatureJson = await createCommentUpdateWithInvalidSignature(sub.posts.pages.hot.comments[0].cid);

        const createdComment = await plebbit.createComment({
            cid: commentUpdateWithInvalidSignatureJson.cid
        });

        const kuboClientStates = [];
        const kuboRpcUrl = Object.keys(createdComment.clients.kuboRpcClients)[0];
        createdComment.clients.kuboRpcClients[kuboRpcUrl].on("statechange", (state) => kuboClientStates.push(state));

        const createErrorPromise = () =>
            new Promise((resolve) =>
                createdComment.once("error", (err) => {
                    if (err.code === "ERR_COMMENT_UPDATE_SIGNATURE_IS_INVALID") resolve();
                })
            );
        await createdComment.update();

        await mockCommentToReturnSpecificCommentUpdate(createdComment, JSON.stringify(commentUpdateWithInvalidSignatureJson));

        await createErrorPromise();

        await new Promise((resolve) => setTimeout(resolve, plebbit.updateInterval * 3));
        await createdComment.stop();

        const expectedKuboClientStates = [
            "fetching-ipfs", // fetching comment-ipfs
            "stopped",
            "fetching-subplebbit-ipns", // fetching subplebbit + comment update
            "fetching-subplebbit-ipfs",
            "fetching-update-ipfs",
            "stopped"
        ];

        expect(kuboClientStates.slice(0, expectedKuboClientStates.length)).to.deep.equal(expectedKuboClientStates);

        const restOfIpfsStates = kuboClientStates.slice(expectedKuboClientStates.length, kuboClientStates.length);
        for (let i = 0; i < restOfIpfsStates.length; i += 2) {
            if (restOfIpfsStates[i] === "fetching-subplebbit-ipns" && restOfIpfsStates[i + 1] === "fetching-subplebbit-ipfs") {
                expect(restOfIpfsStates[i + 2]).to.equal("fetching-update-ipfs"); // this should be the second attempt to load invalid CommentUpdate
                expect(restOfIpfsStates[i + 3]).to.equal("stopped");
            }
        }
        expect(kuboClientStates[kuboClientStates.length - 1]).to.equal("stopped");
    });
});
