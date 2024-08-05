import signers from "../../fixtures/signers.js";
import { messages } from "../../../dist/node/errors.js";

import {
    getRemotePlebbitConfigs,
    isRpcFlagOn,
    mockPlebbit,
    publishSubplebbitRecordWithExtraProp
} from "../../../dist/node/test/test-util.js";

import { stringify as deterministicStringify } from "safe-stable-stringify";

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
            const jsonfiedSub = JSON.parse(JSON.stringify(loadedSubplebbit));
            const createdSubplebbit = await plebbit.createSubplebbit(jsonfiedSub);
            expect(jsonfiedSub).to.deep.equal(JSON.parse(JSON.stringify(createdSubplebbit)));
        });

        it(`subplebbit = await createSubplebbit({...await getSubplebbit()})`, async () => {
            // This test will fail because plebbit.createSubplebbit doesn't accept spread
            const loadedSubplebbit = await plebbit.getSubplebbit(subplebbitAddress);
            const spread = { ...loadedSubplebbit };
            const createdSubplebbit = await plebbit.createSubplebbit(spread);
            expect(JSON.parse(JSON.stringify(loadedSubplebbit))).to.deep.equal(JSON.parse(JSON.stringify(createdSubplebbit)));
        });

        it(`subplebbit = await createSubplebbit(JSON.parse(JSON.stringify(await getSubplebbit())))`, async () => {
            const loadedSubplebbit = await plebbit.getSubplebbit(subplebbitAddress);
            const createdSubplebbit = await plebbit.createSubplebbit(JSON.parse(JSON.stringify(loadedSubplebbit)));
            const loadedSubJson = JSON.parse(JSON.stringify(loadedSubplebbit));
            const createdSubJson = JSON.parse(JSON.stringify(createdSubplebbit));
            expect(deterministicStringify(loadedSubJson)).to.equal(deterministicStringify(createdSubJson));
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

        describe(`plebbit.createSubplebbit - Backward Compatiblity`, async () => {
            it(`Can create a subplebbit instance with subplebbit record with extra props`, async () => {
                const opts = { includeExtraPropInSignedPropertyNames: true, extraProps: { extraProp: "1234" } };
                const publishedSub = await publishSubplebbitRecordWithExtraProp(opts);

                const remotePlebbit = await config.plebbitInstancePromise();

                const sub = await remotePlebbit.createSubplebbit(publishedSub.subplebbitRecord);

                expect(sub.toJSONIpfs().extraProp).to.equal(publishedSub.subplebbitRecord.extraProp);
                expect(sub.toJSONIpfs()).to.deep.equal(publishedSub.subplebbitRecord);
                expect(sub.extraProp).to.equal(publishedSub.subplebbitRecord.extraProp);

                const recreatedSubFromInstance = await remotePlebbit.createSubplebbit(sub);
                expect(recreatedSubFromInstance.toJSONIpfs()).to.deep.equal(publishedSub.subplebbitRecord);
                expect(JSON.parse(JSON.stringify(recreatedSubFromInstance)).extraProp).to.equal(opts.extraProps.extraProp);
                expect(recreatedSubFromInstance.extraProp).to.equal(publishedSub.subplebbitRecord.extraProp);

                const recreatedSubFromJson = await remotePlebbit.createSubplebbit(JSON.parse(JSON.stringify(sub)));
                expect(JSON.parse(JSON.stringify(recreatedSubFromJson)).extraProp).to.equal(publishedSub.subplebbitRecord.extraProp);
                expect(recreatedSubFromJson.extraProp).to.equal(publishedSub.subplebbitRecord.extraProp);
            });
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
