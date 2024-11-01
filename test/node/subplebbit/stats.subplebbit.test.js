import {
    mockPlebbit,
    publishRandomPost,
    createSubWithNoChallenge,
    publishRandomReply,
    publishVote,
    resolveWhenConditionIsTrue,
    waitTillPostInSubplebbitPages,
    waitTillReplyInParentPages
} from "../../../dist/node/test/test-util";

import signers from "../../fixtures/signers";

import chai from "chai";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);
const { expect, assert } = chai;

const activeUserCountKeys = [
    "allActiveUserCount",
    "yearActiveUserCount",
    "monthActiveUserCount",
    "weekActiveUserCount",
    "dayActiveUserCount",
    "hourActiveUserCount"
];

const replyCountKeys = ["allReplyCount", "yearReplyCount", "monthReplyCount", "weekReplyCount", "dayReplyCount", "hourReplyCount"];

const postCountKeys = ["allPostCount", "yearPostCount", "monthPostCount", "weekPostCount", "dayPostCount", "hourPostCount"];

describe(`subplebbit.statsCid`, async () => {
    let subplebbit, plebbit;

    before(async () => {
        plebbit = await mockPlebbit();
        subplebbit = await createSubWithNoChallenge({}, plebbit);
        await subplebbit.start();
        await resolveWhenConditionIsTrue(subplebbit, () => typeof subplebbit.updatedAt === "number");
    });

    after(async () => {
        await subplebbit.delete();
    });

    it(`stats of subplebbit is all zeros by default`, async () => {
        const stats = JSON.parse(await plebbit.fetchCid(subplebbit.statsCid));

        const expectedKeys = activeUserCountKeys.concat(...replyCountKeys).concat(...postCountKeys);
        expect(Object.keys(stats).sort()).to.deep.equal(expectedKeys.sort());
        expect(Object.values(stats)).to.deep.equal(Array(expectedKeys.length).fill(0)); // All values should be 0
    });

    describe(`subplebbit.stats.ActiveUserCount`, async () => {
        it(`ActiveUserCount should increase by 1 for new post author`, async () => {
            const statsBefore = JSON.parse(await plebbit.fetchCid(subplebbit.statsCid));
            const post = await publishRandomPost(subplebbit.address, plebbit, { signer: signers[5] });
            await waitTillPostInSubplebbitPages(post, plebbit);
            const statsAfterNewPost = JSON.parse(await plebbit.fetchCid(subplebbit.statsCid));

            for (const userCountKey of activeUserCountKeys) expect(statsAfterNewPost[userCountKey]).to.equal(statsBefore[userCountKey] + 1);
        });

        it(`ActiveUserCount does not increase when an existing user is publishing a new post`, async () => {
            const statsBefore = JSON.parse(await plebbit.fetchCid(subplebbit.statsCid));
            const post = await publishRandomPost(subplebbit.address, plebbit, { signer: signers[5] });
            await waitTillPostInSubplebbitPages(post, plebbit);
            const statsAfterNewPost = JSON.parse(await plebbit.fetchCid(subplebbit.statsCid));

            for (const userCountKey of activeUserCountKeys) expect(statsAfterNewPost[userCountKey]).to.equal(statsBefore[userCountKey]);
        });

        it(`ActiveUserCount should increase by 1 for new comment author`, async () => {
            const statsBefore = JSON.parse(await plebbit.fetchCid(subplebbit.statsCid));
            const post = subplebbit.posts.pages.hot.comments[0];
            const reply = await publishRandomReply(post, plebbit, { signer: signers[4] });
            await waitTillReplyInParentPages(reply, plebbit);
            const statsAfterNewReply = JSON.parse(await plebbit.fetchCid(subplebbit.statsCid));

            for (const userCountKey of activeUserCountKeys)
                expect(statsAfterNewReply[userCountKey]).to.equal(statsBefore[userCountKey] + 1);
        });

        it(`ActiveUserCount does not increase when an existing user is publishing a new reply`, async () => {
            const statsBefore = JSON.parse(await plebbit.fetchCid(subplebbit.statsCid));
            const post = subplebbit.posts.pages.hot.comments[0];
            const reply = await publishRandomReply(post, plebbit, { signer: signers[4] });
            await waitTillReplyInParentPages(reply, plebbit);
            const statsAfterNewPost = JSON.parse(await plebbit.fetchCid(subplebbit.statsCid));

            for (const userCountKey of activeUserCountKeys) expect(statsAfterNewPost[userCountKey]).to.equal(statsBefore[userCountKey]);
        });

        it(`ActiveUserCount should increase by 1 for new vote author`, async () => {
            const statsBefore = JSON.parse(await plebbit.fetchCid(subplebbit.statsCid));
            const post = subplebbit.posts.pages.hot.comments[0];
            const updatePromise = new Promise((resolve) => subplebbit.once("update", resolve));
            await publishVote(post.cid, post.subplebbitAddress, 1, plebbit, { signer: signers[3] });
            await updatePromise;
            const statsAfterNewVote = JSON.parse(await plebbit.fetchCid(subplebbit.statsCid));

            for (const userCountKey of activeUserCountKeys) expect(statsAfterNewVote[userCountKey]).to.equal(statsBefore[userCountKey] + 1);
        });

        it(`ActiveUserCount does not increase when an existing user is publishing a new vote`, async () => {
            const statsBefore = JSON.parse(await plebbit.fetchCid(subplebbit.statsCid));
            const post = subplebbit.posts.pages.hot.comments[0];
            const updatePromise = new Promise((resolve) => subplebbit.once("update", resolve));
            await publishVote(post.cid, post.subplebbitAddress, 1, plebbit, { signer: signers[5] });
            await updatePromise;
            const statsAfterNewVote = JSON.parse(await plebbit.fetchCid(subplebbit.statsCid));

            for (const userCountKey of activeUserCountKeys) expect(statsAfterNewVote[userCountKey]).to.equal(statsBefore[userCountKey]);
        });
    });

    describe(`subplebbit.stats.postCount`, async () => {
        it(`PostCount should increase by 1 for new post`, async () => {
            const statsBefore = JSON.parse(await plebbit.fetchCid(subplebbit.statsCid));
            const post = await publishRandomPost(subplebbit.address, plebbit, { signer: signers[5] });
            await waitTillPostInSubplebbitPages(post, plebbit);
            const statsAfterNewPost = JSON.parse(await plebbit.fetchCid(subplebbit.statsCid));

            for (const postCountKey of postCountKeys) expect(statsAfterNewPost[postCountKey]).to.equal(statsBefore[postCountKey] + 1);
        });

        it(`PostCount should increase by 1 for new post with existing user`, async () => {
            const statsBefore = JSON.parse(await plebbit.fetchCid(subplebbit.statsCid));
            const post = await publishRandomPost(subplebbit.address, plebbit, { signer: signers[5] });
            await waitTillPostInSubplebbitPages(post, plebbit);
            const statsAfterNewPost = JSON.parse(await plebbit.fetchCid(subplebbit.statsCid));

            for (const postCountKey of postCountKeys) expect(statsAfterNewPost[postCountKey]).to.equal(statsBefore[postCountKey] + 1);
        });

        it(`PostCount does not increase by 1 for new reply`, async () => {
            const statsBefore = JSON.parse(await plebbit.fetchCid(subplebbit.statsCid));
            const post = subplebbit.posts.pages.hot.comments[0];
            const reply = await publishRandomReply(post, plebbit, {});
            await waitTillReplyInParentPages(reply, plebbit);
            const statsAfterNewPost = JSON.parse(await plebbit.fetchCid(subplebbit.statsCid));

            for (const postCountKey of postCountKeys) expect(statsAfterNewPost[postCountKey]).to.equal(statsBefore[postCountKey]);
        });
    });

    describe(`subplebbit.stats.replyCount`, async () => {
        let postToReplyOn;
        before(async () => {
            postToReplyOn = await publishRandomPost(subplebbit.address, plebbit);
        });
        it(`replyCount should increase by 1 for new reply`, async () => {
            const statsBefore = JSON.parse(await plebbit.fetchCid(subplebbit.statsCid));
            const reply = await publishRandomReply(postToReplyOn, plebbit, { signer: signers[5] });
            await waitTillReplyInParentPages(reply, plebbit);
            const statsAfterNewReply = JSON.parse(await plebbit.fetchCid(subplebbit.statsCid));

            for (const replyCountKey of replyCountKeys) expect(statsAfterNewReply[replyCountKey]).to.equal(statsBefore[replyCountKey] + 1);
        });

        it(`ReplyCount should increase by 1 for new reply with existing author`, async () => {
            const statsBefore = JSON.parse(await plebbit.fetchCid(subplebbit.statsCid));
            const reply = await publishRandomReply(postToReplyOn, plebbit, { signer: signers[5] });
            await waitTillReplyInParentPages(reply, plebbit);
            const statsAfterNewReply = JSON.parse(await plebbit.fetchCid(subplebbit.statsCid));

            for (const replyCountKey of replyCountKeys) expect(statsAfterNewReply[replyCountKey]).to.equal(statsBefore[replyCountKey] + 1);
        });

        it(`ReplyCount does not increase by 1 for new post`, async () => {
            const statsBefore = JSON.parse(await plebbit.fetchCid(subplebbit.statsCid));
            const post = await publishRandomPost(subplebbit.address, plebbit, {}, false);
            await waitTillPostInSubplebbitPages(post, plebbit);
            const statsAfterNewPost = JSON.parse(await plebbit.fetchCid(subplebbit.statsCid));

            for (const replyCountKey of replyCountKeys) expect(statsAfterNewPost[replyCountKey]).to.equal(statsBefore[replyCountKey]);
        });
    });
});
