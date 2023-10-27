const Plebbit = require("../../dist/node");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const { expect, assert } = chai;
const signers = require("../fixtures/signers");

const tempy = require("tempy");

const path = require("path");
const fs = require("fs");
const { mockPlebbit, generateMockPost, publishWithExpectedResult, createSubWithNoChallenge } = require("../../dist/node/test/test-util");

const plebbitVersion = require("../../dist/node/version");

const plebbitOptions = {
    dataPath: tempy.directory(),
    ipfsHttpClientsOptions: ["http://localhost:15004/api/v0"],
    pubsubHttpClientsOptions: ["http://localhost:15005/api/v0"]
};
console.log(`PlebbitOptions for db.subplebbit.test.js`, plebbitOptions);

const getDatabasesToMigrate = () => {
    const dbRootPath = path.join(process.cwd(), "test", "fixtures", "subplebbits_dbs");
    const versions = fs.readdirSync(dbRootPath); // version_6, version_7, version_8 etc
    const databasesToMigrate = []; // {version: number; path: string; address: string}[]

    for (const version of versions) {
        const databases = fs.readdirSync(path.join(dbRootPath, version)); // Would give a list of databases

        for (const database of databases) {
            const fullDbPath = path.join(dbRootPath, version, database);
            const versionNumberParsed = parseInt(version.replace(/[^\d.]/g, ""));
            databasesToMigrate.push({ path: fullDbPath, version: versionNumberParsed, address: database });
        }
    }
    return databasesToMigrate;
};

const copyDbToDataPath = async (databaseObj, plebbit) => {
    const newPath = path.join(plebbit.dataPath, "subplebbits", databaseObj.address);
    await fs.promises.cp(databaseObj.path, newPath);
};

//prettier-ignore
if (!process.env["USE_RPC"])
describe(`DB importing`, async () => {
    let plebbit;

    before(async () => {
        plebbit = await mockPlebbit(plebbitOptions);
    });

    it(`Subplebbit will show up in listSubplebbits if its db was copied to datapath/subplebbits`, async () => {
        expect(await plebbit.listSubplebbits()).to.not.include(signers[0].address);

        const regularPlebbit = await mockPlebbit();
        const databaseToMigrate = {
            address: signers[0].address,
            path: path.join(regularPlebbit.dataPath, "subplebbits", signers[0].address)
        };
        await copyDbToDataPath(databaseToMigrate, plebbit);
        const listedSubs = await plebbit.listSubplebbits();
        expect(listedSubs).to.include(databaseToMigrate.address);
    });

    it(`Can import a subplebbit by copying its sql file to datapath/subplebbits`, async () => {
        const regularPlebbit = await mockPlebbit();
        const tempPlebbit = await mockPlebbit({ ...plebbitOptions, dataPath: tempy.directory() });
        const srcDbPath = path.join(regularPlebbit.dataPath, "subplebbits", signers[0].address);
        await fs.promises.cp(srcDbPath, path.join(tempPlebbit.dataPath, "subplebbits", signers[0].address));
        // Should be included in tempPlebbit.listSubplebbits now
        const subplebbit = await tempPlebbit.createSubplebbit({ address: signers[0].address });
        await subplebbit.edit({
            settings: { ...subplebbit.settings, challenges: [{ name: "question", options: { question: "1+1=?", answer: "2" } }] }
        }); // We want this sub to have a full challenge exchange to test all db tables
        expect(subplebbit.updatedAt).to.be.a("number"); // Should be fetched from db

        await subplebbit.start();
        await new Promise((resolve) => subplebbit.once("update", resolve));
        const currentDbVersion = await subplebbit.dbHandler.getDbVersion();
        expect(currentDbVersion).to.equal(plebbitVersion.default.DB_VERSION);

        const mockPost = await generateMockPost(subplebbit.address, tempPlebbit);
        mockPost.once("challenge", async (challengeMsg) => {
            await mockPost.publishChallengeAnswers(["2"]); // hardcode answer here
        });

        await publishWithExpectedResult(mockPost, true);

        await subplebbit.delete();
    });
});

//prettier-ignore
if (!process.env["USE_RPC"])
describe("DB Migration", () => {
    const databasesToMigrate = getDatabasesToMigrate();

    databasesToMigrate.map((databaseInfo) =>
        it(`Can migrate from DB version ${databaseInfo.version} to ${plebbitVersion.default.DB_VERSION} - address (${databaseInfo.address})`, async () => {
            // Once we start the sub, it's gonna attempt to migrate to the latest DB version

            const plebbit = await mockPlebbit({ ...plebbitOptions, dataPath: tempy.directory() });

            console.log(
                `We're using datapath (${plebbit.dataPath}) For testing migration from db version (${databaseInfo.version}) to ${plebbitVersion.default.DB_VERSION}`
            );
            await copyDbToDataPath(databaseInfo, plebbit);

            const subplebbit = await plebbit.createSubplebbit({ address: databaseInfo.address });

            await assert.isFulfilled(subplebbit.start());

            await new Promise((resolve) => subplebbit.once("update", resolve)); // Ensure IPNS is published
            const mockPost = await generateMockPost(subplebbit.address, plebbit);
            mockPost.once("challenge", async (challengeMsg) => {
                await mockPost.publishChallengeAnswers(["2"]); // hardcode answer here
            });

            await publishWithExpectedResult(mockPost, true);

            await subplebbit.delete();
        }).timeout(400000)
    );
});
