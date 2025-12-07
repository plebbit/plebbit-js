import { expect } from "chai";
import {
    mockPlebbit,
    publishRandomPost,
    publishRandomReply,
    createSubWithNoChallenge,
    resolveWhenConditionIsTrue,
    waitTillReplyInParentPages,
    mockPlebbitNoDataPathWithOnlyKuboClient
} from "../../../dist/node/test/test-util.js";

const depth = 100;

describe.skip(`Test for maximum depth of ${depth}`, () => {
    it(`should be able to create a subplebbit with a depth of ${depth}`, async () => {
        const plebbit = await mockPlebbit();
        const sub = await createSubWithNoChallenge({}, plebbit);
        await sub.start();
        await resolveWhenConditionIsTrue({ toUpdate: sub, predicate: () => sub.updatedAt });

        const remotePlebbit = await mockPlebbitNoDataPathWithOnlyKuboClient();
        const post = await publishRandomPost(sub.address, remotePlebbit);
        let lastReply;
        for (let i = 0; i < depth; i++) {
            lastReply = await publishRandomReply(lastReply || post, remotePlebbit);
            expect(lastReply.depth).to.equal(i + 1);
            console.log("Published reply with depth", lastReply.depth);
        }
        const lastReplyRemote = await remotePlebbit.getComment({ cid: lastReply.cid });
        await waitTillReplyInParentPages(lastReplyRemote, remotePlebbit);
        expect(lastReplyRemote.depth).to.equal(depth);
        await sub.delete();
    });
});
