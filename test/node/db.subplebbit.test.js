const { publishRandomPost } = require("../../dist/node/test/test-util");

const Plebbit = globalThis["window"]?.plebbitApi || require("../../dist/node");
const chai = globalThis["window"]?.chaiApi || require("chai");
const chaiAsPromised = globalThis["window"]?.chaiAsPromisedApi || require("chai-as-promised");
chai.use(chaiAsPromised);
const { expect, assert } = chai;

const path = globalThis["window"]?.pathApi || require("path");
const fs = globalThis["window"]?.fsApi || require("fs");
const { mockPlebbit, publishRandomReply } = globalThis["window"]?.testUtilApi || require("../../dist/node/test/test-util");

const plebbitVersion = globalThis["window"]?.plebbitVersionApi || require("../../dist/node/version");

const databases = [
    { version: 2, address: "Qmd3ts5tdvGztqkb3Uuir3i6pLXgpaZ7N5kvgJvSeYFnZ4" },
    { version: 4, address: "QmSz169sN2FtwzsxwJxTYPN1HLvkRKrawBr4mFVCr2rsUS" }
];
if (globalThis["navigator"]?.userAgent?.includes("Electron")) Plebbit.setNativeFunctions(window.plebbitJsNativeFunctions);

const syncInterval = 300;

describe(`DB importing`, async () => {
    let plebbit;

    const copyDbToDataPath = async (database) => {
        const dbPath = path.join(process.cwd(), "test", "fixtures", `subplebbit_db_version_${database.version}`, database.address);

        const subAddress = path.basename(dbPath);
        const newPath = path.join(plebbit.dataPath, "subplebbits", subAddress);
        await fs.promises.cp(dbPath, newPath);
    };

    before(async () => {
        plebbit = await mockPlebbit(globalThis["window"]?.plebbitDataPath);
    });

    after(async () => {
        // Copy rest of databases
        await Promise.all(databases.splice(1).map(copyDbToDataPath));
    });

    it(`Subplebbit will show up in listSubplebbits if its db was copied to datapath/subplebbits`, async () => {
        await copyDbToDataPath(databases[0]);
        const listedSubs = await plebbit.listSubplebbits();
        expect(listedSubs).to.include(databases[0].address);
    });
});

describe("DB Migration", () => {
    let plebbit;

    before(async () => {
        plebbit = await mockPlebbit(globalThis["window"]?.plebbitDataPath);
    });

    databases.map((database) =>
        it(`Can migrate from DB version ${database.version} to ${plebbitVersion.default.DB_VERSION}`, async () => {
            // Once we start the sub, it's gonna attempt to migrate to the latest DB version

            const subplebbit = await plebbit.createSubplebbit({ address: database.address });

            const currentDbVersion = await subplebbit.dbHandler.getDbVersion();
            expect(currentDbVersion).to.equal(plebbitVersion.default.DB_VERSION); // If they're equal, that means all tables have been migrated

            subplebbit.setProvideCaptchaCallback(async () => [[], "Challenge skipped"]);

            subplebbit._syncIntervalMs = syncInterval;
            await assert.isFulfilled(subplebbit.start());
            await new Promise((resolve) => subplebbit.once("update", resolve)); // Ensure IPNS is published
            const post = await publishRandomPost(subplebbit.address, plebbit);
            await publishRandomReply(post, plebbit);
            await subplebbit.stop();
        }).timeout(400000)
    );
});
