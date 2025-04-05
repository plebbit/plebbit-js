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
        let sub;

        before(async () => {
            const plebbit = await config.plebbitInstancePromise();
            sub = await plebbit.getSubplebbit(subplebbitAddress);

            const replyPostConfigs = [
                { commentType: "post", cid: sub.posts.pages.hot.comments[0].cid },
                {
                    commentType: "reply",
                    cid: sub.posts.pages.hot.comments.find((comment) => comment.replies?.pages?.topAll).replies.pages.topAll.comments[0].cid
                }
            ];

            expect(replyPostConfigs[0].cid).to.be.a("string");
            expect(replyPostConfigs[1].cid).to.be.a("string");

            // Dynamically define test cases here now that replyPostConfigs is available
            for (const replyPostConfig of replyPostConfigs) {
                runTestsForCommentType(replyPostConfig);
            }
        });

        // Function to define test cases for a specific comment type
        function runTestsForCommentType(replyPostConfig) {
            describe(`Tests for ${replyPostConfig.commentType}`, () => {
                it(`Calling plebbit.createComment({${replyPostConfig.commentType}cid}) when ${replyPostConfig.commentType} is already updating in plebbit._updatingComments should get us CommentIpfs and CommentUpdate`, async () => {
                    const plebbit = await config.plebbitInstancePromise();
                    const comment1 = await plebbit.createComment({ cid: replyPostConfig.cid });
                    await comment1.update();
                    await resolveWhenConditionIsTrue(comment1, () => typeof comment1.updatedAt === "number");
                    expect(plebbit._updatingComments[comment1.cid].listenerCount("update")).to.equal(1);

                    const comment2 = await plebbit.createComment({ cid: comment1.cid });
                    expect(comment2.content).to.be.a("string"); // comment ipfs is defined
                    expect(comment2.updatedAt).to.be.a("number"); // comment update is defined

                    await comment2.update();
                    expect(plebbit._updatingComments[comment1.cid].listenerCount("update")).to.equal(2);

                    await comment1.stop();

                    expect(plebbit._updatingComments[comment1.cid].listenerCount("update")).to.equal(1);

                    await comment2.stop();

                    await new Promise((resolve) => setTimeout(resolve, 1000)); // need to wait some time to propgate events

                    expect(plebbit._updatingComments[comment1.cid]).to.be.undefined;
                });

                it(`A single ${replyPostConfig.commentType} instance fetched with plebbit.getComment should not keep plebbit._updatingComments[address]`, async () => {
                    const plebbit = await config.plebbitInstancePromise();
                    const comment = await plebbit.getComment(replyPostConfig.cid);
                    expect(comment.content).to.be.a("string");
                    expect(plebbit._updatingComments[comment.cid]).to.be.undefined;
                    expect(plebbit._updatingComments).to.deep.equal({});
                });

                it(`A single ${replyPostConfig.commentType} instance calling stop() immediately after update() should clear out _updatingComments`, async () => {
                    const plebbit = await config.plebbitInstancePromise();
                    expect(plebbit._updatingComments).to.deep.equal({});

                    const comment = await plebbit.createComment({ cid: replyPostConfig.cid });
                    await comment.update();
                    expect(plebbit._updatingComments[comment.cid]).to.exist;
                    expect(plebbit._updatingComments[comment.cid].listenerCount("update")).to.equal(1);

                    await comment.stop();
                    await new Promise((resolve) => setTimeout(resolve, 1000)); // need to wait some time to propagate events

                    expect(plebbit._updatingComments[comment.cid]).to.be.undefined;
                    expect(plebbit._updatingComments).to.deep.equal({}); // post should be undefined too
                });

                it(`A single ${replyPostConfig.commentType} Comment instance updating will set up plebbit._updatingComments. Calling stop should clean up all subscriptions and remove plebbit._updatingComments`, async () => {
                    const plebbit = await config.plebbitInstancePromise();
                    expect(plebbit._updatingComments[replyPostConfig.cid]).to.be.undefined;

                    const comment = await plebbit.createComment({ cid: replyPostConfig.cid });
                    await comment.update();
                    await resolveWhenConditionIsTrue(comment, () => typeof comment.updatedAt === "number"); // wait until post/subplebbit subscription starts
                    expect(plebbit._updatingComments[comment.cid].listenerCount("update")).to.equal(1);

                    await comment.stop();
                    await new Promise((resolve) => setTimeout(resolve, 1000)); // need to wait some time to propagate events

                    expect(plebbit._updatingComments[comment.cid]).to.be.undefined;
                    expect(plebbit._updatingComments[comment.postCid]).to.be.undefined;
                    expect(plebbit._updatingComments).to.deep.equal({});
                });

                it(`Multiple ${replyPostConfig.commentType} Comment instances (same address) updating. Calling stop on all of them should clean all subscriptions and remove plebbit._updatingComments`, async () => {
                    const plebbit = await config.plebbitInstancePromise();
                    const comment1 = await plebbit.createComment({ cid: replyPostConfig.cid });
                    const comment2 = await plebbit.createComment({ cid: replyPostConfig.cid });
                    const comment3 = await plebbit.createComment({ cid: replyPostConfig.cid });

                    await comment1.update();
                    await comment2.update();
                    await comment3.update();

                    await Promise.all(
                        [comment1, comment2, comment3].map((comment) =>
                            resolveWhenConditionIsTrue(comment, () => typeof comment1.updatedAt === "number")
                        )
                    );

                    // all comments have received an update event now
                    expect(plebbit._updatingComments[replyPostConfig.cid].updatedAt).to.be.a("number");
                    expect(plebbit._updatingComments[replyPostConfig.cid].state).to.equal("updating");

                    expect(plebbit._updatingComments[replyPostConfig.cid].listenerCount("update")).to.equal(3);

                    await comment1.stop();

                    expect(plebbit._updatingComments[replyPostConfig.cid].listenerCount("update")).to.equal(2);

                    await comment2.stop();

                    expect(plebbit._updatingComments[replyPostConfig.cid].listenerCount("update")).to.equal(1);

                    await comment3.stop();

                    await new Promise((resolve) => setTimeout(resolve, 1000)); // need to wait some time to propgate events

                    expect(plebbit._updatingComments[replyPostConfig.cid]).to.be.undefined;
                    expect(plebbit._updatingComments[comment1.postCid]).to.be.undefined;
                    expect(plebbit._updatingComments).to.deep.equal({});
                });
                it(`calling plebbit._updatingComments[${replyPostConfig.commentType}cid].stop() should stop all ${replyPostConfig.commentType} instances listening to that instance`, async () => {
                    const plebbit = await config.plebbitInstancePromise();

                    const comment1 = await plebbit.createComment({ cid: replyPostConfig.cid });
                    await comment1.update();
                    expect(comment1.state).to.equal("updating");
                    // plebbit._updatingComments[comment.cid] should be defined now
                    const comment2 = await plebbit.createComment({ cid: comment1.cid });
                    await comment2.update();
                    expect(comment2.state).to.equal("updating");

                    const comment3 = await plebbit.createComment({ cid: comment1.cid });
                    await comment3.update();
                    expect(comment3.state).to.equal("updating");

                    // stopping plebbit._updatingComments should stop all of them

                    await plebbit._updatingComments[comment1.cid].stop();
                    await new Promise((resolve) => setTimeout(resolve, 1000)); // need to wait some time to propgate events

                    for (const comment of [comment1, comment2, comment3]) {
                        expect(comment.state).to.equal("stopped");
                        expect(comment.updatingState).to.equal("stopped");
                    }
                    expect(plebbit._updatingComments[comment1.cid]).to.be.undefined;
                });
            });
        }

        // The rest of your standalone tests go here
        it(`Calling comment.stop() and update() should behave as normal with plebbit._updatingComments`, async () => {
            const plebbit = await config.plebbitInstancePromise();

            const comment = await publishRandomPost(subplebbitAddress, plebbit);
            const postCommentCid = comment.cid;

            const postComment1 = await plebbit.createComment({ cid: postCommentCid });

            await postComment1.update();
            await resolveWhenConditionIsTrue(postComment1, () => typeof postComment1.updatedAt === "number");
            expect(plebbit._updatingComments[postCommentCid].listenerCount("update")).to.equal(1);

            const postComment2 = await plebbit.createComment({ cid: postCommentCid });

            await postComment2.update();
            expect(plebbit._updatingComments[postCommentCid].listenerCount("update")).to.equal(2);

            await postComment1.stop();

            expect(plebbit._updatingComments[postCommentCid].listenerCount("update")).to.equal(1);

            expect(postComment2.replyCount).to.equal(0);

            await publishRandomReply(postComment2, plebbit);

            await resolveWhenConditionIsTrue(postComment2, () => postComment2.replyCount === 1);

            expect(postComment2.replyCount).to.equal(1);

            await postComment2.stop();

            expect(plebbit._updatingComments[postCommentCid]).to.be.undefined;
        });

        it(`Calling reply.stop() when it's subscribed to a post and post is updating only for reply should remove both reply and post from _updatingComments`, async () => {
            const plebbit = await config.plebbitInstancePromise();
            const replyCid = sub.posts.pages.hot.comments.find((comment) => comment.replies?.pages?.topAll).replies.pages.topAll.comments[0]
                .cid;
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

        it(`Updating a post should create a new entry in _updatingSubplebbits if we haven't been updating the sub already`, async () => {
            const plebbit = await config.plebbitInstancePromise();
            const subplebbit = await plebbit.getSubplebbit(signers[0].address);
            const commentCid = subplebbit.posts.pages.hot.comments[0].cid;

            const comment = await plebbit.createComment({ cid: commentCid });

            expect(plebbit._updatingComments[commentCid]).to.not.exist;
            expect(plebbit._updatingSubplebbits[comment.subplebbitAddress]).to.not.exist;

            await comment.update();
            await resolveWhenConditionIsTrue(comment, () => typeof comment.updatedAt === "number");
            expect(plebbit._updatingComments[commentCid]).to.exist;
            expect(plebbit._updatingSubplebbits[comment.subplebbitAddress]).to.exist;

            await comment.stop();
            await new Promise((resolve) => setTimeout(resolve, 500)); // need to wait some time to propgate events
            expect(plebbit._updatingComments[commentCid]).to.not.exist;
            expect(plebbit._updatingSubplebbits[comment.subplebbitAddress]).to.not.exist;
        });

        it(`Updating a post should use entry in _updatingSubplebbits if it's already updating`, async () => {
            const plebbit = await config.plebbitInstancePromise();
            const subplebbit = await plebbit.getSubplebbit(signers[0].address);
            await subplebbit.update();
            const commentCid = subplebbit.posts.pages.hot.comments[0].cid;

            const comment = await plebbit.createComment({ cid: commentCid });

            expect(plebbit._updatingComments[commentCid]).to.not.exist;
            expect(plebbit._updatingSubplebbits[subplebbit.address]).to.exist;

            await comment.update();
            await resolveWhenConditionIsTrue(comment, () => typeof comment.updatedAt === "number");
            expect(plebbit._updatingComments[commentCid]).to.exist;
            expect(plebbit._updatingSubplebbits[comment.subplebbitAddress]).to.exist;

            await comment.stop();
            await new Promise((resolve) => setTimeout(resolve, 500)); // need to wait some time to propgate events
            expect(plebbit._updatingComments[commentCid]).to.not.exist;
            expect(plebbit._updatingSubplebbits[comment.subplebbitAddress]).to.exist;

            await plebbit.destroy();
        });
    });
});
