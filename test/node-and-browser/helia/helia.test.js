import { expect } from "chai";
// should connect to a kubo node and exchange pubsub messages with it
// DO NOT MOCK PUBSUB

import {
    mockPlebbitWithHeliaConfig,
    generatePostToAnswerMathQuestion,
    publishWithExpectedResult,
    resolveWhenConditionIsTrue
} from "../../../dist/node/test/test-util.js";
import signers from "../../fixtures/signers.js";
const mathCliNoMockedPubsubSubplebbitAddress = signers[5].address; // this sub is connected to a plebbit instance whose pubsub is not mocked

describe.skip(`Test publishing pubsub`, async () => {
    let plebbit, publishedPost;

    before(async () => {
        plebbit = await mockPlebbitWithHeliaConfig(false);
    });

    after(async () => {
        await plebbit.clients.kuboRpcClients[Object.keys(plebbit.clients.kuboRpcClients)[0]]._client.stop();
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
});
