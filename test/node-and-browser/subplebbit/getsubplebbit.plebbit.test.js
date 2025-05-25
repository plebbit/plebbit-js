import { expect } from "chai";
import signers from "../../fixtures/signers.js";

import { stringify as deterministicStringify } from "safe-stable-stringify";
import { createNewIpns, getRemotePlebbitConfigs } from "../../../dist/node/test/test-util.js";

const ensSubplebbitAddress = "plebbit.eth";
const subplebbitSigner = signers[0];

getRemotePlebbitConfigs().map((config) => {
    describe(`plebbit.getSubplebbit (Remote) - ${config.name}`, async () => {
        let plebbit;
        before(async () => {
            plebbit = await config.plebbitInstancePromise();
        });

        after(async () => {
            await plebbit.destroy();
        });

        it("Can load subplebbit via IPNS address", async () => {
            const loadedSubplebbit = await plebbit.getSubplebbit(subplebbitSigner.address);
            const _subplebbitIpns = loadedSubplebbit.toJSONIpfs();
            expect(_subplebbitIpns.lastPostCid).to.be.a.string;
            expect(_subplebbitIpns.pubsubTopic).to.be.a.string;
            expect(_subplebbitIpns.address).to.be.a.string;
            expect(_subplebbitIpns.statsCid).to.be.a.string;
            expect(_subplebbitIpns.createdAt).to.be.a("number");
            expect(_subplebbitIpns.updatedAt).to.be.a("number");
            expect(_subplebbitIpns.encryption).to.be.a("object");
            expect(_subplebbitIpns.roles).to.be.a("object");
            expect(_subplebbitIpns.signature).to.be.a("object");
            expect(_subplebbitIpns.posts).to.be.a("object");
            // Remove undefined keys from json
            expect(deterministicStringify(loadedSubplebbit.toJSONIpfs())).to.equals(deterministicStringify(_subplebbitIpns));
        });

        it("can load subplebbit with ENS domain via plebbit.getSubplebbit", async () => {
            const subplebbit = await plebbit.getSubplebbit(ensSubplebbitAddress);
            expect(subplebbit.address).to.equal(ensSubplebbitAddress);
            expect(subplebbit.updatedAt).to.be.a("number");
        });

        it(`plebbit.getSubplebbit fails to fetch a sub with ENS address if it has capital letter`, async () => {
            try {
                await plebbit.getSubplebbit("testSub.eth");
                expect.fail("Should have thrown");
            } catch (e) {
                expect(e.code).to.equal("ERR_DOMAIN_ADDRESS_HAS_CAPITAL_LETTER");
            }
        });

        it(`plebbit.getSubplebbit is not fetching subplebbit updates in background after fulfilling its promise`, async () => {
            const loadedSubplebbit = await plebbit.getSubplebbit(subplebbitSigner.address);
            let updatedHasBeenCalled = false;
            loadedSubplebbit._setUpdatingState = async () => {
                updatedHasBeenCalled = true;
            };
            await new Promise((resolve) => setTimeout(resolve, plebbit.updateInterval * 3));
            expect(updatedHasBeenCalled).to.be.false;
        });

        it(`plebbit.getSubplebbit should throw immedietly if it encounters a non retriable error`, async () => {
            const loadedSubplebbit = await plebbit.getSubplebbit(subplebbitSigner.address);
            const ipnsObj = await createNewIpns();
            await ipnsObj.publishToIpns(JSON.stringify({ ...loadedSubplebbit.raw.subplebbitIpfs, updatedAt: 12345 })); // publish invalid signature

            try {
                await plebbit.getSubplebbit(ipnsObj.signer.address);
                expect.fail("should not succeed");
            } catch (e) {
                expect([
                    "ERR_FAILED_TO_FETCH_SUBPLEBBIT_FROM_GATEWAYS",
                    "ERR_THE_SUBPLEBBIT_IPNS_RECORD_POINTS_TO_DIFFERENT_ADDRESS_THAN_WE_EXPECTED"
                ]).to.include(e.code);
            }
        });

        it(`plebbit.getSubplebbit times out if subplebbit does not load`, async () => {
            const doesNotExistSubplebbitAddress = "12D3KooWN5rLmRJ8fWMwTtkDN7w2RgPPGRM4mtWTnfbjpi1Sh7zx"; // random sub address, should not be able to resolve this
            const customPlebbit = await config.plebbitInstancePromise();
            customPlebbit._timeouts["subplebbit-ipns"] = 1 * 1000; // change timeout from 5min to 1s

            try {
                await customPlebbit.getSubplebbit(doesNotExistSubplebbitAddress);
                expect.fail("should not succeed");
            } catch (e) {
                expect([
                    "ERR_FAILED_TO_FETCH_SUBPLEBBIT_FROM_GATEWAYS",
                    "ERR_RESOLVED_IPNS_P2P_TO_UNDEFINED",
                    "ERR_FAILED_TO_RESOLVE_IPNS_VIA_IPFS_P2P"
                ]).to.include(e.code);
            }
        });
    });
});
