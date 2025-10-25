import { expect } from "chai";
import {
    createSubWithNoChallenge,
    getAvailablePlebbitConfigsToTestAgainst,
    mockPlebbit,
    resolveWhenConditionIsTrue
} from "../../../../dist/node/test/test-util.js";
import { getIpnsRecordInLocalKuboNode } from "../../../../dist/node/util.js";

describe(`Generation of new IPNS records`, async () => {
    let plebbit, subplebbit;
    let kuboRpcClientOfSubplebbit;
    let numberOfEmittedUpdates = 0;
    let numberOfEmittedUpdatesWithUpdatedAt = 0;

    before(async () => {
        plebbit = await mockPlebbit();
        kuboRpcClientOfSubplebbit = Object.values(plebbit.clients.kuboRpcClients)[0];

        subplebbit = await createSubWithNoChallenge({}, plebbit);

        subplebbit.setMaxListeners(100);

        subplebbit.on("update", async () => {
            numberOfEmittedUpdates++;
            if (typeof subplebbit.updatedAt === "number") numberOfEmittedUpdatesWithUpdatedAt++;
        });

        await subplebbit.start();

        await resolveWhenConditionIsTrue({ toUpdate: subplebbit, predicate: () => typeof subplebbit.updatedAt === "number" });
    });

    after(async () => {
        await subplebbit.delete();
        await plebbit.destroy();
    });

    it(`IPNS sequence number and value are correct with each update`, async () => {
        // need to have a for loop of 20 iterations

        for (let i = 0; i < 20; i++) {
            subplebbit._subplebbitUpdateTrigger = true;
            await new Promise((resolve) => subplebbit.once("update", resolve));
            const latestIpnsRecord = await getIpnsRecordInLocalKuboNode(kuboRpcClientOfSubplebbit, subplebbit.address);
            expect(latestIpnsRecord.sequence).to.equal(BigInt(numberOfEmittedUpdatesWithUpdatedAt - 1));

            expect(latestIpnsRecord.value).to.equal("/ipfs/" + subplebbit.updateCid);
        }
    });

    // we need to test that IPNS' sequence keeps incrementing
    // we need to test updateCid is also changing on the subplebbit instace
    // need to test that updatedAt keeps increasing
    // they should all match on subplebbit, and on subplebbit from remotePlebbit
});
