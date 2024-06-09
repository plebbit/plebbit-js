import Plebbit from "../../../../dist/node/index.js";
import signers from "../../../fixtures/signers.js";
import {
    generateMockPost,
    mockRemotePlebbit,
    publishRandomPost,
    publishRandomReply,
    publishWithExpectedResult,
    loadAllPages,
    mockGatewayPlebbit,
    mockRemotePlebbitIpfsOnly,
    publishVote,
    generatePostToAnswerMathQuestion,
    isRpcFlagOn,
    resolveWhenConditionIsTrue
} from "../../../../dist/node/test/test-util.js";
import * as remeda from "remeda";
import { messages } from "../../../../dist/node/errors.js";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { domainResolverPromiseCache } from "../../../../dist/node/constants.js";

import { createMockIpfsClient } from "../../../../dist/node/test/mock-ipfs-client.js";
import { stringify as deterministicStringify } from "safe-stable-stringify";
import { cleanUpBeforePublishing, verifyComment, verifyCommentUpdate } from "../../../../dist/node/signer/signatures.js";

chai.use(chaiAsPromised);
const { expect, assert } = chai;

const subplebbitAddress = signers[0].address;
const mathCliSubplebbitAddress = signers[1].address;

describe("createComment", async () => {
    let plebbit;
    before(async () => {
        plebbit = await mockRemotePlebbit();
    });

    it(`comment = await createComment(await createComment)`, async () => {
        const props = {
            content: `test comment = await createComment(await createComment) ${Date.now()}`,
            subplebbitAddress,
            author: {
                address: signers[4].address,
                shortAddress: signers[4].address.slice(8).slice(0, 12),
                displayName: `Mock Author - comment = await createComment(await createComment)`
            },
            signer: signers[4],
            timestamp: 2345324
        };
        const comment = await plebbit.createComment(props);

        const nestedComment = await plebbit.createComment(remeda.omit(comment, ["signer"]));

        expect(comment.content).to.equal(props.content);
        expect(comment.subplebbitAddress).to.equal(props.subplebbitAddress);
        expect(deterministicStringify(comment.author)).to.equal(deterministicStringify(props.author));
        expect(comment.timestamp).to.equal(props.timestamp);

        expect(comment.toJSON()).to.deep.equal(nestedComment.toJSON());
    });

    it(`Can recreate a stringifed Comment instance with plebbit.createComment`, async () => {
        const subplebbit = await plebbit.getSubplebbit(subplebbitAddress);
        const commentClone = await plebbit.createComment(JSON.parse(JSON.stringify(subplebbit.posts.pages.hot.comments[0])));
        expect(JSON.stringify(subplebbit.posts.pages.hot.comments[0])).to.equal(JSON.stringify(commentClone));
    });

    it(`Can recreate a Comment instance with plebbit.createComment`, async () => {
        const subplebbit = await plebbit.getSubplebbit(subplebbitAddress);
        const commentClone = await plebbit.createComment(subplebbit.posts.pages.hot.comments[0]);
        expect(subplebbit.posts.pages.hot.comments[0].toJSON()).to.deep.equal(commentClone.toJSON());
    });

    it(`Can recreate a Comment instance with replies with plebbit.createComment`, async () => {
        const subplebbit = await plebbit.getSubplebbit(subplebbitAddress);
        const newComments = await loadAllPages(subplebbit.posts.pageCids.new, subplebbit.posts);
        const commentToClone = newComments.find((comment) => comment.replyCount > 0);
        expect(commentToClone.replies).to.be.a("object");
        const commentClone = await plebbit.createComment(commentToClone);
        expect(commentClone.replies).to.be.a("object");
        expect(commentToClone.toJSON()).to.deep.equal(commentClone.toJSON());
    });

    it(`Can recreate a stringified Comment instance with replies with plebbit.createComment`, async () => {
        const subplebbit = await plebbit.getSubplebbit(subplebbitAddress);
        const newComments = await loadAllPages(subplebbit.posts.pageCids.new, subplebbit.posts);
        const commentToClone = newComments.find((comment) => comment.replyCount > 0);
        expect(commentToClone.replies).to.be.a("object");
        const commentClone = await plebbit.createComment(JSON.parse(JSON.stringify(commentToClone)));
        expect(commentClone.replies).to.be.a("object");
        expect(JSON.stringify(commentToClone.toJSON())).to.equal(JSON.stringify(commentClone.toJSON()));
    });

    it(`Can recreate a stringified Post instance with plebbit.createComment`, async () => {
        const post = await generateMockPost(subplebbitAddress, plebbit, false);
        const postFromStringifiedPost = await plebbit.createComment(JSON.parse(JSON.stringify(post)));
        expect(JSON.stringify(post)).to.equal(JSON.stringify(postFromStringifiedPost));
    });

    it("comment instance created with {subplebbitAddress, cid} prop can call getPage", async () => {
        const post = await publishRandomPost(subplebbitAddress, plebbit, {}, true);
        expect(post.replies).to.be.a("object");
        await publishRandomReply(post, plebbit, {}, true);
        await post.update();
        await resolveWhenConditionIsTrue(post, () => typeof post.updatedAt === "number");
        expect(post.content).to.be.a("string");
        expect(post.replyCount).to.equal(1);
        expect(post.replies.pages.topAll.comments.length).to.equal(1);

        await post.stop();

        const pageCid = post.replies.pageCids.new;
        expect(pageCid).to.be.a("string");

        const postClone = await plebbit.createComment({ subplebbitAddress: post.subplebbitAddress, cid: post.cid });
        expect(postClone.content).to.be.undefined;

        const page = await postClone.replies.getPage(pageCid);
        expect(page.comments.length).to.be.equal(1);
    });
});

