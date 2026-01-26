import { beforeAll, afterAll } from "vitest";
import { expect } from "chai";
import { itSkipIfRpc, mockPlebbitV2, resolveWhenConditionIsTrue } from "../../../dist/node/test/test-util.js";

import path from "path";
import fs from "fs";

describe(`subplebbit.delete`, async () => {
    let plebbit, sub;
    beforeAll(async () => {
        plebbit = await mockPlebbitV2({ forceMockPubsub: true, stubStorage: false });

        sub = await plebbit.createSubplebbit();
    });

    afterAll(async () => {
        await plebbit.destroy();
    });

    it(`Deleted sub is not listed in plebbit.subplebbits`, async () => {
        const subs = plebbit.subplebbits;
        expect(subs).to.include(sub.address);
        const subRecreated = await plebbit.createSubplebbit({ address: sub.address });
        await subRecreated.delete();
        await resolveWhenConditionIsTrue({
            toUpdate: plebbit,
            predicate: () => !plebbit.subplebbits.includes(sub.address),
            eventName: "subplebbitschange"
        });
        const subsAfterDeletion = plebbit.subplebbits;
        expect(subsAfterDeletion).to.not.include(sub.address);
    });

    itSkipIfRpc(`Deleted sub ipfs keys are not listed in ipfs node`, async () => {
        const ipfsKeys = await plebbit._clientsManager.getDefaultKuboRpcClient()._client.key.list();
        const subKeyExists = ipfsKeys.some((key) => key.name === sub.ipnsKeyName);
        expect(subKeyExists).to.be.false;
    });

    itSkipIfRpc(`Deleted sub db is moved to datapath/subplebbits/deleted`, async () => {
        const expectedPath = path.join(plebbit.dataPath, "subplebbits", "deleted", sub.address);
        expect(fs.existsSync(expectedPath)).to.be.true;
    });

    itSkipIfRpc(`Deleted sub has no locks in subplebbits directory`, async () => {
        const subFiles = await fs.promises.readdir(path.join(plebbit.dataPath, "subplebbits"));
        const startLockFilename = `${sub.address}.start.lock`;
        const stateLockFilename = `${sub.address}.state.lock`;
        expect(subFiles).to.not.include(startLockFilename);
        expect(subFiles).to.not.include(stateLockFilename);
    });

    it(`Deleting an updating subplebbit will stop the subplebbit`, async () => {
        const updatingSubplebbit = await plebbit.createSubplebbit();
        await updatingSubplebbit.update();
        await updatingSubplebbit.delete();
        expect(updatingSubplebbit.state).to.equal("stopped");
    });
});
