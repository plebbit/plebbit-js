import { expect } from "chai";
import {
    getAvailablePlebbitConfigsToTestAgainst,
    publishRandomPost,
    resolveWhenConditionIsTrue
} from "../../../../dist/node/test/test-util.js";
import signers from "../../../fixtures/signers.js";
import { describe } from "vitest";

getAvailablePlebbitConfigsToTestAgainst().map((config) => {
    describe.concurrent(`comment.original - ${config.name}`, async () => {
        let plebbit;

        before(async () => {
            plebbit = await config.plebbitInstancePromise();
        });

        after(async () => {
            await plebbit.destroy();
        });

        it(`comment.original after publishing a comment successfully`, async () => {
            const post = await publishRandomPost(signers[0].address, plebbit, {}, false);
            expect(post.original.author.address).to.equal(post.author.address);
            expect(post.original.author.subplebbit).to.be.undefined;
            expect(post.original.content).to.equal(post.content);
            expect(post.original.protocolVersion).to.be.a("string");
            expect(post.original.signature).to.be.undefined;
        });

        it(`comment.original from plebbit.getComment({cid: ) should be undefined`, async () => {
            const cid = (await plebbit.getSubplebbit({ address: signers[0].address })).posts.pages.hot.comments[0].cid;
            const comment = await plebbit.getComment({ cid: cid });

            expect(comment.original).to.be.undefined;
        });

        it(`comment.original from comment.update() after CommentUpdate`, async () => {
            const originalComment = await publishRandomPost(signers[0].address, plebbit);
            const cid = originalComment.cid;
            const comment = await plebbit.createComment({ cid });
            await comment.update();
            await resolveWhenConditionIsTrue({ toUpdate: comment, predicate: () => typeof comment.updatedAt === "number" });
            expect(comment.original.author.address).to.equal(originalComment.author.address);
            expect(comment.original.author.subplebbit).to.be.undefined;
            expect(comment.original.content).to.equal(originalComment.content);
            expect(comment.original.protocolVersion).to.be.a("string");
            expect(comment.original.signature).to.be.undefined;

            await comment.stop();
        });
    });
});
