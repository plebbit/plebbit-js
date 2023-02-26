const Plebbit = require("../../../../dist/node");
const signers = require("../../../fixtures/signers");
const {
    generateMockPost,
    publishRandomReply,
    publishWithExpectedResult,
    waitTillCommentIsInParentPages,
    publishRandomPost,
    mockPlebbit,
    publishVote,
    findCommentInPage
} = require("../../../../dist/node/test/test-util");
const lodash = require("lodash");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { default: waitUntil } = require("async-wait-until");
chai.use(chaiAsPromised);
const { expect, assert } = chai;

const subplebbitAddress = signers[0].address;

if (globalThis["navigator"]?.userAgent?.includes("Electron")) Plebbit.setNativeFunctions(window.plebbitJsNativeFunctions);

describe("publishing posts", async () => {
    let plebbit;

    before(async () => {
        plebbit = await mockPlebbit();
    });

    it("Can publish a post", async function () {
        await publishRandomPost(subplebbitAddress, plebbit, {});
    });

    it(`Can Publish a post with only link`, async () => {
        const link = "https://demo.plebbit.eth.limo";
        const post = await generateMockPost(subplebbitAddress, plebbit, false, { signer: lodash.sample(signers), link });
        expect(post.link).to.equal(link);
        await publishWithExpectedResult(post, true);
        await waitTillCommentIsInParentPages(post, plebbit, { link });
    });

    it(`Can publish a post with author.avatar. Can also validate it after publishing`, async () => {
        const avatarProps = {
            address: "0x890a2e81836e0E76e0F49995e6b51ca6ce6F39ED",
            chainTicker: "matic",
            id: "8",
            signature: {
                signature:
                    "0x52d29d32fcb1c5b3cd3638ccd67573985c4b01816a5e77fdfb0122488a0fdeb854ca6dae4fbdb0594db88e36ba83e87a321321fcfde498f84310a6b5cd543f3f1c",
                signedPropertyNames: ["domainSeparator", "authorAddress", "tokenAddress", "tokenId"],
                type: "eip191"
            }
        };
        const post = await plebbit.createComment({
            title: "Random " + Math.random(),
            content: "Random " + Math.random(),
            author: { avatar: avatarProps },
            signer: lodash.sample(signers),
            subplebbitAddress
        });

        await publishWithExpectedResult(post, true);
        await waitTillCommentIsInParentPages(post, plebbit, lodash.pick(commentProps, ["avatar"]));
    });

    it(`Publish a post with spoiler`, async () => {
        const post = await generateMockPost(subplebbitAddress, plebbit, false, { spoiler: true, signer: lodash.sample(signers) });

        expect(post.spoiler).to.be.true;

        await publishWithExpectedResult(post, true);
        expect(post.spoiler).to.be.true;
        await waitTillCommentIsInParentPages(post, plebbit, { spoiler: true });
    });

    it(`publish a post with author.wallets`, async () => {
        const wallets = { btc: { address: "0xdeadbeef" }, eth: { address: "rinse12.eth" } };
        const post = await generateMockPost(subplebbitAddress, plebbit, false, { author: { wallets } });
        expect(post.author.wallets).to.deep.equal(wallets);
        await publishWithExpectedResult(post, true);
        await waitTillCommentIsInParentPages(post, plebbit);
        const sub = await plebbit.getSubplebbit(post.subplebbitAddress);
        const postInPage = await findCommentInPage(post.cid, sub.posts.pageCids.new, sub.posts);
        expect(postInPage.author.wallets).to.deep.equal(wallets);
    });
});