describe(`comment.update`, async () => {
    let plebbit;
    before(async () => {
        plebbit = await mockRemotePlebbit();
    });

    it(`plebbit.createComment({cid}).update() emits error if signature of CommentIpfs is invalid`, async () => {
        // A critical error, so it shouldn't keep on updating

        const subplebbit = await plebbit.getSubplebbit(subplebbitAddress);

        const postJson = cleanUpBeforePublishing(subplebbit.posts.pages.hot.comments[0].toJSONIpfs());

        postJson.title += "1234"; // Invalidate signature

        expect(await verifyComment(postJson, true, plebbit._clientsManager, false)).to.deep.equal({
            valid: false,
            reason: messages.ERR_SIGNATURE_IS_INVALID
        });

        const postWithInvalidSignatureCid = (
            await (await mockRemotePlebbitIpfsOnly())._clientsManager.getDefaultIpfs()._client.add(JSON.stringify(postJson))
        ).path;

        const createdComment = await plebbit.createComment({ cid: postWithInvalidSignatureCid });

        const updatingStates = [];
        createdComment.on("updatingstatechange", () => updatingStates.push(createdComment.updatingState));
        let updateHasBeenEmitted = false;
        createdComment.once("update", () => (updateHasBeenEmitted = true));
        await createdComment.update();

        await new Promise((resolve) =>
            createdComment.once("error", (err) => {
                expect(err.code).to.equal("ERR_COMMENT_IPFS_SIGNATURE_IS_INVALID");
                resolve();
            })
        );

        // should stop updating by itself because of the critical error

        expect(createdComment.state).to.equal("stopped");
        expect(createdComment.updatingState).to.equal("failed");
        expect(updatingStates).to.deep.equal(["fetching-ipfs", "succeeded", "failed"]);
        expect(updateHasBeenEmitted).to.be.false;
    });

    if (!isRpcFlagOn())
        it(`comment.update() emit an error if CommentUpdate signature is invalid`, async () => {
            // Should emit an error as well as continue the update loop

            const subplebbit = await plebbit.getSubplebbit(subplebbitAddress);

            const invalidCommentUpdateJson = subplebbit.posts.pages.hot.comments[0]._rawCommentUpdate;

            invalidCommentUpdateJson.cid += 1234; // Invalidate CommentUpdate

            expect(
                await verifyCommentUpdate(
                    invalidCommentUpdateJson,
                    true,
                    plebbit._clientsManager,
                    subplebbit.address,
                    { cid: subplebbit.posts.pages.hot.comments[0].cid, signature: subplebbit.posts.pages.hot.comments[0].signature },
                    false
                )
            ).to.deep.equal({
                valid: false,
                reason: messages.ERR_SIGNATURE_IS_INVALID
            });

            const createdComment = await plebbit.createComment({
                cid: subplebbit.posts.pages.hot.comments[0].cid,
                ...subplebbit.posts.pages.hot.comments[0].toJSONIpfs()
            });

            let loadingRetries = 0;
            let errorsEmittedCount = 0;
            createdComment._retryLoadingCommentUpdate = () => {
                loadingRetries++;
                return invalidCommentUpdateJson;
            };

            let updateHasBeenEmitted = false;
            createdComment.once("update", () => (updateHasBeenEmitted = true));
            await createdComment.update();

            await new Promise((resolve) =>
                createdComment.on("error", (err) => {
                    expect(err.code).to.equal("ERR_COMMENT_UPDATE_SIGNATURE_IS_INVALID");
                    errorsEmittedCount++;
                    resolve();
                })
            );

            await new Promise((resolve) => setTimeout(resolve, plebbit.updateInterval * 4 + 1));

            expect(createdComment.updatedAt).to.be.undefined; // Make sure it didn't use the props from the invalid CommentUpdate
            expect(createdComment.state).to.equal("updating");
            expect(createdComment.updatingState).to.equal("failed"); // Not sure if should be stopped or failed
            expect(updateHasBeenEmitted).to.be.false;
            expect(loadingRetries).to.be.above(2);
            expect(errorsEmittedCount).to.greaterThanOrEqual(2);

            await createdComment.stop();
        });

    it(`plebbit.createComment({cid}).update() fetches comment ipfs and update correctly when cid is the cid of a post`, async () => {
        const originalPost = await publishRandomPost(subplebbitAddress, plebbit, {}, false);

        const recreatedPost = await plebbit.createComment({ cid: originalPost.cid });

        recreatedPost.update();

        await new Promise((resolve) => recreatedPost.once("update", resolve));
        // Comment ipfs props should be defined now, but not CommentUpdate
        expect(recreatedPost.updatedAt).to.be.undefined;

        expect(recreatedPost.toJSONIpfs()).to.deep.equal(originalPost.toJSONIpfs());

        await new Promise((resolve) => recreatedPost.once("update", resolve));
        await recreatedPost.stop();
        expect(recreatedPost.updatedAt).to.be.a("number");
    });

    it(`plebbit.createComment({cid}).update() fetches comment ipfs and update correctly when cid is the cid of a reply`, async () => {
        const subplebbit = await plebbit.getSubplebbit(subplebbitAddress);

        const reply = await publishRandomReply(
            subplebbit.posts.pages.hot.comments.find((post) => post.replyCount > 0),
            plebbit,
            {},
            true
        );

        const recreatedReply = await plebbit.createComment({ cid: reply.cid });

        recreatedReply.update();

        await new Promise((resolve) => recreatedReply.once("update", resolve));
        // Comment ipfs props should be defined now, but not CommentUpdate
        expect(recreatedReply.updatedAt).to.be.undefined;

        expect(recreatedReply.toJSONIpfs()).to.deep.equal(reply.toJSONIpfs());

        await new Promise((resolve) => recreatedReply.once("update", resolve));
        await recreatedReply.stop();

        expect(recreatedReply.updatedAt).to.be.a("number");
    });

    it(`comment.stop() stops comment updates`, async () => {
        const subplebbit = await plebbit.getSubplebbit(subplebbitAddress);
        const comment = await plebbit.createComment({ cid: subplebbit.posts.pages.hot.comments[0].cid });
        await comment.update();
        await new Promise((resolve) => comment.once("update", resolve));
        await comment.stop();
        await new Promise((resolve) => setTimeout(resolve, plebbit.updateInterval + 1));
        let updatedHasBeenCalled = false;
        comment.updateOnce = comment._setUpdatingState = async () => {
            updatedHasBeenCalled = true;
        };

        await new Promise((resolve) => setTimeout(resolve, plebbit.updateInterval + 1));
        expect(updatedHasBeenCalled).to.be.false;
    });

    it(`comment.update() is working as expected after calling comment.stop()`, async () => {
        const subplebbit = await plebbit.getSubplebbit(subplebbitAddress);
        const comment = await plebbit.createComment({ cid: subplebbit.posts.pages.hot.comments[0].cid });

        await comment.update();
        await new Promise((resolve) => comment.once("update", resolve)); // CommentIpfs Update
        await new Promise((resolve) => comment.once("update", resolve)); // CommentUpdate update

        await comment.stop();

        await comment.update();

        await publishRandomReply(comment, plebbit, {}, false);
        await new Promise((resolve) => comment.once("update", resolve));
        await comment.stop();
    });

    it(`comment.update() is working as expected after comment.publish()`, async () => {
        const post = await publishRandomPost(subplebbitAddress, plebbit, {}, false);
        await post.update();
        await new Promise((resolve) => post.once("update", resolve));
        if (!post.updatedAt) await new Promise((resolve) => post.once("update", resolve));
        expect(post.updatedAt).to.be.a("number");
        await post.stop();
    });
});

