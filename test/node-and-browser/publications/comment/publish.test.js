import signers from "../../../fixtures/signers.js";
import {
    generateMockPost,
    publishRandomReply,
    publishWithExpectedResult,
    publishRandomPost,
    mockRemotePlebbit,
    findCommentInPage,
    mockGatewayPlebbit,
    waitTillReplyInParentPages,
    getRemotePlebbitConfigs,
    describeSkipIfRpc,
    mockPlebbit,
    waitTillPostInSubplebbitPages,
    resolveWhenConditionIsTrue
} from "../../../../dist/node/test/test-util.js";
import { messages } from "../../../../dist/node/errors.js";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { signComment } from "../../../../dist/node/signer/signatures.js";
import { of as calculateIpfsHash } from "typestub-ipfs-only-hash";

chai.use(chaiAsPromised);
const { expect, assert } = chai;

const subplebbitAddress = signers[0].address;

getRemotePlebbitConfigs().map((config) => {
    describe("publishing posts - " + config.name, async () => {
        let plebbit;

        before(async () => {
            plebbit = await config.plebbitInstancePromise();
        });

        it("Can publish a post", async () => {
            const title = "Test of ability to publish posts" + Date.now();
            const post = await publishRandomPost(subplebbitAddress, plebbit, { title });
            expect(post.depth).to.equal(0);
            expect(post.title).to.equal(title);
        });

        it(`Can Publish a post with only link`, async () => {
            const link = "https://demo.plebbit.eth.limo";
            const post = await generateMockPost(subplebbitAddress, plebbit, false, { link });
            expect(post.link).to.equal(link);
            await publishWithExpectedResult(post, true);
            await waitTillPostInSubplebbitPages(post, plebbit);
            const sub = await plebbit.getSubplebbit(post.subplebbitAddress);
            const postInPage = await findCommentInPage(post.cid, sub.posts.pageCids.new, sub.posts);
            expect(postInPage.link).to.equal(link);
        });

        it("Can publish posts with emoji for title and content", async () => {
            const emojiContents = [
                "Hey 👋 Mate.\nCongratulations 🎉, Your Project Listed On CoinGecko.\n\nhttps://www.coingecko.com/en/coins/plebbit\n\nWe have best service for help grow your project.\n\n🌟 CG Watchlist $8 / 1000\n🌟 CG Thumb 👍 Votes \n\n⭐️ CoinGecko Trendings\n    🔘 Reginal Trend\nhttps://www.coingecko.com/en/watchlists/trending-crypto/united-states\n\nUSA, UK, Brazil, India, Philippines, Turkey, Indonesia,\n    \n    🔘 Main & Searches Bar Trend \nhttps://www.coingecko.com/en/watchlists/trending-crypto\n\nTop Spot -   #1 to #3\nHighly probably top #1",
                "Hey \ud83d\udc4b Mate.\nCongratulations \ud83c\udf89, Your Project Listed On CoinGecko.\n\nhttps://www.coingecko.com/en/coins/plebbit\n\nWe have best service for help grow your project.\n\n\ud83c\udf1f CG Watchlist $8 / 1000\n\ud83c\udf1f CG Thumb \ud83d\udc4d Votes \n\n⭐️ CoinGecko Trendings\n    \ud83d\udd18 Reginal Trend\nhttps://www.coingecko.com/en/watchlists/trending-crypto/united-states\n\nUSA, UK, Brazil, India, Philippines, Turkey, Indonesia,\n    \n    \ud83d\udd18 Main & Searches Bar Trend \nhttps://www.coingecko.com/en/watchlists/trending-crypto\n\nTop Spot -   #1 to #3\nHighly probably top #1",
                "Lorem ipsum dolor...\n...there's a mouse on the floor\\s\\s\nand it's running for the door\\s\\s\nin front of the the zombie Moor.\n...thank you, I'll let myself out.\n💂\n",
                " 😜 😀 you will never be fixed"
            ];

            for (const content of emojiContents) {
                const publishedPostContent = await publishRandomPost(subplebbitAddress, plebbit, { content, title: content });
                expect(publishedPostContent.content).to.equal(content);
                expect(publishedPostContent.title).to.equal(content);

                const publishedPostIpfs = JSON.stringify(publishedPostContent.toJSONIpfs());
                expect(await calculateIpfsHash(publishedPostIpfs)).to.equal(publishedPostContent.cid);

                const remotePost = await plebbit.getComment(publishedPostContent.cid);
                const remotePostIpfs = JSON.stringify(remotePost.toJSONIpfs());
                expect(await calculateIpfsHash(remotePostIpfs)).to.equal(publishedPostContent.cid);
            }
        });

        it(`post.author.shortAddress is defined throughout publishing`, async () => {
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
                        timestamp: 123456,
                        id: "8",
                        signature: {
                            signature:
                                "0x52d29d32fcb1c5b3cd3638ccd67573985c4b01816a5e77fdfb0122488a0fdeb854ca6dae4fbdb0594db88e36ba83e87a321321fcfde498f84310a6b5cd543f3f1c",
                            type: "eip191"
                        }
                    }
                }
            };
            const post = await plebbit.createComment({ ...commentProps, signer: signers[6] });

            await publishWithExpectedResult(post, true);
            await waitTillPostInSubplebbitPages(post, plebbit);
            const postSubplebbit = await plebbit.getSubplebbit(post.subplebbitAddress);
            // Should have post
            const postInPage = await findCommentInPage(post.cid, postSubplebbit.posts.pageCids.new, postSubplebbit.posts);
            expect(postInPage.author.avatar).to.deep.equal(commentProps.author.avatar);
            expect(postInPage.author.address).to.equal(commentProps.author.address);
            expect(postInPage.content).to.equal(commentProps.content);
            expect(postInPage.title).to.equal(commentProps.title);
            expect(postInPage.subplebbitAddress).to.equal(commentProps.subplebbitAddress);
        });

        it(`Can publish a post with spoiler`, async () => {
            const spoilerValues = [false, true, undefined];

            for (const spoilerValue of spoilerValues) {
                const post = await generateMockPost(subplebbitAddress, plebbit, false, { spoiler: spoilerValue });

                expect(post.spoiler).to.equal(spoilerValue);

                await publishWithExpectedResult(post, true);
                expect(post.spoiler).to.equal(spoilerValue);
                const remotePostFromCid = await plebbit.getComment(post.cid);
                expect(remotePostFromCid.spoiler).to.equal(spoilerValue);
                await waitTillPostInSubplebbitPages(post, plebbit);
                const sub = await plebbit.getSubplebbit(post.subplebbitAddress);
                const postInPage = await findCommentInPage(post.cid, sub.posts.pageCids.new, sub.posts);
                expect(postInPage.spoiler).to.equal(spoilerValue);
                await post.stop();
            }
        });

        it(`Can publish a post with nsfw`, async () => {
            const nsfwValues = [false, true, undefined];

            for (const nsfwValue of nsfwValues) {
                const post = await generateMockPost(subplebbitAddress, plebbit, false, { nsfw: nsfwValue });

                expect(post.nsfw).to.equal(nsfwValue);

                await publishWithExpectedResult(post, true);
                expect(post.nsfw).to.equal(nsfwValue);
                const remotePostFromCid = await plebbit.getComment(post.cid);
                expect(remotePostFromCid.nsfw).to.equal(nsfwValue);
                await waitTillPostInSubplebbitPages(post, plebbit);
                const sub = await plebbit.getSubplebbit(post.subplebbitAddress);
                const postInPage = await findCommentInPage(post.cid, sub.posts.pageCids.new, sub.posts);
                expect(postInPage.nsfw).to.equal(nsfwValue);
                await post.stop();
            }
        });

        it(`Can publish a post with author.wallets`, async () => {
            const wallets = {
                eth: {
                    address: "rinse12.eth",
                    timestamp: Math.round(Date.now() / 1000),
                    signature: { type: "eip191", signature: "0xnotactualsignaturejusttosatisfyschema" }
                }
            };
            const post = await generateMockPost(subplebbitAddress, plebbit, false, { author: { wallets } });
            expect(post.author.wallets).to.deep.equal(wallets);
            await publishWithExpectedResult(post, true);
            await waitTillPostInSubplebbitPages(post, plebbit);
            const sub = await plebbit.getSubplebbit(post.subplebbitAddress);
            const postInPage = await findCommentInPage(post.cid, sub.posts.pageCids.new, sub.posts);
            expect(postInPage.author.wallets).to.deep.equal(wallets);
            await post.stop();
        });

        it(`Can publish a post that was created from another comment instance`, async () => {
            const comment1 = await generateMockPost(subplebbitAddress, plebbit);
            const commentToPublish = await plebbit.createComment(comment1);
            await publishWithExpectedResult(commentToPublish, true);
            expect(commentToPublish.toJSONPubsubMessagePublication()).to.deep.equal(comment1.toJSONPubsubMessagePublication());
        });

        it(`Can publish a post that was created from jsonfied comment instance`, async () => {
            const comment1 = await generateMockPost(subplebbitAddress, plebbit);
            const commentToPublish = await plebbit.createComment(JSON.parse(JSON.stringify(comment1)));
            await publishWithExpectedResult(commentToPublish, true);
            expect(commentToPublish.toJSONPubsubMessagePublication()).to.deep.equal(comment1.toJSONPubsubMessagePublication());
            expect(commentToPublish.toJSONPubsubRequestToEncrypt()).to.deep.equal(comment1.toJSONPubsubRequestToEncrypt());
        });

        it(`Can publish a post with linkHtmlTagName defined`, async () => {
            const post = await generateMockPost(subplebbitAddress, plebbit, false, { linkHtmlTagName: "img", link: "https://google.com" });
            expect(post.linkHtmlTagName).to.equal("img");
            expect(post.link).to.equal("https://google.com");

            await publishWithExpectedResult(post, true);
            expect(post.linkHtmlTagName).to.equal("img");
            expect(post.link).to.equal("https://google.com");

            const remotePost = await plebbit.getComment(post.cid);
            expect(remotePost.linkHtmlTagName).to.equal("img");
            expect(remotePost.link).to.equal("https://google.com");
        });

        it(`A post with author.wallet = {} doesn't cause issues with pages or signatures`, async () => {
            const post = await generateMockPost(subplebbitAddress, plebbit, false, { author: { wallets: {} } });
            // plebbit.createComment will remove empty {}, so author.wallets will be undefined
            expect(post.author.wallets).to.be.undefined;
            await publishWithExpectedResult(post, true);
            expect(post.author.wallets).to.be.undefined;
            await waitTillPostInSubplebbitPages(post, plebbit);
            await post.stop();
            expect(post.author.wallets).to.be.undefined;

            const sub = await plebbit.getSubplebbit(post.subplebbitAddress);
            const postInPage = await findCommentInPage(post.cid, sub.posts.pageCids.new, sub.posts);
            expect(postInPage.author.wallets).to.be.undefined;

            const loadedPost = await plebbit.getComment(post.cid); // should fail if signature is incorrect
            expect(loadedPost.author.wallets).to.be.undefined;
        });

        it(`publish() can be caught if subplebbit failed to load`, async () => {
            const downSubplebbitAddress = signers[7].address; // an offline sub
            const post = await generateMockPost(downSubplebbitAddress, plebbit);
            plebbit._timeouts.subplebbit = 1 * 1000; // need to change time out from 5 minutes to 1s

            try {
                await post.publish();
                expect.fail("should fail");
            } catch (e) {
                expect(e.code).to.be.oneOf(["ERR_FAILED_TO_FETCH_SUBPLEBBIT_FROM_GATEWAYS", "ERR_FAILED_TO_RESOLVE_IPNS_VIA_IPFS_P2P"]);
                // await assert.isRejected(post.publish(), messages.ERR_FAILED_TO_FETCH_SUBPLEBBIT_FROM_GATEWAYS);
            }
            expect(post.publishingState).to.equal("failed");
            expect(post.state).to.equal("stopped");
        });

        it(`Can publish a post whose signature is defined prior to plebbit.createComment()`, async () => {
            const signer = await plebbit.createSigner();
            const props = {
                subplebbitAddress: "12D3KooWN5rLmRJ8fWMwTtkDN7w2RgPPGRM4mtWTnfbjpi1Sh7zR",
                timestamp: Math.round(Date.now() / 1000),
                author: { address: signer.address, displayName: "Mock Author - 1690130836.1711266" + Math.random() },
                protocolVersion: "1.0.0",
                content: "Mock content - 1690130836.1711266" + Math.random(),
                title: "Mock Post - 1690130836.1711266" + Math.random()
            };

            props.signature = await signComment({ ...props, signer }, plebbit);
            const post = await plebbit.createComment(props);
            expect(post.signature).to.deep.equal(props.signature);
            await publishWithExpectedResult(post, true);
            await post.stop();
        });
    });

    describe(`Publishing replies - ${config.name}`, async () => {
        let post, plebbit;

        const parents = [];

        before(async () => {
            plebbit = await config.plebbitInstancePromise();
            post = await publishRandomPost(subplebbitAddress, plebbit, {});
            parents.push(post);
        });

        after(() => [...parents, post].forEach((parent) => parent.stop()));

        it(`Can publish a reply with title, content and link defined`, async () => {
            await publishRandomReply(
                post,
                plebbit,
                {
                    title: `Test title on Comment ${Date.now()} ${Math.random()}`,
                    content: "Random Content" + Math.random(),
                    link: "https://plebbit.com"
                },
                true
            );
        });

        [1, 2, 3].map((depth) =>
            it(`Can publish comment with depth = ${depth}`, async () => {
                const parentComment = parents[depth - 1];

                const reply = await publishRandomReply(parentComment, plebbit, { signer: post.signer });
                expect(reply.depth).to.be.equal(depth);

                await waitTillReplyInParentPages(reply, plebbit);

                const parentCommentLatest = await plebbit.getComment(parentComment.cid);
                await parentCommentLatest.update();
                await resolveWhenConditionIsTrue(parentCommentLatest, () => typeof parentCommentLatest.updatedAt === "number");
                await parentCommentLatest.stop();
                const replyInPage = await findCommentInPage(
                    reply.cid,
                    parentCommentLatest.replies.pageCids.new,
                    parentCommentLatest.replies
                );
                expect(replyInPage).to.exist;
                expect(replyInPage.content).to.equal(reply.content);
                expect(replyInPage.timestamp).to.equal(reply.timestamp);
                expect(replyInPage.depth).to.equal(reply.depth);
                parents.push(reply);
            })
        );
    });
});

