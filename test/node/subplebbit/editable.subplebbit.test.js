import { expect } from "chai";
import { mockPlebbit } from "../../../dist/node/test/test-util.js";
describe(`subplebbit.editable`, async () => {
    let plebbit;

    before(async () => {
        plebbit = await mockPlebbit();
    });

    after(async () => {
        await plebbit.destroy();
    });

    it(`subplebbit.editable is up to date after creating a new subplebbit`, async () => {
        const title = "Test title" + Date.now();
        const sub = await plebbit.createSubplebbit({ title });
        expect(sub.editable.title).to.equal(title);
    });
    it(`subplebbit.editable is up to date after calling subplebbit.edit()`, async () => {
        const sub = await plebbit.createSubplebbit({});
        expect(sub.title).to.be.undefined;
        const title = "Test title" + Date.now();
        await sub.edit({ title });
        expect(sub.editable.title).to.equal(title);
    });
    it(`subplebbit.editable is up to date when loading local sub`, async () => {
        const title = "Test Title" + Date.now();
        const sub = await plebbit.createSubplebbit({ title });

        const recreatedSub = await plebbit.createSubplebbit({ address: sub.address });
        expect(recreatedSub.editable.title).to.equal(title);
    });
});
