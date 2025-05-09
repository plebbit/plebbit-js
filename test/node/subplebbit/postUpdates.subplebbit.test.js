import { expect } from "chai";
import {
    mockPlebbit,
    mockReplyToUseParentPagesForUpdates,
    processAllCommentsRecursively,
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

describeSkipIfRpc("subplebbit.postUpdates", async () => {
    let plebbit, subplebbit, remotePlebbit;
    let replyCidByDepth = {};
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

        expect(postRecreated._commentUpdateIpfsPath?.endsWith("/update")).to.be.true; // should fetch from post updates directory
        expect(postRecreated.updatedAt).to.be.a("number"); // check for commentUpdate props
        expect(postRecreated.content).to.be.a("string"); // check for CommentIpfs props
        expect(Object.keys(subplebbit.postUpdates)).to.deep.equal(["86400"]);
        await postRecreated.stop();
    });

    [1, 2].map((depth) => {
        it(`Can publish a reply with depth = ${depth} to a post and fetch updates from its post's pages`, async () => {
            let parent;
            processAllCommentsRecursively(subplebbit.posts.pages.hot.comments, (comment) => {
                if (comment.depth === depth - 1) parent = comment;
            });
            expect(parent).to.exist;
            const parentCommentInstance = await remotePlebbit.createComment({ cid: parent.cid });
            await parentCommentInstance.update();
            await resolveWhenConditionIsTrue(parentCommentInstance, () => typeof parentCommentInstance.updatedAt === "number");

            await forceSubplebbitToGenerateAllRepliesPages(parentCommentInstance);
            const reply = await publishRandomReply(parentCommentInstance, remotePlebbit);
            expect(reply.depth).to.equal(depth);
            replyCidByDepth[depth] = reply.cid;

            const differentPlebbit = await mockPlebbitNoDataPathWithOnlyKuboClient();
            const replyRecreated = await differentPlebbit.createComment({ cid: reply.cid });
            await replyRecreated.update();
            mockReplyToUseParentPagesForUpdates(replyRecreated);

            await resolveWhenConditionIsTrue(replyRecreated, () => typeof replyRecreated.updatedAt === "number");

            expect(replyRecreated._commentUpdateIpfsPath).to.be.undefined; // should be undefined for replies since we're not including them in post updates
            expect(replyRecreated.updatedAt).to.be.a("number"); // check for commentUpdate props
            expect(replyRecreated.content).to.be.a("string"); // check for CommentIpfs props

            expect(Object.keys(subplebbit.postUpdates)).to.deep.equal(["86400"]);

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
