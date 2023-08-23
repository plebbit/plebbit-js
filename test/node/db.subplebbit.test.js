const Plebbit = require("../../dist/node");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const { expect, assert } = chai;
const tempy = require("tempy");

const path = require("path");
const fs = require("fs");
const { mockPlebbit, generateMockPost, publishWithExpectedResult } = require("../../dist/node/test/test-util");

const plebbitVersion = require("../../dist/node/version");

if (globalThis["navigator"]?.userAgent?.includes("Electron")) Plebbit.setNativeFunctions(window.plebbitJsNativeFunctions);

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
describe(`DB importing`, async () => {
    let plebbit;

    before(async () => {
        plebbit = await mockPlebbit(plebbitOptions);
    });

    it(`Subplebbit will show up in listSubplebbits if its db was copied to datapath/subplebbits`, async () => {
        const databasesToMigrate = getDatabasesToMigrate();
        await copyDbToDataPath(databasesToMigrate[0], plebbit);
        const listedSubs = await plebbit.listSubplebbits();
        expect(listedSubs).to.include(databasesToMigrate[0].address);
    });
});

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
            subplebbit.setValidateCaptchaAnswerCallback(async (challengeAnswerMessage) => {
                const challengeSuccess = challengeAnswerMessage.challengeAnswers[0] === "1234";
                const challengeErrors = challengeSuccess ? undefined : ["User answered image captcha incorrectly"];
                return [challengeSuccess, challengeErrors];
            });
            const currentDbVersion = await subplebbit.dbHandler.getDbVersion();
            expect(currentDbVersion).to.equal(plebbitVersion.default.DB_VERSION); // If they're equal, that means all tables have been migrated

            await new Promise((resolve) => subplebbit.once("update", resolve)); // Ensure IPNS is published
            const mockPost = await generateMockPost(subplebbit.address, plebbit);
            mockPost.removeAllListeners();

            mockPost.once("challenge", async (challengeMsg) => {
                expect(challengeMsg?.challenges[0]?.challenge).to.be.a("string");
                await mockPost.publishChallengeAnswers(["1234"]); // hardcode answer here
            });

            await publishWithExpectedResult(mockPost, true);

            await subplebbit.stop();
            await subplebbit.delete();
        }).timeout(400000)
    );
});