describe(`commentUpdate.replyCount`, async () => {
    let plebbit, post, reply;
    before(async () => {
        plebbit = await mockRemotePlebbit();
        post = await publishRandomPost(subplebbitAddress, plebbit, {}, false);
        await post.update();
        await new Promise((resolve) => post.once("update", resolve));
        if (!post.updatedAt) await new Promise((resolve) => post.once("update", resolve));
        expect(post.replyCount).to.equal(0);
    });

    after(() => post.stop() && reply.stop());

    it(`post.replyCount increases with a direct reply`, async () => {
        reply = await publishRandomReply(post, plebbit, {}, false);
        await reply.update();
        await new Promise((resolve) => reply.once("update", resolve));
        await resolveWhenConditionIsTrue(post, () => post.replyCount === 1);
        expect(post.replyCount).to.equal(1);
    });

    it(`post.replyCount increases with a reply of a reply`, async () => {
        await publishRandomReply(reply, plebbit, {}, false);
        await resolveWhenConditionIsTrue(post, () => post.replyCount === 2);
        await resolveWhenConditionIsTrue(reply, () => reply.replyCount === 1);
        expect(post.replyCount).to.equal(2);
        expect(reply.replyCount).to.equal(1);
    });
});

describe(`commentUpdate.lastChildCid`, async () => {
    let post, plebbit;
    before(async () => {
        plebbit = await mockRemotePlebbit();
        post = await publishRandomPost(subplebbitAddress, plebbit, {}, false);
        await post.update();
        await resolveWhenConditionIsTrue(post, () => typeof post.updatedAt === "number");
        expect(post.lastChildCid).to.be.undefined;
    });

    after(async () => {
        await post.stop();
    });

    it(`commentUpdate.lastChildCid updates to the latest child comment when replying to post directly`, async () => {
        const reply = await publishRandomReply(post, plebbit, {}, false);
        await resolveWhenConditionIsTrue(post, () => post.replyCount === 1);
        expect(post.replyCount).to.equal(1);
        expect(post.lastChildCid).to.equal(reply.cid);
    });

    it(`commentUpdate.lastChildCid of a post does not update when replying to a comment under one of its replies`, async () => {
        await publishRandomReply(post.replies.pages.topAll.comments[0], plebbit, {}, false);
        await resolveWhenConditionIsTrue(post, () => post.replyCount === 2);
        expect(post.replyCount).to.equal(2);
        expect(post.lastChildCid).to.equal(post.replies.pages.topAll.comments[0].cid);
    });
});

describe(`commentUpdate.lastReplyTimestamp`, async () => {
    let post, plebbit, reply;
    before(async () => {
        plebbit = await mockRemotePlebbit();
        post = await publishRandomPost(subplebbitAddress, plebbit, {}, false);
        post.update();
        await resolveWhenConditionIsTrue(post, () => typeof post.updatedAt === "number");
        expect(post.lastReplyTimestamp).to.be.undefined;
    });

    after(async () => {
        await post.stop();
    });

    it(`commentUpdate.lastReplyTimestamp updates to the latest child comment's timestamp`, async () => {
        reply = await publishRandomReply(post, plebbit, {}, false);
        await resolveWhenConditionIsTrue(post, () => post.replyCount === 1);
        expect(post.replyCount).to.equal(1);
        expect(post.lastReplyTimestamp).to.equal(reply.timestamp);
    });

    it(`commentUpdate.lastChildCid of a post does not update when replying to a comment under one of its replies`, async () => {
        const replyOfReply = await publishRandomReply(reply, plebbit, {}, false);
        await resolveWhenConditionIsTrue(post, () => post.replyCount === 2);
        expect(post.replyCount).to.equal(2);
        expect(post.lastReplyTimestamp).to.equal(replyOfReply.timestamp);
    });
});

describe(`commentUpdate.author.subplebbit`, async () => {
    let plebbit, post;

    before(async () => {
        plebbit = await mockRemotePlebbit();
        post = await publishRandomPost(subplebbitAddress, plebbit, {}, false);
        await post.update();
        await resolveWhenConditionIsTrue(post, () => typeof post.updatedAt === "number");
    });

    after(async () => await post.stop());

    it(`post.author.subplebbit.postScore increases with upvote to post`, async () => {
        expect(post.cid).to.be.a("string");
        await publishVote(post.cid, post.subplebbitAddress, 1, plebbit);
        await resolveWhenConditionIsTrue(post, () => post.upvoteCount === 1);
        expect(post.upvoteCount).to.equal(1);
        expect(post.author.subplebbit.postScore).to.equal(1);
        expect(post.author.subplebbit.replyScore).to.equal(0);
    });

    it(`post.author.subplebbit.postScore increases with upvote to another post`, async () => {
        const anotherPost = await publishRandomPost(subplebbitAddress, plebbit, { signer: post._signer }, false);
        await anotherPost.update();
        await publishVote(anotherPost.cid, anotherPost.subplebbitAddress, 1, plebbit);
        await resolveWhenConditionIsTrue(post, () => post.author.subplebbit.postScore === 2);
        await resolveWhenConditionIsTrue(anotherPost, () => anotherPost.upvoteCount === 1);
        expect(anotherPost.upvoteCount).to.equal(1);
        expect(anotherPost.author.subplebbit.postScore).to.equal(2);
        expect(anotherPost.author.subplebbit.replyScore).to.equal(0);
        expect(anotherPost.author.subplebbit.firstCommentTimestamp).to.equal(post.timestamp);

        expect(post.upvoteCount).to.equal(1);
        expect(post.author.subplebbit.postScore).to.equal(2);
        expect(post.author.subplebbit.replyScore).to.equal(0);
        await anotherPost.stop();
    });

    it(`Can call plebbit.createComment(publishedComment) without error`);

    it(`post.author.subplebbit.replyScore increases with upvote to author replies`, async () => {
        const reply = await publishRandomReply(post, plebbit, { signer: post._signer }, false);
        await reply.update();
        await publishVote(reply.cid, reply.subplebbitAddress, 1, plebbit);
        await resolveWhenConditionIsTrue(reply, () => reply.upvoteCount === 1);
        await resolveWhenConditionIsTrue(post, () => post.author.subplebbit.replyScore === 1);
        expect(post.upvoteCount).to.equal(1);
        expect(post.author.subplebbit.postScore).to.equal(2);
        expect(post.author.subplebbit.replyScore).to.equal(1);

        expect(reply.upvoteCount).to.equal(1);
        expect(reply.author.subplebbit.postScore).to.equal(2);
        expect(reply.author.subplebbit.replyScore).to.equal(1);

        expect(reply.author.subplebbit.firstCommentTimestamp).to.equal(post.timestamp);

        await reply.stop();
    });

    it(`author.subplebbit.lastCommentCid is updated with every new post of author`, async () => {
        const anotherPost = await publishRandomPost(subplebbitAddress, plebbit, { signer: post._signer }, false);
        await anotherPost.update();

        await resolveWhenConditionIsTrue(post, () => post.author.subplebbit.lastCommentCid === anotherPost.cid);
        await resolveWhenConditionIsTrue(anotherPost, () => typeof anotherPost.updatedAt === "number");
        expect(post.author.subplebbit.lastCommentCid).to.equal(anotherPost.cid);
        expect(anotherPost.author.subplebbit.lastCommentCid).to.equal(anotherPost.cid);
        expect(anotherPost.author.subplebbit.firstCommentTimestamp).to.equal(post.timestamp);

        await anotherPost.stop();
    });

    it(`author.subplebbit.lastCommentCid is updated with every new reply of author`, async () => {
        const reply = await publishRandomReply(post, plebbit, { signer: post._signer }, false);
        await reply.update();
        await resolveWhenConditionIsTrue(post, () => post.replyCount === 2);
        await resolveWhenConditionIsTrue(reply, () => typeof reply.updatedAt === "number");
        expect(post.author.subplebbit.lastCommentCid).to.equal(reply.cid);
        expect(reply.author.subplebbit.lastCommentCid).to.equal(reply.cid);
        expect(reply.author.subplebbit.firstCommentTimestamp).to.equal(post.timestamp);

        await reply.stop();
    });

    it("CommentUpdate.author.subplebbit.firstCommentTimestamp is the timestamp of the first comment ", async () => {
        expect(post.author.subplebbit.firstCommentTimestamp).to.equal(post.timestamp);
    });
});

