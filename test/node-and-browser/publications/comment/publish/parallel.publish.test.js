import { expect } from "chai";
import signers from "../../../../fixtures/signers.js";
import { describe } from "vitest";
import {
    getAvailablePlebbitConfigsToTestAgainst,
    createMockedSubplebbitIpns,
    findOrPublishCommentWithDepth,
    forceSubplebbitToGenerateAllRepliesPages,
    resolveWhenConditionIsTrue,
    itSkipIfRpc,
    mockPlebbitNoDataPathWithOnlyKuboClient
} from "../../../../../dist/node/test/test-util.js";
import { Buffer } from "buffer";
import * as cborg from "cborg";
import { io as createSocketClient } from "socket.io-client";

const subplebbitAddress = signers[0].address;
const replyDepthsToTest = [1, 2, 3, 10, 15, 30];

const publishScenarios = [
    {
        description: "when parent comment is stopped before forcing replies pages",
        stopParentBeforeForce: true
    },
    {
        description: "while parent comment keeps updating",
        stopParentBeforeForce: false
    }
];

getAvailablePlebbitConfigsToTestAgainst().map((config) => {
    describe.skip(`comment.publish.parallel force replies pages - ${config.name}`, () => {
        let plebbit;

        before(async () => {
            plebbit = await config.plebbitInstancePromise();
        });

        after(async () => {
            await plebbit.destroy();
        });

        const runPublishFlowForDepths = async ({ stopParentBeforeForce }) => {
            const subplebbit = await plebbit.getSubplebbit(subplebbitAddress);
            await subplebbit.update();

            for (const replyDepth of replyDepthsToTest) {
                const parentDepth = Math.max(replyDepth - 1, 0);
                const parentComment = await findOrPublishCommentWithDepth({ depth: parentDepth, subplebbit });

                try {
                    await parentComment.update();
                    await resolveWhenConditionIsTrue({
                        toUpdate: parentComment,
                        predicate: () => typeof parentComment.updatedAt === "number"
                    });

                    expect(parentComment.depth).to.equal(parentDepth);
                    expect(parentComment.raw.commentUpdate).to.exist;

                    if (stopParentBeforeForce) await parentComment.stop();

                    await forceSubplebbitToGenerateAllRepliesPages(parentComment);

                    const reloadedParent = await plebbit.createComment({ cid: parentComment.cid });
                    try {
                        await reloadedParent.update();
                        await resolveWhenConditionIsTrue({
                            toUpdate: reloadedParent,
                            predicate: () => Object.keys(reloadedParent.replies.pageCids).length > 0
                        });
                        expect(Object.keys(reloadedParent.replies.pageCids).length).to.be.greaterThan(0);
                    } finally {
                        await reloadedParent.stop();
                    }
                } finally {
                    if (parentComment.state !== "stopped") await parentComment.stop();
                }
            }
        };

        for (const scenario of publishScenarios) {
            itSkipIfRpc(`forceSubplebbitToGenerateAllRepliesPages ${scenario.description}`, async () => {
                await runPublishFlowForDepths({ stopParentBeforeForce: scenario.stopParentBeforeForce });
            });
        }
    });
});

// TODO I think we need to create a test where we publish 350 publications and test if name.resolve is called 350 times or just once

