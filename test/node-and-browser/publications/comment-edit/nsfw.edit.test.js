import signers from "../../../fixtures/signers.js";
import {
    getRemotePlebbitConfigs,
    publishRandomPost,
    publishWithExpectedResult,
    resolveWhenConditionIsTrue
} from "../../../../dist/node/test/test-util.js";
import { expect } from "chai";
import { messages } from "../../../../dist/node/errors.js";
import { verifyCommentIpfs, verifyCommentUpdate } from "../../../../dist/node/signer/signatures.js";

const subplebbitAddress = signers[0].address;
const roles = [
    { role: "owner", signer: signers[1] },
    { role: "admin", signer: signers[2] },
    { role: "mod", signer: signers[3] }
];

getRemotePlebbitConfigs().map((config) => {
    describe(`Authors can mark their own comment as nsfw - ${config.name}`, async () => {
        let plebbit, authorPost;
        before(async () => {
            plebbit = await config.plebbitInstancePromise();
            authorPost = await publishRandomPost(subplebbitAddress, plebbit, {});
            await authorPost.update();
        });

        after(async () => {
            await authorPost.stop();
        });

        it(`Regular author can't mark another author comment as nsfw`, async () => {
            const nsfwEdit = await plebbit.createCommentEdit({
                subplebbitAddress: authorPost.subplebbitAddress,
                commentCid: authorPost.cid,
                nsfw: true,
                signer: await plebbit.createSigner()
            });
            await publishWithExpectedResult(nsfwEdit, false, messages.ERR_COMMENT_EDIT_CAN_NOT_EDIT_COMMENT_IF_NOT_ORIGINAL_AUTHOR);
        });

        it(`Author can mark their own comment as nsfw with CommentEdit`, async () => {
            expect([false, undefined]).to.include(authorPost.nsfw);

            const nsfwEdit = await plebbit.createCommentEdit({
                subplebbitAddress: authorPost.subplebbitAddress,
                commentCid: authorPost.cid,
                nsfw: true,
                signer: authorPost.signer,
                reason: "Author marking their own comment as nsfw"
            });
            await publishWithExpectedResult(nsfwEdit, true);
        });
        it(`A new CommentUpdate is published with nsfw=true`, async () => {
            await resolveWhenConditionIsTrue(authorPost, () => authorPost.nsfw === true);
            expect(authorPost.edit.nsfw).to.be.true;
            expect(authorPost._rawCommentUpdate.reason).to.be.undefined;
            expect(authorPost._rawCommentUpdate.nsfw).to.be.undefined;
            expect(authorPost._rawCommentUpdate.edit).to.exist;
            expect(authorPost._rawCommentUpdate.edit.reason).to.equal("Author marking their own comment as nsfw");
            expect(authorPost._rawCommentUpdate.edit.nsfw).to.be.true;

            expect(authorPost.reason).to.be.undefined; // reason is only for mods editing other authors' posts
            expect(authorPost.edit.reason).to.equal("Author marking their own comment as nsfw");

            expect(authorPost.nsfw).to.be.true;
        });

        it(`The new Comment with nsfw=true has valid signature`, async () => {
            const recreatedPost = await plebbit.createComment({ cid: authorPost.cid });
            await recreatedPost.update();
            await resolveWhenConditionIsTrue(recreatedPost, () => typeof recreatedPost.updatedAt === "number");

            await recreatedPost.stop();
            expect(recreatedPost.nsfw).to.be.true;

            const commentIpfsValidity = await verifyCommentIpfs(recreatedPost.toJSONIpfs(), true, recreatedPost._clientsManager, false);
            expect(commentIpfsValidity).to.deep.equal({ valid: true });

            const commentUpdateValidity = await verifyCommentUpdate(
                recreatedPost._rawCommentUpdate,
                true,
                recreatedPost._clientsManager,
                recreatedPost.subplebbitAddress,
                { cid: recreatedPost.cid, signature: recreatedPost.signature },
                false
            );
            expect(commentUpdateValidity).to.deep.equal({ valid: true });
        });

        it(`Author can unnsfw their own comment`, async () => {
            const unnsfwEdit = await plebbit.createCommentEdit({
                subplebbitAddress: authorPost.subplebbitAddress,
                commentCid: authorPost.cid,
                nsfw: false,
                signer: authorPost.signer,
                reason: "An author unnsfwing their own comment"
            });
            await publishWithExpectedResult(unnsfwEdit, true);
        });
        it(`A new CommentUpdate is published with nsfw=false`, async () => {
            await resolveWhenConditionIsTrue(authorPost, () => authorPost.nsfw === false);
            expect(authorPost.edit.nsfw).to.be.false;
            expect(authorPost._rawCommentUpdate.reason).to.be.undefined;
            expect(authorPost._rawCommentUpdate.nsfw).to.be.undefined;
            expect(authorPost._rawCommentUpdate.edit).to.exist;
            expect(authorPost._rawCommentUpdate.edit.reason).to.equal("An author unnsfwing their own comment");
            expect(authorPost._rawCommentUpdate.edit.nsfw).to.be.false;

            expect(authorPost.edit.reason).to.equal("An author unnsfwing their own comment");
            expect(authorPost.reason).to.be.undefined;

            expect(authorPost.nsfw).to.be.false;
        });
    });

    describe(`Mods marking their own comment as nsfw - ${config.name}`, async () => {
        let plebbit, modPost;

        before(async () => {
            plebbit = await config.plebbitInstancePromise();
            modPost = await publishRandomPost(subplebbitAddress, plebbit, { signer: roles[2].signer });
            modPost.update();
        });

        after(async () => {
            await modPost.stop();
        });

        it(`Mod can mark their own comment as nsfw`, async () => {
            const nsfwEdit = await plebbit.createCommentEdit({
                subplebbitAddress: modPost.subplebbitAddress,
                commentCid: modPost.cid,
                nsfw: true,
                signer: roles[2].signer,
                reason: "Mod marking their own comment as nsfw"
            });
            await publishWithExpectedResult(nsfwEdit, true);
        });

        it(`A new CommentUpdate is published with nsfw=true`, async () => {
            await resolveWhenConditionIsTrue(modPost, () => modPost.nsfw === true);
            expect(modPost.edit.nsfw).to.be.true;
            expect(modPost._rawCommentUpdate.reason).to.be.undefined;
            expect(modPost._rawCommentUpdate.nsfw).to.be.undefined;
            expect(modPost._rawCommentUpdate.edit).to.exist;
            expect(modPost._rawCommentUpdate.edit.reason).to.equal("Mod marking their own comment as nsfw");
            expect(modPost._rawCommentUpdate.edit.nsfw).to.be.true;

            expect(modPost.reason).to.be.undefined; // reason is defined only when it's a mod editing other authors' posts
            expect(modPost.edit.reason).to.equal("Mod marking their own comment as nsfw");
            expect(modPost.nsfw).to.be.true;
        });

        it(`Mod can unnsfw their own comment`, async () => {
            const unnsfwEdit = await plebbit.createCommentEdit({
                subplebbitAddress: modPost.subplebbitAddress,
                commentCid: modPost.cid,
                nsfw: false,
                signer: roles[2].signer,
                reason: "Mod unnsfwing their own comment"
            });
            await publishWithExpectedResult(unnsfwEdit, true);
        });

        it(`A new CommentUpdate is published with nsfw=false`, async () => {
            await resolveWhenConditionIsTrue(modPost, () => modPost.nsfw === false);
            expect(modPost.edit.nsfw).to.be.false;
            expect(modPost._rawCommentUpdate.reason).to.be.undefined;
            expect(modPost._rawCommentUpdate.nsfw).to.be.undefined;
            expect(modPost._rawCommentUpdate.edit).to.exist;
            expect(modPost._rawCommentUpdate.edit.reason).to.equal("Mod unnsfwing their own comment");
            expect(modPost._rawCommentUpdate.edit.nsfw).to.be.false;

            expect(modPost.reason).to.be.undefined;
            expect(modPost.edit.reason).to.equal("Mod unnsfwing their own comment");
            expect(modPost.nsfw).to.be.false;
        });
    });
});