describe(`comment.state`, async () => {
    let plebbit, comment;
    before(async () => {
        plebbit = await mockRemotePlebbit();
        comment = await generateMockPost(subplebbitAddress, plebbit);
    });

    it(`state is stopped by default`, async () => {
        expect(comment.state).to.equal("stopped");
    });

    it(`state changes to publishing after calling .publish()`, async () => {
        publishWithExpectedResult(comment, true);
        if (comment.publishingState !== "publishing")
            await new Promise((resolve) =>
                comment.once("statechange", (state) => {
                    if (state === "publishing") resolve();
                })
            );
    });

    it(`state changes to updating after calling .update()`, async () => {
        const tempComment = await plebbit.createComment({
            cid: (await plebbit.getSubplebbit(signers[0].address)).posts.pages.hot.comments[0].cid
        });
        await tempComment.update();
        expect(tempComment.state).to.equal("updating");
        await tempComment.stop();
    });
});

describe("comment.updatingState", async () => {
    let plebbit;
    before(async () => {
        plebbit = await mockRemotePlebbit();
    });

    it(`updatingState is stopped by default`, async () => {
        const mockPost = await generateMockPost(subplebbitAddress, plebbit);
        expect(mockPost.updatingState).to.equal("stopped");
    });

    // We're using Math CLI subplebbit because the default subplebbit may contain comments with ENS for author address
    // Which will change the expected states
    // We should probably add a test for state when a comment with ENS for author address is in pages

    if (!isRpcFlagOn())
        it(`updating states is in correct order upon updating a comment with IPFS client`, async () => {
            const mockPost = await generatePostToAnswerMathQuestion({ subplebbitAddress: mathCliSubplebbitAddress }, plebbit);
            await publishWithExpectedResult(mockPost, true);
            const expectedStates = ["fetching-subplebbit-ipns", "fetching-subplebbit-ipfs", "fetching-update-ipfs", "succeeded", "stopped"];
            const recordedStates = [];
            mockPost.on("updatingstatechange", (newState) => recordedStates.push(newState));

            await mockPost.update();
            await new Promise((resolve) => mockPost.once("update", resolve));
            if (!mockPost.updatedAt) await new Promise((resolve) => mockPost.once("update", resolve));
            await mockPost.stop();

            expect(recordedStates.slice(recordedStates.length - expectedStates.length)).to.deep.equal(expectedStates);
            expect(plebbit.eventNames()).to.deep.equal(["error"]); // Make sure events has been unsubscribed from
        });

    if (!isRpcFlagOn())
        it(`updating states is in correct order upon updating a comment with gateway`, async () => {
            const gatewayPlebbit = await mockGatewayPlebbit();
            const mockPost = await generatePostToAnswerMathQuestion({ subplebbitAddress: mathCliSubplebbitAddress }, gatewayPlebbit);
            await publishWithExpectedResult(mockPost, true);
            const expectedStates = ["fetching-subplebbit-ipns", "fetching-update-ipfs", "succeeded", "stopped"];
            const recordedStates = [];
            mockPost.on("updatingstatechange", (newState) => recordedStates.push(newState));

            await mockPost.update();

            await new Promise((resolve) => mockPost.once("update", resolve));
            await mockPost.stop();

            expect(recordedStates.slice(recordedStates.length - expectedStates.length)).to.deep.equal(expectedStates);
            expect(gatewayPlebbit.eventNames()).to.deep.equal(["error"]); // Make sure events has been unsubscribed from
        });

    if (isRpcFlagOn())
        it(`updating states is in correct order upon updating a comment with RPC`, async () => {
            const mockPost = await publishRandomPost(subplebbitAddress, plebbit, {}, true);
            const postToUpdate = await plebbit.createComment({ cid: mockPost.cid });
            const expectedStates = [
                "fetching-ipfs",
                "succeeded",
                "fetching-subplebbit-ipns",
                "fetching-subplebbit-ipfs",
                "fetching-update-ipfs",
                "succeeded",
                "stopped"
            ];
            const recordedStates = [];
            postToUpdate.on("updatingstatechange", (newState) => recordedStates.push(newState));

            await postToUpdate.update();

            await new Promise((resolve) => postToUpdate.once("update", resolve)); // CommentIpfs update
            await new Promise((resolve) => postToUpdate.once("update", resolve)); // CommentUpdate update
            await postToUpdate.stop();

            expect(recordedStates).to.deep.equal(expectedStates);
            expect(plebbit.eventNames()).to.deep.equal(["error"]); // Make sure events has been unsubscribed from
        });

    it(`Add a test for updatingState with resolving-author-address`);
});

