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

import chai from "chai";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);
const { expect, assert } = chai;

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
    });

    it(`subplebbit.postUpdates is undefined if there are no comments`, async () => {
        expect(subplebbit.postUpdates).to.be.undefined;
    });

    it(`subplebbit.postUpdates = {86400} when a comment is published`, async () => {
        const post = await publishRandomPost(subplebbit.address, plebbit);
        await waitTillPostInSubplebbitPages(post, plebbit);
        expect(Object.keys(subplebbit.postUpdates)).to.deep.equal(["86400"]);
    });

    it(`Can fetch CommentUpdate for post and its children with subplebbit.postUpdates`, async () => {
        const postCid = subplebbit.posts.pages.hot.comments[0].cid;
        const post = await remotePlebbit.createComment({ cid: postCid });
        await post.update();
        mockCommentToNotUsePagesForUpdates(post);
        await new Promise((resolve) => post.once("update", resolve)); // CommentIpfs update
        expect(post.content).to.be.a("string");
        await new Promise((resolve) => post.once("update", resolve)); // CommentUpdate
        expect(post.updatedAt).to.be.a("number");
        await post.stop();

        // Now publish a reply under post
        const replyTemp = await publishRandomReply(post, remotePlebbit);
        const reply = await remotePlebbit.createComment({ cid: replyTemp.cid });
        await reply.update();
        mockCommentToNotUsePagesForUpdates(reply);
        await new Promise((resolve) => reply.once("update", resolve)); // CommentIpfs update
        expect(reply.content).to.be.a("string");
        await new Promise((resolve) => reply.once("update", resolve)); // CommentUpdate update
        expect(reply.updatedAt).to.be.a("number");

        await reply.stop();
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

    it(`Can still fetch updates from post and reply with new bucket`, async () => {
        const postCid = subplebbit.posts.pages.hot.comments[0].cid;
        const post = await remotePlebbit.createComment({ cid: postCid });
        await post.update();
        mockCommentToNotUsePagesForUpdates(post);
        await new Promise((resolve) => post.once("update", resolve)); // CommentIpfs update
        expect(post.content).to.be.a("string");
        await new Promise((resolve) => post.once("update", resolve)); // CommentUpdate
        expect(post.updatedAt).to.be.a("number");
        await post.stop();

        // Now fetch the update of reply
        const reply = await remotePlebbit.createComment({ cid: post.replies.pages.topAll.comments[0].cid });
        await reply.update();
        mockCommentToNotUsePagesForUpdates(reply);

        await new Promise((resolve) => reply.once("update", resolve)); // CommentIpfs update
        expect(reply.content).to.be.a("string");
        await new Promise((resolve) => reply.once("update", resolve)); // CommentUpdate update
        expect(reply.updatedAt).to.be.a("number");

        await reply.stop();
    });
});
