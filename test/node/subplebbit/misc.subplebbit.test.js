import { expect } from "chai";
import {
    mockPlebbit,
    publishRandomPost,
    createSubWithNoChallenge,
    publishRandomReply,
    generateMockPost,
    itSkipIfRpc,
    itIfRpc,
    publishWithExpectedResult,
    resolveWhenConditionIsTrue,
    describeSkipIfRpc,
    describeIfRpc,
    waitTillPostInSubplebbitPages
} from "../../../dist/node/test/test-util.js";

import signers from "../../fixtures/signers.js";

describe(`subplebbit.{lastPostCid, lastCommentCid}`, async () => {
    let plebbit, sub;
    before(async () => {
        plebbit = await mockPlebbit();
        sub = await createSubWithNoChallenge({}, plebbit);
        await sub.start();
        await resolveWhenConditionIsTrue({ toUpdate: sub, predicate: () => typeof sub.updatedAt === "number" });
    });

    after(async () => {
        await sub.delete();
        await plebbit.destroy();
    });

    it(`subplebbit.lastPostCid and lastCommentCid reflects latest post published`, async () => {
        expect(sub.lastPostCid).to.be.undefined;
        expect(sub.lastCommentCid).to.be.undefined;
        const post = await publishRandomPost(sub.address, plebbit);
        await waitTillPostInSubplebbitPages(post, plebbit);
        expect(sub.lastPostCid).to.equal(post.cid);
        expect(sub.lastCommentCid).to.equal(post.cid);
    });

    it(`subplebbit.lastPostCid doesn't reflect latest reply`, async () => {
        await publishRandomReply(sub.posts.pages.hot.comments[0], plebbit);
        expect(sub.lastPostCid).to.equal(sub.posts.pages.hot.comments[0].cid);
    });

    it(`subplebbit.lastCommentCid reflects latest comment (post or reply)`, async () => {
        await resolveWhenConditionIsTrue({ toUpdate: sub, predicate: () => sub.posts.pages.hot?.comments[0]?.replyCount > 0 });
        expect(sub.lastCommentCid).to.equal(sub.posts.pages.hot.comments[0].replies.pages.best.comments[0].cid);
    });
});

describeSkipIfRpc(`Create a sub with basic auth urls`, async () => {
    it(`Can create a sub with encoded authorization `, async () => {
        const headers = {
            authorization: "Basic " + Buffer.from("username" + ":" + "password").toString("base64")
        };
        const kuboRpcClientsOptions = [
            {
                url: "http://localhost:15001/api/v0",
                headers
            }
        ];
        const pubsubKuboRpcClientsOptions = [
            {
                url: "http://localhost:15002/api/v0",
                headers
            }
        ];

        const plebbitOptions = {
            kuboRpcClientsOptions,
            pubsubKuboRpcClientsOptions
        };

        const plebbit = await mockPlebbit(plebbitOptions);
        const sub = await createSubWithNoChallenge({}, plebbit);
        await sub.start();
        await resolveWhenConditionIsTrue({ toUpdate: sub, predicate: () => typeof sub.updatedAt === "number" });
        await publishRandomPost(sub.address, plebbit);
        await sub.delete();
        await plebbit.destroy();
    });

    it(`Can publish a post with user@password for both ipfs and pubsub http client`, async () => {
        const kuboRpcClientsOptions = [`http://user:password@localhost:15001/api/v0`];
        const pubsubKuboRpcClientsOptions = [`http://user:password@localhost:15002/api/v0`];
        const plebbitOptions = {
            kuboRpcClientsOptions,
            pubsubKuboRpcClientsOptions
        };

        const plebbit = await mockPlebbit(plebbitOptions);
        const sub = await createSubWithNoChallenge({}, plebbit);
        await sub.start();
        await resolveWhenConditionIsTrue({ toUpdate: sub, predicate: () => typeof sub.updatedAt === "number" });
        await publishRandomPost(sub.address, plebbit);
        await sub.delete();
        await plebbit.destroy();
    });
});