describe(`comment.clients`, async () => {
    let plebbit, gatewayPlebbit;
    before(async () => {
        plebbit = await mockRemotePlebbit();
        gatewayPlebbit = await mockGatewayPlebbit();
    });

    if (!isRpcFlagOn())
        describe(`comment.clients.ipfsGateways`, async () => {
            // All tests below use Plebbit instance that doesn't have ipfsClient
            it(`comment.clients.ipfsGateways[url] is stopped by default`, async () => {
                const mockPost = await generateMockPost(subplebbitAddress, gatewayPlebbit);
                expect(Object.keys(mockPost.clients.ipfsGateways).length).to.equal(1);
                expect(Object.values(mockPost.clients.ipfsGateways)[0].state).to.equal("stopped");
            });

            it(`Correct order of ipfsGateways state when updating a comment that was created with plebbit.createComment({cid})`, async () => {
                const sub = await gatewayPlebbit.getSubplebbit(signers[0].address);

                const mockPost = await gatewayPlebbit.createComment({ cid: sub.posts.pages.hot.comments[0].cid });

                const expectedStates = [
                    "fetching-ipfs",
                    "stopped",
                    "fetching-subplebbit-ipns",
                    "stopped",
                    "fetching-update-ipfs",
                    "stopped"
                ];

                const actualStates = [];

                const gatewayUrl = Object.keys(mockPost.clients.ipfsGateways)[0];

                mockPost.clients.ipfsGateways[gatewayUrl].on("statechange", (newState) => actualStates.push(newState));

                await mockPost.update();
                await new Promise((resolve) => mockPost.on("update", () => typeof mockPost.upvoteCount === "number" && resolve()));
                await mockPost.stop();

                expect(actualStates).to.deep.equal(expectedStates);
            });

            it(`Correct order of ipfsGateways state when updating a comment that was created with plebbit.getComment(cid)`, async () => {
                const sub = await gatewayPlebbit.getSubplebbit(signers[0].address);

                const mockPost = await gatewayPlebbit.getComment(sub.posts.pages.hot.comments[0].cid);

                const expectedStates = ["fetching-subplebbit-ipns", "stopped", "fetching-update-ipfs", "stopped"];

                const actualStates = [];

                const gatewayUrl = Object.keys(mockPost.clients.ipfsGateways)[0];

                mockPost.clients.ipfsGateways[gatewayUrl].on("statechange", (newState) => actualStates.push(newState));

                await mockPost.update();
                await new Promise((resolve) => mockPost.once("update", resolve));
                await mockPost.stop();

                expect(actualStates).to.deep.equal(expectedStates);
            });

            it(`Correct order of ipfsGateways state when publishing a comment (uncached subplebbit)`, async () => {
                const mockPost = await generateMockPost(signers[0].address, gatewayPlebbit);

                mockPost._getSubplebbitCache = () => undefined;

                const expectedStates = ["fetching-subplebbit-ipns", "stopped"];

                const actualStates = [];

                const gatewayUrl = Object.keys(mockPost.clients.ipfsGateways)[0];
                mockPost.clients.ipfsGateways[gatewayUrl].on("statechange", (newState) => actualStates.push(newState));

                await publishWithExpectedResult(mockPost, true);

                expect(actualStates).to.deep.equal(expectedStates);
            });

            it(`Correct order of ipfsGateways state when publishing a comment (cached subplebbit)`, async () => {
                const mockPost = await generateMockPost(signers[0].address, gatewayPlebbit);

                const expectedStates = []; // Should be empty since we're using cached subplebbit

                const actualStates = [];

                const gatewayUrl = Object.keys(mockPost.clients.ipfsGateways)[0];
                mockPost.clients.ipfsGateways[gatewayUrl].on("statechange", (newState) => actualStates.push(newState));

                await publishWithExpectedResult(mockPost, true);

                expect(actualStates).to.deep.equal(expectedStates);
            });
        });

    if (!isRpcFlagOn())
        describe(`comment.clients.ipfsClients`, async () => {
            it(`comment.clients.ipfsClients is undefined for gateway plebbit`, async () => {
                const mockPost = await generateMockPost(subplebbitAddress, gatewayPlebbit);
                expect(mockPost.clients.ipfsClients).to.be.undefined;
            });

            it(`comment.clients.ipfsClients[url] is stopped by default`, async () => {
                const mockPost = await generateMockPost(subplebbitAddress, plebbit);
                expect(Object.keys(mockPost.clients.ipfsClients).length).to.equal(1);
                expect(Object.values(mockPost.clients.ipfsClients)[0].state).to.equal("stopped");
            });

            it(`Correct order of ipfsClients state when updating a comment that was created with plebbit.createComment({cid})`, async () => {
                const sub = await plebbit.getSubplebbit(signers[0].address);

                const mockPost = await plebbit.createComment({ cid: sub.posts.pages.hot.comments[0].cid });

                const expectedStates = [
                    "fetching-ipfs",
                    "stopped",
                    "fetching-subplebbit-ipns",
                    "fetching-subplebbit-ipfs",
                    "fetching-update-ipfs",
                    "stopped"
                ];

                const actualStates = [];

                const ipfsUrl = Object.keys(mockPost.clients.ipfsClients)[0];

                mockPost.clients.ipfsClients[ipfsUrl].on("statechange", (newState) => actualStates.push(newState));

                await mockPost.update();
                await new Promise((resolve) => mockPost.on("update", () => typeof mockPost.upvoteCount === "number" && resolve()));
                await mockPost.stop();

                expect(actualStates).to.deep.equal(expectedStates);
            });

            it(`Correct order of ipfsClients state when updating a comment that was created with plebbit.getComment(cid)`, async () => {
                const sub = await plebbit.getSubplebbit(signers[0].address);

                const mockPost = await plebbit.getComment(sub.posts.pages.hot.comments[0].cid);

                const expectedStates = ["fetching-subplebbit-ipns", "fetching-subplebbit-ipfs", "fetching-update-ipfs", "stopped"];

                const actualStates = [];

                const ipfsUrl = Object.keys(mockPost.clients.ipfsClients)[0];

                mockPost.clients.ipfsClients[ipfsUrl].on("statechange", (newState) => actualStates.push(newState));

                await mockPost.update();
                await new Promise((resolve) => mockPost.once("update", resolve));
                await mockPost.stop();

                expect(actualStates).to.deep.equal(expectedStates);
            });

            it(`Correct order of ipfsClients state when publishing a comment (uncached)`, async () => {
                const mockPost = await generateMockPost(signers[0].address, plebbit);
                mockPost._getSubplebbitCache = () => undefined;
                const expectedStates = ["fetching-subplebbit-ipns", "fetching-subplebbit-ipfs", "stopped"];

                const actualStates = [];

                const ipfsUrl = Object.keys(mockPost.clients.ipfsClients)[0];

                mockPost.clients.ipfsClients[ipfsUrl].on("statechange", (newState) => actualStates.push(newState));

                await publishWithExpectedResult(mockPost, true);

                expect(actualStates).to.deep.equal(expectedStates);
            });

            it(`Correct order of ipfsClients state when publishing a comment (cached)`, async () => {
                const mockPost = await generateMockPost(signers[0].address, plebbit);

                const expectedStates = []; // Empty because we're using the cached subplebbit

                const actualStates = [];

                const ipfsUrl = Object.keys(mockPost.clients.ipfsClients)[0];

                mockPost.clients.ipfsClients[ipfsUrl].on("statechange", (newState) => actualStates.push(newState));

                await publishWithExpectedResult(mockPost, true);

                expect(actualStates).to.deep.equal(expectedStates);
            });
        });

    if (!isRpcFlagOn())
        describe(`comment.clients.pubsubClients`, async () => {
            it(`comment.clients.pubsubClients[url].state is stopped by default`, async () => {
                const mockPost = await generateMockPost(subplebbitAddress, plebbit);
                expect(Object.keys(mockPost.clients.pubsubClients).length).to.equal(3);
                expect(Object.values(mockPost.clients.pubsubClients)[0].state).to.equal("stopped");
            });

            it(`correct order of pubsubClients state when publishing a comment with a sub that skips challenge`, async () => {
                const mockPost = await generateMockPost(signers[0].address, plebbit);

                const pubsubUrls = Object.keys(plebbit.clients.pubsubClients);
                // Only first pubsub url is used for subscription. For publishing we use all providers
                const expectedStates = {
                    [pubsubUrls[0]]: ["subscribing-pubsub", "publishing-challenge-request", "waiting-challenge", "stopped"],
                    [pubsubUrls[1]]: [],
                    [pubsubUrls[2]]: []
                };

                const actualStates = { [pubsubUrls[0]]: [], [pubsubUrls[1]]: [], [pubsubUrls[2]]: [] };

                for (const pubsubUrl of Object.keys(expectedStates))
                    mockPost.clients.pubsubClients[pubsubUrl].on("statechange", (newState) => actualStates[pubsubUrl].push(newState));

                await publishWithExpectedResult(mockPost, true);

                expect(actualStates).to.deep.equal(expectedStates);
            });

            it(`correct order of pubsubClients state when publishing a comment with a sub that requires challenge`, async () => {
                const mockPost = await generatePostToAnswerMathQuestion({ subplebbitAddress: mathCliSubplebbitAddress }, plebbit);

                const pubsubUrls = await plebbit.stats.sortGatewaysAccordingToScore("pubsub-subscribe");
                // Only first pubsub url is used for subscription. For publishing we use all providers
                const expectedStates = {
                    [pubsubUrls[0]]: [
                        "subscribing-pubsub",
                        "publishing-challenge-request",
                        "waiting-challenge",
                        "waiting-challenge-answers",
                        "publishing-challenge-answer",
                        "waiting-challenge-verification",
                        "stopped"
                    ],
                    [pubsubUrls[1]]: [],
                    [pubsubUrls[2]]: []
                };

                const actualStates = { [pubsubUrls[0]]: [], [pubsubUrls[1]]: [], [pubsubUrls[2]]: [] };

                for (const pubsubUrl of Object.keys(expectedStates))
                    mockPost.clients.pubsubClients[pubsubUrl].on("statechange", (newState) => actualStates[pubsubUrl].push(newState));

                await publishWithExpectedResult(mockPost, true);

                expect(actualStates).to.deep.equal(expectedStates);
            });

            it(`correct order of pubsubClients state when failing to publish a comment and the error is from the pubsub provider`, async () => {
                const offlinePubsubUrl = "http://localhost:13173"; // Should be down
                const offlinePubsubPlebbit = await mockRemotePlebbit({
                    ipfsHttpClientsOptions: plebbit.ipfsHttpClientsOptions,
                    pubsubHttpClientsOptions: [offlinePubsubUrl]
                });

                const mockPost = await generateMockPost(signers[1].address, offlinePubsubPlebbit);

                const expectedStates = ["subscribing-pubsub", "stopped", "subscribing-pubsub", "stopped"];

                const actualStates = [];

                mockPost.clients.pubsubClients[offlinePubsubUrl].on("statechange", (newState) => actualStates.push(newState));

                await assert.isRejected(mockPost.publish(), messages.ERR_ALL_PUBSUB_PROVIDERS_THROW_ERRORS);

                expect(actualStates).to.deep.equal(expectedStates);
            });

            it(`Correct order of pubsubClients state when failing to publish a comment on one pubsub provider and moving on to the other one`, async () => {
                const offlinePubsubUrl = "http://localhost:13173"; // Should be down
                const upPubsubUrl = "http://localhost:15002/api/v0";
                const plebbit = await mockRemotePlebbit({
                    pubsubHttpClientsOptions: [offlinePubsubUrl, upPubsubUrl]
                });

                plebbit.clients.pubsubClients[upPubsubUrl]._client = createMockIpfsClient(); // Use mock pubsub to be on the same pubsub as the sub

                const mockPost = await generateMockPost(signers[0].address, plebbit);

                const expectedStates = {
                    [offlinePubsubUrl]: ["subscribing-pubsub", "stopped"],
                    [upPubsubUrl]: ["subscribing-pubsub", "publishing-challenge-request", "waiting-challenge", "stopped"]
                };

                const actualStates = { [offlinePubsubUrl]: [], [upPubsubUrl]: [] };

                for (const pubsubUrl of Object.keys(expectedStates))
                    mockPost.clients.pubsubClients[pubsubUrl].on("statechange", (newState) => actualStates[pubsubUrl].push(newState));

                await publishWithExpectedResult(mockPost, true);

                expect(actualStates).to.deep.equal(expectedStates);
            });

            it(`Correct order of pubsubClients state when provider 1 is not responding and moving on to the other one`, async () => {
                const notRespondingPubsubUrl = "http://localhost:15005/api/v0"; // Should take msgs but not respond, never throws errors
                const upPubsubUrl = "http://localhost:15002/api/v0";
                const plebbit = await mockRemotePlebbit({
                    pubsubHttpClientsOptions: [notRespondingPubsubUrl, upPubsubUrl]
                });

                plebbit.clients.pubsubClients[upPubsubUrl]._client = createMockIpfsClient(); // Use mock pubsub to be on the same pubsub as the sub

                const mockPost = await generateMockPost(signers[0].address, plebbit);
                mockPost._publishToDifferentProviderThresholdSeconds = 5;

                const expectedStates = {
                    [notRespondingPubsubUrl]: ["subscribing-pubsub", "publishing-challenge-request", "waiting-challenge", "stopped"],
                    [upPubsubUrl]: ["subscribing-pubsub", "publishing-challenge-request", "waiting-challenge", "stopped"]
                };

                const actualStates = { [notRespondingPubsubUrl]: [], [upPubsubUrl]: [] };

                for (const pubsubUrl of Object.keys(expectedStates))
                    mockPost.clients.pubsubClients[pubsubUrl].on("statechange", (newState) => actualStates[pubsubUrl].push(newState));

                await publishWithExpectedResult(mockPost, true);

                expect(actualStates).to.deep.equal(expectedStates);
            });

            it(`correct order of pubsubClients state when publishing a comment with a sub that requires challenge (pubsub provider 0 fail to receive a response in alotted time)`, async () => {
                const notRespondingPubsubUrl = "http://localhost:15005/api/v0"; // Should take pubsub msgs but not respond, never throws errors
                const upPubsubUrl = "http://localhost:15002/api/v0";
                const plebbit = await mockRemotePlebbit({
                    pubsubHttpClientsOptions: [notRespondingPubsubUrl, upPubsubUrl]
                });

                plebbit.clients.pubsubClients[upPubsubUrl]._client = createMockIpfsClient(); // Use mock pubsub to be on the same pubsub as the sub

                const mockPost = await generatePostToAnswerMathQuestion({ subplebbitAddress: mathCliSubplebbitAddress }, plebbit);
                mockPost._publishToDifferentProviderThresholdSeconds = 5;

                const expectedStates = {
                    [notRespondingPubsubUrl]: [
                        "subscribing-pubsub",
                        "publishing-challenge-request",
                        "waiting-challenge",
                        "waiting-challenge-answers",
                        "waiting-challenge-verification",
                        "stopped"
                    ],
                    [upPubsubUrl]: [
                        "subscribing-pubsub",
                        "publishing-challenge-request",
                        "waiting-challenge",
                        "waiting-challenge-answers",
                        "publishing-challenge-answer",
                        "waiting-challenge-verification",
                        "stopped"
                    ]
                };

                const actualStates = { [notRespondingPubsubUrl]: [], [upPubsubUrl]: [] };

                for (const pubsubUrl of Object.keys(expectedStates))
                    mockPost.clients.pubsubClients[pubsubUrl].on("statechange", (newState) => actualStates[pubsubUrl].push(newState));

                await publishWithExpectedResult(mockPost, true);

                expect(actualStates).to.deep.equal(expectedStates);
            });
        });

    if (!isRpcFlagOn())
        describe(`comment.clients.chainProviders`, async () => {
            it(`comment.clients.chainProviders[url][chainTicker].state is stopped by default`, async () => {
                const mockPost = await generateMockPost(subplebbitAddress, plebbit);
                expect(Object.keys(mockPost.clients.chainProviders).length).to.equal(1);
                for (const chain of Object.keys(mockPost.clients.chainProviders)) {
                    expect(Object.keys(mockPost.clients.chainProviders[chain]).length).to.be.greaterThan(0);
                    for (const chainUrl of Object.keys(mockPost.clients.chainProviders[chain]))
                        expect(mockPost.clients.chainProviders[chain][chainUrl].state).to.equal("stopped");
                }
            });

            it(`correct order of chainProviders state when publishing a comment to a sub with a domain address`, async () => {
                domainResolverPromiseCache.clear();
                const mockPost = await generateMockPost("plebbit.eth", plebbit);
                mockPost._clientsManager._getCachedTextRecord = () => undefined;
                const expectedStates = ["resolving-subplebbit-address", "stopped"];

                const actualStates = [];

                const chainProviderUrl = Object.keys(mockPost.clients.chainProviders.eth)[0];

                mockPost.clients.chainProviders["eth"][chainProviderUrl].on("statechange", (newState) => actualStates.push(newState));

                await publishWithExpectedResult(mockPost, true);

                // Sometimes we get no states because ENS is already cached
                if (actualStates.length !== 0) expect(actualStates.slice(0, 2)).to.deep.equal(expectedStates);
            });
        });

    if (isRpcFlagOn())
        describe(`comment.clients.plebbitRpcClients`, async () => {
            it(`Correct order of comment.clients.plebbitRpcClients states when publishing to a sub with challenge`, async () => {
                const mathCliSubplebbitAddress = signers[1].address;

                await plebbit.getSubplebbit(mathCliSubplebbitAddress); // Do this to cache subplebbit so we won't get fetching-subplebbit-ipns

                const rpcUrl = Object.keys(plebbit.clients.plebbitRpcClients)[0];
                const mockPost = await generateMockPost(mathCliSubplebbitAddress, plebbit);
                mockPost.removeAllListeners();

                const expectedStates = [
                    "subscribing-pubsub",
                    "publishing-challenge-request",
                    "waiting-challenge",
                    "waiting-challenge-answers",
                    "publishing-challenge-answer",
                    "waiting-challenge-verification",
                    "stopped"
                ];

                const actualStates = [];

                mockPost.clients.plebbitRpcClients[rpcUrl].on("statechange", (newState) => actualStates.push(newState));

                mockPost.once("challenge", async (challengeMsg) => {
                    await mockPost.publishChallengeAnswers(["2"]); // hardcode answer here
                });

                await publishWithExpectedResult(mockPost, true);

                expect(actualStates).to.deep.equal(expectedStates);
            });

            it(`Correct order of comment.clients.plebbitRpcClients states when updating a comment`, async () => {
                const mockPost = await publishRandomPost(subplebbitAddress, plebbit, {}, true);
                const postToUpdate = await plebbit.createComment({ cid: mockPost.cid });
                const expectedStates = [
                    "fetching-ipfs",
                    "stopped",
                    "fetching-subplebbit-ipns",
                    "fetching-subplebbit-ipfs",
                    "fetching-update-ipfs",
                    "stopped"
                ];
                const recordedStates = [];
                const currentRpcUrl = Object.keys(plebbit.clients.plebbitRpcClients)[0];
                postToUpdate.clients.plebbitRpcClients[currentRpcUrl].on("statechange", (newState) => recordedStates.push(newState));

                await postToUpdate.update();

                await new Promise((resolve) => postToUpdate.once("update", resolve)); // CommentIpfs update
                await new Promise((resolve) => postToUpdate.once("update", resolve)); // CommentUpdate update
                await postToUpdate.stop();

                expect(recordedStates).to.deep.equal(expectedStates);
                expect(plebbit.eventNames()).to.deep.equal(["error"]); // Make sure events has been unsubscribed from
            });
        });

    describe(`comment.replies.clients`, async () => {
        let commentCid;
        before(async () => {
            const subplebbit = await plebbit.getSubplebbit(subplebbitAddress);
            commentCid = subplebbit.posts.pages.hot.comments.find((comment) => comment.replyCount > 0).cid;
            expect(commentCid).to.be.a("string");
        });
        if (!isRpcFlagOn())
            describe(`comment.replies.clients.ipfsClients`, async () => {
                it(`comment.replies.clients.ipfsClients is {} for gateway plebbit`, async () => {
                    const comment = await gatewayPlebbit.getComment(commentCid);
                    const sortTypes = Object.keys(comment.replies.clients.ipfsClients);
                    expect(sortTypes).to.deep.equal(["topAll", "new", "controversialAll", "old"]);

                    for (const sortType of sortTypes) expect(comment.replies.clients.ipfsClients[sortType]).to.deep.equal({}); // should be empty
                });

                it(`comment.replies.clients.ipfsClients[sortType][url] is stopped by default`, async () => {
                    const comment = await plebbit.getComment(commentCid);
                    const ipfsUrl = Object.keys(comment.clients.ipfsClients)[0];
                    expect(Object.keys(comment.replies.clients.ipfsClients["new"]).length).to.equal(1);
                    expect(comment.replies.clients.ipfsClients["new"][ipfsUrl].state).to.equal("stopped");
                });

                it(`Correct state of 'new' sort is updated after fetching from comment.replies.pageCids.new`, async () => {
                    const comment = await plebbit.getComment(commentCid);
                    await comment.update();
                    await new Promise((resolve) => comment.once("update", resolve));
                    const ipfsUrl = Object.keys(comment.clients.ipfsClients)[0];

                    const expectedStates = ["fetching-ipfs", "stopped"];
                    const actualStates = [];
                    comment.replies.clients.ipfsClients["new"][ipfsUrl].on("statechange", (newState) => {
                        actualStates.push(newState);
                    });

                    await comment.replies.getPage(comment.replies.pageCids.new);
                    await comment.stop();
                    expect(actualStates).to.deep.equal(expectedStates);
                });
            });

        if (!isRpcFlagOn())
            describe(`comment.replies.clients.ipfsGateways`, async () => {
                it(`comment.replies.clients.ipfsGateways[sortType][url] is stopped by default`, async () => {
                    const comment = await gatewayPlebbit.getComment(commentCid);
                    const gatewayUrl = Object.keys(comment.clients.ipfsGateways)[0];
                    // add tests here
                    expect(Object.keys(comment.replies.clients.ipfsGateways["new"]).length).to.equal(1);
                    expect(comment.replies.clients.ipfsGateways["new"][gatewayUrl].state).to.equal("stopped");
                });

                it(`Correct state of 'new' sort is updated after fetching from comment.replies.pageCids.new`, async () => {
                    const comment = await gatewayPlebbit.getComment(commentCid);
                    await comment.update();
                    await new Promise((resolve) => comment.once("update", resolve));

                    const gatewayUrl = Object.keys(comment.clients.ipfsGateways)[0];

                    const expectedStates = ["fetching-ipfs", "stopped"];
                    const actualStates = [];
                    comment.replies.clients.ipfsGateways["new"][gatewayUrl].on("statechange", (newState) => {
                        actualStates.push(newState);
                    });

                    await comment.replies.getPage(comment.replies.pageCids.new);
                    await comment.stop();
                    expect(actualStates).to.deep.equal(expectedStates);
                });

                it(`Correct state of 'new' sort is correct after fetching from responsive and unresponsive gateway `, async () => {
                    // RPC exception
                    const gateways = [
                        "http://localhost:13417", // This gateway will take 10s to respond
                        "http://localhost:18080" // This one is immediate
                    ];
                    const multipleGatewayPlebbit = await Plebbit({ ipfsGatewayUrls: gateways });

                    const comment = await multipleGatewayPlebbit.getComment(commentCid);
                    comment.update();
                    if (!comment.updatedAt) await new Promise((resolve) => comment.once("update", resolve));
                    await comment.stop();

                    const expectedStates = {
                        [gateways[0]]: [
                            "fetching-ipfs",
                            "stopped" // It stopped after fetching the IPFS
                        ],
                        [gateways[1]]: [
                            "fetching-ipfs",
                            "stopped" // It stopped after it was aborted
                        ]
                    };

                    const actualStates = { [gateways[0]]: [], [gateways[1]]: [] };
                    for (const gatewayUrl of gateways)
                        comment.replies.clients.ipfsGateways["new"][gatewayUrl].on("statechange", (newState) => {
                            actualStates[gatewayUrl].push(newState);
                        });

                    multipleGatewayPlebbit._clientsManager.getGatewayTimeoutMs = () => 10 * 1000; // Change timeout to 10s
                    const timeBefore = Date.now();
                    await comment.replies.getPage(comment.replies.pageCids.new);
                    const timeItTookInMs = Date.now() - timeBefore;
                    expect(timeItTookInMs).to.be.lessThan(9000);

                    expect(actualStates).to.deep.equal(expectedStates);
                });
            });

        if (isRpcFlagOn())
            describe(`comment.replies.clients.plebbitRpcClients`, async () => {
                it(`comment.replies.clients.plebbitRpcClients[sortType][url] is stopped by default`, async () => {
                    const comment = await plebbit.getComment(commentCid);
                    const rpcUrl = Object.keys(comment.clients.plebbitRpcClients)[0];
                    // add tests here
                    expect(Object.keys(comment.replies.clients.plebbitRpcClients["new"]).length).to.equal(1);
                    expect(comment.replies.clients.plebbitRpcClients["new"][rpcUrl].state).to.equal("stopped");
                });

                it(`Correct state of 'new' sort is updated after fetching from comment.replies.pageCids.new`, async () => {
                    const comment = await plebbit.getComment(commentCid);
                    await comment.update();
                    await new Promise((resolve) => comment.once("update", resolve));
                    if (!comment.updatedAt) await new Promise((resolve) => comment.once("update", resolve));

                    const rpcUrl = Object.keys(comment.clients.plebbitRpcClients)[0];

                    const expectedStates = ["fetching-ipfs", "stopped"];
                    const actualStates = [];
                    comment.replies.clients.plebbitRpcClients["new"][rpcUrl].on("statechange", (newState) => {
                        actualStates.push(newState);
                    });

                    await comment.replies.getPage(comment.replies.pageCids.new);
                    await comment.stop();
                    expect(actualStates).to.deep.equal(expectedStates);
                });
            });
    });
});
