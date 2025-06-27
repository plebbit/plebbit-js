import { expect } from "chai";
import {
    mockPlebbit,
    mockReplyToUseParentPagesForUpdates,
    processAllCommentsRecursively,
    findOrPublishCommentWithDepth,
    publishRandomPost,
    createSubWithNoChallenge,
    publishRandomReply,
    describeSkipIfRpc,
    mockCommentToNotUsePagesForUpdates,
    resolveWhenConditionIsTrue,
    waitTillPostInSubplebbitPages,
    mockPlebbitNoDataPathWithOnlyKuboClient,
    forceSubplebbitToGenerateAllRepliesPages
} from "../../../dist/node/test/test-util.js";
import Logger from "@plebbit/plebbit-logger";

describeSkipIfRpc("subplebbit.postUpdates", async () => {
    let plebbit, subplebbit, remotePlebbit;
    const replyCidByDepth = {};
    before(async () => {
        plebbit = await mockPlebbit();
        subplebbit = await createSubWithNoChallenge({}, plebbit);
        await subplebbit.start();
        await resolveWhenConditionIsTrue(subplebbit, () => typeof subplebbit.updatedAt === "number");
    });

    beforeEach(async () => {
        remotePlebbit = await mockPlebbitNoDataPathWithOnlyKuboClient();
    });
    afterEach(async () => {
        await remotePlebbit.destroy();
    });

    after(async () => {
        await subplebbit.delete();
        await plebbit.destroy();
        for (const depth of Object.keys(replyCidByDepth)) delete replyCidByDepth[depth];
    });

    it(`subplebbit.postUpdates is undefined if there are no comments`, async () => {
        expect(subplebbit.postUpdates).to.be.undefined;
    });

    it(`subplebbit.postUpdates = {86400} when a post is published`, async () => {
        const post = await publishRandomPost(subplebbit.address, remotePlebbit);
        await waitTillPostInSubplebbitPages(post, remotePlebbit);

        const postRecreated = await remotePlebbit.createComment({ cid: post.cid });
        await postRecreated.update();
        mockCommentToNotUsePagesForUpdates(postRecreated);

        await resolveWhenConditionIsTrue(postRecreated, () => typeof postRecreated.updatedAt === "number");
        await resolveWhenConditionIsTrue(subplebbit, () => subplebbit.postUpdates);

        expect(postRecreated._commentUpdateIpfsPath?.endsWith("/update")).to.be.true; // should fetch from post updates directory
        expect(postRecreated.updatedAt).to.be.a("number"); // check for commentUpdate props
        expect(postRecreated.content).to.be.a("string"); // check for CommentIpfs props
        expect(subplebbit.postUpdates).to.exist;
        expect(Object.keys(subplebbit.postUpdates)).to.deep.equal(["86400"]);
        await postRecreated.stop();
    });

    [1, 2, 3].map((depth) => {
        it(`Can publish a reply with depth = ${depth} to a post and fetch updates from its post's pages`, async () => {
            const log = Logger("plebbit-js:test:subplebbit:postUpdates:publishReplyWithDepth");
            // This test is flaky

            // is it possibly only failing when reply is fetched using pages?
            const parentCid = await findOrPublishCommentWithDepth(depth - 1, subplebbit);

            const parentCommentInstance = await remotePlebbit.createComment({ cid: parentCid });
            await parentCommentInstance.update();
            await resolveWhenConditionIsTrue(parentCommentInstance, () => typeof parentCommentInstance.updatedAt === "number");

            await forceSubplebbitToGenerateAllRepliesPages(parentCommentInstance);
            log("Forced subplebbit to generate all replies pages of comment", parentCommentInstance.cid);

            await parentCommentInstance.stop(); // seems like this line fixes the flakiness

            const reply = await publishRandomReply(parentCommentInstance, remotePlebbit);
            log("Published reply under comment", parentCommentInstance.cid, "with cid", reply.cid, "and depth", reply.depth);
            expect(reply.depth).to.equal(depth);
            replyCidByDepth[depth] = reply.cid;

            // is it possible that local subplebbit is publishing a parent comment with outdated pageCids
            // maybe we should have a setInterval printing pageCids of parent comment, with local plebbit

            log("Creating and updating reply", reply.cid, "and depth", reply.depth);
            const replyRecreated = await remotePlebbit.createComment({ cid: reply.cid });

            const intervalId = setInterval(async () => {
                const replyFromLocalPlebbit = await plebbit.createComment({ cid: reply.cid });
                await replyFromLocalPlebbit.update();
                await resolveWhenConditionIsTrue(replyFromLocalPlebbit, () => typeof replyFromLocalPlebbit.updatedAt === "number");
                console.log("reply from local plebbit", replyFromLocalPlebbit.cid, "updatedAt", replyFromLocalPlebbit.updatedAt);
                console.log("reply from remote plebbit", replyRecreated.cid, "updatedAt", replyRecreated.updatedAt);
                await replyFromLocalPlebbit.stop();
            }, 10000);

            await replyRecreated.update();
            mockReplyToUseParentPagesForUpdates(replyRecreated);

            await resolveWhenConditionIsTrue(replyRecreated, () => typeof replyRecreated.updatedAt === "number");

            expect(replyRecreated._commentUpdateIpfsPath).to.be.undefined; // should be undefined for replies since we're not including them in post updates
            expect(replyRecreated.updatedAt).to.be.a("number"); // check for commentUpdate props
            expect(replyRecreated.content).to.be.a("string"); // check for CommentIpfs props

            const updatingReply = replyRecreated._plebbit._updatingComments[replyRecreated.cid];
            expect(updatingReply._clientsManager._parentFirstPageCidsAlreadyLoaded.size).to.be.greaterThan(0);

            expect(Object.keys(subplebbit.postUpdates)).to.deep.equal(["86400"]);

            clearInterval(intervalId);
            await replyRecreated.stop();
            await parentCommentInstance.stop();
        });
    });

    it(`subplebbit.postUpdates moves posts from bucket to more accurate bucket`, async () => {
        // For example, we have a bucket 86400 which is for the last 24 hours,
        // But if we have a new bucket, 43200 for the last 12 hours, the post from previous tests should be moved to it
        subplebbit._postUpdatesBuckets = [43200, ...subplebbit._postUpdatesBuckets];
        await resolveWhenConditionIsTrue(
            subplebbit,
            () => Object.keys(subplebbit.postUpdates).length === 1 && Object.keys(subplebbit.postUpdates)[0] === "43200"
        );
        expect(Object.keys(subplebbit.postUpdates)).to.deep.equal(["43200"]);
    });

    it(`Can fetch post updates with new bucket`, async () => {
        const postCid = subplebbit.posts.pages.hot.comments[0].cid;
        const post = await remotePlebbit.createComment({ cid: postCid });
        await post.update();
        mockCommentToNotUsePagesForUpdates(post);

        await resolveWhenConditionIsTrue(post, () => typeof post.updatedAt === "number");
        expect(post.content).to.be.a("string"); // comment ipfs has been loaded
        expect(post.updatedAt).to.be.a("number"); // comment update has been loaded

        expect(post._commentUpdateIpfsPath).to.be.a("string");
        expect(post._commentUpdateIpfsPath?.endsWith("/update")).to.be.true; // should fetch from post updates directory

        await post.stop();
    });

    [1, 2].map((depth) => {
        it(`Can fetch updates from reply with depth = ${depth} with new bucket`, async () => {
            const replyCid = replyCidByDepth[depth];

            // Create and update the reply comment
            expect(replyCid).to.be.a("string");
            const reply = await remotePlebbit.createComment({ cid: replyCid });
            await reply.update();
            mockReplyToUseParentPagesForUpdates(reply);

            // Wait for CommentIpfs update
            await resolveWhenConditionIsTrue(reply, () => typeof reply.updatedAt === "number");
            expect(reply.content).to.be.a("string"); // should load commentIpfs
            expect(reply.updatedAt).to.be.a("number"); // should load commentUpdate
            expect(reply._commentUpdateIpfsPath).to.be.undefined; // should be undefined for replies since we're not including them in post updates

            // Cleanup
            await reply.stop();
        });
    });
});
