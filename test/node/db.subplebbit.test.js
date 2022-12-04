const Plebbit = require("../../dist/node");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const { expect, assert } = chai;

const { mockPlebbit } = require("../../dist/node/test/test-util");
const path = require("path");
const fs = require("fs");
const { generateMockPost, generateMockComment } = require("../../dist/node/test/test-util");

const pathToDbFixtureVersionTwo = "test/fixtures/subplebbit_db_version_2/Qmd3ts5tdvGztqkb3Uuir3i6pLXgpaZ7N5kvgJvSeYFnZ4";

if (globalThis["navigator"]?.userAgent?.includes("Electron")) Plebbit.setNativeFunctions(window.plebbitJsNativeFunctions);

const syncInterval = 300;

describe(`DB importing`, async () => {
    let plebbit;

    before(async () => {
        plebbit = await mockPlebbit(globalThis["window"]?.plebbitDataPath);
    });

    it(`Subplebbit will show up in listSubplebbits if its db was copied to datapath/subplebbits`, async () => {
        const subAddress = path.basename(pathToDbFixtureVersionTwo);
        const newPath = path.join(plebbit.dataPath, "subplebbits", subAddress);
        fs.cpSync(pathToDbFixtureVersionTwo, newPath);
        const listedSubs = await plebbit.listSubplebbits();
        expect(listedSubs).to.include(subAddress);
    });
});

describe("DB Migration", () => {
    let plebbit;

    before(async () => {
        plebbit = await mockPlebbit(globalThis["window"]?.plebbitDataPath);
    });

    it(`Can migrate from DB version 2 to 3`, async () => {
        const subAddress = path.basename(pathToDbFixtureVersionTwo); // This sub has a DB version 2
        // Once we start the sub, it's gonna attempt to migrate to the latest DB version (3 currently)

        const subplebbit = await plebbit.createSubplebbit({ address: subAddress });

        const currentDbVersion = await subplebbit.dbHandler.getDbVersion();
        expect(currentDbVersion).to.equal(3); // If they're equal, that means all tables have been migrated

        subplebbit.setProvideCaptchaCallback(async () => [[], "Challenge skipped"]);

        subplebbit._syncIntervalMs = syncInterval;
        assert.isFulfilled(subplebbit.start());

        const commentToPostUnder = await plebbit.createComment(subplebbit.posts.pages.hot.comments[0]);
        commentToPostUnder._updateIntervalMs = syncInterval;

        const mockComment = await generateMockComment(commentToPostUnder, plebbit);
        await mockComment.publish();

        await new Promise(async (resolve) => {
            await commentToPostUnder.update();
            commentToPostUnder.once("update", resolve);
        });
    });
});
