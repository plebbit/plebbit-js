const Plebbit = require("../../dist/node");
const signers = require("../fixtures/signers");
const { generateMockPost } = require("../../dist/node/test/test-util");
const { timestamp, encode } = require("../../dist/node/util");
const { messages, codes } = require("../../dist/node/errors");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { mockPlebbit } = require("../../dist/node/test/test-util");
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
    });
    after(async () => {
        // Delete DB
        await subplebbit.stop();
    });

    [{}, { title: `Test title - ${Date.now()}` }].map((subArgs) =>
        it(`createSubplebbit(${JSON.stringify(subArgs)})`, async () => {
            return new Promise(async (resolve) => {
                const newSubplebbit = await plebbit.createSubplebbit(subArgs);
                newSubplebbit._syncIntervalMs = syncInterval;
                await newSubplebbit.start();
                newSubplebbit.once("update", async () => {
                    // Sub has finished its first sync loop, should have address now
                    expect(newSubplebbit.address).to.equal(newSubplebbit.signer.address);
                    const subplebbitIpns = await plebbit.getSubplebbit(newSubplebbit.address);
                    expect(subplebbitIpns.address).to.equal(newSubplebbit.signer.address);
                    await newSubplebbit.stop();
                    resolve();
                });
            });
        })
    );

    it(`Can customize database config for subplebbit`, async () => {
        const databaseConfig = {
            client: "sqlite3",
            connection: {
                filename: ":memory:"
            },
            useNullAsDefault: true
        };
        const subWithDbConfig = await plebbit.createSubplebbit({ database: databaseConfig });
        expect(subWithDbConfig.dbHandler.getDbConfig()).to.deep.equal(databaseConfig);
    });

    it(`createSubplebbit on IPFS node doesn't take more than 10s`, async () => {
        const onlinePlebbit = await Plebbit({
            ipfsHttpClientOptions: "http://localhost:5003/api/v0",
            pubsubHttpClientOptions: `http://localhost:5003/api/v0`,
            dataPath: globalThis["window"]?.plebbitDataPath
        });
        const startTime = timestamp();

        const title = `Test online plebbit`;

        const createdSub = await onlinePlebbit.createSubplebbit({ title: title });

        const endTime = timestamp();

        await createdSub.stop();

        expect(endTime).to.be.lessThanOrEqual(startTime + 10, "createSubplebbit took more than 10s in an online ipfs node");
    });

    it("create new subplebbit from signer", async () => {
        subplebbitSigner = await plebbit.createSigner();
        const title = `Test subplebbit - ${Date.now() / 1000}`;
        subplebbit = await plebbit.createSubplebbit({
            signer: subplebbitSigner,
            title
        });
        subplebbit._syncIntervalMs = syncInterval;
        await subplebbit.start();
        await new Promise((resolve) => subplebbit.once("update", resolve));
        expect(subplebbit.address).to.equal(subplebbitSigner.address);
        // Should have address now
        const loadedSubplebbit = await plebbit.getSubplebbit(subplebbit.address);
        expect(loadedSubplebbit.title).to.equal(title);
        expect(encode(subplebbit.toJSON())).to.equal(encode(loadedSubplebbit.toJSON()));
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
        loadedSubplebbit.update();
        await new Promise((resolve) =>
            loadedSubplebbit.on("update", async () => {
                if (loadedSubplebbit.description !== newDescription) return;
                expect(loadedSubplebbit.description).to.equal(newDescription);
                expect(loadedSubplebbit.title).to.equal(newTitle);
                loadedSubplebbit.stop();
                loadedSubplebbit.removeAllListeners();
                resolve();
            })
        );
    });

    it(`Can edit a subplebbit to have ENS domain as address`, async () => {
        const address = JSON.parse(JSON.stringify(subplebbit.address));
        plebbit.resolver.resolveSubplebbitAddressIfNeeded = async (subplebbitAddress) => {
            if (subplebbitAddress === "plebbit.eth") return address;
            else if (subplebbitAddress === "plebbit2.eth") return signers[2];
            else if (subplebbitAddress === "testgibbreish.eth") throw new Error(`Domain (${subplebbitAddress}) has no subplebbit-address`);
            return subplebbitAddress;
        };
        await subplebbit.edit({ address: "plebbit.eth" });
        expect(subplebbit.address).to.equal("plebbit.eth");
        await new Promise((resolve) => subplebbit.once("update", resolve));
        const loadedSubplebbit = await plebbit.getSubplebbit("plebbit.eth");
        expect(loadedSubplebbit.address).to.equal("plebbit.eth");
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

    it(`subplebbit.update() works correctly with subplebbit.address as domain`, async () =>
        new Promise(async (resolve) => {
            const loadedSubplebbit = await plebbit.getSubplebbit("plebbit.eth");
            loadedSubplebbit._updateIntervalMs = syncInterval;
            await loadedSubplebbit.update();

            const post = await subplebbit._addPublicationToDb(await generateMockPost("plebbit.eth", plebbit, signers[0]));

            loadedSubplebbit.on("update", async (updatedSubplebbit) => {
                if (!updatedSubplebbit.posts) return;
                expect(updatedSubplebbit.address).to.equal("plebbit.eth");
                expect(updatedSubplebbit?.posts?.pages?.hot?.comments?.some((comment) => comment.content === post.content)).to.be.true;
                expect(updatedSubplebbit.lastPostCid).to.equal(post.cid);
                await loadedSubplebbit.stop();
                await loadedSubplebbit.removeAllListeners();
                resolve();
            });
        }));

    it(`Can call subplebbit.posts.getPage on a remote sub with no posts`, async () => {
        const pageCid = subplebbit.posts?.pageCids?.hot;
        expect(pageCid).to.be.a.string;
        const plebbitWithDifferentPath = await Plebbit({
            dataPath: plebbit.dataPath.replace(".plebbit", ".plebbit2"),
            ipfsHttpClientOptions: "http://localhost:5001/api/v0",
            pubsubHttpClientOptions: `http://localhost:5002/api/v0`
        });
        const emptySubplebbit = await plebbitWithDifferentPath.createSubplebbit({ address: subplebbit.address }); // This should generate an empty subplebbit
        const actualPage = await subplebbit.posts.getPage(pageCid);
        const fetchedSubplebbitPage = await emptySubplebbit.posts.getPage(pageCid);
        expect(JSON.stringify(actualPage)).to.equal(JSON.stringify(fetchedSubplebbitPage));
    });

    it(`Can't call subplebbit.start from same Subplebbit instance, another Subplebbit instance or through a different ipfs client`, async () => {
        let sameSubplebbit = await plebbit.createSubplebbit({ address: subplebbit.address });
        await assert.isRejected(sameSubplebbit.start(), messages.ERR_SUB_ALREADY_STARTED);
        const anotherPlebbit = await Plebbit({
            ipfsHttpClientOptions: "http://localhost:5004/api/v0",
            pubsubHttpClientOptions: `http://localhost:5002/api/v0`,
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

    it.skip(`DB get migrated successfully`, async () => {
        // TODO this test is not through at all. Rewrite it at some point
        const originalDbVersion = await subplebbit.dbHandler.getDbVersion();
        await subplebbit.dbHandler._knex.raw("PRAGMA user_version = 999999"); // Force a migrate
        await subplebbit.stop(); // Clear out dbHandler
        subplebbit._syncIntervalMs = syncInterval;
        await subplebbit.start();

        const currentDbVersion = await subplebbit.dbHandler.getDbVersion();
        expect(currentDbVersion).to.equal(originalDbVersion); // If they're equal, that means all tables have been migrated
    });

    it(`local subplebbit retains fields upon createSubplebbit(address)`, async () => {
        const createdSubplebbit = await plebbit.createSubplebbit({ address: subplebbit.address });
        expect(JSON.stringify(createdSubplebbit.toJSON())).to.equal(JSON.stringify(subplebbit.toJSON()));
    });

    it(`createSubplebbit({address, ...extraProps}) creates a sub with extraProps fields over cached fields`, async () =>
        new Promise(async (resolve) => {
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
            createdSubplebbit.once("update", (updatedSubplebbit) => {
                expect(updatedSubplebbit.title).to.equal("nothing");
                expect(updatedSubplebbit.description).to.equal("nothing also");
                createdSubplebbit.stop();
                resolve();
            });
        }));

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
        await new Promise((resolve) =>
            subTwo.on("update", () => {
                if (subTwo.title !== newTitle) return;
                expect(subTwo.title).to.equal(newTitle);
                expect(subOne.title).to.equal(newTitle);
                expect(encode(subTwo.toJSON())).to.equal(encode(subOne.toJSON()));
                subOne.stop();
                subTwo.stop();
                subTwo.removeAllListeners();
                resolve();
            })
        );
    });

    it(`Deleted sub is not listed in listSubplebbits`, async () => {
        const subs = await plebbit.listSubplebbits();
        expect(subs).to.include(subplebbit.address);
        expect(await plebbit.getSubplebbit(subplebbit.address)).to.be.an("object");
        await subplebbit.delete();
        const subsAfterDeletion = await plebbit.listSubplebbits();
        expect(subsAfterDeletion).to.not.include(subplebbit.address);
    });
});
