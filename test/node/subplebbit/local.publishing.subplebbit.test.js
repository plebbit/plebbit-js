import { expect } from "chai";
import {
    mockPlebbit,
    generateMockPost,
    generatePostToAnswerMathQuestion,
    resolveWhenConditionIsTrue,
    describeSkipIfRpc
} from "../../../dist/node/test/test-util.js";

describeSkipIfRpc("Local publishing to subplebbit", async () => {
    let plebbit, subplebbit, commentSigner;
    const receivedPubsubMessages = [];
    let pubsubTopic;

    before(async () => {
        plebbit = await mockPlebbit();
        subplebbit = await plebbit.createSubplebbit();
        const challenges = [{ name: "question", options: { question: "1+1=?", answer: "2" } }];
        await subplebbit.edit({ settings: { challenges } });

        await subplebbit.start();
        await resolveWhenConditionIsTrue(subplebbit, () => typeof subplebbit.updatedAt === "number");
        commentSigner = await plebbit.createSigner();

        // Get the pubsub topic for this subplebbit
        pubsubTopic = subplebbit.pubsubTopicWithfallback();

        // Subscribe to the pubsub topic to capture any messages that might be published
        const pubsubClient = plebbit._clientsManager.getDefaultKuboPubsubClient();
        await pubsubClient._client.pubsub.subscribe(pubsubTopic, (msg) => {
            receivedPubsubMessages.push({
                topic: pubsubTopic,
                data: msg.data,
                timestamp: Date.now()
            });
        });
    });

    after(async () => {
        await subplebbit.delete();
        await plebbit.destroy();
    });

    it("should publish comment locally without going through pubsub exchange", async () => {
        // Create a comment that will answer the math question correctly
        const comment = await generatePostToAnswerMathQuestion({ subplebbitAddress: subplebbit.address, signer: commentSigner }, plebbit);

        const challengeRequestPromise = new Promise((resolve) => comment.once("challengerequest", resolve));
        const challengePromise = new Promise((resolve) => comment.once("challenge", resolve));
        const challengeAnswerPromise = new Promise((resolve) => comment.once("challengeanswer", resolve));

        // Listen for challenge verification to ensure the challenge succeeded
        const challengeVerificationPromise = new Promise((resolve) => comment.once("challengeverification", resolve));

        // Publish the comment
        await comment.publish();

        const challengeRequest = await challengeRequestPromise;
        const challenge = await challengePromise;
        const challengeAnswer = await challengeAnswerPromise;

        // Wait for challenge verification to complete
        const challengeVerification = await challengeVerificationPromise;

        expect(challengeRequest.challengeRequestId.toString()).to.equal(challenge.challengeRequestId.toString());
        expect(challengeAnswer.challengeAnswers).to.deep.equal(["2"]);
        expect(challenge.challenges[0].challenge).to.equal("1+1=?");

        // Verify the challenge succeeded
        expect(challengeVerification.challengeSuccess).to.be.true;

        // Verify that the subplebbit is indeed local (running on the same plebbit instance)
        expect(plebbit._startedSubplebbits[subplebbit.address]).to.equal(subplebbit);

        // Verify that the publication was handled locally by checking the _publishingToLocalSubplebbit flag
        // This flag should be set during local publishing to prevent pubsub updates
        expect(comment._publishingToLocalSubplebbit).to.equal(subplebbit);

        // Verify that no pubsub messages were received during local publishing
        // If we receive any messages, it means pubsub was used when it shouldn't be for local publishing
        expect(receivedPubsubMessages.length).to.equal(0);
    });
});
