const signers = require("../../../fixtures/signers");
const { generateMockPost, mockPlebbit, publishRandomPost, publishRandomReply } = require("../../../../dist/node/test/test-util");
const lodash = require("lodash");

const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { default: waitUntil } = require("async-wait-until");
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
                displayName: `Mock Author - comment = await createComment(await createComment)`
            },
            signer: signers[4],
            timestamp: 2345324
        };
        const comment = await plebbit.createComment(props);

        const nestedComment = await plebbit.createComment(comment);

        expect(comment.content).to.equal(props.content);
        expect(comment.subplebbitAddress).to.equal(props.subplebbitAddress);
        expect(JSON.stringify(comment.author)).to.equal(JSON.stringify(props.author));
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
        const commentToClone = subplebbit.posts.pages.hot.comments.find((comment) => comment.replyCount > 0);
        expect(commentToClone.replies).to.be.a("object");
        const commentClone = await plebbit.createComment(commentToClone);
        expect(commentClone.replies).to.be.a("object");
        expect(commentToClone.toJSON()).to.deep.equal(commentClone.toJSON());
    });

    it(`Can recreate a stringified Comment instance with replies with plebbit.createComment`, async () => {
        const subplebbit = await plebbit.getSubplebbit(subplebbitAddress);
        const commentToClone = subplebbit.posts.pages.hot.comments.find((comment) => comment.replyCount > 0);
        expect(commentToClone.replies).to.be.a("object");
        const commentClone = await plebbit.createComment(JSON.parse(JSON.stringify(commentToClone)));
        expect(commentClone.replies).to.be.a("object");
        expect(commentToClone.toJSON()).to.deep.equal(commentClone.toJSON());
    });

    it(`Can recreate a stringified Post instance with plebbit.createComment`, async () => {
        const post = await generateMockPost(subplebbitAddress, plebbit, false, { signer: lodash.sample(signers) });
        const postFromStringifiedPost = await plebbit.createComment(JSON.parse(JSON.stringify(post)));
        expect(JSON.stringify(post)).to.equal(JSON.stringify(postFromStringifiedPost));
    });
});

describe(`comment.update`, async () => {
    it(`comment.update() is working as expected after calling comment.stop()`);
});

describe(`comment.replyCount`, async () => {
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

describe.skip("CommentUpdate.author.subplebbit.firstCommentTimestamp");