describe(`author.subplebbit`, async () => {
    let plebbit, post;

    before(async () => {
        plebbit = await mockPlebbit();
        post = await publishRandomPost(subplebbitAddress, plebbit);
        await post.update();
        await new Promise((resolve) => post.once("update", resolve));
    });

    after(async () => post.stop());

    it(`post.author.subplebbit.postScore increases with upvote to post`, async () => {
        await publishVote(post.cid, 1, plebbit);
        await waitUntil(() => post.upvoteCount === 1, { timeout: 200000 });
        expect(post.upvoteCount).to.equal(1);
        expect(post.author.subplebbit.postScore).to.equal(1);
        expect(post.author.subplebbit.replyScore).to.equal(0);
    });

    it(`post.author.subplebbit.postScore increases with upvote to another post`, async () => {
        const anotherPost = await publishRandomPost(subplebbitAddress, plebbit, { signer: post.signer });
        await anotherPost.update();

        await publishVote(anotherPost.cid, 1, plebbit);
        await waitUntil(() => anotherPost.upvoteCount === 1 && post.author.subplebbit.postScore === 2, { timeout: 200000 });
        expect(anotherPost.upvoteCount).to.equal(1);
        expect(anotherPost.author.subplebbit.postScore).to.equal(2);
        expect(anotherPost.author.subplebbit.replyScore).to.equal(0);

        expect(post.upvoteCount).to.equal(1);
        expect(post.author.subplebbit.postScore).to.equal(2);
        expect(post.author.subplebbit.replyScore).to.equal(0);
        anotherPost.stop();
    });

    it(`post.author.subplebbit.replyScore increases with upvote to author replies`, async () => {
        const reply = await publishRandomReply(post, plebbit, { signer: post.signer });
        await reply.update();
        await publishVote(reply.cid, 1, plebbit);
        await waitUntil(() => reply.upvoteCount === 1 && post.author.subplebbit.replyScore === 1, { timeout: 200000 });

        expect(post.upvoteCount).to.equal(1);
        expect(post.author.subplebbit.postScore).to.equal(2);
        expect(post.author.subplebbit.replyScore).to.equal(1);

        expect(reply.upvoteCount).to.equal(1);
        expect(reply.author.subplebbit.postScore).to.equal(2);
        expect(reply.author.subplebbit.replyScore).to.equal(1);

        reply.stop();
    });

    it(`author.subplebbit.lastCommentCid is updated with every new post of author`, async () => {
        const anotherPost = await publishRandomPost(subplebbitAddress, plebbit, { signer: post.signer });
        await anotherPost.update();

        await waitUntil(() => post.author.subplebbit.lastCommentCid === anotherPost.cid && typeof anotherPost.updatedAt === "number", {
            timeout: 200000
        });

        expect(post.author.subplebbit.lastCommentCid).to.equal(anotherPost.cid);
        expect(anotherPost.author.subplebbit.lastCommentCid).to.equal(anotherPost.cid);

        anotherPost.stop();
    });

    it(`author.subplebbit.lastCommentCid is updated with every new reply of author`, async () => {
        const reply = await publishRandomReply(post, plebbit, { signer: post.signer });
        await reply.update();

        await waitUntil(() => post.replyCount === 2 && typeof reply.updatedAt === "number", { timeout: 200000 });

        expect(post.author.subplebbit.lastCommentCid).to.equal(reply.cid);
        expect(reply.author.subplebbit.lastCommentCid).to.equal(reply.cid);

        reply.stop();
    });
});

describe(`Publishing replies`, async () => {
    let post, plebbit;

    const parents = [];

    before(async () => {
        plebbit = await mockPlebbit();
        post = await publishRandomPost(subplebbitAddress, plebbit);
        parents.push(post);
    });

    after(() => parents.forEach((parent) => parent.stop()));

    it(`Can publish a reply (Comment) with title, content and link defined`, async () => {
        await publishRandomReply(
            post,
            plebbit,
            {
                title: `Test title on Comment ${Date.now()}`,
                content: `Test content on Comment ${Date.now()}`,
                link: "https//plebbit.com"
            },
            true
        );
    });

    [1, 2, 3].map((depth) =>
        it(`Can publish comment with depth = ${depth}`, async () => {
            const parentComment = parents[depth - 1];

            const reply = await publishRandomReply(parentComment, plebbit, { signer: post.signer }, false);
            expect(reply.depth).to.be.equal(depth);

            await waitTillCommentIsInParentPages(
                reply,
                plebbit,
                { ...lodash.omit(reply.toJSONPubsubMessagePublication(), ["author", "spoiler"]), depth },
                true
            );

            parents.push(reply);
        })
    );
});
