import { getAvailablePlebbitConfigsToTestAgainst, resolveWhenConditionIsTrue } from "../../../../dist/node/test/test-util.js";
import { expect } from "chai";
import signers from "../../../fixtures/signers.js";

const ipnsB58 = signers[0].address;
const expectedIpnsPubsubTopic = "/record/L2lwbnMvACQIARIgtkPPciAVI7kfzmSHjazd0ekx8z9bCt9RlE5RnEpFRGo";
const expectedIpnsPubsubTopicRoutingCid = "bafkreiftvi7wgbdhbxnenslhu5sytlid73siolkd2syhdnjhnvn3mksggi";
const expectedPubsubTopicRoutingCid = "bafkreidwoelrflsx5dgll7s6jfkhsj6ffkfplde2j5dyino6t7m4ijutem";

getAvailablePlebbitConfigsToTestAgainst().map((config) => {
    describe(`subplebbit.{ipnsName, ipnsPubsubTopic, ipnsPubsubTopicRoutingCid, pubsubTopicRoutingCid} on create`, async () => {
        let plebbit;
        let subplebbit;
        before(async () => {
            plebbit = await config.plebbitInstancePromise();
            subplebbit = await plebbit.createSubplebbit({ address: ipnsB58 });
            expect(subplebbit.updatedAt).to.be.undefined;
        });

        after(async () => {
            await plebbit.destroy();
        });

        it("creates ipns fields from ipns b58 without update", async () => {
            expect(subplebbit.ipnsName).to.equal(ipnsB58);
            expect(subplebbit.ipnsPubsubTopic).to.equal(expectedIpnsPubsubTopic);
            expect(subplebbit.ipnsPubsubTopicRoutingCid).to.equal(expectedIpnsPubsubTopicRoutingCid);
        });
    });

    describe(`subplebbit.{ipnsName, ipnsPubsubTopic, ipnsPubsubTopicRoutingCid, pubsubTopicRoutingCid}`, async () => {
        let plebbit;
        let subplebbit;
        before(async () => {
            plebbit = await config.plebbitInstancePromise();
            subplebbit = await plebbit.createSubplebbit({ address: ipnsB58 });

            await subplebbit.update();
            await resolveWhenConditionIsTrue({ toUpdate: subplebbit, predicate: () => subplebbit.updatedAt });
        });

        after(async () => {
            await plebbit.destroy();
        });

        it("subplebbit.ipnsName should be a valid IPNS name", async () => {
            expect(subplebbit.ipnsName).equal(ipnsB58);
        });

        it("subplebbit.ipnsPubsubTopic should be a valid pubsub topic", async () => {
            expect(subplebbit.ipnsPubsubTopic).equal(expectedIpnsPubsubTopic);
        });

        it("subplebbit.ipnsPubsubTopicRoutingCid should be a valid DHT key", async () => {
            expect(subplebbit.ipnsPubsubTopicRoutingCid).equal(expectedIpnsPubsubTopicRoutingCid);
        });

        it("subplebbit.pubsubTopicRoutingCid should be a valid CID", async () => {
            expect(subplebbit.pubsubTopicRoutingCid).equal(expectedPubsubTopicRoutingCid);
        });
    });
});
