import {
    mockPlebbit,
    publishRandomPost,
    publishRandomReply,
    createSubWithNoChallenge,
    resolveWhenConditionIsTrue,
    waitTillReplyInParentPages,
    mockPlebbitNoDataPathWithOnlyKuboClient
} from "../../../dist/node/test/test-util.js";

import chai from "chai";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);
const { expect, assert } = chai;
const depth = 100;

describe(`Test for maximum depth of ${depth}`, () => {
    it(`should be able to create a subplebbit with a depth of ${depth}`, async () => {
        const plebbit = await mockPlebbit();
        const sub = await createSubWithNoChallenge({}, plebbit);
        await sub.start();
        await resolveWhenConditionIsTrue(sub, () => sub.updatedAt);

        const post = await publishRandomPost(sub.address, plebbit);
        let lastReply;
        for (let i = 0; i < depth; i++) {
            lastReply = await publishRandomReply(lastReply || post, plebbit);
            expect(lastReply.depth).to.equal(i + 1);
            console.log("Published reply with depth", lastReply.depth);
        }
        const remotePlebbit = await mockPlebbitNoDataPathWithOnlyKuboClient();
        const lastReplyRemote = await remotePlebbit.getComment(lastReply.cid);
        await waitTillReplyInParentPages(lastReplyRemote, remotePlebbit);
        expect(lastReplyRemote.depth).to.equal(depth);
        await sub.delete();
    });
});
