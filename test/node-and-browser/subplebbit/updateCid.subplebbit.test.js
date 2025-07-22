import { expect } from "chai";
import { getAvailablePlebbitConfigsToTestAgainst, resolveWhenConditionIsTrue, createMockedSubplebbitIpns } from "../../../dist/node/test/test-util.js";
getAvailablePlebbitConfigsToTestAgainst().map((config) =>
    describe(`subplebbit.updateCid (Remote) - ${config.name}`, async () => {
        let plebbit;
        let subAddress;

        before(async () => {
            plebbit = await config.plebbitInstancePromise();
            const ipnsObj = await createMockedSubplebbitIpns({});
            subAddress = ipnsObj.subplebbitRecord.address;
        });

        after(async () => {
            await plebbit.destroy();
        });

        it(`subplebbit.updateCid is defined after first update event`, async () => {
            const sub = await plebbit.createSubplebbit({ address: subAddress });
            expect(sub.updateCid).to.be.undefined;

            await sub.update();
            await resolveWhenConditionIsTrue(sub, () => typeof sub.updatedAt === "number");
            expect(sub.updateCid).to.be.a("string");

            await sub.stop();
        });

        it(`subplebbit.updateCid is defined after plebbit.getSubplebbit`, async () => {
            const sub = await plebbit.getSubplebbit(subAddress);
            expect(sub.updateCid).to.be.a("string");
        });

        it(`subplebbit.updateCid is part of subplebbit.toJSON()`, async () => {
            const subJson = JSON.parse(JSON.stringify(await plebbit.getSubplebbit(subAddress)));
            expect(subJson.updateCid).to.be.a("string");
        });
    })
);
