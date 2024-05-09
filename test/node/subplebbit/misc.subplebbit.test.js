import {
    mockPlebbit,
    publishRandomPost,
    createSubWithNoChallenge,
    mockGatewayPlebbit,
    publishRandomReply,
    publishVote,
    generateMockPost,
    publishWithExpectedResult,
    isRpcFlagOn,
    mockRemotePlebbitIpfsOnly
} from "../../../dist/node/test/test-util";
import { createMockIpfsClient } from "../../../dist/node/test/mock-ipfs-client";

import signers from "../../fixtures/signers";
import { getThumbnailUrlOfLink } from "../../../dist/node/runtime/node/util";
import path from "path";
import fs from "fs";

import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import EventEmitter from "events";
chai.use(chaiAsPromised);
const { expect, assert } = chai;

describe("plebbit.listSubplebbits", async () => {
    let plebbit, subSigner;
    before(async () => {
        plebbit = await mockPlebbit();
        subSigner = await plebbit.createSigner();
    });

    it(`listSubplebbits shows unlocked created subplebbits`, async () => {
        const title = "Test listSubplebbits" + Date.now();

        const createdSubplebbit = await plebbit.createSubplebbit({ signer: subSigner, title: title });
        // At this point the sub should be unlocked and ready to be recreated by another instance
        const listedSubs = await plebbit.listSubplebbits();
        expect(listedSubs).to.include(createdSubplebbit.address);

        expect(createdSubplebbit.address).to.equal(subSigner.address);
        expect(createdSubplebbit.title).to.equal(title);
        await createdSubplebbit.stop();
    });
});

describe(`subplebbit.delete`, async () => {
    let plebbit, sub;
    before(async () => {
        plebbit = await mockPlebbit({}, true, false);
        sub = await plebbit.createSubplebbit();
    });

    it(`Deleted sub is not listed in listSubplebbits`, async () => {
        const subs = await plebbit.listSubplebbits();
        expect(subs).to.include(sub.address);
        const subRecreated = await plebbit.createSubplebbit({ address: sub.address });
        await subRecreated.delete();
        if (plebbit.plebbitRpcClient) await new Promise((resolve) => setTimeout(resolve, 1000));
        const subsAfterDeletion = await plebbit.listSubplebbits();
        expect(subsAfterDeletion).to.not.include(sub.address);
    });

    //prettier-ignore
    if (!isRpcFlagOn())
    it(`Deleted sub ipfs keys are not listed in ipfs node`, async () => {
        const ipfsKeys = await plebbit._clientsManager.getDefaultIpfs()._client.key.list();
        const subKeyExists = ipfsKeys.some((key) => key.name === sub.ipnsKeyName);
        expect(subKeyExists).to.be.false;
    });

    //prettier-ignore
    if (!isRpcFlagOn())
    it(`Deleted sub db is moved to datapath/subplebbits/deleted`, async () => {
        const expectedPath = path.join(plebbit.dataPath, "subplebbits", "deleted", sub.address);
        expect(fs.existsSync(expectedPath)).to.be.true;
    });

    //prettier-ignore
    if (!isRpcFlagOn())
    it(`Deleted sub has no locks in subplebbits directory`, async () => {
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
        await new Promise((resolve) => sub.once("update", resolve));
        if (!sub.updatedAt) await new Promise((resolve) => sub.once("update", resolve));
    });

    after(async () => await sub.stop());

    it(`subplebbit.lastPostCid and lastCommentCid reflects latest post published`, async () => {
        expect(sub.lastPostCid).to.be.undefined;
        expect(sub.lastCommentCid).to.be.undefined;
        const post = await publishRandomPost(sub.address, plebbit, {}, true);
        if (!sub.lastPostCid) await new Promise((resolve) => sub.once("update", resolve));
        expect(sub.lastPostCid).to.equal(post.cid);
        expect(sub.lastCommentCid).to.equal(post.cid);
    });

    it(`subplebbit.lastPostCid doesn't reflect latest reply`, async () => {
        await publishRandomReply(sub.posts.pages.hot.comments[0], plebbit);
        expect(sub.lastPostCid).to.equal(sub.posts.pages.hot.comments[0].cid);
    });

    it(`subplebbit.lastCommentCid reflects latest comment (post or reply)`, async () => {
        if ((sub.posts.pages.hot.comments[0].replyCount || 0) === 0) await new Promise((resolve) => sub.once("update", resolve));
        expect(sub.lastCommentCid).to.equal(sub.posts.pages.hot.comments[0].replies.pages.topAll.comments[0].cid);
    });
});

