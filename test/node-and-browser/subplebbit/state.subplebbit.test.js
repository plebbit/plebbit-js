import { expect } from "chai";
import { getRemotePlebbitConfigs } from "../../../dist/node/test/test-util.js";
import signers from "../../fixtures/signers.js";
const subplebbitAddress = signers[0].address;
getRemotePlebbitConfigs().map((config) => {
    let plebbit;
    describe(`subplebbit.state`, () => {
        beforeEach(async () => {
            plebbit = await config.plebbitInstancePromise();
        });

        afterEach(async () => {
            try {
                await plebbit.destroy();
            } catch {}
        });

        it(`subplebbit.state is stopped when created`, async () => {
            const sub = await plebbit.createSubplebbit({ address: subplebbitAddress });
            expect(sub.state).to.equal("stopped");
        });

        it(`subplebbit.state is stopped when plebbit.destroy() is called`, async () => {
            const sub = await plebbit.createSubplebbit({ address: subplebbitAddress });
            await sub.update();
            await plebbit.destroy();
            expect(sub.state).to.equal("stopped");
        });

        it(`subplebbit.state is updating when updating`, async () => {
            const sub = await plebbit.createSubplebbit({ address: subplebbitAddress });
            await sub.update();
            expect(sub.state).to.equal("updating");
        });

        it(`subplebbit.state is stopped when subplebbit.stop() is called`, async () => {
            const sub = await plebbit.createSubplebbit({ address: subplebbitAddress });
            await sub.update();
            expect(sub.state).to.equal("updating");
            await sub.stop();
            expect(sub.state).to.equal("stopped");
        });
    });
});
