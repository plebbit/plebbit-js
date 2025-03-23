import {
    describeSkipIfRpc,
    getRemotePlebbitConfigs,
    publishRandomPost,
    publishRandomReply,
    resolveWhenConditionIsTrue
} from "../../../dist/node/test/test-util.js";
import signers from "../../fixtures/signers.js";
import { expect } from "chai";

const subplebbitAddress = signers[0].address;
getRemotePlebbitConfigs().map((config) => {
    describeSkipIfRpc(`plebbit._updatingComments - ${config.name}`, async () => {
        let commentCid, sub;
        before(async () => {
            const plebbit = await config.plebbitInstancePromise();
            sub = await plebbit.getSubplebbit(subplebbitAddress);
            commentCid = sub.posts.pages.hot.comments[0].cid;
        });

        it(`Calling plebbit.createComment({cid}) when comment is already updating in plebbit._updatingComments should get us CommentIpfs and CommentUpdate`, async () => {
            const plebbit = await config.plebbitInstancePromise();
            const comment1 = await plebbit.createComment({ cid: commentCid });
            await comment1.update();
            await resolveWhenConditionIsTrue(comment1, () => typeof comment1.updatedAt === "number");
            expect(plebbit._updatingComments[commentCid].listenerCount("update")).to.equal(1);

            const comment2 = await plebbit.createComment({ cid: commentCid });
            expect(comment2.content).to.be.a("string"); // comment ipfs is defined
            expect(comment2.updatedAt).to.be.a("number"); // comment update is defined

            await comment2.update();
            expect(plebbit._updatingComments[commentCid].listenerCount("update")).to.equal(2);

            await comment1.stop();

            expect(plebbit._updatingComments[commentCid].listenerCount("update")).to.equal(1);

            await comment2.stop();

            expect(plebbit._updatingComments[commentCid]).to.be.undefined;
        });

        it(`A single instance fetched with plebbit.getComment should not keep plebbit._updatingComments[address]`, async () => {
            const plebbit = await config.plebbitInstancePromise();
            const comment = await plebbit.getComment(commentCid);
            expect(comment.content).to.be.a("string");
            expect(plebbit._updatingComments[comment.cid]).to.be.undefined;
        });

        it(`A single Comment instance updating will set up plebbit._updatingComments. Calling stop should clean up all subscriptions and remove plebbit._updatingComments`, async () => {
            const plebbit = await config.plebbitInstancePromise();
            expect(plebbit._updatingComments[commentCid]).to.be.undefined;

            const comment = await plebbit.createComment({ cid: commentCid });
            await comment.update();
            expect(plebbit._updatingComments[commentCid].listenerCount("update")).to.equal(1);

            await comment.stop();

            await new Promise((resolve) => setTimeout(resolve, 500)); // need to wait some time to propgate events

            expect(plebbit._updatingComments[commentCid]).to.be.undefined;
        });

        it(`Multiple Comment instances (same address) updating. Calling stop on all of them should clean all subscriptions and remove plebbit._updatingComments`, async () => {
            const plebbit = await config.plebbitInstancePromise();
            const comment1 = await plebbit.createComment({ cid: commentCid });
            const comment2 = await plebbit.createComment({ cid: commentCid });
            const comment3 = await plebbit.createComment({ cid: commentCid });

            await comment1.update();
            await comment2.update();
            await comment3.update();

            await Promise.all(
                [comment1, comment2, comment3].map((sub) => resolveWhenConditionIsTrue(sub, () => typeof comment1.updatedAt === "number"))
            );

            // all comments have received an update event now
            expect(plebbit._updatingComments[commentCid].updatedAt).to.be.a("number");
            expect(plebbit._updatingComments[commentCid].state).to.equal("updating");

            expect(plebbit._updatingComments[commentCid].listenerCount("update")).to.equal(3);

            await comment1.stop();

            expect(plebbit._updatingComments[commentCid].listenerCount("update")).to.equal(2);

            await comment2.stop();

            expect(plebbit._updatingComments[commentCid].listenerCount("update")).to.equal(1);

            await comment3.stop();

            expect(plebbit._updatingComments[commentCid]).to.be.undefined;
        });

        it(`Calling comment.stop() and update() should behave as normal with plebbit._updatingComments`, async () => {
            const plebbit = await config.plebbitInstancePromise();

            const comment = await publishRandomPost(subplebbitAddress, plebbit);
            const commentCid = comment.cid;

            const comment1 = await plebbit.createComment({ cid: commentCid });

            await comment1.update();
            await resolveWhenConditionIsTrue(comment1, () => typeof comment1.updatedAt === "number");
            expect(plebbit._updatingComments[commentCid].listenerCount("update")).to.equal(1);

            const comment2 = await plebbit.createComment({ cid: commentCid });

            await comment2.update();
            expect(plebbit._updatingComments[commentCid].listenerCount("update")).to.equal(2);

            await comment1.stop();

            expect(plebbit._updatingComments[commentCid].listenerCount("update")).to.equal(1);

            expect(comment2.replyCount).to.equal(0);

            await publishRandomReply(comment2, plebbit);

            await resolveWhenConditionIsTrue(comment2, () => comment2.replyCount === 1);

            expect(comment2.replyCount).to.equal(1);

            await comment2.stop();

            expect(plebbit._updatingComments[commentCid]).to.be.undefined;
        });

        it(`Calling reply.stop() when it's subscribed to a post and post is updating only for reply should remove both reply and post from _updatingComments`, async () => {
            const plebbit = await config.plebbitInstancePromise();
            const replyCid = sub.posts.pages.hot.comments[0].replies.pages.topAll.comments[0].cid;
            const reply = await plebbit.createComment({ cid: replyCid });
            await reply.update();
            // Get the post CID from the reply's parent
            const postCid = sub.posts.pages.hot.comments[0].cid;

            await reply.update();

            await resolveWhenConditionIsTrue(reply, () => typeof reply.updatedAt === "number");

            // Verify that both the reply and its parent post are in _updatingComments
            expect(Object.keys(plebbit._updatingComments).length).to.equal(2);
            expect(plebbit._updatingComments[replyCid]).to.exist;
            expect(plebbit._updatingComments[postCid]).to.exist;

            // Verify the reply's CID matches replyCid
            expect(plebbit._updatingComments[replyCid].cid).to.equal(replyCid);

            // Verify the post's CID matches the expected postCid
            expect(plebbit._updatingComments[postCid].cid).to.equal(postCid);

            // Now stop the reply and verify both are removed from _updatingComments
            await reply.stop();
            await new Promise((resolve) => setTimeout(resolve, 500)); // need to wait some time to propgate events
            expect(plebbit._updatingComments[replyCid]).to.be.undefined;
            expect(plebbit._updatingComments[postCid]).to.be.undefined;
            expect(Object.keys(plebbit._updatingComments).length).to.equal(0);
        });
    });
});
