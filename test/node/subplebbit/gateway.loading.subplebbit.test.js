import {
    mockGatewayPlebbit,
    mockPlebbit,
    mockPlebbitNoDataPathWithOnlyKuboClient,
    resolveWhenConditionIsTrue
} from "../../../dist/node/test/test-util.js";
import { expect } from "chai";

for (let i = 0; i < 100; i++)
    describe(`Gateway loading of local subplebbit IPNS - iteration ${i}`, async () => {
        let plebbit, subplebbit;
        let gatewayPlebbit;
        let kuboPlebbit;

        before(async () => {
            plebbit = await mockPlebbit();
            gatewayPlebbit = await mockGatewayPlebbit();
            gatewayPlebbit.on("error", (err) => console.error("gatewayPlebbit error event", err));
            console.log("Gateway URLs:", gatewayPlebbit.ipfsGatewayUrls);
            try {
                const probeRes = await fetch("http://localhost:18080", { method: "HEAD" });
                console.log("Gateway HEAD status:", probeRes.status);
            } catch (error) {
                console.error("Gateway HEAD probe failed", error);
            }

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
            console.log(`Starting test: iteration ${i} - Can load the IPNS record from gateway after it's published`);
            const remoteSub = await gatewayPlebbit.getSubplebbit(subplebbit.address);
            expect(remoteSub.updatedAt).to.equal(subplebbit.updatedAt);
        });

        it("Can load the IPNS record from kubo after it's published", async () => {
            console.log(`Starting test: iteration ${i} - Can load the IPNS record from kubo after it's published`);
            const remoteSub = await kuboPlebbit.getSubplebbit(subplebbit.address);
            expect(remoteSub.updatedAt).to.equal(subplebbit.updatedAt);
        });
    });
