import { expect } from "chai";
import signers from "../../../../fixtures/signers.js";
import {
    generateMockPost,
    publishWithExpectedResult,
    isPlebbitFetchingUsingGateways,
    generatePostToAnswerMathQuestion,
    publishSubplebbitRecordWithExtraProp,
    getRemotePlebbitConfigs,
    createNewIpns,
    resolveWhenConditionIsTrue
} from "../../../../../dist/node/test/test-util.js";
const subplebbitAddress = signers[0].address;
const mathCliSubplebbitAddress = signers[1].address;

getRemotePlebbitConfigs({ includeOnlyTheseTests: ["remote-kubo-rpc", "remote-libp2pjs"] }).map((config) => {
    describe(`comment.publishingState - ${config.name}`, async () => {
        let plebbit;
        before(async () => {
            plebbit = await config.plebbitInstancePromise();
        });

        after(async () => {
            await plebbit.destroy();
        });
        it(`comment.publishingState stays as stopped after calling comment.update() - IPFS client`, async () => {
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
        });

        it(`publishing states is in correct order upon publishing a comment with IPFS client (uncached)`, async () => {
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
        });

        it(`publishing states is in correct order upon publishing a comment with IPFS client (cached)`, async () => {
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
        });

        it(`publishing states is in correct order upon publishing a comment to plebbit.eth with IPFS client (uncached)`, async () => {
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
        });
    });
});

