import {
    mockGatewayPlebbit,
    mockPlebbit,
    mockPlebbitNoDataPathWithOnlyKuboClient,
    resolveWhenConditionIsTrue
} from "../../../dist/node/test/test-util.js";
import { expect } from "chai";

for (let i = 0; i < 100; i++)
    describe(`Gateway loading of local subplebbit IPNS`, async () => {
        let plebbit, subplebbit;
        let gatewayPlebbit;
        let kuboPlebbit;

        before(async () => {
            plebbit = await mockPlebbit();
            gatewayPlebbit = await mockGatewayPlebbit();

            kuboPlebbit = await mockPlebbitNoDataPathWithOnlyKuboClient();
            subplebbit = await plebbit.createSubplebbit();

            await subplebbit.start();

            const modSigner = await plebbit.createSigner();
            await subplebbit.edit({
                settings: { challenges: [{ ...subplebbit.settings.challenges[0], pendingApproval: true }] },
                roles: {
                    [modSigner.address]: { role: "moderator" }
                }
            });

            await resolveWhenConditionIsTrue(subplebbit, () => typeof subplebbit.updatedAt === "number");
        });

        after(async () => {
            await subplebbit.delete();
            await plebbit.destroy();
            await gatewayPlebbit.destroy();
            await kuboPlebbit.destroy();
        });

        it("Can load the IPNS record from gateway after it's published", async () => {
            const remoteSub = await gatewayPlebbit.getSubplebbit(subplebbit.address);
            expect(remoteSub.updatedAt).to.equal(subplebbit.updatedAt);
        });

        it("Can load the IPNS record from kubo after it's published", async () => {
            const remoteSub = await kuboPlebbit.getSubplebbit(subplebbit.address);
            expect(remoteSub.updatedAt).to.equal(subplebbit.updatedAt);
        });
    });
