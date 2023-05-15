const Plebbit = require("../../../dist/node");
const {
    mockPlebbit,
    publishRandomPost,
    createMockSub,
    mockGatewayPlebbit,
    publishRandomReply
} = require("../../../dist/node/test/test-util");
const signers = require("../../fixtures/signers");
const { getThumbnailUrlOfLink } = require("../../../dist/node/runtime/node/util");
const path = require("path");
const fs = require("fs");
const { default: waitUntil } = require("async-wait-until");

const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const { expect, assert } = chai;

if (globalThis["navigator"]?.userAgent?.includes("Electron")) Plebbit.setNativeFunctions(window.plebbitJsNativeFunctions);

describe("plebbit.listSubplebbits", async () => {
    let plebbit, subSigner;
    before(async () => {
        plebbit = await mockPlebbit({ dataPath: globalThis["window"]?.plebbitDataPath });
        subSigner = await plebbit.createSigner();
    });

    it(`listSubplebbits shows unlocked created subplebbits`, async () => {
        const title = "Test listSubplebbits" + Date.now();

        plebbit.createSubplebbit({ signer: subSigner, title: title });

        await waitUntil(async () => (await plebbit.listSubplebbits()).includes(subSigner.address), {
            timeout: 200000
        });

        // At this point the sub should be unlocked and ready to be recreated by another instance
        const createdSubplebbit = await plebbit.createSubplebbit({ address: subSigner.address });

        expect(createdSubplebbit.address).to.equal(subSigner.address);
        expect(createdSubplebbit.title).to.equal(title);
        await createdSubplebbit.stop();
    });
});

describe(`subplebbit.delete`, async () => {
    let plebbit, sub;
    before(async () => {
        plebbit = await mockPlebbit({ dataPath: globalThis["window"]?.plebbitDataPath });
        sub = await plebbit.createSubplebbit();
    });

    it(`Deleted sub is not listed in listSubplebbits`, async () => {
        const subs = await plebbit.listSubplebbits();
        expect(subs).to.include(sub.address);
        const subRecreated = await plebbit.createSubplebbit({ address: sub.address });
        await subRecreated.delete();
        const subsAfterDeletion = await plebbit.listSubplebbits();
        expect(subsAfterDeletion).to.not.include(sub.address);
    });

    it(`Deleted sub ipfs keys are not listed in ipfs node`, async () => {
        const ipfsKeys = await plebbit._clientsManager.getCurrentIpfs()._client.key.list();
        const subKeyExists = ipfsKeys.some((key) => key.name === sub.ipnsKeyName);
        expect(subKeyExists).to.be.false;
    });

    it(`Deleted sub db is moved to datapath/subplebbits/deleted`, async () => {
        const expectedPath = path.join(plebbit.dataPath, "subplebbits", "deleted", sub.address);
        expect(fs.existsSync(expectedPath)).to.be.true;
    });
});

describe(`subplebbit.lastPostCid`, async () => {
    let plebbit, sub;
    before(async () => {
        plebbit = await mockPlebbit({ dataPath: globalThis["window"]?.plebbitDataPath });
        sub = await createMockSub({}, plebbit);
        await sub.start();
        await new Promise((resolve) => sub.once("update", resolve));
    });

    after(async () => await sub.stop());

    it(`subplebbit.lastPostCid reflects latest post published`, async () => {
        expect(sub.lastPostCid).to.be.undefined;
        const post = await publishRandomPost(sub.address, plebbit, {}, false);
        await waitUntil(() => typeof sub.lastPostCid === "string", { timeout: 200000 });
        expect(sub.lastPostCid).to.equal(post.cid);
    });
});

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
            pubsubHttpClientsOptions,
            dataPath: globalThis["window"]?.plebbitDataPath
        };

        const plebbit = await mockPlebbit(plebbitOptions);
        const sub = await createMockSub({}, plebbit);
        await sub.start();
        await new Promise((resolve) => sub.once("update", resolve));
        await publishRandomPost(sub.address, plebbit, {}, false);
        await sub.stop();
    });

    it(`Can publish a post with user@password for both ipfs and pubsub http client`, async () => {
        const ipfsHttpClientsOptions = [`http://user:password@localhost:15001/api/v0`];
        const pubsubHttpClientsOptions = [`http://user:password@localhost:15002/api/v0`];
        const plebbitOptions = {
            ipfsHttpClientsOptions,
            pubsubHttpClientsOptions,
            dataPath: globalThis["window"]?.plebbitDataPath
        };

        const plebbit = await mockPlebbit(plebbitOptions);
        const sub = await createMockSub({}, plebbit);
        await sub.start();
        await new Promise((resolve) => sub.once("update", resolve));
        await publishRandomPost(sub.address, plebbit, {}, false);
        await sub.stop();
    });
});