getRemotePlebbitConfigs({ includeOnlyTheseTests: ["remote-kubo-rpc"] }).map((config) => {
    describe(`comment.publishingState - ${config.name}`, async () => {
        let plebbit;
        before(async () => {
            plebbit = await config.plebbitInstancePromise();
        });

        after(async () => {
            await plebbit.destroy();
        });

        it(`comment.publishingState = 'failed' if pubsub provider is down`, async () => {
            const offlinePubsubUrl = "http://localhost:23425";
            const offlinePubsubPlebbit = await config.plebbitInstancePromise({
                plebbitOptions: { pubsubKuboRpcClientsOptions: [offlinePubsubUrl] }
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
});

getRemotePlebbitConfigs({ includeOnlyTheseTests: ["remote-ipfs-gateway"] }).map((config) => {
    describe(`comment.publishingState - ${config.name}`, async () => {
        let plebbit;
        before(async () => {
            plebbit = await config.plebbitInstancePromise();
        });

        after(async () => {
            await plebbit.destroy();
        });

        it(`comment.publishingState stays as stopped after calling comment.update() - IPFS Gateway`, async () => {
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
        });

        it(`publishing states is in correct order upon publishing a comment with gateway (cached)`, async () => {
            const expectedStates = [
                "publishing-challenge-request",
                "waiting-challenge",
                "waiting-challenge-answers",
                "publishing-challenge-answer",
                "waiting-challenge-verification",
                "succeeded"
            ];
            const recordedStates = [];
            await plebbit.getSubplebbit(mathCliSubplebbitAddress); // Make sure it's cached
            const mockPost = await generatePostToAnswerMathQuestion({ subplebbitAddress: mathCliSubplebbitAddress }, plebbit);

            mockPost.on("publishingstatechange", (newState) => recordedStates.push(newState));

            await publishWithExpectedResult(mockPost, true);

            expect(recordedStates).to.deep.equal(expectedStates);
        });

        it(`publishing states is in correct order upon publishing a comment with gateway (uncached)`, async () => {
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
            const mockPost = await generatePostToAnswerMathQuestion({ subplebbitAddress: mathCliSubplebbitAddress }, plebbit);
            mockPost._getSubplebbitCache = () => undefined;

            mockPost.on("publishingstatechange", (newState) => recordedStates.push(newState));

            await publishWithExpectedResult(mockPost, true);

            expect(recordedStates).to.deep.equal(expectedStates);
        });
    });
});

getRemotePlebbitConfigs().map((config) => {
    describe(`comment.publishingState - ${config.name}`, async () => {
        let plebbit;
        before(async () => {
            plebbit = await config.plebbitInstancePromise();
        });

        after(async () => {
            await plebbit.destroy();
        });

        it(`publishingState is stopped by default`, async () => {
            const comment = await generateMockPost(subplebbitAddress, plebbit);
            expect(comment.publishingState).to.equal("stopped");
        });

        it(`comment.publishingState = 'failed' if user provide incorrect answer`, async () => {
            const mockPost = await generateMockPost(mathCliSubplebbitAddress, plebbit);
            mockPost.removeAllListeners("challenge");

            mockPost.once("challenge", async (challengeMsg) => {
                expect(challengeMsg?.challenges[0]?.challenge).to.be.a("string");
                await mockPost.publishChallengeAnswers(["12345"]); // Wrong answer here
            });

            await publishWithExpectedResult(mockPost, false);

            expect(mockPost.publishingState).to.equal("failed");
            await mockPost.stop();
        });

        it(`publishing state is set correctly if publish() is thrown`, async () => {
            const ipnsObj = await createNewIpns();

            await ipnsObj.publishToIpns("<html></html>");

            const mockPost = await generateMockPost(ipnsObj.signer.address, plebbit);

            const recordedPublishingStates = [];

            mockPost.on("publishingstatechange", (newState) => recordedPublishingStates.push(newState));

            try {
                await mockPost.publish();
                expect.fail("Should have thrown");
            } catch (e) {
                expect(mockPost.publishingState).to.equal("failed");
            }

            if (!isPlebbitFetchingUsingGateways(plebbit))
                expect(recordedPublishingStates).to.deep.equal(["fetching-subplebbit-ipns", "fetching-subplebbit-ipfs", "failed"]);
            else expect(recordedPublishingStates).to.deep.equal(["fetching-subplebbit-ipns", "failed"]);

            await ipnsObj.plebbit.destroy();

            await mockPost.stop();
        });

        it(`order of publishingState-error-publishingstatechange is correct`, async () => {
            // need to create a mock sub with pubsub topic that's not responding
            // that way we will force the error to be thrown for both rpc and other configs

            const mockedSub = await publishSubplebbitRecordWithExtraProp();

            const mockPost = await generateMockPost(mockedSub.ipnsObj.signer.address, plebbit);
            mockPost._publishToDifferentProviderThresholdSeconds = 1;
            mockPost._setProviderFailureThresholdSeconds = 2;

            const recordedPublishingStates = [];

            mockPost.on("publishingstatechange", (newState) => recordedPublishingStates.push(newState));

            const errorPromise = new Promise((resolve, reject) => {
                mockPost.on("error", (e) => {
                    if (mockPost.publishingState !== "failed") reject("publishing state should be failed after getting the error");
                    if (recordedPublishingStates.length === 0) reject("should have emitted a publishingstatechange event");
                    if (recordedPublishingStates[recordedPublishingStates.length - 1] === "failed")
                        reject("should not emit an event just yet");
                    resolve();
                });
            });

            await mockPost.publish();
            await errorPromise;
            await resolveWhenConditionIsTrue(
                mockPost,
                () => recordedPublishingStates[recordedPublishingStates.length - 1] === "failed",
                "publishingstatechange"
            );

            expect(mockPost.publishingState).to.equal("failed");
            const expectedPublishingState = ["fetching-subplebbit-ipns"].concat(
                ...(isPlebbitFetchingUsingGateways(plebbit) ? [] : ["fetching-subplebbit-ipfs"]),
                ...new Array(Object.keys(mockPost._challengeExchanges).length).fill(["publishing-challenge-request", "waiting-challenge"]),
                "failed"
            );
            expect(recordedPublishingStates).to.deep.equal(expectedPublishingState);
            await mockedSub.ipnsObj.plebbit.destroy();
            await mockPost.stop();
        });
    });
});
