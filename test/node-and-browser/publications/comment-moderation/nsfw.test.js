import signers from "../../../fixtures/signers.js";
import {
    getRemotePlebbitConfigs,
    publishRandomPost,
    publishWithExpectedResult,
    resolveWhenConditionIsTrue
} from "../../../../dist/node/test/test-util.js";
import { expect } from "chai";

const subplebbitAddress = signers[0].address;
const roles = [
    { role: "owner", signer: signers[1] },
    { role: "admin", signer: signers[2] },
    { role: "mod", signer: signers[3] }
];

getRemotePlebbitConfigs().map((config) => {
    describe(`Mods marking an author comment as nsfw - ${config.name}`, async () => {
        let plebbit, randomPost;

        before(async () => {
            plebbit = await config.plebbitInstancePromise();
            randomPost = await publishRandomPost(subplebbitAddress, plebbit, {});
            randomPost.update();
        });

        after(async () => {
            await randomPost.stop();
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
            await resolveWhenConditionIsTrue(randomPost, () => randomPost.nsfw === true);
            expect(randomPost._rawCommentUpdate.reason).to.equal("Mod marking an author comment as nsfw");
            expect(randomPost._rawCommentUpdate.nsfw).to.be.true;
            expect(randomPost._rawCommentUpdate.edit).to.be.undefined;

            expect(randomPost.reason).to.equal("Mod marking an author comment as nsfw");
            expect(randomPost.nsfw).to.be.true;
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
            await resolveWhenConditionIsTrue(randomPost, () => randomPost.nsfw === false);
            expect(randomPost._rawCommentUpdate.reason).to.equal("Mod unnsfwing an author comment");
            expect(randomPost._rawCommentUpdate.nsfw).to.be.false;
            expect(randomPost._rawCommentUpdate.edit).to.be.undefined;

            expect(randomPost.reason).to.equal("Mod unnsfwing an author comment");
            expect(randomPost.nsfw).to.be.false;
        });
    });
});