//prettier-ignore
if (!isRpcFlagOn())
describe(`Create a sub with basic auth urls`, async () => {
    it(`Can create a sub with encoded authorization `, async () => {
        const headers = {
            authorization: "Basic " + Buffer.from("username" + ":" + "password").toString("base64")
        };
        const ipfsHttpClientsOptions = [
            {
                url: "http://localhost:15001/api/v0",
                headers
            }
        ];
        const pubsubHttpClientsOptions = [
            {
                url: "http://localhost:15002/api/v0",
                headers
            }
        ];

        const plebbitOptions = {
            ipfsHttpClientsOptions,
            pubsubHttpClientsOptions
        };

        const plebbit = await mockPlebbit(plebbitOptions);
        const sub = await createSubWithNoChallenge({}, plebbit);
        await sub.start();
        await new Promise((resolve) => sub.once("update", resolve));
        if (!sub.updatedAt) await new Promise((resolve) => sub.once("update", resolve));
        await publishRandomPost(sub.address, plebbit, {}, false);
        await sub.stop();
    });

    it(`Can publish a post with user@password for both ipfs and pubsub http client`, async () => {
        const ipfsHttpClientsOptions = [`http://user:password@localhost:15001/api/v0`];
        const pubsubHttpClientsOptions = [`http://user:password@localhost:15002/api/v0`];
        const plebbitOptions = {
            ipfsHttpClientsOptions,
            pubsubHttpClientsOptions
        };

        const plebbit = await mockPlebbit(plebbitOptions);
        const sub = await createSubWithNoChallenge({}, plebbit);
        await sub.start();
        await new Promise((resolve) => sub.once("update", resolve));
        if (!sub.updatedAt) await new Promise((resolve) => sub.once("update", resolve));
        await publishRandomPost(sub.address, plebbit, {}, false);
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
    });

    it(`subplebbit.pubsubTopic is defaulted to address when subplebbit is first created`, async () => {
        expect(subplebbit.pubsubTopic).to.equal(subplebbit.address);
    });
    it(`Publications can be published to a sub with pubsubTopic=undefined`, async () => {
        await subplebbit.edit({ pubsubTopic: undefined });
        if (subplebbit.pubsubTopic !== undefined && subplebbit.pubsubTopic !== null)
            expect.fail("subplebbit.pubsubTopic should be null or undefined");
        await subplebbit.start();
        await new Promise((resolve) => subplebbit.once("update", resolve));
        if (!subplebbit.updatedAt) await new Promise((resolve) => subplebbit.once("update", resolve));

        if (subplebbit.pubsubTopic !== undefined && subplebbit.pubsubTopic !== null)
            expect.fail("subplebbit.pubsubTopic should be null or undefined");

        const post = await publishRandomPost(subplebbit.address, plebbit, {}, false);
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
        await subplebbit.stop();
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
        try {
            await subplebbit.delete();
        } catch {}
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
        expect(plebbit.eventNames()).to.deep.equal(["error"]);
    });

    //prettier-ignore
    if (!isRpcFlagOn())
    it(`subplebbit.startedState = error if a failure occurs`, async () => {
        await new Promise((resolve) => {
            subplebbit.on("startedstatechange", (newState) => newState === "failed" && resolve());
            subplebbit.plebbit.clients.ipfsClients = subplebbit.clientsManager.clients = undefined; // Should cause a failure
        });
    });
});

