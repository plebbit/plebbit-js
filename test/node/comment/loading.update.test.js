import { expect } from "chai";
import {
    createSubWithNoChallenge,
    describeSkipIfRpc,
    forceParentRepliesToAlwaysGenerateMultipleChunks,
    forceSubplebbitToGenerateAllPostsPages,
    forceSubplebbitToGenerateAllRepliesPages,
    getAvailablePlebbitConfigsToTestAgainst,
    mockPlebbit,
    mockReplyToUseParentPagesForUpdates,
    publishRandomPost,
    publishRandomReply,
    resolveWhenConditionIsTrue
} from "../../../dist/node/test/test-util.js";
import { describe, it } from "vitest";

// this test is testing the loading logic of Comment at a different depths
// it was made because testing it on test-server.js subs take too long

const plebbitLoadingConfigs = getAvailablePlebbitConfigsToTestAgainst({ includeAllPossibleConfigOnEnv: true });
const replyDepthsToTest = [1, 2, 3, 15, 30, 45];

describeSkipIfRpc("comment.update loading depth coverage", function () {
    describe.sequential(`post loading coverage`, () => {
        let context;

        before(async () => {
            context = await createPostDepthTestEnvironment({
                forceSubplebbitPostsPageCids: false
            });
        });

        after(async () => {
            await context?.cleanup();
        });

        it.sequential("loads post updates when the sub was stopped", async () => {
            const postComment = await context.plebbit.createComment({ cid: context.rootCid });
            const subInstance = context.subplebbit;
            await subInstance.stop();

            try {
                expect(subInstance.state).to.equal("stopped");

                await postComment.update();
                await waitForReplyToMatchStoredUpdate(postComment, context.expectedPostUpdate.updatedAt);
                expect(postComment.updatedAt).to.equal(context.expectedPostUpdate.updatedAt);
                const updatingPost = postComment._plebbit._updatingComments[postComment.cid];
                expect(updatingPost).to.exist;
                expect(updatingPost.depth).to.equal(0);
            } finally {
                await postComment.stop();
            }
        });

        it("loads post updates while the sub keeps running on the same plebbit instance", async () => {
            const postComment = await context.plebbit.createComment({ cid: context.rootCid });

            const subInstance = context.subplebbit;
            if (subInstance.state !== "started") await subInstance.start();
            try {
                expect(subInstance.state).to.equal("started");
                await postComment.update();
                await waitForReplyToMatchStoredUpdate(postComment, context.expectedPostUpdate.updatedAt);
                expect(postComment.updatedAt).to.equal(context.expectedPostUpdate.updatedAt);
                const updatingPost = postComment._plebbit._updatingComments[postComment.cid];
                expect(updatingPost).to.exist;
                expect(updatingPost.depth).to.equal(0);
            } finally {
                await postComment.stop();
            }
        });

        plebbitLoadingConfigs.forEach((plebbitConfig) => {
            describe.sequential(`post loading with ${plebbitConfig.name}`, () => {
                it("loads post updates while the sub keeps updating", async () => {
                    const subInstance = context.subplebbit;
                    const remotePlebbit = await plebbitConfig.plebbitInstancePromise();
                    try {
                        const postComment = await remotePlebbit.createComment({ cid: context.rootCid });
                        expect(subInstance.state).to.equal("started");
                        await postComment.update();
                        await waitForReplyToMatchStoredUpdate(postComment, context.expectedPostUpdate.updatedAt);
                        expect(postComment.updatedAt).to.equal(context.expectedPostUpdate.updatedAt);
                        const updatingPost = postComment._plebbit._updatingComments[postComment.cid];
                        expect(updatingPost).to.exist;
                        expect(updatingPost.depth).to.equal(0);
                    } finally {
                        await remotePlebbit.destroy();
                    }
                });
            });

            describe.sequential("subplebbit posts served via postUpdates", () => {
                let paginationContext;

                before(async () => {
                    paginationContext = await createPostDepthTestEnvironment({
                        forceSubplebbitPostsPageCids: true
                    });
                });

                after(async () => {
                    await paginationContext?.cleanup();
                });

                it.sequential("loads post updates when from subplebbit.postUpdates", async () => {
                    const storedSubplebbitUpdate = paginationContext.forcedSubplebbitStoredUpdate;
                    expect(storedSubplebbitUpdate).to.exist;
                    expect(storedSubplebbitUpdate?.pageCids).to.exist;
                    expect(Object.keys(storedSubplebbitUpdate?.pageCids ?? {})).to.not.be.empty;
                    const storedSubplebbitPages = storedSubplebbitUpdate?.pages || {};
                    Object.values(storedSubplebbitPages).forEach((page) => {
                        if (page?.comments) expect(page.comments).to.deep.equal([]);
                    });

                    const remotePlebbit = await plebbitConfig.plebbitInstancePromise();

                    const postComment = await remotePlebbit.createComment({ cid: paginationContext.rootCid });

                    await postComment.update();
                    await waitForReplyToMatchStoredUpdate(postComment, paginationContext.expectedPostUpdate.updatedAt);
                    expect(postComment.updatedAt).to.equal(paginationContext.expectedPostUpdate.updatedAt);

                    const updatingPost = postComment._plebbit._updatingComments[postComment.cid];
                    expect(updatingPost._commentUpdateIpfsPath).to.be.a("string"); // post shouldn't find itself in pages, rather it needs to use postUpdates
                    await remotePlebbit.destroy();
                });
            });
        });
    });

    replyDepthsToTest.forEach((replyDepth) => {
        describe.concurrent(`reply depth ${replyDepth}`, () => {
            let context;

            before(async () => {
                context = await createReplyDepthTestEnvironment({ replyDepth });
            });

            after(async () => {
                await context?.cleanup();
            });

            it.sequential("loads reply updates when the post was stopped", async () => {
                const replyComment = await context.createLeafComment();
                try {
                    await replyComment.update();
                    await waitForReplyToMatchStoredUpdate(replyComment, context.expectedLeafUpdate.updatedAt);
                    expect(replyComment.updatedAt).to.equal(context.expectedLeafUpdate.updatedAt);
                    const updatingReply = replyComment._plebbit._updatingComments[replyComment.cid];
                    expect(updatingReply).to.exist;
                    const parentForUpdating = updatingReply._clientsManager._postForUpdating;
                    expect(parentForUpdating).to.exist;
                    expect(parentForUpdating.comment.cid).to.equal(context.rootCid);
                    expect(updatingReply.depth).to.equal(replyDepth);
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
                    const updatingReply = replyComment._plebbit._updatingComments[replyComment.cid];
                    expect(updatingReply).to.exist;
                    const parentForUpdating = updatingReply._clientsManager._postForUpdating;
                    expect(parentForUpdating).to.exist;
                    expect(parentForUpdating.comment.cid).to.equal(context.rootCid);
                    expect(updatingReply.depth).to.equal(replyDepth);
                } finally {
                    await replyComment.stop();
                    await postComment.stop();
                }
            });

            describe.sequential("parent replies served via pageCids", () => {
                let paginationContext;

                before(async () => {
                    paginationContext = await createReplyDepthTestEnvironment({
                        replyDepth,
                        forceParentRepliesPageCids: true
                    });
                });

                after(async () => {
                    await paginationContext?.cleanup();
                });

                it.sequential("loads reply updates when the parent was stopped", async () => {
                    const replyComment = await paginationContext.createLeafComment();
                    try {
                        const storedParentUpdate = paginationContext.forcedParentStoredUpdate;
                        expect(storedParentUpdate).to.exist;
                        expect(storedParentUpdate?.replies?.pageCids).to.exist;
                        expect(Object.keys(storedParentUpdate?.replies?.pageCids ?? {})).to.not.be.empty;
                        const storedParentPreloadedPages = storedParentUpdate?.replies?.pages || {};
                        Object.values(storedParentPreloadedPages).forEach((page) => {
                            if (page?.comments) expect(page.comments).to.deep.equal([]);
                        });

                        await replyComment.update();
                        mockReplyToUseParentPagesForUpdates(replyComment);
                        await waitForReplyToMatchStoredUpdate(replyComment, paginationContext.expectedLeafUpdate.updatedAt);
                        expect(replyComment.parentCid).to.equal(paginationContext.leafParentCid);
                        // await waitForParentPageCidsToLoad(replyComment, paginationContext.plebbit);

                        const updatingReply = replyComment._plebbit._updatingComments[replyComment.cid];
                        expect(updatingReply).to.exist;
                        expect(updatingReply._clientsManager._parentFirstPageCidsAlreadyLoaded.size).to.be.greaterThan(0);
                        expect(updatingReply.depth).to.equal(replyDepth);
                    } finally {
                        await replyComment.stop();
                    }
                });

                it("loads reply updates while the parent keeps updating", async () => {
                    const parentComment = await paginationContext.createLeafParentComment();
                    const replyComment = await paginationContext.createLeafComment();
                    try {
                        await parentComment.update();
                        await waitForPostToStartUpdating(parentComment);
                        await replyComment.update();
                        mockReplyToUseParentPagesForUpdates(replyComment);
                        await waitForReplyToMatchStoredUpdate(replyComment, paginationContext.expectedLeafUpdate.updatedAt);
                        // await waitForParentPageCidsToLoad(replyComment, paginationContext.plebbit);
                        expect(replyComment.parentCid).to.equal(paginationContext.leafParentCid);
                        const storedParentUpdate = paginationContext.forcedParentStoredUpdate;
                        expect(storedParentUpdate).to.exist;
                        expect(storedParentUpdate?.replies?.pageCids).to.exist;
                        expect(Object.keys(storedParentUpdate?.replies?.pageCids ?? {})).to.not.be.empty;
                        const storedParentPreloadedPages = storedParentUpdate?.replies?.pages || {};
                        Object.values(storedParentPreloadedPages).forEach((page) => {
                            if (page?.comments) expect(page.comments).to.deep.equal([]);
                        });
                        const updatingReply = replyComment._plebbit._updatingComments[replyComment.cid];
                        expect(updatingReply).to.exist;
                        expect(updatingReply._clientsManager._parentFirstPageCidsAlreadyLoaded.size).to.be.greaterThan(0);
                        expect(updatingReply.depth).to.equal(replyDepth);
                    } finally {
                        await replyComment.stop();
                        await parentComment.stop();
                    }
                });
            });
        });
    });
});

