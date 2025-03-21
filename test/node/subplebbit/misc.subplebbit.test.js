import {
    mockPlebbit,
    publishRandomPost,
    createSubWithNoChallenge,
    mockGatewayPlebbit,
    publishRandomReply,
    generateMockPost,
    itSkipIfRpc,
    itIfRpc,
    publishWithExpectedResult,
    mockPlebbitNoDataPathWithOnlyKuboClient,
    resolveWhenConditionIsTrue,
    describeSkipIfRpc,
    describeIfRpc,
    waitTillPostInSubplebbitPages
} from "../../../dist/node/test/test-util";
import { createMockPubsubClient } from "../../../dist/node/test/mock-ipfs-client";

import signers from "../../fixtures/signers";
import path from "path";
import fs from "fs";

import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import EventEmitter from "events";
chai.use(chaiAsPromised);
const { expect, assert } = chai;

describe("plebbit.subplebbits", async () => {
    let plebbit, subSigner;
    before(async () => {
        plebbit = await mockPlebbit();
        subSigner = await plebbit.createSigner();
    });

    it(`plebbit.subplebbits shows unlocked created subplebbits`, async () => {
        const title = "Test plebbit.subplebbits" + Date.now();

        const createdSubplebbit = await plebbit.createSubplebbit({ signer: subSigner, title: title });
        // At this point the sub should be unlocked and ready to be recreated by another instance
        const listedSubs = plebbit.subplebbits;
        expect(listedSubs).to.include(createdSubplebbit.address);

        expect(createdSubplebbit.address).to.equal(subSigner.address);
        expect(createdSubplebbit.title).to.equal(title);
    });
});

describe(`subplebbit.delete`, async () => {
    let plebbit, sub;
    before(async () => {
        plebbit = await mockPlebbit({}, true, false);
        sub = await plebbit.createSubplebbit();
    });

    it(`Deleted sub is not listed in plebbit.subplebbits`, async () => {
        const subs = plebbit.subplebbits;
        expect(subs).to.include(sub.address);
        const subRecreated = await plebbit.createSubplebbit({ address: sub.address });
        await subRecreated.delete();
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const subsAfterDeletion = plebbit.subplebbits;
        expect(subsAfterDeletion).to.not.include(sub.address);
    });

    itSkipIfRpc(`Deleted sub ipfs keys are not listed in ipfs node`, async () => {
        const ipfsKeys = await plebbit._clientsManager.getDefaultIpfs()._client.key.list();
        const subKeyExists = ipfsKeys.some((key) => key.name === sub.ipnsKeyName);
        expect(subKeyExists).to.be.false;
    });

    itSkipIfRpc(`Deleted sub db is moved to datapath/subplebbits/deleted`, async () => {
        const expectedPath = path.join(plebbit.dataPath, "subplebbits", "deleted", sub.address);
        expect(fs.existsSync(expectedPath)).to.be.true;
    });

    itSkipIfRpc(`Deleted sub has no locks in subplebbits directory`, async () => {
        const subFiles = await fs.promises.readdir(path.join(plebbit.dataPath, "subplebbits"));
        const startLockFilename = `${sub.address}.start.lock`;
        const stateLockFilename = `${sub.address}.state.lock`;
        expect(subFiles).to.not.include(startLockFilename);
        expect(subFiles).to.not.include(stateLockFilename);
    });
});

