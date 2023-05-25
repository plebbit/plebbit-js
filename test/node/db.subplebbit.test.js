const Plebbit = require("../../dist/node");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const { expect, assert } = chai;
const tempy = require("tempy");

const path = require("path");
const fs = require("fs");
const { mockPlebbit, publishRandomReply, publishRandomPost } = require("../../dist/node/test/test-util");

const plebbitVersion = require("../../dist/node/version");

const databases = [{ version: 5, address: "12D3KooWN5rLmRJ8fWMwTtkDN7w2RgPPGRM4mtWTnfbjpi1Sh7zR" }];
if (globalThis["navigator"]?.userAgent?.includes("Electron")) Plebbit.setNativeFunctions(window.plebbitJsNativeFunctions);

const plebbitOptions = {
    dataPath: tempy.directory(),
    ipfsHttpClientsOptions: ["http://localhost:15004/api/v0"],
    pubsubHttpClientsOptions: ["http://localhost:15005/api/v0"]
};
console.log(`PlebbitOptions for db.subplebbit.test.js`, plebbitOptions);
describe(`DB importing`, async () => {
    let plebbit;

    const copyDbToDataPath = async (database) => {
        const dbPath = path.join(process.cwd(), "test", "fixtures", "subplebbits_dbs", `version_${database.version}`, database.address);

        const subAddress = path.basename(dbPath);
        const newPath = path.join(plebbit.dataPath, "subplebbits", subAddress);
        await fs.promises.cp(dbPath, newPath);
    };

    before(async () => {
        plebbit = await mockPlebbit(plebbitOptions);
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
        plebbit = await mockPlebbit(plebbitOptions);
    });

    databases.map((database) =>
        it(`Can migrate from DB version ${database.version} to ${plebbitVersion.default.DB_VERSION}`, async () => {
            // Once we start the sub, it's gonna attempt to migrate to the latest DB version

            const subplebbit = await plebbit.createSubplebbit({ address: database.address });

            subplebbit.setProvideCaptchaCallback(async () => [[], "Challenge skipped"]);

            await assert.isFulfilled(subplebbit.start());
            const currentDbVersion = await subplebbit.dbHandler.getDbVersion();
            expect(currentDbVersion).to.equal(plebbitVersion.default.DB_VERSION); // If they're equal, that means all tables have been migrated

            await new Promise((resolve) => subplebbit.once("update", resolve)); // Ensure IPNS is published
            const post = await publishRandomPost(subplebbit.address, plebbit);
            await publishRandomReply(post, plebbit);
            await subplebbit.stop();
        }).timeout(400000)
    );
});
