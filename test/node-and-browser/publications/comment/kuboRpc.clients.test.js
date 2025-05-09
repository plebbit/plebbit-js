import { expect } from "chai";
import signers from "../../../fixtures/signers.js";
import {
    generateMockPost,
    mockRemotePlebbit,
    publishWithExpectedResult,
    mockGatewayPlebbit,
    createCommentUpdateWithInvalidSignature,
    describeSkipIfRpc,
    mockCommentToNotUsePagesForUpdates,
    resolveWhenConditionIsTrue,
    mockPlebbitNoDataPathWithOnlyKuboClient,
    mockPostToReturnSpecificCommentUpdate
} from "../../../../dist/node/test/test-util.js";
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

    it(`Correct order of kuboRpcClients state when updating a post that was created with plebbit.createComment({cid})`, async () => {
        const sub = await plebbit.getSubplebbit(signers[0].address);

        const mockPost = await plebbit.createComment({ cid: sub.posts.pages.hot.comments[0].cid });

        const expectedStates = [
            "fetching-ipfs",
            "stopped",
            "fetching-subplebbit-ipns",
            "fetching-subplebbit-ipfs",
            "stopped",
            "fetching-update-ipfs",
            "stopped"
        ];

        const actualStates = [];

        const kuboRpcUrl = Object.keys(mockPost.clients.kuboRpcClients)[0];

        mockPost.clients.kuboRpcClients[kuboRpcUrl].on("statechange", (newState) => actualStates.push(newState));

        await mockPost.update();
        mockCommentToNotUsePagesForUpdates(mockPost);

        await resolveWhenConditionIsTrue(mockPost, () => typeof mockPost.upvoteCount === "number");
        await mockPost.stop();

        expect(actualStates).to.deep.equal(expectedStates);
    });

    it(`Correct order of kuboRpcClients state when updating a reply that was created with plebbit.createComment({cid}) and the post has a single preloaded page`, async () => {
        const sub = await plebbit.getSubplebbit(signers[0].address);
        const replyCid = sub.posts.pages.hot.comments.find((post) => post.replies).replies.pages.best.comments[0].cid;
        const reply = await plebbit.createComment({ cid: replyCid });

        const expectedStates = [
            "fetching-ipfs", // fetching comment ipfs of reply
            "stopped",
            "fetching-ipfs", // fetching comment-ipfs of post
            "stopped",
            "fetching-subplebbit-ipns",
            "fetching-subplebbit-ipfs",
            "stopped"
        ];

        const actualStates = [];

        const kuboRpcUrl = Object.keys(reply.clients.kuboRpcClients)[0];

        reply.clients.kuboRpcClients[kuboRpcUrl].on("statechange", (newState) => actualStates.push(newState));

        await reply.update();

        await resolveWhenConditionIsTrue(reply, () => typeof reply.updatedAt === "number");
        await reply.stop();

        expect(actualStates).to.deep.equal(expectedStates);
    });

    it(
        `Correct order of kuboRpcClients state when updating a reply that was created with plebbit.createComment({cid}) and the post has multiple pages`
    );

    it(`Correct order of kuboRpcClients state when updating a post that was created with plebbit.getComment(cid)`, async () => {
        const sub = await plebbit.getSubplebbit(signers[0].address);

        const mockPost = await plebbit.getComment(sub.posts.pages.hot.comments[0].cid);

        const expectedStates = ["fetching-subplebbit-ipns", "fetching-subplebbit-ipfs", "stopped", "fetching-update-ipfs", "stopped"];

        const actualStates = [];

        const kuboRpcUrl = Object.keys(mockPost.clients.kuboRpcClients)[0];

        mockPost.clients.kuboRpcClients[kuboRpcUrl].on("statechange", (newState) => actualStates.push(newState));

        await mockPost.update();
        mockCommentToNotUsePagesForUpdates(mockPost);
        await resolveWhenConditionIsTrue(mockPost, () => typeof mockPost.updatedAt === "number");
        await mockPost.stop();

        expect(actualStates).to.deep.equal(expectedStates);
    });

    it(`Correct order of kuboRpcClients state when updating a reply that was created with plebbit.getComment(cid)`);

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

    it(`Correct order of ipfs clients state when we update a post but its subplebbit is not publishing new subplebbit records`, async () => {
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
        mockCommentToNotUsePagesForUpdates(mockPost);

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

    it(`Correct order of kubo rpc clients when we update a post but its commentupdate is an invalid record (bad signature/schema/etc)`, async () => {
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
        mockPostToReturnSpecificCommentUpdate(createdComment, JSON.stringify(commentUpdateWithInvalidSignatureJson));

        await createErrorPromise();

        await new Promise((resolve) => setTimeout(resolve, plebbit.updateInterval * 3));
        await createdComment.stop();

        expect(createdComment.updatedAt).to.be.undefined; // should not accept the comment update

        const expectedKuboClientStates = [
            "fetching-ipfs", // fetching comment-ipfs
            "stopped",
            "fetching-subplebbit-ipns", // fetching subplebbit
            "fetching-subplebbit-ipfs",
            "stopped",
            "fetching-update-ipfs", // fetching comment update
            "stopped"
        ];

        expect(kuboClientStates.slice(0, expectedKuboClientStates.length)).to.deep.equal(expectedKuboClientStates);

        const restOfIpfsStates = kuboClientStates.slice(expectedKuboClientStates.length);

        // Check the remaining states follow valid patterns
        let i = 0;
        while (i < restOfIpfsStates.length) {
            // Check for the first state in any valid pattern
            expect(restOfIpfsStates[i]).to.equal("fetching-subplebbit-ipns", `State at position ${i} should be 'fetching-subplebbit-ipns'`);

            i++;
            if (i >= restOfIpfsStates.length) break;

            // Check for two possible patterns:
            // 1. No new subplebbit record: fetching-subplebbit-ipns -> stopped
            // 2. New subplebbit record: fetching-subplebbit-ipns -> fetching-subplebbit-ipfs -> stopped -> fetching-update-ipfs -> stopped

            if (restOfIpfsStates[i] === "stopped") {
                // Pattern 1: No new subplebbit record found
                i++;
            } else if (restOfIpfsStates[i] === "fetching-subplebbit-ipfs") {
                // Pattern 2: Found new subplebbit record
                expect(restOfIpfsStates[i]).to.equal(
                    "fetching-subplebbit-ipfs",
                    `State at position ${i} should be 'fetching-subplebbit-ipfs'`
                );
                i++;

                if (i < restOfIpfsStates.length) {
                    expect(restOfIpfsStates[i]).to.equal("stopped", `State at position ${i} should be 'stopped'`);
                    i++;
                }

                if (i < restOfIpfsStates.length) {
                    expect(restOfIpfsStates[i]).to.equal("fetching-update-ipfs", `State at position ${i} should be 'fetching-update-ipfs'`);
                    i++;
                }

                if (i < restOfIpfsStates.length) {
                    expect(restOfIpfsStates[i]).to.equal("stopped", `State at position ${i} should be 'stopped'`);
                    i++;
                }
            } else {
                throw new Error(`Unexpected state '${restOfIpfsStates[i]}' at position ${i}`);
            }
        }

        // Ensure the very last state is "stopped"
        expect(kuboClientStates[kuboClientStates.length - 1]).to.equal("stopped", "The last state should be 'stopped'");
    });
});