describe(`subplebbit.pubsubTopic`, async () => {
    let subplebbit, plebbit;
    before(async () => {
        plebbit = await mockPlebbit();
        subplebbit = await createSubWithNoChallenge({}, plebbit);
    });

    after(async () => {
        await subplebbit.delete();
        await plebbit.destroy();
    });

    it(`subplebbit.pubsubTopic is defaulted to address when subplebbit is first created`, async () => {
        expect(subplebbit.pubsubTopic).to.equal(subplebbit.address);
    });
    it(`Publications can be published to a sub with pubsubTopic=undefined`, async () => {
        await subplebbit.edit({ pubsubTopic: undefined });
        expect(subplebbit.pubsubTopic).to.be.undefined;
        await subplebbit.start();
        await resolveWhenConditionIsTrue({ toUpdate: subplebbit, predicate: () => typeof subplebbit.updatedAt === "number" });
        expect(subplebbit.pubsubTopic).to.be.undefined;

        const post = await publishRandomPost(subplebbit.address, plebbit, {});
        expect(post.subplebbit?.pubsubTopic).to.be.undefined;
    });
});

describe.skip(`comment.link`, async () => {
    let plebbit, subplebbit;

    before(async () => {
        plebbit = await mockPlebbit();
        subplebbit = await createSubWithNoChallenge({}, plebbit);
        await subplebbit.edit({ settings: { ...subplebbit.settings, fetchThumbnailUrls: true } });
        expect(subplebbit.settings.fetchThumbnailUrls).to.be.true;

        await subplebbit.start();
        await resolveWhenConditionIsTrue({ toUpdate: subplebbit, predicate: () => typeof subplebbit.updatedAt === "number" });
    });

    after(async () => {
        await subplebbit.delete();
        await plebbit.destroy();
    });

    describe.skip(`comment.thumbnailUrl`, async () => {
        it(`comment.thumbnailUrl is generated for youtube video with thumbnailUrlWidth and thumbnailUrlHeight`, async () => {
            const url = "https://www.youtube.com/watch?v=TLysAkFM4cA";
            const post = await publishRandomPost(subplebbit.address, plebbit, { link: url });
            const expectedThumbnailUrl = "https://i.ytimg.com/vi/TLysAkFM4cA/maxresdefault.jpg";
            expect(post.thumbnailUrl).to.equal(expectedThumbnailUrl);
            expect(post.thumbnailUrlWidth).to.equal(1280);
            expect(post.thumbnailUrlHeight).to.equal(720);
        });

        it(`generates thumbnail url for html page with thumbnailUrlWidth and thumbnailUrlHeight`, async () => {
            const url =
                "https://www.correiobraziliense.com.br/politica/2023/06/5101828-moraes-determina-novo-bloqueio-das-redes-sociais-e-canais-de-monark.html";
            const post = await publishRandomPost(subplebbit.address, plebbit, { link: url });
            const expectedThumbnailUrl =
                "https://midias.correiobraziliense.com.br/_midias/jpg/2022/03/23/675x450/1_monark-7631489.jpg?20230614170105?20230614170105";
            expect(post.thumbnailUrl).to.equal(expectedThumbnailUrl);
            expect(post.thumbnailUrlWidth).to.equal(675);
            expect(post.thumbnailUrlHeight).to.equal(450);
        });

        it(`Generates thumbnail url for html page with no ogWidth and ogHeight correctly with thumbnailUrlWidth and thumbnailUrlHeight`, async () => {
            const url =
                "https://pleb.bz/p/reddit-screenshots.eth/c/QmUBqbdaVNNCaPUYZjqizYYL42wgr4YBfxDAcjxLJ59vid?redirect=plebones.eth.limo";
            const post = await publishRandomPost(subplebbit.address, plebbit, { link: url });
            const expectedThumbnailUrl = "https://i.imgur.com/6Ogacyq.png";
            expect(post.thumbnailUrl).to.equal(expectedThumbnailUrl);
            expect(post.thumbnailUrlWidth).to.equal(512);
            expect(post.thumbnailUrlHeight).to.equal(497);
        });

        it.skip(`Generates thumbnail url for twitter urls correctly`, async () => {
            const url = "https://fxtwitter.com/deedydas/status/1914714739432939999";
            const post = await publishRandomPost(subplebbit.address, plebbit, { link: url });
            const expectedThumbnailUrl = "https://pbs.twimg.com/media/F3iniP-XcAA1TVU.jpg:large";
            expect(post.thumbnailUrl).to.equal(expectedThumbnailUrl);
            expect(post.thumbnailUrlWidth).to.equal(1125);
            expect(post.thumbnailUrlHeight).to.equal(1315);
        });

        it(`comment.thumbnailUrl and width and height is defined if comment.link is a link of a jpg`, async () => {
            const link = "https://i.ytimg.com/vi/TLysAkFM4cA/maxresdefault.jpg";
            const post = await publishRandomPost(subplebbit.address, plebbit, { link });
            expect(post.link).to.equal(link);
            expect(post.thumbnailUrl).to.equal(link);
            expect(post.thumbnailUrlWidth).to.equal(1280);
            expect(post.thumbnailUrlHeight).to.equal(720);
        });

        it.skip(`comment.thumbnailUrl and width and height is defined is undefined if comment.link is a link of a gif`, async () => {
            const link = "https://files.catbox.moe/nlsfav.gif";
            const post = await publishRandomPost(subplebbit.address, plebbit, { link });
            expect(post.link).to.equal(link);
            expect(post.thumbnailUrl).to.equal(link);
            expect(post.thumbnailUrlWidth).to.be.undefined;
            expect(post.thumbnailUrlHeight).to.be.undefined;
        });
    });

    it(`comment.linkWidth and linkHeight is defined if the author defines them`, async () => {
        const link = "https://i.ytimg.com/vi/TLysAkFM4cA/maxresdefault.jpg";
        const linkWidth = 200;
        const linkHeight = 200;
        const post = await publishRandomPost(subplebbit.address, plebbit, { link, linkWidth, linkHeight });
        expect(post.link).to.equal(link);
        expect(post.linkHeight).to.equal(linkHeight);
        expect(post.linkWidth).to.equal(linkWidth);

        await waitTillPostInSubplebbitPages(post, plebbit);

        const postInSubPages = subplebbit.posts.pages.hot.comments.find((comment) => comment.cid === post.cid);
        expect(postInSubPages.link).to.equal(link);
        expect(postInSubPages.linkHeight).to.equal(linkHeight);
        expect(postInSubPages.linkWidth).to.equal(linkWidth);
    });
});