describe(`subplebbit.pubsubTopic`, async () => {
    let subplebbit, plebbit;
    before(async () => {
        plebbit = await mockPlebbit({ dataPath: globalThis["window"]?.plebbitDataPath });
        subplebbit = await createMockSub({}, plebbit);
    });

    after(async () => {
        await subplebbit.stop();
    });

    it(`subplebbit.pubsubTopic is defaulted to address when start() is called`, async () => {
        expect(subplebbit.pubsubTopic).to.be.undefined;
        await subplebbit.start();
        expect(subplebbit.pubsubTopic).to.equal(subplebbit.address);
    });
    it(`Publications can be published to a sub with pubsubTopic=undefined`, async () => {
        await subplebbit.edit({ pubsubTopic: undefined });
        expect(subplebbit.pubsubTopic).to.be.undefined;
        await new Promise((resolve) => subplebbit.once("update", resolve));
        expect(subplebbit.pubsubTopic).to.be.undefined;

        const post = await publishRandomPost(subplebbit.address, plebbit, {});
        expect(post.subplebbit.pubsubTopic).to.be.undefined;
    });
});

describe(`subplebbit.state`, async () => {
    let plebbit, subplebbit;
    before(async () => {
        plebbit = await mockPlebbit({ dataPath: globalThis["window"]?.plebbitDataPath });
        subplebbit = await createMockSub({}, plebbit);
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
        await waitUntil(() => eventFired);
    });

    it(`subplebbit.state = stopped after calling stop()`, async () => {
        let eventFired = false;
        subplebbit.once("statechange", (newState) => {
            expect(newState).to.equal("stopped");
            eventFired = true;
        });
        await subplebbit.stop();
        expect(subplebbit.state).to.equal("stopped");
        await waitUntil(() => eventFired);
    });

    it(`subplebbit.state = updating after calling update()`, async () => {
        let eventFired = false;
        subplebbit.once("statechange", (newState) => {
            expect(newState).to.equal("updating");
            eventFired = true;
        });
        await subplebbit.update();
        expect(subplebbit.state).to.equal("updating");
        await waitUntil(() => eventFired);
    });

    it(`subplebbit.state = started after calling start() after update()`, async () => {
        let eventFired = false;
        subplebbit.on("statechange", (newState) => {
            if (newState === "started") eventFired = true;
        });
        await subplebbit.start();
        expect(subplebbit.state).to.equal("started");
        await waitUntil(() => eventFired);
    });
});

describe(`subplebbit.startedState`, async () => {
    let plebbit, subplebbit;
    before(async () => {
        plebbit = await mockPlebbit({ dataPath: globalThis["window"]?.plebbitDataPath });
        subplebbit = await createMockSub({}, plebbit);
    });

    after(async () => {
        await subplebbit.stop();
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
        await new Promise((resolve) => subplebbit.once("startedstatechange", (newState) => newState === "succeeded" && resolve()));
        expect(recordedStates).to.deep.equal(expectedStates);
        expect(plebbit.eventNames()).to.deep.equal(["error"]);
    });

    it(`subplebbit.startedState = error if a failure occurs`, async () => {
        await new Promise((resolve) => {
            subplebbit.on("startedstatechange", (newState) => newState === "failed" && resolve());
            subplebbit.plebbit.clients.ipfsClients = undefined; // Should cause a failure
        });
    });
});

