import signers from "../../fixtures/signers.js";
import { messages } from "../../../dist/node/errors.js";

import chai from "chai";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);
const { expect, assert } = chai;
import { stringify as deterministicStringify } from "safe-stable-stringify";
import { getRemotePlebbitConfigs } from "../../../dist/node/test/test-util.js";

const ensSubplebbitAddress = "plebbit.eth";
const subplebbitSigner = signers[0];

getRemotePlebbitConfigs().map((config) => {
    describe(`plebbit.getSubplebbit (Remote) - ${config.name}`, async () => {
        let plebbit;
        before(async () => {
            plebbit = await config.plebbitInstancePromise();
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
            await assert.isRejected(plebbit.getSubplebbit("testSub.eth"), messages.ERR_ENS_ADDRESS_HAS_CAPITAL_LETTER);
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
    });
});
