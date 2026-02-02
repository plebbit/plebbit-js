import signers from "../../fixtures/signers.js";

import {
    getAvailablePlebbitConfigsToTestAgainst,
    mockPlebbitNoDataPathWithOnlyKuboClient,
    resolveWhenConditionIsTrue
} from "../../../dist/node/test/test-util.js";

import { describe, it, afterAll } from "vitest";

import type { Plebbit as PlebbitType } from "../../../dist/node/plebbit/plebbit.js";
import type { RemoteSubplebbit } from "../../../dist/node/subplebbit/remote-subplebbit.js";

const subplebbitAddress = signers[0].address;

getAvailablePlebbitConfigsToTestAgainst().map((config) =>
    describe(`subplebbit.stop() timing - Remote - ${config.name}`, async () => {
        let plebbit: PlebbitType;

        afterAll(async () => {
            await plebbit.destroy();
        });

        it(`Remote subplebbit stop() after update() should complete within 10s`, async () => {
            plebbit = await config.plebbitInstancePromise();
            const sub = (await plebbit.createSubplebbit({ address: subplebbitAddress })) as RemoteSubplebbit;
            await sub.update();
            await resolveWhenConditionIsTrue({
                toUpdate: sub,
                predicate: async () => typeof sub.updatedAt === "number"
            });
            const startMs = Date.now();
            await sub.stop();
            const elapsed = Date.now() - startMs;
            expect(elapsed).to.be.lessThan(10000);
        });
    })
);

describe(`subplebbit.stop() idempotency`, async () => {
    it(`subplebbit.stop() should be a no-op when state is already "stopped"`, async () => {
        const plebbit = await mockPlebbitNoDataPathWithOnlyKuboClient();
        const sub = await plebbit.createSubplebbit({ address: subplebbitAddress });
        expect(sub.state).to.equal("stopped");
        await sub.stop(); // should not throw
        expect(sub.state).to.equal("stopped");
        await plebbit.destroy();
    });
});
