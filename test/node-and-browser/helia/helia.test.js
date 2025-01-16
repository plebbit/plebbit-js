// should connect to a kubo node and exchange pubsub messages with it
// DO NOT MOCK PUBSUB

import { mockPlebbitWithHeliaConfig, generatePostToAnswerMathQuestion, publishWithExpectedResult } from "../../../dist/node/test/test-util";
import signers from "../../fixtures/signers";
import { expect } from "chai";

const mathCliNoMockedPubsubSubplebbitAddress = signers[5].address; // this sub is connected to a plebbit instance whose pubsub is not mocked

describe(`Test publishing pubsub`, async () => {
    let plebbit;

    before(async () => {
        plebbit = await mockPlebbitWithHeliaConfig(false);
    });

    after(async () => {
        await plebbit.clients.ipfsClients[Object.keys(plebbit.clients.ipfsClients)[0]]._client.stop();
    });

    it(`Can fetch subplebbit`, async () => {
        const sub = await plebbit.getSubplebbit(mathCliNoMockedPubsubSubplebbitAddress);
        expect(sub.updatedAt).to.be.a("number");
        expect(sub.settings).to.be.undefined; // make sure it's not loading local subplebbit
    });

    it("can post after answering correctly", async function () {
        const mockPost = await generatePostToAnswerMathQuestion({ subplebbitAddress: mathCliNoMockedPubsubSubplebbitAddress }, plebbit);
        await publishWithExpectedResult(mockPost, true);
    });
});
