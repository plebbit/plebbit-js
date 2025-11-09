import { expect } from "chai";
import tempy from "tempy";
import net from "node:net";

import PlebbitWsServerModule from "../../../dist/node/rpc/src/index.js";
import { restorePlebbitJs } from "../../../dist/node/rpc/src/lib/plebbit-js/index.js";
import {
    describeSkipIfRpc,
    mockRpcServerForTests,
    mockRpcServerPlebbit,
    publishWithExpectedResult,
    resolveWhenConditionIsTrue,
    createPendingApprovalChallenge
} from "../../../dist/node/test/test-util.js";
import Plebbit from "../../../dist/node/index.js";
import { messages } from "../../../dist/node/errors.js";
import { createMockPubsubClient } from "../../../dist/node/test/mock-ipfs-client.js";

const { PlebbitWsServer: createPlebbitWsServer, setPlebbitJs } = PlebbitWsServerModule;

const getAvailablePort = async () =>
    await new Promise((resolve, reject) => {
        const server = net.createServer();
        server.unref();
        server.on("error", (error) => {
            server.close();
            reject(error);
        });
        server.listen(0, () => {
            const address = server.address();
            server.close(() => resolve(typeof address === "object" && address ? address.port : 0));
        });
    });

describeSkipIfRpc("Plebbit RPC server stress publish", function () {
    let rpcServer;
    let plebbit;
    let subplebbit;
    let moderatorSigner;
    let rpcPort;
    const stressClients = [];

    function configureServerPubsubClients(options = {}) {
        const { dropRate, throwOnPublish } = options;
        const pubsubClients = rpcServer?.plebbit?.clients?.pubsubKuboRpcClients;
        if (!pubsubClients) return;
        for (const pubsubUrl of Object.keys(pubsubClients)) {
            const wrapper = pubsubClients[pubsubUrl];
            if (!wrapper) continue;
            if (wrapper._client?.destroy) {
                try {
                    wrapper._client.destroy();
                } catch {}
            }
            const mockClient = createMockPubsubClient(dropRate);
            if (throwOnPublish) {
                const originalPublish = mockClient.pubsub.publish;
                mockClient.pubsub.publish = async (...publishArgs) => {
                    try {
                        await originalPublish?.(...publishArgs);
                    } catch {}
                    throw new Error("MOCK_PUBSUB_FORCED_FAILURE");
                };
            }
            wrapper._client = mockClient;
            wrapper.destroy = mockClient.destroy.bind(mockClient);
        }
    }

    before(async () => {
        setPlebbitJs(async (options) => mockRpcServerPlebbit({ dataPath: tempy.directory(), ...(options || {}) }));

        const port = await getAvailablePort();
        rpcPort = port;
        const dataPath = tempy.directory();
        rpcServer = await createPlebbitWsServer({ port, plebbitOptions: { dataPath } });
        mockRpcServerForTests(rpcServer);
        rpcServer?.plebbit?.setMaxListeners?.(1000);
        configureServerPubsubClients();

        plebbit = await Plebbit({ plebbitRpcClientsOptions: [`ws://127.0.0.1:${port}`], dataPath: undefined, httpRoutersOptions: [] });
        subplebbit = await plebbit.createSubplebbit({});
        subplebbit.setMaxListeners(100);
        moderatorSigner = await plebbit.createSigner();
        await subplebbit.edit({
            roles: {
                [moderatorSigner.address]: { role: "moderator" }
            },
            settings: {
                challenges: [createPendingApprovalChallenge()]
            }
        });
        await subplebbit.start();
        await resolveWhenConditionIsTrue({ toUpdate: subplebbit, predicate: () => typeof subplebbit.updatedAt === "number" });
    });

    after(async () => {
        if (subplebbit) {
            try {
                await subplebbit.stop();
            } catch {}
        }
        if (plebbit) await plebbit.destroy();
        if (rpcServer) await rpcServer.destroy();
        restorePlebbitJs();
    });

    afterEach(async () => {
        if (stressClients.length === 0) return;
        await Promise.allSettled(stressClients.splice(0).map((client) => client.destroy().catch(() => {})));
    });

    const createRpcClient = async () => {
        const client = await Plebbit({
            plebbitRpcClientsOptions: [`ws://127.0.0.1:${rpcPort}`],
            dataPath: undefined,
            httpRoutersOptions: []
        });
        stressClients.push(client);
        return client;
    };

    it("keeps delivering challenge verifications when multiple RPC clients reject edits concurrently", async () => {
        const PARALLEL_EDITS = 20;
        const expectedReason = messages.ERR_USER_PUBLISHED_UNDER_DISAPPROVED_COMMENT;

        const parallelFlows = Array.from({ length: PARALLEL_EDITS }).map((_, i) => {
            return (async () => {
                const client = await createRpcClient();
                const authorSigner = await client.createSigner();
                const pendingComment = await client.createComment({
                    subplebbitAddress: subplebbit.address,
                    content: `stress comment ${i}`,
                    title: `stress ${i}`,
                    signer: authorSigner,
                    challengeRequest: { challengeAnswers: ["pending"] }
                });
                await publishWithExpectedResult(pendingComment, true);

                const rejection = await plebbit.createCommentModeration({
                    subplebbitAddress: subplebbit.address,
                    commentCid: pendingComment.cid,
                    signer: moderatorSigner,
                    commentModeration: { approved: false, reason: `reject-${i}` }
                });
                await publishWithExpectedResult(rejection, true);

                const edit = await client.createCommentEdit({
                    subplebbitAddress: subplebbit.address,
                    commentCid: pendingComment.cid,
                    reason: "stress-edit",
                    content: "text to edit on pending comment",
                    signer: authorSigner
                });

                await publishWithExpectedResult(edit, false, expectedReason);
            })();
        });

        const results = await Promise.allSettled(parallelFlows);
        const failures = results.filter((result) => result.status === "rejected");

        expect(
            failures.length,
            "RPC server failed to deliver challenge verification for some comment edits when stress publishing in parallel"
        ).to.equal(0);
    });

    it("surfaces deterministic errors when pubsub providers drop challenge exchanges", async () => {
        configureServerPubsubClients({ throwOnPublish: true });

        const ATTEMPTS = 10;
        const flows = Array.from({ length: ATTEMPTS }).map((_, i) => {
            return (async () => {
                const client = await createRpcClient();
                const authorSigner = await client.createSigner();
                const pendingComment = await client.createComment({
                    subplebbitAddress: subplebbit.address,
                    content: `drop stress comment ${i}`,
                    title: `drop stress ${i}`,
                    signer: authorSigner,
                    challengeRequest: { challengeAnswers: ["pending"] }
                });
                await publishWithExpectedResult(pendingComment, true);

                const rejection = await plebbit.createCommentModeration({
                    subplebbitAddress: subplebbit.address,
                    commentCid: pendingComment.cid,
                    signer: moderatorSigner,
                    commentModeration: { approved: false, reason: `drop-reject-${i}` }
                });
                await publishWithExpectedResult(rejection, true);

                const edit = await client.createCommentEdit({
                    subplebbitAddress: subplebbit.address,
                    commentCid: pendingComment.cid,
                    reason: "drop-stress-edit",
                    content: "drop text to edit on pending comment",
                    signer: authorSigner
                });

                return publishWithExpectedResult(edit, false, messages.ERR_USER_PUBLISHED_UNDER_DISAPPROVED_COMMENT);
            })();
        });

        const results = await Promise.allSettled(flows);
        const timedOut = results.filter((result) => result.status === "rejected");

        expect(timedOut.length, "RPC server should surface forced pubsub failures as immediate errors instead of timing out").to.equal(0);

        configureServerPubsubClients();
    });

    it("keeps pending-approval settings stable while other RPC clients edit the sub", async () => {
        const publishAttempts = 40;
        const toggles = 80;
        const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

        const runPublishFlow = async (index) => {
            const client = await createRpcClient();
            const authorSigner = await client.createSigner();
            const pendingComment = await client.createComment({
                subplebbitAddress: subplebbit.address,
                content: `toggle stress comment ${index}`,
                title: `toggle stress ${index}`,
                signer: authorSigner,
                challengeRequest: { challengeAnswers: ["pending"] }
            });
            await publishWithExpectedResult(pendingComment, true);

            const rejection = await plebbit.createCommentModeration({
                subplebbitAddress: subplebbit.address,
                commentCid: pendingComment.cid,
                signer: moderatorSigner,
                commentModeration: { approved: false, reason: `toggle-reject-${index}` }
            });
            await publishWithExpectedResult(rejection, true);

            const edit = await client.createCommentEdit({
                subplebbitAddress: subplebbit.address,
                commentCid: pendingComment.cid,
                reason: "toggle-stress-edit",
                content: "toggle edit content",
                signer: authorSigner
            });
            await publishWithExpectedResult(edit, false, messages.ERR_USER_PUBLISHED_UNDER_DISAPPROVED_COMMENT);
        };

        const toggleChallenges = async () => {
            const pendingChallenge = createPendingApprovalChallenge();
            const nonPendingChallenge = { ...pendingChallenge, pendingApproval: false };
            for (let i = 0; i < toggles; i += 1) {
                await subplebbit.edit({
                    settings: { challenges: [i % 2 === 0 ? pendingChallenge : nonPendingChallenge] }
                });
                await delay(25);
            }
        };

        await Promise.all([toggleChallenges(), Promise.all(Array.from({ length: publishAttempts }).map((_, i) => runPublishFlow(i)))]);
    });
});
