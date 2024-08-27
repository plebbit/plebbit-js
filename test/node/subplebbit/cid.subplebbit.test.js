import { mockPlebbit, resolveWhenConditionIsTrue } from "../../../dist/node/test/test-util.js";
import chai from "chai";

import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);
const { expect, assert } = chai;
describe(`Subplebbit.cid`, async () => {
    let plebbit;
    before(async () => {
        plebbit = await mockPlebbit();
    });
    it(`subplebbit.cid gets updated when local-subplebbit publishes a new record`, async () => {
        const sub = await plebbit.createSubplebbit({});
        expect(sub.cid).to.be.undefined;

        await sub.start();
        await resolveWhenConditionIsTrue(sub, () => typeof sub.updatedAt === "number"); // wait until we publish a new record
        expect(sub.cid).to.be.a("string");

        await sub.delete();
    });
    it(`subplebbit.cid is defined when creating an instance of an existing local subplebbit`, async () => {
        const sub = await plebbit.createSubplebbit({});
        expect(sub.cid).to.be.undefined;

        await sub.start();
        await resolveWhenConditionIsTrue(sub, () => typeof sub.updatedAt === "number"); // wait until we publish a new record
        expect(sub.cid).to.be.a("string");

        const recreatedSub = await plebbit.createSubplebbit({ address: sub.address });
        expect(recreatedSub.cid).to.equal(sub.cid);

        await sub.delete();
    });

    it(`subplebbit.cid is part of subplebbit.toJSON()`, async () => {
        const sub = await plebbit.createSubplebbit({});
        expect(sub.cid).to.be.undefined;

        await sub.start();
        await resolveWhenConditionIsTrue(sub, () => typeof sub.updatedAt === "number"); // wait until we publish a new record

        const subJson = JSON.parse(JSON.stringify(sub));
        expect(subJson.cid).to.be.a("string");
        await sub.delete();
    });
});
