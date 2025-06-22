import { expect } from "chai";
import {
    generatePostToAnswerMathQuestion,
    publishWithExpectedResult,
    getRemotePlebbitConfigs,
    resolveWhenConditionIsTrue,
    mockPlebbitV2
} from "../../../dist/node/test/test-util.js";
import signers from "../../fixtures/signers.js";
const mathCliNoMockedPubsubSubplebbitAddress = signers[5].address; // this sub is connected to a plebbit instance whose pubsub is not mocked

// should connect to a kubo node and exchange pubsub messages with it
// DO NOT MOCK PUBSUB
getRemotePlebbitConfigs({ includeOnlyTheseTests: ["remote-libp2pjs"] }).map((config) => {
    describe(`Test publishing pubsub in real environment - ${config.name}`, async () => {
        let plebbit, publishedPost;

        before(async () => {
            plebbit = await config.plebbitInstancePromise({ forceMockPubsub: false });
        });

        after(async () => {
            await plebbit.destroy();
        });

        it(`Can fetch subplebbit`, async () => {
            const sub = await plebbit.getSubplebbit(mathCliNoMockedPubsubSubplebbitAddress);
            expect(sub.updatedAt).to.be.a("number");
            expect(sub.settings).to.be.undefined; // make sure it's not loading local subplebbit
        });

        it("can post after answering correctly", async function () {
            publishedPost = await generatePostToAnswerMathQuestion({ subplebbitAddress: mathCliNoMockedPubsubSubplebbitAddress }, plebbit);
            await publishWithExpectedResult(publishedPost, true);
        });

        it(`Can fetch Comment IPFS`, async () => {
            const commentCid = publishedPost.cid;
            const comment = await plebbit.getComment(commentCid);
            expect(comment.signature).to.be.a("object");
        });

        it(`Can fetch comment update`, async () => {
            const commentCid = publishedPost.cid;
            const comment = await plebbit.getComment(commentCid);
            expect(comment.signature).to.be.a("object");

            await comment.update();
            await resolveWhenConditionIsTrue(comment, () => typeof comment.updatedAt === "number");
            expect(comment.author.subplebbit).to.be.a("object");
            await comment.stop();
        });

        it(`It should connect to peers if we're publishing over pubsub`, async () => {
            const testPlebbit = await config.plebbitInstancePromise({
                forceMockPubsub: false
            });

            const kuboPlebbit = await mockPlebbitV2({
                plebbitOptions: { pubsubKuboRpcClientsOptions: ["http://localhost:15001/api/v0"] },
                forceMockPubsub: false,
                remotePlebbit: true
            });

            const kuboRpc = Object.values(kuboPlebbit.clients.pubsubKuboRpcClients)[0];

            const pubsubMsgs = [];

            kuboRpc._client.pubsub.subscribe(mathCliNoMockedPubsubSubplebbitAddress, (msg) => {
                pubsubMsgs.push(msg);
            });

            const numOfPeersBeforePublishing = Object.values(testPlebbit.clients.libp2pJsClients)[0]._helia.libp2p.getConnections().length;
            expect(numOfPeersBeforePublishing).to.equal(0);
            const heliaWithKuboRpcClientFunctions = Object.values(testPlebbit.clients.libp2pJsClients)[0].heliaWithKuboRpcClientFunctions;

            await heliaWithKuboRpcClientFunctions.pubsub.publish(mathCliNoMockedPubsubSubplebbitAddress, new TextEncoder().encode("test"));

            const numOfPeersAfterPublishing = Object.values(testPlebbit.clients.libp2pJsClients)[0]._helia.libp2p.getConnections().length;
            expect(numOfPeersAfterPublishing).to.be.greaterThan(numOfPeersBeforePublishing);

            await new Promise((resolve) => setTimeout(resolve, 1000));
            expect(pubsubMsgs.length).to.equal(1);
            expect(pubsubMsgs[0].data.toString()).to.equal("116,101,115,116"); // uint8 array representation of "test"

            await testPlebbit.destroy();
            await kuboPlebbit.destroy();
        });

        it(`should connect to peers if we're publishing over pubsub`);
        it(`it should connect if we're fetching content by CID`);
    });
});
