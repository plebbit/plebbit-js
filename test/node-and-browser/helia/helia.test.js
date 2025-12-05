import { expect } from "chai";
import {
    generatePostToAnswerMathQuestion,
    publishWithExpectedResult,
    getAvailablePlebbitConfigsToTestAgainst,
    resolveWhenConditionIsTrue,
    mockPlebbitV2,
    addStringToIpfs
} from "../../../dist/node/test/test-util.js";
import signers from "../../fixtures/signers.js";
import { describe, it } from "vitest";
const mathCliNoMockedPubsubSubplebbitAddress = signers[5].address; // this sub is connected to a plebbit instance whose pubsub is not mocked

// should connect to a kubo node and exchange pubsub messages with it
// DO NOT MOCK PUBSUB
//flaky
// for(let i =0;i <50; i++)
getAvailablePlebbitConfigsToTestAgainst({ includeOnlyTheseTests: ["remote-libp2pjs"] }).map((config) => {
    describe(`Test publishing pubsub in real environment - ${config.name}`, async () => {
        let plebbit, publishedPost;

        before(async () => {
            plebbit = await config.plebbitInstancePromise({ forceMockPubsub: false });
        });

        after(async () => {
            await plebbit.destroy();
        });

        it(`Can fetch subplebbit`, async () => {
            const sub = await plebbit.getSubplebbit({address: mathCliNoMockedPubsubSubplebbitAddress});
            expect(sub.updatedAt).to.be.a("number");
            expect(sub.settings).to.be.undefined; // make sure it's not loading local subplebbit
        });

        it("can post after answering correctly", async function () {
            publishedPost = await generatePostToAnswerMathQuestion({ subplebbitAddress: mathCliNoMockedPubsubSubplebbitAddress }, plebbit);
            await publishWithExpectedResult(publishedPost, true);
        });

        it(`Can fetch Comment IPFS`, async () => {
            const commentCid = publishedPost.cid;
            expect(commentCid).to.be.a("string");
            const comment = await plebbit.getComment({cid: commentCid});
            expect(comment.signature).to.be.a("object");
        });

        it(`Can fetch comment update`, async () => {
            const commentCid = publishedPost.cid;
            expect(commentCid).to.be.a("string");
            const comment = await plebbit.getComment({cid: commentCid});
            expect(comment.signature).to.be.a("object");

            await comment.update();
            await resolveWhenConditionIsTrue({ toUpdate: comment, predicate: () => typeof comment.updatedAt === "number" });
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

        it(`should connect to peers if we're subscribing over pubsub`, async () => {
            const testPlebbit = await config.plebbitInstancePromise({
                forceMockPubsub: false
            });

            const kuboPlebbit = await mockPlebbitV2({
                plebbitOptions: { pubsubKuboRpcClientsOptions: ["http://localhost:15001/api/v0"] },
                forceMockPubsub: false,
                remotePlebbit: true
            });

            const kuboRpc = Object.values(kuboPlebbit.clients.pubsubKuboRpcClients)[0];

            const numOfPeersBeforeSubscribing = Object.values(testPlebbit.clients.libp2pJsClients)[0]._helia.libp2p.getConnections().length;
            expect(numOfPeersBeforeSubscribing).to.equal(0);
            const heliaWithKuboRpcClientFunctions = Object.values(testPlebbit.clients.libp2pJsClients)[0].heliaWithKuboRpcClientFunctions;

            const pubsubMsgs = [];

            await heliaWithKuboRpcClientFunctions.pubsub.subscribe(mathCliNoMockedPubsubSubplebbitAddress, (msg) => {
                pubsubMsgs.push(msg);
            });

            const numOfPeersAfterSubscribing = Object.values(testPlebbit.clients.libp2pJsClients)[0]._helia.libp2p.getConnections().length;
            expect(numOfPeersAfterSubscribing).to.be.greaterThan(numOfPeersBeforeSubscribing);

            await kuboRpc._client.pubsub.publish(mathCliNoMockedPubsubSubplebbitAddress, new TextEncoder().encode("test"));

            await new Promise((resolve) => setTimeout(resolve, 2000));
            expect(pubsubMsgs.length).to.equal(1);
            expect(pubsubMsgs[0].data.toString()).to.equal("116,101,115,116"); // uint8 array representation of "test"

            await testPlebbit.destroy();
            await kuboPlebbit.destroy();
        });
        it(`it should connect if we're fetching content by CID`, async () => {
            const testPlebbit = await config.plebbitInstancePromise({
                forceMockPubsub: false
            });

            const numOfPeersBeforeFetching = Object.values(testPlebbit.clients.libp2pJsClients)[0]._helia.libp2p.getConnections().length;
            expect(numOfPeersBeforeFetching).to.equal(0);

            const newContentCid = await addStringToIpfs("test");

            const contentLoadedByHelia = await testPlebbit.fetchCid({cid: newContentCid});
            expect(contentLoadedByHelia).to.equal("test");

            const numOfPeersAfterFetching = Object.values(testPlebbit.clients.libp2pJsClients)[0]._helia.libp2p.getConnections().length;
            expect(numOfPeersAfterFetching).to.be.greaterThan(numOfPeersBeforeFetching);

            await testPlebbit.destroy();
        });

        it(`We can fetch the IPNS using pubsub only`, async () => {
            // plebbit-js sets up helia to use two routers for IPNS:
            // 1. Pubsub router: Joins pubsub topic, and awaits for the IPNS record to be published
            // 2. Fetch router: requests the IPNS record from peers in the pubsub topic

            // We need to test if we can fetch the IPNS using pubsub only

            const testPlebbit = await config.plebbitInstancePromise({
                forceMockPubsub: false
            });

            Object.values(testPlebbit.clients.libp2pJsClients)[0]._heliaIpnsRouter.routers = Object.values(
                testPlebbit.clients.libp2pJsClients
            )[0]._heliaIpnsRouter.routers.slice(1); // remove the fetch router

            const sub = await testPlebbit.createSubplebbit({ address: mathCliNoMockedPubsubSubplebbitAddress });
            const errors = [];
            sub.on("error", (error) => errors.push(error));

            await sub.update();
            await new Promise((resolve) => sub.once("update", resolve));

            expect(sub.updatedAt).to.be.a("number");
            expect(sub.settings).to.be.undefined; // make sure it's not loading local subplebbit

            await testPlebbit.destroy();
        });
    });
});
