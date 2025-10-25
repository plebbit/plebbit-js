import { expect } from "chai";
import signers from "../../../../fixtures/signers.js";
import {
    getAvailablePlebbitConfigsToTestAgainst,
    publishRandomPost,
    publishRandomReply,
    publishVote,
    resolveWhenConditionIsTrue
} from "../../../../../dist/node/test/test-util.js";
const subplebbitAddress = signers[0].address;

getAvailablePlebbitConfigsToTestAgainst().map((config) => {
    describe(`commentUpdate.replyCount - ${config.name}`, async () => {
        let plebbit, post, reply;
        before(async () => {
            plebbit = await config.plebbitInstancePromise();
            post = await publishRandomPost(subplebbitAddress, plebbit);
            await post.update();
            await resolveWhenConditionIsTrue({ toUpdate: post, predicate: () => typeof post.updatedAt === "number" });
            expect(post.replyCount).to.equal(0);
        });

        after(async () => {
            await plebbit.destroy();
        });

        it(`post.replyCount increases with a direct reply`, async () => {
            reply = await publishRandomReply(post, plebbit);
            await reply.update();
            await new Promise((resolve) => reply.once("update", resolve));
            await resolveWhenConditionIsTrue({ toUpdate: post, predicate: () => post.replyCount === 1 });
            expect(post.replyCount).to.equal(1);
        });

        it(`post.replyCount increases with a reply of a reply`, async () => {
            await publishRandomReply(reply, plebbit);
            await resolveWhenConditionIsTrue({ toUpdate: post, predicate: () => post.replyCount === 2 });
            await resolveWhenConditionIsTrue({ toUpdate: reply, predicate: () => reply.replyCount === 1 });
            expect(post.replyCount).to.equal(2);
            expect(reply.replyCount).to.equal(1);
        });
    });

    describe(`commentUpdate.lastChildCid - ${config.name}`, async () => {
        let post, plebbit;
        before(async () => {
            plebbit = await config.plebbitInstancePromise();
            post = await publishRandomPost(subplebbitAddress, plebbit);
            await post.update();
            await resolveWhenConditionIsTrue({ toUpdate: post, predicate: () => typeof post.updatedAt === "number" });
            expect(post.lastChildCid).to.be.undefined;
        });

        after(async () => {
            await plebbit.destroy();
        });

        it(`commentUpdate.lastChildCid updates to the latest child comment when replying to post directly`, async () => {
            const reply = await publishRandomReply(post, plebbit);
            await resolveWhenConditionIsTrue({ toUpdate: post, predicate: () => post.replyCount === 1 });
            expect(post.replyCount).to.equal(1);
            expect(post.lastChildCid).to.equal(reply.cid);
        });

        it(`commentUpdate.lastChildCid of a post does not update when replying to a comment under one of its replies`, async () => {
            await publishRandomReply(post.replies.pages.best.comments[0], plebbit);
            await resolveWhenConditionIsTrue({ toUpdate: post, predicate: () => post.replyCount === 2 });
            expect(post.replyCount).to.equal(2);
            expect(post.lastChildCid).to.equal(post.replies.pages.best.comments[0].cid);
        });
    });

    describe(`commentUpdate.lastReplyTimestamp - ${config.name}`, async () => {
        let post, plebbit, reply;
        before(async () => {
            plebbit = await config.plebbitInstancePromise();
            post = await publishRandomPost(subplebbitAddress, plebbit);
            await post.update();
            await resolveWhenConditionIsTrue({ toUpdate: post, predicate: () => typeof post.updatedAt === "number" });
            expect(post.lastReplyTimestamp).to.be.undefined;
        });

        after(async () => {
            await plebbit.destroy();
        });

        it(`commentUpdate.lastReplyTimestamp updates to the latest child comment's timestamp`, async () => {
            reply = await publishRandomReply(post, plebbit);
            await resolveWhenConditionIsTrue({ toUpdate: post, predicate: () => post.replyCount === 1 });
            expect(post.replyCount).to.equal(1);
            expect(post.lastReplyTimestamp).to.equal(reply.timestamp);
        });

        it(`commentUpdate.lastChildCid of a post does not update when replying to a comment under one of its replies`, async () => {
            const replyOfReply = await publishRandomReply(reply, plebbit);
            await resolveWhenConditionIsTrue({ toUpdate: post, predicate: () => post.replyCount === 2 });
            expect(post.replyCount).to.equal(2);
            expect(post.lastReplyTimestamp).to.equal(replyOfReply.timestamp);
        });
    });

    describe(`commentUpdate.author.subplebbit - ${config.name}`, async () => {
        let plebbit, post;

        before(async () => {
            plebbit = await config.plebbitInstancePromise();
            post = await publishRandomPost(subplebbitAddress, plebbit);
            await post.update();
        });

        after(async () => {
            await post.stop();
            await plebbit.destroy();
        });

        it(`post.author.subplebbit.postScore increases with upvote to post`, async () => {
            await publishVote(post.cid, post.subplebbitAddress, 1, plebbit);
            await resolveWhenConditionIsTrue({ toUpdate: post, predicate: () => post.upvoteCount === 1 });
            expect(post.upvoteCount).to.equal(1);
            expect(post.author.subplebbit.postScore).to.equal(1);
            expect(post.author.subplebbit.replyScore).to.equal(0);
        });

        it(`post.author.subplebbit.postScore increases with upvote to another post`, async () => {
            const anotherPost = await publishRandomPost(subplebbitAddress, plebbit, { signer: post.signer });
            await anotherPost.update();
            await publishVote(anotherPost.cid, anotherPost.subplebbitAddress, 1, plebbit);
            await resolveWhenConditionIsTrue({ toUpdate: post, predicate: () => post.author.subplebbit.postScore === 2 });
            await resolveWhenConditionIsTrue({ toUpdate: anotherPost, predicate: () => anotherPost.upvoteCount === 1 });
            expect(anotherPost.upvoteCount).to.equal(1);
            expect(anotherPost.author.subplebbit.postScore).to.equal(2);
            expect(anotherPost.author.subplebbit.replyScore).to.equal(0);
            expect(anotherPost.author.subplebbit.firstCommentTimestamp).to.equal(post.timestamp);

            expect(post.upvoteCount).to.equal(1);
            expect(post.author.subplebbit.postScore).to.equal(2);
            expect(post.author.subplebbit.replyScore).to.equal(0);
            await anotherPost.stop();
        });

        it(`post.author.subplebbit.replyScore increases with upvote to author replies`, async () => {
            const reply = await publishRandomReply(post, plebbit, { signer: post.signer });
            await reply.update();
            await publishVote(reply.cid, reply.subplebbitAddress, 1, plebbit);
            await resolveWhenConditionIsTrue({ toUpdate: reply, predicate: () => reply.upvoteCount === 1 });
            await resolveWhenConditionIsTrue({ toUpdate: post, predicate: () => post.author.subplebbit.replyScore === 1 });
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
            const anotherPost = await publishRandomPost(subplebbitAddress, plebbit, { signer: post.signer });
            await anotherPost.update();

            await resolveWhenConditionIsTrue({ toUpdate: post, predicate: () => post.author.subplebbit.lastCommentCid === anotherPost.cid });
            await resolveWhenConditionIsTrue({ toUpdate: anotherPost, predicate: () => typeof anotherPost.updatedAt === "number" });
            expect(post.author.subplebbit.lastCommentCid).to.equal(anotherPost.cid);
            expect(anotherPost.author.subplebbit.lastCommentCid).to.equal(anotherPost.cid);
            expect(anotherPost.author.subplebbit.firstCommentTimestamp).to.equal(post.timestamp);

            await anotherPost.stop();
        });

        it(`author.subplebbit.lastCommentCid is updated with every new reply of author`, async () => {
            const reply = await publishRandomReply(post, plebbit, { signer: post.signer });
            await reply.update();
            await resolveWhenConditionIsTrue({ toUpdate: post, predicate: () => post.replyCount >= 2 });
            await resolveWhenConditionIsTrue({ toUpdate: reply, predicate: () => typeof reply.updatedAt === "number" });
            expect(post.author.subplebbit.lastCommentCid).to.equal(reply.cid);
            expect(reply.author.subplebbit.lastCommentCid).to.equal(reply.cid);
            expect(reply.author.subplebbit.firstCommentTimestamp).to.equal(post.timestamp);

            await reply.stop();
        });

        it("CommentUpdate.author.subplebbit.firstCommentTimestamp is the timestamp of the first comment ", async () => {
            expect(post.author.subplebbit.firstCommentTimestamp).to.equal(post.timestamp);
        });
    });

    describe(`commentUpdate.childCount - ${config.name}`, async () => {
        let plebbit, post, reply;
        before(async () => {
            plebbit = await config.plebbitInstancePromise();
            post = await publishRandomPost(subplebbitAddress, plebbit);
            await post.update();
            await resolveWhenConditionIsTrue({ toUpdate: post, predicate: () => typeof post.updatedAt === "number" });
            expect(post.childCount).to.equal(0);
        });

        after(async () => {
            await plebbit.destroy();
        });

        it(`post.childCount increases with a direct reply`, async () => {
            reply = await publishRandomReply(post, plebbit);
            await reply.update();
            await new Promise((resolve) => reply.once("update", resolve));
            await resolveWhenConditionIsTrue({ toUpdate: post, predicate: () => post.childCount === 1 });
            expect(post.childCount).to.equal(1);
        });

        it(`post.childCount does not increase with a reply of a reply`, async () => {
            await publishRandomReply(reply, plebbit);
            await resolveWhenConditionIsTrue({ toUpdate: post, predicate: () => post.replyCount === 2 });
            await resolveWhenConditionIsTrue({ toUpdate: reply, predicate: () => reply.replyCount === 1 });
            expect(post.childCount).to.equal(1); // Only direct children, not grandchildren
            expect(reply.childCount).to.equal(1);
        });

        it(`post.childCount increases with multiple direct replies`, async () => {
            await publishRandomReply(post, plebbit);
            await resolveWhenConditionIsTrue({ toUpdate: post, predicate: () => post.childCount === 2 });
            expect(post.childCount).to.equal(2);
        });
    });
});