describe("comment.publish parallel regression - challenge requests", () => {
    it("emits challenge requests for every queued publication even when publishing to a non-existing sub", async () => {
        const plebbit = await mockPlebbitNoDataPathWithOnlyKuboClient(); // this is using mocked pubsub/ipfs client to publish
        const stressPublishCount = 350;
        const offlineSubplebbit = await createMockedSubplebbitIpns({});
        const offlineSubAddress = offlineSubplebbit.subplebbitRecord.address; // this sub is not online so can't respond to messages, although the IPNS record is fetchable

        const challengeRequestIds = new Set();
        const externalPeerChallengeRequests = new Set();
        const defaultKuboRpcClient = Object.values(plebbit.clients.kuboRpcClients)[0]?._client;
        let nameResolveCalls = 0;
        const originalNameResolve =
            defaultKuboRpcClient?.name?.resolve && defaultKuboRpcClient.name.resolve.bind(defaultKuboRpcClient.name);
        if (defaultKuboRpcClient && originalNameResolve) {
            defaultKuboRpcClient.name.resolve = (...args) => {
                nameResolveCalls += 1;
                return originalNameResolve(...args);
            };
        }

        const externalPeer = createSocketClient("ws://localhost:25963", { reconnectionAttempts: 3, reconnectionDelay: 500 });
        await new Promise((resolve, reject) => {
            externalPeer.once("connect", resolve);
            externalPeer.once("connect_error", reject);
        });
        externalPeer.on(offlineSubAddress, (msg) => {
            if (msg) {
                try {
                    const decoded = cborg.decode(msg);
                    if (decoded?.type === "CHALLENGEREQUEST" && decoded.challengeRequestId)
                        externalPeerChallengeRequests.add(Buffer.from(decoded.challengeRequestId).toString("base64"));
                } catch {
                    // ignore decode errors
                }
            }
        });

        try {
            const comments = await Promise.all(
                new Array(stressPublishCount).fill(null).map(async (_, index) => {
                    const comment = await plebbit.createComment({
                        subplebbitAddress: offlineSubAddress,
                        title: `parallel publish stress ${index}`,
                        content: `parallel publish stress content ${index}`,
                        signer: await plebbit.createSigner()
                    });
                    comment.on("challengerequest", (request) => {
                        challengeRequestIds.add(Buffer.from(request.challengeRequestId).toString("base64"));
                    });
                    return comment;
                })
            );

            await Promise.all(comments.map((comment) => comment.publish())); // should publish comments  but not get a response

            await new Promise((resolve) => setTimeout(resolve, 5000));

            expect(challengeRequestIds.size).to.equal(stressPublishCount, "Not every publication emitted a challenge request");
            expect(externalPeerChallengeRequests.size).to.equal(stressPublishCount, "External peer did not receive all challenge requests");
            expect([...challengeRequestIds].sort()).to.deep.equal(
                [...externalPeerChallengeRequests].sort(),
                "Challenge request IDs differ between local emitter and external peer"
            );
            expect(nameResolveCalls).to.equal(1, "Subplebbit metadata for publishing should already be cached; no IPNS resolves expected");
        } finally {
            if (defaultKuboRpcClient && originalNameResolve) defaultKuboRpcClient.name.resolve = originalNameResolve;
            externalPeer.disconnect();
            await plebbit.destroy();
        }
    });
});

describe("comment.publish subplebbit cache regression", () => {
    it("resolves the subplebbit IPNS record only once when multiple publishes start in parallel", async () => {
        const plebbit = await mockPlebbitNoDataPathWithOnlyKuboClient();
        const stressPublishCount = 350;
        const offlineSubplebbit = await createMockedSubplebbitIpns({});
        const offlineSubAddress = offlineSubplebbit.subplebbitRecord.address;
        const defaultKuboRpcClient = Object.values(plebbit.clients.kuboRpcClients)[0]?._client;
        let nameResolveCalls = 0;
        const originalNameResolve =
            defaultKuboRpcClient?.name?.resolve && defaultKuboRpcClient.name.resolve.bind(defaultKuboRpcClient.name);
        if (defaultKuboRpcClient && originalNameResolve) {
            defaultKuboRpcClient.name.resolve = (...args) => {
                nameResolveCalls += 1;
                return originalNameResolve(...args);
            };
        }

        try {
            const comments = await Promise.all(
                new Array(stressPublishCount).fill(null).map(async (_, index) =>
                    plebbit.createComment({
                        subplebbitAddress: offlineSubAddress,
                        title: `parallel publish cache regression ${index}`,
                        content: `parallel publish cache regression content ${index}`,
                        signer: await plebbit.createSigner()
                    })
                )
            );

            await Promise.all(comments.map((comment) => comment.publish()));

            await new Promise((resolve) => setTimeout(resolve, 5000));

            expect(nameResolveCalls).to.equal(1, "Publishing to the same subplebbit should only resolve IPNS once");
        } finally {
            if (defaultKuboRpcClient && originalNameResolve) defaultKuboRpcClient.name.resolve = originalNameResolve;
            await plebbit.destroy();
        }
    });
});
