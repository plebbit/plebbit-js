import { getRemotePlebbitConfigs } from "../../../dist/node/test/test-util.js";
import { expect } from "chai";

const fixture = {
    address: "weaponized-autism.eth",
    pubsubTopic: "12D3KooWJM1TaC9SF1oQq7KHwKUQE8nhCJfbePoQ8ipWiC9B5GUA",
    signature: {
        publicKey: "frcVczLMYgfibZ2gUU5TZVZWkKFwH6QGE+J2o197RcM",
        signature: "nIgfHI/h9W+tx4ID2IMk9zCUXeWyzOK3zb77JG5EuOXvdDAlMsW4LiYZc/LNXf9WF0UIRkGUIbjxd9a1lbCTAA",
        signedPropertyNames: [
            "posts",
            "challenges",
            "encryption",
            "address",
            "createdAt",
            "updatedAt",
            "pubsubTopic",
            "statsCid",
            "protocolVersion",
            "postUpdates",
            "title",
            "description",
            "roles",
            "lastPostCid",
            "lastCommentCid",
            "suggested"
        ],
        type: "ed25519"
    }
};

getRemotePlebbitConfigs().map((config) => {
    describe(`subplebbit.{ipnsName, ipnsPubsubTopic, ipnsPubsubTopicRoutingCid, pubsubTopicRoutingCid}`, async () => {
        let plebbit;
        let subplebbit;
        before(async () => {
            plebbit = await config.plebbitInstancePromise();
            subplebbit = await plebbit.createSubplebbit(fixture);
        });

        after(async () => {
            await plebbit.destroy();
        });

        it("subplebbit.ipnsName should be a valid IPNS name", async () => {
            expect(subplebbit.ipnsName).equal("12D3KooWJM1TaC9SF1oQq7KHwKUQE8nhCJfbePoQ8ipWiC9B5GUA");
        });

        it("subplebbit.ipnsPubsubTopic should be a valid pubsub topic", async () => {
            expect(subplebbit.ipnsPubsubTopic).equal("/record/L2lwbnMvACQIARIgfrcVczLMYgfibZ2gUU5TZVZWkKFwH6QGE-J2o197RcM");
        });

        it("subplebbit.ipnsPubsubTopicRoutingCid should be a valid DHT key", async () => {
            expect(subplebbit.ipnsPubsubTopicRoutingCid).equal("bafkreigf5ljbukix5wnbrms3rg2nnggrygpjso6qpmff4j2cj7zhjgwxjy");
        });

        it("subplebbit.pubsubTopicRoutingCid should be a valid CID", async () => {
            expect(subplebbit.pubsubTopicRoutingCid).equal("bafkreigdyreuuffwcpnnnhwrz5pxdi2jey7iyv2i5ketmwc65rpe7zbzoa");
        });
    });
});
