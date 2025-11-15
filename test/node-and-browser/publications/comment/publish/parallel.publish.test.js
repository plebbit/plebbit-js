import { expect } from "chai";
import signers from "../../../../fixtures/signers.js";
import { describe, it } from "vitest";
import {
    getAvailablePlebbitConfigsToTestAgainst,
    createMockedSubplebbitIpns,
    findOrPublishCommentWithDepth,
    forceSubplebbitToGenerateAllRepliesPages,
    resolveWhenConditionIsTrue,
    itSkipIfRpc,
    isPlebbitFetchingUsingGateways
} from "../../../../../dist/node/test/test-util.js";
import { Buffer } from "buffer";
import * as cborg from "cborg";
import { io as createSocketClient } from "socket.io-client";
import { convertBase58IpnsNameToBase36Cid } from "../../../../../dist/node/signer/util.js";

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

getAvailablePlebbitConfigsToTestAgainst().map((config) => {
    describe.concurrent("comment.publish in parallel potential regressions - " + config.name, () => {
        it("emits challenge requests for every queued publication even when publishing to a non-existing sub", async () => {
            const plebbit = await config.plebbitInstancePromise({ forceMockPubsub: true }); // this is using mocked pubsub/ipfs client to publish
            const stressPublishCount = 350;
            const offlineSubplebbit = await createMockedSubplebbitIpns({});
            const offlineSubAddress = offlineSubplebbit.subplebbitRecord.address; // this sub is not online so can't respond to messages, although the IPNS record is fetchable

            const challengeRequestIds = new Set();
            const externalPeerChallengeRequests = new Set();

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

                await Promise.all([
                    ...comments.map((comment) => comment.publish()),
                    new Promise((resolve) =>
                        externalPeer.on(offlineSubAddress, () => {
                            if (externalPeerChallengeRequests.size >= stressPublishCount) resolve();
                        })
                    )
                ]); // should publish comments  but not get a response

                expect(challengeRequestIds.size).to.equal(stressPublishCount, "Not every publication emitted a challenge request");
                expect(externalPeerChallengeRequests.size).to.equal(
                    stressPublishCount,
                    "External peer did not receive all challenge requests"
                );
                expect([...challengeRequestIds].sort()).to.deep.equal(
                    [...externalPeerChallengeRequests].sort(),
                    "Challenge request IDs differ between local emitter and external peer"
                );
                await Promise.all(comments.map((comment) => comment.stop()));
            } finally {
                externalPeer.disconnect();
                await plebbit.destroy();
            }
        });

        it.skip("resolves the subplebbit IPNS record only once when multiple publishes start in parallel", async () => {
            const localPlebbit = await config.plebbitInstancePromise({ forceMockPubsub: true });
            localPlebbit.on("error", () => {});
            const stressPublishCount = 350;
            const randomSub = await createMockedSubplebbitIpns({}); // sub has a reachable IPNS but is not online

            const usesGateways = isPlebbitFetchingUsingGateways(localPlebbit);
            const isRemoteIpfsGatewayConfig = isPlebbitFetchingUsingGateways(localPlebbit);
            const shouldMockFetchForIpns = isRemoteIpfsGatewayConfig && typeof globalThis.fetch === "function";

            const targetAddressForGatewayIpnsUrl = convertBase58IpnsNameToBase36Cid(randomSub.subplebbitRecord.address);
            let fetchSpy;
            let nameResolveSpy;

            if (!usesGateways) {
                const p2pClient =
                    Object.keys(localPlebbit.clients.kuboRpcClients).length > 0
                        ? Object.values(localPlebbit.clients.kuboRpcClients)[0]._client
                        : Object.keys(localPlebbit.clients.libp2pJsClients).length > 0
                          ? Object.values(localPlebbit.clients.libp2pJsClients)[0].heliaWithKuboRpcClientFunctions
                          : undefined;
                if (!p2pClient?.name?.resolve) {
                    throw new Error("Expected p2p client like kubo or helia RPC client with name.resolve for this test");
                }
                nameResolveSpy = vi.spyOn(p2pClient.name, "resolve");
            } else if (shouldMockFetchForIpns) {
                fetchSpy = vi.spyOn(globalThis, "fetch");
            }

            try {
                expect(localPlebbit._updatingSubplebbits).to.deep.equal({});

                const comments = await Promise.all(
                    new Array(stressPublishCount).fill(null).map(async (_, index) =>
                        localPlebbit.createComment({
                            subplebbitAddress: randomSub.subplebbitRecord.address,
                            title: `parallel publish cache regression ${index}`,
                            content: `parallel publish cache regression content ${index}`,
                            signer: await localPlebbit.createSigner()
                        })
                    )
                );

                await Promise.all(comments.map((comment) => comment.publish()));

                expect(localPlebbit._updatingSubplebbits).to.deep.equal({});

                const resolveCallsCount = fetchSpy
                    ? fetchSpy.mock.calls.filter(([input]) => {
                          const url = typeof input === "string" ? input : input?.url;
                          return typeof url === "string" && url.includes("/ipns/" + targetAddressForGatewayIpnsUrl);
                      }).length
                    : nameResolveSpy?.mock.calls.length;

                expect(resolveCallsCount).to.equal(1, "Publishing to the same subplebbit should only resolve IPNS once");
                await Promise.all(comments.map((comment) => comment.stop()));
            } finally {
                if (nameResolveSpy) nameResolveSpy.mockRestore();
                if (fetchSpy) fetchSpy.mockRestore();
                await localPlebbit.destroy();
            }
        });
    });
});
