import { expect } from "chai";
import signers from "../../../fixtures/signers.js";
import {
    getAvailablePlebbitConfigsToTestAgainst,
    iterateThroughPagesToFindCommentInParentPagesInstance,
    publishRandomPost,
    publishWithExpectedResult,
    resolveWhenConditionIsTrue
} from "../../../../dist/node/test/test-util.js";
const subplebbitAddress = signers[0].address;
const roles = [
    { role: "owner", signer: signers[1] },
    { role: "admin", signer: signers[2] },
    { role: "mod", signer: signers[3] }
];

getAvailablePlebbitConfigsToTestAgainst().map((config) => {
    describe(`Mods marking an author comment as nsfw - ${config.name}`, async () => {
        let plebbit, randomPost;

        before(async () => {
            plebbit = await config.plebbitInstancePromise();
            randomPost = await publishRandomPost(subplebbitAddress, plebbit);
            randomPost.update();
        });

        after(async () => {
            await plebbit.destroy();
        });

        it(`Mod can mark an author comment as nsfw`, async () => {
            const modnsfwEdit = await plebbit.createCommentModeration({
                subplebbitAddress: randomPost.subplebbitAddress,
                commentCid: randomPost.cid,
                commentModeration: { nsfw: true, reason: "Mod marking an author comment as nsfw" },
                signer: roles[2].signer
            });
            await publishWithExpectedResult(modnsfwEdit, true);
        });

        it(`A new CommentUpdate is published with nsfw=true`, async () => {
            await resolveWhenConditionIsTrue({ toUpdate: randomPost, predicate: () => randomPost.nsfw === true });
            expect(randomPost.raw.commentUpdate.reason).to.equal("Mod marking an author comment as nsfw");
            expect(randomPost.raw.commentUpdate.nsfw).to.be.true;
            expect(randomPost.raw.commentUpdate.edit).to.be.undefined;

            expect(randomPost.reason).to.equal("Mod marking an author comment as nsfw");
            expect(randomPost.nsfw).to.be.true;
        });

        it(`nsfw=true appears in pages of subplebibt`, async () => {
            const sub = await plebbit.getSubplebbit(randomPost.subplebbitAddress);
            const commentInPage = await iterateThroughPagesToFindCommentInParentPagesInstance(randomPost.cid, sub.posts);
            expect(commentInPage.nsfw).to.be.true;
        });

        it(`Mod can mark unnsfw author comment `, async () => {
            const unnsfwEdit = await plebbit.createCommentModeration({
                subplebbitAddress: randomPost.subplebbitAddress,
                commentCid: randomPost.cid,
                commentModeration: { nsfw: false, reason: "Mod unnsfwing an author comment" },
                signer: roles[2].signer
            });
            await publishWithExpectedResult(unnsfwEdit, true);
        });

        it(`A new CommentUpdate is published with nsfw=false`, async () => {
            await resolveWhenConditionIsTrue({ toUpdate: randomPost, predicate: () => randomPost.nsfw === false });
            expect(randomPost.raw.commentUpdate.reason).to.equal("Mod unnsfwing an author comment");
            expect(randomPost.raw.commentUpdate.nsfw).to.be.false;
            expect(randomPost.raw.commentUpdate.edit).to.be.undefined;

            expect(randomPost.reason).to.equal("Mod unnsfwing an author comment");
            expect(randomPost.nsfw).to.be.false;
        });

        it(`nsfw=false appears in pages of subplebbit`, async () => {
            const sub = await plebbit.getSubplebbit(randomPost.subplebbitAddress);
            const commentInPage = await iterateThroughPagesToFindCommentInParentPagesInstance(randomPost.cid, sub.posts);
            expect(commentInPage.nsfw).to.be.false;
        });
    });
});
