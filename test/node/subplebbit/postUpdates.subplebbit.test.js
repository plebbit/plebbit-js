import { expect } from "chai";
import {
    mockPlebbit,
    publishRandomPost,
    createSubWithNoChallenge,
    publishRandomReply,
    describeSkipIfRpc,
    mockCommentToNotUsePagesForUpdates,
    resolveWhenConditionIsTrue,
    waitTillPostInSubplebbitPages,
    mockPlebbitNoDataPathWithOnlyKuboClient
} from "../../../dist/node/test/test-util.js";

describeSkipIfRpc("subplebbit.postUpdates", async () => {
    let plebbit, subplebbit, remotePlebbit;
    before(async () => {
        plebbit = await mockPlebbit();
        subplebbit = await createSubWithNoChallenge({}, plebbit);
        await subplebbit.start();
        await resolveWhenConditionIsTrue(subplebbit, () => typeof subplebbit.updatedAt === "number");
        remotePlebbit = await mockPlebbitNoDataPathWithOnlyKuboClient();
    });

    after(async () => {
        await subplebbit.delete();
        await plebbit.destroy();
        await remotePlebbit.destroy();
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

    it(`Can publish a reply to a post and fetch updates from its flat pages`, async () => {
        const post = await remotePlebbit.getComment(subplebbit.posts.pages.hot.comments[0].cid);
        const reply = await publishRandomReply(post, remotePlebbit);

        const replyRecreated = await remotePlebbit.createComment({ cid: reply.cid });
        await replyRecreated.update();
        mockCommentToNotUsePagesForUpdates(replyRecreated);

        await resolveWhenConditionIsTrue(replyRecreated, () => typeof replyRecreated.updatedAt === "number");

        expect(replyRecreated._commentUpdateIpfsPath).to.be.undefined; // should be undefined for replies since we're not including them in post updates
        expect(replyRecreated.updatedAt).to.be.a("number"); // check for commentUpdate props
        expect(replyRecreated.content).to.be.a("string"); // check for CommentIpfs props

        expect(Object.keys(subplebbit.postUpdates)).to.deep.equal(["86400"]);

        await replyRecreated.stop();
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

    it(`Can fetch updates from post with new bucket`, async () => {
        const postCid = subplebbit.posts.pages.hot.comments[0].cid;
        const post = await remotePlebbit.createComment({ cid: postCid });
        await post.update();
        mockCommentToNotUsePagesForUpdates(post);

        // Wait for CommentIpfs update
        await new Promise((resolve) => post.once("update", resolve));
        expect(post.content).to.be.a("string");

        // Wait for CommentUpdate
        await new Promise((resolve) => post.once("update", resolve));
        expect(post.updatedAt).to.be.a("number");

        expect(post._commentUpdateIpfsPath?.endsWith("/update")).to.be.true; // should fetch from post updates directory

        await post.stop();
    });

    it(`Can fetch updates from reply with new bucket`, async () => {
        // First get the post to access its replies
        const postCid = subplebbit.posts.pages.hot.comments[0].cid;
        const post = await remotePlebbit.createComment({ cid: postCid });
        await post.update();
        await resolveWhenConditionIsTrue(post, () => post.replies.pages?.topAll);
        expect(post.replyCount).to.be.greaterThan(0);

        // Get the reply cid
        const replyCid = post.replies.pages.topAll.comments[0].cid;

        // Create and update the reply comment
        const reply = await remotePlebbit.createComment({ cid: replyCid });
        await reply.update();
        mockCommentToNotUsePagesForUpdates(reply);

        // Wait for CommentIpfs update
        await new Promise((resolve) => reply.once("update", resolve));
        expect(reply.content).to.be.a("string");

        // Wait for CommentUpdate update
        await new Promise((resolve) => reply.once("update", resolve));
        expect(reply.updatedAt).to.be.a("number");

        // Cleanup
        await reply.stop();
        await post.stop();
    });
});