async function createPostDepthTestEnvironment({ forceSubplebbitPostsPageCids = false }) {
    const publisherPlebbit = await mockPlebbit();
    const subplebbit = await createSubWithNoChallenge({}, publisherPlebbit);
    await subplebbit.start();
    await resolveWhenConditionIsTrue({ toUpdate: subplebbit, predicate: () => typeof subplebbit.updatedAt === "number" });

    const post = await publishRandomPost(subplebbit.address, publisherPlebbit);
    const storedPostUpdate = await waitForStoredCommentUpdateWithAssertions(subplebbit, post);

    let forcedSubplebbitStoredUpdate;
    if (forceSubplebbitPostsPageCids) {
        await resolveWhenConditionIsTrue({
            toUpdate: subplebbit,
            predicate: () => typeof subplebbit.updatedAt === "number"
        });
        await forceSubplebbitToGenerateAllPostsPages(subplebbit);
        await resolveWhenConditionIsTrue({
            toUpdate: subplebbit,
            predicate: () => typeof subplebbit.updatedAt === "number"
        });
        clearSubplebbitPreloadedPages(subplebbit);
        forcedSubplebbitStoredUpdate = await waitForStoredSubplebbitPageCids(subplebbit);
    }

    return {
        plebbit: publisherPlebbit,
        subplebbit,
        replyDepth: 0,
        rootCid: post.cid,
        leafCid: post.cid,
        leafParentCid: undefined,
        expectedPostUpdate: storedPostUpdate,
        forcedSubplebbitStoredUpdate,
        cleanup: async () => {
            await subplebbit.delete().catch(() => {});
            await publisherPlebbit.destroy().catch(() => {});
        }
    };
}

