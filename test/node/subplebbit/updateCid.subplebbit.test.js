import { expect } from "chai";
import { mockPlebbit, resolveWhenConditionIsTrue } from "../../../dist/node/test/test-util.js";
import { describe, beforeAll, afterAll } from "vitest";
describe.concurrent(`Subplebbit.updateCid`, async () => {
    let plebbit;
    beforeAll(async () => {
        plebbit = await mockPlebbit();
    });

    afterAll(async () => {
        await plebbit.destroy();
    });

    it(`subplebbit.updateCid gets updated when local-subplebbit publishes a new record`, async () => {
        const sub = await plebbit.createSubplebbit({});
        expect(sub.updateCid).to.be.undefined;

        await sub.start();
        await resolveWhenConditionIsTrue({ toUpdate: sub, predicate: () => typeof sub.updatedAt === "number" }); // wait until we publish a new record
        expect(sub.updateCid).to.be.a("string");

        await sub.delete();
    });
    it(`subplebbit.updateCid is defined when creating an instance of an existing local subplebbit`, async () => {
        const sub = await plebbit.createSubplebbit({});
        expect(sub.updateCid).to.be.undefined;

        await sub.start();
        await resolveWhenConditionIsTrue({ toUpdate: sub, predicate: () => typeof sub.updatedAt === "number" }); // wait until we publish a new record
        expect(sub.updateCid).to.be.a("string");

        const recreatedSub = await plebbit.createSubplebbit({ address: sub.address });
        expect(recreatedSub.updateCid).to.equal(sub.updateCid);

        await sub.delete();
    });

    it(`subplebbit.updateCid is part of subplebbit.toJSON()`, async () => {
        const sub = await plebbit.createSubplebbit({});
        expect(sub.updateCid).to.be.undefined;

        await sub.start();
        await resolveWhenConditionIsTrue({ toUpdate: sub, predicate: () => typeof sub.updatedAt === "number" }); // wait until we publish a new record

        const subJson = JSON.parse(JSON.stringify(sub));
        expect(subJson.updateCid).to.be.a("string");
        await sub.delete();
    });
});
