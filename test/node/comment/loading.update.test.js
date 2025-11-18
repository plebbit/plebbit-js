import { expect } from "chai";
import {
    createSubWithNoChallenge,
    describeSkipIfRpc,
    mockPlebbit,
    publishRandomPost,
    publishRandomReply,
    resolveWhenConditionIsTrue
} from "../../../dist/node/test/test-util.js";

// this test is testing the loading logic of Comment at a different depths
// it was made because testing it on test-server.js subs take too long


const depthsToTest = [1, 2, 3, 15, 30, 45, 70];

describeSkipIfRpc("comment.update loading depth coverage", function () {
    depthsToTest.forEach((replyDepth) => {
        describe(`reply depth ${replyDepth}`, () => {
            let context;

            before(async () => {
                context = await createReplyDepthTestEnvironment({ replyDepth });
            });

            after(async () => {
                await context?.cleanup();
            });

            it("loads reply updates when the post was stopped", async () => {
                const replyComment = await context.createLeafComment();
                try {
                    await replyComment.update();
                    await waitForReplyToMatchStoredUpdate(replyComment, context.expectedLeafUpdate.updatedAt);
                    expect(replyComment.updatedAt).to.equal(context.expectedLeafUpdate.updatedAt);
                    const updatingReply = context.plebbit._updatingComments[replyComment.cid];
                    expect(updatingReply).to.exist;
                    const parentForUpdating = updatingReply._clientsManager._postForUpdating;
                    expect(parentForUpdating).to.exist;
                    expect(parentForUpdating.comment.cid).to.equal(context.rootCid);
                } finally {
                    await replyComment.stop();
                }
            });

            it("loads reply updates while the post keeps updating", async () => {
                const postComment = await context.createRootComment();
                const replyComment = await context.createLeafComment();
                try {
                    await postComment.update();
                    await waitForPostToStartUpdating(postComment);
                    await replyComment.update();
                    await waitForReplyToMatchStoredUpdate(replyComment, context.expectedLeafUpdate.updatedAt);
                    expect(replyComment.updatedAt).to.equal(context.expectedLeafUpdate.updatedAt);
                    const updatingReply = context.plebbit._updatingComments[replyComment.cid];
                    expect(updatingReply).to.exist;
                    const parentForUpdating = updatingReply._clientsManager._postForUpdating;
                    expect(parentForUpdating).to.exist;
                    expect(parentForUpdating.comment.cid).to.equal(context.rootCid);
                } finally {
                    await replyComment.stop();
                    await postComment.stop();
                }
            });
        });
    });
});

async function createReplyDepthTestEnvironment({ replyDepth }) {
    const plebbit = await mockPlebbit();
    const subplebbit = await createSubWithNoChallenge({}, plebbit);
    await subplebbit.start();
    await resolveWhenConditionIsTrue({ toUpdate: subplebbit, predicate: () => typeof subplebbit.updatedAt === "number" });

    const chain = await buildReplyDepthChain({ replyDepth, plebbit, subplebbit });

    return {
        plebbit,
        subplebbit,
        replyDepth,
        rootCid: chain.rootCid,
        leafCid: chain.leafCid,
        expectedLeafUpdate: chain.expectedLeafUpdate,
        createRootComment: () => plebbit.createComment({ cid: chain.rootCid }),
        createLeafComment: () => plebbit.createComment({ cid: chain.leafCid }),
        cleanup: async () => {
            await subplebbit.delete().catch(() => {});
            await plebbit.destroy().catch(() => {});
        }
    };
}

async function buildReplyDepthChain({ replyDepth, plebbit, subplebbit }) {
    const root = await publishRandomPost(subplebbit.address, plebbit);
    let parent = root;
    let latestStoredUpdate = await waitForStoredCommentUpdateWithAssertions(subplebbit, parent);

    for (let depth = 1; depth <= replyDepth; depth++) {
        const reply = await publishRandomReply(parent, plebbit);
        latestStoredUpdate = await waitForStoredCommentUpdateWithAssertions(subplebbit, reply);
        parent = reply;
    }

    return {
        rootCid: root.cid,
        leafCid: parent.cid,
        expectedLeafUpdate: latestStoredUpdate
    };
}

async function waitForStoredCommentUpdateWithAssertions(subplebbit, comment) {
    const storedUpdate = await waitForStoredCommentUpdate(subplebbit, comment.cid);
    expect(storedUpdate.cid).to.equal(comment.cid);
    expect(storedUpdate.updatedAt).to.be.a("number");
    expect(storedUpdate.replyCount).to.be.a("number");
    expect(storedUpdate.protocolVersion).to.be.a("string");
    expect(storedUpdate.signature).to.be.an("object");
    expect(storedUpdate.signature.signedPropertyNames).to.be.an("array").that.is.not.empty;
    return storedUpdate;
}

async function waitForStoredCommentUpdate(subplebbit, cid) {
    const timeoutMs = 60000;
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        const stored = subplebbit._dbHandler.queryStoredCommentUpdate({ cid });
        if (stored) return stored;
        await new Promise((resolve) => setTimeout(resolve, 50));
    }
    throw new Error(`Timed out waiting for stored comment update for ${cid}`);
}

async function waitForReplyToMatchStoredUpdate(replyComment, expectedUpdatedAt) {
    await resolveWhenConditionIsTrue({
        toUpdate: replyComment,
        predicate: () => typeof replyComment.updatedAt === "number" && replyComment.updatedAt >= expectedUpdatedAt
    });
}

async function waitForPostToStartUpdating(postComment) {
    await resolveWhenConditionIsTrue({
        toUpdate: postComment,
        predicate: () => typeof postComment.updatedAt === "number"
    });
}
