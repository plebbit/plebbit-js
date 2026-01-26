import { beforeAll, afterAll } from "vitest";
import { expect } from "chai";
import { mockPlebbit, createSubWithNoChallenge } from "../../../dist/node/test/test-util.js";

import signers from "../../fixtures/signers.js";
describe(`subplebbit.state`, async () => {
    let plebbit, subplebbit;
    beforeAll(async () => {
        plebbit = await mockPlebbit();
        subplebbit = await createSubWithNoChallenge({}, plebbit);
    });

    afterAll(async () => {
        await subplebbit.delete();
        await plebbit.destroy();
    });

    it(`subplebbit.state defaults to "stopped" if not updating or started`, async () => {
        expect(subplebbit.state).to.equal("stopped");
    });

    it(`subplebbit.state = started if calling start()`, async () => {
        let eventFired = false;
        subplebbit.on("statechange", (newState) => {
            if (newState === "started") eventFired = true;
        });
        await subplebbit.start();
        expect(subplebbit.state).to.equal("started");
        expect(eventFired).to.be.true;
    });

    it(`subplebbit.state = stopped after calling stop()`, async () => {
        let eventFired = false;
        subplebbit.once("statechange", (newState) => {
            expect(newState).to.equal("stopped");
            eventFired = true;
        });
        await subplebbit.stop();
        expect(subplebbit.state).to.equal("stopped");
        expect(eventFired).to.be.true;
    });

    it(`subplebbit.state = updating after calling update()`, async () => {
        let eventFired = false;
        subplebbit.once("statechange", (newState) => {
            expect(newState).to.equal("updating");
            eventFired = true;
        });
        await subplebbit.update();
        expect(subplebbit.state).to.equal("updating");
        expect(eventFired).to.be.true;
    });

    it(`calling update() on a started subplebbit will throw`, async () => {
        const startedSubplebbit = await plebbit.createSubplebbit();
        await startedSubplebbit.start();
        try {
            await startedSubplebbit.update();
            expect.fail("Should have thrown");
        } catch (e) {
            expect(e.code).to.equal("ERR_SUB_ALREADY_STARTED");
        }
        await startedSubplebbit.delete();
    });
});
