import { expect } from "chai";
import signers from "../../../fixtures/signers.js";
import {
    generateMockVote,
    publishRandomPost,
    publishRandomReply,
    publishWithExpectedResult,
    resolveWhenConditionIsTrue,
    getAvailablePlebbitConfigsToTestAgainst
} from "../../../../dist/node/test/test-util.js";
import * as remeda from "remeda";
import { messages } from "../../../../dist/node/errors.js";

const subplebbitAddress = signers[0].address;

getAvailablePlebbitConfigsToTestAgainst().map((config) => {
    const previousVotes = [];

    describe(`Test upvote - ${config.name}`, async () => {
        let plebbit, postToVote, replyToVote, signer;

        before(async () => {
            plebbit = await config.plebbitInstancePromise({ plebbitOptions: { validatePages: false } });
            signer = await plebbit.createSigner();
            postToVote = await publishRandomPost(subplebbitAddress, plebbit, { signer });
            replyToVote = await publishRandomReply(postToVote, plebbit, { signer });
            await postToVote.update();
            await replyToVote.update();
            await resolveWhenConditionIsTrue({ toUpdate: postToVote, predicate: () => typeof postToVote.updatedAt === "number" });
            await resolveWhenConditionIsTrue({ toUpdate: replyToVote, predicate: () => typeof replyToVote.updatedAt === "number" });
        });

        after(async () => {
            await plebbit.destroy();
        });

        it(`(vote: Vote) === plebbit.createVote(JSON.parse(JSON.stringify(vote)))`, async () => {
            const vote = await generateMockVote(postToVote, 1, plebbit, remeda.sample(signers, 1)[0]);
            const voteFromStringifiedVote = await plebbit.createVote(JSON.parse(JSON.stringify(vote)));
            const jsonPropsToOmit = ["clients"];

            const voteJson = remeda.omit(JSON.parse(JSON.stringify(vote)), jsonPropsToOmit);
            const stringifiedVoteJson = remeda.omit(JSON.parse(JSON.stringify(voteFromStringifiedVote)), jsonPropsToOmit);
            expect(voteJson.signer).to.be.a("object").and.to.deep.equal(stringifiedVoteJson.signer); // make sure internal props like signer are copied properly
            expect(voteJson).to.deep.equal(stringifiedVoteJson);
        });

        it("Can upvote a post", async () => {
            const originalUpvote = remeda.clone(postToVote.upvoteCount);
            const vote = await generateMockVote(postToVote, 1, plebbit);
            await publishWithExpectedResult(vote, true);
            await resolveWhenConditionIsTrue({ toUpdate: postToVote, predicate: () => postToVote.upvoteCount === originalUpvote + 1 });
            expect(postToVote.upvoteCount).to.be.equal(originalUpvote + 1);
            expect(postToVote.downvoteCount).to.be.equal(0);
            expect(postToVote.author.subplebbit.replyScore).to.equal(0);
            expect(postToVote.author.subplebbit.postScore).to.equal(1);
            expect(postToVote.author.subplebbit.lastCommentCid).to.equal(replyToVote.cid);
            previousVotes.push(vote);
        });

        it(`Can upvote a reply`, async () => {
            const originalUpvote = remeda.clone(replyToVote.downvoteCount);
            const vote = await generateMockVote(replyToVote, 1, plebbit);
            await publishWithExpectedResult(vote, true);
            await resolveWhenConditionIsTrue({ toUpdate: replyToVote, predicate: () => replyToVote.upvoteCount === originalUpvote + 1 });
            expect(replyToVote.upvoteCount).to.equal(originalUpvote + 1);
            expect(replyToVote.downvoteCount).to.equal(0);
            expect(replyToVote.author.subplebbit.replyScore).to.equal(1);
            expect(replyToVote.author.subplebbit.postScore).to.equal(1);
            expect(replyToVote.author.subplebbit.lastCommentCid).to.equal(replyToVote.cid);

            previousVotes.push(vote);
        });

        it("Can change post upvote to downvote", async () => {
            const originalUpvote = remeda.clone(postToVote.upvoteCount);
            const originalDownvote = remeda.clone(postToVote.downvoteCount);
            const vote = await plebbit.createVote({
                commentCid: previousVotes[0].commentCid,
                signer: previousVotes[0].signer,
                subplebbitAddress: previousVotes[0].subplebbitAddress,
                vote: -1
            });
            await publishWithExpectedResult(vote, true);
            await resolveWhenConditionIsTrue({ toUpdate: postToVote, predicate: () => postToVote.upvoteCount === originalUpvote - 1 });

            expect(postToVote.upvoteCount).to.equal(originalUpvote - 1);
            expect(postToVote.downvoteCount).to.equal(originalDownvote + 1);
            expect(postToVote.author.subplebbit.postScore).to.equal(-1);
            expect(postToVote.author.subplebbit.replyScore).to.equal(1);
            expect(postToVote.author.subplebbit.lastCommentCid).to.equal(replyToVote.cid);
        });

        it("Can change reply upvote to downvote", async () => {
            const originalUpvote = remeda.clone(replyToVote.upvoteCount);
            const originalDownvote = remeda.clone(replyToVote.downvoteCount);
            const vote = await plebbit.createVote({
                commentCid: previousVotes[1].commentCid,
                signer: previousVotes[1].signer,
                subplebbitAddress: previousVotes[1].subplebbitAddress,
                vote: -1
            });
            await publishWithExpectedResult(vote, true);
            await resolveWhenConditionIsTrue({ toUpdate: replyToVote, predicate: () => replyToVote.upvoteCount === originalUpvote - 1 });

            expect(replyToVote.upvoteCount).to.equal(originalUpvote - 1);
            expect(replyToVote.downvoteCount).to.equal(originalDownvote + 1);
            expect(replyToVote.author.subplebbit.postScore).to.equal(-1);
            expect(replyToVote.author.subplebbit.replyScore).to.equal(-1);
            expect(replyToVote.author.subplebbit.lastCommentCid).to.equal(replyToVote.cid);
        });

        it("Does not throw an error when vote is duplicated", async () => {
            const vote = await plebbit.createVote({
                commentCid: previousVotes[0].commentCid,
                signer: previousVotes[0].signer,
                subplebbitAddress: previousVotes[0].subplebbitAddress,
                vote: previousVotes[0].vote
            });
            await publishWithExpectedResult(vote, true);
        });

        it(`Can publish a vote that was created from jsonfied vote instance`, async () => {
            const vote = await generateMockVote(postToVote, 1, plebbit, remeda.sample(signers, 1)[0]);
            const voteFromStringifiedVote = await plebbit.createVote(JSON.parse(JSON.stringify(vote)));
            const challengeRequestPromise = new Promise((resolve) => voteFromStringifiedVote.once("challengerequest", resolve));

            await publishWithExpectedResult(voteFromStringifiedVote, true);
            const challengerequest = await challengeRequestPromise;
            expect(challengerequest.vote).to.deep.equal(vote.toJSONPubsubMessagePublication());

            expect(vote.toJSONPubsubMessagePublication()).to.deep.equal(voteFromStringifiedVote.toJSONPubsubMessagePublication());
            expect(vote.toJSONPubsubRequestToEncrypt()).to.deep.equal(voteFromStringifiedVote.toJSONPubsubRequestToEncrypt());
        });

        it(`A vote=0 is rejected if the author never published a vote on the comment before`, async () => {
            const vote = await generateMockVote(postToVote, 0, plebbit);

            await publishWithExpectedResult(vote, false, messages.ERR_THERE_IS_NO_PREVIOUS_VOTE_TO_CANCEL);
        });
    });
});
