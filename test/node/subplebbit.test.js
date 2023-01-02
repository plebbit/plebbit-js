const Plebbit = require("../../dist/node");
const signers = require("../fixtures/signers");
const { publishRandomPost } = require("../../dist/node/test/test-util");
const { timestamp, encode } = require("../../dist/node/util");
const { messages } = require("../../dist/node/errors");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { mockPlebbit } = require("../../dist/node/test/test-util");
const path = require("path");
const fs = require("fs");
chai.use(chaiAsPromised);
const { expect, assert } = chai;
const syncInterval = 300;
let plebbit;
let subplebbit;
let subplebbitSigner;

if (globalThis["navigator"]?.userAgent?.includes("Electron")) Plebbit.setNativeFunctions(window.plebbitJsNativeFunctions);

describe("subplebbit", async () => {
    before(async () => {
        plebbit = await mockPlebbit(globalThis["window"]?.plebbitDataPath);
        subplebbitSigner = await plebbit.createSigner();
        plebbit.resolver.resolveSubplebbitAddressIfNeeded = async (subplebbitAddress) => {
            if (subplebbitAddress === "plebbit.eth") return subplebbitSigner.address;
            else if (subplebbitAddress === "plebbit2.eth") return signers[2];
            else if (subplebbitAddress === "testgibbreish.eth") throw new Error(`Domain (${subplebbitAddress}) has no subplebbit-address`);
            return subplebbitAddress;
        };
    });
    after(async () => {
        // Delete DB
        if (subplebbit) await subplebbit.stop();
    });

    [{}, { title: `Test title - ${Date.now()}` }].map((subArgs) =>
        it(`createSubplebbit(${JSON.stringify(subArgs)})`, async () => {
            const newSubplebbit = await plebbit.createSubplebbit(subArgs);
            newSubplebbit._syncIntervalMs = syncInterval;
            await newSubplebbit.start();
            await new Promise((resolve) => {
                newSubplebbit.once("update", async () => {
                    // Sub has finished its first sync loop, should have address now
                    expect(newSubplebbit.address).to.equal(newSubplebbit.signer.address);
                    const subplebbitIpns = await plebbit.getSubplebbit(newSubplebbit.address);
                    expect(subplebbitIpns.address).to.equal(newSubplebbit.signer.address);
                    resolve();
                });
            });
            await newSubplebbit.stop();
        })
    );

    it(`Can start a sub after stopping it`, async () => {
        const newSubplebbit = await plebbit.createSubplebbit({});
        newSubplebbit._syncIntervalMs = syncInterval;
        newSubplebbit.setProvideCaptchaCallback(async () => [[], "Challenge skipped"]);

        await newSubplebbit.start();
        await new Promise((resolve) => newSubplebbit.once("update", resolve));

        await publishRandomPost(newSubplebbit.address, plebbit);
        await newSubplebbit.stop();
        await newSubplebbit.start();
        await publishRandomPost(newSubplebbit.address, plebbit);
        await newSubplebbit.stop();
    });

    it(`Sub can receive publications after pubsub topic subscription disconnects`, async () => {
        // There are cases where ipfs node can fail and be restarted
        // When that happens, the subscription to subplebbit.pubsubTopic will not be restored
        // The restoration of subscription should happen within the sync loop of Subplebbit
        const sub = await plebbit.createSubplebbit();
        sub._syncIntervalMs = syncInterval;
        sub.setProvideCaptchaCallback(async () => [[], "Challenge skipped"]);

        await sub.start();
        await new Promise((resolve) => sub.once("update", resolve));
        await publishRandomPost(sub.address, plebbit);
        await sub.plebbit.pubsubIpfsClient.pubsub.unsubscribe(sub.pubsubTopic);
        await publishRandomPost(sub.address, plebbit);
        await sub.stop();
    });

    it(`createSubplebbit on IPFS node doesn't take more than 10s`, async () => {
        const onlinePlebbit = await Plebbit({
            ipfsHttpClientOptions: "http://localhost:15003/api/v0",
            pubsubHttpClientOptions: `http://localhost:15003/api/v0`,
            dataPath: globalThis["window"]?.plebbitDataPath
        });
        onlinePlebbit.resolver = plebbit.resolver;
        const startTime = timestamp();
        const title = `Test online plebbit`;
        const createdSub = await onlinePlebbit.createSubplebbit({ title: title });
        const endTime = timestamp();
        await createdSub.stop();
        expect(endTime).to.be.lessThanOrEqual(startTime + 10, "createSubplebbit took more than 10s in an online ipfs node");
    });

    it(`createSubplebbit({signer: {privateKey}})`, async () => {
        const signer = await plebbit.createSigner();
        const sub = await plebbit.createSubplebbit({ signer: { privateKey: signer.privateKey, type: "rsa" } });
        expect(sub.address).to.equal(signer.address);
        await sub.start();
        await new Promise((resolve) => sub.once("update", resolve));
        await sub.stop();
    });

    it("create new subplebbit from signer", async () => {
        const title = `Test subplebbit - ${Date.now() / 1000}`;
        subplebbit = await plebbit.createSubplebbit({
            signer: subplebbitSigner,
            title
        });
        subplebbit.setProvideCaptchaCallback(async () => [[], "Challenge skipped"]);
        subplebbit._syncIntervalMs = syncInterval;
        await subplebbit.start();
        await new Promise((resolve) => subplebbit.once("update", resolve));
        expect(subplebbit.address).to.equal(subplebbitSigner.address);
        // Should have address now
        const loadedSubplebbit = await plebbit.getSubplebbit(subplebbit.address);
        expect(loadedSubplebbit.title).to.equal(title);
        expect(encode(subplebbit.toJSON())).to.equal(encode(loadedSubplebbit.toJSON()));
    });

    it(`Sub can receive publications sequentially`, async () => {
        await publishRandomPost(subplebbit.address, plebbit);
        await publishRandomPost(subplebbit.address, plebbit);
        await publishRandomPost(subplebbit.address, plebbit);
    });

    it(`Sub can receive publications parallely`, async () => {
        await Promise.all(new Array(3).fill(null).map(() => publishRandomPost(subplebbit.address, plebbit)));
    });

    it(`subplebbit = await createSubplebbit(await createSubplebbit)`, async () => {
        const props = { title: "subplebbit = await createSubplebbit(await createSubplebbit)" };
        const createdSub = await plebbit.createSubplebbit(await plebbit.createSubplebbit(props));
        expect(createdSub.title).to.equal(props.title);
        expect(createdSub.signer.address).to.be.a("string");
    });

    it("subplebbit.edit", async () => {
        const newTitle = `New title to test subplebbit.edit - ${Date.now()}`;
        const newDescription = `New description to test subplebbit.edit - ${Date.now()}`;
        const newProps = { title: newTitle, description: newDescription };
        const loadedSubplebbit = await plebbit.getSubplebbit(subplebbit.address);

        await subplebbit.edit(newProps);
        expect(subplebbit.title).to.equal(newTitle);
        expect(subplebbit.description).to.equal(newDescription);
        loadedSubplebbit._updateIntervalMs = syncInterval;
        await loadedSubplebbit.update();
        await new Promise((resolve) => loadedSubplebbit.on("update", () => loadedSubplebbit.description === newDescription && resolve()));
        loadedSubplebbit.stop();
        loadedSubplebbit.removeAllListeners();
        expect(loadedSubplebbit.description).to.equal(newDescription);
        expect(loadedSubplebbit.title).to.equal(newTitle);
    });

    it(`Can edit a subplebbit to have ENS domain as address`, async () => {
        await subplebbit.edit({ address: "plebbit.eth" });
        expect(subplebbit.address).to.equal("plebbit.eth");
        await new Promise((resolve) => subplebbit.once("update", resolve));
        const loadedSubplebbit = await plebbit.getSubplebbit("plebbit.eth");
        // Sub is expected to have empty pages after changing its address because all comments pre-change had comment.subplebbitAddress = oldAddress
        // comments with subplebbitAddress that is not the current sub address will not be included in pages
        expect(loadedSubplebbit.address).to.equal("plebbit.eth");
        // subplebbit.posts should omit all comments that referenced the old subplebbit address
        // So in essence it should be empty
        expect(loadedSubplebbit.posts.pages).to.deep.equal({});
        expect(loadedSubplebbit.posts.pageCids).to.deep.equal({});
        expect(subplebbit.address).to.equal("plebbit.eth");
        expect(encode(loadedSubplebbit.toJSON())).to.equal(encode(subplebbit.toJSON()));
    });
    it(`Can edit subplebbit.address to a new domain if subplebbit-address record does not exist or does not match signer.address`, async () => {
        // Has no subplebbit-address
        await subplebbit.edit({ address: "testgibbreish.eth" });

        expect(subplebbit.address).to.equal("testgibbreish.eth");

        // Should not match signer.address
        await subplebbit.edit({ address: "plebbit2.eth" });

        expect(subplebbit.address).to.equal("plebbit2.eth");

        // Revert back to "plebbit.eth"
        await subplebbit.edit({ address: "plebbit.eth" });

        expect(subplebbit.address).to.equal("plebbit.eth");
    });

    it(`Started Sub can receive publications on new address after editing address`, async () => {
        const newPlebbit = await Plebbit(plebbit);
        const newSub = await newPlebbit.createSubplebbit({});
        const subAddress = JSON.parse(JSON.stringify(newSub.address));
        newPlebbit.resolver.resolveSubplebbitAddressIfNeeded = (subplebbitAddress) =>
            subplebbitAddress === "testPub.eth" ? subAddress : subplebbitAddress;
        newSub.setProvideCaptchaCallback(async () => [[], "Challenge skipped"]);
        newSub._syncIntervalMs = syncInterval;
        await newSub.start();
        await new Promise((resolve) => newSub.once("update", resolve));
        await publishRandomPost(newSub.address, newPlebbit);
        await newSub.edit({ address: "testPub.eth" });
        await publishRandomPost(newSub.address, newPlebbit);
        await newSub.stop();
    });

    it(`subplebbit.update() works correctly with subplebbit.address as domain`, async () => {
        await subplebbit.stop();
        await subplebbit.start();
        const loadedSubplebbit = await plebbit.getSubplebbit("plebbit.eth");
        const post = await publishRandomPost(subplebbit.address, plebbit);
        loadedSubplebbit._updateIntervalMs = syncInterval;
        await loadedSubplebbit.update();
        await new Promise((resolve) => loadedSubplebbit.once("update", resolve));
        await loadedSubplebbit.stop();
        expect(loadedSubplebbit.address).to.equal("plebbit.eth");
        expect(loadedSubplebbit?.posts?.pages?.hot?.comments?.some((comment) => comment.cid === post.cid)).to.be.true;
        expect(loadedSubplebbit.lastPostCid).to.equal(post.cid);
    });

    it(`Can call subplebbit.posts.getPage on a remote sub with no posts`, async () => {
        const pageCid = subplebbit.posts?.pageCids?.hot;
        expect(pageCid).to.be.a.string;
        const plebbitWithDifferentPath = await mockPlebbit(plebbit.dataPath.replace(".plebbit", ".plebbit2"));
        const emptySubplebbit = await plebbitWithDifferentPath.createSubplebbit({ address: subplebbit.address }); // This should generate an empty subplebbit
        const actualPage = await subplebbit.posts.getPage(pageCid);
        const fetchedSubplebbitPage = await emptySubplebbit.posts.getPage(pageCid);
        expect(JSON.stringify(actualPage)).to.equal(JSON.stringify(fetchedSubplebbitPage));
    });

    it(`Can't call subplebbit.start from same Subplebbit instance, another Subplebbit instance or through a different ipfs client`, async () => {
        let sameSubplebbit = await plebbit.createSubplebbit({ address: subplebbit.address });
        await assert.isRejected(sameSubplebbit.start(), messages.ERR_SUB_ALREADY_STARTED);
        const anotherPlebbit = await Plebbit({
            ipfsHttpClientOptions: "http://localhost:15004/api/v0",
            pubsubHttpClientOptions: `http://localhost:15002/api/v0`,
            dataPath: globalThis["window"]?.plebbitDataPath
        });
        anotherPlebbit.resolver.resolveAuthorAddressIfNeeded = async (authorAddress) => {
            if (authorAddress === "plebbit.eth") return signers[6].address;
            else if (authorAddress === "testgibbreish.eth") return undefined;
            return authorAddress;
        };
        sameSubplebbit = await anotherPlebbit.createSubplebbit({ signer: subplebbitSigner });
        await assert.isRejected(sameSubplebbit.start(), messages.ERR_SUB_ALREADY_STARTED);
    });

    it(`listSubplebbits shows only created subplebbits`, async () =>
        new Promise(async (resolve) => {
            const subplebbitSigner = await plebbit.createSigner();
            const title = "Test listSubplebbits";

            plebbit.createSubplebbit({ signer: subplebbitSigner, title: title });

            let interval;
            const loop = async () => {
                const subs = await plebbit.listSubplebbits();
                if (subs.includes(subplebbitSigner.address)) {
                    const createdSubplebbit = await plebbit.createSubplebbit({ signer: subplebbitSigner });
                    expect(createdSubplebbit.address).to.equal(subplebbitSigner.address);
                    expect(createdSubplebbit.title).to.equal(title);
                    await createdSubplebbit.stop();

                    clearInterval(interval);
                    resolve();
                }
            };

            interval = setInterval(loop, 50);
        }));

    it(`local subplebbit retains fields upon createSubplebbit(address)`, async () => {
        const createdSubplebbit = await plebbit.createSubplebbit({ address: subplebbit.address });
        expect(JSON.stringify(createdSubplebbit.toJSON())).to.equal(JSON.stringify(subplebbit.toJSON()));
    });

    it(`createSubplebbit({address, ...extraProps}) creates a sub with extraProps fields over cached fields`, async () => {
        const newSub = await plebbit.createSubplebbit({
            title: `Test for extra props`,
            description: "Test for description extra props"
        });
        newSub._syncIntervalMs = syncInterval;
        await newSub.start();
        await new Promise((resolve) => newSub.once("update", resolve));
        await newSub.stop();

        const createdSubplebbit = await plebbit.createSubplebbit({
            address: newSub.address,
            title: "nothing",
            description: "nothing also"
        });
        expect(createdSubplebbit.title).to.equal("nothing");
        expect(createdSubplebbit.description).to.equal("nothing also");

        createdSubplebbit._syncIntervalMs = syncInterval;
        await createdSubplebbit.start();
        await new Promise((resolve) => createdSubplebbit.once("update", resolve));
        expect(createdSubplebbit.title).to.equal("nothing");
        expect(createdSubplebbit.description).to.equal("nothing also");
        await createdSubplebbit.stop();
    });

    it("Two local sub instances can receive each other updates with subplebbit.update", async () => {
        const subOne = await plebbit.createSubplebbit({});
        subOne._syncIntervalMs = syncInterval;
        await subOne.start();
        await new Promise((resolve) => subOne.once("update", resolve));
        // subOne is published now
        const subTwo = await plebbit.createSubplebbit({ address: subOne.address });
        subTwo._updateIntervalMs = syncInterval;
        await subTwo.update();
        const newTitle = "Test new Title" + Date.now();
        await subOne.edit({ title: newTitle });
        expect(subOne.title).to.equal(newTitle);
        await new Promise((resolve) => subTwo.on("update", () => subTwo.title === newTitle && resolve()));
        expect(subTwo.title).to.equal(newTitle);
        expect(subOne.title).to.equal(newTitle);
        expect(encode(subTwo.toJSON())).to.equal(encode(subOne.toJSON()));
        subOne.stop();
        subTwo.stop();
        subTwo.removeAllListeners();
    });

    it(`Deleted sub is not listed in listSubplebbits`, async () => {
        const subs = await plebbit.listSubplebbits();
        expect(subs).to.include(subplebbit.address);
        expect(await plebbit.getSubplebbit(subplebbit.address)).to.be.an("object");
        await subplebbit.delete();
        const subsAfterDeletion = await plebbit.listSubplebbits();
        expect(subsAfterDeletion).to.not.include(subplebbit.address);
    });

    it(`Deleted sub keys are not listed in node`, async () => {
        const ipfsKeys = await subplebbit.plebbit.ipfsClient.key.list();
        const subKeyExists = ipfsKeys.some((key) => key.name === subplebbit.signer.ipnsKeyName);
        expect(subKeyExists).to.be.false;
    });

    it(`Deleted sub db is moved to datapath/subplebbits/deleted`, async () => {
        const expectedPath = path.join(plebbit.dataPath, "subplebbits", "deleted", subplebbit.address);
        expect(fs.existsSync(expectedPath)).to.be.true;
    });
});