describeSkipIfRpc(`Publishing resilience and errors of gateways and pubsub providers`, async () => {
    it(`comment.publish() can be caught if one of the gateways threw 429 status code and other not responding`, async () => {
        // move
        const error429Gateway = `http://localhost:13416`; // this gateway always returns 429 status code
        const normalIpfsGateway = `http://localhost:18080`;
        const offlineSubAddress = signers[7].address; // offline sub
        const gatewayPlebbit = await mockGatewayPlebbit({ ipfsGatewayUrls: [error429Gateway, normalIpfsGateway] });
        const post = await generateMockPost(offlineSubAddress, gatewayPlebbit);

        gatewayPlebbit._timeouts["subplebbit"] = 3000; // reduce timeout or otherwise it's gonna keep retrying for 5 minutes

        try {
            await post.publish();
            expect.fail("should not resolve");
        } catch (e) {
            expect(e.code, messages.ERR_FAILED_TO_FETCH_SUBPLEBBIT_FROM_GATEWAYS);
            expect(e.details.gatewayToError[error429Gateway].details.status).to.equal(429);
            expect(e.details.gatewayToError[normalIpfsGateway].details.status).to.equal(500);
        }
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
        const tempPlebbit = await mockRemotePlebbit();
        // We're gonna modify this plebbit instance to throw errors when pubsub publish/subscribe is called for two of its pubsub providers (it uses three)
        const pubsubProviders = Object.keys(tempPlebbit.clients.pubsubKuboRpcClients);
        expect(pubsubProviders.length).to.equal(3);

        tempPlebbit.clients.pubsubKuboRpcClients[pubsubProviders[0]]._client.pubsub.publish = () => {
            throw Error("Can't publish");
        };
        tempPlebbit.clients.pubsubKuboRpcClients[pubsubProviders[0]]._client.pubsub.subscribe = () => {
            throw Error("Can't subscribe");
        };

        tempPlebbit.clients.pubsubKuboRpcClients[pubsubProviders[1]]._client.pubsub.publish = () => {
            throw Error("Can't publish");
        };
        tempPlebbit.clients.pubsubKuboRpcClients[pubsubProviders[1]]._client.pubsub.subscribe = () => {
            throw Error("Can't subscribe");
        };
        // Only pubsubProviders [2] is able to publish/subscribe

        const post = await generateMockPost(subplebbitAddress, tempPlebbit);
        await publishWithExpectedResult(post, true);
    });
    it(`comment.publish succeeds if provider 1 is not responding and 2 is responding`, async () => {
        const notRespondingPubsubUrl = "http://localhost:15005/api/v0"; // Should take msgs but not respond, never throws errors
        const upPubsubUrl = "http://localhost:15002/api/v0";
        const plebbit = await mockPlebbit(
            {
                pubsubKuboRpcClientsOptions: [notRespondingPubsubUrl, upPubsubUrl]
            },
            true
        );

        // make the pubsub provider unresponsive
        plebbit.clients.pubsubKuboRpcClients[notRespondingPubsubUrl]._client.pubsub.publish = () => {};
        plebbit.clients.pubsubKuboRpcClients[notRespondingPubsubUrl]._client.pubsub.subscribe = () => {};

        const mockPost = await generateMockPost(signers[0].address, plebbit);

        const expectedStates = {
            [notRespondingPubsubUrl]: ["subscribing-pubsub", "publishing-challenge-request", "waiting-challenge", "stopped"],
            [upPubsubUrl]: ["subscribing-pubsub", "publishing-challenge-request", "waiting-challenge", "stopped"]
        };

        const actualStates = { [notRespondingPubsubUrl]: [], [upPubsubUrl]: [] };

        for (const pubsubUrl of Object.keys(expectedStates))
            mockPost.clients.pubsubKuboRpcClients[pubsubUrl].on("statechange", (newState) => actualStates[pubsubUrl].push(newState));

        await publishWithExpectedResult(mockPost, true);

        expect(mockPost.publishingState).to.equal("succeeded");
        expect(actualStates).to.deep.equal(expectedStates);
        await mockPost.stop();
    });
    it(`comment emits and throws errors if all providers fail to publish`, async () => {
        const offlinePubsubUrls = ["http://localhost:23425", "http://localhost:23426"];
        const offlinePubsubPlebbit = await mockRemotePlebbit({
            pubsubKuboRpcClientsOptions: offlinePubsubUrls
        });
        const mockPost = await generateMockPost(signers[1].address, offlinePubsubPlebbit);

        const errorPromise = new Promise((resolve) => mockPost.once("error", resolve));

        await assert.isRejected(mockPost.publish(), messages.ERR_ALL_PUBSUB_PROVIDERS_THROW_ERRORS);
        const emittedError = await errorPromise;
        expect(emittedError.code).to.equal("ERR_ALL_PUBSUB_PROVIDERS_THROW_ERRORS");

        expect(mockPost.publishingState).to.equal("failed");
        expect(mockPost.clients.pubsubKuboRpcClients[offlinePubsubUrls[0]].state).to.equal("stopped");
        expect(mockPost.clients.pubsubKuboRpcClients[offlinePubsubUrls[1]].state).to.equal("stopped");
    });
    it(`comment emits error when provider 1 is not responding and provider 2 throws an error`, async () => {
        // First provider waits, second provider fails to publish
        // second provider should update its state to be stopped, but it should not emit an error until the first provider is done with waiting

        const notRespondingPubsubUrl = "http://localhost:15005/api/v0"; // Should take msgs but not respond, never throws errors
        const offlinePubsubUrl = "http://localhost:23425"; // Will throw errors; can't subscribe or publish
        const offlinePubsubPlebbit = await mockRemotePlebbit({
            pubsubKuboRpcClientsOptions: [notRespondingPubsubUrl, offlinePubsubUrl]
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
            mockPost.clients.pubsubKuboRpcClients[pubsubUrl].on("statechange", (newState) => actualStates[pubsubUrl].push(newState));

        await mockPost.publish();

        await new Promise((resolve) => setTimeout(() => resolve(), mockPost._setProviderFailureThresholdSeconds * 1000));
        expect(emittedError).to.be.not.undefined;
        expect(emittedError.code).to.equal("ERR_CHALLENGE_REQUEST_RECEIVED_NO_RESPONSE_FROM_ANY_PROVIDER");

        expect(mockPost.publishingState).to.equal("failed");
        expect(actualStates).to.deep.equal(expectedStates);
        await mockPost.stop();
    });
});
