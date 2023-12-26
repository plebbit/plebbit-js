const Plebbit = require("../../../dist/node");
const signers = require("../../fixtures/signers");
const { mockPlebbit, publishRandomPost, publishWithExpectedResult } = require("../../../dist/node/test/test-util");
const { expect } = require("chai");
const { messages } = require("../../../dist/node/errors");
const { default: waitUntil } = require("async-wait-until");
const { verifyComment, verifyCommentUpdate } = require("../../../dist/node/signer/signatures");

const subplebbitAddress = signers[0].address;
const roles = [
    { role: "owner", signer: signers[1] },
    { role: "admin", signer: signers[2] },
    { role: "mod", signer: signers[3] }
];
describe(`Authors can mark their own comment as spoiler`, async () => {
    let plebbit, authorPost;
    before(async () => {
        plebbit = await mockPlebbit();
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
            signer: authorPost.signer
        });
        await publishWithExpectedResult(spoilerEdit, true);
    });
    it(`A new CommentUpdate is published with spoiler=true`, async () => {
        await waitUntil(() => authorPost.spoiler, { timeout: 100000 });
        expect(authorPost.edit.spoiler).to.be.true;
        expect(authorPost._rawCommentUpdate.edit).to.exist;
        expect(authorPost._rawCommentUpdate.edit.spoiler).to.be.true;

        expect(authorPost.spoiler).to.be.true;
    });

    it(`The new Comment with spoiler=true has valid signature`, async () => {
        const recreatedPost = await plebbit.createComment({ cid: authorPost.cid });
        recreatedPost.update();
        await new Promise((resolve) => recreatedPost.once("update", resolve));
        await new Promise((resolve) => recreatedPost.once("update", resolve));

        await recreatedPost.stop();
        expect(recreatedPost.spoiler).to.be.true;

        const commentIpfsValidity = await verifyComment(recreatedPost._rawCommentIpfs, true, recreatedPost._clientsManager, false);
        expect(commentIpfsValidity).to.deep.equal({ valid: true });

        const commentUpdateValidity = await verifyCommentUpdate(
            recreatedPost._rawCommentUpdate,
            true,
            recreatedPost._clientsManager,
            recreatedPost.subplebbitAddress,
            recreatedPost,
            false
        );
        expect(commentUpdateValidity).to.deep.equal({ valid: true });
    });

    it(`Author can unspoiler their own comment`, async () => {
        const unspoilerEdit = await plebbit.createCommentEdit({
            subplebbitAddress: authorPost.subplebbitAddress,
            commentCid: authorPost.cid,
            spoiler: false,
            signer: authorPost.signer
        });
        await publishWithExpectedResult(unspoilerEdit, true);
    });
    it(`A new CommentUpdate is published with spoiler=false`, async () => {
        await waitUntil(() => !authorPost.spoiler, { timeout: 100000 });
        expect(authorPost.edit.spoiler).to.be.false;
        expect(authorPost.spoiler).to.be.false;
    });
});

describe(`Mods marking an author comment as spoiler`, async () => {
    let plebbit, randomPost;

    before(async () => {
        plebbit = await mockPlebbit();
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
            signer: roles[2].signer
        });
        await publishWithExpectedResult(modSpoilerEdit, true);
    });

    it(`A new CommentUpdate is published with spoiler=true`, async () => {
        await waitUntil(() => randomPost.spoiler === true, { timeout: 100000 });
        expect(randomPost.spoiler).to.be.true;
        expect(randomPost._rawCommentUpdate.spoiler).to.be.true;
    });

    it(`Mod can mark unspoiler author comment `, async () => {
        const unspoilerEdit = await plebbit.createCommentEdit({
            subplebbitAddress: randomPost.subplebbitAddress,
            commentCid: randomPost.cid,
            spoiler: false,
            signer: roles[2].signer
        });
        await publishWithExpectedResult(unspoilerEdit, true);
    });

    it(`A new CommentUpdate is published with spoiler=false`, async () => {
        await waitUntil(() => !randomPost.spoiler, { timeout: 100000 });
        expect(randomPost._rawCommentUpdate.spoiler).to.be.false;
        expect(randomPost.spoiler).to.be.false;
    });
});

describe(`Mods marking their own comment as spoiler`, async () => {
    let plebbit, modPost;

    before(async () => {
        plebbit = await mockPlebbit();
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
            signer: roles[2].signer
        });
        await publishWithExpectedResult(spoilerEdit, true);
    });

    it(`A new CommentUpdate is published with spoiler=true`, async () => {
        await waitUntil(() => modPost.spoiler === true, { timeout: 100000 });
        expect(modPost.spoiler).to.be.true;
        expect(modPost._rawCommentUpdate.spoiler).to.be.true;
    });

    it(`Mod can mark unspoiler their own `, async () => {
        const unspoilerEdit = await plebbit.createCommentEdit({
            subplebbitAddress: modPost.subplebbitAddress,
            commentCid: modPost.cid,
            spoiler: false,
            signer: roles[2].signer
        });
        await publishWithExpectedResult(unspoilerEdit, true);
    });

    it(`A new CommentUpdate is published with spoiler=false`, async () => {
        await waitUntil(() => !modPost.spoiler, { timeout: 100000 });
        expect(modPost._rawCommentUpdate.spoiler).to.be.false;
        expect(modPost.spoiler).to.be.false;
    });
});