describe(`subplebbit.{lastPostCid, lastCommentCid}`, async () => {
    let plebbit, sub;
    before(async () => {
        plebbit = await mockPlebbit();
        sub = await createSubWithNoChallenge({}, plebbit);
        await sub.start();
        await resolveWhenConditionIsTrue(sub, () => typeof sub.updatedAt === "number");
    });

    after(async () => await plebbit.destroy());

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
        await resolveWhenConditionIsTrue(sub, () => sub.posts.pages.hot?.comments[0]?.replyCount > 0);
        expect(sub.lastCommentCid).to.equal(sub.posts.pages.hot.comments[0].replies.pages.topAll.comments[0].cid);
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
        await resolveWhenConditionIsTrue(sub, () => typeof sub.updatedAt === "number");
        await publishRandomPost(sub.address, plebbit);
        await sub.stop();
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
        await resolveWhenConditionIsTrue(sub, () => typeof sub.updatedAt === "number");
        await publishRandomPost(sub.address, plebbit, {});
        await sub.stop();
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
        await resolveWhenConditionIsTrue(subplebbit, () => typeof subplebbit.updatedAt === "number");
        expect(subplebbit.pubsubTopic).to.be.undefined;

        const post = await publishRandomPost(subplebbit.address, plebbit, {});
        expect(post.subplebbit?.pubsubTopic).to.be.undefined;
    });
});

describe(`subplebbit.state`, async () => {
    let plebbit, subplebbit;
    before(async () => {
        plebbit = await mockPlebbit();
        subplebbit = await createSubWithNoChallenge({}, plebbit);
    });

    after(async () => {
        await subplebbit.delete();
        await plebbit.destroy();
    });

    it(`subplebbit.state defaults to "stopped" if not updating or started`, async () => {
        expect(subplebbit.state).to.equal("stopped");
    });

    it(`subplebbit.state = started if calling start()`, async () => {
        let eventFired = false;
        subplebbit.on("statechange", (newState) => {
            if (newState === "started") eventFired = true;
        });
        await subplebbit.start();
        expect(subplebbit.state).to.equal("started");
        expect(eventFired).to.be.true;
    });

    it(`subplebbit.state = stopped after calling stop()`, async () => {
        let eventFired = false;
        subplebbit.once("statechange", (newState) => {
            expect(newState).to.equal("stopped");
            eventFired = true;
        });
        await subplebbit.stop();
        expect(subplebbit.state).to.equal("stopped");
        expect(eventFired).to.be.true;
    });

    it(`subplebbit.state = updating after calling update()`, async () => {
        let eventFired = false;
        subplebbit.once("statechange", (newState) => {
            expect(newState).to.equal("updating");
            eventFired = true;
        });
        await subplebbit.update();
        expect(subplebbit.state).to.equal("updating");
        expect(eventFired).to.be.true;
    });

    it(`subplebbit.state = started after calling start() after update()`, async () => {
        let eventFired = false;
        subplebbit.on("statechange", (newState) => {
            if (newState === "started") eventFired = true;
        });
        await subplebbit.start();
        expect(subplebbit.state).to.equal("started");
        expect(eventFired).to.be.true;
    });
});

describe(`subplebbit.startedState`, async () => {
    let plebbit, subplebbit;
    before(async () => {
        plebbit = await mockPlebbit();
        subplebbit = await createSubWithNoChallenge({}, plebbit);
    });

    after(async () => {
        await subplebbit.delete();
        await plebbit.destroy();
    });

    it(`subplebbit.startedState defaults to stopped`, async () => {
        expect(subplebbit.startedState).to.equal("stopped");
    });

    it(`subplebbit.startedState is in correct order up to publishing a new IPNS`, async () => {
        const expectedStates = ["publishing-ipns", "succeeded"];
        const recordedStates = [];
        subplebbit.on("startedstatechange", (newState) => recordedStates.push(newState));

        await subplebbit.start();
        await new Promise((resolve) => subplebbit.once("update", resolve));
        if (!subplebbit.updatedAt) await new Promise((resolve) => subplebbit.once("update", resolve));
        expect(recordedStates).to.deep.equal(expectedStates);
    });

    itSkipIfRpc(`subplebbit.startedState = failed if a failure occurs`, async () => {
        subplebbit._getDbInternalState = async () => {
            throw Error("Failed to load sub from db ");
        };
        publishRandomPost(subplebbit.address, plebbit);
        await resolveWhenConditionIsTrue(subplebbit, () => subplebbit.startedState === "failed", "startedstatechange");
        expect(subplebbit.startedState).to.equal("failed");
    });
});

