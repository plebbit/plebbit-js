import chai from "chai";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);
const { expect, assert } = chai;
import signers from "../../fixtures/signers";

import path from "path";
import fs from "fs";
import tempy from "tempy";
import {
    mockPlebbit,
    generateMockPost,
    publishWithExpectedResult,
    describeSkipIfRpc,
    waitUntilPlebbitSubplebbitsIncludeSubAddress
} from "../../../dist/node/test/test-util";

import plebbitVersion from "../../../dist/node/version";

const getTemporaryPlebbitOptions = () => {
    return {
        dataPath: tempy.directory(),
        kuboRpcClientsOptions: ["http://localhost:15004/api/v0"],
        pubsubHttpClientsOptions: ["http://localhost:15005/api/v0"]
    };
};

const getDatabasesToMigrate = () => {
    const dbRootPath = path.join(process.cwd(), "test", "fixtures", "subplebbits_dbs");
    if (!fs.existsSync(dbRootPath)) return [];
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

describeSkipIfRpc(`DB importing`, async () => {
    let plebbit;

    before(async () => {
        plebbit = await mockPlebbit(getTemporaryPlebbitOptions());
    });

    it(`Subplebbit will show up in plebbit.subplebbits if its db was copied to datapath/subplebbits`, async () => {
        expect(plebbit.subplebbits).to.not.include(signers[0].address);

        const regularPlebbit = await mockPlebbit();
        const databaseToMigrate = {
            address: signers[0].address,
            path: path.join(regularPlebbit.dataPath, "subplebbits", signers[0].address)
        };
        await copyDbToDataPath(databaseToMigrate, plebbit);
        await waitUntilPlebbitSubplebbitsIncludeSubAddress(plebbit, databaseToMigrate.address);
        expect(plebbit.subplebbits).to.include(databaseToMigrate.address);
    });

    it(`Can import a subplebbit by copying its sql file to datapath/subplebbits`, async () => {
        const regularPlebbit = await mockPlebbit();
        const tempPlebbit = await mockPlebbit(getTemporaryPlebbitOptions());
        const srcDbPath = path.join(regularPlebbit.dataPath, "subplebbits", signers[0].address);
        await fs.promises.cp(srcDbPath, path.join(tempPlebbit.dataPath, "subplebbits", signers[0].address));
        await waitUntilPlebbitSubplebbitsIncludeSubAddress(tempPlebbit, signers[0].address);
        // Should be included in tempPlebbit.subplebbits now
        const subplebbit = await tempPlebbit.createSubplebbit({ address: signers[0].address });
        await subplebbit.edit({
            settings: { ...subplebbit.settings, challenges: [{ name: "question", options: { question: "1+1=?", answer: "2" } }] }
        }); // We want this sub to have a full challenge exchange to test all db tables
        expect(subplebbit.updatedAt).to.be.a("number"); // Should be fetched from db

        await subplebbit.start();
        await new Promise((resolve) => subplebbit.once("update", resolve));
        const currentDbVersion = await subplebbit._dbHandler.getDbVersion();
        expect(currentDbVersion).to.equal(plebbitVersion.DB_VERSION);

        const mockPost = await generateMockPost(subplebbit.address, tempPlebbit);
        mockPost.once("challenge", async (challengeMsg) => {
            await mockPost.publishChallengeAnswers(["2"]); // hardcode answer here
        });

        await publishWithExpectedResult(mockPost, true);

        await subplebbit.delete();
    });
});

describeSkipIfRpc("DB Migration", () => {
    const databasesToMigrate = getDatabasesToMigrate();

    databasesToMigrate.map((databaseInfo) =>
        it(`Can migrate from DB version ${databaseInfo.version} to ${plebbitVersion.DB_VERSION} - address (${databaseInfo.address})`, async () => {
            // Once we start the sub, it's gonna attempt to migrate to the latest DB version

            const plebbit = await mockPlebbit(getTemporaryPlebbitOptions());

            console.log(
                `We're using datapath (${plebbit.dataPath}) For testing migration from db version (${databaseInfo.version}) to ${plebbitVersion.DB_VERSION}`
            );
            await copyDbToDataPath(databaseInfo, plebbit);

            await waitUntilPlebbitSubplebbitsIncludeSubAddress(plebbit, databaseInfo.address);

            const subplebbit = await plebbit.createSubplebbit({ address: databaseInfo.address });
            expect(subplebbit.started).to.be.a("boolean"); // make sure it's creating a local sub instance

            await assert.isFulfilled(subplebbit.start());

            await new Promise((resolve) => subplebbit.once("update", resolve)); // Ensure IPNS is published
            const mockPost = await generateMockPost(subplebbit.address, plebbit);
            mockPost.once("challenge", async (challengeMsg) => {
                await mockPost.publishChallengeAnswers(["2"]); // hardcode answer here
            });

            await publishWithExpectedResult(mockPost, true);

            await mockPost.update();
            await new Promise((resolve) => mockPost.once("update", resolve));
            expect(mockPost.updatedAt).to.be.a("number");
            await mockPost.stop();

            await subplebbit.delete();
        }).timeout(400000)
    );
});
