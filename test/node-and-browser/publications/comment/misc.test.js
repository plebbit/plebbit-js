const Plebbit = require("../../../../dist/node"); // Don't delete this line, otherwise browser tests will give "Process not defined" error. No idea why it happens
const signers = require("../../../fixtures/signers");
const {
    generateMockPost,
    mockPlebbit,
    publishRandomPost,
    publishRandomReply,
    publishWithExpectedResult,
    loadAllPages
} = require("../../../../dist/node/test/test-util");
const lodash = require("lodash");

const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { default: waitUntil } = require("async-wait-until");
const stringify = require("safe-stable-stringify");
chai.use(chaiAsPromised);
const { expect, assert } = chai;

let plebbit;
const subplebbitAddress = signers[0].address;

describe("createComment", async () => {
    before(async () => {
        plebbit = await mockPlebbit();
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

        const nestedComment = await plebbit.createComment(comment);

        expect(comment.content).to.equal(props.content);
        expect(comment.subplebbitAddress).to.equal(props.subplebbitAddress);
        expect(stringify(comment.author)).to.equal(stringify(props.author));
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
        const post = await generateMockPost(subplebbitAddress, plebbit, false, { signer: lodash.sample(signers) });
        const postFromStringifiedPost = await plebbit.createComment(JSON.parse(JSON.stringify(post)));
        expect(JSON.stringify(post)).to.equal(JSON.stringify(postFromStringifiedPost));
    });

    it("comment instance created with {subplebbitAddress, cid} prop can call getPage", async () => {
        const post = await publishRandomPost(subplebbitAddress, plebbit, {}, false);
        expect(post.replies).to.be.a("object");
        await publishRandomReply(post, plebbit, {}, true);
        await Promise.all([post.update(), new Promise((resolve) => post.once("update", resolve))]);
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

describe.skip(`comment.update`, async () => {
    it(`comment.update() is working as expected after calling comment.stop()`);
});

describe(`commentUpdate.replyCount`, async () => {
    let plebbit, post, reply;
    before(async () => {
        plebbit = await mockPlebbit();
        post = await publishRandomPost(subplebbitAddress, plebbit);
        await post.update();
        await new Promise((resolve) => post.once("update", resolve));
        expect(post.replyCount).to.equal(0);
    });

    after(() => post.stop() && reply.stop());

    it(`post.replyCount increases with a direct reply`, async () => {
        reply = await publishRandomReply(post, plebbit, {}, false);
        await reply.update();
        await new Promise((resolve) => reply.once("update", resolve));
        await waitUntil(() => post.replyCount === 1, { timeout: 200000 });
    });

    it(`post.replyCount increases with a reply of a reply`, async () => {
        await publishRandomReply(reply, plebbit, {}, false);
        await waitUntil(() => post.replyCount === 2 && reply.replyCount === 1, { timeout: 200000 });
    });
});

describe(`comment.state`, async () => {
    let plebbit, comment;
    before(async () => {
        plebbit = await mockPlebbit();
        comment = await generateMockPost(subplebbitAddress, plebbit);
    });

    it(`state is stopped by default`, async () => {
        expect(comment.state).to.equal("stopped");
    });

    it(`state changes to publishing after calling .publish()`, async () => {
        let receivedStateChange = false;
        comment.once("statechange", (newState) => (receivedStateChange = newState === "publishing"));
        await publishWithExpectedResult(comment, true);
        expect(comment.state).to.equal("publishing");
        expect(receivedStateChange).to.be.true;
    });

    it(`state changes to updating after calling updating`, async () => {
        let receivedStateChange = false;
        comment.once("statechange", (newState) => (receivedStateChange = newState === "updating"));
        await comment.update();
        expect(comment.state).to.equal("updating");
        expect(receivedStateChange).to.be.true;
        comment.stop();
    });
});
