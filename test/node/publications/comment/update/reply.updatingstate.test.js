import { expect } from "chai";
import {
    createSubWithNoChallenge,
    describeSkipIfRpc,
    forcePagesToUsePageCidsOnly,
    getAvailablePlebbitConfigsToTestAgainst,
    mockPlebbit,
    mockReplyToUseParentPagesForUpdates,
    publishRandomPost,
    publishRandomReply,
    resolveWhenConditionIsTrue,
    waitTillReplyInParentPagesInstance
} from "../../../../../dist/node/test/test-util.js";

// TODO add depth config here so we can test it on different depths

const kuboAndLibp2pConfigs = getAvailablePlebbitConfigsToTestAgainst({
    includeOnlyTheseTests: ["remote-kubo-rpc", "remote-libp2pjs"],
    includeAllPossibleConfigOnEnv: true
});
const gatewayConfigs = getAvailablePlebbitConfigsToTestAgainst({
    includeOnlyTheseTests: ["remote-ipfs-gateway"],
    includeAllPossibleConfigOnEnv: true
});
const allPlebbitConfigs = getAvailablePlebbitConfigsToTestAgainst({ includeAllPossibleConfigOnEnv: true });

kuboAndLibp2pConfigs.map((config) => {
    describeSkipIfRpc.sequential(`reply.updatingState parent page CIDs (node) - ${config.name}`, async () => {
        it(`Updating states is in correct order upon updating a reply from its parent pageCids`, async () => {
            const context = await createReplyParentPagesTestEnvironment();
            const plebbit = await config.plebbitInstancePromise();
            const expectedStates = [
                "fetching-ipfs",
                "succeeded",
                "fetching-subplebbit-ipns",
                "fetching-subplebbit-ipfs",
                "fetching-update-ipfs",
                "succeeded",
                "stopped"
            ];
            const recordedStates = [];
            let reply;
            let replyStopped = false;
            try {
                reply = await plebbit.createComment({ cid: context.replyCid });

                expect(reply.content).to.be.undefined;
                expect(reply.updatedAt).to.be.undefined;

                reply.on("updatingstatechange", (newState) => recordedStates.push(newState));

                await reply.update();
                // mockReplyToUseParentPagesForUpdates(reply);
                expect(reply.content).to.be.undefined;
                expect(reply.updatedAt).to.be.undefined;

                await resolveWhenConditionIsTrue({ toUpdate: reply, predicate: () => typeof reply.updatedAt === "number" });

                const updatingMockReply = plebbit._updatingComments[reply.cid];
                const numOfUpdates = recordedStates.filter((state) => state === "succeeded").length - 1;
                expect(updatingMockReply._clientsManager._parentFirstPageCidsAlreadyLoaded.size).to.be.greaterThanOrEqual(numOfUpdates);

                await reply.stop();
                replyStopped = true;

                const filteredExpectedStates = cleanupStateArray(expectedStates);
                const filteredRecordedStates = cleanupStateArray(recordedStates);
                expect(filteredRecordedStates).to.deep.equal(filteredExpectedStates, "recorded states: " + recordedStates.join(", "));
            } finally {
                if (!replyStopped) await reply?.stop?.().catch(() => {});
                await plebbit.destroy();
                await context.cleanup();
            }
        });
    });
});

gatewayConfigs.map((config) => {
    describeSkipIfRpc.concurrent(`reply.updatingState parent page CIDs gateway (node) - ${config.name}`, async () => {
        it(`updating state of reply is in correct order upon updating a reply that's loading from parent pageCids`, async () => {
            const context = await createReplyParentPagesTestEnvironment();
            const plebbit = await config.plebbitInstancePromise();
            const expectedStates = [
                "fetching-ipfs",
                "succeeded",
                "fetching-update-ipfs",
                "succeeded",
                "fetching-subplebbit-ipns",
                "waiting-retry",
                "fetching-subplebbit-ipns",
                "fetching-update-ipfs",
                "succeeded",
                "stopped"
            ];
            const recordedStates = [];
            let reply;
            try {
                reply = await plebbit.createComment({ cid: context.replyCid });

                expect(reply.content).to.be.undefined;
                expect(reply.updatedAt).to.be.undefined;

                reply.on("updatingstatechange", (newState) => recordedStates.push(newState));

                await reply.update();
                // mockReplyToUseParentPagesForUpdates(reply); // do we even need this? I think if context is correctly created then we shouldn't need to mock anything
                expect(reply.content).to.be.undefined;
                expect(reply.updatedAt).to.be.undefined;
                await resolveWhenConditionIsTrue({ toUpdate: reply, predicate: () => typeof reply.updatedAt === "number" });

                const updatingMockReply = plebbit._updatingComments[reply.cid];
                const numOfUpdates = recordedStates.filter((state) => state === "succeeded").length - 1; // -1 is because we wanna subtract CommentIpfs update
                expect(updatingMockReply._clientsManager._parentFirstPageCidsAlreadyLoaded.size).to.be.greaterThanOrEqual(numOfUpdates);

                await reply.stop();

                expect(reply.content).to.exist;
                expect(reply.updatedAt).to.be.a("number");

                const filteredExpectedStates = cleanupStateArray(expectedStates);
                const filteredRecordedStates = cleanupStateArray(recordedStates);
                const trimmedRecordedStates = filteredRecordedStates.slice(0, filteredExpectedStates.length);
                expect(trimmedRecordedStates).to.deep.equal(filteredExpectedStates);
                expect(filteredRecordedStates[filteredRecordedStates.length - 1]).to.equal("stopped");
            } finally {
                await reply?.stop?.().catch(() => {});
                await plebbit.destroy();
                await context.cleanup();
            }
        });
    });
});

