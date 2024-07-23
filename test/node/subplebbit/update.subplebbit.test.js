import { createSubWithNoChallenge, mockPlebbit, publishRandomPost, resolveWhenConditionIsTrue } from "../../../dist/node/test/test-util";
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
        const sub = await createSubWithNoChallenge({}, plebbit);
        await sub.start();
        await resolveWhenConditionIsTrue(sub, () => typeof sub.updatedAt === "number");
        const recreatedSub = await plebbit.createSubplebbit({ address: sub.address });
        expect(recreatedSub.state).to.equal("stopped");
        const oldUpdatedAt = JSON.parse(JSON.stringify(recreatedSub.updatedAt));
        await recreatedSub.update();
        await publishRandomPost(recreatedSub.address, plebbit, {}, false);
        await new Promise((resolve) => recreatedSub.once("update", resolve));
        expect(recreatedSub.updatedAt).to.be.greaterThan(oldUpdatedAt);
        await recreatedSub.stop();
        await sub.delete();
    });

    it(`A local subplebbit is not emitting updates unneccessarily`, async () => {
        const sub = await createSubWithNoChallenge({}, plebbit);
        await sub.start();
        await resolveWhenConditionIsTrue(sub, () => typeof sub.updatedAt === "number");

        const recreatedSub = await plebbit.createSubplebbit({ address: sub.address });
        const oldUpdatedAt = JSON.parse(JSON.stringify(recreatedSub.updatedAt));
        expect(oldUpdatedAt).to.equal(sub.updatedAt);

        await recreatedSub.update();

        const failPromise = new Promise((resolve, reject) =>
            recreatedSub.on("update", () => {
                if (recreatedSub.updatedAt === oldUpdatedAt) reject("It should not emit an update if there's no new info");
            })
        );

        try {
            await Promise.race([failPromise, new Promise((resolve) => setTimeout(resolve, plebbit.publishInterval * 2))]);
        } catch (e) {
            throw e;
        } finally {
            await sub.delete();
            await recreatedSub.stop();
        }
    });
});
