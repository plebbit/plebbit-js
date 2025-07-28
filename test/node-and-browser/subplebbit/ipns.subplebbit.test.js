import { getAvailablePlebbitConfigsToTestAgainst, resolveWhenConditionIsTrue } from "../../../dist/node/test/test-util.js";
import { expect } from "chai";
import signers from "../../fixtures/signers.js";

const subplebbitAddress = signers[0].address;

getAvailablePlebbitConfigsToTestAgainst().map((config) => {
    describe(`subplebbit.{ipnsName, ipnsPubsubTopic, ipnsPubsubTopicRoutingCid, pubsubTopicRoutingCid}`, async () => {
        let plebbit;
        let subplebbit;
        before(async () => {
            plebbit = await config.plebbitInstancePromise();
            subplebbit = await plebbit.createSubplebbit({ address: subplebbitAddress });
            expect(subplebbit.ipnsName).to.equal(undefined);
            expect(subplebbit.ipnsPubsubTopic).to.equal(undefined);
            expect(subplebbit.ipnsPubsubTopicRoutingCid).to.equal(undefined);
            expect(subplebbit.pubsubTopicRoutingCid).to.equal(undefined);

            await subplebbit.update();
            await resolveWhenConditionIsTrue(subplebbit, () => subplebbit.updatedAt);
        });

        after(async () => {
            await plebbit.destroy();
        });

        it("subplebbit.ipnsName should be a valid IPNS name", async () => {
            expect(subplebbit.ipnsName).equal("12D3KooWN5rLmRJ8fWMwTtkDN7w2RgPPGRM4mtWTnfbjpi1Sh7zR");
        });

        it("subplebbit.ipnsPubsubTopic should be a valid pubsub topic", async () => {
            expect(subplebbit.ipnsPubsubTopic).equal("/record/L2lwbnMvACQIARIgtkPPciAVI7kfzmSHjazd0ekx8z9bCt9RlE5RnEpFRGo");
        });

        it("subplebbit.ipnsPubsubTopicRoutingCid should be a valid DHT key", async () => {
            expect(subplebbit.ipnsPubsubTopicRoutingCid).equal("bafkreiftvi7wgbdhbxnenslhu5sytlid73siolkd2syhdnjhnvn3mksggi");
        });

        it("subplebbit.pubsubTopicRoutingCid should be a valid CID", async () => {
            expect(subplebbit.pubsubTopicRoutingCid).equal("bafkreidwoelrflsx5dgll7s6jfkhsj6ffkfplde2j5dyino6t7m4ijutem");
        });
    });
});
