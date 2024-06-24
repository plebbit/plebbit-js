import signers from "../../fixtures/signers.js";

import { describeSkipIfRpc, mockPlebbit, mockRemotePlebbit } from "../../../dist/node/test/test-util.js";

import * as remeda from "remeda";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);
const { expect, assert } = chai;

describeSkipIfRpc(`subplebbit.clients.chainProviders`, async () => {
    let plebbit, remotePlebbit;
    before(async () => {
        plebbit = await mockPlebbit();
        remotePlebbit = await mockRemotePlebbit();
    });
    it(`subplebbit.clients.chainProviders[url].state is stopped by default`, async () => {
        const mockSub = await plebbit.getSubplebbit(signers[0].address);
        expect(Object.keys(mockSub.clients.chainProviders).length).to.equal(1);
        for (const chain of Object.keys(mockSub.clients.chainProviders)) {
            expect(Object.keys(mockSub.clients.chainProviders[chain]).length).to.be.greaterThan(0);
            for (const chainUrl of Object.keys(mockSub.clients.chainProviders[chain]))
                expect(mockSub.clients.chainProviders[chain][chainUrl].state).to.equal("stopped");
        }
    });

    it(`Correct order of chainProviders state when updating a subplebbit that was created with plebbit.createSubplebbit({address})`, async () => {
        const sub = await remotePlebbit.createSubplebbit({ address: "plebbit.eth" });

        const expectedStates = ["resolving-subplebbit-address", "stopped"];

        const recordedStates = [];

        const chainProviderUrl = Object.keys(sub.clients.chainProviders.eth)[0];
        sub.clients.chainProviders["eth"][chainProviderUrl].on("statechange", (newState) => recordedStates.push(newState));

        sub.update();

        await new Promise((resolve) => sub.once("update", resolve));

        await sub.stop();

        expect(recordedStates.slice(0, 2)).to.deep.equal(expectedStates);
    });
});
