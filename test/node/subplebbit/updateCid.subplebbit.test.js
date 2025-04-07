import { expect } from "chai";
import { mockPlebbit, resolveWhenConditionIsTrue } from "../../../dist/node/test/test-util.js";
describe(`Subplebbit.updateCid`, async () => {
    let plebbit;
    before(async () => {
        plebbit = await mockPlebbit();
    });
    it(`subplebbit.updateCid gets updated when local-subplebbit publishes a new record`, async () => {
        const sub = await plebbit.createSubplebbit({});
        expect(sub.updateCid).to.be.undefined;

        await sub.start();
        await resolveWhenConditionIsTrue(sub, () => typeof sub.updatedAt === "number"); // wait until we publish a new record
        expect(sub.updateCid).to.be.a("string");

        await sub.delete();
    });
    it(`subplebbit.updateCid is defined when creating an instance of an existing local subplebbit`, async () => {
        const sub = await plebbit.createSubplebbit({});
        expect(sub.updateCid).to.be.undefined;

        await sub.start();
        await resolveWhenConditionIsTrue(sub, () => typeof sub.updatedAt === "number"); // wait until we publish a new record
        expect(sub.updateCid).to.be.a("string");

        const recreatedSub = await plebbit.createSubplebbit({ address: sub.address });
        expect(recreatedSub.updateCid).to.equal(sub.updateCid);

        await sub.delete();
    });

    it(`subplebbit.updateCid is part of subplebbit.toJSON()`, async () => {
        const sub = await plebbit.createSubplebbit({});
        expect(sub.updateCid).to.be.undefined;

        await sub.start();
        await resolveWhenConditionIsTrue(sub, () => typeof sub.updatedAt === "number"); // wait until we publish a new record

        const subJson = JSON.parse(JSON.stringify(sub));
        expect(subJson.updateCid).to.be.a("string");
        await sub.delete();
    });
});