describe(`subplebbit.updatingState (node)`, async () => {
    it(`subplebbit.updatingState defaults to stopped`, async () => {
        const plebbit = await mockPlebbit();
        const subplebbit = await plebbit.getSubplebbit(signers[0].address);
        expect(subplebbit.updatingState).to.equal("stopped");
    });

    it(`subplebbit.updatingState is in correct order upon updating with IPFS client (non-ENS)`, async () => {
        const plebbit = await mockPlebbitNoDataPathWithOnlyKuboClient();
        const subplebbit = await plebbit.getSubplebbit(signers[0].address);
        const recordedStates = [];
        const expectedStates = ["fetching-ipns", "fetching-ipfs", "succeeded", "stopped"];
        subplebbit.on("updatingstatechange", (newState) => recordedStates.push(newState));

        await subplebbit.update();

        const updatePromise = new Promise((resolve) => subplebbit.once("update", resolve));

        await publishRandomPost(subplebbit.address, plebbit); // To force trigger an update

        await updatePromise;
        await subplebbit.stop();

        expect(recordedStates.slice(recordedStates.length - expectedStates.length)).to.deep.equal(expectedStates);
    });

    itSkipIfRpc(`updating states is in correct order upon updating with gateway`, async () => {
        const gatewayPlebbit = await mockGatewayPlebbit();

        const subplebbit = await gatewayPlebbit.getSubplebbit(signers[0].address);

        const expectedStates = ["fetching-ipns", "succeeded", "stopped"];
        const recordedStates = [];
        subplebbit.on("updatingstatechange", (newState) => recordedStates.push(newState));

        await subplebbit.update();

        publishRandomPost(subplebbit.address, gatewayPlebbit, {}); // To force trigger an update
        await new Promise((resolve) => subplebbit.once("update", resolve));
        await subplebbit.stop();

        expect(recordedStates.slice(recordedStates.length - expectedStates.length)).to.deep.equal(expectedStates);
    });

    itSkipIfRpc(`subplebbit.updatingState emits 'succceeded' when a new update from local sub is retrieved`, async () => {
        const plebbit = await mockPlebbit();
        const localSub = await plebbit.createSubplebbit({ address: signers[0].address });
        const expectedStates = ["succeeded", "stopped"];
        const recordedStates = [];

        localSub.on("updatingstatechange", (newState) => recordedStates.push(newState));

        await localSub.update();

        publishRandomPost(localSub.address, plebbit, {});

        await new Promise((resolve) => localSub.once("update", resolve));
        await localSub.stop();

        expect(recordedStates).to.deep.equal(expectedStates);
    });

    itIfRpc(`localSubplebbit.updatingState is copied from startedState if we're updating a local sub via rpc`, async () => {
        const plebbit = await mockPlebbit();
        const localSub = await createSubWithNoChallenge({}, plebbit);

        const recreateLocalSub = await plebbit.createSubplebbit({ address: localSub.address });

        const startedInstanceStartedStates = [];
        localSub.on("startedstatechange", () => startedInstanceStartedStates.push(localSub.startedState));

        const recreateLocalSubUpdatingStates = [];
        recreateLocalSub.on("updatingstatechange", () => recreateLocalSubUpdatingStates.push(recreateLocalSub.updatingState));

        await localSub.start();

        await new Promise((resolve) => localSub.once("update", resolve));

        await recreateLocalSub.update();

        publishRandomPost(localSub.address, plebbit, {}); // to trigger an update

        setTimeout(() => publishRandomPost(localSub.address, plebbit, {}, false), 1000);
        await resolveWhenConditionIsTrue(recreateLocalSub, () => recreateLocalSubUpdatingStates.length >= 2);
        await localSub.delete();
        await recreateLocalSub.stop();

        expect(recreateLocalSubUpdatingStates).to.deep.equal(
            startedInstanceStartedStates.splice(startedInstanceStartedStates.length - recreateLocalSubUpdatingStates.length)
        );
    });
});