describe(`subplebbit.clients (Local)`, async () => {
    let plebbit;
    before(async () => {
        plebbit = await mockPlebbit();
    });

    describeSkipIfRpc(`subplebbit.clients.kuboRpcClients`, async () => {
        it(`subplebbit.clients.kuboRpcClients[url] is stopped by default`, async () => {
            const mockSub = await createSubWithNoChallenge({}, plebbit);
            expect(Object.keys(mockSub.clients.kuboRpcClients).length).to.equal(1);
            expect(Object.values(mockSub.clients.kuboRpcClients)[0].state).to.equal("stopped");
        });

        it(`subplebbit.clients.kuboRpcClients.state is publishing-ipns before publishing a new IPNS`, async () => {
            const sub = await createSubWithNoChallenge({}, plebbit);

            let publishStateTime;
            let updateTime;

            const ipfsUrl = Object.keys(sub.clients.kuboRpcClients)[0];

            sub.clients.kuboRpcClients[ipfsUrl].on(
                "statechange",
                (newState) => newState === "publishing-ipns" && (publishStateTime = Date.now())
            );

            sub.once("update", () => (updateTime = Date.now()));

            const updatePromise = new Promise((resolve) => sub.once("update", resolve));
            await sub.start();
            await updatePromise;
            await sub.stop();

            expect(publishStateTime).to.be.a("number");
            expect(updateTime).to.be.a("number");
            expect(publishStateTime).to.be.lessThan(updateTime);
        });
    });

    describeSkipIfRpc(`subplebbit.clients.pubsubKuboRpcClients`, async () => {
        it(`subplebbit.clients.pubsubKuboRpcClients[url].state is stopped by default`, async () => {
            const mockSub = await createSubWithNoChallenge({}, plebbit);
            expect(Object.keys(mockSub.clients.pubsubKuboRpcClients).length).to.equal(3);
            expect(Object.values(mockSub.clients.pubsubKuboRpcClients)[0].state).to.equal("stopped");
        });

        it(`correct order of pubsubKuboRpcClients state when receiving a comment while skipping challenge`, async () => {
            const mockSub = await createSubWithNoChallenge({}, plebbit);

            const expectedStates = ["waiting-challenge-requests", "publishing-challenge-verification", "waiting-challenge-requests"];

            const actualStates = [];

            const pubsubUrl = Object.keys(mockSub.clients.pubsubKuboRpcClients)[0];

            mockSub.clients.pubsubKuboRpcClients[pubsubUrl].on("statechange", (newState) => actualStates.push(newState));

            await mockSub.start();

            await resolveWhenConditionIsTrue({ toUpdate: mockSub, predicate: () => typeof mockSub.updatedAt === "number" });

            const challengeVerificationPromise = new Promise((resolve) => mockSub.once("challengeverification", resolve));
            await publishRandomPost(mockSub.address, plebbit);

            await challengeVerificationPromise;

            expect(actualStates).to.deep.equal(expectedStates);
        });

        it(`Correct order of pubsubKuboRpcClients when receiving a comment while mandating challenge`, async () => {
            const mockSub = await plebbit.createSubplebbit({});

            await mockSub.edit({ settings: { challenges: [{ name: "question", options: { question: "1+1=?", answer: "2" } }] } });

            const expectedStates = [
                "waiting-challenge-requests",
                "publishing-challenge",
                "waiting-challenge-answers",
                "publishing-challenge-verification",
                "waiting-challenge-requests"
            ];

            const actualStates = [];

            const pubsubUrl = Object.keys(mockSub.clients.pubsubKuboRpcClients)[0];

            mockSub.clients.pubsubKuboRpcClients[pubsubUrl].on("statechange", (newState) => actualStates.push(newState));

            await mockSub.start();

            await resolveWhenConditionIsTrue({ toUpdate: mockSub, predicate: () => typeof mockSub.updatedAt === "number" });

            const post = await generateMockPost(mockSub.address, plebbit);
            post.once("challenge", async () => {
                await post.publishChallengeAnswers(["2"]);
            });
            await post.publish();

            await new Promise((resolve) => mockSub.once("challengeverification", resolve));

            expect(actualStates).to.deep.equal(expectedStates);

            await mockSub.delete();
        });
    });

    describeSkipIfRpc(`subplebbit.clients.chainProviders`, async () => {
        let mockSub;
        before(async () => {
            mockSub = await createSubWithNoChallenge({}, plebbit);
        });

        after(async () => {
            await mockSub.delete();
        });
        it(`subplebbit.clients.chainProviders[url].state is stopped by default`, async () => {
            expect(Object.keys(mockSub.clients.chainProviders).length).to.be.greaterThanOrEqual(1);
            for (const chain of Object.keys(mockSub.clients.chainProviders)) {
                expect(Object.keys(mockSub.clients.chainProviders[chain]).length).to.be.greaterThan(0);
                for (const chainUrl of Object.keys(mockSub.clients.chainProviders[chain]))
                    expect(mockSub.clients.chainProviders[chain][chainUrl].state).to.equal("stopped");
            }
        });

        it(`correct order of chainProviders state when receiving a comment with a domain for author.address`, async () => {
            const expectedStates = ["resolving-author-address", "stopped"];

            const actualStates = [];
            const chainProviderUrl = Object.keys(mockSub.clients.chainProviders["eth"])[0];
            mockSub.clients.chainProviders["eth"][chainProviderUrl].on("statechange", (newState) => actualStates.push(newState));

            await mockSub.start();

            await new Promise((resolve) => mockSub.once("update", resolve));

            const challengeVerificationPromise = new Promise((resolve) => mockSub.once("challengeverification", resolve));
            await publishRandomPost(mockSub.address, plebbit, { author: { address: "plebbit.eth" }, signer: signers[6] });

            await challengeVerificationPromise;

            expect(actualStates.slice(0, expectedStates.length)).to.deep.equal(expectedStates);
        });
    });

    describeIfRpc(`subplebbit.clients.plebbitRpcClients (local subplebbit ran over RPC)`, async () => {
        it(`subplebbit.clients.plebbitRpcClients[rpcUrl] is stopped by default`, async () => {
            const sub = await plebbit.createSubplebbit({});
            const rpcUrl = Object.keys(plebbit.clients.plebbitRpcClients)[0];
            expect(sub.clients.plebbitRpcClients[rpcUrl].state).to.equal("stopped");
        });

        it(`subplebbit.clients.plebbitRpcClients states are set correctly prior to publishing IPNS`, async () => {
            const sub = await plebbit.createSubplebbit({});
            const rpcUrl = Object.keys(plebbit.clients.plebbitRpcClients)[0];
            const recordedStates = [];

            sub.clients.plebbitRpcClients[rpcUrl].on("statechange", (newState) => recordedStates.push(newState));

            await sub.start();

            await new Promise((resolve) => sub.once("update", resolve));
            await new Promise((resolve) => setTimeout(resolve, plebbit.publishInterval / 2)); // until stopped state is transmitted

            expect(recordedStates).to.deep.equal(["publishing-ipns", "stopped"]);

            await sub.delete();
        });

        it(`subplebbit.clients.plebbitRpcClients states are set correctly if it receives a comment while having no challenges`, async () => {
            const sub = await createSubWithNoChallenge({}, plebbit);
            const rpcUrl = Object.keys(plebbit.clients.plebbitRpcClients)[0];
            const recordedStates = [];

            const expectedStates = [
                "publishing-ipns",
                "stopped",
                "waiting-challenge-requests",
                "publishing-challenge-verification",
                "waiting-challenge-requests",
                "publishing-ipns"
            ];
            sub.clients.plebbitRpcClients[rpcUrl].on("statechange", (newState) => recordedStates.push(newState));

            await sub.start();

            await resolveWhenConditionIsTrue({ toUpdate: sub, predicate: () => typeof sub.updatedAt === "number" });

            const post = await publishRandomPost(sub.address, plebbit, {});
            await waitTillPostInSubplebbitPages(post, plebbit);
            if (recordedStates[recordedStates.length - 1] === "stopped")
                expect(recordedStates).to.deep.equal([...expectedStates, "stopped"]);
            else expect(recordedStates).to.deep.equal(expectedStates);

            await sub.delete();
        });

        it(`subplebbit.clients.plebbitRpcClients states are set correctly if it receives a comment while mandating challenge`, async () => {
            const sub = await plebbit.createSubplebbit({}, plebbit);
            await sub.edit({ settings: { challenges: [{ name: "question", options: { question: "1+1=?", answer: "2" } }] } });

            const rpcUrl = Object.keys(plebbit.clients.plebbitRpcClients)[0];
            const recordedStates = [];

            const expectedStates = [
                "publishing-ipns",
                "stopped",
                "waiting-challenge-requests",
                "publishing-challenge",
                "waiting-challenge-answers",
                "publishing-challenge-verification",
                "waiting-challenge-requests",
                "publishing-ipns",
                "stopped"
            ];
            sub.clients.plebbitRpcClients[rpcUrl].on("statechange", (newState) => recordedStates.push(newState));

            await sub.start();

            await resolveWhenConditionIsTrue({ toUpdate: sub, predicate: () => typeof sub.updatedAt === "number" });

            const mockPost = await generateMockPost(sub.address, plebbit);

            mockPost.once("challenge", async (challengeMessage) => {
                await mockPost.publishChallengeAnswers(["2"]);
            });

            await publishWithExpectedResult(mockPost, true);
            await new Promise((resolve) => sub.once("update", resolve));
            await new Promise((resolve) => sub.once("startedstatechange", resolve)); // wait for the last stopped state to be emitted
            expect(recordedStates.slice(0, expectedStates.length)).to.deep.equal(expectedStates);

            await sub.delete();
        });
    });
});
