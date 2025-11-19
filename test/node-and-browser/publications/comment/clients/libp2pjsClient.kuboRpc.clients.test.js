import { expect } from "chai";
import signers from "../../../../fixtures/signers.js";
import {
    generateMockPost,
    publishWithExpectedResult,
    getAvailablePlebbitConfigsToTestAgainst,
    mockGatewayPlebbit,
    createCommentUpdateWithInvalidSignature,
    mockCommentToNotUsePagesForUpdates,
    resolveWhenConditionIsTrue,
    mockPostToReturnSpecificCommentUpdate
} from "../../../../../dist/node/test/test-util.js";
import { describe, it } from "vitest";
const subplebbitAddress = signers[0].address;

const clientsFieldName = {
    "remote-libp2pjs": "libp2pJsClients",
    "remote-kubo-rpc": "kuboRpcClients"
};

getAvailablePlebbitConfigsToTestAgainst({ includeOnlyTheseTests: ["remote-kubo-rpc", "remote-libp2pjs"] }).map((config) => {
    const clientFieldName = clientsFieldName[config.testConfigCode];
    describe(`comment.clients.${clientFieldName} - ${config.name}`, async () => {
        let plebbit;
        before(async () => {
            plebbit = await config.plebbitInstancePromise();
        });

        after(async () => {
            await plebbit.destroy();
        });

        it(`comment.clients.${clientFieldName} is undefined for gateway plebbit`, async () => {
            const gatewayPlebbit = await mockGatewayPlebbit();
            const mockPost = await generateMockPost(subplebbitAddress, gatewayPlebbit);
            expect(mockPost.clients[clientFieldName]).to.be.undefined;
            await gatewayPlebbit.destroy();
        });

        it(`comment.clients.${clientFieldName}[key] is stopped by default`, async () => {
            const mockPost = await generateMockPost(subplebbitAddress, plebbit);
            expect(Object.keys(mockPost.clients[clientFieldName]).length).to.equal(1);
            expect(Object.values(mockPost.clients[clientFieldName])[0].state).to.equal("stopped");
        });

        it(`Correct order of ${clientFieldName} state when updating a post that was created with plebbit.createComment({cid})`, async () => {
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

            const keyOfClient = Object.keys(mockPost.clients[clientFieldName])[0];

            mockPost.clients[clientFieldName][keyOfClient].on("statechange", (newState) => actualStates.push(newState));

            await mockPost.update();
            mockCommentToNotUsePagesForUpdates(mockPost);

            await resolveWhenConditionIsTrue({ toUpdate: mockPost, predicate: () => typeof mockPost.upvoteCount === "number" });
            await mockPost.stop();

            expect(actualStates).to.deep.equal(expectedStates);
        });

        it(`Correct order of ${clientFieldName} state when updating a reply that was created with plebbit.createComment({cid}) and the post has a single preloaded page`, async () => {
            const plebbit = await config.plebbitInstancePromise();
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

            const keyOfClient = Object.keys(reply.clients[clientFieldName])[0];

            reply.clients[clientFieldName][keyOfClient].on("statechange", (newState) => actualStates.push(newState));

            await reply.update();

            await resolveWhenConditionIsTrue({ toUpdate: reply, predicate: () => typeof reply.updatedAt === "number" });
            await reply.stop();

            expect(actualStates).to.deep.equal(expectedStates);
            await plebbit.destroy();
        });

        it(
            `Correct order of ${clientFieldName} state when updating a reply that was created with plebbit.createComment({cid}) and the post has multiple pages`
        );

        it(`Correct order of ${clientFieldName} state when updating a post that was created with plebbit.getComment(cid)`, async () => {
            const sub = await plebbit.getSubplebbit(signers[0].address);

            const mockPost = await plebbit.getComment(sub.posts.pages.hot.comments[0].cid);

            const expectedStates = ["fetching-subplebbit-ipns", "fetching-subplebbit-ipfs", "stopped", "fetching-update-ipfs", "stopped"];

            const actualStates = [];

            const keyOfClient = Object.keys(mockPost.clients[clientFieldName])[0];

            mockPost.clients[clientFieldName][keyOfClient].on("statechange", (newState) => actualStates.push(newState));

            await mockPost.update();
            mockCommentToNotUsePagesForUpdates(mockPost);
            await resolveWhenConditionIsTrue({ toUpdate: mockPost, predicate: () => typeof mockPost.updatedAt === "number" });
            await mockPost.stop();

            expect(actualStates).to.deep.equal(expectedStates);
        });

        it(`Correct order of ${clientFieldName} state when updating a reply that was created with plebbit.getComment(cid)`);

        it(`Correct order of ${clientFieldName} state when publishing a comment (uncached)`, async () => {
            const mockPost = await generateMockPost(signers[0].address, plebbit);
            mockPost._getSubplebbitCache = () => undefined;
            const expectedStates = ["fetching-subplebbit-ipns", "fetching-subplebbit-ipfs", "stopped"];

            const actualStates = [];

            const keyOfClient = Object.keys(mockPost.clients[clientFieldName])[0];

            mockPost.clients[clientFieldName][keyOfClient].on("statechange", (newState) => actualStates.push(newState));

            await publishWithExpectedResult(mockPost, true);

            expect(actualStates.slice(0, expectedStates.length)).to.deep.equal(expectedStates);
        });

        it(`Correct order of ${clientFieldName} state when publishing a comment (cached)`, async () => {
            const mockPost = await generateMockPost(signers[0].address, plebbit);

            const actualStates = [];

            const keyOfClient = Object.keys(mockPost.clients[clientFieldName])[0];

            mockPost.clients[clientFieldName][keyOfClient].on("statechange", (newState) => actualStates.push(newState));

            await publishWithExpectedResult(mockPost, true);

            if (config.testConfigCode === "remote-kubo-rpc") {
                expect(actualStates).to.deep.equal([]); // it's empty because we're not fetching anything due to caching
            } else if (config.testConfigCode === "remote-libp2pjs") {
                expect(actualStates).to.deep.equal(["subscribing-pubsub", "publishing-challenge-request", "waiting-challenge", "stopped"]); // libp2pjs will publish and include its states
            } else {
                expect.fail("Unexpected test config code");
            }
        });

        it(`Correct order of ${clientFieldName} when we update a post but its subplebbit is not publishing new subplebbit records`, async () => {
            const customPlebbit = await config.plebbitInstancePromise();

            const sub = await customPlebbit.createSubplebbit({ address: signers[0].address });

            // now plebbit._updatingSubplebbits will be defined

            const updatePromise = new Promise((resolve) => sub.once("update", resolve));
            await sub.update();
            await updatePromise;

            const updatingSubInstance = customPlebbit._updatingSubplebbits[sub.address];

            updatingSubInstance._clientsManager.resolveIpnsToCidP2P = () => sub.updateCid; // stop it from loading new IPNS

            const mockPost = await customPlebbit.createComment({ cid: sub.posts.pages.hot.comments[0].cid });

            const recordedStates = [];

            const keyOfClient = Object.keys(mockPost.clients[clientFieldName])[0];

            mockPost.clients[clientFieldName][keyOfClient].on("statechange", (newState) => recordedStates.push(newState));

            await mockPost.update();
            mockCommentToNotUsePagesForUpdates(mockPost);

            await resolveWhenConditionIsTrue({ toUpdate: mockPost, predicate: () => typeof mockPost.updatedAt === "number" });

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

        it(`Correct order of ${clientFieldName} when we update a post but its commentupdate is an invalid record (bad signature/schema/etc)`, async () => {
            const plebbit = await config.plebbitInstancePromise();

            const sub = await plebbit.getSubplebbit(signers[0].address);

            const commentUpdateWithInvalidSignatureJson = await createCommentUpdateWithInvalidSignature(
                sub.posts.pages.hot.comments[0].cid
            );

            const createdComment = await plebbit.createComment({
                cid: commentUpdateWithInvalidSignatureJson.cid
            });

            const clientStates = [];
            const keyOfClient = Object.keys(createdComment.clients[clientFieldName])[0];
            createdComment.clients[clientFieldName][keyOfClient].on("statechange", (state) => clientStates.push(state));

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

            const expectedIpfsClientStates = [
                "fetching-ipfs", // fetching comment-ipfs
                "stopped",
                "fetching-subplebbit-ipns", // fetching subplebbit
                "fetching-subplebbit-ipfs",
                "stopped",
                "fetching-update-ipfs", // fetching comment update
                "stopped"
            ];

            expect(clientStates.slice(0, expectedIpfsClientStates.length)).to.deep.equal(expectedIpfsClientStates);

            const restOfIpfsStates = clientStates.slice(expectedIpfsClientStates.length);

            // Check the remaining states follow valid patterns
            let i = 0;
            while (i < restOfIpfsStates.length) {
                // Check for the first state in any valid pattern
                expect(restOfIpfsStates[i]).to.equal(
                    "fetching-subplebbit-ipns",
                    `State at position ${i} should be 'fetching-subplebbit-ipns'`
                );

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
                        expect(restOfIpfsStates[i]).to.equal(
                            "fetching-update-ipfs",
                            `State at position ${i} should be 'fetching-update-ipfs'`
                        );
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
            expect(clientStates[clientStates.length - 1]).to.equal("stopped", "The last state should be 'stopped'");
            await plebbit.destroy();
        });
    });
});
