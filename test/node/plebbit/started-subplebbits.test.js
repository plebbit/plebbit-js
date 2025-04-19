import { itSkipIfRpc, mockPlebbit, resolveWhenConditionIsTrue } from "../../../dist/node/test/test-util.js";
import { expect } from "chai";

// when it comes to _startedSubplebbits with RPC, we need to test it differently
// localSubplebbit.update() will not use _startedSubplebbits, it will create a new subscription and let the RPC server handle the rest
describe(`plebbit._startedSubplebbits`, () => {
    let plebbit;
    beforeEach(async () => {
        plebbit = await mockPlebbit();
    });
    afterEach(async () => {
        try {
            await plebbit.destroy();
        } catch  {}
    });

    it(`sub.start() should add the subplebbit to plebbit._startedSubplebbits. stop() should remove it`, async () => {
        const subplebbit = await plebbit.createSubplebbit();
        await subplebbit.start();
        expect(plebbit._startedSubplebbits[subplebbit.address]).to.exist;
        await subplebbit.stop();
        expect(plebbit._startedSubplebbits[subplebbit.address]).to.not.exist;
    });

    itSkipIfRpc(`localSubplebbit.update() should use the subplebbit in plebbit._startdSubplebbits`, async () => {
        const startedSubplebbit = await plebbit.createSubplebbit();
        await startedSubplebbit.start();
        const updateListenersBeforeUpdate = startedSubplebbit.listeners("update").length;

        const updatingSubplebbit = await plebbit.createSubplebbit({ address: startedSubplebbit.address });
        await updatingSubplebbit.update();
        await resolveWhenConditionIsTrue(updatingSubplebbit, () => updatingSubplebbit.updatedAt);
        expect(updatingSubplebbit.address).to.equal(startedSubplebbit.address);

        expect(startedSubplebbit.listeners("update").length).to.be.greaterThan(updateListenersBeforeUpdate); // should use the subplebbit in plebbit._startedSubplebbits

        await updatingSubplebbit.stop();
        expect(startedSubplebbit.listeners("update").length).to.equal(updateListenersBeforeUpdate); // should not use the subplebbit in plebbit._startedSubplebbits

        expect(plebbit._startedSubplebbits[startedSubplebbit.address]).to.exist;
    });

    itSkipIfRpc(`localSubplebbit.update() should switch to loading from DB if the started subplebbit stops running`, async () => {
        const startedSubplebbit = await plebbit.createSubplebbit();
        await startedSubplebbit.start();

        const updatingSubplebbit = await plebbit.createSubplebbit({ address: startedSubplebbit.address });
        await updatingSubplebbit.update();
        await resolveWhenConditionIsTrue(updatingSubplebbit, () => updatingSubplebbit.updatedAt);
        expect(updatingSubplebbit._mirroredStartedOrUpdatingSubplebbit?.subplebbit.address).to.equal(startedSubplebbit.address);
        expect(updatingSubplebbit.address).to.equal(startedSubplebbit.address);
        expect(plebbit._updatingSubplebbits[startedSubplebbit.address]).to.not.exist; // should use the started subplebbit

        // updatingSubplebbit is using startedSubplebbit
        // stop startedSubplebbit
        await startedSubplebbit.stop();
        await new Promise((resolve) => setTimeout(resolve, 1000));
        expect(plebbit._startedSubplebbits[startedSubplebbit.address]).to.not.exist;
        expect(updatingSubplebbit._mirroredStartedOrUpdatingSubplebbit?.subplebbit.address).to.not.exist; // should start using DB
        expect(plebbit._updatingSubplebbits[startedSubplebbit.address]).to.exist; // should use the db now

        const subToEdit = await plebbit.createSubplebbit({ address: startedSubplebbit.address });
        await subToEdit.edit({ title: "new title" }); // will edit the db

        // wait for updatingSubplebbit to emit an update with the new edit props
        await resolveWhenConditionIsTrue(updatingSubplebbit, () => updatingSubplebbit.title === "new title");
        expect(updatingSubplebbit.title).to.equal("new title");
        expect(plebbit._updatingSubplebbits[startedSubplebbit.address]).to.exist; // should not use the db now

        await plebbit.destroy();

        expect(plebbit._startedSubplebbits[startedSubplebbit.address]).to.not.exist;
        expect(plebbit._updatingSubplebbits[startedSubplebbit.address]).to.not.exist;
    });

    it(`calling subplebbit.delete() will delete the subplebbit from _startedSubplebbits`, async () => {
        const sub = await plebbit.createSubplebbit();
        await sub.start();
        expect(plebbit._startedSubplebbits[sub.address]).to.exist;

        await sub.delete();
        expect(plebbit._startedSubplebbits[sub.address]).to.not.exist;
        expect(plebbit._updatingSubplebbits[sub.address]).to.not.exist;
    });

    it(`calling subplebbit.delete() on an instance that's updating from running subplebbit will delete the subplebbit from _startedSubplebbits`, async () => {
        const sub = await plebbit.createSubplebbit();
        await sub.start();
        expect(plebbit._startedSubplebbits[sub.address]).to.exist;

        const updatingSubplebbit = await plebbit.createSubplebbit({ address: sub.address });
        await updatingSubplebbit.update();
        await resolveWhenConditionIsTrue(updatingSubplebbit, () => updatingSubplebbit.updatedAt);
        await updatingSubplebbit.delete();

        expect(plebbit._updatingSubplebbits[sub.address]).to.not.exist;
    });
});
