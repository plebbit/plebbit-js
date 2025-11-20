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
    resolveWhenConditionIsTrue
} from "../../../../../dist/node/test/test-util.js";

const plebbitConfigs = getAvailablePlebbitConfigsToTestAgainst({ includeAllPossibleConfigOnEnv: true });

// TODO have different depths config
// TODO have context be created once, instead of for each it
plebbitConfigs.map((config) => {
    describeSkipIfRpc.sequential(`reply.updatingState via parent pageCIDs (node) - ${config.name}`, async () => {
        it(`loads reply updates from parent pageCIDs and emits expected state transitions - ${config.name}`, async () => {
            const context = await createReplyParentPagesTestEnvironment();
            const plebbit = await config.plebbitInstancePromise();

            const recordedStates = [];
            let reply;
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
                        resolve(undefined);
                    });
                });

                await reply.update();
                mockReplyToUseParentPagesForUpdates(reply); // is this needed?
                expect(reply.content).to.be.undefined;
                expect(reply.updatedAt).to.be.undefined;

                await commentUpdatePromise;
                await resolveWhenConditionIsTrue({ toUpdate: reply, predicate: () => typeof reply.updatedAt === "number" });

                const updatingMockReply = plebbit._updatingComments[reply.cid];
                expect(updatingMockReply).to.exist;
                const numOfUpdates = recordedStates.filter((state) => state === "succeeded").length - 1;
                expect(updatingMockReply._clientsManager._parentFirstPageCidsAlreadyLoaded.size).to.be.greaterThanOrEqual(numOfUpdates);

                await reply.stop();

                const filteredRecordedStates = cleanupStateArray(recordedStates);
                const configCode = config.testConfigCode;
                const expectedStates = getExpectedStatesForConfig(configCode);
                const trimmedRecordedStates = filteredRecordedStates.slice(0, expectedStates.length);
                expect(trimmedRecordedStates).to.deep.equal(expectedStates, "recorded states: " + filteredRecordedStates.join(", "));
                expect(filteredRecordedStates[filteredRecordedStates.length - 1]).to.equal("stopped");
            } finally {
                await reply?.stop?.().catch(() => {});
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

function getExpectedStatesForConfig(configCode) {
    if (!configCode) throw new Error("plebbit config code is required");
    const normalizedCode = configCode.toLowerCase();
    const base = ["fetching-ipfs", "succeeded"];

    if (normalizedCode === "remote-ipfs-gateway") {
        return cleanupStateArray([...base, "fetching-subplebbit-ipns", "fetching-update-ipfs", "succeeded", "stopped"]);
    }

    if (normalizedCode === "local-kubo-rpc") {
        return cleanupStateArray([...base, "fetching-update-ipfs", "succeeded", "stopped"]);
    }

    if (normalizedCode === "remote-libp2pjs") {
        return cleanupStateArray([
            ...base,
            "fetching-subplebbit-ipns",
            "fetching-subplebbit-ipfs",
            "fetching-update-ipfs",
            "succeeded",
            "stopped"
        ]);
    }

    // default (e.g. remote Kubo without datapath)
    return cleanupStateArray([
        ...base,
        "fetching-subplebbit-ipns",
        "fetching-subplebbit-ipfs",
        "fetching-update-ipfs",
        "succeeded",
        "stopped"
    ]);
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