describe(`subplebbit.updatingState`, async () => {
    it(`subplebbit.updatingState defaults to stopped`, async () => {
        const plebbit = await mockPlebbit();
        const subplebbit = await plebbit.getSubplebbit(signers[0].address);
        expect(subplebbit.updatingState).to.equal("stopped");
    });

    it(`subplebbit.updatingState is in correct order upon updating with IPFS client`, async () => {
        const plebbit = await mockPlebbit();
        const subplebbit = await plebbit.getSubplebbit(signers[0].address);
        const recordedStates = [];
        const expectedStates = ["resolving-address", "fetching-ipns", "fetching-ipfs", "succeeded", "stopped"];
        subplebbit.on("updatingstatechange", (newState) => recordedStates.push(newState));

        await subplebbit.update();

        publishRandomPost(subplebbit.address, plebbit, {}, false); // To force trigger an update
        await new Promise((resolve) => subplebbit.once("update", resolve));
        await subplebbit.stop();

        expect(recordedStates.slice(recordedStates.length - 5)).to.deep.equal(expectedStates);
        expect(plebbit.eventNames()).to.deep.equal(["error"]); // Make sure events has been unsubscribed from
    });

    it(`updating states is in correct order upon updating with gateway`, async () => {
        const gatewayPlebbit = await mockGatewayPlebbit();

        const subplebbit = await gatewayPlebbit.getSubplebbit(signers[0].address);

        const expectedStates = ["resolving-address", "fetching-ipns", "succeeded", "stopped"];
        const recordedStates = [];
        subplebbit.on("updatingstatechange", (newState) => recordedStates.push(newState));

        await subplebbit.update();

        publishRandomPost(subplebbit.address, gatewayPlebbit, {}, false); // To force trigger an update
        await new Promise((resolve) => subplebbit.once("update", resolve));
        await subplebbit.stop();

        expect(recordedStates.slice(recordedStates.length - 4)).to.deep.equal(expectedStates);
        expect(gatewayPlebbit.eventNames()).to.deep.equal(["error"]); // Make sure events has been unsubscribed from
    });

    it(`subplebbit.updatingState emits 'succceeded' when a new update from local sub is retrieved`, async () => {
        const plebbit = await mockPlebbit({ dataPath: globalThis["window"]?.plebbitDataPath });
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

describe(`Generation of thumbnail urls`, async () => {
    it(`Generates thumbnail url for youtube video correctly`, async () => {
        const url = "https://www.youtube.com/watch?v=TLysAkFM4cA";
        const expectedThumbnailUrl = "https://i.ytimg.com/vi/TLysAkFM4cA/maxresdefault.jpg";
        const thumbnailUrl = await getThumbnailUrlOfLink(url);
        expect(thumbnailUrl).to.equal(expectedThumbnailUrl);
    });

    it(`comment.thumbnailUrl is populated by subplebbit in challengeVerification`, async () => {
        const link = "https://www.youtube.com/watch?v=TLysAkFM4cA";
        const plebbit = await mockPlebbit({ dataPath: globalThis["window"]?.plebbitDataPath });
        const sub = await createMockSub({}, plebbit);
        await sub.edit({ settings: { fetchThumbnailUrls: true } });
        expect(sub.settings.fetchThumbnailUrls).to.be.true;

        await sub.start();

        await new Promise((resolve) => sub.once("update", resolve));

        expect(sub.settings.fetchThumbnailUrls).to.be.true;

        const post = await publishRandomPost(sub.address, plebbit, { link }, false);
        expect(post.link).to.equal(link);
        await sub.stop();
        expect(post.thumbnailUrl).to.equal("https://i.ytimg.com/vi/TLysAkFM4cA/maxresdefault.jpg");
    });
});

describe(`Migration to a new IPFS repo`, async () => {
    let subAddress;
    let plebbitDifferentIpfs;
    before(async () => {
        const plebbit = await mockPlebbit({ dataPath: globalThis["window"]?.plebbitDataPath });
        const sub = await createMockSub({}, plebbit);
        await sub.start();
        await new Promise((resolve) => sub.once("update", resolve));
        const post = await publishRandomPost(sub.address, plebbit, {}, true);
        await publishRandomReply(post, plebbit, {}, true);

        await sub.stop();

        plebbitDifferentIpfs = await mockPlebbit({
            dataPath: globalThis["window"]?.plebbitDataPath,
            ipfsHttpClientsOptions: ["http://localhost:15004/api/v0"]
        }); // Different IPFS repo

        const subDifferentIpfs = await createMockSub({ address: sub.address }, plebbitDifferentIpfs);
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

        const ipnsLoaded = JSON.parse(
            await plebbitDifferentIpfs._clientsManager.fetchSubplebbitIpns(postFromPage.ipnsName, plebbitDifferentIpfs)
        );
        expect(ipnsLoaded.cid).to.equal(postFromPage.cid); // Make sure it was loaded correctly
    });
});

describe(`subplebbit.clients (Local)`, async () => {
    let plebbit;
    before(async () => {
        plebbit = await mockPlebbit();
    });

    describe(`subplebbit.clients.ipfsClients`, async () => {
        it(`subplebbit.clients.ipfsClients[url] is stopped by default`, async () => {
            const mockSub = await createMockSub({}, plebbit);
            expect(Object.keys(mockSub.clients.ipfsClients).length).to.equal(1);
            expect(Object.values(mockSub.clients.ipfsClients)[0].state).to.equal("stopped");
        });

        it(`subplebbit.clients.ipfsClients.state is publishing-ipns before publishing a new IPNS`, async () => {
            const sub = await createMockSub({}, plebbit);

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

    describe(`subplebbit.clients.pubsubClients`, async () => {
        it(`subplebbit.clients.pubsubClients[url].state is stopped by default`, async () => {
            const mockSub = await createMockSub({}, plebbit);
            expect(Object.keys(mockSub.clients.pubsubClients).length).to.equal(1);
            expect(Object.values(mockSub.clients.pubsubClients)[0].state).to.equal("stopped");
        });

        it(`correct order of pubsubClients state when receiving a comment while skipping challenge`, async () => {
            const mockSub = await createMockSub({}, plebbit);

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

            mockSub.setValidateCaptchaAnswerCallback(async (challengeAnswerMessage) => {
                return [true, undefined];
            });

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

            publishRandomPost(mockSub.address, plebbit, {}, false);

            await new Promise((resolve) => mockSub.once("challengeverification", resolve));

            expect(actualStates).to.deep.equal(expectedStates);
        });
    });

    describe(`subplebbit.clients.chainProviders`, async () => {
        it(`subplebbit.clients.chainProviders[url].state is stopped by default`, async () => {
            const mockSub = await createMockSub({}, plebbit);
            expect(Object.keys(mockSub.clients.chainProviders).length).to.equal(3);
            expect(Object.values(mockSub.clients.chainProviders)[0].state).to.equal("stopped");
        });

        it(`correct order of chainProviders state when receiving a comment with a domain for author.address`, async () => {
            const mockSub = await createMockSub({}, plebbit);

            const expectedStates = ["resolving-author-address", "stopped"];

            const actualStates = [];

            mockSub.clients.chainProviders["eth"].on("statechange", (newState) => actualStates.push(newState));

            await mockSub.start();

            await new Promise((resolve) => mockSub.once("update", resolve));

            publishRandomPost(mockSub.address, plebbit, { author: { address: "plebbit.eth" }, signer: signers[6] });

            await new Promise((resolve) => mockSub.once("challengeverification", resolve));

            expect(actualStates).to.deep.equal(expectedStates);
        });
    });
});
