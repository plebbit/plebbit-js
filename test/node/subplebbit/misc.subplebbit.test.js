const Plebbit = require("../../../dist/node");
const { mockPlebbit, publishRandomPost, createMockSub } = require("../../../dist/node/test/test-util");
const signers = require("../../fixtures/signers");
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
        plebbit = await mockPlebbit(globalThis["window"]?.plebbitDataPath);
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
        plebbit = await mockPlebbit(globalThis["window"]?.plebbitDataPath);
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
        const ipfsKeys = await plebbit.ipfsClient.key.list();
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
        plebbit = await mockPlebbit(globalThis["window"]?.plebbitDataPath);
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
        const ipfsHttpClientOptions = {
            url: "http://localhost:15001/api/v0",
            headers
        };
        const pubsubHttpClientOptions = {
            url: "http://localhost:15002/api/v0",
            headers
        };

        const plebbitOptions = {
            ipfsHttpClientOptions,
            pubsubHttpClientOptions,
            dataPath: globalThis["window"]?.plebbitDataPath
        };

        const plebbit = await Plebbit(plebbitOptions);
        const sub = await createMockSub({}, plebbit);
        await sub.start();
        await new Promise((resolve) => sub.once("update", resolve));
        await publishRandomPost(sub.address, plebbit, {}, false);
        await sub.stop();
    });

    it(`Can publish a post with user@password for both ipfs and pubsub http client`, async () => {
        const ipfsHttpClientOptions = `http://user:password@localhost:15001/api/v0`;
        const pubsubHttpClientOptions = `http://user:password@localhost:15002/api/v0`;
        const plebbitOptions = {
            ipfsHttpClientOptions,
            pubsubHttpClientOptions,
            dataPath: globalThis["window"]?.plebbitDataPath
        };

        const plebbit = await Plebbit(plebbitOptions);
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
        plebbit = await mockPlebbit(globalThis["window"]?.plebbitDataPath);
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
        plebbit = await mockPlebbit(globalThis["window"]?.plebbitDataPath);
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
        plebbit = await mockPlebbit(globalThis["window"]?.plebbitDataPath);
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
            subplebbit.plebbit.ipfsClient = undefined; // Should cause a failure
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

        //@ts-ignore
        subplebbit._updateIntervalMs = 300;

        await subplebbit.update();

        publishRandomPost(subplebbit.address, plebbit, {}, false); // To force trigger an update
        await new Promise((resolve) => subplebbit.once("update", resolve));
        await subplebbit.stop();

        expect(recordedStates.slice(recordedStates.length - 5)).to.deep.equal(expectedStates);
        expect(plebbit.eventNames()).to.deep.equal(["error"]); // Make sure events has been unsubscribed from
    });

    it(`updating states is in correct order upon updating with gateway`, async () => {
        const gatewayPlebbit = await mockPlebbit();
        gatewayPlebbit.ipfsHttpClientOptions = gatewayPlebbit.ipfsClient = undefined;

        const subplebbit = await gatewayPlebbit.getSubplebbit(signers[0].address);

        const expectedStates = ["resolving-address", "fetching-ipns", "succeeded", "stopped"];
        const recordedStates = [];
        subplebbit.on("updatingstatechange", (newState) => recordedStates.push(newState));

        //@ts-ignore
        subplebbit._updateIntervalMs = 500;

        await subplebbit.update();

        publishRandomPost(subplebbit.address, gatewayPlebbit, {}, false); // To force trigger an update
        await new Promise((resolve) => subplebbit.once("update", resolve));
        await subplebbit.stop();

        expect(recordedStates.slice(recordedStates.length - 4)).to.deep.equal(expectedStates);
        expect(gatewayPlebbit.eventNames()).to.deep.equal(["error"]); // Make sure events has been unsubscribed from
    });

    it(`subplebbit.updatingState emits 'succceeded' when a new update from local sub is retrieved`, async () => {
        const plebbit = await mockPlebbit(globalThis["window"]?.plebbitDataPath);
        const localSub = await plebbit.createSubplebbit({ address: signers[0].address });
        const expectedStates = [ "succeeded", "stopped"];
        const recordedStates = [];


        localSub.on("updatingstatechange", (newState) => recordedStates.push(newState));

        //@ts-ignore
        localSub._updateIntervalMs = 500;

        await localSub.update();

        publishRandomPost(localSub.address, plebbit, {}, false);

        await new Promise(resolve => localSub.once("update", resolve));
        await localSub.stop();

        expect(recordedStates).to.deep.equal(expectedStates);
        expect(plebbit.eventNames()).to.deep.equal(["error"]); // Make sure events has been unsubscribed from
    });
});