async function createReplyDepthTestEnvironment({ replyDepth, forceParentRepliesPageCids = false }) {
    const publisherPlebbit = await mockPlebbit();
    const subplebbit = await createSubWithNoChallenge({}, publisherPlebbit);
    await subplebbit.start();
    await resolveWhenConditionIsTrue({ toUpdate: subplebbit, predicate: () => typeof subplebbit.updatedAt === "number" });

    const chain = await buildReplyDepthChain({ replyDepth, plebbit: publisherPlebbit, subplebbit });

    let forcedParentStoredUpdate;
    if (forceParentRepliesPageCids) {
        if (!chain.parentOfLeafCid) throw new Error("parent cid is required to force page generation");
        const parentComment = await publisherPlebbit.createComment({ cid: chain.parentOfLeafCid });
        try {
            await parentComment.update();
            await resolveWhenConditionIsTrue({
                toUpdate: parentComment,
                predicate: () => typeof parentComment.updatedAt === "number"
            });
            if (!parentComment.cid) throw new Error("parent comment cid should be defined after forcing page generation");
            const cleanupForcedChunking = await forceParentRepliesToAlwaysGenerateMultipleChunks({
                subplebbit,
                parentComment
            });
            try {
                await forceSubplebbitToGenerateAllRepliesPages(parentComment);
            } finally {
                cleanupForcedChunking();
            }
            forcedParentStoredUpdate = await waitForStoredParentPageCids(subplebbit, parentComment.cid);
        } finally {
            await parentComment.stop().catch(() => {});
        }
    }

    return {
        plebbit: publisherPlebbit,
        subplebbit,
        replyDepth,
        rootCid: chain.rootCid,
        leafCid: chain.leafCid,
        leafParentCid: chain.parentOfLeafCid,
        expectedLeafUpdate: chain.expectedLeafUpdate,
        forcedParentStoredUpdate,
        createRootComment: (plebbitInstance = publisherPlebbit) => plebbitInstance.createComment({ cid: chain.rootCid }),
        createLeafComment: (plebbitInstance = publisherPlebbit) => plebbitInstance.createComment({ cid: chain.leafCid }),
        createLeafParentComment: (plebbitInstance = publisherPlebbit) => {
            if (!chain.parentOfLeafCid) throw new Error("leaf parent cid missing");
            return plebbitInstance.createComment({ cid: chain.parentOfLeafCid });
        },
        cleanup: async () => {
            await subplebbit.delete().catch(() => {});
            await publisherPlebbit.destroy().catch(() => {});
        }
    };
}

