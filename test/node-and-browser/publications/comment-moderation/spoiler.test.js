import { expect } from "chai";
import signers from "../../../fixtures/signers.js";
import {
    getAvailablePlebbitConfigsToTestAgainst,
    iterateThroughPagesToFindCommentInParentPagesInstance,
    publishRandomPost,
    publishWithExpectedResult,
    resolveWhenConditionIsTrue
} from "../../../../dist/node/test/test-util.js";
import { describe, it } from "vitest";
const subplebbitAddress = signers[0].address;
const roles = [
    { role: "owner", signer: signers[1] },
    { role: "admin", signer: signers[2] },
    { role: "mod", signer: signers[3] }
];

getAvailablePlebbitConfigsToTestAgainst().map((config) => {
    describe.concurrent(`Mods marking an author comment as spoiler - ${config.name}`, async () => {
        let plebbit, randomPost;

        before(async () => {
            plebbit = await config.plebbitInstancePromise();
            randomPost = await publishRandomPost(subplebbitAddress, plebbit);
            await randomPost.update();
        });

        after(async () => {
            await plebbit.destroy();
        });

        it.sequential(`Mod can mark an author comment as spoiler`, async () => {
            const modSpoilerEdit = await plebbit.createCommentModeration({
                subplebbitAddress: randomPost.subplebbitAddress,
                commentCid: randomPost.cid,
                commentModeration: { spoiler: true, reason: "Mod marking an author comment as spoiler" },
                signer: roles[2].signer
            });
            await publishWithExpectedResult(modSpoilerEdit, true);
        });

        it.sequential(`A new CommentUpdate is published with spoiler=true`, async () => {
            await resolveWhenConditionIsTrue({ toUpdate: randomPost, predicate: () => randomPost.spoiler === true });
            expect(randomPost.raw.commentUpdate.reason).to.equal("Mod marking an author comment as spoiler");
            expect(randomPost.raw.commentUpdate.spoiler).to.be.true;
            expect(randomPost.raw.commentUpdate.edit).to.be.undefined;

            expect(randomPost.reason).to.equal("Mod marking an author comment as spoiler");
            expect(randomPost.spoiler).to.be.true;
        });

        it(`spoiler=true appears in pages of subplebbit`, async () => {
            const sub = await plebbit.getSubplebbit({ address: randomPost.subplebbitAddress });
            const commentInPage = await iterateThroughPagesToFindCommentInParentPagesInstance(randomPost.cid, sub.posts);
            expect(commentInPage.spoiler).to.be.true;
        });

        it.sequential(`Mod can mark unspoiler author comment `, async () => {
            const unspoilerEdit = await plebbit.createCommentModeration({
                subplebbitAddress: randomPost.subplebbitAddress,
                commentCid: randomPost.cid,
                commentModeration: { spoiler: false, reason: "Mod unspoilering an author comment" },
                signer: roles[2].signer
            });
            await publishWithExpectedResult(unspoilerEdit, true);
        });

        it.sequential(`A new CommentUpdate is published with spoiler=false`, async () => {
            await resolveWhenConditionIsTrue({ toUpdate: randomPost, predicate: () => randomPost.spoiler === false });
            expect(randomPost.raw.commentUpdate.reason).to.equal("Mod unspoilering an author comment");
            expect(randomPost.raw.commentUpdate.spoiler).to.be.false;
            expect(randomPost.raw.commentUpdate.edit).to.be.undefined;

            expect(randomPost.reason).to.equal("Mod unspoilering an author comment");
            expect(randomPost.spoiler).to.be.false;
        });

        it(`spoiler=false appears in pages of subplebbit`, async () => {
            const sub = await plebbit.getSubplebbit({ address: randomPost.subplebbitAddress });
            const commentInPage = await iterateThroughPagesToFindCommentInParentPagesInstance(randomPost.cid, sub.posts);
            expect(commentInPage.spoiler).to.be.false;
        });
    });
});
