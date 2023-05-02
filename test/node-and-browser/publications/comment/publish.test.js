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
    findCommentInPage,
    mockGatewayPlebbit
} = require("../../../../dist/node/test/test-util");
const lodash = require("lodash");
const chai = require("chai");
const { messages } = require("../../../../dist/node/errors");
const chaiAsPromised = require("chai-as-promised");
const { default: waitUntil } = require("async-wait-until");
chai.use(chaiAsPromised);
const { expect, assert } = chai;

const subplebbitAddress = signers[0].address;
const imageCaptchaSubplebbitAddress = signers[2].address;

if (globalThis["navigator"]?.userAgent?.includes("Electron")) Plebbit.setNativeFunctions(window.plebbitJsNativeFunctions);

describe("publishing comments", async () => {
    let plebbit;

    before(async () => {
        plebbit = await mockPlebbit();
    });

    it("Can publish a post", async function () {
        await publishRandomPost(subplebbitAddress, plebbit, {});
    });

    it(`Can Publish a post with only link`, async () => {
        const link = "https://demo.plebbit.eth.limo";
        const post = await generateMockPost(subplebbitAddress, plebbit, false, { link });
        expect(post.link).to.equal(link);
        await publishWithExpectedResult(post, true);
        await waitTillCommentIsInParentPages(post, plebbit, { link });
    });

    it(`Can publish a post with author.avatar. Can also validate it after publishing`, async () => {
        const commentProps = {
            title: "Random " + Math.random(),
            content: "Random " + Math.random(),
            subplebbitAddress,
            author: {
                address: signers[6].address,
                avatar: {
                    address: "0x890a2e81836e0E76e0F49995e6b51ca6ce6F39ED",
                    chainTicker: "matic",
                    id: "8",
                    signature: {
                        signature:
                            "0x52d29d32fcb1c5b3cd3638ccd67573985c4b01816a5e77fdfb0122488a0fdeb854ca6dae4fbdb0594db88e36ba83e87a321321fcfde498f84310a6b5cd543f3f1c",
                        signedPropertyNames: ["domainSeparator", "authorAddress", "tokenAddress", "tokenId"],
                        type: "eip191"
                    }
                }
            }
        };
        const post = await plebbit.createComment({ ...commentProps, signer: signers[6] });

        await publishWithExpectedResult(post, true);
        await waitTillCommentIsInParentPages(post, plebbit, lodash.omit(commentProps, "author"));
        const postSubplebbit = await plebbit.getSubplebbit(post.subplebbitAddress);
        // Should have post
        const postInPage = await findCommentInPage(post.cid, postSubplebbit.posts.pageCids.new, postSubplebbit.posts);
        expect(postInPage.author.avatar).to.deep.equal(commentProps.author.avatar);
        expect(postInPage.author.address).to.equal(commentProps.author.address);
    });

    it(`Publish a post with spoiler`, async () => {
        const post = await generateMockPost(subplebbitAddress, plebbit, false, { spoiler: true });

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

    it(`Can publish a comment that was created author.shortAddress manually defined`, async () => {
        const post = await generateMockPost(subplebbitAddress, plebbit, false, { author: { shortAddress: "12345" } });
        await publishWithExpectedResult(post, true);
    });

    it(`publish() can be caught if subplebbit failed to load`, async () => {
        const downPlebbit = await Plebbit({ ipfsGatewayUrls: ["http://127.0.0.1:28080", "http://127.0.0.1:28480"] });
        const post = await generateMockPost(subplebbitAddress, downPlebbit);

        await assert.isRejected(post.publish(), messages.ERR_FAILED_TO_FETCH_IPNS_VIA_GATEWAY);
    });

    it(`Can publish a comment when all gateways are down except one`, async () => {
        const gatewayPlebbit = await mockGatewayPlebbit({
            ipfsGatewayUrls: [
                "http://127.0.0.1:28080", // Not working
                "http://127.0.0.1:28081", // Not working
                "http://127.0.0.1:18083", // Working but does not have the ipns
                "http://127.0.0.1:18080" // Working
            ]
        });
        const post = await generateMockPost(subplebbitAddress, gatewayPlebbit);
        await publishWithExpectedResult(post, true);
    });
});

describe(`commentUpdate.author.subplebbit`, async () => {
    let plebbit, post;

    before(async () => {
        plebbit = await mockPlebbit();
        post = await publishRandomPost(subplebbitAddress, plebbit, {}, false);
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
        const anotherPost = await publishRandomPost(subplebbitAddress, plebbit, { signer: post.signer }, false);
        await anotherPost.update();

        await publishVote(anotherPost.cid, 1, plebbit);
        await waitUntil(() => anotherPost.upvoteCount === 1 && post.author.subplebbit.postScore === 2, { timeout: 200000 });
        expect(anotherPost.upvoteCount).to.equal(1);
        expect(anotherPost.author.subplebbit.postScore).to.equal(2);
        expect(anotherPost.author.subplebbit.replyScore).to.equal(0);
        expect(anotherPost.author.subplebbit.firstCommentTimestamp).to.equal(post.timestamp);

        expect(post.upvoteCount).to.equal(1);
        expect(post.author.subplebbit.postScore).to.equal(2);
        expect(post.author.subplebbit.replyScore).to.equal(0);
        anotherPost.stop();
    });

    it(`post.author.subplebbit.replyScore increases with upvote to author replies`, async () => {
        const reply = await publishRandomReply(post, plebbit, { signer: post.signer }, false);
        await reply.update();
        await publishVote(reply.cid, 1, plebbit);
        await waitUntil(() => reply.upvoteCount === 1 && post.author.subplebbit.replyScore === 1, { timeout: 200000 });

        expect(post.upvoteCount).to.equal(1);
        expect(post.author.subplebbit.postScore).to.equal(2);
        expect(post.author.subplebbit.replyScore).to.equal(1);

        expect(reply.upvoteCount).to.equal(1);
        expect(reply.author.subplebbit.postScore).to.equal(2);
        expect(reply.author.subplebbit.replyScore).to.equal(1);

        expect(reply.author.subplebbit.firstCommentTimestamp).to.equal(post.timestamp);

        reply.stop();
    });

    it(`author.subplebbit.lastCommentCid is updated with every new post of author`, async () => {
        const anotherPost = await publishRandomPost(subplebbitAddress, plebbit, { signer: post.signer }, false);
        await anotherPost.update();

        await waitUntil(() => post.author.subplebbit.lastCommentCid === anotherPost.cid && typeof anotherPost.updatedAt === "number", {
            timeout: 200000
        });

        expect(post.author.subplebbit.lastCommentCid).to.equal(anotherPost.cid);
        expect(anotherPost.author.subplebbit.lastCommentCid).to.equal(anotherPost.cid);
        expect(anotherPost.author.subplebbit.firstCommentTimestamp).to.equal(post.timestamp);

        anotherPost.stop();
    });

    it(`author.subplebbit.lastCommentCid is updated with every new reply of author`, async () => {
        const reply = await publishRandomReply(post, plebbit, { signer: post.signer }, false);
        await reply.update();

        await waitUntil(() => post.replyCount === 2 && typeof reply.updatedAt === "number", { timeout: 200000 });

        expect(post.author.subplebbit.lastCommentCid).to.equal(reply.cid);
        expect(reply.author.subplebbit.lastCommentCid).to.equal(reply.cid);
        expect(reply.author.subplebbit.firstCommentTimestamp).to.equal(post.timestamp);

        reply.stop();
    });

    it("CommentUpdate.author.subplebbit.firstCommentTimestamp is the timestamp of the first comment ", async () => {
        expect(post.author.subplebbit.firstCommentTimestamp).to.equal(post.timestamp);
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
                title: `Test title on Comment ${Date.now()} ${Math.random()}`,
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

describe(`comment.publishingState`, async () => {
    let plebbit;
    before(async () => {
        plebbit = await mockPlebbit();
    });

    it(`publishingState is stopped by default`, async () => {
        const comment = await generateMockPost(subplebbitAddress, plebbit);
        expect(comment.publishingState).to.equal("stopped");
    });

    it(`publishing states is in correct order upon publishing a comment with IPFS client`, async () => {
        const expectedStates = [
            "resolving-subplebbit-address",
            "fetching-subplebbit-ipns",
            "fetching-subplebbit-ipfs",
            "publishing-challenge-request",
            "waiting-challenge",
            "waiting-challenge-answers",
            "publishing-challenge-answer",
            "waiting-challenge-verification",
            "succeeded"
        ];
        const recordedStates = [];
        const mockPost = await generateMockPost(imageCaptchaSubplebbitAddress, plebbit);
        mockPost.removeAllListeners("challenge");

        mockPost.once("challenge", async (challengeMsg) => {
            expect(challengeMsg?.challenges[0]?.challenge).to.be.a("string");
            await mockPost.publishChallengeAnswers(["1234"]); // hardcode answer here
        });

        mockPost.on("publishingstatechange", (newState) => recordedStates.push(newState));

        await publishWithExpectedResult(mockPost, true);

        expect(recordedStates).to.deep.equal(expectedStates);
        expect(plebbit.eventNames()).to.deep.equal(["error"]); // Make sure events has been unsubscribed from
    });

    it(`publishing states is in correct order upon publishing a comment with gateway`, async () => {
        const gatewayPlebbit = await mockGatewayPlebbit();
        const expectedStates = [
            "resolving-subplebbit-address",
            "fetching-subplebbit-ipns",
            "publishing-challenge-request",
            "waiting-challenge",
            "waiting-challenge-answers",
            "publishing-challenge-answer",
            "waiting-challenge-verification",
            "succeeded"
        ];
        const recordedStates = [];
        const mockPost = await generateMockPost(imageCaptchaSubplebbitAddress, gatewayPlebbit);
        mockPost.removeAllListeners("challenge");

        mockPost.once("challenge", async (challengeMsg) => {
            expect(challengeMsg?.challenges[0]?.challenge).to.be.a("string");
            await mockPost.publishChallengeAnswers(["1234"]); // hardcode answer here
        });

        mockPost.on("publishingstatechange", (newState) => recordedStates.push(newState));

        await publishWithExpectedResult(mockPost, true);

        expect(recordedStates).to.deep.equal(expectedStates);
        expect(gatewayPlebbit.eventNames()).to.deep.equal(["error"]); // Make sure events has been unsubscribed from
    });

    it(`comment.publishingState = 'failed' if user provide incorrect answer`, async () => {
        const mockPost = await generateMockPost(imageCaptchaSubplebbitAddress, plebbit);
        mockPost.removeAllListeners("challenge");

        mockPost.once("challenge", async (challengeMsg) => {
            expect(challengeMsg?.challenges[0]?.challenge).to.be.a("string");
            await mockPost.publishChallengeAnswers(["1"]); // Wrong answer here
        });

        await publishWithExpectedResult(mockPost, false);

        expect(mockPost.publishingState).to.equal("failed");
        expect(plebbit.eventNames()).to.deep.equal(["error"]); // Make sure events has been unsubscribed from
    });
});
