import {
    createSubWithNoChallenge,
    isRpcFlagOn,
    mockPlebbit,
    publishRandomPost,
    resolveWhenConditionIsTrue
} from "../../../dist/node/test/test-util.js";
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
        expect(recreatedSub.started).to.be.a("boolean"); // make sure it's creating a local sub, not remote

        const oldUpdatedAt = JSON.parse(JSON.stringify(recreatedSub.updatedAt));
        await recreatedSub.update();
        await publishRandomPost(recreatedSub.address, plebbit);
        await resolveWhenConditionIsTrue(recreatedSub, () => recreatedSub.updatedAt !== oldUpdatedAt);
        expect(recreatedSub.updatedAt).to.be.greaterThan(oldUpdatedAt);
        await recreatedSub.stop();
        await sub.delete();
    });

    it(`A local subplebbit is not emitting updates unneccessarily (after first update)`, async () => {
        const sub = await createSubWithNoChallenge({}, plebbit);
        expect(sub.started).to.be.a("boolean"); // make sure it's creating a local sub, not remote
        await sub.start();
        await resolveWhenConditionIsTrue(sub, () => typeof sub.updatedAt === "number");

        const recreatedSub = await plebbit.createSubplebbit({ address: sub.address });
        const oldUpdatedAt = JSON.parse(JSON.stringify(recreatedSub.updatedAt));
        expect(oldUpdatedAt).to.be.a("number");
        expect(oldUpdatedAt).to.equal(sub.updatedAt);

        await recreatedSub.update();
        let updatesEmitted = 0;

        const failPromise = new Promise((resolve, reject) =>
            recreatedSub.on("update", () => {
                updatesEmitted++;
                if (recreatedSub.updatedAt === oldUpdatedAt && updatesEmitted > 1)
                    reject(new Error("It should not emit an update if there's no new info"));
            })
        );

        try {
            await Promise.race([failPromise, new Promise((resolve) => setTimeout(resolve, plebbit.publishInterval * 3))]);
        } catch (e) {
            throw e;
        } finally {
            await sub.delete();
            await recreatedSub.stop();
        }
    });

    it(`A local subplebbit is not emitted updates unnecessarily (before first update)`, async () => {
        const sub = await createSubWithNoChallenge({}, plebbit);
        expect(sub.started).to.be.a("boolean"); // make sure it's creating a local sub, not remote

        await sub.update();

        let emittedUpdates = 0;
        sub.on("update", () => emittedUpdates++);

        await new Promise((resolve) => setTimeout(resolve, plebbit.publishInterval * 3));

        if (isRpcFlagOn()) expect(emittedUpdates).to.equal(1);
        else expect(emittedUpdates).to.equal(0);

        await sub.delete();
    });
});
