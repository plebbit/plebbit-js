import { expect } from "chai";
import signers from "../../../../fixtures/signers.js";
import { it, describe } from "vitest";
import {
    generateMockPost,
    publishRandomReply,
    publishWithExpectedResult,
    publishRandomPost,
    getAvailablePlebbitConfigsToTestAgainst,
    itSkipIfRpc,
    iterateThroughPagesToFindCommentInParentPagesInstance,
    waitTillPostInSubplebbitInstancePages,
    waitTillReplyInParentPagesInstance,
    publishCommentWithDepth
} from "../../../../../dist/node/test/test-util.js";
import { signComment } from "../../../../../dist/node/signer/signatures.js";
import { of as calculateIpfsHash } from "typestub-ipfs-only-hash";

const subplebbitAddress = signers[0].address;

getAvailablePlebbitConfigsToTestAgainst().map((config) => {
    describe.concurrent("publishing posts - " + config.name, async () => {
        let plebbit, sub;

        before(async () => {
            plebbit = await config.plebbitInstancePromise();
            sub = await plebbit.getSubplebbit(subplebbitAddress);
            await sub.update();
        });

        after(async () => {
            await plebbit.destroy();
        });

        it("Can publish a post", async () => {
            const title = "Test of ability to publish posts" + Date.now();
            const post = await publishRandomPost(subplebbitAddress, plebbit, { title });
            expect(post.depth).to.equal(0);
            expect(post.title).to.equal(title);
            await waitTillPostInSubplebbitInstancePages(post, sub);
            const postInPage = await iterateThroughPagesToFindCommentInParentPagesInstance(post.cid, sub.posts);
            expect(postInPage.title).to.equal(title);
        });

        it(`Can Publish a post with only link`, async () => {
            const link = "https://demo.plebbit.eth.limo";
            const post = await generateMockPost(subplebbitAddress, plebbit, false, { link });
            expect(post.link).to.equal(link);
            await publishWithExpectedResult(post, true);
            await waitTillPostInSubplebbitInstancePages(post, sub);
            const postInPage = await iterateThroughPagesToFindCommentInParentPagesInstance(post.cid, sub.posts);
            expect(postInPage.link).to.equal(link);
        });

        it("Can publish posts with emoji for title and content", async () => {
            const emojiContents = [
                "Hey 👋 Mate.\nCongratulations 🎉, Your Project Listed On CoinGecko.\n\nhttps://www.coingecko.com/en/coins/plebbit\n\nWe have best service for help grow your project.\n\n🌟 CG Watchlist $8 / 1000\n🌟 CG Thumb 👍 Votes \n\n⭐️ CoinGecko Trendings\n    🔘 Reginal Trend\nhttps://www.coingecko.com/en/watchlists/trending-crypto/united-states\n\nUSA, UK, Brazil, India, Philippines, Turkey, Indonesia,\n    \n    🔘 Main & Searches Bar Trend \nhttps://www.coingecko.com/en/watchlists/trending-crypto\n\nTop Spot -   #1 to #3\nHighly probably top #1",
                "Hey \ud83d\udc4b Mate.\nCongratulations \ud83c\udf89, Your Project Listed On CoinGecko.\n\nhttps://www.coingecko.com/en/coins/plebbit\n\nWe have best service for help grow your project.\n\n\ud83c\udf1f CG Watchlist $8 / 1000\n\ud83c\udf1f CG Thumb \ud83d\udc4d Votes \n\n⭐️ CoinGecko Trendings\n    \ud83d\udd18 Reginal Trend\nhttps://www.coingecko.com/en/watchlists/trending-crypto/united-states\n\nUSA, UK, Brazil, India, Philippines, Turkey, Indonesia,\n    \n    \ud83d\udd18 Main & Searches Bar Trend \nhttps://www.coingecko.com/en/watchlists/trending-crypto\n\nTop Spot -   #1 to #3\nHighly probably top #1",
                "Lorem ipsum dolor...\n...there's a mouse on the floor\\s\\s\nand it's running for the door\\s\\s\nin front of the the zombie Moor.\n...thank you, I'll let myself out.\n💂\n",
                " 😜 😀 you will never be fixed"
            ];

            await Promise.all(
                emojiContents.map(async (content) => {
                    const publishedPostWithEmojiContent = await publishRandomPost(subplebbitAddress, plebbit, {
                        content,
                        title: content
                    });
                    expect(publishedPostWithEmojiContent.content).to.equal(content);
                    expect(publishedPostWithEmojiContent.title).to.equal(content);

                    const publishedPostIpfs = JSON.stringify(publishedPostWithEmojiContent.toJSONIpfs());
                    expect(await calculateIpfsHash(publishedPostIpfs)).to.equal(publishedPostWithEmojiContent.cid);

                    const remotePost = await plebbit.getComment(publishedPostWithEmojiContent.cid);
                    const remotePostIpfs = JSON.stringify(remotePost.toJSONIpfs());
                    expect(await calculateIpfsHash(remotePostIpfs)).to.equal(publishedPostWithEmojiContent.cid);

                    await waitTillPostInSubplebbitInstancePages(publishedPostWithEmojiContent, sub);
                    const postInPage = await iterateThroughPagesToFindCommentInParentPagesInstance(
                        publishedPostWithEmojiContent.cid,
                        sub.posts
                    );
                    expect(postInPage.content).to.equal(content);
                    expect(postInPage.title).to.equal(content);
                })
            );
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
            await waitTillPostInSubplebbitInstancePages(post, sub);
            const postInPage = await iterateThroughPagesToFindCommentInParentPagesInstance(post.cid, sub.posts);
            expect(postInPage.author.avatar).to.deep.equal(commentProps.author.avatar);
            expect(postInPage.author.address).to.equal(commentProps.author.address);
            expect(postInPage.content).to.equal(commentProps.content);
            expect(postInPage.title).to.equal(commentProps.title);
            expect(postInPage.subplebbitAddress).to.equal(commentProps.subplebbitAddress);
        });

        it(`Can publish a post with spoiler`, async () => {
            const spoilerValues = [false, true, undefined];

            await Promise.all(
                spoilerValues.map(async (spoilerValue) => {
                    const post = await generateMockPost(subplebbitAddress, plebbit, false, { spoiler: spoilerValue });

                    expect(post.spoiler).to.equal(spoilerValue);

                    await publishWithExpectedResult(post, true);
                    expect(post.spoiler).to.equal(spoilerValue);
                    const remotePostFromCid = await plebbit.getComment(post.cid);
                    expect(remotePostFromCid.spoiler).to.equal(spoilerValue);
                    await waitTillPostInSubplebbitInstancePages(post, sub);
                    const postInPage = await iterateThroughPagesToFindCommentInParentPagesInstance(post.cid, sub.posts);
                    expect(postInPage.spoiler).to.equal(spoilerValue);
                    await post.stop();
                })
            );
        });

        it(`Can publish a post with nsfw`, async () => {
            const nsfwValues = [false, true, undefined];

            await Promise.all(
                nsfwValues.map(async (nsfwValue) => {
                    const post = await generateMockPost(subplebbitAddress, plebbit, false, { nsfw: nsfwValue });

                    expect(post.nsfw).to.equal(nsfwValue);

                    await publishWithExpectedResult(post, true);
                    expect(post.nsfw).to.equal(nsfwValue);
                    const remotePostFromCid = await plebbit.getComment(post.cid);
                    expect(remotePostFromCid.nsfw).to.equal(nsfwValue);
                    await waitTillPostInSubplebbitInstancePages(post, sub);
                    const postInPage = await iterateThroughPagesToFindCommentInParentPagesInstance(post.cid, sub.posts);
                    expect(postInPage.nsfw).to.equal(nsfwValue);
                    await post.stop();
                })
            );
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
            await waitTillPostInSubplebbitInstancePages(post, sub);
            const postInPage = await iterateThroughPagesToFindCommentInParentPagesInstance(post.cid, sub.posts);
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
            const post = await generateMockPost(subplebbitAddress, plebbit, false, {
                linkHtmlTagName: "img",
                link: "https://google.com"
            });
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

            await waitTillPostInSubplebbitInstancePages(post, sub);
            const postInPage = await iterateThroughPagesToFindCommentInParentPagesInstance(post.cid, sub.posts);
            expect(postInPage.author.wallets).to.be.undefined;

            const loadedPost = await plebbit.getComment(post.cid); // should fail if signature is incorrect
            expect(loadedPost.author.wallets).to.be.undefined;
        });

        itSkipIfRpc(`publish() can be caught if subplebbit failed to load`, async () => {
            const randomSigner = await plebbit.createSigner();
            const downSubplebbitAddress = randomSigner.address; // an offline sub
            const post = await generateMockPost(downSubplebbitAddress, plebbit);
            plebbit._timeouts["subplebbit-ipns"] = 100; // need to change time out from 5 minutes to 100ms

            try {
                await post.publish();
                expect.fail("should fail");
            } catch (e) {
                expect(e.code).to.be.oneOf([
                    "ERR_IPNS_RESOLUTION_P2P_TIMEOUT", // for kubo-rpc-client
                    "ERR_FAILED_TO_FETCH_SUBPLEBBIT_FROM_GATEWAYS", // for ipfs gateways
                    "ERR_RESOLVED_IPNS_P2P_TO_UNDEFINED", // for kubo-rpc-client
                    "ERR_FAILED_TO_RESOLVE_IPNS_VIA_IPFS_P2P" // for libp2p/helia
                ]);
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

    describe.concurrent(`Publishing replies - ${config.name}`, async () => {
        let plebbit;

        before(async () => {
            plebbit = await config.plebbitInstancePromise();
        });

        after(async () => await plebbit.destroy());

        it(`Can publish a reply with title, content and link defined`, async () => {
            const title = `Test title on Comment ${Date.now()} ${Math.random()}`;
            const content = "Random Content" + Math.random();
            const link = "https://plebbit.com";
            const post = await publishRandomPost(subplebbitAddress, plebbit);
            await post.update();
            const reply = await publishRandomReply(post, plebbit, {
                title,
                content,
                link
            });
            expect(reply.title).to.equal(title);
            expect(reply.content).to.equal(content);
            expect(reply.link).to.equal(link);

            await waitTillReplyInParentPagesInstance(reply, post);
            const replyInPage = await iterateThroughPagesToFindCommentInParentPagesInstance(reply.cid, post.replies);
            expect(replyInPage.title).to.equal(title);
            expect(replyInPage.content).to.equal(content);
            expect(replyInPage.link).to.equal(link);
        });

        [2, 3, 10, 30].map((depth) =>
            it(`Can publish reply with depth = ${depth}`, async () => {
                const subplebbit = await plebbit.getSubplebbit(subplebbitAddress);
                const reply = await publishCommentWithDepth({ depth, subplebbit });
                expect(reply.depth).to.be.equal(depth);

                const parentComment = await plebbit.getComment(reply.parentCid);
                await parentComment.update();

                await waitTillReplyInParentPagesInstance(reply, parentComment);
                const replyInPage = await iterateThroughPagesToFindCommentInParentPagesInstance(reply.cid, parentComment.replies);
                expect(replyInPage).to.exist;
                expect(replyInPage.content).to.equal(reply.content);
                expect(replyInPage.timestamp).to.equal(reply.timestamp);
                expect(replyInPage.depth).to.equal(reply.depth);
            })
        );
    });
});
