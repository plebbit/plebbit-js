import signers from "../../fixtures/signers.js";
import { messages } from "../../../dist/node/errors.js";

import { getRemotePlebbitConfigs, isRpcFlagOn, mockPlebbit, mockRemotePlebbit } from "../../../dist/node/test/test-util.js";

import * as remeda from "remeda";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);
const { expect, assert } = chai;
import validSubplebbitFixture from "../../fixtures/valid_subplebbit.json" assert { type: "json" };

const subplebbitAddress = signers[0].address;

getRemotePlebbitConfigs().map((config) =>
    describe(`plebbit.createSubplebbit - Remote (${config.name})`, async () => {
        let plebbit;

        before(async () => {
            plebbit = await config.plebbitInstancePromise();
        });

        it(`subplebbit = await createSubplebbit(await getSubplebbit(address))`, async () => {
            const loadedSubplebbit = await plebbit.getSubplebbit(subplebbitAddress);
            const createdSubplebbit = await plebbit.createSubplebbit(loadedSubplebbit);
            expect(loadedSubplebbit.toJSON()).to.deep.equal(createdSubplebbit.toJSON());
            expect(loadedSubplebbit.toJSONIpfs()).to.deep.equal(createdSubplebbit.toJSONIpfs());
        });

        it.skip(`subplebbit = await createSubplebbit({...await getSubplebbit()})`, async () => {
            // This test will fail because plebbit.createSubplebbit doesn't accept spread
            const loadedSubplebbit = await plebbit.getSubplebbit(subplebbitAddress);
            const spread = { ...loadedSubplebbit };
            const createdSubplebbit = await plebbit.createSubplebbit(spread);
            expect(loadedSubplebbit.toJSON()).to.deep.equal(createdSubplebbit.toJSON());
            expect(loadedSubplebbit.toJSONIpfs()).to.deep.equal(createdSubplebbit.toJSONIpfs());
        });

        it(`subplebbit = await createSubplebbit(JSON.parse(JSON.stringify(await getSubplebbit())))`, async () => {
            const loadedSubplebbit = await plebbit.getSubplebbit(subplebbitAddress);
            const createdSubplebbit = await plebbit.createSubplebbit(JSON.parse(JSON.stringify(loadedSubplebbit)));
            const loadedSubJson = loadedSubplebbit.toJSON();
            const createdSubJson = createdSubplebbit.toJSON();
            expect(remeda.omit(loadedSubJson, ["posts"])).to.deep.equal(remeda.omit(createdSubplebbit.toJSON(), ["posts"]));
            expect(loadedSubJson.posts.pageCids).to.deep.equal(createdSubJson.posts.pageCids);

            for (let i = 0; i < loadedSubJson.posts.pages.hot.comments.length; i++)
                expect(loadedSubJson.posts.pages.hot.comments[i]).to.deep.equal(createdSubJson.posts.pages.hot.comments[i]);
        });

        it(`Sub JSON props does not change by creating a Subplebbit object via plebbit.createSubplebbit`, async () => {
            const subJson = remeda.clone(validSubplebbitFixture);
            const subObj = await plebbit.createSubplebbit(remeda.clone(validSubplebbitFixture));
            expect(subJson.lastPostCid).to.equal(subObj.lastPostCid).and.to.be.a("string");
            expect(subJson.pubsubTopic).to.equal(subObj.pubsubTopic).and.to.be.a("string");
            expect(subJson.address).to.equal(subObj.address).and.to.be.a("string");
            expect(subJson.statsCid).to.equal(subObj.statsCid).and.to.be.a("string");
            expect(subJson.createdAt).to.equal(subObj.createdAt).and.to.be.a("number");
            expect(subJson.updatedAt).to.equal(subObj.updatedAt).and.to.be.a("number");
            expect(subJson.encryption).to.deep.equal(subObj.encryption).and.to.be.a("object");
            expect(subJson.roles).to.deep.equal(subObj.roles).and.to.be.a("object");
            expect(subJson.signature).to.deep.equal(subObj.signature).and.to.be.a("object");
            expect(subJson.protocolVersion).to.equal(subObj.protocolVersion).and.to.be.a("string");

            expect(subJson.posts.pageCids).to.deep.equal(subObj.posts.pageCids).and.to.be.a("object");

            for (const pageKey of Object.keys(subJson.posts.pages)) {
                const subJsonComments = await Promise.all(
                    subJson.posts.pages[pageKey].comments.map((comment) => plebbit.createComment(comment.comment)) // Load CommentIpfs
                );

                for (let i = 0; i < subJsonComments.length; i++)
                    await subJsonComments[i]._initCommentUpdate(subJson.posts.pages[pageKey].comments[i].update);

                expect(subJsonComments.map((c) => c.toJSON())).to.deep.equal(subObj.posts.pages[pageKey].comments.map((c) => c.toJSON()));
            }
        });

        it("Remote subplebbit instance created with only address prop can call getPage", async () => {
            const actualSub = await plebbit.getSubplebbit(subplebbitAddress);
            expect(actualSub.createdAt).to.be.a("number");

            expect(actualSub.posts.pages.hot).to.be.a("object");
            const pageCid = actualSub.posts.pageCids.new; // get it somehow
            expect(pageCid).to.be.a("string");
            const newSubplebbit = await plebbit.createSubplebbit({ address: actualSub.address });
            expect(newSubplebbit.createdAt).to.be.undefined;

            const page = await newSubplebbit.posts.getPage(pageCid);
            expect(page.comments.length).to.be.greaterThan(0);
        });
    })
);

describe(`plebbit.createSubplebbit - (remote) - errors`, async () => {
    let plebbit;

    before(async () => {
        plebbit = await mockPlebbit();
    });
    it(`plebbit.createSubplebbit({address}) throws if address if ENS and has a capital letter`, async () => {
        await assert.isRejected(plebbit.createSubplebbit({ address: "testSub.eth" }), messages.ERR_ENS_ADDRESS_HAS_CAPITAL_LETTER);
    });

    it("plebbit.createSubplebbit({address}) throws if subplebbit address isn't an ipns or domain", async () => {
        const invalidAddress = "0xdeadbeef";
        await assert.isRejected(plebbit.createSubplebbit({ address: invalidAddress }), messages.ERR_INVALID_SUBPLEBBIT_ADDRESS);
    });
    if (!isRpcFlagOn() && isRunningInBrowser())
        it(`plebbit.createSubplebbit({}) should throw if no rpc and on browser`, async () => {
            try {
                await plebbit.createSubplebbit({});
                expect.fail("should fail");
            } catch (e) {
                expect.fail("should complete this test later");
                debugger;
            }
        });
});

describe(`plebbit.createSubplebbit - Backward Compatiblity`, async () => {});
