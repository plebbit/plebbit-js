// This script will flakiness in pubsub
// Prerequisties:
// - Run node test/server/test-server.js
// To run pubsub flakiness test:
// - node test/server/pubsub_flakiness_test.js

// The script will simulate a ChallengeRequest, sent by client, and its response, ChallengeVerification, sent out by the server to the client
// We're testing whether both the requests and verifications are properly received

// Two outcomes of this script:
// 1 - It will run infinitly, this means either the client or server missed a pubsub message
// 2 - It exits gracefully, that means all requests and their responses have been received properly

const { create } = require("ipfs-http-client");
const { exit } = require("process");

const client = create("http://localhost:15002/api/v0");
const server = create("http://localhost:15002/api/v0");

const numRequests = 1000000;

const batch = 10000; // How many challenge requests to publish at once

const clientRequestsToPublish = new Array(numRequests).fill(null).map((_, i) => ({ challengeId: i }));
const serverReceivedRequests = [];
const clientReceivedChallengeVerifications = [];

(async () => {
    await server.pubsub.subscribe("flakiness", (msg) => {
        const challengeRequest = JSON.parse(Buffer.from(msg.data).toString());
        if (challengeRequest.hasOwnProperty("answerId")) return;
        serverReceivedRequests.push(challengeRequest);
        // Randomize respond time to mimic actual plebbit-js sub behavior, somewhere between 0 and 2 seconds
        setTimeout(() => {
            server.pubsub.publish("flakiness", JSON.stringify({ ...challengeRequest, answerId: serverReceivedRequests.length }));
        }, Math.random() * 2000);
    });

    await client.pubsub.subscribe("flakiness", (msg) => {
        const challengeVerification = JSON.parse(Buffer.from(msg.data).toString());
        if (!challengeVerification.hasOwnProperty("answerId")) return;
        clientReceivedChallengeVerifications.push(challengeVerification);
    });

    setInterval(() => {
        console.log(
            `Client received ${clientReceivedChallengeVerifications.length} ChallengeVerifications and server received ${serverReceivedRequests.length} ChallengeRequests`
        );
        if (
            serverReceivedRequests.length === clientReceivedChallengeVerifications.length &&
            clientReceivedChallengeVerifications.length === clientRequestsToPublish.length
        ) {
            console.log(`No flakiness detected. Exiting...`);
            exit();
        }
    }, 1000);

    for (let i = 0; i < clientRequestsToPublish.length; ) {
        const msgsToPublish = clientRequestsToPublish.slice(i, i + Math.min(batch, clientRequestsToPublish.length - i));
        await Promise.all(msgsToPublish.map((msg) => client.pubsub.publish("flakiness", JSON.stringify(msg))));
        i += msgsToPublish.length;
        console.log(`Client sent out ${i} ChallengeRequests in total`);
    }
})();