describe(`subplebbit.updatingState (remote sub - node)`, async () => {
    it(`subplebbit.updatingState defaults to stopped`, async () => {
        const plebbit = await mockPlebbit();
        const subplebbit = await plebbit.getSubplebbit(signers[0].address);
        expect(subplebbit.updatingState).to.equal("stopped");
    });

    it(`subplebbit.updatingState is in correct order upon updating with IPFS client (non-ENS)`, async () => {
        const plebbit = await mockRemotePlebbitIpfsOnly();
        const subplebbit = await plebbit.getSubplebbit(signers[0].address);
        const recordedStates = [];
        const expectedStates = ["fetching-ipns", "fetching-ipfs", "succeeded", "stopped"];
        subplebbit.on("updatingstatechange", (newState) => recordedStates.push(newState));

        await subplebbit.update();

        publishRandomPost(subplebbit.address, plebbit, {}, false); // To force trigger an update
        await new Promise((resolve) => subplebbit.once("update", resolve));
        await subplebbit.stop();

        expect(recordedStates.slice(recordedStates.length - expectedStates.length)).to.deep.equal(expectedStates);
        expect(plebbit.eventNames()).to.deep.equal(["error"]); // Make sure events has been unsubscribed from
    });

    //prettier-ignore
    if (!isRpcFlagOn())
    it(`updating states is in correct order upon updating with gateway`, async () => {
        const gatewayPlebbit = await mockGatewayPlebbit();

        const subplebbit = await gatewayPlebbit.getSubplebbit(signers[0].address);

        const expectedStates = ["fetching-ipns", "succeeded", "stopped"];
        const recordedStates = [];
        subplebbit.on("updatingstatechange", (newState) => recordedStates.push(newState));

        await subplebbit.update();

        publishRandomPost(subplebbit.address, gatewayPlebbit, {}, false); // To force trigger an update
        await new Promise((resolve) => subplebbit.once("update", resolve));
        await subplebbit.stop();

        expect(recordedStates.slice(recordedStates.length - expectedStates.length)).to.deep.equal(expectedStates);
        expect(gatewayPlebbit.eventNames()).to.deep.equal(["error"]); // Make sure events has been unsubscribed from
    });

    //prettier-ignore
    if (!isRpcFlagOn())
    it(`subplebbit.updatingState emits 'succceeded' when a new update from local sub is retrieved`, async () => {
        const plebbit = await mockPlebbit();
        const localSub = await plebbit.createSubplebbit({ address: signers[0].address });
        const expectedStates = ["succeeded", "stopped"];
        const recordedStates = [];

        localSub.on("updatingstatechange", (newState) => recordedStates.push(newState));

        await localSub.update();

        publishRandomPost(localSub.address, plebbit, {}, false);

        await new Promise((resolve) => localSub.once("update", resolve));
        await localSub.stop();

        expect(recordedStates).to.deep.equal(expectedStates);
        expect(plebbit.eventNames()).to.deep.equal(["error"]); // Make sure events has been unsubscribed from
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
        await subplebbit.stop();
    });

    //prettier-ignore
    if (!isRpcFlagOn())
    describe(`Test getThumbnailUrlOfLink`, async () => {
        it(`Generates thumbnail url for youtube video correctly with thumbnailWidth and thumbnailHeight`, async () => {
            const url = "https://www.youtube.com/watch?v=TLysAkFM4cA";
            const expectedThumbnailUrl = "https://i.ytimg.com/vi/TLysAkFM4cA/maxresdefault.jpg";
            const thumbnailInfo = await getThumbnailUrlOfLink(url);
            expect(thumbnailInfo.thumbnailUrl).to.equal(expectedThumbnailUrl);
            expect(thumbnailInfo.thumbnailWidth).to.equal(1280);
            expect(thumbnailInfo.thumbnailHeight).to.equal(720);
        });

        it(`generates thumbnail url for html page with thumbnailWidth and thumbnailHeight`, async () => {
            const url =
                "https://www.correiobraziliense.com.br/politica/2023/06/5101828-moraes-determina-novo-bloqueio-das-redes-sociais-e-canais-de-monark.html";
            const expectedThumbnailUrl =
                "https://midias.correiobraziliense.com.br/_midias/jpg/2022/03/23/675x450/1_monark-7631489.jpg?20230614170105?20230614170105";
            const thumbnailInfo = await getThumbnailUrlOfLink(url, new EventEmitter());
            expect(thumbnailInfo.thumbnailUrl).to.equal(expectedThumbnailUrl);
            expect(thumbnailInfo.thumbnailWidth).to.equal(675);
            expect(thumbnailInfo.thumbnailHeight).to.equal(450);
        });

        it(`Generates thumbnail url for html page with no ogWidth and ogHeight correctly with thumbnailWidth and thumbnailHeight`, async () => {
            const url =
                "https://pleb.bz/p/reddit-screenshots.eth/c/QmUBqbdaVNNCaPUYZjqizYYL42wgr4YBfxDAcjxLJ59vid?redirect=plebones.eth.limo";
            const expectedThumbnailUrl = "https://i.imgur.com/6Ogacyq.png";
            const thumbnailInfo = await getThumbnailUrlOfLink(url, new EventEmitter());
            expect(thumbnailInfo.thumbnailUrl).to.equal(expectedThumbnailUrl);
            expect(thumbnailInfo.thumbnailWidth).to.equal(512);
            expect(thumbnailInfo.thumbnailHeight).to.equal(497);
        });

        it(`Generates thumbnail url for twitter urls correctly`, async () => {
            const url = "https://twitter.com/eustatheia/status/1691285870244937728";
            const expectedThumbnailUrl = "https://pbs.twimg.com/media/F3iniP-XcAA1TVU.jpg:large";
            const thumbnailInfo = await getThumbnailUrlOfLink(url, new EventEmitter());
            expect(thumbnailInfo.thumbnailUrl).to.equal(expectedThumbnailUrl);
            expect(thumbnailInfo.thumbnailWidth).to.equal(1125);
            expect(thumbnailInfo.thumbnailHeight).to.equal(1315);
        });
    });

    it(`comment.thumbnailUrl is populated by subplebbit in challengeVerification`, async () => {
        const link = "https://www.youtube.com/watch?v=TLysAkFM4cA";
        const post = await publishRandomPost(subplebbit.address, plebbit, { link }, false);
        expect(post.link).to.equal(link);
        expect(post.thumbnailUrl).to.equal("https://i.ytimg.com/vi/TLysAkFM4cA/maxresdefault.jpg");
        expect(post.thumbnailUrlWidth).to.equal(1280);
        expect(post.thumbnailUrlHeight).to.equal(720);
    });

    it(`comment.thumbnailUrl is undefined if comment.link is a link of a jpg`, async () => {
        const link = "https://i.ytimg.com/vi/TLysAkFM4cA/maxresdefault.jpg";
        const post = await publishRandomPost(subplebbit.address, plebbit, { link }, false);
        expect(post.link).to.equal(link);
        expect(post.thumbnailUrl).to.be.undefined;
        expect(post.thumbnailUrlWidth).to.be.undefined;
        expect(post.thumbnailUrlHeight).to.be.undefined;
    });

    it(`comment.thumbnailUrl is undefined if comment.link is a link of a gif`, async () => {
        const link = "https://files.catbox.moe/nlsfav.gif";
        const post = await publishRandomPost(subplebbit.address, plebbit, { link }, false);
        expect(post.link).to.equal(link);
        expect(post.thumbnailUrl).to.be.undefined;
        expect(post.thumbnailUrlWidth).to.be.undefined;
        expect(post.thumbnailUrlHeight).to.be.undefined;
    });

    it(`comment.linkWidth and linkHeight is defined if the author defines them`, async () => {
        const link = "https://i.ytimg.com/vi/TLysAkFM4cA/maxresdefault.jpg";
        const linkWidth = 200;
        const linkHeight = 200;
        const post = await publishRandomPost(subplebbit.address, plebbit, { link, linkWidth, linkHeight }, true);
        expect(post.link).to.equal(link);
        expect(post.linkHeight).to.equal(linkHeight);
        expect(post.linkWidth).to.equal(linkWidth);
        expect(post.thumbnailUrlWidth).to.be.undefined;
        expect(post.thumbnailUrlHeight).to.be.undefined;

        const postInSubPages = subplebbit.posts.pages.hot.comments.find((comment) => comment.cid === post.cid);
        expect(postInSubPages.link).to.equal(link);
        expect(postInSubPages.linkHeight).to.equal(linkHeight);
        expect(postInSubPages.linkWidth).to.equal(linkWidth);
        expect(postInSubPages.thumbnailUrlWidth).to.be.undefined;
        expect(postInSubPages.thumbnailUrlHeight).to.be.undefined;
    });
});

