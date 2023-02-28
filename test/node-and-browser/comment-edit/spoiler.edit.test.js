const signers = require("../../fixtures/signers");
const { mockPlebbit, publishRandomPost, publishWithExpectedResult } = require("../../../dist/node/test/test-util");
const { expect } = require("chai");
const { messages } = require("../../../dist/node/errors");
const { default: waitUntil } = require("async-wait-until");

const subplebbitAddress = signers[0].address;
const roles = [
    { role: "owner", signer: signers[1] },
    { role: "admin", signer: signers[2] },
    { role: "mod", signer: signers[3] }
];
describe(`Marking comment as spoiler`, async () => {
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
        expect(authorPost.spoiler).to.be.true;
    });
    it(`Author can unspoiler their comment`, async () => {
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
    it(`Mod can mark an author comment as spoiler`, async () => {
        const randomPost = await publishRandomPost(subplebbitAddress, plebbit, {}, false);
        const spoilerEdit = await plebbit.createCommentEdit({
            subplebbitAddress: randomPost.subplebbitAddress,
            commentCid: randomPost.cid,
            spoiler: true,
            signer: roles[2].signer
        });
        await publishWithExpectedResult(spoilerEdit, true);
    });

    it(`Mod can mark their own comment as spoiler`, async () => {
        const modPost = await publishRandomPost(subplebbitAddress, plebbit, { signer: roles[2].signer }, false);
        const spoilerEdit = await plebbit.createCommentEdit({
            subplebbitAddress: modPost.subplebbitAddress,
            commentCid: modPost.cid,
            spoiler: true,
            signer: roles[2].signer
        });
        await publishWithExpectedResult(spoilerEdit, true);
    });

    it(`A comment that was published with spoiler=true can be edited to spoiler=false`, async () => {
        const spoilerPost = await publishRandomPost(subplebbitAddress, plebbit, { spoiler: true }, false);
        expect(spoilerPost.spoiler).to.be.true;
        expect(spoilerPost.edit?.spoiler).to.be.undefined;
        await spoilerPost.update();

        const spoilerEdit = await plebbit.createCommentEdit({
            subplebbitAddress: spoilerPost.subplebbitAddress,
            commentCid: spoilerPost.cid,
            spoiler: false,
            signer: spoilerPost.signer
        });
        await publishWithExpectedResult(spoilerEdit, true);
        await waitUntil(() => spoilerPost.spoiler === false, { timeout: 200000 });
        spoilerPost.stop();
        expect(spoilerPost.spoiler).to.be.false;
        expect(spoilerPost.edit.spoiler).to.be.false;
    });
});
