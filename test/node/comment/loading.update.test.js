import { expect } from "chai";
import {
    createSubWithNoChallenge,
    describeSkipIfRpc,
    forceLocalSubPagesToAlwaysGenerateMultipleChunks,
    getAvailablePlebbitConfigsToTestAgainst,
    mockCommentToNotUsePagesForUpdates,
    mockPlebbit,
    mockReplyToUseParentPagesForUpdates,
    publishRandomPost,
    waitTillReplyInParentPages,
    waitTillPostInSubplebbitPages,
    publishRandomReply,
    resolveWhenConditionIsTrue
} from "../../../dist/node/test/test-util.js";
import { PlebbitError } from "../../../dist/node/plebbit-error.js";
import { describe, it } from "vitest";

// this test is testing the loading logic of Comment at a different depths
// it was made because testing it on test-server.js subs take too long

const plebbitLoadingConfigs = getAvailablePlebbitConfigsToTestAgainst({ includeAllPossibleConfigOnEnv: true });
const replyDepthsToTest = [1, 2, 3, 10];

describeSkipIfRpc("comment.update loading depth coverage", function () {
    describe.concurrent(`post loading coverage`, () => {
        let context;

        before(async () => {
            context = await createPostDepthTestEnvironment({
                forceSubplebbitPostsPageCids: false
            });
        });

        after(async () => {
            await context.cleanup();
        });

        it.sequential("loads post updates when the sub was stopped", async () => {
            const postComment = await context.plebbit.createComment({ cid: context.rootCid });
            const subInstance = context.subplebbit;
            await subInstance.stop();

            try {
                expect(subInstance.state).to.equal("stopped");

                await postComment.update();
                await waitForCommentToMatchStoredUpdate(postComment, context.expectedPostUpdate.updatedAt);
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
                await waitForCommentToMatchStoredUpdate(postComment, context.expectedPostUpdate.updatedAt);
                expect(postComment.updatedAt).to.equal(context.expectedPostUpdate.updatedAt);
                const updatingPost = postComment._plebbit._updatingComments[postComment.cid];
                expect(updatingPost).to.exist;
                expect(updatingPost.depth).to.equal(0);
            } finally {
                await postComment.stop();
            }
        });

        describe("subplebbit posts served via postUpdates", () => {
            let paginationContext;

            before(async () => {
                paginationContext = await createPostDepthTestEnvironment({
                    forceSubplebbitPostsPageCids: true
                });
            });

            after(async () => {
                await paginationContext.cleanup();
            });

            plebbitLoadingConfigs.forEach((plebbitConfig) => {
                it("loads post updates when from subplebbit.postUpdates - Remote plebbit config " + plebbitConfig.name, async () => {
                    const storedSubplebbitUpdate = paginationContext.forcedSubplebbitStoredUpdate;
                    expect(storedSubplebbitUpdate).to.exist;
                    expect(storedSubplebbitUpdate?.pageCids).to.exist;
                    expect(Object.keys(storedSubplebbitUpdate?.pageCids ?? {})).to.not.be.empty;
                    const storedSubplebbitPages = storedSubplebbitUpdate?.pages || {};
                    Object.values(storedSubplebbitPages).forEach((page) => {
                        if (page?.comments) expect(page.comments).to.deep.equal([]);
                    });

                    const remotePlebbit = await plebbitConfig.plebbitInstancePromise();

                    try {
                        const postComment = await remotePlebbit.createComment({ cid: paginationContext.rootCid });

                        await postComment.update();
                        await mockCommentToNotUsePagesForUpdates(postComment);
                        await waitForCommentToMatchStoredUpdate(postComment, paginationContext.expectedPostUpdate.updatedAt);
                        expect(postComment.updatedAt).to.be.a("number");
                        expect(postComment.updatedAt).to.be.greaterThanOrEqual(paginationContext.expectedPostUpdate.updatedAt);

                        const updatingPost = postComment._plebbit._updatingComments[postComment.cid];
                        expect(updatingPost._commentUpdateIpfsPath).to.be.a("string"); // post shouldn't find itself in pages, rather it needs to use postUpdates
                    } finally {
                        await remotePlebbit.destroy();
                    }
                });
            });
        });

        plebbitLoadingConfigs.forEach((plebbitConfig) => {
            describe.concurrent(`post loading with ${plebbitConfig.name}`, () => {
                it.sequential("retries loading CommentIpfs when the post cid block is missing on publisher", async () => {
                    let remotePlebbit;
                    let postComment;
                    let publisherPlebbit;
                    try {
                        publisherPlebbit = await mockPlebbit();
                        const sub = await createSubWithNoChallenge({}, publisherPlebbit);
                        await sub.start();
                        await resolveWhenConditionIsTrue({ toUpdate: sub, predicate: () => typeof sub.updatedAt === "number" });
                        const newPost = await publishRandomPost(sub.address, publisherPlebbit);

                        remotePlebbit = await plebbitConfig.plebbitInstancePromise();
                        await waitTillPostInSubplebbitPages(newPost, remotePlebbit);

                        await remotePlebbit.destroy();

                        remotePlebbit = await plebbitConfig.plebbitInstancePromise();

                        remotePlebbit._timeouts["comment-ipfs"] = 250;
                        makeCommentCidFetchFail(remotePlebbit, newPost.cid); // TODO need to clean up this mock

                        const errors = [];
                        postComment = await remotePlebbit.createComment({ cid: newPost.cid, subplebbitAddress: newPost.subplebbitAddress }); // need to include subplebbitAddress or otherwise plebbit-js cant load it from sub pages
                        postComment.on("error", (err) => errors.push(err));

                        await postComment.update();

                        await resolveWhenConditionIsTrue({
                            toUpdate: postComment,
                            predicate: () => typeof postComment.updatedAt === "number"
                        });

                        // should download its props from subplebbit pages
                        expect(postComment.raw.comment).to.be.ok;
                        expect(postComment.raw.commentUpdate).to.be.ok;

                        expect(postComment.updatedAt).to.be.a("number");
                        expect(postComment.state).to.equal("updating");
                        expect(["ERR_FETCH_CID_P2P_TIMEOUT", "ERR_FAILED_TO_FETCH_COMMENT_IPFS_FROM_GATEWAYS"]).to.include(errors[0]?.code);
                        expect(postComment._plebbit._updatingComments[postComment.cid]).to.exist;
                    } finally {
                        await remotePlebbit.destroy();
                        await publisherPlebbit.destroy();
                    }
                });

                it("loads post updates while the sub keeps updating", async () => {
                    const subInstance = context.subplebbit;
                    const remotePlebbit = await plebbitConfig.plebbitInstancePromise();
                    try {
                        const postComment = await remotePlebbit.createComment({ cid: context.rootCid });
                        expect(subInstance.state).to.equal("started");
                        await postComment.update();
                        await waitForCommentToMatchStoredUpdate(postComment, context.expectedPostUpdate.updatedAt);
                        expect(postComment.updatedAt).to.equal(context.expectedPostUpdate.updatedAt);
                        const updatingPost = postComment._plebbit._updatingComments[postComment.cid];
                        expect(updatingPost).to.exist;
                        expect(updatingPost.depth).to.equal(0);
                    } finally {
                        await remotePlebbit.destroy();
                    }
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

            plebbitLoadingConfigs.forEach((plebbitConfig) => {
                describe.sequential(`reply loading with ${plebbitConfig.name}`, () => {
                    it.sequential("retries loading CommentIpfs when the reply cid block is missing on publisher", async () => {
                        let remotePlebbit;
                        let replyComment;
                        let newReply;
                        let parentComment;
                        try {
                            parentComment = await context.plebbit.getComment({ cid: context.leafCid });

                            newReply = await publishRandomReply(parentComment, context.plebbit);
                            await waitTillReplyInParentPages(newReply, context.plebbit);

                            remotePlebbit = await plebbitConfig.plebbitInstancePromise();
                            remotePlebbit._timeouts["comment-ipfs"] = 250;
                            makeCommentCidFetchFail(remotePlebbit, newReply.cid);

                            replyComment = await remotePlebbit.createComment({
                                cid: newReply.cid,
                                subplebbitAddress: parentComment.subplebbitAddress
                            });
                            const errors = [];
                            replyComment.on("error", (err) => errors.push(err));

                            await replyComment.update();

                            await resolveWhenConditionIsTrue({
                                toUpdate: replyComment,
                                predicate: () => typeof replyComment.updatedAt === "number"
                            });

                            // should download its props from subplebbit pages
                            expect(replyComment.raw.comment).to.be.ok;
                            expect(replyComment.raw.commentUpdate).to.be.ok;

                            expect(replyComment.updatedAt).to.be.a("number");
                            expect(replyComment.state).to.equal("updating");
                            expect(["ERR_FETCH_CID_P2P_TIMEOUT", "ERR_FAILED_TO_FETCH_COMMENT_IPFS_FROM_GATEWAYS"]).to.include(
                                errors[0]?.code
                            );
                            expect(replyComment._plebbit._updatingComments[replyComment.cid]).to.exist;
                        } finally {
                            await remotePlebbit.destroy();
                        }
                    });

                    it.sequential("loads reply updates when the post was stopped", async () => {
                        const remotePlebbit = await plebbitConfig.plebbitInstancePromise();
                        const replyComment = await remotePlebbit.getComment({ cid: context.leafCid });
                        try {
                            await replyComment.update();
                            await waitForCommentToMatchStoredUpdate(replyComment, context.expectedLeafUpdate.updatedAt);
                            expect(replyComment.updatedAt).to.be.greaterThanOrEqual(context.expectedLeafUpdate.updatedAt);
                            const updatingReply = replyComment._plebbit._updatingComments[replyComment.cid];
                            expect(updatingReply).to.exist;
                            const parentForUpdating = updatingReply._clientsManager._postForUpdating;
                            expect(parentForUpdating).to.exist;
                            expect(parentForUpdating.comment.cid).to.equal(context.rootCid);
                            expect(updatingReply.depth).to.equal(replyDepth);
                        } finally {
                            await replyComment.stop();
                            await remotePlebbit.destroy();
                        }
                    });

                    it("loads reply updates while the post keeps updating", async () => {
                        const remotePlebbit = await plebbitConfig.plebbitInstancePromise();

                        const postComment = await remotePlebbit.getComment({ cid: context.rootCid });

                        const replyComment = await remotePlebbit.getComment({ cid: context.leafCid });
                        try {
                            await postComment.update();
                            await waitForPostToStartUpdating(postComment);
                            await replyComment.update();
                            await waitForCommentToMatchStoredUpdate(replyComment, context.expectedLeafUpdate.updatedAt);
                            expect(replyComment.updatedAt).to.be.greaterThanOrEqual(context.expectedLeafUpdate.updatedAt);
                            const updatingReply = replyComment._plebbit._updatingComments[replyComment.cid];
                            expect(updatingReply).to.exist;
                            const parentForUpdating = updatingReply._clientsManager._postForUpdating;
                            expect(parentForUpdating).to.exist;
                            expect(parentForUpdating.comment.cid).to.equal(context.rootCid);
                            expect(updatingReply.depth).to.equal(replyDepth);
                        } finally {
                            await replyComment.stop();
                            await postComment.stop();
                            await remotePlebbit.destroy();
                        }
                    });
                });
            });
        });

        describe.concurrent("parent replies served via pageCids with depth " + replyDepth, () => {
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

            plebbitLoadingConfigs.forEach((plebbitConfig) => {
                it("loads reply updates when the parent was stopped", async () => {
                    const remotePlebbit = await plebbitConfig.plebbitInstancePromise();
                    const replyComment = await remotePlebbit.getComment({ cid: paginationContext.leafCid });
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
                        await waitForCommentToMatchStoredUpdate(replyComment, paginationContext.expectedLeafUpdate.updatedAt);
                        expect(replyComment.parentCid).to.equal(paginationContext.leafParentCid);
                        // await waitForParentPageCidsToLoad(replyComment, paginationContext.plebbit);

                        const updatingReply = replyComment._plebbit._updatingComments[replyComment.cid];
                        expect(updatingReply).to.exist;
                        expect(updatingReply._clientsManager._parentFirstPageCidsAlreadyLoaded.size).to.be.greaterThan(0);
                        expect(updatingReply.depth).to.equal(replyDepth);
                    } finally {
                        await remotePlebbit.destroy();
                    }
                });

                it("loads reply updates while the parent keeps updating", async () => {
                    const remotePlebbit = await plebbitConfig.plebbitInstancePromise();
                    const parentComment = await remotePlebbit.getComment({ cid: paginationContext.leafParentCid });
                    const replyComment = await remotePlebbit.getComment({ cid: paginationContext.leafCid });
                    try {
                        await parentComment.update();
                        await waitForPostToStartUpdating(parentComment);
                        await replyComment.update();
                        mockReplyToUseParentPagesForUpdates(replyComment);
                        await waitForCommentToMatchStoredUpdate(replyComment, paginationContext.expectedLeafUpdate.updatedAt);
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
                        await remotePlebbit.destroy();
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
        await forceLocalSubPagesToAlwaysGenerateMultipleChunks({ subplebbit });
        await resolveWhenConditionIsTrue({
            toUpdate: subplebbit,
            predicate: () => typeof subplebbit.updatedAt === "number"
        });
        clearSubplebbitPreloadedPages(subplebbit);
        forcedSubplebbitStoredUpdate = await waitForStoredSubplebbitPageCids(subplebbit);
        // TODO need to load subplebbit.updateCid and verify it actually looks like what we want here
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
            await subplebbit.delete();
            await publisherPlebbit.destroy();
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
            await forceLocalSubPagesToAlwaysGenerateMultipleChunks({ subplebbit, parentComment });
            forcedParentStoredUpdate = await waitForStoredParentPageCids(subplebbit, parentComment.cid);
        } finally {
            await parentComment.stop();
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
        cleanup: async () => {
            await subplebbit.delete();
            await publisherPlebbit.destroy();
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

async function waitForCommentToMatchStoredUpdate(comment, expectedUpdatedAt) {
    await resolveWhenConditionIsTrue({
        toUpdate: comment,
        predicate: () => typeof comment.updatedAt === "number" && comment.updatedAt >= expectedUpdatedAt
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

function makeCommentCidFetchFail(plebbit, cid) {
    if (!plebbit?._inflightFetchManager?._inflightFetches) throw new Error("inflight fetch manager is not available");
    plebbit._memCaches?.commentIpfs?.delete?.(cid);
    const key = `comment-ipfs::${cid}`;
    const rejection = Promise.reject(new PlebbitError("ERR_FETCH_CID_P2P_TIMEOUT", { cid }));
    rejection.catch(() => {}); // mark as handled to avoid unhandled rejection noise in vitest
    plebbit._inflightFetchManager._inflightFetches.set(key, rejection);
}