//prettier-ignore
if (!isRpcFlagOn())
describe(`Migration to a new IPFS repo`, async () => {
    let subAddress;
    let plebbitDifferentIpfs;
    before(async () => {
        const plebbit = await mockPlebbit();
        const sub = await createSubWithNoChallenge({}, plebbit);
        await sub.start();
        await new Promise((resolve) => sub.once("update", resolve));
        const post = await publishRandomPost(sub.address, plebbit, {}, true);
        await publishRandomReply(post, plebbit, {}, true);

        await sub.stop();

        plebbitDifferentIpfs = await mockPlebbit({ipfsHttpClientsOptions: ["http://localhost:15004/api/v0"]}); // Different IPFS repo

        const subDifferentIpfs = await createSubWithNoChallenge({ address: sub.address }, plebbitDifferentIpfs);
        await subDifferentIpfs.start();
        await new Promise((resolve) => subDifferentIpfs.once("update", resolve));
        subAddress = subDifferentIpfs.address;
    });
    it(`Subplebbit IPNS is republished`, async () => {
        const subLoaded = await plebbitDifferentIpfs.getSubplebbit(subAddress);
        expect(subLoaded).to.be.a("object");
        expect(subLoaded.posts).to.be.a("object");
        // If we can load the subplebbit IPNS that means it has been republished by the new IPFS repo
    });

    it(`Posts' IPFS are repinned`, async () => {
        const subLoaded = await plebbitDifferentIpfs.getSubplebbit(subAddress);
        const postFromPage = subLoaded.posts.pages.hot.comments[0];
        const postIpfs = JSON.parse(await plebbitDifferentIpfs.fetchCid(postFromPage.cid));
        expect(postIpfs.subplebbitAddress).to.equal(subAddress); // Make sure it was loaded correctly
    });

    it(`Comments' IPFS are repinned`, async () => {
        const subLoaded = await plebbitDifferentIpfs.getSubplebbit(subAddress);
        const postFromPage = subLoaded.posts.pages.hot.comments[0];
        const commentIpfs = JSON.parse(await plebbitDifferentIpfs.fetchCid(postFromPage.replies.pages.topAll.comments[0].cid));
        expect(commentIpfs.subplebbitAddress).to.equal(subAddress); // Make sure it was loaded correctly
    });
    it(`Comments' CommentUpdate are republished`, async () => {
        const subLoaded = await plebbitDifferentIpfs.getSubplebbit(subAddress);
        const postFromPage = subLoaded.posts.pages.hot.comments[0];
        const remotePlebbit = await mockRemotePlebbitIpfsOnly();

        const postWithRemotePlebbit = await remotePlebbit.createComment({cid: postFromPage.cid});
        postWithRemotePlebbit.update();
        await new Promise(resolve => postWithRemotePlebbit.once("update", resolve)); // CommentIpfs update
        expect(postWithRemotePlebbit.replyCount).to.be.undefined;
        await new Promise(resolve => postWithRemotePlebbit.once("update", resolve)); // CommentUpdate update
        expect(postWithRemotePlebbit.replyCount).to.be.a("number");
        expect(postWithRemotePlebbit.upvoteCount).to.be.a("number");
        await postWithRemotePlebbit.stop();
    });

});