allPlebbitConfigs.map((config) => {
    describeSkipIfRpc.concurrent(`reply.updatingState parent page event order (node) - ${config.name}`, async () => {
        it(`the order of state-event-statechange is correct when we retrieve a reply by loading it from its parent pageCids`, async () => {
            const context = await createReplyParentPagesTestEnvironment();
            const plebbit = await config.plebbitInstancePromise();
            const recordedStates = [];
            let reply;
            let replyStopped = false;
            try {
                reply = await plebbit.createComment({ cid: context.replyCid });

                expect(reply.content).to.be.undefined;
                expect(reply.updatedAt).to.be.undefined;

                reply.on("updatingstatechange", (newState) => recordedStates.push(newState));

                const commentUpdatePromise = new Promise((resolve, reject) => {
                    reply.on("update", () => {
                        if (!reply.updatedAt) return;
                        if (reply.updatingState !== "succeeded") reject("updating state should be succeeded after getting comment ipfs");
                        if (recordedStates.length === 0) reject("should have emitted an event");
                        if (recordedStates[recordedStates.length - 1] === "succeeded") reject("should not emit an event just yet");
                        resolve();
                    });
                });

                await reply.update();
                mockReplyToUseParentPagesForUpdates(reply);
                expect(reply.content).to.be.undefined;
                expect(reply.updatedAt).to.be.undefined;
                await commentUpdatePromise;

                await reply.stop();
                replyStopped = true;
            } finally {
                if (!replyStopped) await reply?.stop?.().catch(() => {});
                await plebbit.destroy();
                await context.cleanup();
            }
        });
    });
});

async function createReplyParentPagesTestEnvironment() {
    const publisherPlebbit = await mockPlebbit();
    const subplebbit = await createSubWithNoChallenge({}, publisherPlebbit);
    let parentComment;
    try {
        await subplebbit.start();
        await resolveWhenConditionIsTrue({ toUpdate: subplebbit, predicate: () => typeof subplebbit.updatedAt === "number" });

        const post = await publishRandomPost(subplebbit.address, publisherPlebbit);
        parentComment = await publisherPlebbit.createComment({ cid: post.cid });
        await parentComment.update();
        await resolveWhenConditionIsTrue({ toUpdate: parentComment, predicate: () => typeof parentComment.updatedAt === "number" });

        const replies = [];
        for (let i = 0; i < 3; i++) {
            replies.push(await publishRandomReply(parentComment, publisherPlebbit));
        }

        await parentComment.update();
        await resolveWhenConditionIsTrue({
            toUpdate: parentComment,
            predicate: () => (parentComment.replyCount ?? 0) >= replies.length
        });

        await forcePagesToUsePageCidsOnly({ subplebbit, parentComment });
        await parentComment.update();
        await resolveWhenConditionIsTrue({
            toUpdate: parentComment,
            predicate: () => Object.keys(parentComment.replies.pageCids).length > 0
        });

        const replyUnderTest = replies[replies.length - 1];
        if (!replyUnderTest?.cid) throw new Error("reply cid should be defined");

        const cleanup = async () => {
            await parentComment?.stop?.().catch(() => {});
            await subplebbit.delete().catch(() => {});
            await publisherPlebbit.destroy().catch(() => {});
        };

        return {
            publisherPlebbit,
            replyCid: replyUnderTest.cid,
            cleanup
        };
    } catch (error) {
        await parentComment?.stop?.().catch(() => {});
        await subplebbit.delete().catch(() => {});
        await publisherPlebbit.destroy().catch(() => {});
        throw error;
    }
}

const cleanupStateArray = (states) => {
    const filteredStates = [...states];

    for (let i = 0; i < filteredStates.length; i++) {
        if (filteredStates[i] === "waiting-retry") {
            filteredStates.splice(i, 1);
            i--;
        }
    }

    for (let i = 0; i < filteredStates.length - 1; i++) {
        if (filteredStates[i] === filteredStates[i + 1]) {
            filteredStates.splice(i + 1, 1);
            i--;
        }
    }

    const patternA = "fetching-subplebbit-ipns";
    const patternB = "fetching-subplebbit-ipfs";
    for (let i = 0; i <= filteredStates.length - 4; i++) {
        if (
            filteredStates[i] === patternA &&
            filteredStates[i + 1] === patternB &&
            filteredStates[i + 2] === patternA &&
            filteredStates[i + 3] === patternB
        ) {
            filteredStates.splice(i + 2, 2);
            i--;
        }
    }

    const patternC = "fetching-update-ipfs";
    const patternD = "succeeded";
    for (let i = 0; i <= filteredStates.length - 8; i++) {
        if (
            filteredStates[i] === patternA &&
            filteredStates[i + 1] === patternB &&
            filteredStates[i + 2] === patternC &&
            filteredStates[i + 3] === patternD &&
            filteredStates[i + 4] === patternA &&
            filteredStates[i + 5] === patternB &&
            filteredStates[i + 6] === patternC &&
            filteredStates[i + 7] === patternD
        ) {
            filteredStates.splice(i + 4, 4);
            i--;
        }
    }

    const patternE = "failed";
    for (let i = 0; i <= filteredStates.length - 4; i++) {
        if (
            filteredStates[i] === patternA &&
            filteredStates[i + 1] === patternB &&
            filteredStates[i + 2] === patternC &&
            filteredStates[i + 3] === patternE
        ) {
            filteredStates.splice(i, 4);
            i--;
        }
    }

    return filteredStates;
};
