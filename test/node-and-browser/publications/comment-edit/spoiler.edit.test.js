import signers from "../../../fixtures/signers.js";
import {
    mockRemotePlebbit,
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
describe(`Authors can mark their own comment as spoiler`, async () => {
    let plebbit, authorPost;
    before(async () => {
        plebbit = await mockRemotePlebbit();
        authorPost = await publishRandomPost(subplebbitAddress, plebbit, {}, false);
        await authorPost.update();
    });

    after(async () => {
        await authorPost.stop();
    });

    it(`Regular author can't mark another author comment as spoiler`, async () => {
        const spoilerEdit = await plebbit.createCommentEdit({
            subplebbitAddress: authorPost.subplebbitAddress,
            commentCid: authorPost.cid,
            spoiler: true,
            signer: await plebbit.createSigner()
        });
        await publishWithExpectedResult(spoilerEdit, false, messages.ERR_UNAUTHORIZED_COMMENT_EDIT);
    });

    it(`Author can mark their own comment as spoiler`, async () => {
        expect([false, undefined]).to.include(authorPost.spoiler);

        const spoilerEdit = await plebbit.createCommentEdit({
            subplebbitAddress: authorPost.subplebbitAddress,
            commentCid: authorPost.cid,
            spoiler: true,
            signer: authorPost._signer,
            reason: "Author marking their own comment as spoiler"
        });
        await publishWithExpectedResult(spoilerEdit, true);
    });
    it(`A new CommentUpdate is published with spoiler=true`, async () => {
        await resolveWhenConditionIsTrue(authorPost, () => authorPost.spoiler === true);
        expect(authorPost.edit.spoiler).to.be.true;
        expect(authorPost._rawCommentUpdate.reason).to.be.undefined;
        expect(authorPost._rawCommentUpdate.spoiler).to.be.undefined;
        expect(authorPost._rawCommentUpdate.edit).to.exist;
        expect(authorPost._rawCommentUpdate.edit.reason).to.equal("Author marking their own comment as spoiler");
        expect(authorPost._rawCommentUpdate.edit.spoiler).to.be.true;

        expect(authorPost.reason).to.be.undefined; // reason is only for mods editing other authors' posts
        expect(authorPost.edit.reason).to.equal("Author marking their own comment as spoiler");

        expect(authorPost.spoiler).to.be.true;
    });

    it(`The new Comment with spoiler=true has valid signature`, async () => {
        const recreatedPost = await plebbit.createComment({ cid: authorPost.cid });
        await recreatedPost.update();
        await resolveWhenConditionIsTrue(recreatedPost, () => typeof recreatedPost.updatedAt === "number");

        await recreatedPost.stop();
        expect(recreatedPost.spoiler).to.be.true;

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

    it(`Author can unspoiler their own comment`, async () => {
        const unspoilerEdit = await plebbit.createCommentEdit({
            subplebbitAddress: authorPost.subplebbitAddress,
            commentCid: authorPost.cid,
            spoiler: false,
            signer: authorPost._signer,
            reason: "An author unspoilering their own comment"
        });
        await publishWithExpectedResult(unspoilerEdit, true);
    });
    it(`A new CommentUpdate is published with spoiler=false`, async () => {
        await resolveWhenConditionIsTrue(authorPost, () => authorPost.spoiler === false);
        expect(authorPost.edit.spoiler).to.be.false;
        expect(authorPost._rawCommentUpdate.reason).to.be.undefined;
        expect(authorPost._rawCommentUpdate.spoiler).to.be.undefined;
        expect(authorPost._rawCommentUpdate.edit).to.exist;
        expect(authorPost._rawCommentUpdate.edit.reason).to.equal("An author unspoilering their own comment");
        expect(authorPost._rawCommentUpdate.edit.spoiler).to.be.false;

        expect(authorPost.edit.reason).to.equal("An author unspoilering their own comment");
        expect(authorPost.reason).to.be.undefined;

        expect(authorPost.spoiler).to.be.false;
    });
});

describe(`Mods marking an author comment as spoiler`, async () => {
    let plebbit, randomPost;

    before(async () => {
        plebbit = await mockRemotePlebbit();
        randomPost = await publishRandomPost(subplebbitAddress, plebbit, {}, false);
        randomPost.update();
    });

    after(async () => {
        await randomPost.stop();
    });

    it(`Mod can mark an author comment as spoiler`, async () => {
        const modSpoilerEdit = await plebbit.createCommentEdit({
            subplebbitAddress: randomPost.subplebbitAddress,
            commentCid: randomPost.cid,
            spoiler: true,
            signer: roles[2].signer,
            reason: "Mod marking an author comment as spoiler"
        });
        await publishWithExpectedResult(modSpoilerEdit, true);
    });

    it(`A new CommentUpdate is published with spoiler=true`, async () => {
        await resolveWhenConditionIsTrue(randomPost, () => randomPost.spoiler === true);
        expect(randomPost._rawCommentUpdate.reason).to.equal("Mod marking an author comment as spoiler");
        expect(randomPost._rawCommentUpdate.spoiler).to.be.true;
        expect(randomPost._rawCommentUpdate.edit).to.be.undefined;

        expect(randomPost.reason).to.equal("Mod marking an author comment as spoiler");
        expect(randomPost.spoiler).to.be.true;
    });

    it(`Mod can mark unspoiler author comment `, async () => {
        const unspoilerEdit = await plebbit.createCommentEdit({
            subplebbitAddress: randomPost.subplebbitAddress,
            commentCid: randomPost.cid,
            spoiler: false,
            signer: roles[2].signer,
            reason: "Mod unspoilering an author comment"
        });
        await publishWithExpectedResult(unspoilerEdit, true);
    });

    it(`A new CommentUpdate is published with spoiler=false`, async () => {
        await resolveWhenConditionIsTrue(randomPost, () => randomPost.spoiler === false);
        expect(randomPost._rawCommentUpdate.reason).to.equal("Mod unspoilering an author comment");
        expect(randomPost._rawCommentUpdate.spoiler).to.be.false;
        expect(randomPost._rawCommentUpdate.edit).to.be.undefined;

        expect(randomPost.reason).to.equal("Mod unspoilering an author comment");
        expect(randomPost.spoiler).to.be.false;
    });
});

describe(`Mods marking their own comment as spoiler`, async () => {
    let plebbit, modPost;

    before(async () => {
        plebbit = await mockRemotePlebbit();
        modPost = await publishRandomPost(subplebbitAddress, plebbit, { signer: roles[2].signer }, false);
        modPost.update();
    });

    after(async () => {
        await modPost.stop();
    });

    it(`Mod can mark their own comment as spoiler`, async () => {
        const spoilerEdit = await plebbit.createCommentEdit({
            subplebbitAddress: modPost.subplebbitAddress,
            commentCid: modPost.cid,
            spoiler: true,
            signer: roles[2].signer,
            reason: "Mod marking their own comment as spoiler"
        });
        await publishWithExpectedResult(spoilerEdit, true);
    });

    it(`A new CommentUpdate is published with spoiler=true`, async () => {
        await resolveWhenConditionIsTrue(modPost, () => modPost.spoiler === true);
        expect(modPost.edit.spoiler).to.be.true;
        expect(modPost._rawCommentUpdate.reason).to.be.undefined;
        expect(modPost._rawCommentUpdate.spoiler).to.be.undefined;
        expect(modPost._rawCommentUpdate.edit).to.exist;
        expect(modPost._rawCommentUpdate.edit.reason).to.equal("Mod marking their own comment as spoiler");
        expect(modPost._rawCommentUpdate.edit.spoiler).to.be.true;

        expect(modPost.reason).to.be.undefined; // reason is defined only when it's a mod editing other authors' posts
        expect(modPost.edit.reason).to.equal("Mod marking their own comment as spoiler");
        expect(modPost.spoiler).to.be.true;
    });

    it(`Mod can unspoiler their own comment`, async () => {
        const unspoilerEdit = await plebbit.createCommentEdit({
            subplebbitAddress: modPost.subplebbitAddress,
            commentCid: modPost.cid,
            spoiler: false,
            signer: roles[2].signer,
            reason: "Mod unspoilering their own comment"
        });
        await publishWithExpectedResult(unspoilerEdit, true);
    });

    it(`A new CommentUpdate is published with spoiler=false`, async () => {
        await resolveWhenConditionIsTrue(modPost, () => modPost.spoiler === false);
        expect(modPost.edit.spoiler).to.be.false;
        expect(modPost._rawCommentUpdate.reason).to.be.undefined;
        expect(modPost._rawCommentUpdate.spoiler).to.be.undefined;
        expect(modPost._rawCommentUpdate.edit).to.exist;
        expect(modPost._rawCommentUpdate.edit.reason).to.equal("Mod unspoilering their own comment");
        expect(modPost._rawCommentUpdate.edit.spoiler).to.be.false;

        expect(modPost.reason).to.be.undefined;
        expect(modPost.edit.reason).to.equal("Mod unspoilering their own comment");
        expect(modPost.spoiler).to.be.false;
    });
});
