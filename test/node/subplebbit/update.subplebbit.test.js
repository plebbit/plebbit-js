import { mockPlebbit, publishRandomPost } from "../../../dist/node/test/test-util";
import signers from "../../fixtures/signers";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);
const { expect, assert } = chai;
describe(`subplebbit.update - Local subs`, async () => {
    let plebbit;
    before(async () => {
        plebbit = await mockPlebbit();
    });

    it(`Can receive updates from local sub`, async () => {
        const recreatedSub = await plebbit.createSubplebbit({ address: signers[0].address });
        expect(recreatedSub.state).to.equal("stopped");
        const oldUpdatedAt = JSON.parse(JSON.stringify(recreatedSub.updatedAt));
        await recreatedSub.update();
        await publishRandomPost(recreatedSub.address, plebbit, {}, false);
        await new Promise((resolve) => recreatedSub.once("update", resolve));
        expect(recreatedSub.updatedAt).to.be.greaterThan(oldUpdatedAt);
        await recreatedSub.stop();
    });
});