describe(`comment.link`, async () => {
    let plebbit, subplebbit;

    before(async () => {
        plebbit = await mockPlebbit();
        subplebbit = await createSubWithNoChallenge({}, plebbit);
        await subplebbit.edit({ settings: { ...subplebbit.settings, fetchThumbnailUrls: true } });
        expect(subplebbit.settings.fetchThumbnailUrls).to.be.true;

        await subplebbit.start();
        await new Promise((resolve) => subplebbit.once("update", resolve));
        if (!subplebbit.updatedAt) await new Promise((resolve) => subplebbit.once("update", resolve));
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

        it(`Generates thumbnail url for twitter urls correctly`, async () => {
            const url = "https://twitter.com/eustatheia/status/1691285870244937728";
            const post = await publishRandomPost(subplebbit.address, plebbit, { link: url });
            const expectedThumbnailUrl = "https://pbs.twimg.com/media/F3iniP-XcAA1TVU.jpg:large";
            expect(post.thumbnailUrl).to.equal(expectedThumbnailUrl);
            expect(post.thumbnailUrlWidth).to.equal(1125);
            expect(post.thumbnailUrlHeight).to.equal(1315);
        });

        it(`comment.thumbnailUrl is undefined if comment.link is a link of a jpg`, async () => {
            const link = "https://i.ytimg.com/vi/TLysAkFM4cA/maxresdefault.jpg";
            const post = await publishRandomPost(subplebbit.address, plebbit, { link });
            expect(post.link).to.equal(link);
            expect(post.thumbnailUrl).to.be.undefined;
            expect(post.thumbnailUrlWidth).to.be.undefined;
            expect(post.thumbnailUrlHeight).to.be.undefined;
        });

        it(`comment.thumbnailUrl is undefined if comment.link is a link of a gif`, async () => {
            const link = "https://files.catbox.moe/nlsfav.gif";
            const post = await publishRandomPost(subplebbit.address, plebbit, { link });
            expect(post.link).to.equal(link);
            expect(post.thumbnailUrl).to.be.undefined;
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
        expect(post.thumbnailUrlWidth).to.be.undefined;
        expect(post.thumbnailUrlHeight).to.be.undefined;

        await waitTillPostInSubplebbitPages(post, plebbit);

        const postInSubPages = subplebbit.posts.pages.hot.comments.find((comment) => comment.cid === post.cid);
        expect(postInSubPages.link).to.equal(link);
        expect(postInSubPages.linkHeight).to.equal(linkHeight);
        expect(postInSubPages.linkWidth).to.equal(linkWidth);
        expect(postInSubPages.thumbnailUrlWidth).to.be.undefined;
        expect(postInSubPages.thumbnailUrlHeight).to.be.undefined;
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

            await new Promise((resolve) => mockSub.once("update", resolve));

            publishRandomPost(mockSub.address, plebbit, {});

            await new Promise((resolve) => mockSub.once("challengeverification", resolve));

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

            await new Promise((resolve) => mockSub.once("update", resolve));
            if (!mockSub.updatedAt) await new Promise((resolve) => mockSub.once("update", resolve));

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
            expect(Object.keys(mockSub.clients.chainProviders).length).to.equal(1);
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

            publishRandomPost(mockSub.address, plebbit, { author: { address: "plebbit.eth" }, signer: signers[6] });

            await new Promise((resolve) => mockSub.once("challengeverification", resolve));

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

            await resolveWhenConditionIsTrue(sub, () => typeof sub.updatedAt === "number");

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

            await resolveWhenConditionIsTrue(sub, () => typeof sub.updatedAt === "number");

            const mockPost = await generateMockPost(sub.address, plebbit);

            mockPost.once("challenge", (challengeMessage) => {
                mockPost.publishChallengeAnswers(["2"]);
            });

            await publishWithExpectedResult(mockPost, true);
            await new Promise((resolve) => sub.once("update", resolve));
            expect(recordedStates).to.deep.equal(expectedStates);

            await sub.delete();
        });
    });
});
