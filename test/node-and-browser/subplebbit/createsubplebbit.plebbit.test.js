import { expect } from "chai";
import signers from "../../fixtures/signers.js";
import { messages } from "../../../dist/node/errors.js";

import {
    getRemotePlebbitConfigs,
    isRpcFlagOn,
    jsonifySubplebbitAndRemoveInternalProps,
    isRunningInBrowser,
    addStringToIpfs,
    mockPlebbitV2
} from "../../../dist/node/test/test-util.js";

import { stringify as deterministicStringify } from "safe-stable-stringify";

import * as remeda from "remeda";
import validSubplebbitJsonfiedFixture from "../../fixtures/signatures/subplebbit/valid_subplebbit_jsonfied.json" with { type: "json" };

const subplebbitAddress = signers[0].address;

getRemotePlebbitConfigs().map((config) =>
    describe(`plebbit.createSubplebbit - Remote (${config.name})`, async () => {
        let plebbit;

        before(async () => {
            plebbit = await config.plebbitInstancePromise();
        });

        after(async () => {
            await plebbit.destroy();
        });

        it(`subplebbit = await createSubplebbit(await getSubplebbit(address))`, async () => {
            const loadedSubplebbit = await plebbit.getSubplebbit(subplebbitAddress);
            const createdSubplebbit = await plebbit.createSubplebbit(loadedSubplebbit);
            const createdSubplebbitJson = jsonifySubplebbitAndRemoveInternalProps(createdSubplebbit);
            const loadedSubplebbitJson = jsonifySubplebbitAndRemoveInternalProps(loadedSubplebbit);

            expect(loadedSubplebbitJson).to.deep.equal(createdSubplebbitJson);
        });

        it(`subplebbit = await createSubplebbit({...await getSubplebbit()})`, async () => {
            const loadedSubplebbit = await plebbit.getSubplebbit(subplebbitAddress);
            const spread = { ...loadedSubplebbit };
            const createdFromSpreadSubplebbit = await plebbit.createSubplebbit(spread);
            for (const key of Object.keys(loadedSubplebbit)) {
                expect(deterministicStringify(loadedSubplebbit[key])).to.equal(
                    deterministicStringify(createdFromSpreadSubplebbit[key]),
                    `Mismatch for key: ${key}`
                );
            }

            for (const key of Object.keys(createdFromSpreadSubplebbit)) {
                expect(deterministicStringify(loadedSubplebbit[key])).to.equal(
                    deterministicStringify(createdFromSpreadSubplebbit[key]),
                    `Mismatch for key: ${key}`
                );
            }
        });

        it(`subplebbit = await createSubplebbit(JSON.parse(JSON.stringify(await getSubplebbit())))`, async () => {
            const loadedSubplebbit = await plebbit.getSubplebbit(subplebbitAddress);
            const createdSubplebbit = await plebbit.createSubplebbit(JSON.parse(JSON.stringify(loadedSubplebbit)));
            const loadedSubJson = JSON.parse(JSON.stringify(loadedSubplebbit));
            const createdSubJson = JSON.parse(JSON.stringify(createdSubplebbit));
            expect(deterministicStringify(loadedSubJson)).to.equal(deterministicStringify(createdSubJson));
        });

        it(`Sub JSON props does not change by creating a Subplebbit object via plebbit.createSubplebbit`, async () => {
            const subJson = remeda.clone(validSubplebbitJsonfiedFixture);
            const subObj = await plebbit.createSubplebbit(remeda.clone(validSubplebbitJsonfiedFixture));
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

            const noInternalPropsSubObj = jsonifySubplebbitAndRemoveInternalProps(subObj);
            const noInternalPropsSubJson = jsonifySubplebbitAndRemoveInternalProps(subJson);
            for (const key of Object.keys(noInternalPropsSubJson)) {
                expect(noInternalPropsSubJson[key]).to.deep.equal(noInternalPropsSubObj[key], `Mismatch for key: ${key}`);
            }

            for (const key of Object.keys(noInternalPropsSubObj)) {
                expect(noInternalPropsSubJson[key]).to.deep.equal(noInternalPropsSubObj[key], `Mismatch for key: ${key}`);
            }
        });

        it("Remote subplebbit instance created with only address prop can call getPage", async () => {
            const actualSub = await plebbit.getSubplebbit(subplebbitAddress);
            expect(actualSub.createdAt).to.be.a("number");

            expect(actualSub.posts.pages.hot).to.be.a("object");
            const pageCid = await addStringToIpfs(JSON.stringify({ comments: [actualSub.posts.pages.hot.comments[0].raw] })); // get it somehow
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
        plebbit = await mockPlebbitV2({ remotePlebbit: true });
    });

    after(async () => {
        await plebbit.destroy();
    });

    it(`plebbit.createSubplebbit({address}) throws if address if ENS and has a capital letter`, async () => {
        try {
            await plebbit.createSubplebbit({ address: "testSub.eth" });
            expect.fail("Should have thrown");
        } catch (e) {
            expect(e.code).to.equal("ERR_DOMAIN_ADDRESS_HAS_CAPITAL_LETTER");
        }
    });

    it("plebbit.createSubplebbit({address}) throws if subplebbit address isn't an ipns or domain", async () => {
        const invalidAddress = "0xdeadbeef";
        try {
            await plebbit.createSubplebbit({ address: invalidAddress });
            expect.fail("Should have thrown");
        } catch (e) {
            expect(e.code).to.equal("ERR_INVALID_SUBPLEBBIT_ADDRESS_SCHEMA");
        }
    });
    if (!isRpcFlagOn() && isRunningInBrowser())
        it(`plebbit.createSubplebbit({}) should throw if no rpc and on browser`, async () => {
            try {
                await plebbit.createSubplebbit({});
                expect.fail("should fail");
            } catch (e) {
                expect(e.code).to.equal("ERR_INVALID_CREATE_REMOTE_SUBPLEBBIT_ARGS_SCHEMA");
            }
        });
});