describe(`subplebbit.clients (Local)`, async () => {
    let plebbit;
    before(async () => {
        plebbit = await mockPlebbit();
    });

    //prettier-ignore
    if (!isRpcFlagOn())
    describe(`subplebbit.clients.ipfsClients`, async () => {
        it(`subplebbit.clients.ipfsClients[url] is stopped by default`, async () => {
            const mockSub = await createSubWithNoChallenge({}, plebbit);
            expect(Object.keys(mockSub.clients.ipfsClients).length).to.equal(1);
            expect(Object.values(mockSub.clients.ipfsClients)[0].state).to.equal("stopped");
        });

        it(`subplebbit.clients.ipfsClients.state is publishing-ipns before publishing a new IPNS`, async () => {
            const sub = await createSubWithNoChallenge({}, plebbit);

            let publishStateTime;
            let updateTime;

            const ipfsUrl = Object.keys(sub.clients.ipfsClients)[0];

            sub.clients.ipfsClients[ipfsUrl].on(
                "statechange",
                (newState) => newState === "publishing-ipns" && (publishStateTime = Date.now())
            );

            sub.once("update", () => (updateTime = Date.now()));

            await sub.start();
            await new Promise((resolve) => sub.once("update", resolve));
            await sub.stop();

            expect(publishStateTime).to.be.a("number");
            expect(updateTime).to.be.a("number");
            expect(publishStateTime).to.be.lessThan(updateTime);
        });
    });

    //prettier-ignore
    if (!isRpcFlagOn())
    describe(`subplebbit.clients.pubsubClients`, async () => {
        it(`subplebbit.clients.pubsubClients[url].state is stopped by default`, async () => {
            const mockSub = await createSubWithNoChallenge({}, plebbit);
            expect(Object.keys(mockSub.clients.pubsubClients).length).to.equal(3);
            expect(Object.values(mockSub.clients.pubsubClients)[0].state).to.equal("stopped");
        });

        it(`correct order of pubsubClients state when receiving a comment while skipping challenge`, async () => {
            const mockSub = await createSubWithNoChallenge({}, plebbit);

            const expectedStates = ["waiting-challenge-requests", "publishing-challenge-verification", "waiting-challenge-requests"];

            const actualStates = [];

            const pubsubUrl = Object.keys(mockSub.clients.pubsubClients)[0];

            mockSub.clients.pubsubClients[pubsubUrl].on("statechange", (newState) => actualStates.push(newState));

            await mockSub.start();

            await new Promise((resolve) => mockSub.once("update", resolve));

            publishRandomPost(mockSub.address, plebbit, {}, false);

            await new Promise((resolve) => mockSub.once("challengeverification", resolve));

            expect(actualStates).to.deep.equal(expectedStates);
        });

        it(`Correct order of pubsubClients when receiving a comment while mandating challenge`, async () => {
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

            const pubsubUrl = Object.keys(mockSub.clients.pubsubClients)[0];

            mockSub.clients.pubsubClients[pubsubUrl].on("statechange", (newState) => actualStates.push(newState));

            await mockSub.start();

            await new Promise((resolve) => mockSub.once("update", resolve));
            if (!mockSub.updatedAt) await new Promise(resolve => mockSub.once("update", resolve));

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

    //prettier-ignore
    if (!isRpcFlagOn())
    describe(`subplebbit.clients.chainProviders`, async () => {
        let mockSub;
        before(async () => {
            mockSub  = await createSubWithNoChallenge({}, plebbit);;
        })

        after(async () => {
            await mockSub.delete();
        })
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

    //prettier-ignore
    if (isRpcFlagOn())
    describe(`subplebbit.clients.plebbitRpcClients (local subplebbit ran over RPC)`, async () => {

        it(`subplebbit.clients.plebbitRpcClients[rpcUrl] is stopped by default`, async () => {
            const sub = await plebbit.createSubplebbit({});
            const rpcUrl = Object.keys(plebbit.clients.plebbitRpcClients)[0];
            expect(sub.clients.plebbitRpcClients[rpcUrl].state).to.equal("stopped");
        })

        it(`subplebbit.clients.plebbitRpcClients states are set correctly prior to publishing IPNS`, async () => {
            const sub = await plebbit.createSubplebbit({});
            const rpcUrl = Object.keys(plebbit.clients.plebbitRpcClients)[0];
            const recordedStates = [];

            sub.clients.plebbitRpcClients[rpcUrl].on("statechange", (newState) => 
                recordedStates.push(newState)
            );


            await sub.start();

            await new Promise(resolve => sub.once("update", resolve));

            expect(recordedStates).to.deep.equal(["publishing-ipns"]);

            await sub.delete();

        })

        it(`subplebbit.clients.plebbitRpcClients states are set correctly if it receives a comment while having no challenges`, async () =>{
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
            sub.clients.plebbitRpcClients[rpcUrl].on("statechange", (newState) => 
                recordedStates.push(newState)
            );


            await sub.start();

            await new Promise(resolve => sub.once("update", resolve));
            if (!sub.updatedAt) await new Promise(resolve => sub.once("update", resolve));

            await publishRandomPost(sub.address, plebbit, {}, true);
            if (recordedStates[recordedStates.length - 1] === "stopped")
                expect(recordedStates).to.deep.equal([...expectedStates, "stopped"]);
            else
                expect(recordedStates).to.deep.equal(expectedStates);

            await sub.delete();


        })

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
              ]
            sub.clients.plebbitRpcClients[rpcUrl].on("statechange", (newState) => 
                recordedStates.push(newState)
            );


            await sub.start();

            await new Promise(resolve => sub.once("update", resolve));
            if (!sub.updatedAt) await new Promise(resolve => sub.once("update", resolve));

            const mockPost = await generateMockPost(sub.address, plebbit);

            mockPost.once("challenge", (challengeMessage) => {
                mockPost.publishChallengeAnswers(["2"]);
            });



            await publishWithExpectedResult(mockPost, true);
            await new Promise(resolve => sub.once("update", resolve));
            expect(recordedStates).to.deep.equal(expectedStates);

            await sub.delete();
        })

    });
});

describe(`subplebbit.statsCid`, async () => {
    let subplebbit, plebbit;

    before(async () => {
        plebbit = await mockPlebbit();
        subplebbit = await createSubWithNoChallenge({}, plebbit);
        await subplebbit.start();
        await new Promise((resolve) => subplebbit.once("update", resolve));
        if (!subplebbit.updatedAt) await new Promise((resolve) => subplebbit.once("update", resolve));
    });

    after(async () => {
        await subplebbit.stop();
    });

    it(`stats of subplebbit is all zeros by default`, async () => {
        const stats = JSON.parse(await plebbit.fetchCid(subplebbit.statsCid));
        //prettier-ignore
        const expectedKeys = ["allActiveUserCount","allPostCount","dayActiveUserCount","dayPostCount","hourActiveUserCount","hourPostCount","monthActiveUserCount","monthPostCount","weekActiveUserCount","weekPostCount","yearActiveUserCount","yearPostCount"];
        expect(Object.keys(stats)).to.deep.equal(expectedKeys);
        expect(Object.values(stats)).to.deep.equal(Array(expectedKeys.length).fill(0)); // All values should be 0
    });

    describe(`subplebbit.stats.ActiveUserCount`, async () => {
        const userCountKeys = [
            "allActiveUserCount",
            "yearActiveUserCount",
            "monthActiveUserCount",
            "weekActiveUserCount",
            "dayActiveUserCount",
            "hourActiveUserCount"
        ];
        it(`ActiveUserCount should increase by 1 for new post author`, async () => {
            const statsBefore = JSON.parse(await plebbit.fetchCid(subplebbit.statsCid));
            await publishRandomPost(subplebbit.address, plebbit, { signer: signers[5] }, false);
            await new Promise((resolve) => subplebbit.once("update", resolve));
            const statsAfterNewPost = JSON.parse(await plebbit.fetchCid(subplebbit.statsCid));

            for (const userCountKey of userCountKeys) expect(statsAfterNewPost[userCountKey]).to.equal(statsBefore[userCountKey] + 1);
        });

        it(`ActiveUserCount does not increase when an existing user is publishing a new post`, async () => {
            const statsBefore = JSON.parse(await plebbit.fetchCid(subplebbit.statsCid));
            await publishRandomPost(subplebbit.address, plebbit, { signer: signers[5] }, false);
            await new Promise((resolve) => subplebbit.once("update", resolve));
            const statsAfterNewPost = JSON.parse(await plebbit.fetchCid(subplebbit.statsCid));

            for (const userCountKey of userCountKeys) expect(statsAfterNewPost[userCountKey]).to.equal(statsBefore[userCountKey]);
        });

        it(`ActiveUserCount should increase by 1 for new comment author`, async () => {
            const statsBefore = JSON.parse(await plebbit.fetchCid(subplebbit.statsCid));
            const post = subplebbit.posts.pages.hot.comments[0];
            await publishRandomReply(post, plebbit, { signer: signers[4] }, false);
            await new Promise((resolve) => subplebbit.once("update", resolve));
            const statsAfterNewReply = JSON.parse(await plebbit.fetchCid(subplebbit.statsCid));

            for (const userCountKey of userCountKeys) expect(statsAfterNewReply[userCountKey]).to.equal(statsBefore[userCountKey] + 1);
        });

        it(`ActiveUserCount does not increase when an existing user is publishing a new reply`, async () => {
            const statsBefore = JSON.parse(await plebbit.fetchCid(subplebbit.statsCid));
            const post = subplebbit.posts.pages.hot.comments[0];
            await publishRandomReply(post, plebbit, { signer: signers[4] }, false);
            await new Promise((resolve) => subplebbit.once("update", resolve));
            const statsAfterNewPost = JSON.parse(await plebbit.fetchCid(subplebbit.statsCid));

            for (const userCountKey of userCountKeys) expect(statsAfterNewPost[userCountKey]).to.equal(statsBefore[userCountKey]);
        });

        it(`ActiveUserCount should increase by 1 for new vote author`, async () => {
            const statsBefore = JSON.parse(await plebbit.fetchCid(subplebbit.statsCid));
            const post = subplebbit.posts.pages.hot.comments[0];
            await publishVote(post.cid, post.subplebbitAddress, 1, plebbit, { signer: signers[3] }, false);
            await new Promise((resolve) => subplebbit.once("update", resolve));
            const statsAfterNewVote = JSON.parse(await plebbit.fetchCid(subplebbit.statsCid));

            for (const userCountKey of userCountKeys) expect(statsAfterNewVote[userCountKey]).to.equal(statsBefore[userCountKey] + 1);
        });

        it(`ActiveUserCount does not increase when an existing user is publishing a new vote`, async () => {
            const statsBefore = JSON.parse(await plebbit.fetchCid(subplebbit.statsCid));
            const post = subplebbit.posts.pages.hot.comments[0];
            await publishVote(post.cid, post.subplebbitAddress, 1, plebbit, { signer: signers[5] }, false);
            await new Promise((resolve) => subplebbit.once("update", resolve));
            const statsAfterNewVote = JSON.parse(await plebbit.fetchCid(subplebbit.statsCid));

            for (const userCountKey of userCountKeys) expect(statsAfterNewVote[userCountKey]).to.equal(statsBefore[userCountKey]);
        });
    });

    describe(`subplebbit.stats.postCount`, async () => {
        const postCountKeys = ["allPostCount", "yearPostCount", "monthPostCount", "weekPostCount", "dayPostCount", "hourPostCount"];
        it(`PostCount should increase by 1 for new post`, async () => {
            const statsBefore = JSON.parse(await plebbit.fetchCid(subplebbit.statsCid));
            await publishRandomPost(subplebbit.address, plebbit, { signer: signers[5] }, false);
            await new Promise((resolve) => subplebbit.once("update", resolve));
            const statsAfterNewPost = JSON.parse(await plebbit.fetchCid(subplebbit.statsCid));

            for (const postCountKey of postCountKeys) expect(statsAfterNewPost[postCountKey]).to.equal(statsBefore[postCountKey] + 1);
        });

        it(`PostCount should increase by 1 for new post with existing user`, async () => {
            const statsBefore = JSON.parse(await plebbit.fetchCid(subplebbit.statsCid));
            await publishRandomPost(subplebbit.address, plebbit, { signer: signers[5] }, false);
            await new Promise((resolve) => subplebbit.once("update", resolve));
            const statsAfterNewPost = JSON.parse(await plebbit.fetchCid(subplebbit.statsCid));

            for (const postCountKey of postCountKeys) expect(statsAfterNewPost[postCountKey]).to.equal(statsBefore[postCountKey] + 1);
        });

        it(`PostCount does not increase by 1 for new reply`, async () => {
            const statsBefore = JSON.parse(await plebbit.fetchCid(subplebbit.statsCid));
            const post = subplebbit.posts.pages.hot.comments[0];
            await publishRandomReply(post, plebbit, {}, false);
            await new Promise((resolve) => subplebbit.once("update", resolve));
            const statsAfterNewPost = JSON.parse(await plebbit.fetchCid(subplebbit.statsCid));

            for (const postCountKey of postCountKeys) expect(statsAfterNewPost[postCountKey]).to.equal(statsBefore[postCountKey]);
        });
    });
});

describe.skip(`Challenge exchange resiliency`, async () => {
    // In production we have a lot of flakiness when it comes to publishing over pubsub
    // These tests will produce scenarios where the drop rate of pubsub msgs is very high
    // The goal is to make sure publications are received and the challenge exchange is stable
    // We're assuming the dropping happens only in CHALLENGEREQUEST

    const dropRate = 0.05;
    const numberOfPostsToPublish = 300;
    let subplebbit, plebbit;
    before(async () => {
        plebbit = await mockPlebbit();
        for (const pubsubProviderUrl of Object.keys(plebbit.clients.pubsubClients)) {
            plebbit.clients.pubsubClients[pubsubProviderUrl]._client = createMockIpfsClient(dropRate);
        }

        const subplebbitPlebbit = await mockPlebbit();
        subplebbit = await createSubWithNoChallenge({}, subplebbitPlebbit);
        await subplebbit.start();
        await new Promise((resolve) => subplebbit.once("update", resolve));
    });

    after(async () => {
        await subplebbit.stop();
    });

    it(`${numberOfPostsToPublish} posts are published without any issues (no challenge)`, async () => {
        // TODO should use a sub with challenge
        await Promise.all(
            new Array(numberOfPostsToPublish).fill(null).map((x) => publishRandomPost(subplebbit.address, plebbit, {}, false))
        );
    });
});
