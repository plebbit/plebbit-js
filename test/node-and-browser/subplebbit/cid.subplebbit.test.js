import {
    mockGatewayPlebbit,
    mockPlebbit,
    mockRemotePlebbitIpfsOnly,
    mockRpcRemotePlebbit,
    resolveWhenConditionIsTrue
} from "../../../dist/node/test/test-util";
import chai from "chai";

import signers from "../../fixtures/signers";

import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);
const { expect, assert } = chai;

const subplebbitAddress = signers[0].address;

const testConfigs = [
    { name: "Ipfs P2P", plebbitInstance: mockRemotePlebbitIpfsOnly },
    { name: "Ipfs Gateway", plebbitInstance: mockGatewayPlebbit },
    { name: "RPC", plebbitInstance: mockRpcRemotePlebbit }
];

testConfigs.map((config) =>
    describe(`subplebbit.cid (Remote) - ${config.name}`, async () => {
        let plebbit;

        before(async () => {
            plebbit = await config.plebbitInstance();
        });

        it(`subplebbit.cid is defined after first update event`, async () => {
            const sub = await plebbit.createSubplebbit({ address: subplebbitAddress });
            expect(sub.cid).to.be.undefined;

            await sub.update();
            await resolveWhenConditionIsTrue(sub, () => typeof sub.updatedAt === "number");
            expect(sub.cid).to.be.a("string");

            await sub.stop();
        });

        it(`subplebbit.cid is defined after plebbit.getSubplebbit`, async () => {
            const sub = await plebbit.getSubplebbit(subplebbitAddress);
            expect(sub.cid).to.be.a("string");
        });

        it(`subplebbit.cid is part of subplebbit.toJSON()`, async () => {
            const subJson = JSON.parse(JSON.stringify(await plebbit.getSubplebbit(subplebbitAddress)));
            expect(subJson.cid).to.be.a("string");
        });
    })
);
