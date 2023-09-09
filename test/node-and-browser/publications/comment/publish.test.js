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
const { signComment } = require("../../../../dist/node/signer/signatures");
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

    it(`comment.author.shortAddress is defined throughout publishing`, async () => {
        const post = await generateMockPost(subplebbitAddress, plebbit, false);
        expect(post.author.shortAddress).to.be.a("string").with.length.above(0);
        expect(JSON.parse(JSON.stringify(post)).author.shortAddress)
            .to.be.a("string")
            .with.length.above(0);
        await publishWithExpectedResult(post, true);
        expect(JSON.parse(JSON.stringify(post)).author.shortAddress)
            .to.be.a("string")
            .with.length.above(0);
        await post.update();
        await new Promise((resolve) => post.once("update", resolve));
        expect(JSON.parse(JSON.stringify(post)).author.shortAddress)
            .to.be.a("string")
            .with.length.above(0);
        await post.stop();
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

    it(`publish() can be caught if subplebbit failed to load (gateway)`, async () => {
        // RPC exception
        const downPlebbit = await Plebbit({ ipfsGatewayUrls: ["http://127.0.0.1:28080", "http://127.0.0.1:28480"] });
        const post = await generateMockPost(subplebbitAddress, downPlebbit);
        post._getSubplebbitCache = () => undefined;

        await assert.isRejected(post.publish(), messages.ERR_FAILED_TO_FETCH_IPNS_VIA_GATEWAY);
    });

    it(`publish() can be caught if subplebbit failed to load (P2P or RPC)`);

    it(`comment.publish() can be caught if one of the gateways threw 429 status code`, async () => {
        const subAddress = signers[7].address;
        const gatewayPlebbit = await mockGatewayPlebbit({ ipfsGatewayUrls: ["http://localhost:33416", "http://localhost:18080"] });
        expect(Object.keys(gatewayPlebbit.clients.ipfsGateways)).to.deep.equal(["http://localhost:33416", "http://localhost:18080"]);

        const post = await generateMockPost(subAddress, gatewayPlebbit);

        await assert.isRejected(post.publish(), messages.ERR_FAILED_TO_FETCH_IPNS_VIA_GATEWAY);
    });

    it(`Can publish a comment whose signature is defined prior to plebbit.createComment()`, async () => {
        const signer = await plebbit.createSigner();
        const props = {
            subplebbitAddress: "12D3KooWN5rLmRJ8fWMwTtkDN7w2RgPPGRM4mtWTnfbjpi1Sh7zR",
            timestamp: Date.now() / 1000,
            author: { address: signer.address, displayName: "Mock Author - 1690130836.1711266" + Math.random() },
            protocolVersion: "1.0.0",
            content: "Mock content - 1690130836.1711266" + Math.random(),
            title: "Mock Post - 1690130836.1711266" + Math.random()
        };

        props.signature = await signComment(props, signer, plebbit);
        const post = await plebbit.createComment(props);
        expect(post.signature).to.deep.equal(props.signature);
        await publishWithExpectedResult(post, true);
    });

    it(`Can publish a comment when all ipfs gateways are down except one`, async () => {
        const gatewayPlebbit = await mockGatewayPlebbit({
            ipfsGatewayUrls: [
                "http://127.0.0.1:28080", // Not working
                "http://127.0.0.1:28081", // Not working
                "http://127.0.0.1:18083", // Working but does not have the ipns
                "http://127.0.0.1:18080" // Working
            ]
        });

        expect(Object.keys(gatewayPlebbit.clients.ipfsGateways)).to.deep.equal([
            "http://127.0.0.1:28080",
            "http://127.0.0.1:28081",
            "http://127.0.0.1:18083",
            "http://127.0.0.1:18080"
        ]);
        const post = await generateMockPost(subplebbitAddress, gatewayPlebbit);
        await publishWithExpectedResult(post, true);
    });

    it(`Can publish a comment when all pubsub providers are down except one`, async () => {
        const tempPlebbit = await mockPlebbit();
        // We're gonna modify this plebbit instance to throw errors when pubsub publish/subscribe is called for two of its pubsub providers (it uses three)
        const pubsubProviders = Object.keys(tempPlebbit.clients.pubsubClients);
        expect(pubsubProviders.length).to.equal(3);

        tempPlebbit.clients.pubsubClients[pubsubProviders[0]]._client.pubsub.publish = () => {
            throw Error("Can't publish");
        };
        tempPlebbit.clients.pubsubClients[pubsubProviders[0]]._client.pubsub.subscribe = () => {
            throw Error("Can't subscribe");
        };

        tempPlebbit.clients.pubsubClients[pubsubProviders[1]]._client.pubsub.publish = () => {
            throw Error("Can't publish");
        };
        tempPlebbit.clients.pubsubClients[pubsubProviders[1]]._client.pubsub.subscribe = () => {
            throw Error("Can't subscribe");
        };
        // Only pubsubProviders [2] is able to publish/subscribe

        const post = await generateMockPost(subplebbitAddress, tempPlebbit);
        await publishWithExpectedResult(post, true);
    });

    it(`comment.publish emits an error if provider 1 and 2 are not responding`, async () => {
        const notRespondingPubsubUrl = "http://localhost:15005/api/v0"; // Should take msgs but not respond, never throws errors
        const upPubsubUrl = "http://localhost:15002/api/v0";
        const plebbit = await mockPlebbit({
            pubsubHttpClientsOptions: [notRespondingPubsubUrl, upPubsubUrl]
        });

        const mockPost = await generateMockPost(signers[0].address, plebbit);
        mockPost._publishToDifferentProviderThresholdSeconds = 5;
        mockPost._setProviderFailureThresholdSeconds = 10;

        const expectedStates = {
            [notRespondingPubsubUrl]: ["subscribing-pubsub", "publishing-challenge-request", "waiting-challenge", "stopped"],
            [upPubsubUrl]: ["subscribing-pubsub", "publishing-challenge-request", "waiting-challenge", "stopped"]
        };

        const actualStates = { [notRespondingPubsubUrl]: [], [upPubsubUrl]: [] };

        for (const pubsubUrl of Object.keys(expectedStates))
            mockPost.clients.pubsubClients[pubsubUrl].on("statechange", (newState) => actualStates[pubsubUrl].push(newState));

        let emittedError;
        mockPost.on("error", (err) => {
            if (emittedError) expect.fail("Can't receive the same error twice");
            emittedError = err;
        });
        await mockPost.publish();

        await new Promise((resolve) =>
            setTimeout(
                resolve,
                mockPost._setProviderFailureThresholdSeconds * 1000 + mockPost._publishToDifferentProviderThresholdSeconds * 1000 + 2000
            )
        );

        expect(emittedError).to.be.not.undefined;
        expect(emittedError.code).to.equal("ERR_CHALLENGE_REQUEST_RECEIVED_NO_RESPONSE_FROM_ANY_PROVIDER");

        expect(mockPost.publishingState).to.equal("failed");
        expect(actualStates).to.deep.equal(expectedStates);
    });

    it(`comment emits and throws errors if all providers fail to publish`, async () => {
        const offlinePubsubUrls = ["http://localhost:23425", "http://localhost:23426"];
        const offlinePubsubPlebbit = await mockPlebbit({
            pubsubHttpClientsOptions: offlinePubsubUrls
        });
        const mockPost = await generateMockPost(signers[1].address, offlinePubsubPlebbit);

        let emittedError;
        mockPost.once("error", (err) => {
            emittedError = err;
        });

        await assert.isRejected(mockPost.publish(), messages.ERR_ALL_PUBSUB_PROVIDERS_THROW_ERRORS);
        expect(emittedError.code).to.equal("ERR_ALL_PUBSUB_PROVIDERS_THROW_ERRORS");

        expect(mockPost.publishingState).to.equal("failed");
        expect(mockPost.clients.pubsubClients[offlinePubsubUrls[0]].state).to.equal("stopped");
        expect(mockPost.clients.pubsubClients[offlinePubsubUrls[1]].state).to.equal("stopped");
    });

    it(`comment emits error when provider 1 is not responding and provider 2 throws an error`, async () => {
        // First provider waits, second provider fails to publish
        // second provider should update its state to be stopped, but it should not emit an error until the first provider is done with waiting

        const notRespondingPubsubUrl = "http://localhost:15005/api/v0"; // Should take msgs but not respond, never throws errors
        const offlinePubsubUrl = "http://localhost:23425"; // Will throw errors; can't subscribe or publish
        const offlinePubsubPlebbit = await mockPlebbit({
            pubsubHttpClientsOptions: [notRespondingPubsubUrl, offlinePubsubUrl]
        });
        const mockPost = await generateMockPost(signers[1].address, offlinePubsubPlebbit);
        mockPost._publishToDifferentProviderThresholdSeconds = 5;
        mockPost._setProviderFailureThresholdSeconds = 10;

        let emittedError;
        mockPost.on("error", (err) => {
            if (emittedError) expect.fail("Should not emit an error twice");
            emittedError = err;
        });

        const expectedStates = {
            [notRespondingPubsubUrl]: ["subscribing-pubsub", "publishing-challenge-request", "waiting-challenge", "stopped"],
            [offlinePubsubUrl]: ["subscribing-pubsub", "stopped"]
        };

        const actualStates = { [notRespondingPubsubUrl]: [], [offlinePubsubUrl]: [] };

        for (const pubsubUrl of Object.keys(expectedStates))
            mockPost.clients.pubsubClients[pubsubUrl].on("statechange", (newState) => actualStates[pubsubUrl].push(newState));

        await mockPost.publish();

        await new Promise((resolve) => setTimeout(() => resolve(), mockPost._setProviderFailureThresholdSeconds * 1000));
        expect(emittedError).to.be.not.undefined;
        expect(emittedError.code).to.equal("ERR_CHALLENGE_REQUEST_RECEIVED_NO_RESPONSE_FROM_ANY_PROVIDER");

        expect(mockPost.publishingState).to.equal("failed");
        expect(actualStates).to.deep.equal(expectedStates);
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

    it(`comment.publishingState stays as stopped after calling comment.update()`, async () => {
        const sub = await plebbit.getSubplebbit(subplebbitAddress);
        const commentCid = sub.posts.pages.hot.comments[0].cid;
        const comment = await plebbit.createComment({ cid: commentCid });
        expect(comment.publishingState).to.equal("stopped");
        comment.on("publishingstatechange", (newState) => {
            if (newState !== "stopped") expect.fail("Should not change publishing state");
        });
        comment.update();
        await new Promise((resolve) => comment.once("update", resolve));
        await new Promise((resolve) => comment.once("update", resolve));
        await comment.stop();
    });

    it(`publishing states is in correct order upon publishing a comment with IPFS client (uncached)`, async () => {
        const expectedStates = [
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
        mockPost._getSubplebbitCache = () => undefined;
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

    it(`publishing states is in correct order upon publishing a comment with IPFS client (cached)`, async () => {
        const expectedStates = [
            "publishing-challenge-request",
            "waiting-challenge",
            "waiting-challenge-answers",
            "publishing-challenge-answer",
            "waiting-challenge-verification",
            "succeeded"
        ];
        const recordedStates = [];
        await plebbit.getSubplebbit(imageCaptchaSubplebbitAddress);
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

    it(`publishing states is in correct order upon publishing a comment to plebbit.eth with IPFS client (uncached)`, async () => {
        const expectedStates = [
            "resolving-subplebbit-address",
            "fetching-subplebbit-ipns",
            "fetching-subplebbit-ipfs",
            "publishing-challenge-request",
            "waiting-challenge",
            "succeeded"
        ];
        const recordedStates = [];
        const mockPost = await generateMockPost("plebbit.eth", plebbit);
        mockPost._getSubplebbitCache = () => undefined;

        mockPost.on("publishingstatechange", (newState) => recordedStates.push(newState));

        await publishWithExpectedResult(mockPost, true);

        expect(recordedStates).to.deep.equal(expectedStates);
        expect(plebbit.eventNames()).to.deep.equal(["error"]); // Make sure events has been unsubscribed from
    });

    it(`publishing states is in correct order upon publishing a comment with gateway (cached)`, async () => {
        const gatewayPlebbit = await mockGatewayPlebbit();
        const expectedStates = [
            "publishing-challenge-request",
            "waiting-challenge",
            "waiting-challenge-answers",
            "publishing-challenge-answer",
            "waiting-challenge-verification",
            "succeeded"
        ];
        const recordedStates = [];
        await gatewayPlebbit.getSubplebbit(imageCaptchaSubplebbitAddress); // Make sure it's cached
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

    it(`publishing states is in correct order upon publishing a comment with gateway (uncached)`, async () => {
        const gatewayPlebbit = await mockGatewayPlebbit();
        const expectedStates = [
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
        mockPost._getSubplebbitCache = () => undefined;
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

    it(`comment.publishingState = 'failed' if pubsub provider is down`, async () => {
        const offlinePubsubUrl = "http://localhost:23425";
        const offlinePubsubPlebbit = await mockPlebbit({
            ipfsHttpClientsOptions: plebbit.ipfsHttpClientsOptions,
            pubsubHttpClientsOptions: [offlinePubsubUrl]
        });
        offlinePubsubPlebbit.on("error", () => {});
        const mockPost = await generateMockPost(signers[1].address, offlinePubsubPlebbit);

        await assert.isRejected(mockPost.publish(), messages.ERR_ALL_PUBSUB_PROVIDERS_THROW_ERRORS);

        expect(mockPost.publishingState).to.equal("failed");
        expect(mockPost.clients.pubsubClients[offlinePubsubUrl].state).to.equal("stopped");
    });
});