async function buildReplyDepthChain({ replyDepth, plebbit, subplebbit }) {
    const root = await publishRandomPost(subplebbit.address, plebbit);
    let parent = root;
    let latestStoredUpdate = await waitForStoredCommentUpdateWithAssertions(subplebbit, parent);
    let parentOfLeafCid = root.cid;

    for (let depth = 1; depth <= replyDepth; depth++) {
        parentOfLeafCid = parent.cid;
        const reply = await publishRandomReply(parent, plebbit);
        latestStoredUpdate = await waitForStoredCommentUpdateWithAssertions(subplebbit, reply);
        parent = reply;
    }

    return {
        rootCid: root.cid,
        leafCid: parent.cid,
        parentOfLeafCid,
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

async function waitForStoredParentPageCids(subplebbit, parentCid) {
    const timeoutMs = 60000;
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        const storedUpdate = subplebbit._dbHandler.queryStoredCommentUpdate({ cid: parentCid });
        const pageCids = storedUpdate?.replies?.pageCids;
        if (pageCids && Object.keys(pageCids).length > 0) return storedUpdate;
        await new Promise((resolve) => setTimeout(resolve, 50));
    }
    throw new Error(`Timed out waiting for parent comment ${parentCid} to have replies.pageCids in stored update`);
}

function clearSubplebbitPreloadedPages(subplebbit) {
    const postsPages = subplebbit.posts?.pages;
    if (!postsPages) return;
    Object.keys(postsPages).forEach((sortName) => {
        if (postsPages[sortName]?.comments) postsPages[sortName].comments = [];
    });
}

async function waitForStoredSubplebbitPageCids(subplebbit) {
    const timeoutMs = 60000;
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        const pageCids = subplebbit.posts?.pageCids;
        if (pageCids && Object.keys(pageCids).length > 0) {
            const clonedPageCids = JSON.parse(JSON.stringify(pageCids));
            const sanitizedPages = Object.fromEntries(
                Object.entries(subplebbit.posts?.pages || {}).map(([sortName, page]) => [
                    sortName,
                    page
                        ? {
                              nextCid: page.nextCid,
                              comments: []
                          }
                        : page
                ])
            );
            return { pageCids: clonedPageCids, pages: sanitizedPages };
        }
        await new Promise((resolve) => setTimeout(resolve, 50));
    }
    throw new Error(`Timed out waiting for subplebbit ${subplebbit.address} to have posts.pageCids in stored update`);
}
